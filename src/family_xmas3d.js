/* ===== 家族的聖誕交換禮物：直屬送直屬（大二，2026-12-28；AA_406 定稿，企劃線 2408bcf09；任務 SIS-XMAS-GIFT-L-1023）=====
   台詞照 AA_406 一字不改（D100、D109；不數件數 AA_398）。
   - 誰有：在家族群組（family_law）、12/28 人在臺灣。
   - 手機（STORY.PHONE_RULES）：12/14（一）21:00 家族群組四則（Kevin×3、溫學姊「收到。」）＋排出遊 12/28（一）18:30「家族聖誕：公館的火鍋店」；
     21:05 起手機「買給學姊的聖誕禮物」五選一（到 12/28 18:00；照 y2r2_3d.js 可昕聖誕禮物的做法，買了就扣錢；錢不夠的不能選；
     手寫券只給演過 ev_sis_hot_water 的）——AA 寫的是在公館、便利商店買，遊戲還沒有逐店的禮物清單，先用手機這一格，已告訴 AA。
     手寫券：2027-01-10（日）21:00 她私訊「我用了。昨天。」。
   - 事件 ev_family_xmas_y2（OUT）：禮物的反應、沒準備、她送的鉛筆（ev_grad_reading 兩版）、交往中、前任（第 3 節）。
     合適＝她的戀愛 +2、熟悉 +2；普通（朋友收到花）＝信任 +1。記 SIS_FAMXMAS_Y2、記憶 SIS_XMAS_PENCIL、房間物件（前任的鉛筆沒刻名字，不放房間）。
   - 大三 ev_sis_xmas_y3 多一句在 src/data/sis_b4_events.js。
   測試：node tests/aa406_family_xmas_unit.js */
'use strict';
const FAMXMAS=(function(){
  const S={}, ID='heroine_05';
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  S.dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  S.isEx=G=>!S.dating(G)&&!!(G.flags&&(G.flags['EX_'+ID]||(typeof ROM!=='undefined'&&ROM.isEx&&ROM.isEx(G,ID))));
  const inGrp=G=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'family_law');
  const abroadOn=(G,d)=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d}));
  S.DAYS={ask:'2026-12-14',day:'2026-12-28',used:'2027-01-10'};
  S.GIFTS=[{k:'pencil',t:'一盒鉛筆（2B）',where:'舊路書房',price:60},{k:'notebook',t:'一本空白筆記本',where:'舊路書房',price:120},{k:'lemon',t:'蜂蜜檸檬（一瓶）',where:'便利商店',price:45},
    {k:'coupon',t:'手寫的「今天先不改了」券',where:null,price:0,need:G=>done(G,'ev_sis_hot_water')},{k:'flowers',t:'一小束花',where:'公館的花店',price:150}];
  const GK=t=>({th:'g:family_law',from:'kevin',name:'Kevin',text:t}), GS=t=>({th:'g:family_law',from:ID,name:'溫學姊',text:t});
  S.ok=G=>law(G)&&inGrp(G)&&!abroadOn(G,D(S.DAYS.day));
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; const F=G.flags, a=D(S.DAYS.ask), d=D(S.DAYS.day); if(a==null||d==null) return;
    if(G.day>=a&&G.day<=d&&now(G)<T(d,18.5)&&!sent(G,'famx_y2_grp')&&S.ok(G)){
      PHONE.at(G,G.day===a?a:G.day,G.day===a?21:G.hour,[GK('家族聖誕交換禮物！期末考完那天，12/28 晚上六點半，公館那家火鍋。'),GK('聖誕節晚三天過沒差啦，考試比較重要。'),GK('家族的規矩齁：直屬送直屬。一百五以內，超過的自己吞。'),GS('收到。')],'famx_y2_grp'); }
    if(sent(G,'famx_y2_grp')&&F.SIS_FAMXMAS_Y2==null&&typeof OUT!=='undefined'&&!OUT.get(G,'famx_y2')&&now(G)<T(d,18.5+0.5))
      OUT.plan(G,{id:'famx_y2',ev:'ev_family_xmas_y2',day:d,h:18.5,late:0.5,place:'公館・火鍋店',title:'家族聖誕：公館的火鍋店',travel:'走路 約 15 分鐘',travelH:0.25,hours:2.5,alarm:true,back:'回到住的地方。'});
    if(sent(G,'famx_y2_grp')&&!sent(G,'famx_y2_gift')&&now(G)<T(d,18)&&G.day>=a){ const opts=S.GIFTS.filter(g=>!g.need||g.need(G)).map(g=>Object.assign({t:g.t+(g.where?'（'+g.where+'，'+g.price+' 元）':'（不用錢）'),post:false,set:{SIS_FAMXMAS_BUY:g.k}},g.price?{need:{money:g.price,why:'錢不夠。'}}:{}));
      PHONE.at(G,G.day===a?a:G.day,G.day===a?21+5/60:G.hour,[{th:'sys',text:'買給學姊的聖誕禮物',ask:{id:'famx_y2_gift',until:T(d,18),opts}}],'famx_y2_gift'); }
    if(F.SIS_FAMXMAS_BUY&&!F.SIS_FAMXMAS_PAID){ const g=S.GIFTS.find(x=>x.k===F.SIS_FAMXMAS_BUY); F.SIS_FAMXMAS_PAID=true; if(g&&g.price) G.money=(G.money|0)-g.price; }   /* 買了就扣錢 */
    const u=D(S.DAYS.used); if(u!=null&&F.SIS_FAMXMAS_Y2==='coupon'&&G.day>=u&&G.day<=u+2&&now(G)>=T(u,21)&&!S.isEx(G)) PHONE.at(G,u,21,[{th:'p:'+ID,from:ID,text:'我用了。昨天。'}],'famx_y2_coupon'); };
  const N=t=>({speaker:null,text:t}), SIS=t=>({speaker:ID,text:t}), KEV=t=>({speaker:'Kevin',text:t});
  const buy=k=>({custom:G=>(G.flags.SIS_FAMXMAS_BUY||null)===k&&!S.isEx(G)}), ex={custom:G=>S.isEx(G)}, dt={custom:G=>S.dating(G)};
  const rel=o=>({consequences:{rel:{[ID]:o}}});
  S.EVENT={ id:'ev_family_xmas_y2', title:'家族聖誕', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'公館・火鍋店',bg:'gongguan_hotpot'},
      N('（長桌，六個人，一鍋。Kevin 坐在中間，負責下肉。）'),
      KEV('好，交換！直屬送直屬，學弟先！'),
      N('（學姊坐在你對面。她把一個用牛皮紙包的小東西放在桌上，等你先拿出來。）'),
      {unless:{custom:G=>!G.flags.SIS_FAMXMAS_BUY},goto:'gift'},
      N('（你兩手空空。桌上的人都看著你。）'),KEV('學弟——'),SIS('沒關係。剛考完，忘記很正常。'),SIS('……下次補。'),{set:{SIS_FAMXMAS_Y2:'none'}},{goto:'hers'},
      {label:'gift'},
      {if:ex,speaker:ID,text:'……謝謝。'},
      {if:buy('pencil'),speaker:ID,text:'……鉛筆。'},{if:buy('pencil'),speaker:ID,text:'我說過用鉛筆，你記得。這盒夠我用到畢業。'},
      {if:buy('notebook'),speaker:ID,text:'我有很多本了。……這本我留著，不排東西。'},
      {if:buy('lemon'),speaker:ID,text:'考完了才喝得到。……很好，我現在終於有時間喝。'},
      {if:buy('coupon'),speaker:ID,text:'……這是什麼。'},{if:buy('coupon'),speaker:ID,text:'好。我收下。不保證會用。'},
      {if:{custom:G=>G.flags.SIS_FAMXMAS_BUY==='flowers'&&!S.isEx(G)&&!S.dating(G)},speaker:ID,text:'……謝謝。'},{if:{custom:G=>G.flags.SIS_FAMXMAS_BUY==='flowers'&&!S.isEx(G)&&!S.dating(G)},speaker:'Kevin',text:'齁——'},
      {if:{custom:G=>G.flags.SIS_FAMXMAS_BUY==='flowers'&&S.dating(G)},speaker:ID,text:'我第一次收到不是畢業典禮的花。'},
      {if:{custom:G=>!S.isEx(G)&&G.flags.SIS_FAMXMAS_BUY==='flowers'&&!S.dating(G)},consequences:{rel:{[ID]:{trust:1}}}},   /* 朋友收到花：普通 */
      {if:{custom:G=>!S.isEx(G)&&!(G.flags.SIS_FAMXMAS_BUY==='flowers'&&!S.dating(G))},consequences:{rel:{[ID]:{npcRom:2,fam:2}}}},   /* 合適 */
      {label:'hers'},
      {unless:ex,speaker:null,text:'（牛皮紙裡是一支木頭鉛筆，筆身刻著你的名字。）'},{if:ex,speaker:null,text:'（牛皮紙裡是一支鉛筆。）'},
      {if:{events:['ev_grad_reading']},speaker:ID,text:'用鉛筆寫你不同意的地方。我說過。'},{unless:{events:['ev_grad_reading']},speaker:ID,text:'鉛筆。寫錯可以擦。'},
      {choice:[{text:'「名字是妳刻的？」',unless:ex,goto:'p_a'},{text:'「謝謝學姊。」',unless:dt,goto:'p_b'},{text:'「謝謝。」',if:dt,goto:'p_b'}]},
      {label:'p_a'},SIS('刻壞了兩支。這是第三支。'),{goto:'p_e'},
      {label:'p_b'},SIS('嗯。'),{unless:ex,speaker:null,text:'（她低頭吃了一口菜。耳朵有一點紅。）'},
      {label:'p_e'},KEV('好！大家都送完了，吃！'),
      N('（火鍋一直滾到九點。散的時候，她最後一個走，在門口跟你說了一句。）'),
      {unless:ex,speaker:ID,text:'明年也是直屬送直屬。……你記得。'},{if:ex,speaker:ID,text:'……回去小心。'},
      {mem:[{npc:ID,tag:'SIS_XMAS_PENCIL',note:''}]} ],
    afterOuting:G=>{ if(G.flags.SIS_FAMXMAS_Y2==null) G.flags.SIS_FAMXMAS_Y2=G.flags.SIS_FAMXMAS_BUY||'none'; },   /* 送了哪一樣（沒準備的事件裡已經記 none）*/
    outingMissed:G=>{ if(G.flags.SIS_FAMXMAS_Y2==null) G.flags.SIS_FAMXMAS_Y2='missed'; } };
  if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e.id===S.EVENT.id)) STORY_EVENTS.push(S.EVENT);
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,Lr)=>{ const F=G&&G.flags; if(F&&F.SIS_FAMXMAS_Y2&&F.SIS_FAMXMAS_Y2!=='missed'&&!S.isEx(G)&&done(G,'ev_family_xmas_y2')) Lr.push(['學姊送的鉛筆（刻了你的名字）','（筆身刻著你的名字。）']); }); }
  return S;
})();
