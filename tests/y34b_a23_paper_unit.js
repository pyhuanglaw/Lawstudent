// 1B-20 二十三週年：麵店門口的白紙、12/14 晚上下雨（AA_323 1B-20 第 1、6 節；EVPKG-1B18-25-1020 稽核列的「門口白紙」；src/y34b3d.js）——不需要瀏覽器。
//   12/11（一）起到 12/14 當天、二十三週年還沒演完：公館「進入阿鳳麵店」旁邊有「門口的白紙」，看＝白紙上的字照稿逐字「12/14（四）晚上七點　二十三週年」；
//   12/10、12/15、演完以後、美國路線、不在公館＝沒有。12/14 17:00 起強制下雨（照 1B-08 y2b3d.js 的寫法）；12/14 16:00、12/13、美國路線＝不改天氣。
//   3D 的白紙（稿：公告欄那一種）是場景物件，歸 LAWWW2（D108），這裡不測。
// 修改前（開發分支 87cc42021）實際跑過：沒有 S.a23Paper／S.a23Rain，FAILED 6（白紙 1、2、3、5、6，下雨 7）；4（不該有白紙的五種）、8（不改天氣的三種）本來就 PASS。用法：node tests/y34b_a23_paper_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG2_POOL)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM,E}=H;
load('src/exchange3d.js'); load('src/data/msg2_pool.js'); load('src/msg3d.js'); load('src/y34b3d.js');
const S=Y34B;
const PAPER='（麵店門口貼著一張白紙：「12/14（四）晚上七點　二十三週年」）';
const fresh=(key,h,zone,flags,route)=>{ const G=H.fresh(key,h,zone,Object.assign({EXCHANGE_ROUTE:route||'TW',EXCH_RULE:1},flags||{})); G.acts={att:{}}; G.outings=[]; H.at(key,h); G.zone=zone||'dorm'; GM.npc={}; return G; };
const DOOR=()=>({x:-20,z:21,radius:2.2,label:'進入阿鳳麵店',exit:{to:'noodle',spawn:{x:0,z:3.4,yaw:Math.PI}}});
const paperAt=(key,h,zone,flags,route)=>{ fresh(key,h,zone||'gongguan',flags,route); E.interactables=[DOOR()]; if(typeof S.a23Paper==='function') S.a23Paper(GM); return E.interactables.find(it=>it.label==='門口的白紙')||null; };
(async()=>{
  /* ===== 門口的白紙 ===== */
  const p11=paperAt('2028-12-11',10), p14=paperAt('2028-12-14',18.5);
  check('1. 12/11（一）10:00、12/14 18:30 在公館：「進入阿鳳麵店」旁邊有「門口的白紙」',!!p11&&!!p14&&Math.abs(p11.x-(-20))<2.5&&Math.abs(p11.z-21)<1,JSON.stringify(p11&&{x:p11.x,z:p11.z}));
  { fresh('2028-12-12',15,'gongguan'); E.interactables=[DOOR()]; if(S.a23Paper) S.a23Paper(GM); const it=E.interactables.find(q=>q.label==='門口的白紙'); H.said=[];
    if(it&&it.onInteract) it.onInteract(); for(let i=0;i<20;i++) await new Promise(r=>setImmediate(r));
    check('2. 看白紙：一句旁白，白紙上的字照稿逐字「12/14（四）晚上七點　二十三週年」',H.said.length===1&&H.said[0].who==null&&H.said[0].t===PAPER,JSON.stringify(H.said)); }
  { const n=E.interactables.length; S.a23Paper&&S.a23Paper(GM); check('3. 重複呼叫不會多一個',E.interactables.filter(q=>q.label==='門口的白紙').length===1&&E.interactables.length===n); }
  const no=[paperAt('2028-12-10',15),paperAt('2028-12-15',12),paperAt('2028-12-14',20,'gongguan',{ANNIV23:'there'}),paperAt('2028-12-12',15,'gongguan',{},'US'),paperAt('2028-12-12',15,'wenzhou')];
  check('4. 12/10、12/15、演完以後（ANNIV23）、美國路線、不在公館：沒有白紙',no.every(x=>!x),JSON.stringify(no.map(x=>!!x)));
  { fresh('2028-12-14',18.5,'gongguan'); E.interactables=[DOOR()]; S.a23Paper&&S.a23Paper(GM); const had=E.interactables.some(q=>q.label==='門口的白紙'); H.G.flags.ANNIV23='there'; S.a23Paper&&S.a23Paper(GM);
    check('5. 演完（ANNIV23）以後再跑一次：白紙收起來',had&&!E.interactables.some(q=>q.label==='門口的白紙')); }
  { fresh('2028-12-12',15,'gongguan'); E.interactables=[DOOR()]; let w=0; for(const f of STORY.TICKS){ try{ f(GM); }catch(e){} } w=E.interactables.some(q=>q.label==='門口的白紙');
    check('6. 走 STORY.TICKS（遊戲每 0.5 秒）就會放',w); }
  /* ===== 12/14 晚上下雨 ===== */
  const rain=(key,h,route,w0)=>{ fresh(key,h,'gongguan',{},route); H.G.weather=w0||'clear'; let set=null; const o=E.setWeather; E.setWeather=x=>{ set=x; }; if(S.a23Rain) S.a23Rain(GM); E.setWeather=o; return {w:H.G.weather,set}; };
  { const a=rain('2028-12-14',17.2); check('7. 12/14 17:12 晴天＝改下雨（G.weather、E.setWeather 都是 rain）',a.w==='rain'&&a.set==='rain',JSON.stringify(a)); }
  { const b=rain('2028-12-14',16), c=rain('2028-12-13',20), d=rain('2028-12-14',19,'US');
    check('8. 12/14 16:00、12/13 20:00、美國路線 12/14 19:00：不改天氣',b.w==='clear'&&c.w==='clear'&&d.w==='clear',JSON.stringify([b,c,d])); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
