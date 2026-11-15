// Exécuter depuis application/ ; aucun fichier du dépôt n'est modifié.
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const appRoot=process.cwd();
const require=createRequire(resolve(appRoot,'package.json'));
const express = require('express');
const {createWorkspaceRouter} = await import(pathToFileURL(resolve(appRoot,'backend/api/routes.ts')));
const app=express().use('/api/workspace',createWorkspaceRouter({repository:{},actor:async()=>({id:'audit',role:'admin'}),agentToken:'audit',rigel:{secret:'audit',url:null}}));
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
try{for(const body of ['CONTENU_PRIVE_AUDIT','{"nom":CONTENU_PRIVE_AUDIT}','{"nom":"CONTENU_PRIVE_AUDIT"}secret']){const response=await fetch(`http://127.0.0.1:${server.address().port}/api/workspace`,{method:'PUT',headers:{'Content-Type':'application/json'},body});console.log('HTTP',response.status,await response.text());}}finally{server.close();}
