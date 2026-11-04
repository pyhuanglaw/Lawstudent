/* 慢輪單車（公館 G06，原本的輪轉單車；AA_646、AA_647；使用者 11-04 01:0x「公館店面輪轉單車也要改成可以進去　可以買新的單車」；BIKE-SHOP-PARK-1104）。
   - 公館店門口：營業時間（PLACES.hours.bikeshop：10:00～20:00、週一公休）「進入慢輪單車」，打烊時門口的字（AA_646 第 1 節原句）。
   - 室內（bikeshop 區域，10.2 × 12 m）：正式模型是 CC 的 Blender（bb_support/bike.glb，配置 src/data/bike_layout.js v2；cc-testing 08378f56d，LAWWW2 驗收 MODEL_READY）。
     接法照溫州街 wzShop：Z3.room（尺寸、導航阻擋、座位照配置）＋attachRoomGLB；模型沒載入（或 ?nobldg）時是備用的色塊＋街景車款 W3.bikeAny。
     展示車照配置五款各一台（地上兩座展示台四台、左牆掛一台登山車）：「看這台車」；老闆（白天在修車區、17:00 以後在櫃台；配置的 npc.owner）：「找車行老闆」＝SQ16 的招呼／進度（SIDEQ.bikeShop，照舊），再問要做什麼。
     修車架上夾著的那台車（GLB 節點 REPAIR_BIKE*）：預設藏，調座墊、打氣的時候才出現（S.repairBike）。配置的「車燈・車鈴・鎖」（bike_parts）這一版不接：AA_646 沒寫買了以後那一句旁白。
   - 買車（AA_646 第 2 節）：看車 → 款式說明、老闆一句 → 買 → 選顏色 → 錢不夠＝老闆「這台不急。……下次再來看。」（不扣錢）→ 夠＝付錢、調座墊（時間 +10 分）、新車停在車行門口。
     舊車留在車行（G.bike.owned），「換一台騎」換；「幫我打氣」免費。
   - 台詞只用 AA_646 原文；稿上沒有的（小東西的旁白、補胎、換完車的那一句）這一版不做。
   座標：x 往右、z 往門口（門在 +z）；和公館的接法：店門口互動點在 zones3d.js（公館店面街 G06）*/
'use strict';
const BIKESHOP=(function(){
  const S={};
  /* 配置（src/data/bike_layout.js；沒有載入時用下面的備用值：v1 的暫代室內 8 × 12 m）*/
  const LAY=()=>typeof BIKE_LAYOUT!=='undefined'&&BIKE_LAYOUT.bike?BIKE_LAYOUT.bike:null;
  const DEF={w:8,d:12,h:3.4,wallColor:'#ece6da',blocks:[[2.6,2.6,2.0,0.7],[0.2,-4.2,1.9,0.7],[2.6,-5.2,2.2,0.7]],seats:[],
    interact:[['lady',-3.0],['city',-1.5],['fold',0],['mtb',1.5],['road',3.0]].map(([m,z])=>({kind:'bike_view',model:m,x:-1.0,z})),
    items:[['lady',-3.0],['city',-1.5],['fold',0],['mtb',1.5],['road',3.0]].map(([m,z])=>({kind:'bike_'+m,model:m,x:-2.5,y:0,z,yaw:0})),
    npc:{owner:[{x:1.5,z:-4.4,yaw:-Math.PI/2,act:'repair'},{x:2.6,z:1.75,yaw:0,act:'stand'}]},ownerAsk:[{x:1.7,z:-3.3},{x:2.6,z:3.5}]};
  const L_=()=>LAY()||DEF;
  /* 進門站的地方（面向店裡）：配置的 spawn (0.55,5.0) 在店門的出口範圍裡，往裡面 1 m（中間走道，兩座展示台之間）*/
  S.SPAWN=(()=>{ const L=LAY(); return L?{x:L.spawn.x,z:L.d/2-2.0,yaw:Math.PI}:{x:0,z:3.8,yaw:Math.PI}; })();
  const SPAWN=S.SPAWN;
  const EXIT=LAY()?{x:LAY().spawn.x,z:LAY().d/2-0.8,r:0.9}:{x:0,z:5.2,r:1.1};   /* 「離開慢輪單車」：店門內（整面拉開的折門 x −0.5～1.6）*/
  S.OUT_SPAWN={x:-0.3,z:18.0,yaw:Math.PI};                /* 出店站在公館人行道（騎樓外），和書店那一排同一個 z */
  S.PARK={zone:'gongguan',x:-2.25,z:18.15,yaw:0};         /* 車行門口的停車位（騎樓柱子外那一排機車的端點；BIKE.parkOK 檢查過，tests/bike_shop_park_unit.js）：新車、換的車停這裡 */
  S.DISPLAY=()=>{ const L=L_(); return BIKE_KIND_ORDER().map(k=>{ const q=(L.interact||[]).find(i=>i.kind==='bike_view'&&i.model===k); const it=(L.items||[]).find(i=>i.model===k&&/^bike_/.test(i.kind)); return q?{kind:k,x:q.x,z:q.z,label:q.label,item:it||null}:null; }).filter(Boolean); };
  const BIKE_KIND_ORDER=()=>typeof BIKE!=='undefined'&&BIKE.KIND_ORDER?BIKE.KIND_ORDER:['lady','city','fold','mtb','road'];
  /* 老闆站哪：白天修車區、傍晚（17:00 起）櫃台（AA_646 第 1 節；配置的 npc.owner：repair、stand）；ix,iz＝找他的互動點（白天：配置的 bike_repair 修車架旁；傍晚：bike_shop 櫃台東端）*/
  S.ownerSpot=G=>{ const h=((((G&&G.hour)||12)%24)+24)%24, L=L_(), ow=(L.npc&&L.npc.owner)||DEF.npc.owner, eve=h>=17;
    const o=ow.find(q=>eve?q.act!=='repair':q.act==='repair')||ow[0];
    const ask=LAY()?((L.interact||[]).find(i=>i.kind===(eve?'bike_shop':'bike_repair'))||o):DEF.ownerAsk[eve?1:0];
    return {x:o.x,z:o.z,yaw:o.yaw,at:eve?'counter':'repair',ix:ask.x,iz:ask.z}; };
  const G_=()=>typeof GAME!=='undefined'?GAME.G:null;
  S.isOpen=G=>{ G=G||G_(); if(!G) return true; return typeof PLACES==='undefined'||!PLACES.isOpen||!PLACES.hours||!PLACES.hours.bikeshop?true:PLACES.isOpen('bikeshop',((G.hour%24)+24)%24,G.day); };
  S.CLOSED='（鐵捲門拉下來了。門上寫：週一公休。）';   /* AA_646 第 1 節原句 */
  // ---------- 台詞（AA_646 原文）----------
  const BOSS={name:'車行老闆'};
  S.L={ fit:'好，我幫你調一下座墊。……十分鐘。', fitDone:'（老闆把座墊調到你的高度，按了兩下車鈴。）', tryIt:'騎看看。', poor:'這台不急。……下次再來看。', which:'哪一台？', pump:'好了。',
    look:'看這台車', want:'我想看車', swap:'換一台騎', pumpAsk:'幫我打氣', fixAsk:'補胎',
    /* AA_651 第 2 節（企劃線 d07e6d124）：小東西、補胎、換車 */
    swapDone:'好，這台。……那台先放我這裡。', swapNarr:'（座墊還是你上次調的高度。）',
    fix:'扎到釘子了。……十五分鐘。', fixNarr:'（老闆把輪胎泡進水盆，看了一圈，沒有氣泡了。）', fixDone:'好了。最近那條路在施工，繞一下。', fixPoor:'先打氣撐一下，……明天再來。',   /* 錢不夠：AA 給的兩種寫法選「不能補」那一種（不記欠款）*/
    partsAgain:'你上次買過了。……還在用吧？' };
  S.PARTS=[{id:'light',name:'車燈',price:350,say:[[null,'（老闆把車燈鎖在把手上，按了一下。前面的地上亮了一圈。）'],['boss','晚上騎河濱要開。']]},
    {id:'bell',name:'鈴',price:120,say:[[null,'（新的車鈴裝在左手邊。你按了一下，聲音比原本的清楚。）']]},
    {id:'lock',name:'鎖',price:680,say:[['boss','這個剪不斷。……鎖在柱子上，不要只鎖輪子。']]}];
  S.FIX_PRICE=100;
  let busy=false;
  /* 櫃台的小東西（配置 bike_parts）：買過的不再賣（G.bike.parts＝{light,bell,lock}，舊存檔沒有＝都沒買）*/
  S.parts=async function(GM){ if(busy) return true; busy=true; const G=GM.G, s=BIKE.state(G), own=s.parts||(s.parts={}); GM.sceneBegin();
    try{ const opts=S.PARTS.map(q=>({t:q.name+'　'+q.price+' 元',hint:own[q.id]?'買過了':'',dim:!own[q.id]&&G.money<q.price,q})); opts.push({t:'不用了'}); const i=await GM.choose(opts), q=opts[i]&&opts[i].q; if(!q) return true;
      if(own[q.id]){ await GM.say(BOSS,S.L.partsAgain); return true; } if(G.money<q.price){ GM.toast&&GM.toast('錢不夠'); return true; }
      GM.money(-q.price); own[q.id]=G.day; for(const [w,t] of q.say) await GM.say(w==='boss'?BOSS:null,t); } finally { busy=false; GM.sceneEnd(); } return true; };
  S.fix=async function(GM){ const G=GM.G; if(G.money<S.FIX_PRICE){ await GM.say(BOSS,S.L.fixPoor); return false; } GM.money(-S.FIX_PRICE); S.repairBike(true);
    try{ await GM.say(BOSS,S.L.fix); if(GM.advance) GM.advance(0.25); await GM.say(null,S.L.fixNarr); await GM.say(BOSS,S.L.fixDone); } finally { S.repairBike(false); } return true; };
  /* 修車架上夾著的那台車（GLB 節點 REPAIR_BIKE*）：預設藏；調座墊、打氣的那一幕顯示（AA_646 第 2 節）*/
  let repairNodes=[];
  S.repairBike=on=>{ for(const o of repairNodes) o.visible=!!on; return repairNodes.length; };
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['bikeshop3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  const K=k=>BIKE.KINDS[k];
  /* 款式說明：旁白、沒有後座的提醒、老闆一句 */
  async function pitch(GM,kind){ const k=K(kind); await GM.say(null,k.desc); if(k.seat===false) await GM.say(null,BIKE.NO_SEAT); await GM.say(BOSS,k.line); }
  /* 買下來（資料層，測試直接用）：'poor'＝錢不夠、'owned'＝已經有這台、true＝買了（扣錢、記進 owned、變成現在騎的、停在車行門口）*/
  S.buy=function(G,kind,color,payFn){ const k=K(kind); if(!k) return false; const s=BIKE.state(G); color=color==null?null:color;
    if(BIKE.owns(G,kind,color)) return 'owned'; if((G.money|0)<k.price) return 'poor';
    if(payFn) payFn(-k.price); else G.money=(G.money|0)-k.price; s.owned.push({kind,color}); S.ride(G,kind,color); return true; };
  /* 換成某一台（買過的）：現在騎的＝這台，停在車行門口 */
  S.ride=function(G,kind,color){ const s=BIKE.state(G); if(!BIKE.owns(G,kind,color)) return false; s.kind=kind; s.color=color==null?null:color; s.riding=false;
    s.zone=S.PARK.zone; s.x=S.PARK.x; s.z=S.PARK.z; s.yaw=S.PARK.yaw; return true; };
  /* 看完一台車以後：買不買、選顏色、付錢、調座墊 */
  async function buyFlow(GM,kind){ const G=GM.G, k=K(kind);
    const a=await GM.choose([{t:'買這台　'+k.price.toLocaleString('en-US')+' 元',dim:(G.money|0)<k.price},{t:'再看看'}]); if(a!==0) return false;
    if((G.money|0)<k.price){ await GM.say(BOSS,S.L.poor); return false; }
    const cols=k.colors.map(([n,c])=>({t:n,hint:BIKE.owns(G,kind,c)?'已經有這台了':'',dim:BIKE.owns(G,kind,c),c}));
    const i=await GM.choose(cols.concat([{t:'再看看'}])); if(i<0||i>=cols.length||cols[i].dim) return false;
    const r=S.buy(G,kind,cols[i].c,GM.money?d=>GM.money(d):null); if(r==='poor'){ await GM.say(BOSS,S.L.poor); return false; } if(r!==true) return false;
    S.repairBike(true); try{ await GM.say(BOSS,S.L.fit); if(GM.advance) GM.advance(10/60); await GM.say(null,S.L.fitDone); } finally { S.repairBike(false); } await GM.say(BOSS,S.L.tryIt);
    if(GM.memo) GM.memo('買了'+k.short); return true; }
  S.buyFlow=buyFlow;
  /* 「看這台車」（展示車旁邊）*/
  S.lookBike=async function(GM,kind){ if(busy) return true; busy=true; GM.sceneBegin(); try{ await pitch(GM,kind); await buyFlow(GM,kind); } finally { busy=false; GM.sceneEnd(); } return true; };
  /* 「找車行老闆」：先照舊（SQ16 的進度、認得你、招呼；SIDEQ.bikeShop），再問要做什麼 */
  S.owner=async function(GM){ if(busy) return true; busy=true; const G=GM.G;
    try{ if(typeof SIDEQ!=='undefined'&&SIDEQ.bikeShop) await SIDEQ.bikeShop(GM);
      GM.sceneBegin(); try{ const s=BIKE.state(G), opts=[{t:S.L.want,v:'want'}]; if(s.owned.length>1) opts.push({t:S.L.swap,v:'swap'}); opts.push({t:S.L.pumpAsk,v:'pump'},{t:S.L.fixAsk+'　'+S.FIX_PRICE+' 元',v:'fix'},{t:'不用了',v:null});
        const i=await GM.choose(opts), v=opts[i]&&opts[i].v;
        if(v==='want'){ const ks=BIKE.KIND_ORDER.map(id=>({t:K(id).name+'　'+K(id).price.toLocaleString('en-US')+' 元',id})); const j=await GM.choose(ks.concat([{t:'再看看'}])); if(j>=0&&j<ks.length){ await pitch(GM,ks[j].id); await buyFlow(GM,ks[j].id); } }
        else if(v==='swap'){ await GM.say(BOSS,S.L.which); const os=s.owned.map(o=>({t:K(o.kind).short+'・'+BIKE.colorName(o.kind,o.color),o,cur:o.kind===s.kind&&o.color===s.color})); const j=await GM.choose(os.map(q=>({t:q.t,hint:q.cur?'現在騎的':'',dim:q.cur})).concat([{t:'不用了'}]));
          if(j>=0&&j<os.length&&!os[j].cur&&S.ride(G,os[j].o.kind,os[j].o.color)){ await GM.say(BOSS,S.L.swapDone); await GM.say(null,S.L.swapNarr); } }
        else if(v==='fix'){ await S.fix(GM); }
        else if(v==='pump'){ S.repairBike(true); try{ await GM.say(BOSS,S.L.pump); } finally { S.repairBike(false); } }
      } finally { GM.sceneEnd(); } } finally { busy=false; }
    return true; };
  // ---------- 室內（正式模型：CC 的 bb_support/bike.glb＋src/data/bike_layout.js；接法照溫州街 wzShop）----------
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  if(typeof ASSETS!=='undefined'&&ASSETS.manifest&&!ASSETS.manifest['bldg.bikeshop_interior']&&LAY())
    ASSETS.manifest['bldg.bikeshop_interior']={url:LAY().glb,type:'building',lazy:true,source:'本作 Blender 腳本 tools/blender/env_second/bb_support/bike_interior.py（公館「慢輪單車」室內，CC〔帳號 A〕製作、LAWWW2 驗收 MODEL_READY；claude/cc-testing 08378f56d，配置 src/data/bike_layout.js v2）',license:'本作'};
  const zone={ id:'bikeshop', name:'慢輪單車', indoor:true, camDist:4.0, build(E){ const L=L_();
    const winXs=LAY()&&L.front&&L.front.windows?L.front.windows.map(w=>-(w[0]+w[1])/2):[];   /* 店面那一面的櫥窗（room() 的 front：沿牆位置 t＝−x）*/
    const z=Z3.room(E,{w:L.w,d:L.d,h:L.h,warm:true,wallColor:L.wallColor,floorTex:W3.stoneTex('#c9c4ba'),spawn:Object.assign({},SPAWN),windows:winXs.length?undefined:false,winWall:'front',winXs}); const g0=z.group, nav=z.nav;   /* 地板：淺灰水泥磚（D112 不用深色木地板）*/
    const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);   /* 正式模型來了整組藏起來 */
    const G=G_(), IT=E.interactables, fbM=M('#a88b6a',{rough:0.8});
    for(const b of L.blocks||[]){ nav.blockRect(b[0],b[1],b[2],b[3],0,0.05); const m=new THREE.Mesh(new THREE.BoxGeometry(b[2],0.85,b[3]),fbM); m.position.set(b[0],0.425,b[1]); fb.add(m); }   /* 備用的家具色塊 */
    // 展示車：備用模型（街景的車款）擺在配置的位置；看車的互動點照配置的 bike_view
    for(const d of S.DISPLAY()){ const k=K(d.kind), it=d.item; if(it){ const b=W3.bikeAny(it.color||k.colors[0][1],0,k.shop); b.position.set(it.x,it.y||0,it.z); b.rotation.y=it.yaw!=null?it.yaw-Math.PI/2:Math.PI/2; fb.add(b); if(!LAY()) nav.blockRect(it.x,it.z,1.85,0.6,0,0); }
      IT.push({x:d.x,z:d.z,radius:0.75,lv:0,label:S.L.look+'（'+k.short+'）',bikeLook:d.kind,onInteract:()=>S.lookBike(GAME_(E),d.kind)}); }
    // 座位（櫃台前的長凳：等調座墊可以坐）
    z.seats=[]; for(const st of L.seats||[]){ z.seats.push({x:st.x,z:st.z,yaw:st.yaw,kind:'shop'}); IT.push({x:st.x,z:st.z,radius:0.9,label:st.label||'坐下',seat:{x:st.x,z:st.z,yaw:st.yaw},shop:'bikeshop'}); }
    // 老闆、出口
    const os=S.ownerSpot(G); z.bikeOwner=os;
    IT.push({x:os.ix,z:os.iz,radius:1.0,lv:0,label:'找車行老闆',onInteract:()=>S.owner(GAME_(E))});
    { const pt=(L.interact||[]).find(i=>i.kind==='bike_parts'); if(pt) IT.push({x:pt.x,z:pt.z,radius:0.7,lv:0,label:pt.label||'車燈・車鈴・鎖',onInteract:()=>S.parts(GAME_(E))}); }
    IT.push({x:EXIT.x,z:EXIT.z,radius:EXIT.r,lv:0,label:'離開慢輪單車',exit:{to:'gongguan',spawn:Object.assign({},S.OUT_SPAWN),bikePark:{x:S.PARK.x,z:S.PARK.z,yaw:S.PARK.yaw}}});
    nav._cm=null; repairNodes=[];
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.bikeshop_interior']) ASSETS.loadOne('bldg.bikeshop_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
      repairNodes=[]; root.traverse(o=>{ if(/^REPAIR_BIKE/.test(o.name)){ o.visible=false; repairNodes.push(o); } });   /* 先藏再接（接的時候出錯也不會露出來）*/
      Z3.attachRoomGLB(z,g0,fb,root); z.formal=true; }).catch(e=>console.warn('慢輪單車室內正式模型載入失敗，用備用的',e));
    return z; } };
  const GAME_=E=>typeof GAME!=='undefined'?GAME:null;
  S.zone=zone;
  if(typeof Z3!=='undefined'&&Z3.ZONES&&!Z3.ZONES.bikeshop) Z3.ZONES.bikeshop=zone;
  return S;
})();
