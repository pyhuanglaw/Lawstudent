// SHOP-LIFE-AA826-1112：店員的進門招呼、吃飯時間在店裡遇到同學的第一句（AA_826 企劃線 f231f0514（SHOP-AA826B-1112：補宥辰、語彤／明軒／阿哲改句、前任不排）；src/shopmeet3d.js、src/data/shop_meet_lines.js）——不需要瀏覽器（D131）。
// 做法照 tests/shop_life_audit_1112_unit.js：在 Node 照 index.html 的順序把整個遊戲的程式全部載入，建出真正的店（Z3.ZONES[id].build）、叫真的 STORY.populate（店員、同學都是遊戲自己放的），
//   只把 GM.say／choose 換成記錄用的。
//   1  資料檔逐字對稿（四間店各三句、說話的人；十位各兩句、學姊交往中兩句）；匯入工具 --check；白名單；index.html 的順序；src/shopmeet3d.js、src/shoplife3d.js 沒有自己寫的中文句子
//   2  山嵐書店、大步球鞋、好拍運動、新生運動廣場：走進去（店開著、店員站在店裡）＝店員說稿的那一句；同一天再進來不說；隔天說下一句（三句輪流）；
//      打烊以後、店裡沒有店員、別的場景在演、約在這間店的那一趟＝不說
//   3  花序：走進去＝花藝師說 AA_792 staff.greet 的一句（一天一次）；到櫃檯買花前那一句是下一句（不連著同一句）
//   4  越好吃小館、客居雲南：走進去、老闆娘站在店裡、GG3.tick 說稿的進門句（一天一次；原本那一套，這裡確認真的會說）
//   5  吃飯時間在店裡遇到同學（SHOPLIFE 排進去的人）：朋友以上＝他的第一句是稿的那一句（STORY.PRE_TALK）；同一餐再點他不再說；下一次見面說另一句（兩句輪流）；
//      不到朋友＝不說；不是 SHOPLIFE 排的（他照原本的作息在店裡）＝不說；宥辰（f231f0514 補了兩句）照稿；分手後的前任＝不排、不說，回到朋友以後照舊；學姊交往中＝交往中的那一組、括號那一句是旁白
//   6  真的「和他說話」（STORY.talkCharacter）：第一句＝稿的那一句，後面照原本的閒聊繼續
//   7  存檔：只多 G.flags.SHOP_GREET、SHOP_MEAL_HI；沒有這兩個旗標的舊存檔＝從第一句開始、不出錯
// 修改前（a5a4cdfa67）：沒有 src/shopmeet3d.js、資料檔——第 0 節就 FAIL（七間店有店員但進門不說話；店裡遇到同學沒有專屬的第一句）。
// 用法：node tests/shop_meet_aa826_1112_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process'); const ROOT=path.resolve(__dirname,'..');
const SHA='f231f0514', DOC='docs/story_planning/AA_826_shop_backfill_1.json', DATA='src/data/shop_meet_lines.js';
process.on('unhandledRejection',()=>{}); global.window=global; global.self=global; const warns=[]; console.warn=(...a)=>{ warns.push(a.map(String).join(' ').slice(0,200)); };
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'||k==='createImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
const el=()=>({getContext:()=>ctx2d,style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},children:[],childNodes:[],width:1,height:1,appendChild(){},removeChild(){},addEventListener(){},removeEventListener(){},setAttribute(){},getAttribute:()=>null,querySelector:()=>null,querySelectorAll:()=>[],remove(){},getBoundingClientRect:()=>({left:0,top:0,width:1,height:1}),focus(){},blur(){},insertBefore(){}});
global.document={ createElementNS:()=>el(), createElement:()=>el(), getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, removeEventListener(){}, body:el(), documentElement:el(), head:el() };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.removeEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'',href:'',hash:''};
global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.fetch=()=>Promise.reject(new Error('no fetch in node')); global.requestAnimationFrame=()=>0; global.matchMedia=()=>({matches:false,addEventListener(){}});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

// ---------- 0 載入整個遊戲 ----------
const html=rd('index.html'); const FILES=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]); const loadErr=[];
for(const f of FILES){ if(/three-vrm|lz-string/.test(f)) continue; let src;
  try{ src=rd(f); }catch(e){ loadErr.push(f+'（沒有這個檔）'); continue; }
  src=src.replace(/^(const|let) (\w+)\s*=/mg,(m,k,n)=>'globalThis.'+n+'=');
  if(f==='src/game3d.js') src=src.replace('const GM={E:null,','const GM={_test:(e,g)=>{ E=e; G=g; GM.E=e; GM.G=g; },E:null,');
  try{ vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,160)); } }
const ok0=!loadErr.length&&typeof GAME!=='undefined'&&typeof SHOPMEET!=='undefined'&&typeof SHOP_MEET_LINES!=='undefined'&&typeof SHOPLIFE!=='undefined';
check('0 index.html 的程式全部載得進來（'+FILES.length+' 支）；有 SHOPMEET、SHOP_MEET_LINES',ok0,loadErr.slice(0,5).join(' | '));
if(!ok0){ console.log('FAILED '+fails); process.exit(1); }
const D=SHOP_MEET_LINES;

const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; ASSETS.loadOne=()=>new Promise(()=>{});
E.addNPC=n=>{ n.path=null; n.speed=n.speed||0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); }; E.addExtra=x=>{ (E.extras=E.extras||[]).push(x); return x; };
const GM=GAME, G=GM.defaults(); E.player={obj:new THREE.Group(),radius:0.32,lv:0,seat:null}; E.npcs=[]; GM._test(E,G); GM.bindSystems();
const DKm={}; const DK=key=>{ if(DKm[key]==null){ for(let d=-400;d<2500;d++) if(CALENDAR.dateOf(d).key===key){ DKm[key]=d; break; } } return DKm[key]; };
function enter(id,day,hour){ G.day=day; G.hour=hour; G.weekday=CALENDAR.dateOf(day).wd%7; G.zone=id; E.hour=hour; GM.enterN=(GM.enterN|0)+1;
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.extras=[]; E.exits=[]; E.spawnHint=null; GM.npc={}; GM.extras=[];
  const z=Z3.ZONES[id].build(E); z.def=Z3.ZONES[id]; if(z.id==null) z.id=id; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(z.nav) z.nav._cm=null; if(E.levels) for(const n of E.levels) n._cm=null; E.indoor=!!Z3.ZONES[id].indoor;
  E.player.obj.position.set(z.spawn.x,0,z.spawn.z); E.player.seat=null; E.player.lv=(z.spawn.lv|0); E.player.busy=false;
  STORY.populate(id,GM); return z; }
/* 記錄用的 GM（只換說話、選項、場景的外殼）*/
let said=[]; const picks=[];
GM.say=async(who,t)=>{ said.push([who?(who.name||String(who)):null,String(t)]); };
GM.choose=async o=>{ const w=picks.shift(); if(typeof w==='string'){ const k=o.findIndex(q=>String(q.t||q.text||'').includes(w)); return k<0?o.length-1:k; } return o.length-1; };   /* 沒指定＝最後一個（「不用了」「先這樣」那一類）*/
GM.sceneBegin=()=>{}; GM.sceneEnd=()=>{}; GM.cine=()=>{}; GM.face=()=>{}; GM.toast=()=>{}; GM.fade=async()=>{}; GM.autosave=()=>{}; GM.caption=()=>{}; GM.sleep=async()=>{}; GM.updateHUD=()=>{}; GM.memo=()=>{}; GM.titleIdle=false;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const clerks=()=>E.npcs.filter(n=>n.clerk), named=()=>E.npcs.filter(n=>n.charId);
const WED=DK('2025-10-08');
const ZONE_OF={shanlan:'xs_shanlan',dabu:'xs_dabu',haopai:'xs_haopai',xsports:'xs_xsports'};

(async()=>{
// ---------- 1 逐字對稿 ----------
let A=null;
await sec(1,()=>{ let raw=null; try{ raw=cp.execFileSync('git',['show',SHA+':'+DOC],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!raw) console.log('SKIP 1 讀不到企劃線 '+SHA+'（淺層複本：git fetch origin claude/magical-albattani-bk7b4n）');
  else { A=JSON.parse(raw);
    check('1 店員進門招呼：四間店（山嵐、大步、好拍、新生運動廣場）各三句、說話的人照稿（好拍是老闆）',J(Object.keys(D.staffGreet))===J(Object.values(ZONE_OF))&&Object.keys(ZONE_OF).every(k=>J(D.staffGreet[ZONE_OF[k]])===J({who:A.staff_greet[k].who,lines:A.staff_greet[k].greet})&&A.staff_greet[k].greet.length===3)&&D.staffGreet.xs_haopai.who==='老闆'&&D.staffGreet.xs_shanlan.who==='店員',J(D.staffGreet).slice(0,200));
    check('1 抽看原句：山嵐「歡迎，慢慢看。」、大步「可以拿下來看，沒關係。」、好拍「看拍子還是穿線？」、運動廣場「系服要整隊一起訂喔。」',D.staffGreet.xs_shanlan.lines[0]==='歡迎，慢慢看。'&&D.staffGreet.xs_dabu.lines[2]==='可以拿下來看，沒關係。'&&D.staffGreet.xs_haopai.lines[0]==='看拍子還是穿線？'&&D.staffGreet.xs_xsports.lines[2]==='系服要整隊一起訂喔。');
    const ids=Object.keys(A.meal_hello).filter(k=>k!=='note'&&k!=='when'&&!/_dating$/.test(k));
    /* 2026-11-12 SHOP-AA826B-1112 改期望——舊期望：九位（宥辰沒有句子）、語彤第二句「我在等外帶。」、明軒第一句「欸，一個人喔？這家加飯不用錢。」、阿哲第一句「欸你也來！我跟你講，點那個辣的。」。
       AA_826 lawww_answers 第 8 點：補宥辰；語彤／明軒／阿哲改成不分店的句子（這幾句不分店，哪一間都通）。*/
    check('1 遇到同學的第一句：十位各兩句照稿（以安、學姊、語彤、沛珊、柏翰、明軒、芯慈、阿哲、Alison、宥辰），都是遊戲裡的人物 id',ids.length===10&&ids.includes('classmate_youchen')&&J(Object.keys(D.mealHello))===J(ids)&&ids.every(id=>!!CHARACTERS[id]&&J(D.mealHello[id].base)===J(A.meal_hello[id])&&A.meal_hello[id].length===2),J(ids));
    check('1 學姊交往中那一組（heroine_05_dating）照稿；其他人沒有交往中的那一組',J(D.mealHello.heroine_05.dating)===J(A.meal_hello.heroine_05_dating)&&J(D.mealHello.heroine_05.dating)===J(['你吃了沒。','（她把旁邊的椅子拉開一點。）'])&&ids.filter(id=>D.mealHello[id].dating).length===1);
    check('1 抽看原句：以安「你也來吃這家。我剛點，還沒來。」、柏翰「你也吃這家？我很常來。」、Alison「我姊說這家不錯，我來驗證。」；學姊的句子沒有「學弟」',D.mealHello.heroine_01.base[0]==='你也來吃這家。我剛點，還沒來。'&&D.mealHello.classmate_bohan.base[1]==='你也吃這家？我很常來。'&&D.mealHello.yu.base[1]==='我姊說這家不錯，我來驗證。'&&!/學弟/.test(J(D.mealHello.heroine_05)));
    check('1 改過的句子照稿：宥辰兩句（「欸，你也來。我剛起床，這算早餐。」「這間放的歌還可以。你有推薦吃什麼嗎？」）、語彤第二句「我快吃完了。你慢慢吃。」、明軒第一句「欸，一個人喔？」、阿哲第一句「欸你也來！我都快吃完了你才來。」；舊的三句不在資料檔裡',
      J(D.mealHello.classmate_youchen)===J({base:['欸，你也來。我剛起床，這算早餐。','這間放的歌還可以。你有推薦吃什麼嗎？']})&&J(D.mealHello.classmate_youchen.base)===J(A.meal_hello.classmate_youchen)&&D.mealHello.heroine_03.base[1]==='我快吃完了。你慢慢吃。'&&D.mealHello.heroine_03.base[0]==='嗯。你也在。'&&D.mealHello.classmate_mingxuan.base[0]==='欸，一個人喔？'&&D.mealHello.zhe.base[0]==='欸你也來！我都快吃完了你才來。'&&!/等外帶|加飯不用錢|點那個辣的/.test(J(D.mealHello)),J([D.mealHello.classmate_youchen,D.mealHello.heroine_03,D.mealHello.classmate_mingxuan.base[0],D.mealHello.zhe.base[0]]));
    check('1 稿的 note 寫了前任不排（「分手後的前任不排進店裡遇到」「回到朋友（挽回或和好的旗標）以後照舊」）',/分手後的前任不排進店裡遇到/.test(A.meal_hello.note)&&/回到朋友（挽回或和好的旗標）以後照舊/.test(A.meal_hello.note));
    /* 資料檔每一句都原封不動在稿裡 */
    const all=[]; for(const z in D.staffGreet){ all.push(D.staffGreet[z].who); all.push(...D.staffGreet[z].lines); } for(const id in D.mealHello){ all.push(...D.mealHello[id].base); if(D.mealHello[id].dating) all.push(...D.mealHello[id].dating); }
    const src=[]; const w2=x=>{ if(typeof x==='string') src.push(x); else if(Array.isArray(x)) x.forEach(w2); else if(x&&typeof x==='object') for(const k of Object.keys(x)) w2(x[k]); }; w2(A.staff_greet); w2(Object.assign({},A.meal_hello,{note:null,when:null}));
    check('1 資料檔每一個字串都是稿裡完整的一句（'+all.length+' 個；沒有自己寫的字）',all.length===38&&all.every(t=>src.includes(t)),J(all.filter(t=>!src.includes(t)).slice(0,4)));
    const ck=cp.spawnSync('python3',['tools/shops/import_shop_meet.py','--check'],{cwd:ROOT,encoding:'utf8'});
    if(ck.error) console.log('SKIP 1 沒有 python3（匯入工具 --check）'); else check('1 匯入工具 --check：資料檔＝稿匯出來的（走 import_guard 白名單）',ck.status===0,(ck.stdout+ck.stderr).trim().slice(0,200)); }
  const allow=JSON.parse(rd('docs/handoff/story_import_allow.json')).files;
  check('1 劇情匯入白名單有 AA_826（'+SHA+'、approved）；資料檔記了來源',allow.filter(e=>e.path===DOC).length===1&&allow.some(e=>e.path===DOC&&e.sha===SHA&&e.status==='approved'&&!!e.approvedBy)&&J(D._src)===J({sha:SHA,doc:DOC}));
  const at=f=>FILES.indexOf(f);
  check('1 index.html：資料檔 → src/shopmeet3d.js → src/shoplife3d.js（緊接著；版本號照旁邊的寫法）',at(DATA)>0&&at('src/shopmeet3d.js')===at(DATA)+1&&at('src/shoplife3d.js')===at('src/shopmeet3d.js')+1&&at('src/flower_notes_sys3d.js')<at(DATA)&&at('src/gg3shops3d.js')<at(DATA)
    &&(html.match(/src="src\/shopmeet3d\.js\?v=([\d.]+)"/)||[])[1]===(html.match(/src="src\/shoplife3d\.js\?v=([\d.]+)"/)||[])[1]&&(html.match(/src="src\/data\/shop_meet_lines\.js\?v=([\d.]+)"/)||[])[1]===(html.match(/src="src\/shoplife3d\.js\?v=([\d.]+)"/)||[])[1]);
  const code=rd('src/shopmeet3d.js').replace(/\/\*[\s\S]*?\*\//g,''), zh=code.match(/['"`][^'"`\n]*[一-鿿][^'"`\n]*['"`]/g)||[];
  check('1 src/shopmeet3d.js 沒有自己寫的句子（拿掉註解以後沒有中文字串；字都從資料檔來）',!zh.length,zh.slice(0,3).join(' ')); });

// ---------- 2 四間店的進門招呼 ----------
await sec(2,async()=>{ for(const z of Object.values(ZONE_OF)){ const T=D.staffGreet[z], got=[]; delete G.flags.SHOP_GREET; G.invites=[];
    for(let i=0;i<4;i++){ said=[]; enter(z,WED+i,14); const cl=clerks().length, due=SHOPMEET.greetDue(GM), r=SHOPMEET.greetTick(GM); await sleep(2); got.push({cl,due,r,said:said.slice()});
      if(i===0){ said=[]; enter(z,WED,15); const again=SHOPMEET.greetTick(GM); await sleep(2); got[0].again=again||said.length; } }
    check(`2 ${PLACES.names[z]||z}（${z}）：走進去、店員在店裡＝${T.who}一天一句，四天依序是三句輪流再回到第一句；同一天再進來不說`,
      got.every((g,i)=>g.cl>=1&&g.due&&g.r===true&&J(g.said)===J([[T.who,T.lines[i%3]]]))&&!got[0].again&&J(G.flags.SHOP_GREET[z])===J([WED+3,4]),J(got.map(g=>[g.cl,g.due,g.r,g.said,g.again]))); }
  { const z='xs_shanlan'; delete G.flags.SHOP_GREET; said=[]; enter(z,WED,23.5); const a=!PLACES.isOpen(z,23.5,WED)&&!SHOPMEET.greetTick(GM);
    enter(z,WED,14); E.npcs=E.npcs.filter(n=>!n.clerk); const b=!SHOPMEET.greetDue(GM)&&!SHOPMEET.greetTick(GM);
    enter(z,WED,14); E.player.busy=true; const c=!SHOPMEET.greetTick(GM); E.player.busy=false;
    G.invites=[{who:'heroine_01',place:z,day:WED,h:14,state:'going'}]; const d=!SHOPMEET.greetTick(GM); G.invites=[];
    GM.titleIdle=true; const e=!SHOPMEET.greetTick(GM); GM.titleIdle=false; await sleep(2);
    const f=!said.length&&!G.flags.SHOP_GREET; const g=SHOPMEET.greetTick(GM); await sleep(2);
    check('2 打烊以後／店裡沒有店員／別的場景在演／約在這間店的那一趟／標題畫面＝不說、不記；條件都對了才說',a&&b&&c&&d&&e&&f&&g===true&&said.length===1,J([a,b,c,d,e,f,g,said])); }
  { said=[]; delete G.flags.SHOP_GREET; for(const z of ['cafe','xs_dakou','tz_taimi','dorm']){ if(!Z3.ZONES[z]) continue; enter(z,WED,14); SHOPMEET.greetTick(GM); } await sleep(2);
    check('2 稿沒有給招呼句的店（兩點半、大口漢堡、泰米村食……）：SHOPMEET 不說話',!said.length&&!G.flags.SHOP_GREET&&J(SHOPMEET.greetZones())===J(['xs_shanlan','xs_dabu','xs_haopai','xs_xsports','flower_notes']),J([said,SHOPMEET.greetZones()])); }
  check('2 STORY.TICKS 掛上了 SHOPMEET.greetTick；讀檔會放開鎖（LOADLOCKS）',STORY.TICKS.includes(SHOPMEET.greetTick)&&typeof LOADLOCKS['shopmeet3d:busy']==='function'); });

// ---------- 3 花序 ----------
await sec(3,async()=>{ const T=FLOWER_NOTES_TEXT.staff, z='flower_notes'; delete G.flags.SHOP_GREET; FNS._reset(); G.invites=[];
  said=[]; enter(z,WED,14); const cl=clerks().length, r=SHOPMEET.greetTick(GM); await sleep(2); const s1=said.slice();
  said=[]; enter(z,WED,15); const r2=SHOPMEET.greetTick(GM); await sleep(2); const s2=said.slice();
  check('3 花序：走進去、花藝師在店裡＝花藝師說 AA_792 staff.greet 的第一句；同一天再進來不說',cl>=1&&r===true&&J(s1)===J([[T.who,T.greet[0]]])&&T.who==='花藝師'&&T.greet.length===3&&!r2&&!s2.length,J([cl,r,s1,r2,s2]));
  const next=FNS.greet(); check('3 花序櫃檯買花前那一句接著輪（進門說了第一句，櫃檯是第二句，不連著同一句）',next===T.greet[1],next);
  said=[]; enter(z,WED+1,14); SHOPMEET.greetTick(GM); await sleep(2); check('3 花序隔天再進來：又說一句（三句裡的下一句）',said.length===1&&said[0][0]==='花藝師'&&said[0][1]===T.greet[2],J(said));
  said=[]; delete G.flags.SHOP_GREET; enter(z,WED,22); const c=!SHOPMEET.greetTick(GM); await sleep(2); check('3 花序打烊以後（22:00）：不說',c&&!said.length&&!clerks().length); });

// ---------- 4 越好吃小館、客居雲南（GG3 原本那一套）----------
await sec(4,async()=>{ for(const z of ['tz_yuehaochi','tz_keju']){ const T=TZ_MEAL_LINES[z]; delete G.flags.GG3_DOOR; G.invites=[]; said=[]; enter(z,WED,12.2); const cl=clerks(), due=GG3.doorDue(GM); GG3.rand=()=>0; const r=GG3.tick(GM); await sleep(3); const s1=said.slice();
    said=[]; enter(z,WED,13); const r2=GG3.doorDue(GM); const sm=SHOPMEET.greetTick(GM); await sleep(2);
    check(`4 ${T.name}：走進去、老闆娘站在店裡（一位、女性的路人底模）＝老闆娘說稿的進門句、一天一次；SHOPMEET 不重複說`,cl.length===1&&due&&r===true&&J(s1)===J([['老闆娘',T.door[0][1]]])&&!r2&&!sm&&!said.length&&GG3.CLERK_I[z]%2===0&&STORY.TICKS.includes(GG3.tick),J([cl.length,due,r,s1,r2,sm])); } });

// ---------- 5 吃飯時間在店裡遇到同學的第一句 ----------
const friend=id=>{ const r=SOCIAL.rel(id); r.fam=45; r.trust=30; r.comf=20; if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,'campus'); };
const TERM_DAYS=[]; for(let d=DK('2025-09-29');d<DK('2025-09-29')+70;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&!t.exam) TERM_DAYS.push(d); }
/* 找這個人 SHOPLIFE 真的排進店裡的一餐（從哪一天以後找）*/
const findMeal=(id,from,skipSlot)=>{ for(const d of TERM_DAYS){ if(d<(from||0)) continue; const g=Object.assign({},G,{day:d,weekday:CALENDAR.dateOf(d).wd%7,flags:Object.assign({},G.flags,{SHOP_MEAL_MET:null})}); if(!SHOPLIFE.dayOk(g,d)) continue;
    for(const slot of ['lunch','dinner']){ if(slot===skipSlot) continue; const p=SHOPLIFE.who(Object.assign(g,{hour:slot==='lunch'?12.5:18.5}),slot).find(q=>q.id===id); if(p) return {d,p,h:+((p.t0+p.t1)/2).toFixed(3)}; } } return null; };
await sec(5,async()=>{ G.flags.YT_MET_JOB=true; G.invites=[]; const who=id=>({name:SOCIAL.displayName(id),charId:id});
  check('5 STORY.PRE_TALK 掛上了 SHOPMEET.mealHello',STORY.PRE_TALK.includes(SHOPMEET.mealHello));
  const bad=[], info=[];
  for(const id of Object.keys(D.mealHello)){ const L=D.mealHello[id].base; delete G.flags.SHOP_MEAL_HI; delete G.flags.SHOP_MEAL_MET; delete G.flags['dating_'+id]; friend(id);
    const m1=findMeal(id); if(!m1){ bad.push(id+' 一個學期都排不到'); continue; }
    said=[]; enter(m1.p.zone,m1.d,m1.h); const n=named().find(q=>q.charId===id); if(!n){ bad.push(id+' 不在店裡'); continue; }
    const r1=await SHOPMEET.mealHello(GM,who(id),id), s1=said.slice(); said=[]; const r1b=await SHOPMEET.mealHello(GM,who(id),id), s1b=said.slice();
    const m2=findMeal(id,m1.d+1); if(!m2){ bad.push(id+' 找不到第二次'); continue; } delete G.flags.SHOP_MEAL_MET; said=[]; enter(m2.p.zone,m2.d,m2.h); const r2=await SHOPMEET.mealHello(GM,who(id),id), s2=said.slice();
    const m3=findMeal(id,m2.d+1); let s3=null; if(m3){ delete G.flags.SHOP_MEAL_MET; said=[]; enter(m3.p.zone,m3.d,m3.h); await SHOPMEET.mealHello(GM,who(id),id); s3=said.slice(); }
    if(!(r1===true&&J(s1)===J([[SOCIAL.displayName(id),L[0]]]))) bad.push(id+' 第一次 '+J(s1)); if(r1b||s1b.length) bad.push(id+' 同一餐又說了'); if(!(r2===true&&J(s2)===J([[SOCIAL.displayName(id),L[1]]]))) bad.push(id+' 第二次 '+J(s2));
    if(m3&&J(s3)!==J([[SOCIAL.displayName(id),L[0]]])) bad.push(id+' 第三次沒有輪回第一句 '+J(s3)); info.push(SOCIAL.displayName(id)+'@'+m1.p.zone.replace('l118_','')); }
  check('5 十位：SHOPLIFE 排進店裡、朋友以上＝第一句是稿的那一句（說話的人是他）；同一餐再點不再說；下一次見面是另一句、再下一次輪回第一句',!bad.length&&info.length===10,bad.slice(0,4).join('；')||info.join('、'));
  /* 不到朋友 */
  { const id='classmate_bohan'; delete G.flags.SHOP_MEAL_HI; const r=SOCIAL.rel(id); r.fam=30; r.trust=30; const m=findMeal(id); said=[]; enter(m.p.zone,m.d,m.h); const a=SOCIAL.stage(id)==='FAMILIAR'&&!(await SHOPMEET.mealHello(GM,who(id),id))&&!said.length&&!G.flags.SHOP_MEAL_HI;
    r.fam=40; r.trust=25; const b=SOCIAL.stage(id)==='FRIEND'&&(await SHOPMEET.mealHello(GM,who(id),id))===true&&said.length===1;
    check('5 不到朋友（有點熟）＝不說、不記；剛好朋友＝說',a&&b,J([a,b,said])); }
  /* 不是 SHOPLIFE 排的：同一間店、同一個人，但他現在的作息不是「吃飯時間在店裡」那一筆 */
  { const id='classmate_bohan'; friend(id); delete G.flags.SHOP_MEAL_HI; const m=findMeal(id); enter(m.p.zone,m.d,m.h); said=[]; const h0=G.hour; G.hour=m.p.t1+1.5; const e=STORY.schedEnt(CHARACTERS[id],G); const a=!(e&&e.shopMeal)&&!(await SHOPMEET.mealHello(GM,who(id),id));
    G.hour=h0; const z0=G.zone; G.zone='campus'; const b=!(await SHOPMEET.mealHello(GM,who(id),id)); G.zone=z0;
    check('5 他不是照「吃飯時間在店裡」那一筆在這裡（時間過了／玩家不在那間店）＝不說',a&&b&&!said.length,J([a,b,said])); }
  /* 宥辰：f231f0514 補了兩句（2026-11-12 改期望——舊期望：稿沒有他的句子＝不說）*/
  { const id='classmate_youchen'; friend(id); delete G.flags.SHOP_MEAL_HI; delete G.flags.SHOP_MEAL_MET; const m=findMeal(id); let a=false; if(m){ enter(m.p.zone,m.d,m.h); said=[]; a=(await SHOPMEET.mealHello(GM,who(id),id))===true&&J(said)===J([[SOCIAL.displayName(id),'欸，你也來。我剛起床，這算早餐。']]); }
    check('5 宥辰（名單上有、weight 0.4）：排進店裡、朋友以上＝說稿的第一句「欸，你也來。我剛起床，這算早餐。」',a&&SHOPLIFE.people().includes(id),m?J(said):'這段時間排不到'); }
  /* 分手後的前任（AA_826 meal_hello.note）：SHOPLIFE 不排、這一句也不說；回到朋友（以安＝MREL.rb 做完）以後照舊 */
  { const id='heroine_01', F=G.flags, rom0=F.romance?JSON.stringify(F.romance):null, mr0=F.MREL?JSON.stringify(F.MREL):null; friend(id); delete F.SHOP_MEAL_HI; delete F.SHOP_MEAL_MET; delete F['dating_'+id]; delete F['EX_'+id];
    const m=findMeal(id); enter(m.p.zone,m.d,m.h); const e0=STORY.schedEnt(CHARACTERS[id],G), in0=named().some(q=>q.charId===id);
    F['EX_'+id]=true; ROM.get(G,id).status='ex'; ROM.get(G,id).history.push({ev:'end',at:'Y1S1',day:m.d-3,how:'apart_talk'});
    enter(m.p.zone,m.d,m.h); said=[]; const e1=STORY.schedEnt(CHARACTERS[id],G), in1=named().some(q=>q.charId===id), blk=SHOPLIFE.exBlock(G,id), h1=await SHOPMEET.mealHello(GM,who(id),id), s1=said.slice(), hi1=!!(F.SHOP_MEAL_HI&&F.SHOP_MEAL_HI[id]);
    const gx=Object.assign({},G,{hour:m.h}), why=SHOPLIFE.why(gx,CHARACTERS[id],m.p);
    const r=MREL.rb(G,id); r.step='done'; r.done=m.d;   /* 「重新開始」那一場做完＝回到朋友 */
    enter(m.p.zone,m.d,m.h); said=[]; const e2=STORY.schedEnt(CHARACTERS[id],G), in2=named().some(q=>q.charId===id), h2=await SHOPMEET.mealHello(GM,who(id),id), s2=said.slice();
    check('5 以安分手以後（EX_、還沒和好）：這一餐不排進店裡（作息沒有那一筆、店裡沒有她、why＝ex）、第一句不說、不記',!!(e0&&e0.shopMeal)&&in0&&blk===true&&!(e1&&e1.shopMeal)&&!in1&&why==='ex'&&h1===false&&!s1.length&&!hi1,J([!!(e0&&e0.shopMeal),in0,blk,e1&&e1.zone,in1,why,h1,s1,hi1]));
    check('5 以安回到朋友（MREL.rb 的 step＝done；EX_ 還在、沒有重新交往）：同一餐照舊排進店裡、照舊說第一句',!SHOPLIFE.exBlock(G,id)&&!!(e2&&e2.shopMeal)&&in2&&h2===true&&J(s2)===J([[SOCIAL.displayName(id),D.mealHello[id].base[0]]])&&F['EX_'+id]===true,J([e2&&e2.zone,in2,h2,s2]));
    delete F['EX_'+id]; delete F.SHOP_MEAL_HI; delete F.SHOP_MEAL_MET; if(rom0) F.romance=JSON.parse(rom0); else delete F.romance; if(mr0) F.MREL=JSON.parse(mr0); else delete F.MREL; }
  /* 她照別的作息剛好在店裡（不是 SHOPLIFE 排的）本來就不說；helloDue 自己也擋前任 */
  { const id='classmate_peishan', F=G.flags; friend(id); delete F.SHOP_MEAL_HI; delete F.SHOP_MEAL_MET; const m=findMeal(id); enter(m.p.zone,m.d,m.h); const a=!!SHOPMEET.helloDue(G,id); const ex0=SHOPLIFE.exBlock; SHOPLIFE.exBlock=(g,x)=>x===id; const sl=SHOPMEET.mealSlot; SHOPMEET.mealSlot=()=>m.p.slot; const b=SHOPMEET.helloDue(G,id); SHOPMEET.mealSlot=sl; SHOPLIFE.exBlock=ex0;
    check('5 SHOPMEET.helloDue 自己也看 SHOPLIFE.exBlock（就算作息那一筆還在，前任也不說）',a&&b===null,J([a,b])); }
  /* 學姊交往中 */
  { const id='heroine_05'; friend(id); delete G.flags.SHOP_MEAL_HI; delete G.flags.SHOP_MEAL_MET; G.flags['dating_'+id]=true; const L=D.mealHello[id].dating; const m1=findMeal(id), nm=SOCIAL.displayName(id);
    enter(m1.p.zone,m1.d,m1.h); said=[]; await SHOPMEET.mealHello(GM,who(id),id); const s1=said.slice(); const m2=findMeal(id,m1.d+1); delete G.flags.SHOP_MEAL_MET; enter(m2.p.zone,m2.d,m2.h); said=[]; await SHOPMEET.mealHello(GM,who(id),id); const s2=said.slice();
    delete G.flags['dating_'+id];
    check('5 學姊交往中：用交往中的那一組——「你吃了沒。」（她說）、下一次「（她把旁邊的椅子拉開一點。）」（旁白，沒有說話的人）',J(s1)===J([[nm,'你吃了沒。']])&&J(s2)===J([[null,'（她把旁邊的椅子拉開一點。）']])&&L[0]===s1[0][1],J([s1,s2])); } });

// ---------- 6 真的「和他說話」----------
await sec(6,async()=>{ const id='classmate_mingxuan'; friend(id); delete G.flags.SHOP_MEAL_HI; delete G.flags.SHOP_MEAL_MET; G.invites=[]; const m=findMeal(id); enter(m.p.zone,m.d,m.h); const n=named().find(q=>q.charId===id);
  const n0=(G.flags.SHOP_MEAL_HI&&G.flags.SHOP_MEAL_HI[id]||[0,0,0])[2]|0; said=[]; await STORY.talkCharacter(id,n); const s1=said.slice(), L=D.mealHello[id].base, i=s1.findIndex(x=>L.includes(x[1]));
  check('6 STORY.talkCharacter（玩家按「和明軒說話」）：他先說稿的那一句（前面沒有別的話），後面照原本的閒聊繼續',!!n&&i===0&&s1[0][0]===SOCIAL.displayName(id)&&s1.length>=2,J(s1.slice(0,4)));
  said=[]; await STORY.talkCharacter(id,n); check('6 同一餐再按一次「和他說話」：不再說那一句（照原本的閒聊）',!said.some(x=>L.includes(x[1])),J(said.slice(0,3)));
  if(warns.some(w=>/SHOPMEET|PRE_TALK/.test(w))) check('6 沒有例外',false,warns.filter(w=>/SHOPMEET|PRE_TALK/.test(w)).join(' | ')); });

// ---------- 7 存檔 ----------
await sec(7,async()=>{ const G0=GM.defaults(); check('7 新存檔沒有 SHOP_GREET／SHOP_MEAL_HI／SHOP_MEAL_MET（沒有＝還沒發生；不用遷移）',!('SHOP_GREET' in (G0.flags||{}))&&!('SHOP_MEAL_HI' in (G0.flags||{}))&&!('SHOP_MEAL_MET' in (G0.flags||{})));
  const keys0=Object.keys(G).sort(); G.flags.SHOP_GREET='壞掉的'; G.flags.SHOP_MEAL_HI=[1,2]; said=[]; enter('xs_dabu',WED,14); const r=SHOPMEET.greetTick(GM); await sleep(2);
  const id='zhe'; friend(id); const m=findMeal(id); delete G.flags.SHOP_MEAL_MET; enter(m.p.zone,m.d,m.h); const r2=await SHOPMEET.mealHello(GM,{name:'阿哲'},id);
  check('7 旗標是壞的（不是物件）：照樣說第一句、重新記成物件，不出錯；G 最上層沒有多欄位',r===true&&said[0][1]===D.staffGreet.xs_dabu.lines[0]&&r2===true&&said[said.length-1][1]===D.mealHello.zhe.base[0]&&J(G.flags.SHOP_GREET.xs_dabu)===J([WED,1])&&J(G.flags.SHOP_MEAL_HI[id])===J([m.d,m.p.slot,1])&&J(Object.keys(G).sort())===J(keys0),J([said,G.flags.SHOP_GREET,G.flags.SHOP_MEAL_HI]));
  const bad=[]; for(const f of ['src/shopmeet3d.js',DATA,'src/shoplife3d.js']){ const r3=cp.spawnSync(process.execPath,['--check',path.join(ROOT,f)],{encoding:'utf8'}); if(r3.status!==0) bad.push(f+' '+r3.stderr.slice(0,160)); }
  check('7 node --check',!bad.length,J(bad)); });

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0); })();
