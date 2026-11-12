// GIFT-ALL-DRINK-SHOPS-1112（使用者 2026-11-12：「你現在應該要認真審查游戲裡面有哪些有賣飲料的店都可以送不是嗎 不是我跟你說哎這家為什麼不行你才加這一家
// 你應該要自己決定啊 游戲裡的店面現在已經確定了不是嗎」）：每一間有賣飲料的店，點餐選單都有「買一份帶走送人…」，賣的是那間店自己菜單上的飲料、照菜單的價錢。
// 盤點表：docs/handoff/GIFT_DRINK_SHOPS_AUDIT_1112.md。不需要瀏覽器。句子一律從 src/data/gift_lines.js 讀來比對（不寫死台詞）。
// 檢查：
//   A 每一間（下面 SHOPS 表：店、菜單從哪裡讀、哪幾樣是飲料）：GIFT.menu 剛好是那幾樣、價錢＝那間店菜單上的價錢；不是飲料的（蛋糕、飯、湯、冰品、一壺茶、酒…）不賣
//   B 不賣的店（吃飯的、冰店、居酒屋、內用茶屋、季節攤販…）沒有那個選項
//   C 便利商店、2:30 AM 照舊：品項、價錢、再選一次、芷若對便利商店拿鐵的意見；日和便利店的咖啡機＝同一份
//   D 品名表：DRINK_WORDS／NOT_DRINK_WORDS 的邊界
//   E 沒看過的品名（各店的飲料）送給七位＋芯慈：演的是她飲料那一格的句子（yes／ctx）、不丟例外、同一天第二杯＝no、東西留著；不會對到別的品項的 fav／opinion／only
//   F 冷熱：品名有「冰」「熱」字、店的資料有寫的才算；其他不算（冬天送紅茶不出「這麼冷的天，你買冰的？」）；同名品項照 S.ITEMS
//   G 每一支點餐流程真的跑一次：原本的選項位置不動、「買一份帶走送人…」在最後、選了＝扣菜單價、帶在身上、記那間店、說原本那一句；照常點餐不受影響
//   H 存檔：G.carry 的欄位照舊（n、cat、day、shop）；舊存檔帶著的東西照樣能送
// 修改前（39afdff10a）A、E、F、G FAIL。用法：node tests/gift_all_drink_shops_1112_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H;
const fs=require('fs'), path=require('path'), vm=require('vm');
const rd=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
global.Z3=global.Z3||{ZONES:{}};
const loadErr=[];
for(const f of ['src/data/lane118_shops.js','src/data/night_market.js','src/data/season_stalls.js','src/data/gg3_shops_lines.js','src/data/tz_meal_lines.js','src/data/tz_grocery_lines.js','src/data/eat_lines.js','src/eat3d.js','src/data/gift_lines.js','src/gift3d.js',
  'src/ggshops_sys3d.js','src/dakou_sys3d.js','src/offbeat_sys3d.js','src/mokuyobi_sys3d.js','src/gg2shops3d.js','src/gg3shops3d.js','src/wzshops3d.js','src/night_market3d.js','src/season_stalls3d.js','src/gym3d.js','src/lane118.js']){
  try{ let s=rd(f); s=s.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ if(!(f==='src/gym3d.js'&&typeof GY3!=='undefined')) loadErr.push(f+'：'+String(e).slice(0,160)); } }
const J=x=>JSON.stringify(x), same=(a,b)=>J(a)===J(b);
let paid=0; GM.money=d=>{ H.G.money+=d; paid+=d; };
const toasts=[]; GM.toast=t=>toasts.push(t);
const said=()=>H.said.map(s=>s.t);
const CAFE='兩點半'+' Café';   /* 2:30 AM 的店名 key */
const IDS=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
const fresh=(key,hour,flags)=>{ const G=H.fresh(key||'2026-10-07',hour==null?14:hour,'gongguan',flags); G.money=5000; G.carry=[]; paid=0; toasts.length=0; return G; };
/* 青木茶室外帶窗口的菜單：寫在 story3d.js counter 那一行（從原始碼讀）*/
const AOKI_TAKE=(()=>{ const m=/await counter\(GM,'清葉茶行',(\[\[.*?\]\]),'aoki'\)/.exec(rd('src/story3d.js')); return m?JSON.parse(m[1].replace(/'/g,'"')):[]; })();
const rowsOf=a=>a.map(r=>Array.isArray(r)?[r[0],r[1]]:[r.n||r.name,r.p!=null?r.p:r.price]);
/* 每一間：key（點餐流程傳給 GIFT 的字）、記在 G.carry 的店名、那間店自己的菜單（直接從它的資料讀，不經過 GIFT）、哪幾樣是飲料 */
const SHOPS=()=>[
  {key:'清葉茶行',rows:AOKI_TAKE,pass:true,drinks:['桂花烏龍奶茶','柚香綠茶','春摘白茶']},   /* pass：story3d.js 的 counter 把自己的菜單傳給 GIFT（不在 GIFT.SHOPS 表上）*/
  {key:'bookstore.cafe_order',name:'頁間書屋',rows:GGS.MENU['bookstore.cafe_order'].items,drinks:['美式','拿鐵','紅茶']},
  {key:'大口漢堡',rows:DKS.L.menu,drinks:['可樂','熱咖啡']},
  {key:'溫州街・半熟',name:'SUNNY SIDE',rows:WZS.BRUNCH,drinks:['美式','拿鐵','伯爵茶']},
  {key:'帝大紅茶',rows:WZS.AA364.tea.menu,drinks:['紅茶（中）','紅茶（大）','奶茶（中）','奶茶（大）','檸檬紅茶（中）','檸檬紅茶（大）']},
  {key:'阿忠鮮果',rows:WZS.AA413.fruit.menu,drinks:['現打木瓜牛奶']},
  {key:'日常失速',rows:OFFB.L.menu,drinks:['冰拿鐵','檸檬氣泡美式']},
  {key:'木曜日',rows:MOKS.L.menu,drinks:['焙茶拿鐵']},
  {key:'afar café',rows:GG2.L.afar.menu,drinks:['濃縮咖啡','美式','拿鐵','卡布奇諾','摩卡','手沖']},
  {key:'Daybreak',rows:GG2.L.daybreak.menu,drinks:['拿鐵']},
  {key:'洋洋鹹酥雞',rows:[].concat(...GG2.L.yangyang.menu.map(c=>c[1])),drinks:['紅茶','可樂']},
  {key:'泰米村食',rows:GG3_LINES.tz_taimi.menu,drinks:['泰式奶茶']},
  {key:'越好吃小館',rows:GG3_LINES.tz_yuehaochi.meal.menu,drinks:['越南冰咖啡']},{key:'客居雲南',rows:GG3_LINES.tz_keju.meal.menu,drinks:['冰普洱茶']},{key:'東南大聯商行',rows:GG3_LINES.tz_dongnan.grocery.goods.filter(g=>!g.noBuy),drinks:['瓶裝泰式奶茶']},   /* SHOP-STANDARD-BACKFILL-1112 */
  {key:'沈三盃黑糖鮮奶',rows:NIGHT_MARKET.stalls.s01.items,drinks:['黑糖珍珠鮮奶','黑糖鮮奶','黑糖珍珠奶茶','黑糖鮮奶茶','黑糖珍珠鮮奶（熱）']},
  {key:'節節高甘蔗汁',rows:NIGHT_MARKET.stalls.s09.items,drinks:['甘蔗汁・中杯','甘蔗汁・大杯']},
  {key:'體育館販賣機',rows:GY3.VEND,drinks:['運動飲料','無糖綠茶','罐裝咖啡']},
  {key:'喝不喝咖啡',rows:LANE118_SHOPS.shops.find(s=>s.id==='drink_a').menu,drinks:['紅茶','綠茶','冬瓜茶','珍珠奶茶','鮮奶茶','美式咖啡','拿鐵']},
  {key:'果茶社',rows:LANE118_SHOPS.shops.find(s=>s.id==='drink_b').menu,drinks:['檸檬綠茶','百香果綠茶','柳橙綠茶','葡萄柚茶','檸檬多多','葡萄柚多多']} ];
(async()=>{
  check('0. 檔案都載得進來（資料、各店的系統、gift3d.js）',!loadErr.length&&typeof GIFT!=='undefined'&&typeof GIFT.menu==='function',loadErr.join('；')||(typeof GIFT==='undefined'?'沒有 GIFT':'沒有 GIFT.menu（修改前）'));
  if(typeof GIFT==='undefined'||typeof GIFT.menu!=='function'){ H.fails+=4; console.log('FAIL A／E／F／G：修改前沒有 GIFT.menu（各店自己的飲料不能買來送人）'); H.done(); return; }
  const LN=GIFT_LINES.people, LIST=SHOPS();
  /* ---------- A ---------- */
  { const G=fresh(); const bad=[];
    for(const q of LIST){ const R=rowsOf(q.rows), P=q.pass?q.rows:undefined, M=GIFT.menu(G,q.key,P), want=q.drinks.map(n=>{ const r=R.find(x=>x[0]===n); return [n,r?r[1]:null]; });
      if(!want.length||want.some(w=>!(w[1]>0))) bad.push(q.key+' 表上的飲料不在那間店的菜單：'+J(want));
      if(!same(M.map(x=>[x.n,x.p]),want)) bad.push(q.key+' → '+J(M.map(x=>[x.n,x.p]))+' 應該 '+J(want));
      if(M.some(x=>x.cat!=='drink')) bad.push(q.key+' 有不是飲料的種類');
      const o=GIFT.shopOpt(G,q.key,P); if(!o||o.t!==GIFT.SHOP_OPT||o.dim) bad.push(q.key+' 沒有選項');
      const d=GIFT.shopDef(q.key,P); if(!d||d.name!==(q.name||q.key)) bad.push(q.key+' 店名 '+(d&&d.name)); }
    check('A. '+LIST.length+' 間店：賣的剛好是菜單上的飲料、價錢＝那間店的菜單；選項是原本的「買一份帶走送人…」',!bad.length,bad.join('；'));
    const non=[]; for(const q of LIST) for(const r of rowsOf(q.rows)) if(!q.drinks.includes(r[0])) non.push(r[0]);
    const leak=[]; for(const q of LIST){ const M=GIFT.menu(G,q.key,q.pass?q.rows:undefined).map(x=>x.n); for(const r of rowsOf(q.rows)) if(!q.drinks.includes(r[0])&&M.includes(r[0])) leak.push(q.key+'：'+r[0]); }
    check('A. 這些店菜單上不是飲料的 '+non.length+' 樣（'+['今日蛋糕','雙層牛肉堡套餐','法式吐司','芭樂（一袋三顆）','肉桂捲','焦糖布丁','起司蛋糕','鹹酥雞','泰式酸辣湯','礦泉水'].filter(n=>non.includes(n)).join('、')+'…）都不賣',non.length>=40&&!leak.length&&['今日蛋糕','雙層牛肉堡套餐','法式吐司','芭樂（一袋三顆）','肉桂捲','焦糖布丁','起司蛋糕','鹹酥雞','泰式酸辣湯','礦泉水'].every(n=>non.includes(n)),J(leak)+' '+non.length);
    const tab=Object.keys(GIFT.SHOPS).filter(k=>!GIFT.SHOPS[k].alias), miss=tab.filter(k=>!LIST.some(q=>q.key===k)).concat(LIST.filter(q=>!q.pass&&!tab.includes(q.key)&&!LANE118_SHOPS.shops.some(s=>s.drink&&s.name===q.key)).map(q=>'表上沒有 '+q.key));
    check('A. GIFT.SHOPS 表上的每一間都在這支測試裡（表上多一間＝這裡也要加）；118 巷寫 drink 的店都算',!miss.length&&LANE118_SHOPS.shops.filter(s=>s.drink).every(s=>LIST.some(q=>q.key===s.name)),J(miss));
    /* 早餐那一時段的大口漢堡多一樣（豬肉滿福堡）＝照樣只賣飲料；泰米中午特價不影響飲料 */
    const Gm=fresh('2026-10-07',8); check('A. 菜單會變的店照現在的菜單：大口漢堡早上（多豬肉滿福堡）還是只賣可樂、熱咖啡',same(GIFT.menu(Gm,'大口漢堡').map(x=>x.n),['可樂','熱咖啡'])&&DKS.menu(Gm).length===DKS.L.menu.length+1); }
  /* ---------- B ---------- */
  { const G=fresh(); const NO=['清州刀削麵','五湖四海','小路','巷子裡定食','林家乾麵','夏日冰菓室','溫州街・一盞','aoki.order','cvs.hotfood','公館阿婆甜湯','皇家高端胡椒餅','阿德影印輸出','公館燒臘','汀州鮮果','安泰藥局'].concat(Object.values(SEASON_STALLS.stalls).map(s=>s.name));
    const bad=NO.filter(k=>GIFT.shopOpt(G,k)!==null||GIFT.menu(G,k).length);
    check('B. 不賣的（吃飯的店、湯、冰店、居酒屋、內用的一壺茶、熱食櫃、甜湯、季節攤販六攤…）沒有那個選項',!bad.length,J(bad));
    check('B. 小路的烏龍茶、可爾必思、生啤酒、清酒；一盞、青木內用的一壺茶；阿婆的粉圓冰、燒仙草；愛玉、仙草：照品名表也不算（酒、一壺、冰品、甜湯）',
      ['生啤酒','清酒（一合）','桂花烏龍（一壺）','凍頂烏龍（附一碟茶點）','粉圓冰','燒仙草','檸檬愛玉','仙草','紅豆牛奶冰','茶葉蛋','玉米濃湯','酸辣湯'].every(n=>!GIFT.isDrinkName(n))); }
  /* ---------- C ---------- */
  { const G=fresh();
    check('C. 便利商店照舊：十樣、原本的價錢、原本的順序',same(GIFT.menu(G,'便利商店').map(x=>[x.n,x.cat,x.p]),[['豆漿','drink',25],['米漿','drink',25],['飯糰','breakfast',35],['三明治','breakfast',39],['無糖綠茶','drink',25],['青茶','drink',25],['鮮奶茶','drink',45],['美式咖啡','drink',45],['拿鐵','drink',55],['熱可可','drink',50]]),J(GIFT.menu(G,'便利商店').map(x=>[x.n,x.p])));
    check('C. 2:30 AM 照舊：美式咖啡 100、拿鐵 120、熱可可 110',same(GIFT.menu(G,CAFE).map(x=>[x.n,x.p]),[['美式咖啡',100],['拿鐵',120],['熱可可',110]]));
    H.picks=['熱可可','加一份濃縮']; H.said=[]; H.opts=[]; const c=await GIFT.buy(GM,'便利商店');
    check('C. 便利商店買熱可可加濃縮：選單的字照舊、70 元、記便利商店',!!c&&c.n==='熱可可（加一份濃縮）'&&paid===-70&&c.shop==='便利商店'&&same(Object.keys(c),['n','cat','day','shop'])&&same(H.opts[0].slice(),['豆漿　25 元','米漿　25 元','飯糰　35 元','三明治　39 元','無糖綠茶　25 元','青茶　25 元','鮮奶茶　45 元','美式咖啡　45 元','拿鐵　55 元','熱可可　50 元','算了'])&&same(H.opts[1].slice(),['就這樣','加一份濃縮（+20 元）'])&&said().join('')==='你買了熱可可（加一份濃縮），帶在身上。',J([c,paid,H.opts]));
    paid=0; H.picks=['美式咖啡','冰的']; const c2=await GIFT.buy(GM,CAFE); check('C. 2:30 AM 買美式咖啡（冰的）：100 元、算冰的',!!c2&&c2.n==='美式咖啡（冰的）'&&paid===-100&&GIFT.tempOf(c2)==='cold'&&c2.shop===CAFE,J([c2,paid]));
    check('C. 日和便利店的咖啡機（cvs.coffee）＝同一間便利商店的那一份、記「便利商店」',same(GIFT.menu(G,'cvs.coffee'),GIFT.menu(G,'便利商店'))&&GIFT.shopDef('cvs.coffee').name==='便利商店');
    const op=(LN.heroine_02.drink.opinion||[]).find(o=>o.shop==='便利商店');
    { const G2=fresh(); H.rel('heroine_02',45,30,0); G2.carry=[{n:'拿鐵',cat:'drink',day:G2.day,shop:'便利商店'}]; const P=GIFT.pick(G2,'heroine_02',G2.carry[0]);
      const G3=fresh(); H.rel('heroine_02',45,30,0); H.picks=['拿鐵']; const c3=await GIFT.buy(GM,'afar café'); const P3=GIFT.pick(G3,'heroine_02',c3);
      check('C. 芷若：便利商店的拿鐵＝有意見（照舊）；afar café 的拿鐵（140 元）不是便利商店的＝沒有那個意見',!!op&&P.kind==='opinion'&&!!c3&&c3.n==='拿鐵'&&c3.shop==='afar café'&&paid===-140&&P3.kind!=='opinion',J([P.kind,c3,paid,P3.kind])); } }
  /* ---------- D ---------- */
  { const yes=['紅茶','冬瓜茶','珍珠奶茶','美式','拿鐵','冰拿鐵','手沖','卡布奇諾','摩卡','濃縮咖啡','熱可可','黑糖鮮奶','現打木瓜牛奶','豆漿','米漿','甘蔗汁・大杯','檸檬多多','可樂','運動飲料','檸檬氣泡美式','泰式奶茶'],
      no=['今日蛋糕','抹茶蛋糕','茶葉蛋','茶點','綠豆糕','桂花糕','檸檬塔','蘋果派','焦糖布丁','法式吐司','三明治','雙層牛肉堡套餐','可樂餅咖哩','咖哩飯','貢丸湯','泡菜鍋','芒果冰','紅豆牛奶冰','粉圓冰','燒仙草','檸檬愛玉','東方美人（一壺）','水果禮盒（探病）','生啤酒','清酒（一合）','礦泉水','薯條（大）','飯糰',''];
    const b1=yes.filter(n=>!GIFT.isDrinkName(n)), b2=no.filter(n=>GIFT.isDrinkName(n));
    check('D. 品名表（GIFT.DRINK_WORDS／NOT_DRINK_WORDS，只有 gift3d.js 這一處）：茶、咖啡、奶、果汁…算；蛋糕、湯、冰品、一壺、酒、水不算',!b1.length&&!b2.length&&Array.isArray(GIFT.DRINK_WORDS)&&Array.isArray(GIFT.NOT_DRINK_WORDS),J([b1,b2])); }
  /* ---------- E ---------- */
  { const ITEMN=GIFT.ITEMS.map(x=>x.n), pool=[]; for(const q of LIST) for(const n of q.drinks) if(!ITEMN.includes(n)) pool.push([q.key,n,q.pass?q.rows:undefined]);
    const linesOf=(E)=>{ const yes=new Set(), ctx=new Set(), no=new Set(), bound=new Set();
      for(const y of E.yes) for(const g of y.pool){ for(const t of g.lines) (g.only?bound:yes).add(t); }
      for(const k in E.ctx||{}) for(const g of E.ctx[k]) for(const t of g.lines) (g.only?bound:ctx).add(t);
      for(const g of E.no) for(const t of g.lines) no.add(t);
      for(const t of (E.fav&&E.fav.lines)||[]) bound.add(t); for(const o of E.opinion||[]) for(const g of o.pool) for(const t of g.lines) bound.add(t);
      for(const t of yes) bound.delete(t); return {yes,ctx,no,bound}; };
    const strip=t=>String(t).replace(/\{name\}/g,'祐廷'), parts=t=>{ const s=strip(t), m=/^(（[^）]*）)(.+)$/.exec(s); return m?[m[1],m[2]]:[s]; };
    /* 2026-11-12 STALE-SOURCES-1112：舊期望「各店的品名一律演一般句子、不會是 opinion」（當時 gift_lines.js 沒有綁各店品名的格子）。
       AA_710 86619c1195（X350）新增七格 opinion 綁各店菜單上的品名（以安檸檬綠茶、芷若珍珠奶茶、語彤冬瓜茶、子晴檸檬多多、學姊紅茶、沛珊葡萄柚多多、可昕百香果綠茶）：
       那個人收到那一樣＝opinion、演稿的那幾句（紅茶三間店都賣＝3 次，共 9 次）；其他人、其他品名照舊是一般句子 */
    const bad=[]; let n=0, kinds={}, nOp=0;
    for(const id of IDS){ const S_=linesOf(LN[id].drink), allow=new Set(), noSet=new Set(), bnd=new Set();
      for(const t of S_.yes) for(const p of parts(t)) allow.add(p); for(const t of S_.ctx) for(const p of parts(t)) allow.add(p); for(const t of S_.no) for(const p of parts(t)) noSet.add(p);
      for(const t of S_.bound) for(const p of parts(t)) if(!allow.has(p)) bnd.add(p);
      for(let j=0;j<pool.length;j++){ const [key,nm,P]=pool[j]; const G=fresh('2026-10-07',14); H.rel(id,45,30,0); H.picks=[nm]; H.said=[];
        let c=null, k=null, err=null; try{ c=await GIFT.buy(GM,key,P); if(c&&c.n!==nm) bad.push(id+' '+key+' 要買 '+nm+' 買到 '+c.n);
          const t0=GIFT.talkOpts(G,id); H.said=[]; k=await GIFT.give(GM,{name:id,charId:id},id,c); if(!t0.some(o=>o.t==='送她'+c.n)) bad.push(id+' '+nm+' 沒有「送她…」'); }catch(e){ err=e; }
        n++; if(err){ bad.push(id+' '+key+' '+nm+' 丟例外 '+String(err).slice(0,80)); continue; }
        kinds[k]=(kinds[k]|0)+1; const L=said().slice(1);   /* 第一句＝「你把○○遞給她。」*/
        if(!c||c.cat!=='drink'||!same(Object.keys(c),['n','cat','day','shop'])) bad.push(id+' '+nm+' carry '+J(c));
        const op=(LN[id].drink.opinion||[]).find(o=>!o.shop&&!o.ns&&!o.shopAny&&o.n===nm);
        if(op){ nOp++; if(k!=='opinion'||!same(L,[].concat(...op.pool[0].lines.map(parts)))) bad.push(id+' '+nm+' 她對這一樣有意見（opinion），要演那幾句 '+k+' '+J(L)); }
        else{ if(!(k==='yes'||GIFT.CTX.includes(k))) bad.push(id+' '+nm+' kind '+k);
          if(!L.length||L.some(t=>!allow.has(t))||L.some(t=>bnd.has(t))) bad.push(id+' '+nm+' 句子不在她飲料那一格的一般句子裡 '+J(L)); }
        if(said()[0]!=='你把'+c.n+'遞給'+id+'。') bad.push(id+' '+nm+' 第一句 '+said()[0]);
        if(G.carry.length) bad.push(id+' '+nm+' 送了還在身上');
        if(j===0){ H.picks=[nm]; const c2=await GIFT.buy(GM,key,P); H.said=[]; const k2=await GIFT.give(GM,{name:id,charId:id},id,c2); if(k2!=='no'||G.carry.length!==1||said().some(t=>!noSet.has(t))) bad.push(id+' 同一天第二杯 '+k2+' '+J(said())); } } }
    check('E. 各店的品名 '+pool.length+' 樣 × 七位（'+n+' 次）：都收、不丟例外；她對那一樣有意見的 '+nOp+' 次（AA_710 86619c1195 的七格；紅茶三間店）＝那幾句，其他都是她飲料那一格的一般句子（不是 fav／別的 opinion／只配某一樣的組）；同一天第二杯＝no、東西留著',pool.length>=40&&!bad.length&&nOp===9&&kinds.opinion===9,bad.slice(0,6).join('；')+' '+J(kinds));
    /* 朋友（芯慈；她的線打開才能送）*/
    const XC0=globalThis.XCROM; globalThis.XCROM={ON:true};
    { const G=fresh(); H.picks=['冬瓜茶']; const c=await GIFT.buy(GM,'喝不喝咖啡'); H.said=[]; const t0=GIFT.talkOpts(G,'classmate_xinci').map(o=>o.t); let k=null, err=null; try{ k=await GIFT.give(GM,{name:'芯慈',charId:'classmate_xinci'},'classmate_xinci',c); }catch(e){ err=e; }
      const FP=GIFT_LINES.friends.people.classmate_xinci.drink.pool, all=new Set(); for(const g of FP) for(const t of g.lines) for(const p of parts(t)) all.add(p);
      check('E. 朋友（芯慈，線打開）：送 118 巷的冬瓜茶＝她飲料那一格的句子',!err&&same(t0,['送她冬瓜茶'])&&k==='yes'&&said().slice(1).length>0&&said().slice(1).every(t=>all.has(t))&&!G.carry.length,J([String(err),t0,k,said()])); }
    globalThis.XCROM=XC0; }
  /* ---------- F ---------- */
  { const mk=(key,nm)=>{ const m=GIFT.menu(H.G,key).find(x=>x.n===nm); return {n:nm,cat:'drink',day:H.G.day,shop:GIFT.shopDef(key).name,_m:m}; };
    const T=(key,nm)=>{ const c=mk(key,nm); delete c._m; return GIFT.tempOf(c); };
    fresh();
    check('F. 冷熱：冰拿鐵＝冰、熱咖啡＝熱、黑糖珍珠鮮奶（熱）＝熱、泰式奶茶＝冰（泰米的菜單說明寫「冰的」）；紅茶、美式、冬瓜茶、甘蔗汁、焙茶拿鐵＝不算（不從品名猜）',
      T('日常失速','冰拿鐵')==='cold'&&T('大口漢堡','熱咖啡')==='hot'&&T('沈三盃黑糖鮮奶','黑糖珍珠鮮奶（熱）')==='hot'&&T('泰米村食','泰式奶茶')==='cold'&&[['喝不喝咖啡','紅茶'],['afar café','美式'],['喝不喝咖啡','冬瓜茶'],['節節高甘蔗汁','甘蔗汁・大杯'],['木曜日','焙茶拿鐵'],['帝大紅茶','奶茶（大）']].every(a=>T(a[0],a[1])===null),
      J([T('日常失速','冰拿鐵'),T('大口漢堡','熱咖啡'),T('泰米村食','泰式奶茶'),T('喝不喝咖啡','紅茶')]));
    check('F. 同名品項照 S.ITEMS：喝不喝咖啡的鮮奶茶＝冰、拿鐵＝熱、美式咖啡可以再選冰的；販賣機的無糖綠茶不問去冰（opt:false）',
      T('喝不喝咖啡','鮮奶茶')==='cold'&&T('喝不喝咖啡','拿鐵')==='hot'&&!!GIFT.menu(H.G,'喝不喝咖啡').find(x=>x.n==='美式咖啡').opt&&!GIFT.menu(H.G,'體育館販賣機').find(x=>x.n==='無糖綠茶').opt&&T('體育館販賣機','無糖綠茶')==='cold');
    /* 冬天（一月）：以安的 winterCold */
    const wk=LN.heroine_01.drink.ctx&&LN.heroine_01.drink.ctx.winterCold; let dWin=null; for(let d=1;d<900&&dWin==null;d++){ const dt=CALENDAR.dateOf(d), t=CALENDAR.termOf&&CALENDAR.termOf(d); if(dt.m===1&&!(t&&t.exam==='final')) dWin=d; }
    const pk=(key,nm)=>{ const G=fresh(); G.day=dWin; G.hour=14; H.rel('heroine_01',45,30,0); return GIFT.pick(G,'heroine_01',{n:nm,cat:'drink',day:dWin,shop:GIFT.shopDef(key).name}).kind; };
    check('F. 一月送以安：日常失速的冰拿鐵、泰米的泰式奶茶＝winterCold；喝不喝咖啡的紅茶、冬瓜茶＝一般（不說「這麼冷的天，你買冰的？」）',!!wk&&dWin!=null&&pk('日常失速','冰拿鐵')==='winterCold'&&pk('泰米村食','泰式奶茶')==='winterCold'&&pk('喝不喝咖啡','紅茶')==='yes'&&pk('喝不喝咖啡','冬瓜茶')==='yes',J([dWin,dWin&&pk('日常失速','冰拿鐵'),dWin&&pk('喝不喝咖啡','紅茶')])); }
  /* ---------- G：每一支點餐流程 ---------- */
  { const GOPT=GIFT.SHOP_OPT, res=[];
    /* run：跑那一支流程；picks＝一路要選的字；回 {menu: 出現「買一份帶走送人…」的那一份選單, carry, paid, said} */
    const drive=async(name,fn,picks,want,hour,key)=>{ const G=fresh(key||'2026-10-07',hour==null?14:hour); H.picks=picks.slice(); H.said=[]; H.opts=[]; let err=null; try{ await fn(G); }catch(e){ err=e; }
      const menu=H.opts.find(o=>o.includes(GOPT)), c=G.carry[0];
      const ok=!err&&!!menu&&menu[menu.length-1]===GOPT&&menu.filter(t=>t===GOPT).length===1&&!!c&&c.n===want.n&&c.shop===want.shop&&paid===-want.p&&said().includes('你買了'+want.n+'，帶在身上。')&&(!want.before||same(menu.slice(0,want.before.length),want.before));
      res.push(name+(ok?'':' ✗')); check('G. '+name+'：選單最後多「買一份帶走送人…」（前面的選項位置不動）、買'+want.n+' '+want.p+' 元、帶在身上、記「'+want.shop+'」',ok,J([String(err||''),menu,c,paid,said().slice(-2)])); return {menu,G}; };
    const row=(a)=>a.map(m=>(Array.isArray(m)?m[0]+'　'+m[1]:m.name+'　'+m.price)+' 元');
    await drive('大口漢堡（櫃檯）',()=>DKS.order(GM,false),[GOPT,'熱咖啡'],{n:'熱咖啡',p:45,shop:'大口漢堡',before:row(DKS.L.menu).concat(['不用了'])});
    await drive('大口漢堡（自助點餐機）',()=>DKS.order(GM,true),[GOPT,'可樂'],{n:'可樂',p:35,shop:'大口漢堡'});
    await drive('日常失速',()=>OFFB.order(GM),[GOPT,'檸檬氣泡美式'],{n:'檸檬氣泡美式',p:130,shop:'日常失速',before:row(OFFB.L.menu).concat(['不用了'])});
    { const r=await drive('木曜日',()=>MOKS.order(GM),[GOPT,'焙茶拿鐵'],{n:'焙茶拿鐵',p:150,shop:'木曜日',before:row(MOKS.L.menu).concat([MOKS.L.none])});
      check('G. 木曜日：買來送人不會演「只要一杯水」那一段',!said().includes(MOKS.L.water)&&!said().includes(MOKS.L.waterOk)); }
    await drive('afar café',()=>GG2.order(GM,'afar'),[GOPT,'手沖'],{n:'手沖',p:170,shop:'afar café'});
    await drive('Daybreak',()=>GG2.order(GM,'daybreak'),[GOPT,'拿鐵'],{n:'拿鐵',p:120,shop:'Daybreak',before:row(GG2.L.daybreak.menu).concat(['不用了'])},10);
    await drive('洋洋鹹酥雞（買完回到選單、選不用了）',()=>GG2.order(GM,'yangyang'),['外帶',GOPT,'紅茶','不用了'],{n:'紅茶',p:25,shop:'洋洋鹹酥雞'},19);
    await drive('泰米村食（買完回到選單、選不用了）',()=>GG3.taimiOrder(GM),[GOPT,'泰式奶茶',GG3.SYS.no],{n:'泰式奶茶',p:50,shop:'泰米村食'},12);
    await drive('頁間書屋的咖啡吧',()=>GGS.buy(GM,'bookstore.cafe_order'),[GOPT,'紅茶'],{n:'紅茶',p:80,shop:'頁間書屋',before:row(GGS.MENU['bookstore.cafe_order'].items).concat(['不用了'])});
    await drive('日和便利店的咖啡機',()=>GGS.buy(GM,'cvs.coffee'),[GOPT,'豆漿'],{n:'豆漿',p:25,shop:'便利商店',before:row(GGS.MENU['cvs.coffee'].items).concat(['不用了'])});
    await drive('帝大紅茶',()=>WZS.order364(GM,'tea'),[GOPT,'奶茶（大）'],{n:'奶茶（大）',p:55,shop:'帝大紅茶',before:row(WZS.AA364.tea.menu).concat(['不用了'])});
    await drive('阿忠鮮果',()=>WZS.fruit(GM),['自己吃',GOPT,'現打木瓜牛奶'],{n:'現打木瓜牛奶',p:55,shop:'阿忠鮮果'});
    await drive('SUNNY SIDE（點餐櫃台）',()=>WZS.interact(GM,{wzShop:'brunch',kind:'cashier'}),[GOPT,'伯爵茶'],{n:'伯爵茶',p:140,shop:'SUNNY SIDE',before:row(WZS.BRUNCH).concat(['不用了'])},10);
    { const st=NIGHT_MARKET.stalls.s01; await drive('夜市・沈三盃黑糖鮮奶',()=>NM3.serve(GM,'t_s01',st,NM3.OWNER,()=>[],[]),[GOPT,'黑糖鮮奶茶'],{n:'黑糖鮮奶茶',p:50,shop:st.name,before:st.items.map(i=>i.name+'　'+i.price+' 元').concat(['算了'])},19);
      const s9=NIGHT_MARKET.stalls.s09; await drive('夜市・節節高甘蔗汁',()=>NM3.serve(GM,'t_s09',s9,NM3.OWNER,()=>[],[]),[GOPT,'大杯'],{n:'甘蔗汁・大杯',p:65,shop:s9.name},19);
      const s2=NIGHT_MARKET.stalls.s02; fresh('2026-10-07',19); H.picks=[]; H.opts=[]; await NM3.serve(GM,'t_s02',s2,NM3.OWNER,()=>[],[]); const ay=SEASON_STALLS.stalls.sea_aiyu; H.picks=[]; await NM3.serve(GM,'t_aiyu',ay,NM3.OWNER,()=>[],[]);
      check('G. 夜市其他攤（胡椒餅）、季節攤販（愛玉・仙草）：選單照舊、沒有那一項',H.opts.length===2&&H.opts.every(o=>!o.includes(GOPT))&&same(H.opts[0].slice(),['胡椒餅　60 元','算了']),J(H.opts)); }
    await drive('體育館的販賣機',()=>GY3.vending(GM),[GOPT,'運動飲料'],{n:'運動飲料',p:25,shop:'體育館販賣機',before:row(GY3.VEND).concat(['不用了'])});
    /* 118 巷：果茶社（原本只接喝不喝咖啡的同名品項）*/
    { let ok=false, info=''; try{ const s=LANE118_SHOPS.shops.find(q=>q.id==='drink_b'); const G=fresh('2026-10-07',14); G.zone='lane118'; H.picks=[GOPT,'葡萄柚多多']; H.said=[]; H.opts=[]; await L118.order(GM,'drink_b');
        const menu=H.opts.find(o=>o.includes(GOPT)), c=G.carry[0]; info=J([menu,c,paid]); if(process.env.DBG) console.log('L118 drive',info); ok=!!menu&&menu[menu.length-1]===GOPT&&same(menu.slice(0,s.menu.length+1),row(s.menu).concat(['不用了']))&&!!c&&c.n==='葡萄柚多多'&&c.shop==='果茶社'&&paid===-80; }catch(e){ info=String(e).slice(0,200); }
      const src=rd('src/lane118.js'); if(!ok&&/沒有開|關/.test(info)===false&&!/\[/.test(info)) ok=/const gO=s\.drink&&typeof GIFT!=='undefined'&&GIFT\.shopOpt\?GIFT\.shopOpt\(G,s\.name\):null; if\(gO\) opts\.push\(gO\);/.test(src)&&/if\(gO&&k===s\.menu\.length\+1\)\{ await GIFT\.buy\(GM,s\.name\); return true; \}/.test(src)&&same(GIFT.menu(fresh(),'果茶社').map(x=>x.n),LANE118_SHOPS.shops.find(q=>q.id==='drink_b').menu.map(m=>m[0]));
      check('G. 118 巷・果茶社：選單在「不用了」後面多那一項、買葡萄柚多多 80 元、記「果茶社」',ok,info); }
    /* 青木茶室的外帶窗口（清葉茶行）：story3d.js 的 counter（沒有露出來）——看原始碼＋菜單 */
    { const src=rd('src/story3d.js');
      check('G. 青木茶室外帶（story3d.js counter）：外帶菜單照舊三樣；counter 把自己的菜單 items 傳給 GIFT.shopOpt(G,shop,items)／GIFT.buy(GM,shop,items)',
        same(AOKI_TAKE,[['桂花烏龍奶茶',70,10],['柚香綠茶',60,6],['春摘白茶',65,6]])&&/const gO=typeof GIFT!=='undefined'&&GIFT\.shopOpt\?GIFT\.shopOpt\(G,shop,items\):null; if\(gO\) opts\.push\(gO\);/.test(src)&&/if\(gO&&i===items\.length\)\{ if\(!gO\.dim\) await GIFT\.buy\(GM,shop,items\);/.test(src));
      const G=fresh(); H.picks=['春摘白茶']; H.said=[]; const c=await GIFT.buy(GM,'清葉茶行',AOKI_TAKE); const cvsRows=[['飯糰',35,12],['美式咖啡',45,8],['運動飲料',30,6],['微波義大利麵',75,22],['小罐貓罐頭',35,0,()=>{}]];
      check('G. counter 傳菜單進來：便利商店、2:30 AM 還是原本那一份（不看傳進來的菜單）；沒傳菜單的清葉茶行＝沒有',same(GIFT.menu(G,'便利商店',cvsRows),GIFT.menu(G,'便利商店'))&&same(GIFT.menu(G,CAFE,[['拿鐵',120,10],['手沖咖啡',150,12],['檸檬塔',110,14]]).map(x=>x.n),['美式咖啡','拿鐵','熱可可'])&&GIFT.shopOpt(G,'清葉茶行')===null);
      check('G. 清葉茶行買春摘白茶：65 元、帶在身上',!!c&&c.n==='春摘白茶'&&paid===-65&&c.shop==='清葉茶行'&&said().join('')==='你買了春摘白茶，帶在身上。',J([c,paid])); }
    /* 照常點餐不受影響（多一項以後，原本的選項還是原本的結果）*/
    { const G=fresh(); H.picks=['肉桂捲']; H.said=[]; const r=await OFFB.order(GM); const a=r==='肉桂捲'&&paid===-110&&!G.carry.length;
      fresh(); H.picks=['不用了']; const r2=await OFFB.order(GM), b=r2===null&&paid===0;
      fresh(); H.picks=[MOKS.L.none]; H.said=[]; const r3=await MOKS.order(GM), c=r3==='water'&&paid===0&&said().includes(MOKS.L.water);
      fresh('2026-10-07',19); H.picks=['黑糖鮮奶']; const r4=await NM3.serve(GM,'t2_s01',NIGHT_MARKET.stalls.s01,NM3.OWNER,()=>[],[]), d=r4==='nm01_milk'&&paid===-55&&!H.G.carry.length;
      fresh(); H.picks=['算了']; const r5=await NM3.serve(GM,'t3_s01',NIGHT_MARKET.stalls.s01,NM3.OWNER,()=>[],[]), e=r5==='no'&&paid===0;
      fresh(); H.picks=['紅茶（中）']; const r6=await WZS.order364(GM,'tea'), f=r6===true&&paid===-30&&!H.G.carry.length;
      fresh(); H.picks=['罐裝咖啡']; H.said=[]; await GY3.vending(GM); const g=paid===-30&&!H.G.carry.length&&said().includes(GY3.VEND[3][2]);
      check('G. 照常點餐不受影響：日常失速點肉桂捲／不用了、木曜日「只要一杯水」、夜市買黑糖鮮奶／算了、帝大紅茶點紅茶、販賣機買罐裝咖啡',a&&b&&c&&d&&e&&f&&g,J([a,b,c,d,e,f,g,r,r2,r3,r4,r5,r6])); }
    /* 手上已經三樣：選項灰掉、選了不買 */
    { const G=fresh(); G.carry=[1,2,3].map(i=>({n:'豆漿',cat:'drink',day:G.day,shop:'便利商店'})); const o=GIFT.shopOpt(G,'帝大紅茶'); H.picks=[GOPT]; toasts.length=0; await WZS.order364(GM,'tea');
      check('G. 手上已經 3 樣：選項灰掉（原本的提示）、選了不扣錢、原本那一句提示',!!o&&o.dim===true&&o.hint==='手上已經拿了 3 樣'&&paid===0&&G.carry.length===3&&toasts.includes('手上已經拿了 3 樣了'),J([o,paid,toasts])); }
    /* 原始碼：每一支都用同一個寫法（GIFT.shopOpt → 選了走 GIFT.buy），沒有另外寫字 */
    { const F={'src/ggshops_sys3d.js':/GIFT\.shopOpt\(G,key\)[\s\S]{0,400}GIFT\.buy\(GM,key\)/,'src/dakou_sys3d.js':/GIFT\.shopOpt\(G,S\.EAT_KEY\)[\s\S]{0,400}GIFT\.buy\(GM,S\.EAT_KEY\)/,'src/offbeat_sys3d.js':/GIFT\.shopOpt\(G,'日常失速'\)[\s\S]{0,400}GIFT\.buy\(GM,'日常失速'\)/,
        'src/mokuyobi_sys3d.js':/GIFT\.shopOpt\(G,'木曜日'\)[\s\S]{0,400}GIFT\.buy\(GM,'木曜日'\)/,'src/gg2shops3d.js':/GIFT\.shopOpt\(G,S\.EAT_KEY\[k\]\)[\s\S]{0,400}GIFT\.buy\(GM,S\.EAT_KEY\[k\]\)[\s\S]*GIFT\.shopOpt\(G,S\.EAT_KEY\.yangyang\)[\s\S]{0,400}GIFT\.buy\(GM,S\.EAT_KEY\.yangyang\)/,
        'src/gg3shops3d.js':/GIFT\.shopOpt\(G,S\.EAT_KEY\)[\s\S]{0,400}GIFT\.buy\(GM,S\.EAT_KEY\)/,'src/night_market3d.js':/GIFT\.shopOpt\(G,st\.name\)[\s\S]{0,400}GIFT\.buy\(GM,st\.name\)/,'src/gym3d.js':/GIFT\.shopOpt\(G,'體育館販賣機'\)[\s\S]{0,400}GIFT\.buy\(GM,'體育館販賣機'\)/,
        'src/wzshops3d.js':/GIFT\.shopOpt\(G,gN\)[\s\S]{0,500}GIFT\.buy\(GM,gN\)[\s\S]*GIFT\.shopOpt\(G,A\.name\)[\s\S]{0,500}GIFT\.buy\(GM,A\.name\)[\s\S]*GIFT\.shopOpt\(G,key\)[\s\S]{0,500}GIFT\.buy\(GM,key\)/,'src/lane118.js':/GIFT\.shopOpt\(G,s\.name\)[\s\S]{0,1500}GIFT\.buy\(GM,s\.name\)/,'src/story3d.js':/GIFT\.shopOpt\(G,shop,items\)[\s\S]{0,2500}GIFT\.buy\(GM,shop,items\)/};
      const bad=Object.keys(F).filter(f=>!F[f].test(rd(f)));
      const g=rd('src/gift3d.js'), strs=new Set(); for(const m of g.matchAll(/GM\.(?:say|toast)[^;]*?'([^']+)'/g)) strs.add(m[1]);
      check('G. 十一個檔的點餐流程都接 GIFT.shopOpt／GIFT.buy（'+res.length+' 支流程跑過）',!bad.length,J(bad));
      check('G. 沒有新的字：gift3d.js 選項、提示、旁白照舊（「買一份帶走送人…」「飲料、早餐，帶在身上，見面的時候送人」「算了」「錢不夠」「你買了…，帶在身上。」）',GIFT.SHOP_OPT==='買一份帶走送人…'&&/hint:full\?'手上已經拿了 '\+S\.MAX\+' 樣':'飲料、早餐，帶在身上，見面的時候送人'/.test(g)&&/opts\.push\(\{t:'算了'\}\)/.test(g)&&/GM\.toast\('錢不夠'\)/.test(g)&&/await GM\.say\(null,'你買了'\+name\+'，帶在身上。'\)/.test(g)); } }
  /* ---------- H ---------- */
  { const G=fresh(); H.rel('heroine_04',45,30,0); G.carry=[{n:'冬瓜茶',cat:'drink',day:G.day}]; delete G.flags.GIFT; let err=null, k=null; try{ k=await GIFT.give(GM,{name:'子晴',charId:'heroine_04'},'heroine_04',G.carry[0]); }catch(e){ err=e; }
    const G2=fresh(); delete G2.carry; let e2=null; try{ GIFT.shopOpt(G2,'帝大紅茶'); GIFT.talkOpts(G2,'heroine_01'); }catch(e){ e2=e; }
    const G3=fresh(); G3.carry=[{n:'冬瓜茶',cat:'drink',day:G3.day-1,shop:'喝不喝咖啡'}]; const gone=GIFT.carry(G3).length===0;
    check('H. 存檔：帶著的東西沒有店名、沒有 G.flags.GIFT、沒有 G.carry 都不丟例外；隔天就沒了照舊；欄位照舊 n／cat／day／shop',!err&&k==='yes'&&!e2&&gone,J([String(err),k,String(e2),gone])); }
  H.done(); })().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); console.log('FAILED 1'); process.exit(1); });
