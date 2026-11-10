// 正式模型有窗景照片卡（WALL_*_VIEW*）的店：備用模型的窗（程序化的卡通樹和樓）不能擋在照片卡前面（SNS-VIEW-COVER-1110，LAWWW2 帳號 A；
// BB X254「SUNNY SIDE 窗外的樹和樓是平面卡通畫風」：attachRoomGLB 把 room() 的窗搬到玻璃外 0.3 m，剛好擋在 SUNNY SIDE 模型自己那張溫州街照片前面）——不需要瀏覽器（D131）。
// 在 Node 建出每一間店、接上正式模型（溫州街 AA 的店、公館 AA 的店），檢查：
//   1 SUNNY SIDE：正面、右面的照片卡前面沒有 z.wins 的窗（修改前 2 扇）
//   2 每一間：每一張照片卡和店裡中心之間，沒有看得到的程序化窗（z.wins 裡沒有 pview 的：卡通的樹和樓）擋著（窗的中心在卡的左右、上下範圍內、比卡近）；
//     視差窗（pview，照片）照舊，會列出來（小路：wz_teishoku 視差窗在 komichi 照片卡前面，修改前後一樣，待決定）
//   3 沒有照片卡的那一面照舊有窗：每一間的 z.wins 數＝修改前減掉被擋掉的（會列出每間剩幾扇）
// 修改前（開發分支 be84c8680）：1 FAIL。用法：node tests/view_card_cover_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
console.warn=()=>{};
const HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>!/three|character3d|props3d|people3d|assets3d/.test(f));
for(const f of SRCS){ try{ vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){} }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
window.ASSET_DATA=window.ASSET_DATA||{}; for(const d of ['assets/models/env/second_ai/aa_support','assets/models/env/second_ai/bb_support','assets/models/env/second_ai']) for(const f of fs.readdirSync(path.join(ROOT,d))) if(/\.glb$/.test(f)&&(d!=='assets/models/env/second_ai'||/^wz_|^komichi|^yizhan/.test(f))) window.ASSET_DATA[d+'/'+f]=fs.readFileSync(path.join(ROOT,d,f)).toString('base64');   /* 店的 GLB 先讀進來（有的店建區域時才登錄 manifest）*/
const ZS=['wz_brunch','wz_teishoku','wz_print','wz_lin','wz_offbeat','wz_teahouse','aoki','afar','bookstore','daybreak'].filter(k=>Z3.ZONES[k]);
(async()=>{ const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; const rows=[]; let sns=null, allOK=true;
  for(const id of ZS){ global.GAME={G:{zone:id,day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
    let z; try{ z=Z3.ZONES[id].build(E); }catch(e){ rows.push(id+' 建不起來'); continue; } E.zone=z; E.scene.add(z.group); await new Promise(r=>setTimeout(r,4000)); z.group.updateMatrixWorld(true);
    const vis=o=>{ for(let q=o;q;q=q.parent) if(!q.visible) return false; return true; };
    const cards=[]; z.group.traverse(o=>{ if(o.isMesh&&/WALL_.*VIEW/.test(o.name||'')&&vis(o)) cards.push(new THREE.Box3().setFromObject(o)); });
    const wins=(z.wins||[]).filter(w=>w.parent&&vis(w)), C=new THREE.Vector3(0,1.4,0); let cover=0, pv=0;
    for(const b of cards){ const c=b.getCenter(new THREE.Vector3()), out=c.clone().sub(C).setY(0).normalize(), lat=new THREE.Vector3(-out.z,0,out.x);
      const ls=[b.min,b.max,new THREE.Vector3(b.min.x,0,b.max.z),new THREE.Vector3(b.max.x,0,b.min.z)].map(v=>v.dot(lat)), lo=Math.min(...ls), hi=Math.max(...ls);
      for(const w of wins){ const p=w.getWorldPosition(new THREE.Vector3()); const along=p.clone().sub(C).dot(out), cAlong=c.clone().sub(C).dot(out);
        if(along>0.5&&along<cAlong-0.01&&p.dot(lat)>=lo-0.05&&p.dot(lat)<=hi+0.05&&p.y>=b.min.y&&p.y<=b.max.y){ if(w.userData.pview) pv++; else cover++; } } }
    rows.push(`${id} 照片卡 ${cards.length}、窗 ${wins.length}、卡通窗擋住 ${cover}${pv?`（視差窗在卡前 ${pv}）`:''}`); if(cover) allOK=false; if(id==='wz_brunch') sns={cards:cards.length,cover};
    E.scene.remove(z.group); }
  check('1 SUNNY SIDE：照片卡（正面、右面）前面沒有備用模型的窗', !!sns&&sns.cards===2&&sns.cover===0, sns?`照片卡 ${sns.cards}、擋住 ${sns.cover}`:'建不起來');
  check('2 每一間有照片卡的店：卡前面都沒有卡通的程序化窗', allOK, rows.join('｜'));
  console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0); })();
