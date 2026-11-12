// 騎腳踏車（使用者：「我應該要可以騎腳踏車」、路上的騎士要真的踩踏板；車是 LAWWW2 的 bike_ride.glb，VISUAL_REVIEW（second_ai）第 19 節）
// - 只在戶外區域騎（校園、公館、溫州街）。自己的車一開始停在宿舍門口東邊；走近「騎腳踏車」上車，右邊的「下車」按鈕下車（車停在下車的地方）。
// - 騎的時候：搖桿、點地面照常，速度 E.SPD.bike；輪子照走的距離轉、曲柄和踏板照齒比轉（輪子一圈、曲柄 0.45 圈），轉彎時把手轉、車身往內側傾。
//   人物的腳踩在踏板上、手握把手（character3d.js 的 rideIK，在真實骨架上算）。
// - 自動下車：和別人說話、坐下、進建築（車停在門口）、走上樓梯或平台（車停在樓梯前）、有人跟著走（劇情、約朋友一起走）、劇情開始。
//   騎著走出校門、往溫州街：車跟著過去。快速前往室內的地方：車停在那棟建築的門外。
// - 存檔：G.bike {zone,x,z,yaw,riding,kind,color,owned}（舊存檔沒有＝車在宿舍門口；沒有 kind＝開局那台城市通勤車）。
// - 自動停車（AA_646 第 3 節；使用者 11-04 01:0x「單車我希望以後改成會自動出現在我剛離開的建築外合法停車的地方 不要只在宿舍樓下」）：
//   從別的區域（建築、捷運、快速前往、走路過來）進到有車的戶外區域、而且不是騎著來的那一刻，車已經停在出來的地方最近的合法停車處（PARKS：校園停車架、宿舍門口、
//   公館人行道的停車架（不停騎樓）、溫州街和 118 巷的停車格旁邊）。只在換區域那一刻，不會走一段路車就跟著。區域裡沒有合法停車處（新生南路）＝照舊（車停在原本的地方）。
'use strict';
const BIKE=(function(){
  const B={};
  const ZONES={campus:1,gongguan:1,wenzhou:1,xinsheng:1,lane118:1};   /* 新生南路、118 巷：AA_646 第 3 節「哪些區域有車」*/
  const HOME={zone:'campus',x:25,z:57.9,yaw:Math.PI/2};   /* 宿舍門口（門 (20,59.6)）東邊、和牆平行；tests/bike_unit.js 檢查站得住、不擋門 */
  const WHEEL_R=0.333, GEAR=0.45, WHEELBASE=1.06;
  const STEER_AXIS={p:new THREE.Vector3(0,0.7,0.3732), d:new THREE.Vector3(0,0.9397,-0.342).normalize()};
  const GRIPS=[new THREE.Vector3(0.29,1.07,0.053),new THREE.Vector3(-0.29,1.07,0.053)];   /* 手腕要到的地方（握點往上 1 cm、往後 3 cm；左＝+x）*/
  let src=null, loading=null;
  let parked=null;    /* {obj,it,zone}：停著的車（目前區域）*/
  let ride=null;      /* {obj,parts,crank,wheel,steer,lean,yaw,lastFlat}：騎著的車（掛在玩家底下）*/
  let pendingPark=false, opts_walked=false, fromZone=null, doorPark=null, relocated=false;
  /* 合法停車處（AA_646 第 3 節）：都是區域裡已經有的停車架、停車格（不新增導航阻擋、不改場景）。車停在架子、機車格那一排的「端點外面」一格，和那一排同方向：
     racks：停車架 [x,z,寬（導航阻擋的寬）,ry]（架子沿本地 x，車沿 z）；rows：機車格／路邊停車那一排 [x0,x1,z,yaw]（沿 x 排）或 lane118 的 [x,z0,z1,'z',yaw]（沿 z 排）；spots：單一個停車位 [x,z,yaw]。
     各建築出口要指定停車位：出口互動點加 bikePark:{x,z,yaw}（LAWWW2 在配置裡標）；區域也可以自己給 zone.bikeParks（[{x,z,yaw}]）。
     校園：zones3d.js 校園的 parkedRack（大道北側五座、男一舍、霖澤館／萬才館前、大道兩側七座）＋宿舍門口（HOME）。
     公館：捷運出口東邊、圓環東邊兩座人行道停車架（ART-GG-STREETLIFE-1023 ②）＋騎樓柱子外那一排機車（人行道上，不是騎樓；z 18.15）的端點。
     溫州街：路邊停著腳踏車、機車格那幾排（zones3d.js 的 scRow）的端點。118 巷：巷口、巷底機車格（LANE118_PROPS.scooter_blocks）的端點。
     新生南路：BIKE-PARK-1104 加了四座停車架（zones3d.js 的 BIKE_RACKS.xinsheng）。
     最近的合法停車處離出來的地方超過 MAXD：車停在那棟的門口旁邊（parkBeside，和騎著進門時一樣），等 LAWWW2 補 bikePark */
  const BR=k=>((typeof Z3!=='undefined'&&Z3.BIKE_RACKS&&Z3.BIKE_RACKS[k])||[]).map(([x,z,ry])=>[x,z,4.6,ry]);   /* BIKE-PARK-1104（LAWWW2）：zones3d.js 的 BIKE_RACKS（新加的停車架）*/
  const PARKS={
    campus:{racks:[[-82,-16,5,0],[-50,-16,5,0],[-18,-16,5,0],[14,-16,5,0],[46,-16,5,0],[-66,55.4,5,0],[58,-102,6,0],[10,-100,4,0],
      [-6,24,4.6,0],[12,24,4.6,0],[33,24,4.6,0],[57,24,4.6,0],[-1,-17.2,4.6,Math.PI],[46,-23.5,4.6,Math.PI],[68,-23.5,4.6,Math.PI]].concat(BR('campus')),spots:[[HOME.x,HOME.z,HOME.yaw],[40.5,-126.4,Math.PI/2]]},   /* BIKE-PARK-1104：校園後門（往 118 巷）旁邊靠牆停一台 */
    gongguan:{racks:[[-14.5,9.2,4.8,Math.PI],[34,9.2,5.4,Math.PI]].concat(BR('gongguan')),
      rows:[[-59.8,-55.8],[-49.6,-44.6],[-43.4,-39.6],[-25.2,-21.2],[-16.4,-13.4],[-6.8,-3],[2.4,5.2],[13.6,17.6],[21.6,25.6],[30.6,34.6],[39.6,43.6],[47.6,51.2],[57.6,61.6],[64.6,68.2]].map(([a,b])=>[a,b,18.15,0])},   /* 和 zones3d.js 公館騎樓前那一排機車同一份（第二批四間店門讓出來以後；CC 11-04：舊排位有四個停車位落在洋洋、afar、轉角唱片、Daybreak 門口正前方；tests/bike_shop_park_unit.js 比對兩邊）*/
    wenzhou:{rows:[[-6.8,-5.1,3.95,0],[9.4,10.3,4.1,0],[18.6,18.6,4.1,0],[16.4,18.95,3.95,0],[24.4,26.95,3.95,0],[5.0,14.35,-3.95,Math.PI],[31.5,37.45,-3.95,Math.PI],[-28.5,-24.25,-3.95,Math.PI]],spots:[[50.2,-3.8,0],[51.0,3.9,Math.PI],[-31.6,-23.0,0],[-13.6,3.95,0]]},   /* ADE-PROPS-1104（LAWWW2 c73d37367，1a191554d）：阿德門西邊那兩台機車拿掉、電線桿挪到 x −12.7——那一排 [-11.5,-10.65] 的停車處（排尾 −12.25～−12.85）被電線桿擋住；改成電線桿西邊一格 (−13.6, 3.95)，不放在拿掉機車的那一段（那裡要讓出價目表、布告欄）*/   /* BIKE-PARK-1104：巷子窄、不放架子：兩點半 Café 門口兩側（也是從公館走進溫州街的地方）、往新生南路那條橫巷 */
    xinsheng:{racks:BR('xinsheng'),spots:[[-24,-4.5,Math.PI/2]]},   /* 溫州街巷口（從溫州街走過來的地方）靠南邊的牆停一台 */
    lane118:{rowsZ:()=>typeof LANE118_PROPS!=='undefined'&&LANE118_PROPS.scooter_blocks?LANE118_PROPS.scooter_blocks.map(([x,z,w,d])=>[x,z-d/2,z+d/2,x<0?Math.PI/2:-Math.PI/2]):[]} };
  B.PARKS=PARKS; B.MAXD=30;
  /* 一個停車架／一排的候選位置（由近到遠；第一個能用的就是這一排的停車位）*/
  function anchorCands(D){ const A=[];
    for(const [x,z,w,ry] of D.racks||[]) for(const sd of [-1,1]){ const L=[]; for(const e of [0.5,0.8,1.1,1.4]){ const off=w/2+e; L.push({x:x+Math.cos(ry)*off*sd,z:z-Math.sin(ry)*off*sd,yaw:ry,src:'rack'}); } A.push(L); }
    for(const [x0,x1,z,yaw] of D.rows||[]){ for(const [ex,sd] of [[x0,-1],[x1,1]]){ const L=[]; for(const e of [0.75,1.05,1.35]) L.push({x:ex+sd*e,z,yaw,src:'row'}); A.push(L); } }
    for(const [x,z0,z1,yaw] of (D.rowsZ?D.rowsZ():[])){ for(const [ez,sd] of [[z0,-1],[z1,1]]){ const L=[]; for(const e of [0.45,0.75,1.05]) L.push({x,z:ez+sd*e,yaw,src:'row'}); A.push(L); } }
    for(const [x,z,yaw] of D.spots||[]) A.push([{x,z,yaw,src:'spot'}]);
    return A; }
  function parkCands(E,zone){ const out=[], D=PARKS[zone];
    if(E&&E.zone&&Array.isArray(E.zone.bikeParks)) for(const q of E.zone.bikeParks) out.push([{x:q.x,z:q.z,yaw:q.yaw||0,src:'zone'}]);
    if(D) for(const L of anchorCands(D)) out.push(L);
    return out; }
  /* 這個停車位能不能用：車身中間和前後（各 0.6 m）站得住、不擋任何出入口（離門的互動範圍 0.9 m 以上：站在車旁邊按鈕要是「騎腳踏車」，不是「進入…」）*/
  function parkOK(E,q){ if(!E.canStand) return true; const fx=Math.sin(q.yaw)*0.6, fz=Math.cos(q.yaw)*0.6;
    if(!E.canStand(q.x,q.z,0.45,0)||!E.canStand(q.x+fx,q.z+fz,0.3,0)||!E.canStand(q.x-fx,q.z-fz,0.3,0)) return false;
    for(const it of E.interactables||[]){ if(!it.exit||it.bike) continue; if(Math.hypot(it.x-q.x,it.z-q.z)<(it.radius||1.5)+0.9) return false; } return true; }
  B.parkOK=(E,q)=>parkOK(E,q);
  /* 這一區能用的停車位（每個停車架兩端、每一排兩端各最多一個）*/
  B.parkSpots=function(E,zone){ const out=[]; for(const L of parkCands(E,zone)){ const q=L.find(c=>parkOK(E,c)); if(q) out.push(q); } return out; };
  B.legalSpot=function(E,zone,x,z){ let best=null, bd=Infinity; for(const q of B.parkSpots(E,zone)){ const d=Math.hypot(q.x-x,q.z-z); if(d<bd){ bd=d; best=q; } } return best?{x:best.x,z:best.z,yaw:best.yaw,d:bd,src:best.src}:null; };
  B.ok=z=>!!ZONES[z];
  B.SPEED=8.5;   /* 和 engine3d.js 的 E.SPD.bike 一樣 */
  /* 五款車（AA_646 第 2 節；使用者 11-04 01:0x「可以買新的單車」）：價格照 AA 的提案（開局帳戶約 7,000～22,000、每月生活費 30,000、打工時薪約 200 元：
     最便宜的淑女車＝兩三週的伙食錢，公路車＝將近一個月的生活費或一百多小時的班）。seat：有後座＋載妹墊（D78）；小折、公路車沒有後座、不能載人。
     colors：車架顏色（[顯示的名字, 色碼]；色碼 null＝模型原本的顏色）；shop：店裡展示車用的街景車款（W3.bikeAny 的 kind）。
     騎的時候五款都是同一台 bike_ride.glb 換車架顏色，沒有後座的把載妹墊藏起來（五款各自的模型 LAWWW2）*/
  const KINDS={
    lady:{name:'淑女車（車籃）',short:'淑女車',price:4200,seat:true,shop:'bike_city_pbask',desc:'（前面一個大車籃，後座可以裝載人墊。）',line:'買菜、上課都好用。',colors:[['奶油白','#efe8d8'],['薄荷綠','#8fc1a9'],['酒紅','#8c3b47']]},
    city:{name:'城市通勤車',short:'城市通勤車',price:6800,seat:true,shop:'bike_city',desc:'（直把手，擋泥板，車燈是內建的。）',line:'學生最常買這台。',colors:[['墨綠','#2f5d50'],['深藍','#2b4f8c'],['黑','#1d1f22'],['銀灰','#9ea3a8']]},
    fold:{name:'小折',short:'小折',price:12800,seat:false,shop:'bike_fold',desc:'（折起來只有一個行李箱大，可以帶上捷運。）',line:'搬家、出去玩都方便。',colors:[['白','#e9e9e6'],['紅','#b8262b'],['藍','#2b4f8c'],['芥末黃','#c9a227']]},
    mtb:{name:'登山車',short:'登山車',price:15800,seat:true,shop:'bike_mtb',desc:'（輪胎很粗，前面有避震。）',line:'你要騎山路的話。……校園裡騎會有點重。',colors:[['黑','#1d1f22'],['橄欖綠','#4f5a3c'],['橘','#d65a2a']]},
    road:{name:'公路車',short:'公路車',price:22800,seat:false,shop:'bike_road',desc:'（彎把，很輕，單手就拿得起來。）',line:'騎河濱很快。……鎖要買好一點的。',colors:[['白','#e9e9e6'],['黑','#1d1f22'],['紅','#b8262b'],['藍','#2b4f8c']]} };
  B.KINDS=KINDS; B.KIND_ORDER=['lady','city','fold','mtb','road'];
  B.DEFAULT_KIND='city';   /* 開局那台＝城市通勤車＋載妹墊（AA_646 第 3 節「存檔」；舊存檔的車也是這台）*/
  /* 存檔的車：G.bike {zone,x,z,yaw,riding, kind,color,owned:[{kind,color}]}——kind／color 是現在騎的那台，owned 是買過的全部（含開局那台）。舊存檔沒有新欄位＝開局那台 */
  function fill(b){ if(!KINDS[b.kind]) b.kind=B.DEFAULT_KIND; if(b.color===undefined||(b.color!==null&&typeof b.color!=='string')) b.color=null;
    if(!Array.isArray(b.owned)) b.owned=[]; b.owned=b.owned.filter(o=>o&&typeof o==='object'&&KINDS[o.kind]).map(o=>({kind:o.kind,color:typeof o.color==='string'?o.color:null}));
    if(!b.owned.length) b.owned.push({kind:B.DEFAULT_KIND,color:null}); if(b.parts!=null&&(typeof b.parts!=='object'||Array.isArray(b.parts))) b.parts={};   /* 櫃台的小東西（AA_651；bikeshop3d.js S.parts）*/
    if(!b.owned.some(o=>o.kind===b.kind&&o.color===b.color)) b.owned.push({kind:b.kind,color:b.color}); return b; }
  function st(G){ if(!G.bike||typeof G.bike!=='object') G.bike=Object.assign({riding:false},HOME); return fill(G.bike); }
  B.state=st;
  /* 讀檔（game3d.js migrate）：有 bike 就補新欄位；不是物件的丟掉（之後 st() 當成宿舍門口那台）；沒有 bike 不寫（照舊＝宿舍門口）*/
  B.migrate=function(s){ if(!s||typeof s!=='object'||s.bike==null) return; if(typeof s.bike!=='object'||Array.isArray(s.bike)){ delete s.bike; return; } fill(s.bike); };
  B.kindOf=G=>st(G).kind;
  B.NO_SEAT='（這台沒有後座。）';   /* AA_646 第 2 節原句 */
  B.hasSeat=G=>{ const k=KINDS[(G&&G.bike&&G.bike.kind)||B.DEFAULT_KIND]; return !k||k.seat!==false; };   /* 現在騎的車有沒有後座（載人：story3d.js 的 rideMode 擋）*/
  B.colorName=(kind,color)=>{ const k=KINDS[kind]; if(!k) return ''; if(color==null) return '原本的顏色'; const c=k.colors.find(q=>q[1]===color); return c?c[0]:''; };
  B.owns=(G,kind,color)=>st(G).owned.some(o=>o.kind===kind&&o.color===(color==null?null:color));
  function load(){ if(src) return Promise.resolve(src); if(!loading) loading=ASSETS.loadOne('prop.bike_ride').then(c=>{ const s=c&&c.scene; if(!s) return null;
      s.traverse(o=>{ if(o.isMesh){ const g=o.geometry, n=g?(g.index?g.index.count:g.attributes.position.count)/3:0; o.castShadow=n>=250&&!/^ride_(alpha|lamp_lens)/.test((o.material&&o.material.name)||''); o.receiveShadow=false; if(g) g.userData.shared=true; } });   /* 換區域時 disposeGroup 不要丟掉共用的幾何。
         投影只留車架、前叉、輪子（250 個三角形以上）；踏板、曲柄、座墊、車燈、輻條的影子小到看不出來，每台車陰影那一輪少 8 次 draw call（2026-10-16 溫州街效能）*/
      src=s; return s; }).catch(e=>{ console.warn('腳踏車模型載入失敗',e); loading=null; return null; });
    return loading; }
  B.load=load;
  /* color：車架改色（路上的騎士每台不同色；材質 ride_frame 複製一份再改，原本的共用材質不動）*/
  /* kind：玩家自己的車的款式（沒有後座的小折、公路車把載妹墊 rear_cushion 藏起來）；路上的騎士不給 */
  function make(color,kind){ if(!src) return null; const o=src.clone(true); const parts={}; let frameMat=null; o.traverse(n=>{ if(/^(frame|fork|wheel_f|wheel_r|crank|pedal_r|pedal_l)$/.test(n.name)&&!parts[n.name]){ parts[n.name]=n; n.userData.q0=n.quaternion.clone(); }
      if(color&&n.isMesh&&n.material&&n.material.name==='ride_frame'){ if(!frameMat){ frameMat=n.material.clone(); frameMat.color.set(color); } n.material=frameMat; } });
    if(kind&&KINDS[kind]&&KINDS[kind].seat===false) o.traverse(n=>{ if(n.name==='rear_cushion') n.visible=false; });
    o.userData.parts=parts; o.userData.kind=kind||null; o.name='bike_ride'; return o; }
  const mine=s=>make(s.color,s.kind);   /* 自己的車（顏色、款式照存檔）*/
  B.make=make;
  const QA=new THREE.Quaternion(), XA=new THREE.Vector3(1,0,0), YA=new THREE.Vector3(0,1,0);
  /* 姿勢：輪子角度、曲柄角度、把手角度（都繞零件自己的軸；原本的旋轉 q0 保留）*/
  function pose(parts,wheel,crank,steer){ const set=(n,ax,a)=>{ const p=parts[n]; if(p) p.quaternion.copy(p.userData.q0).multiply(QA.setFromAxisAngle(ax,a)); };
    set('wheel_f',XA,wheel); set('wheel_r',XA,wheel); set('crank',XA,crank); set('pedal_r',XA,-crank); set('pedal_l',XA,-crank); set('fork',YA,steer||0); }
  B.pose=pose;
  /* 把手轉了 steer 之後，左右手腕要到的位置（車的座標＝人物控制器的座標）：繞轉向軸轉；k＝車的尺寸（整台車對原點縮放）*/
  function grips(steer,k){ k=k||1; return GRIPS.map(g=>{ const v=g.clone().sub(STEER_AXIS.p).applyAxisAngle(STEER_AXIS.d,steer||0).add(STEER_AXIS.p).multiplyScalar(k); return [v.x,v.y,v.z]; }); }
  B.grips=grips;
  /* 車的尺寸：175 cm 以上騎原尺寸（26 吋）；矮的人騎小一號（最小 0.88 倍）——腿才踩得到最下面的踏板、不會坐進座墊裡（tests/ride_pose_unit.js）*/
  B.scaleFor=hm=>Math.max(0.88,Math.min(1,(hm||1.75)/1.75));
  const STEER_MAX=0.22;   /* 把手最多轉 0.22 rad（約 13°）：再多手臂短的人（林芷若 161 cm）搆不到外側的握把 */
  const btn=()=>typeof document!=='undefined'&&document.getElementById?document.getElementById('btnBike'):null;
  function showBtn(on){ const b=btn(); if(b) b.classList.toggle('hide',!on); }
  function removeParked(E){ if(!parked) return; if(parked.obj.parent) parked.obj.parent.remove(parked.obj); const i=E.interactables.indexOf(parked.it); if(i>=0) E.interactables.splice(i,1); parked=null; }
  /* 停著的車不會動（PERF-GG-DC-1104，LAWWW2 11-04；BB 公館 street_west／arcade draw call 1.43 倍）：零件分開的騎乘模型一台 15 次 draw call（陰影那一輪再 7 次），
     停著的時候照材質合成一個網格（W3.mergeGroup：一台 5 次＋陰影 2～3 次；藏起來的載妹墊不合進去）。名字照舊 bike_ride；上車時 removeParked 丟掉、騎的那台另外 make()（零件照舊分開）*/
  function parkedModel(s){ const o=mine(s); if(!o) return null; pose(o.userData.parts,0,0,0);
    if(typeof W3==='undefined'||!W3.mergeGroup) return o;
    try{ const hid=[]; o.traverse(n=>{ if(n.isMesh&&!n.visible) hid.push(n); }); for(const n of hid) n.parent.remove(n);
      const m=W3.mergeGroup(o); m.name='bike_ride'; m.userData.kind=o.userData.kind; m.userData.merged=true; m.traverse(n=>{ if(n.isMesh) n.receiveShadow=false; }); return m; }
    catch(e){ console.warn('停著的車合併失敗，用原本的模型',e); const o2=mine(s); pose(o2.userData.parts,0,0,0); return o2; } }
  B.parkedModel=parkedModel;
  /* 停著的車：放在區域裡、加「騎腳踏車」互動點 */
  function placeParked(GM){ const E=GM.E, G=GM.G, s=st(G); removeParked(E); if(s.riding||s.zone!==G.zone||!E.zone||!src) return;
    const o=parkedModel(s); if(!o) return; o.position.set(s.x,0,s.z); o.rotation.y=s.yaw; E.zone.group.add(o);
    const it={x:s.x,z:s.z,radius:1.3,lv:0,y:0,label:'騎腳踏車',bike:true,onInteract:()=>B.mount(GM)};
    E.interactables.push(it); parked={obj:o,it,zone:G.zone};
    /* 第一次看到自己的車（第三天以後，避開第一二天的劇情）告訴玩家在哪裡、怎麼騎：2026-10-14 使用者試玩 v9.6「我還是不能騎腳踏車」——v9.7 才有騎車，車停在宿舍門口，沒有人說 */
    const F=G.flags||(G.flags={}); if(!F.BIKE_TIP&&!(typeof STORY!=='undefined'&&STORY.opening?STORY.opening(G):G.day<3)&&!(G.home&&G.home.at)&&GM.toast){   /* 人在家、經濟系退宿以後：不提示宿舍門口的車（BB-C 10-18 BUG-HOME-BIKE-HINT）*/ F.BIKE_TIP=true; const home=s.zone===HOME.zone&&Math.hypot(s.x-HOME.x,s.z-HOME.z)<3; setTimeout(()=>GM.toast((home?'宿舍門口東邊停著你的腳踏車':'這附近停著你的腳踏車')+'：走過去按「騎腳踏車」，右邊的「下車」停車。大地圖上有 🚲。',5200),1500); } }
  /* 第一次自動停車（只一次；AA_646 第 3 節原句）：第一次看到車的提示（BIKE_TIP）說過以後才說 */
  B.PARK_TIP='（你的車停在門口的停車架。以後從哪裡出來，車就停在那裡。）';
  function parkTip(GM){ const G=GM.G, F=G.flags||(G.flags={}); if(F.BIKE_PARK_TIP||!F.BIKE_TIP||!GM.toast) return; F.BIKE_PARK_TIP=true; setTimeout(()=>GM.toast(B.PARK_TIP,4200),1500); }
  /* 找一個站得住的地方（車停的位置：原本的位置不行就往外找；都不行就用原本的）*/
  function spotNear(E,x,z,yaw){ if(!E.canStand||E.canStand(x,z,0.45,0)) return [x,z]; for(const r of [0.5,1,1.5,2,2.5,3]) for(let k=0;k<12;k++){ const a=yaw+k*Math.PI/6, px=x+Math.sin(a)*r, pz=z+Math.cos(a)*r; if(E.canStand(px,pz,0.45,0)) return [px,pz]; } return [x,z]; }
  /* 走進門時車停在門口旁邊、離門 2.2～2.8 m（v9.7 回歸 2026-10-14：停在門的正前方時，走回車旁邊常常是門比車近、按鈕是「進入便利商店」，騎不了）：
     從門往外（門→玩家）的方向左右轉 30～90°，找站得住的地方；都不行才照舊停在玩家旁邊 */
  function parkBeside(E,door,P,yaw){ const vx=P.x-door.x, vz=P.z-door.z, l=Math.hypot(vx,vz), a0=l>0.1?Math.atan2(vx,vz):yaw+Math.PI;
    for(const r of [2.4,2.8,2.2]) for(const d of [Math.PI/3,-Math.PI/3,Math.PI/2,-Math.PI/2,Math.PI/6,-Math.PI/6]){ const a=a0+d, px=door.x+Math.sin(a)*r, pz=door.z+Math.cos(a)*r; if(!E.canStand||E.canStand(px,pz,0.45,0)) return [px,pz]; }
    return spotNear(E,P.x,P.z,yaw); }
  B.mount=function(GM){ const E=GM.E, G=GM.G, P=E.player, s=st(G); if(s.riding||P.busy||!B.ok(G.zone)) return false;
    /* 一起走的人還不願意坐後座：不上車，一起走路（AA_137 第 5 節；載妹墊開局就有，使用者 2026-10-16）*/
    if(typeof STORY!=='undefined'&&STORY.rideBlock){ for(const n of E.npcs){ if(n.beh!=='follow'||n.noRide) continue; const why=STORY.rideBlock(GM,n); if(why){ if(GM.caption) GM.caption('',why,3200); else if(GM.toast) GM.toast(why,3200); return false; } } }
    if(!src){ load().then(()=>{ if(src) B.mount(GM); }); return false; }
    /* 有人跟著一起走：照樣上車，他會坐到後座（engine3d.js 的 beh 'passenger'；使用者 2026-10-15「腳踏車要可以載人」）——原本「有人跟著一起走，先用走的」*/
    { const p=P.obj.position; if(Math.hypot(p.x-s.x,p.z-s.z)>0.5&&!opts_walked&&E.moveTo(P,s.x,s.z,()=>{ opts_walked=true; try{ B.mount(GM); } finally { opts_walked=false; } })) return false; }   /* 先走到車旁邊再上車（不瞬移）*/
    removeParked(E);
    P.path=null; P.target=null; P.onArrive=null; P.obj.position.set(s.x,0,s.z); P.obj.rotation.y=s.yaw; if(E.setLv) E.setLv(P,0); else P.lv=0; if(E.settleY) E.settleY(P);
    attach(GM); return true; };
  function attach(GM){ const E=GM.E, G=GM.G, P=E.player, s=st(G); const o=mine(s); if(!o) return false; const k=B.scaleFor(P.heightM); P.obj.add(o); o.position.set(0,0,0); o.rotation.set(0,0,0); o.scale.setScalar(k);
    ride={obj:o,parts:o.userData.parts,crank:0,wheel:0,steer:0,lean:0,k,yaw:P.obj.rotation.y,px:P.obj.position.x,pz:P.obj.position.z,lastFlat:{x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y}};
    pose(ride.parts,0,0,0); s.riding=true; s.zone=G.zone; P.riding=true; P.pose='ride'; P.idlePose='ride'; P.ride={crank:0,grips:grips(0,k),scale:k}; showBtn(true); return true; }
  /* 下車：車停在 at（預設＝現在的位置）；人往左邊（+x）讓開一步（站不住就右邊；都不行就不動）*/
  B.dismount=function(GM,opts){ opts=opts||{}; const E=GM.E, G=GM.G, P=E.player, s=st(G); if(!s.riding&&!ride) return false;
    const at=opts.at||{x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y};
    if(ride&&ride.obj.parent) ride.obj.parent.remove(ride.obj); ride=null; P.obj.rotation.z=0;
    s.riding=false; P.riding=false; P.ride=null; if(P.pose==='ride') P.pose='idle'; if(P.idlePose==='ride') P.idlePose='idle';
    s.zone=opts.zone||G.zone; s.x=at.x; s.z=at.z; s.yaw=at.yaw;
    if(!opts.away&&!opts.at){ const y=P.obj.rotation.y, lx=Math.cos(y), lz=-Math.sin(y), fx=Math.sin(y), fz=Math.cos(y), x0=P.obj.position.x, z0=P.obj.position.z;
      const C=[[lx*0.65,lz*0.65],[-lx*0.65,-lz*0.65],[lx*0.9,lz*0.9],[-lx*0.9,-lz*0.9],[-fx*0.9,-fz*0.9],[(lx-fx)*0.6,(lz-fz)*0.6],[(-lx-fx)*0.6,(-lz-fz)*0.6],[fx*0.9,fz*0.9]];   /* 兩側 0.65 → 兩側 0.9 → 車後 → 斜後 → 車前：窄的地方（公館捷運出口旁）兩側都站不住時也讓開（CC 11-04 flow_bike E：stand 0）*/
      for(const [dx,dz] of C){ const x=x0+dx, z=z0+dz; if(!E.canStand||E.canStand(x,z,0.3,P.lv|0)){ P.obj.position.x=x; P.obj.position.z=z; break; } } }
    showBtn(false); if(!opts.away) placeParked(GM); return true; };
  /* 換區域（GM.enter 開頭）：要去的地方騎得到就連車一起過去；不行就把車停下 */
  B.beforeEnter=function(GM,to,opts){ opts=opts||{}; const E=GM.E, G=GM.G, s=st(G); pendingPark=false; relocated=false;
    fromZone=opts.fromLoad?null:G.zone; doorPark=null;   /* 從哪裡來（自動停車：afterEnter 看是不是從別的區域進來）*/
    if(!opts.fromLoad&&E.player&&E.interactables){ const P0=E.player.obj.position; let dd=Infinity; for(const i of E.interactables){ if(!i.exit||i.exit.to!==to) continue; const d=Math.hypot(i.x-P0.x,i.z-P0.z); if(d<(i.radius||1.5)+3&&d<dd){ dd=d; doorPark=i.bikePark||i.exit.bikePark||null; } } }   /* 走的那個出口有指定停車位（bikePark）*/
    if(opts.fromLoad){ if(ride&&ride.obj.parent) ride.obj.parent.remove(ride.obj); ride=null; parked=null; if(E.player){ E.player.riding=false; E.player.ride=null; E.player.obj.rotation.z=0; } return; }
    if(!s.riding){ parked=null; return; }
    if(B.ok(to)){ s.zone=to; return; }   /* 騎著過去（車還掛在玩家底下；afterEnter 重新接上）*/
    const P=E.player.obj.position; const door=E.interactables.find(i=>i.exit&&i.exit.to===to&&Math.hypot(i.x-P.x,i.z-P.z)<(i.radius||1.5)+3);
    if(door){ const [x,z]=parkBeside(E,door,P,E.player.obj.rotation.y); B.dismount(GM,{at:{x,z,yaw:E.player.obj.rotation.y},away:true}); }   /* 走進門：車停在門口旁邊（parkBeside）*/
    else { B.dismount(GM,{away:true}); pendingPark=true; }   /* 快速前往（或劇情帶過去）：車停到那棟建築的門外（afterEnter 找出口）*/
    parked=null; };
  /* 換區域之後（populate 之後）：騎著就重新接上；停在這裡就擺出來；快速前往進了建築就把車移到這棟的門外 */
  B.afterEnter=function(GM,to){ const E=GM.E, G=GM.G, s=st(G);
    if(pendingPark){ pendingPark=false; let ex=E.interactables.find(i=>i.exit&&B.ok(i.exit.to)&&i.exit.spawn);
      if(to==='cvs'&&G.flags&&G.flags.CVS_FROM==='wenzhou'&&typeof WZS!=='undefined'&&WZS.AA413&&WZS.AA413.cvs&&WZS.AA413.cvs.out) ex={exit:{to:'wenzhou',spawn:WZS.AA413.cvs.out}};   /* 溫州街 A5 的日和：同一間室內（出口寫公館，closed3d.js 出門時換回溫州街）→ 車停溫州街 A5 門外（CC／BB 11-04）*/
      if(ex){ const sp=ex.exit.spawn; s.zone=ex.exit.to; s.x=sp.x+Math.cos(sp.yaw||0)*1.4; s.z=sp.z-Math.sin(sp.yaw||0)*1.4; s.yaw=(sp.yaw||0)+Math.PI/2; s.fix=true; } }
    if(s.riding&&!B.ok(to)) s.riding=false;   /* 不該發生（騎著進了室內）：當作沒騎 */
    /* 自動停車（AA_646 第 3 節）：從別的區域走進有車的戶外區域（不是騎著來、不是讀檔）＝車已經停在出來的地方最近的合法停車處 */
    if(!s.riding&&B.ok(to)&&fromZone&&fromZone!==to&&E.player){ const p=E.player.obj.position; let q=null;
      if(doorPark&&parkOK(E,doorPark)) q={x:doorPark.x,z:doorPark.z,yaw:doorPark.yaw||0}; else { q=B.legalSpot(E,to,p.x,p.z); if(q&&q.d>B.MAXD) q=null; }
      if(!q&&PARKS[to]){   /* 這一區有合法停車處、但都離這個門太遠：停在出來的那個門旁邊（和騎著進門時同一個做法）*/
        const back=E.interactables.filter(i=>i.exit&&i.exit.to===fromZone).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0], yaw=E.player.obj.rotation.y;
        const [x,z]=back&&Math.hypot(back.x-p.x,back.z-p.z)<(back.radius||1.5)+4?parkBeside(E,back,p,yaw):spotNear(E,p.x,p.z,yaw); q={x,z,yaw:yaw+Math.PI/2,beside:true}; }
      if(q){ s.zone=to; s.x=q.x; s.z=q.z; s.yaw=q.yaw; s.fix=false; relocated=!q.beside; } }
    fromZone=null; doorPark=null;
    const go=()=>{ if(E.zone&&E.zone.def&&E.zone.def.id!==G.zone) return; if(s.riding){ if(!ride||!ride.obj.parent) attach(GM); else { const p=E.player.obj.position; ride.lastFlat={x:p.x,z:p.z,yaw:E.player.obj.rotation.y}; ride.px=p.x; ride.pz=p.z; E.player.pose='ride'; E.player.idlePose='ride'; showBtn(true); } } else { showBtn(false); if(s.zone===G.zone){ if(s.fix){ const [x,z]=spotNear(E,s.x,s.z,s.yaw); s.x=x; s.z=z; s.fix=false; } placeParked(GM); if(relocated) parkTip(GM); } } };
    if(src) go(); else if(s.riding||s.zone===G.zone) load().then(go); };
  /* 每一幀（E.update 之後）*/
  B.tick=function(GM,dt){ const E=GM.E, G=GM.G; if(!G||!E||!E.player) return; const P=E.player, s=st(G); if(!ride) return; const o=P.obj;
    if(ride.obj.parent!==o){ o.add(ride.obj); ride.obj.position.set(0,0,0); ride.obj.rotation.set(0,0,0); }   /* 正式人物模型晚到時玩家的 obj 會換新（game3d.js 的 upgradeModels）：車跟著換過去 */
    // 自動下車
    const follow=E.npcs.some(n=>n.beh==='follow'&&(n.noRide||(E.rideMode&&E.rideMode(n)==='refuse')));   /* 一起走的人會坐後座（beh 'passenger'）；不坐後座的（noRide、還不願意）要下車一起走 */
    if(P.busy||follow||P.seat||(P.pose!=='ride'&&P.pose!=='idle'&&P.pose!=='walk'&&P.pose!=='run')){ B.dismount(GM,B.sceneParkAt(GM)); return; }
    if((P.lv|0)!==0||o.position.y>0.12){ const lf=ride.lastFlat; B.dismount(GM,{at:lf}); if(GM.toast) GM.toast('（樓梯不能騎，車停在下面。）',2200); return; }
    ride.lastFlat.x=o.position.x; ride.lastFlat.z=o.position.z; ride.lastFlat.yaw=o.rotation.y;
    // 輪子、曲柄、把手、車身傾斜
    const dist=Math.hypot(o.position.x-(ride.px===undefined?o.position.x:ride.px),o.position.z-(ride.pz===undefined?o.position.z:ride.pz)); ride.px=o.position.x; ride.pz=o.position.z;
    const d=dist<2.5?dist:0;   /* 換區域、瞬移不算（?turbo 一幀最多 0.3 秒 × 6.2 m/s＝1.9 m）*/ if(d>0&&typeof FIT!=='undefined'&&FIT.bike&&GM.G) FIT.bike(GM.G,d);   /* 騎車每 2 公里體能 +1（每週最多 +3，src/fit3d.js）*/
    ride.wheel+=d/(WHEEL_R*ride.k); ride.crank+=d/(WHEEL_R*ride.k)*GEAR;
    let dy=o.rotation.y-ride.yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); ride.yaw=o.rotation.y; const v=dt>0?d/dt:0, w=dt>0?dy/dt:0;
    const steerT=v>0.3?Math.max(-STEER_MAX,Math.min(STEER_MAX,Math.atan(WHEELBASE*ride.k*w/Math.max(v,1)))):0, leanT=v>0.3?Math.max(-0.2,Math.min(0.2,-Math.atan(v*w/9.8))):0, k=Math.min(1,dt*6);
    ride.steer+=(steerT-ride.steer)*k; ride.lean+=(leanT-ride.lean)*k;
    pose(ride.parts,ride.wheel,ride.crank,ride.steer); o.rotation.z=ride.lean;
    P.ride=P.ride||{}; P.ride.crank=ride.crank; P.ride.grips=grips(ride.steer,ride.k); P.ride.scale=ride.k;
    if(P.pose!=='ride') P.pose='ride';
    /* AA_137 第 5 節第 3 步（AA_140 G49）：載著人一起騎，實際騎了 6 秒以後，她隨機一句短話（她的閒聊短招呼池 STORY.ladGreet），一趟（上車到下車）最多一句；字幕，不打斷騎車 */
    const pas=E.npcs.find(n=>n.beh==='passenger'&&n.charId);
    if(pas){ if(v>1) ride.tripT=(ride.tripT||0)+dt; if(!ride.tripSaid&&ride.tripT>6){ ride.tripSaid=true; const t=typeof STORY!=='undefined'&&STORY.ladGreet?STORY.ladGreet(G,pas.charId):null; if(t&&GM.caption) GM.caption((typeof SOCIAL!=='undefined'?SOCIAL.displayName(pas.charId):pas.name)+'：',t,3600); } } };
  /* 路上騎腳踏車的人（game3d.js 的 spawnRider）：一個群組＝人＋車（同一個座標，和玩家一樣）；照路線一段一段騎，轉角不瞬間轉向（每秒最多轉 2 rad）；
     輪子、曲柄照距離轉，轉彎時把手轉、車身往內側傾；人物用 pose 'ride'（rideIK）。車的模型還沒載好時人先不顯示。
     o＝CHAR.build 出來的人（模型晚到時 upgradeModels 會換掉 x.rider，所以每一幀用 this.rider）*/
  B.rider=function(o,route,color,height){ const g=new THREE.Group(); g.add(o); g.position.set(route[0][0],0,route[0][1]); const k=B.scaleFor(height);
    return {obj:g,rider:o,route,ri:0,seg:0,speed:4.2+Math.random()*1.2,bike:null,wheel:0,crank:0,steer:0,lean:0,yaw:null,k,
      update(dt){ const rd=this.rider; if(!this.bike){ const b=make(color); if(!b){ load(); rd.visible=false; return; } b.scale.setScalar(k); g.add(b); this.bike=b; rd.visible=true; }
        const step=this.speed*dt; let a=route[this.ri], c=route[(this.ri+1)%route.length], len=Math.hypot(c[0]-a[0],c[1]-a[1])||1; this.seg+=step;
        if(this.seg>=len){ this.seg-=len; this.ri=(this.ri+1)%route.length; a=route[this.ri]; c=route[(this.ri+1)%route.length]; len=Math.hypot(c[0]-a[0],c[1]-a[1])||1; this.seg=Math.min(this.seg,len); }
        const ex=(c[0]-a[0])/len, ez=(c[1]-a[1])/len; g.position.set(a[0]+ex*this.seg,0,a[1]+ez*this.seg);
        const want=Math.atan2(ex,ez); if(this.yaw==null) this.yaw=want; const dy=Math.atan2(Math.sin(want-this.yaw),Math.cos(want-this.yaw)), turn=Math.max(-2*dt,Math.min(2*dt,dy)); this.yaw+=turn; g.rotation.y=this.yaw;
        const w=dt>0?turn/dt:0, v=this.speed, kk=Math.min(1,dt*6); this.wheel+=step/(WHEEL_R*k); this.crank+=step/(WHEEL_R*k)*GEAR;
        this.steer+=(Math.max(-STEER_MAX,Math.min(STEER_MAX,Math.atan(WHEELBASE*k*w/Math.max(v,1))))-this.steer)*kk; this.lean+=(Math.max(-0.2,Math.min(0.2,-Math.atan(v*w/9.8)))-this.lean)*kk; g.rotation.z=this.lean;
        if(typeof E3!=='undefined'&&E3.seeLOD){ const vis=E3.seeLOD(g.position.x,1.0,g.position.z,1.8); if(g.visible!==vis) g.visible=vis; if(!vis&&E3.seeCd>16) return; }   /* 畫面外、遠處（距離 LOD）不畫、不算車和人的動畫，照樣往前騎（X69）；16 m 內畫面外照算（鏡頭一轉過去不會露出沒更新的姿勢，同 NPC）*/
        pose(this.bike.userData.parts,this.wheel,this.crank,this.steer);
        if(typeof CHAR!=='undefined'&&CHAR.animate) CHAR.animate(rd,dt,{pose:'ride',speed:0,ride:{crank:this.crank,grips:grips(this.steer,k),scale:k}}); } }; };
  B.riding=()=>!!ride;
  /* 車停在哪（小地圖、大地圖的綠點）：沒在騎才有；舊存檔沒有 G.bike＝宿舍門口 */
  B.parkedAt=G=>{ if(!G) return null; const s=G.bike||HOME; return s.riding?null:{zone:s.zone,x:s.x,z:s.z}; };
  B.debug=()=>ride?{wheel:ride.wheel,crank:ride.crank,steer:ride.steer,lean:ride.lean,k:ride.k}:null;   /* 測試用（tests/bike_unit.js）*/
  /* 下車按鈕 */
  B.bindUI=function(GM){ const b=btn(); if(b) b.onclick=()=>B.manualDismount(GM); };
  /* 按「下車」（AA_137 第 5 節第 5 步，AA_140 G49）：載著人的時候中途下車＝她先下車、站在旁邊說一句；之後騎到她旁邊停下，她照第 2 步再坐上來 */
  /* 劇情把人放下車（busy）：車原本停在當下位置——停在活動、店門這些互動點 1.5 m 內就擋住按鈕（BB 11-10 BUG-FAIR-BIKE-BLOCK-1110：校慶園遊會 (−14.5,10.5) 學姊攤位自動開演，車停在園遊會互動點正中間，演完只剩「騎腳踏車」）。
     附近 1.5 m 有別的互動點時：改停到最近的合法停車處（BIKE.legalSpot，30 m 內）；沒有合法停車處就照舊（dismount 自己找旁邊站得住的地方）。人不搬（opts.at 只放車） */
  B.sceneParkAt=function(GM){ try{ const E=GM.E, G=GM.G, P=E&&E.player; if(!P||!E.interactables) return undefined; const o=P.obj.position;
      const near=E.interactables.some(i=>i&&!i.bike&&i.x!=null&&Math.hypot(i.x-o.x,i.z-o.z)<1.5); if(!near) return undefined;
      const q=B.legalSpot(E,G.zone,o.x,o.z); if(!q||q.d>B.MAXD) return undefined; return {at:{x:q.x,z:q.z,yaw:q.yaw||0}}; }catch(e){ return undefined; } };
  B.manualDismount=function(GM){ if(!ride||GM.E.player.busy) return false; const pas=GM.E.npcs.find(n=>n.beh==='passenger'&&n.charId); B.dismount(GM);
    if(pas&&GM.caption) GM.caption((typeof SOCIAL!=='undefined'?SOCIAL.displayName(pas.charId):pas.name)+'：','……我還是走一下好了。',3200); return true; };
  return B;
})();
