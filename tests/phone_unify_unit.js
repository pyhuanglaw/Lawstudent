// PHONE-UNIFY-1030（使用者 2026-10-30：①「有些朋友可以看他在哪直接過去 有些只能導航 請統一 都能選 直接過去」
//   ②「很多女生腳色都不能在訊息頁面傳訊息!!!!!!講很多次了 請統一」）——不需要瀏覽器。
//   A 手機「朋友」：每一個有區域、不在你這一區、不是不在臺北的人都有「直接過去（約 N 分鐘）」（快速前往清單沒有的區域、沒去過的都有；「帶我去」照留）；
//     不適合直接進去的（FGO_NO：機場）、人在國外、休學退宿以後的台大：沒有直接過去、寫原因；quickGo 的 force＝沒去過也可以；關門、你就在那裡照舊提示。
//   B 手機「訊息」：上面列出聯絡人（七位女生在最前面＋其他有聯絡方式的人），點了打開那個人的對話串（沒有也開空的），裡面有「傳訊息」；
//     見過、沒有聯絡方式的灰著寫怎麼拿到；子晴有聯絡方式就能傳（不等 Q6，Q6 以前不出講到她的遊戲的句子）；
//     照劇情保留的擋法在對話裡寫原因（可昕分開以後、芷若在英國只寄明信片、沛珊重考那一段只顯示已送達、學姊事務版）；每天一則照舊；舊存檔的對話串、未讀照舊。
//   C （調查）見過、有點熟、沒有聯絡方式的五位（以安、芷若、語彤、子晴、沛珊；學姊、可昕開場就有）：當面說話有「交換聯絡方式」，選了就能傳。
// 做法：載入遊戲的資料與系統（tests/pg_harness.js＋msg3d.js），game3d.js 的手機那幾段（knownIds、PLACE_LIST～quickGo、campusPlaceFor～friendGo、friendsHTML、訊息頁）從原始碼切出來跑。
// 修改前（fix1030 1ebb95122）：FAIL（A 沒有直接過去、B 沒有聯絡人、子晴擋在 Q6）；修改後 ALL PASS。用法：node tests/phone_unify_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H, J=JSON.stringify, ROOT=H.ROOT;
const load=(f,names)=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>names.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const LAYOUTS=/^(LINZE_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|GYM_LAYOUT|WANCAI_LAYOUT|DORM_LAYOUT|ROOM_GLB_LAYOUTS)$/;
for(const f of ['src/data/linze_layout.js','src/data/library_layout.js','src/data/lawlib_layout.js','src/data/soclib_layout.js','src/data/gym_layout.js','src/data/wancai_layout.js','src/data/dorm_layout.js','src/data/room_glb_layouts.js'])
  if(fs.existsSync(path.join(ROOT,f))) load(f,LAYOUTS);
const MSGN=/^(MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|HOMETOWN_LINES)$/;
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f,MSGN);
/* 區域（瀏覽器裡 Z3.ZONES 的 id 和名字；2026-10-30 從遊戲裡印出來）*/
const ZN={campus:'台大校園',gongguan:'公館',wenzhou:'溫州街',lane118:'118 巷',classroom:'霖澤館 201 階梯教室',library:'總圖書館 閱覽室',cafe:'兩點半 Café',cvs:'日日便利',noodle:'阿鳳麵店',bookstore:'舊路書房',dorm:'宿舍 房間',
  wz_brunch:'半熟',wz_print:'阿德影印輸出',wz_teahouse:'一盞',wz_lin:'林家乾麵',wz_teishoku:'巷子裡定食',linze:'霖澤館',wancai:'萬才館 大廳',library_hall:'總圖書館 大廳',library_b1:'總圖書館 B1',library_carrels:'總圖 2F 研究小間',library_stacks:'總圖 5F 書庫',
  dorm_hall:'男生宿舍',lawlib:'法律學院圖書館',soclib:'社科院圖書館',gym:'綜合體育館',gym_b1:'綜合體育館 B1',gym_arena:'綜合體育館 3F 主球場',gongtong:'共同教學館',boya:'博雅教學館',putong:'普通教學館',
  l118_dian:'滇香小館（118 巷）',l118_self:'好家自助餐（118 巷）',l118_omu:'蛋包飯研究所（118 巷）',linze_3f:'霖澤館 3F',linze_4f:'霖澤館 4F',linze_5f:'霖澤館 5F',airport_dep:'桃園機場 第二航廈 出境大廳',airport_arr:'桃園機場 第二航廈 入境大廳',
  us_campus:'校園（美國）',us_lawlib:'法學院圖書館（美國）',us_apartment:'美國的公寓',us_outside:'公寓社區（美國）',jp_hub:'國際學生宿舍'};
global.Z3={ZONES:{}}; for(const k in ZN) Z3.ZONES[k]={id:k,name:ZN[k]};
if(fs.existsSync(path.join(ROOT,'src/rooms_glb3d.js'))){ try{ vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/rooms_glb3d.js'),'utf8'),{filename:'src/rooms_glb3d.js'}); }catch(e){ console.log('（rooms_glb3d.js 載不進來：'+e.message+'）'); } }   /* 有開放時段的房間：Z3.roomGlbOpen＋房間區域 */
/* ---------- game3d.js 的手機那幾段 ---------- */
const SRC=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
const cut=(a,b)=>{ const i=SRC.indexOf(a); if(i<0) return ''; const j=SRC.indexOf(b,i+a.length); return j<0?'':SRC.slice(i,j); };
const BL=[cut('  function knownIds(){','  GM.knownIds=knownIds;'),cut('  function whereText(id){','  GM.whereText=whereText;'),cut('  function PLACE_LIST(){','  GM.quickGo=quickGo;'),
  cut('  function campusPlaceFor(','  /* 手機「朋友」裡點「資料」'),cut('  function friendsHTML(){','  /* 手機「訊息」（D54 ⑥）'),cut('  let phoneThread=null','  function todayActsHTML(){')];
check('0. game3d.js 切得出手機那幾段（knownIds、PLACE_LIST～quickGo、campusPlaceFor、friendsHTML、訊息頁）',BL.every(Boolean),J(BL.map(b=>b.length)));
const ARGS=['G','GM','E','STORY','SOCIAL','INV','MSG','PHONE','PLACES','Z3','CLS','CHARACTERS','EXCH','JP','HOME','ROOM_GLB_LAYOUTS','L118','ACTIVITIES','CALENDAR','FEED','CG_REGISTRY','ADV','phonePerson','personHTML','toast','closePhone','menuOpen','closeMenu','advance','enter'];
const BODY=BL.join('\n')+'\nreturn {knownIds,PLACE_LIST,placeState,quickGo,friendsHTML,msgHTML,threadHTML,friendGo:typeof friendGo==="function"?friendGo:null,setThread:t=>{ phoneThread=t; },setPick:p=>{ phoneMsgPick=p; }};';
let MK=null; try{ MK=new Function(...ARGS,BODY); }catch(e){ console.log('（切出來的程式跑不起來：'+e.message+'）'); }
/* 假的人在哪（STORY.whereIs）：W[id]＝{zone|away}；作息位置不給（校園＝第一個校園地點）*/
let W={}, toasts=[], entered=[], adv=0, L118OPEN=true;
const STORYX=Object.assign(Object.create(STORY),{whereIs:(GM,id)=>W[id]?Object.assign({act:'',until:'18:00'},W[id]):null,schedEnt:()=>null});
const E={player:{busy:false,riding:false,obj:{position:{x:0,y:0,z:0}}}};
const GMX={get G(){ return H.G; },titleIdle:false};
const ADVX={resolve:()=>null};
const mk=o=>{ o=o||{}; if(!MK) return null; try{ return MK(H.G,GMX,E,STORYX,SOCIAL,INV,MSG,PHONE,PLACES,Z3,CLS,CHARACTERS,o.EXCH,o.JP,o.HOME||HOME,typeof ROOM_GLB_LAYOUTS!=='undefined'?ROOM_GLB_LAYOUTS:undefined,{isOpen:()=>L118OPEN},undefined,CALENDAR,undefined,undefined,ADVX,null,()=>'',
  (t)=>toasts.push(String(t)),()=>{},false,()=>{},(h)=>{ adv+=h; },async(z,sp)=>{ entered.push([z,sp||null]); H.G.zone=z; }); }catch(e){ console.log('（mk：'+e.message+'）'); return null; } };
const fresh=(key,h,zone)=>{ const G=H.fresh(key||'2025-10-08',h==null?14:h,zone||'dorm',{}); G.visited={}; G.contacts=G.contacts||{}; W={}; toasts=[]; entered=[]; adv=0; L118OPEN=true; return G; };
const rowOf=(html,id)=>{ const k=html.indexOf('data-person="'+id+'"'); if(k<0) return ''; const a=html.lastIndexOf('<div class="item phrow">',k); const b=html.indexOf('<div class="item phrow">',k); return html.slice(a,b<0?html.length:b); };
const FR=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','zhe'];
(async()=>{
  /* ================= A 手機「朋友」：直接過去 ================= */
  { fresh('2025-10-08',14,'dorm'); for(const id of FR) H.FRIEND(id);
    W={heroine_01:{zone:'cafe'},heroine_02:{zone:'linze_3f'},heroine_03:{zone:'l118_dian'},heroine_04:{zone:'library_b1'},heroine_05:{zone:'airport_dep'},classmate_peishan:{zone:'campus'},zhe:{zone:'dorm'}};
    const P=mk(); const h=P?P.friendsHTML():'';
    const r=id=>rowOf(h,id);
    check('A1. 快速前往清單上有、但還沒去過的區域（兩點半 Café）：有「直接過去（約 N 分鐘）」（原本要去過才有）',/data-fgo="heroine_01">直接過去（約 \d+ 分鐘）/.test(r('heroine_01')),r('heroine_01').slice(0,400));
    check('A2. 清單上沒有的區域（霖澤館 3F、118 巷滇香小館、總圖 B1）：都有「直接過去」',['heroine_02','heroine_03','heroine_04'].every(id=>/data-fgo="[a-z_0-9]+">直接過去（約 \d+ 分鐘）/.test(r(id))),J(['heroine_02','heroine_03','heroine_04'].map(id=>r(id).replace(/<[^>]+>/g,' ').slice(0,90))));
    check('A2b. 人在 118 巷的店裡：「現在大概在」寫店名（滇香小館），不是區域代號 l118_dian',/滇香小館/.test(r('heroine_03'))&&!/>l118_dian/.test(r('heroine_03')),r('heroine_03').replace(/<[^>]+>/g,' ').slice(0,80));
    check('A3. 校園裡的人：有「直接過去」（到最近的校園地點）',/data-fgo="classmate_peishan">直接過去/.test(r('classmate_peishan')));
    check('A4. 「帶我去」照留（有區域的人兩個都有）',['heroine_01','heroine_02','heroine_04','classmate_peishan'].every(id=>/data-find=/.test(r(id))&&/data-fgo=/.test(r(id))));
    check('A5. 排除表（機場）：沒有直接過去、有「帶我去」、小字寫原因',!/data-fgo=/.test(r('heroine_05'))&&/data-find=/.test(r('heroine_05'))&&/不能直接過去：機場/.test(r('heroine_05')),r('heroine_05').replace(/<[^>]+>/g,' '));
    check('A6. 和你同一區（阿哲在宿舍房間、你也在）：沒有直接過去，寫「就在這裡」',!/data-fgo=/.test(r('zhe'))&&/就在這裡/.test(r('zhe')),r('zhe').replace(/<[^>]+>/g,' '));
    check('A7. 按鈕字是「直接過去」，不再是「過去（約」',!/>過去（約/.test(h)&&/直接過去（約/.test(h));
    W.heroine_01={away:'在台中'}; const h2=P?P.friendsHTML():''; check('A8. 不在臺北（away）：沒有直接過去、也沒有帶我去（照舊）',!/data-fgo=/.test(rowOf(h2,'heroine_01'))&&!/data-find=/.test(rowOf(h2,'heroine_01')));
    /* 每一個清單外的區域都有（排除表以外）*/
    const outs=Object.keys(ZN).filter(z=>!/^(us_|jp_|airport_)/.test(z)&&z!=='dorm'&&!(P?P.PLACE_LIST():[]).some(q=>q[0]===z)); const miss=[];
    for(const z of outs){ W={heroine_01:{zone:z}}; const fg=P&&P.friendGo?P.friendGo('heroine_01',W.heroine_01,P.PLACE_LIST()):null; if(!fg||!fg.pl||fg.pl[0]!==z) miss.push(z); }
    check('A9. 快速前往清單外的臺灣區域（'+outs.length+' 個：樓上樓層、房間、店面、教學館…）全部可以直接過去、落點是那一區本身',outs.length>10&&!miss.length,'沒有：'+miss.join(',')); }
  { fresh('2025-10-08',14,'dorm'); H.FRIEND('heroine_02'); W={heroine_02:{zone:'linze_3f'}};
    const P=mk(), fg=P&&P.friendGo?P.friendGo('heroine_02',W.heroine_02,P.PLACE_LIST()):null;
    if(P&&fg&&fg.pl){ await P.quickGo(fg.pl); check('A10. 沒去過、沒有 force：照舊「還沒去過」不移動',!entered.length&&/還沒去過/.test(toasts[0]||''),J(toasts)); toasts=[];
      await P.quickGo(fg.pl,{force:true}); check('A10. force（直接過去）：沒去過也進得去霖澤館 3F（預設出生點）、花路程時間',entered.length===1&&entered[0][0]==='linze_3f'&&entered[0][1]===null&&adv>0,J({entered,adv,toasts})); }
    else check('A10. quickGo force（沒有 friendGo）',false);
    check('A11. 手機畫面：data-fgo 按了照他現在在哪重算、quickGo 帶 force',/querySelectorAll\('\[data-fgo\]'\)[^\n]*friendGo\([^\n]*quickGo\(fg\.pl,\{force:true\}\)/.test(SRC)); }
  { fresh('2025-10-08',18,'dorm'); H.FRIEND('heroine_02'); W={heroine_02:{zone:'linze_office'}}; const P=mk(); const fg=P&&P.friendGo?P.friendGo('heroine_02',W.heroine_02,P.PLACE_LIST()):null;
    if(P&&fg&&fg.pl){ await P.quickGo(fg.pl,{force:true}); check('A12. 有開放時段的房間（系辦 18:00 關了）：照舊提示、不進去',!entered.length&&/法律學院辦公室 現在沒有開/.test(toasts.join('|')),J(toasts)); } else check('A12. 系辦（沒有 friendGo）',false); }
  { fresh('2025-10-08',23,'dorm'); H.FRIEND('heroine_04'); W={heroine_04:{zone:'library_b1'}}; const P=mk(); const fg=P&&P.friendGo?P.friendGo('heroine_04',W.heroine_04,P.PLACE_LIST()):null;
    if(P&&fg&&fg.pl){ await P.quickGo(fg.pl,{force:true}); check('A13. 那一棟關門（23:00 總圖關了，B1 也進不去）：照舊提示總圖的開館時間',!entered.length&&/總圖/.test(toasts.join('|'))&&/08:00/.test(toasts.join('|')),J(toasts)); } else check('A13. 總圖 B1（沒有 friendGo）',false); }
  { fresh('2025-10-08',14,'linze'); H.FRIEND('heroine_02'); W={heroine_02:{zone:'linze_3f'}}; const P=mk(); const fg=P&&P.friendGo?P.friendGo('heroine_02',W.heroine_02,P.PLACE_LIST()):null; const st=P&&fg&&fg.pl?P.placeState(fg.pl):null;
    check('A14. 路程：霖澤館大廳→3F 約 5 分鐘；宿舍→霖澤館 3F 和宿舍→霖澤館一樣',!!st&&st.mins===5&&CLS.travelMinutes(H.G,'dorm','linze_3f')===CLS.travelMinutes(H.G,'dorm','linze'),J({st,a:CLS.travelMinutes(H.G,'dorm','linze_3f'),b:CLS.travelMinutes(H.G,'dorm','linze')})); }
  { fresh('2025-10-08',10,'dorm'); const P=mk(); const st=P?P.placeState(['cafe','兩點半 Café',{x:0,z:5}]):null, st2=P?P.placeState(['dorm_hall','男生宿舍',null]):null;
    check('A15. 手機「地點」的清單照舊（Café 10:00 沒開、宿舍開；沒有多出來的關門原因）',!!st&&st.open===false&&!st.shut&&!!st2&&st2.open===true,J({st,st2})); }
  { fresh('2025-10-08',14,'dorm'); H.FRIEND('heroine_02'); W={heroine_02:{zone:'linze_3f'}}; const P=mk({HOME:Object.assign(Object.create(HOME),{baseMode:()=>true,movedOut:()=>false})}); const h=P?P.friendsHTML():'', r=rowOf(h,'heroine_02');
    check('A16. 休學退宿以後（HOME.baseMode）：台大裡的地方沒有直接過去、寫原因（照 PLACE_LIST 同一套）',!/data-fgo=/.test(r)&&/不能直接過去：休學退宿了/.test(r)&&/data-find=/.test(r),r.replace(/<[^>]+>/g,' ')); }
  { fresh('2025-10-08',14,'dorm'); H.FRIEND('heroine_02'); W={heroine_02:{zone:'cafe'}}; const P=mk({EXCH:{inUS:()=>true,places:()=>[['us_apartment','公寓',null]]}}); const h=P?P.friendsHTML():'', r=rowOf(h,'heroine_02');
    check('A17. 人在美國、她在臺灣：沒有直接過去、寫「你人在美國」',!/data-fgo=/.test(r)&&/你人在美國/.test(r),r.replace(/<[^>]+>/g,' ')); }

  /* ================= B 手機「訊息」：所有聯絡人都能開、傳 ================= */
  const SEVEN=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  const allContacts=()=>{ for(const id of SEVEN.filter(x=>x!=='kexin')){ H.FRIEND(id); H.G.contacts[id]=H.G.day-3; } H.G.flags.dating_kexin=true; };   /* [前置] 直接記聯絡方式（INV.addContact 會在對話串放一則「加了…」）*/
  { fresh('2025-11-12',15,'dorm'); allContacts(); const P=mk(); const R=MSG.contactRows?MSG.contactRows(H.G,P?P.knownIds():[]):[];
    check('B1. MSG.contactRows：七位女生都列出、在最前面、都能傳（沒有任何對話串也一樣）',R.length>=7&&R.slice(0,7).map(r=>r.id).join()===SEVEN.join()&&R.slice(0,7).every(r=>r.ok&&!r.gray),J(R.slice(0,8)));
    check('B1. 其他有聯絡方式的朋友也在（阿哲、阿凱）',R.some(r=>r.id==='zhe')&&R.some(r=>r.id==='kai'),J(R.map(r=>r.id)));
    const h=P?P.msgHTML():''; check('B2. 訊息頁上面「傳訊息給」：七位女生各一顆，點了開 p:<id> 的對話串',/傳訊息給/.test(h)&&SEVEN.every(id=>h.includes('data-th="p:'+id+'"')),h.slice(0,300));
    check('B2. 子晴沒有傳過訊息、沒有對話串：照樣在聯絡人上',!PHONE.thread(H.G,'p:heroine_04').length&&h.includes('data-th="p:heroine_04"'));
    if(P){ P.setThread('p:heroine_04'); const t=P.threadHTML('p:heroine_04');
      check('B3. 打開子晴空的對話串：有「傳訊息」、寫「還沒有訊息」',/data-msgto="heroine_04">傳訊息/.test(t)&&/還沒有訊息/.test(t),t.replace(/<[^>]+>/g,' ').slice(0,200)); } else check('B3. 子晴空的對話串',false); }
  { fresh('2025-11-12',15,'dorm'); H.FRIEND('heroine_04'); INV.addContact(H.G,'heroine_04');
    check('B4. 子晴：有聯絡方式、還沒演 Q6（ev_ziqing_secret_game）＝可以傳',MSG.open(H.G,'heroine_04').ok,J(MSG.open(H.G,'heroine_04')));
    const tp=MSG.topics(H.G,'heroine_04').map(q=>q.k); check('B4. 子晴的話題：在幹嘛、分享（她的回覆池 A 層有句子）',tp.includes('chat')&&tp.includes('share'),J(tp));
    const r=MSG.send(H.G,'heroine_04','chat'); const q=PHONE.rec(H.G).q.slice(-1)[0];
    check('B4. 傳「在幹嘛」：送出、排好她的回覆（有句子，不是貼圖）',r.ok&&!!q&&q.items.length>0&&q.items.some(i=>i.text!=='（貼圖）'),J({r:r.ok,q:q&&q.items.map(i=>i.text)}));
    check('B5. 每天一則照舊：同一天再傳＝不行、「今天傳過了」',!MSG.send(H.G,'heroine_04','chat').ok&&MSG.sentToday(H.G,'heroine_04'));
    const R=MSG.contactRows?MSG.contactRows(H.G,[]):[]; const zq=R.find(x=>x.id==='heroine_04'); check('B5. 聯絡人上寫「今天傳過了」（照樣點得開）',!!zq&&zq.sent&&zq.why==='今天傳過了'&&!zq.gray,J(zq));
    const P=mk(); const t=P?P.threadHTML('p:heroine_04'):''; check('B5. 對話裡：沒有「傳訊息」按鈕、寫「今天傳過了」',!/data-msgto=/.test(t)&&/今天傳過了/.test(t)); }
  { const P0=MSG_POOL.people.heroine_04.replies, e=P0.find(x=>/她的遊戲/.test((x.msgs||[]).join('')));
    fresh('2026-01-28',22,'dorm'); H.FRIEND('heroine_04'); INV.addContact(H.G,'heroine_04');
    check('B6. Q6 以前：講到她的遊戲的那一句（放假版「（截圖：她的遊戲新的一關）」）不出',!!e&&!!MSG.zqSpoil&&MSG.zqSpoil(H.G,'heroine_04',e),J(e&&e.msgs));
    let hit=false; for(let i=0;i<12;i++){ const x=MSG.pick(H.G,'heroine_04','chat',null,{immediate:false}); if(x===e) hit=true; } check('B6. Q6 以前輪 12 次都不會挑到那一句',!hit);
    H.G.events.done.ev_ziqing_secret_game=1; check('B6. 演過 Q6：那一句照常可以用',!!MSG.zqSpoil&&!MSG.zqSpoil(H.G,'heroine_04',e));
    const ny=((typeof MSG2_POOL!=='undefined'&&MSG2_POOL.people.heroine_04)||{replies:[]}).replies.find(x=>x.topic==='newyear'&&x.tier==='R');
    delete H.G.events.done.ev_ziqing_secret_game; check('B6. 第二批新年快樂 R（標「看過 Q6 才用；沒看過：只有第一則」）：Q6 以前只送第一則',!!ny&&!!MSG.msgsOf&&MSG.msgsOf(H.G,'heroine_04',ny).length===1&&ny.msgs.length>1,J(ny&&ny.msgs)); }
  { fresh('2025-11-12',15,'dorm'); SOCIAL.meet('heroine_03','noodle'); const P=mk(); const R=MSG.contactRows?MSG.contactRows(H.G,P?P.knownIds():[]):[]; const yt=R.find(x=>x.id==='heroine_03');
    check('B7. 見過、還沒有聯絡方式（語彤）：灰著、寫怎麼拿到（還沒有她的聯絡方式……當面問她）',!!yt&&yt.gray&&!yt.ok&&/還沒有她的聯絡方式/.test(yt.why)&&/當面問她/.test(yt.why),J(yt));
    check('B7. 沒見過的（芷若）：不列',!R.some(x=>x.id==='heroine_02'),J(R.map(x=>x.id)));
    const h=P?P.msgHTML():''; check('B7. 訊息頁：語彤那一顆是 disabled、有原因，不是 data-th',/disabled[^>]*data-noct="heroine_03"[^>]*>[^<]*<div[^>]*>還沒有她的聯絡方式/.test(h)&&!h.includes('data-th="p:heroine_03"'),h.slice(0,600)); }
  /* 照劇情保留的擋法：對話裡寫原因 */
  { fresh('2025-11-12',15,'dorm'); H.FRIEND('kexin'); H.G.flags.dating_kexin=false; const P=mk(); const t=P?P.threadHTML('p:kexin'):'';
    check('B8. 可昕分開以後：對話裡寫「不能傳訊息：分開以後不開」、沒有傳訊息',/不能傳訊息：分開以後不開/.test(t)&&!/data-msgto=/.test(t),t.replace(/<[^>]+>/g,' ').slice(0,200));
    const R=MSG.contactRows?MSG.contactRows(H.G,P?P.knownIds():[]):[]; const kx=R.find(x=>x.id==='kexin'); check('B8. 可昕在聯絡人上（點得開、寫原因）',!!kx&&!kx.gray&&!kx.ok&&kx.why==='分開以後不開',J(kx)); }
  { fresh('2027-10-20',15,'dorm'); H.rel('heroine_02',10,0,0); INV.addContact(H.G,'heroine_02'); const o=MSG.open(H.G,'heroine_02'); const P=mk(); const t=P?P.threadHTML('p:heroine_02'):'';
    check('B9. 芷若在英國、還不熟：對話裡寫「她在英國，只寄明信片」',!o.ok&&/只寄明信片/.test(o.why)&&/不能傳訊息：她在英國，只寄明信片/.test(t),J(o)); }
  { fresh('2027-01-20',15,'dorm'); H.FRIEND('classmate_peishan'); INV.addContact(H.G,'classmate_peishan'); const o=MSG.open(H.G,'classmate_peishan'); const P=mk(); const t=P?P.threadHTML('p:classmate_peishan'):'';
    check('B10. 沛珊重考那一段（silent）：照樣能傳（有傳訊息）、對話裡寫只顯示「已送達」',o.ok&&o.mode==='silent'&&/data-msgto="classmate_peishan"/.test(t)&&/已送達/.test(t),J({o,t:t.replace(/<[^>]+>/g,' ').slice(0,200)}));
    const r=MSG.send(H.G,'classmate_peishan','chat'); check('B10. 傳了：已送達、不回（照舊）',r.ok&&r.silent===true,J(r)); }
  { fresh('2025-10-08',15,'dorm'); H.FAMILIAR('heroine_05'); const o=MSG.open(H.G,'heroine_05'); const P=mk(); const t=P?P.threadHTML('p:heroine_05'):'';
    check('B11. 學姊還不是朋友（事務版）：能傳、對話裡寫只回事務上的訊息',o.ok&&o.mode==='business'&&/data-msgto="heroine_05"/.test(t)&&/事務/.test(t),J({o,t:t.replace(/<[^>]+>/g,' ').slice(0,200)})); }
  /* 舊存檔 */
  { fresh('2025-11-12',15,'dorm'); allContacts(); PHONE.postAt(H.G,{th:'p:heroine_01',from:'heroine_01',text:'筆記我放你桌上了。'},H.G.day-1,21); PHONE.postAt(H.G,{th:'p:heroine_01',from:'heroine_01',text:'明天見。'},H.G.day,9);
    const before=J(PHONE.threads(H.G,{sys:true}).map(t=>[t.th,t.unread,t.n])); const P=mk(); const h=P?P.msgHTML():''; const after=J(PHONE.threads(H.G,{sys:true}).map(t=>[t.th,t.unread,t.n]));
    check('B12. 舊存檔的對話串照舊列在下面、未讀數沒有被聯絡人清單動到',before===after&&h.includes('class="chatRow" data-th="p:heroine_01"')&&/chatBadge">2</.test(h),before+' → '+after);
    check('B12. 對話串的訊息沒有被改（兩則照舊）',PHONE.thread(H.G,'p:heroine_01').map(m=>m.text).join('/')==='筆記我放你桌上了。/明天見。'); }
  { fresh('2025-11-12',15,'dorm'); H.G.stage='econ'; H.FRIEND('zhe'); const R=MSG.contactRows?MSG.contactRows(H.G,['zhe','kai']):null;
    check('B13. 經濟系那一年：只列傳得到的（阿哲、阿凱不列）',Array.isArray(R)&&!R.some(x=>x.id==='zhe'||x.id==='kai'),J(R)); }
  /* ================= C 聯絡方式拿不到的路徑（調查）：見過、有點熟以後當面說話的選單有「交換聯絡方式」（AA_124 1-7 保底；INVITE_DATA.exchange 五位都有台詞）================= */
  for(const id of ['heroine_01','heroine_02','heroine_03','heroine_04','classmate_peishan']){ fresh('2025-11-12',15,'campus'); H.FAMILIAR(id); H.picks=['交換聯絡方式'];
    const had=INV.hasContact(H.G,id); let err=''; try{ await STORY.offerInvite(H.GM,id,{obj:{position:{x:0,y:0,z:0}}},{name:id}); }catch(e){ err=e.message; }
    const o=(H.opts[0]||[]); check('C1. '+id+' 有點熟、沒有聯絡方式：當面說話有「交換聯絡方式」，選了＝有聯絡方式、訊息頁可以傳',!had&&o.includes('交換聯絡方式')&&INV.hasContact(H.G,id)&&MSG.open(H.G,id).ok,J({o,err,open:MSG.open(H.G,id)})); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
