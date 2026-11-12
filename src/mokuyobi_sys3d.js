/* ===== 木曜日的遊戲系統與台詞（區域 wz_mokuyobi，溫州街 B4 老公寓二樓；場景 src/mokuyobi3d.js、配置 src/data/mokuyobi_layout.js 是 LAWWW2 的）=====
   企劃：AA_617 第 1、3、4 節（系統；使用者 11-03 同意）、AA_618 第 1 節 1-1～1-8（台詞，AA 定稿 D109，企劃線 ca876b23d）。台詞一字照抄（S.L、S.DATE、S.FRIEND、S.RAIN）；稿裡沒有的句子不寫。
   - 1-1 第一次進去（一個人）：走進店門（二樓、隔間牆的門以東）那一刻，兩句旁白＋老闆兩句；只一次（G.mokuyobi.first）。
   - 1-2 點東西：每一次來、第一次坐下（座位選單之前，STORY.onSeat）＋吧檯的「點東西」（配置的 interact order）；價錢照稿扣錢，點完那一樣的旁白（稿的三句各對一樣）；
     「什麼都不點」＝祐廷「只要水。」→ 老闆「（小聲）好。」。吃過的照溫州街其他店登記到 src/eat3d.js（EAT，店名「溫州街・木曜日」）。不扣時段次數、時間不往前（坐下點的）。
   - 1-3 讀書（座位都可以讀書，照兩點半／慢讀的 studySession）：讀完的旁白四句輪流（G.mokuyobi.narr；STORY.studyNarr）。
   - 1-4 老闆：同一個位子坐過三次以後，一個人進門「老位子？」（好＝走過去坐下、今天坐別的＝都可以）；21:40 還在讀書（一學期一次，STORY.onStudy 記這一段讀書的起訖）＝溫水；
     來過八次以上，點完東西以後每學期一句輪流。
   - 1-5 考試那兩週（日曆的考試週：期中第 8～9 週、期末第 16 週，term.exam）：一個人進門的旁白（一天一次）；柏翰（14:00～22:00）、明軒（週四 15:00～19:00）的作息在木曜日，
     跟他說話先說稿上那一句（一天一次，STORY.PRE_TALK）；22:00 打烊、柏翰那天在＝他問要不要去兩點半（去＝一起走過去：邀約的「現在一起過去」，到了照兩點半的見面；不去＝明天見）。
     明軒稿上是週二、週四，但木曜日週二公休：只排週四（AA_645 5-a 同意）；芯慈週一、週三 14:00～17:00、她那一句照 AA_645 5-b。
   - 打烊人還在店裡：請你出來，站在 B4 門口。一般的 22:00＝老闆一句＋旁白（AA_645 第 3 節；當晚出過 21:40 溫水＝只出旁白）；週二、颱風天、還沒開＝只寫開放時間（PLACES.hours.wz_mokuyobi）。
   - 1-6 兩個人來：src/data/invites.js 的地點 mokuyobi（答應的一句照 AA_645 第 4 節：十人各一句、沒列的人一般那句 S.ACC0）；見面那一段 S.meetScene（約的人先到＝進門旁白 S.meetLine，AA_645 第 2 節不分男女、窗邊滿了＝靠書櫃那桌；七位第一次＝第一次那一句、之後隨機一次＝那一句；朋友五位一句）。
     「點什麼」只登記在 S.DATE[id].order（稿上沒有要說出來的句子）。
   - 1-7 雨天：交往中、今天在木曜日見過面（邀約 done）、下雨、每段關係一次（G.mokuyobi.rain[人]）；按「離開木曜日」時演，兩個選項。CG 還沒有：S.RAIN_CG(id) 登錄點，CG_REGISTRY 有那張才出（ADV.cg）。
   - 1-8 深談的地點：現有的告白、和好、畢業前事件都沒有「她提議地點」那一步，這裡不改事件（報告列出來）。
   - 在木曜日（二樓店裡）說話一律加「（小聲）」：包 LIBQ.whisper（只加前綴，不做圖書館讀書區「第一次只點頭」的那一步）；稿裡已經寫了（小聲）的不重複；旁白、手機、一樓樓梯口不加；LIBQ.loud 的段落不加。
   - 老闆站在吧檯後面（STORY.populate；路人底模，不說話——他的台詞在上面的場合用「老闆」compact）。
   存檔：G.mokuyobi＝{n:來過幾次, seats:{座位編號: 坐過幾次}, last:上一次坐的座位, first, narr, water:學期, chat:{t:學期,k:第幾句}, examDay, bh, mx, rain:{人物:那天}}；
     舊存檔沒有＝game3d.js defaults 補 {n:0,seats:{}}（從零開始），壞掉的欄位 S.rec 重設。
   書櫃、唱片機、海報（配置的 interact bookcase／record／poster）：AA_645 第 1 節的旁白，每次隨機一句、不連續同一句（S.look）。
   - 考試週坐滿（BUG-MOKU-EXAM-SEATS-1110，使用者 11-10 00:3x「去木曜日說只剩吧台有位置 但明明還有空桌 吧台也沒位子」；USER_WANTS X270）：進門那一句（S.L.exam，不改）說
     「每一桌都坐了人。只剩吧檯旁邊一個位子」——考試週、開著、一個人來（S.examFull：和那一句同一組條件）的時候場景照這句：
       每一桌至少一個人（S.examSync：作息的人、已經坐著的人算；沒人的桌子放一位讀書的路人，進門時已經坐著、待著的時候從樓梯走上來；吧檯那一桌坐「坐吧檯」那一個）；
       其他空的位子＝「有人了」（桌上放東西、人不在：按鈕寫「有人了」、按了只說「有人了。」，和期末考前的圖書館 src/examlib3d.js 同一種；SEATACT.AWAY 放「休息」那一組）；
       「坐吧檯旁邊」那一個留給玩家（seat.taken＝'mokExam'：路人、照作息的人不坐；玩家的「坐下」照舊）。這段時間路人系統（CROWD）不排木曜日的客人（人由這裡放，一桌一位：最多 11 位＋老闆）。
       一起來的（約好、一起走過來）、不是考試週、打烊＝照舊（拿掉「有人了」、放開吧檯旁邊那一個）。測試：node tests/moku_exam_seats_1110_unit.js
   測試：node tests/mokuyobi_aa618_unit.js */
'use strict';
const MOKS=(function(){
  const S={}, ZONE='wz_mokuyobi';
  S.ZONE=ZONE;
  const LAY=()=>typeof MOKUYOBI_LAYOUT!=='undefined'?MOKUYOBI_LAYOUT:null;
  const BOSS={name:'老闆'};
  /* ---------- 台詞（AA_618 第 1 節，一字照抄）---------- */
  /* TEXT-QUOTE-UNIFY-1108 第四批（AA-B 2026-11-08 05:31）：對話框有名字說的（柏翰 bhAsk、bhBye；雨天 S.RAIN）不加外面的「」；選項（oldYes、oldNo、bhGo、bhHome、rainOpts 的 t）照留「」*/
  S.L={
    first:[[null,'（窄樓梯走上二樓。門上的鈴響了一下。）'],[null,'（店裡很安靜。六七個人各坐一桌，大部分在看書、寫筆記。黑膠唱片機在放鋼琴。）'],['老闆','（小聲）一位？窗邊那桌剛好空。'],['老闆','（小聲）我們沒有插座，要充電的話樓下便利商店有。']],   /* 1-1 */
    menu:[['焙茶拿鐵',150,'（焙茶拿鐵上面有一層很細的奶泡。）'],['焦糖布丁',120,'（布丁的焦糖很苦，底下很甜。）'],['巴斯克乳酪蛋糕',140,'（蛋糕外面焦得很黑，切開是軟的。）']],   /* 1-2：品項、價錢、點完的那一句 */
    none:'什麼都不點', water:'只要水。', waterOk:'（小聲）好。',
    narr:['（旁邊那桌的人翻書翻得很輕。你也跟著翻得很輕。）','（窗外的老樹在動。你讀完一章才發現天黑了。）','（筆電剩百分之二十。你把它闔上，改看紙本。）','（唱片換了一面。老闆走過去，把燈調暗一格。每張桌子的小檯燈亮了。）'],   /* 1-3 */
    old:'（小聲）老位子？', oldYes:'「好。」', oldNo:'「今天坐別的。」', oldNoBoss:'（小聲）都可以。',   /* 1-4 */
    waterNarr:'（老闆放了一杯溫水在你桌上。）', waterBoss:'（小聲）十點打烊。……慢慢收。',
    chat:['（小聲）我以前在出版社，一天看三份稿子。現在一天看三頁就好。','（小聲）那邊書櫃的書可以拿下來看，看完放回去就好。','（小聲）下雨天人比較多。大家都不想回家。'],
    exam:'（今天每一桌都坐了人。只剩吧檯旁邊一個位子。）',   /* 1-5 */
    bh:[[null,'（柏翰抬頭，指了一下旁邊的位子。）'],['classmate_bohan','（小聲）總圖位子搶不到。']],
    mx:[['classmate_mingxuan','（小聲）我七點半家教。……再讀一章就走。']],
    bhAsk:'兩點半還開。你要去嗎？', bhGo:'「去。」', bhHome:'「我回去了。」', bhBye:'嗯，明天見。',
    meet:'（她坐在窗邊那桌，已經點好了。）',   /* AA_618 1-6 原句：AA_645 第 2 節改成 S.meetLine（不分男女、名字代入），留著給對照 */
    meetFmt:'（{名字}坐在窗邊那桌，已經點好了。）', meetBook:'靠書櫃那桌', meetWin:'窗邊那桌',   /* AA_645 第 2 節 */
    look:{bookcase:['（書櫃上的書都很舊，書背褪成差不多的顏色。有一本詩集夾著別人留下的書籤。）','（最下面一層貼著一張紙：「可以拿下來看，看完請放回原位。」）','（你抽出一本小說，翻了兩頁，又放回去。旁邊那個人抬頭看了你一眼，又低頭讀書。）'],
      record:['（唱片機在轉，放的是一張沒有歌詞的鋼琴曲。）','（旁邊的木箱裡，唱片照年份一張一張排好。）','（一面放完了。老闆走過來把唱片翻面，又回到吧檯。）'],
      poster:['（《夏の残光》。海報上的女生站在海邊，看著畫面外面。下面一行小字：一九九八年上映。）','（海報的角落有一點泛黃，框是和書櫃一樣的胡桃木。）','（海報下面夾著一張手寫的小卡：「老闆看了七次。」）']},   /* AA_645 第 6 節第 3 點補第三句，三句輪流 */   /* AA_645 第 1 節（海報稿上只有兩句；第三點是 D77 的註）*/
    lookLabel:{bookcase:'看看書櫃',record:'看唱片機',poster:'看海報'},   /* 按鈕的字照配置 interact 的 label */
    /* 打烊的字（AA_645 第 3 節的 close）作廢，照 AA_700：老闆一句「我們今天要打烊了。」（XSCLOSE.say，下面 S.closeOut；當晚出過溫水也一樣）*/
    xc:[['classmate_xinci','（小聲）這裡的燈剛好，看書不累。']],   /* AA_645 5-b：進門看到芯慈 */
    rain:['（下樓的時候，外面的雨變大了。兩個人站在樓梯口的鐵門裡面。）','（巷子裡沒有人。雨打在樓下洗衣店的鐵皮上。）'],   /* 1-7 */
    rainOpts:[{t:'「等雨小一點。」',narr:'（你們站了十分鐘。雨小了，你們一起走出巷子。）',h:10/60},{t:'「我去樓下便利商店買傘。」',narr:'（你跑回來的時候，她笑了。傘只買到一把。）',h:5/60}] };
  /* 1-6：七位（第一次來，坐下以後／點什麼／在這裡聊的時候隨機一次）*/
  S.DATE={
    heroine_01:{first:'（小聲）我常來這裡讀書。……第一次跟人一起來。',order:'焙茶拿鐵',line:'（小聲）這裡沒有插座，所以我只帶紙本。……讀得比較進去。'},
    heroine_05:{first:'（小聲）大學的時候我都坐這裡。考試前一個禮拜。',order:'焙茶拿鐵，不加糖',line:'（小聲）老闆以前是編輯。我的讀書計畫他幫我改過錯字。'},
    heroine_02:{first:'（小聲）書櫃那本《挪威的森林》是中文翻譯。……我想看看他們怎麼翻。',order:'巴斯克乳酪蛋糕',line:'（小聲）翻譯最難的是安靜的句子。'},
    heroine_03:{first:'（小聲）蘇姨說這間的焙茶不錯。……我來偷學。',order:'焙茶拿鐵',line:'（小聲）比我們的苦一點。……我們的比較好喝。'},
    heroine_04:{first:'（小聲）好安靜。……我手會想打拍子。',order:'焦糖布丁',line:'（小聲）那台唱片機是真的耶。我想看他換面。'},
    classmate_peishan:{first:'（小聲）課輔班的備課我都在這裡寫。',order:'焦糖布丁',line:'（小聲）課輔班的小朋友說我寫的講義太多字。……他們說得對。'}   /* AA-B 11-07 23:40：「國中生」→「課輔班的小朋友」（國小課輔班，不寫年級）*/,
    kexin:{first:'（小聲）台北的咖啡廳都好小。……可是這間我喜歡。',order:'巴斯克乳酪蛋糕',line:'（小聲）我們學校附近沒有這種店。只有早餐店。'} };
  S.FRIEND={zhe:'（小聲）這裡我講話會被瞪吧。',classmate_bohan:'（小聲）好，讀書。',classmate_mingxuan:'（小聲）我只坐一個小時。',classmate_xinci:'（小聲）我把兩份報告都帶來了。',yu:'（小聲）好安靜……我不太習慣。……但很舒服。'};
  S.RAIN={heroine_01:'……再等一下。不急。',heroine_05:'以前我在這裡等雨，都一個人。',heroine_02:'這種雨，英文有一個字。……我想不起來。不想了。',heroine_03:'我們等它小一點。……你冷嗎？',
    heroine_04:'這個聲音可以錄起來。……算了，聽就好。',classmate_peishan:'我很喜歡下雨天。大家都會慢下來。',kexin:'台北的雨好多。……今天不討厭。'};
  S.RAIN_CG=id=>'cg_mokuyobi_rain_'+id;   /* CG「木曜日的樓梯口，雨天」（每位一張，先做以安、學姊；D127 第 2 點 BB 跟使用者要）：放進 CG_REGISTRY 以後才出 */

  /* ---------- 共用 ---------- */
  const W=G=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).wd%7:((G.weekday|0)%7);   /* 0＝週日 */
  const T_=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
  S.termKey=G=>{ const t=T_(G); if(t) return t.id; const d=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day):{y:0,m:1}; return 'B'+d.y+(d.m>=6&&d.m<=8?'S':'W'); };   /* 寒暑假：那一個假期算一段 */
  S.examWeek=G=>{ const t=T_(G); return !!(t&&t.exam); };
  const nameOf=id=>(typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  const whoOf=(GM,id)=>{ const n=GM&&GM.npc&&GM.npc[id]; return {name:nameOf(id),charId:id,obj:n&&n.obj}; };
  const sayAll=async(GM,L)=>{ for(const [w,t] of L) await GM.say(w==null?null:(w==='老闆'?BOSS:whoOf(GM,w)),t); };
  S.isOpen=G=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(ZONE,G.hour,G.day);
  /* 存檔欄位（舊存檔沒有、壞掉的：重設）*/
  S.rec=function(G){ let r=G.mokuyobi; if(!r||typeof r!=='object'||Array.isArray(r)) r=G.mokuyobi={n:0,seats:{}};
    if(typeof r.n!=='number'||!(r.n>=0)) r.n=0; if(!r.seats||typeof r.seats!=='object'||Array.isArray(r.seats)) r.seats={}; if(!r.rain||typeof r.rain!=='object'||Array.isArray(r.rain)) r.rain={};
    if(!r.chat||typeof r.chat!=='object') r.chat={t:null,k:0}; if(r.look!=null&&(typeof r.look!=='object'||Array.isArray(r.look))) r.look={}; return r; };
  const sceneFree=GM=>{ if(typeof INV!=='undefined'&&INV.sceneFree) return INV.sceneFree(GM); const E=GM&&GM.E, D=GM&&GM.D; return !(E&&E.player&&E.player.busy)&&!(D&&(D.active||(D.busyDepth|0)>0)); };
  /* 今天這一趟是不是一個人：今天在木曜日有約（一起走過去、約好的時間到了、剛見過）＝不是 */
  S.alone=function(G){ const h=G.hour%24; return !(G.invites||[]).some(iv=>iv&&iv.zone===ZONE&&iv.day===G.day&&(iv.state==='going'||iv.state==='done'||(iv.state==='accepted'&&h>=iv.h-0.5&&h<iv.h+0.75))); };
  /* 座位：配置的第幾個（最近、0.3 m 以內）*/
  S.seatIdx=function(seat){ const L=LAY(); if(!L||!seat) return -1; let bi=-1, bd=0.3; L.seats.forEach((s,i)=>{ const d=Math.hypot(s.x-seat.x,s.z-seat.z); if(d<bd){ bd=d; bi=i; } }); return bi; };
  /* 老位子：坐過三次以上、次數最多的（一樣多＝上一次坐的那個；再一樣＝前面的）*/
  S.oldSeat=function(G){ const r=S.rec(G); let bi=-1, bn=2; for(const k of Object.keys(r.seats)){ const i=+k, n=r.seats[k]|0; if(n>bn||(n===bn&&bi>=0&&i===r.last)){ bn=n; bi=i; } } return bi; };

  /* ---------- 小聲（第 10 點）：二樓店裡、有人說話、不是手機、不在 loud 的段落 ---------- */
  let mute=0; S.mute=async fn=>{ mute++; try{ return await fn(); } finally { mute--; } };
  S.quietHere=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||G.zone!==ZONE||mute>0) return false; if(typeof LIBQ!=='undefined'&&LIBQ.isLoud&&LIBQ.isLoud()) return false;
    if(typeof ADV!=='undefined'&&ADV.active&&ADV.bgMode&&typeof ADV.bgMode==='object'&&ADV.bgMode.image) return false;   /* 2D 背景換到別的地方 */
    return !!(E&&E.player&&(E.player.lv|0)===1); };
  S.whisper=function(GM,who,text){ if(!who||text==null) return text; const nm=typeof who==='object'?who.name:who; if(typeof nm==='string'&&nm.indexOf('（手機）')>=0) return text;
    if(/小聲/.test(String(text))||!S.quietHere(GM)) return text; return typeof LIBQ!=='undefined'&&LIBQ.quiet?LIBQ.quiet(text):'（小聲）'+text; };
  if(typeof LIBQ!=='undefined'&&LIBQ.whisper&&!LIBQ._mok){ LIBQ._mok=true; const w0=LIBQ.whisper; LIBQ.whisper=function(GM,who,text){ const r=w0.apply(this,arguments); return r!==text?r:S.whisper(GM,who,text); }; }

  /* ---------- 1-2 點東西 ---------- */
  let orderedVisit=null;
  S.eatReg=function(){ if(typeof EAT==='undefined'||!EAT.addShop) return null; if(!(EAT.SHOPS_X&&EAT.SHOPS_X['木曜日'])) EAT.addShop('木曜日',{shop:'溫州街・木曜日',staff:{who:'老闆',line5:null,same:null,alt:null},first:null,door:false}); return EAT; };
  S.order=async function(GM){ const G=GM.G; orderedVisit=GM.enterN|0; const M=S.L.menu;
    const opts=M.map(m=>({t:m[0]+'　'+m[1]+' 元',dim:(G.money|0)<m[1]})).concat([{t:S.L.none}]); const gO=typeof GIFT!=='undefined'&&GIFT.shopOpt?GIFT.shopOpt(G,'木曜日'):null; if(gO) opts.push(gO);   /* 買一份帶走送人（GIFT-ALL-DRINK-SHOPS-1112，src/gift3d.js GIFT.SHOPS）：放在最後，原本的選項位置不動 */ const i=await GM.choose(opts);
    if(gO&&i===M.length+1){ await GIFT.buy(GM,'木曜日'); return null; }
    if(i==null||i<0) return null;
    if(i>=M.length){ await GM.say({name:G.name},S.L.water); await GM.say(BOSS,S.L.waterOk); await S.chat(GM); return 'water'; }
    const [nm,p,line]=M[i]; if((G.money|0)<p){ GM.toast('錢不夠'); return null; }
    GM.money(-p); await GM.say(null,line); const E_=S.eatReg(); if(E_&&E_.ordered){ try{ await E_.ordered(GM,'木曜日',nm); }catch(e){ console.warn('EAT.ordered',e); } }
    /* 順手的事（src/sideq3d.js）：AA_772 把 SQ04「一台沒人拿的筆電」從慢讀咖啡搬到木曜日（L118-SHOPS-REDO-1111）——在木曜日點完東西也叫 SIDEQ.atShop（key＝那件事原本的店名 key，SIDEQ.keyOfName('木曜日')）；
       原本只有 118 巷、溫州街那幾間的點餐有接，木曜日沒有接＝搬過來以後那件事永遠不會出現 */
    if(typeof SIDEQ!=='undefined'&&SIDEQ.atShop&&SIDEQ.keyOfName){ const k=SIDEQ.keyOfName('木曜日'); if(k){ try{ await SIDEQ.atShop(GM,k,{item:nm,price:p}); }catch(e){ console.warn('SIDEQ',e); } } }
    await S.chat(GM); if(GM.autosave) GM.autosave(); return nm; };
  /* 熟了以後的閒聊（1-4）：來過八次以上、這學期還沒說，三句輪流 */
  S.chat=async function(GM){ const G=GM.G, r=S.rec(G), k=S.termKey(G); if(r.n<8||r.chat.t===k) return false; const n=r.chat.k|0; r.chat={t:k,k:n+1}; await GM.say(BOSS,S.L.chat[n%S.L.chat.length]); return true; };

  /* ---------- 看看書櫃、看唱片機、看海報（AA_645 第 1 節）：每次隨機一句、同一句不連續出（G.mokuyobi.look＝{種類: 上一次那句}）---------- */
  S.look=function(G,kind){ const L0=S.L.look[kind]; if(!L0||!L0.length) return null; const r=S.rec(G), lk=r.look||(r.look={}), prev=lk[kind];
    const pool=L0.map((t,i)=>i).filter(i=>L0.length<2||i!==prev), i=pool[Math.min(pool.length-1,Math.floor(S.rand()*pool.length))]; lk[kind]=i; return L0[i]; };
  /* ---------- 進門（二樓的店門以東）：1-1 第一次、1-5 考試週、1-4 老位子 ---------- */
  let doorVisit=null, busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['mokuyobi:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['mokuyobi:mute']=()=>{ mute=0; };
  S.inShop=function(GM){ const E=GM.E, P=E&&E.player, L=LAY(); if(!P||!L||(P.lv|0)!==1) return false; return P.obj.position.x>L.stairWell.x1+0.15; };
  S.doorDue=function(GM){ const G=GM.G; return !!G&&G.zone===ZONE&&doorVisit!==(GM.enterN|0)&&S.inShop(GM)&&S.isOpen(G); };
  S.door=async function(GM){ const G=GM.G, r=S.rec(G); doorVisit=GM.enterN|0; r.n=(r.n|0)+1; if(!S.alone(G)) return 'together';
    if(!r.first){ r.first=G.day; GM.sceneBegin(); try{ await sayAll(GM,S.L.first); } finally { GM.sceneEnd(); } return 'first'; }
    if(S.examWeek(G)){ if(r.examDay===G.day) return null; r.examDay=G.day; GM.sceneBegin(); try{ await GM.say(null,S.L.exam); } finally { GM.sceneEnd(); } return 'exam'; }
    const oi=S.oldSeat(G); if(oi<0) return null;
    let k=1; GM.sceneBegin(); try{ await GM.say(BOSS,S.L.old); k=await GM.choose([{t:S.L.oldYes},{t:S.L.oldNo}]); if(k!==0) await GM.say(BOSS,S.L.oldNoBoss); } finally { GM.sceneEnd(); }
    if(k===0){ const it=S.seatItem(GM,oi); if(it&&GM.seatMenu) await GM.seatMenu(it); return 'old'; } return 'other'; };
  S.seatItem=(GM,i)=>{ const L=LAY(), s=L&&L.seats[i]; if(!s) return null; return ((GM.E&&GM.E.interactables)||[]).find(q=>q&&q.seat&&q.shop==='mokuyobi'&&Math.hypot(q.seat.x-s.x,q.seat.z-s.z)<0.05)||null; };

  /* ---------- 打烊：人還在店裡＝出來（22:00 考試週和柏翰一起出來：1-5）---------- */
  S.bohanOut=function(G){ if(!S.examWeek(G)||(G.hour%24)<22-1e-6||(G.hour%24)>=22.5) return false; if(typeof STORY==='undefined'||!STORY.schedEnt||typeof CHARACTERS==='undefined') return false;
    const c=CHARACTERS.classmate_bohan; if(!c) return false; const e=STORY.schedEnt(c,Object.assign({},G,{hour:21.9})); if(!e||!e.mokuyobi) return false;
    if(typeof SOCIAL!=='undefined'&&SOCIAL.stage&&SOCIAL.stage('classmate_bohan')==='STRANGER') return false;
    return !(G.invites||[]).some(iv=>iv&&iv.who==='classmate_bohan'&&(iv.state==='going'||(iv.state==='accepted'&&iv.day===G.day))); };
  /* 一般的 22:00 打烊（AA_700；原 AA_645 第 3 節）：那天有開、現在是打烊那一刻（22:00～22:30）或這一趟進來時開著（XSCLOSE.gen）；颱風、週二、還沒開、讀檔回到半夜＝照舊只寫開放時間 */
  S.closingNow=G=>{ const h=G.hour%24; if(h<22-1e-6||h>=22.5) return false; const ws=typeof PLACES!=='undefined'&&PLACES.windowsOf?PLACES.windowsOf(ZONE,G.day):null; return !!(ws&&ws.length)&&!(PLACES.typhoonClosed&&PLACES.typhoonClosed(ZONE,G.day)); };
  S.closeOut=async function(GM){ const G=GM.G, P=GM.E&&GM.E.player; let go=false; const bh=S.bohanOut(G), c0=S.closingNow(G), gen=!bh&&(typeof XSCLOSE!=='undefined'&&XSCLOSE.gen?XSCLOSE.gen(GM,ZONE,c0):c0);
    GM.sceneBegin(); try{ if(P&&P.seat&&GM.standUp) GM.standUp(P);
      if(gen){ if(typeof XSCLOSE!=='undefined'&&XSCLOSE.say) await XSCLOSE.say(GM,'老闆'); else await GM.say(BOSS,'我們今天要打烊了。'); }   /* AA_700：老闆一句，不另外出旁白 */
      if(bh) await S.mute(async()=>{ const w=whoOf(GM,'classmate_bohan'); await GM.say(w,S.L.bhAsk); const k=await GM.choose([{t:S.L.bhGo},{t:S.L.bhHome}]); if(k===0) go=true; else await GM.say(w,S.L.bhBye); }); }
    finally { GM.sceneEnd(); }
    if(go&&typeof INV!=='undefined'&&INV.accept) INV.accept(G,'classmate_bohan','cafe',G.day,G.hour%24,{now:true,by:'npc'});   /* 一起走到兩點半（邀約的「現在一起過去」：他跟著你，到了照兩點半的見面）*/
    const h=G.hour, d=G.day; await GM.enter('wenzhou',Object.assign({},MOK3.OUT));
    if(!bh&&!gen&&typeof PLACES!=='undefined'&&PLACES.closedText) GM.toast(PLACES.closedText(ZONE,h,d),5000);
    return go?'cafe':(bh?'home':(gen?'close':'out')); };

  /* ---------- 每 0.5 秒（STORY.TICKS）：打烊優先，再來進門 ---------- */
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||G.zone!==ZONE||busy||GM.titleIdle||!sceneFree(GM)) return false;
    let p=null; if(!S.isOpen(G)) p=S.closeOut(GM); else if(S.doorDue(GM)) p=S.door(GM); if(!p) return false;
    busy=true; p.catch(e=>console.warn('MOKS.tick',e)).finally(()=>{ busy=false; }); return true; };

  /* ---------- 坐下（STORY.onSeat）：記位子；這一趟第一次坐下＝點東西 ---------- */
  S.onSeat=async function(GM,seat){ const G=GM.G; if(!G||G.zone!==ZONE) return false; const r=S.rec(G), i=S.seatIdx(seat); if(i>=0){ r.seats[i]=(r.seats[i]|0)+1; r.last=i; }
    if(orderedVisit!==(GM.enterN|0)) await S.order(GM); return true; };

  /* ---------- 讀書：1-3 四句輪流、1-4 21:40 的溫水 ---------- */
  let lastStudy=null;
  S.markStudy=function(GM,hrs){ const G=GM&&GM.G; if(!G) return; lastStudy={day:G.day,zone:G.zone,to:G.hour,from:G.hour-(+hrs||1)}; };
  S.narr=function(GM){ const G=GM&&GM.G; if(!G||G.zone!==ZONE) return null; const r=S.rec(G), W40=21+40/60, ls=lastStudy;
    if(ls&&ls.zone===ZONE&&ls.day===G.day&&ls.from<W40-1e-6&&ls.to>=W40-1e-6&&r.water!==S.termKey(G)){ r.water=S.termKey(G); r.waterDay=G.day; return [S.L.waterNarr,['老闆',S.L.waterBoss]]; }
    const n=r.narr|0; r.narr=n+1; return S.L.narr[n%S.L.narr.length]; };

  /* ---------- 1-5 常客的作息（考試週）＋當面那一句 ---------- */
  const LAW_TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const ent=o=>Object.assign({zone:ZONE,act:'read',terms:LAW_TERMS,weeks:[8,9,16],noHoliday:true,mokuyobi:true,if:{custom:G=>!(typeof PLACES!=='undefined'&&PLACES.typhoonClosed&&PLACES.typhoonClosed(ZONE,G&&G.day))}},o);
  S.REGULARS=[{id:'classmate_bohan',ent:ent({days:[0,1,3,4,5,6],from:14,to:22,label:'在木曜日念書',note:'AA_617 第 4 節第 5 點、AA_618 1-5：考試那兩週 14:00～22:00（週二公休不排）'}),line:'bh'},
    {id:'classmate_xinci',ent:ent({days:[1,3],from:14,to:17,label:'在木曜日念書',note:'AA_645 5-b：考試那兩週週一、週三 14:00～17:00（週四 15:30～17:30 她有事）'}),line:'xc'},
    {id:'classmate_mingxuan',ent:ent({days:[4],from:15,to:19,label:'在木曜日念書',note:'AA_618 1-5：稿上週二、週四 15:00～19:00；木曜日週二公休，只排週四（問 AA）'}),line:'mx'}];
  S.apply=function(){ let n=0; for(const R of S.REGULARS){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[R.id]; if(!c) continue; const L=c.daily_schedule||(c.daily_schedule=[]); if(L.some(e=>e&&e.mokuyobi)) continue; L.push(Object.assign({},R.ent)); n++; } return n; };   /* 接在最後面、寫學期：同學期有寫的作息（上課、事件）先算 */
  S.apply();
  S.slotNow=function(G,id){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c||typeof STORY==='undefined'||!STORY.schedEnt) return null; const e=STORY.schedEnt(c,G); return e&&e.mokuyobi?e:null; };
  S.greet=async function(GM,who,id){ const G=GM&&GM.G; if(!G||G.zone!==ZONE) return false; const R=S.REGULARS.find(q=>q.id===id); if(!R||!S.slotNow(G,id)) return false;
    const r=S.rec(G); if(r[R.line]===G.day) return false; r[R.line]=G.day; await sayAll(GM,S.L[R.line]); return true; };

  /* ---------- 1-6 兩個人來：見面那一段（invites.js 地點 mokuyobi 的 scene）---------- */
  S.rand=()=>Math.random();
  /* AA_645 第 2 節：約的人先到的進門旁白（不分男女、名字代入）；窗邊兩桌（配置 seats 的 table 1、2＝label「坐窗邊」那四個位子，臨街那面窗前）都有人＝「靠書櫃那桌」。
     有沒有人看別的 NPC 坐在哪（約的那個人、玩家不算）；她實際坐哪一張是邀約一般的 INV.pairSeats 決定的（離玩家最近、旁邊有空位），這一句只照窗邊滿不滿 */
  S.WIN_TABLES=[1,2];
  S.windowFull=function(GM,id){ const L=LAY(), E=GM&&GM.E; if(!L||!E) return false; const her=GM.npc&&GM.npc[id];
    return S.WIN_TABLES.every(t=>L.seats.some(s=>s.table===t&&(E.npcs||[]).some(n=>n&&n!==her&&n.charId!==id&&n.seat&&(n.seat.lv|0)===1&&Math.hypot(n.seat.x-s.x,n.seat.z-s.z)<0.35))); };
  S.CALL={heroine_01:'以安',heroine_02:'芷若',heroine_03:'語彤',heroine_04:'子晴',heroine_05:'學姊',classmate_peishan:'沛珊',kexin:'可昕',zhe:'阿哲',classmate_bohan:'柏翰',classmate_mingxuan:'明軒',classmate_xinci:'芯慈',yu:'Alison'};   /* AA_645 第 6 節第 1 點（企劃線 350c90382）：祐廷平常的叫法；其他人用平常顯示的短名（SOCIAL.npcName），不用全名 */
  S.callName=id=>S.CALL[id]||((typeof SOCIAL!=='undefined'&&SOCIAL.npcName)?SOCIAL.npcName(id):nameOf(id));
  S.meetLine=(GM,id)=>S.L.meetFmt.replace('{名字}',S.callName(id)).replace(S.L.meetWin,S.windowFull(GM,id)?S.L.meetBook:S.L.meetWin);
  S.meetScene=async function(GM,iv,who){ const G=GM.G, id=iv.who, D=S.DATE[id], F=S.FRIEND[id];
    const before=(G.invites||[]).some(q=>q!==iv&&q.who===id&&q.place==='mokuyobi'&&q.state==='done');
    if(!iv.now) await GM.say(null,S.meetLine(GM,id));   /* 約的人先到（一起走過來的不說）：AA_645 第 2 節不分男女 */
    if(D){ if(!before) await GM.say(who,D.first); else if(S.rand()<0.5) await GM.say(who,D.line); return; }
    if(F){ if(!before||S.rand()<0.5) await GM.say(who,F); return; }
    if(iv.now) await GM.say(null,'你和'+nameOf(id)+'在木曜日坐坐。'); };   /* 稿上沒有的人、一起走過來的（沒有進門那一句）：照邀約一般的見面旁白 */
  /* AA_645 第 4 節：約去木曜日答應的那一句——十人各一句在 src/data/invites.js（people[人].acc.mokuyobi）；沒列的人（答應了、沒有自己的句子）＝一般那句 */
  S.ACC0='好啊。那裡要小聲一點喔。';   /* 包 INV.personal 的 lines → S.playLines(GM,who,…)＝有名字說的，不加外面的「」（AA-B 2026-11-08，TEXT-QUOTE-UNIFY-1108 第三批）*/
  if(typeof INV!=='undefined'&&INV.personal&&!INV._moks){ INV._moks=true; const p0=INV.personal; INV.personal=function(G,id,P,day,h,r){ const out=p0.apply(this,arguments);
      if(P&&P.id==='mokuyobi'&&out&&out.res==='accept'&&!(Array.isArray(out.lines)&&out.lines.length)) return Object.assign({},out,{lines:[S.ACC0]}); return out; }; }
  if(typeof SOCIAL!=='undefined'&&SOCIAL.MEMORY_LABEL) SOCIAL.MEMORY_LABEL.MOKUYOBI_TOGETHER=SOCIAL.MEMORY_LABEL.MOKUYOBI_TOGETHER||'一起去木曜日';   /* 人物頁的記憶名稱 */

  /* ---------- 1-7 雨天（離開的時候）---------- */
  S.HEROINES=Object.keys(S.RAIN);
  S.rainDue=function(G){ if(!G||G.zone!==ZONE||G.weather!=='rain') return null; const F=G.flags||{}, r=S.rec(G);
    const iv=(G.invites||[]).filter(q=>q&&q.place==='mokuyobi'&&q.state==='done'&&q.day===G.day&&S.HEROINES.includes(q.who)&&F['dating_'+q.who]===true&&!r.rain[q.who]).pop();
    return iv||null; };
  S.rainScene=async function(GM,iv){ const G=GM.G, id=iv.who, r=S.rec(G); r.rain[id]=G.day; const who=whoOf(GM,id);
    GM.sceneBegin({adv:id}); try{ await S.mute(async()=>{
      if(typeof ADV!=='undefined'&&ADV.cg&&typeof CG_REGISTRY!=='undefined'&&CG_REGISTRY[S.RAIN_CG(id)]) ADV.cg(S.RAIN_CG(id));   /* CG 還沒有圖＝不出 */
      for(const t of S.L.rain) await GM.say(null,t); await GM.say(who,S.RAIN[id]);
      const k=await GM.choose(S.L.rainOpts.map(o=>({t:o.t}))), o=S.L.rainOpts[k]||S.L.rainOpts[0]; if(GM.advance) GM.advance(o.h); await GM.say(null,o.narr); }); }
    finally { GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };

  /* ---------- 接到遊戲 ---------- */
  /* 吧檯的「點東西」（配置的 interact order；書櫃、唱片機、海報沒有台詞，不放）*/
  if(typeof MOK3!=='undefined'&&MOK3.zone&&!MOK3.zone._moks){ MOK3.zone._moks=true; const b0=MOK3.zone.build; MOK3.zone.build=function(E){ const z=b0.apply(this,arguments); const L=LAY();
      for(const q of ((L&&L.interact)||[])){ if(q.kind==='order') E.interactables.push({x:q.x,z:q.z,radius:1.0,lv:1,label:'點東西',mokOrder:true});
        else if(S.L.look[q.kind]) E.interactables.push({x:q.x,z:q.z,radius:1.0,lv:1,label:S.L.lookLabel[q.kind]||q.label,mokLook:q.kind}); }   /* AA_645 第 1 節：書櫃、唱片機、海報 */
      return z; }; }
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.tick)) STORY.TICKS.push(S.tick);
    if(Array.isArray(STORY.PRE_TALK)&&!STORY.PRE_TALK.includes(S.greet)) STORY.PRE_TALK.push(S.greet);
    if(!STORY._moks){ STORY._moks=true;
      const os=STORY.onSeat; STORY.onSeat=async function(GM,seat){ const r=os?await os.apply(this,arguments):false; try{ if(GM&&GM.G&&GM.G.zone===ZONE) await S.onSeat(GM,seat); }catch(e){ console.warn('MOKS.onSeat',e); } return r; };
      const ost=STORY.onStudy; STORY.onStudy=function(GM,hrs){ if(ost){ try{ ost.apply(this,arguments); }catch(e){ console.warn('STORY.onStudy',e); } } S.markStudy(GM,hrs); };
      const n0=STORY.studyNarr; STORY.studyNarr=GM=>S.narr(GM)||(typeof n0==='function'?n0(GM):null);
      if(STORY.interact){ const oi=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G;
        if(it&&it.mokHeld&&G&&G.zone===ZONE){ if(GM.toast) GM.toast(S.EXAM_HELD+'。',2200); return true; }   /* 考試週：桌上放了東西的位子（S.examSync）*/
        if(it&&it.mokOrder&&G){ GM.sceneBegin(); try{ await S.order(GM); } finally { GM.sceneEnd(); } return true; }
        if(it&&it.mokLook&&G){ GM.sceneBegin(); try{ await GM.say(null,S.look(G,it.mokLook)); } finally { GM.sceneEnd(); } return true; }
        if(it&&it.exit&&G&&G.zone===ZONE&&it.exit.to==='wenzhou'){ const iv=S.rainDue(G); if(iv) await S.rainScene(GM,iv); }   /* 演完照常走出去 */
        return oi.apply(this,arguments); }; }
      if(STORY.populate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ if(zoneId===ZONE){ S.populate(GM); S.examSync(GM,true); } }catch(e){ console.warn('MOKS.populate',e); } return r; }; } } }
  /* 老闆：吧檯後面（配置：老闆在 z −6.6～−5.9、面向客人＝南），開門的時候在 */
  S.BOSS_AT={x:-2.95,z:-6.2,yaw:0};
  S.populate=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.addNPC||typeof CHAR==='undefined'||!CHAR.build||!S.isOpen(G)) return null; if((E.npcs||[]).some(n=>n&&n.mokBoss)) return null;
    const sp=typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(91):{}; const o=CHAR.build(sp); if(!o) return null; o.position.set(S.BOSS_AT.x,0,S.BOSS_AT.z); o.rotation.y=S.BOSS_AT.yaw;
    return E.addNPC({obj:o,lv:1,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,clerk:true,mokBoss:true}); };

  /* ---------- 1-5 考試週坐滿（BUG-MOKU-EXAM-SEATS-1110；開頭的說明）---------- */
  S.EXAM_SPEC0=1700;   /* STORY.extraSpec 的編號（社科圖二樓 1600 起）*/
  S.EXAM_HELD='有人了';
  S.EXAM_TAKEN='mokExam';
  S.examFull=G=>!!G&&G.zone===ZONE&&S.examWeek(G)&&S.isOpen(G)&&S.alone(G);   /* 和進門那一句（S.door 的考試週）同一組條件 */
  S.barSide=function(E){ const L=LAY(), s=L&&(L.seats||[]).find(q=>/吧檯旁邊/.test(q.label||'')); if(!s||!E||!E.zone||!Array.isArray(E.zone.seats)) return null; return E.zone.seats.find(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.05&&(q.lv|0)===1)||null; };
  const nearS=(q,st)=>!!q&&(q.lv==null||(q.lv|0)===(st.lv|0))&&Math.hypot(q.x-st.x,q.z-st.z)<0.35;
  S.seatUsed=(E,st)=>(!!E.player&&nearS(E.player.seat,st))||(E.npcs||[]).some(n=>n&&!n.leaving&&(nearS(n.seat,st)||nearS(n.seatTarget,st)));
  const seatIts=(E,st)=>(E.interactables||[]).filter(it=>it&&it.seat&&it.shop==='mokuyobi'&&Math.hypot(it.seat.x-st.x,it.seat.z-st.z)<0.05);
  const hold=(E,st)=>{ st.mokHeld=true; for(const it of seatIts(E,st)){ if(it.mokHeld) continue; it.mokLabel0=it.label; it.mokPrio0=it.prio; it.label=S.EXAM_HELD; it.prio=(it.prio||0)-0.4; it.mokHeld=true; } };
  const unhold=(E,st)=>{ st.mokHeld=false; for(const it of seatIts(E,st)){ if(!it.mokHeld) continue; it.label=it.mokLabel0; it.prio=it.mokPrio0; delete it.mokHeld; delete it.mokLabel0; delete it.mokPrio0; } };
  let XS=null;   /* {zone:E.zone, held:Set（座位）, bar, on} ：換區域就重來 */
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['mokuyobi:exam']=()=>{ XS=null; };
  /* 一位讀書的路人（沒有名字、沒有台詞）：entering＝進門時已經坐著；待著的時候＝從一樓樓梯口走上來坐（不憑空出現）*/
  S.examPerson=function(GM,st,entering){ const E=GM.E, G=GM.G; if(typeof CHAR==='undefined'||!CHAR.build||!E.addNPC) return null;
    const sp=typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(S.EXAM_SPEC0+(((G.day|0)*7+(st.table|0)*3)%60)):{}; const o=CHAR.build(sp); if(!o) return null; const lv=st.lv|0;
    if(entering){ o.position.set(st.x,0,st.z); o.rotation.y=st.yaw||0; const n=E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,mokExam:true,lv,until:22}); if(n&&GM.sitAt){ GM.sitAt(n,st); n.pose=n.idlePose='read'; } return n; }
    const IN=typeof MOK3!=='undefined'&&MOK3.IN?MOK3.IN:{x:-3.75,z:5.4,lv:0}; o.position.set(IN.x,0,IN.z); o.rotation.y=IN.yaw||0;
    const n=E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',isExtra:true,mokExam:true,lv:IN.lv|0,until:22}); if(!n) return null; n.seatTarget=st;
    const sit=()=>{ n.seatTarget=null; if(n.leaving) return; if(E.player&&nearS(E.player.seat,st)){ n.until=G.hour%24; return; } if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose='read'; };   /* 走到了玩家先坐了：站一下就走 */
    const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; if(!(E.moveTo&&E.moveTo(n,ap[0],ap[1],sit,lv))) sit(); return n; };
  S.examSync=function(GM,entering){ const E=GM&&GM.E, G=GM&&GM.G; if(!E||!G||!E.zone) return null;
    if(!XS||XS.zone!==E.zone) XS={zone:E.zone,held:new Set(),bar:null,on:false};
    const seats=E.zone.seats; if(G.zone!==ZONE||!Array.isArray(seats)||!seats.length) return XS;
    const bar=S.barSide(E), on=!!bar&&S.examFull(G);
    if(!on){ for(const st of XS.held) unhold(E,st); XS.held.clear(); if(XS.bar&&XS.bar.taken===S.EXAM_TAKEN) XS.bar.taken=null; XS.bar=null; XS.on=false; return XS; }
    XS.on=true; XS.bar=bar; if(!bar.taken) bar.taken=S.EXAM_TAKEN;   /* 吧檯旁邊：留給玩家（路人、照作息的人不坐；玩家的「坐下」GM.freeSeat 不看 taken）*/
    if(bar.mokHeld){ unhold(E,bar); XS.held.delete(bar); }
    const tables=[...new Set(seats.map(q=>q.table))];
    for(const t of tables){ const ts=seats.filter(q=>q.table===t&&q!==bar); if(!ts.length||ts.some(q=>S.seatUsed(E,q))) continue;   /* 這一桌已經有人（作息的人、已經坐著的、正走過去的）*/
      const free=ts.filter(q=>!q.taken); if(!free.length) continue; const st=free[((G.day|0)+(t|0))%free.length];
      if(st.mokHeld){ unhold(E,st); XS.held.delete(st); } S.examPerson(GM,st,!!entering); }
    for(const st of seats){ if(st===bar||XS.held.has(st)||st.taken||S.seatUsed(E,st)) continue; hold(E,st); XS.held.add(st); }   /* 其他空的位子：有人了（坐著人的也留著這個字：人走了還是他的位子）*/
    return XS; };
  S.examTick=function(GM){ const G=GM&&GM.G; if(!G||G.zone!==ZONE||GM.titleIdle) return false; S.examSync(GM,false); return !!(XS&&XS.on); };
  /* 桌上放東西（SEATACT「休息」那一組）：有人了、現在沒人坐的位子 */
  S.examAway=function(GM){ const E=GM&&GM.E; if(!XS||!XS.on||!E||XS.zone!==E.zone) return []; return [...XS.held].filter(st=>!S.seatUsed(E,st)); };
  if(typeof SEATACT!=='undefined'&&Array.isArray(SEATACT.AWAY)&&!SEATACT._moks){ SEATACT.AWAY.push(GM=>S.examAway(GM)); SEATACT._moks=true; }
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.examTick)) STORY.TICKS.push(S.examTick);   /* 每 0.5 秒：作息的人走了、桌子空了＝補一位；放開、重新標「有人了」*/
  /* 這段時間路人系統不排木曜日的客人（人由 S.examSync 放）*/
  if(typeof CROWD!=='undefined'&&CROWD.shopPlan&&!CROWD._moks){ CROWD._moks=true; const sp0=CROWD.shopPlan;
    CROWD.shopPlan=function(def,G){ if(def&&def.zone===ZONE&&S.examFull(G)) return {keep:-1,units:(def.units||[]).map(()=>[]),wins:[]}; return sp0.apply(this,arguments); }; }
  return S;
})();
