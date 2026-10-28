"""BB-C 10-28：NPC-POOL-ART-1028 劇情那天才擺的實體物件（LAWWW-C 04:48／971db04b9）——擋不擋路、互動點走不走得到。不需要瀏覽器。
借 tests/wz_park_unit.js 的 Node 架子（加載男一舍 dorm3d.js）；用法：python3 prop_spot_check.py <工作樹>
  ① 男一舍交誼廳冰箱（dorm_layout fridge (6.52,7.43)；互動點 (7.3,6.7) r1.0「把箱子放進交誼廳的冰箱」）：互動範圍內站得住、最近的互動是冰箱的站位有幾個、從出生點走得到嗎；冰箱中心站不住（有擋）
  ② 霖澤館補給桌（S.prop 那天才擋：(4.6,1.05) 1.9×0.7）：照遊戲同一個 blockRect 擋上以後，從入口走到「搭電梯」(4.6,-3.9)、101、法律學院辦公室、樓層簡介、樓梯／教室門走不走得到；
      桌子的互動點 (4.6,2.05) r1.4 站得住的站位幾個、走得到嗎；桌子擋上以前／以後入口到電梯的路線長度
  ③ 校園穿堂照片（(33,-110) r2.2 lv0，穿堂地坪 0.9 m）：範圍內站得住的站位、從霖澤館門口 (34,-108.4)、椰林大道 (34,-86) 走得到嗎
這是模擬，不是真實玩家流程；畫面另外截圖看。"""
import sys, os, subprocess, tempfile
root = os.path.abspath(sys.argv[1])
src = open(os.path.join(root, 'tests/wz_park_unit.js'), encoding='utf-8').read()
head = src[:src.index("check('1.")].replace("path.resolve(__dirname,'..')", repr(root))
head = head.replace("'src/data/wz_park_layout.js'", "'src/data/dorm_layout.js','src/dorm3d.js','src/data/wz_park_layout.js'")
head = head.replace("|WZ_PARK_LAYOUT|", "|WZ_PARK_LAYOUT|DORM_LAYOUT|DM3|")
tail = r"""
const P=()=>E.player.obj.position; const fmt=w=>w.ok?'OK':w.reason+'@'+(+w.x).toFixed(2)+','+(+w.z).toFixed(2);
function pathLen(x0,z0,x1,z1,lv){ const p=E.pathTo(x0,z0,lv,x1,z1,lv); if(!p||!p.length) return null; let L=0, a=[x0,z0]; for(const q of p){ L+=Math.hypot(q[0]-a[0],q[1]-a[1]); a=q; } return +L.toFixed(2); }
function spots(it,lv){ const R=it.radius||1.8, out=[]; E.player.lv=lv; for(let dz=-R;dz<=R+1e-6;dz+=0.2) for(let dx=-R;dx<=R+1e-6;dx+=0.2){ const x=it.x+dx,q=it.z+dz; if(Math.hypot(dx,dz)>R||!E.canStand(x,q,0.32,lv)) continue; P().set(x,0,q); if(E.nearestInteractable()===it) out.push([x,q]); } return out; }
function reach(s0,pts,lv){ let ok=0; for(const p of pts.slice(0,40).sort((a,b)=>Math.hypot(a[0]-s0[0],a[1]-s0[1])-Math.hypot(b[0]-s0[0],b[1]-s0[1])).slice(0,4)) if(E.simWalk(s0[0],s0[1],p[0],p[1],{dt:1/30,lv0:lv,lv1:lv}).ok) ok++; return ok; }
// ①
{ const z=loadZone('dorm_hall'); const sp=z.spawn||{x:0,z:0}; const s0=[sp.x,sp.z];
  const it={x:7.3,z:6.7,radius:1.0,lv:0,label:'把箱子放進交誼廳的冰箱',prio:0.4}; E.interactables.push(it);
  const f=(DORM_LAYOUT.items||DORM_LAYOUT.furniture||[]).find?null:null;
  const sp1=spots(it,0); console.log('① 男一舍（出生點 '+JSON.stringify(s0)+'）冰箱中心 (6.52,7.43) 站得住＝'+E.canStand(6.52,7.43,0.1,0)+'（要 false）；冰箱互動站位 '+sp1.length+' 個，最近 4 個走得到 '+reach(s0,sp1,0)+'；走到 (7.3,6.7) '+fmt(E.simWalk(s0[0],s0[1],7.3,6.7,{dt:1/30,lv0:0,lv1:0})));
  const near=E.interactables.filter(i=>i!==it&&Math.hypot(i.x-7.3,i.z-6.7)<2.2).map(i=>i.label+'('+(+i.x).toFixed(2)+','+(+i.z).toFixed(2)+' r'+i.radius+')'); console.log('① 冰箱附近 2.2 m 的其他互動：'+near.join('、')); }
// ②
{ const z=loadZone('linze'); const s0=[6.6,4.0]; const tg=E.interactables.filter(i=>(i.lv|0)===0);
  const before=pathLen(s0[0],s0[1],4.6,-3.9,0);
  const nav=E.levels?E.levels[0]:E.nav; nav.blockRect(4.6,1.05,1.9,0.7,0,0.05); nav._cm=null; for(const n of (E.levels||[])) n._cm=null;
  console.log('② 霖澤館：補給桌擋上（照 S.prop：(4.6,1.05) 1.9×0.7）；桌子中心站得住＝'+E.canStand(4.6,1.05,0.1,0)+'（要 false）；入口→電梯路線 '+before+' m → '+pathLen(s0[0],s0[1],4.6,-3.9,0)+' m');
  for(const i of tg){ const sp1=spots(i,0); console.log('② 「'+i.label+'」('+(+i.x).toFixed(2)+','+(+i.z).toFixed(2)+')：站位 '+sp1.length+' 個，最近 4 個走得到 '+reach(s0,sp1,0)); }
  const it={x:4.6,z:2.05,radius:1.4,lv:0,label:'看補給的桌子'}; E.interactables.push(it); const sp2=spots(it,0);
  console.log('② 「看補給的桌子」(4.6,2.05 r1.4)：站位 '+sp2.length+' 個，最近 4 個走得到 '+reach(s0,sp2,0)+'；入口走到 (4.6,2.05) '+fmt(E.simWalk(s0[0],s0[1],4.6,2.05,{dt:1/30,lv0:0,lv1:0}))); }
// ③
{ const z=loadZone('campus'); const it={x:33,z:-110,radius:2.2,lv:0,label:'看穿堂的照片'}; E.interactables.push(it); const sp1=spots(it,0);
  console.log('③ 穿堂照片 (33,-110 r2.2)：站位 '+sp1.length+' 個；從霖澤館門口 (34,-108.4) 最近 4 個走得到 '+reach([34,-108.4],sp1,0)+'；從椰林大道 (34,-86) '+reach([34,-86],sp1,0)+'；(33,-110) 站得住＝'+E.canStand(33,-110,0.32,0)); }
"""
fd, tmp = tempfile.mkstemp(suffix='.js'); os.write(fd, (head + tail).encode('utf-8')); os.close(fd)
r = subprocess.run(['node', tmp], capture_output=True, text=True, timeout=900); os.unlink(tmp)
print('\n'.join(l for l in r.stdout.split('\n') if l[:1] in '①②③'))
if r.returncode: print(r.stderr[-2500:])
