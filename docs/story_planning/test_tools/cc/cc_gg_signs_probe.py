"""CC（帳號 A）11-10：公館騎樓五塊招牌（X323 GG-SIGNS，LAWWW2 b67955799：gongguan_shops.glb 只換招牌圖集；BB 20:08）。Playwright（PC GPU）≠ iPhone。
五間：青木茶室、頁間書屋、慢輪單車、afar、轉角唱片——位置照遊戲的店門互動點（label「進入…」的 x；店面立面 FZ＝19、招牌燈箱 z 18.2～18.4、高 3.85／5.8 m，zones3d.js 941、gongguan_shops.glb GLOW_signbox／vsign）。
【前置／捷徑】讀檔到公館（gongguan）2025-11-01 14:00、20:00 各一次（天氣晴）；拍照鏡頭（不改遊戲鏡頭；拍的那一格把路人、玩家藏起來，拍完恢復）：
  正面＝騎樓外 (x, 2.2, 31) 平視看 (x, 4.3, 18.5)；斜 30°＝(x+6.25, 2.2, 29.3) 看同一點；fov 32（整塊招牌含上面的直招牌都在畫面裡）。
輸出：signs_<TAG>.jpg（5 列×4 欄：14 正面、14 斜、20 正面、20 斜，每格標店名／時間）；另每間 14 正面一張大圖。新舊兩個 SHA 各跑一次，回雲端並排。
用法：LW_TESTS=<wt>/tests TAG=new|old python3 cc_gg_signs_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'new'
R = L.Run('gg_signs_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SHOPS = ['青木茶室', '頁間書屋', '慢輪單車', 'afar', '轉角唱片']
FIND = r"""(names=>names.map(nm=>{ const it=(GAME.E.interactables||[]).find(i=>i.exit&&String(i.label||'').includes(nm)); return it?{nm, x:+it.x.toFixed(2), z:+it.z.toFixed(2), to:it.exit.to}:{nm, x:null}; }))"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov, c.width/c.height, 0.1, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const hid=[]; const P=E.player&&E.player.obj; if(P){ hid.push([P,P.visible]); P.visible=false; } for(const n of (E.npcs||[])) if(n.obj){ hid.push([n.obj,n.obj.visible]); n.obj.visible=false; }
  let url; try{ r.render(E.scene,cam); const k=document.createElement('canvas'); k.width=a.tw; k.height=Math.round(a.tw*c.height/c.width); const g=k.getContext('2d'); g.drawImage(c,0,0,k.width,k.height);
    g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(0,0,k.width,20); g.fillStyle='#fff'; g.font='14px sans-serif'; g.fillText(a.label,5,15); (window.__GS=window.__GS||[]).push(k.toDataURL('image/jpeg',0.88));
    if(a.full) url=c.toDataURL('image/jpeg',0.9); } finally { for(const [o,v] of hid) o.visible=v; } return url||null; })"""
MONT = r"""(async a=>{ const L=window.__GS||[]; const ims=await Promise.all(L.map(u=>new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=u; })));
  const w=ims[0].width, h=ims[0].height, C=a.cols, rows=Math.ceil(ims.length/C), k=document.createElement('canvas'); k.width=w*C; k.height=h*rows+28; const g=k.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,k.width,k.height);
  g.fillStyle='#fff'; g.font='bold 20px sans-serif'; g.fillText(a.title,8,21); ims.forEach((im,i)=>g.drawImage(im,(i%C)*w,28+Math.floor(i/C)*h)); return k.toDataURL('image/jpeg',0.88); })"""


async def main():
    sha = os.environ.get('SHA', '')[:9]
    print('CC 公館招牌：TAG %s；SHA %s；Playwright ≠ iPhone' % (TAG, sha), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        grid = {}
        try:
            for h in (14.0, 20.0):
                await D.load_zone(pg, cdp, 'gongguan', '2025-11-01', h, wait=8000)
                R.setup('【前置／捷徑】讀檔到公館 2025-11-01 %02d:00（晴）' % h)
                shops = await pg.evaluate("(%s)(%s)" % (FIND, J(SHOPS)))
                R.note('%02d:00 店門互動點：%s' % (h, J(shops)))
                for s in shops:
                    if s['x'] is None: R.check('找得到「%s」的店門' % s['nm'], False, ''); continue
                    x = s['x']
                    for kind, frm in (('正面', [x, 2.2, 31.0]), ('斜30°', [x + 6.25, 2.2, 29.3])):
                        u = await pg.evaluate(SNAP, {'from': frm, 'at': [x, 4.3, 18.5], 'fov': 32, 'tw': 420, 'label': '%s %s %02d:00 %s %s' % (TAG, sha, h, s['nm'], kind), 'full': kind == '正面'})
                        if u: open(os.path.join(OUT, 'sign_%s_%s_%02d.jpg' % (TAG, s['to'], h)), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
                        grid.setdefault(s['nm'], []).append('%02d %s' % (h, kind))
            R.check('五間都拍到 14、20 時各兩張', len(grid) == 5 and all(len(v) == 4 for v in grid.values()), J(grid))
            # 照店排：每列一間（14 正、14 斜、20 正、20 斜）——__GS 是依時間先後放的，重排
            await pg.evaluate("(()=>{ const L=window.__GS, n=L.length/2, out=[]; for(let i=0;i<n/2;i++){ out.push(L[2*i],L[2*i+1],L[n+2*i],L[n+2*i+1]); } window.__GS=out; })()")
            u = await pg.evaluate(MONT, {'cols': 4, 'title': '公館騎樓招牌 %s %s：每列一間（14 正面、14 斜 30°、20 正面、20 斜 30°）' % (TAG, sha)})
            open(os.path.join(OUT, 'signs_%s.jpg' % TAG), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
            R.note('拼圖 signs_%s.jpg；大圖 sign_%s_<店>_<時>.jpg（正面）' % (TAG, TAG))
        except Exception as e:
            R.check('沒有中斷', False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
