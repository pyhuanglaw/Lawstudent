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
            for _ in range(40):
                if await pg.evaluate("(()=>{ const n=document.getElementById('dlgNext'); return !n||n.style.visibility!=='hidden'; })()"): break
                await pg.wait_for_timeout(250)
            who = await pg.evaluate("(()=>{ const e=document.getElementById('dlgName'); return e?e.innerText.trim():''; })()")
            t = await pg.evaluate("(()=>{ const e=document.getElementById('dlgText'); return e?e.innerText.trim():''; })()")
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
    await L.go_to(pg, cdp, R, p['x'] + 0.9, p['z'] + 0.6, 0.35, '%s 走到 %s 旁邊' % (tag, cid), max_s=120)
    await pg.wait_for_timeout(900)
    lab = await pg.evaluate("(()=>{ const e=document.getElementById('interact'); return e&&!e.classList.contains('hide')?e.innerText.trim():null; })()")
    R.note('%s 互動按鈕：%s' % (tag, lab))
    if not lab: return None
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1000)
    return lab


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
        try:
            if 'ceremony' in STEPS:
                tag = '[⑨典禮]'
                await load_save(pg, SAVE18, tag)
                kb = await pg.evaluate("(id=>STORY.knows(id,GAME.G))", BH)
                R.note('%s 存檔裡認不認識柏翰（STORY.knows）：%s' % (tag, kb))
                await jump(pg, cdp, tag, '2025-08-31', 13 + 55 / 60, 'dorm_hall')
                wf0 = await pg.evaluate("GAME.walkFallbacks||0")
                t0 = time.time()
                while time.time() - t0 < 120 and not await pg.evaluate("!!(GAME.G.flags||{}).CEREMONY_Y1"): await pg.wait_for_timeout(1000)
                sc = await scene(pg, cdp, tag, max_s=180, idle_end=5)
                await R.shot(pg, 'ceremony_after')
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
                while time.time() - t0 < 180 and not await pg.evaluate("PHONE.sent(GAME.G,'aa613_squad')"): await pg.wait_for_timeout(1500)
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
                    it = await pg.evaluate("(()=>{ const i=GAME.E.interactables.filter(i=>!i.hidden&&(/系籃|系學會/.test(i.label||'')||(i.booth&&/basketball/.test(String(i.booth))))).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2)})); return i; })()")
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
        except Exception as ex: R.check('探針沒有例外', False, repr(ex)[:400])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        rec['walkFallbacksTotal'] = await pg.evaluate("GAME.walkFallbacks||0")
        R.note('GAME.walkFallbacks 全部 %s' % rec['walkFallbacksTotal'])
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'aa613.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
