// 沛珊 P2「為什麼念法律」（ev_peishan_doubt；BB_95 第 2-8 節完整版；使用者 2026-10-14 解除大一上交接包暫緩、AA 轉達）——不需要瀏覽器。
// 檢查：三個選項的文字（第一個是「我想知道事情『應該』怎麼處理。」）；三個分支的反應照 BB_95；三個選項的數值與選項三的記憶和原本相同（備註照 BB_95）；
//       結尾「她把書包背起來」＋「讀書會要開始了」（週三晚上在萬才館）或「我要去上課了」（其他）＋「剛剛那個問題，你想到再跟我說。」只說一次；
//       開場自我介紹只在還沒認識時說，讀書會那句只在週三晚上的萬才館；只發生一次（once）；沒有「分數到了」和企劃組禁用的模板句。
// 用法：node tests/peishan_doubt_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){}}; global.CHAR={setExpr(){}};
let said=[], opts=[], pick=0, G=null;
const GM={get G(){ return G; },E:{q:{level:'medium'},player:{busy:false,obj:{position:{x:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null},D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); return pick; }};
const at=(zone,weekday,hour)=>{ G={day:20,hour,zone,weekday,flags:{},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null}; SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; };
const ev=STORY_EVENTS.find(e=>e.id==='ev_peishan_doubt');
const lines=()=>said.map(s=>s.t);
const BANNED=['分數到了','謝謝你沒有馬上給我建議','不要跟別人講'];
const PS='classmate_peishan', rel=()=>Object.assign({},SOCIAL.rel(PS));
(async()=>{
  check('事件存在、只發生一次（once）、觸發條件照舊（圖書館／萬才館／校園、互動、priority 4）',!!ev&&ev.once===true&&JSON.stringify(ev.location)===JSON.stringify(['library','wancai','campus'])&&ev.trigger==='interact'&&ev.priority===4,ev&&JSON.stringify({once:ev.once,location:ev.location}));
  check('events.js 整個檔案找不到「分數到了」、「謝謝你沒有馬上給我建議」、「不要跟別人講」',BANNED.every(w=>!fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8').includes(w)));
  /* 三個選項：先認識她（不播自我介紹），在總圖、週二下午 */
  /* AA_207 §5（BB_167 SC4 第 7 列）：#should、#help 改成具體的追問（原本「我喜歡這個詞……是誰說的應該」「我以前也這樣說……不一定要背條文」）*/
  const want=[
    {opt:'「我想知道事情『應該』怎麼處理。」',react:['應該喔。……那是誰決定什麼叫應該？老師嗎？']   /* AA_207 §7 第 4 列：「應該。」和旁白「她重複一次。」刪掉 */,d:{fam:3,comf:3},mem:false},
    {opt:'「想幫人。」',react:['幫人喔。……可是社工系也可以幫人吧？'],d:{fam:3,resp:2},mem:false},
    {opt:'「妳呢？」',react:['我在旁聽哲學系的課。上禮拜坐在那間教室，比坐在A館這一個多月都自在。','……我還沒跟家裡說。','她停了一下。','好奇怪。講出來以後，聲音比我想的還大。'],d:{fam:4,trust:3},mem:true}];
  for(let k=0;k<3;k++){ at('library',2,15); SOCIAL.meet(PS,'library'); const r0=rel(); pick=k; await EVENTS.run(ev); const L=lines(), r1=rel(), w=want[k];
    check('選項 '+(k+1)+'：三個選項的文字（第一個換成 BB 寫好的）',JSON.stringify(opts[0])===JSON.stringify(want.map(x=>x.opt)),JSON.stringify(opts[0]));
    const q=L.indexOf('欸，你為什麼會來念法律？……除了考上以外。');   /* AA_236 B3 口語改稿；AA_207 §7 第 4 列：「我是說」全體禁用 */
    check('選項 '+(k+1)+'：問句照 AA_236 B3；已經認識她，不再自我介紹',q===0&&!L.includes('郭沛珊。'),L[0]);
    check('選項 '+(k+1)+'：她的反應照 BB_95',JSON.stringify(L.slice(1,1+w.react.length))===JSON.stringify(w.react),JSON.stringify(L.slice(1,1+w.react.length)));
    const dims=['fam','trust','aff','resp','comf','rom']; const got={}; for(const dm of dims){ const dd=(r1[dm]||0)-(r0[dm]||0); if(dd) got[dm]=dd; }
    check('選項 '+(k+1)+'：數值和原本一樣 '+JSON.stringify(w.d),JSON.stringify(got)===JSON.stringify(w.d),JSON.stringify(got));
    const im=(G.social.mem[PS]||[]).filter(m=>m.tag==='IMPORTANT_CONVERSATION');
    check('選項 '+(k+1)+'：'+(w.mem?'記下 IMPORTANT_CONVERSATION（她在想別的路）':'不加記憶'),w.mem?(im.length===1&&im[0].note==='她在想別的路'):im.length===0,JSON.stringify(im));
    const tail=L.slice(-3);
    check('選項 '+(k+1)+'：結尾（不是週三晚上的萬才館）＝「她把書包背起來。」「我要去上課了。」「剛剛那個問題，你想到再跟我說。」，只說一次',JSON.stringify(tail)===JSON.stringify(['她把書包背起來。','我要去上課了。','剛剛那個問題，你想到再跟我說。'])&&L.filter(t=>/你想到再跟我說/.test(t)).length===1&&!L.includes('讀書會要開始了。'),JSON.stringify(tail));
    check('選項 '+(k+1)+'：沒有禁用句',BANNED.every(b=>!L.some(t=>t.includes(b))));
    check('選項 '+(k+1)+'：演完以後不會再發生（once）',EVENTS.check(ev)===false); }
  /* 週三晚上在萬才館、第一次見面 */
  { at('wancai',3,18.5); pick=0; await EVENTS.run(ev); const L=lines();
    check('週三晚上在萬才館、還不認識：只說「郭沛珊。」，不提讀書會（AA_236 A1、A3：法服沒有讀書會，條件句整句拿掉）',L[0]==='郭沛珊。'&&!L.some(t=>/讀書會/.test(t)),JSON.stringify(L.slice(0,2)));
    check('週三晚上在萬才館：結尾和其他晚上一樣「我先回去了。」',L.includes('我先回去了。')&&!L.includes('我要去上課了。'),JSON.stringify(L.slice(-3)));
    check('第一次見面以後記下 FIRST_MET',SOCIAL.has(PS,'FIRST_MET')); }
  /* 其他時間地點、第一次見面：只說名字，不提讀書會 */
  for(const [zone,wd,h,why] of [['library',3,18.5,'週三晚上在總圖'],['wancai',2,18.5,'週二晚上在萬才館'],['wancai',3,14,'週三下午在萬才館'],['campus',5,12,'週五中午在校園']]){ at(zone,wd,h); pick=1; await EVENTS.run(ev); const L=lines();
    const end=h>=18?'我先回去了。':'我要去上課了。', other=h>=18?'我要去上課了。':'我先回去了。';   /* 18 點以後「我先回去了。」（AA 建議、BB_95 2-8 bdd96d9：事件沒有時間限制，晚上不說去上課）*/
    check(why+'、還不認識：只說「郭沛珊。」、不提讀書會；結尾「'+end+'」（不說「'+other+'」）',L[0]==='郭沛珊。'&&!L.some(t=>/讀書會/.test(t))&&L.includes(end)&&!L.includes(other),JSON.stringify([L.slice(0,2),L.slice(-3)])); }
  /* 舊存檔（AA 2026-10-14）：舊版沒有 once，但演過的事件都記在 G.events.done——玩過舊版的存檔不會再演一次新版 */
  { at('library',2,15); SOCIAL.meet(PS,'library'); G.events.done.ev_peishan_doubt=2; G.events.last.ev_peishan_doubt=8; check('舊存檔演過舊版（events.done 有紀錄、沒有 once 的紀錄）：新版不再觸發',EVENTS.check(ev)===false); }
  /* 舊存檔的記憶備註「她在考慮轉系」：人物面板顯示「她在想別的路」，存檔不改（AA 2026-10-14）*/
  { at('library',2,15); SOCIAL.remember(PS,'IMPORTANT_CONVERSATION','她在考慮轉系'); const m=(G.social.mem[PS]||[]).find(x=>x.tag==='IMPORTANT_CONVERSATION');
    check('舊備註「她在考慮轉系」：面板顯示「她在想別的路」、存檔裡照舊',SOCIAL.noteShown(PS,m)==='她在想別的路'&&m.note==='她在考慮轉系'&&/她在想別的路/.test(SOCIAL.describe(PS)),SOCIAL.describe(PS)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
