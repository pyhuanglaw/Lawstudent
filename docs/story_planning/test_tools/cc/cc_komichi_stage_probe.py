"""CC-C（帳號 C）11-04：KOMICHI_STAGE——語彤期末飯（朋友那一則）在小路，六月在 3D 的 wz_teishoku 演（LAWWW-C df466bfc5 TE-KOMICHI-STAGE-1104；AA_687 改 18:00＋開場旁白）。期望值照 BB-C 21:3x／AA_687（CC_50 第 41 條），判定歸 BB。
  BB-C 原文：「大一下 6/20 18:00 語彤朋友飯，從宿舍出發、照玩家操作走；要真的切到 wz_teishoku 區域、窗外是白天；玩家坐窗邊第一桌靠門那一側、她坐對面、鏡頭兩個人都在；
             開場旁白有出現；回宿舍不卡、walkFallbacks 0。對照：大一上 12/20 用 2D teishoku_night。」
  CASES=jun：大一下（Y1S2）。CASES=dec：大一上（Y1S1）對照。
    【前置／捷徑】讀檔到期末時段第一天 09:00 宿舍；語彤認識、朋友（fam 45、trust 30＝pg_harness H.FRIEND）、這學期聯絡點數 12（同 cc_aa684_walk.js 第 10 節）；重算這學期的期末邀約（刪 G.termend.<學期>.plan）。
    【捷徑】同一份存檔跳到邀約那天（TERMEND.fromDay）20:24 宿舍。玩家：等 20:30 手機收到語彤那一則 → 私訊 → 回第一個選項（答應）→ 出遊排好（要對：週六 18:00 溫州街・小路，AA_687）。
    【捷徑】同一份存檔跳到那個週六 16:30 宿舍（跳過中間幾天）。玩家：一鍵「到下一個約會地點」→ 確定 → 晚餐照演（點對話、選項選第一個）。
    演的時候每一句記：區域、玩家座位、語彤的座位／姿勢、兩個人的頭在不在畫面裡、窗景（白天／晚上照片、tint）、OUT.bg 回傳什麼（blur＝3D、圖＝2D）。
    演完：一鍵「回去睡覺」走回宿舍；GAME.walkFallbacks 前後一樣（真實流程要求 0 次）。
  期望（jun）：G.zone＝wz_teishoku；玩家坐 WZ_SHOPS_LAYOUT.teishoku.seats[0]（−0.15, 2.9）、語彤 seats[2]（1.1, 2.9）坐著；兩個人的頭都在畫面裡；窗景是白天照片；OUT.bg('teishoku_night')＝blur；
    開場旁白「（六點，小路的布簾剛掛出來。你們是今天第一組客人。）」；演完回到原本的地方、回宿舍 walkFallbacks 不增加。
  期望（dec）：不換區域；OUT.bg('teishoku_night')＝圖；開場旁白同上（AA_687 五次都是 18:00）。
  台詞讀 GAME.say 的原文（包住 GAME.say 只記錄）。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [CASES=jun,dec] [OPEN=…] python3 cc_komichi_stage_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
CASES = [c.strip() for c in (os.environ.get('CASES') or 'jun,dec').split(',') if c.strip()]
R = L.Run('komichi_stage', OUT)
YT = 'heroine_03'
OPEN = os.environ.get('OPEN') or '（六點，小路的布簾剛掛出來。你們是今天第一組客人。）'   # AA_687（企劃線 d41750385；BB-C 21:4x）
DIN_H = float(os.environ.get('DIN_H') or 18.0)                                          # AA_687：18:00
CFG = {'jun': {'term': 'Y1S2', 'date': '2026-06-20', 'stage': True, 'ask': '2026-06-11', 'text': '考完了。我十八號還有雙主修的筆試。考完那個禮拜六，下班以後吃飯嗎。'},   # BB-C 22:12（391603230）、AA_687 22:08 補
       'dec': {'term': 'Y1S1', 'date': '2025-12-20', 'stage': False, 'ask': '2025-12-18', 'text': '禮拜六我上到五點。下班以後，要吃飯嗎？'}}   # BB-C 22:09、AA_687 第 1 項（y1s1 照留）
SAYHOOK = r"""(()=>{ if(window.__ccSayOn) return true; window.__ccSay=[]; const s0=GAME.say; GAME.say=function(who,t){ try{ window.__ccSay.push({who:who&&(who.name||who.charId)||(typeof who==='string'?who:null), t:String(t), h:+(+GAME.G.hour).toFixed(3), zone:GAME.G.zone}); }catch(e){} return s0.apply(this,arguments); }; window.__ccSayOn=true; return true; })()"""
BGHOOK = r"""(()=>{ if(window.__ccBgOn) return true; window.__ccBg=[]; const b0=OUT.bg; OUT.bg=function(id){ const r=b0.apply(this,arguments); try{ window.__ccBg.push({id:String(id), r:typeof r==='string'?r:(r&&r.image?('image:'+String(r.image).split('/').slice(-1)[0]+(r.night?'+night':'')):J(r)), zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(3)}); }catch(e){} return r; }; function J(x){ try{ return JSON.stringify(x); }catch(e){ return String(x); } } window.__ccBgOn=true; return true; })()"""
UI = r"""(()=>{ const t=(document.getElementById('dlgText')||{}).textContent||'', ch=document.getElementById('choices'); const open=!!ch&&!ch.classList.contains('hide');
  const opts=open?[...ch.querySelectorAll('button,.choice,[data-k]')].map(b=>(b.innerText||b.textContent||'').trim().split('\n')[0].trim()).filter(Boolean):[];
  const D=GAME.D||{}; return {dlg:!!D.active, text:t, opts, hour:+(+GAME.G.hour).toFixed(3), day:GAME.G.day, zone:GAME.G.zone, busy:!!GAME.E.player.busy||!!(GAME.D&&GAME.D.busyDepth>0), fade:!!(document.getElementById('fade')||{classList:{contains:()=>false}}).classList.contains('on'), ev:(typeof EVENTS!=='undefined'&&EVENTS.running)?String(EVENTS.running.id||EVENTS.running):null}; })()"""
# 演的時候的狀態：區域、玩家座位、語彤（座位、姿勢）、兩個人的頭在不在畫面裡、窗景
SCENE = r"""(()=>{ const E=GAME.E, G=GAME.G, P=E.player, cam=E.camera, V=THREE.Vector3; const n=(GAME.npc&&GAME.npc.heroine_03)||(E.npcs||[]).find(q=>q&&(q.charId==='heroine_03'||q.id==='heroine_03'));
  const head=o=>{ if(!o||!o.obj) return null; const p=o.obj.position.clone(); p.y+=1.25; const q=p.clone().project(cam); return {w:[+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)], scr:[+(((q.x+1)/2)*innerWidth).toFixed(0),+(((1-q.y)/2)*innerHeight).toFixed(0)], inView:q.z<1&&Math.abs(q.x)<=1&&Math.abs(q.y)<=1, visible:o.obj.visible!==false}; };
  const z=E.zone, ws=(z&&z.wins||[]).filter(w=>w.userData&&w.userData.pview); const d=typeof W3!=='undefined'?W3.viewPhoto('wz_teishoku',false):null, nt=typeof W3!=='undefined'?W3.viewPhoto('wz_teishoku',true):null;
  const win=ws.length?(u=>({map:u.map?(u.map.value===nt?'night':(u.map.value===d?'day':(u.map.value?'other':'none'))):null, photo:u.photo?u.photo.value:null, xf:u.xf?+u.xf.value.toFixed(3):null, tint:u.tint?'#'+u.tint.value.getHexString():null}))(ws[0].material.uniforms||{}):null;
  const adv=document.getElementById('adv'); const advBg=adv?getComputedStyle(adv).backgroundImage:null;
  return {zone:G.zone, hour:+(+G.hour).toFixed(3), lightH:E.lightH!=null?+E.lightH.toFixed(3):null, seat:P.seat?[P.seat.x,P.seat.z]:null, pose:P.pose||null, pp:[+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)],
    yt:n?{seat:n.seat?[n.seat.x,n.seat.z]:null, pose:n.pose||n.idlePose||null, frozen:!!n.frozen, pos:[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2)]}:null, headMe:head(P), headYt:head(n), cam:[+cam.position.x.toFixed(2),+cam.position.y.toFixed(2),+cam.position.z.toFixed(2)], camMode:E.cam&&E.cam.mode, win, advBg:advBg&&advBg!=='none'?advBg.slice(0,120):advBg, advNight:!!(adv&&adv.classList.contains('night')), staged:typeof TERMEND!=='undefined'?TERMEND.komichiStaged:null}; })()"""
SETUP = r"""(c=>{ const G=GAME.G, F=G.flags||(G.flags={}); G.stage='law'; G.contacts=G.contacts||{}; const id=c.id; if(id==='heroine_03') F.YT_MET_JOB=true;   /* AA_610：語彤＝一盞茶屋當同事才認識（STORY.knows、SOCIAL.ytLocked）；第一次跑沒設＝friendOk false（CC-C 11-05，pg_harness 預設有）*/
  SOCIAL.meet&&SOCIAL.meet(id,G.zone); if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.remember(id,'FIRST_MET',''); F['met_'+id]=true; const r=SOCIAL.rel(id); r.fam=Math.max(r.fam||0,45); r.trust=Math.max(r.trust||0,30); G.contacts[id]=G.day-30;
  const w=TERMEND.windowOf(c.term); G.termend=G.termend||{}; const C=G.termend.contact||(G.termend.contact={}); (C[w.id]||(C[w.id]={}))[id]={pts:12,k:{}}; if(G.termend[w.id]) delete G.termend[w.id].plan;
  const P=TERMEND.plan(G,w); const xs=TERMEND.friend?TERMEND.friend(id,w.id):null; const d0=xs&&xs.examDay&&TERMEND.heartFrom?TERMEND.heartFrom(G,w,id,xs):Math.max(TERMEND.fromDay(w,id),P.back||w.from);   /* AA_687 第 5 項：最後一科考完那天（examDay）*/
  const dbg={score:TERMEND.score?TERMEND.score(G,w.id,id):null, away:TERMEND.away?TERMEND.away(G,w,id):null, friendOk:TERMEND.friendOk?TERMEND.friendOk(G,id,w):null, inFRIEND:!!(TERMEND_LINES.FRIEND||{})[id], back:P.back, examStart:TERMEND.examStart?TERMEND.examStart(G,w):null, dating:!!F['dating_'+id], rom:typeof ROM!=='undefined'&&ROM.get?ROM.get(G,id).status:null, cool:typeof INV!=='undefined'&&INV.cool?INV.cool(G,id):null, noContact:typeof V6EX!=='undefined'&&V6EX.noContact?V6EX.noContact(G,id):null};   /* CC-C 11-05：第一次跑 friend 是空的（Node 同樣前置排得到）——印出每一個條件 */
  return {dbg, stage:SOCIAL.stage?SOCIAL.stage(id):null, w:{id:w.id,from:CALENDAR.dateOf(w.from).key,to:CALENDAR.dateOf(w.to).key}, friend:P.friend, heart:P.heart, nope:P.nope, d0, d0key:CALENDAR.dateOf(d0).key}; })"""


async def pick(pg, cdp, text):
    ok = await pg.evaluate("(t=>{ const ch=document.getElementById('choices'); if(!ch) return false; const b=[...ch.querySelectorAll('button,.choice,[data-k]')].find(x=>(x.innerText||x.textContent||'').trim().split('\\n')[0].trim()===t); if(!b) return false; b.setAttribute('data-ccpick','1'); return true; })", text)
    if not ok: return False
    await L.tap(pg, cdp, '[data-ccpick="1"]'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('[data-ccpick]'); if(b) b.removeAttribute('data-ccpick'); })()")
    return True


async def says(pg, n=0):
    return [x['t'] for x in await pg.evaluate("(n=>(window.__ccSay||[]).slice(n))", n)]


async def answer(pg, cdp, th, ask_id, k=0):
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="msg"]'); await pg.wait_for_timeout(1200)
    ok1 = await L.tap(pg, cdp, '#phoneBody [data-th="%s"]' % th); await pg.wait_for_timeout(1200)
    ok2 = await L.tap(pg, cdp, '#phoneBody [data-ask="%s|%d"]' % (ask_id, k)); await pg.wait_for_timeout(1500)
    body = (await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"))[-240:]
    await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800); await L.close_panels(pg, cdp)
    return ok1, ok2, body


async def onetap(pg, cdp, tag, key, label):
    await L.close_panels(pg, cdp)
    if not await L.tap(pg, cdp, '#btnGo'): return False, '沒有 #btnGo'
    await pg.wait_for_timeout(1000)
    sub = await pg.evaluate("(k=>{ const b=document.querySelector('#goPop [data-gok=\"'+k+'\"]'); return b?{t:(b.innerText||'').trim(), dim:b.classList.contains('dim')}:null; })", key)
    R.note('%s 一鍵「%s」：%s' % (tag, label, J(sub)))
    if not sub or sub['dim']: return False, J(sub)
    await L.tap(pg, cdp, '#goPop [data-gok="%s"]' % key); await pg.wait_for_timeout(1500)
    cf = await pg.evaluate("(()=>{ const b=document.getElementById('goConfirm'); return b&&!b.classList.contains('hide')?{title:(document.getElementById('goCfTitle')||{}).textContent, body:(document.getElementById('goCfBody')||{}).innerText}:null; })()")
    R.note('%s 確認框：%s' % (tag, J(cf)))
    if not cf: return True, None   # 有的選項不跳確認框
    await pg.wait_for_timeout(700); await L.tap(pg, cdp, '#goCfYes'); await pg.wait_for_timeout(1500)
    return True, cf


async def drive(pg, cdp, tag, max_s=480, on_line=None):
    """點對話、選項（第一個），直到演完（12 秒沒有對話、選項、劇情鎖、黑幕）；on_line(u) 每一句新台詞呼叫一次"""
    t0 = time.time(); menus = []; act = time.time(); seen = False; last = None
    while time.time() - t0 < max_s:
        u = await pg.evaluate(UI)
        if u['dlg'] or u['opts'] or u['busy'] or u['fade']: act = time.time(); seen = seen or u['dlg']
        elif seen and time.time() - act > 12: return menus, u, True
        if u['opts']:
            op = u['opts'][0]; menus.append({'opts': u['opts'], 'pick': op, 'h': u['hour']})
            await pick(pg, cdp, op); continue
        if u['dlg'] and u['text']:
            t1 = time.time()
            while time.time() - t1 < 8:
                await pg.wait_for_timeout(350); u2 = await pg.evaluate(UI)
                if not u2['dlg'] or u2['text'] == u['text']: break
                u = u2
            if on_line and u['text'] != last: await on_line(u)
            last = u['text']
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(400)
    return menus, await pg.evaluate(UI), False


async def run_case(pg, cdp, c):
    cf = CFG[c]; term, tag = cf['term'], '[%s]' % c
    d = await pg.evaluate("(t=>{ const w=TERMEND.windowOf(t); return {from:w.from, to:w.to, fromKey:CALENDAR.dateOf(w.from).key, din:STORY.dayOfKey(%s)}; })" % J(cf['date']), term)
    R.setup('%s 讀檔：宿舍、%s（%s 期末時段第一天）09:00；語彤朋友（YT_MET_JOB＝一盞茶屋認識、fam 45、trust 30）、聯絡點數 12；重算這學期的期末邀約' % (tag, d['fromKey'], term))
    await L.load_state(pg, {'zone': 'dorm', 'hour': 9.0, 'day': d['from'], 'weather': 'clear'}, quiet_phone=True)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
    st = await pg.evaluate(SETUP, {'id': YT, 'term': term})
    R.note('%s 設定：%s' % (tag, J(st)))
    if not R.check('%s 語彤是這學期朋友的期末邀約（TERMEND.plan friend）' % tag, YT in (st.get('friend') or []) and YT not in (st.get('heart') or []), J(st)): return
    snap = await pg.evaluate("JSON.stringify(GAME.snapshot())")
    R.setup('%s 讀檔（同一份存檔）跳到邀約那天 %s 20:24 宿舍' % (tag, st['d0key']))
    await pg.evaluate("(([s,d])=>{ const G=JSON.parse(s); G.day=d; G.hour=20.4; G.zone='dorm'; delete G.pos; window.__ccSnap=G; })", [snap, st['d0']])
    await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); })()"); await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    tg = 'te_%s_%s' % (term, YT)
    m = None
    for i in range(80):
        m = await pg.evaluate("(tg=>{ const L=(GAME.G.msgs||[]).filter(m=>m.tag===tg); const a=L.find(m=>m.ask); return L.length?{day:L[0].day, key:CALENDAR.dateOf(L[0].day).key, h:L[0].h, texts:L.map(m=>m.text), ask:a?{id:a.ask.id, opts:a.ask.opts.map(o=>o.t)}:null}:null; })", tg)
        if m and m['ask']: break
        h = (await pg.evaluate(UI))['hour']
        if h < 20.9: await pg.evaluate("(async()=>{ await GAME.advance(0.1); })()")
        await pg.wait_for_timeout(1000)
    R.note('%s 收到的邀約：%s' % (tag, J(m)))
    if not R.check('%s %s 20:30 語彤傳期末飯的邀約（可以回覆）' % (tag, st['d0key']), bool(m and m['ask']), J(m)): return
    R.check('%s 邀約那天 %s、20:30（最後一科考完那天，AA_687 第 5 項）' % (tag, cf['ask']), m['key'] == cf['ask'] and abs(m['h'] - 20.5) < 0.01, J([m['key'], m['h']]))
    R.check('%s 邀約的字逐字「%s」' % (tag, cf['text']), m['texts'][-1] == cf['text'], J(m['texts']))
    ok1, ok2, body = await answer(pg, cdp, 'p:' + YT, m['ask']['id'], 0)
    R.note('%s 手機：私訊 %s、回「%s」%s；%s' % (tag, ok1, m['ask']['opts'][0], ok2, body.replace('\n', ' / ')[-160:]))
    if not ok2:
        R.note('%s 手機點不到第一個選項 →【捷徑】PHONE.answer' % tag); await pg.evaluate("(t=>PHONE.answer(GAME.G,t,0))", m['ask']['id'])
    q = await pg.evaluate("(t=>{ for(let i=0;i<3;i++) STORY.phoneRules(GAME); const q=OUT.rec(GAME.G).find(q=>q&&q.te&&q.te.who==='heroine_03'&&q.te.term===t); return q?{id:q.id, day:q.day, key:CALENDAR.dateOf(q.day).key, h:q.h, place:q.place, state:q.state}:null; })", term)
    R.check('%s 答應以後晚餐排 %s（六）%s 溫州街・小路（AA_687）' % (tag, cf['date'], '%02d:%02d' % (int(DIN_H), round(DIN_H % 1 * 60))), bool(q) and q['key'] == cf['date'] and abs(q['h'] - DIN_H) < 0.01 and q['place'] == '溫州街・小路', J(q))
    if not q: return
    snap = await pg.evaluate("JSON.stringify(GAME.snapshot())")
    R.setup('%s 讀檔（同一份存檔）跳到 %s 16:30 宿舍——跳過中間的日子' % (tag, q['key']))
    await pg.evaluate("(([s,d])=>{ const G=JSON.parse(s); G.day=d; G.hour=16.5; G.zone='dorm'; delete G.pos; window.__ccSnap=G; })", [snap, q['day']])
    await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); })()"); await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
    wf0 = await pg.evaluate("GAME.walkFallbacks||0")
    await pg.evaluate(SAYHOOK); await pg.evaluate(BGHOOK); n0 = len(await says(pg))
    ok, cfm = await onetap(pg, cdp, tag, 'date', '到下一個約會地點')
    if not R.check('%s 一鍵「到下一個約會地點」→ 確定（出發去小路）' % tag, ok, J(cfm)): return
    S = []; shots = []

    async def on_line(u):
        s = await pg.evaluate(SCENE); s['text'] = u['text'][:60]; S.append(s)
        if len(shots) < 3 and (s['zone'] == 'wz_teishoku' or (not cf['stage'] and len(S) in (1, 3))):
            f = await R.shot(pg, '%s_line%02d' % (c, len(S))); shots.append(f)
    menus, u, fin = await drive(pg, cdp, tag, max_s=600, on_line=on_line)
    L1 = await says(pg, n0)
    bg = await pg.evaluate("(window.__ccBg||[]).filter(x=>x.id==='teishoku_night'||x.id==='blur')")
    q2 = await pg.evaluate("(t=>{ const q=OUT.rec(GAME.G).find(q=>q&&q.te&&q.te.who==='heroine_03'&&q.te.term===t); const P=GAME.E.player; return {out:q?{state:q.state}:null, hour:+(+GAME.G.hour).toFixed(2), zone:GAME.G.zone, pos:[+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)], busy:!!P.busy, frozen:!!P.frozen, seat:!!P.seat, staged:TERMEND.komichiStaged}; })", term)
    R.note('%s 晚餐的台詞（%d 句）：%s' % (tag, len(L1), J(L1)))
    R.note('%s 選單：%s' % (tag, J(menus)))
    for s in S: R.note('%s 演的時候：%s' % (tag, J(s)))
    R.note('%s OUT.bg（teishoku_night）：%s' % (tag, J(bg)))
    R.note('%s 演完以後：%s' % (tag, J(q2)))
    R.check('%s 晚餐演了（出遊 done、有台詞）' % tag, bool(q2['out']) and q2['out']['state'] == 'done' and len(L1) > 3, J(q2))
    R.check('%s 開場旁白「%s」有出現（AA_687）' % (tag, OPEN), OPEN in L1, J(L1[:4]))
    inK = [s for s in S if s['zone'] == 'wz_teishoku']
    if cf['stage']:
        R.check('%s 真的切到 wz_teishoku 演（%d／%d 句在小路）' % (tag, len(inK), len(S)), len(inK) > 0 and len(inK) >= len(S) - 2, J([s['zone'] for s in S]))
        if inK:
            s0 = inK[0]
            R.check('%s 玩家坐窗邊第一桌靠門那一側（−0.15, 2.9）' % tag, bool(s0['seat']) and abs(s0['seat'][0] + 0.15) < 0.05 and abs(s0['seat'][1] - 2.9) < 0.05, J(s0['seat']))
            R.check('%s 語彤坐對面（1.1, 2.9）、坐著' % tag, bool(s0['yt']) and abs(s0['yt']['pos'][0] - 1.1) < 0.2 and abs(s0['yt']['pos'][1] - 2.9) < 0.2 and (s0['yt']['pose'] == 'sit' or bool(s0['yt']['seat'])), J(s0['yt']))
            both = [s for s in inK if s['headMe'] and s['headYt'] and s['headMe']['inView'] and s['headYt']['inView']]
            R.check('%s 鏡頭兩個人的頭都在畫面裡（%d／%d 句）' % (tag, len(both), len(inK)), len(both) == len(inK), J([[s['headMe'] and s['headMe']['inView'], s['headYt'] and s['headYt']['inView']] for s in inK]))
            R.check('%s 窗外是白天的照片（窗景 map＝day、photo＝1）' % tag, all(s['win'] and s['win']['map'] == 'day' and s['win']['photo'] == 1 for s in inK), J([[s['hour'], s['lightH'], s['win']] for s in inK]))
            R.note('%s （只記錄）窗景色調：%s——光線 18.4 以後白天照片調成 0x8a8aa8（W3.photoTint）' % (tag, J(sorted(set(s['win']['tint'] for s in inK if s['win'])))))
        R.check('%s 演的時候 OUT.bg(teishoku_night)＝blur（3D 背景）' % tag, any(x['r'] == 'blur' for x in bg) and not any(x['id'] == 'teishoku_night' and x['r'] != 'blur' and x['zone'] == 'wz_teishoku' for x in bg), J(bg))
    else:
        R.check('%s 對照：沒有換到 wz_teishoku（照舊 2D）' % tag, not inK, J([s['zone'] for s in S]))
        R.check('%s 對照：OUT.bg(teishoku_night)＝圖（不是 blur）' % tag, any(x['id'] == 'teishoku_night' and x['r'].startswith('image:') for x in bg) and not any(x['r'] == 'blur' for x in bg), J(bg))
    R.check('%s 演完回到原本的地方（不在 wz_teishoku、沒有卡在劇情鎖、沒有坐著）' % tag, q2['zone'] != 'wz_teishoku' and not q2['busy'] and not q2['frozen'] and not q2['staged'], J(q2))
    await R.shot(pg, '%s_after' % c)
    # 回宿舍
    ok, cfm = await onetap(pg, cdp, tag, 'sleep', '回去睡覺')
    R.note('%s 一鍵「回去睡覺」：%s %s' % (tag, ok, J(cfm)))
    z = None
    for _ in range(90):
        z = await pg.evaluate("(()=>{ const P=GAME.E.player; return {zone:GAME.G.zone, hour:+(+GAME.G.hour).toFixed(2), busy:!!P.busy, dlg:!!(GAME.D&&GAME.D.active)}; })()")
        if z['zone'] == 'dorm' and not z['busy']: break
        u = await pg.evaluate(UI)
        if u['opts']: await pick(pg, cdp, u['opts'][0])
        elif u['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(1000)
    wf1 = await pg.evaluate("GAME.walkFallbacks||0")
    R.check('%s 回到宿舍（一鍵「回去睡覺」走回去）' % tag, bool(z) and z['zone'] == 'dorm', J(z))
    R.check('%s walkFallbacks 0（前 %s、後 %s）' % (tag, wf0, wf1), wf1 == wf0 == 0, J([wf0, wf1]))
    await R.shot(pg, '%s_home' % c)


async def main():
    print('CC KOMICHI_STAGE（瀏覽器、玩家操作）：CASES=%s；晚餐 %s；開場旁白 %s；SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (CASES, DIN_H, OPEN, os.environ.get('SHA', '?')), flush=True)
    for c in CASES:
        async with async_playwright() as p:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            await cc_det.install(pg, int(os.environ.get('CC_SEED') or 20261104))
            t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('[%s] 遊戲載入' % c, ok, '%.1f 秒' % (time.time() - t0))
            if ok:
                await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
                try:
                    await run_case(pg, cdp, c)
                except Exception as e:
                    R.check('[%s] 探針沒有例外' % c, False, repr(e)[:300])
                R.check('[%s] 沒有 JS 例外' % c, not errs, J(errs[:3]))
            await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
