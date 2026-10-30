// 一起運動的約會：羽球 gym_badminton、晨跑 run_avenue（AA_417 第 3 節，企劃線 99710a908，AA-B 2026-10-23 18:2x 定稿；AA_126 6-3、6-6；USER_WANTS D40）——不需要瀏覽器。
//   0  接線：兩個地點（新體育館 1F／椰林大道）、時段、階段、下雨；SOCIAL.ACT.sport；學姊筆試前的上限包含這兩個地點；白名單 AA_417@99710a908
//   1  台詞一字不差（AA_417 原文；45 句：子晴 15、可昕 14、其他五位 12、共用旁白 4）；子晴沒有「欸不是」「這不是問句」、不用遊戲講感情；可昕沒有「假設」、沒有比輸贏、比學校；學姊沒有「重點是」
//   2  規則：羽球有點熟以上、平日 12～21、週末 9～17；晨跑朋友以上、只有 06:30、今天下雨約不到、那天早上下雨取消；她在傅鐘前的椰林大道等
//   3  答應的那一句：子晴 A／R、可昕（政大那幾年、交往中）、以安語彤芷若學姊沛珊（§3-3）、男生朋友「（他答應了。）」；AA_415 的一般句不搶
//   4  見面：子晴、可昕第一次那句只有一次、一起的時候三句輪流、結束是最後一句；其他人共用旁白
//   5  數值：子晴、可昕自在 +3、她的戀愛 +3（一天一次）；其他人只有一般的「一起運動」；羽球算體能（和自己打羽球共用每週 2 次）
//   6  照舊：學姊筆試前照 rule（上限的婉拒）、沛珊大二下聯絡不到；可昕交往中手機約的清單多兩個運動
//   7  手機約（INV.flow）：晨跑只列 06:30，答應句照 §3
// 修改前（開發分支 791685e10）：沒有 gym_badminton、run_avenue——FAIL。用法：node tests/aa417_sport_invite_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (INVITE_REPLIES|MSG2_POOL|SISG)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ load('src/data/invite_replies.js'); load('src/data/msg2_pool.js'); load('src/sis_grad3d.js'); }catch(e){ ok=false; err=String(e); }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const txt=ls=>(ls||[]).map(x=>typeof x==='string'?x:x.me).join('');
const REL={1:{fam:10},2:{fam:25},3:{fam:45,trust:30},4:{fam:65,trust:50,comf:45}};
const setSt=(id,s)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:0,trust:0,comf:0,npcRom:0,rom:0},REL[s==='d'?3:s]); SOCIAL.remember(id,'FIRST_MET',''); if(s==='d') H.G.flags['dating_'+id]=true; };
const fresh=(key,id,s,o)=>{ H.fresh(key,(o&&o.hour!=null)?o.hour:9,'campus'); if(o&&o.econ) H.G.stage='econ'; if(id) setSt(id,s); return H.G; };
const D=k=>PG.DK(k);
const P=pid=>INV.place(pid);
const ask=(id,pid,h,day)=>{ const G=H.G; day=day==null?G.day:day; const d=INV.decide(G,id,pid,day,h); return INV.personal(G,id,P(pid),day,h,d); };
const meet=async(id,pid,h)=>{ const G=H.G; const iv=INV.accept(G,id,pid,G.day,h==null?G.hour%24:h,{by:'player'}); H.said=[]; await INV.meet(GM,iv,null); return H.said.map(s=>s.t); };
const SPEC='docs/story_planning/AA_417_健身定稿_升階一句_注意到_羽球晨跑.md';
const IP=()=>INVITE_DATA.people;
const ZQ_B=[['「那球出界了。……好啦，是我沒接到。」'],['「剛剛那一球，你有看到吧。我接到了。」'],['「你不要一直幫我撿球。……謝謝。」']];
const KX_R=[['「跑到傅鐘不要停。跑回來才算。」'],['「我不喘。……我在講話，所以我不喘。」'],['「早上的台大好安靜。山上的鳥比較吵。」']];

(async()=>{
await sec(0,()=>{ const B=P('gym_badminton'), R=P('run_avenue');
  check('0. 羽球 gym_badminton：新體育館（gym）、有點熟以上、平日 12～21、週末 9～17、一小時',!!B&&B.zone==='gym'&&B.minStage==='FAMILIAR'&&J(B.hoursBy)===J({wk:[12,21],we:[9,17]})&&B.stay===1&&B.sport===true,J(B));
  check('0. 晨跑 run_avenue：校園（椰林大道）、朋友以上、06:30～07:30、只能約 06:30、下雨不能約',!!R&&R.zone==='campus'&&R.minStage==='FRIEND'&&J(R.hours)===J([6.5,7.5])&&J(R.times)===J([6.5])&&R.noRain===true&&R.sport===true,J(R));
  check('0. INV.sportLines、INV.sportAfter；SOCIAL.ACT.sport；記憶名稱',typeof INV.sportLines==='function'&&typeof INV.sportAfter==='function'&&!!SOCIAL.ACT.sport&&SOCIAL.MEMORY_LABEL.SPORT_BADMINTON==='一起打羽球'&&SOCIAL.MEMORY_LABEL.SPORT_RUN==='一起晨跑');
  check('0. 學姊筆試前的邀約上限包含羽球、晨跑（AA_417 3-3 照現有的 rule）',ok&&SISG.CAP_PLACES.includes('gym_badminton')&&SISG.CAP_PLACES.includes('run_avenue'),err);
  const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===SPEC);
  check('0. 白名單：AA_417@ab9d70fe0 approved（AA-C 2026-10-27 AA_475 第 3 節；原本 AA-B 10-23 定稿 99710a908）',A.length===1&&A[0].sha==='ab9d70fe0'&&A[0].status==='approved'&&A[0].approvedBy==='AA-C 2026-10-27 AA_475 第 3 節改羽球「結束」句（D109；原本 AA-B 2026-10-23 18:2x 定稿 99710a908）'&&A[0].kind==='text',J(A)); });

await sec(1,()=>{ let md=''; try{ md=cp.execSync('git -C "'+H.ROOT+'" show ab9d70fe0:"'+SPEC+'"',{encoding:'utf8'}); }catch(e){ md=''; }
  check('1. 讀得到企劃線 ab9d70fe0 的 AA_417',md.includes('### 3-1. 子晴')&&md.includes('### 3-3. 其他人'));
  const s3=md.slice(md.indexOf('## 3. 一起運動'),md.indexOf('## 4.'));
  const all=[], add=(who,ls)=>{ for(const x of [].concat(ls||[])){ if(Array.isArray(x)) add(who,x); else if(x) all.push([who,typeof x==='string'?x:x.me]); } };
  const lawG={stage:'law'};
  for(const id of ['heroine_01','heroine_02','heroine_03','heroine_05','classmate_peishan']) for(const pid of ['gym_badminton','run_avenue']) add(id,IP()[id].acc[pid]);
  for(const pid of ['gym_badminton','run_avenue']){ const a=IP().heroine_04.acc[pid]; add('heroine_04',[a.A,a.R]); const k=IP().kexin.acc[pid](lawG); add('kexin',[k.A,k.R]);
    add('heroine_04',IP().heroine_04.firstAt[pid]); add('kexin',IP().kexin.firstAt[pid](lawG));
    for(const id of ['heroine_04','kexin']){ add(id,IP()[id].sport[pid].during); add(id,IP()[id].sport[pid].end); }
    add('shared',INVITE_DATA.sport[pid].during); add('shared',INVITE_DATA.sport[pid].end); }
  const bad=all.filter(([w,t])=>!s3.includes(t));
  check('1. §3 的 '+all.length+' 句都在 AA_417 第 3 節裡一字不差',all.length===45&&!bad.length,all.length+' '+J(bad.slice(0,4)));
  check('1. 男生朋友沒有自己的句子＝旁白「（他答應了。）」（AA_417 原文）',s3.includes('旁白「（他答應了。）」')&&J(INVITE_DATA.sportPlain)===J(['zhe','classmate_bohan','kai','classmate_mingxuan','npc_fangyt']));
  const of=w=>all.filter(x=>x[0]===w).map(x=>x[1]).join('');
  check('1. 子晴：沒有「欸不是」「這不是問句」、不用遊戲講感情（新手教學關、解鎖、存檔）',!/欸不是|這不是問句|新手教學關|解鎖|存檔/.test(of('heroine_04')));
  check('1. 可昕：沒有「假設」、沒有比輸贏、比學校（兩校對抗、你會贏、三比二、客場）',!/假設|兩校|你會贏|三比二|客場|不服氣/.test(of('kexin')));
  check('1. 學姊：沒有「重點是」',!/重點是/.test(of('heroine_05'))); });

await sec(2,()=>{ fresh('2026-03-11','heroine_04',1); const w1=INV.placeWhy(H.G,'heroine_04',P('gym_badminton'));
  check('2. 羽球：不太認識（第 1 階）約不到，寫原因',!!w1&&ask('heroine_04','gym_badminton',15.5).why==='rel',w1);
  fresh('2026-03-11','heroine_04',2); const a=ask('heroine_04','gym_badminton',15.5), b=ask('heroine_04','gym_badminton',10), c=ask('heroine_04','gym_badminton',20.5);
  check('2. 羽球平日：15:30 答應；10:00 沒開（改到同一天 12:00）；20:30 打不完一小時（改天）',a.res==='accept'&&b.res==='resched'&&b.why==='closed'&&b.alt&&b.alt.day===H.G.day&&b.alt.h===12&&c.res==='resched'&&c.why==='closed',J([a.res,b.res,b.alt,c.res]));
  fresh('2026-03-14','heroine_04',2); const d=ask('heroine_04','gym_badminton',10), e=ask('heroine_04','gym_badminton',16.5);
  check('2. 羽球週末（3/14 週六）：10:00 可以、16:30 打不完（17:00 關）',H.G.weekday===6&&d.res==='accept'&&e.res==='resched'&&e.why==='closed',J([d.res,e.res]));
  fresh('2026-03-11','heroine_04',2); const w2=INV.placeWhy(H.G,'heroine_04',P('run_avenue'));
  check('2. 晨跑：有點熟（第 2 階）約不到，寫原因；decide＝rel',w2===INVITE_DATA.why.run&&ask('heroine_04','run_avenue',6.5,H.G.day+1).why==='rel',w2);
  fresh('2026-03-11','heroine_04',3); const T=INV.timeOptions(H.G,false,P('run_avenue')), T2=INV.timeOptions(H.G,true,P('run_avenue'));
  check('2. 晨跑的時間：09:00 時只有「明天 06:30」（今天的過了；也不能「現在一起過去」）',J(T.map(q=>q.t))===J(['明天 06:30'])&&J(T2.map(q=>q.t))===J(['明天 06:30']),J(T.map(q=>q.t)));
  const r1=ask('heroine_04','run_avenue',6.5,H.G.day+1); check('2. 朋友以上約明天 06:30：答應',r1.res==='accept',r1.res+'/'+r1.why);
  fresh('2026-03-11','heroine_04',3,{hour:5}); H.G.weather='rain'; const r2=ask('heroine_04','run_avenue',6.5), r3=ask('heroine_04','run_avenue',6.5,H.G.day+1);
  check('2. 今天下雨：今天 06:30 約不到（decline rain、系統說「下雨了，不能晨跑。」）；明天的照樣可以約（沒有天氣預報）',r2.res==='decline'&&r2.why==='rain'&&INV.reply(H.G,'heroine_04','run_avenue',r2)==='下雨了，不能晨跑。'&&r3.res==='accept',r2.res+'/'+r2.why+' '+r3.res);
  fresh('2026-03-11','heroine_04',3,{hour:5}); H.G.weather='rain'; const t2=INV.timeOptions(H.G,false,P('run_avenue'));
  check('2. 05:00 的時間選項：今天 06:30、明天 06:30',J(t2.map(q=>q.t))===J(['今天 06:30','明天 06:30']));
  fresh('2026-03-11','heroine_04',3,{hour:21}); const iv=INV.accept(H.G,'heroine_04','run_avenue',H.G.day+1,6.5,{by:'player'}); H.G.day+=1; H.G.weekday=(H.G.weekday+1)%7; H.G.hour=6; H.G.weather='rain'; INV.tick(GM);
  check('2. 約好了、那天早上下雨：取消，手機留一則「下雨了，和子晴的晨跑取消。」',iv.state==='cancelled'&&(H.G.msgs||[]).some(m=>/^下雨了，和.+的晨跑取消。$/.test(m.text)),iv.state+' '+J((H.G.msgs||[]).slice(-1)));
  fresh('2026-03-11','heroine_04',3,{hour:21}); const iv2=INV.accept(H.G,'heroine_04','run_avenue',H.G.day+1,6.5,{by:'player'}); H.G.day+=1; H.G.weekday=(H.G.weekday+1)%7; H.G.hour=6.3; H.G.weather='clear'; INV.tick(GM); const en=INV.entryFor(H.G,'heroine_04');
  const gt=INV.goTarget(H.G,iv2); check('2. 「直接過去」落在椰林大道・傅鐘（不是校園第一個落點霖澤館前）',gt.zone==='campus'&&!!gt.spawn&&gt.spawn.x===-38&&gt.spawn.z===6,J(gt));
  check('2. 沒下雨：照約，06:15 起她在椰林大道傅鐘前等（作息 linger、meetAt）',iv2.state==='accepted'&&!!en&&en.zone==='campus'&&en.act==='linger'&&J(en.at)===J(P('run_avenue').meetAt),J(en)); });

await sec(3,()=>{ fresh('2026-03-11','heroine_04',2); const a=ask('heroine_04','gym_badminton',15.5);
  check('3. 子晴有點熟約羽球：A「羽球？……我很爛喔。先說好。」',txt(a.lines)==='「羽球？……我很爛喔。先說好。」',txt(a.lines));
  fresh('2026-03-11','heroine_04',3); const b=ask('heroine_04','gym_badminton',15.5), b2=ask('heroine_04','gym_badminton',17.5), c=ask('heroine_04','run_avenue',6.5,H.G.day+1);
  check('3. 子晴朋友：羽球 R「好。我很爛。你不要教我，讓我自己爛。」（再約一次也是這句，§3 優先於 AA_415）；晨跑 R「早上我在睡。……好啦，一次。」',txt(b.lines)==='「好。我很爛。你不要教我，讓我自己爛。」'&&txt(b2.lines)===txt(b.lines)&&txt(c.lines)==='「早上我在睡。……好啦，一次。」',[txt(b.lines),txt(b2.lines),txt(c.lines)].join(' / '));
  check('3. AA_415 的表沒有被拿來用（這幾句不在 INVITE_REPLIES）',!INVITE_REPLIES.people.heroine_04.some(r=>J(r.lines)===J(b.lines)||J(r.lines)===J(c.lines)));
  fresh('2026-03-11','kexin','d'); const k1=ask('kexin','gym_badminton',15.5), k2=ask('kexin','run_avenue',6.5,H.G.day+1);
  check('3. 可昕交往中（政大那幾年）：羽球「好。我從山上下來。拍子你負責借。」、晨跑「椰林大道？從政大過去要四十分鐘。」「……好。你敢遲到試試看。」',txt(k1.lines)==='「好。我從山上下來。拍子你負責借。」'&&txt(k2.lines)==='「椰林大道？從政大過去要四十分鐘。」「……好。你敢遲到試試看。」',txt(k1.lines)+' / '+txt(k2.lines));
  fresh('2025-03-12','kexin',2,{econ:true}); const k3=INV.personal(H.G,'kexin',P('gym_badminton'),H.G.day,15.5,{res:'accept'});
  check('3. 可昕經濟系那一年：不說政大那幾年的句子',!/政大|台大的球場|山上/.test(txt(k3.lines)),txt(k3.lines));
  const W={heroine_01:['「羽球？好。我國中是校隊。……替補。」','「六點半？……好。我本來就六點起床。」'],heroine_03:['「……我不太會。」「好。你不要笑。」','「早上我要幫阿姨備料。……七點半以前可以。」'],
    heroine_02:['「羽球！好啊，我手腕很好。拉花練的。」','「早上？……我昨天上到兩點。」「……好啦。我去。」'],heroine_05:['「羽球。好。……我只會發球。」','「晨跑。好。跑完我直接去研究室。」'],classmate_peishan:['「好啊！！我要問你，你為什麼會打。」','「好啊！早上我很習慣，在家的時候四點半就要起來幫忙開店。」']};
  for(const id in W){ fresh('2026-03-11',id,3); const x=ask(id,'gym_badminton',15.5), y=ask(id,'run_avenue',6.5,H.G.day+1);
    check('3. '+id+'：羽球、晨跑照 §3-3',txt(x.lines)===W[id][0]&&txt(y.lines)===W[id][1],x.res+' '+txt(x.lines)+' / '+y.res+' '+txt(y.lines)); }
  for(const id of ['zhe','kai','classmate_mingxuan','npc_fangyt']){ fresh('2026-03-11',id,3); const x=ask(id,'gym_badminton',15.5), y=ask(id,'run_avenue',6.5,H.G.day+1);
    check('3. '+id+'：羽球、晨跑＝旁白「（他答應了。）」',x.res==='accept'&&txt(x.lines)==='（他答應了。）'&&y.res==='accept'&&txt(y.lines)==='（他答應了。）',x.res+' '+txt(x.lines)+' / '+y.res+' '+txt(y.lines)); }
  fresh('2026-03-11','classmate_bohan',3); const bh=ask('classmate_bohan','gym_badminton',15.5);
  check('3. 柏翰：個人規則照舊先跑（「我要念書。」）',/我要念書/.test(txt(bh.lines)),bh.res+' '+txt(bh.lines)); });

await sec(4,async()=>{ fresh('2026-03-11','heroine_04',3); const m1=await meet('heroine_04','gym_badminton',15.5), m2=await meet('heroine_04','gym_badminton',16.5), m3=await meet('heroine_04','gym_badminton',17.5), m4=await meet('heroine_04','gym_badminton',18.5);
  const FA=['（她借了一支拍子，握的方向是反的。）','「這樣握比較帥。……不是嗎？」'], END='「下次我會進步。……我不想輸給一顆球。」';
  const i0=m1.indexOf(FA[0]);
  check('4. 子晴第一次打羽球：先說 first（借拍子、握反）、再「一起的時候」①、最後一句是「結束」',i0>=0&&m1[i0+1]===FA[1]&&m1.indexOf(ZQ_B[0][0])>i0&&m1[m1.length-1]===END,J(m1));
  check('4. 第二、三、四次：沒有 first；一起的時候 ② → ③ → ①（輪流、不連續重複）',!m2.includes(FA[0])&&!m3.includes(FA[0])&&!m4.includes(FA[0])&&m2.includes(ZQ_B[1][0])&&m3.includes(ZQ_B[2][0])&&m4.includes(ZQ_B[0][0])&&m2[m2.length-1]===END,J([m2,m3,m4].map(m=>m.filter(t=>/^「/.test(t)))));
  check('4. 沒有一般的「你和子晴在……」旁白',!m1.some(t=>/^你和.+在/.test(t)));
  fresh('2026-03-11','kexin','d',{hour:6}); const k1=await meet('kexin','run_avenue',6.5), k2=await meet('kexin','run_avenue',6.5);
  check('4. 可昕晨跑：第一次「六點二十五分。我先到了。」只有一次；一起的時候 ① → ②；結束「早餐我知道一家。走。」',k1.includes('「六點二十五分。我先到了。」')&&!k2.includes('「六點二十五分。我先到了。」')&&k1.includes(KX_R[0][0])&&k2.includes(KX_R[1][0])&&k1[k1.length-1]==='「早餐我知道一家。走。」',J(k1)+' | '+J(k2));
  fresh('2026-03-11','heroine_01',3); const a1=await meet('heroine_01','gym_badminton',15.5), a2=await meet('heroine_01','run_avenue',6.5);
  check('4. 以安：共用旁白（羽球「（你們打了一個小時。……）」、結束「（打完，你們坐在場邊喝水……）」；晨跑「（椰林大道上只有你們……）」「（跑完一圈……傅鐘……）」）',
    a1.includes('（你們打了一個小時。球場的燈很亮，地板吱吱響。）')&&a1[a1.length-1]==='（打完，你們坐在場邊喝水，誰都不想先站起來。）'&&a2.includes('（椰林大道上只有你們和幾個跑步的人。椰子樹的影子很長。）')&&a2[a2.length-1]==='（跑完一圈，你們在傅鐘前面停下來喘氣。）',J(a1)+' | '+J(a2));
  fresh('2026-03-11','zhe',3); const z1=await meet('zhe','gym_badminton',15.5);
  check('4. 阿哲：一樣是共用旁白',z1.includes('（你們打了一個小時。球場的燈很亮，地板吱吱響。）'),J(z1));
  check('4. 記憶：一起打羽球、一起晨跑',SOCIAL.has('zhe','SPORT_BADMINTON')||SOCIAL.memories('zhe').some(m=>m.tag==='SPORT_BADMINTON')); });

await sec(5,async()=>{ const run=async(id,s)=>{ fresh('2026-03-11',id,s); const r0=Object.assign({},SOCIAL.rel(id)); const f0=((H.G.daily||{}).gym||{}).fit|0; await meet(id,'gym_badminton',15.5); const r1=SOCIAL.rel(id); return {comf:r1.comf-r0.comf,npcRom:(r1.npcRom||0)-(r0.npcRom||0),fam:r1.fam-r0.fam,fit:(H.G.daily.gym.fit|0)-f0}; };
  const zq=await run('heroine_04',3), an=await run('heroine_01',3);
  check('5. 子晴打羽球：比以安多自在 +3、她的戀愛 +3（AA_126 6-3）；一般的熟悉照 AA_124 一起運動',zq.comf-an.comf===3&&zq.npcRom-an.npcRom===3&&zq.fam===an.fam&&an.fam===SOCIAL.ACT.sport.fam,J({zq,an}));
  fresh('2026-03-11','heroine_04',3); await meet('heroine_04','gym_badminton',15.5); const n1=SOCIAL.rel('heroine_04').npcRom; await meet('heroine_04','gym_badminton',17.5);
  check('5. 同一天第二次：戀愛不再加（一天一次）',SOCIAL.rel('heroine_04').npcRom===n1,n1+'→'+SOCIAL.rel('heroine_04').npcRom);
  fresh('2026-03-11','kexin','d',{hour:6}); const k0=SOCIAL.rel('kexin').npcRom||0; await meet('kexin','run_avenue',6.5);
  check('5. 可昕晨跑（交往中也一樣）：她的戀愛 +3（可昕不吃校園單獨約的 +1）',(SOCIAL.rel('kexin').npcRom||0)-k0===3,(SOCIAL.rel('kexin').npcRom||0)-k0);
  check('5. 羽球算體能 +1（和自己打羽球一樣）',zq.fit===1&&an.fit===1,J([zq.fit,an.fit]));
  fresh('2026-03-11','heroine_01',3); for(const hh of [13,14.5,16]) await meet('heroine_01','gym_badminton',hh); const g=H.G.daily.gym;
  check('5. 一週最多算 2 次（和 gym3d.js 的打羽球共用）',g.fit===2&&g.wkN===2,J(g));
  fresh('2026-03-11','heroine_01',3,{hour:6}); await meet('heroine_01','run_avenue',6.5); check('5. 晨跑不加體能（AA_126 6-1 沒有列）',!(H.G.daily.gym&&H.G.daily.gym.fit)); });

await sec(6,()=>{ fresh('2025-12-10','heroine_05',3); const s1=ask('heroine_05','gym_badminton',15.5), s2=ask('heroine_05','run_avenue',6.5,H.G.day+1);
  check('6. 學姊筆試前（上限的那幾週）：羽球、晨跑照現有 rule 的婉拒',s1.res==='decline'&&s1.why==='exam'&&SISG.DECLINE.includes(txt(s1.lines))&&s2.res==='decline'&&SISG.DECLINE.includes(txt(s2.lines)),txt(s1.lines)+' / '+txt(s2.lines));
  fresh('2026-03-11','heroine_05',3); const s3=ask('heroine_05','gym_badminton',15.5); check('6. 筆試以後：照 §3-3 答應',txt(s3.lines)==='「羽球。好。……我只會發球。」',txt(s3.lines));
  fresh('2027-03-10','classmate_peishan',3); const p1=ask('classmate_peishan','gym_badminton',15.5);
  check('6. 沛珊大二下（重考、聯絡不到）：照舊約不到',p1.res==='decline'&&p1.why==='away',p1.res+'/'+p1.why); });

await sec(7,async()=>{ fresh('2026-03-11','heroine_04',3); H.said=[]; H.opts=[]; H.picks=['運動','去椰林大道晨跑','明天 06:30'];   /* INVITE-MENU-1030：清單分層，晨跑在「運動…」裡；時間多「其他日子…」*/
  const iv=await INV.flow(GM,'heroine_04',null,false); const said=H.said.map(s=>s.t);
  check('7. 手機約子晴晨跑：時間只列「明天 06:30」（＋其他日子…）、念 §3 的答應句、約在明天 06:30',!!iv&&iv.place==='run_avenue'&&iv.h===6.5&&iv.day===H.G.day+1&&J(H.opts[2])===J(['明天 06:30','其他日子…','算了'])&&said.includes('「早上我在睡。……好啦，一次。」'),J(H.opts)+' '+J(said));
  fresh('2026-03-11','kexin','d'); H.said=[]; H.opts=[]; H.picks=['運動','返回','算了']; await INV.flow(GM,'kexin',null,false);
  check('7. 可昕交往中（手機）：「運動…」有羽球、晨跑（她下山來）；台大的其他地點照現有台詞也開了（INVITE-MENU-1030 D，tests/invite_menu_unit.js）',J(H.opts[1])===J(['去新體育館打羽球','去椰林大道晨跑','返回'])&&(H.opts[0]||[]).includes('坐坐・喝茶…'),J(H.opts.slice(0,2))); });

H.done();
})();
