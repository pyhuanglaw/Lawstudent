// 手機「動態」與「她講自己的事」的私訊：大二下＋暑假（AA_506）、大三上＋寒假（AA_507），企劃線 31a4c4002（e4fbd0192 的更正版：芷若 8/23 滷肉先學一半、
// 以安寒假找住的地方、讀書會的規則本交給 Alison、學姊不寫第幾章）；HEROINE-LIFE-1028，使用者 2026-10-28 01:2x「可攻略女主角 感覺都沒有自己的生活」，USER_WANTS X122★——不需要瀏覽器。
//   src/data/feed_y2s2.js、src/data/feed_y3s1.js（台詞）、src/feed3d.js（FEED：照片的 {name}、去沒去 anC12／zqNamed／anJP、沛珊一個月一則 capMonth、語彤 2027 生日 ytBday）。
//   0  載得到、index.html 順序、五個學期都接上、則數、id 不重複；對稿兩個方向——①遊戲裡每一句都在稿裡（git show 31a4c4002，一字不差）②稿的每一列動態
//      （七位的 X-3 表：時間、階段、照片、她的一句、留言、私訊問；兩個版本的三列照稿上的標籤）和私訊、選項、語彤生日、學姊 2/7 都在遊戲裡；稿上的日期和星期對得上；
//      e4fbd0192 那一版作廢的四則（芷若滷肉、以安簽證、讀書會給學弟妹、學姊第三章）不在遊戲裡
//   1  階段、聯絡方式、時間、睡過補上、舊存檔（從讀檔那一天開始）
//   2  頻率：大二下＋暑假、大三上＋寒假各走一遍（七位都很熟）：每一則都出、一天不超過四則、每位連續七天不超過兩則；沛珊 2/22～9/3 沒有、9/4 一則；
//      沛珊大三上一個月最多一則（四則在四個月；同一個月多一則＝x:month，拿掉 capMonth 就會出）
//   3  英國時差：芷若 9/3～2/11 在英國的七則，換成倫敦當地時間都是 22:07（Intl Europe/London；臺灣時間 10/31 以前 05:07、以後 06:07，倫敦是前一天）；2/15 回台中 22:07
//   4  私訊：可昕 4/10 22:30 三個選項各一次（KX_WIN_DM）、交往中也有、只認識的沒有（只看到動態）；學姊 2/7 10:00 交往中兩則不用回、沒交往的沒有；
//      語彤 2027-07-09 生日：麵店團群組 Alison／不在群組 FAMILIAR 以上系統字／只認識沒有、12:00 以前沒有、睡過整天沒有，「傳一句生日快樂」→ 她回、YT_BDAY_Y2，21:00 動態第 5 則
//   5  稿的測試建議（AA_506 第 8 節、AA_507 第 8 節裡手機的部分）：以安大二下第 7 則（報了 C12 同班＝「京都：玩家的名字」、沒報、報了沒去＝「京都：一個人」）；
//      子晴大二下第 6 則（回過 zq_name「『存檔點』。」＝「名字定了？」、沒回＝「這是什麼？」，舊存檔看訊息）；以安大三上第 7 則日本路線；
//      子晴大三上第 3 則「老高」、第 7 則「名字呢？」→「還沒」；可昕沒有交往（朋友）看得到大三上四則
//   （3D 的建議——圈子、新標籤人物、學姊 1/15、北投 13:00——不在這一輪：第 0 節由開發分支做、3D 不做，見回報的「沒做」）
// 修改前（開發分支 5df39fd7d：沒有 feed_y2s2.js、feed_y3s1.js，feed3d.js 是第二輪的；src、index.html 換回 5df39fd7d 實際跑過）：FAILED 15——
//   第 0 段 10 項（載入與順序、SETS 只有三個學期、則數、id 148 個、兩份對稿沒有資料、語彤 2027 生日、學姊 2/7、可昕 4/10、作廢句子那一項沒有檔可查）、
//   第 1～5 段各 1 項（沒有資料就停）。
// 修改後 ALL PASS。用法：node tests/aa506_507_feed_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const SHA='31a4c4002', OLD='e4fbd0192';
const DOC={Y2S2:{spec:'docs/story_planning/AA_506_女主角自己的生活_大二下與暑假.md',suf:'d',yHi:2027,yLo:2027},
           Y3S1:{spec:'docs/story_planning/AA_507_女主角自己的生活_大三上與寒假.md',suf:'e',yHi:2027,yLo:2028}};
const loadG=(f,names)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
const errs=[];
for(const [f,n] of [['src/data/needed_msgs.js',['NEEDED_MSGS']],['src/data/feed_y1s1.js',['FEED_Y1S1']],['src/data/feed_y1s2.js',['FEED_Y1S2']],['src/data/feed_y2s1.js',['FEED_Y2S1']],
                    ['src/data/feed_y2s2.js',['FEED_Y2S2']],['src/data/feed_y3s1.js',['FEED_Y3S1']],['src/feed3d.js',['FEED']]]){
  try{ if(fs.existsSync(path.join(H.ROOT,f))) loadG(f,n); else errs.push('沒有 '+f); }catch(e){ errs.push(f+'：'+(e&&e.message||e)); } }
const SET={Y2S2:typeof FEED_Y2S2!=='undefined'?FEED_Y2S2:null,Y3S1:typeof FEED_Y3S1!=='undefined'?FEED_Y3S1:null};
const sec=(name,fn)=>{ try{ fn(); }catch(e){ check(name+'（例外）',false,String(e&&e.message||e).slice(0,200)); } };
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const show=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ return ''; } };
const doc={Y2S2:show(SHA,DOC.Y2S2.spec),Y3S1:show(SHA,DOC.Y3S1.spec)}, old={Y2S2:show(OLD,DOC.Y2S2.spec),Y3S1:show(OLD,DOC.Y3S1.spec)};
/* 2026-10-28 AA_512 13-2「連帶」、第 4 節第 5 點（企劃線 c444f0757）：feed_y3s1 學姊第 1 則她的一句「第二次。」改「又煮了。」（5/9 家族在她新家吃的那一鍋已經是第二次）——
   那一格照 AA_512 的「→」右邊比；新句子要在 AA_512 裡（tests/aa512_sis_b13_unit.js 也查）*/
const DOC512=show('c444f0757','docs/story_planning/AA_512_學姊第十三批_她自己的事當面演_說了沒發生九件.md');
const AA512_SAY={sis1e:['第二次。','又煮了。']}, AA512_OK=id=>{ const x=AA512_SAY[id]; return !!x&&DOC512.indexOf('「'+x[0]+'」→「'+x[1]+'」')>=0; };

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
const walk=(d,h,o)=>{ o=o||{}; const st=o.step||0.25, end=T(d,h); let t=T(H.G.day,H.G.hour); for(;t<end-1e-9;t+=st){ const dd=Math.floor(t/24); at(dd,+(t-dd*24).toFixed(4)); tickF(); PHONE.tick(H.G); } at(d,h); tickF(); PHONE.tick(H.G); };
const jump=(d,h)=>{ at(d,h); tickF(); PHONE.tick(H.G); };
const th=id=>(H.G.msgs||[]).filter(m=>PHONE.th(m)==='p:'+id);
const item=id=>R().items.find(i=>i.id===id)||null;
const dm=id=>(H.G.msgs||[]).find(m=>m.tag==='aa503_'+id&&m.ask)||null;
const tagged=id=>(H.G.msgs||[]).filter(m=>m.tag==='aa503_'+id).map(m=>m.text);
const answer=(id,k)=>{ const m=dm(id); if(!m) return null; const n=(H.G.msgs||[]).length; PHONE.answer(H.G,m.ask.id,k); return (H.G.msgs||[]).slice(n).filter(x=>x.from!=='player').map(x=>x.text); };
const SEVEN=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
const post=id=>{ for(const k in SET){ const S=SET[k]; const p=S&&S.posts.find(x=>x.id===id); if(p) return p; } return null; };
const whenOfPost=p=>{ for(const k in SET){ const S=SET[k]; if(S&&S.posts.includes(p)) return FEED.when(H.G||{flags:{}},p.t,S.term); } return null; };

/* ---------- 稿：每一列動態 ---------- */
const WHO={'1':['an','heroine_01'],'2':['zr','heroine_02'],'3':['yt','heroine_03'],'4':['zq','heroine_04'],'5':['sis','heroine_05'],'6':['ps','classmate_peishan'],'7':['kx','kexin']};
const WDS='一二三四五六日';
const rowsOf=(md)=>{ const out=[]; let sec=null; for(const l of md.split('\n')){ let m=/^### (\d)-(\d)\. /.exec(l); if(m){ sec=m[2]==='3'?m[1]:null; continue; } if(/^##? /.test(l)){ sec=null; continue; }
    if(!sec||!l.startsWith('|')||l.startsWith('|---')||l.startsWith('| #')) continue; const c=l.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim()); if(c.length<7) continue;
    out.push({sec,n:c[0],when:c[1],st:c[2],pic:c[3],say:c[4],cm:c[5],dm:c[6]}); } return out; };
const qs=s=>[...s.matchAll(/「([^」]*)」/g)].map(m=>m[1]);
const whenOf=(term,w)=>{ const D=DOC[term]; let m=/^第 (\d+) 週週([一二三四五六日])（(\d+)\/(\d+)）(\d\d):(\d\d)/.exec(w); if(m){ const day=TDt(term,+m[1],WDS.indexOf(m[2])+1), x=CALENDAR.dateOf(day); return {day,h:+m[5]+(+m[6])/60,wdOk:x.m===+m[3]&&x.d===+m[4]}; }
  m=/^(\d+)\/(\d+)（([一二三四五六日])）(\d\d):(\d\d)/.exec(w); if(m){ const mo=+m[1], y=mo>=8?D.yHi:D.yLo, key=y+'-'+String(mo).padStart(2,'0')+'-'+String(+m[2]).padStart(2,'0'), day=DK(key);
    return {day,h:+m[4]+(+m[5])/60,wdOk:CALENDAR.dateOf(day).wd===WDS.indexOf(m[3])+1,key}; } return null; };
/* 兩個版本的格子：「（標籤）…／（標籤）…」。標籤在 YES＝那一版（went），其他（其他、沒有的、沒寫）＝另一版 */
const YESL={'同班的':'anC12','取過名字的':'zqNamed','日本路線':'anJP'}, NOL=['其他','沒有的'];
const splitV=cell=>{ if(!cell.includes('／')) return null; const o={went:null,yes:'',no:'',pre:''};
  cell.split('／').forEach((p,i)=>{ const m=/^(.*?)（([^）]*)）(.*)$/.exec(p); let label=null, body=p, pre='';
    if(m&&(YESL[m[2]]||NOL.includes(m[2]))){ pre=m[1]; label=m[2]; body=m[3]; } if(i===0) o.pre=pre; if(label&&YESL[label]){ o.went=YESL[label]; o.yes=body; } else o.no=body; });
  return o; };
const zipV=(no,yes)=>{ const Y=yes.length<no.length?no.slice(0,no.length-yes.length).concat(yes):yes; return no.map((x,i)=>x===Y[i]?x:{yes:Y[i],no:x}); };
const C=x=>JSON.stringify(x,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((o,kk)=>(o[kk]=v[kk],o),{}):v);   /* 比對用：物件的鍵照字母排 */
const expectRow=(term,r)=>{ const [pre,id]=WHO[r.sec]; const e={id:pre+r.n+DOC[term].suf,who:id,st:r.st,say:r.say==='（沒有字）'?'':r.say}; let went;
  const vp=splitV(r.pic); if(vp){ went=vp.went; e.pic={yes:vp.pre+vp.yes.replace(/「(京都：)」後面是你的名字/,'「$1{name}」'),no:vp.pre+vp.no}; } else e.pic=r.pic;
  const vc=splitV(r.cm); if(vc){ went=vc.went; e.cm=zipV(qs(vc.no),qs(vc.yes)); } else e.cm=r.cm==='（不能留言）'?null:qs(r.cm);
  const vd=splitV(r.dm); if(vd){ went=vd.went; e.dm=zipV(qs(vd.no),qs(vd.yes)); } else e.dm=qs(r.dm);
  e.went=went||undefined; return e; };
/* 「她自己的事」（X-2）、動態表後面的說明（X-3）裡的私訊：「> 名字：句子」和選項（「- 「…」→」）*/
const dmQuotes=(md)=>{ const out={lines:[],opts:[]}; let sec=null; for(const l of md.split('\n')){ let m=/^### (\d)-(\d)\. /.exec(l); if(m){ sec=(m[2]==='2'||m[2]==='3')?m[1]:null; continue; } if(/^##? /.test(l)){ sec=null; continue; } if(!sec) continue;
    if((m=/^\s*> ([^：（\s][^：]*)：(.+)$/.exec(l))) out.lines.push([m[1],m[2].trim()]);
    else if((m=/^\s*- 「([^」]+)」→(?:「([^」]+)」)?/.exec(l))){ out.opts.push(m[1]); if(m[2]) out.lines.push(['(回)',m[2]]); } }
  return out; };
/* 遊戲裡的句子（兩個版本的照片——以安大二下第 7 則「京都：{name}」／「京都：一個人」——稿上是「前半（同班的）後半／（其他）後半」拼起來的，在 ② 逐列對；
   玩家按「傳一句生日快樂」送出的「生日快樂。」照 2026、2028 那兩則，不在稿上）*/
const strs=S=>{ const L=[]; const add=x=>{ if(x==null||x==='') return; if(typeof x==='object'){ for(const k of ['no','yes']) if(x[k]!=null) add(x[k]); return; } L.push(x); };
  for(const p of S.posts){ if(typeof p.pic!=='object') add(p.pic); add(p.say); for(const x of p.cm||[]) add(x); for(const x of p.dm||[]) add(x); }
  for(const q of S.dms){ for(const l of q.lines) add(l); if(q.ask) for(const o of q.ask.opts){ add(o.t); for(const r of o.r||[]) add(r); } }
  if(S.ytBday) for(const k of ['group','sys','opt','reply']) add(S.ytBday[k]); return L; };

sec('0',()=>{ const sc=f=>html.indexOf('<script src="'+f), i3=sc('src/data/feed_y2s1.js'), i4=sc('src/data/feed_y2s2.js'), i5=sc('src/data/feed_y3s1.js'), iF=sc('src/feed3d.js'), iB=sc('src/data/bbpack_events.js');
  check('0. 載得到；index.html：feed_y2s1.js → feed_y2s2.js → feed_y3s1.js → feed3d.js（在 bbpack_events.js 前面）',!errs.length&&i3>0&&i4>i3&&i5>i4&&iF>i5&&iB>iF,J(errs));
  check('0. FEED 五個學期都接上（SETS）',HAS()&&J(FEED.SETS().map(s=>s.term))===J(['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1']),HAS()?J(FEED.SETS().map(s=>s.term)):'沒有 FEED');
  const cnt=S=>S?SEVEN.map(id=>S.posts.filter(p=>p.who===id).length):null;
  check('0. 大二下：動態 40 則（以安 8、芷若 8、語彤 7、子晴 7、學姊 5、沛珊 1、可昕 4）、私訊 1 則；大三上：動態 41 則（7、8、6、7、5、4、4）、私訊 1 則',
    !!SET.Y2S2&&!!SET.Y3S1&&J(cnt(SET.Y2S2))===J([8,8,7,7,5,1,4])&&SET.Y2S2.dms.length===1&&J(cnt(SET.Y3S1))===J([7,8,6,7,5,4,4])&&SET.Y3S1.dms.length===1,J([cnt(SET.Y2S2),cnt(SET.Y3S1)]));
  const ids=[]; for(const S of (HAS()?FEED.SETS():[])){ for(const p of S.posts) ids.push('p:'+p.id); for(const q of S.dms) ids.push('d:'+q.id); }
  check('0. 五個學期的 id 都不重複（動態 44＋47＋38＋40＋41、私訊 10＋7＋3＋1＋1；大二上 38＝AA_514 加的 kx4bc）',ids.length===232&&new Set(ids).size===ids.length,J([ids.length,ids.filter((x,i)=>ids.indexOf(x)!==i)]));
  for(const term of ['Y2S2','Y3S1']){ const S=SET[term], md=doc[term];
    if(!S||!md){ check('0. '+term+' 對稿（'+SHA+'）',false,!md?'git fetch origin claude/magical-albattani-bk7b4n':'沒有資料'); continue; }
    /* ① 遊戲 → 稿 */
    const L=strs(S), bad=L.filter(t=>!md.includes(t)&&!(term==='Y3S1'&&Object.keys(AA512_SAY).some(id=>AA512_SAY[id][1]===t&&AA512_OK(id)))), vp=S.posts.filter(p=>typeof p.pic==='object').map(p=>p.id);   /* AA_512 改的那一句在 AA_512 裡 */
    check('0. '+term+' ① 遊戲裡每一句都在稿裡（'+SHA+'，一字不差；'+L.length+' 句；兩個版本的照片 '+(vp.join('、')||'沒有')+' 在 ② 對）',L.length>=(term==='Y2S2'?200:190)&&!bad.length&&J(vp)===J(term==='Y2S2'?['an7d']:[]),J({bad:bad.slice(0,8),vp}));
    /* ② 稿 → 遊戲：動態表每一列 */
    const rows=rowsOf(md), wrong=[], wd=[], went={};
    for(const r of rows){ const e=expectRow(term,r), p=S.posts.find(x=>x.id===e.id), w=whenOf(term,r.when); if(AA512_SAY[e.id]&&e.say===AA512_SAY[e.id][0]&&AA512_OK(e.id)) e.say=AA512_SAY[e.id][1];   /* AA_512 改字 */
      if(!w||!w.wdOk) wd.push(r.sec+'-'+r.n+' '+r.when); if(e.went) went[e.id]=e.went;
      const got=p&&HAS()?FEED.when(H.G||{flags:{}},p.t,term):null;
      const same=!!p&&p.who===e.who&&p.st===e.st&&C(p.pic)===C(e.pic)&&p.say===e.say&&C(p.cm)===C(e.cm)&&C(p.dm)===C(e.dm)&&p.went===e.went&&!!got&&!!w&&got.day===w.day&&Math.abs(got.h-w.h)<1e-6;
      if(!same) wrong.push(e.id+(p?'':'（沒有）')); }
    check('0. '+term+' ② 稿的動態表 '+rows.length+' 列，每一列都在遊戲裡（時間、階段、照片、她的一句、留言、私訊問一字不差；兩個版本的列：'+(J(went)||'')+'）',rows.length===S.posts.length&&!wrong.length&&J(went)===J(term==='Y2S2'?{an7d:'anC12',zq6d:'zqNamed'}:{an7e:'anJP'}),J(wrong.slice(0,10)));
    check('0. '+term+' 稿上的日期和星期對得上（'+rows.length+' 列）',!wd.length,J(wd));
    /* ② 稿 → 遊戲：私訊 */
    const Q=dmQuotes(md), all=new Set(L), optT=new Set(); for(const q of S.dms) if(q.ask) for(const o of q.ask.opts) optT.add(o.t);
    const missL=Q.lines.filter(([w,t])=>!all.has(t)), missO=Q.opts.filter(t=>!optT.has(t));
    check('0. '+term+' ② 稿的私訊 '+Q.lines.length+' 句、選項 '+Q.opts.length+' 個都在遊戲裡',(term==='Y2S2'?Q.lines.length===6&&Q.opts.length===3:Q.lines.length===0&&Q.opts.length===0)&&!missL.length&&!missO.length,J({n:[Q.lines.length,Q.opts.length],missL,missO})); }
  /* 稿的私訊寫在句子裡的兩處：語彤 7/9 生日（AA_506 3-2 第 4 點）、學姊 2/7（AA_507 5-3 的說明）*/
  const B=SET.Y2S2&&SET.Y2S2.ytBday, m6=doc.Y2S2||'';
  const bq={group:(m6.match(/Alison「([^」]+)」/)||[])[1],sys:(m6.match(/系統字「([^」]+)」/)||[])[1],opt:(m6.match(/選項「(傳一句生日快樂)」/)||[])[1],reply:(m6.match(/她回：「(……謝謝。今天第一次去田野[^」]*)」/)||[])[1]};
  check('0. AA_506 3-2 第 4 點：語彤 2027-07-09 12:00 生日——群組 Alison、系統字、選項、她回都照稿；送出的「生日快樂。」同 2026（home3d.js）',!!B&&B.day==='2027-07-09'&&B.h===12&&['group','sys','opt','reply'].every(k=>bq[k]&&B[k]===bq[k])&&B.post==='生日快樂。'&&fs.readFileSync(path.join(H.ROOT,'src/home3d.js'),'utf8').includes("post:'生日快樂。'"),J({bq,B}));
  const m7=doc.Y3S1||'', sq=qs((m7.match(/補 2\/7 10:00 私訊（交往中，不用回）：(「[^\n]*)/)||[])[1]||''), Sd=SET.Y3S1&&SET.Y3S1.dms.find(q=>q.id==='sis_rest');
  check('0. AA_507 5-3：學姊 2/7 10:00 私訊（交往中，不用回）「今天。」「我在家看小說。」',!!Sd&&J(Sd.lines)===J(sq)&&sq.length===2&&Sd.t==='2028-02-07 10:00'&&Sd.st==='交往中'&&!Sd.ask,J({sq,Sd}));
  const K=SET.Y2S2&&SET.Y2S2.dms.find(q=>q.id==='kx_win');
  check('0. AA_506 7-2：可昕 4/10 22:30（交往中，或朋友以上）、記號 KX_WIN_DM',!!K&&K.t==='2027-04-10 22:30'&&K.st==='朋友'&&K.ask&&K.ask.flag==='KX_WIN_DM'&&J(K.ask.opts.map(o=>o.t))===J(['恭喜！','上次那個大三的呢？','下次我去看。']),J(K&&K.ask));
  /* e4fbd0192 那一版作廢的句子 */
  const GONE=['這次聽出來了。','嗯。我媽說可以了。','帶不了。所以我學起來了。','護照和一張辦簽證的號碼牌','排了很久。','辦好了？','下週拿。','辦簽證不緊張。護照照片很醜。',
    '一本筆記本，封面寫「讀書會 規則」，下面一行「給學弟妹」','交給他們了。','誰接？','上次問我三條規則是哪三條的那個學妹。','第三章寫完了？','還沒。寫完才放。'];
  const src=['src/data/feed_y2s2.js','src/data/feed_y3s1.js'].map(f=>fs.existsSync(path.join(H.ROOT,f))?fs.readFileSync(path.join(H.ROOT,f),'utf8'):'').join('\n');
  check('0. '+OLD+' 那一版作廢的句子（芷若 8/23 滷肉、以安 1/5 簽證、1/13 讀書會給學弟妹、學姊第 4、5 則第三章）不在遊戲裡（'+SHA+' 也沒有）',(old.Y2S2+old.Y3S1).length>2000&&src.length>1000&&GONE.every(t=>(old.Y2S2+old.Y3S1).includes(t)&&!(doc.Y2S2+doc.Y3S1).includes(t)&&!src.includes(t)),J(GONE.filter(t=>src.includes(t)||!(old.Y2S2+old.Y3S1).includes(t)))); });

/* ---------- 1 階段、聯絡方式、時間、舊存檔 ---------- */
sec('1',()=>{ if(!HAS()||!SET.Y2S2||!SET.Y3S1){ check('1. 動態',false,'沒有資料'); return; }
  const W3TUE=TDt('Y2S2',3,2); fresh(W3TUE,20); who('heroine_01','ACQ'); walk(W3TUE,21.98); const before=item('an1d'); walk(W3TUE,22);
  check('1. 以安大二下第 1 則（第 3 週週二 22:00，認識）：21:59 還沒有、22:00 有',!before&&!!item('an1d')&&item('an1d').day===W3TUE&&Math.abs(item('an1d').h-22)<0.01,J(item('an1d')));
  walk(TDt('Y2S2',7,4),22); check('1. 以安第 2 則（朋友）只認識：沒有（x:stage），畫面上沒有',R().done.an2d==='x:stage'&&!HT().includes('進步了。'),J(R().done.an2d));
  fresh(TDt('Y2S2',2,4),20); rel('heroine_03','CLOSE'); walk(TDt('Y2S2',2,4),21.5); check('1. 語彤很熟、沒有聯絡方式：大二下第 1 則不出（x:contact）',R().done.yt1d==='x:contact'&&!item('yt1d'),J(R().done.yt1d));
  fresh(DK('2027-05-29'),22); who('heroine_04','ACQ'); tickF(); jump(DK('2027-05-30'),8);
  const z=item('zq4d'); check('1. 子晴 5/30 01:00 成發收好的導線（認識）：5/29 22:00 睡到 5/30 08:00，補在 5/30 01:00',!!z&&z.day===DK('2027-05-30')&&Math.abs(z.h-1)<0.01,J(z));
  /* 舊存檔：第一次讀檔在大三上第 5 週週一 22:30（FEED 還沒建立）*/
  const W5MON=TDt('Y3S1',5,1); fresh(W5MON,22.5); who('heroine_03','FRIEND'); who('heroine_04','FRIEND'); tickF();
  check('1. 舊存檔第一次讀（大三上第 5 週週一 22:30）：那一天 22:00 語彤第 2 則補上；前幾天（第 4 週週四 01:20）子晴第 2 則不補（old）',R().start===W5MON&&!!item('yt2e')&&R().done.zq2e==='old',J({start:R().start,yt2e:R().done.yt2e,zq2e:R().done.zq2e}));
  /* 舊存檔已經有 FEED（第二輪的存檔：只有前三個學期的紀錄）：新的兩份照時間接著出 */
  fresh(DK('2027-02-20'),12); who('heroine_02','FRIEND'); H.G.flags.FEED={start:DK('2025-09-01'),items:[],done:{zr6c:'p'},dm:{},seen:-1e9}; walk(TDt('Y2S2',2,3),22.2);
  check('1. 第二輪的舊存檔（FEED 只有前三個學期的紀錄）：大二下芷若第 1 則照樣出',!!item('zr1d')&&R().done.zr6c==='p',J(R().done)); });

/* ---------- 2 頻率：走一遍 ---------- */
const runAll=(from,to,flags,setup)=>{ fresh(from,0,flags); for(const id of SEVEN) who(id,'CLOSE'); if(setup) setup(); const log=new Map();
  for(let t=T(from,0);t<=T(to,23.5);t+=0.5){ const dd=Math.floor(t/24); at(dd,t-dd*24); tickF(); PHONE.tick(H.G); for(const i of R().items) if(!log.has(i.id)) log.set(i.id,i); }
  const L=[...log.values()], byDay={}; for(const i of L) byDay[i.day]=(byDay[i.day]||0)+1;
  let worst=0, wid=''; for(const i of L){ if(!FEED.isHeroine(i.who)) continue; const n=L.filter(j=>j.who===i.who&&T(j.day,j.h)<=T(i.day,i.h)&&T(i.day,i.h)-T(j.day,j.h)<7*24).length; if(n>worst){ worst=n; wid=i.id; } }
  return {log,L,maxDay:Math.max(0,...Object.values(byDay)),worst,wid}; };
sec('2',()=>{ if(!HAS()||!SET.Y2S2||!SET.Y3S1){ check('2. 走一遍',false,'沒有資料'); return; }
  let r=runAll(DK('2027-02-15'),DK('2027-09-05'));
  let miss=SET.Y2S2.posts.map(p=>p.id).filter(id=>!r.log.has(id));
  check('2. 大二下＋暑假走一遍（七位都很熟、沒有交往）：40 則都出',!miss.length,J({miss,done:miss.map(id=>R().done[id])}));
  check('2. 大二下＋暑假：一天不超過四則（最多 '+r.maxDay+'）、每位連續七天不超過兩則（最多 '+r.worst+'）',r.maxDay<=4&&r.worst<=2,r.wid);
  const ps=r.L.filter(i=>i.who==='classmate_peishan').map(i=>CALENDAR.dateOf(i.day).key);
  check('2. AA_506 6-3：沛珊 2/22～9/3 沒有任何動態，9/4 一則（20:00）',J(ps)===J(['2027-09-04'])&&Math.abs(r.log.get('ps1d').h-20)<0.01,J(ps));
  r=runAll(DK('2027-09-06'),DK('2028-02-20'));
  miss=SET.Y3S1.posts.map(p=>p.id).filter(id=>!r.log.has(id));
  check('2. 大三上＋寒假走一遍：41 則都出',!miss.length,J({miss,done:miss.map(id=>R().done[id])}));
  check('2. 大三上＋寒假：一天不超過四則（最多 '+r.maxDay+'）、每位連續七天不超過兩則（最多 '+r.worst+'）',r.maxDay<=4&&r.worst<=2,r.wid);
  const pm=r.L.filter(i=>i.who==='classmate_peishan').map(i=>{ const x=CALENDAR.dateOf(i.day); return x.y+'-'+x.m; });
  check('2. AA_507 6-3：沛珊大三上四則，一個月一則（10、11、12、1 月）',J(pm)===J(['2027-10','2027-11','2027-12','2028-1'])&&FEED_Y3S1.capMonth&&FEED_Y3S1.capMonth.classmate_peishan===1,J(pm));
  /* 一個月最多一則：同一個月多一則就不出（x:month）；拿掉 capMonth 就會出（不是其他上限擋的）*/
  const fake={id:'t_ps_oct',who:'classmate_peishan',t:'2027-10-20 20:00',st:'認識',pic:'測試',say:'測試',cm:null,dm:['a','b']};
  const tryFake=(cap)=>{ FEED_Y3S1.posts.push(fake); const c0=FEED_Y3S1.capMonth; if(!cap) delete FEED_Y3S1.capMonth;
    try{ fresh(DK('2027-10-01'),12); who('classmate_peishan','CLOSE'); walk(DK('2027-10-21'),12,{step:0.5}); return {ps1e:R().done.ps1e,fake:R().done.t_ps_oct}; }
    finally{ FEED_Y3S1.posts.pop(); FEED_Y3S1.capMonth=c0; } };
  const a=tryFake(true), b=tryFake(false);
  check('2. 沛珊同一個月第二則（測試用 10/20）：10/9 那則先出、10/20 那則不出（x:month）；拿掉 capMonth 就出（14 天一則、七天兩則的上限都沒擋）',a.ps1e==='p'&&a.fake==='x:month'&&b.fake==='p',J({a,b}));
  /* 可昕沒有交往（朋友）：大三上四則都看得到（AA_507 第 8 節）*/
  fresh(DK('2027-09-06'),0); who('kexin','FRIEND'); const seen=new Set(); for(let d=DK('2027-09-06');d<=DK('2028-02-20');d++){ at(d,23.9); tickF(); for(const i of R().items) seen.add(i.id); }
  check('2. 可昕沒有交往、朋友：大三上四則都看得到（政大大三、民總讀書會、房東的報告、高雄的芭樂）',['kx1e','kx2e','kx3e','kx4e'].every(id=>seen.has(id)),J([...seen])); });

/* ---------- 3 英國時差 ---------- */
sec('3',()=>{ if(!HAS()||!SET.Y3S1){ check('3. 英國時差',false,'沒有資料'); return; }
  const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
  const utcOf=w=>{ const x=CALENDAR.dateOf(w.day), H0=Math.floor(w.h+1e-9), M=Math.round((w.h-H0)*60); return Date.UTC(x.y,x.m-1,x.d,H0,M)-8*3600e3; };   /* 遊戲時鐘＝臺灣時間（UTC+8）*/
  const out=[], bad=[];
  for(const id of ['zr1e','zr2e','zr3e','zr4e','zr5e','zr6e','zr7e']){ const p=post(id), w=whenOfPost(p), u=utcOf(w), lon=fmt.format(new Date(u)), tw=CALENDAR.dateOf(w.day);
    const twH=Math.floor(w.h+1e-9)+':'+String(Math.round((w.h-Math.floor(w.h+1e-9))*60)).padStart(2,'0'), before=w.day<=DK('2027-10-31');
    out.push(id+' 臺灣 '+tw.m+'/'+tw.d+' '+twH+' → 倫敦 '+lon); if(!/, 22:07$/.test(lon)||twH!==(before?'5:07':'6:07')) bad.push(id); }
  check('3. 芷若在英國的七則（9/12～2/3）：倫敦當地都是 22:07；臺灣時間 10/31 以前 05:07、以後 06:07（倫敦是前一天）',!bad.length,J({bad,out}));
  const p8=post('zr8e'), w8=whenOfPost(p8);
  check('3. 2/12 回台中以後（第 8 則 2/15）：照舊臺灣時間 22:07',!!w8&&w8.day===DK('2028-02-15')&&Math.abs(w8.h-(22+7/60))<1e-6,J(w8));
  /* 遊戲裡照臺灣時間出：9/12 05:07 那一則 05:06 還沒有、05:07 有 */
  const d=DK('2027-09-12'); fresh(d-1,23); who('heroine_02','ACQ'); walk(d,5.1); const b0=item('zr1e'); walk(d,5+7/60+0.001);
  check('3. 遊戲的時鐘（臺灣時間）9/12 05:06 還沒有、05:07 有「到了。」',!b0&&!!item('zr1e')&&HT().includes('到了。'),J(item('zr1e'))); });

/* ---------- 4 私訊 ---------- */
sec('4',()=>{ if(!HAS()||!SET.Y2S2||!SET.Y3S1){ check('4. 私訊',false,'沒有資料'); return; }
  const D410=DK('2027-04-10');
  for(const [k,flag,want] of [[0,'congrats',['嗯。……我等一下再開心。現在先睡。']],[1,'senior',['他這次當法官。他說我講太快。']],[2,'watch',['好。你坐最後一排，不要讓我看到。']]]){ fresh(D410,21); who('kexin','FRIEND'); walk(D410,22.4); const b=tagged('kx_win').length; walk(D410,22.6); const got=answer('kx_win',k);
    check('4. 可昕（朋友）4/10 22:30 模擬法庭第二場「贏了。」三則，選第 '+(k+1)+' 個 → KX_WIN_DM '+flag,b===0&&J(tagged('kx_win').slice(0,3))===J(['贏了。','對方是大一的。……不算。','算啦。贏了就是贏了。'])&&J(got)===J(want)&&H.G.flags.KX_WIN_DM===flag,J(got)); }
  fresh(D410,21,{dating_kexin:true}); rel('kexin','ACQ'); contact('kexin'); walk(D410,23); check('4. 可昕交往中（只有認識的分數）：也有',tagged('kx_win').length===3,J(R().dm.kx_win));
  fresh(D410-32,12); who('kexin','ACQ'); walk(D410+1,14,{step:0.5}); check('4. 可昕沒有交往、只認識：沒有私訊（x:stage），動態第 1、2 則照樣看得到',!tagged('kx_win').length&&R().dm.kx_win==='x:stage'&&R().done.kx1d==='p'&&R().done.kx2d==='p',J({dm:R().dm.kx_win,kx1d:R().done.kx1d,kx2d:R().done.kx2d}));
  /* 學姊 2/7 10:00（交往中，不用回）*/
  const D27=DK('2028-02-07'); fresh(D27,9,{dating_heroine_05:true}); who('heroine_05','CLOSE'); walk(D27,9.9); const s0=tagged('sis_rest').length; walk(D27,10.1);
  check('4. 學姊（交往中）2/7 10:00「今天。」「我在家看小說。」，不用回',s0===0&&J(tagged('sis_rest'))===J(['今天。','我在家看小說。'])&&!dm('sis_rest'),J(tagged('sis_rest')));
  walk(D27,15.1); check('4. 同一天 15:00 動態第 5 則「放假。」（留言「寫到了？」）',!!item('sis5e')&&HT().includes('放假。')&&HT().includes('寫到了？'));
  fresh(D27,9); who('heroine_05','CLOSE'); walk(D27,11); check('4. 學姊很熟、沒有交往：沒有那兩則（x:stage）',!tagged('sis_rest').length&&R().dm.sis_rest==='x:stage',J(R().dm.sis_rest));
  /* 語彤 2027-07-09 生日 */
  const D79=DK('2027-07-09'), bmsg=()=>(H.G.msgs||[]).filter(m=>m.tag==='yt_bday_y2');
  fresh(D79,11); who('heroine_03','FRIEND'); PHONE.join(H.G,'noodle_team','麵店團'); walk(D79,11.9); const g0=bmsg().length; walk(D79,12.1); const g=bmsg();
  const n=(H.G.msgs||[]).length; PHONE.answer(H.G,'yt_bday_y2',0); const gr=(H.G.msgs||[]).slice(n).map(m=>[m.th,m.from,m.text]);
  check('4. 語彤 7/9 12:00（在麵店團群組）：Alison「今天語彤生日！」→「傳一句生日快樂」→ 你「生日快樂。」、她在群組回「……謝謝。今天第一次去田野。……」、YT_BDAY_Y2',
    g0===0&&g.length===1&&g[0].th==='g:noodle_team'&&g[0].from==='yu'&&g[0].text==='今天語彤生日！'&&J(g[0].ask.opts.map(o=>o.t))===J(['傳一句生日快樂'])
    &&J(gr)===J([['g:noodle_team','player','生日快樂。'],['g:noodle_team','heroine_03','……謝謝。今天第一次去田野。乾麵的阿伯說，生日還出來工作，很乖。']])&&H.G.flags.YT_BDAY_Y2===true,J({g:g.map(m=>[m.th,m.from,m.text]),gr}));
  walk(D79,21.1); check('4. 同一天 21:00 動態第 5 則（錄音筆、乾麵；留言「生日快樂！」→「謝謝。」）',!!item('yt5d')&&HT().includes('生日快樂！'));
  fresh(D79,11); who('heroine_03','FAM'); walk(D79,12.1); const s=bmsg();
  check('4. 不在群組、和語彤有點熟：她的私訊放系統字「今天是語彤的生日。」，同一個按鈕',s.length===1&&s[0].th==='p:heroine_03'&&!s[0].from&&s[0].text==='今天是語彤的生日。'&&J(s[0].ask.opts.map(o=>o.t))===J(['傳一句生日快樂']),J(s.map(m=>[m.th,m.from,m.text])));
  fresh(D79,11); who('heroine_03','ACQ'); walk(D79,13); check('4. 不在群組、只認識語彤：沒有',!bmsg().length);
  fresh(D79-1,23); who('heroine_03','FRIEND'); PHONE.join(H.G,'noodle_team','麵店團'); tickF(); jump(D79+1,8); check('4. 睡過整天（7/8 23:00 → 7/10 08:00）：不補（同 2026、2028 那兩則）',!bmsg().length);
  check('4. 2026、2028 的生日照舊在 home3d.js（yt_bday_y1）、r2y3b3d.js（yt_bday_y3）：這一則用自己的 tag（yt_bday_y2）',SET.Y2S2.ytBday.tag==='yt_bday_y2'&&SET.Y2S2.ytBday.flag==='YT_BDAY_Y2'); });

/* ---------- 5 稿的測試建議 ---------- */
sec('5',()=>{ if(!HAS()||!SET.Y2S2||!SET.Y3S1){ check('5. 稿的測試建議',false,'沒有資料'); return; }
  /* 以安大二下第 7 則（8/14 21:00 京都，很熟）*/
  const D814=DK('2027-08-14'), an7=(st,name)=>{ fresh(D814,20); who('heroine_01','CLOSE'); if(name) H.G.name=name; if(st) VAC.rec(H.G).reg['C12@Y2']=st; walk(D814,21.1); return {it:item('an7d'),h:HT()}; };
  let x=an7('yes'); const cmYes=x.h.includes('data-fd="an7d|cm"')&&x.h.includes('我也算？'); FEED.respond(H.G,'an7d','cm'); const rYes=th('heroine_01').slice(-2).map(m=>m.text);
  check('5. 以安第 7 則：報了 C12（京都語言課）、很熟＝同班那一版——照片「京都：祐廷」（玩家的名字）、留言「我也算？」→「去過的才寫。」',!!x.it&&x.it.v==='yes'&&x.h.includes('最新一行：「京都：祐廷」')&&cmYes&&J(rYes)===J(['我也算？','去過的才寫。']),J({v:x.it&&x.it.v,rYes}));
  x=an7('done','阿明'); check('5. 名字是玩家取的：「京都：阿明」（回來以後 done 也算）',!!x.it&&x.it.v==='yes'&&x.h.includes('「京都：阿明」')&&!x.h.includes('{name}'));
  x=an7(null); FEED.respond(H.G,'an7d','cm'); const rNo=th('heroine_01').slice(-2).map(m=>m.text);
  check('5. 沒報 C12：「京都：一個人」、留言「一個人也算？」→「算。我自己決定的。」',!!x.it&&x.it.v==='no'&&x.h.includes('「京都：一個人」')&&J(rNo)===J(['一個人也算？','算。我自己決定的。']),J({v:x.it&&x.it.v,rNo}));
  x=an7('missed'); check('5. 報了沒去（missed）：「京都：一個人」',!!x.it&&x.it.v==='no');
  fresh(D814,20); rel('heroine_01','ACQ'); VAC.rec(H.G).reg['C12@Y2']='yes'; const w1=FEED.WENT.anC12(H.G); rel('heroine_01','FAM'); const w2=FEED.WENT.anC12(H.G);
  check('5. 同班那一版要和以安 FAMILIAR 以上（同 vac_activities.js 的 AN_C12）：只認識＝不算、有點熟＝算',w1===false&&w2===true,J([w1,w2]));
  /* 子晴大二下第 6 則（8/17 01:30，朋友）*/
  const D817=DK('2027-08-17'), zq6=(setup)=>{ fresh(D817-1,23); who('heroine_04','FRIEND'); if(setup) setup(); walk(D817,1.6); return {it:item('zq6d'),h:HT()}; };
  let ans=null; let y=zq6(()=>{ const d=TDt('Y2S2',7,7); at(d,21.5);   /* 大二下第 7 週週日的那一組（needed_msgs 的 ask：need_<日>_zq_name；選項帶 need，phone3d.js 回了叫 STORY.neededAnswered）*/
    PHONE.postAt(H.G,{th:'p:heroine_04',from:'heroine_04',text:'不要太好聽。',ask:{id:'need_'+d+'_zq_name',grp:'need_'+d,max:1,until:T(d+7,21),opts:[{t:'『存檔點』。',say:[{from:'heroine_04',text:'哈哈哈好爛'}],need:'zq_name'}]}},d,21);
    ans=PHONE.answer(H.G,'need_'+d+'_zq_name',0); at(D817-1,23); });
  const named=H.G.flags.ZQ_NAME_REPLIED===true; FEED.respond(H.G,'zq6d','cm'); const zy=th('heroine_04').slice(-3).map(m=>m.text);
  check('5. 子晴第 6 則：回過 needed_msgs zq_name「『存檔點』。」（記 ZQ_NAME_REPLIED）＝留言「名字定了？」→「沒有」「這是真的存檔點」',named&&!!y.it&&y.it.v==='yes'&&y.h.includes('名字定了？')&&J(zy)===J(['名字定了？','沒有','這是真的存檔點']),J({named,v:y.it&&y.it.v,zy}));
  y=zq6(null); FEED.respond(H.G,'zq6d','cm'); const zn=th('heroine_04').slice(-3).map(m=>m.text);
  check('5. 沒回（或沒問）：留言「這是什麼？」→「存檔點」「走到這裡就不會白玩」；兩個版本照片都是「發光的小方塊」（還沒有名字）',!!y.it&&y.it.v==='no'&&J(zn)===J(['這是什麼？','存檔點','走到這裡就不會白玩'])&&y.h.includes('一個發光的小方塊'),J({v:y.it&&y.it.v,zn}));
  y=zq6(()=>{ PHONE.postAt(H.G,{th:'p:heroine_04',from:'heroine_04',text:'不要太好聽。',ask:{id:'need_500_zq_name',grp:'need_500',max:1,opts:[{t:'『存檔點』。',need:'zq_name'}]}},D817-60,21); const m=H.G.msgs.find(q=>q.ask&&q.ask.id==='need_500_zq_name'); m.ans=0; });
  check('5. 舊存檔（這一版以前回的，沒有 ZQ_NAME_REPLIED）：看訊息裡的 zq_name 回過＝取過名字的那一版',!H.G.flags.ZQ_NAME_REPLIED&&!!y.it&&y.it.v==='yes',J(y.it));
  /* 以安大三上第 7 則（2/6 21:00，很熟）日本路線 */
  const D26=DK('2028-02-06'), an7e=(route)=>{ fresh(D26,20,{EXCHANGE_ROUTE:route}); who('heroine_01','CLOSE'); walk(D26,21.1); const h=HT(); FEED.respond(H.G,'an7e','dm'); return {it:item('an7e'),h,r:th('heroine_01').slice(-2).map(m=>m.text)}; };
  const j=an7e('JP'), t=an7e('TW'), u=an7e(null);
  check('5. 以安大三上第 7 則「寫上去了。」：日本路線私訊問「會怕嗎？」→「會。……你也寫上去了嗎？」；臺灣路線、還沒定＝「會。所以先寫上去，就不能改了。」',
    !!j.it&&j.it.v==='yes'&&J(j.r)===J(['會怕嗎？','會。……你也寫上去了嗎？'])&&J(t.r)===J(['會怕嗎？','會。所以先寫上去，就不能改了。'])&&J(u.r)===J(t.r)&&j.h.includes('出發'),J({j:j.r,t:t.r,u:u.r}));
  /* 子晴大三上第 3 則「老高」、第 7 則「名字呢？」→「還沒」*/
  const W5SAT=TDt('Y3S1',5,6); fresh(W5SAT,22); who('heroine_04','FRIEND'); walk(W5SAT,23.1); const z3=HT();
  const D216=DK('2028-02-16'); fresh(D216-1,23); who('heroine_04','FRIEND'); walk(D216,0.8); FEED.respond(H.G,'zq7e','cm'); const z7=th('heroine_04').slice(-2).map(m=>m.text);
  check('5. 子晴大三上第 3 則（排行榜最下面「老高」）、第 7 則留言「名字呢？」→「還沒」（和 Q5 系列一致：還沒有名字）',z3.includes('最下面一個名字「老高」')&&J(z7)===J(['名字呢？','還沒']),J({z7}));
  /* 以安大三上第 5、6 則（31a4c4002：找住的地方、規則本給 Alison）*/
  const D113=DK('2028-01-13'); fresh(D113,20); who('heroine_01','FRIEND'); walk(D113,20.6); FEED.respond(H.G,'an6e','dm'); const a6=th('heroine_01').slice(-2).map(m=>m.text);
  check('5. 以安 1/13 第 6 則（31a4c4002）：筆記本「給 Alison」、私訊問「為什麼是 Alison？」→「她會遲到。所以那一條是寫給她的。」',HT().includes('下面一行「給 Alison」')&&J(a6)===J(['為什麼是 Alison？','她會遲到。所以那一條是寫給她的。']),J(a6)); });

H.done();
