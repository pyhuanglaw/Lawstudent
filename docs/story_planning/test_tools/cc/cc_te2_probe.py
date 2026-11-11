"""CC（帳號 A）11-11：沛珊第一批（PEISHAN-VOICE-1110，X327；開發分支 65212b697＝a648c5f37 合併）的兩件事（BB 00:48 第 6 項）。判定歸 BB；Playwright（PC GPU）≠ iPhone。
（沛珊的期末飯、「她先說」的告白在 cc_te_probe.py：fr_ps_Y1S1、gf_ps_Y1S2、heart_ps_yes／heart_ps_think／heart_ps_yes_me。）

1. 瀏覽器 CASES=ps_ladder：大一上閒聊階梯前三層（P-L1～P-L3，src/data/ladder.js 照 AA_753_peishan_ladder_Y1S1.json @33a1769f8 匯入）逐句記。
   對照的程式（src/story3d.js）：S.talkCharacter → S.ladderTalk → S.ladNext（S.ladData：大一上的 key＝classmate_peishan；一天一層 ladderDay）→ S.ladPlay（選項 re、fx）。
   每一層：【捷徑】讀 day46 存檔、找 21 天內她在 3D 某一區（不是上課、不是圖書館——圖書館說話只點頭）而且下一層＝第 k 層的時段，閒聊階梯進度設成 k、拿掉今天聊過的記號 → 走到她旁邊、按「說話」→ 一路點（選項選第一個、
   說完以後的「就這樣」）；那一層的條件要先演過的事件（P-L3：ev_public_law_group）存檔還沒演＝【捷徑】記成演過。稿＝DRAFT_DIR（預設 fixtures/te_drafts）的 AA_753_peishan_ladder_Y1S1.json：那一層的 lines、選項的字、選了以後的 re、fx（SOCIAL.applyFx 收到的）、記憶 mem。
2. 離線（不開瀏覽器）：python3 cc_te2_probe.py --static <受測樹> <out>：受測樹 src/ 全部搜「早餐店」「四點半」「蛋餅」「煎台」「端七盤」，
   每一處標「沛珊這一行／沛珊（前幾行內）／不確定」，一行很長的 JSON 檔（ladder.js、date_lines.js…）照出現的位置往前找最近的人物 key。輸出 <out>/te2_static.txt、.json。
用法：LW_TESTS=<worktree>/tests SHA=<sha> [CASES=ps_ladder] [DRAFT_DIR=...] python3 cc_te2_probe.py <url> <out>"""
import os, sys, json, re, time, asyncio

WORDS = ['早餐店', '四點半', '蛋餅', '煎台', '端七盤']
PSRE = re.compile(r'peishan|沛珊|\bps_|\bPS_|\bps[0-9]')
CHARRE = re.compile(r'"?(heroine_0[1-5]|classmate_[a-z]+|kexin|zhe|yu|kai|npc_[a-z]+)"?\s*:')
J = lambda o: json.dumps(o, ensure_ascii=False)


def static_scan(root, out):
    os.makedirs(out, exist_ok=True); hits = []
    for dp, _, fs in os.walk(os.path.join(root, 'src')):
        for f in sorted(fs):
            if not f.endswith('.js'): continue
            p = os.path.join(dp, f); rel = os.path.relpath(p, root); L = open(p, encoding='utf-8').read().split('\n')
            for i, l in enumerate(L):
                for w in WORDS:
                    for m in re.finditer(re.escape(w), l):
                        a = m.start(); snip = l[max(0, a - 50):a + 50]
                        if len(l) > 2000:   # 一行很長（匯入的 JSON）：往前 1500 字找最近的人物 key
                            back = l[max(0, a - 1500):a]; keys = CHARRE.findall(back); near = keys[-1] if keys else None
                            mark = '沛珊（往前最近的人物 key）' if near == 'classmate_peishan' else ('沛珊這一行附近' if PSRE.search(l[max(0, a - 300):a + 100]) else '不確定（最近的人物 key：%s）' % near)
                        else:
                            ctx = '\n'.join(L[max(0, i - 6):i + 1])
                            mark = '沛珊這一行' if PSRE.search(l) else ('沛珊（前 6 行內）' if PSRE.search(ctx) else '不確定')
                        ids = re.findall(r'"id":\s*"([^"]+)"', l[max(0, a - 3000):a]) if len(l) > 2000 else []
                        hits.append({'file': rel, 'line': i + 1, 'col': a + 1, 'word': w, 'mark': mark, 'snip': snip.strip(), 'nearId': ids[-1] if ids else None})
    hits.sort(key=lambda h: (not h['mark'].startswith('沛珊'), h['file'], h['line'], h['col']))
    ps = [h for h in hits if h['mark'].startswith('沛珊')]
    with open(os.path.join(out, 'te2_static.txt'), 'w', encoding='utf-8') as fo:
        fo.write('受測樹 %s；共 %d 處，標沛珊的 %d 處\n' % (root, len(hits), len(ps)))
        for h in hits: fo.write('%s:%d:%d 「%s」 %s%s ｜ %s\n' % (h['file'], h['line'], h['col'], h['word'], h['mark'], ('（往前最近的 id：%s）' % h['nearId']) if h.get('nearId') else '', h['snip']))
    json.dump({'root': root, 'hits': hits}, open(os.path.join(out, 'te2_static.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('共 %d 處，標沛珊的 %d 處（%s）' % (len(hits), len(ps), os.path.join(out, 'te2_static.txt')), flush=True)
    for h in ps: print('  %s:%d 「%s」 %s%s ｜ %s' % (h['file'], h['line'], h['word'], h['mark'], ('（id %s）' % h['nearId']) if h.get('nearId') else '', h['snip'][:90]), flush=True)
    print('ALL PASS（只列出，不判定）', flush=True)


if len(sys.argv) >= 2 and sys.argv[1] == '--static':
    static_scan(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else '.'); sys.exit(0)

sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
CASES = [c.strip() for c in (os.environ.get('CASES') or 'ps_ladder').split(',') if c.strip()]
R = L.Run('te2', OUT)
SAVE = os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
WHO = 'classmate_peishan'
STEPS = int(os.environ.get('STEPS') or 3)
STUCK_S = 60
LINES_TXT = os.path.join(OUT, 'te2_lines.txt')
RESULT = {'sha': SHA, 'url': URL, 'cases': {}}

HOOK_JS = r"""(()=>{ window.__DL=window.__DL||[]; if(GAME.__te2Hooked) return 'already'; GAME.__te2Hooked=1;
  const P=(k,v,x)=>{ try{ window.__DL.push(Object.assign({k, v, h:+(+GAME.G.hour).toFixed(3), d:GAME.G.day, z:GAME.G.zone},x||{})); }catch(e){} };
  const s0=GAME.say; if(typeof s0==='function') GAME.say=function(a,b){ P('say', String(b==null?'':b), {who:(a&&a.charId)||null, name:(a&&a.name)||(typeof a==='string'?a:'')}); return s0.apply(this,arguments); };
  const c0=GAME.caption; if(typeof c0==='function') GAME.caption=function(a,b){ P('cap', (a?a+'｜':'')+String(b==null?'':b)); return c0.apply(this,arguments); };
  const h0=GAME.choose; if(typeof h0==='function') GAME.choose=function(o){ let t=[]; try{ t=(o||[]).map(x=>x&&x.t); }catch(e){} P('choose', t); const r=h0.apply(this,arguments); try{ if(r&&typeof r.then==='function') r.then(k=>P('pick',k)); }catch(e){} return r; };
  if(typeof SOCIAL!=='undefined'&&SOCIAL.applyFx){ const f0=SOCIAL.applyFx; SOCIAL.applyFx=function(G,id,fx,o){ const r=f0.apply(this,arguments); try{ P('fx', null, {id, fx:fx==null?null:JSON.parse(JSON.stringify(fx)), ret:r==null?null:JSON.parse(JSON.stringify(r))}); }catch(e){} return r; }; }
  return 'hooked'; })()"""
RESET_JS = "(()=>{ window.__DL=[]; return true; })()"
LOG_JS = "(()=>(window.__DL||[]))()"
CH_AT = "(k=>{ const b=[...document.querySelectorAll('#choices button')]; const e=b[k]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })"
PHONE_OPEN_JS = "(()=>{ const e=document.getElementById('phone'); return !!e&&!e.classList.contains('hide'); })()"
NPC_JS = r"""(id=>{ const E=GAME.E; let n=(E.npcs||[]).find(q=>q&&q.charId===id&&q.talk&&!q.hidden&&q.obj)||null; if(!n&&GAME.npc&&GAME.npc[id]&&GAME.npc[id].talk) n=GAME.npc[id];
  if(!n||!n.obj) return null; const p=n.obj.position; return {x:+p.x.toFixed(2), z:+p.z.toFixed(2), lv:n.lv|0, label:n.talkLabel||null, name:n.name||''}; })"""
# 21 天內她在 3D（不是上課、不是圖書館）、下一層＝第 k 層、半小時後還在同一區的時段（只算，算完把日期、區域、階梯進度放回去）
SCAN_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}, so=G.social||(G.social={}); so.ladder=so.ladder||{}; so.ladderDay=so.ladderDay||{};
  const snap=JSON.stringify({l:so.ladder, d:so.ladderDay}); const back=()=>{ const S0=JSON.parse(snap); so.ladder=S0.l; so.ladderDay=S0.d; };
  try{ for(let d=a.d0; d<a.d0+a.days; d++){ for(const hr of a.hours){ G.day=d; G.hour=hr; G.weekday=CALENDAR.dateOf(d).wd%7; G.zone=keep.zone; back();
        const D=STORY.ladData(G,a.id); if(!D) continue; const steps=D.L.steps||[]; if(!steps[a.k]) return {err:'沒有第 '+a.k+' 層'};
        let w=null; try{ w=STORY.whereIs(GAME,a.id); }catch(e){} if(!w||!w.zone||w.away) continue; if(w.zone==='classroom'||/上課|上班/.test(w.act||'')) continue;
        if(typeof LIBQ!=='undefined'&&LIBQ.ZONES&&LIBQ.ZONES[w.zone]) continue;   /* 圖書館（小聲）：說話只點頭（libquiet3d.js S.NOD），不推進階梯 */
        G.zone=w.zone; so.ladder[D.key]=a.k; delete so.ladderDay[a.id]; let nx=null; try{ nx=STORY.ladNext(G,a.id); }catch(e){} if(!nx||nx.id!==steps[a.k].id) continue;
        G.hour=hr+0.5; let w2=null; try{ w2=STORY.whereIs(GAME,a.id); }catch(e){} if(!w2||w2.zone!==w.zone) continue;
        const st=steps[a.k]; return {key:D.key, k:a.k, step:st.id, lines:st.lines||[], choices:(st.choices||[]).map(c=>c.t), d, wd:CALENDAR.dateOf(d).wd%7, dkey:CALENDAR.dateOf(d).key, hr, zone:w.zone, act:w.act||''}; } } }
  finally{ Object.assign(G,keep); back(); }
  return null; })"""
STEPEV_JS = "(a=>{ const D=STORY.ladData(GAME.G,a.id); const st=D&&(D.L.steps||[])[a.k]; return st?{id:st.id, cond:st.if||null, events:(st.if&&st.if.events)||[]}:null; })"
REL_JS = "(w=>{ const r=SOCIAL.rel(w)||{}; return {fam:r.fam, trust:r.trust, comf:r.comf, npcRom:r.npcRom, stage:SOCIAL.stage?SOCIAL.stage(w):null}; })"
MEM_JS = "(a=>a.ms.map(m=>[m, !!(SOCIAL.has&&SOCIAL.has(a.w,m))]))"


def rf_loader():
    for root in (os.path.dirname(os.path.abspath(os.environ.get('LW_TESTS') or 'tests')), os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))):
        p = os.path.join(root, 'tools', 'story', 'import_guard.py')
        if os.path.exists(p):
            try:
                sys.path.insert(0, os.path.dirname(p)); sp = importlib.util.spec_from_file_location('import_guard', p); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
                m.read_fix('測試'); return m.read_fix, p
            except Exception as e:
                return (lambda s: s), '讀 %s 失敗：%r' % (p, e)
    return (lambda s: s), '找不到 import_guard.py'


RF, RFSRC = rf_loader()
lt = lambda x: RF(x) if isinstance(x, str) else (RF(x['narr']) if isinstance(x, dict) and isinstance(x.get('narr'), str) else None)
lns = lambda a: [y for y in (lt(x) for x in (a or [])) if y is not None]


def draft():
    dd = os.environ.get('DRAFT_DIR') or 'fixtures/te_drafts'
    if not os.path.isabs(dd): dd = os.path.join(HERE, dd)
    p = os.path.join(dd, 'AA_753_peishan_ladder_Y1S1.json')
    return json.load(open(p, encoding='utf-8')), p


async def tap_choice(pg, cdp, k):
    c = await pg.evaluate(CH_AT, k)
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); return True


async def walk_to_npc(pg, cdp, tag, who):
    """cc_dlgfx_probe.py 的做法：點地走過去，她在走動就用搖桿追"""
    import math
    for k in range(3):
        n = await pg.evaluate(NPC_JS, who)
        if not n: await pg.wait_for_timeout(1500); continue
        await L.go_to(pg, cdp, R, n['x'], n['z'], 0.9 if k < 2 else 0.6, '%s 走到 %s 旁邊（第 %d 次）' % (tag, n['name'] or who, k + 1), max_s=120, lv=n['lv'])
        await pg.wait_for_timeout(700); s = await L.state(pg); lab = s['interact']
        if lab and ('說話' in lab or '打招呼' in lab): return {'npc': n, 'label': lab}
    t0 = time.time()
    while time.time() - t0 < 40:
        n = await pg.evaluate(NPC_JS, who)
        if not n: await pg.wait_for_timeout(500); continue
        me = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z,GAME.E.cam.yaw]; })()")
        dx, dz = n['x'] - me[0], n['z'] - me[1]; dist = math.hypot(dx, dz)
        s = await L.state(pg); lab = s['interact']
        if lab and ('說話' in lab or '打招呼' in lab): return {'npc': n, 'label': lab}
        yaw = me[2]; fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
        vx, vz = dx / (dist or 1), dz / (dist or 1); sx, sy = vx * rx + vz * rz, -(vx * fx + vz * fz); m = math.hypot(sx, sy) or 1
        await L.joystick(pg, cdp, sx / m * 45, sy / m * 45, 400 if dist > 1.2 else 150)
    return None


async def drive(pg, cdp, tag, max_s=240):
    t0 = time.time(); last = time.time(); sig = None; idle = 0; picks = []
    while time.time() - t0 < max_s:
        if await pg.evaluate(PHONE_OPEN_JS): await pe.close_phone(pg, cdp)
        q = await L.state(pg); n = await pg.evaluate("(window.__DL||[]).length")
        s = (q['dtext'], q['choices'], n, q['busy'], q['dlg'])
        if s != sig: sig = s; last = time.time()
        elif time.time() - last > STUCK_S: return {'stuck': True, 'picks': picks, 'secs': round(time.time() - t0, 1)}
        if q['choices']:
            o = await pe.opts(pg); T = [x['t'] for x in o]
            k = next((i for i, x in enumerate(T) if x.startswith('就這樣')), None)
            if k is None: k = next((i for i, x in enumerate(o) if not x['dim']), 0)
            picks.append({'opts': T, 'pick': k}); await tap_choice(pg, cdp, k); idle = 0; continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); idle = 0; continue
        idle = idle + 1 if not q['busy'] else 0
        if idle >= 4: return {'stuck': False, 'done': True, 'picks': picks, 'secs': round(time.time() - t0, 1)}
        await pg.wait_for_timeout(500)
    return {'stuck': False, 'done': False, 'picks': picks, 'secs': round(time.time() - t0, 1)}


def write_lines(head, dl):
    with open(LINES_TXT, 'a', encoding='utf-8') as f:
        f.write('\n==== %s ====\n' % head)
        for e in dl:
            k = e.get('k')
            if k == 'say': f.write('%s｜%s\n' % (e.get('name') or ('（旁白）' if not e.get('who') else e.get('who')), e['v']))
            elif k == 'cap': f.write('【字幕】%s\n' % e['v'])
            elif k == 'choose': f.write('【選項】%s\n' % '／'.join(str(x) for x in (e['v'] or [])))
            elif k == 'pick': f.write('【選了】第 %s 個\n' % e['v'])
            elif k == 'fx': f.write('【fx】%s fx=%s 實際=%s\n' % (e.get('id'), J(e.get('fx')), J(e.get('ret'))))


async def case_ladder(pg, cdp, errs):
    D, dpath = draft(); steps = D.get('steps') or []
    R.note('稿：%s（%d 層）；換名：%s' % (dpath, len(steps), RFSRC))
    base = json.load(open(SAVE, encoding='utf-8')); base = dict(base.get('G', base))
    res = RESULT['cases'].setdefault('ps_ladder', {'steps': []})
    for k in range(min(STEPS, len(steps))):
        t = '[ps_ladder 第 %d 層]' % (k + 1); e0 = len(errs); ds = steps[k]
        st = dict(base); st.update({'hour': 10.0, 'invites': []})
        await L.load_state(pg, st, quiet_phone=True); await pg.wait_for_timeout(3000); await pe.settle(pg, cdp, [], 30); await pg.evaluate(HOOK_JS)
        sev = await pg.evaluate(STEPEV_JS, {'id': WHO, 'k': k}) or {}
        need = [e for e in sev.get('events') or [] if e not in ((base.get('events') or {}).get('done') or {})]
        if need:   # 這一層的條件要先演過的事件（P-L3：ev_public_law_group）：存檔還沒演＝【捷徑】記成演過
            ev = json.loads(json.dumps(st.get('events') or {})); ev.setdefault('done', {}); ev['done'].update({e_: base['day'] for e_ in need}); st['events'] = ev
            await L.load_state(pg, st, quiet_phone=True); await pg.wait_for_timeout(3000); await pe.settle(pg, cdp, [], 30); await pg.evaluate(HOOK_JS)
            R.setup('%s【捷徑】這一層的條件（%s）要的事件 %s 存檔還沒演，記成演過' % (t, J(sev.get('cond')), J(need)))
        slot = await pg.evaluate(SCAN_JS, {'id': WHO, 'k': k, 'd0': base['day'], 'days': 21, 'hours': [10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21]})
        r = {'k': k, 'draft_id': ds.get('id'), 'slot': slot}; res['steps'].append(r)
        R.note('%s 掃到的時段：%s' % (t, J(slot)))
        if not R.check('%s 前置：21 天內找得到她在 3D、下一層＝%s 的時段' % (t, ds.get('id')), bool(slot) and not slot.get('err'), J(slot)): continue
        st2 = dict(st); st2.update({'day': slot['d'], 'hour': slot['hr'] + 0.05, 'weekday': slot['wd'], 'zone': slot['zone'], 'pos': None, 'invites': []})
        so = json.loads(json.dumps(st2.get('social') or {})); so.setdefault('ladder', {})[slot['key']] = k; ld = dict(so.get('ladderDay') or {}); ld.pop(WHO, None); so['ladderDay'] = ld; st2['social'] = so
        await L.load_state(pg, st2, quiet_phone=True); await pg.wait_for_timeout(3000); await pe.settle(pg, cdp, [], 30); await pg.evaluate(HOOK_JS); await pg.evaluate(RESET_JS)
        R.setup('%s【捷徑】讀 day46 存檔、日期 %s %.2f 點、區域 %s（她的作息：%s）；閒聊階梯 %s 進度設成 %d、拿掉今天聊過的記號' % (t, slot['dkey'], slot['hr'] + 0.05, slot['zone'], slot['act'], slot['key'], k))
        r['rel_before'] = await pg.evaluate(REL_JS, WHO)
        w = await walk_to_npc(pg, cdp, t, WHO)
        if not R.check('%s 走到她旁邊、互動鍵是和她說話' % t, bool(w), J(await pg.evaluate(NPC_JS, WHO))): continue
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        dr = await drive(pg, cdp, t); dl = await pg.evaluate(LOG_JS); r['drive'] = dr; r['dl'] = dl
        write_lines('%s %s（遊戲 %s）' % (t, ds.get('id'), slot['step']), dl)
        says = [x['v'] for x in dl if x.get('k') == 'say']
        exp = lns(ds.get('lines'))
        j = next((i for i in range(len(says) - len(exp) + 1) if says[i:i + len(exp)] == exp), None) if exp else None
        R.check('%s 這一層是稿的 %s（遊戲的下一層 %s）' % (t, ds.get('id'), slot['step']), slot['step'] == ds.get('id'), '')
        R.check('%s 她說的照稿 %s' % (t, J(exp)), j is not None, J(says[:8]))
        dch = [RF(c['t']) for c in ds.get('choices') or []]
        mi = next((i for i, x in enumerate(dl) if x.get('k') == 'choose' and set(x.get('v') or []) == set(dch)), None)
        R.check('%s 選項的字照稿 %s' % (t, J(dch)), mi is not None, J([x['v'] for x in dl if x.get('k') == 'choose']))
        if mi is not None and mi + 1 < len(dl) and dl[mi + 1].get('k') == 'pick':
            chosen = dl[mi]['v'][dl[mi + 1]['v']]; c = next((c for c in ds['choices'] if RF(c['t']) == chosen), {})
            nxt = next((i for i in range(mi + 2, len(dl)) if dl[i].get('k') == 'choose'), len(dl))
            after = [x['v'] for x in dl[mi + 2:nxt] if x.get('k') == 'say']; re_ = lns(c.get('re'))
            R.check('%s 選「%s」以後她的回話照稿' % (t, chosen), after[:len(re_)] == re_, '期望 %s；實際 %s' % (J(re_), J(after[:len(re_) + 1])))
            fxe = [x for x in dl[mi + 2:nxt + 1] if x.get('k') == 'fx' and x.get('id') == WHO]
            R.check('%s 選「%s」的 fx＝稿 %s' % (t, chosen, J(c.get('fx'))), (not c.get('fx') and not fxe) or (bool(fxe) and fxe[0].get('fx') == c.get('fx')), J([[x.get('fx'), x.get('ret')] for x in fxe]))
            ms = [m for m in (ds.get('mem'), c.get('mem')) if m]
            if ms:
                got = await pg.evaluate(MEM_JS, {'w': WHO, 'ms': ms}); r['mem'] = got
                R.check('%s 記憶 %s 記下來' % (t, J(ms)), all(x[1] for x in got), J(got))
        R.check('%s 說完（沒有 %d 秒沒進展）' % (t, STUCK_S), dr.get('done') and not dr.get('stuck'), J({k_: dr.get(k_) for k_ in ('done', 'stuck', 'secs')}))
        R.check('%s 沒有 undefined' % t, not [x for x in dl if x.get('k') in ('say', 'cap') and re.search(r'undefined|\[object|NaN', str(x['v']))], '')
        R.check('%s 沒有 JS 例外' % t, len(errs) == e0, J(errs[e0:e0 + 3]))
        R.note('%s 原文：%s' % (t, J(says)))
        open(os.path.join(OUT, 'te2.json'), 'w', encoding='utf-8').write(J(RESULT))


async def main():
    print('CC TE2（沛珊第一批：大一上階梯前三層）：SHA %s；CASES %s；Playwright ≠ iPhone' % (SHA or '?', ','.join(CASES)), flush=True)
    open(LINES_TXT, 'a', encoding='utf-8').write('\n######## %s SHA=%s ########\n' % (time.strftime('%Y-%m-%d %H:%M:%S'), SHA))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        F = {'ps_ladder': case_ladder}
        for c in CASES:
            if c not in F: R.check('[%s] 認得這個 case' % c, False, J(list(F))); continue
            try: await F[c](pg, cdp, errs)
            except Exception as e: R.check('[%s] 沒有中斷' % c, False, repr(e)[:300])
        R.check('全程沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    RESULT['fails'] = R.fails
    open(os.path.join(OUT, 'te2.json'), 'w', encoding='utf-8').write(J(RESULT))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
