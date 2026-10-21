// 選單被另一個選單蓋掉（X81 BUG-E37-MOVEIN-1020）——不需要瀏覽器。
//   使用者 v9.10.2 的卡住紀錄（_stuck）：8/30 18:01 宿舍、劇情鎖 1 層、是 bedScene 開的、畫面上沒有選單也沒有對話。
//   game3d.js 只有 choose() 選完會把選單收起來；床邊選單還在等的時候，另一段劇情的選單把它蓋掉、選完收起來，床邊那一段就永遠等不到，劇情鎖解不開。
//   修法：舊的選單先收起來，新的那一段演完（劇情層數回到舊選單那一層）再放回去；誰蓋的記在 D.coverWho（卡住紀錄的 cover）。
// 檢查（從 src/game3d.js 抽出 choose／sceneBegin／sceneEnd 原樣執行，假的 DOM）：
//   1. 床邊選單（第 1 層）開著，另一段（第 2 層）開自己的選單：畫面換成新的、記下誰蓋的
//   2. 新的選完：那一段還沒演完（第 2 層）→ 床邊選單先不放回來
//   3. 那一段演完（sceneEnd 回到第 1 層）→ 床邊選單放回來，選得到，床邊那一段收到選的結果、劇情鎖解開
//   4. 同一層蓋上去的（沒有自己的 sceneBegin）：選完馬上放回來
//   5. 讀檔、新遊戲（GM.chooseReset）：還沒選的都不要了，之後不會冒出來
//   6. 一般的一個接一個選單（沒有蓋到）照舊
// 修改前（v9.10.2 的 choose）：第 3 項 FAIL（床邊那一段永遠等不到）。用法：node tests/choose_cover_unit.js [game3d.js 路徑]
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const SRC=fs.readFileSync(process.argv[2]||path.join(ROOT,'src/game3d.js'),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
// 抽出：選單（choose 前面的說明到 GM.choose=choose;）、sceneBegin、sceneEnd
const a=SRC.indexOf('  /* 選單疊在另一個還沒選的選單上')>=0?SRC.indexOf('  /* 選單疊在另一個還沒選的選單上'):SRC.indexOf('  function choose(options,opt)');
const b=SRC.indexOf('  GM.choose=choose;');
const sb=SRC.match(/\n  function sceneBegin\(opts\)\{[^\n]*\n/), se=SRC.match(/\n  function sceneEnd\(\)\{[^\n]*\n/);
check('0. 抽得到 choose、sceneBegin、sceneEnd',a>=0&&b>a&&!!sb&&!!se);
if(fails){ console.log('FAILED '+fails); process.exit(1); }
// 假的 DOM
function el(id){ const cls=new Set(); return {id,style:{},children:[],_html:'',offsetHeight:40,scrollTop:0,clientHeight:300,scrollHeight:300,onscroll:null,textContent:'',
  classList:{add:(...c)=>c.forEach(x=>cls.add(x)),remove:(...c)=>c.forEach(x=>cls.delete(x)),contains:c=>cls.has(c),toggle:(c,on)=>{ if(on===undefined) on=!cls.has(c); if(on) cls.add(c); else cls.delete(c); return on; }},
  set innerHTML(v){ this._html=v; if(v==='') this.children=[]; }, get innerHTML(){ return this._html; },
  appendChild(c){ this.children.push(c); return c; } }; }
const els={}; const $=id=>els[id]||(els[id]=el(id)); $('choices').classList.add('hide'); $('dlg').classList.add('hide');
const ctx={ $, D:{active:false,resolve:null,typing:false,full:'',shown:0,timer:0,busyDepth:0,busyWho:[],stale:false}, GM:{}, A3:{blip(){}}, ADV:{active:false,skip:false,end(){}}, SOCIAL:undefined,
  E:{player:{busy:false,path:null,target:null,pose:'idle',obj:{position:{}}},npcs:[],endCinematic(){}},
  uncover(){}, overFade(){}, subst:t=>t, hideHUD(){}, letterbox(){}, toast(){}, performance:{now:()=>0}, requestAnimationFrame:f=>f(),
  document:{createElement:()=>{ const x=el('btn'); x.onclick=null; return x; }}, console:{warn(){ ctx.warns.push([...arguments]); },log:console.log}, warns:[] };
vm.createContext(ctx);
vm.runInContext(SRC.slice(a,b)+'\n  GM.choose=choose;\n'+sb[0]+se[0]+'\nGM.sceneBegin=sceneBegin; GM.sceneEnd=sceneEnd;',ctx,{filename:'game3d.js(抽出)'});
const {GM,D}=ctx; const box=$('choices');
const shown=()=>box.classList.contains('hide')?null:box.children.map(c=>c.innerHTML.replace(/<div.*$/,''));
const click=i=>box.children[i].onclick();
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
  // 1～3：床邊選單被第 2 層的選單蓋掉
  let bedGot=null; const bed=(async()=>{ GM.sceneBegin(); const i=await GM.choose([{t:'睡到明天早上'},{t:'再撐一下'}]); GM.sceneEnd(); bedGot=i; })();
  await tick(); check('1a. 床邊選單開著（第 1 層）',JSON.stringify(shown())==='["睡到明天早上","再撐一下"]'&&D.busyDepth===1,JSON.stringify(shown()));
  let otherGot=null; const other=(async()=>{ GM.sceneBegin(); const k=await GM.choose([{t:'出發：臺北的家樓下 14:00'},{t:'不去了'}]); otherGot=k; await tick(); GM.sceneEnd(); })();
  await tick(); check('1b. 另一段的選單蓋上去：畫面是新的、記下誰蓋的（D.coverWho）、console 有警告',JSON.stringify(shown())==='["出發：臺北的家樓下 14:00","不去了"]'&&D.busyDepth===2&&('coverWho' in D?!!D.coverWho:false)&&ctx.warns.length===1,JSON.stringify(shown())+' cover='+D.coverWho);
  click(0); check('2. 新的選完、那一段還在第 2 層：床邊選單先不放回來',shown()===null&&otherGot===null||shown()===null,JSON.stringify(shown()));
  await other; await tick();
  check('3a. 那一段演完（回到第 1 層）：床邊選單放回來',JSON.stringify(shown())==='["睡到明天早上","再撐一下"]'&&otherGot===0&&D.busyDepth===1,JSON.stringify(shown())+' depth='+D.busyDepth);
  if(shown()) click(1); await bed; await tick();
  check('3b. 床邊那一段收到選的結果（再撐一下＝1）、劇情鎖解開（0 層）、選單收起來',bedGot===1&&D.busyDepth===0&&shown()===null,'bed='+bedGot+' depth='+D.busyDepth);
  // 4：同一層蓋上去的
  let g1=null, g2=null; const p1=(async()=>{ GM.sceneBegin(); g1=await GM.choose([{t:'A1'},{t:'A2'}]); GM.sceneEnd(); })(); await tick();
  const p2=(async()=>{ g2=await GM.choose([{t:'B1'},{t:'B2'}]); })(); await tick();
  check('4a. 同一層蓋上去：畫面是 B',JSON.stringify(shown())==='["B1","B2"]');
  click(1); await p2; await tick();
  check('4b. B 選完馬上放回 A',g2===1&&JSON.stringify(shown())==='["A1","A2"]',JSON.stringify(shown()));
  if(shown()) click(0); await p1; await tick(); check('4c. A 選得到、劇情鎖解開',g1===0&&D.busyDepth===0);
  // 5：讀檔、新遊戲
  let lost=null; (async()=>{ GM.sceneBegin(); lost=await GM.choose([{t:'舊1'},{t:'舊2'}]); })(); await tick();
  let x=null; const px=(async()=>{ x=await GM.choose([{t:'新1'}]); })(); await tick();
  if(GM.chooseReset){ GM.chooseReset(); D.busyDepth=0; D.busyWho.length=0; }
  let y=null; const py=(async()=>{ y=await GM.choose([{t:'讀檔後1'},{t:'讀檔後2'}]); })(); await tick(); click(0); await py; await tick();
  check('5. 讀檔、新遊戲（GM.chooseReset）以後：舊的選單不會再冒出來',!!GM.chooseReset&&y===0&&shown()===null&&lost===null,JSON.stringify(shown()));
  // 6：一個接一個
  const seq=[]; const ps=(async()=>{ GM.sceneBegin(); seq.push(await GM.choose([{t:'問1'},{t:'問2'}])); seq.push(await GM.choose([{t:'再問1'},{t:'再問2'}])); GM.sceneEnd(); })();
  await tick(); click(1); await tick(); check('6a. 一個接一個：第二個選單照常出現',JSON.stringify(shown())==='["再問1","再問2"]',JSON.stringify(shown())); click(0); await ps; await tick();
  check('6b. 選完收起來、沒有多冒出來的選單',seq.join()==='1,0'&&shown()===null&&D.busyDepth===0,seq.join()+' '+JSON.stringify(shown()));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
