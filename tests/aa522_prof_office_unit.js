// AA_522 教授的研究室：周、許、林照學期換（企劃線 a3ea3918e＝fcc93126e 的第 1～7 節＋AA 加的第 8 節（f36dfe3cf）、第 9 節；AA-C 定稿，D109；任務 NPC-STORY2-1028，USER_WANTS X119）——不需要瀏覽器。
// 台詞逐字對稿（git show a3ea3918e，兩個方向）：稿上每一句、每個選項、筆記的標題與內文、閒聊兩句都在遊戲裡；六個事件（周、許、林下課後、林研究室、大四上的旁白、1-3 的提示）裡的每一句、每個選項
//   都在稿上，或是修改前就有的「現有」句（稿寫「照舊」的那幾句：周教授大一上兩題、許教授大一兩題、林教授 Q001 那句；修改前的 events.js 一字不差）。遊戲的句子外面的「」不算字（現有的句子本來就有）。
//   0  讀稿、白名單、六個事件；稿 → 遊戲、遊戲 → 稿；換掉的舊句（週三下午、來研究室聊）不在遊戲裡；研究室的 2D 背景共用 prof_door（第 7 節）
//   1  第 1 節周教授：1-1 閒聊（SMALLTALK、talkProf）只在大一上、大一下、大二上說「週四下課以後我都在」、大四下換第 9 節那一句（見下面 9），其他學期、寒暑假聊兩句天氣；
//      1-2 研究室週四 15:12～16:30、冷卻 6 天；大一上三題（加越權代理）、大一下兩題、大二上兩題，每題一次、問完不觸發（不留只剩「沒事。」）、推薦書只有大一上；
//          招呼一次一句（classAnswerPlus → 大一下第一次 → 大二上第一次 → 其他）；「沒事。」也算來過；筆記五則（標題照稿、zhou_169 內文照稿）；新五題 LEGAL_REVIEW_REQUIRED、沒有條號；大二下、大三、大四上不演
//      1-3 大四下專題下課後一次（時段照第 8 節第 4 點，見下面 8-4）：有 zhou_88＝三個選項三種回答；一則 zhou_* 都沒有＝「四年了」；只有別的 zhou_*＝兩句都不說；記 ZHOU_Y4；
//          那時候他照課表在萬才館、走過去和他說話就是這一場（STORY.populate＋talkCharacter）
//   2  第 2 節許教授：第一次見面的自我介紹照年級（大一以外不說「一年級的？」）、招呼照年級、題目照年級（大三學姊那題要認識學姊、大三研究所那題 GRAD_SCHOOL_DISCUSSION 兩版＋旁白）；
//      每題一次、那一年問完不觸發、下一年有新的；寒暑假照上一個學期的年級；地點、冷卻照舊；大二上週一下課後在萬才館、說話就是這一場
//   3  第 3 節林教授：3-1 開頭照第幾次輪四種（第五次起從頭）、最後一句第一次照舊之後「下週見。」、題庫抽題照舊；
//      3-2 研究室：大三上週二 14:00～16:30 萬才館、冷卻 7 天、最多三次、要先演過 3-1；第一次多一句、三次三句收尾；題庫抽題照稿（office）；教授紀錄 office +2；
//          她週二刑訴下課（12:10）到 16:30 在萬才館、中間不先走開（S.PROF_OFFICE：國定假日、別的學期、時段外不在）、說話就是這一場；
//          第三句以後選了刑事判決研討的，大四上第一次上課前旁白一句（公法判決研討、沒聽過第三句的沒有；一次）
//   4  第 4 節：陳教授的閒聊換句（不說來研究室聊）、黃教授那句照舊、過時的註解拿掉
//   5  舊存檔：沒有 notes、沒有新旗標、旗標壞掉都不丟例外；大一上原本兩題有筆記＝問過；許教授大一兩題有 GRAD_SCHOOL_DISCUSSION／book_xu＝問過
//   8  第 8 節（AA-C 2026-10-28 回 LAWWW-C 13:37 的問題，f36dfe3cf）：
//      8-1 許教授每週一 14:00～16:00 在萬才館，大一～大四八個學期都在（國定假日、寒暑假、別天、時段外不在）；冷卻照舊 3 天；上他課的那幾天下課後照現有
//          （大二上週一行政法 12:10 下課一路待到 16:00，13:40～14:00 不先走開，同林教授；大二下週三、大四上週五下課後照舊）；週一下午走過去和他說話就是這一場（大一、大三的自我介紹碰得到）；
//          大四下週一他和周教授（專題）同時在萬才館：兩個人站在不同的位子（不疊在一起）
//      8-2 和學姊交往中（dating_heroine_05），大三那一題換「學姊的論文，老師覺得怎麼樣？」＋兩句（逐字）；沒交往照原本那一題；同一題，問過一種就不再出另一種；
//          原本那一題寫 unless 交往中（tests/aa350_r_unit.js R7-2 認得的寫法）
//      8-3 talkProf 答得好／沒讀那兩句只在民總第一堂課（主線第二天）那一週說（舊存檔 9/18、新局 9/4）；下一週起照 1-1（有課的學期「週四下課以後我都在」、其他學期聊天氣）
//          第 9 節第 1 點：那天下課後和他說話先說這兩句（題目都還沒問也是）；研究室（ev_prof_zhou_office）那一週不演（翹課、答一半的也一樣），下一個週四開始（舊存檔 9/25、新局 9/11）
//      8-4 1-3：第 10 週專題（「回顧大一的案例」）真的上完、下課的時候周教授一句「{name}，下課來研究室一趟。」（classes3d.js afterClassEvent；一次、第 11 週那堂沒有）；
//          研究室那一場第 10 週那天、第 11～13 週的週一 15:12～16:30 去都演（第 9、14 週、週四、上課中、16:30 不演）；一次；提示以後走進萬才館和他說話就是這一場
//   9  第 9 節（AA-C 2026-10-28 回 LAWWW-C 14:12 的問題，a3ea3918e）對稿：第 1 點兩句引文（答得好「今天回答得不錯。下週……」兩版的開頭、沒讀逐字）是 talkProf 說的、研究室從下一個週四開始（行為在 8-3）；
//      第 2 點大四下的閒聊 talkProf、SMALLTALK.prof_zhou 都換「大四了。你們這一屆，我從民總教到專題。」（逐字）、不說「週四下課以後我都在」、不提研究室；SMALLTALK.prof_zhou 的每一句都在稿上（遊戲 → 稿）；
//      第 3 點「照現在」的那幾項在 8-1（許教授待到 16:00、兩位教授不疊在一起）、8-2（同一題）、8-3（週一～週日）、8-4（第 10～13 週週一、提示）
//   （法律題庫 legal_qbank.js、exam_bank.js 這一批沒有動：交付時用 git diff 核對，不寫成這裡的檢查——之後題庫照正常程序更新時這支測試不該失敗）
// 第一批（fcc93126e 第 1～7 節）修改前（只拿掉那一批 src 的改動：src/data/events.js、src/story3d.js、src/social3d.js 回到開發分支 ccf06cc69；白名單、這支測試用那時候的；git archive 那一版放進暫存目錄真的跑過，
//   稿從這個 repo 讀：AA522_DOCREPO）：FAILED 66、PASS 19（FAIL＝修改前沒有 ev_prof_lin_office／ev_prof_lin_nod、周教授只有大一的兩題、閒聊和 talkProf 還是「週三下午」、許教授不照年級、
//   林教授 3-1 開頭不換、週二下午不在萬才館、陳教授舊句）；修改後 ALL PASS（85 項）。
// 第二批（f36dfe3cf 第 8 節）修改前（只拿掉這一批 src 的改動：src/data/events.js、src/story3d.js 回到開發分支 1ca8d402f；白名單、這支測試用新的；同樣 git archive 到暫存目錄跑，AA522_DOCREPO）：
//   FAILED 19、PASS 95（FAIL＝沒有 ev_prof_zhou_y4_call（0 的事件數、8-4 提示兩項）、0 的「稿 → 遊戲」句子（交往中兩句、提示一句）和選項、交往中那一題（8-2 四項）、
//   1-3 只有第 11 週週一（1-3、8-4 的時段、提示以後走進萬才館）、許教授週一下午不在萬才館（8-1 四項：八個學期、大二上一路待著、走過去說話、和周教授不疊在一起）、
//   talkProf 下一週還說「下週…」（8-3 兩項）、沒有 STORY.civ1Week（8-3 一項）；
//   PASS＝第 1～7 節原本的 85 項裡沒改期待值的那些，和第 8 節「照舊／不該有」那一類：14:00 以前、國定假日、寒暑假、別天不在，下課後照現有、冷卻 3 天，
//   沒交往照原本那一題、大二大四不換，第一週那兩句照說、一次的檢查）
//   修改後 ALL PASS（114 項）。
//   第一批的檢查因為第 8 節改的期待值（照新稿，檢查留著）：1-3 的時段那一項（原本「只有第 11 週週一」→ 第 10、11、12 週的週一都演；完整的時段、一次在 8-4）；
//   0 的事件五個 → 六個、選項 13 → 14 個、讀稿第 1～7 節 → 第 1～8 節、白名單 fcc93126e → f36dfe3cf。
// 第三批（a3ea3918e 第 9 節）修改前（只拿掉這一批 src 的改動：src/data/events.js、src/story3d.js 回到開發分支 cee42ec2f；白名單、這支測試用新的；同樣 git archive 到暫存目錄跑，AA522_DOCREPO）：
//   FAILED 10、PASS 111（FAIL＝大四下還說「週四下課以後我都在」（1-1 三項：SMALLTALK 一筆、閒聊、talkProf；9 三項：稿 → 遊戲、不邀研究室、遊戲 → 稿）、
//   民總第一堂那天研究室那一場先演（8-3 三項：題目還沒問時先說那兩句、那一週不演、下一個週四開始；9 一項：稿 → 遊戲第 1 點）；
//   PASS＝其他 111 項，含 8-3「下一週起照 1-1」「那一週＝週一～週日」、9 的讀稿）
//   修改後 ALL PASS（121 項）。
//   之前的檢查因為第 9 節改的期待值（照新稿，檢查留著）：1-1 三項（大四下換句；SMALLTALK 一筆 → 兩筆，學期合起來照舊）、8-3 第一週那兩句那一項（原本題目都設成問過才聽得到 → 題目都還沒問）；
//   讀稿第 1～8 節 → 第 1～9 節、白名單 f36dfe3cf → a3ea3918e；第 8 節的讀稿範圍到「## 9.」為止。
// 用法：node tests/aa522_prof_office_unit.js（在沒有 .git 的目錄跑，設環境變數 AA522_DOCREPO＝這個 repo 的目錄）
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{}});
global.CHAR=Object.assign(global.CHAR||{},{build:()=>mkObj(),setExpr(){}});
const asks=[]; LEGAL.ask=async spec=>{ asks.push(JSON.parse(J(spec))); return null; }; LEGAL.STATES=['unseen','seen','confused','learned','understood','mastered'];
GM.addNote=(id,title,body)=>{ const G=H.G; if(!Array.isArray(G.notes)) G.notes=[]; if(G.notes.find(n=>n.id===id)) return false; G.notes.push({id,title,body,day:G.day}); return true; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null;
const DOCREPO=process.env.AA522_DOCREPO||H.ROOT;
const git=args=>cp.execSync('git -c core.quotepath=false '+args,{cwd:DOCREPO,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']});
const BASE='ccf06cc69';   /* 修改前（開發分支 HEAD，這一批開工的地方）*/

/* ---------- 讀稿 ---------- */
const SHA='a3ea3918e', DOCF='docs/story_planning/AA_522_教授的研究室_周許林照學期換.md';
let DOC=''; try{ DOC=git('show '+SHA+':"'+DOCF+'"'); }catch(e){ DOC=''; }
const part=(a,b)=>{ const i=DOC.indexOf(a); if(i<0) return ''; const j=b?DOC.indexOf(b,i+1):-1; return DOC.slice(i,j<0?DOC.length:j); };
const S11=part('### 1-1','### 1-2'), S12=part('### 1-2','### 1-3'), S13=part('### 1-3','## 2.'), S2=part('## 2.','## 3.'), S31=part('### 3-1','### 3-2'), S32=part('### 3-2','## 4.'), S4=part('## 4.','## 5.');
const lines=s=>String(s).split('\n');
const qs=s=>[...String(s).matchAll(/「([^」]*)」/g)].map(m=>m[1]);   /* 一行裡的「…」（內層是『』，不會切錯）*/
const after=(l,who)=>{ const i=l.indexOf(who+'：'); return i<0?null:l.slice(i+who.length+1).trim(); };
const unq=t=>String(t).replace(/^「([\s\S]*)」$/,'$1');   /* 遊戲的句子外面的「」不算字 */
const TERMZH={'大一上':'Y1S1','大一下':'Y1S2','大二上':'Y2S1','大二下':'Y2S2','大三上':'Y3S1','大三下':'Y3S2','大四上':'Y4S1','大四下':'Y4S2'};
/* 1-1 */
const D11=(()=>{ const l=lines(S11).find(x=>x.includes('→'))||''; const q=qs(l); const t=(/只在他有課的學期說：([^。]+)。/.exec(S11)||[])[1]||''; return {old:q[0]||null,now:q[1]||null,terms:t.split('、').map(x=>TERMZH[x]).filter(Boolean)}; })();
/* 1-2：招呼的表、每一題（選項、周的兩句、筆記）*/
const D12=(()=>{ const out={greet:[],qs:[]}; let cur=null, inTable=false;
  for(const raw of lines(S12)){ const l=raw.trim();
    if(/^\|/.test(l)){ const c=l.split('|').map(x=>x.trim()); if(c[1]&&!/^-+$/.test(c[1])&&c[1]!=='條件') out.greet.push(c[2]); continue; }
    let m=/^- 選項：(「[^」]+」)/.exec(l); if(m){ cur={opt:m[1],say:[],note:null}; out.qs.push(cur); continue; }
    m=/^- 周：「(.+)」$/.exec(l); if(m&&cur){ cur.say.push(m[1]); continue; }
    m=/筆記 `([a-z0-9_]+)`，標題「([^」]+)」(?:，內容「([^」]+)」)?/.exec(l); if(m&&cur){ cur.note={id:m[1],title:m[2],body:m[3]||null}; } }
  return out; })();
/* 1-3：「> 周：…」、三個選項與回答 */
const D13=(()=>{ const q=[], opts=[]; for(const raw of lines(S13)){ const l=raw.trim(); let m=/^>\s*周：(.+)$/.exec(l); if(m){ q.push(m[1].trim()); continue; } m=/^- (「[^」]+」)→ 周：「(.+)」$/.exec(l); if(m) opts.push({o:m[1],r:m[2]}); } return {q,opts}; })();
/* 第 2 節：自我介紹的表、之後的招呼、題目的表、旁白 */
const D2=(()=>{ const intro={}, greet={}, qrows=[]; let narr=null; const YN={'大一':1,'大二':2,'大三':3,'大四':4};
  const iS=S2.slice(S2.indexOf('**第一次見面的自我介紹**'),S2.indexOf('**之後的招呼**')), gS=(/\*\*之後的招呼\*\*：(.+)/.exec(S2)||[])[1]||'', qS=S2.slice(S2.indexOf('**問題**'));
  for(const raw of lines(iS)){ const c=raw.split('|').map(x=>x.trim()); if(c.length<4||!/^大/.test(c[1])) continue; const t=c[2].replace(/（現有）$/,''); for(const y of c[1].split('、')) if(YN[y]) intro[YN[y]]=t; }
  for(const m of gS.matchAll(/(大[一二三四])「([^」]+)」/g)) greet[YN[m[1]]]=m[2];
  for(const raw of lines(qS)){ const c=raw.split('|').map(x=>x.trim()); if(c.length<5||!YN[c[1]]) continue; const o=qs(c[2])[0]; if(!o) continue; const say=c[3].split('／').map(x=>x.replace(/（有 `[^）]*）$/,'').trim()); qrows.push({y:YN[c[1]],opt:'「'+o+'」',say,cond:c[2].replace(/「[^」]*」/,'').trim(),note:c[3]}); }
  narr=(/旁白：「(（[^」]+）)」/.exec(qS)||[])[1]||null;
  return {intro,greet,qrows,narr}; })();
const XU_NO_GSD=(()=>{ const r=D2.qrows.find(q=>/研究所/.test(q.opt)); if(!r||!r.say[1]) return null; const i=r.say[1].indexOf('哪堂課'); return i<0?null:r.say[1].slice(i); })();   /* 「沒有的從『哪堂課』開始」*/
/* 第 3 節 */
const D31=(()=>{ const open=[]; for(const raw of lines(S31)){ const m=/^\s+[1-4]\.\s*(.+)$/.exec(raw); if(m) open.push(m[1].replace(/（現有）$/,'').trim()); }
  const first=(/第一次：「([^」]+)」/.exec(S31)||[])[1]||null, later=(/之後：「([^」]+)」/.exec(S31)||[])[1]||null; return {open,first,later}; })();
const D32=(()=>{ const q=[], last=[]; for(const raw of lines(S32)){ const l=raw.trim(); let m=/^>\s*林：(.+)$/.exec(l); if(m){ q.push(m[1].trim()); continue; } m=/^[1-3]\.\s*林：(.+)$/.exec(l); if(m) last.push(m[1].trim()); }
  const lg=/\{legal:\{context:'([a-z]+)',by:'([a-z_]+)',pick:\{prefer:'([a-z]+)'\},quiet:(true|false)\}\}/.exec(S32);
  const nod=(/旁白一句：「(（[^」]+）)」/.exec(S32)||[])[1]||null; const tm=/週二 (\d+):(\d+)～(\d+):(\d+)，冷卻 (\d+) 天，最多(三)次/.exec(S32);
  return {q,last,legal:lg?{context:lg[1],by:lg[2],pick:{prefer:lg[3]},quiet:lg[4]==='true'}:null,nod,win:tm?[+tm[1]+tm[2]/60,+tm[3]+tm[4]/60]:null,cool:tm?+tm[5]:null}; })();
const D4=(()=>{ const l=lines(S4).find(x=>x.includes('→'))||''; const q=qs(l); return {old:q[0]||null,now:q[1]||null}; })();
/* 第 8 節（f36dfe3cf）：1 許教授的時間；2 交往中那一題（選項、許的兩句）；3 talkProf 那兩句（稿上的引文）；4 1-3 的提示那一句、第幾週 */
const S8=part('## 8.','## 9.');
const D8=(()=>{ const it=n=>{ const a=S8.indexOf('\n'+n+'. **'), b=S8.indexOf('\n'+(n+1)+'. **',a+1); return a<0?'':S8.slice(a,b<0?S8.length:b); };
  const p1=it(1), p2=it(2), p3=it(3), p4=it(4), tm=/每週一 (\d+):(\d+)～(\d+):(\d+)/.exec(p1), op=(/選項：「([^」]+)」/.exec(p2)||[])[1]||null, tw=/第 (\d+) 週專題課/.exec(p4), wk=/第 (\d+)～(\d+) 週/.exec(p4), tt=/那天 (\d+):(\d+)～(\d+):(\d+)/.exec(p4);
  return {win:tm?[+tm[1]+tm[2]/60,+tm[3]+tm[4]/60]:null, cool:(/冷卻照舊 (\d+) 天/.exec(p1)||[])[1]|0, opt:op?'「'+op+'」':null, xu:[...p2.matchAll(/許：「([^」]+)」/g)].map(m=>m[1]),
    w1:[...p3.matchAll(/「([^」]+)」/g)].map(m=>m[1]), call:((/>\s*周：(.+)/.exec(p4)||[])[1]||'').trim()||null, week:tw?+tw[1]:null, later:wk?[+wk[1],+wk[2]]:null, time:tt?[+tt[1]+tt[2]/60,+tt[3]+tt[4]/60]:null}; })();
/* 第 9 節（a3ea3918e）：1 第一週那兩句先說（答得好、沒讀的引文；研究室從下一個週四開始）；2 大四下換的那一句、不再說的那一句 */
const S9=part('## 9.',null);
const D9=(()=>{ const it=n=>{ const a=S9.indexOf('\n'+n+'. **'), b=S9.indexOf('\n'+(n+1)+'. **',a+1); return a<0?'':S9.slice(a,b<0?S9.length:b); }; const p1=it(1), p2=it(2);
  return {good:(/答得好：「([^」]+)」/.exec(p1)||[])[1]||null, none:(/沒讀：「([^」]+)」/.exec(p1)||[])[1]||null, next:/研究室事件從下一次（下一個週四）開始/.test(p1),
    term:TERMZH[(/\*\*(大[一二三四][上下])換一句\*\*/.exec(p2)||[])[1]]||null, y4:((/>\s*周：(.+)/.exec(p2)||[])[1]||'').trim()||null, not:(/不說「([^」]+)」/.exec(p2)||[])[1]||null}; })();

/* ---------- 小工具 ---------- */
const keyOf=d=>CALENDAR.dateOf(d).key, TD=(t,w,wd)=>STORY.termDay(t,w,wd);   /* wd：1＝週一 … 7＝週日 */
const fresh=(d,h,zone,flags)=>{ const G=H.fresh(typeof d==='number'?keyOf(d):d,h,zone||'wancai',Object.assign({introDone:true,afternoonDone:true,classDone:true},flags||{})); G.notes=[]; asks.length=0; E.player.busy=false; return G; };
const at=(d,h)=>H.at(typeof d==='number'?keyOf(d):d,h);
const ok=(id,ctx)=>{ const e=ev(id); return !!e&&EVENTS.check(e,ctx); };
const run=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const e=ev(id); if(!e) return ['（沒有事件 '+id+'）']; await EVENTS.run(e); return H.said.map(s=>s.t); };   /* 修改前沒有的事件：每一項照樣算 FAIL，不在中途丟例外 */
const said=()=>H.said.map(s=>s.t), U=a=>a.map(unq);
const noteOf=id=>(H.G.notes||[]).find(n=>n.id===id)||null;
const settle=async()=>{ for(let i=0;i<200&&(EVENTS.running||(GM.D&&GM.D.busyDepth>0));i++) await new Promise(r=>setTimeout(r,0)); await new Promise(r=>setTimeout(r,0)); };
/* 走進萬才館（STORY.populate，和 tests/aa130_curriculum_unit.js 同一套假的 GM）：回傳在場的人＋說話的入口 */
const enter=(zone)=>{ const G=H.G; G.zone=zone; G.social=G.social||{}; G.goal='';
  E.npcs=[]; E.zone={seats:[],spawn:{x:0,z:6.6,lv:0}}; E.levels=null; E.indoor=true; E.addNPC=n=>{ E.npcs.push(n); return n; }; E.canStand=()=>true; E.interactables=[];
  const talks={}; GM.npc={};
  GM.spawnCharacter=(id,x,z,o)=>{ const ob=mkObj(); ob.position.set(x,0,z); const n={obj:ob,id,charId:id,beh:'idle',pose:(o||{}).pose,lv:0}; E.npcs.push(n); GM.npc[id]=n; talks[id]=(o&&o.talk)||(nn=>STORY.talkCharacter(id,nn)); return n; };
  GM.spawnNPC=(id,spec,x,z,o)=>{ const n=GM.spawnCharacter(id,x,z,o); talks[id]=o&&o.talk; return n; }; GM.removeNPC=id=>{ delete GM.npc[id]; }; GM.spawnExtra=()=>{}; GM.spawnRider=()=>{}; GM.knownIds=()=>[];
  STORY.populate(zone,GM); return {ids:Object.keys(GM.npc),talk:async id=>{ H.said=[]; H.opts=[]; const f=talks[id]; if(!f) return false; await f(GM.npc[id]); await settle(); return true; }}; };

(async()=>{
/* ======================= 0 讀稿、白名單、逐字 ======================= */
await sec('0',async()=>{
  check('0. 讀得到稿（git show '+SHA+'）：第 1～9 節都在',!!DOC&&['## 1. 周教授','### 1-3','## 2. 許教授','### 3-2','## 4. ','## 7. 給 LAWWW','## 8. 實作時定的','## 9. 實作時定的'].every(s=>DOC.includes(s)),DOC?'':'讀不到：沒有 .git 時設 AA522_DOCREPO');
  check('0. 讀稿第 8 節：許教授週一的時間與冷卻、交往中那一題（選項＋兩句）、talkProf 三句引文、1-3 的提示（第幾週、那天的時段、之後第幾週）',J(D8.win)===J([14,16])&&D8.cool===3&&!!D8.opt&&D8.xu.length===2&&D8.w1.length===3&&D8.call==='{name}，下課來研究室一趟。'&&D8.week===10&&J(D8.later)===J([11,13])&&J(D8.time)===J([15.2,16.5]),J(D8));
  check('0. 讀稿：1-2 五題、招呼四列、1-3 三個選項、許教授四列自我介紹、四句招呼、五題、林教授四種開頭、三句收尾',D12.qs.length===5&&D12.greet.length===4&&D13.opts.length===3&&Object.keys(D2.intro).length===4&&Object.keys(D2.greet).length===4&&D2.qrows.length===5&&D31.open.length===4&&D32.last.length===3,J({q:D12.qs.length,g:D12.greet.length,o13:D13.opts.length,in:Object.keys(D2.intro).length,gr:Object.keys(D2.greet).length,x:D2.qrows.length,o:D31.open.length,l:D32.last.length}));
  const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')), hit=(A.files||[]).filter(e=>e.path===DOCF);
  check('0. 劇情匯入白名單：'+DOCF+' @'+SHA+'、approved、approvedBy、task NPC-STORY2-1028（只有一筆）',hit.length===1&&String(hit[0].sha).startsWith(SHA)&&hit[0].status==='approved'&&!!hit[0].approvedBy&&hit[0].task==='NPC-STORY2-1028',J(hit.map(e=>[e.sha,e.status,e.task])));
  const IDS=['ev_prof_zhou_office','ev_prof_xu_office','ev_prof_lin_after','ev_prof_lin_office','ev_prof_lin_nod','ev_prof_zhou_y4_call'];
  check('0. 六個事件都在、id 不重複（新事件 ev_prof_lin_office；大四上的旁白 ev_prof_lin_nod；第 8 節第 4 點 1-3 的提示 ev_prof_zhou_y4_call）',IDS.every(id=>STORY_EVENTS.filter(e=>e.id===id).length===1),J(IDS.map(id=>STORY_EVENTS.filter(e=>e.id===id).length)));
  /* 遊戲的句子：六個事件的每一句、每個選項；閒聊兩位 */
  const GAME=[], OPTS=[]; for(const id of IDS){ const e=ev(id); if(!e) continue; for(const l of e.dialogue||[]){ if(l.text!==undefined) GAME.push(unq(l.text)); if(l.choice) for(const c of l.choice) OPTS.push(c.text); } }
  const ST=[].concat(SMALLTALK.prof_zhou||[],SMALLTALK.prof_chen||[]).map(e=>unq(typeof e==='string'?e:e.t));
  const NOTES=[]; for(const e of [ev('ev_prof_zhou_office')].filter(Boolean)) for(const l of e.dialogue) if(l.choice) for(const c of l.choice) if(c.consequences&&c.consequences.note) NOTES.push(c.consequences.note);
  /* 稿 → 遊戲 */
  const want=[].concat(D12.greet,...D12.qs.map(q=>q.say),D13.q,D13.opts.map(o=>o.r),Object.values(D2.intro),Object.values(D2.greet),...D2.qrows.map(r=>r.say),[XU_NO_GSD,D2.narr],D31.open,[D31.first,D31.later],D32.q,D32.last,[D32.nod],D8.xu,[D8.call]).filter(x=>x!=null);
  const wantOpt=[].concat(D12.qs.map(q=>q.opt),D13.opts.map(o=>o.o),D2.qrows.map(r=>r.opt),[D8.opt]).filter(x=>x!=null);
  const miss=want.filter(t=>!GAME.includes(t)), missO=wantOpt.filter(o=>!OPTS.includes(o));
  check('0. 稿 → 遊戲：每一句（'+want.length+' 句）都在六個事件裡（逐字）',want.length>=50&&!miss.length,miss.join(' / '));
  check('0. 稿 → 遊戲：每個選項（'+wantOpt.length+' 個）逐字（第 8 節交往中那一題也是）',wantOpt.length===14&&!missO.length,missO.join(' / '));
  check('0. 稿 → 遊戲：閒聊（1-1 周教授、第 4 節陳教授）換成新句',!!D11.now&&!!D4.now&&ST.includes(D11.now)&&ST.includes(D4.now),J(ST));
  const nWant=D12.qs.map(q=>q.note).filter(Boolean), nBad=nWant.filter(n=>{ const g=NOTES.find(x=>x.id===n.id); return !g||g.title!==n.title||(n.body&&g.body!==n.body); });
  check('0. 稿 → 遊戲：筆記五則（id、標題逐字；zhou_169 內文逐字）',nWant.length===5&&!nBad.length,J(nBad));
  /* 遊戲 → 稿：稿上有，或是修改前就有的「現有」句 */
  const EXIST=['好問題。看他有沒有『合理注意的可能』。網頁掛三天沒改，跟掛三分鐘，不一樣。','一年級不用讀太多。一本，讀三遍。','讀一個問題讀兩年。大部分人以為是讀更多條文，其實是讀更少、讀更深。','你才一年級。先把民總讀好——但如果哪堂課讓你下課還在想，記得那是什麼課。','先不要讀教科書以外的東西。真的要讀，就讀『怎麼問問題』的書。','很多人第一年都以為刑訴只是抓壞人。等你看過一個無罪判決，就會懂。'];
  const EXIST_O=['「老師，錯誤的『無過失』要怎麼判斷？」','「老師推薦一本書？」','「沒事。」','「老師，法研所是在做什麼的？」','「老師推薦一本一年級可以讀的書嗎？」','「沒事，路過。」'];
  const extra=GAME.filter(t=>!want.includes(t)&&!EXIST.includes(t)), extraO=OPTS.filter(o=>!wantOpt.includes(o)&&!EXIST_O.includes(o));
  check('0. 遊戲 → 稿：六個事件的每一句都在稿上或是「現有」句（'+GAME.length+' 句）',GAME.length>=50&&!extra.length,extra.join(' / '));
  check('0. 遊戲 → 稿：每個選項都在稿上或是「現有」選項（'+OPTS.length+' 個）',!extraO.length,extraO.join(' / '));
  let base=''; try{ base=git('show '+BASE+':src/data/events.js'); }catch(e){ base=''; }
  const notBase=[...EXIST.map(t=>[t,['「'+t+'」',t]]),...EXIST_O.map(o=>[o,[o]])].filter(([t,v])=>!v.some(x=>base.includes("text:'"+x+"'"))).map(x=>x[0]);
  check('0. 「現有」的句子、選項在修改前（'+BASE+'）的 events.js 就有，一字不差',!!base&&!notBase.length,base?notBase.join(' / '):'讀不到修改前的 events.js');
  const src=fs.readFileSync(path.join(H.ROOT,'src/data/events.js'),'utf8'), st=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
  check('0. 換掉的舊句不在遊戲裡（週三下午我都在、有興趣可以來研究室聊）',!!D11.old&&!!D4.old&&!src.includes(D11.old)&&!st.includes(D11.old)&&!src.includes(D4.old),J([D11.old,D4.old]));
  const bg=typeof OUT!=='undefined'&&OUT.bg?OUT.bg('prof_door'):null, z=ev('ev_prof_zhou_office'), lo=ev('ev_prof_lin_office');
  check('0. 第 7 節：周教授、林教授研究室的 2D 背景共用 prof_door（研究室門口的圖）',!!bg&&!!bg.image&&!!z&&!!lo&&J(z.background)===J(bg)&&J(lo.background)===J(bg)&&fs.existsSync(path.join(H.ROOT,bg.image)),J([z&&z.background,lo&&lo.background,bg]));
});

/* ======================= 1 周教授 ======================= */
await sec('1-1',async()=>{
  const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'], NOW='「'+D11.now+'」', WX='（周教授跟你打了個招呼，聊了兩句天氣。）';
  /* 第 9 節第 2 點改了下面三項的期待值（照新稿，檢查留著）：原本四個學期都說「週四下課以後我都在」（SMALLTALK 一筆）→ 大四下換「大四了……」（SMALLTALK 兩筆，學期合起來照舊是那四個學期）*/
  const Y4L='「'+D9.y4+'」', ZST=SMALLTALK.prof_zhou||[], ZTH=ZST.find(e=>e&&typeof e==='object'&&unq(e.t)===D11.now)||null, ZY4=ZST.find(e=>e&&typeof e==='object'&&unq(e.t)===D9.y4)||null;
  check('1-1. 稿上的學期＝大一上、大一下、大二上、大四下（STORY.ZHOU_TALK_TERMS 同一份）；SMALLTALK 兩筆：「週四下課以後」大一上、大一下、大二上，大四下換第 9 節第 2 點那一句（兩筆的學期合起來＝那四個學期）',
    J(D11.terms)===J(['Y1S1','Y1S2','Y2S1','Y4S2'])&&D9.term==='Y4S2'&&!!D9.y4&&J(STORY.ZHOU_TALK_TERMS)===J(D11.terms)&&ZST.length===2&&!!ZTH&&J(ZTH.term)===J(D11.terms.filter(t=>t!==D9.term))&&!!ZY4&&J(ZY4.term)===J([D9.term]),J([D11.terms,D9.term,ZST,STORY.ZHOU_TALK_TERMS]));
  const out=TERMS.map(t=>{ fresh(TD(t,5,3),12,'campus'); const r=STORY.smallTalk(H.G,'prof_zhou'); return [t,r.say||r.narr]; });
  check('1-1. 閒聊（照作息遇到他）：大一上、大一下、大二上說「週四下課以後我都在」，大四下說「'+D9.y4+'」（第 9 節第 2 點），其他學期聊兩句天氣',!!D9.y4&&out.every(([t,s])=>t===D9.term?s===Y4L:(D11.terms.includes(t)?s===NOW:s===WX)),J(out));
  fresh('2026-07-15',12,'campus'); const sm=STORY.smallTalk(H.G,'prof_zhou');
  check('1-1. 暑假（不在學期裡）：聊兩句天氣',sm.narr===WX,J(sm));
  /* 週四 15:12～16:12 萬才館的周教授（talkProf）：事件不觸發時的那一句 */
  const tp=async(t,setup)=>{ fresh(TD(t,5,4),15.5,'wancai'); if(setup) setup(H.G); const r=enter('wancai'); if(!r.ids.includes('prof')) return ['不在']; await r.talk('prof'); return said(); };
  const done3=G=>{ G.flags.ZHOU_ASKED={Y1S1:['q88','book','agency'],Y1S2:['offer','gestio'],Y2S1:['types','prescr']}; };
  const a=await tp('Y1S1',done3), b=await tp('Y2S2'), c=await tp('Y3S1'), d=await tp('Y4S2'), e=await tp('Y4S1');
  check('1-1. 週四萬才館的他（talkProf）：大一上（題目都問過了）說「有問題可以來研究室。週四下課以後我都在。」；大四下說「'+D9.y4+'」（第 9 節第 2 點：不邀研究室）',!!D9.y4&&J(a)===J([D11.now])&&J(d)===J([D9.y4]),J([a,d]));
  check('1-1. 週四萬才館的他：大二下、大三上、大四上聊兩句天氣',[b,c,e].every(x=>J(x)===J([WX])),J([b,c,e]));
});

await sec('1-2',async()=>{
  const Z='ev_prof_zhou_office', G0=D12.greet, Q=D12.qs, opt=k=>Q[k].opt;
  const T1=TD('Y1S1',4,4);
  fresh(T1,15.5); const w=[ok(Z)]; at(T1,15.1); w.push(ok(Z)); at(T1,16.5); w.push(ok(Z)); at(T1-1,15.5); w.push(ok(Z)); at(T1,15.5); H.G.zone='campus'; w.push(ok(Z));
  check('1-2. 時間地點不改：萬才館週四 15:12～16:30（15:06、16:30、週三、校園都不演）；冷卻 6 天',J(w)===J([true,false,false,false,false])&&ev(Z).cooldown_days===6&&ev(Z).location==='wancai',J(w));
  fresh(T1,15.5); const s1=await run(Z,[opt(0)]); const o1=H.opts[0];
  check('1-2. 大一上第一次：招呼「有問題就問。沒問題就回去讀。」（其他）；選項＝無過失、推薦書、越權代理（新）、沒事',J(U([s1[0]]))===J([G0[3]])&&J(o1)===J(['「老師，錯誤的『無過失』要怎麼判斷？」','「老師推薦一本書？」',opt(0),'「沒事。」']),J([s1[0],o1]));
  check('1-2. 越權代理：周教授兩句逐字、筆記 zhou_169（標題、內文照稿）、ZHOU_ASKED.Y1S1、教授紀錄 office +2',J(s1.slice(1))===J(Q[0].say)&&!!noteOf('zhou_169')&&noteOf('zhou_169').title===Q[0].note.title&&noteOf('zhou_169').body===Q[0].note.body&&J(H.G.flags.ZHOU_ASKED)===J({Y1S1:['agency']})&&SOCIAL.prof('prof_zhou').office===2,J([s1,H.G.flags.ZHOU_ASKED,SOCIAL.prof('prof_zhou').office]));
  at(T1+1,15.5); H.G.weekday=4; const c1=ok(Z); at(T1+7,15.5); const c7=ok(Z);
  check('1-2. 冷卻：隔天（就算是週四）不演；下週四照常',c1===false&&c7===true,J([c1,c7]));
  await run(Z,['無過失']); const o2=H.opts[0]; const s2=said();
  check('1-2. 問過的不再出：第二次的選項＝無過失、推薦書、沒事（越權代理問過了）；無過失照舊（筆記 zhou_88）、記進 ZHOU_ASKED',J(o2)===J(['「老師，錯誤的『無過失』要怎麼判斷？」','「老師推薦一本書？」','「沒事。」'])&&!!noteOf('zhou_88')&&s2.includes('「好問題。看他有沒有『合理注意的可能』。網頁掛三天沒改，跟掛三分鐘，不一樣。」')&&J(H.G.flags.ZHOU_ASKED)===J({Y1S1:['agency','q88']}),J([o2,s2,H.G.flags.ZHOU_ASKED]));
  at(T1+14,15.5); await run(Z,['推薦書']); const o3=H.opts[0];
  at(T1+21,15.5); const c21=ok(Z);
  check('1-2. 大一上三題都問過＝不再觸發（不留只剩「沒事。」）；第三次的選項只剩推薦書、沒事',J(o3)===J(['「老師推薦一本書？」','「沒事。」'])&&c21===false&&J(H.G.flags.ZHOU_ASKED.Y1S1.slice().sort())===J(['agency','book','q88']),J([o3,c21,H.G.flags.ZHOU_ASKED]));
  fresh(T1,15.5,'wancai',{classAnswerPlus:true}); const sp=await run(Z,['沒事']);
  check('1-2. classAnswerPlus：招呼「你上次答得不錯。有問題？」（一次一句）',J(U(sp))===J([G0[0]]),J(sp));
  /* 大一下：第一次「債總了」、第二次「有問題就問」；兩題，推薦書沒有 */
  const T2=TD('Y1S2',4,4); fresh(T2,15.5); H.G.events.last[Z]=T1; H.G.events.done[Z]=1;   /* 大一上來過 */
  const y2=await run(Z,['價目表']); const yo=H.opts[0];
  check('1-2. 大一下這學期第一次：招呼「債總了。民總讀完了嗎？」；選項＝價目表、幫室友繳電費、沒事（沒有推薦書、大一上的題）',J(U([y2[0]]))===J([G0[1]])&&J(yo)===J([opt(1),opt(2),'「沒事。」']),J([y2[0],yo]));
  check('1-2. 價目表：兩句逐字、筆記 zhou_154「周教授：價目表」',J(y2.slice(1))===J(Q[1].say)&&!!noteOf('zhou_154')&&noteOf('zhou_154').title===Q[1].note.title,J(y2));
  at(T2+7,15.5); const y3=await run(Z,['電費']); const yo3=H.opts[0];
  check('1-2. 大一下第二次：招呼回到「有問題就問。沒問題就回去讀。」；只剩幫室友繳電費；兩句逐字、筆記 zhou_176',J(U([y3[0]]))===J([G0[3]])&&J(yo3)===J([opt(2),'「沒事。」'])&&J(y3.slice(1))===J(Q[2].say)&&!!noteOf('zhou_176')&&noteOf('zhou_176').title===Q[2].note.title,J([y3,yo3]));
  at(T2+14,15.5); const y4=ok(Z);
  check('1-2. 大一下兩題都問過＝不再觸發',y4===false&&J(H.G.flags.ZHOU_ASKED.Y1S2)===J(['offer','gestio']),J([y4,H.G.flags.ZHOU_ASKED]));
  fresh(T2,15.5); const n1=await run(Z,['沒事']); at(T2+7,15.5); const n2=await run(Z,['沒事']);
  check('1-2. 「沒事。」也算這學期來過：下一次的招呼不是「債總了」；題目還在',J(U(n1))===J([G0[1]])&&J(U(n2))===J([G0[3]])&&ok(Z)===false&&(at(T2+14,15.5),ok(Z))===true,J([n1,n2]));
  fresh(T2,15.5,'wancai',{classAnswerPlus:true}); const pp=await run(Z,['沒事']);
  check('1-2. 大一下第一次但有 classAnswerPlus：照表上面的先＝「你上次答得不錯。有問題？」',J(U(pp))===J([G0[0]]),J(pp));
  /* 大二上 */
  const T3=TD('Y2S1',4,4); fresh(T3,15.5); const z1=await run(Z,['幾種']); const zo=H.opts[0]; at(T3+7,15.5); const z2=await run(Z,['十幾年']); at(T3+14,15.5); const z3=ok(Z);
  check('1-2. 大二上第一次：「債總二上完，你們大四才會再遇到我。有問題？」；選項＝債務不履行、借錢十幾年、沒事',J(U([z1[0]]))===J([G0[2]])&&J(zo)===J([opt(3),opt(4),'「沒事。」']),J([z1[0],zo]));
  check('1-2. 大二上兩題逐字、筆記 zhou_types、zhou_125；第二次招呼「有問題就問」；問完不觸發',J(z1.slice(1))===J(Q[3].say)&&J(U([z2[0]]))===J([G0[3]])&&J(z2.slice(1))===J(Q[4].say)&&!!noteOf('zhou_types')&&noteOf('zhou_types').title===Q[3].note.title&&!!noteOf('zhou_125')&&noteOf('zhou_125').title===Q[4].note.title&&z3===false,J([z1,z2,z3]));
  const off=['Y2S2','Y3S1','Y3S2','Y4S1'].map(t=>{ fresh(TD(t,5,4),15.5); return [t,ok(Z)]; });
  check('1-2. 大二下、大三上、大三下、大四上的週四不演（AA_376 #19：大三上不演照舊）',off.every(x=>x[1]===false),J(off));
  /* 法律：新五題 LEGAL_REVIEW_REQUIRED、沒有條號 */
  const src=fs.readFileSync(path.join(H.ROOT,'src/data/events.js'),'utf8'), lab=['agency','offer','gestio','types','prescr'];
  const lr=lab.filter(k=>!new RegExp("LEGAL_REVIEW_REQUIRED[^\\n]*\\n\\s*\\{label:'"+k+"'\\}").test(src));
  check('1-2. 新的民法五題（表見代理、價目表、無因管理、債務不履行、時效）各標 LEGAL_REVIEW_REQUIRED',!lr.length,lr.join('、'));
  const art=Q.flatMap(q=>q.say).filter(t=>/第[0-9０-９一二三四五六七八九十百]+條/.test(t));
  check('1-2. 新五題的台詞沒有條號、判決字號',!art.length,art.join(' / '));
});

await sec('1-3',async()=>{
  const Z='ev_prof_zhou_office', D=TD('Y4S2',11,1);
  check('1-3. 第 10 週週一 2029-04-23 是專題「回顧大一的案例」（週一下午一）；第 11 週週一是 2029-04-30',keyOf(D)==='2029-04-30'&&keyOf(TD('Y4S2',10,1))==='2029-04-23'&&(COURSES.list.find(c=>c.id==='legal_research').specials||[]).some(s=>s.w===10&&/回顧大一的案例/.test(s.title))&&J(COURSES.list.find(c=>c.id==='legal_research').slots)===J([{wd:1,block:'pm1'}]),keyOf(D));
  /* 第 8 節第 4 點改了這一項的期待值：原本「只有第 11 週週一」→ 第 10 週那天＋第 11～13 週的週一（詳細在 8-4）*/
  const w=[]; for(const [d,h] of [[D,15.5],[TD('Y4S2',10,1),15.5],[TD('Y4S2',12,1),15.5],[TD('Y4S2',11,4),15.5],[D,14.9],[D,16.5]]){ fresh(d,h); w.push(ok(Z)); }
  check('1-3. （第 8 節第 4 點）第 10～13 週週一的 15:12～16:30 演（第 10、11、12 週的週一都演；同一週的週四、上課中、16:30 不演）',J(w)===J([true,true,true,false,false,false]),J(w));
  const r={}; for(const [k,o] of D13.opts.entries()){ fresh(D,15.5); H.G.notes=[{id:'zhou_88'},{id:'zhou_book'}]; r[k]=await run(Z,[o.o]); r['o'+k]=H.opts[0]; }
  const want=k=>[D13.q[0],D13.q[1],D13.opts[k].r,D13.q[3],D13.q[4]];
  check('1-3. 有 zhou_88：（翻大綱）→「你大一問過我…現在你會怎麼答？」→ 三個選項逐字',J(r.o0)===J(D13.opts.map(o=>o.o)),J(r.o0));
  check('1-3. 三個選項各自的回答，兩種都接最後兩句（逐字、順序照稿）',[0,1,2].every(k=>J(r[k])===J(want(k))),J([r[0],r[1],r[2]]));
  fresh(D,15.5); const none=await run(Z); const noOpt=H.opts.length;
  check('1-3. 一則 zhou_* 筆記都沒有：（翻大綱）→「四年了，你才來我研究室。」→ 最後兩句；沒有選項',J(none)===J([D13.q[0],D13.q[2],D13.q[3],D13.q[4]])&&noOpt===0,J(none));
  fresh(D,15.5); H.G.notes=[{id:'zhou_154'}]; const other=await run(Z);
  check('1-3. 有別的 zhou_* 筆記、沒有 zhou_88：兩種的第一句都不說，直接接最後兩句',J(other)===J([D13.q[0],D13.q[3],D13.q[4]]),J(other));
  const memL=(/記 `mem\('ZHOU_Y4'\)`：([^。\n]+)。/.exec(S13)||[])[1]||null;
  check('1-3. 記 mem ZHOU_Y4；人物面板的名稱＝稿上那一句「'+memL+'」（social3d.js MEMORY_LABEL，備註不重複）；一次（之後不再演）',!!memL&&SOCIAL.has('prof_zhou','ZHOU_Y4')&&!!SOCIAL.MEMORY_LABEL&&SOCIAL.MEMORY_LABEL.ZHOU_Y4===memL&&SOCIAL.describe('prof_zhou').includes(memL)&&!SOCIAL.describe('prof_zhou').includes(memL+'（')&&J(H.G.flags.ZHOU_ASKED)===J({Y4S2:['y4']})&&(at(D+7,15.5),ok(Z))===false,J([H.G.flags.ZHOU_ASKED,SOCIAL.describe('prof_zhou')]));
  fresh(D,15.5); const r2=enter('wancai'); const t2=r2.ids.includes('prof_zhou')&&await r2.talk('prof_zhou'); const s2=said();
  check('1-3. 那天專題下課後他照課表在萬才館，走過去和他說話就是這一場',r2.ids.includes('prof_zhou')&&t2&&s2[0]===D13.q[0]&&s2.includes(D13.q[3]),J([r2.ids,s2]));
});

/* ======================= 2 許教授 ======================= */
await sec('2',async()=>{
  const X='ev_prof_xu_office', YD={1:TD('Y1S1',6,3),2:TD('Y2S1',6,3),3:TD('Y3S1',6,3),4:TD('Y4S1',6,3)};
  const met=()=>SOCIAL.remember('prof_xu','FIRST_MET','');
  check('2. 地點、冷卻照舊（萬才館，3 天）',ev(X).location==='wancai'&&ev(X).cooldown_days===3&&!ev(X).weekday&&!ev(X).time);
  const intro=[1,2,3,4].map(y=>{ fresh(YD[y],13); return [y,SOCIAL.playerYear()]; });
  check('2. 年級：大一上～大四上的日子＝1～4',intro.every(([y,p])=>y===p),J(intro));
  const fi={}; for(const y of [1,2,3,4]){ fresh(YD[y],13); const s=await run(X,['沒事']); fi[y]=s; }
  check('2. 第一次見面的自我介紹照年級（大一、大二、大三、大四各一句，逐字）',[1,2,3,4].every(y=>J(fi[y])===J([D2.intro[y]])),J(fi));
  check('2. 大一以外不說「一年級的？」',[2,3,4].every(y=>!fi[y].some(t=>/一年級的？/.test(t))));
  const gr={}; for(const y of [1,2,3,4]){ fresh(YD[y],13); met(); gr[y]=await run(X,['沒事']); }
  check('2. 之後的招呼照年級（逐字）',[1,2,3,4].every(y=>J(gr[y])===J([D2.greet[y]])),J(gr));
  const rows=y=>D2.qrows.filter(r=>r.y===y);
  const ops={}; for(const y of [1,2,3,4]){ fresh(YD[y],13); met(); if(y===3) SOCIAL.remember('heroine_05','FIRST_MET',''); await run(X,['沒事']); ops[y]=H.opts[0]; }
  check('2. 題目照年級：大一＝法研所、推薦書（現有）；大二、大三、大四＝稿上的題（逐字）；都有「沒事，路過。」',J(ops[1])===J(['「老師，法研所是在做什麼的？」','「老師推薦一本一年級可以讀的書嗎？」','「沒事，路過。」'])&&[2,3,4].every(y=>J(ops[y])===J(rows(y).map(r=>r.opt).concat(['「沒事，路過。」']))),J(ops));
  fresh(YD[3],13); met(); await run(X,['沒事']); const noSis=H.opts[0];
  check('2. 大三的學姊那題：不認識學姊沒有',J(noSis)===J([rows(3)[0].opt,'「沒事，路過。」']),J(noSis));
  /* 每一題的回答 */
  const ans={}; for(const r of D2.qrows){ fresh(YD[r.y],13); met(); SOCIAL.remember('heroine_05','FIRST_MET',''); SOCIAL.remember('prof_xu','GRAD_SCHOOL_DISCUSSION',''); const s=await run(X,[r.opt]); ans[r.opt]=s.slice(1); }
  const r3=rows(3)[0];
  check('2. 大二、大三學姊、大四的題：許教授的兩句逐字（「／」分開的兩句）',D2.qrows.filter(r=>r!==r3).every(r=>J(ans[r.opt])===J(r.say)),J(ans));
  check('2. 大三研究所（有 GRAD_SCHOOL_DISCUSSION）：「想，但不要急著決定。」→「你大一來的時候，我說過：…現在是哪一門？」→ 旁白，沒有選項',J(ans[r3.opt])===J([r3.say[0],r3.say[1],D2.narr]),J(ans[r3.opt]));
  fresh(YD[3],13); met(); const ng=await run(X,[r3.opt]); const ngOpt=H.opts.length;
  check('2. 大三研究所（沒有 GRAD_SCHOOL_DISCUSSION）：從「哪堂課」開始',!!XU_NO_GSD&&J(ng.slice(1))===J([r3.say[0],XU_NO_GSD,D2.narr])&&ngOpt===1,J(ng));
  /* 每題一次、那一年問完不觸發、下一年有新的 */
  fresh(YD[2],13); met(); await run(X,[rows(2)[0].opt]); at(YD[2]+3,13); await run(X,['沒事']); const o2=H.opts[0]; at(YD[2]+6,13); await run(X,[rows(2)[1].opt]); at(YD[2]+9,13); const c2=ok(X);
  const nextY=TD('Y3S1',2,3); at(nextY,13); const c3=ok(X);
  check('2. 大二：問過的不再出；兩題都問過＝不觸發；大三有新的（XU_ASKED 照年級記）',J(o2)===J([rows(2)[1].opt,'「沒事，路過。」'])&&c2===false&&c3===true&&J(H.G.flags.XU_ASKED)===J({2:['germany','long']}),J([o2,c2,c3,H.G.flags.XU_ASKED]));
  at(nextY,13); await run(X,[r3.opt]); at(nextY+3,13); const c4=ok(X); SOCIAL.remember('heroine_05','FIRST_MET',''); const c5=ok(X);
  check('2. 大三不認識學姊：研究所那題問過就不觸發；之後認識學姊＝學姊那題出現',c4===false&&c5===true,J([c4,c5]));
  fresh(YD[1],13); met(); at(YD[1],13); await run(X,['法研所']); at(YD[1]+3,13); await run(X,['推薦']); at(YD[1]+6,13); const c6=ok(X);
  check('2. 大一兩題（現有）也是每題一次、問完不觸發',c6===false&&J(H.G.flags.XU_ASKED)===J({1:['grad','book']}),J([c6,H.G.flags.XU_ASKED]));
  fresh('2026-07-15',13); const yS=SOCIAL.playerYear(); met(); await run(X,['沒事']); const oS=H.opts[0];
  check('2. 暑假照上一個學期的年級（大一升大二的暑假＝大一的題）',yS===1&&J(oS)===J(['「老師，法研所是在做什麼的？」','「老師推薦一本一年級可以讀的書嗎？」','「沒事，路過。」']),J([yS,oS]));
  fresh(TD('Y2S1',3,1),12.5); const r=enter('wancai'); const t=r.ids.includes('prof_xu')&&await r.talk('prof_xu'); const s=said();
  check('2. 大二上週一行政法下課後他在萬才館，和他說話就是這一場（第一次見面＝大二的自我介紹）',t&&s[0]===D2.intro[2],J([r.ids,s]));
});

/* ======================= 3 林教授 ======================= */
await sec('3-1',async()=>{
  const A='ev_prof_lin_after', D=TD('Y3S1',3,2); fresh(D,11.9,'classroom');
  const outs=[]; for(let i=0;i<6;i++){ outs.push(U(await run(A))); }
  const op=outs.map(o=>o[0]), ls=outs.map(o=>o[o.length-1]);
  check('3-1. 開頭照第幾次輪四種，第五次起從頭（逐字）',J(op)===J(D31.open.concat(D31.open.slice(0,2))),J(op));
  check('3-1. 最後一句：第一次「來研究室也可以。週二下午。」、之後「下週見。」',J(ls)===J([D31.first].concat(Array(5).fill(D31.later))),J(ls));
  check('3-1. 中間的題庫抽題照舊（{legal:{context:classmate,by:prof_lin,pick:{prefer:confused},quiet:false}}，每次一題）',asks.length===6&&asks.every(a=>J(a)===J({context:'classmate',by:'prof_lin',pick:{prefer:'confused'},quiet:false})),J(asks.slice(0,1)));
  fresh(D,11.9,'classroom'); H.G.events.done[A]=1; const o=U(await run(A));
  check('3-1. 舊存檔（已經演過一次）：開頭第二種、最後「下週見。」',o[0]===D31.open[1]&&o[o.length-1]===D31.later,J(o));
});

await sec('3-2',async()=>{
  const O='ev_prof_lin_office', D=TD('Y3S1',3,2), base=G=>{ G.events.done.ev_prof_lin_after=1; G.events.last.ev_prof_lin_after=D-7; };
  const e=ev(O); check('3-2. 新事件：大三上、萬才館、週二 14:00～16:30、冷卻 7 天、最多三次（照稿）',!!e&&J(e.term)===J(['Y3S1'])&&e.location==='wancai'&&J(e.weekday)===J([2])&&J(e.time)===J(D32.win)&&e.cooldown_days===D32.cool&&e.max_times===3,J(e&&[e.term,e.location,e.weekday,e.time,e.cooldown_days,e.max_times,D32.win,D32.cool]));
  const w=[]; for(const [d,h,z,b] of [[D,14.5,'wancai',1],[D,14.5,'wancai',0],[D,13.9,'wancai',1],[D,16.5,'wancai',1],[D+1,14.5,'wancai',1],[D,14.5,'classroom',1],[TD('Y3S2',3,2),14.5,'wancai',1]]){ fresh(d,h,z); if(b) base(H.G); w.push(ok(O)); }
  check('3-2. 要先演過一次 3-1；13:54、16:30、週三、教室、大三下都不演',J(w)===J([true,false,false,false,false,false,false]),J(w));
  fresh(D,14.5); base(H.G); const s1=await run(O);
  check('3-2. 第一次：「你來了。」→「上次下課你問的那題，我回去又想了一下。」→ 題庫一題 → 第一句收尾（逐字）',J(s1)===J([D32.q[0],D32.q[1],D32.last[0]]),J(s1));
  check('3-2. 題庫抽題照稿：{legal:{context:office,by:prof_lin,pick:{prefer:confused},quiet:false}}（使用者提供的刑訴題庫）',!!D32.legal&&asks.length===1&&J(asks[0])===J(D32.legal),J([asks,D32.legal]));
  check('3-2. 教授紀錄：prof_lin office +2（同 3-1）',SOCIAL.prof('prof_lin').office===2,J(SOCIAL.prof('prof_lin')));
  at(D+6,14.5); H.G.weekday=2; const c6=ok(O); at(D+7,14.5); const s2=await run(O); at(D+14,14.5); const s3=await run(O); at(D+21,14.5); const c21=ok(O);
  check('3-2. 冷卻 7 天；第二次「你來了。」→ 題 → 第二句；第三次 → 第三句；最多三次',c6===false&&J(s2)===J([D32.q[0],D32.last[1]])&&J(s3)===J([D32.q[0],D32.last[2]])&&c21===false&&SOCIAL.prof('prof_lin').office===6,J([c6,s2,s3,c21]));
  /* 她週二下午在萬才館 */
  const here=(d,h)=>{ fresh(d,h); return enter('wancai').ids.includes('prof_lin'); };
  const P=[[D,14.5],[D,16.4],[D,16.6],[STORY.dayOfKey('2027-09-28'),14.5],[TD('Y3S2',3,2),14.5],[D+1,14.5],[D,11]].map(([d,h])=>here(d,h));
  check('3-2. 她大三上週二下午（研究室事件 14:00～16:30）在萬才館；16:36 不在；教師節 9/28 週二、大三下、週三不在；上午在上課（不在萬才館）',J(P)===J([true,true,false,false,false,false,false]),J(P));
  const gap=[12.5,13.5,13.75,13.9].map(h=>here(D,h));
  check('3-2. 刑訴下課（12:10）到 16:30 一直在：下課後那 1.5 小時之後（13:40～14:00）不先走開再出現',J(gap)===J([true,true,true,true]),J(gap));
  fresh(D,14.5); base(H.G); const r=enter('wancai'); const t=r.ids.includes('prof_lin')&&await r.talk('prof_lin'); const s=said();
  check('3-2. 走過去和她說話就是研究室這一場',t&&s[0]===D32.q[0]&&s.includes(D32.last[0]),J(s));
  /* 大四上的旁白 */
  const N='ev_prof_lin_nod', n=ev(N), F=TD('Y4S1',1,5);
  check('3-2. 大四上的旁白：刑事判決研討第一次上課前（beforeClass、大四上、一次）',!!n&&n.beforeClass==='crim_judgment_sem'&&J(n.term)===J(['Y4S1'])&&n.once===true&&n.trigger==='class',J(n&&[n.beforeClass,n.term,n.once,n.trigger]));
  const nod=async(lo,cid)=>{ fresh(F,9,'wancai'); H.G.events.done[O]=lo; H.said=[]; H.opts=[]; const r=await CLS.beforeClassEvent(GM,{c:{id:cid},day:F}); return [r,said()]; };
  const a3=await nod(3,'crim_judgment_sem'), a2=await nod(2,'crim_judgment_sem'), p3=await nod(3,'public_judgment_sem');
  check('3-2. 聽過第三句（研究室三次）、選了刑事判決研討：旁白「（她看到你，點了一下頭。）」逐字',a3[0]===true&&J(a3[1])===J([D32.nod]),J(a3));
  check('3-2. 沒聽過第三句、選了公法判決研討：沒有',a2[0]===false&&p3[0]===false&&!a2[1].length&&!p3[1].length,J([a2,p3]));
  fresh(F,9,'wancai'); H.G.events.done[O]=3; await CLS.beforeClassEvent(GM,{c:{id:'crim_judgment_sem'},day:F}); const again=await CLS.beforeClassEvent(GM,{c:{id:'crim_judgment_sem'},day:F+7});
  check('3-2. 旁白一次（第二堂沒有）',again===false);
});

/* ======================= 4 陳教授、黃教授 ======================= */
await sec('4',async()=>{
  const src=fs.readFileSync(path.join(H.ROOT,'src/data/events.js'),'utf8');
  check('4. 陳教授的閒聊：「'+D4.now+'」（不說來研究室聊）',J(SMALLTALK.prof_chen)===J(['「'+D4.now+'」']),J(SMALLTALK.prof_chen));
  check('4. 黃教授的閒聊照舊（一句、沒有條件）；過時的註解「上過她的課以後」拿掉',J(SMALLTALK.prof_huang)===J(['「最近在重讀《正義：一場思辨之旅》。每讀一次，我就換一邊站。」'])&&!src.includes('那是書不是電影；上過她的課以後'));
});

/* ======================= 5 舊存檔 ======================= */
await sec('5',async()=>{
  const Z='ev_prof_zhou_office', X='ev_prof_xu_office', T1=TD('Y1S1',4,4), IDS=['ev_prof_zhou_office','ev_prof_xu_office','ev_prof_lin_after','ev_prof_lin_office','ev_prof_lin_nod','ev_prof_zhou_y4_call'];
  let err=null; try{ for(const [d,h,z] of [[T1,15.5,'wancai'],[TD('Y3S1',3,2),14.5,'wancai'],[TD('Y3S1',3,2),11.9,'classroom'],[TD('Y4S2',11,1),15.5,'wancai'],[TD('Y4S2',10,1),15.15,'wancai']]){ fresh(d,h,z); delete H.G.notes; for(const id of IDS) ok(id,{chain:true}); } }catch(e){ err=String(e&&e.message||e); }
  check('5. 舊存檔沒有 notes、沒有 ZHOU_ASKED／XU_ASKED：六個事件的條件都算得出來、不丟例外',!err,err);
  fresh(T1,15.5); delete H.G.notes; let e2=null; try{ await run(Z,['越權']); }catch(e){ e2=String(e&&e.message||e); }
  check('5. 沒有 notes 的舊存檔照常演、記得下來（ZHOU_ASKED 第一次才建）',!e2&&J(H.G.flags.ZHOU_ASKED)===J({Y1S1:['agency']}),e2||J(H.G.flags.ZHOU_ASKED));
  fresh(T1,15.5,'wancai',{ZHOU_ASKED:'壞掉',XU_ASKED:7}); let e3=null, c3=null; try{ c3=[ok(Z),ok(X)]; await run(Z,['越權']); }catch(e){ e3=String(e&&e.message||e); }
  check('5. 旗標壞掉（不是物件）：當作沒問過，不丟例外',!e3&&J(c3)===J([true,true])&&J(H.G.flags.ZHOU_ASKED)===J({Y1S1:['agency']}),e3||J([c3,H.G.flags.ZHOU_ASKED]));
  fresh(T1,15.5); H.G.notes=[{id:'zhou_88',title:'周教授：無過失的判斷',body:'',day:1},{id:'zhou_book',title:'周教授推薦',body:'',day:2}]; await run(Z,['沒事']); const o=H.opts[0];
  check('5. 舊存檔大一上已經問過無過失、推薦書（有筆記）：只剩越權代理',J(o)===J([D12.qs[0].opt,'「沒事。」']),J(o));
  at(T1+7,15.5); await run(Z,['越權']); at(T1+14,15.5); const c=ok(Z);
  check('5. 舊存檔問完剩下的越權代理＝大一上不再觸發',c===false&&J(H.G.flags.ZHOU_ASKED)===J({Y1S1:['agency']}),J(H.G.flags.ZHOU_ASKED));
  fresh(TD('Y1S1',6,3),13); SOCIAL.remember('prof_xu','FIRST_MET',''); SOCIAL.remember('prof_xu','GRAD_SCHOOL_DISCUSSION',''); await run(X,['沒事']); const xo=H.opts[0]; H.G.notes.push({id:'book_xu'}); at(H.G.day+3,13); const xc=ok(X);
  check('5. 許教授：舊存檔問過法研所（GRAD_SCHOOL_DISCUSSION）只剩推薦書；推薦書也有筆記＝不觸發',J(xo)===J(['「老師推薦一本一年級可以讀的書嗎？」','「沒事，路過。」'])&&xc===false,J([xo,xc]));
  fresh(T1,15.5); await run(Z,['越權']); const back=JSON.parse(J(H.G.flags));
  check('5. 存檔來回（JSON）：ZHOU_ASKED 照存',J(back.ZHOU_ASKED)===J({Y1S1:['agency']}));
});

/* ======================= 8 第 8 節（f36dfe3cf：AA-C 回 LAWWW-C 13:37 的問題）======================= */
const monOf=t=>{ for(let w=4;w<=7;w++){ const d=TD(t,w,1); if(d!=null&&!CALENDAR.holiday(d)) return d; } return null; };   /* 那學期第 4 週起第一個不放假的週一（期中考前）*/
const here=(d,h,id)=>{ fresh(d,h); return enter('wancai').ids.includes(id||'prof_xu'); };
await sec('8-1',async()=>{
  const X='ev_prof_xu_office', TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'], A=(D8.win||[14,16])[0], B=(D8.win||[14,16])[1];
  const P=TERMS.map(t=>{ const d=monOf(t); return [t,keyOf(d),here(d,A),here(d,(A+B)/2),here(d,B-0.03),here(d,B)]; });
  check('8-1. 許教授每週一 14:00～16:00 在萬才館：大一上～大四下八個學期都在（14:00、15:00、15:58 在；16:00 不在）',P.every(x=>x[2]&&x[3]&&x[4]&&!x[5]),J(P));
  const pre=TERMS.filter(t=>t!=='Y2S1').map(t=>[t,here(monOf(t),A-0.1)]);
  check('8-1. 週一 14:00 以前不在（13:54；大二上週一上午有他的課，見下面）',pre.every(x=>!x[1]),J(pre));
  const off=[[STORY.dayOfKey('2025-09-29'),'國定假日的週一（9/29 教師節補假）'],[STORY.dayOfKey('2026-07-13'),'暑假的週一'],[STORY.dayOfKey('2027-01-25'),'寒假的週一'],[TD('Y1S1',4,2),'大一上週二'],[TD('Y3S1',5,4),'大三上週四']].map(([d,n])=>[n,keyOf(d),here(d,15)]);
  check('8-1. 國定假日的週一、寒暑假的週一、其他天的下午不在',off.every(x=>!x[2]),J(off));
  const y2=monOf('Y2S1'), g=[12.5,13.5,13.75,13.9,14.5,15.9,16].map(h=>here(y2,h));
  check('8-1. 上他課的那天照現有：大二上週一行政法（上午）12:10 下課以後在萬才館，一路待到 16:00（13:40～14:00 不先走開再出現，同林教授）',J(g)===J([true,true,true,true,true,true,false]),J([keyOf(y2),g]));
  const wed=here(TD('Y2S2',4,3),12.5), wed2=here(TD('Y2S2',4,3),14.5), fri=(fresh(TD('Y4S1',4,5),12.5),CLS.rec(H.G).electives.Y4S1_sem='public_judgment_sem',enter('wancai').ids.includes('prof_xu'));   /* 公法判決研討是選修（同組預設刑事判決研討）：選了才是你的課 */
  check('8-1. 大二下週三行政救濟法、大四上週五公法判決研討（選了的）：下課後那 1.5 小時在萬才館照現有；週三下午不加研究室時間',wed&&fri&&!wed2,J([wed,fri,wed2]));
  check('8-1. 冷卻照舊（稿：「冷卻照舊 '+D8.cool+' 天」）、地點萬才館',!!ev(X)&&ev(X).cooldown_days===D8.cool&&ev(X).location==='wancai');
  const intro={}; for(const [y,t] of [[1,'Y1S1'],[3,'Y3S1'],[4,'Y4S2']]){ fresh(monOf(t),14.5); const r=enter('wancai'); const t1=r.ids.includes('prof_xu')&&await r.talk('prof_xu'); intro[y]=[!!t1,said()[0]||null]; }
  check('8-1. 週一下午走過去和他說話就是這一場：大一第一次見面「一年級的？…」、大三、大四「許志遠。教公法的。你們這屆我教過。」',[1,3,4].every(y=>intro[y][0]&&intro[y][1]===D2.intro[y]),J(intro));
  fresh(monOf('Y1S1'),14.5); SOCIAL.remember('prof_xu','FIRST_MET',''); await run(X,['法研所']); at(H.G.day+1,14.5); const c1=ok(X); at(H.G.day+6,14.5); const c7=ok(X);
  check('8-1. 冷卻 3 天照舊：隔天不演、下週一照常（題目還沒問完）',c1===false&&c7===true,J([c1,c7]));
  fresh(monOf('Y4S2'),14.5); const rr=enter('wancai'), pz=GM.npc.prof_zhou, px=GM.npc.prof_xu, dd=pz&&px?Math.hypot(pz.obj.position.x-px.obj.position.x,pz.obj.position.z-px.obj.position.z):null;
  check('8-1. 大四下週一他和周教授（專題，週一下午一）同時在萬才館：兩個人站在不同的位子（相距 1 m 以上，不疊在一起）',!!pz&&!!px&&dd>=1,J([rr.ids,dd]));
});

await sec('8-2',async()=>{
  const X='ev_prof_xu_office', Y3=TD('Y3S1',6,3), r3=D2.qrows.find(r=>/研究所/.test(r.opt)), rs=D2.qrows.find(r=>/學姊/.test(r.opt)), NO='「沒事，路過。」';
  const met=()=>{ SOCIAL.remember('prof_xu','FIRST_MET',''); SOCIAL.remember('heroine_05','FIRST_MET',''); };
  fresh(Y3,13,'wancai',{dating_heroine_05:true}); met(); await run(X,['沒事']); const o=H.opts[0];
  check('8-2. 和學姊交往中、大三：選項＝研究所、「學姊的論文，老師覺得怎麼樣？」（換掉「溫書瑀學姊是老師的學生？」）、沒事',!!D8.opt&&J(o)===J([r3.opt,D8.opt,NO]),J(o));
  fresh(Y3,13,'wancai',{dating_heroine_05:true}); met(); const s=await run(X,[D8.opt||'論文']);
  check('8-2. 許教授兩句逐字（「／」分開的兩句）；記成大三那一題（XU_ASKED 3：sis）；教授紀錄 office +2',D8.xu.length===2&&J(s.slice(1))===J(D8.xu)&&J(H.G.flags.XU_ASKED)===J({3:['sis']})&&SOCIAL.prof('prof_xu').office===2,J([s,H.G.flags.XU_ASKED,SOCIAL.prof('prof_xu')]));
  delete H.G.flags.dating_heroine_05; at(Y3+3,13); await run(X,['沒事']); const o2=H.opts[0];
  check('8-2. 同一題：問過交往中那一種，之後不在交往中也不再出原本那一題（只剩研究所）',J(o2)===J([r3.opt,NO]),J(o2));
  fresh(Y3,13); met(); await run(X,[rs.opt]); H.G.flags.dating_heroine_05=true; at(Y3+3,13); await run(X,['沒事']); const o3=H.opts[0];
  check('8-2. 反過來：沒交往時問過原本那一題，交往以後不再出交往中那一種',J(o3)===J([r3.opt,NO]),J(o3));
  fresh(Y3,13); met(); await run(X,['沒事']); const o4=H.opts[0];
  check('8-2. 沒交往、認識她：照第 2 節原本那一題',J(o4)===J([r3.opt,rs.opt,NO]),J(o4));
  fresh(TD('Y4S1',6,3),13,'wancai',{dating_heroine_05:true}); met(); await run(X,['沒事']); const o5=H.opts[0]; fresh(TD('Y2S1',6,3),13,'wancai',{dating_heroine_05:true}); met(); await run(X,['沒事']); const o6=H.opts[0];
  check('8-2. 只換大三那一題：大二、大四交往中照第 2 節',J(o5)===J(D2.qrows.filter(r=>r.y===4).map(r=>r.opt).concat([NO]))&&J(o6)===J(D2.qrows.filter(r=>r.y===2).map(r=>r.opt).concat([NO])),J([o5,o6]));
  const ch=((ev(X)||{}).dialogue||[]).find(l=>l.choice), orig=ch&&ch.choice.find(c=>c.text===rs.opt), dd=ch&&ch.choice.find(c=>c.text===D8.opt);
  check('8-2. 寫法：原本那一題 unless 交往中（{flags:[dating_heroine_05]}，tests/aa350_r_unit.js R7-2 認得的寫法）；交往中那一題 if 交往中',!!orig&&J(orig.unless)===J({flags:['dating_heroine_05']})&&!!dd&&!!dd.if&&J(dd.if.flags)===J(['dating_heroine_05']),J([orig&&orig.unless,dd&&dd.if]));
});

await sec('8-3',async()=>{
  const DONE={ZHOU_ASKED:{Y1S1:['q88','book','agency'],Y1S2:['offer','gestio'],Y2S1:['types','prescr']}}, NEW={LAW_START_DAY:-18,MAIN_D1:-13}, WX='（周教授跟你打了個招呼，聊了兩句天氣。）';   /* DONE：研究室那一場先不演（題目都問過），和他說話就是 talkProf 那一句 */
  const tp=async(d,flags)=>{ fresh(d,15.5,'wancai',Object.assign({},DONE,flags)); const r=enter('wancai'); if(!r.ids.includes('prof')) return ['不在']; await r.talk('prof'); return said(); };
  const oldD2=STORY.dayOfKey('2025-09-18'), newD2=STORY.dayOfKey('2025-09-04');
  const f1=(fresh(oldD2,15.5),STORY.mainD1(H.G)+1), f2=(fresh(newD2,15.5,'wancai',NEW),STORY.mainD1(H.G)+1);
  check('8-3. 民總第一堂（主線第二天的劇情課）：舊存檔 2025-09-18、新局 2025-09-04，都是週四',f1===oldD2&&f2===newD2&&CALENDAR.dateOf(oldD2).wd===4&&CALENDAR.dateOf(newD2).wd===4,J([f1,f2,oldD2,newD2]));
  const W1=D8.w1, good=W1[0]?W1[0].replace(/…+$/,''):'(稿)', none=W1[1]||'(稿)', NOW=W1[2]||'(稿)';
  /* 第 9 節第 1 點改了這一項：原本先把題目都設成問過（DONE）才聽得到這兩句（不然研究室那一場先演）→ 題目都還沒問（tq）：那一週研究室本來就不演，下課後和他說話就是這兩句 */
  const tq=async(d,flags)=>{ fresh(d,15.5,'wancai',flags); const r=enter('wancai'); if(!r.ids.includes('prof')) return ['不在']; await r.talk('prof'); return said(); };
  const a=await tq(oldD2,{classAnswer:'good'}), b=await tq(oldD2,{classAnswer:'none'}), c=await tq(newD2,Object.assign({classAnswer:'good'},NEW)), d=await tq(newD2,Object.assign({classAnswer:'none'},NEW));
  check('8-3. 民總第一堂那一週（那天下午在萬才館；第 9 節第 1 點：研究室的題目都還沒問也先說這兩句）：答得好「祐廷。今天回答得不錯。下週…」（舊存檔「'+good+'」那一版、新局「下週從第一條開始」那一版）、沒讀「祐廷。'+none+'」',
    a.length===1&&a[0].startsWith('祐廷。今天回答得不錯。')&&a[0].includes(good)&&c.length===1&&c[0]==='祐廷。今天回答得不錯。下週從第一條開始，先把總則的目錄看過。'&&J(b)===J(['祐廷。'+none])&&J(d)===J(['祐廷。'+none]),J([a,b,c,d]));
  /* 第 9 節第 1 點：研究室（ev_prof_zhou_office）那一週不演、下一個週四開始 */
  const Z='ev_prof_zhou_office', w1=[[oldD2,15.25,{}],[oldD2,15.5,{classAnswer:'good',classAnswerPlus:true}],[oldD2,16.4,{classAnswer:'absent'}],[newD2,15.25,NEW],[newD2,15.5,Object.assign({classAnswer:'half'},NEW)],[newD2,16.4,Object.assign({classAnswer:'bold'},NEW)]].map(([d,h,f])=>{ fresh(d,h,'wancai',f); return [keyOf(d),h,ok(Z)]; });
  check('8-3. （第 9 節第 1 點）民總第一堂那一週研究室不演：舊存檔 9/18、新局 9/4 的 15:15～16:24 在萬才館（題目都還沒問；答得好、翹課、答一半、敢答都一樣）',w1.every(x=>x[2]===false),J(w1));
  const nx=[]; for(const [d,f] of [[oldD2,{classAnswer:'good'}],[newD2,Object.assign({classAnswer:'none'},NEW)]]){ fresh(d,15.5,'wancai',f); let r=enter('wancai'); await r.talk('prof'); const s0=said(), o0=ok(Z);
    at(d+7,15.5); const o7=ok(Z); r=enter('wancai'); await r.talk('prof'); nx.push({d:keyOf(d),d7:keyOf(d+7),s0,o0,o7,s7:said(),op7:H.opts[0]||null}); }
  check('8-3. （第 9 節第 1 點）那天下課後先說那兩句、研究室不演；下一個週四（舊存檔 9/25、新局 9/11）研究室開始：和他說話＝研究室那一場（招呼「'+D12.greet[3]+'」＋大一上的三題）',
    nx.length===2&&nx.every(x=>x.s0.length===1&&/^祐廷。(今天回答得不錯。下週|案例要讀。下週我還會點人。)/.test(x.s0[0])&&x.o0===false&&x.o7===true&&J(U([x.s7[0]]))===J([D12.greet[3]])&&J(x.op7)===J(['「老師，錯誤的『無過失』要怎麼判斷？」','「老師推薦一本書？」',D12.qs[0].opt,'「沒事。」'])),J(nx));
  const a2=await tp(oldD2+7,{classAnswer:'good'}), b2=await tp(oldD2+7,{classAnswer:'none'}), c2=await tp(newD2+7,Object.assign({classAnswer:'good'},NEW)), d2=await tp(newD2+7,Object.assign({classAnswer:'none'},NEW)), e2=await tp(TD('Y1S2',5,4),{classAnswer:'good'});
  check('8-3. 下一週起照 1-1：他有課的學期（大一上、大一下）說「'+NOW+'」，答得好、沒讀都一樣',[a2,b2,c2,d2,e2].every(x=>J(x)===J([NOW])),J([a2,b2,c2,d2,e2]));
  const g2=await tp(TD('Y2S2',5,4),{classAnswer:'good'}), h2=await tp(TD('Y3S1',5,4),{classAnswer:'none'});
  check('8-3. 他沒有課的學期（大二下、大三上）：聊兩句天氣（不再說「下週…」）',J(g2)===J([WX])&&J(h2)===J([WX]),J([g2,h2]));
  const wk=[oldD2-3,oldD2-4,oldD2+3,oldD2+4].map(x=>{ fresh(x,12); return typeof STORY.civ1Week==='function'?STORY.civ1Week(H.G):null; });
  check('8-3. 「那一週」＝週一～週日（舊存檔 9/15～9/21 算；9/14、9/22 不算）',J(wk)===J([true,false,true,false]),J(wk));
});

await sec('8-4',async()=>{
  const C='ev_prof_zhou_y4_call', Z='ev_prof_zhou_office', c=ev(C), WK=D8.week||10, D10=TD('Y4S2',WK,1), T=D8.time||[15.2,16.5], L=D8.later||[11,13];
  check('8-4. 提示是專題（legal_research）下課的事件：afterClass、大四下、第 '+WK+' 週、一次；周教授一句，台詞照稿「'+D8.call+'」（{name} 照現有的寫法換成名字）',
    !!c&&c.trigger==='class'&&c.afterClass==='legal_research'&&J(c.term)===J(['Y4S2'])&&J(c.weeks)===J([WK])&&c.once===true&&(c.dialogue||[]).length===1&&c.dialogue[0].speaker==='prof_zhou'&&c.dialogue[0].text===D8.call,J(c&&[c.trigger,c.afterClass,c.term,c.weeks,c.once,c.dialogue]));
  const item=d=>CLS.dayItems(H.G,d).find(x=>x.c.id==='legal_research')||null;
  fresh(D10,15.15); const it=item(D10); H.said=[]; const r1=await CLS.afterClassEvent(GM,it); const s1=H.said.map(x=>[x.who,x.t]);
  check('8-4. 第 10 週專題（「回顧大一的案例」）真的上完、下課的時候：周教授一句「祐廷，下課來研究室一趟。」',!!it&&it.week===WK&&r1===true&&s1.length===1&&s1[0][0]===CHARACTERS.prof_zhou.name&&s1[0][1]===String(D8.call).replace('{name}','祐廷'),J([it&&it.week,r1,s1]));
  const r2=await CLS.afterClassEvent(GM,it); const D11=TD('Y4S2',L[0],1); fresh(D11,15.15); const r3=await CLS.afterClassEvent(GM,item(D11));
  check('8-4. 一次（同一堂再下課一次不說）；第 11 週那堂下課沒有',r2===false&&r3===false,J([r2,r3]));
  const W=[]; for(const [d,h] of [[D10,T[0]+0.05],[TD('Y4S2',L[0],1),15.5],[TD('Y4S2',12,1),15.5],[TD('Y4S2',L[1],1),T[1]-0.1],[TD('Y4S2',WK-1,1),15.5],[TD('Y4S2',L[1]+1,1),15.5],[TD('Y4S2',L[1],4),15.5],[D10,15.1],[TD('Y4S2',L[1],1),T[1]]]){ fresh(d,h); W.push(ok(Z)); }
  check('8-4. 研究室那一場：第 10 週那天＋第 11～13 週的週一 15:12～16:30 去都演；第 9、14 週的週一、第 13 週的週四、下課那兩分鐘（15:06）、16:30 不演',J(W)===J([true,true,true,true,false,false,false,false,false]),J(W));
  fresh(D10,15.5); await run(Z); const once=[L[0],12,L[1]].map(w=>{ at(TD('Y4S2',w,1),15.5); return ok(Z); });
  check('8-4. 一次：第 10 週那天演過，第 11～13 週的週一不再演（ZHOU_ASKED.Y4S2）',once.every(x=>x===false)&&J(H.G.flags.ZHOU_ASKED)===J({Y4S2:['y4']}),J([once,H.G.flags.ZHOU_ASKED]));
  fresh(TD('Y4S2',L[1],1),15.5); const s13=await run(Z);
  check('8-4. 一直沒去，第 13 週的週一去也演（一則 zhou_* 筆記都沒有＝「四年了」那一版）',s13[0]===D13.q[0]&&s13.includes(D13.q[2])&&s13.includes(D13.q[4]),J(s13));
  fresh(D10,15.15); await CLS.afterClassEvent(GM,item(D10)); at(D10,15.25); const rr=enter('wancai'); const t=rr.ids.includes('prof_zhou')&&await rr.talk('prof_zhou'); const s=said();
  check('8-4. 提示以後走進萬才館（15:15），周教授在，和他說話就是研究室那一場',!!t&&s[0]===D13.q[0]&&s.includes(D13.q[3]),J([rr.ids,s]));
});

/* ======================= 9 第 9 節（a3ea3918e：AA-C 回 LAWWW-C 14:12 的問題）對稿 ======================= */
await sec('9',async()=>{
  check('9. 讀稿第 9 節：第 1 點答得好、沒讀兩句引文、「研究室事件從下一次（下一個週四）開始」；第 2 點大四下換的那一句、不說「週四下課以後我都在」',
    D9.good==='今天回答得不錯。下週……'&&D9.none==='案例要讀。下週我還會點人。'&&D9.next===true&&D9.term==='Y4S2'&&D9.y4==='大四了。你們這一屆，我從民總教到專題。'&&D9.not==='週四下課以後我都在',J(D9));
  const NEW={LAW_START_DAY:-18,MAIN_D1:-13}, oldD2=STORY.dayOfKey('2025-09-18'), newD2=STORY.dayOfKey('2025-09-04'), g0=D9.good?D9.good.replace(/…+$/,''):'(稿)';
  const tq=async(d,h,flags)=>{ fresh(d,h,'wancai',flags); const r=enter('wancai'); if(!r.ids.includes('prof')) return ['不在']; await r.talk('prof'); return said(); };
  const g=[await tq(oldD2,15.5,{classAnswer:'good'}),await tq(newD2,15.5,Object.assign({classAnswer:'good'},NEW))], n=[await tq(oldD2,15.5,{classAnswer:'none'}),await tq(newD2,15.5,Object.assign({classAnswer:'none'},NEW))];
  check('9. 稿 → 遊戲（第 1 點）：民總第一堂那天下課後（研究室的題目都還沒問）和他說話，答得好「'+g0+'……」（舊局、新局兩版都是這個開頭）、沒讀「'+D9.none+'」（逐字，前面是名字）',
    !!D9.good&&!!D9.none&&g.every(x=>x.length===1&&x[0].startsWith('祐廷。'+g0))&&n.every(x=>J(x)===J(['祐廷。'+D9.none])),J([g,n]));
  fresh(TD('Y4S2',5,3),12,'campus'); const sm=STORY.smallTalk(H.G,'prof_zhou'); const tk=await tq(TD('Y4S2',5,4),15.5,{});
  check('9. 稿 → 遊戲（第 2 點）：大四下照作息遇到他（SMALLTALK.prof_zhou）、週四萬才館的他（talkProf）都是「'+D9.y4+'」（逐字）',!!D9.y4&&sm.say==='「'+D9.y4+'」'&&J(tk)===J([D9.y4]),J([sm,tk]));
  check('9. 第 2 點：大四下不邀研究室（兩句都不說「'+D9.not+'」、不提研究室）',!!D9.not&&[sm.say||sm.narr].concat(tk).every(t=>!String(t).includes(D9.not)&&!String(t).includes('研究室')),J([sm,tk]));
  const ZST=(SMALLTALK.prof_zhou||[]).map(e=>typeof e==='string'?e:e.t);
  check('9. 遊戲 → 稿：SMALLTALK.prof_zhou 的每一句都在稿上（1-1 那一句、第 9 節第 2 點那一句；外面的「」不算字）',ZST.length===2&&ZST.every(t=>[D11.now,D9.y4].includes(unq(t))),J(ZST));
});

H.done();
})();
