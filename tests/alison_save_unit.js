// AA380 改名 Alison（使用者 2026-10-21 23:2x「改成Alison」）：舊存檔裡已經存下的舊名——不需要瀏覽器。
//   v9.10.4 以前的存檔，手機訊息、群組名、出遊標題、約的標籤、記憶備註、目標存的是舊名；程式改名以後這些字不會自己變。
//   1 SOCIAL.alisonSave：上面每一種欄位都換成 Alison（和中文字之間半形空格、挨標點不空，同匯入工具）
//   2 只換字：人物 id yu、記號 tag、旗標、其他欄位不動；沒有舊名的存檔原封不動；再跑一次不再改（換過的沒有舊名）
//   3 game3d.js 的 migrate（讀檔、匯入都走這裡）呼叫 SOCIAL.alisonSave
//   4 人物面板：舊存檔沒經過讀檔的記憶備註（直接呼叫 noteShown）也顯示 Alison（AA_350 N9 的對照表照樣對得到）
// 修改前（開發分支 27de6170）：沒有 SOCIAL.alisonSave（1～3 FAIL）、note_n9 第 4 項 FAIL。用法：node tests/alison_save_unit.js
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..'); let fails=0;
const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/social3d.js'),'utf8').replace(/^const SOCIAL\s*=/m,'globalThis.SOCIAL='),{filename:'social3d.js'});
const OLD='小語', J=JSON.stringify, clone=o=>JSON.parse(J(o));
const oldSave=()=>({v:3,name:'舊版玩家',day:420,hour:21,zone:'dorm',goal:'晚上和'+OLD+'對報告',flags:{met_yu:true,YU_ALONE:true},
  msgs:[{th:'g:law',from:'zhe',text:OLD+'說她明天不來。',tag:'g1'},{th:'p:yu',from:'yu',text:'（'+OLD+'傳了一張照片）',tag:'p1'},
    {th:'p:zhe',from:'zhe',text:'你要不要跟'+OLD+'說？',tag:'a1',ask:{id:'a1',opts:[{t:'跟'+OLD+'說。',say:[{th:'p:zhe',from:'zhe',text:'好，'+OLD+'會懂。'}]},{t:'不要。'}]}},
    {th:'p:an',from:'heroine_01',text:'沒事。',tag:'n1'}],
  phone:{groups:{g_yz:{name:'阿哲、'+OLD+'、祐廷'}},q:[{th:'p:yu',from:'yu',text:OLD+'：明天見。'}],seen:{},n:3},
  outings:[{id:'y3_yu5_video',title:OLD+'打視訊來（日本 11:00）',place:'視訊',back:'視訊結束。',state:'done',day:400,h:10}],
  invites:[{who:'yu',label:'和'+OLD+'去 Café',day:410,h:15,state:'done'}],
  social:{mem:{heroine_02:[{tag:'ZHIRUO_MET_YU',note:'告訴她戲院旁邊的女生是'+OLD,day:300}],yu:[{tag:'FIRST_MET',note:'campus',day:10}]}}});
/* 1 */
check('0. 有 SOCIAL.alisonSave、SOCIAL.alison',typeof SOCIAL.alisonSave==='function'&&typeof SOCIAL.alison==='function');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const s=oldSave(), n=SOCIAL.alisonSave(s);
check('1. 手機訊息（群組、私訊、回覆選項、回覆後的句子）換成 Alison',s.msgs[0].text==='Alison 說她明天不來。'&&s.msgs[1].text==='（Alison 傳了一張照片）'&&s.msgs[2].text==='你要不要跟 Alison 說？'&&s.msgs[2].ask.opts[0].t==='跟 Alison 說。'&&s.msgs[2].ask.opts[0].say[0].text==='好，Alison 會懂。',J(s.msgs.slice(0,3)));
check('1. 手機佇列、群組名',s.phone.q[0].text==='Alison：明天見。'&&s.phone.groups.g_yz.name==='阿哲、Alison、祐廷',J(s.phone));
check('1. 出遊標題、約的標籤、記憶備註、目標',s.outings[0].title==='Alison 打視訊來（日本 11:00）'&&s.invites[0].label==='和 Alison 去 Café'&&s.social.mem.heroine_02[0].note==='告訴她戲院旁邊的女生是 Alison'&&s.goal==='晚上和 Alison 對報告',J([s.outings[0].title,s.invites[0].label,s.social.mem.heroine_02[0].note,s.goal]));
check('1. 存檔裡一個舊名都不剩；換了 11 處（訊息 5、佇列 1、群組名 1、出遊標題 1、約的標籤 1、備註 1、目標 1）',J(s).indexOf(OLD)<0&&n===11,n);
/* 2 */
const o=oldSave();
check('2. id、記號、旗標、其他欄位不動',s.msgs[1].th==='p:yu'&&s.msgs[1].from==='yu'&&s.invites[0].who==='yu'&&s.outings[0].id==='y3_yu5_video'&&s.social.mem.heroine_02[0].tag==='ZHIRUO_MET_YU'&&J(s.flags)===J(o.flags)&&s.msgs[3].text===o.msgs[3].text&&J(s.social.mem.yu)===J(o.social.mem.yu)&&s.day===o.day&&s.zone===o.zone);
const s2=clone(s), n2=SOCIAL.alisonSave(s2);
check('2. 再跑一次不再改（換過的沒有舊名）',n2===0&&J(s2)===J(s),n2);
const plain={v:3,day:5,hour:9,goal:'去上課',msgs:[{th:'p:zhe',text:'Alison 說她明天不來。'}],flags:{},phone:{groups:{},q:[]}}, p0=J(plain);
check('2. 沒有舊名的存檔原封不動；資料壞掉（null、不是陣列）不丟例外',SOCIAL.alisonSave(plain)===0&&J(plain)===p0&&SOCIAL.alisonSave(null)===0&&SOCIAL.alisonSave({msgs:{},phone:null,outings:[null],social:{mem:{yu:null}}})===0);
/* 3 */
const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); const i=g.indexOf('function migrate(s)'), j=g.indexOf('s.v=SAVE_VER; return s; }',i);
check('3. game3d.js 的 migrate 呼叫 SOCIAL.alisonSave（讀檔、匯入都走 applySave → migrate）',i>0&&j>i&&g.slice(i,j).indexOf('SOCIAL.alisonSave(s)')>0&&/applySave[\s\S]{0,200}migrate\(/.test(g));
/* 4 */
check('4. 人物面板：沒經過讀檔的舊備註也顯示 Alison；N9 對照表照樣對得到（新的是空字串＝不顯示）',SOCIAL.noteShown('heroine_02',{tag:'ZHIRUO_MET_YU',note:'告訴她戲院旁邊的女生是'+OLD})===''&&SOCIAL.noteShown('yu',{tag:'X_TEST',note:'和'+OLD+'吃早餐'})==='和 Alison 吃早餐');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
