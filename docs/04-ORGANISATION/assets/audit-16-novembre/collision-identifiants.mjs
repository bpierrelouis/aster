// Exécuter depuis application/ : node <chemin-vers-ce-fichier>
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const require=createRequire(resolve('package.json'));
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {syncBuiltinESMExports} from 'node:module';
const pg=require('pg');
const {createPostgresWorkspaceRepository}=await import(pathToFileURL(resolve('backend/persistance/postgres.ts')).href);
const {etatDemonstration}=await import(pathToFileURL(resolve('outils/donnees-demonstration/charger.ts')).href);
const {readConfig}=await import(pathToFileURL(resolve('backend/config.ts')).href);
const pool=new pg.Pool({connectionString:readConfig().databaseUrl});const schema='orion_audit_collision_'+process.pid;
const original=crypto.randomUUID;
try {
 const repo=await createPostgresWorkspaceRepository({pool,schema});await repo.remplacer(()=>etatDemonstration());
 const st=await repo.snapshot();const ps=st.postes.filter(p=>st.materiels.find(m=>m.id===p.materielId&&!m.hs)).slice(0,2);
 // Injection de deux UUID distincts ayant le même préfixe de32bits : aucune écriture hors schéma temporaire.
 let n=0;crypto.randomUUID=()=>`aaaaaaaa-0000-4000-8000-${String(++n).padStart(12,'0')}`;syncBuiltinESMExports();
 await repo.agent.rapports([{poste:ps[0].nomReseau,processus:[{nom:'audit-un.exe',compte:'audit'}]}]);
 await repo.agent.rapports([{poste:ps[1].nomReseau,processus:[{nom:'audit-deux.exe',compte:'audit'}]}]);
 const cached=await repo.snapshot();const loaded=await (await createPostgresWorkspaceRepository({pool,schema})).snapshot();
 assert.equal(cached.processus.length,2);assert.equal(loaded.processus.length,1);assert.equal(loaded.processus[0].nom,'audit-deux.exe');
 assert.equal(cached.detections.length,2);assert.equal(loaded.detections.length,1);
 console.log('CONFIRMED collision32bits (UUID distincts injectés) : cache2 processus/2 détections ; réouverture PostgreSQL1 processus/1 détection : premier événement écrasé');
} finally {
 crypto.randomUUID=original;syncBuiltinESMExports();await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);await pool.end();console.log('PASS nettoyage schéma temporaire collision');
}
