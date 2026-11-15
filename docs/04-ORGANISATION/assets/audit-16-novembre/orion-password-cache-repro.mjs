// Exécuter depuis application/ ; aucun fichier du dépôt n'est modifié.
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const appRoot=process.cwd();
const require=createRequire(resolve(appRoot,'package.json'));
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const script=readFileSync(resolve(appRoot,'infra/keycloak/themes/orion-mindef/login/resources/js/login.js'),'utf8');
const storage=new Map();let now=1000000;let submit;
const elements={'login-form':{addEventListener(name,fn){if(name==='submit')submit=fn;}},username:{value:'audit@example.test'},password:{value:'SENTINELLE_NON_SECRETE'},'login-button':{disabled:false}};
const context={document:{getElementById:id=>elements[id]??null,querySelectorAll:()=>[],querySelector:()=>null},sessionStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},Date:{now:()=>now},location:{replace(){}}};
vm.runInNewContext(script,context);submit();now+=120000;
// Retour sur la page adresse après deux minutes, sans charger la page mot de passe.
vm.runInNewContext(script,{...context});
console.log(JSON.stringify({tempsEcouleSecondes:120,motDePasseEncoreStocke:storage.has('orion.mot-de-passe')},null,2));
