// 季節、節日的布置（LIFE-DETAILS-SEASONAL-1110，X317；LAWWW2 帳號 A 2026-11-11 第一批：過年、聖誕）——不需要瀏覽器。
// 檢查：日期表（src/data/season_deco.js）＋切換（src/season_deco3d.js 的 SD3）＋模型（season_<區域>.glb 的 SEASON_<代號>_on 節點）對得起來；
//       平常日不載入模型；節日那幾天載入、只顯示當天的那幾組；街景模型沒有被這一包改到（門的位置只是記錄）。
// 這是資料和接法的檢查，畫面要看 CC 的遊戲截圖（D131）。用法：node tests/season_deco_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.window=global;
const need=['src/data/calendar.js','src/data/season_deco.js','src/season_deco3d.js'].filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(need.length){ check('0. 檔案在',false,need.join(' ')); console.log('FAILED: '+fails); process.exit(1); }
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|SEASON_DECO|SD3)$/.test(n)?'var '+n+'=globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
// 區域、資產的替身（SD3 載入時會掛上去）
const mk=name=>({name,visible:true,children:[],userData:{},traverse(fn){ fn(this); for(const c of this.children) c.traverse(fn); },clone(){ const o=mk(this.name); if(this.isMesh) o.isMesh=true; o.children=this.children.map(c=>c.clone()); return o; },add(c){ this.children.push(c); }});
const loads=[]; global.ASSETS={manifest:{},loadOne(k){ loads.push(k); const root=mk('scene'); for(const c of SEASON_DECO.zones[k==='bldg.season_wenzhou'?'wenzhou':'gongguan'].codes){ const g=mk('SEASON_'+c+'_on'); const m=mk('SEASON_'+c+'_vc'); m.isMesh=true; g.add(m); root.add(g); } return Promise.resolve({scene:root}); }};
const built=[]; global.Z3={ZONES:{wenzhou:{id:'wenzhou',build(E){ const z={group:mk('wz_group'),id:'wenzhou'}; built.push(z); return z; }},gongguan:{id:'gongguan',build(E){ const z={group:mk('gg_group'),id:'gongguan'}; built.push(z); return z; }}}};
global.GAME={G:{day:1}};
run('src/data/calendar.js'); run('src/data/season_deco.js'); run('src/season_deco3d.js');
const D=SEASON_DECO, dayOf={}; for(let d=1;d<=2600;d++){ const k=CALENDAR.dateOf(d).key; if(!(k in dayOf)) dayOf[k]=d; }
const y0=CALENDAR.dateOf(1).y, cnyKey=[y0,y0+1,y0+2].map(y=>CALENDAR.LUNAR[y]&&CALENDAR.LUNAR[y].cny).find(k=>k&&dayOf[k]>20), cny=dayOf[cnyKey];
check('1. 日期表：兩個區域（溫州街、公館）、每個代號都有規則；月日的格式對',['wenzhou','gongguan'].every(z=>D.zones[z]&&D.zones[z].codes.length>=2&&D.zones[z].codes.every(c=>!!D.rules[c]))&&Object.values(D.rules).every(r=>{ const md=q=>Array.isArray(q)&&q.length===2&&q.every(s=>/^\d\d-\d\d$/.test(s)); return r.md?md(r.md):(r.mds?r.mds.length>0&&r.mds.every(md):(r.term?r.term==='final'&&(r.before|0)>=0:(!!r.lunar&&typeof r.from==='number'&&typeof r.to==='number'))); }));
check('2. 過年：春節那一天往前 14 天～往後 15 天顯示（除夕前兩週～元宵），前一天、後一天不顯示',!!cny&&SD3.on('CNY',cny)&&SD3.on('CNY',cny-14)&&SD3.on('CNY',cny+15)&&!SD3.on('CNY',cny-15)&&!SD3.on('CNY',cny+16),'春節 '+cnyKey+'＝第 '+cny+' 天');
{ const y=CALENDAR.dateOf(cny).y-1, a=dayOf[y+'-12-01'], b=dayOf[y+'-12-25'];
  check('3. 聖誕：12/1～12/25 顯示，11/30、12/26 不顯示',!!a&&!!b&&SD3.on('XMAS',a)&&SD3.on('XMAS',b)&&!SD3.on('XMAS',a-1)&&!SD3.on('XMAS',b+1),y+'-12-01＝第 '+a+' 天'); }
{ const y=CALENDAR.dateOf(cny).y, q1=dayOf[y+'-03-15'], q2=dayOf[y+'-05-10'], q3=dayOf[y+'-11-12'];
  check('4. 平常日（3/15、5/10、11/12）兩個區域都沒有任何一組',!!q1&&!!q2&&!!q3&&[q1,q2,q3].every(d=>SD3.active('wenzhou',d).length===0&&SD3.active('gongguan',d).length===0)&&SD3.active('campus',cny).length===0,JSON.stringify([q1,q2,q3].map(d=>SD3.active('wenzhou',d).concat(SD3.active('gongguan',d))))); }
/* 第二批的規則 */
{ const y=CALENDAR.dateOf(cny).y, K=k=>dayOf[y+'-'+k], on=(c,k)=>SD3.on(c,K(k)), dr=dayOf[CALENDAR.LUNAR[y].dragon];
  check('4b. 端午：端午前 7 天～當天顯示，前 8 天、隔天不顯示',!!dr&&SD3.on('DRAGON',dr)&&SD3.on('DRAGON',dr-7)&&!SD3.on('DRAGON',dr-8)&&!SD3.on('DRAGON',dr+1),'端午 '+CALENDAR.LUNAR[y].dragon);
  check('4b. 情人節 2/7～2/14、萬聖節 10/24～10/31：頭尾都算、前後一天不算',on('VDAY','02-07')&&on('VDAY','02-14')&&!on('VDAY','02-06')&&!on('VDAY','02-15')&&on('HALLOWEEN','10-24')&&on('HALLOWEEN','10-31')&&!on('HALLOWEEN','10-23')&&!on('HALLOWEEN','11-01'));
  check('4b. 便利店、飲料店：冬天 12/1～2/28（跨年）、夏天 6/1～9/15；冬天和夏天不會同時出現',['CVSWINTER','DRINKWINTER'].every(c=>on(c,'12-01')&&on(c,'01-15')&&on(c,'02-28')&&!on(c,'03-01')&&!on(c,'11-30')&&!on(c,'07-01'))&&['CVSSUMMER','DRINKSUMMER'].every(c=>on(c,'06-01')&&on(c,'09-15')&&!on(c,'05-31')&&!on(c,'09-16')&&!on(c,'01-15')));
  check('4b. 洗衣店換季：4 月、10 月兩段',on('LAUNDRY','04-01')&&on('LAUNDRY','04-30')&&on('LAUNDRY','10-15')&&!on('LAUNDRY','05-01')&&!on('LAUNDRY','09-30')&&!on('LAUNDRY','07-15'));
  let f0=null, mid=null; for(let d=1;d<=700;d++){ const t=CALENDAR.termOf(d); if(t&&t.exam==='final'&&f0==null) f0=d; if(t&&t.exam==='mid'&&mid==null) mid=d; }
  GAME.G.flags={WZ_COPY_SHOP:'moved'}; const moved=f0!=null&&SD3.on('EXAM',f0); GAME.G.flags={WZ_COPY_SHOP:'stay'}; const stay=f0!=null&&SD3.on('EXAM',f0); delete GAME.G.flags;
  check('4b. 阿德影印搬到轉角以後（WZ_COPY_SHOP＝moved）原本的店面不貼期末告示；留下來（stay）、還沒決定照貼',moved===false&&stay===true);
  check('4b. 期末考週的影印店：期末考週那幾天、前 7 天顯示；前 8 天不顯示；期中週不顯示',f0!=null&&SD3.on('EXAM',f0)&&SD3.on('EXAM',f0+2)&&SD3.on('EXAM',f0-7)&&!SD3.on('EXAM',f0-8)&&mid!=null&&!SD3.on('EXAM',mid),'期末考第一天＝第 '+f0+' 天（'+(f0?CALENDAR.dateOf(f0).key:'')+'）'); }
check('5. 沒有日曆、沒有這個代號、沒有日期：不顯示（不出錯）',SD3.on('NOPE',cny)===false&&SD3.on('CNY',null)===false);
check('6. 接法：包住溫州街、公館的 build（只包一次）、資產登記（lazy）',Z3.ZONES.wenzhou._sd3===true&&Z3.ZONES.gongguan._sd3===true&&SD3.hook()===0&&['bldg.season_wenzhou','bldg.season_gongguan'].every(k=>ASSETS.manifest[k]&&ASSETS.manifest[k].lazy===true&&ASSETS.manifest[k].type==='building'&&fs.existsSync(path.join(ROOT,ASSETS.manifest[k].url))));
(async()=>{
  { const y=CALENDAR.dateOf(cny).y; GAME.G.day=dayOf[y+'-03-15']; loads.length=0; const E={}; const z=Z3.ZONES.wenzhou.build(E); E.zone=z; await new Promise(r=>setTimeout(r,5));
    check('7. 平常日進溫州街：不載入季節模型、區域照常建好',loads.length===0&&z.seasonCodes.length===0&&z.seasonRoot===null&&z.group.children.length===0); }
  { GAME.G.day=cny; loads.length=0; const E={}; const z=Z3.ZONES.gongguan.build(E); E.zone=z; await new Promise(r=>setTimeout(r,5)); const R=z.seasonRoot, vis={}; if(R) R.traverse(o=>{ const m=/^SEASON_([A-Z]+)_on$/.exec(o.name); if(m) vis[m[1]]=o.visible; });
    check('8. 春節那一天進公館：載入一次、掛進區域；過年那一組顯示、聖誕那一組藏起來；不投影',loads.join()==='bldg.season_gongguan'&&!!R&&z.group.children.includes(R)&&vis.CNY===true&&vis.XMAS===false&&R.children[0].children[0].castShadow===false,JSON.stringify(vis)); }
  { GAME.G.day=cny; loads.length=0; const E={}; const z=Z3.ZONES.wenzhou.build(E); E.zone={other:1}; await new Promise(r=>setTimeout(r,5));
    check('9. 模型載好以前玩家已經離開這一區：不掛（不會掛到別的區域）',z.seasonRoot===null&&z.group.children.length===0); }
  // 模型
  for(const zid of ['wenzhou','gongguan']){ const Z=D.zones[zid]; let G={nodes:[],materials:[]}, J={}, DR=[]; try{ const d=fs.readFileSync(path.join(ROOT,Z.glb)), jl=d.readUInt32LE(12); G=JSON.parse(d.slice(20,20+jl).toString('utf8')); J=JSON.parse(fs.readFileSync(path.join(ROOT,Z.glb.replace(/\.glb$/,'.json')),'utf8')); DR=JSON.parse(fs.readFileSync(path.join(ROOT,Z.glb.replace(/\.glb$/,'.doors.json')),'utf8')); }catch(e){}
    const names=(G.nodes||[]).map(n=>n.name), gr=J.groups||{}, tris=Object.values(gr).reduce((a,g)=>a+g.tris,0);
    check('10. '+zid+' 的模型：這一區的每個代號有 SEASON_<代號>_on 節點而且裡面有東西、沒有列在這一區的代號是空的；過年至少貼 10 扇門、聖誕 2 間；整顆 ≤ 12,000 個三角形；材質只有三種（貼圖、頂點色、發光）',
      Z.codes.every(c=>names.includes('SEASON_'+c+'_on')&&gr[c]&&gr[c].doors>=1&&gr[c].tris>0)&&Object.keys(gr).every(c=>Z.codes.includes(c)||gr[c].doors===0)&&gr.CNY&&gr.CNY.doors>=10&&gr.XMAS&&gr.XMAS.doors===2&&tris>0&&tris<=12000&&(G.materials||[]).every(m=>/^season_(atlas|vc|glow)$/.test(m.name)),JSON.stringify(gr)+' '+(G.materials||[]).map(m=>m.name).join(','));
    check('10. '+zid+' 的門：每一筆有位置、朝外的方向、門頂高度（2～3.5 m）；阿德搬家以後的店面（A2C）不貼',DR.length>=10&&DR.every(r=>r.w0&&r.w1&&r.n&&Math.abs(Math.hypot(r.n[0],r.n[1])-1)<1e-3&&r.top>=2&&r.top<=3.5&&/^(shop|house|gg|open)$/.test(r.kind))&&/SKIP = \('A2C',\)/.test(fs.readFileSync(path.join(ROOT,'tools/blender/env_second/season_deco.py'),'utf8')),String(DR.length)); }
  { const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), iD=html.indexOf('src/data/season_deco.js'), iC=html.indexOf('src/season_deco3d.js'), iZ=html.indexOf('src/zones3d.js'), st=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/wz_street.py'),'utf8');
    check('11. index.html 載入（資料在前、程式在後，都在 zones3d.js 後面）；街景生成器只在 --season 才輸出季節模型（平常重匯街景不受影響）',iD>0&&iC>iD&&iD>iZ&&/if '--season' in ARGS:/.test(st)&&/season_deco\.export\(SET, SEASON_DOORS/.test(st)); }
  /* 發光的小東西（紅燈籠、聖誕燈串）在遊戲裡變成白光（BB／CC 11-11 04:4x）：載入時 season_glow 換成不受光的頂點色材質 */
{ const had=global.THREE; global.THREE={MeshBasicMaterial:function(o){ Object.assign(this,o); this.isMeshBasicMaterial=true; }};
  const a={isMesh:true,material:{name:'season_glow',emissive:[1,1,1]}}, b={isMesh:true,material:{name:'season_vc'}}, c={isMesh:true,material:[{name:'season_atlas'},{name:'season_glow'}]};
  const ra=SD3.glowFix(a), rb=SD3.glowFix(b), rc=SD3.glowFix(c);
  check('燈籠、燈串的發光材質換成不受光的頂點色材質（顏色＝頂點色，不再是白光）；其他材質不動；同一個材質共用',ra&&a.material.isMeshBasicMaterial&&a.material.vertexColors===true&&!rb&&b.material.name==='season_vc'&&rc&&c.material[0].name==='season_atlas'&&c.material[1]===a.material&&!SD3.glowFix(a));
  check('載入季節模型的地方有呼叫（每個網格）',/o\.isMesh\)\{[^}]*S\.glowFix\(o\)/.test(fs.readFileSync(path.join(ROOT,'src/season_deco3d.js'),'utf8')));
  if(had===undefined) delete global.THREE; else global.THREE=had; }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
