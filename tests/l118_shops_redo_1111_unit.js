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
load('src/data/lane118_layout.js',NAMES); load('src/data/lane118_shops.js',NAMES);
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
  // @@PART2@@
  console.log(fails?('\n有 '+fails+' 項失敗'):'\n全部通過'); process.exit(fails?1:0);
})();
