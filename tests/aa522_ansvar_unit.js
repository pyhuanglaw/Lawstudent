// 民總第一堂那一週，第一次和周教授說話：classAnswer 另外三種（half／bold／absent）的第一句（AA522-ANSVAR-1030；AA_522 第 9 節第 1 點，企劃線 50cd33b53，AA-B 10-30 補；BB-B 03:52 實測回報那三種說成一般那句「週四下課以後我都在」）——不需要瀏覽器。
//   0 三句都在稿裡（一字不差，{name}＝玩家名字）；1 那一週照 classAnswer 說那一句、不說「週四下課以後我都在」；2 下一週照一般那句；3 good／none 照舊。
// 修改前（postrel-1030 ca39039fe）：「story3d.js 有 S.ZHOU_W1」FAIL（後面幾項跑不到）。用法：node tests/aa522_ansvar_unit.js
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), STO=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
let doc=''; try{ doc=cp.execSync('git -c core.quotepath=false show 50cd33b53:"docs/story_planning/AA_522_教授的研究室_周許林照學期換.md"',{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
const W={half:'{name}。你抓到爭點了。……下次答完再停。',bold:'{name}。敢說成立的人不多。……但書那一段，自己回去讀。',absent:'你是我們班的？……今天的課，跟同學借筆記。'};
check('0. AA_522（50cd33b53）讀得到；三句都在第 9 節第 1 點',doc.length>3000&&Object.values(W).every(t=>doc.includes(t)),doc?'':'git fetch origin claude/cool-heisenberg-o8kuqx');
// 抽 S.ZHOU_W1 原樣執行
const m=STO.match(/\n  S\.ZHOU_W1=(\{[^\n]*\});\n/);
check('0. story3d.js 有 S.ZHOU_W1',!!m);
if(!m){ console.log('FAILED '+fails); process.exit(1); }
const Z=new Function('return '+m[1])(), G={name:'祐廷'};
const got={half:Z.half(G),bold:Z.bold(G),absent:Z.absent(G)};
check('1. 三句照稿（{name} 換成玩家名字）',got.half===W.half.replace('{name}','祐廷')&&got.bold===W.bold.replace('{name}','祐廷')&&got.absent===W.absent,JSON.stringify(got));
// talkProf 的分支：那一週、有這一種才說；排在 good／none 後面、zhouTalkTerm（一般那句）前面
const tp=STO.slice(STO.indexOf('async function talkProf('),STO.indexOf('GM.sceneEnd(); }',STO.indexOf('async function talkProf(')));
const iNone=tp.indexOf("F.classAnswer==='none'&&S.civ1Week(G)"), iW1=tp.indexOf("else if(S.civ1Week(G)&&S.ZHOU_W1[F.classAnswer]) await GM.say(n,S.ZHOU_W1[F.classAnswer](G));"), iTerm=tp.indexOf('S.zhouTalkTerm(G)');
check('1. talkProf：民總第一堂那一週、classAnswer 是 half／bold／absent＝說那一句（排在答得好、沒讀之後，一般那句「週四下課以後我都在」之前）',iNone>0&&iW1>iNone&&iTerm>iW1,JSON.stringify({iNone,iW1,iTerm}));
check('2. 下一週（civ1Week 不成立）照一般那句：分支有 S.civ1Week(G) 條件',/S\.civ1Week\(G\)&&S\.ZHOU_W1\[F\.classAnswer\]/.test(tp));
check('3. good／none 那兩句照舊',tp.includes("。今天回答得不錯。下週從第一條開始，先把總則的目錄看過。")&&tp.includes("。案例要讀。下週我還會點人。"));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
