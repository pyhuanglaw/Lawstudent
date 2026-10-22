"""BB（帳號 A）2026-10-22：ART-ECON-3D-GAP-1021 第二批畫面（READY_FOR_ART_REVIEW；BB 只看畫面有沒有壞、和 LAWWW2 的截圖對照，不標 ART_APPROVED——建築只有使用者能標）。
  DOORS_CMP   四棟拱廊大門（總圖、行政大樓、文學院、校史館）雙開玻璃木門＋博雅東側一樓玻璃帶（LAWWW2 223252e5 → 開發分支 7b4fb34b）：
              和 LAWWW2 同一個鏡頭（docs/art-rebuild/second_ai/test_shots/campus_doors_1021/shots_doors2_after.json、shots_econfix2_after.json 的 cam pos／look，1280×720、藏玩家、不顯示 HUD），
              15:00、20:00 各一張，對照 LAWWW2 的 cmp_*_door_15/20.webp、cmp_boya_east_15/20.webp 右半邊。看：門洞不再是全黑長方形、20:00 玻璃透出門廳的光、門縫和門底沒有漏出天空或草地（一條藍線、綠線）、
              沒有破面、閃爍、浮空。畫面中間那一塊的平均亮度、明暗差寫進 JSON（只是參考，不當判定）。
  DOORS_PLAYER 手機橫向（844×390、HUD 照常）：玩家自己走到每一扇門前（照遊戲找路，走不到才搬過去並註明），鏡頭在玩家背後朝門，15:00、20:00 各一張——玩家實際會看到的樣子。
  DORM412     經濟系那一年的宿舍 412（第 4 個參數＝經濟系存檔快照；沒給就 NOT TESTED）：洗手間牆磚、地磚補光（e8c4ce7a，dorm_seethru.diff 第三版）。
              檢查 dorm_bath_tile、dorm_bath_floor 兩個材質有補光（TK.bounce 的 userData.bounce）；從房間看（玩家在房間中間、鏡頭在門那一側，正面牆淡出時看得到右邊洗手間）、洗手間裡面，15:00、21:00。
  DORM203     大一 203（使用者存檔 9/25 15:00）：上舖網點透空（區域實體 z.seeThru＝true、seethru_ 材質有 patch）。照玩家：走到自己的書桌按「坐在書桌前」→ 鏡頭轉到北邊（被上舖擋住）；
              再站到 R2 書桌旁 (1.0, 0.25) 鏡頭在東、等 6 秒。每個角度拍兩張：透空開著、（測試暫時）把 E.zone.seeThru 關掉——兩張在玩家周圍的像素差＝透空真的有作用。
  CAFE        兩點半 Café（16:00、20:00）：吊燈電線（seethru_cafe_cord）擋住玩家時變成網點；地板不再是鏡面（粗糙度 0.78，cafe_interior.glb 2a682738）。
              找到電線的位置，玩家站在電線前 2.4 m、鏡頭在電線那一側（電線在鏡頭和玩家中間），透空開／關各一張比對；地板：記下所有粗糙度 < 0.3 的材質名稱。
【前置／捷徑】讀檔改時間、地點；DOORS_CMP、透空的鏡頭用遊戲的演出鏡頭（E.cinematic）或跟隨鏡頭參數擺好（拍照模式）；透空「關掉」那張是測試暫時改 E.zone.seeThru，拍完改回來。
Playwright＋SwiftShader，不是 iPhone；DOORS_CMP 是 1280×720 桌機視窗（和 LAWWW2 的對照圖同尺寸），其他是手機橫向 844×390。
用法：LW_TESTS=<開發分支>/tests SCEN=DOORS_CMP,... python3 art_gap2_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json> [經濟系快照.json]"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
ECON = sys.argv[4] if len(sys.argv) > 4 else None
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or None
def say(*a): print(' '.join(str(x) for x in a), flush=True)
HIDE_HUD = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}"
# LAWWW2 的鏡頭（shots_doors2_after.json：文學院、行政大樓、校史館正面；shots_econfix2_after.json：總圖、博雅東側）：名稱 → (玩家位置, 鏡頭位置, 看的點, LAWWW2 對照圖)
CMP = {'arts': ((-60, -10), (-38, 1.7, -22.4), (-38, 1.6, -27.6), 'cmp_arts_door'),
       'admin': ((-60, 10), (-38, 1.7, 22.4), (-38, 1.6, 27.6), 'cmp_admin_door'),
       'hist': ((-60, -10), (-77, 1.7, -18.6), (-77, 1.6, -23.6), 'cmp_hist_door'),
       'library': ((70, 10), (87.4, 1.8, -3.4), (90.2, 1.5, 0.3), 'cmp_library_door'),
       'boya_east': ((-10, -70), (-4, 2.6, -75), (-21, 3.0, -83), 'cmp_boya_east')}
ASSET = {'arts': 'bldg.campus_arts', 'admin': 'bldg.campus_admin', 'hist': 'bldg.campus_hist', 'library': 'bldg.campus_library', 'boya_east': 'bldg.campus_boya'}
STATE = """(()=>{ const G=GAME.G, P=GAME.E.player.obj.position; const d=CALENDAR.dateOf(G.day); return {key:d.key, h:+(+G.hour).toFixed(2), zone:G.zone, x:+P.x.toFixed(2), z:+P.z.toFixed(2)}; })()"""


def door_stand(name):
    """玩家站的位置與跟隨鏡頭的 yaw：門前（看的點往鏡頭那一側退）2.6 m；鏡頭在玩家背後（yaw：鏡頭在玩家的 (sin yaw, cos yaw) 那一側）"""
    _, cp, lk, _ = CMP[name]
    dx, dz = cp[0] - lk[0], cp[2] - lk[2]; n = math.hypot(dx, dz) or 1; ux, uz = dx / n, dz / n
    back = 2.6 if name != 'boya_east' else 9.0
    return (round(lk[0] + ux * back, 2), round(lk[2] + uz * back, 2)), math.atan2(ux, uz)


def stats(path, box=None):
    """截圖中間那一塊（或 box）的平均亮度、標準差（0～255）"""
    try:
        from PIL import Image, ImageStat
        im = Image.open(path).convert('L'); W, H = im.size
        b = box or (int(W * 0.35), int(H * 0.3), int(W * 0.65), int(H * 0.85))
        st = ImageStat.Stat(im.crop(b)); return {'mean': round(st.mean[0], 1), 'std': round(st.stddev[0], 1), 'box': b}
    except Exception as e: return {'err': str(e)[:120]}


def diff_around(a, b, cx, cy, hw=110, hh=130):
    """兩張截圖在 (cx, cy) 周圍的平均像素差（0～255）"""
    try:
        from PIL import Image, ImageChops, ImageStat
        A = Image.open(a).convert('L'); B = Image.open(b).convert('L'); W, H = A.size
        box = (max(0, int(cx - hw)), max(0, int(cy - hh)), min(W, int(cx + hw)), min(H, int(cy + hh)))
        d = ImageChops.difference(A.crop(box), B.crop(box)); return {'diff': round(ImageStat.Stat(d).mean[0], 2), 'box': box}
    except Exception as e: return {'err': str(e)[:120]}


async def load_at(pg, base, zone, h, pos=None, extra=None):
    st = json.loads(json.dumps(base)); G = st.get('G', st)
    G.update({'zone': zone, 'hour': h, 'pos': ({'x': pos[0], 'z': pos[1], 'yaw': 0} if pos else None)})
    if extra: G.update(extra)
    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(6000)


async def set_hour(pg, h):
    await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; GAME.E.applyTime(h); })(%s)" % h); await pg.wait_for_timeout(2500)


async def put(pg, x, z):
    return await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); try{ GAME.E.unstick&&GAME.E.unstick(P,8); }catch(e){} return [+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)]; })(%s)" % json.dumps([x, z]))


async def cine(pg, pos, look):
    await pg.evaluate("(([p,l])=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); if(E.snapCinematic) E.snapCinematic(); })(%s)" % json.dumps([pos, look]))


async def follow(pg, yaw, dist=None, pitch=None):
    await pg.evaluate("(([y,d,p])=>{ const E=GAME.E, C=E.cam; if(E.endCinematic&&C.mode==='cinematic') E.endCinematic(); C.mode='follow'; C.yaw=y; if(d!=null){ C.distTarget=d; } if(p!=null) C.pitch=p; C.manualT=60; })(%s)" % json.dumps([yaw, dist, pitch]))


async def screen_of_player(pg):
    return await pg.evaluate("(()=>{ const E=GAME.E, P=E.player.obj.position; const v=new THREE.Vector3(P.x,P.y+0.9,P.z).project(E.camera); return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight,v.z]; })()")


async def close_panels(pg, cdp):
    try:
        if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp)
    except Exception: pass


# ---------------------------------------------------------------- 情境
async def s_doors_cmp(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=L.ARGS)
    ctx = await b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1); pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await load_at(pg, base, 'campus', 15.0, CMP['arts'][0])
        run.setup('[前置／捷徑] %s：使用者存檔改到校園 15:00（quiet_events）；1280×720 桌機視窗；藏玩家、不顯示 HUD；鏡頭照 LAWWW2 的 cam pos／look（演出鏡頭）' % sid)
        await pg.add_style_tag(content=HIDE_HUD); await pg.evaluate("GAME.E.player.obj.visible=false")
        for h in (15.0, 20.0):
            await set_hour(pg, h)
            for name, (pp, cp, lk, ref) in CMP.items():
                await put(pg, *pp); await pg.wait_for_timeout(1500); await cine(pg, list(cp), list(lk))
                for _ in range(20):   # 正式模型是 lazy：等那一棟載入
                    if await pg.evaluate("!!(ASSETS.cache&&ASSETS.cache[%s])" % json.dumps(ASSET[name])): break
                    await pg.wait_for_timeout(1000)
                await pg.wait_for_timeout(5000)
                loaded = await pg.evaluate("!!(ASSETS.cache&&ASSETS.cache[%s])" % json.dumps(ASSET[name]))
                f = await run.shot(pg, '%s_%s_%02d' % (sid, name, int(h)))
                rec = {'file': os.path.basename(f), 'hour': h, 'cam': cp, 'look': lk, 'model_loaded': loaded, 'stats': stats(f),
                       'compare_with': 'LAWWW2 docs/art-rebuild/second_ai/test_shots/campus_doors_1021/%s_%02d.webp（右半邊＝修改後）' % (ref, int(h)),
                       'look_for': '門洞不是全黑長方形、上半玻璃（%s）、門縫／門底沒有藍線綠線、沒有破面閃爍浮空' % ('反光一點天光' if h < 18 else '透出門廳的暖光') if name != 'boya_east' else '東側一樓 13 m 玻璃帶（直櫺、橫櫺）、%s' % ('白天玻璃（LAWWW2：偏黑）' if h < 18 else '晚上亮')}
                res['%s_%02d' % (name, int(h))] = rec; say('   %s %s %02d:00 %s' % (sid, name, int(h), json.dumps(rec, ensure_ascii=False)[:300]))
                run.check('%s：%s %02d:00 正式模型（%s）有載入' % (sid, name, int(h), ASSET[name]), loaded, '')
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def s_doors_player(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await load_at(pg, base, 'campus', 15.0, CMP['arts'][0])
        run.setup('[前置] %s：使用者存檔改到校園 15:00（quiet_events）；手機橫向；之後照玩家走到每一扇門前（走不到才搬過去，註明）' % sid)
        for h in (15.0, 20.0):
            await set_hour(pg, h)
            for name in CMP:
                (sx, sz), yaw = door_stand(name); pp = CMP[name][0]
                await put(pg, *pp); await pg.wait_for_timeout(1200)   # 每一扇門都從 LAWWW2 拍照時玩家站的地方出發（短程，照遊戲找路走到門前）
                walked = await L.go_to(pg, cdp, run, sx, sz, 0.9, name + ' 門前', max_s=150)
                at = await pg.evaluate(STATE)
                if not walked: at2 = await put(pg, sx, sz); run.note('%s：%s 走不到門前 (%.1f, %.1f)，搬過去 %s' % (sid, name, sx, sz, at2))
                await close_panels(pg, cdp); await follow(pg, yaw); await pg.wait_for_timeout(5000)
                f = await run.shot(pg, '%s_%s_%02d' % (sid, name, int(h)))
                res['%s_%02d' % (name, int(h))] = {'file': os.path.basename(f), 'walked': walked, 'at': at, 'stand': [sx, sz], 'yaw': round(yaw, 3), 'stats': stats(f)}
                run.check('%s：%s %02d:00 玩家照找路走到門前' % (sid, name, int(h)), walked, json.dumps(at, ensure_ascii=False))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


MATS = """((re)=>{ const R=new RegExp(re), out={}; GAME.E.scene.traverse(o=>{ if(!o.isMesh||!o.material) return; for(const m of [].concat(o.material)){ if(!m||!R.test(m.name||'')) continue; const k=m.name; const r=out[k]||(out[k]={n:0,bounce:false,seeThrough:false,patched:false,rough:null}); r.n++; r.bounce=r.bounce||!!(m.userData&&m.userData.bounce); r.seeThrough=r.seeThrough||!!(m.userData&&m.userData.seeThrough); r.patched=r.patched||!!(m.userData&&m.userData._st); r.rough=m.roughness!=null?+m.roughness.toFixed(3):null; } }); return out; })"""
ROUGH = """(()=>{ const out={}; GAME.E.scene.traverse(o=>{ if(!o.isMesh||!o.material) return; for(const m of [].concat(o.material)){ if(m&&m.roughness!=null&&m.roughness<0.3&&!m.transparent) out[m.name||'(沒名字)']=+m.roughness.toFixed(3); } }); return out; })()"""


async def seethru_pair(pg, cdp, run, sid, tag):
    """同一個角度：透空開著一張、（測試暫時）關掉一張；回傳兩張與玩家周圍的像素差"""
    await pg.wait_for_timeout(1500); on = await run.shot(pg, '%s_%s_seethru_on' % (sid, tag)); sp = await screen_of_player(pg)
    await pg.evaluate("GAME.E.zone.seeThru=false"); await pg.wait_for_timeout(1500); off = await run.shot(pg, '%s_%s_seethru_off' % (sid, tag))
    await pg.evaluate("GAME.E.zone.seeThru=true"); await pg.wait_for_timeout(800)
    d = diff_around(on, off, sp[0], sp[1])
    return {'on': os.path.basename(on), 'off': os.path.basename(off), 'player_screen': [round(sp[0]), round(sp[1]), round(sp[2], 3)], 'diff': d}


async def s_dorm412(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    if not ECON:
        run.note('%s：NOT TESTED——沒有給經濟系存檔快照（第 4 個參數）' % sid); res['skip'] = '沒有經濟系快照'; return
    econ = json.load(open(ECON, encoding='utf-8'))
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await load_at(pg, econ, 'dorm', 15.0, (0, 0.6))
        run.setup('[前置／捷徑] %s：經濟系存檔快照（%s）改到宿舍 412、15:00（quiet_events）；玩家放房間中間；鏡頭用跟隨鏡頭的 yaw／演出鏡頭擺好' % (sid, os.path.basename(ECON)))
        for _ in range(30):
            if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.dormRoot)"): break
            await pg.wait_for_timeout(1000)
        info = await pg.evaluate("(()=>{ const z=GAME.E.zone; return {stage:GAME.G.stage, set:z&&z.dormSetKey, model:!!(z&&z.dormRoot), seeThru:!!(z&&z.seeThru)}; })()"); res['info'] = info
        mats = await pg.evaluate(MATS + "('^(seethru_)?dorm_bath_|^seethru_')"); res['mats'] = mats
        run.check('%s：經濟系那一年是 412、正式模型載入' % sid, info.get('set', '').startswith('412') and info.get('model'), json.dumps(info, ensure_ascii=False))
        run.check('%s：洗手間牆磚、地磚有補光（dorm_bath_tile、dorm_bath_floor 的 userData.bounce）' % sid,
                  all((mats.get(k) or {}).get('bounce') for k in ('dorm_bath_tile', 'dorm_bath_floor')), json.dumps({k: v for k, v in mats.items() if 'bath' in k}, ensure_ascii=False))
        run.check('%s：宿舍區域實體 z.seeThru＝true（e8c4ce7a 以前寫在定義上、引擎看不到）' % sid, info.get('seeThru'), json.dumps(info, ensure_ascii=False))
        for h in (15.0, 21.0):
            await set_hour(pg, h); await put(pg, 0, 0.6); await close_panels(pg, cdp)
            for tag, yaw in (('room_front', 0.0), ('room_front_right', 0.55)):
                await follow(pg, yaw); await pg.wait_for_timeout(4000)
                f = await run.shot(pg, '%s_%s_%02d' % (sid, tag, int(h))); res['%s_%02d' % (tag, int(h))] = {'file': os.path.basename(f), 'stats': stats(f, None), 'look_for': '右邊的洗手間牆是白色磁磚、地上花磚是亮的（不是一整片暗灰褐）'}
            await cine(pg, [1.15, 1.7, 1.75], [2.75, 0.7, 3.25]); await pg.wait_for_timeout(3000)
            f = await run.shot(pg, '%s_bath_inside_%02d' % (sid, int(h))); res['bath_inside_%02d' % int(h)] = {'file': os.path.basename(f), 'stats': stats(f), 'look_for': '洗手間裡面：白色牆磚、地磚，不是暗灰褐'}
            await pg.evaluate("GAME.E.endCinematic&&GAME.E.endCinematic()")
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def s_dorm203(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await load_at(pg, base, 'dorm', 15.0)
        run.setup('[前置] %s：使用者存檔 9/25 宿舍 203、15:00（quiet_events）；之後照玩家走到書桌按「坐在書桌前」；鏡頭方向用跟隨鏡頭的 yaw 擺好；透空「關掉」那張是測試暫時改 E.zone.seeThru' % sid)
        for _ in range(30):
            if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.dormRoot)"): break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(3000)
        info = await pg.evaluate("(()=>{ const z=GAME.E.zone; return {set:z&&z.dormSetKey, model:!!(z&&z.dormRoot), seeThru:!!(z&&z.seeThru)}; })()"); res['info'] = info
        mats = await pg.evaluate(MATS + "('^seethru_')"); res['mats'] = mats
        run.check('%s：宿舍區域實體 z.seeThru＝true' % sid, info.get('seeThru'), json.dumps(info, ensure_ascii=False))
        run.check('%s：上舖的 seethru_ 材質都有 patch（userData._st）' % sid, bool(mats) and all(v['patched'] for v in mats.values()), json.dumps(mats, ensure_ascii=False)[:400])
        desk = await L.find_it(pg, '坐在書桌前'); res['desk'] = desk
        seated = False; menu = []
        if desk and await L.go_to(pg, cdp, run, desk['x'], desk['z'], desk['r'] * 0.8, '書桌'):
            s = await L.state(pg)
            if s['interact'].startswith('坐在書桌前'):
                await L.tap(pg, cdp, '#interact')
                for _ in range(20):   # 坐下以後是座位選單（坐一下、讀書、趴著睡、起身）：選單開著的時候人是坐著的
                    menu = await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>b.textContent.trim()); })()")
                    if menu: break
                    await pg.wait_for_timeout(700)
                seated = any(m.startswith('起身') for m in menu)
            else: run.note('%s：互動按鈕是「%s」' % (sid, s['interact']))
        res['seated'] = seated; res['seat_menu'] = menu
        run.check('%s：照玩家坐到自己的書桌前（座位選單有「起身」）' % sid, seated, json.dumps({'desk': desk, 'menu': menu}, ensure_ascii=False))
        await follow(pg, math.pi); await pg.wait_for_timeout(4000)
        await pg.add_style_tag(content="#choices,#dlg{visibility:hidden!important}")   # 拍照時先把座位選單藏起來（人還坐著）
        res['seated_camN'] = await seethru_pair(pg, cdp, run, sid, 'seated_camN')
        await pg.evaluate("document.querySelectorAll('style').forEach(st=>{ if(st.textContent.indexOf('#choices,#dlg{visibility:hidden')>=0) st.remove(); })")
        k = next((i for i, m in enumerate(menu) if m.startswith('起身')), None)
        if k is not None:
            c = await pg.evaluate("(i=>{ const e=document.querySelectorAll('#choices button')[i]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
            if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        # R2 書桌旁、鏡頭在東、6 秒後（LAWWW2 indoor_seethru_1022 第二張）
        await drive_off(pg, cdp); await put(pg, 1.0, 0.25); await follow(pg, math.pi / 2); await pg.wait_for_timeout(6000)
        res['r2_camE'] = await seethru_pair(pg, cdp, run, sid, 'r2_camE')
        for k in ('seated_camN', 'r2_camE'):
            d = (res[k].get('diff') or {}).get('diff')
            run.check('%s：%s 透空開／關兩張在玩家周圍有差（>2/255＝網點透空有作用；看圖：床板在人周圍變網點）' % (sid, k), d is not None and d > 2, json.dumps(res[k], ensure_ascii=False))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def drive_off(pg, cdp):
    """還有座位選單（坐著）的話按「起身」"""
    k = await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return -1; return [...ch.querySelectorAll('button')].findIndex(b=>b.textContent.trim().startsWith('起身')); })()")
    if k is not None and k >= 0:
        c = await pg.evaluate("(i=>{ const e=document.querySelectorAll('#choices button')[i]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
        await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)


CORDS = """(()=>{ const out=[]; const bb=new THREE.Box3(); GAME.E.scene.traverse(o=>{ if(!o.isMesh||!o.material) return; if(![].concat(o.material).some(m=>m&&/seethru_cafe_cord/.test(m.name||''))) return; bb.setFromObject(o); out.push({x:+((bb.min.x+bb.max.x)/2).toFixed(2), z:+((bb.min.z+bb.max.z)/2).toFixed(2), y0:+bb.min.y.toFixed(2), y1:+bb.max.y.toFixed(2)}); }); return out; })()"""


async def s_cafe(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await load_at(pg, base, 'cafe', 16.0)
        run.setup('[前置] %s：使用者存檔改到兩點半 Café 16:00（quiet_events）；玩家搬到電線前、鏡頭 yaw 擺在電線那一側；透空「關掉」那張是測試暫時改 E.zone.seeThru' % sid)
        for _ in range(30):
            if await pg.evaluate("!!(ASSETS.cache&&ASSETS.cache['bldg.cafe_interior'])"): break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(4000)
        info = await pg.evaluate("(()=>{ const z=GAME.E.zone; return {seeThru:!!(z&&z.seeThru), model:!!(ASSETS.cache&&ASSETS.cache['bldg.cafe_interior'])}; })()"); res['info'] = info
        mats = await pg.evaluate(MATS + "('seethru_cafe_cord')"); res['mats'] = mats; rough = await pg.evaluate(ROUGH); res['rough_lt_0_3'] = rough
        run.check('%s：Café 區域實體 z.seeThru＝true、正式模型載入' % sid, info.get('seeThru') and info.get('model'), json.dumps(info, ensure_ascii=False))
        run.check('%s：電線材質 seethru_cafe_cord 有 patch（userData._st）' % sid, bool(mats) and all(v['patched'] for v in mats.values()), json.dumps(mats, ensure_ascii=False))
        run.check('%s：地板不是鏡面（名字有 floor／screed 的材質粗糙度都 ≥ 0.3；BUG-CAFE-FLOOR-MIRROR-1021）' % sid, not any(k for k in rough if any(w in k.lower() for w in ('floor', 'screed'))), json.dumps(rough, ensure_ascii=False))
        cords = await pg.evaluate(CORDS); res['cords'] = cords
        if not cords: raise RuntimeError('找不到電線（seethru_cafe_cord）')
        for h in (16.0, 20.0):
            await set_hour(pg, h)
            for i, c in enumerate(cords[:2]):
                for d in (1.8, 2.6):
                    yaw = 0.0   # 鏡頭在電線那一側：玩家站在電線的 −z 方向 d 公尺，鏡頭在 +z（yaw 0）
                    at = await put(pg, c['x'], c['z'] - d); await close_panels(pg, cdp); await follow(pg, yaw); await pg.wait_for_timeout(4000)
                    pair = await seethru_pair(pg, cdp, run, sid, 'cord%d_d%.1f_%02d' % (i, d, int(h)))
                    pair['at'] = at; res['cord%d_d%.1f_%02d' % (i, d, int(h))] = pair
                    say('   %s 電線 %d 距離 %.1f %02d:00 %s' % (sid, i, d, int(h), json.dumps(pair, ensure_ascii=False)[:300]))
        ds = [v['diff'].get('diff') for k, v in res.items() if k.startswith('cord') and isinstance(v, dict) and isinstance(v.get('diff'), dict) and v['diff'].get('diff') is not None]
        run.check('%s：至少一個角度透空開／關在玩家周圍有差（>2/255；看圖：電線經過人身上那段變淡點線）' % sid, any(x > 2 for x in ds), json.dumps(ds))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


ORDER = ['DOORS_CMP', 'DOORS_PLAYER', 'DORM412', 'DORM203', 'CAFE']
FN = {'DOORS_CMP': s_doors_cmp, 'DOORS_PLAYER': s_doors_player, 'DORM412': s_dorm412, 'DORM203': s_dorm203, 'CAFE': s_cafe}


async def main():
    run = L.Run('art_gap2', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'art_gap2.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
