"""CC-B 11-14：GATE_BLACKDOME（BB-B 12:48，P2）——BG3D_GATE_campus_r2 的 bg3d_ntu_gate_wide.png 左門柱後面有一大塊黑色半圓（已經等到 pending 0）。
要回答的只有兩件，判定歸 BB：①正常玩（遊戲的跟隨鏡頭）看不看得到；②那塊黑的是哪個 mesh。Windows＋GPU ≠ iPhone。
每個時間（HOURS，預設 8.5,14）：
  【前置／捷徑】D.load_zone 讀檔進 campus、玩家放到校門門柱連線（x＝GATE_X，zones3d.js 校門 placeGate(-124,0,-π/2)）外 3 m、內 3 m 各一次（z＝GATE_Z），
  面向校內（+x），鏡頭轉到玩家背後（遊戲自己的跟隨鏡頭，等 WAIT_S 秒讓鏡頭跟上）→ 拍遊戲畫面（藏 HUD）。
  另外照原本那組固定相機 [-129.5,2.2,4]→[-60,5,0] fov75 拍兩張：有跑 zone.fadeWalls（同 cc_closeup_probe）／沒跑。
  每一張：找畫面裡「很黑」（亮度 < DARK_L）的最大一塊（16 px 格子連通）——記面積比例、外框、中心；從那張的相機往黑塊中心打一條 ray（Raycaster 設 camera），
  印前 6 個命中的 object.name、往上三層父物件名稱、material 名稱／type、有沒有 map、side、transparent、opacity、visible、distance。
CC-B 11-14：GATE_REF＝校園側、公館側、走過通道（LAWWW-B GATE-REF-1114）。
CC_02 清單 2026-11-14：1✓（時間 08:30／14:00 照 BB；日期 2025-10-22 週三同 closeup） 2✓（校門座標從 zones3d.js placeGate(-124,0,-π/2) 讀；固定相機照 BG3D_GATE_campus_r2 那一行） 3n/a（BB 指定的位置） 4n/a（只拍照、打 ray） 5✓（【捷徑】讀檔放位置＝BB 說「落點」可以；記實際位置、站不站得住） 6✓（等 ASSETS pending 0＋1.5 秒，鏡頭再等 WAIT_S） 7✓（lint；JS 在 node --check 驗過語法） 8✓（黑塊只量不判） 9✓（每張記相機位置、看的方向；圖存檔） 10n/a（讀檔時關事件和手機） 11✓（SHA 40 碼、ENV 沒有「;」「|」） 12✓（FAIL_SETUP 檢查：真的在 campus、玩家位置和朝向對、鏡頭在玩家背後） 13n/a（不走路）
用法：LW_TESTS=<wt>/tests SHA=<sha> [HOURS=8.5,14] [GATE_X=-124] [GATE_Z=0] python3 cc_gate_blackdome_probe.py <url> <out>"""
import os, sys, json, math, asyncio, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
TAG = os.environ.get('TAG') or 'gate_blackdome'
HOURS = [float(h) for h in (os.environ.get('HOURS') or '8.5,14').split(',') if h]
DAY = os.environ.get('DAY') or '2025-10-22'
GATE_X = float(os.environ.get('GATE_X') or -124); GATE_Z = float(os.environ.get('GATE_Z') or 0)
OFF = float(os.environ.get('OFF') or 3)
WAIT_S = float(os.environ.get('WAIT_S') or 3)
DARK_L = float(os.environ.get('DARK_L') or 18)
VIEW = [int(v) for v in (os.environ.get('VIEW') or '1600x900').split('x') if v]
FIXED = {'from': [-129.5, 2.2, 4.0], 'at': [-60.0, 5.0, 0.0], 'fov': 75.0}
GATE_REF = (os.environ.get('GATE_REF') or '0') == '1'   # CC-B 11-14（LAWWW-B 13:47 GATE-REF-1114）：多拍 校園側（門內 6 m 面向校門＝-x）、公館區域的校門（gongguan (0,-46)，站 (0,-38) 面向 -z）；走過通道：門柱連線前後 6 m，z 偏 0／±3／±5.5 各走一次
GG_GATE = [float(v) for v in (os.environ.get('GG_GATE') or '0,-46').split(',')]
R = L.Run('gate_blackdome', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||50, c.width/c.height, 0.03, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const z=E.zone, P=E.player&&E.player.obj; if(a.fade&&z&&z.fadeWalls){ try{ z.fadeWalls(cam,P?P.position:cam.position); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  try{ r.render(E.scene,cam); return c.toDataURL('image/png'); } finally { if(a.fade&&z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } } })"""
GAMECAM = "(()=>{ const E=GAME.E, r=E.renderer; r.render(E.scene,E.camera); return r.domElement.toDataURL('image/png'); })()"
CAMINFO = "(()=>{ const E=GAME.E, c=E.camera, P=E.player.obj.position, f=v=>+(+v).toFixed(2); const d=new THREE.Vector3(); c.getWorldDirection(d); return {cam:[f(c.position.x),f(c.position.y),f(c.position.z)], dir:[f(d.x),f(d.y),f(d.z)], fov:c.fov, player:[f(P.x),f(P.y),f(P.z)], yaw:f(E.cam.yaw), stand:E.canStand(P.x,P.z,0.3), lv:E.player.lv|0, zone:GAME.G.zone}; })()"
PLACE = "(a=>{ const P=GAME.E.player.obj; P.position.set(a.x,0,a.z); P.rotation.y=Math.PI/2; const C=GAME.E.cam; C.yaw=-Math.PI/2; C.manualT=30; return GAME.E.canStand(a.x,a.z,0.3); })"   # 面向 +x；鏡頭在玩家的 (sin yaw, cos yaw)＝(-1,0) 那一側＝背後
DARK_JS = r"""(async a=>{ const im=await new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=a.u; }); const W=im.width, H=im.height, S=16, gw=Math.ceil(W/S), gh=Math.ceil(H/S);
  const k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d'); g.drawImage(im,0,0); const d=g.getImageData(0,0,W,H).data; const cell=new Uint8Array(gw*gh);
  for(let gy=0;gy<gh;gy++) for(let gx=0;gx<gw;gx++){ let n=0,dk=0; for(let y=gy*S;y<Math.min(H,gy*S+S);y+=2) for(let x=gx*S;x<Math.min(W,gx*S+S);x+=2){ const o=(y*W+x)*4; n++; if(0.299*d[o]+0.587*d[o+1]+0.114*d[o+2]<a.L) dk++; } cell[gy*gw+gx]=dk>n*0.8?1:0; }
  const seen=new Uint8Array(gw*gh); let best=null;
  for(let i=0;i<gw*gh;i++){ if(!cell[i]||seen[i]) continue; const st=[i]; seen[i]=1; let n=0,x0=1e9,x1=-1,y0=1e9,y1=-1,sx=0,sy=0; while(st.length){ const j=st.pop(), x=j%gw, y=(j/gw)|0; n++; sx+=x; sy+=y; x0=Math.min(x0,x); x1=Math.max(x1,x); y0=Math.min(y0,y); y1=Math.max(y1,y);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X=x+dx, Y=y+dy; if(X<0||Y<0||X>=gw||Y>=gh) continue; const q=Y*gw+X; if(cell[q]&&!seen[q]){ seen[q]=1; st.push(q); } } }
    if(!best||n>best.n) best={n, box:[x0*S,y0*S,(x1+1)*S,(y1+1)*S], cx:(sx/n+0.5)*S, cy:(sy/n+0.5)*S}; }
  const tot=cell.reduce((s,v)=>s+v,0); return {W,H, dark_pct:+(tot*100/(gw*gh)).toFixed(2), blob:best?{pct:+(best.n*100/(gw*gh)).toFixed(2), box:best.box, c:[Math.round(best.cx),Math.round(best.cy)]}:null}; })"""
RAY_JS = r"""(a=>{ const E=GAME.E, c=E.renderer.domElement; let cam=E.camera; if(a.cam){ cam=new THREE.PerspectiveCamera(a.cam.fov, c.width/c.height, 0.03, 400); cam.position.set(...a.cam.from); cam.lookAt(...a.cam.at); cam.updateMatrixWorld(true); }
  const z=E.zone, P=E.player&&E.player.obj; if(a.cam&&a.fade&&z&&z.fadeWalls){ try{ z.fadeWalls(cam,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  const rc=new THREE.Raycaster(); rc.camera=cam; rc.setFromCamera(new THREE.Vector2(a.px/a.W*2-1, -(a.py/a.H*2-1)), cam); const f=v=>+(+v).toFixed(2);
  const vis=o=>{ for(let p=o;p;p=p.parent){ if(p.visible===false) return false; } return true; };
  const hits=rc.intersectObjects(E.scene.children,true).filter(h=>!(h.object.isSprite)).slice(0,10).map(h=>{ const o=h.object, ms=Array.isArray(o.material)?o.material:[o.material], m=ms[(h.face&&h.face.materialIndex)||0]||ms[0]||{};
      const par=[]; for(let p=o.parent;p&&par.length<3;p=p.parent) par.push(p.name||p.type); return {name:o.name||'(無名)', type:o.type, parents:par, mat:m.name||'(無名)', mtype:m.type, map:!!m.map, mapName:m.map?(m.map.name||(m.map.image&&m.map.image.src||'').split('/').pop()||'(有)'):null,
        color:m.color?'#'+m.color.getHexString():null, side:m.side, transparent:!!m.transparent, opacity:m.opacity, visible:vis(o), d:f(h.distance), p:[f(h.point.x),f(h.point.y),f(h.point.z)], ud:Object.keys(o.userData||{}).slice(0,6)}; });
  if(a.cam&&a.fade&&z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  return {camPos:[f(cam.position.x),f(cam.position.y),f(cam.position.z)], hits}; })"""


async def shoot(pg, name, hh, cam=None, fade=False):
    wa = await D.wait_assets(pg, 20.0, 1500)
    u = await (pg.evaluate(SNAP, dict(cam, fade=fade)) if cam else pg.evaluate(GAMECAM))
    fn = '%s_%s_%s.png' % (TAG, hh, name); open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
    dk = await pg.evaluate(DARK_JS, {'u': u, 'L': DARK_L})
    row = {'name': name, 'file': fn, 'assets': wa, 'dark': dk}
    if dk.get('blob') and dk['blob']['pct'] >= 0.5:
        ry = await pg.evaluate(RAY_JS, {'cam': cam, 'fade': fade, 'px': dk['blob']['c'][0], 'py': dk['blob']['c'][1], 'W': dk['W'], 'H': dk['H']})
        row['ray'] = ry
        R.note('%s %s：最大黑塊 %s%%（外框 %s、中心 %s）→ ray 從 %s：%s' % (hh, name, dk['blob']['pct'], dk['blob']['box'], dk['blob']['c'], ry['camPos'], J(ry['hits'][:6])))
    else:
        R.note('%s %s：沒有 ≥0.5%% 的黑塊（全畫面黑格 %s%%）' % (hh, name, dk['dark_pct']))
    return row


async def main():
    print('CC GATE_BLACKDOME：SHA %s；HOURS %s；校門 x=%s z=%s；Windows＋GPU ≠ iPhone' % (SHA or '?', HOURS, GATE_X, GATE_Z), flush=True)
    res = {'sha': SHA, 'rows': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        if len(VIEW) == 2: await pg.set_viewport_size({'width': VIEW[0], 'height': VIEW[1]})
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        for h in HOURS:
            hh = '%02d%02d' % (int(h), int(round((h % 1) * 60)))
            for side, x in (('out', GATE_X - OFF), ('in', GATE_X + OFF)):
                s = await D.load_zone(pg, cdp, 'campus', DAY, h, x=x, z=GATE_Z, yaw=math.pi / 2, wait=8000)
                R.setup('[%s %s]【前置／捷徑】讀檔進 campus %s %.2f 時、站在門柱連線%s %.0f m（%.1f, %.1f）' % (hh, side, DAY, h, '外' if side == 'out' else '內', OFF, x, GATE_Z))
                if not R.check('FAIL_SETUP 檢查：[%s %s] 讀檔以後在 campus' % (hh, side), s['zone'] == 'campus', s['zone']): continue
                await pg.evaluate(D.HUD + '(false)')
                ok = await pg.evaluate(PLACE, {'x': x, 'z': GATE_Z}); await pg.wait_for_timeout(int(WAIT_S * 1000))
                ci = await pg.evaluate(CAMINFO)
                behind = ci['cam'][0] < ci['player'][0] and ci['dir'][0] > 0.5
                R.check('FAIL_SETUP 檢查：[%s %s] 玩家在 (%.1f, %.1f)、鏡頭在背後往 +x 看' % (hh, side, x, GATE_Z), abs(ci['player'][0] - x) < 0.6 and abs(ci['player'][2] - GATE_Z) < 0.6 and behind, J(ci))
                R.note('[%s %s] 站得住=%s；遊戲鏡頭 %s' % (hh, side, ok, J(ci)))
                row = await shoot(pg, 'follow_' + side, hh); row['caminfo'] = ci; row['hour'] = h; res['rows'].append(row)
                if side == 'out':
                    for fade in (True, False):
                        r2 = await shoot(pg, 'fixed_wide_' + ('fade' if fade else 'nofade'), hh, FIXED, fade); r2['hour'] = h; res['rows'].append(r2)
                await pg.evaluate(D.HUD + '(true)')
                open(os.path.join(OUT, 'gate_blackdome.json'), 'w', encoding='utf-8').write(J(res))
            if GATE_REF:
                s = await D.load_zone(pg, cdp, 'campus', DAY, h, x=GATE_X + 6, z=GATE_Z, yaw=-math.pi / 2, wait=8000)
                R.setup('[%s 校園側]【前置／捷徑】讀檔進 campus、站在門內 6 m（%.1f, %.1f）面向校門（-x）' % (hh, GATE_X + 6, GATE_Z))
                await pg.evaluate(D.HUD + '(false)')
                await pg.evaluate("(a=>{ const P=GAME.E.player.obj; P.position.set(a.x,0,a.z); P.rotation.y=-Math.PI/2; const C=GAME.E.cam; C.yaw=Math.PI/2; C.manualT=30; })", {'x': GATE_X + 6, 'z': GATE_Z}); await pg.wait_for_timeout(int(WAIT_S * 1000))
                r3 = await shoot(pg, 'campus_side', hh); r3['hour'] = h; r3['caminfo'] = await pg.evaluate(CAMINFO); res['rows'].append(r3)
                await pg.evaluate(D.HUD + '(true)')
                if h == HOURS[0]:
                    walks = []
                    for zo in (0.0, 1.5, -1.5, 3.0, -3.0, 5.5, -5.5):   # z 0：新校門（aa876 GATE-REF）正中間是門房＋半圓花圃，本來就擋（只記）
                        await pg.evaluate("(a=>{ const P=GAME.E.player.obj; P.position.set(a.x,0,a.z); GAME.E.player.path=null; })", {'x': GATE_X - 6, 'z': GATE_Z + zo}); await pg.wait_for_timeout(800)
                        st0 = await pg.evaluate("(a=>GAME.E.canStand(a.x,a.z,0.3))", {'x': GATE_X - 6, 'z': GATE_Z + zo})
                        ok = await L.go_to(pg, cdp, R, GATE_X + 6, GATE_Z + zo, 0.8, '[%s] 走過校門通道 z%+.1f' % (hh, zo), max_s=40)
                        p_ = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; return [+P.x.toFixed(2), +P.z.toFixed(2)]; })()")
                        walks.append({'z_off': zo, 'start_stand': st0, 'reached': bool(ok), 'end': p_})
                    res['walk'] = walks; R.note('[%s] 走過校門通道（門柱連線外 6 m → 內 6 m）：%s' % (hh, J(walks)))
                    R.check('[%s] 門房兩側的通道（z ±3、±5.5）走得過去' % hh, all(w['reached'] for w in walks if abs(w['z_off']) >= 3), J(walks))
                    R.note('[%s] 門房前（z 0、±1.5）：%s（門房、花圃擋＝預期，BB 判）' % (hh, J([w for w in walks if abs(w['z_off']) < 3])))
                s = await D.load_zone(pg, cdp, 'gongguan', DAY, h, x=GG_GATE[0], z=GG_GATE[1] + 8, yaw=math.pi, wait=8000)
                R.setup('[%s 公館側]【前置／捷徑】讀檔進 gongguan、站在校門前 8 m（%.1f, %.1f）面向校門（-z）' % (hh, GG_GATE[0], GG_GATE[1] + 8))
                if R.check('FAIL_SETUP 檢查：[%s 公館側] 讀檔以後在 gongguan' % hh, s['zone'] == 'gongguan', s['zone']):
                    await pg.evaluate(D.HUD + '(false)')
                    await pg.evaluate("(a=>{ const P=GAME.E.player.obj; P.position.set(a.x,0,a.z); P.rotation.y=Math.PI; const C=GAME.E.cam; C.yaw=0; C.manualT=30; })", {'x': GG_GATE[0], 'z': GG_GATE[1] + 8}); await pg.wait_for_timeout(int(WAIT_S * 1000))
                    r4 = await shoot(pg, 'gongguan_side', hh); r4['hour'] = h; r4['caminfo'] = await pg.evaluate(CAMINFO); res['rows'].append(r4)
                    await pg.evaluate(D.HUD + '(true)')
                open(os.path.join(OUT, 'gate_blackdome.json'), 'w', encoding='utf-8').write(J(res))

        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
