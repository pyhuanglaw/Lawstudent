"""找 GLB 裡「有字的牌子被擋住」或「字左右相反」（2026-10-25 招牌稽核，LAWWW2-B）。
起因：B1 大廳開館時間牌、公告欄貼在框和木板的後面（遊戲裡是黑板、空木板），頂點順序也反了；機場換匯看板、美國社區公車站牌的字左右相反。
用法：
  /opt/blenv/bin/python tools/blender/env_second/check_signs.py -- <glb> [<glb> ...] [--json out.json] [--all-mats]
做法：
- 只看材質或圖檔名稱像「有字」的（sign、board、fids、menu、notice、poster、label、screen、print、card、ads、hours、rules、tv、timer…）；
  牆、地板、木頭、玻璃、書（書背的圖集）不看。--all-mats：所有有貼圖的材質都看。
- 每個三角形，中心往兩邊 8 cm 射線：
  - 兩邊都打到別的東西＝被擋住（hidden）。
  - 打到玻璃（材質名稱有 glass、或半透明）不算擋住：貼在玻璃後面的海報、公告欄。
  - 打到另一組互斥的布置不算擋住（SET_、SEASON_、COPY_、NAMETAG_、Y203_ 這種年級組、ROOMMATE_）：兩組不會同時顯示。
- 看得到的那一邊＝沒被擋住的那一邊（另一邊通常是牆或框）；直立的面才判斷左右：人站在那一邊看，u 往右手邊變大才是正的，否則＝反字（mirrored）。
  兩邊都沒東西（雙面掛著的牌子）看不出人在哪一邊，不判斷（ambig）。
- 平放的面（桌上的紙）不判斷左右。
限制：
- 被擋住只看三角形中心，局部遮住（公告疊在別張上面、飾條蓋到牌子上緣）也會標出來；要用還原圖或遊戲內截圖確認。
- 反字只看 u 的方向；有些貼圖本來就沒有字（花紋、圖示），反過來也沒差。
輸出：每個（GLB、物件、材質）一列：三角形數、被擋數、反字數；FLAG 開頭的是有被擋或反字的。"""
import bpy, sys, json, re
from mathutils import Vector
from mathutils.bvhtree import BVHTree
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = A[A.index('--json') + 1] if '--json' in A else None
ALL = '--all-mats' in A
FILES = [a for a in A if a.endswith('.glb')]
TEXT = re.compile(r'sign|board|fids|menu|notice|poster|label|plate|screen|print|card|ads|hours|rules|tv|timer|price|map|wayfind|directory|score|banner|fuda|note|sticky|paper|ticket|kanban|noren|logo|text|tag|info|guide|calendar|clock', re.I)
SKIP = re.compile(r'FACE|wall|wain|floor|ceil|glass|wood|siding|granite|tile|brick|plaster|book|spine', re.I)
TOGGLE = re.compile(r'^(SET_[A-Z]+|SEASON_[A-Z0-9]+_(on|off)|COPY_[A-Z0-9_]+?_(SHUT|OPEN|RENEW)|NAMETAG_[A-Z]+|Y\d{3}_[A-Z]+|ROOMMATE_[A-Z]+)')
D = 0.08


def toggle_of(ob):
    while ob is not None:
        m = TOGGLE.match(ob.name)
        if m: return m.group(1)
        ob = ob.parent
    return None


def see_through(mat):
    if mat is None: return False
    if re.search('glass', mat.name, re.I): return True
    try:   # 不看 blend_method：Blender 5 匯入 glTF 的材質一律不是 OPAQUE（2026-10-25 第一版因此什麼都抓不到）
        bs = mat.node_tree.nodes.get('Principled BSDF') if mat.use_nodes else None
        return bs is not None and not bs.inputs['Alpha'].is_linked and bs.inputs['Alpha'].default_value < 0.95
    except Exception: return False


R = []
for fn in FILES:
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=fn)
    dg = bpy.context.evaluated_depsgraph_get(); verts, polys, owner = [], [], []
    obs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    for ob in obs:
        me = ob.evaluated_get(dg).to_mesh(); mw = ob.matrix_world; base = len(verts); tg = toggle_of(ob)
        verts.extend(mw @ v.co for v in me.vertices)
        for p in me.polygons:
            polys.append([base + i for i in p.vertices]); mt = ob.data.materials[p.material_index] if p.material_index < len(ob.data.materials) else None
            owner.append((ob.name, tg, see_through(mt)))
        ob.evaluated_get(dg).to_mesh_clear()
    if not polys: continue
    bvh = BVHTree.FromPolygons(verts, polys, epsilon=0.0)

    def blocked(o, d, me_name, me_tg):
        left = D; o = o + d * 0.0005
        while left > 0:
            h = bvh.ray_cast(o, d, left)
            if h[0] is None: return None
            nm, tg, st = owner[h[2]]
            if nm != me_name and not st and not (tg and tg != me_tg): return (nm, round((D - left + h[3]) * 100, 1))
            o = h[0] + d * 0.0005; left -= h[3] + 0.0005
        return None

    for ob in obs:
        me = ob.data
        if not me.uv_layers: continue
        mw = ob.matrix_world; m3 = mw.to_3x3(); uvl = me.uv_layers.active.data; tg = toggle_of(ob)
        for p in me.polygons:
            if p.material_index >= len(me.materials) or me.materials[p.material_index] is None: continue
            mat = me.materials[p.material_index]
            img = next((nd.image for nd in mat.node_tree.nodes if nd.type == 'TEX_IMAGE' and nd.image), None) if mat.use_nodes else None
            if img is None: continue
            if not ALL and (not TEXT.search(mat.name + ' ' + img.name) or SKIP.search(mat.name)): continue
            n = (m3 @ p.normal).normalized(); li = list(p.loop_indices)
            P = [mw @ me.vertices[me.loops[i].vertex_index].co for i in li]; U = [uvl[i].uv.x for i in li]; c = sum(P, Vector()) / len(P)
            hp, hm = blocked(c, n, ob.name, tg), blocked(c, -n, ob.name, tg)
            rec = next((r for r in R if r['glb'] == fn and r['obj'] == ob.name and r['mat'] == mat.name), None)
            if rec is None:
                rec = {'glb': fn, 'obj': ob.name, 'mat': mat.name, 'img': img.name, 'tris': 0, 'hidden': 0, 'mirrored': 0, 'flat': 0, 'ambig': 0, 'at': None, 'by': None}; R.append(rec)
            rec['tris'] += 1
            at = [round(c.x, 2), round(c.z, 2), round(-c.y, 2)]                 # 遊戲座標 (x, 高度, z)
            if hp and hm: rec['hidden'] += 1; rec['at'] = rec['at'] or at; rec['by'] = rec['by'] or [hp, hm]; continue
            if abs(n.z) > 0.5: rec['flat'] += 1; continue
            if not hp and not hm: rec['ambig'] += 1; continue
            front = -n if hp else n
            right = (-front).cross(Vector((0, 0, 1))).normalized(); up = Vector((0, 0, 1))
            e1, e2 = P[1] - P[0], P[2] - P[0]; a = (e1.dot(right), e1.dot(up)); b = (e2.dot(right), e2.dot(up)); du1, du2 = U[1] - U[0], U[2] - U[0]
            det = a[0] * b[1] - a[1] * b[0]
            if abs(det) < 1e-9: continue
            if (du1 * b[1] - du2 * a[1]) / det < -1e-6: rec['mirrored'] += 1; rec['at'] = rec['at'] or at
    print('done', fn, flush=True)
bad = [r for r in R if r['hidden'] or r['mirrored']]
if OUT: json.dump({'all': R, 'bad': bad}, open(OUT, 'w'), ensure_ascii=False, indent=1)
for r in bad: print('FLAG', json.dumps(r, ensure_ascii=False))
print('TOTAL', len(bad), 'flagged of', len(R), 'sign materials')
