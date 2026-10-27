/* 吃東西（X67，使用者 2026-10-20「吃東西好像只是花錢沒有別的功用怎麼改比較好?」；台詞 AA_329（企劃 c11945d0）照抄在 src/data/eat_lines.js，這裡只有程式）。
   不加體力（DL-02），錢照原本的點餐扣。三件事：
   ① 一起吃：點完以後，店裡有認識的人照作息正在吃（作息 act:'eat'、人真的在這一區）＝問一次「坐過去一起吃」（一個人一天一次，選「不用了」也算問過）。
      照那一天的關係選一組：剛認識＝ACQ、熟＝FAM、朋友以上＝FRI；交往中＝dating（她知道祐廷也和別人交往＝朋友版，BB_191 第 9 節）；
      可昕：交往中／分開以後朋友以上 exFriend／分開以後不到朋友 exLow（不加關係、她先走）。開場 → 那一組 → 結尾（沒有回收台的店＝在店門口分開）；
      時間 +30 分鐘（在店裡原本吃飯的時間之外再加：118 巷 40＋30＝70 分鐘，AA_336 A3）、關係照日常的「一起吃飯」（SOCIAL.activity meal，一天一次、有上限）。118 巷照舊由常客、約好的午餐一起吃（lane118.js S.companions）的那幾個人不再問。
   ② 吃過的：每一間店第一次點＝一句旁白（點餐之後、吃完的旁白之前）；筆記本「吃過的」記店名、品項、日期（同一間店點新的東西也記一筆）。阿德影印不是吃的。
   ③ 店員認得你：同一間店點第 5 次起，點餐前店員多說一句（只說一次）；選單多「老樣子」＝上一次點的那一樣，店員回一句（括號裡的換句照上次點的東西）。
      AA_336 A1：六張犁麵舖的大碗小碗、蛋包飯研究所的全熟半熟不加點餐步驟，老樣子一律用主句（「好。大碗。」「好，半熟。」），上次點什麼的換句不做。
      AA_336 A4：便利商店「加熱」只有微波義大利麵算；第 5 次那一句「要加熱嗎？……你每次都要。」只給上次有加熱的，上次沒加熱的換成 line5Alt（「一樣不用加熱，對吧。」），祐廷回「好。」。
      Café 芷若在班＝照她自己的點法（ASKED_HER_DRINK、CAFE_VISITS），這一套不用；沒見過芷若＝老闆那句（「芷若交代過」）不說。阿鳳麵店語彤在顧店＝第 5 次那一句換她說。
      便利商店：祐廷在那一間打工的（JOBS.at(G,'cvs')，打工系統還沒有）不演。宵夜滷味攤沒有點餐選單：只有 ② 第一次去的旁白（考完的宵夜，outings3d.js）。
   存檔：G.eat＝{n:{店:次數}, last:{店:品項}, l5:{店:第幾天}, first:{店:第幾天}, ate:[{shop,item,day}], tog:{人:第幾天}}；舊存檔沒有就從空的開始。
   接線（各一兩行）：lane118.js 點餐、story3d.js counter（Café、便利商店）、麵店、wzshops3d.js（AA_172 三家；AA_364 四家用 EAT.addShop 登記）、outings3d.js（滷味攤）、game3d.js 筆記本。測試：node tests/eat_unit.js、node tests/wz_aa364_shops_unit.js */
'use strict';
const EAT=(function(){
  const S={};
  const L=()=>typeof EAT_LINES!=='undefined'?EAT_LINES:null;
  /* 店：key＝第 ③ 節的店名；first＝第 ② 節的店名（null＝不是吃的）；door＝沒有回收台（吃完在店門口分開）*/
  S.FIRST_KEY={'滇香小館':'118 巷・滇香小館','好家自助餐':'118 巷・好家自助餐','一一八茶飲':'118 巷・一一八茶飲','巷口家常菜':'118 巷・巷口家常菜','慢讀咖啡':'118 巷・慢讀咖啡',
    'Pasta 118':'118 巷・Pasta 118','韓食小廚':'118 巷・韓食小廚','蛋包飯研究所':'118 巷・蛋包飯研究所','六張犁麵舖':'118 巷・六張犁麵舖',
    '兩點半 Café':'兩點半 Café','阿鳳麵店':'阿鳳麵店','溫州街・半熟':'溫州街・半熟','溫州街・一盞':'溫州街・一盞','公館的便利商店':'公館的便利商店','宵夜（滷味攤）':'宵夜（公館滷味攤）','阿德影印輸出':null};
  /* 別的檔登記的店（AA_364 的四家：src/wzshops3d.js 的 WZS.eatReg 照 WZS.AA364 登記）：台詞在登記的那個檔，這裡只有程式。
     EAT.addShop(店, {shop:吃過的店名, staff:{who, line5（null＝不說）, same（選老樣子的回答）, alt}, first:第一次的旁白, door:沒有回收台}) */
  S.SHOPS_X={};
  S.addShop=function(key,o){ S.SHOPS_X[key]=o; return o; };
  const xShop=key=>Object.prototype.hasOwnProperty.call(S.SHOPS_X,key)?S.SHOPS_X[key]:null;
  S.shopOf=key=>S.FIRST_KEY[key]||(xShop(key)&&xShop(key).shop)||null;   /* 吃過的店名（null＝不是吃的）*/
  S.NOODLE_TYPE={'六張犁麵舖':true,'阿鳳麵店':true};   /* 「麵店」（第 0 節沒有回收台的店）：兩間麵店都算（AA_336 A2 確認）*/
  S.isDoor=key=>{ const D=(L()&&L().doorShops)||[]; return !!S.NOODLE_TYPE[key]||!!(xShop(key)&&xShop(key).door)||D.some(k=>k!=='麵店'&&String(key).indexOf(k)>=0); };
  S.isFood=key=>!!S.shopOf(key);
  S.rec=function(G){ const R=G.eat&&typeof G.eat==='object'?G.eat:(G.eat={}); for(const k of ['n','last','l5','first','tog']) if(!R[k]||typeof R[k]!=='object'||Array.isArray(R[k])) R[k]={}; if(!Array.isArray(R.ate)) R.ate=[]; return R; };
  const flags=G=>G.flags||{};
  /* 芷若在吧檯（作息 barista，story3d.js 生成時 staff:'cafe'）*/
  S.zrOnShift=GM=>{ const n=GM.npc&&GM.npc.heroine_02; return !!(n&&n.staff==='cafe'&&!n.leaving); };
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  /* 這間店現在有沒有「店員認得你」：沒有台詞、芷若在班、沒見過芷若、在那間打工 → null。登記的店（SHOPS_X）用它自己的 staff */
  S.staffOn=function(GM,key){ const T=(L()&&L().staff&&L().staff[key])||(xShop(key)&&xShop(key).staff); if(!T) return null; const G=GM.G;
    if(key==='兩點半 Café'&&(S.zrOnShift(GM)||!has('heroine_02','FIRST_MET'))) return null;
    if(key==='公館的便利商店'){ try{ if(typeof JOBS!=='undefined'&&JOBS.at&&JOBS.at(G,'cvs')) return null; }catch(e){} }
    return T; };
  S.count=function(G,key){ const R=S.rec(G); return (R.n[key]|0)+(key==='兩點半 Café'?(+flags(G).CAFE_VISITS||0):0); };   /* Café：芷若在班時點的（CAFE_VISITS）也算 */
  /* 店員的名字：表上的 who 去掉括號。兩點半 Café 2027-06-04 起芷若不在班的時候是學妹小婷（6/3 是芷若最後一個班，AA_375 第 1 項；牆上班表 B 版「晚上那幾格，換成了小婷的名字」）*/
  S.staffName=function(G,key,t){ if(key==='兩點半 Café'&&G&&typeof STORY!=='undefined'&&STORY.dayOfKey){ const d=STORY.dayOfKey('2027-06-04'); if(d!=null&&G.day>=d) return '小婷'; } return String((t&&t.who)||'店員').replace(/（.*?）/g,''); };
  const who=(t,G,key)=>({name:S.staffName(G,key,t)});
  /* 阿鳳麵店：語彤在顧店（作息 act:'help'）＝第 5 次那一句換她說 */
  S.yutongMinding=function(GM){ const G=GM.G, n=GM.npc&&GM.npc.heroine_03; if(!n||n.leaving||G.zone!=='noodle'||typeof STORY==='undefined'||!STORY.schedEnt||typeof CHARACTERS==='undefined') return false; const e=STORY.schedEnt(CHARACTERS.heroine_03,G); return !!(e&&e.zone==='noodle'&&e.act==='help'); };
  const HEAT=item=>/微波/.test(item);   /* 便利商店要加熱的（現在只有微波義大利麵）*/
  S.ALT_TEST={'沒加熱':item=>!HEAT(item)};   /* 表上的「點全熟」「點小碗」不做（AA_336 A1：沒有大碗小碗、全熟半熟的點餐步驟，老樣子用主句）*/
  S.sameLine=function(T,last){ const a=T.alt, f=a&&S.ALT_TEST[a.when]; return f&&f(String(last||''))?a.t:T.same; };
  /* 第 5 次那一句的換句（AA_336 A4，只有便利商店：上次沒加熱＝「一樣不用加熱，對吧。」＋祐廷回「好。」）；不符合＝null（照表上那一句）*/
  S.line5Alt=function(T,last){ const a=T&&T.line5Alt, f=a&&S.ALT_TEST[a.when]; return f&&last!=null&&f(String(last))?a:null; };
  /* 點餐選單（取代各店原本的 GM.choose）：opts 是原本的選項（品項在前、後面是「不用了」之類），names／prices 是品項。
     第 5 次起先說那一句（只說一次）、多一個「老樣子」（放在品項後面）；回傳原本 opts 的序號（老樣子＝上一次那一樣的序號） */
  S.choose=async function(GM,key,opts,names,prices){ const G=GM.G, R=S.rec(G), T=S.staffOn(GM,key), n=S.count(G,key); S._at={key,day:G.day,hour:G.hour};   /* 點餐那一刻（吃完時間往前走了，她的時段可能剛好結束：一起吃照點餐那一刻判斷）*/
    if(T&&n>=4&&R.l5[key]==null){ R.l5[key]=G.day; if(key==='阿鳳麵店'&&S.yutongMinding(GM)&&L().staffYutong){ const [id,t]=L().staffYutong; await GM.say(GM.npc[id]||{name:typeof SOCIAL!=='undefined'?SOCIAL.displayName(id):id,charId:id},t); }
      else { const A5=S.line5Alt(T,R.last[key]); if(A5){ await GM.say(who(T,G,key),A5.t); if(A5.reply) await GM.say({name:G.name},A5.reply); } else if(T.line5) await GM.say(who(T,G,key),T.line5); } }   /* line5 是 null（AA_364 的四家：熟客的招呼 wzshops3d.js 自己演，AA_364 第 5 節第 3 點）＝不說 */
    let O=opts, same=-1; const last=R.last[key];
    if(T&&n>=4&&last!=null){ const i=names.indexOf(last); if(i>=0&&!(opts[i]&&opts[i].dim)&&!(prices&&prices[i]!=null&&(G.money|0)<prices[i])){ same=i; O=opts.slice(); O.splice(names.length,0,{t:'老樣子',hint:last}); } }
    const k=await GM.choose(O); if(same<0) return k;
    if(k===names.length){ const t=S.sameLine(T,last); if(t) await GM.say(who(T,G,key),t); return same; }   /* 沒有回答＝不說 */
    return k>names.length?k-1:k; };
  /* 沒有經過 S.choose 就點了（118 巷熟客「老樣子」選「好」，lane118.js）：點餐那一刻照樣記下來，「一起吃」照那一刻判斷 */
  S.atNow=function(G,key){ S._at={key,day:G.day,hour:G.hour}; };
  /* 點好了（扣完錢）：次數、上一次點的、吃過的；那間店第一次＝旁白 */
  S.ordered=async function(GM,key,item){ const G=GM.G, R=S.rec(G); R.n[key]=(R.n[key]|0)+1; R.last[key]=item; if(!S.isFood(key)) return false;
    S.note(GM,key,item); if(R.first[key]!=null) return false; R.first[key]=G.day; const t=(L()&&L().first&&L().first[S.shopOf(key)])||(xShop(key)&&xShop(key).first); if(t){ await GM.say(null,t); return true; } return false; };   /* 登記的店：它自己的第一次旁白（AA_364 第 5 節第 4 點）*/
  S.note=function(GM,key,item){ const G=GM.G, R=S.rec(G), shop=S.shopOf(key)||key; if(!shop||R.ate.some(a=>a.shop===shop&&a.item===item)) return false; R.ate.push({shop,item,day:G.day}); if(GM.toast) GM.toast('📓 吃過的：'+shop+'　'+item,2600); return true; };
  /* 筆記本「吃過的」那一格（game3d.js renderNotes）*/
  S.notesHTML=function(G,dayLab){ const A=G&&G.eat&&Array.isArray(G.eat.ate)?G.eat.ate:[]; if(!A.length) return ''; const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
    return '<b>吃過的</b>'+A.map(a=>'<div>· '+esc(a.shop)+'　'+esc(a.item)+(dayLab?'<span class="muted">　'+esc(dayLab(a.day))+'</span>':'')+'</div>').join(''); };
  /* 認識、正在這一區照作息吃飯的人（測試可以換掉 S.eatingHere）*/
  S.eatingHere=function(GM,id,key){ const G=GM.G; if(typeof STORY==='undefined'||!STORY.schedEnt||typeof CHARACTERS==='undefined'||!CHARACTERS[id]) return false; const A=S._at, g=A&&A.key===key&&A.day===G.day&&A.hour!==G.hour?Object.assign({},G,{hour:A.hour}):G; const e=STORY.schedEnt(CHARACTERS[id],g); return !!(e&&e.zone===G.zone&&e.act==='eat'); };
  const npcOf=(GM,id)=>(typeof EVENTS!=='undefined'&&EVENTS.npcOf&&EVENTS.npcOf(id))||(GM.npc&&GM.npc[id])||null;
  const known=(G,id)=>id==='kexin'?!!(flags(G).dating_kexin||flags(G).EX_kexin):has(id,'FIRST_MET');
  S.candidates=function(GM,key){ const G=GM.G, R=S.rec(G), T=L()&&L().together; if(!T) return [];
    const skip=new Set(); if(typeof L118!=='undefined'&&L118.companions&&/^l118_/.test(G.zone||'')){ try{ for(const id of L118.companions(GM,G.zone.slice(5))) skip.add(id); }catch(e){} }   /* 118 巷照舊一起吃的常客、約好的午餐 */
    const out=[]; for(const id of Object.keys(T)){ if(skip.has(id)||R.tog[id]===G.day||!known(G,id)) continue; const n=npcOf(GM,id); if(!n||n.leaving||(GM.E&&GM.E.npcs&&!GM.E.npcs.includes(n))) continue; if(!S.eatingHere(GM,id,key)) continue; if(!S.setFor(G,id)) continue; out.push(id); }
    return out; };
  /* 選哪一組（第 0 節）*/
  S.setFor=function(G,id){ const T=L()&&L().together&&L().together[id]; if(!T) return null; const F=flags(G);
    const fr=typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel(id):'ACQUAINTANCE', fri=fr==='FRIEND'||fr==='CLOSE_FRIEND';
    if(id==='kexin'){ if(F.dating_kexin) return T.dating?'dating':null; if(F.EX_kexin||(((F.romance||{}).kexin)||{}).status==='ex') return fri?(T.exFriend?'exFriend':null):(T.exLow?'exLow':null); return null; }
    if(F['dating_'+id]&&T.dating){ const other=typeof ROM!=='undefined'&&ROM.knows?ROM.knows(G,id).length>0:false; if(!other) return 'dating'; }   /* 她知道祐廷也和別人交往＝朋友版 */
    if(fri&&T.FRI) return 'FRI'; if((fri||fr==='FAMILIAR')&&T.FAM) return 'FAM'; return T.ACQ?'ACQ':(T.FAM?'FAM':(T.FRI?'FRI':null)); };
  /* 點完以後：有人可以一起吃就問一次；回傳 true＝一起吃了（店裡原本的「吃完」旁白不用再說）*/
  S.together=async function(GM,key){ const G=GM.G, R=S.rec(G); if(!S.isFood(key)) return false; const C=S.candidates(GM,key); if(!C.length) return false;
    const st=id=>{ const s=typeof SOCIAL!=='undefined'&&SOCIAL.STAGES&&SOCIAL.stage?SOCIAL.STAGES.indexOf(SOCIAL.stage(id)):0; return s; };
    C.sort((a,b)=>st(b)-st(a)); const id=C[0], set=S.setFor(G,id), lines=L().together[id][set]; for(const x of C) R.tog[x]=G.day;   /* 一天問一次（同一時間兩個人：問最熟的那一個，另一個今天也不再問）*/
    const nm=typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
    GM.sceneBegin(); try{
      const k=await GM.choose([{t:'坐過去一起吃',hint:nm},{t:'不用了'}]); if(k!==0) return false;
      const n=npcOf(GM,id), sp=w=>w==null?null:(w==='me'?{name:G.name}:(w===id&&n?n:{name:typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(w):w,charId:w}));
      await GM.say(null,L().open);
      for(const [w,t] of lines) await GM.say(sp(w),t);
      GM.advance(0.5);
      if(set==='exLow'){ if(n){ n.until=G.hour; } return true; }   /* 她先走（refreshSchedule 照 until 走到門口）；不加關係、不算一起吃 */
      await GM.say(null,S.isDoor(key)?L().closeDoor:L().closeRecycle);
      if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) SOCIAL.activity(id,'meal');
      S.lastTog={id,key,day:G.day};   /* 剛才和誰一起吃（lane118.js 記 118 巷一起吃的次數：AA_311 H4）*/
      return true;
    } finally { GM.sceneEnd(); } };
  /* 點完的共用一段：次數、吃過的、第一次的旁白，接著問一起吃；回傳 true＝一起吃了 */
  S.after=async function(GM,key,item){ await S.ordered(GM,key,item); return S.together(GM,key); };
  /* 宵夜滷味攤（考完的宵夜，outings3d.js S.go 演事件之前）：沒有點餐選單，只有第一次的旁白、吃過的 */
  S.outingFirst=async function(GM,q){ if(!q||q.place!=='公館滷味攤') return false; return S.ordered(GM,'宵夜（滷味攤）','滷味'); };
  /* Café 芷若在班時的點餐是她的事件（CAFE_VISITS）：第一次點過就記進吃過的（不補演旁白），之後老闆那邊點也不再演第一次 */
  S.tickCafe=function(GM){ const G=GM.G; if(!G||!G.flags) return false; const v=+G.flags.CAFE_VISITS||0; if(v<1) return false; const R=S.rec(G), key='兩點半 Café';
    if(R.first[key]==null){ R.first[key]=G.day; const it=G.flags.zhiruoFirstOrder||'拿鐵'; const shop=S.FIRST_KEY[key]; if(!R.ate.some(a=>a.shop===shop)) R.ate.push({shop,item:it,day:G.day}); }
    return false; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.tickCafe(GM));
  return S;
})();
