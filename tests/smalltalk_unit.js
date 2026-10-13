// 閒聊（story3d.js 的 S.smallTalk）——不需要瀏覽器。2026-10-13 使用者試玩回報：
//   洪珮瑜（不太熟的同學）一直重複「喜歡聽 podcast」；高子晴第一次在校園聊天就說「期末成發你要來。這不是問句。」（那時候還不熟，也還沒去吉他社）。
// 檢查：一天只聊一句新的、同一天再找是打招呼；輪流不重複（說完一輪才重來、不會連續兩次同一句）；
//       高子晴那三句要在吉他社（ev_ziqing_club）之後；不太熟的同學用旁白記聊到的事，不把 facts 當台詞重複講；舊存檔沒有 G.social.small 照常。
// 修改前：沒有 S.smallTalk（第 1 項就失敗）。用法：node tests/smalltalk_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
for(const f of ['src/data/characters.js','src/data/events.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK)\s*=/mg,'global.$1='),{filename:f});
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8').replace(/^const STORY\s*=/m,'global.STORY='),{filename:'src/story3d.js'});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DONE={}; global.EVENTS={cond:c=>!c||!c.events||c.events.every(e=>DONE[e])};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&(CHARACTERS[id].nickname||CHARACTERS[id].name))||id};
check('有 STORY.smallTalk',typeof STORY.smallTalk==='function');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const G={day:5,social:{rel:{},mem:{}},flags:{}};
const talk=id=>STORY.smallTalk(G,id), txt=L=>L.say||L.narr;
// 洪珮瑜（pool_9：不太熟的同學，facts＝喜歡聽 podcast、想出國）
{ const id=Object.keys(CHARACTERS).find(k=>CHARACTERS[k].name==='洪珮瑜'); const out=[]; for(let d=0;d<4;d++){ G.day=10+d; out.push(talk(id)); out.push(talk(id)); out.push(talk(id)); }
  check('洪珮瑜：一天只聊一句新的，同一天再找他是打招呼（旁白）',out.every((L,i)=>i%3===0?L.fresh:(!L.fresh&&/打了個招呼/.test(L.narr))),out.map(txt).slice(0,3).join(' / '));
  const fresh=out.filter(L=>L.fresh).map(txt); check('洪珮瑜：每天新的那一句輪流（podcast、出國交替，不會連續兩天同一句）',fresh.every((t,i)=>i===0||t!==fresh[i-1]),fresh.join(' / '));
  check('洪珮瑜：facts 用旁白（不是她開口說「喜歡聽 podcast。」）',fresh.every(t=>/^（你們聊了幾句。/.test(t))&&!out.some(L=>L.say),fresh[0]); }
// 高子晴：吉他社之前、之後
{ const id='heroine_04'; delete G.social.small; G.day=20; const a=talk(id); G.day=21; const b=talk(id);
  check('高子晴：還沒去吉他社，不會說「期末成發你要來」「手指好了沒」「阿凱昨天又通宵」',![a,b].some(L=>/成發|手指|通宵/.test(txt(L))),txt(a)+' / '+txt(b));
  DONE.ev_ziqing_club=1; const seen=[]; for(let d=22;d<28;d++){ G.day=d; seen.push(txt(talk(id))); }
  check('高子晴：去過吉他社之後，三句都會輪到、說完一輪才重來',['成發','手指','通宵'].every(k=>seen.slice(0,3).some(t=>t.includes(k)))&&seen.every((t,i)=>i===0||t!==seen[i-1]),seen.join(' / ')); }
// 有自己閒聊的人（芷若）：輪流
{ const id='heroine_02'; const seen=[]; for(let d=40;d<46;d++){ G.day=d; seen.push(txt(talk(id))); }
  check('芷若：三句輪流，不會連續兩天同一句；六天每句都說了兩次',seen.every((t,i)=>i===0||t!==seen[i-1])&&new Set(seen).size===3,seen.join(' / ')); }
// 舊存檔：沒有 G.social.small
{ const G2={day:3,social:{rel:{},mem:{}},flags:{}}; const L=STORY.smallTalk(G2,'heroine_02'); check('舊存檔（沒有 small）照常：第一句、記下來',!!L.say&&!!G2.social.small&&G2.social.small.heroine_02.day===3); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
