"""CC-B（帳號 B）11-07：Daybreak 窗邊 #2 (-2.15, 3.45)「坐不下」單獨重跑＋診斷（BB-B 11-07 03:34，BB_255 最後一節 5b4c0ced4）。
  起因：DBK_passerby（abf4dbbd5）互動鍵是「坐窗邊」，按了 player.seat 還是 null；BB-B 判 GAME_BUG 候選，和 9c5e6bbbc 修的「按鈕被路人搶」不是同一個原因。
  做法：照 D.sit_all（玩家點椅子 → 走到旁邊 → 互動鍵是這一張 → 按）只坐這一張；每次按 #interact 的那一刻和之後 6 秒印：
    nearestInteractable（label、位置、半徑、seat 座標、是不是 NPC）、座位占用表（每張座位＋坐在上面的 NPC）、toast 文字、對話框、玩家位置、player.seat。
  時間：照 PLACES.isOpen 挑開店後還有 2 小時的時間 h0，另外 h0+0.5、h0+1、h0+2 各一次（客人會換位子：#3、#4 有沒有人）。
  【前置／捷徑】讀檔到店裡出生點（條件事件關閉）。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [HOURS_ADD=0,0.5,1,2] [SEQ=1＝先坐 #1 (-3.05,3.45) 再坐 #2，照 PC 那次的順序；0＝只坐 #2] python3 cc_dbk_seat2_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('dbk_seat2', OUT); D.setup(R, OUT)
DAY = '2025-10-18'   # 和 DBK_passerby 同一天（星期六）
ZONE = 'daybreak'
SEAT = (-2.15, 3.45)
PREV = (-3.05, 3.45)   # DBK_passerby（PC）：#2 是剛坐完、起身離開 #1 (-3.05, 3.45) 以後馬上坐的；SEQ=1（預設）照這個順序、不重新讀檔
SEQ = os.environ.get('SEQ', '1') != '0'
EXPECT = os.environ.get('EXPECT', '').strip()   # fixed：b550eb6c1 以後（BUG-DAYBREAK-SEAT2-1107）——有客人正走向 #2（seatTarget）時 #2 不出「坐窗邊」；按 #interact 不能再跳「有人坐了。」
RES = r"""((q)=>{ const E=GAME.E; const tgt=(E.npcs||[]).filter(n=>n&&n.seatTarget&&Math.hypot(n.seatTarget.x-q[0],n.seatTarget.z-q[1])<0.4).map(n=>n.id||n.name||'?');
  const sat=(E.npcs||[]).filter(n=>n&&n.seat&&Math.hypot(n.seat.x-q[0],n.seat.z-q[1])<0.4).map(n=>n.id||n.name||'?'); const it=E.nearestInteractable&&E.nearestInteractable();
  return {reserved:tgt, sat, nearest:it?{label:it.label||'', seat:it.seat?[+it.seat.x.toFixed(2),+it.seat.z.toFixed(2)]:null}:null}; })"""
TOASTS = []
ADDS = [float(x) for x in (os.environ.get('HOURS_ADD') or '0,0.5,1,2').split(',') if x]
OPEN_EARLY = r"""((a)=>{ const [z,day]=a; const ok=h=>{ try{ return typeof PLACES==='undefined'||!PLACES.isOpen||!!PLACES.isOpen(z,h,day); }catch(e){ return true; } };
  for(let h=7;h<24;h+=0.5) if(ok(h)&&ok(h+2)) return h; return null; })"""
DIAG = r"""(()=>{ const E=GAME.E, P=E.player, o=P.obj.position;
  const it=E.nearestInteractable&&E.nearestInteractable();
  const desc=i=>i?{label:i.label||'', x:+(+i.x).toFixed(2), z:+(+i.z).toFixed(2), r:i.radius||0.8, lv:i.lv|0, seat:i.seat?[+i.seat.x.toFixed(3),+i.seat.z.toFixed(3)]:null, npc:i.npc?(i.npc.id||i.npc.name||true):null, hidden:!!i.hidden, onInteract:!!i.onInteract}:null;
  const npcs=(E.npcs||[]).filter(n=>n&&n.seat).map(n=>({id:n.id||n.cid||n.name||'?', seat:[+n.seat.x.toFixed(2),+n.seat.z.toFixed(2)]}));
  const seats=E.interactables.filter(i=>i.seat).map(i=>{ const who=npcs.filter(n=>Math.hypot(n.seat[0]-i.seat.x,n.seat[1]-i.seat.z)<0.35).map(n=>n.id); return {label:i.label, seat:[+i.seat.x.toFixed(2),+i.seat.z.toFixed(2)], hidden:!!i.hidden, who}; });
  const t=document.getElementById('toast'), dl=document.getElementById('dlg');
  return {hour:+(GAME.G&&GAME.G.hour||0).toFixed(3), player:{x:+o.x.toFixed(3), z:+o.z.toFixed(3), lv:P.lv|0, seat:P.seat?[+P.seat.x.toFixed(3),+P.seat.z.toFixed(3)]:null, pose:P.pose||null},
    nearest:desc(it), toast:t?{text:t.textContent, shown:!t.classList.contains('hide')&&+getComputedStyle(t).opacity>0.05}:null,
    dlg:dl&&!dl.classList.contains('hide')?(dl.textContent||'').slice(0,120):null, seats, npcs}; })()"""

_tap = L.tap
DIAGS = []


async def tap_logged(pg, cdp, sel, *a, **k):
    """按 #interact 的那一刻和之後 6 秒，每 0.5 秒印一次診斷（其他選擇器照舊）"""
    if sel != '#interact': return await _tap(pg, cdp, sel, *a, **k)
    d0 = await pg.evaluate(DIAG); DIAGS.append(('before', d0))
    R.note('【診斷 按下前】nearest=%s；toast=%s；player=%s' % (J(d0['nearest']), J(d0['toast']), J(d0['player'])))
    R.note('【診斷 按下前】座位占用：%s' % J([s for s in d0['seats'] if s['who'] or abs(s['seat'][0] - SEAT[0]) < 0.06]))
    r = await _tap(pg, cdp, sel, *a, **k)
    seen = set()
    for i in range(12):
        await pg.wait_for_timeout(500)
        d = await pg.evaluate(DIAG); DIAGS.append(('after%.1f' % ((i + 1) * 0.5), d))
        key = J([d['player']['seat'], d['toast'], d['dlg'], d['nearest'] and d['nearest']['label']])
        if key in seen: continue
        seen.add(key)
        R.note('【診斷 按下後 %.1f 秒】player=%s；toast=%s；dlg=%s；nearest=%s' % ((i + 1) * 0.5, J(d['player']), J(d['toast']), J(d['dlg']), J(d['nearest'])))
        if d['toast'] and d['toast']['shown'] and d['toast']['text'] == '有人坐了。': TOASTS.append(d['player'])
        if d['player']['seat']: break
    return r

L.tap = tap_logged


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC DBK_SEAT2（Daybreak 窗邊 #2 (-2.15, 3.45) 單獨重跑＋診斷）：SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        day = await pg.evaluate("(k=>{ if(typeof STORY!=='undefined'&&STORY.dayOfKey) return STORY.dayOfKey(k); for(let d=0;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })('%s')" % DAY)
        h0 = await pg.evaluate(OPEN_EARLY, [ZONE, day]); h0 = 14.0 if h0 is None else h0
        R.note('Daybreak %s 開店後還有 2 小時的時間 h0=%s；這次試 h0＋%s' % (DAY, h0, ADDS))
        results = []
        for add in ADDS:
            h = h0 + add; tag = '[#2 %.2f]' % h
            print('== %s' % tag, flush=True)
            try:
                R.setup('%s 讀檔 Daybreak 店裡出生點 %s %.2f（條件事件關閉）' % (tag, DAY, h))
                s = await D.load_zone(pg, cdp, ZONE, DAY, h, wait=6000)
                if not R.check('%s 讀到店裡' % tag, s['zone'] == ZONE, J(s)): continue
                for _ in range(24):
                    q = await D.st(pg)
                    if not q['dlg'] and not q['choices']: break
                    if q['dlg']: await L.tap(pg, cdp, '#dlg')
                    elif q['choices']: await L.tap(pg, cdp, '#choices button:last-child')
                    await pg.wait_for_timeout(500)
                rr = await D.sit_all(pg, cdp, tag, 'dbk2_%02d' % int(round(h * 4)), max_walk=180, only=([PREV] if EXPECT == 'fixed' else ([PREV, SEAT] if SEQ else [SEAT])))
                R.note('%s 這一輪坐了：%s（SEQ=%s）' % (tag, J(rr), SEQ))
                r = next((q for q in rr if abs(q[2] - SEAT[0]) < 0.06 and abs(q[3] - SEAT[1]) < 0.06), None)
                results.append([h, r and r[1]])
                R.note('%s 結果 %s' % (tag, J(r)))
                if EXPECT == 'fixed':   # 走回 #2 旁邊，看幾秒內有沒有客人正走過去；有＝#2 不能是最近的「坐窗邊」
                    ap = [SEAT[0], SEAT[1] - 0.55]
                    await L.go_to(pg, cdp, R, ap[0], ap[1], 0.25, '%s（回到 #2 旁邊看預約）' % tag, max_s=90)
                    seen = []
                    for _ in range(16):
                        q = await pg.evaluate(RES, list(SEAT)); seen.append(q)
                        mine = bool(q['nearest'] and q['nearest']['seat'] and abs(q['nearest']['seat'][0] - SEAT[0]) < 0.01 and abs(q['nearest']['seat'][1] - SEAT[1]) < 0.01)
                        if q['reserved'] and not q['sat']:
                            R.check('%s 有客人正走向 #2（%s）：#2 不出「坐窗邊」（最近的是 %s）' % (tag, J(q['reserved']), J(q['nearest'])), not mine, J(q))
                            results[-1][1] = 'reserved'; break
                        if q['sat']:
                            R.note('%s #2 已經有客人坐著（%s）：遊戲不給坐，跳過' % (tag, J(q['sat']))); results[-1][1] = 'occupied'; break
                        await pg.wait_for_timeout(500)
                    else:   # 沒人預約、沒人坐：照玩家按，要坐得下、不跳「有人坐了。」
                        q = seen[-1]; mine = bool(q['nearest'] and q['nearest']['seat'] and abs(q['nearest']['seat'][0] - SEAT[0]) < 0.01)
                        if R.check('%s #2 沒人預約：最近的「坐窗邊」就是 #2' % tag, mine, J(q)):
                            await L.tap(pg, cdp, '#interact'); okk = False
                            for _ in range(16):
                                await pg.wait_for_timeout(500)
                                if await pg.evaluate("!!GAME.E.player.seat"): okk = True; break
                            R.check('%s #2 沒人預約：按了坐下（player.seat）' % tag, okk, '')
                            results[-1][1] = 'ok' if okk else 'nosit'
                            if okk: await D.shot(pg, 'dbk2_fixed_%02d' % int(round(h * 4)))
            except Exception as ex:
                R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
        R.note('各時間結果：%s（occupied＝有 NPC 坐、遊戲不給坐，跳過）' % J(results))
        with open(os.path.join(OUT, 'dbk_seat2_diag.json'), 'w', encoding='utf-8') as f:
            json.dump(DIAGS, f, ensure_ascii=False, indent=1)
        if EXPECT == 'fixed': R.check('按「坐」以後沒有跳「有人坐了。」（預約中的位子不出按鈕）', not TOASTS, J(TOASTS))
        R.check('窗邊 #2 至少有一個時間點真的試著坐（不是每次都有人坐）', any(x[1] in ('ok', 'nosit', 'nobtn', 'reserved') for x in results), J(results))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
