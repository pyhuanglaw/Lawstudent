"""CC-C 11-14：BUG-SIS-LIB-LOAD-1022（BB-C 01:27 BB_466 ①，發布後）——直接讀檔到總圖 3F 閱覽室（zone library），學姊在不在。只記證據、判定歸 BB。Windows＋GPU ≠ iPhone。
原本的 BUG：BB 10-22 直接讀檔在閱覽室（9/5、9/24 10:00）學姊沒有生成（GAME.npc 沒有 sis，只有以安）；LAWWW 11-04 重現不了；Node 找到唯一會讓她不出現的條件＝沒有 afternoonDone 或 companion＝sis。
做法：每個日子（DAYS，預設 2025-09-05、2025-09-24；HOUR 預設 10）：
  【前置／捷徑】讀檔到 library（條件事件關掉；旗標照 L.load_state 預設，另外記 afternoonDone、companion）→ 等 8 秒 →
  記 GAME.npc 的 key、學姊（GAME.npc.sis／EVENTS.npcOf('sis')／heroine_05）在不在、座標、樓層、作息（SCHED／schedEnt 讀得到就記）、截圖；
  另外再等 8 秒記一次（看是不是晚一點才生）。
CC_02 清單 2026-11-14：1✓（日子照 BUG 原文 9/5、9/24 10:00） 2✓（學姊從遊戲讀：GAME.npc、EVENTS.npcOf，不寫死座標） 3n/a（不挑候選） 4n/a（不按東西） 5n/a（不走路） 6✓（讀檔後等 8 秒、再 8 秒） 7✓（lint、JS node --check） 8✓（只記不判） 9✓（每個日子截圖） 10✓（讀檔關條件事件） 11✓（SHA 40 碼） 12✓（FAIL_SETUP：真的在 library、日期對） 13n/a（不走路）
用法：LW_TESTS=<wt>/tests SHA=<sha> [DAYS=2025-09-05,2025-09-24] [HOUR=10] python3 cc_sis_lib_load_probe.py <url> <out>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
DAYS = [d for d in (os.environ.get('DAYS') or '2025-09-05,2025-09-24').split(',') if d]
HOUR = float(os.environ.get('HOUR') or 10)
R = L.Run('sis_lib_load', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SIS_JS = r"""(()=>{ const G=GAME.G, F=G.flags||{}, r2=v=>+(+v).toFixed(2); const pick=n=>n&&n.obj?{id:n.id||null, charId:n.charId||null, x:r2(n.obj.position.x), z:r2(n.obj.position.z), lv:n.lv|0, hidden:!!n.hidden, visible:n.obj.visible!==false, pose:n.pose||null, seat:!!n.seat}:null;
  let viaEv=null; try{ viaEv=typeof EVENTS!=='undefined'&&EVENTS.npcOf?pick(EVENTS.npcOf('sis')):null; }catch(e){ viaEv='ERR '+e.message; }
  let sched=null; try{ if(typeof SCHED!=='undefined'&&SCHED.where) sched=SCHED.where(G,'sis'); else if(typeof STORY!=='undefined'&&STORY.schedEnt) sched=STORY.schedEnt(G,'sis'); }catch(e){ sched='ERR '+e.message; }
  return {zone:G.zone, key:CALENDAR.dateOf(G.day).key, wd:CALENDAR.dateOf(G.day).wd, h:r2(G.hour), afternoonDone:!!F.afternoonDone, companion:G.companion||F.companion||null,
    npcKeys:Object.keys(GAME.npc||{}), sis:pick((GAME.npc||{}).sis), heroine_05:pick((GAME.npc||{}).heroine_05), viaEvents:viaEv, sched:sched&&typeof sched==='object'?JSON.parse(JSON.stringify(sched)):sched}; })()"""


async def main():
    print('CC BUG-SIS-LIB-LOAD：SHA %s；DAYS %s；HOUR %s；Windows＋GPU ≠ iPhone' % (SHA or '?', DAYS, HOUR), flush=True)
    rows = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for d in DAYS:
            tag = '[%s %.1f]' % (d, HOUR)
            s = await D.load_zone(pg, cdp, 'library', d, HOUR, wait=8000)
            R.setup('%s 【前置／捷徑】讀檔到 library（總圖 3F 閱覽室）%s %.1f，條件事件關掉' % (tag, d, HOUR))
            a = await pg.evaluate(SIS_JS)
            if not R.check('FAIL_SETUP 檢查：%s 讀檔以後真的在 library、日期是 %s' % (tag, d), a['zone'] == 'library' and a['key'] == d, J(a)):
                rows.append({'day': d, 'skip': a}); continue
            await pg.screenshot(path=os.path.join(OUT, 'sislib_%s_8s.png' % d))
            await pg.wait_for_timeout(8000)
            a2 = await pg.evaluate(SIS_JS); await pg.screenshot(path=os.path.join(OUT, 'sislib_%s_16s.png' % d))
            here = bool(a['sis'] or a['heroine_05'] or (isinstance(a['viaEvents'], dict) and a['viaEvents']))
            here2 = bool(a2['sis'] or a2['heroine_05'] or (isinstance(a2['viaEvents'], dict) and a2['viaEvents']))
            R.note('%s 讀檔 8 秒：%s' % (tag, J(a)))
            R.note('%s 讀檔 16 秒：%s' % (tag, J(a2)))
            R.check('%s 直接讀檔到閱覽室，學姊在場（8 秒或 16 秒）' % tag, here or here2, J({'8s': [a['npcKeys'], a['sis'], a['viaEvents']], '16s': [a2['npcKeys'], a2['sis'], a2['viaEvents']], 'sched': a['sched'], 'afternoonDone': a['afternoonDone'], 'companion': a['companion']}))
            rows.append({'day': d, 'h8': a, 'h16': a2})
            open(os.path.join(OUT, 'sis_lib_load.json'), 'w', encoding='utf-8').write(J({'sha': SHA, 'rows': rows}))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
