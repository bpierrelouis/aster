// Exécuter depuis application/ : node <chemin-vers-ce-fichier>
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const require=createRequire(resolve('package.json'));
import assert from 'node:assert/strict';
const pg=require('pg');
import {readFileSync} from 'node:fs';
const {createPostgresWorkspaceRepository}=await import(pathToFileURL(resolve('backend/persistance/postgres.ts')).href);
const {createPostgresStore}=await import(pathToFileURL(resolve('backend/rigel/relais-store.ts')).href);
const {migrer}=await import(pathToFileURL(resolve('backend/persistance/migrations.ts')).href);
const {readConfig}=await import(pathToFileURL(resolve('backend/config.ts')).href);
const pool=new pg.Pool({connectionString:readConfig().databaseUrl,connectionTimeoutMillis:1500});
const prefix='orion_audit_code_'+process.pid;
const schemas=['fresh','upgrade','relay'].map(x=>prefix+'_'+x);
const [fresh,old,relay]=schemas;
try {
 const repo=await createPostgresWorkspaceRepository({pool,schema:fresh});
 const state=await repo.snapshot();
 assert.equal(state.ecoles.length,0); assert.equal(state.comptes.length,0);
 assert.ok(state.applications.length>0&&state.regles.length>0);
 assert.deepEqual((await pool.query(`select version from ${fresh}.migration order by version`)).rows,[{version:1},{version:2}]);
 console.log('PASS migration0002 base neuve : versions1,2 ; référentiels seuls');
 const db=await pool.connect();
 try {
  await db.query(`CREATE SCHEMA ${old}; SET search_path TO ${old}`);
  await db.query(readFileSync(resolve('backend/persistance/migrations/0001-schema-initial.sql'),'utf8'));
  await db.query(`CREATE TABLE orion_migration(version integer PRIMARY KEY, nom text NOT NULL, appliquee_le timestamptz NOT NULL DEFAULT now()); INSERT INTO orion_migration(version,nom) VALUES(1,'schema-initial');
   INSERT INTO orion_espace VALUES(1,15,7,now()); INSERT INTO orion_ecole(id,nom) VALUES('e1','École audit');
   INSERT INTO orion_salle(id,ecole_id,batiment,nom,etage) VALUES('s1','e1','A','A101',0);
   INSERT INTO orion_etage(id,ecole_id,batiment,niveau) VALUES('et1','e1','A',0);
   INSERT INTO orion_compte(id,nom,email,role,ecole_id,actif,sujet) VALUES('c1','Audit','audit@example.org','admin','e1',true,'sub-audit');
   INSERT INTO orion_preference(compte_id,affichage,dispositions) VALUES('c1','{"ambiance":"minarm"}','[]');
   INSERT INTO orion_materiel(id,ecole_id,id_orion,salle_id,type,modele,date_reception,hors_service,mac,date_hors_service,extra) VALUES('m1','e1','MAT-0001','s1','uc','Audit',now(),true,'AABBCCDDEEFF',now(),'{"installation":{"de":null,"at":1}}');
   INSERT INTO orion_remontee(id,ecole_id,auteur,created_at,probleme,description,statut,historique,auteur_id) VALUES('REM-0101','e1','Audit',now(),'display','Écran','attente','[{"statut":"attente","at":1}]','c1');
   INSERT INTO orion_remontee_materiel VALUES('REM-0101',0,'m1');
   INSERT INTO orion_donnee(collection,id,ecole_id,data) VALUES ('operations','op1','e1','{"id":"op1","type":"installation","historique":[1]}'),('recensements','rec1','e1','{"id":"rec1","nom":"Recensement audit","statut":"en-cours"}'),('constats','ct1','e1','{"id":"ct1","recensementId":"rec1","resultat":"present"}');
   INSERT INTO orion_journal VALUES(7,'[["operations","op1",{"id":"op1","type":"installation"}],["recensements","rec1",null],["constats","ct1",{"id":"ct1","recensementId":"rec1"}]]');`);
  const tables=['espace','ecole','salle','etage','compte','preference','materiel','remontee','remontee_materiel'];
  const before={};for(const t of tables)before[t]=(await db.query(`SELECT * FROM ${old}.orion_${t}`)).rows;
  const generics=(await db.query(`SELECT * FROM ${old}.orion_donnee ORDER BY rang`)).rows;
  await db.query('SET search_path TO public');
  assert.deepEqual(await migrer(db,old),[2]);
  for(const t of tables)assert.deepEqual((await db.query(`SELECT * FROM ${old}.${t}`)).rows,before[t],t+' conservation');
  const after=(await db.query(`SELECT * FROM ${old}.donnee ORDER BY rang`)).rows;
  assert.deepEqual(after,generics.map(r=>({...r,collection:r.collection==='operations'?'interventions':r.collection==='recensements'?'operations':r.collection,data:r.collection==='constats'?{id:'ct1',operationId:'rec1',resultat:'present'}:r.data})));
  assert.deepEqual((await db.query(`SELECT cles FROM ${old}.journal WHERE revision=7`)).rows[0].cles,[['interventions','op1',{id:'op1',type:'installation'}],['operations','rec1',null],['constats','ct1',{id:'ct1',operationId:'rec1'}]]);
  assert.deepEqual(await migrer(db,old),[]);
  assert.equal((await db.query(`SELECT count(*)::int AS n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=$1 AND c.relname LIKE 'orion\\_%'`,[old])).rows[0].n,0);
  console.log('PASS migration0002 base0001 peuplée : 9 tables inchangées, 3 données JSON, journal et suivi conservés ; renommages vérifiés ; idempotence');
 } finally {db.release();}
 const reopened=await createPostgresWorkspaceRepository({pool,schema:old});
 const upgraded=await reopened.snapshot();assert.equal(upgraded.interventions[0].id,'op1');assert.equal(upgraded.operations[0].id,'rec1');assert.equal(upgraded.constats[0].operationId,'rec1');
 console.log('PASS réouverture dépôt métier après reprise0001');
 await pool.query(`CREATE SCHEMA ${relay};CREATE TABLE ${relay}.rigel_campagne(id text PRIMARY KEY,empreinte text NOT NULL,version text NOT NULL,expire_le timestamptz NOT NULL,instantane jsonb NOT NULL);CREATE TABLE ${relay}.rigel_evenement(rang bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,campagne_id text NOT NULL REFERENCES ${relay}.rigel_campagne(id) ON DELETE CASCADE,id text NOT NULL,bloc jsonb NOT NULL,recu_le timestamptz NOT NULL DEFAULT now(), UNIQUE(campagne_id,id));INSERT INTO ${relay}.rigel_campagne VALUES('rec1','empreinte','v1','2030-01-01','{"iv":"audit","data":"chiffre"}');INSERT INTO ${relay}.rigel_evenement(campagne_id,id,bloc) VALUES('rec1','ev1','{"iv":"ev","data":"bloc"}')`);
 const rs=await createPostgresStore({pool,schema:relay});assert.equal((await rs.operation('rec1')).version,'v1');assert.equal((await rs.evenements('rec1',10))[0].id,'ev1');assert.equal(await rs.enAttente('rec1'),1);
 await rs.ajouter('rec1',[{id:'ev1',bloc:{iv:'x',data:'y'}},{id:'ev2',bloc:{iv:'x',data:'y'}}]);assert.equal(await rs.enAttente('rec1'),2);
 const ev=await rs.evenements('rec1',10);await rs.acquitter('rec1',ev[0].rang);assert.equal(await rs.enAttente('rec1'),1);
 await createPostgresStore({pool,schema:relay});console.log('PASS reprise relais RIGEL : opération et événement chiffrés conservés, clé étrangère, dédoublonnage et acquittement ; idempotence');
} finally {
 for(const s of schemas)await pool.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
 assert.equal((await pool.query('SELECT count(*)::int AS n FROM pg_namespace WHERE nspname = ANY($1::text[])',[schemas])).rows[0].n,0);
 console.log('PASS nettoyage : 3 schémas temporaires supprimés');await pool.end();
}
