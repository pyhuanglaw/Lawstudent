/* ===== 送早餐、飲料（GIFT-FLIRT-1107 的一半；USER_WANTS X262）=====
   使用者 11-07 試玩：「買飲料 早餐 給別人」「也沒辦法送早餐飲料?」
   台詞：AA_710 第二版（七位女主角）、AA_728（朋友六位）——src/data/gift_lines.js，tools/story/import_gifts.py 產生。這裡只有程式和系統字（品項、價錢、「帶一份送人」）。
   - 買：便利商店、2:30 AM 的點餐選單多一項「買一份帶走送人…」→ 品項（有的再選一次：熱可可要不要加濃縮、美式冰的熱的、綠茶冰塊、青茶甜度）→ 扣錢、帶在身上。
     帶在身上的最多 3 樣；當天沒送出去，隔天就沒了（早餐、飲料放不到隔天；不提示）。
     早餐＝飯糰、三明治；豆漿、米漿算飲料（AA_728 _meta.notes 6528d7681，AA-B 11-08 08:49 更正：照 AA_710 原本的分法）。不加早餐店（AA-B 08:24）。
     sec：稿寫在另一種那一格的那一樣，對她算那一種（匯入工具記的；豆漿、米漿改回飲料以後沒有了，留著給以後的稿）。
   - 送：當面說話（STORY.TALK_OPTS）多「送她○○」／「送他○○」（照 CHARACTERS 的 gender）；同一種（飲料／早餐）一天送一次，第二次不收（no，東西留著）。
     七位女主角（AA_710）的反應照 _meta.notes 的優先順序：
       ① fav：第一次送到她最喜歡的那一樣（AA_410）＝fav 那幾句、記 REMEMBERED_HER；之後再送對照下面。
       ② opinion：她有意見的那一樣（例：芷若收到便利商店的拿鐵、可昕收到有加糖的青茶＝青茶不是無糖的每一種，AA_728 kexinSugar → ns）。
       ③ ctx 情境，照這個順序：again 連續兩天送她同一樣／exam 考試週（日曆的期末週，D118 起沒有期中考）／night 晚上（17 點以後）送早餐／
          winterCold 冬天（12～2 月）送冰的／summerHot 夏天（6～8 月）送熱的（冷熱看 S.ITEMS 的 temp；豆漿、米漿沒寫＝不算）。
       ④ yes：交往中有 dating 那一格就用它；不然關係階段（DATE.stageNum）≥ need 的最高那一格。
     每一格有兩三組（pool），輪流、同一組不連續出現；no 也輪流。有幾組只配某一樣（AA_728 _meta.itemOnly → only，「再喝我晚上會睡不著」另有 hour 21 點以後；
     子晴「冰你一下」只配冰的，import_gifts.py BOUND），對不上就跳過那一組、輪到下一組；學姊送到第 3 次起「學弟」換成 {name}（BOUND swap）。
     好感：fav 照 fav 的 rel；其他照④挑到的那一格的 rel（opinion、ctx 稿裡沒有寫 rel，就用她這時候那一格的）；她的戀愛（npcRom）只在朋友（第 3 階）以上才算（AA_710 notes）。
     朋友六位（AA_728：阿哲、阿凱、Alison、柏翰、明軒、芯慈；芯慈可以攻略也照朋友版）：yes 輪流（同一組不連續）；沒有早餐那一格的照飲料那一格；
       no＝一天第二次送同一種（輪流）；好感 GIFT_LINES.friends.rel（fam+1、comf+1）一個人一天最多算一次，no 不加不扣；沒有她的戀愛。
     送東西是小事，不算行動次數。
   存檔：G.carry＝[{n:品項, cat:'drink'|'breakfast', day, shop}]；G.flags.GIFT＝{day:{'人物|種類':第幾天}, fav:{人物:第幾天}, n:{人物:次數},
     last:{'人物|種類':{d:第幾天, n:品項}}（連續送）, pool:{'人物|…':上一次用第幾組}（輪流）, rel:{朋友:第幾天}（朋友一天一次的好感）}。舊存檔沒有的欄位＝空的。
   測試：node tests/gift_unit.js、node tests/gift_friends_unit.js */
'use strict';
const GIFT=(function(){
  const S={};
  const L=()=>(typeof GIFT_LINES!=='undefined'&&GIFT_LINES.people)||{};
  const LF=()=>(typeof GIFT_LINES!=='undefined'&&GIFT_LINES.friends)||{};
  const LFP=()=>LF().people||{};
  /* 品項：名字、種類、價錢（便利商店；2:30 AM 另一個價錢）、冷熱（temp；沒寫＝不算冷也不算熱）、可以再選的（opt：[選項字, 加在名字後面的, 加價, 冷熱]）、
     alt（稿可以寫在另一種那一格）。tools/story/import_gifts.py 會讀這一段核對稿裡的品項名（改這裡要重新匯入）*/
  S.ITEMS=[
    {n:'豆漿',cat:'drink',p:25},{n:'米漿',cat:'drink',p:25},{n:'飯糰',cat:'breakfast',p:35},{n:'三明治',cat:'breakfast',p:39},
    {n:'無糖綠茶',cat:'drink',p:25,temp:'cold',opt:[['正常冰',''],['去冰','（去冰）']]},{n:'青茶',cat:'drink',p:25,temp:'cold',opt:[['微糖',''],['無糖','（無糖）']]},{n:'鮮奶茶',cat:'drink',p:45,temp:'cold'},   /* 原本叫「紅茶拿鐵」（AA_772 第 95 列，L118-SHOPS-REDO-1111：新的飲料店沒有紅茶拿鐵，鮮奶茶就是紅茶加鮮奶；價錢、冷熱不變）*/
    
    {n:'美式咖啡',cat:'drink',p:45,cafe:100,temp:'hot',opt:[['熱的',''],['冰的','（冰的）',0,'cold']]},{n:'拿鐵',cat:'drink',p:55,cafe:120,temp:'hot'},{n:'熱可可',cat:'drink',p:50,cafe:110,temp:'hot',opt:[['就這樣',''],['加一份濃縮','（加一份濃縮）',20]]}];
  /* 完整品項名（名字＋再選一次加的字）→ 冷熱、種類 */
  S.TEMP={}; S.CAT={}; for(const it of S.ITEMS) for(const o of it.opt||[['','']]){ S.TEMP[it.n+o[1]]=o[3]||it.temp||null; S.CAT[it.n+o[1]]=it.cat; }
  /* ===== 每一間有賣飲料的店都可以「買一份帶走送人…」（GIFT-ALL-DRINK-SHOPS-1112；使用者 2026-11-12：「你現在應該要認真審查游戲裡面有哪些有賣飲料的店都可以送不是嗎
     不是我跟你說哎這家為什麼不行你才加這一家」；盤點表 docs/handoff/GIFT_DRINK_SHOPS_AUDIT_1112.md）=====
     做法：那間店自己的菜單裡是飲料的品項，照那間店的價錢賣；品名照菜單一字不改。收到的反應用她那一格飲料的一般句子（gift_lines.js 的 yes／no／ctx 不綁品項；
     fav／opinion／only 綁的是別的品項名＝對不上、不會出現）。和 S.ITEMS 同名的（拿鐵、美式咖啡、鮮奶茶…）照 S.ITEMS 的種類、冷熱、再選一次，價錢照那間店。
     便利商店、2:30 AM 照舊（legacy：只賣 S.ITEMS、原本的價錢）。新的台詞一句都沒有；選項、提示、「你買了…」都是原本的字。
     哪些算飲料：那間店的資料自己有分的照它的（118 巷 shops 的 drink、洋洋的 drinks、泰米的 TAIMI_CAT）；沒有分的照品名對下面這兩張表（只有這一處，要改改這裡）*/
  S.DRINK_WORDS=['茶','咖啡','拿鐵','美式','濃縮','卡布奇諾','摩卡','手沖','可可','鮮奶','牛奶','豆漿','米漿','果汁','甘蔗汁','多多','可樂','汽水','氣泡','運動飲料','可爾必思','冰沙','奶昔'];
  /* 品名裡有上面的字、但不是拿在手上喝的一杯：吃的、湯、冰品、甜點、內用的一壺茶、禮盒、酒 */
  S.NOT_DRINK_WORDS=['茶葉蛋','茶葉','茶點','茶碗蒸','蛋糕','糕','餅','塔','派','布丁','吐司','三明治','套餐','飯','麵','湯','鍋','愛玉','仙草','（一壺）','禮盒','酒'];
  S.isDrinkName=n=>{ n=String(n||''); return !/冰$/.test(n)&&!S.NOT_DRINK_WORDS.some(w=>n.includes(w))&&S.DRINK_WORDS.some(w=>n.includes(w)); };   /* 「冰」結尾＝剉冰、芒果冰（冰品）*/
  const g_=k=>{ try{ return (0,eval)('typeof '+k+"!=='undefined'?"+k+':null'); }catch(e){ return null; } };   /* 別的檔的全域（const 宣告的不在 globalThis 上）；沒載入＝null */
  const nmStall=id=>()=>{ const D=g_('NIGHT_MARKET'), st=D&&D.stalls&&D.stalls[id]; return st?st.items:[]; };
  /* 有賣飲料、可以買來送人的店。key＝那一支點餐的程式傳進來的字（店名或它自己的 key）；name＝記在 G.carry 的店名（沒寫＝key）；
     rows(G)＝那間店現在的菜單（陣列 [品名, 價錢…] 或物件 {n|name|t, p|price}）；drink(列)＝那間店自己的資料怎麼分（沒寫＝照品名）；temp(列)＝資料有寫冷熱的；
     opt:false＝同名品項不出「再選一次」（販賣機沒有去冰）；alias＝就是另一間（日和便利店的咖啡機＝便利商店）；legacy＝照舊只賣 S.ITEMS */
  const isCafe=shop=>shop==='兩點半 Café';   /* 2:30 AM 的店名 key（照 story3d.js counter）*/
  S.isLegacy=shop=>shop==='便利商店'||isCafe(shop);   /* 便利商店、2:30 AM：照舊（下面的表不列）*/
  S.SHOPS={
    'cvs.coffee':{alias:'便利商店'},   /* 日和便利店的咖啡機（ggshops_sys3d.js）：同一間便利商店，出原本那一份 */
    'bookstore.cafe_order':{name:'頁間書屋',rows:()=>{ const s=g_('GGS'); return s?s.MENU['bookstore.cafe_order'].items:[]; }},
    '大口漢堡':{rows:G=>{ const s=g_('DKS'); return s?s.menu(G):[]; }},
    '溫州街・半熟':{name:'SUNNY SIDE',rows:()=>{ const s=g_('WZS'); return s?s.BRUNCH:[]; }},
    '帝大紅茶':{rows:G=>{ const s=g_('WZS'); return s?s.menu364('tea',G):[]; }},
    '阿忠鮮果':{rows:G=>{ const s=g_('WZS'); return s?s.fruitMenu(G):[]; }},
    '日常失速':{rows:()=>{ const s=g_('OFFB'); return s?s.L.menu:[]; }},
    '木曜日':{rows:()=>{ const s=g_('MOKS'); return s?s.L.menu:[]; }},
    'afar café':{rows:()=>{ const s=g_('GG2'); return s?s.L.afar.menu:[]; }},
    'Daybreak':{rows:()=>{ const s=g_('GG2'); return s?s.L.daybreak.menu:[]; }},
    '洋洋鹹酥雞':{rows:()=>{ const s=g_('GG2'); return s?[].concat(...s.L.yangyang.menu.map(c=>c[1])):[]; },drink:r=>g_('GG2').L.yangyang.drinks.includes(r[0])},
    '泰米村食':{rows:G=>{ const s=g_('GG3'), D=g_('GG3_LINES'); return s&&D&&D.tz_taimi?D.tz_taimi.menu.map(it=>({n:it.n,p:s.taimiPrice(it,G),desc:it.desc})):[]; },drink:r=>g_('GG3').TAIMI_CAT(r.n)==='drink',temp:r=>/冰的/.test(r.desc||'')?'cold':(/熱的/.test(r.desc||'')?'hot':null)},
    '越好吃小館':{rows:()=>{ const D=g_('GG3_LINES'); return D&&D.tz_yuehaochi&&D.tz_yuehaochi.meal?D.tz_yuehaochi.meal.menu:[]; }}, '客居雲南':{rows:()=>{ const D=g_('GG3_LINES'); return D&&D.tz_keju&&D.tz_keju.meal?D.tz_keju.meal.menu:[]; }},
    '東南大聯商行':{rows:()=>{ const D=g_('GG3_LINES'); return D&&D.tz_dongnan&&D.tz_dongnan.grocery?D.tz_dongnan.grocery.goods.filter(g=>!g.noBuy):[]; }},   /* 汀州路三間（SHOP-STANDARD-BACKFILL-1112）*/
    '沈三盃黑糖鮮奶':{rows:nmStall('s01')}, '節節高甘蔗汁':{rows:nmStall('s09')},   /* 夜市（night_market3d.js NM3.serve；季節攤販同一支，沒有賣飲料的）*/
    '體育館販賣機':{rows:()=>{ const s=g_('GY3'); return (s&&s.VEND)||[]; },opt:false} };
  /* 118 巷：資料寫 drink 的店（喝不喝咖啡、果茶社…；以後新增的也算），整份菜單都是飲料 */
  const l118=shop=>{ const D=g_('LANE118_SHOPS'); return (D&&D.shops.find(x=>x.drink&&x.name===shop))||null; };
  /* rows＝那一支點餐的程式自己把菜單傳過來（story3d.js 的 counter：青木茶室的外帶窗口，店名 key 照 counter；表上沒有的店才用）*/
  S.shopDef=function(shop,rows){ let d=Object.prototype.hasOwnProperty.call(S.SHOPS,shop)?S.SHOPS[shop]:null, name=shop; if(d&&d.alias){ name=d.alias; d=null; } if(!d&&S.isLegacy(name)) d={legacy:true};
    if(!d){ const q=l118(shop); if(q) d={rows:()=>q.menu,drink:()=>true}; }
    if(!d&&Array.isArray(rows)&&rows.length) d={rows:()=>rows.filter(r=>!(Array.isArray(r)&&typeof r[3]==='function'))};   /* counter 的菜單：貓罐頭、開學用品（第四格是函式）不算 */
    return d?Object.assign({},d,{name:d.name||name}):null; };
  const rowN=r=>Array.isArray(r)?r[0]:(r&&(r.n||r.name||r.t)), rowP=r=>Array.isArray(r)?r[1]:(r&&(r.p!=null?r.p:r.price));
  /* 這間店現在可以買來送人的：[{n, cat, p, temp, opt}]（legacy＝S.ITEMS 照舊；其他＝菜單上是飲料的，照菜單的順序）*/
  S.menu=function(G,shop,rows){ const d=S.shopDef(shop,rows); if(!d) return [];
    if(d.legacy) return S.ITEMS.filter(it=>!isCafe(d.name)||it.cafe!=null).map(it=>Object.assign({},it,{p:isCafe(d.name)&&it.cafe!=null?it.cafe:it.p}));   /* 便利商店全部；2:30 AM 只有咖啡、熱可可。蛋餅、蘿蔔糕：沒有早餐店（AA-B 11-08：不加）*/
    let R=[]; try{ R=d.rows(G||{})||[]; }catch(e){ R=[]; } const out=[];
    for(const r of R){ const n=rowN(r), p=rowP(r); if(!n||!(p>0)||out.some(x=>x.n===n)) continue; let ok=false; try{ ok=d.drink?!!d.drink(r):S.isDrinkName(n); }catch(e){ ok=false; } if(!ok) continue;
      const it=S.ITEMS.find(x=>x.n===n&&x.cat==='drink'); let t=null; try{ t=d.temp?d.temp(r):null; }catch(e){}
      out.push(it?{n,cat:it.cat,p,temp:it.temp||null,opt:d.opt===false?null:it.opt}:{n,cat:'drink',p,temp:t||S.nameTemp(n)}); }
    return out; };
  /* 冷熱：S.ITEMS 有的照它（含再選一次的）；沒有的＝那間店的資料有寫的 → 品名本身有「冰」「熱」字的 → 不算冷也不算熱（不從品名猜）*/
  S.nameTemp=n=>/冰/.test(n)?'cold':(/熱/.test(n)?'hot':null);
  S.tempOf=function(c){ if(!c||!c.n) return null; if(Object.prototype.hasOwnProperty.call(S.TEMP,c.n)) return S.TEMP[c.n];
    for(const k in S.SHOPS){ const d=S.SHOPS[k]; if(d.temp&&(d.name||k)===c.shop){ try{ const r=(d.rows({})||[]).find(x=>rowN(x)===c.n); if(r){ const t=d.temp(r); if(t) return t; } }catch(e){} } }
    return S.nameTemp(c.n); };
  /* 118 巷那一間菜單上這一樣的價錢（GIFT-L118-DRINK-1112 的寫法，留著給舊的測試、別的檔用）*/
  S.l118Price=(shop,it)=>{ const q=l118(shop), m=q&&q.menu.find(r=>r[0]===it.n); return m?m[1]:null; };
  S.sells=(shop,it)=>S.menu(null,shop).some(x=>x.n===it.n);
  S.MAX=3;
  S.SHOP_OPT='買一份帶走送人…';
  const F=G=>{ const f=G.flags||(G.flags={}); const g=f.GIFT&&typeof f.GIFT==='object'?f.GIFT:(f.GIFT={}); for(const k of ['day','fav','n','last','pool','rel']) if(!g[k]||typeof g[k]!=='object') g[k]={}; return g; };
  S.carry=G=>{ if(!Array.isArray(G.carry)) G.carry=[]; G.carry=G.carry.filter(x=>x&&x.n&&x.day===G.day); return G.carry; };   /* 隔天就沒了 */
  S.price=(it,shop)=>{ const m=S.menu(null,shop).find(x=>x.n===it.n); return m?m.p:(isCafe(shop)&&it.cafe!=null?it.cafe:it.p); };
  S.shopOpt=function(G,shop,rows){ if(!S.menu(G,shop,rows).length||!Object.keys(L()).length) return null; const full=S.carry(G).length>=S.MAX; return {t:S.SHOP_OPT,hint:full?'手上已經拿了 '+S.MAX+' 樣':'飲料、早餐，帶在身上，見面的時候送人',dim:full}; };
  /* 買：品項 → 再選一次（有的話）→ 扣錢、帶著（記在哪一家買的：芷若對便利商店的拿鐵有意見）*/
  S.buy=async function(GM,shop,rows){ const G=GM.G, d=S.shopDef(shop,rows), L2=S.menu(G,shop,rows); if(!L2.length) return null; if(S.carry(G).length>=S.MAX){ GM.toast&&GM.toast('手上已經拿了 '+S.MAX+' 樣了'); return null; }
    const opts=L2.map(it=>({t:it.n+'　'+it.p+' 元',dim:G.money<it.p})); opts.push({t:'算了'});
    const i=await GM.choose(opts); const it=L2[i]; if(!it) return null; let name=it.n, p=it.p;
    if(it.opt){ const k=await GM.choose(it.opt.map(o=>({t:o[0]+(o[2]?'（+'+o[2]+' 元）':'')}))); const o=it.opt[k]||it.opt[0]; name+=o[1]; p+=o[2]|0; }
    if(G.money<p){ GM.toast&&GM.toast('錢不夠'); return null; }
    GM.money(-p); const c={n:name,cat:it.cat,day:G.day,shop:d.name}; S.carry(G).push(c); await GM.say(null,'你買了'+name+'，帶在身上。'); return c; };
  const stage=id=>typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):1;
  const dating=(G,id)=>{ const f=(G&&G.flags)||{}, R=f.romance||{}; return f['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const month=G=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).m:0;
  const examWeek=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?((CALENDAR.termOf(G.day)||{}).exam==='final'):false;
  /* 他／她（照 CHARACTERS 的 gender；女主角都是 f）*/
  S.pron=id=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; return c&&c.gender==='m'?'他':'她'; };
  /* 這一樣對這個人算哪一種：她的 sec（AA_710 寫在另一種那一格的）→ S.ITEMS 的種類 → 買的時候記的 */
  S.kind=(id,c)=>{ const T=L()[id]; return (T&&T.sec&&T.sec[c.n])||S.CAT[c.n]||c.cat; };
  S.text=(G,t)=>String(t).replace(/\{name\}/g,(G&&G.name)||'祐廷');
  /* 一句開頭是（動作）、後面接著講話的，拆成旁白＋她說的（字不改）*/
  const play=async(GM,who,lines)=>{ for(const t of lines||[]){ const s=S.text(GM.G,t), m=/^(（[^）]*）)(.+)$/.exec(s); if(m){ await GM.say(null,m[1]); await GM.say(who,m[2]); } else if(/^（/.test(s)) await GM.say(null,s); else await GM.say(who,s); } };
  const adj=(id,r)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.adjust||!r) return; const d=Object.assign({},r); if(!(typeof SOCIAL!=='undefined'&&SOCIAL.romOk&&SOCIAL.romOk(id))) delete d.npcRom; SOCIAL.adjust(id,d); };
  const match=(e,c)=>!!e&&(Array.isArray(e.ns)?e.ns.includes(c.n):e.n===c.n)&&(!e.shop||c.shop===e.shop);   /* ns：可昕「青茶（有加糖）」＝青茶不是無糖的每一種（AA_728 kexinSugar）*/
  /* 這一組現在可以用嗎（only 只在送這幾樣、hour [幾點, 幾點)）*/
  const okG=(g,x)=>!!g&&(!g.only||g.only.includes(x.n))&&(!g.hour||(x.h>=g.hour[0]&&x.h<g.hour[1]));
  /* BOUND swap：學姊送到第 3 次起「學弟」換成 {name}（AA_710 notes）*/
  const ln=(g,x)=>g.swap&&x.cnt>=g.swap[2]?g.lines.map(t=>t.split(g.swap[0]).join(g.swap[1])):g.lines;
  /* 輪流：從上一次用的下一組開始，挑第一組可以用的（只剩上一次那組可以用才重複）；都不行＝null */
  const rot=(R,k,gs,x)=>{ if(!Array.isArray(gs)||!gs.length) return null; const last=R.pool[k], s=last==null?0:((last|0)+1)%gs.length;
    for(let j=0;j<gs.length;j++){ const i=(s+j)%gs.length; if(okG(gs[i],x)) return {k,i,g:gs[i]}; } return null; };
  /* ④ yes 的格子，照先後：交往中那一格 → 階段夠的、need 由高到低 */
  const cells=(G,id,E)=>{ const st=stage(id), out=[]; if(dating(G,id)) for(const y of E.yes) if(y.dating) out.push(y); for(const y of E.yes.filter(q=>!q.dating&&st>=q.need).sort((a,b)=>b.need-a.need)) out.push(y); if(!out.length) out.push(E.yes.find(q=>!q.dating)||E.yes[0]); return out; };
  S.CTX=['again','exam','night','winterCold','summerHot'];
  const ctxOn=(G,R,key,c,cat,k)=>{ if(k==='again'){ const l=R.last[key]; return !!l&&l.d===G.day-1&&l.n===c.n; }
    if(k==='exam') return examWeek(G);
    if(k==='night') return cat==='breakfast'&&(+G.hour||0)>=17;
    const m=month(G), t=S.tempOf(c); if(k==='winterCold') return (m===12||m<=2)&&m>0&&t==='cold'; if(k==='summerHot') return m>=6&&m<=8&&t==='hot'; return false; };
  /* 朋友（AA_728）：{kind:'no'|'yes', lines, rel（今天還沒算過才有）, k, i, cat, friend:true} */
  /* 送東西只給可攻略的對象（使用者 11-08 15:2x「送飲料只需要給可攻略的對象」「飲料改完再發布」；X266、GIFT-ROMANCE-ONLY-1108）：
     七位女主角（AA_710，GIFT_LINES.people）照舊；朋友六位（AA_728）只留可以攻略的——芯慈（AA_728「芯慈可以攻略也照朋友版」；AA-B 15:33「芯慈留」）；阿哲、阿凱、Alison、柏翰、明軒不會出現「送他／她○○」（AA_728 稿那五位標 unused）。
     稿和匯入照舊（gift_lines.js 的 friends 還在，只是不送）；要再打開某一位，加進這裡就好 */
  /* 芯慈：她的線打開（xcrom3d.js XCROM.ON）才算可以攻略、才能送；線關著＝跟朋友一樣不能送（AA-B 11-08 15:33「芯慈留…條件寫成 XCROM.ON 才能送」）。值是 true 或函式 */
  S.FRIEND_OK={classmate_xinci:()=>typeof XCROM!=='undefined'&&!!XCROM.ON};
  const friendOK=id=>{ const v=S.FRIEND_OK&&S.FRIEND_OK[id]; return typeof v==='function'?!!v():!!v; };
  const pickFriend=function(G,id,c){ const T=friendOK(id)?LFP()[id]:null; if(!T) return null; const R=F(G), cat=S.CAT[c.n]||c.cat, sec=T[cat]?cat:'drink', key=id+'|'+cat, x={n:c.n,cnt:R.n[id]|0,h:+G.hour||0};
    if(!T[sec]) return null;
    if(R.day[key]===G.day){ const r=rot(R,id+'|no',T.no,x)||{k:id+'|no',i:0,g:T.no[0]}; return {kind:'no',lines:r.g.lines,k:r.k,i:r.i,cat,friend:true}; }   /* 一天第二次同一種：不收，東西留著 */
    const r=rot(R,id+'|'+sec+'|yes',T[sec].pool,x)||{k:id+'|'+sec+'|yes',i:0,g:T[sec].pool[0]};   /* 沒有早餐那一格的照飲料那一格（AA_728 notes），輪流也照那一格 */
    return {kind:'yes',lines:r.g.lines,rel:R.rel[id]===G.day?null:(LF().rel||null),k:r.k,i:r.i,cat,sec,friend:true}; };
  /* 挑反應（存檔只補沒有的預設欄位，不記輪流）：{kind:'no'|'fav'|'opinion'|ctx 名|'yes', lines, rel, k（輪流的 key）, i（第幾組）, cat（這一樣算哪一種）} */
  S.pick=function(G,id,c){ const T=L()[id]; if(!T) return pickFriend(G,id,c); const cat=S.kind(id,c), E=T[cat]; if(!E) return null; const R=F(G), key=id+'|'+cat, x={n:c.n,cnt:R.n[id]|0,h:+G.hour||0};
    if(R.day[key]===G.day){ const r=rot(R,key+'|no',E.no,x)||{k:key+'|no',i:0,g:E.no[0]}; return {kind:'no',lines:ln(r.g,x),k:r.k,i:r.i,cat}; }   /* 一天第二次：不收，東西留著 */
    const C=cells(G,id,E); let base=null, yr=null; for(const y of C){ const r=rot(R,key+'|yes'+E.yes.indexOf(y),y.pool,x); if(r){ base=y; yr=r; break; } }
    if(!yr){ const y=C[C.length-1]; base=y; yr={k:key+'|yes'+E.yes.indexOf(y),i:0,g:y.pool[0]}; }   /* 每一組都對不上（現在的稿不會：need 1 那幾格都沒有 only／hour）*/
    if(E.fav&&match(E.fav,c)&&R.fav[id]==null) return {kind:'fav',lines:E.fav.lines,rel:E.fav.rel,fav:true,cat};
    for(const [j,o] of (E.opinion||[]).entries()) if(match(o,c)){ const r=rot(R,key+'|op'+j,o.pool,x); if(r) return {kind:'opinion',lines:ln(r.g,x),rel:o.rel&&Object.keys(o.rel).length?o.rel:base.rel,k:r.k,i:r.i,cat}; }
    for(const k of S.CTX) if(E.ctx&&E.ctx[k]&&ctxOn(G,R,key,c,cat,k)){ const r=rot(R,key+'|ctx.'+k,E.ctx[k],x); if(r) return {kind:k,lines:ln(r.g,x),rel:base.rel,k:r.k,i:r.i,cat}; }
    return {kind:'yes',lines:ln(yr.g,x),rel:base.rel,k:yr.k,i:yr.i,dating:!!base.dating,need:base.need,cat}; };
  /* 送：回傳 kind（'fav'／'opinion'／'again'…／'yes'／'no'）*/
  S.give=async function(GM,who,id,c){ const G=GM.G, P=S.pick(G,id,c); if(!P) return null; const R=F(G), key=id+'|'+P.cat; S.lastPick=P;
    if(P.kind==='no'){ R.pool[P.k]=P.i; await play(GM,who,P.lines); return 'no'; }
    const C=S.carry(G), k=C.indexOf(c); if(k>=0) C.splice(k,1); R.day[key]=G.day; R.n[id]=(R.n[id]|0)+1; R.last[key]={d:G.day,n:c.n}; if(P.k) R.pool[P.k]=P.i;
    await GM.say(null,'你把'+c.n+'遞給'+(who&&who.name||S.pron(id))+'。');
    await play(GM,who,P.lines);
    if(P.friend){ if(P.rel){ R.rel[id]=G.day; if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(id,Object.assign({},P.rel)); } return P.kind; }   /* 朋友：一天最多算一次、沒有她的戀愛 */
    adj(id,P.rel);
    if(P.fav){ R.fav[id]=G.day; if(typeof SOCIAL!=='undefined'&&SOCIAL.remember&&!(SOCIAL.has&&SOCIAL.has(id,'REMEMBERED_HER'))) SOCIAL.remember(id,'REMEMBERED_HER',c.n); }
    return P.kind; };
  /* 當面說話的選項（STORY.TALK_OPTS）：帶著的每一樣一個「送她○○」／「送他○○」*/
  S.talkOpts=function(G,id){ if(!G) return []; const T=L()[id], TF=friendOK(id)?LFP()[id]:null; if(!T&&!TF) return []; const p=S.pron(id);
    return S.carry(G).filter(c=>T?!!T[S.kind(id,c)]:!!TF.drink).map(c=>({t:'送'+p+c.n,run:async(GM,who)=>{ await S.give(GM,who,id,c); }})); };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.TALK_OPTS)) STORY.TALK_OPTS.push((G,id)=>S.talkOpts(G,id));
  return S;
})();
