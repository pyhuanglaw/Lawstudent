"""真實玩家流程：討論型 B 課堂（AA_119；BB 的 syllabus）＋翹課的群組轉述（AA_104 4-2）。不用 ?turbo。
[前置／捷徑] 讀檔到那一天、那個時間（位置與時間是設定的）；之後都走真的介面（點地面走到座位、互動按鈕「坐下」、選「上課：…」、點對話、點選項、手機）。
A. 12/4 週四 13:05 霖澤館 201（民法總則第 14 週：網拍標錯價）：自己走到座位坐下 →「上課：民法總則」→ 教授問 → 選第一個看法 → 那個看法的結果
   → 同學依序回應（芯慈、柏翰、小語）→ 教授收尾 → 下課（15:10）；記下看法（disc.B_Y1S1_civ_general_w14＝0）、有理解 U_SALE、U_CONTRACT。
B. 11/10 週一 12:30 在校園（早上的憲法第 11 週沒去）：手機「訊息」多一行那一堂的轉述（那一週的 skip_line）。
全程沒有 JS 例外。
用法：python3 tests/flow_discuss_class.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_discuss_class'
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
D_THU14 = 79   # 2025-12-04 週四（大一上第 14 週）
D_MON11 = 55   # 2025-11-10 週一（大一上第 11 週）


async def main():
    run = L.Run('flow_discuss_class', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A ----------
        run.setup('讀檔：12/4 週四 13:05，霖澤館 201（民法總則 13:20 開始）')
        await L.load_state(pg, {'zone': 'classroom', 'hour': 13.08, 'day': D_THU14, 'weekday': 4, 'weather': 'sunny', 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(5000)
        ob = await pg.evaluate("(()=>{ const w=SYLLABUS.courses.civ_general.find(q=>q.w===14); return w&&w.obs; })()")
        run.check('A 第 14 週是討論型 B（四個選項、兩到三位同學、教授收尾）', bool(ob) and ob.get('kind') == 'discuss' and len(ob['options']) == 4 and 2 <= len(ob['replies']) <= 3 and bool(ob['close']))
        # 上課時 201 有 16 位同學坐固定的位子（classes3d.js syncRoom 的 cells，第 4 排第 4 個就是其中之一）：真的玩家看到有人坐的位子不會去坐——
        # 等同學坐好，挑離第 4 排第 4 個最近的空位（v9.7 回歸：寫死的那個位子有同學、模型還沒載入看起來是空的，「坐下」不出現）
        for _ in range(60):
            if await pg.evaluate("GAME.E.npcs.filter(n=>n.clsStudent&&n.seat).length") > 0: break
            await pg.wait_for_timeout(1000)
        seat = await pg.evaluate("""(()=>{ const E=GAME.E, S=E.zone.seats||[]; const occ=q=>q.taken||E.npcs.some(n=>(n.seat||n.seatTarget)&&Math.hypot((n.seat||n.seatTarget).x-q.x,(n.seat||n.seatTarget).z-q.z)<0.35);
          const L=S.filter(q=>!occ(q)).sort((a,b)=>(Math.abs(a.row-3)*3+Math.abs(a.col-3))-(Math.abs(b.row-3)*3+Math.abs(b.col-3))); const s=L[0]; if(!s) return null;
          const ap=GAME.seatApproach(s)||[s.x,s.z]; return {x:s.x,z:s.z,lv:s.lv|0,row:s.row,col:s.col,ax:ap[0],az:ap[1]}; })()""")
        run.note(f"空位：第 {seat['row'] + 1} 排第 {seat['col'] + 1} 個" if seat else '201 沒有空位')
        ok = await L.go_to(pg, cdp, run, seat['ax'], seat['az'], 0.3, '201 的座位', lv=seat['lv'])
        s = await L.state(pg)
        run.check('A 自己走到座位旁、出現「坐下」', ok and s['interact'].startswith('坐下'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
        idx = next((i for i, o in enumerate(opts) if o.startswith('上課：民法總則')), None)
        run.check('A 坐下：第一個選項「上課：民法總則」', idx is not None, json.dumps(opts, ensure_ascii=False))
        if idx is not None:
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (idx + 1)); await pg.wait_for_timeout(1500)
        seen = []; menus = []; t0 = time.time()
        while time.time() - t0 < 300:
            s = await L.state(pg)
            if s['dtext'] and (not seen or seen[-1] != s['dtext']): seen.append(s['dtext'])
            if not s['busy'] and not s['dlg'] and not s['choices']: break
            if s['choices']:
                menus.append(await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)"))
                await L.tap(pg, cdp, '#choices button:nth-child(1)')
            elif s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(700)
        await run.shot(pg, 'A_after_class')
        txt = ' / '.join(seen)
        run.check('A 選項是那四個看法（最後一個「我想先聽別人說。」）', bool(menus) and menus[0] == [o['text'] for o in ob['options']], json.dumps(menus[:1], ensure_ascii=False))
        run.check('A 順序：教授問 → 選的看法的結果 → 同學依序回應 → 教授收尾', all(k in txt for k in [ob['prompt'][:12], ob['options'][0]['result'][:12]] + [r['text'][:12] for r in ob['replies']] + [ob['close'][:12]]) and txt.index(ob['options'][0]['result'][:12]) < txt.index(ob['replies'][0]['text'][:12]) < txt.index(ob['close'][:12]), txt[:400])
        G = await pg.evaluate("(()=>{ const G=GAME.G; return {hour:+(G.hour%24).toFixed(2), disc:(G.courses.disc||{}).B_Y1S1_civ_general_w14, u1:!!G.flags.U_SALE, u2:!!G.flags.U_CONTRACT}; })()")
        run.check('A 下課 15:10、記下看法（0＝第一個）、理解 U_SALE、U_CONTRACT', G['hour'] >= 15.15 and G['disc'] == 0 and G['u1'] and G['u2'], json.dumps(G))
        # ---------- B ----------
        run.setup('讀檔：11/10 週一 12:30，校園（早上 09:10 的憲法第 11 週沒去）')
        await L.load_state(pg, {'zone': 'campus', 'hour': 12.5, 'day': D_MON11, 'weekday': 1, 'weather': 'sunny', 'pos': {'x': 0, 'z': 6, 'yaw': 3.14, 'lv': 0}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(8000)
        sl = await pg.evaluate("(()=>{ const w=SYLLABUS.courses.const_1.find(q=>q.w===11); return w&&w.obs&&w.obs.skip_line; })()")
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="msg"]'); await pg.wait_for_timeout(1200)
        body = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        await run.shot(pg, 'B_phone_msgs')
        run.check('B 手機「訊息」有那一堂的轉述（skip_line，「（群組）名字：…」）', bool(sl) and sl['text'][:14] in body and '（群組）' in body, (sl and sl['text'][:30] or '') + ' ｜ ' + body[:200])
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not run.fails else 'FAILED: ' + ', '.join(run.fails))


asyncio.run(main())
