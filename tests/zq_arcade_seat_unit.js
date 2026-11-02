// 子晴在公館騎樓「坐在騎樓下的插座旁邊，筆電開著」（ZQ-ARCADE-SEAT-1028，BB-C 10-28；LAWWW2-B 2026-11-01）——不需要瀏覽器。
// 原本：heroine_circle.js 的 c506_4_2／c507_4_2／c509_4_1（Y2S2～Y4 晚上）是 linger 在 (16, 20.6)：站著、沒有筆電，騎樓也沒有凳子和插座。
// 這一包（場景＋道具；作息改 act:'read'＋seatAt、坐下開筆電是 LAWWW-B 改 heroine_circle.js）：
//   gongguan_shops.glb：G07／G08 交界那根柱子（x 15.6、z 19.03～19.58）靠騎樓那一面一張紅凳子（(15.6, 19.8)）、柱子那一面離地 35 cm 一個插座；
//   zones3d.js 公館：座位 (15.6, 19.8) yaw 0（背靠柱子、面向騎樓）、玩家的互動點；凳子的腳印加進 GG_PROP_BLOCKS；
//   道具 laptop_lap（tools/blender/char_second/prop_pool.py）：assets3d 的 manifest、props3d（髖部、只在坐著時、平常藏著）、character3d 子晴的 MODEL_PROPS。
// 檢查：
//   ① 公館有「坐在騎樓的板凳」這個座位（15.6, 19.8, yaw 0），也有玩家坐得下去的互動點
//   ② 子晴「插座旁邊」那幾筆 linger 的點（heroine_circle.js 裡 heroine_04 在 gongguan、label 有「插座」，at (16, 20.6)）離座位 3.5 m 內（story3d.js 的 seatAt 找 3.5 m 內最近的空位）
//   ③ gongguan_shops.props.json 有這張凳子（sk_stool_r_G08，中心在座位上），GG_PROP_BLOCKS 有同一塊（模型接上時擋住導航）
//   ④ 凳子前面（她的腳、玩家走過來的地方）站得住；騎樓照樣走得通（柱子東西兩側沿騎樓走 6 m 找得到路）
//   ⑤ 筆電道具：manifest 有 prop.laptop_lap、檔案在；props3d 掛在髖部、只在坐著時、平常藏著；子晴的 MODEL_PROPS 有它
// 修改前（開發 bd7754e2e）：FAIL 4（④ 是不退步的檢查，原本就 PASS）；只套 patch、模型沒換：FAIL 2（③ 凳子、⑤ 筆電檔案）——gongguan_shops.glb／.props.json、laptop_lap.glb 要一起換。用法：node tests/zq_arcade_seat_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const SX=15.6, SZ=19.8;
ASSETS.loadOne=k=>Promise.reject(new Error('node：不載 '+k));
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.gongguan.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const seat=(z.seats||[]).find(s=>s.label==='坐在騎樓的板凳'), it=E.interactables.find(i=>i.seat&&i.seat===seat);
check('① 公館有「坐在騎樓的板凳」（15.6, 19.8，面向騎樓 yaw 0），玩家坐得下去',!!seat&&Math.abs(seat.x-SX)<0.01&&Math.abs(seat.z-SZ)<0.01&&Math.abs(seat.yaw)<0.01&&!!it,seat?JSON.stringify(seat):'沒有這個座位');
{ const src=fs.readFileSync(path.join(ROOT,'src/data/heroine_circle.js'),'utf8'), pts=[];
  for(const line of src.split('\n')){ if(!/who:'heroine_04',e:\{/.test(line)||!/zone:'gongguan'/.test(line)||!line.includes('插座')) continue; const m=line.match(/at:\[([\d.\-]+),([\d.\-]+)/); if(m) pts.push([+m[1],+m[2]]); }   /* 只看「插座旁邊」那幾筆（c504_4_3 在騎樓的咖啡店，不是這一張凳子）*/
  const far=pts.filter(([x,zz])=>!seat||Math.hypot(x-seat.x,zz-seat.z)>=3.5);
  check('② 子晴「插座旁邊」的作息點（'+pts.length+' 筆）都離座位 3.5 m 內（seatAt 找得到）',pts.length>=4&&!far.length,JSON.stringify(pts.slice(0,2))+(seat&&pts.length?'，距離 '+Math.hypot(pts[0][0]-seat.x,pts[0][1]-seat.z).toFixed(2)+' m':'')); }
{ const pj=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gongguan_shops.props.json'),'utf8')).props;
  const st=pj.find(p=>p.tag==='sk_stool_r_G08'), c=st?[(st.rect[0]+st.rect[2])/2,(st.rect[1]+st.rect[3])/2]:null;
  const blk=(Z3.PROP_BLOCKS&&Z3.PROP_BLOCKS.gongguan||[]).find(b=>Math.abs(b[0]-SX)<0.05&&Math.abs(b[1]-SZ)<0.05);
  check('③ 模型的凳子（sk_stool_r_G08）中心在座位上，GG_PROP_BLOCKS 有同一塊',!!c&&Math.hypot(c[0]-SX,c[1]-SZ)<0.06&&!!blk,(c?'凳子中心 '+c.map(v=>v.toFixed(2)).join(','):'props.json 沒有凳子')+(blk?'；擋 '+JSON.stringify(blk):'；GG_PROP_BLOCKS 沒有')); }
{ const front=E.canStand(SX,SZ+0.65,0.32,0);
  const path_=E3.NavGrid&&z.nav.path?z.nav.path(SX-3,20.9,SX+3,20.9):null;
  check('④ 凳子前面站得住；騎樓沿著走（柱子西邊 3 m → 東邊 3 m）找得到路',front&&!!path_&&path_.length>0,'前面 '+front+'、路 '+(path_?path_.length+' 點':'沒有')); }
{ const m=ASSETS.manifest['prop.laptop_lap'], fileOk=!!m&&fs.existsSync(path.join(ROOT,m.url));
  const ps=fs.readFileSync(path.join(ROOT,'src/props3d.js'),'utf8'), def=/laptop_lap:\{bone:'hips',make:boneGlb\('prop\.laptop_lap','laptop_lap'\),[^}]*sit:'only',hidden:true\}/.test(ps);
  const cs=fs.readFileSync(path.join(ROOT,'src/character3d.js'),'utf8'), i4=cs.indexOf("'char.heroine_04':["), i5=cs.indexOf("'char.heroine_05'",i4), mp=i4>=0&&i5>i4&&cs.slice(i4,i5).includes("'laptop_lap'");   /* 子晴那一筆裡有巢狀的 [ ]（吉他的背帶），取到下一筆為止 */
  check('⑤ 筆電道具：manifest＋檔案、props3d（髖部、只在坐著時、平常藏著）、子晴的 MODEL_PROPS',fileOk&&def&&mp,'manifest '+!!m+'、檔案 '+fileOk+'、props3d '+def+'、MODEL_PROPS '+mp); }
/* ⑥ LAWWW-B 那一半（README 第四節）：子晴那 4 筆「公館騎樓（插座旁邊）」改坐著讀（act read、seatAt 凳子）、坐下時開筆電（prop laptop_lap）；story3d.js 坐下那一支照 prop 開道具 */
{ const hs=fs.readFileSync(path.join(ROOT,'src/data/heroine_circle.js'),'utf8'); const rows=hs.split('\n').filter(l=>l.includes("who:'heroine_04'")&&l.includes('公館騎樓（插座旁邊）'));
  const ok=rows.length===4&&rows.every(l=>l.includes("act:'read'")&&l.includes('seatAt:[15.6,19.8]')&&l.includes("prop:'laptop_lap'"));
  const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), wire=/if\(n&&ent\.prop&&typeof CHAR!=='undefined'&&CHAR\.setProp\) CHAR\.setProp\(n\.obj,ent\.prop,true\)/.test(st);
  check('⑥ 子晴 4 筆改坐凳子讀（act read、seatAt [15.6,19.8]、prop laptop_lap）；story3d.js 坐下照 prop 開道具',ok&&wire,'rows '+rows.length+'、wire '+wire); }
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
