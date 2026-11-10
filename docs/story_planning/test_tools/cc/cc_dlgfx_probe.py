"""CC（帳號 A）11-10：DLG-FX-MECH-1110 回歸（BB 21:03）。LAWWW 接了「對話選項有效果（fx）」的機制（e8061d998／c8705a16e／44971f8d5／b38fb5537／8e9f4850c），
資料還沒有新欄位（fx、re、opts、dating 階梯）＝行為要和舊版一樣。同一支探針在兩個 SHA 各跑一次：線上 779ddd650（v9.10.24）、開發分支 0160bb208；
同一份存檔、同樣的選擇（選單一律選第一個能選的），輸出 dlgfx_<TAG>.json 給兩版對照（原文、SOCIAL.adjust、關係值）。Playwright（PC GPU）≠ iPhone。

對照的程式（0160bb208；舊版同名函式都在）：
  DATE    src/date3d.js S.menu（出去玩的清單：WISH_LABEL「她說過想去的」排第一）→ S.tick／S.early（出發前 60 分鐘「現在出發」）→ S.scene：S.arriveLine → 互動點選單 → S.spotLine → S.closeLine → S.settle；
          新版 S.playSet 選項 re／fx（S.replyOf、S.optFx）、S.playOpts（opts.first／again／dating；沒有 opts＝和原本一樣）。
  CHAT    src/story3d.js S.talkCharacter → S.ladderTalk → S.ladNext／ladPick（新版多 dating 陣列）→ S.ladPlay（新版：選項 filter、re、fx、整句括號＝旁白只在有 fx／re 時）→ S.offerInvite（「就這樣」）。
  TERMEND src/termend3d.js S.pickCheck 那一行（R.picked＋S.planDinner；＝玩家在手機答應了她的期末飯）→ OUT.prompt「出發：學期末的飯」→ ev_termend_dinner beforeOuting → S.dinner：
          朋友版 open → openByTerm（以安大一上「她點了菜單上最便宜的那一個」）→ talk(3)（話題池＋祐廷的 REPLY；新版：池裡有選項就不自動回、和鉤子一字不差的那一則不說）→ S.hook（選第一個＝接）→ close。
  PHONE   src/phone3d.js mk → PHONE.ON_MK → src/msgreply3d.js MSGR.attach（她分享生活那一則掛三個回覆選項）→ game3d.js 手機「訊息」→ 對話串 → [data-ask] → PHONE.answer → MSGR.onAnswer（rel）；新版多 fx（PHONE.answer 算）。
  FACE    src/story3d.js S.offerInvite「約她去…」→ src/invites3d.js S.flow（分類 → 地點 → 「現在一起過去」→ 同一區＝S.startTogether）→ S.meet → S.meetOpen（walkAsk、SOCIAL.playUp）→ 活動第 N 場（STUDYN.mid 選項）。
CASES（逗號分隔，每個 case 重新讀檔）：DATE,CHAT,TERMEND,PHONE,FACE（預設全部）。
R.check 只檢查：流程走完（沒有 60 秒沒進展）、最後沒有對話框／選單開著、沒有連續重複的句子、沒有 JS 例外、walkFallbacks 0；其他（期望的那一層有沒有演、選項原文）只記在 JSON 和 note。
用法：LW_TESTS=<worktree>/tests SHA=<受測 sha> TAG=new|old [CASES=...] [WHO=heroine_01] python3 cc_dlgfx_probe.py <url> <out>"""
import os, sys, json, asyncio, time, copy
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
SHA = os.environ.get('SHA') or ''
WHO = os.environ.get('WHO') or 'heroine_01'   # DATE、TERMEND、PHONE 的對象（CHAT、FACE 掃得到誰就是誰，CHAT_WHO／FACE_WHO 可以指定順序）
CASES = [c.strip() for c in (os.environ.get('CASES') or 'DATE,CHAT,TERMEND,PHONE,FACE').split(',') if c.strip()]
R = L.Run('dlgfx_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SAVE = os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
STUCK_S = 60
EXITS = ('返回', '算了', '不約', '取消', '先不要', '重新選', '換一天', '下次再說', '就這樣回去', '差不多了')
RESULT = {'tag': TAG, 'sha': SHA, 'url': URL, 'who': WHO, 'cases': {}}

# 只包一次（GAME.__hooked）：GAME.say／caption／choose（選項原文＋選了第幾個）、SOCIAL.adjust（實際的差值）、SOCIAL.applyFx（新版才有；fx 是 null 不記＝資料沒寫 fx 時兩版一樣）
HOOK_JS = r"""(()=>{ window.__DL=window.__DL||[]; window.__ADJ=window.__ADJ||[]; if(GAME.__hooked) return 'already'; GAME.__hooked=1;
  const P=(k,v)=>{ try{ window.__DL.push({k, v, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone, d:GAME.G.day}); }catch(e){} };
  const s0=GAME.say; if(typeof s0==='function') GAME.say=function(a,b){ P('say', ((a&&a.name)||(typeof a==='string'?a:''))+'｜'+String(b==null?'':b)); return s0.apply(this,arguments); };
  const c0=GAME.caption; if(typeof c0==='function') GAME.caption=function(a,b){ P('cap', (a?a+'｜':'')+String(b==null?'':b)); return c0.apply(this,arguments); };
  const h0=GAME.choose; if(typeof h0==='function') GAME.choose=function(o){ let t=[]; try{ t=(o||[]).map(x=>x&&x.t); }catch(e){} P('choose', t); const r=h0.apply(this,arguments); try{ if(r&&typeof r.then==='function') r.then(k=>P('pick',k)); }catch(e){} return r; };
  if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ const a0=SOCIAL.adjust; SOCIAL.adjust=function(id,d){ try{ window.__ADJ.push({id, d:JSON.parse(JSON.stringify(d||{})), n:window.__DL.length, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}); }catch(e){} return a0.apply(this,arguments); }; }
  if(typeof SOCIAL!=='undefined'&&SOCIAL.applyFx){ const f0=SOCIAL.applyFx; SOCIAL.applyFx=function(G,id,fx){ const r=f0.apply(this,arguments); try{ if(fx!=null) window.__ADJ.push({fx:JSON.parse(JSON.stringify(fx)), id, ret:r, n:window.__DL.length}); }catch(e){} return r; }; }
  return 'hooked'; })()"""
RESET_JS = "(()=>{ window.__DL=[]; window.__ADJ=[]; return true; })()"
LOG_JS = "(()=>({dl:window.__DL||[], adj:window.__ADJ||[]}))()"
REL_JS = "(w=>{ const r=SOCIAL.rel(w)||{}; return {fam:r.fam, trust:r.trust, comf:r.comf, npcRom:r.npcRom, rom:r.rom}; })"
SNAP_JS = "(()=>JSON.parse(JSON.stringify(GAME.G)))()"
WD_JS = "(d=>CALENDAR.dateOf(d).wd%7)"
CH_AT = "(k=>{ const b=[...document.querySelectorAll('#choices button')]; const e=b[k]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })"
PHONE_OPEN_JS = "(()=>{ const e=document.getElementById('phone'); return !!e&&!e.classList.contains('hide'); })()"
NPC_JS = r"""(id=>{ const E=GAME.E, AL={heroine_01:'an',heroine_05:'sis',zhe:'zhe',yu:'yu',kai:'kai'};
  let n=(E.npcs||[]).find(q=>q&&q.charId===id&&q.talk&&!q.hidden&&q.obj)||null; if(!n&&GAME.npc&&GAME.npc[id]&&GAME.npc[id].talk) n=GAME.npc[id];
  if(!n&&GAME.npc&&AL[id]&&GAME.npc[AL[id]]&&GAME.npc[AL[id]].talk) n=GAME.npc[AL[id]]; if(!n||!n.obj) return null; const p=n.obj.position;
  return {x:+p.x.toFixed(2), z:+p.z.toFixed(2), lv:n.lv|0, label:n.talkLabel||null, name:n.name||'', seat:!!n.seat}; })"""

# CHAT：在存檔那一週起 14 天裡掃「她在 3D 某一區、閒聊階梯下一層（有選項的）在那裡播得出來」的時段（只算，掃完把日期、區域、階梯進度放回去）
SCAN_CHAT_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}, so=G.social||(G.social={}); so.ladder=so.ladder||{}; so.ladderDay=so.ladderDay||{};
  const snap=JSON.stringify({l:so.ladder, d:so.ladderDay, s:so.ladSeen||null}); const back=()=>{ const S0=JSON.parse(snap); so.ladder=S0.l; so.ladderDay=S0.d; if(S0.s) so.ladSeen=S0.s; else delete so.ladSeen; };
  const hasCh=st=>!!st&&Array.isArray(st.choices)&&st.choices.some(c=>c&&typeof c.t==='string'&&c.t.trim());
  try{ for(let d=a.d0; d<a.d0+a.days; d++){ for(const hr of a.hours){ for(const id of a.ids){
        G.day=d; G.hour=hr; G.weekday=CALENDAR.dateOf(d).wd%7; G.zone=keep.zone; back(); const Dd=STORY.ladData(G,id); if(!Dd) continue; const steps=Dd.L.steps||[], K=Dd.key, k0=(so.ladder[K])|0;
        let w=null; try{ w=STORY.whereIs(GAME,id); }catch(e){} if(!w||!w.zone||w.away) continue; if(w.zone==='classroom'||/上課|上班/.test(w.act||'')) continue;
        const cand=[]; for(let k=k0;k<steps.length&&cand.length<a.maxStep;k++) if(hasCh(steps[k])) cand.push(k);
        for(const k of cand){ G.hour=hr; G.zone=w.zone; back(); so.ladder[K]=k; delete so.ladderDay[id]; let nx=null; try{ nx=STORY.ladNext(G,id); }catch(e){} if(!nx||nx.id!==steps[k].id) continue;
          G.hour=hr+0.5; let w2=null; try{ w2=STORY.whereIs(GAME,id); }catch(e){} if(!w2||w2.zone!==w.zone) continue;
          return {id, key:K, k, k0, step:steps[k].id, choices:steps[k].choices.map(c=>c.t), d, wd:CALENDAR.dateOf(d).wd%7, dkey:CALENDAR.dateOf(d).key, hr, zone:w.zone, act:w.act||''}; } } } } }
  finally{ Object.assign(G,keep); back(); }
  return null; })"""

# FACE：她在 3D 某一區、那一區就有一個能約的地點（不帶路、不是固定時間的、「現在一起過去」可以選、INV.decide 答應）
SCAN_FACE_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone};
  const PLS=(typeof INVITE_DATA!=='undefined'&&INVITE_DATA.places)||[]; const verbOf=(Q,c)=>String((c==='study'&&Q.verbStudy?Q.verbStudy:Q.verb)||'');
  try{ for(let d=a.d0; d<a.d0+a.days; d++){ for(const hr of a.hours){ for(const id of a.ids){
        G.day=d; G.hour=hr; G.weekday=CALENDAR.dateOf(d).wd%7; G.zone=keep.zone; let w=null; try{ w=STORY.whereIs(GAME,id); }catch(e){} if(!w||!w.zone||w.away) continue; if(w.zone==='classroom'||/上課|上班/.test(w.act||'')) continue;
        G.zone=w.zone; if(!INV.canInvite(G,id)) continue; if((G.invites||[]).some(v=>v.who===id&&(v.state==='going'||v.state==='accepted'))) continue;
        const PL=PLS.filter(Q=>!Q.show||Q.show(G,id)).filter(Q=>!(INV.neverAt&&INV.neverAt(id,Q)));
        for(const P of PL){ const same=P.zone===w.zone||(P.zone==='library_hall'&&w.zone==='library'); if(!same) continue; if((P.sitAt&&P.sitAt.lead)||P.when||P.times||P.timesBy) continue;
          let why=null; try{ why=INV.placeWhy(G,id,P); }catch(e){ why='ERR'; } if(why) continue; const cats=INV.catsOf(P).filter(c=>c!=='when'); if(!cats.length) continue; const cat=cats[0], vt=verbOf(P,cat); if(!vt) continue;
          const items=PL.filter(Q=>INV.catsOf(Q).includes(cat)); if(items.some(Q=>Q!==P&&verbOf(Q,cat).startsWith(vt))) continue;
          let T=[]; try{ T=INV.timeOptions(G,true,P,id); }catch(e){} if(!T.some(q=>q.now&&!q.dim)) continue;
          let r=null; try{ r=INV.decide(G,id,P.id,G.day,G.hour); }catch(e){} if(!r||!(r.res==='accept'||r.res==='here')) continue;
          G.hour=hr+0.5; let w2=null; try{ w2=STORY.whereIs(GAME,id); }catch(e){} G.hour=hr; if(!w2||w2.zone!==w.zone) continue;
          const C=(INV.CATS||[]).find(x=>x.id===cat)||{}; return {id, place:P.id, pname:P.name, cat, catT:C.t||'', leafT:vt, nInCat:items.length, d, wd:CALENDAR.dateOf(d).wd%7, dkey:CALENDAR.dateOf(d).key, hr, zone:w.zone, act:w.act||''}; } } } } }
  finally{ Object.assign(G,keep); }
  return null; })"""
DATE_AVOID_JS = r"""(w=>{ const G=GAME.G, out=[]; try{ out.push(DATE.WISH_LABEL||'她說過想去的'); const wk=DATE.wishOf(w); if(wk&&DATE.loc(wk)) out.push(DATE.loc(wk).name);
    const by=(DATE.log(G,w)||{}).byLoc||{}; for(const k in by) if((by[k]|0)>0&&DATE.loc(k)) out.push(DATE.loc(k).name); }catch(e){ out.push('ERR '+e); } return out; })"""
TRIP_JS = "(w=>{ const L=(GAME.G.trips||[]).filter(t=>t.who===w); const t=L[L.length-1]; return t?{trip:t.trip, day:t.day, depart:t.depart, back:t.back, status:t.status, locs:t.locs, kind:t.kind||null, spots:t.spots||null}:null; })"
TE_PLAN_JS = r"""(a=>{ const G=GAME.G, w=TERMEND.windowOf(a.term); if(!w) return {err:'沒有 '+a.term+' 的期末時段'}; const R=TERMEND.rec(G,a.term); const had=R.picked?JSON.parse(JSON.stringify(R.picked)):null;
  R.picked={who:a.who,kind:'friend',day:G.day}; const ok=TERMEND.planDinner(G,w,a.who,'friend'); const q=OUT.rec(G).find(x=>x.te&&x.te.who===a.who&&x.state==='planned')||null;
  let open=null; try{ const f=TERMEND_LINES.FRIEND[a.who]; let x=f&&f.openByTerm&&f.openByTerm[a.term]; if(typeof x==='function') x=x(G); open=x==null?null:x; }catch(e){}
  return {ok, had, w, q:q?{id:q.id, day:q.day, h:q.h, travelH:q.travelH, title:q.title, place:q.place}:null, open}; })"""
OUTQ_JS = "(id=>{ const q=(typeof OUT!=='undefined'&&OUT.get)?OUT.get(GAME.G,id):null; return q?{state:q.state, day:q.day, h:q.h}:null; })"
MSG_ENTRY_JS = r"""(a=>{ const L=((typeof MSG_REPLIES!=='undefined'&&MSG_REPLIES.people)||{})[a.who]||[]; const e=L[a.i]; if(!e) return null;
  return {i:a.i, text:e.text, thread:(e.new&&e.new.thread)||[], opts:(e.opts||[]).map(o=>({t:o.t, say:o.say||[], rel:o.rel||null, fx:o.fx||null})), n:L.length}; })"""
PHONE_SEND_JS = r"""(a=>{ const G=GAME.G; const items=a.thread.concat([a.text]).map(t=>({th:'p:'+a.who, from:a.who, text:t})); const thOf=m=>m.th||(m.who?'p:'+m.who:'sys'); const n0=(G.msgs||[]).filter(m=>thOf(m)==='p:'+a.who).length;
  const ok=PHONE.at(G,G.day,G.hour,items,a.tag); return {ok, n0}; })"""
PHONE_GOT_JS = r"""(a=>{ const G=GAME.G; const m=(G.msgs||[]).find(x=>x.tag===a.tag&&x.text===a.text); if(!m) return null; return {ask:m.ask?{id:m.ask.id, opts:(m.ask.opts||[]).map(o=>o.t)}:null, ans:m.ans==null?null:m.ans}; })"""
PHONE_THREAD_JS = r"""(a=>((GAME.G.msgs||[]).filter(m=>(m.th||(m.who?'p:'+m.who:'sys'))==='p:'+a.who).slice(a.n0).map(m=>({from:m.from||m.who||'', text:String(m.text==null?'':m.text), day:m.day, h:m.h}))))"""
INVS_JS = "(w=>(GAME.G.invites||[]).filter(v=>v.who===w).map(v=>({id:v.id, state:v.state, place:v.place, day:v.day, h:v.h})))"
ADV_JS = "(()=>!!(typeof ADV!=='undefined'&&ADV.active))()"


def first_ok(o):
    for i, x in enumerate(o):
        if not x['dim']: return i
    return 0


def starts(o, word, ok_dim=False):
    for i, x in enumerate(o):
        if x['t'].startswith(word) and (ok_dim or not x['dim']): return i
    return None


def base_state():
    s = json.load(open(SAVE, encoding='utf-8')); s = dict(s.get('G', s))
    return s


async def load(pg, cdp, st, tag, why, settle=True):
    """讀檔。settle＝先把讀檔以後自己跳出來的劇情點完、再開始記（不算這一項）；jump 用 settle=False：讀進來馬上開始記
    （期末飯讀進來就到出發時間，「出發」選單會在 pe.settle 裡被點掉、整頓飯在記錄開始以前就演完）"""
    await L.load_state(pg, st, quiet_phone=True)
    pre = []
    if settle:
        await pg.wait_for_timeout(3500); await pe.settle(pg, cdp, pre, 30)
        if pre: R.note('%s 讀檔以後先有的劇情（照 pe.settle 點完，不算這一項）：%s' % (tag, J(pre[-6:])))
        await pg.evaluate(HOOK_JS); await pg.evaluate(RESET_JS)
    else:
        await pg.evaluate(HOOK_JS); await pg.evaluate(RESET_JS); await pg.wait_for_timeout(1500)
    R.setup('%s %s' % (tag, why))
    return pre


async def jump(pg, cdp, tag, day, hour, why):
    """【捷徑】把現在的 G（含剛約好的行程）原封不動、只改日期時間，用遊戲的讀檔重讀"""
    s = await pg.evaluate(SNAP_JS); s = dict(s.get('G', s)) if isinstance(s, dict) else s
    s['day'] = day; s['hour'] = hour
    try: s['weekday'] = await pg.evaluate(WD_JS, day)
    except Exception: pass
    return await load(pg, cdp, s, tag, '【捷徑】%s：日期改到第 %d 天、%.3f 點（G 其他欄位不動）' % (why, day, hour), settle=False)


async def tap_choice(pg, cdp, k):
    c = await pg.evaluate(CH_AT, k)
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); return True


async def drive(pg, cdp, tag, who, pick, done, max_s=600):
    """一路點：對話框按 #dlg、選單照 pick；STUCK_S 秒「對話字、選單、區域、紀錄句數、忙碌」都沒有變＝卡住。done() 連續三次成立（而且沒有對話框、選單、忙碌）＝走完"""
    t0 = time.time(); last = time.time(); sig = None; idle = 0; picks = []; stuck = False; fin = False
    while time.time() - t0 < max_s:
        if await pg.evaluate(PHONE_OPEN_JS): await pe.close_phone(pg, cdp)
        q = await L.state(pg); n = await pg.evaluate("(window.__DL||[]).length")
        s = (q['dtext'], q['choices'], q['zone'], n, q['busy'], q['dlg'])
        if s != sig: sig = s; last = time.time()
        elif time.time() - last > STUCK_S:
            stuck = True; R.note('%s %d 秒沒有進展：%s' % (tag, STUCK_S, J(q))); break
        if q['choices']:
            o = await pe.opts(pg); k = pick(o)
            rb = await pg.evaluate(REL_JS, who) if who else None
            picks.append({'opts': [x['t'] for x in o], 'dim': [x['dim'] for x in o], 'pick': k, 'n': n, 'rel_before': rb})
            if not await tap_choice(pg, cdp, k): await pg.wait_for_timeout(500)
            idle = 0; continue
        if q['dlg']:
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); idle = 0; continue
        if not q['busy'] and await done(): idle += 1
        else: idle = 0
        if idle >= 3: fin = True; break
        await pg.wait_for_timeout(500)
    return {'stuck': stuck, 'done': fin, 'secs': round(time.time() - t0, 1), 'picks': picks}


async def walk_to_npc(pg, cdp, tag, who):
    for k in range(4):
        n = await pg.evaluate(NPC_JS, who)
        if not n:
            await pg.wait_for_timeout(1500); continue
        await L.go_to(pg, cdp, R, n['x'], n['z'], 0.9 if k < 2 else 0.6, '%s 走到 %s 旁邊（第 %d 次）' % (tag, n['name'] or who, k + 1), max_s=120, lv=n['lv'])
        await pg.wait_for_timeout(700); s = await L.state(pg); lab = s['interact']
        if lab and ('說話' in lab or '打招呼' in lab) and (not n['name'] or n['name'][:2] in lab or (n['label'] and lab.startswith(n['label'][:4]))):
            return {'npc': n, 'label': lab}
        R.note('%s 互動鍵是「%s」（她 %s），再靠近' % (tag, lab, J(n)))
    return None


async def talk_start(pg, cdp, tag):
    await L.tap(pg, cdp, '#interact')
    for _ in range(16):
        q = await L.state(pg)
        if q['dlg'] or q['choices'] or q['busy']: return True
        await pg.wait_for_timeout(500)
    return False


async def finish(pg, cdp, case, who, res, dr, errs, e0, fb0):
    log = await pg.evaluate(LOG_JS); q = await L.state(pg)
    res['lines'] = res.get('lines_pre', []) + log['dl']; res.pop('lines_pre', None)
    res['adj'] = log['adj']; res['rel_after'] = await pg.evaluate(REL_JS, who) if who else None
    res['drive'] = dr; res['end'] = {k: q[k] for k in ('zone', 'dlg', 'choices', 'busy', 'hour', 'dtext')}
    res['adv_active'] = await pg.evaluate(ADV_JS)
    res['errs'] = errs[e0:]; fb = await pg.evaluate("GAME.walkFallbacks|0"); res['walkFallbacks'] = [fb0, fb]
    seq = [e['v'] for e in res['lines'] if e.get('k') in ('say', 'cap', 'msg')]
    dups = [[i, seq[i]] for i in range(1, len(seq)) if seq[i] == seq[i - 1] and str(seq[i]).split('｜', 1)[-1].strip()]
    res['dups'] = dups
    try: await pg.screenshot(path=os.path.join(OUT, 'dlgfx_%s_%s.jpg' % (TAG, case)), type='jpeg', quality=70)
    except Exception: pass
    t = '[%s]' % case
    R.note('%s 原文 %d 句、選單 %d 個、SOCIAL.adjust %d 筆；關係 %s → %s；選的：%s' % (t, len(seq), len(dr['picks']) if dr else 0, len(res['adj']), J(res.get('rel_before')), J(res['rel_after']), J([[p['opts'][p['pick']] if p['opts'] else None] for p in (dr or {}).get('picks', [])])))
    R.check('%s 流程走完（沒有 %d 秒沒進展、沒有逾時）' % (t, STUCK_S), bool(dr) and dr['done'] and not dr['stuck'], J(dr and {k: dr[k] for k in ('stuck', 'done', 'secs')}))
    R.check('%s 最後沒有對話框、選單開著' % t, not q['dlg'] and not q['choices'], J(res['end']))
    R.check('%s 沒有連續重複的句子（同一句連續兩次）' % t, not dups, J(dups[:4]))
    R.check('%s 沒有 JS 例外' % t, not res['errs'], J(res['errs'][:3]))
    R.check('%s walkFallbacks 0（這一項 %d → %d）' % (t, fb0, fb), fb == fb0, '')
    RESULT['cases'][case] = res
    open(os.path.join(OUT, 'dlgfx_%s.json' % TAG), 'w', encoding='utf-8').write(J(RESULT))


# ---------------- DATE：校外約會一次（first：這個地點第一次和她去）----------------
async def case_date(pg, cdp, errs):
    tag = '[DATE]'; who = WHO; e0 = len(errs); fb0 = await pg.evaluate("GAME.walkFallbacks|0")
    st = base_state(); st['hour'] = 10.0; st['invites'] = []
    soc = copy.deepcopy(st.get('social') or {}); r = soc.setdefault('rel', {}).setdefault(who, {}); r0 = r.get('npcRom', 0); r['npcRom'] = max(r0 or 0, 15); st['social'] = soc
    f = dict(st.get('flags') or {}); f.pop('dating_' + who, None); v6 = copy.deepcopy(f.get('V6EX') or {})
    if v6.get('cool'): v6['cool'].pop(who, None)
    f['V6EX'] = v6; st['flags'] = f
    res = {'who': who, 'setup': ['day46 10:00、清邀約；%s 的戀愛 npcRom %s → %s（出去玩的門檻 15，同 cc_outing_gate R15）；拿掉 dating_%s、冷淡期' % (who, r0, r['npcRom'], who)]}
    await load(pg, cdp, st, tag, res['setup'][0])
    res['rel_before'] = await pg.evaluate(REL_JS, who)
    avoid = await pg.evaluate(DATE_AVOID_JS, who); res['avoid'] = avoid
    R.note('%s 不選的（心願那一類／心願地點／去過的地點＝不是 first）：%s' % (tag, J(avoid)))
    await pe.phone(pg, cdp, 'friends')
    if not R.check('%s 手機「朋友」有 %s' % (tag, who), await pe.tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % who), ''):
        await pe.close_phone(pg, cdp); return await finish(pg, cdp, 'DATE', who, res, None, errs, e0, fb0)
    await pg.wait_for_timeout(1500)
    top = await pe.opts(pg); k = starts(top, '出去玩')
    if not R.check('%s 「出去玩…」可以選' % tag, k is not None, J(top)):
        await pe.close_phone(pg, cdp); return await finish(pg, cdp, 'DATE', who, res, None, errs, e0, fb0)
    await tap_choice(pg, cdp, k); booked = []
    for _ in range(10):
        o = await pe.opts(pg)
        if not o: break
        cand = [i for i, x in enumerate(o) if not x['dim'] and not x['t'].startswith(EXITS) and not any(a and x['t'].startswith(a) for a in avoid)]
        cand = [i for i in cand if '開車' not in o[i]['t']] or cand   # 開車＝「現在出發」以後要自己走到望月台停車場按「開車出發」（date3d.js S.toCar、carlot3d.js CARLOT.need），這一項不測那一段
        pref = [i for i in cand if o[i]['t'].startswith('就這樣約')] or [i for i in cand if o[i]['t'].startswith('今天')] or cand
        if not pref: R.note('%s 約的選單沒有能選的：%s' % (tag, J(o))); break
        booked.append(o[pref[0]]['t']); await tap_choice(pg, cdp, pref[0])
    lg = []; await pe.settle(pg, cdp, lg, 30)
    trip = await pg.evaluate(TRIP_JS, who); res['book'] = {'picked': booked, 'reply': lg[-8:], 'trip': trip}
    R.note('%s 約的一路選了：%s；約好：%s' % (tag, J(booked), J(trip)))
    await pe.close_phone(pg, cdp)
    if not R.check('%s 約成了（G.trips 有一筆 booked）' % tag, bool(trip) and trip['status'] == 'booked', J(trip)):
        return await finish(pg, cdp, 'DATE', who, res, None, errs, e0, fb0)
    res['lines_pre'] = (await pg.evaluate(LOG_JS))['dl']   # 約的那一段（她答應的句子）也存
    await jump(pg, cdp, tag, trip['day'], trip['depart'] - 61 / 60, '出發前 61 分鐘（提醒 60 分鐘前跳「現在出發」）')
    res['setup'].append('【捷徑】日期時間改到約好的出發前 61 分鐘（第 %d 天 %.3f）' % (trip['day'], trip['depart'] - 61 / 60))

    def pick(o):
        for w in ('現在出發', '出發'):
            i = starts(o, w)
            if i is not None: return i
        return first_ok(o)

    async def done():
        t = await pg.evaluate(TRIP_JS, who)
        return bool(t) and t['status'] not in ('booked', 'going')
    dr = await drive(pg, cdp, tag, who, pick, done, max_s=720)
    res['trip_end'] = await pg.evaluate(TRIP_JS, who)
    R.note('%s 行程結束：%s' % (tag, J(res['trip_end'])))
    await finish(pg, cdp, 'DATE', who, res, dr, errs, e0, fb0)


# ---------------- CHAT：閒聊階梯一次（有選項的那一層）----------------
async def case_chat(pg, cdp, errs):
    tag = '[CHAT]'; e0 = len(errs); fb0 = await pg.evaluate("GAME.walkFallbacks|0")
    st = base_state(); st['hour'] = 10.0; st['invites'] = []
    await load(pg, cdp, st, tag, 'day46 10:00、清邀約（掃時段用）')
    ids = [x for x in (os.environ.get('CHAT_WHO') or 'heroine_01,heroine_03,heroine_05,heroine_02,classmate_peishan,heroine_04').split(',') if x]
    slot = await pg.evaluate(SCAN_CHAT_JS, {'ids': ids, 'd0': st['day'], 'days': 14, 'hours': [10, 11, 13, 14, 15, 16, 17, 19, 20], 'maxStep': 3})
    res = {'who': slot and slot['id'], 'slot': slot, 'setup': []}
    R.note('%s 掃到的時段：%s' % (tag, J(slot)))
    if not R.check('%s 前置：14 天內找得到她在 3D、下一層有選項的時段' % tag, bool(slot), ''):
        return await finish(pg, cdp, 'CHAT', None, res, None, errs, e0, fb0)
    who = slot['id']; st2 = base_state(); st2.update({'day': slot['d'], 'hour': slot['hr'] + 0.05, 'weekday': slot['wd'], 'zone': slot['zone'], 'pos': None, 'invites': []})
    soc = copy.deepcopy(st2.get('social') or {}); soc.setdefault('ladder', {})[slot['key']] = slot['k']; ld = dict(soc.get('ladderDay') or {}); ld.pop(who, None); soc['ladderDay'] = ld; st2['social'] = soc
    why = '日期 %s（第 %d 天）%.2f 點、區域 %s（她的作息：%s）；閒聊階梯 %s 進度 %d → %d（下一層 %s，有選項 %s）、拿掉今天已經聊過的記號' % (slot['dkey'], slot['d'], slot['hr'] + 0.05, slot['zone'], slot['act'], slot['key'], slot['k0'], slot['k'], slot['step'], J(slot['choices']))
    res['setup'].append(why); await load(pg, cdp, st2, tag, why)
    res['rel_before'] = await pg.evaluate(REL_JS, who)
    w = await walk_to_npc(pg, cdp, tag, who)
    if not R.check('%s 走到她旁邊、互動鍵是和她說話' % tag, bool(w), J(await pg.evaluate(NPC_JS, who))):
        return await finish(pg, cdp, 'CHAT', who, res, None, errs, e0, fb0)
    res['label'] = w['label']
    if not R.check('%s 按「%s」開始說話' % (tag, w['label']), await talk_start(pg, cdp, tag), ''):
        return await finish(pg, cdp, 'CHAT', who, res, None, errs, e0, fb0)

    def pick(o):
        i = starts(o, '就這樣')   # 說完以後的選單（約她去…／交換聯絡方式／就這樣）：不往下約
        return i if i is not None else first_ok(o)

    async def done():
        q = await L.state(pg); return not q['dlg'] and not q['choices']
    dr = await drive(pg, cdp, tag, who, pick, done, max_s=300)
    lg = await pg.evaluate(LOG_JS)
    played = any(e['k'] == 'choose' and isinstance(e['v'], list) and slot['choices'] and slot['choices'][0] in e['v'] for e in lg['dl'])
    res['step_played'] = played; res['ladder_after'] = await pg.evaluate("(k=>((GAME.G.social||{}).ladder||{})[k])", slot['key'])
    R.note('%s 期望的那一層 %s 有演（選單裡有「%s」）：%s；階梯進度之後 %s' % (tag, slot['step'], slot['choices'][0], played, res['ladder_after']))
    await finish(pg, cdp, 'CHAT', who, res, dr, errs, e0, fb0)


# ---------------- TERMEND：期末飯一次（朋友版）----------------
async def case_termend(pg, cdp, errs):
    tag = '[TERMEND]'; who = os.environ.get('TE_WHO') or WHO; term = 'Y1S1'; e0 = len(errs); fb0 = await pg.evaluate("GAME.walkFallbacks|0")
    w = await pg.evaluate("(t=>TERMEND.windowOf(t))", term)
    res = {'who': who, 'term': term, 'window': w, 'setup': []}
    if not R.check('%s 前置：有 %s 的期末時段' % (tag, term), bool(w), J(w)):
        return await finish(pg, cdp, 'TERMEND', who, res, None, errs, e0, fb0)
    st = base_state(); st.update({'day': w['from'], 'hour': 12.0, 'invites': []})
    try: st['weekday'] = await pg.evaluate(WD_JS, w['from'])
    except Exception: pass
    why = '日期改到 %s 期末時段第一天（第 %d 天）12:00（day46 存檔其他欄位不變）' % (term, w['from'])
    res['setup'].append(why); await load(pg, cdp, st, tag, why)
    pl = await pg.evaluate(TE_PLAN_JS, {'term': term, 'who': who}); res['plan'] = pl
    R.setup('%s【捷徑】TERMEND.rec(%s).picked＝{%s, friend}＋TERMEND.planDinner（＝termend3d.js S.pickCheck 那一行：玩家在手機答應了她的期末飯）：%s' % (tag, term, who, J(pl)))
    res['setup'].append('【捷徑】R.picked＋planDinner（S.pickCheck 的做法）')
    if not R.check('%s 排好了期末飯（OUT 有一筆 planned）' % tag, bool(pl) and bool(pl.get('q')), J(pl)):
        return await finish(pg, cdp, 'TERMEND', who, res, None, errs, e0, fb0)
    q = pl['q']
    await jump(pg, cdp, tag, q['day'], q['h'] - 0.4, '期末飯前 24 分鐘（OUT.due：開始前 travelH＋15 分鐘起跳「出發」）')
    res['setup'].append('【捷徑】日期時間改到期末飯（第 %d 天 %.2f）前 0.4 小時' % (q['day'], q['h']))
    res['rel_before'] = await pg.evaluate(REL_JS, who)

    def pick(o):
        return first_ok(o)   # 「出發：學期末的飯…」是第一個；飯桌上的選項、鉤子（接／不接）都選第一個

    async def done():
        s = await pg.evaluate(OUTQ_JS, q['id']); return bool(s) and s['state'] != 'planned' and not await pg.evaluate(ADV_JS)
    dr = await drive(pg, cdp, tag, who, pick, done, max_s=600)
    res['out_end'] = await pg.evaluate(OUTQ_JS, q['id'])
    lg = await pg.evaluate(LOG_JS)
    says = [e['v'] for e in lg['dl'] if e['k'] == 'say']
    op = pl.get('open'); ops = [x for x in ([op] if isinstance(op, str) else (op or [])) if isinstance(x, str)]
    res['table_line'] = {'expect_openByTerm': op, 'said': [s for s in says if any(x and x[:10] in s for x in ops)]}
    R.note('%s 飯桌那一句（FRIEND.openByTerm.%s）期望 %s；實際 %s；出遊結束 %s' % (tag, term, J(op), J(res['table_line']['said']), J(res['out_end'])))
    await finish(pg, cdp, 'TERMEND', who, res, dr, errs, e0, fb0)


# ---------------- PHONE：她傳一則（可以回的）訊息，選第一個回覆 ----------------
async def case_phone(pg, cdp, errs):
    tag = '[PHONE]'; who = WHO; e0 = len(errs); fb0 = await pg.evaluate("GAME.walkFallbacks|0"); i = int(os.environ.get('PHONE_I') or 0)
    st = base_state(); st['hour'] = 10.0; st['invites'] = []
    res = {'who': who, 'setup': ['day46 10:00、清邀約']}
    await load(pg, cdp, st, tag, res['setup'][0])
    res['rel_before'] = await pg.evaluate(REL_JS, who)
    ent = await pg.evaluate(MSG_ENTRY_JS, {'who': who, 'i': i}); res['entry'] = ent
    if not R.check('%s 前置：MSG_REPLIES 有 %s 第 %d 則' % (tag, who, i), bool(ent), ''):
        return await finish(pg, cdp, 'PHONE', who, res, None, errs, e0, fb0)
    tg = 'cc_dlgfx_phone_%s_%d' % (who, i)
    sent = await pg.evaluate(PHONE_SEND_JS, {'who': who, 'text': ent['text'], 'thread': ent['thread'], 'tag': tg})
    R.setup('%s【捷徑】PHONE.at 現在送她一則（msg_replies.js 第 %d 則逐字＝MSGR.attach 會掛選項）：%s' % (tag, i, J(ent['thread'] + [ent['text']])))
    res['setup'].append('【捷徑】PHONE.at 排她的訊息（msg_replies 第 %d 則）' % i)
    got = None
    for _ in range(40):
        got = await pg.evaluate(PHONE_GOT_JS, {'tag': tg, 'text': ent['text']})
        if got: break
        await pg.wait_for_timeout(500)
    res['got'] = got
    if not R.check('%s 訊息送到、掛上回覆選項（ask）' % tag, bool(got) and bool(got.get('ask')), J(got)):
        return await finish(pg, cdp, 'PHONE', who, res, None, errs, e0, fb0)
    t0 = time.time()
    await pe.phone(pg, cdp, 'msg')
    okth = await pe.tap_sel(pg, cdp, '#phoneBody [data-th="p:%s"]' % who); await pg.wait_for_timeout(1200)
    btns = await pg.evaluate("(id=>[...document.querySelectorAll('#phoneBody [data-ask]')].filter(b=>b.dataset.ask.startsWith(id+'|')).map(b=>({ask:b.dataset.ask, t:(b.textContent||'').trim(), dis:!!b.disabled})))", got['ask']['id'])
    res['buttons'] = btns
    R.note('%s 對話串打開 %s；回覆按鈕：%s' % (tag, okth, J(btns)))
    ok = bool(btns) and await pe.tap_sel(pg, cdp, '#phoneBody [data-ask="%s|0"]' % got['ask']['id'])
    await pg.wait_for_timeout(2000)
    after = await pg.evaluate(PHONE_GOT_JS, {'tag': tg, 'text': ent['text']})
    th = await pg.evaluate(PHONE_THREAD_JS, {'who': who, 'n0': sent.get('n0') or 0})
    res['answered'] = after; res['thread'] = th
    await pe.close_phone(pg, cdp)
    res['lines_pre'] = [{'k': 'phone_opts', 'v': got['ask']['opts']}, {'k': 'phone_pick', 'v': 0}] + [{'k': 'msg', 'v': (m['from'] or '') + '｜' + m['text']} for m in th]
    R.note('%s 回了第 1 個（%s）：ans＝%s；對話串之後：%s' % (tag, btns[0]['t'] if btns else None, J(after and after.get('ans')), J(th)))
    R.check('%s 按得到第一個回覆、回成了（ans＝0）' % tag, ok and bool(after) and after.get('ans') == 0, J(after))

    async def done():
        q = await L.state(pg); return not q['dlg'] and not q['choices']
    dr = await drive(pg, cdp, tag, who, first_ok, done, max_s=120)
    dr['secs_phone'] = round(time.time() - t0, 1)
    await finish(pg, cdp, 'PHONE', who, res, dr, errs, e0, fb0)


# ---------------- FACE：當面約她，同一區的地點、「現在一起過去」→ 見面那一段 ----------------
async def case_face(pg, cdp, errs):
    tag = '[FACE]'; e0 = len(errs); fb0 = await pg.evaluate("GAME.walkFallbacks|0")
    st = base_state(); st['hour'] = 10.0; st['invites'] = []
    await load(pg, cdp, st, tag, 'day46 10:00、清邀約（掃時段用）')
    ids = [x for x in (os.environ.get('FACE_WHO') or 'heroine_01,heroine_03,heroine_05,heroine_02,classmate_peishan').split(',') if x]
    slot = await pg.evaluate(SCAN_FACE_JS, {'ids': ids, 'd0': st['day'], 'days': 14, 'hours': [10, 11, 13, 14, 15, 16, 17, 19, 20]})
    res = {'who': slot and slot['id'], 'slot': slot, 'setup': []}
    R.note('%s 掃到的時段：%s' % (tag, J(slot)))
    if not R.check('%s 前置：14 天內找得到她在 3D、同一區就有能約的地點的時段' % tag, bool(slot), ''):
        return await finish(pg, cdp, 'FACE', None, res, None, errs, e0, fb0)
    who = slot['id']; st2 = base_state(); st2.update({'day': slot['d'], 'hour': slot['hr'] + 0.05, 'weekday': slot['wd'], 'zone': slot['zone'], 'pos': None, 'invites': []})
    why = '日期 %s（第 %d 天）%.2f 點、區域 %s（她的作息：%s）；要約的：%s（%s）＝分類「%s」→「%s」→「現在一起過去」' % (slot['dkey'], slot['d'], slot['hr'] + 0.05, slot['zone'], slot['act'], slot['pname'], slot['place'], slot['catT'], slot['leafT'])
    res['setup'].append(why); await load(pg, cdp, st2, tag, why)
    res['rel_before'] = await pg.evaluate(REL_JS, who)
    iv0 = {v['id'] for v in await pg.evaluate(INVS_JS, who)}
    w = await walk_to_npc(pg, cdp, tag, who)
    if not R.check('%s 走到她旁邊、互動鍵是和她說話' % tag, bool(w), J(await pg.evaluate(NPC_JS, who))):
        return await finish(pg, cdp, 'FACE', who, res, None, errs, e0, fb0)
    res['label'] = w['label']
    if not R.check('%s 按「%s」開始說話' % (tag, w['label']), await talk_start(pg, cdp, tag), ''):
        return await finish(pg, cdp, 'FACE', who, res, None, errs, e0, fb0)
    seen = {'inv': False}

    def pick(o):
        if not seen['inv'] and starts(o, '就這樣') is not None:   # 說完以後的選單：約她去…
            i = next((j for j, x in enumerate(o) if x['t'].startswith('約') and not x['dim']), None)
            if i is not None: seen['inv'] = True; return i
        if seen['inv']:
            for wd in (slot['catT'], slot['leafT'], '現在一起過去'):
                i = starts(o, wd) if wd else None
                if i is not None: return i
        return first_ok(o)

    async def done():
        q = await L.state(pg)
        if q['dlg'] or q['choices']: return False
        if not seen['inv']: return True
        L_ = [v for v in await pg.evaluate(INVS_JS, who) if v['id'] not in iv0]
        return not any(v['state'] in ('accepted', 'going', 'offered') for v in L_)
    dr = await drive(pg, cdp, tag, who, pick, done, max_s=600)
    res['invites'] = [v for v in await pg.evaluate(INVS_JS, who) if v['id'] not in iv0]
    R.note('%s 選了「約…」：%s；這一次的邀約：%s' % (tag, seen['inv'], J(res['invites'])))
    if not seen['inv']: R.note('%s 【注意】說完以後沒有「約她去…」（旁邊有她的人＝S.privOk 不給、或今天不能約），這一項只測到說話' % tag)
    await finish(pg, cdp, 'FACE', who, res, dr, errs, e0, fb0)


async def main():
    print('CC DLGFX（DLG-FX-MECH-1110）：TAG %s；SHA %s；CASES %s；Playwright ≠ iPhone' % (TAG, SHA or '?', ','.join(CASES)), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        ver = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+/)||[''])[0]"); RESULT['version'] = ver; R.note('畫面上的版本：%s' % ver)
        await pg.evaluate(HOOK_JS)
        F = {'DATE': case_date, 'CHAT': case_chat, 'TERMEND': case_termend, 'PHONE': case_phone, 'FACE': case_face}
        for c in CASES:
            if c not in F: R.check('[%s] 認得這個 case' % c, False, J(list(F))); continue
            try: await F[c](pg, cdp, errs)
            except Exception as e:
                R.check('[%s] 沒有中斷' % c, False, repr(e)[:300])
                RESULT['cases'].setdefault(c, {})['exception'] = repr(e)[:500]
            open(os.path.join(OUT, 'dlgfx_%s.json' % TAG), 'w', encoding='utf-8').write(J(RESULT))
        R.check('全程沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    RESULT['fails'] = R.fails
    open(os.path.join(OUT, 'dlgfx_%s.json' % TAG), 'w', encoding='utf-8').write(J(RESULT))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
