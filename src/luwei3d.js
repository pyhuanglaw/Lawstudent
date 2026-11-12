/* ===== 公館宵夜滷味攤的點餐（EAT-EFFECT-1020 最後一項，使用者 X67；LAWWW 2026-11-12）=====
   字：src/data/luwei_stall.js（LUWEI_STALL，AA_841 匯入：tools/story/import_luwei_stall.py）——夾法、價錢、老闆的話、旁白一字照稿，這裡不寫任何台詞。
     按鈕「看＋招牌上的字」是夜市的寫法（NM3.label：看＋稿的 name；D147 不取店名，招牌只寫稿的 sign）；選單「夾法　價錢 元」＋「算了」、「老樣子」也是夜市／EAT 現有的寫法。
   攤子：公館店面街騎樓外的人行道（和公館那三攤同一排，面向騎樓），模型用現有的 assets/models/env/second_ai/luwei_stall.glb（LAWWW2-B 2026-10-16 做來拍 2D 背景「公館・滷味攤」的那一台，同一個樣子）。
     位置 S.AT 是 LAWWW 的子代理照導航格量的（那一段人行道是空的），還沒在畫面上看過——LAWWW2 驗位置、要不要收掉旁邊的折疊桌（稿的 rules：沒有座位）。
   這支做的：
   1 什麼時候在（S.state）：照稿的 open（每天 18:00～24:00）；颱風假（CALENDAR.typhoon，稿 typhoonOff）整天不出攤。
       open＝營業中：攤車、燈、老闆都在。 closing＝剛過 24:00 的那一小時（S.CLOSING_H）：攤車還在、老闆在收（稿 closed 那一句說的畫面）。
       away＝其他時間：攤車不在（稿 not_open）。 typhoon＝颱風假：位置是空的（稿 typhoon）。
     攤車不在的時候不擋路（導航的阻擋跟著模型一起放、一起收：SD3.block／unblock；模型沒載到＝不擋，不留看不見的牆）。玩家剛好站在那裡＝等他走開才擺出來。
   2 有人顧攤（店面標準 §12 第 3 點）：老闆站在攤車後面、面向客人，照夜市攤販的做法（shoplife3d.js 的 stallKeeper：SHOPLIFE.tendSync 每 0.5 秒照 q.isOpen 顯示／隱藏；這裡自己也對一次）。
   3 買得到（§12 第 4 點）——S.order：
       老闆 greet →（22:00～24:00）half.line → 第 5 次起、上次選過辣度：熟客句（照上次的辣度，只說一次；EAT 的 l5）→
       選單：四種夾法「夾法　價錢 元」（半價時段是半價；錢不夠變灰）＋第 5 次起「老樣子」（上次的夾法＋辣度，老闆回 spice.reply）＋「算了」→
       錢不夠＝旁白 no_money、不買 → 旁白 take → 老闆問 spice.ask、三選（選老樣子＝不問）→ 扣錢 → 老闆 wait → 時間過 5 分鐘（NM3.HRS，和夜市同一套）→ 老闆 done →
       EAT.ordered（次數、「吃過的」記「滷味」、第一次＝eat_lines.js 現有那句旁白）→ EAT.together（附近剛好有認識的人在吃＝問一次，和其他店同一套）。
     吃的效果：遊戲沒有體力、飽足（DL-02），和其他宵夜、夜市一樣＝扣錢、時間、吃過的、熟客。
   4 和人一起來（考完的宵夜等 2D 出遊，outings3d.js → EAT.outingFirst）：照現有的走，只多了選夾法和辣度（S.order 的 outing：不說 greet／take／wait／done、時間照出遊自己的）；
     選「算了」、錢不夠＝這一趟沒吃（不記吃過的）。src/eat3d.js 的 outingFirst 有這支才走這裡，沒有＝照舊。
   存檔：G.eat.lwSpice＝上次的辣度（字）；G.eat.last['宵夜（滷味攤）']＝上次的夾法。舊存檔沒有＝第一次照樣問、沒有老樣子。
   測試：node tests/luwei_stall_unit.js */
const LW3=(function(){
  const S={};
  const D=()=>typeof LUWEI_STALL!=='undefined'?LUWEI_STALL:null;
  const GMof=()=>typeof GAME!=='undefined'?GAME:null;
  S.ZONE='gongguan'; S.KEY='宵夜（滷味攤）'; S.ITEM='滷味'; S.OUT_PLACE='公館滷味攤'; S.ID='st_luwei';
  S.GLB='assets/models/env/second_ai/luwei_stall.glb'; S.ASSET='bldg.luwei_stall';
  /* 位置（公館區域的座標；人行道 z 8～17 可以走，騎樓在 +z）：x、z＝攤車前緣中間（模型的原點），yaw＝客人那一面朝哪裡（0＝+z，和 tingzhou_layout.js 的 stalls 同一個寫法）。
     模型本身朝 −z（luwei_stall.json 的 origin），所以轉半圈。rects＝導航擋的範圍 [x0,x1,z0,z1]：攤車＋後面老闆站的地方、旁邊的折疊桌和凳子（模型的大小照 GLB 的節點量）*/
  S.AT={x:-4.0,z:11.2,yaw:0};
  S.rects=function(){ const a=S.AT; return [[a.x-0.85,a.x+1.25,a.z-1.25,a.z+0.45],[a.x-3.2,a.x-1.45,a.z-0.5,a.z+1.15]]; };
  S.custSpot=function(){ const a=S.AT; return {x:a.x,z:+(a.z+1.05).toFixed(2)}; };            // 客人站的地方（攤車前面）
  S.keeperSpot=function(){ const a=S.AT; return {x:a.x,z:+(a.z-0.8).toFixed(2),yaw:a.yaw}; };   // 老闆站的地方（攤車後面、面向客人）
  S.CLOSING_H=1;          // 過了收攤時間以後攤車還在多久（老闆在收；稿 closed 那一句）
  S.hour=G=>(((+G.hour||0)%24)+24)%24;
  S.typhoon=function(G){ const d=D(); if(!d||!d.typhoonOff||typeof CALENDAR==='undefined'||!CALENDAR.typhoon) return false; try{ return !!CALENDAR.typhoon(G.day); }catch(e){ return false; } };
  S.state=function(G){ const d=D(); if(!d||!G) return 'away'; if(S.typhoon(G)) return 'typhoon'; const h=S.hour(G), o=d.open;
    if(h>=o.from&&h<o.to) return 'open'; const over=(((h-o.to)%24)+24)%24; return over<S.CLOSING_H?'closing':'away'; };   /* over＝收攤以後過了多久（24:00 收＝隔天 0 點多）*/
  S.isOpen=G=>S.state(G)==='open';
  S.present=G=>{ const s=S.state(G); return s==='open'||s==='closing'; };   // 攤車（和老闆）在不在
  S.isHalf=function(G){ const d=D(), h=S.hour(G); return !!d&&h>=d.half.from&&h<d.half.to; };
  S.prices=function(G){ const d=D(), half=S.isHalf(G); return d.menu.map(m=>half?m.half:m.price); };
  S.label=function(){ const d=D(); return d?'看'+d.sign:null; };
  S.who=function(){ const d=D(); return {name:d.who}; };
  S.rec=function(G){ if(typeof EAT!=='undefined'&&EAT.rec) return EAT.rec(G); const R=G.eat&&typeof G.eat==='object'?G.eat:(G.eat={}); for(const k of ['n','last','l5','first']) if(!R[k]||typeof R[k]!=='object') R[k]={}; return R; };
  S.count=function(G){ return typeof EAT!=='undefined'&&EAT.count?EAT.count(G,S.KEY):(S.rec(G).n[S.KEY]|0); };
  S.lastSpice=function(G){ const d=D(), s=S.rec(G).lwSpice; return d&&typeof s==='string'&&d.spice.options.includes(s)?s:null; };
  const HRS=()=>typeof NM3!=='undefined'&&typeof NM3.HRS==='number'?NM3.HRS:5/60;

  /* 點餐。o.outing＝和人一起來的 2D 出遊（只多選夾法和辣度）。回傳 'no'（算了）／'poor'（錢不夠）／夾法的名字 */
  S.order=async function(GM,o){ o=o||{}; const d=D(), G=GM&&GM.G; if(!d||!G) return null; const who=S.who(), R=S.rec(G), key=S.KEY, out=!!o.outing;
    if(GM.sceneBegin) GM.sceneBegin();
    try{
      if(!out){ await GM.say(who,d.lines.greet); if(S.isHalf(G)) await GM.say(who,d.half.line); }
      const n=S.count(G), sp0=S.lastSpice(G), names=d.menu.map(m=>m.name), prices=S.prices(G), money=()=>G.money|0;
      if(!out&&n>=4&&sp0&&R.l5[key]==null){ R.l5[key]=G.day; await GM.say(who,d.spice.regular[sp0]); }   /* 熟客句：照上次的辣度，只說一次 */
      const opts=d.menu.map((m,i)=>({t:m.name+'　'+prices[i]+' 元',dim:money()<prices[i]}));
      let same=-1; { const i=names.indexOf(R.last[key]); if(n>=4&&sp0&&i>=0&&money()>=prices[i]){ same=i; opts.push({t:'老樣子',hint:names[i]+'　'+sp0}); } }
      opts.push({t:'算了'});
      if(typeof EAT!=='undefined'&&EAT.atNow) EAT.atNow(G,key);
      let k=await GM.choose(opts), usual=false;
      if(same>=0&&k===names.length){ usual=true; k=same; await GM.say(who,d.spice.reply); }
      if(k==null||k<0||k>=names.length) return 'no';
      const price=prices[k]; if(money()<price){ await GM.say(null,d.lines.no_money); return 'poor'; }
      if(!out) await GM.say(null,d.lines.take);
      let spice=usual?sp0:null;
      if(!spice){ await GM.say(who,d.spice.ask); const s=await GM.choose(d.spice.options.map(t=>({t}))); spice=d.spice.options[s]||sp0||d.spice.options[0]; }
      GM.money(-price); R.lwSpice=spice;
      if(!out){ await GM.say(who,d.lines.wait); if(GM.advance) GM.advance(HRS()); await GM.say(who,d.lines.done); }
      let tog=false;
      if(typeof EAT!=='undefined'&&EAT.ordered){ await EAT.ordered(GM,key,S.ITEM); R.last[key]=names[k]; if(!out&&EAT.together) tog=await EAT.together(GM,key); }   /* 「吃過的」記「滷味」（和原本考完宵夜記的一樣）；上次的夾法另外記 */
      else { R.n[key]=(R.n[key]|0)+1; R.last[key]=names[k]; }
      S.lastOrder={item:names[k],price,spice,usual,half:S.isHalf(G),together:!!tog};
      if(!out&&GM.autosave) GM.autosave(); return names[k];
    } finally { if(GM.sceneEnd) GM.sceneEnd(); } };
  /* 走到攤子前面按「看滷味」*/
  S.interact=async function(GM,zone){ const d=D(), G=GM&&GM.G; if(!d||!G) return null; S.sync(GM,zone); const st=S.state(G);
    if(st==='open') return S.order(GM);
    await GM.say(null,st==='typhoon'?d.lines.typhoon:(st==='closing'?d.lines.closed:d.lines.not_open)); return st; };

  /* ---------- 3D：攤車、阻擋、老闆 ---------- */
  const inRects=(x,z,pad)=>S.rects().some(r=>x>r[0]-pad&&x<r[1]+pad&&z>r[2]-pad&&z<r[3]+pad);
  S.block=function(nav){ if(typeof SD3!=='undefined'&&SD3.block) return SD3.block(nav,S.rects()); if(!nav||!nav.b||!nav.blockRect) return []; const b0=nav.b.slice(); for(const r of S.rects()) nav.blockRect((r[0]+r[1])/2,(r[2]+r[3])/2,r[1]-r[0],r[3]-r[2],0,0); const got=[]; for(let i=0;i<nav.b.length;i++) if(nav.b[i]&&!b0[i]) got.push(i); nav._cm=null; return got; };
  S.unblock=function(nav,cells){ if(!nav||!cells) return 0; for(const i of cells) nav.b[i]=0; nav._cm=null; return cells.length; };
  /* 照現在的時間擺出來／收起來（進區域、時間變了、按互動點以前都對一次）*/
  S.sync=function(GM,zone){ GM=GM||GMof(); const G=GM&&GM.G, E=GM&&GM.E; zone=zone||(E&&E.zone); const q=zone&&zone.lwStall; if(!q||!G) return null;
    let want=S.present(G);
    if(want&&!q.shown){ const p=E&&E.player&&E.player.obj&&E.player.obj.position; if(p&&G.zone===S.ZONE&&inRects(p.x,p.z,0.45)) want=false; }   /* 玩家剛好站在那裡：等他走開 */
    if(want!==q.shown){ q.shown=want; if(q.model) q.model.visible=want;
      if(want&&q.model&&!q.cells){ q.cells=S.block(zone.nav); } else if(!want&&q.cells){ S.unblock(zone.nav,q.cells); q.cells=null; } }
    else if(q.shown&&q.model&&!q.cells) q.cells=S.block(zone.nav);   /* 模型後來才載到 */
    if(q.model) q.model.visible=!!q.shown;
    for(const n of (E&&E.npcs)||[]) if(n&&n.stallKeeper===S.ID&&n.obj) n.obj.visible=!!q.shown;
    return q; };
  S.attach=function(E,zone){ if(!E||!zone||zone.lwStall||!D()) return null; const a=S.AT, c=S.custSpot();
    const q={id:S.ID,kind:'luwei',x:a.x,z:a.z,yaw:a.yaw,model:null,cells:null,shown:false}; Object.defineProperty(q,'isOpen',{enumerable:true,get(){ return !!q.shown; }});   /* shoplife3d.js 的 tendSync 看這個 */
    zone.lwStall=q;
    if(Array.isArray(E.interactables)) E.interactables.push({x:c.x,z:c.z,radius:1.2,label:S.label(),lwStall:q.id,onInteract:()=>{ const GM=GMof(); return GM?S.interact(GM,zone):null; }});
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest&&ASSETS.loadOne){
      if(!ASSETS.manifest[S.ASSET]) ASSETS.manifest[S.ASSET]={url:S.GLB,type:'building',lazy:true,source:'LAWWW2〔帳號 B〕2026-10-16 原創（tools/blender/env_second/luwei_stall.py；LICENSES.md）'};
      try{ Promise.resolve(ASSETS.loadOne(S.ASSET)).then(g=>{ if(!g||!g.scene||E.zone!==zone) return; const m=g.scene.clone(true); m.name='luwei_stall'; m.position.set(a.x,0,a.z); m.rotation.set(0,a.yaw+Math.PI,0); m.userData.dyn=true;
          m.traverse(x=>{ if(x.isMesh) x.castShadow=!(x.material&&/bulb|glass|bag/.test(x.material.name||'')); }); m.visible=false; (zone.group||E.scene).add(m); q.model=m; S.sync(null,zone); }).catch(e=>console.warn('滷味攤模型載入失敗',e)); }catch(e){ console.warn('LW3.attach',e); } }
    const t0=zone.applyTimeOutdoor; zone.applyTimeOutdoor=function(h,E2){ const r=t0?t0.call(this,h,E2):undefined; try{ S.sync(null,zone); }catch(e){} return r; };
    return q; };
  /* 老闆：站在攤車後面（照 shoplife3d.js 夜市攤販的做法：沒有名字、點不到，說話在互動點）*/
  S.placeKeeper=function(GM){ const E=GM&&GM.E, zone=E&&E.zone, q=zone&&zone.lwStall; if(!q||!E.addNPC||typeof CHAR==='undefined'||!CHAR.build||typeof STORY==='undefined'||!STORY.extraSpec) return null;
    const had=(E.npcs||[]).find(n=>n&&n.stallKeeper===q.id); if(had) return had; const c=S.keeperSpot();
    const sp=Object.assign({},STORY.extraSpec(S.KEEPER_I)); sp.bag=null; const o=CHAR.build(sp); if(!o) return null; o.position.set(c.x,0,c.z); o.rotation.y=c.yaw||0; o.visible=!!q.shown;
    return E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,vendor:true,stallKeeper:q.id,_stall:q}); };
  S.KEEPER_I=57;   // STORY.extraSpec 的第幾個路人外觀（和夜市攤販同一組 40～89）
  S.hook=function(){ if(typeof Z3==='undefined'||!Z3.ZONES||!D()) return false; const zd=Z3.ZONES[S.ZONE]; if(!zd||zd._lw3) return false; const b0=zd.build;
    zd.build=function(E){ const z=b0.call(this,E); try{ S.attach(E,z); }catch(e){ console.warn('LW3.attach',e); } return z; }; zd._lw3=true;
    if(typeof STORY!=='undefined'&&STORY.populate&&!STORY._lw3Pop){ STORY._lw3Pop=true; const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ if(zoneId===S.ZONE){ S.sync(GM); S.placeKeeper(GM); S.sync(GM); } }catch(e){ console.warn('LW3.populate',e); } return r; }; }
    return true; };
  S.hook();
  return S;
})();
if(typeof window!=='undefined') window.LW3=LW3;
