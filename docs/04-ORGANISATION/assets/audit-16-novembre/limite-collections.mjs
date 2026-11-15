// Exécuter depuis application/. Aucun accès à PostgreSQL : reproduction isolée dans le moteur commun.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const {createWorkspaceRepository}=await import(pathToFileURL(resolve('backend/persistance/engine.ts')).href);
const {etatDemonstration}=await import(pathToFileURL(resolve('outils/donnees-demonstration/charger.ts')).href);
for(const count of [20000,20001]){
 const s=etatDemonstration();const a=s.comptes.find(c=>c.id==='cpt-num-admin');const p=s.postes.find(p=>s.salles.some(r=>r.id===p.salleId&&r.ecoleId===a.ecoleId));
 s.processus=Array.from({length:count},(_,i)=>({id:`audit-exec-${i}`,posteId:p.id,salleId:p.salleId,ecoleId:a.ecoleId,nom:`audit-${i}.exe`,compte:'audit',startedAt:Date.now(),stoppedAt:null}));
 const repo=await createWorkspaceRepository({initialState:s});const actor=await repo.actor(a.id);
 for(const full of [false,true]){
  const view=await repo.read(actor);const input=full?view:{role:actor.role,prefs:{ambiance:'minarm'}};
  try {await repo.update(input,view.revision,actor);assert.equal(count,20000);console.log(`PASS ${count} processus : écriture ${full?'complète':'préférences seules'} acceptée`);}
  catch(e){if(count===20000)throw e;assert.equal(e.status,400);assert.equal(e.message,'Données invalides.');console.log(`CONFIRMED ${count} processus : écriture ${full?'complète':'préférences seules'} refusée400 Données invalides. sans modifier aucun processus`);}
 }
}
