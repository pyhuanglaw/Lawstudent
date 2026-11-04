/* 慢輪單車（公館 G06，原本的輪轉單車；AA_646、AA_647；使用者 11-04 01:0x「公館店面輪轉單車也要改成可以進去　可以買新的單車」；BIKE-SHOP-PARK-1104）。
   - 公館店門口：營業時間（PLACES.hours.bikeshop：10:00～20:00、週一公休）「進入慢輪單車」，打烊時門口的字（AA_646 第 1 節原句）。
   - 室內（bikeshop 區域，約 8 × 12 m）：這一版是暫代的室內（Z3.room＋展示車用街景的車款 W3.bikeAny、櫃台、修車架、工作台是方塊）——**正式室內美術待 CC 做（AA_647 分工），接法照 l118_shops3d.js**。
     展示車五款各一台（地上一排）：「看這台車」；老闆（白天在修車區、17:00 以後在櫃台）：「找車行老闆」＝SQ16 的招呼／進度（SIDEQ.bikeShop，照舊），再問要做什麼。
   - 買車（AA_646 第 2 節）：看車 → 款式說明、老闆一句 → 買 → 選顏色 → 錢不夠＝老闆「這台不急。……下次再來看。」（不扣錢）→ 夠＝付錢、調座墊（時間 +10 分）、新車停在車行門口。
     舊車留在車行（G.bike.owned），「換一台騎」換；「幫我打氣」免費。
   - 台詞只用 AA_646 原文；稿上沒有的（小東西的旁白、補胎、換完車的那一句）這一版不做。
   座標：x 往右、z 往門口（門在 +z）；和公館的接法：店門口互動點在 zones3d.js（公館店面街 G06）*/
'use strict';
const BIKESHOP=(function(){
  const S={};
  const W=8, D=12, H=3.4;
  const SPAWN={x:0,z:3.8,yaw:Math.PI};                    /* 進門站的地方（面向店裡）*/
  const EXIT={x:0,z:5.2,r:1.1};                           /* 「離開慢輪單車」*/
  S.OUT_SPAWN={x:-0.3,z:18.0,yaw:Math.PI};                /* 出店站在公館人行道（騎樓外），和書店 (−42,18) 同一排 */
  S.PARK={zone:'gongguan',x:-2.25,z:18.15,yaw:0};         /* 車行門口的停車位（騎樓柱子外那一排機車的端點；BIKE.parkOK 檢查過，tests/bike_shop_park_unit.js）：新車、換的車停這裡 */
  S.DISPLAY=[['lady',-3.0],['city',-1.5],['fold',0],['mtb',1.5],['road',3.0]].map(([k,z])=>({kind:k,x:-2.5,z}));   /* 地上一排展示車（沿 x 擺），看車的人站在 x −1.0 */
  S.COUNTER={x:2.6,z:2.6,w:2.0,d:0.7};                    /* 櫃台（收銀機、小玻璃櫃、型錄）*/
  S.STAND={x:0.2,z:-4.2};                                 /* 修車架（夾著一台車，沿 x）*/
  S.BENCH={x:2.6,z:-5.2,w:2.2,d:0.7};                     /* 工作台（靠後牆）*/
  /* 老闆站哪：白天修車區、傍晚（17:00 起）櫃台（AA_646 第 1 節）；進店那一刻決定（店員的人在 story3d.js 的 clerk，同一個位置）*/
  S.ownerSpot=G=>{ const h=((((G&&G.hour)||12)%24)+24)%24; return h>=17?{x:S.COUNTER.x,z:S.COUNTER.z-0.85,yaw:0,at:'counter',ix:S.COUNTER.x,iz:S.COUNTER.z+0.9}:{x:1.5,z:-4.4,yaw:-Math.PI/2,at:'repair',ix:1.7,iz:-3.3}; };
  const G_=()=>typeof GAME!=='undefined'?GAME.G:null;
  S.isOpen=G=>{ G=G||G_(); if(!G) return true; return typeof PLACES==='undefined'||!PLACES.isOpen||!PLACES.hours||!PLACES.hours.bikeshop?true:PLACES.isOpen('bikeshop',((G.hour%24)+24)%24,G.day); };
  S.CLOSED='（鐵捲門拉下來了。門上寫：週一公休。）';   /* AA_646 第 1 節原句 */
  // ---------- 台詞（AA_646 原文）----------
  const BOSS={name:'車行老闆'};
  S.L={ fit:'好，我幫你調一下座墊。……十分鐘。', fitDone:'（老闆把座墊調到你的高度，按了兩下車鈴。）', tryIt:'騎看看。', poor:'這台不急。……下次再來看。', which:'哪一台？', pump:'好了。',
    look:'看這台車', want:'我想看車', swap:'換一台騎', pumpAsk:'幫我打氣' };
  let busy=false;
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
    await GM.say(BOSS,S.L.fit); if(GM.advance) GM.advance(10/60); await GM.say(null,S.L.fitDone); await GM.say(BOSS,S.L.tryIt);
    if(GM.memo) GM.memo('買了'+k.short); return true; }
  S.buyFlow=buyFlow;
  /* 「看這台車」（展示車旁邊）*/
  S.lookBike=async function(GM,kind){ if(busy) return true; busy=true; GM.sceneBegin(); try{ await pitch(GM,kind); await buyFlow(GM,kind); } finally { busy=false; GM.sceneEnd(); } return true; };
  /* 「找車行老闆」：先照舊（SQ16 的進度、認得你、招呼；SIDEQ.bikeShop），再問要做什麼 */
  S.owner=async function(GM){ if(busy) return true; busy=true; const G=GM.G;
    try{ if(typeof SIDEQ!=='undefined'&&SIDEQ.bikeShop) await SIDEQ.bikeShop(GM);
      GM.sceneBegin(); try{ const s=BIKE.state(G), opts=[{t:S.L.want,v:'want'}]; if(s.owned.length>1) opts.push({t:S.L.swap,v:'swap'}); opts.push({t:S.L.pumpAsk,v:'pump'},{t:'不用了',v:null});
        const i=await GM.choose(opts), v=opts[i]&&opts[i].v;
        if(v==='want'){ const ks=BIKE.KIND_ORDER.map(id=>({t:K(id).name+'　'+K(id).price.toLocaleString('en-US')+' 元',id})); const j=await GM.choose(ks.concat([{t:'再看看'}])); if(j>=0&&j<ks.length){ await pitch(GM,ks[j].id); await buyFlow(GM,ks[j].id); } }
        else if(v==='swap'){ await GM.say(BOSS,S.L.which); const os=s.owned.map(o=>({t:K(o.kind).short+'・'+BIKE.colorName(o.kind,o.color),o,cur:o.kind===s.kind&&o.color===s.color})); const j=await GM.choose(os.map(q=>({t:q.t,hint:q.cur?'現在騎的':'',dim:q.cur})).concat([{t:'不用了'}]));
          if(j>=0&&j<os.length&&!os[j].cur) S.ride(G,os[j].o.kind,os[j].o.color); }
        else if(v==='pump') await GM.say(BOSS,S.L.pump);
      } finally { GM.sceneEnd(); } } finally { busy=false; }
    return true; };
  // ---------- 室內（暫代；正式模型 CC）----------
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  function box(g,x,y,z,w,h,d,c){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c)); m.position.set(x,y,z); g.add(m); return m; }
  const zone={ id:'bikeshop', name:'慢輪單車', indoor:true, camDist:4.0, build(E){
    const z=Z3.room(E,{w:W,d:D,h:H,windows:false,warm:true,wallColor:'#ece6da',floorTex:W3.stoneTex('#c9c4ba'),spawn:Object.assign({},SPAWN)}); const g0=z.group, nav=z.nav;   /* 地板：淺灰水泥（D112 不用深色木地板）*/
    const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);   /* 正式模型來了整組藏起來（l118_shops3d.js 的做法）*/
    const G=G_(), IT=E.interactables;
    // 展示車（地上一排）：街景的車款（有正式模型就是正式模型）
    for(const d of S.DISPLAY){ const k=K(d.kind), b=W3.bikeAny(k.colors[0][1],0,k.shop); b.position.set(d.x,0,d.z); b.rotation.y=Math.PI/2; fb.add(b); nav.blockRect(d.x,d.z,1.85,0.6,0,0);
      IT.push({x:d.x+1.5,z:d.z,radius:0.65,lv:0,label:S.L.look+'（'+k.short+'）',bikeLook:d.kind,onInteract:()=>S.lookBike(GAME_(E),d.kind)}); }
    // 櫃台、修車架、工作台、牆上的輪胎（方塊暫代）
    { const c=S.COUNTER; box(fb,c.x,0.5,c.z,c.w,1.0,c.d,'#8b6a4a'); box(fb,c.x+0.5,1.12,c.z,0.4,0.25,0.35,'#3a3d40'); nav.blockRect(c.x,c.z,c.w,c.d,0,0.05); }
    { const b=W3.bikeAny('#2f5d50',3,'bike_city'); b.position.set(S.STAND.x,0.25,S.STAND.z); b.rotation.y=Math.PI/2; fb.add(b); box(fb,S.STAND.x,0.12,S.STAND.z,0.3,0.25,0.3,'#5a5e63'); nav.blockRect(S.STAND.x,S.STAND.z,1.9,0.7,0,0.05); }
    { const b=S.BENCH; box(fb,b.x,0.45,b.z,b.w,0.9,b.d,'#6f6a62'); nav.blockRect(b.x,b.z,b.w,b.d,0,0.05); }
    for(const zz of [-3,-1.5,0]){ const t=new THREE.Mesh(new THREE.TorusGeometry(0.33,0.04,6,18),M('#222426')); t.position.set(W/2-0.12,2.2,zz); t.rotation.y=Math.PI/2; fb.add(t); }
    // 互動點：老闆、出口
    const os=S.ownerSpot(G); z.bikeOwner=os;
    IT.push({x:os.ix,z:os.iz,radius:1.0,lv:0,label:'找車行老闆',onInteract:()=>S.owner(GAME_(E))});
    IT.push({x:EXIT.x,z:EXIT.z,radius:EXIT.r,lv:0,label:'離開慢輪單車',exit:{to:'gongguan',spawn:Object.assign({},S.OUT_SPAWN),bikePark:{x:S.PARK.x,z:S.PARK.z,yaw:S.PARK.yaw}}});
    nav._cm=null;
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.bikeshop_interior']) ASSETS.loadOne('bldg.bikeshop_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return; Z3.attachRoomGLB(z,g0,fb,c.scene.clone(true)); z.formal=true; }).catch(e=>console.warn('慢輪單車室內正式模型載入失敗，用暫代的',e));   /* CC 交件後在 ASSETS.manifest 登記 bldg.bikeshop_interior */
    return z; } };
  const GAME_=E=>typeof GAME!=='undefined'?GAME:null;
  S.zone=zone;
  if(typeof Z3!=='undefined'&&Z3.ZONES&&!Z3.ZONES.bikeshop) Z3.ZONES.bikeshop=zone;
  return S;
})();
