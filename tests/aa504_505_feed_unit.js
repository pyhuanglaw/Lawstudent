// 手機「動態」與「她講自己的事」的私訊：大一下＋暑假（AA_504，企劃線 62849944b）、大二上＋寒假（AA_505，企劃線 795fbecfd 更正版：010515370 四處、第 9 節）；HEROINE-LIFE-1028，
// 使用者 2026-10-28 01:2x「可攻略女主角 感覺都沒有自己的生活」，USER_WANTS X122★——不需要瀏覽器。
//   src/data/feed_y1s2.js、src/data/feed_y2s1.js（台詞）、src/feed3d.js（FEED，三個學期一起）；可昕 kx2_late、kx2_azalea 改動態；語彤放榜以後麵店阿姨請客（story3d.js noodleScene）。
//   0  載得到、index.html 順序；對稿兩個方向——①遊戲裡每一句都在稿裡（git show，一字不差）②稿的每一列動態（七位的 X-3 表：時間、階段、照片、她的一句、留言、私訊問）
//      和「她自己的事」裡的每一則私訊、每一個選項都在遊戲裡；稿上的日期和星期對得上；AA_505 更正前（62849944b）的舊句子不在遊戲裡
//   1  階段、聯絡方式、時間、舊存檔（從讀檔那一天開始）
//   2  頻率：大一下＋暑假走一遍、大二上＋寒假走一遍（七位都很熟）：每一則都出、一天不超過四則、每位連續七天不超過兩則；大一上和大一下接起來那幾週也一樣
//   3  私訊：以安（很熟、AN_LIST）、芷若春季菜單（看過冬季菜單的）、語彤訪問阿姨、學姊的帽子、可昕被叫妹妹、語彤看海、學姊池上、可昕模擬法庭——時間、階段、選項、記號
//   4  稿的測試建議（AA_504 第 8 節、AA_505 第 8 節裡手機的部分）：語彤 7/3 放榜（動態＋私訊＋第一次到麵店阿姨那一句、那一碗不用錢）；子晴 4/18 那兩天沒有動態、
//      第 9 週週三 23:40 那一則；沛珊第 3 則沒和她交往的才出；可昕第 1、2 則一定出、手機小事那兩則不出；沒演過 Z4 的看得到芷若 12/10、1/28 的動態（私訊照舊只給 Z4）；
//      沛珊第 2、4、7、11、14 週各一則、字越來越少、12/18 以後沒有；學姊 1/21 池上、1/22 私訊、1/23 Kevin 群組；子晴第二關 → 第三關 → 2/1 期末作業的小遊戲；
//      可昕第 11 週三個選項；以安第 3 則「有我嗎？」兩個版本；分開以後一學期可昕的動態不出現（大一下）
//   （3D 的建議——以安一個人散步、學姊在游泳池——不在這一輪，見回報的「沒做」）
// 修改前（開發分支 a57127ab4：沒有 feed_y1s2.js、feed_y2s1.js，kx2_late、kx2_azalea 還在手機小事；src、index.html 換回 a57127ab4 實際跑過）：
//   FAILED 15——第 0 段 7 項（載入與順序、SETS 只有大一上、則數、id、兩份對稿、AA_505 舊句）、第 1 段 5 項（那幾則都沒有）、第 2、3、4 段各 1 項（沒有資料就停）；
//   kx2_late、kx2_azalea 還在手機小事那一項由 tests/v2_b9_unit.js 第 10 項查。修改後 ALL PASS。用法：node tests/aa504_505_feed_unit.js
// 第三輪（AA_505 第 9 節，企劃線 795fbecfd：芷若第 4 則改 12/11「送出去了。」、子晴那句跟著改）修改前（開發分支 5df39fd7d 的 src、index.html 實際跑過）：FAILED 5——
//   第 0 段 3 項（Y2S1 ① 牛皮紙信封那三句不在 795fbecfd、② zr4c、舊句子那一項）、第 4 段 2 項（12/11 動態第 4 則、私訊問「哪裡？」→「英國。這次真的按了。」）。修改後 ALL PASS
// AA_514（企劃線 964d01175；任務 KX-MOOT3-1028）：大二上多一則 kx4bc（可昕 1/29 嘉義予樂家，第 4、5 則中間）——大二上則數 37→38、三個學期的 id 148→149；
//   ①②對稿不算它（ADD514；它的稿是 AA_514，tests/aa514_kx_moot3_unit.js 逐字對）；可昕第 11 週「下次我去看。」的選項多 set KX_WATCH（這裡不比 set）。
'use strict';
require('./alison.js');   // 讀企劃稿（git show）照匯入工具同一套換：Alison、虛構校名（WORLD-RENAME-1030，docs/WORLD_NAMING.md）
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const DOC={Y1S2:{spec:'docs/story_planning/AA_504_女主角自己的生活_大一下與暑假.md',sha:'62849944b',suf:'b',yHi:2026,yLo:2026},
           Y2S1:{spec:'docs/story_planning/AA_505_女主角自己的生活_大二上與寒假.md',sha:'795fbecfd',suf:'c',yHi:2026,yLo:2027}};
const ADD514=['kx4bc'];   /* AA_514 第 2 節（964d01175）加在 AA_505 7-3 第 4、5 則中間的第 4b 則（1/29 嘉義予樂家）：①②對稿不算它（它的稿是 AA_514，tests/aa514_kx_moot3_unit.js 逐字對）；則數、id、走一遍照算 */
const OLD505='62849944b';   /* AA_505 第一版（e05e87992 改了以安 1/27、010515370 改了四處、795fbecfd 第 9 節改了芷若第 4 則和子晴那一句）*/
const loadG=(f,names)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
const errs=[];
for(const [f,n] of [['src/data/needed_msgs.js',['NEEDED_MSGS']],['src/data/feed_y1s1.js',['FEED_Y1S1']],['src/data/feed_y1s2.js',['FEED_Y1S2']],['src/data/feed_y2s1.js',['FEED_Y2S1']],['src/feed3d.js',['FEED']],['src/data/heard_lines.js',['HEARD_LINES']],['src/heard3d.js',['HEARD']]]){
  try{ if(fs.existsSync(path.join(H.ROOT,f))) loadG(f,n); else errs.push('沒有 '+f); }catch(e){ errs.push(f+'：'+(e&&e.message||e)); } }
const SET={Y1S2:typeof FEED_Y1S2!=='undefined'?FEED_Y1S2:null,Y2S1:typeof FEED_Y2S1!=='undefined'?FEED_Y2S1:null};
const sec=(name,fn)=>{ try{ fn(); }catch(e){ check(name+'（例外）',false,String(e&&e.message||e).slice(0,200)); } };
const asec=async(name,fn)=>{ try{ await fn(); }catch(e){ check(name+'（例外）',false,String(e&&e.message||e).slice(0,200)); } };
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const show=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ return ''; } };
const doc={Y1S2:show(DOC.Y1S2.sha,DOC.Y1S2.spec),Y2S1:show(DOC.Y2S1.sha,DOC.Y2S1.spec)}, old505=show(OLD505,DOC.Y2S1.spec);

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
const HAS=()=>typeof FEED!=='undefined';
const R=()=>HAS()?FEED.rec(H.G):{start:null,items:[],done:{},dm:{}};
const tickF=()=>{ if(HAS()) FEED.tick(H.G); };
const HT=()=>HAS()?FEED.html(H.G):'';
const T=(d,h)=>d*24+h;
const walk=(d,h,o)=>{ o=o||{}; const st=o.step||0.25, end=T(d,h); let t=T(H.G.day,H.G.hour); for(;t<end-1e-9;t+=st){ const dd=Math.floor(t/24); at(dd,+(t-dd*24).toFixed(4)); if(o.rules) STORY.phoneRules(GM); else tickF(); PHONE.tick(H.G); } at(d,h); if(o.rules) STORY.phoneRules(GM); else tickF(); PHONE.tick(H.G); };
const jump=(d,h,o)=>{ at(d,h); if(o&&o.rules) STORY.phoneRules(GM); else tickF(); PHONE.tick(H.G); };
const th=id=>(H.G.msgs||[]).filter(m=>PHONE.th(m)==='p:'+id);
const item=id=>R().items.find(i=>i.id===id)||null;
const dm=id=>(H.G.msgs||[]).find(m=>m.tag==='aa503_'+id&&m.ask)||null;
const tagged=id=>(H.G.msgs||[]).filter(m=>m.tag==='aa503_'+id).map(m=>m.text);
const SEVEN=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
const post=id=>{ for(const k in SET){ const S=SET[k]; const p=S&&S.posts.find(x=>x.id===id); if(p) return p; } return null; };

/* ---------- 稿：每一列動態、每一則私訊 ---------- */
const WHO={'1':['an','heroine_01'],'2':['zr','heroine_02'],'3':['yt','heroine_03'],'4':['zq','heroine_04'],'5':['sis','heroine_05'],'6':['ps','classmate_peishan'],'7':['kx','kexin']};
const WDS='一二三四五六日';
const rowsOf=(md)=>{ const out=[]; let sec=null; for(const l of md.split('\n')){ let m=/^### (\d)-(\d)\. /.exec(l); if(m){ sec=m[2]==='3'?m[1]:null; continue; } if(/^##? /.test(l)){ sec=null; continue; }
    if(!sec||!l.startsWith('|')||l.startsWith('|---')||l.startsWith('| #')) continue; const c=l.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim()); if(c.length<7) continue;
    out.push({sec,n:c[0],when:c[1],st:c[2],pic:c[3],say:c[4],cm:c[5],dm:c[6]}); } return out; };
const qs=s=>[...s.matchAll(/「([^」]*)」/g)].map(m=>m[1]);
/* 稿上的時間 → {day, h}（自己算，不用 FEED.when），順便對星期 */
const whenOf=(term,w)=>{ const D=DOC[term]; let m=/^第 (\d+) 週週([一二三四五六日]) (\d\d):(\d\d)/.exec(w); if(m) return {day:TDt(term,+m[1],WDS.indexOf(m[2])+1),h:+m[3]+(+m[4])/60,wdOk:true};
  m=/^(\d+)\/(\d+)（([一二三四五六日])）(\d\d):(\d\d)/.exec(w); if(m){ const mo=+m[1], y=mo>=8?D.yHi:D.yLo, key=y+'-'+String(mo).padStart(2,'0')+'-'+String(+m[2]).padStart(2,'0'), day=DK(key);
    return {day,h:+m[4]+(+m[5])/60,wdOk:CALENDAR.dateOf(day).wd===WDS.indexOf(m[3])+1,key}; } return null; };
const expectRow=(term,r)=>{ const [pre,id]=WHO[r.sec]; const e={id:pre+r.n+DOC[term].suf,who:id,st:r.st,pic:r.pic,say:r.say==='（沒有字）'?'':r.say};
  e.cm=r.cm==='（不能留言）'?null:qs(r.cm);
  const v=/^「([^」]*)」→（一起去過的：）「([^」]*)」（沒有的：）「([^」]*)」$/.exec(r.dm); e.dm=v?[v[1],{yes:v[2],no:v[3]}]:qs(r.dm); e.went=v?'anWent':undefined; return e; };
/* 「她自己的事」（X-2）、動態表後面的說明（X-3）裡的私訊：「> 名字：句子」和選項（「- 「…」→」）*/
const dmQuotes=(md)=>{ const out={lines:[],opts:[],nar:[]}; let sec=null; for(const l of md.split('\n')){ let m=/^### (\d)-(\d)\. /.exec(l); if(m){ sec=(m[2]==='2'||m[2]==='3')?m[1]:null; continue; } if(/^##? /.test(l)){ sec=null; continue; } if(!sec) continue;
    if((m=/^\s*> ([^：（\s][^：]*)：(.+)$/.exec(l))) out.lines.push([m[1],m[2].trim()]);
    else if((m=/^\s*> （(.+)）\s*$/.exec(l))) out.nar.push(m[1]);
    else if((m=/^\s*- 「([^」]+)」→(?:「([^」]+)」)?/.exec(l))){ out.opts.push(m[1]); if(m[2]) out.lines.push(['(回)',m[2]]); }
    else if(/^\s*- 「?（不回）」?\s*$/.test(l)) out.opts.push('（不回）'); }
  return out; };
const strs=S=>{ const L=[]; const add=x=>{ if(x==null||x==='') return; if(typeof x==='object'){ if(x.nar) add(x.nar); for(const k of ['no','yes']) if(x[k]!=null) add(x[k]); return; } L.push(x); };
  for(const p of S.posts){ add(p.pic); add(p.say); for(const x of p.cm||[]) add(x); for(const x of p.dm||[]) add(x); }
  for(const q of S.dms){ for(const l of q.lines) add(l); if(q.ask) for(const o of q.ask.opts){ add(o.t); if(typeof o.post==='string') add(o.post); for(const r of o.r||[]) add(r); } }
  if(S.ytTreat) add(S.ytTreat.line); return L; };

sec('0',()=>{ const sc=f=>html.indexOf('<script src="'+f), i1=sc('src/data/feed_y1s1.js'), i2=sc('src/data/feed_y1s2.js'), i3=sc('src/data/feed_y2s1.js'), iF=sc('src/feed3d.js'), iB=sc('src/data/bbpack_events.js');
  check('0. 載得到；index.html：feed_y1s1.js → feed_y1s2.js → feed_y2s1.js → feed3d.js（在 bbpack_events.js 前面）',!errs.filter(e=>!/heard/.test(e)).length&&i1>0&&i2>i1&&i3>i2&&iF>i3&&iB>iF,J(errs));
  check('0. FEED 三個學期都接上（SETS）',HAS()&&J(FEED.SETS().map(s=>s.term))===J(['Y1S1','Y1S2','Y2S1']),HAS()?J(FEED.SETS().map(s=>s.term)):'沒有 FEED');
  check('0. 大一下：動態 47 則（以安 7、芷若 6、語彤 6、子晴 8、學姊 5、沛珊 8、可昕 7）、私訊 7 則；大二上：動態 38 則（6、6、4、6、5、5、6——可昕多 AA_514 第 2 節的第 4b 則）、私訊 3 則',!!SET.Y1S2&&!!SET.Y2S1&&SET.Y1S2.posts.length===47&&SET.Y1S2.dms.length===7&&SET.Y2S1.posts.length===38&&SET.Y2S1.dms.length===3,
    J([SET.Y1S2&&SET.Y1S2.posts.length,SET.Y1S2&&SET.Y1S2.dms.length,SET.Y2S1&&SET.Y2S1.posts.length,SET.Y2S1&&SET.Y2S1.dms.length]));
  const ids=[]; for(const S of (HAS()?FEED.SETS():[])){ for(const p of S.posts) ids.push('p:'+p.id); for(const q of S.dms) ids.push('d:'+q.id); }
  check('0. 三個學期的 id 都不重複（動態 44＋47＋38、私訊 10＋7＋3）',ids.length===149&&new Set(ids).size===ids.length,J(ids.filter((x,i)=>ids.indexOf(x)!==i)));
  /* 2026-10-30 AA_524 Z3（企劃線 8fd10848d）：芷若 zr3c 多了 yes 版（前一晚回「我去。」去看了早場的玩家：圖、私訊的回答）——對 AA_505 的稿用 no 版（原句）；yes 版在 tests/aa524_promises_unit.js 對 AA_524 的稿 */
  const A524=p=>p.id!=='zr3c'?p:Object.assign({},p,{went:undefined,pic:p.pic&&typeof p.pic==='object'?p.pic.no:p.pic,dm:(p.dm||[]).map(x=>x&&typeof x==='object'&&x.no!=null?x.no:x)});
  for(const term of ['Y1S2','Y2S1']){ const S0=SET[term], S=S0&&Object.assign({},S0,{posts:S0.posts.filter(p=>!ADD514.includes(p.id)).map(A524)}), md=doc[term], D=DOC[term];   /* AA_514 加的那一則不在 AA_505 的表裡（tests/aa514_kx_moot3_unit.js 對 AA_514）*/
    if(!S||!md){ check('0. '+term+' 對稿（'+D.sha+'）',false,!md?'git fetch origin claude/magical-albattani-bk7b4n':'沒有資料'); continue; }
    /* ① 遊戲 → 稿 */
    const L=strs(S), bad=L.filter(t=>!md.includes(t));
    check('0. '+term+' ① 遊戲裡每一句都在稿裡（'+D.sha+'，一字不差；'+L.length+' 句）',L.length>=(term==='Y1S2'?300:230)&&!bad.length,J(bad.slice(0,8)));
    /* ② 稿 → 遊戲：動態表每一列 */
    const rows=rowsOf(md), wrong=[], wd=[];
    for(const r of rows){ const e=expectRow(term,r), p=S.posts.find(x=>x.id===e.id), w=whenOf(term,r.when);
      if(!w||!w.wdOk) wd.push(r.sec+'-'+r.n+' '+r.when);
      const got=p&&HAS()?FEED.when(H.G||{flags:{}},p.t,term):null;
      const same=!!p&&p.who===e.who&&p.st===e.st&&J(p.pic)===J(e.pic)&&p.say===e.say&&J(p.cm)===J(e.cm)&&J(p.dm)===J(e.dm)&&p.went===e.went&&!!got&&!!w&&got.day===w.day&&Math.abs(got.h-w.h)<1e-6;
      if(!same) wrong.push(e.id); }
    check('0. '+term+' ② 稿的動態表 '+rows.length+' 列，每一列都在遊戲裡（時間、階段、照片、她的一句、留言、私訊問一字不差）',rows.length===S.posts.length&&!wrong.length,J(wrong.slice(0,10)));
    /* 稿上星期寫錯的列（照日期做）：AA_505 以安第 6 則原本寫「2/8（日）」，795fbecfd 第 9 節第 1 點改成「（一）」——現在都對得上 */
    const WD_KNOWN={Y1S2:[],Y2S1:[]};
    check('0. '+term+' 稿上的日期和星期對得上（'+rows.length+' 列；寫錯的照日期：'+(WD_KNOWN[term].join('、')||'沒有')+'）',J(wd)===J(WD_KNOWN[term]),J(wd));
    /* ② 稿 → 遊戲：私訊的每一句、每一個選項 */
    const Q=dmQuotes(md), all=new Set(L), optT=new Set(); for(const q of S.dms) if(q.ask) for(const o of q.ask.opts) optT.add(o.t);
    const missL=Q.lines.filter(([w,t])=>!all.has(t)), missO=Q.opts.filter(t=>!optT.has(t));
    check('0. '+term+' ② 稿的私訊 '+Q.lines.length+' 句、選項 '+Q.opts.length+' 個都在遊戲裡（阿姨那一句＝麵店）',Q.lines.length>=(term==='Y1S2'?25:12)&&Q.opts.length>=6&&!missL.length&&!missO.length,J({n:[Q.lines.length,Q.opts.length],missL,missO}));
    if(term==='Y1S2') check('0. Y1S2 稿裡唯一一句不是手機的旁白（公館窗邊）列在沒做：3D 的旁白不在這一輪',J(Q.nar)===J(['公館一間店的窗邊，以安和那個穿套裝的女人面對面坐著。這次說話的是對面的人，以安一直在點頭。']),J(Q.nar)); }
  /* AA_505 更正（e05e87992、010515370）以前的句子 */
  const GONE=['截圖：第四關的地圖，只有線條','第四關','好快。','寒假沒事做','四月。','然後站了一個小時。','灰色的海，一個穿厚外套的中年女人的背影','看得懂漢字。',
    '一個牛皮紙信封，寄件人那一欄寫著她的名字','寄出去了。','英國。這次真的寄了。'];   /* 795fbecfd 第 9 節第 2 點：芷若第 4 則改 12/11「送出去了。」*/
  const src=fs.existsSync(path.join(H.ROOT,'src/data/feed_y2s1.js'))?fs.readFileSync(path.join(H.ROOT,'src/data/feed_y2s1.js'),'utf8'):'';
  check('0. AA_505 更正前（'+OLD505+'）的舊句子不在遊戲裡（子晴第四關、芷若「四月。」、語彤阿姨站了一個小時、以安「看得懂漢字。」、芷若 12/10 牛皮紙信封「寄出去了。」）',old505.length>1000&&!!src&&GONE.every(t=>old505.includes(t)&&!doc.Y2S1.includes(t)&&!src.includes(t)),J(GONE.filter(t=>src.includes(t)))); });

/* ---------- 1 階段、聯絡方式、時間、舊存檔 ---------- */
sec('1',()=>{ const W2WED=TDt('Y1S2',2,3);
  fresh(TDt('Y1S2',1,1),8); who('heroine_01','ACQ'); tickF(); walk(W2WED,7.9); const before=item('an1b'); walk(W2WED,8);
  check('1. 以安大一下第 1 則（第 2 週週三 07:55，認識）：07:54 還沒有、07:55 以後有',!before&&!!item('an1b')&&item('an1b').day===W2WED&&Math.abs(item('an1b').h-(7+55/60))<0.01,J(item('an1b')));
  walk(TDt('Y1S2',4,6),16); check('1. 以安第 2 則（朋友）只認識：沒有（x:stage），畫面上沒有',R().done.an2b==='x:stage'&&!HT().includes('第四家。和 Alison。'),J(R().done.an2b));
  fresh(TDt('Y2S1',2,4),20); rel('heroine_03','CLOSE'); walk(TDt('Y2S1',2,4),21.5); check('1. 語彤很熟、沒有聯絡方式：大二上第 1 則不出（x:contact）',R().done.yt1c==='x:contact'&&!item('yt1c'),J(R().done.yt1c));
  /* 睡過：照原本的時間補 */
  fresh(DK('2026-02-09'),22,{}); who('heroine_04','ACQ'); tickF(); jump(DK('2026-02-11'),8);
  const z=item('zq1b'); check('1. 子晴 2/10 23:50（生日，認識就看得到）：2/9 22:00 睡到 2/11 08:00，補在 2/10 23:50',!!z&&z.day===DK('2026-02-10')&&Math.abs(z.h-(23+50/60))<0.01,J(z));
  /* 舊存檔：第一次讀檔在大二上第 5 週週二 22:00（FEED 還沒建立）*/
  fresh(TDt('Y2S1',5,2),22); who('heroine_01','FRIEND'); who('heroine_03','FRIEND'); tickF();
  check('1. 舊存檔第一次讀（大二上第 5 週週二 22:00）：那一天 21:40 以安第 2 則補上；前兩天（第 4 週週日 22:00）語彤第 2 則不補（old）',R().start===TDt('Y2S1',5,2)&&!!item('an2c')&&R().done.yt2c==='old',J({start:R().start,an2c:R().done.an2c,yt2c:R().done.yt2c})); });

/* ---------- 2 頻率：走一遍 ---------- */
const runAll=(from,to,flags,setup)=>{ fresh(from,0,flags); for(const id of SEVEN) who(id,'CLOSE'); if(setup) setup(); const log=new Map();
  for(let t=T(from,0);t<=T(to,23.5);t+=0.5){ const dd=Math.floor(t/24); at(dd,t-dd*24); tickF(); PHONE.tick(H.G); for(const i of R().items) if(!log.has(i.id)) log.set(i.id,i); }
  const L=[...log.values()], byDay={}; for(const i of L) byDay[i.day]=(byDay[i.day]||0)+1;
  let worst=0, wid=''; for(const i of L){ if(!FEED.isHeroine(i.who)) continue; const n=L.filter(j=>j.who===i.who&&T(j.day,j.h)<=T(i.day,i.h)&&T(i.day,i.h)-T(j.day,j.h)<7*24).length; if(n>worst){ worst=n; wid=i.id; } }
  return {log,L,maxDay:Math.max(0,...Object.values(byDay)),worst,wid}; };
sec('2',()=>{ if(!HAS()||!SET.Y1S2||!SET.Y2S1){ check('2. 走一遍',false,'沒有資料'); return; }
  let r=runAll(DK('2026-02-01'),DK('2026-09-06'));
  let miss=SET.Y1S2.posts.map(p=>p.id).filter(id=>!r.log.has(id));
  check('2. 大一下＋暑假走一遍（七位都很熟、沒有交往）：47 則都出',!miss.length&&SET.Y1S2.posts.every(p=>r.log.has(p.id)),J({miss,done:miss.map(id=>R().done[id])}));
  check('2. 大一下＋暑假：一天不超過四則（最多 '+r.maxDay+'）、每位連續七天不超過兩則（最多 '+r.worst+'）',r.maxDay<=4&&r.worst<=2,r.wid);
  r=runAll(DK('2026-09-07'),DK('2027-02-21'));
  miss=SET.Y2S1.posts.map(p=>p.id).filter(id=>!r.log.has(id));
  check('2. 大二上＋寒假走一遍：38 則都出',!miss.length,J({miss,done:miss.map(id=>R().done[id])}));
  check('2. 大二上＋寒假：一天不超過四則（最多 '+r.maxDay+'）、每位連續七天不超過兩則（最多 '+r.worst+'）',r.maxDay<=4&&r.worst<=2,r.wid);
  r=runAll(DK('2026-01-05'),DK('2026-03-08'));
  const want=FEED.SETS().flatMap(S=>S.posts).filter(p=>{ const w=FEED.when(H.G,p.t,FEED.SETS().find(S=>S.posts.includes(p)).term); return w&&w.day>=DK('2026-01-05')&&w.day<=DK('2026-03-08'); }).map(p=>p.id);
  miss=want.filter(id=>!r.log.has(id));
  check('2. 大一上的寒假接大一下（1/5～3/8）：兩份的動態一起算上限，'+want.length+' 則都出、一天不超過四則、每位七天不超過兩則',want.length>=15&&!miss.length&&r.maxDay<=4&&r.worst<=2,J({miss,max:r.maxDay,worst:r.worst})); });

/* ---------- 3 私訊 ---------- */
const answer=(id,k)=>{ const m=dm(id); if(!m) return null; const n=(H.G.msgs||[]).length; PHONE.answer(H.G,m.ask.id,k); return (H.G.msgs||[]).slice(n).filter(x=>x.from!=='player').map(x=>x.text); };
sec('3',()=>{ if(!HAS()||!SET.Y1S2){ check('3. 私訊',false,'沒有資料'); return; }
  /* 以安：第 10 週週五和媽媽吃飯的隔天 10:05（很熟），不用回 */
  const SAT=TDt('Y1S2',10,6); fresh(SAT,9); who('heroine_01','CLOSE'); walk(SAT,10); const a0=tagged('an_mom2').length; walk(SAT,10.1);
  check('3. 以安（很熟）大一下第 10 週週六 10:05：三則、不用回',a0===0&&J(tagged('an_mom2'))===J(['我媽問我下學期選什麼。','我說公司法。她說：好。','……她說好的時候，都不太像好。'])&&!(H.G.msgs||[]).some(m=>m.tag==='aa503_an_mom2'&&m.ask),J(tagged('an_mom2')));
  fresh(SAT,9); who('heroine_01','FRIEND'); walk(SAT,11); check('3. 以安只是朋友：沒有（x:stage）',!tagged('an_mom2').length&&R().dm.an_mom2==='x:stage');
  /* 8/17 AN_LIST */
  const D817=DK('2026-08-17'); fresh(D817-1,20,{AN_LIST:true}); who('heroine_01','FRIEND'); walk(D817,9.9); const b0=tagged('an_done').length; walk(D817,10.1);
  check('3. 有 AN_LIST：8/16 20:30 第 7 則「劃完了。」、隔天 10:00 兩則（不用回）',!!item('an7b')&&b0===0&&J(tagged('an_done'))===J(['七家都去完了。你說寒假去，我拖到暑假。','下一頁，我想寫「和誰去」。……還沒寫。']),J(tagged('an_done')));
  fresh(D817-1,20); who('heroine_01','FRIEND'); walk(D817,12); check('3. 沒有 AN_LIST：沒有（x:need）',!tagged('an_done').length&&R().dm.an_done==='x:need');
  /* 芷若春季菜單：看過大一上冬季菜單（zr_menu）的才傳 */
  const W7=TDt('Y1S2',7,7); fresh(W7,20); who('heroine_02','FRIEND'); R().dm.zr_menu='sent'; walk(W7,22.6);
  check('3. 芷若春季菜單（大一下第 7 週週日 22:07，朋友，看過冬季菜單那一則）：三則、不用回；22:30 第 3 則「小婷的。春季限定。」',J(tagged('zr_spring'))===J(['春天的菜單出來了。','櫻花拿鐵，小婷的。我幫她試了一整個晚上。','我這次沒提。……冬天那杯，我自己喝就好。'])&&!!item('zr3b'),J(tagged('zr_spring')));
  fresh(W7,20); who('heroine_02','FRIEND'); walk(W7,22.6); check('3. 沒看過冬季菜單那一則：沒有（x:after）',!tagged('zr_spring').length&&R().dm.zr_spring==='x:after',J(R().dm.zr_spring));
  /* 語彤訪問阿姨 */
  const W6=TDt('Y1S2',6,4);
  for(const [k,flag,want] of [[0,'wrote',['寫她每天四點起來備料。……其他的我沒寫。那是她的。']],[1,'what',['……那是她的。']],[2,'none',[]]]){ fresh(W6,20); who('heroine_03','FRIEND'); walk(W6,20.8); const got=answer('yt_aunt',k);
    check('3. 語彤訪問阿姨（大一下第 6 週週四 20:45）選第 '+(k+1)+' 個 → YT_AUNT_DM '+flag,J(tagged('yt_aunt').slice(0,3))===J(['作業交了。','我訪問阿姨。她講了兩個小時。','開店之前的事。'])&&J(got)===J(want)&&H.G.flags.YT_AUNT_DM===flag,J(got)); }
  /* 學姊的帽子 */
  const D67=DK('2026-06-07');
  for(const [k,flag,want] of [[0,'find',['不用。……反正也不會再戴。']],[1,'picked',['那他賺到了。']],[2,'none',[]]]){ fresh(D67,20); who('heroine_05','CLOSE'); walk(D67,21.6); const got=answer('sis_cap',k);
    check('3. 學姊（很熟）6/7 21:30 畢業典禮的帽子，選第 '+(k+1)+' 個 → SIS_CAP_DM '+flag,J(tagged('sis_cap').slice(0,2))===J(['畢業典禮的帽子，丟上去以後沒有接到。','找不到了。'])&&J(got)===J(want)&&H.G.flags.SIS_CAP_DM===flag,J(got)); }
  fresh(D67,20); who('heroine_05','FRIEND'); walk(D67,22); check('3. 學姊只是朋友：沒有那一則',!tagged('sis_cap').length);
  /* 可昕被叫妹妹 */
  const D79=DK('2026-07-09');
  for(const [k,flag,want] of [[0,'great',['我知道。……可是他還是很煩。']],[1,'abo',['（貼圖：長頸鹿）','好主意。明天他再來我就叫。']],[2,'tired',['嗯。我要睡了。']]]){ fresh(D79,21,{dating_kexin:true}); rel('kexin','ACQ'); contact('kexin'); walk(D79,22.8); const got=answer('kx_mei',k);
    check('3. 可昕（交往中）7/9 22:40 被叫妹妹，選第 '+(k+1)+' 個 → KX_MEI_DM '+flag,J(tagged('kx_mei').slice(0,3))===J(['今天有一個客人一直叫我妹妹。','我忍住了。','……操。'])&&J(got)===J(want)&&H.G.flags.KX_MEI_DM===flag,J(got)); }
  fresh(D79,21); who('kexin','FRIEND'); walk(D79,23); check('3. 沒有交往、朋友：也有',tagged('kx_mei').length===3);
  fresh(D79,21); who('kexin','ACQ'); walk(D79,23); check('3. 沒有交往、只認識：沒有',!tagged('kx_mei').length&&R().dm.kx_mei==='x:stage');
  if(!SET.Y2S1) return;
  /* 語彤看海、學姊池上、可昕模擬法庭（大二上） */
  const D23=DK('2027-02-03');
  for(const [k,flag,want] of [[0,'where',['基隆。她說她年輕的時候常去。']],[1,'happy',['她回來的路上一直睡。……應該是。']],[2,'none',[]]]){ fresh(D23,16); who('heroine_03','CLOSE'); walk(D23,21.1); const got=answer('yt_sea',k);
    check('3. 語彤（很熟）2/3 17:00 第 4 則、21:00 看海三則（在沙灘上坐了很久），選第 '+(k+1)+' 個 → YT_SEA_DM '+flag,!!item('yt4c')&&J(tagged('yt_sea').slice(0,3))===J(['帶阿姨去看海了。','她說很冷。','然後在沙灘上坐了很久。'])&&J(got)===J(want)&&H.G.flags.YT_SEA_DM===flag,J(got)); }
  const W11=TDt('Y2S1',11,6);
  for(const [k,flag,want] of [[0,'can',['我知道。……你不用安慰我。']],[1,'good',['很好。好到我很生氣。']],[2,'watch',['不要。你在我會看你。……好啦，下次。']]]){ fresh(W11,21); who('kexin','FRIEND'); walk(W11,22.6); const got=answer('kx_moot',k);
    check('3. 可昕（朋友）大二上第 11 週週六 22:30 模擬法庭輸了，選第 '+(k+1)+' 個 → KX_MOOT_DM '+flag,J(tagged('kx_moot').slice(0,3))===J(['輸了。','對方的律師是大三的。','……我下次要寫得更好。'])&&J(got)===J(want)&&H.G.flags.KX_MOOT_DM===flag,J(got)); }
  fresh(W11,21); who('kexin','ACQ'); walk(W11,23); check('3. 可昕只認識：沒有模擬法庭那一則',!tagged('kx_moot').length); });

/* ---------- 4 稿的測試建議 ---------- */
(async()=>{
await asec('4a',async()=>{ if(!HAS()||!SET.Y1S2){ check('4. 語彤放榜',false,'沒有資料'); return; }
  const D73=DK('2026-07-03'); fresh(D73,20); who('heroine_03','FRIEND'); walk(D73,20.6); const y3=item('yt3b'), before=tagged('yt_pass').length; walk(D73,20.75);
  check('4. AA_504：7/3 語彤放榜——20:30 動態第 3 則（沒有字）、20:40 私訊三則、三個選項',!!y3&&Math.abs(y3.h-20.5)<0.01&&before===0&&J(tagged('yt_pass').slice(0,3))===J(['上了。','雙主修。','阿姨說要請你吃麵。'])&&J(dm('yt_pass').ask.opts.map(o=>o.t))===J(['恭喜！','我去吃。','（不回）']),J(tagged('yt_pass')));
  const got=answer('yt_pass',1); check('4. 「我去吃。」→「好。週二、四都在。」（YT_PASS_DM eat；不排約）',J(got)===J(['好。週二、四都在。'])&&H.G.flags.YT_PASS_DM==='eat'&&!(typeof OUT!=='undefined'&&OUT.rec(H.G).some(q=>/yt/.test(q.id||''))),J(got));
  for(const [k,flag,want] of [[0,'congrats',['嗯。']],[2,'none',[]]]){ fresh(D73,20); who('heroine_03','FRIEND'); walk(D73,20.75); const g=answer('yt_pass',k); check('4. 放榜那則選第 '+(k+1)+' 個 → YT_PASS_DM '+flag,J(g)===J(want)&&H.G.flags.YT_PASS_DM===flag,J(g)); }
  /* 之後第一次在麵店點餐：阿姨一句、不用錢；第二次照付 */
  const paid=[], m0=GM.money; GM.money=d=>{ paid.push(d); }; const it={eat:'noodle',seat:{x:0,z:0}};
  try{ fresh(D73,20); who('heroine_03','FRIEND'); walk(D73,20.75); H.G.zone='noodle'; at(D73+4,18); check('4. 私訊傳了以後：FEED.ytTreatDue',FEED.ytTreatDue(H.G)===true);
    H.picks=[0]; H.said=[]; await STORY.interact(it,GM); const s1=H.said.map(x=>(x.who?x.who+'：':'')+x.t);
    check('4. 之後第一次到麵店點乾麵：阿姨「語彤上了！今天你的麵我請。」、那一碗不用錢（沒有扣錢）',s1[0]==='阿姨：語彤上了！今天你的麵我請。'&&!paid.length&&FEED.ytTreatDue(H.G)===false&&H.G.flags.FEED.ytTreat===D73+4,J({s1,paid}));
    H.picks=[1]; H.said=[]; await STORY.interact(it,GM); check('4. 下一次照付（餛飩湯 70 元）、阿姨不再說',J(paid)===J([-70])&&!H.said.some(x=>/今天你的麵我請/.test(x.t)),J({paid,said:H.said}));
    fresh(D73-1,20); who('heroine_03','FRIEND'); H.G.zone='noodle'; paid.length=0; H.picks=[0]; H.said=[]; await STORY.interact(it,GM); check('4. 放榜以前（沒收到那則）：照付、阿姨不說',J(paid)===J([-60])&&!H.said.some(x=>/今天你的麵我請/.test(x.t)));
    fresh(D73,20); who('heroine_03','ACQ'); walk(D73,21); check('4. 語彤只認識：沒有放榜私訊（x:stage）、麵店也不請',!tagged('yt_pass').length&&R().dm.yt_pass==='x:stage'&&FEED.ytTreatDue(H.G)===false); }
  finally{ GM.money=m0; } });
sec('4b',()=>{ if(!HAS()||!SET.Y1S2) return;
  /* 子晴 4/18 沒去比賽：那天、隔天她都不貼；第 9 週週三 23:40 */
  const r=runAll(DK('2026-04-13'),DK('2026-04-26')); const zq=r.L.filter(i=>i.who==='heroine_04');
  check('4. AA_504：子晴 4/18、4/19 沒有動態；第 9 週週三 23:40 那一則（很熟、不能留言）',!zq.some(i=>i.day===DK('2026-04-18')||i.day===DK('2026-04-19'))&&zq.some(i=>i.id==='zq4b'&&i.day===TDt('Y1S2',9,3)&&Math.abs(i.h-(23+40/60))<0.01)&&post('zq4b').cm===null,J(zq));
  /* 沛珊第 3 則：沒和她交往的才出 */
  const D49=DK('2026-04-09'); fresh(D49,20); who('classmate_peishan','FRIEND'); walk(D49,23.8); const a=item('ps3b');
  fresh(D49,20,{dating_classmate_peishan:true}); who('classmate_peishan','FRIEND'); walk(D49,23.8);
  check('4. AA_504：沛珊第 3 則（4/9 23:40）沒和她交往＝有；交往中＝沒有（x:if）',!!a&&!item('ps3b')&&R().done.ps3b==='x:if',J(R().done.ps3b));
  /* 可昕第 1、2 則：一定出（只認識、沒有交往也有）；手機小事那兩則不出 */
  fresh(TDt('Y1S2',1,1),8); who('kexin','ACQ'); walk(TDt('Y1S2',3,6),11,{step:0.5});
  check('4. AA_504：可昕第 1 則（第 1 週週三 08:40）、第 2 則（第 3 週週六 10:30）只認識也有；原句照用',R().done.kx1b==='p'&&!!item('kx2b')&&post('kx1b').say==='開學了。予樂說這學期要每天早到。今天她遲到。'&&post('kx2b').say==='木柵大學也有杜鵑花。可是開在山上，要爬上去才看得到。');
  check('4. AA_504：手機小事沒有 kx2_late、kx2_azalea',!STORY.DAILY_PHONE.some(d=>d.id==='kx2_late'||d.id==='kx2_azalea'));
  fresh(TDt('Y1S2',1,1),8,{dating_kexin:true}); rel('kexin','ACQ'); contact('kexin'); walk(TDt('Y1S2',3,7),23,{rules:true,step:1});
  check('4. 交往中走第 1～3 週（整套手機規則）：私訊裡沒有那兩句（只有動態）',!(H.G.msgs||[]).some(m=>m.text==='開學了。予樂說這學期要每天早到。今天她遲到。'||m.text==='木柵大學也有杜鵑花。可是開在山上，要爬上去才看得到。')&&R().done.kx1b==='p'&&R().done.kx2b==='p');   /* 動態只留十五天：第 1 週那一則看 done */
  /* 分開以後一學期（大一下）*/
  fresh(TDt('Y1S2',1,1),10,{dating_kexin:true}); rel('kexin','ACQ'); contact('kexin'); ROM.end(H.G,'kexin','apart_talk'); walk(TDt('Y1S2',3,7),23,{step:1});
  check('4. 大一下第 1 週分開：這一學期可昕的動態不出現（x:cool）',FEED.kxCool(H.G)===true&&R().done.kx1b==='x:cool'&&R().done.kx2b==='x:cool',J([R().done.kx1b,R().done.kx2b])); });
sec('4c',()=>{ if(!HAS()||!SET.Y2S1) return;
  /* 芷若 12/11、1/28：沒演過 Z4 也看得到動態；私訊照舊只給 Z4 的（story3d.js zr_z7_msg 12/10 23:59／zr_z7b）。AA_505 第 9 節第 2 點：動態是 12/11 22:07 貼的 */
  const D1210=DK('2026-12-10'); fresh(D1210,21); who('heroine_02','FRIEND'); walk(D1210+1,22.5,{rules:true,step:0.25});
  const z4=item('zr4c'), noZ4=!!z4&&z4.day===D1210+1&&Math.abs(z4.h-(22+7/60))<0.01&&!(H.G.msgs||[]).some(m=>m.tag==='zr_z7_msg')&&HT().includes('（照片：申請系統的截圖，最下面一行「已送出」，時間是前一天的 23:59）')&&HT().includes('<div>送出去了。</div>');
  fresh(D1210,21); who('heroine_02','FRIEND'); H.G.events.done.ev_zhiruo_secret=1; walk(D1210+1,22.5,{rules:true,step:0.25});
  check('4. AA_505：沒演過 Z4＝12/11 22:07 芷若的動態第 4 則（申請系統的截圖、「送出去了。」）有、12/10 23:59 的私訊沒有；演過 Z4＝動態照樣有、私訊也有',noZ4&&!!item('zr4c')&&(H.G.msgs||[]).some(m=>m.tag==='zr_z7_msg'),J({noZ4,z4}));
  if(HAS()) FEED.respond(H.G,'zr4c','dm'); check('4. AA_505：第 4 則私訊問「哪裡？」→「英國。這次真的按了。」',J(th('heroine_02').slice(-2).map(m=>m.text))===J(['哪裡？','英國。這次真的按了。']),J(th('heroine_02').slice(-2).map(m=>m.text)));
  const D128=DK('2027-01-28'); fresh(D128,20); who('heroine_02','FRIEND'); walk(D128,22.5,{rules:true,step:0.25});
  check('4. AA_505：沒演過 Z4＝1/28 22:07 動態第 6 則（「五月。」）有、21:00 學校那一關的私訊沒有',!!item('zr6c')&&J(post('zr6c').dm)===J(['什麼時候知道？','五月。'])&&!(H.G.msgs||[]).some(m=>m.tag==='zr_z7b'));
  /* 沛珊：第 2、4、7、11、14 週各一則、字越來越少、12/18 以後沒有 */
  const r=runAll(DK('2026-09-07'),DK('2027-02-21')); const ps=r.L.filter(i=>i.who==='classmate_peishan').sort((a,b)=>T(a.day,a.h)-T(b.day,b.h));
  const wk=ps.map(i=>CALENDAR.termOf(i.day).week), says=ps.map(i=>post(i.id).say);
  check('4. AA_505：沛珊第 2、4、7、11、14 週各一則，字越來越少（'+J(says)+'），12/18 以後沒有',J(wk)===J([2,4,7,11,14])&&says.every((s,i)=>i===0||s.length<=says[i-1].length)&&!ps.some(i=>i.day>=DK('2026-12-18')),J(wk));
  /* 學姊：1/21 池上、1/22 私訊、1/23 Kevin 群組 */
  const D121=DK('2027-01-21'); fresh(D121,12); who('heroine_05','CLOSE'); PHONE.join(H.G,'family_law','法律系家族'); walk(D121+2,21.5,{step:0.5}); if(typeof HEARD!=='undefined') { HEARD.phone(H.G); PHONE.tick(H.G); }
  const fam=(H.G.msgs||[]).filter(m=>m.th==='g:family_law'&&m.tag==='heard_h505_kevin').map(m=>m.text);
  check('4. AA_505：學姊 1/21 16:00 池上（動態第 5 則）、1/22 22:00 私訊三則（不用回）、1/23 Kevin 家族群組（學姊「冬天。」）',!!item('sis5c')&&item('sis5c').day===D121&&J(tagged('sis_chishang'))===J(['回來了。','池上的稻田，冬天沒有稻子。','我還是站了很久。'])
    &&J(fam)===J(['學姊去池上了','她只傳了一張照片給我 稻田 沒有稻子','學姊妳要不要說明一下','冬天。']),J({fam,ch:tagged('sis_chishang')}));
  /* 子晴：第 5 週第二關 → 1/9 第三關 → 2/1 期末作業的小遊戲 */
  const zq=r.L.filter(i=>['zq1c','zq4c','zq5c'].includes(i.id)).sort((a,b)=>T(a.day,a.h)-T(b.day,b.h)).map(i=>[i.id,post(i.id).say,CALENDAR.dateOf(i.day).key]);
  check('4. AA_505：子晴第 5 週「第二關」→ 1/9「第三關」→ 2/1「手癢」（期末作業的小遊戲，照片：標題那一格空著）',J(zq.map(x=>x[1]))===J(['第二關','第三關','手癢'])&&zq[1][2]==='2027-01-09'&&zq[2][2]==='2027-02-01'&&post('zq5c').pic==='截圖：上學期期末交的那個小遊戲的標題畫面，標題那一格空著',J(zq));
  /* 以安第 3 則「有我嗎？」 */
  const W10=TDt('Y2S1',10,6); fresh(W10,17); who('heroine_01','FRIEND'); walk(W10,18.5); FEED.respond(H.G,'an3c','dm'); const no=th('heroine_01').slice(-2).map(m=>m.text);
  fresh(W10,17); who('heroine_01','FRIEND'); H.G.invites=[{who:'heroine_01',place:'cafe',state:'done',day:W10-20}]; walk(W10,18.5); const h=HT(); FEED.respond(H.G,'an3c','dm'); const yes=th('heroine_01').slice(-2).map(m=>m.text);
  fresh(W10,17); who('heroine_01','FRIEND'); H.G.dateLog={heroine_01:{count:1,byLoc:{},cancels:[]}}; walk(W10,18.5); FEED.respond(H.G,'an3c','dm'); const yes2=th('heroine_01').slice(-2).map(m=>m.text);
  /* AA_505 第 0 節第 3 點：needed_msgs 第 2 週「第一次去上課」在閒聊「民法我坐最後一排」（語彤 Y3-L2）之前——閒聊那一層第 6 週才開，程式本來就是這個順序（沒改，這裡釘住）*/
  { const nm=typeof NEEDED_MSGS!=='undefined'?NEEDED_MSGS.list.find(e=>e.id==='yt_fafu'):null, st=(LADDER.byTerm.Y2S1.heroine_03.steps||[]).find(x=>x.id==='Y3-L2'), SUN=TDt('Y2S1',2,7);
    fresh(SUN,21.5); who('heroine_03','FRIEND'); const pick=STORY.neededPick(H.G,SUN).map(e=>e.id); const so=H.G.social||(H.G.social={}); so.ladder=Object.assign({},so.ladder,{'heroine_03@Y2S1':1}); const lad=STORY.ladNext(H.G,'heroine_03');
    fresh(TDt('Y2S1',6,2),15); who('heroine_03','FRIEND'); const so2=H.G.social||(H.G.social={}); so2.ladder=Object.assign({},so2.ladder,{'heroine_03@Y2S1':1}); const lad6=STORY.ladNext(H.G,'heroine_03');
    check('4. AA_505 第 0 節：語彤 needed_msgs 第 2 週「法律系的課，我上禮拜第一次去上。」（週日 21:00 挑得到）在閒聊「這學期開始修法律系的課。民法我坐最後一排。」（Y3-L2，第 6 週才開）之前',!!nm&&nm.term==='Y2S1'&&J(nm.w)===J([2,2])&&!!st&&J(st.week)===J([6,18])&&st.lines[0]==='這學期開始修法律系的課。民法我坐最後一排。'&&pick.includes('yt_fafu')&&!lad&&!!lad6&&lad6.id==='Y3-L2',J({pick,lad:lad&&lad.id,lad6:lad6&&lad6.id})); }
  check('4. AA_505：以安第 3 則私訊問「有我嗎？」——沒一起去過＝「……還沒。」；一起去過（INV 見到了）＝「有。」；校外約會過也算',J(no)===J(['有我嗎？','……還沒。'])&&J(yes)===J(['有我嗎？','有。'])&&J(yes2)===J(['有我嗎？','有。'])&&h.includes('有我嗎？'),J({no,yes,yes2})); });
H.done();
})();
