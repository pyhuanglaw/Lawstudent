"""CC（帳號 A）11-10：公館騎樓五塊招牌（X323 GG-SIGNS，LAWWW2 b67955799：gongguan_shops.glb 只換招牌圖集；BB 20:08）。Playwright（PC GPU）≠ iPhone。
r2（BB 20:12）：16 間＝公館 5、新生南路 4、溫州街 6（2:30 AM 對照）＋日常失速；每組一張拼圖。店的位置照遊戲的互動點（label 或出口區域的名稱），店面方向用導航格找（最近擋住的那一邊）、相機在街上那一邊照空地距離放。原本五間：青木茶室、頁間書屋、慢輪單車、afar、轉角唱片——位置照遊戲的店門互動點（label「進入…」的 x；店面立面 FZ＝19、招牌燈箱 z 18.2～18.4、高 3.85／5.8 m，zones3d.js 941、gongguan_shops.glb GLOW_signbox／vsign）。
【前置／捷徑】讀檔到公館（gongguan）2025-11-01 14:00、20:00 各一次（天氣晴）；拍照鏡頭（不改遊戲鏡頭；拍的那一格把路人、玩家藏起來，拍完恢復）：
  正面＝騎樓外 (x, 2.2, 31) 平視看 (x, 4.3, 18.5)；斜 30°＝(x+6.25, 2.2, 29.3) 看同一點；fov 32（整塊招牌含上面的直招牌都在畫面裡）。
輸出：signs_<TAG>.jpg（5 列×4 欄：14 正面、14 斜、20 正面、20 斜，每格標店名／時間）；另每間 14 正面一張大圖。新舊兩個 SHA 各跑一次，回雲端並排。
用法：LW_TESTS=<wt>/tests TAG=new|old python3 cc_gg_signs_probe.py <url> <out>"""
import os, sys, json, asyncio, base64, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'new'
R = L.Run('gg_signs_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
GROUPS = [('gongguan', '公館', ['青木茶室', '頁間書屋', '慢輪單車', 'afar', '轉角唱片'], 3),
          ('xinsheng', '新生南路', ['山嵐', '同弦', '大口漢堡', '南洋戲院'], 9),
          ('wenzhou', '溫州街', ['SUNNY SIDE', '小路', '書店的櫥窗|溫州書屋', '夏日冰菓', '買一杯飲料|帝大紅茶', '2:30 AM'], 3),
          ('wenzhou', '日常失速', ['日常失速'], 3)]   # r3：第 4 欄＝相機最少退幾 m（新生南路 r2 相機在騎樓裡、招牌被天花板切掉 → 至少 9 m 不管導航格）；帝大紅茶在遊戲裡是「買一杯飲料」(17.4,−7.3)   # r2（BB 20:12）：16 間；溫州書屋在遊戲裡是「看書店的櫥窗」；2:30 AM 是對照組（本來就正）
ONLY = [g for g in (os.environ.get('GROUPS') or '').split(',') if g]
FIND = r"""((names,mind)=>{ const E=GAME.E, N=E.nav, ZN=id=>(typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[id]&&Z3.ZONES[id].name)||'';
  const free=(x,z)=>!N||N.free(x,z);
  return names.map(key=>{ const ks=key.split('|'), nm=ks[ks.length-1]; const it=(E.interactables||[]).find(i=>!i.hidden&&ks.some(k=>String(i.label||'').includes(k)||(i.exit&&ZN(i.exit.to).includes(k))));
    if(!it) return {nm, x:null};
    /* 店門朝哪邊：16 個方向找最近的擋住的格子＝店面那一邊；相反方向＝街上 */
    let best=null; for(let a=0;a<16;a++){ const t=a*Math.PI/8, dx=Math.sin(t), dz=Math.cos(t); for(let r=0.25;r<=3.5;r+=0.25){ if(!free(it.x+dx*r,it.z+dz*r)){ if(!best||r<best.r) best={r,dx,dz,t}; break; } } }
    if(!best) best={r:1.5,dx:0,dz:-1,t:Math.PI};
    let ox=-best.dx, oz=-best.dz; if(Math.abs(ox)>=Math.abs(oz)){ ox=Math.sign(ox); oz=0; } else { oz=Math.sign(oz); ox=0; }   /* r3：貼齊最近的軸（街都是沿 x 或 z；r2 斜 22.5°）*/
    let fr=best.r; for(let r=0.25;r<=3.5;r+=0.25){ if(!free(it.x-ox*r,it.z-oz*r)){ fr=r; break; } } const fx=it.x-ox*fr, fz=it.z-oz*fr;
    const run=(vx,vz)=>{ let d=0; for(let r=0.5;r<=12;r+=0.25){ if(!free(fx+vx*r,fz+vz*r)) break; d=r; } return d; };
    const dOut=run(ox,oz), dist=Math.max(mind||3,Math.min(10,dOut*0.85));
    const rot=(ang)=>{ const c=Math.cos(ang), s=Math.sin(ang); return [ox*c-oz*s, ox*s+oz*c]; };
    let ob=null; for(const ang of [Math.PI/6,-Math.PI/6]){ const v=rot(ang), d=run(v[0],v[1]); if(!ob||d>ob.d) ob={v,d,ang}; }
    const dOb=Math.max(mind||3,Math.min(dist,ob.d*0.85));
    return {nm, label:it.label, to:it.exit?it.exit.to:null, x:+it.x.toFixed(2), z:+it.z.toFixed(2), face:[+fx.toFixed(2),+fz.toFixed(2)], out:[+ox.toFixed(2),+oz.toFixed(2)], dOut:+dOut.toFixed(2), dist:+dist.toFixed(2),
      front:[+(fx+ox*dist).toFixed(2),2.2,+(fz+oz*dist).toFixed(2)], obl:[+(fx+ob.v[0]*dOb).toFixed(2),2.2,+(fz+ob.v[1]*dOb).toFixed(2)], dOb:+dOb.toFixed(2), at:[+fx.toFixed(2),3.6,+fz.toFixed(2)]}; }); })"""
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
        try:
            for zone, title, keys, mind in GROUPS:
                if ONLY and title not in ONLY: continue
                await pg.evaluate("window.__GS=[]")
                cnt = 0
                for h in (14.0, 20.0):
                    await D.load_zone(pg, cdp, zone, '2025-11-01', h, wait=8000)
                    R.setup('【前置／捷徑】讀檔到 %s 2025-11-01 %02d:00（晴）' % (zone, h))
                    shops = await pg.evaluate("(%s)(%s,%s)" % (FIND, J(keys), mind))
                    R.note('[%s] %02d:00 店（門口、店面方向、相機）：%s' % (title, h, J(shops)))
                    if any(q['x'] is None for q in shops):
                        its = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>[i.label,+i.x.toFixed(1),+i.z.toFixed(1),i.exit?i.exit.to:null]))()")
                        R.note('[%s] 找不到的店；這一區的互動點：%s' % (title, J(its)[:1500]))
                    for q in shops:
                        if q['x'] is None:
                            if h == 14.0: R.check('[%s] 找得到「%s」' % (title, q['nm']), False, '')
                            continue
                        for kind, frm in (('正面', q['front']), ('斜30°', q['obl'])):
                            dd = math.dist(frm[::2], q['at'][::2]); fov = max(30, min(80, 2 * math.degrees(math.atan2(3.8, dd))))
                            u = await pg.evaluate(SNAP, {'from': frm, 'at': q['at'], 'fov': fov, 'tw': 420, 'label': '%s %s %02d:00 %s %s' % (TAG, sha, h, q['nm'], kind), 'full': kind == '正面' and h == 14.0})
                            cnt += 1
                            if u: open(os.path.join(OUT, 'sign_%s_%s_%s.jpg' % (TAG, zone, q['nm'].replace(' ', '').replace(':', ''))), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
                n = len(keys)
                R.check('[%s] %d 間都拍到 14、20 時各兩張（%d 張）' % (title, n, cnt), cnt == n * 4, str(cnt))
                if cnt:
                    await pg.evaluate("(n=>{ const L=window.__GS, h=L.length/2, out=[]; for(let i=0;i<h/2;i++){ out.push(L[2*i],L[2*i+1],L[h+2*i],L[h+2*i+1]); } window.__GS=out; })(%d)" % n)
                    u = await pg.evaluate(MONT, {'cols': 4, 'title': '%s 招牌 %s %s：每列一間（14 正面、14 斜 30°、20 正面、20 斜 30°）' % (title, TAG, sha)})
                    open(os.path.join(OUT, 'signs_%s_%s.jpg' % (TAG, zone if title != '日常失速' else 'offbeat')), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
        except Exception as e:
            R.check('沒有中斷', False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
