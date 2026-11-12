/* ===== 公館三間＋汀州路三間店的店內互動與台詞（GG-SHOPS3-STORY-1110／GG-SHOPS3-SYS-1110；USER_WANTS X320、X321；LAWWW 2026-11-11）=====
   店：安泰藥局 gg_antai、汀州鮮果 gg_xianguo、榮恩典文具社 gg_rongendian（公館）；泰米村食 tz_taimi、洗樂洗衣坊 tz_xile、印得好 tz_yindehao（汀州路）。
   場景是 LAWWW2 的（src/tz_shops3d.js 建區域、出入口、座位、互動點；配置 src/data/tz_shops_layout.js），這支不改它們，只包區域的 build、接 STORY.interact／onSeat／TICKS。
   台詞：src/data/gg3_shops_lines.js（GG3_LINES，tools/shops/import_gg3_shops.py 從 AA_742、AA_813 匯入，企劃線 75f5de658，AA 定稿 D109）——這支不寫任何台詞。
   稿上沒有的地方用系統提示（toast「錢不夠」「買了○○」「今天洗過了。」）和選項的字（「買」「不用了」「點好了」「不用切」），不自己補台詞（列在回報給 AA 補）。
   做法照公館第二批（src/gg2shops3d.js），不改它：
   - 營業時間：src/data/places.js 的 hours（區域 id；AA_742 開頭的表）；颱風假六間都關（typhoonShops）。關門時按店門（公館騎樓的「進入○○」、汀州路的「進○○」）：
     颱風假＝洗樂那一句（其他間稿上沒有＝只寫開放時間）；那天公休（印得好、榮恩典週日；泰米週一）＝公休那一句；打烊以後（到清晨 6 點）＝關門那一句；
     開門以前＝只寫開放時間。說完都另外 toast 開放時間（PLACES.closedText）。（泰米村食的午休 11-12 取消：AA_742 @ 90fb5fa77，X349——午休那一句、休息的木牌都拿掉了。）
   - 進門：一天第一次進來（一個人；今天約在這裡的不說），隨機一句（G.flags.GG3_DOOR＝{區域: 那天}）。洗樂 24 小時照樣有進門句。
   - 打烊（人還在店裡）：這一趟進來時開著、或那一刻（關門後半小時內）＝那間店自己的那一句（AA_742 每間的「打烊」，取代 AA_700 的通用句；說話的人照稿：藥師、老闆、店員、老闆娘），
     走到店門外（區域的出口按鈕：配置的 out）。颱風假、讀檔回到打烊以後＝不說、走出去、寫開放時間。洗樂只有颱風假會請你出去。
   - 安泰藥局：藥師櫃台＝照情況挑一句（21:00 以後／期中期末考週／十一月到二月 有就從這幾句挑；沒有＝平常兩句＋「第二次以後來」（以前哪一天來過）），一天挑一次（同一天再按＝同一句，G.flags.GG3_TALK）；
     看貨架＝八樣（暖暖包只有 11～2 月）→ 那一樣的「看的時候的一句」→ 買（扣錢、時間 +S.HRS.buy、toast）／不用了；量血壓＝說明那一句、坐上血壓計前的椅子（有空的話）、量完那一句；看藥品櫃。
   - 汀州鮮果：秤重結帳＝那天第一次先說情境（20:00 以後香蕉 30／期末考週／17:00～20:00「切好的在冰箱。」改老闆說，AA_813）→ 老闆「要什麼？」→ 選單（香蕉 20:00 以後 30）→ 那一樣的「看」
     → 芭樂、鳳梨問「切好」（+5 分鐘、不加錢）→ 錢不夠＝老闆那一句（不扣錢）→ 買了隨機一句（「學生喔？算你整數。」只在總額 5 結尾、一定說、少算 5 元＝穩的那一種）；
     水果禮盒＝那天第一次是禮盒那兩句（老闆＋旁白）。挑水果、切好的水果盒、看紙箱＝看。收音機那一句進門句、吊秤、收音機不接（AA_813）。
   - 榮恩典文具社：結帳＝那天第一次先說情境（學期第 1～2 週／期中期末考前一週／十二月；女兒週末不接，AA_813）→ 三類（上課、畫材、送禮）→ 一樣 → 錢不夠＝老闆那一句＋只有「不用了，我下次再買」（不賒帳）
     → 買了隨機一句（試寫的那一句只在買筆、「筆記本買這個牌子對」只在買筆記本）→ 卡片、包裝紙那天第一次問「要不要我幫你包？」（好＝旁白、時間 +10 分鐘）；
     特價推車＝特價筆記本三本 60；看筆、看畫材、看筆記本、看畫架（AA_813）。祝福卡、算盤（配置沒有點）不接。
   - 洗樂洗衣坊：洗衣機＝只洗／洗＋烘／算了 →「在這裡等」（坐到「坐著等」的塑膠椅、等的時候一句、時間照分鐘過）／「先去別的地方」（走出店門；G.flags.GG3_WASH 記好的時間，
     回到店裡已經好了＝回來的時候一句，在店裡等到時間到也一樣；過了 24 小時還沒回來＝不再說）；一天最多洗一次（G.flags.GG3_WASH_DAY）。兌幣機・洗衣精＝換零錢的旁白、洗衣精（旁白）、柔軟精（稿上沒有旁白＝只扣錢）。
     布告欄、補貨的老闆娘、等的時候提到布告欄那一句不接（AA_813）。
   - 印得好：櫃台＝印講義、影印報告、裝訂期末報告（期末考週和前一週）、印履歷／備審資料（大四起）→ 錢不夠＝店員那一句 → 點完隨機一句（「好，十分鐘。」只在十分鐘的）；
     裝訂＝那兩句；備審＝那兩句（老闆那一句改店員說，AA_813）；看價目表、裝訂樣本、自助電腦、自助影印（AA_813）。騎樓樣本架不接。
   - 泰米村食：點餐＝老闆娘「要吃什麼？」→ 主餐、湯、飲料各一樣（打拋豬 11:00～14:00 特價 95；菜單的說明當選項的提示）→ 主餐問辣度（椒麻雞、炒河粉不問；「正常」多一句）→ 點好了
     → 錢不夠＝不是中午才說老闆娘那一句（中午＝「錢不夠」）、不扣錢 → 點完隨機一句（奶茶那句只在點奶茶、加蛋那句只在點打拋）→ 吃過的登記 EAT（店名「汀州路・泰米村食」）
     → 坐到最近的空位（自己帶位也說坐下那一句）吃 30 分鐘、吃的旁白照點的菜挑（沒有對得上的＝不說）。看菜單板、看廚房（AA_813 開放式廚房）、看照片；坐下＝兩人桌／四人桌那一句。調味料架不接。
     約去吃：src/data/invites.js 那一套（地點 tz_taimi；吃飯那一類、有點熟以上；午餐 11:30～13:30、晚餐 17:30～20:00、週一不排）；答應的一句七位＋一般（包 INV.personal）；坐下以後的開場句 seatOpen.tz_taimi。
   - 店員站的位置（zone.shopClerk）：開店時放一個路人模型站著（STORY.populate 之後；洗樂沒有店員）。區域的座位補成 zone.seats（約會一起坐、帶位用）。
   - 舊存檔：已經排好的行程地點、標題「公館・日日定食」「公館的日日定食」→「汀州路・泰米村食」「汀州路的泰米村食」（S.migrate，game3d.js 的 migrate 叫；AA_742 第 ③ 節）。
   - 舊存檔：手機訊息、筆記裡的「日日定食」也換（明軒清單筆記整份換成現在的；BB 11-11 19:25，只做一次＝G.flags.GG3_REN）。
   - 汀州路的小館（TINGZHOU-SHOPS5-1110；越好吃小館 tz_yuehaochi，AA_821 企劃線 7917d4289）：字在 src/data/tz_meal_lines.js（TZ_MEAL_LINES，tools/shops/import_tz_meals.py 匯入，一間一份 JSON）。
     有載到那個檔＝S.addMeals 把每一間加進 S.ZONES／S.LAYID／台詞表，進門、打烊、門口、看、店員、座位都走上面同一套（和泰米村食一樣）；這裡只多：
     點餐（S.mealOrder）＝「要吃什麼？」→ 菜單（稿的名字、價錢；一樣最多點一份，可以點好幾樣）→ 點好了 → 錢不夠＝稿的那一句旁白、不扣錢 → 扣錢 → 點完一句（只點 afterOnly 那一樣＝那一句；
     有 afterNo（稿的 after_no_pho）而且沒有點那幾樣（河粉）＝afterNo 那一句；其他＝after 隨機一句——「香草自己夾喔」只在有點河粉時說）
     → 吃過的登記 EAT（店名「汀州路・○○」）→ 坐到最近的空位（自己帶位也說坐下那一句）→「吃」的第一句 → 吃 30 分鐘（和泰米一樣）→ 第二句；
     一次點好幾樣只演一樣的「吃」（S.mealPick：照 eatFirst 的組別 河粉 > 春捲 > 法國麵包 > 咖啡，同一組先點的那一樣；沒有 eatFirst＝第一樣）；
     只點 afterOnly 那一樣（咖啡）＝15 分鐘（S.HRS.mealDrink）、不算一餐（不登記 EAT）；
     開門以前（清晨 6 點到開門）按店門＝notOpen（稿的 staff.not_open）那一句旁白＋開放時間，不用打烊的 sign（以上 AA 11-12 回 LAWWW-C 七問，稿 _meta.lawww_1112）；
     坐下＝稿只有一句（seat.sit）就每一桌都說那一句；互動點按鈕的字照稿（labels，S.attach 換掉配置的字）。約去吃這一批不做、沒有公休、颱風假照通用的（只寫開放時間）（AA 11-12）。
     客居雲南 tz_keju（SHOP-LIFE-AA826-1112；AA_825 企劃線 90fb5fa77）：同一套、同一個資料檔。11:00～21:00 中午不休息；六樣菜、一次點好幾樣只演第一樣的「吃」（eatFirst＝稿的順序，由上到下）；
     點完那一句：有點過橋米線＝afterHas（稿的 order.after_guoqiao「好，過橋米線。等一下湯很燙，不要直接喝。」），其他＝after 兩句隨機；沒有 afterOnly＝點什麼都算一餐、吃 30 分鐘。
     稿的 looks 對配置的點（SHOP-AA826B-1112，AA_825 @ f231f0514）：menu＝tz_keju_menu（匯入工具 SCRIPTS 的 look_map）；tz_keju_batik（看牆上）、tz_keju_tea（看茶餅櫃）、tz_keju_kitchen（看廚房）稿直接寫配置的 kind。
     配置的五個互動點都有稿的字（匯入工具 all_points：少一個＝停下來）；稿原本的「看桌上」（looks.table）AA 拿掉了。老闆娘＝路人底模 64（偶數＝女性）。
     下一間：AA 交同樣格式的稿、匯入工具加一列、places.js 加名字和時間就好，這支不用改。
   - 汀州路的雜貨店（TINGZHOU-SHOPS5-1110；東南大聯商行 tz_dongnan，AA_823 @ 3d0ab9944）：字在 src/data/tz_grocery_lines.js（TZ_GROCERY_LINES，tools/shops/import_tz_grocery.py 匯入）。
     有載到那個檔＝S.addGroceries 把每一間加進 S.ZONES／S.LAYID／台詞表，進門、打烊、門口（開門以前＝notOpen、打烊以後＝sign）、店員、按鈕的字都走上面同一套；沒有座位。這裡只多：
     貨架（S.groceryShelf；四個點）＝稿的「看」那一句旁白 → 這個貨架的東西（稿的名字＋價錢；那一樣的一句說明當選項的提示，和泰米村食的菜單說明一樣）→ 選了＝稿的 pick 那一句旁白（每拿一樣說一次）、拿在手上（一樣最多一份、可以拿好幾樣；
     拿過的不再列；「不用了」的提示寫手上有什麼、共幾元）。手上的東西不進存檔（S.hand：只記這一趟進店；走出去、讀檔＝沒有了）。
     結帳（S.groceryPay）＝手上沒有東西：稿的 empty 旁白；有：老闆「就這些嗎？」→「買」（提示：東西、共幾元）／「不用了」（＝不買，稿的 counter.cancel 那一句旁白、東西放回去、不扣錢）
     → 錢不夠＝稿的 no_money 旁白（東西放回架上、不扣錢）→ 扣錢、時間 +S.HRS.buy → 老闆一句：買的東西裡有 afterIf.ids（泡麵、五包裝、辣醬）＝after_spicy 那一句，其他＝after 隨機一句。
     買的東西進「物品」（AA 11-12 回 LAWWW-C 第 ⑦ 點；使用者 X277、X291）：記在 G.flags.GG3_OWN＝{區域:{東西的 id:幾份}}（S.own、S.ownAdd；同一樣隔一趟再買＝份數加一）；
     選單「物品」分頁（game3d.js openMenu：GIFTH.renderBag 後面接 S.ownHTML）一間店一格——店名（稿）、底下一行一樣（稿的名字，兩份以上寫 ×n；順序照稿）。這一版沒有用途（不能用、不能吃、不能送）。
     舊存檔沒有 GG3_OWN＝什麼都沒買過（S.own 讀的時候不寫存檔；資料壞掉、稿裡沒有的 id＝不列）。一趟一樣一份、老闆是男的（S.CLERK_I 奇數）、每天 10:00～21:30 沒有公休、颱風假照通用的（AA 11-12 ④⑤⑥ 確認）。
   - 汀州路的手機通訊行（TINGZHOU-SHOPS5-1110；汀州聯通 tz_liantong，AA_824 @ 2ec610d95）：同一個資料檔、同一支匯入工具（SCRIPTS 的 kind:'service'），S.addGroceries 一樣加進來；
     進門、打烊、店員（男的）、按鈕的字、貨架（看手機殼＝手機殼；看配件＝充電線、充電頭、行動電源、有線耳機；拿起＝稿的 pick）、「物品」都走雜貨店那一套。這間多的：
     櫃台（S.serviceCounter；資料檔 grocery.services 有東西的店）＝店員「今天要弄什麼？」→ 三樣服務（稿的名字；提示＝幾元、幾分鐘）＋手上有東西才有「買」＋「不用了」。
       服務：錢不夠＝稿的 no_money 旁白（不扣錢、時間不動）→ 扣錢（0 元的不扣）→ 稿的句子，時間照稿的分鐘過 → 稿寫了 item 的（貼保護貼）記進「物品」（保護貼（已貼）；再貼一次還是一份）→ 店員 counter.after 那一句。
       檢測手機、貼保護貼（資料檔 wait:true；手機交給店員、等十分鐘）＝坐到櫃台前的圓凳（有空位的話；和洗樂「在這裡等」一樣），第一句後面演稿的 seat.wait（「你坐著等。……」）、暗一下、時間過，再接後面的句子；
       沒有空位＝站著，不演 seat.wait。問門號方案（5 分鐘）站著問、可以一直問。
       買＝和雜貨店的結帳一樣（扣錢、時間 +S.HRS.buy、記進「物品」），說 counter.after；錢不夠＝no_money 旁白、東西掛回去；「不用了」手上有東西＝稿的 cancel 旁白（掛回去）。
     自己坐到圓凳上（按鈕照稿「坐著等」）＝稿的 seat.sit 那一句。看展示機、看門號方案＝只有「看」那一句。
     稿沒有 closed_outside，只有 not_open 一句（「鐵門拉下來……」）＝門口關著（開門以前、打烊以後）都說那一句（S.doorLine）；沒有公休、颱風假照通用的（只寫開放時間）。
   存檔只多 G.flags 的 GG3_OWN（上面雜貨店、通訊行買的東西）、GG3_DOOR、GG3_SIT、GG3_GIFT、GG3_WRAP、GG3_TALK、GG3_SEEN、GG3_WASH、GG3_WASH_DAY、GG3_REN；舊存檔沒有＝都還沒發生，不用遷移。
   測試：node tests/gg_shops3_story_1111_unit.js */
'use strict';
const GG3=(function(){
  const S={};
  const D=()=>typeof GG3_LINES!=='undefined'?GG3_LINES:null;
  S.ZONES=['gg_antai','gg_xianguo','gg_rongendian','tz_taimi','tz_xile','tz_yindehao'];
  S.LAYID={gg_antai:'antai',gg_xianguo:'xianguo',gg_rongendian:'rongendian',tz_taimi:'taimi',tz_xile:'xile',tz_yindehao:'yindehao'};
  const LAY=k=>typeof TZ_SHOPS_LAYOUT!=='undefined'&&TZ_SHOPS_LAYOUT?TZ_SHOPS_LAYOUT[S.LAYID[k]]||null:null;
  S.HRS={buy:0.15,taimiEat:0.5,mealEat:0.5,mealDrink:0.25};   /* 買東西（照 ggshops_sys3d.js、story3d.js 的 counter：0.15 小時）；泰米吃 30 分鐘（AA_742）*/
  S.EAT_KEY='泰米村食'; S.EAT_SHOP='汀州路・泰米村食';
  S.SEASON={'暖暖包（十片）':[11,12,1,2]};   /* AA_742：「只有十一月到二月才擺出來。」*/
  S.TAIMI_KEY={'打拋豬肉飯':'打拋','泰式椒麻雞飯':'椒麻雞','綠咖哩雞肉飯':'綠咖哩','泰式紅咖哩飯':'紅咖哩','泰式炒河粉':'炒河粉','泰式酸辣湯':'酸辣湯','泰式奶茶':'奶茶'};   /* 句子提到哪一道＝那一道有點才說 */
  S.TAIMI_CAT=n=>/湯$/.test(n)?'soup':(/茶$/.test(n)?'drink':'main');   /* 主餐＋湯＋飲料（AA_742）*/
  S.RONG_PEN=['原子筆（一枝）','三色筆','自動鉛筆','螢光筆（五色一組）'];   /* 「老闆把你買的筆一枝一枝在試寫紙上畫過」＝買了這幾樣才說 */
  S.CLERK_I={gg_antai:60,gg_xianguo:61,tz_taimi:62,gg_rongendian:63,tz_yindehao:65,tz_yuehaochi:66,tz_dongnan:67,tz_liantong:69,tz_keju:64};   /* 店員的路人模型（STORY.extraSpec：偶數＝女性、奇數＝男性；藥師、老闆娘是女的，鮮果、榮恩典、東南大聯的老闆、汀州聯通的店員（稿：「他」）是男的）*/
  S.RENAME=[['公館・日日定食','汀州路・泰米村食'],['公館的日日定食','汀州路的泰米村食'],['日日定食','泰米村食']];   /* AA_742 第 ③ 節：舊存檔的行程地點 */
  /* 系統字（稿上沒有；回報給 AA）*/
  S.SYS={no:'不用了',buy:'買',done:'點好了',noCut:'不用切',short:'錢不夠',bought:'買了',washed:'今天洗過了。'};
  S.rand=()=>Math.random();
  /* 汀州路的小館（TZ_MEAL_LINES：一間一份稿）：加進同一套（區域、配置 id、台詞表）；沒有載到那個檔＝照舊六間 */
  S.MEALS=[];
  S.addMeals=function(){ const M=typeof TZ_MEAL_LINES!=='undefined'?TZ_MEAL_LINES:null, L=D(); if(!M||!L) return 0; let n=0;
    for(const k of Object.keys(M)){ const T=M[k]; if(k.charAt(0)==='_'||!T||!T.meal||S.ZONES.includes(k)) continue; L[k]=T; S.ZONES.push(k); S.LAYID[k]=T.layout; S.MEALS.push(k); n++; }
    return n; };
  S.addMeals();
  /* 汀州路的雜貨店（TZ_GROCERY_LINES：一間一份稿）：一樣加進同一套；沒有載到那個檔＝不加 */
  S.GROCERS=[];
  S.addGroceries=function(){ const M=typeof TZ_GROCERY_LINES!=='undefined'?TZ_GROCERY_LINES:null, L=D(); if(!M||!L) return 0; let n=0;
    for(const k of Object.keys(M)){ const T=M[k]; if(k.charAt(0)==='_'||!T||!T.grocery||S.ZONES.includes(k)) continue; L[k]=T; S.ZONES.push(k); S.LAYID[k]=T.layout; S.GROCERS.push(k); n++; }
    return n; };
  S.addGroceries();

  /* ---------- 共用 ---------- */
  const hr=G=>((((+G.hour||0)%24)+24)%24);
  const abs=G=>(G.day|0)*24+(+G.hour||0);
  const F_=G=>G.flags||(G.flags={});
  const obj=(F,k)=>{ const v=F[k]; if(!v||typeof v!=='object'||Array.isArray(v)) F[k]={}; return F[k]; };
  const pick=a=>a[Math.min(a.length-1,Math.floor(S.rand()*a.length))];
  const W=w=>w?{name:w}:null;
  const sayL=(GM,l)=>GM.say(W(l[0]),l[1]);
  S.isOpen=(k,G)=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(k,G.hour,G.day);
  const typhoon=(k,G)=>typeof PLACES!=='undefined'&&!!PLACES.typhoonClosed&&PLACES.typhoonClosed(k,G.day);
  const wins=(k,day)=>typeof PLACES!=='undefined'&&PLACES.windowsOf?PLACES.windowsOf(k,day):undefined;
  const sceneFree=GM=>{ if(typeof INV!=='undefined'&&INV.sceneFree) return INV.sceneFree(GM); const E=GM&&GM.E, Dl=GM&&GM.D; return !(E&&E.player&&E.player.busy)&&!(Dl&&(Dl.active||(Dl.busyDepth|0)>0)); };
  const term=day=>{ try{ return typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(day):null; }catch(e){ return null; } };
  S.month=G=>{ try{ return typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).m:0; }catch(e){ return 0; } };
  S.examWeek=G=>{ const t=term(G.day); return !!t&&(t.exam==='mid'||t.exam==='final'); };
  S.finalWeek=G=>{ const t=term(G.day); return !!t&&t.exam==='final'; };
  S.finalsNear=G=>typeof PLACES!=='undefined'&&PLACES.finalsNear?PLACES.finalsNear(G.day):S.finalWeek(G);
  S.preExam=G=>{ const t=term(G.day), n=term(G.day+7); return !!t&&!!n&&n.id===t.id&&!!n.exam&&n.exam!==t.exam; };   /* 期中、期末考的前一週 */
  S.termWeek=G=>{ const t=term(G.day); return t?t.week:0; };
  /* 祐廷現在是法律系第幾年（寒暑假算剛過完的那個學期；經濟系那一年＝0）*/
  S.year=G=>{ if(!G||G.stage==='econ') return 0; let id=null; try{ if(typeof STORY!=='undefined'&&STORY.termAt) id=STORY.termAt(G.day); else { const t=term(G.day); id=t?t.id:null; } }catch(e){ id=null; } const m=/^Y([1-5])S/.exec(id||''); return m?+m[1]:0; };
  const buyDone=async(GM,shop,name,p)=>{ GM.money(-p,shop); if(GM.advance) GM.advance(S.HRS.buy); if(GM.toast) GM.toast(S.SYS.bought+name,2200); };

  /* ---------- 座位：區域的「坐下」互動點（tz_shops3d.js）；zone.seats 補成同一批（約會一起坐、帶位）---------- */
  S.zoneSeats=(GM,f)=>{ const IT=(GM&&GM.E&&GM.E.interactables)||[]; return IT.filter(i=>i&&i.tzSeat&&i.seat&&(!f||f(i))).map(i=>i.seat); };
  S.seated=async function(GM,fn,f){ const E=GM.E, P=E&&E.player; if(!P||P.seat||!GM.sitAt){ await fn(null); return false; } const pp=P.obj&&P.obj.position; let best=null, bd=1e9;
    for(const s of S.zoneSeats(GM,f)){ const fs=GM.freeSeat?GM.freeSeat(s):s; if(!fs) continue; const d=pp?Math.hypot(fs.x-pp.x,fs.z-pp.z):0; if(d<bd){ bd=d; best=fs; } }
    if(!best){ await fn(null); return false; } if(GM.fade) await GM.fade(true); GM.sitAt(P,best); if(GM.fade) await GM.fade(false);
    try{ await fn(best); } finally { if(GM.standUp) GM.standUp(P); } return true; };
  S.tableKind=function(k,seat){ const L=LAY(k); if(!L||!seat) return null; const m=/_t(\d+)$/.exec(String(seat.table||'')); if(!m) return null; const t=(L.tables||[]).find(q=>q.id===+m[1]); return t?t.kind:null; };
  S.seatLine=(k,seat)=>{ const T=D()&&D()[k]; if(!T||!T.seat) return null; const kd=S.tableKind(k,seat); return kd&&T.seat[kd]?T.seat[kd]:(seat&&T.seat.sit?T.seat.sit:null); };   /* 稿只有一句（seat.sit，汀州路的小館）＝每一桌都是那一句 */
  S.onSeat=async function(GM,seat){ const G=GM&&GM.G; if(!G||!S.ZONES.includes(G.zone)) return false; const t=S.seatLine(G.zone,seat); if(!t) return false; await GM.say(null,t); return true; };

  /* ---------- 看（每一個點的句子；同一句不連續出）---------- */
  const lastLook={};
  S.look=function(k,kind){ const T=D()&&D()[k], L=T&&T.look&&T.look[kind]; if(!L||!L.length) return null; const key=k+':'+kind; let i=Math.min(L.length-1,Math.floor(S.rand()*L.length)); if(L.length>1&&i===lastLook[key]) i=(i+1)%L.length; lastLook[key]=i; return L[i]; };

  /* ---------- 安泰藥局 ---------- */
  S.talkLine=function(G){ const T=D().gg_antai.talk, F=F_(G), h=hr(G), m=S.month(G); const sp=[].concat(h>=21?T.night:[],S.examWeek(G)?T.exam:[],[11,12,1,2].includes(m)?T.cold:[]);
    if(sp.length) return pick(sp); const seen=obj(F,'GG3_SEEN'), again=typeof seen.gg_antai==='number'&&seen.gg_antai<G.day; return pick(T.normal.concat(again?T.again:[])); };
  S.antaiTalk=async function(GM){ const G=GM.G, F=F_(G); let r=F.GG3_TALK; if(!r||typeof r!=='object'||r.d!==G.day||typeof r.t!=='string') r=F.GG3_TALK={d:G.day,t:S.talkLine(G)};   /* 一天挑一次 */
    await GM.say(W(D().gg_antai.who),r.t); return r.t; };
  S.antaiGoods=G=>D().gg_antai.goods.filter(g=>!S.SEASON[g.n]||S.SEASON[g.n].includes(S.month(G)));
  S.antaiShelf=async function(GM){ const G=GM.G, gs=S.antaiGoods(G); const i=await GM.choose(gs.map(g=>({t:g.n,hint:g.p+' 元'})).concat([{t:S.SYS.no}]));
    if(!(i>=0&&i<gs.length)) return null; const g=gs[i]; await GM.say(null,g.look);
    const j=await GM.choose([{t:S.SYS.buy,hint:g.p+' 元',dim:(G.money|0)<g.p},{t:S.SYS.no}]); if(j!==0) return 'look';
    if((G.money|0)<g.p){ if(GM.toast) GM.toast(S.SYS.short); return 'short'; }   /* 稿上沒有藥師的錢不夠那一句 */
    await buyDone(GM,'安泰藥局',g.n,g.p); if(GM.autosave) GM.autosave(); return g.n; };
  S.antaiBp=async function(GM){ const B=D().gg_antai.bp, P=GM.E&&GM.E.player; await GM.say(null,B.look);
    let sat=false; if(P&&!P.seat&&GM.sitAt){ const st=S.zoneSeats(GM,i=>i.tzSeat==='bp').map(s=>GM.freeSeat?GM.freeSeat(s):s).find(Boolean); if(st){ if(GM.fade) await GM.fade(true); GM.sitAt(P,st); if(GM.fade) await GM.fade(false); sat=true; } }   /* 血壓計前的椅子（配置 seats 的 bp）*/
    try{ await GM.say(null,B.done); } finally { if(sat&&GM.standUp) GM.standUp(P); } return 'bp'; };

  /* ---------- 情境（汀州鮮果、榮恩典：那天第一次去櫃台）---------- */
  S.sitDue=function(G,k){ const T=D()[k].sit, h=hr(G);
    if(k==='gg_xianguo'){ if(h>=T.late.from) return 'late'; if(S.finalWeek(G)) return 'final'; if(h>=T.dusk.from&&h<T.dusk.to) return 'dusk'; return null; }
    if(k==='gg_rongendian'){ const w=S.termWeek(G); if(w&&T.early.weeks.includes(w)) return 'early'; if(S.preExam(G)) return 'preExam'; if(S.month(G)===T.dec.month) return 'dec'; return null; }
    return null; };
  S.situation=async function(GM,k){ const G=GM.G, r=obj(F_(G),'GG3_SIT'); if(r[k]===G.day) return null; const s=S.sitDue(G,k); if(!s) return null; r[k]=G.day; await sayL(GM,D()[k].sit[s].line); return s; };

  /* ---------- 汀州鮮果 ---------- */
  S.fruitItems=function(G){ const X=D().gg_xianguo, late=hr(G)>=X.sit.late.from, out=[];
    for(const g of X.goods){ if(Array.isArray(g.p)){ const base=g.n.replace(/（[^（）]*）$/,''); g.sizes.forEach((z,i)=>out.push({g,n:base+'（'+z+'）',p:g.p[i]})); }
      else out.push({g,n:g.n,p:late&&/^香蕉/.test(g.n)?X.sit.late.banana:g.p}); }   /* 20:00 以後香蕉一把三十（AA_742 情境）*/
    return out; };
  S.fruitBuy=async function(GM){ const G=GM.G, X=D().gg_xianguo, B=W(X.who); await S.situation(GM,'gg_xianguo'); await GM.say(B,X.ask);
    const its=S.fruitItems(G), i=await GM.choose(its.map(q=>({t:q.n,hint:q.p+' 元'})).concat([{t:S.SYS.no}])); if(!(i>=0&&i<its.length)) return null;
    const q=its[i]; await GM.say(null,q.g.look); let mins=0;
    if(X.cut.items.includes(q.g.n)){ const c=await GM.choose([{t:X.cut.opt,hint:'多 '+X.cut.min+' 分鐘'},{t:S.SYS.noCut}]); if(c===0) mins=X.cut.min; }
    let pay=q.p; if((G.money|0)<pay){ await GM.say(B,X.short); return 'short'; }   /* 錢不夠：老闆那一句，不扣錢 */
    const F=F_(G), gift=/^水果禮盒/.test(q.g.n)&&F.GG3_GIFT!==G.day;
    if(gift){ F.GG3_GIFT=G.day; await sayL(GM,X.sit.gift.line); if(X.sit.gift.narr) await sayL(GM,X.sit.gift.narr); }   /* 買水果禮盒（情境，一天一次）*/
    else { const five=pay%10===5, a=five?X.after.find(x=>x[2]==='five'):pick(X.after.filter(x=>x[2]!=='five')); if(five) pay-=5; await sayL(GM,a); }   /* 總額 5 結尾＝一定說「算你整數」、少算 5 元 */
    GM.money(-pay,'汀州鮮果'); if(GM.advance) GM.advance(S.HRS.buy+mins/60); if(GM.toast) GM.toast(S.SYS.bought+q.n,2200);
    if(GM.autosave) GM.autosave(); return q.n; };

  /* ---------- 榮恩典文具社 ---------- */
  S.rongAfter=function(names){ const X=D().gg_rongendian; return X.after.filter(a=>{ const t=a[1]; if(t.includes('筆記本')) return names.some(n=>n.includes('筆記本')); if(t.includes('買的筆')) return names.some(n=>S.RONG_PEN.includes(n)); return true; }); };
  S.rongPay=async function(GM,name,p,o){ const G=GM.G, X=D().gg_rongendian, B=W(X.who);
    if((G.money|0)<p){ if(o&&o.toastShort){ if(GM.toast) GM.toast(S.SYS.short); return 'short'; } await GM.say(B,X.short.line); await GM.choose([{t:X.short.opt}]); return 'short'; }   /* 不賒帳：老闆只是說說 */
    GM.money(-p,'榮恩典文具社'); if(GM.advance) GM.advance(S.HRS.buy); await sayL(GM,pick(S.rongAfter([name])));
    const F=F_(G), WR=X.sit.wrap; if(WR.items.includes(name)&&F.GG3_WRAP!==G.day){ F.GG3_WRAP=G.day; await sayL(GM,WR.line); const k=await GM.choose([{t:WR.opt,hint:'時間 +'+WR.min+' 分鐘'},{t:S.SYS.no}]);
      if(k===0){ await GM.say(null,WR.narr); if(GM.advance) GM.advance(WR.min/60); } }   /* 買卡片或包裝紙（情境，一天一次）*/
    if(GM.toast) GM.toast(S.SYS.bought+name,2200); if(GM.autosave) GM.autosave(); return name; };
  S.rongBuy=async function(GM){ const X=D().gg_rongendian; await S.situation(GM,'gg_rongendian');
    const cats=[]; for(const g of X.goods) if(!cats.includes(g.cat)) cats.push(g.cat);
    for(;;){ const c=await GM.choose(cats.map(k=>({t:k+'…',hint:X.goods.filter(g=>g.cat===k).map(g=>g.n).join('、'),sub:X.goods.filter(g=>g.cat===k).map(g=>g.n+'　'+g.p+' 元')})).concat([{t:S.SYS.no}]));
      if(!(c>=0&&c<cats.length)) return null; const gs=X.goods.filter(g=>g.cat===cats[c]);
      const j=await GM.choose(gs.map(g=>({t:g.n+'　'+g.p+' 元'})).concat([{t:S.SYS.no}])); if(!(j>=0&&j<gs.length)) continue;
      return S.rongPay(GM,gs[j].n,gs[j].p); } };
  S.rongCart=async function(GM){ const C=D().gg_rongendian.cart; const k=await GM.choose([{t:C.n,hint:C.p+' 元'},{t:S.SYS.no}]); if(k!==0) return null;
    return S.rongPay(GM,C.n,C.p,{toastShort:true}); };   /* 錢不夠：老闆那一句講的是筆，推車的筆記本＝只寫「錢不夠」*/

  /* ---------- 洗樂洗衣坊 ---------- */
  const lastWait={i:-1};
  S.washWait=()=>{ const L=D().tz_xile.wait; let i=Math.min(L.length-1,Math.floor(S.rand()*L.length)); if(L.length>1&&i===lastWait.i) i=(i+1)%L.length; lastWait.i=i; return L[i]; };
  S.wash=async function(GM,o0){ const G=GM.G, X=D().tz_xile.wash, F=F_(G); if(F.GG3_WASH_DAY===G.day){ if(GM.toast) GM.toast(S.SYS.washed,2600); return 'done'; }   /* 一天最多洗一次 */
    const i=await GM.choose(X.menu.map(m=>({t:m.t,dim:(G.money|0)<m.p})).concat([{t:X.no}])); if(!(i>=0&&i<X.menu.length)) return null; const m=X.menu[i];
    if((G.money|0)<m.p){ if(GM.toast) GM.toast(S.SYS.short); return 'short'; }
    const w=await GM.choose([{t:X.stay,hint:m.min+' 分鐘'},{t:X.go}]); if(w!==0&&w!==1) return null;
    GM.money(-m.p,'洗樂洗衣坊'); F.GG3_WASH_DAY=G.day;
    if(w===0){ F.GG3_WASH=null; await S.seated(GM,async()=>{ await GM.say(null,S.washWait()); if(GM.fade) await GM.fade(true); GM.advance(m.min/60); if(GM.fade) await GM.fade(false); },i2=>/^c\d+$/.test(i2.tzSeat));   /* 坐在「坐著等」的塑膠椅上等 */
      if(GM.autosave) GM.autosave(); return 'stay'; }
    F.GG3_WASH={day:G.day,ready:+(abs(G)+m.min/60).toFixed(4),done:false}; if(GM.autosave) GM.autosave();
    if(!(o0&&o0.deferOut)) await S.washOut(GM); return 'go'; };   /* 先去別的地方＝走出店門（從互動點按的：場景結束以後才走出去，S.interact）*/
  S.washOut=async function(GM){ const o=S.outOf(GM,'tz_xile'); await GM.enter(o.to,o.spawn); };
  S.washBackDue=function(G){ const r=G&&G.flags&&G.flags.GG3_WASH; if(!r||typeof r!=='object'||r.done||typeof r.ready!=='number') return false; const t=abs(G); if(t<r.ready-1e-6) return false;
    if(t-r.ready>24){ r.done=true; return false; } return true; };   /* 過了一天才回來＝不說（「還是溫的」對不上）*/
  S.washBack=async function(GM){ const G=GM.G, r=G.flags.GG3_WASH; r.done=true; GM.sceneBegin(); try{ await GM.say(null,pick(D().tz_xile.back)); } finally { GM.sceneEnd(); } if(GM.autosave) GM.autosave(); return 'back'; };
  S.change=async function(GM){ const G=GM.G, X=D().tz_xile; const its=X.soap.items;
    const k=await GM.choose([{t:X.change.name}].concat(its.map(q=>({t:q.n,hint:q.p+' 元',dim:(G.money|0)<q.p})),[{t:S.SYS.no}]));
    if(k===0){ await GM.say(null,X.change.narr); return 'change'; }   /* 換零錢：錢不變 */
    if(!(k>=1&&k<=its.length)) return null; const q=its[k-1]; if((G.money|0)<q.p){ if(GM.toast) GM.toast(S.SYS.short); return 'short'; }
    GM.money(-q.p,'洗樂洗衣坊'); { const nr=X.soap.narrBy?X.soap.narrBy[q.n]:(X.soap.narr.includes(q.n)?X.soap.narr:null); if(nr) await GM.say(null,nr); else if(GM.toast) GM.toast(S.SYS.bought+q.n,2200); }   /* 一樣東西一句旁白（AA_742 8f6650289：洗衣精、柔軟精各一句）；舊格式只有洗衣精那一句 */
    if(GM.autosave) GM.autosave(); return q.n; };

  /* ---------- 印得好 ---------- */
  S.yinMenu=function(G){ return D().tz_yindehao.menu.filter(m=>!(m.when==='finals'&&!S.finalsNear(G))&&!(m.when==='y4'&&S.year(G)<4)); };
  S.yinCounter=async function(GM){ const G=GM.G, X=D().tz_yindehao, B=W(X.who), ms=S.yinMenu(G);
    const i=await GM.choose(ms.map(m=>m.sub?{t:m.t+'…',hint:m.sub.map(s=>s.k+' '+s.p+' 元').join('、')}:{t:m.t,hint:m.p+' 元',dim:(G.money|0)<m.p}).concat([{t:S.SYS.no}]));
    if(!(i>=0&&i<ms.length)) return null; const m=ms[i]; let p=m.p, sub=null;
    if(m.sub){ const j=await GM.choose(m.sub.map(s=>({t:s.n,hint:s.p+' 元',dim:(G.money|0)<s.p})).concat([{t:S.SYS.no}])); if(!(j>=0&&j<m.sub.length)) return null; sub=m.sub[j]; p=sub.p; }
    if((G.money|0)<p){ await GM.say(B,X.short); return 'short'; }   /* 錢不夠：店員那一句，不扣錢 */
    GM.money(-p,'印得好');
    if(m.when==='finals') for(const l of X.bind) await sayL(GM,l);   /* 裝訂期末報告時 */
    else if(sub&&sub.k==='備審') for(const l of X.shen) await sayL(GM,l);   /* 印備審資料時 */
    else await sayL(GM,pick(X.after.filter(a=>!a[1].includes('十分鐘')||m.min===10)));   /* 「好，十分鐘。」只在十分鐘的 */
    if(GM.fade) await GM.fade(true); GM.advance(m.min/60); if(GM.fade) await GM.fade(false);
    if(GM.autosave) GM.autosave(); return sub?sub.k:m.t; };

  /* ---------- 泰米村食 ---------- */
  S.lunchNow=(it,G)=>!!it.lunch&&hr(G)>=it.lunch.from&&hr(G)<it.lunch.to;
  S.taimiPrice=(it,G)=>S.lunchNow(it,G)?it.lunch.p:it.p;
  S.needs=(t,names)=>Object.keys(S.TAIMI_KEY).filter(n=>t.includes(S.TAIMI_KEY[n])).every(n=>names.includes(n));   /* 句子提到的菜都有點 */
  S.last=null;
  S.taimiOrder=async function(GM){ const G=GM.G, X=D().tz_taimi, B=W(X.who); await GM.say(B,X.ask);
    const bk=[], spice={}, tot=()=>bk.reduce((a,q)=>a+q.p,0);
    for(;;){ const taken=bk.map(q=>S.TAIMI_CAT(q.n)), its=X.menu.filter(it=>!taken.includes(S.TAIMI_CAT(it.n)));
      const opts=its.map(it=>({t:it.n+'　'+S.taimiPrice(it,G)+' 元',hint:it.desc})); if(bk.length) opts.push({t:S.SYS.done,hint:bk.map(q=>q.n).join('、')+'　共 '+tot()+' 元'}); opts.push({t:S.SYS.no}); const gO=typeof GIFT!=='undefined'&&GIFT.shopOpt?GIFT.shopOpt(G,S.EAT_KEY):null; if(gO) opts.push(gO);   /* 買一份帶走送人（GIFT-ALL-DRINK-SHOPS-1112，src/gift3d.js GIFT.SHOPS）：放在最後，原本的選項位置不動 */
      const c=await GM.choose(opts); if(gO&&c===opts.length-1){ await GIFT.buy(GM,S.EAT_KEY); continue; }
      if(c>=0&&c<its.length){ const it=its[c]; bk.push({n:it.n,p:S.taimiPrice(it,G)});
        if(S.TAIMI_CAT(it.n)==='main'&&!X.spicy.skip.includes(it.n)){ await GM.say(B,X.spicy.ask); const k=await GM.choose(X.spicy.opts.map(t=>({t}))); const o=X.spicy.opts[k>=0&&k<X.spicy.opts.length?k:0]; spice[it.n]=o;
          if(o===X.spicy.more.opt) await GM.say(B,X.spicy.more.line); }   /* 辣度：點主餐時問一次（只是口味）*/
        continue; }
      if(!(bk.length&&c===its.length)) return null; break; }
    const names=bk.map(q=>q.n), total=tot();
    if((G.money|0)<total){ const tp=X.menu.find(it=>it.lunch); if(tp&&!S.lunchNow(tp,G)) await GM.say(B,X.short.line); else if(GM.toast) GM.toast(S.SYS.short); return 'short'; }   /* 「打拋豬中午比較便宜」只在不是中午的時候說 */
    GM.money(-total,'泰米村食'); S.last={items:names,total,spice,day:G.day};
    await sayL(GM,pick(X.after.filter(a=>S.needs(a[1],names))));
    if(typeof EAT!=='undefined'&&EAT.ordered){ try{ if(EAT.addShop&&!(EAT.SHOPS_X&&EAT.SHOPS_X[S.EAT_KEY])) EAT.addShop(S.EAT_KEY,{shop:S.EAT_SHOP,staff:{who:X.who,line5:null,same:null,alt:null},first:null,door:false}); await EAT.ordered(GM,S.EAT_KEY,names.join('、')); }catch(e){ console.warn('EAT.ordered',e); } }
    const was=!!(GM.E&&GM.E.player&&GM.E.player.seat);
    await S.seated(GM,async st=>{ if(st&&!was) await S.onSeat(GM,st); if(GM.fade) await GM.fade(true); GM.advance(S.HRS.taimiEat); if(GM.fade) await GM.fade(false);
      const ok=X.eat.filter(t=>S.needs(t,names)&&Object.keys(S.TAIMI_KEY).some(n=>t.includes(S.TAIMI_KEY[n]))); if(ok.length) await GM.say(null,pick(ok)); });   /* 吃 30 分鐘；吃的旁白照點的菜挑 */
    if(GM.autosave) GM.autosave(); return names.join('、'); };

  /* ---------- 汀州路的小館（TZ_MEAL_LINES；越好吃小館）：點餐 ---------- */
  /* 點的那幾樣裡演哪一樣的「吃」：eatFirst 的組別照順序，第一組有點到的、先點的那一樣；沒有 eatFirst＝先點的 */
  S.mealPick=function(M,bk){ for(const g of (M.eatFirst||[])){ const q=bk.find(x=>g.includes(x.id)); if(q) return q; } return bk[0]; };
  S.mealOrder=async function(GM){ const G=GM.G, k=G.zone, T=D()[k], M=T.meal, B=W(T.who); await GM.say(B,M.ask);
    const bk=[], tot=()=>bk.reduce((a,q)=>a+q.p,0);
    for(;;){ const its=M.menu.filter(it=>!bk.includes(it));   /* 一樣最多一份 */
      const opts=its.map(it=>({t:it.n+'　'+it.p+' 元'})); if(bk.length) opts.push({t:S.SYS.done,hint:bk.map(q=>q.n).join('、')+'　共 '+tot()+' 元'}); opts.push({t:S.SYS.no});
      const gO=typeof GIFT!=='undefined'&&GIFT.shopOpt?GIFT.shopOpt(G,T.name):null; if(gO) opts.push(gO);   /* 買一份帶走送人（店面標準 §12 第 4 點；放在最後，原本的選項位置不動）*/
      const c=await GM.choose(opts); if(gO&&c===opts.length-1){ await GIFT.buy(GM,T.name); continue; }
      if(c>=0&&c<its.length){ bk.push(its[c]); continue; }
      if(!(bk.length&&c===its.length)) return null; break; }
    const names=bk.map(q=>q.n), total=tot();
    if((G.money|0)<total){ await GM.say(null,M.short); return 'short'; }   /* 錢不夠：稿的那一句旁白，不扣錢 */
    GM.money(-total,T.name); S.last={items:names,total,spice:{},day:G.day,zone:k};
    const only=!!M.afterOnly&&bk.length===1&&bk[0].id===M.afterOnly.id, noX=!!M.afterNo&&!bk.some(q=>M.afterNo.ids.includes(q.id)), hasX=!!M.afterHas&&bk.some(q=>M.afterHas.ids.includes(q.id));
    await GM.say(B,only?M.afterOnly.line:(hasX?M.afterHas.line:(noX?M.afterNo.line:pick(M.after))));   /* 沒點河粉＝after_no_pho（「香草自己夾喔」只在有點河粉時說）；有點過橋米線＝after_guoqiao（客居雲南，AA_825）*/
    if(!only&&typeof EAT!=='undefined'&&EAT.ordered){ try{ if(EAT.addShop&&!(EAT.SHOPS_X&&EAT.SHOPS_X[T.name])) EAT.addShop(T.name,{shop:'汀州路・'+T.name,staff:{who:T.who,line5:null,same:null,alt:null},first:null,door:false}); await EAT.ordered(GM,T.name,names.join('、')); }catch(e){ console.warn('EAT.ordered',e); } }
    const was=!!(GM.E&&GM.E.player&&GM.E.player.seat);
    await S.seated(GM,async st=>{ if(st&&!was) await S.onSeat(GM,st);
      const q=S.mealPick(M,bk);   /* 點好幾樣只演一樣的「吃」*/
      if(q.eat[0]) await GM.say(null,q.eat[0]);   /* 端上來 */
      if(GM.fade) await GM.fade(true); GM.advance(only?S.HRS.mealDrink:S.HRS.mealEat); if(GM.fade) await GM.fade(false);
      for(const t of q.eat.slice(1)) await GM.say(null,t); });   /* 吃 30 分鐘（和泰米村食一樣；只點咖啡 15 分鐘）、吃完 */
    if(GM.autosave) GM.autosave(); return names.join('、'); };

  /* ---------- 汀州路的雜貨店（TZ_GROCERY_LINES；東南大聯商行）：到貨架拿、到櫃檯結帳 ---------- */
  /* 手上的東西：只記這一趟進店（區域＋GM.enterN）；不進存檔。走出去、讀檔（LOADLOCKS）＝沒有了 */
  let hand=null;   /* null＝手上沒東西（LOADLOCKS 只能登記「名字=null」這種放開，tests/loadgen_locks_unit.js）*/
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['gg3shops3d:hand']=()=>{ hand=null; };
  S.hand=function(GM){ const k=GM.G.zone, n=GM.enterN|0; if(!hand||hand.k!==k||hand.n!==n) hand={k,n,ids:[]}; return hand.ids; };
  S.handGoods=function(GM){ const X=D()[GM.G.zone].grocery, ids=S.hand(GM); return ids.map(id=>X.goods.find(g=>g.id===id)).filter(Boolean); };
  const handHint=gs=>gs.map(g=>g.n).join('、')+'　共 '+gs.reduce((a,g)=>a+g.p,0)+' 元';
  /* 買回來的東西（「物品」；X277、X291）：G.flags.GG3_OWN＝{區域:{id:幾份}}。S.own 只讀（舊存檔、壞掉的資料＝空的，不寫存檔）；S.ownAdd 買了才寫 */
  const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
  S.OWN_X=[];   /* 別的店（不走汀州路雜貨店那一套配置的）買的東西也記在同一個 GG3_OWN、列在同一個「物品」分頁：{zone, name 店名, goods:[{id, n}]}（美國兩間超市：src/us_markets3d.js）*/
  S.own=function(G){ const R=G&&G.flags&&G.flags.GG3_OWN, L=D(), out=[]; if(!isObj(R)||!L) return out;
    for(const k of S.GROCERS){ const T=L[k], r=R[k]; if(!T||!T.grocery||!isObj(r)) continue; const items=T.grocery.goods.filter(g=>(r[g.id]|0)>0).map(g=>({id:g.id,n:g.n,count:r[g.id]|0})); if(items.length) out.push({zone:k,shop:T.name,items}); }
    for(const X of S.OWN_X){ const r=X&&R[X.zone]; if(!X||!Array.isArray(X.goods)||!isObj(r)) continue; const items=X.goods.filter(g=>(r[g.id]|0)>0).map(g=>({id:g.id,n:g.n,count:r[g.id]|0})); if(items.length) out.push({zone:X.zone,shop:X.name,items}); }
    return out; };
  S.ownAdd=function(G,k,id,max){ const f=G.flags||(G.flags={}); if(!isObj(f.GG3_OWN)) f.GG3_OWN={}; if(!isObj(f.GG3_OWN[k])) f.GG3_OWN[k]={}; const r=f.GG3_OWN[k]; r[id]=Math.max(0,r[id]|0)+1; if(max>0&&r[id]>max) r[id]=max; return r[id]; };   /* max：最多幾份（貼在手機上的保護貼再貼一次還是一份）*/
  const escH=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  S.ownHTML=function(G){ return S.own(G).map(o=>'<div class="item"><b>'+escH(o.shop)+'</b>'+o.items.map(i=>'<div>· '+escH(i.n)+(i.count>1?' ×'+i.count:'')+'</div>').join('')+'</div>').join(''); };
  S.groceryShelf=async function(GM,kind){ const k=GM.G.zone, T=D()[k], X=T.grocery, ids=S.hand(GM), took=[]; const t=S.look(k,kind); if(t) await GM.say(null,t);
    for(;;){ const its=X.goods.filter(g=>g.at===kind&&!g.noBuy&&!ids.includes(g.id)); if(!its.length) break;   /* 一樣最多一份；這個貨架的都拿了＝不再問 */
      const hs=S.handGoods(GM), no={t:S.SYS.no}; if(hs.length) no.hint=handHint(hs);
      const gO=typeof GIFT!=='undefined'&&GIFT.shopOpt?GIFT.shopOpt(GM.G,T.name,X.goods.filter(g=>g.at===kind&&!g.noBuy)):null;   /* 這個貨架有飲料＝可以買一份帶走送人（櫃檯另外結，照 GIFT.buy 當場付）*/
      const c=await GM.choose(its.map(g=>({t:g.n+'　'+g.p+' 元',hint:g.line})).concat(gO?[no,gO]:[no])); if(gO&&c===its.length+1){ await GIFT.buy(GM,T.name,X.goods.filter(g=>g.at===kind&&!g.noBuy)); continue; } if(!(c>=0&&c<its.length)) break;
      ids.push(its[c].id); took.push(its[c].n); if(X.pick) await GM.say(null,X.pick); }   /* 拿起一樣：稿的 pick 那一句旁白 */
    return took.length?took.join('、'):(t||null); };
  S.groceryPay=async function(GM){ const G=GM.G, k=G.zone, T=D()[k], X=T.grocery, B=W(T.who), gs=S.handGoods(GM), ids=S.hand(GM);
    if(!gs.length){ await GM.say(null,X.empty); return 'empty'; }
    const total=gs.reduce((a,g)=>a+g.p,0); await GM.say(B,X.ask);
    const c=await GM.choose([{t:S.SYS.buy,hint:handHint(gs),dim:(G.money|0)<total},{t:S.SYS.no}]);
    if(c!==0){ ids.length=0; if(X.cancel) await GM.say(null,X.cancel); return null; }   /* 不用了：東西放回去（稿的 cancel 那一句旁白）*/
    if((G.money|0)<total){ ids.length=0; await GM.say(null,X.short); return 'short'; }   /* 錢不夠：稿的那一句旁白（東西放回架上），不扣錢 */
    GM.money(-total,T.name); if(GM.advance) GM.advance(S.HRS.buy); for(const g of gs) S.ownAdd(G,k,g.id); S.last={items:gs.map(g=>g.n),total,spice:{},day:G.day,zone:k};
    const sp=!!X.afterIf&&gs.some(g=>X.afterIf.ids.includes(g.id)); ids.length=0;
    await GM.say(B,sp?X.afterIf.line:pick(X.after));   /* 買了泡麵或辣醬＝after_spicy（取代 after）*/
    if(GM.autosave) GM.autosave(); return gs.map(g=>g.n).join('、'); };

  /* ---------- 櫃台有服務的店（資料檔 grocery.services；汀州聯通）：服務（錢、分鐘、句子照稿）＋買手上的東西 ---------- */
  S.serviceRun=async function(GM,sv){ const G=GM.G, k=G.zone, T=D()[k], X=T.grocery, B=W(T.who);
    if((G.money|0)<sv.p){ await GM.say(null,X.short); return 'short'; }   /* 錢不夠：稿的那一句旁白，不扣錢、時間不動 */
    if(sv.p>0) GM.money(-sv.p,T.name);
    const run=async sit=>{ await sayL(GM,sv.lines[0]); if(sit&&T.seat&&T.seat.wait) await GM.say(null,T.seat.wait);   /* 坐在圓凳上等：稿的 seat.wait */
      if(sv.wait&&GM.fade) await GM.fade(true); if(GM.advance) GM.advance(sv.min/60); if(sv.wait&&GM.fade) await GM.fade(false);
      for(const l of sv.lines.slice(1)) await sayL(GM,l); };
    if(sv.wait){ const P=GM.E&&GM.E.player, was=!!(P&&P.seat); await S.seated(GM,st=>run(!!st||was)); } else await run(false);   /* 手機交給店員的那幾樣：坐著等（有空位的話）*/
    if(sv.item) S.ownAdd(G,k,sv.item,1);
    S.last={items:[sv.n],total:sv.p,spice:{},day:G.day,zone:k};
    if(!sv.noAfter) await GM.say(B,pick(X.after));   /* 稿的 counter.after_skip（問門號）：旁白就是結尾，不接 after */ if(GM.autosave) GM.autosave(); return sv.n; };
  S.serviceCounter=async function(GM){ const G=GM.G, k=G.zone, T=D()[k], X=T.grocery, B=W(T.who), SV=X.services, gs=S.handGoods(GM), ids=S.hand(GM), total=gs.reduce((a,g)=>a+g.p,0);
    await GM.say(B,X.ask);
    const opts=SV.map(s=>({t:s.n,hint:s.p+' 元　'+s.min+' 分鐘',dim:(G.money|0)<s.p})); if(gs.length) opts.push({t:S.SYS.buy,hint:handHint(gs),dim:(G.money|0)<total}); opts.push({t:S.SYS.no});
    const c=await GM.choose(opts);
    if(c>=0&&c<SV.length) return S.serviceRun(GM,SV[c]);
    if(!gs.length) return null;
    if(c!==SV.length){ ids.length=0; if(X.cancel) await GM.say(null,X.cancel); return null; }   /* 不用了：東西掛回去（稿的 cancel 那一句旁白）*/
    if((G.money|0)<total){ ids.length=0; await GM.say(null,X.short); return 'short'; }
    GM.money(-total,T.name); if(GM.advance) GM.advance(S.HRS.buy); for(const g of gs) S.ownAdd(G,k,g.id); S.last={items:gs.map(g=>g.n),total,spice:{},day:G.day,zone:k}; ids.length=0;
    await GM.say(B,pick(X.after)); if(GM.autosave) GM.autosave(); return gs.map(g=>g.n).join('、'); };

  /* ---------- 店門：關門 ---------- */
  S.doorLine=function(k,G){ const T=D()&&D()[k]; if(!T) return null; if(typhoon(k,G)) return T.typhoon?{t:T.typhoon,why:'typhoon'}:null;
    const ws=wins(k,G.day); if(ws===undefined) return null; if(!ws||!ws.length) return T.off?{t:T.off,why:'off'}:null;   /* 今天公休 */
    const h=hr(G), last=ws[ws.length-1][1]; if((h>=last-1e-6||h<6)&&T.sign) return {t:T.sign,why:'sign'};   /* 打烊以後（到清晨） */
    if(T.notOpen&&(h<ws[0][0]||(!T.sign&&h>=last-1e-6))) return {t:T.notOpen,why:'notopen'};   /* 開門以前（清晨 6 點以後；稿有 not_open 的店才說）；稿只有 not_open、沒有打烊以後那一句的店（汀州聯通）＝關著都說這一句 */
    return null; };
  S.door=async function(GM,k){ const G=GM.G, L=S.doorLine(k,G), txt=typeof PLACES!=='undefined'&&PLACES.closedText?PLACES.closedText(k,G.hour,G.day):'';
    if(L){ GM.sceneBegin(); try{ await GM.say(null,L.t); } finally { GM.sceneEnd(); } }
    if(txt&&GM.toast) GM.toast(txt,4500); return L?L.why:'closed'; };

  /* ---------- 進門（一天第一次、一個人）---------- */
  let doorVisit=null, busy=false; const seen={};
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['gg3shops3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  S.alone=function(G,k){ const h=hr(G); return !(G.invites||[]).some(iv=>iv&&iv.place===k&&iv.day===G.day&&(iv.state==='going'||iv.state==='done'||(iv.state==='accepted'&&h>=iv.h-0.5&&h<iv.h+0.75))); };
  S.doorDue=function(GM){ const G=GM.G; if(!G||!S.ZONES.includes(G.zone)||doorVisit===(GM.enterN|0)||!S.isOpen(G.zone,G)) return false; const r=G.flags&&G.flags.GG3_DOOR;
    if(r&&typeof r==='object'&&r[G.zone]===G.day){ doorVisit=GM.enterN|0; return false; } return true; };
  S.enterLine=async function(GM){ const G=GM.G, k=G.zone, r=obj(F_(G),'GG3_DOOR'); doorVisit=GM.enterN|0; if(!S.alone(G,k)) return 'together';
    r[k]=G.day; GM.sceneBegin(); try{ await sayL(GM,pick(D()[k].door)); } finally { GM.sceneEnd(); } return 'door'; };

  /* ---------- 打烊：人還在店裡＝出來 ---------- */
  S.closingNow=function(k,G){ if(typhoon(k,G)) return false; const h=hr(G);
    for(const [d,off] of [[G.day,0],[G.day-1,-24]]){ const ws=wins(k,d); if(!ws||!ws.length) continue; if(ws.some(w=>h>=w[1]+off-1e-6&&h<w[1]+off+0.5)) return true; }
    return false; };   /* 每一段營業結束後半小時內（印得好期末延到 24:00＝隔天 0 點）*/
  S.gen=function(GM,k){ const G=GM.G; if(typhoon(k,G)) return false; if(typeof XSCLOSE!=='undefined'&&XSCLOSE.staffToday&&XSCLOSE.staffToday(G,k)) return false;   /* 那天在這間店打工（越好吃小館做到 21:00，AA_829）＝店裡的人：不說打烊那句（和 XSCLOSE.gen 一樣）*/ return S.closingNow(k,G)||seen[k]===(GM.enterN|0); };
  S.outOf=function(GM,k){ const L=LAY(k), to=L&&L.outZone, IT=(GM&&GM.E&&GM.E.interactables)||[]; const it=IT.find(q=>q&&q.exit&&q.exit.to&&q.exit.to===to)||IT.find(q=>q&&q.exit&&q.exit.to&&q.exit.to!==k);
    if(it) return {to:it.exit.to,spawn:it.exit.spawn?Object.assign({},it.exit.spawn):undefined}; return {to:to||(k.indexOf('gg_')===0?'gongguan':'tingzhou'),spawn:L&&L.out?Object.assign({},L.out):undefined}; };
  S.closeOut=async function(GM){ const G=GM.G, k=G.zone, T=D()[k], P=GM.E&&GM.E.player, gen=S.gen(GM,k)&&!!T.close, h=G.hour, d=G.day;
    GM.sceneBegin(); try{ if(P&&P.seat&&GM.standUp) GM.standUp(P); if(gen) await GM.say(W(T.who),T.close); } finally { GM.sceneEnd(); }   /* 打烊那一句（AA_700 統一句）；泰米村食的午休句 11-12 取消（AA_742 @ 90fb5fa77）*/
    const o=S.outOf(GM,k); await GM.enter(o.to,o.spawn);
    if(!gen&&typeof PLACES!=='undefined'&&PLACES.closedText&&GM.toast) GM.toast(PLACES.closedText(k,h,d),5000);
    return gen?'close':'out'; };

  /* ---------- 每 0.5 秒（STORY.TICKS）：打烊優先，再來進門、洗好的衣服 ---------- */
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||!S.ZONES.includes(G.zone)||busy||GM.titleIdle||!D()) return false; const k=G.zone;
    { const sn=obj(F_(G),'GG3_SEEN'); if(typeof sn[k]!=='number') sn[k]=G.day; }   /* 第一次來的那一天（藥師「第二次以後來」）*/
    if(S.isOpen(k,G)) seen[k]=GM.enterN|0;   /* 這一趟看到開著 */
    if(!sceneFree(GM)) return false;
    let p=null; if(!S.isOpen(k,G)) p=S.closeOut(GM); else if(S.doorDue(GM)) p=S.enterLine(GM); else if(k==='tz_xile'&&S.washBackDue(G)) p=S.washBack(GM); if(!p) return false;
    busy=true; p.catch(e=>console.warn('GG3.tick',e)).finally(()=>{ busy=false; }); return true; };

  /* ---------- 互動 ---------- */
  S.ACT={gg_antai_counter:S.antaiTalk,gg_antai_shelf:S.antaiShelf,gg_antai_bp:S.antaiBp,gg_fruit_counter:S.fruitBuy,gg_rong_counter:S.rongBuy,gg_rong_cart:S.rongCart,
    tz_xile_wash:S.wash,tz_xile_change:S.change,tz_yin_counter:S.yinCounter,tz_taimi_order:S.taimiOrder};
  for(const k of S.MEALS) S.ACT[D()[k].meal.point]=S.mealOrder;   /* 汀州路的小館：點餐的 kind 照稿（order.id）*/
  for(const k of S.GROCERS){ const X=D()[k].grocery; S.ACT[X.point]=X.services&&X.services.length?S.serviceCounter:S.groceryPay; for(const g of X.goods) if(!g.noBuy&&!S.ACT[g.at]){ const kind=g.at; S.ACT[kind]=GM=>S.groceryShelf(GM,kind); } }   /* 汀州路的雜貨店：結帳、有東西的貨架 */
  S.handles=(k,kind)=>!!kind&&!!D()&&!!D()[k]&&(!!S.ACT[kind]||!!(D()[k].look&&D()[k].look[kind]));
  S.interact=async function(GM,it){ const G=GM.G, k=G.zone, kind=it.kind; let r=null; GM.sceneBegin();
    try{ if(kind==='tz_xile_wash') r=await S.wash(GM,{deferOut:true}); else if(S.ACT[kind]) r=await S.ACT[kind](GM); else { r=S.look(k,kind); if(r) await GM.say(null,r); } } finally { GM.sceneEnd(); }
    if(kind==='tz_xile_wash'&&r==='go') await S.washOut(GM);   /* 換區域在場景外面（和打烊請你出來一樣）*/
    return r; };

  /* ---------- 區域：座位補成 zone.seats、標記接好的互動點 ---------- */
  S.attach=function(E,z,k){ if(!z||!E) return z; const IT=E.interactables||[]; if(!Array.isArray(z.seats)) z.seats=IT.filter(i=>i&&i.tzSeat&&i.seat).map(i=>i.seat);
    const LB=D()&&D()[k]&&D()[k].labels;
    const SB=D()&&D()[k]&&D()[k].seat&&D()[k].seat.button; if(SB) for(const it of IT) if(it&&it.tzSeat&&it.seat) it.label=SB;   /* 座位按鈕的字照稿（汀州聯通「坐著等」）*/
    for(const it of IT) if(it&&it.tzPoint&&S.handles(k,it.kind)){ it.gg3=k; if(LB&&LB[it.kind]) it.label=LB[it.kind]; }   /* 按鈕的字照稿（汀州路的小館：稿有 button）*/
    return z; };
  S.hookZones=function(){ if(typeof Z3==='undefined'||!Z3.ZONES) return 0; let n=0;
    for(const k of S.ZONES){ const zd=Z3.ZONES[k]; if(!zd||zd._gg3) continue; const b0=zd.build; zd.build=function(E){ const z=b0.apply(this,arguments); try{ S.attach(E,z,k); }catch(e){ console.warn('GG3.attach',e); } return z; }; zd._gg3=true; n++; }
    return n; };
  /* 店員站在配置的位置（zone.shopClerk；開店的時候）：路人模型、不說話（結帳照互動點）*/
  S.placeClerk=function(zoneId,GM){ if(!S.ZONES.includes(zoneId)) return null; const E=GM&&GM.E, z=E&&E.zone, G=GM&&GM.G, c=z&&z.shopClerk;
    if(!c||!G||!S.isOpen(zoneId,G)||typeof CHAR==='undefined'||!CHAR.build||!E.addNPC||typeof STORY==='undefined'||!STORY.extraSpec) return null;
    const o=CHAR.build(STORY.extraSpec(S.CLERK_I[zoneId]||60)); o.position.set(c.x,0,c.z); o.rotation.y=c.yaw||0;
    return E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,clerk:true,gg3Clerk:zoneId}); };
  S.hookPopulate=function(){ if(typeof STORY==='undefined'||!STORY.populate||STORY._gg3Pop) return false; const p0=STORY.populate; STORY._gg3Pop=true;
    STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ S.placeClerk(zoneId,GM); }catch(e){ console.warn('GG3.placeClerk',e); } return r; }; return true; };

  /* ---------- 約去泰米村食（AA_742 約去吃、和她坐下以後的開場句）---------- */
  S.PLACE={id:'tz_taimi',zone:'tz_taimi',name:'泰米村食',verb:'去泰米村食吃飯',kind:'meal',minStage:'FAMILIAR',stay:0.75,memory:'SHARED_MEAL',sitAct:'eat',seatPose:'sit',cats:['meal'],
    days:[0,2,3,4,5,6],times:[11.5,12.5,17.5,18.5]};   /* 吃飯那一類（和 Daybreak、洋洋同一把尺）；週一公休不排；時段＝稿的午餐、晚餐（windows，資料檔）*/
  S.registerInvite=function(){ if(typeof INVITE_DATA==='undefined'||!D()||!Array.isArray(INVITE_DATA.places)) return false; const T=D().tz_taimi.invite;
    if(!INVITE_DATA.places.some(p=>p&&p.id===S.PLACE.id)) INVITE_DATA.places.push(Object.assign({},S.PLACE,{windows:T.windows.map(w=>w.slice())}));
    const PP=INVITE_DATA.people||(INVITE_DATA.people={}); for(const id in T.acc){ const p=PP[id]||(PP[id]={}); (p.acc||(p.acc={})).tz_taimi=[T.acc[id]]; }
    INVITE_DATA.taimiAcc=T.acc; INVITE_DATA.taimiAcc0=T.acc0;
    const SO=INVITE_DATA.seatOpen; if(SO){ SO.tz_taimi=T.seatOpen.map(t=>[t]); if(SO.byPlace) SO.byPlace.tz_taimi='tz_taimi'; }
    return true; };

  /* ---------- 舊存檔：行程的地點字串（AA_742 第 ③ 節）---------- */
  S.migrate=function(s){ if(!s||typeof s!=='object') return 0; let n=0; const ren=v=>{ let t=v; for(const [a,b] of S.RENAME) t=t.split(a).join(b); return t; };
    if(Array.isArray(s.outings)) for(const q of s.outings){ if(!q||typeof q!=='object') continue; for(const k of ['place','title']){ const v=q[k]; if(typeof v!=='string'||v.indexOf('日日定食')<0) continue; const t=ren(v); if(t!==v){ q[k]=t; n++; } } }
    /* BB 11-11 19:25（GG-SHOPS3 RENAME 2 FAIL，D141 畫面上有舊店名）：手機訊息（G.msgs、還沒送到的 G.phone.q：每一則裡的字，含回覆選項）、筆記（G.notes 的 title／body）也換；
       明軒清單那則筆記（mx_fm1）整份換成現在的清單（STORY.MX_FM1：那一列的菜和價錢也跟著換，只換店名會變成泰米村食賣今日定食）。只做一次（flags.GG3_REN；舊存檔沒有＝還沒做）*/
    const F=s.flags&&typeof s.flags==='object'?s.flags:null;
    if(!(F&&F.GG3_REN)){
      const fix=(o,k)=>{ const v=o[k]; if(typeof v==='string'){ if(v.indexOf('日日定食')>=0){ const t=ren(v); if(t!==v){ o[k]=t; n++; } } } else if(v&&typeof v==='object') deep(v); };
      const deep=o=>{ if(Array.isArray(o)) for(let i=0;i<o.length;i++) fix(o,i); else if(o&&typeof o==='object') for(const k of Object.keys(o)) fix(o,k); };
      if(Array.isArray(s.msgs)) s.msgs.forEach(deep);
      if(s.phone&&typeof s.phone==='object'&&Array.isArray(s.phone.q)) s.phone.q.forEach(deep);
      const MX=typeof STORY!=='undefined'&&STORY.MX_FM1&&typeof STORY.MX_FM1.body==='string'?STORY.MX_FM1:null;
      if(Array.isArray(s.notes)) for(const nt of s.notes){ if(!nt||typeof nt!=='object') continue;
        if(nt.id==='mx_fm1'&&MX&&typeof nt.body==='string'&&nt.body.indexOf('日日定食')>=0){ nt.title=MX.title; nt.body=MX.body; n++; continue; }
        for(const k of ['title','body']) if(typeof nt[k]==='string'&&nt[k].indexOf('日日定食')>=0){ nt[k]=ren(nt[k]); n++; } }
      if(F) F.GG3_REN=true; }
    return n; };

  /* ---------- 接到遊戲 ---------- */
  S.hookZones();
  S.registerInvite();
  if(typeof INV!=='undefined'&&INV.personal&&!INV._gg3){ INV._gg3=true; const p0=INV.personal; INV.personal=function(G,id,P,day,h,r){ const out=p0.apply(this,arguments);
      if(P&&P.id==='tz_taimi'&&D()&&out&&out.res==='accept'&&!(Array.isArray(out.lines)&&out.lines.length)) return Object.assign({},out,{lines:[D().tz_taimi.invite.acc0]}); return out; }; }   /* 沒有自己句子的人＝一般那一句 */
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.tick)) STORY.TICKS.push(S.tick);
    if(!STORY._gg3){ STORY._gg3=true;
      const os=STORY.onSeat; STORY.onSeat=async function(GM,seat){ const r=os?await os.apply(this,arguments):false; try{ if(GM&&GM.G&&S.ZONES.includes(GM.G.zone)) await S.onSeat(GM,seat); }catch(e){ console.warn('GG3.onSeat',e); } return r; };
      if(STORY.interact){ const oi=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G;
        if(it&&G&&it.tzPoint&&S.ZONES.includes(G.zone)&&S.handles(G.zone,it.kind)){ await S.interact(GM,it); return true; }
        if(it&&it.exit&&G&&S.ZONES.includes(it.exit.to)&&!S.isOpen(it.exit.to,G)){ await S.door(GM,it.exit.to); return true; }   /* 關門：門口那一句＋開放時間 */
        return oi.apply(this,arguments); }; } }
    if(!S.hookPopulate()&&typeof addEventListener==='function'){ addEventListener('DOMContentLoaded',()=>{ S.hookPopulate(); }); addEventListener('load',()=>{ S.hookPopulate(); }); } }
  return S;
})();
