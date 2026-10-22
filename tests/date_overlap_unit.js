// 已經約好的校外約會那段時間，別的排程也要看（BUG-DATE-OVERLAP-1021）：每一種照它自己現成的「撞期」做法——
//   校園邀約（INV.decide：「你那個時間已經約了別人」＋改天的時間 INV.nextFree 跳過約會）、對方約你（INV.answer：答應不了）、
//   去她的縣市（HV.days 跳過那幾天）、畢業後每月一格（PGDATE.busyDays：兩天一夜的第二天也算）、寒暑假報名（VAC.conflicts：寫出來、不擋）、118 巷週一午餐（那週不揪）。
//   劇情固定的出遊（story3d、group3d、r2y*… 的 OUT.plan）照舊優先、不改（第 7 項）。不需要瀏覽器。用法：node tests/date_overlap_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H;
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|PG_DATES|PGDATE|HOMETOWN_LINES|HV|L118|LANE118_LAYOUT|LANE118_SHOPS|NEEDED_MSGS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.CG_REGISTRY={};
for(const f of ['src/data/needed_msgs.js','src/data/hometown_lines.js','src/hometown3d.js','src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/data/pg_dates.js','src/pgdates3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
const J=x=>JSON.stringify(x), G=()=>H.G, DK=k=>PG.DK(k);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const S6={fam:60,trust:45,comf:40,npcRom:55,rom:30};
const sec=(n,f)=>{ try{ f(); }catch(e){ check(n+'（例外）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const at=(day,h)=>{ G().day=day; G().weekday=wdOf(day); G().hour=h; };
const span=t=>[t.day*24+t.depart,(t.day+(t.kind==='overnight'?1:0))*24+t.back];
const inside=(t,day,h,stay)=>{ const [x,y]=span(t), a=day*24+h, b=a+(stay||0); return a<y&&x<b; };
const raw=(o)=>{ G().trips=G().trips||[]; const t=Object.assign({trip:'T'+String(G().trips.length+1).padStart(4,'0'),who:'heroine_03',locs:['D13'],depart:15,back:19.3,kind:'half',transport:'mrt',fare:100,fareV:2,by:'player',status:'booked',spots:[],departed:false,moves:0},o); G().trips.push(t); return t; };   /* 測試直接放進去的行程（不排出遊）*/
const sat=STORY.termDay('Y1S2',5,6);   // 2026-03-28（六）
// ===== 1. 校園邀約：撞到約會那段時間＝「你那個時間已經約了別人」，改天的時間跳過約會 =====
sec('1',()=>{ H.fresh('2026-03-26',20); for(const id of ['heroine_01','heroine_03']) Object.assign(SOCIAL.rel(id),S6); SOCIAL.remember('heroine_01','FIRST_MET',''); G().contacts.heroine_01=1;
  const t=DATE.book(G(),{who:'heroine_03',locs:['D13'],day:sat,depart:15,transport:'mrt'}); const P=INV.place('cafe');
  const r=INV.decide(G(),'heroine_01','cafe',sat,16), base=INV.decide(G(),'heroine_01','cafe',sat+1,16);
  check('1. 約會那段時間（3/28 15:00～19:20 淡水）約以安 16:00 Café：改天（why mine＝你那個時間已經約了別人），改的時間不在約會那段',r.res==='resched'&&r.why==='mine'&&!!r.alt&&!inside(t,r.alt.day,r.alt.h,P.stay),J({r,base}));
  check('1. 理由的字照現成的那句：「你那個時間已經約了別人。改成 …？」',/^你那個時間已經約了別人。/.test(INV.reply(G(),'heroine_01','cafe',r)),INV.reply(G(),'heroine_01','cafe',r));
  const nf=INV.nextFree(G(),'heroine_01',P,sat,14.5); check('1. 改天的時間（INV.nextFree，從 14:30 起找）跳過約會那段',!!nf&&!inside(t,nf.day,nf.h,P.stay),J(nf));
  DATE.trip(G(),t.trip).status='cancelled'; const r2=INV.decide(G(),'heroine_01','cafe',sat,16);
  check('1. 約會取消了：同一個時間不再因為約會改天',!(r2.res==='resched'&&r2.why==='mine'),J(r2)); });
// ===== 2. 兩天一夜：兩天都算 =====
sec('2',()=>{ H.fresh('2026-03-26',20,'dorm',{dating_heroine_03:true}); Object.assign(SOCIAL.rel('heroine_01'),S6); SOCIAL.remember('heroine_01','FIRST_MET','');
  const t=DATE.book(G(),{who:'heroine_03',locs:['D28'],day:sat,depart:9,kind:'overnight',transport:'hsr'}); const P=INV.place('cafe');
  const r=INV.decide(G(),'heroine_01','cafe',sat+1,14);
  check('2. 兩天一夜（3/28～3/29 臺南）的第二天 14:00 約以安：改天、改的時間在 21:15 回來以後或之後的日子',!!t.ok&&r.res==='resched'&&r.why==='mine'&&!!r.alt&&!inside(t,r.alt.day,r.alt.h,P.stay),J({t:[t.day,t.back],r}));
  check('2. DATE.tripAt／tripOn：第一天晚上、第二天中午都撞；第三天沒有',!!DATE.tripAt(G(),sat,22,1)&&!!DATE.tripAt(G(),sat+1,12,1)&&!!DATE.tripOn(G(),sat+1)&&!DATE.tripOn(G(),sat+2)&&J([...DATE.tripDays(G())])===J([sat,sat+1])); });
// ===== 3. 對方約你（INV.offer → INV.answer）：約會那段時間答應不了，照現成的「那個時間你已經約了別人。」=====
sec('3',()=>{ H.fresh('2026-03-26',20); Object.assign(SOCIAL.rel('heroine_03'),S6); DATE.book(G(),{who:'heroine_03',locs:['D13'],day:sat,depart:15,transport:'mrt'});
  const iv=INV.offer(G(),'heroine_01','library',sat,16,'週六四點總圖？'), r=INV.answer(G(),iv.id,'yes');
  const iv2=INV.offer(G(),'heroine_01','library',sat,10,'週六十點總圖？'), r2=INV.answer(G(),iv2.id,'yes');
  check('3. 以安約你週六 16:00 總圖（撞到 15:00 的淡水）：答應不了（mine）、這一則還在（可以改天或不了）',!!r&&r.res==='mine'&&iv.state==='offered'&&(G().msgs||[]).some(m=>m.text==='那個時間你已經約了別人。'),J({r,st:iv.state}));
  check('3. 對照：同一天 10:00（約會以前）照樣答應得了',!!r2&&r2.res==='accept'&&iv2.state==='accepted',J(r2)); });
// ===== 4. 去她的縣市（HV）：約會那幾天不列；她在的那幾天都撞到＝寫原因 =====
sec('4',()=>{ H.fresh('2026-07-10',20); const id='classmate_peishan'; Object.assign(SOCIAL.rel(id),S6); SOCIAL.remember(id,'FIRST_MET',''); G().contacts[id]=1;
  const D0=HV.days(G(),id); raw({day:DK('2026-07-11')}); raw({day:DK('2026-07-12'),kind:'overnight',nights:1,depart:9,back:21.25,locs:['D28']});
  const D1=HV.days(G(),id);
  check('4. 沛珊暑假在台中：本來可以去的日子 '+J(D0.map(d=>CALENDAR.dateOf(d).key))+'；7/11 一日、7/12～7/13 兩天一夜約了校外約會以後，這三天不列',D0.length>0&&D0.includes(DK('2026-07-11'))&&!D1.includes(DK('2026-07-11'))&&!D1.includes(DK('2026-07-12'))&&!D1.includes(DK('2026-07-13'))&&D1.length>0,J(D1.map(d=>CALENDAR.dateOf(d).key)));
  for(let k=14;k<=17;k++) raw({day:DK('2026-07-'+k)}); const o=HV.offer(G(),id);
  check('4. 她在的那一週每天都約了校外約會：「我去台中找妳？」灰掉、寫「那幾天你已經約了校外約會」',!!o&&o.ok===false&&o.why==='那幾天你已經約了校外約會',J(o)); });
// ===== 5. 畢業後每月一格（PGDATE.busyDays）：兩天一夜的第二天也算撞到 =====
sec('5',()=>{ if(typeof PGDATE==='undefined'||!PGDATE.busyDays){ check('5. 載入 pgdates3d.js',false); return; }
  H.fresh('2029-07-01',10,'dorm',{dating_heroine_01:true}); const d=DK('2029-07-14');
  const t=DATE.book(G(),{who:'heroine_01',locs:['D28'],day:d,depart:9,kind:'overnight',transport:'hsr'}); const B=PGDATE.busyDays(G(),d-3,d+3);
  check('5. 7/14～7/15 兩天一夜：busyDays 有 7/14（出遊那一天）也有 7/15（第二天）',!!t.ok&&B.has(d)&&B.has(d+1)&&!B.has(d+2),J([...B].map(x=>CALENDAR.dateOf(x).key))); });
// ===== 6. 寒暑假報名（VAC.conflicts）：撞到的校外約會寫出來、不擋 =====
sec('6',()=>{ H.fresh('2026-06-20',10); const I=VAC.all().find(I=>VAC.daysOf(I).length>=2&&I.from>G().day); if(!I){ check('6. 找得到一個寒暑假活動',false); return; }
  const d=VAC.daysOf(I)[1], t=raw({day:d}); const C=VAC.conflicts(G(),I), c=C.find(x=>x.key==='date_'+t.trip);
  check('6. 「'+I.A.title+'」報名畫面：寫出會撞到「和…去淡水金色水岸」那一天（AA_199 3-2：寫出來、不擋）',!!c&&c.day===d&&/^和.*去淡水金色水岸$/.test(c.title),J(C));
  t.status='cancelled'; check('6. 約會取消以後就不寫',!VAC.conflicts(G(),I).some(x=>x.key==='date_'+t.trip)); });
// ===== 7. 劇情固定的出遊照舊（OUT.plan 不看約會；約會那邊預約時本來就避開排好的出遊）=====
sec('7',()=>{ H.fresh('2026-03-26',20); Object.assign(SOCIAL.rel('heroine_03'),S6); DATE.book(G(),{who:'heroine_03',locs:['D13'],day:sat,depart:15,transport:'mrt'});
  const ok=OUT.plan(G(),{id:'test_story',ev:'ev_test_story',day:sat,h:16,place:'公館',title:'劇情的出遊（測試）'});
  check('7. 劇情固定的出遊排在約會那段時間：照樣排進去（不擋、不挪，劇情優先）',ok===true&&!!OUT.get(G(),'test_story')&&OUT.get(G(),'test_story').state==='planned');
  const c=DATE.check(G(),{who:'heroine_03',locs:['D01'],day:sat+7,depart:13,transport:'mrt'}); OUT.plan(G(),{id:'test_story2',ev:'ev_x',day:sat+7,h:14,place:'公館',title:'劇情（測試）'});
  const c2=DATE.check(G(),{who:'heroine_03',locs:['D01'],day:sat+7,depart:13,transport:'mrt'});
  check('7. 反過來：已經排好的出遊，約會預約時避開（DATE.check 原本就有）',c.ok&&!c2.ok&&/有別的行程/.test(c2.why),J([c.why,c2.why])); });
// ===== 8. 118 巷週一午餐（阿哲 12:00 揪、12:15 出遊）：12:15 那段時間約了校外約會＝那週不揪 =====
(async()=>{
  const run=(h0,h1)=>{ for(let h=h0;h<=h1+1e-9;h+=0.05){ G().hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G()); } };
  const law=(k,h)=>{ H.fresh(k,h,{}); G().stage='law'; PHONE.join(G(),'noodle_team','麵店團'); SOCIAL.remember('zhe','FIRST_MET',''); SOCIAL.remember('yu','FIRST_MET',''); };
  try{ law('2025-09-08',11.9); raw({day:G().day,depart:12,back:16,locs:['D01']}); run(11.95,12.2);
    const sent=PHONE.sent(G(),'l118_lunch_'+G().day);
    law('2025-09-08',11.9); run(11.95,12.2); const sent0=PHONE.sent(G(),'l118_lunch_'+G().day);
    check('8. 週一 12:00：那天 12:00～16:00 約了校外約會＝阿哲不揪（第一次那則順延，L118_FIRST_SENT 還是 false）；對照：沒有約會照常揪',!sent&&sent0,J({sent,sent0})); }
  catch(e){ check('8（例外）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); }
  console.log(H.fails?'\nFAILED '+H.fails:'\nALL PASS'); process.exit(H.fails?1:0);
})();
