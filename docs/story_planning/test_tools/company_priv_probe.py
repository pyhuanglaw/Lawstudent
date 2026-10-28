"""BB-C 10-28：COMPANY-PRIV-1028（旁邊有人時私密的不出）＋CIRCLE3D-Y4-1028（大四的圈子）瀏覽器驗收（LAWWW-C 07:52 P1，開發分支 0a6ebbe37 起）。
「旁邊有人」＝她圈子那一列的同伴在她 3.2 m 內（HCIRCLE.withNow；STORY.COMPANY → STORY.privNow＝false）。判斷都用玩家操作：走到她旁邊、按「和她說話」、點對話、看選單。
底：使用者存檔 bbtest/p0an/user_day14.json（法律系 day 14），改日期時間地點＝【前置】；改關係、交往、階梯指標＝【捷徑】（都在輸出裡標）。
條件事件預設關掉（load_state quiet_events：只關 EVENTS.onEnter／tick 和手機自動打開；和她說話的 EVENTS.onInteract 照舊）；QUIET=0 不關。

MODE（環境變數）：
  menu  （A1）2025-10-06 星期一 18:01 校園，c503_4_2 以安×Alison 18:00～18:50。【前置】拿掉以安的聯絡方式。
          同伴在旁邊說話：選單沒有「約她去…」、有「交換聯絡方式」→【捷徑】同一天 18:54（Alison 走了；WAIT=1 改成站著等到 18:51 以後）再說一次：「約她去…」回來。
  ladder（A2）語彤 Y-L7「我媽每個月要回診一次」（PRIVTALK yt_mom_lad，整層私密）。【捷徑】階梯指標＝6（Y-L7）。
          2025-10-09 星期四 12:06 校園 c503_6_1 語彤×筱涵：說話＝照常閒聊、沒有 Y-L7、指標不前進、PRIVTALK.held 記 yt_mom_lad
          →【前置】隔天 2025-10-10 星期五 10:00 總圖（她一個人看書）：Y-L7 那句出現、指標到 7。
  event （A3）坦白有別人（tell_now：「我有件事要跟妳講。」→ ROM.tellBy）。【捷徑】以安熟悉 65／信任 50／自在 45＋ROM.start（存檔原本和可昕交往）。
          時段同 menu：同伴在旁邊＝沒有這個選項、沒有演、confessAny 還是同一人 →【捷徑】18:54 再說一次：選項出現、選了照演（YT_CONFESSED 記下）。
  normal（A4）2025-10-07 星期二 12:06 校園 c503_6_1：【捷徑】階梯指標＝5（Y-L6「我今天社會學被點到」，不私密）。同伴在旁邊照演、指標到 6、
          PRIVTALK 沒擋；同一天再說一次＝一般招呼／閒聊照常（沒有被擋）。課業、讀書會沒有包含在這支裡。
  y4    （B）ROWS（預設三列，逗號分隔）：c509_4_1 子晴一個人 2028-09-19 星期二 22:30 公館騎樓（對照組：「約她去…」要出現）、
          c509_5_1 學姊×陳助教 2029-01-05 星期五 19:00 公館、c510_1_1 以安×語彤 2029-03-08 星期四 20:24 總圖（語彤坐在以安後面）。
          【前置】EXCHANGE_ROUTE＝TW；【捷徑】那位女主角熟悉 ≥30、FIRST_MET。每列查：同伴在 3.2 m 內、站的位置（站得住、不和她或別人重疊、不擋出入口）、
          走近 5 m 內出字幕（heard 記成今天）、說話選單「約她去…」照規則；截圖 view／heard／menu。
每個 MODE 都查：沒有 JS 例外。「前置：…」那幾行 FAIL＝情境沒成立（同伴走開了、她不在），不是遊戲的錯，重跑或改時間。
估計時間（SwiftShader 1–4 fps，沒有實測）：menu 10～15 分、event 12～18 分、ladder 10～14 分、normal 6～9 分、y4 三列 25～40 分（WAIT=1 的 menu／event 多 5～10 分）。
不是 iPhone：Playwright 手機橫向模擬。不要和別的瀏覽器測試同時跑。
用法：LW_TESTS=<工作樹>/tests MODE=menu python3 company_priv_probe.py '<URL>/index.html' <輸出資料夾> [存檔.json]"""
import os, sys, json, asyncio, time, copy
sys.path.insert(0, os.environ.get('LW_TESTS', 'tests')); import playlib as L
from playwright.async_api import async_playwright
SP = '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad'
MODE = os.environ.get('MODE', 'menu'); WAIT = os.environ.get('WAIT') == '1'; QUIET = os.environ.get('QUIET', '1') != '0'
CONF = '「我有件事要跟妳講。」'
Y4 = {'c509_4_1': dict(key='2028-09-19', h=22.5, zone='gongguan', who='heroine_04', inv=True, desc='子晴一個人（alone）公館騎樓 22:00～24:00'),
      'c509_5_1': dict(key='2029-01-05', h=19.0, zone='gongguan', who='heroine_05', inv=False, desc='學姊×陳助教 星期五 18:30～20:30（2028-12-23～2029-02-18）'),
      'c510_1_1': dict(key='2029-03-08', h=20.4, zone='library', who='heroine_01', inv=False, desc='以安×語彤 總圖 星期四 20:00～21:30（大四下第 1～15 週）')}

# 只記錄、不改行為：STORY.privNow 每次被問的答案（offerInvite、PRIVTALK.ok 都問它）、字幕（#caption）
HELPERS = r"""(()=>{ if(window.__CPF) return 'again';
  const W=window.__CP={priv:[],cap:[],dl:[]};
  { let last=''; setInterval(()=>{ try{ const D=GAME.D; const k=D&&D.active?String(D.full||''):''; if(k&&k!==last){ W.dl.push(k); if(W.dl.length>400) W.dl.splice(0,200); } last=k; }catch(e){} },50); }   /* BB-C 10-28 priv_ladder：只有一句的閒聊在兩次讀取之間開了又關（1 fps），對話記錄改成 50 ms 看一次 D.full */
  const p0=STORY.privNow; STORY.privNow=function(G,id,n,GM){ const r=p0.apply(this,arguments);
    try{ W.priv.push({id,r:!!r,w:HCIRCLE.withNow(GM||GAME,id),d:G&&G.day,h:G?+(+G.hour).toFixed(2):null}); if(W.priv.length>300) W.priv.splice(0,150); }catch(e){} return r; };
  const el=document.getElementById('caption'); if(el){ let last=''; new MutationObserver(()=>{ const t=(el.textContent||'').trim(); if(t&&t!==last){ last=t; W.cap.push({t,h:+(+GAME.G.hour).toFixed(2),d:GAME.G.day}); if(W.cap.length>200) W.cap.splice(0,100); } }).observe(el,{childList:true,subtree:true,characterData:true}); }
  const npc=id=>HCIRCLE.npcOf(GAME,id)||GAME.E.npcs.find(m=>m.charId===id)||null;
  const xz=o=>o&&o.obj?{x:+o.obj.position.x.toFixed(2),z:+o.obj.position.z.toFixed(2),lv:o.lv|0,beh:o.beh||null,pose:o.pose||null,hidden:!!o.hidden,leaving:!!o.leaving,seated:!!o.seat||/sit|read/.test(o.pose||'')}:null;
  const lab=()=>{ const it=document.getElementById('interact'); return (it&&!it.classList.contains('hide'))?((document.getElementById('interactLabel')||{}).textContent||''):''; };
  const F=window.__CPF={npc,xz,lab};
  F.info=function(id,rid){ const G=GAME.G, E=GAME.E, P=E.player.obj.position, n=npc(id), r=rid?HCIRCLE.row(rid):null;
    const out={day:CALENDAR.dateOf(G.day).key,h:+(+G.hour).toFixed(2),zone:G.zone,me:{x:+P.x.toFixed(2),z:+P.z.toFixed(2),lv:E.player.lv|0},her:xz(n),stage:SOCIAL.stage(id),
      canInv:!!INV.canInvite(G,id),contact:!!INV.hasContact(G,id),going:(G.invites||[]).some(v=>v.who===id&&v.state==='going'),
      withNow:HCIRCLE.withNow(GAME,id),on:r?!!HCIRCLE.on(r,G,G.zone):null,comp:[],lab:lab()};
    if(n&&n.obj){ const h=n.obj.position; out.her.name=n.name; out.her.label=n.talkLabel||null; out.her.talk=!!n.talk; out.her.dMe=+Math.hypot(h.x-P.x,h.z-P.z).toFixed(2); out.her.stand=E.canStand?!!E.canStand(h.x,h.z,0.25):null; }
    if(n&&n.obj&&r&&r.with) for(const cid of r.with){ const cn=npc(cid), c=xz(cn), o={id:cid,name:cn&&cn.name||null,pos:c};
      if(c){ const h=n.obj.position, q=cn.obj.position; o.dHer=+Math.hypot(q.x-h.x,q.z-h.z).toFixed(2); o.stand=E.canStand?!!E.canStand(q.x,q.z,0.25):null;
        let mo=99, mi=null; for(const m of E.npcs){ if(m===cn||m===n||m.hidden||!m.obj) continue; const d=Math.hypot(m.obj.position.x-q.x,m.obj.position.z-q.z); if(d<mo){ mo=d; mi=m.name||m.charId||m.id||null; } } o.nearOther=[+mo.toFixed(2),mi];
        let me=99, mx=null; for(const it of E.interactables){ if(!it.exit&&!it.enter) continue; const d=Math.hypot(it.x-q.x,it.z-q.z); if(d<me){ me=d; mx=it.label||null; } } o.nearExit=[+me.toFixed(2),mx]; }
      out.comp.push(o); }
    return out; };
  /* 她旁邊、離同伴遠的那一邊 1 m（按鈕才會是「和她說話」，不是和同伴）*/
  F.target=function(id,avoid){ const E=GAME.E, P=E.player.obj.position, n=npc(id); if(!n||!n.obj||n.hidden) return null; const h=n.obj.position; let ax=0, az=0, k=0;
    for(const c of avoid){ const cn=npc(c); if(cn&&cn.obj&&!cn.hidden){ const q=cn.obj.position; if(Math.hypot(q.x-h.x,q.z-h.z)<4){ ax+=q.x; az+=q.z; k++; } } }
    let dx, dz; if(k){ dx=h.x-ax/k; dz=h.z-az/k; } else { dx=P.x-h.x; dz=P.z-h.z; } const len=Math.hypot(dx,dz)||1; dx/=len; dz/=len;
    let tx=h.x+dx, tz=h.z+dz; for(let i=0;i<8;i++){ const a=((i&1)?1:-1)*Math.ceil(i/2)*Math.PI/4, c=Math.cos(a), s=Math.sin(a), x=h.x+(dx*c-dz*s), z=h.z+(dx*s+dz*c); if(!E.canStand||E.canStand(x,z,0.3)){ tx=x; tz=z; break; } }
    const want=n.talkLabel||('和'+n.name+'說話'), l=lab();
    return {hx:+h.x.toFixed(2),hz:+h.z.toFixed(2),tx:+tx.toFixed(2),tz:+tz.toFixed(2),want,lab:l,ok:l===want,d:+Math.hypot(P.x-h.x,P.z-h.z).toFixed(2),beh:n.beh||null}; };
  /* 【前置】玩家站到她 R m 外站得住的地方 */
  F.place=function(id,R){ const E=GAME.E, P=E.player, n=npc(id); if(!n||!n.obj) return null; const h=n.obj.position;
    for(const R2 of [R,R-2,R+2,R-4]){ if(R2<2.5) continue; for(let i=0;i<16;i++){ const a=i*Math.PI/8, x=h.x+Math.sin(a)*R2, z=h.z+Math.cos(a)*R2; if(E.canStand&&!E.canStand(x,z,0.35)) continue;
      E.placeAt(P,x,z,n.lv|0); P.path=null; return {x:+x.toFixed(2),z:+z.toFixed(2),R:R2,hx:+h.x.toFixed(2),hz:+h.z.toFixed(2)}; } }
    return null; };
  F.ts=function(){ const D=GAME.D, ch=document.getElementById('choices'), dl=document.getElementById('dlg');
    return {dlg:!!(D&&D.active),txt:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgText')||{}).textContent||'').trim():'',
      ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>(b.textContent||'').trim()):[],
      busy:!!GAME.E.player.busy,depth:(D&&D.busyDepth)|0,phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()),h:+(+GAME.G.hour).toFixed(2)}; };
  F.ladKey=id=>{ const D=STORY.ladData&&STORY.ladData(GAME.G,id); return D?D.key:id; };
  F.pre=function(id){ const G=GAME.G, so=G.social||{}, k=F.ladKey(id); if(typeof PRIVTALK!=='undefined') PRIVTALK.held.length=0;
    return {priv:W.priv.length,cap:W.cap.length,dl:W.dl.length,done:Object.keys((G.events&&G.events.done)||{}),lad:(so.ladder||{})[k],ladDay:(so.ladderDay||{})[id]}; };
  F.post=function(id,p){ const G=GAME.G, so=G.social||{}, k=F.ladKey(id), dn=(G.events&&G.events.done)||{};
    return {priv:W.priv.slice(p.priv).filter(x=>x.id===id),held:typeof PRIVTALK!=='undefined'?PRIVTALK.held.slice():[],ev:Object.keys(dn).filter(e=>!p.done.includes(e)),
      lad:(so.ladder||{})[k],ladDay:(so.ladderDay||{})[id],day:G.day}; };
  return 'ok'; })()"""

DAY_JS = "k=>{ const d=STORY.dayOfKey(k); const w=CALENDAR.dateOf(d).wd; return {d, wd:w===7?0:w}; }"
LADSTEP_JS = "([id,i])=>{ const D=STORY.ladData(GAME.G,id); const s=D&&D.L.steps[i]; return s?{id:s.id,lines:(s.lines||[]).map(l=>typeof l==='string'?l:l&&l.t)}:null; }"
ROWLINES_JS = "rid=>{ const r=HCIRCLE.row(rid); return r?r.lines.map(l=>({id:l.id||null,t:l.t})):null; }"
HEARD_JS = "rid=>{ const R=(GAME.G.flags||{}).HCIRCLE||{}; return {heard:R.heard?R.heard[rid]:null, day:GAME.G.day, cap:window.__CP.cap.slice(-10)}; }"
CONF_JS = "([id,y])=>({y:MREL.confessAny(GAME.G,id), done:!!(y&&MREL.confessed(GAME.G,id,y)), YT:(GAME.G.flags||{}).YT_CONFESSED||null})"
PREP_A3 = """(id)=>{ const G=GAME.G, r=SOCIAL.rel(id); r.fam=Math.max(r.fam||0,65); r.trust=Math.max(r.trust||0,50); r.comf=Math.max(r.comf||0,45);
  if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,G.zone); ROM.start(G,id); return {stage:SOCIAL.stage(id), partners:ROM.partners(G), y:MREL.confessAny(G,id)}; }"""
PREP_LAD = """([id,ptr])=>{ const G=GAME.G, r=SOCIAL.rel(id); r.fam=Math.max(r.fam||0,30); if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,G.zone);
  const D=STORY.ladData(G,id), k=D?D.key:id, so=G.social; so.ladder=so.ladder||{}; so.ladderDay=so.ladderDay||{}; so.ladder[k]=ptr; delete so.ladderDay[id]; delete so.ladderDay[k];
  const st=SOCIAL.stage(id); return {stage:st, famOk:SOCIAL.STAGES.indexOf(st)>=SOCIAL.STAGES.indexOf('FAMILIAR'), key:k, ptr:so.ladder[k], step:D&&D.L.steps[ptr]?D.L.steps[ptr].id:null}; }"""
PREP_Y4 = """(id)=>{ const G=GAME.G, r=SOCIAL.rel(id); r.fam=Math.max(r.fam||0,30); r.trust=Math.max(r.trust||0,10); if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,G.zone);
  return {stage:SOCIAL.stage(id), canInv:!!INV.canInvite(G,id), contact:!!INV.hasContact(G,id)}; }"""
CHOICE_AT_JS = "k=>{ const b=document.querySelectorAll('#choices button'); const e=b[k]||b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; }"

J = lambda o: json.dumps(o, ensure_ascii=False)
has = lambda menu, pre: any(o.startswith(pre) for o in (menu or []))


def clean(seen):
    """對話框逐字出現：只留每一句最後完整的那一版"""
    out = []
    for t in seen:
        if out and t.startswith(out[-1]): out[-1] = t
        elif out and out[-1].startswith(t): continue
        else: out.append(t)
    return out


async def base(pg, save, key, hour, zone, y4=False):
    d = await pg.evaluate(DAY_JS, key)
    s = copy.deepcopy(save); s.pop('_stuck', None)
    s.update(day=d['d'], weekday=d['wd'], hour=hour, zone=zone, pos=None)
    s['invites'] = [v for v in s.get('invites', []) if v.get('state') != 'going']
    if y4: s.setdefault('flags', {})['EXCHANGE_ROUTE'] = 'TW'
    return s


async def settle(pg, cdp):
    await pg.wait_for_timeout(6000); await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)


async def setup(pg, cdp, run, st, prep=None, arg=None):
    """讀檔（遊戲自己的 applySave）；有 prep＝用遊戲的 API 改關係／階梯，存成快照再讀一次（區域照新的狀態重建）"""
    await L.load_state(pg, st, quiet_events=QUIET, quiet_phone=True); await settle(pg, cdp)
    if prep:
        r = await pg.evaluate(prep, arg); run.note('【捷徑】結果：%s' % J(r))
        snap = await pg.evaluate("()=>GAME.snapshot()")
        await L.load_state(pg, snap, quiet_events=QUIET, quiet_phone=True); await settle(pg, cdp)
        return r
    return None


async def jump(pg, cdp, run, key, hour, zone, keep_pos=True):
    """【前置】跳到另一個時間（同一份進度：GAME.snapshot() 改日期時間地點再讀）"""
    snap = await pg.evaluate("()=>GAME.snapshot()"); d = await pg.evaluate(DAY_JS, key)
    snap.update(day=d['d'], weekday=d['wd'], hour=hour, zone=zone)
    if not keep_pos: snap['pos'] = None
    await L.load_state(pg, snap, quiet_events=QUIET, quiet_phone=True); await settle(pg, cdp)


async def info(pg, who, rid=None):
    return await pg.evaluate("([a,b])=>__CPF.info(a,b)", [who, rid])


async def place(pg, cdp, run, who, R=7.0):
    p = await pg.evaluate("([a,b])=>__CPF.place(a,b)", [who, R])
    run.setup('[前置] 站到她 %s m 外：%s' % (p and p['R'], J(p)))
    if p:
        await pg.wait_for_timeout(1500); await L.turn_camera_to(pg, cdp, p['hx'], p['hz'])
    return p


async def tap_choice(pg, cdp, k):
    c = await pg.evaluate(CHOICE_AT_JS, k); await L.touch_tap(cdp, c[0], c[1])


async def talk(pg, cdp, run, who, rid, tag, pick=None, max_s=300):
    """按「和她說話」→ 點對話；選項裡有「就這樣」＝說話後的選單（記下來、截圖；選 pick 開頭的那一個，沒有就「就這樣」）；別的選項（階梯的回答）選第一個。
    回傳 None＝按了沒有開始說話"""
    at_tap = await info(pg, who, rid); pre = await pg.evaluate("id=>__CPF.pre(id)", who)
    await L.tap(pg, cdp, '#interact'); t0 = time.time(); seen = []; menu = None; at_menu = None; priv_menu = None; picked = None; started = False; idle = None
    while time.time() - t0 < max_s:
        s = await pg.evaluate("()=>__CPF.ts()")
        if s['txt'] and (not seen or seen[-1] != s['txt']): seen.append(s['txt'])
        if s['phone']: await L.phone_away(pg, cdp); continue
        if s['ch']:
            started = True; idle = None
            if any(o.startswith('就這樣') for o in s['ch']) and menu is None:
                menu = s['ch']; at_menu = await info(pg, who, rid)
                priv_menu = [x for x in (await pg.evaluate("p=>window.__CP.priv.slice(p)", pre['priv'])) if x['id'] == who]
                await run.shot(pg, tag + '_menu')
                k = next((i for i, o in enumerate(menu) if pick and o.startswith(pick)), None)
                if k is None: k = next(i for i, o in enumerate(menu) if o.startswith('就這樣'))
                picked = menu[k]
            else: k = next((i for i, o in enumerate(s['ch']) if o.startswith('就這樣')), 0)
            await tap_choice(pg, cdp, k); await pg.wait_for_timeout(800); continue
        if s['dlg']: started = True; idle = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['busy'] or s['depth'] > 0: started = True; idle = None; await pg.wait_for_timeout(500); continue
        if not started:
            if time.time() - t0 > 8: return None
        else:
            idle = idle or time.time()
            if time.time() - idle > 4: break
        await pg.wait_for_timeout(400)
    post = await pg.evaluate("([a,b])=>__CPF.post(a,b)", [who, pre])
    dl = await pg.evaluate("p=>window.__CP.dl.slice(p)", pre.get('dl', 0))
    lines = clean(seen)
    if len(dl) > len(lines): lines = dl   # 50 ms 的對話記錄比較完整（一句的閒聊不會漏）
    r = dict(menu=menu, picked=picked, lines=lines, at_tap=at_tap, at_menu=at_menu, priv_menu=priv_menu, pre=pre, post=post)
    run.note('%s：選單 %s；選了 %s；台詞 %s' % (tag, J(menu), J(picked), J(r['lines'][-8:])))
    run.note('%s：說話時 withNow %s；選單時 %s；privNow 記錄 %s；PRIVTALK.held %s；新演的事件 %s；階梯 %s → %s' % (
        tag, J(at_tap['withNow']), J(at_menu and at_menu['withNow']), J((priv_menu if priv_menu is not None else post['priv'])[-3:]),
        J(post['held']), J(post['ev']), pre['lad'], post['lad']))
    return r


async def approach_talk(pg, cdp, run, who, rid, avoid, tag, pick=None, max_s=420, redo=None):
    """像玩家一樣走到她旁邊（她可能在走動：每一輪重新看她在哪）到按鈕變成「和她說話」再按；按了沒反應、或先演了別的事件就再說一次（最多三次）"""
    t0 = time.time(); n = 0; tries = 0
    while time.time() - t0 < max_s and tries < 3:
        g = await pg.evaluate("([a,b])=>__CPF.target(a,b)", [who, avoid])
        if not g: run.note('%s：她不在這一區' % tag); return None
        if not g['ok']:
            n += 1
            await L.go_to(pg, cdp, run, g['tx'], g['tz'], 0.55, '%s：她旁邊（第 %d 輪）' % (tag, n), max_s=100, stop=lambda s, w=g['want']: s['interact'].startswith(w))
            await pg.wait_for_timeout(500)
            g2 = await pg.evaluate("([a,b])=>__CPF.target(a,b)", [who, avoid])
            if g2 and not g2['ok']: run.note('%s：到了以後按鈕是「%s」（要「%s」），離她 %s m、她 %s' % (tag, g2['lab'], g2['want'], g2['d'], g2['beh']))   # BB-C 10-28 priv_event 一個人那段 9 輪都沒說到話：記下來看是她走開了還是按鈕被別的東西搶走
            continue
        tries += 1
        r = await talk(pg, cdp, run, who, rid, tag, pick)
        if r is None: run.note('%s：按了「%s」沒有開始說話，再走近一次' % (tag, g['want'])); continue
        if r['post']['ev'] and r['menu'] is None:
            run.note('%s：先演了事件 %s（不是這次要看的），再說一次' % (tag, J(r['post']['ev'])))
            if redo:   # BB-C 10-28 priv_menu：先演的 ev_an_report_feedback 把以安的聯絡方式加回來＝第二次說話「交換聯絡方式」不出、整個選單沒有（不是 PRIV 的問題）
                r0 = await pg.evaluate(redo); run.setup('【捷徑】先演的事件改了前置，改回來：%s' % J(r0))
            await pg.wait_for_timeout(1500); continue
        return r
    run.note('%s：%d 秒內沒有和她說到話' % (tag, time.time() - t0)); return None


def crowd_of(r):
    """說話那一刻：同伴在 3.2 m 內（說話前看的 withNow）、說話後的選單問 privNow 的答案是「旁邊有人」"""
    if not r: return False
    pm = r['priv_menu'] if r['priv_menu'] is not None else r['post']['priv']
    return bool(r['at_tap']['withNow']) and (not pm or (not pm[-1]['r'] and bool(pm[-1]['w'])))


async def wait_alone(pg, cdp, run, who, rid, until_h, max_s=900):
    """WAIT=1：站著等到同伴離開（那一列的時間過了、她旁邊沒有她的人）"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        await L.phone_away(pg, cdp)
        i = await info(pg, who, rid)
        if i['h'] >= until_h and not i['withNow'] and not i['on']: run.note('等到 %.2f（%d 秒）：%s' % (i['h'], time.time() - t0, J(i['comp']))); return True
        await pg.wait_for_timeout(5000)
    return False


async def mode_menu(pg, cdp, run, save, event=False):
    who, rid, avoid = 'heroine_01', 'c503_4_2', ['yu']; A = 'A3' if event else 'A1'
    st = await base(pg, save, '2025-10-06', 18.02, 'campus'); st.get('contacts', {}).pop(who, None)
    redo = "()=>{ const G=GAME.G, id='heroine_01', had=!!(G.contacts&&G.contacts[id]); if(G.contacts) delete G.contacts[id]; return {had, now:!!INV.hasContact(G,id)}; }"
    run.setup('[前置] 使用者存檔 day 14 → 2025-10-06（星期一，大一上第 6 週）18:01 校園；拿掉以安的聯絡方式（「交換聯絡方式」才會出現）')
    y = None
    if event:
        run.setup('【捷徑】以安熟悉 65／信任 50／自在 45、ROM.start 和以安交往（存檔原本和可昕交往中）＝坦白有別人的前置')
        pr = await setup(pg, cdp, run, st, PREP_A3, who); y = pr and pr.get('y')
        run.check('前置：有可以坦白的對象（MREL.confessAny）', bool(y), J(pr))
    else: await setup(pg, cdp, run, st)
    i0 = await info(pg, who, rid); run.note('開始：%s' % J(i0))
    run.check('前置：c503_4_2 成立、以安和 Alison 都在校園', bool(i0['on'] and i0['her'] and i0['comp'] and i0['comp'][0]['pos']), J(i0))
    await place(pg, cdp, run, who); await run.shot(pg, 'crowd_view')
    r1 = await approach_talk(pg, cdp, run, who, rid, avoid, 'crowd', redo=redo)
    run.check('前置：說話時 Alison 在她 3.2 m 內（選單問 privNow＝旁邊有人）', crowd_of(r1), J(r1 and [r1['at_tap']['withNow'], r1['priv_menu']]))
    m1 = r1 and r1['menu']
    run.check('前置：她本來可以約（INV.canInvite）', bool(r1 and r1['at_tap']['canInv']), J(r1 and r1['at_tap']['canInv']))
    if not event:
        run.check('A1 旁邊有人：選單沒有「約她去…」（整個選單沒出＝也沒有）', bool(r1) and not has(m1, '約她去'), J(m1))
        run.check('A1 旁邊有人：「交換聯絡方式」照常', has(m1, '交換聯絡方式'), J(m1))
    else:
        c1 = await pg.evaluate(CONF_JS, [who, y])
        run.check('A3 旁邊有人：沒有%s' % CONF, not has(m1, CONF), J(m1))
        run.check('A3 旁邊有人：沒有演坦白（YT_CONFESSED 沒記）', not c1['done'], J(c1))
        run.check('A3 擋下來沒有永久錯過（confessAny 還是 %s）' % y, c1['y'] == y, J(c1))
    if WAIT and await wait_alone(pg, cdp, run, who, rid, 18.84): run.note('同一天站著等到 Alison 走了（沒有跳時間）')
    else:
        await jump(pg, cdp, run, '2025-10-06', 18.9, 'campus'); run.setup('【捷徑】同一天跳到 18:54（c503_4_2 18:50 結束，Alison 不在）')
    r0 = await pg.evaluate(redo)
    if r0['had']: run.setup('【捷徑】跳時間以後以安的聯絡方式還在（前一段說話時加的），拿掉＝「交換聯絡方式」才會出現：%s' % J(r0))
    i1 = await info(pg, who, rid); run.note('一個人：%s' % J(i1))
    run.check('前置：她還在校園、旁邊沒有她的人', bool(i1['her']) and not i1['withNow'], J(i1))
    await place(pg, cdp, run, who); await run.shot(pg, 'alone_view')
    r2 = await approach_talk(pg, cdp, run, who, rid, avoid, 'alone', pick=CONF if event else None, redo=redo)
    m2 = r2 and r2['menu']
    run.check('前置：說話時旁邊沒有人（privNow＝true）', bool(r2) and not crowd_of(r2) and not r2['at_tap']['withNow'], J(r2 and [r2['at_tap']['withNow'], r2['priv_menu']]))
    if not event:
        run.check('A1 她一個人：「約她去…」回來', has(m2, '約她去'), J(m2))
        run.check('A1 她一個人：「交換聯絡方式」還在', has(m2, '交換聯絡方式'), J(m2))
    else:
        c2 = await pg.evaluate(CONF_JS, [who, y])
        run.check('A3 她一個人：%s出現' % CONF, has(m2, CONF), J(m2))
        run.check('A3 選了以後照演（YT_CONFESSED[以安][%s] 記下）' % y, bool(r2 and r2['picked'] and r2['picked'].startswith(CONF)) and c2['done'], J([r2 and r2['picked'], c2]))
        await run.shot(pg, 'alone_after')


async def mode_ladder(pg, cdp, run, save, normal=False):
    who, rid, avoid = 'heroine_03', 'c503_6_1', ['npc_huangxh']
    key, ptr, want = ('2025-10-07', 5, 'Y-L6') if normal else ('2025-10-09', 6, 'Y-L7')
    st = await base(pg, save, key, 12.1, 'campus')
    run.setup('[前置] 使用者存檔 day 14 → %s 12:06 校園（c503_6_1 語彤×筱涵 12:00～13:00）' % key)
    run.setup('【捷徑】語彤熟悉 ≥30、閒聊階梯指標＝%d（%s）、今天還沒走過階梯' % (ptr, want))
    pr = await setup(pg, cdp, run, st, PREP_LAD, [who, ptr])
    step = await pg.evaluate(LADSTEP_JS, [who, ptr]); priv_line = (step and step['lines'] and step['lines'][0]) or '（找不到 %s）' % want
    run.check('前置：階梯下一層是 %s、她到「有點熟」以上' % want, bool(pr and pr.get('step') == want and pr.get('famOk')), J([pr, step]))
    i0 = await info(pg, who, rid); run.note('開始：%s' % J(i0))
    run.check('前置：c503_6_1 成立、語彤和筱涵都在校園', bool(i0['on'] and i0['her'] and i0['comp'] and i0['comp'][0]['pos']), J(i0))
    await place(pg, cdp, run, who); await run.shot(pg, 'crowd_view')
    r1 = await approach_talk(pg, cdp, run, who, rid, avoid, 'crowd')
    run.check('前置：說話時筱涵在她 3.2 m 內', bool(r1) and bool(r1['at_tap']['withNow']), J(r1 and r1['at_tap']['withNow']))
    said1 = bool(r1) and any(priv_line[:10] in t for t in r1['lines'])
    held1 = [h for h in (r1['post']['held'] if r1 else []) if h.get('id') == who]
    if normal:
        run.check('A4 旁邊有人：一般那一層（Y-L6「%s」）照演' % priv_line, said1, J(r1 and r1['lines']))
        run.check('A4 階梯照常前進（%d → %d）' % (ptr, ptr + 1), bool(r1) and r1['post']['lad'] == ptr + 1, J(r1 and [r1['pre']['lad'], r1['post']['lad']]))
        run.check('A4 PRIVTALK 沒有擋語彤', not held1, J(held1))
        r2 = await approach_talk(pg, cdp, run, who, rid, avoid, 'crowd2')
        run.check('A4 同一天再說一次：一般招呼／閒聊照常（有台詞、沒有被擋）', bool(r2) and bool(r2['lines']) and not [h for h in r2['post']['held'] if h.get('id') == who], J(r2 and [r2['lines'], r2['post']['held']]))
        return
    run.check('A2 旁邊有人：Y-L7「%s」沒有出現' % priv_line, bool(r1) and not said1, J(r1 and r1['lines']))
    run.check('A2 旁邊有人：照常閒聊（有說話）', bool(r1) and bool(r1['lines']), J(r1 and r1['lines']))
    run.check('A2 階梯不前進（還是 %d）' % ptr, bool(r1) and r1['post']['lad'] == ptr, J(r1 and [r1['pre']['lad'], r1['post']['lad']]))
    run.check('A2 PRIVTALK 擋下 yt_mom_lad', any(h.get('key') == 'yt_mom_lad' for h in held1), J(r1 and r1['post']['held']))
    await jump(pg, cdp, run, '2025-10-10', 10.0, 'library', keep_pos=False); run.setup('[前置] 隔天 2025-10-10（星期五）10:00 總圖（她 9～12 點一個人看書，筱涵不在）')
    i1 = await info(pg, who, rid); run.note('一個人：%s' % J(i1))
    run.check('前置：她在總圖、旁邊沒有她的人', bool(i1['her']) and not i1['withNow'], J(i1))
    await place(pg, cdp, run, who, 5.0); await run.shot(pg, 'alone_view')
    r2 = await approach_talk(pg, cdp, run, who, rid, avoid, 'alone')
    said2 = bool(r2) and any(priv_line[:10] in t for t in r2['lines'])
    run.check('A2 她一個人：Y-L7「%s」照演' % priv_line, said2, J(r2 and r2['lines']))
    run.check('A2 階梯前進（%d → %d）' % (ptr, ptr + 1), bool(r2) and r2['post']['lad'] == ptr + 1, J(r2 and [r2['pre']['lad'], r2['post']['lad']]))
    run.check('A2 一個人時 PRIVTALK 沒有擋', bool(r2) and not [h for h in r2['post']['held'] if h.get('id') == who], J(r2 and r2['post']['held']))


async def mode_y4(pg, cdp, run, save):
    rows = [x.strip() for x in os.environ.get('ROWS', ','.join(Y4)).split(',') if x.strip()]
    for rid in rows:
        c = Y4[rid]; who = c['who']; T = rid + ' '
        st = await base(pg, save, c['key'], c['h'], c['zone'], y4=True)
        run.setup('[前置] %s：使用者存檔 → %s %.2f %s，EXCHANGE_ROUTE＝TW；【捷徑】%s 熟悉 ≥30、FIRST_MET' % (c['desc'], c['key'], c['h'], c['zone'], who))
        await setup(pg, cdp, run, st, PREP_Y4, who)
        i0 = None
        for k in range(5):   # 同伴是讀進區域以後才排好（HCIRCLE.arrange 每秒一次、模型載入要時間）
            i0 = await info(pg, who, rid)
            if i0['her'] and all(x['pos'] for x in i0['comp']) and (not i0['comp'] or i0['withNow']): break
            await pg.wait_for_timeout(4000)
        run.note(T + '排好：%s' % J(i0))
        if not run.check(T + '前置：那一列成立、她在%s' % c['zone'], bool(i0['on'] and i0['her']), J(i0)): await run.shot(pg, rid + '_missing'); continue
        if i0['comp']:
            run.check(T + '同伴在她 3.2 m 內（HCIRCLE.withNow）', all(x['id'] in i0['withNow'] for x in i0['comp']), J([i0['withNow'], [[x['id'], x.get('dHer')] for x in i0['comp']]]))
            for x in i0['comp']:
                if not x['pos']: run.check(T + '%s 有出現' % x['id'], False); continue
                run.check(T + '%s 站的地方站得住（坐著的不算）' % x['id'], x['pos']['seated'] or x['stand'] is not False, J(x))
                run.check(T + '%s 沒有和她疊在一起（≥0.5 m）' % x['id'], x['dHer'] >= 0.5, J(x['dHer']))
                run.check(T + '%s 沒有和別人疊在一起（≥0.45 m）' % x['id'], x['nearOther'][0] >= 0.45, J(x['nearOther']))
                run.check(T + '%s 沒有擋在出入口（≥1.2 m）' % x['id'], x['nearExit'][0] >= 1.2, J(x['nearExit']))
        else: run.check(T + '一個人的那一列：她站的地方站得住（坐著的不算）', i0['her']['seated'] or i0['her']['stand'] is not False, J(i0['her']))
        await place(pg, cdp, run, who, 8.0); await run.shot(pg, rid + '_view')
        lines = await pg.evaluate(ROWLINES_JS, rid); key0 = (lines[0]['t'].split('{')[0] or lines[0]['t'])[:10] if lines else None
        cap0 = (await pg.evaluate("()=>window.__CP.cap.length"))
        await L.go_to(pg, cdp, run, i0['her']['x'], i0['her']['z'], 3.6, T + '走近她（5 m 內）', max_s=150)
        hd = None; shot_done = False
        for k in range(30):
            hd = await pg.evaluate(HEARD_JS, rid)
            if hd['heard'] == hd['day']:
                if not shot_done: await run.shot(pg, rid + '_heard'); shot_done = True
                if any(key0 and key0 in x['t'] for x in hd['cap']): break
            await pg.wait_for_timeout(500)
        caps = (await pg.evaluate("p=>window.__CP.cap.slice(p)", cap0))
        run.note(T + '這一列：%s；字幕：%s' % (J(lines), J(caps)))
        run.check(T + '走近時聽到（字幕出現「%s…」、heard 記成今天）' % key0, bool(hd and hd['heard'] == hd['day'] and any(key0 and key0 in x['t'] for x in caps)), J(hd))
        r = await approach_talk(pg, cdp, run, who, rid, [x['id'] for x in i0['comp']], rid)
        m = r and r['menu']
        if c['inv']:
            run.check(T + '一個人：說話選單有「約她去…」（對照組）', has(m, '約她去'), J([m, r and r['at_tap']['canInv']]))
        else:
            run.check(T + '前置：說話時同伴在她 3.2 m 內', crowd_of(r), J(r and [r['at_tap']['withNow'], r['priv_menu']]))
            run.check(T + '旁邊有人：沒有「約她去…」（她本來可以約：canInvite＝true）', bool(r) and r['at_tap']['canInv'] and not has(m, '約她去'), J([m, r and r['at_tap']['canInv']]))
        await run.shot(pg, rid + '_end')


async def main():
    URL, OUT = sys.argv[1], sys.argv[2]
    SAVEF = sys.argv[3] if len(sys.argv) > 3 else SP + '/bbtest/p0an/user_day14.json'
    save = json.load(open(SAVEF, encoding='utf-8'))
    run = L.Run('cpp_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        run.note('helpers %s；QUIET=%s WAIT=%s' % (await pg.evaluate(HELPERS), QUIET, WAIT))
        if MODE in ('menu', 'event'): await mode_menu(pg, cdp, run, save, event=(MODE == 'event'))
        elif MODE in ('ladder', 'normal'): await mode_ladder(pg, cdp, run, save, normal=(MODE == 'normal'))
        elif MODE == 'y4': await mode_y4(pg, cdp, run, save)
        else: run.check('MODE 要是 menu／ladder／event／normal／y4', False, MODE)
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())


if __name__ == '__main__':
    asyncio.run(main())
