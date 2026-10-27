// 一句話被另一段的話蓋掉（STUCK-HARDEN-1027；BUG-AN-NOODLE-STUCK-1027 的保底，子代理 an-stuck-1027 10-27 21:0x 回報）——不需要瀏覽器。
//   game3d.js 的 say 只留一個等點擊的 resolve：一句話還在等、另一段的 say 進來，先開始的那一段永遠等不到＝停在那一句的畫面、劇情鎖解不開；
//   staleCheck 又把「2D 畫面（ADV）開著」一直算成還在演，這類卡住不放開讀檔、不記 _stuck。
//   修法：同選單（X81 chooseStack）——舊的那一句先收起來，新的那一段演完（劇情層數回到舊那一句那一層；或點完一句以後新的那一段沒有接著說）再整句放回去；
//   只剩 ADV 開著（沒有對話、選項、事件…）放寬到 30 秒才算停住。另外五處「延後才開演」決定的那一刻就鎖住。
// 檢查（從 src/game3d.js 抽出 say、dlgAdvance、choose、sceneBegin、sceneEnd、staleCheck 原樣執行，假的 DOM）：
//   1. A（第 1 層）一句話還在等，B（第 2 層）說話：畫面是 B 的話、記下誰蓋的（D.coverWho）、console 警告
//   2. 點 B 的第一句：B 接著說第二句（A 不會插進來）
//   3. B 演完（sceneEnd 回到第 1 層）：A 那一句整句放回來（不重打字、不重記對話紀錄）；點了 A 接著演完、劇情鎖解開
//   4. 同一層蓋上去的（B 沒有自己的 sceneBegin）：點完 B、B 沒有接著說 → A 放回來
//   5. 讀檔、新遊戲（GM.chooseReset）：還沒點的那一句不要了，之後不會冒出來
//   6. 一般的一句接一句（沒有蓋到）照舊、沒有警告
//   7. staleCheck：只剩 ADV 開著 15 秒不算停住、31 秒算停住（放開讀檔、記 _stuck）；對話開著 60 秒照舊不算
//   8. 五處延後開演（closed2_3d.js、lupstory3d.js、sideq3d.js、us208_3d.js、zq_testbuild3d.js）：決定的那一刻（Promise.resolve().then 之前）就 sceneBegin，
//      演完 sceneEnd＋自動存檔，中途讀了別的檔（GM.G 換了）不動新的那一局
// 修改前（開發分支 7f7fd7964）：1b、3a、3b FAIL，之後 A 永遠等不到、測試跑不完（FAILED，結束碼 1）。用法：node tests/say_cover_unit.js [game3d.js 路徑]
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const SRC=fs.readFileSync(process.argv[2]||path.join(ROOT,'src/game3d.js'),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
let finished=false; process.on('exit',()=>{ if(!finished){ console.log('FAILED（沒跑完：有一段劇情一直等不到點擊）'); process.exitCode=1; } });   /* 修改前 A 永遠等不到，Node 事件迴圈空了就結束：不能當成通過 */
// 抽出：say（說明到 GM.say=say;）、dlgAdvance、choose（說明到 GM.choose=choose;）、sceneBegin、sceneEnd、staleCheck
const a0=SRC.indexOf('  /* 一句話還在等點擊')>=0?SRC.indexOf('  /* 一句話還在等點擊'):SRC.indexOf('  function say(who,text,opts)'), a1=SRC.indexOf('  GM.say=say;');
const adv=SRC.match(/\n  function dlgAdvance\(\)\{[^\n]*\n/);
const c0=SRC.indexOf('  /* 選單疊在另一個還沒選的選單上'), c1=SRC.indexOf('  GM.choose=choose;');
const sb=SRC.match(/\n  function sceneBegin\(opts\)\{[^\n]*\n/), se=SRC.match(/\n  function sceneEnd\(\)\{[^\n]*\n/);
const sc=SRC.match(/\n  let staleT=0;\n  function staleCheck\(rdt\)\{[\s\S]*?toast\('畫面好像停住了[^\n]*\n/);
check('0. 抽得到 say、dlgAdvance、choose、sceneBegin、sceneEnd、staleCheck',a0>=0&&a1>a0&&!!adv&&c0>=0&&c1>c0&&!!sb&&!!se&&!!sc);
if(fails){ console.log('FAILED '+fails); process.exit(1); }
function el(id){ const cls=new Set(); return {id,style:{},children:[],_html:'',offsetHeight:40,scrollTop:0,clientHeight:300,scrollHeight:300,onscroll:null,textContent:'',
  classList:{add:(...c)=>c.forEach(x=>cls.add(x)),remove:(...c)=>c.forEach(x=>cls.delete(x)),contains:c=>cls.has(c),toggle:(c,on)=>{ if(on===undefined) on=!cls.has(c); if(on) cls.add(c); else cls.delete(c); return on; }},
  set innerHTML(v){ this._html=v; if(v==='') this.children=[]; }, get innerHTML(){ return this._html; }, appendChild(c){ this.children.push(c); return c; } }; }
const els={}; const $=id=>els[id]||(els[id]=el(id)); $('choices').classList.add('hide'); $('dlg').classList.add('hide');
const logs=[];
const ctx={ $, D:{active:false,resolve:null,typing:false,full:'',shown:0,timer:0,busyDepth:0,busyWho:[],stale:false}, GM:{}, A3:{blip(){}}, S:{textSpeed:2},
  ADV:{active:false,skip:false,end(){ ctx.ADV.active=false; },speaker(){},log(n,t){ logs.push(t); },narrate(){}}, SOCIAL:undefined, CHAR:{setExpr(){}},
  E:{player:{busy:false,path:null,target:null,pose:'idle',obj:{position:{}}},npcs:[],endCinematic(){},cam:{mode:'follow'}},
  G:{zone:'noodle',day:14,hour:18}, phoneOpen:false, menuOpen:false, walks:new Set(), stuck:[],
  uncover(){}, overFade(){}, subst:t=>t, hideHUD(){}, letterbox(){}, toasts:[], toast(t){ ctx.toasts.push(t); }, stuckLog(){ ctx.stuck.push(1); },
  performance:{now:()=>0}, requestAnimationFrame:f=>f(), setTimeout:(f,ms)=>setTimeout(f,ms),
  document:{createElement:()=>{ const x=el('btn'); x.onclick=null; return x; }}, console:{warn(){ ctx.warns.push([...arguments]); },log:console.log}, warns:[] };
vm.createContext(ctx);
vm.runInContext(SRC.slice(a0,a1)+'\n  GM.say=say;\n'+adv[0]+'\n  GM.dlgAdvance=dlgAdvance;\n'+SRC.slice(c0,c1)+'\n  GM.choose=choose;\n'+sb[0]+se[0]+'\nGM.sceneBegin=sceneBegin; GM.sceneEnd=sceneEnd;\n'+sc[0]+'\nthis.staleCheck=staleCheck;',ctx,{filename:'game3d.js(抽出)'});
const {GM,D}=ctx;
const line=()=>$('dlg').classList.contains('hide')||!D.active?null:D.full;   /* 畫面上那一句（打字效果打到一半也算那一句）*/
const click=()=>{ if(D.typing) GM.dlgAdvance(); GM.dlgAdvance(); };   /* 打字中第一下是整句顯示，第二下才翻頁（同玩家點兩下）*/
const tick=()=>new Promise(r=>setTimeout(r,5));
(async()=>{
  // 1～3
  const A=[]; const pa=(async()=>{ GM.sceneBegin(); ctx.ADV.active=true; await GM.say({name:'以安'},'A1：這家的麵我吃了四年。'); A.push('A1'); await GM.say({name:'以安'},'A2：……你也會吃四年嗎。'); A.push('A2'); GM.sceneEnd(); })();
  await tick(); check('1a. A 的第一句在畫面上（第 1 層）',line()==='A1：這家的麵我吃了四年。'&&D.busyDepth===1,line());
  const B=[]; const pb=(async()=>{ GM.sceneBegin(); await GM.say({name:'阿哲'},'B1：長桌還有位子。'); B.push('B1'); await GM.say({name:'阿哲'},'B2：坐這邊。'); B.push('B2'); GM.sceneEnd(); })();
  await tick(); check('1b. B 蓋上去：畫面是 B 的話、記下誰蓋的、console 警告',line()==='B1：長桌還有位子。'&&D.busyDepth===2&&!!D.coverWho&&ctx.warns.length===1,line()+' cover='+D.coverWho);
  click(); await tick(); check('2. 點 B 的第一句：B 接著說第二句（A 沒有插進來）',line()==='B2：坐這邊。'&&J(B)===J(['B1'])&&J(A)===J([]),line());
  const nlog=logs.length;   /* B 的兩句都記過了：之後 A 放回來不再記 */
  click(); await pb; await tick();
  check('3a. B 演完（回到第 1 層）：A 那一句整句放回來（不重打字、不重記對話紀錄）',line()==='A1：這家的麵我吃了四年。'&&$('dlgText').textContent===line()&&!D.typing&&$('dlgNext').style.visibility==='visible'&&logs.length===nlog&&D.busyDepth===1,J({line:line(),typing:D.typing,logs:logs.length-nlog}));
  GM.dlgAdvance(); await tick(); check('3b. 點了 A 接著演第二句（放回來的那一句點一下就翻頁）',line()==='A2：……你也會吃四年嗎。'&&J(A)===J(['A1']),line());
  click(); await pa; await tick(); check('3c. A 演完、劇情鎖解開（0 層）',J(A)===J(['A1','A2'])&&D.busyDepth===0&&!D.active,J({A,depth:D.busyDepth}));
  // 4 同一層
  const A4=[]; const p4=(async()=>{ GM.sceneBegin(); await GM.say(null,'A4-1'); A4.push(1); GM.sceneEnd(); })(); await tick();
  const B4=[]; const q4=(async()=>{ await GM.say(null,'B4-1'); B4.push(1); })(); await tick();
  check('4a. 同一層蓋上去：畫面是 B',line()==='B4-1',line());
  click(); await q4; await tick(); check('4b. 點完 B、B 沒有接著說：A 放回來',J(B4)===J([1])&&line()==='A4-1',line());
  click(); await p4; await tick(); check('4c. A 收到、劇情鎖解開',J(A4)===J([1])&&D.busyDepth===0);
  // 5 讀檔
  let lost=null; (async()=>{ GM.sceneBegin(); await GM.say(null,'舊的那一句'); lost=1; })(); await tick();
  let nw=null; const pn=(async()=>{ GM.sceneBegin(); await GM.say(null,'讀檔前蓋上去的'); nw=1; })(); await tick();
  GM.chooseReset(); D.busyDepth=0; D.busyWho.length=0; D.active=false; D.resolve=null; $('dlg').classList.add('hide');
  let y=null; const py=(async()=>{ GM.sceneBegin(); await GM.say(null,'讀檔後'); y=1; GM.sceneEnd(); })(); await tick(); click(); await py; await tick();
  check('5. 讀檔（GM.chooseReset）以後：舊的那一句不會冒出來',y===1&&line()===null&&lost===null,J({line:line(),lost}));
  // 6 一句接一句
  const w0=ctx.warns.length, seq=[]; const ps=(async()=>{ GM.sceneBegin(); await GM.say(null,'一'); seq.push(1); await GM.say(null,'二'); seq.push(2); GM.sceneEnd(); })();
  await tick(); click(); await tick(); check('6a. 一句接一句：第二句照常',line()==='二',line()); click(); await ps; await tick();
  check('6b. 演完收起來、沒有警告',J(seq)===J([1,2])&&line()===null&&ctx.warns.length===w0&&D.busyDepth===0);
  // 7 staleCheck
  const run=(sec)=>{ for(let t=0;t<sec;t+=0.5) ctx.staleCheck(0.5); };
  D.busyDepth=1; D.stale=false; D.active=false; ctx.ADV.active=true; ctx.stuck.length=0; run(15);
  check('7a. 只剩 ADV 開著 15 秒：不算停住',!D.stale&&ctx.stuck.length===0);
  run(16); check('7b. 只剩 ADV 開著 31 秒：算停住（記 _stuck、提示可以讀檔）',D.stale&&ctx.stuck.length===1&&/畫面好像停住了/.test(ctx.toasts[ctx.toasts.length-1]||''),J({stale:D.stale,stuck:ctx.stuck.length}));
  D.stale=false; ctx.stuck.length=0; D.active=true; run(60); check('7c. 對話開著（等點擊）60 秒：照舊不算停住',!D.stale&&ctx.stuck.length===0);
  D.active=false; ctx.ADV.active=false; run(11); check('7d. 沒有 ADV、什麼都沒在演 11 秒：照舊算停住',D.stale&&ctx.stuck.length===1);
  D.busyDepth=0; D.stale=false;
  // 8 五處延後開演
  const bad=[]; for(const f of ['closed2_3d.js','lupstory3d.js','sideq3d.js','us208_3d.js','zq_testbuild3d.js']){ const s=fs.readFileSync(path.join(ROOT,'src',f),'utf8');
    const k=s.indexOf('STUCK-HARDEN-1027'); if(k<0){ bad.push(f+'：沒有改'); continue; } const ln=s.slice(s.lastIndexOf('\n',k)+1,s.indexOf('\n',k));
    const iB=ln.search(/GM\.sceneBegin\(\)/), iP=ln.indexOf('Promise.resolve().then('), iE=ln.search(/finally\(\(\)=>\{[^}]*GM\.G===G[^}]*GM\.sceneEnd\(\)[^}]*GM\.autosave\(\)/);
    if(!(iB>=0&&iP>iB)) bad.push(f+'：sceneBegin 不在 Promise.resolve().then 之前'); if(iE<0) bad.push(f+'：finally 沒有 sceneEnd＋autosave（看 GM.G===G）'); }
  check('8. 五處延後開演：決定的那一刻就 sceneBegin，演完 sceneEnd＋自動存檔（中途讀檔不動新的那一局）',!bad.length,J(bad));
  finished=true; console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
