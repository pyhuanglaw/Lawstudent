"""CC（帳號 A）11-04：WZ_A5_shot——溫州街 A5 日和便利店的新招牌（LAWWW 4e3f6ccef，接 LAWWW2 93dbf8b99：和公館 G03 同一張參考圖，米白燈箱、橘色太陽、橄欖綠字；
  舊的「日日便利」是白底青綠字）。測 23eaaa7ae（GLB 和 c7fde4f3e 相同）。
  D 白天：【前置／捷徑】讀檔：溫州街、A5 店門前的路上 (45.8, 0.4)、2025-09-23（二）14:00、條件事件關閉。
     → 真的走到對街看得到招牌的地方（約 (44, −2.2)）→ 用手指滑鏡頭對準招牌 (44, 4.5)（玩家視角另存 wz_a5_day_follow.png）→ 【捷徑：拍照】E.cinematic 從對街拉遠抬高、藏起玩家 → 截圖 wz_a5_day.png（檢查招牌四角都在畫面內、在中上方）→ 收回鏡頭 → 卡住檢查
  N 晚上：同上、20:00 → 截圖 wz_a5_night.png → 卡住檢查
  招牌檢查（每次）：
    ① 溫州街正式模型的招牌網格在：掃所有材質 wz_signs_lit 的網格（sk_sign_A2C 也用這個材質），挑 A5 那一塊有頂點的（節點 wz_signs_lit；4e3f6ccef 的 riri_mart_h 改成 hiyori_mart_fit）
    ② A5 那一塊招牌（網格裡世界座標 x 40.5～47.5、y 2～7 的頂點）貼到的是新圖：取那些頂點 UV 範圍內的貼圖顏色——
       平均偏米白（R−B ≥ 8；舊的白底 R−B≈0）、沒有舊招牌的青綠字（B > R+30 且 G > R+20 的點）；印出橄欖綠、橘色點的數目當參考
    ③ 套件備用招牌的字色也換了（zones3d.js A5 shop.signColor＝#5a6b2e；只印出，不判）
  卡住檢查：對話框關掉、GAME.D.busyDepth 0、搖桿推得動 ≥ 0.3 m（四個方向試）、GAME.walkFallbacks 沒有增加、沒有 JS 例外。
用法：LW_TESTS=<wt>/tests [CASES=D,N] python3 cc_wz_a5_shot_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
CASES = [c.strip() for c in (os.environ.get('CASES') or 'D,N').split(',') if c.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'BIKE_TIP': True}
DAY, WD = 7, 2
START = (45.8, 0.4)     # A5 店門（wzshops3d.js AA413.cvs.enter (45.8, 3.8)）前的路上
PHOTO = (44.0, -2.2)    # 對街（B 側機車在 z −3.95）
SIGN = (44.0, 4.5)      # A5 招牌（aptA x 40～48）
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


class Run:   # playlib.go_to 要的最小介面
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, info=''): return check(n, ok, info)


ST = """(()=>{ const G=GAME.G, E=GAME.E, P=E.player, p=P.obj.position, D=GAME.D||{};
  return {zone:G.zone, hour:+(+G.hour).toFixed(3), x:+p.x.toFixed(2), z:+p.z.toFixed(2), dlg:!!D.active, depth:D.busyDepth|0, busy:!!P.busy,
    name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:String(D.full||((document.getElementById('dlgText')||{}).textContent)||'').slice(0,120),
    choices:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim()), fb:GAME.walkFallbacks||0}; })()"""
GLB_JS = """(()=>{ const g=GAME.E.zone&&GAME.E.zone.group; return {glb:!!(g&&g.getObjectByName('wenzhou_street_glb')), man:!!ASSETS.manifest['bldg.wenzhou_street']}; })()"""
SIGN_JS = """(()=>{ const g=GAME.E.zone.group; g.updateMatrixWorld(true);
  /* 用 wz_signs_lit 材質的網格不只一個（sk_sign_A2C 也是，A2 的轉角招牌）：全部掃，挑 A5 那一塊有頂點的（c7fde4f3e／23eaaa7ae 的 GLB：節點 wz_signs_lit、40 個頂點，A5 那 4 個在 x 40.75～47.25、y 2.95～4.08、z 4.8）*/
  const ms=[]; g.traverse(o=>{ if(o.isMesh&&(o.name==='wz_signs_lit'||(o.material&&o.material.name==='wz_signs_lit'))) ms.push(o); });
  if(!ms.length) return {found:false};
  const v=new THREE.Vector3(), per=[]; let best=null;
  for(const m of ms){ const pos=m.geometry.attributes.position, uv=m.geometry.attributes.uv; if(!pos||!uv) continue; let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9,n=0,box=[1e9,-1e9,1e9,-1e9,1e9,-1e9];
    for(let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i).applyMatrix4(m.matrixWorld); if(v.x<40.5||v.x>47.5||v.y<2||v.y>7||v.z<0.5||v.z>10) continue; n++; const a=uv.getX(i), b=uv.getY(i); u0=Math.min(u0,a); u1=Math.max(u1,a); v0=Math.min(v0,b); v1=Math.max(v1,b);
      box=[Math.min(box[0],v.x),Math.max(box[1],v.x),Math.min(box[2],v.y),Math.max(box[3],v.y),Math.min(box[4],v.z),Math.max(box[5],v.z)]; }
    per.push({name:m.name, verts:pos.count, a5:n}); if(n&&(!best||n>best.n)) best={m,n,u0,u1,v0,v1,box}; }
  const out={found:true, meshes:per, name:best?best.m.name:null, mat:best?best.m.material.name:'wz_signs_lit', nVerts:best?best.n:0};
  if(!best) return out;
  const m=best.m, mat=m.material, img=mat.map&&mat.map.image; const {u0,u1,v0,v1}=best;
  out.uv=[+u0.toFixed(3),+u1.toFixed(3),+v0.toFixed(3),+v1.toFixed(3)]; out.box=best.box.map(q=>+q.toFixed(2)); out.img=img?[img.width,img.height]:null; out.flipY=mat.map?mat.map.flipY:null;
  if(!img) return out;
  try{ const W=img.width, H=img.height, c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d'); x.drawImage(img,0,0);
    let R=0,Gs=0,B=0,k=0,olive=0,orange=0,teal=0;
    for(let i=0;i<=24;i++) for(let j=0;j<=8;j++){ const uu=u0+(u1-u0)*(0.03+0.94*i/24), vv=v0+(v1-v0)*(0.05+0.9*j/8); const px=Math.min(W-1,Math.max(0,Math.round(uu*W))), py=Math.min(H-1,Math.max(0,Math.round((mat.map.flipY?1-vv:vv)*H)));
      const d=x.getImageData(px,py,1,1).data; R+=d[0]; Gs+=d[1]; B+=d[2]; k++;
      if(d[1]>=d[0]&&d[1]>d[2]+25&&d[0]<170) olive++; if(d[0]>190&&d[1]>90&&d[1]<190&&d[2]<110) orange++; if(d[2]>d[0]+30&&d[1]>d[0]+20) teal++; }
    out.mean=[Math.round(R/k),Math.round(Gs/k),Math.round(B/k)]; out.olive=olive; out.orange=orange; out.teal=teal; out.samples=k; }catch(e){ out.err=String(e); }
  return out; })()"""
KIT_JS = """(()=>{ let col=null; GAME.E.zone.group.traverse(o=>{ if(o.userData&&o.userData.wzApt==='A5') col='A5 套件在（正式模型接上後藏起來）'; }); return col; })()"""
PHOTO_JS = """(([x,z])=>{ const E=GAME.E; for(let r=0;r<=3.01;r+=0.25) for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, px=x+Math.sin(a)*r, pz=z+Math.cos(a)*r; if(E.canStand(px,pz,0.35,0)) return [+px.toFixed(2),+pz.toFixed(2)]; } return null; })(%s)"""


async def converse(pg, cdp, tag, max_s=30):
    """途中跳出來的對話：逐句印出來（transcript）、點到底、選第一個"""
    last = None; t0 = time.time(); idle = None
    while time.time() - t0 < max_s:
        s = await pg.evaluate(ST)
        if s['choices']:
            print('  [%s] 選單 %s → %s' % (tag, J(s['choices']), s['choices'][0]), flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(1)'); await pg.wait_for_timeout(900); idle = None; continue
        if s['dlg']:
            if (s['name'], s['text']) != last: last = (s['name'], s['text']); print('  [%s] %s：%s' % (tag, s['name'] or '（旁白）', s['text']), flush=True)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); idle = None; continue
        if s['depth'] == 0 and not s['busy']:
            if idle is None: idle = time.time()
            if time.time() - idle > 2.0: return True
        await pg.wait_for_timeout(500)
    return False


async def stuck_check(pg, cdp, tag, fb0, e0, errs):
    """卡住檢查：對話框關掉、busyDepth 0、搖桿推得動 ≥ 0.3 m（前、後、右、左都試，前面是牆不算卡住）、walkFallbacks 沒增加、沒有新的 JS 例外"""
    await converse(pg, cdp, tag, 15)
    moved = 0.0
    for dx, dy in ((0, -60), (0, 60), (60, 0), (-60, 0)):
        moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2, ms=1500)
        if moved >= 0.3: break
    s = await pg.evaluate(ST); new = errs[e0:]
    ok = (not s['dlg'] and not s['choices'] and s['depth'] == 0 and moved >= 0.3 and s['fb'] == fb0 and not new)
    check('[%s] 卡住檢查（對話關、busyDepth 0、搖桿 ≥0.3 m、walkFallbacks 沒增加、沒有 JS 例外）' % tag, ok,
          J({'dlg': s['dlg'], 'depth': s['depth'], 'moved': round(moved, 2), 'fb': [fb0, s['fb']], 'errs': new[:2]}))
    if not ok: await pg.screenshot(path=os.path.join(OUT, 'STUCK_%s.png' % tag))
    return ok


async def one(pg, cdp, tag, hour, fn, errs):
    print('== %s（%02d:00）' % (tag, int(hour)), flush=True)
    print('  [前置／捷徑] 讀檔：溫州街 A5 日和便利店門前的路上 %s、2025-09-23（二）%02d:00、條件事件關閉' % (J(START), int(hour)), flush=True)
    await L.load_state(pg, {'zone': 'wenzhou', 'hour': hour, 'day': DAY, 'weekday': WD, 'weather': 'clear', 'flags': FLAGS, 'money': 3000, 'pos': {'x': START[0], 'z': START[1], 'yaw': 0, 'lv': 0}}, quiet_events=True)
    await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp); await converse(pg, cdp, tag + '_pre', 20)
    t0 = time.time(); g = None
    while time.time() - t0 < 90:
        g = await pg.evaluate(GLB_JS)
        if g['glb'] or not g['man']: break
        await pg.wait_for_timeout(1500)
    check('[%s] 溫州街正式模型載入' % tag, g['glb'], J(g))
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    sg = await pg.evaluate(SIGN_JS)
    print('  [%s] 招牌：%s；套件：%s' % (tag, J(sg), await pg.evaluate(KIT_JS)), flush=True)
    check('[%s] ① 招牌網格（材質 wz_signs_lit）在、A5 那一塊有頂點（掃所有用這個材質的網格）' % tag, sg.get('found') and (sg.get('nVerts') or 0) >= 4, J({k: sg.get(k) for k in ('found', 'name', 'mat', 'nVerts', 'box', 'meshes')}))
    if sg.get('mean'):
        r, gg, bb = sg['mean']
        check('[%s] ② A5 招牌貼到新圖：平均偏米白（R−B ≥ 8）、沒有舊「日日便利」的青綠字' % tag, r - bb >= 8 and sg['teal'] == 0,
              J({'mean': sg['mean'], 'olive': sg['olive'], 'orange': sg['orange'], 'teal': sg['teal'], 'uv': sg['uv']}))
    else:
        check('[%s] ② 讀得到 A5 招牌的貼圖顏色' % tag, False, J(sg))
    ph = await pg.evaluate(PHOTO_JS % J(list(PHOTO)))
    ok = bool(ph) and await L.go_to(pg, cdp, Run(), ph[0], ph[1], 0.6, '對街看得到 A5 招牌的地方')
    s = await pg.evaluate(ST)
    check('[%s] 真的走到拍招牌的位置 %s' % (tag, J(ph)), ok, J({k: s[k] for k in ('x', 'z')}))
    turned = await L.turn_camera_to(pg, cdp, SIGN[0], SIGN[1])
    await pg.wait_for_timeout(1500)
    await pg.screenshot(path=os.path.join(OUT, fn.replace('.png', '_follow.png')))   # 玩家視角（跟隨鏡頭）留一張參考
    bx = sg.get('box') or [40.75, 47.25, 2.95, 4.08, 4.8, 4.8]
    cx, cy, cz = (bx[0] + bx[1]) / 2, (bx[2] + bx[3]) / 2, (bx[4] + bx[5]) / 2
    print('  [捷徑：拍照] 用遊戲的劇情鏡頭 E.cinematic 從對街 (%.1f, 2.2, %.1f) 看招牌中心下方 0.4 m (%.1f, %.2f, %.1f)（招牌落在畫面中上方），拍照時把玩家藏起來（拍完放回、結束劇情鏡頭）' % (cx, cz - 8.6, cx, cy - 0.4, cz), flush=True)
    await pg.evaluate("(([px,py,pz,lx,ly,lz])=>{ const E=GAME.E; E.player.obj.visible=false; E.cinematic(new THREE.Vector3(px,py,pz),new THREE.Vector3(lx,ly,lz)); })(%s)" % J([cx, 2.2, cz - 8.6, cx, cy - 0.4, cz]))
    await pg.wait_for_timeout(3500)
    vis = await pg.evaluate("(([x0,x1,y0,y1,z])=>{ const cam=GAME.E.camera; cam.updateMatrixWorld(true); const pts=[[x0,y0],[x1,y0],[x0,y1],[x1,y1]].map(([x,y])=>new THREE.Vector3(x,y,z).project(cam)); return {inView:pts.every(p=>Math.abs(p.x)<=0.98&&Math.abs(p.y)<=0.98&&p.z<1), ys:pts.map(p=>+((1-p.y)/2).toFixed(2)), xs:pts.map(p=>+((p.x+1)/2).toFixed(2))}; })(%s)" % J([bx[0], bx[1], bx[2], bx[3], bx[4]]))
    await pg.screenshot(path=os.path.join(OUT, fn))
    print('  [%s] 截圖 %s（招牌四角在畫面上的位置 %s）' % (tag, fn, J(vis)), flush=True)
    check('[%s] 截圖裡整塊招牌都在畫面裡、在中上方（四角都在畫面內，中心在上半到中間）' % tag, vis['inView'] and sum(vis['ys']) / 4 <= 0.6, J(vis))
    await pg.evaluate("(()=>{ const E=GAME.E; E.player.obj.visible=true; if(E.endCinematic) E.endCinematic(); })()")
    await pg.wait_for_timeout(2500)
    check('[%s] 鏡頭轉到招牌方向（玩家視角）' % tag, turned)
    await stuck_check(pg, cdp, tag, fb0, e0, errs)


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        if 'D' in CASES: await one(pg, cdp, 'D_day', 14.0, 'wz_a5_day.png', errs)
        if 'N' in CASES: await one(pg, cdp, 'N_night', 20.0, 'wz_a5_night.png', errs)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:10])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
