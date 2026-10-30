// 關係進展：日常活動的數值、上限、畫面提示（AA_124 第 1 節，AA 決定；2026-10-14 使用者試玩 v9.6：「約了朋友例如在溫州街散步 是不是沒有增加好感？
// 在咖啡廳遇到溫學姊跟他講話好像也沒有增進什麼感情。」——原本見面 fam+2、閒聊新句 fam+1，畫面上什麼都沒有）。不需要瀏覽器：載入 social3d.js＋人物資料，檢查：
//   1. 對話中（feelOn）加的才提示；對話外（讀檔遷移、換算）不提示；
//   2. 一行、挑加最多的一項（同樣多：信任＞自在＞熟悉），文字照 AA_124 1-4；一次最多兩人、加最多的先；換階段（有點熟、朋友、好朋友）優先；
//   3. 戀愛不顯示、還沒正式見過的女主角不顯示、減少／已滿不顯示；女主角用平常的稱呼；
//   4. 日常活動（S.activity）照 AA_124 1-2 的表；同一種活動一天一次；同一個人一天最多熟悉 +6、信任 +4、自在 +5；那一天第一次因為上限什麼都沒加時「今天和○○已經聊很多了。」；隔天重來；
//   5. 接線：閒聊＝chat（＋新的一句 chatNew）；約好的見面照地點（cafe／library／meal／walk），對方約的又赴約加 acceptInvite；
//   6. game3d.js：sceneBegin 第一層開始記、sceneEnd 最後一層顯示；GM.rel 自己有「❤」提示的不重複。
// 用法：node tests/rel_feel_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/characters.js'),'utf8').replace(/^const (CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS)\s*=/mg,'globalThis.$1='),{filename:'characters.js'});
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/social3d.js'),'utf8').replace(/^const SOCIAL\s*=/m,'global.SOCIAL='),{filename:'src/social3d.js'});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const G={rel:{},flags:{},social:null,day:20}; SOCIAL.bind(G);
const meet=id=>SOCIAL.remember(id,'FIRST_MET','test'); meet('heroine_05'); meet('heroine_01'); meet('heroine_03');
const fresh=()=>{ SOCIAL.feelOn=true; SOCIAL.feel={}; SOCIAL.feelStage={}; SOCIAL.capNotes=[]; };
// 1
SOCIAL.feelOn=false; SOCIAL.feel={}; SOCIAL.adjust('heroine_05',{fam:5}); check('1. 對話外加的不提示',SOCIAL.takeFeel().length===0);
fresh(); SOCIAL.adjust('heroine_05',{fam:1}); let L=SOCIAL.takeFeel(); check('1. 對話中加熟悉：「和溫學姊熟了一點。」',L.length===1&&L[0]==='和溫學姊熟了一點。',JSON.stringify(L));
// 2
fresh(); SOCIAL.adjust('heroine_05',{fam:3,trust:1}); L=SOCIAL.takeFeel(); check('2. 加最多的那一項（熟悉 3＞信任 1）',L[0]==='和溫學姊熟了一點。',JSON.stringify(L));
fresh(); SOCIAL.adjust('heroine_05',{fam:1,trust:3}); L=SOCIAL.takeFeel(); check('2. 信任最多：「溫學姊好像更信任你了一點。」',L[0]==='溫學姊好像更信任你了一點。',JSON.stringify(L));
fresh(); SOCIAL.adjust('heroine_05',{fam:2,comf:2}); L=SOCIAL.takeFeel(); check('2. 同樣多：自在＞熟悉「和溫學姊在一起，比之前自在。」',L[0]==='和溫學姊在一起，比之前自在。',JSON.stringify(L));
fresh(); SOCIAL.adjust('heroine_05',{fam:1}); SOCIAL.adjust('heroine_01',{fam:4,comf:2}); SOCIAL.adjust('heroine_03',{fam:2}); L=SOCIAL.takeFeel(2);
check('2. 三個人：最多兩句、加最多的先（小安）',L.length===2&&/小安/.test(L[0]),JSON.stringify(L));
{ const r=SOCIAL.rel('heroine_03'); r.fam=38; r.trust=25; fresh(); SOCIAL.adjust('heroine_03',{fam:3}); L=SOCIAL.takeFeel(); check('2. 換階段優先：「你和語彤變成朋友了。」',L[0]==='你和語彤變成朋友了。',JSON.stringify(L)+' '+SOCIAL.stage('heroine_03'));
  fresh(); SOCIAL.adjust('heroine_03',{fam:1}); L=SOCIAL.takeFeel(); check('2. 已經是朋友：一般的一句',L[0]==='和語彤熟了一點。',JSON.stringify(L)); }
// 3
fresh(); SOCIAL.adjust('heroine_05',{rom:5}); check('3. 戀愛不顯示',SOCIAL.takeFeel().length===0);
fresh(); SOCIAL.adjust('heroine_02',{fam:3}); check('3. 還沒正式見過的女主角（芷若）不顯示',SOCIAL.takeFeel().length===0);
fresh(); SOCIAL.adjust('heroine_05',{fam:-2}); check('3. 減少的不顯示',SOCIAL.takeFeel().length===0);
fresh(); SOCIAL.rel('heroine_05').fam=100; SOCIAL.adjust('heroine_05',{fam:3}); check('3. 已經滿了不顯示',SOCIAL.takeFeel().length===0); SOCIAL.rel('heroine_05').fam=30;
// 4
/* sport：一起運動（羽球、晨跑，AA_417 第 3 節／AA_126 6-6；AA_124 的表沒有這一列，照溫州街散步的數值）*/
const T=SOCIAL.ACT; check('4. 數值照 AA_124 1-2 的表（＋msg：AA_202 第 4 節，傳訊息對方回了熟悉 +1）',JSON.stringify(T)===JSON.stringify({chat:{fam:2},chatNew:{comf:1},classmate:{fam:1},cafe:{fam:3,trust:1,comf:2},library:{fam:3,trust:2,comf:1},meal:{fam:3,trust:1,comf:3},walk:{fam:4,trust:2,comf:3},help:{fam:1,trust:3},acceptInvite:{trust:1},msg:{fam:1},sport:{fam:4,trust:2,comf:3}})&&JSON.stringify(SOCIAL.CAP)===JSON.stringify({fam:6,trust:4,comf:5}));
{ G.day=30; const id='heroine_01', r=SOCIAL.rel(id); const f0=r.fam, t0=r.trust, c0=r.comf; fresh();
  const a=SOCIAL.activity(id,'chat'), b=SOCIAL.activity(id,'chat'); check('4. 聊天今天第一次熟悉 +2，同一天再聊不加',a.fam===2&&Object.keys(b).length===0&&r.fam===f0+2,JSON.stringify([a,b]));
  SOCIAL.activity(id,'walk'); SOCIAL.activity(id,'library'); SOCIAL.activity(id,'meal'); SOCIAL.activity(id,'help');
  check('4. 一天上限：熟悉 +6、信任 +4、自在 +5',r.fam-f0===6&&r.trust-t0===4&&r.comf-c0===5,`熟悉 +${r.fam-f0} 信任 +${r.trust-t0} 自在 +${r.comf-c0}`);
  L=SOCIAL.takeFeel(); check('4. 碰到上限但這一段有加：照常一行（不出「聊很多了」）',L.length===1&&!/聊很多/.test(L[0]),JSON.stringify(L));
  fresh(); SOCIAL.activity(id,'cafe'); L=SOCIAL.takeFeel(); check('4. 上限以後再去、什麼都沒加：「今天和小安已經聊很多了。」',L.length===1&&L[0]==='今天和小安已經聊很多了。',JSON.stringify(L));
  fresh(); SOCIAL.activity(id,'classmate'); L=SOCIAL.takeFeel(); check('4. 同一天第二次什麼都沒加：不再提示',L.length===0,JSON.stringify(L));
  G.day=31; fresh(); const c=SOCIAL.activity(id,'chat'); check('4. 隔天重來',c.fam===2,JSON.stringify(c)); }
// 5
const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), iv=fs.readFileSync(path.join(ROOT,'src/invites3d.js'),'utf8');
check('5. 閒聊：chat＋新的一句 chatNew',/SOCIAL\.activity\(id,'chat'\); if\(L\.fresh\) SOCIAL\.activity\(id,'chatNew'\);/.test(st));
check('5. 約好的見面照地點；對方約的又赴約加 acceptInvite',/SOCIAL\.activity\(iv\.who,P\.sport\?'sport':\(\{cafe:'cafe',library:'library',noodle:'meal',wenzhou:'walk',brunch:'meal',teahouse:'cafe',slowread:'library'\}\[P\.id\]\|\|\(P\.kind==='meal'\?'meal':'cafe'\)\)\); if\(iv\.by==='npc'\) SOCIAL\.activity\(iv\.who,'acceptInvite'\);/.test(iv));   /* 一起運動的地點（P.sport）照 sport（AA_417 第 3 節）；表上沒有的吃飯地點（kind meal：Pasta 118，AA_480 第 5 節）照 meal */
// 6
const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
check('6. sceneBegin 第一層開始記',/function sceneBegin\(opts\)\{ if\(D\.busyDepth===0&&typeof SOCIAL!=='undefined'&&SOCIAL\.feel\)\{ SOCIAL\.feel=\{\}; SOCIAL\.feelOn=true; \}/.test(g3));
check('6. sceneEnd 最後一層顯示',/function sceneEnd\(\)\{ D\.busyDepth=Math\.max\(0,D\.busyDepth-1\);[^}]*?if\(D\.busyDepth===0\)\{ if\(typeof SOCIAL!=='undefined'&&SOCIAL\.takeFeel\)\{ SOCIAL\.feelOn=false; const L=SOCIAL\.takeFeel\(2\);/.test(g3));   // 中間可以有別的（a0926112 卡住保底記 D.busyWho）
check('6. GM.rel 自己有「❤」提示：同一個人不重複',/if\(SOCIAL\.feel\) delete SOCIAL\.feel\[CID\[id\]\|\|id\];/.test(g3));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
