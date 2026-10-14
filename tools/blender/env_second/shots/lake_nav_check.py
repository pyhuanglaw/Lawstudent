"""醉月湖（⑩）的導航和正式模型對不對得上：用遊戲自己的 E.canStand（人物半徑）、E.simWalk（走路模擬）量——
  1. 木棧道：人站得到的位置離中線最遠多少（＋身體半徑 0.33）→ 和欄杆內側比（正式模型 ±1.055、第一版 ±0.755、程序化 ±0.77）
  2. 湖心亭：站得到的位置和六根柱子（半徑 2.3 的六個頂點；柱身半徑 0.105）的最小距離（負的＝身體穿進柱子）；
     身體超出平台邊緣多少（平邊朝南北的六角形、外接圓 2.7、邊心距 2.338；南邊接木棧道不算）
  3. 從南岸步道走到亭子中間、走回來；走到亭子裡五個方向的邊上（E.simWalk）
導航的幾種做法在同一頁裡換（只改湖心亭附近的格子，和 zones3d.js lake() 的算法一樣），不用重新載入：
  current＝遊戲現在（亭子中心 2.35 m 內走得到、柱子不擋）；其他＝亭子半徑 R＋把六根柱子所在的格子擋起來。
用法：python3 tools/blender/env_second/shots/lake_nav_check.py <URL> <輸出.json>（遊戲要有方案 A 的醉月湖 (−36, −112)；只量導航，不需要正式模型）"""
import asyncio, json, sys
from playwright.async_api import async_playwright
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
VARIANTS = [('current', 2.35, False), ('R2.1+柱', 2.1, True), ('R2.0+柱', 2.0, True), ('R1.9+柱', 1.9, True)]
JS = r"""
(V=>{
  const E=GAME.E, nav=E.navOf?E.navOf(0):E.nav; const cx=-36, cz=-112;
  const A=16.5, B=9.2, N=80; const rad=t=>1+0.10*Math.sin(3*t+0.6)+0.05*Math.cos(5*t+1.3);
  const P=[]; for(let i=0;i<N;i++){ const t=i/N*Math.PI*2, r=rad(t); P.push([cx+Math.cos(t)*A*r, cz+Math.sin(t)*B*r]); }
  const NR=P.map((p,i)=>{ const a=P[(i-1+N)%N], b=P[(i+1)%N]; let nx=b[1]-a[1], nz=-(b[0]-a[0]); const l=Math.hypot(nx,nz)||1; nx/=l; nz/=l; if(nx*(p[0]-cx)+nz*(p[1]-cz)<0){ nx=-nx; nz=-nz; } return [nx,nz]; });
  const PX=cx-3, PZ=cz+0.6, PR=2.7, BW=1.7; const bwZ0=PZ+PR-0.4, bwZ1=cz+13.4;
  const onBoard=(x,z)=>Math.abs(x-PX)<=BW/2+0.05&&z>=bwZ0-0.2&&z<=bwZ1+0.2;
  const out=P.map((p,i)=>[p[0]+NR[i][0]*1.25,p[1]+NR[i][1]*1.25]); const inside=(x,z)=>{ let c=false; for(let i=0,j=out.length-1;i<out.length;j=i++){ const a=out[i], b=out[j]; if(((a[1]>z)!==(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])) c=!c; } return c; };
  const cols=[0,1,2,3,4,5].map(k=>[PX+Math.cos(k*Math.PI/3)*2.3, PZ+Math.sin(k*Math.PI/3)*2.3]);
  // 1. 換導航：亭子附近的格子照 lake() 的算法重算（半徑 V.R），需要時擋掉柱子所在的格子
  for(let z=PZ-3.4;z<=PZ+3.0;z+=nav.cell) for(let x=PX-3.4;x<=PX+3.4;x+=nav.cell){ const [ix,iz]=nav.toCell(x,z); const [wx,wz]=nav.toWorld(ix,iz); if(!inside(wx,wz)) continue; const free=onBoard(wx,wz)||Math.hypot(wx-PX,wz-PZ)<V.R; nav.b[nav.idx(ix,iz)]=free?0:1; }
  if(V.cols) for(const c of cols){ const [ix,iz]=nav.toCell(c[0],c[1]); nav.b[nav.idx(ix,iz)]=1; }
  nav._cm=null;
  // 2. 站得到的位置（2 cm 格點，只看湖裡面：外擴 1.25 m 的湖岸多邊形裡）
  const r=(E.player&&E.player.radius)||0.3, BODY=0.33; let colGap=99, colAt=null, edge=-99, edgeAt=null, bx=0, bxAt=null, n=0;
  const apo=PR*Math.cos(Math.PI/6);
  for(let x=PX-3.2;x<=PX+3.2;x+=0.02) for(let z=PZ-3.2;z<=cz+12;z+=0.02){
    if(!inside(x,z)||!E.canStand(x,z,r,0)) continue; n++;
    if(z<=PZ+apo){ for(const c of cols){ const g=Math.hypot(x-c[0],z-c[1])-BODY-0.105; if(g<colGap){ colGap=g; colAt=[+x.toFixed(2),+z.toFixed(2)]; } }
      for(let k=0;k<6;k++){ const a=(k+0.5)*Math.PI/3; if(Math.abs(Math.sin(a)-1)<1e-6) continue;   /* 南邊（+z）接木棧道 */
        const o=(x-PX)*Math.cos(a)+(z-PZ)*Math.sin(a)+BODY-apo; if(o>edge){ edge=o; edgeAt=[+x.toFixed(2),+z.toFixed(2)]; } } }
    else { const d=Math.abs(x-PX)+BODY; if(d>bx){ bx=d; bxAt=[+x.toFixed(2),+z.toFixed(2)]; } }
  }
  // 3. 走路模擬
  const walks={}; const shore=[PX,cz+14.2];
  walks.shore_to_center=E.simWalk(shore[0],shore[1],PX,PZ); walks.center_to_shore=E.simWalk(PX,PZ,shore[0],shore[1]);
  for(const [nm,a] of [['N',-Math.PI/2],['NE',-Math.PI/6],['SE',Math.PI/6],['SW',5*Math.PI/6],['NW',-5*Math.PI/6]]){ const d=V.R-0.25; walks['center_to_'+nm]=E.simWalk(PX,PZ,PX+Math.cos(a)*d,PZ+Math.sin(a)*d); }
  for(const k in walks){ const w=walks[k]; walks[k]=w&&w.ok?'ok':(w?w.reason||'fail':'null'); }
  const pavCells=[]; for(let z=PZ-3;z<=PZ+2.6;z+=nav.cell) for(let x=PX-3;x<=PX+3;x+=nav.cell){ const [ix,iz]=nav.toCell(x,z); if(!nav.b[nav.idx(ix,iz)]) pavCells.push(1); }
  return {variant:V.name, R:V.R, cols:V.cols, standable_pts:n, col_gap_min:+colGap.toFixed(3), col_gap_at:colAt, edge_overhang_max:+edge.toFixed(3), edge_at:edgeAt,
          board_body_max:+bx.toFixed(3), board_at:bxAt, free_cells_near_pavilion:pavCells.length, walks};
})
"""


async def main():
    url, outp = sys.argv[1], sys.argv[2]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 640, 'height': 400}, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=UA)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(url)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        st = {'zone': 'campus', 'hour': 13.0, 'pos': {'x': -39, 'z': -97.4, 'lv': 0, 'yaw': 3.14}, 'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}}
        await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,%s); s.day=8; s.weekday=6; s.weather='sunny'; document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })()" % json.dumps(st, ensure_ascii=False))
        await pg.wait_for_timeout(1500)
        res = []
        for name, R, cols in VARIANTS:
            r = await pg.evaluate(JS + "(%s)" % json.dumps({'name': name, 'R': R, 'cols': cols}, ensure_ascii=False))
            print(json.dumps(r, ensure_ascii=False)); res.append(r)
        json.dump({'url': url, 'results': res, 'errors': errs}, open(outp, 'w'), ensure_ascii=False, indent=1)
        await b.close()


asyncio.run(main())
