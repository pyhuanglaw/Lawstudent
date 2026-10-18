"""美國篇的季節（ART-US-SEASON）：同一個 GLB 帶四季，遊戲照日期換材質、開關幾組網格（Blender 端的共用做法）。
祐廷 8/2 到美國、12/23 回來（AA_213；LAWWW-C 的初雪 12/2）。季節的 key 和日期（遊戲端 usSeasonKey 照這個）：
  （日期照 AA_213，2026-10-18 AA 定）
  summer  夏末   8/2～10/8（4/16～8/1 也用這個）
  autumn  秋天   10/9～10/31：楓紅、橙、黃，樹下草地有落葉
  bare    初冬   11/1～12/1（還有 3/16～4/15）：葉子落光（細枝卡），草地枯黃，落葉還在
  snow    雪     12/2～3/15：枯枝、地上和屋頂積雪、灌木頂上有雪
約定（遊戲端照名字找，不用另外的表）：
  - SEASON_MATS：一個藏起來的節點（放在地底），底下每個小三角形帶一個替換材質，材質名稱 `<原材質名>__S_<季節>`；
    遊戲把用 <原材質名> 的網格在那一季換成這個材質，沒有列的季節用原材質。
  - 節點的自訂屬性 seasons＝'bare,snow'（逗號分隔）：只有這幾季看得到（例：落葉、內層的細枝）。節點名稱以 SEASON_GEO_ 開頭（merge_by_material 不會把它併掉）。
用法（建築／戶外腳本）：
  import us_season as SEA
  car = SEA.carrier(root)
  SEA.swap(car, base_mat, 'autumn', other_mat)          # other_mat 會被改名成 <base>__S_autumn
  m = SEA.geo(root, 'twigs', 'bare,snow', Mesh(...))    # 季節網格
  merge_by_material(root, keep=SEA.keep)                 # 或在原本的 keep 裡加 SEA.keep(ob)"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, bpy, bmesh   # noqa: E402

SEASONS = ('summer', 'autumn', 'bare', 'snow')
GEN = os.path.join(HERE, 'textures', 'gen')


def keep(ob):
    n = ob.name or ''
    return n.startswith('SEASON_') or (ob.parent is not None and (ob.parent.name or '').startswith('SEASON_'))


def carrier(root):
    """替換材質的載體：一個空節點（地底 60 m），底下每個材質一個小三角形"""
    g = B.group('SEASON_MATS', root, {'kind': 'season_mats'})
    g.location = (0.0, 0.0, -60.0)
    return g


def swap(car, base, season, mat):
    assert season in SEASONS, season
    mat.name = f'{base.name}__S_{season}'
    bm = bmesh.new(); vs = [bm.verts.new(p) for p in ((0, 0, 0), (0.01, 0, 0), (0, 0.01, 0))]; bm.faces.new(vs)
    uvl = bm.loops.layers.uv.new('UVMap')
    for f in bm.faces:
        for lp, uv in zip(f.loops, ((0, 0), (1, 0), (0, 1))): lp[uvl].uv = uv
    me = bpy.data.meshes.new('SEASON_MAT_' + mat.name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new('SEASON_MAT_' + mat.name, me); bpy.context.scene.collection.objects.link(ob); ob.parent = car
    return mat


def geo(root, name, seasons, mesh, **finish_kw):
    """季節網格：mesh（lib2.Mesh／CMesh）finish 到一個 SEASON_GEO_<name> 節點底下；節點帶 seasons 屬性"""
    for s in seasons.split(','): assert s in SEASONS, s
    g = B.group('SEASON_GEO_' + name, root, {'seasons': seasons})
    mesh.finish(g, **finish_kw)
    return g


def mark(ob, seasons):
    """已經做好的物件（例：樹冠的芯）改成季節網格：改名 SEASON_GEO_、帶 seasons 屬性"""
    for s in seasons.split(','): assert s in SEASONS, s
    if not ob.name.startswith('SEASON_GEO_'): ob.name = 'SEASON_GEO_' + ob.name
    ob['seasons'] = seasons
    return ob


def leaf_mat(name, png, rough=0.7):
    """葉片卡材質（alpha clip、雙面；和 tools/blender/plants.py 的同一個做法）"""
    import plants as PL
    m = PL._leaf_card_mat(name, png, rough=rough)
    return m


def apply_preview(root, season):
    """Blender 裡預覽某一季（給算圖用；匯出前不要呼叫）：照 SEASON_MATS 換材質、照 seasons 開關。root＝None：場景裡全部（匯入的 GLB）"""
    sw = {}
    car = bpy.data.objects.get('SEASON_MATS')
    if car:
        for ch in car.children:
            if ch.type != 'MESH' or not ch.data.materials: continue
            m = ch.data.materials[0]
            if '__S_' not in m.name: continue
            base, s = m.name.rsplit('__S_', 1); sw.setdefault(base, {})[s.split('.')[0]] = m
        car.hide_render = True
        for ch in car.children: ch.hide_render = True
    for ob in (root.children_recursive if root is not None else list(bpy.data.objects)):
        sv = ob.get('seasons') if hasattr(ob, 'get') else None
        if sv:
            vis = season in sv.split(',')
            ob.hide_render = not vis; ob.hide_viewport = not vis
            for ch in ob.children_recursive: ch.hide_render = not vis; ch.hide_viewport = not vis
        if ob.type != 'MESH' or (car and ob.parent == car): continue
        for i, m in enumerate(ob.data.materials):
            if m is None: continue
            orig = ob.get('_mat0_%d' % i)
            if orig is None: ob['_mat0_%d' % i] = m.name; orig = m.name
            alt = sw.get(orig, {}).get(season)
            ob.data.materials[i] = alt if alt is not None else bpy.data.materials[orig]
