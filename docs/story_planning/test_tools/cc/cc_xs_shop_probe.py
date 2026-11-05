"""CC-C（帳號 C）11-05：新生南路的新店（D141：只擋五種＋營業時間＋給使用者的截圖）——DAKOU_v1、XSSHOP_v1（大步、好拍）、XSPLAZA_v1（新生運動廣場）。
  BB-C 05:13／05:14／05:27／05:32／05:39 派工；版本 9ea82730f（BB-C 05:39 統一）。判定：大口＝LAWWW-C（D132，BB 做的模型）副本 BB-C；大步、好拍、運動廣場＝BB-C（CC v2b／v3c）。
  SHOP（環境變數）：dakou｜dabu｜haopai｜xsports。期望值的出處：
    營業時間 src/data/places.js（AA_620 第 1 節：大步 11～22、好拍 12～21 週日休、運動廣場 11～22；AA_621：大口 24 小時）；
    大口的字 AA_697（claude/magical-albattani-bk7b4n 54bf612c3）、AA_621 第 1～3 節（52e3d83a8）——菜單、點餐、取餐、回收、插座、書架、讀書四句、天亮、一個人深夜去；
    大步、好拍、運動廣場的字 AA_620（bf0efded8）：遊戲裡還沒接（xsshop3d.js／xsports3d.js：「台詞 LAWWW 照 AA_620 接」），這一輪只記有哪些按鈕、按了出什麼，不判字。
  一、進出（照玩家從新生南路走進去、走出來；站得住、推得動）
  二、兩層的店（大口、運動廣場）：上樓到第 1 層、下樓回第 0 層（樓梯可以點的面 stairEnds）
  三、座位：每一張（大口 79 張＝每一層、每一種座面高度抽樣）用共用的 sit_all（seatApproach 那一點最近的按鈕是這一張、坐下、起身）
  四、互動點：每一個按下去，記下旁白／選單（大口照 AA_697 判）
  五、營業時間：時間外按店門＝不進去、toast＝PLACES.closedText；過了營業時間還在店裡（BB-C 05:27：會不會被請出去、xs_close3d 有沒有包到）
  六、牆淡出（鏡頭繞一圈）、黑畫面；截圖：每一層一張（給使用者看）
  七、大口的流程（BB-C 05:32）：櫃檯點餐（扣錢、+0.15 小時、字）、自助點餐、早餐 05:00～10:30、取餐兩版、二樓讀書四句輪流、天亮那一句、一個人深夜去、回收餐盤、錢不夠變暗按了沒反應
用法：SHOP=dakou LW_TESTS=<wt>/tests [PARTS=door,stairs,seats,acts,hours,walls,shots,flow] python3 cc_xs_shop_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
SHOP = os.environ.get('SHOP') or 'dakou'
CFG = {
    'dakou': {'zone': 'xs_dakou', 'name': '大口漢堡', 'door': '進大口漢堡', 'exit': '離開大口漢堡', 'place': 'xs_dakou', 'open': None, 'closed': [], 'levels': 2,
              'shots': [(0, {'eye': [0.0, 1.6, 6.5], 'look': [0.0, 1.3, -6.0], 'lens': 24}), (1, {'eye': [0.0, 5.2, 6.0], 'look': [0.0, 4.8, -6.0], 'lens': 24})]},
    'dabu': {'zone': 'xs_dabu', 'name': '大步球鞋', 'door': '進大步球鞋', 'exit': '離開大步球鞋', 'place': 'xs_dabu', 'open': 14.0, 'closed': [('2025-10-15', 10.5), ('2025-10-15', 22.5)], 'after': ('2025-10-15', 21.97), 'levels': 1,
             'shots': [(0, None)]},
    'haopai': {'zone': 'xs_haopai', 'name': '好拍運動', 'door': '進好拍運動', 'exit': '離開好拍運動', 'place': 'xs_haopai', 'open': 14.0, 'closed': [('2025-10-15', 11.5), ('2025-10-15', 21.5), ('2025-10-19', 15.0)], 'after': ('2025-10-15', 20.97), 'levels': 1,
               'shots': [(0, None)]},
    'xsports': {'zone': 'xs_xsports', 'name': '新生運動廣場', 'door': '進新生運動廣場', 'exit': '離開新生運動廣場', 'place': 'xs_xsports', 'open': 14.0, 'closed': [('2025-10-15', 10.5), ('2025-10-15', 22.5)], 'after': ('2025-10-15', 21.97), 'levels': 2,
                'shots': [(0, None), (1, None)]},
}[SHOP]
PARTS = [x for x in (os.environ.get('PARTS') or ('door,stairs,seats,acts,hours,walls,shots' + (',flow' if SHOP == 'dakou' else ''))).split(',') if x]
R = L.Run('xs_shop_' + SHOP, OUT); D.setup(R, OUT)
DAY = '2025-10-15'   # 週三（不是考試週）
ZN = CFG['zone']
# AA_697／AA_621（大口）
DK = {'menu': [('雙層牛肉堡套餐', 159), ('勁辣雞腿堡套餐', 149), ('雞塊 6 塊', 69), ('薯條（大）', 59), ('可樂', 35), ('熱咖啡', 45), ('蘋果派', 35)], 'breakfast': ('豬肉滿福堡', 59),
      'ask': '您好，內用還是外帶？', 'done': '（店員把號碼單遞給你。）', 'call': '好了會叫號。', 'kiosk': '（螢幕上的漢堡一張比一張大。你按了兩次「返回」，才找到飲料在哪裡。）', 'kdone': '（機器吐出一張號碼單。）',
      'pickup': '（櫃檯叫了你的號碼。托盤上的薯條還在冒煙。）', 'pnone': '（取餐區的螢幕上，號碼一個一個往下跳。）', 'tray': '（你把紙杯和包裝紙丟進回收台，托盤疊到最上面。）',
      'outlet': '（你把手機插上。旁邊那個人的筆電也插在同一排，螢幕上是一份還沒寫完的報告。）', 'books': '（書架上是幾本舊雜誌和一套沒排齊的漫畫。第三集不見了。）',
      'narr': ['（你點了一杯熱咖啡。四點的時候它已經冷了。）', '（對面那桌的人整理好東西走了。下一個人五分鐘後就坐下來。）', '（窗外新生南路的車越來越少。只剩公車和計程車。）', '（天亮的時候，一樓開始賣早餐。煎蛋的味道飄上來。）'],
      'dawn': '（樓下換了早餐的菜單。有人買了滿福堡，邊走邊吃去考試。）', 'alone': '（二樓只有你和一個在打電腦的人。店員在拖地。）'}
SAYHOOK = r"""(()=>{ if(!window.__ccSayWrapped){ const s0=GAME.say; GAME.say=function(who,t){ try{ (window.__ccSay=window.__ccSay||[]).push({who:who?(who.name||String(who)):null, t:String(t), h:+(+GAME.G.hour).toFixed(3), zone:GAME.G.zone}); }catch(e){} return s0.apply(this,arguments); }; window.__ccSayWrapped=true; }   /* 只包一次（11-05 雲端：__ccSayOn=false 重設又包一次＝每句記兩次）*/
  if(!window.__ccSayOn){ window.__ccSay=[]; window.__ccSayOn=true; } return true; })()"""
OPTS = r"""(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>({t:(b.innerText||'').trim(), dim:b.classList.contains('dim')||b.getAttribute('aria-disabled')==='true'})); })()"""


SEEN = []   # 對話框裡出現過的整句（有些旁白走 game3d.js 裡面的 say()，不經過 GAME.say）


async def says(pg, n=0):
    return await pg.evaluate("(n=>(window.__ccSay||[]).slice(n))", n)


async def dlg_text(pg):
    """等打字機打完（連兩次一樣）再讀對話框，記進 SEEN"""
    last = None
    for _ in range(20):
        t = (await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")).strip()
        if t and t == last: break
        last = t; await pg.wait_for_timeout(300)
    if last and (not SEEN or SEEN[-1] != last): SEEN.append(last)
    return last


async def pick(pg, cdp, pred):
    ok = await pg.evaluate("(src=>{ const f=new Function('t','return ('+src+')(t)'); const ch=document.getElementById('choices'); if(!ch) return false; const b=[...ch.querySelectorAll('button')].filter(x=>x.offsetParent!==null).find(x=>f((x.innerText||x.textContent||'').trim())); if(!b) return false; b.setAttribute('data-ccpick','1'); return true; })", pred)
    if not ok: return False
    await L.tap(pg, cdp, '[data-ccpick="1"]'); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{ const b=document.querySelector('[data-ccpick]'); if(b) b.removeAttribute('data-ccpick'); })()")
    return True


async def until_menu_or_idle(pg, cdp, max_s=40, tap_dlg=True):
    t0 = time.time()
    while time.time() - t0 < max_s:
        o = await pg.evaluate(OPTS)
        if o: return o
        s = await D.st(pg)
        if s['dlg'] and tap_dlg: await dlg_text(pg); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
        if not s['dlg'] and not s['busy']: return []
        await pg.wait_for_timeout(300)
    return await pg.evaluate(OPTS)


async def idle(pg, cdp, max_s=60):
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await D.st(pg)
        if s['dlg']: await dlg_text(pg); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
        if not s['busy'] and not s['choices']: return s
        await pg.wait_for_timeout(300)
    return await D.st(pg)


async def door_xy(pg):
    return await pg.evaluate("((z)=>{ const i=GAME.E.interactables.find(i=>i.exit&&i.exit.to===z); return i?{label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2)}:null; })", ZN)


async def load_street_near_door(pg, cdp, key, h, tag):
    await D.load_zone(pg, cdp, 'xinsheng', key, h, -13.9, 0.0, math.pi / 2)
    d = await door_xy(pg)
    if not d: return None
    R.setup('%s 讀檔新生南路 %s %05.2f、%s店門南邊 3 m' % (tag, key, h, CFG['name']))
    await D.load_zone(pg, cdp, 'xinsheng', key, h, d['x'] + 1.7, d['z'] - 3, 0.0)
    return d


async def part_door(pg, cdp):
    d = await load_street_near_door(pg, cdp, DAY, CFG['open'] or 14.0, '[進出]')
    if not R.check('[進出] 新生南路有「%s」（exit.to＝%s）' % (CFG['door'], ZN), bool(d) and d['label'].startswith(CFG['door']), J(d)): return False
    s = await D.use_exit(pg, cdp, '[進出 新生南路→%s]' % CFG['name'], CFG['door'], ZN)
    if not s: return False
    R.check('[進出] 店裡：一樓、推得動 ≥0.3 m', s['lv'] == 0 and await D.pushable(pg, cdp) >= 0.3, J(s))
    await D.shot(pg, 'door_in')
    s = await D.use_exit(pg, cdp, '[進出 %s→新生南路]' % CFG['name'], CFG['exit'], 'xinsheng')
    if not s: return False
    R.check('[進出] 回到新生南路店門外（離店門 ≤3 m）、推得動', math.hypot(s['x'] - d['x'], s['z'] - d['z']) <= 3.0 and await D.pushable(pg, cdp) >= 0.3, J({'at': [s['x'], s['z']], 'door': d}))
    return True


async def enter_inside(pg, cdp, tag, h=None, key=DAY):
    R.setup('%s 【捷徑】讀檔進%s %s %05.2f（一樓出生點）' % (tag, CFG['name'], key, h or CFG['open'] or 14.0))
    return await D.load_zone(pg, cdp, ZN, key, h or CFG['open'] or 14.0, wait=9000)


async def part_stairs(pg, cdp):
    ends = await pg.evaluate("(()=>{ const w=(GAME.E.zone.walkMeshes||[]).find(m=>m.userData&&m.userData.stairEnds); const LG=GAME.E.zone.levelGroups||[]; return {ends:w?w.userData.stairEnds:null, ys:LG.map(g=>g.y)}; })()")
    R.note('[樓梯] stairEnds %s、各層高度 %s' % (J(ends['ends']), J(ends['ys'])))
    if not R.check('[樓梯] 有樓梯可以點的面（stairEnds：一樓底、二樓頂）', bool(ends['ends']) and len(ends['ys']) >= 2, J(ends)): return
    top = next(e for e in ends['ends'] if e['lv'] == 1); bot = next(e for e in ends['ends'] if e['lv'] == 0)
    for k, (e, ey, nm) in enumerate([(top, ends['ys'][1], '一樓 → 二樓（上樓）'), (bot, ends['ys'][0], '二樓 → 一樓（下樓）')]):
        fb0 = (await D.st(pg))['fb']
        ok, smp = await D.walk_logged(pg, cdp, e['x'], e['z'] + (-0.4 if e['lv'] == 1 else 0.4) * (1 if bot['z'] > top['z'] else -1), 0.35, '[樓梯] ' + nm, max_s=240, lv=e['lv'])
        s = await D.settle(pg)
        bad = [[q['x'], q['z'], q['y'], q['lv']] for q in smp if q['zone'] == ZN and q['stand'] is False]
        R.check('[樓梯] %s：走到了、第 %d 層、高度 %.2f＝%.2f（±0.06）、沒有被放到目的地' % (nm, s['lv'], s['y'], ey), ok and s['lv'] == e['lv'] and abs(s['y'] - ey) <= 0.06 and s['fb'] == fb0, J(s))
        R.check('[樓梯] %s：一路每一點都站得住' % nm, not bad, J(bad[:6]))
        await D.shot(pg, 'stairs_%d' % (k + 1))


async def part_seats(pg, cdp):
    allseats = await pg.evaluate(D.SEATS)
    if SHOP == 'dakou':   # 79 張：每一層、每一種座面高度（高腳椅／一般）、每個象限抽一張（BB-C 05:14：每一區至少 1 個）
        top = await pg.evaluate("(()=>(typeof DK3!=='undefined'&&DK3.STOOL_TOP)||null)()")
        keep = {};
        for s in allseats:
            k = (s['slv'], s['sy'] is not None and s['sy'] > 0.6, s['sx'] > 0, s['sz'] > 0)
            keep.setdefault(k, s)
        pick_xy = {(s['sx'], s['sz']) for s in keep.values()}
        R.note('[座位] 大口 %d 張，抽 %d 張（每一層 × 座面高低 × 四個象限）：%s；高腳椅座面 %s' % (len(allseats), len(pick_xy), J(sorted(pick_xy)), J(top)))
        await pg.evaluate("((keep)=>{ const K=new Set(keep.map(q=>q.join(','))); for(const i of GAME.E.interactables){ if(i.seat&&!K.has([+i.seat.x.toFixed(3),+i.seat.z.toFixed(3)].join(','))) i.__ccHide=true; } })", [list(x) for x in pick_xy])
        await pg.evaluate("(()=>{ for(const i of GAME.E.interactables){ if(i.__ccHide){ Object.defineProperty(i,'hidden',{value:true,configurable:true,writable:true}); } } })()")
        R.setup('[座位] 【捷徑】沒抽到的座位按鈕先藏起來（只為了 sit_all 只走抽到的；抽到的照玩家走、坐）')
    res = await D.sit_all(pg, cdp, '[座位]', SHOP)
    if SHOP == 'dakou': await pg.evaluate("(()=>{ for(const i of GAME.E.interactables){ if(i.__ccHide){ delete i.hidden; delete i.__ccHide; } } })()")
    R.note('[座位] 每張：%s' % J(res))


async def part_acts(pg, cdp):
    await pg.evaluate(SAYHOOK)
    its = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>!i.hidden&&!i.seat&&!i.exit).map(i=>({label:i.label||'',x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0,kind:i.dakou||i.kind||null})))()")
    R.note('[互動點] %s 的按鈕：%s' % (CFG['name'], J(its)))
    if SHOP != 'dakou':
        R.note('[互動點] AA_620 的字遊戲裡還沒接（xsshop3d.js／xsports3d.js）：按鈕 %d 個，照樣按、記下來，不判字' % len(its))
    for it in its:
        s = await D.st(pg)
        await L.go_to(pg, cdp, R, it['x'], it['z'], 0.3, '[互動點 %s]' % it['label'], max_s=200, lv=it['lv']); s = await D.settle(pg)
        for _ in range(6):
            if s['interact'].startswith(it['label']): break
            await pg.wait_for_timeout(400); s = await D.st(pg)
        if not R.check('[互動點] 走到「%s」(%s, %s 第 %d 層)，按鈕是它' % (it['label'], it['x'], it['z'], it['lv']), s['interact'].startswith(it['label']), J(s['interact'])): continue
        n0 = len(await says(pg)); await L.tap(pg, cdp, '#interact')
        o = await until_menu_or_idle(pg, cdp, 25)
        if o: await pick(pg, cdp, "t=>t.startsWith('不用了')") or await pick(pg, cdp, "t=>true")
        await idle(pg, cdp, 30)
        Ls = [x['t'] for x in await says(pg, n0)]
        R.note('[互動點] 「%s」：台詞 %s；選單 %s' % (it['label'], J(Ls), J([x['t'] for x in o])))
        if SHOP == 'dakou':
            exp = {'tray': [DK['tray']], 'outlet': [DK['outlet']], 'books': [DK['books']], 'pickup': [DK['pnone']], 'order': [DK['ask']], 'kiosk': [DK['kiosk']]}.get(it['kind'])
            if exp is not None: R.check('[互動點] 「%s」（%s）：字照 AA_697「%s」' % (it['label'], it['kind'], '／'.join(exp)), Ls == exp, J(Ls))


async def part_hours(pg, cdp):
    if not CFG['closed']:
        op = await pg.evaluate("((p)=>[0,3,6,12,18,23.5].map(h=>PLACES.isOpen(p,h,STORY.dayOfKey('2025-10-15'))))", CFG['place'])
        R.check('[營業時間] %s 24 小時（AA_621）：00、03、06、12、18、23:30 都開著' % CFG['name'], all(op), J(op)); return
    for key, h in CFG['closed']:
        d = await load_street_near_door(pg, cdp, key, h, '[營業時間外]')
        if not d: R.check('[營業時間外] 店門找得到', False, ''); continue
        exp = await pg.evaluate("((a)=>PLACES.closedText(a[0],GAME.G.hour,GAME.G.day))", [CFG['place']])
        await L.go_to(pg, cdp, R, d['x'], d['z'], 0.4, '[營業時間外] 店門', max_s=120); s = await D.settle(pg)
        if not R.check('[營業時間外 %s %05.2f] 走到店門，按鈕是「%s」' % (key, h, CFG['door']), s['interact'].startswith(CFG['door']), J(s)): continue
        await pg.evaluate("(()=>{ window.__ccToast=[]; const t=document.getElementById('toast'); if(t){ new MutationObserver(()=>{ const x=(t.innerText||'').trim(); if(x) window.__ccToast.push(x); }).observe(t,{childList:true,subtree:true,characterData:true,attributes:true}); } })()")
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
        s = await D.st(pg); toasts = await pg.evaluate("window.__ccToast||[]")
        R.check('[營業時間外 %s %05.2f] 按店門沒有進去、跳「%s」（PLACES.closedText）' % (key, h, exp), s['zone'] == 'xinsheng' and bool(exp) and any(exp in t or t in exp for t in toasts), J({'zone': s['zone'], 'toast': toasts}))
    # 過了營業時間還在店裡（BB-C 05:27）
    key, h = CFG['after']
    s = await enter_inside(pg, cdp, '[打烊時在店裡]', h, key)
    await pg.evaluate(SAYHOOK); n0 = len(await says(pg))
    xs = await pg.evaluate("(z=>typeof XSCLOSE!=='undefined'?!!XSCLOSE.ZONES[z]:null)", ZN)
    t0 = time.time(); e = None
    while time.time() - t0 < 120:
        s = await D.st(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
        if s['zone'] != ZN and not s['busy']: e = s; break
        if s['hour'] > h + 0.25 and s['zone'] == ZN and time.time() - t0 > 60: break
        await pg.wait_for_timeout(500)
    s = await D.st(pg); Ls = [x['t'] for x in await says(pg, n0)]
    R.note('[打烊時在店裡] XSCLOSE.ZONES 有沒有這一間：%s；過了打烊 %s：現在 %s、台詞 %s' % (xs, J(round(s['hour'], 2)), J({k: s[k] for k in ('zone', 'x', 'z')}), J(Ls)))
    # BB-C 06:18：大步、好拍、運動廣場打烊不請出去＝照實記、不算 FAIL（LAWWW-C 之後加進 XSCLOSE，等 AA 的字）
    R.note('[打烊時在店裡] 過了營業時間有沒有被請出去：%s（xs_close3d 包到這一間＝%s；BB-C 06:18：照實記、不判）' % ('有（到 %s）' % e['zone'] if e else '沒有（還在店裡）', xs) + '  ' + J({'end': e, 'lines': Ls}))


async def part_walls(pg, cdp):
    rows = []; bad = []
    for lv in range(CFG['levels']):
        if lv == 1:
            ends = await pg.evaluate("(()=>{ const w=(GAME.E.zone.walkMeshes||[]).find(m=>m.userData&&m.userData.stairEnds); return w?w.userData.stairEnds:null; })()")
            t = next((e for e in (ends or []) if e['lv'] == 1), None)
            if not t: continue
            await L.go_to(pg, cdp, R, t['x'], t['z'], 0.4, '[牆淡出] 上二樓', max_s=200, lv=1); await D.settle(pg)
        y0 = await pg.evaluate("GAME.E.cam.yaw")
        for k in range(8):
            await pg.evaluate("(a=>{ GAME.E.cam.yaw=a; })", y0 + k * math.pi / 4); await pg.wait_for_timeout(1200)
            w = await pg.evaluate("""(()=>{ const E=GAME.E, cam=E.camera, P=E.player.obj.position, V=THREE.Vector3; const head=new V(P.x,P.y+1.3,P.z), from=cam.position.clone(), dir=head.clone().sub(from), dist=dir.length(); dir.normalize();
              const rc=new THREE.Raycaster(from,dir,0.02,dist-0.2); const vis=o=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; };
              const hits=rc.intersectObjects(E.scene.children,true).filter(h=>vis(h.object)&&/WALL_/.test(h.object.name||''));
              const op=o=>{ const m=Array.isArray(o.material)?o.material[0]:o.material; return m?+(m.opacity==null?1:m.opacity).toFixed(2):null; };
              return {yaw:+E.cam.yaw.toFixed(2), hits:hits.slice(0,6).map(h=>({name:h.object.name, op:op(h.object)}))}; })()""")
            rows.append([lv, w])
            blk = [h for h in w['hits'] if h['op'] is not None and h['op'] > 0.5 and 'BANDS' not in h['name']]   # WALL_BANDS 很矮、不淡出是對的（BB-C 05:13）
            if blk: bad.append({'lv': lv, 'yaw': w['yaw'], 'blocking': blk})
            if k % 4 == 0: await D.shot(pg, 'walls_lv%d_%d' % (lv, k * 45))
        await pg.evaluate("(a=>{ GAME.E.cam.yaw=a; })", y0)
    R.note('[牆淡出] 鏡頭一圈：%s' % J(rows))
    R.check('[牆淡出] 每一層鏡頭繞一圈（8 個方向）：擋在鏡頭和人中間的牆都淡出（opacity ≤0.5；WALL_BANDS 那一條很矮、不算）', not bad, J(bad[:4]))


async def part_shots(pg, cdp):
    for lv, cam in CFG['shots']:
        for h, hn in ((14.0, 'day'), (21.0, 'night')):
            s = await D.load_zone(pg, cdp, ZN, DAY, h if SHOP == 'dakou' or h < 20.5 else (CFG['after'][1] - 0.5), wait=9000)
            if lv == 1:
                ends = await pg.evaluate("(()=>{ const w=(GAME.E.zone.walkMeshes||[]).find(m=>m.userData&&m.userData.stairEnds); return w?w.userData.stairEnds:null; })()")
                t = next((e for e in (ends or []) if e['lv'] == 1), None)
                if t: await L.go_to(pg, cdp, R, t['x'], t['z'], 0.4, '[截圖] 上二樓', max_s=200, lv=1); await D.settle(pg)
            if cam:
                await D.user_shot(pg, cdp, 'user_lv%d_%s' % (lv, hn), cam)
            else:   # 沒有指定鏡頭：遊戲自己的鏡頭（藏 HUD）
                await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(1500)
                await pg.evaluate(D.HUD + '(false)'); await D.shot(pg, 'user_lv%d_%s' % (lv, hn)); await pg.evaluate(D.HUD + '(true)')
            await pg.set_viewport_size({'width': 844, 'height': 390})


# ---------------- 大口的流程（BB-C 05:32）----------------
async def dk_go(pg, cdp, kind):
    it = await pg.evaluate("((k)=>{ const i=GAME.E.interactables.find(i=>!i.hidden&&i.dakou===k); return i?{label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0}:null; })", kind)
    if not it: return None
    await L.go_to(pg, cdp, R, it['x'], it['z'], 0.3, '[大口 %s]' % it['label'], max_s=200, lv=it['lv']); s = await D.settle(pg)
    for _ in range(6):
        if s['interact'].startswith(it['label']): break
        await pg.wait_for_timeout(400); s = await D.st(pg)
    return it if s['interact'].startswith(it['label']) else None


async def dk_order(pg, cdp, kind, item, tag):
    it = await dk_go(pg, cdp, kind)
    if not R.check('%s 走到「%s」按鈕' % (tag, kind), bool(it), ''): return None
    m0 = await pg.evaluate("GAME.G.money|0"); h0 = await pg.evaluate("+GAME.G.hour"); n0 = len(await says(pg))
    await L.tap(pg, cdp, '#interact')
    o = await until_menu_or_idle(pg, cdp, 30)
    L0 = [x['t'] for x in await says(pg, n0)]
    hit = await pick(pg, cdp, "t=>t.startsWith(%s)" % J(item)) if item else await pick(pg, cdp, "t=>t.startsWith('不用了')")
    await idle(pg, cdp, 40)
    m1 = await pg.evaluate("GAME.G.money|0"); h1 = await pg.evaluate("+GAME.G.hour"); L1 = [x for x in await says(pg, n0)]
    return {'menu': o, 'first': L0, 'lines': L1, 'm0': m0, 'm1': m1, 'h0': h0, 'h1': h1, 'picked': hit}


async def dk_study(pg, cdp, tag, hours_pick):
    """二樓坐下讀書（座位選單：讀書 → 選幾小時）"""
    st2 = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const s=GAME.E.interactables.filter(i=>i.seat&&!i.hidden&&(i.lv|0)===1&&/讀書/.test(i.label||'')).map(i=>({x:i.x,z:i.z,sx:i.seat.x,sz:i.seat.z,label:i.label,ap:GAME.seatApproach?GAME.seatApproach(i.seat):null,d:Math.hypot(i.x-P.x,i.z-P.z)})).sort((a,b)=>a.d-b.d); return s[0]||null; })()")
    if not R.check('%s 二樓有「坐下讀書」' % tag, bool(st2), ''): return None
    ap = st2['ap'] or [st2['x'], st2['z']]
    await L.go_to(pg, cdp, R, ap[0], ap[1], 0.12, '%s 坐下讀書' % tag, max_s=200, lv=1); await D.settle(pg)
    await L.tap(pg, cdp, '#interact'); n0 = len(await says(pg)); h0 = await pg.evaluate("+GAME.G.hour")
    o = await until_menu_or_idle(pg, cdp, 30)
    R.note('%s 座位選單：%s' % (tag, J([x['t'] for x in o])))
    if not await pick(pg, cdp, "t=>t.startsWith('讀書')"): return {'menu': o}
    o2 = await until_menu_or_idle(pg, cdp, 20)
    R.note('%s 讀多久：%s' % (tag, J([x['t'] for x in o2])))
    await pick(pg, cdp, "t=>t.includes(%s)" % J(hours_pick)) or await pick(pg, cdp, "t=>true")
    t0 = time.time(); seen = []
    while time.time() - t0 < 120:
        s = await D.st(pg)
        if s['dlg']:   # 讀完的旁白走 game3d.js 裡面的 say()（不經過 GAME.say）：直接讀對話框（等打字機打完）
            t = await dlg_text(pg)
            if t and (not seen or seen[-1] != t): seen.append(t)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
        o3 = await pg.evaluate(OPTS)
        if o3 and not s['dlg']:
            await pick(pg, cdp, "t=>t.startsWith('起身')||t.startsWith('站起')") or await pick(pg, cdp, "t=>true"); await pg.wait_for_timeout(800); continue
        if not s['busy'] and not s['seat']: break
        await pg.wait_for_timeout(400)
    Ls = [x['t'] for x in await says(pg, n0)] + [t for t in seen]; h1 = await pg.evaluate("+GAME.G.hour")
    R.note('%s 讀書 %.2f → %.2f：台詞 %s' % (tag, h0, h1, J(Ls)))
    return {'lines': Ls, 'h0': h0, 'h1': h1}


async def part_flow(pg, cdp):
    await enter_inside(pg, cdp, '[大口 流程]', 14.0)
    await pg.evaluate("(()=>{ GAME.G.money=5000; })()"); R.setup('[大口 流程] 【前置】錢 5000')
    await pg.evaluate("(()=>{ window.__ccSayOn=false; })()"); await pg.evaluate(SAYHOOK)
    # 1 取餐（還沒點）
    it = await dk_go(pg, cdp, 'pickup'); n0 = len(await says(pg))
    if it: await L.tap(pg, cdp, '#interact'); await idle(pg, cdp, 30)
    R.check('[大口] 還沒點就按「取餐」：%s（AA_697）' % DK['pnone'], [x['t'] for x in await says(pg, n0)] == [DK['pnone']], J([x['t'] for x in await says(pg, n0)]))
    # 2 櫃檯點餐（14:00 沒有早餐）
    r = await dk_order(pg, cdp, 'order', '可樂', '[大口 櫃檯點餐]')
    if r:
        mn = [x['t'] for x in r['menu']]
        exp_menu = ['%s　%d 元' % m for m in DK['menu']] + ['不用了']
        R.check('[大口 櫃檯] 店員「%s」→ 菜單七樣照 AA_621 第 1 節（14:00 沒有早餐）＋「不用了」' % DK['ask'], r['first'] == [DK['ask']] and mn == exp_menu, J({'first': r['first'], 'menu': mn}))
        L1 = [x['t'] for x in r['lines']]
        R.check('[大口 櫃檯] 點可樂：扣 35（%d → %d）、時間 +0.15 小時（%.3f → %.3f）、「%s」＋店員「%s」' % (r['m0'], r['m1'], r['h0'], r['h1'], DK['done'], DK['call']), r['m0'] - r['m1'] == 35 and abs(r['h1'] - r['h0'] - 0.15) < 0.02 and L1[-2:] == [DK['done'], DK['call']], J(L1))
    # 3 取餐（有點）
    it = await dk_go(pg, cdp, 'pickup'); n0 = len(await says(pg))
    if it: await L.tap(pg, cdp, '#interact'); await idle(pg, cdp, 30)
    R.check('[大口] 點了以後按「取餐」：%s（AA_697）' % DK['pickup'], [x['t'] for x in await says(pg, n0)] == [DK['pickup']], J([x['t'] for x in await says(pg, n0)]))
    await D.shot(pg, 'dakou_pickup')
    # 4 回收餐盤
    it = await dk_go(pg, cdp, 'tray'); n0 = len(await says(pg))
    if it: await L.tap(pg, cdp, '#interact'); await idle(pg, cdp, 30)
    R.check('[大口] 回收餐盤：%s（AA_697）' % DK['tray'], [x['t'] for x in await says(pg, n0)] == [DK['tray']], J([x['t'] for x in await says(pg, n0)]))
    # 5 錢不夠：菜單變暗、按了沒反應
    await pg.evaluate("(()=>{ GAME.G.money=20; })()"); R.setup('[大口 錢不夠] 【前置】錢 20（比最便宜的 35 少）')
    it = await dk_go(pg, cdp, 'order'); m0 = await pg.evaluate("GAME.G.money|0")
    if it:
        await L.tap(pg, cdp, '#interact'); o = await until_menu_or_idle(pg, cdp, 30)
        dims = [x for x in o if x['dim']]
        await pick(pg, cdp, "t=>t.startsWith('可樂')"); await idle(pg, cdp, 20)
        m1 = await pg.evaluate("GAME.G.money|0")
        R.check('[大口 錢不夠] 七樣都變暗、按了可樂沒扣錢（%d → %d）' % (m0, m1), len(dims) == 7 and m1 == m0, J({'dims': [x['t'] for x in dims], 'm': [m0, m1]}))
        await D.shot(pg, 'dakou_short')
    await pg.evaluate("(()=>{ GAME.G.money=5000; })()")
    # 6 自助點餐＋早餐（06:00）
    await enter_inside(pg, cdp, '[大口 早餐]', 6.0)
    await pg.evaluate("(()=>{ GAME.G.money=5000; window.__ccSayOn=false; })()"); await pg.evaluate(SAYHOOK)
    r = await dk_order(pg, cdp, 'kiosk', '豬肉滿福堡', '[大口 自助點餐 06:00]')
    if r:
        mn = [x['t'] for x in r['menu']]
        R.check('[大口 自助點餐 06:00] 「%s」→ 菜單多一項「豬肉滿福堡　59 元」（05:00～10:30）' % DK['kiosk'], r['first'] == [DK['kiosk']] and '豬肉滿福堡　59 元' in mn, J({'first': r['first'], 'menu': mn}))
        L1 = [x['t'] for x in r['lines']]
        R.check('[大口 自助點餐 06:00] 點滿福堡：扣 59、+0.15 小時、「%s」' % DK['kdone'], r['m0'] - r['m1'] == 59 and abs(r['h1'] - r['h0'] - 0.15) < 0.02 and L1[-1:] == [DK['kdone']], J({'m': [r['m0'], r['m1']], 'h': [r['h0'], r['h1']], 'lines': L1}))
    # 7 二樓讀書：四句輪流（14:00 兩次）
    await enter_inside(pg, cdp, '[大口 讀書]', 14.0)
    await pg.evaluate("(()=>{ window.__ccSayOn=false; GAME.G.flags.DAKOU_NARR=0; })()"); await pg.evaluate(SAYHOOK); R.setup('[大口 讀書] 【前置】DAKOU_NARR＝0（從第一句開始輪）')
    got = []
    for k in range(2):
        r = await dk_study(pg, cdp, '[大口 讀書 %d]' % (k + 1), '1')
        if r and r.get('lines') is not None: got.append(next((t for t in r['lines'] if t in DK['narr'] or t == DK['dawn']), None))
    R.check('[大口 讀書] 讀完兩次：旁白照 AA_621 第 2 節四句輪流（第 1、2 句）', got[:2] == DK['narr'][:2], J(got))
    # 8 一個人深夜去（週三 01:00 上二樓）＋天亮（03:30 讀兩小時跨過 05:00）
    # 「一趟一次」＝GM.enterN（從店門進來才算新的一趟；讀檔不算。雲端 11-05：同一個瀏覽器 14:00 上過二樓，讀檔到 01:00 被當成同一趟）→ 照玩家從新生南路走進來
    d = await load_street_near_door(pg, cdp, '2025-10-16', 0.95, '[大口 深夜]')
    R.setup('[大口 深夜] 2025-10-16（四）00:57 從新生南路走進大口（新的一趟；不是考試週、沒有約）')
    if not d or not await D.use_exit(pg, cdp, '[大口 深夜 新生南路→大口]', CFG['door'], ZN):
        R.check('[大口 深夜] 從店門進得去', False, J(d)); return
    await pg.evaluate("(()=>{ window.__ccSayOn=false; })()"); await pg.evaluate(SAYHOOK); n0 = len(await says(pg))
    ends = await pg.evaluate("(()=>{ const w=(GAME.E.zone.walkMeshes||[]).find(m=>m.userData&&m.userData.stairEnds); return w?w.userData.stairEnds:null; })()")
    t = next((e for e in (ends or []) if e['lv'] == 1), None); m0 = len(SEEN)
    if t:   # 自己走（看到對話就停下來讀），不讓 go_to 把對話點掉
        await L.go_to(pg, cdp, R, t['x'], t['z'], 0.4, '[大口 深夜] 上二樓', max_s=200, lv=1, stop=lambda st_: bool(st_.get('dlg')))
        await idle(pg, cdp, 20)
    Ls = [x['t'] for x in await says(pg, n0)] + SEEN[m0:]
    R.check('[大口 深夜] 01:00 一個人走上二樓：「%s」（AA_621 第 3 節）' % DK['alone'], DK['alone'] in Ls, J(Ls))
    await pg.evaluate("(()=>{ GAME.G.hour=3.5; })()"); R.setup('[大口 天亮] 【捷徑】時間撥到 03:30，讀兩小時（跨過 05:00）')
    r = await dk_study(pg, cdp, '[大口 天亮]', '2')
    R.check('[大口 天亮] 03:30 讀到 05:30（跨過 05:00）：「%s」（AA_621 第 2 節）' % DK['dawn'], bool(r) and DK['dawn'] in (r.get('lines') or []), J(r and r.get('lines')))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC XS_SHOP %s（%s：D141 擋玩五項＋營業時間＋截圖）：PARTS=%s；SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (SHOP, CFG['name'], PARTS, os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        if not R.check('這一版有 %s（Z3.ZONES.%s）' % (CFG['name'], ZN), await pg.evaluate("(z=>!!Z3.ZONES[z])", ZN), ''): await b.close(); sys.exit(1)
        for part in PARTS:
            try:
                if part == 'door': await part_door(pg, cdp)
                elif part in ('stairs', 'seats', 'acts'):
                    if part == 'stairs' and CFG['levels'] < 2: continue
                    await enter_inside(pg, cdp, '[%s]' % part)
                    await {'stairs': part_stairs, 'seats': part_seats, 'acts': part_acts}[part](pg, cdp)
                elif part == 'hours': await part_hours(pg, cdp)
                elif part == 'walls': await enter_inside(pg, cdp, '[牆淡出]'); await part_walls(pg, cdp)
                elif part == 'shots': await part_shots(pg, cdp)
                elif part == 'flow' and SHOP == 'dakou': await part_flow(pg, cdp)
            except Exception as e:
                R.check('[%s] 探針沒有例外' % part, False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
