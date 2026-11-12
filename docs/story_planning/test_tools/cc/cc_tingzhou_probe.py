"""CC（帳號 A）11-10：TINGZHOU_V1（汀州路商圈第 1 版，X321／X322；BB 20:45；開發分支 7a625da3c）。Playwright（PC GPU）≠ iPhone。
CC_02 清單 2026-11-12：1✓ 2✓（座位、期望數從 TZ_SHOPS_LAYOUT 讀＋BB 數字） 3✓（sit_all 每張都試、有人坐的跳過並記） 4✓ 5✓ 6✓ 7✓ 8✓ 9✓（拍照鏡頭先跑 fadeWalls、藏玩家） 10✓ 11✓ 12✓ 13✓（CC-C 11-12 只加 PARTS=INT 的 SEATS=1；其他部分是帳號 A 寫的，這次沒改）
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
ITS = "(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.2,to:i.exit?i.exit.to:null,look:i.look||null,tz:i.tzShop||null,tzd:i.tzsDoor||(i.tzLimaoDoor?'limao':null),gate:!!i.tzGate,seat:!!i.seat})))()"
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


async def joy_path(pg, cdp, tx, tz, near=0.6, max_s=40):
    """真的搖桿（CDP 觸控按 #joy）：每次問 E.pathTo 下一個中途點朝那裡推；近目標推輕一點。回傳 (到了沒, 秒數)"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        m_ = await pg.evaluate(ME); d_ = math.hypot(tx - m_['x'], tz - m_['z'])
        if d_ < near: return True, round(time.time() - t0, 1)
        ah = await pg.evaluate("(a=>{ const E=GAME.E,P=E.player,o=P.obj.position; const r=E.pathTo?E.pathTo(o.x,o.z,P.lv|0,a[0],a[1],P.lv|0):null; if(!r||!r.length) return null; const q=r[Math.min(1,r.length-1)]; return Array.isArray(q)?q:[q.x,q.z]; })", [tx, tz])
        gx, gz = ah or [tx, tz]; dd_ = math.hypot(gx - m_['x'], gz - m_['z']) or 0.01
        yaw = await pg.evaluate("GAME.E.cam.yaw"); fx_, fz_ = -math.sin(yaw), -math.cos(yaw); rx_, rz_ = math.cos(yaw), -math.sin(yaw)
        vx_, vz_ = (gx - m_['x']) / dd_, (gz - m_['z']) / dd_; sx_, sy_ = vx_ * rx_ + vz_ * rz_, -(vx_ * fx_ + vz_ * fz_); mm_ = math.hypot(sx_, sy_) or 1
        mag = 45 if d_ > 2 else max(18, 45 * d_ / 2); await L.joystick(pg, cdp, sx_ / mm_ * mag, sy_ / mm_ * mag, 400 if d_ > 2 else 250)
    return False, round(time.time() - t0, 1)


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
        if os.environ.get('SCOOTV') == '1':   # BB 00:07 機車第三版：四個機位＋飲料店（w_tea）前那一群近拍（從路上看西側機車格）
            tea = await pg.evaluate("(()=>{ const t=TINGZHOU_LAYOUT.shops.find(q=>q.id==='w_tea'); return t?{zc:(t.z0+t.z1)/2,side:t.side}:null; })()")
            V = [v for v in V if v[0] in ('概念圖機位', '路中間往南', '路中間往北', '水源市場前')]
            if tea:
                sx = -1 if tea['side'] == 'W' else 1
                V.append(('飲料店前機車近拍', (-sx * 0.5, 1.5, tea['zc'] + 4.5), (sx * 4.2, 0.6, tea['zc']), 50))
                V.append(('飲料店前機車正看', (-sx * 0.8, 1.4, tea['zc']), (sx * 4.2, 0.7, tea['zc']), 60))
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
          /* 第 3 版（11161c101）：區域自己指定款式、顏色（zone.tzScList，順序和 scG.children 一樣；Z3.attachWzScooters 照 code／pcol 用）→ 有就照它，沒有才照位置雜湊重算 */
          const SL=z.tzScList||null, items=[]; if(scG) scG.children.forEach((o,ix)=>{ o.updateMatrixWorld(true); const p=new THREE.Vector3().setFromMatrixPosition(o.matrixWorld); let r=hash(p.x,p.z,1)*W, v=V[V.length-1]; for(const c of V){ if((r-=c.w)<=0){ v=c; break; } }
            let code=v?v.code:null, col=v&&v.pal.length?v.pal[Math.floor(hash(p.x,p.z,2)*v.pal.length)]:null, src='hash'; if(SL&&SL[ix]&&SL[ix].code){ code=SL[ix].code; col=SL[ix].col||col; src='zone'; }
            items.push({x:+p.x.toFixed(2),z:+p.z.toFixed(2),code,col,src,gfam:(typeof TZ3!=='undefined'&&TZ3.colorFam&&col)?TZ3.colorFam(col):null}); });
          /* BB 23:07：色系（白／米／銀灰／黑與深藍／紅／藍／綠／黃橘）；相鄰同色系最長連續台數 */
          const fam=hex=>{ if(!hex) return null; const c=new THREE.Color(hex), h={}; c.getHSL(h, THREE.SRGBColorSpace);   /* r4（CC 00:2x）：Color 存的是線性值，不指定 sRGB 會整體偏暗、黑與深藍被高估（SC3 第一輪 45.8% 對遊戲 18.8%）*/ const H=h.h*360, S=h.s, Lm=h.l;
            if(Lm<0.22||(S>0.2&&H>=200&&H<=250&&Lm<0.33)) return '黑與深藍'; if(S<0.14) return Lm>0.8?'白':'銀灰'; if(S<0.42&&H>=20&&H<=60&&Lm>0.6) return '米';
            if(H<15||H>=340) return '紅'; if(H<65) return '黃橘'; if(H<170) return '綠'; return '藍'; };
          items.forEach(i=>{ i.fam=fam(i.col); });
          const side={W:items.filter(i=>i.x<0).sort((a,b)=>a.z-b.z),E:items.filter(i=>i.x>0).sort((a,b)=>a.z-b.z)}, res={};
          for(const k of ['W','E']){ const L=side[k]; let run=1,maxRun=L.length?1:0,runC=1,maxRunC=L.length?1:0,gaps=0; for(let i=1;i<L.length;i++){ if(L[i].code===L[i-1].code&&L[i].col===L[i-1].col) run++; else run=1; maxRun=Math.max(maxRun,run); if(L[i].code===L[i-1].code) runC++; else runC=1; maxRunC=Math.max(maxRunC,runC); if(L[i].z-L[i-1].z>1.4) gaps++; }
            let rf=1,maxF=L.length?1:0; for(let i=1;i<L.length;i++){ if(L[i].fam===L[i-1].fam&&L[i].z-L[i-1].z<=1.4) rf++; else rf=1; maxF=Math.max(maxF,rf); }
            const famCount={}; L.forEach(i=>{ famCount[i.fam]=(famCount[i.fam]||0)+1; });
            res[k]={n:L.length,kinds:new Set(L.map(i=>i.code)).size,colors:new Set(L.map(i=>i.col)).size,maxSameCodeColor:maxRun,maxSameCode:maxRunC,maxSameFamily:maxF,families:famCount,gaps}; }
          /* BB 00:07（機車第三版）：全街合計——台數、黑與深藍比例、S1A＋S1B＋S2 合計比例、相鄰同色系最長（兩側取大）、同車尾（同款）連續最長 */
          { const A=side.W.concat(side.E), n=A.length; res.all={n, darkPct:n?+(100*A.filter(i=>i.fam==='黑與深藍').length/n).toFixed(1):null, s12Pct:n?+(100*A.filter(i=>/^(S1A|S1B|S2)$/.test(i.code||'')).length/n).toFixed(1):null,
              maxSameFamily:Math.max(res.W.maxSameFamily,res.E.maxSameFamily), maxSameCode:Math.max(res.W.maxSameCode,res.E.maxSameCode), byCode:A.reduce((o,i)=>(o[i.code]=(o[i.code]||0)+1,o),{}),
              accessories:{機車罩_S1A_C:A.filter(i=>i.code==='S1A_C').length, 外送箱_S1B_D:A.filter(i=>i.code==='S1B_D').length, 安全帽_S5_H:A.filter(i=>i.code==='S5_H').length},
              src:A.reduce((o,i)=>(o[i.src]=(o[i.src]||0)+1,o),{}), gameFamDarkPct:n?+(100*A.filter(i=>i.gfam==='dark').length/n).toFixed(1):null,
              adjSameFamPairs:['W','E'].reduce((t,k)=>{ const Ls=side[k]; let c=0; for(let i=1;i<Ls.length;i++) if(Ls[i].fam===Ls[i-1].fam&&Ls[i].z-Ls[i-1].z<=1.4) c++; return t+c; },0),
              tailA3:['W','E'].reduce((t,k)=>{ const Ls=side[k], ta=c=>/^(S1A|S1B|S2)$/.test(c||''); let run=0,mx=0; for(let i=0;i<Ls.length;i++){ run=(ta(Ls[i].code)&&(i===0||Ls[i].z-Ls[i-1].z<=1.4))?run+1:(ta(Ls[i].code)?1:0); mx=Math.max(mx,run); } return Math.max(t,mx); },0)}; res.gameStat=z.tzScStat||null; }
          const TEA=(typeof TINGZHOU_LAYOUT!=='undefined'?TINGZHOU_LAYOUT.shops.find(q=>q.id==='w_tea'):null);
          res.drinkShop=TEA?side.W.filter(i=>i.z>TEA.z0-3&&i.z<TEA.z1+3).map(i=>({z:i.z,code:i.code,col:i.col,fam:i.fam})):null;   /* 飲料店（手搖飲 w_tea）前那一群 */
          return {tzScooters:z.tzScooters, tzBikes:z.tzBikes, tzParkGroups:z.tzParkGroups, tzParkGaps:z.tzParkGaps, tzScooterGLB:z.tzScooterGLB===undefined?'undefined':z.tzScooterGLB,
            glbModels:V.map(v=>v.code), scPick:ud.scPick||null, scColors:ud.scColors||null, groups:ud.scPerGroup?Object.keys(ud.scPerGroup).length:null, fallbackFound:!!scG, side:res}; })()""")
        R.note('[SCOOT %.2f] 統計：%s' % (h, J(st)))
        if st and st.get('side') and st['side'].get('all'): R.note('[SCOOT %.2f] 全街（CC 自己量；款式來源 %s）：%d 台；黑與深藍 %s%%（遊戲自己的色系算法 %s%%）；S1A＋S1B＋S2 %s%%；相鄰同色系 %s 對、最長 %s 台；同款連續最長 %s 台；同車尾 A（S1A／S1B／S2）連續最長 %s 台；配件 %s；各款 %s；遊戲自己記的 tzScStat %s' % (h, J(st['side']['all']['src']), st['side']['all']['n'], st['side']['all']['darkPct'], st['side']['all']['gameFamDarkPct'], st['side']['all']['s12Pct'], st['side']['all']['adjSameFamPairs'], st['side']['all']['maxSameFamily'], st['side']['all']['maxSameCode'], st['side']['all']['tailA3'], J(st['side']['all']['accessories']), J(st['side']['all']['byCode']), J(st['side'].get('gameStat'))))
        open(os.path.join(OUT, 'scoot_stats_%s.json' % str(h).replace('.', '')), 'w', encoding='utf-8').write(J(st))
        R.check('[SCOOT %.2f] 正式機車模型有掛上（tz_scooters_glb 存在、有網格）' % h, bool(res and res['glbGroup'] and res['glbMeshes'] > 0), J(res))
        b = await pg.screenshot(type='jpeg', quality=80); open(os.path.join(OUT, 'scoot_%s.jpg' % str(h).replace('.', '')), 'wb').write(b)


async def part_int(pg, cdp):
    """BB 22:45 B：汀州路三間室內第 1 版（f6947aff3；src/tz_shops3d.js、src/data/tz_shops_layout.js）。互動、台詞還沒接，不測。
    每間：街上走到「進＋店名」→ 按 → 進到 tz_<id>（記黑畫面秒數）→ 店裡走四個角落（沒有隱形牆）→ 拍照（門口往裡、另外兩個角度、一張放大）→ 8 秒幀率
    → 走到「離開＋店名」→ 按 → 回到汀州路、站在門口外面（layout.out）、站得住、搖桿推得動。HOURS 每個時間一組。
    舊存檔：【前置／捷徑】讀檔站在那間門口外面（layout.out＝改之前也是汀州路的同一個位置）→ 站得住、走得動。"""
    lay = await pg.evaluate("(()=>typeof TZ_SHOPS_LAYOUT==='undefined'?null:Object.fromEntries(Object.entries(TZ_SHOPS_LAYOUT).map(([k,v])=>[k,{zone:v.zone,name:v.name,w:v.w,d:v.d,spawn:v.spawn,exit:v.exit,out:v.out,outZone:v.outZone||'tingzhou',gg:v.gg||null,door:v.door||null}])))()")
    if not R.check('[INT] 有 TZ_SHOPS_LAYOUT（室內配置）', bool(lay), ''): return
    only = [x for x in (os.environ.get('SHOPS') or ','.join(lay.keys())).split(',') if x in lay]
    for h in [float(x) for x in (os.environ.get('HOURS') or '14').split(',')]:
        hh = '%02d%02d' % (int(h), int(round((h % 1) * 60)))
        for sid in only:
            L_ = lay[sid]; tag = '[INT %s %s]' % (L_['name'], hh); OZ = L_['outZone']
            await at(pg, cdp, OZ, h, L_['out']['x'], L_['out']['z'], '（%s 門口外面＝舊存檔站的位置）' % L_['name'])
            me = await pg.evaluate(ME); R.check('%s 舊存檔站在門口外面：站得住' % tag, me['zone'] == OZ and me['free'] is not False, J(me))
            its = await pg.evaluate(ITS); it = next((i for i in its if i.get('tz') == sid or i.get('tzd') == sid), None)
            if not R.check('%s 街上有「進%s」' % (tag, L_['name']), bool(it) and it['label'].startswith('進'), J(it)): continue
            if os.environ.get('EXT') == '1': await ext_shots(pg, L_, it, sid, hh, tag)
            t0 = time.time(); await tap_it(pg, cdp, it, tag)
            ent = None
            for _ in range(80):
                me = await pg.evaluate(ME)
                if me['zone'] == L_['zone'] and not me['ent']: ent = round(time.time() - t0, 2); break
                await pg.wait_for_timeout(250)
            R.note('%s 進店：%s 秒後在 %s（%s）' % (tag, ent, me['zone'], J(me)))
            if not R.check('%s 走進去：區域 %s、站得住' % (tag, L_['zone']), me['zone'] == L_['zone'] and me['free'] is not False, J(me)): continue
            if os.environ.get('CAMDIAG2') == '1':   # BB 02:33 ①：進門 0.5、2 秒；掛畫前站 2 秒；搖桿繞房間（前半）四點；每張記玩家、鏡頭、鏡頭在不在房間裡、畫面亮度平均與變化（變化低＝一片米色）
                # r3（BB 03:14）：拿掉「鏡頭在房間裡」（室內本來就是鏡頭在牆外、牆淡出的剖面視角）；單色＝畫面中央 60%（四邊各去 20%，扣掉 HUD）亮度標準差 <20；
                # 看得到人＝玩家模型螢幕投影附近 100×160 px（CSS 像素）的標準差 ≥15；中央大面積全黑（<12）／全白（>245）超過 15% 標★（BB 03:14）
                CJ2 = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement, cam=E.camera, P=E.player.obj.position; r.render(E.scene,cam);
                  const st=(sx,sy,sw,sh,ow,oh)=>{ const k=document.createElement('canvas'); k.width=ow; k.height=oh; const g=k.getContext('2d'); g.drawImage(c,sx,sy,sw,sh,0,0,ow,oh); const d=g.getImageData(0,0,ow,oh).data; let s=0,s2=0,n=0,bk=0,wh=0,R=0,G=0,B=0;
                    for(let i=0;i<d.length;i+=4){ const L=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; s+=L; s2+=L*L; n++; R+=d[i]; G+=d[i+1]; B+=d[i+2]; if(L<12) bk++; if(L>245) wh++; } const m=s/n; return {m:+m.toFixed(1), sd:+Math.sqrt(Math.max(0,s2/n-m*m)).toFixed(1), black:+(bk/n).toFixed(3), white:+(wh/n).toFixed(3), rgb:[Math.round(R/n),Math.round(G/n),Math.round(B/n)]}; };
                  const W=c.width, H=c.height, sc=W/(c.clientWidth||W); const mid=st(W*0.2,H*0.2,W*0.6,H*0.6,120,68), top=st(0,0,W,H*0.2,120,20);   /* top：畫面最上面 20%（BB 03:45：藏天花板不能弄出破洞＝上方不該看到天空或黑色） */
                  const PO=E.player.obj; const hp=new THREE.Box3().setFromObject(PO).getCenter(new THREE.Vector3()); const ndc=hp.clone().project(cam); const onScreen=PO.visible&&Math.abs(ndc.x)<=1&&Math.abs(ndc.y)<=1&&ndc.z<1;
                  const px=(ndc.x+1)/2*W, py=(1-ndc.y)/2*H, bw=100*sc, bh=160*sc; const pl=onScreen?st(Math.max(0,px-bw/2),Math.max(0,py-bh/2),Math.min(bw,W),Math.min(bh,H),50,80):null;
                  return {onScreen, ndc:[+ndc.x.toFixed(2),+ndc.y.toFixed(2)], player:[+P.x.toFixed(2),+P.z.toFixed(2)], cam:[+cam.position.x.toFixed(2),+cam.position.y.toFixed(2),+cam.position.z.toFixed(2)], yaw:+E.cam.yaw.toFixed(3), dist:E.cam.dist!=null?+(+E.cam.dist).toFixed(2):null, mid, top, near:pl}; })"""
                async def cshot(lab):
                    cj = await pg.evaluate(CJ2, {'w': L_['w'], 'd': L_['d']})
                    await pg.screenshot(path=os.path.join(OUT, 'cam2_%s_%s_%s.jpg' % (sid, hh, lab)), type='jpeg', quality=80)
                    flat = cj['mid']['sd'] < 20; seen = bool(cj['near']) and cj['near']['sd'] >= 15
                    star = cj['mid']['black'] > 0.15 or cj['mid']['white'] > 0.15
                    tb = cj['top']; sky = tb['rgb'][2] > tb['rgb'][0] + 25 and tb['rgb'][2] > tb['rgb'][1] + 8 and tb['m'] > 110
                    if tb['black'] > 0.3 or sky: R.note('%s 鏡頭 %s ★畫面上方 20%%：%s（全黑 %.0f%%、平均色 %s）' % (tag, lab, '像天空' if sky else '大面積黑', tb['black'] * 100, tb['rgb']))
                    R.check('%s 鏡頭 %s：畫面上方沒有天空或大面積黑色（天花板沒有破洞）' % (tag, lab), not sky and tb['black'] <= 0.3, J(tb))
                    R.note('%s 鏡頭 %s：%s%s%s' % (tag, lab, J(cj), '  ★中央一片單色' if flat else '', '  ★中央大面積全黑／全白' if star else ''))
                    R.check('%s 鏡頭 %s：畫面中央 60%% 不是一片單色（標準差 %.1f ≥20）' % (tag, lab, cj['mid']['sd']), not flat, J(cj['mid']))
                    R.check('%s 鏡頭 %s：看得到人（玩家投影附近 100×160 px 標準差 %s ≥15）' % (tag, lab, cj['near'] and cj['near']['sd']), seen, J({'onScreen': cj['onScreen'], 'ndc': cj['ndc'], 'near': cj['near']}))
                await pg.wait_for_timeout(500); await cshot('進門0.5秒'); await pg.wait_for_timeout(1500); await cshot('進門2秒')
                sc = next((i for i in await pg.evaluate(ITS) if '掛畫' in (i['label'] or '')), None)
                if sc:
                    ok_, t_ = await joy_path(pg, cdp, sc['x'], sc['z']); R.check('%s 搖桿走到「%s」（%s 秒）' % (tag, sc['label'], t_), ok_, ''); await pg.wait_for_timeout(2000); await cshot('掛畫前站2秒')
                sd_ = next((i for i in await pg.evaluate(ITS) if '書房' in (i['label'] or '')), None)
                if sd_:   # BB 03:45 LM_cam3：書房門前站 2 秒
                    ok_, t_ = await joy_path(pg, cdp, sd_['x'], sd_['z'] + 0.5); R.check('%s 搖桿走到「%s」前（%s 秒）' % (tag, sd_['label'], t_), ok_, ''); await pg.wait_for_timeout(2000); await cshot('書房門前站2秒')
                PTS = [(L_['w'] / 2 - 0.9, L_['d'] / 2 - 1.3), (L_['w'] / 2 - 0.9, -0.3), (-L_['w'] / 2 + 0.9, -0.3), (-L_['w'] / 2 + 0.9, L_['d'] / 2 - 1.3)]
                if os.environ.get('CAMPTS'): PTS = [tuple(float(v) for v in q.split(',')) for q in os.environ['CAMPTS'].replace('/', ';').split(';') if q]   # ANTAI_cam：店後半的點
                if os.environ.get('CAMFAR') == '1':   # 回歸：最裡面（z 最小）站得住、找得到路的點
                    fp = await pg.evaluate("(a=>{ const E=GAME.E,P=E.player,o=P.obj.position; for(let z=-a.d/2+0.4; z<a.d/2; z+=0.25){ let best=null; for(let x=-a.w/2+0.4; x<a.w/2; x+=0.25){ if(!E.canStand(x,z,0.3)) continue; const r=E.pathTo?E.pathTo(o.x,o.z,P.lv|0,x,z,P.lv|0):null; if(r&&r.length&&(best==null||Math.abs(x)<Math.abs(best[0]))) best=[+x.toFixed(2),+z.toFixed(2)]; } if(best) return best; } return null; })", {'w': L_['w'], 'd': L_['d']})
                    R.note('%s 最裡面站得住、走得到的點：%s' % (tag, fp)); PTS = [tuple(fp)] if fp else []
                for k_, (px, pz) in enumerate(PTS):
                    ok_, t_ = await joy_path(pg, cdp, px, pz); R.check('%s 搖桿繞房間第 %d 點 (%.1f,%.1f)（%s 秒）' % (tag, k_ + 1, px, pz, t_), ok_, ''); await pg.wait_for_timeout(1500); await cshot('繞一圈%d' % (k_ + 1))
            if os.environ.get('CAMDIAG') == '1':   # BB 01:47：禮貌生財進門的遊戲鏡頭一片米色——進門 0.5 秒、2 秒各截一張，再轉 90° 一張（【捷徑】直接設 E.cam.yaw），記鏡頭位置
                CAMJ = "(()=>{ const E=GAME.E, c=E.camera, P=E.player.obj.position; return {cam:[+c.position.x.toFixed(2),+c.position.y.toFixed(2),+c.position.z.toFixed(2)], yaw:+E.cam.yaw.toFixed(3), pitch:E.cam.pitch!=null?+E.cam.pitch.toFixed(3):null, dist:E.cam.dist!=null?+(+E.cam.dist).toFixed(2):null, distT:E.cam.distTarget!=null?+(+E.cam.distTarget).toFixed(2):null, player:[+P.x.toFixed(2),+P.z.toFixed(2)], room:[%s,%s]}; })()" % (L_['w'], L_['d'])
                for k, wt in ((0, 500), (1, 1500)):
                    await pg.wait_for_timeout(wt); cj = await pg.evaluate(CAMJ)
                    await pg.screenshot(path=os.path.join(OUT, 'camdiag_%s_%s_%s.jpg' % (sid, hh, ('0.5s', '2s')[k])), type='jpeg', quality=80)
                    R.note('%s 進門 %s 遊戲鏡頭：%s' % (tag, ('0.5 秒', '2 秒')[k], J(cj)))
                await pg.evaluate("(()=>{ GAME.E.cam.yaw+=Math.PI/2; })()"); await pg.wait_for_timeout(1500); cj = await pg.evaluate(CAMJ)
                await pg.screenshot(path=os.path.join(OUT, 'camdiag_%s_%s_yaw90.jpg' % (sid, hh)), type='jpeg', quality=80)
                R.note('%s 【捷徑】鏡頭轉 90° 以後：%s' % (tag, J(cj)))
                await pg.evaluate("(()=>{ GAME.E.cam.yaw-=Math.PI/2; })()")
            await pg.wait_for_timeout(2500)
            fm = await pg.evaluate("(()=>{ const z=GAME.E.zone||{}; return {formal:!!z.formal, glb:!!GAME.E.scene.getObjectByName(%s)}; })()" % J(L_['zone'] + '_glb'))
            R.note('%s 正式模型：%s' % (tag, J(fm)))
            # 店裡走四個角
            W_, D_ = L_['w'], L_['d']
            # r3（BB 23:07）：角落＝「離牆和家具最近、人站得住、從出生點走得到的格子」——從出生點在導航格上擴散（四周 0.35 m 都 free 才算人站得住），每個象限取離房間角最近的那一格；
            #   櫃台後面的店員區（z < counter.z0、x 在 counter 範圍）不列（印得好右後角）
            # r4（CC 23:5x，GG3_int_new 第一輪：r3 的「四周 0.35 m 都 free」在 0.5 m 導航格上只剩門口那一排連得起來，四角全挑到 z≈3 的門口那一排＝TEST_BUG）：
            #   改用遊戲自己的 E.canStand(x,z,0.3)（玩家半徑 0.33、D35 的 clearMask 同一套）、步長 0.25；印出擴散到的範圍（格數、x／z 範圍）讓人看得出有沒有走進店裡
            bfs = await pg.evaluate("(a=>{ const E=GAME.E, N=E.nav, L=(typeof TZ_SHOPS_LAYOUT!=='undefined'?TZ_SHOPS_LAYOUT[a.sid]:null)||{}, C=L.counter, st=0.25;"
                                   " const ok=(x,z)=>E.canStand?E.canStand(x,z,0.3):(N&&N.free(x,z)); const staff=(x,z)=>C&&z<C.z0&&x>C.x0-0.3&&x<C.x1+0.3;"
                                   " const k=(x,z)=>Math.round(x/st)+','+Math.round(z/st); const seen=new Set(), Q=[[a.sx,a.sz]], R=[]; seen.add(k(a.sx,a.sz));"
                                   " while(Q.length&&R.length<8000){ const [x,z]=Q.shift(); R.push([x,z]); for(const [dx,dz] of [[st,0],[-st,0],[0,st],[0,-st]]){ const nx=+(x+dx).toFixed(2), nz=+(z+dz).toFixed(2), kk=k(nx,nz); if(seen.has(kk)) continue; seen.add(kk); if(ok(nx,nz)&&!staff(nx,nz)) Q.push([nx,nz]); } }"
                                   " const xs=R.map(p=>p[0]), zs=R.map(p=>p[1]);"
                                   " const EXl=L.exit||{x:a.sx,z:a.sz}; let far=null,fd=-1; for(const [x,z] of R){ const d=Math.hypot(x-EXl.x,z-EXl.z); if(d>fd){ fd=d; far=[x,z]; } } return {far, farD:+fd.toFixed(2), n:R.length, x:[Math.min(...xs),Math.max(...xs)], z:[Math.min(...zs),Math.max(...zs)], canStand:!!E.canStand, pts:a.corners.map(([cx,cz])=>{ let b=null,bd=1e9; for(const [x,z] of R){ const d=Math.hypot(x-cx,z-cz); if(d<bd){ bd=d; b=[x,z]; } } return b; })}; })",
                                   {'sid': sid, 'sx': L_['spawn']['x'], 'sz': L_['spawn']['z'], 'corners': [[-W_ / 2, D_ / 2], [W_ / 2, D_ / 2], [W_ / 2, -D_ / 2], [-W_ / 2, -D_ / 2]]})
            pts = bfs['pts']
            R.note('%s 角落挑點：從出生點擴散 %d 點、x %s、z %s（房間 %.1f×%.1f；canStand %s）→ %s' % (tag, bfs['n'], bfs['x'], bfs['z'], W_, D_, bfs['canStand'], J(pts)))
            R.check('%s 挑點有走進店裡（擴散範圍 z 跨過房間一半以上）' % tag, bfs['z'][1] - bfs['z'][0] > D_ / 2, J(bfs['z']))
            miss = []
            JOY = os.environ.get('JOYWALK') == '1'   # BB 01:56：純搖桿一輪（照 E.pathTo 中途點推、近目標推輕）
            async def walk_pt(tx, tz, lab):
                if not JOY: return await L.go_to(pg, cdp, R, tx, tz, 0.6, lab, max_s=60)
                t0_ = time.time(); last_ = (time.time(), None); stuck_ = 0
                while time.time() - t0_ < 60:
                    m_ = await pg.evaluate(ME); d_ = math.hypot(tx - m_['x'], tz - m_['z'])
                    if d_ < 0.6: R.note('%s 搖桿到了（%.0f 秒、卡住側推 %d 次）' % (lab, time.time() - t0_, stuck_)); return True
                    if last_[1] is None or math.hypot(m_['x'] - last_[1][0], m_['z'] - last_[1][1]) > 0.25: last_ = (time.time(), (m_['x'], m_['z']))
                    elif time.time() - last_[0] > 4: stuck_ += 1; await L.joystick(pg, cdp, 35 * (1 if stuck_ % 2 else -1), 0, 500); last_ = (time.time(), None); continue
                    ah = await pg.evaluate("(a=>{ const E=GAME.E,P=E.player,o=P.obj.position; const r=E.pathTo?E.pathTo(o.x,o.z,P.lv|0,a[0],a[1],P.lv|0):null; if(!r||!r.length) return null; let ax=o.x,az=o.z,acc=0; for(const q0 of r){ const q=Array.isArray(q0)?q0:[q0.x,q0.z]; const Lq=Math.hypot(q[0]-ax,q[1]-az); if(acc+Lq>=1.2){ const f=(1.2-acc)/Math.max(Lq,1e-6); return [ax+(q[0]-ax)*f,az+(q[1]-az)*f]; } acc+=Lq; ax=q[0]; az=q[1]; } return [ax,az]; })", [tx, tz])
                    gx, gz = (ah or [tx, tz]); dd_ = math.hypot(gx - m_['x'], gz - m_['z']) or 0.01
                    yaw = await pg.evaluate("GAME.E.cam.yaw"); fx_, fz_ = -math.sin(yaw), -math.cos(yaw); rx_, rz_ = math.cos(yaw), -math.sin(yaw)
                    vx_, vz_ = (gx - m_['x']) / dd_, (gz - m_['z']) / dd_; sx_, sy_ = vx_ * rx_ + vz_ * rz_, -(vx_ * fx_ + vz_ * fz_); mm_ = math.hypot(sx_, sy_) or 1
                    mag = 45 if d_ > 2.0 else max(16, 45 * d_ / 2.0)
                    await L.joystick(pg, cdp, sx_ / mm_ * mag, sy_ / mm_ * mag, 450 if d_ > 2.0 else 250)
                m_ = await pg.evaluate(ME); R.note('%s 搖桿 60 秒沒到：停在 (%.2f,%.2f)' % (lab, m_['x'], m_['z'])); return False
            for k, pt in enumerate(pts):
                if not pt: miss.append(['角落%d 附近沒有站得住的格子' % (k + 1)]); continue
                ok = await walk_pt(pt[0], pt[1], '%s 走到角落 %d (%.1f,%.1f)%s' % (tag, k + 1, pt[0], pt[1], '（搖桿）' if JOY else ''))
                if not ok: miss.append(pt)
            for ep in [x for x in (os.environ.get('EXTRA_PTS') or '').split(';') if x]:   # BB 01:56 ②：印得好電腦桌東邊 (0.6,−4.0) 這種指定點
                ex_x, ex_z = [float(v) for v in ep.split(',')]
                okx = await walk_pt(ex_x, ex_z, '%s 走到指定點 (%.2f,%.2f)' % (tag, ex_x, ex_z))
                R.check('%s 走到指定點 (%.2f,%.2f)（之後要走得回出口）' % (tag, ex_x, ex_z), okx, '')
            if os.environ.get('FARTHEST') == '1' and bfs.get('far'):   # BB 01:56 ③：走到離門最遠的站得住的點，再走回出口（回歸）
                okf = await walk_pt(bfs['far'][0], bfs['far'][1], '%s 走到離出口最遠的站得住點 %s（%.1f m）' % (tag, bfs['far'], bfs['farD']))
                R.check('%s 走到離出口最遠的站得住點 %s' % (tag, bfs['far']), okf, '')
            R.check('%s 店裡走一圈（四個角落都走得到、沒有隱形牆）' % tag, not miss, J({'pts': pts, 'miss': miss}))
            if os.environ.get('SEATS') == '1':   # CC-C 11-12（BB-C 03:56 ⑥ TINGZHOU-SHOPS5：「5 桌 16 座都坐得下、不卡」）：每張位子照玩家點椅子走過去、按坐下、起身、推得動（D.sit_all，同 cc_d141_lib）
                nlay = await pg.evaluate("(s=>{ const L=TZ_SHOPS_LAYOUT[s]; return {seats:(L.seats||[]).length, tables:(L.tables||[]).length}; })", sid)
                its_s = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>i.seat&&!i.hidden).length)()")
                R.note('%s 配置 TZ_SHOPS_LAYOUT.%s：%s；店裡能坐的互動點 %d 個' % (tag, sid, J(nlay), its_s))
                exp = {'yuehaochi': (16, 5)}.get(sid)   # 期望：LAWWW2 tz_shops_layout.js note「16 個座位」、BB-C 03:56「5 桌 16 座」
                if exp: R.check('%s 配置是 %d 座、%d 桌（BB-C 03:56）；店裡能坐的互動點也是 %d 個' % (tag, exp[0], exp[1], exp[0]), nlay['seats'] == exp[0] and nlay['tables'] == exp[1] and its_s == exp[0], J([nlay, its_s]))
                rs = await D.sit_all(pg, cdp, tag, 'tz_%s_%s_seat' % (sid, hh))
                bad = [x for x in rs if isinstance(x, list) and len(x) > 1 and x[1] not in ('ok', 'occupied')]
                occ = [x for x in rs if isinstance(x, list) and len(x) > 1 and x[1] == 'occupied']
                R.note('%s 坐位結果：%s' % (tag, J(rs)))
                R.check('%s 每一張都坐得下（有人坐的跳過 %d 張；坐不下 %d 張）' % (tag, len(occ), len(bad)), not bad and len(occ) <= len(rs) // 2, J(bad[:4]))
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
            if os.environ.get('CLOSE') == '1':   # BB 00:07（11161c101）：洗樂兌幣機、洗衣精販賣機和上面的字；印得好客用電腦桌、裁紙機、膠裝機和字牌；牆面（座標照 tz_shops_layout.js）
                # r2（CC 00:4x）：座標照 tools/blender/env_second/tz_shops_interior.py——印得好 copiers.list 反過來由 z0 排（膠裝機 zc −1.11、裁紙機 zc −0.13，字牌在機身正面 x −2.49、y 0.48～0.67）；
                #   洗樂兌幣機 x −3.0～−2.7、z 1.9～2.24、字牌 y 1.53～1.69（x −2.69），洗衣精販賣機 z 2.30～2.66，牆上字牌 x −2.99、y 1.95～2.08
                CL = {'xile': [('兌幣機和洗衣精販賣機', (-1.0, 1.4, 2.28), (-2.85, 1.1, 2.28), 46), ('兌幣機的字', (-1.6, 1.62, 2.07), (-2.69, 1.61, 2.07), 22),
                               ('洗衣精販賣機的字', (-1.5, 1.7, 2.48), (-2.6, 1.6, 2.48), 26), ('牆上的字牌', (-1.4, 1.95, 2.07), (-2.99, 2.01, 2.07), 22),
                               ('左牆', (1.8, 1.6, 3.6), (-3.0, 1.7, -1.5), 62), ('右牆', (-1.8, 1.6, 3.6), (3.0, 1.7, -1.5), 62), ('後牆', (0.3, 1.6, 2.0), (0.3, 1.7, -4.5), 62)],
                      'antai': [('左邊貨架（藥盒藥瓶口罩）', (0.0, 1.5, 1.6), (-2.05, 1.1, 0.4), 34), ('右邊貨架', (0.0, 1.5, 1.6), (2.05, 1.1, 0.4), 34), ('左牆藥櫃', (-2.2, 1.6, 2.8), (-4.3, 1.3, 0.5), 38),
                                ('貨架放大', (-0.9, 1.3, 0.6), (-1.6, 1.2, 0.2), 22), ('價目卡放大', (-0.9, 1.0, 0.6), (-1.55, 0.95, 0.4), 16), ('櫃台後藥品櫃', (0.0, 1.6, -1.2), (0.0, 1.4, -4.8), 44)],
                      'xianguo_fix': [('補的箱子 中間縫', (1.6, 1.5, 0.4), (0.25, 0.6, -1.2), 40), ('補的箱子 後面走道', (0.8, 1.5, -0.2), (-0.6, 0.6, -1.9), 40)],
                      'yindehao_fix': [('補的紙箱 角落', (0.0, 1.5, -2.2), (1.05, 0.6, -3.95), 40)],
                      'xianguo': [('左牆木架（水果）', (0.0, 1.5, 2.6), (-3.2, 0.9, 0.7), 40), ('掛著的香蕉', (-0.8, 1.6, 3.6), (-3.0, 1.5, 3.9), 30), ('冷藏櫃', (0.6, 1.5, 2.4), (3.5, 1.2, 1.6), 38),
                                  ('箱子籃子', (0.5, 1.4, 0.8), (0.0, 0.5, -1.0), 40), ('價目卡放大', (-1.0, 1.1, 1.6), (-2.6, 0.9, 1.0), 18), ('後面紙箱堆', (0.3, 1.6, 0.0), (0.3, 1.0, -4.5), 50)],
                      'yindehao': [('客用電腦桌', (0.2, 1.55, -2.5), (0.2, 0.85, -4.65), 48), ('電腦桌上方的字', (0.2, 1.6, -3.2), (0.2, 1.85, -4.95), 26),
                                   ('裁紙機', (-0.9, 1.35, -0.13), (-2.9, 0.85, -0.13), 38), ('裁紙機的字牌', (-1.4, 0.7, -0.13), (-2.49, 0.57, -0.13), 22),
                                   ('膠裝機', (-0.9, 1.35, -1.11), (-2.9, 0.85, -1.11), 38), ('膠裝機的字牌', (-1.4, 0.7, -1.11), (-2.49, 0.57, -1.11), 22),
                                   ('左牆', (1.0, 1.6, 4.0), (-3.2, 1.7, -2.0), 62), ('右牆', (-1.0, 1.6, 4.0), (3.2, 1.7, -2.0), 62), ('後牆', (0.0, 1.6, 2.0), (0.0, 1.7, -5.0), 62)]}
                for lab, frm, at_, fov in CL.get(sid, []) + (CL.get(sid + '_fix', []) if os.environ.get('FIXSHOTS') == '1' else []):
                    u = await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at_), 'fov': fov, 'tw': 560, 'label': '%s %s %s' % (L_['name'], hh, lab), 'full': True})
                    save(u, 'tz5close_%s_%s_%s.jpg' % (sid, hh, lab))
                R.note('%s 近拍 %d 張（tz5close_%s_%s_*）' % (tag, len(CL.get(sid, [])), sid, hh))
            fps = await pg.evaluate("new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<8000) requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })")
            R.note('%s 店內 8 秒幀率 %s fps（PC GPU，不是 iPhone）' % (tag, fps))
            # 出來
            its = await pg.evaluate(ITS); ex = next((i for i in its if i.get('to') == OZ), None)
            if not R.check('%s 店裡有「%s」' % (tag, L_['exit']['label']), bool(ex), J(its)[:300]): continue
            if os.environ.get('TRAPDIAG') == '1':   # CC 01:4x（ART2 汀州鮮果新版走不回門口）：出店前先記玩家在哪、E.pathTo 到出口有沒有路、玩家四周 2 m 的 canStand 格子圖、俯視照
                dg = await pg.evaluate("(a=>{ const E=GAME.E,P=E.player,o=P.obj.position; const pth=E.pathTo?E.pathTo(o.x,o.z,P.lv|0,a.x,a.z,0):null; const rows=[];"
                                       " for(let dz=-2;dz<=2.001;dz+=0.25){ let r=''; for(let dx=-2;dx<=2.001;dx+=0.25){ const x=o.x+dx,z=o.z+dz; r+=(Math.abs(dx)<0.13&&Math.abs(dz)<0.13)?'@':(E.canStand(x,z,0.3,P.lv|0)?'.':(E.nav&&E.nav.free(x,z)?'+':'#')); } rows.push(r); }"
                                       " return {me:[+o.x.toFixed(2),+o.z.toFixed(2)], path:pth?pth.length:null, pathPts:pth?pth.slice(0,12).map(p=>Array.isArray(p)?[+(+p[0]).toFixed(2),+(+p[1]).toFixed(2)]:[+(+p.x).toFixed(2),+(+p.z).toFixed(2)]):null, grid:rows}; })", {'x': ex['x'], 'z': ex['z']})
                R.note('%s 出店前（TRAPDIAG）：玩家 %s；E.pathTo 到出口 %s 點 %s；四周 canStand 圖（. 站得住、+ 格子 free 但半徑 0.3 站不住、# 擋住、@ 玩家；每格 0.25 m，上＝−z）：\n%s' % (tag, dg['me'], dg['path'], J(dg['pathPts']), '\n'.join(dg['grid'])))
                save(await pg.evaluate(SNAP, {'from': [0.0, 2.75, 0.3], 'at': [0.0, 0.0, 0.0], 'fov': 110, 'tw': 560, 'label': '%s 俯視（天花板下面）' % L_['name'], 'full': True}), 'trap_%s_%s_top.jpg' % (sid, hh))   # BB 02:13：原本 y 9.5 拍到天花板上面一片米色，改在天花板下面往下拍
                # BB 01:51（LAWWW 在 Node 模擬沒重現）：①SHA ②點地板 5 次（每次目標世界座標、點完 0.6 秒 GAME 有沒有路徑＝P.path 長度、1.5 秒後位置）③（另排 f5e1ef4e8 一版）④搖桿直接朝出口推 10 秒
                R.note('%s TRAPDIAG：受測 SHA %s' % (tag, os.environ.get('SHA', '')))
                PJ = "(()=>{ const P=GAME.E.player,o=P.obj.position; return {me:[+o.x.toFixed(2),+o.z.toFixed(2)], path:P.path?P.path.length:0, tgt:P.target?[+(+P.target.x||0).toFixed(2),+(+P.target.z||0).toFixed(2)]:null, busy:!!P.busy}; })()"
                for k in range(5):
                    me0 = await pg.evaluate(PJ); r_ = await L.tap_ground(pg, cdp, ex['x'], ex['z']); await pg.wait_for_timeout(600); a1 = await pg.evaluate(PJ); await pg.wait_for_timeout(900); a2 = await pg.evaluate(PJ)
                    R.note('%s TRAPDIAG 點地板 #%d：目標（世界座標）(%.2f,%.2f)；點之前 %s；點到 %s；0.6 秒後 path %s 點、P.target %s；1.5 秒後在 %s（path %s）' % (tag, k + 1, ex['x'], ex['z'], me0['me'], J(r_), a1['path'], a1['tgt'], a2['me'], a2['path']))
                me0 = await pg.evaluate(PJ); t0j = time.time(); trail = []
                while time.time() - t0j < 10:
                    m_ = await pg.evaluate(PJ); trail.append(m_['me']); d_ = math.hypot(ex['x'] - m_['me'][0], ex['z'] - m_['me'][1])
                    if d_ < 0.8: break
                    yaw = await pg.evaluate("GAME.E.cam.yaw"); fx_, fz_ = -math.sin(yaw), -math.cos(yaw); rx_, rz_ = math.cos(yaw), -math.sin(yaw)
                    vx_, vz_ = (ex['x'] - m_['me'][0]) / d_, (ex['z'] - m_['me'][1]) / d_; sx_, sy_ = vx_ * rx_ + vz_ * rz_, -(vx_ * fx_ + vz_ * fz_); mm_ = math.hypot(sx_, sy_) or 1
                    await L.joystick(pg, cdp, sx_ / mm_ * 45, sy_ / mm_ * 45, 500)
                me1 = await pg.evaluate(PJ)
                R.note('%s TRAPDIAG 搖桿直接朝出口推 10 秒：從 %s 到 %s（離出口 %.2f m）；軌跡 %s' % (tag, me0['me'], me1['me'], math.hypot(ex['x'] - me1['me'][0], ex['z'] - me1['me'][1]), J(trail[::3])))
            t1 = time.time()
            if JOY: await walk_pt(ex['x'], ex['z'], '%s 搖桿走到「%s」' % (tag, ex['label'])); await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#interact')
            else: await tap_it(pg, cdp, ex, tag)
            for _ in range(80):
                me = await pg.evaluate(ME)
                if me['zone'] == OZ and not me['ent']: break
                await pg.wait_for_timeout(250)
            d_ = ((me['x'] - L_['out']['x']) ** 2 + (me['z'] - L_['out']['z']) ** 2) ** 0.5
            R.check('%s 走出來：回到 %s 門口外面（離 layout.out %.2f m）、站得住' % (tag, OZ, d_), me['zone'] == OZ and d_ < 1.5 and me['free'] is not False, J(me))
            if os.environ.get('DOORFPS') == '1':
                await pg.wait_for_timeout(2500)
                R.note('%s 門口外面 8 秒幀率 %s fps（PC GPU）' % (tag, await pg.evaluate("new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<8000) requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })")))
            p0 = (me['x'], me['z']); await L.joystick(pg, cdp, 0, -45, 1200); me2 = await pg.evaluate(ME)
            R.check('%s 出來以後搖桿推得動（沒有卡在門口）' % tag, ((me2['x'] - p0[0]) ** 2 + (me2['z'] - p0[1]) ** 2) ** 0.5 > 0.3, J(me2))
            R.check('%s walkFallbacks 0' % tag, me2['fb'] == 0, J(me2))


async def ext_shots(pg, L_, it, sid, hh, tag):
    """GG3（BB 23:15）外觀：從門口外面（layout.out）往店門（街上的「進＋店名」）看——正面、招牌近拍、斜看；全尺寸 gg3ext_*（對照 LAWWW2 的參考圖 gg_shops6_1110/concept 由 CC 在雲端拼）"""
    ox, oz = L_['out']['x'], L_['out']['z']; ux, uz = it['x'] - ox, it['z'] - oz; m = math.hypot(ux, uz) or 1; ux, uz = ux / m, uz / m; px, pz = -uz, ux
    V = [('正面', (ox - ux * 7, 1.7, oz - uz * 7), (ox + ux * 2, 2.6, oz + uz * 2), 55),
         ('招牌近拍', (ox - ux * 3, 2.0, oz - uz * 3), (ox + ux * 1.0, 3.8, oz + uz * 1.0), 34),
         ('斜看左', (ox - ux * 6 + px * 5, 1.7, oz - uz * 6 + pz * 5), (ox + ux * 2, 2.4, oz + uz * 2), 50),
         ('斜看右', (ox - ux * 6 - px * 5, 1.7, oz - uz * 6 - pz * 5), (ox + ux * 2, 2.4, oz + uz * 2), 50),
         ('騎樓裡看門', (ox + px * 2.4, 1.6, oz + uz * 0.4), (it['x'] + ux * 1.5, 1.4, it['z'] + uz * 1.5), 60)]
    await pg.evaluate("window.__TZ=[]")
    for lab, frm, at_, fov in V:
        u = await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at_), 'fov': fov, 'tw': 560, 'label': '%s %s 外觀 %s' % (L_['name'], hh, lab), 'full': True})
        save(u, 'gg3ext_%s_%s_%s.jpg' % (sid, hh, lab))
    R.note('%s 外觀照 %d 張（gg3ext_%s_%s_*）' % (tag, len(V), sid, hh))


HER = r"""(a=>{ const E=GAME.E, n=(GAME.npc&&GAME.npc[a.who])||(E.npcs||[]).find(q=>q&&(q.charId===a.who||q.id===a.who)); if(!n||!n.obj) return null; const p=n.obj.position; let lap=null;
  n.obj.traverse(o=>{ if(/laptop/i.test(o.name||'')) lap=(lap||false)||!!o.visible; });
  return {x:+p.x.toFixed(2),z:+p.z.toFixed(2),y:+p.y.toFixed(2),vis:!!n.obj.visible,seat:n.seat?{x:n.seat.x,z:n.seat.z,label:n.seat.label||null}:null,beh:n.beh||null,act:n.act||null,frozen:!!n.frozen,
    dseat:+Math.hypot(p.x-a.sx,p.z-a.sz).toFixed(2),lap}; })"""


async def part_zqseat(pg, cdp):
    """GG3 第 5 項（BB 23:15）：子晴在公館騎樓的板凳（座位 (15.6,19.8) yaw 0「坐在騎樓的板凳」；heroine_circle 的「公館騎樓（插座旁邊）」act read＋seatAt）。
    新舊同時間同位置：【前置／捷徑】讀檔到公館 ZQDATES 裡第一個她在的日子 21:30、站在 (15.6,15.5)；等她坐下 → 固定機位拍 → 走過去（點地面）→ 看按鈕、按一下有沒有對話。"""
    who, SX, SZ = 'heroine_04', 15.6, 19.8
    for day in (os.environ.get('ZQDATES') or '2027-06-15,2027-06-17,2027-03-16,2027-03-18').split(','):
        h = float(os.environ.get('ZQH') or 21.5); tag = '[ZQSEAT %s %.1f]' % (day, h)
        await D.load_zone(pg, cdp, 'gongguan', day, h, SX, 15.5, wait=8000)
        R.setup('【前置／捷徑】讀檔到公館 %s %.1f 時 (15.6,15.5)（子晴騎樓板凳那一場）' % (day, h))
        her = None
        for _ in range(60):
            her = await pg.evaluate(HER, {'who': who, 'sx': SX, 'sz': SZ})
            if her and her['dseat'] < 0.5: break
            await pg.wait_for_timeout(1000)
        R.note('%s 子晴：%s' % (tag, J(her)))
        if not her: R.note('%s 這天公館沒有子晴，換下一天' % tag); continue
        await pg.evaluate("window.__TZ=[]")
        # r2：r1 機位在柱子靠馬路那一側（z<19），被柱子、機車擋住看不到她
        for lab, frm, at_, fov in [('騎樓這一側正面', (SX + 0.4, 1.4, SZ + 2.6), (SX, 0.8, SZ), 50), ('騎樓斜看', (SX + 2.8, 1.5, SZ + 1.8), (SX, 0.8, SZ), 48), ('放大', (SX + 0.3, 1.2, SZ + 1.5), (SX, 0.75, SZ), 35)]:
            u = await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at_), 'fov': fov, 'tw': 560, 'label': '子晴 騎樓板凳 %s %.1f %s' % (day, h, lab), 'full': True})
            save(u, 'zqseat_%s_%s.jpg' % (day, lab))
        b = await pg.screenshot(type='jpeg', quality=82); open(os.path.join(OUT, 'zqseat_%s_game.jpg' % day), 'wb').write(b)
        R.check('%s 子晴坐在板凳上（離座位 %.2f m、seat %s）' % (tag, her['dseat'], J(her['seat'])), her['dseat'] < 0.4 and bool(her['seat']), J(her))
        R.note('%s 筆電道具看得到：%s' % (tag, her['lap']))
        fr = await pg.evaluate("(()=>{ const N=GAME.E.nav; return [[15.6,20.6],[15.6,21.2],[14.6,20.6],[16.6,20.6]].map(([x,z])=>[x,z,!!(N&&N.free(x,z))]); })()")
        R.check('%s 她前面（騎樓那一側）站得住、沒有被擋' % tag, any(f[2] for f in fr), J(fr))
        ok = await L.go_to(pg, cdp, R, SX, SZ + 1.0, 1.1, '%s 走到她前面' % tag, max_s=120)
        await pg.wait_for_timeout(800); bb = await pg.screenshot(type='jpeg', quality=82); open(os.path.join(OUT, 'zqseat_%s_game_front.jpg' % day), 'wb').write(bb)
        s = await L.state(pg); her2 = await pg.evaluate(HER, {'who': who, 'sx': SX, 'sz': SZ})
        R.check('%s 走得到她前面' % tag, ok, J({k: s[k] for k in ('x', 'z', 'interact')}))
        R.note('%s 按鈕：「%s」；她還坐著：%s' % (tag, s['interact'], J(her2)))
        R.check('%s 按鈕是和她說話（不是「坐下」或別的）' % tag, bool(s['interact']) and '坐' not in s['interact'], s['interact'])
        await L.tap(pg, cdp, '#interact'); lines = []
        for _ in range(40):
            q = await L.state(pg)
            if q['choices']:
                o = await pg.evaluate("[...document.querySelectorAll('#choices button, .choice')].map(b=>b.textContent.trim()).filter(Boolean)"); lines.append('（選項）' + ' / '.join(o))
                await L.tap(pg, cdp, '#choices button'); await pg.wait_for_timeout(600); continue
            if q['dlg']:
                t = await pg.evaluate("(document.getElementById('dlgText')||document.getElementById('dlg')||{}).textContent||''")
                if not lines or lines[-1] != t: lines.append(t.strip()[:80])
                if len(lines) == 2: b = await pg.screenshot(type='jpeg', quality=80); open(os.path.join(OUT, 'zqseat_%s_talk.jpg' % day), 'wb').write(b)
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            if lines: break
            await pg.wait_for_timeout(400)
        R.check('%s 按了有對話' % tag, bool(lines), '')
        R.note('%s 對話：%s' % (tag, J(lines[:12])))
        R.check('%s walkFallbacks 0' % tag, (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')
        return
    R.check('[ZQSEAT] ZQDATES 裡有一天子晴在公館', False, '四天都沒看到她（前置不成立，不是判定）')


LMN = r"""(()=>{ const z=GAME.E.zone||{}, lm=z.tzLimao; if(!lm) return null; const N={}; for(const k of Object.keys(lm.nodes||{})){ const o=lm.nodes[k]; N[k]=o?!!o.visible:null; }
  const all={}; GAME.E.scene.traverse(o=>{ if(/^LIMAO_/.test(o.name||'')&&!(o.name in all)) all[o.name]=!!o.visible; });
  return {open:!!lm.open, masterAway:!!lm.masterAway, h:+(+GAME.G.hour).toFixed(3), money:GAME.G.money, door:lm.door?{label:lm.door.label,exit:!!lm.door.exit,look:lm.door.look||null}:null, nodes:N, sceneLimao:all}; })()"""


async def part_limao(pg, cdp):
    """X332 禮貌生財第 1 版（BB 00:07；11161c101，舊 bd3f67410＝還沒有這間店）。這版只能走進去、看；上師、對話、書房解鎖還沒有。
    ①巷 A 靠公館那一端 18:00（收著）、20:00（開著）、23:45（收了）：店面正面、招牌近拍、×2（fov 減半）、算命桌；LIMAO_* 節點哪些看得到（開收只動桌子、不罩整間店）；
      互動鍵、按下去的字、錢不動。②室內（20:00）：走進去、命理館四個角度、書房的門（拍門、互動鍵的字、按了的字）、試著走進書房（走不進去、停在隔牆前）、走出來回到巷子。
    ③舊存檔站在現在是店面的位置讀檔：挪多少、站得住、推得動。④巷 A 搖桿走一趟（20:00）。"""
    L0 = await pg.evaluate("(()=>typeof TINGZHOU_LAYOUT!=='undefined'&&TINGZHOU_LAYOUT.limao?TINGZHOU_LAYOUT.limao:null)()")
    R.note('[LIMAO] 配置 TINGZHOU_LAYOUT.limao：%s' % J(L0))
    LMX = L0 or {'x0': 25.5, 'x1': 31.0, 'z': 2.5, 'dep': 3.0, 'door': {'x': 27.4, 'z': 4.75}, 'table': {'x': 29.35, 'z': 3.85}, 'from': 19, 'to': 23.5}
    cx = (LMX['x0'] + LMX['x1']) / 2; fz = LMX['z'] + LMX['dep']; T = LMX['table']
    LMH = [float(x) for x in (os.environ.get('LMHOURS') or '18,20,23.75').split(',')]
    for h, want in [(x, LMX.get('from', 19) <= x < LMX.get('to', 23.5)) for x in LMH]:
        hh = '%02d%02d' % (int(h), int(round((h % 1) * 60))); tag = '[LIMAO %s]' % hh
        await at(pg, cdp, 'tingzhou', h, cx - 1.0, -0.8, '（巷 A，禮貌生財前面）'); await pg.wait_for_timeout(2500)
        st = await pg.evaluate(LMN); R.note('%s 狀態：%s' % (tag, J(st)))
        if L0: R.check('%s 店在（zone.tzLimao）、開著＝%s（19:00～23:30）' % (tag, want), bool(st) and st['open'] == want, J(st and {k: st[k] for k in ('open', 'h')}))
        V = [('店面正面', (cx, 1.7, -2.0), (cx, 2.4, fz), 55), ('招牌近拍', (cx, 2.5, -0.3), (cx, 3.6, LMX['z'] + 0.2), 32), ('招牌放大', (cx, 2.6, -0.3), (cx, 3.7, LMX['z'] + 0.2), 16),
             ('算命桌', (T['x'] - 0.3, 1.6, -0.6), (T['x'], 0.8, T['z']), 45), ('斜看', (cx - 6.0, 1.7, -1.6), (cx, 2.2, fz - 1.0), 55), ('斜看右', (cx + 6.0, 1.7, -1.6), (cx, 2.2, fz - 1.0), 55),
             ('門近拍', (LMX['door']['x'] + 0.3, 1.5, LMX['door']['z'] - 2.2), (LMX['door']['x'], 1.3, LMX['door']['z'] + 0.6), 42)]
        if T.get('seatMaster'): V.append(('上師座位', (T['seatMaster']['x'] - 0.4, 1.5, T['seatMaster']['z'] - 2.6), (T['seatMaster']['x'], 1.0, T['seatMaster']['z']), 40))
        await pg.evaluate("window.__TZ=[]")
        for lab, frm, to, fov in V:
            save(await pg.evaluate(SNAP, {'from': list(frm), 'at': list(to), 'fov': fov, 'tw': 560, 'label': '禮貌生財 %s %s' % (hh, lab), 'full': True}), 'lm_%s_%s.jpg' % (hh, lab))
        its = await pg.evaluate(ITS); d = next((i for i in its if i.get('tzd') == 'limao'), None)
        R.note('%s 店門的互動點：%s' % (tag, J(d)))
        if not L0: continue
        if not R.check('%s 巷子裡有禮貌生財的互動點' % tag, bool(d), ''): continue
        m0 = await pg.evaluate("GAME.G.money")
        ok = await L.go_to(pg, cdp, R, d['x'], d['z'], 0.7, '%s 走到店門' % tag, max_s=60); await pg.wait_for_timeout(700)
        s = await L.state(pg); R.note('%s 店門口互動鍵：「%s」' % (tag, s['interact']))
        R.check('%s 互動鍵是「%s禮貌生財」' % (tag, '進' if want else '看'), s['interact'].startswith(('進' if want else '看') + '禮貌生財'), s['interact'])
        if not want and L0.get('table', {}).get('at'):   # BB 00:48 5：收著的時候算命桌的按鈕（看算命桌）念的旁白，逐字記
            ta = L0['table']['at']; await L.go_to(pg, cdp, R, ta['x'], ta['z'], 0.6, '%s 走到算命桌前' % tag, max_s=40); await pg.wait_for_timeout(700)
            s2 = await L.state(pg); R.note('%s 算命桌前互動鍵：「%s」' % (tag, s2['interact'])); lines2 = []
            if s2['interact']:
                await L.tap(pg, cdp, '#interact')
                for _ in range(20):
                    q2 = await L.state(pg)
                    if q2['dlg']:
                        t2 = (await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")).strip()
                        if t2 and (not lines2 or lines2[-1] != t2): lines2.append(t2)
                        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
                    if lines2: break
                    await pg.wait_for_timeout(300)
            R.note('%s 按「%s」→ %s' % (tag, s2['interact'], J(lines2)))
            R.check('%s 收著：算命桌的按鈕是「看算命桌」、按了念一句旁白、錢沒動' % tag, s2['interact'].startswith('看算命桌') and bool(lines2) and (await pg.evaluate("GAME.G.money")) == m0, J(lines2))
            await L.go_to(pg, cdp, R, d['x'], d['z'], 0.7, '%s 走回店門' % tag, max_s=40); await pg.wait_for_timeout(600); s = await L.state(pg)
        if want:
            await pg.screenshot(path=os.path.join(OUT, 'lm_%s_door_game.jpg' % hh), type='jpeg', quality=80); continue   # 開著：按下去會進店，室內在第 ② 段
        await L.tap(pg, cdp, '#interact'); lines = []
        for _ in range(20):
            q = await L.state(pg)
            if q['dlg']:
                t = (await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")).strip()
                if t and (not lines or lines[-1] != t): lines.append(t)
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
            if lines: break
            await pg.wait_for_timeout(300)
        z1 = await pg.evaluate("GAME.G.zone")
        R.note('%s 按「%s」→ %s；還在 %s' % (tag, s['interact'], J(lines), z1))
        R.check('%s 收著：按了不會進店、錢沒動' % tag, z1 == 'tingzhou' and (await pg.evaluate("GAME.G.money")) == m0, J({'zone': z1}))
    if not L0: R.note('[LIMAO] 這一版沒有禮貌生財（舊版對照）：上面是同機位的照片'); return
    # ② 室內（20:00）
    await at(pg, cdp, 'tingzhou', 20.0, LMX['door']['x'], LMX['door']['z'] - 1.4, '（禮貌生財門口外面，開著）'); await pg.wait_for_timeout(2000)
    m0 = await pg.evaluate("GAME.G.money")
    d = next((i for i in await pg.evaluate(ITS) if i.get('tzd') == 'limao'), None)
    t0 = time.time(); await tap_it(pg, cdp, d, '[LIMAO 進店]')
    for _ in range(80):
        me = await pg.evaluate(ME)
        if me['zone'] == 'tz_limao' and not me['ent']: break
        await pg.wait_for_timeout(250)
    R.check('[LIMAO 室內] 走進去（%.1f 秒）：區域 tz_limao、站得住' % (time.time() - t0), me['zone'] == 'tz_limao' and me['free'] is not False, J(me))
    if me['zone'] != 'tz_limao': return
    await pg.wait_for_timeout(2500)
    fm = await pg.evaluate("(()=>{ const z=GAME.E.zone||{}; return {formal:!!z.formal, glb:!!GAME.E.scene.getObjectByName('tz_limao_glb'), studyOpen:!!z.studyOpen}; })()"); R.note('[LIMAO 室內] 正式模型：%s' % J(fm))
    for lab, frm, to, fov in [('門口往裡', (0.9, 1.6, 4.4), (0.0, 1.3, -1.2), 62), ('裡面往門口', (-0.4, 1.7, -0.6), (0.6, 1.2, 4.8), 62), ('西牆書櫃', (1.2, 1.6, 3.6), (-2.3, 1.4, 0.5), 55),
                              ('東牆玻璃櫃', (-1.2, 1.6, 3.6), (2.3, 1.3, 1.0), 55), ('書房的門', (0.9, 1.6, 2.4), (1.0, 1.2, -1.2), 45), ('書房的門 放大', (0.9, 1.5, 1.0), (1.0, 1.2, -1.2), 30)]:
        save(await pg.evaluate(SNAP, {'from': list(frm), 'at': list(to), 'fov': fov, 'tw': 560, 'label': '禮貌生財 室內 %s' % lab, 'full': True}), 'lm_int_%s.jpg' % lab)
    ok = await L.go_to(pg, cdp, R, 1.0, -0.25, 0.6, '[LIMAO 書房] 走到書房的門前', max_s=60); await pg.wait_for_timeout(700)
    s = await L.state(pg); await pg.screenshot(path=os.path.join(OUT, 'lm_int_study_door_game.jpg'), type='jpeg', quality=80)
    R.check('[LIMAO 書房] 門前互動鍵有字（照實記）', bool(s['interact']), s['interact']); R.note('[LIMAO 書房] 門前互動鍵：「%s」' % s['interact'])
    await L.tap(pg, cdp, '#interact'); lines = []
    for _ in range(20):
        q = await L.state(pg)
        if q['dlg']:
            t = (await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")).strip()
            if t and (not lines or lines[-1] != t): lines.append(t)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if lines: break
        await pg.wait_for_timeout(300)
    R.note('[LIMAO 書房] 按了：%s' % J(lines))
    await L.tap_ground(pg, cdp, 0.3, -2.6); await pg.wait_for_timeout(5000)
    me = await pg.evaluate(ME)
    R.check('[LIMAO 書房] 點書房裡面的地板走不進去（停在隔牆前 z > −1.2）', me['z'] > -1.25, J(me))
    await L.joystick(pg, cdp, 0, -45, 1500); me = await pg.evaluate(ME)
    R.check('[LIMAO 書房] 搖桿往書房推也進不去（z > −1.2）', me['z'] > -1.25, J(me))
    R.check('[LIMAO 室內] 錢沒動', (await pg.evaluate("GAME.G.money")) == m0, '')
    R.note('[LIMAO 室內] 8 秒幀率 %s fps' % await pg.evaluate("new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<8000) requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })"))
    ex = next((i for i in await pg.evaluate(ITS) if i.get('to') == 'tingzhou'), None)
    if R.check('[LIMAO 室內] 有「離開禮貌生財」', bool(ex), ''):
        await tap_it(pg, cdp, ex, '[LIMAO 出店]')
        for _ in range(80):
            me = await pg.evaluate(ME)
            if me['zone'] == 'tingzhou' and not me['ent']: break
            await pg.wait_for_timeout(250)
        R.check('[LIMAO 室內] 走出來回到巷子、站得住', me['zone'] == 'tingzhou' and me['free'] is not False, J(me))
        p0 = (me['x'], me['z']); await L.joystick(pg, cdp, 0, -45, 1200); me2 = await pg.evaluate(ME)
        R.check('[LIMAO 室內] 出來推得動', math.hypot(me2['x'] - p0[0], me2['z'] - p0[1]) > 0.3, J(me2))
    # ③ 舊存檔站在現在是店面的位置
    for x, z in ((cx, LMX['z'] + 1.0), (LMX['door']['x'], LMX['door']['z']), (cx, fz + 0.5)):
        await at(pg, cdp, 'tingzhou', 20.0, x, z, '（舊存檔的 pos：改版前這裡不是店面）')
        me = await pg.evaluate(ME); mv = math.hypot(me['x'] - x, me['z'] - z)
        p0 = (me['x'], me['z']); await L.joystick(pg, cdp, 0, 45, 1000); me2 = await pg.evaluate(ME)
        R.check('[LIMAO 舊存檔 (%.1f,%.1f)] 讀得進來、站得住（挪 %.2f m）、推得動' % (x, z, mv), me['zone'] in ('tingzhou', 'tz_limao') and me['free'] is not False and math.hypot(me2['x'] - p0[0], me2['z'] - p0[1]) > 0.3, J([me, me2]))
    # ④ 巷 A 搖桿走一趟
    await at(pg, cdp, 'tingzhou', 20.0, 6.5, 0.0, '（巷 A 西端）')
    t0 = time.time(); stuck = 0; last = (time.time(), None)
    for tx in (27.0, 6.5):
        while time.time() - t0 < 120:
            s = await L.state(pg); dd = tx - s['x']
            if abs(dd) < 0.8: break
            if last[1] is None or abs(s['x'] - last[1]) > 0.3: last = (time.time(), s['x'])
            elif time.time() - last[0] > 3: stuck += 1; await L.joystick(pg, cdp, 30, 0, 600); last = (time.time(), None); continue
            yaw = await pg.evaluate("GAME.E.cam.yaw"); fx_, fz_ = -math.sin(yaw), -math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
            vx, vz = (1 if dd > 0 else -1), (0 - s['z']) * 0.3; m = math.hypot(vx, vz) or 1; vx, vz = vx / m, vz / m
            sx, sy = vx * rx + vz * rz, -(vx * fx_ + vz * fz_); mm = math.hypot(sx, sy) or 1
            await L.joystick(pg, cdp, sx / mm * 45, sy / mm * 45, 700)
    s = await L.state(pg)
    R.check('[LIMAO 巷A] 搖桿來回走一趟（%.0f 秒、卡住 %d 次）' % (time.time() - t0, stuck), abs(s['x'] - 6.5) < 1.0 and stuck == 0, J({k: s[k] for k in ('x', 'z')}))
    R.check('[LIMAO] walkFallbacks 0', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


async def part_g0910(pg, cdp):
    """BB 00:48 4：公館 G09、G10 拉下鐵捲門（65212b697）。14:00、20:30 正面和騎樓裡看（GGEXT 的機位，GGS=G09,G10 另外跑）；
    這裡：兩格門口 2.5 m 內有哪些互動點（全文記；G10 原本有「往汀州路（巷子）」）、搖桿沿騎樓走過兩格門口、舊存檔站在兩格門口讀檔"""
    await at(pg, cdp, 'gongguan', 14.0, 22.0, 20.0, '（公館騎樓 G08、G09 之間）'); await pg.wait_for_timeout(3000)
    bx = await pg.evaluate("(()=>{ const o={}; for(const b of (GAME.E.zone.buildings||[])) if(b.userData&&b.userData.ggShop) o[b.userData.ggShop]=+b.position.x.toFixed(2); return o; })()")
    its = await pg.evaluate(ITS)
    for g in ('G09', 'G10'):
        if g not in bx: R.check('[G0910] 有 %s' % g, False, J(bx)); continue
        near = [i for i in its if math.hypot(i['x'] - bx[g], i['z'] - 21.0) < 2.5]
        R.note('[G0910 %s] 門口 2.5 m 內的互動點：%s' % (g, J(near)))
        R.check('[G0910 %s] 門口沒有這一格自己的互動點（「往汀州路」那種巷口照實記、不算）' % g, not [i for i in near if not i.get('gate') and abs(i['x'] - bx[g]) < 1.6], J(near))
    t0 = time.time(); stuck = 0; last = (time.time(), None)
    for tx in (bx.get('G10', 37.1) + 3.0, 22.0):
        while time.time() - t0 < 90:
            s_ = await L.state(pg); dd = tx - s_['x']
            if abs(dd) < 0.8: break
            if last[1] is None or abs(s_['x'] - last[1]) > 0.3: last = (time.time(), s_['x'])
            elif time.time() - last[0] > 3: stuck += 1; await L.joystick(pg, cdp, 0, 30, 600); last = (time.time(), None); continue
            yaw = await pg.evaluate("GAME.E.cam.yaw"); fx_, fz_ = -math.sin(yaw), -math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
            vx, vz = (1 if dd > 0 else -1), (20.0 - s_['z']) * 0.4; m = math.hypot(vx, vz) or 1; vx, vz = vx / m, vz / m
            sx, sy = vx * rx + vz * rz, -(vx * fx_ + vz * fz_); mm = math.hypot(sx, sy) or 1
            await L.joystick(pg, cdp, sx / mm * 45, sy / mm * 45, 700)
    s_ = await L.state(pg)
    R.check('[G0910] 搖桿沿騎樓（z 20）走過 G09、G10 門口再走回來（%.0f 秒、卡住 %d 次）' % (time.time() - t0, stuck), abs(s_['x'] - 22.0) < 1.0 and stuck == 0, J({k: s_[k] for k in ('x', 'z')}))
    R.check('[G0910] walkFallbacks 0', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')
    for g in ('G09', 'G10'):
        if g not in bx: continue
        x, z = bx[g], 21.0
        await at(pg, cdp, 'gongguan', 14.0, x, z, '（舊存檔站在 %s 門口）' % g)
        me = await pg.evaluate(ME); mv = math.hypot(me['x'] - x, me['z'] - z)
        p0 = (me['x'], me['z']); await L.joystick(pg, cdp, 0, 45, 1000); me2 = await pg.evaluate(ME)
        R.check('[G0910 舊存檔 %s (%.1f,21)] 讀得進來、站得住（挪 %.2f m）、推得動' % (g, x, mv), me['zone'] == 'gongguan' and me['free'] is not False and math.hypot(me2['x'] - p0[0], me2['z'] - p0[1]) > 0.3, J([me, me2]))


CEILJS = r"""(()=>{ const E=GAME.E, r=E.renderer, c=r.domElement, cam=E.camera; r.render(E.scene,cam); const k=document.createElement('canvas'); k.width=120; k.height=24; const g=k.getContext('2d');
  g.drawImage(c,0,0,c.width,c.height*0.2,0,0,120,24); const d=g.getImageData(0,0,120,24).data; let R=0,G=0,B=0,bk=0,n=0; for(let i=0;i<d.length;i+=4){ R+=d[i]; G+=d[i+1]; B+=d[i+2]; if(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]<12) bk++; n++; }
  let ceil=null; E.scene.traverse(o=>{ if(o.isMesh&&/ceil|天花/i.test(o.name||'')) ceil=ceil||{name:o.name, visible:o.visible}; });
  return {zone:GAME.G.zone, camY:+cam.position.y.toFixed(3), dist:E.cam.dist!=null?+(+E.cam.dist).toFixed(2):null, distTarget:E.cam.distTarget!=null?+(+E.cam.distTarget).toFixed(2):null, pitch:+(+E.cam.pitch).toFixed(3), indoor:!!E.indoor,
    top:{rgb:[Math.round(R/n),Math.round(G/n),Math.round(B/n)], black:+(bk/n).toFixed(3)}, ceil}; })()"""


async def part_ceil(pg, cdp):
    """BB 05:47 LM_ceil：用玩家做得到的操作把遊戲鏡頭弄到最低——雙指往外撐推近到最近（engine3d.js 234 行：室內 distTarget 最小 2.2）、單指往上拖把俯角拉到最平（pitch 最小 0.06）；
    每間室內拍一張，記鏡頭 y、dist／distTarget／pitch、畫面最上面 20% 是天花板、星空（偏藍亮）還是黑。不強制顯示任何東西。y 到不了 3.0 以下就記「做不到」。"""
    lay = await pg.evaluate("(()=>typeof TZ_SHOPS_LAYOUT==='undefined'?null:Object.fromEntries(Object.entries(TZ_SHOPS_LAYOUT).map(([k,v])=>[k,{zone:v.zone,name:v.name,h:v.h,spawn:v.spawn,outZone:v.outZone||'tingzhou',out:v.out}])))()")
    for sid in [x for x in (os.environ.get('SHOPS') or 'limao,antai,rongendian,xianguo').split(',') if x and lay and x in lay]:
        L_ = lay[sid]; tag = '[CEIL %s]' % L_['name']; h = 20.0 if sid == 'limao' else 14.0
        await at(pg, cdp, L_['outZone'], h, L_['out']['x'], L_['out']['z'], '（%s 門口外面）' % L_['name'])
        it = next((i for i in await pg.evaluate(ITS) if i.get('tz') == sid or i.get('tzd') == sid), None)
        if not R.check('%s 街上有入口' % tag, bool(it), ''): continue
        await tap_it(pg, cdp, it, tag)
        for _ in range(80):
            if (await pg.evaluate(ME))['zone'] == L_['zone']: break
            await pg.wait_for_timeout(250)
        await pg.wait_for_timeout(1500)
        c0 = await pg.evaluate(CEILJS); R.note('%s 進門時：%s（天花板高 %s）' % (tag, J(c0), L_.get('h')))
        vw = await pg.evaluate("[innerWidth, innerHeight]"); cx, cy = vw[0] / 2, vw[1] * 0.4
        for _ in range(3):   # 雙指往外撐（距離變大＝推近）
            await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': cx - 30, 'y': cy, 'id': 1}, {'x': cx + 30, 'y': cy, 'id': 2}]})
            for k in range(1, 11):
                await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': cx - 30 - 14 * k, 'y': cy, 'id': 1}, {'x': cx + 30 + 14 * k, 'y': cy, 'id': 2}]}); await pg.wait_for_timeout(40)
            await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); await pg.wait_for_timeout(300)
        for _ in range(3):   # 單指往上拖（dy<0＝俯角變小、鏡頭變低）
            await L.drag(pg, cdp, cx + 60, vw[1] * 0.55, cx + 60, vw[1] * 0.15, steps=12); await pg.wait_for_timeout(200)
        await pg.wait_for_timeout(1500)
        c1 = await pg.evaluate(CEILJS); tb = c1['top']; sky = tb['rgb'][2] > tb['rgb'][0] + 25 and tb['rgb'][2] > tb['rgb'][1] + 8
        what = '大面積黑' if tb['black'] > 0.3 else ('像星空／天空' if sky else '天花板或牆（看圖）')
        await pg.screenshot(path=os.path.join(OUT, 'ceil_%s.jpg' % sid), type='jpeg', quality=82)
        ch = L_.get('h') or 3.0
        R.note('%s 玩家能做到的最低鏡頭：%s；畫面上方 20%%＝%s；%s' % (tag, J(c1), what, '鏡頭 y %.2f 低於天花板 %.2f' % (c1['camY'], ch) if c1['camY'] < ch else '★做不到：鏡頭 y %.2f 沒有低於天花板 %.2f' % (c1['camY'], ch)))
        if c1['camY'] < ch: R.check('%s 鏡頭低於天花板時，畫面上方不是星空或大面積黑' % tag, not sky and tb['black'] <= 0.3, J(tb))


async def part_doorjoy(pg, cdp):
    """BB 02:33 ③：門口的東西不擋進出——每間（SHOPS）搖桿進店、出店各兩次（照 E.pathTo 中途點推）；walkFallbacks 0"""
    lay = await pg.evaluate("(()=>typeof TZ_SHOPS_LAYOUT==='undefined'?null:Object.fromEntries(Object.entries(TZ_SHOPS_LAYOUT).map(([k,v])=>[k,{zone:v.zone,name:v.name,out:v.out,outZone:v.outZone||'tingzhou'}])))()")
    for sid in [x for x in (os.environ.get('SHOPS') or '').split(',') if x and lay and x in lay]:
        L_ = lay[sid]; OZ = L_['outZone']
        await at(pg, cdp, OZ, 14.0, L_['out']['x'], L_['out']['z'], '（%s 門口外面）' % L_['name'])
        async def joy_to_it(it, lab):
            return (await joy_path(pg, cdp, it['x'], it['z'], 0.7))[0]
        for rnd in (1, 2):
            tag = '[DOORJOY %s 第 %d 次]' % (L_['name'], rnd)
            it = next((i for i in await pg.evaluate(ITS) if i.get('tz') == sid or i.get('tzd') == sid), None)
            if not R.check('%s 街上有入口' % tag, bool(it), ''): break
            ok = await joy_to_it(it, '入口'); await pg.wait_for_timeout(500); s_ = await L.state(pg)
            R.check('%s 搖桿走到入口、鍵是「%s」' % (tag, s_['interact']), ok and s_['interact'].startswith('進'), J({k: s_[k] for k in ('x', 'z', 'interact')}))
            await L.tap(pg, cdp, '#interact')
            for _ in range(60):
                if (await pg.evaluate(ME))['zone'] == L_['zone']: break
                await pg.wait_for_timeout(250)
            await pg.wait_for_timeout(1500); me = await pg.evaluate(ME)
            if not R.check('%s 進到店裡' % tag, me['zone'] == L_['zone'], J(me)): break
            ex = next((i for i in await pg.evaluate(ITS) if i.get('to') == OZ), None)
            ok = await joy_to_it(ex, '出口'); await pg.wait_for_timeout(500); s_ = await L.state(pg)
            R.check('%s 搖桿走到出口、鍵是「%s」' % (tag, s_['interact']), ok and s_['interact'].startswith('離開'), J({k: s_[k] for k in ('x', 'z', 'interact')}))
            await L.tap(pg, cdp, '#interact')
            for _ in range(60):
                if (await pg.evaluate(ME))['zone'] == OZ: break
                await pg.wait_for_timeout(250)
            await pg.wait_for_timeout(1500); me = await pg.evaluate(ME)
            R.check('%s 出店回到 %s、站得住' % (tag, OZ), me['zone'] == OZ and me['free'] is not False, J(me))
        R.check('[DOORJOY %s] walkFallbacks 0' % L_['name'], (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


async def part_ggext(pg, cdp):
    """GG3 第 4 項外觀（新舊同機位）：公館 GGS（預設 G04,G08,G13＝安泰、汀州鮮果、榮恩典）每一棟：站 (棟 x, 18)、往店門 (棟 x, 21) 看——正面、招牌近拍、斜看左右、騎樓裡看門。HOURS 每個時間一組。"""
    names = {'G04': 'antai', 'G08': 'xianguo', 'G13': 'rongendian', 'G11': 'g11', 'G09': 'g09', 'G10': 'g10'}
    for h in [float(x) for x in (os.environ.get('HOURS') or '14').split(',')]:
        hh = '%02d%02d' % (int(h), int(round((h % 1) * 60)))
        await at(pg, cdp, 'gongguan', h, 0.0, 16.0, '（公館外觀照）'); await pg.wait_for_timeout(4000)
        bx = await pg.evaluate("(()=>{ const o={}; for(const b of (GAME.E.zone.buildings||[])) if(b.userData&&b.userData.ggShop) o[b.userData.ggShop]=+b.position.x.toFixed(2); return o; })()")
        glb = await pg.evaluate("!!GAME.E.scene.getObjectByName('gongguan_shops_glb')")
        R.note('[GGEXT %s] 棟號 x：%s；正式店面模型 gongguan_shops_glb：%s' % (hh, J(bx), glb))
        for g in (os.environ.get('GGS') or 'G04,G08,G13,G09,G10').split(','):
            if g not in bx: R.check('[GGEXT %s] 有 %s' % (hh, g), False, J(bx)); continue
            its = await pg.evaluate(ITS); near = sorted(its, key=lambda i: math.hypot(i['x'] - bx[g], i['z'] - 21.0))[:2]
            R.note('[GGEXT %s] %s 店門附近的互動點：%s' % (hh, g, J(near)))
            L_ = {'name': g, 'out': {'x': bx[g], 'z': 18.0}}
            await ext_shots(pg, L_, {'x': bx[g], 'z': 21.0}, names.get(g, g), hh, '[GGEXT %s %s]' % (hh, g))


async def part_ggwalk(pg, cdp):
    """GG3 第 2 項（BB 23:15）：搖桿走公館一趟——舊花攤那一塊 (−47,11.6)：走得過去、沒有花攤；G04／G08／G11／G13 店門口：停下來看按鈕、拍一張。
    【前置／捷徑】讀檔到公館 14:00 (−58,14)；之後全程搖桿（照鏡頭方向往目標推；卡住 3 秒就往側邊推 0.8 秒再試，紀錄次數）。"""
    await at(pg, cdp, 'gongguan', 14.0, -58.0, 14.0, '（公館西邊人行道）')
    bx = await pg.evaluate("(()=>{ const o={}; for(const b of (GAME.E.zone.buildings||[])) if(b.userData&&b.userData.ggShop) o[b.userData.ggShop]=+b.position.x.toFixed(2); return o; })()")
    R.note('[GGWALK] 店面棟號 x：%s' % J(bx))
    old = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>i.kind==='gg_flower'||/花攤|晨露/.test(i.label||'')||/晨露/.test(i.look||'')).map(i=>({label:i.label,x:+i.x.toFixed(1),z:+i.z.toFixed(1),hidden:!!i.hidden})))()")
    R.check('[GGWALK] 公館街上沒有舊花攤的互動點（kind gg_flower／晨露花舖）', not [o for o in old if not o['hidden']], J(old))
    T = [('舊花攤那一塊', -47.0, 11.6, None)] + [('%s 店門口' % g, bx[g], 21.0, g) for g in ('G04', 'G08', 'G11', 'G13') if g in bx]
    for lab, tx, tz, g in T:
        t0 = time.time(); stuck = 0; side = 1; last = (time.time(), None); reached = False
        while time.time() - t0 < 120:
            s = await L.state(pg); d = math.hypot(tx - s['x'], tz - s['z'])
            if d < 0.9: reached = True; break
            if last[1] is None or math.hypot(s['x'] - last[1][0], s['z'] - last[1][1]) > 0.3: last = (time.time(), (s['x'], s['z']))
            elif time.time() - last[0] > 3:
                stuck += 1; side = -side; yaw = await pg.evaluate("GAME.E.cam.yaw")
                await L.joystick(pg, cdp, side * 45, 0, 800); last = (time.time(), None); continue
            yaw = await pg.evaluate("GAME.E.cam.yaw"); fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = math.cos(yaw), -math.sin(yaw)
            vx, vz = (tx - s['x']) / d, (tz - s['z']) / d; sx, sy = vx * rx + vz * rz, -(vx * fx + vz * fz); m = math.hypot(sx, sy) or 1
            await L.joystick(pg, cdp, sx / m * 45, sy / m * 45, 700 if d > 3 else 300)
        await pg.wait_for_timeout(900); s = await L.state(pg)
        free = await pg.evaluate("(([x,z])=>{ const N=GAME.E.nav; return N?!!N.free(x,z):null; })", [tx, tz])
        R.check('[GGWALK] 搖桿走到%s (%.1f,%.1f)（%.0f 秒、卡住改側推 %d 次）' % (lab, tx, tz, time.time() - t0, stuck), reached, J({k: s[k] for k in ('x', 'z', 'interact')}))
        if g: R.note('[GGWALK] %s 停下來的按鈕：「%s」' % (lab, s['interact']))
        else: R.check('[GGWALK] 舊花攤那一塊站得住（導航格 free）', bool(free), J([tx, tz, free]))
        b = await pg.screenshot(type='jpeg', quality=80); open(os.path.join(OUT, 'ggwalk_%s.jpg' % (g or 'oldstall')), 'wb').write(b)
        if not g:
            await pg.evaluate("window.__TZ=[]")
            u = await pg.evaluate(SNAP, {'from': [-47.0, 1.7, 5.5], 'at': [-47.0, 1.0, 13.0], 'fov': 55, 'tw': 560, 'label': '舊花攤那一塊 (−47,11.6) 14:00', 'full': True})
            save(u, 'ggwalk_oldstall_snap.jpg')
    R.check('[GGWALK] walkFallbacks 0', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


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
        for part, fn in (('GATE', part_gate), ('SHOPS', part_shops), ('WALK', part_walk), ('OLD', part_old), ('SHOTS', part_shots), ('FPS', part_fps), ('SCOOT', part_scoot), ('SCOOT3', part_scoot3), ('SCOOT4', part_scoot4), ('INT', part_int), ('ZQSEAT', part_zqseat), ('GGWALK', part_ggwalk), ('GGEXT', part_ggext), ('LIMAO', part_limao), ('G0910', part_g0910), ('DOORJOY', part_doorjoy), ('CEIL', part_ceil)):
            if part not in PARTS: continue
            try: await fn(pg, cdp)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
