"""Blender 匯出的 VRM → 遊戲用：和 LAWWW 的 tools/blender/char/vrm_finish.py 同一套步驟（tools/vroid_build.py 的函式：描邊色調、眼睛張開度烘進基本形、
只留遊戲用的表情、合併 primitive、虹膜色、縮貼圖、作者資訊），只差兩點：
  1. 男生眼型（MALE_EYES：不改）由環境變數 VRM_MALE=1 決定——vrm_finish.py 只認 VRM_BASE=HairSample_Male（祐廷），阿哲的底模是 Sakurada Fumiriya；
  2. 縮貼圖的大小表加上 LAWWW2 人物衣服的貼圖名稱（Jacket、Tee、Panel）。
用法：VRM_BASE=<樣本名> [VRM_MALE=1] python3 tools/blender/char_second/vrm_finish2.py <輸入.vrm> <輸出.vrm> <標題> [虹膜色]
（vroid_build.py 在 LAWWW 的分支：預設 /home/user/char_wt/tools/vroid_build.py，或用環境變數 VROID_BUILD 指定）"""
import sys, os, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
VB = os.environ.get('VROID_BUILD') or next((p for p in (os.path.join(HERE, '..', '..', 'vroid_build.py'), '/home/user/char_wt/tools/vroid_build.py') if os.path.exists(p)), None)
spec = importlib.util.spec_from_file_location('vb', VB)
vb = importlib.util.module_from_spec(spec); spec.loader.exec_module(vb)
SIZES = dict(vb.DEFAULT_SIZES, **{'Face_00': 1024, 'HairCard': 1024, 'Knit': 1024, 'Trouser': 512, 'Loafer': 256, 'Jacket': 1024, 'Tee': 512, 'Panel': 256})
if os.environ.get('NPC_SMALL'):     # 路人（npc.py）：檔案 2～3 MB（現在的 vroid_npc_* 2.2～3.2 MB），遠看用不到 1024 的貼圖
    SIZES.update({'Face_00': 512, 'HairCard': 512, 'Knit': 512, 'Trouser': 256, 'Body': 512, 'Jacket': 512})
if __name__ == '__main__':
    src, dst, title = sys.argv[1:4]; iris = sys.argv[4] if len(sys.argv) > 4 else None
    base = os.environ.get('VRM_BASE', 'HairSample_Female')
    v = vb.VRM(src)
    vb.outline_tone(v)
    male = os.environ.get('VRM_MALE') == '1' or base == 'HairSample_Male'
    eyes = vb.MALE_EYES if male else vb.FEMALE_EYES
    if os.environ.get('VRM_REST'):     # 待機臉：把表情的一部分烘進基本形（JSON，例如 {"Fcl_MTH_Fun": 0.3}；BB-C BB_201：經濟系四人的待機臉太悶）
        import json; eyes = dict(eyes, **json.loads(os.environ['VRM_REST']))
    vb.bake_face(v, eyes, blink_scale=1.0 - eyes.get('Fcl_EYE_Close', 0.0))
    vb.prune_morphs(v); vb.merge_prims(v)
    if iris: vb.recolor_iris(v, iris)
    vb.optimize(v, SIZES)
    vb.set_meta(v, title, 'Based on VRoid CC0 sample "%s" (pixiv): body, face and skeleton; hair, clothes and face shape modeled in Blender for 法條之外' % base)
    n = v.save(dst); print(dst, round(n / 1e6, 2), 'MB', 'male eyes' if male else 'female eyes')
