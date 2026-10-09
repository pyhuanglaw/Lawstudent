"""導航格「小孤島」掃描：每個區域用 0.1 m 間距取樣 canStand（玩家半徑 0.3），找出和主要可走區域不相連、面積很小的可站區塊。
這種孤島四周都站不住：玩家（尤其低幀率一步很大時）沿牆滑進去之後，往哪個方向推都出不來（v9.3 #31 宿舍書桌後面）。
用法：python3 tools/dev_scratch/nav_islands.py [URL] [區域 id ...]（預設全部區域；URL 預設 http://127.0.0.1:8765/index.html）
輸出每個區域的孤島數量與位置；面積 < 0.5 m² 而且離主要區域 1.5 m 內的列為 SUSPECT（玩家可能跳進去）。"""
import asyncio, json, sys
from playwright.async_api import async_playwright
URL = (sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].startswith('http') else 'http://127.0.0.1:8765/index.html') + '?turbo'
ZONES = [a for a in sys.argv[1:] if not a.startswith('http')] or ['dorm', 'classroom', 'library', 'cafe', 'cvs', 'noodle', 'bookstore', 'wancai', 'wenzhou', 'gongguan', 'campus']
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True}
SCAN = """(()=>{ const E=GAME.E, n=E.nav; const x0=n.x0!==undefined?n.x0:(n.ox!==undefined?n.ox:null);
  // NavGrid 的範圍：用 toWorld(0,0) 與 toWorld(cols-1,rows-1)
  const a=n.toWorld(0,0), b=n.toWorld(n.cols-1,n.rows-1); const minx=Math.min(a[0],b[0]), maxx=Math.max(a[0],b[0]), minz=Math.min(a[1],b[1]), maxz=Math.max(a[1],b[1]);
  const h=0.1, W=Math.floor((maxx-minx)/h)+1, H=Math.floor((maxz-minz)/h)+1; const S=new Uint8Array(W*H);
  for(let j=0;j<H;j++) for(let i=0;i<W;i++){ S[j*W+i]=E.canStand(minx+i*h,minz+j*h,0.3)?1:0; }
  const lab=new Int32Array(W*H).fill(-1); const comps=[]; const q=new Int32Array(W*H);
  for(let s=0;s<W*H;s++){ if(!S[s]||lab[s]>=0) continue; let qh=0, qt=0; q[qt++]=s; lab[s]=comps.length; let cnt=0, sx=0, sz=0;
    while(qh<qt){ const c=q[qh++]; cnt++; const ci=c%W, cj=(c/W)|0; sx+=ci; sz+=cj; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ni=ci+di, nj=cj+dj; if(ni<0||nj<0||ni>=W||nj>=H) continue; const k=nj*W+ni; if(S[k]&&lab[k]<0){ lab[k]=comps.length; q[qt++]=k; } } }
    comps.push({n:cnt,x:+(minx+sx/cnt*h).toFixed(2),z:+(minz+sz/cnt*h).toFixed(2)}); }
  comps.sort((p,q)=>q.n-p.n); const main=comps[0];
  // 小孤島離主要區域多遠（取樣找最近的主要區域點）
  const mainLab=lab.indexOf(-2); const isles=comps.slice(1).filter(c=>c.n<50);
  const mainIdx=comps.length? (()=>{ let best=-1,bn=-1; const cntBy={}; for(let s=0;s<W*H;s++){ if(lab[s]>=0){ cntBy[lab[s]]=(cntBy[lab[s]]||0)+1; } } for(const k in cntBy){ if(cntBy[k]>bn){ bn=cntBy[k]; best=+k; } } return best; })() : -1;
  for(const c of isles){ const ci=Math.round((c.x-minx)/h), cj=Math.round((c.z-minz)/h); let best=1e9; for(let r=1;r<=20&&best>1e8;r++){ for(let dj=-r;dj<=r;dj++) for(let di=-r;di<=r;di++){ if(Math.max(Math.abs(di),Math.abs(dj))!==r) continue; const i=ci+di, j=cj+dj; if(i<0||j<0||i>=W||j>=H) continue; if(lab[j*W+i]===mainIdx) best=Math.min(best,Math.hypot(di,dj)*h); } } c.distMain=best>1e8?null:+best.toFixed(2); c.area=+(c.n*h*h).toFixed(2); }
  return {grid:[W,H], comps:comps.length, main:main, isles}; })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 480, 'height': 360})
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        suspects = 0
        for zid in ZONES:
            st = {'zone': zid, 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 0, 'z': 0, 'yaw': 0}, 'flags': FLAGS}
            await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st))
            await pg.wait_for_timeout(600)
            r = await pg.evaluate(SCAN)
            sus = [c for c in r['isles'] if c['area'] < 0.5 and c['distMain'] is not None and c['distMain'] <= 1.5]
            suspects += len(sus)
            print(f"{zid:10s} grid {r['grid']} components {r['comps']} main {r['main']['n']*0.01:.0f} m²; small isles {len(r['isles'])}; SUSPECT {len(sus)}")
            for c in sus[:12]: print(f"   SUSPECT island at ({c['x']},{c['z']}) area {c['area']} m², {c['distMain']} m from main area")
        print('ALL CLEAR' if not suspects else f'SUSPECTS: {suspects}')
        await b.close()
asyncio.run(main())
