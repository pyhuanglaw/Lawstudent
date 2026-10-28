"""BB-C 10-28：NPC 站位會不會擋路、穿模（LAWWW-C 07:55：總圖一樓影印機前以安 (10.35,2.35)、芯慈 (10.35,2.95)；霖澤館一樓電梯前宥辰 (3.2,-4.1)，原本 (4.6,-4.3)）。不需要瀏覽器。
借 tests/wz_park_unit.js 的 Node 架子（在 Node 裡建出真正的區域）；用法：python3 npc_spot_check.py <工作樹> [DUMP=1 印出區域裡所有互動點]
每個站位印出：
  ① 站得住嗎（半徑 0.3）；離最近的導航阻擋多遠（往 8 個方向找第一個站不住的半徑 0.05 點）＝身體和家具會不會穿模
  ② 要看的互動點（服務台、電梯叫車鈕…）：互動範圍內「最近的互動＝它」的站位，扣掉離 NPC 不到 0.62 m（玩家 0.32＋NPC 0.3）的，還剩幾個、走不走得到
  ③ 從入口用引擎的找路（E.pathTo）走到那個互動點，路線離 NPC 最近多少（< 0.62 m＝要擠過去或被擋）
這是模擬，不是真實玩家流程；畫面穿模另外截圖看。"""
import sys, os, subprocess, tempfile, json
root = os.path.abspath(sys.argv[1])
src = open(os.path.join(root, 'tests/wz_park_unit.js'), encoding='utf-8').read()
head = src[:src.index("check('1.")].replace("path.resolve(__dirname,'..')", repr(root))
tail = r"""
const DUMP=!!process.env.DUMP; const P=()=>E.player.obj.position;
const CASES=[
  {zone:'library_hall', lv:0, name:'總圖一樓影印機前', npcs:[['以安',10.35,2.35],['芯慈',10.35,2.95]], targets:/服務|館員|電梯|影印|閘/},
  {zone:'linze', lv:0, name:'霖澤館一樓電梯前（新）', npcs:[['宥辰',3.2,-4.1]], targets:/電梯/},
  {zone:'linze', lv:0, name:'霖澤館一樓電梯前（舊 4.6,-4.3 對照）', npcs:[['宥辰',4.6,-4.3]], targets:/電梯/},
];
const fmt=w=>w.ok?'OK':w.reason+'@'+(+w.x).toFixed(2)+','+(+w.z).toFixed(2);
function clear(x,z,lv){ let best=9; for(let k=0;k<16;k++){ const a=k*Math.PI/8; for(let r=0.05;r<=1.5;r+=0.05){ if(!E.canStand(x+Math.cos(a)*r,z+Math.sin(a)*r,0.05,lv)){ if(r<best) best=r; break; } } } return +best.toFixed(2); }
function segD(px,pz,ax,az,bx,bz){ const dx=bx-ax,dz=bz-az,L=dx*dx+dz*dz; let t=L?((px-ax)*dx+(pz-az)*dz)/L:0; t=Math.max(0,Math.min(1,t)); return Math.hypot(ax+dx*t-px,az+dz*t-pz); }
for(const c of CASES){ const z=loadZone(c.zone); const sp=z.spawn||z.start||{x:0,z:0}; const s0=[sp.x!=null?sp.x:sp[0], sp.z!=null?sp.z:sp[1]];
  console.log('== '+c.name+'（'+c.zone+'；入口 '+JSON.stringify(s0)+'）');
  if(DUMP) for(const it of E.interactables) console.log('   互動',JSON.stringify([it.label,+(+it.x).toFixed(2),+(+it.z).toFixed(2),it.radius,it.lv]));
  for(const [n,x,q] of c.npcs) console.log('① '+n+' ('+x+','+q+') 站得住 '+E.canStand(x,q,0.3,c.lv)+'；離導航阻擋最近 '+clear(x,q,c.lv)+' m；入口走過去 '+fmt(E.simWalk(s0[0],s0[1],x,q,{dt:1/30,lv0:c.lv,lv1:c.lv})));
  const its=E.interactables.filter(it=>c.targets.test(it.label||'')&&((it.lv|0)===c.lv)&&Math.min(...c.npcs.map(([n,x,q])=>Math.hypot(it.x-x,it.z-q)))<6);
  for(const it of its){ const R=it.radius||1.8; let all=0, free=0, freeOk=0; const near=[];
    for(let dz=-R;dz<=R+1e-6;dz+=0.2) for(let dx=-R;dx<=R+1e-6;dx+=0.2){ const x=it.x+dx, q=it.z+dz; if(Math.hypot(dx,dz)>R||!E.canStand(x,q,0.32,c.lv)) continue; E.player.lv=c.lv; P().set(x,0,q); if(E.nearestInteractable()!==it) continue; all++;
      const dn=Math.min(...c.npcs.map(([n,a,b])=>Math.hypot(x-a,q-b))); if(dn<0.62){ near.push([+x.toFixed(2),+q.toFixed(2)]); continue; } free++; if(freeOk<3&&E.simWalk(s0[0],s0[1],x,q,{dt:1/30,lv0:c.lv,lv1:c.lv}).ok) freeOk++; }
    const path=E.pathTo?E.pathTo(s0[0],s0[1],c.lv,it.x,it.z,c.lv):null; let md=9;
    if(path&&path.length){ const pts=[[s0[0],s0[1]],...path.map(p=>[p.x!=null?p.x:p[0],p.z!=null?p.z:p[1]])]; for(let i=0;i+1<pts.length;i++) for(const [n,a,b] of c.npcs) md=Math.min(md,segD(a,b,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1])); }
    console.log('② 「'+it.label+'」('+(+it.x).toFixed(2)+','+(+it.z).toFixed(2)+' r'+R+')：按得到的站位 '+all+' 個，離 NPC ≥0.62 m 的 '+free+' 個（試走 3 個走得到 '+freeOk+'）'+(near.length?'；被 NPC 佔掉 '+near.length+' 個':''));
    console.log('③ 入口→「'+it.label+'」找路路線離 NPC 最近 '+(md<9?md.toFixed(2)+' m':'（沒有路線）')+(md<0.62?'　← 要擠過 NPC':'')); }
}
"""
fd, tmp = tempfile.mkstemp(suffix='.js'); os.write(fd, (head + tail).encode('utf-8')); os.close(fd)
r = subprocess.run(['node', tmp], capture_output=True, text=True, timeout=600, env=dict(os.environ)); os.unlink(tmp)
print('\n'.join(l for l in r.stdout.split('\n') if l[:1] in '①②③=' or l.startswith('   ')))
if r.returncode: print(r.stderr[-2000:])
