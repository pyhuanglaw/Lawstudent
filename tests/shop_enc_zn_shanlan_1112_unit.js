// 宋知寧換到山嵐書店這條線（AA_828 第 6 節，企劃線 1d6055568c；任務 SHOP-JOBS-1112 第四輪）——不需要瀏覽器（D131）。
// 原本的洞：AA_641 的 znMove 寫 spot「shanlan」（AA_634 暫定的名字），實際的區域是 xs_shanlan；src/shopenc3d.js 直接拿它當區域 id，
//   S.shanlanOpen() 永遠 false＝第 5 則訊息一直被跳過（改發第 6 則）、她從來沒搬去山嵐。
// 檢查：
//   1. 對照表：資料的 shanlan → 區域 xs_shanlan（S.ZONE_OF／zoneOf）；資料檔沒有手改（還是 shanlan）；站著的店、站哪一層（二樓）用區域 id
//   2. 真的區域表（Z3.ZONES 有 xs_shanlan、沒有 shanlan）：S.shanlanOpen() 是 true；六則訊息照順序發（第 5 則不再被跳過）
//   3. 舊存檔（第 5 則被跳過、已經收到第 6 則）：補發第 5 則（只補一次、第 6 則不重發、照原本的節奏）；補發以前她還在頁間書屋、補發的隔天起才搬
//   4. 第 5 則以後：週六 14～17、週日 14～18 在山嵐（週日 17:30 還在、週六 17:30 不在）；頁間書屋那個時段沒有她；平日不在；大三起不在
//   5. 進山嵐（S.enter）：她站二樓（CROWD 山嵐二樓的站點，[x,z,yaw,1]）、預約那一點；S.after 生她在二樓（lv 1）；二樓沒有站得住的點＝「沒有站的地方」取消（不編座標）
//   6. 她回「在幹嘛」：搬了以後「在山嵐顧二樓。」
//   7. 祐廷上班遇到她的兩版選哪一版（JOBS.znCoOn／znCoLines 的規則在 tests/shop_jobs_aa828_1112_unit.js 第 3、10 節逐句驗；這裡只對資料：沒有 metEarly、at 兩筆、newFrom 大一下）
// 修改前（開發分支 1ec4613b04）：第 1 項（沒有 ZONE_OF）、第 2 項（第 5 則被跳過）、第 3～5 項 FAIL。用法：node tests/shop_enc_zn_shanlan_1112_unit.js
require('./alison.js');
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}}; global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
global.CHAR={build:()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{}}),setExpr(){}};
console.warn=()=>{};
let GG=null;
global.SOCIAL={STAGES:['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'],MEMORY_LABEL:{},ACT:{chat:{fam:2},cafe:{fam:3,trust:1,comf:2}},
  stage:()=>'ACQUAINTANCE',displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,has:()=>false,remember(){},activity:()=>({})};
global.EVENTS={cond:()=>true,npcOf:()=>null,onEnter(){},tick(){},running:false};
const files=['src/data/calendar.js','src/data/characters.js','src/data/places.js','src/story3d.js','src/outings3d.js','src/home3d.js','src/data/encounters.js','src/encounter3d.js','src/phone3d.js','src/msg3d.js','src/data/shop_enc.js','src/shopenc3d.js','src/data/shop_jobs_aa828.js'];
for(const f of files) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|OUT|HOME|ENCOUNTERS|ENC|PHONE|MSG|SHOP_ENC|SHOPENC|SHOP_JOBS_AA828)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, ZN='npc_songzn', X=SHOP_ENC.aa641, SHAN='xs_shanlan';
const mk=(day,hour,o)=>{ const G=Object.assign({day,hour,weekday:CALENDAR.dateOf(day).wd%7,zone:'cafe',flags:{afternoonDone:true},social:{mem:{}},courses:{},invites:[],money:5000,weather:'clear',stage:'law',daily:{}},o||{}); GG=G; return G; };
const wdDay=(from,wd,dir)=>{ for(let d=from;Math.abs(d-from)<80;d+=dir||1){ const T=CALENDAR.termOf(d); if(CALENDAR.dateOf(d).wd%7===wd&&T&&!T.exam) return d; } return null; };
/* 從 d0 一天一天跑到 d1：每天 09:00 決定、23:30 送出 */
const runDays=(G,d0,d1)=>{ for(let d=d0;d<=d1;d++){ G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.daily={}; G.hour=9; SHOPENC.znPhone(G); G.hour=23.5; PHONE.tick(G); } return G; };
const texts=G=>(G.msgs||[]).filter(m=>m.th==='p:'+ZN).map(m=>m.text);

// ---------- 1. 對照表 ----------
{ const src=fs.readFileSync(path.join(ROOT,'src/data/shop_enc.js'),'utf8');
  check('1. 資料檔（匯入的）沒有手改：znMove.spot 還是 shanlan、週六 14～17、第 5 則以後',X.znMove.spot==='shanlan'&&J(X.znMove.days)==='[6]'&&X.znMove.from===14&&X.znMove.to===17&&X.znMove.after===5&&/"spot": "shanlan"/.test(src));
  check('1. 對照表：shanlan → xs_shanlan；其他店照原樣',typeof SHOPENC.zoneOf==='function'&&SHOPENC.zoneOf('shanlan')===SHAN&&SHOPENC.zoneOf('bookstore')==='bookstore'&&SHOPENC.zoneOf('toString')==='toString'&&SHOPENC.shanlanZone()===SHAN,J(SHOPENC.ZONE_OF));
  check('1. 站著的店、站哪一層用區域 id（xs_shanlan 二樓）；沒有留著不存在的 shanlan',SHOPENC.STAND_SPOTS.includes(SHAN)&&!SHOPENC.STAND_SPOTS.includes('shanlan')&&SHOPENC.STAND_LV[SHAN]===1,J(SHOPENC.STAND_SPOTS));
  const ix=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), xs=fs.readFileSync(path.join(ROOT,'src/xinsheng3d.js'),'utf8')+fs.readFileSync(path.join(ROOT,'src/shanlan3d.js'),'utf8');
  check('1. 遊戲裡的區域真的叫 xs_shanlan（src 有登記這個區域 id；沒有任何地方登記 Z3.ZONES.shanlan）',/xs_shanlan/.test(xs)&&!/ZONES\.shanlan\b|ZONES\[['"]shanlan['"]\]/.test(xs)&&ix.includes('src/shopenc3d.js')); }

// ---------- 2. 區域在：六則照順序 ----------
const d0=STORY.termDay('Y1S1',3,6), dEnd=STORY.dayOfKey('2027-08-31');
{ delete global.Z3; check('2. 沒有區域表（舊的測試環境）：山嵐沒開、名單裡沒有它',!SHOPENC.shanlanOpen()&&!SHOPENC.spots().includes(SHAN));
  global.Z3={ZONES:{shanlan:{name:'不存在的舊名字'}}}; check('2. 只有舊名字 shanlan 的區域表：不算開（對的是 xs_shanlan）',!SHOPENC.shanlanOpen());
  global.Z3={ZONES:{xs_shanlan:{name:'山嵐書店'},bookstore:{name:'頁間書屋'}}};
  check('2. 區域表有 xs_shanlan：山嵐開了、進名單（修改前：永遠 false）',SHOPENC.shanlanOpen()&&SHOPENC.spots().includes(SHAN)&&!SHOPENC.spots().includes('shanlan'),J(SHOPENC.spots()));
  const G=runDays(mk(d0,9,{flags:{afternoonDone:true,SHOP_ZN_MET:true,SHOP_ZN_CONTACT:true}}),d0,dEnd), R=G.flags.SHOP_ZN_BK;
  check('2. 新存檔：六則照順序發，第 5 則（去山嵐打工）不再被跳過',J(texts(G))===J(X.znMsgs)&&J(R.sent)===J([0,1,2,3,4,5]),J(R.sent));
  const m5=G.msgs.filter(m=>m.th==='p:'+ZN)[4]; check('2. 第 5 則發的那一天記在 moved',!!m5&&R.moved===m5.day&&/山嵐/.test(m5.text),J([R.moved,m5&&m5.day])); }

// ---------- 3. 舊存檔補發 ----------
{ delete global.Z3;   /* 先照修改前的樣子跑：山嵐「沒開」＝1、2、3、4、6 */
  const G=runDays(mk(d0,9,{flags:{afternoonDone:true,SHOP_ZN_MET:true,SHOP_ZN_CONTACT:true}}),d0,dEnd), R=G.flags.SHOP_ZN_BK, last=R.last;
  check('3. 舊存檔的樣子：收到 1、2、3、4、6，第 5 則被跳過、沒有 moved',J(R.sent)===J([0,1,2,3,5])&&R.moved==null&&J(texts(G))===J([0,1,2,3,5].map(i=>X.znMsgs[i])),J(R.sent));
  const save=JSON.parse(J({flags:G.flags,msgs:G.msgs,phone:G.phone})), save0=J(save);   /* 存檔來回 */
  global.Z3={ZONES:{xs_shanlan:{name:'山嵐書店'},bookstore:{name:'頁間書屋'}}};
  const dA=STORY.termDay('Y2S2',2,1), G2=mk(dA,9,Object.assign({},save)); GG=G2;
  check('3. 修好以後：下一則＝第 5 則（補發）',SHOPENC.znNext(G2)===4,String(SHOPENC.znNext(G2)));
  const satB=wdDay(dA,6,1); { const g=mk(satB,15,{flags:G2.flags}); check('3. 補發以前：她還在頁間書屋、不在山嵐',!!SHOPENC.znEligible(g,'bookstore')&&!SHOPENC.znEligible(g,SHAN)&&!SHOPENC.znMoved(g)); }
  GG=G2; runDays(G2,dA,CALENDAR.termDays('Y2S2').to); const R2=G2.flags.SHOP_ZN_BK, T2=texts(G2);
  check('3. 補發了第 5 則：只多一則、是第 5 則、第 6 則沒有重發、之後沒有別的',T2.length===6&&T2[5]===X.znMsgs[4]&&T2.filter(t=>t===X.znMsgs[5]).length===1&&T2.filter(t=>t===X.znMsgs[4]).length===1&&J(R2.sent)===J([0,1,2,3,5,4])&&SHOPENC.znNext(G2)===-1,J([R2.sent,T2.length]));
  const m=G2.msgs.filter(x=>x.th==='p:'+ZN)[5], T=CALENDAR.termOf(m.day), wd=CALENDAR.dateOf(m.day).wd%7;
  check('3. 補發照原本的節奏：學期中的平日 21:00 左右、不在考試週、離上一則至少 '+SHOPENC.ZN_GAP+' 天、那一學期不超過兩則',!!T&&!T.exam&&wd>=1&&wd<=5&&m.h>=21&&m.h<21.5&&m.day>=last+SHOPENC.ZN_GAP&&(R2.terms[T.id]|0)<=2,J([CALENDAR.dateOf(m.day).key,m.h,R2.terms]));
  check('3. 補發的那一天記 moved；那一天她還沒搬、隔天起才算搬',R2.moved===m.day&&!SHOPENC.znMoved(mk(m.day,15,{flags:G2.flags}))&&SHOPENC.znMoved(mk(m.day+1,15,{flags:G2.flags})));
  const g2=JSON.parse(J(G2.flags)); check('3. 存檔 JSON 來回不壞',J(g2.SHOP_ZN_BK)===J(G2.flags.SHOP_ZN_BK));
  { const y3=STORY.termDay('Y3S1',2,1), G5=mk(y3,9,JSON.parse(save0)); const nx=SHOPENC.znNext(G5); runDays(G5,y3,CALENDAR.termDays('Y3S1').to);
    check('3. 大三以後才讀到的舊存檔：她已經不在店裡了（只到大二下）＝不補發「有空來坐」那一則、也不搬',nx===-1&&texts(G5).length===5&&G5.flags.SHOP_ZN_BK.moved==null,J([nx,G5.flags.SHOP_ZN_BK.sent])); }
  /* 沒有 SHOP_ZN_BK 的舊存檔（加了聯絡人、還沒收過訊息）、完全沒認識她的存檔：不壞 */
  const G3=mk(dA,9,{flags:{SHOP_ZN_MET:true,SHOP_ZN_CONTACT:true}}); let err=null; try{ SHOPENC.znPhone(G3); SHOPENC.znEligible(G3,SHAN); SHOPENC.npOf(G3,ZN); }catch(e){ err=e; }
  const G4=mk(dA,9,{flags:{}}); try{ SHOPENC.znPhone(G4); SHOPENC.znEligible(G4,SHAN); }catch(e){ err=err||e; }
  check('3. 沒有 SHOP_ZN_BK／沒認識她的存檔：不丟例外、沒認識的不發訊息',!err&&!G4.flags.SHOP_ZN_BK&&!(G4.msgs||[]).length,String(err)); }

// ---------- 4. 第 5 則以後在哪 ----------
{ global.Z3={ZONES:{xs_shanlan:{name:'山嵐書店'},bookstore:{name:'頁間書屋'}}};
  const mvDay=STORY.termDay('Y1S2',3,2), F={SHOP_ZN_MET:true,SHOP_ZN_CONTACT:true,SHOP_ZN_BK:{c0:mvDay-60,sent:[0,1,2,3,4],terms:{},last:mvDay,moved:mvDay}};
  const sat=wdDay(mvDay+1,6,1), sun=wdDay(mvDay+1,0,1), wed=wdDay(mvDay+1,3,1), at=(d,h,z)=>!!SHOPENC.znEligible(mk(d,h,{flags:F}),z);
  check('4. 她在山嵐的時間：週六 14～17（AA_641）＋週日 14～18（AA_828 第 6 節，匯入的資料）',J(SHOPENC.znShanSlots())===J([{wd:6,from:14,to:17},{wd:0,from:14,to:18}])&&J(SHOP_JOBS_AA828.jobs.shanlan.co.at)===J([{wd:6,t0:14,t1:17},{wd:7,t0:14,t1:18}]),J(SHOPENC.znShanSlots()));
  check('4. 週六 14～17 在山嵐（13:50、17:10 不在）；頁間書屋那個時段沒有她',at(sat,14,SHAN)&&at(sat,16.9,SHAN)&&!at(sat,13.8,SHAN)&&!at(sat,17.2,SHAN)&&!at(sat,15,'bookstore'));
  check('4. 週日 14～18 也在山嵐（17:30 還在、18:10 不在）；頁間書屋沒有她',at(sun,14,SHAN)&&at(sun,17.5,SHAN)&&!at(sun,18.2,SHAN)&&!at(sun,13.8,SHAN)&&!at(sun,15,'bookstore'));
  check('4. 平日不在山嵐',!at(wed,15,SHAN)&&!at(wed,15,'bookstore'));
  { const P=SHOPENC.npOf(mk(sun,15,{flags:F}),ZN), Q=SHOPENC.npOf(mk(sat,15,{flags:F}),ZN); check('4. 今天是哪一天就給那一天的時間（週日到 18、週六到 17）；地點是區域 id',P.intro_spot===SHAN&&P.to===18&&Q.to===17&&Q.from===14&&J(P.days)===J([6,0]),J([P.to,Q.to,P.days])); }
  check('4. 第 5 則以前（同一個存檔往前一週的週六）：在頁間書屋、不在山嵐',at(wdDay(mvDay-1,6,-1),15,'bookstore')&&!at(wdDay(mvDay-1,6,-1),15,SHAN)&&!at(wdDay(mvDay-1,0,-1),15,SHAN));
  { const y3=wdDay(STORY.termDay('Y3S1',3,1),6,1), y2=wdDay(STORY.termDay('Y2S2',5,1),0,1); check('4. 她只到大二下：大二下的週日還在、大三上不在',at(y2,15,SHAN)&&!at(y3,15,SHAN)&&!at(y3,15,'bookstore')); }
  { const ex=(()=>{ for(let d=mvDay;d<mvDay+200;d++){ const T=CALENDAR.termOf(d); if(T&&T.exam&&CALENDAR.dateOf(d).wd%7===0) return d; } })(); check('4. 考試週不在（照店內偶遇的規則）',ex==null||!at(ex,15,SHAN)); }
  { const g=mk(sun,15,{flags:{SHOP_ZN_MET:true}}); check('4. 認識她但第 5 則還沒發：不在山嵐（第 6 節第 3 點「第 5 則以前她不在山嵐」）',!SHOPENC.znEligible(g,SHAN)&&!SHOPENC.znMoved(g)); }
  // ---------- 5. 進山嵐：站二樓 ----------
  const PTS=[[-3.6,-4.0,-1.5708,1],[-0.8,-6.0,-1.5708,1],[2.8,-5.5,1.5708,1],[4.8,-6.5,-1.5708,1]], taken=[];
  global.CROWD={SHOP_ZONES:{xs_shanlan:{zone:SHAN,units:[{stand:[6.0,-0.8,1.57],kind:'stand'},{stand:[-3.5,-4.6,0],kind:'stand'}].concat(PTS.map(p=>({stand:[p[0],p[1],p[2]],kind:'stand',lv:1})))}},shopStandRes:{},
    shopStandTake:(z,p,o)=>{ taken.push([z,p,o]); return true; }};
  const day5=(()=>{ for(let d=sun;d<sun+7*12;d+=7){ const g=mk(d,15,{flags:F}); if(CALENDAR.termOf(d)&&!CALENDAR.termOf(d).exam&&SHOPENC.decide(g,SHAN)&&SHOPENC.decide(g,SHAN).who===ZN) return d; } })();
  check('5. 找得到一個擲到她的週日（60% 的機會）',day5!=null);
  { const G=mk(day5,15,{flags:F,zone:SHAN}), calls=[], added=[]; const E={interactables:[{x:-3.6,z:-4.0,lv:0,radius:1}],npcs:[],zone:{seats:[]},canStand:(x,z,r,lv)=>{ calls.push(lv); return true; },addNPC:n=>{ added.push(n); E.npcs.push(n); return n; }};
    const GM={G,E,D:{active:false}}; const d=SHOPENC.enter(GM,SHAN), st=d&&d.place&&d.place.stand;
    check('5. 進山嵐：她站二樓的站點之一（[x,z,yaw,1]）；一樓的兩個點不挑；一樓的按鈕不擋二樓的點',!!st&&st[3]===1&&PTS.some(p=>p[0]===st[0]&&p[1]===st[1])&&!d.cancel&&calls.length===4&&calls.every(l=>l===1),J([d,calls]));
    check('5. 預約那一點（路人不站）：到 18:00',taken.length===1&&taken[0][0]===SHAN&&taken[0][2].until===18&&taken[0][2].whoId===ZN,J(taken));
    const n=SHOPENC.after(GM,SHAN);
    check('5. 生她在二樓（lv 1）那一點；認識了＝名字「知寧」、按鈕「和知寧說話」；待到 18:00',!!n&&n.lv===1&&n.shopZn===true&&n.obj.position.x===st[0]&&n.obj.position.z===st[1]&&n.name==='知寧'&&n.talkLabel==='和知寧說話'&&n.until===18,n&&J([n.lv,n.name,n.talkLabel,n.until]));
    const G2=mk(day5,15,{flags:F,zone:SHAN}); const E2={interactables:[],npcs:[],zone:{seats:[]},canStand:()=>false,addNPC:n=>n}; const d2=SHOPENC.enter({G:G2,E:E2,D:{active:false}},SHAN);
    check('5. 二樓沒有站得住的點：照舊「沒有站的地方」取消、不生她（不編座標）',!!d2&&d2.cancel==='沒有站的地方'&&!SHOPENC.after({G:G2,E:E2,D:{active:false}},SHAN),J(d2));
    const keep=global.CROWD.SHOP_ZONES.xs_shanlan.units; global.CROWD.SHOP_ZONES.xs_shanlan.units=keep.filter(u=>!u.lv); const G3=mk(day5,15,{flags:F,zone:SHAN}); const d3=SHOPENC.enter({G:G3,E:{interactables:[],npcs:[],zone:{seats:[]},canStand:()=>true},D:{active:false}},SHAN); global.CROWD.SHOP_ZONES.xs_shanlan.units=keep;
    check('5. 配置沒有二樓的站點：一樣取消（不拿一樓的點充數）',!!d3&&d3.cancel==='沒有站的地方',J(d3)); }
  { /* 其他站著的店照舊（不分層、回傳三個數）*/ global.CROWD.SHOP_ZONES.bookstore={zone:'bookstore',units:[{stand:[1,2,0.5],kind:'stand'}]}; const p=SHOPENC.standPick({E:{interactables:[],canStand:()=>true}},'bookstore','k');
    check('5. 頁間書屋（不分層的店）：站點照舊三個數',J(p)===J([1,2,0.5]),J(p)); }
  // ---------- 6. 她回「在幹嘛」----------
  { const RP=MSG.EXTRA[ZN].reply; check('6. 搬了以後回「在山嵐顧二樓。」；搬以前「在書房。」',RP(mk(sun,15,{flags:F}),'chat')==='在山嵐顧二樓。'&&RP(mk(mvDay,15,{flags:F}),'chat')==='在書房。'&&RP(mk(sun,15,{flags:{SHOP_ZN_MET:true,SHOP_ZN_CONTACT:true}}),'chat')==='在書房。'); }
  delete global.CROWD; }

// ---------- 7. 上班遇到她的資料 ----------
{ const C=SHOP_JOBS_AA828.jobs.shanlan.co;
  check('7. 只剩一版：met（三句，有「我上次說的另一家，就是這裡。」）；沒有 new、newFrom（AA_828 第 8 節第 1、2 點，企劃線 1e539b8eb9——舊期望 1d6055568c：new「新來的？…」一句、newFrom 大一下）；沒有 metEarly；第 5 則（msgN 5）；祐廷遇到她的班＝週日 14～18',
    C.metEarly===undefined&&C.met.length===3&&/^我上次說的另一家，就是這裡。/.test(C.met[2][1])&&C.new===undefined&&C.msgN===5&&C.newFrom===undefined&&C.wd===7&&C.t0===14&&C.t1===18&&C.until==='大二下',J(C));
  check('7. 資料的第幾則和 AA_641 一樣（znMove.after）、週六那一筆和 AA_641 一樣',C.msgN===X.znMove.after&&C.at[0].wd===X.znMove.days[0]&&C.at[0].t0===X.znMove.from&&C.at[0].t1===X.znMove.to); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
