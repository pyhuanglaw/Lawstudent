"""BB-C 10-28 02:0x：reachability_all 溫州街「拜土地公」走不到（v9.10.12 候選 562a5ead9；v9.10.11 c8b9659e5 通過）的重現與比較。不需要瀏覽器。
借 tests/wz_park_unit.js 的 Node 架子（在 Node 裡建出真正的溫州街區域）；用法：python3 shrine_pocket_check.py <工作樹>
印出：
  ① 從出生點 (44,-1) 用引擎真正的找路＋碰撞（E.simWalk，dt 1/30）走到 reachability_all 選的點 (12.65,26.65)
  ② 土地公互動範圍內、「最近的互動＝土地公」的站位：哪些走得到（照距離排；reachability_all 只試最近的 6 個）
  ③ 涼亭西側小角落裡的人能不能自己走出來（走到出生點、走到老樹前）
  ④ x 10.5～17.5、z 17.5～29 每 0.25 m 站不站得住（半徑 0.32）：看遊戲場和涼亭之間的通道
  ⑤ TRAP=1：整個公園（x 8.4～36、z 5～29）每 0.5 m 站得住的點，用 E.simWalk 走到老樹前 (26,17.6)；列出走不出來的點（死角）。
     修好以後的判定：⑤ 沒有比 v9.10.11 多出來的死角、② 最近 6 個站位至少一個走得到（reachability_all 的規則）
  ⑥ 公園的實心物件（WZ_PARK_LAYOUT.items 有 x、z 的；路燈除外）中心點站不站得住（半徑 0.1）：站得住＝那個物件的導航阻擋不見了
     （BB-C 10-28：984f24dc1 的 // 註解把同一行的直飲台、腳踏車架阻擋包進去，腳踏車架穿得過去）。判定：⑥ 要 0 個"""
import sys, os, subprocess, tempfile
root = os.path.abspath(sys.argv[1])
src = open(os.path.join(root, 'tests/wz_park_unit.js'), encoding='utf-8').read()
head = src[:src.index("check('1.")].replace("path.resolve(__dirname,'..')", repr(root))
tail = r"""
const z=loadZone('wenzhou'); const it=E.interactables.find(i=>i.park==='shrine'); const P=E.player.obj.position; const sp=[44,-1];
const fmt=w=>w.ok?'OK':w.reason+'@'+w.x+','+w.z;
console.log('① 土地公互動點',[it.x,it.z,it.radius],'；出生點→(12.65,26.65)：',fmt(E.simWalk(sp[0],sp[1],12.65,26.65,{dt:1/30,lv0:0,lv1:0})),'；路線',JSON.stringify(E.pathTo(sp[0],sp[1],0,12.65,26.65,0)));
const R=it.radius-0.05, rows=[];
for(let dz=-R;dz<=R+1e-6;dz+=0.2) for(let dx=-R;dx<=R+1e-6;dx+=0.2){ const d=Math.hypot(dx,dz); if(d>R) continue; const x=it.x+dx,zz=it.z+dz; if(!E.canStand(x,zz,0.32,0)) continue; P.set(x,0,zz); if(E.nearestInteractable()!==it) continue; rows.push([+d.toFixed(2),+x.toFixed(2),+zz.toFixed(2),fmt(E.simWalk(sp[0],sp[1],x,zz,{dt:1/30,lv0:0,lv1:0}))]); }
rows.sort((a,b)=>a[0]-b[0]); console.log('② 站位',rows.length,'個、走得到',rows.filter(r=>r[3]==='OK').length,'個；最近 12 個：',JSON.stringify(rows.slice(0,12)));
for(const p of [[12.65,26.65],[12.45,26.85],[12.65,26.85]]) console.log('③ 從',JSON.stringify(p),'走到出生點',fmt(E.simWalk(p[0],p[1],sp[0],sp[1],{dt:1/30,lv0:0,lv1:0})),'；走到老樹前 (26,17.6)',fmt(E.simWalk(p[0],p[1],26,17.6,{dt:1/30,lv0:0,lv1:0})));
const map=[]; for(let q=17.5;q<=29.01;q+=0.25){ let s=''; for(let x=10.5;x<=17.51;x+=0.25) s+=E.canStand(x,q,0.32,0)?'.':'#'; map.push(q.toFixed(2).padStart(6)+' '+s); } { const bad=[]; for(const q of (WZ_PARK_LAYOUT.items||[])){ if(q.x==null||q.z==null||/lamp/.test(q.kind)) continue; if(E.canStand(q.x,q.z,0.1,0)) bad.push(q.id+'('+q.x+','+q.z+')'); } console.log('⑥ 實心物件中心站得住（阻擋不見了）',bad.length,'個：',bad.join('、')); }
if(process.env.TRAP){ const bad=[]; let n=0; for(let x=8.5;x<=36;x+=0.5) for(let q=5;q<=29;q+=0.5){ if(!E.canStand(x,q,0.32,0)) continue; n++; const w=E.simWalk(x,q,26,17.6,{dt:0.1,lv0:0,lv1:0}); if(!w.ok) bad.push([x,q,w.reason]); } console.log('⑤ 公園站得住的點',n,'個；走不回老樹前',bad.length,'個：',JSON.stringify(bad)); }
console.log('④ x 10.5→17.5（每 0.25 m；. 站得住）\n'+map.join('\n'));
"""
fd, tmp = tempfile.mkstemp(suffix='.js'); os.write(fd, (head + tail).encode('utf-8')); os.close(fd)
r = subprocess.run(['node', tmp], capture_output=True, text=True, timeout=600); os.unlink(tmp)
print('\n'.join(l for l in r.stdout.split('\n') if l[:1] in '①②③④⑤⑥' or l[:1].isdigit() or l.startswith(' ')))
