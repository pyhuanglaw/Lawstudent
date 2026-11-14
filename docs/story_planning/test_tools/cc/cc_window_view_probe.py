"""CC-C 11-14：SHOP-INTERIOR-VIEW-1112 窗景第二層（LAWWW-C 17:35，@859b5a8352）。只拍照、量數字；判定歸 BB。Windows＋GPU ≠ iPhone。
place_gate 第一層原本把 9 間判「沒窗景」，8 間是誤判（公館 afar／daybreak／yangyang／corner_records／aoki 用 GG_VIEW 模型窗景卡；溫州街 wz_mokuyobi／wz_offbeat 用 WZ_VIEW；
wz_brunch 白天模型卡、晚上 WZ_AA_NIGHTVIEW），wz_teahouse（一盞）列例外：緣側玻璃外是 3D 前院（wz_teahouse_yard.glb）。這支每間、每個時間（HOURS，預設 13、21）從店裡往窗外拍。
做法：
  【前置／捷徑】D.load_zone 讀檔進店（2025-10-22 週三、出生點），等模型載完；被趕出來（打烊）＝記「打烊，跳過」。
  找窗景卡：這個區域的場景裡，材質名或網格名像窗景（/window_view|_VIEW|VIEW_|^VIEW/i）的網格；一張卡一張照片：
    相機＝卡的中心往房間中心（站得住的格子算）方向退 2.6 m、高 1.5 m（夾在房間範圍內），看卡的中心；另一台相機，先跑 zone.fadeWalls（和遊戲剖面視角同一個做法）。
    記：網格名、材質名、這時候貼的圖（map.userData.url；晚上應該換成 night 那張）、卡的世界座標；畫面量數字（中央的亮度標準差＝是不是一片純色、上半偏藍比例＝天空、洋紅比例＝缺貼圖）。
  一盞（wz_teahouse）：前院不是卡——前院模型的網格（名字含 YARD／gate／lantern／tree／camphor／fence，或 wz_teahouse_yard 載進來的那一組）算中心，
    相機從房間中心往前院方向走到房間邊緣（緣側）、高 1.4 m 往前院看。
  每間每個時間另外拍一張遊戲自己的鏡頭（E.camera，站在出生點）。
CC_02 清單 2026-11-14：1✓（日期 10/22 週三、13:00／21:00，照 LAWWW-C；打烊的跳過並記） 2✓（窗景卡從場景網格的名字找，不寫死座標；房間範圍從導航格算） 3✓（每一張卡都拍，不挑第一張） 4n/a（只拍照，不點畫面） 5n/a（不走路，讀檔進店） 6✓（等 ASSETS 載完、再等 1.5 秒讓 applyTime 換窗景圖） 7✓（lint、JS 在 node --check 驗過語法） 8✓（數字只記不判，判定歸 BB） 9✓（相機對準卡的中心、記卡的位置；找不到卡＝FAIL_SETUP） 10n/a（讀檔時關事件和手機） 11✓（SHA 40 碼、ENV 沒有「|」） 12✓（FAIL_SETUP 檢查：真的在那一間、找到窗景卡或前院） 13n/a（不走路）
天花板（LAWWW-C 17:38，@d78586749b：wz_print／wz_lin／wz_teishoku 室內鏡頭距離 4.0→3.2）：CEIL_ZONES 的每一間、每個時間拍三張遊戲自己的鏡頭——
  ① 預設跟隨鏡頭 ② 手指往下拖（俯角拉到最大，鏡頭最高）③ 手指往上拖（俯角最小、抬頭）；拖是真的觸控（CDP touch，和玩家一樣）。
  每張記 E.cam.pitch、鏡頭高度、場景背景色，畫面上半有多少像素等於背景色（＝看穿天花板看到背景）。WIN=0＝這幾間不跑窗景卡那一段。
用法：LW_TESTS=<wt>/tests SHA=<sha> [ZONES=afar,…] [HOURS=13,21] [CEIL_ZONES=wz_print,…] [WIN=0] python3 cc_window_view_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
ZONES = [z for z in (os.environ.get('ZONES') or 'afar,daybreak,yangyang,corner_records,aoki,wz_mokuyobi,wz_offbeat,wz_brunch,wz_teahouse').split(',') if z]
HOURS = [float(h) for h in (os.environ.get('HOURS') or '13,21').split(',') if h]
CEIL_ZONES = [z for z in (os.environ.get('CEIL_ZONES') or '').split(',') if z]
WIN = (os.environ.get('WIN') or '1') != '0'
DAY = '2025-10-22'
R = L.Run('window_view', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SETTLED = "(async()=>{ for(let i=0;i<120;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||60, c.width/c.height, 0.05, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const z=E.zone, P=E.player&&E.player.obj; if(z&&z.fadeWalls){ try{ z.fadeWalls(cam,P?P.position:cam.position); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  const pv=P?P.visible:true; if(P) P.visible=false;   /* BB-C 01:41（WINVIEW_GG3 card1 被主角的頭擋住）：拍窗景時把玩家藏起來 */
  try{ r.render(E.scene,cam); return c.toDataURL('image/png'); } finally { if(P) P.visible=pv; if(z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } } })"""   # 同 cc_shop_view_probe.py
CAMST = r"""(()=>{ const E=GAME.E, c=E.camera, bg=E.scene.background; return {pitch:+E.cam.pitch.toFixed(3), dist:+(+E.cam.distTarget).toFixed(2), camY:+c.position.y.toFixed(2), ceil:(E.zone&&E.zone.h)||null, bg:bg&&bg.isColor?[Math.round(bg.r*255),Math.round(bg.g*255),Math.round(bg.b*255)]:null}; })()"""
BGPCT = r"""(async a=>{ const im=await new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=a.u; }); const W=160, H=Math.round(160*im.height/im.width);
  const k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d'); g.drawImage(im,0,0,W,H); const d=g.getImageData(0,0,W,Math.floor(H/2)).data; let n=0,m=0;
  for(let i=0;i<d.length;i+=4){ n++; if(a.bg&&Math.abs(d[i]-a.bg[0])<=8&&Math.abs(d[i+1]-a.bg[1])<=8&&Math.abs(d[i+2]-a.bg[2])<=8) m++; } return +(m*100/n).toFixed(1); })"""
GAMECAM = "(()=>{ const E=GAME.E, r=E.renderer; r.render(E.scene,E.camera); return r.domElement.toDataURL('image/png'); })()"
ANALYZE_JS = r"""(async u=>{ const im=await new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=u; }); const W=160, H=Math.round(160*im.height/im.width);
  const k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d'); g.drawImage(im,0,0,W,H); const d=g.getImageData(0,0,W,H).data;
  let mag=0; for(let i=0;i<d.length;i+=4){ if(d[i]>170&&d[i+2]>140&&d[i+1]<90) mag++; }
  const reg=(x0,y0,x1,y1)=>{ let n=0,s=0,s2=0,R=0,G=0,B=0; for(let y=Math.floor(y0*H);y<Math.floor(y1*H);y++) for(let x=Math.floor(x0*W);x<Math.floor(x1*W);x++){ const o=(y*W+x)*4, l=0.299*d[o]+0.587*d[o+1]+0.114*d[o+2]; n++; s+=l; s2+=l*l; R+=d[o]; G+=d[o+1]; B+=d[o+2]; }
    const m=s/n; return {mean:+m.toFixed(1), sd:+Math.sqrt(Math.max(0,s2/n-m*m)).toFixed(1), rgb:[Math.round(R/n),Math.round(G/n),Math.round(B/n)]}; };
  let sky=0, n3=0; for(let y=0;y<Math.floor(H/2);y++) for(let x=0;x<W;x++){ const o=(y*W+x)*4, r=d[o], g=d[o+1], b=d[o+2]; n3++; if(b>r+20&&b>=g&&b>=60) sky++; }
  return {magenta_pct:+(mag*100/(W*H)).toFixed(2), center:reg(0.25,0.25,0.75,0.75), upper_sky_pct:+(sky*100/n3).toFixed(1)}; })"""
ROOM_JS = r"""(()=>{ const E=GAME.E, N=E.nav, f=v=>+(+v).toFixed(2); let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,n=0;
  if(N&&N.cols){ for(let j=0;j<N.rows;j++) for(let i=0;i<N.cols;i++){ const w=N.toWorld(i,j); if(E.canStand(w[0],w[1],0.3,0)){ n++; x0=Math.min(x0,w[0]); x1=Math.max(x1,w[0]); z0=Math.min(z0,w[1]); z1=Math.max(z1,w[1]); } } }
  return {n, box:n?[f(x0),f(x1),f(z0),f(z1)]:null, c:n?[f((x0+x1)/2),f((z0+z1)/2)]:null}; })()"""
# 找窗景卡（材質名或網格名像窗景）；一盞另外找前院的網格
CARDS_JS = r"""(a=>{ const E=GAME.E, z=E.zone, root=(z&&z.group)||E.scene, f=v=>+(+v).toFixed(2), out=[], yard=[]; const RX=/window_view|_VIEW|VIEW_|^VIEW/i, YX=/YARD|gate|lantern|camphor|tree|fence|takegaki|kabuki|ishi/i;
  const box=new THREE.Box3(), v=new THREE.Vector3();
  root.traverse(o=>{ if(!o.isMesh) return; const ms=[].concat(o.material||[]); const mn=ms.map(m=>m&&m.name||'').join('|');
    if(RX.test(o.name||'')||RX.test(mn)){ box.setFromObject(o); if(box.isEmpty()) return; box.getCenter(v); const sz=new THREE.Vector3(); box.getSize(sz);
      const m0=ms[0]||{}; const url=(m0.map&&m0.map.userData&&m0.map.userData.url)||(m0.map&&m0.map.image&&m0.map.image.src&&String(m0.map.image.src).split('/').slice(-1)[0])||null;
      const mp=m0.map||null, im=mp&&mp.image, iw=im&&(im.naturalWidth||im.width), ih=im&&(im.naturalHeight||im.height);
      const uv=o.geometry&&o.geometry.attributes&&o.geometry.attributes.uv; let uvr=null; if(uv){ let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9; for(let i=0;i<uv.count;i++){ const x=uv.getX(i), y=uv.getY(i); a0=Math.min(a0,x); a1=Math.max(a1,x); b0=Math.min(b0,y); b1=Math.max(b1,y); } uvr={u:[f(a0),f(a1)],v:[f(b0),f(b1)]}; }
      const wide=Math.max(sz.x,sz.z), cardAsp=sz.y>0?f(wide/sz.y):null, imgAsp=iw&&ih?f(iw/ih):null;
      /* BB-C 01:41：窗景圖邊緣被橫向拉成一條一條——記 UV 範圍、貼圖 repeat／offset／wrap、卡片寬高比、照片寬高比 */
      out.push({mesh:o.name||'', mat:mn, visible:o.visible!==false, c:[f(v.x),f(v.y),f(v.z)], size:[f(sz.x),f(sz.y),f(sz.z)], map:url, emissive:m0.emissiveIntensity!=null?f(m0.emissiveIntensity):null,
        tex:mp?{repeat:[f(mp.repeat.x),f(mp.repeat.y)], offset:[f(mp.offset.x),f(mp.offset.y)], wrapS:mp.wrapS, wrapT:mp.wrapT, center:[f(mp.center.x),f(mp.center.y)], rotation:f(mp.rotation||0)}:null,
        img:iw?[iw,ih]:null, uv:uvr, cardAspect:cardAsp, imgAspect:imgAsp, stretch:(cardAsp&&imgAsp&&uvr)?f(cardAsp/(imgAsp*Math.max(1e-6,(uvr.u[1]-uvr.u[0])*(mp?mp.repeat.x:1))/Math.max(1e-6,(uvr.v[1]-uvr.v[0])*(mp?mp.repeat.y:1)))):null}); }
    if(a.yard&&(YX.test(o.name||'')||YX.test(mn))){ box.setFromObject(o); if(!box.isEmpty()){ box.getCenter(v); yard.push({n:o.name||'', c:[f(v.x),f(v.y),f(v.z)]}); } } });
  return {cards:out.slice(0,12), yard:yard.slice(0,40), yardN:yard.length, zone:GAME.G.zone, hour:f(GAME.G.hour)}; })"""


async def shot(pg, fn, frm, at, fov=60):
    u = await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at), 'fov': fov})
    open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
    return await pg.evaluate(ANALYZE_JS, u)


def inward(c, room, back, y):
    """卡的中心往房間中心退 back 公尺（夾在房間範圍內），回傳相機位置"""
    cx, cz = room['c']; dx, dz = cx - c[0], cz - c[2]; m = (dx * dx + dz * dz) ** 0.5 or 1
    x, z = c[0] + dx / m * back, c[2] + dz / m * back
    b = room['box']; x = min(max(x, b[0]), b[1]); z = min(max(z, b[2]), b[3])
    return (round(x, 2), y, round(z, 2))


async def one(pg, cdp, zid, h, rows):
    hh = '%02d%02d' % (int(h), int(round((h % 1) * 60))); tag = '[%s %s]' % (zid, hh)
    s = await D.load_zone(pg, cdp, zid, DAY, h, wait=8000)
    R.setup('%s 【前置／捷徑】讀檔進 %s %s %.2f 時（出生點）' % (tag, zid, DAY, h))
    n = await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
    row = {'zone': zid, 'hour': h, 'assets_wait': n, 'shots': []}
    if s['zone'] != zid:
        R.note('%s 讀檔以後在 %s＝打烊或進不去，這個時間跳過（不判）' % (tag, s['zone'])); row['skipped'] = 'closed:' + s['zone']; rows.append(row); return
    room = await pg.evaluate(ROOM_JS); row['room'] = room
    cd = await pg.evaluate(CARDS_JS, {'yard': zid == 'wz_teahouse'}); row['cards'] = cd['cards']; row['yardN'] = cd['yardN']
    R.note('%s 房間 %s；窗景卡 %s；前院網格 %d 個 %s' % (tag, J(room), J(cd['cards']), cd['yardN'], J([y['n'] for y in cd['yard'][:10]])))
    want = bool(cd['cards']) or (zid == 'wz_teahouse' and cd['yardN'] > 0)
    if not R.check('FAIL_SETUP 檢查：%s 量得到房間、找到窗景卡%s' % (tag, '或前院' if zid == 'wz_teahouse' else ''), bool(room['box']) and want, J({'room': room, 'cards': len(cd['cards']), 'yard': cd['yardN']})):
        rows.append(row); return
    for k, c in enumerate(cd['cards'], 1):
        frm = inward(c['c'], room, 2.6, 1.5); at = (c['c'][0], max(1.2, c['c'][1]), c['c'][2])
        a = await shot(pg, 'win_%s_%s_card%d.png' % (zid, hh, k), frm, at, 60)
        row['shots'].append({'kind': 'card', 'mesh': c['mesh'], 'mat': c['mat'], 'map': c['map'], 'from': frm, 'at': at, 'img': a})
        R.note('%s 卡 %d「%s／%s」貼圖 %s；相機 %s → %s；畫面 %s' % (tag, k, c['mesh'], c['mat'], c['map'], frm, at, J(a)))
    if zid == 'wz_teahouse' and cd['yardN']:
        ys = cd['yard']; yc = [sum(y['c'][i] for y in ys) / len(ys) for i in range(3)]
        cx, cz = room['c']; frm = (round(cx + (yc[0] - cx) * 0.7, 2), 1.4, round(cz + (yc[2] - cz) * 0.7, 2))
        b = room['box']; frm = (min(max(frm[0], b[0]), b[1]), 1.4, min(max(frm[2], b[2]), b[3]))
        at = (round(yc[0], 2), 1.2, round(yc[2], 2))
        a = await shot(pg, 'win_%s_%s_yard.png' % (zid, hh), frm, at, 65)
        row['shots'].append({'kind': 'yard', 'from': frm, 'at': at, 'img': a})
        R.note('%s 緣側往前院：前院中心 %s；相機 %s；畫面 %s' % (tag, J(at), frm, J(a)))
    u = await pg.evaluate(GAMECAM); open(os.path.join(OUT, 'win_%s_%s_game.png' % (zid, hh)), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
    rows.append(row)


async def ceil(pg, cdp, zid, h, rows):
    hh = '%02d%02d' % (int(h), int(round((h % 1) * 60))); tag = '[%s %s 天花板]' % (zid, hh)
    s = await D.load_zone(pg, cdp, zid, DAY, h, wait=8000)
    R.setup('%s 【前置／捷徑】讀檔進 %s %s %.2f 時（出生點、預設跟隨鏡頭）' % (tag, zid, DAY, h))
    await pg.evaluate(SETTLED); await pg.wait_for_timeout(2500)
    row = {'zone': zid, 'hour': h, 'ceil': []}
    if s['zone'] != zid:
        R.note('%s 讀檔以後在 %s＝打烊或進不去，跳過' % (tag, s['zone'])); row['skipped'] = 'closed:' + s['zone']; rows.append(row); return
    vp = pg.viewport_size or {'width': 844, 'height': 390}; W, H = vp['width'], vp['height']
    for k, (lab, y0, y1) in enumerate((('① 預設', None, None), ('② 手指往下拖（俯角最大）', 0.3, 0.9), ('③ 手指往上拖（抬頭）', 0.9, 0.2)), 1):
        if y0 is not None:
            for _ in range(2): await L.drag(pg, cdp, W * 0.55, H * y0, W * 0.55, H * y1, steps=12); await pg.wait_for_timeout(250)
            await pg.wait_for_timeout(600)
        cs = await pg.evaluate(CAMST); u = await pg.evaluate(GAMECAM)
        fn = 'ceil_%s_%s_%d.png' % (zid, hh, k); open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
        bgp = await pg.evaluate(BGPCT, {'u': u, 'bg': cs['bg']}); a = await pg.evaluate(ANALYZE_JS, u)
        row['ceil'].append({'shot': lab, 'cam': cs, 'bg_top_pct': bgp, 'img': a, 'file': fn})
        R.note('%s %s：俯角 %s、鏡頭高 %s m（天花板 %s m、距離 %s）；背景色 %s 在畫面上半佔 %s%%；畫面 %s' % (tag, lab, cs['pitch'], cs['camY'], cs['ceil'], cs['dist'], cs['bg'], bgp, J(a)))
    rows.append(row)


async def main():
    print('CC 窗景第二層（SHOP-INTERIOR-VIEW-1112）：SHA %s；ZONES %s；HOURS %s；Windows＋GPU ≠ iPhone' % (SHA or '?', ','.join(ZONES), HOURS), flush=True)
    rows = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for zid in ZONES + [z for z in CEIL_ZONES if z not in ZONES]:
            for h in HOURS:
                if zid in CEIL_ZONES:
                    try: await ceil(pg, cdp, zid, h, rows)
                    except Exception as e:
                        R.check('[%s %s 天花板] 沒有中斷' % (zid, h), False, repr(e)[:300])
                if zid not in ZONES or (zid in CEIL_ZONES and not WIN): continue
                try: await one(pg, cdp, zid, h, rows)
                except Exception as e:
                    R.check('[%s %s] 沒有中斷' % (zid, h), False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash_%s_%s.png' % (zid, int(h))))
                open(os.path.join(OUT, 'window_view.json'), 'w', encoding='utf-8').write(J({'sha': SHA, 'rows': rows}))
        # 白天／晚上換圖：同一張卡 13 點和 21 點的貼圖一樣＝記下來（判定歸 BB）
        for zid in ZONES:
            rr = [r for r in rows if r['zone'] == zid and r.get('cards')]
            if len(rr) >= 2:
                m0 = [c['map'] for c in rr[0]['cards']]; m1 = [c['map'] for c in rr[-1]['cards']]
                R.note('[%s] 白天貼圖 %s；晚上貼圖 %s；%s' % (zid, J(m0), J(m1), '有換' if m0 != m1 else '一樣（請 BB 看晚上那張是不是夜景）'))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
