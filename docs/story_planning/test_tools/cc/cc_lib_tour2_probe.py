"""CC（帳號 A）11-03 BB 14:14：cc_lib_tour_probe 第二版。
- 七站的字改成從遊戲的 src/classes3d.js（TOUR 的 say）讀，不寫死（第 3 站 0f16f98a3 改字）。
- MODE=tap（點地面跟，同第一版）／MODE=joy（只用搖桿：手指滑鏡頭朝館員，再把搖桿往前推；不點地面）。
- 每一秒記館員、玩家位置、距離、層、區域、當下字幕（window.__trk）；每一次玩家的 moveTo（點地面、自動找路）記目標、路線長度、
  E.screenToFloor 的螢幕座標和落點；離開導覽的條件（classes3d.js runLibTour）：換區域、或離館員 25 m 以上（或不同層）超過 40 秒。
- 被判離開（字幕「你離開了」）那一刻截圖、印出前 10 秒的軌跡；全部存 tour_trace.json。
原說明（cc_lib_tour_probe 第一版：複製 tests/flow_lib_tour.py @6dc39be73，只改取樣）：用 MutationObserver 收集 #caption 出現過的每一句，
避免「跟著館員」走路的那 60 秒裡字幕出現又消失而漏記（PC 上 D_B08 只記到 [1,2,4,6]）。判斷標準不變。
用法：LW_TESTS=<wt>/tests [MODE=tap|joy] [PHOTO=1] python3 cc_lib_tour2_probe.py URL OUT（PHOTO=1：3783ae554 以後的版本才加，見上面 PHOTO 的說明）
原說明：真實玩家流程：總圖新生導覽（AA_134 第 2 節；使用者 2026-10-15「開始到結束就是一個按鈕？」）。不用 ?turbo。
[前置／捷徑] 讀檔：2025-09-19（週五）15:20 總圖大廳的集合點旁；第一、二天主線已過、關掉條件事件。
A. 按集合點 →「參加：總圖新生導覽」→ 館員（NPC）出現、說第一站 → 玩家自己點地面跟著館員走（一樓閘門、服務台 → 大樓梯上二樓 → 研究小間 → 樓梯間）
   → 跟著上三樓閱覽區（換區域）→ 最後一站「以上。法律的書在四樓以上……」→ 記為參加完（full）。七站的話都出現過。
B. 中途離開：重新讀檔、參加後直接走出總圖大門 → 記「去過但沒走完」（partial），清單不打勾。
Playwright 手機模擬＋SwiftShader，不是 iPhone 實機。用法：python3 tests/flow_lib_tour.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
import os
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_lib_tour'
MODE = os.environ.get('MODE', 'tap')
# PHOTO=1（候選版 3783ae554 以後；BB 16:11）：導覽途中（15:55 前後）不能跳「出發：」選單；導覽結束後 5 分鐘（遊戲時間）內要跳系學會合照的「出發：」，選了還來得及去
PHOTO = os.environ.get('PHOTO', '') == '1'
# 搖桿版朝哪裡推（PC 11-03 N19_tour_joy：館員在大樓梯的平台（第 1 層），只朝她的 x、z 推會走到樓梯底下、不會上樓）：
#   用遊戲的找路（E.pathTo，跨樓層）看「往她那裡的路」前面 1.5 m 的點，鏡頭轉向那一點再推——像知道樓梯在哪的玩家；只拿來決定方向，不移動人
AIM = """(l=>{ const E=GAME.E, P=E.player, p=P.obj.position; const r=E.pathTo&&E.pathTo(p.x,p.z,P.lv|0,l.x,l.z,l.lv|0); if(!r||!r.length) return {x:l.x,z:l.z,via:'direct'};
  let acc=0, q=[p.x,p.z]; for(const w of r){ acc+=Math.hypot(w[0]-q[0],w[1]-q[1]); q=[w[0],w[1]]; if(acc>=1.5) return {x:w[0],z:w[1],via:'path',n:r.length}; }
  const w=r[r.length-1]; return {x:w[0],z:w[1],via:'path',n:r.length}; })(%s)"""
OUTSEEN = []          # 每次看到「出發：」選單：{t（遊戲時間）, touring, tour（導覽狀態）, opts}
POST = {'on': False}  # 導覽走完以後才 True：這時候的「出發：」照玩家想去合照，選「出發」
DAY = 3   # 2025-09-19 週五
PRE = {'zone': 'library_hall', 'hour': 15.33, 'day': DAY, 'weekday': 5, 'weather': 'clear', 'pos': {'x': -2.0, 'z': 3.6, 'lv': 0, 'yaw': 3.14},
       'flags': {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'plan': 'cafe'}}
LIB = "(()=>{ const n=GAME.E.npcs.find(n=>n.name==='館員'); return n?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),lv:n.lv|0}:null; })()"
CAP = "(()=>{ const el=document.getElementById('caption'); return el&&!el.classList.contains('hide')?el.textContent:''; })()"
CAPOBS = """(()=>{ if(window.__ccCaps) return 1; window.__ccCaps=[]; const el=document.getElementById('caption'); if(!el) return 0;
  const rec=()=>{ if(!el.classList.contains('hide')){ const t=el.textContent; const a=window.__ccCaps; if(t && a[a.length-1]!==t) a.push(t); } };
  new MutationObserver(rec).observe(el,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']}); rec(); return 1; })()"""
CAPALL = "(window.__ccCaps||[]).join('\\n')"
TOURSRC = """(async()=>{ const t=await (await fetch('src/classes3d.js?cc='+Date.now())).text(); const a=t.indexOf('const TOUR=['), b=t.indexOf('S.runLibTour',a);
  const seg=t.slice(a,b); const out=[]; const re=/say:'([^']+)'/g; let m; while((m=re.exec(seg))) out.push(m[1]); return out; })()"""
TRACK = """(()=>{ if(window.__trk) return 1; window.__trk=[]; window.__taps=[]; const E=GAME.E, t0=performance.now();
  const s2f=E.screenToFloor; if(s2f) E.screenToFloor=function(x,y){ const h=s2f.apply(this,arguments); try{ window.__taps.push({k:'s2f',t:+((performance.now()-t0)/1000).toFixed(1),sx:Math.round(x),sy:Math.round(y),hit:h?[+h.x.toFixed(2),+h.z.toFixed(2),h.lv|0,+(h.y||0).toFixed(2)]:null}); }catch(e){} return h; };
  const mv=E.moveTo; E.moveTo=function(ent){ const r=mv.apply(this,arguments); try{ if(ent===E.player){ const P=E.player, pa=P.path||[]; let len=0, q=P.obj.position;
      for(const w of pa){ const wx=w.x!=null?w.x:w[0], wz=w.z!=null?w.z:w[1]; if(wx==null) continue; len+=Math.hypot(wx-q.x,wz-q.z); q={x:wx,z:wz}; }
      window.__taps.push({k:'moveTo',t:+((performance.now()-t0)/1000).toFixed(1),to:[+arguments[1].toFixed(2),+arguments[2].toFixed(2),arguments[4]],ok:!!r,n:pa.length,len:+len.toFixed(1)}); } }catch(e){} return r; };
  setInterval(()=>{ try{ const P=E.player.obj.position, n=E.npcs.find(n=>n.name==='館員'), c=document.getElementById('caption');
    const L=n?n.obj.position:null; window.__trk.push({t:+((performance.now()-t0)/1000).toFixed(1),zone:GAME.G.zone,p:[+P.x.toFixed(2),+P.z.toFixed(2),E.player.lv|0],
      l:L?[+L.x.toFixed(2),+L.z.toFixed(2),n.lv|0]:null,d:L?+Math.hypot(P.x-L.x,P.z-L.z).toFixed(2):null,
      cap:c&&!c.classList.contains('hide')?c.textContent.slice(0,24):''}); }catch(e){} },1000); return 1; })()"""
ST = "(()=>ACTIVITIES.stateOf(GAME.G,'lib_tour_y1s1',GAME.G.day))()"
LINES = ['新生導覽，十五分鐘', '進出都要刷學生證', '借書、還書、預約研究小間', '二樓的長桌不用預約', '研究小間要上網預約', '三樓比較安靜', '以上。法律的書在四樓以上']

async def handle_choices(pg, cdp, run):
    """跟著館員走的時候跳出來的選單。
    圓窗館前的合照（AA_555 L3，src/campus_l123_3d.js；11-01 加的）：大一上第 3 週週五 16:00，正好是這支測試的 9/19；
    手機邀請會排進行程（OUT.plan），15:55 跳「出發：圓窗館前 16:00：系學會合照／晚一點／不去了」。
    人在導覽裡，像玩家一樣先「不去了」（outings3d.js：不扣分）。其他選單照舊點第一個（和原本 go_to 裡的 advance_dialogs 一樣）。
    11-02 LAWWW2：原本沒處理，go_to 點了第一個「出發」，人被帶到圓窗館前 (−104,−17)，導覽記成沒走完——第一版、第二版大廳都一樣"""
    c = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
    if not c: return False
    if any(x.startswith('出發：') for x in c):
        g = await pg.evaluate("({h:+(+GAME.G.hour).toFixed(3), touring:!!(typeof CLS!=='undefined'&&CLS.touring), tour:ACTIVITIES.stateOf(GAME.G,'lib_tour_y1s1',GAME.G.day)})")
        OUTSEEN.append(dict(g, opts=[x[:30] for x in c], post=POST['on']))
        if POST['on']:   # 導覽走完了：去合照
            i = next((k for k, x in enumerate(c) if x.startswith('出發')), None)
            run.note('導覽結束後跳出「%s」（%s）：選「出發」' % (c[i][:30], g['h'])); await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (i + 1)); await pg.wait_for_timeout(1500); POST['went'] = g['h']; return True
        i = next((k for k, x in enumerate(c) if x.startswith('不去')), None)
        if i is not None:
            run.note('跳出「%s」：在導覽裡，選「%s」' % (c[0][:30], c[i])); await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (i + 1)); await pg.wait_for_timeout(1200); return True
    await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['choices'] and not q['dlg'], max_steps=20); return True


async def join(pg, cdp, run):
    await L.load_state(pg, PRE, quiet_events=True); await pg.wait_for_timeout(5000)
    it = await L.find_it(pg, '新生導覽集合點')
    ok = bool(it) and await L.go_to(pg, cdp, run, it['x'], it['z'], 0.8, '集合點')
    s = await L.state(pg)
    run.check('走到集合點、出現「新生導覽集合點」', ok and '集合點' in s['interact'], s['interact'])
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    c = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
    run.check('選項「參加：總圖新生導覽」', bool(c) and c[0].startswith('參加：總圖新生導覽'), json.dumps(c, ensure_ascii=False))
    await L.tap(pg, cdp, '#choices button:nth-child(1)')

async def main():
    run = L.Run('flow_lib_tour', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        global LINES
        src = await pg.evaluate(TOURSRC)
        src = [x for k, x in enumerate(src) if k == 0 or x != src[k - 1]]   # 同一站的兩個分支（三元運算）寫同一句：只算一次
        LINES = [x[:10] for x in src]
        print('  七站的字（從 src/classes3d.js 的 TOUR 讀）：' + json.dumps(src, ensure_ascii=False), flush=True)
        run.check('從遊戲讀到七站的字', len(LINES) == 7, json.dumps(LINES, ensure_ascii=False))
        run.setup('讀檔：2025-09-19（週五）15:20 總圖大廳集合點旁；關掉條件事件')
        await join(pg, cdp, run)
        await pg.evaluate(CAPOBS); await pg.evaluate(TRACK)
        run.note('MODE=%s' % MODE)
        seen, t0, zones, acts = [], time.time(), set(), []   # acts：每一輪做了什麼（看搖桿版為什麼跟不上）
        while time.time() - t0 < 1500:
            cap = await pg.evaluate(CAPALL)
            for i, l in enumerate(LINES):
                if l in cap and i not in seen: seen.append(i); await run.shot(pg, f'A_stop{i}')
            st = await pg.evaluate(ST); zones.add(await pg.evaluate("GAME.G.zone"))
            if st == 'full': break
            s = await L.state(pg)
            if s['choices'] and await handle_choices(pg, cdp, run): acts.append([round(time.time() - t0), 'choice']); continue
            if s['dlg']: acts.append([round(time.time() - t0), 'dlg']); await L.tap(pg, cdp, '#dlg'); continue
            lib = await pg.evaluate(LIB)
            if lib:
                d = await pg.evaluate("(l=>{ const P=GAME.E.player; return (P.lv|0)!==l.lv?99:Math.hypot(P.obj.position.x-l.x,P.obj.position.z-l.z); })(%s)" % json.dumps(lib))
                if d > 2.5:
                    if MODE == 'joy':   # 只用搖桿：手指滑鏡頭朝館員、搖桿往前推（d 越遠推越久）
                        aim = await pg.evaluate(AIM % json.dumps(lib))
                        tc = await L.turn_camera_to(pg, cdp, aim['x'], aim['z'])
                        p0 = await pg.evaluate("[GAME.E.player.obj.position.x,GAME.E.player.obj.position.z]")
                        await L.joystick(pg, cdp, 0, -60, int(min(2500, 300 + min(d, 8) * 250)))
                        p1 = await pg.evaluate("[GAME.E.player.obj.position.x,GAME.E.player.obj.position.z]")
                        if math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < 0.3:   # 被擋住：像玩家一樣往斜前方、旁邊繞（不點地面）
                            for dx, dy in ((42, -42), (-42, -42), (60, 0), (-60, 0), (42, 42), (-42, 42)):
                                await L.joystick(pg, cdp, dx, dy, 900)
                                p2 = await pg.evaluate("[GAME.E.player.obj.position.x,GAME.E.player.obj.position.z]")
                                if math.hypot(p2[0] - p1[0], p2[1] - p1[1]) >= 0.3:
                                    run.note('搖桿往前被擋住，往 (%d,%d) 繞開' % (dx, dy)); break
                        p3 = await pg.evaluate("[GAME.E.player.obj.position.x,GAME.E.player.obj.position.z]")
                        acts.append([round(time.time() - t0), 'joy', round(d, 2), bool(tc), round(math.hypot(p3[0] - p0[0], p3[1] - p0[1]), 2), aim.get('via')])
                    else:
                        await L.go_to(pg, cdp, run, lib['x'], lib['z'], 1.8, '跟著館員', max_s=60, lv=lib['lv'], stop=lambda q: q['choices'] > 0 or q['dlg'])   # 對話、選單都交給主迴圈（handle_choices）：go_to 自己的 advance_dialogs 會把對話後面接的「出發：圓窗館前」點第一個（PC 11-03 N19_tour_tap：t=21 s 被帶到 (−104,−17)）
            await pg.wait_for_timeout(1200)
        trk = await pg.evaluate("window.__trk||[]"); taps = await pg.evaluate("window.__taps||[]")
        li = next((k for k, e in enumerate(trk) if e['cap'].startswith('你離開了')), None)
        if li is not None:
            print('  被判離開導覽（t=%.1f s）；前 10 秒：' % trk[li]['t'], flush=True)
            for e in trk[max(0, li - 10):li + 1]: print('    ' + json.dumps(e, ensure_ascii=False), flush=True)
            tl = trk[li]['t']; print('  前 20 秒的點地面／moveTo：' + json.dumps([x for x in taps if tl - 20 <= x['t'] <= tl], ensure_ascii=False)[:1500], flush=True)
            await pg.screenshot(path=OUT + '/A_left.png')
        with open(OUT + '/tour_trace.json', 'w', encoding='utf8') as f: json.dump({'mode': MODE, 'lines': LINES, 'track': trk, 'taps': taps, 'acts': acts}, f, ensure_ascii=False, indent=0)
        cap = await pg.evaluate(CAPALL)
        for i, l in enumerate(LINES):
            if l in cap and i not in seen: seen.append(i)
        seen.sort(key=lambda i: cap.find(LINES[i]))
        print('  館員字幕（依出現順序）:', json.dumps([c[:24] for c in cap.split(chr(10))], ensure_ascii=False))
        st = await pg.evaluate(ST)
        run.check('A 七站的話依序都出現（館員說）', seen == list(range(7)), json.dumps(seen))
        run.check('A 跟著館員從總圖大廳走到三樓閱覽區（換區域）', 'library' in zones and 'library_hall' in zones, json.dumps(sorted(zones)))
        run.check('A 走完：記為參加完（full）', st == 'full', str(st))
        if PHOTO:
            during = [o for o in OUTSEEN if not o['post']]
            run.check('A 導覽途中沒有跳「出發：」選單（15:55 系學會合照要等導覽結束）', not during, json.dumps(during, ensure_ascii=False))
            POST['on'] = True; h0 = await pg.evaluate("+GAME.G.hour"); t1 = time.time(); dl = []
            run.note('導覽結束（遊戲時間 %.3f）：等合照的「出發：」選單，最多 5 分鐘遊戲時間' % h0)
            while time.time() - t1 < 900 and 'went' not in POST:
                if await pg.evaluate("+GAME.G.hour") > h0 + 5 / 60 + 0.005: break
                s = await L.state(pg)
                if s['choices']: await handle_choices(pg, cdp, run); continue
                if s['dlg']: dl.append(await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")); await L.tap(pg, cdp, '#dlg'); continue
                await pg.wait_for_timeout(1000)
            post = [o for o in OUTSEEN if o['post']]
            run.check('A 導覽結束後 5 分鐘內跳出合照的「出發：」', 'went' in POST and POST['went'] <= h0 + 5 / 60 + 0.005, json.dumps({'end': h0, 'seen': post}, ensure_ascii=False))
            if 'went' in POST:   # 選了出發：要真的到得了（圓窗館前 (−104,−17)），沒有「錯過／來不及」
                t2 = time.time(); arrived = None
                while time.time() - t2 < 600:
                    s = await L.state(pg)
                    if s['dlg']: dl.append(await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")); await L.tap(pg, cdp, '#dlg'); continue
                    if s['choices']: await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['choices'] and not q['dlg'], max_steps=10); continue
                    q = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return {z:GAME.G.zone, d:Math.hypot(p.x+104,p.z+17), h:+(+GAME.G.hour).toFixed(3)}; })()")
                    if q['z'] == 'campus' and q['d'] < 10: arrived = q; break
                    await pg.wait_for_timeout(1500)
                await pg.wait_for_timeout(8000)
                for _ in range(30):
                    s = await L.state(pg)
                    if not s['dlg']: break
                    dl.append(await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")); await L.tap(pg, cdp, '#dlg')
                print('  合照前後的對話：' + json.dumps([x[:40] for x in dl], ensure_ascii=False), flush=True)
                late = [x for x in dl if any(k in x for k in ('錯過', '來不及', '已經拍完', '拍完了'))]
                run.check('A 選「出發」以後到得了圓窗館前、沒有「錯過／來不及」', arrived is not None and not late, json.dumps({'arrived': arrived, 'late': late}, ensure_ascii=False))
                await pg.screenshot(path=OUT + '/A_photo.png')
            POST['on'] = False; POST.pop('went', None)   # B 段照舊：出發選單選「不去了」
        # B 中途離開
        run.setup('重新讀同一個前置存檔')
        await join(pg, cdp, run); await pg.wait_for_timeout(3000)
        ok = await L.go_to(pg, cdp, run, 0, 8.0, 0.6, '大門')
        for _ in range(60):
            if await pg.evaluate("GAME.G.zone") != 'library_hall': break
            s = await L.state(pg)
            if s['interact']: await L.tap(pg, cdp, '#interact')
            await pg.wait_for_timeout(1500)
        await pg.wait_for_timeout(3000)
        st = await pg.evaluate("ACTIVITIES.stateOf(GAME.G,'lib_tour_y1s1',%d)" % DAY)
        run.check('B 參加後走出總圖：記「去過但沒走完」（partial），清單不打勾', st == 'partial', str(st))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()

sys.exit(asyncio.run(main()))
