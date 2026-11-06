"""Installer ou lancer Graphify hors du dépôt, sur Windows, Linux et macOS."""
import os
from pathlib import Path
import subprocess
import sys
import venv


def environment_path():
    if sys.platform == 'win32':
        base = Path(os.environ.get('LOCALAPPDATA', Path.home() / 'AppData' / 'Local'))
    elif sys.platform == 'darwin':
        base = Path.home() / 'Library' / 'Application Support'
    else:
        base = Path(os.environ.get('XDG_DATA_HOME', Path.home() / '.local' / 'share'))
    return base / 'graphify' / 'venv'


def main():
    if sys.version_info < (3, 10):
        raise SystemExit('Python 3.10 ou supérieur est nécessaire.')
    root = environment_path()
    binaries = root / ('Scripts' if sys.platform == 'win32' else 'bin')
    python = binaries / ('python.exe' if sys.platform == 'win32' else 'python')
    command = binaries / ('graphify.exe' if sys.platform == 'win32' else 'graphify')
    args = sys.argv[1:]
    if args == ['--install']:
        venv.EnvBuilder(with_pip=True).create(root)
        subprocess.run([str(python), '-m', 'pip', 'install', 'graphifyy==0.9.103'], check=True)
        return subprocess.call([str(command), '--version'])
    if not command.is_file():
        raise SystemExit('Graphify absent : relancer ce script avec --install.')
    return subprocess.call([str(command), *args])


if __name__ == '__main__':
    sys.exit(main())
