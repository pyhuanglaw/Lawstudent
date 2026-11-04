"""CC（帳號 A）11-04：BUG-CARD-BOHAN-WALK-1103 瀏覽器探針（BB；f606 的 walkFallbacks=1）。
BB 的描述：9/11（四）13:10 classroom，劇情自動走路從 (−0.75, 0.40) 到 (−0.75, −1.10) 卡 4 秒（柏翰「第一排」卡片那一段）。
修正：1ec7c8634（src/game3d.js GM.walkTo：開頭遇到 seat＋frozen＋pose sit 先 standUp 再走；tests/walk_seated_standup_unit.js）。對照：d2b962a3f。
讀程式（1ec7c8634）找到的那一段：
  (−0.75, −1.10)＝story3d.js:3769 classScene（法律系「第二天」的民總劇情課：網拍相機）`GM.walkTo(P, 第 1 排(row 1)第 3 個.x, .z+0.6)`；
    整個 src 只有 classScene 會叫玩家走到這一點（events3d.js player_seat 沒有事件用）。柏翰卡片 ev_card_bohan（events.js 4998，trigger class、
    beforeClass 民總、weeks [2]）本身沒有走路——卡住當下 EVENTS.running 是它，是因為兩段同時在演。
  (−0.75, 0.40)＝classroom 第 2 排(row 2)第 3 個座位＝CLS.seatPick「坐中間的位子」（第一次上這門課；48 個座位的中心最近、同距離取先排到的）。
  classScene 是 S.onEnter('classroom') 開始的：條件 `!isEcon && 週四 && !F.classDone && 12:30～15:12`，**沒有查 mainDay===2**；
    9/4（主線第二天）那一堂沒演到（classDone 沒設）的局，9/11 第 2 週的民總照常用手機「今天」→「直接去上課」→ goClass：
    GM.enter(classroom) → onEnter 開 classScene（玩家開始走向第 1 排）→ 同時 goClass 接著 seatPick 跳「坐哪裡」→ 選「坐中間的位子」
    → seatMenu 自己的 walkTo 蓋掉路線、sitAt 坐下（frozen）→ classScene 那一次 walkTo 還在保險清單裡、人坐著不動 → 4 秒後保險放到 (−0.75,−1.10)。
  ⇒ CC 初判：classScene 叫 walkTo 的那一刻玩家**還沒坐下**（是之後才被 seatMenu 坐下），1ec7c8634 的「walkTo 開頭坐著就先起身」碰不到這條路，
     修正版很可能還是 1。探針把「walkTo 被叫的那一刻 P.pose／frozen／seat」記下來判斷。
CASES（每個一個新瀏覽器；橫向 844×390，ORIENT=port 改直向）：
  goclass  【主：f606 那一條】【前置／捷徑】最小存檔 2025-09-11（四，第 2 週）12:35 在宿舍；MAIN_D1／LAW_START_DAY＝新局的值（9/3、8/29）；
           **classDone 不設**（照 f606 卡住那一刻推回去：9/11 會進 classScene，一定是 9/4 那一堂沒演到）；條件事件照常開著（卡片要能觸發）。
           玩家：手機「今天」→ 民法總則「直接去上課」→「坐哪裡」選「坐中間的位子」→ 對話點下去、選項照第一個沒變暗的（卡片：「你真的量過？」）。
  sit      【BB 字面的那一條，對照】【前置／捷徑】同一份存檔但 classDone＝true（9/4 正常演過）、12:52 讀到 201 門口；
           玩家：走到第 2 排正中間 (−0.75,0.40) 那個座位後面、按「坐下」→ 選「上課：民法總則」→ 等上課、點對話。預期：沒有 classScene、沒有走路、
           卡片照常播、walkFallbacks 0（這一條兩個版本都該是 0：證明「自己走過去坐下」不會叫劇情走路，問題只在 goClass＋classScene 同時演）。
  goclass_done（不在預設裡）goclass 那一條但 classDone＝true：證明 9/4 演過的正常局，9/11 不會重演 classScene。
CLASSDONE=0／1 可以蓋掉每個 case 的 classDone。SAVE=<存檔.json>：改用那份存檔（深拷貝、改到 9/11 那個時間地點，旗標照它的；classDone 照 case）。
每個 case 記：GAME.walkFallbacks（開始／結束）、window.__wf（遊戲的 console.warn「walkTo 卡住」那一行＋當下 P.pose、P.frozen、P.seat、E.cam.mode、
  EVENTS.running、classNow）、GAME.walkTo 每一次（誰、起點、終點、**被叫那一刻**的 pose／frozen／seat、走完的位置）、GAME.sitAt、玩家狀態變化軌跡。
截圖：坐下、卡片出現、classScene 開始走、走完（或卡住）、結束。
判斷（BB 11-04，LAWWW 根因修正 4cb41c3a0，合進 a8c485729：classScene 四處加 mainDay===2；過了第 2 天沒上＝classDone＋classAnswer absent）：
  ① GAME.walkFallbacks＝0；② 9/11 只上一般課：classScene 沒叫玩家走到 (−0.75,−1.10)、沒有網拍相機劇情課的台詞（GAME.say 參數＋對話框；CS_LINES）。
  修正版（a8c485729）兩項都要 PASS；對照組（3139e7b68）goclass 預期 ② FAIL（重演）、① 多半也 FAIL（walkFallbacks 1）；還是 1＝印 __wf 那一行與當下的 pose／frozen／cam.mode。
不是 iPhone：Playwright 手機模擬（is_mobile、觸控；雲端 SwiftShader 1～4 fps，這支只給 PC 跑）。URL 不加 ?turbo（有的話拿掉）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=goclass,sit] [CLASSDONE=0|1] [SAVE=…] python3 cc_bohan_card_walk_probe.py '<URL>/index.html' <輸出資料夾>
每項一行 PASS／FAIL，最後 ALL PASS 或 FAILED n；exit 0／1。"""
import os, sys, json, asyncio, time, math, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
URL = URL.replace('?turbo&', '?').replace('&turbo', '').replace('?turbo', '')
SHA = os.environ.get('SHA', '?')
LAND = os.environ.get('ORIENT', 'land') != 'port'
CASES = [c.strip() for c in os.environ.get('CASES', 'goclass,sit').split(',') if c.strip()]
SAVE = os.environ.get('SAVE', '')
CLASS_S = int(os.environ.get('CLASS_S', '1500'))
J = lambda o: json.dumps(o, ensure_ascii=False, default=str)
FAILS = []
DAY_KEY = '2025-09-11'
SEAT2 = (-0.75, 0.40)      # 第 2 排(row 2)第 3 個座位＝「坐中間的位子」
WALK_TO = (-0.75, -1.10)   # classScene：第 1 排(row 1)第 3 個座位後面 0.6 m
# 網拍相機那一堂劇情課（story3d.js classScene，a8c485729:3771）的台詞；src 裡只有 classScene 有這三句（git grep a8c485729 -- src 各 1 處）
CS_LINES = ('今天不上進度，先問你們的直覺。', '網拍上標價一千元的相機', '民法一五四條')
SPEC = {'goclass': dict(zone='dorm', h=12 + 35 / 60, classDone=False, via='phone'),
        'sit': dict(zone='classroom', h=12 + 52 / 60, classDone=True, via='walk'),
        'goclass_done': dict(zone='dorm', h=12 + 35 / 60, classDone=True, via='phone')}


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def setup(s): print('  [前置／捷徑] ' + s, flush=True)
def note(s): print('  ' + s, flush=True)


BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'ZHE_W1_CAMP': True, 'ZHE_W1_DORM': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True,
         'LAW_RECAP_SEEN': True, 'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore', 'classroom', 'campus', 'dorm')

# 遊戲的 console.warn('walkTo 卡住 → 放到目的地', 誰, [現在位置], '→', [終點])（game3d.js updateWalks）：沿用 cc_friends606_probe 的寫法，多記當下 P.pose／frozen／seat／cam.mode
WARN_INIT = r"""(()=>{ const w0=console.warn.bind(console); window.__wf=[]; console.warn=function(...a){ try{ if(typeof a[0]==='string'&&a[0].indexOf('walkTo 卡住')===0){
  const GM=(typeof GAME!=='undefined')?GAME:null, G=GM&&GM.G, E=GM&&GM.E, Pl=E&&E.player;   /* GAME 是最外層 const、不在 window 上 */
  window.__wf.push({who:a[1], at:a[2], to:a[4], d:(typeof CALENDAR!=='undefined'&&G)?CALENDAR.dateOf(G.day).key:(G&&G.day), h:G&&+(+G.hour).toFixed(3), zone:G&&G.zone, lv:Pl?Pl.lv|0:null,
    pose:Pl&&Pl.pose, idlePose:Pl&&Pl.idlePose, frozen:!!(Pl&&Pl.frozen), seat:Pl&&Pl.seat?{x:Pl.seat.x,z:Pl.seat.z,row:Pl.seat.row,col:Pl.seat.col}:null, busy:!!(Pl&&Pl.busy),
    cam:E&&E.cam?E.cam.mode:null, wfBefore:GM?(GM.walkFallbacks|0):null, ev:(typeof EVENTS!=='undefined'&&EVENTS.running)||null, classNow:!!(G&&G.flags&&G.flags.classNow),
    dlg:(()=>{ const e=document.getElementById('dlgText'); return e?e.textContent.slice(0,40):null; })(), ms:Math.round(performance.now())}); } }catch(e){} return w0(...a); }; })()"""

HOOK = r"""(()=>{ if(window.__BW) return 'again'; const W=window.__BW={log:[],trace:[]};
  const GM=GAME, E=GAME.E; const r2=v=>Math.round(v*100)/100;
  const pos=e=>e&&e.obj?[r2(e.obj.position.x),r2(e.obj.position.z)]:null;
  const who=e=>e===E.player?'player':((e&&(e.charId||e.name||e.id))||'npc');
  const seatOf=e=>e&&e.seat?{x:e.seat.x,z:e.seat.z,row:e.seat.row,col:e.seat.col}:null;
  const base=()=>{ let h=null; try{ h=+(+GAME.G.hour).toFixed(3); }catch(e){} return {ms:Math.round(performance.now()),h,wf:GM.walkFallbacks|0,ev:(typeof EVENTS!=='undefined'&&EVENTS.running)||null,cam:E.cam&&E.cam.mode}; };
  const push=(o,a)=>{ a.push(Object.assign(base(),o)); if(a.length>4000) a.splice(0,1500); };
  const w0=GM.walkTo; GM.walkTo=function(ent,x,z,opts){ const id=W.log.length; push({k:'walkTo',id,who:who(ent),from:pos(ent),to:[r2(x),r2(z)],pose:ent&&ent.pose,frozen:!!(ent&&ent.frozen),seat:seatOf(ent),stack:(new Error().stack||'').split('\n').slice(2,5).map(s=>s.trim().slice(0,120))},W.log);
    const pr=w0.apply(this,arguments); try{ pr.then(v=>push({k:'walkDone',id,who:who(ent),v,at:pos(ent),to:[r2(x),r2(z)],pose:ent&&ent.pose,frozen:!!(ent&&ent.frozen)},W.log)); }catch(e){} return pr; };
  const s0=GM.sitAt; GM.sitAt=function(ent,seat){ push({k:'sitAt',who:who(ent),seat:seat?{x:seat.x,z:seat.z,row:seat.row,col:seat.col}:null,from:pos(ent)},W.log); return s0.apply(this,arguments); };
  const y0=GM.say; GM.say=function(w,t){ try{ push({k:'say',n:(w&&(w.charId||w.name))||(typeof w==='string'?w:''),t:String(t==null?'':t).slice(0,80)},W.log); }catch(e){} return y0.apply(this,arguments); };
  const u0=GM.standUp; GM.standUp=function(ent){ push({k:'standUp',who:who(ent),from:pos(ent),pose:ent&&ent.pose,frozen:!!(ent&&ent.frozen)},W.log); return u0.apply(this,arguments); };
  let last=''; setInterval(()=>{ try{ const Pl=E.player, F=GAME.G.flags||{}; const o={zone:GAME.G.zone,p:pos(Pl),pose:Pl.pose,frozen:!!Pl.frozen,seat:seatOf(Pl),path:!!(Pl.path&&Pl.path.length),busy:!!Pl.busy,classNow:!!F.classNow,classDone:!!F.classDone};
    const k=JSON.stringify([o.zone,o.p&&o.p.map(v=>Math.round(v*4)),o.pose,o.frozen,o.seat&&o.seat.row,o.path,o.busy,o.classNow,o.classDone,base().ev,base().cam]); if(k!==last){ last=k; push(o,W.trace); } }catch(e){} },250);
  return {walkTo:typeof w0==='function',sitAt:typeof s0==='function',standUp:typeof u0==='function',say:typeof y0==='function'}; })()"""
PSTATE = r"""(()=>{ const E=GAME.E, Pl=E.player, F=GAME.G.flags||{}, r2=v=>Math.round(v*100)/100;
  return {p:[r2(Pl.obj.position.x),r2(Pl.obj.position.z)],pose:Pl.pose,frozen:!!Pl.frozen,seat:Pl.seat?{x:Pl.seat.x,z:Pl.seat.z,row:Pl.seat.row,col:Pl.seat.col}:null,
    cam:E.cam&&E.cam.mode,wf:GAME.walkFallbacks|0,zone:GAME.G.zone,h:+(+GAME.G.hour).toFixed(3),classNow:!!F.classNow,classDone:!!F.classDone,classAnswer:F.classAnswer||null,
    card:!!F.FRIEND_CARD_classmate_bohan,cardDone:!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_card_bohan),
    mainDay:(typeof STORY!=='undefined'&&STORY.mainDay)?STORY.mainDay(GAME.G):null,MAIN_D1:F.MAIN_D1,LAW_START_DAY:F.LAW_START_DAY}; })()"""
CIVIT = r"""(()=>{ const G=GAME.G; const it=CLS.dayItems(G,G.day).find(i=>i.c.id==='civ_general'&&!i.exam); if(!it) return null;
  return {key:it.key,t0:it.t0,t1:it.t1,zone:it.room&&it.room.zone,room:it.room&&it.room.name,week:it.week,story:!!CLS.storyClass(G,it),st:CLS.status(G,it),done:!!CLS.rec(G).done[it.key]}; })()"""
NEAR_SEAT = r"""(()=>{ const E=GAME.E, p=E.player.obj.position; let b=null, bd=1e9; for(const q of E.interactables){ if(!q.seat||q.hidden) continue; const d=Math.hypot(q.x-p.x,q.z-p.z); if(d<bd){ bd=d; b=q; } }
  return b?{x:b.seat.x,z:b.seat.z,row:b.seat.row,col:b.seat.col,ix:b.x,iz:b.z,d:+bd.toFixed(2),label:b.label}:null; })()"""
SEAT_IT = r"""(([x,z])=>{ const q=GAME.E.interactables.find(i=>i.seat&&Math.abs(i.seat.x-x)<0.05&&Math.abs(i.seat.z-z)<0.05); return q?{ix:q.x,iz:q.z,y:q.y,label:q.label,r:q.radius}:null; })"""


def pick(opts, prefs):
    for pf in prefs:
        for i, o in enumerate(opts):
            if not o['dim'] and o['t'].startswith(pf): return i
    for i, o in enumerate(opts):
        if not o['dim']: return i
    return 0


def dist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1]) if a and b else 99.0


async def state_at(pg, key, h, zone, class_done):
    d = await P.day_of(pg, key)
    nf = await pg.evaluate("({m:STORY.MAIN_D1_NEW, l:STORY.LAW_D0})")
    if SAVE:
        with open(SAVE, encoding='utf-8') as f: sv = json.load(f)
        st, d = await P.base(pg, sv, key, h, zone)
    else:
        st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': dict(BASEF)}
        st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None, weather='clear', stage='law', money=30000)
        st['visited'] = {z: True for z in VISITED}
        st['courses'] = {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {}, 'grades': {}}
        st['flags']['MAIN_D1'] = nf['m']; st['flags']['LAW_START_DAY'] = nf['l']
    fl = st.setdefault('flags', {})
    for k in ('classNow', 'FRIEND_CARD_classmate_bohan'): fl.pop(k, None)
    if class_done: fl['classDone'] = True
    else: fl.pop('classDone', None)
    ev = st.setdefault('events', {}).setdefault('done', {}); ev.pop('ev_card_bohan', None)
    return st, d, nf


async def phone_tab(pg, cdp, tab):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(900)


async def one(p, case):
    sp = SPEC[case]; tag = case
    cdone = sp['classDone'] if os.environ.get('CLASSDONE', '') == '' else os.environ.get('CLASSDONE') == '1'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=LAND)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'case': case, 'sha': SHA, 'classDone_set': cdone}; n = [0]; shots = {}

    async def shot(lab, once=True):
        if once and lab in shots: return shots[lab]
        n[0] += 1; fp = os.path.join(OUT, 'bw_%s_%02d_%s.png' % (case, n[0], lab))
        try: await pg.screenshot(path=fp)
        except Exception as e: note('截圖失敗 %r' % e)
        shots[lab] = fp; return fp
    try:
        await pg.add_init_script(WARN_INIT)
        await pg.goto(URL); ok = await L.wait_loaded(pg); check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg)
        st, d, nf = await state_at(pg, DAY_KEY, sp['h'], sp['zone'], cdone)
        await L.load_state(pg, st, quiet_phone=True); await pg.wait_for_timeout(4000)
        try: await L.phone_away(pg, cdp, tries=2)
        except Exception: pass
        setup('%s：%s讀到 %s（星期 %s，%s 第 %s 週）%.2f 時 %s；MAIN_D1=%s LAW_START_DAY=%s；classDone=%s；條件事件照常開著，只關「要回覆的訊息自動打開手機」'
              % (tag, ('存檔 %s 改日期地點、' % SAVE) if SAVE else '最小存檔', d['key'], d['wd'], d['term'], d['week'], sp['h'], sp['zone'],
                 st['flags'].get('MAIN_D1'), st['flags'].get('LAW_START_DAY'), cdone))
        check('%s：%s 是週四、大一上第 2 週（柏翰卡片 weeks [2]）' % (tag, d['key']), d['wd'] == 4 and d['week'] == 2 and d['term'] == 'Y1S1', J(d))
        hk = await pg.evaluate(HOOK); rec['hooks'] = hk
        check('%s：記錄鉤子掛上（GAME.walkTo／sitAt／standUp）' % tag, isinstance(hk, dict) and all(hk.values()), J(hk))
        ps0 = await pg.evaluate(PSTATE); rec['start'] = ps0; note('%s：開始 %s' % (tag, J(ps0)))
        civ = await pg.evaluate(CIVIT); rec['civ'] = civ
        check('%s：今天有民法總則（不是劇情課 storyClass；%s）' % (tag, J(civ)), bool(civ) and not civ['story'])
        if not civ: raise RuntimeError('no civ_general')
        # ---- 去上課 ----
        if sp['via'] == 'phone':
            await L.close_panels(pg, cdp); await phone_tab(pg, cdp, 'today')
            sel = '#phoneBody [data-go="%s"]' % civ['key']
            btn = await pg.evaluate("(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })", sel)
            check('%s：手機「今天」有民法總則的「直接去上課」（%s）' % (tag, btn), bool(btn))
            if not btn: await shot('no_go_btn'); raise RuntimeError('no go button')
            await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500); note('%s：手機「今天」→ 民法總則「%s」（玩家按）' % (tag, btn))
        else:
            si = await pg.evaluate(SEAT_IT, list(SEAT2)); rec['seat_it'] = si
            check('%s：第 2 排正中間 %s 有「坐下」互動點' % (tag, J(SEAT2)), bool(si), J(si))
            if not si: raise RuntimeError('no seat')
            await L.go_to(pg, cdp, L.Run('bw_' + case, OUT), si['ix'], si['iz'] + 0.3, 0.45, '第 2 排正中間座位後面', max_s=420)
            ns = await pg.evaluate(NEAR_SEAT); lab = (await P.ts(pg))['lab']; rec['near_seat'] = ns
            check('%s：走到座位旁邊：互動鍵是「坐下」、最近的座位是 %s' % (tag, J(SEAT2)), lab.startswith('坐下') and ns and dist((ns['x'], ns['z']), SEAT2) < 0.05, J({'lab': lab, 'near': ns}))
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); note('%s：按「坐下」（玩家按）' % tag)
        # ---- 上課：對話點下去、選項照玩家 ----
        t0 = time.time(); chose = []; seen_wf = 0; idle0 = None; stop_why = ''; cs_dlg = []
        while time.time() - t0 < CLASS_S:
            s = await P.ts(pg); ps = await pg.evaluate(PSTATE)
            log = await pg.evaluate("window.__BW.log")
            wf = await pg.evaluate("window.__wf")
            if ps['pose'] == 'sit' and dist(ps['p'], SEAT2) < 0.1 and 'seated' not in shots: await shot('seated'); note('%s：坐在第 2 排正中間 %s（%.2f 時）' % (tag, J(ps['p']), ps['h']))
            if s['txt'] and any(m in s['txt'] for m in CS_LINES) and s['txt'][:30] not in cs_dlg:
                cs_dlg.append(s['txt'][:30]); await shot('class_scene_line'); note('%s：對話框出現網拍相機劇情課的台詞「%s」' % (tag, s['txt'][:40]))
            if (s['running'] == 'ev_card_bohan' or s['txt'].startswith('（民總。第一排')) and 'card' not in shots: await shot('card'); note('%s：柏翰卡片出現（%.2f 時）' % (tag, s['h']))
            cw = [x for x in log if x['k'] == 'walkTo' and x['who'] == 'player' and dist(x['to'], WALK_TO) < 0.05]
            if cw and 'class_walk' not in shots: await shot('class_walk'); note('%s：classScene 叫玩家走 %s（被叫那一刻 pose=%s frozen=%s seat=%s）' % (tag, J(cw[0]['to']), cw[0]['pose'], cw[0]['frozen'], J(cw[0]['seat'])))
            if cw and any(x['k'] == 'walkDone' and x['id'] == cw[0]['id'] for x in log) and 'walk_done' not in shots: await shot('walk_done')
            if len(wf) > seen_wf:
                for x in wf[seen_wf:]: note('%s：遊戲 console「walkTo 卡住」%s' % (tag, J(x)))
                seen_wf = len(wf); await shot('stuck_%d' % seen_wf)
            done = await pg.evaluate("(k=>!!CLS.rec(GAME.G).done[k])(%s)" % J(civ['key']))
            if s['phone'] and not s['dlg'] and not s['ch']: await L.phone_away(pg, cdp, tries=2); continue
            if s['ch']:
                if done: stop_why = '下課後的選單 %s（停在這裡）' % J([o['t'] for o in s['ch']]); break
                await pg.wait_for_timeout(500); s = await P.ts(pg)
                if not s['ch']: continue
                k = pick(s['ch'], ('坐中間的位子', '上課：民法總則', '上課：'))
                chose.append([[o['t'] for o in s['ch']], s['ch'][k]['t'], round(s['h'], 3)])
                note('%s：選單 %s → %s' % (tag, J([o['t'] for o in s['ch']]), s['ch'][k]['t']))
                await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); idle0 = None; continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); idle0 = None; continue
            if done and not s['busy'] and s['depth'] == 0:
                idle0 = idle0 or time.time()
                if time.time() - idle0 > 6: stop_why = '這堂課 done、空下來 6 秒'; break
            else: idle0 = None
            await pg.wait_for_timeout(700)
        note('%s：結束（%s；實際 %d 秒）' % (tag, stop_why or '逾時 CLASS_S=%d' % CLASS_S, time.time() - t0))
        await shot('end', once=False)
        ps1 = await pg.evaluate(PSTATE); rec['end'] = ps1; rec['choices'] = chose
        log = await pg.evaluate("window.__BW.log"); trace = await pg.evaluate("window.__BW.trace"); wf = await pg.evaluate("window.__wf")
        rec['log'] = log; rec['trace'] = trace; rec['wf'] = wf
        civ1 = await pg.evaluate(CIVIT); rec['civ_end'] = civ1
        cw = [x for x in log if x['k'] == 'walkTo' and x['who'] == 'player' and dist(x['to'], WALK_TO) < 0.05]
        cd = [x for x in log if x['k'] == 'walkDone' and cw and x['id'] == cw[0]['id']]
        sits = [x for x in trace if x.get('pose') == 'sit' and dist(x.get('p'), SEAT2) < 0.1]
        note('%s：玩家的 GAME.walkTo %s' % (tag, J([{k2: x.get(k2) for k2 in ('from', 'to', 'pose', 'frozen', 'seat', 'h', 'ev', 'cam')} for x in log if x['k'] == 'walkTo' and x['who'] == 'player'])))
        note('%s：GAME.sitAt／standUp %s' % (tag, J([{k2: x.get(k2) for k2 in ('k', 'who', 'seat', 'from', 'h')} for x in log if x['k'] in ('sitAt', 'standUp')])))
        check('%s：沒有選單沒點、照玩家上完民法總則（done；%s）' % (tag, stop_why or '逾時'), bool(civ1) and civ1['done'] and bool(stop_why), J(civ1))
        check('%s：柏翰卡片播了（ev_card_bohan done、FRIEND_CARD_classmate_bohan）' % tag, ps1['cardDone'] and ps1['card'], J({k2: ps1[k2] for k2 in ('card', 'cardDone')}))
        cs_say = [x['t'] for x in log if x['k'] == 'say' and any(m in x['t'] for m in CS_LINES)]
        rec['class_scene_say'] = cs_say; rec['class_scene_dlg'] = cs_dlg
        if case == 'sit' or (case.startswith('goclass') and not cdone):
            check('%s：坐下：%s坐在 %s（狀態軌跡裡 pose sit）' % (tag, '自己按「坐下」' if case == 'sit' else '「坐中間的位子」', J(SEAT2)), bool(sits), J(sits[:1]))
        if cw:
            c0 = cw[0]; rec['class_walk_call'] = c0
            note('%s：classScene 的 walkTo 被叫那一刻 pose=%s frozen=%s seat=%s；走完 %s' % (tag, c0['pose'], c0['frozen'], J(c0['seat']), J(cd[:1])))
        # ② BB（LAWWW 4cb41c3a0／a8c485729：classScene 只在主線第 2 天）：9/11 只上一般課，不重演網拍相機那一堂劇情課
        check('%s：② 9/11 只有一般課：classScene 沒叫玩家走到 %s、沒有網拍相機劇情課的台詞（%s）' % (tag, J(WALK_TO), '／'.join(CS_LINES)),
              not cw and not cs_say and not cs_dlg, J({'walk': [{k2: x.get(k2) for k2 in ('from', 'to', 'pose', 'frozen', 'h')} for x in cw[:1]], 'say': cs_say[:3], 'dlg': cs_dlg[:3],
                                                      'classDone': ps1['classDone'], 'classAnswer': ps1['classAnswer'], 'mainDay': ps1['mainDay']}))
        check('%s：① GAME.walkFallbacks %s → %s（要 0：劇情自動走路沒有卡 4 秒被放到目的地）' % (tag, ps0['wf'], ps1['wf']), ps1['wf'] == 0 and not wf,
              J([{k2: x.get(k2) for k2 in ('who', 'at', 'to', 'd', 'h', 'zone', 'pose', 'frozen', 'seat', 'cam', 'ev', 'classNow', 'dlg')} for x in wf]))
        for x in wf: note('%s：卡住那一刻 P.pose=%s P.frozen=%s P.seat=%s E.cam.mode=%s EVENTS.running=%s（%s → %s）' % (tag, x.get('pose'), x.get('frozen'), J(x.get('seat')), x.get('cam'), x.get('ev'), J(x.get('at')), J(x.get('to'))))
        note('%s：結束時 P.pose=%s P.frozen=%s E.cam.mode=%s 位置 %s zone=%s %.2f 時 classDone=%s classAnswer=%s' % (tag, ps1['pose'], ps1['frozen'], ps1['cam'], J(ps1['p']), ps1['zone'], ps1['h'], ps1['classDone'], ps1['classAnswer']))
    except Exception as e:
        check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:400]); traceback.print_exc()
        try: await shot('exception', once=False)
        except Exception: pass
    finally:
        check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); rec['errs'] = errs[:5]
        with open(os.path.join(OUT, 'bw_%s_record.json' % case), 'w', encoding='utf-8') as f: json.dump(rec, f, ensure_ascii=False, indent=1, default=str)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('cc_bohan_card_walk_probe  SHA=%s  URL=%s  CASES=%s  SAVE=%s' % (SHA, URL, ','.join(CASES), SAVE or '（沒有）'), flush=True)
    async with async_playwright() as p:
        for c in CASES:
            if c not in SPEC: check('CASE %s 認得' % c, False, '可以用：' + ','.join(SPEC)); continue
            print('==== CASE %s（SHA %s）====' % (c, SHA), flush=True)
            await one(p, c)
    print('SHA', SHA, 'CASES', ','.join(CASES), flush=True)
    print('ALL PASS' if not FAILS else 'FAILED %d' % len(FAILS), flush=True)
    sys.exit(1 if FAILS else 0)


if __name__ == '__main__':
    asyncio.run(main())
