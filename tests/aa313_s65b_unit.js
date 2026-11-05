// AA_313 第 6-5 節給程式的項目（第 1、4、5、6 點；第 8、9、10、13 點已經做了，這裡一起確認）——不需要瀏覽器。
//   1. 子晴在做遊戲是秘密：沒看過 Q6（PLAYTESTED）的玩家——期末鉤子「你要不要看？」（zq_demo）不出、階梯 Q2-L4 跳過、大稻埕／華山／九份偶遇之後在學校那一句不說、
//      記憶記成「她在畫東西」、碼頭小支線（side_zq_pier_level）不開；看過 Q6 的照舊
//   4. 傅鐘「週五的經原」只在大一上；「交換申請交了嗎」交件以後不問（原本就有）
//   5. Café 第一次點餐問科系那一段（#dept）：已經認識（FIRST_MET）的不再報名字
//   6. AA_207 #4：「我在這裡兩年」「你室友還活著嗎」「半夜的阿凱」只在大一（term Y1S1、Y1S2）
//   8、9、10、13：學姊交往中的「妳呢？」與碩士期間的句子（sisCafe）、學姊在美國不約（vac3d presence）、「雅筑學姊」、片名——原本就有
// 修改前：第 1、4、5、6 項 FAIL。用法：node tests/aa313_s65b_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={getElementById:()=>null,addEventListener(){}}; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
let MEM={}; global.SOCIAL={has:(id,tag)=>!!(MEM[id]&&MEM[id][tag]),remember:(id,tag,note)=>{ (MEM[id]||(MEM[id]={}))[tag]=note===undefined?true:note; }};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(TERMEND_LINES|ENC|STORY_EVENTS|ENC_WALK|ENCOUNTERS|CALENDAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/termend_lines.js','src/data/events.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const EV=id=>STORY_EVENTS.find(e=>e.id===id);
// 1
const H=TERMEND_LINES.HOOK.Y2S1.heroine_04; MEM={};
check('1. 期末鉤子 zq_demo：沒看過 Q6＝不出（if 不成立）', !!H&&typeof H.if==='function'&&H.if({})===false&&H.act.c15==='zq_demo');
MEM={heroine_04:{PLAYTESTED:true}}; check('1. 看過 Q6＝出', !!H&&typeof H.if==='function'&&H.if({})===true);
{ const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); const m=s.match(/S\.LADDER_SKIP=\{'Q2-L4':(G=>[^}]*\))\};/);
  const f=m?eval(m[1]):null; MEM={}; const a=f&&f({}); MEM={heroine_04:{PLAYTESTED:true}}; const b=f&&f({});
  check('1. 階梯 Q2-L4：沒看過 Q6 跳過、看過不跳；ladderNext 的 while 有讀 S.LADDER_SKIP', a===true&&b===false&&/S\.LAD_CUT\.has\(st\.id\)\|\|\(S\.LADDER_SKIP\[st\.id\]&&S\.LADDER_SKIP\[st\.id\]\(G\)\)/.test(s)); }
{ const s=fs.readFileSync(path.join(ROOT,'src/encounter3d.js'),'utf8');
  check('1. 偶遇：大稻埕／華山／九份之後在學校那一句、記憶「她在畫東西」、碼頭小支線，沒看過 Q6 都擋', /S\.Q6_GATED=\{ENC_D12_ZQ:1,ENC_D01_ZQ:1,ENC_D18_ZQ:1\}/.test(s)&&/if\(S\.Q6_GATED\[tag\]&&!PT\(\)\) continue;/.test(s)&&/S\.memoNote=row=>S\.Q6_GATED\[row\.memo\]&&!PT\(\)\?'她在畫東西':undefined;/.test(s)&&/if\(S\.Q6_SIDE\[sd\.id\]&&!PT\(\)\) return false;/.test(s)&&(s.match(/SOCIAL\.remember\(row\.who,row\.memo,S\.memoNote\(row\)\)/g)||[]).length===2); }
// 4
{ const ev=EV('ev_zhiruo_bell'); const ch=ev.dialogue.find(l=>l.choice).choice; const c1=ch.find(c=>/週五的經原/.test(c.text)), c3=ch.find(c=>/交換申請/.test(c.text));
  global.STORY={termAt:d=>d<0?'Y1S1':'Y2S1'};
  check('4. 傅鐘「週五的經原」只在大一上（custom 看 STORY.termAt）', !!c1&&!!c1.if.custom&&c1.if.custom({day:-1})===true&&c1.if.custom({day:5})===false);
  check('4. 「交換申請交了嗎」交件以後不問（unless ev_zhiruo_applied）', !!c3&&c3.unless&&c3.unless.events.includes('ev_zhiruo_applied')); }
// 5
{ const ev=EV('ev_cafe_barista_zhiruo'); const i=ev.dialogue.findIndex(l=>l.label==='dept'); const seg=ev.dialogue.slice(i,i+8);
  const named=seg.filter(l=>/林芷若/.test(l.text||'')), plain=seg.filter(l=>/好，你贏了。……你們法律系/.test(l.text||''));   /* 2026-10-30 AA_524 Z2：「要不要一起修下學期的『法律與電影』？」改「……你們法律系，有人看老片嗎？」（課不存在）；兩版照舊只差名字 */
  check('5. #dept：沒認識的照舊報名字、已經 FIRST_MET 的不報（同一句拿掉名字）', named.length===1&&named[0].unless&&named[0].unless.memory[0].tag==='FIRST_MET'&&plain.length===1&&plain[0].if&&plain[0].if.memory[0].tag==='FIRST_MET'); }
// 6
check('6. 「公館的晚上」「半夜」「妳自己喝什麼」只在大一（term Y1S1、Y1S2）', ['ev_ziqing_gongguan_night','ev_dorm_late_kai','ev_zhiruo_own_drink'].every(id=>{ const e=EV(id); return e&&JSON.stringify(e.term)==='["Y1S1","Y1S2"]'; }));
// 8、9、10、13（原本就有）
{ const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), r=fs.readFileSync(path.join(ROOT,'src/data/rel_lines.js'),'utf8'), v=fs.readFileSync(path.join(ROOT,'src/vac3d.js'),'utf8');
  check('8. 學姊交往中「妳呢？」、碩士期間「今天改了兩段論文。」（rel_lines＋sisCafe）', /tDating:'妳呢？'/.test(r)&&/lGrad:\['「今天改了兩段論文。」'/.test(r)&&/o\.tDating&&F\.dating_heroine_05===true\?o\.tDating:o\.t/.test(s)&&/it\.lGrad&&T&&!\/\^Y1\/\.test\(T\.id\)\?it\.lGrad:it\.l/.test(s));
  check('9. 寒暑假邀約看 STORY.presence（學姊 2028-08-02～12-23 在美國不約）', /STORY\.presence\(id,Object\.assign\(\{\},G,\{day:inv\+1\}\)\); if\(!pr\.here&&pr\.kind!=='home'\) continue;/.test(v));
  check('10. 法服「雅筑學姊」', /雅筑學姊/.test(s)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
