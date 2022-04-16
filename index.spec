# -*- mode: python ; coding: utf-8 -*-

block_cipher = None


a = Analysis(['index.py'],
             pathex=['F:\\neo_project\\前端代码片段管理工具'],
             binaries=[],
             datas=[('E:\\Program Files\\Python36\\lib\\site-packages\\eel\\eel.js', 'eel'), ('neo_web', 'neo_web')],
             hiddenimports=['bottle_websocket'],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          [],
          exclude_binaries=True,
          name='index',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          console=False )
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               upx_exclude=[],
               name='index')
