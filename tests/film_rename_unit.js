// 真實片名、演員、補習班品牌改成虛構的（AA_313 6-2、6-4；D77 店名品牌不侵權）——不需要瀏覽器。
//   1. 遊戲資料裡（src、src/data）沒有《東京物語》《晚春》、笠智眾、鷗律師、Facebook（ladder.js 的 note 是企劃的註記、不顯示，除外）；
//   2. 舊存檔：人物面板的記憶（SOCIAL.noteLabel 系列）顯示新片名；手機的群組名、訊息只換一次（PHONE.rec 的 filmRen）。
// 修改前 1、2 FAIL。用法：node tests/film_rename_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const bad=[]; for(const d of ['src','src/data']) for(const f of fs.readdirSync(path.join(ROOT,d))){ if(!/\.js$/.test(f)) continue; const p=path.join(d,f); if(p==='src/data/ladder.js') continue;
  fs.readFileSync(path.join(ROOT,p),'utf8').split('\n').forEach((line,i)=>{ if(/filmRename|AA_313 6-2/.test(line)) return;   /* 改名的程式本身、它的說明 */ for(const w of ['《東京物語》','《晚春》','笠智眾','鷗律師','Facebook']) if(line.includes(w)) bad.push(p+':'+(i+1)+' '+w); }); }
check('1. 遊戲資料沒有真實片名、演員、品牌（企劃註記 ladder.js 除外）', bad.length===0, bad.slice(0,8).join(' '));
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|SOCIAL|CALENDAR|PHONE)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/social3d.js','src/phone3d.js']) load(f);
check('2. SOCIAL.filmRename：《東京物語》→《進城的那一週》、《晚春》→《父親的午後》、不帶括號的也一樣', typeof SOCIAL.filmRename==='function'&&SOCIAL.filmRename('答應一起看《東京物語》（三個人）')==='答應一起看《進城的那一週》（三個人）'&&SOCIAL.filmRename('《晚春》的午場')==='《父親的午後》的午場'&&SOCIAL.filmRename('東京物語的早場')==='《進城的那一週》的早場');
{ const G={day:300,hour:10,flags:{},social:null,msgs:[{th:'g:zr_film',from:'heroine_02',text:'明天去看《東京物語》。'}],phone:{groups:{zr_film:{name:'東京物語',day:290}},seen:{},q:[],n:0}}; SOCIAL.bind(G);
  PHONE.rec(G); check('2. 舊存檔的手機：群組名、訊息換成新片名（只做一次）', G.phone.groups.zr_film.name==='進城的那一週'&&G.msgs[0].text==='明天去看《進城的那一週》。'&&G.phone.filmRen===1, JSON.stringify([G.phone.groups.zr_film.name,G.msgs[0].text])); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
