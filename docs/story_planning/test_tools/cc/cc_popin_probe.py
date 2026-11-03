# -*- coding: utf-8 -*-
"""CC（帳號 A）11-03：PERF-ZONE-POPIN-1103「進場景先出現方塊、卡一下才換正式模型；溫州街從咖啡廳出來腳踏車自己在動」的畫面探針。
修正（開發分支 b924d5678＋8206aa67a，f8d129d51 有）：
  src/assets3d.js:297  A.reqStart／A.reqTake：換區域時記下區域建立當下 ASSETS.loadOne 要的 key（A._req，loadOne 第 303 行 add）
  src/assets3d.js:298-302  A.waitLoaded(keys,cap)：只等 type 'building'、還沒進 A.cache、A.status 有 promise 的；Promise.race 對上 setTimeout(cap)（第 300 行）；
                       載好以後再等一個 setTimeout 0，讓區域自己的 .then（接上正式模型、藏起備用方塊）先跑
  src/game3d.js:224   GM.ZONE_LOAD_WAIT_MS=6000（最多等 6 秒）
  src/game3d.js:225   GAME.enter：fade(true) → reqStart → E.loadZone → reqTake（GM._zoneReq）→ … → GM.lastZoneWait=await ASSETS.waitLoaded(GM._zoneReq,6000) → Z3.prewarm → fade(false)
  淡入＝#fade（index.html:52-53，黑底 opacity transition .45s；class on＝全黑）。主迴圈（game3d.js frame）等待時照跑：E.update 照樣推騎士（E.extras）——
  程式沒有設計「淡入前腳踏車不動」，所以腳踏車那一項預設只記錄（BIKE_STRICT=1 才算 PASS／FAIL）。
修改前對照：0f66c4215（沒有 reqStart／waitLoaded：第一次去的地方預期淡入時方塊還在）。

不是 iPhone：雲端是 Playwright 手機模擬（SwiftShader，每秒 1～4 格），只驗證探針會跑；正式看要排到使用者 PC（gpu_wrap.py、CC_HEADLESS=0 開視窗用顯示卡）。
兩個場景都照玩家走（觸控）：
  classroom    【前置】讀檔到法律系館A（linze）二樓迴廊、201 門前約 2 m（週六 10:00、條件事件關掉）→ 點地面／搖桿走到門口 → 按互動鈕「進入 201 階梯教室」
  wz_cafe_out  【前置】讀檔到兩點半 Café 店裡（14:00、條件事件關掉）→ 走到門口 → 按互動鈕「離開咖啡廳」→ 溫州街
每個場景從按下互動鈕那一刻（t=0）起：
  · 頁面裡每 100 ms 取樣一次（setInterval；SwiftShader 主執行緒忙時會拉長，時間戳是實際的）：G.zone、E.zone、GAME.isEntering、#fade 的 opacity／class、
    這一區要的正式模型（包住 ASSETS.loadOne 記下 t=0 以後要的 building key）載好沒（ASSETS.cache）、方塊備用看不看得到、腳踏車（GAME.extras 的騎士）和 NPC 的位置、E.frame。
    f8d1 以後另記 GAME._zoneReq、GAME.lastZoneWait。
  · Python 每 BURST_MS（預設 150）截一張，連拍 BURST_S 秒（預設 8），每張記時間戳和當下的取樣。
方塊備用怎麼判斷（讀 src/zones3d.js）：
  classroom：E.zone.group 裡名字 'fallback' 的群組（zones3d.js 1418 行：程序化畫面全放進去；attachRoomGLB 1566 行 fb.visible=false、z.formal=true）
  wenzhou：區域群組的直接子物件帶 userData.wzApt／wzJp／wzProp／wzPark（套件公寓、日式宿舍、街道細節、小公園）而還沒 formal（attachWenzhouModel 1225 行把它們藏起來、標 formal），
           加上 'wz_kit_scooters'（套件機車，正式機車模型載入後整組藏起來）
判斷（每項一行 PASS／FAIL）：
  ① 觸發換區成功（G.zone 變成目標）
  ② 有淡入：#fade 先到全黑（opacity ≥ 0.99）、之後回到 0
  ③ 淡入結束那一刻（#fade 全黑或掛上 class on 以後，第一個 opacity ≤ 0.01 且沒有 class on 的取樣），這一區要的正式模型全部載好（pending＝0）
  ④ 淡入結束那一刻，方塊備用看不到（可見的套件數＝0）
  ⑤ 黑畫面（opacity > 0.5）不超過 BLACK_MAX（預設 6.5 秒）——雲端 SwiftShader 建區域＋Z3.prewarm 就要十幾秒，這一項在雲端會 FAIL，以 PC（顯示卡）的結果為準
  ⑥ 腳踏車：淡入結束以前（區域建好後到淡入結束）騎士移動距離——只記錄；BIKE_STRICT=1 時 > 0.05 m 算 FAIL
  ⑦ 沒有 JS 例外
用法：  CASES=classroom,wz_cafe_out LW_TESTS=<工作樹>/tests SHA=<sha> python3 cc_popin_probe.py <URL index.html> <輸出資料夾>
環境變數：CASES、BURST_S（8）、BURST_MS（150）、SAMPLE_MS（100）、MAX_S（取樣最長，預設 60）、BLACK_MAX（6.5）、BIKE_STRICT（0）、WARM（讀檔後等幾毫秒，預設 8000）
輸出：<輸出>/<case>/NNN_tXXXXX.png（t＝毫秒）、<輸出>/<case>.json（取樣、截圖紀錄、判斷用的數字）。最後一行 ALL PASS 或 FAILED n，exit 0／1。"""
import os, sys, json, math, time, asyncio

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
ENVF = lambda k, d: float(os.environ.get(k, str(d)))
CASES = [c.strip() for c in os.environ.get('CASES', 'classroom,wz_cafe_out').split(',') if c.strip()]
BURST_S = ENVF('BURST_S', 8); BURST_MS = ENVI('BURST_MS', 150); SAMPLE_MS = ENVI('SAMPLE_MS', 100); MAX_S = ENVF('MAX_S', 60)
BLACK_MAX = ENVF('BLACK_MAX', 6.5); BIKE_STRICT = os.environ.get('BIKE_STRICT', '0') == '1'; WARM = ENVI('WARM', 8000)
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'zheNoodleDone': True,
         'lawclub': True, 'wenzhouLine': True, 'fundsV2': 1, 'KX_FIRST_MSG': True}

#   case: (讀檔區域, 讀檔位置, 時間, 目標區域, 互動字開頭, 走到哪個互動點附近（找互動點用的字）, 說明)
SCN = {
    'classroom': ('linze', {'x': -2.0, 'z': -4.3, 'lv': 1, 'yaw': math.pi}, 10.0, 'classroom', '進入 201', '第一次進教室：法律系館A 二樓 201 門口外 → 走到門口 → 按「進入 201 階梯教室」'),
    'wz_cafe_out': ('cafe', {'x': 0.0, 'z': 2.6, 'lv': 0, 'yaw': 0.0}, 14.0, 'wenzhou', '離開咖啡廳', '溫州街從咖啡廳出來：Café 店裡 → 走到門口 → 按「離開咖啡廳」'),
}

# ---------------------------------------------------------------- 頁面裡的取樣器（只讀；包住 ASSETS.loadOne 只記錄、照原樣呼叫）
SAMPLER = r"""(([ms,target])=>{ const W=window.__POP={t0:performance.now(),target,s:[],req:{},pre:{}};
  const A=ASSETS; if(!window.__POPW){ window.__POPW=1; const l0=A.loadOne; A.loadOne=function(key){ const P=window.__POP; const r=l0.apply(this,arguments);
      if(P&&!(key in P.req)){ const m=A.manifest[key]||{}; const rec=P.req[key]={t:Math.round(performance.now()-P.t0),type:m.type||null,cachedAtReq:!!A.cache[key],done:null,err:null};
        Promise.resolve(r).then(()=>{ rec.done=Math.round(performance.now()-P.t0); },e=>{ rec.err=String(e&&e.message||e); rec.done=Math.round(performance.now()-P.t0); }); }
      return r; }; }
  for(const k of Object.keys(A.manifest)) if((A.manifest[k]||{}).type==='building') W.pre[k]=!!A.cache[k];
  const fade=document.getElementById('fade');
  const kit=()=>{ const E=GAME.E, z=E.zone; if(!z||!z.group) return null; const id=(z.def&&z.def.id)||z.id; const out={zone:id,formal:z.formal===undefined?null:!!z.formal,vis:0,tot:0,names:[]};
    const anyVis=o=>{ if(!o.visible) return false; if(o.isMesh||o.isSprite) return true; let v=false; o.traverse(c=>{ if(v||c===o) return; if((c.isMesh||c.isSprite)&&c.visible){ let p=c, ok=true; while(p&&p!==o){ if(!p.visible){ ok=false; break; } p=p.parent; } if(ok) v=true; } }); return v; };
    if(id==='classroom'){ let fb=null; z.group.traverse(o=>{ if(!fb&&o.name==='fallback') fb=o; }); out.tot=fb?1:0; if(fb&&anyVis(fb)){ out.vis=1; out.names.push('fallback'); } return out; }
    if(id==='wenzhou'){ for(const c of z.group.children){ const u=c.userData||{}; const tag=u.wzApt?'wzApt':u.wzJp?'wzJp':u.wzProp?'wzProp':u.wzPark?'wzPark':null;
        if(tag){ out.tot++; if(!u.formal&&anyVis(c)){ out.vis++; if(out.names.length<12) out.names.push(tag+':'+(c.name||'')); } } }
      let sc=null; z.group.traverse(o=>{ if(!sc&&o.name==='wz_kit_scooters') sc=o; }); if(sc){ out.tot++; if(anyVis(sc)){ out.vis++; out.names.push('wz_kit_scooters'); } } return out; }
    return out; };
  const pos=o=>o&&o.position?[+o.position.x.toFixed(2),+o.position.z.toFixed(2)]:null;
  const tick=()=>{ try{ const E=GAME.E, G=GAME.G, cs=fade?getComputedStyle(fade):null; const now=performance.now()-W.t0;
      const req=Object.keys(W.req).filter(k=>W.req[k].type==='building'); const pend=req.filter(k=>!A.cache[k]);
      W.s.push({t:Math.round(now),gz:G.zone,ez:E.zone?((E.zone.def&&E.zone.def.id)||E.zone.id):null,ent:!!(GAME.isEntering&&GAME.isEntering()),
        op:cs?+(+cs.opacity).toFixed(3):null,on:!!(fade&&fade.classList.contains('on')),fr:E.frame|0,paused:!!E.paused,
        req:req.length,pend:pend.length,pendK:pend.slice(0,8),kit:kit(),
        zr:Array.isArray(GAME._zoneReq)?GAME._zoneReq.filter(k=>(A.manifest[k]||{}).type==='building'):null,lzw:GAME.lastZoneWait||null,
        bikes:(GAME.extras||[]).filter(x=>x&&x.rider).map(x=>pos(x.obj)).slice(0,4),npcs:(E.npcs||[]).slice(0,4).map(n=>pos(n.obj)),
        pl:pos(E.player&&E.player.obj)}); }catch(e){ W.s.push({t:Math.round(performance.now()-W.t0),err:String(e&&e.message||e)}); } };
  tick(); W.iv=setInterval(tick,ms); return {pre:Object.keys(W.pre).filter(k=>W.pre[k])}; })"""
STOP = "(()=>{ const W=window.__POP; if(!W) return null; clearInterval(W.iv); return {s:W.s,req:W.req,target:W.target}; })()"
LAST = "(()=>{ const W=window.__POP; if(!W||!W.s.length) return null; const x=W.s[W.s.length-1]; return Object.assign({now:Math.round(performance.now()-W.t0)},x); })()"
INFO = """(()=>{ const E=GAME.E, G=GAME.G, o=E.player.obj.position; const it=document.getElementById('interact'), lb=document.getElementById('interactLabel');
  return {gz:G.zone, ez:E.zone?((E.zone.def&&E.zone.def.id)||E.zone.id):null, x:+o.x.toFixed(2), z:+o.z.toFixed(2), lv:E.player.lv|0, hour:+(+G.hour).toFixed(2),
    loading:!document.getElementById('loading').classList.contains('hide'),
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?((lb&&lb.textContent)||'').trim():null}; })()"""


class Case:
    def __init__(self, name):
        self.name = name; self.dir = os.path.join(OUT, name); os.makedirs(self.dir, exist_ok=True)
        self.fails = []; self.notes = []; self.shots = []; self.extra = {}

    def check(self, label, ok, info=''):
        print(('PASS ' if ok else 'FAIL ') + '%s：%s%s' % (self.name, label, ('  ' + info) if info else ''), flush=True)
        if not ok: self.fails.append(label)
        return ok

    def setup(self, s):
        print('  [前置／捷徑] %s：%s' % (self.name, s), flush=True); self.notes.append('[前置／捷徑] ' + s)

    def note(self, s):
        print('  %s：%s' % (self.name, s), flush=True); self.notes.append(s)


async def wait_zone(pg, zid, max_s):
    t0 = time.time()
    while time.time() - t0 < max_s:
        i = await pg.evaluate(INFO)
        if i['gz'] == zid and i['ez'] == zid and not i['loading']: return True
        await pg.wait_for_timeout(500)
    return False


async def free(pg, cdp):
    for _ in range(10):
        try: await L.phone_away(pg, cdp, tries=2)
        except Exception: pass
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if await L.close_panels(pg, cdp): continue
        break


def dist(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1]) if a and b else None


def analyse(cs, S, target):
    """S＝取樣；回傳判斷用的數字"""
    S = [x for x in S if 'err' not in x]
    out = {'n': len(S)}
    if not S: return out
    i_zone = next((i for i, x in enumerate(S) if x['gz'] == target and x['ez'] == target), None)
    i_black = next((i for i, x in enumerate(S) if x['op'] is not None and x['op'] >= 0.99), None)
    # 淡入開始＝第一個全黑的取樣，或 #fade 掛上 class on 的取樣（SwiftShader 主執行緒卡住時 CSS transition 沒走完，getComputedStyle 一直是 0、class on 已經掛上；
    #   0f66 溫州街就是這樣：沒有一格到全黑、區域建好時 class on 已經拿掉＝方塊直接露出來。之前只認 opacity≥0.99，淡入結束算不出來，③④ 判不了）
    i_on = next((i for i, x in enumerate(S) if (x['op'] is not None and x['op'] >= 0.99) or x['on']), None)
    i_end = None
    if i_on is not None:
        i_end = next((i for i in range(i_on, len(S)) if S[i]['op'] is not None and S[i]['op'] <= 0.01 and not S[i]['on'] and S[i]['ez'] == target), None)
    out.update(i_zone=i_zone, t_zone=S[i_zone]['t'] if i_zone is not None else None, t_black=S[i_black]['t'] if i_black is not None else None, t_on=S[i_on]['t'] if i_on is not None else None,
               t_fade_end=S[i_end]['t'] if i_end is not None else None)
    # 黑畫面（opacity > 0.5）總長：取樣之間用前一個取樣的值
    blk = 0; run0 = None; longest = 0
    for a, b in zip(S, S[1:]):
        if a['op'] is not None and a['op'] > 0.5:
            blk += b['t'] - a['t']; run0 = (run0 or 0) + (b['t'] - a['t']); longest = max(longest, run0)
        else: run0 = 0
    out['black_ms'] = blk; out['black_longest_ms'] = longest
    if i_end is not None:
        e = S[i_end]; out['at_end'] = {k: e.get(k) for k in ('t', 'gz', 'ez', 'op', 'on', 'req', 'pend', 'pendK', 'kit', 'zr', 'lzw', 'fr')}
        # 淡入以後 2 秒內有沒有方塊或還沒載好（看得到的跳換）
        aft = [x for x in S[i_end:] if x['t'] <= e['t'] + 2000]
        out['after2s_kit_max'] = max([(x['kit'] or {}).get('vis', 0) for x in aft] or [0])
        out['after2s_pend_max'] = max([x['pend'] for x in aft] or [0])
    # 什麼時候正式模型全部載好、方塊全部藏起來（區域建好以後）
    if i_zone is not None:
        z = S[i_zone:]
        out['t_all_loaded'] = next((x['t'] for x in z if x['pend'] == 0 and x['req'] > 0), None)
        out['t_kit_hidden'] = next((x['t'] for x in z if x['kit'] and x['kit'].get('vis', 0) == 0), None)
        # 腳踏車／NPC：區域建好那一格 → 淡入結束 → 最後一格
        def mv(key):
            seq = [x[key] for x in z if x.get(key)]
            if not seq or not seq[0]: return None
            first, last = seq[0], seq[-1]; k = min(len(first), len(last))
            pre = None
            if i_end is not None:
                pe = S[i_end].get(key) or []; kk = min(len(first), len(pe)); pre = max([dist(first[j], pe[j]) or 0 for j in range(kk)] or [0])
            return {'n': len(first), 'first': first, 'at_fade_end': S[i_end].get(key) if i_end is not None else None, 'last': last,
                    'moved_before_fade_end_m': None if pre is None else round(pre, 3), 'moved_total_m': round(max([dist(first[j], last[j]) or 0 for j in range(k)] or [0]), 3)}
        out['bikes'] = mv('bikes'); out['npcs'] = mv('npcs')
    return out


async def burst(cs, pg, t_tap):
    """t_tap（Python 時間）起連拍 BURST_S 秒，每 BURST_MS 一張；每張記取樣器的最後一筆"""
    k = 0
    while True:
        due = t_tap + k * BURST_MS / 1000.0
        if due - t_tap > BURST_S: break
        if time.time() < due: await asyncio.sleep(due - time.time())
        t0 = time.time(); rel = int((t0 - t_tap) * 1000)
        fn = '%03d_t%05d.png' % (k, rel); p = os.path.join(cs.dir, fn)
        try: await pg.screenshot(path=p, timeout=15000)
        except Exception as e: cs.note('截圖失敗 %s %r' % (fn, e)); p = None
        t1 = time.time()
        try: last = await pg.evaluate(LAST)
        except Exception as e: last = {'err': repr(e)}
        cs.shots.append({'file': os.path.relpath(p, OUT) if p else None, 'k': k, 't_ms': rel, 'shot_ms': int((t1 - t0) * 1000), 'sample': last})
        k = max(k + 1, int((time.time() - t_tap) * 1000 / BURST_MS))   # 截圖比間隔慢就跳過那幾格（時間戳照實記）


async def run_case(p, name):
    cs = Case(name); errs = []; b = None
    zone0, pos, hour, target, label, desc = SCN[name]
    try:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not cs.check('遊戲載入', await L.wait_loaded(pg)): return cs, errs
        st = {'name': '祐廷', 'stage': 'law', 'zone': zone0, 'hour': hour, 'day': 8, 'weekday': 6, 'weather': 'clear', 'pos': pos,
              'flags': dict(FLAGS), 'events': {'done': {}, 'last': {}, 'count': 0}}
        cs.setup('%s；讀檔（GAME.applySave）到 %s (%.1f, %.1f, 第 %d 層) %.0f:00、週六、條件事件和手機自動打開關掉（只看畫面，不演劇情）' % (desc, zone0, pos['x'], pos['z'], pos['lv'], hour))
        await L.load_state(pg, st, quiet_events=True, quiet_phone=True)
        if not cs.check('讀檔到 %s' % zone0, await wait_zone(pg, zone0, 180)): return cs, errs
        await pg.wait_for_timeout(WARM); await free(pg, cdp)
        it = await L.find_it(pg, label)
        if not cs.check('找到互動點「%s…」' % label, bool(it), J(it)): return cs, errs
        i0 = await pg.evaluate(INFO); cs.note('讀檔後 %s；互動點 %s' % (J(i0), J(it)))
        # 照玩家走到門口（點地面，走不動才推搖桿）
        await L.turn_camera_to(pg, cdp, it['x'], it['z'])
        ok = await L.go_to(pg, cdp, L.Run(name, cs.dir), it['x'], it['z'], max(0.5, min(it['r'] - 0.3, 1.0)), label, max_s=240, lv=it['lv'])
        lab = None
        for _ in range(40):
            lab = (await pg.evaluate(INFO))['interact']
            if lab and lab.startswith(label): break
            await pg.wait_for_timeout(500)
        if not cs.check('走到門口、互動鈕是「%s…」' % label, bool(lab and lab.startswith(label)), J({'go_to': ok, 'interact': lab, 'at': await pg.evaluate(INFO)})): return cs, errs
        pre = await pg.evaluate(SAMPLER, [SAMPLE_MS, target])
        cs.extra['preloaded_building'] = pre['pre']
        cs.note('按鈕以前已經在快取的正式模型（building）%d 個：%s' % (len(pre['pre']), J(pre['pre'])))
        t_tap = time.time()
        await L.tap(pg, cdp, '#interact')
        await burst(cs, pg, t_tap)
        # 連拍以後再等到淡入結束（或 MAX_S）
        while time.time() - t_tap < MAX_S:
            last = await pg.evaluate(LAST)
            if last and last.get('ez') == target and not last.get('ent') and (last.get('op') or 0) <= 0.01 and last['now'] > 2000: break
            await pg.wait_for_timeout(300)
        await pg.wait_for_timeout(1500)
        R = await pg.evaluate(STOP)
        A = analyse(cs, R['s'], target)
        tgt_keys = sorted(k for k, v in R['req'].items() if v['type'] == 'building')
        cs.extra.update(analysis=A, req=R['req'], samples=R['s'])
        cs.note('t=0 以後要的正式模型（building）%d 個：%s' % (len(tgt_keys), J({k: {kk: R['req'][k][kk] for kk in ('t', 'cachedAtReq', 'done', 'err')} for k in tgt_keys})))
        if name == 'classroom' and 'bldg.classroom_201' in pre['pre']:
            cs.note('注意：bldg.classroom_201 在按鈕以前已經載好（不是第一次載入，這次看不出等待）')
        cs.note('數字：%s' % J({k: v for k, v in A.items() if k not in ('bikes', 'npcs')}))
        cs.note('腳踏車 %s；NPC %s' % (J(A.get('bikes')), J(A.get('npcs'))))
        cs.check('① 觸發換區成功（G.zone、E.zone＝%s）' % target, A.get('i_zone') is not None, 't_zone=%s ms' % A.get('t_zone'))
        cs.check('② 有淡入（先全黑、再回到透明）', A.get('t_black') is not None and A.get('t_fade_end') is not None,
                 't_black=%s ms、class on=%s ms、t_fade_end=%s ms' % (A.get('t_black'), A.get('t_on'), A.get('t_fade_end')))
        e = A.get('at_end') or {}
        kit = e.get('kit') or {}
        cs.check('③ 淡入結束時，這一區要的正式模型都載好了（pending 0）', bool(e) and e.get('req', 0) > 0 and e.get('pend') == 0,
                 'pending=%s／%s %s；全部載好 t=%s ms；淡入結束 t=%s ms；lastZoneWait=%s' % (e.get('pend'), e.get('req'), J(e.get('pendK')), A.get('t_all_loaded'), A.get('t_fade_end'), J(e.get('lzw'))))
        cs.check('④ 淡入結束時，方塊備用看不到（可見 0）', bool(e) and kit.get('tot', 0) > 0 and kit.get('vis') == 0,
                 '可見 %s／%s %s；方塊全部藏起來 t=%s ms；淡入後 2 秒內可見最多 %s、pending 最多 %s' % (kit.get('vis'), kit.get('tot'), J(kit.get('names')), A.get('t_kit_hidden'), A.get('after2s_kit_max'), A.get('after2s_pend_max')))
        cs.check('⑤ 黑畫面（opacity>0.5）≤ %.1f 秒' % BLACK_MAX, A.get('black_ms') is not None and A['black_ms'] <= BLACK_MAX * 1000 and A.get('t_fade_end') is not None,
                 '黑 %.2f 秒（最長連續 %.2f 秒）' % ((A.get('black_ms') or 0) / 1000, (A.get('black_longest_ms') or 0) / 1000))
        bk = A.get('bikes')
        if bk:
            mvd = bk.get('moved_before_fade_end_m')
            msg = '騎士 %d 個：區域建好 %s → 淡入結束 %s（移動最多 %s m）→ 最後 %s（共 %s m）' % (bk['n'], J(bk['first']), J(bk['at_fade_end']), mvd, J(bk['last']), bk['moved_total_m'])
            if BIKE_STRICT: cs.check('⑥ 淡入結束以前腳踏車沒有動（≤0.05 m）', mvd is not None and mvd <= 0.05, msg)
            else: cs.note('⑥ INFO（程式沒有設計淡入前凍結騎士，只記錄）：' + msg)
        else:
            cs.note('⑥ INFO：這一區沒有騎腳踏車的人（GAME.extras 沒有 rider）')
        cs.check('⑦ 沒有 JS 例外', not errs, J(errs[:3]))
        cs.note('連拍 %d 張（%s 秒內），截圖每張平均 %d ms' % (len(cs.shots), BURST_S, int(sum(s['shot_ms'] for s in cs.shots) / max(1, len(cs.shots)))))
    except Exception as ex:
        cs.check('探針執行', False, repr(ex)[:400])
    finally:
        o = dict(case=name, url=URL, sha=os.environ.get('SHA', '?'), headless_env=os.environ.get('CC_HEADLESS'), notes=cs.notes, fails=cs.fails, shots=cs.shots,
                 js_errors=list(errs)[:20], **cs.extra)
        json.dump(o, open(os.path.join(OUT, name + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        if b is not None:
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    return cs, errs


async def main():
    os.makedirs(OUT, exist_ok=True); fails = 0
    async with async_playwright() as p:
        for c in CASES:
            print('==== CASE %s（SHA %s）====' % (c, os.environ.get('SHA', '?')), flush=True)
            if c not in SCN:
                print('FAIL CASE %s 不認得（%s）' % (c, ','.join(SCN)), flush=True); fails += 1; continue
            cs, _ = await run_case(p, c); fails += len(cs.fails)
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(CASES), flush=True)
    print('ALL PASS' if not fails else 'FAILED %d' % fails, flush=True)
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
