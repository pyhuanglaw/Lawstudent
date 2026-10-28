// 霖澤館 5F 研究室的劇情接線（CLOSED-SPACES-1023；AA_399 第 1 節）——不需要瀏覽器。
//   0  src/lab5f3d.js 載得到、index.html 有接；學姊的作息有研究室那一筆（spot sis_desk）；OUT.STAGE、OUT.bg 包好
//   1  她在研究室的時段：碩一～碩三週一～週四 12:20～14:00；美國（2028-08-02～12-23）、週五、碩一以前、碩三以後不在
//   2  4F 刷卡門：她在＋有聯絡方式＋見過她＝「傳訊息給學姊」，兩分鐘後她開門（有點熟／朋友以上／交往中三句），進 5F；一天一次；其他時候只有門上那一句
//   3  14:00：她說「我要去總圖了。」（大三起「我要去法圖了。」、2028-02 起研究小間的日子「我去研究小間了。」，AA_437），祐廷回到 4F 樓梯間
//   4  出遊換到 5F 演：研究室走廊那幾場畫面是模糊的 3D（ADV blur、底圖 linze_prof_hall 不出），燈照 AA_399（聖誕夜只開她那一盞）、口試門牌；演完回到原本的地方；
//      從家裡出發、騎車、2030 年的分開談話照舊 2D
//   5  研究室的便條照 AA_392 甲案原句（「中午十二點二十以後，我在這裡。」）
// 修改前（開發分支 6de9a0705）：沒有 src/lab5f3d.js、作息沒有研究室、OUT 沒有 STAGE——全部 FAIL。用法：node tests/lab5f_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(LINZE_UPPER_LAYOUTS|LAB5)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const lz=[]; global.LZUP={ examSign:on=>lz.push('exam:'+!!on), labLights:m=>lz.push('lights:'+m) };
global.Z3={ZONES:{dorm:{},campus:{},linze_4f:{},linze_5f:{},library:{}}};
load('src/data/linze_upper_layouts.js');
for(const f of ['src/data/sis_y2y3_events.js','src/data/sis_b4_events.js','src/y34b3d.js']){ try{ load(f); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
let ok=true, err=''; try{ load('src/lab5f3d.js'); }catch(e){ ok=false; err=String(e); }
const X=()=>typeof LAB5!=='undefined'?LAB5:null;
const SIS='heroine_05', D=k=>STORY.dayOfKey(k);
const spawned=[]; GM.spawnCharacter=(id,x,z,o)=>{ const n={obj:{position:{x,z},rotation:{y:0}},pose:(o&&o.pose)||'idle',seat:o&&o.seat,charId:id}; GM.npc[id]=n; spawned.push({id,x,z,seat:!!(o&&o.seat)}); return n; };
GM.removeNPC=id=>{ delete GM.npc[id]; };
const capt=[]; GM.caption=(a,b)=>{ capt.push(b); };
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone||'linze_4f',flags); lz.length=0; spawned.length=0; capt.length=0; E.player.riding=false; E.player.seat=null; E.player.obj.position.x=1; E.player.obj.position.z=2; return G; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const contact=()=>{ H.G.contacts=H.G.contacts||{}; H.G.contacts[SIS]=H.G.day-30; };
const door=()=>({label:LINZE_UPPER_LAYOUTS['4f'].stairs.up.label,look:LINZE_UPPER_LAYOUTS['4f'].stairs.up.closed,lab5door:true});

(async()=>{
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. src/lab5f3d.js 載得到、index.html 有接（在 loans3d.js 前面）',ok&&!!X()&&html.indexOf('src/lab5f3d.js')>0&&html.indexOf('src/lab5f3d.js')<html.indexOf('src/loans3d.js'),err);
  const e=(CHARACTERS[SIS].daily_schedule||[]).find(q=>q.zone==='linze_5f'&&!/^AA_512/.test(q.note||''));   /* 2026-10-28 AA_512（企劃線 c444f0757）多兩筆 linze_5f：13-3 那兩天 17:00～18:00、交往中週一三晚上（tests/aa512_sis_b13_unit.js）；這裡看 AA_399 那一筆 */
  check('0. 學姊的作息：週一～週四 12:20～14:00 研究室（spot sis_desk、2026-09-01～2029-05-31）',!!e&&J(e.days)==='[1,2,3,4]'&&Math.abs(e.from-(12+20/60))<1e-9&&e.to===14&&e.spot==='sis_desk'&&J(e.dates)===J([['2026-09-01','2029-05-31']]),J(e));
  check('0. OUT.STAGE 有 LAB5 的換場；OUT.bg 包了一層',!!X()&&Array.isArray(OUT.STAGE)&&OUT.STAGE.includes(X().outingStage)&&OUT._lab5Bg===true);
  const src=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
  check('0. story3d.js populateSchedule 認得作息的 spot（區域的 spots）',/if\(ent\.spot\)\{ const sp=\(E\.zone\.spots\|\|\{\}\)\[ent\.spot\]/.test(src)); });
if(!X()){ H.done(); return; }

await sec(1,()=>{ const T=(key,h)=>{ fresh(key,h); return X().labNow(H.G); };
  check('1. 碩一 2026-09-22（二）12:30：在研究室',T('2026-09-22',12.5)===true);
  check('1. 12:19 還沒來、14:00 走了',T('2026-09-22',12.3)===false&&T('2026-09-22',14)===false);
  check('1. 週五（2026-09-25）不在',T('2026-09-25',13)===false);
  check('1. 碩一以前（2026-08-31，大一暑假）不在',T('2026-08-31',13)===false);
  check('1. 美國期間（2028-09-14 週四）不在',T('2028-09-14',13)===false);
  check('1. 碩三下（2029-05-24 週四）在；碩三結束以後（2029-06-04）不在',T('2029-05-24',13)===true&&T('2029-06-04',13)===false);
  fresh('2026-09-22',12.5); const ent=STORY.schedEnt(CHARACTERS[SIS],H.G);
  check('1. 作息那一筆：zone linze_5f、spot sis_desk',!!ent&&ent.zone==='linze_5f'&&ent.spot==='sis_desk',J(ent&&{zone:ent.zone,spot:ent.spot})); });

await sec(2,async()=>{
  fresh('2026-09-22',12.5); await STORY.interact(door(),GM);
  check('2. 還沒見過她（直屬學姊一開始就有聯絡方式，所以看 FIRST_MET）：只有門上那一句，沒有選項',H.opts.length===0&&capt.includes(LINZE_UPPER_LAYOUTS['4f'].stairs.up.closed),J({opts:H.opts,capt}));
  fresh('2026-09-22',12.5); contact(); H.FAMILIAR(SIS); H.picks=['傳訊息給學姊']; const h0=H.G.hour; await STORY.interact(door(),GM);
  check('2. 她在＋有聯絡方式：選項「傳訊息給學姊／算了」',J(H.opts[0])===J(['傳訊息給學姊','算了']),J(H.opts));
  check('2. 有點熟：「……有事嗎。進來。」',H.has('……有事嗎。進來。'),J(H.lines()));
  check('2. 兩分鐘後、進到 5F（linze_5f）、記一天一次',Math.abs(H.G.hour-h0-2/60)<1e-9&&H.entered.slice(-1)[0]==='linze_5f'&&H.G.flags.LAB5_DOOR===H.G.day&&H.G.flags.LAB5_IN===H.G.day,J({dh:H.G.hour-h0,entered:H.entered}));
  H.G.zone='linze_4f'; H.opts.length=0; capt.length=0; await STORY.interact(door(),GM);
  check('2. 同一天第二次：只有門上那一句',H.opts.length===0&&capt.length===1,J(H.opts));
  fresh('2026-09-22',12.5); contact(); H.FRIEND(SIS); H.picks=['傳訊息給學姊']; await STORY.interact(door(),GM);
  check('2. 朋友以上：「你來了。進來，小聲一點。」',H.has('你來了。進來，小聲一點。'),J(H.lines()));
  fresh('2027-03-02',13); contact(); H.FRIEND(SIS); H.date(SIS); H.picks=['傳訊息給學姊']; await STORY.interact(door(),GM);
  check('2. 交往中：旁白「（她開了門，沒有說話，拉你的袖子進去。）」',H.said.some(s=>s.who===null&&s.t==='（她開了門，沒有說話，拉你的袖子進去。）'),J(H.lines()));
  fresh('2026-09-22',12.5); contact(); H.FAMILIAR(SIS); H.picks=['算了']; await STORY.interact(door(),GM);
  check('2. 「算了」：沒有進去、今天還能再傳',H.entered.length===0&&H.G.flags.LAB5_DOOR==null);
  fresh('2026-09-22',15); contact(); H.FAMILIAR(SIS); await STORY.interact(door(),GM);
  check('2. 她不在的時段（15:00）：只有門上那一句',H.opts.length===0&&H.entered.length===0);
  fresh('2026-09-22',12.5); contact(); await STORY.interact({label:'看看',look:'別的'},GM);
  check('2. 別的「看」不受影響（STORY.interact 交回原本的）',H.opts.length===0&&H.entered.length===0); });

await sec(3,async()=>{ fresh('2026-09-22',13.9,'linze_5f',{}); H.G.flags.LAB5_IN=H.G.day; GM.npc[SIS]={obj:{position:{x:0,z:0}}};
  check('3. 13:54 還不用走',X().tick(GM)===false);
  H.G.hour=14.05; const r=X().tick(GM); await new Promise(res=>setTimeout(res,10));
  check('3. 14:03：「我要去總圖了。」、回到 4F、LAB5_IN 清掉',r===true&&H.has('我要去總圖了。')&&H.entered.slice(-1)[0]==='linze_4f'&&H.G.flags.LAB5_IN==null,J({r,said:H.lines(),entered:H.entered}));
  fresh('2026-09-22',14.2,'linze_5f',{}); check('3. 不是傳訊息進來的（沒有 LAB5_IN）：不趕人',X().tick(GM)===false);
  const lv=(k,want)=>{ fresh(k,14.05,'linze_5f',{}); return X().leaveLine(H.G)===want; };
  check('3. AA_437 第 2 節：大三起（2027-10-12）「我要去法圖了。」；大二（2026-09-22）照舊「我要去總圖了。」',lv('2027-10-12','我要去法圖了。')&&lv('2026-09-22','我要去總圖了。'));
  { const L0=global.LUP; global.LUP={sisPeriod:G=>true}; const ok=lv('2028-03-14','我去研究小間了。'); global.LUP=L0; check('3. 2028-02 起去研究小間的日子：「我去研究小間了。」',ok); } });

const go=async(ev,key,h,extra)=>{ fresh(key,h,'campus',{}); H.G.flags.ROUTE_DUMMY=1; Object.assign(H.G.flags,(extra&&extra.flags)||{}); const id='t_lab5_'+ev;
  OUT.plan(H.G,Object.assign({id,ev,day:D(key),h,late:0.5,place:'霖澤館・研究室',title:'研究室',travel:'走路 約 10 分鐘',travelH:1/6},(extra&&extra.q)||{})); const q=OUT.get(H.G,id);
  if(extra&&extra.riding) E.player.riding=true; await OUT.go(GM,q,extra&&extra.o); E.player.riding=false; return q; };
await sec(4,async()=>{
  await go('ev_sis_lab_desk','2026-09-22',12+20/60);
  check('4. ev_sis_lab_desk：先到 5F 演、演完回到原本的地方（campus）',J(H.entered)===J(['linze_5f','campus']),J(H.entered));
  check('4. 畫面：ADV 模糊的 3D；研究室走廊的底圖換成 3D（blur）',H.bgs[0]==='blur'&&!H.bgs.some(b=>b&&b.image&&/linze_prof_hall/.test(b.image)),J(H.bgs));
  check('4. 她坐在自己的位子（sis_desk）',spawned.some(s=>s.id===SIS&&s.seat&&Math.abs(s.x-LINZE_UPPER_LAYOUTS['5f'].spots.sis_desk.x)<1e-6&&Math.abs(s.z-LINZE_UPPER_LAYOUTS['5f'].spots.sis_desk.z)<1e-6),J(spawned));
  check('4. 燈：全開；演完還原',lz[0]==='exam:false'&&lz[1]==='lights:all'&&lz.slice(-1)[0]==='lights:all',J(lz));
  check('4. 演完了（台詞照舊）',!!H.G.events.done.ev_sis_lab_desk&&H.has('靠門的位子。每個人進來都會撞到我。'));
  await go('ev_sis_xmas_y3','2027-12-24',21);
  check('4. 聖誕夜：只開她那一盞燈（lights:sis），演完回到全開',lz.includes('lights:sis')&&lz.slice(-1)[0]==='lights:all'&&J(H.entered)===J(['linze_5f','campus']),J({lz,entered:H.entered}));
  await go('ev_sis_defense','2029-05-29',16,{q:{hours:1}});
  check('4. 口試：會議室門上「口試中」（exam:true），演完拿掉；她不在走廊上（在裡面）',lz.includes('exam:true')&&lz.slice(-2)[0]==='exam:false'&&!spawned.some(s=>s.id===SIS),J({lz,spawned}));
  await go('ev_sis_lab_desk','2026-09-22',12+20/60,{o:{fromHome:true}});
  check('4. 從家裡出發：照舊 2D（不換到 5F）',!H.entered.includes('linze_5f')&&H.bgs[0]!=='blur',J({entered:H.entered,bgs:H.bgs.slice(0,2)}));
  await go('ev_sis_lab_desk','2026-09-22',12+20/60,{riding:true});
  check('4. 騎著腳踏車：照舊 2D',!H.entered.includes('linze_5f'));
  const st=X().STAGES.ev_choice_apart_heroine_05;
  check('4. 分開談話：2029 年在 5F 走廊、2030 年不在這裡',!!st&&st.me==='corridor'&&st.when({apart:{y:2029}})===true&&st.when({apart:{y:2030}})===false);
  check('4. 生日（ev_pg_sis_bday）、兩張書桌（ev_sis_y4_desks：祐廷坐她旁邊）也在表上',!!X().STAGES.ev_pg_sis_bday&&X().STAGES.ev_sis_y4_desks.meSeat==='beside'); });

await sec(5,()=>{ const ev=STORY_EVENTS.find(e=>e.id==='ev_sis_lab_desk'), t=J(ev&&ev.dialogue);
  check('5. 便條：「中午十二點二十以後，我在這裡。」（乙案那一句拿掉）',t.includes('中午十二點二十以後，我在這裡。')&&!t.includes('研究室我只放書')); });

H.done();
})();
