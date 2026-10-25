// AA_464 法律系大四上讀一遍（留在臺灣；企劃線 878496edb，AA-B 2026-10-25 13:5x；D109）——不需要瀏覽器。台詞逐字對 AA_464（從企劃線 git show 讀稿、解析表格與引述）。
//   0 讀稿（第 1 節二十張、第 2 節十四句、第 3 節四列、4-1、4-2）；資料照稿一字不差；新檔載得到
//   1 學姊在美國每天一張照片（y34b3d.js S.m6／S.m6Wed；台灣、日本路線，8/3～12/22 家族群組 09:00）：每週三用那個月的下一張（照順序，二十張各一次；「手錶，調慢了一個小時」在 11/5 冬令時間之後的 11/8）；
//     其他天原本三張輪、不跟前一天同一張，「一杯熱水」常出現；美國路線照舊沒有
//   2 週日（S.m6）：六題爭論以後，「不吵」的週日照第幾個換（9/17 原句、9/24「外面在下雨」…12/17「下禮拜六，我回去」）；前面的「（照片）」照舊、不用回；11/5 起 20:00 照舊
//   3 子晴的裂縫談話（cracktalk3d.js S.zq；zq2.optsBy）：她回的照她傳的那一組換（四組×兩個選項）；選項的字、回「妳要不要先休息？」加裂縫照舊
//   4 4-1 12/11 麵店團群組阿哲「週四 麵店二十三週年 倒數三天」；4-2 沛珊同一天（12/24 聖誕開車下去、學期末的飯也在 12/24）＝「學期結束了！今天就是學期末的那一頓。」、不排出遊
//     （第 7 節，企劃線 7fa83ebc9：等聖誕那一場演完才傳；沒去的照平常約、18:30 的飯照排——細項在 aa462_y3s1_unit 第 6 節）
// 修改前（0b474c8b4）：1～4 每一節至少一項 FAIL。用法：node tests/aa464_y4s1_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/zr_uk3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/exchange3d.js',
  'src/group3d.js','src/y34b3d.js','src/data/fest_events.js','src/fest3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js']) L3(f);   /* index.html 的順序（照 y34b_events_unit.js、aa462_y3s1_unit.js、aa456_vac_unit.js 載的檔）*/
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{};
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const ZQ='heroine_04', PS='classmate_peishan';
const fresh=(k,h,flags,zone)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',Object.assign({introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true,ROOM_Y2:true,ROOM_Y3:true,EXCHANGE_ROUTE:'TW',EXCH_RULE:1},flags||{})); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; PHONE.rec(G); E.player.busy=false; E.paused=false; return G; };
const at=(d,h)=>{ const G=H.G; G.day=typeof d==='number'?d:D(d); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const run=(d,h0,h1,st)=>{ st=st||0.25; const dd=typeof d==='number'?d:D(d); for(let h=h0;h<=h1+1e-9;h+=st){ at(dd,+h.toFixed(3)); rules(); } };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const TH=th=>(H.G.msgs||[]).filter(m=>m.th===th);

/* ---- 讀稿（企劃線 878496edb）---- */
let doc=''; try{ doc=cp.execSync('git show 878496edb:"docs/story_planning/AA_464_法律系大四上讀一遍_學姊在美國的照片和週日_子晴的裂縫回覆.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const part=(a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const rows=t=>t.split('\n').filter(l=>/^\|/.test(l.trim())&&!/^\|\s*-/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const quotes=t=>t.split('\n').map(l=>l.trim().match(/^> (\S+?)：(.+)$/)).filter(Boolean).map(m=>({who:m[1],t:m[2]}));
const strip=s=>String(s||'').replace(/（原句）$/,'').trim();
const WED=rows(part('## 1.','## 2.')).filter(r=>/^\d+$/.test(r[0])).map(r=>({m:+r[0],p:r[1]}));
const QUIET=rows(part('## 2.','## 3.')).filter(r=>/^\d+$/.test(r[0])).map(r=>({n:+r[0],day:r[1],t:strip(r[2])}));
const ZQR=rows(part('## 3.','## 4.')).filter(r=>/／/.test(r[0])).map(r=>({msgs:r[0].split('／'),o1:strip(r[1]).replace(/（加裂縫）$/,''),o2:strip(r[2]).split('／')}));
const A23=(quotes(part('### 4-1.','### 4-2.')).find(q=>q.who==='阿哲')||{}).t, PS_SAME=(quotes(part('### 4-2.','## 5.')).find(q=>q.who==='沛珊')||{}).t;
const OLD_PHOTO=['（照片：一片沒有雲的天空）','（照片：一張空的桌子）','（照片：一杯熱水）'];

(async()=>{
/* ---- 0 ---- */
await sec(0,()=>{
  check('0. 讀得到稿、檔都載得到（Y34B、CRACKTALK、FEST、TERMEND）',!!doc&&!loadErr.length&&['Y34B','CRACKTALK','CRACKTALK_LINES','FEST','TERMEND'].every(n=>typeof globalThis[n]!=='undefined'),J(loadErr));
  check('0. 稿裡讀得到：第 1 節二十張（8～12 月）、第 2 節十四句、第 3 節四列、4-1 阿哲、4-2 沛珊',WED.length===20&&WED.every(x=>/^（照片：/.test(x.p))&&QUIET.length===14&&QUIET.every(x=>/^今天不吵。/.test(x.t))&&ZQR.length===4&&ZQR.every(x=>x.msgs.length===2&&!!x.o1&&x.o2.length>=1)&&!!A23&&!!PS_SAME,J({WED,QUIET,ZQR,A23,PS_SAME}));
  const W={}; for(const x of WED) (W[x.m]||(W[x.m]=[])).push(x.p);
  check('0. Y34B.M6_WED＝第 1 節的表（照月份、照順序）',J(Y34B.M6_WED)===J(W),J(Y34B.M6_WED));
  check('0. Y34B.M6_QUIET＝第 2 節十四句（第一句是原句）',J(Y34B.M6_QUIET)===J(QUIET.map(x=>x.t))&&Y34B.M6_QUIET[0]==='今天不吵。今天只放空白。',J(Y34B.M6_QUIET));
  const Z=CRACKTALK_LINES.SRC2.zq2;
  check('0. zq2 的四組照第 3 節（msgs 照舊；optsBy 的回覆照表，選項的字、加裂縫照 opts）',J(Z.msgs)===J(ZQR.map(x=>x.msgs))&&ZQR.every((x,i)=>{ const O=(Z.optsBy&&Z.optsBy[i])||Z.opts; return J(O[0][1])===J([x.o1])&&J(O[1][1])===J(x.o2)&&O[0][0]==='妳要不要先休息？'&&O[1][0]==='要我過去陪妳加班嗎？'&&O[0][2]===1&&O[1][2]===0; }),J(Z.optsBy));
});

/* ---- 1、2 學姊在美國：每天的照片、週日 ---- */
const sisG=(flags,route)=>{ fresh('2028-08-01',9,Object.assign({met_sis:true,SIS_W1:true},flags||{})); H.G.flags.EXCHANGE_ROUTE=route||'TW'; PHONE.join(H.G,'family_law','法律系直屬家族'); H.FRIEND('heroine_05'); return H.G; };
let DAYS=[], SUNL=[];
const sweep=()=>{ DAYS=[]; SUNL=[]; for(let d=D('2028-08-03');d<D('2028-12-23');d++){ at(d,9.5); rules(); const m=byTag('y4_m6_d'+d)[0]; if(m) DAYS.push({d,k:keyOf(d),wd:CALENDAR.dateOf(d).wd,t:m.text});
    if(CALENDAR.dateOf(d).wd===7){ at(d,20.5); rules(); const L=byTag('y4_m6_sun_'+d).map(x=>x.text); SUNL.push({d,k:keyOf(d),L,h:(byTag('y4_m6_sun_'+d)[0]||{}).h}); } } };
await sec(1,()=>{
  sisG(); sweep();
  const wed=DAYS.filter(x=>x.wd===3), other=DAYS.filter(x=>x.wd!==3&&x.wd!==7);
  const nDays=(()=>{ let n=0; for(let d=D('2028-08-03');d<D('2028-12-23');d++) if(CALENDAR.dateOf(d).wd!==7) n++; return n; })();
  check('1. [前置] 8/3～12/22 週日以外每天一張（'+nDays+' 天；週日是爭論題／不吵那一則）',DAYS.length===nDays&&!DAYS.some(x=>x.wd===7),String(DAYS.length));
  check('1. 每週三照那個月的下一張：二十張各一次、照月份（第 1 節）',wed.length===20&&J(wed.map(x=>x.t).slice().sort())===J(WED.map(x=>x.p).slice().sort())&&wed.every(x=>{ const w=WED.find(y=>y.p===x.t); return !!w&&w.m===CALENDAR.dateOf(x.d).m; }),J(wed.map(x=>[x.k,x.t])));
  check('1. 每個月照表的順序（11 月：手錶等到 11/5 冬令時間以後）',[8,9,10,12].every(mo=>J(wed.filter(x=>CALENDAR.dateOf(x.d).m===mo).map(x=>x.t))===J(WED.filter(y=>y.m===mo).map(y=>y.p)))&&J(wed.filter(x=>CALENDAR.dateOf(x.d).m===11).map(x=>x.t))===J([WED[13].p,WED[12].p,WED[14].p,WED[15].p,WED[16].p]),J(wed.filter(x=>CALENDAR.dateOf(x.d).m===11).map(x=>[x.k,x.t])));
  const watch=wed.find(x=>/手錶/.test(x.t)), tkt=wed.find(x=>/機票/.test(x.t));
  check('1. 「手錶，調慢了一個小時」在 11/8（11/5 冬令時間之後的那個週三）；「機票的確認信 12/23」在 11 月',!!watch&&watch.k==='2028-11-08'&&!!tkt&&/^2028-11/.test(tkt.k),J([watch&&watch.k,tkt&&tkt.k]));
  check('1. 其他天：原本三張（只有括號、沒有字）',other.length>=100&&other.every(x=>OLD_PHOTO.includes(x.t)),J(other.filter(x=>!OLD_PHOTO.includes(x.t)).slice(0,3)));
  const same=DAYS.filter((x,i)=>i>0&&DAYS[i-1].d===x.d-1&&DAYS[i-1].t===x.t);
  check('1. 不跟前一天同一張（整學期沒有連兩天一樣）',!same.length,J(same.map(x=>x.k)));
  check('1. 「一杯熱水」留著常出現（三張平均輪）',other.filter(x=>x.t==='（照片：一杯熱水）').length>=30,String(other.filter(x=>x.t==='（照片：一杯熱水）').length));
  check('1. 一百四十天不再只有三張（共 '+new Set(DAYS.map(x=>x.t)).size+' 種）',new Set(DAYS.map(x=>x.t)).size===23);
  /* 跳過日子：直接到 11/8 那一天才跑規則（睡過頭、讀檔）也是那一張 */
  sisG(); at(D('2028-11-08'),9.5); rules(); check('1. 只看日子：直接跑到 11/8＝手錶那一張',(byTag('y4_m6_d'+D('2028-11-08'))[0]||{}).text===watch.t);
  sisG({},'US'); for(const k of ['2028-08-09','2028-08-10']){ at(D(k),9.5); rules(); } check('1. 美國路線照舊沒有 M6',!(H.G.msgs||[]).some(m=>/^y4_m6_/.test(m.tag||'')));
});
await sec(2,()=>{
  if(!SUNL.length){ sisG(); sweep(); }
  const q=SUNL.filter(x=>x.L.length===2), Q=SUNL.filter(x=>x.L.length===3);
  check('2. [前置] 前六個週日是爭論題（8/6～9/10）',Q.length===6&&Q[0].k==='2028-08-06'&&Q[5].k==='2028-09-10',J(Q.map(x=>x.k)));
  check('2. 「不吵」的週日十四個（9/17～12/17），照第幾個換（第 2 節的表，日子也對）',q.length===14&&q.every((x,i)=>x.L[0]==='（照片）'&&x.L[1]===QUIET[i].t&&x.k.slice(5).replace(/^0/,'').replace('-0','-').replace('-','/')===QUIET[i].day),J(q.map(x=>[x.k,x.L[1]])));
  check('2. 不再十四次一字不差；都不用回（沒有選項）',new Set(q.map(x=>x.L[1])).size===14&&q.every(x=>byTag('y4_m6_sun_'+x.d).every(m=>!m.ask)));
  check('2. 11/5 起 20:00、之前 19:00（照舊）',q.every(x=>Math.abs(x.h-(x.d>=D('2028-11-05')?20:19))<0.01),J(q.map(x=>[x.k,x.h])));
});

/* ---- 3 子晴 ---- */
await sec(3,()=>{
  const firstWed=(y,m)=>{ for(let d=D(y+'-'+String(m).padStart(2,'0')+'-01');;d++) if(wdOf(d)===3) return d; };
  const MONTHS=[[2028,10],[2028,11],[2028,12],[2029,1],[2029,2],[2029,3],[2029,4],[2029,5]];
  fresh('2028-09-25',10); SOCIAL.remember(ZQ,'FIRST_MET',''); INV.addContact(H.G,ZQ); H.CLOSE(ZQ); ROM.start(H.G,ZQ);
  const got=[]; MONTHS.forEach(([y,m],i)=>{ const d=firstWed(y,m); const k=CRACKTALK.key(ZQ); if(k) H.G.flags[k]=0; at(d,23.55); rules(); const tag='ct_zq2_'+y+'-'+String(m).padStart(2,'0'), mm=PHONE.byAsk(H.G,tag);
    if(!mm){ got.push(null); return; } const ask=byTag(tag).filter(x=>x.from===ZQ).map(x=>x.text), c0=CRACKTALK.count(H.G,ZQ), a=i<4?0:1; PHONE.answer(H.G,tag,a); rules();
    got.push({tag,ask,o:mm.ask.opts.map(x=>x.t),a,r:TH('p:'+ZQ).filter(x=>x.tag===tag+'_r').map(x=>x.text),add:CRACKTALK.count(H.G,ZQ)-c0}); });
  check('3. [前置] 8 個月都收到（10 月起每個月第一個週三 23:30），開頭照第幾個月輪（AA_456 1-6）',got.every(Boolean)&&got.every((g,i)=>J(g.ask)===J(ZQR[i%4].msgs)),J(got.map(g=>g&&[g.tag,g.ask])));
  check('3. 選項的字照舊（「妳要不要先休息？」「要我過去陪妳加班嗎？」）',got.every(g=>g&&J(g.o)===J(['妳要不要先休息？','要我過去陪妳加班嗎？'])));
  check('3. 回「妳要不要先休息？」：她回的照她傳的那一組換（'+ZQR.map(x=>x.o1).join('／')+'），照舊加裂縫',got.slice(0,4).every((g,i)=>J(g.r)===J([ZQR[i].o1])&&g.add===1),J(got.slice(0,4).map(g=>[g.r,g.add])));
  check('3. 回「要我過去陪妳加班嗎？」：她回的照那一組換（'+ZQR.map(x=>x.o2.join('｜')).join('／')+'），不加',got.slice(4).every((g,i)=>J(g.r)===J(ZQR[i].o2)&&g.add===0),J(got.slice(4).map(g=>[g.r,g.add])));
  check('3. 不再每次都是「你在替我決定嗎」',new Set(got.slice(0,4).map(g=>g.r.join())).size===4);
});

/* ---- 4 兩個小的 ---- */
await sec(4,async()=>{
  fresh('2028-12-11',20); H.FAMILIAR('zhe'); PHONE.join(H.G,'noodle_team','麵店團'); run('2028-12-11',20.75,21.25); const m=byTag('y4_a23_count_a23msg');
  check('4-1. 12/11 21:00 麵店團群組阿哲「'+A23+'」（說是麵店的週年）',m.length===1&&m[0].from==='zhe'&&m[0].text===A23&&/麵店二十三週年/.test(m[0].text),J(m.map(x=>x.text)));
  /* 4-2 沛珊同一天 */
  fresh('2028-12-18',8,{PS_BACK_FIRST:1}); H.CLOSE(PS); INV.addContact(H.G,PS); H.G.contacts[PS]=0; ROM.start(H.G,PS); H.G.flags['dating_'+PS]=true;
  for(const k of ['2028-12-18','2028-12-19','2028-12-20','2028-12-21','2028-12-22']) run(k,8,23.5,0.5); run('2028-12-23',8,21.25,0.25);
  const xTag='fest_ask_'+PS+'_xmas_2028', a=PHONE.byAsk(H.G,xTag)?PHONE.answer(H.G,xTag,0):null; run('2028-12-23',21.5,22,0.25); const q=OUT.get(H.G,'fest_'+PS+'_xmas_2028');
  run('2028-12-24',8,12,0.25); const L0=byTag('te_gf_Y4S1_'+PS).length;
  if(q){ H.said=[]; H.opts=[]; H.picks=[0,0,0,0]; at(q.day,q.h); await OUT.go(GM,q); } rules(); const L=byTag('te_gf_Y4S1_'+PS);
  check('4-2. 12/23 她約聖誕→去（12/24 開車下台南）、學期末的飯也在 12/24：聖誕那一場演完才傳「'+PS_SAME+'」（第 7 節：只是排了不算，12:00 先不傳）、不能回、不排出遊',!!a&&!!q&&q.day===D('2028-12-24')&&L0===0&&q.state==='done'&&L.length===1&&L[0].text===PS_SAME&&L[0].day===D('2028-12-24')&&!L[0].ask&&!OUT.rec(H.G).some(x=>/^te_gf_/.test(x.id||'')),J({q:q&&[keyOf(q.day),q.state],L0,L:L.map(x=>[keyOf(x.day),x.h,x.text])}));
});

H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
