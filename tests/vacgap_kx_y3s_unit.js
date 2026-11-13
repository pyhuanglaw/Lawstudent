// 假期空白（BB198-VACB22）第四批：AA_930 可昕大三暑假——跟她人在哪裡無關的手機那幾則（交往中）。
// 用法：node tests/vacgap_kx_y3s_unit.js
// 檢查：實習三則（7/6、7/27、8/24 21:00，兩個按鈕、回覆開到隔天 18:00、她回的照稿）、回家的晚上（6/19 起每晚 22:00，七句不重複）、8/30 開始讀國考（KX_PLAN_Y3S）；
//       沒交往＝都沒有。第五批（AA_935 ①）：presence 6/19～7/1 在高雄、其他在臺北；開車旅行（TW／US／JP 的日子、答應／不行／不回）、日本路線河堤重逢、週二四白天約她的回覆；七夕還沒有（交 AA）。
// 修改前（dd63a41a10）：全部 FAIL。
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const loadG=f=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
let loadErr=''; for(const f of ['src/data/vacgap_lines.js','src/vacgap3d.js']){ try{ loadG(f); }catch(e){ loadErr+=f+'：'+(e&&e.message||e)+'　'; } }
check('0. 載得到',!loadErr,loadErr);
const X=VACGAP_LINES.kxY3S, D=H.D, T=(d,h)=>d*24+h, K=d=>CALENDAR.dateOf(d).key, wd=d=>CALENDAR.dateOf(d).wd%7;
const set=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); };
let LOG={};
const runTo=(key,h,step)=>{ step=step||1; const t1=T(D(key),h); let t=T(H.G.day,H.G.hour); while(t<t1-1e-9){ t=Math.min(t1,t+step); const d=Math.floor(t/24); set(d,t-d*24); STORY.phoneRules(GM); PHONE.tick(H.G); for(const m of H.G.msgs||[]) if(m.tag){ const A=LOG[m.tag]||(LOG[m.tag]=[]); if(!A.includes(m)) A.push(m); } } };
const got=tag=>LOG[tag]||[], when=tag=>{ const m=got(tag)[0]; return m?K(m.day)+' '+m.h:null; };
const start=(dating)=>{ H.fresh('2028-06-15',8,'dorm',{KX_MET:true}); LOG={}; H.FAMILIAR('kexin'); H.G.contacts={kexin:1}; if(dating) H.G.flags.dating_kexin=true; };
start(true); runTo('2028-09-01',12,3);
check('1. 實習三則：7/6、7/27、8/24 21:00，字照 AA_930 第 1 節',J([1,2,3].map(i=>when('msg_kx_intern_y3s_'+i)))===J(['2028-07-06 21','2028-07-27 21','2028-08-24 21'])&&J(got('msg_kx_intern_y3s_1').map(m=>m.text))===J(X.intern[0].ms));
{ const m=got('msg_kx_intern_y3s_2').slice(-1)[0]; check('2. 兩個按鈕、回覆開到隔天 18:00、她回的照稿',m&&m.ask&&J(m.ask.opts.map(o=>o.t))===J(['短一點比較好懂。','改到最後剩什麼？'])&&m.ask.until===T(D('2028-07-28'),18)&&m.ask.opts[1].say[0].text==='剩一句。那一句是對的'); }
{ const tags=[1,2,3,4,5,6,7].map(i=>'msg_kx_home_y3s_night_'+i); check('3. 回家的晚上：6/19～6/25 每晚 22:00 一則、七句不重複',J(tags.map(when))===J([19,20,21,22,23,24,25].map(d=>'2028-06-'+d+' 22'))&&J(tags.map(t=>got(t)[0].text))===J(X.home)&&!got('msg_kx_home_y3s_night_8').length,J(tags.map(when))); }
check('4. 8/30 21:00 開始讀國考、記 KX_PLAN_Y3S',when('msg_kx_plan_y3s')==='2028-08-30 21'&&H.G.flags.KX_PLAN_Y3S===true);
start(false); runTo('2028-09-01',12,6);
check('5. 沒交往＝都沒有',!Object.keys(LOG).some(t=>/^msg_kx_(intern|home_y3s_night|plan)/.test(t))&&!H.G.flags.KX_PLAN_Y3S);
// ===== 第五批（AA_935 ①）：presence 6/19～7/1 在高雄、其他在臺北；開車旅行、日本路線重逢、週二四實習的回覆 =====
{ const k=key=>STORY.presence('kexin',Object.assign({},H.G,{day:D(key)})); const s=x=>x.here?'臺北':x.kind;
  const P=['2028-06-08','2028-06-12','2028-06-18','2028-06-19','2028-07-01','2028-07-02','2028-07-20','2028-08-31','2028-09-01'].map(x=>x+' '+s(k(x)));
  check('6. presence：學期末時段到 6/18 在臺北、6/19～7/1 在高雄、7/2 起整個暑假在臺北（AA_935 ①；原本 6/12～9/1 都在高雄）',J(P)===J(['2028-06-08 臺北','2028-06-12 臺北','2028-06-18 臺北','2028-06-19 home','2028-07-01 home','2028-07-02 臺北','2028-07-20 臺北','2028-08-31 臺北','2028-09-01 臺北']),P.join('、'));
  const Q=['2027-06-20','2027-08-20','2029-01-20'].map(x=>x+' '+s(k(x)));
  check('6b. 別的寒暑假照舊（大二暑假、大四寒假都在高雄）',J(Q)===J(['2027-06-20 home','2027-08-20 home','2029-01-20 home']),Q.join('、')); }
check('7. 七夕 ev_kexin_qixi_y3 還沒有（本體的場景稿上沒有，交 AA）；開車旅行、重逢在 STORY_EVENTS',!STORY_EVENTS.some(e=>e.id==='ev_kexin_qixi_y3')&&['ev_kexin_trip_summer_y3','ev_kexin_reunion_jp'].every(id=>STORY_EVENTS.some(e=>e.id===id)));
const ev=id=>STORY_EVENTS.find(e=>e.id===id), said=()=>H.said.map(x=>x.t), TL=X.trip;
const runTrip=async(route,ans)=>{ start(true); if(route) H.G.flags.EXCHANGE_ROUTE=route; runTo(route==='JP'?'2028-08-09':'2028-07-12',8,3);
  const m=got('msg_kx_trip_y3s').slice(-1)[0]; if(m&&m.ask&&ans!=null){ const o=m.ask.opts[ans]; for(const k in (o.set||{})) H.G.flags[k]=o.set[k]; m.ans=ans; }
  runTo(route==='JP'?'2028-08-11':'2028-07-14',22,3); return m; };
(async()=>{
  { const m=await runTrip('TW',0);
    check('8. TW：7/11 21:00 她傳「禮拜六開車出去兩天？」兩則、兩個按鈕（回覆開到 7/14 21:00）',when('msg_kx_trip_y3s')==='2028-07-11 21'&&J(got('msg_kx_trip_y3s').map(x=>x.text))===J(TL.ask)&&m&&J(m.ask.opts.map(o=>o.t))===J(['好。','那兩天不行。'])&&m.ask.until===T(D('2028-07-14'),21)&&m.ask.opts[0].say[0].text==='八點，宿舍樓下。');
    const q=OUT.get(H.G,'kx_trip_y3s');
    check('9. 「好。」＝排 7/15 08:00 女生宿舍樓下出發的開車旅行',!!q&&q.day===D('2028-07-15')&&q.h===8&&q.ev==='ev_kexin_trip_summer_y3'&&q.place==='女生宿舍樓下',q&&J({d:K(q.day),h:q.h}));
    H.G.day=D('2028-07-15'); H.G.hour=8; H.G.weekday=wd(H.G.day); H.said=[]; H.picks=['「妳會的。」']; await EVENTS.run(ev('ev_kexin_trip_summer_y3'));
    const want=TL.road.concat(TL.roadOpts[0].say,TL.night,TL.back).map(x=>x.n||x.s);
    check('10. 演出來的字＝AA_930 第 3 節（路上、選「妳會的。」、旅館雙床房、回程那句）；過了一晚，回程在 7/16',J(said())===J(want)&&H.G.day===D('2028-07-16')&&H.G.flags.KX_TRIP.Y3SUM==='trip',J(said().slice(-3))+' '+K(H.G.day)); }
  { await runTrip('US',1); check('11. US（8/2 才出發）：同樣 7/11；「那兩天不行。」＝不排、KX_TRIP.Y3SUM missed',when('msg_kx_trip_y3s')==='2028-07-11 21'&&!OUT.get(H.G,'kx_trip_y3s')&&H.G.flags.KX_TRIP.Y3SUM==='missed'); }
  { await runTrip('TW',null); runTo('2028-07-16',8,3); check('12. 一直不回＝當作不行（missed），不排',!OUT.get(H.G,'kx_trip_y3s')&&H.G.flags.KX_TRIP.Y3SUM==='missed'); }
  { start(true); H.G.flags.EXCHANGE_ROUTE='JP'; runTo('2028-08-07',8,6);
    check('13. JP：7/11 沒有（人在日本）；8/6 16:30 河堤重逢排進行程',!got('msg_kx_trip_y3s').length&&!!OUT.get(H.G,'kx_reunion_jp')&&OUT.get(H.G,'kx_reunion_jp').day===D('2028-08-06')&&OUT.get(H.G,'kx_reunion_jp').h===16.5);
    runTo('2028-08-09',8,3); check('14. JP：開車旅行的訊息 8/8 21:00',when('msg_kx_trip_y3s')==='2028-08-08 21');
    H.said=[]; H.picks=['「我很想妳。」']; await EVENTS.run(ev('ev_kexin_reunion_jp'));
    const R=X.reunionJp, want=R.pre.concat(R.opts[1].say,R.end).map(x=>x.n||x.s);
    check('15. 重逢演出來的字＝AA_930 第 4 節、記 KX_REUNION_JP',J(said())===J(want)&&H.G.flags.KX_REUNION_JP===true,J(said())); }
  { start(true); runTo('2028-08-07',8,6); check('16. TW 路線沒有河堤重逢',!OUT.get(H.G,'kx_reunion_jp')); }
  { start(false); H.G.flags.EXCHANGE_ROUTE='JP'; runTo('2028-08-10',8,6); check('17. 沒交往：開車旅行、重逢都沒有',!got('msg_kx_trip_y3s').length&&!OUT.get(H.G,'kx_reunion_jp')); }
  // 週二、四白天約她
  { start(true); const P=INV.place('noodle')||INVITE_DATA.places[0], tue=D('2028-07-11'), wed=D('2028-07-12'), sat=D('2028-07-15'), jun=D('2028-06-27');
    const r1=INV.personal(H.G,'kexin',P,tue,12.17,INV.decide(H.G,'kexin',P.id,tue,12.17)), r2=INV.personal(H.G,'kexin',P,D('2028-07-13'),14,INV.decide(H.G,'kexin',P.id,D('2028-07-13'),14));
    check('18. 7/11（二）中午、7/13（四）下午約她＝改到五點以後，兩句輪流（AA_930 第 1 節）',r1.res==='resched'&&J(r1.lines)===J([X.internAsk[0]])&&r2.res==='resched'&&J(r2.lines)===J([X.internAsk[1]])&&!!r1.alt&&r1.alt.h>=17,J([r1.res,r1.lines,r1.alt,r2.lines]));
    const r3=INV.personal(H.G,'kexin',P,tue,19,INV.decide(H.G,'kexin',P.id,tue,19)), r4=INV.personal(H.G,'kexin',P,wed,12.17,INV.decide(H.G,'kexin',P.id,wed,12.17)), r5=INV.personal(H.G,'kexin',P,sat,12.17,INV.decide(H.G,'kexin',P.id,sat,12.17));
    const r6=INV.personal(H.G,'kexin',P,D('2028-09-05'),12.17,INV.decide(H.G,'kexin',P.id,D('2028-09-05'),12.17));
    check('19. 週二晚上、週三、週六、9/5（實習結束）不套實習那兩句',[r3,r4,r5,r6].every(r=>!(r.lines||[]).some(t=>X.internAsk.includes(t))),J([r3,r4,r5,r6].map(r=>[r.res,r.lines]))); }
  H.done(); })();
