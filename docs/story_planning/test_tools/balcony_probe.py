"""BB（帳號 A）2026-10-21：ART-BALCONY-POTS 畫面驗收（LAWWW2 d0058082，開發分支 e8b82e4a 整合；LAWWW 16:56 派：有沒有浮空、穿牆、閃面）。
LAWWW2 的六個位置（README：docs/art-rebuild/second_ai/test_shots/balcony_pots_1021/，claude/second-ai-env-art）：
  溫州街 A3（巷口書房樓上）、C2（巷底轉角、陰影面）、W0（西端，17:36 斜陽）；公館 G04、G07、G10（羅斯福路人行道往上看）。
每個位置拍：
  ① LAWWW2 的角度（眼睛高度 1.6 m 往上看陽台；玩家藏起來）＋同一個角度鏡頭偏 3 cm 再一張（兩張比對看閃不閃）；
  ② 從陽台前面、比陽台高 1.3 m 往下看（看得到花架的腳有沒有站在陽台地上、花架有沒有插進欄杆或牆＝浮空、穿牆）；
  ③ 斜 45° 兩邊、離陽台 7 m 的眼睛高度（走過來的路人看到的）；
  ④ 一般遊戲鏡頭：玩家站在那個位置、鏡頭在玩家背後（背對建築那一側）、進區域時的距離和俯角＋拉到最近——玩家平常玩看不看得到。
另外 A3 晚上 20:30 一張（LAWWW2 沒拍晚上）。
[捷徑] 讀 9/25 存檔（關掉條件事件）、GAME.enter、設時間、搬玩家、藏玩家、劇情鏡頭。不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
用法：LW_TESTS=<開發分支>/tests python3 balcony_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, math, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SPOTS = [   # 名稱、區域、時間、玩家站的位置、LAWWW2 的鏡頭位置、看的點（shots.json、shots_gongguan.json）
    ('A3', 'wenzhou', 15.0, (14.2, 1.0), (14.2, 1.6, -0.2), (14.2, 4.9, 4.6)),
    ('C2', 'wenzhou', 15.0, (50.5, 13.0), (49.8, 1.6, 13.0), (55.0, 4.9, 13.0)),
    ('W0', 'wenzhou', 17.6, (-31.5, -2.7), (-31.0, 1.6, -2.7), (-36.6, 4.9, -2.7)),
    ('G04', 'gongguan', 15.0, (-17.1, 17.6), (-18.6, 1.6, 13.8), (-18.6, 5.6, 18.6)),
    ('G07', 'gongguan', 15.0, (12.0, 17.6), (10.5, 1.6, 13.8), (10.5, 5.6, 18.6)),
    ('G10', 'gongguan', 15.0, (38.6, 17.6), (37.1, 1.6, 13.8), (37.1, 5.6, 18.6)),
]


async def enter(pg, z, h):
    await pg.evaluate("(async(z,h)=>{ GAME.G.hour=h; GAME.E.hour=h; await GAME.enter(z); })(%s,%s)" % (json.dumps(z), h))
    await pg.wait_for_timeout(20000); await sethour(pg, h)


async def sethour(pg, h):
    await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; if(GAME.E.applyTime) GAME.E.applyTime(h); })(%s)" % h); await pg.wait_for_timeout(1500)


async def closephone(pg):
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b&&b.offsetParent) b.click(); })()")
    await pg.wait_for_timeout(500)


async def cine(pg, run, tag, pos, look):
    await closephone(pg)
    await pg.evaluate("(([p,l])=>{ GAME.E.cinematic(new THREE.Vector3(...p), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })(%s)" % json.dumps([list(pos), list(look)]))
    await pg.wait_for_timeout(2500); await run.shot(pg, tag); await pg.evaluate("GAME.E.endCinematic()"); await pg.wait_for_timeout(600)


async def put(pg, x, z):
    return await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); try{ GAME.E.unstick&&GAME.E.unstick(P,8); }catch(e){} return [+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)]; })(%s)" % json.dumps([x, z]))


async def main():
    run = L.Run('balcony', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base), quiet_events=True); await pg.wait_for_timeout(5000); run.setup('讀 9/25 存檔（關掉條件事件，只看場景）')
        cur = None; d0 = p0 = None
        for nm, z, h, (px, pz), cpos, look in SPOTS:
            try:
                if z != cur:
                    await enter(pg, z, h); cur = z; run.setup('[捷徑] GAME.enter(%s) %.1f' % (z, h))
                    d0, p0 = await pg.evaluate("[GAME.E.cam.distTarget, GAME.E.cam.pitch]")
                await sethour(pg, h)
                at = await put(pg, px, pz); await pg.evaluate("GAME.E.player.obj.visible=false"); print('   %s 玩家（藏起來）放到' % nm, at, flush=True)
                await cine(pg, run, '%s_1_lawww2' % nm, cpos, look)
                await cine(pg, run, '%s_1_lawww2_3cm' % nm, (cpos[0] + 0.03, cpos[1] + 0.02, cpos[2] + 0.03), look)
                dx, dz = look[0] - cpos[0], look[2] - cpos[2]; n = math.hypot(dx, dz) or 1; dx, dz = dx / n, dz / n   # 從街上往陽台的方向
                await cine(pg, run, '%s_2_above' % nm, (look[0] - dx * 2.6, look[1] + 1.3, look[2] - dz * 2.6), look)
                for sgn, side in ((1, 'L'), (-1, 'R')):
                    a = sgn * math.pi / 4; rx, rz = dx * math.cos(a) - dz * math.sin(a), dx * math.sin(a) + dz * math.cos(a)
                    await cine(pg, run, '%s_3_oblique_%s' % (nm, side), (look[0] - rx * 7, 1.6, look[2] - rz * 7), look)
                await pg.evaluate("GAME.E.player.obj.visible=true")
                yaw = math.atan2(-dx, -dz)   # 鏡頭在玩家的 (sin yaw, cos yaw) 那一側＝背對建築
                for tag, d in (('default', d0), ('closest', 2.2)):
                    await pg.evaluate("(([y,d,p])=>{ const C=GAME.E.cam; C.yaw=y; C.distTarget=d; C.pitch=p; C.manualT=60; })(%s)" % json.dumps([yaw, d, p0]))
                    await pg.wait_for_timeout(2500); await closephone(pg); await run.shot(pg, '%s_4_player_%s' % (nm, tag))
                if nm == 'A3':
                    await sethour(pg, 20.5); await pg.evaluate("GAME.E.player.obj.visible=false")
                    await cine(pg, run, 'A3_5_night_lawww2', cpos, look); await pg.evaluate("GAME.E.player.obj.visible=true"); await sethour(pg, h)
            except Exception as e:
                print('  ! %s 失敗：' % nm, e, flush=True); run.check('%s 跑完' % nm, False, str(e)[:200])
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    run.finish()
asyncio.run(main())
