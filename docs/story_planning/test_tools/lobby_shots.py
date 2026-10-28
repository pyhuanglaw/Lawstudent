"""BB-C 10-28：霖澤館一樓大廳第二版（ac2ab0ae9）＋頂點色材質（2c338366d，LOBBY-VC-1028）的畫面——LAWWW-C 09:32 v9.10.13 發布門檻 ③。
入口、中間、樓梯 × 白天 13:00、晚上 20:30，各拍一張（遊戲鏡頭）；看有沒有破圖、黑面。不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
做法：【前置】使用者存檔改到霖澤館一樓（linze）；【捷徑】把玩家放到三個位置、直接設鏡頭方向（E.cam.yaw／pitch／distTarget）——只為了每一版同一個角度比較；
  等正式模型掛上（GAME.E.zone.formal＝true；false＝GLB 沒載到、看到的是程序化備用）再拍。
  每張算：畫面中間（避開 HUD）很黑的像素比例（max(R,G,B)<14）、平均亮度——兩版對照，黑面會讓比例跳高。
用法：LW_TESTS=<工作樹>/tests python3 lobby_shots.py '<URL>/index.html' <輸出資料夾> [存檔.json]；TAG＝檔名前綴（例：v91012、head）"""
import os, sys, json, asyncio, copy, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
from PIL import Image
URL, OUT = sys.argv[1], sys.argv[2]; TAG = os.environ.get('TAG', 'x')
SAVEF = sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad/bbtest/p0an/user_day14.json'
SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE)
J = lambda o: json.dumps(o, ensure_ascii=False)
# (名稱, 玩家 x, z, 鏡頭 yaw（鏡頭在玩家的 (sin yaw, cos yaw) 那一側）, pitch, 距離)
VIEWS = [('entrance', 6.6, 4.0, math.pi / 2, 0.22, 6.0),    # 入口進來，往西看整個大廳
         ('middle', 0.5, 1.0, 0.0, 0.3, 6.5),               # 大廳中間，往北看（電梯、公布欄那一側）
         ('middle_w', 0.5, 1.0, math.pi / 2, 0.3, 6.5),     # 大廳中間，往西看樓梯
         ('stairs', -6.6, 5.9, 0.0, 0.35, 5.5)]             # 樓梯底，往北看兩跑樓梯
HOURS = [('day', 13.0), ('night', 20.5)]


def dark_stats(path):
    im = Image.open(path).convert('RGB'); w, h = im.size
    box = (int(w * 0.2), int(h * 0.36), int(w * 0.82), int(h * 0.86))   # 避開左上的文字列、右邊按鈕、左下搖桿
    c = im.crop(box); px = list(c.getdata()); n = len(px)
    dark = sum(1 for p in px if max(p) < 14); lum = sum(0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2] for p in px) / n
    return round(dark / n, 4), round(lum, 1)


async def main():
    run = L.Run('lobby_' + TAG, OUT); os.makedirs(OUT, exist_ok=True); res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        for hn, hh in HOURS:
            st = copy.deepcopy(SAVE); st.pop('_stuck', None)
            st.update(zone='linze', hour=hh, pos={'x': 6.6, 'z': 4.0, 'yaw': -1.5708, 'lv': 0, 'y': 0})
            st['invites'] = [v for v in st.get('invites', []) if v.get('state') != 'going']
            await L.load_state(pg, st, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(5000)
            await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
            ok = False
            for _ in range(90):
                ok = await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)")
                if ok: break
                await pg.wait_for_timeout(1000)
            run.check('%s：正式模型掛上了（zone.formal）' % hn, ok)
            run.setup('[前置] 使用者存檔改到霖澤館一樓 %.1f 時；關掉條件事件' % hh)
            for vn, x, z, yaw, pitch, dist in VIEWS:
                await pg.evaluate("""(([x,z,yaw,pitch,dist,h])=>{ const E=GAME.E, P=E.player; E.placeAt(P,x,z,0); P.path=null; E.cam.yaw=yaw; E.cam.pitch=pitch; E.cam.distTarget=dist; E.cam.dist=dist; GAME.G.hour=h; E.hour=h; })""", [x, z, yaw, pitch, dist, hh])
                await pg.wait_for_timeout(4500)
                path = os.path.join(OUT, '%s_%s_%s.png' % (TAG, hn, vn)); await pg.screenshot(path=path)
                dr, lum = dark_stats(path); res['%s_%s' % (hn, vn)] = {'dark': dr, 'lum': lum}
                info = await pg.evaluate("(()=>{ const r=GAME.E.renderer||(GAME.E.R); const i=r&&r.info; return i?{calls:i.render.calls,tris:i.render.triangles}:null; })()")
                run.note('%s %s：黑 %.2f%%、平均亮度 %s、%s → %s' % (hn, vn, dr * 100, lum, J(info), path))
            run.setup('[捷徑] 玩家放到四個位置、直接設鏡頭（同一個角度比較兩版）')
        json.dump(res, open(os.path.join(OUT, '%s_stats.json' % TAG), 'w'), ensure_ascii=False, indent=1)
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'TAG', TAG)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
