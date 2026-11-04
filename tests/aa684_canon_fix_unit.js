// AA684-CANON-FIX-1104：AA_684（企劃線 0382b8a34，AA-C 定稿 D109）——AA_675、AA_679 接進遊戲以後的十二件裡要改的七件（2、7、9、10、12 照現在）。不需要瀏覽器。
//   1  漁人碼頭 D14（語彤，寒暑假週日、心願以後）：18:00 起（她 17:00 下班）；夕陽：暑假 18:00 以後看得到，寒假太陽已經下山（那一項灰掉）
//   3  重逢：invite「這週六我五點下班」／「你來店裡」、排在最近的週六 17:15（週五約也說「這週六」）；見面就在約的那一天＝「今天我五點下班」
//   4  阿哲：週二、四 18:00～19:30 在公館燒臘吃晚餐（不叫麵店日、沒有 ndlDay）；ev_zhe_long_table、ev_zhe_court_skip、ev_bohan_group_heard、ev_zhe_scooter、第三個徵兆（騎樓）看這一筆
//   5  Alison 23:00 趕到桌遊夜：補一句旁白
//   6  語彤告白：邀約在最後一科考完的那天 20:30、晚餐那天以後的第一個週六 17:30（週五考完＝隔天週六）；基本版「打烊以後」→「下班以後」
//   8  ENC_D24_SIS 記憶名稱中性「在礁溪遇到學姊一家」；「Alison 是她妹妹」另外記（KNOWS_SIS_ALISON，新版演過才有）
//   11 長桌閒聊：刪 bgn:false 的 10 則＋Alison 演不到的 3 則（Y2-5、Y3-1、Y3-3）；補四則桌遊夜版（大一、大二、大三上、大四）
// 修改前（開發分支 5e84c4237）：每一節都有 FAIL。用法：node tests/aa684_canon_fix_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify, YT='heroine_03', SIS='heroine_05', MX='classmate_mingxuan', XC='classmate_xinci', BH='classmate_bohan';
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){} }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const DK=k=>STORY.dayOfKey(k), K=d=>d==null?null:CALENDAR.dateOf(d).key, WD=d=>CALENDAR.dateOf(d).wd%7;
const at=(k,h,zone)=>{ const d=typeof k==='number'?k:DK(k); H.G.day=d; H.G.hour=h; H.G.weekday=WD(d); if(zone) H.G.zone=zone; };
const fresh=(k,h,zone,flags)=>{ H.fresh(typeof k==='number'?'2025-09-01':k,h,zone,flags); if(typeof k==='number') at(k,h); return H.G; };
const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/[^\n]*/g,'$1');
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const AA684=(()=>{ try{ return cp.execFileSync('git',['-C',H.ROOT,'show','0382b8a34:docs/story_planning/AA_684_回LAWWW_AA675與679接線的十二件.md'],{encoding:'utf8'}); }catch(e){ return ''; } })();
const inDoc=t=>!!AA684&&AA684.includes(t);
const says=()=>H.said.map(s=>(s.who?s.who+'：':'')+s.t);
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); } };
/* 假的 3D 人物（事件引擎的 npcPresent／npcNear 要「真的在場景裡」）：放在玩家旁邊 */
const putNpc=id=>{ const n={id,charId:id,obj:{position:{x:0,y:0,z:0.5}},lv:0}; GM.npc[id]=n; H.E.npcs.push(n); return n; };
const clearNpc=()=>{ GM.npc={}; H.E.npcs.length=0; };
const B=typeof BGN!=='undefined'?BGN:null;

(async()=>{
await sec(0,()=>{ check('0. 載得到：BGN、ENC、TRIP、TERMEND、VAC、VAC_DATA、NOODLE_TABLE；AA_684 讀得到（git show 0382b8a34）',!!B&&typeof ENC!=='undefined'&&typeof TRIP!=='undefined'&&typeof TERMEND!=='undefined'&&typeof VAC!=='undefined'&&typeof VAC_DATA!=='undefined'&&typeof NOODLE_TABLE!=='undefined'&&!!AA684); });

/* ---------- 1 漁人碼頭 D14 ---------- */
await sec(1,()=>{
  const row=ENCOUNTERS.rows.find(r=>r.who===YT&&r.spot==='D14'), ent=CHARACTERS[YT].daily_schedule.find(e=>e&&e.enc==='D14');
  check('1. D14 那一列：18:00 起、到 19:00（作息那一筆同一個時段）；AA_684「18:00 起」',!!row&&row.from===18&&row.to===19&&!!ent&&ent.from===18&&ent.to===19&&inDoc('**18:00 起**'),J([row&&[row.from,row.to],ent&&[ent.from,ent.to]]));
  const el=(k,h)=>{ fresh(k,h,'dorm',{WISH_DONE_heroine_03:true}); H.FRIEND(YT); const w=[]; const r=ENC.eligible(H.G,row,w); return r?'ok':w.join('|'); };
  const sz=(k,h)=>{ fresh(k,h,'dorm',{WISH_DONE_heroine_03:true}); H.FRIEND(YT); const e=STORY.schedEnt(CHARACTERS[YT],H.G); return e?(e.zone||('out:'+e.enc)):null; };
  const SUN='2026-07-12', WSUN='2026-02-01';   /* 大一暑假的週日、大一寒假的週日 */
  check('1. 寒暑假的週日（2026-07-12 暑假、2026-02-01 寒假）：15:00、16:30 她在一盞茶屋上班（不是漁人碼頭）；18:00、18:30 在漁人碼頭；19:00 以後不在',
    WD(DK(SUN))===0&&WD(DK(WSUN))===0&&HOME.breakOf(DK(WSUN))&&[sz(SUN,15),sz(SUN,16.5),sz(WSUN,15)].every(z=>z==='wz_teahouse')&&[sz(SUN,18),sz(SUN,18.5),sz(WSUN,18)].every(z=>z==='out:D14')&&sz(SUN,19.2)!=='out:D14',
    J([sz(SUN,15),sz(SUN,16.5),sz(WSUN,15),sz(SUN,18),sz(SUN,18.5),sz(WSUN,18),sz(SUN,19.2)]));
  const e16=el(SUN,16), e17=el(SUN,17.5), e18=el(SUN,18), e185=el(SUN,18.9), e19=el(SUN,19), w18=el(WSUN,18);
  check('1. 偶遇：16:00、17:30 不會在漁人碼頭遇到她（時段）；18:00、18:54、寒假 18:00 會；19:00 不會',e16!=='ok'&&e17!=='ok'&&e18==='ok'&&e185==='ok'&&w18==='ok'&&e19!=='ok',J([e16,e17,e18,e185,w18,e19]));
  /* 夕陽：她自己的句子（偶遇、同行、離開、重訪、之後在學校的一句）沒有夕陽；同行只有「海風與夕陽」那一項（D14.sunset）跟著夕陽 */
  const W=ENC_WALK, mine=[row.why].concat(row.lines.friend,row.lines.dating,(W.walk||[]).filter(q=>q.who===YT&&q.spot==='D14').map(q=>[].concat(q.friend,q.dating).join('')),(W.leave||[]).filter(q=>q.who===YT&&q.spot==='D14').map(q=>q.friend+q.dating),(W.revisit||[]).filter(q=>q.who===YT&&q.spot==='D14').map(q=>q.normal),ENCOUNTERS.school.ENC_D14_YT.lines).join('｜');
  const sp=TRIP.spot('D14'), pt=sp&&sp.points.find(p=>p.id==='D14.sunset'), wk=(W.walk||[]).find(q=>q.who===YT&&q.spot==='D14'&&q.act==='D14.sunset');
  check('1. 她的句子沒有「夕陽」「太陽」；跟著夕陽的只有「海風與夕陽」那一項（sunset:true）她的那一句（「要拍的話就是現在。再幾分鐘就沒了。」）',!/夕陽|太陽|落日/.test(mine)&&!!pt&&pt.sunset===true&&!!wk&&J(wk.friend)===J(['要拍的話就是現在。再幾分鐘就沒了。']),mine.slice(0,80));
  /* freetrip3d.js 的規則：夕陽那一項只在（日落 −40 分）～（日落 +10 分） */
  const can=(k,h)=>{ const ss=TRIP.sunset({day:DK(k)}); return h>=ss-40/60&&h<=ss+10/60; };
  check('1. 暑假 18:00 以後還看得到（7/12 18:30、8/9 18:00 那一項開著）；寒假天黑得早（1/25、2/1 18:00 已經下山＝她那一句演不到；橋上的燈沒有現成的句子，記給 AA）',
    can('2026-07-12',18.5)&&can('2026-08-09',18)&&!can('2026-01-25',18)&&!can('2026-02-01',18),J([TRIP.sunset({day:DK('2026-07-12')}),TRIP.sunset({day:DK('2026-01-25')}),TRIP.sunset({day:DK('2026-02-01')})]));
  const tea=CHARACTERS[YT].daily_schedule.find(e=>e&&e.zone==='wz_teahouse'&&e.vacation);
  check('1. 寒暑假週末茶屋的班那一筆的說明跟著改（D14 18:00～19:00）',!!tea&&/D14 漁人碼頭，週日 18:00～19:00/.test(tea.note||''),tea&&tea.note);
});

/* ---------- 3 重逢 ---------- */
await sec(3,()=>{
  const R=VAC_DATA.TRIP_MSG.reunion[YT];
  check('3. 語彤回來那一場：invite「這週六我五點下班」／「你來店裡」、inviteToday「今天我五點下班」／「你來店裡」、meetWd 6（週六）、17:15、一盞茶屋（字照 AA_684 第 3 項）',
    J(R.invite)===J(['這週六我五點下班','你來店裡'])&&J(R.inviteToday)===J(['今天我五點下班','你來店裡'])&&R.meetWd===6&&R.h===17.25&&R.place==='一盞茶屋'&&['「這週六我五點下班」／「你來店裡」','「今天我五點下班」','最近的週六 17:15'].every(inDoc),J({invite:R.invite,today:R.inviteToday,wd:R.meetWd,h:R.h}));
  const ri=(k,at)=>{ const x=VAC.reInvite(R,DK(k),at); return [K(x.day),x.invite[0]]; };
  check('3. VAC.reInvite：週三約＝那個週六（3 天後）「這週六」；週五約＝隔天週六、照樣「這週六」；週日約＝6 天後的週六',
    J(ri('2026-08-05',21))===J(['2026-08-08','這週六我五點下班'])&&J(ri('2026-08-28',21))===J(['2026-08-29','這週六我五點下班'])&&J(ri('2028-01-30',21))===J(['2028-02-05','這週六我五點下班']),J([ri('2026-08-05',21),ri('2026-08-28',21),ri('2028-01-30',21)]));
  check('3. 約的那天就是週六、還沒過 17:15（例：中午約）＝見面就在那一天、「今天我五點下班」；週六 21:00 才約（回國當天）＝那天 17:15 已經過了，排下一個週六、用「這週六」那一句（AA_684 沒寫，記給 AA）',
    J(ri('2027-07-24',12))===J(['2027-07-24','今天我五點下班'])&&J(ri('2027-07-24',21))===J(['2027-07-31','這週六我五點下班']),J([ri('2027-07-24',12),ri('2027-07-24',21)]));
  const R1=VAC_DATA.TRIP_MSG.reunion.heroine_01, x1=VAC.reInvite(R1,DK('2026-08-05'),21);
  check('3. 別人照舊：約的隔天、她自己的句子（以安「明天下午三點，總圖門口。」）',x1.day===DK('2026-08-06')&&J(x1.invite)===J(R1.invite),J([K(x1.day),x1.invite]));
  /* 實際走一次：交往中、出國回來那天 21:00 她約、出遊排在那個週六 17:15 */
  const yre=(id,yk)=>{ const I=VAC.inst(id,yk); fresh(I.to,17.9,'dorm',{dating_heroine_03:true}); H.CLOSE(YT); VAC.rec(H.G).reg[I.key]='done'; run(17.9,21.5);
    const q=OUT.get(H.G,'vac_'+I.key+'_re_'+YT); return {to:K(I.to),t:(H.G.msgs||[]).filter(m=>m.tag==='vac_re_'+I.key+'_'+YT).map(m=>[K(m.day),m.h,m.text]),q:q&&[K(q.day),q.h,q.place]}; };
  const a=yre('C09','Y1'), b=yre('C05','Y1'), c=yre('C18','Y1'), d=yre('C11','Y3');
  check('3. 2026-08-05（三）回來：當晚 21:00「這週六我五點下班」「你來店裡」，出遊 8/8（六）17:15 一盞茶屋',J(a.t)===J([['2026-08-05',21,'這週六我五點下班'],['2026-08-05',21,'你來店裡']])&&J(a.q)===J(['2026-08-08',17.25,'一盞茶屋']),J(a));
  check('3. 2026-08-28（五）回來：出遊隔天 8/29（六）；2026-07-28（二）回來：8/1（六）；2028-01-30（日）回來：2/5（六）',J(b.q)===J(['2026-08-29',17.25,'一盞茶屋'])&&b.t[0][2]==='這週六我五點下班'&&J(c.q)===J(['2026-08-01',17.25,'一盞茶屋'])&&J(d.q)===J(['2028-02-05',17.25,'一盞茶屋']),J([b,c,d]));
  const e=yre('C10','Y2');
  check('3. 2027-07-31（六）20:00 回來：21:00 約，17:15 已經過了＝下一個週六 8/7（句子用「這週六」，記給 AA）',J(e.q)===J(['2027-08-07',17.25,'一盞茶屋'])&&e.t[0][2]==='這週六我五點下班',J(e));
  check('3. 程式：見面那一天、約的句子都照 VAC.reInvite（presence 看見面那一天）',/const RI=S\.reInvite\(R,inv,21\);/.test(strip(src('src/vac3d.js')))&&/STORY\.presence\(id,Object\.assign\(\{\},G,\{day:RI\.day\}\)\)/.test(src('src/vac3d.js'))&&/day:RI\.day,/.test(src('src/vac3d.js')));
});

/* ---------- 4 阿哲：週二、四 18:00～19:30 公館燒臘 ---------- */
await sec(4,()=>{
  const Z=CHARACTERS.zhe.daily_schedule, e=Z.find(x=>x&&x.zone==='noodle');
  check('4. 阿哲的作息：週二、四 18:00～19:30 在公館燒臘吃晚餐（zone noodle、act eat）；不叫麵店日（沒有 ndlDay）',!!e&&J(e.days)===J([2,4])&&e.from===18&&e.to===19.5&&e.act==='eat'&&!e.ndlDay&&!Z.some(x=>x&&x.ndlDay)&&inDoc('週二、四 18:00～19:30 在公館燒臘吃晚餐'),J(e));
  const wz=(k,h)=>{ fresh(k,h,'dorm'); const w=STORY.whereIs(GM,'zhe'); return [w?(w.zone||w.away):null,STORY.zheAtNoodle(H.G)]; };
  const tue=wz('2025-10-07',18.5), thu=wz('2025-10-09',19.25), mon=wz('2025-10-06',18.5), wed=wz('2025-10-08',18.5), early=wz('2025-10-07',17.9), late=wz('2025-10-07',19.6);
  check('4. 2025-10-07（二）18:30、10-09（四）19:15 在燒臘店；10-06（一）、10-08（三）18:30 在公館走走；週二 17:54、19:36 不在燒臘店',
    tue[0]==='noodle'&&tue[1]&&thu[0]==='noodle'&&thu[1]&&mon[0]==='gongguan'&&!mon[1]&&wed[0]==='gongguan'&&!wed[1]&&early[0]!=='noodle'&&!early[1]&&late[0]!=='noodle'&&!late[1],J([tue,thu,mon,wed,early,late]));
  const v=wz('2026-07-14',18.5), w10=wz(STORY.termDay('Y2S1',10,4),18.5), b11=wz(STORY.termDay('Y1S2',11,4),19.2);
  check('4. 寒暑假回高雄（2026-07-14）不在；大二上第 10 週週四在籃球場（哲 2）、大一下第 11 週週四 19:00 在博雅的講座（有學期的作息照舊先算）',!v[1]&&v[0]==='回高雄'&&!w10[1]&&!b11[1]&&b11[0]==='boya',J([v,w10,b11]));
  let nd=null, ndOther=null; for(let d=DK('2025-10-06');d<DK('2025-11-30');d++){ if(STORY.noodleDay(d)&&[2,4].includes(WD(d))&&nd==null) nd=d; if(STORY.noodleDay(d)&&![2,4].includes(WD(d))&&ndOther==null) ndOther=d; }
  const notNd=(()=>{ for(let d=DK('2025-10-06');d<DK('2025-11-30');d++) if(!STORY.noodleDay(d)&&[2,4].includes(WD(d))&&CALENDAR.kind(d)==='term'&&!CALENDAR.holiday(d)) return d; return null; })();
  const a1=notNd!=null?wz(notNd,18.5):null, a2=ndOther!=null?wz(ndOther,18.5):null;
  check('4. 跟麵店日無關：不是麵店日的週二／四照樣在（'+K(notNd)+'）；週一／三／五的麵店日照樣不在（'+K(ndOther)+'）',!!a1&&a1[1]&&!!a2&&!a2[1],J([K(notNd),a1,K(ndOther),a2]));
  /* 五件事 */
  const lt=ev('ev_zhe_long_table'), cs=ev('ev_zhe_court_skip'), bh=ev('ev_bohan_group_heard'), sc=ev('ev_zhe_scooter'), ar=ev('ev_yu_sign_question_arcade');
  check('4. 四個事件看阿哲照作息在燒臘店（npcZone:zhe），沒有 ndlDay；台詞照舊',[lt,cs,bh,sc].every(x=>!!x&&x.npcZone==='zhe'&&!x.ndlDay)&&J(cs.dialogue[0])===J({speaker:'zhe',expression:'smile',text:'上次沒事啦。'})&&bh.dialogue[0].text==='柏翰組了一個考古題小組。我去了一次。……他講第三題講了四十分鐘。'&&sc.dialogue.some(l=>l.text==='修車行估了價。對方照估價付了。'));
  const ck=(e,k,h,zone,flags,pre)=>{ clearNpc(); fresh(k,h,zone,flags); if(pre) pre(); let r=false; try{ r=!!EVENTS.check(e); }catch(x){ r='err:'+x; } clearNpc(); return r; };
  const y1t=STORY.termDay('Y1S1',5,2), y1m=STORY.termDay('Y1S1',5,1);
  check('4. ev_zhe_long_table（自己走進燒臘店）：大一上第 5 週週二 18:30 在燒臘店成立；同一週週一 18:30、週二 17:45 不成立',ck(lt,y1t,18.5,'noodle')===true&&ck(lt,y1m,18.5,'noodle')===false&&ck(lt,y1t,17.75,'noodle')===false,J([K(y1t),ck(lt,y1t,18.5,'noodle'),ck(lt,y1m,18.5,'noodle'),ck(lt,y1t,17.75,'noodle')]));
  const cT=DK('2026-11-17'), cM=DK('2026-11-16'), cF={ZHE2_ASKED:true};
  check('4. ev_zhe_court_skip：2026-11-17（二）18:30 燒臘店、阿哲在場＝成立；11-16（一）18:30 就算有人放了阿哲也不成立（作息不在）',ck(cs,cT,18.5,'noodle',cF,()=>putNpc('zhe'))===true&&ck(cs,cM,18.5,'noodle',cF,()=>putNpc('zhe'))===false&&ck(cs,cT,18.5,'noodle',cF)===false,J([ck(cs,cT,18.5,'noodle',cF,()=>putNpc('zhe')),ck(cs,cM,18.5,'noodle',cF,()=>putNpc('zhe')),ck(cs,cT,18.5,'noodle',cF)]));
  const b7=STORY.termDay('Y2S1',7,2), b7m=STORY.termDay('Y2S1',7,1);
  check('4. ev_bohan_group_heard：大二上第 7 週週二 18:30 成立、週一不成立',ck(bh,b7,18.5,'noodle')===true&&ck(bh,b7m,18.5,'noodle')===false,J([K(b7),ck(bh,b7,18.5,'noodle'),ck(bh,b7m,18.5,'noodle')]));
  const sT=DK('2027-11-23'), sM=DK('2027-11-22'), mem=()=>{ SOCIAL.remember('zhe','ZHE_SCOOTER',''); putNpc('zhe'); };
  check('4. ev_zhe_scooter：2027-11-23（二）18:30 燒臘店、阿哲在旁邊＝成立；11-22（一）不成立',ck(sc,sT,18.5,'noodle',{},mem)===true&&ck(sc,sM,18.5,'noodle',{},mem)===false,J([ck(sc,sT,18.5,'noodle',{},mem),ck(sc,sM,18.5,'noodle',{},mem)]));
  /* 第三個徵兆（騎樓）：今天在燒臘店的時候阿哲照作息也在（STORY.zheNdlMark 記 zheNdlDay）*/
  const q13=STORY.termDay('Y1S2',13,2), q13m=STORY.termDay('Y1S2',13,1), sg={met_yu:true,yu2SoymilkDay:STORY.termDay('Y1S2',13,1)};
  fresh(q13,18.5,'noodle',sg); const m1=STORY.zheNdlMark(H.G), d1=H.G.flags.zheNdlDay; H.G.zone='gongguan'; H.G.hour=19.7; const s1=!!EVENTS.check(ar);
  fresh(q13,17.9,'noodle',sg); const m0=STORY.zheNdlMark(H.G); H.G.zone='gongguan'; H.G.hour=19.7; const s0=!!EVENTS.check(ar);
  fresh(q13,19.7,'gongguan',Object.assign({ndlDays:[q13]},sg)); const sOld=!!EVENTS.check(ar);
  fresh(q13m,18.5,'noodle',sg); const mM=STORY.zheNdlMark(H.G);
  check('4. 第三個徵兆（騎樓）：大一下第 13 週週二 18:30 在燒臘店（阿哲在）→ 19:42 走到公館＝成立；17:54 就走（阿哲還沒來）＝不成立；只有麵店日的紀錄 ndlDays＝不成立；週一在燒臘店不記',
    m1&&d1===q13&&s1&&!m0&&!s0&&!sOld&&!mM,J([m1,K(d1),s1,m0,s0,sOld,mM]));
  check('4. 程式：S.tick 在燒臘店裡每一格叫 S.zheNdlMark；徵兆的條件讀 zheNdlDay（不再讀 ndlDays）',/if\(G\.zone==='noodle'\)\{ noodleRegulars\(GM\); S\.zheNdlMark\(G\); \}/.test(src('src/story3d.js'))&&/F\.zheNdlDay===G\.day/.test(strip(src('src/data/events.js')))&&!/ndlDays\.includes\(G\.day\)/.test(strip(src('src/data/events.js'))));
});

/* ---------- 5 Alison 趕到桌遊夜的旁白 ---------- */
await sec(5,async()=>{
  const T='（十一點多，門口的風鈴響了一聲。Alison 還穿著戲院的外套，手上抱著一袋爆米花。）';
  check('5. 旁白一字照 AA_684 第 5 項',B.LINES.yuIn===T&&inDoc(T),B.LINES.yuIn);
  const n14=STORY.termDayIn('Y1S2',14,5), n12=STORY.termDayIn('Y1S2',12,5);
  const night=async(d,o)=>{ o=o||{}; fresh(d,20,'dorm',o.flags); if(o.met!==false) H.G.flags.met_yu=true; PHONE.join(H.G,'noodle_team','桌遊團'); for(const id of ['zhe',BH,XC,MX].concat(o.met!==false?['yu']:[])) H.FAMILIAR(id);
    H.G.flags.noodleTableDay=d-70; H.G.flags.BGN_N=3; if(o.done) H.G.events.done.ev_yu_sign_seat=1; if(o.pre) o.pre(); H.said=[]; await EVENTS.runLines(B.EVENT.dialogue,B.EVENT); return says(); };
  const L=await night(n14), iEnd=L.findIndex(t=>B.LINES.end.includes(t)), iIn=L.indexOf(T), iS=L.indexOf('Alison 每次都坐阿哲旁邊。');
  check('5. Alison 23:00 從戲院趕到的那一晚（大一下第 14 週）：場景的結束旁白 → 她進門的旁白 → 「Alison 每次都坐阿哲旁邊。」',iEnd>=0&&iIn>iEnd&&iS>iIn,J(L));
  const L12=await night(n12);
  check('5. 別的桌遊夜（大一下第 12 週）沒有這一句',!L12.includes(T),J(L12));
  const Ln=await night(n14,{met:false});
  check('5. 不認識 Alison：沒有這一句（旁白寫她的名字）、也沒有徵兆',!Ln.includes(T)&&!Ln.includes('Alison 每次都坐阿哲旁邊。'),J(Ln));
  const Ld=await night(n14,{done:true});
  check('5. 舊存檔徵兆已經演過：她照樣進門（這一句），不再演「Alison 每次都坐阿哲旁邊。」',Ld.includes(T)&&!Ld.includes('Alison 每次都坐阿哲旁邊。'),J(Ld));
  { const P=CHARACTERS.yu.presence, k14=CALENDAR.dateOf(n14).key, k15=CALENDAR.dateOf(n14+1).key, keep=P.absentDates; P.absentDates=(keep||[]).concat([[k14,k15,'（測試）出遠門','trip']]);
    let La=null; try{ La=await night(n14); } finally { P.absentDates=keep; }
    check('5. 那一天她人不在（出遠門）＝沒有來、沒有這一句',!La.includes(T),J(La)); }
});

/* ---------- 6 語彤告白：考完那天 20:30 邀約、之後第一個週六 17:30 ---------- */
await sec(6,async()=>{
  const h=TERMEND_LINES.HEART[YT];
  check('6. HEART.heroine_03 寫 examDay；基本版的「打烊以後」改「下班以後」（invite、invite2）；大一下 over 照舊',h.examDay===true&&h.invite==='禮拜六我沒排班。……茶屋下班以後，我泡茶。只有我們。'&&h.invite2==='禮拜六。下班以後。……你上次說要想，想好了嗎。'&&!/打烊以後/.test(h.invite+h.invite2)&&TERMEND.heart(YT,'Y1S2').invite==='禮拜六我上班到五點。下班以後，你要不要來店裡？'&&inDoc('基本版的「打烊以後」改「下班以後」'),J([h.invite,h.invite2]));
  const out={}; for(const t of ['Y1S1','Y2S1','Y2S2','Y3S1','Y4S1']){ const w=TERMEND.windowOf(t); fresh(w.from,1,'dorm'); H.FRIEND(YT); TERMEND.plan(H.G,w); const sp=TERMEND.heart(YT,t), ls=CLS.examList(H.G,t).filter(e=>e.kind==='final').map(e=>e.day), last=ls.length?Math.max(...ls):null;
    out[t]={last:K(last)+'/'+WD(last),ed:K(TERMEND.examDay(H.G,w)),from:K(TERMEND.heartFrom(H.G,w,YT,sp)),dd:K(TERMEND.dinnerDay(H.G,w,Object.assign({},sp),YT))}; }
  check('6. 最後一科在週五的學期：大二下（6/11 五）邀約 6/11、晚餐 6/12（六）；大四上（12/22 五）邀約 12/22、晚餐 12/23（六）——原本是隔天才約、再下一個週六（6/19、12/30）',
    out.Y2S2.last==='2027-06-11/5'&&out.Y2S2.from==='2027-06-11'&&out.Y2S2.dd==='2027-06-12'&&out.Y4S1.last==='2028-12-22/5'&&out.Y4S1.from==='2028-12-22'&&out.Y4S1.dd==='2028-12-23',J([out.Y2S2,out.Y4S1]));
  check('6. 最後一科在週四（時段第一天）的學期：邀約那天晚上、晚餐那個週六（大一上 12/20、大二上 12/26、大三上 12/25）',out.Y1S1.from==='2025-12-18'&&out.Y1S1.dd==='2025-12-20'&&out.Y2S1.dd==='2026-12-26'&&out.Y3S1.dd==='2027-12-25',J([out.Y1S1,out.Y2S1,out.Y3S1]));
  { const w=TERMEND.windowOf('Y2S2'); fresh(w.from,1,'dorm'); TERMEND.plan(H.G,w); const a=TERMEND.heartFrom(H.G,w,'heroine_01',TERMEND.heart('heroine_01','Y2S2'));
    check('6. 沒寫 examDay 的人照原本（以安：最後一科考完的隔天 6/12）',K(a)==='2027-06-12',K(a)); }
  /* 實際走一次大二下：語彤的心意邀約 6/11（五）20:30 傳、答應以後出遊排 6/12（六）17:30 一盞茶屋 */
  { const w=TERMEND.windowOf('Y2S2'); fresh(w.from,9,'campus'); H.G.stage='law'; SOCIAL.remember(YT,'FIRST_MET',''); H.rel(YT,70,50,45); SOCIAL.rel(YT).npcRom=40; DATE.log(H.G,YT).count=4; DATE.log(H.G,YT).wish=true;
    const P=TERMEND.plan(H.G,w); at(DK('2027-06-11'),20); run(20,21);
    const M=(H.G.msgs||[]).filter(m=>m.tag==='te_Y2S2_heroine_03').map(m=>[K(m.day),m.h,m.text]);
    check('6. 大二下：心意邀約在最後一科考完的那天（6/11 五）20:30 傳，句子是基本版（「……茶屋下班以後，我泡茶。只有我們。」）',P.heart.includes(YT)&&J(M)===J([['2027-06-11',20.5,'禮拜六我沒排班。……茶屋下班以後，我泡茶。只有我們。']]),J({heart:P.heart,M}));
    PHONE.answer(H.G,'te_Y2S2_heroine_03',0); STORY.phoneRules(GM); const q=OUT.get(H.G,'te_Y2S2');
    check('6. 答應以後：出遊排 6/12（六）17:30、一盞茶屋（不是 6/19）',!!q&&q.te&&q.te.who===YT&&K(q.day)==='2027-06-12'&&q.h===17.5&&q.place==='一盞茶屋',J(q&&[K(q.day),q.h,q.place])); }
});

/* ---------- 8 ENC_D24_SIS 中性、KNOWS_SIS_ALISON 另外一條 ---------- */
await sec(8,async()=>{
  const L=SOCIAL.MEMORY_LABEL;
  check('8. 記憶名稱：ENC_D24_SIS「在礁溪遇到學姊一家」、KNOWS_SIS_ALISON「Alison 是她妹妹」（字照 AA_684 第 8 項）',L.ENC_D24_SIS==='在礁溪遇到學姊一家'&&L.KNOWS_SIS_ALISON==='Alison 是她妹妹'&&inDoc('「在礁溪遇到學姊一家」')&&inDoc('「Alison 是她妹妹」'),J([L.ENC_D24_SIS,L.KNOWS_SIS_ALISON]));
  const row=ENCOUNTERS.rows.find(r=>r.who===SIS&&r.spot==='D24'), SUN=STORY.termDayIn('Y3S1',3,7);
  const panel=()=>SOCIAL.panelMemories(SIS).map(m=>L[m.tag]||m.tag);
  const meet=async(tier)=>{ fresh(SUN,11,'dorm'); H.G.trip={id:'D24'}; if(tier==='dating'){ H.FRIEND(SIS); H.G.flags['dating_'+SIS]=true; } else H.FAMILIAR(SIS); H.FAMILIAR('yu'); H.said=[]; H.picks=['打招呼']; await ENC.meet(GM,row,ENC.tier(H.G,SIS)); return panel(); };
  let p=await meet('acq');
  check('8. 新版那一場演過：人物頁有「在礁溪遇到學姊一家」，接著另外一條「Alison 是她妹妹」；KNOWS_SIS_ALISON 旗標照記',H.G.flags.KNOWS_SIS_ALISON===true&&SOCIAL.has(SIS,'KNOWS_SIS_ALISON')&&p.indexOf('在礁溪遇到學姊一家')>=0&&p.indexOf('Alison 是她妹妹')>p.indexOf('在礁溪遇到學姊一家'),J(p));
  p=await meet('dating');
  check('8. 交往中的版本也一樣（兩條）',SOCIAL.has(SIS,'KNOWS_SIS_ALISON')&&p.includes('在礁溪遇到學姊一家')&&p.includes('Alison 是她妹妹'),J(p));
  fresh(SUN,11,'dorm'); H.FRIEND(SIS); SOCIAL.remember(SIS,'ENC_D24_SIS','');
  { const w=[]; const r=ENC.eligible(H.G,row,w); const p0=panel();
    check('8. 舊存檔看過舊版的：人物頁只有中性的「在礁溪遇到學姊一家」、沒有「Alison 是她妹妹」（不會先說出來）；不重演、不設 KNOWS_SIS_ALISON',!r&&p0.includes('在礁溪遇到學姊一家')&&!p0.some(t=>/妹妹/.test(t))&&!H.G.flags.KNOWS_SIS_ALISON&&!SOCIAL.has(SIS,'KNOWS_SIS_ALISON'),J([p0,w])); }
});

/* ---------- 11 長桌閒聊：刪 13 則、補四則桌遊夜版 ---------- */
await sec(11,async()=>{
  const T=NOODLE_TABLE, all=Object.values(T).flat(), first=e=>(e.dialogue||[]).map(l=>l.text).join('／');
  check('11. 沒有 bgn:false 的了（10 則都刪）',!all.some(e=>e&&e.bgn===false),J(all.filter(e=>e&&e.bgn===false).map(first)));
  const GONE=['Alison 把滷蛋切成四份','語彤從櫃台後面走過來','吃到一半停電了三秒','阿哲的滷蛋少了半顆','考試前的燒臘店','欸，下禮拜的報告分組','他暑假要去事務所實習','阿姨把電視轉到新聞','對了，司法官的補習班','長桌少了一個人','欸，畢業以後還是要來吃燒臘','牆上的紅紙又多了兩張','阿哲把大家的碗疊起來'];
  const left=GONE.filter(g=>all.some(e=>J(e.dialogue||[]).includes(g)));
  check('11. 刪掉的 13 則都不在了（bgn:false 10 則＋Alison 演不到的大二第 5 則、大三第 1、3 則）',!left.length&&inDoc('Y2-5、Y3-1、Y3-3')&&inDoc('**10 則都刪**'),J(left));
  /* AA_684 第 11 項的表：一格「（旁白）／名字：句子／…」→ 事件引擎的句子 */
  const NM={芯慈:XC,阿哲:'zhe',明軒:MX,老闆:'老闆'};
  const cell=lab=>{ const ln=AA684.split('\n').find(l=>l.startsWith('| '+lab)); if(!ln) return null; const c=ln.split('|')[2].trim(); return c.split('／').map(x=>{ x=x.trim(); const m=/^([^：（]+)：(.+)$/.exec(x); return m?{speaker:NM[m[1]],text:m[2]}:{speaker:null,text:x}; }); };
  const S4=[['Y1',1,'大一（取代',null],['Y2',0,'大二（取代',null],['Y3',0,'大三上（補空缺',['Y3S1']],['Y4',3,'大四（取代',['Y4S2']]];
  const bad=[]; for(const [k,i,lab,term] of S4){ const e=T[k][i], want=cell(lab), got=e&&(e.dialogue||[]).map(l=>({speaker:l.speaker,text:l.text}));
    if(!want||J(got)!==J(want)) bad.push(k+'['+i+']'); if(J((e&&e.if&&e.if.term)||null)!==J(term)) bad.push(k+'['+i+'].term'); }
  check('11. 四則桌遊夜版逐字照 AA_684 的表、放在大一第 2 則、大二第 1 則、大三第 1 則（只有大三上）、大四第 4 則（照原本那一則的大四下）',!bad.length,J(bad));
  check('11. 每一則的人（who）：大一 芯慈、阿哲；大二 阿哲；大三上 明軒、阿哲；大四 阿哲、芯慈；長度 大一 6、大二 3、大三 3、大四 4（再加 heard3d.js 加進大一的「別人說起她」）',
    J(T.Y1[1].who)===J([XC,'zhe'])&&J(T.Y2[0].who)===J(['zhe'])&&J(T.Y3[0].who)===J([MX,'zhe'])&&J(T.Y4[3].who)===J(['zhe',XC])&&T.Y1.filter(e=>!e.once).length===6&&T.Y2.length===3&&T.Y3.length===3&&T.Y4.length===4,J([T.Y1.length,T.Y2.length,T.Y3.length,T.Y4.length]));
  /* 桌遊夜真的演 */
  const NIGHTS=term=>B.weeks(term).map(w=>STORY.termDayIn(term,w,5)).filter(d=>d!=null&&B.isNight(d));
  const ALL=['zhe','yu',BH,XC,MX];
  const nightAt=(d,flags)=>{ fresh(d,22,'dorm',Object.assign({afternoonDone:true},flags||{})); PHONE.join(H.G,'noodle_team','桌遊團'); for(const id of ALL){ SOCIAL.remember(id,'FIRST_MET',''); } H.G.flags.met_yu=true; };
  const play=async()=>{ H.said=[]; await B.talk(GM); return says(); };
  { const seq=[]; let flags=null, soc=null; for(const d of NIGHTS('Y1S1')){ fresh(d,22,'dorm',Object.assign({afternoonDone:true},flags||{})); if(soc){ H.G.social=soc; SOCIAL.bind(H.G); } PHONE.join(H.G,'noodle_team','桌遊團'); for(const id of ALL) SOCIAL.remember(id,'FIRST_MET',''); H.G.flags.met_yu=true; const L=await play(); seq.push(L[0]); flags=H.G.flags; soc=H.G.social; }
    check('11. 大一上的桌遊夜照順序：第 1 則 → 便利貼（新）→ 期末考範圍 → 芯慈趴在桌上 → 系籃（Alison 那一則她不在、跳過）',J(seq.slice(0,5))===J(['長桌已經坐了一半。阿哲把菜單推給你，雖然大家都只點那幾樣。','（芯慈在每個人的杯子上貼了一張便利貼，寫上名字。）',SOCIAL.displayName(BH)+'：期末考範圍我整理成一張表了。','芯慈一坐下就趴在桌上。',SOCIAL.displayName('zhe')+'：欸，下禮拜系籃練球，你來不來？'])&&seq.length===5,J(seq)); }
  nightAt(NIGHTS('Y1S1')[0]); H.G.flags.ndlTalkN={Y1:1}; let L=await play();
  check('11. 大一那一則演出來：（芯慈在每個人的杯子上貼了一張便利貼，寫上名字。）／芯慈：上次有人喝錯。／阿哲：……是我。',J(L)===J(['（芯慈在每個人的杯子上貼了一張便利貼，寫上名字。）',SOCIAL.displayName(XC)+'：上次有人喝錯。',SOCIAL.displayName('zhe')+'：……是我。']),J(L));
  nightAt(NIGHTS('Y2S1')[0]); L=await play();
  check('11. 大二第一個桌遊夜：第 1 則就是新的那一則（老闆來收杯子），「老闆」的名字照稿',J(L)===J(['（老闆來收杯子，順手把冷氣調小了一點。）',SOCIAL.displayName('zhe')+'：老闆，再一局就走。','老闆：你上次也這樣說。']),J(L));
  nightAt(NIGHTS('Y3S1')[0]); H.G.flags.ndlTalkN={Y3:1}; L=await play();
  check('11. 大三上的桌遊夜（原本一則都沒有）：明軒那一則（第 2、3 則是大三下的，跳過）',J(L)===J(['（明軒把新的盒子翻過來，看背面的人數。）',SOCIAL.displayName(MX)+'：這款四個人剛好。CP 值最高。',SOCIAL.displayName('zhe')+'：你每一款都這樣說。']),J(L));
  nightAt(NIGHTS('Y4S1')[0]); H.G.flags.ndlTalkN={Y4:3}; L=await play();
  check('11. 大四上：大四那一則（大四下才有）跳過，從頭第 1 則',J(L)===J([SOCIAL.displayName('zhe')+'：最後一年了。……不要那個表情，還有一整年。']),J(L));
  nightAt(NIGHTS('Y4S2')[0]); H.G.flags.ndlTalkN={Y4:3}; L=await play();
  check('11. 大四下：阿哲「畢業以後也要揪。一個月一次就好。」芯慈「我排進行事曆。每個月第一個禮拜五。」',J(L)===J([SOCIAL.displayName('zhe')+'：畢業以後也要揪。一個月一次就好。',SOCIAL.displayName(XC)+'：我排進行事曆。每個月第一個禮拜五。']),J(L));
});

H.done();
})();
