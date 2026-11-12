"""CC-C 11-13：CANON_SIDE（BB-C 02:40；BB_399 §4 新遊戲開局的旁支截圖，CANON_NEWGAME 那條路上拍不到的）。只拍、只記，判定歸 BB。
PARTS（逗號分隔，預設 OPEN,PE,SOCLIB）：
  OPEN   標題「從法律系開始」照玩家點過開場，到第一次空下來：祐廷正面、背面各一張（不藏人；看衣服、有沒有系外套）；
         宿舍（第一次空下來如果在宿舍）每張椅子 1.2 m 近照（看椅背有沒有外套）＋那一區的 NPC 清單。
  PE     【前置／捷徑】讀檔到 2025-09-01（週一）13:00 宿舍 → 手機「今天」按體育那一堂「直接去上課」→ 換上運動服（CLS.peWear 有值）那一刻正面、背面各一張。
  SOCLIB 【前置／捷徑】讀檔進社科院圖書館 2025-10-22 14:00：數人（E.npcs＋E.extras 看得到的）＋正上方俯視一張；
         再讀檔到社科院門口（圖書館出口的 spawn）15:30：15 m 內數人＋俯視一張。
  CAMPUS 【前置／捷徑】讀檔到校園 2025-10-22 14:00：祐廷正面、背面全身（LAWWW-C 11-13 CANON_JACKET_MODEL ①：VRM 拿掉舊外套網格）。
  CHAIR  【前置／捷徑】讀檔進宿舍 203（dorm）2025-10-22 14:00：每張椅子 1.2 m 近照＋正側面各一張（②：宿舍 GLB 拿掉椅背外套節點，看有沒有怪影子、缺面）。
南洋下班後 5 秒內的 toast 在 cc_shift_shots_probe（TOAST5=1）那一支，不在這裡。
CC_02 清單 2026-11-13：1✓（OPEN 用新遊戲預設；PE、SOCLIB 讀檔標【前置／捷徑】，日期挑週一體育、平日 14:00／15:30） 2✓（體育那一堂從 CLS.dayItems 找 c.id 開頭 pe_、椅子從 interactables seat、出口從 exit 讀） 3n/a（每一項只有一個目標） 4✓（手機按鈕照 data-go） 5✓（上課走手機「今天」，不走路） 6✓（每一步等 settle、PE 等 peWear 最多 120 秒） 7✓（lint、node 驗 JS） 8n/a（不判數字，只數人給 BB） 9✓（祐廷的照片不藏人，其他俯視照藏 HUD） 10✓（開場對話點過、選項選第一個；上課途中的劇情照演） 11✓（SHA 40 碼、ENV 沒有「|」） 12✓（FAIL_SETUP 檢查：真的空下來、真的換上運動服、真的在社科院） 13✓（上課照遊戲的流程，卡住 240 秒記下來）
用法：LW_TESTS=<wt>/tests SHA=<sha> [PARTS=OPEN,PE,SOCLIB] python3 cc_canon_side_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
PARTS = [p for p in (os.environ.get('PARTS') or 'OPEN,PE,SOCLIB').split(',') if p]
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('canon_side', OUT); D.setup(R, OUT)
RES = {'sha': SHA}

PL = r"""(()=>{ const P=GAME.E.player, o=P.obj, p=o.position; return {x:+p.x.toFixed(2), y:+p.y.toFixed(2), z:+p.z.toFixed(2), yaw:+o.rotation.y.toFixed(3), lv:P.lv|0, zone:GAME.G.zone}; })()"""
PEOPLE = r"""((a)=>{ const E=GAME.E, P=E.player.obj.position, out=[]; const vis=o=>{ for(let q=o; q; q=q.parent) if(q.visible===false) return false; return true; };
  for(const [k,arr] of [['npc',E.npcs||[]],['extra',E.extras||[]]]) for(const n of arr){ const o=n&&(n.obj||n.mesh||n.group); if(!o||!vis(o)) continue; const p=o.position, d=Math.hypot(p.x-P.x,p.z-P.z);
    if(a.r&&d>a.r) continue; out.push({k, id:n.id||n.charId||n.name||'', x:+p.x.toFixed(2), z:+p.z.toFixed(2), d:+d.toFixed(1), seat:!!n.seat}); }
  return {n:out.length, people:out.slice(0,60)}; })"""


async def player_shots(pg, cdp, tag):
    p = await pg.evaluate(PL)
    import math
    fx, fz = math.sin(p['yaw']), math.cos(p['yaw'])
    head = [p['x'], p['y'] + 1.1, p['z']]
    for nm, sg in (('front', 1), ('back', -1)):
        eye = [round(p['x'] + fx * 2.4 * sg, 2), p['y'] + 1.5, round(p['z'] + fz * 2.4 * sg, 2)]
        await D.user_shot(pg, cdp, '%s_%s' % (tag, nm), {'eye': eye, 'look': head, 'lens': 35}, hide_player=False)
    R.note('%s 祐廷 %s' % (tag, J(p)))
    return p


async def play_until_free(pg, cdp, max_s=900):
    t0 = time.time(); picks = []; quiet = 0
    while time.time() - t0 < max_s:
        q = await D.st(pg)
        if q['choices']:
            picks.append(q['choices'][0]); await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()"); await pg.wait_for_timeout(800); quiet = 0; continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); quiet = 0; continue
        if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp); continue
        if not q['busy']:
            quiet += 1
            if quiet >= 4: return True, picks
        await pg.wait_for_timeout(500)
    return False, picks


async def part_open(pg, cdp):
    await pg.evaluate("localStorage.clear()"); R.setup('OPEN【前置】localStorage.clear()（乾淨的玩家）')
    await pg.goto(URL); await L.wait_loaded(pg, 600)
    if not R.check('OPEN 標題有「從法律系開始」', await L.tap(pg, cdp, '#btnNewLaw'), ''): return
    for _ in range(240):
        if await pg.evaluate("!!(GAME.G&&document.getElementById('titleScreen').classList.contains('hide'))"): break
        await pg.wait_for_timeout(500)
    ok, picks = await play_until_free(pg, cdp)
    q = await D.st(pg); R.note('OPEN 開場選項 %s；第一次空下來 %s' % (J(picks[:12]), J({k: q.get(k) for k in ('zone', 'x', 'z', 'lv')})))
    if not R.check('FAIL_SETUP 檢查：OPEN 開場跑到第一次空下來', ok, J(q)): return
    when = await pg.evaluate("(()=>{ const G=GAME.G; return {key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2), zone:G.zone}; })()")
    RES['open'] = {'when': when, 'player': await player_shots(pg, cdp, 'open_yuting')}
    seats = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; return (GAME.E.interactables||[]).filter(i=>i.seat&&!i.hidden).map(i=>({label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), sx:i.seat.x!=null?+(+i.seat.x).toFixed(2):null, sz:i.seat.z!=null?+(+i.seat.z).toFixed(2):null, lv:i.lv|0, d:+Math.hypot(i.x-P.x,i.z-P.z).toFixed(1)})).sort((a,b)=>a.d-b.d).slice(0,6); })()")
    R.note('OPEN %s 的椅子（近到遠）%s' % (when['zone'], J(seats)))
    for k, sv in enumerate(seats):
        cx, cz = (sv['sx'], sv['sz']) if sv['sx'] is not None else (sv['x'], sv['z'])
        await D.user_shot(pg, cdp, 'open_chair_%d' % (k + 1), {'eye': [cx + 0.9, 1.3, cz + 0.9], 'look': [cx, 0.7, cz], 'lens': 28}, hide_player=True)
    RES['open']['seats'] = seats; RES['open']['people'] = await pg.evaluate(PEOPLE, {'r': 0})


async def part_pe(pg, cdp):
    # 11-13 PC CANON_JACKET_MODEL：9/1 讀檔以後 dayItems 沒有體育＝探針只看一天。改成先掃 9/1～10/27 每一天（CLS.dayItems(G, day)），挑第一個有體育的日子再讀檔
    await D.load_zone(pg, cdp, 'dorm', '2025-09-01', 13.0, wait=8000)
    scan = await pg.evaluate("(()=>{ const G=GAME.G, d0=STORY.dayOfKey('2025-09-01'), out={hit:null, sample:[]}; for(let d=d0; d<d0+57; d++){ let its=[]; try{ its=CLS.dayItems(G,d)||[]; }catch(e){ out.err=String(e).slice(0,80); break; } if(out.sample.length<4&&its.length) out.sample.push([CALENDAR.dateOf(d).key, its.map(x=>x.c&&x.c.id)]); const it=its.find(x=>x.c&&String(x.c.id||'').startsWith('pe_')); if(it){ out.hit={key:CALENDAR.dateOf(d).key, t0:it.t0, ik:it.key}; break; } } return out; })()")
    R.note('PE 掃體育課：%s' % J(scan))
    if not R.check('FAIL_SETUP 檢查：PE 9/1～10/27 找得到有體育課的一天', bool(scan.get('hit')), J(scan)): return
    hit = scan['hit']
    await D.load_zone(pg, cdp, 'dorm', hit['key'], max(8.0, float(hit['t0']) - 1.0), wait=8000)
    R.setup('PE【前置／捷徑】讀檔到 %s %.2f 宿舍（體育 %s 前 1 小時）' % (hit['key'], max(8.0, float(hit['t0']) - 1.0), hit['t0']))
    key = await pg.evaluate("(()=>{ try{ const it=CLS.dayItems(GAME.G).find(x=>x.c&&String(x.c.id||'').startsWith('pe_')); return it?it.key:null; }catch(e){ return null; } })()")
    if not R.check('FAIL_SETUP 檢查：PE 讀檔那一天有體育課', bool(key), J(hit)): return
    await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="today"]'); await pg.wait_for_timeout(900)
    sel = '#phoneBody [data-go="%s"]' % key
    if not R.check('FAIL_SETUP 檢查：PE 手機「今天」有體育的「直接去上課」', await L.tap(pg, cdp, sel), key): return
    t0 = time.time(); wear = None
    while time.time() - t0 < 240:
        wear = await pg.evaluate("(()=>{ try{ return CLS.peWear||null; }catch(e){ return null; } })()")
        q = await D.st(pg)
        if wear and q['zone'] == 'gym' and not q['dlg'] and not q['choices']: break
        if q['choices']: await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()"); await pg.wait_for_timeout(800); continue
        if q['dlg'] and wear and q['zone'] == 'gym': break   # 上課旁白中也可以拍
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        await pg.wait_for_timeout(600)
    q = await D.st(pg)
    if not R.check('FAIL_SETUP 檢查：PE 進了體育館、換上運動服（CLS.peWear）', bool(wear) and q['zone'] == 'gym', J({'wear': wear, 'zone': q['zone']})): await pg.screenshot(path=os.path.join(OUT, 'pe_fail.png')); return
    await pg.screenshot(path=os.path.join(OUT, 'pe_game.png'))
    RES['pe'] = {'key': key, 'wear': wear, 'player': await player_shots(pg, cdp, 'pe_yuting')}
    # 脫下（LAWWW-C CANON_JACKET_MODEL ①）：課照演完、CLS.peWear 變回空、空下來以後再拍一次正面、背面
    t0 = time.time()
    while time.time() - t0 < 300:
        w = await pg.evaluate("(()=>{ try{ return CLS.peWear||null; }catch(e){ return null; } })()")
        q = await D.st(pg)
        if not w and not q['dlg'] and not q['choices'] and not q['busy']: break
        if q['choices']: await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()"); await pg.wait_for_timeout(800); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        await pg.wait_for_timeout(600)
    w = await pg.evaluate("(()=>{ try{ return CLS.peWear||null; }catch(e){ return null; } })()")
    if R.check('FAIL_SETUP 檢查：PE 下課以後運動服脫下（CLS.peWear 空）', not w, J(w)):
        RES['pe']['after'] = await player_shots(pg, cdp, 'pe_after_yuting')


async def part_campus(pg, cdp):
    await D.load_zone(pg, cdp, 'campus', '2025-10-22', 14.0, wait=8000)
    R.setup('CAMPUS【前置／捷徑】讀檔到校園 2025-10-22 14:00（出生點）')
    q = await D.st(pg)
    if not R.check('FAIL_SETUP 檢查：CAMPUS 讀到校園', q['zone'] == 'campus', J(q)): return
    await pg.wait_for_timeout(3000)
    RES['campus'] = {'player': await player_shots(pg, cdp, 'campus_yuting')}


async def part_chair(pg, cdp):
    await D.load_zone(pg, cdp, 'dorm', '2025-10-22', 14.0, wait=8000)
    R.setup('CHAIR【前置／捷徑】讀檔進宿舍 203（dorm）2025-10-22 14:00')
    q = await D.st(pg)
    if not R.check('FAIL_SETUP 檢查：CHAIR 讀到宿舍', q['zone'] == 'dorm', J(q)): return
    await pg.wait_for_timeout(3000)
    seats = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>i.seat&&!i.hidden).map(i=>({label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), sx:i.seat.x!=null?+(+i.seat.x).toFixed(2):null, sz:i.seat.z!=null?+(+i.seat.z).toFixed(2):null, lv:i.lv|0})).slice(0,8))()")
    R.note('CHAIR 宿舍的椅子 %s' % J(seats))
    if not R.check('FAIL_SETUP 檢查：CHAIR 宿舍有椅子', bool(seats), ''): return
    for k, sv in enumerate(seats):
        cx, cz = (sv['sx'], sv['sz']) if sv['sx'] is not None else (sv['x'], sv['z'])
        await D.user_shot(pg, cdp, 'chair_%d_a' % (k + 1), {'eye': [cx + 0.9, 1.3, cz + 0.9], 'look': [cx, 0.7, cz], 'lens': 28}, hide_player=True)
        await D.user_shot(pg, cdp, 'chair_%d_b' % (k + 1), {'eye': [cx - 1.0, 1.1, cz - 0.6], 'look': [cx, 0.7, cz], 'lens': 28}, hide_player=True)
    RES['chair'] = seats


async def part_soclib(pg, cdp):
    await D.load_zone(pg, cdp, 'soclib', '2025-10-22', 14.0, wait=8000)
    R.setup('SOCLIB【前置／捷徑】讀檔進社科院圖書館 2025-10-22（週三）14:00')
    q = await D.st(pg)
    if not R.check('FAIL_SETUP 檢查：SOCLIB 讀到社科院圖書館', q['zone'] == 'soclib', J(q)): return
    await pg.wait_for_timeout(4000)
    pin = await pg.evaluate(PEOPLE, {'r': 0}); p = await pg.evaluate(PL)
    await D.user_shot(pg, cdp, 'soclib_in_top', {'eye': [p['x'], 14, p['z'] + 0.01], 'look': [p['x'], 0, p['z']], 'lens': 18}, hide_player=False)
    await pg.screenshot(path=os.path.join(OUT, 'soclib_in_game.png'))
    R.note('SOCLIB 圖書館裡 14:00：%d 人 %s' % (pin['n'], J(pin['people'][:20])))
    ex = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(i=>i.exit&&!i.hidden&&i.exit.spawn); return i?{label:i.label, to:i.exit.to, sp:i.exit.spawn}:null; })()")
    RES['soclib'] = {'in_1400': pin, 'exit': ex}
    if not R.check('FAIL_SETUP 檢查：SOCLIB 找得到出口（門外的 spawn）', bool(ex), ''): return
    sp = ex['sp']
    await D.load_zone(pg, cdp, ex['to'], '2025-10-22', 15.5, x=sp['x'], z=sp['z'], yaw=sp.get('yaw', 0.0), wait=8000)
    R.setup('SOCLIB【前置／捷徑】讀檔到社科院門口 %s (%s, %s) 15:30' % (ex['to'], sp['x'], sp['z']))
    await pg.wait_for_timeout(4000)
    pout = await pg.evaluate(PEOPLE, {'r': 15})
    await D.user_shot(pg, cdp, 'soclib_door_top', {'eye': [sp['x'], 22, sp['z'] + 0.01], 'look': [sp['x'], 0, sp['z']], 'lens': 18}, hide_player=False)
    await pg.screenshot(path=os.path.join(OUT, 'soclib_door_game.png'))
    R.note('SOCLIB 門口 15:30（15 m 內）：%d 人 %s' % (pout['n'], J(pout['people'][:20])))
    RES['soclib']['door_1530'] = pout


async def main():
    print('CC CANON_SIDE：SHA %s；PARTS %s；Playwright ≠ iPhone' % (SHA or '?', PARTS), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for part, fn in (('OPEN', part_open), ('PE', part_pe), ('SOCLIB', part_soclib), ('CAMPUS', part_campus), ('CHAIR', part_chair)):
            if part not in PARTS: continue
            try: await fn(pg, cdp)
            except Exception as e:
                R.check('%s 沒有中斷' % part, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash_%s.png' % part))
            await pg.goto(URL); await L.wait_loaded(pg, 600)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'canon_side.json'), 'w', encoding='utf-8').write(J(RES))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
