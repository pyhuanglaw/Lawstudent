"""CC（帳號 A）11-10：FN_int——花序 Flower Notes 室內第 1 版（X325；開發分支 201803df0＝含 2a7edffd5「花序室內」LAWWW2 033f083db A 件；BB 22:37）。Playwright（PC GPU）≠ iPhone。
這一版有：區域 flower_notes（src/flower_notes3d.js：兩層 NavGrid，1F y 0、2F y 3.9；樓梯沿東牆往北爬 x 3.5～4.9、z 1.4→−5.32，兩層共用）、
  公館 G11 門口「進入花序」（FN3.hookGongguan：(G11 中心 x, 21) r 2.2 → spawn (0, 6.1) 面向 −z）、一樓門口「離開花序」(0, 6.6) r 1.3 → 公館 (G11 x, 18)、
  收銀櫃檯前「買花」kind gg_flower (2.45, 4.4)（還沒接 GIFTH＝「看」）、二樓 12 個座位「坐下」（seats1）。配置 src/data/flower_notes_layout.js（FLOWER_NOTES_LAYOUT；家具阻擋＝FN3.blocks(L,lv)）。
  還沒有：外觀（B 件）、舊花攤拿掉、買花、店員（2a7edffd5 commit 訊息）。
探針從遊戲讀 FLOWER_NOTES_LAYOUT／FN3（這一版的名字）；之後的版本改名字就要改這裡。
PARTS（逗號分隔；預設全部，照下面的順序跑；前一段沒跑就用觸控補前置）：
  OLD     公館：舊花攤（kind gg_flower 互動點、場景物件 gg_flower_stall*）還在不在——照實記（這一版預期還在），不算 FAIL。
  DOOR    【前置】讀檔公館 2025-11-01 14:00 站在 G11 前面的人行道 (G11 x, 14.5) → 搖桿走到「進入花序」→ 按 → 進店（站得住）→ 搖桿走到「離開花序」→ 按 →
          回到公館：離「進入花序」≤3.5 m、站得住、搖桿往街上推得動 ≥1 m；走路途中沒有跳（兩次取樣位移 > max(2.5, 6×秒) m）；walkFallbacks 不增加。之後再搖桿走進去（給後面的段落）。
  LOOP    一樓：①導航格掃描：房間裡（離牆 0.35 m 以內不算）每一格被擋住的，都要在家具阻擋（FN3.blocks，外加 0.3 m）或樓梯那一條（x ≥ 欄杆 x−0.3、z ≤ 樓梯底＋0.3）裡＝沒有隱形牆；二樓一樣掃。
          ②搖桿（照 E.pathTo 前方 1.5 m 推）走一圈：入口 → 中央展示台 → 左（永生花）→ 左後（鮮花花束）→ 後（冷藏花櫃）→ 右（收銀）→ 入口；每 0.25 秒取樣，
          人的中心不能進到家具阻擋裡（往內縮 0.15 m 才算進去＝穿過櫃子）；每一站走得到、沒有跳。
  SHOT1   一樓全尺寸（REF_W×REF_H，預設 1672×941＝參考圖 interior_1f.png 的尺寸）：從入口往裡（cam_1f）、樓梯（cam_stairs）、近拍兩張（cam_1f_close_a：永生花層架；cam_1f_close_b：鮮花花台）；
          另外記這一區「同一個幾何用了幾次」（同 geometry 的 mesh 數、InstancedMesh 的 count）前 15 名，給 BB 看是不是同一個複製很多次。
  UP      搖桿走上樓梯到二樓平台 (4.15, −6.05) lv 1，再走到教室中間（lv 1、高度≈3.9）。
  SHOT2   二樓全尺寸：教室（cam_2f，對照 interior_2f.png：後牆「花序」字在中間、黑板在右邊）、近拍兩張（cam_2f_close_a：示範桌上的花；cam_2f_close_b：花器層架）。
  SEAT    二樓座位（SEATS，預設 t3c,t2a）：D.sit_all（觸控點椅子 → 坐下：位置 0.15 m 內、高度＝那一層 → 起身推得動）。
  FPS     店裡站著量 8 秒 requestAnimationFrame：二樓教室（UP 之後）、一樓進門的位置（DOWN 之後）。雲端 SwiftShader 的數字不能當結論。
  DOWN    搖桿走下樓梯到一樓樓梯口 (4.2, 2.0) lv 0，再走回進門的位置。
相機（可調）：CAMS（店裡的座標：x 往東、z 往南〔店面在 +z〕、y 往上；lens＝36 mm 片幅的焦距）；FN_CAMS='{"cam_1f":{"eye":[..],"look":[..],"lens":20}}' 蓋掉。
輸出：fni_<名稱>.png（全尺寸）、fni_cams.json（每張的相機、亮度、尺寸）、fni_loop.json（一圈的取樣）。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=DOOR,LOOP python3 cc_fn_int_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
ALL = ['OLD', 'DOOR', 'LOOP', 'SHOT1', 'UP', 'SHOT2', 'SEAT', 'FPS', 'DOWN']
PARTS = [x.strip().upper() for x in (os.environ.get('PARTS') or ','.join(ALL)).split(',') if x.strip()]
R = L.Run('fn_int', OUT); F.setup(R, OUT)
J = F.J
DAY = os.environ.get('SHOT_DAY') or '2025-11-01'
HOUR = float(os.environ.get('SHOT_HOUR') or 14.0)
REF_W, REF_H = [int(v) for v in (os.environ.get('REF_SIZE') or '1672x941').split('x')]
SEATS = [s for s in (os.environ.get('SEATS') or 't3c,t2a').split(',') if s]
ZONE = 'flower_notes'; Y1 = 3.9
CAMS = {   # 店裡的座標（FLOWER_NOTES_LAYOUT：10×14 m、房間中心在原點、店面 +z）
    'cam_1f':         {'eye': [-0.2, 1.6, 6.75], 'look': [-0.2, 1.9, -7.0], 'lens': 20},     # 參考圖 interior_1f：入口正中往北，展示台在畫面下方中間、樓梯在右後
    'cam_stairs':     {'eye': [1.2, 1.6, 2.6], 'look': [4.2, 2.6, -3.0], 'lens': 22},       # 一樓看樓梯（櫃檯北邊的樓梯口往上）
    'cam_1f_close_a': {'eye': [-2.6, 1.5, 3.7], 'look': [-4.7, 1.4, 3.7], 'lens': 45},      # 近拍：左牆前段永生花層架
    'cam_1f_close_b': {'eye': [-2.4, 1.5, -2.6], 'look': [-4.55, 1.0, -2.6], 'lens': 45},   # 近拍：左牆後段鮮花花台
    'cam_2f':         {'eye': [0.4, Y1 + 1.6, 0.3], 'look': [0.3, Y1 + 1.4, -6.9], 'lens': 20},   # 參考圖 interior_2f：教室南邊（玻璃欄杆內）往後牆看
    'cam_2f_close_a': {'eye': [-0.9, Y1 + 1.6, -3.9], 'look': [-0.9, Y1 + 1.0, -5.5], 'lens': 45},   # 近拍：示範長桌上的花
    'cam_2f_close_b': {'eye': [-3.3, Y1 + 1.6, -4.4], 'look': [-3.3, Y1 + 1.2, -6.7], 'lens': 45},   # 近拍：花器層架
    # FN2（BB 02:57，第 2 版）：中央展示台近拍（花瓣、包裝紙）、櫃台、二樓西牆落地窗（窗外）、黑板
    'cam_display':    {'eye': [-0.4, 1.45, 5.3], 'look': [-0.4, 0.95, 3.5], 'lens': 38},     # 中央展示台 (-0.4,3.5) 3.2×1.5 h0.9，從入口那一側往北
    'cam_display_cl': {'eye': [0.3, 1.35, 4.6], 'look': [-0.4, 0.95, 3.6], 'lens': 60},     # 展示台上的花束（看花瓣、包裝紙）
    'cam_counter':    {'eye': [0.6, 1.55, 4.4], 'look': [3.4, 1.0, 4.4], 'lens': 32},       # 櫃台 x 3.05～3.7、z 2.6～6.2
    'cam_2f_west':    {'eye': [2.6, Y1 + 1.6, -3.2], 'look': [-5.0, Y1 + 1.4, -3.2], 'lens': 24},   # 二樓西牆整面落地窗 z −6.7～0.3（窗外的景）
    'cam_2f_board':   {'eye': [0.6, Y1 + 1.6, -2.6], 'look': [2.0, Y1 + 1.6, -6.9], 'lens': 32},   # 黑板（「看黑板」點 (2.0,−5.6)，二樓）
}
try:
    for k, v in json.loads(os.environ.get('FN_CAMS') or '{}').items(): CAMS.setdefault(k, {'lens': 24}).update(v)
except Exception as e:
    print('FN_CAMS 讀不懂：%r' % e, flush=True)
LOOP = [('入口', 0.0, 5.6), ('中央展示台（南面）', -0.4, 4.75), ('左：永生花', -3.7, 3.6), ('左後：鮮花花束', -3.4, -2.6), ('後：冷藏花櫃', 0.1, -5.5), ('右：收銀', 2.45, 4.4), ('回入口', 0.0, 5.6)]
CAMLOG = []; CTX = {}

LAY_JS = r"""(()=>{ if(typeof FLOWER_NOTES_LAYOUT==='undefined'||typeof FN3==='undefined') return null; const L=FLOWER_NOTES_LAYOUT;
  return {W:L.W, D:L.D, Y1:L.floors[1].y, stair:L.stair, upper:L.upper, spawn:L.spawn, exit:L.exit, b0:FN3.blocks(L,0), b1:FN3.blocks(L,1), seats:L.seats1, looks:L.looks}; })()"""
WALLSCAN_JS = r"""((q)=>{ const E=GAME.E, L=FLOWER_NOTES_LAYOUT, N=E.levels&&E.levels[q.lv]; if(!N) return null; const B=FN3.blocks(L,q.lv), T=L.stair, U=L.upper, p=q.pad, out=[]; let n=0;
  const inB=(x,z)=>B.some(b=>Math.abs(x-b[0])<=b[2]/2+p&&Math.abs(z-b[1])<=b[3]/2+p);
  const inStair=(x,z)=>x>=T.railX-p&&z<=T.zBottom+p;   /* 樓梯那一條：欄杆、樓梯底下、頂端後面、平台、二樓樓梯開口 */
  for(let cz=0;cz<N.rows;cz++) for(let cx=0;cx<N.cols;cx++){ const [x,z]=N.toWorld(cx,cz); if(Math.abs(x)>L.W/2-0.35-p||Math.abs(z)>L.D/2-0.35-p) continue;
    if(q.lv===1&&(z<U.z0+0.35+p||z>U.railZ-0.3-p)) continue; n++; if(!N.blocked(cx,cz)) continue; if(inB(x,z)||inStair(x,z)) continue; out.push([+x.toFixed(2),+z.toFixed(2)]); }
  return {n, bad:out}; })"""
DUP_JS = r"""(()=>{ const E=GAME.E, g=E.zone&&E.zone.group; if(!g) return null; const by={}; let inst=[];
  g.traverse(o=>{ if(!o.isMesh) return; if(o.isInstancedMesh){ inst.push({name:o.name, count:o.count, mat:(o.material&&o.material.name)||''}); return; } const k=o.geometry&&o.geometry.uuid; if(!k) return;
    const e=by[k]||(by[k]={n:0, names:new Set(), mat:(o.material&&o.material.name)||'', tris:o.geometry.index?o.geometry.index.count/3:(o.geometry.attributes.position?o.geometry.attributes.position.count/3:0)}); e.n++; if(e.names.size<4) e.names.add(o.name); });
  const top=Object.values(by).filter(e=>e.n>1).sort((a,b)=>b.n-a.n).slice(0,15).map(e=>({n:e.n, names:[...e.names], mat:e.mat, tris:e.tris|0}));
  inst.sort((a,b)=>b.count-a.count); let meshes=0; g.traverse(o=>{ if(o.isMesh) meshes++; });
  return {meshes, sharedGeom:top, instanced:inst.slice(0,15), formal:!!(E.zone&&E.zone.formal)}; })()"""
NEAR_T_JS = r"""((q)=>{ const E=GAME.E; for(let r=0;r<=q.r+1e-6;r+=0.1) for(let a=0;a<360;a+=15){ const x=q.x+r*Math.sin(a*Math.PI/180), z=q.z+r*Math.cos(a*Math.PI/180); if(E.canStand(x,z,0.3,q.lv)) return {x:+x.toFixed(2),z:+z.toFixed(2),r:+r.toFixed(2)}; } return null; })"""   # 離「目標」最近、站得住的點（D.standable_near 是離「人」最近）
POS_JS = r"""(()=>{ const P=GAME.E.player, o=P.obj.position; return [+o.x.toFixed(3), +o.z.toFixed(3), P.lv|0, +o.y.toFixed(2), GAME.G.zone]; })()"""


async def near_t(pg, x, z, lv, r=1.0):
    return await pg.evaluate("(%s)(%s)" % (NEAR_T_JS, J({'x': x, 'z': z, 'lv': lv, 'r': r}))) or {'x': x, 'z': z}


def cam(name):
    c = CAMS[name]; return {'eye': c['eye'], 'look': c['look'], 'lens': c.get('lens', 24)}


async def full_shot(pg, cdp, name, c, label):
    """全尺寸（REF_W×REF_H）、藏 HUD 和玩家、獨立相機（D.CAM：暫停＋cinematic、照新鏡頭重算牆淡出／樓層顯示），page.screenshot 算亮度；拍完換回 844×390"""
    await pg.set_viewport_size({'width': REF_W, 'height': REF_H}); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()"); await pg.evaluate(D.HUD + '(false)')
    cc = await pg.evaluate(D.CAM, c); await pg.wait_for_timeout(700); await pg.evaluate("GAME.E.render()")
    m = await D.shot(pg, name)
    await pg.evaluate(D.UNCAM); await pg.evaluate(D.HUD + '(true)'); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()")
    await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(900)
    CAMLOG.append({'file': name + '.png', 'label': label, 'cam': cc, 'size': [REF_W, REF_H], 'lum': m})
    json.dump(CAMLOG, open(os.path.join(OUT, 'fni_cams.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    R.note('[截圖] %s（%s）：鏡頭 %s、亮度 %s' % (name, label, J(cc), J(m)))


class Sampler:
    def __init__(self, pg): self.pg = pg; self.s = []; self.ev = asyncio.Event(); self.t = None

    async def _run(self):
        t0 = time.time()
        while not self.ev.is_set():
            try: self.s.append([round(time.time() - t0, 2)] + await self.pg.evaluate(POS_JS))
            except Exception: pass
            await asyncio.sleep(0.25)

    def __enter__(self): self.t = asyncio.ensure_future(self._run()); return self

    async def stop(self): self.ev.set(); await self.t; return self.s

    def __exit__(self, *a): self.ev.set()


def inside(samples, blocks, lv, shrink=0.15):
    bad = []
    for s in samples:
        if s[3] != lv or s[5] != ZONE: continue
        for b in blocks:
            if abs(s[1] - b[0]) < b[2] / 2 - shrink and abs(s[2] - b[1]) < b[3] / 2 - shrink: bad.append({'t': s[0], 'at': [s[1], s[2]], 'block': b}); break
    return bad


async def street(pg, cdp, why):
    await D.load_zone(pg, cdp, 'gongguan', DAY, HOUR, 46.5, 14.5, math.pi, 0, wait=7000)
    door = await door_of(pg)
    if door and abs(door['x'] - 46.5) > 0.3:   # G11 的實際 x（FN3.hookGongguan 照樓房位置）
        await D.load_zone(pg, cdp, 'gongguan', DAY, HOUR, door['x'], 14.5, math.pi, 0, wait=7000)
    R.setup('【前置／捷徑】讀檔公館 %s %05.2f（晴，關條件事件）站在 G11 前面的人行道（%s）' % (DAY, HOUR, why))
    return door


async def door_of(pg):
    exs = await pg.evaluate(F.EXITS_JS)
    return next((e for e in exs if e['to'] == ZONE and not e['hidden']), None) or next((e for e in exs if '花序' in e['label']), None)


async def joy_door(pg, cdp, tag, door):
    r = await F.joy_to(pg, cdp, tag, door['x'], door['z'], near=min(0.9, door['r'] * 0.5), lv=door['lv'], max_s=90)
    s = await F.wait_btn(pg, door['label'], 5)
    ok = s['interact'].startswith(door['label']) and not r['jumps']
    R.check('%s 搖桿走到「%s」，按鈕是它（%s 秒、推 %d 次、沒有跳）' % (tag, door['label'], r['t'], r['pushes']), ok, J({'end': [s['x'], s['z']], 'btn': s['interact'], 'jumps': r['jumps'], 'why': r.get('why')}))
    if not ok: await F.shot(pg, cdp, 'fni_nobtn_%s' % tag.strip('[]').lower())
    return ok


async def go_in(pg, cdp, tag, joy=True):
    """在公館：走到「進入花序」按下去；回傳店裡的狀態"""
    door = await door_of(pg)
    if not R.check('%s 公館 G11 門口有「進入花序」（exit → %s）' % (tag, ZONE), bool(door), J(await pg.evaluate(F.EXITS_JS))): return None
    CTX['door'] = door
    if joy:
        if not await joy_door(pg, cdp, tag, door): return None
        await L.tap(pg, cdp, '#interact'); await D.wait_zone(pg, cdp, ZONE); await pg.wait_for_timeout(2500); s = await D.st(pg)
        R.check('%s 按「%s」進到 %s、站得住' % (tag, door['label'], ZONE), s['zone'] == ZONE and s['stand'], J(s))
    else:
        s = await D.use_exit(pg, cdp, tag, door['label'], ZONE)
    if not s or s['zone'] != ZONE: return None
    CTX['spawn'] = [s['x'], s['z']]
    return s


async def ensure_in(pg, cdp, tag):
    if (await D.st(pg))['zone'] == ZONE: return True
    await street(pg, cdp, '%s 的前置' % tag)
    s = await go_in(pg, cdp, tag + '【前置】', joy=True)   # 搖桿進門（觸控點地板在騎樓柱子旁邊常常要 1～3 分鐘才點到，雲端 SwiftShader）
    return bool(s)


async def ensure_lv(pg, cdp, tag, lv):
    if not await ensure_in(pg, cdp, tag): return False
    if (await D.st(pg))['lv'] == lv: return True
    return await (part_up if lv == 1 else part_down)(pg, cdp, tag + '【前置】')


async def part_old(pg, cdp):
    tag = '[OLD]'
    await D.load_zone(pg, cdp, 'gongguan', DAY, HOUR, -44.6, 13.2, math.pi, 0, wait=7000)
    fl = await pg.evaluate("(%s)(%s)" % (F.LIST_FLOWER_JS, J(F.FLOWER_KIND)))
    o = F.OLD_STALL
    ob = await pg.evaluate("(%s)(%s)" % (F.OBJ_NEAR_JS, J({'x0': o['cx'] - o['w'] / 2, 'x1': o['cx'] + o['w'] / 2, 'z0': o['cz'] - o['d'] / 2, 'z1': o['cz'] + o['d'] / 2})))
    still = bool([x for x in fl if math.hypot(x['x'] - o['cx'], x['z'] - o['cz']) < 4]) or ob['stallObj'] or ob['ggf'] > 0
    R.note('%s 舊花攤「晨露花舖」%s（照實記，這一版預期還在）：公館 gg_flower 互動點 %s；場景物件 gg_flower_stall* %s、ggf_* 材質的物件 %d 個' % (tag, '還在' if still else '不在了', J(fl), ob['stallObj'], ob['ggf']))
    await F.shot(pg, cdp, 'fni_old_stall', {'eye': [o['cx'], 2.2, 18.2], 'look': [o['cx'], 0.9, o['cz']], 'lens': 24})


async def part_door(pg, cdp, tag='[DOOR]'):
    door = await street(pg, cdp, '進出')
    fb0 = (await D.st(pg))['fb']
    s = await go_in(pg, cdp, tag, joy=True)
    if not s: return
    await F.shot(pg, cdp, 'fni_door_in')
    lay = CTX.get('lay') or {}
    ex = next((e for e in await pg.evaluate(F.EXITS_JS) if e['to'] == 'gongguan' and not e['hidden']), None)
    if not R.check('%s 店裡有「離開花序」（→ gongguan）' % tag, bool(ex), J(await pg.evaluate(F.EXITS_JS))): return
    await F.joy_to(pg, cdp, tag, 0.0, 3.5, near=0.6, max_s=40)   # 先往店裡走幾步（進門就站在出口範圍裡，不算「走出來」）
    if not await joy_door(pg, cdp, tag, ex): return
    await L.tap(pg, cdp, '#interact'); await D.wait_zone(pg, cdp, 'gongguan'); await pg.wait_for_timeout(2500); s = await D.st(pg)
    door = CTX['door']; dd = math.hypot(s['x'] - door['x'], s['z'] - door['z'])
    await F.shot(pg, cdp, 'fni_door_back')
    R.check('%s 出來回到公館、離「進入花序」%.2f m（≤3.5）、站得住' % (tag, dd), s['zone'] == 'gongguan' and dd <= 3.5 and s['stand'], J(s))
    p0 = (s['x'], s['z']); r = await F.joy_to(pg, cdp, tag, s['x'], s['z'] - 3.0, near=0.5, max_s=30, straight=True)
    mv = math.hypot(r['end']['x'] - p0[0], r['end']['z'] - p0[1])
    R.check('%s 出來以後搖桿往街上推得動 %.2f m（≥1，不卡牆、沒有跳）' % (tag, mv), mv >= 1.0 and not r['jumps'], J({'end': [r['end']['x'], r['end']['z']], 'jumps': r['jumps']}))
    R.check('%s walkFallbacks 沒有增加' % tag, (await D.st(pg))['fb'] == fb0, '')
    R.note('%s（給後面的段落）再搖桿走進去' % tag)
    await go_in(pg, cdp, tag + '（再進去）', joy=True)


async def part_loop(pg, cdp):
    tag = '[LOOP]'
    if not await ensure_lv(pg, cdp, tag, 0): return
    lay = CTX['lay']
    for lv in (0, 1):
        w = await pg.evaluate("(%s)(%s)" % (WALLSCAN_JS, J({'lv': lv, 'pad': 0.3})))
        R.check('%s %dF 導航格：房間裡被擋住的格子都在家具／樓梯那一條裡（沒有隱形牆；掃 %s 格，可疑 %d 格）' % (tag, lv + 1, w and w['n'], len(w['bad']) if w else -1), bool(w) and not w['bad'], J(w and w['bad'][:40]))
    fb0 = (await D.st(pg))['fb']; allS = []
    for name, x, z in LOOP:
        tgt = await near_t(pg, x, z, 0)
        with Sampler(pg) as sp:
            r = await F.joy_to(pg, cdp, tag, tgt['x'], tgt['z'], near=0.6, lv=0, max_s=90)
            ss = await sp.stop()
        allS += ss; pen = inside(ss, lay['b0'], 0)
        R.check('%s 搖桿走到「%s」(%.1f, %.1f)（%s 秒、推 %d 次、沒有跳、沒有穿過家具）' % (tag, name, tgt['x'], tgt['z'], r['t'], r['pushes']), r['ok'] and not r['jumps'] and not pen,
                J({'end': [r['end']['x'], r['end']['z'], r['end']['lv']], 'why': r.get('why'), 'jumps': r['jumps'], 'pen': pen[:5]}))
        if not r['ok']: await F.shot(pg, cdp, 'fni_loop_stuck_%s' % name.split('：')[0])
    json.dump(allS, open(os.path.join(OUT, 'fni_loop.json'), 'w', encoding='utf-8'))
    R.check('%s walkFallbacks 沒有增加' % tag, (await D.st(pg))['fb'] == fb0, '')


async def part_shot1(pg, cdp):
    tag = '[SHOT1]'
    if not await ensure_lv(pg, cdp, tag, 0): return
    for nm, lb in tuple((k, l) for k, l in (('cam_display', 'FN2 一樓中央展示台'), ('cam_display_cl', 'FN2 展示台上的花（花瓣、包裝紙）'), ('cam_counter', 'FN2 櫃台')) if os.environ.get('FN2') == '1') + (('cam_1f', '一樓從入口往裡（對照 interior_1f.png）'), ('cam_stairs', '樓梯'), ('cam_1f_close_a', '一樓近拍：永生花層架'), ('cam_1f_close_b', '一樓近拍：鮮花花台')):
        await full_shot(pg, cdp, 'fni_%s' % nm[4:], cam(nm), lb)
    d = await pg.evaluate(DUP_JS)
    R.note('%s 這一區的 mesh %s 個（正式模型 %s）；同一個幾何用很多次的（前 15）：%s；InstancedMesh：%s' % (tag, d and d['meshes'], d and d['formal'], J(d and d['sharedGeom']), J(d and d['instanced'])))


async def part_up(pg, cdp, tag='[UP]'):
    if not await ensure_in(pg, cdp, tag): return False
    lay = CTX['lay']; T = lay['stair']
    with Sampler(pg) as sp:
        r = await F.joy_to(pg, cdp, tag, 4.15, -6.05, near=0.6, lv=1, max_s=150)
        ss = await sp.stop()
    ys = [s[4] for s in ss if T['x0'] - 0.1 <= s[1] <= T['x1'] + 0.1]
    R.check('%s 搖桿走上樓梯到二樓平台（lv %s、y %s、%s 秒、沒有跳）' % (tag, r['end']['lv'], r['end'].get('y'), r['t']), r['ok'] and r['end']['lv'] == 1 and abs((r['end'].get('y') or 0) - lay['Y1']) < 0.3 and not r['jumps'],
            J({'end': r['end'], 'why': r.get('why'), 'jumps': r['jumps'], 'stairY': ys[:: max(1, len(ys) // 12)]}))
    if not r['ok']: await F.shot(pg, cdp, 'fni_up_stuck'); return False
    tgt = await near_t(pg, -0.8, -2.0, 1)
    with Sampler(pg) as sp:
        r = await F.joy_to(pg, cdp, tag, tgt['x'], tgt['z'], near=0.6, lv=1, max_s=90)
        ss = await sp.stop()
    pen = inside(ss, lay['b1'], 1)
    R.check('%s 二樓走到教室中間 (%.1f, %.1f)（%s 秒、沒有跳、沒有穿過桌子）' % (tag, tgt['x'], tgt['z'], r['t']), r['ok'] and r['end']['lv'] == 1 and not r['jumps'] and not pen, J({'end': r['end'], 'why': r.get('why'), 'pen': pen[:5]}))
    return r['ok']


async def part_down(pg, cdp, tag='[DOWN]'):
    if not await ensure_in(pg, cdp, tag): return False
    lay = CTX['lay']
    if (await D.st(pg))['lv'] != 1 and not await part_up(pg, cdp, tag + '【前置】'): return False
    r = await F.joy_to(pg, cdp, tag, 4.2, 2.0, near=0.6, lv=0, max_s=150)
    R.check('%s 搖桿走下樓梯到一樓樓梯口（lv %s、y %s、%s 秒、沒有跳）' % (tag, r['end']['lv'], r['end'].get('y'), r['t']), r['ok'] and r['end']['lv'] == 0 and abs(r['end'].get('y') or 0) < 0.1 and not r['jumps'], J({'end': r['end'], 'why': r.get('why'), 'jumps': r['jumps']}))
    if not r['ok']: await F.shot(pg, cdp, 'fni_down_stuck'); return False
    sp0 = CTX.get('spawn') or [lay['spawn']['x'], lay['spawn']['z']]
    r = await F.joy_to(pg, cdp, tag, sp0[0], sp0[1] - 0.5, near=0.6, lv=0, max_s=90)
    R.check('%s 走回進門的位置（%s 秒）' % (tag, r['t']), r['ok'], J({'end': r['end'], 'why': r.get('why')}))
    return r['ok']


async def part_shot2(pg, cdp):
    tag = '[SHOT2]'
    if not await ensure_lv(pg, cdp, tag, 1): return
    for nm, lb in tuple((k, l) for k, l in (('cam_2f_west', 'FN2 二樓西牆落地窗（窗外）'), ('cam_2f_board', 'FN2 黑板')) if os.environ.get('FN2') == '1') + (('cam_2f', '二樓教室（對照 interior_2f.png）'), ('cam_2f_close_a', '二樓近拍：示範桌的花'), ('cam_2f_close_b', '二樓近拍：花器層架')):
        await full_shot(pg, cdp, 'fni_%s' % nm[4:], cam(nm), lb)


async def part_seat(pg, cdp):
    tag = '[SEAT]'
    if not await ensure_lv(pg, cdp, tag, 1): return
    seats = [q for q in CTX['lay']['seats'] if q['id'] in SEATS]
    R.note('%s 坐這幾張：%s' % (tag, J(seats)))
    res = await D.sit_all(pg, cdp, tag, 'fni_seat', only=[(q['x'], q['z']) for q in seats])
    R.check('%s %d 張都坐得下、起得來（%s）' % (tag, len(seats), J(res)), len(res) == len(seats) and all(x[1] in ('ok', 'occupied') for x in res), J(res))


async def fps_here(pg, tag, where):
    await pg.wait_for_timeout(3000)
    f = await pg.evaluate("(%s)(8000)" % F.FPS_JS)
    s = await D.st(pg)
    R.note('%s %s（%s, %s lv %s）8 秒：%s（雲端 SwiftShader 不當結論）' % (tag, where, s['x'], s['z'], s['lv'], J(f)))
    R.check('%s %s 量得到幀率' % (tag, where), f['frames'] > 0, J(f))


async def main():
    sha = os.environ.get('SHA', '')[:9]
    print('CC FN_int（花序室內）：PARTS %s；SHA %s；全尺寸 %dx%d；Playwright ≠ iPhone' % (','.join(PARTS), sha, REF_W, REF_H), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        lay = await pg.evaluate(LAY_JS)
        if not R.check('這一版有花序室內（FLOWER_NOTES_LAYOUT、FN3）', bool(lay), ''): await b.close(); return
        CTX['lay'] = lay
        steps = [('OLD', part_old), ('DOOR', part_door), ('DOOR2', lambda pg_, cdp_: part_door(pg_, cdp_, '[DOOR 第 2 次（門口樹、花箱不擋）]')), ('LOOP', part_loop), ('SHOT1', part_shot1), ('UP', part_up), ('SHOT2', part_shot2), ('SEAT', part_seat)]
        for part, fn in steps:
            if part not in PARTS: continue
            try: await fn(pg, cdp)
            except Exception as e:
                R.check('[%s] 沒有中斷' % part, False, repr(e)[:300]); await D.shot(pg, 'fni_exc_%s' % part.lower(), judge_black=False)
        try:
            if 'FPS' in PARTS and (await D.st(pg))['zone'] == ZONE and (await D.st(pg))['lv'] == 1: await fps_here(pg, '[FPS]', '二樓')
            if 'DOWN' in PARTS: await part_down(pg, cdp)
            if 'FPS' in PARTS and await ensure_lv(pg, cdp, '[FPS]', 0): await fps_here(pg, '[FPS]', '一樓')
        except Exception as e:
            R.check('[FPS/DOWN] 沒有中斷', False, repr(e)[:300]); await D.shot(pg, 'fni_exc_down', judge_black=False)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
