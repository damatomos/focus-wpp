#!/usr/bin/env python3
"""Small static validation of Manifest V3 and runtime assets.

Usage:
    python scripts/validate.py
    python scripts/validate.py --zip
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parent.parent
REQUIRED = {
    'manifest.json', 'content.js', 'content.css', 'popup.html',
    'popup.css', 'popup.js', 'icons/icon16.png', 'icons/icon48.png',
    'icons/icon128.png',
}


def validate() -> tuple[str, str]:
    manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
    assert manifest['manifest_version'] == 3, 'Manifest V3 obrigatório'
    version = manifest['version']
    assert re.fullmatch(r'\d+\.\d+\.\d+', version), 'Versão inválida'
    assert manifest['content_scripts'][0]['matches'] == ['https://web.whatsapp.com/*'], 'Site não esperado'
    assert set(manifest['permissions']) == {'storage', 'scripting', 'activeTab'}, 'Permissões alteradas; revise privacidade'
    assert manifest['host_permissions'] == ['https://web.whatsapp.com/*'], 'Host não esperado'
    assert set(manifest['content_scripts'][0]['js']) == {'content.js'}, 'Script diferente'
    assert set(manifest['content_scripts'][0]['css']) == {'content.css'}, 'CSS diferente'
    assert manifest['action']['default_popup'] == 'popup.html', 'Popup não encontrado'
    for name in REQUIRED:
        assert (ROOT / name).is_file(), f'Arquivo ausente: {name}'
    print(f'OK: Manifest V3, permissões, site alvo, arquivos e versão {version}')
    return version, manifest['name']


def validate_zip(version: str) -> None:
    path = ROOT / 'dist' / f'foco-wa-{version}.zip'
    assert path.is_file(), f'ZIP não encontrado: {path} (rode build.py primeiro)'
    with ZipFile(path) as archive:
        contents = set(archive.namelist())
        assert contents == REQUIRED, f'Arquivos inesperados/ausentes no ZIP: {contents ^ REQUIRED}'
        inside = json.loads(archive.read('manifest.json'))
        assert inside['version'] == version, 'Versão do ZIP não corresponde ao fonte'
    print(f'OK: ZIP da loja com {len(REQUIRED)} arquivos, sem documentação ou segredos')


if __name__ == '__main__':
    ver, _ = validate()
    if '--zip' in sys.argv:
        validate_zip(ver)
