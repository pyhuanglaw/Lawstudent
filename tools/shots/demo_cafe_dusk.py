"""雙人整合示範畫面（參考圖 07：祐廷＋沈以安在兩點半 Café 前，傍晚 17:30）：實際遊戲畫面，不是模型預覽。
兩人從 Café 門口沿著紅磚人行道並肩往鏡頭走（祐廷靠店面那一邊、沈以安在外側，同參考圖）；
遊戲照常跑（日夜光線、路人、店家燈光都是遊戲本身的），拍照那一格暫停遊戲、手動擺鏡頭（胸口高度）。
人物用網址參數決定：加 ?blchar 是 Blender 版（祐廷、沈以安、林芷若），不加是預設的 VRoid 加工版。
用法：python3 tools/shots/demo_cafe_dusk.py <URL> <輸出資料夾> [時間，預設 17.5]（環境變數 DEMO_DIR=south（預設）／north 換方向）
輸出：<輸出>/cafe_dusk_{medium,wide,side}.png、<輸出>/DEMO_cafe_dusk.jpg（左：參考圖 07；右：遊戲畫面）"""
import asyncio, json, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

URL, OUT = sys.argv[1:3]; HOUR = float(sys.argv[3]) if len(sys.argv) > 3 else 17.5
NORTH = os.environ.get('DEMO_DIR', 'south') == 'north'    # south（預設）：兩人往 -z 走、鏡頭往 +z 看，Café 在左邊（同參考圖 07），街底是路口的施工柵欄；north：往 +z 走、鏡頭往北看（兩人步伐不同、沒有並肩，背景單調，不建議）
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}"
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
# 紅磚人行道 x 53.35–55.25、z -6.7–6.7（zones3d.js 溫州街）；Café 店面在 x=55.4（面朝 -x）
if NORTH:   # 祐廷靠店面（+x）、沈以安在外側；鏡頭在兩人前方（+z）往北看：Café 在畫面右邊
    START = {'yt': (54.55, -5.6), 'an': (53.85, -6.0)}; GOAL = {'yt': (54.55, 5.2), 'an': (53.85, 4.8)}
    SHOTS = [('medium', -1.4, (54.0, 1.42, 2.1), (54.2, 1.2, -4.0)), ('wide', 0.4, (52.9, 1.6, 7.4), (54.4, 1.0, -2.0)), ('side', 2.4, (50.6, 1.45, 3.2), (54.3, 1.05, 2.2))]
    AHEAD = lambda z, zt: z < zt     # 還沒走到拍照位置
else:      # 鏡頭在兩人前方往 +z 看：Café 在畫面左邊、路口的機車與路名牌在後面
    START = {'yt': (54.55, 4.2), 'an': (53.85, 4.6)}; GOAL = {'yt': (54.55, -5.5), 'an': (53.85, -5.1)}
    SHOTS = [('medium', 1.2, (53.9, 1.42, -2.3), (54.25, 1.18, 3.0)), ('wide', -0.6, (53.2, 1.55, -7.6), (54.3, 1.05, 2.0)), ('side', -2.6, (50.6, 1.45, -3.4), (54.3, 1.05, -2.2))]
    AHEAD = lambda z, zt: z > zt


async def main():
    os.makedirs(OUT, exist_ok=True); shots = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.set_viewport_size({'width': 1200, 'height': 800})
        await pg.goto(URL); await L.wait_loaded(pg)
        await L.load_state(pg, {'zone': 'wenzhou', 'hour': HOUR, 'day': 8, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': START['yt'][0], 'z': START['yt'][1], 'yaw': 3.1416 if NORTH else 0}, 'flags': FLAGS}, quiet_events=True)
        await pg.wait_for_timeout(3000); await pg.add_style_tag(content=HIDE)
        info = await pg.evaluate("""(c=>{ const E=GAME.E; const P=E.player;
            E.npcs.slice().forEach(n=>{ if(n.charId==='heroine_01') E.removeNPC(n); });
            const n=GAME.spawnCharacter('heroine_01',c.an[0],c.an[1],{yaw:c.yaw}); n.greet=false; n.frozen=false; n.beh='idle';
            E.placeAt(P,c.yt[0],c.yt[1],0);
            const drv=o=>{ let k=null,d=null; o.obj.traverse(x=>{ if(x.userData&&x.userData.driver&&!d){ k=x.userData.key; d=x.userData.driver; } }); return k+':'+d; };
            return {player:drv(P), an:drv(n), hour:GAME.G?GAME.G.hour:null}; })(%s)""" % json.dumps({'yt': START['yt'], 'an': START['an'], 'yaw': 3.1416 if NORTH else 0}))
        print('chars', info, flush=True)
        await pg.wait_for_timeout(2500)
        # 兩人同時開始走（遊戲本身的走路：找路、動畫、腳步）
        await pg.evaluate("""(c=>{ const E=GAME.E; const n=E.npcs.find(k=>k.charId==='heroine_01');
            void GAME.walkTo(E.player,c.yt[0],c.yt[1]); void GAME.walkTo(n,c.an[0],c.an[1]); })(%s)""" % json.dumps({'yt': GOAL['yt'], 'an': GOAL['an']}))
        done = set()
        for i in range(400):
            z = await pg.evaluate("GAME.E.player.obj.position.z")
            for tag, zt, cp, cl in SHOTS:
                if tag in done or AHEAD(z, zt): continue
                done.add(tag)
                await pg.evaluate("""((p,l)=>{ const E=GAME.E; E.paused=true; E.camera.position.set(...p); E.camera.lookAt(new THREE.Vector3(...l)); E.camera.updateMatrixWorld(true);
                    E.player.obj.visible=true; E.npcs.forEach(k=>{ if(k.charId==='heroine_01') k.obj.visible=true; }); E.render(); })(%s,%s)""" % (json.dumps(cp), json.dumps(cl)))
                await pg.wait_for_timeout(700); f = f'{OUT}/cafe_dusk_{tag}.png'; await pg.screenshot(path=f); shots.append((tag, f)); print('shot', tag, 'z=%.2f' % z, flush=True)
                await pg.evaluate("GAME.E.paused=false")
            if len(done) == len(SHOTS) or abs(z - GOAL['yt'][1]) < 0.3: break
            await pg.wait_for_timeout(120)
        print('walkFallbacks', await pg.evaluate("GAME.walkFallbacks||0"), 'errors', errs[:3], flush=True)
        await b.close()
    ref = Image.open(os.path.join(ROOT, 'docs/art-rebuild/references/07_yuting_shen_cafe_dusk_target.webp')).convert('RGB')
    H = 520; f = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 22)
    ims = [('參考圖 07', ref)] + [({'medium': '遊戲畫面（中景）', 'wide': '遊戲畫面（全景）', 'side': '遊戲畫面（側面）'}[t], Image.open(p).convert('RGB')) for t, p in shots]
    ims = [(t, im.resize((int(im.width * H / im.height), H), Image.LANCZOS)) for t, im in ims]
    cols = 2; rows = (len(ims) + 1) // 2; CW = max(im.width for _, im in ims)
    c = Image.new('RGB', (cols * (CW + 8) + 8, rows * (H + 40) + 8), (245, 242, 236)); d = ImageDraw.Draw(c)
    for i, (t, im) in enumerate(ims):
        x = 8 + (i % cols) * (CW + 8); y = 8 + (i // cols) * (H + 40)
        d.text((x + 4, y), t, fill=(30, 30, 30), font=f); c.paste(im, (x, y + 32))
    c.save(f'{OUT}/DEMO_cafe_dusk.jpg', quality=88); print('saved', f'{OUT}/DEMO_cafe_dusk.jpg')

asyncio.run(main())
