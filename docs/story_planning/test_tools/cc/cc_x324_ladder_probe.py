"""CC-C 11-12：X324 閒聊階梯選項 fx（BB-C 03:53 ①：六位各一兩層、可昕扣友情那 3 個；舊版對照）。判定歸 BB；Playwright 手機橫向觸控（PC GPU／SwiftShader）≠ iPhone。
受測：LAWWW 正式 SHA be1e5d7256（含 4e248bb55e：AA_816 的 694 個選項 fx 匯進 src/data/ladder.js）；舊版 b76dc22227（4e248bb55e 的上一個，只差那 694 個 fx）。
期望值（rule 41）：企劃線 AA_816_ladder_fx.json@7732e123e（複本 fixtures/aa816_ladder_fx_7732e123e.json）——學期→人→層 id→選項字→{fr,love}。
  效果照 src/social3d.js SOCIAL.applyFx：fr → fam、trust、comf 各 +fr；love → npcRom +love（SOCIAL.romOk(她) 不成立＝0；cap 規則照遊戲）。
對照的程式：src/story3d.js S.talkCharacter → S.ladderTalk → S.ladNext／ladPick → S.ladPlay（選項 fx 走 SOCIAL.applyFx）；可昕只在見面／視訊的結尾接一層（src/outings3d.js：STORY.ladNext(G,'kexin',meet|video) → STORY.ladPlay）。
CASES：
  FIVE  五位女主（heroine_01～05）各一層，照玩家：day46 存檔（大一上）→ 掃 14 天裡她在 3D、下一層有選項的時段 →【前置／捷徑】讀檔到那個時段、階梯進度設到那一層
        → 走到她旁邊 → 按說話 → 選單照字選（PICK＝first：第一個；love：有 love 的那個優先）→ 演完。LAYERS＝2 時同一位再往下一層（隔天，同樣做法）。
  KX    可昕扣友情的 3 個（K2-L7「那就不要排了。」大一下、K4-L6「法官要慢一點。」大二下 video、K5-L6「不用緊張啦。」大三上 meet）：
        【前置／捷徑】日期撥到那一學期、那一層的週次裡、dating_kexin、階梯進度設到那一層 → 照 outings3d.js 結尾那條路 STORY.ladNext＋STORY.ladPlay（入口是捷徑，報告標明）
        → 選單照字點 #choices 那一個選項 → 演完。
判定（每一層）：
  a 那一層真的演了（選單的選項字＝ladder 那一層，前置檢查 ladNext 回傳那一層 id）
  b 選了稿上那個選項（照字點）
  c SOCIAL.applyFx 收到的 fx＝稿（AA_816）那一格（新版）；回傳的差值＝{fam,trust,comf:fr; npcRom:love（romOk 才有）}
  d 選單出現以後 SOCIAL.adjust 有稿上 fx 那一筆，而且關係值實際的變化＝那段時間每一筆 adjust 的加總（同一層還有別的加減，不能只看 fam 淨變化）
  舊版：c、d 預期 FAIL（D34）。另外每一 case：沒有 JS 例外、最後沒有對話框／選單開著、沒有 60 秒沒進展。
CC_02 清單 2026-11-12：1✓ 2✓ 3✓ 4✓ 5✓ 6✓（第二版：量之前把她的回話點完） 7✓ 8✓（第二版：d 改成 adjust 加總＝實際變化；第一版只看 fam 淨變化是量錯；第三版：照 S.adjust 每筆夾 0～100，以安 fam 100 時 +5 被夾掉） 9n/a（只存 JSON 和最後一張畫面，不判截圖） 10✓ 11✓ 12✓ 13✓
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=new|old [CASES=FIVE,KX] [WHO=heroine_01,…] [LAYERS=1|2] [PICK=first|love] python3 cc_x324_ladder_probe.py <url> <out>"""
import os, sys, json, asyncio, time, copy, math
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
CASES = [c.strip() for c in (os.environ.get('CASES') or 'FIVE,KX').split(',') if c.strip()]
WHO = [w for w in (os.environ.get('WHO') or 'heroine_01,heroine_02,heroine_03,heroine_04,heroine_05').split(',') if w]
LAYERS = int(os.environ.get('LAYERS') or '1')
PICK = os.environ.get('PICK') or 'first'
R = L.Run('x324lad_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SAVE = os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
DOC = json.load(open(os.path.join(HERE, 'fixtures', 'aa816_ladder_fx_7732e123e.json'), encoding='utf-8'))
STUCK_S = 60
KX = [('Y1S2', 'K2-L7', '「那就不要排了。」', 'meet'), ('Y2S2', 'K4-L6', '「法官要慢一點。」', 'video'), ('Y3S1', 'K5-L6', '「不用緊張啦。」', 'meet')]   # AA_816 裡可昕 fr −1 的 3 個（BB-C 03:53「可昕扣友情那 3 個」）
RESULT = {'tag': TAG, 'sha': SHA, 'url': URL, 'rows': []}

HOOK_JS = r"""(()=>{ window.__DL=window.__DL||[]; window.__FX=window.__FX||[]; window.__ADJ=window.__ADJ||[]; if(GAME.__x324h) return 'already'; GAME.__x324h=1;
  const P=(k,v)=>{ try{ window.__DL.push({k, v, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}); }catch(e){} };
  const s0=GAME.say; if(typeof s0==='function') GAME.say=function(a,b){ P('say', ((a&&a.name)||(typeof a==='string'?a:''))+'｜'+String(b==null?'':b)); return s0.apply(this,arguments); };
  const h0=GAME.choose; if(typeof h0==='function') GAME.choose=function(o){ let t=[]; try{ t=(o||[]).map(x=>x&&x.t); }catch(e){} P('choose', t); return h0.apply(this,arguments); };
  if(typeof SOCIAL!=='undefined'&&SOCIAL.applyFx){ const f0=SOCIAL.applyFx; SOCIAL.applyFx=function(G,id,fx){ const r=f0.apply(this,arguments); try{ window.__FX.push({id, fx:fx==null?null:JSON.parse(JSON.stringify(fx)), ret:r==null?null:JSON.parse(JSON.stringify(r)), n:window.__DL.length}); }catch(e){} return r; }; }
  if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ const a0=SOCIAL.adjust; SOCIAL.adjust=function(id,d){ try{ window.__ADJ.push({id, d:JSON.parse(JSON.stringify(d||{})), n:window.__DL.length}); }catch(e){} return a0.apply(this,arguments); }; }
  return 'hooked'; })()"""
RESET_JS = "(()=>{ window.__DL=[]; window.__FX=[]; window.__ADJ=[]; return true; })()"
LOG_JS = "(()=>({dl:window.__DL||[], fx:window.__FX||[], adj:window.__ADJ||[]}))()"
ADJMARK_JS = "(()=>(window.__ADJ||[]).length)()"
REL_JS = "(w=>{ const r=SOCIAL.rel(w)||{}; return {fam:r.fam, trust:r.trust, comf:r.comf, npcRom:r.npcRom, rom:r.rom}; })"
ROMOK_JS = "(w=>{ try{ return !!SOCIAL.romOk(w); }catch(e){ return null; } })"
SNAP_JS = "(()=>JSON.parse(JSON.stringify(GAME.G)))()"
CH_AT = "(k=>{ const b=[...document.querySelectorAll('#choices button')]; const e=b[k]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {xy:[r.left+r.width/2,r.top+r.height/2], top:!!t&&(t===e||e.contains(t))}; })"
PHONE_OPEN_JS = "(()=>{ const e=document.getElementById('phone'); return !!e&&!e.classList.contains('hide'); })()"
NPC_JS = r"""(id=>{ const E=GAME.E, AL={heroine_01:'an',heroine_05:'sis'};
  let n=(E.npcs||[]).find(q=>q&&q.charId===id&&q.talk&&!q.hidden&&q.obj)||null; if(!n&&GAME.npc&&GAME.npc[id]&&GAME.npc[id].talk) n=GAME.npc[id];
  if(!n&&GAME.npc&&AL[id]&&GAME.npc[AL[id]]&&GAME.npc[AL[id]].talk) n=GAME.npc[AL[id]]; if(!n||!n.obj) return null; const p=n.obj.position;
  return {x:+p.x.toFixed(2), z:+p.z.toFixed(2), lv:n.lv|0, label:n.talkLabel||null, name:n.name||''}; })"""
# 掃：從 d0 起 days 天、各時段，她在 3D（不在上課）、ladNext 回傳的那一層有選項——只算，掃完放回去（同 cc_dlgfx_probe.py 的 SCAN_CHAT_JS，限一個人、可以跳過已經測過的層）
SCAN_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}, so=G.social||(G.social={}); so.ladder=so.ladder||{}; so.ladderDay=so.ladderDay||{};
  const snap=JSON.stringify({l:so.ladder, d:so.ladderDay, s:so.ladSeen||null}); const back=()=>{ const S0=JSON.parse(snap); so.ladder=S0.l; so.ladderDay=S0.d; if(S0.s) so.ladSeen=S0.s; else delete so.ladSeen; };
  const hasCh=st=>!!st&&Array.isArray(st.choices)&&st.choices.some(c=>c&&typeof c.t==='string'&&c.t.trim()); const why={noData:0,away:0,noCh:0,ladNext:0,leave:0};
  try{ for(let d=a.d0; d<a.d0+a.days; d++){ for(const hr of a.hours){ const id=a.id;
        G.day=d; G.hour=hr; G.weekday=CALENDAR.dateOf(d).wd%7; G.zone=keep.zone; back(); const Dd=STORY.ladData(G,id); if(!Dd){ why.noData++; continue; } const steps=Dd.L.steps||[], K=Dd.key, k0=(so.ladder[K])|0;
        let w=null; try{ w=STORY.whereIs(GAME,id); }catch(e){} if(!w||!w.zone||w.away||w.zone==='classroom'||/上課|上班/.test(w.act||'')){ why.away++; continue; }
        const cand=[]; for(let k=Math.max(k0,a.kMin|0);k<steps.length&&cand.length<a.maxStep;k++) if(hasCh(steps[k])&&!(a.skip||[]).includes(steps[k].id)) cand.push(k); if(!cand.length){ why.noCh++; continue; }
        for(const k of cand){ G.hour=hr; G.zone=w.zone; back(); so.ladder[K]=k; delete so.ladderDay[id]; let nx=null; try{ nx=STORY.ladNext(G,id); }catch(e){} if(!nx||nx.id!==steps[k].id){ why.ladNext++; continue; }
          G.hour=hr+0.5; let w2=null; try{ w2=STORY.whereIs(GAME,id); }catch(e){} if(!w2||w2.zone!==w.zone){ why.leave++; continue; }
          return {id, key:K, term:Dd.term, k, k0, step:steps[k].id, choices:steps[k].choices.map(c=>({t:c.t, fx:c.fx||null})), d, wd:CALENDAR.dateOf(d).wd%7, dkey:CALENDAR.dateOf(d).key, hr, zone:w.zone, act:w.act||''}; } } } }
  finally{ Object.assign(G,keep); back(); }
  return {none:true, why}; })"""
# 可昕：找那一學期裡 ladNext(G,'kexin',mode) 會回傳那一層的日子（dating_kexin、階梯進度設到那一層）；找到就留在 G 上（【前置／捷徑】），找不到全部放回去
KX_SET_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday}, so=G.social||(G.social={}); so.ladder=so.ladder||{}; so.ladderDay=so.ladderDay||{}; G.flags=G.flags||{};
  const kf=G.flags.dating_kexin, snap=JSON.stringify({l:so.ladder, d:so.ladderDay}); const back=()=>{ const S0=JSON.parse(snap); so.ladder=S0.l; so.ladderDay=S0.d; Object.assign(G,keep); if(kf===undefined) delete G.flags.dating_kexin; else G.flags.dating_kexin=kf; };
  const r=CALENDAR.termDays?CALENDAR.termDays(a.term):null; if(!r) return {err:'CALENDAR.termDays 沒有 '+a.term}; let seen=[];
  for(let d=r.from; d<=r.to; d++){ G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=a.hour; G.flags.dating_kexin=true; const Dd=STORY.ladData(G,'kexin'); if(!Dd||Dd.term!==a.term) continue;
    const steps=Dd.L.steps||[], k=steps.findIndex(s=>s.id===a.step); if(k<0) return {err:'這一學期的可昕階梯沒有 '+a.step, ids:steps.map(s=>s.id)};
    so.ladder=JSON.parse(snap).l; so.ladder[Dd.key]=k; delete so.ladderDay.kexin; let nx=null; try{ nx=STORY.ladNext(G,'kexin',a.mode); }catch(e){ nx={id:'ERR '+e}; }
    if(nx&&nx.id===a.step) return {d, dkey:CALENDAR.dateOf(d).key, wk:(CALENDAR.termOf(d)||{}).week, key:Dd.key, k, choices:steps[k].choices.map(c=>({t:c.t, fx:c.fx||null}))};
    if(seen.length<4) seen.push([CALENDAR.dateOf(d).key, nx&&nx.id]); }
  back(); return {err:'整學期找不到 ladNext 回傳 '+a.step+' 的日子', seen}; })"""
KX_PLAY_JS = r"""(a=>{ const st=STORY.ladNext(GAME.G,'kexin',a.mode); if(!st||st.id!==a.step) return {err:'ladNext '+(st&&st.id)};
  window.__kxDone=false; window.__kxErr=null; const ADVon=typeof ADV!=='undefined'&&ADV.begin; if(ADVon) ADV.begin({background:'dark',right:{charId:'kexin',expression:'neutral'}});
  void (async()=>{ try{ await STORY.ladPlay(GAME,{name:SOCIAL.displayName('kexin'),charId:'kexin'},'kexin',st); }catch(e){ window.__kxErr=String(e&&e.stack||e).slice(0,300); } finally{ if(ADVon&&ADV.active) ADV.end(); window.__kxDone=true; } })();
  return {ok:true, step:st.id}; })"""


def base_state():
    s = json.load(open(SAVE, encoding='utf-8')); return dict(s.get('G', s))


def doc_fx(term, who, sid, txt):
    try: return DOC[term][who][sid][txt]
    except Exception: return None


async def load(pg, cdp, st, tag, why):
    await L.load_state(pg, st, quiet_phone=True)
    pre = []; await pg.wait_for_timeout(3500); await pe.settle(pg, cdp, pre, 30)
    if pre: R.note('%s 讀檔以後先有的劇情（照 pe.settle 點完，不算）：%s' % (tag, J(pre[-6:])))
    await pg.evaluate(HOOK_JS); await pg.evaluate(RESET_JS); R.setup('%s %s' % (tag, why))


async def tap_choice(pg, cdp, k, tag):
    c = await pg.evaluate(CH_AT, k)
    if not c: return False
    if not c['top']: R.note('%s 選項 %d 的中心最上面不是那個按鈕（照樣按）' % (tag, k))
    await L.touch_tap(cdp, c['xy'][0], c['xy'][1]); await pg.wait_for_timeout(1200); return True


async def drive(pg, cdp, tag, who, want, done, max_s=300):
    """一路點：對話框按 #dlg；選單有 want 那一句＝點它（記選前的關係值）；其他選單：「就這樣」優先，不然第一個能選的（不往下約）。STUCK_S 秒都沒變＝卡住"""
    t0 = time.time(); last = time.time(); sig = None; idle = 0; picks = []; stuck = False; fin = False; rb = None
    while time.time() - t0 < max_s:
        if await pg.evaluate(PHONE_OPEN_JS): await pe.close_phone(pg, cdp)
        q = await L.state(pg); n = await pg.evaluate("(window.__DL||[]).length")
        s = (q['dtext'], q['choices'], q['zone'], n, q['busy'], q['dlg'])
        if s != sig: sig = s; last = time.time()
        elif time.time() - last > STUCK_S: stuck = True; R.note('%s %d 秒沒有進展：%s' % (tag, STUCK_S, J(q))); break
        if q['choices']:
            o = await pe.opts(pg); ts = [x['t'] for x in o]; k = None
            if want and want in ts: k = ts.index(want); rb = await pg.evaluate(REL_JS, who); rb['_adj'] = await pg.evaluate(ADJMARK_JS)
            else:
                for i, x in enumerate(o):
                    if x['t'].startswith('就這樣') and not x['dim']: k = i; break
                if k is None: k = next((i for i, x in enumerate(o) if not x['dim']), 0)
            picks.append({'opts': ts, 'pick': k, 'want': want and want in ts})
            if not await tap_choice(pg, cdp, k, tag): await pg.wait_for_timeout(500)
            idle = 0; continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); idle = 0; continue
        if not q['busy'] and await done(): idle += 1
        else: idle = 0
        if idle >= 3: fin = True; break
        await pg.wait_for_timeout(500)
    return {'stuck': stuck, 'done': fin, 'secs': round(time.time() - t0, 1), 'picks': picks, 'rel_at_menu': rb}


async def walk_to_npc(pg, cdp, tag, who):
    """分段走（go_to 每段 ≤120 秒、到了看互動鍵）；她在走動就用搖桿追（同 cc_dlgfx_probe.py；CC_02 乙 13）"""
    for k in range(3):
        n = await pg.evaluate(NPC_JS, who)
        if not n: await pg.wait_for_timeout(1500); continue
        await L.go_to(pg, cdp, R, n['x'], n['z'], 0.9 if k < 2 else 0.6, '%s 走到 %s 旁邊（第 %d 次）' % (tag, n['name'] or who, k + 1), max_s=120, lv=n['lv'])
        await pg.wait_for_timeout(700); s = await L.state(pg); lab = s['interact']
        if s['dlg'] or s['choices']: R.note('%s 走路途中有對話／選單：%s——停下來' % (tag, J({k2: s[k2] for k2 in ('dlg', 'choices', 'dtext')}))); return None
        if lab and ('說話' in lab or '打招呼' in lab) and (not n['name'] or n['name'][:2] in lab or (n['label'] and lab.startswith(n['label'][:4]))): return {'npc': n, 'label': lab}
        R.note('%s 互動鍵是「%s」（她 %s），再靠近' % (tag, lab, J(n)))
    t0 = time.time(); n = None
    while time.time() - t0 < 40:
        n = await pg.evaluate(NPC_JS, who)
        if not n: await pg.wait_for_timeout(500); continue
        me = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z,GAME.E.cam.yaw]; })()")
        dx, dz = n['x'] - me[0], n['z'] - me[1]; dist = math.hypot(dx, dz); s = await L.state(pg); lab = s['interact']
        if lab and ('說話' in lab or '打招呼' in lab) and (not n['name'] or n['name'][:2] in lab): R.note('%s 搖桿追上她（%.1f 秒）' % (tag, time.time() - t0)); return {'npc': n, 'label': lab}
        yaw = me[2]; fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
        vx, vz = dx / (dist or 1), dz / (dist or 1); sx, sy = vx * rx + vz * rz, -(vx * fx + vz * fz); m = math.hypot(sx, sy) or 1
        await L.joystick(pg, cdp, sx / m * 45, sy / m * 45, 400 if dist > 1.2 else 150)
    R.note('%s 搖桿追 40 秒還是沒有和她說話的互動鍵（她 %s）' % (tag, J(n))); return None


def choose_opt(choices, term, who, sid):
    """PICK＝love：稿上有 love 的那個優先；不然第一個。回傳（選項字、稿的 fx）"""
    if PICK == 'love':
        for c in choices:
            f = doc_fx(term, who, sid, c['t'])
            if f and f.get('love'): return c['t'], f
    c = choices[0]; return c['t'], doc_fx(term, who, sid, c['t'])


async def judge(pg, cdp, tag, who, row, dr, want, fx_doc, errs, e0):
    for _ in range(20):   # 選了以後她的回話可能晚一點才出來（be1e 雲端第一次：回話跑到下一個 case 讀檔時才點掉）＝先把對話點完再量
        q0 = await L.state(pg)
        if q0['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if q0['choices']: break
        await pg.wait_for_timeout(500)
        if not (await L.state(pg))['dlg']: break
    lg = await pg.evaluate(LOG_JS); q = await L.state(pg); ra = await pg.evaluate(REL_JS, who); romok = await pg.evaluate(ROMOK_JS, who)
    row.update({'drive': dr, 'fx_calls': [x for x in lg['fx'] if x['id'] == who], 'rel_after': ra, 'romOk': romok, 'errs': errs[e0:], 'end': {k: q[k] for k in ('zone', 'dlg', 'choices', 'busy', 'hour')}})
    row['lines'] = [e['v'] for e in lg['dl'] if e['k'] in ('say', 'choose')][-14:]
    try: await pg.screenshot(path=os.path.join(OUT, 'x324lad_%s_%s.jpg' % (TAG, row['step'])), type='jpeg', quality=70)
    except Exception: pass
    played = bool(dr) and any(p['want'] for p in dr['picks'])
    R.check('%s a 那一層 %s 有演（選單裡有「%s」）' % (tag, row['step'], want), played, J(dr and dr['picks']))
    R.check('%s b 選了「%s」（照字點）' % (tag, want), played, '')
    exp_ret = {}
    if fx_doc:
        fr = int(fx_doc.get('fr') or 0); lv = int(fx_doc.get('love') or 0)
        if fr: exp_ret.update({'fam': fr, 'trust': fr, 'comf': fr})
        if lv and romok: exp_ret['npcRom'] = lv
    calls = [c for c in row['fx_calls'] if c['fx'] == fx_doc]
    R.note('%s 稿 AA_816 %s/%s/%s「%s」fx %s；SOCIAL.applyFx 收到 %s；romOk %s；期望回傳 %s' % (tag, row['term'], who, row['step'], want, J(fx_doc), J(row['fx_calls']), romok, J(exp_ret)))
    R.check('%s c 選了以後 SOCIAL.applyFx 收到稿上的 fx %s' % (tag, J(fx_doc)), bool(fx_doc) and len(calls) >= 1, J(row['fx_calls']))
    if exp_ret: R.check('%s c 回傳的差值＝%s（照 applyFx：fr→fam／trust／comf，love→npcRom）' % (tag, J(exp_ret)), any(c['ret'] == exp_ret for c in calls) or (not exp_ret and calls), J([c['ret'] for c in calls]))
    rb = (dr or {}).get('rel_at_menu') or {}
    if fx_doc and rb.get('fam') is not None and ra.get('fam') is not None:
        # d（CC-C 11-12 第二版）：同一層還有別的加減（說話 +fam、這一層的 rel comf+2…），淨變化不等於稿的 fr（第一版只看 fam 有沒有變少＝CC_02 乙 8 量錯）。
        #   改成：選單出現以後 SOCIAL.adjust 的每一筆加起來＝關係值實際的變化（fx 那一筆真的落到最後的數字上），而且裡面有 fx 那一筆（fr→fam、trust、comf 各 fr）
        adj = [a for a in lg['adj'][int(rb.get('_adj') or 0):] if a['id'] == who]; tot = {}
        for a in adj:
            for k2, v in (a['d'] or {}).items():
                if isinstance(v, (int, float)): tot[k2] = tot.get(k2, 0) + v
        fr = int(fx_doc.get('fr') or 0); has_fx = (not fr) or any((a['d'] or {}).get('fam') == fr and (a['d'] or {}).get('trust') == fr and (a['d'] or {}).get('comf') == fr for a in adj)
        diff = {k2: round((ra.get(k2) or 0) - (rb.get(k2) or 0), 3) for k2 in ('fam', 'trust', 'comf', 'npcRom') if ra.get(k2) is not None and rb.get(k2) is not None}
        # 照 src/social3d.js S.adjust：每一筆加完就夾在 0～100（be1e 雲端第一次：以安 fam 已經 100，+5 全被夾掉＝照遊戲，探針沒算上限＝CC_02 乙 8）
        sim = {k2: rb.get(k2) or 0 for k2 in diff}
        for a in adj:
            for k2, v in (a['d'] or {}).items():
                if k2 in sim and isinstance(v, (int, float)): sim[k2] = max(0, min(100, sim[k2] + v))
        exp_tot = {k2: round(sim[k2] - (rb.get(k2) or 0), 3) for k2 in diff}
        R.note('%s d 選單出現以後 SOCIAL.adjust：%s；直接加總 %s；照 0～100 夾過的變化 %s；實際變化 %s' % (tag, J(adj), J(tot), J(exp_tot), J(diff)))
        R.check('%s d 稿上的 fx 那一筆有進 SOCIAL.adjust%s' % (tag, '（fam、trust、comf 各 %+d）' % fr if fr else ''), has_fx, J(adj))
        R.check('%s d 關係值實際的變化＝選單以後每一筆 adjust 照順序加、每筆夾在 0～100（同 S.adjust；fx 有落到最後的數字上）' % tag, all(abs(diff[k2] - exp_tot[k2]) < 0.01 for k2 in diff), J({'diff': diff, 'sum': exp_tot}))
    R.check('%s 流程走完（沒有 %d 秒沒進展）' % (tag, STUCK_S), bool(dr) and dr['done'] and not dr['stuck'], J(dr and {k: dr[k] for k in ('stuck', 'done', 'secs')}))
    R.check('%s 最後沒有對話框、選單開著' % tag, not q['dlg'] and not q['choices'], J(row['end']))
    R.check('%s 沒有 JS 例外' % tag, not row['errs'], J(row['errs'][:3]))
    RESULT['rows'].append(row); open(os.path.join(OUT, 'x324lad_%s.json' % TAG), 'w', encoding='utf-8').write(J(RESULT))


async def case_five(pg, cdp, errs):
    for who in WHO:
        done_ids = []; day0 = None
        for layer in range(LAYERS):
            tag = '[FIVE %s 第 %d 層]' % (who, layer + 1); e0 = len(errs)
            st = base_state(); st['hour'] = 10.0; st['invites'] = []
            if day0 is not None: st['day'] = day0 + 1
            await load(pg, cdp, st, tag, 'day46 存檔%s 10:00、清邀約（掃時段用）' % ('' if day0 is None else '、日期 +1 天（第 2 層）'))
            slot = await pg.evaluate(SCAN_JS, {'id': who, 'd0': st['day'], 'days': 14, 'hours': [10, 11, 13, 14, 15, 16, 17, 19, 20], 'maxStep': 3, 'skip': done_ids})
            R.note('%s 掃到的時段：%s' % (tag, J(slot)))
            if not R.check('%s 前置：14 天內找得到她在 3D、下一層有選項的時段' % tag, not slot.get('none'), J(slot.get('why'))): break
            want, fx_doc = choose_opt(slot['choices'], slot['term'], who, slot['step'])
            st2 = base_state(); st2.update({'day': slot['d'], 'hour': slot['hr'] + 0.05, 'weekday': slot['wd'], 'zone': slot['zone'], 'pos': None, 'invites': []})
            soc = copy.deepcopy(st2.get('social') or {}); soc.setdefault('ladder', {})[slot['key']] = slot['k']; ld = dict(soc.get('ladderDay') or {}); ld.pop(who, None); soc['ladderDay'] = ld; st2['social'] = soc
            why = '【前置／捷徑】讀檔到 %s（第 %d 天）%.2f 點、%s（她的作息：%s）；階梯 %s 進度 %d → %d（%s，選項 %s）' % (slot['dkey'], slot['d'], slot['hr'] + 0.05, slot['zone'], slot['act'], slot['key'], slot['k0'], slot['k'], slot['step'], J([c['t'] for c in slot['choices']]))
            await load(pg, cdp, st2, tag, why)
            row = {'case': 'FIVE', 'who': who, 'term': slot['term'], 'step': slot['step'], 'want': want, 'fx_doc': fx_doc, 'slot': slot, 'rel_before': await pg.evaluate(REL_JS, who)}
            w = await walk_to_npc(pg, cdp, tag, who)
            if not R.check('%s 走到她旁邊、互動鍵是和她說話' % tag, bool(w), J(await pg.evaluate(NPC_JS, who))): RESULT['rows'].append(row); break
            await L.tap(pg, cdp, '#interact'); ok = False
            for _ in range(16):
                q = await L.state(pg)
                if q['dlg'] or q['choices'] or q['busy']: ok = True; break
                await pg.wait_for_timeout(500)
            if not R.check('%s 按「%s」開始說話' % (tag, w['label']), ok, ''): RESULT['rows'].append(row); break

            async def done():
                q = await L.state(pg); return not q['dlg'] and not q['choices']
            dr = await drive(pg, cdp, tag, who, want, done)
            await judge(pg, cdp, tag, who, row, dr, want, fx_doc, errs, e0)
            done_ids.append(slot['step']); day0 = slot['d']


async def case_kx(pg, cdp, errs):
    for term, sid, want, mode in KX:
        tag = '[KX %s %s %s]' % (term, sid, mode); e0 = len(errs)
        st = base_state(); st['hour'] = 19.0; st['invites'] = []
        await load(pg, cdp, st, tag, 'day46 存檔 19:00、清邀約')
        s = await pg.evaluate(KX_SET_JS, {'term': term, 'step': sid, 'mode': mode, 'hour': 19.0})
        R.note('%s 找日子：%s' % (tag, J(s)))
        if not R.check('%s 前置：%s 裡找得到 ladNext(可昕, %s)＝%s 的日子' % (tag, term, mode, sid), not s.get('err'), J(s)): continue
        R.setup('%s 【前置／捷徑】日期撥到 %s（第 %s 週）19:00、dating_kexin、階梯 %s 進度設到 %d（%s）；入口照 outings3d.js 見面／視訊結尾那條路：STORY.ladNext＋STORY.ladPlay（mode %s）' % (tag, s['dkey'], s['wk'], s['key'], s['k'], sid, mode))
        fx_doc = doc_fx(term, 'kexin', sid, want)
        if not R.check('%s 前置：稿 AA_816 這一格是扣友情（%s）' % (tag, J(fx_doc)), bool(fx_doc) and (fx_doc.get('fr') or 0) < 0, ''): continue
        if not R.check('%s 前置：遊戲這一層有「%s」這個選項' % (tag, want), want in [c['t'] for c in s['choices']], J(s['choices'])): continue
        row = {'case': 'KX', 'who': 'kexin', 'term': term, 'step': sid, 'mode': mode, 'want': want, 'fx_doc': fx_doc, 'set': s, 'rel_before': await pg.evaluate(REL_JS, 'kexin')}
        p = await pg.evaluate(KX_PLAY_JS, {'step': sid, 'mode': mode})
        if not R.check('%s 開始演這一層' % tag, bool(p.get('ok')), J(p)): RESULT['rows'].append(row); continue

        async def done():
            q = await L.state(pg); return bool(await pg.evaluate("!!window.__kxDone")) and not q['dlg'] and not q['choices']
        dr = await drive(pg, cdp, tag, 'kexin', want, done, max_s=180)
        ke = await pg.evaluate("window.__kxErr")
        if ke: errs.append('ladPlay：' + ke)
        await judge(pg, cdp, tag, 'kexin', row, dr, want, fx_doc, errs, e0)


async def main():
    print('CC X324 閒聊階梯選項 fx：TAG %s；SHA %s；CASES %s；PICK %s；LAYERS %d；Playwright ≠ iPhone' % (TAG, SHA or '?', ','.join(CASES), PICK, LAYERS), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        lsrc = await pg.evaluate("(typeof LADDER!=='undefined'&&LADDER.source)?String(LADDER.source).slice(-160):null")
        R.note('ladder.js 來源（結尾）：%s——新版要有 AA_816@7732e123e；舊版沒有' % lsrc); RESULT['ladder_source_tail'] = lsrc
        await pg.evaluate(HOOK_JS)
        F = {'FIVE': case_five, 'KX': case_kx}
        for c in CASES:
            if c not in F: R.check('[%s] 認得這個 case' % c, False, J(list(F))); continue
            try: await F[c](pg, cdp, errs)
            except Exception as e: R.check('[%s] 沒有中斷' % c, False, repr(e)[:300])
        R.check('全程沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    RESULT['fails'] = R.fails; open(os.path.join(OUT, 'x324lad_%s.json' % TAG), 'w', encoding='utf-8').write(J(RESULT))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
