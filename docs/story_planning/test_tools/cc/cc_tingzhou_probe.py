"""CC（帳號 A）11-10：TINGZHOU_V1（汀州路商圈第 1 版，X321／X322；BB 20:45；開發分支 7a625da3c）。Playwright（PC GPU）≠ iPhone。
對照的程式（7a625da3c）：src/data/tingzhou_layout.js（路 x −5～5、騎樓 3.2 m、立面 x ±5、店面 x ±8.2；walk z −40～40；巷 A 東側 z −2.5～2.5；fromGongguan (27,0)；
  toGongguan (28.6,0) r1.4 → 公館 (37.1,18)；shops 西側 W／東側 E）、src/tingzhou3d.js（店的互動：label「看＋店名」或「進＋店名」、look 原文；公館 G10 門口「往汀州路（巷子）」tzGate）。
PARTS：
  GATE   【前置】讀檔到公館 (37.1,17.5) 14:00 → 觸控走到「往汀州路（巷子）」按 → tingzhou：出生點、站得住、黑幕秒數（GAME.isEntering）、walkFallbacks
         → 走到「往公館（羅斯福路）」按 → 公館：出生點；來回兩次。
  SHOPS  八間（泰米村食、洗樂洗衣坊、印得好、越好吃小館、客居雲南、東南大聯商行、汀州聯通、溫特寶邸）：觸控走到互動點、按、記字幕／對話原文（「進」的：進去以後記區域再走出口回來）。
  WALK   沿路中間 x 0 從 z −38 走到 38（每 8 m 一個點、真的走）；試走出地圖（z −50、50、x −20、30）→ 停下來的位置；兩側騎樓 x ±6.6 每 10 m 走一次（記卡住的點）；巷 A 走到 (20,0) 再回 (0,0)。
  OLD    【前置】公館 G09～G11 門口（照公館現在的店門互動點 x、z 21）各讀一次舊格式存檔（pos 在那裡）→ 站得住（E.nav.free、讀檔後位置）；記那附近的互動點現在顯示什麼。
  SHOTS  14:00、18:30、20:30 各一組（拍照鏡頭，先跑 zone.fadeWalls）：巷 A 出口看泰米村食、概念圖機位 (4.6,1.65,34.5)→(−6.5,3,12)、路中間往南／往北、八間各自正面；
         玩家視角走路中兩張（遊戲鏡頭）；每個時間拼一張。
  FPS    中畫質站路中間 (0,0) 10 秒 requestAnimationFrame。
用法：LW_TESTS=<wt>/tests [PARTS=GATE,SHOPS,WALK,OLD,SHOTS,FPS] python3 cc_tingzhou_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PARTS = (os.environ.get('PARTS') or 'GATE,SHOPS,WALK,OLD,SHOTS,FPS').split(',')
R = L.Run('tingzhou', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = '2025-11-01'
SHOPS8 = ['泰米村食', '洗樂洗衣坊', '印得好', '越好吃小館', '客居雲南', '東南大聯商行', '汀州聯通', '溫特寶邸']
ME = "(()=>{ const P=GAME.E.player, p=P.obj.position, N=GAME.E.nav; return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), x:+p.x.toFixed(2), z:+p.z.toFixed(2), free:N?N.free(p.x,p.z):null, ent:!!(GAME.isEntering&&GAME.isEntering()), busy:!!P.busy, fb:GAME.walkFallbacks|0}; })()"
ITS = "(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.2,to:i.exit?i.exit.to:null,look:i.look||null,tz:i.tzShop||null,gate:!!i.tzGate})))()"
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||50, c.width/c.height, 0.1, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const z=E.zone, P=E.player&&E.player.obj; if(z&&z.fadeWalls){ try{ z.fadeWalls(cam,P?P.position:cam.position); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  const hid=[]; if(P){ hid.push([P,P.visible]); P.visible=false; }
  try{ r.render(E.scene,cam); const k=document.createElement('canvas'); k.width=a.tw; k.height=Math.round(a.tw*c.height/c.width); const g=k.getContext('2d'); g.drawImage(c,0,0,k.width,k.height);
    g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(0,0,k.width,20); g.fillStyle='#fff'; g.font='14px sans-serif'; g.fillText(a.label,5,15); (window.__TZ=window.__TZ||[]).push(k.toDataURL('image/jpeg',0.86));
    return a.full?c.toDataURL('image/jpeg',0.88):null; } finally { for(const [o,v] of hid) o.visible=v; if(z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } } })"""
PUSHGAME = "(u=>{ (window.__TZ=window.__TZ||[]).push(u); })"
MONT = r"""(async a=>{ const L=window.__TZ||[]; const ims=await Promise.all(L.map(u=>new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=u; })));
  const w=420, h=Math.round(420*ims[0].height/ims[0].width), C=a.cols, rows=Math.ceil(ims.length/C), k=document.createElement('canvas'); k.width=w*C; k.height=h*rows+28; const g=k.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,k.width,k.height);
  g.fillStyle='#fff'; g.font='bold 20px sans-serif'; g.fillText(a.title,8,21); ims.forEach((im,i)=>g.drawImage(im,(i%C)*w,28+Math.floor(i/C)*h,w,h)); return k.toDataURL('image/jpeg',0.86); })"""


def save(u, fn):
    if u: open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def at(pg, cdp, zone, h, x=None, z=None, why=''):
    await D.load_zone(pg, cdp, zone, DAY, h, x, z, wait=8000)
    R.setup('【前置／捷徑】讀檔到 %s %s %.1f 時%s %s' % (zone, DAY, h, '' if x is None else ' (%.1f,%.1f)' % (x, z), why))


async def tap_it(pg, cdp, it, tag, max_s=120):
    ok = await L.go_to(pg, cdp, R, it['x'], it['z'], min(0.9, it['r'] * 0.8), '%s 走到「%s」' % (tag, it['label']), max_s=max_s)
    await pg.wait_for_timeout(600); s = await L.state(pg)
    if not s['interact']: R.note('%s「%s」旁邊沒有按鈕：%s' % (tag, it['label'], J({k: s[k] for k in ('x', 'z', 'interact')})))
    await L.tap(pg, cdp, '#interact'); return ok


async def wait_zone(pg, want, t0, secs=40):
    ent_end = None
    while time.time() - t0 < secs:
        me = await pg.evaluate(ME)
        if me['zone'] == want and not me['ent']: ent_end = round(time.time() - t0, 2); break
        await pg.wait_for_timeout(200)
    return ent_end, await pg.evaluate(ME)


async def part_gate(pg, cdp):
    await at(pg, cdp, 'gongguan', 14.0, 37.1, 17.5, '（公館店面街 G10 前的人行道）')
    for n in (1, 2):
        tag = '[GATE 第%d次]' % n
        it = next((i for i in await pg.evaluate(ITS) if i['gate']), None)
        if not R.check('%s 公館有「往汀州路（巷子）」' % tag, bool(it), ''): return
        R.note('%s 入口互動點 %s' % (tag, J(it)))
        await tap_it(pg, cdp, it, tag); t0 = time.time(); te, me = await wait_zone(pg, 'tingzhou', t0)
        await pg.wait_for_timeout(1500); me2 = await pg.evaluate(ME)
        R.note('%s 進汀州路：黑幕 %s 秒；出生 %s；1.5 秒後 %s' % (tag, te, J(me), J(me2)))
        R.check('%s 進到 tingzhou、站得住（導航格可走、沒有自己跑）' % tag, me['zone'] == 'tingzhou' and me2['free'] and abs(me2['x'] - me['x']) + abs(me2['z'] - me['z']) < 0.3, J([me, me2]))
        await pg.screenshot(path=os.path.join(OUT, 'tz_gate_in%d.jpg' % n), type='jpeg', quality=70)
        back = next((i for i in await pg.evaluate(ITS) if i['to'] == 'gongguan'), None)
        if not R.check('%s 汀州路有「往公館」' % tag, bool(back), ''): return
        await tap_it(pg, cdp, back, tag + '回'); t0 = time.time(); te, me = await wait_zone(pg, 'gongguan', t0)
        await pg.wait_for_timeout(1500); me2 = await pg.evaluate(ME)
        R.note('%s 回公館：黑幕 %s 秒；出生 %s；1.5 秒後 %s' % (tag, te, J(me), J(me2)))
        R.check('%s 回到公館、站得住' % tag, me['zone'] == 'gongguan' and me2['free'], J([me, me2]))
    R.check('[GATE] walkFallbacks 0', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


async def part_shops(pg, cdp):
    await at(pg, cdp, 'tingzhou', 14.0, None, None, '（從公館進來的出生點）')
    its = await pg.evaluate(ITS); R.note('[SHOPS] 汀州路互動點：%s' % J(its))
    for nm in SHOPS8:
        tag = '[SHOPS %s]' % nm; it = next((i for i in its if nm in (i['label'] or '')), None)
        if not R.check('%s 有互動點' % tag, bool(it), ''): continue
        await pg.evaluate("(document.getElementById('caption')||{}).textContent=''")
        ok = await tap_it(pg, cdp, it, tag); cap = ''; dl = []
        for _ in range(16):
            s = await L.state(pg); cap = await pg.evaluate("(document.getElementById('caption')||{}).textContent||''")
            if s['dlg']: dl.append(s['dtext']); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
            if s['choices']: dl.append('選項 ' + J(await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())"))); await L.tap(pg, cdp, '#choices button'); continue
            if cap: break
            await pg.wait_for_timeout(300)
        me = await pg.evaluate(ME)
        R.note('%s 走到 %s；字幕「%s」；對話 %s；之後 %s；配置的 look「%s」' % (tag, ok, cap, J(dl), J(me), it['look']))
        R.check('%s 走得到、按了有反應（字幕或進店）' % tag, bool(ok) and (bool(cap) or bool(dl) or me['zone'] != 'tingzhou'), J(me))
        if me['zone'] != 'tingzhou':
            ex = next((i for i in await pg.evaluate(ITS) if i['to'] == 'tingzhou'), None)
            if ex: await tap_it(pg, cdp, ex, tag + '出店'); await wait_zone(pg, 'tingzhou', time.time())
    R.check('[SHOPS] walkFallbacks 0', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


async def part_walk(pg, cdp):
    await at(pg, cdp, 'tingzhou', 14.0, 0.0, -38.0, '（路中間北端）')
    stuck = []
    for zz in range(-30, 42, 8):
        ok = await L.go_to(pg, cdp, R, 0.0, float(min(zz, 38)), 0.6, '[WALK] 路中間 → z %d' % min(zz, 38), max_s=60)
        if not ok: stuck.append(('road', zz, await pg.evaluate(ME)))
    for tx, tz in ((0, 50), (0, -50), (-20, 0), (30, 10)):
        await L.go_to(pg, cdp, R, float(tx), float(tz), 0.6, '[WALK] 試走出地圖 (%d,%d)' % (tx, tz), max_s=50)
        me = await pg.evaluate(ME); R.note('[WALK] 往 (%d,%d) 停在 %s' % (tx, tz, J(me)))
        R.check('[WALK] 往 (%d,%d) 沒有走出地圖（z −40.5～40.5、x −8.5～29）' % (tx, tz), -40.6 <= me['z'] <= 40.6 and -8.6 <= me['x'] <= 29.5 and me['zone'] == 'tingzhou', J(me))
        if me['zone'] != 'tingzhou': await at(pg, cdp, 'tingzhou', 14.0, 0.0, 0.0, '（走出去了，回來）')
    for side in (-6.6, 6.6):
        for zz in range(-35, 40, 10):
            ok = await L.go_to(pg, cdp, R, side, float(zz), 0.6, '[WALK] 騎樓 (%.1f,%d)' % (side, zz), max_s=50)
            if not ok: stuck.append(('arcade', side, zz, await pg.evaluate(ME)))
    ok1 = await L.go_to(pg, cdp, R, 20.0, 0.0, 0.6, '[WALK] 巷 A 走到 (20,0)', max_s=60)
    ok2 = await L.go_to(pg, cdp, R, 0.0, 0.0, 0.6, '[WALK] 巷 A 走回 (0,0)', max_s=60)
    R.note('[WALK] 走不到的點：%s' % J(stuck))
    R.check('[WALK] 路中間、騎樓每個點都走得到（沒有隱形牆、沒有卡在柱子）', not stuck, J(stuck))
    R.check('[WALK] 巷 A 進得去、出得來', ok1 and ok2, '')
    R.check('[WALK] walkFallbacks 0', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


async def part_old(pg, cdp):
    await at(pg, cdp, 'gongguan', 14.0, 37.1, 17.5, '（看 G09～G11 的互動點）')
    its = [i for i in await pg.evaluate(ITS) if 26 <= i['x'] <= 50 and 15 <= i['z'] <= 24]
    R.note('[OLD] 公館 x 26～50、z 15～24 的互動點（G09～G11 一帶）：%s' % J(its))
    pts = sorted({(round(i['x'], 1), 21.0) for i in its if i['to'] or '進' in (i['label'] or '')})[:4] or [(33.0, 21.0), (37.1, 21.0), (41.0, 21.0)]
    for x, z in pts:
        st = await D.load_zone(pg, cdp, 'gongguan', DAY, 14.0, x, z, wait=6000); me = await pg.evaluate(ME); await pg.wait_for_timeout(1500); me2 = await pg.evaluate(ME)
        R.note('[OLD] 存檔 pos (%.1f,%.1f) → 讀進來 %s；1.5 秒後 %s' % (x, z, J(me), J(me2)))
        R.check('[OLD] 公館 (%.1f,%.1f) 的存檔讀得進來、站得住' % (x, z), me2['zone'] == 'gongguan' and me2['free'] and math.hypot(me2['x'] - x, me2['z'] - z) < 3.0, J(me2))


async def part_shots(pg, cdp):
    lay = await pg.evaluate("(()=>({shops:TINGZHOU_LAYOUT.shops.filter(s=>%s.includes(s.name)).map(s=>({name:s.name,side:s.side,zc:(s.z0+s.z1)/2}))}))()" % J(SHOPS8))
    HRS = [float(x) for x in (os.environ.get('HOURS') or '14,18.5,20.5').split(',')]   # r2（BB 21:05）：第 2 版加 17:15（HOURS=14,17.25,18.5,20.5）
    for h in HRS:
        await at(pg, cdp, 'tingzhou', h, 0.0, 6.0, '（拍照）'); await pg.evaluate("window.__TZ=[]")
        sg = await pg.evaluate("(()=>{ const z=(typeof E3!=='undefined'&&E3.zone)||(GAME.E&&GAME.E.zone)||{}; return {tzScooterGLB:z.tzScooterGLB===undefined?'undefined':z.tzScooterGLB}; })()")
        R.note('[SHOTS %.2f] 正式機車模型載入台數 zone.tzScooterGLB＝%s（undefined＝沒載入、畫面上是套件的備用機車；LAWWW2 22:19）' % (h, J(sg)))
        hh = '%02d:%02d' % (int(h), int(round((h % 1) * 60)))
        V = [('巷A出口看泰米村食', (7.0, 1.65, 0.0), (-8.0, 3.0, -1.0), 55), ('概念圖機位', (4.6, 1.65, 34.5), (-6.5, 3.0, 12.0), 55),
             ('路中間往南', (0.0, 1.65, -2.0), (0.0, 2.6, 40.0), 60), ('路中間往北', (0.0, 1.65, 2.0), (0.0, 2.6, -40.0), 60)]
        for s in lay['shops']:
            sx = -1 if s['side'] == 'W' else 1
            V.append(('%s 正面' % s['name'], (-sx * 3.5, 2.2, s['zc']), (sx * 7.0, 4.2, s['zc']), 55))
        if os.environ.get('V2') == '1':   # r2（BB 21:05）：巷 A 裡面兩張（18:30、20:30）、三間櫥窗近拍（騎樓裡、離櫥窗 3 m）
            if h >= 17 or os.environ.get('ALLEY_ALL') == '1':   # r3（BB 21:31）：17:00 以後有攤（兩張）、14:00 攤子蓋帆布（ALLEY_ALL=1 每個時間都拍）
                V.append(('巷A裡面往裡看', (7.5, 1.65, 0.0), (24.0, 1.8, 0.0), 60)); V.append(('巷A裡面往汀州路看', (20.0, 1.65, 0.0), (0.0, 2.2, 0.0), 60))
            for s in lay['shops']:
                if s['name'] in ('泰米村食', '洗樂洗衣坊', '印得好'):
                    sx = -1 if s['side'] == 'W' else 1
                    V.append(('%s 櫥窗近拍' % s['name'], (sx * 5.2, 1.6, s['zc']), (sx * 8.4, 1.3, s['zc']), 60))
        if os.environ.get('V2') == '1':   # r3（BB 21:31）：水源市場前、五間正式店名（沒有騎樓的那五間）招牌近拍
            mk = await pg.evaluate("(()=>{ const m=TINGZHOU_LAYOUT.shops.find(s=>s.id==='e_market'); return m?(m.z0+m.z1)/2:null; })()")
            if mk is not None: V.append(('水源市場前', (-2.5, 1.65, mk - 7.0), (8.2, 2.6, mk), 60))
            for s5 in await pg.evaluate("(()=>TINGZHOU_LAYOUT.shops.filter(s=>s.arcade===false).map(s=>({name:s.name,side:s.side,zc:(s.z0+s.z1)/2})))()"):
                sx = -1 if s5['side'] == 'W' else 1
                V.append(('%s 招牌近拍' % s5['name'], (sx * 3.6, 3.4, s5['zc']), (sx * 8.4, 3.9, s5['zc']), 48))
        if os.environ.get('SHOPS3') == '1':   # 第 3 版（BB 21:52）：只拍泰米村食、洗樂洗衣坊、印得好的正面＋招牌近拍（和 LAWWW2 的參考圖 shop_taimi／xile／yindehao 並排）
            V = []
            for s3 in await pg.evaluate("(()=>TINGZHOU_LAYOUT.shops.filter(s=>['taimi','xile','yindehao'].includes(s.id)).map(s=>({id:s.id,name:s.name,side:s.side,zc:(s.z0+s.z1)/2,arc:s.arcade!==false})))()"):
                sx = -1 if s3['side'] == 'W' else 1
                V.append(('%s 正面' % s3['name'], (-sx * 3.5, 2.2, s3['zc']), (sx * 7.0, 4.2, s3['zc']), 55))
                V.append(('%s 招牌近拍' % s3['name'], (sx * (1.6 if s3['arc'] else 3.6), 3.4, s3['zc']), (sx * (5.2 if s3['arc'] else 8.4), 3.9, s3['zc']), 48))
                V.append(('%s 斜看' % s3['name'], (0.0, 1.65, s3['zc'] + 9.0), (sx * 6.0, 3.0, s3['zc']), 55))
                V.append(('%s 路中間玩家視角' % s3['name'], (-sx * 1.0, 3.2, s3['zc'] + 6.5), (sx * 6.0, 2.6, s3['zc']), 60))   # BB 21:59：站在街上讀得出來（跟隨鏡頭的高度約 3 m、在玩家後上方）
        for lab, frm, at_, fov in V:
            u = await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at_), 'fov': fov, 'tw': 560, 'label': '%s %s' % (hh, lab), 'full': lab in ('概念圖機位', '巷A出口看泰米村食') or os.environ.get('SHOPS3') == '1' or os.environ.get('FULLALL') == '1'})
            if u: save(u, 'tz_%s_%s.jpg' % (hh.replace(':', ''), 'concept' if lab == '概念圖機位' else 'alleyA'))
            if os.environ.get('SHOPS3') == '1' and u: save(u, 'tz3_%s_%s.jpg' % (hh.replace(':', ''), lab.replace(' ', '_')))   # 三間每張存全尺寸（拼並排用）
            elif os.environ.get('FULLALL') == '1' and u: save(u, 'tzf_%s_%s.jpg' % (hh.replace(':', ''), lab.replace(' ', '_')))   # BB 21:59：成排的東西（機車、攤子）要裁放大圖：每張存全尺寸
        for k, (tx, tz) in enumerate(((0.0, 14.0), (0.0, -10.0))):
            await L.go_to(pg, cdp, R, tx, tz, 0.8, '[SHOTS %s] 玩家視角走路' % hh, max_s=40)
            b = await pg.screenshot(type='jpeg', quality=82); await pg.evaluate(PUSHGAME, 'data:image/jpeg;base64,' + base64.b64encode(b).decode())
        u = await pg.evaluate(MONT, {'cols': 4, 'title': '汀州路 %s（%s）：巷 A 出口、概念圖機位、路中往南／北、八間正面、%s玩家視角兩張' % (hh, os.environ.get('SHA', '')[:9], '巷 A、櫥窗、水源市場、招牌、' if os.environ.get('V2') == '1' else '')})
        save(u, 'tz_%s_all.jpg' % hh.replace(':', ''))
        R.note('[SHOTS] %s 拼圖 tz_%s_all.jpg（%d 張）' % (hh, hh.replace(':', ''), len(V) + 2))


async def part_fps(pg, cdp):
    await pg.evaluate("(()=>{ const s=document.getElementById('setQuality'); if(s){ s.value='medium'; s.dispatchEvent(new Event('change')); } })()")
    await at(pg, cdp, 'tingzhou', 18.5, 0.0, 0.0, '（中畫質、路中間、18:30 夜市攤開始擺）')
    await pg.wait_for_timeout(3000)
    FS = int(os.environ.get('FPSS') or 10)
    fps = await pg.evaluate("new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<%d)" % (FS * 1000) + " requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })")
    npc = await pg.evaluate("(GAME.E.npcs||[]).length")
    R.note('[FPS] 中畫質、路中間 18:30 站 %d 秒：%s fps（NPC %d；PC GPU，不是 iPhone）' % (FS, fps, npc))


async def part_scoot(pg, cdp):
    """BB 22:44：汀州路路邊機車有沒有換成正式模型（scooter.glb）。c17a9919e 沒有 zone.tzScooterGLB 這個值：
    看場景裡 'tz_scooters_glb' 那一組有沒有掛上、裡面幾個物件、套件備用機車還在不在（tingzhou3d.js 68～75 行）"""
    for h in [float(x) for x in (os.environ.get('HOURS') or '14').split(',')]:
        await at(pg, cdp, 'tingzhou', h, 0.0, 6.0, '（機車模型）')
        res = None
        for k in range(30):
            await pg.wait_for_timeout(1000)
            res = await pg.evaluate("""(()=>{ const E=GAME.E, z=(typeof E3!=='undefined'&&E3.zone)||E.zone||{}; const g=E.scene.getObjectByName('tz_scooters_glb');
              let meshes=0, kinds=new Set(); if(g) g.traverse(o=>{ if(o.isMesh){ meshes++; kinds.add((o.geometry&&o.geometry.uuid)||o.name); } });
              const a=(typeof ASSETS!=='undefined'&&ASSETS.manifest)?ASSETS.manifest['bldg.wz_scooter']:null;
              return {tzScooters:z.tzScooters===undefined?'undefined':z.tzScooters, tzScooterGLB:z.tzScooterGLB===undefined?'undefined':z.tzScooterGLB, glbGroup:!!g, glbChildren:g?g.children.length:0, glbMeshes:meshes, glbGeoKinds:kinds.size,
                manifest:!!a, url:a&&a.url, state:a&&(a.state||a.status||null)}; })()""")
            if res['glbGroup'] or k >= 29: break
        R.note('[SCOOT %.2f] 等 %d 秒：%s' % (h, k + 1, J(res)))
        # BB 22:45：一排裡有幾種外形、同款同色連續最多幾台、兩側各有幾段空位。照 zones3d.js attachWzScooters 的挑法（位置雜湊＋weight、palette）重算每台的款式
        st = await pg.evaluate(r"""(async()=>{ const E=GAME.E, z=(typeof E3!=='undefined'&&E3.zone)||E.zone||{}, out=E.scene.getObjectByName('tz_scooters_glb');
          const ud=out?out.userData:{}; let root=null; try{ const c=await ASSETS.loadOne('bldg.wz_scooter'); root=c&&c.scene; }catch(e){}
          const V=[]; if(root){ root.updateMatrixWorld(true); root.traverse(o=>{ const m=/^scooter_(S\w+)$/.exec(o.name); if(!m||/_lod1$/.test(o.name)||!o.userData||!(o.userData.weight>0)) return; let pal=[]; try{ pal=JSON.parse(o.userData.palette||'[]'); }catch(e){} V.push({code:m[1],w:+o.userData.weight,pal}); }); }
          const W=V.reduce((a,b)=>a+b.w,0), hash=(x,z,k)=>{ const t=Math.sin(x*12.9898+z*78.233+k*37.719)*43758.5453; return t-Math.floor(t); };
          let scG=null; E.scene.traverse(o=>{ if(!scG&&o.isGroup&&o.children.length>20&&o.children.every(c=>c.userData&&c.userData.dyn)&&o!==out&&o.parent&&o.parent.getObjectByName&&o.parent.getObjectByName('tz_scooters_glb')) scG=o; });
          const items=[]; if(scG) for(const o of scG.children){ o.updateMatrixWorld(true); const p=new THREE.Vector3().setFromMatrixPosition(o.matrixWorld); let r=hash(p.x,p.z,1)*W, v=V[V.length-1]; for(const c of V){ if((r-=c.w)<=0){ v=c; break; } }
            const col=v&&v.pal.length?v.pal[Math.floor(hash(p.x,p.z,2)*v.pal.length)]:null; items.push({x:+p.x.toFixed(2),z:+p.z.toFixed(2),code:v?v.code:null,col}); }
          const side={W:items.filter(i=>i.x<0).sort((a,b)=>a.z-b.z),E:items.filter(i=>i.x>0).sort((a,b)=>a.z-b.z)}, res={};
          for(const k of ['W','E']){ const L=side[k]; let run=1,maxRun=L.length?1:0,runC=1,maxRunC=L.length?1:0,gaps=0; for(let i=1;i<L.length;i++){ if(L[i].code===L[i-1].code&&L[i].col===L[i-1].col) run++; else run=1; maxRun=Math.max(maxRun,run); if(L[i].code===L[i-1].code) runC++; else runC=1; maxRunC=Math.max(maxRunC,runC); if(L[i].z-L[i-1].z>1.4) gaps++; }
            res[k]={n:L.length,kinds:new Set(L.map(i=>i.code)).size,colors:new Set(L.map(i=>i.col)).size,maxSameCodeColor:maxRun,maxSameCode:maxRunC,gaps}; }
          return {tzScooters:z.tzScooters, tzBikes:z.tzBikes, tzParkGroups:z.tzParkGroups, tzParkGaps:z.tzParkGaps, tzScooterGLB:z.tzScooterGLB===undefined?'undefined':z.tzScooterGLB,
            glbModels:V.map(v=>v.code), scPick:ud.scPick||null, scColors:ud.scColors||null, groups:ud.scPerGroup?Object.keys(ud.scPerGroup).length:null, fallbackFound:!!scG, side:res}; })()""")
        R.note('[SCOOT %.2f] 統計：%s' % (h, J(st)))
        open(os.path.join(OUT, 'scoot_stats_%s.json' % str(h).replace('.', '')), 'w', encoding='utf-8').write(J(st))
        R.check('[SCOOT %.2f] 正式機車模型有掛上（tz_scooters_glb 存在、有網格）' % h, bool(res and res['glbGroup'] and res['glbMeshes'] > 0), J(res))
        b = await pg.screenshot(type='jpeg', quality=80); open(os.path.join(OUT, 'scoot_%s.jpg' % str(h).replace('.', '')), 'wb').write(b)


async def part_int(pg, cdp):
    """BB 22:45 B：汀州路三間室內第 1 版（f6947aff3；src/tz_shops3d.js、src/data/tz_shops_layout.js）。互動、台詞還沒接，不測。
    每間：街上走到「進＋店名」→ 按 → 進到 tz_<id>（記黑畫面秒數）→ 店裡走四個角落（沒有隱形牆）→ 拍照（門口往裡、另外兩個角度、一張放大）→ 8 秒幀率
    → 走到「離開＋店名」→ 按 → 回到汀州路、站在門口外面（layout.out）、站得住、搖桿推得動。HOURS 每個時間一組。
    舊存檔：【前置／捷徑】讀檔站在那間門口外面（layout.out＝改之前也是汀州路的同一個位置）→ 站得住、走得動。"""
    lay = await pg.evaluate("(()=>typeof TZ_SHOPS_LAYOUT==='undefined'?null:Object.fromEntries(Object.entries(TZ_SHOPS_LAYOUT).map(([k,v])=>[k,{zone:v.zone,name:v.name,w:v.w,d:v.d,spawn:v.spawn,exit:v.exit,out:v.out}])))()")
    if not R.check('[INT] 有 TZ_SHOPS_LAYOUT（室內配置）', bool(lay), ''): return
    only = [x for x in (os.environ.get('SHOPS') or ','.join(lay.keys())).split(',') if x in lay]
    for h in [float(x) for x in (os.environ.get('HOURS') or '14').split(',')]:
        hh = '%02d%02d' % (int(h), int(round((h % 1) * 60)))
        for sid in only:
            L_ = lay[sid]; tag = '[INT %s %s]' % (L_['name'], hh)
            await at(pg, cdp, 'tingzhou', h, L_['out']['x'], L_['out']['z'], '（%s 門口外面＝舊存檔站的位置）' % L_['name'])
            me = await pg.evaluate(ME); R.check('%s 舊存檔站在門口外面：站得住' % tag, me['zone'] == 'tingzhou' and me['free'] is not False, J(me))
            its = await pg.evaluate(ITS); it = next((i for i in its if i.get('tz') == sid), None)
            if not R.check('%s 街上有「進%s」' % (tag, L_['name']), bool(it) and it['label'].startswith('進'), J(it)): continue
            t0 = time.time(); await tap_it(pg, cdp, it, tag)
            ent = None
            for _ in range(80):
                me = await pg.evaluate(ME)
                if me['zone'] == L_['zone'] and not me['ent']: ent = round(time.time() - t0, 2); break
                await pg.wait_for_timeout(250)
            R.note('%s 進店：%s 秒後在 %s（%s）' % (tag, ent, me['zone'], J(me)))
            if not R.check('%s 走進去：區域 %s、站得住' % (tag, L_['zone']), me['zone'] == L_['zone'] and me['free'] is not False, J(me)): continue
            await pg.wait_for_timeout(2500)
            fm = await pg.evaluate("(()=>{ const z=GAME.E.zone||{}; return {formal:!!z.formal, glb:!!GAME.E.scene.getObjectByName(%s)}; })()" % J(L_['zone'] + '_glb'))
            R.note('%s 正式模型：%s' % (tag, J(fm)))
            # 店裡走四個角（r2：要四周 0.45 m 都站得住＝人過得去的點；r1 挑到桌子之間的窄縫，TEST_BUG）
            W_, D_ = L_['w'], L_['d']
            pts = await pg.evaluate("(a=>{ const N=GAME.E.nav, out=[]; for(const [cx,cz] of a){ let best=null; for(let r=0;r<=2.5&&!best;r+=0.25) for(let k=0;k<16&&!best;k++){ const x=cx+Math.cos(k/16*6.283)*r, z=cz+Math.sin(k/16*6.283)*r; if(N&&N.free(x,z)&&[0,1,2,3,4,5,6,7].every(j=>N.free(x+Math.cos(j/8*6.283)*0.45,z+Math.sin(j/8*6.283)*0.45))) best=[+x.toFixed(2),+z.toFixed(2)]; } out.push(best); } return out; })", [[-W_ / 2 + 0.8, D_ / 2 - 1.2], [W_ / 2 - 0.8, D_ / 2 - 1.2], [W_ / 2 - 0.8, -D_ / 2 + 1.5], [-W_ / 2 + 0.8, -D_ / 2 + 1.5]])
            miss = []
            for k, pt in enumerate(pts):
                if not pt: miss.append(['角落%d 附近沒有站得住的格子' % (k + 1)]); continue
                ok = await L.go_to(pg, cdp, R, pt[0], pt[1], 0.6, '%s 走到角落 %d (%.1f,%.1f)' % (tag, k + 1, pt[0], pt[1]), max_s=60)
                if not ok: miss.append(pt)
            R.check('%s 店裡走一圈（四個角落都走得到、沒有隱形牆）' % tag, not miss, J({'pts': pts, 'miss': miss}))
            await pg.evaluate("window.__TZ=[]")
            sp = L_['spawn']
            V = [('門口往裡', (sp['x'], 1.6, D_ / 2 - 0.3), (0.0, 1.3, -D_ / 2 + 1.0), 62),
                 ('後面往門口', (W_ / 2 - 0.6, 1.8, -D_ / 2 + 1.4), (-W_ / 4, 1.1, D_ / 2 - 1.0), 62),
                 ('左前往右後', (-W_ / 2 + 0.5, 1.7, D_ / 2 - 0.7), (W_ / 4, 1.0, -D_ / 4), 62),
                 ('放大（看桌椅、機器是不是同一個複製很多次）', (sp['x'], 1.5, 0.8), (W_ / 2 - 0.5, 0.8, -D_ / 4), 32),
                 ('放大（另一側）', (sp['x'], 1.5, 0.8), (-W_ / 2 + 0.5, 0.8, -D_ / 4), 32)]
            for lab, frm, at_, fov in V:
                u = await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at_), 'fov': fov, 'tw': 560, 'label': '%s %s %s' % (L_['name'], hh, lab), 'full': True})
                save(u, 'tz4int_%s_%s_%s.jpg' % (sid, hh, lab.split('（')[0]))
            b = await pg.screenshot(type='jpeg', quality=82); open(os.path.join(OUT, 'tz4int_%s_%s_game.jpg' % (sid, hh)), 'wb').write(b)
            fps = await pg.evaluate("new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<8000) requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })")
            R.note('%s 店內 8 秒幀率 %s fps（PC GPU，不是 iPhone）' % (tag, fps))
            # 出來
            its = await pg.evaluate(ITS); ex = next((i for i in its if i.get('to') == 'tingzhou'), None)
            if not R.check('%s 店裡有「%s」' % (tag, L_['exit']['label']), bool(ex), J(its)[:300]): continue
            t1 = time.time(); await tap_it(pg, cdp, ex, tag)
            for _ in range(80):
                me = await pg.evaluate(ME)
                if me['zone'] == 'tingzhou' and not me['ent']: break
                await pg.wait_for_timeout(250)
            d_ = ((me['x'] - L_['out']['x']) ** 2 + (me['z'] - L_['out']['z']) ** 2) ** 0.5
            R.check('%s 走出來：回到汀州路門口外面（離 layout.out %.2f m）、站得住' % (tag, d_), me['zone'] == 'tingzhou' and d_ < 1.5 and me['free'] is not False, J(me))
            p0 = (me['x'], me['z']); await L.joystick(pg, cdp, 0, -45, 1200); me2 = await pg.evaluate(ME)
            R.check('%s 出來以後搖桿推得動（沒有卡在門口）' % tag, ((me2['x'] - p0[0]) ** 2 + (me2['z'] - p0[1]) ** 2) ** 0.5 > 0.3, J(me2))
            R.check('%s walkFallbacks 0' % tag, me2['fb'] == 0, J(me2))


async def part_scoot3(pg, cdp):
    """BB 22:49：挑「外形差最多的三款」各框一台——照 scooter.glb 每一款節點的外框（長×寬×高）挑最小、中間、最大三款（體積排序），
    各找一台擺在路邊的（照 attachWzScooters 的挑法重算），從路中間拍一張近照、一張三款同框（獨立相機）；外框尺寸一起記"""
    h = float((os.environ.get('HOURS') or '14').split(',')[0])
    await at(pg, cdp, 'tingzhou', h, 0.0, 6.0, '（機車三款）'); await pg.wait_for_timeout(4000)
    info = await pg.evaluate(r"""(async()=>{ const E=GAME.E; let root=null; try{ const c=await ASSETS.loadOne('bldg.wz_scooter'); root=c&&c.scene; }catch(e){}
      if(!root) return null; root.updateMatrixWorld(true); const V=[]; root.traverse(o=>{ const m=/^scooter_(S\w+)$/.exec(o.name); if(!m||/_lod1$/.test(o.name)||!o.userData||!(o.userData.weight>0)) return; let pal=[]; try{ pal=JSON.parse(o.userData.palette||'[]'); }catch(e){}
        const b=new THREE.Box3().setFromObject(o), sz=b.getSize(new THREE.Vector3()); V.push({code:m[1],w:+o.userData.weight,pal,size:[+sz.x.toFixed(2),+sz.y.toFixed(2),+sz.z.toFixed(2)],vol:sz.x*sz.y*sz.z}); });
      const W=V.reduce((a,b)=>a+b.w,0), hash=(x,z,k)=>{ const t=Math.sin(x*12.9898+z*78.233+k*37.719)*43758.5453; return t-Math.floor(t); };
      let scG=null; E.scene.traverse(o=>{ if(!scG&&o.isGroup&&o.children.length>20&&o.children.every(c=>c.userData&&c.userData.dyn)&&o.parent&&o.parent.getObjectByName&&o.parent.getObjectByName('tz_scooters_glb')) scG=o; });
      const items=[]; if(scG) for(const o of scG.children){ o.updateMatrixWorld(true); const p=new THREE.Vector3().setFromMatrixPosition(o.matrixWorld); let r=hash(p.x,p.z,1)*W, v=V[V.length-1]; for(const c of V){ if((r-=c.w)<=0){ v=c; break; } } items.push({x:+p.x.toFixed(2),z:+p.z.toFixed(2),code:v.code}); }
      return {V:V.map(v=>({code:v.code,w:v.w,size:v.size,vol:+v.vol.toFixed(3),pal:v.pal.length})), items}; })()""")
    if not R.check('[SCOOT3] 讀到 scooter.glb 的款式和路邊每台的位置', bool(info and info['V'] and info['items']), J(info)[:300]): return
    used = {}
    for it in info['items']: used.setdefault(it['code'], []).append(it)
    V = sorted([v for v in info['V'] if v['code'] in used], key=lambda v: v['vol'])
    R.note('[SCOOT3] scooter.glb 款式（有擺在路邊的 %d／全部 %d 款）：%s' % (len(V), len(info['V']), J(info['V'])))
    pick = [V[0], V[len(V) // 2], V[-1]] if len(V) >= 3 else V
    if os.environ.get('CODES'):   # BB 22:53：指定款式（S1A,S1B,S2＝佔 67% 的三款）
        pick = [v for c in os.environ['CODES'].split(',') for v in V if v['code'] == c]
    await pg.evaluate("window.__TZ=[]")
    for v in pick:
        it = sorted(used[v['code']], key=lambda q: abs(q['z']))[0]; sx = 1 if it['x'] > 0 else -1
        u = await pg.evaluate(SNAP, {'from': [sx * 1.2, 1.3, it['z'] + 2.2], 'at': [it['x'], 0.6, it['z']], 'fov': 40, 'tw': 560, 'label': '款式 %s 外框 %s（體積排序第 %d／%d）' % (v['code'], v['size'], V.index(v) + 1, len(V)), 'full': True})
        save(u, 'scoot3_%s.jpg' % v['code'])
    u = await pg.evaluate(MONT, {'cols': 3, 'title': '汀州路機車：%s %s' % ('指定款式 ' + os.environ['CODES'] if os.environ.get('CODES') else '外形差最多的三款（體積最小、中間、最大）', os.environ.get('SHA', '')[:9])})
    save(u, 'scoot3_all%s.jpg' % ('_' + os.environ['CODES'].replace(',', '_') if os.environ.get('CODES') else '')); R.note('[SCOOT3] 三款：%s' % J([(v['code'], v['size']) for v in pick]))


SC4_JS = r"""(async a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; let root=null; try{ const cc=await ASSETS.loadOne('bldg.wz_scooter'); root=cc&&cc.scene; }catch(e){} if(!root) return {err:'no glb'};
  root.updateMatrixWorld(true); const node=code=>root.getObjectByName('scooter_'+code); const shots=[];
  const snap=(cam,label,boxes)=>{ cam.updateMatrixWorld(true); r.render(E.scene,cam); const k=document.createElement('canvas'); k.width=a.tw; k.height=Math.round(a.tw*c.height/c.width); const g=k.getContext('2d'); g.drawImage(c,0,0,k.width,k.height);
    g.lineWidth=3; for(const b of boxes||[]){ const pts=[]; for(const dx of [-1,1]) for(const dy of [0,1]) for(const dz of [-1,1]){ const v=new THREE.Vector3(b.x+dx*b.hx,b.y0+dy*b.h,b.z+dz*b.hz).project(cam); pts.push([(v.x+1)/2*k.width,(1-v.y)/2*k.height]); }
      const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]); g.strokeStyle=b.col||'#ff2020'; g.strokeRect(Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)); g.fillStyle=b.col||'#ff2020'; g.font='bold 16px sans-serif'; g.fillText(b.label,Math.min(...xs),Math.max(Math.min(...ys)-4,14)); }
    g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(0,0,k.width,20); g.fillStyle='#fff'; g.font='14px sans-serif'; g.fillText(label,5,15); shots.push(k.toDataURL('image/jpeg',0.88)); };
  const P=E.player&&E.player.obj; const pv=P?P.visible:true; if(P) P.visible=false;
  try{
    // (1) 【捷徑】三款並排在路中間（同樣的光線）：側面、斜前方各一張
    const tmp=new THREE.Group(); tmp.name='cc_lineup'; E.scene.add(tmp); const fix=new THREE.Matrix4().makeRotationY(-Math.PI/2);
    a.codes.forEach((code,i)=>{ const n=node(code); if(!n) return; const o=n.clone(true); o.position.set(0,0,0); o.rotation.set(0,0,0); o.updateMatrix(); const wrap=new THREE.Group(); wrap.add(o); wrap.position.set(-0.2,0,a.z0+i*1.6); wrap.rotation.y=0; tmp.add(wrap); });
    const c1=new THREE.PerspectiveCamera(32,c.width/c.height,0.1,200); c1.position.set(4.2,1.3,a.z0+1.6); c1.lookAt(0,0.6,a.z0+1.6); snap(c1,'【捷徑】三款並排（側面）：'+a.codes.join('、')+'（由左到右照 z）');
    const c2=new THREE.PerspectiveCamera(36,c.width/c.height,0.1,200); c2.position.set(3.2,1.6,a.z0-2.6); c2.lookAt(0,0.6,a.z0+1.6); snap(c2,'【捷徑】三款並排（斜前方）：'+a.codes.join('、'));
    E.scene.remove(tmp);
    // (2) 路邊實際停的：每一款一台（兩旁不是同一款），紅框框起來
    for(const t of a.targets){ const sx=t.x>0?1:-1, cam=new THREE.PerspectiveCamera(30,c.width/c.height,0.1,200); cam.position.set(sx*0.6,1.5,t.z+3.2); cam.lookAt(t.x,0.55,t.z);
      snap(cam,'路邊實際停的 '+t.code+'（紅框；第 '+t.rank+' 台／這一款共 '+t.n+' 台）',[{x:t.x,z:t.z,hx:0.45,hz:0.95,y0:0,h:1.2,label:t.code}]); }
  } finally { if(P) P.visible=pv; }
  return {shots}; })"""


async def part_scoot4(pg, cdp):
    """BB 22:53：S1A、S1B、S2（佔 67%）擺在一起分不分得出來。(1)【捷徑】三款模型並排在路中間（同光線，側面／斜前方）；(2) 路邊實際停的每款一台，紅框（挑兩旁都不是同款的那一台）"""
    codes = (os.environ.get('CODES') or 'S1A,S1B,S2').split(',')
    h = float((os.environ.get('HOURS') or '14').split(',')[0])
    await at(pg, cdp, 'tingzhou', h, 0.0, -14.0, '（機車三款並排）'); await pg.wait_for_timeout(4000)
    info = await pg.evaluate(r"""(async()=>{ const E=GAME.E; let root=null; try{ const c=await ASSETS.loadOne('bldg.wz_scooter'); root=c&&c.scene; }catch(e){} if(!root) return null; root.updateMatrixWorld(true);
      const V=[]; root.traverse(o=>{ const m=/^scooter_(S\w+)$/.exec(o.name); if(!m||/_lod1$/.test(o.name)||!o.userData||!(o.userData.weight>0)) return; V.push({code:m[1],w:+o.userData.weight}); });
      const W=V.reduce((a,b)=>a+b.w,0), hash=(x,z,k)=>{ const t=Math.sin(x*12.9898+z*78.233+k*37.719)*43758.5453; return t-Math.floor(t); };
      let scG=null; E.scene.traverse(o=>{ if(!scG&&o.isGroup&&o.children.length>20&&o.children.every(c=>c.userData&&c.userData.dyn)&&o.parent&&o.parent.getObjectByName&&o.parent.getObjectByName('tz_scooters_glb')) scG=o; });
      const items=[]; if(scG) for(const o of scG.children){ o.updateMatrixWorld(true); const p=new THREE.Vector3().setFromMatrixPosition(o.matrixWorld); let r=hash(p.x,p.z,1)*W, v=V[V.length-1]; for(const c of V){ if((r-=c.w)<=0){ v=c; break; } } items.push({x:+p.x.toFixed(2),z:+p.z.toFixed(2),code:v.code}); }
      return items; })()""")
    if not R.check('[SCOOT4] 讀到路邊每台的款式', bool(info), ''): return
    targets = []
    for code in codes:
        for side in ('W', 'E'):
            L_ = sorted([q for q in info if (q['x'] < 0) == (side == 'W')], key=lambda q: q['z'])
            cand = [L_[i] for i in range(len(L_)) if L_[i]['code'] == code and (i == 0 or L_[i - 1]['code'] != code) and (i == len(L_) - 1 or L_[i + 1]['code'] != code)]
            if cand:
                t = min(cand, key=lambda q: abs(q['z'])); n = sum(1 for q in info if q['code'] == code)
                targets.append(dict(t, rank=1, n=n)); break
    R.note('[SCOOT4] 框的那幾台：%s' % J(targets))
    res = await pg.evaluate(SC4_JS, {'codes': codes, 'targets': targets, 'z0': -16.0, 'tw': 900})
    if not R.check('[SCOOT4] 拍到', bool(res and res.get('shots')), J(res)[:200] if res else ''): return
    tag = '_'.join(codes)
    for i, u in enumerate(res['shots']): save(u, 'scoot4_%s_%d.jpg' % (tag, i + 1))
    R.note('[SCOOT4] 存了 %d 張（1～2＝並排【捷徑】，3 起＝路邊實際停的、紅框）' % len(res['shots']))


async def main():
    print('CC 汀州路 v1：PARTS %s；Playwright ≠ iPhone' % ','.join(PARTS), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for part, fn in (('GATE', part_gate), ('SHOPS', part_shops), ('WALK', part_walk), ('OLD', part_old), ('SHOTS', part_shots), ('FPS', part_fps), ('SCOOT', part_scoot), ('SCOOT3', part_scoot3), ('SCOOT4', part_scoot4), ('INT', part_int)):
            if part not in PARTS: continue
            try: await fn(pg, cdp)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
