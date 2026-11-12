"""舊序章人物己（Long；美國交換路線的香港朋友）Blender 人物製作（US-LONG-3D-1110；LAWWW 11-10 15:45 派；LAWWW2 帳號 A）。
外觀照企劃線 AA_80 5-2、AA_145 3-5（2026-10-16 定）：香港的大學法律系三年級、21 歲、約 176 cm、偏瘦；短髮、單眼皮、眉毛濃、
圓框眼鏡、深藍色運動外套、背包上掛一個小小的奶茶杯鑰匙圈；笑的時候只笑一邊（表情，遊戲的 ADV／表情另外）。
還沒有立繪、沒有通過的參考圖：這一版照文字做（D59：角色美術 BB 驗收；之後有參考圖再照圖調）。
做法：路人產生器 npc.py 的生產線（stage0 拿掉樣本衣服頭髮、face 捏臉、clothes＝npc_layered 的敞開外套＋T 恤、hair＝npc_hair_m），
  只換成他自己的參數（N.VAR）；眼鏡、背包、鑰匙圈是配件（props3d：glasses_long.glb、backpack、keychain_milktea.glb）。
工具：bash tools/blender/setup_env.sh（D144）。
用法：/opt/blenv/bin/python tools/blender/char_second/long_ho.py -- <輸出.vrm 或 -> [--render 前綴] [--views ...] [--blend 工作檔]
之後：VRM_BASE=Sakurada_Fumiriya VRM_MALE=1 python3 tools/blender/char_second/vrm_finish2.py <輸出.vrm> assets/models/char/second_ai/bl_us_long.vrm 舊序章人物己 #241c18"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
os.environ['NPC'] = 'nm10'             # npc.py 在 import 時要一個已有的名字；下面整個換成舊序章人物己的參數
sys.path.insert(0, HERE)
import npc as N                        # noqa: E402
C = N.C
import bpy                             # noqa: E402

rgb = N.rgb
LONG = dict(sex='m', base='Sakurada_Fumiriya', head=0.96, height=1.76, iris='#241c18',
            # 單眼皮（眼睛扁一點、眼尾微微往上）、眉毛濃而平（BROW_K 粗、BROW_ARCH 低）、臉偏瘦（FACE_NARROW、下巴不寬）；嘴角不往下（MALE 預設 0.0012：第一版看起來悶悶不樂）
            face=dict(EYE_SX=1.03, EYE_SZ=0.58, EYE_TILT=0.07, MOUTH_DOWN=0.0004, BROW_ARCH=0.22, BROW_K=1.95, BROW_SCALE_Z=1.75, FACE_NARROW=0.948, CHIN_WIDEN=0.48, JAW_OUT=0.0042, MOUTH_K=1.38),
            # 短髮：側分、瀏海在眉毛上面、兩側和後頸短（耳朵露出來）
            hair=dict(seed=20261110, part=14.0, col=(0.07, 0.065, 0.065), tip=(0.022, 0.020, 0.014, 0.016, 0.018, 0.022, 0.024, 0.008, 0.008, 0.006), nape=0.0, nape_c=0.0, vol=0.70, curl=(10, 24),
                      side_taper=0.75, nape_taper=0.85, shell_root=1.0, v_min=-0.04, shell_v0=0.05),   # 第二版：耳上短髮（照 nm3 第三版的做法）：瀏海停在眉毛上面 1.5～2 cm、側分；第一版髮尾到眉毛、兩側蓋住耳朵（像蘑菇頭）
            # 深藍色運動外套（敞開）＋白 T＋深灰長褲＋白球鞋
            layered=dict(style=N.outer_style(rgb(32, 44, 80), rgb(64, 66, 72), rgb(238, 238, 234), rgb(226, 224, 218), tex='knit', sleeve_k=0.78, ease=0.80, pants_ell=(0.066, 0.076)),
                         outer=dict(open=16, buttons=0), inner=dict(rgb=rgb(238, 236, 230))))
N.VAR = LONG; N.NAME = 'long'; N.TAG = 'LONG'
N.JP_STYLE['long'] = dict(bang='card')   # 原本的一撮一撮短髮（側分）


def main():
    a = C.args(); out = a[0]
    opt = {a[i]: a[i + 1] for i in range(1, len(a) - 1) if a[i].startswith('--')}
    C.setup()
    m = C.import_vrm(os.path.join(C.SRC, LONG['base'] + '.vrm'))
    for s in ('stage0', 'face', 'clothes', 'hair'):
        print('[stage]', s); N.STAGES[s](m)
    if m.get('wsrc_top') is not None: bpy.data.objects.remove(m['wsrc_top'], do_unlink=True); m['wsrc_top'] = None
    if '--blend' in opt:
        bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(opt['--blend']), compress=True); print('saved blend', opt['--blend'])
    if '--render' in opt:
        lm = C.landmarks(m['arm']); kw = {'views': tuple(opt['--views'].split(','))} if '--views' in opt else {}
        print('renders', C.render_views(opt['--render'], head_z=lm['head'] + 0.08, height=lm['head'] + 0.20, **kw))
    if out != '-': print('exported', C.export_vrm(os.path.abspath(out)))


if __name__ == '__main__':
    main()
