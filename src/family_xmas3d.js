/* ===== 家族的聖誕交換禮物：直屬送直屬（大一，2025-12-22；AA_406 改版，企劃線 895496a7；任務 SIS-XMAS-GIFT-L-1023）=====
   AA-B 10-23 10:2x 改到大一（大二 12/24 AA_386 3-1 Café 門口已經互送禮物，四天後再交換一次重複了）；這是祐廷第一年當她的直屬。
   台詞照 AA_406 一字不改（D100、D109；不數件數 AA_398）。大一 12 月沒有人和她交往、也沒有前任，沒有那兩版。
   - 誰有：在家族群組（family_law）、12/22 人在臺灣。
   - 手機（STORY.PHONE_RULES）：12/15（一）21:00 家族群組三則（Kevin×2、溫學姊「收到。」）＋排出遊 12/22（一）18:30「家族聖誕：公館的火鍋店」；
     21:05 起手機「買給學姊的聖誕禮物」五選一（到 12/22 18:00；照 y2r2_3d.js 可昕聖誕禮物的做法，買了就扣錢、錢不夠不能選；手寫券只給演過 ev_sis_hot_water 的；
     之後店面的清單做好再搬進店裡）。手寫券：2026-01-18（日）21:00 她私訊「我用了。昨天。」。
   - 事件 ev_family_xmas_y1（OUT）：合適＝熟悉 +2、她的戀愛 +2；普通（花）＝信任 +1。記 SIS_FAMXMAS_Y1、記憶 SIS_XMAS_PENCIL、房間物件（有去就有那支鉛筆）。
   - 回聲：大一下 ev_grad_reading 多「用我給你的那支。」（src/data/events.js）；大二 AA_386 3-1 Café 門口她先拿紙袋（src/data/sis_b4_events.js）。
   測試：node tests/aa406_family_xmas_unit.js */
'use strict';
const FAMXMAS=(function(){
  const S={}, ID='heroine_05';
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const inGrp=G=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'family_law');
  const abroadOn=(G,d)=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d}));
  S.DAYS={ask:'2025-12-15',day:'2025-12-22',used:'2026-01-18'};
  S.GIFTS=[{k:'pencil',t:'一盒鉛筆（2B）',price:60},{k:'notebook',t:'一本空白筆記本',price:120},{k:'lemon',t:'蜂蜜檸檬（一瓶）',price:45},
    {k:'coupon',t:'手寫的「今天先不改了」券',price:0,need:G=>done(G,'ev_sis_hot_water')},{k:'flowers',t:'一小束花',price:150}];
  /* 有那支鉛筆＝去了那一場（送什麼、沒準備都一樣拿到）；送了禮物＝不是 none */
  S.hasPencil=G=>{ const v=G&&G.flags&&G.flags.SIS_FAMXMAS_Y1; return !!v&&v!=='missed'; };
  S.gave=G=>{ const v=G&&G.flags&&G.flags.SIS_FAMXMAS_Y1; return !!v&&v!=='missed'&&v!=='none'; };
  const GK=t=>({th:'g:family_law',from:'kevin',name:'Kevin',text:t}), GS=t=>({th:'g:family_law',from:ID,name:'溫學姊',text:t});
  S.ok=G=>law(G)&&inGrp(G)&&!abroadOn(G,D(S.DAYS.day));
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; const F=G.flags, a=D(S.DAYS.ask), d=D(S.DAYS.day); if(a==null||d==null) return;
    if(G.day>=a&&G.day<=d&&now(G)<T(d,18.5)&&(G.day>a||G.hour>=21)&&!sent(G,'famx_y1_grp')&&S.ok(G))
      PHONE.at(G,G.day===a?a:G.day,G.day===a?21:G.hour,[GK('家族聖誕交換禮物！期末考完，12/22 晚上六點半，公館那家火鍋。'),GK('家族的規矩齁：直屬送直屬。一百五以內，超過的自己吞。'),GS('收到。')],'famx_y1_grp');   /* 期末考第 16 週（12/15～12/21），12/22 已經是寒假第一天：「期末考完那天」→「期末考完」（AA_458 3-3；AA_406 那一句也照這次）*/
    if(sent(G,'famx_y1_grp')&&F.SIS_FAMXMAS_Y1==null&&typeof OUT!=='undefined'&&!OUT.get(G,'famx_y1')&&now(G)<T(d,18.5+0.5))
      OUT.plan(G,{id:'famx_y1',ev:'ev_family_xmas_y1',day:d,h:18.5,late:0.5,place:'公館・火鍋店',title:'家族聖誕：公館的火鍋店',travel:'走路 約 15 分鐘',travelH:0.25,hours:2.5,alarm:true,back:'回到宿舍。'});
    if(sent(G,'famx_y1_grp')&&!sent(G,'famx_y1_gift')&&now(G)<T(d,18)){ const opts=S.GIFTS.filter(g=>!g.need||g.need(G)).map(g=>Object.assign({t:g.t+(g.price?'（'+g.price+' 元）':'（不用錢）'),post:false,set:{SIS_FAMXMAS_BUY:g.k}},g.price?{need:{money:g.price,why:'錢不夠。'}}:{}));
      PHONE.at(G,G.day===a?a:G.day,G.day===a?21+5/60:G.hour,[{th:'sys',text:'買給學姊的聖誕禮物',ask:{id:'famx_y1_gift',until:T(d,18),opts}}],'famx_y1_gift'); }
    if(F.SIS_FAMXMAS_BUY&&!F.SIS_FAMXMAS_PAID){ const g=S.GIFTS.find(x=>x.k===F.SIS_FAMXMAS_BUY); F.SIS_FAMXMAS_PAID=true; if(g&&g.price) G.money=(G.money|0)-g.price; }   /* 買了就扣錢 */
    const u=D(S.DAYS.used); if(u!=null&&F.SIS_FAMXMAS_Y1==='coupon'&&G.day>=u&&G.day<=u+2&&now(G)>=T(u,21)) PHONE.at(G,u,21,[{th:'p:'+ID,from:ID,text:'我用了。昨天。'}],'famx_y1_coupon'); };
  const N=t=>({speaker:null,text:t}), SIS=t=>({speaker:ID,text:t}), KEV=t=>({speaker:'Kevin',text:t});
  const buy=k=>({custom:G=>(G.flags.SIS_FAMXMAS_BUY||null)===k});
  S.EVENT={ id:'ev_family_xmas_y1', title:'家族聖誕', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'公館・火鍋店',bg:'gongguan_hotpot'},
      N('（長桌，六個人，一鍋。Kevin 坐在中間，負責下肉。）'),
      N('（學姊坐在你對面。她的碗裡只有白飯和青菜。）'),
      KEV('她二月要考試，不吃辣，不吃肉丸。不要問。'),
      KEV('好，交換！直屬送直屬，學弟先！'),
      N('（她把一個用牛皮紙包的小東西放在桌上，等你先拿出來。）'),
      {unless:{custom:G=>!G.flags.SIS_FAMXMAS_BUY},goto:'gift'},
      N('（你兩手空空。桌上的人都看著你。）'),KEV('學弟——'),SIS('沒關係。剛考完，忘記很正常。'),{set:{SIS_FAMXMAS_Y1:'none'}},{goto:'hers'},
      {label:'gift'},
      {if:buy('pencil'),speaker:ID,text:'……鉛筆。'},{if:buy('pencil'),speaker:ID,text:'我讀判決都用鉛筆。這盒夠我用到考完。'},
      {if:buy('notebook'),speaker:ID,text:'我有很多本了。……這本我留著，考完再用。'},
      {if:buy('lemon'),speaker:ID,text:'考前喝這個。……你很懂。'},
      {if:buy('coupon'),speaker:ID,text:'……這是什麼。'},{if:buy('coupon'),speaker:ID,text:'好。我收下。不保證會用。'},
      {if:buy('flowers'),speaker:ID,text:'……謝謝。'},{if:buy('flowers'),speaker:null,text:'（Kevin：「齁——」她把花放在腳邊，整晚沒有再看它。）'},
      {if:buy('flowers'),consequences:{rel:{[ID]:{trust:1}}}},   /* 普通 */
      {unless:buy('flowers'),consequences:{rel:{[ID]:{fam:2,npcRom:2}}}},   /* 合適 */
      {label:'hers'},
      N('（牛皮紙裡是一支木頭鉛筆，筆身刻著你的名字。）'),SIS('鉛筆。寫錯可以擦。'),
      {choice:[{text:'「名字是妳刻的？」',goto:'p_a'},{text:'「謝謝學姊。」',goto:'p_b'}]},
      {label:'p_a'},SIS('刻壞了兩支。這是第三支。'),{goto:'p_e'},
      {label:'p_b'},SIS('嗯。'),N('（她低頭吃了一口青菜。）'),
      {label:'p_e'},KEV('好！大家都送完了，吃！'),
      N('（她九點就先走了。說要回去念書。走到門口，又回頭跟你說了一句。）'),
      SIS('鉛筆用完了，再跟我說。'),
      {mem:[{npc:ID,tag:'SIS_XMAS_PENCIL',note:''}]} ],
    afterOuting:G=>{ if(G.flags.SIS_FAMXMAS_Y1==null) G.flags.SIS_FAMXMAS_Y1=G.flags.SIS_FAMXMAS_BUY||'none'; },   /* 送了哪一樣（沒準備的事件裡已經記 none）*/
    outingMissed:G=>{ if(G.flags.SIS_FAMXMAS_Y1==null) G.flags.SIS_FAMXMAS_Y1='missed'; } };
  if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e.id===S.EVENT.id)) STORY_EVENTS.push(S.EVENT);
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,Lr)=>{ if(S.hasPencil(G)&&done(G,'ev_family_xmas_y1')) Lr.push(['學姊送的鉛筆（刻了你的名字）','（筆身刻著你的名字。）']); }); }
  return S;
})();
