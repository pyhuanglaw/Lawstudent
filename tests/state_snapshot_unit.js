// TEST-TRACE-1104（USER_WANTS X211，使用者 11-04 04:4x 對 BB；BB_256）：GM.stateSnapshot（src/game3d.js）——測試失敗時存一份遊戲狀態，唯讀。不需要瀏覽器。
// 檢查：1. 欄位齊全（zone、day、hour、pos、player、busyDepth、dlg、adv、phone、lastTalkError、flags、invites、npcs）2. 唯讀：快照前後 G、玩家、深度都沒變；flags 是深拷貝
//   3. 拿不到的東西（沒有玩家、ADV 未定義、flags 有循環）給 null，不丟例外。修改前：沒有 GM.stateSnapshot，全部 FAIL。用法：node tests/state_snapshot_unit.js
const fs=require('fs'), path=require('path'); const src=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const m=src.match(/GM\.stateSnapshot=function\(\)\{[\s\S]*?return S; \};/);
check('0. 找得到 GM.stateSnapshot',!!m); if(!m){ console.log('FAILED '+fails); process.exit(1); }
const mk=(o)=>{ const GM={lastTalkError:o.lte||null}; const f=new Function('GM','G','E','D','phoneOpen','entering','STORY','EVENTS','ADV',m[0]+'; return GM;');
  return f(GM,o.G,o.E,o.D,!!o.phone,!!o.entering,{dateKey:G=>'2025-10-'+G.day},{running:false},o.ADV); };
const G={zone:'library_hall',day:35,hour:15.4,goal:'—',money:500,flags:{a:1,n:{b:[1,2]}},invites:[{who:'heroine_02',place:'library',h:15,state:'accepted',day:35,lead:{ph:'go'}},{who:'x',day:30,state:'done'}]};
const P={obj:{position:{x:1.234,z:-2.5,y:0},rotation:{y:0.5}},lv:1,busy:false,pose:'idle',seat:null,path:null};
const E={player:P,paused:false,npcs:[{charId:'heroine_02',obj:{position:{x:2,z:3}},lv:1,beh:'idle',frozen:true,_talking:false},{obj:{position:{x:0,z:0}}}]};
const D={busyDepth:0,active:false};
{ const GM=mk({G,E,D,ADV:{active:false},lte:{label:'和芷若說話',msg:'boom',at:1}}); const before=JSON.stringify([G,P.obj,D]); const S=GM.stateSnapshot();
  const keys=['zone','day','hour','dateKey','pos','player','paused','busyDepth','dlg','adv','events','phone','entering','lastTalkError','goal','money','flags','invites','npcs'];
  check('1. 欄位齊全',keys.every(k=>k in S)&&S.zone==='library_hall'&&S.day===35&&S.pos.x===1.23&&S.pos.lv===1&&S.busyDepth===0&&S.lastTalkError.msg==='boom'&&S.invites.length===1&&S.invites[0].lead===true&&S.npcs.length===1&&S.npcs[0].frozen===true,JSON.stringify(S));
  S.flags.a=99; S.flags.n.b.push(3); S.lastTalkError.msg='x';
  check('2. 唯讀：快照前後 G、玩家、深度都沒變；改快照不會改到遊戲（flags 深拷貝）',JSON.stringify([G,P.obj,D])===before&&G.flags.a===1&&G.flags.n.b.length===2&&GM.lastTalkError.msg==='boom');
  check('2. 可以 JSON.stringify（存成檔案）',(()=>{ try{ return JSON.stringify(S).length>0; }catch(e){ return false; } })()); }
{ const cyc={}; cyc.self=cyc; const G2=Object.assign({},G,{flags:cyc}); let S=null, err=null;
  try{ S=mk({G:G2,E:{npcs:null},D,ADV:undefined}).stateSnapshot(); }catch(e){ err=e; }
  check('3. 沒有玩家、ADV 未定義、flags 有循環：不丟例外，拿不到的給 null',!err&&S&&S.pos===null&&S.player===null&&S.flags===null&&S.adv===null&&S.zone==='library_hall',String(err||JSON.stringify(S))); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
