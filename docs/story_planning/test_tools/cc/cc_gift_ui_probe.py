"""CC GIFT-HOLIDAY-1110「畫面＋山嵐學姊」探針（LAWWW 09:47／09:49 交、BB 09:49 分工；改後 509b54c2d，改前 fda54d616＝合併 d4ea487b7 的上一個）。
CASES＝bag,profile,shanlan（預設全跑）；ORIENT＝portrait,landscape（bag、profile 兩個方向都跑；shanlan 只跑 SL_ORIENT，預設 landscape）。
程式依據（gifthol3d.js、game3d.js、index.html；改後版本）：
  bag：選單 #menu 的分頁 [data-tab=items]「物品」→ #tab-items #itemsList（GIFTH.renderBag＝bagHTML：「包包裡的禮物（n/10）」＋每樣 .item（品名、店名・價錢、說明）＋「她送的」）；
       關閉＝#btnClose「返回遊戲」；選單按鈕 #btnMenu；選單卡片 #menu .card（overflow:auto，可以捲）。包包最多 GIFTH.MAX＝10。
       買：山嵐書店 xs_shanlan 的「看文具」(4.5, 6.5)：AA_695 那一句（shlLook）→ 選項「買禮物…」／「就這樣」→ 文具區的東西「品名　價錢 元」→「你買了○○，放進包包。」
  profile：手機 #btnPhone →「朋友」[data-ptab=friends] →「資料」[data-person=heroine_05] → game3d.js personHTML 裡 GIFTH.personHTML：
       「她喜歡」＝送過、love 的那幾樣（GIFTH.given[人物]，cat＝love）；「她送的」＝GIFTH.recv 裡 pid＝她的（品名＋（年 的節名））。捲動容器 #phoneBody；返回「‹ 朋友」[data-personback]、關閉 #btnPhoneClose「收起來」。
  shanlan：GIFTH.SL_SCHED＝週六（CALENDAR.dateOf(d).wd＝6）15:00～16:00（hour≥15 且 <16）、act linger、站位 at＝(4.15, 6.5)；GIFTH.slDay＝2026-02-01 起、2028-08～12 不算、
       CALENDAR.termOf(d) 有學期且 week 單數；slOn 另外要 SOCIAL.has('heroine_05','FIRST_MET')、STORY.presence 不是不在。
       走到「看文具」(4.5, 6.5) 2.5 m 內＝GIFTH.tick 自己演那一場（第 1～2 階第一次＝sl_sis_1：台詞＋選項）；同一天演過以後按「看文具」＝shlLook（不再演）→ 買禮物…／就這樣。
       這裡日期用 CALENDAR／STORY.dayOfKey 自己算（不拿 GIFTH.slDay 當答案；有的話只拿來對照）。
【前置／捷徑】讀檔（GAME.applySave，條件事件、手機自動打開關掉）：放到某個區域、日期、時間；social（認識學姊 FIRST_MET、熟悉度）、G.flags.GIFTH（包包、送過的、她送的）直接寫進存檔。
  bag 的第 1 樣是真的走過去買的；其他幾樣、滿 10 樣用【前置／捷徑】放進包包（R.setup 標示）。
之後像玩家：L.go_to 點地面／搖桿走路（walkFallbacks 不能加）、手指點 #interact、#dlg、選項、#btnMenu、分頁、#btnClose、手機按鈕（CDP 觸控）。
  捲動：先用手指滑（CDP 觸控拖曳）；滑不動才用 scrollIntoView（同 playlib.tap 的做法），照實記錄。
量測：按鈕 ≥44×44、按鈕中心 elementFromPoint 是它自己；內容沒有被裁（橫向不超出卡片、overflow 切掉的字、直向超出時卡片能捲且捲到底看得到最後一樣）；
  面板裡看得到的文字 Range rect 兩兩重疊（排除祖先／子孫、只算卡片可見範圍內）。
預期：改前（fda54d616）沒有這些功能＝各段 FAIL；改後 PASS（既有樣式的問題照實 FAIL，不放寬）。
Playwright 手機模擬（SwiftShader、390×844／844×390）≠ iPhone 實機：safe-area、字型、手指大小、真的滑動慣性都沒驗證。
GUI_fix（BB 11:36，LAWWW 0ec32e6f6）加兩項：shanlan 開演時距離 ≥0.6 m（剛出現台詞、1.5 秒後各量一次；朝向只記錄）；bag 店名沒有「新」。分頁 44px 原本就量（judge_btn）。
用法：LW_TESTS=<wt>/tests TAG=new|old [CASES=bag,profile,shanlan] [ORIENT=portrait,landscape] [SL_ORIENT=landscape] python3 cc_gift_ui_probe.py <url> <out>
其他 ENV：BAG_DAY（預設 2025-10-18，週六但在 2026-02 以前＝學姊不在）BAG_HOUR（14）PROF_DAY（2026-03-10）SL_POS／SL_EVEN／SL_JAN（YYYY-MM-DD，覆寫自動挑的日期）SL_NEG_WALK（even｜all｜none，預設 even）"""
import os, sys, json, asyncio, math, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
CASES = [c.strip() for c in (os.environ.get('CASES') or 'bag,profile,shanlan').split(',') if c.strip()]
ORIENTS = [o.strip() for o in (os.environ.get('ORIENT') or 'portrait,landscape').split(',') if o.strip()]
SL_ORIENT = os.environ.get('SL_ORIENT') or ('landscape' if 'landscape' in ORIENTS else ORIENTS[0])
BAG_DAY = os.environ.get('BAG_DAY') or '2025-10-18'; BAG_HOUR = float(os.environ.get('BAG_HOUR') or 14)
PROF_DAY = os.environ.get('PROF_DAY') or '2026-03-10'
SL_NEG_WALK = os.environ.get('SL_NEG_WALK') or 'even'
STAT = (4.5, 6.5); SPOT = (4.15, 6.5); MAXBAG = 10
SPOT_ENV = os.environ.get('SL_SPOT')   # GUI_fix2（LAWWW 8d8b475dc：學姊站位改到文具桌走道 (5.8, 6.5)）：不給就讀遊戲的 GIFTH.SL_SCHED.at
R = L.Run('gift_ui_' + TAG, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

DAYOF = "(k=>{ if(typeof STORY!=='undefined'&&STORY.dayOfKey) return STORY.dayOfKey(k); for(let d=0;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })"
# 讀檔：同 playlib.load_state（關條件事件、手機自動打開、直向提示），另外 flags 合併到預設的 flags（不蓋掉 dating_kexin 那些）
LOAD_JS = """(async(q)=>{ const s=GAME.defaults('祐廷'); const st=q.st; const fl=st.flagsAdd||{}; delete st.flagsAdd; Object.assign(s,st); Object.assign(s.flags,fl);
  document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want');
  EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); return true; })"""
ST = r"""(()=>{ const E=GAME.E, P=E.player, o=P.obj.position, D=GAME.D; const ch=document.getElementById('choices'), it=document.getElementById('interact'), dn=document.getElementById('dlgName');
  const vis=e=>!!(e&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none'&&e.offsetParent!==null);
  const choices=(ch&&!ch.classList.contains('hide'))?[...ch.children].filter(b=>b.tagName==='BUTTON'&&b.offsetParent!==null).map(b=>(b.innerText||'').trim()):[];
  return {zone:GAME.G.zone, x:+o.x.toFixed(2), z:+o.z.toFixed(2), lv:P.lv|0, busy:!!P.busy, dlg:!!(D&&D.active), typing:!!(D&&D.typing), full:D?(D.full||''):'', name:(dn&&vis(document.getElementById('dlg')))?(dn.textContent||'').trim():'',
    choices, interact:vis(it)?(it.textContent||'').trim().slice(0,24):'', fb:GAME.walkFallbacks||0, hour:+(+GAME.G.hour).toFixed(2), day:GAME.G.day, money:GAME.G.money|0,
    menu:vis(document.getElementById('menu')), phone:vis(document.getElementById('phone'))}; })()"""
FACE_JS = """(()=>{ const N=GAME.npc||{}; const n=N.heroine_05||N.sis, P=GAME.E.player.obj; if(!n||!n.obj) return {d:null};
  const a=P.position, b=n.obj.position, d=Math.hypot(a.x-b.x,a.z-b.z); const ang=(o,f,t)=>{ const want=Math.atan2(t.x-f.x,t.z-f.z); let x=((o.rotation.y-want)*180/Math.PI)%360; if(x>180)x-=360; if(x<-180)x+=360; return +x.toFixed(0); };
  return {d:+d.toFixed(2), player:[+a.x.toFixed(2),+a.z.toFixed(2)], her:[+b.x.toFixed(2),+b.z.toFixed(2)], playerFaceOff:ang(P,a,b), herFaceOff:ang(n.obj,b,a)}; })()"""
NPC_JS = """(([sx,sz])=>{ const N=GAME.npc||{}; const n=N.heroine_05||N.sis; if(!n||!n.obj) return {here:false, ids:Object.keys(N)};
  const p=n.obj.position; return {here:true, x:+p.x.toFixed(2), z:+p.z.toFixed(2), lv:n.lv|0, d:+Math.hypot(p.x-sx,p.z-sz).toFixed(2), hidden:!!n.hidden, pose:n.pose||'', ids:Object.keys(N)}; })"""

# 面板量測：q={root, card, scroller, blocks, btns:[sel...]}
PANEL_JS = r"""((q)=>{ const vw=innerWidth, vh=innerHeight, root=document.querySelector(q.root), card=document.querySelector(q.card), sc=document.querySelector(q.scroller);
  if(!root||!card) return {err:'no panel'};
  const rr=r=>({l:+r.left.toFixed(1),t:+r.top.toFixed(1),r:+r.right.toFixed(1),b:+r.bottom.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)});
  const visEl=e=>{ for(let a=e;a&&a!==document.documentElement;a=a.parentElement){ const s=getComputedStyle(a); if(s.display==='none'||s.visibility==='hidden'||+s.opacity<0.05) return false; if(a.classList&&a.classList.contains('hide')) return false; } return true; };
  const C=card.getBoundingClientRect(), S=sc?sc.getBoundingClientRect():C;
  const clip={l:Math.max(C.left,S.left,0), t:Math.max(C.top,S.top,0), r:Math.min(C.right,S.right,vw), b:Math.min(C.bottom,S.bottom,vh)};
  const btns=(q.btns||[]).map(sel=>{ const e=document.querySelector(sel); if(!e||!visEl(e)) return {sel, found:false}; const r=e.getBoundingClientRect(); const cx=(r.left+r.right)/2, cy=(r.top+r.bottom)/2;
    const inView=r.left>=-0.5&&r.top>=-0.5&&r.right<=vw+0.5&&r.bottom<=vh+0.5; const h=(cx>=0&&cy>=0&&cx<vw&&cy<vh)?document.elementFromPoint(cx,cy):null;
    return {sel, found:true, t:(e.innerText||'').trim().slice(0,12), rect:rr(r), w:+r.width.toFixed(1), h:+r.height.toFixed(1), inView, hit:!!h&&(h===e||e.contains(h)), hitBy:h&&!(h===e||e.contains(h))?((h.id?'#'+h.id:h.tagName)+(h.className&&typeof h.className==='string'?'.'+h.className.split(' ')[0]:'')):''}; });
  const B=[...document.querySelectorAll(q.blocks)].filter(visEl);
  const blocks=B.map(e=>{ const r=e.getBoundingClientRect(); const s=getComputedStyle(e);
    return {t:(e.innerText||'').trim().replace(/\s+/g,' ').slice(0,40), rect:rr(r), xOut:r.left<C.left-1||r.right>C.right+1||r.left<-1||r.right>vw+1, hOver:s.overflowX!=='visible'&&e.scrollWidth>e.clientWidth+1,
      fullyVisible:r.top>=clip.t-1&&r.bottom<=clip.b+1&&r.left>=clip.l-1&&r.right<=clip.r+1}; });
  // 文字（Range）：超出卡片左右、被 overflow 切掉、兩兩重疊（只算卡片可見範圍內）
  const per=new Map(); const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); let n;
  while((n=walk.nextNode())){ if(!n.nodeValue.trim()) continue; const e=n.parentElement; if(!e||/^(SCRIPT|STYLE)$/.test(e.tagName)||!visEl(e)) continue; const g=document.createRange(); g.selectNodeContents(n);
    for(const x of g.getClientRects()){ if(x.width<1||x.height<1) continue; if(!per.has(e)) per.set(e,[]); per.get(e).push(x); } }
  const items=[...per].map(([e,rs])=>({e,rs,id:(e.id?'#'+e.id:e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''))+'「'+(e.textContent||'').trim().slice(0,12)+'」'}));
  const xOutText=[]; for(const it of items) for(const x of it.rs){ if(x.bottom<clip.t||x.top>clip.b) continue; if(x.left<C.left-1||x.right>C.right+1||x.left<-1||x.right>vw+1){ xOutText.push(it.id); break; } }
  const cut=[]; for(const it of items){ const e=it.e, s=getComputedStyle(e); if(s.overflowX!=='visible'&&e.scrollWidth>e.clientWidth+1&&e.clientWidth>0&&!/(auto|scroll)/.test(s.overflowX)) cut.push(it.id+' x'); if(s.overflowY!=='visible'&&e.scrollHeight>e.clientHeight+1&&e.clientHeight>0&&!/(auto|scroll)/.test(s.overflowY)) cut.push(it.id+' y');
    if(s.textOverflow==='ellipsis'&&e.scrollWidth>e.clientWidth+1) cut.push(it.id+' …'); }
  const inClip=x=>{ const l=Math.max(x.left,clip.l), r=Math.min(x.right,clip.r), t=Math.max(x.top,clip.t), b=Math.min(x.bottom,clip.b); return r-l>1&&b-t>1?{left:l,right:r,top:t,bottom:b}:null; };
  const overlaps=[]; for(let i=0;i<items.length;i++) for(let j=i+1;j<items.length;j++){ const A=items[i], D=items[j]; if(A.e.contains(D.e)||D.e.contains(A.e)) continue; let area=0;
    for(const a0 of A.rs){ const a=inClip(a0); if(!a) continue; for(const c0 of D.rs){ const c=inClip(c0); if(!c) continue; const w=Math.min(a.right,c.right)-Math.max(a.left,c.left), h=Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top); if(w>1&&h>1) area+=w*h; } }
    if(area>4) overlaps.push(A.id+' × '+D.id+'＝'+Math.round(area)+'px²'); }
  const cs=sc?getComputedStyle(sc):null;
  return {vw,vh, card:rr(C), scroller:rr(S), cardInView:C.left>=-0.5&&C.top>=-0.5&&C.right<=vw+0.5&&C.bottom<=vh+0.5, btns, blocks,
    sh:sc?sc.scrollHeight:0, ch:sc?sc.clientHeight:0, st:sc?Math.round(sc.scrollTop):0, scrollable:!!cs&&/(auto|scroll)/.test(cs.overflowY), cardOvX:getComputedStyle(card).overflowX,
    cardHScroll:card.scrollWidth>card.clientWidth+1, xOutText:[...new Set(xOutText)].slice(0,8), cut:cut.slice(0,8), overlaps:overlaps.slice(0,10), nOverlap:overlaps.length}; })"""


async def st(pg): return await pg.evaluate(ST)


async def settle(pg, ms=600, max_s=6):
    t0 = time.time(); last = None; still = 0
    while time.time() - t0 < max_s:
        s = await st(pg); cur = (s['x'], s['z'])
        still = still + 150 if cur == last else 0
        if still >= ms: return s
        last = cur; await pg.wait_for_timeout(150)
    return await st(pg)


async def load(pg, cdp, tag, zone, day_key, hour, social=None, flags=None, why=''):
    d = await pg.evaluate(DAYOF + '(%s)' % J(day_key))
    s0 = {'zone': zone, 'day': d, 'hour': hour, 'weather': 'clear'}
    if social is not None: s0['social'] = social
    if flags: s0['flagsAdd'] = flags
    R.setup('%s GAME.applySave：%s %s（day %s）%.2f 時（區域預設出生點）；條件事件、手機自動打開關掉%s' % (tag, zone, day_key, d, hour, ('；' + why) if why else ''))
    await pg.evaluate(LOAD_JS, {'st': s0}); await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
    return await st(pg)


def social_with(day, fam=25, trust=10):
    """認識學姊（FIRST_MET）、熟悉度 fam（25＝第 2 階：DATE.stageNum fam≥20）；其他照 SOCIAL.bind 的預設欄位"""
    return {'rel': {'heroine_05': {'fam': fam, 'trust': trust, 'aff': 0, 'resp': 0, 'comf': 0, 'rom': 0, 'npcRom': 0, 'seen': 1, 'talked': 1}},
            'mem': {'heroine_05': [{'tag': 'FIRST_MET', 'day': day - 30 if day is not None else 0, 'note': ''}]},
            'reveal': {}, 'prof': {}, 'grad': {'interest': 'NONE', 'field': None, 'prep': 0}, 'fm120': True}


async def drive(pg, cdp, tag, pick=None, max_s=150):
    """對話、選項像玩家一樣點完：回傳紀錄 [('say', 名字, 全文) | ('choose', [選項], 選的)]；pick(選項清單)→index"""
    log = []; last = None; idle = 0; t0 = time.time()
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['choices']:
            k = pick(s['choices']) if pick else 0
            k = max(0, min(k, len(s['choices']) - 1)); log.append(('choose', s['choices'], s['choices'][k]))
            await pg.evaluate("(k=>{ const b=[...document.getElementById('choices').children].filter(b=>b.tagName==='BUTTON'&&b.offsetParent!==null)[k]; if(b) b.id='__ccPick'; })", k)
            await L.tap(pg, cdp, '#__ccPick'); await pg.wait_for_timeout(900); idle = 0; last = None; continue
        if s['dlg']:
            key = (s['name'], s['full'])
            if key != last: log.append(('say', s['name'], s['full'])); last = key
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); idle = 0; continue
        if s['busy']: await pg.wait_for_timeout(500); continue
        idle += 1
        if idle >= 4: break
        await pg.wait_for_timeout(500)
    R.note('%s 對話紀錄：%s' % (tag, J(log)))
    return log


async def walk(pg, cdp, tag, tx, tz, near, stop=None, max_s=240):
    s = await st(pg); fb0 = s['fb']
    ok = await L.go_to(pg, cdp, R, tx, tz, near, tag, max_s=max_s, lv=0, stop=stop)
    s = await settle(pg)
    return ok, s, s['fb'] - fb0


async def panel_check(pg, cdp, tag, q, shot):
    """量一次＋截圖；回傳量測"""
    m = await pg.evaluate(PANEL_JS, q)
    await pg.screenshot(path=os.path.join(OUT, shot + '.png'))
    if m.get('err'): R.check('%s 面板在' % tag, False, J(m)); return m
    R.note('%s 卡片 %s、捲動容器 %s（scrollHeight %s／clientHeight %s、scrollTop %s）；區塊 %d 個；截圖 %s.png' % (tag, J(m['card']), J(m['scroller']), m['sh'], m['ch'], m['st'], len(m['blocks']), shot))
    R.check('%s 卡片整個在畫面內（%sx%s）' % (tag, m['vw'], m['vh']), m['cardInView'], J(m['card']))
    R.check('%s 內容左右沒有被裁（區塊、文字都在卡片寬度內；沒有 overflow 切掉的字；卡片沒有橫向捲動）' % tag,
            not any(b['xOut'] or b['hOver'] for b in m['blocks']) and not m['xOutText'] and not m['cut'] and not m['cardHScroll'],
            J({'xOutBlocks': [b['t'] for b in m['blocks'] if b['xOut'] or b['hOver']], 'xOutText': m['xOutText'], 'cut': m['cut'], 'cardHScroll': m['cardHScroll']}))
    R.check('%s 字沒有疊在一起（面板裡看得到的文字兩兩不重疊）' % tag, m['nOverlap'] == 0, J(m['overlaps']))
    if m['sh'] > m['ch'] + 1: R.check('%s 內容比框長：框可以捲（overflow-y auto/scroll）' % tag, m['scrollable'], J({'sh': m['sh'], 'ch': m['ch']}))
    return m


def judge_btn(tag, m, sel, label):
    b = next((x for x in m.get('btns', []) if x['sel'] == sel), None)
    if not R.check('%s %s 看得到' % (tag, label), bool(b and b['found']), J(b)): return False
    R.check('%s %s 在畫面內、中心 elementFromPoint 是它自己（%s）' % (tag, label, J(b['rect'])), b['inView'] and b['hit'], J({'inView': b['inView'], 'hit': b['hit'], 'hitBy': b['hitBy']}))
    R.check('%s %s 可按範圍 ≥44×44（%s×%s）' % (tag, label, b['w'], b['h']), b['w'] >= 44 and b['h'] >= 44)
    return True


async def scroll_bottom(pg, cdp, tag, scroller, last_sel):
    """手指在捲動容器裡往上滑到底；滑不動才 scrollIntoView（同 playlib.tap）。回傳最後一樣是不是整個看得到"""
    info = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); return {l:r.left,t:r.top,r:r.right,b:r.bottom,st:e.scrollTop,sh:e.scrollHeight,ch:e.clientHeight}; })", scroller)
    if not info: return False
    if info['sh'] <= info['ch'] + 1: return True
    cx = (info['l'] + info['r']) / 2; y0 = info['b'] - 30; y1 = max(info['t'] + 30, y0 - 300)
    st0 = info['st']; swiped = False
    for _ in range(12):
        await L.drag(pg, cdp, cx, y0, cx, y1, steps=12); await pg.wait_for_timeout(500)
        i2 = await pg.evaluate("(s=>{ const e=document.querySelector(s); return {st:e.scrollTop,sh:e.scrollHeight,ch:e.clientHeight}; })", scroller)
        if i2['st'] > st0 + 2: swiped = True
        if i2['st'] + i2['ch'] >= i2['sh'] - 2: break
    if not swiped:
        R.note('%s 手指滑（CDP 觸控拖曳）沒有捲動 %s：改用 scrollIntoView 把最後一樣捲到看得到（同 playlib.tap；真機的滑動沒有驗證）' % (tag, scroller))
        await pg.evaluate("(s=>{ const L=document.querySelectorAll(s); if(L.length) L[L.length-1].scrollIntoView({block:'end'}); })", last_sel); await pg.wait_for_timeout(500)
    else: R.note('%s 手指往上滑，%s 捲到底' % (tag, scroller))
    return await pg.evaluate("""(([sc,ls])=>{ const c=document.querySelector(sc), L=document.querySelectorAll(ls); if(!L.length) return false; const e=L[L.length-1], r=e.getBoundingClientRect(), C=c.getBoundingClientRect();
      return r.top>=Math.max(C.top,0)-1&&r.bottom<=Math.min(C.bottom,innerHeight)+1; })""", [scroller, last_sel])


# ---------------- bag ----------------
MENU_Q = {'root': '#menu', 'card': '#menu .card', 'scroller': '#menu .card', 'blocks': '#itemsList .item', 'btns': ['#menu [data-tab="items"]', '#btnClose', '#btnMenu']}
EXTRA3 = [('g_law_book', 'xs_shanlan'), ('g_old_vinyl', 'corner_records'), ('g_bouquet', 'gg_flower')]
FILL = [('g_film_book', 'bookstore'), ('g_mug', 'afar'), ('g_beans', 'cafe'), ('g_kalimba', 'xs_tongxian'), ('g_oolong', 'aoki'), ('g_umbrella', 'cvs'), ('g_socks', 'xs_dabu'), ('g_bike_light', 'bikeshop'), ('g_fountain', 'xs_shanlan_stationery')]
RECV = [{'pid': 'heroine_05', 'k': 'xmas', 'y': 2025, 'band': 'B', 'item': '一包濾掛咖啡', 'line': '期末很長。……晚上喝。', 'day': 0},
        {'pid': 'heroine_05', 'k': 'sl', 'y': 2026, 'item': '她選的筆記本', 'line': '', 'day': 0, 'room': True}]


async def open_items(pg, cdp, tag, shot):
    await pg.wait_for_timeout(3000)   # 「你買了…」的通知收掉（選單打開時通知改到下面，會蓋到）
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
    s = await st(pg)
    if not R.check('%s 手指按 ☰（#btnMenu）選單打開' % tag, s['menu'], J(s)): return None
    m0 = await pg.evaluate(PANEL_JS, MENU_Q)
    R.note('%s 選單分頁：%s' % (tag, J(await pg.evaluate("[...document.querySelectorAll('#menu .tabs button')].map(b=>{ const r=b.getBoundingClientRect(); return [(b.innerText||'').trim(), Math.round(r.width), Math.round(r.height)]; })"))))
    if not judge_btn(tag, m0, '#menu [data-tab="items"]', '「物品」分頁'):
        await pg.screenshot(path=os.path.join(OUT, shot + '_noitems.png')); await L.tap(pg, cdp, '#btnClose'); return None
    await L.tap(pg, cdp, '#menu [data-tab="items"]'); await pg.wait_for_timeout(900)
    on = await pg.evaluate("(()=>{ const t=document.getElementById('tab-items'); return !!t&&t.classList.contains('on')&&getComputedStyle(t).display!=='none'; })()")
    R.check('%s 手指按「物品」→ #tab-items 打開' % tag, on)
    return on


async def bag_case(pg, cdp, orient):
    tag = '[%s｜bag]' % orient
    d0 = await pg.evaluate(DAYOF + '(%s)' % J(BAG_DAY))
    s = await load(pg, cdp, tag, 'xs_shanlan', BAG_DAY, BAG_HOUR, social=social_with(d0), why='學姊不在（2026-02 以前）、錢＝預設 22000；【前置／捷徑】認識學姊（FIRST_MET，「她送的」才會寫她的名字）')
    if not R.check('%s 到了山嵐書店' % tag, s['zone'] == 'xs_shanlan', J(s)): return
    exp = await pg.evaluate("(()=>{ if(typeof GIFT_HOLIDAY==='undefined') return null; const X=GIFT_HOLIDAY, it=X.items; return {green:it.g_green_hl.name, price:it.g_green_hl.price, names:Object.fromEntries(Object.keys(it).map(k=>[k,it[k].name])), max:(typeof GIFTH!=='undefined'?GIFTH.MAX:null)}; })()")
    R.note('%s GIFT_HOLIDAY：%s' % (tag, '有（包包上限 %s）' % exp['max'] if exp else '沒有（改前）'))
    its = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>/看文具|結帳/.test(i.label||'')).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),shlLook:i.shlLook||null})))()")
    R.note('%s 山嵐的「看文具／結帳」互動點：%s' % (tag, J(its)))
    ok, s, fb = await walk(pg, cdp, tag + ' 走到「看文具」', STAT[0], STAT[1], 0.5)
    for _ in range(8):
        if s['interact'].startswith('看文具'): break
        await pg.wait_for_timeout(500); s = await st(pg)
    R.check('%s 真的走到「看文具」(%s, %s)（walkFallbacks 沒加）、互動鍵是「看文具」' % (tag, STAT[0], STAT[1]), ok and fb == 0 and s['interact'].startswith('看文具'), J(s))
    bought = False
    if s['interact'].startswith('看文具'):
        m0 = s['money']; await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(800)
        want = exp['green'] if exp else '一盒綠色螢光筆'
        def pick(ch):
            for i, c in enumerate(ch):
                if c.startswith('買禮物'): return i
                if c.startswith(want): return i
            return len(ch) - 1
        log = await drive(pg, cdp, tag + ' 看文具 → 買', pick)
        chs = [x for x in log if x[0] == 'choose']
        R.check('%s 「看文具」有「買禮物…」' % tag, any(x[2].startswith('買禮物') for x in chs), J(chs))
        s = await st(pg); bag = await pg.evaluate("(()=>{ const g=GAME.G.flags.GIFTH; return g&&Array.isArray(g.bag)?g.bag.map(b=>b.id):null; })()")
        bought = bool(bag) and 'g_green_hl' in bag
        R.check('%s 買了「%s」：進包包（G.flags.GIFTH.bag）、扣 %s 元、說「你買了…放進包包。」' % (tag, want, exp and exp['price']),
                bought and m0 - s['money'] == (exp and exp['price']) and any(x[0] == 'say' and ('你買了' + want) in x[2] for x in log), J({'bag': bag, 'money': [m0, s['money']]}))
        await pg.screenshot(path=os.path.join(OUT, 'gift_%s_%s_bag_0bought.png' % (TAG, orient)))
    # 幾樣
    R.setup('%s 【前置／捷徑】再放 3 樣進包包（%s）、她送的 2 樣（GIFTH.recv）——直接寫 G.flags.GIFTH' % (tag, '、'.join(g for g, _ in EXTRA3)))
    await pg.evaluate("""(([ex,rv])=>{ const f=GAME.G.flags; const g=f.GIFTH||(f.GIFTH={}); if(!Array.isArray(g.bag)) g.bag=[]; if(!Array.isArray(g.recv)) g.recv=[];
      if(!g.bag.some(b=>b.id==='g_green_hl')) g.bag.push({id:'g_green_hl',day:GAME.G.day,shop:'xs_shanlan_stationery'});
      for(const [id,shop] of ex) g.bag.push({id,day:GAME.G.day,shop}); for(const r of rv) g.recv.push(Object.assign({},r,{day:GAME.G.day})); })""", [EXTRA3, RECV])
    if not bought: R.note('%s 沒有真的買到（改前沒有這個功能）：第 1 樣也用捷徑放進去，下面只量物品頁' % tag)
    for phase, ids in (('few', ['g_green_hl'] + [g for g, _ in EXTRA3]), ('full', None)):
        if phase == 'full':
            R.setup('%s 【前置／捷徑】包包補到 %d 樣（%s）' % (tag, MAXBAG, '、'.join(g for g, _ in FILL[:MAXBAG - 4])))
            await pg.evaluate("(fl=>{ const g=GAME.G.flags.GIFTH; for(const [id,shop] of fl){ if(g.bag.length>=%d) break; g.bag.push({id,day:GAME.G.day,shop}); } })" % MAXBAG, FILL)
            ids = await pg.evaluate("GAME.G.flags.GIFTH.bag.map(b=>b.id)")
        ptag = '%s［%s：%d 樣］' % (tag, '幾樣' if phase == 'few' else '滿', len(ids))
        on = await open_items(pg, cdp, ptag, 'gift_%s_%s_bag_%s' % (TAG, orient, phase))
        if not on:
            R.check('%s 物品頁（改前沒有）' % ptag, False, '沒有「物品」分頁'); await L.close_panels(pg, cdp); return
        m = await panel_check(pg, cdp, ptag + ' 物品頁（最上面）', MENU_Q, 'gift_%s_%s_bag_%s_1top' % (TAG, orient, phase))
        txt = await pg.evaluate("(document.getElementById('itemsList').innerText||'')")
        names = [exp['names'][i] for i in ids] if exp else ids
        R.check('%s 標題「包包裡的禮物（%d/%d）」' % (ptag, len(ids), MAXBAG), ('包包裡的禮物（%d/%d）' % (len(ids), MAXBAG)) in txt, txt[:80])
        R.check('%s 每一樣都列出來（%s）' % (ptag, '、'.join(names)), all(n in txt for n in names), J([n for n in names if n not in txt]))
        R.check('%s 「她送的」列出 %s' % (ptag, '、'.join(r['item'] for r in RECV)), '她送的' in txt and all(r['item'] in txt for r in RECV), txt[-160:])
        newtag = await pg.evaluate(r"""[...document.querySelectorAll('#itemsList .item')].map(e=>(e.innerText||'').split('\n')).filter(ls=>ls.some(l=>/[（，、]新[）]|（新）/.test(l))).map(ls=>ls.join(' / '))""")
        tabs = await pg.evaluate("[...document.querySelectorAll('#menu [data-tab]')].filter(e=>e.offsetParent!==null).map(e=>{ const r=e.getBoundingClientRect(); return [(e.innerText||'').trim(), Math.round(r.width), Math.round(r.height)]; })")
        R.check('%s 選單所有分頁按鈕高 ≥44 px（%s）' % (ptag, '、'.join('%s %d' % (t[0], t[2]) for t in tabs)), bool(tabs) and all(t[2] >= 44 for t in tabs), J(tabs))
        R.check('%s 店名沒有「新」的標記（GUI_fix：例「山嵐書店（文具區，新）」「公館站口花攤（新）」）' % ptag, not newtag, J(newtag))
        judge_btn(ptag + '（最上面）', m, '#btnClose', '關閉「返回遊戲」')
        okb = await scroll_bottom(pg, cdp, ptag, '#menu .card', '#itemsList .item')
        m2 = await panel_check(pg, cdp, ptag + ' 物品頁（捲到底）', MENU_Q, 'gift_%s_%s_bag_%s_2bottom' % (TAG, orient, phase))
        R.check('%s 捲到底：最後一樣（她送的最後一筆）整個看得到（沒有被裁在卡片外）' % ptag, okb, J(m2.get('blocks', [])[-1:] if isinstance(m2, dict) else None))
        cb = next((x for x in m2.get('btns', []) if x['sel'] == '#btnClose'), None)
        if cb and cb.get('found') and not (cb['inView'] and cb['hit']): R.note('%s 捲到底以後「返回遊戲」跟著捲出畫面（%s）：要往回滑才按得到（L.tap 會先捲回來＝像玩家往下滑一下）' % (ptag, J(cb.get('rect'))))
        await L.tap(pg, cdp, '#btnClose'); await pg.wait_for_timeout(900); s = await st(pg)
        R.check('%s 手指按「返回遊戲」選單關掉' % ptag, not s['menu'], J({'menu': s['menu']}))
        await L.close_panels(pg, cdp)
    # 滿了以後「看文具」的買禮物灰掉（GIFTH.shopOpt：dim、hint「包包已經放了 10 樣」）
    s = await st(pg)
    if s['interact'].startswith('看文具'):
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(800); dim = None
        for _ in range(30):
            s = await st(pg)
            if s['choices']:
                dim = await pg.evaluate("(()=>[...document.getElementById('choices').children].filter(b=>b.tagName==='BUTTON').map(b=>({t:(b.innerText||'').trim(),dim:b.classList.contains('dim')})))()"); break
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, 'gift_%s_%s_bag_3fullshop.png' % (TAG, orient)))
        R.check('%s 包包滿 %d 樣：「看文具」的「買禮物…」灰掉、提示「包包已經放了 %d 樣」' % (tag, MAXBAG, MAXBAG), bool(dim) and any(d['t'].startswith('買禮物') and d['dim'] and ('包包已經放了 %d 樣' % MAXBAG) in d['t'] for d in dim), J(dim))
        await drive(pg, cdp, tag + ' 收掉', lambda ch: len(ch) - 1, max_s=40)
    else: R.note('%s 量完不在「看文具」旁邊（%s），沒看滿了以後的買禮物' % (tag, J(s)))


# ---------------- profile ----------------
PROF_GIVEN = ['g_fountain', 'g_leather_case', 'g_green_hl', 'g_bouquet', 'g_beans']   # 前四樣 love 學姊、g_beans 不是（不該列）
PROF_RECV = [{'pid': 'heroine_05', 'k': 'xmas', 'y': 2025, 'band': 'B', 'item': '一包濾掛咖啡', 'line': '期末很長。……晚上喝。', 'day': 0},
             {'pid': 'heroine_05', 'k': 'sl', 'y': 2026, 'item': '她選的筆記本', 'line': '', 'day': 0, 'room': True},
             {'pid': 'heroine_05', 'k': 'vday', 'y': 2026, 'band': 'C', 'item': '一盒巧克力', 'line': '筆試考完那天買的。……一直放著。', 'day': 0}]
PHONE_Q = {'root': '#phone', 'card': '#phone .card', 'scroller': '#phoneBody', 'blocks': '#phoneBody .item, #phoneBody [data-ccgift]', 'btns': ['#phoneTabs [data-ptab="friends"]', '#phoneBody [data-personback]', '#btnPhoneClose']}


async def profile_case(pg, cdp, orient):
    tag = '[%s｜profile]' % orient
    d = await pg.evaluate(DAYOF + '(%s)' % J(PROF_DAY))
    s = await load(pg, cdp, tag, 'dorm', PROF_DAY, 20.0, social=social_with(d, fam=45, trust=30),
                   flags={'GIFTH': {'bag': [], 'given': {'heroine_05': PROF_GIVEN}, 'recv': PROF_RECV, 'fest': {}, 'sent': {}, 'got': {}, 'mail': {'heroine_05|xmas|2025': {'day': d, 'played': True}}, 'sl': {}, 'hint': {}, 'third': 0}},
                   why='【前置／捷徑】認識學姊（FIRST_MET、fam 45）；G.flags.GIFTH：送過她 %s、她送的 %s（mail 標成已經演過，不在宿舍跳信箱）' % ('、'.join(PROF_GIVEN), '、'.join(r['item'] for r in PROF_RECV)))
    exp = await pg.evaluate("(g=>{ if(typeof GIFT_HOLIDAY==='undefined') return null; const it=GIFT_HOLIDAY.items; return g.filter(k=>(it[k].love||[]).includes('heroine_05')).map(k=>it[k].name).concat(['|'], g.filter(k=>!(it[k].love||[]).includes('heroine_05')).map(k=>it[k].name)); })", PROF_GIVEN)
    love = exp[:exp.index('|')] if exp else []; notlove = exp[exp.index('|') + 1:] if exp else []
    R.note('%s 照 GIFT_HOLIDAY.items 的 love：她喜歡＝%s；不該列＝%s' % (tag, J(love), J(notlove)))
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1500); s = await st(pg)
    if not R.check('%s 手指按 📱 手機打開' % tag, s['phone'], J(s)): return
    m0 = await pg.evaluate(PANEL_JS, PHONE_Q)
    judge_btn(tag, m0, '#phoneTabs [data-ptab="friends"]', '「朋友」分頁')
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="friends"]'); await pg.wait_for_timeout(1200)
    if not R.check('%s 朋友清單有學姊的「資料」' % tag, await pg.evaluate("!!document.querySelector('#phoneBody [data-person=\"heroine_05\"]')"), ''):
        await pg.screenshot(path=os.path.join(OUT, 'gift_%s_%s_prof_nofriend.png' % (TAG, orient))); return
    await L.tap(pg, cdp, '#phoneBody [data-person="heroine_05"]'); await pg.wait_for_timeout(1500)
    # 「她喜歡」「她送的」區塊：span.muted 的字是那兩個的 div（GIFTH.personHTML）
    found = await pg.evaluate("""(()=>{ const out={}; for(const sp of document.querySelectorAll('#phoneBody span.muted')){ const t=(sp.textContent||'').trim(); if(t==='她喜歡'||t==='她送的'){ const d=sp.parentElement; d.setAttribute('data-ccgift',t); out[t]=(d.innerText||'').trim(); } } return out; })()""")
    R.note('%s 人物頁的區塊：%s' % (tag, J(found)))
    await pg.screenshot(path=os.path.join(OUT, 'gift_%s_%s_prof_0top.png' % (TAG, orient)))
    R.check('%s 有「她喜歡」：%s（不列 %s）' % (tag, '、'.join(love) or '?', '、'.join(notlove)), '她喜歡' in found and bool(love) and all(n in found['她喜歡'] for n in love) and not any(n in found['她喜歡'] for n in notlove), J(found.get('她喜歡')))
    R.check('%s 有「她送的」：%s' % (tag, '、'.join(r['item'] for r in PROF_RECV)), '她送的' in found and all(r['item'] in found['她送的'] for r in PROF_RECV) and '2025 的聖誕節' in found['她送的'], J(found.get('她送的')))
    if not found: return
    # 捲到那兩塊：手指滑 #phoneBody；滑不動才 scrollIntoView
    vis = await pg.evaluate("""(()=>{ const c=document.getElementById('phoneBody').getBoundingClientRect(); return [...document.querySelectorAll('[data-ccgift]')].every(e=>{ const r=e.getBoundingClientRect(); return r.top>=Math.max(c.top,0)-1&&r.bottom<=Math.min(c.bottom,innerHeight)+1; }); })()""")
    if not vis:
        b = await pg.evaluate("(()=>{ const r=document.getElementById('phoneBody').getBoundingClientRect(); return {l:r.left,r:r.right,t:r.top,b:r.bottom}; })()")
        cx = (b['l'] + b['r']) / 2
        for _ in range(6):
            await L.drag(pg, cdp, cx, b['b'] - 30, cx, max(b['t'] + 30, b['b'] - 230), steps=12); await pg.wait_for_timeout(500)
            vis = await pg.evaluate("""(()=>{ const c=document.getElementById('phoneBody').getBoundingClientRect(); const L=[...document.querySelectorAll('[data-ccgift]')]; const e=L[L.length-1], r=e.getBoundingClientRect(); return r.top>=Math.max(c.top,0)-1&&r.bottom<=Math.min(c.bottom,innerHeight)+1; })()""")
            if vis: break
        if vis: R.note('%s 手指往上滑，看到「她喜歡／她送的」' % tag)
        else:
            R.note('%s 手指滑沒有把那兩塊捲進來：改用 scrollIntoView（同 playlib.tap；真機滑動沒驗證）' % tag)
            await pg.evaluate("(()=>{ const L=document.querySelectorAll('[data-ccgift]'); L[L.length-1].scrollIntoView({block:'end'}); })()"); await pg.wait_for_timeout(500)
    m = await panel_check(pg, cdp, tag + ' 人物頁', PHONE_Q, 'gift_%s_%s_prof_1gift' % (TAG, orient))
    gb = [b for b in m.get('blocks', []) if b['t'].startswith('她喜歡') or b['t'].startswith('她送的')]
    R.check('%s 「她喜歡／她送的」兩塊整個看得到（在 #phoneBody 可見範圍裡、沒有超出左右）' % tag, len(gb) == 2 and all(b['fullyVisible'] and not b['xOut'] and not b['hOver'] for b in gb), J(gb))
    gl = await pg.evaluate("""(()=>{ const out=[]; for(const d of document.querySelectorAll('[data-ccgift]')){ const r=d.getBoundingClientRect(), it=d.closest('.item').getBoundingClientRect(); for(const c of d.querySelectorAll('div')){ const g=document.createRange(); g.selectNodeContents(c); const rs=[...g.getClientRects()]; out.push({t:(c.textContent||'').trim().slice(0,30), lines:rs.length, right:Math.round(Math.max(0,...rs.map(x=>x.right))), itemR:Math.round(it.right)}); } } return out; })()""")
    R.note('%s 兩塊每一行（行數、最右邊／所在 .item 的右邊）：%s' % (tag, J(gl)))
    judge_btn(tag, m, '#phoneBody [data-personback]', '「‹ 朋友」返回') if await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody [data-personback]'), c=document.getElementById('phoneBody'); if(!e) return false; const r=e.getBoundingClientRect(), C=c.getBoundingClientRect(); return r.top>=C.top-1&&r.bottom<=C.bottom+1; })()") else R.note('%s 「‹ 朋友」捲到上面去了（這一頁不量它）' % tag)
    judge_btn(tag, m, '#btnPhoneClose', '關閉「收起來」')
    await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(900); s = await st(pg)
    R.check('%s 手指按「收起來」手機關掉' % tag, not s['phone'], J({'phone': s['phone']}))


# ---------------- shanlan ----------------
SL_DATES_JS = """((o)=>{ const DK=""" + DAYOF + """; const a=DK('2025-12-01'), b=DK('2026-07-31'); const out=[];
  for(let d=a; d<=b; d++){ const t=CALENDAR.dateOf(d); if(!t||t.wd!==6) continue; const tm=CALENDAR.termOf?CALENDAR.termOf(d):null;
    out.push({d, key:t.key||(t.y+'-'+String(t.m).padStart(2,'0')+'-'+String(t.d).padStart(2,'0')), y:t.y, m:t.m, term:tm&&tm.id, week:tm?tm.week:null, slDay:(typeof GIFTH!=='undefined'&&GIFTH.slDay)?GIFTH.slDay(GAME.G||{day:d},d):null}); }
  return out; })"""


def pick_dates(sats):
    ok = lambda x: x['term'] and x['week'] is not None and int(x['week']) % 2 == 1
    feb = [x for x in sats if (x['y'], x['m']) >= (2026, 2)]
    pos = next((x for x in feb if ok(x)), None)
    even = next((x for x in feb if x['term'] and x['week'] is not None and int(x['week']) % 2 == 0 and (pos is None or x['d'] > pos['d'])), None)
    jan = [x for x in sats if (x['y'], x['m']) == (2026, 1)]
    jo = next((x for x in jan if ok(x)), None)
    return pos, even, jo or (jan[0] if jan else None), bool(jo)


CLIP_JS = r"""(()=>{ const N=GAME.npc||{}; const n=N.heroine_05||N.sis; if(!n||!n.obj) return null; n.obj.updateMatrixWorld(true);
  const hb=new THREE.Box3(); n.obj.traverse(o=>{ if(o.isMesh||o.isSkinnedMesh){ if(o.geometry&&!o.geometry.boundingBox) o.geometry.computeBoundingBox(); hb.expandByObject(o); } });
  const p=n.obj.position, r=0.25; const body=new THREE.Box3(new THREE.Vector3(p.x-r,p.y+0.05,p.z-r), new THREE.Vector3(p.x+r,p.y+1.6,p.z+r));
  const hits=[]; GAME.E.zone.group.traverse(o=>{ if(!o.isMesh||!o.visible) return; let v=true; for(let q=o;q;q=q.parent) if(q.visible===false){ v=false; break; } if(!v) return;
    if(/glass|VIEW|floor|ceil|WALL_|ground|shadow|rug|carpet/i.test(o.name||'')) return; let inNpc=false; for(let q=o;q;q=q.parent) if(q===n.obj){ inNpc=true; break; } if(inNpc) return;
    const b=new THREE.Box3().setFromObject(o); if(b.max.y-b.min.y>3.5) return; if(!b.intersectsBox(body)) return; const ib=b.clone().intersect(body); const vol=(ib.max.x-ib.min.x)*(ib.max.y-ib.min.y)*(ib.max.z-ib.min.z);
    if(vol>0.002) hits.push({name:o.name||'(無名)', vol:+vol.toFixed(4), box:[[+b.min.x.toFixed(2),+b.min.y.toFixed(2),+b.min.z.toFixed(2)],[+b.max.x.toFixed(2),+b.max.y.toFixed(2),+b.max.z.toFixed(2)]]}); });
  hits.sort((a,b)=>b.vol-a.vol); return {at:[+p.x.toFixed(2),+p.z.toFixed(2)], hits:hits.slice(0,8)}; })()"""


async def her_at(pg):
    return await pg.evaluate(NPC_JS, list(SPOT))


async def shanlan_case(pg, cdp, orient):
    tag = '[%s｜shanlan]' % orient
    global SPOT
    at = await pg.evaluate("(()=>typeof GIFTH!=='undefined'&&GIFTH.SL_SCHED&&GIFTH.SL_SCHED.at?GIFTH.SL_SCHED.at.slice(0,2):null)()")
    if SPOT_ENV: SPOT = tuple(float(v) for v in SPOT_ENV.split(','))
    elif at: SPOT = (float(at[0]), float(at[1]))
    R.note('%s 學姊站位＝%s（遊戲 GIFTH.SL_SCHED.at＝%s）' % (tag, J(SPOT), J(at)))
    sats = await pg.evaluate(SL_DATES_JS, {})
    R.note('%s 2025-12～2026-07 的週六（CALENDAR.termOf 週次；slDay＝程式的 GIFTH.slDay 對照）：%s' % (tag, J([(x['key'], x['term'], x['week'], x['slDay']) for x in sats])))
    pos, even, jan, jan_odd = pick_dates(sats)
    ov = lambda env, x: next((y for y in sats if y['key'] == os.environ.get(env)), x) if os.environ.get(env) else x
    pos, even, jan = ov('SL_POS', pos), ov('SL_EVEN', even), ov('SL_JAN', jan)
    R.note('%s 挑的日期：符合＝%s；雙數週＝%s；2026-01＝%s%s' % (tag, J(pos), J(even), J(jan), '' if jan_odd else '（2026-01 沒有單數週的週六，用這一天：週次不是單數也照樣測「不在」）'))
    for nm_, x in (('符合', pos), ('雙數週', even), ('2026-01', jan)):
        if x and x['slDay'] is not None: R.note('%s %s %s：程式 GIFTH.slDay＝%s（探針自己算＝%s）' % (tag, nm_, x['key'], x['slDay'], nm_ == '符合'))
    if not R.check('%s 找得到符合條件的週六（2026-02 起、學期中、週次單數）' % tag, bool(pos), ''): return
    cases = [('neg_1430', pos['key'], 14.5, False, '單數週週六 14:30（時間不對）'), ('neg_even', even and even['key'], 15 + 20 / 60, False, '雙數週週六 15:20'),
             ('neg_jan', jan and jan['key'], 15 + 20 / 60, False, '2026-01 的週六 15:20（2026-02 以前）'), ('pos', pos['key'], 15 + 20 / 60, True, '單數週週六 15:20（符合）')]
    exp = await pg.evaluate("""(()=>{ if(typeof GIFT_HOLIDAY==='undefined') return null; const sc=GIFT_HOLIDAY.stationery.scenes.find(s=>s.id==='sl_sis_1'); const out=[];
      for(const t of sc.lines){ const m=/^(（[^）]*）)(.+)$/.exec(t); if(m){ out.push(['',m[1]]); out.push(['her',m[2]]); } else out.push([/^（/.test(t)?'':'her',t]); } return {lines:out, choice:sc.choice.map(c=>c.t)}; })()""")
    R.note('%s sl_sis_1 照 play() 拆的台詞＝%s' % (tag, J(exp)))
    for key, day_key, hour, want, label in cases:
        ctag = '%s［%s］' % (tag, label)
        if not day_key: R.check('%s 有這種日子' % ctag, False, ''); continue
        d = await pg.evaluate(DAYOF + '(%s)' % J(day_key))
        s = await load(pg, cdp, ctag, 'xs_shanlan', day_key, hour, social=social_with(d), why='【前置／捷徑】認識學姊（FIRST_MET、fam 25＝第 2 階）')
        if not R.check('%s 到了山嵐書店' % ctag, s['zone'] == 'xs_shanlan', J(s)): continue
        hername = await pg.evaluate("(()=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName('heroine_05'):'')()")   # 認識以後的名字（讀檔前是「不認識的女生」）
        h = await her_at(pg)
        R.note('%s %s 時，學姊：%s；她的名字（SOCIAL.displayName）＝%s' % (ctag, s['hour'], J(h), hername))
        near = bool(h['here'] and h['d'] <= 0.3 and h['lv'] == 0)
        if want: R.check('%s 學姊在文具區 (%s, %s) 0.3 m 內' % (ctag, SPOT[0], SPOT[1]), near, J(h))
        if want and near:   # GUI_fix2（LAWWW 13:02 ⑤）：她身體 0.25 m 半徑、0.05～1.6 m 高的盒子和家具網格的包圍盒有沒有重疊（只看 >2 公升，包圍盒會偏大：判定看截圖）
            cl = await pg.evaluate(CLIP_JS); R.note('%s 學姊身體和家具包圍盒重疊：%s' % (ctag, J(cl)))
            if cl and cl['hits']: print('  INFO %s 學姊身體盒子和這些家具的包圍盒重疊（包圍盒會偏大，看截圖）：%s' % (ctag, J([(x['name'], x['vol']) for x in cl['hits']])), flush=True)
            await pg.evaluate("(()=>{ const st=document.createElement('style'); st.id='ccHud'; st.textContent='body *{visibility:hidden!important} #c{visibility:visible!important}'; document.head.appendChild(st); })()")
            for sfx, dz in (('s', 2.6), ('n', -2.6)):   # r2：從她的 +z、−z 兩側高處往下看（r1 1.5 m 高被貨架擋住）
                await pg.evaluate("""(([x,z,dz])=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(x+0.6,3.3,z+dz),new THREE.Vector3(x,0.8,z)); })""", [SPOT[0], SPOT[1], dz])
                await pg.wait_for_timeout(1500); await pg.screenshot(path=os.path.join(OUT, 'gift_%s_sl_%s_0her_%s.png' % (TAG, key, sfx)))
            await pg.evaluate("(()=>{ const st=document.getElementById('ccHud'); if(st) st.remove(); })()")
            await pg.evaluate("(()=>{ const E=GAME.E; if(E.endCinematic) E.endCinematic(); else if(E.cam) E.cam.mode=null; })()")
        else: R.check('%s 學姊不在文具區 (%s, %s)（0.3 m 內沒有她）' % (ctag, SPOT[0], SPOT[1]), not near, J(h))
        await pg.screenshot(path=os.path.join(OUT, 'gift_%s_sl_%s_0load.png' % (TAG, key)))
        dowalk = want or SL_NEG_WALK == 'all' or (SL_NEG_WALK == 'even' and key == 'neg_even')
        if not dowalk: continue
        stop = lambda q: q['dlg'] or q['choices'] > 0
        ok, s, fb = await walk(pg, cdp, ctag + ' 走到「看文具」', STAT[0], STAT[1], 0.5, stop=stop)
        auto = await st(pg)
        if not (auto['dlg'] or auto['choices']):   # 站在那裡等一下（玩家走到她旁邊會停下來看）：GIFTH.tick 每一格判斷
            for _ in range(16):
                await pg.wait_for_timeout(500); auto = await st(pg)
                if auto['dlg'] or auto['choices']: break
        if not (auto['dlg'] or auto['choices']):
            dg = await pg.evaluate(r"""(()=>{ if(typeof GIFTH==='undefined') return null; const T=(typeof STORY!=='undefined'&&STORY.TICKS)||[]; return {slNear:GIFTH.slNear(GAME), slOn:GIFTH.slOn(GAME.G), slPick:GIFTH.slPick(GAME.G),
              nTicks:T.length, gifthIdx:T.findIndex(f=>/GIFTH|S\.tick\(GM\)/.test(String(f))), busy:!!GAME.E.player.busy, dlg:!!(GAME.D&&GAME.D.active), paused:!!GAME.E.paused}; })()""")
            R.note('%s 走到旁邊等 8 秒沒有自己開始：診斷 %s' % (ctag, J(dg)))
        auto_log = []
        if auto['dlg'] or auto['choices']:
            gap = []   # GUI_fix（BB 11:36，0ec32e6f6）：開演那一刻玩家和學姊的距離 ≥0.6 m（LAWWW：玩家退到 0.8 m）；朝向角度只記錄，面對面、穿模看截圖
            for t_ in (0, 1500):
                if t_: await pg.wait_for_timeout(t_)
                gap.append(await pg.evaluate(FACE_JS))
            await pg.screenshot(path=os.path.join(OUT, 'gift_%s_sl_%s_1scene.png' % (TAG, key)))
            R.note('%s 開演：剛出現台詞時 %s；1.5 秒後（截圖那一刻）%s' % (ctag, J(gap[0]), J(gap[1])))
            if want: R.check('%s 開演時玩家和學姊距離 ≥0.6 m（剛出現 %s m、1.5 秒後 %s m）' % (ctag, gap[0].get('d'), gap[1].get('d')), all((g.get('d') or 0) >= 0.6 for g in gap), J(gap))
            auto_log = await drive(pg, cdp, ctag + ' 走近自己演的', lambda ch: 0)
            await pg.screenshot(path=os.path.join(OUT, 'gift_%s_sl_%s_2after.png' % (TAG, key)))
            ok, s, fb2 = await walk(pg, cdp, ctag + ' 走到「看文具」（演完）', STAT[0], STAT[1], 0.5); fb += fb2
        else:
            await pg.screenshot(path=os.path.join(OUT, 'gift_%s_sl_%s_1near.png' % (TAG, key)))
        h2 = await her_at(pg); R.note('%s 走到旁邊：玩家 (%s, %s) %s 時；學姊 %s' % (ctag, s['x'], s['z'], s['hour'], J(h2)))
        her_auto = [x for x in auto_log if x[0] == 'say' and hername and x[1] == hername]
        if want:
            R.check('%s 真的走到「看文具」旁邊（walkFallbacks 沒加）' % ctag, ok and fb == 0, J(s))
            if exp:
                miss = [t for w, t in exp['lines'] if not any(x[0] == 'say' and x[2] == t and (x[1] == hername if w == 'her' else x[1] in ('', None)) for x in auto_log)]
                R.check('%s 走到旁邊（2.5 m 內）她的那一場自己開始（sl_sis_1，第 1～2 階第一次）：台詞都出現、名字是「%s」' % (ctag, hername), bool(auto_log) and not miss, J({'miss': miss}))
                R.check('%s sl_sis_1 有兩個選項（%s）' % (ctag, '／'.join(exp['choice'])), any(x[0] == 'choose' and x[1][:2] == exp['choice'] for x in auto_log), J([x for x in auto_log if x[0] == 'choose']))
            else: R.check('%s 走到旁邊她的那一場自己開始' % ctag, bool(her_auto), J(auto_log))
        else:
            R.check('%s 走到旁邊：沒有學姊的台詞' % ctag, not her_auto, J(auto_log))
        for _ in range(8):
            if s['interact'].startswith('看文具'): break
            await pg.wait_for_timeout(500); s = await st(pg)
        if not R.check('%s 互動鍵是「看文具」' % ctag, s['interact'].startswith('看文具'), J(s)): continue
        look = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(i=>i.label==='看文具'); return i?(i.shlLook||null):null; })()")
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(900)
        await pg.screenshot(path=os.path.join(OUT, 'gift_%s_sl_%s_3tap.png' % (TAG, key)))
        tlog = await drive(pg, cdp, ctag + ' 按「看文具」', lambda ch: len(ch) - 1)
        her_tap = [x for x in tlog if x[0] == 'say' and hername and x[1] == hername]
        says = [x for x in tlog if x[0] == 'say']
        R.note('%s 按「看文具」：shlLook＝%s；她的台詞 %d 句' % (ctag, J(look), len(her_tap)))
        if want and os.environ.get('SL_FINDHER', '1') == '1':   # GUI_fix2（BB 13:03 ⑤）：送禮還是找得到她＝走到她旁邊按鈕是「和她說話」，說話的選單有「送她禮物…」或「約她去…」
            await L.close_panels(pg, cdp); await pg.wait_for_timeout(800)
            hz = await her_at(pg); tx, tz = hz.get('x', SPOT[0]), hz.get('z', SPOT[1])
            nb = await pg.evaluate("""(([x,z,sx,sz])=>{ const E=GAME.E; let best=null; for(const r of [0.45,0.55,0.7,0.8,1.0,1.2]) for(let k=0;k<16;k++){ const a=k*Math.PI/8, px=x+Math.sin(a)*r, pz=z+Math.cos(a)*r; if(E.canStand&&E.canStand(px,pz,0.33,0)){ const ds=Math.hypot(px-sx,pz-sz); if(!best||ds-r>best.dStat-best.r) best={x:+px.toFixed(2),z:+pz.toFixed(2),r,dStat:+ds.toFixed(2)}; } } return best; })""", [tx, tz, STAT[0], STAT[1]])   # r4：走道窄，她旁邊 0.8 m 外站得住的點都比較靠近「看文具」（r3 挑到 (5.0,6.5)：離她 0.8、離看文具 0.5＝按鈕照理是看文具）；加 0.45～0.7 m，挑「離看文具」減「離她」最大的；r3：r2 挑離玩家最近的點＝(4.6,6.5) 就在「看文具」上（按鈕照理是看文具）＝TEST_BUG；改挑離「看文具」最遠、她旁邊 0.8～1.2 m 站得住的點
            okw, s2, fb3 = (False, await st(pg), 0)
            if nb: okw, s2, fb3 = await walk(pg, cdp, ctag + ' 走到學姊旁邊', nb['x'], nb['z'], 0.35)
            for _ in range(6):
                if '說話' in (s2['interact'] or ''): break
                await pg.wait_for_timeout(500); s2 = await st(pg)
            R.check('%s 送禮還找得到她：走到她旁邊（%s）按鈕是「和%s說話」' % (ctag, J(nb), hername), bool(nb) and ('和' + hername + '說話') in (s2['interact'] or ''), J({'interact': s2['interact'], 'x': s2['x'], 'z': s2['z'], 'her': hz}))
            await pg.screenshot(path=os.path.join(OUT, 'gift_%s_sl_%s_4findher.png' % (TAG, key)))
        if want and auto_log:
            R.check('%s 演過以後按「看文具」：同一天不再演（沒有她的台詞）、第一句是 shlLook、有「買禮物…」' % ctag, not her_tap and bool(says) and says[0][2] == look and any(x[0] == 'choose' and any(c.startswith('買禮物') for c in x[1]) for x in tlog), J(tlog))
        elif want:
            R.check('%s 按「看文具」：演她的那一場（她的台詞）' % ctag, bool(her_tap), J(tlog))
        else:
            R.check('%s 按「看文具」：沒有學姊的台詞（第一句是 shlLook）' % ctag, not her_tap and bool(says) and look is not None and says[0][2] == look, J(tlog))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC GIFT-HOLIDAY 畫面＋山嵐學姊：worktree %s；TAG %s；CASES %s；ORIENT %s；shanlan 只跑 %s；Playwright 手機模擬 ≠ iPhone 實機' % (real or '?', TAG, CASES, ORIENTS, SL_ORIENT), flush=True)
    async with async_playwright() as p:
        for orient in ORIENTS + ([SL_ORIENT] if SL_ORIENT not in ORIENTS and 'shanlan' in CASES else []):
            todo = [c for c in CASES if (c != 'shanlan' and orient in ORIENTS) or (c == 'shanlan' and orient == SL_ORIENT)]
            if not todo: continue
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=(orient == 'landscape'))
            await pg.goto(URL)
            if not R.check('[%s] 遊戲載入' % orient, await L.wait_loaded(pg), ''): await b.close(); continue
            for c in todo:
                try: await {'bag': bag_case, 'profile': profile_case, 'shanlan': shanlan_case}[c](pg, cdp, orient)
                except Exception as e: R.check('[%s｜%s] 探針沒有例外' % (orient, c), False, repr(e)[:300])
            R.check('[%s] 沒有 JS 例外' % orient, not errs, J(errs[:3]))
            await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
