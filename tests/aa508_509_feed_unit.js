// 手機「動態」、她講自己的事的私訊、別人說起她：大三下＋暑假（AA_508）、大四上＋寒假（AA_509），企劃線 28f981438（AA_510 第 0-1 節更正 AA_509 三處：可昕第 1 則「第四年」、
// 晨希那句、芷若倫敦的貓叫「房東」；AA_508 和 4c3dc1491 一樣）；AA_506 第 9 節（691a26400）出遊途中貼的動態從回來起再留七天。HEROINE-LIFE-1028，
// 使用者 2026-10-28 01:2x「可攻略女主角 感覺都沒有自己的生活」，USER_WANTS X122★——不需要瀏覽器。
//   src/data/feed_y3s2.js、src/data/feed_y4s1.js（台詞）、src/feed3d.js（時差 FEED.loc、出遊途中、ytAunt／sisUS、stIf、私訊 if、選項 out、ladSet）、
//   src/data/heard_lines.js、src/heard3d.js（別人說起她；手機照時差）。
//   0  載得到、index.html 順序、七個學期都接上、則數、id 不重複；對稿兩個方向——①遊戲裡每一句都在稿裡（git show 28f981438，一字不差；照片的「你」那四張是這裡照稿的描述拼的，另外查）
//      ②稿的每一列動態（七位的 X-3 表）、表下面寫的另一個版本、語彤 8/21 私訊與選項、8/22 的 2D 短場旁白都在遊戲裡；稿上的日期和星期對得上；
//      AA_510 0-1 改的三處照新的（691a26400 的舊句子不在遊戲裡）；AA_509 0-1 改 AA_508 的四處在 4c3dc1491／28f981438 都改好了；白名單 AA_508、AA_509＝28f981438
//   1  階段、聯絡方式、時間、睡過補上、舊存檔（從讀檔那一天開始；第三輪的存檔接著出）
//   2  頻率：大三下＋暑假、大四上＋寒假各走一遍（七位都很熟）：每一則都出、一天不超過四則、每位連續七天不超過兩則；沛珊一個月最多一則（五則、四則各在不同月）；
//      可昕沒有交往（朋友）兩學期各四則都看得到
//   3  時差：以安在日本照當地 21:00（臺灣 20:00）；芷若在英國當地 22:07；學姊在美國臺灣 21:10＝當地 9/14 09:10、11/9 和 12/3 08:10（稿寫臺灣時間，照寫；回報請 AA 確認）；
//      玩家人在國外（日本路線、美國路線）遊戲時鐘是當地時間：照時差換成當地時間收（送到的那一刻和臺灣一樣）、別人說起她的手機訊息也一樣；在臺灣不變
//   4  語彤 8/21 私訊（AA_508 3-2 第 7 點）：閒聊 Y6-L8 選「我可以陪妳問。」才記 YT6_WITH（包住 STORY.ladPlay）；朋友以上、8/22 人在臺灣；三個選項；
//      「好。」→ 8/22 21:00 麵店的出遊 → 2D 短場旁白四句（noodle_table）→ 23:30 第 7 則「你在。你聽到了。」、朋友也看得到；「我那天不行。」→ 照表（很熟才有）
//   5  稿的測試建議（AA_508 第 8 節、AA_509 第 8 節裡手機的部分）：交往中的臺灣、美國路線以安每週日 T1（r2y3b3d.js）、沒有 T1 的週日照她的動態；以安第 4、7 則日本路線；
//      芷若 9/2 認識以上；子晴第 3 則兩個版本；以安 9/21 以後 12/3；芷若 12/10「房東」、子晴 12/26 的貓與 12/27 那則私訊；學姊美國路線三張照片；沛珊代課再回早餐店；可昕第 2 則在 10/20 以後
//   6  別人說起她（AA_508、AA_509 每位那一節最後）：稿上每一句不是在遊戲裡、就是在「沒做」的清單（pool_*、新來的工讀生、讀書會的學弟、阿凱）；閒聊前一句的 from／until、
//      手機的時間、群組、條件（麵店團群組、子晴的私訊要認識芷若、家族群組、予樂、「走啦」群組）
//   7  出遊途中貼的（AA_506 第 9 節）：C12 京都語言課（8/9～8/27）途中以安「京都：祐廷」那一則——途中時鐘是當地時間、記是哪一趟；回來那一刻起再留七天、可以回；
//      不是途中貼的照七天；卡住的那一趟最多留 60 天；舊存檔
//   8  舊存檔：YT6_WITH 是這一版才記的——之前就選過的沒有那則私訊（回報）；第三輪的存檔（items 沒有 tr）照七天
// 修改前（開發分支 76a171c87：沒有 feed_y3s2.js、feed_y4s1.js，feed3d.js、heard3d.js、heard_lines.js 是第三輪的；src、index.html、白名單換回 76a171c87 實際跑過）：
//   FAILED 見檔尾的紀錄（寫在 H.done 之前的註解）。修改後 ALL PASS。用法：node tests/aa508_509_feed_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const SHA='28f981438', OLD508='4c3dc1491', OLD509='691a26400';
const DOC={Y3S2:{spec:'docs/story_planning/AA_508_女主角自己的生活_大三下與暑假.md',suf:'f',yHi:2028,yLo:2028,aa:'AA_508'},
           Y4S1:{spec:'docs/story_planning/AA_509_女主角自己的生活_大四上與寒假.md',suf:'g',yHi:2028,yLo:2029,aa:'AA_509'}};
const loadG=(f,names)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
const errs=[];
for(const [f,n] of [['src/data/needed_msgs.js',['NEEDED_MSGS']],['src/data/feed_y1s1.js',['FEED_Y1S1']],['src/data/feed_y1s2.js',['FEED_Y1S2']],['src/data/feed_y2s1.js',['FEED_Y2S1']],
                    ['src/data/feed_y2s2.js',['FEED_Y2S2']],['src/data/feed_y3s1.js',['FEED_Y3S1']],['src/data/feed_y3s2.js',['FEED_Y3S2']],['src/data/feed_y4s1.js',['FEED_Y4S1']],['src/feed3d.js',['FEED']],
                    ['src/data/heard_lines.js',['HEARD_LINES']],['src/heard3d.js',['HEARD']],['src/data/r2y3b_events.js',['R2Y3B_EVENTS']],['src/r2y3b3d.js',['R2Y3B']]]){
  try{ if(fs.existsSync(path.join(H.ROOT,f))) loadG(f,n); else errs.push('沒有 '+f); }catch(e){ errs.push(f+'：'+(e&&e.message||e)); } }
const SET={Y3S2:typeof FEED_Y3S2!=='undefined'?FEED_Y3S2:null,Y4S1:typeof FEED_Y4S1!=='undefined'?FEED_Y4S1:null};
const sec=async(name,fn)=>{ try{ await fn(); }catch(e){ check(name+'（例外）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' | ').slice(0,240)); } };
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const show=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ return ''; } };
const doc={Y3S2:show(SHA,DOC.Y3S2.spec),Y4S1:show(SHA,DOC.Y4S1.spec)}, old={Y3S2:show(OLD508,DOC.Y3S2.spec),Y4S1:show(OLD509,DOC.Y4S1.spec)};

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
const HAS=()=>typeof FEED!=='undefined', HAS2=()=>HAS()&&!!SET.Y3S2&&!!SET.Y4S1;
const R=()=>HAS()?FEED.rec(H.G):{start:null,items:[],done:{},dm:{}};
const tickF=()=>{ if(HAS()) FEED.tick(H.G); };
const HT=()=>HAS()?FEED.html(H.G):'';
const T=(d,h)=>d*24+h;
const walk=(d,h,o)=>{ o=o||{}; const st=o.step||0.25, end=T(d,h); let t=T(H.G.day,H.G.hour); for(;t<end-1e-9;t+=st){ const dd=Math.floor(t/24); at(dd,+(t-dd*24).toFixed(4)); tickF(); if(o.heard&&typeof HEARD!=='undefined') HEARD.phone(H.G); PHONE.tick(H.G); }
  at(d,h); tickF(); if(o.heard&&typeof HEARD!=='undefined') HEARD.phone(H.G); PHONE.tick(H.G); };
const jump=(d,h)=>{ at(d,h); tickF(); PHONE.tick(H.G); };
const th=id=>(H.G.msgs||[]).filter(m=>PHONE.th(m)==='p:'+id);
const item=id=>R().items.find(i=>i.id===id)||null;
const dm=id=>(H.G.msgs||[]).find(m=>m.tag==='aa503_'+id&&m.ask)||null;
const tagged=id=>(H.G.msgs||[]).filter(m=>m.tag==='aa503_'+id).map(m=>m.text);
const answer=(id,k)=>{ const m=dm(id); if(!m) return null; const n=(H.G.msgs||[]).length; PHONE.answer(H.G,m.ask.id,k); return (H.G.msgs||[]).slice(n).filter(x=>x.from!=='player').map(x=>x.text); };
const SEVEN=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
const post=id=>{ for(const k in SET){ const S=SET[k]; const p=S&&S.posts.find(x=>x.id===id); if(p) return p; } return HAS()?FEED.post(id):null; };
const termOfPost=p=>{ for(const S of (HAS()?FEED.SETS():[])) if(S.posts.includes(p)) return S.term; return null; };
const twOf=id=>{ const p=post(id); return p?FEED.when(H.G||{flags:{}},p.t,termOfPost(p)):null; };   /* 稿上的時間（臺灣時間）*/
const hm=h=>{ const H0=Math.floor(h+1e-9), M=Math.round((h-H0)*60); return String(H0).padStart(2,'0')+':'+String(M).padStart(2,'0'); };
const DATING=id=>{ H.G.flags['dating_'+id]=true; if(typeof ROM!=='undefined'&&ROM.get){ const r=ROM.get(H.G,id); r.status='dating'; } };
const tzFmt=z=>new Intl.DateTimeFormat('en-GB',{timeZone:z,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
const utcOf=w=>{ const x=CALENDAR.dateOf(w.day), H0=Math.floor(w.h+1e-9), M=Math.round((w.h-H0)*60); return Date.UTC(x.y,x.m-1,x.d,H0,M)-8*3600e3; };   /* 遊戲時鐘＝臺灣時間（UTC+8）*/

/* ---------- 稿：每一列動態 ---------- */
const WHO={'1':['an','heroine_01'],'2':['zr','heroine_02'],'3':['yt','heroine_03'],'4':['zq','heroine_04'],'5':['sis','heroine_05'],'6':['ps','classmate_peishan'],'7':['kx','kexin']};
const WDS='一二三四五六日';
const rowsOf=(md)=>{ const out=[]; let sc=null; for(const l of md.split('\n')){ let m=/^### (\d)-(\d)\. /.exec(l); if(m){ sc=m[2]==='3'?m[1]:null; continue; } if(/^##? /.test(l)){ sc=null; continue; }
    if(!sc||!l.startsWith('|')||l.startsWith('|---')||l.startsWith('| #')) continue; const c=l.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim()); if(c.length<7) continue;
    out.push({sec:sc,n:c[0],when:c[1],st:c[2],pic:c[3],say:c[4],cm:c[5],dm:c[6]}); } return out; };
const qs=s=>[...s.matchAll(/「([^」]*)」/g)].map(m=>m[1]);
const whenOf=(term,w)=>{ const D=DOC[term]; let m=/^第 (\d+) 週週([一二三四五六日])（(\d+)\/(\d+)）(\d\d):(\d\d)/.exec(w); if(m){ const day=TDt(term,+m[1],WDS.indexOf(m[2])+1), x=CALENDAR.dateOf(day); return {day,h:+m[5]+(+m[6])/60,wdOk:x.m===+m[3]&&x.d===+m[4]}; }
  m=/^(\d+)\/(\d+)（([一二三四五六日])）(\d\d):(\d\d)/.exec(w); if(m){ const mo=+m[1], y=mo>=8?D.yHi:D.yLo, key=y+'-'+String(mo).padStart(2,'0')+'-'+String(+m[2]).padStart(2,'0'), day=DK(key);
    return {day,h:+m[4]+(+m[5])/60,wdOk:CALENDAR.dateOf(day).wd===WDS.indexOf(m[3])+1,key}; } return null; };
/* 表裡兩個版本的格子：「…／（回過「『存檔點』。」的）…」（子晴大三下第 3 則）。沒有標籤的那一半＝另一版 */
const YESL={'回過「『存檔點』。」的':'zqNamed'};
const splitV=cell=>{ if(!cell.includes('／')) return null; const o={went:null,yes:'',no:''};
  for(const p of cell.split('／')){ const m=/^(.*?)（([^）]*)）(.*)$/.exec(p); if(m&&YESL[m[2]]){ o.went=YESL[m[2]]; o.yes=m[3]; } else o.no=p; } return o; };
const zipV=(no,yes)=>{ const n=Math.max(no.length,yes.length), out=[]; for(let i=0;i<n;i++){ const a=no[i]==null?'':no[i], b=yes[i]==null?'':yes[i]; out.push(a===b?a:{yes:b,no:a}); } return out; };   /* 句數不同：少的那一版補 ''（那一句不出）*/
const C=x=>JSON.stringify(x,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((o,kk)=>(o[kk]=v[kk],o),{}):v);
const NOTE_WENT={an4f:'anJP',an7f:'anJP',yt7f:'ytAunt',sis1g:'sisUS',sis2g:'sisUS',sis3g:'sisUS'};   /* 另一個版本寫在表下面的說明（表裡只有一般的那一版）*/
const base=x=>Array.isArray(x)?x.map(base):(x&&typeof x==='object'?x.no:x);
const expectRow=(term,r)=>{ const [pre,id]=WHO[r.sec]; const e={id:pre+r.n+DOC[term].suf,who:id,st:r.st,say:r.say==='（沒有字）'?'':r.say,pic:r.pic}; let went;
  const vc=splitV(r.cm); if(vc){ went=vc.went; e.cm=zipV(qs(vc.no),qs(vc.yes)); } else e.cm=r.cm==='（不能留言）'?null:qs(r.cm);
  const vd=splitV(r.dm); if(vd){ went=vd.went; e.dm=zipV(qs(vd.no),qs(vd.yes)); } else e.dm=qs(r.dm);
  e.went=went||undefined; return e; };
/* 「她自己的事」（X-2）、動態表後面的說明（X-3）裡的私訊：「> 名字：句子」和選項（「- 「…」→」）；「> （…）」是旁白（2D 短場）*/
const dmQuotes=(md)=>{ const out={lines:[],opts:[],narr:[]}; let sc=null; for(const l of md.split('\n')){ let m=/^### (\d)-(\d)\. /.exec(l); if(m){ sc=(m[2]==='2'||m[2]==='3')?m[1]:null; continue; } if(/^##? /.test(l)){ sc=null; continue; } if(!sc) continue;
    if((m=/^\s*> （(.+)）\s*$/.exec(l))) out.narr.push('（'+m[1]+'）');
    else if((m=/^\s*> ([^：（\s][^：]*)：(.+)$/.exec(l))) out.lines.push([m[1],m[2].trim()]);
    else if((m=/^\s*- 「([^」]+)」→(?:「([^」]+)」)?/.exec(l))){ out.opts.push(m[1]); if(m[2]) out.lines.push(['(回)',m[2]]); } }
  return out; };
/* 照片的「你」那四張：稿上只寫了怎麼加（「三個名字，最後一個是你」「池邊多一雙拖鞋」「多一個碗」「對面多一台筆電」），字是照描述拼的 */
const COMPOSED={an4f:'三個名字，最後一個是你',sis1g:'池邊多一雙拖鞋',sis2g:'多一個碗',sis3g:'對面多一台筆電'};
const strs=S=>{ const L=[]; const add=x=>{ if(x==null||x==='') return; if(typeof x==='object'){ for(const k of ['no','yes']) if(x[k]!=null) add(x[k]); return; } L.push(x); };
  for(const p of S.posts){ if(typeof p.pic==='object'&&COMPOSED[p.id]) add(p.pic.no); else add(p.pic); add(p.say); for(const x of p.cm||[]) add(x); for(const x of p.dm||[]) add(x); }
  for(const q of S.dms){ for(const l of q.lines) add(l); if(q.ask) for(const o of q.ask.opts){ if(o.post!==false) add(o.t); for(const r of o.r||[]) add(r); } }
  for(const e of S.events||[]) for(const d of e.dialogue) if(d.text) add(d.text);
  return L; };

(async()=>{
/* ---------- 0 載入、對稿 ---------- */
await sec('0',async()=>{ const sc=f=>html.indexOf('<script src="'+f), i5=sc('src/data/feed_y3s1.js'), i6=sc('src/data/feed_y3s2.js'), i7=sc('src/data/feed_y4s1.js'), iF=sc('src/feed3d.js'), iB=sc('src/data/bbpack_events.js');
  check('0. 載得到；index.html：feed_y3s1.js → feed_y3s2.js → feed_y4s1.js → feed3d.js（在 bbpack_events.js 前面）',!errs.length&&i5>0&&i6>i5&&i7>i6&&iF>i7&&iB>iF,J(errs));
  check('0. FEED 七個學期都接上（SETS）',HAS()&&J(FEED.SETS().map(s=>s.term))===J(['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1']),HAS()?J(FEED.SETS().map(s=>s.term)):'沒有 FEED');
  const cnt=S=>S?SEVEN.map(id=>S.posts.filter(p=>p.who===id).length):null;
  check('0. 大三下：動態 41 則（以安 7、芷若 7、語彤 7、子晴 7、學姊 4、沛珊 5、可昕 4）、私訊 1 則、2D 短場 1 場；大四上：動態 33 則（6、5、5、5、4、4、4）、沒有私訊',
    HAS2()&&J(cnt(SET.Y3S2))===J([7,7,7,7,4,5,4])&&SET.Y3S2.dms.length===1&&(SET.Y3S2.events||[]).length===1&&J(cnt(SET.Y4S1))===J([6,5,5,5,4,4,4])&&SET.Y4S1.dms.length===0,J([cnt(SET.Y3S2),cnt(SET.Y4S1)]));
  const ids=[]; for(const S of (HAS()?FEED.SETS():[])){ for(const p of S.posts) ids.push('p:'+p.id); for(const q of S.dms) ids.push('d:'+q.id); }
  check('0. 七個學期的 id 都不重複（動態 44＋47＋37＋40＋41＋41＋33、私訊 10＋7＋3＋1＋1＋1＋0）',ids.length===306&&new Set(ids).size===ids.length,J([ids.length,ids.filter((x,i)=>ids.indexOf(x)!==i)]));
  for(const term of ['Y3S2','Y4S1']){ const S=SET[term], md=doc[term];
    if(!S||!md){ check('0. '+term+' 對稿（'+SHA+'）',false,!md?'git fetch origin claude/magical-albattani-bk7b4n':'沒有資料'); continue; }
    /* ① 遊戲 → 稿 */
    const L=strs(S), bad=L.filter(t=>!md.includes(t));
    check('0. '+term+' ① 遊戲裡每一句都在稿裡（'+SHA+'，一字不差；'+L.length+' 句）',L.length>=(term==='Y3S2'?200:160)&&!bad.length,J(bad.slice(0,8)));
    /* ② 稿 → 遊戲：動態表每一列（表下面才寫的另一版：比一般的那一版）*/
    const rows=rowsOf(md), wrong=[], wd=[], went={};
    for(const r of rows){ const e=expectRow(term,r), p=S.posts.find(x=>x.id===e.id), w=whenOf(term,r.when);
      if(!w||!w.wdOk) wd.push(r.sec+'-'+r.n+' '+r.when); if(p&&p.went) went[p.id]=p.went;
      const got=p&&HAS()?FEED.when(H.G||{flags:{}},p.t,term):null, nw=p&&NOTE_WENT[p.id];
      const same=!!p&&p.who===e.who&&p.st===e.st&&C(nw?base(p.pic):p.pic)===C(e.pic)&&p.say===e.say&&C(nw?base(p.cm):p.cm)===C(e.cm)&&C(nw?base(p.dm):p.dm)===C(e.dm)
        &&(nw?p.went===nw:p.went===e.went)&&!!got&&!!w&&got.day===w.day&&Math.abs(got.h-w.h)<1e-6;
      if(!same) wrong.push(e.id+(p?'':'（沒有）')); }
    const wantW=term==='Y3S2'?{an4f:'anJP',an7f:'anJP',yt7f:'ytAunt',zq3f:'zqNamed'}:{sis1g:'sisUS',sis2g:'sisUS',sis3g:'sisUS'};
    check('0. '+term+' ② 稿的動態表 '+rows.length+' 列，每一列都在遊戲裡（時間、階段、照片、她的一句、留言、私訊問一字不差；兩個版本的列：'+J(went)+'）',rows.length===S.posts.length&&!wrong.length&&C(went)===C(wantW),J(wrong.slice(0,10)));
    check('0. '+term+' 稿上的日期和星期對得上（'+rows.length+' 列）',!wd.length,J(wd));
    /* ② 稿 → 遊戲：私訊、2D 短場的旁白 */
    const Q=dmQuotes(md), all=new Set(L), optT=new Set(); for(const q of S.dms) if(q.ask) for(const o of q.ask.opts) optT.add(o.t);
    const ev=(S.events||[])[0], evT=ev?ev.dialogue.filter(d=>d.text).map(d=>d.text):[];
    const missL=Q.lines.filter(([w,t])=>!all.has(t)), missO=Q.opts.filter(t=>!optT.has(t));
    check('0. '+term+' ② 稿的私訊 '+Q.lines.length+' 句、選項 '+Q.opts.length+' 個、短場旁白 '+Q.narr.length+' 句都在遊戲裡',
      (term==='Y3S2'?Q.lines.length===5&&Q.opts.length===2&&Q.narr.length===4&&J(evT)===J(Q.narr):Q.lines.length===0&&Q.opts.length===0&&Q.narr.length===0)&&!missL.length&&!missO.length,J({n:[Q.lines.length,Q.opts.length,Q.narr.length],missL,missO,evT})); }
  /* 表下面寫的另一版（日本路線、陪她去的、美國路線）*/
  const P=id=>post(id)||{}, m8=doc.Y3S2||'', m9=doc.Y4S1||'';
  const v8=[[P('an4f').pic&&P('an4f').pic.yes,'三個名字，最後一個是你'],[P('an7f').dm&&P('an7f').dm[1]&&P('an7f').dm[1].yes,'留著。你的名字在最下面。'],[P('yt7f').dm&&P('yt7f').dm[1]&&P('yt7f').dm[1].yes,'你在。你聽到了。']];
  check('0. AA_508 表下面的另一版：以安第 4 則日本路線照片（三個名字，最後一個是你）、第 7 則「留著。你的名字在最下面。」、語彤第 7 則陪她去的「你在。你聽到了。」、也看得到（stIf）',
    m8.includes('第 4 則照片是三個名字，最後一個是你')&&m8.includes('第 7 則私訊問的回答改「留著。你的名字在最下面。」')&&m8.includes('陪她去的玩家也看得到，私訊問的回答改「你在。你聽到了。」')
    &&v8[0][0]==='手帳新的一頁「日本　和誰去」，下面三個名字，最後一個是你'&&v8[1][0]===v8[1][1]&&v8[2][0]===v8[2][1]&&P('yt7f').stIf==='ytAunt',J(v8.map(x=>x[0])));
  const S9=['sis1g','sis2g','sis3g'].map(id=>P(id).pic||{});
  check('0. AA_509 學姊第 1～3 則美國路線照片加「你」：照稿的「池邊多一雙拖鞋」「多一個碗」「對面多一台筆電」，接在一般那張後面、寫「是你的」',
    m9.includes('第 1 則池邊多一雙拖鞋，第 2 則多一個碗，第 3 則對面多一台筆電')&&['sis1g','sis2g','sis3g'].every((id,i)=>S9[i].yes===S9[i].no+'，'+COMPOSED[id]+'——是你的'),J(S9));
  /* AA_510 第 0-1 節（28f981438）改的 AA_509 三處；691a26400 的舊句子不在遊戲裡 */
  const src=['src/data/feed_y3s2.js','src/data/feed_y4s1.js','src/data/heard_lines.js'].map(f=>fs.existsSync(path.join(H.ROOT,f))?fs.readFileSync(path.join(H.ROOT,f),'utf8'):'').join('\n');
  const GONE9=['不知道。我叫牠所長。','新住處門口，兩雙鞋','搬到山下了。','不用爬山了？','不用。予樂開心到哭。','子晴學姊上班以後，社課一次都沒來。可是她每個月寄一條新的導線給社團。'];
  check('0. AA_510 0-1 改的三處（28f981438）：芷若第 3 則「我叫牠房東。……」、可昕第 1 則「第四年。」宿舍窗外的山；'+OLD509+' 的舊句子（所長、搬到山下、晨希那句）不在遊戲裡',
    !!P('zr3g').dm&&P('zr3g').dm[1]==='不知道。我叫牠房東。牠坐在長椅上的樣子，像長椅是牠的。'&&P('kx1g').say==='第四年。'&&P('kx1g').pic==='宿舍窗外的山，和大一那張同一個角度'
    &&(old.Y4S1||'').length>2000&&GONE9.every(t=>old.Y4S1.includes(t)&&!m9.includes(t)&&!src.includes(t)),J(GONE9.filter(t=>src.includes(t)||!(old.Y4S1||'').includes(t))));
  /* AA_509 0-1 改 AA_508 的四處：4c3dc1491 就改好了（28f981438 的 AA_508 和 4c3dc1491 一字不差）*/
  const four=['宿舍的書桌，一個日本帶回來的便當盒','還沒。想留到開學，大家都在的時候。','（阿姨先說「沒什麼好講的」。然後一直講到很晚。）','……不能說。她說要先給我媽聽。','謝謝。……公園那隻貓，幫我看一下。'];
  check('0. AA_509 0-1 改 AA_508 的四處（以安第 6 則、語彤短場與第 7 則、芷若第 7 則、學姊章數）在 '+OLD508+' 就改好了、28f981438 的 AA_508 一樣；遊戲裡照新的',
    !!old.Y3S2&&old.Y3S2===doc.Y3S2&&four.every(t=>m8.includes(t)&&src.includes(t))&&!m8.includes('2029 年還在寫第三章'),J(four.filter(t=>!src.includes(t))));
  const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files, sh=k=>(allow.find(e=>e.path.indexOf('docs/story_planning/'+k+'_')===0)||{}).sha;
  check('0. 白名單：AA_508、AA_509＝28f981438（AA_510 0-1 更正）；AA_506＝691a26400（第 9 節出遊途中）',sh('AA_508')===SHA&&sh('AA_509')===SHA&&sh('AA_506')==='691a26400',J({AA_506:sh('AA_506'),AA_508:sh('AA_508'),AA_509:sh('AA_509')}));
  const ev=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id==='ev_aa508_yt_aunt'):null;
  check('0. 語彤 8/22 的 2D 短場接進 STORY_EVENTS（出遊事件、深色底、一小時、第一格「阿鳳麵店・長桌」noodle_table）',!!ev&&ev.trigger==='outing'&&ev.background==='dark'&&ev.hours===1&&ev.dialogue[0].bg==='noodle_table'&&ev.dialogue.slice(1).every(d=>d.speaker===null),J(ev&&ev.dialogue[0])); });

/* ---------- 1 階段、聯絡方式、時間、舊存檔 ---------- */
await sec('1',async()=>{ if(!HAS2()){ check('1. 動態',false,'沒有資料'); return; }
  const W2WED=TDt('Y3S2',2,3); fresh(W2WED,20); who('heroine_01','ACQ'); walk(W2WED,21.48); const b0=item('an1f'); walk(W2WED,21.5);
  check('1. 以安大三下第 1 則（第 2 週週三 21:30，認識）：21:29 還沒有、21:30 有「第一項。」',!b0&&!!item('an1f')&&item('an1f').day===W2WED&&Math.abs(item('an1f').h-21.5)<0.01&&HT().includes('第一項。'),J(item('an1f')));
  walk(DK('2028-05-07'),20.1,{step:0.5}); check('1. 以安第 3 則（5/7，朋友）只認識：沒有（x:stage），畫面上沒有',R().done.an3f==='x:stage'&&!HT().includes('研討課。'),J(R().done.an3f));
  fresh(TDt('Y3S2',2,4),20); rel('heroine_03','CLOSE'); walk(TDt('Y3S2',2,4),21.6); check('1. 語彤很熟、沒有聯絡方式：大三下第 1 則不出（x:contact）',R().done.yt1f==='x:contact'&&!item('yt1f'),J(R().done.yt1f));
  fresh(W2WED-1,23); who('heroine_04','ACQ'); tickF(); jump(W2WED,8);
  const z=item('zq1f'); check('1. 子晴大三下第 1 則（第 2 週週三 01:00）：週二 23:00 睡到週三 08:00，補在 01:00',!!z&&z.day===W2WED&&Math.abs(z.h-1)<0.01,J(z));
  /* 舊存檔：第一次讀檔在大四上第 2 週週三 22:00（FEED 還沒建立）*/
  const W2W=TDt('Y4S1',2,3); fresh(W2W,22); who('heroine_01','ACQ'); who('heroine_03','ACQ'); tickF();
  check('1. 舊存檔第一次讀（大四上第 2 週週三 22:00）：那一天 21:30 以安第 1 則補上；前一天（週二 21:30）語彤第 1 則不補（old）',R().start===W2W&&!!item('an1g')&&R().done.yt1g==='old',J({start:R().start,an1g:R().done.an1g,yt1g:R().done.yt1g}));
  /* 第三輪的存檔（FEED 只有前五個學期的紀錄）：新的兩份照時間接著出 */
  fresh(DK('2028-02-20'),12); who('heroine_02','ACQ'); H.G.flags.FEED={start:DK('2025-09-01'),items:[],done:{zr8e:'p',kx4e:'p'},dm:{sis_rest:'sent'},seen:-1e9}; walk(TDt('Y3S2',3,1),22.2,{step:0.5});
  check('1. 第三輪的舊存檔（FEED 只有前五個學期的紀錄）：大三下芷若第 1 則照樣出',!!item('zr1f')&&R().done.zr8e==='p'&&R().dm.sis_rest==='sent',J(R().done)); });

/* ---------- 2 頻率：走一遍 ---------- */
const runAll=(from,to,flags,setup)=>{ fresh(from,0,flags); for(const id of SEVEN) who(id,'CLOSE'); if(setup) setup(); const log=new Map();
  for(let t=T(from,0);t<=T(to,23.5);t+=0.5){ const dd=Math.floor(t/24); at(dd,t-dd*24); tickF(); PHONE.tick(H.G); for(const i of R().items) if(!log.has(i.id)) log.set(i.id,i); }
  const L=[...log.values()], byDay={}; for(const i of L) byDay[i.day]=(byDay[i.day]||0)+1;
  let worst=0, wid=''; for(const i of L){ if(!FEED.isHeroine(i.who)) continue; const n=L.filter(j=>j.who===i.who&&T(j.day,j.h)<=T(i.day,i.h)&&T(i.day,i.h)-T(j.day,j.h)<7*24).length; if(n>worst){ worst=n; wid=i.id; } }
  return {log,L,maxDay:Math.max(0,...Object.values(byDay)),worst,wid}; };
await sec('2',async()=>{ if(!HAS2()){ check('2. 走一遍',false,'沒有資料'); return; }
  let r=runAll(DK('2028-02-17'),DK('2028-09-03'));
  let miss=SET.Y3S2.posts.map(p=>p.id).filter(id=>!r.log.has(id));
  check('2. 大三下＋暑假走一遍（七位都很熟、沒有交往、臺灣路線）：41 則都出',!miss.length,J({miss,done:miss.map(id=>R().done[id])}));
  check('2. 大三下＋暑假：一天不超過四則（最多 '+r.maxDay+'）、每位連續七天不超過兩則（最多 '+r.worst+'）',r.maxDay<=4&&r.worst<=2,r.wid);
  const pm=r.L.filter(i=>i.who==='classmate_peishan').map(i=>{ const x=CALENDAR.dateOf(i.day); return x.y+'-'+x.m; });
  check('2. AA_508 6-3：沛珊大三下五則，一個月一則（3、4、5、6、8 月）',J(pm)===J(['2028-3','2028-4','2028-5','2028-6','2028-8'])&&FEED_Y3S2.capMonth&&FEED_Y3S2.capMonth.classmate_peishan===1,J(pm));
  check('2. 臺灣路線、沒有陪語彤去、沒回過 zq_name：以安第 4、7 則、語彤第 7 則、子晴第 3 則都是一般那一版',['an4f','an7f','yt7f','zq3f'].every(id=>r.log.get(id)&&r.log.get(id).v==='no'),J(['an4f','an7f','yt7f','zq3f'].map(id=>r.log.get(id)&&r.log.get(id).v)));
  r=runAll(DK('2028-09-04'),DK('2029-02-18'));
  miss=SET.Y4S1.posts.map(p=>p.id).filter(id=>!r.log.has(id));
  check('2. 大四上＋寒假走一遍：33 則都出',!miss.length,J({miss,done:miss.map(id=>R().done[id])}));
  check('2. 大四上＋寒假：一天不超過四則（最多 '+r.maxDay+'）、每位連續七天不超過兩則（最多 '+r.worst+'）',r.maxDay<=4&&r.worst<=2,r.wid);
  const pm2=r.L.filter(i=>i.who==='classmate_peishan').map(i=>{ const x=CALENDAR.dateOf(i.day); return x.y+'-'+x.m; });
  check('2. AA_509 6-3：沛珊大四上四則，一個月一則（9、11、12、1 月）',J(pm2)===J(['2028-9','2028-11','2028-12','2029-1'])&&FEED_Y4S1.capMonth&&FEED_Y4S1.capMonth.classmate_peishan===1,J(pm2));
  /* 一個月最多一則：同一個月多一則就不出（x:month）；拿掉 capMonth 就會出 */
  const fake={id:'t_ps_sep',who:'classmate_peishan',t:'2028-09-27 20:00',st:'認識',pic:'測試',say:'測試',cm:null,dm:['a','b']};
  const tryFake=(cap)=>{ FEED_Y4S1.posts.push(fake); const c0=FEED_Y4S1.capMonth; if(!cap) delete FEED_Y4S1.capMonth;
    try{ fresh(DK('2028-09-20'),12); who('classmate_peishan','CLOSE'); walk(DK('2028-09-28'),12,{step:0.5}); return {ps1g:R().done.ps1g,fake:R().done.t_ps_sep}; }
    finally{ FEED_Y4S1.posts.pop(); FEED_Y4S1.capMonth=c0; } };
  const a=tryFake(true), b=tryFake(false);
  check('2. 沛珊同一個月第二則（測試用 9/27）：9/24 那則先出、9/27 那則不出（x:month）；拿掉 capMonth 就出',a.ps1g==='p'&&a.fake==='x:month'&&b.fake==='p',J({a,b}));
  /* 可昕沒有交往（朋友）：兩學期各四則都看得到（AA_508 第 8 節）*/
  const kx=(from,to)=>{ fresh(from,0); who('kexin','FRIEND'); const seen=new Set(); for(let d=from;d<=to;d++){ at(d,23.9); tickF(); for(const i of R().items) seen.add(i.id); } return seen; };
  const s1=kx(DK('2028-02-21'),DK('2028-09-03')), s2=kx(DK('2028-09-04'),DK('2029-02-18'));
  check('2. 可昕沒有交往、朋友：大三下四則（牆、邵鈞、文章、予樂來高雄）、大四上四則（第四年、國考、旁聽、芭樂）都看得到',['kx1f','kx2f','kx3f','kx4f'].every(id=>s1.has(id))&&['kx1g','kx2g','kx3g','kx4g'].every(id=>s2.has(id)),J([[...s1],[...s2]])); });

/* ---------- 3 時差 ---------- */
await sec('3',async()=>{ if(!HAS2()){ check('3. 時差',false,'沒有資料'); return; }
  H.fresh('2028-03-01',12,'dorm');
  const loc=(z,ids)=>ids.map(id=>{ const w=twOf(id); return {id,tw:CALENDAR.dateOf(w.day).m+'/'+CALENDAR.dateOf(w.day).d+' '+hm(w.h),loc:tzFmt(z).format(new Date(utcOf(w)))}; });
  const jp=loc('Asia/Tokyo',['an2f','an3f','an4f','an5f']);
  check('3. 以安在日本的四則（4/16～7/23）：日本當地都是 21:00、臺灣 20:00（稿「她的動態是在日本當地 21:00 貼（臺灣 20:00）」）',jp.every(x=>/, 21:00$/.test(x.loc)&&/ 20:00$/.test(x.tw)),J(jp));
  const uk=loc('Europe/London',['zr1g','zr2g','zr3g','zr4g','zr5g']);
  check('3. 芷若在英國的五則（9/17～2/18）：倫敦當地都是 22:07；臺灣 9/17 05:07（夏令）、其他 06:07（倫敦是前一天）',uk.every(x=>/, 22:07$/.test(x.loc))&&/ 05:07$/.test(uk[0].tw)&&uk.slice(1).every(x=>/ 06:07$/.test(x.tw)),J(uk));
  const us=loc('America/Indiana/Indianapolis',['sis1g','sis2g','sis3g']);
  check('3. 學姊在美國的三則：稿寫臺灣 21:10＝印第安納當地 9/14 09:10（夏令）、11/9 和 12/3 08:10（11/5 起冬令）——照稿的臺灣時間（9/14 和後兩則差一小時，回報請 AA 確認）',
    us.every(x=>/ 21:10$/.test(x.tw))&&/14\/09\/2028, 09:10$/.test(us[0].loc)&&/09\/11\/2028, 08:10$/.test(us[1].loc)&&/03\/12\/2028, 08:10$/.test(us[2].loc),J(us));
  check('3. STORY.tzOffset（和遊戲裡其他的換算同一套）：日本路線 4/16＝+1；美國路線 9/14＝−12、11/9＝−13；臺灣路線＝0',(()=>{ const g=r=>Object.assign({},H.G,{flags:Object.assign({},H.G.flags,r?{EXCHANGE_ROUTE:r}:{})});
      return STORY.tzOffset(g('JP'),DK('2028-04-16'))===1&&STORY.tzOffset(g('US'),DK('2028-09-14'))===-12&&STORY.tzOffset(g('US'),DK('2028-11-09'))===-13&&STORY.tzOffset(g(null),DK('2028-09-14'))===0; })());
  /* 玩家人在國外：遊戲時鐘是當地時間 */
  const D416=DK('2028-04-16'); fresh(D416,19.5,{EXCHANGE_ROUTE:'JP'}); who('heroine_01','ACQ'); walk(D416,20.5); const j0=item('an2f'); walk(D416,20.98); const j1=item('an2f'); walk(D416,21.01);
  const j2=item('an2f');
  check('3. 日本路線、人在日本（時鐘是日本時間）：4/16 以安第 2 則在當地 21:00 才出（20:59 還沒有）、手機上寫 21:00',!j0&&!j1&&!!j2&&j2.day===D416&&Math.abs(j2.h-21)<0.01&&HT().includes('今天 21:00'),J(j2));
  fresh(D416,19.5); who('heroine_01','ACQ'); walk(D416,20.01); check('3. 臺灣路線同一則：臺灣 20:00 出（不變）',!!item('an2f')&&Math.abs(item('an2f').h-20)<0.01,J(item('an2f')));
  const D509=DK('2028-05-09'); fresh(D509,20.5,{EXCHANGE_ROUTE:'JP'}); who('heroine_03','FRIEND'); walk(D509,21.5); const y0=item('yt3f'); walk(D509,22.01);
  check('3. 日本路線、人在日本：在臺灣的語彤 5/9 21:00 貼的，當地 22:00 收到',!y0&&!!item('yt3f')&&Math.abs(item('yt3f').h-22)<0.01,J(item('yt3f')));
  const D914=DK('2028-09-14'); fresh(D914,8,{EXCHANGE_ROUTE:'US'}); who('heroine_05','FRIEND'); walk(D914,9.1); const u0=item('sis1g'); walk(D914,9.2); const u1=item('sis1g'), hu=HT();
  check('3. 美國路線、人在美國（時鐘是美東時間）：學姊 9/14 第 1 則（臺灣 21:10）在當地 09:10 出、照片是美國路線那一版（池邊多一雙拖鞋——是你的）',!u0&&!!u1&&u1.day===D914&&Math.abs(u1.h-(9+10/60))<0.01&&u1.v==='yes'&&hu.includes('池邊多一雙拖鞋——是你的'),J(u1));
  const D1109=DK('2028-11-09'); fresh(D1109,7.5,{EXCHANGE_ROUTE:'US'}); who('heroine_05','FRIEND'); walk(D1109,8.2);
  check('3. 美國路線 11/9（11/5 起冬令 −13）：第 2 則在當地 08:10 出',!!item('sis2g')&&item('sis2g').day===D1109&&Math.abs(item('sis2g').h-(8+10/60))<0.01,J(item('sis2g')));
  const D916=DK('2028-09-16'); fresh(D916,16,{EXCHANGE_ROUTE:'US'}); who('heroine_02','ACQ'); walk(D916,17.2);
  check('3. 美國路線、人在美國：在英國的芷若 9/17 05:07（臺灣）＝當地 9/16 17:07 收到',!!item('zr1g')&&item('zr1g').day===D916&&Math.abs(item('zr1g').h-(17+7/60))<0.01,J(item('zr1g')));
  fresh(D914,20,{}); who('heroine_05','FRIEND'); walk(D914,21.2); check('3. 臺灣路線：學姊第 1 則照臺灣 21:10、一般那張照片',!!item('sis1g')&&Math.abs(item('sis1g').h-(21+10/60))<0.01&&item('sis1g').v==='no'&&HT().includes('美國學校的室內游泳池，很長')&&!HT().includes('是你的'),J(item('sis1g')));
  /* 別人說起她的手機訊息也照時差 */
  /* PHONE.tick：晚 15 分鐘以內送到的照「現在」標時間，所以看「22:18 還沒有、22:24 有」*/
  const D45=DK('2028-04-05'); fresh(D45,21,{EXCHANGE_ROUTE:'JP'}); PHONE.join(H.G,'noodle_team','麵店團'); walk(D45,22.3,{heard:true,step:0.1}); const a0=(H.G.msgs||[]).filter(m=>m.tag==='heard_h508_yu_an').length; walk(D45,22.4,{heard:true,step:0.1});
  const am=(H.G.msgs||[]).find(m=>m.tag==='heard_h508_yu_an');
  check('3. 別人說起她：Alison 4/5 21:20（臺灣）的麵店團群組，日本路線人在日本＝當地 22:20 才收到（22:18 還沒有）',a0===0&&!!am&&am.day===D45&&am.h>=22+20/60-1e-6&&am.h<=22.41,J(am&&[am.day,am.h])); });

/* ---------- 4 語彤 8/21 私訊、8/22 的 2D 短場 ---------- */
await sec('4',async()=>{ if(!HAS2()){ check('4. 私訊',false,'沒有資料'); return; }
  /* 閒聊階梯 Y6-L8：選「我可以陪妳問。」才記 YT6_WITH */
  const st=((((LADDER.byTerm||{}).Y3S2||{}).heroine_03||{}).steps||[]).find(s=>s.id==='Y6-L8');
  const lad=async(pick)=>{ fresh(DK('2028-05-29'),17); who('heroine_03','FRIEND'); H.said=[]; H.picks=[pick]; await STORY.ladPlay(GM,{name:'語彤',charId:'heroine_03'},'heroine_03',st); return {f:H.G.flags.YT6_WITH,said:H.said.map(s=>s.t),mem:SOCIAL.has('heroine_03','YT6_ASK_AUNT')}; };
  const l1=await lad('我可以陪妳問'), l2=await lad('這次她會說');
  check('4. 閒聊 Y6-L8 選「我可以陪妳問。」→ YT6_WITH；選「這次她會說。」不記；兩個都照原本說完（她的回覆、這一層的記憶 YT6_ASK_AUNT）',!!st&&l1.f===true&&l1.said.includes('……嗯。你坐旁邊就好。不要說話。阿姨看到你會想煮麵。')&&l1.mem&&l2.f===undefined&&l2.said.includes('……不知道。可是這次我會等她說完。')&&l2.mem,J({l1,l2}));
  fresh(DK('2028-05-29'),17); who('heroine_03','FRIEND'); const st7=(LADDER.byTerm.Y3S2.heroine_03.steps||[]).find(s=>s.id!=='Y6-L8'&&s.choices&&s.choices.length); H.picks=[0]; const ok7=await STORY.ladPlay(GM,{name:'語彤',charId:'heroine_03'},'heroine_03',st7);
  check('4. 別的層照舊（不經過記號）',ok7===true&&H.G.flags.YT6_WITH===undefined);
  const D821=DK('2028-08-21'), D822=D821+1;
  const setup=(lv,flags,more)=>{ fresh(D821,19,Object.assign({YT6_WITH:true},flags||{})); who('heroine_03',lv); if(more) more(); };
  setup('FRIEND'); walk(D821,19.98); const b=tagged('yt_ask_aunt').length; walk(D821,20.02); const m=dm('yt_ask_aunt');
  check('4. 8/21 20:00（朋友、選過 Y6-L8「我可以陪妳問。」）：「明天晚上，打烊以後。」「要問阿姨。」「你說要坐旁邊。」；19:59 還沒有；三個選項、回到 8/22 21:00',
    b===0&&J(tagged('yt_ask_aunt'))===J(['明天晚上，打烊以後。','要問阿姨。','你說要坐旁邊。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','我那天不行。','（不回）'])&&m.ask.until===T(D822,21),J(m&&m.ask));
  /* 「好。」→ 出遊 → 2D 短場 → 23:30 第 7 則 */
  const got=answer('yt_ask_aunt',0), q=OUT.get(H.G,'aa508_yt_aunt');
  check('4. 選「好。」→ 她回「九點。不要說話。」、YT_AUNT_DM ok；排出遊 8/22 21:00 麵店（走過去約 10 分鐘）',J(got)===J(['九點。不要說話。'])&&H.G.flags.YT_AUNT_DM==='ok'&&!!q&&q.day===D822&&q.h===21&&q.place==='麵店'&&q.ev==='ev_aa508_yt_aunt'&&q.state==='planned',J(q));
  at(D822,20.8); H.said=[]; H.bgs=[]; await OUT.go(GM,q); const nar=H.said.filter(s=>s.who===null).map(s=>s.t);
  check('4. 8/22 21:00 麵店的 2D 短場：旁白四句照稿（「（店裡的燈只開一半。……）」…「（講完，阿姨站起來：「餓不餓？」）」）、底圖 noodle_table；演完 22:00',
    J(nar.filter(t=>/^（/.test(t)).slice(0,4))===J(['（店裡的燈只開一半。阿姨坐在長桌的另一頭，語彤把錄音筆放在中間。）','（阿姨先說「沒什麼好講的」。然後一直講到很晚。）','（你一句話都沒說。語彤也是。）','（講完，阿姨站起來：「餓不餓？」）'])
    &&q.state==='done'&&H.G.day===D822&&Math.abs(H.G.hour-22)<0.01&&H.bgs.some(x=>x&&x.image&&/noodle_table/.test(x.image)),J({nar,state:q.state,h:H.G.hour,bgs:H.bgs}));
  walk(D822,23.6); const it7=item('yt7f'); FEED.respond(H.G,'yt7f','dm'); const r7=th('heroine_03').slice(-2).map(x=>x.text);
  check('4. 23:30 第 7 則（錄音筆「阿姨」）：陪她去的＝只是朋友也看得到；私訊問「說了什麼？」→「你在。你聽到了。」',!!it7&&it7.v==='yes'&&J(r7)===J(['說了什麼？','你在。你聽到了。']),J({it7,r7}));
  /* 「我那天不行。」*/
  setup('CLOSE'); walk(D821,20.1); const g2=answer('yt_ask_aunt',1); walk(D822,23.6); const i2=item('yt7f'); FEED.respond(H.G,'yt7f','dm'); const r2=th('heroine_03').slice(-2).map(x=>x.text);
  check('4. 選「我那天不行。」→「嗯。我自己問。」、沒有出遊；很熟的照表看得到第 7 則，私訊問的回答「……不能說。她說要先給我媽聽。」',J(g2)===J(['嗯。我自己問。'])&&H.G.flags.YT_AUNT_DM==='cant'&&!OUT.get(H.G,'aa508_yt_aunt')&&!!i2&&i2.v==='no'&&J(r2)===J(['說了什麼？','……不能說。她說要先給我媽聽。']),J({g2,r2}));
  setup('FRIEND'); walk(D821,20.1); answer('yt_ask_aunt',1); walk(D822,23.6); check('4. 只是朋友、沒有陪她去：第 7 則不出（x:stage）',R().done.yt7f==='x:stage',J(R().done.yt7f));
  setup('FRIEND'); walk(D821,20.1); const n0=(H.G.msgs||[]).length; answer('yt_ask_aunt',2); const n1=(H.G.msgs||[]).length;
  check('4. 選「（不回）」：不替你傳、她不回、YT_AUNT_DM none',n1===n0&&H.G.flags.YT_AUNT_DM==='none'&&!OUT.get(H.G,'aa508_yt_aunt'));
  /* 答應了沒去 */
  setup('FRIEND'); walk(D821,20.1); answer('yt_ask_aunt',0); OUT.get(H.G,'aa508_yt_aunt').state='missed'; walk(D822,23.6);
  check('4. 答應了沒去（出遊 missed）：不算陪她去——只是朋友沒有第 7 則',R().done.yt7f==='x:stage',J(R().done.yt7f));
  /* 條件 */
  setup('FRIEND',{YT6_WITH:false}); walk(D821,21); check('4. 沒選過 Y6-L8「我可以陪妳問。」：沒有（x:need）',!tagged('yt_ask_aunt').length&&R().dm.yt_ask_aunt==='x:need',J(R().dm.yt_ask_aunt));
  setup('FAM'); walk(D821,21); check('4. 只有點熟：沒有（x:stage）',!tagged('yt_ask_aunt').length&&R().dm.yt_ask_aunt==='x:stage',J(R().dm.yt_ask_aunt));
  setup('FRIEND',{EXCHANGE_ROUTE:'US'}); walk(D821,21); check('4. 美國路線（8/2 起人在美國）：沒有（x:if，8/22 坐不到她旁邊）',!tagged('yt_ask_aunt').length&&R().dm.yt_ask_aunt==='x:if',J(R().dm.yt_ask_aunt));
  setup('FRIEND',{},()=>{ VAC.rec(H.G).reg['C12@Y3']='yes'; }); walk(D821,21);
  check('4. 8/22 報了出國的寒暑假活動（C12 京都語言課 2028-08-09～08-27）：沒有（x:if）',typeof VAC.abroadOn==='function'&&!tagged('yt_ask_aunt').length&&R().dm.yt_ask_aunt==='x:if',J(R().dm.yt_ask_aunt));
  check('4. 日本路線（8/5 已經回國）：有',(()=>{ setup('FRIEND',{EXCHANGE_ROUTE:'JP'}); walk(D821,20.1); return tagged('yt_ask_aunt').length===3; })());
  setup('CLOSE'); delete H.G.contacts.heroine_03; walk(D821,21); check('4. 沒有語彤的聯絡方式：沒有（x:contact）',!tagged('yt_ask_aunt').length&&R().dm.yt_ask_aunt==='x:contact',J(R().dm.yt_ask_aunt)); });

/* ---------- 5 稿的測試建議 ---------- */
await sec('5',async()=>{ if(!HAS2()){ check('5. 稿的測試建議',false,'沒有資料'); return; }
  /* 交往中、臺灣路線：3/26～8/4 每週日以安的 T1（r2y3b3d.js S.abOnDating）；她的動態照表出（沒有 T1 的週日也一樣）*/
  const weeks=(route)=>{ fresh(DK('2028-03-26'),19.9,route?{EXCHANGE_ROUTE:route}:{}); who('heroine_01','CLOSE'); DATING('heroine_01'); const wk=[], fd={}; let v4=null;
    for(let k=0;k<19;k++){ const d=DK('2028-03-26')+7*k; if(d>=DK('2028-08-05')) break; for(const h of [19.9,20.05,21.05,22.5]){ at(d,h); STORY.phoneRules(GM); PHONE.tick(H.G); }
      if(PHONE.sent(H.G,'y3_ab_w'+(k+1))) wk.push(k+1); for(const i of R().items) if(i.who==='heroine_01'&&i.day===d&&fd[i.id]==null){ fd[i.id]=k+1; if(i.id==='an4f') v4=i.v; } } return {wk,fd,v4}; };
  const tw=weeks(null), us=weeks('US'), jp=weeks('JP');
  const empty=[...Array(19).keys()].map(k=>k+1).filter(k=>!tw.wk.includes(k)&&DK('2028-03-26')+7*(k-1)<DK('2028-08-05'));
  check('5. AA_508 0-2 第 1 點：交往中（臺灣路線）每週日 T1（第 1～8、11、18 週，r2y3b3d.js）；她的動態第 2～5 則照表在那幾個週日出（4/16 第 4 週、5/7 第 7 週、6/18 第 13 週＝沒有 T1 的週日、7/23 第 18 週）',
    J(tw.wk)===J([1,2,3,4,5,6,7,8,11,18])&&J(tw.fd)===J({an2f:4,an3f:7,an4f:13,an5f:18})&&empty.includes(13)&&tw.v4==='no',J({tw,empty}));
  check('5. 美國路線交往中一樣；日本路線（她和你在日本）沒有 T1，動態照樣出（第 4 則是三個名字那一版）',J(us.wk)===J(tw.wk)&&J(us.fd)===J(tw.fd)&&jp.wk.length===0&&J(jp.fd)===J(tw.fd)&&jp.v4==='yes',J({us,jp}));
  /* 以安第 4 則日本路線三個名字、第 7 則 */
  const D618=DK('2028-06-18'); fresh(D618,20.5,{EXCHANGE_ROUTE:'JP'}); who('heroine_01','FRIEND'); walk(D618,21.1); const h4=HT();
  fresh(D618,19.5); who('heroine_01','FRIEND'); walk(D618,20.1); const h4t=HT();
  check('5. 以安第 4 則（6/18）：日本路線＝「下面三個名字，最後一個是你」（當地 21:00）；臺灣路線＝「下面兩個日文名字」；她的一句、留言照舊',h4.includes('下面三個名字，最後一個是你')&&!h4.includes('兩個日文名字')&&h4t.includes('下面兩個日文名字')&&h4.includes('兩個了。')&&h4.includes('日本的朋友？'),J({jp:item('an4f')}));
  const an7=(route)=>{ const D=DK('2028-08-27'); fresh(D,20.5,route?{EXCHANGE_ROUTE:route}:{}); who('heroine_01','CLOSE'); walk(D,21.1); FEED.respond(H.G,'an7f','dm'); return th('heroine_01').slice(-2).map(x=>x.text); };
  const a7j=an7('JP'), a7t=an7('TW'), a7n=an7(null);
  check('5. 以安第 7 則（8/27）私訊問「日本那一頁呢？」：日本路線「留著。你的名字在最下面。」；臺灣路線、沒定「留著。我又加了一個名字。」',J(a7j)===J(['日本那一頁呢？','留著。你的名字在最下面。'])&&J(a7t)===J(['日本那一頁呢？','留著。我又加了一個名字。'])&&J(a7n)===J(a7t),J({a7j,a7t}));
  /* 芷若 9/2 那則：認識以上都看得到（交往中也有）*/
  const D92=DK('2028-09-02'); fresh(D92,8,{}); who('heroine_02','ACQ'); walk(D92,8.6); const z1=!!item('zr7f')&&HT().includes('一年。');
  fresh(D92,8,{}); who('heroine_02','ACQ'); DATING('heroine_02'); walk(D92,8.6); const z2=!!item('zr7f');
  fresh(D92,8,{EXCHANGE_ROUTE:'JP'}); who('heroine_02','ACQ'); walk(D92,8.6); const z3=!!item('zr7f');
  check('5. 芷若 9/2 08:30「一年。」：只認識也看得到；交往中也有；日本路線（8/5 回國）也有',z1&&z2&&z3,J({z1,z2,z3}));
  fresh(D92,8,{}); who('heroine_02','ACQ'); walk(D92,8.6); FEED.respond(H.G,'zr7f','cm'); const zc=th('heroine_02').slice(-2).map(x=>x.text);
  check('5. 留言「一路順風。」→「謝謝。……公園那隻貓，幫我看一下。」（AA_509 0-1 第 3 點）',J(zc)===J(['一路順風。','謝謝。……公園那隻貓，幫我看一下。']),J(zc));
  /* 子晴第 3 則：回過「『存檔點』。」＝「不是存檔點？」→ 兩句；沒有＝「名字定了！」→ 一句（沒有空的那一句）*/
  const W11=TDt('Y3S2',11,1), zq3=(named)=>{ fresh(W11-1,23,named?{ZQ_NAME_REPLIED:true}:{}); who('heroine_04','FRIEND'); walk(W11,0.6); const h=HT(); FEED.respond(H.G,'zq3f','cm'); return {h,th:th('heroine_04').map(x=>x.text),h2:HT()}; };
  const zy=zq3(true), zn=zq3(false);
  check('5. 子晴第 3 則《九點以後》：回過「『存檔點』。」＝留言「不是存檔點？」→「存檔點在裡面」「名字是這個」；沒回＝「名字定了！」→「定了」（只有一句、畫面上沒有空的回覆）',
    zy.h.includes('不是存檔點？')&&J(zy.th.slice(-3))===J(['不是存檔點？','存檔點在裡面','名字是這個'])&&zn.h.includes('名字定了！')&&J(zn.th.slice(-2))===J(['名字定了！','定了'])&&zn.th.length===2&&!/<b>[^<]*<\/b>：<\/div>/.test(zn.h2),J({zy:zy.th,zn:zn.th}));
  /* 以安 9/21 以後 12/3：讀書會拿回來、11/30 交棒以後最後一次 */
  fresh(DK('2028-09-20'),12); who('heroine_01','FRIEND'); walk(DK('2028-09-21'),22.1,{step:0.5}); FEED.respond(H.G,'an2g','dm'); const an2=th('heroine_01').slice(-2).map(x=>x.text);
  check('5. 以安第 2 則（9/21，白板筆「還妳 —Alison」）私訊問「之後交給誰？」→「十一月底交給學弟。這是最後幾次。」；第 3 則在 11/30 交棒以後（12/3）',J(an2)===J(['之後交給誰？','十一月底交給學弟。這是最後幾次。'])&&twOf('an3g').day>DK('2028-11-30')&&twOf('an2g').day===DK('2028-09-21'),J(an2));
  /* 芷若 12/10「房東」、子晴 12/26 的貓 */
  fresh(DK('2028-12-09'),12); who('heroine_02','FRIEND'); walk(DK('2028-12-10'),6.2,{step:0.5}); FEED.respond(H.G,'zr3g','dm'); const zr3=th('heroine_02').slice(-2).map(x=>x.text);
  check('5. 芷若第 3 則（12/10 06:07，倫敦的黑貓）私訊問「這隻叫什麼？」→「不知道。我叫牠房東。牠坐在長椅上的樣子，像長椅是牠的。」',J(zr3)===J(['這隻叫什麼？','不知道。我叫牠房東。牠坐在長椅上的樣子，像長椅是牠的。']),J(zr3));
  fresh(DK('2028-12-26'),22); who('heroine_04','ACQ'); walk(DK('2028-12-26'),23.6); FEED.respond(H.G,'zq4g','cm'); const zq4=th('heroine_04').slice(-3).map(x=>x.text);
  check('5. 子晴第 4 則（12/26，12/14 帶回家以後）「牠不走了」：留言「公園的貓？」→「嗯」「醫生說冬天不要待在外面」',J(zq4)===J(['公園的貓？','嗯','醫生說冬天不要待在外面']),J(zq4));
  /* 學姊美國路線三張照片 */
  const sisV=(route,id,d,h)=>{ fresh(d,h-1.5,route?{EXCHANGE_ROUTE:route}:{}); who('heroine_05','CLOSE'); walk(d,h+0.2); return {v:item(id)&&item(id).v,h:HT()}; };
  const s2u=sisV('US','sis2g',DK('2028-11-09'),8+10/60), s3u=sisV('US','sis3g',DK('2028-12-03'),8+10/60), s3t=sisV(null,'sis3g',DK('2028-12-03'),21+10/60);
  check('5. 學姊美國路線：第 2 則「多一個碗——是你的」、第 3 則「對面多一台筆電——是你的」；臺灣路線一般那張',s2u.v==='yes'&&s2u.h.includes('多一個碗——是你的')&&s3u.v==='yes'&&s3u.h.includes('對面多一台筆電——是你的')&&s3t.v==='no'&&!s3t.h.includes('是你的')&&s3t.h.includes('標題「第四章」'),J({s2u:s2u.v,s3u:s3u.v,s3t:s3t.v}));
  /* 沛珊寒假代課再回早餐店；可昕第 2 則在 10/20 以後 */
  fresh(DK('2029-01-14'),20); who('classmate_peishan','FRIEND'); walk(DK('2029-01-14'),21.1); FEED.respond(H.G,'ps4g','cm'); const ps4=th('classmate_peishan').slice(-2).map(x=>x.text);
  check('5. 沛珊 1/14（台中）「代課第二週～」：留言「代課？」→「兩週！然後回早餐店～」',J(ps4)===J(['代課？','兩週！然後回早餐店～']),J(ps4));
  check('5. 可昕第 2 則「國考」（11/5）在 10/20（交往中的先聽她說）以後；第 1 則 9/16「第四年。」',twOf('kx2g').day===DK('2028-11-05')&&twOf('kx2g').day>DK('2028-10-20')&&twOf('kx1g').day===DK('2028-09-16')); });

/* ---------- 6 別人說起她（AA_508、AA_509）---------- */
await sec('6',async()=>{ if(typeof HEARD==='undefined'){ check('6. HEARD',false,'沒有 HEARD'); return; }
  const HL=HEARD_LINES, all=[]; for(const e of HL.talk) all.push([e.src&&e.src.split(' ')[0],e.t,e.id]); for(const e of HL.phone) for(const it of e.items) all.push([e.src&&e.src.split(' ')[0],it[2],e.id]);
  const mine=all.filter(x=>x[0]==='AA_508'||x[0]==='AA_509'), DOCS={AA_508:doc.Y3S2,AA_509:doc.Y4S1};
  check('6. 第四輪的句子（'+mine.length+' 句）都在它那一份稿裡（28f981438，一字不差）；HEARD_LINES.src 記 AA_508／AA_509＝28f981438',mine.length===22&&mine.every(([s,t])=>DOCS[s]&&DOCS[s].includes(t))&&HL.src.AA_508===SHA&&HL.src.AA_509===SHA,J(mine.filter(([s,t])=>!(DOCS[s]&&DOCS[s].includes(t)))));
  const got=new Set(all.map(x=>x[1])), heard=[];
  for(const k of ['AA_508','AA_509']){ let on=false, last=''; for(const l of (DOCS[k]||'').split('\n')){ if(/^### \d+-4\. 別人說起她/.test(l)){ on=true; continue; } if(/^(### |## |---)/.test(l)){ on=false; continue; } if(!on) continue; let m;
      if((m=/^\s*- (.+?)：「([^」]*)」/.exec(l))){ last=m[1]; heard.push([k,m[1],m[2]]); }
      else if((m=/^\s*> ([^：]+)：(.+)$/.exec(l))) heard.push([k,m[1],m[2].trim()]);
      else if((m=/^\s*- ([^：「]+)：\s*$/.exec(l))) last=m[1]; } }
  const NOT_DONE={'以安在日本也坐第一排。她傳了一張照片給我，就是教室的第一排。':'曾靖雯 pool_7','學姊說倫敦的咖啡比較淡。她回來第一週，偷偷在自己的杯子裡加糖。':'新來的工讀生（3D 標籤人物）',
    '子晴學姊的發表會，她叫我不要坐第一排。所以我坐第一排。':'阿凱（大二起住別棟，3D 裡沒有他）','子晴學姊畢業前，把社辦每一條導線都檢查了一次。我的那條，標籤還在。':'葉晨希 pool_11',
    '以安學姊交棒的時候，把規則本每一條都念了一次。念到『遲到的人請大家喝飲料』，Alison 學姊站起來去買飲料。':'讀書會的學弟（新的 3D 標籤人物）','學姊在英國也每個月問公園的貓。……這次她有問我。':'新來的工讀生（3D 標籤人物）',
    '子晴學姊把公園的貓帶回家了。她說是同事。……貓是同事。':'阿凱（3D 裡沒有他）','子晴學姊上班以後，社課只來過兩次。兩次都待到最後，幫忙收導線。':'葉晨希 pool_11'};
  const miss=heard.filter(([k,w,t])=>!got.has(t)&&!NOT_DONE[t]), extra=Object.keys(NOT_DONE).filter(t=>!heard.some(x=>x[2]===t)||got.has(t));
  check('6. 稿上「別人說起她」'+heard.length+' 句（AA_508 13、AA_509 17）：'+heard.filter(x=>got.has(x[2])).length+' 句在遊戲裡、'+Object.keys(NOT_DONE).length+' 句列在沒做（pool_*、新來的工讀生、讀書會的學弟、阿凱），沒有漏掉',
    heard.filter(x=>x[0]==='AA_508').length===13&&heard.filter(x=>x[0]==='AA_509').length===17&&!miss.length&&!extra.length,J({miss,extra}));
  /* 閒聊前一句：from 那天有、前一天沒有、until 那天有、隔天沒有 */
  const meet=(...ids)=>{ for(const id of ids) H.rel(id,45,30,10); };
  const T4=HL.talk.filter(e=>/^AA_50[89]/.test(e.src||'')), bad=[];
  const setupT=(e,d,h)=>{ fresh(d,h==null?12:h,{}); meet(e.who); if(e.about) meet(e.about); for(const o of HL.talk) if(o.who===e.who&&o.id!==e.id&&HL.talk.indexOf(o)<HL.talk.indexOf(e)) HEARD.rec(H.G).said[o.id]=d-1; };
  for(const e of T4){ const a=HEARD.when(e.from), b=e.until?HEARD.when(e.until):null; if(!a){ bad.push(e.id+' from'); continue; }
    setupT(e,a.day,a.h!=null?a.h+0.01:12); const i1=HEARD.talkDue(H.G,e.who); setupT(e,a.day-1,23.9); const i0=HEARD.talkDue(H.G,e.who);
    let ok=!!i1&&i1.id===e.id&&(!i0||i0.id!==e.id); if(b){ setupT(e,b.day,12); const l=HEARD.talkDue(H.G,e.who); setupT(e,b.day+1,12); const n=HEARD.talkDue(H.G,e.who); ok=ok&&!!l&&l.id===e.id&&(!n||n.id!==e.id); }
    if(!ok) bad.push(e.id); }
  check('6. 閒聊前一句 '+T4.length+' 句（筱涵兩句、陳助教兩句、柏翰兩句、以安說語彤）在它的那幾天才說',T4.length===7&&!bad.length,J(bad));
  const W=k=>CALENDAR.dateOf(HEARD.when(k).day).key;
  check('6. 時間照稿：筱涵大三下第 3 週起、大四上第 7 週起；陳助教 6/23 21:00 以後（暑假也說）、1/1 起；柏翰大三下第 8 週起、大四上第 11 週週日 19:30 起；以安 11/30 交棒以後',
    W('Y3S2:W3一')==='2028-03-06'&&W('Y4S1:W7一')==='2028-10-16'&&W('Y3S2:W8一')==='2028-04-10'&&W('Y4S1:W11日 19:30')==='2028-11-19'&&W('Y3S2:end')==='2028-09-03'&&W('Y4S1:end')==='2029-02-18'
    &&T4.find(e=>e.id==='h509_an_yt').from==='2028-12-01'&&T4.find(e=>e.id==='h508_ta_sis').from==='2028-06-23 21:00'&&T4.find(e=>e.id==='h509_ta_sis').from==='2029-01-01');
  fresh(DK('2028-12-05'),12,{}); meet('heroine_01'); const an0=HEARD.talkDue(H.G,'heroine_01'); meet('heroine_03'); const an1=HEARD.talkDue(H.G,'heroine_01');
  check('6. 以安說語彤（「語彤週四在總圖三樓，九點半一定先走。……」）：不認識語彤＝不說；認識＝說',!an0&&!!an1&&an1.id==='h509_an_yt',J([an0&&an0.id,an1&&an1.id]));
  /* 手機 */
  const run=(d,h)=>{ at(d,h); HEARD.phone(H.G); PHONE.tick(H.G); };
  const msgs=tag=>(H.G.msgs||[]).filter(m=>m.tag==='heard_'+tag);
  const D45=DK('2028-04-05'); fresh(D45,21,{}); PHONE.join(H.G,'noodle_team','麵店團'); run(D45,21.3); const y0=msgs('h508_yu_an').length; run(D45,21.4);
  check('6. AA_508 1-4：Alison 4/5 21:20 麵店團群組「以安傳在群組的日本照片，每一張都有說明。像在寫報告。」',y0===0&&J(msgs('h508_yu_an').map(m=>[m.th,m.from,m.name,m.text]))===J([['g:noodle_team','yu','Alison','以安傳在群組的日本照片，每一張都有說明。像在寫報告。']]),J(msgs('h508_yu_an')));
  fresh(D45,21,{}); run(D45,21.4); check('6. 不在麵店團群組：沒有（x:noodleGroup）',!msgs('h508_yu_an').length&&HEARD.rec(H.G).ph.h508_yu_an==='x:noodleGroup');
  const D727=DK('2028-07-27'); fresh(D727,21,{}); PHONE.join(H.G,'noodle_team','麵店團'); run(D727,21.4);
  check('6. AA_508 3-4：Alison 7/27 21:20（語彤 7/24～8/6 在宜蘭）「語彤去宜蘭兩個禮拜。……她沒有。」',J(msgs('h508_yu_yt').map(m=>m.text))===J(['語彤去宜蘭兩個禮拜。阿姨每天問我們，她有沒有在群組講話。……她沒有。']));
  const D95=DK('2028-09-05'); fresh(D95,23,{}); who('heroine_04','ACQ'); meet('heroine_02'); run(D95,23.6);
  check('6. AA_508 2-4：子晴 9/5 23:30 私訊「芷若走了。這次一年。她把那把很醜的傘留給我了。」（有子晴的聯絡方式、認識芷若）',J(msgs('h508_zq_zr').map(m=>[m.th,m.from,m.text]))===J([['p:heroine_04','heroine_04','芷若走了。這次一年。她把那把很醜的傘留給我了。']]),J(msgs('h508_zq_zr')));
  fresh(D95,23,{}); who('heroine_04','ACQ'); run(D95,23.6); const zx=HEARD.rec(H.G).ph.h508_zq_zr; fresh(D95,23,{}); rel('heroine_04','ACQ'); meet('heroine_02'); run(D95,23.6); const zy2=HEARD.rec(H.G).ph.h508_zq_zr;
  check('6. 不認識芷若、或沒有子晴的聯絡方式：沒有（x:zqZr）',zx==='x:zqZr'&&zy2==='x:zqZr',J([zx,zy2]));
  const D1227=DK('2028-12-27'); fresh(D1227,23,{}); who('heroine_04','ACQ'); meet('heroine_02'); run(D1227,23.6);
  check('6. AA_509 2-4：子晴 12/27 23:30 私訊「我把公園的貓帶回家了。芷若知道以後，叫我每天傳一張照片給她。」',J(msgs('h509_zq_zr').map(m=>m.text))===J(['我把公園的貓帶回家了。芷若知道以後，叫我每天傳一張照片給她。']));
  const D1224=DK('2028-12-24'); fresh(D1224,20,{}); PHONE.join(H.G,'family_law','法律系家族'); run(D1224,20.4); const k0=msgs('h509_kevin').length; run(D1224,20.6);
  check('6. AA_509 5-4：Kevin 12/24 家族群組三則＋學姊「我知道。」',k0===0&&J(msgs('h509_kevin').map(m=>[m.name,m.text]))===J([['Kevin','學姊回來了'],['Kevin','她帶了一盒美國的餅乾給家族 說很甜 叫我們不要一次吃完'],['Kevin','我一次吃完了'],['溫學姊','我知道。']]),J(msgs('h509_kevin').map(m=>m.text)));
  const D614=DK('2028-06-14'), D117=DK('2028-11-07'); fresh(D614,23,{}); run(D614,23.6); const yu0=msgs('h508_yule').length; fresh(D614,23,{yulePassDay:1}); run(D614,23.6); const yu1=msgs('h508_yule').map(m=>[m.th,m.text]);
  fresh(D117,23,{yulePassDay:1}); run(D117,23.6); const yu2=msgs('h509_yule').map(m=>m.text);
  check('6. 予樂（見過她才有）：6/14 23:30「可昕要寫文章了……」兩則、11/7 23:30「可昕把國考貼在牆上……」兩則',yu0===0&&J(yu1)===J([['p:yule','可昕要寫文章了 每天晚上寫一頁 寫完念給我聽'],['p:yule','我每次都聽到睡著 她說這樣代表文章很平靜']])&&J(yu2)===J(['可昕把國考貼在牆上 我把我的期末報告貼在旁邊','她說不要比 我說我沒有要比 我只是想被看到']),J({yu1,yu2}));
  const D87=DK('2028-08-07'), D217=DK('2029-02-17'); fresh(D87,21,{}); PHONE.join(H.G,'econ_friends','走啦'); run(D87,21.4); const p1=msgs('h508_pinyu').map(m=>[m.th,m.name,m.text]);
  fresh(D217,21,{}); PHONE.join(H.G,'econ_friends','走啦'); run(D217,21.4); const p2=msgs('h509_pinyu').map(m=>m.text); fresh(D217,21,{}); run(D217,21.4); const p3=msgs('h509_pinyu').length;
  check('6. 品妤在「走啦」群組 8/7 21:20「可昕說予樂去她家住了三天。……」、2/17 21:20「可昕說她過年只休兩天。……」；不在群組沒有',
    J(p1)===J([['g:econ_friends','品妤','可昕說予樂去她家住了三天。她媽媽到現在還在問予樂什麼時候再來。']])&&J(p2)===J(['可昕說她過年只休兩天。她媽媽說休三天，她說好，結果還是兩天。'])&&p3===0,J({p1,p2,p3}));
  const D28=DK('2029-02-08'); fresh(D28,21,{}); PHONE.join(H.G,'noodle_team','麵店團'); run(D28,21.4);
  check('6. AA_509 1-4：Alison 2/8 21:20（以安 2/6 看海以後）「以安考完試一個人去看海。回來帶了一顆石頭給我。……我不知道要放哪。」',J(msgs('h509_yu_an').map(m=>m.text))===J(['以安考完試一個人去看海。回來帶了一顆石頭給我。……我不知道要放哪。']));
  fresh(D87+4,12,{}); PHONE.join(H.G,'econ_friends','走啦'); run(D87+4,12); check('6. 晚三天以上不補（同前幾輪）',!msgs('h508_pinyu').length&&HEARD.rec(H.G).ph.h508_pinyu==='x:late');
  const D87u=DK('2028-08-07'); fresh(D87u,9,{EXCHANGE_ROUTE:'US'}); PHONE.join(H.G,'econ_friends','走啦'); run(D87u,9.2); const pu0=msgs('h508_pinyu').length; run(D87u,9.4);
  check('6. 美國路線人在美國：品妤 8/7 21:20（臺灣）＝當地 09:20 收到（09:12 還沒有、09:24 有）',pu0===0&&msgs('h508_pinyu').length===1&&msgs('h508_pinyu')[0].day===D87u&&msgs('h508_pinyu')[0].h>=9+20/60-1e-6&&msgs('h508_pinyu')[0].h<=9.41,J(msgs('h508_pinyu').map(m=>[m.day,m.h]))); });

/* ---------- 7 出遊途中貼的（AA_506 第 9 節）---------- */
await sec('7',async()=>{ if(!HAS()){ check('7. 出遊途中',false,'沒有 FEED'); return; }
  /* C12 京都語言課（2027-08-09 07:00～08-27 22:00，出國：時鐘換日本時間）。OUT.go 會先記 arrived、演完記 done；這裡照那樣叫 VAC.outing（中間的日子 S.jump 每小時跑手機規則）*/
  const c12=async(lv)=>{ H.fresh('2027-08-08',12,'dorm',{}); if(!H.G.contacts) H.G.contacts={}; if(!Array.isArray(H.G.outings)) H.G.outings=[]; who('heroine_01',lv||'CLOSE');
    VAC.signup(H.G,'C12@Y2','yes'); const q=OUT.get(H.G,'vac_C12@Y2'); if(!q) return null; at(q.day,q.h); tickF(); q.arrived=true; await VAC.outing(GM,q); const mid=item('an7d')?Object.assign({},item('an7d')):null;
    q.state='done'; delete q.arrived; const back=T(H.G.day,H.G.hour); tickF(); return {q,mid,back,it:item('an7d')}; };
  const x=await c12();
  check('7. C12 途中 8/14 以安「京都：祐廷」那一則：途中時鐘是日本時間（臺灣 21:00＝當地 22:00）、記是哪一趟（tr）、同班那一版',!!x&&!!x.mid&&x.mid.tr==='vac_C12@Y2'&&Math.abs(x.mid.h-22)<0.01&&x.mid.day===DK('2027-08-14')&&x.mid.v==='yes'&&x.mid.back==null,J(x&&x.mid));
  check('7. 回到臺灣（8/27 22:00）那一刻記 back；那則已經 13 天，照樣在動態裡（從回來那一刻起再留七天）',!!x&&!!x.it&&x.it.back===x.back&&CALENDAR.dateOf(Math.floor(x.back/24)).key==='2027-08-27'&&HT().includes('「京都：祐廷」'),J(x&&{it:x.it,back:x.back}));
  if(x){ const bd=Math.floor(x.back/24), bh=x.back-bd*24; jump(bd+7,bh-0.02); const in7=HT().includes('「京都：祐廷」'), ok=!!FEED.respond(H.G,'an7d','heart'); jump(bd+7,bh+0.02); const out7=HT().includes('「京都：祐廷」');
    check('7. 回來以後第七天：回來那一刻的前一分鐘還在、可以回（按愛心）；過了那一刻就不在了',in7&&ok&&!out7,J({in7,ok,out7})); }
  /* 不是途中貼的：照七天 */
  const D0730=DK('2027-07-30'); fresh(D0730,19.5); who('heroine_01','FRIEND'); walk(D0730,20.1); const n0=item('an6d'); jump(D0730+7,19.9); const n1=HT().includes('三副碗筷'); jump(D0730+7,20.1); const n2=HT().includes('三副碗筷');
  check('7. 不是途中貼的（以安 7/30 台中那一則）：沒有 tr，照七天',!!n0&&n0.tr==null&&n1&&!n2,J(n0));
  /* 在途中的那幾天：超過七天也還在（還沒回來）；卡住沒演完的那一趟最多留 60 天 */
  fresh(D0730,19.5); who('heroine_01','FRIEND'); H.G.outings.push({id:'t_trip',state:'planned',arrived:true}); walk(D0730,20.1); const s0=item('an6d'); jump(D0730+20,12); const s1=HT().includes('三副碗筷'); jump(D0730+61,12); const s2=HT().includes('三副碗筷');
  check('7. 途中（那一趟還沒演完）貼的：二十天後還在；卡住、六十天以上就不在',!!s0&&s0.tr==='t_trip'&&s1&&!s2,J(s0));
  fresh(D0730,19.5); who('heroine_01','FRIEND'); H.G.outings.push({id:'t_old',day:D0730-70,state:'planned',arrived:true}); walk(D0730,20.1); const s3=item('an6d');
  check('7. 出發那天起七十天還記著「在途中」的那一趟（卡住的紀錄）：不算途中，照七天',!!s3&&s3.tr==null,J(s3));
  /* 舊存檔：items 沒有 tr／back＝照七天 */
  fresh(D0730+3,12); who('heroine_01','FRIEND'); H.G.flags.FEED={start:DK('2025-09-01'),items:[{id:'an6d',who:'heroine_01',day:D0730,h:20}],done:{an6d:'p'},dm:{},seen:-1e9}; jump(D0730+3,12); const o1=HT().includes('三副碗筷'); jump(D0730+8,12); const o2=HT().includes('三副碗筷');
  check('7. 舊存檔（items 沒有 tr）：照七天',o1&&!o2); });

/* ---------- 8 舊存檔 ---------- */
await sec('8',async()=>{ if(!HAS2()){ check('8. 舊存檔',false,'沒有資料'); return; }
  const D821=DK('2028-08-21'); fresh(D821,19,{}); who('heroine_03','FRIEND'); SOCIAL.remember('heroine_03','YT6_ASK_AUNT','Y6-L8'); walk(D821,21);
  check('8. 這一版以前就聊過 Y6-L8（只有記憶 YT6_ASK_AUNT、沒有 YT6_WITH）：分不出選了哪一句，8/21 那則不傳（x:need；回報）',!tagged('yt_ask_aunt').length&&R().dm.yt_ask_aunt==='x:need',J(R().dm.yt_ask_aunt)); });

/* 修改前（開發分支 76a171c87 的 src、index.html、白名單，這一版的測試）實際跑的結果見檔頭；這裡不寫死 */
H.done();
})();
