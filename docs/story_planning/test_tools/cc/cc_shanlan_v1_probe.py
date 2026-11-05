"""CC-C（帳號 C）11-05：SHANLAN_v1（BB-C 04:33／04:35／04:48 派工，D141 順序第 2 間）——山嵐書店第 1 版只測擋玩五項＋給使用者看的截圖。判定歸 BB。
  版本：BB-C 04:48 指定 LAWWW-C 開發分支 13700be8f（坐地板還沒接：這一輪記「有沒有按鈕」，不判）。
  期望值的出處：src/data/shanlan_layout.js（AA 子代理的配置：enterAt、exit、stairs、void、holes、seats 16、floorSit 10）、src/shanlan3d.js（兩層導航 D36）、
    src/data/places.js xs_shanlan（AA_613 第 3 節：11:00～22:00，週五、週六到 23:00）。
  一、進出：【前置】讀檔新生南路 2025-10-15（三）14:00、山嵐店門南邊騎樓 → 走到「進山嵐書店」按 → 店裡（站得住、推得動）→「離開山嵐書店」→ 新生南路（站得住、推得動）。
  二、上下樓梯：一樓 → 樓梯 → 二樓（lv 1、y 4.2）→ 下樓回一樓（lv 0、y 0）；兩段都要到、沒有被放到目的地、一路都站得住。
  三、座位 16（一樓靠窗 3、二樓靠窗 5、二樓閱讀桌 8）：走到 seatApproach（那一層）坐下、位置 0.15 m 內、高度＝那一層；起身、推得動。
      坐地板 10（floorSit）：走到旁邊看有沒有「坐…看書」按鈕，有就按、看坐不坐得下，拍一張（BB-C 04:48：這一版還沒接，只記）。
  四、挑空：①二樓導航取樣：挑空裡（樓梯以外）都站不住 ②照玩家在二樓往挑空點地走：一路都不在挑空裡；沒有「人在第 0 層卻離地 >0.5 m、又不在樓梯上」（掉下去卡住）。
  五、營業時間外：讀檔新生南路 10:00 按店門＝不進去、toast＝PLACES.closedText。
  六、穿模／黑畫面：每一步站得住；每張截圖算亮度。
  截圖（給使用者看，不判）：一樓（店門往裡）、二樓（東南角往西北），白天 14:00；剖面視角（人在一樓、遊戲鏡頭）看二樓的盆栽，另外列出「二樓高度、卻不在二樓那一組」的網格（剖面時會浮在半空）。
  七（BB-C 05:06／05:09，9ea82730f 起）：坐地板 10 處真的坐（跪坐、轉暗、過一小時、那一區的一句；藝術區 17:00 前後各坐一次）；互動點 7 個（字照 AA_695 第 1 節）；
      打烊前不到一小時坐地板按鈕不出現（shanlan_sys3d：現在和一小時後都要開著）；打烊時人在店裡＝AA_695 第 4 節那一句、走到新生南路店門外（坐地板那一小時不打斷）。
用法：LW_TESTS=<wt>/tests [PARTS=door,stairs,seats,floor,acts,late,close,void,closed,shots] python3 cc_shanlan_v1_probe.py <url> <out>"""
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
PARTS = [x for x in (os.environ.get('PARTS') or 'door,island,stairs,seats,floor,acts,late,close,void,closed,shots').split(',') if x]
R = L.Run('shanlan_v1', OUT); D.setup(R, OUT)
DAY = '2025-10-15'
ZN = 'xs_shanlan'
# AA_695（claude/magical-albattani-bk7b4n 491357209）第 1 節：互動點 7 個的旁白（照位置）
ACT = [(0, (2.2, 7.3), '看看新書平台', '（平台上擺著這個月的新書。有一本法律的，書腰寫「給第一次打官司的人」。）'),
       (0, (-2.15, 4.6), '看看新書平台', '（這一座是翻譯小說。每一本旁邊都立著一張店員手寫的小卡。）'),
       (0, None, '看雜誌', '（雜誌牆從地板排到天花板。最上面那一排，要踮腳才拿得到。）'),
       (0, None, '看文具', '（筆都可以試寫。試寫的那張紙已經寫滿了，大部分是名字。）'),
       (0, None, '結帳', '（店員在幫前面的人包書套。你手上沒有要買的。）'),
       (1, None, '看看法律書', '（六法排了三種版本。考試用書那一櫃，最下面一層翻得最舊。）'),
       (1, None, '看看二樓', '（走道上坐了三個人，各看各的。沒有店員來趕人。）')]
# 第 2 節：坐地板那一區的一句（藝術區 17:00 以後＝窗外已經暗了；白天＝對面那個人）
SIT = {'文學': '（你坐在書架中間，看完半本小說。旁邊的人換了兩個。）', '法律': '（你在法律區翻了一本《民法總則》的新版，翻到一半，覺得還是圖書館的舊版好讀。）',
       '人文': '（你翻了一本寫城市的書，看到第三章，腳麻了。）', '一樓書架': '（一樓有人在結帳，有人在講電話。你還是看完了兩篇短篇。）'}
SIT_ART_NIGHT = '（你翻了一本攝影集。抬頭的時候窗外已經暗了。）'
SIT_ART_DAY = '（你翻了一本攝影集。抬頭的時候，對面那個人也在看同一本。）'
CLOSE_LINE = '（店裡的廣播說，今天的營業時間快結束了。燈先暗了一半。你走出店門。）'   # 第 4 節
if os.environ.get('CLOSE') == 'aa700': CLOSE_LINE = '我們今天要打烊了。'   # AA_700（4f60052c8，CLOSE-UNIFY-1105）取代 AA_695 第 4 節
SAYHOOK = r"""(()=>{ if(!window.__ccSayWrapped){ const s0=GAME.say; GAME.say=function(who,t){ try{ (window.__ccSay=window.__ccSay||[]).push({t:String(t), h:+(+GAME.G.hour).toFixed(3), zone:GAME.G.zone}); }catch(e){} return s0.apply(this,arguments); }; window.__ccSayWrapped=true; }   /* 只包一次（11-05 雲端：__ccSayOn=false 重設又包一次＝每句記兩次）*/
  if(!window.__ccSayOn){ window.__ccSay=[]; window.__ccSayOn=true; } return true; })()"""


async def says(pg, n=0):
    return await pg.evaluate("(n=>(window.__ccSay||[]).slice(n))", n)


async def play_out(pg, cdp, max_s=90):
    """點掉對話、等場景結束（不選選項）"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await D.st(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
        if not s['busy'] and not s['seat'] and not s['choices']: return s
        await pg.wait_for_timeout(400)
    return await D.st(pg)


async def go_btn(pg, cdp, tag, x, z, lv, label0, near=0.3):
    await L.go_to(pg, cdp, R, x, z, near, '%s %s' % (tag, label0), max_s=240, lv=lv)
    s = await D.settle(pg)
    for _ in range(6):
        if s['interact'].startswith(label0): break
        await pg.wait_for_timeout(400); s = await D.st(pg)
    return s


async def enter_from_street(pg, cdp, tag):
    out = await pg.evaluate("SH3.streetOut()")
    R.setup('%s 讀檔新生南路 %s（三）14:00、山嵐店門南邊騎樓 3 m（%s, %s）' % (tag, DAY, out['x'], out['z'] - 3))
    await D.load_zone(pg, cdp, 'xinsheng', DAY, 14.0, out['x'], out['z'] - 3, 0.0)
    s = await D.use_exit(pg, cdp, '%s 新生南路→山嵐' % tag, '進山嵐書店', ZN)
    return s, out


async def part_door(pg, cdp):
    s, out = await enter_from_street(pg, cdp, '[進出]')
    if not s: return False
    ea = await pg.evaluate("SHANLAN_LAYOUT.enterAt")
    R.check('[進出] 店裡：站在店門內（enterAt (%s, %s) 0.6 m 內、一樓）、推得動 ≥0.3 m' % (ea['x'], ea['z']), math.hypot(s['x'] - ea['x'], s['z'] - ea['z']) < 0.6 and s['lv'] == 0 and await D.pushable(pg, cdp) >= 0.3, J(s))
    await D.shot(pg, 'door_in')
    s = await D.use_exit(pg, cdp, '[進出 山嵐→新生南路]', '離開山嵐書店', 'xinsheng')
    if not s: return False
    R.check('[進出] 回到新生南路店門外面（SH3.streetOut %s 0.6 m 內）、推得動' % J(out), math.hypot(s['x'] - out['x'], s['z'] - out['z']) < 0.6 and await D.pushable(pg, cdp) >= 0.3, J(s))
    await D.shot(pg, 'door_out')
    return True


async def part_island(pg, cdp):
    """店門口（BB-C 06:26：4b5a0ebd8 把店門口的小孤島擋起來）＋整層：0.1 m 格子、站得住（半徑 0.3）的格子從出生點（一樓）／樓梯頂（二樓）四方向都連得到＝沒有站進去出不來的小孤島"""
    r = await pg.evaluate("""(()=>{ const E=GAME.E, L=SHANLAN_LAYOUT, W=L.w, Dd=L.d, cell=0.1, nx=Math.round(W/cell), nz=Math.round(Dd/cell), t=SH3.stairSurf(L), out=[];
      const seeds=[[L.enterAt.x,L.enterAt.z,0],[t.x0/2+t.x1/2,t.z0-0.4,1]];
      for(const [sx,sz,lv] of seeds){ const ok=new Uint8Array(nx*nz), seen=new Uint8Array(nx*nz); const X=i=>-W/2+(i+0.5)*cell, Z=j=>-Dd/2+(j+0.5)*cell; let total=0;
        for(let i=0;i<nx;i++) for(let j=0;j<nz;j++) if(E.canStand(X(i),Z(j),0.3,lv)){ ok[i*nz+j]=1; total++; }
        const si=Math.floor((sx+W/2)/cell), sj=Math.floor((sz+Dd/2)/cell); const q=[[si,sj]]; if(ok[si*nz+sj]) seen[si*nz+sj]=1; let reach=0;
        while(q.length){ const [i,j]=q.pop(); reach++; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a=i+di,b=j+dj; if(a<0||b<0||a>=nx||b>=nz) continue; const k=a*nz+b; if(ok[k]&&!seen[k]){ seen[k]=1; q.push([a,b]); } } }
        const isl=[]; for(let i=0;i<nx;i++) for(let j=0;j<nz;j++){ const k=i*nz+j; if(ok[k]&&!seen[k]) isl.push([+X(i).toFixed(2),+Z(j).toFixed(2)]); }
        const door=isl.filter(p=>Math.hypot(p[0]-L.exit.x,p[1]-L.exit.z)<3);
        out.push({lv, total, reach, seedOk:!!ok[si*nz+sj], islands:isl.length, door:door.slice(0,12), sample:isl.slice(0,12)}); }
      return out; })()""")
    for q in r:
        R.note('[孤島] 第 %d 層：站得住 %d 格、連得到 %d、孤島 %d（店門口 3 m 內 %s）；例 %s' % (q['lv'], q['total'], q['reach'], q['islands'], J(q['door']), J(q['sample'])))
        R.check('[孤島] 第 %d 層：站得住的格子都連得到（孤島 0）' % q['lv'], q['seedOk'] and q['islands'] == 0, J(q['sample']))
        if q['lv'] == 0: R.check('[孤島] 店門口 3 m 內沒有站進去出不來的格子（BB-C 06:26）', not q['door'], J(q['door']))


async def part_stairs(pg, cdp):
    S = await pg.evaluate("(()=>{ const s=SHANLAN_LAYOUT.stairs, t=SH3.stairSurf(SHANLAN_LAYOUT); return {x:s.x, z0:t.z0, z1:t.z1, x0:t.x0, x1:t.x1, yU:SHANLAN_LAYOUT.levels[1].y}; })()")
    R.note('[樓梯] 配置：%s' % J(S))
    legs = [(S['x'], round(S['z0'] - 0.5, 2), 1, '一樓 → 二樓（上樓）', S['yU']), (S['x'], round(S['z1'] + 0.6, 2), 0, '二樓 → 一樓（下樓）', 0.0)]
    for k, (tx, tz, lv, nm, ey) in enumerate(legs):
        fb0 = (await D.st(pg))['fb']
        ok, smp = await D.walk_logged(pg, cdp, tx, tz, 0.35, '[樓梯] ' + nm, max_s=240, lv=lv)
        e = await D.st(pg)
        bad = [[s_['x'], s_['z'], s_['y'], s_['lv']] for s_ in smp if s_['zone'] == ZN and s_['stand'] is False]
        R.note('[樓梯] %s：%d 點；y 範圍 %s～%s；換層 %s' % (nm, len(smp), min((s_['y'] for s_ in smp), default=None), max((s_['y'] for s_ in smp), default=None), J(sorted(set(s_['lv'] for s_ in smp)))))
        R.check('[樓梯] %s：走到了（%.2f, %.2f）、第 %d 層、高度 %.2f＝%.1f（±0.06）、沒有被放到目的地' % (nm, e['x'], e['z'], e['lv'], e['y'], ey), ok and e['lv'] == lv and abs(e['y'] - ey) <= 0.06 and e['fb'] == fb0, J(e))
        R.check('[樓梯] %s：一路每一點都站得住' % nm, not bad, J(bad[:6]))
        await D.shot(pg, 'stairs_%d' % (k + 1))


async def part_floor(pg, cdp):
    fs = await pg.evaluate("SH3.FLOOR_SIT()")
    await pg.evaluate(SAYHOOK)
    arts = 0; posed = set()
    for k, f in enumerate(fs):
        sec = f.get('section'); want_night = False
        h_set = 13.0
        if sec == '藝術':
            arts += 1; want_night = arts == 2; h_set = 17.5 if want_night else 13.0
        R.setup('[坐地板] 【捷徑】#%d %s：時間撥到 %05.2f（每坐一次過一小時，避開打烊前一小時；藝術區第二處撥到 17:30 看晚上那一句）' % (k + 1, sec, h_set))
        await pg.evaluate("(h=>{ GAME.G.hour=h; })", h_set)
        s = await go_btn(pg, cdp, '[坐地板 #%d %s]' % (k + 1, sec), f['x'], f['z'], f['lv'], f['label'], near=0.35)
        if not R.check('[坐地板] #%d %s（%s, %s 第 %d 層）：走到旁邊有「%s」' % (k + 1, sec, f['x'], f['z'], f['lv'], f['label']), s['interact'].startswith(f['label']), J({k_: s[k_] for k_ in ('x', 'z', 'lv', 'interact')})):
            continue
        h0 = (await D.st(pg))['hour']; n0 = len(await says(pg))
        await L.tap(pg, cdp, '#interact')
        seated = None
        for _ in range(30):
            await pg.wait_for_timeout(300)
            pz = await pg.evaluate("(()=>{ const P=GAME.E.player; return {seat:!!P.seat, pose:P.pose||null, floor:!!(P.seat&&P.seat.floor), y:+P.obj.position.y.toFixed(3)}; })()")
            if pz['seat']: seated = pz; break
        if seated and seated.get('pose') not in posed:
            posed.add(seated.get('pose')); await D.shot(pg, 'floor_pose_%s' % (seated.get('pose') or 'x'))
        L1 = []
        for _ in range(80):
            u = await D.st(pg); L1 = await says(pg, n0)
            if any(x['t'] in SIT.values() or x['t'] in (SIT_ART_DAY, SIT_ART_NIGHT) for x in L1): break
            await pg.wait_for_timeout(400)
        await D.shot(pg, 'floor_sit_%d' % (k + 1))
        exp = (SIT_ART_NIGHT if want_night else SIT_ART_DAY) if sec == '藝術' else SIT.get(sec)
        got = next((x for x in L1 if x['t'] in SIT.values() or x['t'] in (SIT_ART_DAY, SIT_ART_NIGHT)), None)
        R.note('[坐地板] #%d %s：坐下 %s；台詞 %s' % (k + 1, sec, J(seated), J(L1)))
        R.check('[坐地板] #%d %s：坐下了（坐在地上：seat.floor）' % (k + 1, sec), bool(seated) and seated['floor'], J(seated))
        R.check('[坐地板] #%d %s：轉暗、過一小時（%.2f → 旁白那一刻 %s）、那一區的一句「%s」（AA_695 第 2 節）' % (k + 1, sec, h0, got and got['h'], exp), bool(got) and got['t'] == exp and abs(got['h'] - h0 - 1) < 0.1, J(got))
        e = await play_out(pg, cdp)
        mv = await D.pushable(pg, cdp); e = await D.st(pg)
        R.check('[坐地板] #%d %s：起身、站得住、推得動' % (k + 1, sec), not e['seat'] and e['stand'] and mv >= 0.3, J({'moved': mv, 'x': e['x'], 'z': e['z'], 'lv': e['lv']}))


async def part_acts(pg, cdp):
    await pg.evaluate(SAYHOOK)
    its = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>!i.hidden&&!i.seat&&!i.exit&&!/坐/.test(i.label||'')).map(i=>({label:i.label||'',x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0})))()")
    R.note('[互動點] 遊戲裡的按鈕：%s' % J(its))
    used = set()
    for lv, pos, lab, exp in ACT:
        cands = [i for i in its if i['label'].startswith(lab) and i['lv'] == lv and (i['x'], i['z']) not in used]
        if pos: cands.sort(key=lambda i: math.hypot(i['x'] - pos[0], i['z'] - pos[1]))
        it = cands[0] if cands else None
        if not R.check('[互動點] 有「%s」（第 %d 層%s）' % (lab, lv, ' 靠 %s' % J(pos) if pos else ''), bool(it), J(cands)): continue
        used.add((it['x'], it['z']))
        await pg.evaluate("(()=>{ if(GAME.G.hour>20) GAME.G.hour=14; })()")
        s = await go_btn(pg, cdp, '[互動點 %s]' % lab, it['x'], it['z'], lv, lab)
        if not R.check('[互動點] 走到「%s」(%s, %s)，按鈕是它' % (lab, it['x'], it['z']), s['interact'].startswith(lab), J(s['interact'])): continue
        n0 = len(await says(pg)); await L.tap(pg, cdp, '#interact')
        L1 = []
        for _ in range(30):
            await pg.wait_for_timeout(300); L1 = await says(pg, n0)
            if L1: break
        await play_out(pg, cdp, 30)
        R.check('[互動點] 「%s」(%s, %s)：旁白「%s」（AA_695 第 1 節）' % (lab, it['x'], it['z'], exp), [x['t'] for x in L1] == [exp], J([x['t'] for x in L1]))
        if lab == '看看二樓': await D.shot(pg, 'act_2f')


async def part_late(pg, cdp):
    """打烊前不到一小時：坐地板按鈕不出現（shanlan_sys3d：現在和一小時後都要開著）；週三 22:00 打烊＝21:00 以後不出現"""
    rows = {}
    for h in (20.9, 21.1, 21.6):
        await pg.evaluate("(h=>{ GAME.G.hour=h; })", h); await pg.wait_for_timeout(1500)
        n = await pg.evaluate("(()=>{ const L=SH3.FLOOR_SIT().map(f=>f.label); return GAME.E.interactables.filter(i=>!i.hidden&&L.includes(i.label)&&!i.seat).length; })()")
        ok = await pg.evaluate("(h=>[PLACES.isOpen('xs_shanlan',h,GAME.G.day), PLACES.isOpen('xs_shanlan',h+1,GAME.G.day)])", h)
        rows[h] = [n, ok]
    R.note('[打烊前] 坐地板按鈕數（看得到的）／現在、一小時後開不開：%s' % J(rows))
    R.check('[打烊前] 20:54 坐地板按鈕還在（一小時後 21:54 照樣開著）', rows[20.9][0] == 10, J(rows[20.9]))
    R.check('[打烊前] 21:06、21:36（打烊 22:00 前不到一小時）坐地板按鈕都不出現', rows[21.1][0] == 0 and rows[21.6][0] == 0, J([rows[21.1], rows[21.6]]))
    await pg.evaluate("(()=>{ GAME.G.hour=14; })()")


async def part_close(pg, cdp):
    """打烊時人在店裡：AA_695 第 4 節那一句、走到新生南路店門外；坐地板那一小時不打斷"""
    out = await pg.evaluate("SH3.streetOut()")
    for mode in ('stand', 'sitting'):
        R.setup('[打烊] 讀檔山嵐一樓 %s %s（%s）' % (DAY, '21:58' if mode == 'stand' else '20:50', '站著等打烊' if mode == 'stand' else '20:50 坐地板、坐著的時候時間撥過打烊'))
        await D.load_zone(pg, cdp, ZN, DAY, 21.97 if mode == 'stand' else 20.83, 0.8, 6.5, math.pi, lv=0, wait=7000)
        await pg.evaluate("(()=>{ window.__ccSayOn=false; })()"); await pg.evaluate(SAYHOOK); n0 = 0
        if mode == 'sitting':
            f = next(q for q in await pg.evaluate("SH3.FLOOR_SIT()") if q['lv'] == 0)
            s = await go_btn(pg, cdp, '[打烊 坐地板]', f['x'], f['z'], 0, f['label'], near=0.35)
            if not R.check('[打烊] 20:5x 一樓坐地板有按鈕', s['interact'].startswith(f['label']), J(s)): continue
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            await pg.evaluate("(()=>{ GAME.G.hour=22.05; })()")   # 【捷徑】坐著轉暗的時候時間撥過打烊
            R.setup('[打烊] 【捷徑】坐地板轉暗的時候 GAME.G.hour＝22:03（過了打烊）')
        t0 = time.time(); z = None
        while time.time() - t0 < 120:
            s = await D.st(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
            if s['zone'] == 'xinsheng' and not s['busy']: z = s; break
            await pg.wait_for_timeout(500)
        L1 = [x['t'] for x in await says(pg, n0)]
        R.note('[打烊 %s] 台詞 %s；最後 %s' % (mode, J(L1), J(z)))
        ci = L1.index(CLOSE_LINE) if CLOSE_LINE in L1 else -1
        R.check('[打烊 %s] 出「%s」（AA_695 第 4 節）、走到新生南路店門外（SH3.streetOut 0.6 m 內）、站得住' % (mode, CLOSE_LINE), ci >= 0 and bool(z) and math.hypot(z['x'] - out['x'], z['z'] - out['z']) < 0.6 and z['stand'], J({'lines': L1, 'end': z}))
        if mode == 'sitting':
            si = next((i for i, t in enumerate(L1) if t in SIT.values()), -1)
            R.check('[打烊 坐地板] 那一小時沒被打斷：先出那一區的一句、再出打烊那一句', 0 <= si < ci, J(L1))
        if z: R.check('[打烊 %s] 到新生南路以後推得動' % mode, await D.pushable(pg, cdp) >= 0.3, '')
        await D.shot(pg, 'close_%s' % mode)


async def part_void(pg, cdp):
    g = await pg.evaluate("""(()=>{ const E=GAME.E, L=SHANLAN_LAYOUT, h=L.holes[0], t=SH3.stairSurf(L), bad=[]; let n=0;
      for(let x=h[0]-h[2]/2+0.4; x<=h[0]+h[2]/2-0.4+1e-6; x+=0.5) for(let z=h[1]-h[3]/2+0.4; z<=h[1]+h[3]/2-0.4+1e-6; z+=0.5){
        if(x>=t.x0-0.4&&x<=t.x1+0.4&&z<=t.z1+0.4) continue; n++; if(E.canStand(x,z,0.3,1)) bad.push([+x.toFixed(2),+z.toFixed(2)]); }
      return {n, bad, hole:h, stair:[t.x0,t.x1,t.z0,t.z1]}; })()""")
    R.check('[挑空] 二樓導航：挑空裡（樓梯以外 %d 點）都站不住' % g['n'], not g['bad'], J(g))
    R.setup('[挑空] 讀檔山嵐二樓 (1.0, 3.0)（挑空東邊的欄杆旁）')
    s = await D.load_zone(pg, cdp, ZN, DAY, 14.0, 1.0, 3.0, -math.pi / 2, lv=1)
    R.note('[挑空] 起點 %s' % J(s))
    h = g['hole']; hx0, hx1, hz0, hz1 = h[0] - h[2] / 2, h[0] + h[2] / 2, h[1] - h[3] / 2, h[1] + h[3] / 2
    t = g['stair']
    for tx, tz, nm in [(-4.0, 5.0, '往挑空中間點地'), (-3.0, 1.6, '往挑空北邊點地')]:
        ok, smp = await D.walk_logged(pg, cdp, tx, tz, 0.4, '[挑空] 二樓' + nm, max_s=60, lv=1)
        inside = [[s_['x'], s_['z'], s_['lv'], s_['y']] for s_ in smp if s_['lv'] == 1 and hx0 + 0.05 < s_['x'] < hx1 - 0.05 and hz0 + 0.05 < s_['z'] < hz1 - 0.05 and not (t[0] - 0.1 <= s_['x'] <= t[1] + 0.1)]
        fell = [[s_['x'], s_['z'], s_['lv'], s_['y']] for s_ in smp if s_['lv'] == 0 and s_['y'] > 0.5 and not (t[0] - 0.1 <= s_['x'] <= t[1] + 0.1 and t[2] - 0.3 <= s_['z'] <= t[3] + 0.3)]
        e = await D.st(pg)
        R.note('[挑空] %s：%d 點、最後 (%.2f, %.2f) 第 %d 層 y %.2f、到了目標＝%s' % (nm, len(smp), e['x'], e['z'], e['lv'], e['y'], ok))
        R.check('[挑空] 二樓%s：人沒有走進挑空、沒有掉下去卡住（第 0 層離地 >0.5 m 又不在樓梯上）' % nm, not inside and not fell and not ok, J({'inside': inside[:6], 'fell': fell[:6], 'end': [e['x'], e['z'], e['lv'], e['y']]}))
        R.check('[挑空] 二樓%s以後：站得住、推得動' % nm, e['stand'] and await D.pushable(pg, cdp) >= 0.3, J(e))
        await D.shot(pg, 'void_%s' % ('mid' if tz > 3 else 'north'))


async def part_shots(pg, cdp):
    R.setup('[截圖] 讀檔山嵐一樓 %s 14:00' % DAY)
    await D.load_zone(pg, cdp, ZN, DAY, 14.0, 0.8, 7.5, math.pi, lv=0, wait=9000)
    await D.user_shot(pg, cdp, 'user_1f_day', {'eye': [0.8, 1.6, 8.3], 'look': [-1.0, 1.5, -6.0], 'lens': 24})
    # 剖面視角：人在一樓、遊戲自己的鏡頭；列出二樓高度、卻不在二樓那一組的網格
    await pg.set_viewport_size({'width': 1280, 'height': 720})
    for k, (x, z) in enumerate([(1.5, 2.5), (4.5, 6.5), (-3.0, 3.0)]):
        await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.obj.position.x=x; P.obj.position.z=z; })", [x, z]); await pg.wait_for_timeout(1500)
        # 剖面視角＝人在一樓、鏡頭拉高過二樓地板（4.2 m）：把跟隨鏡頭拉遠、往下看（玩家縮放、轉鏡頭做得到的範圍），直到二樓那一組藏起來
        cut = None
        for pitch, dist in ((0.6, 8.0), (0.8, 9.0), (1.0, 10.0), (1.15, 11.0)):
            await pg.evaluate("(([p,d])=>{ const C=GAME.E.cam; C.pitch=p; C.dist=d; C.distTarget=d; })", [pitch, dist]); await pg.wait_for_timeout(1500)
            cut = await pg.evaluate("(()=>{ const z=GAME.E.zone, g1=z.levelGroups[1].group; return {g1visible:g1.visible, camY:+GAME.E.camera.position.y.toFixed(2)}; })()")
            if cut['g1visible'] is False: cut['pitch'] = pitch; cut['dist'] = dist; break
        R.note('[截圖 剖面 %d] 拉鏡頭：%s' % (k + 1, J(cut)))
        fl = await pg.evaluate("""(()=>{ const E=GAME.E, z=E.zone, LG=z&&z.levelGroups, g1=LG&&LG[1]&&LG[1].group; const vis=o=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; };
          const inG1=o=>{ for(let p=o;p;p=p.parent) if(p===g1) return true; return false; }; const out=[]; const B=new THREE.Box3();
          E.scene.traverse(o=>{ if(!o.isMesh||!vis(o)||inG1(o)) return; B.setFromObject(o); if(B.min.y>4.05&&B.max.y<8.3) out.push({name:o.name||(o.parent&&o.parent.name)||'?', mat:(Array.isArray(o.material)?o.material[0]:o.material||{}).name||'', y:[+B.min.y.toFixed(2),+B.max.y.toFixed(2)], x:+((B.min.x+B.max.x)/2).toFixed(2), z:+((B.min.z+B.max.z)/2).toFixed(2)}); });
          return {g1visible:g1?g1.visible:null, camY:+E.camera.position.y.toFixed(2), floaters:out.slice(0,30), n:out.length}; })()""")
        R.note('[截圖 剖面 %d] 人在一樓 (%s, %s)：二樓那一組 visible＝%s、鏡頭高 %s；二樓高度卻不在二樓那一組、看得到的網格 %d 個：%s' % (k + 1, x, z, fl['g1visible'], fl['camY'], fl['n'], J(fl['floaters'])))
        await pg.evaluate(D.HUD + '(false)'); await D.shot(pg, 'user_cutaway_%d' % (k + 1)); await pg.evaluate(D.HUD + '(true)')
        await pg.evaluate("(()=>{ const C=GAME.E.cam; C.pitch=0.22; C.dist=6.0; C.distTarget=6.0; })()")
    R.setup('[截圖] 讀檔山嵐二樓 %s 14:00' % DAY)
    await D.load_zone(pg, cdp, ZN, DAY, 14.0, 5.5, 7.5, -math.pi * 0.75, lv=1, wait=9000)
    await D.user_shot(pg, cdp, 'user_2f_day', {'eye': [6.2, 5.8, 8.4], 'look': [-2.5, 5.0, -5.0], 'lens': 24})


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC SHANLAN_v1（山嵐書店第 1 版：只測擋玩五項＋給使用者的截圖）：PARTS=%s；SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (PARTS, os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        has = await pg.evaluate("typeof SH3!=='undefined'&&!!Z3.ZONES.xs_shanlan")
        if not R.check('這一版有山嵐書店（SH3、Z3.ZONES.xs_shanlan）', has, ''): await b.close(); sys.exit(1)
        if 'door' in PARTS: await part_door(pg, cdp)
        if any(x in PARTS for x in ('island', 'stairs', 'seats', 'floor', 'acts', 'late')):
            s, _ = await enter_from_street(pg, cdp, '[店裡]')
            if not s:
                R.setup('[店裡] 進不去：【捷徑】直接讀檔進山嵐一樓')
                await D.load_zone(pg, cdp, ZN, DAY, 14.0, 0.8, 7.5, math.pi, lv=0, wait=8000)
            if 'island' in PARTS: await part_island(pg, cdp)
            if 'stairs' in PARTS: await part_stairs(pg, cdp)
            if 'seats' in PARTS: await D.sit_all(pg, cdp, '[座位]', 'shanlan')
            if 'floor' in PARTS: await part_floor(pg, cdp)
            if 'acts' in PARTS: await part_acts(pg, cdp)
            if 'late' in PARTS: await part_late(pg, cdp)
        if 'close' in PARTS: await part_close(pg, cdp)
        if 'void' in PARTS: await part_void(pg, cdp)
        if 'closed' in PARTS:
            out = await pg.evaluate("SH3.streetOut()")
            await D.closed_door(pg, cdp, '[營業時間外]', 'xinsheng', ZN, '進山嵐書店', ZN, out['x'], out['z'] - 3, 10.0, DAY)
        if 'shots' in PARTS: await part_shots(pg, cdp)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
