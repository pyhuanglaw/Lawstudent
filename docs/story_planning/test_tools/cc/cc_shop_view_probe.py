"""CC-C 11-12：SHOP-INTERIOR-VIEW-1112（使用者在線上 v9.10.25 自己逛：泰米村食店內窗戶一片深藍、地上紫紅色球——「都給你電腦測試 你看不出來???」；BB-C 04:23 P0）。
判定歸 BB（逐張看）；這支只拍照、量數字。Playwright 手機橫向（PC GPU 有視窗）≠ iPhone。受測 1cd2116ee1。
第一輪：汀州路的店（TZ_SHOPS_LAYOUT：taimi、xile、yindehao、antai、xianguo、rongendian、limao、yuehaochi），BB 要先看泰米村食一間（SHOPS=taimi）。
  其他新店（gg 新三間、118 巷九間＋兩間飲料、新生南路七間、溫州街新店）各家配置的名字不一樣，泰米對了再照各自的配置補。
每一間、每個時間（HOURS，預設 14:00、20:30）：
  【前置／捷徑】load_zone 讀檔進店（spawn），等 8 秒＋模型載完；讀進來被趕出去（打烊）＝標「打烊，跳過」。
  拍四張（另一台相機，先跑 zone.fadeWalls＝和遊戲剖面視角同一個做法，不藏玩家）＋一張遊戲本身的鏡頭（HUD 收起來）：
    ① 進門全景：門口裡面 1.6 m 高往店裡  ② 往窗外：店中間後面往前牆的窗（TZ_SHOPS_LAYOUT.front.windows）看出去
    ③ 櫃檯：櫃檯前 2.5 m 看店員的位置  ④ 店外看進去：讀檔到門外（layout.out）往門裡看  ⑤ 遊戲鏡頭：站在 spawn、遊戲自己的鏡頭（E.camera 直接畫，沒有 HUD）
  每張記（量畫面像素，數字給 BB 參考，不判 PASS／FAIL）：紫紅色像素比例（缺貼圖常見的洋紅；r>170、b>140、g<90）、畫面中央 60% 亮度標準差（太小＝一片純色）、
    ② 另外記窗戶那一塊（畫面上半中間）的標準差和平均顏色（窗外是不是景）；店員在不在（E.npcs 離 layout.clerk 1.5 m 內）、客人幾個、門（「離開…」互動點）在不在。
CC_02 清單 2026-11-12：1✓ 2✓（位置全從 TZ_SHOPS_LAYOUT 讀） 3n/a（BB 指定每一間都拍，不挑候選） 4n/a（只拍照，不點畫面） 5n/a（不走路，讀檔進店） 6✓（等 8 秒＋ASSETS 載完才拍） 7✓ 8✓（洋紅門檻是 CC 訂的參考值，只記不判，已註明） 9✓（拍照鏡頭先跑 fadeWalls；不藏玩家：BB 要看店裡真的樣子） 10n/a（讀檔關條件事件、沒有選單） 11✓ 12✓（記讀檔後區域＝那一間） 13n/a（不走路）
用法：LW_TESTS=<wt>/tests SHA=<sha> [SHOPS=taimi,…] [HOURS=14,20.5] python3 cc_shop_view_probe.py <url> <out>"""
import os, sys, json, asyncio, base64, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
SHOPS = [s for s in (os.environ.get('SHOPS') or 'taimi').split(',') if s]
HOURS = [float(h) for h in (os.environ.get('HOURS') or '14,20.5').split(',') if h]
R = L.Run('shopview', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = '2025-10-22'
SETTLED = "(async()=>{ for(let i=0;i<120;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
LAY_JS = "(s=>{ const L=(typeof TZ_SHOPS_LAYOUT!=='undefined')&&TZ_SHOPS_LAYOUT[s]; return L?JSON.parse(JSON.stringify({zone:L.zone,name:L.name,w:L.w,d:L.d,h:L.h,spawn:L.spawn,exit:L.exit,out:L.out,outZone:L.outZone||'tingzhou',clerk:L.clerk||null,counter:L.counter||null,front:L.front||null})):null; })"
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||60, c.width/c.height, 0.05, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const z=E.zone, P=E.player&&E.player.obj; if(z&&z.fadeWalls){ try{ z.fadeWalls(cam,P?P.position:cam.position); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  try{ r.render(E.scene,cam); return c.toDataURL('image/png'); } finally { if(z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } } })"""   # 同 cc_tingzhou_probe.py
STATE_JS = r"""(a=>{ const E=GAME.E, N=E.npcs||[]; const f=v=>+(+v).toFixed(2);
  const ppl=N.filter(n=>n&&n.obj&&n.obj.visible!==false).map(n=>({id:n.charId||n.id||'', name:n.name||'', x:f(n.obj.position.x), z:f(n.obj.position.z), seat:!!n.seat}));
  const clerk=a.clerk?ppl.filter(p=>Math.hypot(p.x-a.clerk.x,p.z-a.clerk.z)<1.5):[];
  const door=(E.interactables||[]).filter(i=>!i.hidden&&i.exit).map(i=>({label:typeof i.label==='function'?i.label():i.label, x:f(i.x), z:f(i.z)}));
  return {zone:GAME.G.zone, hour:f(GAME.G.hour), npcs:ppl.length, clerk, customers:ppl.length-clerk.length, people:ppl.slice(0,8), door}; })"""


ANALYZE_JS = r"""(async u=>{ const im=await new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=u; }); const W=160, H=Math.round(160*im.height/im.width);
  const k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d'); g.drawImage(im,0,0,W,H); const d=g.getImageData(0,0,W,H).data;
  let mag=0; for(let i=0;i<d.length;i+=4){ if(d[i]>170&&d[i+2]>140&&d[i+1]<90) mag++; }
  const reg=(x0,y0,x1,y1)=>{ let n=0,s=0,s2=0,R=0,G=0,B=0; for(let y=Math.floor(y0*H);y<Math.floor(y1*H);y++) for(let x=Math.floor(x0*W);x<Math.floor(x1*W);x++){ const o=(y*W+x)*4, l=0.299*d[o]+0.587*d[o+1]+0.114*d[o+2]; n++; s+=l; s2+=l*l; R+=d[o]; G+=d[o+1]; B+=d[o+2]; }
    const m=s/n; return {mean:+m.toFixed(1), sd:+Math.sqrt(Math.max(0,s2/n-m*m)).toFixed(1), rgb:[Math.round(R/n),Math.round(G/n),Math.round(B/n)]}; };
  return {magenta_pct:+(mag*100/(W*H)).toFixed(2), center:reg(0.2,0.2,0.8,0.8), upper_mid:reg(0.25,0.1,0.75,0.45)}; })"""   # 在瀏覽器裡量（電腦那台 Python 不一定有 Pillow）
GAMECAM = "(()=>{ const E=GAME.E, r=E.renderer; r.render(E.scene,E.camera); return r.domElement.toDataURL('image/png'); })()"


async def snap(pg, fn, frm, at, fov=60):
    u = await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at), 'fov': fov}); b = base64.b64decode(u.split(',', 1)[1])
    open(os.path.join(OUT, fn), 'wb').write(b); return await pg.evaluate(ANALYZE_JS, u)


async def main():
    print('CC SHOP-INTERIOR-VIEW：SHA %s；SHOPS %s；HOURS %s；Playwright ≠ iPhone' % (SHA or '?', ','.join(SHOPS), HOURS), flush=True)
    rows = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for sid in SHOPS:
            Ly = await pg.evaluate(LAY_JS, sid)
            if not R.check('[%s] 有 TZ_SHOPS_LAYOUT.%s' % (sid, sid), bool(Ly), ''): continue
            W_, D_ = Ly['w'], Ly['d']; sp = Ly['spawn']; ck = Ly['clerk'] or {'x': 0, 'z': -D_ / 2 + 1}
            win = (Ly['front'] or {}).get('windows') or [[-W_ / 4, W_ / 4]]; wx = (win[0][0] + win[0][1]) / 2
            for h in HOURS:
                hh = '%02d%02d' % (int(h), int(round((h % 1) * 60))); tag = '[%s %s %s]' % (Ly['name'], Ly['zone'], hh)
                s = await D.load_zone(pg, cdp, Ly['zone'], DAY, h, x=sp['x'], z=sp['z'], yaw=sp.get('yaw', 0.0), wait=8000)
                R.setup('%s 【前置／捷徑】讀檔進店 %s %s %.2f 時 spawn (%.2f, %.2f)' % (tag, Ly['zone'], DAY, h, sp['x'], sp['z']))
                n = await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
                st = await pg.evaluate(STATE_JS, {'clerk': Ly['clerk']})
                row = {'shop': sid, 'name': Ly['name'], 'hour': h, 'state': st, 'assets_wait': n, 'shots': {}}
                if st['zone'] != Ly['zone']:
                    R.note('%s 讀檔以後在 %s（不是店裡）＝打烊或進不去，跳過這個時間' % (tag, st['zone'])); row['skipped'] = 'closed:' + st['zone']; rows.append(row); continue
                await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(500)
                u5 = await pg.evaluate(GAMECAM); open(os.path.join(OUT, 'shop_%s_%s_5_game.png' % (sid, hh)), 'wb').write(base64.b64decode(u5.split(',', 1)[1]))
                row['shots']['5_game'] = await pg.evaluate(ANALYZE_JS, u5)
                row['shots']['1_entry'] = await snap(pg, 'shop_%s_%s_1_entry.png' % (sid, hh), (sp['x'], 1.6, D_ / 2 - 0.4), (0.0, 1.2, -D_ / 2 + 1.0), 66)
                row['shots']['2_window'] = await snap(pg, 'shop_%s_%s_2_window.png' % (sid, hh), (wx * 0.4, 1.6, -D_ / 2 + 2.5), (wx, 1.8, D_ / 2 + 3.0), 60)
                row['shots']['3_counter'] = await snap(pg, 'shop_%s_%s_3_counter.png' % (sid, hh), (ck['x'], 1.6, ck['z'] + 3.2), (ck['x'], 1.1, ck['z']), 60)
                await pg.evaluate(D.HUD + '(true)')
                o = Ly['out']; oy = o.get('yaw', 0.0); fx, fz = math.sin(oy), math.cos(oy)
                s2 = await D.load_zone(pg, cdp, Ly['outZone'], DAY, h, x=o['x'], z=o['z'], yaw=oy, wait=8000)
                R.setup('%s 【前置／捷徑】讀檔到門外 %s (%.2f, %.2f)' % (tag, Ly['outZone'], o['x'], o['z']))
                await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
                row['shots']['4_outside'] = await snap(pg, 'shop_%s_%s_4_outside.png' % (sid, hh), (o['x'] + fx * 2.5, 1.6, o['z'] + fz * 2.5), (o['x'] - fx * 2.0, 1.4, o['z'] - fz * 2.0), 60)
                row['outside_zone'] = s2['zone']
                R.note('%s 店員 %s、客人 %d、門 %s；每張（洋紅%%／中央標準差／上半中間平均色）：%s' % (tag, J(st['clerk']), st['customers'], J(st['door']),
                       J({k: [v['magenta_pct'], v['center']['sd'], v['upper_mid']['rgb']] for k, v in row['shots'].items()})))
                R.check('%s 拍到 5 張' % tag, len(row['shots']) == 5, J(list(row['shots'])))
                rows.append(row)
                open(os.path.join(OUT, 'shopview.json'), 'w', encoding='utf-8').write(J({'sha': SHA, 'rows': rows}))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'shopview.json'), 'w', encoding='utf-8').write(J({'sha': SHA, 'rows': rows}))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
