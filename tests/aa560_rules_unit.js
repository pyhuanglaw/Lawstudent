// AA_560 第 2-7 節（企劃線 c9c45ad7a，AA-B 2026-10-31；AA_558 C 部）七處規則修正——不需要瀏覽器。任務 DIALOGUE-DEPTH-1031。
//   只做這七處（使用者 10-31 改了工作方式：AA_559～AA_564 的台詞改稿暫停匯入，只留規則修正）；字照 AA_560 2-7 逐字。
//   C2 沛珊「媽媽問錢夠不夠」→「媽媽問吃飽沒」：遊戲裡沒有這一句（只有大二上閒聊階梯 P3-L4「問我以後要做什麼、錢夠不夠、有沒有好好吃飯。」，
//      在產生的 src/data/ladder.js），找不到原句＝先不改、問 AA；這裡測「還沒改、也沒有被改壞」。
//   C3 柏翰志向欄位「研究所」　C4 芯慈畢業照片「國際法律事務所」、needed_msgs xc_grade「……我想先自己對完。」（D116）
//   C5 學姊 enc_walk「計畫本上，今天那一格還沒劃掉。」（不數件數）　C6 明軒 M4 阿哲「……你什麼時候偷念的。我也要。」（D116）
//   C7 方奕廷「第一次一個人上山」　C8 Kevin「寒假第三天」（他是臺北人）
//   每一處：新句在遊戲裡、而且在 AA_560 的稿裡；舊句不在 src/；那一筆的結構（欄位、句數、條件）不變。用法：node tests/aa560_rules_unit.js
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check}=H, J=JSON.stringify;
const loadErr=[];
for(const f of ['src/data/needed_msgs.js','src/data/enc_walk.js','src/data/sis_b12_events.js','src/data/r2y4b_events.js']){
  try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,120)); } }
const SHA='c9c45ad7a', DOCF='docs/story_planning/AA_560_大一上第一批_日常事件與手機.md';
let DOC=''; try{ DOC=cp.execSync('git -c core.quotepath=false show '+SHA+':"'+DOCF+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ DOC=''; }
const SEC=(()=>{ const i=DOC.indexOf('### 2-7.'), j=DOC.indexOf('## 3.',i); return i>=0?DOC.slice(i,j>i?j:undefined):''; })();
/* src/ 全部的檔（找舊句）*/
const SRC=[]; (function walk(d){ for(const n of fs.readdirSync(d)){ const p=path.join(d,n); if(fs.statSync(p).isDirectory()) walk(p); else if(/\.js$/.test(n)) SRC.push([path.relative(H.ROOT,p),fs.readFileSync(p,'utf8')]); } })(path.join(H.ROOT,'src'));
const inSrc=t=>SRC.filter(([,s])=>s.includes(t)).map(([f])=>f);
const file=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');

check('0. 讀得到 AA_560 第 2-7 節（企劃線 '+SHA+'）、資料檔載得到',SEC.length>200&&!loadErr.length,J(loadErr));

/* C2：稿上的原句遊戲裡沒有；AA-B 11-01 指定改大二上沛珊 P3-L4 整句（來源 ladder_bb_y2s1.json @06ff0acc6，白名單換版） */
{ const lad=file('src/data/ladder.js');
  check('C2. 大二上沛珊 P3-L4 改成「問我以後要做什麼、有沒有好好睡、有沒有好好吃飯。」（AA-B 11-01）；舊句「錢夠不夠」不在',SEC.includes('C2：沛珊「媽媽問錢夠不夠」→「媽媽問吃飽沒」')&&!inSrc('媽媽問錢夠不夠').length&&lad.includes('問我以後要做什麼、有沒有好好睡、有沒有好好吃飯。')&&!lad.includes('錢夠不夠')); }

/* C3 柏翰志向（資料欄位）*/
{ const B=CHARACTERS.classmate_bohan;
  check('C3. 柏翰 career_goal「研究所」（原「司法官」）；稿上那一句',SEC.includes('C3：柏翰 `characters.js` 志向 →「研究所」')&&B.career_goal==='研究所'&&B.name==='許柏翰'&&B.year===1,J(B.career_goal)); }

/* C4 芯慈：畢業照片、needed_msgs 那一句 */
{ const pg=file('src/data/postgrad_lines.js');
  check('C4. 芯慈畢業照片「（照片：國際法律事務所的電腦螢幕，一排 Excel）」；稿上「國際法律事務所」；src/ 沒有「會計師事務所的電腦螢幕」',SEC.includes('→「國際法律事務所」')&&pg.includes("['classmate_xinci','（照片：國際法律事務所的電腦螢幕，一排 Excel）','併購組。四色筆還是要帶。']")&&!inSrc('會計師事務所的電腦螢幕').length,J(inSrc('會計師事務所的電腦螢幕')));
  const x=(NEEDED_MSGS.list||[]).find(e=>e.id==='xc_grade')||{};
  check('C4. needed_msgs xc_grade：「作業發回來了，不要跟我說以安拿幾分。……我想先自己對完。」（D116；AA_581 第 36 列 D118 沒有期中考，原本「期中成績出來，…以安考幾分。…」）；稿上「不要跟我說以安考幾分。……我想先自己對完。」；其他欄位照舊',SEC.includes('→「不要跟我說以安考幾分。……我想先自己對完。」')&&J(x.msg)===J(['作業發回來了，不要跟我說以安拿幾分。……我想先自己對完。'])&&x.who==='classmate_xinci'&&x.term==='Y2S2'&&J(x.w)===J([5,7])&&x.reply==='好。'&&J(x.resp)===J(['謝啦。對完我再請你喝飲料。'])&&(x.miss||[]).length===1,J(x)); }

/* C5 學姊 enc_walk（不數件數）*/
{ const L=(ENC_WALK.leave||[]).filter(e=>e.who==='heroine_05'&&e.spot==='D11'), e=L[0]||{};
  check('C5. 學姊 D11 一起走一段的告別「我要回去了。計畫本上，今天那一格還沒劃掉。」；稿上「計畫本上，今天那一格還沒劃掉。」；src/ 沒有「計畫本上還有兩件事」；交往中那一句照舊',SEC.includes('→「計畫本上，今天那一格還沒劃掉。」')&&L.length===1&&e.friend==='我要回去了。計畫本上，今天那一格還沒劃掉。'&&e.dating==='支線只有一站。坐我旁邊。'&&e.batch===3&&!inSrc('計畫本上還有兩件事').length,J({e,old:inSrc('計畫本上還有兩件事')})); }

/* C6 明軒 M4 阿哲（D116）*/
{ const ev=(R2Y4B_EVENTS||[]).find(e=>e.id==='ev_mingxuan_saved')||{dialogue:[]}, zl=ev.dialogue.filter(d=>d.speaker==='zhe');
  check('C6. 明軒 M4（ev_mingxuan_saved）阿哲「……你什麼時候偷念的。我也要。」（原「……我恨你。」）；稿上那一句；認識阿哲才說的條件照舊、阿哲只有這一句；src/ 沒有「……我恨你。」',SEC.includes('→「……你什麼時候偷念的。我也要。」')&&zl.length===1&&zl[0].text==='……你什麼時候偷念的。我也要。'&&!!zl[0].if&&!inSrc('……我恨你。').length,J({zl,old:inSrc('……我恨你。')})); }

/* C7 方奕廷 */
{ const s=SMALLTALK.npc_fangyt||[], e=s[0]||{};
  check('C7. 方奕廷大一的閒聊「下週去溪頭。……第一次一個人上山，我帶了太多襪子。」；稿上「第一次一個人上山」；條件（once term、2026-09-01 以前）照舊、句數照舊；src/ 沒有「第一次上山」',SEC.includes('→「第一次一個人上山」')&&e.t==='「下週去溪頭。……第一次一個人上山，我帶了太多襪子。」'&&e.once==='term'&&typeof (e.if&&e.if.custom)==='function'&&s.length===4&&!inSrc('第一次上山').length,J({t:e.t,n:s.length,old:inSrc('第一次上山')})); }

/* C8 Kevin（臺北人）*/
{ const a=(typeof SISB12_LINES!=='undefined'&&SISB12_LINES.hotAsk)||[];
  check('C8. 大二寒假家族群組 Kevin「寒假第三天 已經被我媽唸兩次了」；稿上「寒假第三天」；三則照舊；src/ 沒有「我回家第三天」',SEC.includes('→「寒假第三天」')&&J(a)===J([['k','寒假還有誰在台北的'],['k','寒假第三天 已經被我媽唸兩次了'],['s','我在。']])&&!inSrc('我回家第三天').length,J({a,old:inSrc('我回家第三天')})); }

/* 只做了這七處：AA_559～AA_564 的台詞改稿沒有進來（白名單、閒聊階梯、阿哲四場、媽媽的句子照舊）*/
{ const A=JSON.parse(file('docs/handoff/story_import_allow.json')).files;
  check('9. 沒有匯入 AA_559～AA_564（白名單沒有那幾份，C2 只換 ladder_bb_y2s1.json 的版本；閒聊階梯 A-L7、阿哲初遇、媽媽「上禮拜煮多了」照舊）',!A.some(e=>/AA_5(59|6[0-4])_/.test(e.path))&&file('src/data/ladder.js').includes('"那時候人比較少。"')&&file('src/data/events.js').includes("text:'我阿哲。張哲維。'")&&file('src/homepromise3d.js').includes("'上禮拜煮多了 吃了三天'")); }

/* AA-B 11-01 回 C4 兩題（D109）*/
{ const src=file('src/data/postgrad_lines.js')+file('src/data/needed_msgs.js');
  check('C4b. 照片後面那句「併購組。四色筆還是要帶。」、xc_grade 回覆「謝啦。對完我再請你喝飲料。」（不再提比分數）；舊句不在',src.includes('併購組。四色筆還是要帶。')&&src.includes('謝啦。對完我再請你喝飲料。')&&!src.includes('法遵。四色筆還是要帶。')&&!src.includes('算差幾分')); }

H.done?H.done():(console.log(H.fails?('FAILED '+H.fails):'ALL PASS'),process.exit(H.fails?1:0));
