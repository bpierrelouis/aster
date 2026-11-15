// Exécuter depuis application/ ; aucun fichier du dépôt n'est modifié.
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const appRoot=process.cwd();
const require=createRequire(resolve(appRoot,'package.json'));
const pg = require('pg');
const {createRelais} = await import(pathToFileURL(resolve(appRoot,'backend/rigel/relais.ts')));
const {createPostgresStore} = await import(pathToFileURL(resolve(appRoot,'backend/rigel/relais-store.ts')));
const {empreinte} = await import(pathToFileURL(resolve(appRoot,'shared/rigel.ts')));
const pool=new pg.Pool({connectionString:process.env.RELAIS_TEST_DATABASE_URL || 'postgres://orion:orion-local@localhost:5432/orion',max:10,connectionTimeoutMillis:1500});
const schema=`rigel_audit_quota_${process.pid}`;
let server;
try{
 const store=await createPostgresStore({pool,schema});
 await store.deposer({id:'audit-quota',empreinte:await empreinte('telephone-audit'),version:'v1',expireLe:Date.now()+60000,instantane:{iv:'iv',data:'data'}});
 // Une requête compteur PostgreSQL renvoie un résultat, puis l'insertion utilise une autre requête :
 // la barrière expose de façon déterministe l'entrelacement permis en exploitation (deux lectures avant deux écritures).
 const original=store.enAttente.bind(store);
 if(process.env.BURST!=='1'){
  let lus=0;let liberer;const barriere=new Promise(r=>liberer=r);
  store.enAttente=async(id)=>{const n=await original(id);if(++lus===2)liberer();await barriere;return n;};
 }
 server=createRelais({store,token:'connecteur-audit',dist:'absent',maxEnAttente:3}).listen(0,'127.0.0.1');
 await new Promise(r=>server.once('listening',r));
 const url=`http://127.0.0.1:${server.address().port}/api/operations/audit-quota/evenements`;
 const envoyer=(prefix)=>fetch(url,{method:'POST',headers:{Authorization:'Bearer telephone-audit','Content-Type':'application/json'},body:JSON.stringify({evenements:[1,2].map(i=>({id:`audit-${prefix}-${i}`,bloc:{iv:'iv',data:'data'}}))})});
 const responses=await Promise.all(process.env.BURST==='1'?Array.from({length:20},(_,i)=>envoyer(`lot-${i}`)):[envoyer('premier'),envoyer('second')]);
 console.log(JSON.stringify({statuses:responses.map(r=>r.status),plafond:3,stockes:await original('audit-quota'),schema},null,2));
}finally{server?.close();await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);await pool.end();console.log('Schéma de test supprimé');}
