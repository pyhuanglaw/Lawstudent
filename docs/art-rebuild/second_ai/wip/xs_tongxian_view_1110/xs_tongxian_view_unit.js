// 同弦樂器二樓臨街窗接上視差窗景（XS-TONGXIAN-VIEW-1110；BB 11-10 X254 GAME_BUG P2：「21:00 窗外跟白天一模一樣，玻璃外面的景沒有夜間版」；LAWWW2 帳號 A）——不需要瀏覽器（D131）。
// 原因：CC 的室內模型 tongxian.glb 窗外是一塊固定的白天街景板（tx_props 貼圖集的一格，窗外 1.6 m），沒有晚上的版本。
// 做法、檢查照 XS-WINCARD 第一、二批（tests/xs_wincard_1105_unit.js、xs_wincard2_1110_unit.js）。在 Node 建出真正的同弦區域、載入正式模型：
//   ① 一片視差窗（xs_tongxian）、照片檔（白天、晚上）都在
//   ② 在窗玻璃、後牆外面、面向店裡，蓋住整扇窗（窗外那塊白天的板子在它後面：從店裡看不到）
//   ③ 中心＝照片拍的位置（街 x＝−18.2 − 店內 z、街 z＝−9.2 ＋ 店內 x、y＋4.2；render.sh 的 --eye；±0.15 m）
//   ④ 在 z.wins、z.winParts，換時段（14:00、21:00）不出錯、照片設進材質，而且 21:00 換成晚上那一張
// 修改前（開發分支 0ec32e6f6）：① FAIL。用法：node tests/xs_tongxian_view_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ const t=String(a[0]); if(/LOD|Missing|載入失敗/.test(t)) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/data/xinsheng_layout.js','src/data/dakou_layout.js','src/data/dabu_layout.js','src/data/haopai_layout.js','src/data/shanlan_layout.js','src/data/xinsheng_sports_layout.js','src/data/tongxian_layout.js','src/zones3d.js','src/xinsheng3d.js','src/tongxian3d.js']) if(fs.existsSync(path.join(ROOT,f))) run(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); window.ASSET_DATA=window.ASSET_DATA||{};
for(const k of Object.keys(ASSETS.manifest)) if(/xs_tongxian$/.test(k)){ const u=ASSETS.manifest[k].url; if(fs.existsSync(path.join(ROOT,u))) window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64'); }
const EYE={xs_tongxian:[-12.83,5.9,-10.9]};   /* docs/art-rebuild/second_ai/wip/xs_tongxian_view_1110/render.sh 的 --eye */
const toStreet=p=>[-18.2-p.z,p.y+4.2,-9.2+p.x];
(async()=>{ const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  { const id='xs_tongxian'; global.GAME={G:{zone:id,day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
    const z=Z3.ZONES[id].build(E); E.zone=z; E.scene.add(z.group); await sleep(5000); z.group.updateMatrixWorld(true);
    const panes=[]; z.group.traverse(o=>{ if(o.isMesh&&/^VIEWPANE_/.test(o.name||'')) panes.push(o); });
    const files=['day','night'].map(t=>path.join(ROOT,'assets/models/env/views/xs_tongxian_'+t+'.webp'));
    check('① 同弦：一片視差窗 xs_tongxian、照片檔在', panes.length===1&&panes[0].userData.pview==='xs_tongxian'&&files.every(f=>fs.existsSync(f)), panes.map(p=>p.userData.pview).join(',')+'｜缺 '+files.filter(f=>!fs.existsSync(f)).map(f=>path.basename(f)).join(','));
    if(panes.length){ const p=panes[0], L=TONGXIAN_LAYOUT.shop, W=(L.windows||[])[0], Z0=-L.d/2;
      const n=new THREE.Vector3(0,0,1).applyQuaternion(p.getWorldQuaternion(new THREE.Quaternion())), pb=new THREE.Box3().setFromObject(p), ctr=p.getWorldPosition(new THREE.Vector3());
      let glassMin=Infinity; z.group.traverse(o=>{ if(!o.isMesh||/^VIEWPANE_/.test(o.name||'')) return; const mn=(([].concat(o.material)[0])||{}).name||''; if(!/glass/i.test(mn+' '+o.name)) return; const b=new THREE.Box3().setFromObject(o); if(b.max.z<Z0+0.3) glassMin=Math.min(glassMin,b.min.z); });
      const covers=!!W&&pb.min.x<=W.x0-0.5&&pb.max.x>=W.x1+0.5&&pb.min.y<=W.sill-0.3&&pb.max.y>=W.head+0.3;
      const outside=pb.max.z<Math.min(glassMin,Z0-0.12)-0.001, facing=n.z>0.99;
      check('② 同弦：在窗玻璃、後牆外面、面向店裡、蓋住整扇窗（斜看留 0.5／0.3 m）', outside&&facing&&covers, `片子 z ${pb.max.z.toFixed(3)}（玻璃最外 ${glassMin.toFixed(3)}、牆外 ${(Z0-0.12).toFixed(2)}）、法線 z ${n.z.toFixed(2)}、x ${pb.min.x.toFixed(2)}～${pb.max.x.toFixed(2)}、y ${pb.min.y.toFixed(2)}～${pb.max.y.toFixed(2)}（窗 x ${W&&W.x0}～${W&&W.x1}、y ${W&&W.sill}～${W&&W.head}）`);
      const s_=toStreet(ctr), e=EYE.xs_tongxian, d3=Math.hypot(s_[0]-e[0],s_[2]-e[2]);
      check('③ 同弦：中心＝照片拍的位置（±0.15 m）', d3<=0.15&&Math.abs(s_[1]-e[1])<=0.05, `中心換算成新生南路 (${s_.map(v=>v.toFixed(2)).join(', ')})，照片 (${e.join(', ')})`);
      let ok=true, mDay=null, mNight=null; const asked=[], vp0=W3.viewPhoto; W3.viewPhoto=function(k,n,b){ asked.push(k+(n?'_night':'_day')); return vp0.apply(this,arguments); };   /* 遊戲向 W3.viewPhoto 要哪一張（Node 載不到圖：材質用程序化的備用）*/
      try{ asked.length=0; z.applyTime(14,'clear'); mDay=asked.slice(); asked.length=0; z.applyTime(21,'clear'); mNight=asked.slice(); }catch(err){ ok=false; console.log(err.stack); } W3.viewPhoto=vp0;
      const inW=(z.wins||[]).includes(p)&&(z.winParts||[]).some(q=>q.obj===p);
      check('④ 同弦：在 z.wins、z.winParts，換時段不出錯，14:00 用白天的照片、21:00 用晚上的', inW&&ok&&mDay.includes('xs_tongxian_day')&&!mDay.includes('xs_tongxian_night')&&mNight.includes('xs_tongxian_night')&&!mNight.includes('xs_tongxian_day'), `wins ${inW}、applyTime ${ok}、14:00 要 ${mDay.join(',')}、21:00 要 ${mNight.join(',')}`); }
    else fails+=3;
    E.scene.remove(z.group); }
  console.warn=w0; console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
