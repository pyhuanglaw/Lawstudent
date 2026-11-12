// GIFT-L118-DRINK-1112（使用者 2026-11-12：「買飲料送給可攻略的對象到底是要怎麼觸發 我去飲料店還是只能自己喝啊」）：
// 118 巷外帶飲料店菜單上和 GIFT.ITEMS 同名的品項可以「買一份帶走送人…」，價錢照那一間的菜單。不需要瀏覽器。
// 檢查：1 喝不喝咖啡賣得到鮮奶茶 65、美式咖啡 50、拿鐵 75（照菜單）、不賣豆漿；2 便利商店、2:30 AM 的價錢照舊；3 果茶社整份菜單都可以送（2026-11-12 GIFT-ALL-DRINK-SHOPS-1112 改；原本＝沒有那個選項）；
//       4 吃飯的店（清州刀削麵）不賣；5 GIFT.buy 在喝不喝咖啡買拿鐵：扣 75、帶在身上、記那一間；6 lane118.js 點餐選單：飲料店多那一項放在「不用了」後面、選了走 GIFT.buy。
// 修改前 1、5、6 FAIL。用法：node tests/gift_l118_drink_1112_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm'); const R=path.join(__dirname,'..');
let fail=0; const check=(n,ok,x)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||x===undefined?'':'　'+JSON.stringify(x))); if(!ok) fail++; };
const ctx={console}; vm.createContext(ctx);
for(const f of ['src/data/lane118_shops.js','src/data/gift_lines.js','src/gift3d.js']) vm.runInContext(fs.readFileSync(path.join(R,f),'utf8')+';this.LANE118_SHOPS=typeof LANE118_SHOPS!=="undefined"?LANE118_SHOPS:this.LANE118_SHOPS;this.GIFT=typeof GIFT!=="undefined"?GIFT:this.GIFT;',ctx);
const GIFT=ctx.GIFT, SH=ctx.LANE118_SHOPS.shops, it=n=>GIFT.ITEMS.find(x=>x.n===n);
const A=SH.find(s=>s.id==='drink_a'), B=SH.find(s=>s.id==='drink_b'), K=SH.find(s=>s.id==='korea');
(async()=>{
  check('1. 喝不喝咖啡：鮮奶茶、美式咖啡、拿鐵可以買來送人，價錢照菜單；豆漿不賣',['鮮奶茶','美式咖啡','拿鐵'].every(n=>GIFT.sells(A.name,it(n))&&GIFT.price(it(n),A.name)===A.menu.find(m=>m[0]===n)[1])&&!GIFT.sells(A.name,it('豆漿')),['鮮奶茶','美式咖啡','拿鐵'].map(n=>GIFT.price(it(n),A.name)));
  check('2. 便利商店、2:30 AM 的價錢照舊（拿鐵 55／120、豆漿 25）',GIFT.price(it('拿鐵'),'便利商店')===55&&GIFT.price(it('拿鐵'),'兩點半 Café')===120&&GIFT.price(it('豆漿'),'便利商店')===25&&!GIFT.sells('兩點半 Café',it('豆漿')));
  const G={day:10,money:500,flags:{},carry:[]};
  check('3. 果茶社（GIFT-ALL-DRINK-SHOPS-1112 改：原本「沒有同名品項＝沒有那個選項」；現在整份菜單都可以買來送人、價錢照菜單；和 GIFT.ITEMS 同名的還是沒有）',!!GIFT.shopOpt(G,B.name)&&!GIFT.ITEMS.some(x=>GIFT.sells(B.name,x))&&JSON.stringify(GIFT.menu(G,B.name).map(x=>[x.n,x.p]))===JSON.stringify(B.menu.map(m=>[m[0],m[1]])),GIFT.menu(G,B.name));
  check('4. 吃飯的店不賣（清州刀削麵）',GIFT.shopOpt(G,K.name)===null);
  const opt=GIFT.shopOpt(G,A.name); let picks=['拿鐵'], said=[], paid=0;
  const GM={G,choose:async o=>{ const w=picks.shift(); return o.findIndex(q=>q.t.startsWith(w)); },say:async(w,t)=>said.push(t),money:d=>{ paid+=d; G.money+=d; },toast(){}};
  const c=await GIFT.buy(GM,A.name);
  check('5. 在喝不喝咖啡買拿鐵：選項字是既有的「買一份帶走送人…」、扣 75、帶在身上、記那一間',!!opt&&opt.t===GIFT.SHOP_OPT&&paid===-75&&!!c&&c.n==='拿鐵'&&c.shop===A.name&&G.carry.length===1&&said.join('')==='你買了拿鐵，帶在身上。',[opt&&opt.t,paid,c,said]);
  const src=fs.readFileSync(path.join(R,'src/lane118.js'),'utf8');
  check('6. lane118.js：飲料店的選單在「不用了」後面加 GIFT.shopOpt、選了走 GIFT.buy（原本的選項位置不動）',/concat\(\[\{t:'不用了'\}\]\);\s*\n\s*const gO=s\.drink&&typeof GIFT!=='undefined'&&GIFT\.shopOpt\?GIFT\.shopOpt\(G,s\.name\):null; if\(gO\) opts\.push\(gO\);/.test(src)&&/if\(gO&&k===s\.menu\.length\+1\)\{ await GIFT\.buy\(GM,s\.name\); return true; \}/.test(src));
  console.log(fail?'FAILED '+fail:'ALL PASS'); process.exit(fail?1:0); })();
