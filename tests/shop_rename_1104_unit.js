// 公館四間店改名（AA_647 第 6 節，企劃線 403b7c51c；使用者 11-04 01:0x 新店名）：日日便利→日和便利店、輪轉單車→慢輪單車、清葉茶行→青木茶室、舊路書房→頁間書屋。
// 規則：玩家看得到的字換新名；存檔當 key 用的店名（EAT.count／EAT.choose／EAT.ordered、SIDEQ 的 shop:、S.known、jobs3d S.EAT_KEY、story3d counter 的 ek）照舊用舊字——熟客次數、任務進度不歸零。
//   1 舊存檔：茶行點過 7 次、書店來過 5 次、車行找過 6 次 → 讀進來照樣「認得你」；再點一次記在同一個 key（8 次）
//   2 青木茶室外帶：桂花烏龍奶茶 70、柚香綠茶 60、春摘白茶 65（不賣珍珠）
//   3 任務標題、提示、店名顯示用新名；舊存檔相簿裡存下的舊標題讀檔換新（SIDEQ.renameMigrate，再讀一次不變）
//   4 玩家看得到的字：src/ 裡（去掉註解、上面那幾個 key）沒有舊店名；兩個自動產生、要改來源的檔另外列出（shop_enc.js＝AA 的 JSON、us_layouts.js＝LAWWW2 的 Blender 腳本）
//   5 便利商店：使用者 11-04 02:1x「所有便利商店都是24小時」（取代 AA_647 第 6 節的 07:00–24:00）——地點說明 24 小時、明軒清單那一句照原本、溫州街 A5 招牌 24H
// 修改前（開發分支 393712ba7）：第 2～5 項 FAIL。用法：node tests/shop_rename_1104_unit.js
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|LANE118_LAYOUT|PARK|WZ_PARK_LAYOUT|SIDEQ|MSG|MSG_POOL|MSG2_POOL|SISY23|SISY23_LINES|SISY23_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js','src/data/wz_park_layout.js','src/wzpark3d.js','src/wzshops3d.js','src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/sideq3d.js']) load(f);
const rd=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
let money=[]; GM.money=d=>{ money.push(d); H.G.money+=d; };
(async()=>{
  // ---- 1 舊存檔的熟客次數 ----
  { const G=H.fresh('2027-03-03',15,'gongguan',{}); const R=EAT.rec(G); R.n['清葉茶行']=7; R.n['舊路書房']=5; G.flags.BIKE_SHOP={n:6,day:1,g:0};
    check('1 舊存檔（茶行 7 次、書店 5 次、車行 6 次）：照樣認得你（S.known 用舊 key）',SIDEQ.known(G,'清葉茶行')&&SIDEQ.known(G,'舊路書房')&&SIDEQ.known(G,'輪轉單車'));
    SIDEQ.roll=()=>0.99; H.said=[]; H.opts=[]; H.picks=[0]; money=[]; G.money=5000; await STORY.interact({shop:'tea'},GM);
    check('1 在青木茶室再買一杯：次數記在同一個 key（清葉茶行 8 次），不是從 0 開始',EAT.count(G,'清葉茶行')===8&&EAT.rec(G).n['青木茶室']==null,J(EAT.rec(G).n));
  // ---- 2 外帶菜單 ----
    check('2 青木茶室外帶：桂花烏龍奶茶 70、柚香綠茶 60、春摘白茶 65（AA_647 第 6 節；不賣珍珠）',J((H.opts[0]||[]).slice(0,3))===J(['桂花烏龍奶茶　70 元','柚香綠茶　60 元','春摘白茶　65 元'])&&!/珍珠/.test(J(H.opts))&&J(money)===J([-70]),J({opts:H.opts,money})); }
  // ---- 3 任務標題、提示、顯示名、相簿 ----
  { const Q=SIDEQ.Q; check('3 順手的事標題：頁間書屋／慢輪單車／青木茶室（shop key 照舊）',Q.SQ15.title==='頁間書屋：一箱法律系的舊書'&&Q.SQ16.title==='慢輪單車：兩年沒人來牽的車'&&Q.SQ18.title==='青木茶室：二十杯的訂單'&&Q.SQ15.shop==='舊路書房'&&Q.SQ16.shop==='輪轉單車'&&Q.SQ18.shop==='清葉茶行',J([Q.SQ15.title,Q.SQ16.title,Q.SQ18.title]));
    check('3 店名顯示（SHOP_NAME 的值）：頁間書屋（公館）、青木茶室（公館）；key 照舊',SIDEQ.SHOP_NAME['舊路書房']==='頁間書屋（公館）'&&SIDEQ.SHOP_NAME['清葉茶行']==='青木茶室（公館）');
    check('3 提示：去頁間書屋、回公館的慢輪單車',/頁間書屋/.test(SIDEQ.hint('SQ15',{step:'sort'})||'')&&/慢輪單車/.test(SIDEQ.hint('SQ16',{step:'back'})||''),J([SIDEQ.hint('SQ15',{step:'sort'}),SIDEQ.hint('SQ16',{step:'back'})]));
    const s={album:[{kind:'memory',id:'side_SQ15',title:'舊路書房：一箱法律系的舊書'},{kind:'memory',id:'side_SQ18',title:'清葉茶行：二十杯的訂單'},{kind:'memory',id:'side_SQ12',title:'別的任務'},{kind:'cg',id:'x',title:'舊路書房'}]};
    const n=SIDEQ.renameMigrate(s), once=J(s), n2=SIDEQ.renameMigrate(s);
    check('3 舊存檔相簿裡的任務標題換新（只換順手的事、只換有舊店名的；再讀一次不變）',n===2&&n2===0&&J(s)===once&&s.album[0].title==='頁間書屋：一箱法律系的舊書'&&s.album[1].title==='青木茶室：二十杯的訂單'&&s.album[2].title==='別的任務'&&s.album[3].title==='舊路書房',J(s.album));
    check('3 game3d.js 讀檔的 migrate 呼叫 SIDEQ.renameMigrate',/SIDEQ\.renameMigrate\(s\)/.test(rd('src/game3d.js'))); }
  // ---- 4 玩家看得到的字沒有舊店名 ----
  { const OLD=/日日便利|輪轉單車|清葉茶行|舊路書房/;   /* 下面 KEYOK 的 note: '…'＝配置檔的 note 欄（遊戲不顯示；src/data/bike_layout.js「舊名輪轉單車」）*/
    const KEYOK=[/counter\(GM,'清葉茶行'/g,/'清葉茶行':'清葉茶行'/g,/EAT\.ordered\(GM,'舊路書房'/g,/SIDEQ\.atShop\(GM,'舊路書房'/g,/S\.EAT_KEY=\{[^}]*\}/g,/shop:'(舊路書房|輪轉單車|清葉茶行)'/g,/'(舊路書房|清葉茶行|輪轉單車)':'(頁間書屋（公館）|青木茶室（公館）|書店老闆|茶行老闆娘|車行老闆)'/g,
      /key==='輪轉單車'/g,/ek==='清葉茶行'/g,/source:'[^']*'/g,/S\.atShop\(GM,'輪轉單車'/g,/S\.RENAME_1104=\{[^}]*\}/g,/note: '[^']*'/g,/replace\(\/[^/]+\/g,'[^']+'\)/g];
    const GEN={'src/data/shop_enc.js':'AA 的 shop_enc JSON（tools/shop_enc/import_shop_enc.py 產生，不手改）','src/data/us_layouts.js':'LAWWW2 的 gen_us_layouts.py（機場便利商店招牌）'};
    const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/.*$/mg,'$1');
    const bad=[], gen=[]; const walk=d=>{ for(const f of fs.readdirSync(path.join(H.ROOT,d))){ const p=d+'/'+f; if(fs.statSync(path.join(H.ROOT,p)).isDirectory()){ walk(p); continue; } if(!/\.js$/.test(f)) continue;
        let s=strip(rd(p)); for(const re of KEYOK) s=s.replace(re,''); if(!OLD.test(s)) continue; if(GEN[p]){ gen.push(p); continue; } const ln=s.split('\n').filter(l=>OLD.test(l)).map(l=>l.trim().slice(0,90)); bad.push([p,ln]); } };
    walk('src');
    check('4 src/ 裡玩家看得到的字沒有舊店名（註解、存檔 key 除外）',!bad.length,J(bad));
    check('4 還有舊店名、要改來源的自動產生檔：只剩 us_layouts.js（LAWWW2）；shop_enc.js 已照 tools/story/aa647_fix.json 重新匯入',gen.every(p=>GEN[p])&&!gen.includes('src/data/shop_enc.js'),J(gen.map(p=>p+'：'+GEN[p]))); console.log('　（待改來源）'+gen.map(p=>p+'＝'+GEN[p]).join('；'));
    check('4 地點名、快速移動、大地圖：日和便利店、頁間書屋、慢輪單車',PLACES.names.cvs==='日和便利店'&&PLACES.names.bookstore==='頁間書屋'&&PLACES.names.bikeshop==='慢輪單車'&&/\['cvs','日和便利店'/.test(rd('src/data/places.js'))&&/\['bookstore','頁間書屋'\],\['cvs','日和便利店'\]/.test(rd('src/placemap3d.js')));
    check('4 打工：頁間書屋的班、頁間書屋的老闆（JOBS 的 key books、薪水照舊 784）',/books:\{ name:'頁間書屋', short:'頁間書屋'[^\n]*contact:'頁間書屋的老闆'[^\n]*title:'頁間書屋的班'/.test(rd('src/data/wz_jobs.js'))&&/pay:784, payToast:'頁間書屋 薪水 784 元'/.test(rd('src/data/wz_jobs.js'))); }
  // ---- 5 便利商店 ----
  { check('5 便利商店的地點說明 24 小時（使用者 11-04 02:1x）',PLACES.hours.cvs&&PLACES.hours.cvs.text==='24 小時');
    const row=STORY.MX_FM1.rows[6]; check('5 明軒的清單第 7 家：日和便利店、「最後一名。可是它二十四小時開。最後一名是留給半夜的。」（24 小時＝原本那一句）',row[0]==='日和便利店'&&row[3]==='最後一名。可是它二十四小時開。最後一名是留給半夜的。',J(row));
    const z=rd('src/zones3d.js'); check('5 溫州街 A5 招牌：日和便利店、24H；看便利商店那一句改新名',/wz:'A5'[^\n]*name:'日和便利店',sub:'24H',signBg/.test(z)&&/look:'日和便利店的自動門開了又關。/.test(z)); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
