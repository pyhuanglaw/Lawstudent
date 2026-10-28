// 手機「動態」、別人說起她：大四下＋畢業那年夏天（AA_510，企劃線 28f981438）、畢業以後 2029-09～2030-12（AA_511，企劃線 c9899bed9）；
// 畢業以後篇跳時間動態不過期（AA_511 第 0 節第 1 點）；AA-C 10-28 06:03「說話的人不在遊戲裡沒做的，照新規則補」（曾靖雯、阿凱）。HEROINE-LIFE-1028，
// 使用者 2026-10-28 01:2x「可攻略女主角 感覺都沒有自己的生活」，USER_WANTS X122★——不需要瀏覽器。
//   src/data/feed_y4s2.js、src/data/feed_pg.js（台詞）、src/feed3d.js（畢業以後篇跳時間 tr＝'pg'、PG.jumpTo 包住、最後一則動態當停點、可昕大四下以後分開 18 週）、
//   src/data/heard_lines.js、src/heard3d.js（別人說起她）。
//   0  載得到、index.html 順序、九份都接上、則數、id 不重複；對稿兩個方向——①遊戲裡每一句都在稿裡（git show，一字不差）②稿的每一列動態都在遊戲裡（時間、階段、照片、她的一句、
//      留言、私訊問）；稿上的日期和星期；AA_510 x-2「她自己的事」每一件都是那一則動態（沒有私訊）、日子對得上；AA_510 第 0-1 節三處（第四輪做的）照新的；白名單 AA_510、AA_511
//   1  階段、聯絡方式、時間、睡過補上、舊存檔（從讀檔那一天開始；第四輪的存檔接著出）
//   2  頻率：大四下＋暑假、畢業以後各走一遍（七位都很熟、照時間跑手機規則）：每一則都出、一天不超過四則、每位連續七天不超過兩則；沛珊一個月最多一則；可昕沒有交往也看得到
//   3  時差：芷若在英國當地 22:07（3/25 以前臺灣 06:07、以後 05:07）、8/27 台中 22:07；以安第 4 則紐約 2030-11-10 20:00＝臺灣 11/11 09:00；畢業以後玩家在臺灣（tzOffset 0）
//   4  AA_510 第 8 節第 5 點：子晴第 1 則以後工作室四個人、以安第 5 則「第十三本」、學姊第 3 則「一百二十二頁」、可昕非交往的玩家看得到四則
//   5  AA_511 第 8 節第 4 點：2029-09～2030-12 跳時間走一遍每一則都看得到（不在跳過的時候過期；臺灣路線、交換延畢的大五上、在群組的，各照 PG.nextStop／PG.jumpTo 一站一站跳）；
//      反例：拿掉保留規則同一條路有好幾則在跳過的時候過期；以安第 4 則在 8/11 出發以後、語彤第 4 則在 12/13 放榜以後、可昕第 1 則非交往的玩家看得到
//   6  跳時間的保留規則：跳的途中貼的、會在跳過的期間過期的停下來還在、可以回、從停下來起七天（反例：一般走過去就過期）；跳之前還看得到的也延；已經過期的不復活；一則只延一次；
//      PG.busy（開手機、演場景）、落地的出遊（問「出發」、演的途中）都演完才算停下來；真的 PG.advance；最後一則動態當停點（接著才是尾聲；沒有聯絡方式的不停、畢業前不停）；舊存檔
//   7  可昕分開以後一學期：大四下以後沒有下一個學期＝分開那天起 18 週（畢業以後、大四下分開各一次）
//   8  別人說起她：AA_510 每一句（稿上的每一句不是在遊戲裡、就是在「沒做」）、閒聊前一句的時間、手機的時間與條件；第五輪補的曾靖雯五句（她在 3D 的地方、要認識說的那個人、
//      一天一句）、阿凱（7/26 起週五公館；前幾輪那四句的時間 3D 裡沒有他＝空著）；畢業以後篇跳的途中收到子晴的私訊就停
// 用法：node tests/aa510_511_feed_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const SHA510='28f981438', SHA511='c9899bed9';
const SPEC510='docs/story_planning/AA_510_女主角自己的生活_大四下與畢業那年夏天.md', SPEC511='docs/story_planning/AA_511_女主角自己的生活_畢業以後到2030.md',
      SPEC509='docs/story_planning/AA_509_女主角自己的生活_大四上與寒假.md';
const loadG=(f,names)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
const errs=[];
for(const [f,n] of [['src/data/needed_msgs.js',['NEEDED_MSGS']],['src/data/feed_y1s1.js',['FEED_Y1S1']],['src/data/feed_y1s2.js',['FEED_Y1S2']],['src/data/feed_y2s1.js',['FEED_Y2S1']],
                    ['src/data/feed_y2s2.js',['FEED_Y2S2']],['src/data/feed_y3s1.js',['FEED_Y3S1']],['src/data/feed_y3s2.js',['FEED_Y3S2']],['src/data/feed_y4s1.js',['FEED_Y4S1']],
                    ['src/data/feed_y4s2.js',['FEED_Y4S2']],['src/data/feed_pg.js',['FEED_PG']],['src/feed3d.js',['FEED']],
                    ['src/data/heard_lines.js',['HEARD_LINES']],['src/heard3d.js',['HEARD']],['src/data/pool_story.js',['POOL_STORY']]]){
  try{ if(fs.existsSync(path.join(H.ROOT,f))) loadG(f,n); else errs.push('沒有 '+f); }catch(e){ errs.push(f+'：'+(e&&e.message||e)); } }
const SET={Y4S2:typeof FEED_Y4S2!=='undefined'?FEED_Y4S2:null,PG:typeof FEED_PG!=='undefined'?FEED_PG:null};
const sec=async(name,fn)=>{ try{ await fn(); }catch(e){ check(name+'（例外）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' | ').slice(0,240)); } };
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const show=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ return ''; } };
const doc={Y4S2:show(SHA510,SPEC510),PG:show(SHA511,SPEC511)}, doc509=show(SHA510,SPEC509);

/* ---------- 共用 ---------- */
const DK=k=>PG.DK(k);
const TDt=(term,w,wd)=>{ const R=CALENDAR.termDays(term); return R.from+(w-1)*7+(wd-1); };   /* wd 1＝週一 … 7＝週日 */
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wdOf(d); };
const fresh=(d,h,flags)=>{ const G=H.fresh(CALENDAR.dateOf(d).key,h,'dorm',flags); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.outings)) G.outings=[]; return G; };
const LV={ACQ:[10,0,0],FAM:[25,0,0],FRIEND:[45,30,10],CLOSE:[65,50,45]};
const rel=(id,lv)=>{ H.rel(id,...LV[lv]); };
const contact=id=>{ H.G.contacts[id]=H.G.day-1; };
const who=(id,lv)=>{ rel(id,lv); contact(id); };
const HAS=()=>typeof FEED!=='undefined', HAS2=()=>HAS()&&!!SET.Y4S2&&!!SET.PG&&FEED.SETS().includes(SET.Y4S2)&&FEED.SETS().includes(SET.PG);
const R=()=>HAS()?FEED.rec(H.G):{start:null,items:[],done:{},dm:{}};
const tickF=()=>{ if(HAS()) FEED.tick(H.G); };
const HT=()=>HAS()?FEED.html(H.G):'';
const T=(d,h)=>d*24+h;
const walk=(d,h,o)=>{ o=o||{}; const st=o.step||0.25, end=T(d,h); let t=T(H.G.day,H.G.hour); for(;t<end-1e-9;t+=st){ const dd=Math.floor(t/24); at(dd,+(t-dd*24).toFixed(4)); tickF(); if(o.heard&&typeof HEARD!=='undefined') HEARD.phone(H.G); PHONE.tick(H.G); }
  at(d,h); tickF(); if(o.heard&&typeof HEARD!=='undefined') HEARD.phone(H.G); PHONE.tick(H.G); };
const jump=(d,h)=>{ at(d,h); tickF(); PHONE.tick(H.G); };
const th=id=>(H.G.msgs||[]).filter(m=>PHONE.th(m)==='p:'+id);
const item=id=>R().items.find(i=>i.id===id)||null;
const visIds=()=>HAS()?FEED.visible(H.G).map(i=>i.id):[];
const SEVEN=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
const post=id=>{ for(const k in SET){ const S=SET[k]; const p=S&&S.posts.find(x=>x.id===id); if(p) return p; } return HAS()?FEED.post(id):null; };
const termOfPost=p=>{ if(SET.Y4S2&&SET.Y4S2.posts.includes(p)) return 'Y4S2'; if(SET.PG&&SET.PG.posts.includes(p)) return 'PG'; for(const S of (HAS()?FEED.SETS():[])) if(S.posts.includes(p)) return S.term; return null; };
const twOf=id=>{ const p=post(id); return p&&HAS()?FEED.when(H.G||{flags:{}},p.t,termOfPost(p)):null; };   /* 稿上的時間（臺灣時間）*/
const hm=h=>{ const H0=Math.floor(h+1e-9), M=Math.round((h-H0)*60); return String(H0).padStart(2,'0')+':'+String(M).padStart(2,'0'); };
const DATING=id=>{ H.G.flags['dating_'+id]=true; if(typeof ROM!=='undefined'&&ROM.get){ const r=ROM.get(H.G,id); r.status='dating'; } };
const tzFmt=z=>new Intl.DateTimeFormat('en-GB',{timeZone:z,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
const utcOf=w=>{ const x=CALENDAR.dateOf(w.day), H0=Math.floor(w.h+1e-9), M=Math.round((w.h-H0)*60); return Date.UTC(x.y,x.m-1,x.d,H0,M)-8*3600e3; };   /* 遊戲時鐘＝臺灣時間（UTC+8）*/
const key=d=>CALENDAR.dateOf(d).key;
/* 畢業以後篇：照 PG.tick／PG.sleepJump 的做法跳一站——PG.busy＝true → PG.jumpTo（到 PG.nextStop）→ 落地的場景、出遊照不演處理（場景標 skip、'first' 記 FIRST_DAY_SEEN；出遊 missed）
   → PG.busy＝false → 回到可以操作（手機規則跑一次）*/
const EPI=()=>T(DK('2034-06-03'),19);
const pgHop=()=>{ const G=H.G, t=PG.nextStop(G); if(t==null||t>=EPI()-1e-6) return null; let r; PG.busy=true;
  try{ r=PG.jumpTo(GM,t); const s=PG.due(G); if(s){ PG.rec(G).done[s.id]='skip'; if(s.id==='first') G.flags.FIRST_DAY_SEEN=true; } } finally { PG.busy=false; }
  const q=typeof OUT!=='undefined'&&OUT.due?OUT.due(G):null; if(q) q.state='missed';
  tickF(); PHONE.tick(G); return {t,r}; };
const pgGrad=(d,h,flags)=>{ fresh(d,h,Object.assign({PACKED_Y4:DK('2029-06-01'),BAR_REG:false},flags||{})); PG.rules(GM); return H.G; };   /* 6/4 以後：PG.rules 記 GRADUATED（畢業以後篇 PG.on）*/
const pgJump=target=>{ let r; PG.busy=true; try{ r=PG.jumpTo(GM,target); } finally { PG.busy=false; } return r; };

/* ---------- 稿 ---------- */
const WHO={'1':['an','heroine_01'],'2':['zr','heroine_02'],'3':['yt','heroine_03'],'4':['zq','heroine_04'],'5':['sis','heroine_05'],'6':['ps','classmate_peishan'],'7':['kx','kexin']};
const WDS='一二三四五六日';
const qs=s=>[...s.matchAll(/「([^」]*)」/g)].map(m=>m[1]);
const cells=l=>l.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
/* AA_510：「### N-3. 動態」的表；AA_511：「## N. 名字」底下的表 */
const rowsOf=(md,term)=>{ const out=[]; let sc=null; for(const l of md.split('\n')){ let m;
    if(term==='Y4S2'){ if((m=/^### (\d)-(\d)\. /.exec(l))){ sc=m[2]==='3'?m[1]:null; continue; } if(/^##? /.test(l)){ sc=null; continue; } }
    else { if((m=/^## (\d)\. /.exec(l))){ sc=WHO[m[1]]?m[1]:null; continue; } if(/^##? /.test(l)||/^---/.test(l)){ sc=null; continue; } }
    if(!sc||!l.startsWith('|')||l.startsWith('|---')||l.startsWith('| #')) continue; const c=cells(l); if(c.length<7) continue;
    out.push({sec:sc,n:c[0],when:c[1],st:c[2],pic:c[3],say:c[4],cm:c[5],dm:c[6]}); } return out; };
/* 「第 3 週週二（3/6）21:30」「6/26（二）21:00」「8/27（一）22:07（台中）」「2029-09-17（一）21:30」「2030-11-10（日）20:00（紐約）」*/
const whenOf=w=>{ let m=/^第 (\d+) 週週([一二三四五六日])（(\d+)\/(\d+)）(\d\d):(\d\d)(?:（([^）]+)）)?$/.exec(w);
  if(m){ const day=TDt('Y4S2',+m[1],WDS.indexOf(m[2])+1), x=CALENDAR.dateOf(day); return {day,h:+m[5]+(+m[6])/60,wdOk:x.m===+m[3]&&x.d===+m[4],place:m[7]||null}; }
  m=/^(?:(\d{4})-)?(\d+)[-\/](\d+)（([一二三四五六日])）(\d\d):(\d\d)(?:（([^）]+)）)?$/.exec(w);
  if(m){ const y=m[1]?+m[1]:2029, k=y+'-'+String(+m[2]).padStart(2,'0')+'-'+String(+m[3]).padStart(2,'0'), day=DK(k); return {day,h:+m[5]+(+m[6])/60,wdOk:CALENDAR.dateOf(day).wd===WDS.indexOf(m[4])+1,key:k,place:m[7]||null}; }
  return null; };
const expectRow=(term,r)=>{ const [pre,id]=WHO[r.sec]; return {id:pre+r.n+(term==='Y4S2'?'h':'i'),who:id,st:r.st,say:r.say==='（沒有字）'?'':r.say,pic:r.pic,cm:qs(r.cm),dm:qs(r.dm)}; };
const C=x=>JSON.stringify(x);
const strs=S=>{ const L=[]; const add=x=>{ if(x!=null&&x!=='') L.push(x); }; for(const p of S.posts){ add(p.pic); add(p.say); for(const x of p.cm||[]) add(x); for(const x of p.dm||[]) add(x); } return L; };
/* AA_510 x-2「她自己的事」：「N. **…**（什麼時候）：動態第 K 則…」*/
const x2Of=md=>{ const out=[]; let sc=null; for(const l of md.split('\n')){ let m; if((m=/^### (\d)-(\d)\. /.exec(l))){ sc=m[2]==='2'&&WHO[m[1]]?m[1]:null; continue; }   /* 1～7 節（0-2 是給 LAWWW 的）*/ if(/^##? /.test(l)){ sc=null; continue; } if(!sc) continue;
    if((m=/^(\d+)\. \*\*(.+?)\*\*（([^）]*)）：(.*)$/.exec(l))) out.push({sec:sc,n:+m[1],what:m[2],when:m[3],rest:m[4]}); else if(/^\d+\. /.test(l)) out.push({sec:sc,bad:l}); } return out; };
/* 「別人說起她」（x-4）：「- 名字（…）：「句子」」、「> 名字：句子」*/
const heardOf=md=>{ const out=[]; let on=false; for(const l of md.split('\n')){ if(/^### \d+-4\. 別人說起她/.test(l)){ on=true; continue; } if(/^(### |## |---)/.test(l)){ on=false; continue; } if(!on) continue; let m;
    if((m=/^\s*- (.+?)：「([^」]*)」/.exec(l))) out.push([m[1],m[2]]); else if((m=/^\s*> ([^：]+)：(.+)$/.exec(l))) out.push([m[1],m[2].trim()]); } return out; };

(async()=>{
/* ---------- 0 載入、對稿 ---------- */
await sec('0',async()=>{ const sc=f=>html.indexOf('<script src="'+f), i7=sc('src/data/feed_y4s1.js'), i8=sc('src/data/feed_y4s2.js'), i9=sc('src/data/feed_pg.js'), iF=sc('src/feed3d.js'), iB=sc('src/data/bbpack_events.js');
  check('0. 載得到；index.html：feed_y4s1.js → feed_y4s2.js → feed_pg.js → feed3d.js（在 bbpack_events.js 前面）',!errs.length&&i7>0&&i8>i7&&i9>i8&&iF>i9&&iB>iF,J(errs));
  check('0. FEED 九份都接上（SETS：大一上～大四下、畢業以後）',HAS()&&J(FEED.SETS().map(s=>s.term))===J(['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2','PG']),HAS()?J(FEED.SETS().map(s=>s.term)):'沒有 FEED');
  const cnt=S=>S?SEVEN.map(id=>S.posts.filter(p=>p.who===id).length):null;
  check('0. 大四下＋暑假：動態 33 則（以安 6、芷若 5、語彤 5、子晴 5、學姊 4、沛珊 4、可昕 4）、沒有私訊；畢業以後：動態 26 則（4、4、4、3、4、4、3）、沒有私訊',
    !!SET.Y4S2&&!!SET.PG&&J(cnt(SET.Y4S2))===J([6,5,5,5,4,4,4])&&SET.Y4S2.dms.length===0&&J(cnt(SET.PG))===J([4,4,4,3,4,4,3])&&SET.PG.dms.length===0,J([cnt(SET.Y4S2),cnt(SET.PG)]));
  const ids=[]; for(const S of (HAS()?FEED.SETS():[])){ for(const p of S.posts) ids.push('p:'+p.id); for(const q of S.dms) ids.push('d:'+q.id); }
  check('0. 九份的 id 都不重複（動態 283＋33＋26、私訊 23）',ids.length===365&&new Set(ids).size===ids.length,J([ids.length,ids.filter((x,i)=>ids.indexOf(x)!==i)]));
  for(const term of ['Y4S2','PG']){ const S=SET[term], md=doc[term], sha=term==='Y4S2'?SHA510:SHA511;
    if(!S||!md){ check('0. '+term+' 對稿（'+sha+'）',false,!md?'git fetch origin claude/magical-albattani-bk7b4n':'沒有資料'); continue; }
    const L=strs(S), bad=L.filter(t=>!md.includes(t));
    check('0. '+term+' ① 遊戲裡每一句都在稿裡（'+sha+'，一字不差；'+L.length+' 句）',L.length>=(term==='Y4S2'?180:140)&&!bad.length,J(bad.slice(0,8)));
    const rows=rowsOf(md,term), wrong=[], wd=[];
    for(const r of rows){ const e=expectRow(term,r), p=S.posts.find(x=>x.id===e.id), w=whenOf(r.when); if(!w||!w.wdOk) wd.push(r.sec+'-'+r.n+' '+r.when);
      const got=p&&HAS()?FEED.when(H.G||{flags:{}},p.t,term):null;
      const tOk=!!got&&!!w&&(w.place==='紐約'?tzFmt('America/New_York').format(new Date(utcOf(got)))===tzFmt('UTC').format(new Date(Date.UTC(CALENDAR.dateOf(w.day).y,CALENDAR.dateOf(w.day).m-1,CALENDAR.dateOf(w.day).d,Math.floor(w.h),Math.round((w.h-Math.floor(w.h))*60)))):got.day===w.day&&Math.abs(got.h-w.h)<1e-6);
      const same=!!p&&p.who===e.who&&p.st===e.st&&p.pic===e.pic&&p.say===e.say&&C(p.cm)===C(e.cm)&&C(p.dm)===C(e.dm)&&!p.went&&tOk;
      if(!same) wrong.push(e.id+(p?'':'（沒有）')+(tOk?'':'（時間）')); }
    check('0. '+term+' ② 稿的動態表 '+rows.length+' 列，每一列都在遊戲裡（時間、階段、照片、她的一句、留言、私訊問一字不差；稿寫紐約的換成臺灣時間）',rows.length===S.posts.length&&!wrong.length,J(wrong.slice(0,10)));
    check('0. '+term+' 稿上的日期和星期對得上（'+rows.length+' 列）',!wd.length,J(wd)); }
  /* AA_510 x-2：每一件都是「動態第 K 則」，日子對得上 */
  const X=x2Of(doc.Y4S2||''), xbad=[];
  for(const x of X){ if(x.bad){ xbad.push(x.bad); continue; } const m=/^動態第 (\d+) 則/.exec(x.rest); if(!m){ xbad.push(x.sec+'-2 第 '+x.n+' 件不是動態：'+x.rest); continue; }
    const id=WHO[x.sec][0]+m[1]+'h', w=twOf(id); if(!w){ xbad.push(id+' 沒有'); continue; } const R2=CALENDAR.termDays('Y4S2'), wk=Math.floor((w.day-R2.from)/7)+1, dt=CALENDAR.dateOf(w.day);
    let mm; if((mm=/^第 (\d+) 週(?:週([一二三四五六日]))?/.exec(x.when))){ if(wk!==+mm[1]||(mm[2]&&dt.wd!==WDS.indexOf(mm[2])+1)) xbad.push(id+' 週次 '+x.when+'≠第 '+wk+' 週'); }
    else if((mm=/^(\d+)\/(\d+)/.exec(x.when))){ if(dt.m!==+mm[1]||dt.d!==+mm[2]) xbad.push(id+' 日子 '+x.when+'≠'+dt.m+'/'+dt.d); } else xbad.push(id+' 看不懂 '+x.when); }
  check('0. AA_510 x-2「她自己的事」'+X.length+' 件，每一件都寫「動態第 N 則」（沒有要另外傳的私訊）、寫的週次或日子和那一則動態一樣',X.length===33&&!xbad.length,J(xbad.slice(0,8)));
  /* AA_510 第 0-1 節：AA_509 三處（第四輪已經照 28f981438 做）*/
  const md=doc.Y4S2||'', P=id=>post(id)||{}, src=['src/data/feed_y4s1.js','src/data/heard_lines.js'].map(f=>fs.readFileSync(path.join(H.ROOT,f),'utf8')).join('\n');
  const newCx='子晴學姊上班以後，社課只來過兩次。兩次都待到最後，幫忙收導線。';
  check('0. AA_510 第 0-1 節三處在遊戲裡是更正後的：可昕大四上第 1 則「第四年。」宿舍窗外的山、芷若倫敦的貓「我叫牠房東。……」；晨希那句改了（葉晨希 pool_11，等 AA_500，沒做）、舊句子不在',
    md.includes('改成「第四年」')&&md.includes('我叫牠房東。')&&md.includes('社課只來過兩次')&&P('kx1g').say==='第四年。'&&P('kx1g').pic==='宿舍窗外的山，和大一那張同一個角度'
    &&!!P('zr3g').dm&&P('zr3g').dm[1]==='不知道。我叫牠房東。牠坐在長椅上的樣子，像長椅是牠的。'&&doc509.includes(newCx)&&!src.includes(newCx)&&!src.includes('社課一次都沒來')&&!src.includes('我叫牠所長'),
    J({kx1g:P('kx1g').say,zr3g:P('zr3g').dm}));
  const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files, A=k=>allow.find(e=>e.path.indexOf('docs/story_planning/'+k+'_')===0)||{};
  check('0. 白名單：AA_510＝28f981438（note 補第五輪）、AA_511＝c9899bed9（approved、approvedBy、HEROINE-LIFE-1028）',A('AA_510').sha===SHA510&&A('AA_510').status==='approved'&&/第五輪/.test(A('AA_510').note||'')
    &&A('AA_511').path===SPEC511&&A('AA_511').sha===SHA511&&A('AA_511').status==='approved'&&!!A('AA_511').approvedBy&&A('AA_511').task==='HEROINE-LIFE-1028',J({AA_510:A('AA_510').sha,AA_511:A('AA_511')}));
  check('0. HEARD_LINES.src 記 AA_510＝28f981438',typeof HEARD_LINES!=='undefined'&&HEARD_LINES.src.AA_510===SHA510); });

/* ---------- 1 階段、聯絡方式、時間、舊存檔 ---------- */
await sec('1',async()=>{ if(!HAS2()){ check('1. 動態',false,'沒有資料'); return; }
  const W3TUE=TDt('Y4S2',3,2); fresh(W3TUE,20); who('heroine_01','ACQ'); walk(W3TUE,21.48); const b0=item('an1h'); walk(W3TUE,21.5);
  check('1. 以安大四下第 1 則（第 3 週週二 3/6 21:30，認識）：21:29 還沒有、21:30 有「選了。」',!b0&&!!item('an1h')&&item('an1h').day===W3TUE&&Math.abs(item('an1h').h-21.5)<0.01&&HT().includes('選了。'),J(item('an1h')));
  walk(DK('2029-04-29'),20.1,{step:0.5}); check('1. 以安第 2 則（4/29，朋友）只認識：沒有（x:stage），畫面上沒有',R().done.an2h==='x:stage'&&!HT().includes('她又迷路了。'),J(R().done.an2h));
  fresh(TDt('Y4S2',4,2),20); rel('heroine_03','CLOSE'); walk(TDt('Y4S2',4,2),21.6); check('1. 語彤很熟、沒有聯絡方式：大四下第 1 則不出（x:contact）',R().done.yt1h==='x:contact'&&!item('yt1h'),J(R().done.yt1h));
  const W10WED=TDt('Y4S2',10,3); fresh(W10WED-1,23); who('heroine_04','FRIEND'); tickF(); jump(W10WED,8);
  const z=item('zq2h'); check('1. 子晴大四下第 2 則（第 10 週週三 00:30）：週二 23:00 睡到週三 08:00，補在 00:30',!!z&&z.day===W10WED&&Math.abs(z.h-0.5)<0.01,J(z));
  const D313=DK('2029-03-13'); fresh(D313,22); who('heroine_03','ACQ'); who('heroine_04','ACQ'); tickF();
  check('1. 舊存檔第一次讀（3/13 22:00）：那一天 21:30 語彤第 1 則補上；之前（3/9）子晴第 1 則不補（old）',R().start===D313&&!!item('yt1h')&&R().done.zq1h==='old',J({start:R().start,yt1h:R().done.yt1h,zq1h:R().done.zq1h}));
  fresh(DK('2029-02-18'),12); who('heroine_05','FRIEND'); H.G.flags.FEED={start:DK('2025-09-01'),items:[],done:{sis4g:'p',kx4g:'p'},dm:{},seen:-1e9}; walk(TDt('Y4S2',3,4),8.3,{step:0.5});
  check('1. 第四輪的舊存檔（FEED 只有前七份的紀錄）：大四下學姊第 1 則照樣出（3/8 08:10）',!!item('sis1h')&&R().done.sis4g==='p'&&key(item('sis1h').day)==='2029-03-08',J(R().done)); });

/* ---------- 2 頻率：走一遍 ---------- */
const runAll=(from,to,step,flags,setup)=>{ fresh(from,0,flags); for(const id of SEVEN) who(id,'CLOSE'); if(setup) setup(); const log=new Map();
  for(let t=T(from,0);t<=T(to,23.5);t+=step){ const dd=Math.floor(t/24); at(dd,t-dd*24); tickF(); for(const i of R().items) if(!log.has(i.id)) log.set(i.id,i); }
  const L=[...log.values()], byDay={}; for(const i of L) byDay[i.day]=(byDay[i.day]||0)+1;
  let worst=0, wid=''; for(const i of L){ if(!FEED.isHeroine(i.who)) continue; const n=L.filter(j=>j.who===i.who&&T(j.day,j.h)<=T(i.day,i.h)&&T(i.day,i.h)-T(j.day,j.h)<7*24).length; if(n>worst){ worst=n; wid=i.id; } }
  return {log,L,maxDay:Math.max(0,...Object.values(byDay)),worst,wid}; };
await sec('2',async()=>{ if(!HAS2()){ check('2. 走一遍',false,'沒有資料'); return; }
  let r=runAll(DK('2029-02-17'),DK('2029-09-02'),0.5);
  let miss=SET.Y4S2.posts.map(p=>p.id).filter(id=>!r.log.has(id));
  check('2. 大四下＋暑假走一遍（七位都很熟、沒有交往、臺灣路線）：33 則都出',!miss.length,J({miss,done:miss.map(id=>R().done[id])}));
  check('2. 大四下＋暑假：一天不超過四則（最多 '+r.maxDay+'）、每位連續七天不超過兩則（最多 '+r.worst+'）',r.maxDay<=4&&r.worst<=2,r.wid);
  const pm=r.L.filter(i=>i.who==='classmate_peishan'&&i.day>=DK('2029-02-19')).map(i=>{ const x=CALENDAR.dateOf(i.day); return x.y+'-'+x.m; });
  check('2. AA_510 6-3：沛珊大四下四則，一個月一則（3、4、5、7 月）',J(pm)===J(['2029-3','2029-4','2029-5','2029-7'])&&FEED_Y4S2.capMonth&&FEED_Y4S2.capMonth.classmate_peishan===1,J(pm));
  r=runAll(DK('2029-09-03'),DK('2030-12-31'),1);
  miss=SET.PG.posts.map(p=>p.id).filter(id=>!r.log.has(id));
  check('2. 畢業以後走一遍（2029-09-03～2030-12-31）：26 則都出',!miss.length,J({miss,done:miss.map(id=>R().done[id])}));
  check('2. 畢業以後：一天不超過四則（最多 '+r.maxDay+'）、每位連續七天不超過兩則（最多 '+r.worst+'）',r.maxDay<=4&&r.worst<=2,r.wid);
  const pm2=r.L.filter(i=>i.who==='classmate_peishan').map(i=>{ const x=CALENDAR.dateOf(i.day); return x.y+'-'+x.m; });
  check('2. AA_511 第 6 節：沛珊一季最多一則（2029-10、2030-02、07、09）',J(pm2)===J(['2029-10','2030-2','2030-7','2030-9'])&&FEED_PG.capMonth&&FEED_PG.capMonth.classmate_peishan===1,J(pm2));
  /* 可昕沒有交往：照朋友的階段 */
  const kx=(from,to,lv)=>{ fresh(from,0); who('kexin',lv); const seen=new Set(); for(let d=from;d<=to;d++){ at(d,23.9); tickF(); for(const i of R().items) seen.add(i.id); } return {seen,done:R().done}; };
  const k1=kx(DK('2029-02-19'),DK('2029-09-02'),'FRIEND'), k2=kx(DK('2029-09-03'),DK('2030-12-31'),'FRIEND'), k3=kx(DK('2029-02-19'),DK('2029-09-02'),'ACQ');
  check('2. 可昕沒有交往、朋友：大四下四則（計畫表、生日、畢業、一試）、畢業以後三則（榜單、職前訓練、第一份書狀）都看得到',['kx1h','kx2h','kx3h','kx4h'].every(id=>k1.seen.has(id))&&['kx1i','kx2i','kx3i'].every(id=>k2.seen.has(id)),J([[...k1.seen],[...k2.seen]]));
  check('2. 可昕只認識：大四下認識的三則有、第 4 則（朋友）沒有（x:stage）',['kx1h','kx2h','kx3h'].every(id=>k3.seen.has(id))&&k3.done.kx4h==='x:stage',J(k3.done)); });

/* ---------- 3 時差 ---------- */
await sec('3',async()=>{ if(!HAS2()){ check('3. 時差',false,'沒有資料'); return; }
  H.fresh('2029-03-01',12,'dorm');
  const loc=(z,ids)=>ids.map(id=>{ const w=twOf(id); return {id,tw:key(w.day)+' '+hm(w.h),loc:tzFmt(z).format(new Date(utcOf(w)))}; });
  const uk=loc('Europe/London',['zr1h','zr2h','zr3h','zr4h']);
  check('3. 芷若在英國的四則：倫敦當地都是 22:07（倫敦是前一天）；臺灣 3/11 06:07（3/25 以前英國冬令）、4/29、6/10、7/22 05:07（夏令）',
    uk.every(x=>/, 22:07$/.test(x.loc))&&uk[0].tw==='2029-03-11 06:07'&&uk.slice(1).every(x=>/ 05:07$/.test(x.tw))&&/^10\/03\/2029/.test(uk[0].loc),J(uk));
  const z5=twOf('zr5h'); check('3. 芷若第 5 則 8/27 22:07（台中＝臺灣時間，照舊 22:07）',key(z5.day)==='2029-08-27'&&Math.abs(z5.h-(22+7/60))<1e-6);
  const a4=twOf('an4i'), ny=tzFmt('America/New_York').format(new Date(utcOf(a4)));
  check('3. 以安第 4 則：稿寫紐約 2030-11-10（日）20:00＝臺灣 11/11 09:00（11/3 起美東標準時間 UTC−5）',key(a4.day)==='2030-11-11'&&Math.abs(a4.h-9)<1e-6&&ny==='10/11/2030, 20:00',J({tw:key(a4.day)+' '+hm(a4.h),ny}));
  check('3. 畢業以後玩家都在臺灣：臺灣、日本、美國路線 2030-11-11 STORY.tzOffset＝0（以安在紐約是她的時差，不改玩家的時鐘）',
    ['TW','JP','US'].every(r=>STORY.tzOffset(Object.assign({},H.G,{flags:Object.assign({},H.G.flags,{EXCHANGE_ROUTE:r})}),DK('2030-11-11'))===0));
  const D1111=DK('2030-11-11'); fresh(D1111,8.5); who('heroine_01','FRIEND'); walk(D1111,8.98); const n0=item('an4i'); walk(D1111,9.02);
  check('3. 以安第 4 則在遊戲裡臺灣 11/11 09:00 出（08:59 還沒有）、手機上寫 09:00、「第三個國家的窗戶。」',!n0&&!!item('an4i')&&HT().includes('今天 09:00')&&HT().includes('第三個國家的窗戶。'),J(item('an4i')));
  const D311=DK('2029-03-11'); fresh(D311,5.5); who('heroine_02','ACQ'); walk(D311,6.1); const u0=item('zr1h'); walk(D311,6.13);
  check('3. 芷若第 1 則在遊戲裡臺灣 3/11 06:07 出（06:06 還沒有）',!u0&&!!item('zr1h')&&Math.abs(item('zr1h').h-(6+7/60))<0.01,J(item('zr1h'))); });

/* ---------- 4 AA_510 第 8 節第 5 點 ---------- */
await sec('4',async()=>{ if(!HAS2()){ check('4. 稿的測試',false,'沒有資料'); return; }
  /* 子晴第 1 則以後工作室四個人：大四上 2/10「其他四個人合買的」（五個人）→ 3/9「少一個」→ 2029-07 固定格「我們四個人」（第 0-2 節第 7 點：接得上，不用改）*/
  const pg=fs.readFileSync(path.join(H.ROOT,'src/data/pg_dates.js'),'utf8'), four=/"ym": "2029-07",\s*"line": "工作室冷氣壞了三天。我們四個人輪流去便利商店吹冷氣。"/.test(pg);
  const z5g=post('zq5g')||{}, z1=post('zq1h')||{};
  check('4. 子晴第 1 則（3/9「少一個」）在大四上 2/10「其他四個人合買的」（五個人）以後、2029-07 固定格「我們四個人」以前',
    four&&(z5g.dm||[])[2]==='其他四個人合買的'&&z1.say==='少一個'&&C(z1.cm)===C(['有人離職？','美術','他去大公司了'])&&twOf('zq5g').day<twOf('zq1h').day&&twOf('zq1h').day<DK('2029-07-01'),J({four,z5g:z5g.dm,z1:z1.say}));
  const D39=DK('2029-03-09'); fresh(D39,23); who('heroine_04','ACQ'); walk(D39,23.8); FEED.respond(H.G,'zq1h','cm'); const zc=th('heroine_04').slice(-3).map(x=>x.text);
  check('4. 子晴第 1 則：留言「有人離職？」→「美術」「他去大公司了」',HT().includes('少一個')&&J(zc)===J(['有人離職？','美術','他去大公司了']),J(zc));
  /* 以安第 5 則「第十三本」：接閒聊 A8-L4「十二本，日本又多一本。」*/
  const lad=id=>{ for(const t in LADDER.byTerm) for(const w in LADDER.byTerm[t]){ const s=(LADDER.byTerm[t][w].steps||[]).find(x=>x.id===id); if(s) return s; } return null; };
  const D810=DK('2029-08-10'); fresh(D810,21); who('heroine_01','CLOSE'); walk(D810,21.6); const h5=HT(); FEED.respond(H.G,'an5h','dm'); const a5=th('heroine_01').slice(-2).map(x=>x.text);
  const A84=lad('A8-L4');
  check('4. 以安第 5 則（8/10 21:30，很熟）「第十三本。」；私訊問「之前那十二本呢？」→「在台中。媽媽照年份排好了。」（接閒聊 A8-L4「十二本，日本又多一本。」）',
    h5.includes('第十三本。')&&h5.includes('一本新的手帳，第一頁寫「研究所」')&&J(a5)===J(['之前那十二本呢？','在台中。媽媽照年份排好了。'])&&!!A84&&A84.choices.some(c=>/^十二本，日本又多一本。/.test(c.reply)),J(a5));
  /* 學姊第 3 則「一百二十二頁」：接閒聊 S7-L6（一百四十二頁、指導教授說要刪二十頁）*/
  const D620=DK('2029-06-20'); fresh(D620,20.5); who('heroine_05','FRIEND'); walk(D620,21.1); FEED.respond(H.G,'sis3h','dm'); const s3=th('heroine_05').slice(-2).map(x=>x.text); const S76=lad('S7-L6');
  check('4. 學姊第 3 則（6/20 修正本「交了。」）私訊問「刪了二十頁？」→「刪了。最後剩一百二十二頁。」＝閒聊 S7-L6 的一百四十二頁刪二十頁',
    J(s3)===J(['刪了二十頁？','刪了。最後剩一百二十二頁。'])&&!!S76&&S76.lines.some(l=>l.includes('一百四十二頁'))&&S76.choices.some(c=>c.reply.includes('指導教授說要刪二十頁')),J(s3));
  /* 可昕非交往的玩家看得到四則（第 2 段也走過）：認識的那三則照時間出 */
  const kxSeen=[]; for(const [id,d,h] of [['kx1h',TDt('Y4S2',2,7),21.1],['kx2h',DK('2029-04-25'),22.1],['kx3h',DK('2029-06-10'),20.1],['kx4h',DK('2029-08-06'),21.1]]){ fresh(d,h-0.5); who('kexin','FRIEND'); walk(d,h); if(item(id)&&HT().includes((post(id)||{}).say)) kxSeen.push(id); }
  check('4. 可昕非交往（朋友）：四則在她貼的時間都看得到（3/4 計畫表、4/25 生日隔天、6/10 畢業、8/6 一試）',J(kxSeen)===J(['kx1h','kx2h','kx3h','kx4h']),J(kxSeen)); });

/* ---------- 5 AA_511 第 8 節第 4 點：畢業以後篇跳時間走一遍 ---------- */
const pgWalk=(flags,setup)=>{ pgGrad(DK('2029-06-04'),10,flags); for(const id of SEVEN) who(id,'CLOSE'); if(setup) setup(); tickF();
  const stops=[], seen=new Map(); let g=0; while(g++<300){ const x=pgHop(); if(!x) break; const v=visIds(); for(const id of v) if(!seen.has(id)) seen.set(id,key(H.G.day)); stops.push({at:key(H.G.day)+' '+hm(H.G.hour),r:x.r,n:v.length}); }
  return {stops,seen,next:PG.nextStop(H.G)}; };
const WANT=()=>SET.PG.posts.map(p=>p.id).concat(SET.Y4S2.posts.filter(p=>T(twOf(p.id).day,twOf(p.id).h)>=T(DK('2029-06-04'),10)).map(p=>p.id));
await sec('5',async()=>{ if(!HAS2()){ check('5. 畢業以後篇跳時間',false,'沒有資料'); return; }
  const want=WANT();
  const tw=pgWalk({EXCHANGE_ROUTE:'TW'}), jp=pgWalk({EXCHANGE_ROUTE:'JP'}), gp=pgWalk({EXCHANGE_ROUTE:'TW'},()=>{ PHONE.join(H.G,'noodle_team','麵店團'); PHONE.join(H.G,'econ_friends','走啦'); PHONE.join(H.G,'family_law','法律系家族'); });
  const missOf=w=>want.filter(id=>!w.seen.has(id));
  check('5. 臺灣路線、沒報國考、不在群組（停點最少的那種：6/28、12/14、1/25、10/1…，一跳最長八個月）：6/4 以後 '+want.length+' 則（大四下暑假 '+(want.length-26)+'、畢業以後 26）停下來的時候每一則都看得到',
    want.length===42&&!missOf(tw).length&&tw.stops.length>=5,J({miss:missOf(tw),stops:tw.stops}));
  const y5=SET.PG.posts.filter(p=>{ const w=twOf(p.id); return w.day>=DK('2029-09-03')&&w.day<=DK('2029-12-23'); }).map(p=>p.id);
  check('5. 交換延畢（日本路線，2029-09-03～12-23 是大五上 CALENDAR.termOfDelayed；也是畢業以後篇的跳時間）：每一則都看得到，大五上那 '+y5.length+' 則也是',
    !missOf(jp).length&&y5.length===9&&y5.every(id=>jp.seen.has(id))&&!!CALENDAR.termOfDelayed&&(CALENDAR.termOfDelayed(DK('2029-09-17'))||{}).id==='Y5S1',J({miss:missOf(jp),stops:jp.stops}));
  check('5. 在麵店團、「走啦」、家族群組（停點多）：每一則都看得到',!missOf(gp).length,J({miss:missOf(gp),n:gp.stops.length}));
  check('5. 最後一站是最後一則動態（2030-12-22 22:07 芷若的存摺）以後一分鐘，接著就是尾聲（2034-06-03 19:00）',[tw,jp,gp].every(w=>w.stops[w.stops.length-1].at==='2030-12-22 22:08'&&w.next===EPI()),J([tw,jp,gp].map(w=>[w.stops[w.stops.length-1],w.next])));
  /* 反例：拿掉保留規則（FEED.pgJumping 壓成負的＝跳的途中不記）同一條路，跳過的期間就過期 */
  const keep=FEED.pgJumping; let off; FEED.pgJumping=-1e6; try{ off=pgWalk({EXCHANGE_ROUTE:'TW'}); } finally { FEED.pgJumping=keep; }
  const offMiss=missOf(off);
  check('5. 反例：同一條路（臺灣路線、停點最少）拿掉保留規則，有 '+offMiss.length+' 則在跳過的時候過期、停下來看不到（以安研究所第一堂、芷若回吧檯、子晴上架……）',
    offMiss.length>=20&&['an1i','zr1i','zq1i'].every(id=>offMiss.includes(id)),J(offMiss));
  /* 以安第 4 則在 8/11 出發以後；語彤第 4 則在 12/13 放榜以後；可昕第 1 則非交往的玩家看得到 */
  const sendoff=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id==='ev_an_ny_sendoff'):null, tag=SOCIAL.PG_TAG&&SOCIAL.PG_TAG.heroine_01;
  check('5. 以安第 4 則（臺灣 2030-11-11 09:00）在 8/11 紐約出發（人物頁 2030-08-11 起「紐約」）以後',T(twOf('an4i').day,twOf('an4i').h)>T(DK('2030-08-11'),23)&&!!tag&&tag.some(x=>x[0]==='2030-08-11'&&x[1]==='紐約'),J({an4i:key(twOf('an4i').day),tag,sendoff:!!sendoff}));
  const r2=PG.Y[2030].r2;
  check('5. 語彤第 4 則（2030-12-16 21:00 紅紙）在 12/13 放榜（PG.Y[2030].r2、麵店團 15:10 那則「上了。」）以後',r2==='2030-12-13'&&T(twOf('yt4i').day,twOf('yt4i').h)>T(DK(r2),15+10/60)&&twOf('yt4i').day>DK(r2),J({r2,yt4i:key(twOf('yt4i').day)}));
  const D1215=DK('2029-12-15'); pgGrad(D1215,20.5,{}); who('kexin','ACQ'); walk(D1215,21.1);
  check('5. 可昕第 1 則（2029-12-15 21:00「上了。」）：沒有交往、只認識也看得到',H.G.flags.dating_kexin!==true&&R().done.kx1i==='p'&&HT().includes('榜單的截圖，名字被手指擋住'),J(R().done.kx1i)); });

/* ---------- 6 跳時間的保留規則 ---------- */
await sec('6',async()=>{ if(!HAS2()){ check('6. 保留規則',false,'沒有資料'); return; }
  const D908=DK('2029-09-08'), D1020=DK('2029-10-20'), Z1=T(DK('2029-09-12'),22+7/60);
  /* A 跳的途中貼的 */
  pgGrad(D908,10,{}); who('heroine_02','ACQ'); tickF(); const on=!!PG.on&&PG.on(H.G);
  const ra=pgJump(T(D1020,12)); const ia=item('zr1i')?Object.assign({},item('zr1i')):null; tickF(); const ib=item('zr1i'), h0=HT();
  check('6. 畢業以後篇（PG.on）9/8 跳到 10/20：途中 9/12 22:07 芷若「回來了。」記 tr＝pg、還沒停下來不記 back；停下來那一刻記 back＝10/20 12:00、動態頁看得到（已經 38 天）',
    on&&ra==='ok'&&!!ia&&ia.tr==='pg'&&ia.back==null&&!!ib&&ib.back===T(D1020,12)&&h0.includes('吧檯後面的掛鉤，一件新的圍裙')&&H.G.day===D1020,J({ra,ia,ib}));
  const okR=!!FEED.respond(H.G,'zr1i','cm'); const zc=th('heroine_02').slice(-2).map(x=>x.text);
  check('6. 停下來以後可以回（留言「又在吧檯了？」→「嗯。老闆說位子一直空著。」）',okR&&J(zc)===J(['又在吧檯了？','嗯。老闆說位子一直空著。']),J(zc));
  jump(D1020+7,11.98); const in7=HT().includes('吧檯後面的掛鉤'); jump(D1020+7,12.02); const out7=HT().includes('吧檯後面的掛鉤');
  check('6. 從停下來那一刻起七天：10/27 11:58 還在、12:02 就不在',in7&&!out7,J({in7,out7}));
  /* B 反例：不是跳過去的（一般走過去）照七天 */
  pgGrad(D908,10,{}); who('heroine_02','ACQ'); walk(D1020,12,{step:2}); const nb=item('zr1i');
  check('6. 反例：同一則一般走過去（不是跳時間）——9/19 22:07 就過期，10/20 動態頁沒有',R().done.zr1i==='p'&&!HT().includes('吧檯後面的掛鉤')&&(!nb||nb.tr==null),J(nb));
  /* C 跳之前還看得到的也延（一則只延一次）*/
  pgGrad(D908,10,{}); who('heroine_02','ACQ'); walk(DK('2029-09-16'),9,{step:1}); const c0=Object.assign({},item('zr1i')); pgJump(T(D1020,12)); tickF(); const c1=item('zr1i');
  check('6. 跳之前就貼了（9/12 22:07，跳的時候 9/16 還在七天內）：沒記 tr 的那一刻是一般的；跳的時候記 tr＝pg，停下來（10/20）還在',c0.tr==null&&!!c1&&c1.tr==='pg'&&c1.back===T(D1020,12)&&HT().includes('吧檯後面的掛鉤'),J({c0,c1}));
  pgJump(T(DK('2029-11-30'),12)); tickF(); const c2=HT().includes('吧檯後面的掛鉤');
  check('6. 一則只延一次：10/20 停下來以後再跳到 11/30（超過七天）就不在了（不會每跳一次都重算）',!c2&&item('zr1i')==null);
  /* D 已經過期的不復活 */
  pgGrad(D908,10,{}); who('heroine_02','ACQ'); walk(DK('2029-09-20'),9,{step:1}); pgJump(T(D1020,12)); tickF(); const d1=item('zr1i');
  check('6. 跳之前就過期了（9/20 跳，9/12 那則已經八天）：跳完也不會出現',!HT().includes('吧檯後面的掛鉤')&&(!d1||d1.tr==null),J(d1));
  /* E 停下來＝接著的那一件也演完：PG.busy（跳完開手機、演場景）*/
  pgGrad(D908,10,{}); who('heroine_02','ACQ'); tickF(); PG.busy=true; let e1; try{ PG.jumpTo(GM,T(D1020,12)); tickF(); e1=item('zr1i')&&item('zr1i').back; } finally { PG.busy=false; } tickF(); const e2=item('zr1i')&&item('zr1i').back;
  check('6. 跳完還在 PG.busy（PG.advance 開手機、演落地的場景）：不記 back；PG.busy 結束那一刻才記',e1==null&&e2===T(D1020,12),J({e1,e2}));
  /* F 落地的是出遊：問「出發」（OUT.due）、演的途中（arrived）都還沒停下來；演完才記 back */
  pgGrad(D908,10,{}); who('heroine_02','ACQ'); tickF(); OUT.plan(H.G,{id:'t_feed_out',ev:'ev_none',day:D1020,h:19,late:0.75,place:'麵店',title:'測試的出遊',travel:'',travelH:0,silent:true}); const q=OUT.get(H.G,'t_feed_out');
  const tf=PG.nextStop(H.G), rf=pgJump(tf); tickF(); const f1=item('zr1i')&&item('zr1i').back;
  q.arrived=true; at(D1020,20.5); tickF(); const f2=item('zr1i')&&item('zr1i').back;
  q.state='done'; delete q.arrived; at(D1020,21); tickF(); const f3=item('zr1i')&&item('zr1i').back;
  check('6. 落地的是出遊（10/20 19:00，停在 18:45 問「出發」）：問的時候、演的途中都不記 back；演完（21:00）才記，從那一刻起七天',
    Math.abs(tf-T(D1020,18.75))<1e-6&&f1==null&&f2==null&&f3===T(D1020,21)&&HT().includes('吧檯後面的掛鉤'),J({tf:tf-T(D1020,0),rf,f1,f2,f3}));
  /* G 真的 PG.advance：第一份工作（2030-10-01）以後、尾聲以前停在最後一則動態 */
  const D1001=DK('2030-10-01'), Y4F={GRADUATED:DK('2029-06-02'),GRAD_DONE:true,MOVED_OUT:DK('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true};   /* [前置] 6/28 退宿過（同 tests/y5_delay_unit.js 的 grad）*/
  pgGrad(D1001,21.5,Y4F); PG.rec(H.G).done.first=1; H.G.flags.FIRST_DAY_SEEN=true; who('heroine_01','FRIEND'); who('heroine_05','FRIEND'); tickF();
  const st=PG.nextStop(H.G); H.cards=[]; PG.busy=true; let adv; try{ adv=await PG.advance(GM); } finally { PG.busy=false; } tickF(); const gv=visIds(), card=H.cards.map(c=>c[0]);
  check('6. 真的 PG.advance（2030-10-01 21:30，以安、學姊都是朋友）：下一站是學姊 12/22 21:00 那則以後一分鐘（不是 2034 的尾聲）；落地以後以安 11/11、學姊 12/22 都看得到',
    Math.abs(st-T(DK('2030-12-22'),21+1/60))<1e-6&&adv===true&&key(H.G.day)==='2030-12-22'&&gv.includes('an4i')&&gv.includes('sis4i')&&card.some(c=>/^12\/22/.test(c))&&PG.nextStop(H.G)===EPI(),J({st:st-T(DK('2030-12-22'),0),gv,card,next:PG.nextStop(H.G)}));
  /* H 最後一則動態的停點：沒有聯絡方式、階段不夠、畢業以前都不停 */
  pgGrad(D1001,21.5,{}); PG.rec(H.G).done.first=1; H.G.flags.FIRST_DAY_SEEN=true; const n1=PG.nextStop(H.G), p1=FEED.pgStop(H.G);
  pgGrad(D1001,21.5,{}); PG.rec(H.G).done.first=1; H.G.flags.FIRST_DAY_SEEN=true; who('heroine_01','ACQ'); const p2=FEED.pgStop(H.G);
  fresh(DK('2029-05-01'),12,{}); who('heroine_01','CLOSE'); const p3=FEED.pgStop(H.G);
  check('6. 誰都沒有聯絡方式：不停（下一站直接是尾聲）；以安只認識（第 4 則要朋友）：不停；畢業以前（PG.on 不成立）：不停',p1==null&&n1===EPI()&&p2==null&&p3==null,J({p1,n1,p2,p3}));
  /* I 舊存檔：沒有 tr 的照七天；跳的時候還在七天內的一樣延 */
  pgGrad(DK('2029-09-14'),12,{}); who('heroine_02','ACQ'); H.G.flags.FEED={start:DK('2025-09-01'),items:[{id:'zr1i',who:'heroine_02',day:DK('2029-09-12'),h:22.117}],done:{zr1i:'p'},dm:{},seen:-1e9};
  tickF(); const i0=HT().includes('吧檯後面的掛鉤'); pgJump(T(D1020,12)); tickF(); const i1=item('zr1i');
  check('6. 舊存檔（items 沒有 tr／back）：照七天；跳的時候還在七天內的一樣延到停下來以後七天',i0&&!!i1&&i1.tr==='pg'&&i1.back===T(D1020,12)&&HT().includes('吧檯後面的掛鉤'),J(i1)); });

/* ---------- 7 可昕分開以後一學期（大四下以後沒有下一個學期）---------- */
await sec('7',async()=>{ if(!HAS2()){ check('7. 可昕',false,'沒有資料'); return; }
  const D1001=DK('2029-10-01'); pgGrad(D1001,10,{dating_kexin:true}); who('kexin','FRIEND'); ROM.end(H.G,'kexin','apart_talk');
  const c0=FEED.kxCool(H.G); walk(DK('2029-12-16'),12,{step:2}); const d1=R().done.kx1i; at(DK('2030-02-03'),12); const c1=FEED.kxCool(H.G); at(DK('2030-02-04'),12); const c2=FEED.kxCool(H.G);
  walk(DK('2030-04-15'),12,{step:3}); const d2=R().done.kx2i;
  check('7. 畢業以後分開（2029-10-01）：沒有下一個學期，照分開那天起 18 週——12/15 榜單那則不出（x:cool）、2030-02-04 起照朋友的階段（4/14 職前訓練那則出）',
    H.G.flags.dating_kexin===false&&c0===true&&d1==='x:cool'&&c1===true&&c2===false&&d2==='p',J({c0,d1,c1,c2,d2}));
  const D401=DK('2029-04-01'); fresh(D401,10,{dating_kexin:true}); who('kexin','FRIEND'); ROM.end(H.G,'kexin','apart_talk'); walk(DK('2029-08-07'),12,{step:2}); const D=R().done;
  check('7. 大四下分開（2029-04-01，後面沒有學期）：4/25 生日、6/10 畢業那兩則不出（x:cool）；18 週以後（8/5 起）8/6 一試那則出',D.kx2h==='x:cool'&&D.kx3h==='x:cool'&&D.kx4h==='p',J({kx2h:D.kx2h,kx3h:D.kx3h,kx4h:D.kx4h})); });

/* ---------- 8 別人說起她（AA_510；第五輪補的曾靖雯、阿凱）---------- */
await sec('8',async()=>{ if(typeof HEARD==='undefined'){ check('8. HEARD',false,'沒有 HEARD'); return; }
  const HL=HEARD_LINES, all=[]; for(const e of HL.talk) all.push([e.src&&e.src.split(' ')[0],e.t,e.id,e.who]); for(const e of HL.phone) for(const it of e.items) all.push([e.src&&e.src.split(' ')[0],it[2],e.id,e.th]);
  const mine=all.filter(x=>x[0]==='AA_510'), md=doc.Y4S2||'';
  check('8. AA_510 的句子（'+mine.length+' 句：閒聊前一句 6、手機 5）都在稿裡（28f981438，一字不差）',mine.length===11&&mine.every(x=>md.includes(x[1])),J(mine.filter(x=>!md.includes(x[1]))));
  const got=new Set(all.map(x=>x[1])), heard=heardOf(md);
  const NOT_DONE={'子晴學姊當評審，給我的學妹最高分。學妹按錯 C，她說沒關係，沒停就好。':'葉晨希 pool_11（等 AA_500）'};
  const miss=heard.filter(([w,t])=>!got.has(t)&&!NOT_DONE[t]), extra=Object.keys(NOT_DONE).filter(t=>!heard.some(x=>x[1]===t)||got.has(t));
  check('8. 稿上「別人說起她」'+heard.length+' 句：'+heard.filter(x=>got.has(x[1])).length+' 句在遊戲裡、'+Object.keys(NOT_DONE).length+' 句列在沒做（葉晨希 pool_11 等 AA_500），沒有漏掉',heard.length===12&&!miss.length&&!extra.length,J({miss,extra}));
  /* 閒聊前一句：from 那天有、前一天沒有、until 那天有、隔天沒有（AA_510 六句＋第五輪補的曾靖雯四句）*/
  const meet=(...ids)=>{ for(const id of ids) H.rel(id,45,30,10); };
  const NEW=HL.talk.filter(e=>/^AA_510/.test(e.src||'')||e.who==='pool_7'), bad=[];
  const setupT=(e,d,h)=>{ fresh(d,h==null?12:h,{}); meet(e.who); if(e.about) meet(e.about); for(const o of HL.talk) if(o.who===e.who&&o.id!==e.id&&HL.talk.indexOf(o)<HL.talk.indexOf(e)) HEARD.rec(H.G).said[o.id]=d-1; };
  for(const e of NEW){ const a=HEARD.when(e.from), b=e.until?HEARD.when(e.until):null; if(!a){ bad.push(e.id+' from'); continue; }
    setupT(e,a.day,a.h!=null?a.h+0.01:12); const i1=HEARD.talkDue(H.G,e.who); setupT(e,a.day-1,23.9); const i0=HEARD.talkDue(H.G,e.who);
    let ok=!!i1&&i1.id===e.id&&(!i0||i0.id!==e.id); if(b){ setupT(e,b.day,12); const l=HEARD.talkDue(H.G,e.who); setupT(e,b.day+1,12); const n=HEARD.talkDue(H.G,e.who); ok=ok&&!!l&&l.id===e.id&&(!n||n.id!==e.id); }
    if(!ok) bad.push(e.id); }
  check('8. 閒聊前一句 '+NEW.length+' 句（AA_510 六句：曾靖雯、筱涵、以安說語彤、阿凱、陳助教、柏翰；第五輪補的曾靖雯 AA_504、AA_506 兩句、AA_508）在它的那幾天才說',NEW.length===10&&!bad.length,J(bad));
  const W=k=>key(HEARD.when(k).day), E=id=>HL.talk.find(e=>e.id===id)||{};
  check('8. 時間照稿：曾靖雯 5 月起、筱涵 6/2 典禮以後（6/3 起）、以安說語彤第 2 週起到第 15 週（週四總圖三樓的那幾週）、阿凱 7/26 起（子晴 7/25 demo 以後）、陳助教 6/1 口試完第一個週五那一頓以後、柏翰 4/15 21:00 公開課那則以後；只寫起點的到 9/2',
    E('h510_zjw_an').from==='2029-05-01'&&E('h510_xh_yt').from==='2029-06-03'&&W('Y4S2:W2一')==='2029-02-26'&&W('Y4S2:W15日')==='2029-06-03'&&E('h510_an_yt').until==='Y4S2:W15日'
    &&E('h510_kai_zq').from==='2029-07-26'&&E('h510_ta_sis').from==='2029-06-01 20:30'&&E('h510_bh_ps').from==='2029-04-15 21:00'&&['h510_zjw_an','h510_xh_yt','h510_kai_zq','h510_ta_sis','h510_bh_ps'].every(id=>E(id).until==='2029-09-02'));
  /* 曾靖雯（pool_7）：AA_498 第一批，在 3D 出現的地方；要認識說的那個人；一天一句 */
  const P7=typeof POOL_STORY!=='undefined'?POOL_STORY.PEOPLE.pool_7:null;
  check('8. 曾靖雯是 pool_7（AA_498 第一批）：平日早上傅鐘旁邊、課堂第一排、大二起週六萬才館法服值班（src/data/pool_story.js）——閒聊前一句走 talk（認識以後找她說話）',
    !!CHARACTERS.pool_7&&CHARACTERS.pool_7.name==='曾靖雯'&&!!P7&&P7.where.some(w=>w.zone==='campus'&&w.seat==='bell')&&P7.where.some(w=>w.zone==='wancai')&&!!P7.cls,J(P7&&P7.where.map(w=>w.label)));
  fresh(DK('2029-05-02'),7,{}); meet('pool_7'); const z0=HEARD.talkDue(H.G,'pool_7'); meet('heroine_01'); H.said=[]; await HEARD.preTalk(GM,{name:'曾靖雯'},'pool_7'); const z1=H.said.map(s=>s.t); H.said=[]; await HEARD.preTalk(GM,{name:'曾靖雯'},'pool_7'); const z2=H.said.length;
  check('8. 曾靖雯 2029-05-02：不認識以安＝不說；認識以安＝找她說話先說「以安考上研究所了。她說九月還是坐第一排。」；同一天不再說',!z0&&J(z1)===J(['以安考上研究所了。她說九月還是坐第一排。'])&&z2===0,J({z0:z0&&z0.id,z1,z2}));
  const D320=DK('2027-03-20'); fresh(D320,7,{}); meet('pool_7','heroine_01','heroine_03'); const y1=HEARD.talkDue(H.G,'pool_7'); HEARD.rec(H.G).said[y1&&y1.id]=D320; HEARD.rec(H.G).day.pool_7=D320; at(D320+1,7); const y2=HEARD.talkDue(H.G,'pool_7');
  check('8. 曾靖雯大二下 3/20（兩句都在的那幾天）：先說交換說明會那句，隔天說債各那句（說語彤，要認識語彤）',!!y1&&y1.id==='h506_zjw_an'&&!!y2&&y2.id==='h506_zjw_yt',J([y1&&y1.id,y2&&y2.id]));
  /* 阿凱：2029-06-28 起週五 22～24 在公館（characters.js 作息）；AA_510 那句 7/26 起 */
  const kaiAt=(d,h)=>{ at(d,h); const e=STORY.schedEnt(CHARACTERS.kai,H.G); return e?e.zone:undefined; };
  fresh(DK('2029-07-27'),22.5,{}); const k1=kaiAt(DK('2029-07-27'),22.5);
  fresh(DK('2029-07-27'),22.5,{}); meet('kai'); const kn=HEARD.talkDue(H.G,'kai'); meet('heroine_04'); const kd=HEARD.talkDue(H.G,'kai'); fresh(DK('2029-07-20'),22.5,{}); meet('kai','heroine_04'); const kb=HEARD.talkDue(H.G,'kai');
  check('8. 阿凱 2029-07-27（五）22:30 在公館（作息）；認識子晴才說「子晴學姊的 demo，我玩了三個小時。……」；7/20（demo 以前）不說',k1==='gongguan'&&!kn&&!!kd&&kd.id==='h510_kai_zq'&&(!kb||kb.id!=='h510_kai_zq'),J({k1,kn:kn&&kn.id,kd:kd&&kd.id,kb:kb&&kb.id}));
  /* 前幾輪阿凱那四句：那幾段時間 3D 裡沒有他（作息 zone＝null「在他那棟宿舍」）＝先空著 */
  const KAI_OLD=[['AA_505','子晴不去實驗室。她說她要做自己的東西。……我覺得她做得到。','Y2S1:W12一','Y2S1:end'],['AA_507','子晴學姊拿走我的毯子了。……她說借，可是她已經睡了一個月。','Y3S1:W4一','Y3S1:end'],
    ['AA_508','子晴學姊的發表會，她叫我不要坐第一排。所以我坐第一排。','Y3S2:W14一','Y3S2:end'],['AA_509','子晴學姊把公園的貓帶回家了。她說是同事。……貓是同事。','2028-12-14','Y4S1:end']];
  const kaiBad=[]; let kaiDays=0; fresh(DK('2026-11-01'),12,{});
  for(const [k,t,a,b] of KAI_OLD){ if(got.has(t)) kaiBad.push(k+' 在遊戲裡'); const d0=HEARD.when(a).day, d1=HEARD.when(b).day; if(!(DK('2027-03-13')<d0||DK('2027-03-13')>d1)) kaiBad.push(k+' 包到 2027-03-13（r3 方奕廷六點那一次）');
    for(let d=d0;d<=d1;d++){ kaiDays++; for(const h of [8,12,18,21,22.5,23.5]){ const z=kaiAt(d,h); if(z) kaiBad.push(k+' '+key(d)+' '+h+' '+z); } } }
  check('8. 前幾輪阿凱那四句（AA_505、AA_507、AA_508、AA_509 4-4）：那幾段時間（'+kaiDays+' 天）3D 裡都沒有他（作息「在他那棟宿舍」），先空著、不在遊戲裡',!kaiBad.length&&kaiDays>300,J(kaiBad.slice(0,6)));
  /* 手機 */
  const run=(d,h)=>{ at(d,h); HEARD.phone(H.G); PHONE.tick(H.G); };
  const msgs=tag=>(H.G.msgs||[]).filter(m=>m.tag==='heard_'+tag);
  const D323=DK('2029-03-23'); fresh(D323,21,{}); PHONE.join(H.G,'noodle_team','麵店團'); run(D323,21.3); const a0=msgs('h510_yu_an').length; run(D323,21.4);
  check('8. AA_510 1-4：Alison 3/23（研究所放榜隔天）21:20 麵店團群組「以安放榜那天，在麵店點了一碗大的。吃不完，給阿哲。她說今天可以。」',a0===0&&J(msgs('h510_yu_an').map(m=>[m.th,m.from,m.name,m.text]))===J([['g:noodle_team','yu','Alison','以安放榜那天，在麵店點了一碗大的。吃不完，給阿哲。她說今天可以。']]),J(msgs('h510_yu_an')));
  fresh(D323,21,{}); run(D323,21.4); check('8. 不在麵店團群組：沒有（x:noodleGroup）',!msgs('h510_yu_an').length&&HEARD.rec(H.G).ph.h510_yu_an==='x:noodleGroup');
  const D610=DK('2029-06-10'); fresh(D610,23,{}); run(D610,23.6); const yu0=msgs('h510_yule').length; fresh(D610,23,{yulePassDay:1}); run(D610,23.6); const yu1=msgs('h510_yule').map(m=>[m.th,m.text]);
  check('8. AA_510 7-4：予樂（見過她才有）6/10 23:30 兩則「可昕說她典禮沒哭 ……」「我有拍到 ……」',yu0===0&&J(yu1)===J([['p:yule','可昕說她典禮沒哭 拍大合照的時候她偷偷擦眼睛'],['p:yule','我有拍到 她叫我刪掉 我沒有']]),J(yu1));
  const D87=DK('2029-08-07'); fresh(D87,21,{}); PHONE.join(H.G,'econ_friends','走啦'); run(D87,21.4); const p1=msgs('h510_pinyu').map(m=>[m.th,m.name,m.text]); fresh(D87,21,{}); run(D87,21.4); const p2=msgs('h510_pinyu').length;
  check('8. AA_510 7-4：品妤 8/7 21:20「走啦」群組「可昕一試考完，第一件事是去吃鹹酥雞。她說忍了半年。」；不在群組沒有',J(p1)===J([['g:econ_friends','品妤','可昕一試考完，第一件事是去吃鹹酥雞。她說忍了半年。']])&&p2===0,J(p1));
  const D829=DK('2029-08-29'); fresh(D829,23,{}); who('heroine_04','ACQ'); meet('heroine_02'); run(D829,23.6); const zq=msgs('h510_zq_zr').map(m=>[m.th,m.from,m.text]);
  fresh(D829,23,{}); who('heroine_04','ACQ'); run(D829,23.6); const zx=HEARD.rec(H.G).ph.h510_zq_zr;
  check('8. AA_510 2-4：子晴 8/29 23:30 私訊「芷若回來了。她第一件事是問貓。……第二件事才問我。」（有子晴的聯絡方式、認識芷若；不認識芷若＝x:zqZr）',J(zq)===J([['p:heroine_04','heroine_04','芷若回來了。她第一件事是問貓。……第二件事才問我。']])&&zx==='x:zqZr',J({zq,zx}));
  /* 畢業以後篇跳的途中收到：跳停在那裡 */
  pgGrad(DK('2029-08-20'),10,{}); who('heroine_04','ACQ'); meet('heroine_02'); const jr=pgJump(T(DK('2029-09-20'),12)); const jm=msgs('h510_zq_zr');
  check('8. 畢業以後篇（PG.on）8/20 跳到 9/20：子晴 8/29 23:30 的私訊照時間送到，跳停在那裡（msg）',jr==='msg'&&jm.length===1&&jm[0].day===D829&&H.G.day<=D829+1,J({jr,day:key(H.G.day),h:H.G.hour,jm:jm.map(m=>[m.day,m.h])})); });

H.done();
})();
