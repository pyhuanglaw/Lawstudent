// LOADGEN-LOCKS-1028（BB-C 2026-10-28 08:08 sh_reload_lg3，d41f5025b）：讀檔以後，凍住的舊劇情佔著的鎖都要放開——不需要瀏覽器。
//   起因：LOAD-GEN-ABORT-1028（c1e7a32d7）讀檔時舊劇情凍住（sleep、走路、對話框、選單永遠不 resolve，不會在新的一局接著演、寫旗標——這一點照舊）；
//   可是凍住的流程永遠走不到自己的 finally，finally 才放開的鎖就一直留著：closed2_3d.js 的 busy（讀檔以後阿姨諮詢再也不開始）、
//   EVENTS.running（之後每一個 EVENTS.run 一進去就 return＝劇情事件全死）、ADV 一直開著（EVENTS.tick 不跑、2D 蓋在畫面上）、其他四十個模組同寫法。
//   做法：各模組宣告鎖的下一行登記 globalThis.LOADLOCKS['模組:鎖']＝只把旗標設回初始值的函式（不靠 game3d.js 先載入，Node 測試一樣；同一個鍵＝同一個檔載兩次不累積）；
//   game3d.js applySave 換 G 之前 loadRelease()：跑登記的放開、清劇情走路（walks）、EVENTS.running／_playerSeated／_preMet、ADV.end、黑邊、日期卡、SOCIAL.feelOn；
//   手機（phoneThread）、存檔選單（saveMenu）的等待也照世代（舊的不醒）。沒有讀檔＝什麼都不變（登記只在讀檔時跑；鎖照舊擋重複進入）。
//   1 靜態：掃 src/——finally、.finally、.catch 裡才放開的模組狀態（模組層宣告的 let、S.／X.／E.／全大寫模組的屬性、Set、計數）每一個都要登記（或在下面白名單寫原因）；
//     模組層的 let busy／xxxBusy／playing／running／resuming／forcing／leaving、S.busy／S._busy／S.running／S.playing 一律要登記；鍵不重複；登記的內容只有「名字=false／null／0」「名字.clear()」
//   2 game3d.js：applySave 換 G（G=s）之前叫 loadRelease()；loadRelease 跑 LOADLOCKS（一個出錯不影響其他）、walks、EVENTS、ADV、黑邊、日期卡、feelOn；busyDepth、busyWho 一起歸零；
//     phoneThread、saveMenu 讀檔以後不醒；同一個模組載兩次登記不累積
//   3 阿姨諮詢（BB 的 sh_reload_lg3）：演到一半（對話框開著）讀別的檔——舊的不接著演、點了也不演、不寫旗標（LOAD-GEN 照舊）；再讀阿姨到期的檔——CLOSED2.tick 重新開始、演完
//   4 EVENTS.run 開場的 sleep 中間讀檔（pool3d.js S.AUTO 包著＝模組鎖＋EVENTS.running 都佔著）：讀檔以後 EVENTS.run 別的事件照演、POOL.tick 重新開始；舊的那一次永遠不寫
//   5 每一個登記的放開都跑得動、真的放開（載得到的模組全部跑一次）
// 修改前（開發分支 cabc279f1）：第 1、2、5 節沒有登記、沒有 loadRelease（FAIL）；第 3 節「再讀一次阿姨還能開始」FAIL（CLOSED2 的 busy 卡著）；
//   第 4 節 EVENTS.run 直接 return、POOL.tick 回 false（FAIL）。第 3 節前半「舊的不接著演」本來就 PASS（LOAD-GEN-ABORT 照舊）。
// 用法：node tests/loadgen_locks_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify, ROOT=H.ROOT;
const SRC=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };

/* ======================= 1 靜態掃描 ======================= */
/* 字串、註解、正規表示式換成空白（位置不變），只看程式 */
function strip(src){ let out='', i=0; const n=src.length;
  while(i<n){ const c=src[i], d=src[i+1];
    if(c==='/'&&d==='/'){ while(i<n&&src[i]!=='\n'){ out+=' '; i++; } continue; }
    if(c==='/'&&d==='*'){ while(i<n&&!(src[i]==='*'&&src[i+1]==='/')){ out+=src[i]==='\n'?'\n':' '; i++; } out+='  '; i+=2; continue; }
    if(c==='"'||c==="'"||c==='`'){ const q=c; out+=q; i++; while(i<n&&src[i]!==q){ if(src[i]==='\\'){ out+='  '; i+=2; continue; } out+=src[i]==='\n'?'\n':' '; i++; } out+=q; i++; continue; }
    if(c==='/'){ let j=out.length-1; while(j>=0&&/\s/.test(out[j])) j--; const p=j>=0?out[j]:'';
      if(!p||/[(,=:\[!&|?{};+\-*%<>~^]/.test(p)||/(return|typeof|case)$/.test(out.slice(Math.max(0,j-6),j+1))){ out+='/'; i++; let cls=false; while(i<n){ const ch=src[i]; if(ch==='\\'){ out+='  '; i+=2; continue; } if(ch==='[') cls=true; else if(ch===']') cls=false; else if((ch==='/'&&!cls)||ch==='\n') break; out+=' '; i++; } out+='/'; i++; continue; } }
    out+=c; i++; }
  return out; }
const match=(s,i,o,c)=>{ let d=0; for(let k=i;k<s.length;k++){ if(s[k]===o) d++; else if(s[k]===c){ d--; if(!d) return k; } } return -1; };
const NAME='[A-Za-z_$][\\w$]*(?:\\.[A-Za-z_$][\\w$]*|\\[[^\\]\\n]*\\])*';
/* finally{…}、.finally(…)、.catch(…) 裡放開（=false／null／0／undefined、=另一個變數＝還原、.delete(、.clear(、--）的東西 */
function releases(s){ const out=[]; const re=/\bfinally\s*([({])|\.catch\s*\(/g; let m;
  while((m=re.exec(s))){ const open=m[1]||'(', a=m.index+m[0].length-1, b=match(s,a,open,open==='{'?'}':')'); if(b<0) continue; const body=s.slice(a+1,b), line=s.slice(0,m.index).split('\n').length; let q;
    const ra=new RegExp('(?<![\\w$.\\]])('+NAME+')\\s*=(?![=>])\\s*(false|null|0|undefined|[A-Za-z_$][\\w$]*(?:\\[[^\\]\\n]*\\])?)?','g');
    while((q=ra.exec(body))){ if(q[2]===undefined||q[2]==='true') continue; const lit=/^(false|null|0|undefined)$/.test(q[2]); out.push({name:q[1],how:lit?'='+q[2]:'還原',line}); }   /* =true（例：.catch 裡記「這次失敗了」）不是放開 */
    const rd=new RegExp('('+NAME+')\\.(delete|clear)\\(','g'); while((q=rd.exec(body))) out.push({name:q[1],how:'.'+q[2],line});
    const rm=new RegExp('('+NAME+')--','g'); while((q=rm.exec(body))) out.push({name:q[1],how:'--',line}); }
  for(const r of out) r.name=r.name.replace(/\[[^\]]*\]/g,'[]');   /* ON['節日']、S._x[id]：字串已經換成空白，鍵寫 [] */
  return out; }
/* 模組層（兩格縮排那一行）宣告的 let／var 名字、const X=new Set／Map／WeakSet */
function modDecl(raw){ const names=new Set();
  for(const L of raw.split('\n')){ if(!/^ {2}\S/.test(L)) continue; const s=strip(L);
    for(const m of s.matchAll(/\b(?:let|var)\s+([^;]*)/g)){ let dep=0, cur=''; for(const ch of m[1]){ if('([{'.includes(ch)) dep++; else if(')]}'.includes(ch)) dep--; if(ch===','&&!dep){ const q=cur.trim().match(/^([A-Za-z_$][\w$]*)/); if(q) names.add(q[1]); cur=''; } else cur+=ch; } const q=cur.trim().match(/^([A-Za-z_$][\w$]*)/); if(q) names.add(q[1]); }
    for(const m of s.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*new\s+(?:Set|Map|WeakSet|WeakMap)\b/g)) names.add(m[1]); }
  return names; }
const isModState=(name,decl)=>{ const root=name.split(/[.[]/)[0]; if(name.indexOf('.')<0&&name.indexOf('[')<0) return decl.has(root); return /^(S|S_|X|E)$/.test(root)||/^[A-Z][A-Z0-9_]+$/.test(root)||(decl.has(root)&&!/^(G|F|GM|R|r|q|c|s|e|k|n|P|A)$/.test(root)); };
/* 讀檔時放開的登記（一行）：(globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['模組:鎖']=()=>{ 旗標=初始值; … };
   鍵＝同一個檔在 Node 測試載兩次只留一個（重複登記不累積）；內容只能是「名字=false／null／0」「名字.clear()」——不叫遊戲邏輯、不碰舊流程 */
const REG=/\(globalThis\.LOADLOCKS=globalThis\.LOADLOCKS\|\|\{\}\)\['[^'\n]*'\]=\(\)=>\{(.*?)\};/g;
const regBodies=raw=>[...strip(raw).matchAll(REG)].map(m=>m[1]);
const regKeys=raw=>[...raw.matchAll(/\(globalThis\.LOADLOCKS=globalThis\.LOADLOCKS\|\|\{\}\)\['([^'\n]*)'\]=/g)].map(m=>m[1]);
const covers=(bodies,name)=>{ const e=name.replace(/[.$[\]]/g,x=>'\\'+x); const re=new RegExp('(?<![\\w$.])'+e+'\\s*(=(?!=)|\\.clear\\()'); return bodies.some(b=>re.test(b)); };
const flagsOnly=b=>b.split(';').map(x=>x.trim()).filter(Boolean).every(x=>new RegExp('^'+NAME+'\\s*=\\s*(false|null|0)$').test(x)||new RegExp('^'+NAME+'\\.clear\\(\\)$').test(x));
/* 不必登記的（原因）：都在下面一一列出；新的鎖不在這裡＝要登記 */
const ALLOW={
  'src/bike3d.js opts_walked':'同步：try 只包 B.mount（沒有 await），不會凍在中間',
  'src/bike3d.js loading':'腳踏車模型下載（不是劇情流程，下載失敗才清）',
  'src/classes3d.js E._tourMove':'只包 GM.enter：applySave 先等換區域（entering）結束才換世代，enter 一定走完 finally',
  'src/cracktalk3d.js _G':'同步：S.an1…S.zq 都不 await',
  'src/dorm203_3d.js S._kl':'同步：EVENTS.sleepEvent／check 不 await',
  'src/feed3d.js S.pgStopIn':'同步：PG.nextStop 不 await',
  'src/feed3d.js S.pgJumping':'包 PG.jumpTo 這個呼叫本身：回傳（不管是不是 Promise）就減回去，不等劇情',
  'src/fest3d.js ON[]':'同步：INV.replyPick 不 await（ON[\'節日\']）',
  'src/game3d.js entering':'applySave 先等換區域結束（entering＝false）才換世代',
  'src/hcircle3d.js guard':'同步的遞迴防護',
  'src/invites3d.js arrivingIv':'WeakSet，裝的是舊 G 的邀約物件：讀進來的新 G 是新的物件，對不到',
  'src/msg3d.js S._herOf':'同步：S.pick 不 await',
  'src/us_blank3d.js USL.SUM':'同步：USL.tick 回傳就還原（不等 Promise）',
  'src/zones3d.js E.renderSkip':'換區域的預熱（enter 裡；applySave 先等換區域結束，不照世代、一定走完 finally）',
  'src/zr_uk3d.js S._t2':'同步：MSG.send 不 await'
};
/* game3d.js 自己放開的（applySave／loadRelease）：events3d.js、story3d.js 的這幾個 */
const CENTRAL={'src/events3d.js X.running':'EVENTS.running=null','src/events3d.js X._preMet':'EVENTS._preMet=null','src/events3d.js X._playerSeated':'EVENTS._playerSeated=false','src/story3d.js S._sleeping':'STORY._sleeping=false'};
const LOCKNAME=/^(busy|[a-z]\w*Busy|playing|running|resuming|forcing|leaving)$/;

(async()=>{
await sec(1,()=>{
  const files=fs.readdirSync(path.join(ROOT,'src')).filter(f=>/\.js$/.test(f)).map(f=>'src/'+f);
  const g3=strip(SRC); const relBody=(()=>{ const a=g3.indexOf('function loadRelease(){'); if(a<0) return ''; const b=match(g3,g3.indexOf('{',a),'{','}'); return g3.slice(a,b); })(), apBody=(()=>{ const a=g3.indexOf('async function applySave(s){'); return a<0?'':g3.slice(a,match(g3,g3.indexOf('{',a),'{','}')); })();
  const miss=[], seen=new Set(), allowUsed=new Set(), keyAt={}, dupKeys=[], notFlags=[]; let nReg=0, nRel=0, nLock=0;
  for(const f of files){ const raw=fs.readFileSync(path.join(ROOT,f),'utf8'), s=strip(raw), decl=modDecl(raw), regs=regBodies(raw); nReg+=regs.length;
    for(const k of regKeys(raw)){ if(keyAt[k]) dupKeys.push(k+'（'+keyAt[k]+'、'+f+'）'); else keyAt[k]=f; }
    for(const b of regs) if(!flagsOnly(b)) notFlags.push(f+'：'+b.trim());
    for(const r of releases(s)){ if(!isModState(r.name,decl)) continue; const key=f+' '+r.name; if(seen.has(key)) continue; seen.add(key); nRel++;
      if(covers(regs,r.name)) continue;
      if(CENTRAL[key]){ if(relBody.indexOf(CENTRAL[key])>=0||apBody.indexOf(CENTRAL[key])>=0) continue; miss.push(key+'（要在 game3d.js loadRelease／applySave 放開：'+CENTRAL[key]+'）'); continue; }
      if(ALLOW[key]){ allowUsed.add(key); continue; }
      miss.push(key+'（第 '+r.line+' 行 finally／catch 裡 '+r.how+'）'); }
    /* 模組層的鎖（名字照慣例）：不管在哪裡放開，一律要登記 */
    for(const L of raw.split('\n')){ if(!/^ {2}\S/.test(L)) continue; const sl=strip(L);
      for(const m of sl.matchAll(/\blet\s+([^;]*)/g)) for(const part of m[1].split(',')){ const q=part.trim().match(/^([A-Za-z_$][\w$]*)\s*=\s*false$/); if(q&&LOCKNAME.test(q[1])){ nLock++; const key=f+' '+q[1]; if(!covers(regs,q[1])&&!miss.some(x=>x.indexOf(key+'（')===0)) miss.push(key+'（模組層的鎖：宣告的那一行要登記 LOADLOCKS）'); } }
      for(const m of sl.matchAll(/^ {2}(S\.(?:busy|_busy|running|playing))\s*=\s*false\s*;/g)){ nLock++; const key=f+' '+m[1]; if(!covers(regs,m[1])&&!miss.some(x=>x.indexOf(key+'（')===0)) miss.push(key+'（模組層的鎖：要登記 LOADLOCKS）'); } } }
  check('1. 掃 src/：finally／.finally／.catch 裡才放開的模組狀態、模組層的鎖，每一個都有登記讀檔放開（LOADLOCKS）、由 game3d.js 放開、或在白名單寫了原因',!miss.length&&nRel>60&&nLock>40,'放開 '+nRel+' 個、模組層的鎖 '+nLock+' 個、登記 '+nReg+' 行；沒登記：'+J(miss));
  check('1. 登記的鍵全 src/ 不重複（重複＝後載入的蓋掉前一個，那一個鎖讀檔時不放開）',!dupKeys.length&&Object.keys(keyAt).length===nReg,J(dupKeys));
  check('1. 登記的內容只有「名字=false／null／0」「名字.clear()」（只放開旗標：不叫遊戲邏輯、不 resolve 舊流程）',!notFlags.length&&nReg>0,J(notFlags));
  const stale=Object.keys(ALLOW).filter(k=>!allowUsed.has(k)); if(stale.length) console.log('NOTE 白名單有已經不在的項目（程式改了；可以拿掉）：'+J(stale));
  /* 掃描本身會抓：拿一段假的模組（finally 放開、沒登記）要報出來；登記了就不報 */
  const fake="const ZZ=(function(){ const S={};\n  let busy=false;\n  S.tick=function(GM){ if(busy) return false; busy=true; S.go(GM).finally(()=>{ busy=false; }); return true; };\n  return S; })();\n";
  const r1=releases(strip(fake)).filter(r=>isModState(r.name,modDecl(fake))).map(r=>r.name), reg1=fake.replace('  let busy=false;\n',"  let busy=false;\n  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['zz:busy']=()=>{ busy=false; };\n");
  check('1. 掃描抓得到：假的模組 let busy＋.finally 放開、沒登記＝報出來；登記了＝不報',J(r1)===J(['busy'])&&!covers(regBodies(fake),'busy')&&covers(regBodies(reg1),'busy'),J(r1));
  check('1. 掃描抓得到：登記裡叫了函式（S.release()、GM.sceneEnd()）＝不算「只放開旗標」',flagsOnly('busy=false; S.staged=null; running.clear();')&&!flagsOnly('busy=false; S.release();')&&!flagsOnly('GM.sceneEnd();'));
});

/* ======================= 共用：假的 game3d（對話框、世代、sleep）＋抽出來的 applySave ======================= */
const D={active:false,resolve:null,typing:false,busyDepth:0,busyWho:[],stale:false};
GM.D=D; GM.loadGen=0; GM.turbo=true; GM.chooseReset=()=>{}; GM.running=true;
Object.defineProperty(GM,'G',{configurable:true,enumerable:true,get(){ return H.G; },set(v){ H.G=v; }});
const sl=(()=>{ const i=SRC.indexOf('const sleep=ms=>'); const a=SRC.lastIndexOf('\n',i)+1, b=SRC.indexOf('\n',i); return SRC.slice(a,b); })();
GM.sleep=vm.runInThisContext('(function(GM){ '+sl+' return sleep; })')(GM);   /* 真的 sleep（照世代；turbo 最多 120 ms）*/
GM.fade=on=>GM.sleep(on?480:500); GM.titleCard=async(a,b)=>{ H.cards.push([a,b]); await GM.sleep(2200); };
let said=[]; const lines=()=>said.map(x=>x.t);
GM.say=(who,t)=>new Promise(res=>{ said.push({who:who?(who.name||String(who)):null,t:String(t)}); D.active=true; D.resolve=res; });   /* 和 game3d.js 的對話框一樣：點了（click）才 resolve */
const click=()=>{ if(!D.active) return false; const r=D.resolve; D.resolve=null; D.active=false; if(r) r(); return true; };   /* dlgAdvance */
GM.sceneBegin=()=>{ D.busyDepth++; E.player.busy=true; }; GM.sceneEnd=()=>{ D.busyDepth=Math.max(0,D.busyDepth-1); if(!D.busyDepth) E.player.busy=false; };
const drive=async(p,max)=>{ let st='pending'; p.then(()=>{ st='done'; },()=>{ st='done'; }); for(let i=0;i<(max||400)&&st==='pending';i++){ await wait(5); click(); } return st; };
const until=async(f,ms)=>{ for(let t=0;t<(ms||1500);t+=5){ if(f()) return true; await wait(5); } return !!f(); };
/* applySave 換 G 之前、到 await enter 為止的那一段原文（＋loadRelease，有的話）：其他相依（validate、migrate、enter…）用假的 */
const el=()=>({classList:{add(){},remove(){},contains:()=>false,toggle(){}},style:{opacity:'1'},innerHTML:'',textContent:''});
const DOM={dlg:el(),choices:el(),title3:el()}; const $=id=>DOM[id]||null;
const walks=new Set(); const lbox=[]; const letterbox=on=>lbox.push(on);
E.endCinematic=()=>{}; E.setWeather=()=>{};
const bindSystems=()=>{ SOCIAL.bind(H.G); EVENTS.bind(GM); INV.rec(H.G); };
const ap0=SRC.indexOf('  async function applySave(s){'), ap1=SRC.indexOf('  GM.applySave=applySave;'), AP=SRC.slice(ap0,ap1);
const preA=AP.indexOf('GM.loadGen=(GM.loadGen|0)+1;'), preB=AP.indexOf(' await enter(G.zone');
const rel0=SRC.indexOf('  function loadRelease(){'), rel1=SRC.indexOf('  GM.loadRelease=loadRelease;'), REL=rel0>0&&rel1>rel0?SRC.slice(rel0,rel1):'';
const mk=vm.runInThisContext('(function(GM,D,$,E,bindSystems,hideHUD,walks,letterbox){ let G=GM.G, staleT=1; '+REL+' return {apply:function(s){ '+AP.slice(preA,preB)+' return G; },release:'+(REL?'loadRelease':'null')+'}; })')(GM,D,$,E,bindSystems,()=>{},walks,letterbox);
/* 讀檔：抽出來的那一段＋applySave 接下來的 enter（假的 GM.enter：建房間、populate） */
const load=async s=>{ said=[]; const G=mk.apply(JSON.parse(JSON.stringify(s))); await GM.enter(G.zone,G.pos||null,{fromLoad:true}); return G; };

/* ---------- 研討室 B 的假區域（同 tests/rooms_ab3_people_unit.js）---------- */
const ZSTUB=['campus','dorm','wancai','linze','gongtong','library_hall','boya','dorm_hall','noodle'];
global.Z3={ZONES:{}}; for(const k of ZSTUB) Z3.ZONES[k]={id:k,name:k};
global.GAME=GM;
const L3=f=>{ const p=path.join(ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
const loadErr={};
for(const f of ['src/data/room_glb_layouts.js','src/rooms_glb3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/exchange3d.js','src/data/y2b_events.js','src/y2b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js',
  'src/data/r2y4b_events.js','src/r2y4b3d.js','src/data/r3_events.js','src/r3_3d.js','src/sideq3d.js','src/closed3d.js','src/closed2_3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js',
  'src/data/wz_park_layout.js','src/wzpark3d.js','src/wzshops3d.js','src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/pool_story.js','src/pool3d.js']) try{ L3(f); }catch(e){ loadErr[f]=String(e).slice(0,160); }
const C=()=>typeof CLOSED2!=='undefined'?CLOSED2:null, PO=()=>typeof POOL!=='undefined'?POOL:null;
const ROOMS=['wancai_semb'], LAY=id=>ROOM_GLB_LAYOUTS[id];
const zoneOf=(id,G)=>{ const L=LAY(id); const k=Z3.roomGlbSet(id,G), SET=k?L.sets[k]:null; return {id,indoor:true,roomSet:k,spots:(SET?SET.spots:L.spots)||null,seats:((SET?SET.seats:L.seats)||[]).map(s=>({x:s.x,z:s.z,yaw:s.yaw,lv:0})),spawn:Object.assign({},L.spawn),roomAt:()=>null}; };
const P=E.player;
GM.enter=async(z,sp)=>{ const G=H.G; G.zone=z; GM.npc={}; E.npcs=[]; E.interactables=[]; P.seat=null; P.frozen=false; P.pose='idle';
  E.zone=ROOMS.includes(z)&&Z3.ZONES[z]?zoneOf(z,G):{id:z,seats:[],roomAt:()=>null}; if(sp){ P.obj.position.x=sp.x; P.obj.position.z=sp.z; P.lv=sp.lv|0; }
  if(ROOMS.includes(z)&&Z3.ZONES[z]) STORY.populate(z,GM); return E.zone; };
GM.spawnCharacter=(id,x,z,o)=>{ if(GM.npc[id]) return GM.npc[id]; const n={id,obj:{position:{x,z},rotation:{y:(o&&o.yaw)||0}},seat:(o&&o.seat)||null,pose:o&&o.pose}; GM.npc[id]=n; E.npcs.push(n); return n; };
GM.spawnNPC=(id,spec,x,z,o)=>{ const n={id,spec,obj:{position:{x,z},rotation:{y:(o&&o.yaw)||0}},seat:null}; if(o&&o.seat) GM.sitAt(n,o.seat); GM.npc[id]=n; E.npcs.push(n); return n; };
GM.sitAt=(ent,st)=>{ ent.seat=st; ent.pose='sit'; }; GM.standUp=ent=>{ ent.seat=null; ent.pose='idle'; };
GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ E.npcs=E.npcs.filter(q=>q!==n); delete GM.npc[id]; } };
GM.walkTo=async(ent,x,z)=>{ ent.obj.position.x=x; ent.obj.position.z=z; return true; };
GM.face=()=>{}; GM.spawnExtra=()=>null; E.canStand=()=>true; E.removeNPC=n=>{ E.npcs=E.npcs.filter(q=>q!==n); }; E.placeAt=(ent,x,z)=>{ ent.obj.position.x=x; ent.obj.position.z=z; };
const lv=(id,st)=>{ const r=SOCIAL.rel(id); const n={FAMILIAR:{fam:25},FRIEND:{fam:45,trust:30}}[st]||{}; Object.assign(r,{fam:0,trust:0,comf:0,npcRom:0,rom:0},n); SOCIAL.remember(id,'FIRST_MET',''); };
/* 存檔：照 H.fresh 做一份（當下會綁到它；做完綁回原本那一局——讀檔前遊戲還在原本那一局）*/
const mkSave=(key,h,zone,flags,rels)=>{ const keep=H.G; const s=H.fresh(key,h,zone,flags); for(const [id,st] of rels||[]) lv(id,st); const out=JSON.parse(JSON.stringify(s)); H.G=keep; if(keep){ SOCIAL.bind(keep); EVENTS.bind(GM); } return out; };
const AUNT=['2027-05-22',9.2,'wancai_semb',{lawclub:true},[['heroine_03','FRIEND'],['classmate_bohan','FRIEND']]];
const OPEN='（萬才館的諮詢室。門開了，進來的是阿鳳阿姨，後面跟著語彤。）';

/* ======================= 3 阿姨諮詢（BB 的 sh_reload_lg3）======================= */
await sec(3,async()=>{
  check('3. 載得到 closed2_3d.js（和相依）',!!C()&&!!C().tick&&typeof Y2B!=='undefined',J(loadErr));
  const G1=H.fresh(...AUNT.slice(0,4)); for(const [id,st] of AUNT[4]) lv(id,st); await GM.enter('wancai_semb'); said=[];
  const t1=C().tick(GM); await until(()=>D.active);
  check('3. 前置：人在研討室 B、09:12：阿姨諮詢自動開始，演到第一句（對話框開著、劇情鎖著）',t1===true&&D.active&&lines()[0]===OPEN&&D.busyDepth>0,J({t1,said:lines(),depth:D.busyDepth}));
  check('3. 前置：演的途中 CLOSED2.tick 不會再開一次（鎖照舊擋重複進入）',C().tick(GM)===false);
  /* 讀別的檔（麵店、9 月）*/
  const g0=GM.loadGen; const G2=await load(mkSave('2026-09-24',17.5,'noodle',{}));
  const h2=G2.hour; for(let i=0;i<20;i++){ click(); await wait(10); }
  check('3. 讀別的檔：世代加一、對話框收掉；點了也不會接著演阿姨諮詢（LOAD-GEN 照舊）',GM.loadGen===g0+1&&!D.active&&!lines().length,J({gen:GM.loadGen,said:lines()}));
  check('3. 舊的那一段沒有把旗標、記憶寫進新的一局（沒有 RENT_CONSULTATION、LAWCLUB_SAT_LAST、時間沒有往前跳）',!SOCIAL.has('heroine_03','RENT_CONSULTATION')&&G2.flags.LAWCLUB_SAT_LAST==null&&G2.hour===h2&&!(G2.events.done||{}).ev_yt_aunt_consult,J({mem:SOCIAL.has('heroine_03','RENT_CONSULTATION'),f:G2.flags.LAWCLUB_SAT_LAST,h:[h2,G2.hour]}));
  check('3. 讀檔以後劇情鎖 0 層、不忙',D.busyDepth===0&&!E.player.busy,J({depth:D.busyDepth,busy:E.player.busy}));
  /* 再讀一次「阿姨諮詢到期」的檔（BB 第二段）*/
  const G3=await load(mkSave(...AUNT)); said=[];
  const t3=C().tick(GM);
  check('3. 再讀一次阿姨到期的檔：CLOSED2.tick 重新開始（CLOSED2 的 busy 沒有一直卡著）',t3===true,J({t3,staged:C().staged}));
  if(t3){ const st=await drive(C().pending,600);
    const n=lines().filter(t=>t===OPEN).length;
    check('3. 新的那一次演完：開場一次、記 RENT_CONSULTATION、ev_yt_aunt_consult＝1、LAWCLUB_SAT_VISITS＝1（舊的那一次沒有一起演、沒有多寫一次）',st==='done'&&n===1&&SOCIAL.has('heroine_03','RENT_CONSULTATION')&&G3.events.done.ev_yt_aunt_consult===1&&G3.flags.LAWCLUB_SAT_VISITS===1,J({st,n,visits:G3.flags.LAWCLUB_SAT_VISITS,done:G3.events.done.ev_yt_aunt_consult}));
    check('3. 演完：劇情鎖 0 層、不忙、房間的佈置收掉（CLOSED2.staged＝null）、之後不會再開始',D.busyDepth===0&&!E.player.busy&&C().staged===null&&C().tick(GM)===false,J({depth:D.busyDepth,staged:C().staged})); }
  check('3. 舊的那一局（G1）也沒有被演完（舊流程一直凍著）',!G1.social||!(G1.social.mem&&J(G1.social.mem).indexOf('RENT_CONSULTATION')>=0));
});

/* ======================= 4 EVENTS.run 在開場的 sleep 中間讀檔（pool3d S.AUTO 包著）======================= */
await sec(4,async()=>{
  check('4. 載得到 pool3d.js（S.AUTO）',!!PO()&&Array.isArray(PO().AUTO),J(loadErr));
  const PROBE={id:'ev_lg_probe',participants:[],background:'blur',dialogue:[{speaker:null,text:'（探針：開場）'},{set:{LG_SET:true}},{speaker:null,text:'（探針：第二句）'}],after:G=>{ G.flags.LG_AFTER=(G.flags.LG_AFTER|0)+1; }};
  const PROBE2={id:'ev_lg_probe2',participants:[],background:'blur',dialogue:[{speaker:null,text:'（另一個事件）'},{set:{LG2:true}}]};
  PO().AUTO.push(GM=>{ const F=GM.G.flags; return F.LG_PROBE&&!F.LG_AFTER?PROBE:null; });
  const G4=await load(mkSave('2026-10-06',15,'dorm',{LG_PROBE:true})); said=[];
  const t4=PO().tick(GM); await until(()=>EVENTS.running==='ev_lg_probe',400); const sleeping=EVENTS.running==='ev_lg_probe'&&!D.active&&!said.length;
  check('4. 前置：POOL.tick 開演、EVENTS.run 停在開場的 GM.sleep（還沒說第一句；EVENTS.running、POOL 的鎖都佔著）',t4===true&&sleeping&&PO().tick(GM)===false,J({t4,run:EVENTS.running,said:lines()}));
  const G5=await load(mkSave('2026-10-06',15,'dorm',{LG_PROBE:true}));
  await wait(300);
  check('4. sleep 中間讀檔：舊的那一次醒不來（沒有說話、沒有寫旗標——新舊兩局都沒有）',!said.length&&G5.flags.LG_SET==null&&G5.flags.LG_AFTER==null&&G4.flags.LG_SET==null&&G4.flags.LG_AFTER==null,J({said:lines(),G5:[G5.flags.LG_SET,G5.flags.LG_AFTER],G4:[G4.flags.LG_SET,G4.flags.LG_AFTER]}));
  check('4. 讀檔以後 EVENTS.running 放開了',!EVENTS.running,J(EVENTS.running));
  const p2=EVENTS.run(PROBE2); const s2=await drive(p2,200);
  check('4. 讀檔以後 EVENTS.run 別的事件照演（說話、寫旗標、記 done）',s2==='done'&&lines().includes('（另一個事件）')&&G5.flags.LG2===true&&(G5.events.done||{}).ev_lg_probe2===1,J({s2,said:lines(),LG2:G5.flags.LG2}));
  said=[]; const t5=PO().tick(GM);
  check('4. 讀檔以後 POOL.tick 重新開始（pool3d.js 的 busy 沒有卡著）',t5===true,J({t5,run:EVENTS.running}));
  if(t5){ await until(()=>EVENTS.running==='ev_lg_probe',400); const st=await drive((async()=>{ while(EVENTS.running) await wait(5); })(),600);
    check('4. 新的那一次演完：開場一次、LG_SET、LG_AFTER＝1（舊的那一次沒有醒來多演一次）；舊的那一局一直沒有寫',st==='done'&&lines().filter(t=>t==='（探針：開場）').length===1&&G5.flags.LG_SET===true&&G5.flags.LG_AFTER===1&&G4.flags.LG_AFTER==null,J({said:lines(),G5:G5.flags.LG_AFTER,G4:G4.flags.LG_AFTER}));
    await wait(30); check('4. 演完：劇情鎖 0 層、EVENTS.running 放開',D.busyDepth===0&&!EVENTS.running,J({depth:D.busyDepth,run:EVENTS.running})); }
});

/* ======================= 2 game3d.js：loadRelease、phoneThread、saveMenu ======================= */
await sec(2,async()=>{
  const ai=AP.indexOf('GM.loadGen=(GM.loadGen|0)+1;'), ri=AP.indexOf('loadRelease();'), gi=AP.indexOf('G=s; GM.G=G;');
  check('2. applySave：世代加一以後、換 G（G=s）之前叫 loadRelease()',ai>0&&ri>ai&&gi>ri,J({ai,ri,gi}));
  check('2. game3d.js 有 loadRelease（GM.loadRelease）',!!mk.release);
  check('2. applySave：劇情鎖的層數和誰開的（busyDepth、busyWho）一起歸零',/D\.busyDepth=0; D\.busyWho\.length=0;/.test(AP.slice(gi)));
  if(mk.release){
    const log=[]; const LL=(globalThis.LOADLOCKS=globalThis.LOADLOCKS||{}); LL['測試:a']=()=>{ log.push('a'); throw new Error('測試：這一個出錯'); }; LL['測試:b']=()=>{ log.push('b'); };
    walks.add({ent:{},finish(){}}); EVENTS.running='ev_x'; EVENTS._playerSeated=true; EVENTS._preMet={heroine_01:false};
    let ended=0; const aEnd=ADV.end; ADV.active=true; ADV.end=function(){ ended++; return aEnd.apply(this,arguments); };
    DOM.title3.style.opacity='1'; SOCIAL.feelOn=true; lbox.length=0;
    const cw=console.warn; console.warn=()=>{}; try{ mk.release(); } finally { console.warn=cw; ADV.end=aEnd; }
    delete LL['測試:a']; delete LL['測試:b'];
    check('2. loadRelease：跑 LOADLOCKS（一個丟例外，後面的照跑）',log.join('')==='ab',J(log));
    check('2. loadRelease：清掉劇情走路（walks）、EVENTS.running／_playerSeated／_preMet',walks.size===0&&EVENTS.running==null&&EVENTS._playerSeated===false&&EVENTS._preMet==null,J({w:walks.size,r:EVENTS.running}));
    check('2. loadRelease：ADV 收掉（2D 不留在畫面上、EVENTS.tick 不被擋）、黑邊收掉、日期卡藏起來、關係提示不再記（SOCIAL.feelOn）',ended===1&&!ADV.active&&lbox.includes(false)&&+DOM.title3.style.opacity===0&&SOCIAL.feelOn===false,J({ended,lbox,op:DOM.title3.style.opacity,feel:SOCIAL.feelOn}));
    ended=0; ADV.active=false; ADV.end=function(){ ended++; }; try{ mk.release(); } finally { ADV.end=aEnd; }
    check('2. loadRelease：ADV 沒開就不叫 ADV.end',ended===0); }
  /* phoneThread：讀檔以後收起手機也不醒（舊劇情等的那一下）*/
  const pt=(()=>{ const i=SRC.indexOf('  GM.phoneThread=(th,o)=>'); return i<0?'':SRC.slice(i,SRC.indexOf('\n',i)); })();
  check('2. game3d.js 找得到 GM.phoneThread',!!pt);
  if(pt){ const GMx={loadGen:0}; const env={phoneWaiters:[],opened:0};
    const f=vm.runInThisContext('(function(GM,env,$){ let phoneWaiters=env.phoneWaiters; const openPhone=()=>{ env.opened++; }; '+pt+' return {wake(){ const w=phoneWaiters; phoneWaiters=[]; env.phoneWaiters=phoneWaiters; for(const f of w) f(); }}; })')(GMx,env,()=>null);
    const settled=(p,ms)=>Promise.race([p.then(()=>'resolved'),wait(ms).then(()=>'pending')]);
    const a=GMx.phoneThread('t'); f.wake(); const ra=await settled(a,40);
    const b=GMx.phoneThread('t'); GMx.loadGen++; f.wake(); const rb=await settled(b,40);
    check('2. phoneThread：平常收起手機就醒；中間讀檔（世代加一）＝收起手機也不醒',ra==='resolved'&&rb==='pending',J({ra,rb})); }
  /* saveMenu：在家的選單「存檔」→ 讀檔（存檔選單關掉）＝舊的家裡選單不醒 */
  const sm=(()=>{ const i=SRC.indexOf('  GM.saveMenu=()=>'); return i<0?'':SRC.slice(i,SRC.indexOf('\n',i)); })();
  check('2. game3d.js 找得到 GM.saveMenu',!!sm);
  if(sm){ const GMx={loadGen:0}; const m=vm.runInThisContext('(function(GM){ let menuOpen=false; const openMenu=()=>{ menuOpen=true; }; '+sm+' return {close(){ menuOpen=false; }}; })')(GMx);
    const settled=(p,ms)=>Promise.race([p.then(()=>'resolved'),wait(ms).then(()=>'pending')]);
    const a=GMx.saveMenu(); m.close(); const ra=await settled(a,500);
    const b=GMx.saveMenu(); GMx.loadGen++; m.close(); const rb=await settled(b,500);
    check('2. saveMenu：平常關掉存檔選單就回到家裡的選單；從存檔選單讀檔（世代加一）＝舊的不醒',ra==='resolved'&&rb==='pending',J({ra,rb})); }
  /* 同一個檔在 Node 載兩次：登記用同一個鍵＝只留一個（不累積） */
  { const LL=(globalThis.LOADLOCKS=globalThis.LOADLOCKS||{}); const raw=fs.readFileSync(path.join(ROOT,'src/y3fill3d.js'),'utf8'), i=raw.indexOf("['y3fill3d:busy']");
    const line=i<0?'':raw.slice(raw.lastIndexOf('\n',i)+1,raw.indexOf('\n',i)); const keep=LL['y3fill3d:busy'], n0=Object.keys(LL).length;
    const inst=()=>vm.runInThisContext('(function(){ let busy=true; '+line+'\n return ()=>busy; })')();   /* 這個模組那一行原文，包在一個模組範圍裡跑＝載一次 */
    let a=null, b=null, err=''; try{ a=inst(); b=inst(); }catch(e){ err=String(e).slice(0,160); }
    const n1=Object.keys(LL).length; if(LL['y3fill3d:busy']) LL['y3fill3d:busy'](); const after=[a&&a(),b&&b()];
    if(keep) LL['y3fill3d:busy']=keep; else delete LL['y3fill3d:busy'];
    check('2. 同一個模組載兩次：登記用同一個鍵，只留最後載的那一個（不累積），讀檔放開的是現在用的那一份',!!line&&!err&&n1===n0+(keep?0:1)&&J(after)===J([true,false]),J({err,n0,n1,after})); }
});

/* ======================= 5 每一個登記的放開都跑得動、真的放開 ======================= */
await sec(5,async()=>{
  const more=['src/data/free_trips.js','src/freetrip3d.js','src/econff3d.js','src/data/retake_home.js','src/fit3d.js','src/data/group_events.js','src/group3d.js','src/data/wz_jobs.js','src/jobs3d.js','src/data/jp_events.js','src/jp3d.js','src/kxdrift3d.js','src/lab5f3d.js','src/multirel3d.js',
    'src/psresults3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/rom1016_3d.js','src/sis_b9_3d.js','src/sis_b10_3d.js','src/sis_b11_3d.js','src/sis_grad3d.js','src/twfill3d.js','src/us208_3d.js','src/data/us_life_events.js','src/us_life3d.js','src/data/us_blank_lines.js','src/us_blank3d.js',
    'src/data/v6ex_lines.js','src/v6ex3d.js','src/data/vacfill_events.js','src/vacfill3d.js','src/wzcat3d.js','src/wzlines3d.js','src/y1fill3d.js','src/y2b3d.js','src/y2r2_3d.js','src/y34b3d.js','src/y3fill3d.js','src/zq_testbuild3d.js','src/zrzq3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js','src/fest3d.js','src/bbpack3d.js','src/b1story3d.js','src/badminton_clip3d.js','src/feed3d.js'];
  const cw=console.warn; console.warn=()=>{}; for(const f of more){ if(loadErr[f]) continue; try{ L3(f); }catch(e){ loadErr[f]=String(e).slice(0,120); } } console.warn=cw;
  const L=Object.values(globalThis.LOADLOCKS||{}); let bad=[]; for(const [k,f] of Object.entries(globalThis.LOADLOCKS||{})){ try{ f(); }catch(e){ bad.push(k+' '+String(e).slice(0,120)); } }
  const srcKeys=[].concat(...fs.readdirSync(path.join(ROOT,'src')).filter(f=>/\.js$/.test(f)).map(f=>regKeys(fs.readFileSync(path.join(ROOT,'src',f),'utf8')))), regFiles=new Set(srcKeys.map(k=>k.split(':')[0])).size;
  const notRun=srcKeys.filter(k=>!(globalThis.LOADLOCKS||{})[k]); if(notRun.length) console.log('NOTE 這個測試沒載到（或載入條件不成立）的登記：'+J(notRun));
  check('5. 登記的放開全部跑一次：沒有一個丟例外（模組沒載到的不算，見下面）',L.length>=50&&!bad.length,'登記 '+L.length+' 個（有登記的檔 '+regFiles+' 個）；例外：'+J(bad)+'；沒載到：'+J(Object.keys(loadErr)));
  /* 看得到的鎖：先佔住，loadRelease（或直接跑登記）以後要放開 */
  const X=(n)=>{ try{ return vm.runInThisContext('typeof '+n+'!=="undefined"?'+n+':null'); }catch(e){ return null; } };
  const T=[['BADCLIP','busy',true],['ECONFF','busy',true],['PG','busy',true],['JOBS','running',true],['EXCH','_busy',true],['VAC','away',true],['OUT','fromHome',true],['STORY','_jumping',true],['STORY','_llOut',true],['STORY','_slOut',true],['CLOSED2','staged',{room:'x',id:'y'}],['CLOSED2','_iv',true],['CLOSED2','_ex',true]];
  const got={}; for(const [m,k,v] of T){ const o=X(m); if(o) o[k]=v; }
  if(X('VAC')&&X('VAC')._fly) X('VAC')._fly.add('q1');
  const wz=X('WZCAT'); if(wz&&wz.hold) wz.hold('lie');
  for(const f of Object.values(globalThis.LOADLOCKS||{})){ try{ f(); }catch(e){} }
  for(const [m,k] of T){ const o=X(m); got[m+'.'+k]=o?o[k]:'（沒載到）'; }
  if(X('VAC')) got['VAC._fly.size']=X('VAC')._fly?X('VAC')._fly.size:'—'; if(wz) got['WZCAT.held']=wz.held?wz.held():'—';
  const notFree=Object.keys(got).filter(k=>got[k]!=='（沒載到）'&&!!got[k]&&got[k]!=='—');
  check('5. 佔住的鎖（BADCLIP、ECONFF、PG、JOBS、EXCH、VAC、OUT、STORY、CLOSED2、WZCAT…）登記的放開以後都空了',!notFree.length&&Object.keys(got).filter(k=>got[k]==='（沒載到）').length<=2,J(got));
});
console.log(H.fails?'FAILED '+H.fails:'ALL PASS');
process.exit(H.fails?1:0);
})();
