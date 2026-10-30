// AA_402 柏翰、芯慈大二起每學期兩句閒聊（企劃線 235cf61ac；任務 AA389-REST-L-1023）——不需要瀏覽器。
//   每學期每天找他／她說一次話（23:00），整學期下來：那學期的兩句都出現、各一次、在條件的週次或日子裡；條件句（沛珊分開以前、翰 4 以前、以安出國以前、日本路線大三下）不出現
// 修改前（開發分支 1987127f2）：沒有這些句子（全部 FAIL）。用法：node tests/aa402_smalltalk_unit.js
// 2026-10-28 改（AA_497 2-9，企劃線 7a38216ca；tests/aa497_supporting_unit.js 測新句）：芯慈大四上「我最近在追一部日劇。……」拿掉（追劇減量）、「國考跟研究所，我兩個都報了。」換成「……本來想先實習再說的。」、
//   大三下「以安不在，第一排的位子我坐了。……」換成「以安不在，她的位子一直空著。……」；另外多四句 AA_497 的新閒聊（大二下～大四下）。對 AA_402 稿的那一項只看 AA_402 的句子。
require('./alison.js');
const H=require('./pg_harness.js');
const cp=require('child_process');
const {check}=H, J=JSON.stringify;
const D=k=>STORY.dayOfKey(k);
let doc=''; try{ doc=cp.execSync('git show 235cf61ac:"docs/story_planning/AA_402_柏翰芯慈大二起的閒聊_SMALLTALK.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const AA497=new Set(['「財金系的課跟法律系的撞了一堂，我改修晚上那一班。」'/* AA_547 第 4 節（原本「經濟系的課…」）*/,'「永和到這裡要換一次車。我在車上可以看完一章。」','「這學期雙主修的課沒有撞堂。……我把那一格空下來了。」','「以安的手帳跟我用的是同一款。我們兩個都沒說。」','「最後一堂課，我坐第一排。以安坐我旁邊。」',   /* AA_497 2-9 新加的四句 */
  '「以安不在，她的位子一直空著。我想把書放上去，又沒放。」','「國考跟研究所，我兩個都報了。本來想先實習再說的。」']);   /* AA_497 2-9 換掉的兩句 */
const NEW=id=>SMALLTALK[id].filter(e=>typeof e==='object'&&e.term&&!/^Y1/.test(e.term[0]));
check('0. 每一句都在稿裡（一字不差；AA_497 換的、加的句子不算這份稿）',!!doc&&[...NEW('classmate_bohan'),...NEW('classmate_xinci')].filter(e=>!AA497.has(e.t)).every(e=>doc.indexOf(e.t)>=0),J([...NEW('classmate_bohan'),...NEW('classmate_xinci')].filter(e=>!AA497.has(e.t)&&doc.indexOf(e.t)<0).map(e=>e.t)));
check('0. 柏翰 12 句、芯慈 13 句（大二上～大四下；AA_497 拿掉追劇那一句＝12 句，另加四句），每句 once',NEW('classmate_bohan').length===12&&NEW('classmate_xinci').length===12+4&&NEW('classmate_xinci').filter(e=>AA497.has(e.t)).length===6&&[...NEW('classmate_bohan'),...NEW('classmate_xinci')].every(e=>e.once===true));
/* 一整學期每天說一次：回傳 [{t, week, day}] */
const termRun=(id,term,flags,setup)=>{ const r=CALENDAR.termDays?CALENDAR.termDays(term):null; if(!r) return []; H.fresh(CALENDAR.dateOf(r.from).key,23,'campus',Object.assign({EXCHANGE_ROUTE:'TW'},flags||{})); H.FRIEND(id); if(setup) setup(H.G);
  const out=[]; for(let d=r.from;d<=r.to;d++){ H.at(CALENDAR.dateOf(d).key,23); const x=STORY.smallTalk(H.G,id); if(x&&x.say){ const t=CALENDAR.termOf(d); out.push({t:x.say,week:t?t.week:0,day:d}); } } return out; };
const once=(L,t)=>L.filter(x=>x.t===t);
for(const [id,term,lines] of [
  ['classmate_bohan','Y2S1',[['「法服的值班表，我排到十二月了。」',1],['「這學期我週三晚上空出來了。要讀書的話，可以找我。」',7]]],
  ['classmate_bohan','Y2S2',[['「法服這學期的個案，比上學期多一倍。」',1],['「你下學期修幾學分。我在看要不要多修一門。」',12]]],
  ['classmate_bohan','Y3S2',[['「推甄的書面資料，我寫到第四版了。」',1],['「暑假我不回新竹。總圖暑假也開。」',13]]],
  ['classmate_bohan','Y4S1',[['「面試的問題，我準備了四十題。」',5,8],['「推甄上了。……我媽在電話裡哭了，我沒有。」',12]]],
  ['classmate_xinci','Y2S2',[['「週四晚上我借了一間討論室。你要來的話，我多印一份。」',1],['「期末考完那天晚上，有空嗎？我先問，你不用現在回答。」',13]]],
  ['classmate_xinci','Y3S1',[['「我爸說寒假可以去事務所幫忙。……我還沒決定。」',1],['「以安的交換，你知道她選哪裡嗎？……我只是問。」',8,12]]],
  ['classmate_xinci','Y4S1',[['「國考跟研究所，我兩個都報了。本來想先實習再說的。」',1]]] ]){   /* AA_497 2-9：換句、追劇那一句拿掉 */
  const L=termRun(id,term); const bad=lines.filter(([t,w0,w1])=>{ const o=once(L,t); return o.length!==1||o[0].week<w0||(w1&&o[0].week>w1); });
  check('1. '+id+' '+term+'：兩句都出現、各一次、在條件的週次裡',!bad.length,J({bad:bad.map(b=>b[0]),got:L.filter(x=>lines.some(l=>l[0]===x.t))})); }
/* 條件句 */
{ const L=termRun('classmate_bohan','Y3S1'); const L2=termRun('classmate_bohan','Y3S1',{},G=>{ G.events.done.ev_bohan_third_floor=1; });
  check('2. 柏翰「四樓樓梯間…」：翰 4（ev_bohan_third_floor）以前不出、以後才出',!once(L,'「四樓樓梯間，下午兩點以後就沒有人了。」').length&&once(L2,'「四樓樓梯間，下午兩點以後就沒有人了。」').length===1); }
{ const L=termRun('classmate_bohan','Y4S2'); const o=once(L,'「國考讀書會的考古題，我排到七月了。」');
  check('2. 柏翰「國考讀書會的考古題…」：2029-03-01 以後',o.length===1&&o[0].day>=D('2029-03-01'),J(o)); }
{ const L=termRun('classmate_xinci','Y2S1'), L2=termRun('classmate_xinci','Y2S1',{},G=>{ G.events.done.ev_xinci_double=1; });
  check('2. 芯慈大二上：沒有雙主修＝「永和過來要四十分鐘。」；有＝「財金系的課……改修晚上那一班。」（AA_547 第 4 節）',once(L,'「我每天早上七點的公車。永和過來要四十分鐘。」').length===1&&!once(L,'「財金系的課跟法律系的撞了一堂，我改修晚上那一班。」').length&&once(L2,'「財金系的課跟法律系的撞了一堂，我改修晚上那一班。」').length===1); }
{ const E='「以安不在，她的位子一直空著。我想把書放上去，又沒放。」';   /* AA_497 2-9 換的句子 */
  const L=termRun('classmate_xinci','Y3S2'), L2=termRun('classmate_xinci','Y3S2',{EXCHANGE_ROUTE:'JP'}); const o=once(L,E);
  check('2. 芯慈「以安不在…」：3/25 以後；日本路線不說',o.length===1&&o[0].day>=D('2028-03-25')&&!once(L2,E).length,J(o)); }
{ const L=termRun('classmate_xinci','Y4S2'); const o=once(L,'「國考那天，我叫我媽不要來。……她說她會在外面等。」'), o2=once(L,'「畢業典禮那天，我媽要請假。她說要坐第一排。」');
  check('2. 芯慈大四下：「畢業典禮那天…」第 10 週以後、「國考那天…」2029-06 以後',o2.length===1&&o2[0].week>=10&&(o.length===0||o[0].day>=D('2029-06-01')),J({o,o2})); }
H.done();
