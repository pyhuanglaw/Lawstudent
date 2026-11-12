// 可以「買一份帶走送人…」的店，各自菜單上的飲料（STALE-SOURCES-1112；給 tools/story/import_gifts.py 核對 AA_710 的品名用）。
// 不自己抄一份菜單：載入遊戲的資料檔和各店的點餐程式，直接問 src/gift3d.js 的 GIFT.menu（和遊戲賣的是同一份）。
// 菜單會跟著季節、時段變的店（帝大紅茶、阿忠鮮果、大口漢堡、泰米…）：一整年每 7 天 × 四個時段都問一次，取聯集。
// 輸出（stdout，一行 JSON）：{shops:{記在 G.carry 的店名:[品名…]}, keys:{店名:[點餐程式用的 key…]}, unreadable:[讀不到菜單的店…], loadErr:[載不進來的檔…]}
//   unreadable／loadErr 不是空的＝匯入工具會停下來（不默默放行）。
// 用法：node tools/story/gift_shop_menus.js
const realLog=console.log; console.log=()=>{};   /* 載入的檔自己印的字不混進輸出 */
const path=require('path'), fs=require('fs'), vm=require('vm');
const H=require(path.join(__dirname,'..','..','tests','pg_harness.js'));
const rd=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
global.Z3=global.Z3||{ZONES:{}};
const loadErr=[];
/* 和 tests/gift_all_drink_shops_1112_unit.js 載的是同一批（那支測試核對這幾間的菜單和 GIFT.menu 一致）*/
for(const f of ['src/data/lane118_shops.js','src/data/night_market.js','src/data/season_stalls.js','src/data/gg3_shops_lines.js','src/data/tz_meal_lines.js','src/data/tz_grocery_lines.js','src/data/eat_lines.js','src/eat3d.js','src/data/gift_lines.js','src/gift3d.js',
  'src/ggshops_sys3d.js','src/dakou_sys3d.js','src/offbeat_sys3d.js','src/mokuyobi_sys3d.js','src/gg2shops3d.js','src/gg3shops3d.js','src/wzshops3d.js','src/night_market3d.js','src/season_stalls3d.js','src/gym3d.js','src/lane118.js']){
  try{ let s=rd(f); s=s.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ if(!(f==='src/gym3d.js'&&typeof GY3!=='undefined')) loadErr.push(f+'：'+String(e).slice(0,160)); } }
const out={shops:{},keys:{},unreadable:[],loadErr};
if(typeof GIFT==='undefined'||typeof GIFT.menu!=='function'){ out.loadErr.push('src/gift3d.js：沒有 GIFT.menu'); console.log=realLog; console.log(JSON.stringify(out)); process.exit(0); }
/* 青木茶室的外帶窗口：菜單寫在 story3d.js counter 那一行，counter 自己把菜單傳給 GIFT（不在 GIFT.SHOPS 表上）*/
const AOKI=(()=>{ const m=/await counter\(GM,'清葉茶行',(\[\[.*?\]\]),'aoki'\)/.exec(rd('src/story3d.js')); try{ return m?JSON.parse(m[1].replace(/'/g,'"')):null; }catch(e){ return null; } })();
const LIST=[];   /* [key, 傳進去的菜單] */
for(const k of Object.keys(GIFT.SHOPS)) LIST.push([k]);
LIST.push(['便利商店'],['兩點半'+' Café'],['清葉茶行',AOKI||[]]);
if(typeof LANE118_SHOPS!=='undefined') for(const s of LANE118_SHOPS.shops) if(s.drink) LIST.push([s.name]);
const G0=H.fresh('2026-09-07',14), D0=G0.day;
for(const [key,rows] of LIST){ const d=GIFT.shopDef(key,rows), name=d?d.name:key, seen=out.shops[name]||(out.shops[name]=[]);
  (out.keys[name]||(out.keys[name]=[])).push(key);
  for(let dd=0;dd<371;dd+=7) for(const h of [8,12,15,19]){ const G=Object.assign({},G0,{day:D0+dd,hour:h}); let M=[]; try{ M=GIFT.menu(G,key,rows)||[]; }catch(e){ M=[]; }
    for(const it of M){ if(it.cat!=='drink') continue; for(const o of it.opt||[['','']]){ const n=it.n+o[1]; if(!seen.includes(n)) seen.push(n); } } } }
for(const n of Object.keys(out.shops)) if(!out.shops[n].length){ out.unreadable.push(n+'（'+out.keys[n].join('、')+'）'); delete out.shops[n]; }
console.log=realLog; console.log(JSON.stringify(out)); process.exit(0);
