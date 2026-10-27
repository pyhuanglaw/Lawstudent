"""BB-C 10-27：BB_TEST_QUEUE_1027 第 5h 節「場景裡的人」瀏覽器驗收（使用者 X107、X108、X111；開發分支 096d3ca50，子代理 people-1027）。
四個 MODE（SUB＝逗號分隔的情境 id，預設那個 MODE 全部）：
  teacher（CLASS-TEACHER-1027，上課有老師）
    t_stay   ：普通 101「電影與敘事」（2025-09-23 週二 13:20）——【前置】12:44 人在 101 最後一排（教室 12:50 才開放：classes3d.js WIN0＝開始前 30 分鐘；
               規格寫 13:00，但 13:00 進來老師已經照「剛走進來」直接放在講台，看不到走進來，所以提早到 12:44 待著）→ 時間照真的走到 13:08：
               老師第一次出現離講台 ≥1.5 m（從大門）、有在走、走到講台（離講台 <0.6 m）、面向學生、每個座位都在他前面。
    t_stay13 ：同一堂 13:00 才進 101（照規格的時間）——只記錄看到什麼（老師已在講台＝照設計），不判 FAIL。
    t_late   ：同一堂 13:40 才進 101＝5 秒內講台前已經有老師、面向學生、不在走。
    t_out    ：同一堂 15:07 人在 101 → 時間照真的走到 15:14：下課老師從講台走出去（leaving＋有路線），不是在講台上當場消失。
    t_201 ／t_gt102 ／t_boya101：霖澤館 201 憲法（09-22 週一 09:10，張教授）、共同 102 大一英文（09-25 週四 09:10）、博雅 101 大一國文（09-23 週二 09:10）各 09:12 進教室：講台前有老師、面向學生；截一張看講台的圖。
    t_wmulti ／t_l202：萬才館多功能教室 民法物權（2026-09-22 13:20，大二上）、霖澤館 202 法學英文（2027-03-11 09:10，大二下）——【前置】大二的最小存檔（ROOM_Y2）。
  crowd（CROWD-CLASS-ARRIVE-1027，門口的人、教室坐滿；博雅 101 大一國文 2025-09-23 09:10）
    c_door   ：08:50 進博雅、自己走到 101 門口 → 門口等的人 35 秒（真實時間）內每個人都有小動作（fid 計數、姿勢／手插口袋／轉頭／走一兩步至少兩種）；
               再照真的走到 09:11：開始前 10 分鐘以前沒人進教室、09:00 以後陸續進去（-7、-4、-1 分鐘遞增）、09:10 大部分（≥70%）坐下。
    c_inside ：08:48 人站在 101 最後一排 → 照真的走到 09:15：沒有人在玩家眼前「直接坐著」被加進來（E.addNPC 包一層只記錄：沒轉暗、有座位、姿勢 sit／read、在鏡頭裡）、替身（CLS.figState）沒有新的、最後坐好 ≥8 人。
    c_early  ：08:45 在 101 坐下選「上課：…」＝轉暗、「（你在座位上等。教室慢慢坐滿了。）」一次、亮起來上課第一句時 ≥09:10、同學坐好 ≥8、老師在講台；轉暗前沒人冒出來。
    c_lateseat：09:12 才坐下選上課＝沒有那一句；沒人在座位上冒出來；上課第一句時坐好＋走進來的 ≥8。
    c_201out ：霖澤館 201 憲法（09-22）12:07 人在 201 → 照真的走到 12:16：同學起身從門口走出去（leaving＋路線），坐著的人沒有當場消失。
  gym（GYM-CROWD-1027）
    g_noon   ：週二 12:30 1F：服務台後有人（desk_1f）、大廳有人走過（walker）、長椅一人（bench）、兩面羽球場有人打（badminton，路線都在 |x|>4＝中間那面空著）；
               進門處（0,17.6）／（1.6,18.8）、中間那面「打羽球」（0,-2.6）20 秒內沒有人站上去（羽球邀約朋友從進門處進來不被擋）；量 8 秒幀數。
    g_eve    ：週二 18:30 1F 量 8 秒幀數、記人數。
    g_b1     ：週二 18:30 B1、還沒辦卡：櫃台阿姨（desk_b1，名字「櫃台阿姨」）在櫃台後、跑步機上有人（treadmill，姿勢 run）；走到「去健身房」按＝說話的是「櫃台阿姨」、她轉頭（rotation 有變）。
    g_3f     ：週六 15:00 3F（gym_arena）：籃球 ≥3 人（basketball，route＋run）、場邊休息 ≥1（rest）。
    g_closed ：週二 22:15、週日 18:20、第四個星期一（09-22）12:30 × 1F／B1／3F：三層都沒人。
    g_pe     ：大一上第一個有體育課的週一（不是第四個星期一）15:40 1F：體育老師（pe_teacher）面向一排同學（pe_student ≥5、在老師南邊、面向老師）；走到「體育課集合」互動鍵出現、按下去有選單／對話。
  expo（SIS-EXPO-PRESENCE-1027；社博日期照 activities.js club_expo_y1s1，現在是 2025-09-06（六）10:00～16:00）
    e_noon   ：12:00 椰林大道：學姊（heroine_05）在法服帳篷前右邊（作息點 (-48.75,11.25) 0.6 m 內、面向大道）；GAME.whereText＝「社團博覽會…法服的攤位」不是總圖；
               手機「朋友」那一列（有的話）同一句；自己走到她前面按說話＝演 ev_sis_club_expo（第一句「（椰林大道上一整排帳篷。你走到法服的攤位前。）」），演完她還在原地。
    e_booth  ：同一天 12:00 走到法服攤位（「法律服務社」）按＝演同一段，演完她還在。
    e_close  ：【前置】演過（SIS_CLUB_EXPO）、15:55 站在攤位前 → 照真的走到 16:06：她走開（leaving／路線）不是在眼前消失；攤位互動點收起來。
    e_week   ：隔一週 2025-09-13（六）12:00：她不在攤位（不在作息點 5 m 內）、whereText 不是社團博覽會。
【前置／捷徑】全部用最小存檔（法律系大一上：introDone 等 7 個旗標＝zrlast_probe.py load_min 的 y1min；大二的加 ROOM_Y2；
  另外照新遊戲（開學改 9/1，story3d.js startLawWeek1）寫 LAW_START_DAY＝2025-08-29、MAIN_D1＝STORY.MAIN_D1_NEW——沒有這兩個＝舊局，社博照 datesOld 是 9/30、10/1，不是 9/6；OLDGAME=1 跑舊局）直接讀到那一天那一刻那一區（GAME.applySave）；
  玩家位置用 E.placeAt 放到教室最後一排的座位旁（CROWD.seatSide）——之後都是時間照真的走（不用 ?turbo）、觸控走路（L.go_to）、按互動鍵、點對話；
  teacher／crowd／gym 預設 QUIET=1（關條件事件、手機不自己打開，避免開學那幾天的劇情插進來），expo 預設 QUIET=0（要演 ev_sis_club_expo）。
  E.addNPC、GAME.say 包一層只記錄（不改行為）。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，建議 URL 加 ?lowres）；幀數只能比相對，不代表真機。
用法：LW_TESTS=<工作樹>/tests MODE=teacher|crowd|gym|expo [SUB=t_stay,t_late] [QUIET=0|1] python3 people_probe.py '<URL>/index.html?lowres' <輸出資料夾>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
MODE = os.environ.get('MODE', 'teacher'); SUB = [x for x in os.environ.get('SUB', '').split(',') if x]
QUIET = os.environ.get('QUIET', '0' if MODE == 'expo' else '1') == '1'
Y1F = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True}
HOOK = r"""(()=>{ if(window.__bbHooked) return; window.__bbHooked=true; const E=GAME.E;
  window.__bbFaded=()=>{ const f=document.getElementById('fade'); return !!f&&f.classList.contains('on'); };
  window.__bbInView=(p)=>{ try{ const cam=E.camera; cam.updateMatrixWorld(); const m=new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); const fr=new THREE.Frustum(); fr.setFromProjectionMatrix(m);
    return fr.containsPoint(new THREE.Vector3(p.x,(p.y||0)+1.0,p.z)); }catch(e){ return null; } };
  window.__bbPop=[]; const a0=E.addNPC; E.addNPC=function(n){ const r=a0.apply(this,arguments); try{ if(n&&n.seat&&(n.pose==='sit'||n.pose==='read')) window.__bbPop.push({h:+GAME.G.hour.toFixed(3),faded:window.__bbFaded(),vis:window.__bbInView(n.obj.position),cls:!!n.clsStudent,x:+n.obj.position.x.toFixed(1),z:+n.obj.position.z.toFixed(1)}); }catch(e){} return r; };
  window.__bbSays=[]; const s0=GAME.say; GAME.say=function(w,t){ try{ const ns=E.npcs; window.__bbSays.push({t:String(t||'').slice(0,40),who:(w&&(w.name||w))||'',h:+GAME.G.hour.toFixed(3),faded:window.__bbFaded(),
    seated:ns.filter(n=>n.clsStudent&&n.seat&&!(n.path&&n.path.length)).length, walking:ns.filter(n=>n.clsStudent&&n.path&&n.path.length).length,
    teacher:ns.some(n=>(n.clsTeacher||n.tSpot)&&!n.leaving&&!(n.path&&n.path.length))}); }catch(e){} return s0.apply(this,arguments); };
})()"""
TEACH = r"""(cid=>{ const G=GAME.G, E=GAME.E; const it=(CLS.dayItems(G)||[]).find(q=>q.c&&q.c.id===cid); if(!it) return {err:'今天沒有這堂課'};
  const named=!!(it.c.prof&&CHARACTERS[it.c.prof]&&CHARACTERS[it.c.prof].social_layer==='E'); let n=null;
  if(named){ const m=typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(it.c.prof):null; if(m&&E.npcs.includes(m)) n=m; }
  else n=E.npcs.find(q=>q.clsTeacher===it.key&&!q.leaving)||E.npcs.find(q=>q.clsTeacher===it.key)||null;
  const z=E.zone, rr=it.room&&it.room.room, sp=(n&&n.tSpot)||(CLS.teacherSpot?CLS.teacherSpot(E,rr):null);
  const seats=(z.seats||[]).filter(q=>(!rr||q.room===rr)&&(q.kind==='class'||q.kind==='lecture'||!q.kind)); let judge='';
  if(n&&seats.length){ let fx=0,fz=0; for(const s of seats){ fx+=Math.sin(s.yaw||0); fz+=Math.cos(s.yaw||0); } const fl=Math.hypot(fx,fz)||1; fx/=fl; fz/=fl; const P=n.obj.position;
    const behind=seats.filter(s=>(P.x-s.x)*Math.sin(s.yaw||0)+(P.z-s.z)*Math.cos(s.yaw||0)<0.3).length; const ry=n.obj.rotation.y, face=Math.sin(ry)*fx+Math.cos(ry)*fz;
    if(behind) judge='有 '+behind+' 個座位在老師前面'; else if(face>-0.7) judge='沒有面向學生（'+face.toFixed(2)+'）'; }
  const P=n&&n.obj.position;
  return {key:it.key,t0:it.t0,t1:it.t1,named,room:it.room&&it.room.name,hour:+G.hour.toFixed(3),seats:seats.length,judge,spot:sp?{x:+sp.x.toFixed(2),z:+sp.z.toFixed(2)}:null,
    n:n?{name:n.name,x:+P.x.toFixed(2),z:+P.z.toFixed(2),ry:+n.obj.rotation.y.toFixed(2),path:n.path?n.path.length:0,leaving:!!n.leaving,pose:n.pose,vis:window.__bbInView?window.__bbInView(P):null}:null,
    dist:(n&&sp)?+Math.hypot(P.x-sp.x,P.z-sp.z).toFixed(2):null}; })"""
BACK = r"""(rr=>{ const E=GAME.E, z=E.zone; const seats=(z.seats||[]).filter(q=>(!rr||q.room===rr)&&(q.kind==='class'||q.kind==='lecture'||!q.kind)); if(!seats.length) return null;
  const s=seats[seats.length-1], ap=CROWD.seatSide(E,s); if(!ap) return null; E.placeAt(E.player,ap[0],ap[1],s.lv|0); return {x:+ap[0].toFixed(2),z:+ap[1].toFixed(2),lv:s.lv|0}; })"""
GYMPPL = r"""(()=>{ const ns=GAME.E.npcs.filter(n=>n.crowd&&/^gym_/.test(n.crowd)); const r={}; for(const n of ns){ (r[n.crowdRole]=r[n.crowdRole]||[]).push({x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),ry:+n.obj.rotation.y.toFixed(2),pose:n.pose,beh:n.beh,run:!!n.run,name:n.name||'',
  wp:n.waypoints?n.waypoints.map(q=>[+q[0].toFixed(1),+q[1].toFixed(1)]):null}); } return {n:ns.length,roles:r,zone:GAME.G.zone,hour:+GAME.G.hour.toFixed(2)}; })()"""
FPS = "new Promise(r=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<8000) requestAnimationFrame(f); else r(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })"
SIS = r"""(()=>{ const E=GAME.E; const n=(typeof EVENTS!=='undefined'&&EVENTS.npcOf&&EVENTS.npcOf('heroine_05'))||E.npcs.find(q=>q.charId==='heroine_05'); const on=!!n&&E.npcs.includes(n);
  return {on, x:on?+n.obj.position.x.toFixed(2):null, z:on?+n.obj.position.z.toFixed(2):null, ry:on?+n.obj.rotation.y.toFixed(2):null, leaving:on?!!n.leaving:null, path:on&&n.path?n.path.length:0,
    vis:on&&window.__bbInView?window.__bbInView(n.obj.position):null, where:GAME.whereText?GAME.whereText('heroine_05'):'', hour:+GAME.G.hour.toFixed(3), done:!!GAME.G.flags.SIS_CLUB_EXPO,
    booth:(E.interactables.find(q=>q.fairBooth==='lawclub')||{}).hidden===false }; })()"""
SIS_SPOT = (-48.75, 11.25)


async def free(pg):
    return await pg.evaluate("(()=>{ const D=GAME.D, P=GAME.E.player; return !P.busy&&!(D&&(D.active||(D.busyDepth|0)>0)); })()")


async def load_at(pg, cdp, run, key, h, zone, flags=None, quiet=None, why=''):
    day = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key))
    wd = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % day)
    F = dict(Y1F)
    if os.environ.get('OLDGAME') != '1':   # 新局（開學改 9/1）：story3d.js startLawWeek1 寫的兩個旗標＝STORY.week1Start 為真，社博才是 9/6（沒有＝舊局，activities.js 走 datesOld 9/30、10/1）
        F.update(await pg.evaluate("({LAW_START_DAY:STORY.dayOfKey('2025-08-29'), MAIN_D1:STORY.MAIN_D1_NEW})"))
    F.update(flags or {})
    st = {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': day, 'weekday': wd, 'hour': h, 'energy': 100, 'money': 22000, 'zone': zone, 'pos': None, 'weather': 'clear', 'flags': F,
          'events': {'done': {}, 'last': {}, 'count': 0}}
    q = QUIET if quiet is None else quiet
    await L.load_state(pg, st, quiet_events=q); await pg.wait_for_timeout(6000)
    await L.close_panels(pg, cdp); await pg.evaluate(HOOK); await pg.evaluate("window.__bbPop=[]; window.__bbSays=[]")
    run.setup('[前置] 最小存檔 %s %s %s（day %d）旗標 %s；%s%s' % (key, L_hm(h), zone, day, json.dumps(flags or {}, ensure_ascii=False), '關條件事件；' if q else '', why))


def L_hm(h): return '%02d:%02d' % (int(h), round((h - int(h)) * 60))


async def wait_hour(pg, cdp, target, max_s, run, tap_dlg=True):
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        if s['hour'] >= target: return True
        if tap_dlg and s['choices']: await L.advance_dialogs(pg, cdp, run, lambda q: not q['choices'], max_steps=6)
        elif tap_dlg and s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(1500)
    run.note('等不到 %s（現在 %s）' % (L_hm(target), L_hm((await L.state(pg))['hour']))); return False


def rec(name, obj):
    with open(os.path.join(OUT, name + '.json'), 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, indent=1)


# ---------------------------------------------------------------- teacher
T_CASES = {
    't_stay': ('ge_film_y1s1', '2025-09-23', 12.73, 'putong', '101', 'stay', {}),
    't_stay13': ('ge_film_y1s1', '2025-09-23', 13.0, 'putong', '101', 'note', {}),
    't_late': ('ge_film_y1s1', '2025-09-23', 13 + 40 / 60, 'putong', '101', 'late', {}),
    't_out': ('ge_film_y1s1', '2025-09-23', 15 + 7 / 60, 'putong', '101', 'out', {}),
    't_201': ('const_1', '2025-09-22', 9.2, 'classroom', None, 'late', {}),
    't_gt102': ('english_y1', '2025-09-25', 9.2, 'gongtong', '102', 'late', {}),
    't_boya101': ('chinese_y1', '2025-09-23', 9.2, 'boya', '101', 'late', {}),
    't_wmulti': ('property', '2026-09-22', 13 + 22 / 60, 'wancai_multi', 'multi', 'late', {'ROOM_Y2': 'Y2'}),
    't_l202': ('legal_english', '2027-03-11', 9.2, 'linze_202', 'c202', 'late', {'ROOM_Y2': 'Y2'}),
}


async def teacher(pg, cdp, run, cid_case):
    cid, key, h, zone, room, kind, fl = T_CASES[cid_case]
    if fl.get('ROOM_Y2') == 'Y2': fl = dict(fl, ROOM_Y2=await pg.evaluate("STORY.dayOfKey('2026-09-06')"))
    await load_at(pg, cdp, run, key, h, zone, fl, why='%s（%s）' % (cid_case, cid))
    pos = await pg.evaluate("(%s)(%s)" % (BACK, json.dumps(room))); run.setup('[捷徑] 人放到教室最後一排座位旁 %s' % json.dumps(pos))
    await pg.wait_for_timeout(1500)
    t = await pg.evaluate("(%s)(%s)" % (TEACH, json.dumps(cid))); run.note('%s 進來時：%s' % (cid_case, json.dumps(t, ensure_ascii=False)))
    if t.get('err'): run.check('%s：今天有這堂課（%s）' % (cid_case, cid), False, t['err']); return
    lab = '%s %s（%s %s）' % (t['room'], cid, key, L_hm(h))
    if kind in ('late', 'note'):
        await pg.wait_for_timeout(3500); t = await pg.evaluate("(%s)(%s)" % (TEACH, json.dumps(cid)))
        if t['n']: await L.turn_camera_to(pg, cdp, t['n']['x'], t['n']['z'])
        await run.shot(pg, cid_case + '_podium'); rec(cid_case, t)
        ok = bool(t['n']) and t['dist'] is not None and t['dist'] < 0.6 and not t['n']['path'] and not t['judge']
        if kind == 'note': run.note('（只記錄）%s：%s' % (lab, json.dumps(t, ensure_ascii=False))); return
        run.check('%s：講台前已經有老師（%s）、站在講台（離講台 <0.6 m）、不在走、面向學生、座位都在他前面' % (lab, (t['n'] or {}).get('name', '沒有')), ok, json.dumps(t, ensure_ascii=False))
        return
    # stay／out：頁面內每 250 ms 記老師的狀態變化
    await pg.evaluate("""(cid=>{ window.__bbTL=[]; let last=''; const T=%s; window.__bbTLi=setInterval(()=>{ try{ const t=T(cid); const k=JSON.stringify([!!t.n, t.n&&t.n.leaving, t.n&&t.n.path>0, t.dist==null?null:Math.round(t.dist*2)/2]);
      if(k!==last){ last=k; window.__bbTL.push(t); } }catch(e){} },250); })(%s)""" % (TEACH, json.dumps(cid)))
    if kind == 'stay':
        await wait_hour(pg, cdp, t['t0'] - 0.2, 900, run)   # 12:50 開放、老師從大門走進來；等到 13:08（走到講台要幾十秒真實時間＝十幾分鐘遊戲時間）
    else:
        await wait_hour(pg, cdp, t['t1'] + 4 / 60, 900, run)
    tl = await pg.evaluate("(()=>{ clearInterval(window.__bbTLi); return window.__bbTL; })()"); rec(cid_case, tl)
    run.note('%s 時間線 %d 筆：%s' % (cid_case, len(tl), json.dumps([[x['hour'], x['n'] and [x['n']['x'], x['n']['z'], x['n']['path'], x['n']['leaving']], x['dist']] for x in tl], ensure_ascii=False)[:1500]))
    end = await pg.evaluate("(%s)(%s)" % (TEACH, json.dumps(cid)))
    if end['n']: await L.turn_camera_to(pg, cdp, end['n']['x'], end['n']['z'])
    await run.shot(pg, cid_case + '_end')
    if kind == 'stay':
        before = [x for x in tl if x['hour'] < t['t0'] - 0.5 and x['n']]
        first = next((x for x in tl if x['n']), None)
        arrived = next((x for x in tl if x['n'] and x['dist'] is not None and x['dist'] < 0.6 and not x['n']['path']), None)
        run.check('%s：教室開放（開始前 30 分鐘）以前講台沒有老師' % lab, not before, json.dumps(before[:2], ensure_ascii=False))
        run.check('%s：老師第一次出現離講台 ≥1.5 m（從大門進來）、在走' % lab, bool(first) and (first['dist'] or 0) >= 1.5 and first['n']['path'] > 0, json.dumps(first, ensure_ascii=False))
        run.check('%s：老師走到講台站好（離講台 <0.6 m、不在走）' % lab, bool(arrived), json.dumps(end, ensure_ascii=False))
        run.check('%s：站好以後面向學生、每個座位都在他前面' % lab, bool(end['n']) and not end['judge'], end['judge'] or '')
    else:
        lv = next((x for x in tl if x['n'] and x['n']['leaving']), None)
        gone_at_podium = any(i > 0 and tl[i - 1]['n'] and not tl[i]['n'] and (tl[i - 1]['dist'] or 0) < 1.0 and not tl[i - 1]['n']['leaving'] for i in range(len(tl)))
        run.check('%s：下課（%s）老師從講台走出去（leaving＋有路線），不是在講台上當場消失' % (lab, L_hm(t['t1'])), bool(lv) and lv['n']['path'] > 0 and not gone_at_podium, json.dumps(lv, ensure_ascii=False))


# ---------------------------------------------------------------- crowd
async def sit_and_attend(pg, cdp, run, room, case):
    seat = await pg.evaluate("""(rr=>{ const E=GAME.E; const its=E.interactables.filter(q=>q.seat&&(!rr||q.seat.room===rr)&&!q.seat.taken); if(!its.length) return null; const it=its[its.length-1];
      const ap=CROWD.seatSide(E,it.seat); if(!ap) return null; E.placeAt(E.player,ap[0],ap[1],it.seat.lv|0); return {label:it.label,x:+ap[0].toFixed(2),z:+ap[1].toFixed(2)}; })(%s)""" % json.dumps(room))
    run.setup('[捷徑] 人放到 %s 最後一個空位旁 %s' % (room, json.dumps(seat, ensure_ascii=False))); await pg.wait_for_timeout(1500)
    s = await L.state(pg); run.note('互動鍵：%s' % s['interact'])
    await pg.evaluate("window.__bbPop=[]; window.__bbSays=[]")
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,30))")
    k = next((i for i, t in enumerate(opts) if t.startswith('上課：')), None)
    run.check('%s：坐下的選單有「上課：…」' % case, k is not None, json.dumps(opts, ensure_ascii=False))
    if k is None: return None
    c = await pg.evaluate("(i=>{ const e=document.querySelectorAll('#choices button')[i]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])
    t0 = time.time(); shot = False
    while time.time() - t0 < 900:   # 點到上課的第一句（不是等的那一句）為止
        says = await pg.evaluate("window.__bbSays||[]")
        cls = [x for x in says if not x['t'].startswith('（你在座位上等')]
        if cls:
            if not shot: await run.shot(pg, case + '_first'); shot = True
            break
        s = await L.state(pg)
        if s['choices']: await L.advance_dialogs(pg, cdp, run, lambda q: not q['choices'], max_steps=4)
        elif s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(800)
    says = await pg.evaluate("window.__bbSays||[]"); pops = await pg.evaluate("window.__bbPop||[]")
    rec(case, {'says': says, 'pops': pops}); return says, pops


async def crowd(pg, cdp, run, case):
    T0 = 9 + 10 / 60
    if case == 'c_door':
        await load_at(pg, cdp, run, '2025-09-23', 8 + 50 / 60, 'boya', why='c_door')
        sp = await pg.evaluate("(()=>{ const s=CROWD.SPOTS.find(q=>q.id==='boya_101'); return s?{x:s.c[0],z:s.c[1],lv:s.lv|0}:null; })()")
        ok = await L.go_to(pg, cdp, run, sp['x'], sp['z'], 1.8, '博雅 101 門口', max_s=240) if sp else False
        run.check('c_door：自己走到博雅 101 門口', bool(ok), json.dumps(sp))
        await pg.evaluate("""(()=>{ const w=GAME.E.npcs.filter(n=>n.crowd==='boya_101'); window.__bbW=w; window.__bbH=new Map(w.map(n=>[n,{pose:n.pose,pk:!!n.pockets,ry:n.obj.rotation.y,fid:n.fid|0}])); window.__bbK=new Map(w.map(n=>[n,new Set()]));
          window.__bbWi=setInterval(()=>{ for(const n of window.__bbW){ const h=window.__bbH.get(n), S=window.__bbK.get(n); if(n.pose!==h.pose) S.add('pose'); if(!!n.pockets!==h.pk) S.add('pockets'); if(n.faceYaw!=null&&Math.abs(n.faceYaw-h.ry)>0.05) S.add('turn'); if(n.lookAt) S.add('look'); if(n.path&&n.path.length) S.add('step'); } },200); })()""")
        await run.shot(pg, 'c_door_wait'); await pg.wait_for_timeout(35000)
        fz = await pg.evaluate("""(()=>{ clearInterval(window.__bbWi); return window.__bbW.map(n=>({fid:(n.fid|0)-window.__bbH.get(n).fid, kinds:[...window.__bbK.get(n)], cls:!!n.clsStudent})); })()""")
        kinds = set(k for x in fz for k in x['kinds'])
        run.check('c_door：門口等的人（%d 人）35 秒內每個人都有小動作' % len(fz), len(fz) >= 3 and all(x['fid'] >= 1 or x['kinds'] for x in fz), json.dumps(fz, ensure_ascii=False))
        run.check('c_door：小動作不只一種', len(kinds) >= 2, ','.join(sorted(kinds)))
        log = {}
        for m in (-11, -7, -4, -1, 1):
            await wait_hour(pg, cdp, T0 + m / 60, 600, run)
            log[m] = await pg.evaluate("(()=>{ const w=window.__bbW||[]; return {went:w.filter(n=>n.clsStudent).length, seated:w.filter(n=>n.clsStudent&&n.seat&&!(n.path&&n.path.length)).length, n:w.length}; })()")
        run.note('門口那一群走進去：%s' % json.dumps(log, ensure_ascii=False)); rec('c_door', {'fidget': fz, 'log': log})
        g = lambda m: log[m]['went']
        run.check('c_door：開始前 11 分鐘還沒有人進去、-7／-4／-1 分鐘陸續增加（不是開始那一刻一起進去）', g(-11) == 0 and g(-7) > 0 and g(-4) >= g(-7) and g(-1) > g(-7), json.dumps(log))
        run.check('c_door：09:11 門口那一群大部分（≥70%%）已經坐下', log[1]['n'] > 0 and log[1]['seated'] >= 0.7 * log[1]['n'], json.dumps(log[1]))
        await run.shot(pg, 'c_door_after')
    elif case == 'c_inside':
        await load_at(pg, cdp, run, '2025-09-23', 8.8, 'boya', why='c_inside')
        pos = await pg.evaluate("(%s)('101')" % BACK); run.setup('[捷徑] 人站在 101 最後一排 %s' % json.dumps(pos)); await pg.wait_for_timeout(1500)
        fig0 = await pg.evaluate("(CLS.figState?CLS.figState():[]).map(f=>f.key).join()"); await pg.evaluate("window.__bbPop=[]")
        await L.turn_camera_to(pg, cdp, 0, -20); await run.shot(pg, 'c_inside_0848')
        await wait_hour(pg, cdp, T0 + 5 / 60, 900, run)
        pops = await pg.evaluate("window.__bbPop||[]"); fig1 = await pg.evaluate("(CLS.figState?CLS.figState():[]).map(f=>f.key).join()")
        seated = await pg.evaluate("GAME.E.npcs.filter(n=>n.clsStudent&&n.pose==='sit').length")
        bad = [p for p in pops if not p['faded'] and p['vis']]; rec('c_inside', {'pops': pops, 'fig0': fig0, 'fig1': fig1, 'seated': seated})
        await run.shot(pg, 'c_inside_0915')
        run.check('c_inside：08:48～09:15 站在 101 裡，沒有人在眼前直接坐著出現（%d 筆加進來的坐姿人物，其中在鏡頭裡、沒轉暗 %d 筆）' % (len(pops), len(bad)), not bad, json.dumps(bad[:5]))
        run.check('c_inside：替身沒有在眼前新放', fig1 == fig0, '前 %s／後 %s' % (fig0[:60], fig1[:60]))
        run.check('c_inside：09:15 坐好的同學 ≥8', seated >= 8, str(seated))
    elif case in ('c_early', 'c_lateseat'):
        h = 8.75 if case == 'c_early' else 9.2
        await load_at(pg, cdp, run, '2025-09-23', h, 'boya', why=case)
        await pg.evaluate("(%s)('101')" % BACK); await pg.wait_for_timeout(1500)
        r = await sit_and_attend(pg, cdp, run, '101', case)
        if not r: return
        says, pops = r
        wait = [x for x in says if x['t'].startswith('（你在座位上等')]; cls = [x for x in says if not x['t'].startswith('（你在座位上等')]; f = cls[0] if cls else None
        before = [p for p in pops if not p['faded'] and (not f or p['h'] <= f['h'])]
        if case == 'c_early':
            run.check('c_early：轉暗時「（你在座位上等。教室慢慢坐滿了。）」一次', len(wait) == 1, json.dumps(wait, ensure_ascii=False))
            run.check('c_early：上課第一句在 09:10 以後、畫面已經亮了', bool(f) and f['h'] >= T0 - 1e-3 and not f['faded'], json.dumps(f, ensure_ascii=False))
            run.check('c_early：上課第一句時同學坐好 ≥8、老師在講台', bool(f) and f['seated'] >= 8 and f['teacher'], json.dumps(f, ensure_ascii=False))
            run.check('c_early：轉暗以前沒有人直接坐著出現', not before, json.dumps(before[:5]))
        else:
            run.check('c_lateseat：09:12 才坐下＝沒有「你在座位上等」那一句', not wait, json.dumps(wait, ensure_ascii=False))
            run.check('c_lateseat：沒有人在座位上冒出來（還沒到的從門口走進來）', not before, json.dumps(before[:5]))
            run.check('c_lateseat：上課第一句時坐好＋走進來的 ≥8', bool(f) and f['seated'] + f['walking'] >= 8, json.dumps(f, ensure_ascii=False))
    elif case == 'c_201out':
        await load_at(pg, cdp, run, '2025-09-22', 12 + 7 / 60, 'classroom', why='c_201out')
        await pg.evaluate("(%s)(null)" % BACK); await pg.wait_for_timeout(1500)
        await pg.evaluate("""(()=>{ window.__bbGone=[]; window.__bbLeft=new Set(); let prev=new Map(); window.__bbOi=setInterval(()=>{ const cur=new Map(); for(const n of GAME.E.npcs) if(n.crowd==='cls'||n.clsStudent) cur.set(n,{seat:!!n.seat&&!n.leaving,leaving:!!n.leaving,path:n.path?n.path.length:0,x:n.obj.position.x,z:n.obj.position.z,vis:window.__bbInView(n.obj.position)});
          for(const [n,v] of cur) if(v.leaving&&v.path) window.__bbLeft.add(n); for(const [n,v] of prev) if(!cur.has(n)&&v.seat) window.__bbGone.push({h:+GAME.G.hour.toFixed(3),vis:v.vis,x:+v.x.toFixed(1),z:+v.z.toFixed(1)}); prev=cur; },200); })()""")
        n0 = await pg.evaluate("GAME.E.npcs.filter(n=>n.clsStudent).length"); await L.turn_camera_to(pg, cdp, 0, -6); await run.shot(pg, 'c_201out_before')
        await wait_hour(pg, cdp, 12 + 16 / 60, 900, run)
        r = await pg.evaluate("(()=>{ clearInterval(window.__bbOi); return {gone:window.__bbGone, left:window.__bbLeft.size, still:GAME.E.npcs.filter(n=>n.clsStudent).length}; })()")
        rec('c_201out', dict(r, n0=n0)); await run.shot(pg, 'c_201out_after')
        run.check('c_201out：霖澤館 201 下課，同學起身從門口走出去（上課 %d 人，走出去 %d 人）' % (n0, r['left']), n0 >= 8 and r['left'] >= n0 - 1, json.dumps(r, ensure_ascii=False)[:400])
        run.check('c_201out：沒有人坐在座位上當場消失', not r['gone'], json.dumps(r['gone'][:5]))


# ---------------------------------------------------------------- gym
async def gym(pg, cdp, run, case):
    if case in ('g_noon', 'g_eve'):
        h = 12.5 if case == 'g_noon' else 18.5
        await load_at(pg, cdp, run, '2025-09-23', h, 'gym', why=case); await pg.wait_for_timeout(2000)
        p = await pg.evaluate(GYMPPL); rec(case, p); await run.shot(pg, case + '_1f')
        fps = await pg.evaluate(FPS); run.note('%s 1F 幀數（SwiftShader、8 秒平均）：%s；人數 %d：%s' % (case, fps, p['n'], {k: len(v) for k, v in p['roles'].items()}))
        if case == 'g_eve': run.check('g_eve：傍晚 1F 有人（記幀數 %s）' % fps, p['n'] >= 3, json.dumps({k: len(v) for k, v in p['roles'].items()})); return
        R = p['roles']; desk = (R.get('desk_1f') or [None])[0]
        run.check('g_noon：服務台後面有人（desk_1f，x≈11、z>16.1、面向大廳）', bool(desk) and abs(desk['x'] - 11) < 0.6 and desk['z'] > 16.1 and math.cos(desk['ry']) < -0.9, json.dumps(desk))
        run.check('g_noon：大廳有人走過（walker ≥1）、長椅一人（bench ≥1）', len(R.get('walker', [])) >= 1 and len(R.get('bench', [])) >= 1, json.dumps({k: len(v) for k, v in R.items()}))
        bad = R.get('badminton', [])
        run.check('g_noon：兩面羽球場有人打（≥2 人、會跑），中間那面空著（路線都在 |x|>4）', len(bad) >= 2 and all(b['run'] for b in bad) and all(abs(q[0]) > 4 for b in bad for q in (b['wp'] or [[b['x'], b['z']]])), json.dumps(bad))
        keep = [(0, 17.6, 1.2, '進門處'), (1.6, 18.8, 1.0, '進門處旁'), (0, -2.6, 1.4, '中間那面「打羽球」')]
        hits = []
        for i in range(40):
            pp = await pg.evaluate("GAME.E.npcs.filter(n=>n.crowd&&/^gym_/.test(n.crowd)).map(n=>[n.crowdRole,+n.obj.position.x.toFixed(1),+n.obj.position.z.toFixed(1)])")
            for r_, x, z in pp:
                for kx, kz, kr, kl in keep:
                    if math.hypot(x - kx, z - kz) < kr: hits.append((kl, r_, x, z))
            await pg.wait_for_timeout(500)
        run.check('g_noon：20 秒內沒有人站上進門處、中間那面「打羽球」（羽球邀約的朋友從進門處進來不被擋）', not hits, json.dumps(sorted(set(hits))[:6], ensure_ascii=False))
        run.note('g_noon 1F 幀數 %s（記錄）' % fps)
    elif case == 'g_b1':
        await load_at(pg, cdp, run, '2025-09-23', 18.5, 'gym_b1', why='g_b1（還沒辦卡）'); await pg.wait_for_timeout(2000)
        p = await pg.evaluate(GYMPPL); rec('g_b1', p); R = p['roles']; await run.shot(pg, 'g_b1')
        aunt = (R.get('desk_b1') or [None])[0]
        run.check('g_b1：櫃台後面有「櫃台阿姨」（desk_b1）', bool(aunt) and aunt['name'] == '櫃台阿姨', json.dumps(aunt, ensure_ascii=False))
        tm = R.get('treadmill', [])
        run.check('g_b1：跑步機上有人（姿勢 run）', len(tm) >= 1 and all(t['pose'] == 'run' for t in tm), json.dumps(tm))
        it = await pg.evaluate("(()=>{ const q=GAME.E.interactables.find(q=>q.label==='去健身房'); return q?[q.x,q.z]:null; })()")
        ok = await L.go_to(pg, cdp, run, it[0], it[1], 0.9, '去健身房', max_s=180) if it else False
        s = await L.state(pg); run.check('g_b1：走到「去健身房」互動鍵出現', bool(ok) and '健身' in s['interact'], s['interact'])
        AUNT = "(()=>{ const n=GAME.E.npcs.find(n=>n.crowdRole==='desk_b1'); return n?{ry:+n.obj.rotation.y.toFixed(2),look:!!n.lookAt}:null; })()"
        a0 = await pg.evaluate(AUNT)
        await pg.evaluate("window.__bbSays=[]"); await L.tap(pg, cdp, '#interact')
        names, rys = [], []
        for i in range(40):
            s = await L.state(pg)
            nm = await pg.evaluate("(document.getElementById('dlgName')||{}).textContent||''"); names.append(nm)
            rys.append(await pg.evaluate(AUNT))
            if '櫃台阿姨' in nm and i > 1: await run.shot(pg, 'g_b1_aunt_talk')
            if not s['dlg'] and not s['choices'] and not s['busy'] and i > 3: break
            if s['choices']: await L.advance_dialogs(pg, cdp, run, lambda q: not q['choices'], max_steps=4)
            elif s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(900)
        run.check('g_b1：第一次去健身房，說話的是「櫃台阿姨」', any('櫃台阿姨' in n for n in names), json.dumps(sorted(set(names)), ensure_ascii=False))
        run.check('g_b1：櫃台阿姨說話時轉頭看你（game3d.js say()：說話的人 lookAt＝玩家）', bool(a0) and any(r and r['look'] for r in rys), '開始前 %s → 說話中 %s' % (json.dumps(a0), json.dumps([r for r in rys if r][:6])))
    elif case == 'g_3f':
        await load_at(pg, cdp, run, '2025-09-27', 15.0, 'gym_arena', why='g_3f'); await pg.wait_for_timeout(2000)
        p = await pg.evaluate(GYMPPL); rec('g_3f', p); R = p['roles']; await run.shot(pg, 'g_3f')
        bb, rest = R.get('basketball', []), R.get('rest', [])
        run.check('g_3f：週六 15:00 3F 籃球 ≥3 人（跑一段停一下＝route＋run）、場邊休息 ≥1', len(bb) >= 3 and all(b['beh'] == 'route' and b['run'] for b in bb) and len(rest) >= 1, json.dumps({'basketball': len(bb), 'rest': len(rest)}))
    elif case == 'g_closed':
        bad = []
        for key, h, lab in (('2025-09-23', 22.25, '週二 22:15'), ('2025-09-28', 18 + 20 / 60, '週日 18:20'), ('2025-09-22', 12.5, '第四個星期一 12:30')):
            for zone in ('gym', 'gym_b1', 'gym_arena'):
                await load_at(pg, cdp, run, key, h, zone, why='g_closed %s' % lab); await pg.wait_for_timeout(1500)
                n = await pg.evaluate("GAME.E.npcs.filter(n=>n.crowd&&/^gym_/.test(n.crowd)).length"); run.note('%s %s：%d 人' % (lab, zone, n))
                if n: bad.append('%s %s %d 人' % (lab, zone, n)); await run.shot(pg, 'g_closed_%s_%s' % (key, zone))
        run.check('g_closed：22:15、週日 18:20、第四個星期一，三層都沒人', not bad, '；'.join(bad))
    elif case == 'g_pe':
        key = await pg.evaluate("""(()=>{ for(let d=STORY.dayOfKey('2025-09-01');d<STORY.dayOfKey('2025-12-31');d++){ const q=CALENDAR.dateOf(d), t=CALENDAR.termOf(d); if(!t||t.week<3||q.wd!==1||(q.d>=22&&q.d<=28)) continue;
          const G={day:d,hour:15.8,flags:{},stage:'law'}; if(CLS.dayItems(G).some(it=>it.room&&it.room.door==='gym')) return q.key; } return null; })()""")
        if not key: run.check('g_pe：找得到有體育課的星期一', False, ''); return
        await load_at(pg, cdp, run, key, 15 + 40 / 60, 'gym', why='g_pe（%s）' % key); await pg.wait_for_timeout(2000)
        p = await pg.evaluate(GYMPPL); rec('g_pe', p); R = p['roles']; t = (R.get('pe_teacher') or [None])[0]; st = R.get('pe_student', [])
        if t: await L.turn_camera_to(pg, cdp, t['x'], t['z'])
        await run.shot(pg, 'g_pe')
        run.check('g_pe：體育老師面向一排同學（老師朝北邊那排、同學 ≥5 在老師南邊面向老師）', bool(t) and len(st) >= 5 and math.cos(t['ry']) > 0.9 and all(math.cos(s['ry']) < -0.9 and s['z'] > t['z'] for s in st), json.dumps({'t': t, 'st': len(st)}, ensure_ascii=False))
        it = await pg.evaluate("(()=>{ const q=GAME.E.interactables.find(q=>q.label==='體育課集合'); return q?[q.x,q.z]:null; })()")
        ok = await L.go_to(pg, cdp, run, it[0], it[1], 1.0, '體育課集合', max_s=180) if it else False
        s = await L.state(pg); run.check('g_pe：走到中圈「體育課集合」互動鍵出現', bool(ok) and '體育課集合' in s['interact'], s['interact'])
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000); s = await L.state(pg)
        run.check('g_pe：按「體育課集合」有選單或對話', s['choices'] > 0 or s['dlg'], json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'g_pe_after_tap')


# ---------------------------------------------------------------- expo
async def expo(pg, cdp, run, case):
    if case in ('e_noon', 'e_booth'):
        await load_at(pg, cdp, run, '2025-09-06', 12.0, 'campus', why=case)
        await L.advance_dialogs(pg, cdp, run, lambda q: not q['dlg'] and not q['choices'] and not q['busy'], max_steps=40)
        await pg.evaluate("GAME.E.placeAt(GAME.E.player,-47.5,7.0,0)"); run.setup('[捷徑] 人放到椰林大道法服帳篷前 (-47.5,7.0)'); await pg.wait_for_timeout(2500)
        s0 = await pg.evaluate(SIS); run.note('%s 學姊：%s' % (case, json.dumps(s0, ensure_ascii=False)))
        await L.turn_camera_to(pg, cdp, -48.0, 13.0); await run.shot(pg, case + '_booth')
        if case == 'e_noon':
            d = math.hypot((s0['x'] or 999) - SIS_SPOT[0], (s0['z'] or 999) - SIS_SPOT[1])
            run.check('e_noon：社博中午學姊在法服帳篷前右邊（作息點 0.6 m 內）', s0['on'] and d < 0.6, '%.2f m %s' % (d, json.dumps(s0, ensure_ascii=False)))
            run.check('e_noon：面向椰林大道（朝 -z）', s0['on'] and math.cos(s0['ry']) < -0.9, str(s0['ry']))
            w = s0['where']; run.check('e_noon：她在哪（whereText）＝社團博覽會法服的攤位，不是總圖', '社團博覽會' in w and '法服' in w and '總圖' not in w, w)
            await pg.evaluate("(()=>{ const b=document.getElementById('btnPhone'); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
            await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"friends\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
            row = await pg.evaluate("(()=>{ const t=(document.getElementById('phoneBody')||{}).innerText||''; return t.split('\\n').filter(l=>/學姊|溫|書瑀|社團博覽會|法服/.test(l)).slice(0,6); })()")
            await run.shot(pg, 'e_noon_phone'); run.note('手機「朋友」裡和學姊有關的行：%s（她還不認識時可能沒有這一列）' % json.dumps(row, ensure_ascii=False))
            if row: run.check('e_noon：手機「朋友」那一列寫社團博覽會（不是總圖）', any('社團博覽會' in l for l in row) and not any('總圖' in l for l in row), json.dumps(row, ensure_ascii=False))
            await L.close_panels(pg, cdp)
            ok = await L.go_to(pg, cdp, run, SIS_SPOT[0], SIS_SPOT[1] - 1.1, 0.5, '學姊前面', max_s=180)
        else:
            ok = await L.go_to(pg, cdp, run, -47.5, 11.0, 0.6, '法服攤位', max_s=180)
        s = await L.state(pg); run.note('互動鍵：%s' % s['interact'])
        run.check('%s：走到%s，互動鍵出現（%s）' % (case, '她前面' if case == 'e_noon' else '攤位', s['interact']), bool(ok) and bool(s['interact']) and (('說話' in s['interact']) if case == 'e_noon' else ('法律服務社' in s['interact'])), s['interact'])
        lines = []; await L.tap(pg, cdp, '#interact')
        for i in range(120):
            s = await L.state(pg)
            if s['dtext'] and (not lines or lines[-1] != s['dtext']): lines.append(s['dtext'])
            if i > 3 and not s['dlg'] and not s['choices'] and not s['busy']: break
            if s['choices']: await L.advance_dialogs(pg, cdp, run, lambda q: not q['choices'], max_steps=4)
            elif s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(700)
        s1 = await pg.evaluate(SIS); rec(case, {'before': s0, 'lines': lines, 'after': s1}); await run.shot(pg, case + '_after')
        run.check('%s：演社博那一段（第一句「（椰林大道上一整排帳篷。你走到法服的攤位前。）」）' % case, any('椰林大道上一整排帳篷' in l for l in lines), json.dumps(lines[:4], ensure_ascii=False))
        d1 = math.hypot((s1['x'] or 999) - SIS_SPOT[0], (s1['z'] or 999) - SIS_SPOT[1])
        run.check('%s：演完她還在攤位前（1 m 內）、記了 SIS_CLUB_EXPO' % case, s1['on'] and d1 < 1.0 and s1['done'], '%.2f m %s' % (d1, json.dumps(s1, ensure_ascii=False)))
    elif case == 'e_close':
        await load_at(pg, cdp, run, '2025-09-06', 15 + 55 / 60, 'campus', {'SIS_CLUB_EXPO': True}, why='e_close（演過社博那一段）')
        await L.advance_dialogs(pg, cdp, run, lambda q: not q['dlg'] and not q['choices'] and not q['busy'], max_steps=40)
        await pg.evaluate("GAME.E.placeAt(GAME.E.player,-48.75,8.0,0)"); await pg.wait_for_timeout(2500); await L.turn_camera_to(pg, cdp, -48.75, 12.0)
        s0 = await pg.evaluate(SIS); run.note('15:55：%s' % json.dumps(s0, ensure_ascii=False)); await run.shot(pg, 'e_close_1555')
        await pg.evaluate("""(()=>{ window.__bbSL=[]; let last=''; window.__bbSi=setInterval(()=>{ const s=(%s); const k=JSON.stringify([s.on,s.leaving,s.path>0,s.booth]); if(k!==last){ last=k; window.__bbSL.push(s); } },250); })()""" % SIS)
        await wait_hour(pg, cdp, 16 + 6 / 60, 600, run)
        sl = await pg.evaluate("(()=>{ clearInterval(window.__bbSi); return window.__bbSL; })()"); rec('e_close', sl); await run.shot(pg, 'e_close_1606')
        lv = next((x for x in sl if x['on'] and (x['leaving'] or x['path'])), None)
        vanish = any(i > 0 and sl[i - 1]['on'] and not sl[i]['on'] and not sl[i - 1]['leaving'] and sl[i - 1]['vis'] for i in range(len(sl)))
        run.check('e_close：16:00 收攤，她走開（leaving／路線），不是在眼前消失', s0['on'] and bool(lv) and not vanish, json.dumps(sl[-4:], ensure_ascii=False)[:500])
        run.check('e_close：16:00 以後法服攤位的互動點收起來', not sl[-1]['booth'], json.dumps(sl[-1], ensure_ascii=False))
    elif case == 'e_week':
        await load_at(pg, cdp, run, '2025-09-13', 12.0, 'campus', {'SIS_CLUB_EXPO': True}, why='e_week（隔一週）')
        await L.advance_dialogs(pg, cdp, run, lambda q: not q['dlg'] and not q['choices'] and not q['busy'], max_steps=40)
        await pg.evaluate("GAME.E.placeAt(GAME.E.player,-48.75,8.0,0)"); await pg.wait_for_timeout(2500)
        s0 = await pg.evaluate(SIS); rec('e_week', s0); await run.shot(pg, 'e_week')
        d = math.hypot((s0['x'] or 999) - SIS_SPOT[0], (s0['z'] or 999) - SIS_SPOT[1])
        run.check('e_week：隔一週同一時間她不在攤位（作息點 5 m 外或不在校園）', not s0['on'] or d > 5, '%.1f m %s' % (d, json.dumps(s0, ensure_ascii=False)))
        run.check('e_week：她在哪不是社團博覽會（平常作息）', '社團博覽會' not in s0['where'], s0['where'])


CASES = {'teacher': list(T_CASES), 'crowd': ['c_door', 'c_inside', 'c_early', 'c_lateseat', 'c_201out'],
         'gym': ['g_noon', 'g_eve', 'g_b1', 'g_3f', 'g_closed', 'g_pe'], 'expo': ['e_noon', 'e_booth', 'e_close', 'e_week']}
FN = {'teacher': teacher, 'crowd': crowd, 'gym': gym, 'expo': expo}


async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('people_' + MODE, OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        for case in (SUB or CASES[MODE]):
            if case not in CASES[MODE]: run.note('沒有這個情境：%s' % case); continue
            run.note('==== %s ====' % case); e0 = len(errs)
            try: await FN[MODE](pg, cdp, run, case)
            except Exception as ex: run.check('%s：工具沒有出錯' % case, False, repr(ex)[:300])
            run.check('%s：沒有 JS 例外' % case, len(errs) == e0, json.dumps(errs[e0:e0 + 3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
