// AA_514（企劃線 claude/magical-albattani-bk7b4n @ 964d01175；任務 KX-MOOT3-1028，HEROINE-LIFE-1028，USER_WANTS X122★）：新稿懸著的承諾自查——
//   可昕最後一場模擬法庭（大三上 2027-12-04 週六 14:00～16:30，政大）、予樂家（大二上寒假 1/29 嘉義的動態）——不需要瀏覽器。
//   src/data/kx_moot3_lines.js、src/kx_moot3_3d.js（KXMOOT3）；src/data/feed_y2s1.js（kx_moot 的 KX_WATCH、第 4b 則 kx4bc）、src/data/feed_y2s2.js（kx_win 的 KX_WATCH）。
//   0  載得到、index.html 接線（feed3d.js 後面）、劇情匯入白名單；對稿兩個方向——①遊戲裡每一句都在稿裡（git show 964d01175，一字不差）
//      ②稿第 1 節每一句「可昕：」、每一句旁白、每一個選項、地點字幕、人物頁，第 2 節表的第 4b 列都在遊戲裡；人物頁名稱；每一個 goto 都有 label
//   1  KX_WATCH：大二上第 11 週（kx_moot）、大二下 4/10（kx_win）選「下次我去看。」才記；選另外兩個不記；兩次都選也只是 true
//   2  11/28（日）21:00 私訊：20:59 還沒有；三則、回覆鍵「去。」「那天不行。」、開到 12/4 12:00（12:01 回不了）；
//      誰有：KX_WATCH＋朋友、交往中（只有認識的分數也有）；沒選過、只到有點熟、分開以後的一學期、12/4 12:00 以後才讀到的舊存檔＝沒有（也沒有 21:30 那兩則）；
//      這一版以前選過的舊存檔（只有 KX_MOOT_DM／KX_WIN_DM 'watch'）＝有、補記 KX_WATCH
//   3  「去。」→她回「好。不要遲到。」、排 12/4 14:00 出遊（政大、開車約 40 分鐘、晚 30 分鐘以內、2.5 小時、alarm）；13:10 該出發；
//      演：底圖 classroom_small、地點字幕「政大・模擬法庭教室」、旁白五句、她的兩句、三選一各一次（第三個多一句旁白）、接著兩句；KX_MOOT3='came'、人物頁；16:30 回來；21:30 沒有私訊
//   4  沒來：「那天不行。」→她回「好。」、沒有出遊、12/4 21:29 還沒有、21:30 兩則（不用回）、missed；沒回＝一樣；
//      回了「去。」卻沒到（過了 14:30 沒出發、出發前選「不去了」）＝21:30 三則（前面多「你說要來的。」）、missed
//   5  予樂家（AA_514 第 2 節）：kx4bc 1/29（五）19:30、認識、照片、她的一句、留言、私訊問一字照稿；在可昕第 4、5 則中間；1/18、1/29、2/10 三則都出（只認識）、七天內不超過兩則；
//      19:29 還沒有、19:30 有；留言、私訊問的回覆
//   6  稿第 3 節給 BB 的測試建議（同一個存檔整條走）：大二下 4/10 選「下次我去看。」→ 11/28 21:00 收到約 →「去。」12/4 演、came／「那天不行。」21:30 兩則；沒選過＝都沒有
// 修改前（開發分支 6f0612275：沒有 kx_moot3 兩個檔、KX_WATCH、kx4bc；src、index.html、白名單換回 6f0612275 實際跑過）：FAILED 47（共 52 項；PASS 的 5 項＝讀稿、
//   這個測試抄的台詞都在稿裡、kxCool 的根據、兩題都選別的＝沒有、沒選過＝都沒有）。修改後 ALL PASS（56 項：第 5 節有資料才多跑的 4 項）。
// 用法：node tests/aa514_kx_moot3_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const SHA='bfede0a62',   /* 10-30 AA_527 2-5（AA-B）：麵店那句旁白改「（山下小吃街的麵店。……）」、晨希大四下錄音 5/12；10-28 08:3x：AA 加第 4 節（麵店底圖 nccu_food、晨希兩件），前三節和 964d01175 一樣 */
     SHA0='964d01175', SPEC='docs/story_planning/AA_514_新稿懸著的承諾自查_可昕最後一場模擬法庭.md';
const loadG=(f,names)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
const errs=[];
for(const [f,n] of [['src/data/feed_y1s1.js',['FEED_Y1S1']],['src/data/feed_y1s2.js',['FEED_Y1S2']],['src/data/feed_y2s1.js',['FEED_Y2S1']],['src/data/feed_y2s2.js',['FEED_Y2S2']],['src/feed3d.js',['FEED']],
                    ['src/data/kx_moot3_lines.js',['KX_MOOT3_LINES']],['src/kx_moot3_3d.js',['KXMOOT3']]]){
  try{ if(fs.existsSync(path.join(H.ROOT,f))) loadG(f,n); else errs.push('沒有 '+f); }catch(e){ errs.push(f+'：'+(e&&e.message||e)); } }
const show=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<24,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const doc=show(SHA,SPEC), inDoc=t=>doc.indexOf(t)>=0;
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const sec=async(name,fn)=>{ try{ await fn(); }catch(e){ check(name+'（例外，中斷這一節）',false,String(e&&e.stack||e).slice(0,300)); } };
const L=()=>typeof KX_MOOT3_LINES!=='undefined'?KX_MOOT3_LINES:null, X=()=>typeof KXMOOT3!=='undefined'?KXMOOT3:null;
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null;

/* ---------- 共用 ---------- */
const DK=k=>PG.DK(k), T=(d,h)=>d*24+h, KX='kexin';
const TDt=(term,w,wd)=>{ const R=CALENDAR.termDays(term); return R.from+(w-1)*7+(wd-1); };   /* wd 1＝週一 … 7＝週日 */
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wdOf(d); };
const fresh=(d,h,flags)=>{ const G=H.fresh(CALENDAR.dateOf(d).key,h,'dorm',flags); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.outings)) G.outings=[]; if(STORY._bindGM) STORY._bindGM(GM); return G; };
const LV={ACQ:[10,0,0],FAM:[25,0,0],FRIEND:[45,30,10],CLOSE:[65,50,45]};
const rel=(id,lv)=>{ H.rel(id,...LV[lv]); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const go=(d,h)=>{ at(d,h); rules(); };
const tickF=()=>{ if(typeof FEED!=='undefined') FEED.tick(H.G); PHONE.tick(H.G); };
const walkF=(d,h,step)=>{ step=step||0.25; const end=T(d,h); for(let t=T(H.G.day,H.G.hour);t<end-1e-9;t+=step){ const dd=Math.floor(t/24); at(dd,+(t-dd*24).toFixed(4)); tickF(); } at(d,h); tickF(); };
const tagged=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const texts=tag=>tagged(tag).map(m=>m.text);
const DA=DK('2027-11-28'), DM=DK('2027-12-04');
const ASK='kx_moot3_ask', MISS='kx_moot3_missed', OUT_ID='kx_moot3', EV='ev_kexin_moot3';
const askMsg=()=>PHONE.byAsk(H.G,ASK);
const q0=()=>OUT.get(H.G,OUT_ID);
const said=()=>H.said.map(s=>s.t);
const seq=(got,want)=>{ for(let i=0;i+want.length<=got.length;i++) if(want.every((w,k)=>got[i+k]===w)) return true; return false; };
const herAfter=n=>(H.G.msgs||[]).slice(n).filter(m=>m.from===KX).map(m=>m.text);
/* 台詞（照 AA_514 原文抄；比對遊戲實際傳出來、說出來的）*/
const ASK3=['禮拜六下午兩點。政大，模擬法庭。','你說過要來看。','最後一排。'];
const NAR=['（政大的模擬法庭教室。法官席坐著三個學長姊，旁聽席坐了一半。你坐最後一排。）','（她穿著法袍走進來，沒有往後看。）','（輪到她。講到第二個爭點，她抬頭看了旁聽席一眼，停了半秒，才接著講。）',
  '（宣判的時候，她們那一組贏了。她只點了一下頭。）','（散場以後，她在教室門口等。法袍已經脫了，掛在手上。）'];
const SAW=['我看到你了。最後一排，左邊數來第三個。','講到第二個爭點的時候。……差點忘詞。'];
const OPTS=['「妳講得很好。」','「我有坐最後一排。」','「要不要去吃東西？」'];
const OPT_R=[['我知道。……第二個爭點那裡，不要再提了。'],['最後一排沒用。你太好認了。'],['要。我餓死了。','（山下小吃街的麵店。她吃得很快，一句話都沒說，吃完才抬頭。）']];
const CLOSE=['大四不比了。這是最後一場。','……你有來。好。'];
const MISSED=['贏了。','大四不比了。這是最後一場。'], NOSHOW='你說要來的。';
const MEM_LABEL='她最後一場模擬法庭，你坐最後一排';
const P4B={id:'kx4bc',who:KX,t:'2027-01-29 19:30',st:'認識',pic:'一張圓桌，滿滿的菜，桌腳旁邊趴著一隻很老的黃狗',say:'嘉義。',cm:['予樂家？','嗯。她媽一直夾。'],dm:['好吃嗎？','雞肉飯。我吃了兩碗。予樂說我很不客氣。']};
/* 11/28 的邀約：fresh 在 11/28 20:00、20:59 跑一次（還沒有）、21:00 跑一次 */
const invite=(lv,flags,o)=>{ o=o||{}; fresh(DA,20,flags); if(lv) rel(KX,lv); if(o.dating) H.date(KX); if(o.pre) o.pre(H.G); go(DA,20.98); const early=!!askMsg(); go(DA,21); return {early,m:askMsg()}; };

(async()=>{
/* ======================= 0 載入、接線、對稿 ======================= */
await sec('0',async()=>{
  check('0. 讀稿（git show '+SHA+'：AA_514）',doc.length>2000&&inDoc('## 1. 可昕最後一場模擬法庭')&&inDoc('## 2. 予樂家'),doc?'':'git fetch origin claude/magical-albattani-bk7b4n');
  check('0. 新檔載得到：KX_MOOT3_LINES、KXMOOT3、事件 ev_kexin_moot3（出遊、2.5 小時、只演一次、可昕）',!errs.length&&!!L()&&!!X()&&!!ev(EV)&&ev(EV).trigger==='outing'&&ev(EV).hours===2.5&&ev(EV).once===true&&J(ev(EV).participants)===J([KX]),J(errs));
  check('0. index.html：feed3d.js → data/kx_moot3_lines.js → kx_moot3_3d.js（相鄰、?v= 和旁邊一樣）',/<script src="src\/feed3d\.js\?v=([^"]+)"><\/script>\n<script src="src\/data\/kx_moot3_lines\.js\?v=\1"><\/script>\n<script src="src\/kx_moot3_3d\.js\?v=\1"><\/script>/.test(html));
  const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')), A=(allow.files||[]).filter(e=>e.path===SPEC);
  check('0. 劇情匯入白名單：AA_514 @ '+SHA+'、approved、approvedBy AA-C、任務 KX-MOOT3-1028',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&/AA-C/.test(A[0].approvedBy||'')&&A[0].task==='KX-MOOT3-1028',J(A));
  check('0. 人物頁記憶 KX_MOOT3_CAME「'+MEM_LABEL+'」（稿 1-2）',(SOCIAL.MEMORY_LABEL||{}).KX_MOOT3_CAME===MEM_LABEL&&inDoc('人物頁「'+MEM_LABEL+'」'));
  /* ① 遊戲 → 稿 */
  const CAP_OK={'政大・山下的小吃街':'AA_514 第 4 節第 2 點：麵店那段換 nccu_food；地點字幕照 kxdrift3d.js OD_SCENE.nccu（稿沒寫字幕）'};
  const bad=[], Lx=L(), T_=t=>{ if(typeof t==='string'&&t!==''&&!inDoc(t)) bad.push(t); };
  if(!Lx||!ev(EV)) bad.push('沒有 KX_MOOT3_LINES／ev_kexin_moot3');
  else { for(const k in Lx){ const v=Lx[k]; if(Array.isArray(v)) v.forEach(x=>{ if(x&&typeof x==='object'){ T_(x.t); (x.r||[]).forEach(T_); } else T_(x); }); else T_(v); }
    for(const l of ev(EV).dialogue){ if(l.text!==undefined) T_(l.text); if(l.scene!==undefined&&!CAP_OK[l.scene]) T_(l.scene); for(const c of (l.choice||[])) T_(c.text); } }
  const P=typeof FEED_Y2S1!=='undefined'?FEED_Y2S1.posts.find(p=>p.id==='kx4bc'):null;
  if(!P) bad.push('沒有 kx4bc'); else [P.pic,P.say].concat(P.cm||[],P.dm||[]).forEach(T_);
  check('0. ① 遊戲裡每一句（私訊、回覆鍵、旁白、她的話、選項、地點字幕、人物頁、第 4b 則）都在稿裡（'+SHA+'，一字不差）',!bad.length,J(bad));
  { const e=ev(EV), d=e?e.dialogue:[], i=d.findIndex(l=>l&&typeof l.text==='string'&&/^（山下小吃街的麵店/.test(l.text)), pre=i>0?d[i-1]:null, bgs=d.slice(0,i).filter(l=>l&&l.bg).map(l=>l.bg);
    check('0. 第 4 節第 2 點：選「要不要去吃東西？」以後的麵店那段換底圖 nccu_food（那一句前面一行換）；教室那段照舊 classroom_small',i>0&&!!pre&&pre.bg==='nccu_food'&&bgs[0]==='classroom_small',J({i,pre,bgs})); }
  /* ② 稿 → 遊戲：第 1 節 */
  const s1=doc.slice(doc.indexOf('## 1. '),doc.indexOf('## 2. ')); const lines=[], nars=[], opts=[];
  for(const l of s1.split('\n')){ let m; if((m=/^\s*> 可昕：(.+)$/.exec(l))) lines.push(m[1].trim()); else if((m=/^\s*> (（.+）)\s*$/.exec(l))) nars.push(m[1]); else if((m=/^\s*- 「([^」]+)」→/.exec(l))) opts.push(m[1]); }
  const gameKx=new Set(), gameNar=new Set(), phoneOpts=new Set(), evOpts=new Set();
  if(Lx&&ev(EV)){ for(const t of Lx.ask.concat([Lx.yes,Lx.no],Lx.missed,[Lx.noshow])) gameKx.add(t);
    for(const l of ev(EV).dialogue){ if(l.text===undefined) continue; if(l.speaker===KX) gameKx.add(l.text); else if(l.speaker==null) gameNar.add(l.text); for(const c of (l.choice||[])) evOpts.add(c.text); }
    for(const l of ev(EV).dialogue) for(const c of (l.choice||[])) evOpts.add(c.text);
    phoneOpts.add(Lx.yesT); phoneOpts.add(Lx.noT); }
  const missL=lines.filter(t=>!gameKx.has(t)), missN=nars.filter(t=>!gameNar.has(t)), missO=opts.filter(t=>!phoneOpts.has(t)&&!evOpts.has('「'+t+'」'));
  check('0. ② 稿第 1 節「可昕：」'+lines.length+' 句、旁白 '+nars.length+' 句、選項 '+opts.length+' 個都在遊戲裡（私訊的回覆鍵＝原字，2D 的選項加「」）',lines.length===15&&nars.length===6&&opts.length===5&&!missL.length&&!missN.length&&!missO.length,J({n:[lines.length,nars.length,opts.length],missL,missN,missO}));
  check('0. 這個測試抄的台詞也都在稿裡（下面逐句比對用）',ASK3.concat(NAR,SAW,OPTS,...OPT_R,CLOSE,MISSED,[NOSHOW,'好。不要遲到。']).every(inDoc),J(ASK3.concat(NAR,SAW,OPTS,...OPT_R,CLOSE,MISSED,[NOSHOW]).filter(t=>!inDoc(t))));
  check('0. 稿 1-2：地點字幕「政大・模擬法庭教室」、底圖先用 classroom_small（事件的第一個場景）',!!ev(EV)&&J(ev(EV).dialogue[0])===J({scene:'政大・模擬法庭教室',bg:'classroom_small'})&&inDoc('底圖先用 `classroom_small`，地點字幕「政大・模擬法庭教室」'));
  /* ② 稿 → 遊戲：第 2 節的表（第 4b 列）*/
  const s2=doc.slice(doc.indexOf('## 2. '),doc.indexOf('## 3. ')), row=s2.split('\n').find(l=>/^\|\s*4b\s*\|/.test(l));
  const c=row?row.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim()):[], qs=s=>[...String(s||'').matchAll(/「([^」]*)」/g)].map(m=>m[1]);
  const wm=/^(\d+)\/(\d+)（([一二三四五六日])）(\d\d):(\d\d)/.exec(c[1]||''), key=wm?'2027-'+String(+wm[1]).padStart(2,'0')+'-'+String(+wm[2]).padStart(2,'0'):'', d4=key?DK(key):null;
  const want={id:'kx4bc',who:KX,t:key+(wm?' '+wm[4]+':'+wm[5]:''),st:c[2],pic:c[3],say:c[4],cm:qs(c[5]),dm:qs(c[6])};
  check('0. ② 稿第 2 節表的第 4b 列＝遊戲的 kx4bc（時間、階段、照片、她的一句、留言、私訊問一字不差）；稿上的星期和日期對得上（1/29 週五）',!!row&&!!P&&J(P)===J(want)&&J(want)===J(P4B)&&d4!=null&&CALENDAR.dateOf(d4).wd==='一二三四五六日'.indexOf(wm[3])+1,J({row,P,want}));
  /* 每一個 goto 都有 label */
  const lab=[]; if(ev(EV)){ const S=new Set(ev(EV).dialogue.filter(l=>l.label).map(l=>l.label)); for(const l of ev(EV).dialogue){ if(l.goto&&!S.has(l.goto)) lab.push(l.goto); for(const c2 of (l.choice||[])) if(c2.goto&&!S.has(c2.goto)) lab.push(c2.goto); } }
  check('0. 事件每一個 goto 都有 label',!!ev(EV)&&!lab.length,J(lab)); });

/* ======================= 1 KX_WATCH ======================= */
await sec('1',async()=>{
  const opt=(S,id)=>{ const q=S&&S.dms.find(x=>x.id===id); return q?q.ask.opts:[]; };
  const o1=opt(typeof FEED_Y2S1!=='undefined'?FEED_Y2S1:null,'kx_moot'), o2=opt(typeof FEED_Y2S2!=='undefined'?FEED_Y2S2:null,'kx_win');
  check('1. AA_505 7-2（kx_moot）、AA_506 7-2（kx_win）：「下次我去看。」那個選項 set KX_WATCH，另外兩個沒有',[o1,o2].every(O=>O.length===3&&O[2].t==='下次我去看。'&&J(O[2].set)===J({KX_WATCH:true})&&!O[0].set&&!O[1].set),J([o1.map(o=>o.set),o2.map(o=>o.set)]));
  const run=(d,id,k,pre)=>{ fresh(d,21); rel(KX,'FRIEND'); if(pre) Object.assign(H.G.flags,pre); walkF(d,22.6); const m=(H.G.msgs||[]).find(x=>x.tag==='aa503_'+id&&x.ask); if(m) PHONE.answer(H.G,m.ask.id,k); return {m:!!m,w:H.G.flags.KX_WATCH}; };
  const W11=TDt('Y2S1',11,6), D410=DK('2027-04-10');
  for(const [d,id,nm] of [[W11,'kx_moot','大二上第 11 週週六 22:30 輸了'],[D410,'kx_win','大二下 4/10 22:30 贏了']]){
    const r=[0,1,2].map(k=>run(d,id,k));
    check('1. '+nm+'：選「下次我去看。」＝KX_WATCH true；選另外兩個＝沒有',r.every(x=>x.m)&&r[0].w===undefined&&r[1].w===undefined&&r[2].w===true,J(r)); }
  /* 同一個存檔：大二上選「下次我去看。」，大二下 4/10 又選一次 */
  const a=run(W11,'kx_moot',2); at(D410,21); tickF(); walkF(D410,22.6); const m2=(H.G.msgs||[]).find(x=>x.tag==='aa503_kx_win'&&x.ask); if(m2) PHONE.answer(H.G,m2.ask.id,2);
  check('1. 同一個存檔兩次都選（大二上輸的那晚、大二下贏的那晚）：KX_WATCH 還是 true（只記一次，旗標不是次數）',a.w===true&&!!m2&&H.G.flags.KX_WATCH===true&&H.G.flags.KX_MOOT_DM==='watch'&&H.G.flags.KX_WIN_DM==='watch',J({a,m2:!!m2,w:H.G.flags.KX_WATCH})); });

/* ======================= 2 11/28 21:00 的邀約、誰有 ======================= */
await sec('2',async()=>{
  let r=invite('FRIEND',{KX_WATCH:true}); const m=r.m, M=tagged(ASK);
  check('2. KX_WATCH＋朋友：11/28（日）20:59 還沒有；21:00 三則（'+J(ASK3)+'）',CALENDAR.dateOf(DA).wd===7&&!r.early&&J(M.map(x=>x.text))===J(ASK3)&&M.every(x=>x.day===DA&&Math.abs(x.h-21)<0.01&&x.th==='p:'+KX&&x.from===KX),J(M.map(x=>[x.text,x.day,x.h])));
  check('2. 回覆鍵在最後一則：「去。」「那天不行。」，開到 12/4（六）12:00',!!m&&m.text==='最後一排。'&&J(m.ask.opts.map(o=>o.t))===J(['去。','那天不行。'])&&m.ask.until===T(DM,12)&&CALENDAR.dateOf(DM).wd===6&&H.G.flags.KX_MOOT3_ASK==='sent',J(m&&m.ask));
  go(DM,11.98); const open=!!askMsg()&&PHONE.askOpen(H.G,askMsg()); go(DM,12.02); const shut=!PHONE.askOpen(H.G,askMsg())&&PHONE.answer(H.G,ASK,0)===null;
  check('2. 12/4 11:59 還回得了、12:01 回不了（沒回＝當作「那天不行。」）',open&&shut&&H.G.flags.KX_MOOT3_GO===undefined,J({open,shut}));
  r=invite('ACQ',{KX_WATCH:true},{dating:true}); check('2. 交往中（只有認識的分數）：也有',!!r.m&&H.G.flags.dating_kexin===true,J(H.G.flags.KX_MOOT3_ASK));
  const none=[['沒選過「下次我去看。」（朋友）','FRIEND',{}],['KX_WATCH、只到有點熟、沒有交往','FAM',{KX_WATCH:true}],
    ['KX_WATCH、分開以後的一學期（9/20 分開；FEED.kxCool）','FRIEND',{KX_WATCH:true,EX_kexin:true,KX_ENDED_ON:DK('2027-09-20')}]];
  for(const [nm,lv,fl] of none){ r=invite(lv,fl); go(DM,21.6); check('2. '+nm+'：沒有邀約、12/4 21:30 也沒有私訊（KX_MOOT3_ASK '+H.G.flags.KX_MOOT3_ASK+'）',!r.m&&!tagged(ASK).length&&!tagged(MISS).length&&H.G.flags.KX_MOOT3==null&&/^x:/.test(H.G.flags.KX_MOOT3_ASK||''),J(H.G.flags.KX_MOOT3_ASK)); }
  check('2. 分開以後的一學期那一種：FEED.kxCool 是 true（判斷的根據）',typeof FEED!=='undefined'&&FEED.kxCool(H.G)===true);
  /* 舊存檔 */
  fresh(DM,13,{KX_WATCH:true}); rel(KX,'FRIEND'); rules(); go(DM,21.6);
  check('2. 12/4 12:00 以後才第一次讀到的舊存檔：不約（x:late）、21:30 也沒有',!tagged(ASK).length&&!tagged(MISS).length&&H.G.flags.KX_MOOT3_ASK==='x:late'&&H.G.flags.KX_MOOT3==null,J(H.G.flags.KX_MOOT3_ASK));
  for(const fl of [{KX_MOOT_DM:'watch'},{KX_WIN_DM:'watch'}]){ r=invite('FRIEND',fl);
    check('2. 這一版以前就選過的舊存檔（只有 '+Object.keys(fl)[0]+' watch）：有邀約、補記 KX_WATCH',!!r.m&&H.G.flags.KX_WATCH===true,J({KX_WATCH:H.G.flags.KX_WATCH,ask:H.G.flags.KX_MOOT3_ASK})); }
  r=invite('FRIEND',{KX_MOOT_DM:'can',KX_WIN_DM:'senior'}); check('2. 兩題都選了別的（can、senior）：沒有',!r.m&&H.G.flags.KX_WATCH===undefined); });

/* ======================= 3 「去。」→ 12/4 14:00 政大 ======================= */
await sec('3',async()=>{
  for(const k of [0,1,2]){
    invite('FRIEND',{KX_WATCH:true}); const n=(H.G.msgs||[]).length; const a=PHONE.answer(H.G,ASK,0); const reply=herAfter(n); rules(); const q=q0();
    if(k===0){ check('3. 回「去。」→她回「好。不要遲到。」（KX_MOOT3_GO true）',!!a&&J(reply)===J(['好。不要遲到。'])&&H.G.flags.KX_MOOT3_GO===true,J(reply));
      check('3. 排 12/4（六）14:00 的出遊：政大、開車約 40 分鐘、晚 30 分鐘以內還能出發、2.5 小時、alarm、事件 ev_kexin_moot3',!!q&&q.ev===EV&&q.day===DM&&q.h===14&&q.late===0.5&&q.place==='政大'&&q.travel==='開車約 40 分鐘'&&Math.abs(q.travelH-2/3)<1e-9&&q.hours===2.5&&q.alarm===true&&q.state==='planned',J(q));
      go(DM,13); const d0=OUT.due(H.G); go(DM,13+10/60); const d1=OUT.due(H.G);
      check('3. 13:00 還不用出發、13:10 該出發了（OUT.due）',!d0&&!!d1&&d1.id===OUT_ID,J([d0&&d0.id,d1&&d1.id])); }
    at(DM,13+10/60); const caps=[], c0=GM.caption; GM.caption=(a,b)=>{ caps.push(b); }; H.said=[]; H.opts=[]; H.picks=[k]; H.bgs=[]; H.cards=[];
    try{ if(q) await OUT.go(GM,q); } finally { GM.caption=c0; }
    const got=said(), want=NAR.concat(SAW,OPT_R[k],CLOSE);
    check('3. 選第 '+(k+1)+' 個（'+OPTS[k]+'）：旁白五句、她的兩句、三選一、'+(k===2?'「要。我餓死了。」＋麵店的旁白':'她回的那一句')+'、接著兩句（一字照稿、照順序）',!!q&&seq(got,want)&&H.opts.some(o=>J(o)===J(OPTS)),J(got.slice(0,14)));
    if(k===0){ check('3. 字卡「可昕的模擬法庭（政大）／開車約 40 分鐘」、底圖 classroom_small、地點字幕「政大・模擬法庭教室」',H.cards.some(c=>J(c)===J(['可昕的模擬法庭（政大）','開車約 40 分鐘']))&&H.bgs.some(b=>b&&b.image==='assets/bg/classroom_small.webp')&&caps.includes('政大・模擬法庭教室'),J({cards:H.cards,bgs:H.bgs,caps}));
      check('3. 14:00 到、16:30 回來（演 2.5 小時）',H.G.day===DM&&Math.abs(H.G.hour-16.5)<0.02,J([H.G.day,H.G.hour])); }
    check('3. 演完（第 '+(k+1)+' 個）：KX_MOOT3＝came、人物頁 KX_MOOT3_CAME、出遊 done',H.G.flags.KX_MOOT3==='came'&&SOCIAL.has(KX,'KX_MOOT3_CAME')&&!!q&&q.state==='done',J([H.G.flags.KX_MOOT3,q&&q.state]));
    go(DM,21.6); check('3. 有來的（第 '+(k+1)+' 個）：21:30 沒有私訊',!tagged(MISS).length&&H.G.flags.KX_MOOT3==='came'); } });

/* ======================= 4 沒來 ======================= */
await sec('4',async()=>{
  /* 「那天不行。」 */
  invite('FRIEND',{KX_WATCH:true}); let n=(H.G.msgs||[]).length; PHONE.answer(H.G,ASK,1); const reply=herAfter(n); rules();
  check('4. 回「那天不行。」→她回「好。」（KX_MOOT3_GO false）、沒有出遊',J(reply)===J(['好。'])&&H.G.flags.KX_MOOT3_GO===false&&!q0(),J(reply));
  go(DM,14); go(DM,21.48); const early=tagged(MISS).length; go(DM,21.5); const M=tagged(MISS);
  check('4. 12/4 21:29 還沒有；21:30 兩則（'+J(MISSED)+'）、不用回、KX_MOOT3＝missed',early===0&&J(M.map(x=>x.text))===J(MISSED)&&M.every(x=>x.day===DM&&Math.abs(x.h-21.5)<0.01&&x.from===KX&&!x.ask)&&H.G.flags.KX_MOOT3==='missed'&&!SOCIAL.has(KX,'KX_MOOT3_CAME'),J(M.map(x=>[x.text,x.h])));
  /* 沒回 */
  invite('FRIEND',{KX_WATCH:true}); go(DM,12.5); go(DM,23);
  check('4. 沒回（當作「那天不行。」）：沒有出遊、睡到 23:00 也補在 21:30 兩則、missed',!q0()&&J(texts(MISS))===J(MISSED)&&tagged(MISS).every(x=>x.day===DM&&Math.abs(x.h-21.5)<0.05)&&H.G.flags.KX_MOOT3==='missed'&&H.G.flags.KX_MOOT3_GO===undefined,J(texts(MISS)));
  /* 回了「去。」卻沒到：過了 14:30 沒出發 */
  invite('FRIEND',{KX_WATCH:true}); PHONE.answer(H.G,ASK,0); rules(); go(DM,14.6); const st=q0()&&q0().state; go(DM,21.5);
  check('4. 回了「去。」、過了 14:30 沒出發：21:30 三則（前面多「你說要來的。」）、missed',!!q0()&&J(texts(MISS))===J([NOSHOW].concat(MISSED))&&H.G.flags.KX_MOOT3==='missed',J({st,m:texts(MISS)}));
  /* 回了「去。」、出發前選「不去了」 */
  invite('FRIEND',{KX_WATCH:true}); PHONE.answer(H.G,ASK,0); rules(); at(DM,13.2); const q=q0(); H.picks=[2]; H.opts=[]; const r=q?await OUT.prompt(GM,q):null; go(DM,21.5);
  check('4. 回了「去。」、出發前選「不去了」：出遊 missed、21:30 三則、missed',r==='no'&&q.state==='missed'&&J(texts(MISS))===J([NOSHOW].concat(MISSED))&&H.G.flags.KX_MOOT3==='missed'&&!SOCIAL.has(KX,'KX_MOOT3_CAME'),J({r,opts:H.opts,m:texts(MISS)}));
  /* 晚一點、還在時間內 */
  invite('FRIEND',{KX_WATCH:true}); PHONE.answer(H.G,ASK,0); rules(); go(DM,14.3); const due=OUT.due(H.G);
  check('4. 14:18 還能出發（晚 30 分鐘以內）；14:31 以後不行',!!due&&due.id===OUT_ID&&(at(DM,14.52),!OUT.due(H.G)),J(due&&due.id)); });

/* ======================= 5 予樂家（AA_514 第 2 節）======================= */
await sec('5',async()=>{
  const S=typeof FEED_Y2S1!=='undefined'?FEED_Y2S1:null, ids=S?S.posts.map(p=>p.id):[], i4=ids.indexOf('kx4c'), ib=ids.indexOf('kx4bc'), i5=ids.indexOf('kx5c');
  check('5. kx4bc 在可昕第 4 則（kx4c）、第 5 則（kx5c）中間；id 不重複',i4>=0&&ib===i4+1&&i5===ib+1&&new Set(typeof FEED!=='undefined'?FEED.SETS().flatMap(s=>s.posts.map(p=>p.id)):[]).size===(typeof FEED!=='undefined'?FEED.SETS().flatMap(s=>s.posts).length:-1),J({i4,ib,i5}));
  if(typeof FEED==='undefined'||ib<0){ check('5. 走一遍',false,'沒有資料'); return; }
  const w=FEED.when(H.G||{flags:{}},'2027-01-29 19:30','Y2S1'); check('5. 時間：2027-01-29（五）19:30',!!w&&w.day===DK('2027-01-29')&&Math.abs(w.h-19.5)<1e-9&&CALENDAR.dateOf(w.day).wd===5,J(w));
  fresh(DK('2027-01-17'),8); rel(KX,'ACQ'); walkF(DK('2027-01-29'),19.48); const before=FEED.rec(H.G).items.some(i=>i.id==='kx4bc'); walkF(DK('2027-01-29'),19.5); const it=FEED.rec(H.G).items.find(i=>i.id==='kx4bc');
  check('5. 只認識：1/29 19:29 還沒有、19:30 有；動態頁看得到照片和「嘉義。」',!before&&!!it&&it.day===DK('2027-01-29')&&Math.abs(it.h-19.5)<0.01&&FEED.html(H.G).includes('（照片：'+P4B.pic+'）')&&FEED.html(H.G).includes('<div>嘉義。</div>'),J(it));
  const n=(H.G.msgs||[]).length; FEED.respond(H.G,'kx4bc','cm'); const c=(H.G.msgs||[]).slice(n).map(m=>m.text);
  check('5. 留言「予樂家？」→「嗯。她媽一直夾。」',J(c)===J(['予樂家？','嗯。她媽一直夾。']),J(c));
  fresh(DK('2027-01-29'),18); rel(KX,'ACQ'); walkF(DK('2027-01-29'),20); const n2=(H.G.msgs||[]).length; FEED.respond(H.G,'kx4bc','dm'); const d=(H.G.msgs||[]).slice(n2).map(m=>m.text);
  check('5. 私訊問「好吃嗎？」→「雞肉飯。我吃了兩碗。予樂說我很不客氣。」',J(d)===J(['好吃嗎？','雞肉飯。我吃了兩碗。予樂說我很不客氣。']),J(d));
  fresh(DK('2027-01-14'),8); rel(KX,'FRIEND'); const log=new Map(); for(let t=T(DK('2027-01-14'),8);t<=T(DK('2027-02-12'),0);t+=0.5){ const dd=Math.floor(t/24); at(dd,t-dd*24); tickF(); for(const i of FEED.rec(H.G).items) if(!log.has(i.id)) log.set(i.id,i); }
  const kx=[...log.values()].filter(i=>i.who===KX).sort((a,b)=>T(a.day,a.h)-T(b.day,b.h)); let worst=0; for(const i of kx){ const c2=kx.filter(j=>T(j.day,j.h)<=T(i.day,i.h)&&T(i.day,i.h)-T(j.day,j.h)<7*24).length; worst=Math.max(worst,c2); }
  check('5. 朋友走 1/14～2/11：可昕 1/18、1/29、2/10 三則都出（各在不同週、七天內不超過兩則；第 5 則要朋友）',J(kx.map(i=>i.id))===J(['kx4c','kx4bc','kx5c'])&&worst<=2&&J(kx.map(i=>CALENDAR.dateOf(i.day).key))===J(['2027-01-18','2027-01-29','2027-02-10']),J(kx.map(i=>[i.id,FEED.rec(H.G).done[i.id]]))); });

/* ======================= 6 稿第 3 節給 BB 的測試建議（同一個存檔從大二下 4/10 一路走到大三上 12/4）======================= */
await sec('6',async()=>{
  const D410=DK('2027-04-10');
  const chain=async(k,reply)=>{ fresh(D410,21); rel(KX,'FRIEND'); walkF(D410,22.6); const m=(H.G.msgs||[]).find(x=>x.tag==='aa503_kx_win'&&x.ask); if(m) PHONE.answer(H.G,m.ask.id,k);
    go(DA,20.98); go(DA,21); const inv=!!askMsg(); if(inv&&reply!=null) PHONE.answer(H.G,ASK,reply); rules(); let came=null;
    if(reply===0){ at(DM,13+10/60); const q=q0(); H.said=[]; H.picks=[1]; if(q) await OUT.go(GM,q); came=said(); }
    go(DM,21.6); return {inv,came,miss:texts(MISS),f:H.G.flags.KX_MOOT3}; };
  let r=await chain(2,0);
  check('6. 大二下 4/10 選「下次我去看。」→ 11/28 21:00 收到約；回「去。」→ 12/4 演、記 came、21:30 沒有私訊',r.inv&&!!r.came&&seq(r.came,NAR.concat(SAW,OPT_R[1],CLOSE))&&r.f==='came'&&!r.miss.length,J({inv:r.inv,f:r.f,miss:r.miss}));
  r=await chain(2,1); check('6. 回「那天不行。」→ 12/4 21:30 兩則、missed',r.inv&&J(r.miss)===J(MISSED)&&r.f==='missed',J(r));
  r=await chain(0,null); check('6. 沒選過「下次我去看。」（4/10 選「恭喜！」）→ 11/28 沒有約、12/4 21:30 也沒有',!r.inv&&!r.miss.length&&r.f==null,J(r)); });
H.done();
})();
