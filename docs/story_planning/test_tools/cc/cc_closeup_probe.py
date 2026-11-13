"""CC-C 11-14：店內指定位置近照（BB-C 18:01：SHOP_B4_3cbd 安泰端架掛勾、量血壓角，汀州鮮果香蕉桌）。只拍照、量數字；判定歸 BB。Windows＋GPU ≠ iPhone。
每一間（ZONE）、每個時間（HOURS，預設 14）：
  【前置／捷徑】D.load_zone 讀檔進店（2025-10-22 週三、出生點），等模型載完；被趕出來（打烊）＝記「打烊，跳過」。
  CAMS 每一組＝一張近照：另一台相機放在 from、看 at（先跑 zone.fadeWalls，和遊戲剖面視角同一個做法），fov 預設 50。
  座標是區域的世界座標（汀州路的店＝TZ_SHOPS_LAYOUT 的配置座標，門在 +z）；每張記相機、畫面中央亮度標準差（一片純色＝很小）、洋紅比例（缺貼圖）。
  另外拍一張遊戲自己的鏡頭（站在出生點）。
CAMS 格式：名字@fx,fy,fz>ax,ay,az[@fov]，多組用「/」隔開（ENV 不能有「;」「|」）。
CC_02 清單 2026-11-14：1✓（日期 10/22 週三 14:00，照 BB；打烊的跳過並記） 2✓（座標從 3cbdf9ef83 的 tz_shops_layout.js 讀出來寫進 CAMS，佇列那一行寫了來源） 3n/a（BB 指定的位置） 4n/a（只拍照） 5n/a（讀檔進店，不走路） 6✓（等 ASSETS 載完再等 1.5 秒） 7✓（lint、JS 在 node --check 驗過語法） 8✓（數字只記不判） 9✓（每張記相機和看的點；拍完存檔） 10n/a（讀檔時關事件和手機） 11✓（SHA 40 碼、ENV 沒有「;」「|」） 12✓（FAIL_SETUP 檢查：真的在那一間、CAMS 解析得出來） 13n/a（不走路）
用法：LW_TESTS=<wt>/tests SHA=<sha> ZONE=gg_antai CAMS=… [HOURS=14] [TAG=…] python3 cc_closeup_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
ZONE = os.environ.get('ZONE') or ''
TAG = os.environ.get('TAG') or ZONE
HOURS = [float(h) for h in (os.environ.get('HOURS') or '14').split(',') if h]
DAY = '2025-10-22'
R = L.Run('closeup', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)


def parse_cams(s):
    out = []
    for part in [p for p in (s or '').split('/') if p.strip()]:
        bits = part.split('@'); name = bits[0].strip(); fr, at = bits[1].split('>')
        fov = float(bits[2]) if len(bits) > 2 else 50.0
        out.append({'name': name, 'from': [float(v) for v in fr.split(',')], 'at': [float(v) for v in at.split(',')], 'fov': fov})
    return out


SETTLED = "(async()=>{ for(let i=0;i<120;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||50, c.width/c.height, 0.03, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const z=E.zone, P=E.player&&E.player.obj; if(z&&z.fadeWalls){ try{ z.fadeWalls(cam,P?P.position:cam.position); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  try{ r.render(E.scene,cam); return c.toDataURL('image/png'); } finally { if(z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } } })"""   # 同 cc_shop_view_probe.py
GAMECAM = "(()=>{ const E=GAME.E, r=E.renderer; r.render(E.scene,E.camera); return r.domElement.toDataURL('image/png'); })()"
ANALYZE_JS = r"""(async u=>{ const im=await new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=u; }); const W=160, H=Math.round(160*im.height/im.width);
  const k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d'); g.drawImage(im,0,0,W,H); const d=g.getImageData(0,0,W,H).data;
  let mag=0; for(let i=0;i<d.length;i+=4){ if(d[i]>170&&d[i+2]>140&&d[i+1]<90) mag++; }
  let n=0,s=0,s2=0; for(let y=Math.floor(H*0.25);y<Math.floor(H*0.75);y++) for(let x=Math.floor(W*0.25);x<Math.floor(W*0.75);x++){ const o=(y*W+x)*4, l=0.299*d[o]+0.587*d[o+1]+0.114*d[o+2]; n++; s+=l; s2+=l*l; }
  const m=s/n; return {magenta_pct:+(mag*100/(W*H)).toFixed(2), center_mean:+m.toFixed(1), center_sd:+Math.sqrt(Math.max(0,s2/n-m*m)).toFixed(1)}; })"""


async def main():
    cams = []
    try: cams = parse_cams(os.environ.get('CAMS'))
    except Exception as e: print('CAMS 解析不了：%r' % e, flush=True)
    print('CC 店內近照：TAG %s；SHA %s；ZONE %s；HOURS %s；CAMS %s；Windows＋GPU ≠ iPhone' % (TAG, SHA or '?', ZONE, HOURS, J(cams)), flush=True)
    rows = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        if not R.check('FAIL_SETUP 檢查：CAMS 解析得出來（%d 組）' % len(cams), bool(cams) and bool(ZONE), os.environ.get('CAMS') or ''): await b.close(); sys.exit(1)
        for h in HOURS:
            hh = '%02d%02d' % (int(h), int(round((h % 1) * 60))); tag = '[%s %s]' % (ZONE, hh)
            s = await D.load_zone(pg, cdp, ZONE, DAY, h, wait=8000)
            R.setup('%s 【前置／捷徑】讀檔進 %s %s %.2f 時（出生點）' % (tag, ZONE, DAY, h))
            await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
            if not R.check('FAIL_SETUP 檢查：%s 讀檔以後真的在 %s' % (tag, ZONE), s['zone'] == ZONE, s['zone']):
                rows.append({'hour': h, 'skipped': 'closed:' + s['zone']}); continue
            for c in cams:
                u = await pg.evaluate(SNAP, c); fn = 'close_%s_%s_%s.png' % (TAG, hh, c['name'])
                open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
                a = await pg.evaluate(ANALYZE_JS, u); rows.append({'hour': h, 'cam': c, 'img': a, 'file': fn})
                R.note('%s 近照「%s」相機 %s → %s（fov %s）：%s' % (tag, c['name'], c['from'], c['at'], c['fov'], J(a)))
            u = await pg.evaluate(GAMECAM); open(os.path.join(OUT, 'close_%s_%s_game.png' % (TAG, hh)), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
            open(os.path.join(OUT, 'closeup.json'), 'w', encoding='utf-8').write(J({'sha': SHA, 'zone': ZONE, 'rows': rows}))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
