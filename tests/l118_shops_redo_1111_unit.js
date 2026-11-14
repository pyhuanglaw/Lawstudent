// L118-SHOPS-REDO-1111（USER_WANTS X338；使用者 2026-11-11 規格 docs/handoff/user_specs/L118_SHOPS_REDO_1111.md）：118 巷九間店換店名、類型、菜單、價錢＋兩間外帶飲料店。
// 第 1 部分（資料）：src/data/lane118_shops.js（白名單上的 AA_280）和使用者原文逐項一樣——九間的店名、類型、每個品名和價錢；兩間飲料店的店名、品項、價格區間；
//   舊店名、舊菜名不在資料裡；src/data/lane118_layout.js 九間的 name／type／menu 和資料一樣、位置數字和改版前一樣、還是純 JSON（Blender 端的讀法）。
// 第 2 部分（程式，src/lane118.js）：飲料店照資料算飲料 5 分鐘、其他一餐 40 分鐘；錢不夠不扣錢；大學食堂秤重 100～160；舊存檔 G.l118.last 不在新菜單的清掉（冪等）；
//   沒有配置位置的店安靜跳過。改版前會失敗。
// 用法：node tests/l118_shops_redo_1111_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x);
const load=(f,names)=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>names.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const NAMES=/^(L118|LANE118_SHOPS|LANE118_LAYOUT|L118_SHOP_LAYOUTS)$/;
const NAMES2=/^(L118|LANE118_SHOPS|LANE118_LAYOUT|L118_SHOP_LAYOUTS|L118_REDO)$/;
load('src/data/lane118_layout.js',NAMES); load('src/data/lane118_shops.js',NAMES); load('src/data/l118_redo772.js',NAMES2);
const SPEC=fs.readFileSync(path.join(ROOT,'docs/handoff/user_specs/L118_SHOPS_REDO_1111.md'),'utf8');
const D=LANE118_SHOPS, shop=id=>D.shops.find(s=>s.id===id);

/* 使用者原文（規格第一、二節）：店 id（位置不變）→ 原店名、新店名、類型、品名與價錢。披薩那一間原文是「個人尺寸瑪格麗特 $180、夏威夷 $200……」，「個人尺寸」是四樣共同的說明（AA 放在類型欄）*/
const WANT={
  dian:['滇香小館','118牛排','夜市鐵板牛排',[['鐵板牛排',190],['雪花牛排',230],['雞排',180],['豬排',170],['雙拼',280]]],
  self:['好家自助餐','水上便當','雞腿、雞排便當',[['炸雞腿飯',145],['雞排飯',135],['滷雞腿飯',130],['排骨飯',125],['雙拼',165]]],
  tea:['一一八茶飲','辛亥韓食','韓式鍋物、鐵板烤肉',[['泡菜鍋',190],['海鮮豆腐鍋',210],['鐵板豬肉',200],['鐵板牛肉',230],['石鍋拌飯',180]]],
  home:['巷口家常菜','五湖四海','水餃店',[['高麗菜水餃10顆',80],['韭菜水餃10顆',85],['酸辣湯',45],['玉米濃湯',45]]],
  cafe2:['慢讀咖啡','大學食堂','秤重自助餐',null],
  pasta:['Pasta 118','義大麵屋','平價義大利麵',[['番茄肉醬麵',170],['奶油雞肉麵',190],['青醬培根麵',190],['蒜香蛤蜊麵',210]]],
  korea:['韓食小廚','清州刀削麵','刀削麵館',[['牛肉刀削麵',190],['番茄刀削麵',150],['木須炒刀削麵',170],['炸醬刀削麵',140]]],
  omu:['蛋包飯研究所','奈良咖哩','日式咖哩飯',[['豬排咖哩',190],['雞肉咖哩',180],['牛肉咖哩',210],['可樂餅咖哩',170]]],
  noodle2:['六張犁麵舖','迪倫窯烤披薩','個人窯烤披薩',[['瑪格麗特',180],['夏威夷',200],['燻雞蘑菇',210],['四種起司',230]]] };
const NINE=Object.keys(WANT);
const OLD_NAMES=NINE.map(k=>WANT[k][0]);
const OLD_ITEMS=['椒麻雞飯','酸辣河粉','打拋豬飯','自助餐（兩菜一雞腿）','加滷蛋','紅茶拿鐵','檸檬綠','無糖綠茶','雞腿便當','番茄炒蛋（單點）','今日蛋糕','白醬雞肉麵','番茄海鮮麵','泡菜豆腐鍋','咖哩蛋包飯','乾麵＋滷蛋'];

// ---------- 第 1 部分：資料 ----------
{ const r=require('child_process').spawnSync('python3',['tools/lane118/import_lane118.py','--check'],{cwd:ROOT,encoding:'utf8'});
  check('1-0. src/data/lane118_shops.js 和白名單上的 AA_280 一致（import_lane118.py --check）',r.status===0,(r.stdout||'')+(r.stderr||'')); }
check('1-1. 十一間店：九間的 id、順序不變，後面是 drink_a、drink_b',J(D.shops.map(s=>s.id))===J(NINE.concat(['drink_a','drink_b'])),J(D.shops.map(s=>s.id)));
for(const id of NINE){ const [oldName,name,type,menu]=WANT[id], s=shop(id)||{menu:[]};
  check('1-2. '+id+'：店名「'+name+'」、類型「'+type+'」（原文對照表那一列：'+oldName+' → '+name+'）',s.name===name&&s.type===type&&SPEC.includes('| '+oldName+' | '+name+' | '+type+' |'),s.name+'／'+s.type);
  if(menu){ check('1-3. '+id+' '+name+'：品名、價錢、順序和原文一樣（'+menu.length+' 樣）',J(s.menu)===J(menu),J(s.menu));
    const miss=menu.filter(([n,p])=>!SPEC.includes(n+' $'+p)); check('1-3. '+id+' '+name+'：每一樣「品名 $價錢」都在使用者原文裡',miss.length===0,J(miss)); } }
{ const s=shop('cafe2'), P=s.menu.map(m=>m[1]);   /* 原文：依重量計價，普通學生一餐約 $100–160（AA 定三個份量）*/
  check('1-4. 大學食堂（秤重）：每一樣的價錢都在原文的 $100–160 以內、沒有零或負的',SPEC.includes('$100–160')&&P.length>=1&&P.every(p=>Number.isInteger(p)&&p>=100&&p<=160),J(s.menu)); }
{ const a=shop('drink_a')||{menu:[]}, b=shop('drink_b')||{menu:[]}, has=(s,L)=>L.filter(n=>!s.menu.some(m=>m[0]===n));
  check('1-5. 飲料店 A＝喝不喝咖啡（使用者 11-11 補充定案）：原文列的紅茶、綠茶、珍珠奶茶、冬瓜茶、鮮奶茶都有、兼賣咖啡，價錢 $30–75',SPEC.includes('喝不喝咖啡')&&a.name==='喝不喝咖啡'&&has(a,['紅茶','綠茶','珍珠奶茶','冬瓜茶','鮮奶茶']).length===0&&a.menu.some(m=>/咖啡/.test(m[0]))&&a.menu.every(m=>m[1]>=30&&m[1]<=75),J(a.menu));
  check('1-5. 飲料店 B＝果茶社：原文列的檸檬綠茶、百香果綠茶、柳橙綠茶、葡萄柚茶都有、有多多系列，價錢 $50–95',SPEC.includes('果茶社')&&b.name==='果茶社'&&has(b,['檸檬綠茶','百香果綠茶','柳橙綠茶','葡萄柚茶']).length===0&&b.menu.some(m=>/多多/.test(m[0]))&&b.menu.every(m=>m[1]>=50&&m[1]<=95),J(b.menu));
  check('1-5. 兩間飲料店資料標 drink、takeout（外帶、沒有內用）；九間餐廳沒有這兩欄',a.drink===true&&a.takeout===true&&b.drink===true&&b.takeout===true&&NINE.every(id=>!('drink' in shop(id))&&!('takeout' in shop(id)))); }
{ const all=J(D), hitN=OLD_NAMES.filter(n=>all.includes(n)), hitI=OLD_ITEMS.filter(n=>D.shops.some(s=>s.menu.some(m=>m[0]===n)));
  check('1-6. 資料裡沒有九個舊店名、舊菜單的品名',hitN.length===0&&hitI.length===0,J(hitN.concat(hitI))); }
{ const ids=new Set(D.shops.map(s=>s.id)), L=D.lunch, mon=id=>{ const s=shop(id); return !s.hours.closed.includes(1)&&s.hours.open.some(([x,y])=>12.25>=x&&12.25<y); };
  check('1-7. 常客每一列的店、阿哲輪流的四間、第一次那一間都是資料裡有的店；每一間店都有招呼、吃完的旁白',D.regulars.every(r=>ids.has(r.shop))&&L.rotation.every(x=>ids.has(x))&&ids.has(L.firstShop)&&D.shops.every(s=>s.greet&&s.greet.text&&s.done),J(L.rotation)+' '+L.firstShop);
  check('1-7. 阿哲週一 12:15 約的店（第一次那一間、輪流的四間）週一中午都有開；每一間都有他那一句',[L.firstShop].concat(L.rotation).every(mon)&&L.rotation.every(x=>typeof L.weekly[x]==='string'&&L.weekly[x]),J(L.weekly));
  check('1-7. 阿哲第一次那四句只有阿哲、Alison 說的（AA_280 第 4 節開頭的「定稿」說明不是台詞）',L.first.length===4&&L.first.every(([w])=>w==='zhe'||w==='yu'),J(L.first.map(x=>x[0])));
  check('1-7. 每一間店午餐時段（12:10～13:00）有開的日子至少五天；飲料店不是午餐店',NINE.every(id=>[0,1,2,3,4,5,6].filter(w=>!shop(id).hours.closed.includes(w)).length>=5&&shop(id).hours.open.some(([x,y])=>x<=12.17&&y>=13))); }
// 配置（Blender 端也讀）：九間的 name／type／menu 跟資料；位置和改版前（2026-11-11 以前）一樣；純 JSON
{ const src=fs.readFileSync(path.join(ROOT,'src/data/lane118_layout.js'),'utf8'), key='const LANE118_LAYOUT=';
  let a=null, b=null; try{ a=JSON.parse(src.slice(src.indexOf('{',src.indexOf(key)),src.lastIndexOf('}')+1)); }catch(e){} try{ b=JSON.parse(src.slice(src.lastIndexOf(key)+key.length).trim().replace(/;$/,'')); }catch(e){}
  check('1-8. lane118_layout.js：「const LANE118_LAYOUT=」後面還是純 JSON（Blender 兩種讀法都讀得出來、和遊戲讀到的一樣）',!!a&&!!b&&J(a)===J(LANE118_LAYOUT)&&J(b)===J(LANE118_LAYOUT));
  const POS={dian:['W',22,28,4],self:['W',14,21,4],tea:['W',10,13,4],home:['W',-6,2,5],cafe2:['W',-16,-9,4],pasta:['E',20,28,4],korea:['E',12,19,4],omu:['E',-2,5,5],noodle2:['E',-14,-7,4]};
  const LS=LANE118_LAYOUT.shops, bad=NINE.filter(id=>{ const q=LS.find(x=>x.id===id); return !q||J([q.side,q.z0,q.z1,q.floors])!==J(POS[id]); });
  check('1-8. 九間店的位置（side、z0、z1、floors）一個數字都沒動、順序不變',bad.length===0&&J(LS.slice(0,9).map(q=>q.id))===J(NINE),J(bad));
  const diff=NINE.filter(id=>{ const q=LS.find(x=>x.id===id), s=shop(id); return !q||q.name!==s.name||q.type!==s.type||J(q.menu)!==J(s.menu); });
  check('1-8. 九間店在配置裡的 name／type／menu 和 lane118_shops.js 一樣',diff.length===0,J(diff));
  check('1-8. 配置裡沒有舊店名',OLD_NAMES.filter(n=>J(LANE118_LAYOUT).includes(n)).length===0);
  check('1-8. 配置的巷子、立面、後門、小巷、機車格沒動',J(LANE118_LAYOUT.lane)===J({x0:-3.4,x1:3.4,z0:-42,z1:34,surface:'asphalt'})&&J(LANE118_LAYOUT.facade)===J({west:-5.2,east:5.2})&&LANE118_LAYOUT.backGate.z===49&&LANE118_LAYOUT.alleys.length===2&&J(LANE118_LAYOUT.scooters.zRanges)===J([[-30,-18],[29,33]])); }

(async()=>{
  // ---------- 第 2 部分：程式（src/lane118.js；只載入店家資料、配置、lane118.js，其他系統都沒有）----------
  load('src/lane118.js',NAMES);
  let G=null, said=[], opts=[], picks=[], toasts=[], spawned=[];
  const GM={get G(){ return G; },npc:{},E:{zone:{seats:[]},npcs:[]},sceneBegin(){},sceneEnd(){},autosave(){},toast(t){ toasts.push(t); },
    money(d){ G.money+=d; },advance(h){ G.hour+=h; },say:async(who,t)=>{ said.push({who:who?who.name:null,t}); },
    choose:async o=>{ opts.push(o); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>q.t.includes(want)); return k<0?o.length-1:k; } return want||0; },
    spawnCharacter(id,x,z,o){ const c={id,x,z,o}; GM.npc[id]=c; spawned.push(c); return c; }};
  const fresh=(wd,hour,money,l118)=>{ G={day:100,weekday:wd,hour,money,stage:'law',flags:{}}; if(l118) G.l118=l118; said=[]; opts=[]; picks=[]; toasts=[]; spawned=[]; GM.npc={}; return G; };
  const texts=()=>said.map(s=>s.t);
  // 2-1 飲料 5 分鐘、其他一餐 40 分鐘：照資料
  { check('2-1. 哪一種店照資料：drink_a、drink_b＝drink（外帶），九間（含原本是手搖飲的 tea、原本是咖啡的 cafe2）＝meal',L118.kindOf('drink_a')==='drink'&&L118.kindOf('drink_b')==='drink'&&NINE.every(id=>L118.kindOf(id)==='meal')&&L118.isTakeout('drink_a')&&L118.isTakeout('drink_b')&&!L118.isTakeout('tea'));
    const dt=async(id,wd,h)=>{ fresh(wd,h,5000); picks=[0]; await L118.order(GM,id); return +(G.hour-h).toFixed(4); };
    const a=await dt('drink_a',3,15), b=await dt('drink_b',3,15), t=await dt('tea',3,12.5), c=await dt('cafe2',3,12.5);
    check('2-1. 喝不喝咖啡、果茶社點一杯＝5 分鐘；辛亥韓食（tea）、大學食堂（cafe2）＝一餐 40 分鐘',a===+(5/60).toFixed(4)&&b===+(5/60).toFixed(4)&&t===+(40/60).toFixed(4)&&c===+(40/60).toFixed(4),J([a,b,t,c]));
    check('2-1. src/lane118.js 沒有再用類型的字判斷飲料店（「手搖飲」）',!/type===['"]手搖飲['"]/.test(fs.readFileSync(path.join(ROOT,'src/lane118.js'),'utf8'))); }
  // 2-2 錢不夠：不扣錢、不變負的、不算來過
  { fresh(3,12.5,100); picks=['鐵板牛排']; const h0=G.hour; await L118.order(GM,'dian');
    check('2-2. 錢 100 點鐵板牛排 190：不扣錢（還是 100）、提示「錢不夠」、時間沒過、不算來過、沒有「你點了」',G.money===100&&toasts.includes('錢不夠')&&G.hour===h0&&!(G.l118&&G.l118.n&&G.l118.n.dian)&&!texts().some(t=>/你點了/.test(t)),J([G.money,toasts,texts()]));
    check('2-2. 錢不夠的那幾樣選單上是灰的（dim）',opts.length===1&&opts[0].slice(0,5).every(o=>o.dim===true));
    let neg=[]; for(const s of D.shops){ for(let k=0;k<s.menu.length;k++){ for(const m of [0,s.menu[k][1]-1,s.menu[k][1]]){ fresh(3,s.drink?15:12.5,m); if(s.hours.closed.includes(3)) G.weekday=5; picks=[k]; await L118.order(GM,s.id); if(G.money<0||(m<s.menu[k][1]&&G.money!==m)||(m===s.menu[k][1]&&G.money!==0)) neg.push([s.id,s.menu[k][0],m,G.money]); } } }
    check('2-2. 十一間店每一樣：錢是 0、差一塊、剛好——都不會變負的（不夠＝一塊都不扣、剛好＝扣到 0）',neg.length===0,J(neg)); }
  // 2-3 大學食堂（秤重）：三個份量 100～160；台詞只有資料裡的句子
  { let bad=[], lines=[]; const s=shop('cafe2'); for(let k=0;k<s.menu.length;k++){ fresh(3,12.5,1000); picks=[k]; await L118.order(GM,'cafe2'); const paid=1000-G.money; if(paid!==s.menu[k][1]||paid<100||paid>160) bad.push([s.menu[k][0],paid]); lines=lines.concat(said); }
    check('2-3. 大學食堂點三個份量：扣的錢就是菜單的價錢，都在 100～160',bad.length===0,J(bad));
    check('2-3. 大學食堂的招呼是資料裡阿姨那一句（「自己夾，夾好拿過來秤。」，AA_280 第 2 節），句子照資料；沒有另外加字',s.greet.text==='自己夾，夾好拿過來秤。'&&lines.some(l=>l.t===s.greet.text)&&lines.every(l=>l.t===s.greet.text||l.t===s.done||s.menu.some(m=>l.t===D.orderLine.replace('{品名}',m[0]))),J(lines.slice(0,3))); }
  // 2-4 舊存檔：G.l118＝{n,d,last,w,once,rankAt}（改版前的格式、舊菜名）
  { const old=()=>({n:{dian:9,tea:8,self:8,home:2,cafe2:12,korea:3},d:{dian:90,tea:91,self:92,home:80,cafe2:93,korea:95},last:{dian:'椒麻雞飯',tea:'紅茶拿鐵',self:'排骨飯',home:'番茄炒蛋（單點）',cafe2:'美式咖啡',korea:'石鍋拌飯',gone_shop:'什麼'},w:{'zhe@noodle2':{n:3,d0:10,d:60},'classmate_xinci@home':{n:2,d0:20,d:70}},once:{H7a:70},rankAt:{term:'Y1S1',week:9}});
    const g=fresh(3,12.5,5000,old()), keep=J([g.l118.once,g.l118.rankAt]);
    const n1=L118.migrate(g), after1=J(g.l118), n2=L118.migrate(g), after2=J(g.l118);
    /* 2026-11-11 LAWWW 決定（AA 同意）：熟客次數跟著店員走——n、d、last 照故事搬（noodle2→korea、korea→tea、self→cafe2、tea→drink_a；原 cafe2＝慢讀的次數併進木曜日 G.mokuyobi.n）。
       舊期望（第一階段）：n、d 照位置不動、last 只清不在新菜單的（留下水上便當的排骨飯）*/
    check('2-4. 讀舊存檔：last 跟著店員搬以後，不在那間店新菜單的清掉（椒麻雞飯、紅茶拿鐵、排骨飯搬到大學食堂、番茄炒蛋、美式咖啡、已經沒有的店），還在的留著（韓食老闆搬到辛亥韓食：石鍋拌飯）',J(g.l118.last)===J({tea:'石鍋拌飯'}),J(g.l118.last)+' '+n1);
    check('2-4. 來了幾次、上次哪天跟著店員走：korea→tea、self→cafe2、tea→drink_a，dian、home 留原位；慢讀（原 cafe2）的 12 次併進木曜日；新店 self 從 0 開始',J(g.l118.n)===J({dian:9,home:2,tea:3,cafe2:8,drink_a:8})&&J(g.l118.d)===J({dian:90,home:80,tea:95,cafe2:92,drink_a:91})&&g.mokuyobi&&g.mokuyobi.n===12&&g.l118.n.self===undefined,J([g.l118.n,g.l118.d,g.mokuyobi]));
    check('2-4. 演過的（once）、rankAt 一個都沒動；一起吃的次數（w）每一筆都還在',J([g.l118.once,g.l118.rankAt])===keep&&Object.keys(g.l118.w).length===2&&Object.values(g.l118.w).reduce((a,x)=>a+x.n,0)===5,J(g.l118.w));
    check('2-4. 做第二次什麼都不變（冪等）',n1>0&&n2===0&&after1===after2);
    const g0=fresh(3,12.5,5000); L118.migrate(g0); const g1=fresh(3,12.5,5000,[]); L118.migrate(g1); const g2=fresh(3,12.5,5000,{n:{dian:1}}); L118.migrate(g2);
    check('2-4. 沒有 G.l118、G.l118 壞掉、沒有 last 的存檔：不出錯、不多寫東西',g0.l118===undefined&&Array.isArray(g1.l118)&&J(g2.l118.n)===J({dian:1})&&g2.l118.last===undefined);
    // 沒做遷移（直接拿舊資料）也不會點到沒有的菜、不印 undefined
    let bad=[]; for(const id of ['dian','tea','self','home','cafe2']){ fresh(3,12.5,5000,old()); picks=[0,0,0]; await L118.order(GM,id); const T=texts(); if(T.some(t=>/undefined|null|\{上次點的\}|\{品名\}/.test(String(t)))||!T.some(t=>/^（你點了.+。）$/.test(t))) bad.push([id,T]);
      const it=G.l118.last[id]; if(!shop(id).menu.some(m=>m[0]===it)) bad.push([id,'last',it]); for(const o of opts) for(const q of o) if(/undefined/.test(String(q.t))||(q.hint!=null&&/undefined/.test(String(q.hint)))) bad.push([id,'opt',q]); }
    check('2-4. 舊存檔（熟客第 8 次以上、上次點的是舊菜）在五間店各點一次：點到的都是新菜單上的、畫面上沒有 undefined／沒換掉的 {…}',bad.length===0,J(bad));
    check('2-4. 讀檔的遷移有接上（src/game3d.js migrate 叫 L118.migrate）',/L118\.migrate\(s\)/.test(fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'))); }
  // 2-5 配置裡沒有位置的店：安靜跳過；配置加了那一列就出現
  { const keepRows=LANE118_LAYOUT.shops.slice(); LANE118_LAYOUT.shops=keepRows.filter(q=>!/^drink_/.test(q.id));
    let err=null, r={};
    try{ r.door=L118.door('drink_a'); r.placed=[L118.placed('drink_a'),L118.placed('dian')];
      fresh(3,12.55,5000); const reg=D.regulars.find(x=>x.shop==='drink_a'); r.reg=!!reg; r.n=L118.populate(GM); r.sp=spawned.map(c=>c.id);
      G.flags.L118_PICK='100:drink_a'; L118.tick(G); r.lunch=G.flags.L118_LUNCH; r.pick=G.flags.L118_PICK;
      r.rot=L118.baseRotation(); r.first=L118.firstShop(); }catch(e){ err=e; }
    check('2-5. drink_a 沒有配置位置：door＝null、placed＝false；常客（學姊買了就走）不站到街上；約好的午餐不排；都不報錯',!err&&r.door===null&&r.placed[0]===false&&r.placed[1]===true&&r.reg&&!r.sp.includes('heroine_05')&&r.lunch===undefined&&r.pick===undefined,err?String(err.stack||err):J(r));
    check('2-5. 阿哲輪流的店、第一次那一間都是街上有位置的',!!r.rot&&r.rot.length===4&&r.rot.every(x=>LANE118_LAYOUT.shops.some(q=>q.id===x))&&r.first===D.lunch.firstShop,J([r.rot,r.first]));
    const zsrc=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
    check('2-5. 街上的店門互動點只照配置的 shops 放（zones3d.js buildLane118），店名、類型讀店家資料',/for\(const sh of \(\(L&&L\.shops\)\|\|\[\]\)\)\{[^\n]*LANE118_SHOPS\.shops\.find\(q=>q\.id===sh\.id\)/.test(zsrc)&&/label:nm\+'（'\+ty\+'）',shop118:sh\.id\}\)/.test(zsrc));
    // 加了位置：自動出現
    LANE118_LAYOUT.shops=LANE118_LAYOUT.shops.concat([{id:'drink_a',side:'E',z0:-7,z1:-2,floors:1}]); fresh(3,12.55,5000); const d2=L118.door('drink_a'); const reg=D.regulars.find(x=>x.shop==='drink_a'); const on=L118.regActive(reg,G); L118.populate(GM);
    check('2-5. 配置加了 drink_a 那一列：店門口有位置（東側、z＝−4.5）；那個時段在的常客站到那一間門口',!!d2&&d2.side==='E'&&d2.z===-4.5&&(!on||spawned.some(c=>c.id==='heroine_05')),J([d2,on,spawned.map(c=>c.id)]));
    LANE118_LAYOUT.shops=keepRows; }
  // ---------- 第 3 部分：第二階段——故事照 AA_772 搬（白名單上的版本；tools/story/l118_fix772.py）----------
  { const r=require('child_process').spawnSync('python3',['tools/story/l118_fix772.py','--check'],{cwd:ROOT,encoding:'utf8'});
    check('3-0. AA_772 的 fix 每一列都換好了、沒有對不到的；src/data/l118_redo772.js 和稿一致（l118_fix772.py --check）',r.status===0,(r.stdout||'')+(r.stderr||''));
    for(const t of ['tools/story/import_gifts.py','tools/story/import_flirt.py','tools/story/import_activity_scenes.py','tools/story/import_place_acc.py']){ const q=require('child_process').spawnSync('python3',[t,'--check'],{cwd:ROOT,encoding:'utf8'});
      check('3-0. 產生的檔重匯不會把 AA_772 那一層蓋掉：'+t+' --check',q.status===0,((q.stdout||'')+(q.stderr||'')).slice(0,200)); } }
  { const RD=L118_REDO, ids=D.shops.map(s=>s.id);
    check('3-1. 店員的稱呼十一間都照 AA_772 staff（src/data/l118_redo772.js）：L118.STAFF 和資料一樣',J(L118.STAFF)===J(RD.staff)&&ids.every(id=>typeof L118.STAFF[id]==='string'&&L118.STAFF[id]),J(L118.STAFF));
    const badItem=ids.filter(id=>{ const q=L118.REG[id]; return !q||!q.known||!q.known.length||!q.usual||(q.item&&!shop(id).menu.some(m=>m[0]===q.item)); });
    check('3-1. 熟客三段十一間都有（認得你、老樣子）；老樣子說了菜名的那一樣都在那間店現在的菜單上',badItem.length===0&&Object.keys(L118.REG).length===11,J(badItem));
    check('3-1. 熟客的句子就是資料裡那幾句（程式沒有另外寫）；考試週的句子跟著店員搬（大學食堂的阿姨、喝不喝咖啡的店員）',ids.every(id=>J(L118.REG[id].known)===J(RD.reg[id].known)&&L118.REG[id].usual===RD.reg[id].usual)&&!!L118.REG.cafe2.exam&&!!L118.REG.drink_a.exam&&!L118.REG.tea.exam&&!L118.REG.self.exam); }
  // 3-2 熟客：第 8 次起「老樣子」；有菜名、上次點別的、沒有「不帶菜名那一句」的店＝照「認得你」，不說對不上的菜名
  { const mk=(id,last)=>{ fresh(3,12.5,5000,{n:{[id]:9},d:{[id]:1},last:last?{[id]:last}:{}}); return L118.stage(G,id); };
    const a=mk('dian','鐵板牛排'), b=mk('dian','雪花牛排'), c=mk('self','排骨飯'), d=mk('self','炸雞腿飯'), e=mk('drink_a','冬瓜茶');
    check('3-2. 118牛排第 9 次、上次點鐵板牛排＝「一樣鐵板牛排？」；上次點雪花牛排＝不帶菜名那一句（跟著老闆娘留在這一間）',a&&a.kind==='usual'&&a.lines[0][1]===L118_REDO.reg.dian.usual&&b&&b.kind==='usual'&&b.lines[0][1]===L118_REDO.reg.dian.usual2&&!!L118_REDO.reg.dian.usual2,J([a,b]));
    check('3-2. 水上便當上次點排骨飯＝不帶菜名那一句（AA_772 @d78266901 補的 usual2），不會說「一樣炸雞腿飯？」；上次點炸雞腿飯＝老樣子那一句',c&&c.kind==='usual'&&c.lines[0][1]===L118_REDO.reg.self.usual2&&d&&d.kind==='usual'&&d.lines[0][1]===L118_REDO.reg.self.usual,J([c,d]));
    { const keep=L118.REG.self.usual2; delete L118.REG.self.usual2; const c2=mk('self','排骨飯'); L118.REG.self.usual2=keep;
      check('3-2. 退路：有菜名、沒有不帶菜名那一句的店，上次點別的＝照「認得你」那一句（不說對不上的菜名）',c2&&c2.kind==='known',J(c2)); }
    check('3-2. 六間老樣子說了菜名的店都有不帶菜名那一句（資料的 usual2）',Object.keys(L118.REG).filter(k=>L118.REG[k].item).every(k=>typeof L118.REG[k].usual2==='string'&&L118.REG[k].usual2)&&Object.keys(L118.REG).filter(k=>L118.REG[k].item).length===6);
    check('3-2. 喝不喝咖啡的老樣子把上次點的填進去（「冬瓜茶，對吧。」），沒有留下 {上次點的}',e&&e.kind==='usual'&&e.lines[0][1]==='冬瓜茶，對吧。',J(e)); }
  // 3-3 H1～H9 搬到哪一間
  { const src=fs.readFileSync(path.join(ROOT,'src/lane118.js'),'utf8');
    check('3-3. H1（學姊的老樣子）在喝不喝咖啡（drink_a）；H4（阿哲的排名）四間＝korea、dian、tea、home，三個選項記的店都在輪流裡',L118.H1_SHOP==='drink_a'&&J(L118.H4.shops)===J(['korea','dian','tea','home'])&&J(L118.H4.opts.map(o=>o.rank))===J(['korea','dian','tea'])&&L118.H4.opts.every(o=>D.lunch.rotation.includes(o.rank)));
    fresh(3,12.5,5000); const h5=L118.withScene(G,'tea',['yu'],12.5), h5old=L118.withScene(G,'korea',['yu'],12.5), h3=L118.withScene(G,'cafe2',['heroine_01'],12.5);
    check('3-3. H5（老闆記得 Alison）在辛亥韓食（tea），清州刀削麵（korea）不演；H3 在 118 巷不演（搬到木曜日）',!!h5&&J(h5.lines)===J(L118.H5.lines)&&h5old===null&&h3===null,J([h5,h5old,h3]));
    fresh(3,12.7,5000,{w:{'classmate_bohan@cafe2':{n:3,d0:1,d:100}},once:{}}); const h6=L118.h6Due(G,'cafe2',['classmate_bohan'],12.7), h6old=L118.h6Due(G,'self',['classmate_bohan'],12.7);
    check('3-3. H6（柏翰十二點四十）在大學食堂（cafe2），水上便當（self）不演',h6===true&&h6old===false);
    fresh(3,12.5,5000,{w:{'zhe@korea':{n:1},'zhe@dian':{n:1},'zhe@tea':{n:1},'zhe@home':{n:1}},once:{}});
    check('3-3. H4 在清州刀削麵（korea）和阿哲吃完、四間都吃過＝演；在迪倫窯烤披薩（noodle2）不演',L118.h4Due(G,'korea',['zhe'])===true&&L118.h4Due(G,'noodle2',['zhe'])===false);
    check('3-3. 阿哲輪替照資料（korea → dian → tea → home），AA_480 的換店（S.LUNCH_FIX）和那一句拿掉了',J(L118.baseRotation())===J(D.lunch.rotation)&&L118.LUNCH_FIX===undefined&&!/LUNCH_FIX=\{/.test(src)&&D.lunch.rotation.every(x=>L118.weeklyText(x)===D.lunch.weekly[x]));
    check('3-3. 交往中約午餐的地點（L118.INVITE）店名照資料＝義大麵屋',L118.INVITE.name===shop('pasta').name&&L118.INVITE.verb==='去'+shop('pasta').name+'吃午餐'); }
  // 3-4 舊存檔：ZHE_118_RANK、一起吃的次數照故事搬（一次、冪等）
  { const g={flags:{ZHE_118_RANK:'noodle2'},l118:{n:{noodle2:6},d:{noodle2:3},last:{},w:{'zhe@noodle2':{n:2,d0:5,d:9},'zhe@korea':{n:1,d0:7,d:7},'zhe@self':{n:1,d0:8,d:8},'zhe@home':{n:1,d0:3,d:3},'classmate_bohan@self':{n:2,d0:1,d:2},'yu@korea':{n:4,d0:1,d:2}},once:{H4:9}}};
    L118.migrate(g); const a1=J(g); L118.migrate(g); const a2=J(g);
    check('3-4. ZHE_118_RANK：noodle2→korea（存檔選「這間第一」的還是阿哲的麵店）',g.flags.ZHE_118_RANK==='korea');
    check('3-4. 一起吃的次數：阿哲 noodle2→korea、korea→tea、self 併進 home（次數相加）；柏翰 self→cafe2；別人的（Alison@korea）不動',J(g.l118.w['zhe@korea'])===J({n:2,d0:5,d:9})&&J(g.l118.w['zhe@tea'])===J({n:1,d0:7,d:7})&&J(g.l118.w['zhe@home'])===J({n:2,d0:3,d:8})&&g.l118.w['zhe@noodle2']===undefined&&g.l118.w['zhe@self']===undefined&&J(g.l118.w['classmate_bohan@cafe2'])===J({n:2,d0:1,d:2})&&J(g.l118.w['yu@korea'])===J({n:4,d0:1,d:2}),J(g.l118.w));
    check('3-4. 來了幾次跟著麵店老闆走（noodle2 的 6 次→korea）、演過的（once）不動；做第二次不變（不會把 korea 再搬到 tea）',J(g.l118.n)===J({korea:6})&&J(g.l118.d)===J({korea:3})&&J(g.l118.once)===J({H4:9})&&a1===a2&&g.flags.ZHE_118_RANK==='korea'&&g.l118.mv772===2);
    { const h={flags:{ZHE_118_RANK:'korea'},l118:{mv772:1,n:{noodle2:6,korea:2,cafe2:5},d:{noodle2:3,korea:4,cafe2:9},last:{},w:{'zhe@korea':{n:2,d0:5,d:9}},once:{}},mokuyobi:{n:4,seats:{}}}; L118.migrate(h); const b1=J(h); L118.migrate(h);
      check('3-4. 只跑過第一步的存檔（mv772＝1）補跑第二步：旗標、一起吃的次數不再搬一次，n、d 才搬；慢讀的 5 次加進木曜日原本的 4 次；再跑不變',h.flags.ZHE_118_RANK==='korea'&&J(h.l118.w)===J({'zhe@korea':{n:2,d0:5,d:9}})&&J(h.l118.n)===J({korea:6,tea:2})&&J(h.l118.d)===J({korea:3,tea:4})&&h.mokuyobi.n===9&&h.l118.mv772===2&&b1===J(h),J(h)); }
    const g2={flags:{ZHE_118_RANK:'korea'}}; L118.migrate(g2); L118.migrate(g2); const g3={flags:{ZHE_118_RANK:'dian'},l118:{}}; L118.migrate(g3); const g4={flags:{}}; L118.migrate(g4);
    check('3-4. 只有旗標、沒有 G.l118 的存檔也搬（korea→tea 一次）；dian 不變；兩樣都沒有的存檔不動',g2.flags.ZHE_118_RANK==='tea'&&g3.flags.ZHE_118_RANK==='dian'&&g4.l118===undefined); }
  // 3-5 作息：排在 118 巷店裡的人不能撞公休、不在營業時間（撞到＝列給 AA 決定，不自己改去別的店）
  { load('src/data/characters.js',/^(CHARACTERS)$/);
    const bad=[], seen=[]; const chk=(who,e,src)=>{ const m=/^l118_(.+)$/.exec(e.zone||''); if(!m) return; const s=shop(m[1]); seen.push(who+'@'+m[1]); if(!s){ bad.push([src,who,e.zone,'沒有這間店']); return; }
        for(const wd of (e.days||[0,1,2,3,4,5,6])){ if(s.hours.closed.includes(wd)) bad.push([src,who,s.name,'週'+'日一二三四五六'[wd]+'公休',e.from,e.to]); else if(!s.hours.open.some(([a,b])=>e.from>=a-1e-6&&e.to<=b+1e-6)) bad.push([src,who,s.name,'週'+'日一二三四五六'[wd]+' '+e.from+'～'+e.to+' 不在營業時間（'+s.hours.text+'）']); } };
    for(const id in CHARACTERS) for(const e of (CHARACTERS[id].daily_schedule||[])) if(e) chk(id,e,'characters.js');
    for(const r of D.regulars){ const s=shop(r.shop); for(const wd of r.days){ if(s.hours.closed.includes(wd)) bad.push(['AA_280 常客',r.id,s.name,'週'+'日一二三四五六'[wd]+'公休']); else if(!s.hours.open.some(([a,b])=>r.from>=a-1e-6&&r.to<=b+1e-6)) bad.push(['AA_280 常客',r.id,s.name,r.from+'～'+r.to+' 不在營業時間（'+s.hours.text+'）']); } }
    check('3-5. characters.js 的作息有排到 118 巷的店（掃得到東西）',seen.length>=8,String(seen.length));
    check('3-5. 排在 118 巷店裡吃飯的作息、AA_280 的常客：沒有人排在公休日或關門的時段',bad.length===0,bad.map(b=>b.join('｜')).join('\n  ')); }
  // 3-6 室內座位的互動半徑：配置寫了 r 就用（LAWWW2 之後的卡座會寫 r:1.25），沒寫＝0.7（現有九間都沒寫，行為不變）
  { const s3=fs.readFileSync(path.join(ROOT,'src/l118_shops3d.js'),'utf8'); load('src/data/l118_shop_layouts.js',NAMES);
    /* 2026-11-11 室內重做的店（配置的 src 是 tools/blender/env_second/l118_int_<id>.py：奈良咖哩、迪倫窯烤披薩、義大麵屋…）靠牆、隔著另一張椅子的座位寫了 r（走近點在走道上，tests/l118_int_pon_1111_unit.js 檢查）；
       還沒重做的那幾間照舊沒寫 r */
    const R_REDONE=['home'];   /* 2026-11-11 室內重做（l118_int_home.py）：五湖四海左牆長條座位的四個位子前面是桌子、離走道 1.5 m，寫了 r:1.6（和 ap） */
    const withR=Object.keys(L118_SHOP_LAYOUTS).filter(id=>!R_REDONE.includes(id)&&!/l118_int_/.test(L118_SHOP_LAYOUTS[id].src||'')&&(L118_SHOP_LAYOUTS[id].seats||[]).some(q=>q.r!=null));
    /* 11-11 LAWWW2 第 1 版第一批：辛亥韓食（tea）的四人卡座靠牆的 6 個座位寫了 r:1.25、inner:true（離走道 1 m 多）；其他店還是沒有 r。原本這一項期望「九間都沒有 r」（那時候卡座還沒交） */
    const teaR=(L118_SHOP_LAYOUTS.tea.seats||[]).filter(q=>q.r!=null), homeR=(L118_SHOP_LAYOUTS.home.seats||[]).filter(q=>q.r!=null);
    /* 2026-11-11（L118-IT-REACH-1111，BB 搖桿逐張測椅子第 3 項）：沒寫 r 的預設 0.7 → 0.8（IT_DEF.seatR），前面再加覆寫表那一格的 r（f.r）——配置寫的 r 照舊用 */
    check('3-6. src/l118_shops3d.js 座位的互動半徑＝覆寫表的 r||配置的 r||0.8；配置寫了 r 的座位都在 0.6～0.95（辛亥韓食、五湖四海 0.8／0.6）、而且帶按鈕位置 i 或走近點 ap（11-12：覆寫表的值搬進配置；舊期望見下面的註解）',/radius:f\.r\|\|s\.r\|\|IT_DEF\.seatR,lv:0,prio:0\.3,seat:st/.test(s3)&&/const IT_DEF=\{seatR:0\.8\}/.test(s3)&&!/radius:0\.[78],lv:0,prio:0\.3,seat:st/.test(s3)&&(()=>{ const all=[]; for(const id of Object.keys(L118_SHOP_LAYOUTS)) for(const q of L118_SHOP_LAYOUTS[id].seats) if(q.r!=null) all.push([id,q]); return all.length>0&&all.every(([id,q])=>q.r>=0.6&&q.r<=0.95&&(Array.isArray(q.i)||Array.isArray(q.ap)))&&teaR.every(q=>q.r===0.8||q.r===0.6)&&teaR.length>=6&&homeR.length===4&&homeR.every(q=>q.r===0.8&&Array.isArray(q.ap)); })(),J([withR,teaR.length,homeR.length]));
    /* 舊期望（L118-IT-REACH-1111 收尾以前，到 2026-11-12）：只有辛亥韓食寫 r（靠牆 6 張 r 1.25、inner）、五湖四海 4 張 r 1.6、其他店沒有 r——那時候按鈕在椅子上，半徑要大到蓋得到走道。
       現在覆寫表的值搬進配置（tools/lane118/it_fix.py）：按鈕在走道上（seats[].i），辛亥韓食、五湖四海寫了 r 的都是 0.8（辛亥韓食最靠門那張 0.6）；室內重做的那幾間（l118_int_*.py）原本就有的 0.9／0.92 照舊；寫了 r 的一定帶 i 或 ap */
    check('3-6. 大學食堂（cafe2）的桌位不再是「坐下讀書」（念書搬到木曜日）',/const study=false;/.test(s3)&&!/study=id==='cafe2'/.test(s3)); }
  // 3-7 街上的招牌：模型（lane118_street.glb）板面帶的是匯出當時的店名——遊戲畫字的時候換成店家資料的店名、類型（LAWWW2 的新外觀延後）
  { const zs=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'), glb=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/lane118_street.glb'));
    const n=glb.readUInt32LE(12), gj=JSON.parse(glb.slice(20,20+n).toString('utf8')), faces=gj.nodes.filter(x=>/^SIGN_FACE_/.test(x.name||'')&&x.extras&&typeof x.extras.sign==='string');
    const byOld={}; for(const id of Object.keys(L118_SHOP_LAYOUTS)) byOld[L118_SHOP_LAYOUTS[id].name]=id;
    const hit=faces.filter(f=>byOld[f.extras.sign]), same=faces.filter(f=>D.shops.some(s=>s.name===f.extras.sign));
    /* 11-11 LAWWW2 第 1 版第一批：十一間的招牌改成貼圖（從使用者的參考圖裁／照定案的顏色畫，tools/blender/env_second/l118_signs_tex.py），模型不再留這十一間的 SIGN_FACE——
       剩下的 SIGN_FACE 是填空的小店（早餐店、影印…），照舊由遊戲畫字。原本這一項期望「九塊板面帶舊店名、畫字的時候換」（新外觀還沒交的時候） */
    const atl=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/blender/env_second/textures/gen/l118_signs_atlas.json'),'utf8')), ids11=D.shops.map(q=>q.id);
    check('3-7. 十一間的招牌是貼圖：模型裡沒有帶新、舊店名的 SIGN_FACE（剩下的是填空的小店）；招牌貼圖集每間一塊；模型有招牌貼圖的材質',hit.length+same.length===0&&faces.length>=1&&ids11.length>=9&&ids11.every(id=>atl['l118_'+id+'_h'])&&(gj.materials||[]).some(m=>/^wz_signs/.test(m.name||'')),J([faces.map(f=>f.extras.sign),ids11.filter(id=>!atl['l118_'+id+'_h'])]));
    check('3-7. src/zones3d.js 畫 118 巷招牌的字用換過的（ud118：sign＝店家資料的店名、sub＝類型；對不到的板面照模型原本的字）',/const ud118=\(tag==='l118'&&[^\n]*LANE118_SHOPS/.test(zs)&&/wzSignTex\(ud118,wM,hM,false\)/.test(zs)&&/wzSignTex\(ud118,wM,hM,true\)/.test(zs)&&!/wzSignTex\(ud,wM,hM,(false|true)\)/.test(zs)); }
  console.log(fails?('\n有 '+fails+' 項失敗'):'\n全部通過'); process.exit(fails?1:0);
})();
