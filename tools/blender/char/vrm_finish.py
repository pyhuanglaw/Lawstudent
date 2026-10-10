"""Blender 匯出的 VRM → 遊戲用（一般 python3，用 tools/vroid_build.py 的函式）：眼睛自然張開度烘進基本形、只留遊戲用的表情、合併 primitive、虹膜色、縮貼圖、作者資訊。
用法：python3 tools/blender/char/vrm_finish.py <輸入.vrm> <輸出.vrm> <標題> [虹膜色]（男性樣本加環境變數 VRM_BASE=HairSample_Male）"""
import sys, os, importlib.util
spec = importlib.util.spec_from_file_location('vb', os.path.join(os.path.dirname(__file__), '..', '..', 'vroid_build.py'))
vb = importlib.util.module_from_spec(spec); spec.loader.exec_module(vb)
SIZES = dict(vb.DEFAULT_SIZES, **{'Face_00': 1024, 'HairCard': 1024, 'Knit': 1024, 'Trouser': 512, 'Loafer': 256})
if __name__ == '__main__':
    src, dst, title = sys.argv[1:4]; iris = sys.argv[4] if len(sys.argv) > 4 else None
    v = vb.VRM(src)
    vb.outline_tone(v)
    male = os.environ.get('VRM_BASE', 'HairSample_Female') == 'HairSample_Male'     # 祐廷：男性樣本的眼型不改（vroid_build 的 MALE_EYES）
    eyes = vb.MALE_EYES if male else vb.FEMALE_EYES
    vb.bake_face(v, eyes, blink_scale=1.0 - eyes.get('Fcl_EYE_Close', 0.0))
    vb.prune_morphs(v); vb.merge_prims(v)
    if iris: vb.recolor_iris(v, iris)
    vb.optimize(v, SIZES)
    vb.set_meta(v, title, 'Based on VRoid CC0 sample "%s" (pixiv): body, face and skeleton; hair, clothes and face shape modeled in Blender for 法條之外' % os.environ.get('VRM_BASE', 'HairSample_Female'))
    n = v.save(dst); print(dst, round(n / 1e6, 2), 'MB')
