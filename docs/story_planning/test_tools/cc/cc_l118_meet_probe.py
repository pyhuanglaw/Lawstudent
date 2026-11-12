"""CC-C 11-12：118 巷吃飯時間遇得到同學（BB-C 05:26 ③；SHOP-LIFE-AUDIT-1112／USER_WANTS X356：使用者「118 巷就是要很容易遇到同學，現在店裡甚至都沒有人」）。判定歸 BB。
期望（照程式本身的規格 src/shoplife3d.js 檔頭第 3 點＝LAWWW 整合的 SHOP-LIFE-AUDIT-1112，不是 CC 自己訂的）：
  法律系、學期中、不是考試週、平日 11:45～13:30／17:45～19:30，午餐八位同班同學＋118 巷熟客有機會坐在 118 巷某一間店吃飯（一間最多兩位）；
  走進那間店＝人在、坐著吃、可以照現有的「和他說話」（閒聊階梯）；這一版沒有新台詞（檔頭：「這個檔沒有任何一句台詞」）。
做法（每一餐）：
  【前置／捷徑】讀使用者存檔 tests/fixtures/user_save_day51_1110.json（法律系），日子＝存檔那天以後第一個 SHOPLIFE.dayOk、平日、那個時間名單裡有人在 118 巷的日子；
  區域＝118 巷（lane118）、時間 HOURS（預設 12.25、18.25）；條件事件、手機自動打開關掉。名單用遊戲自己的 SHOPLIFE.who（不是 CC 算的）。
  ① 巷子裡：記看得到的有名字的人。② 名單上的店（最多 MAXSHOP 間）：照玩家走到那間的門、按門進去 → 那個人在不在、看不看得到、坐著沒
  → 走到他旁邊 → 互動鍵是不是「和…」→ 按下去，抄對話（最多 10 句；有選項選第一個）→ 截圖 → 走門出去回巷子。
  ③ 對照：名單上沒有人的一間店，走進去記裡面有沒有名單外的同學（不判）。
輸出：l118_meet_<TAG>.json ＋ run.log ＋ 截圖（meet_<slot>_<zone>_*.png）。
CC_02 清單 2026-11-12：1✓（出現條件全照 SHOPLIFE.dayOk／who：法律系、學期中、不是考試週、平日、時段；日子由遊戲找） 2✓（人、店、時間都從 SHOPLIFE.who 讀；名單空時列出前 30 天每一天為什麼不行） 3✓（店照名單順序試，走不進去換下一間） 4✓（按門、按說話前都看互動鍵的字） 5✓（D.use_exit 進出門；走到人旁邊用站得住的點、分段） 6✓（進店等 3 秒人生出來、最多再等 10 秒） 7✓ 8n/a（不判台詞內容，只記；期望出處＝shoplife3d.js 檔頭） 9✓（截圖不藏玩家：要看玩家和同學的樣子） 10✓（對話照字點、有選項選第一個並記下來） 11✓ 12✓（記「真的進了那間店」zone、人的位置） 13✓（每一步記走門還是捷徑）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> [HOURS=12.25,18.25 MAXSHOP=3] python3 cc_l118_meet_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
SHA = os.environ.get('SHA') or ''
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51_1110.json'
HOURS = [float(h) for h in (os.environ.get('HOURS') or '12.25,18.25').split(',') if h]
MAXSHOP = int(os.environ.get('MAXSHOP') or '3')
R = L.Run('l118_meet_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

FIND_JS = r"""((a)=>{ if(typeof SHOPLIFE==='undefined') return {err:'沒有 SHOPLIFE（這個版本還沒有 SHOP-LIFE-AUDIT）'}; const G=GAME.G, why={};
  for(let d=a.day0; d<a.day0+40; d++){ const wd=CALENDAR.dateOf(d).wd%7; const g=Object.assign({},G,{day:d,weekday:wd,hour:a.h}); const k=CALENDAR.dateOf(d).key;
    if(!SHOPLIFE.dayOk(g,d)){ why[k]='dayOk false'; continue; } if(CALENDAR.weekend(d)||(CALENDAR.holiday&&CALENDAR.holiday(d))){ why[k]='週末／假日'; continue; }
    const who=SHOPLIFE.who(g,a.slot).filter(p=>p.zone.indexOf('l118_')===0&&p.t0<=a.h&&p.t1>=a.h+0.5);
    if(who.length) return {day:d, key:k, wd, who, all:SHOPLIFE.who(g,a.slot)}; why[k]='名單裡沒有人在 118 巷待到 +0.5 小時'; }
  return {day:null, why}; })"""
NPC = r"""((id)=>{ const n=(EVENTS.npcOf?EVENTS.npcOf(id):null)||(GAME.E.npcs||[]).find(q=>q&&q.charId===id), E=GAME.E; if(!n||!n.obj) return null; const p=n.obj.position;
  return {x:+p.x.toFixed(2), z:+p.z.toFixed(2), y:+p.y.toFixed(2), lv:n.lv|0, pose:n.pose||null, seat:n.seat?[+n.seat.x.toFixed(2),+n.seat.z.toFixed(2)]:null, hidden:!!n.hidden, vis:n.obj.visible!==false, name:n.name||id}; })"""
NAMED = r"""(()=>(GAME.E.npcs||[]).filter(n=>n&&n.charId&&n.obj&&n.obj.visible!==false&&!n.hidden).map(n=>[n.charId, n.name||'', +n.obj.position.x.toFixed(1), +n.obj.position.z.toFixed(1), n.pose||'']))()"""
EXITS = r"""(()=>GAME.E.interactables.filter(i=>i.exit&&!i.hidden).map(i=>({label:i.label, to:i.exit.to})))()"""
KNOWS = "((id)=>typeof STORY!=='undefined'&&STORY.knows?!!STORY.knows(id,GAME.G):null)"
NAMEOF = "((id)=>{ try{ return (CHARACTERS[id]&&(CHARACTERS[id].name||CHARACTERS[id].display))||id; }catch(e){ return id; } })"


async def load_fix(pg, cdp, zone, day, wd, hour):
    sv = await pg.evaluate("fetch(%s).then(r=>r.ok?r.json():null)" % J(FIX))
    sv['zone'] = zone; sv.pop('pos', None); sv['day'] = day; sv['hour'] = hour; sv['weekday'] = wd; sv['weather'] = 'clear'
    await pg.evaluate("(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); })", sv)
    await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
    return await D.st(pg)


async def walk_near(pg, cdp, tag, n, r=1.2):
    for rr in (r, r + 0.4, r + 0.8):
        for a in range(0, 360, 30):
            x, z = n['x'] + math.sin(math.radians(a)) * rr, n['z'] + math.cos(math.radians(a)) * rr
            if await pg.evaluate("(([x,z,lv])=>GAME.E.canStand(x,z,0.3,lv))", [x, z, n['lv']]):
                await L.go_to(pg, cdp, R, x, z, 0.35, '%s 走到他旁邊' % tag, max_s=90, lv=n['lv'])
                return await D.settle(pg)
    return None


async def talk(pg, cdp, tag):
    lines, picks = [], []
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(900)
    for _ in range(30):
        q = await D.st(pg)
        if q['choices']:
            picks.append(q['choices'][0]); await L.tap(pg, cdp, '#choices button:nth-child(1)'); await pg.wait_for_timeout(900); continue
        if q['dlg']:
            t = await pg.evaluate("(()=>{ const d=document.getElementById('dlg'); return d?(d.innerText||'').replace('▼ 點一下繼續','').trim():''; })()")
            if t and (not lines or lines[-1] != t): lines.append(t)
            if len(lines) >= 10: break
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not q['busy']: break
        await pg.wait_for_timeout(400)
    for _ in range(12):   # 對話還沒完就點完它（不判內容）
        q = await D.st(pg)
        if q['choices']: await L.tap(pg, cdp, '#choices button:nth-child(1)'); await pg.wait_for_timeout(700); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        break
    return lines, picks


async def meal(pg, cdp, h, res):
    slot = 'lunch' if h < 15 else 'dinner'; tag0 = '[%s %.2f]' % (slot, h)
    day0 = (await pg.evaluate("fetch(%s).then(r=>r.json()).then(s=>s.day)" % J(FIX)))
    f = await pg.evaluate(FIND_JS, {'day0': day0, 'slot': slot, 'h': h})
    if f.get('err'): R.check('%s 這個版本有 SHOPLIFE' % tag0, False, f['err']); return
    if not R.check('%s 存檔那天（day %s）以後 40 天內找得到名單裡有人在 118 巷的平日' % (tag0, day0), f.get('day') is not None, J(f.get('why'))[:800]): return
    R.note('%s 日子 %s（day %s、星期 %s）；SHOPLIFE.who 名單（這一餐全部）%s' % (tag0, f['key'], f['day'], f['wd'], J(f['all'])))
    s = await load_fix(pg, cdp, 'lane118', f['day'], f['wd'], h)
    R.setup('%s 【前置／捷徑】讀使用者存檔 %s，改到 %s %.2f 118 巷（條件事件、手機自動打開關掉）' % (tag0, FIX, f['key'], h))
    if not R.check('%s 讀到 118 巷' % tag0, s['zone'] == 'lane118', J(s)): return
    lane = await pg.evaluate(NAMED); R.note('%s ① 巷子裡看得到的有名字的人：%s' % (tag0, J(lane)))
    await D.shot(pg, 'meet_%s_lane' % slot)
    out = {'slot': slot, 'h': h, 'day': f['day'], 'key': f['key'], 'who': f['who'], 'lane_named': lane, 'shops': []}
    seen = set(); targets = []
    for p in f['who']:
        if p['zone'] in seen: continue
        seen.add(p['zone']); targets.append(p['zone'])
    for zone in targets[:MAXSHOP]:
        ppl = [p['id'] for p in f['who'] if p['zone'] == zone]; tag = '%s %s' % (tag0, zone)
        exs = await pg.evaluate(EXITS); ex = next((e for e in exs if e['to'] == zone), None)
        if not R.check('%s 118 巷有這間的門' % tag, bool(ex), J(exs)[:500]): continue
        s2 = await D.use_exit(pg, cdp, tag, ex['label'][:4], zone)
        if not s2 or s2.get('zone') != zone: continue
        await pg.wait_for_timeout(3000)
        rec = {'zone': zone, 'expect': ppl, 'named_inside': await pg.evaluate(NAMED), 'people': []}
        for pid in ppl:
            nm = await pg.evaluate(NAMEOF, pid); kn = await pg.evaluate(KNOWS, pid); t = '%s %s(%s)' % (tag, nm, pid)
            n = None
            for _ in range(20):
                n = await pg.evaluate(NPC, pid)
                if n and n['vis'] and not n['hidden']: break
                await pg.wait_for_timeout(500)
            pr = {'id': pid, 'name': nm, 'knows': kn, 'npc': n}
            if R.check('%s ② 名單上的人在店裡、看得到' % t, bool(n) and n['vis'] and not n['hidden'], J({'npc': n, 'named_inside': rec['named_inside']})):
                R.note('%s 姿勢 %s、座位 %s' % (t, n['pose'], n['seat']))
                s3 = await walk_near(pg, cdp, t, n)
                q = await D.st(pg); pr['interact'] = q['interact']
                await D.shot(pg, 'meet_%s_%s_%s' % (slot, zone, pid), judge_black=False)
                if R.check('%s 走到他旁邊、互動鍵是「和…」' % t, bool(s3) and q['interact'].startswith('和'), J({k: q[k] for k in ('x', 'z', 'interact')})):
                    lines, picks = await talk(pg, cdp, t); pr['lines'] = lines; pr['picks'] = picks
                    R.check('%s 按下去有對話（認識＝%s）' % (t, kn), bool(lines), J({'lines': lines, 'picks': picks}))
                    R.note('%s 對話全文（抄給 BB）：%s；選了 %s' % (t, J(lines), J(picks)))
            rec['people'].append(pr)
        exs = await pg.evaluate(EXITS); bk = next((e for e in exs if e['to'] == 'lane118'), None)
        if bk: await D.use_exit(pg, cdp, tag + ' 出去', bk['label'][:4], 'lane118')
        out['shops'].append(rec)
    # ③ 對照：名單上沒有人的一間
    cur = (await D.st(pg))['zone']
    if cur == 'lane118':
        exs = await pg.evaluate(EXITS); ctl = next((e for e in exs if e['to'].startswith('l118_') and e['to'] not in seen), None)
        if ctl:
            s4 = await D.use_exit(pg, cdp, tag0 + ' 對照', ctl['label'][:4], ctl['to'])
            if s4 and s4.get('zone') == ctl['to']:
                await pg.wait_for_timeout(3000); out['control'] = {'zone': ctl['to'], 'named_inside': await pg.evaluate(NAMED)}
                R.note('%s ③ 對照 %s（名單上沒有人）裡面有名字的人：%s' % (tag0, ctl['to'], J(out['control']['named_inside'])))
                await D.shot(pg, 'meet_%s_control_%s' % (slot, ctl['to']), judge_black=False)
    res['meals'].append(out)


async def main():
    print('CC 118 巷遇到同學：TAG %s；SHA %s；HOURS %s；Windows＋GPU ≠ iPhone' % (TAG, SHA or '?', HOURS), flush=True)
    res = {'tag': TAG, 'sha': SHA, 'meals': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for h in HOURS:
            try: await meal(pg, cdp, h, res)
            except Exception as e: R.check('[%.2f] 沒有中斷' % h, False, repr(e)[:300])
            open(os.path.join(OUT, 'l118_meet_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
