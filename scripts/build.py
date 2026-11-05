#!/usr/bin/env python3
"""Create a Chrome/Edge store ZIP with only the extension runtime files.

Usage: python scripts/build.py
No third-party dependencies required.
"""
from __future__ import annotations

import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parent.parent
RUNTIME_FILES = (
    'manifest.json',
    'content.js',
    'content.css',
    'popup.html',
    'popup.css',
    'popup.js',
    'icons/icon16.png',
    'icons/icon48.png',
    'icons/icon128.png',
)


def main() -> None:
    manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
    version = manifest['version']
    destination = ROOT / 'dist' / f'foco-wa-{version}.zip'
    destination.parent.mkdir(parents=True, exist_ok=True)

    with ZipFile(destination, 'w', compression=ZIP_DEFLATED, compresslevel=9) as output:
        for name in RUNTIME_FILES:
            path = ROOT / name
            if not path.is_file():
                raise FileNotFoundError(f'Arquivo necessário não encontrado: {name}')
            output.write(path, arcname=name)

    print(f'Pacote criado: {destination}')
    print(f'Arquivos: {len(RUNTIME_FILES)} (manifest.json na raiz do ZIP)')


if __name__ == '__main__':
    main()
