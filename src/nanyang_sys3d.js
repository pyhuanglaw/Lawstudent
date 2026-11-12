/* ===== 南洋戲院的店員與買票（區域 xs_nanyang＝src/nanyang3d.js，配置 src/data/nanyang_layout.js 是 LAWWW2／BB 的；SHOP-STAFF-1107）=====
   使用者 11-07 試玩（原話）：「南洋戲院沒店員也無法買票」（存檔 day42 週二 22:21 在大廳）。
   原因：NY3.CLERK（店員站的地方）、NY3.TICKET（騎樓下的售票口）在 nanyang3d.js 定義了，但沒有任何地方接上——大廳只有 Alison 週五、週六 18:00～23:00 站櫃檯（src/shopnpc3d.js），
   其他時間櫃檯後面沒有人；整個戲院沒有買票的按鈕。
   企劃：AA_615 第 3 節（一張票看兩部、票價 150 元；售票窗在騎樓下；營業 09:30～24:00）、第 4 節（Alison「櫃檯和爆米花」）。稿裡沒有買票的台詞：這裡不加字。
   做法照同弦、木曜日（src/guitar3d.js、mokuyobi_sys3d.js 的 S.populate：STORY.populate 包一層、路人底模、不說話）＋大口漢堡（src/dakou_sys3d.js：包住區域的 build 加按鈕、STORY.interact 接）。
   - 店員：營業時間內（PLACES.isOpen）站在大廳爆米花櫃檯後面（NY3.CLERK＝配置 lobby.interact 的 clerk，收銀機前）；關門的時候沒有人（打烊那一句照 src/xs_close3d.js）。
     Alison 打工的那兩天（SHOP_NPC 南洋那一列的 days：週五、週六）她站 NY3.CLERK，店員改站爆米花機旁邊（S.ALT），兩個人不重疊。1 廳沒有店員。
   - 買票：騎樓下的售票口（NY3.TICKET，新生南路那一區；AA_615「售票窗在騎樓下」）和大廳櫃檯前（配置 popcorn 那一點：櫃檯、店員面前）兩個地方，按鈕「買票」。
     按了＝選單「買票　150 元」「不用了」（和其他店的選單同一個樣子）；錢不夠＝那一項變灰、按了只出「錢不夠」、不扣錢；買了＝扣 150 元（GM.money 的「💸 150 元」）、
     G.flags.NY_TICKET＝那一天（記一筆票）。今天已經買過＝兩個按鈕都藏起來（隔天再出現）。關門的時候按售票口＝寫開放時間（PLACES.closedText，和店門一樣）。
     進 1 廳照舊不看票（AA_615 沒寫要票才能進）。「坐下看電影」（轉暗、時間過去、旁白）在 src/aa614_3d.js（AA615-ALISON-CINEMA-1103）：有今天的票（S.hasTicket(G)）才演。
     缺 AA 的字：售票的人說的話、拿到票的旁白（現在只有選單和扣錢的提示）。
   存檔：只多一個旗標 G.flags.NY_TICKET（買票的那一天；舊存檔沒有＝今天沒有票）。
   測試：node tests/nanyang_staff_1107_unit.js */
'use strict';
const NYS=(function(){
  const S={};
  S.ZL='xs_nanyang'; S.STREET='xinsheng';
  S.PRICE=150;   /* AA_615 第 3 節：遊戲 150 元 */
  S.LABEL='買票'; S.NONE='不用了';
  S.SPEC=94;   /* 路人底模（STORY.extraSpec：偶數＝女）；91～93 是木曜日、日常失速、同弦 */
  S.ALT={x:-4.1,z:-3.7,yaw:Math.PI/2};   /* Alison 那兩天店員站的地方：爆米花機（z −4.7～−4.1）和紙杯疊中間，櫃檯後面 */
  const LAY=()=>typeof NANYANG_LAYOUT!=='undefined'?NANYANG_LAYOUT:null;
  const PL=()=>typeof PLACES!=='undefined'?PLACES:null;
  S.isOpen=G=>{ const P=PL(); return !P||!P.isOpen||P.isOpen(S.ZL,G.hour,G.day); };
  const wdOf=d=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d).wd%7:null;
  /* ---------- 店員 ---------- */
  S.alisonRow=()=>{ const D=typeof SHOP_NPC!=='undefined'?SHOP_NPC:null; return D&&Array.isArray(D.rows)?D.rows.find(r=>r&&r.zone===S.ZL&&r.hearBy==='alison')||null:null; };
  /* 今天是不是 Alison 可能來打工的那兩天（她站收銀機那一點）*/
  S.alisonDay=G=>{ const r=S.alisonRow(); if(!r||!Array.isArray(r.days)) return false; const wd=wdOf(G.day|0); return wd!=null&&r.days.includes(wd); };
  S.clerkAt=G=>{ const c=typeof NY3!=='undefined'?NY3.CLERK:null; if(!c) return null; return S.alisonDay(G)?Object.assign({},S.ALT):{x:c.x,z:c.z,yaw:c.yaw}; };
  S.populate=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.addNPC||G.zone!==S.ZL||typeof CHAR==='undefined'||!CHAR.build||!S.isOpen(G)) return null; if((E.npcs||[]).some(n=>n&&n.nyClerk)) return null;
    const at=S.clerkAt(G); if(!at) return null; const sp=Object.assign({},typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(S.SPEC):{}); sp.bag=null;   /* 站櫃檯不背包（同弦的老闆一樣）*/
    const o=CHAR.build(sp); if(!o) return null; o.position.set(at.x,0,at.z); o.rotation.y=at.yaw||0;
    return E.addNPC({obj:o,lv:0,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,clerk:true,nyClerk:true}); };
  /* ---------- 買票 ---------- */
  S.hasTicket=G=>!!G&&!!G.flags&&G.flags.NY_TICKET===(G.day|0);
  /* 員工票（AA_828 第 2 節，SHOP-JOBS-1112；規則在 src/jobs3d.js 的 JOBS.staffTicket*）：在這裡打工滿 3 班以後選單多一項「拿員工票（站著看）」——不用錢、一週一次、不能帶人。
     拿了＝今天有票（NY_TICKET）＋G.flags.NY_TICKET_STAFF＝那一天。約會看電影照買票：S.paidTicket（員工票不算，src/invites3d.js 讀）*/
  S.staffOpt=G=>{ const J=typeof JOBS!=='undefined'?JOBS:null; if(!J||!J.staffTicketOk||!J.staffTicketOk(G)) return null; const T=J.staffTicket(); return T?{t:T.opt,nyStaff:true}:null; };
  S.paidTicket=G=>S.hasTicket(G)&&G.flags.NY_TICKET_STAFF!==(G.day|0);
  const curG=()=>typeof GAME!=='undefined'&&GAME&&GAME.G?GAME.G:null;
  /* hidden：今天買過票＝藏起來；別的程式另外設 hidden（it.hidden=true）照樣藏（setter 記下來，不會因為沒有 setter 丟例外）*/
  const hideIfBought=it=>{ let own=false; Object.defineProperty(it,'hidden',{configurable:true,enumerable:true,get(){ const G=curG(); return own||(!!G&&S.hasTicket(G)); },set(v){ own=!!v; }}); return it; };
  /* 大廳：櫃檯前（配置 popcorn 那一點＝客人站的地方，面向店員）*/
  S.lobbyButton=function(E){ const L=LAY(); if(!E||!Array.isArray(E.interactables)||!L) return null; if(E.interactables.some(q=>q&&q.nyTicket)) return null;
    const p=(L.lobby.interact||[]).find(q=>q.kind==='popcorn'); if(!p) return null;
    const it=hideIfBought({x:p.x,z:p.z,radius:0.9,lv:0,label:S.LABEL,nyTicket:'lobby'}); E.interactables.push(it); return it; };
  /* 新生南路：騎樓下的售票口（NY3.TICKET）*/
  S.streetButton=function(E){ if(!E||!Array.isArray(E.interactables)||typeof NY3==='undefined') return null; if(E.interactables.some(q=>q&&q.nyTicket)) return null;
    const t=NY3.TICKET; if(!t) return null; const it=hideIfBought({x:t.x,z:t.z,radius:1.0,label:S.LABEL,nyTicket:'street'}); E.interactables.push(it); return it; };
  S.buy=async function(GM){ const G=GM.G; G.flags=G.flags||{};
    if(!S.isOpen(G)){ const P=PL(); if(GM.toast&&P&&P.closedText) GM.toast(P.closedText(S.ZL,G.hour,G.day),4500); return 'closed'; }
    if(S.hasTicket(G)) return 'have';
    const hO=typeof GIFTH!=='undefined'&&GIFTH.shopOpt?GIFTH.shopOpt(G,'xs_nanyang'):null;   /* 售票口的買禮物（GIFT-HOLIDAY-1110，src/gifthol3d.js）*/
    const sO=S.staffOpt(G);   /* 員工票：排在「買票」下面 */
    const short=(G.money|0)<S.PRICE; const O=[{t:S.LABEL+'　'+S.PRICE+' 元',dim:short}].concat(sO?[sO]:[],hO?[hO]:[],[{t:S.NONE}]); const i=await GM.choose(O);
    if(sO&&O[i]===sO){ JOBS.staffTicketTake(G); if(GM.autosave) GM.autosave(); return 'staff'; }
    if(hO&&O[i]===hO){ await GIFTH.pick(GM,hO); return 'gift'; }
    if(i!==0) return null;
    if((G.money|0)<S.PRICE){ GM.toast('錢不夠'); return 'short'; }
    GM.money(-S.PRICE); G.flags.NY_TICKET=G.day|0;
    if(GM.autosave) GM.autosave(); return 'bought'; };
  /* ---------- 接到遊戲 ---------- */
  const wrapBuild=(Zb,tag,fn)=>{ if(!Zb||Zb[tag]) return; Zb[tag]=true; const b0=Zb.build; Zb.build=function(E){ const z=b0.apply(this,arguments); try{ fn(E); }catch(e){ console.warn('NYS.'+tag,e); } return z; }; };
  if(typeof Z3!=='undefined'&&Z3.ZONES){ wrapBuild(Z3.ZONES[S.ZL],'_nysLobby',S.lobbyButton); wrapBuild(Z3.ZONES[S.STREET],'_nysStreet',S.streetButton); }
  if(typeof STORY!=='undefined'&&!STORY._nys){ STORY._nys=true;
    if(STORY.populate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ if(zoneId===S.ZL) S.populate(GM); }catch(e){ console.warn('NYS.populate',e); } return r; }; }
    if(STORY.interact){ const oi=STORY.interact; STORY.interact=async function(it,GM){ if(it&&it.nyTicket&&GM&&GM.G){ GM.sceneBegin(); try{ await S.buy(GM); } finally { GM.sceneEnd(); } return true; } return oi.apply(this,arguments); }; } }
  return S;
})();
if(typeof globalThis!=='undefined') globalThis.NYS=NYS;
