"""CC X295 公告欄分頁版面探針 C（BULLETIN-BOARD-1110；改後 LAWWW 8c050804c（08:49，原 3f6dba142），改前 10df264ed）——BB：長海報有沒有被裁、字有沒有疊、關閉摸不摸得到、每一頁都翻到並截圖。
三棟（實際 zone 以程式為準）：共同 gongtong、普通 putong、博思 boya（博思有兩個：講座資訊螢幕 zoneFilter＋一般公告欄）。
  公告欄互動點＝teach3d.js：(bd.x+sin(ry)*0.9, bd.z+cos(ry)*0.9)、lv 0；label「看公告欄」／「看講座資訊（螢幕）」。
  改後：按下去＝GM.sceneBegin＋GM.say(null, look)＋每一頁 GM.say(null, ACTIVITIES.boardPages(G, zone?))＝對話框 #dlg（#dlgName／#dlgText／#dlgNext「▼ 點一下繼續」）一頁一頁點；
        沒有獨立的關閉鈕：最後一頁點一下對話框＝關掉。探針照實記錄（另外找畫面上有沒有「關閉／略過／收起／×」的按鈕，有的話一起量）。
  改前：按下去＝字幕 #caption（look＋posterText 一整段）顯示 4.6 秒自己消失，沒有分頁。探針量字幕的版面、照實記錄差異。
【前置／捷徑】D.load_zone：GAME.applySave 直接放到那一棟（不給座標＝區域的預設出生點，入口附近）、DATE（預設 2025-09-08 大一上第 2 週週一，演講・活動＋五張招生海報；博思的講座資訊螢幕用 SCREEN_DATE 預設 2025-11-03 第 10 週，9/8 螢幕只有「這週沒有新的公告。」）HOUR（預設 12）、條件事件關掉、手機自動打開關掉。
之後真實玩家操作（不用 ?turbo、不瞬移）：L.go_to 點地面／搖桿走到公告欄前 → 互動鍵的字 → 手指按 #interact → 每一頁等字打完、量、截圖、手指點 #dlg 翻下一頁 → 最後一頁點掉 → 對話框關掉、人可以動。
量測（JS）：對話框／字幕在畫面內（含 safe-area；Playwright 的 env(safe-area-inset-*) 是 0）、#dlgText scrollHeight vs clientHeight 與 overflow、文字行的 Range rect 有沒有超出框或畫面、
  畫面上看得到的文字元素兩兩重疊（排除祖先／子孫）、文字溢出（scrollWidth>clientWidth 且 overflow 不是 visible）、點的地方（框中心、四角內縮 8 px、文字行）elementFromPoint 有沒有被蓋住、可點範圍 ≥44×44。
每頁的字和 ACTIVITIES.boardPages 逐字比（看得到的＝整頁、沒有少字）。
ORIENT＝portrait,landscape（預設兩個都跑）；BOARDS＝gongtong,putong,boya（預設全跑；boya＝螢幕＋公告欄兩個）。
Playwright 手機模擬（SwiftShader）≠ iPhone 實機：safe-area、字型、實際手指大小都沒驗證。
用法：LW_TESTS=<wt>/tests TAG=new|old python3 cc_x295_board_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
DATE = os.environ.get('DATE') or '2025-09-08'; SCREEN_DATE = os.environ.get('SCREEN_DATE') or '2025-11-03';   # 博思的講座資訊螢幕只列博思的：9/8 是「這週沒有新的公告。」，另外用大一上第 10 週（辯論社社課＋博思 101 電影夜）
HOUR = float(os.environ.get('HOUR') or 12)
ORIENTS = [o.strip() for o in (os.environ.get('ORIENT') or 'portrait,landscape').split(',') if o.strip()]
BOARDS = [b.strip() for b in (os.environ.get('BOARDS') or 'gongtong,putong,boya').split(',') if b.strip()]
MAXP = int(os.environ.get('MAXP') or 20); TYPE_S = int(os.environ.get('TYPE_S') or 60)   # 等字打完最多幾秒（SwiftShader 一頁 70 字要 20 秒以上）
R = L.Run('x295_board_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

BOARDS_JS = """(()=>(GAME.E.interactables||[]).filter(i=>i.board&&!i.hidden).map(i=>({label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), lv:i.lv|0, r:i.radius||1, onInteract:!!i.onInteract})))()"""
PAGES_JS = """(z=>{ try{ return ACTIVITIES.boardPages?ACTIVITIES.boardPages(GAME.G,z||undefined):null; }catch(e){ return 'ERR '+e; } })"""
POSTER_JS = """(z=>{ try{ return ACTIVITIES.posterText(GAME.G,z||undefined); }catch(e){ return 'ERR '+e; } })"""
UI = """(()=>{ const ib=document.getElementById('interact'), d=document.getElementById('dlg'), c=document.getElementById('caption');
  const vis=e=>!!(e&&e.offsetParent!==null&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'&&!e.classList.contains('hide'));
  const P=GAME.E.player; return {x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), lv:P.lv|0, busy:!!P.busy,
    interact:vis(ib)?(ib.innerText||'').trim():'', dlg:!!(vis(d)&&GAME.D&&GAME.D.active), typing:!!(GAME.D&&GAME.D.typing),
    text:vis(d)?(document.getElementById('dlgText').textContent||''):'', full:GAME.D?(GAME.D.full||''):'', name:vis(d)?(document.getElementById('dlgName').textContent||''):'',
    caption:(vis(c)&&+getComputedStyle(c).opacity>0.05)?(c.innerText||''):'', zone:GAME.G.zone, hour:+GAME.G.hour.toFixed(2)}; })()"""

# 版面量測：box＝要量的框（#dlg 或 #caption）、textSel＝裡面的文字（#dlgText 或 #caption）
MEASURE = r"""((q)=>{ const vw=innerWidth, vh=innerHeight, box=document.querySelector(q.box), tx=document.querySelector(q.text); if(!box||!tx) return {err:'no box'};
  const rr=r=>({l:+r.left.toFixed(1),t:+r.top.toFixed(1),r:+r.right.toFixed(1),b:+r.bottom.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)});
  const sai=(()=>{ const p=document.createElement('div'); p.style.cssText='position:fixed;left:0;top:0;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);visibility:hidden'; document.body.appendChild(p); const s=getComputedStyle(p); const o={t:parseFloat(s.paddingTop)||0,r:parseFloat(s.paddingRight)||0,b:parseFloat(s.paddingBottom)||0,l:parseFloat(s.paddingLeft)||0}; p.remove(); return o; })();
  const B=box.getBoundingClientRect(), T=tx.getBoundingClientRect(), cs=getComputedStyle(tx), bcs=getComputedStyle(box);
  // 文字一行一行的 rect（Range）
  const rg=document.createRange(); rg.selectNodeContents(tx); const lines=[...rg.getClientRects()].filter(r=>r.width>0.5&&r.height>0.5);
  const lb=lines.length?{t:Math.min(...lines.map(r=>r.top)),b:Math.max(...lines.map(r=>r.bottom)),l:Math.min(...lines.map(r=>r.left)),r:Math.max(...lines.map(r=>r.right))}:null;
  const tol=1.5; const outBox=lines.filter(r=>r.top<B.top-tol||r.bottom>B.bottom+tol||r.left<B.left-tol||r.right>B.right+tol).length;
  const outView=lines.filter(r=>r.top<sai.t-tol||r.bottom>vh-sai.b+tol||r.left<sai.l-tol||r.right>vw-sai.r+tol).length;
  // 被裁：文字的框比內容小、又不能捲（或能捲但沒捲到）
  const clipY=tx.scrollHeight>tx.clientHeight+1, clipX=tx.scrollWidth>tx.clientWidth+1, scrollY=/(auto|scroll)/.test(cs.overflowY), scrollX=/(auto|scroll)/.test(cs.overflowX);
  const boxClipY=box.scrollHeight>box.clientHeight+1&&!/visible/.test(bcs.overflowY);
  // 畫面上看得到的文字元素（自己有字的）兩兩重疊（排除祖先／子孫；Range 量字本身，不量整個 block）
  const visEl=e=>{ for(let a=e;a&&a!==document.documentElement;a=a.parentElement){ const s=getComputedStyle(a); if(s.display==='none'||s.visibility==='hidden'||+s.opacity<0.05) return false; if(a.classList&&a.classList.contains('hide')) return false; } return true; };
  const items=[]; const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n; const per=new Map();
  while((n=walk.nextNode())){ if(!n.nodeValue.trim()) continue; const e=n.parentElement; if(!e||/^(SCRIPT|STYLE|NOSCRIPT|TITLE)$/.test(e.tagName)) continue; const r=document.createRange(); r.selectNodeContents(n);
    for(const x of r.getClientRects()){ if(x.width<1||x.height<1||x.right<0||x.bottom<0||x.left>vw||x.top>vh) continue; if(!per.has(e)) per.set(e,[]); per.get(e).push(x); } }
  for(const [e,rs] of per){ if(!visEl(e)) continue; items.push({e,rs,id:(e.id?'#'+e.id:e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''))+'「'+(e.textContent||'').trim().slice(0,14)+'」'}); }
  const overlaps=[]; for(let i=0;i<items.length;i++) for(let j=i+1;j<items.length;j++){ const A=items[i], C=items[j]; if(A.e.contains(C.e)||C.e.contains(A.e)) continue;
    let area=0; for(const a of A.rs) for(const c of C.rs){ const w=Math.min(a.right,c.right)-Math.max(a.left,c.left), h=Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top); if(w>1&&h>1) area+=w*h; }
    if(area>4) overlaps.push(A.id+' × '+C.id+'＝'+Math.round(area)+'px²'); }
  // 自己這個框裡的行和行有沒有疊（行距太小）
  let selfOv=0; for(let i=0;i<lines.length;i++) for(let j=i+1;j<lines.length;j++){ const a=lines[i], c=lines[j]; const w=Math.min(a.right,c.right)-Math.max(a.left,c.left), h=Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top); if(w>2&&h>2) selfOv++; }
  // 文字溢出（元素的字超出自己、overflow 不是 visible＝被切掉）
  const overflowed=[]; for(const it of items){ const e=it.e, s=getComputedStyle(e); if(s.overflowX!=='visible'&&e.scrollWidth>e.clientWidth+1&&e.clientWidth>0&&!/(auto|scroll)/.test(s.overflowX)) overflowed.push(it.id+' x'); if(s.overflowY!=='visible'&&e.scrollHeight>e.clientHeight+1&&e.clientHeight>0&&!/(auto|scroll)/.test(s.overflowY)) overflowed.push(it.id+' y'); }
  // 點得到嗎：框中心、四角內縮 8 px、每一行中間
  const hitAt=(x,y)=>{ if(x<0||y<0||x>=vw||y>=vh) return 'OUT'; const h=document.elementFromPoint(x,y); return h&&(h===box||box.contains(h))?'OK':(h?(h.id||h.tagName):'null'); };
  const pts=[[ (B.left+B.right)/2,(B.top+B.bottom)/2 ],[B.left+8,B.top+8],[B.right-8,B.top+8],[B.left+8,B.bottom-8],[B.right-8,B.bottom-8]];
  const hits=pts.map(p=>hitAt(p[0],p[1])), lineHits=lines.map(r=>hitAt((r.left+r.right)/2,(r.top+r.bottom)/2)).filter(h=>h!=='OK');
  // 畫面上有沒有「關閉／略過／收起／×」的按鈕
  const closers=[...document.querySelectorAll('button,[role=button],.btn,[id*=lose],[id*=kip]')].filter(e=>visEl(e)&&e.getBoundingClientRect().width>0&&/關閉|略過|收起|×|✕|返回/.test((e.textContent||'')+(e.getAttribute('aria-label')||''))).map(e=>{ const r=e.getBoundingClientRect(); const cx=(r.left+r.right)/2, cy=(r.top+r.bottom)/2; const h=(cx>=0&&cy>=0&&cx<vw&&cy<vh)?document.elementFromPoint(cx,cy):null;
      return {id:e.id||'', t:(e.textContent||'').trim().slice(0,10), rect:rr(r), hit:!!h&&(h===e||e.contains(h)), inView:r.left>=0&&r.top>=0&&r.right<=vw&&r.bottom<=vh}; });
  return {vw,vh,sai, box:rr(B), text:rr(T), lines:lines.length, lineBox:lb&&{t:+lb.t.toFixed(1),b:+lb.b.toFixed(1),l:+lb.l.toFixed(1),r:+lb.r.toFixed(1)}, outBox, outView,
    boxInView:B.top>=sai.t-tol&&B.left>=sai.l-tol&&B.bottom<=vh-sai.b+tol&&B.right<=vw-sai.r+tol, sh:tx.scrollHeight, ch:tx.clientHeight, sw:tx.scrollWidth, cw:tx.clientWidth,
    ovY:cs.overflowY, ovX:cs.overflowX, clipY, clipX, scrollY, scrollX, boxClipY, boxOv:bcs.overflowY, fontPx:parseFloat(cs.fontSize), lh:cs.lineHeight,
    overlaps, selfOv, overflowed, hits, lineHits, closers, tapW:+B.width.toFixed(1), tapH:+B.height.toFixed(1)}; })"""


def gen_boards():
    out = []
    for b in BOARDS:
        if b == 'boya':
            out += [('boya', 'boya', '看講座資訊', 'boya'), ('boya', 'boya_board', '看公告欄', None)]   # 螢幕 zoneFilter＝只列博思；公告欄不過濾
        else:
            out.append((b, b, '看公告欄', None))
    return out


async def wait_typed(pg, max_s=60):
    t0 = time.time()
    while time.time() - t0 < max_s:
        u = await pg.evaluate(UI)
        if not u['dlg'] or not u['typing']: return u, False
        await pg.wait_for_timeout(400)
    return await pg.evaluate(UI), True


def judge(tag, m, box_name):
    """一頁的版面判定（不放寬）"""
    R.check('%s %s 整個框在畫面內（含 safe-area；框 %s、畫面 %sx%s）' % (tag, box_name, J(m['box']), m['vw'], m['vh']), m['boxInView'], J(m['box']))
    cut = (m['clipY'] and not m['scrollY']) or (m['clipX'] and not m['scrollX']) or m['boxClipY'] or m['outBox'] > 0 or m['outView'] > 0
    R.check('%s 長內容沒有被裁（文字 %d 行；scrollHeight %s／clientHeight %s、overflow-y %s；超出框 %d 行、超出畫面 %d 行）' % (tag, m['lines'], m['sh'], m['ch'], m['ovY'], m['outBox'], m['outView']), not cut,
            J({k: m[k] for k in ('clipY', 'clipX', 'scrollY', 'boxClipY', 'boxOv', 'outBox', 'outView', 'lineBox', 'box')}))
    if m['clipY'] and m['scrollY']: R.note('%s 文字比框長，但框可以捲（overflow-y %s）：要手指捲才看得到後面' % (tag, m['ovY']))
    R.check('%s 字沒有疊在一起（畫面上的文字元素兩兩不重疊、框裡行和行不疊）' % tag, not m['overlaps'] and m['selfOv'] == 0, J({'overlaps': m['overlaps'][:8], 'selfOv': m['selfOv']}))
    R.check('%s 沒有文字溢出被切掉（overflow 不是 visible 又裝不下）' % tag, not m['overflowed'], J(m['overflowed'][:8]))
    R.check('%s 框沒有被別的東西蓋住（中心、四角、每一行中間 elementFromPoint 都是框）' % tag, all(h == 'OK' for h in m['hits']) and not m['lineHits'], J({'hits': m['hits'], 'lineHits': m['lineHits'][:6]}))


async def one_board(pg, cdp, orient, zone, key, label0, zfilter):
    tag = '[%s｜%s]' % (orient, key)
    day = SCREEN_DATE if zfilter else DATE
    s = await D.load_zone(pg, cdp, zone, day, HOUR)
    R.setup('%s GAME.applySave 放到 %s（區域預設出生點＝入口附近）%s %.1f 時；條件事件、手機自動打開關掉' % (tag, zone, day, HOUR))
    if not R.check('%s 到了 %s' % (tag, zone), s['zone'] == zone, J(s)): return
    bs = await pg.evaluate(BOARDS_JS); R.note('%s %s 的公告欄互動點：%s' % (tag, zone, J(bs)))
    bd = next((b for b in bs if b['label'].startswith(label0)), None)
    if not R.check('%s 有「%s」互動點' % (tag, label0), bool(bd), J(bs)): return
    exp = await pg.evaluate(PAGES_JS, zfilter); post = await pg.evaluate(POSTER_JS, zfilter)
    R.note('%s 這一版的 ACTIVITIES.boardPages：%s' % (tag, J(exp) if exp is not None else '沒有（改前）'))
    R.note('%s posterText：%s' % (tag, post[:300]))
    fb0 = (await D.st(pg))['fb']
    tgt = await D.standable_near(pg, bd['x'], bd['z'], bd['r'] * 0.6, bd['lv'])
    if not R.check('%s 公告欄互動範圍裡有站得住的地方' % tag, bool(tgt), J(bd)): return
    R.note('%s 從 (%s, %s) 走到公告欄前 %s（互動點 (%s, %s)）' % (tag, s['x'], s['z'], J(tgt), bd['x'], bd['z']))
    await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.3, '%s 走到公告欄' % tag, max_s=180, lv=bd['lv'])
    s = await D.settle(pg)
    for _ in range(10):
        if s['interact'].startswith(label0): break
        await pg.wait_for_timeout(500); s = await D.st(pg)
    if not s['interact'].startswith(label0):
        await L.go_to(pg, cdp, R, bd['x'], bd['z'], 0.4, '%s 往互動點中心' % tag, max_s=60, lv=bd['lv']); s = await D.settle(pg)
    fb1 = (await D.st(pg))['fb']
    R.check('%s 真的走到公告欄前（沒有被放到目的地）、互動鍵是「%s」' % (tag, label0), s['interact'].startswith(label0) and fb1 == fb0, J({k: s[k] for k in ('x', 'z', 'lv', 'interact', 'fb')}))
    await pg.screenshot(path=os.path.join(OUT, 'x295_%s_%s_%s_0front.png' % (TAG, orient, key)))
    if not s['interact'].startswith(label0): return
    await L.tap(pg, cdp, '#interact')
    got = None
    for _ in range(10):
        await pg.wait_for_timeout(400); u = await pg.evaluate(UI)
        if u['dlg'] or u['caption']: got = u; break
    if not R.check('%s 按下去 4 秒內出現對話框（分頁）或字幕' % tag, bool(got), J(await pg.evaluate(UI))): return
    if not got['dlg']:
        # 改前：字幕一段、4.6 秒自己消失，沒有分頁、沒有關閉
        m = await pg.evaluate(MEASURE, {'box': '#caption', 'text': '#caption'})
        await pg.screenshot(path=os.path.join(OUT, 'x295_%s_%s_%s_1caption.png' % (TAG, orient, key)))
        R.note('%s 這一版是字幕（#caption），沒有分頁：%s' % (tag, got['caption'][:400]))
        R.note('%s 字幕版面：%s' % (tag, J({k: m[k] for k in ('box', 'lines', 'sh', 'ch', 'fontPx', 'overlaps')})))
        judge(tag + '（字幕）', m, '#caption')
        R.check('%s 有分頁（一頁一頁點）' % tag, False, '改前：只有 4.6 秒的字幕')
        await pg.wait_for_timeout(5500); u = await pg.evaluate(UI)
        R.note('%s 5.5 秒後字幕%s' % (tag, '還在' if u['caption'] else '自己消失了（玩家不用按任何東西，但也沒辦法停下來看完）'))
        return
    # 改後：一頁一頁
    seen = []; missed = []; closed = False
    for i in range(MAXP):
        u, stuck = await wait_typed(pg, TYPE_S)
        if not u['dlg']: closed = True; break
        if stuck:
            # 字打太慢（SwiftShader 低幀率）：手指點一下＝這一頁整頁出來（不是翻頁）。剛好打完的那一瞬間點到會翻到下一頁——用全文認頁，翻過頭照實記
            full0 = u['full']; R.note('%s 第 %d 頁 %d 秒字還沒打完：手指點一下讓它整頁出來' % (tag, i + 1, TYPE_S)); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700)
            u, _ = await wait_typed(pg, TYPE_S)
            if not u['dlg']: closed = True; break
            if u['full'] != full0:
                R.note('%s 第 %d 頁（「%s」）剛好打完時點到、翻到下一頁了：這一頁沒量到版面、沒截圖（探針問題）' % (tag, i + 1, full0[:30])); seen.append(full0); missed.append(full0[:20])
        await pg.wait_for_timeout(300)
        m = await pg.evaluate(MEASURE, {'box': '#dlg', 'text': '#dlgText'})
        await pg.screenshot(path=os.path.join(OUT, 'x295_%s_%s_%s_p%02d.png' % (TAG, orient, key, i + 1)))
        ptag = '%s 第 %d 頁' % (tag, i + 1)
        R.note('%s「%s」框 %s、%d 行、字 %spx' % (ptag, u['text'][:60] + ('…' if len(u['text']) > 60 else ''), J(m['box']), m['lines'], m['fontPx']))
        R.check('%s 看得到整頁（#dlgText 的字＝這一句全文，%d 字）' % (ptag, len(u['full'])), u['text'] == u['full'] and len(u['text']) > 0, J({'shown': len(u['text']), 'full': len(u['full'])}))
        judge(ptag, m, '#dlg')
        R.check('%s 點下一頁的範圍（整個對話框）≥44×44（%sx%s）' % (ptag, m['tapW'], m['tapH']), m['tapW'] >= 44 and m['tapH'] >= 44)
        if m['closers']: R.note('%s 畫面上的關閉／略過類按鈕：%s' % (ptag, J(m['closers'])))
        seen.append(u['full'] if u['text'] == u['full'] else u['text'])
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(900)
    else:
        R.check('%s %d 頁內翻完' % (tag, MAXP), False, '還在對話')
    for _ in range(8):
        if closed: break
        u = await pg.evaluate(UI)
        if not u['dlg']: closed = True; break
        await pg.wait_for_timeout(400)
    R.note('%s 翻了 %d 頁：%s' % (tag, len(seen), J([t[:40] for t in seen])))
    R.check('%s［探針］每一頁都量到、截到圖' % tag, not missed, J(missed))
    if exp is not None:
        want = len(exp) + 1   # 第一頁是 look（公告欄：…），後面是 boardPages
        R.check('%s 每一頁都翻到：look＋boardPages %d 頁＝%d 頁，逐字一樣' % (tag, len(exp), want), seen[1:] == exp and len(seen) == want, J({'seen': len(seen), 'want': want, 'diff': [i for i, (a, b) in enumerate(zip(seen[1:], exp)) if a != b]}))
    await pg.wait_for_timeout(800); u = await pg.evaluate(UI)
    R.check('%s 關閉：沒有獨立的關閉鈕，最後一頁手指點對話框＝對話框關掉、人可以動（busy=false）、互動鍵回來' % tag, closed and not u['dlg'] and not u['busy'], J({k: u[k] for k in ('dlg', 'busy', 'interact')}))
    await pg.screenshot(path=os.path.join(OUT, 'x295_%s_%s_%s_9closed.png' % (TAG, orient, key)))
    if seen: R.note('%s 中途離開：要一頁一頁點完 %d 頁才關得掉（沒有「關閉」可以中途跳出）' % (tag, len(seen)))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC X295 公告欄分頁版面：worktree %s；TAG %s；%s（博思螢幕 '+SCREEN_DATE+'）%.1f 時；ORIENT %s；BOARDS %s；Playwright 手機模擬 ≠ iPhone 實機' % (real or '?', TAG, DATE, HOUR, ORIENTS, BOARDS), flush=True)
    async with async_playwright() as p:
        for orient in ORIENTS:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=(orient == 'landscape'))
            await pg.goto(URL)
            if not R.check('[%s] 遊戲載入' % orient, await L.wait_loaded(pg), ''): await b.close(); continue
            for zone, key, label0, zf in gen_boards():
                try: await one_board(pg, cdp, orient, zone, key, label0, zf)
                except Exception as e: R.check('[%s｜%s] 探針沒有例外' % (orient, key), False, repr(e)[:300])
            R.check('[%s] 沒有 JS 例外' % orient, not errs, J(errs[:3]))
            await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
