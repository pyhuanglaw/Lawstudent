"""CC-B（帳號 B）11-07：AA613-OPENING-ACTS-1103（BB-B 20:34；5becbf4e8，head 82c6d4771）——BB-B 自己測 1～3，這支做 ④～⑨。台詞一字對照 src/aa613_3d.js 的 AA613.L、club_fair.js。
存檔＝使用者 10-18 實測（企劃線 claude/cool-heisenberg-o8kuqx docs/story_planning/qa_saves/）：d18＝8/29 22:42 宿舍、d15＝9/1 12:12 教室；路徑用 SAVE18、SAVE15 環境變數給。
跳日期＝【前置】：改 G.day／G.weekday／G.hour，GAME.enter(區域, 位置)（不重新讀檔，存檔裡的人際、群組照舊）。手機回覆用 PHONE.answer(G, id, 選項)（手機上點選項按鈕的同一個函式）＝【捷徑】標示。
STEPS（逗號分隔，預設 ceremony,choir,booth）：
  ceremony ⑨ d18 → 8/31 13:55 宿舍門廳 → 14:00 典禮自動演：地點字幕、第一句旁白「（你和柏翰一起走過去。）」（STORY.knows(柏翰) 才有）
  choir    ④ d15 → 9/5 20:55（等 21:10 第七小隊群組 aa613_squad）→ 9/6 11:05 校園合唱團攤位：找沛珊說話＝ev_aa613_choir（你填了什麼？→ 填過的社團／還沒。→ 我想去看熱舞。十一點半。）；再找一次不重演
  booth    ⑤ 同一天走到系籃攤位、跟攤位說話：學長的話＝club_fair.js BOOTHS basketball.say（含 AA_613 2-2 多的兩句）
每項：逐字台詞（說的人、句子）、地點字幕、截圖、GAME.walkFallbacks、JS 例外。判定＝BB。
用法：LW_TESTS=<wt>/tests SAVE18=… SAVE15=… [STEPS=…] python3 cc_aa613_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
STEPS = [s_ for s_ in (os.environ.get('STEPS') or 'ceremony,choir,booth').split(',') if s_]
R = L.Run('aa613', OUT); D.setup(R, OUT)
SAVE18, SAVE15 = os.environ.get('SAVE18'), os.environ.get('SAVE15')
PS, XC, BH, ZHE = 'classmate_peishan', 'classmate_xinci', 'classmate_bohan', 'zhe'

CAP = r"""(()=>{ const t=document.body.innerText||''; const m=t.match(/\d{1,2}:\d{2} · [^\n]{1,20}/); const tc=[...document.querySelectorAll('[id*=title i],[class*=title i]')].filter(e=>e.offsetParent&&/·/.test(e.innerText||'')).map(e=>e.innerText.trim()).slice(0,2); return {line:m?m[0]:null, cards:tc}; })()"""


async def load_save(pg, path, tag):
    sv = json.load(open(path, encoding='utf-8'))
    R.setup('%s 【前置】讀使用者 10-18 的存檔 %s（day %s %.2f %s）' % (tag, os.path.basename(path), sv.get('day'), sv.get('hour', 0), sv.get('zone')))
    await L.load_state(pg, sv, quiet_phone=True); await pg.wait_for_timeout(5000); await L.close_panels(pg, None)
    return sv


async def jump(pg, cdp, tag, key, h, zone, pos=None):
    d = await pg.evaluate("(k=>STORY.dayOfKey(k))('%s')" % key)
    R.setup('%s 【前置】跳到 %s %.2f（G.day=%s），GAME.enter(%s%s)' % (tag, key, h, d, zone, ', %s' % J(pos) if pos else ''))
    await pg.evaluate("""(a=>{ const G=GAME.G; G.weekday=((G.weekday+(a.d-G.day))%7+7)%7; G.day=a.d; G.hour=a.h; return GAME.enter(a.z, a.p||undefined); })""", {'d': d, 'h': h, 'z': zone, 'p': pos})
    await D.wait_zone(pg, cdp, zone, max_s=40); await pg.wait_for_timeout(3000)
    return d


async def scene(pg, cdp, tag, prefs=(), max_s=120, idle_end=3.0):
    out = {'lines': [], 'choices': [], 'picked': [], 'captions': []}; t0 = time.time(); quiet = None; pi = 0
    while time.time() - t0 < max_s:
        cap = await pg.evaluate(CAP)
        if cap['line'] and cap['line'] not in out['captions']: out['captions'].append(cap['line'])
        s = await L.state(pg)
        if s['choices']:
            quiet = None; bs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.innerText.trim())"); out['choices'].append(bs)
            want = prefs[pi] if pi < len(prefs) else None; pi += 1
            k = next((i for i, t in enumerate(bs) if want and want in t), 0)
            c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button')[i]; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
            await L.touch_tap(cdp, c[0], c[1]); out['picked'].append(bs[k]); await pg.wait_for_timeout(900); continue
        if s['dlg']:
            quiet = None
            for _ in range(40):   # 打完字（GAME.D.typing）
                if not await pg.evaluate("!!(GAME.D&&GAME.D.typing)"): break
                await pg.wait_for_timeout(250)
            dd = await pg.evaluate("(()=>{ const D=GAME.D; const w=D.who; return {t:D.full||'', who:w?(typeof w==='string'?w:(w.name||'')):''}; })()")   # ADV（典禮）時字不在 #dlgText：直接讀 GAME.D
            who, t = dd['who'], dd['t']
            if t and (not out['lines'] or out['lines'][-1] != [who, t]): out['lines'].append([who, t])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if quiet is None: quiet = time.time()
        if time.time() - quiet > idle_end: break
        await pg.wait_for_timeout(400)
    R.note('%s 對話 %d 句：%s；地點字幕 %s；選項 %s → %s' % (tag, len(out['lines']), J(out['lines']), J(out['captions']), J(out['choices']), J(out['picked'])))
    return out


def has(lines, t, who=None):
    return any(x == t and (who is None or (w or '').find(who) >= 0) for w, x in lines)


async def talk_to(pg, cdp, tag, cid):
    """走到那個人旁邊（1 m 內）→ 互動按鈕 → 點"""
    p = await pg.evaluate("(id=>{ const n=GAME.npc&&GAME.npc[id]; if(!n||!n.obj) return null; return {x:n.obj.position.x, z:n.obj.position.z, vis:n.obj.visible}; })", cid)
    if not R.check('%s %s 在場' % (tag, cid), bool(p), J(p)): return None
    lab = None
    for dx, dz in ((0.0, 1.0), (0.9, 0.6), (-0.9, 0.6), (1.0, 0.0), (-1.0, 0.0), (0.0, -1.0)):   # 社博人多：換幾個方向走到她旁邊，互動按鈕是「和…說話」才點
        await L.go_to(pg, cdp, R, p['x'] + dx, p['z'] + dz, 0.3, '%s 走到 %s 旁邊 (%+.1f,%+.1f)' % (tag, cid, dx, dz), max_s=90)
        await pg.wait_for_timeout(900)
        lab = await pg.evaluate("(()=>{ const e=document.getElementById('interact'); return e&&!e.classList.contains('hide')?e.innerText.trim():null; })()")
        if lab and '說話' in lab: break
    R.note('%s 互動按鈕：%s' % (tag, lab))
    if not lab or '說話' not in lab: return None
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1000)
    return lab


async def wait_msg(pg, tag, max_s=300):
    t0 = time.time()
    while time.time() - t0 < max_s:
        m = await pg.evaluate("(t=>(GAME.G.msgs||[]).filter(m=>m.tag===t).map(m=>[m.th,m.from,m.name||null,m.text]))", tag)
        if m: return m
        await pg.wait_for_timeout(1500)
    return []


async def answer(pg, tag_, ask_id, k, label):
    R.setup('%s 【捷徑】手機回覆 PHONE.answer(G,%s,%d)（點「%s」那個選項的同一個函式）' % (tag_, ask_id, k, label))
    return await pg.evaluate("(a=>{ try{ return PHONE.answer(GAME.G,a.id,a.k); }catch(e){ return 'ERR '+e; } })", {'id': ask_id, 'k': k})


async def use_it(pg, cdp, tag, pred_js, desc):
    """找第一個符合 pred_js（i=>…）的互動點，走過去、按鈕對了就點；回傳那個互動點"""
    it = await pg.evaluate("(()=>{ const f=%s; const i=GAME.E.interactables.find(i=>!i.hidden&&f(i)); return i?{label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv||0}:null; })()" % pred_js)
    if not R.check('%s 找得到「%s」' % (tag, desc), bool(it), J(await pg.evaluate("GAME.E.interactables.filter(i=>!i.hidden).map(i=>i.label).slice(0,40)"))): return None
    await L.go_to(pg, cdp, R, it['x'], it['z'], 0.35, '%s 走到「%s」' % (tag, it['label']), max_s=150, lv=it['lv']); await pg.wait_for_timeout(900)
    lab = await pg.evaluate("(()=>{ const e=document.getElementById('interact'); return e&&!e.classList.contains('hide')?e.innerText.trim():null; })()")
    R.note('%s 互動按鈕：%s（要的是「%s」）' % (tag, lab, it['label']))
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1000)
    return it


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC AA613 開學活動 ④～⑨：SHA=%s（worktree 實際 %s）；STEPS=%s；Playwright 手機模擬 ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?', STEPS), flush=True)
    rec = {'sha': real}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if not R.check('遊戲載入', ok, ''): await b.close(); return
        await pg.evaluate("localStorage.clear()")
        AL = await pg.evaluate("AA613.L")
        await pg.evaluate("(()=>{ if(GAME._ccSayWrap) return; const f=GAME.say; window.__says=[]; GAME.say=function(who,text,opts){ try{ window.__says.push([who?(typeof who==='string'?who:(who.name||'')):'', String(text), +(+GAME.G.hour).toFixed(3)]); }catch(e){} return f.apply(this,arguments); }; GAME._ccSayWrap=true; })()")   # 只記不改：每一句 GAME.say（典禮 ADV 的字不在 #dlgText，對話框抓不到的也記得到）
        try:
            if 'ceremony' in STEPS:
                tag = '[⑨典禮]'
                await load_save(pg, SAVE18, tag)
                kb = await pg.evaluate("(id=>STORY.knows(id,GAME.G))", BH)
                R.note('%s 存檔裡認不認識柏翰（STORY.knows）：%s' % (tag, kb))
                await pg.evaluate('window.__says=[]'); await jump(pg, cdp, tag, '2025-08-31', 13 + 55 / 60, 'dorm_hall')
                wf0 = await pg.evaluate("GAME.walkFallbacks||0")
                t0 = time.time()
                while time.time() - t0 < 120 and not await pg.evaluate("!!(GAME.G.flags||{}).CEREMONY_Y1"): await pg.wait_for_timeout(1000)
                sc = await scene(pg, cdp, tag, max_s=240, idle_end=15)
                await R.shot(pg, 'ceremony_after')
                says = await pg.evaluate("(window.__says||[]).filter(x=>x[2]>=13.9)")
                R.note('%s GAME.say 記到的（14:00 以後）：%s' % (tag, J(says[:12])))
                if says: sc['lines'] = [[w, t] for w, t, _ in says]
                first = sc['lines'][0] if sc['lines'] else None
                if kb: R.check('%s 認識柏翰：典禮第一句旁白＝「%s」' % (tag, AL['ceremony']), bool(first) and first[1] == AL['ceremony'] and not first[0], J(sc['lines'][:3]))
                else: R.check('%s 不認識柏翰：沒有「%s」' % (tag, AL['ceremony']), not has(sc['lines'], AL['ceremony']), J(sc['lines'][:3]))
                R.check('%s 典禮演了（CEREMONY_Y1）' % tag, await pg.evaluate("!!(GAME.G.flags||{}).CEREMONY_Y1"), '')
                rec['ceremony'] = {'knowsBohan': kb, 'scene': sc, 'walkFallbacks': (await pg.evaluate("GAME.walkFallbacks||0")) - wf0}
            if 'choir' in STEPS or 'booth' in STEPS:
                tag = '[④合唱團]'
                await load_save(pg, SAVE15, tag)
                kn = await pg.evaluate("(a=>a.map(id=>[id,STORY.knows(id,GAME.G)]))", [PS, XC, ZHE])
                fd = await pg.evaluate("(()=>{ const d=AA613.fairDay(GAME.G); return [d, CALENDAR.dateOf?CALENDAR.dateOf(d):null]; })()")
                R.note('%s 認識：%s；社博那天 AA613.fairDay＝%s；在第七小隊群組：%s' % (tag, J(kn), J(fd), await pg.evaluate("PHONE.inGroup(GAME.G,'camp_squad_y1')")))
                await jump(pg, cdp, tag, '2025-09-05', 20 + 55 / 60, 'dorm')
                t0 = time.time()
                while time.time() - t0 < 240 and not await pg.evaluate("(GAME.G.msgs||[]).some(m=>m.tag==='aa613_squad')"): await pg.wait_for_timeout(1500)   # PHONE.sent 排進佇列就算：等真的送到 G.msgs
                sq = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>m.tag==='aa613_squad'||m.tag==='aa613_zhe_fair').map(m=>[m.tag,m.th,m.from,m.text,m.h!=null?m.h:m.at]))()")
                R.note('%s 9/5 21:00 前後的手機：%s' % (tag, J(sq)))
                R.check('%s 9/5 21:10 第七小隊群組：芯慈、沛珊各一則（逐字）' % tag, any(x[3] == AL['squad'][0][1] for x in sq) and any(x[3] == AL['squad'][1][1] for x in sq), J(sq))
                await L.close_panels(pg, cdp)
                await jump(pg, cdp, tag, '2025-09-06', 11 + 5 / 60, 'campus', {'x': -73.6, 'z': 6.0, 'yaw': math.pi})
                wf0 = await pg.evaluate("GAME.walkFallbacks||0")
                pos = await pg.evaluate("(a=>a.map(id=>{ const n=GAME.npc&&GAME.npc[id]; return [id, n&&n.obj?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2)]:null]; }))", [PS, XC])
                R.note('%s 11:05 沛珊、芯慈的位置：%s（AA613.SPOT ps (-74.9,3.0)、xc (-72.3,3.0)）' % (tag, J(pos)))
                if 'choir' in STEPS:
                    lab = await talk_to(pg, cdp, tag, PS)
                    sc = await scene(pg, cdp, tag + ' 第一次')
                    await R.shot(pg, 'choir_first')
                    clubs = await pg.evaluate("(()=>Object.keys(GAME.G.flags||{}).filter(k=>/^CLUB_/.test(k)&&GAME.G.flags[k]))()")
                    R.note('%s 填過的社團旗標：%s' % (tag, J(clubs)))
                    R.check('%s ev_aa613_choir：沛珊「%s」→ 你的回答 → 沛珊「%s」' % (tag, AL['choir']['ask'], AL['choir']['dance']), has(sc['lines'], AL['choir']['ask']) and has(sc['lines'], AL['choir']['dance']), J(sc['lines']))
                    if not clubs: R.check('%s 一個都沒填：你說「%s」' % (tag, AL['choir']['none']), has(sc['lines'], AL['choir']['none']), J(sc['lines']))
                    lab2 = await talk_to(pg, cdp, tag + ' 再找一次', PS)
                    sc2 = await scene(pg, cdp, tag + ' 再找一次')
                    R.check('%s 再找一次不重演（沒有「%s」）' % (tag, AL['choir']['ask']), not has(sc2['lines'], AL['choir']['ask']), J(sc2['lines']))
                    rec['choir'] = {'know': kn, 'squad': sq, 'pos': pos, 'first': sc, 'again': sc2, 'clubs': clubs, 'walkFallbacks': (await pg.evaluate("GAME.walkFallbacks||0")) - wf0}
                if 'booth' in STEPS:
                    tag = '[⑤系籃攤位]'
                    bs = await pg.evaluate("(()=>{ const b=CLUB_FAIR.BOOTHS.find(x=>x.id==='basketball'); return b?{say:b.say, who:b.who, pos:CLUB_FAIR.POS.basketball}:null; })()")
                    R.note('%s club_fair.js basketball：%s' % (tag, J(bs)))
                    it = await pg.evaluate("(()=>{ const i=GAME.E.interactables.filter(i=>!i.hidden&&/系學會/.test(i.label||'')&&!/練球/.test(i.label||'')).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2)})); return i; })()")   # 攤位＝「法律系系學會（系籃）」（不是「系籃練球」那個點）
                    R.note('%s 系籃攤位的互動點：%s' % (tag, J(it)))
                    if R.check('%s 找得到系籃攤位' % tag, bool(it), ''):
                        await L.go_to(pg, cdp, R, it[0]['x'], it[0]['z'] + 0.6, 0.3, tag + ' 走到攤位前', max_s=150); await pg.wait_for_timeout(900)
                        lab = await pg.evaluate("(()=>{ const e=document.getElementById('interact'); return e&&!e.classList.contains('hide')?e.innerText.trim():null; })()")
                        R.note('%s 互動按鈕：%s' % (tag, lab))
                        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1000)
                        sc = await scene(pg, cdp, tag, prefs=['先看看', '不用', '再說'])
                        await R.shot(pg, 'booth_basketball')
                        said = [x for w, x in sc['lines'] if '學長' in (w or '')]
                        R.check('%s 學長的話＝BOOTHS basketball.say 全部（含 AA_613 2-2 多的兩句），一字照抄' % tag, bool(bs) and all(x in said for x in bs['say']), J({'expected': bs and bs['say'], 'said': said}))
                        rec['booth'] = {'data': bs, 'scene': sc}
            if any(x in STEPS for x in ('lib_ontime', 'lib_late')):
                for mode in [m for m in ('lib_ontime', 'lib_late') if m in STEPS]:
                    tag = '[⑥法圖 %s]' % ('準時' if mode == 'lib_ontime' else '晚到')
                    await load_save(pg, SAVE15, tag)
                    days = await pg.evaluate("AA613.lecDays()"); d = days[0] if days else None
                    R.note('%s 講座日子 AA613.lecDays＝%s；認識芯慈 %s' % (tag, J(days), await pg.evaluate("(id=>STORY.knows(id,GAME.G))", XC)))
                    await jump(pg, cdp, tag, '2025-09-23', 20 + 55 / 60, 'dorm')
                    tg = 'aa613_xc_lib_%s' % d
                    m = await wait_msg(pg, tg)
                    R.check('%s 9/23 21:00 芯慈私訊兩則（逐字）' % tag, [x[3] for x in m] == AL['xcLib']['dm'], J(m))
                    await L.close_panels(pg, cdp)
                    res = await answer(pg, tag, tg, 0, AL['xcLib']['opts'][0])
                    fl = await pg.evaluate("(GAME.G.flags||{}).AA613_XC_LIB")
                    R.check('%s 回「好。」＝AA613_XC_LIB＝講座那天' % tag, fl == d, J([res, fl, d]))
                    wf0 = await pg.evaluate("GAME.walkFallbacks||0")
                    if mode == 'lib_ontime':
                        await jump(pg, cdp, tag, '2025-09-24', 15 + 18 / 60, 'wancai')
                        xp = await pg.evaluate("(id=>{ const n=GAME.npc&&GAME.npc[id]; return n&&n.obj?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2)]:null; })", XC)
                        R.note('%s 15:18 萬才館大廳：芯慈在 %s（AA613.SPOT.door (-6.2,5.6)）' % (tag, J(xp)))
                        await L.go_to(pg, cdp, R, -6.2 + 1.2, 5.6, 0.5, tag + ' 走到法圖門口', max_s=150)
                        sc = await scene(pg, cdp, tag + ' 法圖門口', max_s=60, idle_end=4)
                        await R.shot(pg, 'lib_door')
                        R.check('%s 法圖門口芯慈「%s」' % (tag, AL['xcLib']['here']), has(sc['lines'], AL['xcLib']['here']), J(sc['lines']))
                        await pg.evaluate("GAME.G.hour=Math.max(GAME.G.hour,15+27/60)")
                        R.setup('%s 【前置】時間撥到 15:27，GAME.enter(lawlib)（法圖門）' % tag)
                        await pg.evaluate("GAME.enter('lawlib')"); await D.wait_zone(pg, cdp, 'lawlib', max_s=40); await pg.wait_for_timeout(3000)
                    else:
                        await jump(pg, cdp, tag, '2025-09-24', 15 + 35 / 60, 'lawlib')
                    # 講座＝走進討論室 A、坐「坐下（討論室）」，坐下的選單裡有「參加：法律資料怎麼查」（lib_dbg 11-07 21:4x：討論室 A 四個座位，芯慈先坐了一個）
                    it = await use_it(pg, cdp, tag, "i=>i.seat&&i.seat.room==='discA'&&!(GAME.E.npcs||[]).some(n=>n&&n.seat&&Math.hypot(n.seat.x-i.seat.x,n.seat.z-i.seat.z)<0.3)", '討論室 A 的空座位')
                    await pg.evaluate("window.__says=[]")
                    sc = await scene(pg, cdp, tag + ' 講座', prefs=['法律資料', '參加', '聽'], max_s=300, idle_end=8)
                    says = await pg.evaluate("window.__says||[]")
                    if says: sc['lines'] = [[w, t] for w, t, _ in says]
                    pos = await pg.evaluate("(id=>{ const P=GAME.E.player, n=GAME.npc&&GAME.npc[id]; const f=o=>o?[+o.x.toFixed(2),+o.z.toFixed(2)]:null; return {player:f(P.obj.position), playerSeat:P.seat?f(P.seat):null, xc:n&&n.obj?f(n.obj.position):null, xcSeat:n&&n.seat?f(n.seat):null, xcPose:n?n.pose:null, zone:GAME.G.zone}; })", XC)
                    await R.shot(pg, 'lib_lecture_' + mode)
                    R.note('%s 講座時位置：%s' % (tag, J(pos)))
                    late = '（她看到你，指了指旁邊的空位。）'
                    if mode == 'lib_late': R.check('%s 晚到：旁白「%s」一次' % (tag, late), sum(1 for _, x in sc['lines'] if x == late) == 1, J(sc['lines']))
                    else: R.check('%s 準時：沒有晚到那一句' % tag, not has(sc['lines'], late), J(sc['lines']))
                    ok_beside = bool(pos['playerSeat'] and pos['xcSeat'] and math.hypot(pos['playerSeat'][0] - pos['xcSeat'][0], pos['playerSeat'][1] - pos['xcSeat'][1]) < 1.6)
                    R.check('%s 聽講座時芯慈坐在你旁邊（兩個座位 < 1.6 m）' % tag, ok_beside, J(pos))
                    rec[mode] = {'days': days, 'dm': m, 'scene': sc, 'pos': pos, 'walkFallbacks': (await pg.evaluate("GAME.walkFallbacks||0")) - wf0}
            if 'guitar' in STEPS:
                tag = '[⑦吉他社群組]'
                await load_save(pg, SAVE15, tag)
                await jump(pg, cdp, tag, '2025-09-06', 11.0, 'campus', {'x': -84.4, 'z': 0.5, 'yaw': math.pi})
                it = await use_it(pg, cdp, tag, "i=>/吉他/.test(i.label||'')", '吉他社攤位')
                sc0 = await scene(pg, cdp, tag + ' 攤位', prefs=['填', '加入', '寫', '好'])
                joined = await pg.evaluate("!!(GAME.G.flags||{}).CLUB_club_guitar")
                R.check('%s 在社博吉他社攤位填了表（CLUB_club_guitar）' % tag, joined, J(sc0['picked']))
                fs = await pg.evaluate("(()=>{ const d=AA613.firstSession(GAME.G,'club_guitar'); return [d, CALENDAR.dateOf(d)&&CALENDAR.dateOf(d).key]; })()")
                R.note('%s 吉他社第一次社課：%s' % (tag, J(fs)))
                prev = await pg.evaluate("(d=>CALENDAR.dateOf(d-1).key)", fs[0])
                await jump(pg, cdp, tag, prev, 20 + 55 / 60, 'dorm')
                m = await wait_msg(pg, 'aa613_grp_club_guitar')
                R.check('%s 第一次社課前一天 21:00 群組 g:guitar、學長「%s」' % (tag, AL['clubGrp']['club_guitar']), bool(m) and m[0][0] == 'g:guitar' and m[0][3] == AL['clubGrp']['club_guitar'], J(m))
                await L.close_panels(pg, cdp)
                rec['guitar'] = {'first': fs, 'msg': m, 'booth': sc0}
            if 'ball' in STEPS:
                tag = '[⑧系籃第一次練球]'
                await load_save(pg, SAVE15, tag)
                fs = await pg.evaluate("(()=>{ const d=AA613.firstSession(GAME.G,'dept_basketball'); return [d, CALENDAR.dateOf(d)&&CALENDAR.dateOf(d).key]; })()")
                R.note('%s 第一次練球：%s；填過系籃 %s' % (tag, J(fs), await pg.evaluate("!!(GAME.G.flags||{}).CLUB_dept_basketball")))
                prev = await pg.evaluate("(d=>CALENDAR.dateOf(d-1).key)", fs[0])
                await jump(pg, cdp, tag, prev, 20 + 55 / 60, 'dorm')
                m = await wait_msg(pg, 'aa613_ball_zhe')
                R.check('%s 前一天 21:00 阿哲私訊兩則（逐字）' % tag, [x[3] for x in m] == AL['ball']['dm'], J(m))
                await L.close_panels(pg, cdp)
                res = await answer(pg, tag, 'aa613_ball_zhe', 0, AL['ball']['opts'][0])
                R.check('%s 回「好，我去看看。」＝AA613_BALL_GO' % tag, await pg.evaluate("(GAME.G.flags||{}).AA613_BALL_GO") == fs[0], J(res))
                await jump(pg, cdp, tag, fs[1], 17 + 25 / 60, 'campus', {'x': 3.3, 'z': -108.0, 'yaw': math.pi})
                zp = await pg.evaluate("(id=>{ const n=GAME.npc&&GAME.npc[id]; return n&&n.obj?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),GAME.G.zone]:null; })", ZHE)
                R.note('%s 17:25 阿哲在 %s' % (tag, J(zp)))
                it = await use_it(pg, cdp, tag, "i=>/練球|系籃/.test(i.label||'')", '系籃練球')
                sc = await scene(pg, cdp, tag, prefs=['練球', '參加', '去', '好'], max_s=240, idle_end=4)
                await R.shot(pg, 'ball_first')
                ds = await pg.evaluate("CLUB_FAIR.DOOR_SAY_BY.dept_basketball")
                R.check('%s 學長兩句（DOOR_SAY_BY，逐字）' % tag, all(has(sc['lines'], t, w) for w, t in ds), J({'expected': ds, 'got': sc['lines']}))
                R.check('%s 選了「好，我去看看。」、阿哲在場：阿哲「%s」' % (tag, AL['told']), has(sc['lines'], AL['told']), J({'zhe': zp, 'lines': sc['lines']}))
                rec['ball'] = {'first': fs, 'dm': m, 'zhe': zp, 'scene': sc}
        except Exception as ex: R.check('探針沒有例外', False, repr(ex)[:400])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        rec['walkFallbacksTotal'] = await pg.evaluate("GAME.walkFallbacks||0")
        R.note('GAME.walkFallbacks 全部 %s' % rec['walkFallbacksTotal'])
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'aa613.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
