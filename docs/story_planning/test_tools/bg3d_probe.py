"""BB：BG-3DSHOT-1021——遊戲裡已經有 3D 的地方，拍構圖參考給使用者圖生圖（使用者 10-21：3D 場景的背景要附遊戲截圖）。
[前置] 讀使用者 9/25 存檔；[捷徑] GAME.enter、設時間、設旗標、放玩家位置、轉鏡頭；截圖前關手機、藏 HUD 和玩家。不是 iPhone：只當構圖參考。"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
# (tag, zone, hour, 玩家位置或 None, 旗標)
SHOTS = [('cafe_window', 'cafe', 15.0, (3.2, -2.5), {}), ('cafe_closed', 'cafe', 22.5, (0.0, 0.0), {}),
         ('us_shared_kitchen', 'us_shared', 18.0, None, {'US_DEPARTED': True, 'US_ARRIVED': True}),
         ('us_club_lawn', 'us_outside', 17.5, (-28.0, 10.6), {'US_DEPARTED': True, 'US_ARRIVED': True}),
         ('wenzhou', 'wenzhou', 16.0, None, {}), ('gym_court', 'gym', 19.5, None, {}), ('wancai_lobby', 'wancai', 15.0, None, {}),
         # 2026-10-21 BB（帳號 A）加：ntu_gate（LAWWW 17:4x，BUG-ECON-HOME-SHOTS n255；camp_y1.js 8/22 08:30 集合上遊覽車、8/24 12:30 回到校門）＝公館那一側看校門＋校園裡往外看；
         # 黑畫面盤點（black_bg_audit 18:09）：法學院圖書館（ev_an_sis_meet_lawlib 16 句）、霖澤館一樓（ev_y2_xmas 10 句）
         ('ntu_gate_gg', 'gongguan', 8.5, (0.0, -38.0), {}), ('ntu_gate_campus', 'campus', 8.5, (-112.0, 0.0), {}),
         ('lawlib_night', 'lawlib', 20.0, None, {}), ('linze_1f', 'linze', 15.0, None, {}),
         # BB-C 10-27：第 96 組說好要附截圖的兩張——博雅教學館大教室（可昕來台大聽講座 ev_kexin_lecture_ntu 19:00）、公館騎樓白天（BB_220 ② gongguan_day；店面立面 z=19）
         ('boya_lecture_hall', 'boya', 19.2, None, {}), ('gongguan_day', 'gongguan', 14.0, (10.0, 16.5), {}),
         # BB-C 10-28：BB_221 B 輪三張（putong_empty、boya_201、law_courtyard）＋D-2（us_c_door，AA_516 4-4 C 棟門口、下雨的晚上）
         ('putong_empty', 'putong', 19.0, (-5.4, -4.6), {}), ('boya_201', 'boya', 14.0, (-7.0, -4.8), {}),
         ('law_courtyard', 'campus', 12.0, (60.0, -88.0), {}),
         ('us_c_door', 'us_outside', 22.5, (21.0, 8.0), {'US_DEPARTED': True, 'US_ARRIVED': True})]
# 有寫的才用：第幾層、第一張的鏡頭方向（鏡頭在玩家的 (sin yaw, cos yaw) 那一側；看西＝π/2、看北＝0、看東＝−π/2）、天氣（沒寫＝晴天）
EXTRA = {'putong_empty': {'lv': 0, 'yaw': 1.5708}, 'boya_201': {'lv': 1, 'yaw': 1.5708}, 'law_courtyard': {'lv': 0, 'yaw': 0.0},
         'us_c_door': {'lv': 0, 'yaw': -1.5708, 'wx': 'rain'}}
ONLY = [x for x in os.environ.get('ONLY', '').split(',') if x]
CLEAN = """(on=>{ for(const el of document.body.children){ if(el.tagName==='CANVAS'||el.querySelector('canvas')) continue; if(on){ el.dataset.bbHide=el.style.visibility||'-'; el.style.visibility='hidden'; } else if(el.dataset.bbHide){ el.style.visibility=el.dataset.bbHide==='-'?'':el.dataset.bbHide; delete el.dataset.bbHide; } } const p=GAME.E.player&&GAME.E.player.obj; if(p) p.visible=!on; })"""
async def closephone(pg):
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b&&b.offsetParent) b.click(); })()"); await pg.wait_for_timeout(600)
async def main():
    run = L.Run('bg3d', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.set_viewport_size({'width': 1280, 'height': 720})
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('讀 9/25 存檔')
        for tag, z, h, pos, fl in SHOTS:
            if ONLY and tag not in ONLY: continue
            await pg.evaluate("(fl=>Object.assign(GAME.G.flags,fl))(%s)" % json.dumps(fl))
            await pg.evaluate("(async(z,h)=>{ GAME.G.hour=h; GAME.E.hour=h; await GAME.enter(z); })(%s,%s)" % (json.dumps(z), h))
            await pg.wait_for_timeout(15000); await closephone(pg)
            ex = EXTRA.get(tag, {})
            if pos and 'lv' in ex: await pg.evaluate("(([x,z,lv])=>{ const E=GAME.E, P=E.player; E.placeAt(P,x,z,lv); P.path=null; })(%s)" % json.dumps([pos[0], pos[1], ex['lv']]))
            elif pos: await pg.evaluate("(([x,z])=>{ const o=GAME.E.player.obj; o.position.x=x; o.position.z=z; })(%s)" % json.dumps(pos))
            if tag in EXTRA: await pg.evaluate("(w=>{ GAME.G.weather=w; GAME.E.setWeather(w); })(%s)" % json.dumps(ex.get('wx', 'clear')))
            await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % h); await pg.wait_for_timeout(4000)
            zz = await pg.evaluate("GAME.G.zone"); run.setup('[捷徑] %s → zone %s %.1f' % (tag, zz, h)); print('  ', tag, zz, flush=True)
            y0 = ex['yaw'] if 'yaw' in ex else await pg.evaluate("GAME.E.cam.yaw")
            for k in range(4):
                await pg.evaluate("(y=>{ GAME.E.cam.yaw=y; })(%s)" % (y0 + k * 3.14159 / 2)); await pg.wait_for_timeout(2500); await closephone(pg)
                await pg.evaluate("GAME.E.player.obj.visible=false")   # 2026-10-21：構圖參考不要人物
                await pg.evaluate(CLEAN + "(true)"); await pg.wait_for_timeout(600); await run.shot(pg, '%s_y%d' % (tag, k)); await pg.evaluate(CLEAN + "(false)")
                await pg.evaluate("GAME.E.player.obj.visible=true")
            run.check('%s 進得去' % tag, zz == z, zz)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    run.finish()
asyncio.run(main())
