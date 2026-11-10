"""CC（帳號 A）11-10：FN_shots——花序 Flower Notes（FLOWER-NOTES-1110／X325，BB_312 驗收計畫第 2 節 地圖 1、場景 1～5、樓梯、技術 5）。Playwright（PC GPU）≠ iPhone。
模型進遊戲以後才是正式的；改之前（632ef134e）先跑，把 G11（泰米村食）的位置拍出來當對照。判定歸 BB；這支只拍、只量，黑畫面（D.shot：page.screenshot 算亮度，
不用 WebGL canvas drawImage——PC 會回 0）和「拍得到／走得到」才是 check。
G11 的位置：場景物件 userData.ggShop＝'G11'（src/zones3d.js 946 ggTag）的外框（改之前 x 41.3～51.6、前緣 z≈18.1），偵測不到用 FN_G11='x0,x1,前緣z'。
店門：exit 的 label／區域名有「花序」「Flower」、或在 G11 寬度裡（cc_fn_lib.find_door）；FN_DOOR_LABEL 可指定。
PARTS（逗號分隔；預設 EXT,SIGN,VIEWS,INT,STAIRS,FPS）：
  EXT     外觀：14:00、17:15、20:30（【前置】讀檔公館、晴）各拍正面 ext_front、斜 ext_obl。
  SIGN    招牌近拍 sign（14:00）。
  VIEWS   從捷運口 view_mrt、校門 view_gate、騎樓 view_arcade 看向 G11（14:00）。
  INT     有門才拍：觸控走進店（D.use_exit）→ 入口往裡一張（站在進門的位置、照人面向的方向）→ 五個區（中央展示、鮮花、永生花、收銀、入口）各一張：
          位置用 FN_AREAS（JSON：{"中央展示":{"eye":[x,y,z],"look":[x,y,z],"lens":24},…}，店裡的座標）；沒給就從店裡的場景物件名稱找（AREA_PAT），找不到寫「偵測不到」。
  STAIRS  有門才做：店裡有第二層導航（E.levels[1]）＝搖桿走上去（找一格站得住、走得到的二樓地板）、走下來回到進門的位置；沒有＝找名稱像樓梯的物件，拍樓梯口、記旁邊的互動點（告示）。
  FPS     G11 門口（街上，立面前 2 m）量 8 秒 requestAnimationFrame（幀數／秒）；有門再到店裡量 8 秒。雲端 SwiftShader 的數字不能當結論。
相機（CAMS）：每個 {'eye':[x,y,z],'look':[x,y,z],'lens':mm,'rel':[eye 相對 G11?, look 相對 G11?]}；相對 G11＝加上 (G11 中間 x, 0, G11 前緣 z)。
  FN_CAMS='{"sign":{"eye":[0,2.6,-5],"look":[0,4.8,0],"lens":35}}' 可以蓋掉任何一個（只給的欄位）。參考圖同角度並排由 CC 拼。
輸出：fns_<名稱>[_時間].png；fns_cams.json（每張的相機、亮度）。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=EXT,SIGN python3 cc_fn_shots_probe.py <url> <out>"""
import os, sys, json, asyncio, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PARTS = [x.strip().upper() for x in (os.environ.get('PARTS') or 'EXT,SIGN,VIEWS,INT,STAIRS,FPS').split(',') if x.strip()]
R = L.Run('fn_shots', OUT); F.setup(R, OUT)
J = F.J
DAY = os.environ.get('SHOT_DAY') or '2025-11-01'
HOURS = [(14.0, '1400'), (17.25, '1715'), (20.5, '2030')]
# 相機（可調）：rel[0]＝eye 相對 G11、rel[1]＝look 相對 G11（G11 中間 x、0、G11 前緣 z）
CAMS = {
    'ext_front':   {'eye': [0, 1.7, -16.0], 'look': [0, 4.5, 0.5], 'lens': 20, 'rel': [True, True]},     # 馬路對面（人行道外緣）正對
    'ext_obl':     {'eye': [-13.0, 1.7, -12.0], 'look': [0, 4.5, 0.5], 'lens': 22, 'rel': [True, True]},  # 西邊斜 45°
    'sign':        {'eye': [0, 2.2, -6.0], 'look': [0, 4.3, 0.0], 'lens': 40, 'rel': [True, True]},       # 招牌近拍（改之前套件燈箱高 3.85 m，cc_gg_signs_probe.py）
    'view_mrt':    {'eye': [-33.0, 1.7, 9.0], 'look': [0, 4.0, 0.0], 'lens': 24, 'rel': [False, True]},   # 捷運公館站出口西邊人行道（出口 (−35.6, 11)）
    'view_gate':   {'eye': [0.0, 1.7, -40.0], 'look': [0, 4.0, 0.0], 'lens': 24, 'rel': [False, True]},   # 校門外（回到校園 (±5.3, −47.5)）
    'view_arcade': {'eye': [-24.0, 1.7, 1.6], 'look': [0, 2.6, 1.6], 'lens': 20, 'rel': [True, True]},    # 騎樓裡往東看（騎樓 z 19～22）
}
try:
    for k, v in json.loads(os.environ.get('FN_CAMS') or '{}').items(): CAMS.setdefault(k, {'rel': [False, False], 'lens': 24}).update(v)
except Exception as e:
    print('FN_CAMS 讀不懂：%r' % e, flush=True)
AREA_PAT = {'中央展示': r'center|central|island|display|showcase|中央|展示', '鮮花': r'fresh|bucket|cooler|fridge|鮮花', '永生花': r'preserved|eternal|dome|bell_jar|永生',
            '收銀': r'cashier|counter|till|register|checkout|收銀|櫃台|櫃檯', '入口': r'entrance|entry|door|入口'}
CAMLOG = []


def cam_of(name, g):
    c = CAMS[name]; ox, oz = (g['cx'], g['zf']) if g else (0.0, 0.0)
    e = [c['eye'][0] + (ox if c['rel'][0] else 0), c['eye'][1], c['eye'][2] + (oz if c['rel'][0] else 0)]
    lk = [c['look'][0] + (ox if c['rel'][1] else 0), c['look'][1], c['look'][2] + (oz if c['rel'][1] else 0)]
    return {'eye': [round(v, 2) for v in e], 'look': [round(v, 2) for v in lk], 'lens': c.get('lens', 24)}


async def snap(pg, cdp, fname, cam, label):
    c = await F.shot(pg, cdp, fname, cam)
    CAMLOG.append({'file': fname + '.png', 'label': label, 'cam': c})
    json.dump(CAMLOG, open(os.path.join(OUT, 'fns_cams.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


async def load_street(pg, cdp, h, g=None, why=''):
    x, z = (g['cx'], g['zf'] - 2.0) if g else (44.0, 14.0)
    await D.load_zone(pg, cdp, 'gongguan', DAY, h, x, z, math.pi, 0, wait=7000)
    R.setup('【前置／捷徑】讀檔公館 %s %05.2f（晴，關條件事件）站在 (%.1f, %.1f)%s' % (DAY, h, x, z, why))


async def part_ext(pg, cdp, g):
    for h, hs in HOURS:
        await load_street(pg, cdp, h, g, '：外觀')
        for nm in ('ext_front', 'ext_obl'):
            await snap(pg, cdp, 'fns_%s_%s' % (nm, hs), cam_of(nm, g), '%s %s' % (nm, hs))


async def part_sign(pg, cdp, g):
    await load_street(pg, cdp, 14.0, g, '：招牌')
    await snap(pg, cdp, 'fns_sign_1400', cam_of('sign', g), 'sign 1400')


async def part_views(pg, cdp, g):
    await load_street(pg, cdp, 14.0, g, '：三個方向')
    for nm in ('view_mrt', 'view_gate', 'view_arcade'):
        await snap(pg, cdp, 'fns_%s_1400' % nm, cam_of(nm, g), '%s 1400' % nm)


async def enter_shop(pg, cdp, g, tag):
    await load_street(pg, cdp, 14.0, g, '：%s' % tag)
    door, exs = await F.find_door(pg, g)
    if not door:
        R.note('%s G11 沒有門（改之前＝泰米村食進不去，src/zones3d.js 937 type none）：這一段新版才有，沒拍' % tag); return None
    s = await D.use_exit(pg, cdp, tag, door['label'], door['to'])
    if not s: return None
    s = await D.settle(pg)
    sp = await pg.evaluate("(()=>{ const P=GAME.E.player, o=P.obj.position; return {x:+o.x.toFixed(2), z:+o.z.toFixed(2), lv:P.lv|0, ry:+P.obj.rotation.y.toFixed(3), levels:GAME.E.levels?GAME.E.levels.length:1}; })()")
    R.note('%s 進門的位置：%s；門 %s' % (tag, J(sp), J(door)))
    return {'door': door, 'spawn': sp, 'zone': s['zone']}


AREA_JS = r"""((pats)=>{ const E=GAME.E, out={}; for(const [k,p] of Object.entries(pats)){ const re=new RegExp(p,'i'); let hit=null;
    E.scene.traverse(o=>{ if(hit||!o.name||!re.test(o.name)) return; let v=o.visible; for(let q=o.parent;q&&v;q=q.parent) if(q.visible===false) v=false; if(!v) return; const b=new THREE.Box3().setFromObject(o); if(b.isEmpty()) return; const s=b.getSize(new THREE.Vector3()); if(s.x>20||s.z>20) return;
      const c=b.getCenter(new THREE.Vector3()); hit={name:o.name, c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], size:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)]}; });
    out[k]=hit; }
  const names=new Set(); E.scene.traverse(o=>{ if(o.name&&(o.isMesh||o.isGroup)) names.add(o.name); }); return {hit:out, names:[...names].slice(0,200)}; })"""


async def part_int(pg, cdp, g):
    tag = '[INT]'
    sh = await enter_shop(pg, cdp, g, tag)
    if not sh: return
    sp = sh['spawn']; fx, fz = math.sin(sp['ry']), math.cos(sp['ry'])
    await snap(pg, cdp, 'fns_int_entry', {'eye': [sp['x'] - fx * 0.6, 1.6, sp['z'] - fz * 0.6], 'look': [sp['x'] + fx * 6, 1.2, sp['z'] + fz * 6], 'lens': 18}, '入口往裡（人面向的方向）')
    ov = {}
    try: ov = json.loads(os.environ.get('FN_AREAS') or '{}')
    except Exception as e: R.note('%s FN_AREAS 讀不懂：%r' % (tag, e))
    det = await pg.evaluate("(%s)(%s)" % (AREA_JS, J(AREA_PAT)))
    R.note('%s 店裡的場景物件名稱（前 200）：%s' % (tag, J(det['names'])))
    for k in AREA_PAT:
        if k in ov:
            await snap(pg, cdp, 'fns_area_%s' % k, ov[k], '%s（FN_AREAS）' % k); continue
        h = det['hit'].get(k)
        if not h:
            R.note('%s 「%s」偵測不到（場景物件名稱沒有 /%s/；請給 FN_AREAS）' % (tag, k, AREA_PAT[k])); continue
        c = h['c']; dx, dz = sp['x'] - c[0], sp['z'] - c[2]; d = math.hypot(dx, dz) or 1; back = max(2.5, max(h['size'][0], h['size'][2]) * 1.2)
        cam = {'eye': [round(c[0] + dx / d * back, 2), 1.6, round(c[2] + dz / d * back, 2)], 'look': [c[0], max(0.8, c[1]), c[2]], 'lens': 22}
        R.note('%s 「%s」＝物件 %s（中心 %s、大小 %s）：從入口那一側 %.1f m 拍' % (tag, k, h['name'], J(c), J(h['size']), back))
        await snap(pg, cdp, 'fns_area_%s' % k, cam, '%s（物件 %s）' % (k, h['name']))


UP_JS = r"""((q)=>{ const E=GAME.E, N=E.levels&&E.levels[1]; if(!N) return null; let best=null; const P=E.player.obj.position;
  for(let cz=0;cz<N.rows;cz+=2) for(let cx=0;cx<N.cols;cx+=2){ if(N.b[N.idx(cx,cz)]) continue; const [x,z]=N.toWorld(cx,cz); if(!E.canStand(x,z,0.3,1)) continue; const y=N.heightAt(x,z); if(y<q.minY) continue;
    const p=E.pathTo(P.x,P.z,E.player.lv|0,x,z,1); if(!p||!p.length) continue; const last=p[p.length-1]; if(Math.hypot(last[0]-x,last[1]-z)>0.6) continue; const sc=y*10-Math.hypot(x-P.x,z-P.z)*0.1; if(!best||sc>best.sc) best={x:+x.toFixed(2),z:+z.toFixed(2),y:+y.toFixed(2),sc,n:p.length}; }
  return best; })"""
STAIR_OBJ_JS = r"""(()=>{ const E=GAME.E; let hit=null; E.scene.traverse(o=>{ if(hit||!o.name||!/stair|step|樓梯|階/i.test(o.name)) return; const b=new THREE.Box3().setFromObject(o); if(b.isEmpty()) return; const c=b.getCenter(new THREE.Vector3()); hit={name:o.name,c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)]}; });
  const its=hit?(E.interactables||[]).filter(i=>Math.hypot(i.x-hit.c[0],i.z-hit.c[2])<4).map(i=>({label:i.label,look:i.look||null,x:+i.x.toFixed(2),z:+i.z.toFixed(2)})):[]; return {stair:hit, its}; })()"""


async def part_stairs(pg, cdp, g):
    tag = '[STAIRS]'
    sh = await enter_shop(pg, cdp, g, tag)
    if not sh: return
    sp = sh['spawn']
    if sp['levels'] > 1:
        up = await pg.evaluate("(%s)(%s)" % (UP_JS, J({'minY': 1.5})))
        R.note('%s 二樓目標（站得住、走得到、最高的地板）：%s' % (tag, J(up)))
        if not R.check('%s 店裡有第二層導航、二樓有走得到的地板' % tag, bool(up), ''): return
        r = await F.joy_to(pg, cdp, tag, up['x'], up['z'], near=0.8, lv=1, max_s=150)
        R.note('%s 搖桿上樓：%s' % (tag, J({k: r[k] for k in r if k != 'log'})))
        R.check('%s 搖桿走上二樓（lv 1、%s 秒、沒有跳）' % (tag, r['t']), r['ok'] and r['end']['lv'] == 1 and not r['jumps'], J({'end': r['end'], 'why': r.get('why'), 'jumps': r['jumps']}))
        await F.shot(pg, cdp, 'fns_stairs_2f')
        r = await F.joy_to(pg, cdp, tag, sp['x'], sp['z'], near=0.8, lv=0, max_s=150)
        R.check('%s 搖桿走下樓回到進門的位置（lv 0、%s 秒、沒有跳）' % (tag, r['t']), r['ok'] and r['end']['lv'] == 0 and not r['jumps'], J({'end': r['end'], 'why': r.get('why'), 'jumps': r['jumps']}))
    else:
        so = await pg.evaluate(STAIR_OBJ_JS)
        R.note('%s 店裡只有一層導航（二樓這一版沒開）；名稱像樓梯的物件 %s、旁邊 4 m 的互動點（告示）%s' % (tag, J(so['stair']), J(so['its'])))
        if so['stair']:
            c = so['stair']['c']; dx, dz = sp['x'] - c[0], sp['z'] - c[2]; d = math.hypot(dx, dz) or 1
            await snap(pg, cdp, 'fns_stairs_closed', {'eye': [round(c[0] + dx / d * 3.5, 2), 1.6, round(c[2] + dz / d * 3.5, 2)], 'look': [c[0], 1.2, c[2]], 'lens': 22}, '樓梯口（%s）' % so['stair']['name'])
        else:
            R.note('%s 找不到名稱像樓梯的物件（/stair|step|樓梯|階/），沒拍樓梯口；請給 FN_CAMS 的 stairs' % tag)
            if 'stairs' in CAMS: await snap(pg, cdp, 'fns_stairs_closed', cam_of('stairs', None), '樓梯口（FN_CAMS）')


async def part_fps(pg, cdp, g):
    tag = '[FPS]'
    await load_street(pg, cdp, 14.0, g, '：G11 門口量幀率')
    await pg.wait_for_timeout(3000)
    f = await pg.evaluate("(%s)(8000)" % F.FPS_JS)
    R.note('%s G11 門口（街上，前緣前 2 m）8 秒：%s（雲端 SwiftShader 的數字不當結論）' % (tag, J(f)))
    R.check('%s G11 門口量得到幀率' % tag, f['frames'] > 0, J(f))
    sh = await enter_shop(pg, cdp, g, tag)
    if sh:
        await pg.wait_for_timeout(3000)
        f = await pg.evaluate("(%s)(8000)" % F.FPS_JS)
        R.note('%s 店裡（%s 進門的位置）8 秒：%s' % (tag, sh['zone'], J(f)))
        R.check('%s 店裡量得到幀率' % tag, f['frames'] > 0, J(f))


async def main():
    sha = os.environ.get('SHA', '')[:9]
    print('CC FN_shots（FLOWER-NOTES-1110）：PARTS %s；SHA %s；Playwright ≠ iPhone' % (','.join(PARTS), sha), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        await D.load_zone(pg, cdp, 'gongguan', DAY, 14.0, 44.0, 14.0, math.pi, 0, wait=6000)
        g = await F.g11(pg)
        R.note('G11（%s）：%s；相機 %s' % (g and g['src'], J(g), J({k: cam_of(k, g) for k in CAMS})))
        if not R.check('找得到 G11（ggShop 或 FN_G11）', bool(g), ''): await b.close(); return
        for part, fn in (('EXT', part_ext), ('SIGN', part_sign), ('VIEWS', part_views), ('INT', part_int), ('STAIRS', part_stairs), ('FPS', part_fps)):
            if part not in PARTS: continue
            try: await fn(pg, cdp, g)
            except Exception as e:
                R.check('[%s] 沒有中斷' % part, False, repr(e)[:300]); await D.shot(pg, 'fns_exc_%s' % part.lower(), judge_black=False)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
