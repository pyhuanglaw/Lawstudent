// 人物的描邊不進影子那一輪（PERF-WZ-DC-1107，LAWWW2-B 11-07；LAWWW-B 09:04 同意）——不需要瀏覽器。用法：node tests/char_outline_shadow_unit.js
//   three-vrm 的 MToon 描邊是同一個網格的第二個材質（名字 "...(Outline)"、同一份幾何）；影子那一輪 three.js 每個 group 用深度材質各畫一次，
//   描邊那一份的深度和本體完全一樣——每個會投影的人物白畫 5 次（臉、身體、上衣、褲子、鞋）。PERF_COLD（CC-B b987cb1cf）溫州街穩定以後 373 calls，人物幾組加起來約 113。
//   ① 建 VRM 時記下描邊材質：會投影的人物——以安 5 個、祐廷 8 個（多的是平常藏著的運動服 GYM_*）；路人（ambient，本來就不投影）0 個
//   ② 影子那一輪（CHAR.shadowPassBegin 期間）要畫的 group：祐廷、以安 16 → 11；畫出來的影子不變（拿掉的都是和本體同一份幾何的描邊）
//   ③ 畫完（shadowPassEnd）描邊材質全部還原，一般畫面的 group 數不變（描邊照樣畫）
//   ④ engine3d.js 的 shadowLevels 在畫影子前後呼叫 shadowPassBegin／shadowPassEnd
// 修改前（開發 c8b09bcf0）：① ② ④ FAIL
const fs=require('fs'), path=require('path');
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const vis=o=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; };
const groupsOf=(h,shadowOnly)=>{ let n=0; h.traverse(o=>{ if(!(o.isMesh||o.isSkinnedMesh)||!vis(o)) return; if(shadowOnly&&!o.castShadow) return; const mats=Array.isArray(o.material)?o.material:[o.material];
  const gs=Array.isArray(o.material)&&o.geometry.groups.length?o.geometry.groups:[{materialIndex:0}]; for(const g of gs){ const m=mats[g.materialIndex]; if(m&&m.visible!==false) n++; } }); return n; };
const outlineSameGeo=h=>{ let ok=true; h.traverse(o=>{ if(!Array.isArray(o.material)) return; const gs=o.geometry.groups; for(let i=0;i<gs.length;i++){ const m=o.material[gs[i].materialIndex]; if(m&&/\(Outline\)$/.test(m.name||'')){ const j=gs.findIndex((g,k)=>k!==i&&g.start===gs[i].start&&g.count===gs[i].count); if(j<0) ok=false; } } }); return ok; };
(async()=>{
  const res={};
  for(const key of ['char.yuting','char.heroine_01','char.npc_f1']){
    preload([key]); await ASSETS.loadOne(key); const before=CHAR.OUTLINE_MATS?CHAR.OUTLINE_MATS.size:0;
    const h=CHAR.build({id:'t_'+key,model:key,height:1.7}); await new Promise(r=>setTimeout(r,200)); h.updateMatrixWorld(true);
    const added=CHAR.OUTLINE_MATS?CHAR.OUTLINE_MATS.size-before:0;
    const main0=groupsOf(h,false), sh0=groupsOf(h,true);
    const hid=CHAR.shadowPassBegin?CHAR.shadowPassBegin():null; const sh1=groupsOf(h,true); if(CHAR.shadowPassEnd) CHAR.shadowPassEnd(hid);
    const main1=groupsOf(h,false); res[key]={added,main0,main1,sh0,sh1,same:outlineSameGeo(h)}; }
  const Y=res['char.yuting'], H1=res['char.heroine_01'], N=res['char.npc_f1'];
  check('① 會投影的人物記下描邊材質（以安 5；祐廷 8＝另外 3 個是平常藏著的運動服，換上時一樣跳過），路人 0 個',Y.added>=5&&H1.added===5&&N.added===0,JSON.stringify({祐廷:Y.added,以安:H1.added,路人:N.added}));
  check('② 影子那一輪：祐廷、以安 16 → 11（拿掉的描邊和本體同一份幾何）',Y.sh0===16&&Y.sh1===11&&H1.sh0===16&&H1.sh1===11&&Y.same&&H1.same&&N.sh0===0&&N.sh1===0,JSON.stringify({祐廷:[Y.sh0,Y.sh1],以安:[H1.sh0,H1.sh1],路人:[N.sh0,N.sh1],同一份幾何:[Y.same,H1.same]}));
  check('③ 畫完還原：一般畫面的 group 數不變（描邊照樣畫）',Y.main0===Y.main1&&H1.main0===H1.main1&&N.main0===N.main1,JSON.stringify({祐廷:[Y.main0,Y.main1],以安:[H1.main0,H1.main1],路人:[N.main0,N.main1]}));
  const eng=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'); const i=eng.indexOf('function shadowLevels(SM)'), body=i>=0?eng.slice(i,eng.indexOf('E.cinematic=',i)):'';
  check('④ engine3d.js shadowLevels 畫影子前後呼叫 CHAR.shadowPassBegin／shadowPassEnd',/CHAR\.shadowPassBegin\(\)/.test(body)&&/CHAR\.shadowPassEnd\(/.test(body)&&body.indexOf('shadowPassBegin')<body.indexOf('smr.apply'));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
