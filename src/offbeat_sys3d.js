/* ===== 日常失速的遊戲系統與台詞（區域 wz_offbeat，溫州街靠新生南路那一頭的轉角一樓；場景 zones3d.js 的 wzShop('offbeat')、配置 src/data/daily_offbeat_layout.js 是 LAWWW2 的）=====
   企劃：AA_617 第 3、4 節的日常失速（使用者 11-03 同意：「日常失速是吃飯打屁桌遊」）、AA_618 第 2 節（台詞，AA 定稿 D109，企劃線 ca876b23d）。台詞一字照抄（S.L）；稿裡沒有的句子不寫。做法照木曜日（src/mokuyobi_sys3d.js）。
   - 營業 13:00～01:00 每天開（PLACES.hours.wz_offbeat，跨午夜照兩點半 Café 的 open／close 寫法）、颱風天關（typhoonShops）；關門時按「進去日常失速」寫開放時間；打烊（01:00）人還在店裡＝請你出來（稿上沒有句子：只寫開放時間）。
   - 不給「讀書」（座位本來就沒有 study）。
   - 2-1 第一次進去（一個人）：進門那一刻兩句旁白＋店員一句；只一次（G.offbeat.first）。
   - 2-2 點東西：吧檯「點東西吃」＋每一趟第一次坐下（和木曜日同一個做法）；價錢照稿扣錢，點完那一樣的旁白（稿上三句各對一樣：肉桂捲、明太子厚片、檸檬氣泡美式；冰拿鐵那句在 AA_648 第 3 節，已接）；吃過的登記到 EAT（「溫州街・日常失速」）。
   - 2-3 店長（貓）：「看看店長／摸摸店長」→「看看」：每天第一次一句、之後另一句；「摸摸」：三句隨機、同一句不連續出。
   - 2-4 群聚事件：第 1 點期中考完那天（ev_midterm_supper，story3d.js phoneRules）、第 3 點明軒的桌遊夜（src/bgnight3d.js）：AA_648 第 2 節搬進 3D——出遊抵達時換到這裡（OUT.STAGE，S.stage），
     玩家和來的朋友坐長桌、對話照舊 ADV（模糊的 3D 底，不用 2D 的桌遊店圖）；演完回到原本的地方。
     第 2 點期末考完的聚餐：AA_648 第 1 節取代各學期「最後一科考完、燒臘店」那一場（events.js ev_term_last_meal*，地點 S.finalZone；揪人句 story3d.js 照 S.L.finalAsk；旁白照學期輪 S.finalNarrOf）。
   - 2-5 偶遇（一個人去的時候）：沛珊（週三 21:30 以後、大一大二、外帶）、Alison（週日 14:00～17:00、坐靠窗寫作業）、阿哲（大一上系籃練完的週五 19:15、和明軒來吃厚片）的作息在日常失速，
     人在店裡、她（他）的作息是這一筆＝說稿上那一句（一天一次；G.offbeat.enc）。
   - 2-6 八卦：長桌（table 1）坐下，隔壁桌的一句；一學期最多兩句、一天一句，四句接著輪（G.offbeat.gos）。
   - 約人：src/data/invites.js 的地點 offbeat（吃飯；見面照邀約一般的旁白——AA_618 沒有寫）。說話照一般音量（不加小聲）。
   - 店員站在吧檯裡面（STORY.populate；路人底模，不說話）。
   存檔：G.offbeat＝{n:來過幾次, first, catDay, pet:上一次摸摸那句, gos:{t:學期, n:這學期幾句, k:下一句, day}, enc:{人物:那天}, look:{種類:上一句}, game:第幾款, gameEnd, chatDay, chatK}；舊存檔沒有＝game3d.js defaults 補 {n:0}，壞掉的欄位 S.rec 重設。
   看公告板、看社團佈告欄、看桌遊櫃、玩桌遊、冰拿鐵、01:00 打烊（那一句改照 AA_700：XSCLOSE）、找店員聊天、約去答應、阿哲「練完好餓」的選項：AA_648 第 3 節（企劃線 1ebf7a590）。
   測試：node tests/offbeat_aa618_unit.js */
'use strict';
const OFFB=(function(){
  const S={}, ZONE='wz_offbeat';
  S.ZONE=ZONE;
  const LAY=()=>typeof DAILY_OFFBEAT_LAYOUT!=='undefined'?DAILY_OFFBEAT_LAYOUT:null;
  const CLERK={name:'店員'};
  /* ---------- 台詞（AA_618 第 2 節，一字照抄）---------- */
  /* TEXT-QUOTE-UNIFY-1108 第四批（AA-B 2026-11-08 05:31）：對話框有名字說的（偶遇 enc、阿哲選項以後的 say、找店員聊天 chat）不加外面的「」；選項（zheOpts 的 t）、旁白裡的「」照留 */
  S.L={
    first:[[null,'（玻璃門一推開，裡面很吵。中間的長桌坐滿了人，在玩一個要拍桌子的遊戲。）'],[null,'（一隻虎斑貓趴在空椅子上睡覺。椅子上貼著一張紙：「店長，請勿打擾」。）'],['店員','一位嗎？靠窗那邊！貓不用理他，他很習慣。']],   /* 2-1 */
    menu:[['冰拿鐵',120,'（冰拿鐵上面的奶泡慢慢沉下去。）'],['檸檬氣泡美式',130,'（檸檬氣泡美式。第一口很奇怪，第二口就習慣了。）'],['肉桂捲',110,'（肉桂捲是熱的，糖霜一直滴下來。）'],['明太子厚片',140,'（明太子厚片烤得很脆。你吃到最後一口才發現嘴角都是。）']],   /* 2-2：品項、價錢、點完的那一句 */
    catLook:'看看', catPet:'摸摸', catFirst:'（店長睜開一隻眼睛看你，又閉上。）', catAgain:'（店長在睡覺。）',   /* 2-3 */
    pet:['（店長讓你摸了兩下，起身換了一張椅子。）','（店長把頭靠過來。店員說：『他今天心情很好。』）','（店長看了你一眼，沒動。你決定不摸了。）'],
    gossip:['（隔壁桌：『聽說那個教授期末考只考一題。』『哪一個？』『不知道，聽說的。』）','（隔壁桌：『系籃今年要拿冠軍。』『去年也這樣說。』）','（隔壁桌：『你有看到社博那個魔術社嗎？』『有，他猜錯我的牌。』）','（隔壁桌：『兩點半的老闆說他要換菜單。』『不要換鬆餅就好。』）'],   /* 2-6 */
    enc:{classmate_peishan:[['classmate_peishan','你也在這！……我買個肉桂捲就走，明天早八。']],   /* 2-5 */
      yu:[['yu','欸！坐這邊。……我在寫報告，你不要讓我分心。'],[null,'（三分鐘後）'],['yu','……你覺得這段要怎麼寫？']],
      zhe:[['zhe','練完好餓。你要不要一起？']]},
    /* ===== AA_648 第 3 節（企劃線 1ebf7a590，AA 定稿）===== */
    zheOpts:[{t:'「好，一起。」',say:[[null,'（你們點了兩份厚片。阿哲吃完他那份，一直看著你那份。）'],['classmate_mingxuan','他每次都這樣。']],h:40/60},{t:'「今天不行。」',say:[['zhe','好，下次。']],h:0}],   /* 阿哲「練完好餓」的兩個選項（好＝時間過 40 分鐘）*/
    look:{board:['（公告板上貼著「徵室友」「二手書出清」，還有一張手寫的「誰掉了一把藍色雨傘」。）','（有人在便利貼上寫：「期中加油。」下面又有人補了一句：「你也是。」）','（一張傳單被撕掉了一半，只剩電話號碼的最後四碼。）'],
      clubs:['（整面都是社團的傳單，新的蓋在舊的上面。最上面一張是「系學會 迎新宿營」。）','（熱舞社的傳單上寫：「零基礎也可以！」旁邊有人用筆畫了一個笑臉。）','（籃球社新生盃的報名表貼在最下面，已經寫滿了一半。）'],
      shelf:['（櫃子裡的桌遊一盒疊一盒。「拍桌大作戰」的盒子邊角都磨白了。）','（有一盒「島嶼建築師」貼著紙條：「缺一顆藍色骰子，已經跟店長報備。」）','（最上面那層是店長的位子。牠不在。）']},
    game:{start:'（你們把「{遊戲}」攤開在長桌上。）',names:['拍桌大作戰','貓咪快遞','巷口夜市','島嶼建築師'],
      end:['（你們玩了兩局。第二局你贏了，大家說是新手運。）','（玩到一半店長跳上桌，坐在牌堆上。大家只好等牠走。）','（一局玩了一個小時。收盒子的時候，有人說下次要玩快一點的。）'],
      none:'（長桌上沒有人。桌遊要幾個人一起才好玩。）',h:1},
    /* 打烊的字（AA_648 第 3 節的 close）作廢，照 AA_700 一句：XSCLOSE.say（下面 S.closeOut）*/
    chat:['今天店長睡了一整天。客人摸牠都不醒。','考試週的時候，長桌都被讀書的人坐走了。我們也不好意思趕。','厚片今天賣完了。……明天早一點來。','那面佈告欄每個學期都要清一次，不然會掉下來。'],
    chatLabel:'找店員聊天',   /* 按鈕的字（稿：「聊天（找店員；隨機一句，一天一次）」）*/
    /* 期末考完的聚餐（AA_648 第 1 節：取代燒臘店那一場；開頭照 AA_618 2-4 第 2 點的揪人句、旁白一句照學期輪）*/
    finalAsk:{Y1:['zhe','最後一科！老地方！'],Y2:['yu','大家考完了沒！日常失速！'],Y3:['classmate_xinci','七點日常失速，我訂了長桌。'],Y4:['zhe','最後一科！老地方！']},
    finalNarr:['（大家一直在講寒假要去哪裡。最後一個都沒決定。）','（有人帶了桌遊。玩到一點，店員說要關了。）','（你們拍了一張合照。店長沒有入鏡。）'] };
  S.HOURS={open:13,close:25,text:'每天 13:00–01:00'};   /* places.js 的 PLACES.hours.wz_offbeat 同一份 */

  /* ---------- 共用 ---------- */
  const T_=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
  S.termKey=G=>{ const t=T_(G); if(t) return t.id; const d=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day):{y:0,m:1}; return 'B'+d.y+(d.m>=6&&d.m<=8?'S':'W'); };
  const nameOf=id=>(typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  const whoOf=(GM,id)=>{ const n=GM&&GM.npc&&GM.npc[id]; return {name:nameOf(id),charId:id,obj:n&&n.obj}; };
  const sayAll=async(GM,L)=>{ for(const [w,t] of L) await GM.say(w==null?null:(w==='店員'?CLERK:whoOf(GM,w)),t); };
  S.isOpen=G=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(ZONE,G.hour,G.day);
  /* 關門的說明（店家說「開門」：places.js 的 closedText 沒有 rules 的地點寫「開館」，只有 cafe 寫「開門」）；颱風照 PLACES.closedText */
  S.closedText=function(G){ if(typeof PLACES!=='undefined'&&PLACES.typhoonClosed&&PLACES.typhoonClosed(ZONE,G.day)) return PLACES.closedText(ZONE,G.hour,G.day);
    const h=((G.hour%24)+24)%24, o=(typeof PLACES!=='undefined'&&PLACES.hours[ZONE])||S.HOURS, later=h<o.open&&h>=o.close-24; return '日常失速 開放時間 '+o.text+'。現在沒有開，'+(later?'今天 ':'明天 ')+String(o.open).padStart(2,'0')+':00 開門。'; };
  S.rec=function(G){ let r=G.offbeat; if(!r||typeof r!=='object'||Array.isArray(r)) r=G.offbeat={n:0};
    if(typeof r.n!=='number'||!(r.n>=0)) r.n=0; if(!r.enc||typeof r.enc!=='object'||Array.isArray(r.enc)) r.enc={}; if(!r.gos||typeof r.gos!=='object'||Array.isArray(r.gos)) r.gos={t:null,n:0,k:0,day:null}; if(r.look!=null&&(typeof r.look!=='object'||Array.isArray(r.look))) r.look={}; return r; };
  const sceneFree=GM=>{ if(typeof INV!=='undefined'&&INV.sceneFree) return INV.sceneFree(GM); const E=GM&&GM.E, D=GM&&GM.D; return !(E&&E.player&&E.player.busy)&&!(D&&(D.active||(D.busyDepth|0)>0)); };
  S.alone=function(G){ const h=G.hour%24; if(G.flags&&G.flags.companion) return false; if(S.finalToday&&S.finalToday(G)) return false;   /* 今天在這裡吃過期末的那一頓（和大家一起）*/ return !(G.invites||[]).some(iv=>iv&&iv.zone===ZONE&&iv.day===G.day&&(iv.state==='going'||iv.state==='done'||(iv.state==='accepted'&&h>=iv.h-0.5&&h<iv.h+1.25))); };
  S.rand=()=>Math.random();
  const pickNoRepeat=(n,prev)=>{ const pool=[]; for(let i=0;i<n;i++) if(n<2||i!==prev) pool.push(i); return pool[Math.min(pool.length-1,Math.floor(S.rand()*pool.length))]; };

  /* ---------- 2-2 點東西 ---------- */
  let orderedVisit=null;
  S.eatReg=function(){ if(typeof EAT==='undefined'||!EAT.addShop) return null; if(!(EAT.SHOPS_X&&EAT.SHOPS_X['日常失速'])) EAT.addShop('日常失速',{shop:'溫州街・日常失速',staff:{who:'店員',line5:null,same:null,alt:null},first:null,door:false}); return EAT; };
  S.order=async function(GM){ const G=GM.G; orderedVisit=GM.enterN|0; const M=S.L.menu;
    const opts=M.map(m=>({t:m[0]+'　'+m[1]+' 元',dim:(G.money|0)<m[1]})).concat([{t:'不用了'}]); const gO=typeof GIFT!=='undefined'&&GIFT.shopOpt?GIFT.shopOpt(G,'日常失速'):null; if(gO) opts.push(gO);   /* 買一份帶走送人（GIFT-ALL-DRINK-SHOPS-1112，src/gift3d.js GIFT.SHOPS）：放在最後，原本的選項位置不動 */ const i=await GM.choose(opts);
    if(gO&&i===M.length+1){ await GIFT.buy(GM,'日常失速'); return null; }
    if(i==null||i<0||i>=M.length) return null;
    const [nm,p,line]=M[i]; if((G.money|0)<p){ GM.toast('錢不夠'); return null; }
    GM.money(-p); if(line) await GM.say(null,line); const E_=S.eatReg(); if(E_&&E_.ordered){ try{ await E_.ordered(GM,'日常失速',nm); }catch(e){ console.warn('EAT.ordered',e); } }
    if(GM.autosave) GM.autosave(); return nm; };

  /* ---------- 2-3 店長 ---------- */
  S.cat=async function(GM){ const G=GM.G, r=S.rec(G); const k=await GM.choose([{t:S.L.catLook},{t:S.L.catPet}]);
    if(k===0){ const f=r.catDay!==G.day; r.catDay=G.day; await GM.say(null,f?S.L.catFirst:S.L.catAgain); return f?'first':'again'; }
    const i=pickNoRepeat(S.L.pet.length,r.pet); r.pet=i; await GM.say(null,S.L.pet[i]); return 'pet'; };

  /* ---------- 2-6 八卦（長桌坐下）---------- */
  S.LONG_TABLE=1;
  S.gossip=function(G,seat){ const L=LAY(); if(!L||!seat) return null; const s=L.seats.find(q=>Math.hypot(q.x-seat.x,q.z-seat.z)<0.3); if(!s||s.table!==S.LONG_TABLE) return null;
    const r=S.rec(G), g=r.gos, k=S.termKey(G); if(g.t!==k){ g.t=k; g.n=0; } if(g.n>=2||g.day===G.day) return null; const i=(g.k|0)%S.L.gossip.length; g.k=(g.k|0)+1; g.n++; g.day=G.day; return S.L.gossip[i]; };

  /* ---------- 坐下（STORY.onSeat）：這一趟第一次坐下＝點東西；長桌＝八卦 ---------- */
  S.onSeat=async function(GM,seat){ const G=GM.G; if(!G||G.zone!==ZONE) return false; const gl=S.gossip(G,seat); if(gl) await GM.say(null,gl);
    if(orderedVisit!==(GM.enterN|0)) await S.order(GM); return true; };

  /* ---------- 2-5 偶遇的作息 ---------- */
  const W16=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], LAW_TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const ent=o=>Object.assign({zone:ZONE,weeks:W16,noHoliday:true,offbeat:true,if:{custom:G=>!(typeof PLACES!=='undefined'&&PLACES.typhoonClosed&&PLACES.typhoonClosed(ZONE,G&&G.day))}},o);
  S.REGULARS=[
    {id:'classmate_peishan',ent:ent({days:[3],from:21.5,to:22,act:'linger',at:[-1.6,-2.2,Math.PI],terms:['Y1S1','Y1S2','Y2S1','Y2S2'],label:'在日常失速買外帶',note:'AA_618 2-5：週三 21:30 以後（大一、大二；AA_614 課輔班下課），外帶'})},
    {id:'yu',ent:ent({days:[0],from:14,to:17,act:'read',terms:LAW_TERMS,label:'在日常失速寫作業',note:'AA_618 2-5：週日 14:00～17:00（不在戲院上班的日子：戲院的班有寫學期，排在前面先算），坐靠窗寫作業'})},
    {id:'zhe',ent:ent({days:[5],from:19.25,to:20,act:'eat',terms:['Y1S1'],activity:'dept_basketball',label:'在日常失速吃厚片',note:'AA_618 2-5：系籃練完（大一上練球的週）19:15，和明軒來吃厚片'})},
    {id:'classmate_mingxuan',ent:ent({days:[5],from:19.25,to:20,act:'eat',terms:['Y1S1'],activity:'dept_basketball',label:'在日常失速吃厚片',note:'AA_618 2-5：和阿哲一起（明軒沒有句子）'}),quiet:true}];
  S.apply=function(){ let n=0; for(const R of S.REGULARS){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[R.id]; if(!c) continue; const L=c.daily_schedule||(c.daily_schedule=[]); if(L.some(e=>e&&e.offbeat)) continue; L.push(Object.assign({},R.ent)); n++; } return n; };   /* 接在最後面、寫學期 */
  S.apply();
  S.slotNow=function(G,id){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c||typeof STORY==='undefined'||!STORY.schedEnt) return null; const e=STORY.schedEnt(c,G); return e&&e.offbeat?e:null; };
  const knows=(G,id)=>typeof STORY!=='undefined'&&STORY.knows?!!STORY.knows(id,G):(typeof SOCIAL!=='undefined'&&SOCIAL.stage?SOCIAL.stage(id)!=='STRANGER':true);
  S.encDue=function(G){ if(!G||G.zone!==ZONE||!S.alone(G)) return null; const r=S.rec(G); for(const id of Object.keys(S.L.enc)){ if(r.enc[id]===G.day) continue; if(S.slotNow(G,id)&&knows(G,id)) return id; } return null; };
  S.enc=async function(GM,id){ const G=GM.G, r=S.rec(G); r.enc[id]=G.day; let res=id; GM.sceneBegin(); try{ await sayAll(GM,S.L.enc[id]);
      if(id==='zhe'){ const O=S.L.zheOpts, k=await GM.choose(O.map(o=>({t:o.t}))), o=O[k]||O[1]; await sayAll(GM,o.say); if(o.h&&GM.advance) GM.advance(o.h); res=k===0?'zhe_yes':'zhe_no'; } }   /* AA_648 第 3 節：兩個選項＋後續 */
    finally { GM.sceneEnd(); } return res; };

  /* ---------- AA_648 第 3 節：看公告板、看社團佈告欄、看桌遊櫃（隨機一句、同一句不連續出）----------
     配置的 interact：flyers 有兩個（西牆卡座上面的公告板、東牆的社團佈告欄：照 label 分）、boardgame_shelf＝桌遊櫃 */
  S.lookKind=q=>q.kind==='boardgame_shelf'?'shelf':(q.kind==='flyers'?(/佈告欄/.test(q.label||'')?'clubs':'board'):null);
  S.look=function(G,k){ const L0=S.L.look[k]; if(!L0) return null; const r=S.rec(G), lk=r.look||(r.look={}), i=pickNoRepeat(L0.length,lk[k]); lk[k]=i; return L0[i]; };
  /* 玩桌遊（長桌）：店裡有認識的朋友（作息、約好、跟著你的人，不是路人、店員）才開始；四款輪流、結束隨機一句、時間過 1 小時 */
  S.friendsHere=function(GM){ const G=GM.G, E=GM.E; return ((E&&E.npcs)||[]).filter(n=>n&&n.charId&&!n.isExtra&&!n.clerk&&(typeof CHARACTERS!=='undefined'&&CHARACTERS[n.charId])&&knows(G,n.charId)).map(n=>n.charId); };
  S.play=async function(GM){ const G=GM.G, r=S.rec(G), Gm=S.L.game; if(!S.friendsHere(GM).length){ await GM.say(null,Gm.none); return 'none'; }
    const i=(r.game|0)%Gm.names.length; r.game=(r.game|0)+1; await GM.say(null,Gm.start.replace('{遊戲}',Gm.names[i]));
    if(GM.fade) await GM.fade(true); if(GM.advance) GM.advance(Gm.h); if(GM.fade) await GM.fade(false);
    const j=pickNoRepeat(Gm.end.length,r.gameEnd); r.gameEnd=j; await GM.say(null,Gm.end[j]); if(GM.autosave) GM.autosave(); return Gm.names[i]; };
  /* 找店員聊天：隨機一句（不連續同一句）、一天一次（說過了按鈕就不出現）*/
  S.chatOpen=G=>!!G&&S.isOpen(G)&&S.rec(G).chatDay!==G.day;
  S.chat=async function(GM){ const G=GM.G, r=S.rec(G); if(r.chatDay===G.day) return null; r.chatDay=G.day; const i=pickNoRepeat(S.L.chat.length,r.chatK); r.chatK=i; await GM.say(CLERK,S.L.chat[i]); return i; };
  /* ---------- 進門：2-1 第一次 ---------- */
  let doorVisit=null, busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['offbeat:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  S.doorDue=GM=>{ const G=GM.G; return !!G&&G.zone===ZONE&&doorVisit!==(GM.enterN|0)&&S.isOpen(G); };
  S.door=async function(GM){ const G=GM.G, r=S.rec(G); doorVisit=GM.enterN|0; r.n=(r.n|0)+1; if(!S.alone(G)) return 'together';
    if(!r.first){ r.first=G.day; GM.sceneBegin(); try{ await sayAll(GM,S.L.first); } finally { GM.sceneEnd(); } return 'first'; } return null; };
  /* ---------- 打烊（01:00）、還沒開：請你出來（稿上沒有句子）---------- */
  /* 01:00 打烊那一刻（01:00～01:30，那天不是颱風）或這一趟進來時開著＝店員「我們今天要打烊了。」（AA_700，取代 AA_648 第 3 節）；讀檔回到早上、颱風＝只寫開放時間 */
  S.closingNow=G=>{ const h=((G.hour%24)+24)%24; return h>=1-1e-6&&h<1.5&&!(typeof PLACES!=='undefined'&&PLACES.typhoonClosed&&PLACES.typhoonClosed(ZONE,G.day)); };
  /* AA_700：這一趟進來時開著、或打烊那一刻＝店員「我們今天要打烊了。」（不另外出旁白；src/xs_close3d.js 的 XSCLOSE）*/
  S.closeOut=async function(GM){ const G=GM.G, P=GM.E&&GM.E.player, L=LAY(); if(P&&P.seat&&GM.standUp) GM.standUp(P); const t=S.closedText(G), c0=S.closingNow(G), cl=typeof XSCLOSE!=='undefined'&&XSCLOSE.gen?XSCLOSE.gen(GM,ZONE,c0):c0;
    if(cl){ GM.sceneBegin(); try{ if(typeof XSCLOSE!=='undefined'&&XSCLOSE.say) await XSCLOSE.say(GM,'店員'); else await GM.say(CLERK,'我們今天要打烊了。'); } finally { GM.sceneEnd(); } }
    await GM.enter('wenzhou',Object.assign({},(L&&L.exit&&L.exit.spawn)||{x:-34.8,z:-9.6,yaw:Math.PI/2})); if(!cl) GM.toast(t,5000); return cl?'close':'out'; };
  /* ---------- 每 0.5 秒（STORY.TICKS）：打烊 → 進門 → 偶遇 ---------- */
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||G.zone!==ZONE||busy||GM.titleIdle||!sceneFree(GM)) return false;
    let p=null; if(!S.isOpen(G)) p=S.closeOut(GM); else if(S.doorDue(GM)) p=S.door(GM); else { const id=S.encDue(G); if(id) p=S.enc(GM,id); } if(!p) return false;
    busy=true; p.catch(e=>console.warn('OFFB.tick',e)).finally(()=>{ busy=false; }); return true; };

  /* ---------- 接到遊戲 ---------- */
  /* 吧檯「點東西吃」、「看看店長／摸摸店長」（配置的 interact order、cat；其他沒有台詞，不放）。wzShop('offbeat') 的 CUST 沒有 offbeat＝區域本身不放這些按鈕 */
  const ZB=typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[ZONE];
  if(ZB&&!ZB._offb){ ZB._offb=true; const b0=ZB.build; ZB.build=function(E){ const z=b0.apply(this,arguments); const L=LAY();
      for(const q of ((L&&L.interact)||[])){ if(q.kind==='order') E.interactables.push({x:q.x,z:q.z,radius:1.0,label:q.label,offOrder:true}); else if(q.kind==='cat') E.interactables.push({x:q.x,z:q.z,radius:1.0,label:q.label,offCat:true});
        else if(q.kind==='boardgame') E.interactables.push({x:q.x,z:q.z,radius:1.0,label:q.label,offPlay:true});
        else if(S.lookKind(q)) E.interactables.push({x:q.x,z:q.z,radius:1.0,label:q.label,offLook:S.lookKind(q)});
        if(q.kind==='order') E.interactables.push({x:S.CHAT_AT.x,z:S.CHAT_AT.z,radius:1.0,label:S.L.chatLabel,offChat:true,get hidden(){ const G=typeof GAME!=='undefined'&&GAME.G; return !!G&&!S.chatOpen(G); }}); }   /* 找店員聊天：吧檯前、點東西的西邊 */
      return z; }; }
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.tick)) STORY.TICKS.push(S.tick);
    if(!STORY._offb){ STORY._offb=true;
      const os=STORY.onSeat; STORY.onSeat=async function(GM,seat){ const r=os?await os.apply(this,arguments):false; try{ if(GM&&GM.G&&GM.G.zone===ZONE) await S.onSeat(GM,seat); }catch(e){ console.warn('OFFB.onSeat',e); } return r; };
      if(STORY.interact){ const oi=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G;
        if(it&&it.offOrder&&G){ GM.sceneBegin(); try{ await S.order(GM); } finally { GM.sceneEnd(); } return true; }
        if(it&&it.offCat&&G){ GM.sceneBegin(); try{ await S.cat(GM); } finally { GM.sceneEnd(); } return true; }
        if(it&&it.offLook==='clubs'&&G&&typeof CLUBBOARD!=='undefined'&&typeof CLUB_BOARD!=='undefined') return CLUBBOARD.look(GM);   /* 東牆社團佈告欄＝AA_701 活動時間、怎麼加入（CLUB-BOARD-INFO-1105；原本 AA_648 隨機一句）*/
        if(it&&it.offLook&&G){ GM.sceneBegin(); try{ await GM.say(null,S.look(G,it.offLook)); } finally { GM.sceneEnd(); } return true; }
        if(it&&it.offPlay&&G){ GM.sceneBegin(); try{ await S.play(GM); } finally { GM.sceneEnd(); } return true; }
        if(it&&it.offChat&&G){ GM.sceneBegin(); try{ if(!S.chatOpen(G)) GM.toast('今天聊過了。'); else await S.chat(GM); } finally { GM.sceneEnd(); } return true; }
        if(it&&it.exit&&G&&it.exit.to===ZONE&&!S.isOpen(Object.assign({},G))){ GM.toast(S.closedText(G),4500); return true; }   /* 「進去日常失速」：關門＝開放時間 */
        return oi.apply(this,arguments); }; }
      if(STORY.populate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ if(zoneId===ZONE) S.populate(GM); }catch(e){ console.warn('OFFB.populate',e); } return r; }; } } }
  /* AA_648 第 3 節：約去日常失速答應的那一句——十三人各一句在 src/data/invites.js（people[人].acc.offbeat），沒列的人＝一般那句 */
  S.ACC0='好啊。那裡吃什麼都好吃。';   /* 包 INV.personal 的 lines → S.playLines(GM,who,…)＝有名字說的，不加外面的「」（AA-B 2026-11-08，TEXT-QUOTE-UNIFY-1108 第三批）*/
  if(typeof INV!=='undefined'&&INV.personal&&!INV._offb){ INV._offb=true; const p0=INV.personal; INV.personal=function(G,id,P,day,h,r){ const out=p0.apply(this,arguments);
      if(P&&P.id==='offbeat'&&out&&out.res==='accept'&&!(Array.isArray(out.lines)&&out.lines.length)) return Object.assign({},out,{lines:[S.ACC0]}); return out; }; }
  /* ---------- AA_648 第 1 節：期末考完的聚餐（取代燒臘店那一場）----------
     四場（大一上下、大二上下：events.js ev_term_last_meal*，日子不變＝那學期最後一科考完的那晚 17:00～22:00 走進來）；大三、大四原本沒有這一場，照「不另外加」不加。
     揪人句（AA_618 2-4 第 2 點，誰揪照學年：大一阿哲、大二 Alison）：最後一科考完那天 17:00 起傳到桌遊團群組（不在群組＝揪的人私訊，要有聯絡方式；都沒有＝不傳，走進來照樣演）。
     舊存檔：已經收到「考完了 七點，燒臘店」（y2_final_ask、y2s2_final_ask）的那一晚照舊在燒臘店（finalZone）；已經演過的不重演（once）*/
  S.FINAL={Y1S1:{ev:'ev_term_last_meal',old:null},Y1S2:{ev:'ev_term_last_meal_y1s2',old:null},Y2S1:{ev:'ev_term_last_meal_y2s1',old:'y2_final_ask'},Y2S2:{ev:'ev_term_last_meal_y2s2',old:'y2s2_final_ask'}};
  S.FINAL_ORDER=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  S.finalNarrOf=term=>{ const i=Math.max(0,S.FINAL_ORDER.indexOf(term)); return S.L.finalNarr[i%S.L.finalNarr.length]; };   /* 旁白一句照學期輪 */
  S.oldPlan=function(G,term){ const F=S.FINAL[term]; if(!F||!F.old) return false; return (G.msgs||[]).some(m=>m&&m.tag===F.old&&/燒臘店/.test(String(m.text||''))); };
  S.finalZone=(G,term)=>S.oldPlan(G,term)?'noodle':ZONE;
  S.finalToday=G=>{ const L=G.events&&G.events.last; return !!L&&Object.keys(S.FINAL).some(k=>L[S.FINAL[k].ev]===G.day); };
  S.finalAskItem=function(G,term){ const y=String(term||'').slice(0,2), A=S.L.finalAsk[y]; if(!A) return null; const [who,text]=A;
    const grp=typeof PHONE!=='undefined'&&PHONE.inGroup&&PHONE.inGroup(G,'noodle_team'), th=grp?'g:noodle_team':(typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,who)?'p:'+who:null);
    return th?{th,from:who,text}:null; };
  S.phone=function(G){ if(!G||!G.flags||(G.stage||'law')!=='law'||typeof PHONE==='undefined'||typeof CLS==='undefined'||!CLS.lastExamEnd||G.flags.noodleTableDay==null) return null; const t=T_(G); if(!t||!S.FINAL[t.id]) return null;
    const F=S.FINAL[t.id], tag='ob_final_'+t.id; if(PHONE.sent(G,tag)||(F.old&&PHONE.sent(G,F.old))) return null; if(G.events&&G.events.done&&G.events.done[F.ev]) return null;
    let e=null; try{ e=CLS.lastExamEnd(G,t.id,'final'); }catch(err){ e=null; } if(!e||G.day!==e.day||G.hour<17) return null;
    const it=S.finalAskItem(G,t.id); if(!it) return null; PHONE.at(G,e.day,Math.max(17,G.hour%24),[it],tag); return tag; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._offbPhone){ STORY._offbPhone=true; STORY.PHONE_RULES.push(G=>{ try{ S.phone(G); }catch(e){ console.warn('OFFB.phone',e); } }); }

  /* ---------- AA_648 第 2 節：期中考完的聚餐、桌遊夜搬進 3D（OUT.STAGE）----------
     出遊抵達時換到日常失速（不跑進門那一段、不自動存檔），玩家坐長桌第一個位子、來的朋友坐長桌其他位子，對話照舊 ADV（事件裡的 2D 背景 boardgame_gg 換成模糊的 3D：OUT.bg）；
     演完、時間往後以前回到原本的地方（和霖澤館 5F 研究室同一套，src/lab5f3d.js）。在家、國外、騎車、有人跟著＝照舊 2D */
  S.cast={ev_midterm_supper:G=>['zhe','classmate_bohan','classmate_mingxuan','classmate_peishan'].filter(id=>id==='zhe'||knows(G,id)),
    ev_bgnight:G=>(typeof BGN!=='undefined'&&BGN.here?['classmate_mingxuan','zhe','classmate_xinci','classmate_bohan','classmate_peishan','kai'].filter(id=>BGN.here(G,id,G.day)&&(id==='classmate_mingxuan'||knows(G,id))):['classmate_mingxuan'])};
  S.staged=null;
  S.canStage=function(GM){ const G=GM.G, E=GM.E; if(!G||!E||!E.player||typeof Z3==='undefined'||!Z3.ZONES[ZONE]||!LAY()) return false;
    if(typeof OUT!=='undefined'&&OUT.fromHome) return false; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return false;
    if(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G)) return false; if(typeof EXCH!=='undefined'&&EXCH.inUS&&EXCH.inUS(G)) return false; if(typeof JP!=='undefined'&&JP.inJapan&&JP.inJapan(G)) return false;
    if(E.player.riding||(G.flags&&G.flags.companion)) return false; return true; };
  S.longSeats=()=>{ const L=LAY(); return L?L.seats.filter(q=>q.table===S.LONG_TABLE):[]; };
  S.stage=async function(GM,evId){ const G=GM.G, E=GM.E, P=E.player, seats=S.longSeats(); if(!seats.length) return null;
    const prev={zone:G.zone,x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y,lv:P.lv|0}; if(P.seat&&GM.standUp) GM.standUp(P);
    const me=seats[0], st=q=>({x:q.x,z:q.z,yaw:q.yaw,lv:0}); S.staged=evId;
    await GM.enter(ZONE,{x:me.x,z:me.z+(Math.cos(me.yaw)>0?-0.6:0.6),yaw:me.yaw},{noFade:true,deferStory:true,noAutosave:true}); doorVisit=GM.enterN|0;   /* 進門那一段不演 */
    if(GM.sitAt) GM.sitAt(P,st(me));
    const ids=(S.cast[evId]?S.cast[evId](G):[]).slice(0,seats.length-1), spawned=[];
    ids.forEach((id,i)=>{ const q=seats[i+1]; if(GM.npc&&GM.npc[id]&&GM.removeNPC) GM.removeNPC(id); const n=GM.spawnCharacter?GM.spawnCharacter(id,q.x,q.z,{seat:st(q),pose:'sit'}):null; if(n){ n.idlePose='sit'; n.frozen=true; spawned.push(id); } });
    let done=false;
    return {spawned, restore:async()=>{ if(done) return; done=true; S.staged=null; if(P.seat&&GM.standUp) GM.standUp(P);
      await GM.enter(prev.zone,{x:prev.x,z:prev.z,yaw:prev.yaw,lv:prev.lv},{noFade:true,deferStory:true,noAutosave:true}); }}; };
  /* AA_648 第 6 節（企劃線 adf1c2f78）：期末考完的聚餐要真的坐到長桌——揪的人坐長桌一端、玩家坐他旁邊，其他認識的人照熟悉度從玩家附近往外排，
     加起來最多六個（含揪的人）；坐不滿的位子給不認識的同學（路人，不說話）。玩家走進店裡、事件開頭（events.js ev_term_last_meal* 的 wz_offbeat 那一版第一行）叫 S.finalSeat，
     事件最後一行叫 S.finalUnseat（朋友、路人收掉，玩家起身，照常在店裡）*/
  S.FINAL_HOST={Y1:'zhe',Y2:'yu',Y3:'classmate_xinci',Y4:'zhe'};   /* 大一阿哲、大二 Alison、大三芯慈、大四阿哲 */
  S.FINAL_POOL=['zhe','yu','classmate_bohan','classmate_mingxuan','classmate_peishan','classmate_xinci','heroine_01','kai'];
  S.finalCast=function(G,term){ const host=S.FINAL_HOST[String(term||'').slice(0,2)]||'zhe', fam=id=>{ try{ return (typeof SOCIAL!=='undefined'&&SOCIAL.rel?SOCIAL.rel(id).fam:0)||0; }catch(e){ return 0; } };
    const rest=S.FINAL_POOL.filter(id=>id!==host&&knows(G,id)).sort((a,b)=>fam(b)-fam(a)); return [host].concat(rest).slice(0,6); };
  let finalSpawned=null;
  S.finalSeat=function(GM,term){ const G=GM.G, E=GM.E, P=E&&E.player, seats=S.longSeats(); if(!G||!P||G.zone!==ZONE||seats.length<2||!GM.sitAt) return null; S.finalUnseat(GM,true);
    const st=q=>({x:q.x,z:q.z,yaw:q.yaw,lv:0}), ids=S.finalCast(G,term), order=[0,1].concat(seats.map((q,i)=>i).filter(i=>i>1).sort((a,b)=>Math.hypot(seats[a].x-seats[1].x,seats[a].z-seats[1].z)-Math.hypot(seats[b].x-seats[1].x,seats[b].z-seats[1].z)));
    const sp={ids:[],extras:[]}; if(P.seat&&GM.standUp) GM.standUp(P); GM.sitAt(P,st(seats[order[1]]));   /* 玩家坐揪的人旁邊 */
    const put=(id,q)=>{ if(GM.npc&&GM.npc[id]&&GM.removeNPC) GM.removeNPC(id); const n=GM.spawnCharacter?GM.spawnCharacter(id,q.x,q.z,{seat:st(q),pose:'sit'}):null; if(n){ n.idlePose='sit'; n.frozen=true; sp.ids.push(id); } };
    put(ids[0],seats[order[0]]); ids.slice(1).forEach((id,i)=>{ const k=order[i+2]; if(k!=null) put(id,seats[k]); });
    for(let i=ids.length+1;i<order.length;i++){ const q=seats[order[i]]; if(typeof CHAR==='undefined'||!CHAR.build||!E.addNPC) break; const spec=typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(60+i):{}; const o=CHAR.build(spec); if(!o) break;
      const n=E.addNPC({obj:o,lv:0,name:'',beh:'idle',pose:'sit',idlePose:'sit',frozen:true,isExtra:true,offFinalExtra:true}); if(n){ GM.sitAt(n,st(q)); n.frozen=true; sp.extras.push(n); } }
    finalSpawned=sp; return sp; };
  S.finalUnseat=function(GM,quiet){ const sp=finalSpawned; finalSpawned=null; if(!sp||!GM) return false; for(const id of sp.ids) if(GM.removeNPC) GM.removeNPC(id); const E=GM.E; for(const n of sp.extras) if(E&&E.removeNPC) E.removeNPC(n);
    if(!quiet&&E&&E.player&&E.player.seat&&GM.standUp) GM.standUp(E.player); return true; };
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['offbeat:finalSpawned']=()=>{ finalSpawned=null; };   /* 讀檔：演到一半讀檔，舊的那一批跟著區域重建消失 */
  S.outingStage=async function(GM,q,ev){ if(!ev||!S.cast[ev.id]||!S.canStage(GM)) return null; return S.stage(GM,ev.id); };
  if(typeof OUT!=='undefined'&&!OUT._offbStage){ OUT._offbStage=true; if(Array.isArray(OUT.STAGE)) OUT.STAGE.push(S.outingStage);
    if(OUT.bg){ const b0=OUT.bg; OUT.bg=function(id){ if(S.staged&&id==='boardgame_gg') return 'blur'; return b0.apply(this,arguments); }; } }
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['offbeat:staged']=()=>{ S.staged=null; };   /* 讀檔時放開（演到一半讀檔：restore 走不到）*/

  /* 店員：吧檯裡面（配置：員工在 z −4.4～−3.55），面向客人（+z） */
  S.CLERK_AT={x:-3.0,z:-3.95,yaw:0};
  S.CHAT_AT={x:-2.6,z:-2.35};   /* 「找店員聊天」：吧檯前（高腳椅後面的走道），對著店員 */
  S.populate=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.addNPC||typeof CHAR==='undefined'||!CHAR.build||!S.isOpen(G)) return null; if((E.npcs||[]).some(n=>n&&n.offClerk)) return null;
    const sp=typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(92):{}; const o=CHAR.build(sp); if(!o) return null; o.position.set(S.CLERK_AT.x,0,S.CLERK_AT.z); o.rotation.y=S.CLERK_AT.yaw;
    return E.addNPC({obj:o,lv:0,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,clerk:true,offClerk:true}); };
  return S;
})();
