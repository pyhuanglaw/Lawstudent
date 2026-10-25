// B1 健身中心不再單調（LAWWW2-B 2026-10-24，巡查 P3「白天花板、灰牆、黑地板、牆上沒有東西」，LAWWW-B 派工）——不需要瀏覽器，讀 gym_b1.glb。
//   1. 牆上有東西：西牆主題牆（wall_free）、計時器（timer）在 WALL_left 群組、使用須知（rules）在 WALL_fitE 群組（partition 1）——牆淡出時一起淡出，不會浮在空中；
//      南牆鏡子上方的深藍色帶、黃線在 WALL_front 群組；有氧區上方兩台公告螢幕（tv，會發光）；
//   2. 鏡子不是一整片灰：鏡片材質有貼圖（反射感），鏡片之間有接縫；
//   3. 地板分區：自由重量區黑墊、有氧區灰墊、草皮道，三種材質都有貼圖；
//   4. 天花板：健身中心是輕鋼架板（有貼圖）、單面（doubleSided false）、法線朝下；
//   5. 版面、導航沒有動：器材 22 件、entryProps 8 件（gym_b1.json）；
//   6. 大廳東牆的開館時間牌、公告欄貼在框和木板的前面（原本在後面：遊戲裡只看到一塊黑板、一塊空木板），而且字不是左右相反（面向東牆 +z 在右手邊：u＝0 在 z 小的那一邊）。
// 修改前 FAIL。用法：node tests/gym_b1_fitness_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gym_b1.glb'));
const jl=buf.readUInt32LE(12), J=JSON.parse(buf.slice(20,20+jl).toString('utf8')), bin0=20+jl+8;
const nodes=J.nodes||[], mats=J.materials||[];
const node=re=>nodes.find(n=>re.test(n.name||''));
const matOf=n=>n&&n.mesh!=null?mats[J.meshes[n.mesh].primitives[0].material]:null;
const hasTex=m=>!!(m&&m.pbrMetallicRoughness&&m.pbrMetallicRoughness.baseColorTexture);
const dirIs=(n,d)=>!!(n&&n.extras&&JSON.stringify(n.extras.dir)===JSON.stringify(d));
{ const w=node(/^WALL_left_.*wall_free/), t=node(/^WALL_left_.*timer/), r=node(/^WALL_fitE_.*rules/);
  check('1. 西牆主題牆在 WALL_left 群組（dir [1,0,0]）、有貼圖', dirIs(w,[1,0,0])&&hasTex(matOf(w)), w&&w.name);
  check('1. 間歇計時器在 WALL_left 群組、會發光', dirIs(t,[1,0,0])&&!!(matOf(t)&&matOf(t).emissiveFactor), t&&t.name);
  check('1. 使用須知在 WALL_fitE 群組（partition 1）', dirIs(r,[-1,0,0])&&!!(r&&r.extras.partition===1)&&hasTex(matOf(r)), r&&r.name);
  const fa=node(/^WALL_front_.*fascia/), ay=node(/^WALL_front_.*accent_y/);
  check('1. 南牆鏡子上方的深藍色帶＋黃線在 WALL_front 群組', dirIs(fa,[0,0,-1])&&dirIs(ay,[0,0,-1]));
  const tv=node(/^b1_tv/); check('1. 有氧區上方的公告螢幕（有貼圖、會發光）', hasTex(matOf(tv))&&!!(matOf(tv)&&matOf(tv).emissiveFactor), tv&&tv.name); }
{ const m=node(/^b1_mirror_panel/); check('2. 鏡片材質有貼圖（不是一整片灰）', hasTex(matOf(m)), m&&m.name);
  const pr=m&&J.meshes[m.mesh].primitives[0], n=pr?J.accessors[pr.indices].count/6:0;
  check('2. 鏡子分成一片一片（≥ 20 片）', n>=20, n+' 片'); }
{ const names=['b1_rubber','b1_rubber_grey','b1_turf'].map(k=>mats.find(m=>m.name===k));
  check('3. 地板三種材質（黑墊、灰墊、草皮道）都有貼圖', names.every(hasTex), names.map(m=>m?m.name:'—').join('、')); }
{ const c=node(/^b1_ceiling_tile/), m=matOf(c);
  let down=false; if(c){ const pr=J.meshes[c.mesh].primitives[0], a=J.accessors[pr.attributes.NORMAL], v=J.bufferViews[a.bufferView], off=bin0+(v.byteOffset||0)+(a.byteOffset||0); down=buf.readFloatLE(off+4)<-0.99; }
  check('4. 健身中心天花板是輕鋼架板：有貼圖、單面、法線朝下', hasTex(m)&&m.doubleSided!==true&&down, c&&c.name); }
{ const info=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gym_b1.json'),'utf8'));
  check('5. 器材、入口道具照舊（22／8 件，版面 v5）', info.equipment===22&&info.entryProps===8&&info.layout===5, info.equipment+'／'+info.entryProps+'，v'+info.layout); }
{ const acc=(ai,k)=>{ const a=J.accessors[ai], v=J.bufferViews[a.bufferView], off=bin0+(v.byteOffset||0)+(a.byteOffset||0), st=v.byteStride||k*4, out=[];
    for(let i=0;i<a.count;i++){ const r=[]; for(let j=0;j<k;j++) r.push(buf.readFloatLE(off+i*st+j*4)); out.push(r); } return out; };
  for(const [nm,front] of [['b1_hours',23.95],['b1_notice',23.92]]){ const n=nodes.find(q=>q.name===nm); if(!n){ check('6. 找得到 '+nm,false); continue; }
    const pr=J.meshes[n.mesh].primitives[0], P=acc(pr.attributes.POSITION,3), T=acc(pr.attributes.TEXCOORD_0,2);
    const xmax=Math.max(...P.map(p=>p[0])), zmin=Math.min(...P.map(p=>p[2])), uAtZmin=Math.max(...P.map((p,i)=>Math.abs(p[2]-zmin)<1e-3?T[i][0]:-1));
    check('6. '+nm+' 在框的前面（x < '+front+'）、字不是左右相反（z 小的那一邊 u＝0）', xmax<front&&uAtZmin<0.01, 'x '+xmax.toFixed(3)+'、z 小那一邊 u '+uAtZmin.toFixed(2)); } }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
