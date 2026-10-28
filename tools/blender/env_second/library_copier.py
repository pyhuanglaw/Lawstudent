"""總圖一樓的影印機（NPC-STORY-1028，LAWWW2-C 2026-10-28；AA_497 芯慈 2-2：以安和芯慈站在影印機前 (7.6, 2.6) 朝 +x）→ GLB。
  /opt/blenv/bin/python tools/blender/env_second/library_copier.py [-- --out assets/models/env/second_ai/library_copier.glb]
- 辦公室的大台多功能影印機：米白機身、上面自動送紙器、正面右上角觸控面板、四個紙匣、側邊出紙盤；旁邊一台投幣／刷卡的小盒子（圖書館的影印機）。
- 沒有牌子、型號（D77）；面板、投幣盒的字不寫（遊戲裡看不到）。
- 原點＝機身底部中心、地面；正面（面板、紙匣）朝 −z。遊戲裡 ry＝π/2 時正面朝 −x（西）：人站在西邊朝 +x 用。
- 尺寸（含側邊出紙盤、投幣盒）寬 0.92（x）× 深 0.66（z）× 高 1.18；導航擋 library_layout.js 的 copier（w×d）。
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, CMesh   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/library_copier.glb')

B.reset(texres=256)
root = B.group('library_copier', props={'kind': 'copier'})
cm = CMesh('copier_vc', L.vc_material('copier_vc', rough=0.45))
BODY, BODY2, DARK, TRAY, GLASS = '#e8e5dc', '#d9d5ca', '#3b3e44', '#cfcbc0', '#5d7487'
W, D = 0.6, 0.62                          # 機身寬（x）、深（z）
x0, x1, z0, z1 = -W / 2, W / 2, -D / 2, D / 2
# 底座＋四個紙匣（正面 −z 有把手的凹槽）
cm.crbox(x0, x1, 0.0, 0.08, z0 + 0.02, z1 - 0.02, DARK, r=0.01)                                    # 底座（輪子那一層）
for k in range(4):
    y0 = 0.08 + k * 0.125
    cm.crbox(x0, x1, y0 + 0.003, y0 + 0.122, z0, z1, BODY if k % 2 == 0 else BODY2, r=0.008)
    cm.cbox(-0.1, 0.1, y0 + 0.08, y0 + 0.1, z0 - 0.004, z0 + 0.001, '#a9a59a')                        # 紙匣的把手凹槽
    cm.cbox(x1 - 0.06, x1 - 0.03, y0 + 0.03, y0 + 0.09, z0 - 0.003, z0 + 0.001, '#7d8a96')            # 紙量的小窗
# 主機（掃描、列印的那一段）
cm.crbox(x0, x1, 0.58, 0.95, z0, z1, BODY, r=0.015)
cm.cbox(x0 + 0.02, x1 - 0.02, 0.72, 0.74, z0 - 0.003, z0 + 0.001, '#bdb8ac')                           # 正面的分模線
cm.cbox(x0 - 0.003, x0 + 0.001, 0.62, 0.9, z0 + 0.06, z1 - 0.06, BODY2)                              # 左側門
# 出紙的凹口（主機中間偏下，看得到一疊印好的紙）
cm.cbox(x0 + 0.06, x1 - 0.12, 0.6, 0.66, z0 - 0.002, z0 + 0.18, '#2c2f34')
cm.cbox(x0 + 0.1, x1 - 0.18, 0.605, 0.625, z0 + 0.02, z0 + 0.2, '#f6f5f1')
# 上面：原稿玻璃＋自動送紙器（ADF）
cm.crbox(x0 + 0.01, x1 - 0.01, 0.95, 0.97, z0 + 0.01, z1 - 0.01, DARK, r=0.004)
cm.cbox(x0 + 0.04, x1 - 0.04, 0.97, 0.972, z0 + 0.06, z1 - 0.04, GLASS)
cm.crbox(x0 + 0.02, x1 - 0.02, 0.972, 1.06, z0 + 0.04, z1 - 0.02, BODY, r=0.012)                       # 送紙器的蓋子
cm.crbox(x0 + 0.08, x1 - 0.06, 1.06, 1.08, z0 + 0.1, z1 - 0.06, BODY2, r=0.006)                         # 送紙器的進紙盤
cm.cbox(x0 + 0.1, x1 - 0.1, 1.08, 1.088, z0 + 0.12, z1 - 0.1, '#f6f5f1')                                # 一疊原稿
# 正面右上角的觸控面板（斜的、朝前上方）
px0, px1 = x1 - 0.26, x1 + 0.02
cm.crbox(px0, px1, 0.9, 0.95, z0 - 0.16, z0 + 0.02, BODY2, r=0.01)                                      # 面板的托架
cm.poly([(px0 + 0.02, 0.952, z0 - 0.14), (px1 - 0.02, 0.952, z0 - 0.14), (px1 - 0.02, 0.985, z0 - 0.03), (px0 + 0.02, 0.985, z0 - 0.03)][::-1], DARK)
cm.poly([(px0 + 0.035, 0.955, z0 - 0.13), (px1 - 0.08, 0.955, z0 - 0.13), (px1 - 0.08, 0.982, z0 - 0.045), (px0 + 0.035, 0.982, z0 - 0.045)][::-1], '#8fb7d4')   # 亮的螢幕
for k in range(3): cm.cbox(px1 - 0.065, px1 - 0.035, 0.956 + k * 0.01, 0.962 + k * 0.01, z0 - 0.12 + k * 0.03, z0 - 0.1 + k * 0.03, '#2fa36b' if k == 0 else '#c9cdd2')
# 右側的出紙盤（斜的）＋一張紙
cm.crbox(x1, x1 + 0.2, 0.62, 0.64, z0 + 0.08, z1 - 0.12, BODY2, r=0.006)
cm.cbox(x1 + 0.02, x1 + 0.18, 0.64, 0.645, z0 + 0.12, z1 - 0.18, '#f6f5f1')
# 左邊：投幣／刷卡的小盒子（立在一根柱子上）
bx = x0 - 0.17
cm.crbox(bx - 0.03, bx + 0.03, 0.0, 0.95, -0.03, 0.03, '#8d939a', r=0.008)                              # 柱子
cm.crbox(bx - 0.1, bx + 0.1, 0.95, 1.18, -0.08, 0.08, '#4b5563', r=0.012)                                # 盒子
cm.cbox(bx - 0.07, bx + 0.07, 1.06, 1.14, -0.0805, -0.079, '#9cc3b0')                                    # 小螢幕
cm.cbox(bx - 0.05, bx + 0.05, 0.99, 1.02, -0.081, -0.079, '#2b2f36')                                     # 刷卡的地方
cm.cbox(bx + 0.04, bx + 0.07, 0.99, 1.05, -0.081, -0.079, '#c9a45c')                                     # 投幣口
cm.finish(root, uv=False)
st = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {'glb': os.path.relpath(OUT, L.ROOT), 'bytes': st['bytes'], 'tris': st.get('tris'),
    'size_m': [0.92, 1.18, 0.66], 'origin': '機身底部中心；正面朝 −z', 'nav': '寬 0.98（x）× 深 0.7（z）', 'note': 'NPC-STORY-1028；沒有牌子、型號（D77）'})
print('copier', st.get('tris'), st['bytes'])
