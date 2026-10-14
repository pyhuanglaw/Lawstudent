// 舊存檔的女主角初遇修正（D61，使用者 2026-10-14 同意放正式版的六個條件；src/game3d.js 的 relabelFirstMet、firstMetMigrate）——不需要瀏覽器。
//   ①遷移前先備份（這個存檔專用、不會被蓋掉的 fatiao3d_backup_fm120_<savedAt>＋fatiao3d_backup）；備份寫不進去就這次先不改、下次再試
//   ②只改一般搭話提前記下的 FIRST_MET（只限芷若、語彤、子晴；以安、溫學姊、一般同學不動），連同同一次記下的 met_ 旗標
//   ③正式初遇事件（或她的任何事件）播過的不動
//   ④熟悉度等關係、事件紀錄、其他記憶、其他旗標、選擇都不動
//   ⑤可以重複執行：改過一次（fm120）再讀不會再改、備份不會被重寫
//   ⑥舊存檔、新存檔（現在的版本正常相遇過）、資料壞掉（社交資料不是物件、記憶不是陣列或有 null、事件紀錄壞掉、沒有旗標）：不丟例外；無法確定時不改
// 瀏覽器版（真的讀檔流程、標題畫面「繼續」）：tests/save_firstmet_migration.py
// 用法：node tests/save_firstmet_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8').replace(/^const (STORY_EVENTS|SMALLTALK)\s*=/mg,'globalThis.$1='),{filename:'events.js'});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
/* 從 game3d.js 抽出那一段原始碼來跑（整個 game3d 要瀏覽器才載得進來）；read／write 換成假的 localStorage */
const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); const i=src.indexOf('  const MEET_EVENTS='), j=src.indexOf('  GM.firstMetMigrate=firstMetMigrate;');
check('game3d.js 找得到 relabelFirstMet、firstMetMigrate',i>0&&j>i);
const store={}; let failKeys=null, writes=[];
const read=k=>store[k]?JSON.parse(store[k]):null, write=(k,o)=>{ if(failKeys&&failKeys.test(k)) return false; writes.push(k); store[k]=JSON.stringify(o); return true; };
const warns=[]; const con={warn:(...a)=>warns.push(a.join(' '))};
const M=vm.runInThisContext('(function(read,write,KEY_BACKUP,GM,console){'+src.slice(i,j)+' return {relabelFirstMet,firstMetMigrate}; })')(read,write,'fatiao3d_backup',{},con);
const clone=o=>JSON.parse(JSON.stringify(o)), same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const reset=()=>{ for(const k in store) delete store[k]; failKeys=null; writes=[]; warns.length=0; };
// 舊版玩家的存檔：芷若是一般自我介紹認識的（FIRST_MET＋met_ 旗標、熟悉度 12），子晴是吉他社事件認識的，語彤一起吃過飯；以安、學姊、一般同學也有 FIRST_MET
const oldSave=()=>({v:2,name:'舊版玩家',day:20,hour:15,zone:'campus',savedAt:1760000000000,flags:{introDone:true,met_heroine_02:true,met_heroine_04:true,met_heroine_03:true,met_heroine_01:true,met_classmate_bohan:true,lawclub:true},choices:{whyLaw:'ok'},
  events:{done:{ev_ziqing_club:1,ev_an_lunch:1},last:{ev_ziqing_club:6},count:2},
  social:{rel:{heroine_02:{fam:12,trust:3,comf:2},heroine_03:{fam:20,trust:8},heroine_04:{fam:15},heroine_01:{fam:40}},
    mem:{heroine_02:[{tag:'FIRST_MET',day:4,note:'campus'},{tag:'ADJUST',day:4,note:''}],heroine_03:[{tag:'FIRST_MET',day:6,note:'library'},{tag:'SHARED_MEAL',day:7,note:'麵店'}],heroine_04:[{tag:'FIRST_MET',day:6,note:'wancai'}],
      heroine_01:[{tag:'FIRST_MET',day:2,note:'campus'}],heroine_05:[{tag:'FIRST_MET',day:3,note:'wancai'}],classmate_bohan:[{tag:'FIRST_MET',day:5,note:'linze'}]},
    reveal:{heroine_02:'ACQUAINTANCE',classmate_bohan:'ACQUAINTANCE'},prof:{},grad:{interest:'NONE',field:null,prep:0}}});
// ---------- ② ③ ④ 改哪些、不改哪些 ----------
{ const s=oldSave(), before=clone(s), out=M.relabelFirstMet(s);
  check('② 只改芷若（一般自我介紹留下的 FIRST_MET，她的相遇事件沒播過）',same(out,['heroine_02'])&&s.social.mem.heroine_02[0].tag==='GREETED',JSON.stringify(out));
  check('② 芷若同一次記下的 met_ 旗標也拿掉（人物名單和 FIRST_MET 一致：之後正式相遇才出現）',!('met_heroine_02' in s.flags));
  check('③ 子晴：吉他社初遇播過 → 不動（FIRST_MET、met_ 旗標都在）',s.social.mem.heroine_04[0].tag==='FIRST_MET'&&s.flags.met_heroine_04===true);
  check('③ 語彤：已經有一起吃飯的記憶 → 不動',s.social.mem.heroine_03[0].tag==='FIRST_MET'&&s.flags.met_heroine_03===true);
  check('② 以安、溫學姊、一般同學（柏翰）只有 FIRST_MET 也不動（不在這次修正的範圍）',s.social.mem.heroine_01[0].tag==='FIRST_MET'&&s.social.mem.heroine_05[0].tag==='FIRST_MET'&&s.social.mem.classmate_bohan[0].tag==='FIRST_MET'&&s.flags.met_heroine_01&&s.flags.met_classmate_bohan);
  check('④ 關係（熟悉度、信任…）完全沒變',same(s.social.rel,before.social.rel),JSON.stringify(s.social.rel.heroine_02));
  check('④ 事件紀錄、選擇、揭露階段、教授、志向沒變',same(s.events,before.events)&&same(s.choices,before.choices)&&same(s.social.reveal,before.social.reveal)&&same(s.social.prof,before.social.prof)&&same(s.social.grad,before.social.grad));
  const f0=clone(before.flags); delete f0.met_heroine_02;
  check('④ 其他旗標沒變（只少了芷若的 met_）',same(s.flags,f0));
  check('④ 芷若的其他記憶（ADJUST）、日期、備註不變，只有 tag 換成 GREETED',s.social.mem.heroine_02.length===2&&s.social.mem.heroine_02[0].day===4&&s.social.mem.heroine_02[0].note==='campus'&&s.social.mem.heroine_02[1].tag==='ADJUST');
  check('⑤ 記下 fm120',s.social.fm120===true); }
{ const s=oldSave(); s.events.done.ev_cafe_barista_zhiruo=1; const out=M.relabelFirstMet(s);
  check('③ 芷若的正式初遇（兩點半）播過 → 不動',!out.includes('heroine_02')&&s.social.mem.heroine_02[0].tag==='FIRST_MET'&&s.flags.met_heroine_02===true); }
{ const s=oldSave(); const other=STORY_EVENTS.find(e=>(e.participants||[]).includes('heroine_02')&&!['ev_cafe_barista_zhiruo','ev_zhiruo_ge_group'].includes(e.id)); s.events.done[other.id]=1; const out=M.relabelFirstMet(s);
  check('③ 芷若的其他事件（'+other.id+'）播過 → 不動',!out.includes('heroine_02')); }
// ---------- ⑤ 重複執行 ----------
{ const s=oldSave(); M.relabelFirstMet(s); const once=clone(s); const out2=M.relabelFirstMet(s);
  check('⑤ 改過的存檔再跑一次：什麼都不改',out2.length===0&&same(s,once));
  s.social.mem.heroine_02.unshift({tag:'FIRST_MET',day:21,note:'cafe'}); s.events.done.ev_cafe_barista_zhiruo=1; const snap=clone(s); const out3=M.relabelFirstMet(s);
  check('⑤ 之後正式相遇了（FIRST_MET 又記下）、再讀檔：不會又被改掉',out3.length===0&&same(s,snap)); }
// ---------- ① 備份（firstMetMigrate）----------
{ reset(); const raw=oldSave(), s=clone(raw); const r=M.firstMetMigrate(s,raw);
  check('① 有要改：先寫備份（這個存檔專用的 fatiao3d_backup_fm120_<savedAt>＋fatiao3d_backup），內容和讀進來的原始存檔一模一樣',same(read('fatiao3d_backup_fm120_1760000000000'),raw)&&same(read('fatiao3d_backup'),raw),writes.join(','));
  check('① 回傳改好的存檔（原本的物件不動）',r.social.mem.heroine_02[0].tag==='GREETED'&&s.social.mem.heroine_02[0].tag==='FIRST_MET'&&r.social.fm120===true);
  const r2=M.firstMetMigrate(clone(r),r);
  check('⑤ 改好的存檔再讀一次：不再改、不再寫備份（專用備份還是最早那一份）',same(r2,r)&&writes.length===2&&same(read('fatiao3d_backup_fm120_1760000000000'),raw),writes.join(','));
  store.fatiao3d_backup=JSON.stringify({other:'之後存到欄位時備份的別的存檔'}); writes=[]; const r3=M.firstMetMigrate(clone(raw),raw);
  check('① 同一份舊存檔（例如欄位裡沒被覆寫的）再讀一次：照樣改，專用備份不重寫（還是最早那份）',r3.social.mem.heroine_02[0].tag==='GREETED'&&!writes.includes('fatiao3d_backup_fm120_1760000000000')&&same(read('fatiao3d_backup_fm120_1760000000000'),raw),writes.join(',')); }
{ reset(); failKeys=/^fatiao3d_backup/; const raw=oldSave(), s=clone(raw); const r=M.firstMetMigrate(s,raw);
  check('① 備份寫不進去（儲存空間滿了）：這次先不改、不記 fm120（下次讀檔再試），有警告',r.social.mem.heroine_02[0].tag==='FIRST_MET'&&!r.social.fm120&&r.flags.met_heroine_02===true&&warns.length===1,warns[0]);
  failKeys=null; const r2=M.firstMetMigrate(clone(r),raw);
  check('① 之後備份寫得進去了：再讀檔就改',r2.social.mem.heroine_02[0].tag==='GREETED'&&same(read('fatiao3d_backup_fm120_1760000000000'),raw)); }
{ reset(); const raw=oldSave(); raw.events.done.ev_cafe_barista_zhiruo=1; raw.social.mem.heroine_02.push({tag:'CAFE_TALK',day:5}); const r=M.firstMetMigrate(clone(raw),raw);
  check('① 沒有要改的存檔：不寫任何備份（只記 fm120）',writes.length===0&&r.social.fm120===true&&r.social.mem.heroine_02[0].tag==='FIRST_MET'); }
// ---------- ⑥ 新存檔、壞掉的存檔 ----------
{ reset(); const s={v:2,name:'新玩家',day:9,hour:12,zone:'cafe',savedAt:1760500000000,flags:{introDone:true,met_heroine_02:true},choices:{},events:{done:{ev_cafe_barista_zhiruo:1},last:{ev_cafe_barista_zhiruo:9},count:1},
    social:{rel:{heroine_02:{fam:5}},mem:{heroine_02:[{tag:'FIRST_MET',day:9,note:'cafe'}]},reveal:{},prof:{},grad:{interest:'NONE',field:null,prep:0}}};
  const before=clone(s); const r=M.firstMetMigrate(clone(s),s); const r0=clone(r); delete r0.social.fm120;
  check('⑥ 新存檔（現在的版本、在兩點半正常相遇）：什麼都不改、不寫備份',same(r0,before)&&writes.length===0); }
{ reset(); const s={v:2,name:'新玩家',day:1,hour:21.2,zone:'dorm',flags:{},choices:{},events:{done:{},last:{},count:0},social:{rel:{},mem:{},reveal:{},prof:{},grad:{interest:'NONE',field:null,prep:0}}};
  const r=M.firstMetMigrate(clone(s),s); check('⑥ 新遊戲第一天的存檔：不改、不寫備份',same(r.social.mem,{})&&writes.length===0&&r.social.fm120===true); }
const bad=[
  ['social 是 null',s=>{ s.social=null; }],
  ['social 是字串',s=>{ s.social='壞掉'; }],
  ['mem 是字串',s=>{ s.social.mem='壞掉'; }],
  ['mem 是陣列',s=>{ s.social.mem=[1,2]; }],
  ['芷若的記憶不是陣列',s=>{ s.social.mem.heroine_02={tag:'FIRST_MET'}; }],
  ['芷若的記憶裡有 null',s=>{ s.social.mem.heroine_02.push(null); }],
  ['芷若的記憶裡有數字',s=>{ s.social.mem.heroine_02.unshift(7); }],
  ['events 是 null',s=>{ s.events=null; }],
  ['events 沒有 done',s=>{ s.events={last:{},count:0}; }],
  ['events.done 是字串',s=>{ s.events.done='壞掉'; }],
  ['沒有 flags',s=>{ delete s.flags; }],
  ['整個存檔是 null',null],
];
for(const [name,f] of bad){ reset(); let raw=f?oldSave():null; if(f) f(raw); let r=null, err=null; try{ r=raw?M.firstMetMigrate(clone(raw),raw):M.relabelFirstMet(raw); }catch(e){ err=e; }
  const zr=r&&r.social&&r.social.mem&&Array.isArray(r.social.mem.heroine_02)?r.social.mem.heroine_02.filter(m=>m&&typeof m==='object').map(m=>m.tag):null;
  const changed=!!(zr&&zr.includes('GREETED'));
  const expectChange=name==='沒有 flags';   /* 只少了 flags：照樣可以判斷（事件紀錄、記憶都在），改了也不會出錯 */
  check('⑥ 壞掉的存檔（'+name+'）：不丟例外；'+(expectChange?'照樣修正':'無法確定時不改'),!err&&(expectChange?changed:!changed),err?String(err):JSON.stringify(zr)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
