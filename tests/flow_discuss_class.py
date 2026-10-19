"""真實玩家流程：討論型 B 課堂（AA_119；BB 的 syllabus）＋翹課的群組轉述（AA_104 4-2）。不用 ?turbo。
[前置／捷徑] 讀檔到那一天、那個時間（位置與時間是設定的）；之後都走真的介面（點地面走到座位、互動按鈕「坐下」、選「上課：…」、點對話、點選項、手機）。
A. 12/4 週四 13:05 霖澤館 201（民法總則第 14 週：網拍標錯價）：自己走到座位坐下 →「上課：民法總則」→ 教授問 → 選第一個看法 → 那個看法的結果
   → 同學依序回應（芯慈、柏翰、小語）→ 教授收尾 → 下課（15:10）；記下看法（disc.B_Y1S1_civ_general_w14＝0）、有理解 U_SALE、U_CONTRACT。
B. 11/10 週一 12:30 在校園（早上的憲法第 11 週沒去）：手機「訊息」多一行那一堂的轉述（那一週的 skip_line）；訊息頁是 LINE 式列表，點進那一串（轉述在「通知」）才看得到。
全程沒有 JS 例外。
用法：python3 tests/flow_discuss_class.py URL [輸出資料夾]"""
import asyncio, json, math, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_discuss_class'
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
D_THU14 = 79   # 2025-12-04 週四（大一上第 14 週）
D_MON11 = 55   # 2025-11-10 週一（大一上第 11 週）
# 卡住時記下：剩下的路線、旁邊 1.5 m 內的人（給 LAWWW 判斷是不是遊戲的問題）
STUCK_JS = """(()=>{ const E=GAME.E, P=E.player, o=P.obj.position; return {path:(P.path||[]).map(t=>[+(+t[0]).toFixed(2),+(+t[1]).toFixed(2)]),
  near:E.npcs.filter(n=>Math.hypot(n.obj.position.x-o.x,n.obj.position.z-o.z)<1.5).map(n=>({id:n.charId||n.id, x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), seat:!!n.seat, pose:n.pose||null}))}; })()"""


async def settle(pg, cdp, run, tx, tz, near, label, max_s=150):
    """真的走到了再看按鈕（LAWWW 10:31Z）：路線走完（path 0）、人停下來（pose idle）、在目標 near 以內。還在前進就等。
    v9.7 回歸（候選 8）：go_to 回來時人還在走（path 2、pose walk、離目標 0.41 m），「坐下」還沒出現就檢查了。
    路線沒走完卻 12 秒沒有前進（卡住）、或停下來但離目標太遠：寫進 log（位置、剩下的路線、旁邊的人），再像玩家一樣用搖桿往目標推 0.5 秒
    （推搖桿會放掉點地面的路線，engine3d.js），最多 6 次。不瞬移"""
    t0 = time.time(); s = await L.state(pg); px, pz = s['x'], s['z']; moved = time.time(); pushes = 0
    while time.time() - t0 < max_s:
        d = math.hypot(tx - s['x'], tz - s['z'])
        if not s['path'] and s['pose'] == 'idle' and (d <= near or pushes >= 6): break
        stuck = bool(s['path']) and time.time() - moved > 12
        short = not s['path'] and s['pose'] == 'idle' and d > near
        if (stuck or short) and pushes < 6:
            if stuck: run.note(f"「{label}」：路線還有 {s['path']} 段、12 秒沒有前進（{s['x']},{s['z']}，pose {s['pose']}），離目標 {d:.2f} m；{json.dumps(await pg.evaluate(STUCK_JS), ensure_ascii=False)}——用搖桿往目標推一下")
            else: run.note(f"「{label}」：停在離目標 {d:.2f} m，用搖桿往目標推一下")
            yaw = s['camYaw']; fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = -fz, fx
            ux, uz = (tx - s['x']) / max(d, 0.01), (tz - s['z']) / max(d, 0.01)
            await L.joystick(pg, cdp, int(25 * (ux * rx + uz * rz)), int(-25 * (ux * fx + uz * fz)), 500); pushes += 1; moved = time.time()
        await pg.wait_for_timeout(700); s = await L.state(pg)
        if math.hypot(s['x'] - px, s['z'] - pz) > 0.05: px, pz = s['x'], s['z']; moved = time.time()
    await pg.wait_for_timeout(1200)   # 互動按鈕每幀更新：停下來以後等一下再看
    s = await L.state(pg)
    run.note(f"「{label}」停下來：離目標 {math.hypot(tx - s['x'], tz - s['z']):.2f} m、path {s['path']}、pose {s['pose']}、按鈕「{s['interact']}」、推搖桿 {pushes} 次、等了 {time.time() - t0:.0f} 秒")
    return s


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
        s = await settle(pg, cdp, run, seat['ax'], seat['az'], 0.3, '201 的座位')
        run.check('A 自己走到座位旁（路線走完、停下來）、出現「坐下」', ok and not s['path'] and s['interact'].startswith('坐下'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
        opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
        idx = next((i for i, o in enumerate(opts) if o.startswith('上課：民法總則')), None)
        run.check('A 坐下：第一個選項「上課：民法總則」', idx is not None, json.dumps(opts, ensure_ascii=False))
        if idx is not None:
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (idx + 1)); await pg.wait_for_timeout(1500)
        seen = []; menus = []; t0 = time.time()
        while time.time() - t0 < 300:
            s = await L.state(pg)
            # 記整句（GAME.D.full），不記打字中的半句：畫面上是一個字一個字打出來，抓的那一下還沒打完、點下去剛好打完就直接翻到下一句，
            # 那一句只記到半句（2026-10-19 第二次跑：「周教授：「寫錯和想」，順序檢查找不到那句，第一次跑剛好抓到整句）
            line = await pg.evaluate("(GAME.D&&GAME.D.active&&GAME.D.full)||''") or s['dtext']
            if line and (not seen or seen[-1] != line): seen.append(line)
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
        # 轉述是下課以後、遊戲每 15 分鐘檢查一次時補進訊息（classes3d.js 的 skipNotes，S.tick）：遊戲要真的跑過才會有。
        # v9.7 回歸（候選 8）：讀檔 8 秒就打開手機，校園還沒載完、遊戲時間沒有走（手機開著遊戲暫停），訊息是空的「還沒有訊息。」——
        # 像玩家一樣先在校園待一下：等遊戲時間走過 2 分鐘（最多 180 秒）再打開手機
        t0 = time.time()
        while time.time() - t0 < 180:
            if (await L.state(pg))['hour'] >= 12.5 + 2 / 60: break
            # 要回的訊息到了，手機會自己跳出來、遊戲暫停（D103）：像玩家一樣先收起來，時間才會走
            if await L.phone_away(pg, cdp): run.note('手機自己跳出來（要回的訊息）→ 先收起來')
            await pg.wait_for_timeout(1000)
        run.note(f"讀檔後在校園待到遊戲時間走過 2 分鐘：{time.time() - t0 + 8:.0f} 秒（遊戲時間 {(await L.state(pg))['hour']:.2f}）")
        sl = await pg.evaluate("(()=>{ const w=SYLLABUS.courses.const_1.find(q=>q.w===11); return w&&w.obs&&w.obs.skip_line; })()")
        who = await pg.evaluate("(id=>SOCIAL.displayName?SOCIAL.displayName(id):((CHARACTERS[id]||{}).name||''))(%s)" % json.dumps(sl['who'])) if sl else ''
        if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"):
            await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="msg"]'); await pg.wait_for_timeout(1200)
        # 訊息頁像 LINE（PHONE-LINE-UI-1018）：先是對話列表，點進那一串才看得到訊息。轉述沒有說話的對象，在「通知」那一串（phone3d.js S.th）：
        # 點最新一句是那句轉述的那一列；沒有就點「通知」
        rows = await pg.evaluate("[...document.querySelectorAll('#phoneBody .chatRow')].map(e=>[e.dataset.th,e.innerText.replace(/\\s+/g,' ')])")
        run.note('手機「訊息」列表：' + ' ｜ '.join(r[1] for r in rows[:6])[:400])
        th = next((r[0] for r in rows if sl and sl['text'][:10] in r[1]), None) or next((r[0] for r in rows if r[0] == 'sys'), None)
        if th:
            sel = '#phoneBody .chatRow[data-th=%s]' % json.dumps(th)
            await pg.evaluate("document.querySelector(%s).scrollIntoView({block:'center'})" % json.dumps(sel)); await pg.wait_for_timeout(300)
            await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
        items = await pg.evaluate("[...document.querySelectorAll('#phoneBody .item')].map(e=>e.textContent)")
        run.note('手機「訊息」：' + ' ｜ '.join(items[:6])[:500])
        await run.shot(pg, 'B_phone_msgs')
        # 照手機現在顯示的樣子比對（LAWWW 10:31Z）：同一則訊息裡有那一句轉述（skip_line 的內容）和說話的人——
        # 不只認「（群組）名字：」這個前綴（群組對話串的訊息在清單上是「【群組名】名字：…」）
        hit = next((t for t in items if sl and sl['text'][:14] in t), None)
        run.check('B 手機「訊息」有那一堂的轉述（skip_line 的內容＋說話的人）', bool(hit) and bool(who) and who in hit, f"{who}：{(sl or {}).get('text', '')[:30]} ｜ " + (hit or ' ｜ '.join(items[:3]))[:200])
        if not hit:   # 診斷（不影響判定）：訊息、今天的課、記過的轉述
            run.note('沒有轉述：' + json.dumps(await pg.evaluate("""(()=>{ const G=GAME.G; let it=null, nt=null; try{ it=CLS.dayItems(G,G.day).map(i=>i.key+' '+i.t0+'-'+i.t1); nt=Object.keys(CLS.rec(G).note||{}).filter(k=>k.startsWith('skip')); }catch(e){ it=String(e); }
              return {hour:+(G.hour%24).toFixed(2), msgs:(G.msgs||[]).slice(-5), items:it, note:nt}; })()"""), ensure_ascii=False)[:700])
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not run.fails else 'FAILED: ' + ', '.join(run.fails))


asyncio.run(main())
