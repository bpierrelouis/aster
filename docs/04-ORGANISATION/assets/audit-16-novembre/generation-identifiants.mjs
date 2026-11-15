// Exécuter depuis application/. Contrôle statistique : le nombre de collisions varie.
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const {id}=await import(pathToFileURL(resolve('backend/domaine/commun.ts')).href);
const seen=new Set();let doubles=0;const exemples=[];
for(let i=0;i<200000;i++){const v=id('audit');if(seen.has(v)){doubles++;if(exemples.length<5)exemples.push(v);}seen.add(v);}
console.log(JSON.stringify({generes:200000,uniques:seen.size,collisions:doubles,exemples}));
