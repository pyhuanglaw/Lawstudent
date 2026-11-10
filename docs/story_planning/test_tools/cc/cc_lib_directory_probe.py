"""CC X296 總圖大廳樓層簡介（LIB-BOARD-FLOAT-1110；使用者 11-10「總圖公告有兩個 一個漂浮」；LAWWW 7a019726d 修、改前 7a019726d^＝9f3133b99）——BB 08:52。
【前置／捷徑】load_zone 讀檔到 library_hall 出生點（門口）、14:00、條件事件關掉。手機直向（390×844）、橫向（844×390）各跑一次：
 ① 「看樓層簡介」互動點有幾個（改後 1、改前 2）、立牌網格在哪（名字含 board／directory／lbboard）
 ② L.go_to 真的走到互動點、互動鍵、按下去 → 對話框文字全文（翻完）；檢查 B1 寫「24 小時自習室」、1F／2F／3F 都有
 ③ 對話框出現時截圖；量對話框文字有沒有超出框（scrollHeight > clientHeight＝被切）
Playwright 手機模擬 ≠ iPhone。用法：LW_TESTS=<wt>/tests TAG=old|new [ORIENT=portrait,landscape] python3 cc_lib_directory_probe.py <url> <out>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'; ORIENTS = [o for o in (os.environ.get('ORIENT') or 'portrait,landscape').split(',') if o]
R = L.Run('lib_directory_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ITS = "(()=>(GAME.E.interactables||[]).filter(i=>/樓層簡介/.test(i.label||'')).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0})))()"
BOARDS = r"""(()=>{ const out=[]; GAME.E.scene.traverse(o=>{ if(!o.isMesh) return; const m=[].concat(o.material)[0]; const tn=m&&m.map&&m.map.userData&&m.map.userData.key||''; const n=(o.name||'')+'|'+tn;
  if(!/board|directory|lbboard/i.test(n)) return; let vis=true; for(let p=o;p;p=p.parent) if(p.visible===false){ vis=false; break; } if(!vis) return; const b=new THREE.Box3().setFromObject(o), c=b.getCenter(new THREE.Vector3());
  out.push({name:o.name||'(無名)', tex:tn||null, c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], minY:+b.min.y.toFixed(2)}); }); return out; })()"""
UI = """(()=>{ const ib=document.getElementById('interact'), d=document.getElementById('dlg'); const vis=e=>!!(e&&e.offsetParent!==null&&getComputedStyle(e).display!=='none');
  const P=GAME.E.player.obj.position; let clip=null; if(vis(d)){ const ts=[d,...d.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+2&&getComputedStyle(e).overflowY!=='visible'); const r=d.getBoundingClientRect(); clip={scroll:ts.map(e=>(e.id||e.className||e.tagName)+':'+e.scrollHeight+'>'+e.clientHeight), rect:[r.left|0,r.top|0,r.right|0,r.bottom|0], vw:innerWidth, vh:innerHeight}; }
  return {zone:GAME.G.zone, x:+P.x.toFixed(2), z:+P.z.toFixed(2), fb:GAME.walkFallbacks|0, interact:vis(ib)?(ib.innerText||'').trim():'', dlg:vis(d)&&GAME.D&&GAME.D.active?(d.innerText||'').replace('▼ 點一下繼續','').trim():'', clip}; })()"""


async def one(p, orient):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=(orient == 'landscape'))
    await pg.goto(URL)
    if not R.check('[%s] 遊戲載入' % orient, await L.wait_loaded(pg), ''): await b.close(); return
    R.setup('【前置／捷徑】[%s] 讀檔到 library_hall 出生點 2025-10-18 14:00，條件事件關掉' % orient)
    await D.load_zone(pg, cdp, 'library_hall', '2025-10-18', 14.0, wait=9000)
    its = await pg.evaluate(ITS); bd = await pg.evaluate(BOARDS); R.note('[%s] 樓層簡介互動點 %s；立牌網格 %s' % (orient, J(its), J(bd)))
    R.check('[%s] 「看樓層簡介」只有一個（使用者：兩個、一個漂浮）' % orient, len(its) == 1, J(its))
    if not its: await b.close(); return
    t = its[0]; u0 = await pg.evaluate(UI)
    ok = await L.go_to(pg, cdp, R, t['x'], t['z'], 0.5, '[%s] 走到樓層簡介' % orient, max_s=180, lv=t['lv'])
    await pg.wait_for_timeout(1200); u = await pg.evaluate(UI)
    R.check('[%s] 真的走到（walkFallbacks 沒加）、互動鍵是「看樓層簡介」' % orient, bool(ok) and u['fb'] == u0['fb'] and '樓層簡介' in u['interact'], J(u))
    await pg.screenshot(path=os.path.join(OUT, 'dir_%s_%s_1_front.png' % (TAG, orient)))
    if not u['interact']: await b.close(); return
    await L.tap(pg, cdp, '#interact'); lines = []; first = None
    for _ in range(20):
        await pg.wait_for_timeout(600); v = await pg.evaluate(UI)
        if not v['dlg']:
            if lines: break
            continue
        if first is None:
            first = v; await pg.screenshot(path=os.path.join(OUT, 'dir_%s_%s_2_text.png' % (TAG, orient)))
        if not lines or lines[-1] != v['dlg']: lines.append(v['dlg'])
        await pg.wait_for_timeout(1500); v2 = await pg.evaluate(UI)
        if v2['dlg'] == v['dlg']: await L.tap(pg, cdp, '#dlg')
    full = '\n'.join(lines); R.note('[%s] 對話框全文：%s' % (orient, J(lines)))
    R.check('[%s] 按下去有出現樓層簡介的文字' % orient, bool(lines), '')
    R.check('[%s] 對話框沒有被切（沒有捲動溢出、在畫面內）' % orient, bool(first) and not first['clip']['scroll'] and first['clip']['rect'][2] <= first['clip']['vw'] and first['clip']['rect'][3] <= first['clip']['vh'], J(first and first['clip']))
    R.check('[%s] 寫到 B1 是 24 小時自習室' % orient, 'B1' in full and '24' in full and '自習' in full, '')
    R.check('[%s] 1F、2F、3F 都有寫' % orient, all(f in full for f in ('1F', '2F', '3F')), '')
    R.check('[%s] 沒有 JS 例外' % orient, not errs, J(errs[:3]))
    await b.close()


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC X296 總圖樓層簡介：worktree %s；TAG %s；Playwright ≠ iPhone' % (real or '?', TAG), flush=True)
    async with async_playwright() as p:
        for o in ORIENTS: await one(p, o)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
