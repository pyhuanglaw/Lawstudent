/* ===== 頁間書屋買東西（GG-YEJIAN-SHOP-1112；店面標準 CLAUDE.md §12 第 3、4 點：營業中有店員招呼、買得到書；BB_379：「買不到書：沒有結帳互動點」）=====
   字：src/data/yejian_shaola_buy.js（YEJIAN_SHAOLA_BUY.bookstore；tools/story/import_yejian_shaola.py 從 AA_853 匯入，企劃線 f6aa917593，AA 定稿、BB_397 第五節聽過；11-12 AA 回 LAWWW 的十點在稿的 lawww_1112）——
     五個點（書牆、新書推薦、雜誌、明信片、咖啡吧）的「看」、品名、價錢、買了以後的旁白、店員的招呼、錢不夠、還沒開門的那一句，一字照稿，這支不寫任何台詞。
   稿上沒有的系統字（S.SYS；回報給 AA）：選單「品名　N 元」的排法、「不用了」、提示「錢不夠」「包包已經放了 10 樣了」（都是別的店已經在用的字）；
     新加的兩個按鈕「看雜誌」「看明信片」＝「看」＋稿的點名（照現有「看新書」的寫法）。
   做法（互動點都在 src/zones3d.js buildYejian；走過去、面向書架、拿書去坐、端咖啡去坐照舊是 src/ggshops_sys3d.js 的 GGS）：
   - 書牆、新書推薦（配置現有的「看看書牆」「看新書」）：稿的 look 加進原本那幾句（AA_653）一起輪——每次按說一句；說完多一個選單：這個點賣的東西「品名　N 元」＋「不用了」。
       買了＝扣錢、時間 +9 分鐘（和店裡其他買東西一樣）、那一樣的旁白，到這裡為止；不用了＝照舊拿一本到位子上翻（AA_653 那一句「一本也沒拿」＝不出選單、不拿書）。
   - 雜誌、明信片（位置讀配置 src/data/yejian_layout.js interact 的 magazines、postcards——LAWWW2 11-12 補進配置；這支原本暫放的座標拿掉了，配置沒有那個點＝不放）：看（稿的 look）→ 同一種選單。
   - 咖啡吧（配置現有的「點咖啡」）：品項、價錢換成稿的四樣（美式 90、拿鐵 120、當日蛋糕 110、紅茶 80——紅茶是 AA 11-12 的答案加回來的；原本 AA_653 是美式 90、拿鐵 110、紅茶 80、今日蛋糕 100），點了以後店員多說稿的 order 那一句；
       其他照舊（AA_653 每天第一次那一句、磨豆機那一句、走到位子坐下喝；「買一份帶走送人…」的清單跟著這一份菜單）。
   - 招呼：那一天第一次按書牆／新書推薦／雜誌／明信片＝greet；在這裡買過 regular（3）次以上＝greet_regular。說話的人＝現有打烊那一句的「老闆」（src/xs_close3d.js XSCLOSE.whoOf；AA 11-12 lawww_1112 第 10 點：
       「打烊句說話人用現有的老闆；招呼那兩句也算老闆說的」；原本是稿 who 的「店員」）。咖啡吧 order 那一句照舊是稿的 who。店裡沒有人（關著、有班的人自己在店裡）＝不說、只看不賣。
       玩家自己當班（JOBS 的那一班是一整段場景，按不到互動點）＝本來就買不了，不另外加字。
   - 錢不夠：書牆＝稿的 no_money（那一句寫的是書牆上的空位）；新書、雜誌、明信片＝稿共用的那一句（資料 no_money2；AA 11-12 lawww_1112 第 8 點。原本是提示「錢不夠」）。都不扣錢。
   - 買的東西：own＝進選單「物品」（G.flags.GG3_OWN.bookstore[id]，GG3.ownAdd／GG3.OWN_X）；gift（店員推薦的新書、明信片）＝放進「包包裡的禮物」（GIFTH 的包包；稿：照一般禮物、不是節日禮物——
       和美國超市的三樣同一個做法：登記進 GIFT_HOLIDAY.items，love／no 都空＝收到的反應是一般的那一格；不加進「買禮物…」那一張清單）。包包滿了（10 樣）＝拿不了禮物。eat（咖啡吧）＝當場喝掉。
       二手法律書只是物品，不影響讀書（稿 notes；D118）。
   - 還沒開門（10:00 以前）按店門：稿的 not_open（SH831.LINE_X；打烊以後照舊是 AA_831 那一句）。打烊請出去那一句和稿的 closed_line 同一句（src/xs_close3d.js，照舊）。
   存檔只多 G.flags 的 YJ_GREET（今天招呼過＝那一天）、YJ_BUY_N（在這裡買過幾次），買的東西記在現有的 GG3_OWN、GIFTH.bag；舊存檔沒有＝都還沒發生，不用遷移。
   測試：node tests/yejian_buy_1112_unit.js；地點關卡 node tests/place_gate_unit.js */
'use strict';
const YJBUY=(function(){
  const S={};
  const X=()=>typeof YEJIAN_SHAOLA_BUY!=='undefined'&&YEJIAN_SHAOLA_BUY?YEJIAN_SHAOLA_BUY.bookstore||null:null;
  S.on=()=>!!X();
  S.ZONE='bookstore';
  S.SYS={price:(n,p)=>n+'　'+p+' 元',no:'不用了',poor:'錢不夠',look:'看'};
  S.HRS=0.15;   /* 買一樣 +9 分鐘（照 ggshops_sys3d.js 的 GGS.buy）*/
  S.CAFE='cafe_order';
  S.BROWSE=['shelf_browse','new_books','magazines','postcards'];
  S.NO_MONEY_AT=['shelf_browse'];   /* 稿的 no_money 寫的是「書牆上那個空位」：只在書牆說 */
  /* 雜誌、明信片兩個點：位置在配置（src/data/yejian_layout.js interact 的 magazines、postcards；這裡不放座標）。face＝走過去面向配置的哪一件家具（GGS.YJ_FACE）。
     按鈕的字＝「看」＋稿的點名（配置那兩筆不寫 label）。兩個點都站得住（tests/yejian_buy_1112_unit.js 用真的導航格驗）*/
  S.POINTS_X=[{kind:'magazines',face:'display_rack'},{kind:'postcards',face:'window_counter'}];
  const F_=G=>G.flags||(G.flags={});
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  S.point=k=>{ const d=X(); return d?d.points.find(p=>p.kind===k)||null:null; };
  S.clerk=()=>({name:X().staff.who});
  /* 招呼的人：現有打烊那一句的說話人（xs_close3d.js：頁間書屋＝老闆）；那一支沒載入＝稿的 who */
  S.greeter=()=>{ const w=typeof XSCLOSE!=='undefined'&&XSCLOSE.whoOf?XSCLOSE.whoOf(S.ZONE):null; return {name:w||X().staff.who}; };
  /* zones3d.js buildYejian 叫：雜誌、明信片（位置照配置的那兩筆；配置沒有＝不放）*/
  S.extraPoints=function(L){ if(!X()) return []; const out=[];
    for(const q of S.POINTS_X){ const P=S.point(q.kind), lay=L&&(L.interact||[]).find(i=>i.kind===q.kind); if(!P||!lay||typeof lay.x!=='number'||typeof lay.z!=='number') continue; out.push({kind:q.kind,x:lay.x,z:lay.z,label:lay.label||S.SYS.look+P.label}); }
    return out; };
  /* 店裡有沒有店員（開著、或那一天有約有班照常有人：SH831.staffed）*/
  S.staffed=function(G){ try{ return typeof SH831==='undefined'||!SH831.staffed||!!SH831.staffed(S.ZONE,G); }catch(e){ return true; } };
  S.canBuy=function(GM){ return S.staffed(GM.G)&&!(typeof JOBS!=='undefined'&&JOBS.running); };
  S.regular=G=>((G.flags||{}).YJ_BUY_N|0)>=(X().regular||3);
  /* 招呼：那一天第一次 */
  S.greet=async function(GM){ const G=GM.G, F=F_(G), T=X().staff; if(F.YJ_GREET===G.day||!S.staffed(G)) return false; F.YJ_GREET=G.day; await GM.say(S.greeter(),S.regular(G)?T.greet_regular:T.greet); return true; };
  const giftOn=()=>typeof GIFTH!=='undefined'&&!!GIFTH.rec&&!!GIFTH.item&&!!GIFTH.full;
  S.give=function(G,g){ if(g.kind==='gift'&&giftOn()&&GIFTH.item(g.id)) GIFTH.rec(G).bag.push({id:g.id,day:G.day,shop:S.ZONE});
    else if(g.kind!=='eat'&&typeof GG3!=='undefined'&&GG3.ownAdd) GG3.ownAdd(G,S.ZONE,g.id);
    const F=F_(G); F.YJ_BUY_N=(F.YJ_BUY_N|0)+1; };
  /* 這個點的選單。回傳 'bought'／'poor'＝到這裡為止；null＝沒買（照舊往下：拿書去坐）*/
  S.buy=async function(GM,it,k){ const G=GM.G, P=S.point(k); if(!P||!P.goods.length||!S.canBuy(GM)) return null;
    const c=await GM.choose(P.goods.map(g=>({t:S.SYS.price(g.n,g.p),dim:(+G.money||0)<g.p})).concat([{t:S.SYS.no}])); const g=c>=0&&c<P.goods.length?P.goods[c]:null; if(!g) return null;
    if((+G.money||0)<g.p){ const N2=X().no_money2; if(S.NO_MONEY_AT.includes(k)) await GM.say(null,X().no_money); else if(N2&&N2.text&&(N2.at||[]).includes(k)) await GM.say(null,N2.text); else if(GM.toast) GM.toast(S.SYS.poor); return 'poor'; }
    if(g.kind==='gift'&&giftOn()&&GIFTH.item(g.id)&&GIFTH.full(G)){ if(GM.toast) GM.toast('包包已經放了 '+GIFTH.MAX+' 樣了'); return 'poor'; }   /* gifthol3d.js 現有的那一句 */
    GM.money(-g.p); if(GM.advance) GM.advance(S.HRS); S.give(G,g); S.last={day:G.day,id:g.id,n:g.n,p:g.p,at:k};
    if(g.line) await GM.say(null,g.line);
    if(GM.autosave) GM.autosave(); return 'bought'; };
  /* ---------- 接到 GGS（src/ggshops_sys3d.js）：看的字、選單、咖啡吧的菜單 ---------- */
  S.wire=function(){ const d=X(); if(!d||typeof GGS==='undefined'||S._wired) return false; S._wired=true;
    const LK=GGS.LOOK.bookstore||(GGS.LOOK.bookstore={});
    for(const k of S.BROWSE){ const P=S.point(k); if(!P||!P.look) continue; const D=LK[k]||(LK[k]={day:[]}); if(!D.day.includes(P.look)) D.day.push(P.look); }   /* 稿的 look 和原本那幾句一起輪 */
    for(const q of S.POINTS_X) if(!GGS.YJ_FACE[q.kind]) GGS.YJ_FACE[q.kind]=q.face;
    GGS.YJX={ pre:async(GM,it,k)=>{ if(S.BROWSE.includes(k)) await S.greet(GM); }, buy:(GM,it,k)=>S.BROWSE.includes(k)?S.buy(GM,it,k):null };
    const C=S.point(S.CAFE), M=GGS.MENU[S.ZONE+'.'+S.CAFE];
    if(C&&M){ M.items=C.goods.map(g=>[g.n,g.p]); if(C.order) M.order=[d.staff.who,C.order]; }
    if(GGS.buy&&!GGS._yjbuy){ GGS._yjbuy=true; const b0=GGS.buy; GGS.buy=async function(GM,key){ const r=await b0.apply(this,arguments);   /* 咖啡吧點了東西也算「在這裡買過」*/
        try{ if(key===S.ZONE+'.'+S.CAFE&&r&&r!=='poor'&&r!=='gift'&&GM&&GM.G){ const F=F_(GM.G); F.YJ_BUY_N=(F.YJ_BUY_N|0)+1; } }catch(e){} return r; }; }
    return true; };
  S.wire();
  /* ---------- 禮物（店員推薦的新書、明信片）：登記進節日送禮那一套的包包（一般禮物；不進「買禮物…」的清單）---------- */
  S.giftReg=function(){ const H=typeof GIFT_HOLIDAY!=='undefined'?GIFT_HOLIDAY:null, d=X(); if(!H||!H.items||!d) return 0; let n=0;
    for(const P of d.points) for(const g of P.goods) if(g.kind==='gift'&&!H.items[g.id]){ H.items[g.id]={name:g.n,price:g.p,line:'',love:[],no:[],shop:S.ZONE}; n++; }
    return n; };
  S.giftReg();
  /* ---------- 「物品」：own 的東西列在 GG3 的那一格（禮物在包包那一格；GIFTH 沒載入＝也列在這裡）---------- */
  if(typeof GG3!=='undefined'&&Array.isArray(GG3.OWN_X)&&X()&&!GG3.OWN_X.some(q=>q.zone===S.ZONE)) GG3.OWN_X.push({zone:S.ZONE,name:X().name,goods:[].concat(...X().points.map(P=>P.goods.filter(g=>g.kind!=='eat').map(g=>({id:g.id,n:g.n}))))});
  /* ---------- 還沒開門：稿的 not_open（10:00 以前；打烊以後照舊是 AA_831 那一句）---------- */
  S.notOpen=function(G){ const d=X(); if(!d||!G||typeof PLACES==='undefined'||!PLACES.windowsOf) return null; let w=null; try{ w=PLACES.windowsOf(S.ZONE,G.day); }catch(e){ w=null; }
    return Array.isArray(w)&&w.length&&hr(G)<w[0][0]?d.staff.not_open:null; };
  if(typeof SH831!=='undefined'&&SH831.LINE_X&&X()) SH831.LINE_X[S.ZONE]=G=>S.notOpen(G);
  return S;
})();
if(typeof module!=='undefined') module.exports=YJBUY;
