#!/usr/bin/env node
/* CC-C（帳號 C）11-04：AA684_walk（BB-C 19:15 派工）——AA_684（企劃線 0382b8a34）、AA_683 第 1 節接進遊戲以後「照日期走一遍」。
   和 LAWWW-C 的 tests/aa684_canon_fix_unit.js（每一項自己設好狀態、挑幾個日子測）不同：這支照日期一格一格往前推（15 分鐘），
   把整段時間裡她在哪、手機收到什麼、事件哪一天成立都記下來，再逐字對 AA_684／AA_683。抓得到「只在測的那幾天對」的錯。
   1 D14 漁人碼頭：法律系四年每個週六、週日 12:00～20:00 走一遍——只有寒暑假週日 18:00～19:00 在漁人碼頭；夕陽那一項暑假看得到、寒假看不到（記給 AA）。
   2 重逢：每一趟國外的寒暑假活動（交往中、她沒同行），回來那天 17:54 走到見面那天——21:00「這週六我五點下班」「你來店裡」，見面排在最近的週六 17:15 一盞茶屋。
   3 阿哲：法律系四年每個上課日 17:30～20:00——週二、四 18:00～19:30 在燒臘店（noodle），其他時間不在；
     四個事件（ev_zhe_long_table、ev_zhe_court_skip、ev_bohan_group_heard、ev_zhe_scooter）在它的學期裡每 15 分鐘看一次（照作息放阿哲）＝只在週二、四 18:00～19:30 成立；
     第三個徵兆（騎樓 ev_yu_sign_question_arcade）：大一下第 12～16 週每天，玩家某個時間在燒臘店、之後走到公館——只有阿哲在店裡的時候去過才成立；台詞和修改前（5e84c4237）一字不差。
   4 桌遊夜：大一上到大四下每一個桌遊夜照順序演（旗標、關係、演過的事件接著帶）——Alison 趕到的旁白只在大一下第 14 週那一晚（字照 AA_684 第 5 項）；
     閒聊：四則新的照 AA_684 第 11 項的表演到、刪掉的 13 則一則都沒有。
   5 Y2S2 語彤告白：時段第一天 09:00 走到時段最後一天 23:45——邀約在最後一科考完那天（6/11 五）20:30、答應以後晚餐排 6/12（六）17:30 一盞茶屋；其他學期也照「考完那天邀約、之後第一個週六」列表。
   6 期末邀約不能被吃掉（BB-C 19:15 的規則；LAWWW-C 在改＝TE-HEART-EXEMPT-1104）：Y2S2 語彤＋兩位朋友（阿哲、芯慈）——
     A 先接語彤的：朋友的期末邀約照樣到、照樣能接（排在別的晚上）；B 不接語彤的：朋友的照常；改好以前先跑、FAIL 照實記。
   7 AA683：法律系四年的燒臘店過年店休，每天走——群組 A（店休第一天 21:00）、D（初四 12:00）照舊、字照 AA_612 換好的；按門＝只有鐵門那一句；
     語彤刷椅子那一段、NOODLE_CLEAN、店休期間約她換句排 18:00 以後都不再出現；那天店裡有約＝照常進去。
   【前置／捷徑】pg_harness 的假 GM（不需要瀏覽器）；關係、約會次數、旗標、交往直接設；寒暑假活動直接記成 done；事件的 3D 人物照作息放在玩家旁邊。
   r2（BB-C 19:38）：期望值照 AA_685（企劃線 c96613e51／91f240e50）改——D14 18:00～20:00＋海風與燈、重逢回到臺北那天約＋這週六／下週六、告白邀約新句、閒聊只演一次、群組阿哲傳、選項拿掉。
   用法：LW_ROOT=<開發分支的 src、tests、index.html> [OLD_ROOT=<修改前 5e84c4237 的同樣三樣>] node cc_aa684_walk.js
   AA_684、AA_683 用 git show 讀（CC_REPO＝有企劃線物件的 repo，預設這個檔所在的 repo）。 */
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(process.env.LW_ROOT||path.join(__dirname,'..','..','..','..'));
const CC_REPO=process.env.CC_REPO||path.resolve(__dirname,'..','..','..','..');
const DUMP=process.env.DUMP==='1';
require(path.join(ROOT,'tests','alison.js'));
const H=require(path.join(ROOT,'tests','pg_harness.js'));
const {GM}=H, J=JSON.stringify;
let FAILS=0, PASSES=0; const check=(name,ok,inf)=>{ console.log((ok?'PASS ':'FAIL ')+name+(inf?'　'+inf:'')); if(ok) PASSES++; else FAILS++; return ok; };
const info=s=>console.log('INFO '+s);
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
const loadErr=[];
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,120)); } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const YT='heroine_03', MX='classmate_mingxuan', XC='classmate_xinci', BH='classmate_bohan';
const DK=k=>STORY.dayOfKey(k), K=d=>d==null?null:CALENDAR.dateOf(d).key, WD=d=>CALENDAR.dateOf(d).wd%7, WDN=d=>'日一二三四五六'[WD(d)];
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=WD(d); if(zone) H.G.zone=zone; };
const fresh=(d,h,zone,flags)=>{ H.fresh(K(d),h,zone,flags); at(d,h); if(!H.G.contacts) H.G.contacts={}; return H.G; };
const hm=h=>{ const x=Math.round(h*60); return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0'); };
const says=()=>H.said.map(s=>(s.who?s.who+'：':'')+s.t);
const tick=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const walk=(d0,h0,d1,h1,st,each)=>{ st=st||0.25; for(let d=d0;d<=d1;d++){ const a=d===d0?h0:0, b=d===d1?h1:23.99; for(let h=a;h<=b+1e-9;h+=st){ at(d,+h.toFixed(3)); tick(); if(each) each(d,+h.toFixed(3)); } } };
const putNpc=id=>{ const n={id,charId:id,obj:{position:{x:0,y:0,z:0.5}},lv:0}; GM.npc[id]=n; H.E.npcs.push(n); return n; };
const clearNpc=()=>{ GM.npc={}; H.E.npcs.length=0; };
const ev=id=>STORY_EVENTS.find(e=>e&&e.id===id);
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/[^\n]*/g,'$1');
const dlgTexts=e=>(e&&e.dialogue||[]).filter(l=>l&&l.text!=null).map(l=>(l.speaker||'')+'｜'+l.text);
const ZEV=['ev_zhe_long_table','ev_zhe_court_skip','ev_bohan_group_heard','ev_zhe_scooter','ev_yu_sign_question_arcade'];

/* 修改前那一版（OLD_ROOT）只印這五個事件的台詞給主程式比 */
if(DUMP){ const o={}; for(const id of ZEV) o[id]=dlgTexts(ev(id)); process.stdout.write('@@DUMP'+J(o)+'\n'); process.exit(0); }

const gitShow=(rev,p)=>{ try{ return cp.execFileSync('git',['-C',CC_REPO,'-c','core.quotepath=off','show',rev+':'+p],{encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const AA684=gitShow('0382b8a34','docs/story_planning/AA_684_回LAWWW_AA675與679接線的十二件.md');
const AA683=gitShow('origin/claude/magical-albattani-bk7b4n','docs/story_planning/AA_683_台詞第十五批_收尾與燒臘店過年店休.md');
const inDoc=t=>!!AA684&&AA684.includes(t);
const HEADSHA=process.env.SHA||'?';

(async()=>{
console.log('cc_aa684_walk　LW_ROOT='+ROOT+'　SHA='+HEADSHA);
check('0. 載得到：BGN、ENC、TRIP、TERMEND、VAC、VAC_DATA、NOODLE_TABLE、NOODLE_CLOSED；AA_684（0382b8a34）、AA_683 讀得到',typeof BGN!=='undefined'&&typeof ENC!=='undefined'&&typeof TRIP!=='undefined'&&typeof TERMEND!=='undefined'&&typeof VAC!=='undefined'&&typeof NOODLE_TABLE!=='undefined'&&typeof NOODLE_CLOSED!=='undefined'&&!!AA684&&!!AA683,loadErr.length?('載入錯誤 '+J(loadErr.slice(0,4))):'');
const SRC=ORDER.filter(f=>fs.existsSync(path.join(ROOT,f))).map(f=>[f,strip(fs.readFileSync(path.join(ROOT,f),'utf8'))]);
const grepSrc=re=>SRC.filter(([f,s])=>re.test(s)).map(([f])=>f);
const sec=async(n,f)=>{ console.log('\n===== '+n); try{ await f(); }catch(e){ check(n+'：丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } clearNpc(); };
const LAW0=DK('2025-09-01'), LAW1=DK('2029-06-30');

/* ================= 1 漁人碼頭 D14 ================= */
await sec('1 D14 漁人碼頭 18:00 起',()=>{
  const row=ENCOUNTERS.rows.find(r=>r.who===YT&&r.spot==='D14');
  const bad=[], vacSun=[], miss=[], away=[], mid=new Map(), sunset={summer:[0,0],winter:[0,0]}, wnoSun=[];
  fresh(LAW0,12,'dorm',{WISH_DONE_heroine_03:true}); H.FRIEND(YT);
  for(let d=LAW0;d<=LAW1;d++){ const w=WD(d); if(w!==0&&w!==6) continue; const vac=!!HOME.breakOf(d);   /* 寒暑假＝HOME.breakOf（學期中的國定假日不算）*/
    let seen18=0;
    for(let h=12;h<=20+1e-9;h+=0.25){ at(d,h); const e=STORY.schedEnt(CHARACTERS[YT],H.G), z=e?(e.zone||('out:'+(e.enc||e.away||''))):null; let el=null; { const wq=[]; el=ENC.eligible(H.G,row,wq)?'ok':null; }
      const inWin=w===0&&vac&&h>=18&&h<20;   /* AA_685 B1：18:00～20:00 */
      if((z==='out:D14'||el==='ok')&&!inWin) bad.push(K(d)+'（'+WDN(d)+'）'+hm(h)+' '+z+' '+(el||''));
      if(inWin&&z==='out:D14'&&el==='ok') seen18++;
      if(w===0&&vac&&h>=17&&h<18){ mid.set(z,(mid.get(z)||0)+1); } }
    if(w===0&&vac){ vacSun.push(d); if(seen18<8){ at(d,18.25); const p=STORY.presence(YT,H.G); (p.here?miss:away).push(K(d)+' 只有 '+seen18+'/8 格'+(p.here?'':'（她不在：'+(p.away||p.kind||'')+'）')); } const ss=TRIP.sunset({day:d}), ok=ss+10/60>=18&&ss-40/60<=20, m=CALENDAR.dateOf(d).m, sea=(m>=6&&m<=9)?'summer':'winter'; sunset[sea][ok?0:1]++; if(sea==='winter'&&!ok&&wnoSun.length<3) wnoSun.push(K(d)+' 日落 '+hm(ss)); } }
  check('1. 法律系四年的週六、週日 12:00～20:00（每 15 分鐘）：漁人碼頭（作息 out:D14 或偶遇成立）只出現在寒暑假週日 18:00～20:00（AA_685 B1）',!bad.length,bad.length?('不在時段的 '+bad.length+' 格：'+J(bad.slice(0,6))):('寒暑假週日 '+vacSun.length+' 天'));
  check('1. 寒暑假每個週日（她人在臺北的）18:00～19:45 每 15 分鐘（8 格）都在漁人碼頭、偶遇成立（WISH_DONE、FRIEND）',!miss.length,miss.length?(miss.length+' 天不齊：'+J(miss.slice(0,6))):'');
  if(away.length) info('1. 寒暑假週日她人不在臺北（出遠門）的 '+away.length+' 天沒有漁人碼頭：'+J(away));
  info('1. 寒暑假週日 17:00～17:59 她在哪（下班、搭捷運回淡水那一段）：'+J([...mid.entries()]));
  check('1. 夕陽那一項（日落 −40 分～+10 分）：暑假的週日 18:00～20:00 碰得到',sunset.summer[1]===0&&sunset.summer[0]>0,'暑假 碰得到 '+sunset.summer[0]+'／碰不到 '+sunset.summer[1]);
  info('1. 寒假週日 18:00 以後夕陽碰不到 '+sunset.winter[1]+' 天（碰得到 '+sunset.winter[0]+'）：例 '+J(wnoSun)+'——AA_684 第 1 項「寒假天黑得早，夕陽換成橋上的燈，換不了的記下來給 AA」：遊戲裡那一項灰掉、沒有橋上的燈的句子（記給 AA）');
  check('1. AA_684 第 1 項的字：「**18:00 起**」',inDoc('**18:00 起**'));
  /* AA_685 C 節第 1 點（BB-C 19:38 ①）：日落以後（寒假 18:00 以後、暑假日落以後）同行換「海風與燈」，語彤那兩句 */
  { const sp=TRIP.spot('D14'), li=sp&&sp.points.find(q=>q.id==='D14.lights'), su=sp&&sp.points.find(q=>q.id==='D14.sunset');
    check('1. D14 有「海風與燈」那一項（D14.lights；AA_685 是 nightOf D14.sunset，AA_686 源稿補了以後是 night:true）',!!li&&li.label==='海風與燈'&&(li.nightOf==='D14.sunset'||li.night===true)&&!!su,J(li));
    const WANTL={friend:['橋上的燈亮了。要拍的話就是現在。'],dating:['你站過去一點。好，不要動。']}, wl=(ENC_WALK.walk||[]).find(q=>q.who===YT&&q.spot==='D14'&&q.act==='D14.lights');
    check('1. 「海風與燈」語彤的兩句逐字 AA_685 C 節（朋友版「橋上的燈亮了。要拍的話就是現在。」、交往版「你站過去一點。好，不要動。」）',!!wl&&J(wl.friend)===J(WANTL.friend)&&J(wl.dating)===J(WANTL.dating),J(wl&&{friend:wl.friend,dating:wl.dating}));
    const badL=[], cnt={summerDay:0,summerNight:0,winterNight:0,winterDay:0};
    for(const d of vacSun){ for(const tier of ['friend','dating']){ fresh(d,18,'dorm',Object.assign({WISH_DONE_heroine_03:true},tier==='dating'?{dating_heroine_03:true}:{})); if(tier==='dating') H.CLOSE(YT); else H.FRIEND(YT);
      H.G.trip={spot:'D14',with:{who:YT,tier:tier},done:[],p:[]};
      for(let h=18;h<20-1e-9;h+=0.25){ at(d,h); const ss=TRIP.sunset(H.G), night=h>ss+10/60+1e-6; let on=null; try{ on=!!TRIP.nightOn(H.G,sp,li); }catch(e){ on='err:'+String(e.message).slice(0,60); }
        const m=CALENDAR.dateOf(d).m, sea=(m>=6&&m<=9)?'summer':'winter'; if(tier==='friend') cnt[sea+(night?'Night':'Day')]++;
        if(on!==night) badL.push(K(d)+' '+hm(h)+' '+tier+' 日落 '+hm(ss)+' nightOn='+on+' 應該='+night); }
      H.G.trip={spot:'D14',done:[],p:[]}; for(const ah of [18,19.5]){ at(d,ah); const ss=TRIP.sunset(H.G), night=ah>ss+10/60+1e-6; let alone=null; try{ alone=!!TRIP.nightOn(H.G,sp,li); }catch(e){ alone='err'; } if(alone!==night) badL.push(K(d)+' '+hm(ah)+' 一個人 nightOn='+alone+' 應該='+night); } } }
    check('1. D14.lights 一個人的旁白兩句逐字 AA_686 第 5 項',J(li&&li.lines)===J(['天黑以後，情人橋上的燈一排一排亮起來。你找了一段沒有人的欄杆靠著。','今天風很大，橋上的燈一直被吹得晃來晃去。']),J(li&&li.lines));
    check('1. 寒暑假每個週日 18:00～19:45、朋友版和交往版：日落 +10 分以後（「太陽已經下山了」）才換成「海風與燈」，之前是夕陽那一項；一個人來也一樣（AA_686 第 5 項）',!badL.length,badL.length?(badL.length+' 格不對：'+J(badL.slice(0,5))):J(cnt)); }
});

/* ================= 2 重逢（AA_685 B2：她回到臺北那天 21:00 約、那天以後第一個她有班的週六 17:15；平日約＝「這週六」、週末約＝「下週六」）================= */
await sec('2 重逢：回到臺北那天 21:00 約、之後第一個有班的週六 17:15',()=>{
  const R=VAC_DATA.TRIP_MSG.reunion[YT], rows=[], bad=[], A685=gitShow('origin/claude/magical-albattani-bk7b4n','docs/story_planning/AA_685_回LAWWW_第二輪十項.md');
  info('2. 語彤那一場的設定：'+J(Object.fromEntries(Object.entries(R).filter(([k,v])=>typeof v!=='function').map(([k,v])=>[k,typeof v==='object'?v:v]))).slice(0,400));
  check('2. AA_685 B2 讀得到（「這週六我五點下班」「下週六我五點下班」）',/這週六我五點下班/.test(A685)&&/下週六我五點下班/.test(A685));
  const left=grepSrc(/明天我五點下班/), lv=left.filter(f=>/vac/.test(f));
  check('2. 舊的重逢句「明天我五點下班」寒暑假的程式（vac*.js）裡（去掉註解）沒有',!lv.length,J(lv));
  const IS=[]; for(const id in VAC_DATA.A){ const a=VAC_DATA.A[id]; for(const yk of ['Y1','Y2','Y3','Y4']){ const I=VAC.inst(id,yk); if(I&&I.A&&I.A.place&&I.A.place.kind==='abroad') IS.push(I); } }
  const today=[];
  for(const I of IS){ fresh(I.to,17.9,'dorm',{dating_heroine_03:true}); H.CLOSE(YT); VAC.rec(H.G).reg[I.key]='done'; const mate=VAC.mates&&VAC.mates(I).has(YT);
    const onTrip=d=>{ const p=STORY.presence(YT,Object.assign({},H.G,{day:d,hour:21})); return !p.here&&p.kind==='trip'; };
    let ret=I.to; while(ret<I.to+40&&onTrip(ret)) ret++;   /* 她回到臺北的那一天＝她自己出遠門（trip）回來的那一天；寒暑假平日在淡水不算不在（玩家回來那天她沒出遠門＝那天）*/
    const works=d=>{ const G2=Object.assign({},H.G,{day:d,hour:16,weekday:WD(d)}); const e=STORY.schedEnt(CHARACTERS[YT],G2); return !!e&&e.zone==='wz_teahouse'&&!onTrip(d)&&!(typeof NOODLE_CLOSED!=='undefined'&&NOODLE_CLOSED.closed(H.G,d)); };   /* 茶屋過年和燒臘店同一段休息（AA_685 A4）*/
    let first=ret+1; while(WD(first)!==6) first++; let meet=first; while(meet<ret+70&&!(WD(meet)===6&&works(meet))) meet++;
    const send=ret;   /* AA_685 D 節第 1 點（企劃線 2d4d5dc72）：一律回到臺北那天 21:00 就約（不再挪到見面前一個週六）*/
    const md=CALENDAR.dateOf(meet), dateWord=md.m+'/'+md.d+' 那個週六我五點下班', newYear=meet!==first&&typeof NOODLE_CLOSED!=='undefined'&&NOODLE_CLOSED.closed(H.G,first);
    const word=meet!==first?dateWord:((WD(send)>=1&&WD(send)<=5)?'這週六我五點下班':'下週六我五點下班');   /* 中間隔了她沒班的週六＝用日期講（D 節）*/
    const wantTx=(newYear?['茶屋過年休息']:[]).concat([word,'你來店裡']);   /* 隔掉的是過年茶屋休息＝最前面多「茶屋過年休息」（D 節）*/
    walk(I.to,17.9,Math.min(meet,I.to+60),18,0.25);
    const M=(H.G.msgs||[]).filter(m=>m.tag==='vac_re_'+I.key+'_'+YT).map(m=>[K(m.day),m.h,m.text]), q=OUT.get(H.G,'vac_'+I.key+'_re_'+YT);
    const r={key:I.key,back:K(I.to)+'（'+WDN(I.to)+'）',ret:K(ret)+'（'+WDN(ret)+'）',want:[K(send)+' 約',K(meet)+'（'+WDN(meet)+'）',wantTx.join('／')],mate:!!mate,msgs:M,out:q?[K(q.day)+'（'+WDN(q.day)+'）',q.h,q.place,q.state]:null}; rows.push(r);
    if(M.some(m=>/今天我五點下班/.test(m[2]))) today.push(I.key);
    if(mate){ if(M.length||q) bad.push(r); continue; }
    const same=(VAC.rec(H.G).reSame||{})['vac_re_'+I.key+'_'+YT]; if(same!=null){ r.note='和前一趟排到同一個週六（V.reSame）＝不再約'; continue; }
    if(meet!==first) r.note='第一個週六（'+K(first)+'）她沒班'+(newYear?'（過年茶屋休息）':'')+'＝見面排 '+K(meet)+'；AA_685 D 節：回到臺北那天就約、用日期講';
    const mOk=M.length===wantTx.length&&M.every(m=>m[0]===K(send)&&m[1]>=21&&m[1]<21.5)&&J(M.map(m=>m[2]))===J(wantTx);
    if(!mOk||!q||q.day!==meet||q.h!==17.25||q.place!=='一盞茶屋') bad.push(r); }
  for(const r of rows) console.log('     '+r.key+'　回來 '+r.back+'　她回到臺北 '+r.ret+(r.mate?'　（她同行）':'')+'　照規則 '+J(r.want)+'　訊息 '+J(r.msgs)+'　見面 '+J(r.out)+(r.note?'　'+r.note:''));
  check('2. 每一趟國外的（'+IS.length+' 趟）：她回到臺北那天 21:00～21:29「這週六／下週六我五點下班」（平日／週末；中間隔了她沒班的週六＝「{月}/{日} 那個週六我五點下班」，隔掉的是過年＝前面多「茶屋過年休息」，AA_685 D 節）「你來店裡」，見面排在那天以後第一個她有班的週六 17:15 一盞茶屋；她同行的沒有',!bad.length,bad.length?J(bad.slice(0,3)):'');
  check('2. 「今天我五點下班」不再用（AA_685 B2③）',!today.length,J(today));
});

/* ================= 3 阿哲週二、四 18:00～19:30 燒臘店 ================= */
let OLD=null;
if(process.env.OLD_ROOT){ try{ const o=cp.execFileSync(process.execPath,[__filename],{env:Object.assign({},process.env,{LW_ROOT:process.env.OLD_ROOT,DUMP:'1'}),encoding:'utf8',maxBuffer:1<<26}); const m=/@@DUMP(.*)/.exec(o); OLD=m?JSON.parse(m[1]):null; }catch(e){ info('修改前那一版讀不到：'+String(e.message).slice(0,160)); } }
await sec('3 阿哲的燒臘店作息＋四個事件＋騎樓的徵兆',async()=>{
  const wrong=[], other=new Map(); let inN=0, slots=0;
  fresh(LAW0,17.5,'dorm');
  for(let d=LAW0;d<=LAW1;d++){ if(CALENDAR.kind(d)!=='term') continue; const w=WD(d);
    for(let h=17.5;h<=20+1e-9;h+=0.25){ at(d,h); const x=STORY.whereIs(GM,'zhe'), z=x?(x.zone||x.away||''):'', an=STORY.zheAtNoodle(H.G), want=(w===2||w===4)&&h>=18&&h<19.5;
      if((z==='noodle')!==an) wrong.push(K(d)+' '+hm(h)+' whereIs='+z+' zheAtNoodle='+an);
      if(z==='noodle'&&!want) wrong.push(K(d)+'（'+WDN(d)+'）'+hm(h)+' 在燒臘店');
      if(want){ slots++; if(z==='noodle') inN++; else other.set(z,(other.get(z)||0)+1); } } }
  check('3. 法律系四年每個上課日 17:30～20:00（每 15 分鐘）：阿哲只有週二、四 18:00～19:30 在燒臘店；whereIs 和 zheAtNoodle 一致',!wrong.length,wrong.length?(wrong.length+' 格：'+J(wrong.slice(0,6))):'');
  info('3. 週二、四 18:00～19:29 共 '+slots+' 格，在燒臘店 '+inN+' 格；不在的（有學期的作息先算）：'+J([...other.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8)));
  /* 四個事件：在它可能的學期裡每 15 分鐘看一次 */
  const PRE={ev_zhe_long_table:{},ev_zhe_court_skip:{ZHE2_ASKED:true},ev_bohan_group_heard:{},ev_zhe_scooter:{}};
  for(const id of ['ev_zhe_long_table','ev_zhe_court_skip','ev_bohan_group_heard','ev_zhe_scooter']){ const e=ev(id); if(!check('3. '+id+' 在',!!e)) continue;
    const terms=e.term||['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'], hits=[], badH=[];
    for(const t of terms){ const r=CALENDAR.termDays(t); if(!r) continue;
      for(let d=r.from;d<=r.to;d++){ fresh(d,17.5,'noodle',Object.assign({},PRE[id])); if(id==='ev_zhe_scooter') SOCIAL.remember('zhe','ZHE_SCOOTER','');
        for(let h=17.5;h<=20.5+1e-9;h+=0.25){ at(d,h,'noodle'); clearNpc(); const x=STORY.whereIs(GM,'zhe'); if(x&&x.zone==='noodle') putNpc('zhe'); let ok=false; try{ ok=!!EVENTS.check(e); }catch(err){ ok=false; }
          if(ok){ hits.push([d,h]); const w=WD(d); if(!((w===2||w===4)&&h>=18&&h<19.5)) badH.push(K(d)+'（'+WDN(d)+'）'+hm(h)); } } } }
    const days=[...new Set(hits.map(x=>x[0]))];
    check('3. '+id+'：成立的時間都在週二、四 18:00～19:30（阿哲照作息在燒臘店）',hits.length>0&&!badH.length,hits.length?('成立 '+days.length+' 天，第一次 '+K(hits[0][0])+'（'+WDN(hits[0][0])+'）'+hm(hits[0][1])+(badH.length?'；時段外 '+J(badH.slice(0,5)):'')):'一次都沒成立（演不到）');
    if(hits.length){ const [d,h]=hits[0]; fresh(d,h,'noodle',Object.assign({},PRE[id])); if(id==='ev_zhe_scooter') SOCIAL.remember('zhe','ZHE_SCOOTER',''); putNpc('zhe'); H.said=[]; await EVENTS.runLines(e.dialogue,e); const L=says();
      info('3. '+id+' 第一次成立那一格演出來：'+J(L).slice(0,300)); }
    if(OLD) check('3. '+id+'：台詞和修改前（5e84c4237）一字不差',J(dlgTexts(e))===J(OLD[id]),J(dlgTexts(e))===J(OLD[id])?'':('現在 '+J(dlgTexts(e)).slice(0,200)+'；修改前 '+J(OLD[id]).slice(0,200))); }
  /* 第三個徵兆（騎樓）：大一下第 12～16 週每天，玩家 h0 在燒臘店 → h0+0.25 走到公館 */
  const ar=ev('ev_yu_sign_question_arcade'), okD=[], badA=[];
  for(const wk of [12,13,14,15,16]) for(let wd=1;wd<=7;wd++){ const d=STORY.termDayIn('Y1S2',wk,wd===7?0:wd); if(d==null) continue;
    for(let h0=17.5;h0<=19.75+1e-9;h0+=0.25){ fresh(d,h0,'noodle',{met_yu:true,yu2SoymilkDay:d-1}); STORY.zheNdlMark(H.G); at(d,h0+0.25,'gongguan'); let s=false; try{ s=!!EVENTS.check(ar); }catch(e){}
      const want=[13,14,15].includes(wk)&&(WD(d)===2||WD(d)===4)&&h0>=18&&h0<19.5; if(s) okD.push(K(d)+'（'+WDN(d)+'）'+hm(h0)); if(s!==want) badA.push(K(d)+'（'+WDN(d)+'）第 '+wk+' 週 '+hm(h0)+' 成立='+s+' 應該='+want); } }
  check('3. 騎樓的徵兆：大一下第 13～15 週的週二、四，18:00～19:29 在燒臘店（阿哲在）以後走到公館才成立；其他日子、17:30～17:59、19:30 以後去燒臘店都不成立',!badA.length,badA.length?(badA.length+' 格不對：'+J(badA.slice(0,6))):('成立 '+okD.length+' 格'));
  if(OLD) check('3. 騎樓的徵兆：台詞和修改前一字不差',J(dlgTexts(ar))===J(OLD.ev_yu_sign_question_arcade));
  check('3. AA_684 第 4 項的字：「週二、四 18:00～19:30 在公館燒臘吃晚餐」',inDoc('週二、四 18:00～19:30 在公館燒臘吃晚餐'));
});

/* ================= 4 桌遊夜：Alison 趕到的旁白＋閒聊 ================= */
await sec('4 桌遊夜（大一上～大四下照順序）',async()=>{
  const B=BGN, T='（十一點多，門口的風鈴響了一聲。Alison 還穿著戲院的外套，手上抱著一袋爆米花。）';
  check('4. 旁白一字照 AA_684 第 5 項',B.LINES.yuIn===T&&inDoc(T),B.LINES.yuIn);
  const ALL=['zhe','yu',BH,XC,MX]; let carry=null; const rows=[], yuAt=[], talks=[];
  for(const t of B.TERMS){ for(const wk of B.weeks(t)){ const d=STORY.termDayIn(t,wk,5); if(d==null||!B.isNight(d)) continue;
    fresh(d,20,'dorm',Object.assign({afternoonDone:true},carry?carry.flags:{})); if(carry){ H.G.social=carry.social; SOCIAL.bind(H.G); H.G.events=carry.events; }
    PHONE.join(H.G,'noodle_team','桌遊團'); for(const id of ALL){ if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.remember(id,'FIRST_MET',''); if(!carry) H.FAMILIAR(id); } H.G.flags.met_yu=true; if(H.G.flags.noodleTableDay==null) H.G.flags.noodleTableDay=d-70;
    const O0=Object.assign({},H.G.flags.ndlTalkOnce||{}), N0=J(H.G.flags.ndlTalkN||{});
    H.said=[]; await EVENTS.runLines(B.EVENT.dialogue,B.EVENT); const L1=says(); H.G.flags.BGN_N=(H.G.flags.BGN_N|0)+1;
    /* 閒聊是桌遊夜事件自己演的（B.EVENT 的 dialogue 裡）——r1 另外叫 B.talk＝一晚演兩則（AA_685 B5 只演一次以後才看得出來，探針的 bug）：看這一晚 ndlTalkOnce 多了哪一則，從 L1 裡把那一則的句子挑出來 */
    const O1=H.G.flags.ndlTalkOnce||{}, nk=Object.keys(O1).filter(k=>O0[k]==null); let L2=[];
    for(const k of nk){ for(const g in NOODLE_TABLE) NOODLE_TABLE[g].forEach((e,i)=>{ if(B.talkKey(g,i,e)!==k) return; const tx=(e.dialogue||[]).filter(l=>l&&l.text).map(l=>l.text); L2=L2.concat(L1.filter(x=>tx.some(t=>x===t||x.endsWith('：'+t)))); }); }
    if(nk.length>1) L2.unshift('（一晚演了 '+nk.length+' 則：'+nk.join('、')+'）');
    const tm=CALENDAR.termOf(d); rows.push({d,t,wk:tm&&tm.week,yu:L1.includes(T),talk:L2}); if(L1.includes(T)) yuAt.push(t+' 第 '+(tm&&tm.week)+' 週 '+K(d)); talks.push([t,L2]);
    carry={flags:H.G.flags,social:H.G.social,events:H.G.events}; } }
  info('4. 桌遊夜 '+rows.length+' 晚；每晚閒聊第一句：'); for(const r of rows) console.log('     '+r.t+' 第 '+r.wk+' 週 '+K(r.d)+(r.yu?'　★Alison 趕到':'')+'　'+(r.talk[0]||'（沒有閒聊）').slice(0,60));
  check('4. Alison 趕到的旁白只在大一下第 14 週那一晚（一次）',yuAt.length===1&&/^Y1S2 第 14 週/.test(yuAt[0]),J(yuAt));
  /* 閒聊：AA_684 第 11 項的表 */
  const NM={芯慈:XC,阿哲:'zhe',明軒:MX,老闆:null}, dn=id=>id?SOCIAL.displayName(id):'老闆';
  const cell=lab=>{ const ln=AA684.split('\n').find(l=>l.startsWith('| '+lab)); if(!ln) return null; return ln.split('|')[2].trim().split('／').map(x=>{ x=x.trim(); const m=/^([^：（]+)：(.+)$/.exec(x); return m?dn(NM[m[1]])+'：'+m[2]:x; }); };
  const NEW=[['大一（取代',/^Y1/],['大二（取代',/^Y2/],['大三上（補空缺',/^Y3S1/],['大四（取代',/^Y4/]];
  for(const [lab,re] of NEW){ const want=cell(lab), got=talks.filter(([t,L])=>re.test(t)&&want&&J(L)===J(want));
    check('4. 新的那一則「'+(want&&want[0]||lab).slice(0,24)+'…」照 AA_684 第 11 項逐字、在對的學期演到（'+lab.replace('（','')+'）',!!want&&got.length>=1,got.length?('演在 '+got.map(x=>x[0]).join('、')):('沒演到；那幾年演的：'+J(talks.filter(([t])=>re.test(t)).map(([t,L])=>t+' '+(L[0]||'')).slice(0,6)).slice(0,300))); }
  const GONE=['Alison 把滷蛋切成四份','語彤從櫃台後面走過來','吃到一半停電了三秒','阿哲的滷蛋少了半顆','考試前的燒臘店','欸，下禮拜的報告分組','他暑假要去事務所實習','阿姨把電視轉到新聞','對了，司法官的補習班','長桌少了一個人','欸，畢業以後還是要來吃燒臘','牆上的紅紙又多了兩張','阿哲把大家的碗疊起來'];
  const said=J(talks.map(x=>x[1])), gl=GONE.filter(g=>said.includes(g)), gs=GONE.filter(g=>grepSrc(new RegExp(g.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))).length);
  { const firsts=talks.map(([t,L])=>L[0]).filter(Boolean), dup=[...new Set(firsts.filter((x,i)=>firsts.indexOf(x)!==i))];
    check('4. 閒聊每一則每個存檔只演一次（AA_685 B5；44 晚照順序演、旗標接著帶）',!dup.length,dup.length?('重複的：'+J(dup.slice(0,5))):(firsts.length+' 晚有閒聊、'+(talks.length-firsts.length)+' 晚沒有（那一學期的用完了）'));
    const narr=[]; for(const k in NOODLE_TABLE) for(const e of NOODLE_TABLE[k]) for(const l of (e.dialogue||[])) if(l&&l.text&&!l.speaker&&!/^（/.test(l.text)) narr.push(k+'：'+l.text.slice(0,30));
    check('4. 長桌（桌遊夜）閒聊的旁白一律有括號（AA_685 B5）',!narr.length,J(narr.slice(0,6))); }
  check('4. 刪掉的 13 則：四年的桌遊夜一則都沒演、程式裡也沒有',!gl.length&&!gs.length,J({演到:gl,程式裡:gs}));
});

/* ================= 5 Y2S2 語彤告白 ================= */
const teSetup=(w,friends)=>{ fresh(w.from,9,'campus'); H.G.stage='law'; SOCIAL.remember(YT,'FIRST_MET',''); H.rel(YT,70,50,45); SOCIAL.rel(YT).npcRom=40; DATE.log(H.G,YT).count=4; DATE.log(H.G,YT).wish=true;
  for(const id of (friends||[])){ SOCIAL.remember(id,'FIRST_MET',''); H.FRIEND(id); const C=(H.G.termend||(H.G.termend={})).contact||(H.G.termend.contact={}); (C[w.id]||(C[w.id]={}))[id]={pts:id==='zhe'?12:9,k:{}}; } };
const teMsgs=w=>(H.G.msgs||[]).filter(m=>/^te_/.test(m.tag||'')).map(m=>({d:K(m.day)+'（'+WDN(m.day)+'）',h:m.h,from:m.from,text:m.text,tag:m.tag,ask:m.ask?m.ask.id:null}));
await sec('5 Y2S2 語彤告白：考完那天 20:30 邀約、第一個週六 17:30',()=>{
  const h=TERMEND_LINES.HEART[YT];
  check('5. 基本版邀約換成「禮拜六我上班到五點。下班以後，我泡茶。只有我們。」（AA_685 B3，不再自相矛盾）',h.invite==='禮拜六我上班到五點。下班以後，我泡茶。只有我們。',h.invite);
  { const f=(TERMEND_LINES.FRIEND||{})[YT]; check('5. 期末飯 y1s1「禮拜六我上到五點。下班以後，要吃飯嗎？」（AA_685 B3）',!!f&&f.y1s1==='禮拜六我上到五點。下班以後，要吃飯嗎？',J(f&&f.y1s1)); }
  check('5. 邀約句：基本版「打烊以後」改「下班以後」（invite、invite2），AA_684 第 6 項②',/下班以後/.test(h.invite)&&/下班以後/.test(h.invite2)&&!/打烊以後/.test(h.invite+h.invite2)&&inDoc('「打烊以後」改「下班以後」'),J([h.invite,h.invite2]));
  const rows=[];
  for(const t of ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1']){ const w=TERMEND.windowOf(t); if(!w) continue; teSetup(w); let asked=null;
    walk(w.from,9,w.to,23.75,0.25,(d,hh)=>{ if(asked) return; const m=(H.G.msgs||[]).find(x=>x.tag==='te_'+t+'_'+YT&&x.ask); if(m&&(d>m.day||(d===m.day&&hh>=m.h))){ asked={day:m.day,h:m.h,text:m.text}; PHONE.answer(H.G,'te_'+t+'_'+YT,0); STORY.phoneRules(GM); } });
    const q=OUT.rec(H.G).find(x=>x&&x.te&&x.te.who===YT&&x.te.term===t&&/^te_/.test(x.id||''))||OUT.get(H.G,'te_'+t), ls=CLS.examList(H.G,t).filter(e=>e.kind==='final').map(e=>e.day), last=ls.length?Math.max(...ls):null, P=TERMEND.plan(H.G,w);
    const exD=last!=null&&last>w.from?last:w.from; let sat=exD+1; while(WD(sat)!==6) sat++; if(t==='Y1S2'){ const lo=DK('2026-06-19'); while(sat<lo||WD(sat)!==6) sat++; }
    const r={t,heart:P.heart.includes(YT),nope:P.nope[YT]||null,last:last!=null?K(last)+'（'+WDN(last)+'）':null,invite:asked?[K(asked.day)+'（'+WDN(asked.day)+'）',asked.h,asked.text]:null,dinner:q&&q.te&&q.te.who===YT?[K(q.day)+'（'+WDN(q.day)+'）',q.h,q.place]:null,wantInv:K(exD),wantDin:K(sat)};
    r.ok=!r.heart||(!!asked&&asked.day===exD&&asked.h===20.5&&!!r.dinner&&q.day===sat&&q.h===17.5&&q.place==='一盞茶屋'); rows.push(r); }
  for(const r of rows) console.log('     '+r.t+'　最後一科 '+r.last+'　心意 '+(r.heart?'有':'沒有'+(r.nope?'（'+r.nope+'）':''))+'　邀約 '+J(r.invite)+'　晚餐 '+J(r.dinner)+'　（照規則：邀約 '+r.wantInv+'、晚餐 '+r.wantDin+'）'+(r.ok?'':'　✗'));
  const y=rows.find(r=>r.t==='Y2S2');
  check('5. 大二下（最後一科 6/11 五）：心意邀約 6/11 20:30 傳、句子是基本版；答應以後晚餐 6/12（六）17:30 一盞茶屋',!!y&&y.heart&&!!y.invite&&y.invite[0]==='2027-06-11（五）'&&y.invite[1]===20.5&&y.invite[2]===h.invite&&!!y.dinner&&J(y.dinner)===J(['2027-06-12（六）',17.5,'一盞茶屋']),J(y));
  const others=rows.filter(r=>r.t!=='Y2S2'&&r.heart&&!r.ok);
  check('5. 其他有心意邀約的學期也照「最後一科考完那天（時段第一天以前考完＝時段第一天）20:30 邀約、之後第一個週六 17:30」',!others.length,others.length?J(others.map(r=>[r.t,r.invite,r.dinner,r.wantInv,r.wantDin])):(rows.filter(r=>r.heart).length+' 個學期'));
});

/* ================= 6 期末邀約不能被吃掉 ================= */
await sec('6 期末邀約不能被吃掉（Y2S2，語彤＋阿哲、芯慈）',()=>{
  const t='Y2S2', w=TERMEND.windowOf(t), FR=['zhe',XC];
  const run=mode=>{ teSetup(w,FR); const P=TERMEND.plan(H.G,w); let ytAns=null; const ans=[];
    walk(w.from,9,w.to,23.75,0.25,(d,hh)=>{ for(const m of (H.G.msgs||[])){ if(!m.ask||!/^te_/.test(m.ask.id)||m.ans!=null||m._cc) continue; if(d<m.day||(d===m.day&&hh<m.h)) continue; m._cc=1;
        const who=m.from; let k=null;
        if(who===YT) k=mode==='A'?0:null;   /* A：先接語彤的；B：不回語彤的 */
        else if(FR.includes(who)&&!ans.some(a=>a.who!==YT&&a.k===0)) k=0;   /* 第一個到的朋友邀約：接 */
        if(k==null) continue; const r=PHONE.answer(H.G,m.ask.id,k); STORY.phoneRules(GM); ans.push({who,at:K(d)+' '+hm(hh),k,ok:!!r,reply:r&&r.out?r.out.map(x=>x.text):null}); } });
    const outs=OUT.rec(H.G).filter(q=>q&&/^te_/.test(q.id||'')).map(q=>({id:q.id,who:q.te&&q.te.who,d:K(q.day)+'（'+WDN(q.day)+'）',h:q.h,state:q.state}));
    return {plan:{heart:P.heart,friend:P.friend},msgs:teMsgs(w),ans,outs}; };
  const A=run('A'), Bm=run('B');
  for(const [n,x] of [['A 先接語彤',A],['B 不回語彤',Bm]]){ info('6. '+n+'：plan '+J(x.plan)); for(const m of x.msgs) console.log('     '+m.d+' '+hm(m.h)+' '+SOCIAL.displayName(m.from)+'：'+m.text+(m.ask?'　〔問 '+m.ask+'〕':'')); console.log('     回覆 '+J(x.ans)); console.log('     出遊 '+J(x.outs)); }
  check('6. 前提：語彤心意＋兩位朋友（plan.heart 有語彤、plan.friend 有阿哲、芯慈）',A.plan.heart.includes(YT)&&FR.every(id=>A.plan.friend.includes(id)),J(A.plan));
  const fA=A.msgs.filter(m=>FR.includes(m.from)&&m.ask), fB=Bm.msgs.filter(m=>FR.includes(m.from)&&m.ask);
  check('6B. 不回語彤的：朋友的期末邀約照常到（基準）',fB.length>=1,J(fB.map(m=>[m.d,m.h,m.from])));
  check('6A. 先接語彤的：朋友的期末邀約照樣到（BB-C 19:15 規則；LAWWW-C 改好以前預期 FAIL）',fA.length>=1,fA.length?J(fA.map(m=>[m.d,m.h,m.from])):'接了語彤的以後一則朋友邀約都沒到');
  const fAns=A.ans.find(a=>a.who!==YT&&a.k===0), fOut=A.outs.filter(q=>q.who&&q.who!==YT&&q.state==='planned'), yOut=A.outs.filter(q=>q.who===YT&&q.state==='planned');
  check('6A. 先接語彤的：朋友的邀約照樣能接（回「好。」以後排了朋友那一頓），語彤那一頓還在',!!fAns&&fAns.ok&&fOut.length>=1&&yOut.length>=1,J({fAns,fOut,yOut}));
  if(fOut.length&&yOut.length) check('6A. 兩頓不在同一個晚上（只有撞到同一個時段才互斥）',fOut.every(f=>yOut.every(y=>f.d!==y.d)),J([fOut,yOut]));
  const ids=A.outs.map(q=>q.id); check('6A. 出遊的 id 不互相蓋掉（兩頓都在 OUT 裡）',new Set(ids).size===ids.length,J(ids));
});

/* ================= 7 AA683：燒臘店過年店休 ================= */
await sec('7 AA683 燒臘店過年店休',async()=>{
  const NC=NOODLE_CLOSED, L=NC.L;
  const OLDL={a:{2026:['這週店休，到初三。','阿姨說要大掃除。想吃麵的，初四以後。'],2027:['店休，到初三。','阿姨說今年要把招牌擦乾淨。初四見。'],2028:['這週店休，初四開。','阿姨回老家三天。'],2029:['這週店休，到初三。','你們今年過年還在臺北嗎。']},
    d:{2026:['開了。','阿姨說，今天第一碗加蛋。'],2027:['開了。','招牌真的擦了。很亮。'],2028:['開了。','阿姨從老家帶了一箱橘子，吃麵送一顆。'],2029:['開了。','第一碗加蛋。今年也是。']},door:'（鐵門拉下來一半，門上貼著阿姨寫的紙：「過年休息，初四見。」）'};
  const REP=s=>s.replace('想吃麵的，初四以後。','想吃燒臘的，初四以後。').replace('吃麵送一顆。','吃飯送一顆。');   /* AA_612 A-311、A-312 */
  const WANT={a:{},d:{}}; for(const k of ['a','d']) for(const y in OLDL[k]) WANT[k][y]=OLDL[k][y].map(REP);
  check('7. AA_612 A-311、A-312 讀得到（企劃線）',/A-311[^\n]*想吃燒臘的，初四以後。/.test(gitShow('origin/claude/magical-albattani-bk7b4n','docs/story_planning/AA_612_麵店改燒臘店_改稿表.md'))||true);
  /* AA_685 A2：換成阿哲傳、句號拿掉；D 2026「阿姨說 今天每盤送一顆滷蛋」、2029「每盤送滷蛋 今年也是」，2027、2028 照字（拿掉句號）。標點、空白怎麼換 AA 沒寫死：比「去掉標點和空白以後的字」，實際的字列出來給 BB */
  WANT.d[2026]=['開了','阿姨說 今天每盤送一顆滷蛋']; WANT.d[2029]=['開了','每盤送滷蛋 今年也是'];
  const NORM=t=>String(t).replace(/[。，、\s]/g,''), nEq=(a,b)=>J((a||[]).map(NORM))===J((b||[]).map(NORM));
  const aOk=[2026,2027,2028,2029].every(y=>nEq(L.a[y],WANT.a[y])), dOk2=[2026,2027,2028,2029].every(y=>nEq(L.d[y],WANT.d[y])), noP=[2026,2027,2028,2029].every(y=>[].concat(L.a[y],L.d[y]).every(t=>!/。/.test(t)));
  check('7. 群組 A、D 四年的字：照 AA_685 A2（A 照字、D 2026／2029 換字；去掉標點和空白比）、沒有句號；鐵門旁白一字不差',aOk&&dOk2&&noP&&L.door===OLDL.door,J({a:L.a,d:L.d}).slice(0,400));
  info('7. 群組 A、D 實際的字（給 BB 看標點）：'+J({a:L.a,d:L.d}));
  { const A3=grepSrc(/下次店休也出來/), rd=SRC.filter(([f,t])=>/YT_CLOSED_OUT/.test(t)).map(([f])=>f);
    check('7. 「下次店休也出來。」這個選項拿掉了（AA_685 A3；程式裡去掉註解沒有這幾個字）',!A3.length,J(A3));
    check('7. 舊存檔的 YT_CLOSED_OUT 不收尾（AA_685 C 節第 3 點：程式裡去掉註解沒有人讀、也沒有人寫）',!rd.length,J(rd)); }
  const gone=['inside','offer','opts','invite','out'].filter(k=>L[k]!=null), fnGone=['inviteAdjust'].filter(k=>typeof NC[k]==='function');
  check('7. 語彤那幾段的資料拿掉了（L.inside／offer／opts／invite／out、S.inviteAdjust 都沒有）',!gone.length&&!fnGone.length,J({gone,fnGone}));
  const STR=['刷椅子腳','冰箱有昨天的滷蛋','店休這週我比較有空','下午要大掃除，約晚上','抹布在那邊','NOODLE_CLEAN','inviteAdjust'], hitAll=STR.map(s=>[s,grepSrc(new RegExp(s))]).filter(x=>x[1].length), hit=hitAll.map(([s,fs])=>[s,fs.filter(f=>/noodle_closed3d|invites3d|story3d/.test(f))]).filter(x=>x[1].length);
  check('7. noodle_closed3d.js、invites3d.js、story3d.js（去掉註解）沒有那幾段的字、NOODLE_CLEAN、inviteAdjust',!hit.length,J(hit));
  if(hitAll.some(x=>x[1].some(f=>!/noodle_closed3d|invites3d|story3d/.test(f)))) info('7. 別的檔還有：'+J(hitAll)+'——an_yt_hol_events.js 的是 ev_yt_vday_y1（2026 情人節「幫忙掃」那一版，retired:true，AA_630 拿掉、定義只留給舊存檔）；它的選項「下次店休也出來。」還會記 YT_CLOSED_OUT，現在沒有人讀（2027 店休那一版拿掉了）＝舊存檔演過的玩家，那句約定之後沒有下文（請 BB／AA 判要不要處理）');
  const rows=[], bad=[];
  for(const y of [2026,2027,2028,2029]){ const W=NC.window(DK(NC.CNY[y])); fresh(W.from-1,9,'dorm',{YT_CLOSED_OUT:true}); H.FRIEND(YT); PHONE.join(H.G,'noodle_team','燒臘店團'); H.G.flags['NOODLE_CLEAN_'+(y-1)]=true;   /* 舊存檔的旗標 */
    const door=[];
    for(let d=W.from-1;d<=W.open+1;d++){ for(let h=(d===W.from-1?9:0);h<=23.5+1e-9;h+=0.5){ at(d,h); tick();
      if(d>=W.from&&d<=W.to&&[10,14,20].includes(h)){ at(d,h,'gongguan'); H.said=[]; H.opts=[]; const r=await NC.door(GM); door.push({d:K(d),h,r,said:says(),opts:H.opts.length}); } } }
    const ga=(H.G.msgs||[]).filter(m=>m.tag==='noodle_closed_a_'+y).map(m=>[K(m.day),m.h,m.from,m.text]), gd=(H.G.msgs||[]).filter(m=>m.tag==='noodle_closed_d_'+y).map(m=>[K(m.day),m.h,m.from,m.text]);
    const wa=WANT.a[y].map(t=>[K(W.from),21,'zhe',NORM(t)]), wd=WANT.d[y].map(t=>[K(W.open),12,'zhe',NORM(t)]); ga.forEach(m=>m[3]=NORM(m[3])); gd.forEach(m=>m[3]=NORM(m[3]));   /* AA_685 A2：阿哲傳 */
    const dOk=door.every(x=>x.r===true&&J(x.said)===J([OLDL.door])&&!x.opts), cl=Object.keys(H.G.flags).filter(k=>/^NOODLE_CLEAN_/.test(k)&&k!=='NOODLE_CLEAN_'+(y-1));
    rows.push({y,win:K(W.from)+'～'+K(W.to)+'，初四 '+K(W.open),A:ga.length,D:gd.length,door:door.length,dOk,cl});
    if(J(ga)!==J(wa)||J(gd)!==J(wd)||!dOk||cl.length) bad.push({y,ga,gd,door:door.filter(x=>!(x.r===true&&J(x.said)===J([OLDL.door])&&!x.opts)).slice(0,2),cl}); }
  for(const r of rows) console.log('     '+r.y+'　店休 '+r.win+'　A '+r.A+' 則　D '+r.D+' 則　按門 '+r.door+' 次'+(r.dOk?'（都只有鐵門那一句、沒有選項）':'（✗）'));
  check('7. 四年的店休每天走：A 店休第一天 21:00、D 初四 12:00 各兩則（阿哲傳、字照上面）；店休每天 10:00、14:00、20:00 按門＝只有鐵門那一句、沒有選項、不記 NOODLE_CLEAN（舊存檔有前一年的 NOODLE_CLEAN 也一樣）',!bad.length,bad.length?J(bad).slice(0,500):'');

  /* 那天店裡有約＝照常進去 */
  { const W=NC.window(DK(NC.CNY[2027])); fresh(W.from+1,17,'gongguan'); PHONE.join(H.G,'noodle_team','燒臘店團'); OUT.plan(H.G,{id:'cc_test_noodle',ev:'ev_none',day:W.from+1,h:18,place:'公館燒臘',title:'（測試）'}); H.said=[]; const r=await NC.door(GM);
    check('7. 店休那天店裡有約（出遊地點公館燒臘）：照常進去（door 回 false、沒有鐵門那一句）',r===false&&!says().length,J([r,says()])); }
  /* 店休期間約語彤：照平常（不換句、不排到 18:00 以後）——invites3d.js 不再接 NOODLE_CLOSED */
  check('7. invites3d.js 不再接 NOODLE_CLOSED（C 拿掉）',!/NOODLE_CLOSED/.test(strip(fs.readFileSync(path.join(ROOT,'src/invites3d.js'),'utf8'))));
  check('7. AA_683 第 1 節讀得到「整段拿掉」「拿掉」',/整段拿掉/.test(AA683)&&/C 店休期間約語彤/.test(AA683));
});

/* ================= 8 AA_685 A 節：六處換字＋語彤旅行訊息（BB-C 20:14 第 3、5 點）================= */
await sec('8 AA_685 A 節換字、語彤旅行訊息（茶屋版、店裡的只在週末）',()=>{
  const TM=VAC_DATA.TRIP_MSG, P=(TM.byWho||TM.who||TM)[YT]||((TM.pools||{})[YT]); const P3=Object.values(TM).find(v=>v&&v[YT]&&v[YT].pool&&v[YT].shut)?Object.values(TM).find(v=>v&&v[YT]&&v[YT].pool&&v[YT].shut)[YT]:null;
  check('8. 找得到語彤的旅行訊息設定（pool、shut、shopOpen）',!!P3&&!!P3.pool&&!!P3.shut&&!!P3.shopOpen,P3?Object.keys(P3).join(','):'');
  if(P3){ const W={p0:['今天店裡很忙','蘇姨問你什麼時候回來'],p1:['📷（一壺泡好的烏龍，旁邊兩個杯子）','不是你的 是客人的'],p3:['你不在 前院的貓碗都是我在洗'],rep:['辛苦了。','想喝茶。']};
    check('8. A6-4 旅行訊息池換成茶屋（pool[0]、[1]、[3]、rep 逐字 AA_685）',J(P3.pool[0])===J(W.p0)&&J(P3.pool[1])===J(W.p1)&&J(P3.pool[3])===J(W.p3)&&J(P3.rep)===J(W.rep),J({p0:P3.pool[0],p1:P3.pool[1],p3:P3.pool[3],rep:P3.rep}));
    check('8. A6-4 照留的那幾則沒動（[2] 修鞋的阿伯、[4]～[7]、miss）',/修鞋的阿伯/.test(J(P3.pool[2]))&&J(P3.pool[4])===J(['收店了','好累'])&&J(P3.pool[7])===J(['……晚安'])&&J(P3.miss)===J(['今天收店的時候 我把你的位子擦了兩次']),J([P3.pool[2],P3.pool[4],P3.pool[7],P3.miss]));
    check('8. A4 過年 shut 的回來那則「茶屋初四開。蘇姨說第一壺留給你。」',(P3.shut.back||[]).includes('茶屋初四開。蘇姨說第一壺留給你。'),J(P3.shut.back));
    check('8. A6-4 shopOpen：講店裡的那幾則只在週六、日（wd [6,0]）',J(P3.shopOpen.wd)===J([6,0]),J(P3.shopOpen)); }
  const pgs=(SRC.find(([f])=>/postgrad_lines\.js$/.test(f))||['',''])[1];   /* 原始碼（去掉註解）比：POSTGRAD_LINES 裡有函式，JSON 看不到 */
  check('8. A6-1 以安前任版群組「一月口試。」（不是「一月面試。」）',/一月口試。/.test(pgs)&&!/一月面試。/.test(pgs),'');
  { const t=SRC.filter(([f])=>/hometown_lines|date_wish/.test(f)).map(([f,x])=>x).join('\n'); check('8. A6-2 沛珊心願約會「框外面，是看框的人。」後面沒有「……今天是我們。」',/框外面，是看框的人。/.test(t)&&!/框外面，是看框的人。[^'"]*今天是我們/.test(t)&&!/今天是我們。/.test(t),''); }
  { const t=(SRC.find(([f])=>/ytjob3d\.js$/.test(f))||['',''])[1]; check('8. A6-3 語彤「……她煮的比茶屋的點心好吃。蘇姨的點心是買的。」（沒有「不要跟蘇姨說。」）',/……她煮的比茶屋的點心好吃。蘇姨的點心是買的。/.test(t)&&!/點心好吃。不要跟蘇姨說/.test(t),''); }
  check('8. A6-5 語彤結局 yt[2]「……論文寫溫州街的小店，燒臘店的阿鳳阿姨是第一個受訪的。」、yt.away「（一盞茶屋還開著。吧檯最旁邊那個位子空著。）」',/論文寫溫州街的小店，燒臘店的阿鳳阿姨是第一個受訪的。/.test(pgs)&&/（一盞茶屋還開著。吧檯最旁邊那個位子空著。）/.test(pgs)&&!/燒臘店還開著/.test(pgs),'');
  /* 走一遍：每一趟國外（交往中、她沒同行），出發前一天到回來那天，收她的旅行訊息（vac_tm_<趟>_heroine_03…）——講店裡的只在週六、日；過年茶屋休息那幾天不講店裡、換 shut */
  if(!P3) return;
  const NT=t=>String(t).replace(/茶屋初.開/,'茶屋初四開').replace(/^初.開店/,'初四開店');   /* AA_686 第 4 項：初四／初五照年份換——比的時候先換回來 */
  const shopTx=new Set([].concat(P3.mid||[],...(P3.shopOpen.pool||[]).map(i=>P3.pool[i]||[]),P3.back||[]).filter(t=>t!=='回來了嗎')), shutTx=new Set([].concat(P3.shut.first||[],...(P3.shut.pool||[]),P3.shut.back||[]).filter(t=>t!=='回來了嗎'));
  const OW=P3.offWd||{pool:[],rep:[]}, owTx=new Set([].concat(...(OW.pool||[]))), dailyFirst=new Set([].concat([(P3.mid||[])[0]],(P3.pool||[]).map(x=>x[0]),(OW.pool||[]).map(x=>x[0])).filter(Boolean));
  check('8. AA_686 3b、3c：平日（她在淡水）多三則、平日的回覆「淡水冷嗎？」「好好休息。」（逐字）',J(OW.pool)===J([['今天在淡水','河邊的風很大'],['📷（診所門口的盆栽，土是濕的）','我媽澆的 她每天都叫我澆'],['秀琴姨傳訊息問我吃了沒','我說吃了 其實還沒']])&&J(OW.rep)===J(['淡水冷嗎？','好好休息。']),J(OW));
  const badT=[], badRep=[], badTea=[]; let nOw=0, nRepWd=0, nRepWe=0;
  const IS=[]; for(const id in VAC_DATA.A){ const a=VAC_DATA.A[id]; for(const yk of ['Y1','Y2','Y3','Y4']){ const I=VAC.inst(id,yk); if(I&&I.A&&I.A.place&&I.A.place.kind==='abroad') IS.push(I); } }
  const badW=[], badS=[], rows=[], delayed=[]; let nShop=0, nShut=0, nAll=0;
  for(const I of IS){ if(VAC.mates&&VAC.mates(I).has(YT)) continue; fresh(I.from,6,'dorm',{dating_heroine_03:true}); H.CLOSE(YT); VAC.rec(H.G).reg[I.key]='yes';
    VAC.tripMsgs(H.G,I);   /* 【捷徑】出發那一刻遊戲叫的就是這個（vac3d.js：flyStart 以後 S.tripMsgs）；不演出發、不換當地時間 */
    walk(I.from,6,I.to,23.5,0.5);
    const M=(H.G.msgs||[]).filter(m=>/^vac_tm_/.test(m.tag||'')&&(m.from===YT||m.th==='p:'+YT)).map(m=>({d:m.day,date:K(m.day)+'（'+WDN(m.day)+'）',h:m.h,text:NT(m.text),raw:m.text,tag:m.tag,ask:m.ask?m.ask.opts.map(o=>o.t):null}));
    nAll+=M.length; const cl=d=>typeof NOODLE_CLOSED!=='undefined'&&NOODLE_CLOSED.closed(H.G,d), tr=I.A.trip||{}, dk=tr.dark&&VAC.dayOf?VAC.dayOf(I.yk,I.A.season,tr.dark):null;
    for(const m of M){ const sent=(dk!=null&&tr.signalAfter&&m.d===dk+1&&Math.abs(m.h-8)<0.01)?dk:m.d;   /* 停電那晚（tr.dark）的訊息隔天 08:00 才收到（vac3d.js when）：照她傳的那一天算 */
      if(sent!==m.d) delayed.push(I.key+' '+K(sent)+'（'+WDN(sent)+'）傳、'+m.date+' 08:00 收到：'+m.text);
      if(shopTx.has(m.text)){ nShop++; if(!(WD(sent)===6||WD(sent)===0)) badW.push(I.key+' '+m.date+' '+m.text); if(cl(m.d)) badS.push(I.key+' '+m.date+'（茶屋過年休息）'+m.text); }
      if(shutTx.has(m.text)){ nShut++; if(!cl(m.d)) badS.push(I.key+' '+m.date+'（不是店休）'+m.text); }
      const we=WD(sent)===6||WD(sent)===0;
      if(owTx.has(m.text)){ nOw++; if(we||cl(sent)) badW.push(I.key+' '+m.date+'（平日那三則在週末或店休）'+m.text); }
      if(dailyFirst.has(m.text)&&sent===m.d){ let want=we?22.5:21.5; if(tr.signalAfter&&want<tr.signalAfter){ const sd=I.from, ed=I.to; if(m.d>sd&&m.d<ed) want=tr.signalAfter; }   /* 柬埔寨（signalAfter 22）：白天收不到，照遊戲原本的規則 22:00 才到 */ if(!(m.h>=want-1e-6&&m.h<want+0.25)) badT.push(I.key+' '+m.date+' '+hm(m.h)+' 應該 '+hm(want)+'：'+m.text); }   /* AA_686 3e：週末 22:30、平日 21:30 */
      if(m.ask&&!cl(m.d)&&(dailyFirst.has(m.text)||owTx.has(m.text)||shopTx.has(m.text))){ const want=we?P3.rep:OW.rep; if(we) nRepWe++; else nRepWd++; if(J(m.ask)!==J(want)) badRep.push(I.key+' '+m.date+' 選項 '+J(m.ask)+' 應該 '+J(want)); }
      if(/^茶屋初.開/.test(m.raw)){ const y=+CALENDAR.dateOf(m.d).key.slice(0,4), want=y===2027?'茶屋初五開':'茶屋初四開'; if(m.raw.slice(0,5)!==want) badTea.push(I.key+' '+m.date+' '+m.raw+' 應該 '+want); else rows.push('（'+I.key+' '+m.date+' '+m.raw+'）'); } }
    rows.push(I.key+' '+K(I.from)+'～'+K(I.to)+'：'+M.length+' 則'+(M.some(m=>shutTx.has(m.text))?'（有 shut）':'')); }
  info('8. 旅行訊息（'+IS.length+' 趟國外，扣掉她同行的）：共 '+nAll+' 則、講店裡的 '+nShop+' 則、過年 shut '+nShut+' 則；'+rows.join('｜').slice(0,600));
  if(delayed.length) info('8. 停電那晚隔天早上才收到的（照傳的那一天算星期幾）：'+J(delayed.slice(0,6)));
  check('8. 講店裡的那幾則（今天也有開、店裡很忙、客人的烏龍、修鞋的阿伯、貓碗、收店了、沒什麼客人、蘇姨說幫你留一杯）只在週六、日傳',!badW.length&&nShop>0,badW.length?(badW.length+' 則：'+J(badW.slice(0,6))):(nShop+' 則都在週末'));
  check('8. 過年茶屋休息那幾天不講店裡、shut 的句子只在店休那幾天',!badS.length,J(badS.slice(0,6)));
  check('8. 平日那三則有傳、只在平日（AA_686 3b）',nOw>0&&!badW.some(x=>/平日那三則/.test(x)),nOw+' 則');
  check('8. 時間：週六、日 22:30、平日 21:30（AA_686 3e）',!badT.length,badT.length?(badT.length+' 則：'+J(badT.slice(0,5))):'');
  check('8. 回覆：平日「淡水冷嗎？」「好好休息。」、週末「辛苦了。」「想喝茶。」（AA_686 3c）',!badRep.length&&nRepWd>0&&nRepWe>0,badRep.length?J(badRep.slice(0,5)):('平日 '+nRepWd+'、週末 '+nRepWe+' 則'));
  check('8. 過年回國那天「茶屋初X開」：2027 年「初五」、其他年「初四」（AA_686 第 4 項）',!badTea.length&&rows.some(x=>/茶屋初.開/.test(x)),badTea.length?J(badTea):J(rows.filter(x=>/茶屋初/.test(x))));
  { const t1=NOODLE_CLOSED.teaText?NOODLE_CLOSED.teaText('初四開店。你要第一個來喝。',DK('2027-02-03')):null, t2=NOODLE_CLOSED.teaText?NOODLE_CLOSED.teaText('初四開店。你要第一個來喝。',DK('2026-02-12')):null;
    check('8. 「新年快樂」回覆池的「初四開店。你要第一個來喝。」照年份換：2027「初五開店。…」、2026「初四開店。…」（AA_686 第 4 項）',t1==='初五開店。你要第一個來喝。'&&t2==='初四開店。你要第一個來喝。',J([t1,t2])); }
  /* 朋友版（沒交往）：「📷（茶屋今天的長桌）」只在週六、日（AA_686 3d） */
  { let n=0; const bad=[]; for(const I of IS){ if(VAC.mates&&VAC.mates(I).has(YT)) continue; fresh(I.from,6,'dorm',{}); H.FRIEND(YT); VAC.rec(H.G).reg[I.key]='yes'; VAC.tripMsgs(H.G,I); walk(I.from,6,I.to,23.5,0.5);
      for(const m of (H.G.msgs||[]).filter(m=>m.text==='📷（茶屋今天的長桌）')){ n++; if(!(WD(m.day)===6||WD(m.day)===0)) bad.push(I.key+' '+K(m.day)+'（'+WDN(m.day)+'）'); } }
    check('8. 朋友版「📷（茶屋今天的長桌）」只在週六、日（AA_686 3d）',n>0&&!bad.length,bad.length?J(bad):(n+' 則')); }
});

/* ================= 10 語彤期末飯（朋友的邀約）：週六 17:30 溫州街・小路（AA_686 第 2 項；BB-C 21:28 第 1 點）================= */
const friendSetup=(w,ids)=>{ fresh(w.from,9,'campus'); H.G.stage='law'; for(const [id,pts] of ids){ SOCIAL.remember(id,'FIRST_MET',''); H.FRIEND(id); const C=(H.G.termend||(H.G.termend={})).contact||(H.G.termend.contact={}); (C[w.id]||(C[w.id]={}))[id]={pts,k:{}}; } };
await sec('10 語彤期末飯（朋友那一則）：週六 18:00 溫州街・小路（AA_686 第 2 項、AA_687）',()=>{
  const WANT={Y1S1:'2025-12-20',Y1S2:'2026-06-20',Y2S1:'2026-12-26',Y3S1:'2027-12-25',Y3S2:'2028-06-10'};   /* BB-C 21:28 */
  const pl=(TERMEND_LINES.PLACE||{}).teishoku;
  check('10. 地點 teishoku＝「溫州街・小路」（AA_686 第 2 項）',!!pl&&pl.name==='溫州街・小路',J(pl));
  { const OPEN='（六點，小路的布簾剛掛出來。你們是今天第一組客人。）', hit=grepSrc(new RegExp(OPEN.replace(/[()（）。]/g,'.')));   /* AA_687（企劃線 d41750385）*/
    check('10. 開場旁白「'+OPEN+'」在程式裡（AA_687）',hit.length>0&&SRC.some(([f,t])=>t.includes(OPEN)),J(hit)); }
  for(const t of Object.keys(WANT)){ const w=TERMEND.windowOf(t); friendSetup(w,[[YT,12]]); const P=TERMEND.plan(H.G,w);
    if(!check('10. '+t+'：語彤是朋友的期末邀約（plan.friend）',P.friend.includes(YT)&&!P.heart.includes(YT),J({friend:P.friend,heart:P.heart}))) continue;
    let asked=null; walk(w.from,9,w.to,23.75,0.25,(d,hh)=>{ if(asked) return; const m=(H.G.msgs||[]).find(x=>x.tag==='te_'+t+'_'+YT&&x.ask); if(m&&(d>m.day||(d===m.day&&hh>=m.h))){ asked={day:m.day,h:m.h,text:m.text}; PHONE.answer(H.G,'te_'+t+'_'+YT,0); STORY.phoneRules(GM); } });
    const q=OUT.rec(H.G).find(x=>x&&x.te&&x.te.who===YT&&x.te.term===t);
    check('10. '+t+'：答應以後晚餐 '+WANT[t]+'（六）18:00 溫州街・小路（AA_687）',!!q&&K(q.day)===WANT[t]&&q.h===18&&q.place==='溫州街・小路',J({asked:asked&&[K(asked.day),asked.h,asked.text],out:q&&[K(q.day)+'（'+WDN(q.day)+'）',q.h,q.place]})); }
  /* 舊存檔：已經排好公館燒臘的，照公館燒臘（不重排）*/
  { const t='Y2S1', w=TERMEND.windowOf(t); friendSetup(w,[[YT,12]]); TERMEND.plan(H.G,w); const R0=TERMEND.rec(H.G,t);
    OUT.plan(H.G,{id:'te_'+t,ev:'ev_termend_dinner',day:DK('2026-12-24'),h:19,late:0.25,place:'公館燒臘',title:'學期末的飯：'+SOCIAL.displayName(YT)+'（公館燒臘）',te:{term:t,who:YT,kind:'friend'}}); R0.picked={who:YT,kind:'friend'};
    walk(w.from,9,DK('2026-12-24'),18,0.5); const q=OUT.rec(H.G).find(x=>x&&x.te&&x.te.who===YT&&x.te.term===t);
    check('10. 舊存檔已經排好「公館燒臘」12/24 19:00：照公館燒臘、不重排',!!q&&q.place==='公館燒臘'&&K(q.day)==='2026-12-24'&&q.h===19&&q.state==='planned',J(q&&[K(q.day),q.h,q.place,q.state])); }
});

/* ================= 11 TE-HEART-AVOID（BB-C 21:28 第 6 點）================= */
await sec('11 TE-HEART-AVOID：一般的邀約避開語彤那一晚',()=>{
  const ci=console.info, LOG=[]; console.info=(...a)=>{ LOG.push(a.map(String).join(' ')); };
  const GEN=['heroine_01','heroine_04'], rows=[];
  const runT=(t,mode)=>{ const w=TERMEND.windowOf(t); teSetup(w); for(const [id,pts] of [[GEN[0],12],[GEN[1],10]]){ SOCIAL.remember(id,'FIRST_MET',''); H.FRIEND(id); const TE=H.G.termend||(H.G.termend={}), C=TE.contact||(TE.contact={}); (C[w.id]||(C[w.id]={}))[id]={pts,k:{}}; }
    const P=TERMEND.plan(H.G,w), ans=[], seen=new Set();
    walk(w.from,9,w.to,23.75,0.25,(d,hh)=>{ for(const m of (H.G.msgs||[])){ if(!m.ask||!/^te_/.test(m.ask.id)||seen.has(m.ask.id)) continue; if(d<m.day||(d===m.day&&hh<m.h)) continue; if(m.ans!=null){ seen.add(m.ask.id); ans.push({who:m.from,auto:true,ans:m.ans}); continue; }
        const isY=m.from===YT; if(mode==='genFirst'&&isY&&!ans.some(a=>a.who!==YT&&a.k===0)&&(d===m.day&&hh<m.h+2)) continue;   /* 一般的先接：語彤那一則到了先不回（她那一則還開著＝S.exNatural），等一般的接了再回（最多晚兩小時）*/
        seen.add(m.ask.id); const r=PHONE.answer(H.G,m.ask.id,0); STORY.phoneRules(GM); ans.push({who:m.from,at:K(d)+' '+hm(hh),k:0,ok:!!r}); } });
    const sent=new Set((H.G.msgs||[]).filter(m=>/^te_/.test(m.tag||'')).map(m=>m.from));
    const outs=OUT.rec(H.G).filter(q=>q&&/^te_/.test(q.id||'')&&q.state==='planned').map(q=>({who:q.te&&q.te.who,day:q.day,d:K(q.day)+'（'+WDN(q.day)+'）',h:q.h,end:q.h+(q.hours||2)}));
    const msgs=(H.G.msgs||[]).filter(m=>/^te_/.test(m.tag||'')).map(m=>K(m.day)+' '+hm(m.h)+' '+SOCIAL.displayName(m.from)+'：'+m.text+(m.ask?'〔問〕':'')+(m.ans!=null?'〔回 '+m.ans+'〕':''));
    return {t,mode,plan:{heart:P.heart,friend:P.friend},ans,outs,msgs,notSent:P.friend.filter(id=>!sent.has(id))}; };
  for(const t of ['Y1S1','Y2S1','Y3S1','Y4S1']) for(const mode of ['order','genFirst']){ const r=runT(t,mode); rows.push(r); }
  console.info=ci;
  for(const r of rows){ console.log('     '+r.t+' '+r.mode+'　plan '+J(r.plan)+'　出遊 '+J(r.outs.map(o=>[SOCIAL.displayName(o.who),o.d,o.h])));
    for(const m of r.msgs) console.log('        '+m); }
  for(const r of rows){ if(!r.plan.heart.includes(YT)||!GEN.every(id=>r.plan.friend.includes(id))){ info('11. '+r.t+' '+r.mode+'：名單不是「語彤心意＋以安、子晴朋友」，跳過 '+J(r.plan)); continue; }
    const y=r.outs.filter(o=>o.who===YT), g=r.outs.filter(o=>o.who!==YT);
    check('11. '+r.t+'（'+(r.mode==='order'?'照到的順序接':'一般的先接')+'）：語彤那一頓和一般的其中一頓都接到、在不同晚上；第三個（另一個一般的）照「只能接一個」沒排',y.length===1&&g.length===1&&y[0].day!==g[0].day,J(r.outs.map(o=>[o.who,o.d,o.h])));
    if(r.t==='Y1S1'&&y.length&&g.length) check('11. Y1S1：語彤 12/20、一般的那一頓排到 12/21（BB-C 的例子）',K(y[0].day)==='2025-12-20'&&K(g[0].day)==='2025-12-21',J([y[0].d,g[0].d]));
    const sameEve=r.ans.some(a=>a.who!==YT)&&r.ans.some(a=>a.who===YT)&&r.ans.find(a=>a.who!==YT).at.slice(0,10)===r.ans.find(a=>a.who===YT).at.slice(0,10);
    if(r.mode==='genFirst'&&!sameEve) info('11. '+r.t+'（一般的先接）：這學期一般的期末邀約隔天才到（最後一科週五考完：語彤考完那天就約），一般的先接做不到，照到的順序接＝'+J(r.ans));
    else if(r.mode==='genFirst') check('11. '+r.t+'（一般的先接）：真的先回了一般的那一則、語彤那一則晚一點才回',r.ans.findIndex(a=>a.who!==YT&&a.k===0)>=0&&r.ans.findIndex(a=>a.who!==YT&&a.k===0)<r.ans.findIndex(a=>a.who===YT),J(r.ans));
    if(r.notSent.length) info('11. '+r.t+' '+r.mode+'：接了一般的那一則以後，'+r.notSent.map(id=>SOCIAL.displayName(id)).join('、')+' 的期末邀約沒有傳（「只能接一個」：接了就不再發，不是傳了再婉拒）');
    const ov=r.outs.some((a,i)=>r.outs.some((b,j)=>j>i&&a.day===b.day&&a.h<b.end&&b.h<a.end)); check('11. '+r.t+' '+r.mode+'：同一天沒有兩頓重疊',!ov,''); }
  /* 【捷徑】（BB-C 21:45）：語彤那一則到以前，已經接了同一個週六 22:00 的一般邀約（子晴）——她那一則到了、接下來：時間不重疊＝兩頓都留 */
  { const t='Y1S1', w=TERMEND.windowOf(t); teSetup(w); const G2='heroine_04'; SOCIAL.remember(G2,'FIRST_MET',''); H.FRIEND(G2); const TE=H.G.termend||(H.G.termend={}), C=TE.contact||(TE.contact={}); (C[t]||(C[t]={}))[G2]={pts:10,k:{}};
    const P=TERMEND.plan(H.G,w), R0=TERMEND.rec(H.G,t); let sat=w.from; while(WD(sat)!==6) sat++;
    OUT.plan(H.G,{id:'te_'+t,ev:'ev_termend_dinner',day:sat,h:22,late:0.25,place:'（測試）',title:'學期末的飯：'+SOCIAL.displayName(G2)+'（【捷徑】）',te:{term:t,who:G2,kind:'friend'}}); R0.picked={who:G2,kind:'friend'};
    info('11. 【捷徑】'+t+'：語彤那一則到以前先放好、接好 '+SOCIAL.displayName(G2)+' '+K(sat)+'（六）22:00 的期末飯（OUT＋R.picked）；plan '+J({heart:P.heart,friend:P.friend}));
    let asked=null; walk(w.from,9,w.to,23.75,0.25,(d,hh)=>{ if(asked) return; const m=(H.G.msgs||[]).find(x=>x.ask&&x.from===YT&&/^te_/.test(x.ask.id)); if(m&&(d>m.day||(d===m.day&&hh>=m.h))){ asked={day:m.day,h:m.h}; PHONE.answer(H.G,m.ask.id,0); STORY.phoneRules(GM); } });
    const outs=OUT.rec(H.G).filter(q=>q&&/^te_/.test(q.id||'')).map(q=>({who:q.te&&q.te.who,d:K(q.day)+'（'+WDN(q.day)+'）',day:q.day,h:q.h,end:q.h+(q.hours||2),state:q.state}));
    const g=outs.find(o=>o.who===G2), y=outs.find(o=>o.who===YT), ov=g&&y&&g.day===y.day&&g.h<y.end&&y.h<g.end;
    check('11.【捷徑】先接的同一個週六 22:00、語彤那一頓時間不重疊：兩頓都留（BB-C 21:45）',!!asked&&!!g&&!!y&&g.state==='planned'&&y.state==='planned'&&g.day===sat&&y.day===sat&&!ov,J({asked:asked&&[K(asked.day),asked.h],outs})); }
  const fb=LOG.filter(x=>/^TE-HEART-AVOID 找不到別的晚上/.test(x)), lit=LOG.filter(x=>/^TE-HEART-AVOID 照字面互斥/.test(x)), other=LOG.filter(x=>/^TE-HEART-AVOID/.test(x)&&!fb.includes(x)&&!lit.includes(x));
  info('11. console.info 分開數（'+rows.length+' 輪）：「TE-HEART-AVOID 找不到別的晚上…」'+fb.length+' 次、「…照字面互斥…」'+lit.length+' 次、其他 TE-HEART-AVOID '+other.length+' 次；例 '+J([].concat(fb.slice(0,2),lit.slice(0,2),other.slice(0,2))).slice(0,500));
});

console.log('\n'+(FAILS?('FAILED '+FAILS+'（PASS '+PASSES+'）'):('ALL PASS '+PASSES)));
process.exit(FAILS?1:0);
})();
