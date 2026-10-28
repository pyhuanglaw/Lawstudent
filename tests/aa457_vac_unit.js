// AA_457 寒暑假重複第二輪（企劃線 3be31d3c8，AA-B 2026-10-25 08:5x；D99 第二優先：寒暑假）——不需要瀏覽器。台詞逐字對 AA_457（從企劃線 git show 讀稿、解析表格）。
//   0 讀稿（四張表都讀得到）；資料照稿寫（MSG.UK_WEEK 兩次在英國 12＋30 句、yt2.A／B.ask 四組、沛珊 ask.homeBy 五個節日）
//   1 芷若在英國、交往中：每天一則 → 每週一則（她到英國那天起每七天一段、台灣 07:00／夏令 06:00）；照月份、照第幾次在英國的新句子（tag zr_uk<次>_<月><a…>），同一次在英國每句只發一次；
//     那個月的用完了從原本十句挑這次沒發過的（tag 照舊 zr_uk_daily_<日>）；也用完了那週不發；兩次在英國分開算；舊存檔（已經用每天規則收過）不重發、不爆量補發
//   2 語彤裂縫②（AA_431 1-3）：開頭照這一種（A 顧店／B 回診）第幾次輪流——第 1 次原句、第 2～4 次各組、第 5 次起從第 2 組再輪（稿「5 以後：從 2 再輪」）；選項、回覆不變；tag ct_yt2_<n> 不變；舊存檔照已經收過的次數算
//   3 沛珊她約（fest3d.js herLines）：她在台南的時候五個節日各自的句子（ask.homeBy；七夕那句「做十六歲」）；不在台南（台中、臺北）照原本；tag fest_ask_<她>_<節日>_<年> 不變、舊存檔收過不重發
// 修改前（開發分支 01bab5952）：0～3 每一節至少一項 FAIL。用法：node tests/aa457_vac_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(MSG|MSG_POOL|MSG2_POOL|ZRUK|EXCH|R2Y4A|R2Y4A_EVENTS|CRACKTALK|CRACKTALK_LINES|FEST|FEST_DATA|FEST_EVENTS)$/;
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js','src/exchange3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js','src/data/fest_events.js','src/fest3d.js']) L3(f);   /* 照 aa456_vac_unit.js、v6_crack_unit.js、aa416_fest_unit.js 載的檔 */
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{};
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const fresh=(k,h,flags)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,'dorm',flags||{}); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; PHONE.rec(G); E.player.busy=false; E.paused=false; return G; };
const at=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const oldMsg=(tag,th,from,text,d,h)=>{ PHONE.rec(H.G); H.G.msgs.push({th,from,text,tag,day:d,h}); };   /* 舊存檔：這一則已經用舊的字收過了 */

/* ---- 讀稿（企劃線 d809cdd21＝3be31d3c8＋3-1 節兩題答案）---- */
let doc=''; try{ doc=cp.execSync('git show d809cdd21:"docs/story_planning/AA_457_寒暑假重複第二輪_芷若英國每天一則_語彤裂縫_沛珊回家的邀約.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const part=(a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const rows=t=>t.split('\n').filter(l=>/^\|/.test(l.trim())&&!/^\|\s*-/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const orig=s=>s.replace(/（原句）$/,'').trim();
const monTab=t=>{ const o={}; for(const r of rows(t)) if(/^\d{1,2}$/.test(r[0])) (o[+r[0]]=o[+r[0]]||[]).push(r[1]); return o; };
/* AA_507 0-2 第 5 點（企劃線 e4fbd0192，AA-C 10-28）：她 2/11 就離開英國、不上新學期——1-1 表 1 月第二句、2 月第一句照 AA_507 換（其他照 AA_457）*/
const FIX507_UK=[['這學期的課表出來了。週三整天都是片。','一月要考試。考完我想去北邊看一次雪。'],['剩三個禮拜。我開始數了。','剩十天。我開始數了。']];
const X1=monTab(FIX507_UK.reduce((x,[a,b])=>x.split(a).join(b),part('### 1-1','### 1-2'))), X2=monTab(part('### 1-2','## 2.'));
const N=o=>Object.values(o).reduce((a,L)=>a+L.length,0);
const YA=[], YB=[]; let Y5=''; for(const r of rows(part('## 2.','## 3.'))){ if(/^[1-4]$/.test(r[0])){ YA[+r[0]-1]=orig(r[1]); YB[+r[0]-1]=orig(r[2]); } if(/^5/.test(r[0])) Y5=r[1]+'|'+r[2]; }
const FK={情人節:'vday',三月十四:'white',七夕:'qixi',她的生日:'bday',聖誕:'xmas'}, X3={}; for(const r of rows(part('## 3.','## 3-1.'))) if(FK[r[0]]) X3[FK[r[0]]]=r[1];   /* 第 3 節的表（3-1 節的表多一欄「她在哪」，另外讀）*/
const inDoc=t=>doc.indexOf(t)>=0;
const OLD3='明天你要下來嗎？……不用勉強。';
const TC3={vday:'明天情人節。……你要下來台中嗎？不用勉強。',qixi:'明天七夕。台中的夜市很熱鬧，你要下來嗎？……不用勉強。'};   /* 3-1 節①：情人節、七夕她在台中老家；三月十四、聖誕在台南照第 3 節；「做十六歲」、生日那句拿掉 */
const ZR='heroine_02', YT='heroine_03', PS='classmate_peishan';
const PAT=/^zr_uk(_daily_\d+|[12]_\d\d[a-c])$/;
const ORIG10=()=>((MSG_POOL.people[ZR]||{}).replies||[]).filter(e=>e.variant==='在英國'&&e.topic==='daily'&&!e.disabled);

(async()=>{
/* ---- 0 ---- */
await sec(0,()=>{
  check('0. 讀得到稿、檔都載得到（MSG、CRACKTALK、FEST）',!!doc&&!loadErr.length&&typeof MSG!=='undefined'&&typeof CRACKTALK!=='undefined'&&typeof FEST!=='undefined',J(loadErr));
  check('0. 稿裡四張表都讀得到（1-1 六個月 12 句、1-2 十二個月 30 句、第 2 節四組＋「5 以後：從 2 再輪」、第 3 節五個節日）',Object.keys(X1).length===6&&N(X1)===12&&Object.keys(X2).length===12&&N(X2)===30&&YA.length===4&&YB.length===4&&YA[0]==='今天顧店到九點。'&&YB[0]==='明天陪我媽回診。'&&/從 2 再輪.*從 2 再輪/.test(Y5)&&Object.keys(X3).length===5&&doc.indexOf(OLD3)>=0,
    J({X1:N(X1),X2:N(X2),YA,YB,Y5,X3}));
  const U=MSG.UK_WEEK||{}, eq=(a,b)=>J(Object.keys(a||{}).sort())===J(Object.keys(b).sort())&&Object.keys(b).every(m=>J((a||{})[m])===J(b[m]));
  check('0. MSG.UK_WEEK 照稿：第一次在英國 = 1-1 的表、第二次 = 1-2 的表（照月份、照表的順序，一字不差；「／」＝照片和那一句分兩則）',eq(U[1],X1)&&eq(U[2],X2),J(U));
  const Y=(CRACKTALK_LINES.SRC2||{}).yt2||{};
  check('0. 語彤 yt2.A.ask、yt2.B.ask 是四組（照第 2 節的表，第 1 組＝原句）',J((Y.A||{}).ask)===J(YA)&&J((Y.B||{}).ask)===J(YB),J([Y.A&&Y.A.ask,Y.B&&Y.B.ask]));
  const A=((FEST_DATA.PEOPLE||{})[PS]||{}).ask||{}, hb=A.homeBy||{};
  check('0. 沛珊 ask.homeBy 照 3-1 節①：情人節、七夕＝台中那兩句，三月十四、聖誕＝台南（第 3 節）；沒有生日、沒有「做十六歲」；原本的 homeLines 留著',J(hb)===J({vday:{台中:[TC3.vday]},white:{台南:[X3.white]},qixi:{台中:[TC3.qixi]},xmas:{台南:[X3.xmas]}})&&inDoc(TC3.vday)&&inDoc(TC3.qixi)&&J(A.homeLines)===J([OLD3])&&!/做十六歲/.test(J(hb)),J(hb));
});
/* ---- 1 芷若在英國：每週一則 ---- */
const zr=(k,h)=>{ const G=fresh(k,h); SOCIAL.remember(ZR,'FIRST_MET',''); INV.addContact(G,ZR); H.CLOSE(ZR); ROM.start(G,ZR); return G; };
const sim=(d0,d1,hs)=>{ const log=[], pre=new Set((H.G.msgs||[]).map(m=>m.tag+'@'+m.day)), by={};   /* 只記模擬期間新收到的（舊存檔原本就有的不算）*/
  for(let d=d0;d<=d1;d++) for(const h of (hs||[0.5,7.5,20])){ at(d,h); rules();
    for(const m of (H.G.msgs||[])){ if(!PAT.test(m.tag||'')||m.from!==ZR) continue; const k=m.tag+'@'+m.day; if(pre.has(k)) continue; if(!by[k]){ by[k]={tag:m.tag,day:m.day,h:m.h,t:[],seen:new Set()}; log.push(by[k]); } const e=by[k], u=m.h+'|'+m.text; if(!e.seen.has(u)){ e.seen.add(u); e.t.push(m.text); } } }
  return log.map(e=>({tag:e.tag,day:e.day,h:e.h,t:e.t})); };
const isNew=e=>/^zr_uk[12]_/.test(e.tag), mOf=e=>+e.tag.slice(7,9), iOf=e=>e.tag.charCodeAt(9)-97;
const oIdx=e=>ORIG10().findIndex(o=>J(o.msgs)===J(e.t));
await sec(1,()=>{
  const L=ORIG10(); check('1. 原本十句（msg_pool.js daily，BB_178 1-E）還在、tag 照舊',L.length===10);
  /* 第一次在英國：從頭玩到她回來 */
  const F1=D('2027-09-03'), E1=D('2028-02-11'); zr('2027-09-01',8);
  const s1=sim(D('2027-09-01'),D('2028-02-20'));
  const days=s1.map(e=>e.day), gaps=days.slice(1).map((d,i)=>d-days[i]);
  check('1. 出發那天（9/2）不發；到的那天（9/3）起：第一則照片「'+(X1[9]||[''])[0]+'」',s1.length>0&&s1[0].day===F1&&J(s1[0].t)===J((X1[9]||[''])[0].split('／'))&&!s1.some(e=>e.day<F1),J(s1.slice(0,2)));
  check('1. 每週一則，不是每天：9/3～9/9 只有一則；兩則之間都隔七天的倍數（同一天、同一週不會兩則）；她回臺灣（2/12）以後不發',s1.filter(e=>e.day>=F1&&e.day<F1+7).length===1&&gaps.every(g=>g>=7&&g%7===0)&&!s1.some(e=>e.day>E1),J(s1.map(e=>keyOf(e.day))));
  check('1. 時間照原本：台灣 07:00（夏令時間 06:00）＝她那邊 23:00 睡前（9/3 06:00、11/5 07:00）',s1.every(e=>Math.abs(e.h-(MSG.ukOff(Object.assign({},H.G,{day:e.day}))-1))<0.05)&&Math.abs(s1[0].h-6)<0.05&&s1.some(e=>keyOf(e.day)==='2027-11-05'&&Math.abs(e.h-7)<0.05),J(s1.map(e=>[keyOf(e.day),e.h])));
  const CNT1=(MSG.UK_COUNT||{})[1]||[], LV1=D('2028-02-11'), inWin=e=>{ const c=CNT1.find(c=>'zr_'+c[0]===e.tag); return !!c&&LV1-e.day>=c[1]&&LV1-e.day<=c[2]; };
  const n1=s1.filter(isNew), bad1=n1.filter(e=>!/^zr_uk1_/.test(e.tag)||(CNT1.some(c=>'zr_'+c[0]===e.tag)?!inWin(e):CALENDAR.dateOf(e.day).m!==mOf(e))||J(e.t)!==J(((X1[mOf(e)]||[])[iOf(e)]||'').split('／')));
  check('1. 倒數兩句照離開英國前第幾天（3-1 節②，第一次 2/11 離開）：「剩三個禮拜。我開始數了。」21～15 天、「箱子還沒整理。……」7 天以內',CNT1.length===2&&n1.filter(e=>CNT1.some(c=>'zr_'+c[0]===e.tag)).length===2&&n1.filter(e=>CNT1.some(c=>'zr_'+c[0]===e.tag)).every(inWin),J(n1.filter(e=>/02[ab]$/.test(e.tag)).map(e=>[keyOf(e.day),e.tag,LV1-e.day])));
  check('1. 第一次在英國：1-1 的 12 句每句剛好一次，都在表上的那個月發（倒數兩句照離開前第幾天）、字一字不差（tag zr_uk1_<月><a、b>）',n1.length===12&&new Set(n1.map(e=>e.tag)).size===12&&!bad1.length,J(bad1.length?bad1:n1.map(e=>[keyOf(e.day),e.tag])));
  const ord=Object.keys(X1).every(m=>{ const z=n1.filter(e=>mOf(e)===+m).map(iOf); return J(z)===J(z.slice().sort()); });
  check('1. 同一個月照表的順序',ord);
  const o1=s1.filter(e=>!isNew(e)), oi=o1.map(oIdx);
  check('1. 那個月的用完了才用原本十句（tag 照舊 zr_uk_daily_<日>）：這一次在英國每句只發一次（十句都用到）；9 月第 3、4 週＝原本第 1、2 句',o1.every(e=>e.tag==='zr_uk_daily_'+e.day)&&oi.every(i=>i>=0)&&new Set(oi).size===oi.length&&oi.length===10&&
    o1.every(e=>{ const m=CALENDAR.dateOf(e.day).m; return (X1[m]||[]).every((x,i)=>n1.some(f=>f.day<e.day&&mOf(f)===m&&iOf(f)===i)); })&&J(o1.slice(0,2).map(e=>keyOf(e.day)))===J(['2027-09-17','2027-09-24'])&&J(oi.slice(0,2))===J([0,1]),J(o1.map(e=>[keyOf(e.day),oIdx(e)])));
  const blocks=[]; for(let w=0;F1+7*w<=E1;w++) blocks.push(w); const empty=blocks.filter(w=>!s1.some(e=>Math.floor((e.day-F1)/7)===w)).map(w=>keyOf(F1+7*w));
  check('1. 這個月的、原本十句都用完了＝那一週不發（倒數兩句改照離開前第幾天以後：1/28、2/11 兩週沒有；其他每週一則）',J(empty)===J(['2028-01-28','2028-02-11'])&&s1.length===blocks.length-2,J({empty,n:s1.length,w:blocks.length}));
  check('1. 「今天沒什麼事。只是想跟你說晚安。」一個月最多一次（照舊）',(()=>{ const a=o1.filter(e=>oIdx(e)===7).map(e=>keyOf(e.day).slice(0,7)); return new Set(a).size===a.length; })());
  /* 第二次在英國（同一個存檔接著玩）：分開算 */
  const F2=D('2028-09-03'), E2=D('2029-08-24'); const s2=sim(D('2028-08-30'),D('2029-08-31'));
  const n2=s2.filter(isNew), bad2=n2.filter(e=>!/^zr_uk2_/.test(e.tag)||CALENDAR.dateOf(e.day).m!==mOf(e)||J(e.t)!==J(((X2[mOf(e)]||[])[iOf(e)]||'').split('／')));
  check('1. 第二次在英國：9/2 出發那天不發、9/3 起「'+(X2[9]||[''])[0]+'」；每週一則；8/25 回來以後不發',s2.length>0&&s2[0].day===F2&&J(s2[0].t)===J((X2[9]||[''])[0].split('／'))&&s2.slice(1).every((e,i)=>e.day-s2[i].day>=7&&(e.day-s2[i].day)%7===0)&&!s2.some(e=>e.day>E2),J(s2.slice(0,3).map(e=>[keyOf(e.day),e.tag])));
  check('1. 第二次在英國：1-2 的 30 句每句剛好一次、都在那個月、一字不差（tag zr_uk2_…）；不出第一次的句子',n2.length===30&&new Set(n2.map(e=>e.tag)).size===30&&!bad2.length,J(bad2.length?bad2:n2.length));
  const o2=s2.filter(e=>!isNew(e)), oi2=o2.map(oIdx);
  check('1. 兩次分開算：原本十句第二次在英國又可以用（每句一次；第一次用過的不算）；9/17 是原本第 1 句',oi2.length===10&&new Set(oi2).size===10&&oi2.every(i=>i>=0)&&keyOf(o2[0].day)==='2028-09-17'&&oi2[0]===0,J(o2.map(e=>[keyOf(e.day),oIdx(e)])));
  const W=(MSG.rec(H.G).ukWk)||{}; check('1. 存檔 G.msgChat.ukWk 兩次分開（Y3、Y4）',!!W.Y3&&!!W.Y4&&W.Y3.used.length===22&&W.Y4.used.length===40,J(Object.keys(W)));
  zr('2028-11-14',6); H.G.flags.dating_heroine_02=false; check('1. 沒交往（分開以後）不發：交往旗標拿掉就沒有',!sim(D('2028-11-14'),D('2028-11-30')).length);
});
/* ---- 1 舊存檔：已經用每天規則收過 ---- */
const oldDaily=(d0,d1,start)=>{ const L=ORIG10(); let i=start|0; for(let d=d0;d<=d1;d++){ const e=L[i%10]; e.msgs.forEach((t,j)=>oldMsg('zr_uk_daily_'+d,'p:'+ZR,ZR,t,d,7+j/60)); i++; } MSG.rec(H.G).rot.uk_daily=i%10||10; return i; };
await sec('1舊',()=>{
  const L=ORIG10();
  /* 9/3 起每天都收（十句都收過了），最後一則 9/24 07:00＝這一週已經收過 */
  zr('2027-09-03',8); oldDaily(D('2027-09-03'),D('2027-09-24')); const before=(H.G.msgs||[]).length;
  const s=sim(D('2027-09-24'),D('2027-11-05'),[8,20]);
  check('1. 舊存檔（每天收、十句都收過、這一週 9/24 已經收過）：這一週不補、9 月沒用到的不補發；之後只有新的句子，原本十句不再出現（10/1、10/8 兩則，10/15～10/29 不發，11/5 起 11 月）',
    J(s.map(e=>[keyOf(e.day),e.tag]))===J([['2027-10-01','zr_uk1_10a'],['2027-10-08','zr_uk1_10b'],['2027-11-05','zr_uk1_11a']]),J(s.map(e=>[keyOf(e.day),e.tag])));
  check('1. 舊存檔的紀錄：十句都算這一次在英國發過、最後收到那一則的那一段＝這一段發過',(((MSG.rec(H.G).ukWk||{}).Y3||{used:[]}).used.filter(u=>/^d\d$/.test(u)).length===10),J(MSG.rec(H.G).ukWk));
  /* 9/18 才開始交往（收過三則）：那三句不再發，第四句接著 */
  zr('2027-09-18',8); oldDaily(D('2027-09-18'),D('2027-09-20')); const t=sim(D('2027-09-20'),D('2028-02-12'),[8,20]);
  const ot=t.filter(e=>!isNew(e)).map(oIdx);
  check('1. 舊存檔只收過三則（原本第 1～3 句）：之後那三句不重發；月份的用完先接第 4 句；剩下七句各一次',J(ot)===J([3,4,5,6,7,8,9])&&J(t.slice(0,4).map(e=>e.tag))===J(['zr_uk1_09a','zr_uk1_10a','zr_uk1_10b','zr_uk_daily_'+D('2027-10-15')]),J(t.map(e=>[keyOf(e.day),e.tag,oIdx(e)])));
  /* 手機紀錄被截掉（200 則，看不到這一次在英國的開頭）：十句都算收過 */
  zr('2027-09-10',8); for(let k=0;k<199;k++) oldMsg('x_'+k,'g:x','zhe','…',D('2027-09-10')+Math.floor(k/20),9); oldDaily(D('2027-09-20'),D('2027-09-20'),7);
  const u=sim(D('2027-09-21'),D('2027-10-31'),[8,20]);
  check('1. 舊存檔手機紀錄被截掉（看不到 9/3 開頭）：原本十句都算收過，不補發（9/24 9 月第一句、10 月兩句，10/15 以後到月底不發）',(H.G.msgs||[]).length>=200&&J(u.map(e=>e.tag))===J(['zr_uk1_09a','zr_uk1_10a','zr_uk1_10b']),J(u.map(e=>[keyOf(e.day),e.tag])));
  /* 第一次在英國收過的（舊存檔，十句都收過）→ 第二次在英國照樣可以用 */
  zr('2028-08-30',8); oldDaily(D('2027-09-03'),D('2027-09-20')); const v=sim(D('2028-08-30'),D('2028-09-30'),[8,20]);
  check('1. 舊存檔第一次在英國收過的十句：第二次在英國分開算（9/3、9/10 新句子、9/17 原本第 1 句、9/24 第 2 句）',J(v.map(e=>[keyOf(e.day),isNew(e)?e.tag:oIdx(e)]))===J([['2028-09-03','zr_uk2_09a'],['2028-09-10','zr_uk2_09b'],['2028-09-17',0],['2028-09-24',1]]),J(v.map(e=>[keyOf(e.day),e.tag,oIdx(e)])));
  zr('2027-10-04',8); delete MSG.rec(H.G).ukWk; oldDaily(D('2027-10-04'),D('2027-10-05')); at(D('2027-10-05'),9); rules(); rules();
  check('1. 舊存檔今天已經收過（10/5，和 10/1 同一段）：今天、這一週不再發',new Set((H.G.msgs||[]).filter(m=>PAT.test(m.tag||'')).map(m=>m.tag)).size===2&&((MSG.rec(H.G).ukWk||{}).Y3||{}).wk===4,J(MSG.rec(H.G).ukWk));
});
/* ---- 2 語彤裂縫②：開頭照第幾次輪流 ---- */
await sec(2,()=>{
  const X=CRACKTALK_LINES.SRC2.yt2, OA=['我去店裡吃。','那我等妳下班。','今天可以不要顧店嗎？陪我。'], OB=['要我一起去嗎？','好，下週見。','回診可以讓阿姨陪嗎？我們去看電影。'];
  const yt=k=>{ const G=fresh(k,10); SOCIAL.remember(YT,'FIRST_MET',''); INV.addContact(G,YT); H.CLOSE(YT); ROM.start(G,YT); ROM.get(G,YT).sinceDay=G.day; return G; };
  const ask=n=>{ const m=PHONE.byAsk(H.G,'ct_yt2_'+n); return m?{t:(H.G.msgs||[]).filter(x=>x.tag==='ct_yt2_'+n&&x.from===YT).map(x=>x.text),o:m.ask.opts.map(o=>o.t)}:null; };
  yt('2026-10-05'); const got=[], rep=[], R=()=>CRACKTALK.src(H.G).yt2||{};
  for(let d=D('2026-10-05');d<=D('2027-12-31')&&got.length<10;d++) for(const h of [16.6,21.05]){ at(d,h); rules(); const n=got.length, a=ask(n); if(!a) continue; const k=R().sent[n];
    got.push({n,k,t:a.t,o:a.o,day:keyOf(d)});
    const pick=(k==='B'&&got.filter(g=>g.k==='B').length===2)?2:0; PHONE.answer(H.G,'ct_yt2_'+n,pick); rules(); rep.push({n,k,pick,r:(H.G.msgs||[]).filter(x=>x.tag==='ct_yt2_'+n+'_r'&&x.from===YT).map(x=>x.text)}); }
  const A=got.filter(g=>g.k==='A'), B=got.filter(g=>g.k==='B');
  check('2. A（顧店那天 16:30）：第 1 次原句「'+YA[0]+'」、第 2～4 次「'+YA.slice(1).join('」「')+'」、第 5 次從第 2 組再輪（收到 '+A.length+' 次）',A.length>=5&&J(A.slice(0,5).map(g=>g.t))===J([YA[0],YA[1],YA[2],YA[3],YA[1]].map(t=>[t])),J(A.map(g=>[g.day,g.t])));
  check('2. B（週五 21:00）：第 1 次原句「'+YB[0]+'」、第 2～4 次「'+YB.slice(1).join('」「')+'」'+(B.length>=5?'、第 5 次從第 2 組再輪':'')+'（收到 '+B.length+' 次）',B.length>=4&&J(B.slice(0,5).map(g=>g.t))===J([YB[0],YB[1],YB[2],YB[3],YB[1]].slice(0,Math.min(5,B.length)).map(t=>[t])),J(B.map(g=>[g.day,g.t])));
  check('2. A、B 照舊輪流；tag ct_yt2_<n> 照舊',got.length>=9&&got.every((g,i)=>g.k===(i%2?'B':'A')&&g.n===i),J(got.map(g=>g.k)));
  check('2. 選項每次都照舊（A 三個、B 三個）',got.every(g=>J(g.o)===J(g.k==='A'?OA:OB)),J(got.map(g=>g.o)));
  check('2. 回覆照舊：四種開頭都接「我去店裡吃。」→「嗯。我留一碗。」；第 2 次回診「回診可以讓阿姨陪嗎？……」→「……阿姨要顧店。」',rep.filter(r=>r.k==='A').every(r=>J(r.r)===J(['嗯。我留一碗。']))&&J((rep.filter(r=>r.k==='B')[1]||{}).r)===J(['……阿姨要顧店。'])&&rep.filter(r=>r.k==='B'&&r.pick===0).every(r=>J(r.r)===J(['不用。……可是謝謝。'])),J(rep));
  /* 舊存檔：已經用原句收過 A、B、A（n=3）→ 下一次是第 2 次 B、再下一次第 3 次 A */
  yt('2026-10-05'); const R0=CRACKTALK.src(H.G); R0.yt2={next:D('2027-02-01'),n:3,sent:{0:'A',1:'B',2:'A'},done:{0:true,1:true,2:true}};
  oldMsg('ct_yt2_0','p:'+YT,YT,YA[0],D('2026-11-03'),16.5); oldMsg('ct_yt2_1','p:'+YT,YT,YB[0],D('2026-12-04'),21); oldMsg('ct_yt2_2','p:'+YT,YT,YA[0],D('2027-01-05'),16.5);
  const g2=[]; for(let d=D('2027-02-01');d<=D('2027-05-31')&&g2.length<2;d++) for(const h of [16.6,21.05]){ at(d,h); rules(); const a=ask(3+g2.length); if(a) g2.push(a.t); }
  check('2. 舊存檔（收過 A、B、A，都是原句）：下一則是第 2 次 B「'+YB[1]+'」、再下一則第 3 次 A「'+YA[2]+'」；收過的 ct_yt2_0～2 不重發',J(g2)===J([[YB[1]],[YA[2]]])&&[0,1,2].every(n=>byTag('ct_yt2_'+n).length===1),J(g2));
});
/* ---- 3 沛珊在台南：節日的邀約照節日換 ---- */
await sec(3,()=>{
  const K=['vday','white','qixi','bday','xmas'];
  const tn=K.map(k=>FEST.herLines(PS,k,true,'台南')), tc=K.map(k=>FEST.herLines(PS,k,true,'台中'));
  check('3. 她在台南（home、台南）：三月十四「'+X3.white+'」、聖誕「'+X3.xmas+'」；情人節、七夕、生日在台南沒有＝原本「'+OLD3+'」（3-1 節①）',J(tn)===J([[OLD3],[X3.white],[OLD3],[OLD3],[X3.xmas]]),J(tn));
  check('3. 「做十六歲」那句拿掉（3-1 節①）',!K.some(k=>[FEST.herLines(PS,k,true,'台南'),FEST.herLines(PS,k,true,'台中')].some(L=>/做十六歲/.test(J(L)))));
  check('3. 她在台中老家：情人節「'+TC3.vday+'」、七夕「'+TC3.qixi+'」；三月十四、生日、聖誕在台中＝原本（3-1 節①）',J(tc)===J([[TC3.vday],[OLD3],[TC3.qixi],[OLD3],[OLD3]]),J(tc));
  check('3. 在臺北（不是 home）照原本：第一句照節日換（「明天是情人節！！」「明天是聖誕節！！」）、第二句約溫州街口（AA_460 4-3 的臺北版照第 9 節當作沒有）',J(FEST.herLines(PS,'vday',false))===J(['明天是情人節！！','晚上六點半，溫州街口，可以嗎？'])&&J(FEST.herLines(PS,'xmas',false))===J(['明天是聖誕節！！','晚上六點半，溫州街口，可以嗎？']));
  check('3. 其他人照舊（以安聖誕第一句換字、芷若照 by 整組）',FEST.herLines('heroine_01','xmas',false)[0]==='明天是聖誕節。'&&J(FEST.herLines(ZR,'vday',false))===J(((FEST_DATA.PEOPLE[ZR].ask||{}).by||{}).vday||null));
  /* 實際手機（前一天 21:00，交往中）*/
  const ps=k=>{ const G=fresh(k,21.05); const r=SOCIAL.rel(PS); Object.assign(r,{fam:65,trust:50,comf:45,npcRom:60,rom:35}); SOCIAL.remember(PS,'FIRST_MET',''); INV.addContact(G,PS); G.contacts[PS]=G.day-60; G.flags['dating_'+PS]=true; ROM.get(G,PS).status='dating'; return G; };
  const dm=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+PS&&m.from===PS).map(m=>m.text);
  const flow=(k,y,day)=>{ ps(day); FEST.phone(H.G); PHONE.tick(H.G); const m=PHONE.byAsk(H.G,'fest_ask_'+PS+'_'+k+'_'+y); return {t:dm(),o:m?m.ask.opts.map(o=>o.t):null,w:FEST.where(H.G,PS,k,y,FEST.dayOf(PS,k,y))}; };
  const w8=flow('white',2028,'2028-03-13'), x7=flow('xmas',2027,'2027-12-23'), x8=flow('xmas',2028,'2028-12-23'), w9=flow('white',2029,'2029-03-13');
  check('3. 手機（她在台南）：2028、2029 白色情人節前一天 21:00「'+X3.white+'」；2027、2028 聖誕「'+X3.xmas+'」；tag fest_ask_classmate_peishan_<節日>_<年>、選項「好。」「那天不行。」照舊',
    [w8,w9].every(r=>r.w&&r.w.city==='台南'&&J(r.t)===J([X3.white]))&&[x7,x8].every(r=>r.w&&r.w.city==='台南'&&J(r.t)===J([X3.xmas]))&&[w8,x7,x8,w9].every(r=>J(r.o)===J(['好。','那天不行。'])),J({w8,x7,x8,w9}));
  const v8=flow('vday',2028,'2028-02-13'), q8=flow('qixi',2028,'2028-08-25');
  check('3. 手機（她回台中的家）：2028 情人節「'+TC3.vday+'」、2028 七夕「'+TC3.qixi+'」（3-1 節①）',[v8,q8].every(r=>r.w&&r.w.city==='台中')&&J(v8.t)===J([TC3.vday])&&J(q8.t)===J([TC3.qixi]),J({v8,q8}));
  ps('2028-03-13'); oldMsg('fest_ask_'+PS+'_white_2028','p:'+PS,PS,OLD3,D('2028-03-13'),21); FEST.phone(H.G); PHONE.tick(H.G);
  check('3. 舊存檔 2028 白色情人節那一則已經收過（舊的字）：不重發',byTag('fest_ask_'+PS+'_white_2028').length===1&&!dm().includes(X3.white),J(dm()));
});
H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
