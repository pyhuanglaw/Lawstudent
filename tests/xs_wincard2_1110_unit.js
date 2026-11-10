// 新生南路山嵐書店（一、二樓）、新生運動廣場（一、二樓）、南洋戲院大廳的窗外接上視差窗景（XS-WINCARD 第二批；BB 11-10 10:52：「山嵐沒有窗景卡，GLB 只有玻璃 shl_glass，白天玻璃外只看得到天空，晚上一片暗；南洋、同弦應該也一樣」；LAWWW2 帳號 A）——不需要瀏覽器（D131）。
// 做法、檢查照第一批（tests/xs_wincard_1105_unit.js：大口、大步、好拍）。在 Node 建出真正的區域、載入正式模型：
//   ① 視差窗的片數、照片名字對、照片檔（白天、晚上）都在
//   ② 每片在玻璃外面、面向店裡
//   ③ 視差窗中心＝照片拍的位置（街 x＝立面 −16.5＋（店內 z − d/2）、街 z＝店的中心 − 店內 x；±0.15 m）
//   ④ 在 z.wins、z.winParts，換時段（14:00、21:00）不出錯、照片設進材質
// 同弦（xs_tongxian）在二樓、正面沒有玻璃（只有後牆一扇小窗），這一批不做。
// 修改前（開發分支 9d4c54c16）：① FAIL。用法：node tests/xs_wincard2_1110_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ const t=String(a[0]); if(/LOD|Missing|載入失敗/.test(t)) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/data/xinsheng_layout.js','src/data/dakou_layout.js','src/data/dabu_layout.js','src/data/haopai_layout.js','src/data/shanlan_layout.js','src/data/xinsheng_sports_layout.js','src/data/nanyang_layout.js','src/zones3d.js','src/xinsheng3d.js','src/shanlan3d.js','src/xsports3d.js','src/nanyang3d.js']) if(fs.existsSync(path.join(ROOT,f))) run(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); window.ASSET_DATA=window.ASSET_DATA||{};
for(const k of Object.keys(ASSETS.manifest)) if(/xs_shanlan|xs_xsports|xs_nanyang$/.test(k)){ const u=ASSETS.manifest[k].url; if(fs.existsSync(path.join(ROOT,u))) window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64'); }
/* 照片拍的位置（新生南路座標，tools/blender/env_second/wz_window_view.py 的 --eye；docs/art-rebuild/second_ai/wip/xs_wincard_1105/README.md） */
const EYE={xs_shanlan:[-16.14,1.6,10.2],xs_shanlan_2f:[-16.14,5.8,10.2],xs_xsports:[-16.27,1.6,-33],xs_xsports_2f:[-16.27,5.35,-33],xs_nanyang:[-16.2,1.6,25.3]};   /* docs/art-rebuild/second_ai/wip/xs_wincard2_1110/render.sh 的 --eye */
const XL=XINSHENG_LAYOUT, FX=XL.facade.x, CZ=id=>{ const q=XL.shops.find(s=>s.id===id); return (q.z0+q.z1)/2; };
const CASES=[{id:'xs_shanlan',shop:'shanlan',d:()=>SHANLAN_LAYOUT.d,kinds:['xs_shanlan','xs_shanlan_2f']},{id:'xs_xsports',shop:'xsports',d:()=>XINSHENG_SPORTS_LAYOUT.d,kinds:['xs_xsports','xs_xsports_2f']},{id:'xs_nanyang',shop:'nanyang',d:()=>NANYANG_LAYOUT.lobby.d,kinds:['xs_nanyang']}];
(async()=>{ const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  for(const c of CASES){ global.GAME={G:{zone:c.id,day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
    const z=Z3.ZONES[c.id].build(E); E.zone=z; E.scene.add(z.group); await sleep(5000); z.group.updateMatrixWorld(true);
    const panes=[]; z.group.traverse(o=>{ if(o.isMesh&&/^VIEWPANE_/.test(o.name||'')) panes.push(o); });
    const kinds=panes.map(p=>p.userData.pview).sort(), files=c.kinds.flatMap(k=>['day','night'].map(t=>path.join(ROOT,'assets/models/env/views/'+k+'_'+t+'.webp')));
    check('① '+c.id+'：'+c.kinds.length+' 片視差窗、照片名字對、照片檔在',JSON.stringify(kinds)===JSON.stringify(c.kinds.slice().sort())&&files.every(f=>fs.existsSync(f)),kinds.join(',')+'｜缺 '+files.filter(f=>!fs.existsSync(f)).map(f=>path.basename(f)).join(','));
    if(!panes.length){ fails+=3; E.scene.remove(z.group); continue; }
    const glass=[]; z.group.traverse(o=>{ if(!o.isMesh||/^VIEWPANE_/.test(o.name||'')) return; const mn=(([].concat(o.material)[0])||{}).name||''; if(/glass/i.test(mn+' '+o.name)&&!/case/i.test(o.name||'')) glass.push(new THREE.Box3().setFromObject(o)); });
    const bad=[]; for(const p of panes){ const n=new THREE.Vector3(0,0,1).applyQuaternion(p.getWorldQuaternion(new THREE.Quaternion())), pb=new THREE.Box3().setFromObject(p), ctr=p.getWorldPosition(new THREE.Vector3());
      const out=new THREE.Vector3(-n.x,0,-n.z);   /* 往外＝面向店裡的反方向 */
      const g=glass.reduce((a,b)=>a.union(b),new THREE.Box3()); const gOut=out.x<-0.5?g.min.x:(out.x>0.5?g.max.x:(out.z>0.5?g.max.z:g.min.z)), pOut=out.x<-0.5?pb.min.x:(out.x>0.5?pb.max.x:(out.z>0.5?pb.min.z:pb.max.z));
      const beyond=(out.x<-0.5)?pOut<gOut+0.001:(out.x>0.5?pb.min.x>g.max.x-0.001:pb.min.z>g.max.z-0.001);
      if(!(Math.abs(n.y)<0.01&&beyond)) bad.push(p.userData.pview+' 不在玻璃外面');
      const e=EYE[p.userData.pview], d=c.d(); const want=[FX+(ctr.z-d/2)*(Math.abs(out.z)>0.5?1:0)+(Math.abs(out.x)>0.5?(-d/2+ctr.z-0)*0:0),0,0];
      const sx=FX+(ctr.z-d/2), sz=CZ(c.shop)-ctr.x; if(!e||Math.abs(sx-e[0])>0.15||Math.abs(ctr.y-e[1])>0.05||Math.abs(sz-e[2])>0.15) bad.push(p.userData.pview+' 中心 ('+sx.toFixed(2)+','+ctr.y.toFixed(2)+','+sz.toFixed(2)+') ≠ 照片 '+(e||[]).join(',')); }
    check('②③ '+c.id+'：每片在玻璃外面、面向店裡、中心＝照片拍的位置（±0.15 m）',!bad.length,bad.join('｜')||panes.length+' 片');
    let ok=true; try{ z.applyTime(14,'clear'); z.applyTime(21,'clear'); }catch(e){ ok=false; console.log(e.stack); }
    const inW=panes.every(p=>(z.wins||[]).includes(p)&&(z.winParts||[]).some(q=>q.obj===p)), mapped=panes.every(p=>p.material.uniforms&&p.material.uniforms.map.value!=null);
    let night=0; z.group.traverse(o=>{ if(/^NIGHT_FRONT/.test(o.name||'')&&o.visible) night++; });
    check('④ '+c.id+'：在 z.wins、z.winParts，換時段不出錯、照片設進材質、正面沒有顯示的夜景卡（21:00）',inW&&ok&&mapped&&night===0,'wins '+inW+' applyTime '+ok+' map '+mapped+' 夜景卡 '+night);
    E.scene.remove(z.group); }
  console.warn=w0; console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
