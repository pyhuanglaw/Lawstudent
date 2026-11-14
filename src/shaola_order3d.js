/* ===== 公館燒臘點餐（GG-SHAOLA-FIX-1112；店面標準 CLAUDE.md §12 第 3、4 點：點得到餐、價錢、錢不夠有對應）=====
   字：src/data/yejian_shaola_buy.js（YEJIAN_SHAOLA_BUY.noodle；tools/story/import_yejian_shaola.py 從 AA_853 匯入，企劃線 f6aa917593，AA 定稿、BB_397 第五節聽過；11-12 AA 回 LAWWW 的答案在稿的 lawww_1112：說話人用現有的「阿姨」、順序照現在的、系統字可以）——
     菜單六樣和價錢、加滷蛋、阿姨的話、每一樣吃的旁白、看菜單、看櫥窗一字照稿，這支不寫任何台詞。
   稿上沒有的系統字（S.SYS；回報給 AA）：選單「品名　N 元」的排法、「先不吃」（原本燒臘店選單的字）、加滷蛋那一層的「不用了」、提示「錢不夠」「有人坐了。」（都是別的店已經在用的字）。
     說話的人的名字＝現有對話框的「阿姨」（src/data/eat_lines.js staff 的 who；稿的 who 寫「阿鳳阿姨」，同一場裡熟客句是「阿姨」說的，名字不能兩種）。
   點餐掛在哪：稿沒有寫，照原本的設計掛在每一張桌子的「坐下吃飯」（story3d.js noodleScene 叫這裡的 S.order；不另外做櫃台點餐）：
     阿姨 greet → 選單（六樣＋熟客的「老樣子」＋「先不吃」；EAT.choose：第 5 次那一句、老樣子照舊）→ 點飯的再問一次加滷蛋（付得起才問；老樣子＝照上次有沒有加）
       → 付錢 → 阿姨 order_done → 走到位子坐下、時間 +30 分鐘 → 阿姨 call（單點例湯是自己舀的，不叫）→ 吃的旁白（稿 eat 那一樣）。
     例湯：單點 20 元；配飯的那一碗不用錢（稿 notes），所以點了飯以後沒有「加湯」。
   記帳（稿 no_money_note；BB_397 第五節四點）：
     ① 錢不夠、沒有欠帳＝阿姨 no_money「先吃，下次一起算。」：這一餐不扣錢，記在 G.flags.SHAOLA_TAB（＝這一餐的價錢；不加滷蛋）。舊存檔沒有這個欄位＝沒有欠帳（S.tab 讀的時候不寫存檔）。
     ② 欠著、這次付得起（這次＋上次）＝阿姨 tab_pay「上次的一起算，總共 {n}。」一次扣掉、欠帳清掉。
     ③ 欠著、這次又不夠＝阿姨 tab_refuse：不點餐、不再欠（同時只欠一次）；坐下喝一碗湯（湯的旁白＝稿 eat 的例湯那一句；時間 +15 分鐘；不算一餐：不記「吃過的」、不算熟客次數）。
     ④ 欠帳只是一個數字，只有在這間店點餐的時候才讀；畢業、搬走、去交換、換學期都不動它（稿：欠帳留著不處理）。錢只在付得起的時候扣，不會變成負的。
     阿姨不在店裡（EAT.staffAway；現在不會發生，留給舊的呼叫）＝阿姨的話都不說、不記帳也不收帳：錢不夠＝提示「錢不夠」。
   位子：按的那一張有客人坐著＝坐同一桌對面那一張；兩張都有人＝提示「有人坐了。」（不點餐）。
   「看菜單」「看櫥窗」（配置 src/data/shaola_layout.js interact 的 menu、case；zones3d.js buildShaola 放互動點）＝稿的 menu_look、window_look。
   存檔只多：G.flags.SHAOLA_TAB（欠的錢；沒有＝0）、G.eat.slEgg（上次有沒有加滷蛋；沒有＝沒加）。
   測試：node tests/shaola_order_1112_unit.js */
'use strict';
const SHAOLA=(function(){
  const S={};
  const X=()=>typeof YEJIAN_SHAOLA_BUY!=='undefined'&&YEJIAN_SHAOLA_BUY?YEJIAN_SHAOLA_BUY.noodle||null:null;
  S.on=()=>!!X();
  S.KEY='阿鳳麵店';   /* EAT 的店名鍵（照舊：熟客次數、老樣子、吃過的都記在這個鍵；畫面上顯示「公館燒臘」）*/
  S.TAB='SHAOLA_TAB';
  S.SYS={price:(n,p)=>n+'　'+p+' 元',no:'先不吃',noAdd:'不用了',poor:'錢不夠',taken:'有人坐了。'};
  S.HRS={meal:0.5,soup:0.25};
  S.OLD={'乾麵':'叉燒飯','餛飩湯':'燒鴨飯'};   /* AA_612 第 1 節：舊存檔（麵店那時候）的「老樣子」照燒臘店的品項認 */
  const F_=G=>G.flags||(G.flags={});
  const E_=()=>typeof EAT!=='undefined'?EAT:null;
  /* 欠的錢：只讀；沒有、壞掉的資料＝0 */
  S.tab=function(G){ const v=G&&G.flags?G.flags[S.TAB]:0; return typeof v==='number'&&isFinite(v)&&v>0?Math.floor(v):0; };
  S.auntHere=function(GM){ const e=E_(); try{ return !(e&&e.staffAway&&e.staffAway(GM,S.KEY)); }catch(err){ return true; } };
  /* 說話的人：現有的「阿姨」（eat_lines.js）；沒有載入＝稿的 who */
  S.who=function(GM){ const L=typeof EAT_LINES!=='undefined'&&EAT_LINES&&EAT_LINES.staff?EAT_LINES.staff[S.KEY]:null, e=E_();
    const nm=L&&e&&e.staffName?e.staffName(GM.G,S.KEY,L):(L&&L.who?String(L.who).replace(/（.*?）/g,''):X().staff.who); return {name:nm}; };
  const affordable=(G,n)=>(+G.money||0)>=n;
  /* 位子：按的那一張沒人＝坐那一張；有客人＝同一桌對面那一張；都有人＝null */
  S.seatFor=function(GM,it){ if(!it||!it.seat) return null; if(!GM.freeSeat) return it.seat; for(const s of [it.seat,it.pairSeat]){ if(s&&GM.freeSeat(s)===s) return s; } return null; };
  /* 第 5 次那一句這一次會不會說（EAT.choose 會說「你坐，我知道你要什麼。」）：會＝這一次不說 greet */
  S.line5Due=function(GM){ const e=E_(); if(!e||!e.staffOn||!e.count||!e.rec) return false; try{ const T=e.staffOn(GM,S.KEY); return !!T&&!!T.line5&&e.count(GM.G,S.KEY)>=4&&e.rec(GM.G).l5[S.KEY]==null; }catch(err){ return false; } };
  /* 點餐。回傳 null＝沒點（先不吃、阿姨不在又錢不夠）；{soupOnly:true}＝欠著又不夠，只喝湯；{item, egg, cost, paid, owed}＝點了 */
  S.order=async function(GM){ const G=GM.G, D=X(); if(!D) return null; const T=D.staff, F=F_(G), e=E_(), aunt=S.auntHere(GM), W=S.who(GM), tab=aunt?S.tab(G):0;
    if(e&&e.rec){ const R0=e.rec(G).last; if(S.OLD[R0[S.KEY]]) R0[S.KEY]=S.OLD[R0[S.KEY]]; }
    if(aunt&&!S.line5Due(GM)) await GM.say(W,T.greet);
    const names=D.menu.map(m=>m.n), prices=D.menu.map(m=>m.p);
    const opts=D.menu.map(m=>({t:S.SYS.price(m.n,m.p),dim:!affordable(G,m.p+tab)})).concat([{t:S.SYS.no}]);
    if(e) e._usual=false;
    const i=e&&e.choose?await e.choose(GM,S.KEY,opts,names,prices):await GM.choose(opts);
    if(!(i>=0&&i<names.length)) return null;
    const m=D.menu[i], rice=m.n!==D.soup, usual=!!(e&&e._usual); let egg=null;
    if(rice&&D.addon.length&&affordable(G,m.p+tab)){ const a0=D.addon[0];
      if(usual){ if(e.rec(G).slEgg&&affordable(G,m.p+tab+a0.p)) egg=a0; }   /* 老樣子：照上次有沒有加 */
      else { const k=await GM.choose(D.addon.map(a=>({t:S.SYS.price(a.n,a.p),dim:!affordable(G,m.p+tab+a.p)})).concat([{t:S.SYS.noAdd}]));
        if(k>=0&&k<D.addon.length){ if(affordable(G,m.p+tab+D.addon[k].p)) egg=D.addon[k]; else if(GM.toast) GM.toast(S.SYS.poor); } } }
    const cost=m.p+(egg?egg.p:0), total=cost+tab; let paid=0, owed=0;
    if(affordable(G,total)){ if(tab>0){ await GM.say(W,T.tab_pay.replace('{n}',String(total))); delete F[S.TAB]; } GM.money(-total); paid=total; }
    else if(!aunt){ if(GM.toast) GM.toast(S.SYS.poor); return null; }
    else if(tab>0){ await GM.say(W,T.tab_refuse); return {soupOnly:true}; }   /* 同時只欠一次：不點餐、不再欠 */
    else { await GM.say(W,T.no_money); F[S.TAB]=cost; owed=cost; }   /* 先吃，下次一起算（錢不動）*/
    if(e&&e.rec&&rice) e.rec(G).slEgg=!!egg;
    if(aunt&&!owed) await GM.say(W,T.order_done);
    return {item:m.n,egg:egg?egg.n:null,cost,paid,owed,soup:!rice,aunt}; };
  /* 坐下以後：好了叫你（單點例湯是自己舀的，不叫；阿姨不在不叫）*/
  S.called=async function(GM,od){ if(!od||od.soup||od.soupOnly||!od.aunt) return false; await GM.say(S.who(GM),X().staff.call); return true; };
  /* 吃的旁白（稿 eat）；只喝湯＝例湯那一句 */
  S.eatLine=function(od){ const D=X(); if(!D||!od) return null; return D.eat[od.soupOnly?D.soup:od.item]||null; };
  /* 價目（舊的備用房間牆上那一條：zones3d.js）：從資料排，和選單同一份 */
  S.boardText=function(){ const D=X(); return D?D.menu.concat(D.addon).map(m=>m.n+' '+m.p).join(' ・ '):''; };
  /* 「看菜單」「看櫥窗」*/
  S.LOOK={menu:'menu_look',case:'window_look'};
  S.interact=async function(it,GM){ const D=X(), k=it&&S.LOOK[it.shaola]; if(!D||!k||!D[k]) return false; GM.sceneBegin(); try{ await GM.say(null,D[k]); } finally { GM.sceneEnd(); } return true; };
  if(typeof STORY!=='undefined'&&STORY.interact&&!STORY._shaolaInteract){ const o0=STORY.interact;
    STORY.interact=async function(it,GM){ if(it&&it.shaola&&GM&&GM.G&&GM.G.zone==='noodle'&&await S.interact(it,GM)) return true; return o0.apply(this,arguments); };
    STORY._shaolaInteract=true; }
  return S;
})();
if(typeof module!=='undefined') module.exports=SHAOLA;
