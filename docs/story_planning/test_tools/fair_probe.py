"""BB-C 10-27：BB_TEST_QUEUE_1027 第 5k 節（社博照實際、學姊訊息、麵店團長桌、健身句、烤肉；使用者 X109、X110、X113、X114）＋5r 第 1 點（社博顧攤的人照距離藏）的瀏覽器驗收。
實作：1cb7bcbb3（36 頂＋十五攤＋顧攤的人＋人流）、5b227d3aa（y1fb：健身句、烤肉三行、麵店長桌、學姊事務版訊息）、b1a71c1a3（AA_489／491）、fe4d31a86（顧攤的人 LOD）。
程式：src/clubfair3d.js、src/data/club_fair.js、src/data/club_fair_expo_layout.js、src/data/noodle_table.js、src/msg3d.js、src/fit3d.js、story3d.js（ndlTalk*、中秋烤肉 OUT.plan）、events.js（ev_sis_club_expo、ev_mid_autumn_bbq、ev_y2_club_expo）。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。預設不用 ?turbo（turbo 把 GM.sleep 壓到 120 ms，時間差和真機不同）。

用法：LW_TESTS=<工作樹>/tests MODE=<模式> python3 fair_probe.py '<URL>/index.html' <輸出資料夾>
  MODE（逗號可以接好幾個，一個模式開一次瀏覽器）：
    hints   第 1 項：9/1 08:00 行事曆、9/1～9/5 傅鐘旁公告欄、9/4 21:00 全班群組系學會、9/5 21:00 家族群組 Kevin、9/6 起床提示框（床睡覺）；9/6 公告欄不在
    fair    第 2 項＋5r-1：9/6 10:00 以後 36 頂＋舞台、每頂有人、大道中間有人走；吉他社填表／再按填過了；攝影社、桌遊社第二次只出招牌；法服學姊（站在帳篷前）＋之後學長一句；
            服務台十五攤選單 → 魔術社；攤位附近站著有喊話；舞台前旁白；四張截圖；人有沒有穿進帳篷、浮在外面；顧攤的人照距離藏；16:00 以後互動點消失、顧攤的人收掉
    missed  第 3 項：錯過社博，第 5 週週一 19:00 吉他社社課第一句「（你在門口填了表。）」
    sismsg  第 4 項（X110）：9/3 加了學姊好友＝手機傳訊息有事務版話題＋「問社博」，12:10 回兩則；9/6 16:00 以後換「問法服」
    noodle  第 5 項（X113）：9/16（二）17:00～21:00 在麵店團群組、走進阿鳳麵店兩秒後長桌閒聊；下一個麵店日（9/18）是下一則
    gymline 第 6 項：沒辦健身房卡、體能 25 以上，見到阿凱、明軒、以安、沛珊是新句（不說「健身房」）
    bbq     第 7 項（X114）：中秋烤肉，認識語彤＝三行交代（旁白、語彤、旁白）；BBQ_YT=0＝不認識語彤（三行都沒有）
    fair2   第 8 項：大二 2026-09-12 社博 36 頂有人顧攤，走到攤位那一排觸發「今年，你站在攤位後面。」
    perf    第 9 項：社博那天校園 fps（大道往東、往西）、可見的人數、三角形數；平常的週六同一個位置對照；換區域時間
  QUIET=1（預設，fair2、perf 以外）＝【捷徑】讀檔時關掉條件事件（EVENTS.tick／onEnter），只測這一節的系統，避免開學頭幾天的主線插進來；QUIET=0 照實跑
  DEADLINE＝每個模式最多幾秒（預設 1500）

【前置／捷徑】總表（每一步也印在 log 的「[前置／捷徑]」）：
  - 最小存檔（tests/playlib.py load_state＝GAME.defaults＋這些欄位）：法律系大一、introDone 等開局旗標、MET_ZHE；
    「開學改 9/1 的新局」＝LAW_START_DAY＝dayOfKey('2025-08-29')、MAIN_D1＝STORY.MAIN_D1_NEW（STORY.week1Start 成立；社博是 9/6（六），不是舊局的 9/30）。
  - 群組（PHONE.join）、熟悉（SOCIAL.remember FIRST_MET）、旗標（BBQ_YES、SIS_CONTACTED、CLUB_*）用 console 寫，各模式註解寫明。
  - 日子、時間撥動＝【捷徑】（G.day／hour／weekday，照 zrlast_probe 的 jump）；換區域盡量走過去按門；遠的用 GAME.enter（＝手機快速前往，標【捷徑】）。
  - 鏡頭轉向（E.cam.yaw）＝【捷徑】，只為了截圖的構圖。
"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
MODES = [m for m in os.environ.get('MODE', 'fair').split(',') if m]
QUIET_ENV = os.environ.get('QUIET')
DEADLINE = int(os.environ.get('DEADLINE', '1500'))
os.makedirs(OUT, exist_ok=True)

# ---------- 頁面裡的記錄：每一句台詞（GM.say）、選項（GM.choose）、字幕（#caption 的變化＋GM.caption）、提示框（GM.toast）、日期卡 ----------
HOOK = r"""(()=>{ if(window.__FPH) return; window.__FPH=1; window.__LOG=[];
  const P=(k,w,t)=>{ try{ const G=GAME.G; window.__LOG.push({k, w:w==null?'':String(typeof w==='object'?(w.name||w.charId||''):w), t:String(t==null?'':t), d:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2)}); }catch(e){} };
  const os=GAME.say; if(os) GAME.say=function(w,t){ P('say',w,t); return os.apply(this,arguments); };
  const oc=GAME.choose; if(oc) GAME.choose=function(opts){ try{ P('opts','',(opts||[]).map(o=>o&&(o.t||o.text)||'').join('｜')); }catch(e){} return oc.apply(this,arguments); };
  const ot=GAME.toast; if(ot) GAME.toast=function(t){ P('toast','',t); return ot.apply(this,arguments); };
  const ok=GAME.titleCard; if(ok) GAME.titleCard=function(a,b){ P('card',a,b); return ok.apply(this,arguments); };
  const el=document.getElementById('caption'); if(el){ let last=''; new MutationObserver(()=>{ const t=(el.textContent||'').trim(); if(t&&t!==last&&!el.classList.contains('hide')){ last=t; P('cap','',t); } }).observe(el,{childList:true,subtree:true,characterData:true,attributes:true}); }
})()"""
LOGLEN = "(window.__LOG||[]).length"
LOGFROM = "(n=>(window.__LOG||[]).slice(n))"
# 手機訊息（tag、群組、誰、文字）
MSGS = "(GAME.G.msgs||[]).map(m=>({tag:m.tag||'', th:(typeof PHONE!=='undefined'&&PHONE.th)?PHONE.th(m):(m.th||''), from:m.from||'', name:m.name||'', text:m.text||'', d:m.day, h:m.h}))"
DBG = """(()=>{ const D=GAME.D, E=GAME.E, P=E.player.obj.position, it=document.getElementById('interact'); return {zone:GAME.G.zone, key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2), x:+P.x.toFixed(1), z:+P.z.toFixed(1),
  depth:D.busyDepth|0, dlg:!!D.active, busy:!!E.player.busy, it:(it&&!it.classList.contains('hide'))?(document.getElementById('interactLabel').textContent||''):''}; })()"""

class Ctx:
    def __init__(s, run, pg, cdp, errs): s.run, s.pg, s.cdp, s.errs = run, pg, cdp, errs; s.t0 = time.time()
    def late(s): return time.time() - s.t0 > DEADLINE

async def log_from(c, n): return await c.pg.evaluate(LOGFROM + "(%d)" % n)
async def mark(c): return await c.pg.evaluate(LOGLEN)
def texts(L_, kinds=('say',)): return [x['t'] for x in L_ if x['k'] in kinds]

async def phone_open(pg):
    return await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()")
async def close_phone(pg):
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b&&b.offsetParent) b.click(); })()"); await pg.wait_for_timeout(500)

async def drain(c, pref=None, secs=120):
    """對話點過去、選項照偏好（文字包含）點，手機自己打開就關掉；回傳 True＝演完、玩家空下來"""
    pg, cdp = c.pg, c.cdp; t0 = time.time(); pref = pref or []
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            r = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; let e=null; for(const x of w){ e=bs.find(b=>b.textContent.trim().includes(x)); if(e) break; } const ok=b=>!b.classList.contains('dim')&&!b.disabled; e=e||bs.find(b=>ok(b)&&/^(算了|不用了|先這樣|就這樣|沒事|先不)/.test(b.textContent.trim()))||bs.find(ok)||bs[0];   /* 沒有偏好：不選灰掉的（BB-C 10-28 gymline：一直點「去一盞喝茶（你們只打過招呼…）」灰的選項，繞了 15 次）、先選收掉的 */ try{ e.scrollIntoView({block:'nearest'}); }catch(_){} const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim(),bs.map(b=>b.textContent.trim())]; })(%s)" % json.dumps(pref))
            c.run.note('▶ 選「%s」（選項：%s）' % (r[2], ' / '.join(r[3]))); await L.touch_tap(cdp, r[0], r[1]); await pg.wait_for_timeout(900); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if await phone_open(pg): await close_phone(pg); continue
        if s['busy']: await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(900); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return True
    return False

async def jump(c, dexpr, h, why, zone=None):
    """【捷徑】日子撥到 dexpr（頁面裡算）、時間 h；zone 有給＝GAME.enter（同手機快速前往）"""
    k = await c.pg.evaluate("(([d,h])=>{ const G=GAME.G; G.day=d; G.hour=h; if(GAME.E) GAME.E.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; if(GAME.updateHUD) GAME.updateHUD(); return CALENDAR.dateOf(d).key; })([%s,%s])" % (dexpr, h))
    c.run.setup('[捷徑] 日子撥到 %s %.2f（%s）' % (k, h, why))
    if zone:
        await c.pg.evaluate("void GAME.enter(%s)" % json.dumps(zone)); await c.pg.wait_for_timeout(6000); c.run.setup('[捷徑] GAME.enter(%s)（同手機快速前往）' % zone)
    await c.pg.wait_for_timeout(1500); return k

async def wait_hour(c, h, secs=600, pref=None):
    """遊戲時間照走到 h（中間有對話照點；手機自己打開就關掉）"""
    t0 = time.time()
    while time.time() - t0 < secs:
        g = await c.pg.evaluate("+GAME.G.hour")
        if g >= h: return True
        s = await L.state(c.pg)
        if s['dlg'] or s['choices'] or s['busy']: await drain(c, pref, secs=90); continue
        if await phone_open(c.pg): await close_phone(c.pg)
        await c.pg.wait_for_timeout(2000)
    c.run.note('⚠ 等不到 %.2f（現在 %s）' % (h, json.dumps(await c.pg.evaluate(DBG), ensure_ascii=False))); return False

async def walk(c, x, z, label, near=0.9, max_s=300):
    ok = await L.go_to(c.pg, c.cdp, c.run, x, z, near, label, max_s=max_s)
    if not ok: c.run.note('⚠ 走不到 %s（%s）' % (label, json.dumps(await c.pg.evaluate(DBG), ensure_ascii=False)))
    return ok

async def press(c, want, tries=20):
    """等互動鍵出現 want（文字包含），觸控按下去；回傳按到的文字"""
    lab = ''
    for _ in range(tries):
        lab = (await c.pg.evaluate(DBG))['it']
        if want in lab: await L.tap(c.pg, c.cdp, '#interact'); await c.pg.wait_for_timeout(900); return lab
        await c.pg.wait_for_timeout(700)
    c.run.note('⚠ 互動鍵沒有「%s」（最後是「%s」）' % (want, lab)); return None

async def yaw(c, a, why):
    await c.pg.evaluate("(a=>{ GAME.E.cam.yaw=a; })(%s)" % a); c.run.setup('[捷徑] 鏡頭轉向（%s，只為了截圖構圖）' % why); await c.pg.wait_for_timeout(2500)

Y1F = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True}
async def load_new(c, key, h, zone, pos=None, flags=None, js='', quiet=True, why='', newgame=True, extra=None):
    """最小存檔（法律系大一）；newgame＝開學改 9/1 的新局（LAW_START_DAY、MAIN_D1）"""
    pg = c.pg
    dk = await pg.evaluate("(k=>({d:STORY.dayOfKey(k), law0:STORY.dayOfKey('2025-08-29'), m1:(STORY.MAIN_D1_NEW!=null?STORY.MAIN_D1_NEW:STORY.dayOfKey('2025-09-03'))}))(%s)" % json.dumps(key))
    F = dict(Y1F)
    if newgame: F.update({'LAW_START_DAY': dk['law0'], 'MAIN_D1': dk['m1']})
    F.update(flags or {})
    st = {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': dk['d'], 'hour': h, 'energy': 100, 'money': 22000, 'zone': zone, 'pos': pos, 'weather': 'clear', 'flags': F,
          'events': {'done': {}, 'last': {}, 'count': 0}}
    st.update(extra or {})
    st['weekday'] = await pg.evaluate("(d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; })(%d)" % dk['d'])
    await L.load_state(pg, st, quiet_events=quiet); await pg.wait_for_timeout(5000)
    await pg.evaluate(HOOK)
    if js: await pg.evaluate("(()=>{ const G=GAME.G, D=k=>STORY.dayOfKey(k), MET=id=>SOCIAL.remember(id,'FIRST_MET',''); %s })()" % js)
    wk = await pg.evaluate("!!(STORY.week1Start&&STORY.week1Start(GAME.G))")
    c.run.setup('[前置] %s：最小存檔（法律系大一%s）%s %.2f %s pos %s；旗標 %s；console：%s%s' % (why, '，開學改 9/1 的新局' if newgame else '', key, h, zone, json.dumps(pos), json.dumps(flags or {}, ensure_ascii=False), js or '（無）', '；QUIET＝關掉條件事件' if quiet else ''))
    c.run.note('STORY.week1Start＝%s' % wk)
    if newgame: c.run.check('前置：開學改 9/1 的新局（STORY.week1Start）', wk)
    await close_phone(pg); await drain(c, secs=40)

def quiet_for(mode): return (QUIET_ENV != '0') if mode not in ('fair2', 'perf') else (QUIET_ENV == '1')

# =====================================================================================================
async def m_hints(c):
    pg, run = c.pg, c.run; HN = None
    await load_new(c, '2025-08-31', 22.0, 'dorm', flags={'FAM_GROUP_SENT': True}, quiet=quiet_for('hints'),
                   js="PHONE.join(G,'law_class','法律系（全班）'); PHONE.join(G,'family_law','法律系直屬家族');", why='hints：8/31 晚上宿舍、在全班群組和家族群組')
    HN = await pg.evaluate("CLUB_FAIR.HINTS")
    run.check('前置：社博在週六（CLUBFAIR.hintOn）、是 9/6', await pg.evaluate("CLUBFAIR.hintOn(GAME.G)&&CALENDAR.dateOf(CLUBFAIR.fairDay(GAME.G)).key==='2025-09-06'"))
    # 9/1 08:00 行事曆
    await jump(c, "STORY.dayOfKey('2025-09-01')", 7.92, '9/1 08:00 行事曆那則前')
    await wait_hour(c, 8.08, 600)
    M = await pg.evaluate(MSGS); cal = [m for m in M if m['tag'] == 'fair_y1_cal']
    run.check('1. 9/1 08:00 手機行事曆：「%s」' % HN['cal'], len(cal) == 1 and cal[0]['text'] == HN['cal'] and cal[0]['th'] == 'sys', json.dumps(cal, ensure_ascii=False))
    # 9/3 傅鐘旁的公告欄
    await jump(c, "STORY.dayOfKey('2025-09-03')", 12.0, '9/3 中午', zone='campus')
    B = await pg.evaluate("CLUB_FAIR.BOARD")
    await pg.evaluate("(([x,z])=>{ GAME.E.placeAt(GAME.E.player,x,z,0); })([%s,%s])" % (B['x'] + 3.0, B['z'] - 2.0)); run.setup('[捷徑] 站到傅鐘旁公告欄附近 3 m')
    n0 = await mark(c); await walk(c, B['x'], B['z'], '傅鐘旁的公告欄', near=0.8)
    lab = await press(c, '公告欄'); await pg.wait_for_timeout(2500)
    caps = texts(await log_from(c, n0), ('cap',))
    run.check('1. 9/1～9/5 傅鐘旁公告欄：按下去字幕「%s」' % HN['board'][:20], bool(lab) and any(HN['board'] in t for t in caps), json.dumps(caps, ensure_ascii=False))
    await run.shot(pg, 'hints_board')
    # 9/4 21:00 系學會、9/5 21:00 Kevin
    await jump(c, "STORY.dayOfKey('2025-09-04')", 20.9, '9/4 21:00 系學會那則前'); await wait_hour(c, 21.08, 600)
    await jump(c, "STORY.dayOfKey('2025-09-05')", 20.9, '9/5 21:00 Kevin 那則前'); await wait_hour(c, 21.08, 600)
    M = await pg.evaluate(MSGS); dept = [m for m in M if m['tag'] == 'fair_y1_dept']; kev = [m for m in M if m['tag'] == 'fair_y1_kevin']
    run.check('1. 9/4 21:00 全班群組（系學會）：「%s」' % HN['dept'], len(dept) == 1 and dept[0]['text'] == HN['dept'] and dept[0]['th'] == 'g:law_class' and dept[0]['h'] is not None and abs(dept[0]['h'] - 21) < 0.05, json.dumps(dept, ensure_ascii=False))
    run.check('1. 9/5 21:00 家族群組 Kevin：「%s」' % HN['kevin'], len(kev) == 1 and kev[0]['text'] == HN['kevin'] and kev[0]['th'] == 'g:family_law' and kev[0]['from'] == 'kevin', json.dumps(kev, ensure_ascii=False))
    # 9/5 晚上回宿舍床上睡覺 → 9/6 起床提示框
    await jump(c, "STORY.dayOfKey('2025-09-05')", 23.0, '9/5 23:00 回宿舍', zone='dorm')
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>/床|睡/.test(i.label||'')); return it?[it.x,it.z,it.label]:null; })()")
    n0 = await mark(c)
    if bed:
        await walk(c, bed[0], bed[1], bed[2], near=0.9); await press(c, bed[2][:2])
        await drain(c, pref=['睡覺', '睡'], secs=240)
    else: run.note('⚠ 宿舍找不到床的互動點')
    k = await pg.evaluate("CALENDAR.dateOf(GAME.G.day).key"); L2 = await log_from(c, n0)
    toasts = texts(L2, ('toast', 'cap'))
    run.check('1. 床睡覺 → 9/6 早上起床', k == '2025-09-06', k)
    run.check('1. 9/6 起床提示框：「%s」' % HN['wake'], any(HN['wake'] in t for t in toasts), json.dumps(toasts[-6:], ensure_ascii=False))
    await run.shot(pg, 'hints_wake')
    await jump(c, "STORY.dayOfKey('2025-09-06')", 9.0, '9/6 早上去校園', zone='campus')
    run.check('1. 9/6（社博當天）傅鐘旁的公告欄不在（換成服務台）', not await pg.evaluate("GAME.E.interactables.some(i=>i.fairBoard)"))

# =====================================================================================================
GEOM = r"""(()=>{ if(window.__FG) return; window.__FG={staffBad:{}, crowdBad:{}, lodBad:{}, lodN:0, samples:0};
  const X=CLUB_FAIR_EXPO, half=X.tent.w/2;
  const inTent=(x,z)=>X.tents.some(t=>Math.abs(x-t.x)<half-0.05&&Math.abs(z-t.z)<half-0.05);
  window.__FGI=setInterval(()=>{ try{ const E=GAME.E, cam=E.camera||(E.cam&&E.cam.camera); const R=window.__FG; R.samples++;
    const lev=E.q&&E.q.level, lim=(CLUBFAIR.STAFF_LOD||{})[lev]||35;
    for(const n of E.npcs){ if(!n||!n.obj) continue; const p=n.obj.position;
      if(n.fairStaff){ const t=X.tents.find(q=>q.id===n.fairStaff); const off=!t||Math.abs(p.x-t.x)>half||Math.abs(p.z-t.z)>half, fl=Math.abs(p.y)>0.25;
        if(off||fl) R.staffBad[n.fairStaff]={x:+p.x.toFixed(2),z:+p.z.toFixed(2),y:+p.y.toFixed(2),off,fl};
        if(cam){ const cd=Math.hypot(cam.position.x-p.x,cam.position.z-p.z); if(n.obj.visible&&cd>lim+0.5) R.lodBad[n.fairStaff]={cd:+cd.toFixed(1),lim,lev}; if(n.obj.visible) R.lodN++; } }
      else if(n.isExtra&&(n.fairCrowd||n.route||n.path)){ if(!n.fairCrowd&&!(Math.abs(p.z)<16&&p.x>-100&&p.x<75)) continue; if((n.lv|0)>0) continue;   /* BB-C 00:3x：只看社博那一段（椰林大道）；萬才館大樓梯、陽台（校園第 1 層）上的路人 y>0 是走在樓梯上，不是浮起來（第一版誤判 walker y 0.33／3.3 @ x88） */
        const k=(n.fairCrowd?'crowd':'walker')+'@'+(n.id||n.obj.uuid.slice(0,6)); if(inTent(p.x,p.z)||Math.abs(p.y)>0.25) R.crowdBad[k]={x:+p.x.toFixed(2),z:+p.z.toFixed(2),y:+p.y.toFixed(2),lv:n.lv|0}; } } }catch(e){ window.__FG.err=String(e); } },500); })()"""
FAIRSTAT = """(()=>{ const E=GAME.E; const st=E.npcs.filter(n=>n&&n.fairStaff), cr=E.npcs.filter(n=>n&&n.fairCrowd), bo=E.interactables.filter(i=>i.fairBooth);
  return {q:E.q&&E.q.level, staff:st.length, staffVis:st.filter(n=>n.obj&&n.obj.visible).length, crowd:cr.length, booths:bo.length, boothsShown:bo.filter(i=>!i.hidden).length, open:CLUBFAIR.open(GAME.G),
    tents:typeof CLUB_FAIR_EXPO!=='undefined'?CLUB_FAIR_EXPO.tents.length:0, bg:typeof CLUB_FAIR_EXPO!=='undefined'?CLUB_FAIR_EXPO.tents.filter(t=>t.kind==='bg').length:0,
    stageModel:!!(E.scene&&E.scene.getObjectByName&&(E.scene.getObjectByName('club_fair_expo')||E.scene.getObjectByName('stage'))), h:+(+GAME.G.hour).toFixed(2)}; })()"""

async def booth(c, bid, want_say, pref=None, label=None):
    """走到攤位前、按招牌名；回傳這一次的台詞（含旁白）和字幕"""
    pg = c.pg; P = await pg.evaluate("(id=>CLUB_FAIR.POS[id])(%s)" % json.dumps(bid)); sign = label or await pg.evaluate("(id=>CLUB_FAIR.BOOTHS.find(b=>b.id===id).sign)(%s)" % json.dumps(bid))
    await walk(c, P['x'], P['z'], sign, near=0.7)
    n0 = await mark(c); lab = await press(c, sign[:3]); await drain(c, pref=pref, secs=150); await pg.wait_for_timeout(1200)
    Lg = await log_from(c, n0); return lab, texts(Lg), texts(Lg, ('cap',)), Lg

async def m_fair(c):
    pg, run = c.pg, c.run
    await load_new(c, '2025-09-06', 9.85, 'campus', pos={'x': -88.0, 'z': 0.0, 'yaw': -1.5708, 'lv': 0, 'y': 0}, quiet=quiet_for('fair'),
                   js="for(const k of Object.keys(G.flags)) if(/^CLUB_|^FAIR_|^SIS_CLUB_EXPO$|^lawclub$/.test(k)) delete G.flags[k];",
                   why='fair：9/6（六）09:51 椰林大道西端 (-88, 0)、面向東；沒加入任何社團、沒看過任何攤位')
    s0 = await pg.evaluate(FAIRSTAT); run.note('09:51 社博狀態 %s' % json.dumps(s0, ensure_ascii=False))
    run.check('2. 10:00 以前：十五攤的互動點藏著', s0['booths'] == 15 and s0['boothsShown'] == 0, json.dumps(s0))
    await wait_hour(c, 10.02, 900)
    await pg.evaluate(GEOM)
    s1 = await pg.evaluate(FAIRSTAT); run.note('10:01 社博狀態 %s' % json.dumps(s1, ensure_ascii=False))
    want_staff = {'high': 36, 'medium': 36 - s1['bg'] + round(s1['bg'] * 3 / 4), 'low': 36 - s1['bg'] + round(s1['bg'] / 2)}.get(s1['q'], None)
    run.check('2. 36 頂帳篷（CLUB_FAIR_EXPO）、十五攤互動點打開', s1['tents'] == 36 and s1['boothsShown'] == 15, json.dumps(s1))
    run.check('2. 顧攤的人：每頂一個（畫質 %s：背景攤照比例，應該 %s 個；互動十五攤＋服務台一定有）' % (s1['q'], want_staff), want_staff is not None and abs(s1['staff'] - want_staff) <= 1, json.dumps(s1))
    cr = await pg.evaluate("(()=>{ const C=GAME.E.npcs.filter(n=>n&&n.fairCrowd&&n.obj); return {walk:C.filter(n=>!n.frozen).length, stand:C.filter(n=>n.frozen).length, walkMid:C.filter(n=>!n.frozen&&Math.abs(n.obj.position.z)<3.4).length}; })()")
    run.check('2. 大道中間有人走（拿傳單的新生，大道中間 |z|<3.4）、攤位前有人停（填表的人）', cr['walk'] >= 2 and cr['walkMid'] >= 1 and cr['stand'] >= 2, json.dumps(cr))
    await yaw(c, -math.pi / 2, '大道西端往東看'); await run.shot(pg, 'fair_A_avenue_east')
    # 吉他社：兩句 → 填表 → 加入；再按＝填過了
    lab, sy, cp, _ = await booth(c, 'guitar', None, pref=['填表'])
    G1 = ['會不會彈都沒關係，我們從 C 和弦教起。', '社課週一、週三晚上，萬才館。第五週開始。', '你在「吉他社」的攤位填了表。']
    run.check('2. 吉他社：學長兩句 →「填表」→「你在「吉他社」的攤位填了表。」、加入（CLUB_club_guitar）', bool(lab) and all(t in sy for t in G1) and await pg.evaluate("GAME.G.flags.CLUB_club_guitar===true"), json.dumps(sy, ensure_ascii=False))
    n0 = await mark(c); await press(c, '吉他'); await drain(c, secs=60); sy2 = texts(await log_from(c, n0))
    run.check('2. 吉他社再按一次：「「吉他社」的表你已經填過了。」', sy2 == ['「吉他社」的表你已經填過了。'], json.dumps(sy2, ensure_ascii=False))
    # 攤位附近站著：喊話（大約每 18 秒一句）
    n0 = await mark(c); SH = await pg.evaluate("CLUB_FAIR.SHOUTS"); t0 = time.time(); got = []; f0 = await pg.evaluate("GAME.E.frame|0")
    while time.time() - t0 < 75:
        got = [t for t in texts(await log_from(c, n0), ('cap',)) if t in SH]
        if got: break
        await pg.wait_for_timeout(3000)
    fr = (await pg.evaluate("GAME.E.frame|0")) - f0
    # BB-C 00:3x：喊話是 STORY.tick 每 30 格畫面一次（game3d.js:456）、36 次一句＝真機 60 fps 約 18 秒；SwiftShader 1～4 fps 要好幾分鐘，75 秒等不到不是遊戲問題。
    # 等不到而且 STORY.tick 不到 36 次：【捷徑】在攤位旁直接呼叫 CLUBFAIR.tick(GAME) 36 次（＝真機 18 秒裡會跑的那幾次），看喊話有沒有出
    run.note('等了 %.0f 秒、畫面 %d 格＝STORY.tick 約 %d 次（36 次喊一句）' % (time.time() - t0, fr, fr // 30))
    if not got and fr // 30 < 36:
        run.setup('[捷徑] STORY.tick 不到 36 次（SwiftShader 太慢）：在攤位旁直接呼叫 CLUBFAIR.tick(GAME) 36 次')
        await pg.evaluate("(()=>{ for(let i=0;i<36;i++) CLUBFAIR.tick(GAME); })()"); await pg.wait_for_timeout(1500)
        got = [t for t in texts(await log_from(c, n0), ('cap',)) if t in SH]
    run.check('2. 在攤位附近站著：顧攤的人喊話（畫面上方小字；真機約 18 秒一句）', bool(got), json.dumps(got, ensure_ascii=False) + ' %.0f 秒' % (time.time() - t0))
    # 攝影社、桌遊社：第一次演、第二次只出招牌
    for bid, sign, first in (('photo', '攝影社', '我們每個月辦一次外拍。手機也可以，不一定要相機。'), ('boardgame', '桌遊社', '規則五分鐘就會。來，坐。')):
        lab, sy, cp, _ = await booth(c, bid, None)
        run.check('2. %s第一次：「%s」' % (sign, first), bool(lab) and first in sy, json.dumps(sy, ensure_ascii=False))
        n0 = await mark(c); await press(c, sign[:2]); await pg.wait_for_timeout(2500); Lg = await log_from(c, n0)
        run.check('2. %s第二次：只出招牌名（字幕「%s」、沒有台詞）' % (sign, sign), not texts(Lg) and any(sign == t or t.endswith(sign) for t in texts(Lg, ('cap',))), json.dumps(Lg, ensure_ascii=False))
    # 法服：學姊站在帳篷前 → 第一次學姊那一段；之後學長一句
    sis = await pg.evaluate("(()=>{ const n=GAME.E.npcs.find(n=>n&&(n.charId==='heroine_05'||n.id==='sis')&&n.obj); return n?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),vis:!n.hidden}:null; })()")
    run.check('2. 法服帳篷前站著學姊（activities.js 學姊社博那一筆 (-48.75, 11.25)）', bool(sis) and math.hypot(sis['x'] + 48.75, sis['z'] - 11.25) < 2.5, json.dumps(sis))
    LP = await pg.evaluate("CLUB_FAIR.POS.lawclub"); await walk(c, LP['x'], LP['z'] - 3.0, '法服帳篷南邊（拍學姊）', near=1.0)
    await yaw(c, math.pi, '面向南邊的法服帳篷和學姊（帳篷在大道南側 z +11.25；鏡頭在玩家的 (sin yaw, cos yaw) 那一側＝yaw π 鏡頭在北邊）'); await run.shot(pg, 'fair_C_lawclub_sis')
    lab, sy, cp, _ = await booth(c, 'lawclub', None, pref=['好', '聽'])
    run.check('2. 法服第一次：學姊那一段（「（椰林大道上一整排帳篷。你走到法服的攤位前。）」…）、記 SIS_CLUB_EXPO', bool(lab) and '（椰林大道上一整排帳篷。你走到法服的攤位前。）' in sy and await pg.evaluate("GAME.G.flags.SIS_CLUB_EXPO===true"), json.dumps(sy[:6], ensure_ascii=False))
    sis2 = await pg.evaluate("(()=>{ const n=GAME.E.npcs.find(n=>n&&(n.charId==='heroine_05'||n.id==='sis')&&n.obj); return n?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2)}:null; })()")
    run.check('2. 演完學姊還在帳篷前（SIS-EXPO-PRESENCE）', bool(sis2) and math.hypot(sis2['x'] + 48.75, sis2['z'] - 11.25) < 3.0, json.dumps(sis2))
    n0 = await mark(c); await press(c, '法律服務'); await drain(c, secs=60); sy2 = await log_from(c, n0)
    run.check('2. 法服第二次：顧攤的學長「隔週週六九點，萬才館一樓。第一次站旁邊聽就好。」', any(x['k'] == 'say' and x['t'] == '隔週週六九點，萬才館一樓。第一次站旁邊聽就好。' and '學長' in x['w'] for x in sy2), json.dumps(sy2, ensure_ascii=False))
    # 服務台：十五攤選單 → 魔術社
    SP = await pg.evaluate("ACTIVITIES.list.find(a=>a.id==='club_expo_y1s1').spot")
    await walk(c, SP['x'], SP['z'], '服務台', near=0.7)
    n0 = await mark(c); lab = await press(c, SP.get('label', '社團博覽會')[:4])
    for _ in range(20):
        s = await L.state(pg)
        if s['choices'] > 3: break
        if s['dlg']: await L.tap(pg, c.cdp, '#dlg')
        await pg.wait_for_timeout(700)
    s = await L.state(pg); await run.shot(pg, 'fair_D_service_menu')
    opts = [x['t'] for x in await log_from(c, n0) if x['k'] == 'opts']
    menu = opts[-1].split('｜') if opts else []
    run.check('2. 服務台：十五攤＋「逛完了」（吉他社寫「（已加入）」）', len(menu) == 16 and menu[-1] == '逛完了' and '吉他社（已加入）' in menu and '魔術社' in menu, json.dumps(menu, ensure_ascii=False))
    await drain(c, pref=['魔術社'], secs=120); sy = texts(await log_from(c, n0))
    MG = ['抽一張，不要給我看。', '……梅花七。', '（你手上的是紅心三。他把牌收回去，說再一次。）']
    run.check('2. 選魔術社：三句（學長兩句、旁白一句）', all(t in sy for t in MG), json.dumps(sy, ensure_ascii=False))
    # 舞台（10:30～15:30）
    if await pg.evaluate("+GAME.G.hour") < 10.55: await jump(c, 'GAME.G.day', 10.55, '舞台 10:30 開始以後')
    ST = await pg.evaluate("CLUB_FAIR.STAGE"); n0 = await mark(c)
    await walk(c, ST['x'], ST['z'] + 1.0, '舞台前面', near=1.5); await yaw(c, 0, '面向北邊的舞台'); await pg.wait_for_timeout(4000)
    SL = await pg.evaluate("Object.values(CLUB_FAIR.STAGE_LINES)"); caps = [t for t in texts(await log_from(c, n0), ('cap',)) if t in SL]
    run.check('2. 走到舞台前 (-25,-1)（10:30 以後）：舞台旁白', bool(caps), json.dumps(caps, ensure_ascii=False))
    await run.shot(pg, 'fair_B_stage')
    # 幾何、顧攤的人照距離藏（5r-1）
    g = await pg.evaluate("window.__FG")
    run.check('2. 顧攤的人都在自己的帳篷裡（3×3 m）、站在地上（沒有浮在外面）', not g['staffBad'], json.dumps(g['staffBad'], ensure_ascii=False)[:600])
    run.check('2. 停在攤位前的人、走路的新生沒有穿進帳篷、沒有浮起來', not g['crowdBad'], json.dumps(g['crowdBad'], ensure_ascii=False)[:600])
    run.check('5r-1. 顧攤的人照距離藏：鏡頭 %s m 外的都沒畫（畫質 %s）；記錄期間有被畫出來的（不是全藏）' % ((await pg.evaluate("(CLUBFAIR.STAFF_LOD||{})[GAME.E.q.level]")), s1['q']), not g['lodBad'] and g['lodN'] > 0, json.dumps({'bad': g['lodBad'], 'visSamples': g['lodN'], 'samples': g['samples'], 'err': g.get('err')}, ensure_ascii=False)[:600])
    # 16:00 收攤
    await jump(c, 'GAME.G.day', 15.95, '收攤前')
    await wait_hour(c, 16.03, 600)
    s2 = await pg.evaluate(FAIRSTAT); run.note('16:02 社博狀態 %s' % json.dumps(s2, ensure_ascii=False))
    run.check('2. 16:00 以後攤位互動點消失', s2['boothsShown'] == 0, json.dumps(s2))
    run.note('16:00 以後還在區域裡時顧攤的人 %d 個（populate 只在進區域時放；規格「顧攤的人收掉」看下面重新進來）' % s2['staff'])
    await pg.evaluate("void GAME.enter('campus')"); await pg.wait_for_timeout(7000); run.setup('[捷徑] GAME.enter(campus)（重新進校園＝離開再回來）')
    s3 = await pg.evaluate(FAIRSTAT)
    run.check('2. 16:00 以後重新進校園：顧攤的人收掉、沒有攤位互動點', s3['staff'] == 0 and s3['boothsShown'] == 0, json.dumps(s3))
    sis3 = await pg.evaluate("(()=>{ const n=GAME.E.npcs.find(n=>n&&(n.charId==='heroine_05'||n.id==='sis')&&n.obj); return n?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2)}:null; })()")
    run.note('16:00 以後學姊：%s（SIS-EXPO-PRESENCE：收攤走開＝不在法服帳篷前）' % json.dumps(sis3))
    run.check('2. 16:00 以後學姊不在法服帳篷前', not sis3 or math.hypot(sis3['x'] + 48.75, sis3['z'] - 11.25) > 3.0, json.dumps(sis3))

# =====================================================================================================
async def m_missed(c):
    pg, run = c.pg, c.run
    # BB-C 01:4x：第一版用「第 5 週週一」＝2025-09-29——那天是教師節補假（10/6 中秋也是），社課停＝門口直接進教室（工具選錯日子，不是遊戲問題）。
    # 改成在新局裡從第 5 週週一往後找第一個 ACTIVITIES.on(吉他社) 的日子（Node 算出來是 2025-10-01（三））
    k = await pg.evaluate("""(()=>{ const G=JSON.parse(JSON.stringify(GAME.G||{})); G.flags=Object.assign({},G.flags,{LAW_START_DAY:STORY.dayOfKey('2025-08-29'),MAIN_D1:(STORY.MAIN_D1_NEW!=null?STORY.MAIN_D1_NEW:STORY.dayOfKey('2025-09-04'))}); G.stage='law';
      const g=ACTIVITIES.list.find(a=>a.id==='club_guitar'), d0=STORY.termDay('Y1S1',5,1); for(let d=d0; d<d0+21; d++){ G.day=d; if(ACTIVITIES.on(g,d,G)) return CALENDAR.dateOf(d).key; } return CALENDAR.dateOf(d0).key; })()""")
    A = await pg.evaluate("(()=>{ const a=ACTIVITIES.list.find(a=>a.id==='club_guitar'); return a?{zone:a.zone,room:a.room,roomName:a.roomName,t0:a.t0,title:a.title,door:!!a.door}:null; })()")
    run.note('吉他社社課：%s；第 5 週週一＝%s' % (json.dumps(A, ensure_ascii=False), k))
    if not A: run.check('3. 找得到吉他社社課（activities.js club_guitar）', False); return
    # 社課在萬才館一樓多功能教室（room multi、door:true）：門口的互動點＝classes3d.js S.roomDoor →「參加：吉他社社課」→ CLS.attendActivity（clubfair3d.js 包住：旁白多一句）
    await load_new(c, k, A['t0'] - 0.12, A['zone'], quiet=quiet_for('missed'),
                   js="MET('heroine_04'); G.events.done.ev_ziqing_club=1; for(const k of Object.keys(G.flags)) if(/^CLUB_|^FAIR_/.test(k)) delete G.flags[k];",
                   why='missed：第 5 週週一（%s）社課前 7 分鐘、萬才館大廳；沒去社博、沒加入吉他社（子晴認識、ev_ziqing_club 演過＝避開她那一段，同 clubfair_1027_unit 第 9 項）' % k)
    run.check('3. 前置：沒去過社博（出席紀錄沒有）', not await pg.evaluate("ACTIVITIES.attendedAny(GAME.G,'club_expo_y1s1',CLUBFAIR.fairDay(GAME.G))"))
    door = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>/多功能/.test(i.label||'')); return it?[it.x,it.z,it.label,it.lv|0]:null; })()")
    run.note('多功能教室的門：%s' % json.dumps(door, ensure_ascii=False))
    if not door: run.check('3. 萬才館大廳找得到多功能教室的門', False); return
    await wait_hour(c, A['t0'], 600)
    await walk(c, door[0], door[1], door[2], near=0.8)
    n0 = await mark(c); lab = await press(c, '多功能'); await drain(c, pref=['參加：吉他社', '參加'], secs=240)
    Lg = await log_from(c, n0); sy = texts(Lg); op = [x['t'] for x in Lg if x['k'] == 'opts']
    run.note('門口的選項：%s' % json.dumps(op, ensure_ascii=False))
    run.check('3. 錯過社博、第一次去吉他社社課：第一句「（你在門口填了表。）」', bool(lab) and bool(sy) and sy[0] == '（你在門口填了表。）', json.dumps(sy[:4], ensure_ascii=False))
    run.check('3. 記 CLUB_club_guitar、CLUB_DOOR（沒有 FAIR_JOIN）', await pg.evaluate("GAME.G.flags.CLUB_club_guitar===true&&GAME.G.flags.CLUB_DOOR===true&&!GAME.G.flags.FAIR_JOIN"))
    await run.shot(pg, 'missed_door')

# =====================================================================================================
async def open_topics(c, pid):
    pg = c.pg
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhone'); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"friends\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
    ok1 = await pg.evaluate("(id=>{ const b=[...document.querySelectorAll('#phoneBody [data-msg]')].find(x=>x.dataset.msg===id); if(!b) return false; b.click(); return true; })(%s)" % json.dumps(pid)); await pg.wait_for_timeout(900)
    ok2 = await pg.evaluate("(id=>{ const b=document.querySelector('#phoneBody [data-msgto=\"'+id+'\"]'); if(!b) return false; b.click(); return true; })(%s)" % json.dumps(pid)); await pg.wait_for_timeout(900)
    tops = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgt]')].map(b=>({k:b.dataset.msgt, t:b.textContent.trim()}))")
    c.run.note('手機 → 朋友 → %s「訊息」%s →「傳訊息」%s → 話題 %s' % (pid, ok1, ok2, json.dumps(tops, ensure_ascii=False)))
    return tops

async def m_sismsg(c):
    pg, run = c.pg, c.run; S5 = 'heroine_05'
    await load_new(c, '2025-09-03', 11.92, 'campus', flags={'SIS_CONTACTED': True}, quiet=quiet_for('sismsg'), extra={'contacts': {S5: 0}},
                   js="G.contacts=G.contacts||{}; G.contacts.heroine_05=G.day; delete G.flags.SIS_W1; delete G.flags.met_sis;",
                   why='sismsg：9/3 11:55 校園；學姊接受了交友邀請（SIS_CONTACTED、contacts），還沒在現實見過')
    tops = await open_topics(c, S5)
    exp = next((t for t in tops if t['k'].endswith('|sis_expo')), None)
    run.check('4. 9/3 加了好友：手機能傳訊息給學姊（事務版話題），有「問社博」', bool(exp), json.dumps(tops, ensure_ascii=False))
    run.check('4. 事務版：沒有深夜閒聊那種話題（night）', not any(t['k'].endswith('|night') for t in tops), json.dumps(tops, ensure_ascii=False))
    if exp:
        await pg.evaluate("(k=>{ const b=document.querySelector('#phoneBody [data-msgt=\"'+k+'\"]'); if(b) b.click(); })(%s)" % json.dumps(exp['k'])); await pg.wait_for_timeout(1200)
        await close_phone(pg)
        await wait_hour(c, 12.25, 900)
        th = await pg.evaluate("(GAME.G.msgs||[]).filter(m=>(PHONE.th?PHONE.th(m):m.th)==='p:heroine_05').map(m=>({f:m.from,t:m.text,h:m.h}))")
        mine = [m for m in th if m['f'] == 'player']; hers = [m for m in th if m['f'] != 'player']
        run.check('4. 祐廷：「學姊，禮拜六的社博，法律系的大多參加什麼？」', bool(mine) and mine[-1]['t'] == '學姊，禮拜六的社博，法律系的大多參加什麼？', json.dumps(th, ensure_ascii=False))
        run.check('4. 12:10 學姊回兩則（照稿）', [m['t'] for m in hers[-2:]] == ['看你想做什麼。想練法律的，法服。想動的，系籃。', '我那天在法服顧攤。十點到四點。'] and all(m['h'] is None or abs(m['h'] - (12 + 10 / 60)) < 0.05 for m in hers[-2:]), json.dumps(hers, ensure_ascii=False))
        await run.shot(pg, 'sismsg_expo')
    await jump(c, "STORY.dayOfKey('2025-09-06')", 16.05, '9/6 社博收了以後')
    tops = await open_topics(c, S5); await close_phone(pg)
    run.check('4. 9/6 16:00 以後：沒有「問社博」、換「問法服」（沒加入＝sis_fafu_out）', not any(t['k'].endswith('|sis_expo') for t in tops) and any(t['k'].endswith('|sis_fafu_out') for t in tops), json.dumps(tops, ensure_ascii=False))

# =====================================================================================================
async def enter_noodle(c):
    pg = c.pg
    door = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='noodle'); return it&&[it.x,it.z,it.label]; })()")
    if not door: c.run.note('⚠ 公館找不到阿鳳麵店的門'); return False
    await pg.evaluate("(([x,z])=>{ GAME.E.placeAt(GAME.E.player,x,z-2.0,0); })(%s)" % json.dumps(door[:2])); c.run.setup('[捷徑] 站到阿鳳麵店門口外 2 m')
    await pg.wait_for_timeout(2000); await walk(c, door[0], door[1], door[2] or '阿鳳麵店的門', near=0.9)
    lab = await press(c, '麵店')
    for _ in range(20):
        if await pg.evaluate("GAME.G.zone==='noodle'"): return True
        await pg.wait_for_timeout(700)
    return False

async def m_noodle(c):
    pg, run = c.pg, c.run
    await load_new(c, '2025-09-16', 17.3, 'gongguan', flags={'met_yu': True}, quiet=quiet_for('noodle'),
                   js="for(const id of ['yu','classmate_bohan','classmate_xinci','heroine_03','heroine_01']) MET(id); PHONE.join(G,'noodle_team','麵店團'); delete G.flags.ndlTalkN; delete G.flags.ndlTalkDay;",
                   why='noodle：9/16（二）17:18 公館；在麵店團群組、認識麵店團的人（阿哲 MET_ZHE、Alison met_yu、柏翰、芯慈、語彤、以安）')
    NT = await pg.evaluate("NOODLE_TABLE.Y1.map(e=>(e.dialogue||[]).map(l=>l.text).filter(Boolean))")
    run.note('前置：noodleDay=%s、ndlTalkPick=%s、ndlOtherDue（在公館算）=%s' % (await pg.evaluate("STORY.noodleDay(GAME.G.day)"), json.dumps(await pg.evaluate("(p=>p&&{k:p.k,i:p.i})(STORY.ndlTalkPick(GAME.G))")), await pg.evaluate("STORY.ndlOtherDue(GAME.G)")))
    for rnd, (key, want_i) in enumerate((('2025-09-16', 0), ('2025-09-18', 1))):
        if rnd:
            await pg.evaluate("void GAME.enter('gongguan')"); await pg.wait_for_timeout(6000); run.setup('[捷徑] 離開麵店回公館（GAME.enter）')
            await jump(c, "STORY.dayOfKey('%s')" % key, 17.3, '下一個麵店日（週四）17:18')
        n0 = await mark(c); ok = await enter_noodle(c); t_in = time.time()
        run.check('5. %s 走進阿鳳麵店' % key, ok, json.dumps(await pg.evaluate(DBG), ensure_ascii=False))
        sy = []
        while time.time() - t_in < 60:
            s = await L.state(pg)
            if s['dlg'] or s['choices']: await drain(c, secs=120); sy = texts(await log_from(c, n0)); break
            await pg.wait_for_timeout(500)
        other = await pg.evaluate("STORY.ndlOtherDue(GAME.G)")
        want = NT[want_i]
        run.check('5. %s 走進來兩秒後：長桌閒聊第 %d 則（%s…）' % (key, want_i + 1, want[0][:14]), sy[:len(want)] == want, json.dumps({'said': sy[:6], 'otherDue': other, 'ndlTalkDay': await pg.evaluate("GAME.G.flags.ndlTalkDay")}, ensure_ascii=False))
        await run.shot(pg, 'noodle_%d' % (rnd + 1))

# =====================================================================================================
GYM_IDS = [('kai', '你最近一直出門。去運動？好喔。宵夜還是有你的份。', '健身房？好喔'), ('classmate_mingxuan', '最近有在動喔？學校的球場不用錢吧？哈哈，CP 值最高。', '健身房？學校的'),
           ('heroine_01', '你最近走路變快了。……我只是看到了。', None), ('classmate_peishan', '人為什麼要自己去流汗？我不是質疑，我真的想知道。', '人為什麼要練肌肉')]
FIND_WHERE = r"""(id=>{ const G=GAME.G, c=(typeof CHARACTERS!=='undefined'&&(CHARACTERS[id]||Object.values(CHARACTERS).find(q=>q&&q.id===id)))||null; if(!c) return {err:'no char'};
  const out=[]; for(let h=8;h<=21.5;h+=0.5){ let e=null; try{ e=STORY.schedEnt(c,Object.assign({},G,{hour:h})); }catch(_){} if(e&&e.zone) out.push({h,zone:e.zone,spot:e.spot||null}); } return out; })"""

async def m_gymline(c):
    pg, run = c.pg, c.run
    await load_new(c, '2025-10-08', 9.0, 'dorm', quiet=quiet_for('gymline'),
                   js="for(const id of ['kai','classmate_mingxuan','heroine_01','classmate_peishan']) MET(id); G.daily=G.daily||{}; G.daily.gym={fit:30,seen:[]};",
                   why='gymline：10/8（三）；體能 30（有在運動）、沒有健身房會員證（G.daily.gym 沒有 card）；認識阿凱、明軒、以安、沛珊')
    run.check('6. 前置：沒有會員證、體能 30（有在運動）', await pg.evaluate("!GAME.G.daily.gym.card&&FIT.stageIx(GAME.G.daily.gym.fit)===1"))
    for pid, line, old in GYM_IDS:
        W = await pg.evaluate(FIND_WHERE + "(%s)" % json.dumps(pid))
        run.note('%s 今天在哪：%s' % (pid, json.dumps(W[:6] if isinstance(W, list) else W, ensure_ascii=False)))
        if not isinstance(W, list) or not W: run.check('6. %s：今天找得到人（作息）' % pid, False, json.dumps(W)); continue
        pr = ['cafe', 'campus', 'dorm', 'library', 'classroom']; W.sort(key=lambda e: (pr.index(e['zone']) if e['zone'] in pr else 9, abs(e['h'] - 15))); w = W[0]   # 先找不在上課的地方（Café、校園、宿舍、總圖），都沒有才去教室
        await jump(c, 'GAME.G.day', w['h'], '%s 的作息時段' % pid, zone=w['zone'])
        p = await pg.evaluate("(id=>{ const n=GAME.E.npcs.find(n=>n&&n.charId===id&&n.obj&&!n.hidden); return n?[n.obj.position.x,n.obj.position.z]:null; })(%s)" % json.dumps(pid))
        if not p: run.check('6. %s：%s 這個區域裡有他／她' % (pid, w['zone']), False); continue
        await walk(c, p[0], p[1], pid, near=1.3)
        n0 = await mark(c); lab = await press(c, '說話'); await drain(c, pref=['聊', '說'], secs=180)
        sy = texts(await log_from(c, n0))
        run.check('6. %s（沒有會員證）：新句「%s」' % (pid, line), line in sy and not (old and any(old in t for t in sy)), json.dumps(sy[:6], ensure_ascii=False))

# =====================================================================================================
async def m_bbq(c):
    pg, run = c.pg, c.run; yt = os.environ.get('BBQ_YT', '1') != '0'
    sat = await pg.evaluate("CALENDAR.dateOf(STORY.termDay('Y1S1',5,6)).key")
    know = ['yu', 'heroine_01', 'classmate_bohan'] + (['heroine_03'] if yt else [])
    await load_new(c, sat, 14.5, 'dorm', flags={'BBQ_YES': True, 'ZHE_CALLS_GE': True, 'met_yu': True}, quiet=quiet_for('bbq'),
                   js="for(const id of %s) MET(id); PHONE.join(G,'noodle_team','麵店團');" % json.dumps(know),
                   why='bbq：第 5 週週六（%s）14:30 宿舍；回過阿哲「去。」（BBQ_YES）、在麵店團群組；%s語彤' % (sat, '認識' if yt else '不認識'))
    run.note('中秋烤肉出遊：%s' % json.dumps(await pg.evaluate("(OUT.get(GAME.G,'bbq')||null)"), ensure_ascii=False))
    n0 = 0; t0 = time.time()   # BB-C 01:2x：讀檔時「出發」提示就跳出來、load_new 裡的 drain 已經按了出發，烤肉在這之前就演完了——第一版從這裡才開始記＝一句都沒有；改成從頭記
    while time.time() - t0 < 900 and not c.late():
        s = await L.state(pg)
        if s['dlg'] or s['choices']: await drain(c, pref=['出發'], secs=400)
        if await pg.evaluate("!!(GAME.G.events.done&&GAME.G.events.done.ev_mid_autumn_bbq)"): break
        if await phone_open(pg): await close_phone(pg)
        await pg.wait_for_timeout(2500)
    Lg = await log_from(c, n0); sy = [(x['w'], x['t']) for x in Lg if x['k'] == 'say']; T = [t for _, t in sy]
    run.check('7. 中秋烤肉演了（出發 → ev_mid_autumn_bbq）', await pg.evaluate("!!GAME.G.events.done.ev_mid_autumn_bbq"), json.dumps(T[:4], ensure_ascii=False))
    L1, L2, L3 = '語彤也來了，提著一盒阿姨醃的肉。阿哲在麵店揪人那天，阿姨在旁邊聽到了。', '阿姨叫我拿來的。她說常來吃麵的，都算自己人。', '阿姨醃的肉，全場最好吃。'
    if yt:
        i = T.index(L1) if L1 in T else -1
        ok = i >= 0 and T[i + 1:i + 3] == [L2, L3] and ('語彤' in sy[i + 1][0] or 'heroine_03' in sy[i + 1][0]) and sy[i][0] == '' and sy[i + 2][0] == ''
        run.check('7. 認識語彤：三行（旁白「%s」→ 語彤「%s」→ 旁白「%s」）' % (L1[:8], L2[:8], L3), ok, json.dumps(sy[max(0, i - 1):i + 4] if i >= 0 else sy[:12], ensure_ascii=False))
        run.check('7. 舊的一句「語彤帶了阿姨醃的肉。全場最好吃。」沒有', '語彤帶了阿姨醃的肉。全場最好吃。' not in T)
    else:
        run.check('7. 不認識語彤：三行都沒有', not any(t in T for t in (L1, L2, L3)), json.dumps(T, ensure_ascii=False)[:500])
    await run.shot(pg, 'bbq_%s' % ('yt' if yt else 'noyt'))

# =====================================================================================================
async def m_fair2(c):
    pg, run = c.pg, c.run
    await load_new(c, '2026-09-12', 10.3, 'campus', pos={'x': -100.0, 'z': 0.0, 'yaw': -1.5708, 'lv': 0, 'y': 0}, quiet=quiet_for('fair2'), newgame=True,
                   flags={'CLUB_club_guitar': True, 'FAIR_JOIN': True, 'SIS_CLUB_EXPO': True, 'met_sis': True, 'SIS_W1': True},
                   js="G.flags.ROOM_Y2=D('2026-09-06');",
                   why='fair2：大二 2026-09-12（六）10:18 椰林大道西端外 (-100, 0)；大一在社博加入吉他社（CLUB_club_guitar、FAIR_JOIN）、搬進大二宿舍（ROOM_Y2）')
    s = await pg.evaluate("Object.assign(%s,{y2:CLUBFAIR.expoY2(GAME.G)})" % FAIRSTAT)
    run.note('大二社博狀態 %s' % json.dumps(s, ensure_ascii=False))
    run.check('8. 大二社博那天：36 頂、有人顧攤、攤位不能互動（不是新生了）', s['y2'] and s['tents'] == 36 and s['staff'] >= 26 and s['booths'] == 0, json.dumps(s))
    n0 = await mark(c); await walk(c, -80.0, 0.0, '椰林大道攤位那一排（x −91～13）', near=1.5, max_s=300)
    for _ in range(40):
        st = await L.state(pg)
        if st['dlg'] or st['choices']: break
        await pg.wait_for_timeout(700)
    await run.shot(pg, 'fair2_event')
    await drain(c, pref=['吉他社'], secs=240)
    sy = texts(await log_from(c, n0))
    run.check('8. 走到攤位那一排：「今年，你站在攤位後面。」（ev_y2_club_expo）', '今年，你站在攤位後面。' in sy, json.dumps(sy[:6], ensure_ascii=False))
    run.check('8. 開場：大一在社博填表＝「去年，你站在這一排攤位前面填表。」', '去年，你站在這一排攤位前面填表。' in sy, json.dumps(sy[:3], ensure_ascii=False))
    await yaw(c, -math.pi / 2, '大道往東看（大二社博）'); await run.shot(pg, 'fair2_avenue')

# =====================================================================================================
FPS = """(async(ms)=>{ let n=0; const t0=performance.now(); await new Promise(r=>{ const f=()=>{ n++; if(performance.now()-t0<ms) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); });
  const E=GAME.E, ri=E.renderer&&E.renderer.info&&E.renderer.info.render; return {fps:+(n*1000/(performance.now()-t0)).toFixed(2), tris:ri?ri.triangles:null, calls:ri?ri.calls:null,
  npcVis:E.npcs.filter(n=>n&&n.obj&&n.obj.visible).length, npc:E.npcs.length, staff:E.npcs.filter(n=>n&&n.fairStaff).length, q:E.q&&E.q.level}; })"""
async def m_perf(c):
    pg, run = c.pg, c.run; R = {}
    for tag, key in (('fair', '2025-09-06'), ('normal', '2025-09-13')):
        await load_new(c, key, 11.0, 'campus', pos={'x': -60.0, 'z': 0.0, 'yaw': -1.5708, 'lv': 0, 'y': 0}, quiet=quiet_for('perf'), why='perf：%s 11:00 椰林大道中段 (-60, 0)（%s）' % (key, '社博' if tag == 'fair' else '平常的週六'))
        await pg.wait_for_timeout(5000)
        for d, a in (('east', -math.pi / 2), ('west', math.pi / 2)):
            await yaw(c, a, '量 fps：往%s' % ('東' if d == 'east' else '西')); await pg.wait_for_timeout(2000)
            R['%s_%s' % (tag, d)] = await pg.evaluate(FPS + "(15000)"); run.note('%s 往%s：%s' % (tag, d, json.dumps(R['%s_%s' % (tag, d)])))
        await run.shot(pg, 'perf_%s' % tag)
        tt = {}
        for z in ('gongguan', 'campus'):
            t0 = time.time(); await pg.evaluate("GAME.enter(%s)" % json.dumps(z)); tt[z] = round(time.time() - t0, 2)
            await pg.wait_for_timeout(3000)
        run.setup('[捷徑] GAME.enter 量換區域時間（校園 → 公館 → 校園）'); R['%s_enter' % tag] = tt; run.note('%s 換區域秒數 %s' % (tag, json.dumps(tt)))
    json.dump(R, open(os.path.join(OUT, 'perf.json'), 'w'), ensure_ascii=False, indent=1)
    run.note('perf 總表 %s' % json.dumps(R, ensure_ascii=False))
    run.check('9. 社博那天大道往東的 fps 不低於平常週六的 60%%（模擬環境的相對值，不是真機）', R['fair_east']['fps'] >= 0.6 * R['normal_east']['fps'], json.dumps([R['fair_east'], R['normal_east']]))
    run.check('9. 社博那天換區域（進校園）不比平常慢 2 倍以上', R['fair_enter']['campus'] <= 2 * max(1.0, R['normal_enter']['campus']), json.dumps([R['fair_enter'], R['normal_enter']]))

MODEFN = {'hints': m_hints, 'fair': m_fair, 'missed': m_missed, 'sismsg': m_sismsg, 'noodle': m_noodle, 'gymline': m_gymline, 'bbq': m_bbq, 'fair2': m_fair2, 'perf': m_perf}

async def main():
    rc = 0
    async with async_playwright() as p:
        for mode in MODES:
            if mode not in MODEFN: print('不認得的 MODE', mode); rc = 2; continue
            run = L.Run('fair_' + mode, os.path.join(OUT, mode)); os.makedirs(os.path.join(OUT, mode), exist_ok=True)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            c = Ctx(run, pg, cdp, errs)
            try:
                await pg.goto(URL, timeout=120000); await L.wait_loaded(pg, 300); await pg.evaluate("localStorage.clear()")
                await MODEFN[mode](c)
            except Exception as e:
                run.check('%s：工具跑完（沒有 Python 例外）' % mode, False, repr(e)[:400])
            try:
                lg = await pg.evaluate("window.__LOG||[]"); json.dump(lg, open(os.path.join(OUT, mode, 'log.json'), 'w'), ensure_ascii=False, indent=0)
            except Exception: pass
            run.check('%s：沒有 JS 例外' % mode, not errs, json.dumps(errs[:3], ensure_ascii=False))
            print('MODE', mode, 'SHA', os.environ.get('SHA', '?'))
            rc = max(rc, run.finish() or 0)
            await b.close()
    sys.exit(rc)

asyncio.run(main())
