// 大三 507、大四 409 拆箱拿出來的東西（SCN-V4-01／SCN-V5-01；dorm_y3_items.glb，tools/blender/env_second/dorm_y3_items.py，2026-10-20）——不需要瀏覽器。
// 檢查：1. GLB 的 ITEM_<key> 和 story3d.js 的 S.ROOM_Y3_TEXT、S.ROOM_Y4_TEXT 一一對應（每一件是根節點底下的一個節點、底下有網格）、FORM_STAMP 在志願表底下；manifest（lazy）；
//       2. 進 507／409 才載 dorm_y3_items（312 不載）；z.setY2Items 一起管兩組：照 ROOM_Y3_ITEMS／ROOM_Y4_ITEMS 顯示、大三丟掉的（ROOM_Y3_DISCARD）、留在紙箱的（BOX_KEPT_Y4）不出現、
//          搬的途中（ROOM_Y4_MOVING）和收拾好了（PACKED_Y4）全部收起來、志願表的章只有日本、美國路線；「看得到」＝網格和它所有的上層都 visible——
//          大二那組也一樣（修改前 setY2Items 把 ITEM_<id>_<部位> 的網格全藏起來：房間裡一件都看不到）；模型還沒載完先呼叫 setY2Items，載完照最後的狀態；
//       3. 舊存檔沒有 ROOM_Y3_ITEMS／ROOM_Y4_ITEMS：不出錯、只有大二那組；
//       4. 拆箱、收拾的 3D（story3d.js）：拿一件出現一件、大四第一步是前兩年的（大二＋大三）、收拾時大三、大四的也一件一件收；
//       5. 手機的量：整組三角形 < 3000、材質 5 個、貼圖一張 webp（≤1024）。
// 修改前：1（manifest）、2、3（網格看不到）FAIL。用法：node tests/dorm_y3_items_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch'));
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const readGLB=f=>{ const b=fs.readFileSync(path.join(ROOT,f)); return {b,J:JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString())}; };
const Y3F='assets/models/env/second_ai/dorm_y3_items.glb', Y2F='assets/models/env/second_ai/dorm_y2_items.glb';
const {b:B3,J:J3}=readGLB(Y3F), {J:J2}=readGLB(Y2F);
const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
const keysOf=name=>{ const m=new RegExp('S\\.'+name+'=\\{([\\s\\S]*?)\\};').exec(st); return m?[...m[1].matchAll(/(?:^|[,{\s])(\w+):\[/g)].map(x=>x[1]):[]; };
const K3=keysOf('ROOM_Y3_TEXT'), K4=keysOf('ROOM_Y4_TEXT');
// 和 GLTFLoader 一樣：節點有網格＝Mesh（名字是節點名），沒有＝Group
const sceneOf=J=>{ const objs=J.nodes.map(n=>{ const o=n.mesh!=null?new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial({name:(J.materials[J.meshes[n.mesh].primitives[0].material]||{}).name||''})):new THREE.Group(); o.name=n.name; o.userData=Object.assign({},n.extras||{}); return o; });
  J.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>objs[i].add(objs[c]))); const sc=new THREE.Group(); for(const i of J.scenes[0].nodes) sc.add(objs[i]); return sc; };
(async()=>{
  // 1. GLB ↔ story3d.js
  const N=J3.nodes, byName=Object.fromEntries(N.map((n,i)=>[n.name,i])), root=byName['dorm_y3_items'], kids=root!=null?(N[root].children||[]).map(i=>N[i].name):[];
  const hasMesh=i=>N[i].mesh!=null||(N[i].children||[]).some(hasMesh);
  check('1. story3d.js 的 ROOM_Y3_TEXT 十六件、ROOM_Y4_TEXT 七件（讀得到 key）',K3.length===16&&K4.length===7,K3.join()+' / '+K4.join());
  const want=K3.concat(K4).map(k=>'ITEM_'+k), itemKids=kids.filter(n=>/^ITEM_/.test(n));
  check('1. 每一件一個節點 ITEM_<key>，就在根節點 dorm_y3_items 底下、底下有網格；沒有多出來的 ITEM_',want.every(n=>kids.includes(n)&&hasMesh(byName[n]))&&itemKids.length===want.length,'缺：'+want.filter(n=>!kids.includes(n)).join(' ')+' 多：'+itemKids.filter(n=>!want.includes(n)).join(' '));
  check('1. 和大二那組（dorm_y2_items.glb）沒有同名的 ITEM_',!J2.nodes.some(n=>/^ITEM_/.test(n.name)&&byName[n.name]!=null));
  check('1. 志願表的章 FORM_STAMP 在 ITEM_form 底下、有網格',byName.FORM_STAMP!=null&&(N[byName.ITEM_form].children||[]).includes(byName.FORM_STAMP)&&hasMesh(byName.FORM_STAMP));
  check('1. manifest bldg.dorm_y3_items（lazy、type building、檔案在）',!!ASSETS.manifest['bldg.dorm_y3_items']&&ASSETS.manifest['bldg.dorm_y3_items'].lazy===true&&ASSETS.manifest['bldg.dorm_y3_items'].type==='building'&&ASSETS.manifest['bldg.dorm_y3_items'].url===Y3F);
  check('1. 床欄上的（隊服、兩條掛繩）用 seethru_ 材質（和上舖一起網點透空）',['ITEM_vac_C09','ITEM_welcome_badge','ITEM_vac_C02'].every(n=>(N[byName[n]].children||[]).every(i=>N[i].mesh==null||/^seethru_/.test(J3.materials[J3.meshes[N[i].mesh].primitives[0].material].name))));
  // 2. 遊戲裡（假的 ASSETS.loadOne：照 GLB 的節點蓋出和 GLTFLoader 一樣的樹）
  const loaded=[]; const fakes={'bldg.dorm_room4':()=>new THREE.Group(),'bldg.dorm_y2_items':()=>sceneOf(J2),'bldg.dorm_y3_items':()=>sceneOf(J3)};
  ASSETS.loadOne=k=>{ loaded.push(k); return fakes[k]?Promise.resolve({scene:fakes[k]()}):Promise.reject(new Error('no '+k)); };
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  const tick=async()=>{ for(let i=0;i<6;i++) await new Promise(r=>setTimeout(r,0)); };
  const build=async(G,before)=>{ global.GAME={G}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; loaded.length=0; const z=Z3.ZONES.dorm.build(E); E.zone=z; if(before) before(z); await tick(); return z; };
  const seen=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
  const tagOf=o=>{ for(let p=o;p;p=p.parent){ if(p.name==='FORM_STAMP'||/^Y2_BOXES_/.test(p.name)) return p.name; if(/^ITEM_/.test(p.name)&&!(p.parent&&/^ITEM_/.test(p.parent.name))) return p.name; } return null; };   /* 網格屬於哪一件 */
  const shown=z=>{ const out=new Set(); for(const g of (z.itemGroups||[])) g.traverse(o=>{ if(o.isMesh&&seen(o)&&tagOf(o)) out.add(tagOf(o)); }); return out; };   /* 真的看得到的：網格和所有上層都 visible */
  const items=z=>[...shown(z)].filter(n=>/^ITEM_/.test(n)).sort();
  const Y2=['civ','noodle','pothos','y1_3'], base={ROOM_Y2:300,ROOM_Y2_ITEMS:Y2.slice()};
  let z=await build({stage:'law',day:400,flags:Object.assign({},base)});
  check('2. 大二 312：只載 dorm_y2_items（不載大三那組）',loaded.includes('bldg.dorm_y2_items')&&!loaded.includes('bldg.dorm_y3_items')&&(z.itemGroups||[]).map(g=>g.name).join()==='dorm_y2_items',loaded.join());
  check('2. 312：大二拆出來的真的看得到（網格；民總課本、泡麵、摩天輪票根）＋壓平的紙箱',JSON.stringify(items(z))===JSON.stringify(['ITEM_civ','ITEM_noodle','ITEM_y1_ferris'])&&shown(z).has('Y2_BOXES_OPEN')&&!shown(z).has('Y2_BOXES_CLOSED'),JSON.stringify([...shown(z)]));
  const f507=Object.assign({},base,{ROOM_Y3:700,ROOM_Y3_ITEMS:['notes_y2','vac_C08','vac_C09','welcome_badge'],ROOM_Y3_DISCARD:'noodle',EXCHANGE_ROUTE:'JP'});
  z=await build({stage:'law',day:720,flags:f507});
  check('2. 大三 507：兩組都載（dorm_y2_items、dorm_y3_items）',loaded.includes('bldg.dorm_y2_items')&&loaded.includes('bldg.dorm_y3_items')&&z.dormSetKey==='507'&&(z.itemGroups||[]).length===2&&!z.itemsLoading,loaded.join()+' '+z.itemsLoading);
  check('2. 507：大二的（扣掉丟掉的泡麵）＋大三拆出來的四件；大四的都沒有',JSON.stringify(items(z))===JSON.stringify(['ITEM_civ','ITEM_notes_y2','ITEM_vac_C08','ITEM_vac_C09','ITEM_welcome_badge','ITEM_y1_ferris']),JSON.stringify(items(z)));
  z.setY2Items({shown:['article','credits']}); check('2. setY2Items：給什麼就只顯示什麼（兩組一起；大四的製作名單也可以）',JSON.stringify(items(z))===JSON.stringify(['ITEM_article','ITEM_credits']),JSON.stringify(items(z)));
  z.setY2Items({shown:[],boxes:'closed'}); check('2. setY2Items 全部收起來＋紙箱封好',items(z).length===0&&shown(z).has('Y2_BOXES_CLOSED')&&!shown(z).has('Y2_BOXES_OPEN'));
  z=await build({stage:'law',day:720,flags:Object.assign({},f507,{ROOM_Y3_MOVING:true})},zz=>{ zz.setY2Items({shown:[],boxes:'closed'}); zz.setY2Items({shown:['civ','zq_usb']}); });
  check('2. 拆箱事件在模型載完前就呼叫：載完照最後一次的狀態（民總課本、隨身碟）',JSON.stringify(items(z))===JSON.stringify(['ITEM_civ','ITEM_zq_usb'])&&shown(z).has('Y2_BOXES_CLOSED'),JSON.stringify([...shown(z)]));
  const f409=Object.assign({},f507,{ROOM_Y4:1060,ROOM_Y4_ITEMS:['form','jp_key','cold'],BOX_KEPT_Y4:'vac_C08'});
  z=await build({stage:'law',day:1080,flags:f409});
  check('2. 大四 409（日本）：三年的都在、留在紙箱的交通卡不出來；志願表上有章',z.dormSetKey==='409'&&JSON.stringify(items(z))===JSON.stringify(['ITEM_civ','ITEM_cold','ITEM_form','ITEM_jp_key','ITEM_notes_y2','ITEM_vac_C09','ITEM_welcome_badge','ITEM_y1_ferris'])&&shown(z).has('FORM_STAMP'),JSON.stringify([...shown(z)]));
  z=await build({stage:'law',day:1080,flags:Object.assign({},f409,{EXCHANGE_ROUTE:'TW'})});
  check('2. 409（台灣）：志願表是空白的那一張（沒有章）',items(z).includes('ITEM_form')&&!shown(z).has('FORM_STAMP'));
  z=await build({stage:'law',day:1080,flags:Object.assign({},f409,{EXCHANGE_ROUTE:'US'})}); check('2. 409（美國）：有章',shown(z).has('FORM_STAMP'));
  z=await build({stage:'law',day:1060,flags:Object.assign({},f409,{ROOM_Y4:undefined,ROOM_Y4_MOVING:true})});
  check('2. 搬進 409 那一刻（ROOM_Y4_MOVING）：紙箱封著、什麼都還沒拿出來',z.dormSetKey==='409'&&items(z).length===0&&shown(z).has('Y2_BOXES_CLOSED'));
  z=await build({stage:'law',day:1300,flags:Object.assign({},f409,{PACKED_Y4:1300})}); check('2. 收拾好了（PACKED_Y4）：全部收起來',items(z).length===0&&shown(z).has('Y2_BOXES_CLOSED'));
  // 3. 舊存檔
  let err=null; try{ z=await build({stage:'law',day:720,flags:Object.assign({},base,{ROOM_Y3:700})}); }catch(e){ err=e; }
  check('3. 舊存檔：有 ROOM_Y3 沒有 ROOM_Y3_ITEMS＝不出錯、只有大二那組',!err&&JSON.stringify(items(z))===JSON.stringify(['ITEM_civ','ITEM_noodle','ITEM_y1_ferris']),err?String(err):JSON.stringify(items(z)));
  err=null; try{ z=await build({stage:'law',day:1080,flags:Object.assign({},base,{ROOM_Y3:700,ROOM_Y4:1060})}); }catch(e){ err=e; }
  check('3. 舊存檔：有 ROOM_Y4 沒有 ROOM_Y4_ITEMS、BOX_KEPT_Y4＝不出錯',!err&&z.dormSetKey==='409'&&JSON.stringify(items(z))===JSON.stringify(['ITEM_civ','ITEM_noodle','ITEM_y1_ferris']),err?String(err):JSON.stringify(items(z)));
  z=await build({stage:'law',day:300,flags:{}}); check('3. 大一 203：不載這兩組、沒有 setY2Items',!loaded.some(k=>/dorm_y[23]_items/.test(k))&&!z.setY2Items);
  delete global.GAME;
  // 4. 拆箱、收拾的 3D（story3d.js；行為測試在 tests/room_y3_unit.js、tests/room_y4_unit.js）
  const u3=st.slice(st.indexOf('S.unboxY3=async'),st.indexOf('S.unboxY3=async')+3000), u4=st.slice(st.indexOf('S.unboxY4=async'),st.indexOf('S.unboxY4=async')+3000), pk=st.slice(st.indexOf('S.packY4=async'),st.indexOf('S.packY4=async')+3000);
  check('4. 大三拆箱：拿一件、房間多一件（去年的＋今年拿出來的）；丟掉的那一件拿掉',/shown\.push\(r\[0\]\); vis\(\{shown:old\.concat\(shown\)\}\);/.test(u3)&&/vis\(\{shown:old\.concat\(shown\)\.filter\(id=>id!==o\.id\)\}\)/.test(u3));
  check('4. 大四拆箱：第一步是前兩年的（大二＋大三，扣掉丟掉的）、拿一件多一件、留在紙箱的那一件拿掉',/has=keep=>old\.concat\(shown\)\.filter\(id=>id!==keep\)/.test(u4)&&/vis\(\{shown:has\(null\)\}\); await GM\.say/.test(u4)&&/shown\.push\(r\[0\]\); vis\(\{shown:has\(null\)\}\);/.test(u4)&&/if\(o\.id\) vis\(\{shown:has\(o\.id\)\}\)/.test(u4)&&!/y2vis/.test(u4));
  check('4. 收拾：一開始擺好還沒裝的、大三大四的也一件一件收（不是只有大二那組）',/left=\(\)=>L\.slice\(\)/.test(pk)&&/vis\(\{shown:left\(\),boxes:'open'\}\)/.test(pk)&&!/y2left/.test(pk));
  // 5. 手機的量
  let tris=0; for(const m of J3.meshes) for(const p of m.primitives) tris+=(p.indices!=null?J3.accessors[p.indices].count:J3.accessors[p.attributes.POSITION].count)/3;
  const img=(J3.images||[])[0], bv=img&&J3.bufferViews[img.bufferView], bin=20+B3.readUInt32LE(12)+8, ib=bv&&B3.slice(bin+(bv.byteOffset||0),bin+(bv.byteOffset||0)+bv.byteLength);
  const webpW=ib&&ib.slice(12,16).toString()==='VP8 '?(ib.readUInt16LE(26)&0x3fff):(ib&&ib.slice(12,16).toString()==='VP8L'?1+(((ib[22]&0x3f)<<8)|ib[21]):0);
  check('5. 整組三角形 < 3000、材質 2 個（y3_print、seethru_y3_print）、貼圖一張 webp（寬 ≤ 1024）、檔案 < 400 KB',tris<3000&&J3.materials.length===2&&(J3.images||[]).length===1&&img.mimeType==='image/webp'&&webpW>0&&webpW<=1024&&B3.length<400*1024,'tris '+tris+' 材質 '+J3.materials.length+' 貼圖寬 '+webpW+' '+Math.round(B3.length/1024)+' KB');
  const meshesUnder=i=>(N[i].mesh!=null?1:0)+(N[i].children||[]).filter(c=>N[c].name!=='FORM_STAMP').reduce((s,c)=>s+meshesUnder(c),0);
  check('5. 每一件只有一個網格（一件只多一次 draw call；志願表的章另外一個）、一個 primitive',want.every(n=>meshesUnder(byName[n])===1)&&meshesUnder(byName.FORM_STAMP)===1&&J3.meshes.every(m=>m.primitives.length===1),want.filter(n=>meshesUnder(byName[n])!==1).join(' '));
  // 6. 不穿插（每個網格的外框；紙是平的：三個方向都重疊、而且至少兩個方向超過 1 mm 才算穿進去）
  const boxOf=J=>{ const out={}; J.nodes.forEach(n=>{ if(n.mesh==null) return; const a=J.accessors[J.meshes[n.mesh].primitives[0].attributes.POSITION], t=n.translation||[0,0,0]; out[n.name]={mn:a.min.map((v,k)=>v+t[k]),mx:a.max.map((v,k)=>v+t[k])}; }); return out; };
  const cross=(a,b)=>{ const o=[0,1,2].map(k=>Math.min(a.mx[k],b.mx[k])-Math.max(a.mn[k],b.mn[k])); return o.every(x=>x>0)&&o.filter(x=>x>0.001).length>=2; };
  const b3=boxOf(J3), b2=boxOf(J2), k3=Object.keys(b3), hits2=[], hits3=[];
  for(const a of k3) for(const b in b2) if(cross(b3[a],b2[b])) hits2.push(a+'×'+b);
  for(let i=0;i<k3.length;i++) for(let j=i+1;j<k3.length;j++) if(cross(b3[k3[i]],b3[k3[j]])) hits3.push(k3[i]+'×'+k3[j]);
  check('6. 不穿進大二那組（民總課本、相簿、軟木板的框…）',hits2.length===0,hits2.join(' '));
  check('6. 大三、大四的互相不穿插（衣櫃門上疊的紙前後錯開、不在同一個平面；書桌那一疊紙的角不壓進筆記本、隨身碟）',hits3.length===0,hits3.join(' '));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
