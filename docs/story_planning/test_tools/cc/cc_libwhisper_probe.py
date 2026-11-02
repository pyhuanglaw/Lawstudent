"""CC（帳號 A）11-02 BB 22:03：AA_595「圖書館小聲講」（D127，src/libquiet3d.js；開發分支 62d98bfa5）瀏覽器探針。
不是 iPhone：Playwright 手機橫向模擬（844×390、is_mobile、CDP 觸控；SwiftShader 1～4 fps）。

讀碼看到的規則（62d98bfa5）：
- src/game3d.js:246 doInteract：it.onInteract 之前 LIBQ.gate(GM,it.npc)——src/libquiet3d.js:60 S.gate：跟著走、後座、店員不算；
  S.quietNow（:39）在讀書區、今天還沒見過這個人（G.libNod＝{day,ids}，:44 S.rec）＝記下來、只播一句點頭旁白（:23 S.NOD：
  女「（她抬頭看到你，點了一下頭。）」男「（他抬頭看到你，點了一下頭。）」），這次不說話。
- src/game3d.js:95 say、:139 caption（有名字的）：LIBQ.whisper（libquiet3d.js:76）——讀書區裡有名字的台詞前面加「（小聲）」；
  旁白、手機、整句動作、已經寫小聲／氣音／口型的不加（:63 S.needsPrefix）；說話的人記成今天見過。
- 讀書區（libquiet3d.js:24 S.ZONES、:27 S.studyAt）：總圖大廳只算 lv≥1（library_hall 二樓自習區）、法圖 lawlib（北邊影印室、館員辦公室、
  東南角櫃台不算）、總圖 B1 只算 study24／disc1／disc2 房間範圍內；其他館整區算。圖書館以外（Café 等）＝不點頭、不加。
  2D 背景照背景圖判斷（:26 S.BG_STUDY）；事件 loud:true 整場不加（src/events3d.js:106）。
- 人在哪裡（讀碼＋node 用 STORY.whereIs 查過）：沛珊大二上週一二四五 16～19 總圖二樓自習區（src/data/characters.js:144）；
  學姊 2025-10-21（二）15:00 在法圖（characters.js 學姊的作息）；明軒大一上第 7～16 週週二四 22:00～23:30 總圖 B1 二十四小時自習室最角落（characters.js:127）；
  以安 2025-10-21 17:30 在 Café 看書（反例）。

流程（一個瀏覽器、橫向；每一場）：
  [前置] 讀檔到那一天那個時間那一區（GAME.applySave，安靜模式：條件事件不自動演）；【捷徑】SOCIAL.meet＋熟悉度 25（認識、有點熟；學姊另外 met_sis、ev_sis_w1 記成演過），快照再讀；
  [前置] 那個人在別的樓層或太遠：玩家放到他 4 m 外（同一層）。
  第 1 次：走到他旁邊、按「和…說話」、點對話（選項點「就這樣」那一類）。
  第 2 次：同一天再找他說一次（同上）。
  三處讀書區（總圖二樓 library_hall lv1、法圖 lawlib、B1 自習室 library_b1 study24）：第 1 次只有點頭那一句（GAME.say 原文、說話的人＝旁白）、G.libNod 記到今天這個人；
    第 2 次沒有點頭、有人說話，每一句有名字的台詞（GAME.say 實際顯示的 D.full、有名字的 caption）都以「（小聲）」開頭（只有動作的、已經小聲的除外），至少一句有前綴。
  反例（Café）：第 1 次就照常說話、沒有點頭、沒有任何「（小聲）」、G.libNod 沒記她。
判斷讀遊戲狀態（GAME.say 的原文與實際顯示文字 GAME.D.full、G.libNod）；對話框文字只確認玩家看得到（startswith）。
用法：LW_TESTS=<受測工作樹>/tests SHA=<sha> python3 cc_libwhisper_probe.py <URL index.html> <輸出資料夾>
環境變數：TALK_MAX（秒，每次說話上限 420）、SCENES（逗號隔開：lib2f,lawlib,b1,cafe；預設全部）。最後一行 ALL PASS 或 FAILED n；exit 0／1；transcript.json。"""
import os, sys, json, asyncio, re, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
J = lambda o: json.dumps(o, ensure_ascii=False)
TALK_MAX = int(os.environ.get('TALK_MAX', '420'))
PRE = '（小聲）'
NOD = {'f': '（她抬頭看到你，點了一下頭。）', 'm': '（他抬頭看到你，點了一下頭。）'}
SOFT = re.compile('小聲|氣音|口型|噓|壓低聲音|悄悄')
SCENES = [
    dict(tag='lib2f', name='總圖二樓自習區', key='2026-10-06', hour=16.6, zone='library_hall', cid='classmate_peishan', sex='f', quiet=True),
    dict(tag='lawlib', name='法圖', key='2025-10-21', hour=15.0, zone='lawlib', cid='heroine_05', sex='f', quiet=True),
    dict(tag='b1', name='總圖 B1 二十四小時自習室', key='2025-10-28', hour=22.3, zone='library_b1', cid='classmate_mingxuan', sex='m', quiet=True),
    dict(tag='cafe', name='兩點半 Café（反例：圖書館以外）', key='2025-10-21', hour=17.5, zone='cafe', cid='heroine_01', sex='f', quiet=False),
]
ONLY = [s.strip() for s in os.environ.get('SCENES', '').split(',') if s.strip()]
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False, 'met_sis': True, 'SIS_CLUB_EXPO': True, 'SIS_CONTACTED': True}
TRANS = {'scenes': []}

# GAME.say／有名字的 caption：原文（raw）＋實際顯示的（shown＝GAME.D.full；caption＝#caption 去掉名字）。只記不改
HOOK = r"""(()=>{ if(!window.__SAY2){ window.__SAY2=[]; const s0=GAME.say; GAME.say=function(w,t){ const r=s0.apply(this,arguments);
    try{ window.__SAY2.push({n:(w&&w.name)||(typeof w==='string'?w:''), raw:String(t==null?'':t), shown:String((GAME.D&&GAME.D.full)||''), h:+(+GAME.G.hour).toFixed(3)}); }catch(e){} return r; };
  const c0=GAME.caption; GAME.caption=function(w,t,ms){ const r=c0.apply(this,arguments);
    try{ if(w){ const el=document.getElementById('caption'), b=el&&el.querySelector('b'); let s=(el&&el.textContent)||''; if(b&&s.startsWith(b.textContent)) s=s.slice(b.textContent.length); window.__SAY2.push({n:String(w), raw:String(t==null?'':t), shown:s, cap:1, h:+(+GAME.G.hour).toFixed(3)}); } }catch(e){} return r; }; }
  return window.__SAY2.length; })()"""
WHERE_JS = r"""(id=>{ const n=__BBF.npc(id), G=GAME.G, P=GAME.E.player, pp=P.obj.position; if(!n||!n.obj) return {here:false};
  const p=n.obj.position, lv=n.lv|0, z=G.zone;
  const own=(x,zz,l)=>{ if(z==='library_hall') return l>=1; if(z==='library_b1'){ const Lb=typeof LIBRARY_B1_LAYOUT!=='undefined'?LIBRARY_B1_LAYOUT:null; return !!Lb&&!!Lb.rooms&&Lb.rooms.some(r=>r.id==='study24'&&x>=r.x0&&x<=r.x1&&zz>=r.z0&&zz<=r.z1); } if(z==='lawlib') return true; return false; };
  return {here:true, x:+p.x.toFixed(2), z:+p.z.toFixed(2), lv, hidden:!!n.hidden, beh:n.beh||null, staff:n.staff||null, seat:!!n.seat, zone:z,
    npcStudy:typeof LIBQ!=='undefined'?LIBQ.studyAt(z,lv,p.x,p.z):null, npcStudyOwn:own(p.x,p.z,lv),
    me:{x:+pp.x.toFixed(2), z:+pp.z.toFixed(2), lv:P.lv|0, d:+Math.hypot(pp.x-p.x,pp.z-p.z).toFixed(2)},
    meStudy:typeof LIBQ!=='undefined'?LIBQ.studyAt(z,P.lv|0,pp.x,pp.z):null, quietNow:typeof LIBQ!=='undefined'?LIBQ.quietNow(GAME):null}; })(%s)"""
NODREC_JS = "(id=>{ const r=GAME.G.libNod; return {libNod:r===undefined?'(沒有欄位)':r, seen:!!(r&&r.ids&&r.ids[id]), today:!!(r&&r.day===GAME.G.day), hasLIBQ:typeof LIBQ!=='undefined'}; })(%s)"
PREP_JS = r"""(([id,sis])=>{ if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,GAME.G.zone); const r=SOCIAL.rel(id); r.fam=Math.max(r.fam|0,25);
  if(sis){ const ev=GAME.G.events=GAME.G.events||{done:{},last:{},count:0}; ev.done=ev.done||{}; ev.done.ev_sis_w1=ev.done.ev_sis_w1||1; }
  return {id, stage:SOCIAL.stage(id), fam:r.fam}; })"""


def needs_prefix(t):
    """libquiet3d.js:63 S.needsPrefix 的同一套規則（Python）：只有動作（整句在（）裡）、已經小聲的不加"""
    t = (t or '').strip()
    if not t or t.startswith(PRE): return False
    rest, lead = t, ''
    while rest.startswith('（'):
        depth, k = 0, -1
        for i, ch in enumerate(rest):
            if ch == '（': depth += 1
            elif ch == '）':
                depth -= 1
                if depth == 0: k = i; break
        if k < 0: break
        lead += rest[:k + 1]; rest = rest[k + 1:].strip()
    if not rest: return False
    if SOFT.search(lead): return False
    return True


def spoken(said):
    return [x for x in said if x['n'] and '（手機）' not in x['n']]


async def said_since(pg, n0):
    return (await pg.evaluate("window.__SAY2||[]"))[n0:]


async def start_scene(pg, cdp, run, sc):
    d = await P.day_of(pg, sc['key'])
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 1}, 'contacts': {}, 'flags': dict(BASEF)}
    st.update(day=d['d'], weekday=d['wd'], hour=sc['hour'], zone=sc['zone'], pos=None, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in ('library', 'library_hall', 'library_b1', 'wancai', 'linze', 'cafe', 'noodle', 'gongguan', 'wenzhou', 'lawlib', 'classroom', 'campus')}
    run.setup('[前置] 讀檔到 %s（%s 第 %s 週，週%s）%.2f 時 %s（%s）' % (d['key'], d['term'], d['week'], d['wd'], sc['hour'], sc['zone'], sc['name']))
    await P.load(pg, cdp, st, quiet=True)
    await P.prep(pg, cdp, run, PREP_JS, [sc['cid'], sc['cid'] == 'heroine_05'], label='SOCIAL.meet %s＋熟悉度 25（認識、有點熟）' % sc['cid'])
    await pg.evaluate(HOOK)
    w = await P.wait_present(pg, sc['cid'], 90)
    loc = await pg.evaluate(WHERE_JS % J(sc['cid']))
    run.note('%s：%s 在 %s' % (sc['name'], sc['cid'], J(loc)))
    if loc.get('here') and (loc['me']['lv'] != loc['lv'] or loc['me']['d'] > 12):
        await P.place_near(pg, run, loc['x'], loc['z'], R=4.0, lv=loc['lv'], what='%s 旁邊（同一層 lv%d）' % (sc['cid'], loc['lv']))
    return w, loc


async def talk(pg, cdp, run, sc, k):
    n0 = await pg.evaluate(HOOK)
    nod0 = await pg.evaluate(NODREC_JS % J(sc['cid']))
    r = await P.talk_to(pg, cdp, run, sc['cid'], '%s 第 %d 次說話' % (sc['name'], k), picks=('就這樣',), max_s=TALK_MAX)
    said = await said_since(pg, n0)
    nod1 = await pg.evaluate(NODREC_JS % J(sc['cid']))
    loc = await pg.evaluate(WHERE_JS % J(sc['cid']))
    shot = await run.shot(pg, '%s_talk%d' % (sc['tag'], k))
    run.note('%s 第 %d 次：GAME.say／caption %s；libNod %s→%s；位置 %s' % (sc['name'], k, J([[x['n'], x['shown']] for x in said])[:1500], J(nod0['libNod']), J(nod1['libNod']), J(loc)))
    TRANS['scenes'].append({'scene': sc['tag'], 'k': k, 'said': said, 'dialog': r, 'libNod': [nod0, nod1], 'where': loc, 'shot': os.path.basename(shot)})
    return r, said, nod1, loc


def box_has(r, text):
    lines = [t for _, t in ((r or {}).get('lines') or [])]
    return any(text.startswith(t) or t.startswith(text[:8]) for t in lines if t)


async def quiet_scene(pg, cdp, run, sc):
    w, loc0 = await start_scene(pg, cdp, run, sc)
    if not run.check('%s：前置——%s 在這一區、站在讀書區' % (sc['name'], sc['cid']), bool(loc0.get('here')) and loc0.get('npcStudyOwn') and not loc0.get('hidden'), J(loc0)): return
    nod = NOD[sc['sex']]
    r1, s1, n1, l1 = await talk(pg, cdp, run, sc, 1)
    only_nod = len(s1) == 1 and s1[0]['n'] == '' and s1[0]['raw'] == nod
    run.check('%s：今天第一次碰到 %s——按說話只點頭（GAME.say 只有一句旁白「%s」，沒有人開口）' % (sc['name'], sc['cid'], nod), bool(r1 and r1['started']) and only_nod,
              J({'say': [[x['n'], x['raw']] for x in s1][:8], '對話框': (r1 or {}).get('lines')}))
    run.check('%s：玩家看得到點頭那一句（對話框 startswith）' % sc['name'], box_has(r1, nod), J((r1 or {}).get('lines')))
    run.check('%s：記在存檔 G.libNod（今天、%s）' % (sc['name'], sc['cid']), n1['seen'] and n1['today'], J(n1))
    r2, s2, n2, l2 = await talk(pg, cdp, run, sc, 2)
    sp = spoken(s2)
    bad = [x['shown'] for x in sp if not x['shown'].startswith(PRE) and needs_prefix(x['shown'])]
    pref = [x['shown'] for x in sp if x['shown'].startswith(PRE)]
    me = [x['shown'] for x in sp if x['n'] in ('祐廷',)]
    run.check('%s：第二次照常說話、不再點頭' % sc['name'], bool(r2 and r2['started']) and len(sp) > 0 and not any(x['raw'] == nod for x in s2),
              J({'say': [[x['n'], x['shown']] for x in s2][:12]}))
    run.check('%s：第二次每一句有名字的台詞都以「（小聲）」開頭（只有動作／已經小聲的除外），至少一句有前綴' % sc['name'], len(sp) > 0 and not bad and len(pref) > 0,
              J({'沒加的': bad[:6], '有加的': pref[:6], '祐廷的': me[:4], '位置': {'玩家讀書區': l2.get('meStudy'), 'quietNow': l2.get('quietNow')}}))
    if pref:
        run.check('%s：玩家看得到「（小聲）」（對話框 startswith）' % sc['name'], any(t.startswith(PRE) for _, t in ((r2 or {}).get('lines') or [])), J((r2 or {}).get('lines')))


async def loud_scene(pg, cdp, run, sc):
    w, loc0 = await start_scene(pg, cdp, run, sc)
    if not run.check('%s：前置——%s 在這一區' % (sc['name'], sc['cid']), bool(loc0.get('here')) and not loc0.get('hidden'), J(loc0)): return
    r1, s1, n1, l1 = await talk(pg, cdp, run, sc, 1)
    sp = spoken(s1)
    run.check('%s：第一次就照常說話、沒有點頭' % sc['name'], bool(r1 and r1['started']) and len(sp) > 0 and not any(x['raw'] in NOD.values() for x in s1), J({'say': [[x['n'], x['shown']] for x in s1][:10]}))
    run.check('%s：沒有任何一句加「（小聲）」' % sc['name'], len(sp) > 0 and not any(PRE in x['shown'] for x in s1), J([x['shown'] for x in sp][:10]))
    run.check('%s：G.libNod 沒有記 %s' % (sc['name'], sc['cid']), not n1['seen'], J(n1))


async def main():
    os.makedirs(OUT, exist_ok=True)
    run = L.Run('cc_libwhisper', OUT)
    print('cc_libwhisper_probe  SHA=%s  URL=%s  SCENES=%s' % (SHA, URL, ','.join(ONLY) or 'all'), flush=True)
    t0 = time.time()
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.set_default_timeout(180000)
        try:
            await pg.goto(URL)
            if run.check('遊戲載入', await L.wait_loaded(pg, 300)):
                await P.init(pg)
                for sc in SCENES:
                    if ONLY and sc['tag'] not in ONLY: continue
                    try:
                        await (quiet_scene if sc['quiet'] else loud_scene)(pg, cdp, run, sc)
                    except Exception:
                        run.check('%s：流程沒有例外' % sc['name'], False, traceback.format_exc()[-1500:])
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
