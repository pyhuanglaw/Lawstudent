"""BB-B 11-01：開發分支 d42abd400（LAWWW-B 11-01 合進來的三批）——照玩家在畫面上看、按、截圖。一支用 MODE 分（逗號隔開可以一次跑好幾個，每個 MODE 開一個新的瀏覽器）。
  266af187e AA_208 室友旁白補三處（AA208-L）：events.js ev_y1w_zhe_left／ev_y1w_bh_left（大一寒假 1/2、1/9 人在 203）、story3d.js S.ROOM_MATE_Y2（unboxY2 拆箱以前兩句）
  3c32d5166 「你來過一次」（AA_271、BB_213；ENC-B3-1017）：src/data/solo_before.js、date3d.js S.soloBefore／soloBeforeDue（自由出行去過的地方，第一次和她約會去那裡）
  38163ea91 柏翰大四上推甄前桌燈開到 01:00（AA_208 第 8 節；DORM-Y34）：story3d.js S.bhLateY4、S.dormMates 第 4 欄、S.dormWho
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，2～4 fps）。URL 用 '<URL>/index.html?turbo'（同 fb1101_probe、cbe0429_probe）。
存檔：「最小存檔」（GAME.defaults＋過了開場的旗標，同 fb1101_probe 的 state_at；日子過了就補 ROOM_Y2／Y3／Y4；去過的地方 visited 補齊，手機「地點」才按得到）；
  給第三個參數（或環境變數 SAVE＝使用者存檔.json）＝改用使用者存檔改日期。
每一個讀檔都印 [前置]；讀檔後用遊戲 API 補的（關係、交往）另外寫【捷徑】。頁面裡只「讀」的掛勾（GAME.say 記錄、柏翰狀態每 0.2 秒記一次）不改遊戲狀態，照記。
之後照玩家：點對話、選選項、走到床按「睡覺」→「睡到明天…」、按床「快轉」、手機「地點」→「捷運公館站」「前往」、走到「捷運公館站入口」按下去、
  手機「朋友」→ 她的「約」→「出去玩…」→ 地點 → 日期 → 時間 →「就這樣約」、「現在出發」／「出發：」、站著等（晚上選「再撐一下」）、手指滑鏡頭轉向書桌（跟隨鏡頭）截圖。
  台詞全部用 GAME.say 的原文（HOOK 記 [名字, 句子, 日期, 時間]；旁白的名字＝''）；選單 GAME.choose；日期卡 GAME.titleCard；2D 背景 ADV.begin／setBg。

MODE：
  aa208l   AA_208 室友旁白三處（266af187e）。AA208＝z,znext,b,bnext,y2（預設全部）。存檔都加 DORM_FOUR（新開局的四人房 203：阿哲 L1、柏翰 R1、阿凱 R2）。
            z      [前置] 最小存檔 2026-01-01（大一寒假）22:30 宿舍 203 → 站著 ZB_STAND 秒（1/1 晚上：對照，不該有那兩句）→ 走到床「睡覺」→「睡到明天…」→ 1/2 醒來在 203 → 站著等。
                   PASS：1/2 旁白「（阿哲的籃球不在了。）」一次（名字＝''、日期 2026-01-02）、ev_y1w_zhe_left done；1/1 那段沒有；這一天沒有柏翰那句。
            znext  [前置] 最小存檔 2026-01-03 09:00 宿舍（1/2 沒進房間的人）→ 站著 ZB_CTRL 秒。PASS：沒有阿哲那句、事件沒 done（只有那一天）。
            b      [前置] 2026-01-08 22:30 宿舍 → 站著 → 睡到 1/9 → 站著等。PASS：1/9「（柏翰的床鋪捲起來了，桌上只剩檯燈。）」一次、1/8 晚上沒有、這一天沒有阿哲那句。
            bnext  [前置] 2026-01-10 09:00 宿舍 → 站著。PASS：沒有柏翰那句。
                   （四個都另外記【觀察】旁白當下房間裡的人（E.npcs）、正式模型 Y203_ZHE／BEDDING_R1／Y203_BOHAN_bulb 看不看得見，鏡頭轉向那一組床桌截圖——3D 有沒有跟著旁白，不算 PASS／FAIL）
            y2     大二搬進 312。Y2START＝sleep（預設：[前置] 2026-09-05 22:30 宿舍、沒有 ROOM_Y2 → 床「睡到明天…」→ 9/6 醒來在宿舍＝主線 3 照演）／load（[前置] 直接讀 2026-09-06 10:00 宿舍、沒有 ROOM_Y2）。
                   PASS：「明天開學。今天搬進新的房間。」→ 日期卡「搬到新的房間／三樓 312 號房」→ 緊接著兩句旁白「（312。阿哲的籃球已經滾到門口了，柏翰的檯燈放在靠窗那張書桌上。）」
                         「（另一組床桌是一個大一的學弟，正在跟他媽媽講電話。）」（名字＝''）→ 接著才是「（拿出…）」的選單；拆完「一年。房間比去年滿一點。」、ROOM_Y2＝9/6；
                         頁面的 STORY.ROOM_MATE_Y2 和稿一字不差；之後站著 30 秒不再演。
  encb3    「你來過一次」（3c32d5166）。ENC＝heroine_01,heroine_04（預設；可以 heroine_01,heroine_02,heroine_03,heroine_04,heroine_05,classmate_peishan,kexin），ENC_AGAIN＝第二次約會的人（預設 ENC 第一個；all＝每一個）。
            [前置] 最小存檔 ENC_DAY（預設 2026-03-14，大一下第 3 週週六）15:40 宿舍；【捷徑】ENC 每一位第 5 階（熟 45／信任 30／自在 20／她的戀愛 35，DATE.stageNum＝5；kexin＝交往中）、聯絡方式。
            1 自己去：手機「地點」→「捷運公館站」「前往」→ 走到「捷運公館站入口」按下去 →「西門町」→（會錯過＝「照樣出發」）→ 到了（17:00）→ SOLO_ACT＝movie（預設：「看一場電影」）／none → 「回去」→「直接回宿舍」。
              PASS：到達那一句（FREE_TRIPS D04 arrive[0]）、G.places.free.D04＝1、回到宿舍、還沒有任何 soloSaid。
            2 每一位第一次約會：手機「朋友」→ 她的「約」→「出去玩…」→「臺北市：看展・電影…」→「西門町電影院」→ 明天（不行就後天、大後天）→「17:00 出發」→「就這樣約」
              → 床「快轉」→「現在出發」／「出發：」→ 到了 →（第一個互動點 →「差不多了，回去吧」）。
              PASS：「（西門町電影院。）」之後、她的抵達句之後，旁白「（你來過一次。上次是一個人，從六號出口走出來。）」（字從頁面的 SOLO_BEFORE.narr.D04 讀）、
                    緊接著她的 SOLO_BEFORE.lines[她].D04 每一句（以安＝「你來過？……好。那電影院你帶路。我只記得出口。」，另外和稿的字對）；旁白前面沒有選單；記 G.places.soloSaid["她:D04"]＝那一天。
            3 ENC_AGAIN 的人第二次約會（同一個地方）：PASS：沒有那句旁白、沒有她那幾句、soloSaid 不變。
  dormy34  柏翰大四上推甄前桌燈開到 01:00（38163ea91）。DY＝w5,w13,w13d1,y3（預設；另外可以加 w1d1）。存檔：交換路線 TW（EXCHANGE_ROUTE TW、EXCH_RULE 1）、大四 Y4_PATH＝DY_PATH（預設 other）。
            每一個：[前置] 那一天 23:20 宿舍（ROOM_Y3／ROOM_Y4 照日子補：507／409）→ 走到房間中間走道 → 手指滑鏡頭轉向柏翰的書桌 R1（跟隨鏡頭）→ 站著等（晚上選「再撐一下」），
              頁面裡每 0.2 秒記柏翰的狀態（在不在 E.npcs、坐著、beh、dormBye、位置；只讀）；每個時間點讀 E.npcs、STORY.dormWho／dormMates／bhLateY4、正式模型 Y409_BOHAN_bulb（或 Y507_）的看得見／自發光、z.lightsOffK（只讀）、截圖。
            w5     大四上第 5 週週二。PASS：23:20、23:45、00:30（G.hour 24.5，沒睡覺＝同一個 G.day）柏翰坐在 R1 書桌前（seat≈R1、pose sit）；01:12 不在；
                   【一致性】01:00 起身走到自己的梯子（和 23:30 上舖同一套：dormBye、走到 R1 梯子）——不是在椅子上直接消失。
            w13    大四上第 13 週週三（放榜以後）。PASS：23:20 在、23:45 不在（23:30 起身走到梯子）、00:20 還是不在。
            w13d1  大四上第 13 週週一（第一天）。PASS：23:45 不在；沒睡覺過半夜（G.hour 24.33）也不在——S.bhLateY4 用 G.day−1 看週次（凌晨＝前一天晚上），但沒睡覺時 G.day 沒有加一，會看到第 12 週的週日。
            y3     大三上第 5 週週二（507）。PASS：23:20 在、23:45 不在（走到梯子）、00:20 不在。
            w1d1   （選用）大四上第 1 週週一 2028-09-04：PASS 00:30 還在（同 w13d1 的道理，G.day−1＝9/3 不在學期裡）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> MODE=<mode>[,<mode>...] python3 d42_probe.py '<URL>/index.html?turbo' <輸出資料夾> [使用者存檔.json]
等待上限（秒）都可以用環境變數改：ZB_STAND、ZB_WAIT、ZB_CTRL、Y2_MAX、SOLO_MAX、BOOK_MAX、ENC_MAX、DY_WAIT、WALK_MAX。"""
import os, sys, json, asyncio, re, math, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SAVEF = sys.argv[3] if len(sys.argv) > 3 else os.environ.get('SAVE')
SAVE = None
if SAVEF:
    SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
MODES = [m.strip() for m in os.environ.get('MODE', 'aa208l').split(',') if m.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENV = lambda k, d: [x.strip() for x in os.environ.get(k, d).split(',') if x.strip()]
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
AN, ZQ, BH, ZHE = 'heroine_01', 'heroine_04', 'classmate_bohan', 'zhe'
STAY = ('再撐一下', '先不睡')

# ---------------------------------------------------------------- 存檔（fb1101_probe.py 的做法）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 法律系、過了開場；GAME.defaults 的 dating_kexin:true 拿掉
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
TWF = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}

JSENV = """(()=>{ const G=GAME.G, F=G.flags, D=k=>STORY.dayOfKey(k);
  const STG=id=>(typeof DATE!=='undefined'&&DATE.stageNum)?DATE.stageNum(id):null;
  const LV=(id,f,t,c,o)=>{ const r=SOCIAL.rel(id); r.fam=f; r.trust=t||0; r.comf=c||0; if(o) Object.assign(r,o); SOCIAL.remember(id,'FIRST_MET',''); G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=G.day-30;
    return {id,fam:r.fam,trust:r.trust,comf:r.comf,npcRom:r.npcRom|0,rom:r.rom|0,stage:SOCIAL.stage(id),level:SOCIAL.friendLevel?SOCIAL.friendLevel(id):null,stg:STG(id)}; };
  const NOKX=()=>{ F.dating_kexin=false; if(F.romance) delete F.romance.kexin; F.ROMANCE_HISTORY=(F.ROMANCE_HISTORY||[]).filter(r=>r&&r.id!=='kexin'); delete F.DATED_1_kexin; delete F.KX_TOUR_YES; };
  const DT=id=>{ F['dating_'+id]=true; try{ if(typeof ROM!=='undefined'&&ROM.get){ const r=ROM.get(G,id); if(r&&typeof r==='object') r.status='dating'; } }catch(e){} return !!F['dating_'+id]; };
  const ASK=id=>{ try{ return DATE.canAsk(G,id); }catch(e){ return {err:String(e.message)}; } };
  __BODY__ })()"""


async def state_at(pg, key, h, zone, flags=None, pos=None, weather='clear', money=30000, done=None, drop=()):
    """法律系的存檔：最小存檔（或使用者存檔）改到那一天、那個時間、那一區；key 可以是 'YYYY-MM-DD' 或 [學期, 週, 星期]；drop＝要拿掉的旗標（例：ROOM_Y2）"""
    d = await P.day_of(pg, key)
    if SAVE is not None:
        st = copy.deepcopy(SAVE); st.pop('_stuck', None); st.pop('_busy', None)
        st['invites'] = [v for v in st.get('invites', []) if v.get('state') != 'going']
        F = st.setdefault('flags', {})
    else:
        st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
        F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    for k in drop: F.pop(k, None)
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather=weather, stage='law')
    st['money'] = max(st.get('money') or 0, money)
    v = st.get('visited') if isinstance(st.get('visited'), dict) else {}
    for z in VISITED: v.setdefault(z, True)
    st['visited'] = v
    if done: st.setdefault('events', {'done': {}, 'last': {}, 'count': 0}).setdefault('done', {}).update(done)
    return st, d


async def load(pg, cdp, run, st, label, js=None, quiet=False):
    """[前置] 讀檔（遊戲自己的 GAME.applySave）；js＝讀檔後用遊戲 API 補的【捷徑】，補完 GAME.snapshot() 再讀一次（區域照新狀態重建）。手機自己打開（D103）照玩家收起來"""
    await L.load_state(pg, st, quiet_events=quiet, quiet_phone=False)
    await pg.wait_for_timeout(3500); r = None
    if js:
        r = await pg.evaluate(JSENV.replace('__BODY__', js))
        s2 = await pg.evaluate("()=>GAME.snapshot()")
        await L.load_state(pg, s2, quiet_events=quiet, quiet_phone=False); await pg.wait_for_timeout(3500)
    await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] %s%s%s' % (label, '（quiet_events）' if quiet else '', ('；【捷徑】讀檔後用遊戲 API 補：%s → %s' % (js.strip()[:300], J(r)[:500])) if js else ''))
    return r


# ---------------------------------------------------------------- 記錄（GAME.say、選項、ADV 背景、CG、字幕、日期卡、提示）——只記不改
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>8000) window.__PL.splice(0,2000); }catch(e){} return o; };
  const bgs=b=>typeof b==='string'?b:JSON.stringify(b||null);
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).map(x=>x&&(x.t||x.text)||'').join('｜')}); return c0.apply(this,arguments); };
  if(typeof ADV!=='undefined'&&ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ push({k:'bg',n:'begin',t:bgs(o&&o.background)}); return b0.apply(this,arguments); }; }
  if(typeof ADV!=='undefined'&&ADV.setBg){ const g0=ADV.setBg; ADV.setBg=function(b){ push({k:'bg',n:'setBg',t:bgs(b)}); return g0.apply(this,arguments); }; }
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',n:String(a||''),t:String(b||'')}); return t0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  return 'ok'; })()"""
NAMES = """(id=>{ const s=new Set(); try{ s.add(SOCIAL.displayName(id)); }catch(e){} try{ s.add(SOCIAL.npcName(id)); }catch(e){} const c=(typeof CHARACTERS!=='undefined'&&CHARACTERS[id])||{}; if(c.name) s.add(c.name); if(c.nickname) s.add(c.nickname); return [...s].filter(Boolean); })"""


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = (await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0))
    return [r for r in R if k is None or r['k'] == k]


def said(R):
    return [[r['n'], r['t']] for r in R if r['k'] == 'say']


async def names_of(pg, cid, extra=()):
    return set(await pg.evaluate(NAMES, cid)) | set(extra)


def is_her(r, cid, names):
    return r['k'] == 'say' and (r.get('c') == cid or r['n'] in names)


# ---------------------------------------------------------------- 照玩家操作（fb1101_probe.py）
DECL = ('晚一點', '不去了', '自己走過去', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
FF_OPTS = ('到下一個有事的日子', '到下一個有事的時候')
GO_PREFIX = ('出發：', '直接過去：', '接起來：', '上線：')


def pick_opt(ch, picks=(), ff=True):
    """選哪一個：picks（開頭符合、或包含；照順序）→ 快轉 → 床的選單（快轉，不快轉就睡）→ 起床選單「先起床」→ 婉拒那一類 → 第一個不是「出發：」那一類的"""
    T = [o['t'] for o in ch]; live = [i for i, o in enumerate(ch) if not o['dim']] or list(range(len(ch)))
    for p in picks or ():
        for i in live:
            if T[i].startswith(p) or (len(p) >= 4 and p in T[i]): return i, 'pick'
    if ff:
        for i in live:
            if T[i].startswith(FF_OPTS): return i, 'ff'
    if any(t.startswith(('再撐一下', '先不睡')) for t in T) or (any(t.startswith('睡覺') for t in T) and any(t.startswith('快轉') for t in T)):
        if ff:
            for i in live:
                if T[i].startswith('快轉'): return i, 'ff'
        for w in ('睡到明天', '睡覺', '睡一下', '睡到傍晚', '小睡 2 小時', '小睡'):
            for i in live:
                if T[i].startswith(w): return i, 'sleep'
    for i in live:
        if T[i].startswith('先起床'): return i, 'wake'
    for w in DECL:
        for i in live:
            if T[i].startswith(w): return i, 'decline'
    for i in live:
        if not T[i].startswith(GO_PREFIX) and '存檔' not in T[i]: return i, 'first'
    return live[0], 'first'


async def press_bed(pg, cdp, run):
    bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed: return False
    await L.phone_away(pg, cdp, tries=1)
    await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=150, stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(4):
        await L.phone_away(pg, cdp, tries=1)
        s = await P.ts(pg)
        if s['ch'] or s['dlg']: return True
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1600)
        s = await P.ts(pg)
        if s['ch'] or s['dlg'] or s['busy']: return True
    return False


async def go_place(pg, cdp, run, zone, max_s=120, name=None):
    """手機「地點」→ 那一區的「前往」（name 給了＝那一列，例：捷運公館站）；途中的對話點過去、選單選「前往／直接」那一類。回傳 {ok, why}"""
    await P.phone_tab(pg, cdp, 'places')
    sel = ('#phoneBody [data-place="%s|%s"]' % (zone, name)) if name else ('#phoneBody [data-place^="%s|"]' % zone)
    if not await pg.evaluate("s=>!!document.querySelector(s)", sel):
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
        await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp); return {'ok': False, 'why': txt[:300]}
    await L.tap(pg, cdp, sel); t0 = time.time()
    while time.time() - t0 < max_s:
        await pg.wait_for_timeout(1000); s = await P.ts(pg)
        if s['ch']:
            k, _ = pick_opt(s['ch'], ('前往', '直接'), False); await P.tap_choice(pg, cdp, k); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if s['zone'] == zone and not s['busy']: return {'ok': True, 'at': await P.clock(pg)}
    return {'ok': (await P.ts(pg))['zone'] == zone, 'why': 'timeout'}


async def to_dorm(pg, cdp, run):
    r = await go_place(pg, cdp, run, 'dorm', 90)
    return r['ok']


DUE_SOON = """(()=>{ const G=GAME.G, now=G.day*24+G.hour; let best=null; const c=(t,lab)=>{ if(best==null||t<best.t) best={t,lab}; };
  for(const iv of (G.invites||[])) if(iv.state==='accepted'&&now<iv.day*24+iv.h+0.6) c(iv.day*24+iv.h-0.5,'約：'+iv.who+' '+iv.h);
  try{ for(const q of OUT.rec(G)) if(q.state==='planned'&&now<q.day*24+q.h+0.75){ const tr=OUT.trip?OUT.trip(G,q,true):{}; c(q.day*24+q.h-((tr&&tr.travelH)||q.travelH||0)-0.25,'出遊：'+(q.title||q.id)); } }catch(e){}
  return best?{gap:+(best.t-now).toFixed(2),lab:best.lab}:null; })()"""
DLGFULL = "((GAME.D&&GAME.D.full)||(document.getElementById('dlgText')||{}).textContent||'')"


async def play(pg, cdp, run, until_js=None, max_s=1800, picks=(), tag='', ff=True, shots_at=(), on_line=None):
    """照玩家過日子（fb1101_probe 的 play）：對話點過去、選項照 pick_opt、手機自己打開就收起來、空下來（ff）去床「快轉」；約好的事 1.5 小時內就站著等。
    shots_at＝對話框出現這幾句（包含）就截圖；on_line＝{句子的一段: async 函式}，對話框第一次出現那一句時先呼叫（只讀：數人、看模型）。回傳 until_js 是否成立"""
    t0 = time.time(); idle = 0; last = None; same = 0; waited = None; pend = list(shots_at); nshot = 0; hooks = dict(on_line or {})
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0
        if until_js and free and await pg.evaluate(until_js):
            await pg.wait_for_timeout(1500); s2 = await P.ts(pg)
            if not s2['dlg'] and not s2['ch'] and not s2['busy'] and await pg.evaluate(until_js): return True
            continue
        if s['phone'] and not s['ch'] and not s['dlg']:
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); idle = 0; continue
        if s['ch']:
            sig = (s['day'], s['h'], tuple(o['t'] for o in s['ch'])); same = same + 1 if sig == last else 0; last = sig
            if same > 25:
                run.note('%s：同一個選單點了 25 次沒有反應：%s' % (tag, J(s['ch'])[:400])); await run.shot(pg, tag + '_stuck'); return False
            k, why = pick_opt(s['ch'], picks, ff)
            if why not in ('ff', 'sleep'): run.note('%s %s %.2f 選項 %s → %s' % (tag, (await P.clock(pg))['key'], s['h'], J([o['t'][:22] for o in s['ch']]), s['ch'][k]['t'][:30]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); idle = 0; continue
        if s['dlg']:
            if pend or hooks:
                full = await pg.evaluate(DLGFULL)
                for key in [x for x in hooks if x and x in full]:
                    fn = hooks.pop(key)
                    try: await fn()
                    except Exception as ex: run.note('%s：on_line「%s」出錯 %r' % (tag, key[:20], ex))
                hit = next((x for x in pend if x and x in full), None)
                if hit:
                    await pg.wait_for_timeout(1000); nshot += 1; await run.shot(pg, '%s_line%02d' % (tag, nshot)); pend.remove(hit)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); idle = 0; continue
        if s['busy'] or s['depth'] > 0: await pg.wait_for_timeout(700); continue
        idle += 1
        if idle < 3 or not ff: await pg.wait_for_timeout(1500); continue
        due = await pg.evaluate(DUE_SOON)
        if due and due['gap'] <= 1.5:
            if waited is None or waited[0] != due['lab']: waited = (due['lab'], time.time())
            if time.time() - waited[1] < 420: await pg.wait_for_timeout(2000); continue
            run.note('%s：等「%s」超過 7 分鐘沒有出發提示，照樣快轉' % (tag, due['lab']))
        if s['zone'] != 'dorm' and not await to_dorm(pg, cdp, run):
            run.note('%s：回不了宿舍（%s）' % (tag, s['zone'])); await pg.wait_for_timeout(3000); continue
        if not await press_bed(pg, cdp, run):
            run.note('%s：按不到床（%s）' % (tag, J(await P.clock(pg)))); await run.shot(pg, tag + '_nobed'); return False
        idle = 0
    return False


async def stand(pg, cdp, run, secs, tag, on_line=None, shots_at=()):
    """站著（不快轉、不睡）secs 秒；途中的對話點過去、晚上的床選單選「再撐一下」"""
    await play(pg, cdp, run, None, max_s=secs, ff=False, picks=STAY, tag=tag, on_line=on_line, shots_at=shots_at)


async def wait_h(pg, cdp, run, key, h, max_s, tag, on_line=None):
    """站著等到那一天的 h 點（沒睡覺過了半夜 G.hour 會超過 24：h 可以寫 24.5）。回傳是否等到"""
    d = (await P.day_of(pg, key))['d']
    js = "(GAME.G.day>%d)||(GAME.G.day===%d&&GAME.G.hour>=%.4f)" % (d, d, h)
    return await play(pg, cdp, run, js, max_s=max_s, ff=False, picks=STAY, tag=tag, on_line=on_line)


async def sleep_next(pg, cdp, run, tag, max_s=600, on_line=None, shots_at=()):
    """走到床按「睡覺」→「睡到明天…」→ 隔天醒來空下來。回傳是否到了隔天"""
    c0 = await P.clock(pg)
    if not await press_bed(pg, cdp, run): run.note('%s：按不到床' % tag); return False
    return await play(pg, cdp, run, "GAME.G.day>%d" % c0['day'], max_s=max_s, ff=False, picks=('睡到明天',), tag=tag, on_line=on_line, shots_at=shots_at)


async def phone_inv(pg, cdp, run, cid, tag):
    """手機「朋友」→ 他那一列「約」"""
    await P.phone_tab(pg, cdp, 'friends')
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-personback]')"):
        await L.tap(pg, cdp, '#phoneBody [data-personback]'); await pg.wait_for_timeout(700)
    sel = '#phoneBody [data-inv="%s"]' % cid
    if not await pg.evaluate("s=>!!document.querySelector(s)", sel):
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"); await L.close_panels(pg, cdp)
        return {'ok': False, 'why': '朋友那一列沒有「約」', 'text': txt[:400]}
    await run.shot(pg, tag + '_friends'); await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500)
    return {'ok': True}


EVDONE = "(id=>!!((GAME.G.events||{}).done||{})[id])(%s)"
FLAGV = "(k=>{ const v=GAME.G.flags[k]; return v===undefined?null:v; })"

# ---------------------------------------------------------------- 宿舍房間：人、模型（只讀）
ROOMNPC = """(()=>{ const E=GAME.E, G=GAME.G, P=E.player.obj.position; const U=id=>(typeof DORM_ROOM!=='undefined'?DORM_ROOM.units.find(q=>q.id===id):null);
  const one=n=>{ const p=n.obj.position, A=(n.obj.userData&&n.obj.userData.anim)||{}; return {id:n.charId||n.id||n.name||'路人',name:n.name||null,x:+p.x.toFixed(2),z:+p.z.toFixed(2),y:+p.y.toFixed(2),lv:n.lv|0,
    seat:n.seat?[+(+n.seat.x).toFixed(2),+(+n.seat.z).toFixed(2)]:null,pose:n.pose||null,idlePose:n.idlePose||null,beh:n.beh||null,dorm:n.dorm||null,
    dormGo:n.dormGo!=null?+(+n.dormGo).toFixed(2):null,dormBye:n.dormBye!=null?+(+n.dormBye).toFixed(2):null,hidden:!!n.hidden,visible:n.obj.visible!==false,
    anim:{driver:(n.obj.userData||{}).driver||null,cur:A.cur||null,static:!!A.static,pose:A.pose||null},dMe:+Math.hypot(p.x-P.x,p.z-P.z).toFixed(2)}; };
  let who=null, late=null, mates=null; try{ who=STORY.dormWho(G); }catch(e){ who='ERR '+e.message; } try{ late=STORY.bhLateY4?STORY.bhLateY4(G):'(沒有 STORY.bhLateY4)'; }catch(e){ late='ERR '+e.message; }
  try{ mates=STORY.dormMates(G); }catch(e){ mates='ERR '+e.message; } const T=CALENDAR.termOf(G.day)||{};
  return {key:CALENDAR.dateOf(G.day).key,day:G.day,h:+(+G.hour).toFixed(3),hud:((document.getElementById('dateT')||{}).textContent||'')+' '+((document.getElementById('clockT')||{}).textContent||''),
    zone:G.zone,term:T.id||null,week:T.week||null,who,late,mates,npcs:E.npcs.filter(n=>n&&n.obj).map(one),me:[+P.x.toFixed(2),+P.z.toFixed(2)],
    units:Object.fromEntries(['L1','L2','R1','R2'].map(k=>{ const u=U(k); return [k,u?{seat:[u.seat.x,u.seat.z],ladder:u.sleep}:null]; }))}; })()"""
DORM_LOOK = """(names=>{ const z=GAME.E.zone, R=z&&z.dormRoot; const wv=o=>{ for(let p=o;p;p=p.parent){ if(p.visible===false) return false; } return true; };
  const nodes={}; for(const n of names){ const o=R?R.getObjectByName(n):null; if(!o){ nodes[n]=null; continue; } const mats=[];
    o.traverse(m=>{ if(m.isMesh&&m.material){ for(const q of [].concat(m.material)) if(mats.length<3) mats.push({name:q.name||'',ei:q.emissiveIntensity!=null?+(+q.emissiveIntensity).toFixed(2):null,em:q.emissive?q.emissive.getHexString():null}); } });
    nodes[n]={vis:o.visible!==false,world:wv(o),mats}; }
  const lights=[]; if(z&&z.group) z.group.traverse(o=>{ if(o.isLight&&!o.isAmbientLight&&!o.isHemisphereLight&&!o.isDirectionalLight&&lights.length<8){ const p=new THREE.Vector3(); o.getWorldPosition(p); lights.push({type:o.type,x:+p.x.toFixed(2),y:+p.y.toFixed(2),z:+p.z.toFixed(2),i:+(+o.intensity).toFixed(2),vis:wv(o)}); } });
  return {set:z&&z.dormSetKey||null,glb:!!R,lightsOffK:z&&z.lightsOffK!=null?+z.lightsOffK:null,nodes,lights}; })"""
# 柏翰的狀態每 0.2 秒記一次（只記變化；只讀：不改人物、不改時間）
BHMON = """(id=>{ if(window.__BHT) clearInterval(window.__BHT); window.__BHLOG=[]; let last='';
  window.__BHT=setInterval(()=>{ try{ const G=GAME.G, E=GAME.E, n=(GAME.npc||{})[id]||E.npcs.find(m=>m&&m.charId===id)||null, inE=!!n&&E.npcs.includes(n), p=n&&n.obj?n.obj.position:null;
    const o={h:+(+G.hour).toFixed(3),ex:inE,seat:!!(n&&n.seat),beh:n?(n.beh||null):null,pose:n?(n.pose||null):null,bye:n&&n.dormBye!=null?+(+n.dormBye).toFixed(2):null,
      x:p?+p.x.toFixed(1):null,z:p?+p.z.toFixed(1):null,path:!!(n&&n.path&&n.path.length)};
    const sig=JSON.stringify([o.ex,o.seat,o.beh,o.pose,o.bye,o.x,o.z]); if(sig!==last){ last=sig; window.__BHLOG.push(o); if(window.__BHLOG.length>400) window.__BHLOG.splice(0,100); } }catch(e){} },200); return true; })"""


async def room(pg):
    return await pg.evaluate(ROOMNPC)


async def look(pg, names):
    return await pg.evaluate(DORM_LOOK, list(names))


async def wait_glb(pg, max_s=60):
    t0 = time.time()
    while time.time() - t0 < max_s:
        if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.dormRoot)"): return True
        await pg.wait_for_timeout(1000)
    return False


def npc_of(c, cid):
    return next((n for n in c['npcs'] if n['id'] == cid), None)


async def view_unit(pg, cdp, run, unit, tag, aisle=(0.0, -0.4)):
    """走到房間中間走道、手指滑鏡頭轉向那一組書桌（跟隨鏡頭），截圖"""
    c = await room(pg); u = (c.get('units') or {}).get(unit)
    if not u: return None
    if math.hypot(c['me'][0] - aisle[0], c['me'][1] - aisle[1]) > 0.7:
        await L.go_to(pg, cdp, run, aisle[0], aisle[1], 0.5, '房間中間走道', max_s=ENVI('WALK_MAX', 90))
    await L.turn_camera_to(pg, cdp, u['seat'][0], u['seat'][1]); await pg.wait_for_timeout(1200)
    return await run.shot(pg, tag)


# ================================================================ 1. aa208l：AA_208 室友旁白三處
ZL = '（阿哲的籃球不在了。）'
BL = '（柏翰的床鋪捲起來了，桌上只剩檯燈。）'
Y2L = ['（312。阿哲的籃球已經滾到門口了，柏翰的檯燈放在靠窗那張書桌上。）', '（另一組床桌是一個大一的學弟，正在跟他媽媽講電話。）']
Y2_FIRST = '明天開學。今天搬進新的房間。'
Y2_LAST = '一年。房間比去年滿一點。'
DF = {'DORM_FOUR': True}


def lines_at(R, text):
    return [r for r in R if r['k'] == 'say' and r['t'] == text]


async def zb_case(pg, cdp, run, case):
    X = {'z': ('2026-01-01', '2026-01-02', ZL, BL, 'ev_y1w_zhe_left', 'L1', ('Y203_ZHE', 'Y203_ZHE_items', 'BEDDING_L1'), ZHE),
         'b': ('2026-01-08', '2026-01-09', BL, ZL, 'ev_y1w_bh_left', 'R1', ('Y203_BOHAN', 'Y203_BOHAN_bulb', 'BEDDING_R1', 'BEDDING_R1_duvet'), BH)}[case]
    prev, day, want, other, evid, unit, nodes, who = X
    tag = 'aa208_' + case
    st, d = await state_at(pg, prev, 22.5, 'dorm', flags=DF)
    await load(pg, cdp, run, st, '%s：最小存檔 %s（%s 第 %s 週，寒假）22:30 宿舍 203、DORM_FOUR（四人房）' % (tag, prev, d['term'], d['week']))
    await wait_glb(pg, 40)
    n0 = await pl_len(pg); c0 = await room(pg)
    run.note('%s：%s 22:30 房間裡（只讀）：%s；dormWho %s' % (tag, prev, J([[n['id'], n['seat'], n['pose']] for n in c0['npcs']]), J(c0['who'])))
    await stand(pg, cdp, run, ENVI('ZB_STAND', 30), tag + '_prev')
    obs = {}

    async def at_line():
        obs['room'] = await room(pg); obs['look'] = await look(pg, nodes)
    ok = await sleep_next(pg, cdp, run, tag + '_sleep', on_line={want[1:8]: at_line}, shots_at=[want[1:8]])
    c1 = await P.clock(pg)
    run.check('%s：走到床「睡覺」→「睡到明天…」→ %s 醒來（現在 %s）' % (tag, day, J(c1)), ok and c1['key'] == day, J(c1))
    if not obs:
        await play(pg, cdp, run, EVDONE % J(evid), max_s=ENVI('ZB_WAIT', 420), ff=False, picks=STAY, tag=tag + '_wait', on_line={want[1:8]: at_line}, shots_at=[want[1:8]])
    R = await rows(pg, n0)
    pre = [r for r in R if r['d'] == prev]; dd = [r for r in R if r['d'] == day]
    W = lines_at(R, want); Wd = lines_at(dd, want); Op = lines_at(dd, other)
    done = await pg.evaluate(EVDONE % J(evid))
    run.note('%s：%s 那天說的 %s' % (tag, day, J(said(dd)[:16])))
    run.check('%s：%s 晚上（對照，前一天）待在 203：沒有「%s」也沒有「%s」' % (tag, prev, want, other), not lines_at(pre, want) and not lines_at(pre, other), J(said(pre)[:10]))
    run.check('%s：%s 人在 203：旁白「%s」一次（說話人空白＝旁白）、%s done' % (tag, day, want, evid),
              len(W) == 1 and len(Wd) == 1 and Wd[0]['n'] == '' and Wd[0]['z'] == 'dorm' and done, J({'rows': W, 'done': done}))
    run.check('%s：%s 沒有另一句「%s」（只有那一天）' % (tag, day, other), not Op, J(Op))
    if obs:
        r0 = obs['room']; m = npc_of(r0, who)
        run.note('【觀察】%s：旁白當下 %s %s 房間裡的人 %s；%s 在不在 %s；dormWho %s；正式模型 %s（3D 有沒有跟著旁白：不算 PASS／FAIL）' %
                 (tag, r0['key'], r0['h'], J([[n['id'], n['seat'], n['pose']] for n in r0['npcs']]), who, J(m), J(r0['who']), J(obs['look'])))
    await view_unit(pg, cdp, run, unit, tag + '_unit_%s' % unit)
    lk = await look(pg, nodes); run.note('【觀察】%s：旁白之後轉向 %s 那一組（截圖）：%s' % (tag, unit, J(lk)))


async def zb_next(pg, cdp, run, case):
    key, want, evid = {'znext': ('2026-01-03', ZL, 'ev_y1w_zhe_left'), 'bnext': ('2026-01-10', BL, 'ev_y1w_bh_left')}[case]
    tag = 'aa208_' + case
    st, d = await state_at(pg, key, 9.0, 'dorm', flags=DF)
    await load(pg, cdp, run, st, '%s：最小存檔 %s 09:00 宿舍 203（前一天沒進房間的人）、DORM_FOUR' % (tag, key))
    n0 = await pl_len(pg)
    await stand(pg, cdp, run, ENVI('ZB_CTRL', 90), tag)
    R = await rows(pg, n0); c = await P.clock(pg)
    run.note('%s：站到 %s，說的 %s' % (tag, J(c), J(said(R)[:12])))
    run.check('%s：%s 在 203 站 %d 秒：沒有「%s」、%s 沒 done（只有那一天）' % (tag, key, ENVI('ZB_CTRL', 90), want, evid),
              not lines_at(R, want) and not await pg.evaluate(EVDONE % J(evid)), J(said(R)[:8]))
    await run.shot(pg, tag)


async def y2_case(pg, cdp, run):
    tag = 'aa208_y2'; how = os.environ.get('Y2START', 'sleep')
    if how == 'load':
        st, d = await state_at(pg, '2026-09-06', 10.0, 'dorm', flags=DF, drop=('ROOM_Y2', 'ROOM_Y2_MOVING'))
        await load(pg, cdp, run, st, '%s：最小存檔 2026-09-06（大二上開學前一天）10:00 宿舍、還沒搬（沒有 ROOM_Y2）、DORM_FOUR' % tag)
    else:
        st, d = await state_at(pg, '2026-09-05', 22.5, 'dorm', flags=DF, drop=('ROOM_Y2', 'ROOM_Y2_MOVING'))
        await load(pg, cdp, run, st, '%s：最小存檔 2026-09-05（暑假最後幾天，住宿舍）22:30 宿舍、還沒搬（沒有 ROOM_Y2）、DORM_FOUR' % tag)
    exp = await pg.evaluate("(()=>STORY.ROOM_MATE_Y2||null)()")
    run.check('%s：頁面的 STORY.ROOM_MATE_Y2 和稿（AA_208 第 7 節）一字不差' % tag, exp == Y2L, J(exp))
    n0 = await pl_len(pg); obs = {}

    async def at_line():
        obs['room'] = await room(pg); obs['look'] = await look(pg, ('Y312_ZHE', 'Y312_ZHE_items', 'Y312_BOHAN', 'Y312_BOHAN_bulb', 'Y312_FRESH', 'Y312_FRESH_items'))
    hooks = {Y2L[0][1:12]: at_line}; shots = [Y2L[0][1:12], Y2L[1][1:12]]
    until = "(()=>{ const F=GAME.G.flags; return F.ROOM_Y2!=null&&!F.ROOM_Y2_MOVING; })()"
    if how != 'load':
        await stand(pg, cdp, run, 20, tag + '_prev')
        ok0 = await sleep_next(pg, cdp, run, tag + '_sleep', on_line=hooks, shots_at=shots)
        run.check('%s：走到床「睡覺」→「睡到明天…」→ 9/6 醒來（%s）' % (tag, J(await P.clock(pg))), ok0, '')
    ok = await play(pg, cdp, run, until, max_s=ENVI('Y2_MAX', 900), ff=False, picks=STAY, tag=tag, on_line=hooks, shots_at=shots)
    R = await rows(pg, n0); seq = [r for r in R if r['k'] in ('say', 'choose', 'card')]
    f = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {y2:F.ROOM_Y2!=null?CALENDAR.dateOf(F.ROOM_Y2).key:null, moving:!!F.ROOM_Y2_MOVING, items:F.ROOM_Y2_ITEMS||null, set:GAME.E.zone&&GAME.E.zone.dormSetKey}; })()")
    run.note('%s：說的、選的（依序）%s；旗標 %s' % (tag, J([[r['k'], r['n'], r['t'][:40]] for r in seq[:24]]), J(f)))
    i = next((j for j, r in enumerate(seq) if r['k'] == 'card' and r['n'] == '搬到新的房間'), None)
    first = lines_at(R, Y2_FIRST)
    run.check('%s：旁白「%s」→ 日期卡「搬到新的房間／三樓 312 號房」' % (tag, Y2_FIRST),
              bool(first) and i is not None and seq[i]['t'] == '三樓 312 號房' and R.index(first[0]) < R.index(seq[i]), J({'first': first, 'card': seq[i] if i is not None else None}))
    nxt = seq[i + 1:i + 4] if i is not None else []
    run.check('%s：日期卡後面緊接兩句室友旁白（說話人空白）→ 接著才是「（拿出…）」的選單' % tag,
              len(nxt) == 3 and nxt[0]['k'] == 'say' and nxt[0]['t'] == Y2L[0] and nxt[0]['n'] == '' and nxt[1]['k'] == 'say' and nxt[1]['t'] == Y2L[1] and nxt[1]['n'] == ''
              and nxt[2]['k'] == 'choose' and '（拿出' in nxt[2]['t'], J(nxt))
    run.check('%s：拆完「%s」、ROOM_Y2＝2026-09-06、房間是 312' % (tag, Y2_LAST), ok and bool(lines_at(R, Y2_LAST)) and f['y2'] == '2026-09-06' and not f['moving'] and f['set'] == '312', J(f))
    if obs:
        r0 = obs['room']
        run.note('【觀察】%s：室友旁白當下 %s %s 房間裡的人 %s；dormWho %s；正式模型 %s（阿哲的籃球、柏翰的檯燈、學弟：3D 有沒有跟著旁白，不算 PASS／FAIL）' %
                 (tag, r0['key'], r0['h'], J([[n['id'], n['seat'], n['pose']] for n in r0['npcs']]), J(r0['who']), J(obs['look'])))
    await view_unit(pg, cdp, run, 'R1', tag + '_R1_lamp')
    n1 = await pl_len(pg); await stand(pg, cdp, run, 30, tag + '_after')
    R2 = await rows(pg, n1)
    run.check('%s：拆完之後站 30 秒：不再演（兩句各只出現過一次）' % tag, not lines_at(R2, Y2L[0]) and len(lines_at(R, Y2L[0])) == 1 and len(lines_at(R, Y2L[1])) == 1, J(said(R2)[:6]))


async def m_aa208l(pg, cdp, run):
    for c in ENV('AA208', 'z,znext,b,bnext,y2'):
        run.note('==== aa208l：%s ====' % c)
        try:
            if c in ('z', 'b'): await zb_case(pg, cdp, run, c)
            elif c in ('znext', 'bnext'): await zb_next(pg, cdp, run, c)
            elif c == 'y2': await y2_case(pg, cdp, run)
            else: run.check('aa208l %s 認得' % c, False, '可以用：z,znext,b,bnext,y2')
        except Exception as ex: run.check('aa208l %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 2. encb3：「你來過一次」
LOC, LOCNAME, SPOT = 'D04', '西門町電影院', '西門町'
NARR_LIT = '你來過一次。上次是一個人，從六號出口走出來。'
AN_LIT = '你來過？……好。那電影院你帶路。我只記得出口。'
SOLO_EXP = """(id=>{ const S=typeof SOLO_BEFORE!=='undefined'?SOLO_BEFORE:null; if(!S) return null; return {narr:S.narr.D04||null, lines:((S.lines[id]||{}).D04||[]).map(x=>x.text), source:S.source}; })"""
FREE_JS = """(()=>{ const P=GAME.G.places||{}; return {free:P.free||null, soloSaid:P.soloSaid||null, trip:GAME.G.trip||null, photos:(P.photos||[]).length}; })()"""
TRIPJ = """(id=>{ const t=(GAME.G.trips||[]).filter(x=>x.who===id).pop(); return t?{trip:t.trip,day:CALENDAR.dateOf(t.day).key,d:t.day,depart:t.depart,locs:t.locs,status:t.status,kind:t.kind||null,spots:t.spots||null}:null; })"""
TRIP_DONE = """(tr=>{ const t=(GAME.G.trips||[]).find(x=>x.trip===tr); return !!t&&['done','cancelled','missed'].includes(t.status); })(%s)"""
VISITS = """(id=>{ try{ return DATE.log(GAME.G,id).byLoc.D04|0; }catch(e){ return 'ERR '+e.message; } })"""


async def solo_trip(pg, cdp, run, act):
    """手機「地點」→ 捷運公館站「前往」→ 走到「捷運公館站入口」按下去 → 西門町 →（看一場電影）→ 回去 → 直接回宿舍"""
    tag = 'encb3_solo'; n0 = await pl_len(pg)
    await P.phone_tab(pg, cdp, 'places'); await run.shot(pg, tag + '_places')
    gp = await go_place(pg, cdp, run, 'gongguan', 120, name='捷運公館站')
    run.check('%s：手機「地點」→「捷運公館站」「前往」→ 公館（%s）' % (tag, J(gp.get('at'))), gp['ok'], J(gp))
    if not gp['ok']: return None
    c = await P.clock(pg)
    if c['h'] < 15.8:
        await wait_h(pg, cdp, run, c['key'], 15.8, 300, tag + '_wait')   # 西門町 17:00 開：到得太早一小時以上＝灰掉（freetrip3d.js S.check）
    it = await L.find_it(pg, '捷運公館站入口')
    if not it: run.check('%s：公館有「捷運公館站入口」' % tag, False, ''); return None
    if not (await P.ts(pg))['lab'].startswith('捷運公館站入口'):
        await L.go_to(pg, cdp, run, it['x'], it['z'], 1.2, it['label'], max_s=ENVI('WALK_MAX', 150), stop=lambda s: s['interact'].startswith('捷運公館站入口'))
    await run.shot(pg, tag + '_mrt')
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    picks = [SPOT, '照樣出發', '不打擾', '點頭'] + (['看一場電影'] if act == 'movie' else []) + ['回去', '直接回宿舍']
    t0 = time.time(); menus = []; started = False
    while time.time() - t0 < ENVI('SOLO_MAX', 600):
        s = await P.ts(pg)
        if s['ch']:
            T = [o['t'] for o in s['ch']]; k, why = pick_opt(s['ch'], picks, False); menus.append([T, T[k]])
            if T[k].startswith(SPOT): started = True
            if len(menus) <= 3: await run.shot(pg, '%s_menu%d' % (tag, len(menus)))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if s['busy'] or s['depth'] > 0: await pg.wait_for_timeout(700); continue
        tr = await pg.evaluate("!!GAME.G.trip")
        if started and not tr and s['zone'] == 'dorm': break
        if not started and time.time() - t0 > 30: break
        await pg.wait_for_timeout(1000)
    R = await rows(pg, n0); fr = await pg.evaluate(FREE_JS)
    a0 = await pg.evaluate("(()=>{ const s=TRIP.spot('D04'); return s?{arrive:s.arrive,lobby:(s.points.find(p=>p.id==='D04.lobby')||{}).lines||null}:null; })()")
    run.note('%s：選單 %s；說的 %s；G.places %s' % (tag, J(menus)[:1500], J(said(R)[:16]), J(fr)))
    arr = a0 and a0['arrive'][0]
    mv = (a0 or {}).get('lobby') or []
    run.check('%s：西門町到達那一句「%s」（旁白）、G.places.free.D04＝1、回到宿舍、還沒有 soloSaid' % (tag, arr),
              bool(arr) and any(r['t'] == arr and r['n'] == '' for r in R) and (fr['free'] or {}).get('D04') == 1 and not fr['trip'] and (await P.ts(pg))['zone'] == 'dorm'
              and not any(k.endswith(':D04') for k in (fr['soloSaid'] or {})), J({'free': fr, 'zone': (await P.ts(pg))['zone']}))
    if act == 'movie':
        run.check('%s：「看一場電影」那一句（第一次：%s）' % (tag, (mv or [''])[0][:20]), bool(mv) and any(r['t'] == mv[0] for r in R), '')
    return fr


async def book_date(pg, cdp, run, cid, offsets, hour, tag):
    """手機「朋友」→ 她的「約」→「出去玩…」→「臺北市：看展・電影…」→「西門町電影院」→ 日期（offsets＝今天起第幾天，照順序試）→「HH:MM 出發」（灰掉＝換一天）→「就這樣約」"""
    G0 = await P.clock(pg)
    labs = [await pg.evaluate("(d=>DATE.dayLabel(GAME.G,d))", G0['day'] + o) for o in offsets]
    hm = '%02d:%02d' % (int(hour), round((hour - int(hour)) * 60))
    pi = await phone_inv(pg, cdp, run, cid, tag)
    if not pi['ok']: return {'ok': False, 'why': pi}
    t0 = time.time(); menus = []; picked = []; tried = set(); cur = None; done = False; idle = None; fail = None
    while time.time() - t0 < ENVI('BOOK_MAX', 180):
        s = await P.ts(pg)
        if s['ch']:
            idle = None; T = [o['t'] for o in s['ch']]; live = [i for i, o in enumerate(s['ch']) if not o['dim']]; menus.append(T)
            find = lambda pred: next((i for i in live if pred(T[i])), None)
            k = None
            if any(t.startswith('就這樣約') for t in T): k = find(lambda t: t.startswith('就這樣約')); done = k is not None
            elif any(re.match(r'^\d\d:\d\d 出發', t) for t in T):
                k = find(lambda t: t.startswith(hm + ' 出發'))
                if k is None: tried.add(cur); k = find(lambda t: t == '換一天')
            elif any(re.match(r'^(今天 |明天 )?\d+/\d+（', t) for t in T):
                for lb in labs:
                    if lb in tried: continue
                    k = find(lambda t, lb=lb: t.startswith(lb))
                    if k is not None: cur = lb; break
            elif any(t.startswith(LOCNAME) for t in T): k = find(lambda t: t.startswith(LOCNAME))
            elif any(t.startswith('臺北市：看展') for t in T): k = find(lambda t: t.startswith('臺北市：看展'))
            elif any(t.startswith('出去玩') for t in T): k = find(lambda t: t.startswith('出去玩'))
            if k is None:
                fail = '這一層沒有要選的（%s）' % J(T)
                k = next((i for i, t in enumerate(T) if t in ('算了', '返回')), len(T) - 1)
                await run.shot(pg, tag + '_nomatch')
            picked.append(T[k])
            if len(menus) <= 6: await run.shot(pg, '%s_menu%d' % (tag, len(menus)))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100)
            if fail: break
            continue
        if s['dlg']: idle = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if s['busy'] or s['depth'] > 0: idle = None; await pg.wait_for_timeout(600); continue
        if done:
            idle = idle or time.time()
            if time.time() - idle > 4: break
        elif time.time() - t0 > 25 and not menus: break
        await pg.wait_for_timeout(500)
    await L.close_panels(pg, cdp)
    tr = await pg.evaluate(TRIPJ, cid)
    ok = bool(done) and not fail and bool(tr) and tr['status'] == 'booked' and tr['locs'] == [LOC] and abs(tr['depart'] - hour) < 0.01
    return {'ok': ok, 'trip': tr, 'menus': menus, 'picked': picked, 'labs': labs, 'fail': fail}


async def run_date(pg, cdp, run, cid, trip, tag, shots=()):
    """約會那天：床「快轉」→「現在出發」／「出發：」→ 到了 → 第一個互動點 →「差不多了，回去吧」（告白的選單＝「（今天先不說）」）。回傳 (走完, rows)"""
    pts = await pg.evaluate("(()=>{ try{ return DATE.points('D04').map(p=>p.name); }catch(e){ return []; } })()")
    picks = ['現在出發', '出發：', '（今天先不說）'] + pts[:1] + ['差不多了，回去吧']
    n0 = await pl_len(pg)
    ok = await play(pg, cdp, run, TRIP_DONE % J(trip), max_s=ENVI('ENC_MAX', 2400), picks=picks, ff=True, tag=tag, shots_at=shots)
    return ok, await rows(pg, n0)


def date_block(R):
    i = next((j for j, r in enumerate(R) if r['k'] == 'say' and r['t'] == '（%s。）' % LOCNAME), None)
    return (R[i:], i) if i is not None else ([], None)


async def enc_first(pg, cdp, run, cid, off, exp):
    tag = 'encb3_%s_1' % cid; nm = await names_of(pg, cid)
    bk = await book_date(pg, cdp, run, cid, [off, off + 1, off + 2], 17.0, tag)
    run.check('%s：手機「朋友」→「約」→「出去玩…」→ 臺北市：看展・電影 →「%s」→ 日期 →「17:00 出發」→「就這樣約」（%s）' % (tag, LOCNAME, J(bk.get('trip'))), bk['ok'], J({'picked': bk['picked'], 'fail': bk['fail'], 'labs': bk['labs']})[:900])
    if not bk['ok'] or not bk.get('trip'): return None
    v0 = await pg.evaluate(VISITS, cid); fr0 = await pg.evaluate(FREE_JS)
    run.note('%s：約會前 DATE.log byLoc.D04＝%s；G.places %s' % (tag, J(v0), J(fr0)))
    ok, R = await run_date(pg, cdp, run, cid, bk['trip']['trip'], tag, shots=[exp['narr'][:10]] + ([exp['lines'][0][:10]] if exp['lines'] else []))
    B, _ = date_block(R); tr = await pg.evaluate(TRIPJ, cid); fr = await pg.evaluate(FREE_JS)
    run.note('%s：約會說的 %s；trip %s；G.places %s' % (tag, J([[r['n'], r['t'][:40]] for r in B if r['k'] == 'say'][:16]), J(tr), J(fr)))
    run.check('%s：約會那天走完（「（%s。）」、trip done）' % (tag, LOCNAME), ok and bool(B) and tr and tr['status'] == 'done', J(tr))
    if not B: return R
    full = '（%s）' % exp['narr']
    ni = next((j for j, r in enumerate(B) if r['k'] == 'say' and r['t'] == full), None)
    her_before = [r for r in B[:ni] if is_her(r, cid, nm)] if ni is not None else []
    ch_before = [r for r in B[:ni] if r['k'] == 'choose'] if ni is not None else []
    nxt = [r for r in B[ni + 1:] if r['k'] in ('say', 'choose')][:len(exp['lines'])] if ni is not None else []
    run.check('%s：她的抵達句之後旁白「%s」（說話人空白），前面沒有選單' % (tag, full), ni is not None and B[ni]['n'] == '' and bool(her_before) and not ch_before,
              J({'her_before': [r['t'] for r in her_before], 'choose_before': [r['t'][:40] for r in ch_before]}))
    run.check('%s：旁白後面緊接她的 %s' % (tag, J(exp['lines'])), len(nxt) == len(exp['lines']) and all(is_her(g, cid, nm) and g['t'] == w for g, w in zip(nxt, exp['lines'])),
              J([[r['n'], r['t']] for r in nxt]))
    ss = (fr['soloSaid'] or {}).get(cid + ':' + LOC)
    run.check('%s：記 G.places.soloSaid["%s:%s"]＝約會那一天' % (tag, cid, LOC), ss is not None and ss == bk['trip']['d'], J(fr['soloSaid']))
    if cid == AN:
        run.check('%s：以安的字和稿一致：旁白「（%s）」、「%s」' % (tag, NARR_LIT, AN_LIT), exp['narr'] == NARR_LIT and exp['lines'][:1] == [AN_LIT], J(exp))
    await run.shot(pg, tag + '_end')
    return R


async def enc_again(pg, cdp, run, cid, off, exp):
    tag = 'encb3_%s_2' % cid; nm = await names_of(pg, cid)
    fr0 = await pg.evaluate(FREE_JS); v0 = await pg.evaluate(VISITS, cid)
    bk = await book_date(pg, cdp, run, cid, [off, off + 1, off + 2], 17.0, tag)
    run.check('%s：第二次約她去%s（%s；約會前 byLoc.D04＝%s）' % (tag, LOCNAME, J(bk.get('trip')), J(v0)), bk['ok'], J({'picked': bk['picked'], 'fail': bk['fail']})[:700])
    if not bk['ok']: return
    ok, R = await run_date(pg, cdp, run, cid, bk['trip']['trip'], tag)
    B, _ = date_block(R); fr = await pg.evaluate(FREE_JS); tr = await pg.evaluate(TRIPJ, cid)
    run.note('%s：約會說的 %s' % (tag, J([[r['n'], r['t'][:40]] for r in B if r['k'] == 'say'][:14])))
    full = '（%s）' % exp['narr']
    run.check('%s：第二次（同一人同一地）走完、沒有旁白「%s」、沒有她那幾句、soloSaid 不變' % (tag, full),
              ok and bool(B) and not any(r['t'] == full for r in B) and not any(is_her(r, cid, nm) and r['t'] in exp['lines'] for r in B) and (fr['soloSaid'] or {}) == (fr0['soloSaid'] or {}),
              J({'trip': tr, 'soloSaid': [fr0['soloSaid'], fr['soloSaid']]}))
    await run.shot(pg, tag + '_end')


async def m_encb3(pg, cdp, run):
    enc = ENV('ENC', 'heroine_01,heroine_04'); again = ENV('ENC_AGAIN', enc[0]); again = enc if again == ['all'] else again
    key = os.environ.get('ENC_DAY', '2026-03-14')
    st, d = await state_at(pg, key, 15.67, 'dorm', flags={'dating_kexin': True} if 'kexin' in enc else None)
    body = ('' if 'kexin' in enc else 'NOKX(); ') + 'const out={}; for(const id of %s){ if(id===\'kexin\') DT(id); out[id]=Object.assign(LV(id,45,30,20,{npcRom:35,rom:10}),{dating:!!F[\'dating_\'+id],canAsk:ASK(id)}); } return out;' % J(enc)
    r = await load(pg, cdp, run, st, 'encb3：最小存檔 %s（%s 第 %s 週，週%s）15:40 宿舍' % (key, d['term'], d['week'], '日一二三四五六'[d['wd']]), js=body)
    run.check('encb3：【捷徑】%s 第 5 階（DATE.stageNum 5，kexin＝交往中）、DATE.canAsk 都可以約' % J(enc),
              bool(r) and all((r.get(c) or {}).get('canAsk', {}).get('ok') and ((r.get(c) or {}).get('stg') == 5 or (r.get(c) or {}).get('dating')) for c in enc), J(r))
    exp = {}
    for c in enc:
        exp[c] = await pg.evaluate(SOLO_EXP, c)
        run.note('encb3：%s 的「你來過一次」（頁面的 SOLO_BEFORE，只讀）：%s' % (c, J(exp[c])))
    if not all(exp[c] and exp[c]['narr'] and exp[c]['lines'] for c in enc):
        run.check('encb3：SOLO_BEFORE 有 D04 的旁白和每一位的台詞', False, J(exp)); return
    fr = await solo_trip(pg, cdp, run, os.environ.get('SOLO_ACT', 'movie'))
    if not fr: return
    for c in enc:
        run.note('==== encb3：%s 第一次約會 ====' % c)
        try: await enc_first(pg, cdp, run, c, 1, exp[c])
        except Exception as ex: run.check('encb3 %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()
    for c in again:
        if c not in enc: continue
        run.note('==== encb3：%s 第二次約會 ====' % c)
        try: await enc_again(pg, cdp, run, c, 1, exp[c])
        except Exception as ex: run.check('encb3 %s 第二次：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 3. dormy34：柏翰大四上推甄前桌燈開到 01:00
DY_CASES = {'w5': (['Y4S1', 5, 2], 'Y4'), 'w13': (['Y4S1', 13, 3], 'Y4'), 'w13d1': (['Y4S1', 13, 1], 'Y4'), 'y3': (['Y3S1', 5, 2], 'Y3'), 'w1d1': (['Y4S1', 1, 1], 'Y4')}


def at_desk(c, seat):
    m = npc_of(c, BH)
    return bool(m) and m['visible'] and not m['hidden'] and bool(m['seat']) and math.hypot(m['seat'][0] - seat[0], m['seat'][1] - seat[1]) < 0.4 and m['pose'] not in ('walk', 'run'), m


def how_left(log, ladder):
    """柏翰的狀態紀錄 → 最後一次從 E.npcs 不見以前：有沒有起身（dormBye）、走到梯子附近。回傳 {gone, walked, last}"""
    idx = next((i for i in range(len(log) - 1, 0, -1) if log[i - 1]['ex'] and not log[i]['ex']), None)
    if idx is None: return {'gone': False, 'walked': None, 'last': log[-3:]}
    seg = []
    for e in reversed(log[:idx]):
        if not e['ex']: break
        seg.append(e)
    seg.reverse()
    walked = any(e['bye'] is not None and not e['seat'] for e in seg) and any(e['x'] is not None and math.hypot(e['x'] - ladder[0], e['z'] - ladder[1]) < 0.8 for e in seg)
    return {'gone': True, 'walked': walked, 'gone_h': log[idx]['h'], 'last': seg[-4:]}


async def dy_point(pg, cdp, run, tag, setk, lab):
    c = await room(pg); lk = await look(pg, ('Y%s_BOHAN' % setk, 'Y%s_BOHAN_bulb' % setk, 'BEDDING_R1', 'BEDDING_R1_duvet'))
    p = await view_unit(pg, cdp, run, 'R1', '%s_%s' % (tag, lab))
    m = npc_of(c, BH)
    run.note('%s %s（HUD %s，G.day %s G.hour %s）：柏翰 %s；dormWho %s；dormMates %s；bhLateY4 %s；房間裡 %s；桌燈（只讀）%s；截圖 %s' %
             (tag, lab, c['hud'], c['day'], c['h'], J(m), J(c['who']), J(c['mates']), J(c['late']), J([[n['id'], n['seat'], n['pose']] for n in c['npcs']]), J(lk), p))
    return c, lk


async def dy_case(pg, cdp, run, case):
    when, yr = DY_CASES[case]; tag = 'dy_' + case; setk = '409' if yr == 'Y4' else '507'
    fl = dict(TWF); fl.update({'Y4_PATH': os.environ.get('DY_PATH', 'other')} if yr == 'Y4' else {})
    st, d = await state_at(pg, when, 23 + 20 / 60, 'dorm', flags=fl)
    await load(pg, cdp, run, st, '%s：最小存檔 %s（%s 第 %s 週，週%s）23:20 宿舍 %s；交換路線 TW%s' % (tag, d['key'], d['term'], d['week'], '日一二三四五六'[d['wd']], setk, '、Y4_PATH ' + fl['Y4_PATH'] if yr == 'Y4' else ''))
    glb = await wait_glb(pg, 60)
    c0 = await room(pg); R1 = c0['units']['R1']; seat, ladder = R1['seat'], R1['ladder']
    if c0['term'] != d['term'] or c0['week'] != d['week']: run.note('%s：頁面讀到的學期週次 %s %s（預期 %s %s）' % (tag, c0['term'], c0['week'], d['term'], d['week']))
    await pg.evaluate(BHMON, BH)
    a0, m0 = at_desk(c0, seat)
    run.check('%s：23:20 讀進來，柏翰坐在 R1 書桌前（409／507 的室友；dormWho %s）；正式模型載好 %s、房間 %s' % (tag, J(c0['who']), glb, (await look(pg, ()))['set']), a0, J(m0))
    c1, lk1 = await dy_point(pg, cdp, run, tag, setk, '2320')
    late_ok = await wait_h(pg, cdp, run, d['key'], 23.75, ENVI('DY_WAIT', 420), tag + '_w2345')
    c2, lk2 = await dy_point(pg, cdp, run, tag, setk, '2345')
    a2, m2 = at_desk(c2, seat)
    log = await pg.evaluate("window.__BHLOG||[]")
    if case in ('w5', 'w1d1'):
        run.check('%s：23:45（%s）柏翰還坐在書桌前（推甄前：桌燈開到 01:00；bhLateY4 %s）' % (tag, c2['hud'], J(c2['late'])), late_ok and a2, J(m2))
        ok3 = await wait_h(pg, cdp, run, d['key'], 24.5, ENVI('DY_WAIT', 420), tag + '_w0030')
        c3, lk3 = await dy_point(pg, cdp, run, tag, setk, '0030')
        a3, m3 = at_desk(c3, seat)
        run.check('%s：00:30（沒睡覺，G.day 不變、G.hour %s；HUD %s）柏翰還坐在書桌前' % (tag, c3['h'], c3['hud']), ok3 and a3 and c3['day'] == d['d'], J({'bh': m3, 'late': c3['late'], 'who': c3['who']}))
        if case == 'w1d1': return
        ok4 = await wait_h(pg, cdp, run, d['key'], 25.2, ENVI('DY_WAIT', 420), tag + '_w0112')
        c4, lk4 = await dy_point(pg, cdp, run, tag, setk, '0112')
        log = await pg.evaluate("window.__BHLOG||[]"); hl = how_left(log, ladder)
        run.note('%s：柏翰的狀態紀錄（只讀，變化）%s' % (tag, J(log[-14:])))
        run.check('%s：01:12 柏翰不在書桌前、不在房間（上舖）' % tag, ok4 and not npc_of(c4, BH) and BH not in [w[0] for w in (c4['who'] if isinstance(c4['who'], list) else [])], J({'bh': npc_of(c4, BH), 'who': c4['who']}))
        run.check('%s：【一致性】01:00 起身走到自己的梯子（和 23:30 上舖同一套：dormBye、走到 R1 梯子 %s）——不是在椅子上直接消失' % (tag, J(ladder)),
                  hl['gone'] and bool(hl['walked']) and (hl.get('gone_h') or 0) >= 24.95, J(hl))
        run.note('【觀察】%s：桌燈（正式模型 Y%s_BOHAN_bulb）00:30 %s → 01:12 %s；房間熄燈 lightsOffK %s → %s（遊戲有沒有照柏翰在不在開關這一盞：不算 PASS／FAIL）' %
                 (tag, setk, J(lk3['nodes'].get('Y%s_BOHAN_bulb' % setk)), J(lk4['nodes'].get('Y%s_BOHAN_bulb' % setk)), lk3['lightsOffK'], lk4['lightsOffK']))
        return
    hl = how_left(log, ladder)
    run.note('%s：柏翰的狀態紀錄（只讀，變化）%s' % (tag, J(log[-14:])))
    run.check('%s：23:45（%s）柏翰不在書桌前（%s；bhLateY4 %s）' % (tag, c2['hud'], '放榜以後' if yr == 'Y4' else '大三 507', J(c2['late'])), late_ok and not npc_of(c2, BH), J({'bh': m2, 'who': c2['who']}))
    run.check('%s：23:30 起身走到自己的梯子（dormBye、走到 R1 梯子 %s），不是直接消失' % (tag, J(ladder)), hl['gone'] and bool(hl['walked']), J(hl))
    ok5 = await wait_h(pg, cdp, run, d['key'], 24 + 20 / 60, ENVI('DY_WAIT', 420), tag + '_w0020')
    c5, lk5 = await dy_point(pg, cdp, run, tag, setk, '0020')
    log = await pg.evaluate("window.__BHLOG||[]")
    back = [e for e in log if e['ex'] and e['h'] >= 24.0]
    run.check('%s：沒睡覺過了半夜（G.day 不變、G.hour %s；HUD %s）柏翰也沒有回到書桌前（bhLateY4 %s）' % (tag, c5['h'], c5['hud'], J(c5['late'])),
              ok5 and not npc_of(c5, BH) and not back and c5['day'] == d['d'], J({'bh': npc_of(c5, BH), 'back': back[:4], 'who': c5['who'], 'mates': c5['mates']}))
    run.note('【觀察】%s：桌燈（Y%s_BOHAN_bulb）23:20 %s → 23:45 %s（不算 PASS／FAIL）' % (tag, setk, J(lk1['nodes'].get('Y%s_BOHAN_bulb' % setk)), J(lk2['nodes'].get('Y%s_BOHAN_bulb' % setk))))


async def m_dormy34(pg, cdp, run):
    for c in ENV('DY', 'w5,w13,w13d1,y3'):
        run.note('==== dormy34：%s ====' % c)
        if c not in DY_CASES: run.check('dormy34 %s 認得' % c, False, '可以用：' + ','.join(DY_CASES)); continue
        try: await dy_case(pg, cdp, run, c)
        except Exception as ex: run.check('dormy34 %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()
        try: await pg.evaluate("(()=>{ if(window.__BHT) clearInterval(window.__BHT); window.__BHT=null; })()")
        except Exception: pass


# ================================================================ main
MODEFN = {'aa208l': m_aa208l, 'encb3': m_encb3, 'dormy34': m_dormy34}


async def main():
    run = L.Run('d42_' + '+'.join(MODES), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for m in MODES:
            fn = MODEFN.get(m)
            if not fn: run.check('MODE %s 認得' % m, False, '可以用：' + ','.join(MODEFN)); continue
            print('==== MODE %s（SHA %s）====' % (m, os.environ.get('SHA', '?')), flush=True)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
            try:
                await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % m, ok)
                await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
                await fn(pg, cdp, run)
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % m, False, repr(e)[:500]); traceback.print_exc()
                try: await run.shot(pg, m + '_exception')
                except Exception: pass
            run.check('%s：沒有 JS 例外' % m, not errs, J(errs[:3]))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    print('SHA', os.environ.get('SHA', '?'), 'MODE', ','.join(MODES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
