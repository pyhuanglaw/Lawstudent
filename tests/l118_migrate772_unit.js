// L118-SHOPS-REDO-1111（使用者 2026-11-11 X338；AA_772）：讀檔時的兩支遷移——
//   1. SLOWREAD.migrate（src/slowread3d.js）：慢讀咖啡整套搬到木曜日——已經排好、地點是 slowread 的邀約（G.invites）改去 wz_mokuyobi；
//      還沒見面的（offered／changed／accepted／going）時間不在木曜日開的時段（13:00～20:30 開始、週二休）＝取消（cancelled，可以再約）；見過的、別的地點不動；冪等。
//   2. SIDEQ.contact772（src/sideq3d.js）：SQ17 那位聯絡人改名（AA_772 第 43 列）——存檔裡存下的舊名字換成現在的；冪等；沒有舊名字的存檔不動。
// 只驗遷移本身（不跑整個遊戲）。用法：node tests/l118_migrate772_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x);
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(LANE118_SHOPS|LANE118_LAYOUT|L118_REDO|SLOWREAD|SIDEQ|INVITE_DATA|CALENDAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/data/invites.js','src/slowread3d.js','src/sideq3d.js']) load(f);
const R=require('./l118_redo772_expect.js');
// ---------- 1. SLOWREAD.migrate ----------
{ const P=INVITE_DATA.places.find(p=>p.id==='slowread');
  check('1. 邀約地點 slowread 現在在木曜日（wz_mokuyobi）、13:00～22:00、週二休、坐一個半小時',!!P&&P.zone==='wz_mokuyobi'&&J(P.hours)===J([13,22])&&J(P.off)===J([2])&&P.stay===1.5&&P.zone===SLOWREAD.ZONE,J(P&&[P.zone,P.hours,P.off,P.stay]));
  const wdOf=d=>CALENDAR.dateOf(d).wd%7; let tue=null, wed=null; for(let d=40;d<60;d++){ if(tue==null&&wdOf(d)===2) tue=d; if(wed==null&&wdOf(d)===3) wed=d; }
  const oldName=Object.keys(R.rename).find(k=>R.rename[k]==='木曜日');
  const mk=()=>({invites:[
    {id:'iv1',who:'heroine_01',place:'slowread',zone:'l118_cafe2',day:wed,h:15.5,state:'accepted',accepted:true},                 // 木曜日開著的時間：改去木曜日、照約
    {id:'iv2',who:'heroine_03',place:'slowread',zone:'l118_cafe2',day:wed,h:12+10/60,state:'accepted',accepted:true},              // 12:10：木曜日 13:00 才開＝取消
    {id:'iv3',who:'heroine_05',place:'slowread',zone:'l118_cafe2',day:wed,h:10,state:'offered',by:'npc',label:'書瑀約你去'+oldName},   // npc 約的、早上 10:00＝取消；標題換字
    {id:'iv4',who:'kexin',place:'slowread',zone:'l118_cafe2',day:tue,h:15.5,state:'changed'},                                       // 週二（木曜日休）＝取消
    {id:'iv5',who:'heroine_04',place:'slowread',zone:'l118_cafe2',day:wed-7,h:10,state:'done',done:true},                           // 已經見過面的：只換區域、不取消
    {id:'iv6',who:'heroine_02',place:'slowread',zone:'l118_cafe2',day:wed,h:20.5,state:'going'},                                    // 20:30 開始（坐到 22:00）＝可以
    {id:'iv7',who:'heroine_02',place:'slowread',zone:'l118_cafe2',day:wed,h:21,state:'accepted'},                                   // 21:00 開始坐不滿＝取消
    {id:'iv8',who:'heroine_01',place:'cafe',zone:'cafe',day:wed,h:10,state:'accepted'}]});                                          // 別的地點：不動
  const s=mk(), other0=J(s.invites[7]); const n1=SLOWREAD.migrate(s), a1=J(s), n2=SLOWREAD.migrate(s), a2=J(s); const iv=k=>s.invites[k-1];
  check('1. 地點是 slowread 的七筆區域都改成 wz_mokuyobi；別的地點那一筆一個字都沒動',[1,2,3,4,5,6,7].every(k=>iv(k).zone==='wz_mokuyobi')&&J(iv(8))===other0,J(s.invites.map(x=>x.zone)));
  check('1. 還沒見面、時間在木曜日開的時段（週三 15:30、20:30）：照約（狀態不變）',iv(1).state==='accepted'&&iv(6).state==='going');
  check('1. 還沒見面、時間對不上（12:10、10:00、21:00 坐不滿、週二公休）＝cancelled',iv(2).state==='cancelled'&&iv(3).state==='cancelled'&&iv(7).state==='cancelled'&&iv(4).state==='cancelled',J(s.invites.map(x=>x.state)));
  check('1. 已經見過面的那一筆不取消（done 照舊）',iv(5).state==='done'&&iv(5).done===true);
  check('1. npc 約的那一則標題裡的舊店名換成木曜日',iv(3).label==='書瑀約你去木曜日'&&!!oldName,iv(3).label);
  check('1. 做第二次什麼都不變（冪等）',n1>0&&n2===0&&a1===a2,J([n1,n2]));
  const live=x=>['offered','changed','accepted','going'].includes(x.state);
  check('1. 取消的那幾筆不再是進行中的邀約（之後可以再約同一個人去木曜日）：進行中的只剩 iv1、iv6、iv8',J(s.invites.filter(live).map(x=>x.id))===J(['iv1','iv6','iv8']));
  let err=null; try{ SLOWREAD.migrate({}); SLOWREAD.migrate({invites:null}); SLOWREAD.migrate({invites:[null,{place:'slowread'},{place:'slowread',state:'accepted',day:'x',h:null}]}); SLOWREAD.migrate(null); }catch(e){ err=e; }
  check('1. 沒有 invites、壞掉的資料：不出錯',!err,String(err));
  check('1. 讀檔有接上（src/game3d.js migrate 叫 SLOWREAD.migrate）',/SLOWREAD\.migrate\(s\)/.test(fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'))); }
// ---------- 2. SIDEQ.contact772 ----------
{ const row=R.d.fix.find(r=>r.file==='src/sideq3d.js'&&/聯絡人/.test(r.note||'')), OLD=row&&row.old, NEW=row&&row.new;
  check('2. AA_772 有 SQ17 聯絡人改名那一列；遊戲裡現在的名字＝新的那個',!!row&&fs.readFileSync(path.join(ROOT,'src/sideq3d.js'),'utf8').includes("contact:'"+NEW+"'"),J(row));
  const mk=()=>({msgs:[{th:'p:tea118_staff',from:'tea118_staff',name:OLD,text:'上了。京都。'},{th:'p:zhe',from:'zhe',text:'中午 118？'}],contacts:{tea118_staff:{name:OLD,day:400},zhe:{name:'阿哲'}},invites:[{id:'iv1',label:'x'}],
    outings:[{id:'o1',title:'和'+OLD+'見面'}],album:[],flags:{note:OLD}});
  const s=mk(); const n1=SIDEQ.contact772(s), a1=J(s), n2=SIDEQ.contact772(s);
  check('2. 存檔裡存下的舊名字（手機訊息、聯絡人、出遊標題）都換成現在的；句子裡其他字不動',s.msgs[0].name===NEW&&s.contacts.tea118_staff.name===NEW&&s.outings[0].title==='和'+NEW+'見面'&&s.msgs[0].text==='上了。京都。'&&s.contacts.zhe.name==='阿哲'&&n1===3,J([n1,s.msgs[0],s.contacts,s.outings]));
  check('2. 只換 msgs／inv／contacts／phone／threads／outings 這幾格，別的地方（flags）不碰',s.flags.note===OLD);
  check('2. 做第二次什麼都不變（冪等）',n2===0&&a1===J(s));
  const t={msgs:[{from:'zhe',text:'中午 118？'}],contacts:{zhe:{name:'阿哲'}}}, t0=J(t); const n3=SIDEQ.contact772(t); let err=null; try{ SIDEQ.contact772(null); SIDEQ.contact772({}); SIDEQ.contact772({msgs:null,contacts:[null,1,'x']}); }catch(e){ err=e; }
  check('2. 沒有舊名字的存檔一個字都不動；空的、壞掉的存檔不出錯',n3===0&&J(t)===t0&&!err,String(err));
  const al={album:[{kind:'memory',id:'side_SQ17',title:R.fix(row?'':'')||'x'}],msgs:[{name:OLD}]}; SIDEQ.renameMigrate(al);
  check('2. 讀檔的 SIDEQ.renameMigrate 會一起做（src/game3d.js migrate 叫它）',al.msgs[0].name===NEW&&/SIDEQ\.renameMigrate\(s\)/.test(fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'))); }
console.log(fails?('\n有 '+fails+' 項失敗'):'\n全部通過'); process.exit(fails?1:0);
