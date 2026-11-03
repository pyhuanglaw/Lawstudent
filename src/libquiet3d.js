/* ===== 圖書館讀書區「小聲講」（D127 ③；AA_595 第 1 節＋「AA 處理決定」，企劃線 320760260；任務 AA595-LIB-NOD-THERMOS-1102）=====
   使用者 2026-11-02 18:3x 選「小聲講」（取代 AA_379「就直接可以說話就好」和原本的「不開口」）：
   - 讀書區第一次遇到某個人＝只點頭、不說話：按「和○○說話」只播一句點頭的旁白（AA_595 1-A1 的建議句，他／她照人物性別）。
   - 之後在讀書區跟那個人講話：所有人說的台詞（含祐廷）前面加「（小聲）」；旁白、手機訊息、整句都是動作的（「（……）」）不加；已經寫了小聲、氣音、口型的不重複加。
   共用機制（不逐句改稿）：
   - LIBQ.gate(GM,n)：game3d.js 的 doInteract 在呼叫 n.talk 之前問一次；今天在讀書區還沒見過這個人＝播點頭、記下來、回傳 true（這次不說話）。
   - LIBQ.whisper(GM,who,text)：game3d.js 的 say、caption 呼叫；在讀書區＝加前綴，順便把說話的人記成「今天見過」（事件自己開口的也算見過）。
   讀書區（AA_595 開頭的區域；「AA 處理決定」：圖書館大廳、影印機、閉館後離開、美國的會所和中庭不算）：
     總圖 3F 閱覽區 library、總圖大廳只算二樓以上的自習區 library_hall（lv≥1）、研究小間 library_carrels、5F 書庫 library_stacks、
     法圖 lawlib（一樓的影印室、館員辦公室、櫃台和門口不算）、社科圖 soclib、總圖 B1 只算 24 小時自習室和討論室（study24、disc1、disc2；影印中心、門廳、走廊不算）、
     美國法學院圖書館只算 2F 書庫 us_lawlib_2f（一樓中庭不算）。
   討論室（AA_595 拿不準 Q1～Q5）：「AA 處理決定」拿不準的照小聲講的原則處理，不算讀書區的只列了大廳、影印機、閉館後離開、美國的會所和中庭——討論室照小聲講。
   2D 場景（ADV 背景是圖片）：照背景判斷——法圖二樓、總圖二樓、B1 自習室、B1 討論室、社科圖閱覽區的背景算；門口、台階、簡餐等其他背景都不算（事件搬到館外演就不會加）。
   事件想整場不加：事件定義寫 loud:true（events3d.js 開演時 LIBQ.loudBegin()）；程式裡用 LIBQ.loud(async()=>{…})。
   事件演到一半搬到館外（AA 2026-11-02 20:54 第 3 點）：那一步寫 libOut:true（events3d.js runLines：從那一步到這段對話結束都不加，前面的照加）。
   不是事件的字串（invites.js 的 firstAt、rel_lines.js 的見面旁白 meetLine；AA 2026-11-02 22:30 定稿 1-D10、Q16）：沒辦法寫 libOut——
     LIBQ.isOut(text)＝這一句就是走出館外：開頭「（走出」的（1-D10「（走出法圖）「館員人好好……」」），或 S.OUT_LINES 列的整句（Q16 以安約總圖的見面旁白「閉館音樂響了，她才抬頭問你晚餐吃什麼。」）；
     開頭「（走出」的那一句本身不加前綴（needsPrefix）；invites3d.js 的 INV.meet 用 LIBQ.scope()：從那一句起到這次見面結束（含道別那句）都不加，結束一定配對 loudEnd。
   約好在讀書區見面（第 2 點）：免點頭（S.invited），對話照加。前綴的位置（第 4 點）：開頭有動作括號的合成「（抬頭，小聲）」（S.quiet）；玩家選項不加。
   存檔：G.libNod＝{day, ids:{角色 id:1}}（今天在讀書區見過的人；換一天就清空）。舊存檔沒有這個欄位＝今天誰都還沒見過（LIBQ.rec 補預設值，壞掉的也重設）。
   測試：node tests/aa595_rules_unit.js */
'use strict';
const LIBQ=(function(){
  const S={};
  S.PREFIX='（小聲）';
  S.NOD={f:'（她抬頭看到你，點了一下頭。）',m:'（他抬頭看到你，點了一下頭。）'};   /* AA_595 1-A1「建議改法」的那一句（她＝同表 1-A2 的寫法）*/
  S.ZONES={library:1,library_hall:1,library_carrels:1,library_stacks:1,lawlib:1,soclib:1,library_b1:1,us_lawlib_2f:1};
  S.BG_STUDY=['law_library.webp','ntu_library_2f.webp','ntu_lib_b1.webp','library_b1.webp','soc_library.webp'];   /* outings3d.js 的背景：法圖・二樓、總圖・二樓、總圖 B1・24 小時自習室、總圖 B1・討論室、社科院圖書館・閱覽區 */
  const G_=GM=>GM&&GM.G;
  /* 區域＋位置＝是不是讀書區 */
  S.studyAt=function(zone,lv,x,z){ if(!S.ZONES[zone]) return false; lv=lv|0;
    if(zone==='library_hall') return lv>=1;   /* 一樓是大廳（門廳、閘門、服務台）*/
    if(zone==='lawlib'){ if(lv>=1) return true; const L=typeof LAWLIB_LAYOUT!=='undefined'?LAWLIB_LAYOUT:null; if(!L||typeof x!=='number'||typeof z!=='number') return true;
      if(typeof L.frontZ==='number'&&z<L.frontZ&&Array.isArray(L.rooms)){ const r=L.rooms.find(q=>x>=q.x0&&x<=q.x1); if(r&&r.kind!=='discussion') return false; }   /* 北邊一排：影印室、館員辦公室不算；討論室 A、B 算 */
      const SA=L.staffArea; if(SA&&x>=SA.x0&&z>=SA.z0) return false;   /* 櫃台、閘門、門口（東南角）*/
      return true; }
    if(zone==='library_b1'){ const L=typeof LIBRARY_B1_LAYOUT!=='undefined'?LIBRARY_B1_LAYOUT:null; if(!L||!L.rooms||typeof x!=='number'||typeof z!=='number') return false;
      return L.rooms.some(r=>/^(study24|disc\d)$/.test(r.id)&&x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1); }
    return true; };
  let loudN=0;
  S.loudBegin=()=>{ loudN++; }; S.loudEnd=()=>{ loudN=Math.max(0,loudN-1); };
  S.loud=async function(fn){ S.loudBegin(); try{ return await fn(); } finally { S.loudEnd(); } };
  S.reset=()=>{ loudN=0; };
  /* 字串版的 libOut（AA 2026-11-02 22:30 定稿 1-D10、Q16）*/
  S.OUT_LINES=['閉館音樂響了，她才抬頭問你晚餐吃什麼。'];   /* Q16：rel_lines.js 以安約總圖（library）朋友以上的見面旁白；這句之後就要離開了 */
  const OUT_HEAD='（走出';
  S.isOut=function(text){ const t=String(text==null?'':text).trim(); return t.startsWith(OUT_HEAD)||S.OUT_LINES.includes(t); };
  /* 一段不是事件的台詞（INV.meet）：chk(這一句) 遇到走出館外的那一句起 loudBegin（只一次）；end() 在 finally 配對 */
  S.scope=function(){ let on=0; return { chk(t){ if(!on&&S.isOut(t)){ S.loudBegin(); on=1; } return !!on; }, end(){ if(on){ on=0; S.loudEnd(); } } }; };
  const bgFile=()=>{ if(typeof ADV==='undefined'||!ADV.active) return null; const m=ADV.bgMode; if(!m||typeof m!=='object'||!m.image) return null; return String(m.image).split('/').pop().split('?')[0]; };
  S.quietNow=function(GM){ if(loudN>0) return false; const G=G_(GM); if(!G) return false;
    const bf=bgFile(); if(bf) return S.BG_STUDY.includes(bf);   /* 2D 場景：照背景 */
    const E=GM.E, P=E&&E.player, o=P&&P.obj&&P.obj.position;
    return S.studyAt(G.zone,P?P.lv:0,o?o.x:undefined,o?o.z:undefined); };
  /* 存檔欄位：今天在讀書區見過誰 */
  S.rec=function(G){ let r=G.libNod; if(!r||typeof r!=='object'||typeof r.day!=='number'||!r.ids||typeof r.ids!=='object') r=G.libNod={day:G.day,ids:{}};
    if(r.day!==G.day){ r.day=G.day; r.ids={}; } return r; };
  const idOf=n=>n&&(n.charId||n.id)||null;
  S.seen=(G,id)=>!!(G&&id&&S.rec(G).ids[id]);
  S.mark=(G,id)=>{ if(G&&id) S.rec(G).ids[id]=1; };
  const isMale=id=>{ const c=typeof CHARACTERS!=='undefined'?CHARACTERS[id]:null; return !!c&&(c.gender==='m'||c.sex==='m'); };
  S.nodLine=id=>isMale(id)?S.NOD.m:S.NOD.f;
  /* 約好在這裡見面（invites3d.js：當面約、傳訊息約都一樣）：今天、這一區，和這個人的約到時間了（INV.meetable：按說話就是見面），或今天已經在這一區見過面（state done）。
     AA 2026-11-02 20:54 第 2 點：約好的免點頭（已經約好了），對話照加（小聲）*/
  S.invited=function(G,id){ if(!G||!id) return false; const INVm=typeof INV!=='undefined'?INV:null;
    try{ if(INVm&&INVm.meetable&&INVm.meetable(G,id)) return true; }catch(e){}
    return Array.isArray(G.invites)&&G.invites.some(iv=>iv&&iv.who===id&&iv.day===G.day&&iv.zone===G.zone&&iv.state==='done'); };
  /* 按「和○○說話」之前：今天在讀書區第一次＝只點頭（回傳 true＝這次不說話）。跟著你走的人、坐你後座的人、櫃台後面的店員不算（已經在一起、或是在上班）*/
  S.gate=async function(GM,n){ const G=G_(GM), id=idOf(n); if(!G||!id||!n) return false;
    if(n.beh==='follow'||n.beh==='passenger'||n.staff) return false;
    if(!S.quietNow(GM)) return false; if(S.seen(G,id)) return false;
    if(S.invited(G,id)){ S.mark(G,id); return false; }   /* 約好在這裡見面（AA 2026-11-02 20:54 第 2 點）：免點頭，對話照加（小聲）*/
    S.mark(G,id);
    if(GM.sceneBegin) GM.sceneBegin(); try{ if(GM.face&&!n.seat&&GM.E&&GM.E.player) GM.face(n,GM.E.player.obj.position.x,GM.E.player.obj.position.z); await GM.say(null,S.nodLine(id)); } finally { if(GM.sceneEnd) GM.sceneEnd(); }
    return true; };
  /* 一句台詞要不要加「（小聲）」：只有動作（整句在（）裡）、已經是小聲／氣音／口型／噓的不加 */
  const SOFT=/小聲|氣音|口型|噓|壓低聲音|悄悄/;
  S.needsPrefix=function(text){ const t=String(text==null?'':text).trim(); if(!t) return false;
    if(t.startsWith(S.PREFIX)) return false;
    if(t.startsWith(OUT_HEAD)) return false;   /* 「（走出法圖）「……」」：走出去以後才說的（1-D10）*/
    let rest=t, lead='';
    while(rest.startsWith('（')){ let depth=0, k=-1; for(let i=0;i<rest.length;i++){ const ch=rest[i]; if(ch==='（') depth++; else if(ch==='）'){ depth--; if(depth===0){ k=i; break; } } } if(k<0) break; lead+=rest.slice(0,k+1); rest=rest.slice(k+1).trim(); }
    if(!rest) return false;   /* 整句都是動作 */
    if(SOFT.test(lead)) return false;
    return true; };
  const isPhone=who=>{ const nm=who&&typeof who==='object'?who.name:who; return typeof nm==='string'&&nm.indexOf('（手機）')>=0; };
  /* 加上去（AA 2026-11-02 20:54 第 4 點）：開頭已經有動作括號的合成一個——「（抬頭）喔，hi。」→「（抬頭，小聲）喔，hi。」；好幾個括號的合進第一個；沒有括號的才在最前面加「（小聲）」*/
  S.quiet=function(text){ if(!S.needsPrefix(text)) return text; const s=String(text), k0=s.length-s.trimStart().length, t=s.slice(k0);
    if(!t.startsWith('（')) return S.PREFIX+s;
    let depth=0, k=-1; for(let i=0;i<t.length;i++){ const ch=t[i]; if(ch==='（') depth++; else if(ch==='）'){ depth--; if(depth===0){ k=i; break; } } }
    if(k<0) return S.PREFIX+s;
    let inner=t.slice(1,k), tail='';
    if(/[。]$/.test(inner)){ tail=inner.slice(-1); inner=inner.slice(0,-1); }   /* 「（抬頭。）」→「（抬頭，小聲。）」*/
    return s.slice(0,k0)+'（'+inner+'，小聲'+tail+'）'+t.slice(k+1); };
  S.whisper=function(GM,who,text){ if(!who||text==null||isPhone(who)) return text; if(!S.quietNow(GM)) return text;
    const G=G_(GM); if(who&&typeof who==='object'&&who.charId) S.mark(G,who.charId);
    return S.quiet(text); };
  return S;
})();
