"""CC-C 11-14：DATE_LAYER（DATE-S6；使用者要的 I07、I08；BB-C 02:40／02:42，標準 BB_461 十項）。只記、截圖；判定歸 BB。Playwright 手機模擬 ≠ iPhone。
程式：src/datelayer3d.js（DATELAYER.choose：#dateLayer、.dlHot[data-pid]（.dim＝停用）、.dlEnd、.dlHer、.dlScroll.pan；GUARD 350 ms）；src/date3d.js S.pickChoose（可以用圖層就用、不行＝文字選單）。
每個地點（CASES，例 D01,D05,D12,D28）：
  【前置／捷徑】最小存檔（cc_seedplay.fresh）Y1S2 第 5 週週六 14:30 宿舍、她 CLOSE、錢補到 5000 → DATE.book 那個地點 15:00（同 tests/date_scene_unit.js、cc_canon458 DATE）
  → 等「出發」照演 → 第一次要選互動點時：
    ① 350 ms 防誤觸：#dateLayer 一出現就（頁面裡等，不經過 Python 來回）用真的觸控點第一個能點的標記——圖層要還開著（沒有被選走）；記點下去離出現幾 ms
    ② 橫向 844×390 截圖＋量：標記幾個、停用幾個（時間不夠／休館）、停用的按不下去（真的觸控點了圖層還在）、她的去背圖會不會蓋到標記、會不會被裁到畫面外、標籤有沒有疊在一起、畫面上有沒有除錯字（id、座標、PLACEHOLDER）
    ③ 直向 390×844（同一個畫面改大小，遊戲 resize 重排）截圖＋量：是不是可以左右滑（.dlScroll.pan）、一開始在畫面外的標記幾個 → 滑到那個標記、真的觸控點得到（點了就是選了，所以直向只點「滑過去以後點得到」那一個當作這一輪的選擇）
    ④ 選了以後：圖層收掉、接著演（記點的螢幕座標、選到第幾項、後面幾句）
    ⑤ 存讀檔：選完、劇情回到下一次選互動點（或約會結束）時 GAME.autosave(true) → 重新整理頁面 →「繼續」→ 記讀回來的區域、時間、約會出遊狀態、畫面是不是卡住（有沒有圖層／對話擋著、玩家動不動得了）
  D28：這個地點照設計走文字選單（DATE_HOTSPOTS 註解：D28.sunset 沒有位置）——要看到的是 #choices 選單、不是 #dateLayer。
  NODL=1（網址加 ?nodatelayer，由佇列的 page 欄給）：同一個地點要回到舊的文字選單。
CC_02 清單 2026-11-14：1✓（日子照 cc_canon458 DATE：Y1S2 第 5 週週六；她 CLOSE；地點照 BB） 2✓（標記、她的圖、結束鍵照 datelayer3d.js 的 class／data-pid 讀；地點照 DATE_HOTSPOTS） 3✓（三個地點＋D28＋nodatelayer；停用的點也點一次） 4✓（點之前確認圖層開著、標記在畫面裡） 5n/a（2D 圖層，不走路） 6✓（防誤觸在頁面裡等圖層出現，避免 Python 來回延遲；其他等 400 ms 以上） 7✓（lint、JS 用 node --check） 8✓（只記數字、BB 判） 9✓（每一步截圖） 10✓（別的對話照字點） 11✓（SHA 40 碼、ENV 沒有「|」「;」） 12✓（FAIL_SETUP 檢查：約會排上了、真的出了圖層（D28／NODL＝真的出文字選單）） 13n/a（不走路）
補（BB-C 11-14 BB_461）：D33 也是文字選單；D05@20＝晚出發，至少一個標記因「時間差不多了」變暗並點一次；D05、D12 先選坐著的點（DATE_HOTSPOTS.seated），回到選點畫面她要是 H4（dl_<地點>_seated）；每個標記觸控範圍 ≥44×44。
用法：LW_TESTS=<wt>/tests SHA=<sha> CASES=D01,D05,D12,D28,D33,D05@20 [WHO=heroine_02] [NODL=1] python3 cc_date_layer_probe.py <url> <out>"""
import os, sys, json, asyncio, time, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import bbplay as P
import cc_seedplay as SP
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
CASES = [c for c in (os.environ.get('CASES') or 'D01,D05,D12,D28,D33,D05@20').split(',') if c]
WHO = os.environ.get('WHO') or 'heroine_02'
NODL = (os.environ.get('NODL') or '') == '1'
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('date_layer', OUT); SP.setup(R, OUT)
LAND = {'width': 844, 'height': 390}; PORT = {'width': 390, 'height': 844}
BOOK_JS = "(a=>{ const G=GAME.G; const b=DATE.book(G,{who:a.who,locs:[a.loc],transport:'mrt',day:G.day,depart:a.dep}); const q=b&&b.trip!=null?OUT.get(G,'date_'+b.trip):null; return {ok:!!(b&&b.ok!==false&&b.trip!=null), why:b&&b.why||null, trip:b&&b.trip, q:q?{day:CALENDAR.dateOf(q.day).key,h:q.h,state:q.state}:null}; })"
# 圖層量測：標記、停用、她的圖、標籤重疊、畫面外、除錯字
LAYER_JS = r"""(()=>{ const root=document.getElementById('dateLayer'); if(!root) return null; const vw=innerWidth, vh=innerHeight, f=v=>Math.round(v);
  const R=e=>{ const r=e.getBoundingClientRect(); return {x:f(r.left),y:f(r.top),w:f(r.width),h:f(r.height)}; };
  const inView=r=>r.x+r.w>0&&r.y+r.h>0&&r.x<vw&&r.y<vh, fully=r=>r.x>=0&&r.y>=0&&r.x+r.w<=vw&&r.y+r.h<=vh, ov=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
  const hots=[...root.querySelectorAll('.dlHot')].map(b=>{ const r=R(b), l=b.querySelector('.lab'); return {pid:b.getAttribute('data-pid'), dim:b.classList.contains('dim')||b.disabled, up:b.classList.contains('up'), r, lab:l?R(l):null, text:(b.getAttribute('aria-label')||'').slice(0,60), inView:inView(r)}; });
  const her=root.querySelector('.dlHer'); const hr=her?R(her):null;
  const labOv=[]; for(let i=0;i<hots.length;i++) for(let j=i+1;j<hots.length;j++){ const a=hots[i].lab, b=hots[j].lab; if(a&&b&&ov(a,b)) labOv.push([hots[i].pid,hots[j].pid]); }
  const herOnHot=hr?hots.filter(h=>ov(hr,h.r)).map(h=>h.pid):[];
  const sc=root.querySelector('.dlScroll'); const end=root.querySelector('.dlEnd');
  const txt=(root.innerText||'')+' '+(document.getElementById('adv')?document.getElementById('adv').innerText:'');
  const dbg=(txt.match(/PLACEHOLDER|\bD\d\d\.[a-z_]+|\b[a-z]+_[a-z0-9_]{3,}\b|\b\d+\.\d+\s*,\s*\d+\.\d+|\bid\s*[:=]/gi)||[]).slice(0,8);
  const c=(typeof DATELAYER!=='undefined'&&DATELAYER._cur)?DATELAYER._cur():null;
  const sz=hots.map(h=>Math.min(h.r.w,h.r.h)), minHot=sz.length?Math.min(...sz):null;
  return {minHot, herSrc:her?String(her.getAttribute('src')||'').split('/').slice(-2).join('/'):null, vw, vh, open:!!root.parentNode, on:root.classList.contains('on'), night:root.classList.contains('night'), pan:!!(sc&&sc.classList.contains('pan')), scrollLeft:sc?f(sc.scrollLeft):0, scrollMax:sc?f(sc.scrollWidth-sc.clientWidth):0,
    hots, n:hots.length, dim:hots.filter(h=>h.dim).length, outView:hots.filter(h=>!h.inView).map(h=>h.pid), her:hr, herClipped:hr?!fully(hr):null, herOnHot, labOverlap:labOv, end:end?{t:(end.textContent||'').trim(),r:R(end)}:null, debugText:dbg,
    shownAgo:c&&c.shownAt?f(performance.now()-c.shownAt):null}; })()"""
# 防誤觸：圖層一出現（DOM 裡有第一個能點的標記）就回傳它的螢幕中心（頁面裡等，最多 ms）
WAIT_LAYER = r"""(async ms=>{ const t0=performance.now(); while(performance.now()-t0<ms){ const root=document.getElementById('dateLayer'); const b=root&&[...root.querySelectorAll('.dlHot')].find(x=>!x.classList.contains('dim'));
    if(b){ const r=b.getBoundingClientRect(); const c=DATELAYER._cur&&DATELAYER._cur(); return {x:r.left+r.width/2, y:r.top+r.height/2, pid:b.getAttribute('data-pid'), since:c&&c.shownAt?Math.round(performance.now()-c.shownAt):null}; }
    if(document.querySelector('#choices button')&&[...document.querySelectorAll('#choices button')].some(x=>x.offsetParent)) return {menu:true};
    await new Promise(r=>setTimeout(r,16)); } return null; })"""
CENTER = "(pid=>{ const b=document.querySelector('#dateLayer .dlHot[data-pid=\"'+pid+'\"]'); if(!b) return null; b.scrollIntoView({inline:'center',block:'nearest'}); const r=b.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2}; })"
STATE = "(()=>({zone:GAME.G.zone, key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2), busy:!!(GAME.E.player&&GAME.E.player.busy), depth:(GAME.D&&GAME.D.busyDepth)|0, layer:!!document.getElementById('dateLayer'), adv:!!(document.getElementById('adv')&&document.getElementById('adv').classList.contains('on')), outs:(OUT.rec(GAME.G)||[]).filter(q=>q&&/^date_/.test(q.id||'')).map(q=>({id:q.id,state:q.state,day:CALENDAR.dateOf(q.day).key}))}))()"


async def shot(pg, name):
    await pg.screenshot(path=os.path.join(OUT, name))


async def drive_until_pick(pg, cdp, tag, max_s=300):
    """照演到第一次要選互動點：回傳 'layer'／'menu'／None；圖層出現前把對話點掉（點得很快＝防誤觸那一招的情境）"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if await pg.evaluate("!!document.querySelector('#dateLayer .dlHot')"): return 'layer'
        if s['ch']:
            o = [x['t'] for x in s['ch']]
            i = next((k for k, t in enumerate(o) if t.startswith('出發')), None)
            if i is None and not await pg.evaluate("!!document.querySelector('#dateLayer')"):
                # 進到約會裡的文字選單（D28、?nodatelayer，或圖層退回文字選單）
                if (await pg.evaluate(STATE))['adv']: return 'menu'
                i = 0
            await P.tap_choice(pg, cdp, i); await pg.wait_for_timeout(700); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(120); continue   # 點很快（防誤觸情境）
        await pg.wait_for_timeout(300)
    return None


async def one(pg, cdp, case):
    loc, _, dep = case.partition('@'); dep = float(dep) if dep else 15.0   # BB-C 11-14：D05@20＝晚一點出發，讓時間不夠的點真的變暗
    tag = '[%s%s]' % (case, ' nodatelayer' if NODL else ''); fn = case.replace('@', '_')
    await pg.set_viewport_size(LAND)
    rel = 'DATING' if loc in ('D28',) else 'CLOSE'   # 11-14 DATE_LAYER_76f8：D28（兩天一夜）要第 6 階或交往中——用交往中
    d, seed = await SP.fresh(pg, cdp, tag, ['Y1S2', 5, 6], 14.5, 'dorm', {WHO: rel})
    await pg.evaluate("(()=>{ GAME.G.money=Math.max(GAME.G.money|0,5000); })()")
    bk = await P.prep(pg, cdp, R, BOOK_JS, {'who': WHO, 'loc': loc, 'dep': dep}, True, '%s DATE.book %s %s %.2f' % (tag, WHO, loc, dep)); await P.events_on(pg)
    if not R.check('FAIL_SETUP 檢查：%s 約會排上了' % tag, bk['ok'] and bool(bk['q']), J(bk)): return {'loc': loc, 'skip': 'book'}
    qh = float((bk.get('q') or {}).get('h') or dep)
    if qh - 0.25 > 14.5:   # 11-14 DATE_LAYER_76f8 D05@20：20:20 出發，讀檔在 14:30，300 秒只走到 16:39——【捷徑】撥到出發前 10 分鐘
        await pg.evaluate("(h=>{ GAME.G.hour=h; })", qh - 0.17); await pg.wait_for_timeout(1200)
        R.setup('%s 【捷徑】時間撥到出發（%.2f）前 10 分鐘' % (tag, qh))
    # 防誤觸：一邊點掉對話，一邊在頁面裡等圖層出現，出現當下真的觸控點第一個能點的標記
    mode = None; guard = None; t0 = time.time()
    while time.time() - t0 < 300 and mode is None:
        hit = await pg.evaluate(WAIT_LAYER, 1500)
        if hit and hit.get('menu'):
            st = await pg.evaluate(STATE)
            if st['adv'] and not st['layer']:
                o = [x['t'] for x in (await P.ts(pg))['ch']]
                if any(t.startswith('出發') for t in o): await P.tap_choice(pg, cdp, next(k for k, t in enumerate(o) if t.startswith('出發'))); await pg.wait_for_timeout(700); continue
                mode = 'menu'; break
            await P.tap_choice(pg, cdp, 0); await pg.wait_for_timeout(700); continue
        if hit:
            await L.touch_tap(cdp, hit['x'], hit['y']); await pg.wait_for_timeout(450)
            still = await pg.evaluate("!!document.querySelector('#dateLayer .dlHot')")
            guard = {'pid': hit['pid'], 'tapped_ms_after_shown': hit['since'], 'layer_still_open': still}
            R.note('%s ① 防誤觸：圖層出現 %s ms 時真的觸控點「%s」→ 圖層還開著＝%s' % (tag, hit['since'], hit['pid'], still))
            if hit['since'] is not None and hit['since'] < 350: R.check('%s ① 圖層出現 350 ms 內的點擊不算（沒被選走）' % tag, still, J(guard))
            else: R.note('%s ① 這一下已經在 350 ms 以後（%s ms），不算防誤觸的驗證；照實記' % (tag, hit['since']))
            mode = 'layer' if still else 'picked_by_guard'; break
        s = await P.ts(pg)
        if s['ch']:
            o = [x['t'] for x in s['ch']]; i = next((k for k, t in enumerate(o) if t.startswith('出發')), 0)
            await P.tap_choice(pg, cdp, i); await pg.wait_for_timeout(600)
        elif s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(80)
    await shot(pg, 'dl_%s_first.png' % fn)
    res = {'loc': loc, 'book': bk, 'mode': mode, 'guard': guard}
    want_menu = NODL or loc in ('D28', 'D33')   # BB-C 11-14：D33 和 D28 一樣走文字選單
    if mode in (None, 'picked_by_guard'):
        R.check('FAIL_SETUP 檢查：%s 走到選互動點那一步（圖層或文字選單）' % tag, False, J({'mode': mode, 'state': await pg.evaluate(STATE)})); return res
    if want_menu:
        R.check('%s 照設計是文字選單（%s）：出的是文字選單、沒有 #dateLayer' % (tag, 'nodatelayer' if NODL else '%s 照設計走文字選單' % loc), mode == 'menu', mode)
        o = [x['t'] for x in (await P.ts(pg))['ch']]; R.note('%s 文字選單：%s' % (tag, J(o))); res['menu'] = o
        await shot(pg, 'dl_%s_menu.png' % fn); return res
    if mode == 'menu':   # 11-14 DATE_LAYER_76f8 D05：出的是文字選單——把選單內容、畫面記下來再判
        o = [x['t'] for x in (await P.ts(pg))['ch']]; R.note('%s 出的是文字選單：%s；狀態 %s' % (tag, J(o), J(await pg.evaluate(STATE)))); res['menu'] = o
        await shot(pg, 'dl_%s_menu_unexpected.png' % fn)
    if not R.check('%s 出的是圖層（#dateLayer），不是文字選單' % tag, mode == 'layer', mode): return res
    await pg.wait_for_timeout(500)
    # ② 橫向
    a = await pg.evaluate(LAYER_JS); await shot(pg, 'dl_%s_land.png' % fn); res['land'] = a
    R.note('%s ② 橫向 %sx%s：標記 %d（停用 %d）、畫面外 %s、她 %s（被裁 %s、蓋到標記 %s）、標籤重疊 %s、結束鍵 %s、除錯字 %s' % (tag, a['vw'], a['vh'], a['n'], a['dim'], a['outView'], a['her'], a['herClipped'], a['herOnHot'], a['labOverlap'], a['end'], a['debugText']))
    R.check('%s ② 橫向：畫面上沒有除錯字（id、座標、PLACEHOLDER）' % tag, not a['debugText'], J(a['debugText']))
    R.check('%s ② 每個標記的觸控範圍 ≥44×44 px（最小 %s px）' % (tag, a['minHot']), (a['minHot'] or 0) >= 44, J([[h['pid'], h['r']['w'], h['r']['h']] for h in a['hots']]))
    dims = [h for h in a['hots'] if h['dim']]
    tdim = [h for h in dims if '時間差不多' in h['text']]
    R.note('%s ② 停用的標記：%s（其中時間不夠的 %s）' % (tag, J([h['text'] for h in dims]), J([h['pid'] for h in tdim])))
    if dep > 15.0: R.check('%s ② 晚出發（%.2f）：至少一個標記因「時間差不多了」變暗（下雨、休館停用的不算）' % (tag, dep), bool(tdim), J([h['text'] for h in dims]))
    if tdim: dims = tdim + [h for h in dims if h not in tdim]   # 停用的先點時間不夠那一個
    if dims:
        c = await pg.evaluate(CENTER, dims[0]['pid'])
        if c: await L.touch_tap(cdp, c['x'], c['y']); await pg.wait_for_timeout(500)
        st = await pg.evaluate("!!document.querySelector('#dateLayer .dlHot')"); R.check('%s ② 停用的標記「%s」點了不會選（圖層還在）' % (tag, dims[0]['text']), st, J(dims[0]))
    else: R.note('%s ② 這一輪沒有停用的標記（時間都夠）' % tag)
    # ③ 直向
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(900)
    b = await pg.evaluate(LAYER_JS); await shot(pg, 'dl_%s_port.png' % fn); res['port'] = b
    R.note('%s ③ 直向 %sx%s：可以左右滑 %s（scrollLeft %s／%s）；一開始畫面外的標記 %s；她 %s（被裁 %s、蓋到標記 %s）；標籤重疊 %s；除錯字 %s' % (tag, b['vw'], b['vh'], b['pan'], b['scrollLeft'], b['scrollMax'], b['outView'], b['her'], b['herClipped'], b['herOnHot'], b['labOverlap'], b['debugText']))
    R.check('%s ③ 直向：底圖照高度放滿、可以左右滑（.dlScroll.pan）' % tag, b['pan'], J({k: b[k] for k in ('pan', 'scrollLeft', 'scrollMax')}))
    R.check('%s ③ 直向：畫面上沒有除錯字' % tag, not b['debugText'], J(b['debugText']))
    live = [h for h in b['hots'] if not h['dim']]
    seated = await pg.evaluate("(()=>(typeof DATE_HOTSPOTS!=='undefined'&&DATE_HOTSPOTS.seated)||[])()")
    st_t = next((h for h in live if h['pid'] in seated), None)   # BB-C 11-14：D05、D12 選坐著的點（咖啡館、長椅），回到選點畫面她要換成坐姿 H4
    tgt = st_t or next((h for h in live if not h['inView']), None) or (live[0] if live else None)
    if not tgt: R.check('%s ③ 有能點的標記' % tag, False, J(b['hots'])); return res
    c = await pg.evaluate(CENTER, tgt['pid']); await pg.wait_for_timeout(500); await shot(pg, 'dl_%s_port_scrolled.png' % fn)
    b2 = await pg.evaluate(LAYER_JS); R.note('%s ③ 滑到「%s」（原本畫面外＝%s）：中心 %s；scrollLeft %s' % (tag, tgt['text'], not tgt['inView'], c, b2['scrollLeft']))
    # ④ 點下去＝選了
    await L.touch_tap(cdp, c['x'], c['y']); await pg.wait_for_timeout(1200)
    st = await pg.evaluate(STATE); await shot(pg, 'dl_%s_after_pick.png' % fn)
    R.check('%s ④ 點「%s」（螢幕 %d, %d）以後圖層收掉、接著演' % (tag, tgt['text'], c['x'], c['y']), not st['layer'], J(st))
    after = await SP.play(pg, cdp, '%s_after' % fn, 0, prefer=(), start_s=10, max_s=60)
    res['pick'] = {'pid': tgt['pid'], 'text': tgt['text'], 'xy': c, 'was_off_screen': not tgt['inView'], 'state': st, 'after': after}
    # 回到選點畫面（第二輪）：她的姿勢
    t1 = time.time(); back = False
    while time.time() - t1 < 90:
        if await pg.evaluate("!!document.querySelector('#dateLayer .dlHot')"): back = True; break
        s_ = await P.ts(pg)
        if s_['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if s_['ch'] or not (await pg.evaluate(STATE))['adv']: break
        await pg.wait_for_timeout(500)
    if back:
        await pg.wait_for_timeout(700); a2 = await pg.evaluate(LAYER_JS); await shot(pg, 'dl_%s_seated.png' % fn if st_t else 'dl_%s_round2.png' % fn); res['round2'] = a2
        R.note('%s ④ 回到選點畫面：她的圖 %s（剛做完的「%s」%s）' % (tag, a2['herSrc'], tgt['text'], '是坐著的點' if st_t else '不是坐著的點'))
        if st_t: R.check('%s ④ 做完坐著的點（%s）回到選點畫面，她換成坐姿 H4' % (tag, tgt['pid']), bool(a2['herSrc']) and 'H4' in a2['herSrc'], J(a2['herSrc']))
    elif st_t: R.check('%s ④ 做完坐著的點以後回到選點畫面（看坐姿）' % tag, False, J(await pg.evaluate(STATE)))
    # ⑤ 存讀檔
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(600)
    s0 = await pg.evaluate(STATE)
    await pg.evaluate("(()=>{ try{ GAME.autosave(true); return true; }catch(e){ return String(e); } })()"); await pg.wait_for_timeout(800)
    R.note('%s ⑤ 存檔前 %s' % (tag, J(s0)))
    await pg.reload(); await L.wait_loaded(pg, 600); await pg.wait_for_timeout(1500); await P.init(pg)   # 11-14 DATE_LAYER_76f8 D01／D12：reload 以後 __BBF 不見了（bbplay 的 helper 要重裝）
    ok = await L.tap(pg, cdp, '#btnContinue'); await pg.wait_for_timeout(6000)
    s1 = await pg.evaluate(STATE); await shot(pg, 'dl_%s_reload.png' % fn)
    after2 = await SP.play(pg, cdp, '%s_reload' % fn, 0, prefer=(), start_s=8, max_s=90)
    s2 = await pg.evaluate(STATE); await shot(pg, 'dl_%s_reload_end.png' % fn)
    R.note('%s ⑤ 重新整理 →「繼續」（%s）：讀回來 %s；之後照演 %d 句；最後 %s' % (tag, ok, J(s1), len(after2.get('lines') or []), J(s2)))
    R.check('%s ⑤ 存讀檔以後沒有卡住（沒有留著圖層、對話跑得完、玩家不是一直 busy）' % tag, not s2['layer'] and not s2['busy'] and s2['depth'] == 0, J(s2))
    res['reload'] = {'before': s0, 'loaded': s1, 'after': after2, 'end': s2}
    return res


async def main():
    print('CC DATE_LAYER（DATE-S6）：SHA %s；CASES %s；WHO %s；nodatelayer=%s；Playwright ≠ iPhone' % (SHA or '?', CASES, WHO, NODL), flush=True)
    out = {'sha': SHA, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for c in CASES:
            try: out['cases'].append(await one(pg, cdp, c))
            except Exception as e:
                R.check('[%s] 沒有中斷' % c, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash_%s.png' % c))
            open(os.path.join(OUT, 'date_layer.json'), 'w', encoding='utf-8').write(J(out))
            await pg.set_viewport_size(LAND); await pg.goto(URL); await L.wait_loaded(pg, 600)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
