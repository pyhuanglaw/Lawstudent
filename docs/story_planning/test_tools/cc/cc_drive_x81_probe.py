"""CC（帳號 A）11-02 BB 22:03：AA_599「開車出門不寫取車」（2d2ceaeb5 起；驗收版 7224af47a；企劃線 AA_599 @8842d6105）瀏覽器探針。
【CC_02 清單：未過】CC-C 11-12 只把群組舊名改字成「桌遊團」（使用者 P0 NOODLE-NAME-PURGE-1112；PHONE.join 群組名、說明文字），邏輯沒改。這支還沒照 CC_02 丁逐條過 13 點：排電腦前要先過清單、寫清單行、雲端重跑。
不是 iPhone：Playwright 手機橫向模擬（844×390、is_mobile、CDP 觸控；SwiftShader 1～4 fps）。

讀碼看到的規則（7224af47a；行號照 7224）：
① 開車從宿舍直接出發，不算取車（校外約會）：src/date3d.js:155 S.plan pick＝0（ef63 是 tr.mode==='car'&&!fromHome?0.5:0）、:163 兩天一夜同；
   :409 選交通方式的小字拿掉「（從宿舍要先回家取車，多 30 分）」；約好的摘要「…開車單程約 N 分鐘…」N＝地點表的分鐘數（烏來 D20 開車 50 分）。
   觸發：手機「朋友」→「約」（INV.flow，src/invites3d.js:557；要有聯絡方式、INV.whyNot 空白）→「出去玩…」（DATE.canAsk，date3d.js:203：交往中或第 5 階）
   → 地點分類 → 地點 → 交通方式 → 日期 → 時間 → 「就這樣約」（date3d.js:384 S.menu、:333 S.pickWhen）；出發 date3d.js:435 S.prompt →「出發」→ OUT.go → S.scene（:551）。
   狀態：OUT 出遊（G.outings，id date_T…）的 travelH＝50/60、h＝出發＋50 分；到了的那一刻 G.hour＝出發＋50 分；結算 S.complete → dateLog 次數。
   反例：選「捷運轉公車」（不開車）＝travelH 60 分、摘要寫捷運轉公車、沒有「開車」。
② X81 載可昕上山（法律系開局）：src/story3d.js:1923～1932（S.phoneRules 那一段）；條件 story3d.js:3533 S.e37LawOn＝沒有 PLAYED_Y0、dating_kexin、stage law、
   week1Start（LAW_START_DAY＜MAIN_D1）。8/29 21:30 旁白「舊序章離校到舊序章考試的那幾個月，你不是一個人過的。」→ 可昕兩則（第二則 62d＝「明天下午兩點，載我上山。行李兩箱。」，
   ef63＝「…你回家開車，載我上山…」）→ OUT y0_e37（8/30 14:00「家（載可昕上山）14:00」）、E37_LAW；
   8/30 出發 → ev_y0_e37（src/data/events.js:2988）：最後一句「（到了宿舍門口，她回頭揮了一下手。你一個人開車下山。）」，
   62d 沒有「（你把車開回家，再搭捷運回宿舍。）」、afterOuting 不再 advance(1)（14:00 到、演完約 18:00；ef63 約 19:00）。
   反例：dating_kexin＝false（沒交往）→ 8/29 21:30 以後沒有那兩則、沒有 y0_e37 出遊、沒有 E37_LAW。
③ 春假（大二下）兩條路線：src/group3d.js:43 S.springPending（3/30～4/1、收到邀約）、:46 S.springPrompt（選單：跟阿哲他們出去＝在桌遊團群組才有；和可昕開車旅行＝dating_kexin 才有）、
   :55 S.springChoose：noodle＝OUT ndl_trip_y2s2（4/4 08:00，place「家」、travel「開車載阿哲他們出發」）→ ev_spring_y2_noodle；
   kexin＝OUT kx_trip_y2s2（4/3 07:40，place「外校大學校門口」、travel「開車到外校大學接她」；ef63 是「（先回家取車）」「回家取車約 30 分鐘，再開到外校大學接她」）→ ev_kexin_trip_spring_y2。
   旗標 SPRING_Y2＝noodle／kexin。邀約訊息：group3d.js:89（群組 21:00）、:90（可昕 21:30）。
   反例：桌遊團那一場沒交往＝選單沒有「和可昕開車旅行」；可昕那一場不在群組＝選單沒有「跟阿哲他們出去」。

CASES（逗號隔開，預設全部）：date_car、date_mrt（①反例）、x81、x81_no（②反例）、spring_noodle（含可昕那一條的反例）、spring_kexin（含桌遊團那一條的反例）。
【前置／捷徑】讀檔（GAME.applySave，安靜模式：條件事件不自動演；STORY 的手機規則、出遊、春假選單照常）到那一天那個時間；用遊戲 API 補關係、交往、群組，快照再讀；
  等很久的日期（約會那天、8/30、春假出發那天）用同一份進度跳過去（不是遊戲裡的睡覺）。其餘照玩家：手機按鈕、頁籤、「約」、點選項、點對話、手機回覆鍵、出遊「出發」。
整段台詞、選單、字卡、字幕都查 BAD（取車、還車、回家開車、回家把車、把車開出來、把車開回家、車開回家、再搭捷運回宿舍）——
  7224 實測 ev_spring_y2_noodle 開頭旁白 src/data/group_events.js:26「（你回家把車開出來。後座擠了三個人。）」會被抓到（AA_599 規則：不寫取車過程）。
判斷讀遊戲狀態（G.outings、G.flags、G.events.done、G.msgs、G.hour、GAME.say／GAME.choose 原文）；畫面只確認玩家看得到（startswith）。
用法：LW_TESTS=<受測工作樹>/tests SHA=<sha> python3 cc_drive_x81_probe.py <URL index.html> <輸出資料夾>
環境變數：CASES、PLAY_MAX（秒，每一段劇情上限 900）。最後一行 ALL PASS 或 FAILED n；exit 0／1；transcript.json。"""
import os, sys, json, asyncio, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
J = lambda o: json.dumps(o, ensure_ascii=False)
PLAY_MAX = int(os.environ.get('PLAY_MAX', '900'))
ALL = ['date_car', 'date_mrt', 'x81', 'x81_no', 'spring_noodle', 'spring_kexin']
CASES = [c.strip() for c in os.environ.get('CASES', ','.join(ALL)).split(',') if c.strip()]
BAD = ('取車', '還車', '回家開車', '回家把車', '把車開出來', '把車開回家', '車開回家', '再搭捷運回宿舍')   # AA_599：開車出門不寫取車、還車、搭捷運回宿舍
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
TRANS = {}

HOOK = r"""(()=>{ if(!window.__DRV){ const W=window.__DRV={say:[],ch:[]}; const s0=GAME.say; GAME.say=function(w,t){ const r=s0.apply(this,arguments);
    try{ W.say.push({n:(w&&w.name)||(typeof w==='string'?w:''), t:String(t==null?'':t), h:+(+GAME.G.hour).toFixed(3), d:GAME.G.day}); }catch(e){} return r; };
  const t0=GAME.titleCard; if(t0) GAME.titleCard=function(a,b){ try{ W.say.push({n:'[字卡]', t:String(a||'')+'｜'+String(b||''), h:+(+GAME.G.hour).toFixed(3), d:GAME.G.day}); }catch(e){} return t0.apply(this,arguments); };
  const p0=GAME.caption; if(p0) GAME.caption=function(w,t){ try{ W.say.push({n:'[字幕]'+(w||''), t:String(t==null?'':t), h:+(+GAME.G.hour).toFixed(3), d:GAME.G.day}); }catch(e){} return p0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ try{ W.ch.push({o:(o||[]).map(q=>({t:String(q.t||q.text||''),hint:String(q.hint||''),dim:!!q.dim})), h:+(+GAME.G.hour).toFixed(3)}); }catch(e){} return c0.apply(this,arguments); }; }
  return [window.__DRV.say.length, window.__DRV.ch.length]; })()"""
ST_JS = r"""(()=>{ const G=GAME.G, F=G.flags||{}; const outs=(G.outings||[]).map(q=>({id:q.id,state:q.state,day:q.day,h:q.h,place:q.place,title:q.title,travel:q.travel,travelH:q.travelH,dateTrip:q.dateTrip||null}));
  return {day:G.day, key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(3), zone:G.zone, outs,
    flags:{E37_LAW:F.E37_LAW||null, SPRING_Y2:F.SPRING_Y2==null?null:F.SPRING_Y2, dating_kexin:!!F.dating_kexin, KX_FIRST_MSG:!!F.KX_FIRST_MSG},
    done:{ev_y0_e37:!!(G.events&&G.events.done&&G.events.done.ev_y0_e37), ev_spring_y2_noodle:!!(G.events&&G.events.done&&G.events.done.ev_spring_y2_noodle), ev_kexin_trip_spring_y2:!!(G.events&&G.events.done&&G.events.done.ev_kexin_trip_spring_y2)},
    kx:(G.msgs||[]).filter(m=>m.th==='p:kexin').map(m=>({tag:m.tag||null,from:m.from,text:m.text})).slice(-8),
    dateLog:G.dateLog&&G.dateLog.heroine_01?{count:G.dateLog.heroine_01.count|0}:null,
    e37On:typeof STORY!=='undefined'&&STORY.e37LawOn?STORY.e37LawOn(G):null}; })()"""


async def st(pg): return await pg.evaluate(ST_JS)


async def hooks(pg): return await pg.evaluate(HOOK)


async def rec_since(pg, n0):
    W = await pg.evaluate("window.__DRV")
    return W['say'][n0[0]:], W['ch'][n0[1]:]


async def play(pg, cdp, run, chooser=None, max_s=PLAY_MAX, start_s=20, idle_s=5, until=None, tag=''):
    """像玩家一樣：點對話、選項交給 chooser(選項清單)→ 第幾個（None＝第一個沒變暗的）、手機自己跳出來就收起來；until(狀態) 成立或閒下來 idle_s 秒就停"""
    t0 = time.time(); started = False; idle = None; seen = []
    while time.time() - t0 < max_s:
        if until and await until(): return True, seen
        s = await P.ts(pg)
        if s['txt'] and (not seen or seen[-1] != [s['name'], s['txt']]): seen.append([s['name'], s['txt']])
        if s['ch']:
            started = True; idle = None
            k = chooser(s['ch']) if chooser else None
            if k is None: k = next((i for i, o in enumerate(s['ch']) if not o['dim']), 0)
            run.note('%s 選項 %s → 點「%s」' % (tag, J([o['t'][:30] for o in s['ch']]), s['ch'][k]['t'][:40]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); continue
        if s['dlg']: started = True; idle = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if s['phone']: await L.phone_away(pg, cdp); continue
        if s['busy'] or s['depth'] > 0: started = True; idle = None; await pg.wait_for_timeout(500); continue
        if not started:
            if until is None and time.time() - t0 > start_s: break
        else:
            idle = idle or time.time()
            if until is None and time.time() - idle > idle_s: break
        await pg.wait_for_timeout(500)
    return (False if until else started), seen


def pick_first(*keys):
    def f(opts):
        for key in keys:
            for i, o in enumerate(opts):
                if not o['dim'] and key in o['t']: return i
        return None
    return f


def box_seen(seen, full):
    """對話框輪詢看到的（可能是打到一半的前半句）是不是這一句：full startswith 看到的、至少 4 個字"""
    return any(t and len(t) >= 4 and full.startswith(t) for _, t in (seen or []))


def no_bad(texts):
    return [t for t in texts if any(b in t for b in BAD)]


async def base_load(pg, cdp, run, key, hour, zone, flags, label, stage='law', extra=None):
    d = await P.day_of(pg, key)
    s = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 1}, 'contacts': {}, 'flags': dict(BASEF)}
    s['flags'].update(flags or {})
    s.update(day=d['d'], weekday=d['wd'], hour=hour, zone=zone, pos=None, weather='clear', stage=stage, money=50000)
    s['visited'] = {z: True for z in ('library', 'library_hall', 'wancai', 'linze', 'cafe', 'noodle', 'gongguan', 'wenzhou', 'lawlib', 'classroom', 'campus', 'dorm')}
    if extra: s.update(extra)
    run.setup('[前置] 讀檔到 %s（%s 第 %s 週，週%s）%.2f 時 %s；%s' % (d['key'], d['term'], d['week'], d['wd'], hour, zone, label))
    await P.load(pg, cdp, s, quiet=True)
    return d


# ---------------- ① 校外約會開車 ----------------
DATE_PREP = r"""(()=>{ const G=GAME.G, id='heroine_01'; if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,'campus'); const r=SOCIAL.rel(id); r.fam=65; r.trust=50; r.comf=45;
  try{ if(typeof ROM!=='undefined'&&ROM.start) ROM.start(G,id); }catch(e){} G.flags.dating_heroine_01=true; G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=0;
  return {stage:SOCIAL.stage(id), whyNot:typeof INV!=='undefined'?INV.whyNot(G,id):null, canAsk:DATE.canAsk(G,id), contact:INV.hasContact(G,id)}; })()"""


async def case_date(pg, cdp, run, mode):
    car = mode == 'car'
    tag = '①' if car else '①反例'
    await base_load(pg, cdp, run, '2025-10-14', 20.0, 'dorm', {}, '大一上第 7 週週二晚上，宿舍')
    pre = await P.prep(pg, cdp, run, DATE_PREP, label='以安：認識、熟、交往中（ROM.start、dating_heroine_01）、有聯絡方式')
    if not run.check('%s 前置：可以用手機約以安出去（INV.whyNot 空白、DATE.canAsk ok）' % tag, not pre.get('whyNot') and pre['canAsk']['ok'] and pre['contact'], J(pre)): return
    n0 = await hooks(pg)
    await P.phone_tab(pg, cdp, 'friends'); await pg.wait_for_timeout(800)
    has = await pg.evaluate("!!document.querySelector('#phoneBody [data-inv=\"heroine_01\"]')")
    if not run.check('%s 手機「朋友」有以安的「約」' % tag, has): return
    await L.tap(pg, cdp, '#phoneBody [data-inv="heroine_01"]'); await pg.wait_for_timeout(1200)
    want_mode = '開車' if car else '捷運轉公車'

    def chooser(opts):
        ts = [o['t'] for o in opts]
        for key in ('出去玩', '新北市、桃園：老街', '烏來'):
            k = next((i for i, t in enumerate(ts) if t.startswith(key) and not opts[i]['dim']), None)
            if k is not None: return k
        if any(t.startswith('捷運轉公車') for t in ts) and any(t.startswith('開車') for t in ts):
            return next(i for i, t in enumerate(ts) if t.startswith(want_mode))
        k = next((i for i, t in enumerate(ts) if '（六）' in t), None)
        if k is not None: return k
        k = next((i for i, t in enumerate(ts) if t.startswith('13:00 出發') and not opts[i]['dim']), None)
        if k is not None: return k
        k = next((i for i, t in enumerate(ts) if t.startswith('就這樣約')), None)
        if k is not None: return k
        return len(ts) - 1
    _, seen = await play(pg, cdp, run, chooser, max_s=420, tag=tag + ' 約以安')
    said, chs = await rec_since(pg, n0)
    a = await st(pg)
    q = next((o for o in reversed(a['outs']) if o['dateTrip']), None)
    mopt = next((c['o'] for c in chs if any(o['t'] == '開車' for o in c['o']) and any(o['t'] == '捷運轉公車' for o in c['o'])), None)
    summ = next((x['t'] for x in said if x['t'].startswith('和沈以安去烏來')), '')
    TRANS[mode] = {'said': said, 'choices': chs, 'state': a, 'box': seen}
    run.note('%s 交通方式選單（GAME.choose 原文）：%s；摘要：%s；出遊：%s' % (tag, J(mopt), summ, J(q)))
    if car:
        carhint = next((o['hint'] for o in (mopt or []) if o['t'] == '開車'), None)
        run.check('① 選交通方式：「開車」的小字沒有「取車」（%s）' % carhint, carhint is not None and '取車' not in carhint, J(mopt))
        run.check('① 約好了：摘要「開車單程約 50 分鐘」、約 17:10 回到首都帝大（GAME.say 原文）', '開車單程約 50 分鐘' in summ and '17:10 回到' in summ and not no_bad([summ]), summ)
        run.check('① 狀態：出遊 travelH＝50/60（不加取車 30 分）、抵達 13:50、交通「開車 約 50 分鐘」', bool(q) and abs(q['travelH'] - 50 / 60) < 0.01 and abs(q['h'] - (13 + 50 / 60)) < 0.01 and q['travel'].startswith('開車') and '取車' not in (q['travel'] + q['place']), J(q))
        run.check('① 玩家看得到摘要（對話框 startswith）', box_seen(seen, summ), J(seen[-6:]))
        if not q: return
        # 出發：同一份進度跳到那天 12:40（OUT.due＝出發前 travelH＋15 分）
        dkey = await pg.evaluate("d=>CALENDAR.dateOf(d).key", q['day'])
        await P.jump(pg, cdp, run, dkey, 13.0, 'dorm', pos=None, note='【捷徑】撥時間到約會那天 13:00（約好的出發時間，宿舍），等出發提示')
        await pg.evaluate("(()=>{ if(window.__BBP) { EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; } })()")
        n1 = await hooks(pg)

        async def prompted():
            s = await P.ts(pg); return any(o['t'].startswith('出發') or o['t'].startswith('現在出發') for o in s['ch'])
        got, _ = await play(pg, cdp, run, None, max_s=300, until=prompted, tag='① 等出發')
        s = await P.ts(pg)
        run.check('① 約會那天出發提示：「出發」或「現在出發」（DATE.early；小字沒有「取車」）', got and not no_bad([o['t'] for o in s['ch']]), J(s['ch']))
        if not got: return
        k = next(i for i, o in enumerate(s['ch']) if o['t'].startswith('出發') or o['t'].startswith('現在出發'))
        dep = (await st(pg))['h']
        run.note('① 在 %.3f 時按「%s」' % (dep, s['ch'][k]['t']))
        await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500)
        _, seen2 = await play(pg, cdp, run, pick_first('就這樣回去', '差不多了，回去吧'), max_s=PLAY_MAX, tag='① 約會')
        said2, ch2 = await rec_since(pg, n1)
        b = await st(pg)
        arr = next((x for x in said2 if x['t'] == '（烏來。）'), None)
        TRANS['date_go'] = {'said': said2, 'choices': ch2, 'state': b, 'box': seen2}
        run.note('① 約會：抵達那一句 %s；之後 %s' % (J(arr), J({'h': b['h'], 'dateLog': b['dateLog']})))
        run.check('① 約會有演：到了烏來的那一刻是 13:50（13:00 按出發＋開車 50 分，沒有取車 30 分；ef63＝14:20）', bool(arr) and abs(arr['h'] - (13 + 50 / 60)) < 0.05, J({'arrive': arr, 'tap': dep}))
        run.check('① 狀態：約會演完、記進次數（dateLog 以安 count≥1）', bool(b['dateLog']) and b['dateLog']['count'] >= 1, J(b['dateLog']))
        run.check('① 約會的台詞、旁白都沒有取車／搭捷運回宿舍', not no_bad([x['t'] for x in said2]), J(no_bad([x['t'] for x in said2])))
    else:
        run.check('①反例 選「捷運轉公車」：摘要寫「捷運轉公車單程約 60 分鐘」、沒有「開車」', '捷運轉公車單程約 60 分鐘' in summ and '開車' not in summ, summ)
        run.check('①反例 狀態：出遊 travelH＝1（捷運轉公車 60 分）、交通不是開車', bool(q) and abs(q['travelH'] - 1.0) < 0.01 and not q['travel'].startswith('開車'), J(q))


# ---------------- ② X81 ----------------
async def case_x81(pg, cdp, run, dating):
    tag = '②' if dating else '②反例'
    d29 = await P.day_of(pg, '2025-08-29')
    law0 = await pg.evaluate("STORY.MAIN_D1_NEW")
    flags = {'KX_FIRST_MSG': False, 'dating_kexin': bool(dating), 'LAW_START_DAY': d29['d'], 'MAIN_D1': law0}
    for k in ('introDone', 'campusIntro', 'readCase', 'classDone', 'afternoonDone', 'CEREMONY_Y1', 'LAW_RECAP_SEEN'): flags[k] = False
    await base_load(pg, cdp, run, '2025-08-29', 21.42, 'dorm', flags, '法律系開局（LAW_START_DAY＝8/29、MAIN_D1＝%s、沒有 PLAYED_Y0）、%s' % (law0, '和可昕交往中' if dating else '沒有和可昕交往（dating_kexin＝false）'))
    a0 = await st(pg)
    run.check('%s 前置：S.e37LawOn＝%s' % (tag, bool(dating)), a0['e37On'] == bool(dating), J(a0))
    n0 = await hooks(pg)

    async def past():
        x = await st(pg); return x['h'] >= 21.75 or x['day'] > d29['d']
    await play(pg, cdp, run, None, max_s=600, until=past, tag=tag + ' 等 8/29 21:30')
    said, _ = await rec_since(pg, n0)
    a = await st(pg)
    kx = [m['text'] for m in a['kx'] if m['tag'] == 'y0_e37_law_ask' or m['from'] == 'kexin']
    q = next((o for o in a['outs'] if o['id'] == 'y0_e37'), None)
    TRANS['x81_' + ('on' if dating else 'off')] = {'said': said, 'state': a}
    if not dating:
        run.check('②反例 沒交往：8/29 21:30 以後沒有「舊序章離校到舊序章考試…」旁白、沒有可昕那兩則、沒有 y0_e37 出遊、沒有 E37_LAW',
                  not any(x['t'].startswith('舊序章離校到舊序章考試') for x in said) and not any('載我上山' in t for t in kx) and q is None and not a['flags']['E37_LAW'], J({'said': [x['t'] for x in said][:5], 'kx': kx, 'q': q, 'h': a['h']}))
        return
    run.check('② 8/29 21:30 旁白「舊序章離校到舊序章考試的那幾個月，你不是一個人過的。」', any(x['t'] == '舊序章離校到舊序章考試的那幾個月，你不是一個人過的。' for x in said), J([x['t'] for x in said][:5]))
    run.check('② 可昕私訊：「明天下午兩點，載我上山。行李兩箱。」（沒有「你回家開車」）', any(t.startswith('明天下午兩點，載我上山。') for t in kx) and not no_bad(kx), J(kx))
    run.check('② 狀態：排了 8/30 14:00 出遊 y0_e37、E37_LAW', bool(q) and q['h'] == 14 and q['state'] == 'planned' and bool(a['flags']['E37_LAW']), J({'q': q, 'flags': a['flags']}))
    # 手機回覆（玩家）
    txt = await P.phone_answer(pg, cdp, 'p:kexin', '好。兩點。')
    await run.shot(pg, 'x81_phone')
    run.check('② 玩家在手機看得到那一則、按「好。兩點。」回覆', txt is not None and '載我上山' in (txt or ''), (txt or '')[-300:])
    await L.close_panels(pg, cdp)
    if not q: return
    await P.jump(pg, cdp, run, '2025-08-30', 13.3, 'dorm', pos=None, note='【捷徑】撥時間到 8/30 13:18（宿舍；不是遊戲裡的睡覺），等出發提示')
    n1 = await hooks(pg)

    async def prompted():
        s = await P.ts(pg); return any(o['t'].startswith('出發') for o in s['ch'])
    got, _ = await play(pg, cdp, run, None, max_s=420, until=prompted, tag='② 等出發')
    s = await P.ts(pg)
    run.check('② 8/30 出發提示「出發：家（載可昕上山）…」（玩家看得到）', got and any(o['t'].startswith('出發：') and '載可昕上山' in o['t'] for o in s['ch']), J(s['ch']))
    if not got: return
    await P.tap_choice(pg, cdp, next(i for i, o in enumerate(s['ch']) if o['t'].startswith('出發')))
    _, seen = await play(pg, cdp, run, pick_first('我也以為'), max_s=PLAY_MAX, tag='② ev_y0_e37')
    said2, _ = await rec_since(pg, n1)
    b = await st(pg)
    TRANS['x81_go'] = {'said': said2, 'state': b, 'box': seen}
    last = [x for x in said2 if x['n'] == '' and x['t'].startswith('（')]
    endl = next((x for x in said2 if x['t'] == '（到了宿舍門口，她回頭揮了一下手。你一個人開車下山。）'), None)
    run.note('② 演完：%s；最後一句 %s；GAME.say 最後三句 %s' % (J({'h': b['h'], 'zone': b['zone'], 'done': b['done']}), J(endl), J([x['t'] for x in said2[-3:]])))
    run.check('② 事件有演：ev_y0_e37 記成演過，有「（到了宿舍門口，她回頭揮了一下手。你一個人開車下山。）」', b['done']['ev_y0_e37'] and bool(endl), J(b['done']))
    run.check('② 沒有「（你把車開回家，再搭捷運回宿舍。）」，整場沒有取車／回家開車', not no_bad([x['t'] for x in said2]), J(no_bad([x['t'] for x in said2])))
    run.check('② 演完的時間約 18:00（不多開車回家、捷運回宿舍那 1 小時；ef63 約 19:00）', b['day'] == d29['d'] + 1 and abs(b['h'] - 18.0) <= 0.3, J({'key': b['key'], 'h': b['h'], 'zone': b['zone']}))
    run.check('② 玩家看得到最後那一句（對話框 startswith；打字中被點掉的只抓到前半句也算）', box_seen(seen, '（到了宿舍門口，她回頭揮了一下手。你一個人開車下山。）'), J(seen[-4:]))


# ---------------- ③ 春假 ----------------
SPRING_PREP = r"""(([grp,kx])=>{ const G=GAME.G; for(const id of ['zhe','heroine_03','heroine_01','yu','classmate_bohan','classmate_xinci','kexin']){ try{ if(CHARACTERS[id]&&!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,'campus'); const r=SOCIAL.rel(id); r.fam=Math.max(r.fam|0,30); }catch(e){} }
  if(grp) PHONE.join(G,'noodle_team','桌遊團'); G.flags.dating_kexin=!!kx;
  return {inGroup:!!(PHONE.inGroup&&PHONE.inGroup(G,'noodle_team')), dating_kexin:!!G.flags.dating_kexin, days:GROUP.springDays()}; })"""


async def case_spring(pg, cdp, run, route):
    noodle = route == 'noodle'
    tag = '③' + ('桌遊團' if noodle else '可昕')
    h0 = 20.9 if noodle else 21.4
    await base_load(pg, cdp, run, '2027-03-30', h0, 'dorm', {'dating_kexin': not noodle}, '大二下 3/30（二）晚上，宿舍')
    pre = await P.prep(pg, cdp, run, SPRING_PREP, [noodle, not noodle], label='桌遊團那幾個人認識；%s' % ('加入桌遊團群組、沒有和可昕交往' if noodle else '和可昕交往中、不在桌遊團群組'))
    n0 = await hooks(pg)

    async def menu():
        s = await P.ts(pg); return any(o['t'].startswith('春假：') for o in s['ch'])
    got, _ = await play(pg, cdp, run, None, max_s=600, until=menu, tag=tag + ' 等春假選單')
    s = await P.ts(pg)
    opts = [o['t'] for o in s['ch']]
    await run.shot(pg, 'spring_menu_' + route)
    run.check('%s 收到邀約以後跳出春假選單（玩家看得到）' % tag, got, J({'opts': opts, 'pre': pre}))
    if not got: return
    if noodle:
        run.check('③反例（可昕那一條）沒有和可昕交往：選單沒有「春假：和可昕開車旅行」', not any(t.startswith('春假：和可昕') for t in opts) and any(t.startswith('春假：跟阿哲他們出去') for t in opts), J(opts))
        want, oid, ev, dkey, hh = '春假：跟阿哲他們出去', 'ndl_trip_y2s2', 'ev_spring_y2_noodle', '2027-04-04', 7.45
    else:
        run.check('③反例（桌遊團那一條）不在桌遊團群組：選單沒有「春假：跟阿哲他們出去」', not any(t.startswith('春假：跟阿哲') for t in opts) and any(t.startswith('春假：和可昕開車旅行') for t in opts), J(opts))
        want, oid, ev, dkey, hh = '春假：和可昕開車旅行', 'kx_trip_y2s2', 'ev_kexin_trip_spring_y2', '2027-04-03', 6.9
    k = next((i for i, t in enumerate(opts) if t.startswith(want)), None)
    if k is None: return
    await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500)
    await play(pg, cdp, run, None, max_s=60, tag=tag + ' 選完')
    a = await st(pg)
    q = next((o for o in a['outs'] if o['id'] == oid), None)
    run.check('%s 狀態：SPRING_Y2＝%s、排了出遊 %s（place／travel 沒有「取車」）' % (tag, route, oid), a['flags']['SPRING_Y2'] == route and bool(q) and q['state'] == 'planned' and not no_bad([q['place'], q['travel'], q['title']]), J({'flags': a['flags'], 'q': q}))
    if not q: return
    await P.jump(pg, cdp, run, dkey, hh, 'dorm', pos=None, note='【捷徑】撥時間到出發那天（宿舍），等出發提示')
    n1 = await hooks(pg)

    async def prompted():
        s = await P.ts(pg); return any(o['t'].startswith('出發') for o in s['ch'])
    got, _ = await play(pg, cdp, run, None, max_s=420, until=prompted, tag=tag + ' 等出發')
    s = await P.ts(pg)
    run.check('%s 出發提示（玩家看得到；選項和小字沒有「取車」）' % tag, got and not no_bad([o['t'] for o in s['ch']]), J(s['ch']))
    if not got: return
    await P.tap_choice(pg, cdp, next(i for i, o in enumerate(s['ch']) if o['t'].startswith('出發')))
    _, seen = await play(pg, cdp, run, None, max_s=PLAY_MAX, tag=tag + ' ' + ev)
    said, chs = await rec_since(pg, n0)
    b = await st(pg)
    TRANS['spring_' + route] = {'said': said, 'choices': chs, 'state': b, 'box': seen}
    run.note('%s 演完：%s；GAME.say 前三句 %s' % (tag, J({'key': b['key'], 'h': b['h'], 'zone': b['zone'], 'done': b['done']}), J([x['t'] for x in said if x['d'] >= b['day'] - 1][:3])))
    run.check('%s 事件有演：%s 記成演過' % (tag, ev), b['done'][ev], J(b['done']))
    allt = [x['t'] for x in said] + [o['t'] + o['hint'] for c in chs for o in c['o']]
    run.check('%s 整段（選單、出發提示、事件台詞）沒有取車／回家開車' % tag, not no_bad(allt), J(no_bad(allt)))
    run.check('%s 玩家看得到事件的台詞（對話框有東西）' % tag, len(seen) > 0, J(seen[:3]))


async def main():
    os.makedirs(OUT, exist_ok=True)
    run = L.Run('cc_drive_x81', OUT)
    print('cc_drive_x81_probe  SHA=%s  URL=%s  CASES=%s' % (SHA, URL, ','.join(CASES)), flush=True)
    t0 = time.time()
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.set_default_timeout(180000)
        try:
            await pg.goto(URL)
            if run.check('遊戲載入', await L.wait_loaded(pg, 300)):
                await P.init(pg)
                for c in CASES:
                    print('--- case %s' % c, flush=True)
                    try:
                        if c == 'date_car': await case_date(pg, cdp, run, 'car')
                        elif c == 'date_mrt': await case_date(pg, cdp, run, 'mrt')
                        elif c == 'x81': await case_x81(pg, cdp, run, True)
                        elif c == 'x81_no': await case_x81(pg, cdp, run, False)
                        elif c == 'spring_noodle': await case_spring(pg, cdp, run, 'noodle')
                        elif c == 'spring_kexin': await case_spring(pg, cdp, run, 'kexin')
                        else: run.note('不認得的 case：' + c)
                    except Exception:
                        run.check('%s：流程沒有例外' % c, False, traceback.format_exc()[-1500:])
                    await run.shot(pg, 'end_' + c)
                    await L.close_panels(pg, cdp)
                run.check('沒有 JS 錯誤（pageerror）', not errs, '; '.join(errs[:5]))
        finally:
            TRANS['secs'] = round(time.time() - t0)
            with open(os.path.join(OUT, 'transcript.json'), 'w', encoding='utf-8') as f: json.dump(TRANS, f, ensure_ascii=False, indent=1)
            await b.close()
    n = len(run.fails)
    print('用時 %d 秒' % (time.time() - t0))
    print('ALL PASS' if n == 0 else 'FAILED %d' % n, flush=True)
    sys.exit(0 if n == 0 else 1)


asyncio.run(main())
