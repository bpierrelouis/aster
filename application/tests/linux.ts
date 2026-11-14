/* Rejoue une suite Playwright sous Linux, avec les polices du runner GitHub : npm run test:linux [-- test:ui].
   Fonctionne sous Windows, macOS et Linux ; prérequis : Docker démarré. Les dépendances Linux restent dans un
   volume Docker, séparées du node_modules du poste. Le proxy éventuel du poste est transmis au conteneur. */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const application = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const suite = process.argv[2] ?? 'test:workspace';
const proxy = process.env.HTTPS_PROXY ?? process.env.https_proxy ?? process.env.HTTP_PROXY ?? process.env.http_proxy ?? '';

function docker(args: string[]) {
  const { status, error } = spawnSync('docker', args, { stdio: 'inherit', cwd: application });
  if (error) throw new Error(`Docker introuvable : ${error.message}`);
  if (status !== 0) process.exit(status ?? 1);
}

docker(['build', '-q', '-t', 'aster-tests-linux', '--build-arg', `http_proxy=${proxy}`, '--build-arg', `https_proxy=${proxy}`,
  '-f', 'tests/linux.Dockerfile', 'tests']);
docker(['run', '--rm', '--ipc=host', '-e', 'CI=1', '-e', 'NO_PROXY=localhost,127.0.0.1',
  '-e', `http_proxy=${proxy}`, '-e', `https_proxy=${proxy}`,
  '-v', `${resolve(application, '..')}:/repo`, '-v', 'aster-tests-linux-node-modules:/repo/application/node_modules',
  '-w', '/repo/application', 'aster-tests-linux',
  'bash', '-c', `npm ci --no-audit --no-fund --loglevel=error && npm run ${suite} -- --output /tmp/resultats`]);
