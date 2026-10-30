"""真實玩家流程：交接包 v2 C13 的 B4 博思演講、B5 小桌子（AA_115 第 1、2 節；BB_105 4-5）。不用 ?turbo。
[前置／捷徑] 讀檔：大一下第 11 週週四 18:48，博思大廳；「認識以安、Alison」用 SOCIAL.remember 補（照劇情這時候早就認識，只是把人放到那個時間）。
之後都走真的介面：自己走進 101、坐下、選「聽演講」、點對話；散場以安問「要不要去小桌子整理一下？」選「好。」；
起身、自己走到圓桌以安的旁邊；B5 選第一張便利貼。
檢查：以安、Alison、阿哲照作息走進 101；演講的台詞；聽完（attended）；散場的問題與 B5_GO；以安、Alison 走到圓桌坐下；
走近以安才開始 B5、台詞、B5_THOUGHT、B4_DISCUSSED；沒有 JS 例外。
用法：python3 tests/flow_b4_lecture.py URL [輸出資料夾]（Playwright 手機模擬＋SwiftShader，不是 iPhone 實機）"""
import asyncio, json, math, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_b4_lecture'
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
FRIENDS = ['heroine_01', 'yu', 'zhe']
# 演講時一半的位子有人（classes3d.js syncRooms）：挑離第 1 排出口那一側最近的空位（走到圓桌比較近）
CROWD_JS = "GAME.E.zone.seats.filter(q=>q.room==='101'&&q.taken).length+GAME.E.npcs.filter(n=>n.clsStudent&&n.seat&&n.seat.room==='101').length"
FREE_SEAT_JS = """(()=>{ const E=GAME.E; const occ=q=>q.taken||E.npcs.some(n=>(n.seat||n.seatTarget)&&Math.hypot((n.seat||n.seatTarget).x-q.x,(n.seat||n.seatTarget).z-q.z)<0.35);
  const L=E.zone.seats.filter(q=>q.room==='101'&&!occ(q)).sort((a,b)=>(a.row*3+Math.abs(a.col-11))-(b.row*3+Math.abs(b.col-11)));
  const s=L[0]; if(!s) return null; const ap=GAME.seatApproach(s)||[s.x,s.z]; return {x:s.x,z:s.z,row:s.row,col:s.col,ax:ap[0],az:ap[1]}; })()"""
WHERE_JS = """(ids=>ids.map(id=>{ const n=GAME.npc[id]; if(!n||!GAME.E.npcs.includes(n)) return [id,null]; const p=n.obj.position, st=n.seat||null;
  return [id,{x:+p.x.toFixed(2),z:+p.z.toFixed(2),seat:st?(st.room||'-'):null,pose:n.pose}]; }))"""


async def play_through(pg, cdp, run, until, pick_text=None, seen=None, max_s=240):
    """像玩家一樣點對話；出現選項就照文字選（pick_text 開頭的那一個，沒有就第一個）；看過的對話記在 seen"""
    t0 = time.time(); last = None; still = time.time()
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        # 整句台詞（GAME.D.full）：對話框有打字機效果，SwiftShader 取樣常常只拿到半句（2026-10-14 flow_spring_trip 記到「……好。行程表」就被點到下一句）
        full = await pg.evaluate("(GAME.D&&GAME.D.active&&GAME.D.full)?String(GAME.D.full):''")
        if full: s['dtext'] = full
        if s['dtext'] and seen is not None and (not seen or seen[-1] != s['dtext']): seen.append(s['dtext'])
        if until(s): return s
        key = (s['dtext'], s['choices'], round(s['hour'], 2))
        if key != last: last = key; still = time.time()
        if time.time() - still > 60: run.note('超過 60 秒沒有進展：' + json.dumps(s, ensure_ascii=False)); return s
        if s['choices']:
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
            i = next((k for k, o in enumerate(opts) if pick_text and o.startswith(pick_text)), 0)
            run.note('選項：' + json.dumps(opts, ensure_ascii=False) + f' → 選第 {i + 1} 個')
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (i + 1))
        elif s['dlg']:
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(700)
    return await L.state(pg)


async def main():
    run = L.Run('flow_b4_lecture', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        thu = await pg.evaluate("STORY.termDay('Y1S2',11,4)")
        run.setup(f'讀檔：大一下第 11 週週四（第 {thu} 天）18:48，博思大廳；補「認識以安、Alison」的記憶')
        await L.load_state(pg, {'zone': 'boya', 'hour': 18.8, 'day': thu, 'weekday': 4, 'weather': 'clear', 'pos': {'x': 0, 'z': 6.8, 'yaw': 3.14}, 'flags': BASE_FLAGS})
        await pg.evaluate("SOCIAL.remember('heroine_01','FIRST_MET','');SOCIAL.remember('yu','FIRST_MET','')")
        await pg.wait_for_timeout(3000)
        # 1. 以安、Alison、阿哲照作息走進 101
        w = None
        for _ in range(300):   # SwiftShader 下遊戲時間大約是真實時間的 4 倍：18:48→18:50 以後人才走進來（2026-10-14 第一次跑：150 秒只到 18:46）
            w = dict(await pg.evaluate(WHERE_JS + "(%s)" % json.dumps(FRIENDS)))
            if all(w.get(i) and w[i]['x'] < -6 for i in FRIENDS): break
            await pg.wait_for_timeout(1000)
        run.check('以安、Alison、阿哲照作息走進博思 101（第 11 週週四 18:50 起）', all(w.get(i) and w[i]['x'] < -6 for i in FRIENDS), json.dumps(w, ensure_ascii=False) + ' 時間 ' + str((await L.state(pg))['hour']))
        await run.shot(pg, '1_friends_in_101')
        # 2. 自己走進 101、坐下、選「聽演講」
        for _ in range(90):
            if await pg.evaluate(CROWD_JS) > 0: break
            await pg.wait_for_timeout(1000)
        seat = await pg.evaluate(FREE_SEAT_JS)
        run.note('空位：' + json.dumps(seat))
        ok = bool(seat) and await L.go_to(pg, cdp, run, seat['ax'], seat['az'], 0.3, '101 的空位', lv=0)
        s = await L.state(pg)
        for _ in range(60):
            if not s['path'] and s['pose'] == 'idle': break
            await pg.wait_for_timeout(1000); s = await L.state(pg)
        run.check('自己走進 101、走到空位旁、出現「坐下」', ok and s['interact'].startswith('坐下'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact')
        opts = []
        for _ in range(30):
            await pg.wait_for_timeout(1000)
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
            if opts: break
        run.note('坐下的選項：' + json.dumps(opts, ensure_ascii=False))
        idx = next((i for i, o in enumerate(opts) if o.startswith('聽演講')), None)
        run.check('坐下以後可以選「聽演講」', idx is not None, json.dumps(opts, ensure_ascii=False))
        if idx is None: await run.shot(pg, 'no_lecture_option'); await b.close(); return run.finish()
        await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (idx + 1)); await pg.wait_for_timeout(1500)
        seen = []
        s = await play_through(pg, cdp, run, lambda q: q['dtext'].startswith('要不要去小桌子') or (q['hour'] % 24 >= 20.9 and not q['dlg']), pick_text='「好。」', seen=seen)
        run.note('看到的對話：' + json.dumps(seen, ensure_ascii=False))
        want = ['講者是一位頭髮花白的老師', '政府要限制一個人，要有理由', '可是「最小」，是誰來量的？', '最後一個問題，我留給你們。', '被限制的那個人，最後可以去哪裡？', '掌聲。以安把最後那一句抄了兩次。']
        run.check('演講的台詞（旁白、講者四句、掌聲）依序出現', all(any(t.startswith(w_[:12]) for t in seen) for w_ in want), json.dumps(seen, ensure_ascii=False))
        att = await pg.evaluate("ACTIVITIES.attended(GAME.G,'B4')")
        run.check('聽完：記成 attended（B4）、時間到 20:30 以後', att and s['hour'] % 24 >= 20.5, f"attended={att} 時間 {s['hour']}")
        await pg.wait_for_timeout(1500)   # 立繪淡入、背景模糊的轉場（0.35～0.4 秒）做完再拍（記整句以後「台詞開始」提早成立，2026-10-14 第四次拍到轉場前、沒有立繪）
        await run.shot(pg, '2_after_lecture')
        # 3. 散場：以安問、選「好。」
        run.check('散場（20 分鐘內）以安問「要不要去小桌子整理一下？」', s['dtext'].startswith('要不要去小桌子'), json.dumps(s, ensure_ascii=False))
        s = await play_through(pg, cdp, run, lambda q: not q['dlg'] and not q['choices'] and not q['busy'], pick_text='「好。」', seen=seen)
        go = await pg.evaluate("GAME.G.flags.B5_GO")
        run.check('選「好。」：記 B5_GO＝今天', go == thu, f'B5_GO={go}')
        # 4. 以安、Alison 走到圓桌坐下（story3d.js roomMove：起身、從 101 走出來、走到大廳的圓桌）
        # SwiftShader 演講散場時約 0.5～1 fps：從 101 走到圓桌（約 20 m）要好幾分鐘真實時間（2026-10-14 第三次跑：150 秒時兩個人還在 101 門口往外走）
        w = None; trail = []; t_w = time.time()
        while time.time() - t_w < 600:
            w = dict(await pg.evaluate(WHERE_JS + "(%s)" % json.dumps(['heroine_01', 'yu'])))
            if all(w.get(i) and w[i]['seat'] == 'round' for i in ['heroine_01', 'yu']): break
            an_ = w.get('heroine_01') or {}
            if not trail or abs(trail[-1][1] - an_.get('x', 0)) + abs(trail[-1][2] - an_.get('z', 0)) > 1.0: trail.append((int(time.time() - t_w), an_.get('x'), an_.get('z'), an_.get('pose')))
            await pg.wait_for_timeout(2000)
        run.note('以安走過去的軌跡（秒, x, z, pose）：' + json.dumps(trail[-10:]))
        run.check('以安、Alison 走到博思的圓桌坐下', all(w.get(i) and w[i]['seat'] == 'round' for i in ['heroine_01', 'yu']), json.dumps(w, ensure_ascii=False) + ' 時間 ' + str((await L.state(pg))['hour']) + f'；等了 {time.time() - t_w:.0f} 秒')
        an = w.get('heroine_01')
        if not an: await b.close(); return run.finish()
        # 5. 自己走到以安旁邊（她的座位往桌子外側一公尺）→ B5
        tgt = await pg.evaluate("""(()=>{ const n=GAME.npc.heroine_01, st=n.seat; const t=st&&st.table?GAME.E.zone.seats.filter(q=>q.table===st.table):[]; const cx=t.length?t.reduce((a,q)=>a+q.x,0)/t.length:n.obj.position.x+1, cz=t.length?t.reduce((a,q)=>a+q.z,0)/t.length:n.obj.position.z;
          const p=n.obj.position, dx=p.x-cx, dz=p.z-cz, d=Math.hypot(dx,dz)||1; return [p.x+dx/d*1.0, p.z+dz/d*1.0]; })()""")
        run.note('走向以安旁邊：' + json.dumps(tgt))
        seen2 = []
        await L.go_to(pg, cdp, run, tgt[0], tgt[1], 0.8, '圓桌以安的旁邊', lv=0, stop=lambda q: bool(q['dlg'] or q['choices']))   # 走近她（2.5 m）事件就開始：停下來自己看台詞
        s = await play_through(pg, cdp, run, lambda q: q['dtext'].startswith('他說，限制自由'), seen=seen2, max_s=90)
        run.check('走到以安旁邊，B5 開始（「他說，限制自由要用最小的手段。」）', s['dtext'].startswith('他說，限制自由'), json.dumps(s, ensure_ascii=False))
        await pg.wait_for_timeout(1500)   # 立繪淡入、背景模糊的轉場（0.35～0.4 秒）做完再拍（記整句以後「台詞開始」提早成立，2026-10-14 第四次拍到轉場前、沒有立繪）
        await run.shot(pg, '5_b5_start')
        s = await play_through(pg, cdp, run, lambda q: not q['dlg'] and not q['choices'] and not q['busy'], pick_text='「最小，要問被限制的人。」', seen=seen2)
        run.note('B5 的對話：' + json.dumps(seen2, ensure_ascii=False))
        f = await pg.evaluate("({t:GAME.G.flags.B5_THOUGHT,d:GAME.G.flags.B4_DISCUSSED,m:SOCIAL.has('heroine_01','B5_STICKY')})")
        run.check('B5：選「最小，要問被限制的人。」→ B5_THOUGHT＝ask_them、B4_DISCUSSED、以安記得便利貼', f['t'] == 'ask_them' and f['d'] is True and f['m'], json.dumps(f))
        run.check('B5 的台詞：三張便利貼、「九點半了。我回宿舍讀刑總。」', any(t.startswith('她把三張便利貼') for t in seen2) and any(t.startswith('九點半了') for t in seen2), json.dumps(seen2, ensure_ascii=False))
        await run.shot(pg, '6_after_b5')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
