// BAR-GROUP-3D-1112：律師讀書小組在大口漢堡二樓的三場（ev_bar_group_start／_out／_three）改在 3D 的二樓演——不需要瀏覽器。
//   座位、演完留在二樓、改的那一句：AA_836（企劃線 48d153407，AA-C 定）。程式 src/r2y4b3d.js（S.bar3d／barStage／barPlay…）、台詞 src/data/r2y4b_events.js。
//   0 載入、LOADLOCKS 登記、STORY.populate／OUT.go 接上
//   1 座位照配置算：中間長桌、樓梯在 +x 那一側；四個位子都是 DAKOU_SEATS2() 裡真的座位
//   2 排的出遊帶 goto（xs_dakou、二樓）；視訊的（只有可昕／分開讀的成立那一晚、之後的視訊、木柵大學）沒有 goto
//   3 三個人（成立那一晚、6/23、平日晚上）：到了＝人在大口漢堡二樓、可昕正對面、語彤在可昕旁邊靠樓梯、祐廷坐南側中間；底是 freeze（沒有深色底）；台詞和 2D 一樣；
//     演完人留在大口漢堡、站起來、她們離開、時間往後、長桌的預約放開；路人、照作息坐在那張桌子的人先拿掉
//   4 只有語彤（成立那一晚、她的讀書夜）：語彤坐祐廷旁邊靠樓梯、沒有可昕；「第一次」那三句（改的那一句在這裡）
//   5 只有可昕在場：可昕正對面、語彤的位子空著（留著不給路人）
//   6 台詞：三場＋總圖那一場＋視訊那一場，除了 AA_836 那一句以外一字不差（和改之前的雜湊比）；那一句和 AA_836 的表一字不差（git 讀得到企劃線那個 commit 才比）
//   7 視訊、總圖的照舊：ev_bar_group_video 還是 2D 出遊（深色底、不換區域）；ev_bar_group_night 還是總圖的 auto 事件；只有可昕的成立那一晚還是視訊
//   8 舊存檔：已經排好、沒有 goto 的那一場——區域沒載入＝照舊 2D 演完（不卡）；載入了＝還沒出發的補上 goto；正在演的（arrived）不動
//   9 到了還沒演（讀檔）：人在二樓那張桌子旁邊＝S.tick 接著演；人在一樓＝先不演；隔天＝不演
//   10 黑畫面盤點：三場不再列在深色底（outings3d.js 的 OUT.IN3D）
// 修改前（開發分支 bc559a032）：沒有 S.bar3d／barStage／barPlay，三場都是深色底的 2D——第 0 項起 FAIL。用法：node tests/bar_group_3d_1112_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), crypto=require('crypto'), cp=require('child_process');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|DAKOU_LAYOUT)$/.test(n)?'globalThis.'+n+'=':m).replace(/^function (DAKOU_SEATS2)\(/m,'globalThis.$1=function('); vm.runInThisContext(src,{filename:f}); };
const {check,GM,E}=H, J=JSON.stringify, Z='xs_dakou';
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };
global.CG_REGISTRY={};
/* 假的區域、路人系統、人物 */
global.Z3={ZONES:{[Z]:{id:Z}}};
const taken=[], freed=[]; global.CROWD={ shopSeatTake(zone,st,o){ taken.push([zone,st.x,st.z,st.lv|0,!!(o&&o.instant)]); for(const n of E.npcs.slice()) if(typeof n.crowd==='string'&&n.seat&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.4) E.npcs.splice(E.npcs.indexOf(n),1); return st; }, shopSeatFree(zone,st){ freed.push([zone,st.x,st.z]); return true; } };
let pops=0; STORY.populate=function(){ pops++; };   /* 原本的 STORY.populate（要整個引擎）換成空的；r2y4b3d.js 包在它外面 */
load('src/noodle_closed3d.js'); load('src/data/dakou_layout.js'); load('src/data/r2y4b_events.js'); load('src/r2y4b3d.js');
const S=R2Y4B, D=k=>STORY.dayOfKey(k), ev=id=>STORY_EVENTS.find(e=>e.id===id);
GM.spawnCharacter=(id,x,z,o)=>{ if(GM.npc[id]) return GM.npc[id]; const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:(o&&o.yaw)||0}},seat:(o&&o.seat)||null,lv:(o&&o.lv)|0,pose:'sit'}; GM.npc[id]=n; E.npcs.push(n); return n; };
GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ const i=E.npcs.indexOf(n); if(i>=0) E.npcs.splice(i,1); delete GM.npc[id]; } };
E.removeNPC=n=>{ const i=E.npcs.indexOf(n); if(i>=0) E.npcs.splice(i,1); };
GM.sitAt=(n,s)=>{ n.seat=s; n.obj.position.x=s.x; n.obj.position.z=s.z; n.obj.rotation.y=s.yaw||0; if(s.lv!=null) n.lv=s.lv; };
GM.standUp=n=>{ if(n&&n.seat){ n.obj.position.z=n.seat.z+0.75; n.seat=null; } };
let crowdOnEnter=null;   /* 進門以前先放好的路人、有名字的人（STORY.populate 原本那一段做的事）*/
GM.enter=async(z,sp)=>{ H.entered.push(z); H.G.zone=z; GM.npc={}; E.npcs=[]; E.player.seat=null; if(sp){ E.player.obj.position.x=sp.x; E.player.obj.position.z=sp.z; E.player.obj.rotation.y=sp.yaw||0; E.player.lv=sp.lv|0; }
  E.zone={roomAt:()=>null,seats:z===Z?DAKOU_LAYOUT.shop.floor2.seats.map(s=>({kind:'shop',x:s.x,z:s.z,yaw:s.yaw,lv:1,y:3.6})):[]}; if(crowdOnEnter) crowdOnEnter(); STORY.populate(z,GM); };
/* 第一句台詞那一刻的場面（誰坐哪裡）*/
let shot=null; const say0=GM.say; GM.say=async(who,t)=>{ if(!shot) shot={zone:H.G.zone,me:E.player.seat?{x:E.player.seat.x,z:E.player.seat.z,yaw:E.player.seat.yaw,lv:E.player.seat.lv}:null,npcs:E.npcs.map(n=>({id:n.id||n.crowd||'?',x:n.seat?n.seat.x:null,z:n.seat?n.seat.z:null,yaw:n.seat?n.seat.yaw:null,lv:n.seat?n.seat.lv:null,same:!!n.seat&&E.zone.seats.includes(n.seat)})),meSame:!!E.player.seat&&E.zone.seats.includes(E.player.seat)}; return say0(who,t); };
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone,Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1},flags||{})); G.acts={att:{}}; G.outings=[]; H.at(key,h); G.zone=zone||'dorm'; GM.npc={}; E.npcs=[]; E.zone={roomAt:()=>null,seats:[]}; E.player.seat=null; E.player.lv=0; E.player.obj.position.x=0; E.player.obj.position.z=0; caps.length=0; taken.length=0; freed.length=0; shot=null; crowdOnEnter=null; return G; };
const at=(key,h)=>H.at(key,h);
const phone=()=>{ S.phone(H.G,GM); PHONE.tick(H.G); };
const has=t=>H.said.some(s=>s.t===t);
const texts=()=>H.said.map(s=>s.t);
const reset=()=>{ H.said=[]; H.opts=[]; H.cgs=[]; H.cards=[]; H.bgs=[]; H.entered=[]; caps.length=0; shot=null; };
const run=async id=>{ reset(); await EVENTS.run(ev(id)); };
const goOut=async id=>{ const q=OUT.get(H.G,id); reset(); if(!q) return false; await OUT.go(GM,q); return true; };
const three=()=>{ fresh('2029-02-22',23,'dorm',{Y4_PATH:'bar'}); H.date('kexin'); H.FRIEND('heroine_03'); ROM.learn(H.G,'heroine_03','kexin','test'); at('2029-02-23',8); phone(); };
const ytOnly=()=>{ fresh('2029-02-22',23,'dorm',{Y4_PATH:'bar'}); H.FRIEND('heroine_03'); at('2029-02-23',8); phone(); };
const who=id=>shot&&shot.npcs.find(n=>n.id===id);
const eq=(a,x,z,yaw)=>!!a&&Math.abs(a.x-x)<1e-6&&Math.abs(a.z-z)<1e-6&&Math.abs(a.yaw-yaw)<1e-6&&a.lv===1;
/* 2026-11-12（AA_836 文末「補：熱可可那句分兩版」，企劃線 44ed07c50）：三個人都在＝NEW（三杯、兩杯推到你和可昕面前）；只有語彤和你＝NEW2（兩杯、一杯推到你面前）。
   舊期望：只有語彤的第一次也演 NEW、五場台詞除了 NEW 那一句和改之前一字不差（NEW 兩處）、白名單 48d153407、黑畫面盤點第 5 節 41 句。
   現在：只有語彤演 NEW2；NEW 留給 session.who==='three'（現在的排法「第一次」那一段只在只有語彤時演，三杯那一版直接跑事件、把 session 換成 three 來驗）；
   五場台詞＝拿掉 NEW2 那一列（兩處）以後和改之前一字不差；白名單 44ed07c50（48d153407 進 history）；盤點 42 句（多 NEW2 那一列）*/
const NEW2='（十點，語彤買了兩杯熱可可上來，一杯推到你面前。）';
const NEW='（十點，語彤買了三杯熱可可上來，兩杯推到你和可昕面前。）', OLD='（十點，語彤買了三杯熱可可上來，推了兩杯到長桌另一頭。）';
const wait=()=>new Promise(r=>setTimeout(r,20));

(async()=>{
  /* ===== 0 ===== */
  const idx=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. 載入：S.bar3d／barGoto／barSeats／barCast／barStage／barPlay／barUpgrade／barDue；LOADLOCKS 有 r2y4b3d:barOn；STORY.populate、OUT.go 包上；index.html 的 dakou_layout.js 在 r2y4b3d.js 前面',
    !!S&&['bar3d','barGoto','barSeats','barCast','barStage','barPlay','barUpgrade','barDue','barPending','bar3dEvent'].every(k=>typeof S[k]==='function')&&typeof (globalThis.LOADLOCKS||{})['r2y4b3d:barOn']==='function'
    &&STORY._bar3dPop===true&&OUT._bar3dGo===true&&idx.indexOf('src/data/dakou_layout.js')>0&&idx.indexOf('src/data/dakou_layout.js')<idx.indexOf('src/r2y4b3d.js'));
  if(H.fails) return H.done();
  (globalThis.LOADLOCKS||{})['r2y4b3d:barOn']();

  /* ===== 1 座位 ===== */
  { const P=S.barSeats(), L=DAKOU_LAYOUT.shop, all=DAKOU_SEATS2(), inList=s=>all.some(q=>Math.abs(q.x-s.x)<1e-6&&Math.abs(q.z-s.z)<1e-6&&Math.abs(q.yaw-s.yaw)<1e-6&&q.y===3.6);
    check('1. 中間長桌 (−1,−1)；樓梯 x '+L.stairs.x+' 在長桌東邊＝+x 是靠樓梯那一側', P.table.x===-1&&P.table.z===-1&&L.stairs.x>P.table.x&&L.stairHole.x0>P.table.x+L.floor2.longW/2, J(P.table));
    check('1. 祐廷 南側中間 (−1,−0.25) 朝北；可昕 正對面 (−1,−1.75) 朝南；語彤（可昕旁邊靠樓梯）(0,−1.75)；語彤（祐廷旁邊靠樓梯）(0,−0.25)', eq(P.me,-1,-0.25,Math.PI)&&eq(P.kx,-1,-1.75,0)&&eq(P.ytOpp,0,-1.75,0)&&eq(P.ytBeside,0,-0.25,Math.PI), J([P.me,P.kx,P.ytOpp,P.ytBeside]));
    check('1. 四個位子都是 DAKOU_SEATS2() 的座位；整張桌子六個；到了站的地方在椅子後面（不在桌子、隔壁桌的阻擋裡）', [P.me,P.kx,P.ytOpp,P.ytBeside].every(inList)&&P.all.length===6&&P.all.every(inList)
      &&!L.floor2.blocks.some(b=>Math.abs(P.stand.x-b[0])<b[2]/2+0.32&&Math.abs(P.stand.z-b[1])<b[3]/2+0.32), J(P.stand));
    const g=S.barGoto(); check('1. goto＝{zone xs_dakou, 二樓 lv 1, 朝北}', !!g&&g.zone===Z&&g.lv===1&&g.x===P.stand.x&&g.z===P.stand.z&&Math.abs(g.yaw-Math.PI)<1e-9, J(g)); }

  /* ===== 2 排的出遊 ===== */
  { three(); const q=OUT.get(H.G,'y4_bar_group_start');
    check('2. 三個人：2/23 21:30 成立那一晚帶 goto（大口漢堡二樓）', H.G.flags.BAR_GROUP_KIND==='three'&&!!q&&q.ev==='ev_bar_group_start'&&q.h===21.5&&q.place==='大口漢堡'&&!!q.goto&&q.goto.zone===Z&&q.goto.lv===1, J(q));
    H.G.events.done.ev_bar_group_start=1; q.state='done'; q.bar3d=H.G.day; at('2029-02-25',20); phone(); const qo=OUT.get(H.G,'y4_bar_out_'+D('2029-02-26'));
    check('2. 平日晚上那一場帶 goto、沒有 back（演完留在二樓，不說「回到首都帝大。」）', !!qo&&qo.ev==='ev_bar_group_out'&&qo.h===21&&!!qo.goto&&qo.goto.zone===Z&&qo.goto.lv===1&&qo.back===undefined&&qo.no==='今天先不讀', J(qo));
    at('2029-06-21',12); phone(); const q3=OUT.get(H.G,'y4_bar_three'); check('2. 6/23 三個人的長桌帶 goto', !!q3&&q3.ev==='ev_bar_group_three'&&q3.h===19&&!!q3.goto&&q3.goto.zone===Z&&q3.goto.lv===1, J(q3));
    fresh('2029-02-22',23,'dorm',{Y4_PATH:'bar'}); H.date('kexin'); at('2029-02-23',8); phone(); const qk=OUT.get(H.G,'y4_bar_group_start');
    check('2. 只有可昕：成立那一晚是視訊，沒有 goto', H.G.flags.BAR_GROUP_KIND==='kexin'&&!!qk&&qk.place==='視訊'&&qk.verb==='接起來'&&!qk.goto, J(qk));
    H.G.events.done.ev_bar_group_start=1; qk.state='done'; at('2029-02-25',20); phone(); const qv=OUT.rec(H.G).find(x=>/^y4_bar_vid_/.test(x.id));
    check('2. 只有可昕：之後的視訊（ev_bar_group_video）沒有 goto、back 照舊', !!qv&&qv.ev==='ev_bar_group_video'&&!qv.goto&&qv.back==='視訊結束。', J(qv)); }

  /* ===== 3 三個人 ===== */
  { three(); at('2029-02-23',21.2);
    crowdOnEnter=()=>{ const st=E.zone.seats.find(s=>s.x===-1&&s.z===-1.75), st2=E.zone.seats.find(s=>s.x===-2&&s.z===-0.25), far=E.zone.seats.find(s=>s.x===2.4&&s.z===-5.2)||E.zone.seats.find(s=>Math.abs(s.x-(-1))>3);
      E.npcs.push({crowd:'shop_xs_dakou_1',seat:st,obj:{position:{x:st.x,y:0,z:st.z},rotation:{y:0}}}); const zh={id:'zhe',seat:st2,lv:1,obj:{position:{x:st2.x,y:0,z:st2.z},rotation:{y:0}}}; GM.npc.zhe=zh; E.npcs.push(zh);
      E.npcs.push({crowd:'shop_xs_dakou_9',seat:far,obj:{position:{x:far.x,y:0,z:far.z},rotation:{y:0}}}); };
    const q=OUT.get(H.G,'y4_bar_group_start'), h0=H.G.hour; await goOut('y4_bar_group_start');
    check('3. 出發＝到大口漢堡（xs_dakou），進區域時排好（STORY.populate）', J(H.entered)===J([Z])&&pops>=1&&!!shot&&shot.zone===Z, J(H.entered));
    check('3. 成立那一晚（三個人）：祐廷坐南側中間、可昕正對面、語彤在可昕旁邊靠樓梯；都是區域裡真的座位', !!shot&&eq(shot.me,-1,-0.25,Math.PI)&&shot.meSame&&eq(who('kexin'),-1,-1.75,0)&&who('kexin').same&&eq(who('heroine_03'),0,-1.75,0)&&who('heroine_03').same, J(shot));
    check('3. 那張長桌六個位子留給這一場（CROWD.shopSeatTake，instant）；坐在那張桌子的路人、照作息的人拿掉，別桌的路人不動', taken.length===6&&taken.every(t=>t[0]===Z&&t[3]===1&&t[4])&&!!shot&&!shot.npcs.some(n=>n.id==='shop_xs_dakou_1'||n.id==='zhe')&&shot.npcs.some(n=>n.id==='shop_xs_dakou_9'), J(shot&&shot.npcs.map(n=>n.id)));
    check('3. 底是 freeze（看得到 3D），沒有深色底；地點字幕、標題照舊', H.bgs[0]==='freeze'&&!H.bgs.includes('dark')&&caps.includes('律師讀書小組'), J([H.bgs,caps]));
    check('3. 台詞和 2D 一樣（四句）', J(texts())===J(['（開學第一個週五晚上，大口漢堡二樓。長桌上多了一張手寫的表，可昕寫的。）','每週一、三、五晚上，週六整天。……有意見現在說。','週末我在茶屋。你們平常在這裡讀，我順便考你們。','……好。那表上多一格。']), J(texts()));
    check('3. 演完：人留在大口漢堡、站起來（不坐著、不回宿舍）、她們離開、事件記成演過、時間往後 1 小時、預約放開、出遊 done＋bar3d', H.G.zone===Z&&J(H.entered)===J([Z])&&!E.player.seat&&E.player.lv===1&&!GM.npc.kexin&&!GM.npc.heroine_03&&H.G.events.done.ev_bar_group_start===1
      &&q.state==='done'&&q.bar3d===H.G.day&&Math.abs(H.G.hour-(21.5+1))<1e-6&&h0<21.5&&freed.length===6&&!S.barPending(H.G), J([H.G.zone,H.G.hour,q.state,q.bar3d,freed.length]));
    /* 平日晚上（三個人）*/
    at('2029-02-25',20); phone(); at('2029-02-26',20.9); taken.length=0; freed.length=0; crowdOnEnter=null; const qo=OUT.get(H.G,'y4_bar_out_'+D('2029-02-26')); await goOut(qo.id);
    /* 2026-11-12（AA_836 文末「補（12:2x）」，企劃線 f6aa917593：三杯熱可可那一版在三個人都在的讀書夜也演一次）：三個人第一個平日的讀書夜，可昕那一句前面多三杯那一句（NEW；旁白），演完記 BAR_GROUP_COCOA3。舊期望：H.said.length===1（只有可昕那一句） */
    check('3. 平日晚上（三個人）：一樣的三個位子；三杯熱可可那一句（旁白）→ 可昕那一句；演完 BAR_GROUP_N＝1、BAR_GROUP_COCOA3＝那一天、留在二樓、時間往後 2 小時（20:54 出發＋15 分鐘到＋2 小時）', !!shot&&eq(shot.me,-1,-0.25,Math.PI)&&eq(who('kexin'),-1,-1.75,0)&&eq(who('heroine_03'),0,-1.75,0)&&H.said.length===2&&H.said[0].t===NEW&&H.said[1].t==='刑總那題，你先講結論，再講理由。講完我再問。'&&H.G.flags.BAR_GROUP_COCOA3===H.G.day
      &&H.G.flags.BAR_GROUP_N===1&&H.G.flags.BAR_GROUP_LAST===H.G.day&&H.G.zone===Z&&!E.player.seat&&Math.abs(H.G.hour-(20.9+0.25+2))<1e-6&&H.bgs[0]==='freeze'&&!H.bgs.includes('dark'), J([shot,texts(),H.G.hour]));
    /* 6/23 */
    at('2029-06-21',12); phone(); at('2029-06-23',18.8); await goOut('y4_bar_three');
    check('3. 6/23 三個人的長桌：一樣的三個位子；三句一樣；演完留在二樓', !!shot&&eq(shot.me,-1,-0.25,Math.PI)&&eq(who('kexin'),-1,-1.75,0)&&eq(who('heroine_03'),0,-1.75,0)
      &&J(texts())===J(['（長桌上攤著三疊考古題。語彤把桌上的空杯子疊起來，拿去回收。可昕在算時間。）','還有四十二天。','先吃，湯要涼了。'])&&H.G.zone===Z&&!E.player.seat&&H.G.events.done.ev_bar_group_three===1&&caps.includes('三個人的長桌'), J([shot,texts()])); }

  /* ===== 4 只有語彤 ===== */
  { ytOnly(); at('2029-02-23',21.2); await goOut('y4_bar_group_start');
    check('4. 只有語彤的成立那一晚：語彤坐祐廷旁邊靠樓梯 (0,−0.25) 朝北，不坐對面；沒有可昕；兩句一樣', H.G.flags.BAR_GROUP_KIND==='yutong'&&!!shot&&eq(shot.me,-1,-0.25,Math.PI)&&eq(who('heroine_03'),0,-0.25,Math.PI)&&!who('kexin')
      &&J(texts())===J(['我今年也考。……你考的那幾科，我也要考。','所以你讀的時候，我也在旁邊讀我的。'])&&H.bgs[0]==='freeze'&&!H.bgs.includes('dark')&&H.G.zone===Z, J([shot,texts(),H.bgs]));
    at('2029-02-25',20); phone(); at('2029-02-26',20.9); const qo=OUT.get(H.G,'y4_bar_out_'+D('2029-02-26')); await goOut(qo&&qo.id);
    check('4. 只有語彤的讀書夜（第一次）：語彤坐旁邊；「第一次」三句，第一句是 AA_836 文末兩杯那一版', !!qo&&!!qo.goto&&!!shot&&eq(who('heroine_03'),0,-0.25,Math.PI)&&!who('kexin')&&J(texts())===J([NEW2,'我們一起考。……我先考你。','買賣不破租賃那一條。你講給我聽，講到我聽得懂。'])&&H.G.flags.BAR_GROUP_YT_FIRST===H.G.day, J([shot,texts()])); }

  /* ===== 5 只有可昕在場（現在的排法不會排到，位子照 AA_836 第 4 點）===== */
  { three(); const s0=S.session; S.session=()=>({mode:'noodle',t0:21,t1:23,who:'kexin'}); try{
      const d=D('2029-02-26'); at('2029-02-26',20.9); const q={id:'y4_bar_out_'+d,ev:'ev_bar_group_out',day:d,h:21,state:'done',goto:S.barGoto()}; H.G.outings.push(q); const c=S.barCast(H.G,q);
      await GM.enter(Z,q.goto); const P=S.barSeats();
      check('5. 只有可昕：可昕正對面、語彤不在；語彤的位子 (0,−1.75) 留著（預約、沒有人坐）', c.length===1&&c[0].id==='kexin'&&eq(c[0].seat,-1,-1.75,0)&&!!GM.npc.kexin&&eq(GM.npc.kexin.seat,-1,-1.75,0)&&!GM.npc.heroine_03
        &&taken.some(t=>t[1]===P.ytOpp.x&&t[2]===P.ytOpp.z)&&!E.npcs.some(n=>n.seat&&n.seat.x===0&&n.seat.z===-1.75)&&!!E.player.seat&&E.player.seat.x===-1&&E.player.seat.z===-0.25, J([c,taken.length]));
    } finally { S.session=s0; } }

  /* ===== 6 台詞 ===== */
  { const IDS=['ev_bar_group_start','ev_bar_group_out','ev_bar_group_three','ev_bar_group_night','ev_bar_group_video'];
    const snap=()=>J(IDS.map(id=>[id,ev(id).title,ev(id).dialogue.map(l=>[l.speaker===undefined?'-':l.speaker,l.text||'',l.expression||'',l.scene===undefined?'-':l.scene,l.bg===undefined?'-':l.bg,l.label||'',l.goto||'',!!l.end,(l.choice||[]).map(c=>c.text)])]));
    const sha=s=>crypto.createHash('sha256').update(s).digest('hex'), now0=snap();
    /* 2026-11-12（AA_836 文末「補（12:2x）」，企劃線 f6aa917593：三杯熱可可那一版在三個人都在的讀書夜也演一次）：ev_bar_group_night／_out 各多一列（cocoa3:true；字＝NEW，條件 R2Y4B.cocoa3Due）——和 NEW2 那一列一樣先拿掉再和改之前比。舊寫法：只拿掉 NEW2 */
    { const c3=IDS.map(id=>ev(id).dialogue.filter(l=>l.cocoa3)), ok=id=>{ const d=ev(id).dialogue, i=d.findIndex(l=>l.cocoa3), f=d.findIndex(l=>l.label==='first'); return i>0&&d[i].text===NEW&&d[i].speaker===null&&!!d[i].if&&d[i+1].speaker==='kexin'&&i<f&&d[f+1].text===NEW&&!d[f+1].cocoa3; };
      check('6. 三杯那一版多的一列（cocoa3）只在 ev_bar_group_out、ev_bar_group_night 各一列：字＝NEW（就是「第一次」那一段的那一列，不另外抄）、旁白、排在可昕第一句以前；資料檔 src/data/r2y4b_events.js 裡 NEW 還是只有一處', J(c3.map(a=>a.length))===J([0,1,0,1,0])&&ok('ev_bar_group_out')&&ok('ev_bar_group_night')&&fs.readFileSync(path.join(H.ROOT,'src/data/r2y4b_events.js'),'utf8').split(NEW).length===2&&!fs.readFileSync(path.join(H.ROOT,'src/r2y4b3d.js'),'utf8').includes(NEW), J(c3.map(a=>a.length))); }
    const snap2=()=>J(IDS.map(id=>[id,ev(id).title,ev(id).dialogue.filter(l=>l.text!==NEW2&&!l.cocoa3).map(l=>[l.speaker===undefined?'-':l.speaker,l.text||'',l.expression||'',l.scene===undefined?'-':l.scene,l.bg===undefined?'-':l.bg,l.label||'',l.goto||'',!!l.end,(l.choice||[]).map(c=>c.text)])])), now=snap2();
    const n2=IDS.map(id=>ev(id).dialogue.filter(l=>l.text===NEW2)), idx2=IDS.map(id=>{ const d=ev(id).dialogue, i=d.findIndex(l=>l.text===NEW2); return i>0&&d[i-1].text===NEW&&d[i].speaker===null&&!d[i].expression&&!d[i].scene&&!d[i].label&&!d[i].goto&&!d[i].end&&!d[i].choice; });
    check('6. 兩杯那一版（NEW2）只在 ev_bar_group_out、ev_bar_group_night 各一列、緊接在三杯那一版後面、是旁白；其他三場沒有', J(n2.map(a=>a.length))===J([0,1,0,1,0])&&idx2[1]&&idx2[3]&&now0.split(NEW2).length===3, J(n2.map(a=>a.length)));
    const BASE='1354551ef3df2fd876886bbe9c5336b0bc1b7fd59f88069405016561168ee292';   /* 改之前（開發分支 bc559a032）同一個算法的雜湊 */
    check('6. 五場的台詞、說話的人、表情、地點字幕、底、標題：除了 AA_836 那一句（和文末多的兩杯那一列）以外和改之前一字不差', now.split(NEW).length===3&&!now.includes(OLD)&&sha(now.split(NEW).join(OLD))===BASE, sha(now.split(NEW).join(OLD)));
    check('6. 2D 的事件資料沒動：三場的 background 還是 dark、「大口漢堡・二樓」那一步還是深色底（舊存檔、區域沒載入時照舊演）', ['ev_bar_group_start','ev_bar_group_out','ev_bar_group_three'].every(id=>ev(id).background==='dark'&&ev(id).trigger==='outing'&&ev(id).dialogue.some(l=>l.scene==='大口漢堡・二樓'&&l.bg==='dark')));
    const e3=S.bar3dEvent(ev('ev_bar_group_start')), e0=ev('ev_bar_group_start');
    check('6. 3D 版：同一個 id、同一份台詞（每一行是同一個物件），只有「大口漢堡・二樓」那兩步 bg:false、底 freeze；視訊那一步不動', e3.id===e0.id&&e3.background==='freeze'&&e3.dialogue.length===e0.dialogue.length
      &&e3.dialogue.every((l,i)=>l===e0.dialogue[i]||(e0.dialogue[i].scene==='大口漢堡・二樓'&&l.scene==='大口漢堡・二樓'&&l.bg===false))&&e3.dialogue.filter(l=>l.bg===false).length===2&&e3.dialogue.some(l=>l.scene==='視訊'&&l.bg==='video'));
    let doc=null; try{ doc=cp.execFileSync('git',['-C',H.ROOT,'show','44ed07c50:docs/story_planning/AA_836_大口漢堡二樓讀書小組_3D座位.md'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
    if(doc){ const row=doc.split('\n').find(l=>/^\| r2y4b_events\.js/.test(l))||'', c=row.split('|').map(x=>x.trim()); check('6. 那一句和 AA_836（企劃線 44ed07c50）的表一字不差（舊→新）', c[2]===OLD&&c[3]===NEW, row);
      const tail=doc.slice(doc.indexOf('熱可可那句分兩版'));
      check('6. 分兩版的兩句和 AA_836 文末（企劃線 44ed07c50）一字不差：「三個人都在：」NEW、「只有語彤和你（可昕不在場的讀書夜）：」NEW2', doc.includes('熱可可那句分兩版')&&tail.includes('- 三個人都在：'+NEW)&&tail.includes('- 只有語彤和你（可昕不在場的讀書夜）：'+NEW2), tail.slice(0,200)); }
    else console.log('SKIP 6. 讀不到企劃線 44ed07c50（沒有 fetch）：AA_836 的表不比，新句照測試裡抄的那一句');
    const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.find(f=>/AA_836_/.test(f.path));
    /* 2026-11-12（AA_836 文末「補（12:2x）」，企劃線 f6aa917593：三杯熱可可那一版在三個人都在的讀書夜也演一次）：白名單換 f6aa917593。舊期望：sha 44ed07c50、48d153407 在 history */
    check('6. 白名單登記 AA_836＠f6aa917593（approved；44ed07c50、48d153407 在 history）', !!allow&&allow.status==='approved'&&/^f6aa917593/.test(allow.sha)&&allow.task==='BAR-GROUP-3D-1112'&&(allow.history||[]).some(h=>/^48d153407/.test(h.sha))&&(allow.history||[]).some(h=>/^44ed07c50/.test(h.sha)), J(allow&&[allow.sha,allow.status,allow.history]));
    { let d2=null; try{ d2=cp.execFileSync('git',['-C',H.ROOT,'show','f6aa917593:docs/story_planning/AA_836_大口漢堡二樓讀書小組_3D座位.md'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
      if(d2) check('6. AA_836 文末補（12:2x）逐句在：「三個人都在的那一版，在三個人都在的讀書夜也要演（一次）；不是只有「只有語彤」的晚上才有熱可可。」；分兩版那兩句沒動', d2.includes('- 補（12:2x）：三個人都在的那一版，在三個人都在的讀書夜也要演（一次）；不是只有「只有語彤」的晚上才有熱可可。')&&d2.includes('- 三個人都在：'+NEW)&&d2.includes('- 只有語彤和你（可昕不在場的讀書夜）：'+NEW2), d2.slice(d2.indexOf('熱可可那句分兩版'),d2.indexOf('熱可可那句分兩版')+300));
      else console.log('SKIP 6. 讀不到企劃線 f6aa917593（沒有 fetch）：AA_836 文末補不比'); }
    /* 三個人都在的晚上走到「第一次」那一段＝三杯那一版；只有語彤＝兩杯那一版；週六總圖＝白天版（兩版都不演）*/
    { const s0=S.session, g0=S.groupLine; try{ three(); H.G.events.done.ev_bar_group_start=1; at('2029-02-26',21.5); S.groupLine=()=>'yt_first';
        S.session=()=>({mode:'noodle',t0:21,t1:23,who:'three'}); await run('ev_bar_group_out'); const a=texts().slice();
        S.session=()=>({mode:'noodle',t0:21,t1:23,who:'yutong'}); await run('ev_bar_group_out'); const b=texts().slice();
        S.session=()=>({mode:'library',t0:10,t1:18,who:'yutong'}); await run('ev_bar_group_out'); const c=texts().slice();
        check('6. 「第一次」那一段：who three＝三杯那一版（沒有兩杯）；who yutong＝兩杯那一版（沒有三杯）；總圖白天＝兩版都沒有', a[0]===NEW&&!a.includes(NEW2)&&b[0]===NEW2&&!b.includes(NEW)&&!c.includes(NEW)&&!c.includes(NEW2)&&c[0]==='（星期六下午，總圖的長桌。語彤把自己的書收進包包，桌上只剩你的。）', J([a,b,c]));
      } finally { S.session=s0; S.groupLine=g0; } } }

  /* ===== 7 視訊、總圖照舊 ===== */
  { fresh('2029-02-22',23,'dorm',{Y4_PATH:'bar',KX_VDAY:{4:'video'}}); H.date('kexin'); at('2029-02-23',8); phone(); at('2029-02-23',21.4); await goOut('y4_bar_group_start');
    check('7. 只有可昕的成立那一晚：視訊照舊（不換區域、深色底開始、兩句一樣）', H.entered.length===0&&H.G.zone==='dorm'&&H.bgs[0]==='dark'&&has('情人節那張表，我把八月以前都排完了。')&&has('你那一欄不喜歡的地方圈起來，我改。')&&!GM.npc.kexin, J([H.entered,H.bgs,texts()]));
    phone(); const v=OUT.rec(H.G).find(x=>/^y4_bar_vid_/.test(x.id)&&x.state==='planned'); at('2029-02-26',20.9); await goOut(v&&v.id);
    check('7. 之後的視訊（ev_bar_group_video）：2D 出遊照舊（不換區域、深色底、可昕那一句、BAR_GROUP_N＝1）', !!v&&!v.goto&&H.entered.length===0&&H.bgs[0]==='dark'&&has('刑總那題，你先講結論，再講理由。講完我再問。')&&H.G.flags.BAR_GROUP_N===1&&!v.bar3d, J([H.entered,H.bgs,texts()]));
    const n=ev('ev_bar_group_night'), vd=ev('ev_bar_group_video');
    check('7. ev_bar_group_night 還是總圖的 auto 事件（location、background blur）；ev_bar_group_video 還是 outing、dark、kxAway', n.trigger==='auto'&&J(n.location)===J(['library','library_hall'])&&n.background==='blur'&&vd.trigger==='outing'&&vd.background==='dark'&&vd.kxAway===true&&!S.BAR_EVS.includes(n.id)&&!S.BAR_EVS.includes(vd.id));
    ytOnly(); H.G.events.done.ev_bar_group_start=1; at('2029-03-03',11); H.G.zone='library_hall'; const due=EVENTS.check(n); await run('ev_bar_group_night');
    check('7. 只有語彤：週六在總圖照舊（白天版的第一句，不是改的那一句）', due&&has('（星期六下午，總圖的長桌。語彤把自己的書收進包包，桌上只剩你的。）')&&!has(NEW)&&H.bgs[0]==='blur', J(texts())); }

  /* ===== 8 舊存檔 ===== */
  { const old=()=>{ fresh('2029-02-23',21.2,'dorm',{Y4_PATH:'bar',BAR_GROUP_KIND:'three',BAR_STUDY_GROUP:['kexin','yutong'],BAR_GROUP_START:'three'}); H.date('kexin'); H.FRIEND('heroine_03');
      OUT.plan(H.G,{id:'y4_bar_group_start',ev:'ev_bar_group_start',day:D('2029-02-23'),h:21.5,late:0.5,place:'大口漢堡',title:'律師讀書小組（大口漢堡）',travel:'走過去約 15 分鐘',travelH:0.25}); return OUT.get(H.G,'y4_bar_group_start'); };
    let q=old(); const z0=global.Z3; global.Z3={ZONES:{}};
    try{ phone(); const noUp=!q.goto; await goOut('y4_bar_group_start');
      check('8. 舊存檔、區域沒載入：不補 goto；照舊 2D 演完（深色底、四句、done、不卡）', noUp&&H.entered.length===0&&H.bgs[0]==='dark'&&H.said.length===4&&q.state==='done'&&H.G.events.done.ev_bar_group_start===1&&!S.barPending(H.G), J([H.entered,H.bgs,q.state])); }
    finally { global.Z3=z0; }
    q=old(); const qa={id:'y4_bar_out_x',ev:'ev_bar_group_out',day:H.G.day,h:21,state:'planned',arrived:true,place:'大口漢堡',back:'回到首都帝大。'}, qv={id:'y4_bar_vid_x',ev:'ev_bar_group_video',day:H.G.day+1,h:21,state:'planned',place:'視訊'}, qd={id:'y4_bar_out_y',ev:'ev_bar_group_out',day:H.G.day-2,h:21,state:'done',place:'大口漢堡'}, qm={id:'y4_bar_out_z',ev:'ev_bar_group_out',day:H.G.day-4,h:21,state:'missed',place:'大口漢堡'};
    H.G.outings.push(qa,qv,qd,qm); phone();
    check('8. 舊存檔、區域有載入：還沒出發的那一場補上 goto；正在演的（arrived）、視訊的、演過的、錯過的不動', !!q.goto&&q.goto.zone===Z&&q.goto.lv===1&&!qa.goto&&qa.back==='回到首都帝大。'&&!qv.goto&&!qd.goto&&!qm.goto&&!S.barPending(H.G), J([q.goto,qa,qd]));
    await goOut('y4_bar_group_start');
    check('8. 補過的那一場：出發＝3D（到 xs_dakou、三個位子、四句、演完留在那裡）', J(H.entered)===J([Z])&&!!shot&&eq(who('kexin'),-1,-1.75,0)&&eq(who('heroine_03'),0,-1.75,0)&&H.said.length===4&&H.G.zone===Z&&q.bar3d===H.G.day, J([H.entered,shot]));
    q=old(); qd.state='done'; H.G.outings.push({id:'old_done',ev:'ev_bar_group_three',day:H.G.day,h:19,state:'done',place:'大口漢堡'});
    check('8. 舊存檔 2D 演過的（done、沒有 goto）：不算「到了還沒演」，進大口漢堡不會重演', !S.barPending(H.G)); }

  /* ===== 9 到了還沒演（讀檔）===== */
  { three(); at('2029-02-23',21.4); const q=OUT.get(H.G,'y4_bar_group_start'); q.state='done';   /* OUT.go 到了、存檔、還沒演就被踢回標題 */
    const P=S.barSeats(); reset(); await GM.enter(Z,{x:P.me.x,z:P.me.z,yaw:Math.PI,lv:1});   /* 讀檔：人在那個位子上 */
    check('9. 讀檔進區域：重新排好（可昕、語彤坐好、祐廷坐下）', S.barPending(H.G)===q&&!!GM.npc.kexin&&!!GM.npc.heroine_03&&!!E.player.seat&&E.player.seat.x===-1&&E.player.seat.z===-0.25, J([!!GM.npc.kexin,E.player.seat]));
    const r=S.tick(GM); await wait(); await wait();
    check('9. S.tick 接著演：四句、演完留在二樓、不再算還沒演', r===true&&H.said.length===4&&q.bar3d===H.G.day&&H.G.events.done.ev_bar_group_start===1&&H.G.zone===Z&&!E.player.seat&&!S.barPending(H.G)&&S.tick(GM)===false, J([r,texts(),q.bar3d]));
    three(); at('2029-02-23',21.4); const q2=OUT.get(H.G,'y4_bar_group_start'); q2.state='done'; reset(); await GM.enter(Z,{x:0,z:6.4,yaw:Math.PI,lv:0});
    const r0=S.tick(GM); await wait();
    check('9. 人從一樓店門進來：她們已經在二樓坐好、祐廷不會被搬上去；在一樓不演', r0===false&&H.said.length===0&&!!GM.npc.kexin&&!E.player.seat&&E.player.lv===0&&S.barPending(H.G)===q2, J([r0,H.said.length,E.player.lv]));
    E.player.lv=1; E.player.obj.position.x=1.2; E.player.obj.position.z=0.4; const r1=S.tick(GM); await wait(); await wait();
    check('9. 走上二樓、到那張長桌旁邊＝坐下開演', r1===true&&H.said.length===4&&!!shot&&eq(shot.me,-1,-0.25,Math.PI)&&q2.bar3d===H.G.day, J([r1,shot&&shot.me]));
    three(); at('2029-02-23',21.4); const q3=OUT.get(H.G,'y4_bar_group_start'); q3.state='done'; at('2029-02-24',10); reset(); await GM.enter(Z,{x:P.me.x,z:P.me.z,yaw:Math.PI,lv:1}); const r2=S.tick(GM); await wait();
    check('9. 隔天才進去：不演、不排人（和錯過一樣）', !S.barPending(H.G)&&r2===false&&H.said.length===0&&!GM.npc.kexin&&!E.player.seat, J([r2,H.said.length])); }

  /* ===== 10 黑畫面盤點（tools/story/black_bg_audit.js）：三場 42 句（11-12 多兩杯那一列；舊期望 41）不再列在深色底，改列第 5 節「改在 3D 演」 =====
     修改前：第 2 節有 ev_bar_group_start（4＋2 句）、ev_bar_group_three（3 句）、ev_bar_group_out（32 句）。outings3d.js 的 OUT.IN3D 和程式的區域、地點字幕要一樣 */
  { let out=''; try{ out=cp.execSync('node tools/story/black_bg_audit.js',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ out=String(e.stdout||''); }
    const sec2=(out.split('## 2.')[1]||'').split('## 3.')[0], sec1=(out.split('## 1.')[1]||'').split('## 2.')[0], sec5=out.split('## 5.')[1]||'';
    const n5=sec5.split('\n').filter(l=>/^\| ev_bar_group_(start|out|three) /.test(l)).reduce((a,l)=>a+(+l.split('|')[5]||0),0);
    check('10. black_bg_audit：第 1、2 節沒有 ev_bar_group_*；第 5 節列三場共 42 句（xs_dakou；舊期望 41，多 AA_836 文末兩杯那一列）', !!out&&!/ev_bar_group_/.test(sec1)&&!/ev_bar_group_/.test(sec2)&&n5===42&&/`xs_dakou`/.test(sec5), J([n5,/ev_bar_group_/.test(sec2)]));
    check('10. OUT.IN3D 登記的剛好是這三場＝{zone xs_dakou, scene 大口漢堡・二樓}（和 S.BAR_Z、S.BAR_EVS、3D 版拿掉深色底的那個地點字幕一樣）；視訊、總圖那兩場沒有', !!OUT.IN3D&&J(Object.keys(OUT.IN3D).sort())===J(S.BAR_EVS.slice().sort())
      &&S.BAR_EVS.every(id=>{ const r=OUT.IN3D[id], e3=S.bar3dEvent(ev(id)); return r.zone===S.BAR_Z&&r.scene==='大口漢堡・二樓'&&e3.dialogue.some(l=>l&&l.scene===r.scene&&l.bg===false)&&!e3.dialogue.some(l=>l&&l.scene===r.scene&&l.bg==='dark'); })); }

  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
