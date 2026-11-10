// 大口漢堡（xs_dakou）晚上窗外一直閃（WINDOW-FLICKER-1107：使用者 11-07 試玩 v9.10.21「大口漢堡……外面窗景一直閃」；LAWWW2-B）——不需要瀏覽器（D131）。
// 原因：一樓、二樓兩顆 GLB（BB 的 dakou_1f、dakou_2f）各有一張夜景卡 NIGHT_FRONT（z 16）、NIGHT_WEST（x −14），兩張在同一個平面、範圍重疊；
//   晚上同時顯示 → z-fighting，鏡頭一動畫面就在兩張圖之間跳。開發分支的 XS-WINCARD 把 NIGHT_FRONT 藏了，NIGHT_WEST 照樣兩張疊著。
// 在 Node 載入遊戲的 three.js、zones3d.js、dakou3d.js 和兩顆正式模型，建出真正的區域：
//   ① 晚上（21:00）人在一樓：看得到的夜景卡沒有兩張在同一個平面（同一個平面、範圍重疊、都看得到＝會閃）；看得到的都是一樓那一顆的
//   ② 晚上人上二樓（player.lv 1，z.update 一次）：一樣沒有疊著的；看得到的都是二樓那一顆的
//   ③ 回到一樓換回來；白天（14:00）夜景卡都不顯示（原本的行為）
// 修改前（v9.10.21 92c3daad8、開發分支 77195b12a）：① ② FAIL。用法：node tests/dakou_nightcard_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ if(/LOD|Missing|載入失敗/.test(String(a[0]))) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/zones3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/dakou_layout.js','src/dakou3d.js']) if(fs.existsSync(path.join(ROOT,f))) run(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of Object.keys(ASSETS.manifest)) if(/^bldg\.xs_dakou_/.test(k)){ const m=ASSETS.manifest[k]; if(fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; global.GAME={G:{zone:'xs_dakou',day:30,hour:21,flags:{},money:5000,weather:'clear',visited:{}}};
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.xs_dakou.build(E); E.zone=z; E.scene.add(z.group);
  E.player={obj:{position:new THREE.Vector3(0,0,6),rotation:{y:0}},radius:0.32,lv:0};
  let ok=false; for(let i=0;i<150&&!ok;i++){ await sleep(100); z.group.traverse(o=>{ if(/^NIGHT_/.test(o.name||'')) ok=true; }); } await sleep(300);
  const cards=[]; z.group.traverse(o=>{ if(o.isMesh&&/^NIGHT_/.test(o.name||'')){ let f=null; for(let p=o;p;p=p.parent) if(/dakou_(1f|2f)/.test(p.name||'')){ f=p.name; break; } cards.push({o,f}); } });
  check('0 兩顆模型的夜景卡都載到了', cards.length>=2, cards.map(c=>c.o.name+'@'+c.f).join('、'));
  const seen=()=>cards.filter(c=>{ for(let p=c.o;p;p=p.parent) if(!p.visible) return false; return true; });
  const overlaps=()=>{ z.group.updateMatrixWorld(true); const v=seen(), B=v.map(c=>new THREE.Box3().setFromObject(c.o)), bad=[];
    for(let i=0;i<v.length;i++) for(let j=i+1;j<v.length;j++){ const a=B[i], b=B[j];
      for(const ax of ['x','z']){ const ot=ax==='x'?'z':'x'; if(a.max[ax]-a.min[ax]<0.02&&b.max[ax]-b.min[ax]<0.02&&Math.abs(a.min[ax]-b.min[ax])<0.01&&a.min[ot]<b.max[ot]&&b.min[ot]<a.max[ot]&&a.min.y<b.max.y&&b.min.y<a.max.y) bad.push(v[i].o.name+'('+v[i].f+')×'+v[j].o.name+'('+v[j].f+')'); } }
    return bad; };
  const step=lv=>{ E.player.lv=lv; E.player.obj.position.y=lv?3.6:0; if(z.update) z.update(0.016,E); };
  z.applyTime(21,'clear'); step(0);
  { const b=overlaps(), v=seen(); check('① 晚上一樓：看得到的夜景卡沒有兩張疊在同一個平面', !b.length, b.join('；')||(v.length+' 張看得到'));
    check('① 晚上一樓：看得到的都是一樓那一顆的', v.length>0&&v.every(c=>c.f==='dakou_1f'), v.map(c=>c.o.name+'@'+c.f).join('、')); }
  step(1);
  { const b=overlaps(), v=seen(); check('② 晚上二樓：看得到的夜景卡沒有兩張疊在同一個平面', !b.length, b.join('；')||(v.length+' 張看得到'));
    check('② 晚上二樓：看得到的都是二樓那一顆的', v.length>0&&v.every(c=>c.f==='dakou_2f'), v.map(c=>c.o.name+'@'+c.f).join('、')); }
  step(0); { const v=seen(); check('③ 回到一樓換回一樓那一張', v.length>0&&v.every(c=>c.f==='dakou_1f'), v.map(c=>c.o.name+'@'+c.f).join('、')); }
  z.applyTime(14,'clear'); step(0); check('③ 白天夜景卡都不顯示（原本的行為）', seen().length===0, seen().map(c=>c.o.name).join('、'));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
