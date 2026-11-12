// 美國兩間超市買東西（US-MARKETS-BUY-1112；SHOP-STANDARD-BACKFILL-1112；AA_850 @ b039356f5，分支 claude/magical-albattani-bk7b4n）——不需要瀏覽器（D131）。
//   1  資料檔 src/data/us_markets_buy.js 逐字對稿（品名、美金、種類、貨架、每一句）；實扣＝美金 × 32 四捨五入；匯入工具 --check；白名單
//   2  貨架：「看」那一句（us_life_events.js 現有的）→ 品名＋$美金 → 放進推車、不扣錢；拿過的不再列；沒有東西賣的點只有看
//   3  草原超市結帳：空的＝看＋cart_empty；收銀員 greet → 結帳 → 扣錢（台幣）、+20 分鐘 → 袋子（要＝再扣 3 元）→ done；自助結帳＝旁白、不問袋子
//   4  錢不夠：草原＝no_money、最貴的拿掉、剩下的付得起就付；全部付不起＝不扣錢、錢不會變負的。竹葉＝阿姨那一句、只買水餃；沒有水餃＝什麼都不買
//   5  買的東西去哪：eat＝不留；own＝G.flags.GG3_OWN、「物品」分頁列得到；gift＝包包裡的禮物（GIFTH.bag），節日可以送（一般禮物 ok）；包包滿了拿不了
//   6  季節：火雞胸只有 11 月；月餅 9/15～中秋那一天（櫃台上、一趟問一次）；熟食櫃台的號碼牌、Half or whole?；衛生紙輪值那一句這個月買過就不說
//   7  沙茶醬只有一罐：拿了＝satay_last；買了以後 14 天那一格換 satay_gone、不賣；第 15 天又有
//   8  竹葉的阿姨：那天第一次才招呼；去過三天以上＝greet_regular；買完 checkout_done；週日關門多 closed_sunday
//   9  多帶一顆月餅給學姊：人在美國、包包有月餅才有「送她月餅」；送了＝那一句、月餅沒了、只出一次
//   10 推車不進存檔（換區域＝空的；讀檔的 LOADLOCKS 放開）；舊存檔沒有新欄位照常；存檔 JSON 來回不變
//   11 不是這兩區、不是 usMarket 的互動點＝不接（照舊走原本的）；index.html 載入順序；node --check
// 修改前（8408360181）：沒有資料檔、沒有 src/us_markets3d.js，貨架只有「買一樣東西（時間 +20 分鐘，不做錢）／只看看」——這支整份跑不起來；
//   地點關卡 tests/place_gate_unit.js 這兩間的 buy／nomoney／text 六項是 KNOWN_FAIL（這次從表上拿掉）。
// 用法：node tests/us_markets_buy_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process'); const ROOT=path.resolve(__dirname,'..');
const SHA='b039356f5', DOC='docs/story_planning/AA_850_us_markets_buy.json', DATA='src/data/us_markets_buy.js';
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x);
process.on('unhandledRejection',e=>{ console.log('FAIL unhandledRejection '+(e&&e.stack||e)); fails++; });
global.window=global; global.self=global; const warn0=console.warn; console.warn=()=>{};
/* ---- 假的 STORY（只有這支用到的）＋真的日曆、營業時間、汀州路雜貨店的「物品」、節日送禮 ---- */
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
global.STORY_EVENTS=[];
load('src/data/calendar.js');
const DKm={}; const DK=key=>{ if(DKm[key]==null){ for(let d=-400;d<2500;d++) if(CALENDAR.dateOf(d).key===key){ DKm[key]=d; break; } } return DKm[key]; };
let inner=[]; global.STORY={TALK_OPTS:[],dayOfKey:DK,interact:async function(it){ inner.push(it); return false; }};
load('src/data/places.js'); load('src/data/gg3_shops_lines.js'); load('src/data/tz_grocery_lines.js'); load('src/gg3shops3d.js'); load('src/data/gift_holiday.js'); load('src/gifthol3d.js'); load('src/data/us_life_events.js');
const LOOK=US_LIFE_EVENTS.DATA.aa287; let here=true;
global.USL={lookFor:(G,it)=>(LOOK[G.zone]||{})[it.usMarket]||null,here:()=>here};
load(DATA); load('src/us_markets3d.js'); console.warn=warn0;
const D=US_MARKETS_BUY, M=D.shops.us_market, A=D.shops.us_asian_market, S=USMKT;

/* ---- 假畫面 ---- */
let says=[], caps=[], menus=[], toasts=[], picks=[], adv=0, saves=0, G=null;
const GM={ enterN:1, sceneBegin(){}, sceneEnd(){}, say:async(w,t)=>{ says.push([w?w.name:null,t]); }, caption:(w,t)=>{ caps.push(t); }, toast:t=>{ toasts.push(t); },
  choose:async o=>{ menus.push(o.map(q=>q.t+(q.hint?'〔'+q.hint+'〕':'')+(q.dim?'（灰）':''))); const p=picks.length?picks.shift():o.length-1; return typeof p==='string'?o.findIndex(q=>q.t.startsWith(p)):p; },
  money:d=>{ G.money+=d; }, advance:h=>{ adv+=h; }, autosave(){ saves++; } };
const reset=()=>{ says=[]; caps=[]; menus=[]; toasts=[]; picks=[]; adv=0; inner=[]; };
const start=(zone,dayKey,money)=>{ G={zone,day:DK(dayKey||'2028-10-10'),hour:15,money:money==null?5000:money,flags:{}}; G.weekday=CALENDAR.dateOf(G.day).wd%7; GM.G=G; GM.enterN++; reset(); return G; };
const press=async(id,p)=>{ picks=(p||[]).slice(); return STORY.interact({usMarket:id,look:'x。',label:id},GM); };
const said=t=>says.some(s=>s[1]===t);

(async()=>{
/* ===== 1 資料 ===== */
{ let raw=null; try{ raw=cp.execFileSync('git',['show',SHA+':'+DOC],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!raw) console.log('SKIP 1 讀不到稿 '+SHA+'（淺層複本：git fetch origin claude/magical-albattani-bk7b4n）');
  else { const R=JSON.parse(raw); const bad=[];
    for(const z of ['us_market','us_asian_market']){ const T=D.shops[z], Rz=R[z]; if(T.name!==Rz.name) bad.push(z+' name'); const rows=[];
      for(const at of Object.keys(Rz.shelves)) for(const r of Rz.shelves[at]) rows.push([r[0],r[1],r[2],at]);
      if(J(rows)!==J(T.goods.map(g=>[g.n,g.usd,g.kind,g.at]))) bad.push(z+' goods');
      for(const k of Object.keys(Rz.lines)) if(T.lines[k]!==Rz.lines[k]) bad.push(z+' lines.'+k);
      for(const k of Object.keys(T.lines)) if(!(k in Rz.lines)&&k!=='mooncake_give') bad.push(z+' 多了 lines.'+k); }
    check('1 品名、美金、種類、貨架、每一句逐字對稿（28 樣、18 句）',!bad.length&&M.goods.length===14&&A.goods.length===14,bad.join('、'));
    check('1 月餅給學姊那一句在稿的 notes 裡',R.us_asian_market.notes.some(n=>n.includes('給的時候她說：「'+A.lines.mooncake_give+'」')),A.lines.mooncake_give);
    const ck=cp.spawnSync('python3',['tools/story/import_us_markets.py','--check'],{cwd:ROOT,encoding:'utf8'});
    if(ck.error) console.log('SKIP 1 沒有 python3（匯入工具 --check）'); else check('1 匯入工具 --check：資料檔＝稿匯出來的（走 import_guard 白名單）',ck.status===0,(ck.stdout+ck.stderr).trim().slice(0,200)); }
  const all=M.goods.concat(A.goods);
  check('1 實扣＝美金 × 32 四捨五入（4.99→160、2.65→85、1.29→41、5→160、18.99→608）',D.rate===32&&all.every(g=>g.p===Math.round(g.usd*32))&&J(['usm_apple','usm_postcard','usa_milktea','usa_mooncake','usm_tp'].map(id=>all.find(g=>g.id===id).p))==='[160,85,41,160,608]',J(all.map(g=>[g.id,g.p])));
  check('1 id 不重複、每一樣的貨架都有「看」的字',new Set(all.map(g=>g.id)).size===28&&M.goods.every(g=>LOOK.us_market[g.at])&&A.goods.every(g=>LOOK.us_asian_market[g.at]));
  const AL=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===DOC);
  check('1 白名單：一筆 approved、sha '+SHA,AL.length===1&&AL[0].status==='approved'&&AL[0].sha===SHA&&!!AL[0].approvedBy&&D.src===DOC+'@'+SHA,J(AL)); }

/* ===== 2 貨架 ===== */
{ start('us_market'); const r=await press('produce',[0,0]);
  check('2 蔬果：先說「看」那一句、選單＝品名＋$美金＋不用了',r===true&&says[0][0]===null&&says[0][1]===LOOK.us_market.produce&&J(menus[0])===J(['蘋果（一袋）　$4.99','香蕉（一串）　$1.49','不用了']),J([says,menus]));
  check('2 拿了＝放進推車、不扣錢、時間不動；拿過的不再列（第二次選單只剩香蕉、提示寫推車裡有什麼）',G.money===5000&&adv===0&&J(S.cart(GM).ids)===J(['usm_apple','usm_banana'])&&menus[1][0]==='香蕉（一串）　$1.49'&&menus[1][1]==='不用了〔推車：蘋果（一袋）　共 $4.99〕',J(menus));
  reset(); await press('produce'); check('2 這個貨架都拿了＝只有看（不再出選單）',!menus.length&&caps[0]===LOOK.us_market.produce,J([menus,caps]));
  for(const id of ['carts','aisle_drinks','aisle_canned','aisle_baking','aisle_personal']){ reset(); const r2=await press(id); check('2 沒有東西賣的點「'+id+'」＝只有看那一句',r2===true&&!menus.length&&!says.length&&caps[0]===LOOK.us_market[id],J([caps,menus])); }
  start('us_market'); await press('dairy',['不用了']); check('2 選「不用了」＝推車沒有東西',!S.cart(GM).ids.length&&menus.length===1); }

/* ===== 3 草原超市結帳 ===== */
{ start('us_market'); await press('checkout');
  check('3 推車是空的：看的字＋「（推車是空的。）」、沒有選單、不扣錢',J(says.map(s=>s[1]))===J([LOOK.us_market.checkout,M.lines.cart_empty])&&!menus.length&&G.money===5000,J(says));
  await press('produce',[0]); await press('aisle_household',[0]); reset(); const r=await press('checkout',['結帳','要']);
  check('3 收銀員先打招呼（稿）、選單「結帳〔東西　共 $23.98（768 元）〕」',r===true&&says[0][0]==='收銀員'&&says[0][1]===M.lines.checkout_greet&&menus[0][0]==='結帳〔蘋果（一袋）、衛生紙（二十四捲）　共 $23.98（768 元）〕',J([says[0],menus[0]]));
  check('3 扣 768 元＋袋子 3 元、時間 +20 分鐘、存檔一次',G.money===5000-768-3&&Math.abs(adv-1/3)<1e-9&&saves>=1,J([G.money,adv]));
  check('3 問袋子（「要〔$0.10〕」／不用了）→「祝你有美好的一天。」；推車空了',J(says.slice(1))===J([['收銀員',M.lines.checkout_bag],['收銀員',M.lines.checkout_done]])&&J(menus[1])===J(['要〔$0.10〕','不用了'])&&!S.cart(GM).ids.length,J([says,menus]));
  start('us_market'); await press('dairy',[0]); reset(); await press('checkout',['結帳','不用了']); check('3 不要袋子＝只扣東西的錢（121 元）',G.money===5000-121,String(G.money));
  start('us_market'); await press('dairy',[0]); reset(); await press('checkout',['不用了']); check('3 結帳選「不用了」＝不扣錢、東西還在推車',G.money===5000&&J(S.cart(GM).ids)===J(['usm_milk'])&&says.length===1);
  const r0=S.rand; try{ S.rand=()=>0.9; reset(); await press('self_checkout',['結帳']);
    check('3 自助結帳：機器那一句旁白、扣錢、不問袋子、沒有收銀員的話',J(says)===J([[null,M.lines.self_checkout]])&&menus.length===1&&G.money===5000-121,J([says,menus,G.money]));
    S.rand=()=>0.1; await press('dairy',[0]); reset(); await press('self_checkout',['結帳']); check('3 自助結帳有時候多「紅燈亮了」那一句',J(says.map(s=>s[1]))===J([M.lines.self_checkout,M.lines.self_checkout_help]),J(says)); } finally { S.rand=r0; } }

/* ===== 4 錢不夠 ===== */
{ start('us_market','2028-10-10',200); await press('produce',[0]); await press('aisle_household',[0]); reset(); await press('checkout',['結帳','不用了']);
  check('4 草原：選單的「結帳」是灰的、旁白 no_money、最貴的（衛生紙）拿掉、剩下的蘋果付掉（160 元）',/（灰）$/.test(menus[0][0])&&said(M.lines.no_money)&&G.money===40&&!G.flags.USM_TP&&said(M.lines.checkout_done),J([menus,says,G.money]));
  start('us_market','2028-10-10',0); await press('produce',[0,0]); reset(); await press('checkout',['結帳']);
  check('4 草原：身上 0 元＝不扣錢、不會變負的、沒有袋子和再見；推車少了最貴的那一樣',G.money===0&&adv===0&&said(M.lines.no_money)&&!said(M.lines.checkout_done)&&J(S.cart(GM).ids)===J(['usm_banana']),J([says,S.cart(GM).ids]));
  start('us_asian_market','2028-10-10',400); await press('asia_rice',[0]); await press('asia_frozen',[0]); await press('asia_dry',[0]); reset(); await press('asia_checkout',['結帳']);
  check('4 竹葉：阿姨「先拿水餃，其他下次。」、只買水餃（320 元）、其他放回去、沒有進物品',says.some(s=>s[0]==='阿姨'&&s[1]===A.lines.no_money)&&G.money===80&&!G.flags.GG3_OWN&&!S.cart(GM).ids.length&&GIFTH.bag(G).length===0,J([says,G.money,G.flags]));
  start('us_asian_market','2028-10-10',100); await press('asia_rice',[0]); await press('asia_frozen',[0]); reset(); await press('asia_checkout',['結帳']);
  check('4 竹葉：連水餃都不夠＝什麼都不買、不扣錢',G.money===100&&adv===0&&!S.cart(GM).ids.length&&!said(A.lines.checkout_done));
  start('us_asian_market','2028-10-10',100); await press('asia_rice',[0]); reset(); await press('asia_checkout',['結帳']);
  check('4 竹葉：沒有水餃＝什麼都不買、不扣錢',G.money===100&&!G.flags.GG3_OWN&&!S.cart(GM).ids.length); }

/* ===== 5 買的東西去哪 ===== */
{ start('us_asian_market'); await press('asia_noodles',[0]); await press('asia_rice',[0]); await press('asia_snacks',['鳳梨酥']); await press('asia_dry',['臺灣烏龍茶']); reset(); await press('asia_checkout',['結帳']);
  const p=224+288+288+320;
  check('5 一次結四樣：扣 '+p+' 元（一樣一樣換算再加）',G.money===5000-p,String(G.money));
  check('5 eat（泡麵）不留；own（米）記在 G.flags.GG3_OWN.us_asian_market',J(G.flags.GG3_OWN)===J({us_asian_market:{usa_rice:1}}),J(G.flags.GG3_OWN));
  const h=GG3.ownHTML(G); check('5 選單「物品」分頁列得到：店名＋品名（都是稿的字）',h.includes('<b>竹葉亞洲超市</b>')&&h.includes('· 米（五磅的小袋）')&&!h.includes('泡麵'),h);
  check('5 gift（鳳梨酥、烏龍茶）在「包包裡的禮物」',J(GIFTH.bag(G).map(b=>[b.id,b.shop]))===J([['usa_pineapple','us_asian_market'],['usa_oolong','us_asian_market']]),J(GIFTH.bag(G)));
  const bh=GIFTH.bagHTML(G); check('5 包包那一頁：品名、店名、價錢，沒有 undefined',bh.includes('鳳梨酥（一盒）')&&bh.includes('竹葉亞洲超市・288 元')&&!/undefined|null/.test(bh),bh.slice(0,400));
  check('5 節日可以送（一般禮物：對誰都是 ok、誰都列得到）',GIFTH.cat('heroine_01','usa_pineapple')==='ok'&&GIFTH.givable(G,'heroine_03').some(x=>x.id==='usa_oolong'));
  check('5 節日送禮那一套的「買禮物…」不會在超市出現（店的 items 是空的）；原本的 67 樣禮物沒有少',GIFTH.shopOpt(G,'us_asian_market')===null&&Object.keys(GIFT_HOLIDAY.items).length===67+3&&!!GIFT_HOLIDAY.items.g_warmer);
  start('us_market'); await press('aisle_household',[0]); await press('service',[0]); reset(); await press('checkout',['結帳','不用了']);
  check('5 草原：衛生紙、明信片進物品',J(G.flags.GG3_OWN)===J({us_market:{usm_tp:1,usm_postcard:1}})&&GG3.ownHTML(G).includes('<b>草原超市</b>'),J(G.flags.GG3_OWN));
  start('us_asian_market'); for(let i=0;i<10;i++) GIFTH.rec(G).bag.push({id:'g_warmer',day:G.day,shop:'cvs'}); reset(); await press('asia_snacks',['鳳梨酥']);
  check('5 包包滿了（10 樣）：禮物拿不了、有提示',!S.cart(GM).ids.length&&toasts.length===1&&/10/.test(toasts[0]),J([S.cart(GM).ids,toasts])); }

/* ===== 6 季節、熟食櫃台、衛生紙 ===== */
{ start('us_market','2028-10-10'); await press('deli');
  check('6 熟食櫃台：看 → 號碼牌旁白 → 店員 Half or whole?；十月只有烤雞',J(says)===J([[null,LOOK.us_market.deli],[null,M.lines.deli_number],['店員',M.lines.deli_staff]])&&J(menus[0])===J(['烤雞（半隻）　$5.99','不用了']),J([says,menus]));
  start('us_market','2028-11-20'); await press('deli'); check('6 十一月多了火雞胸',menus[0].length===3&&menus[0][1].startsWith('火雞胸'),J(menus));
  start('us_market','2028-12-01'); await press('deli'); check('6 十二月沒有火雞胸',menus[0].length===2);
  start('us_market','2028-10-10'); await press('aisle_household',[0]); check('6 日用品：輪到你買衛生紙那一句',said(M.lines.tp_roommate));
  await press('checkout',['結帳','不用了']); GM.enterN++; reset(); await press('aisle_household'); check('6 這個月買過＝不再說（還是可以買）',!said(M.lines.tp_roommate)&&menus.length===1&&G.flags.USM_TP===202810,J([says,G.flags]));
  G.day=DK('2028-11-02'); GM.enterN++; reset(); await press('aisle_household'); check('6 下個月又說',said(M.lines.tp_roommate));
  const mid=S.moonDay(2028); check('6 2028 的中秋＝10/3（日曆）',mid===DK('2028-10-03'),String(mid));
  check('6 月餅 9/15～10/3 才賣（9/14、10/4 沒有）',!S.mooncakeOn({day:DK('2028-09-14')})&&S.mooncakeOn({day:DK('2028-09-15')})&&S.mooncakeOn({day:DK('2028-10-03')})&&!S.mooncakeOn({day:DK('2028-10-04')}));
  start('us_asian_market','2028-09-20'); await press('asia_checkout',[0]);
  check('6 竹葉結帳櫃台：先演稿的月餅那一句、「月餅…　$5.00／不用了」；拿了就接著結帳',says[0][1]===A.lines.mooncake&&J(menus[0])===J(['月餅（一顆，九月中到中秋）　$5.00','不用了'])&&menus.length===2,J([says,menus]));
  start('us_asian_market','2028-09-20'); await press('asia_checkout',['不用了']); reset(); await press('asia_checkout');
  check('6 月餅一趟只問一次（第二次按＝空推車只有看）',!says.length&&!menus.length&&caps[0]===LOOK.us_asian_market.asia_checkout,J([says,caps]));
  start('us_asian_market','2028-10-10'); await press('asia_checkout'); check('6 過了中秋：櫃台沒有月餅',!says.length&&!menus.length&&caps.length===1); }

/* ===== 7 沙茶醬 ===== */
{ start('us_asian_market','2028-10-10'); await press('asia_sauce',['沙茶醬']);
  check('7 拿了最後一罐＝旁白 satay_last',said(A.lines.satay_last)&&says[0][1]===LOOK.us_asian_market.asia_sauce);
  await press('asia_checkout',['結帳']); check('7 買了：進物品、記下哪一天',G.flags.GG3_OWN.us_asian_market.usa_satay===1&&G.flags.USM_SATAY===G.day);
  G.day+=13; GM.enterN++; reset(); await press('asia_sauce');
  check('7 14 天內：那一格看的字換成 satay_gone、選單沒有沙茶醬',says[0][1]===A.lines.satay_gone&&J(menus[0])===J(['醬油　$4.49','不用了']),J([says,menus]));
  G.day+=1; GM.enterN++; reset(); await press('asia_sauce'); check('7 第 15 天補貨：看的字照舊、又買得到',says[0][1]===LOOK.us_asian_market.asia_sauce&&menus[0].some(t=>t.startsWith('沙茶醬')),J([says,menus]));
  start('us_asian_market','2028-10-10'); await press('asia_sauce',['沙茶醬']); GM.enterN++; reset(); await press('asia_sauce'); check('7 拿了沒結帳就走＝沒買（下次進來還在架上）',G.flags.USM_SATAY==null&&menus[0].some(t=>t.startsWith('沙茶醬'))); }

/* ===== 8 阿姨 ===== */
{ start('us_asian_market'); await press('asia_drinks',[0]); reset(); await press('asia_checkout',['結帳']);
  check('8 那天第一次：阿姨「臺灣來的？」那一句 → 買完「袋子要不要？不用錢。」',J(says)===J([['阿姨',A.lines.greet],['阿姨',A.lines.checkout_done]])&&G.money===5000-41,J(says));
  await press('asia_drinks',[0]); reset(); await press('asia_checkout',['結帳']); check('8 同一天第二次不再招呼',J(says)===J([['阿姨',A.lines.checkout_done]]),J(says));
  start('us_asian_market'); G.flags.USL_ASIA_N=3; await press('asia_drinks',[0]); reset(); await press('asia_checkout',['結帳']); check('8 去過三天以上＝「又來了。水餃今天有進貨。」',says[0][1]===A.lines.greet_regular,J(says));
  start('us_market_street','2028-10-08'); G.hour=15; reset(); await STORY.interact({exit:{to:'us_asian_market'},label:'進'},GM);
  check('8 週日關門按店門：多一句 closed_sunday 旁白、照舊交給原本的（開放時間的提示）',G.weekday===0&&caps[0]===A.lines.closed_sunday&&inner.length===1,J([G.weekday,caps,inner.length]));
  start('us_market_street','2028-10-09'); reset(); await STORY.interact({exit:{to:'us_asian_market'},label:'進'},GM); check('8 週一開著：不說',!caps.length&&inner.length===1); }

/* ===== 9 月餅給學姊 ===== */
{ start('us_asian_market','2028-09-20'); here=true; check('9 包包沒有月餅＝沒有選項',!STORY.TALK_OPTS.flatMap(f=>f(G,'heroine_05')).length);
  await press('asia_checkout',[0,'結帳']); check('9 買了月餅：在包包裡',GIFTH.bag(G).some(b=>b.id==='usa_mooncake'),J(GIFTH.bag(G)));
  const O=STORY.TALK_OPTS.flatMap(f=>f(G,'heroine_05')); check('9 當面和學姊說話多「送她月餅」；別人沒有',O.length===1&&O[0].t==='送她月餅'&&!STORY.TALK_OPTS.flatMap(f=>f(G,'heroine_01')).length,J(O.map(o=>o.t)));
  here=false; check('9 不在美國＝沒有這個選項',!STORY.TALK_OPTS.flatMap(f=>f(G,'heroine_05')).length); here=true;
  reset(); await O[0].run(GM,{name:'學姊'}); check('9 送了：她那一句（稿）、月餅從包包拿掉、記下來',J(says)===J([['學姊',A.lines.mooncake_give]])&&!GIFTH.bag(G).length&&G.flags.USM_MOON_GIVEN===G.day,J([says,GIFTH.bag(G)]));
  GIFTH.rec(G).bag.push({id:'usa_mooncake',day:G.day,shop:'us_asian_market'}); check('9 只出一次（再買一顆也沒有選項）',!STORY.TALK_OPTS.flatMap(f=>f(G,'heroine_05')).length); }

/* ===== 10 存檔 ===== */
{ start('us_market'); await press('produce',[0]); const s1=J(G); check('10 推車不進存檔（拿了東西，G 沒有變）',s1===J({zone:G.zone,day:G.day,hour:15,money:5000,flags:{},weekday:G.weekday})||!/usm_apple/.test(s1),s1);
  GM.enterN++; check('10 走出去再進來＝推車是空的',!S.cart(GM).ids.length);
  await press('produce',[0]); LOADLOCKS['us_markets3d:cart'](); check('10 讀檔（LOADLOCKS）＝推車是空的',!S.cart(GM).ids.length);
  const old={zone:'us_asian_market',day:DK('2028-10-10'),hour:15,money:500}; G=old; GM.G=G; G.weekday=2; GM.enterN++; reset(); let err=null; try{ await press('asia_sauce',[0]); await press('asia_checkout',['結帳']); }catch(e){ err=e; }
  check('10 舊存檔（沒有 flags）照常買',!err&&G.money===500-144&&G.flags.GG3_OWN.us_asian_market.usa_soy===1,String(err&&err.stack));
  check('10 舊存檔讀「物品」不寫存檔',(()=>{ const g={flags:{}}; GG3.ownHTML(g); S.talkOpts(g,'heroine_05'); S.satayGone(g); return J(g)==='{"flags":{}}'; })());
  const g2=JSON.parse(J(G)); check('10 存檔 JSON 來回：物品還在',GG3.ownHTML(g2).includes('醬油')); }

/* ===== 11 不亂接、載入 ===== */
{ start('gongguan'); reset(); const r=await STORY.interact({usMarket:'produce',label:'x'},GM); check('11 不是這兩區＝交給原本的',r===false&&inner.length===1&&!says.length&&!menus.length);
  start('us_market'); reset(); await STORY.interact({exit:{to:'us_market_street'},label:'出門'},GM); await STORY.interact({label:'別的',look:'x'},GM); check('11 出口、沒有 usMarket 的點＝交給原本的',inner.length===2&&!says.length&&!caps.length);
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const at=f=>html.indexOf('"'+f+'?');
  check('11 index.html：資料檔 → us_markets3d.js，排在 us_life3d、gg3shops3d、gifthol3d 後面',at(DATA)>0&&at('src/us_markets3d.js')>at(DATA)&&at(DATA)>at('src/us_life3d.js')&&at(DATA)>at('src/gg3shops3d.js')&&at(DATA)>at('src/gifthol3d.js'));
  const bad=[]; for(const f of ['src/us_markets3d.js',DATA,'src/gg3shops3d.js']){ const r2=cp.spawnSync(process.execPath,['--check',path.join(ROOT,f)],{encoding:'utf8'}); if(r2.status!==0) bad.push(f+' '+r2.stderr.slice(0,160)); }
  check('11 node --check',!bad.length,bad.join('；')); }

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
