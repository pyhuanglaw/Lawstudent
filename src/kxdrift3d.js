/* ===== 可昕「個性磨合不了，慢慢分開」同系版（企劃線 AA_876 事件包，04b0a648ef；AA-C 2026-11-12 定稿，BB_419；任務 KX-DRIFT-SAMEDEPT-1112、USER_WANTS C23）=====
   取代 AA_351 那一包（舊的 kxdrift3d.js 在 CANON-NO-ECON-1112 第三批整支拿掉：吵架來源、場地、「見不到面」的計數都綁在外校）。
   使用者 10-18 選的四題照舊：她生氣的來源＝她確實知道的事＋她自己的不安；做對了就避得掉；分開只在學期末；分開以後只能當朋友、不能復合。最早大二上。
   台詞一字不改（D79、D137：AA 寫的才演）。程式自己加的只有系統字：D0 不說的那個選項「（不說）」、打給她那一通的出遊標題「打給可昕」（同 aa525_3d.js）、各場的地點字幕——回報給 AA 確認。
   - 誰會走（第 1 節）：法律系、和可昕交往中、而且只和她一位（ROM.partners 只有 kexin）、大二上到大四下。中途開始了另一段＝停住、數字凍結。
     交換那一學期（人在國外）：整包不演、數字凍結（S.on 是 false）；回來以後接著算。寒暑假：D1～D5 都不演（都是學期中在系館的場）。大四下不演 D4、D5（數字照記）。
   - 計數 KX_CRACK（第 2 節；ROM.crack，最低 0）：
       +：D1／D1b／D1c／D2／D3 的選項；她不爽的那天（D1、D1c 選了會加的、D2 選「都過兩天了耶。」的當天）到晚上十二點都沒去找她（沒找她說話、也沒打給她）+1；和她約好的出遊、約會沒到或遲到超過 15 分鐘 +1。
       −：D0 跟她說一聲 −1；D1c 站到她旁邊 −1；和她約好的準時到 −1（一週最多一次）；祐廷主動約她、她答應 −1（一週最多一次）。
     數字第一次到 2、4、6 各演一次 D2、D3、D4（降下去再上來不重演）；修補成功以後又到 6＝直接 D5。
   - 場（第 3 節；事件 ev_kx_drift_r1、_r1b、_r1c、_r2、_r3、_r4、_r5、_r5_call、_r6）：
       D0 答應（或約）另一位女主角單獨出去的那一步（邀約的吃飯、散步、一盞；校外約會；去她的縣市）：多一個選單「（跟可昕說一聲）」→ 祐廷傳「{週幾}我跟{她}去{地點}吃飯。」，她照順序回三句之一，−1，那一次不會有 D1。
         只算玩家自己約的：她們約你的（INV.offer by:'npc'）、劇情裡排好的出遊不算。
       D1 沒說、地點在公館、溫州街或校園（S.AREA）、這學期第一次：隔天第一次進法律系館（enter linze），她在教室門口當面問。隔天沒進系館＝這一次不演（「你昨天在…」只在隔天說得通）。
       D1b 14 天內和同一位單獨出去兩次以上（說了也算）：下一次單獨和她在一起（她的出遊、校外約會的開頭；她答應的邀約開始的時候），一學期一次；那一位和祐廷在曖昧（DATE 第 5 階以上）不演。
       D1c 大二上起每學期最多一次：學期第 5～12 週、她在系館的一天（enter linze，random_weight 0.35，落在哪一週不固定）。
       她不爽的那天：找她說話（interact）＝她說那一句；晚上 18:00 起排一通「打給可昕」（不打也可以）；到 24:00 都沒有＝+1（一場只算一次）。
       D2 D1 吵起來（+1、+2）或數字第一次到 2：之後她回訊息只回短的「嗯」「在上課」「嗯」、短招呼只剩「嗨。」；第三天（學期中）下課她在系館門口等（enter linze 12:00～19:00）→ 學校後門・湯餃店。
       D3 數字第一次到 4、大二下起：系館討論桌，晚上（enter linze 18:00～23:00）。
       D4 數字第一次到 6（不在寒暑假、交換、大四下）：下課時她當面約（enter linze 10:00～17:00），「好。」＝當天 18:00 公館河濱；「今天不行。」＝她說「那明天。」，隔天再約一次，再不行＝她說「好。」、直接等 D5。沒到＝等 D5。
         選項：修補（ROM.mend 歸零）／修補（不歸零）／等 D5。修補期 35 天：結束那天 <6＝KX_REPAIRED，之後第一次單獨和她在一起她說一次「這個月我氣的時候，你都有來。」。
       D5 只在學期末：期末考最後一天（祐廷自己的最後一科，CLS.lastExamEnd；沒有＝學期最後第二天）考完，她當面說（enter 任何地方）→ 隔天 19:00 女生宿舍樓下；那學期來不及＝下一個學期末。
         沒到（20:00 還沒來）＝21:00 她打來（同樣四句和三個選項，最後兩句換）；電話也沒接＝隔天 12:00 她傳文字版。記 ROM.end(G,'kexin','drift')、KX_ENDED='drift'、KX_ENDED_ON；她已經排好的出遊、校外約會、手機裡還沒送的她的訊息取消。
       D6 從下學期開學日起算 60 天（只算兩個人都在學校的日子：學期中、祐廷不在交換那一學期）：她回訊息只回短的「嗯」「最近很忙」「嗯」、短招呼只用「嗨。」和「（她朝你抬了一下下巴）」。
         第 61 天起第一次進系館（enter linze 8:00～13:00）她當面約、學校後門・湯餃店吃一頓（只一次）→ 照朋友。
   - 分開以後：ROM.canStart(G,'kexin') 一律 false（不能復合）；學期末心意邀約、女朋友的期末約會沒有她（TERMEND.plan 的 kx 關掉）；尾聲照 postgrad3d.js 現有的前任那一版（AA_876「尾聲用朋友那一版」沒有新字，回報 AA）。
   - 存檔：G.flags.KX_DRIFT（v:2，下面 S.rec）、KX_REPAIRED、KX_ENDED、KX_ENDED_ON；KX_CRACK 舊存檔沒有＝0。舊的 v:1（AA_351）紀錄讀進來：數字照留，進行到一半的場次（D2～D6 的狀態）清掉重新等。
   測試：node tests/kx_drift_876_unit.js */
'use strict';
const KXDRIFT=(function(){
  const S={};
  if(typeof STORY==='undefined'||typeof CALENDAR==='undefined') return S;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const wdOf=d=>CALENDAR.dateOf(d).wd%7;   /* 0＝週日 … 6＝週六 */
  const monOf=d=>d-((wdOf(d)+6)%7);   /* 那一週的週一 */
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const termOf=d=>CALENDAR.termOf(d);
  const termAt=d=>{ const t=termOf(d); if(t) return t.id; return STORY.termAt?STORY.termAt(d):null; };   /* 寒暑假算前一個學期 */
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  const KX='kexin', TH='p:kexin';
  const K=t=>({th:TH,from:KX,text:t});
  S.HER=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan'];   /* 另一位女主角（DATE.HEROINES 去掉可昕）*/
  S.TERMS=['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  S.ALL_TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2','Y5S1','Y5S2'];
  S.R1B_DAYS=14; S.REPAIR=35; S.D6_QUIET=60;

  /* ---------- 台詞（AA_876 第 3 節原文，一字不改；「（…）」＝旁白，其他＝可昕說）---------- */
  S.L={
    d0:{opt:'（跟可昕說一聲）',no:'（不說）',say:'{週幾}我跟{她}去{地點}吃飯。',reply:['好。吃完跟我講好不好吃。','好啊。不要吃太晚。','好。幫我看一下那家的菜單，我也想去。']},
    r1:{open:'（她站在教室門口，沒有進去。）',where:{'公館':'你昨天在公館。','溫州街':'你昨天在溫州街。','學校':'你昨天在學校。'},lines:['我去買東西，看到的。','她是誰不重要。你為什麼沒跟我講？'],
      opts:[{t:'「我忘了講。對不起。」',say:['……好。以後先講。','（她先進教室了，位子有幫你留。）'],n:0},{t:'「只是一起吃飯。」',say:['我又沒說你們怎樣。我問的是你為什麼沒講。','算了，要上課了。'],n:1},{t:'「妳想太多了吧。」',say:['操。','好，我想太多。','（她進教室，坐到另一排。）'],n:2}]},
    upset:'我還在氣。可是你有來。', upsetR1c:'我知道我聲音不好聽。可是那件事我沒有講錯。',
    r1b:{lines:['你最近常跟{她}出去。','我沒有怎樣。我只是問。'],
      opts:[{t:'「找一天三個人一起吃飯？」',say:['好啊。你約。'],n:0},{t:'「妳想太多了。」',say:['我說了，我只是問。','算了。吃飯。'],n:1},{t:'「那我少跟她出去。」',say:['我沒有要你少出去。','我只是想知道。先點餐。'],n:0}]},
    r1c:{lines:['（走廊上，可昕在跟一個同組的同學講話。聲音不大，可是每一句都很直。那個同學臉是紅的。旁邊有人在看。）','報告是四個人的。你那一段到昨天晚上才交，還是錯的。','我沒有要你道歉。我要你今天晚上改好。','（她講完，轉頭看到你站在那裡。）'],
      opts:[{t:'（走過去，站在她旁邊）',say:['（你什麼都沒說。那個同學說「我今天改」，走了。）','你不用幫我講話。你站在這裡就好。'],n:-1},{t:'（等她講完再過去）',say:['你剛剛在那邊站很久。','沒事。走，吃飯。'],n:0},
        {t:'「妳可不可以不要在走廊講？」',say:['那要在哪裡講？他三天沒有回訊息。','你覺得我丟臉，可以直接講。','（她自己先走了。）','（她走遠了。今天去找她，還來得及。）'],n:1}]},
    r2:{short:['嗯','在上課','嗯'],greet:'嗨。',gate:'走，吃飯。後門那家湯餃。',scene:'學校後門・湯餃店',lines:['（她點了兩碗。吃飯的時候她幾乎沒說話。走回學校，到第二個路口她才開口。）','上次那個，我還有一點氣。'],
      opts:[{t:'「我知道。」',say:['……嗯。','（她勾住你的手臂。）'],n:0},{t:'「都過兩天了耶。」',say:['兩天不夠。','（她把手放進自己的口袋。）'],n:1}]},
    r3:{lines:['（系館一樓的討論桌。她坐你對面，課本攤著。）','今天我們那一組吵到六點。一個說要先寫結論，一個說——','（你在看明天要考的那幾頁。她講到一半停下來。）','你剛剛在看別的東西。','我們坐同一張桌子欸。'],
      opts:[{t:'（把書蓋起來）「我在聽，妳講。」',say:['（她講完了。後面那一段講得很快。）','好了。你看你的。'],n:0},{t:'「我看完這一頁就聽，給我五分鐘。」',say:['好。五分鐘。','（五分鐘以後你把書蓋起來。她從頭講了一次。）'],n:0},{t:'（「嗯。」眼睛沒有離開書）',say:['……算了。','（她把自己的書也翻開。兩個人到閉館都沒有再講話。）'],n:1}]},
    r4:{ask:'今天晚上有空嗎？河濱。有事要講。',askOpts:['好。','今天不行。'],tomorrow:'那明天。',ok:'好。',scene:'公館河濱',
      lines:['（河濱。她靠著欄杆，沒有看你。）','我們最近是不是一直在吵？','我知道我脾氣不好。我講話很直，氣也不會馬上過。','可是我氣的時候，你都躲。你等我自己好。','我自己會好。可是每一次都是我一個人在好。'],
      opts:[{t:'「我會改。先講、妳氣的那天我去找妳、妳在講話的時候我不躲。」',say:['你講的喔。','（她轉過來，把你外套的領子拉正。）']},{t:'「我不知道妳氣的時候要怎麼辦。」',say:['不用怎麼辦。你在就好。','……可是你要自己來，不能每次都我叫。']},{t:'「是妳太容易生氣。」',say:['……好。','（她把包包背起來，走了。）']}]},
    repair:'這個月我氣的時候，你都有來。',
    r5:{ask:'明天晚上七點，我宿舍樓下。',scene:'女生宿舍樓下',open:'（宿舍樓下的長椅。她的行李箱已經拉下來一個。）',talk:['我想了一個禮拜。','我們分開好不好。','我不想每次生氣，都在等你會不會來。','你應該也不想每次都在猜我氣完了沒。'],
      opts:[{t:'「再試一次？」',say:['我們試過了。','試了一整個學期。']},{t:'「……好。」',say:['嗯。','（她很久沒說話。）']},{t:'（不說話）',say:['你看，你又不講話。','（她笑了，眼睛是紅的。）']}],
      close:['我明天回高雄。','下學期我還是坐老位子。你不用換。'],callClose:['我明天回高雄。','……晚安。'],text:'昨天的事，我寫在這裡。'},
    r6:{short:['嗯','最近很忙','嗯'],greet:['嗨。','（她朝你抬了一下下巴）'],ask:'欸。中午有沒有空。後門那家。',scene:'學校後門・湯餃店',lines:['（你到的時候，她已經坐好了，點了兩碗。）','我點了。你的沒有加辣。','我本來想說再久一點才找你吃飯。可是同班，躲很累。','以後就這樣。有事講，沒事也可以一起吃飯。']} };

  /* ---------- 存檔（G.flags.KX_DRIFT）----------
     outs 單獨出去的紀錄 [{k:'inv'|'date'|'hv', id, who, place, area, day, told, st:'live'|'done'|'gone'}]；r1Term／r1bTerm／r1cTerm 演過的學期；r1 這一次 D1；r1bPend 等著演的 D1b；
     upset 她不爽的那一天 {day, src, met, hit, call}；th 第一次到 2／4／6 的時間；r2～r6 各場的狀態；r4Pick D4 選了哪一個（0、1、2、'decline'、'noshow'）；repairEnd 修補期結束那天；
     seen 最後一次見面那天（invites3d.js「上一次約會祐廷遲到」讀它和 log 的 'late'）；wk 一週一次的上限；log 數字的變化（最近 40 筆）*/
  S.rec=function(G){ const F=G.flags||(G.flags={}); if(F.KX_CRACK==null) F.KX_CRACK=0; let R=F.KX_DRIFT;
    if(!R||typeof R!=='object') R=F.KX_DRIFT={v:2};
    if(R.v!==2){ for(const k of ['r1','r1bPend','r2','r3','r4','r4Pick','repairEnd','repairDone','r5','r6','r7','gapDay','gapN','gapHit']) delete R[k]; R.v=2; }   /* 舊的 AA_351 紀錄：進行到一半的場次清掉 */
    if(!R.th||typeof R.th!=='object') R.th={}; if(!Array.isArray(R.outs)) R.outs=[]; if(!R.wk||typeof R.wk!=='object') R.wk={}; if(!Array.isArray(R.log)) R.log=[]; if(!R.tripSeen||typeof R.tripSeen!=='object') R.tripSeen={};
    return R; };
  /* ---------- 誰會走、什麼時候 ---------- */
  S.span=()=>{ const a=CALENDAR.termDays('Y2S1'), b=CALENDAR.termDays('Y4S2'); return a&&b?[a.from,b.to]:null; };
  S.inRange=(G,day)=>{ const s=S.span(), d=day==null?G.day:day; return !!s&&d>=s[0]&&d<=s[1]; };
  S.solo=G=>{ const P=typeof ROM!=='undefined'&&ROM.partners?ROM.partners(G):[]; return P.length===1&&P[0]===KX; };
  /* 交換那一學期（日本路線大三下、美國路線大四上），人在國外的日子也算 */
  S.exch=function(G,day){ const r=STORY.routeAbroadRoute?STORY.routeAbroadRoute(G):null; if(!r) return false; const t=termOf(day);
    if(t&&((r==='JP'&&t.id==='Y3S2')||(r==='US'&&t.id==='Y4S1'))) return true; return !!(STORY.abroad&&STORY.abroad(Object.assign({},G,{day}))); };
  S.on=G=>!!G&&!!G.flags&&law(G)&&G.flags.dating_kexin===true&&S.solo(G)&&S.inRange(G)&&!S.exch(G,G.day);   /* 交換那一學期：整包不演、數字凍結 */
  S.inTerm=(G,d)=>!!termOf(d)&&!S.exch(G,d);   /* 學期中、不在交換那一學期 */
  S.okD4=(G,d)=>{ const t=termOf(d); return !!t&&t.id!=='Y4S2'&&!S.exch(G,d); };   /* D4、D5：不在寒暑假、交換、大四下 */
  S.idx=t=>S.TERMS.indexOf(t);
  /* ---------- 數字 ---------- */
  S.crack=G=>+((G.flags||{}).KX_CRACK)||0;
  S.add=function(G,n,why){ if(!n||typeof ROM==='undefined'||!ROM.crack||!S.on(G)) return 0; const c=S.crack(G); let d=n; if(n<0){ d=-Math.min(c,-n); if(!d) return 0; }   /* 最低 0；停住、交換＝凍結 */
    ROM.crack(G,KX,d); const R=S.rec(G); R.log.push({d:G.day,h:+(+G.hour||0).toFixed(2),n:d,why:why||''}); if(R.log.length>40) R.log.splice(0,R.log.length-40); S.th(G,R); return d; };
  S.capUsed=(G,k)=>S.rec(G).wk[k]===monOf(G.day);
  S.minus=function(G,k,why){ if(S.crack(G)<=0||S.capUsed(G,k)) return 0; const d=S.add(G,-1,why); if(d) S.rec(G).wk[k]=monOf(G.day); return d; };   /* 一週最多一次（已經是 0 不用掉這一週的次數）*/
  /* 第一次到 2、4、6（降下去再上來不重演）；修補成功以後又到 6＝直接 D5 */
  S.th=function(G,R){ if(!S.on(G)) return; R=R||S.rec(G); const c=S.crack(G), t=now(G);
    if(c>=2&&R.th[2]==null){ R.th[2]=t; S.r2Start(G,R,'th'); }
    if(c>=4&&R.th[4]==null){ R.th[4]=t; if(!R.r3) R.r3={st:'pending',at:t}; }
    if(c>=6&&R.th[6]==null&&!G.flags.KX_REPAIRED){ R.th[6]=t; if(!R.r4) R.r4={st:'pending',at:t}; }
    if(c>=6&&G.flags.KX_REPAIRED&&!R.r5){ if(R.th[6]==null) R.th[6]=t; R.r5={st:'pending',at:t,via:'again'}; } };
  const takePick=(G,key)=>{ const v=G.flags.KXD_PICK; delete G.flags.KXD_PICK; if(typeof v!=='string') return null; const [a,b]=v.split(':'); return a===key?+b:null; };

  /* ---------- 她不爽的那一天：找她說話、或打給她＝沒事；到 24:00 都沒有＝+1 ---------- */
  S.upsetStart=(G,R,src)=>{ R.upset={day:G.day,src,met:false,hit:false}; };
  S.upsetToday=G=>{ const u=S.rec(G).upset; return !!u&&u.day===G.day&&!u.met&&!u.hit; };
  S.upsetMet=G=>{ const u=S.rec(G).upset; if(u&&u.day===G.day){ u.met=true; if(typeof OUT!=='undefined'){ const q=OUT.get(G,'kx_drift_upcall_'+u.day); if(q&&q.state==='planned') q.state='skipped'; } } };
  S.upsetLine=G=>{ const u=S.rec(G).upset; return u&&u.src==='r1c'?S.L.upsetR1c:S.L.upset; };
  S.UPCALL={ev:'ev_kx_drift_upcall',place:'電話',title:'打給可昕',verb:'打給她',no:'先不打',call:true,travel:'',travelH:0,back:'電話結束。',alarm:false};   /* 同 aa525_3d.js 的 KX_CALL_OUT */
  S.upsetTick=function(G,R){ const u=R.upset; if(!u||u.met||u.hit) return;
    if(G.day>u.day){ u.hit=true; S.add(G,1,'upset'); return; }
    if(G.day===u.day&&(+G.hour||0)>=18&&typeof OUT!=='undefined'&&!OUT.get(G,'kx_drift_upcall_'+u.day)){ const h=Math.max(18,+G.hour||0); if(h<23.5) OUT.plan(G,Object.assign({},S.UPCALL,{id:'kx_drift_upcall_'+u.day,day:u.day,h,late:23.75-h})); } };

  /* ---------- D0：跟可昕說一聲 ---------- */
  S.dayWord=(G,day)=>day===G.day?'今天':(day===G.day+1?'明天':'週'+'日一二三四五六'[wdOf(day)]);
  S.d0Text=(G,x)=>S.L.d0.say.replace('{週幾}',S.dayWord(G,x.day)).replace('{她}',nm(x.who)).replace('{地點}',x.place||'');
  S.replyAt=G=>typeof MSG!=='undefined'&&MSG.replyAt?MSG.replyAt(G,KX):{day:G.day,h:(+G.hour||0)%24+0.1};
  S.register=function(G,o){ const R=S.rec(G); let x=R.outs.find(y=>y.k===o.k&&y.id===o.id); if(x) return x; x=Object.assign({told:false,st:'live',at:now(G)},o); R.outs.push(x);
    R.outs=R.outs.filter(y=>y.st==='live'||G.day-y.day<=40); return x; };
  S.offerTell=async function(GM,o){ const G=GM.G; if(!S.on(G)||!S.HER.includes(o.who)) return null; const R=S.rec(G); if(R.outs.some(y=>y.k===o.k&&y.id===o.id)) return null;
    const x=S.register(G,o); const k=await GM.choose([{t:S.L.d0.opt},{t:S.L.d0.no}]); if(k===0) await S.tell(GM,x); return x; };
  S.tell=async function(GM,x){ const G=GM.G, R=S.rec(G), text=S.d0Text(G,x); x.told=true; x.toldAt=now(G);
    if(typeof PHONE!=='undefined'){ PHONE.post(G,{th:TH,from:'player',who:null,text}); const L=S.L.d0.reply, i=(R.d0n|0)%L.length, at=S.replyAt(G); R.d0n=(R.d0n|0)+1; PHONE.at(G,at.day,at.h,[K(L[i])],null); }   /* 她回：照順序輪 */
    await GM.say({name:(G.name||'祐廷')+'（手機）'},text); S.add(G,-1,'d0'); return true; };
  /* D1 的地點：公館、溫州街、校園（AA_876 D1）；其他地方（新生南路、118 巷以外的）不演 D1 */
  S.AREA=z=>{ z=String(z||''); if(z==='noodle'||z==='gongguan'||z==='yangyang'||z==='daybreak'||/^l118_/.test(z)||z==='lane118') return '公館';
    if(z==='wenzhou'||/^wz_/.test(z)||z==='cafe') return '溫州街'; if(z==='campus'||z==='linze'||z==='library'||z==='lake') return '學校'; return null; };
  S.invSolo=function(iv){ if(typeof INV==='undefined'||!iv||iv.by==='npc') return false; const P=INV.place(iv.place), D=typeof INVITE_DATA!=='undefined'?INVITE_DATA:{};
    return !!P&&S.HER.includes(iv.who)&&((D.soloKinds||[]).includes(P.kind)||(D.soloPlaces||[]).includes(P.id)); };
  S.invTell=async function(GM,iv){ if(!iv||iv.kxd) return null; iv.kxd=1; const G=GM.G; if(!S.on(G)) return null;
    if(iv.who===KX){ if(iv.by!=='npc') S.minus(G,'invite','invite_inv'); return null; }   /* 祐廷主動約她、她答應 −1（一週最多一次）*/
    if(!S.invSolo(iv)) return null; const P=INV.place(iv.place);
    return S.offerTell(GM,{k:'inv',id:iv.id,who:iv.who,place:P.name,area:S.AREA(P.zone),day:iv.day}); };
  S.dateTell=async function(GM,t){ const G=GM.G; if(!t||!t.who) return null; if(t.who===KX){ if(S.on(G)) S.minus(G,'invite','invite_date'); return null; }
    if(!S.on(G)||!S.HER.includes(t.who)) return null; const names=(t.locs||[]).map(l=>(typeof DATE!=='undefined'&&DATE.loc&&(DATE.loc(l)||{}).name)||l).join('、');
    return S.offerTell(GM,{k:'date',id:t.trip,who:t.who,place:names,area:null,day:t.day}); };
  S.hvTell=async function(GM,id,day){ const G=GM.G; if(day==null) return null; if(id===KX){ if(S.on(G)) S.minus(G,'invite','invite_hv'); return null; } if(!S.on(G)||!S.HER.includes(id)) return null;
    const key=typeof HV!=='undefined'&&HV.key?HV.key(G,id,day):id, HL=typeof HOMETOWN_LINES!=='undefined'?HOMETOWN_LINES:{}, C=HL[key]||HL[id]||{};
    return S.offerTell(GM,{k:'hv',id:'hv_'+id+'_'+day,who:id,place:C.city||'',area:null,day}); };

  /* ---------- 單獨出去的那一次真的去了：D1、D1b ---------- */
  S.scanOuts=function(G,R){ for(const x of R.outs){ if(x.st!=='live') continue; let st=null;
      if(x.k==='inv'){ const iv=typeof INV!=='undefined'&&INV.byId?INV.byId(G,x.id):null; if(!iv) st='gone'; else if(iv.state==='done'){ st='done'; x.day=iv.day; } else if(['missed','cancelled','declined'].includes(iv.state)) st='gone'; else if(iv.day!==x.day) x.day=iv.day; }
      else if(x.k==='date'){ const t=typeof DATE!=='undefined'&&DATE.trip?DATE.trip(G,x.id):null, q=typeof OUT!=='undefined'?OUT.get(G,'date_'+x.id):null; if(!t) st='gone';
        else if(t.status==='done'||(q&&q.state==='done')){ st='done'; x.day=t.day; } else if(t.status==='missed'||t.status==='cancelled') st='gone'; else if(t.day!==x.day) x.day=t.day; }
      else if(x.k==='hv'){ const q=typeof OUT!=='undefined'?OUT.get(G,x.id):null; if(!q) st='gone'; else if(q.state==='done') st='done'; else if(q.state==='missed'||q.state==='skipped') st='gone'; }
      if(st==='gone'){ x.st='gone'; continue; } if(st==='done'){ x.st='done'; S.soloDone(G,R,x); } } };
  S.soloDone=function(G,R,x){ if(!S.on(G)||S.exch(G,x.day)) return;
    if(!x.told&&x.area){ const tk=termAt(x.day); if(R.r1Term!==tk&&termOf(x.day)){ R.r1Term=tk; R.r1={area:x.area,day:x.day,st:'due',out:x.id}; } }   /* D1：每學期只演第一次；隔天在系館 */
    const cnt=R.outs.filter(y=>y.st==='done'&&y.who===x.who&&Math.abs(x.day-y.day)<S.R1B_DAYS).length;
    if(cnt>=2&&!R.r1bPend&&R.r1bTerm!==termAt(G.day)) R.r1bPend={who:x.who,day:x.day}; };
  S.ambig=(G,id)=>typeof DATE!=='undefined'&&!!DATE.stageNum&&DATE.stageNum(id)>=5;   /* 她和祐廷真的在曖昧（DATE 第 5 階以上）：D1b 不演 */

  /* ---------- 和可昕的出遊、約會 ---------- */
  S.isKx=function(G,q,ev){ if(!q) return false; const id=String(q.id||'');
    if(q.dateTrip) return !!(typeof DATE!=='undefined'&&DATE.trip&&(DATE.trip(G,q.dateTrip)||{}).who===KX);
    if(q.hv) return q.hv.id===KX; if(q.te) return q.te.who===KX; if(q.pgWho===KX||/^kx_/.test(id)) return true;
    const e=ev||evOf(q.ev); return !!(e&&(e.participants||[]).includes(KX)); };
  S.kind=function(G,q,ev){ if(!S.isKx(G,q,ev)) return null; const e=ev||evOf(q.ev), d0=e&&Array.isArray(e.dialogue)?e.dialogue.find(l=>l&&l.scene!==undefined):null;
    if(q.call||(d0&&d0.scene==='電話')) return 'call'; if(q.verb==='接起來'||q.place==='視訊') return 'video'; return 'meet'; };
  S.arrive=function(G,q){ const late=now(G)-T(q.day,q.h); if(late>0.25+1e-6) return S.add(G,1,'late'); return S.minus(G,'arrive','ontime'); };   /* 準時到 −1（一週最多一次）、遲到超過 15 分鐘 +1 */
  /* D1b：單獨和她在一起的時候她直接問 */
  S.r1bPlay=async function(GM){ const G=GM.G, R=S.rec(G), p=R.r1bPend; if(!p||!S.on(G)) return false; const tk=termAt(G.day);
    if(R.r1bTerm===tk||!S.HER.includes(p.who)||S.ambig(G,p.who)){ R.r1bPend=null; return false; }
    R.r1bPend=null; R.r1bTerm=tk; const E=evOf('ev_kx_drift_r1b'); if(!E||typeof EVENTS==='undefined'||!EVENTS.runLines) return false; G.flags.KXD_HER=nm(p.who);
    try{ await EVENTS.runLines(E.dialogue,E); } finally { delete G.flags.KXD_HER; }
    if(takePick(G,'r1b')===1) S.add(G,1,'r1b'); return true; };
  /* 修補成功：之後第一次單獨和她在一起，她說一次 */
  S.repairSay=async function(GM){ const G=GM.G, F=G.flags||{}, R=F.KX_DRIFT; if(!R||!F.KX_REPAIRED||R.repairSaid!=null||F.dating_kexin!==true) return false;
    R.repairSaid=G.day; await GM.say({name:nm(KX),charId:KX},S.L.repair); return true; };
  S.before=async function(GM,q,ev){ const G=GM&&GM.G; if(!G||!G.flags||!law(G)) return; const kind=S.kind(G,q,ev); if(kind!=='meet') return; const id=String(q.id||'');
    if(G.flags.dating_kexin===true&&S.inRange(G)) S.rec(G).seen=G.day;
    if(!S.on(G)||/^kx_drift_/.test(id)) return;
    S.arrive(G,q); await S.r1bPlay(GM); };
  S.missed=function(G,q){ if(!G||!q||!S.on(G)) return 0; const id=String(q.id||''); if(/^kx_drift_/.test(id)||q.dateTrip) return 0; if(S.kind(G,q,null)!=='meet') return 0;
    if(q.hv&&q.hv.id===KX) return S.add(G,1,'missed_hv'); if(q.ask!=null||q.te) return S.add(G,1,'missed'); return 0; };
  S.scanTrips=function(G,R){ for(const t of ((G&&G.trips)||[])){ if(!t||t.who!==KX||R.tripSeen[t.trip]) continue;
      if(t.status==='missed'||t.status==='cancelled'){ R.tripSeen[t.trip]=1; if(t.day<=G.day) S.add(G,1,'missed_date'); } else if(t.status==='done') R.tripSeen[t.trip]=1; } };

  /* ---------- D2 冷一陣子 ---------- */
  S.r2Busy=R=>!!R.r2&&R.r2.st==='short';
  S.r2Start=function(G,R,src){ R=R||S.rec(G); if(S.r2Busy(R)) return false; R.r2={st:'short',src,at:now(G),day:G.day,n:((R.r2&&R.r2.n)|0)+1}; return true; };
  S.r2Due=G=>{ const R=S.rec(G), r=R.r2; return S.on(G)&&!!r&&r.st==='short'&&G.day>=r.day+3&&S.inTerm(G,G.day); };
  /* ---------- 修補期 ---------- */
  S.repairTick=function(G,R){ if(R.repairEnd==null||R.repairDone!=null||G.day<R.repairEnd) return; R.repairDone=G.day;
    if(S.crack(G)<6) G.flags.KX_REPAIRED=true; else if(!R.r5) R.r5={st:'pending',at:now(G),via:'repair'}; };
  /* ---------- D5 分開（只在學期末）---------- */
  S.examDay=function(G,term){ const R=S.rec(G), C=R.ex&&typeof R.ex==='object'?R.ex:(R.ex={}); if(C[term]!=null) return C[term]; const r=CALENDAR.termDays(term); if(!r) return null; let d=null, h=12;
    try{ const e=typeof CLS!=='undefined'&&CLS.lastExamEnd?CLS.lastExamEnd(G,term,'final'):null; if(e&&e.day!=null){ d=e.day; if(e.h!=null) h=+e.h; } }catch(e){ d=null; }
    if(d==null||d<r.to-9){ d=r.to-2; h=12; } if(d>r.to-1) d=r.to-1; C[term]={day:d,h}; return C[term]; };
  S.r5AskOk=function(G){ const R=S.rec(G), r=R.r5; if(!r||r.st!=='pending'||!S.on(G)) return false; const t=termOf(G.day); if(!t||!S.okD4(G,G.day)||r.skip===t.id) return false;
    const ex=S.examDay(G,t.id), to=(CALENDAR.termDays(t.id)||{}).to; if(!ex||to==null) return false;
    return G.day>=ex.day&&G.day<to&&(G.day>ex.day||(+G.hour||0)>=ex.h); };   /* 期末考最後一天考完起；隔天她還在臺北 */
  S.r5Rule=function(G,R){ const r=R.r5; if(!r) return;
    if(r.st==='text'&&(G.msgs||[]).some(m=>m&&m.tag==='kx_drift_r5_text')) S.end(G,'text'); };
  S.end=function(G,how){ const F=G.flags, R=S.rec(G); if(F.KX_ENDED==='drift'||F.dating_kexin!==true||typeof ROM==='undefined') return false;
    ROM.end(G,KX,'drift'); F.KX_ENDED='drift'; F.KX_ENDED_ON=G.day; if(R.r5){ R.r5.st='done'; R.r5.how=how; } else R.r5={st:'done',how}; R.r6={st:'wait'}; S.cancelHer(G); return true; };
  S.cancelHer=function(G){ if(typeof OUT!=='undefined') for(const q of OUT.rec(G)){ if(q.state!=='planned'||/^kx_drift_/.test(String(q.id||''))) continue; if(S.isKx(G,q,null)) q.state='skipped'; }
    for(const t of (G.trips||[])) if(t&&t.who===KX&&(t.status==='booked'||t.status==='going')) t.status='cancelled';
    if(typeof PHONE!=='undefined'&&PHONE.rec){ const P=PHONE.rec(G), mine=it=>!!it&&(PHONE.th?PHONE.th(it):(it.th||''))===TH;   /* 只拿掉她那一段（p:kexin）排著的；群組裡她的照送 */
      P.q=(P.q||[]).filter(q=>{ if(/^kx_drift_/.test(String(q.tag||''))) return true; const its=q.items||[], keep=its.filter(it=>!mine(it)); if(keep.length===its.length) return true; q.items=keep; return keep.length>0; }); } };
  /* ---------- D6：從下學期開學日起算 60 天（只算兩個人都在學校的日子）---------- */
  S.nextTermFrom=E=>{ for(const id of S.ALL_TERMS){ const r=CALENDAR.termDays(id); if(r&&r.from>E) return r.from; } return null; };
  S.r6Count=function(G,r){ if(r.from==null) return 0; if(r.cd==null){ r.cd=r.from; r.n=0; } let k=0; while(r.cd<=G.day&&k++<900){ const d=r.cd; r.cd++; if(S.inTerm(G,d)) r.n=(r.n|0)+1; } return r.n|0; };
  S.r6Rule=function(G){ const F=G.flags, R=S.rec(G), r=R.r6||(R.r6={st:'wait'}), E=F.KX_ENDED_ON; if(E==null) return;
    if(r.st==='wait'){ if(r.from==null) r.from=S.nextTermFrom(E); if(r.from==null) return; if(S.r6Count(G,r)>S.D6_QUIET) r.st='ready'; } };   /* 第 61 天起 */
  S.quiet=G=>{ const F=G.flags||{}, R=F.KX_DRIFT; return F.KX_ENDED==='drift'&&F.dating_kexin!==true&&!!R&&!!R.r6&&R.r6.st!=='friend'; };
  S.drift=G=>!!G&&!!G.flags&&G.flags.KX_ENDED==='drift'&&G.flags.dating_kexin!==true&&law(G);
  S.frOn=G=>{ if(!S.drift(G)) return false; const R=G.flags.KX_DRIFT; return !!R&&!!R.r6&&R.r6.st==='friend'; };   /* v6ex3d.js 讀它：D6 那頓吃過＝照朋友 */

  /* ---------- 規則（STORY.PHONE_RULES：空下來的每一格、跳過時間每小時）---------- */
  S.rule=function(G){ if(!G||!G.flags||!law(G)) return; const F=G.flags;
    if(F.KX_ENDED==='drift'&&F.dating_kexin!==true){ S.r6Rule(G); return; }
    if(F.dating_kexin!==true||!S.inRange(G)) return; const R=S.rec(G);
    if(!S.solo(G)){ S.freeze(G,R); return; }   /* 中途開始了另一段：停住、數字凍結 */
    if(S.exch(G,G.day)) return;
    S.scanOuts(G,R); S.scanTrips(G,R); S.upsetTick(G,R); S.th(G,R); S.repairTick(G,R); S.r5Rule(G,R); };
  S.freeze=function(G,R){ if(typeof OUT==='undefined') return; for(const q of OUT.rec(G)){ const id=String(q.id||''); if(q.state!=='planned'||!/^kx_drift_(r4|r5|upcall)/.test(id)) continue; q.state='skipped';
      if(id==='kx_drift_r4'&&R.r4) R.r4.st='pending'; if(id==='kx_drift_r5'&&R.r5) R.r5.st='pending'; } };

  /* ---------- 各場的結果 ---------- */
  S.after=function(G,GM,q,key){ const R=S.rec(G), k=takePick(G,key);
    if(key==='r1'){ if(R.r1) R.r1.st='done'; if(k===1||k===2){ S.add(G,k,'r1'); S.upsetStart(G,R,'r1'); S.r2Start(G,R,'r1'); } return; }   /* +0／+1／+2；吵起來＝她不爽的那一天＋D2 */
    if(key==='r1c'){ R.r1cTerm=termAt(G.day); if(k===0) S.add(G,-1,'r1c'); if(k===2){ S.add(G,1,'r1c'); S.upsetStart(G,R,'r1c'); } return; }
    if(key==='r2'){ if(R.r2) R.r2.st='done'; if(k===1){ S.add(G,1,'r2'); S.upsetStart(G,R,'r2'); } return; }
    if(key==='r3'){ if(R.r3) R.r3.st='done'; if(k===2) S.add(G,1,'r3'); return; }
    if(key==='r4ask'){ const r=R.r4; if(!r) return;
      if(k===0){ r.st='planned'; r.day=G.day; OUT.plan(G,{id:'kx_drift_r4',ev:'ev_kx_drift_r4',day:G.day,h:18,late:0.75,place:S.L.r4.scene,title:'和可昕：'+S.L.r4.scene,travel:'走路約 15 分鐘',travelH:0.25,alarm:true}); return; }
      if(r.st==='asked2'){ r.st='declined'; R.r4Pick='decline'; if(!R.r5) R.r5={st:'pending',at:now(G),via:'r4'}; return; }   /* 再不行＝她「好。」，直接等 D5 */
      r.st='asked2'; r.askDay=G.day; return; }   /* 不行＝「那明天。」：隔天再約一次 */
    if(key==='r4'){ if(R.r4) R.r4.st='done'; R.r4Pick=k;
      if(k===0&&typeof ROM!=='undefined'&&ROM.mend) ROM.mend(G,KX);   /* 歸零、進修補期 */
      if(k===0||k===1) R.repairEnd=(q?q.day:G.day)+S.REPAIR; else if(!R.r5) R.r5={st:'pending',at:now(G),via:'r4'}; return; }
    if(key==='r5ask'){ const r=R.r5; if(!r) return; const m=G.day+1; r.st='planned'; r.term=termAt(G.day); r.day=m;
      if(typeof OUT!=='undefined'){ for(const x of OUT.rec(G)) if(x.state==='planned'&&x.day===m&&!/^kx_drift_/.test(String(x.id||''))&&S.isKx(G,x,null)) x.state='skipped';   /* 那一天她的別的出遊取消（她已經想好了）*/
        OUT.plan(G,{id:'kx_drift_r5',ev:'ev_kx_drift_r5',day:m,h:19,late:1,place:S.L.r5.scene,title:'和可昕：'+S.L.r5.scene,travel:'走路約 5 分鐘',travelH:0.1,alarm:true}); } return; }
    if(key==='r5'){ S.end(G,'meet'); return; }
    if(key==='r5c'){ S.end(G,'call'); return; }
    if(key==='r6'){ const r=R.r6||(R.r6={}); r.st='friend'; r.friend=G.day; return; }
    if(key==='up'){ S.upsetMet(G); return; } };
  S.miss=function(G,GM,q,key){ const R=S.rec(G);
    if(key==='r4'){ if(R.r4) R.r4.st='missed'; R.r4Pick='noshow'; if(!R.r5) R.r5={st:'pending',at:now(G),via:'r4'}; return; }   /* 沒到：等 D5（+0）*/
    if(key==='r5'){ if(R.r5) R.r5.st='call'; OUT.plan(G,{id:'kx_drift_r5_call',ev:'ev_kx_drift_r5_call',day:q.day,h:21,late:0.5,place:'電話',verb:'接起來',no:'先不接',title:'可昕打電話來',call:true,travel:'',travelH:0,back:'電話掛了。',alarm:true,silent:true}); return; }   /* 八點還沒來：九點她打來 */
    if(key==='r5c'){ if(R.r5) R.r5.st='text'; PHONE.at(G,q.day+1,12,[K(S.L.r5.text)].concat(S.L.r5.talk.map(K)),'kx_drift_r5_text'); return; } };   /* 電話也沒接：隔天中午文字版 */

  /* ---------- 事件（STORY_EVENTS）---------- */
  const say=t=>/^（/.test(t)?{speaker:null,text:t}:{speaker:KX,text:t};
  const choiceBlock=(key,opts)=>{ const out=[{choice:opts.map((o,i)=>({text:o.t,set:{KXD_PICK:key+':'+i},goto:key+'_'+i}))}];
    opts.forEach((o,i)=>{ out.push({label:key+'_'+i}); for(const t of o.say) out.push(say(t)); out.push({goto:key+'_end'}); }); out.push({label:key+'_end'}); return out; };
  const L=S.L, R0=G=>S.rec(G);
  const area=G=>(R0(G).r1||{}).area||'公館';
  const enter=(id,dlg,key,o)=>Object.assign({id,title:'',participants:[KX],location:'linze',trigger:'enter',background:'blur',dialogue:dlg,after:G=>S.after(G,null,null,key)},o||{});
  const out=(id,hours,key,dlg)=>({id,title:'',participants:[KX],location:'any',trigger:'outing',background:'dark',hours,kxAway:true,
    dialogue:dlg,afterOuting:(G,GM,q)=>S.after(G,GM,q,key),outingMissed:(G,GM,q)=>S.miss(G,GM,q,key)});
  const termIdx=G=>S.idx(termAt(G.day));
  S.EVS=[
    enter('ev_kx_drift_r1',[say(L.r1.open)].concat(Object.keys(L.r1.where).map(a=>Object.assign({if:{custom:G=>area(G)===a}},say(L.r1.where[a]))),L.r1.lines.map(say),choiceBlock('r1',L.r1.opts)),'r1',
      {time:[7,20],prereq:{custom:G=>{ const r=R0(G).r1; return S.on(G)&&!!r&&r.st==='due'&&G.day===r.day+1&&S.inTerm(G,G.day); }}}),
    {id:'ev_kx_drift_r1b',title:'',participants:[KX],location:'any',trigger:'outing',background:'dark',dialogue:L.r1b.lines.map(t=>say(t.replace('{她}','{flag:KXD_HER}'))).concat(choiceBlock('r1b',L.r1b.opts))},   /* 不自己觸發（沒有排這個出遊）：單獨和她在一起的開頭用 EVENTS.runLines 演（S.r1bPlay）*/
    enter('ev_kx_drift_r1c',L.r1c.lines.map(say).concat(choiceBlock('r1c',L.r1c.opts)),'r1c',
      {weeks:[5],carryTo:12,time:[9,18],random_weight:0.35,prereq:{custom:G=>S.on(G)&&termIdx(G)>=0&&R0(G).r1cTerm!==termAt(G.day)&&S.inTerm(G,G.day)}}),
    {id:'ev_kx_drift_upset',title:'',participants:[KX],location:'any',trigger:'interact',priority:50,background:'blur',
      prereq:{custom:G=>!!G.flags&&G.flags.dating_kexin===true&&S.upsetToday(G)},
      dialogue:[Object.assign({if:{custom:G=>(R0(G).upset||{}).src==='r1c'}},say(L.upsetR1c)),Object.assign({unless:{custom:G=>(R0(G).upset||{}).src==='r1c'}},say(L.upset))],after:G=>S.after(G,null,null,'up')},
    out('ev_kx_drift_upcall',0.25,'up',[{scene:'電話'},Object.assign({if:{custom:G=>(R0(G).upset||{}).src==='r1c'}},say(L.upsetR1c)),Object.assign({unless:{custom:G=>(R0(G).upset||{}).src==='r1c'}},say(L.upset))]),
    enter('ev_kx_drift_r2',[say(L.r2.gate),{scene:L.r2.scene,bg:'dark'}].concat(L.r2.lines.map(say),choiceBlock('r2',L.r2.opts)),'r2',{time:[12,19],prereq:{custom:G=>S.r2Due(G)}}),
    enter('ev_kx_drift_r3',L.r3.lines.map(say).concat(choiceBlock('r3',L.r3.opts)),'r3',
      {time:[18,23],prereq:{custom:G=>{ const r=R0(G).r3; return S.on(G)&&!!r&&r.st==='pending'&&termIdx(G)>=S.idx('Y2S2')&&S.inTerm(G,G.day)&&!S.r2Busy(R0(G)); }}}),
    enter('ev_kx_drift_r4ask',[say(L.r4.ask),
        {choice:[{text:L.r4.askOpts[0],set:{KXD_PICK:'r4ask:0'},goto:'a_yes'},{text:L.r4.askOpts[1],set:{KXD_PICK:'r4ask:1'},goto:'a_no'}]},
        {label:'a_no'},Object.assign({if:{custom:G=>(R0(G).r4||{}).st==='asked2'}},say(L.r4.ok)),Object.assign({unless:{custom:G=>(R0(G).r4||{}).st==='asked2'}},say(L.r4.tomorrow)),{label:'a_yes'}],'r4ask',
      {time:[10,17],prereq:{custom:G=>{ const r=R0(G).r4; return S.on(G)&&!!r&&(r.st==='pending'||(r.st==='asked2'&&G.day>r.askDay))&&S.okD4(G,G.day)&&!S.r2Busy(R0(G)); }}}),
    out('ev_kx_drift_r4',1.5,'r4',[{scene:L.r4.scene,bg:'riverside'}].concat(L.r4.lines.map(say),choiceBlock('r4',L.r4.opts))),
    {id:'ev_kx_drift_r5ask',title:'',participants:[KX],location:'any',trigger:'enter',background:'blur',dialogue:[say(L.r5.ask)],prereq:{custom:G=>S.r5AskOk(G)},after:G=>S.after(G,null,null,'r5ask')},
    out('ev_kx_drift_r5',0.75,'r5',[{scene:L.r5.scene,bg:'dark'},say(L.r5.open)].concat(L.r5.talk.map(say),choiceBlock('r5',L.r5.opts),L.r5.close.map(say))),
    out('ev_kx_drift_r5_call',0.25,'r5c',[{scene:'電話'}].concat(L.r5.talk.map(say),choiceBlock('r5c',L.r5.opts),L.r5.callClose.map(say))),
    enter('ev_kx_drift_r6',[say(L.r6.ask),{scene:L.r6.scene,bg:'dark'}].concat(L.r6.lines.map(say)),'r6',
      {time:[8,13],prereq:{custom:G=>{ const r=(G.flags.KX_DRIFT||{}).r6; return S.drift(G)&&!!r&&r.st==='ready'&&!!termOf(G.day); }}}) ];
  /* ev_kx_drift_r1b 用 trigger 'outing'、不排出遊：EVENTS.onEnter／onInteract 不會挑到它 */
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);

  /* ---------- 掛上去（包住別的系統；不改那些檔）---------- */
  const once=!STORY._kxd2; STORY._kxd2=true;
  if(once&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.rule(G));
  if(typeof ROM!=='undefined'&&ROM.canStart&&!ROM._kxd2){ ROM._kxd2=true; const cs0=ROM.canStart; ROM.canStart=function(G,id){ if(id===KX&&G&&G.flags&&G.flags.KX_ENDED==='drift') return false; return cs0.apply(this,arguments); }; }   /* 不能復合 */
  if(typeof OUT!=='undefined'){
    if(once&&Array.isArray(OUT.BEFORE)) OUT.BEFORE.push((GM,q,ev)=>S.before(GM,q,ev));
    if(once&&Array.isArray(OUT.AFTER)) OUT.AFTER.push(async(GM,q,ev)=>{ const G=GM&&GM.G; if(!G||!q||/^kx_drift_/.test(String(q.id||''))||S.kind(G,q,ev)!=='meet') return; await S.repairSay(GM); });
    if(OUT.onMissed&&!OUT._kxd2){ OUT._kxd2=true; const m0=OUT.onMissed; OUT.onMissed=function(GM,q){ try{ S.missed(GM&&GM.G,q); }catch(e){ console.warn('KXDRIFT.missed',e); } return m0.apply(this,arguments); }; } }
  if(typeof INV!=='undefined'&&INV.flow&&!INV._kxd2){ INV._kxd2=true; const fl0=INV.flow, st0=INV.startTogether;
    INV.flow=async function(GM,id,n,together){ const r=await fl0.apply(this,arguments); try{ if(r&&typeof r==='object'&&/^iv/.test(String(r.id||''))&&(r.state==='accepted'||r.state==='going')) await S.invTell(GM,r); }catch(e){ console.warn('KXDRIFT.flow',e); } return r; };
    if(st0) INV.startTogether=async function(GM,iv,n){ try{ if(iv&&!iv.kxd) await S.invTell(GM,iv); if(iv&&iv.who===KX&&GM&&GM.G&&GM.G.flags&&GM.G.flags.dating_kexin===true){ await S.r1bPlay(GM); await S.repairSay(GM); } }catch(e){ console.warn('KXDRIFT.startTogether',e); } return st0.apply(this,arguments); }; }   /* 和她單獨的邀約開始：D1b、修補成功那一句 */
  if(typeof DATE!=='undefined'&&DATE.menu&&!DATE._kxd2){ DATE._kxd2=true; const dm0=DATE.menu; DATE.menu=async function(GM,id,n){ const t=await dm0.apply(this,arguments); try{ if(t&&t.ok&&t.trip) await S.dateTell(GM,t); }catch(e){ console.warn('KXDRIFT.date',e); } return t; }; }
  if(typeof HV!=='undefined'&&HV.ask&&!HV._kxd2){ HV._kxd2=true; const ha0=HV.ask, hm0=HV.museumAsk;
    HV.ask=async function(GM,id){ const d=await ha0.apply(this,arguments); try{ if(typeof d==='number') await S.hvTell(GM,id,d); }catch(e){ console.warn('KXDRIFT.hv',e); } return d; };
    if(hm0) HV.museumAsk=async function(GM,id){ const d=await hm0.apply(this,arguments); try{ if(typeof d==='number') await S.hvTell(GM,id,d); }catch(e){ console.warn('KXDRIFT.hv',e); } return d; }; }
  if(typeof TERMEND!=='undefined'&&TERMEND.plan&&!TERMEND._kxd2){ TERMEND._kxd2=true; const tp0=TERMEND.plan;   /* 分開了、或這個學期末演 D5：可昕的學期末約會不排 */
    TERMEND.plan=function(G,w){ const P=tp0.apply(this,arguments); try{ if(P&&P.kx){ const F=G.flags||{}, r5=F.KX_DRIFT&&F.KX_DRIFT.r5;
        if(F.KX_ENDED==='drift'||(r5&&r5.st!=='pending'&&r5.term===w.id)) P.kx=false; } }catch(e){ console.warn('KXDRIFT.termend',e); } return P; }; }
  /* 短招呼：D2 那兩天只剩「嗨。」；D6 前 60 天只用「嗨。」和「（她朝你抬了一下下巴）」 */
  if(typeof STORY.ladGreet==='function'&&!STORY._kxd2g){ STORY._kxd2g=true; const lg0=STORY.ladGreet;
    STORY.ladGreet=function(G,id){ if(id===KX&&G&&G.flags){ const R=G.flags.KX_DRIFT;
        if(R&&G.flags.dating_kexin===true&&S.r2Busy(R)&&G.day<R.r2.day+3) return L.r2.greet;
        if(S.quiet(G)){ const i=(R.gr6|0)%L.r6.greet.length; R.gr6=(R.gr6|0)+1; return L.r6.greet[i]; } }
      return lg0.apply(this,arguments); }; }
  /* 訊息：D2 那兩天、D6 前 60 天只回短的（照順序）；分開以後照樣傳得到 */
  if(typeof MSG!=='undefined'&&MSG.send&&!MSG._kxd2){ MSG._kxd2=true; const op0=MSG.open, sd0=MSG.send;
    if(op0) MSG.open=function(G,id){ if(id===KX&&S.drift(G)) return {ok:true,mode:'kxdrift'}; return op0.apply(this,arguments); };
    MSG.send=function(G,id,topic,sub){ if(id===KX&&G&&G.flags){ const s=S.shortNow(G); if(s){ const r=S.shortSend(G,id,topic,sub,s.lines,s.key); if(r) return r; } } return sd0.apply(this,arguments); }; }
  S.shortNow=function(G){ const F=G.flags||{}, R=F.KX_DRIFT; if(!R) return null;
    if(F.dating_kexin===true&&S.r2Busy(R)&&G.day<R.r2.day+3) return {lines:L.r2.short,key:'r2si'};
    if(S.quiet(G)) return {lines:L.r6.short,key:'r6si'}; return null; };
  S.shortSend=function(G,id,topic,sub,lines,key){ if(typeof MSG==='undefined'||typeof PHONE==='undefined'||!MSG.canSend||!MSG.canSend(G,id)||!MSG.topics(G,id).some(q=>q.k===topic)) return null;
    const text=MSG.playerText(G,id,topic,sub), R=S.rec(G), i=(R[key]|0)%lines.length; R[key]=(R[key]|0)+1; PHONE.post(G,{th:TH,from:'player',who:null,text}); MSG.rec(G).sent[id]=G.day;
    const at=S.replyAt(G); PHONE.at(G,at.day,at.h,[K(lines[i])],null); return {ok:true,text,at,short:true}; };
  return S;
})();
