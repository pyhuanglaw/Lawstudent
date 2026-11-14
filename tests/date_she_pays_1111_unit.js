// 她請客＝那個互動點不扣玩家的錢（S.SHE_PAYS；AA_780_an_date_followup.json@248c8e390 的 _meta.she_pays，AA 選「做機制、字不改」；2026-11-11）——不需要瀏覽器（D131）。
//   以安三格：D06#43（D06.cafe 的 remember）、D13#23（D13.drink 的 normal 第三套，第 6 階以上）、D18#41（D18.teahouse 的 normal 第三套，第 6 階以上）。格號＝date_rewrite.py list heroine_01 Dxx（逐格在 tests/an_dates_1111_unit.js 第 9 節）。
//   1. 資料：S.SHE_PAYS 每一句在 date_lines.js 那個人那個互動點底下剛好一處（她說的台詞，不是選項的字）、整份檔也只有那一處；位置就是 _meta.she_pays 寫的那一套；S.shePays 只認那個人＋那個互動點＋整句
//   2. 實際演 D06（DATE.book → OUT.prompt 整趟）：第一次（選「我請妳。」）照扣 160；第二次演到 remember「這次我請」＝咖啡廳不扣、門票和車資照扣；之後輪到 normal 那一套照扣；學姊在同一個點（remember）照扣
//   3. D13（第 6 階以上）：normal 第一套照扣、輪到第三套「這杯我請」那一次不扣；交往中演 dating 那一套照扣；子晴在同一個點選「我請。」＝60＋她那一份 60
//   4. D18（第 6 階以上）：茶樓第一、二套照扣；第三套不扣，同一趟下一個互動點（芋圓 60）照扣；快速約會（不演台詞）照扣
//   5. 兩天一夜（S.dayRound）同一個機制：測試裡暫時在 S.SHE_PAYS 加一格 D26 審計新村（不是遊戲資料，測完拿掉），加了不扣、沒加照扣
//   6. 用完清掉：行程物件上的 shePaid 演完就拿掉、不進存檔；選單上的價錢照舊；程式兩條路（S.scene、S.dayRound）都用 S.takeShePaid
//   7. 三格有沒有「祐廷選我請」：三套都沒有選項、她這三個互動點沒有 opts＝同一次不會同時發生；以安在這三個互動點唯一的請客選項是 D06 咖啡廳第一次「我請妳。」（extra 0＝和「各付各的。」一樣扣 160）
//   AA_782（2026-11-11，企劃線 f7a23d408；白名單一筆、tools/date/import_she_pays.py → src/data/she_pays.js，date3d.js 合進 S.SHE_PAYS）：學姊七格、沛珊兩格、可昕一格——
//   8. 資料：白名單、重匯一致、稿十列＝cells；每一格在她那個互動點底下剛好一處、在 key 那一套、是她說的、格號那一格就是這一句；S.shePays 只認人＋互動點＋整句；沒列的（子晴 D06、語彤、芷若）照扣；那十套裡祐廷的選項都不是請客選項
//   9. 逐格演（當天來回 S.scene；D30、D31 兩天一夜 S.dayRound）：演到那一句那一次那個互動點不扣；同一個互動點演別套照扣
// 用法：node tests/date_she_pays_1111_unit.js
require('./alison.js');
const M959=require('./aa959_map.js');   /* AA_959（DLG-FULL-REVIEW-1110）：遊戲的 date_lines 先照覆寫表換回舊字再比（AA_959 本身逐列驗在 tests/aa959_overlay_unit.js）*/
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path');
const C=require('./date_src_sha.js');
const AN='heroine_01', ZQ='heroine_04', SIS='heroine_05', YT='heroine_03', ZR='heroine_02', PS='classmate_peishan', KX='kexin', SP='docs/story_planning/';
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<26}); }catch(e){ return null; } };
const read=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const NOW=M959.unmapDeep(DL(read('src/data/date_lines.js')),'date_lines.js');
const leaves=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>leaves(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) leaves(x[k],p+'/'+k,o); else o[p]=x; return o; };
const getAt=(o,p)=>p.split('/').slice(1).reduce((x,k)=>x==null?x:x[k],o);
/* 扣錢記下來（名稱、金額）；選單的提示（「30 分　160 元」）也記下來；選單一直重來＝丟例外。
   picks 只寫要選的那幾題：「自己選」那一題（第三次以後才問快速約會）沒出現就跳過；下一個要選的字不在這一題（例如互動點自己的選項）＝這一題選第一個、pick 留給下一題；
   演完 picks 還有剩＝有一題沒選到（go 丟例外，那一節算失敗）*/
const CH=[], HINT={}; GM.money=(d,l)=>{ H.G.money+=d; CH.push([l,d]); };
{ const ch0=GM.choose; let n=0; GM.choose=async o=>{ if(++n>200) throw new Error('選單一直重來：'+J(o.map(x=>x.t||x.text))); const T=o.map(x=>x.t||x.text||''); for(const x of o) if(x&&x.hint) HINT[x.t||x.text]=x.hint;
    if(H.picks[0]==='自己選'&&!T.includes('自己選')) H.picks.shift();
    const w=H.picks[0]; if(typeof w==='string'&&!T.some(t=>t.includes(w))&&!o.some(x=>(x.sub||[]).some(y=>y.includes(w)))){ H.opts.push(T); return 0; }
    return ch0(o); }; GM._reset=()=>{ n=0; }; }
const setup=(key,who,o)=>{ o=o||{}; const G=H.fresh(key,9,'dorm',o.flags||{}); G.money=50000; G.outings=[]; G.contacts=G.contacts||{}; H.CLOSE(who); G.contacts[who]=1; if(o.rom!=null) SOCIAL.rel(who).npcRom=o.rom; GM._reset(); return G; };
/* 當天來回的一趟：今天 depart 點出發（照選單一樣 DATE.book → OUT.prompt 演整趟）；回傳扣了哪些錢、她說了哪些話、花了多少 */
const go=async(who,loc,picks,o)=>{ o=o||{}; const G=H.G, dep=o.depart||10; CH.length=0; GM._reset(); const tr=o.tr||(DATE.loc(loc).transport||[])[0].mode;
  const b=DATE.book(G,{who,locs:[loc],transport:tr,day:G.day,depart:dep}); if(!b.ok) return {b,said:[],ch:[],L:[],spent:0};
  const q=OUT.get(G,'date_'+b.trip); G.hour=dep; H.said=[]; H.opts=[]; H.picks=['出發'].concat(picks); const m0=G.money; await OUT.prompt(GM,q); if(H.picks.length) throw new Error(loc+' 這一趟沒選到：'+J(H.picks)+'；選單 '+J(H.opts));
  return {b,t:DATE.trip(G,b.trip),said:H.said.filter(s=>s.who===nameOf(who)).map(s=>s.t),L:H.lines(),ch:CH.slice(),spent:m0-G.money,opts:H.opts.map(x=>x.slice())}; };
const nameOf=id=>(CHARACTERS.find?CHARACTERS.find(c=>c.id===id):(CHARACTERS[id]||null)||{}).name||id;
const paid=(r,name)=>r.ch.filter(([l])=>l===name).map(([,d])=>-d);
const week=()=>{ H.G.day+=7; };   /* 同一個星期幾（週六），下週再去 */
const PT=pid=>DATE.points(pid.slice(0,3)).find(p=>p.id===pid);
const SAY0={'D06.cafe':'這家的蛋糕我記得，檸檬的那個。這次我請。','D13.drink':'這杯我請。不要跟我搶。','D18.teahouse':'這壺茶多少錢？好，不貴，這壺我請。'}, SAY={}; for(const k in SAY0) SAY[k]=M959.map(SAY0[k],'date_lines.js','heroine_01');   /* RC2-PORT-DEV-1114：AA_959 又換了 D06.cafe 那一句（date_lines.js、date3d.js 一起換），期望照表 */   /* 2026-11-12（AA_832@b84e779563）：D18.teahouse 那一句 AA 改了字（同一格、還是她請），S.SHE_PAYS 跟著換。舊期望：'這壺茶多少錢？好，不貴。我請。' */

(async()=>{
  await sec(1,async()=>{ const SPY=DATE.SHE_PAYS;
    /* 2026-11-11（AA_782）：S.SHE_PAYS 另外合進學姊、沛珊、可昕十格（src/data/she_pays.js，第 8、9 節）。舊期望：S.SHE_PAYS 的人只有以安 */
    /* 2026-11-11（AA_812@f1fab0ec6）：she_pays.js 也合進 AA_812 的 SHE_PAYS_add——以安多兩個互動點（D29.sculpture、D31.egg，在手寫三格後面）、語彤、子晴也有（tests/date_she_pays_812_1111_unit.js）。
       舊期望：S.SHE_PAYS 的人＝[以安].concat(she_pays.js 的人)、以安只有手寫三格 */
    check('1. S.SHE_PAYS 以安：手寫三個互動點、每個一句（AA_780 的 _meta.she_pays，date3d.js 手寫）在最前面，後面只多 she_pays.js 的以安格（AA_812）；別的人只有 she_pays.js 合進來的那幾個（第 8 節）',J(Object.keys(SPY))===J([AN].concat(Object.keys(SHE_PAYS_DATA.pays).filter(k=>k!==AN)))&&J(Object.keys(SPY[AN]))===J(Object.keys(SAY).concat(Object.keys(SHE_PAYS_DATA.pays[AN]||{})))&&Object.keys(SAY).every(k=>J(SPY[AN][k])===J([SAY[k]])),J(Object.keys(SPY)));
    const all=leaves(NOW,'',{}), want={'D06.cafe':'/remember/lines/0/text','D13.drink':'/normal/2/lines/0/text','D18.teahouse':'/normal/2/lines/0/text'}, bad=[];
    for(const pid in SAY) for(const s_ of SPY[AN][pid]){ const s=M959.unmap(s_,'date_lines.js',AN);   /* NOW 是照覆寫表換回舊字的，S.SHE_PAYS 的句子也換回去再找 */   /* 2026-11-11（AA_812@f1fab0ec6）：只看手寫三格（以安 AA_812 那兩格的位置在 tests/date_she_pays_812_1111_unit.js）。舊期望：SPY[AN] 每一格（那時只有這三格）*/
      const loc=pid.slice(0,3), h=((((NOW.loc[loc]||{}).lines||{})[AN]||{}).hotspots||{})[pid], L=leaves(h,'',{}), at=Object.keys(L).filter(p=>L[p]===s);
      const tot=Object.keys(all).filter(p=>all[p]===s);
      if(at.length!==1) bad.push(pid+' 在她那個互動點底下 '+at.length+' 處');
      else { if(at[0]!==want[pid]) bad.push(pid+' 位置 '+at[0]); if(!/\/text$/.test(at[0])||getAt(h,at[0].replace(/\/text$/,'/who'))!==AN) bad.push(pid+' 不是她說的台詞'); }
      if(tot.length!==1) bad.push(pid+' 整份 date_lines.js '+tot.length+' 處：'+tot.join('、')); }
    check('1. 每一句在 date_lines.js 那個人那個互動點底下剛好一處、是她說的台詞（who＝heroine_01，不是選項的字）、整份檔也只有那一處；位置：D06.cafe remember、D13.drink normal 第三套、D18.teahouse normal 第三套',bad.length===0,J(bad));
    const tier=pid=>{ const h=NOW.loc[pid.slice(0,3)].lines[AN].hotspots[pid]; return pid==='D06.cafe'?h.remember.tier:h.normal[2].tier; };
    check('1. 那三套的 tier：D06 remember＝any（第二次來就輪得到）、D13、D18 normal 第三套＝high（第 6 階以上才輪得到）',tier('D06.cafe')==='any'&&tier('D13.drink')==='high'&&tier('D18.teahouse')==='high',J(Object.keys(SAY).map(tier)));
    const R=JSON.parse(show(C.AN_FOLLOW_SHA,SP+'AA_780_an_date_followup.json')||'null');
    if(R){ const m=[...String(R._meta.she_pays||'').matchAll(/(D\d\d)#(\d+)（(D\d\d\.\w+)\.(\w+)(?:#(\d+))?）/g)].map(x=>x[3]+(x[4]==='remember'?'/remember':'/'+x[4]+'/'+x[5])+'/lines/0/text');
      check('1. 和 AA_780@'+C.AN_FOLLOW_SHA+' 的 _meta.she_pays 寫的三格（D06.cafe.remember、D13.drink.normal#2、D18.teahouse.normal#2）同一個位置；_meta 寫「字不改」＝三句和匯入的字一樣',J(m)===J(Object.keys(want).map(k=>k+want[k]))&&/字不改/.test(R._meta.she_pays),J(m)); }
    else console.log('（這份 checkout 讀不到企劃線的 AA_780：不比 _meta）');
    const sp=DATE.shePays;
    check('1. S.shePays 只認「那個人＋那個互動點＋整句」：別人說同一句、別的互動點、沒有互動點（抵達、收尾）、多一個字都不算',Object.keys(SAY).every(k=>sp(AN,k,SAY[k])===true&&sp(ZQ,k,SAY[k])===false&&sp(AN,null,SAY[k])===false&&sp(AN,undefined,SAY[k])===false&&sp(AN,k,SAY[k]+'。')===false&&sp(AN,k,'（'+SAY[k]+'）')===false)&&sp(AN,'D13.drink',SAY['D18.teahouse'])===false&&sp(AN,'D06.lawn',SAY['D06.cafe'])===false);
    const t={shePaid:'D06.cafe'}, a=DATE.takeShePaid(t,'D06.lawn'), b2=('shePaid' in t), t2={shePaid:'D06.cafe'}, c=DATE.takeShePaid(t2,'D06.cafe');
    check('1. S.takeShePaid：看一次就清掉——不是那個互動點＝false（也清掉），是＝true；行程物件沒有這個欄位＝false',a===false&&!b2&&c===true&&!('shePaid' in t2)&&DATE.takeShePaid({},'D06.cafe')===false&&DATE.takeShePaid(null,'D06.cafe')===false); });

  await sec(2,async()=>{ const G=setup('2026-03-28',AN), cafe=PT('D06.cafe');
    check('2. 前提：D06 館內的咖啡廳 cost 160（祐廷自己那杯）、extra 0；以安第 4 階（沒到第 6 階、沒交往）',cafe.cost===160&&(cafe.extra|0)===0&&DATE.stageNum(AN)===4&&!G.flags.dating_heroine_01,J([cafe,DATE.stageNum(AN)]));
    const r1=await go(AN,'D06',['館內的咖啡廳','我請妳','差不多了']);
    check('2. 第一次去（第一次那一套）：選「我請妳。」她回「好，謝謝。那蛋糕我來。」——咖啡廳扣 160，沒有另外扣她那一份（extra 0）；沒有說「這次我請」',!!r1.b.ok&&r1.said.includes('好，謝謝。那蛋糕我來。')&&J(paid(r1,'館內的咖啡廳'))===J([160])&&!r1.ch.some(([l])=>/（請她）/.test(l))&&!r1.said.includes(SAY['D06.cafe'])&&r1.spent===30+160+60,J([r1.b.why,r1.ch,r1.said]));
    week(); const r2=await go(AN,'D06',['館內的咖啡廳','差不多了']);
    check('2. 第二次去（演 remember）：她說「'+SAY['D06.cafe']+'」——咖啡廳這一次不扣；門票 30、車資 60 照扣；結算寫「花了 90 元」',!!r2.b.ok&&r2.said.filter(x=>x===SAY['D06.cafe']).length===1&&J(paid(r2,'館內的咖啡廳'))==='[]'&&J(paid(r2,'臺北市立美術館 門票'))===J([30])&&J(paid(r2,'交通'))===J([60])&&r2.spent===90&&r2.L.some(x=>/花了 90 元/.test(x)),J([r2.b.why,r2.ch,r2.said]));
    check('2. 選單上的價錢照舊（「30 分　160 元」）；行程物件上沒有留下 shePaid（不是存檔的新欄位）；存檔裡找不到 shePaid',HINT['館內的咖啡廳']==='30 分　160 元'&&!!r2.t&&!('shePaid' in r2.t)&&!J(G).includes('shePaid'),J([HINT['館內的咖啡廳'],r2.t&&r2.t.shePaid]));
    week(); const r3=await go(AN,'D06',['自己選','館外的草地','差不多了']);   /* 上一次不點咖啡廳＝下一次不再演 remember */
    week(); const r4=await go(AN,'D06',['自己選','館內的咖啡廳','差不多了']);
    const N=NOW.loc.D06.lines[AN].hotspots['D06.cafe'].normal.map(s=>s.lines[0].text);
    check('2. 同一個互動點播別套照扣：第四次去（第三次沒點咖啡廳）演 normal 那一套（「'+N.filter(x=>r4.said.includes(x)).join('')+'」）——咖啡廳扣 160',!!r3.b.ok&&!!r4.b.ok&&J(paid(r3,'館內的咖啡廳'))==='[]'&&r4.said.some(x=>N.includes(x))&&!r4.said.includes(SAY['D06.cafe'])&&J(paid(r4,'館內的咖啡廳'))===J([160]),J([r3.b.why,r4.b.why,r4.ch,r4.said]));
    /* 別人在同一個地點：2026-11-11 起學姊的 remember「上次你請的。這次我請。」也是她請（AA_782，第 9 節逐格演）——這裡改用語彤（AA_782：語彤、芷若沒有當場請的格）。
       舊期望：學姊 D06 咖啡廳第一次扣 160、第二次演她的 remember 也扣 160 */
    setup('2026-03-28',YT); const s1=await go(YT,'D06',['館內的咖啡廳','差不多了']); week(); const s2=await go(YT,'D06',['館內的咖啡廳','差不多了']);
    const SR=NOW.loc.D06.lines[YT].hotspots['D06.cafe'].remember.lines.filter(x=>x.who===YT).map(x=>x.text);
    check('2. 別人在同一個地點照扣：語彤 D06 咖啡廳第一次扣 160、第二次演她的 remember（「'+SR.join('')+'」）也扣 160',!!s1.b.ok&&!!s2.b.ok&&J(paid(s1,'館內的咖啡廳'))===J([160])&&SR.length>0&&SR.every(x=>s2.said.includes(x))&&J(paid(s2,'館內的咖啡廳'))===J([160]),J([s1.b.why,s2.b.why,s2.ch,s2.said])); });

  await sec(3,async()=>{ const G=setup('2026-03-28',AN,{rom:60}), drink=PT('D13.drink');
    check('3. 前提：D13 飲料攤 cost 60、extra 60；以安第 6 階（tier high）、沒交往',drink.cost===60&&drink.extra===60&&DATE.stageNum(AN)===6&&DATE.tierOf(G,AN)==='high'&&!G.flags.dating_heroine_01);
    /* 前面幾次直接寫進存檔：去過兩次、點過飲料攤、上一次沒點（不演第一次、不演 remember，輪 normal）*/
    const m=DATE.mem(G,AN,'D13'); m.picks=['D13.drink']; m.last=[]; DATE.log(G,AN).byLoc.D13=2;
    const N=NOW.loc.D13.lines[AN].hotspots['D13.drink'].normal.map(s=>s.lines[0].text);
    const r1=await go(AN,'D13',['自己選','飲料攤','差不多了']);
    check('3. normal 第一套（「'+N[0]+'」，tier any）：飲料攤扣 60',!!r1.b.ok&&r1.said.includes(N[0])&&!r1.said.includes(SAY['D13.drink'])&&J(paid(r1,'飲料攤'))===J([60]),J([r1.b.why,r1.ch,r1.said]));
    m.last=[]; week(); const r2=await go(AN,'D13',['自己選','飲料攤','差不多了']);
    check('3. 下一次輪到第三套（第 6 階以上；mid 那一套她不是 mid 跳過）：她說「'+SAY['D13.drink']+'」——飲料攤這一次不扣，車資 100 照扣',!!r2.b.ok&&N[2]===SAY['D13.drink']&&r2.said.filter(x=>x===SAY['D13.drink']).length===1&&J(paid(r2,'飲料攤'))==='[]'&&J(paid(r2,'交通'))===J([100])&&r2.spent===100&&!('shePaid' in r2.t),J([r2.b.why,r2.ch,r2.said]));
    G.flags.dating_heroine_01=true; m.last=[]; week(); const r3=await go(AN,'D13',['自己選','飲料攤','差不多了']);
    const DT=NOW.loc.D13.lines[AN].hotspots['D13.drink'].dating.map(s=>s.lines[0].text);
    check('3. 交往中演 dating 那一套（「'+DT.join('')+'」）：飲料攤照扣 60',!!r3.b.ok&&DT.some(x=>r3.said.includes(x))&&!r3.said.includes(SAY['D13.drink'])&&J(paid(r3,'飲料攤'))===J([60]),J([r3.b.why,r3.ch,r3.said]));
    /* 別人在同一個地點：子晴第一次去，選「我請。」（AA_128 5-2 的請客選項）＝她自己那一份 60＋請她那一份 60（子晴的約一律下午三點以後到，15:00 出發）*/
    setup('2026-03-28',ZQ); const z=await go(ZQ,'D13',['飲料攤','我請','差不多了'],{depart:15});
    check('3. 別人在同一個地點照扣：子晴 D13 飲料攤第一次選「我請。」——飲料攤 60＋「飲料攤（請她）」60',!!z.b.ok&&J(paid(z,'飲料攤'))===J([60])&&J(paid(z,'飲料攤（請她）'))===J([60]),J([z.b.why,z.ch])); });

  await sec(4,async()=>{ const G=setup('2026-03-28',AN,{rom:60}), tea=PT('D18.teahouse'), snack=PT('D18.snack');
    check('4. 前提：D18 茶樓的窗邊 cost 250、extra 0；老街的小吃（芋圓）cost 60',tea.cost===250&&(tea.extra|0)===0&&snack.cost===60);
    const m=DATE.mem(G,AN,'D18'); m.picks=['D18.teahouse']; m.last=[]; DATE.log(G,AN).byLoc.D18=2;
    const N=NOW.loc.D18.lines[AN].hotspots['D18.teahouse'].normal.map(s=>s.lines[0].text);
    const r1=await go(AN,'D18',['自己選','茶樓的窗邊','差不多了']);
    check('4. normal 第一套（「'+N[0]+'」）：茶樓扣 250',!!r1.b.ok&&r1.said.includes(N[0])&&J(paid(r1,'茶樓的窗邊'))===J([250]),J([r1.b.why,r1.ch,r1.said]));
    m.last=[]; week(); const r1b=await go(AN,'D18',['自己選','茶樓的窗邊','差不多了']);
    check('4. 下一次輪到第二套（「'+N[1]+'」，tier any）：茶樓照扣 250',!!r1b.b.ok&&r1b.said.includes(N[1])&&!r1b.said.includes(SAY['D18.teahouse'])&&J(paid(r1b,'茶樓的窗邊'))===J([250]),J([r1b.b.why,r1b.ch,r1b.said]));
    /* 輪替記憶（dateMemory.recent）一個地點只記最近 3 個 key、抵達和收尾也佔位子，前兩套的 key 已經被擠掉——這裡直接寫「前兩套剛用過」，下一次就是第三套 */
    m.last=[]; m.recent=['D18.teahouse.normal#0','D18.teahouse.normal#1']; week(); const r2=await go(AN,'D18',['自己選','茶樓的窗邊','老街的小吃','差不多了']);
    check('4. 再下一次輪到第三套：她說「'+SAY['D18.teahouse']+'」——茶樓這一次不扣；同一趟接著去芋圓（第一次那一套）照扣 60（用完就清掉，不會帶到下一個互動點）；車資 200',!!r2.b.ok&&N[2]===SAY['D18.teahouse']&&r2.said.filter(x=>x===SAY['D18.teahouse']).length===1&&J(paid(r2,'茶樓的窗邊'))==='[]'&&J(paid(r2,'老街的小吃（芋圓）'))===J([60])&&r2.spent===200+60&&!('shePaid' in r2.t),J([r2.b.why,r2.ch,r2.said]));
    /* 快速約會（同一個地點第三次以後）：系統直接做她喜歡的兩個互動點、不演台詞＝她沒說要請＝照扣——就算這時候演台詞會輪到「我請」那一套 */
    m.last=[]; m.recent=['D18.teahouse.normal#0']; week(); const r3=await go(AN,'D18',['快速約會']);
    check('4. 快速約會不演台詞＝照扣：做的是茶樓（她喜歡）＋芋圓，茶樓 250、芋圓 60 都扣；她沒說「這壺茶…我請」',!!r3.b.ok&&J(r3.t.spots)===J(['D18.teahouse','D18.snack'])&&J(paid(r3,'茶樓的窗邊'))===J([250])&&J(paid(r3,'老街的小吃（芋圓）'))===J([60])&&!r3.said.includes(SAY['D18.teahouse']),J([r3.b.why,r3.t&&r3.t.spots,r3.ch,r3.said])); });

  await sec(5,async()=>{ /* 兩天一夜走 S.dayRound（三格的地點都不能過夜，所以借 D26 審計新村第一次那一套的第二句「現在變成小店。」測同一個機制；測完拿掉）*/
    const village=PT('D26.village'), run=async patch=>{ const G=setup('2026-03-27',AN,{flags:{dating_heroine_01:true}}); G.hour=20;
      if(patch) DATE.SHE_PAYS[AN]['D26.village']=['現在變成小店。'];
      try{ const day=G.day+1, b=DATE.book(G,{who:AN,locs:['D26'],transport:'hsr',day,depart:9,kind:'overnight',by:'player'}); if(!b.ok) return {b,ch:[]};
        const q=OUT.get(G,'date_'+b.trip); G.day=day; G.weekday=(G.weekday+1)%7; G.hour=9; CH.length=0; GM._reset(); H.said=[]; H.picks=['出發','審計新村'];
        await OUT.prompt(GM,q); return {b,t:DATE.trip(G,b.trip),ch:CH.slice(),said:H.said.map(s=>s.t)}; } finally { delete DATE.SHE_PAYS[AN]['D26.village']; } };
    const K0=J(Object.keys(DATE.SHE_PAYS[AN])), a=await run(false), b=await run(true);
    /* 2026-11-11（AA_812@f1fab0ec6）：以安的請客格多了 D29.sculpture、D31.egg（she_pays.js），「還原」改成和測試前一樣（K0）。舊期望：測完 S.SHE_PAYS[以安]＝手寫三格 */
    check('5. 兩天一夜（S.dayRound）同一個機制：審計新村（cost '+village.cost+'）平常扣 100；測試裡把「現在變成小店。」加進 S.SHE_PAYS＝那一次不扣；住宿 2500、車資照扣；測完 S.SHE_PAYS 還原成測試前那幾格（手寫三格＋AA_812 兩格）',a.b.ok&&b.b.ok&&a.t.kind==='overnight'&&village.cost===100&&J(paid(a,'審計新村'))===J([100])&&J(paid(b,'審計新村'))==='[]'&&b.said.includes('現在變成小店。')&&J(paid(b,'住宿'))===J([2500])&&J(paid(a,'交通'))===J(paid(b,'交通'))&&!('shePaid' in b.t)&&J(Object.keys(DATE.SHE_PAYS[AN]))===K0&&JSON.parse(K0).length===Object.keys(SAY).length+Object.keys(SHE_PAYS_DATA.pays[AN]||{}).length,J([a.b&&a.b.why,a.ch,b.ch])); });

  await sec(6,async()=>{ const code=read('src/date3d.js').replace(/\/\*[\s\S]*?\*\//g,''), n=s=>code.split(s).length-1;
    /* 2026-11-11（AA_812@f1fab0ec6 SPLIT）：平分（S.SPLIT）的 S.splitMark 說到平分那一句時清掉 shePaid（最後說的那一句算）＝delete t.shePaid; 多一處；扣錢那一句包在 S.halfOf(…) 裡（tests/date_she_pays_812_1111_unit.js）。
       舊期望：delete t.shePaid; 兩處（S.spotLine 一開始、S.takeShePaid 自己）*/
    check('6. 程式：S.scene、S.dayRound 兩條路都在 S.spotLine 演完的當下 S.takeShePaid 看一次（free?0:S.pointCost）；S.spotLine 一開始清一次（另一處是 S.takeShePaid 自己，第三處是 S.splitMark：她最後說的是平分）；只有 S.playSet 演到她那一句才記；快速約會那一段沒有 free',n('free=S.takeShePaid(t,p.id)')===2&&n('free?0:S.pointCost(p,t)')===2&&n('S.spotLine=async function(GM,t,pid,visits){ delete t.shePaid;')===1&&n('delete t.shePaid;')===3&&n('else if(S.sheSplits(id,pid,text)){ t.sheSplit=pid; delete t.shePaid; }')===1&&n('if(S.shePays(id,pid,ln.text)) t.shePaid=pid;')===1&&/for\(const p of qk\)\{[^}]*\{ const c=S\.pointCost\(p,t\); if\(c\) await S\.pay\(GM,t,c,p\.name\)/.test(code));   /* 2026-11-11：扣錢走 S.pay（錢不夠＝她付，AA 18:58）；舊期望 if(c&&GM.money) */
    check('6. 選單上的價錢（S.pointCost）不看她請不請：茶樓 250、咖啡廳 160、飲料攤 60',DATE.pointCost(PT('D18.teahouse'),{transport:'mrt+coach'})===250&&DATE.pointCost(PT('D06.cafe'),{transport:'mrt'})===160&&DATE.pointCost(PT('D13.drink'),{transport:'mrt'})===60); });

  await sec(7,async()=>{ /* 「她請」那三套有沒有祐廷選「我請」的選項：沒有——三套都沒有 choice、她這三個互動點沒有 opts（DLG-FX-MECH-1110 接在後面的選項）＝同一次不會同時發生 */
    const H3=pid=>NOW.loc[pid.slice(0,3)].lines[AN].hotspots[pid], setOf=pid=>pid==='D06.cafe'?H3(pid).remember:H3(pid).normal[2];
    check('7. 「她請」那三套都沒有選項（choice）、以安這三個互動點沒有 opts——她說要請的那一次，不會再出祐廷「我請」的選項',Object.keys(SAY).every(pid=>!setOf(pid).choice&&!('opts' in H3(pid))),J(Object.keys(SAY).map(pid=>[pid,!!setOf(pid).choice,'opts' in H3(pid)])));
    const tr=[]; for(const pid of Object.keys(SAY)){ const h=H3(pid); for(const k in h) for(const s of [].concat(h[k])) for(const c of ((s&&s.choice)||[])) if(DATE.isTreat(c.t)) tr.push(pid+' '+k+' '+c.t); }
    check('7. 以安在這三個互動點唯一的請客選項：D06 咖啡廳第一次那一套的「我請妳。」（extra 0＝不另外扣她那一份；第 2 節實際演：咖啡廳扣 160，和選「各付各的。」一樣）；D13 飲料攤、D18 茶樓她沒有請客選項',J(tr)===J(['D06.cafe first 「我請妳。」']),J(tr));
    setup('2026-03-28',AN); const r=await go(AN,'D06',['館內的咖啡廳','各付各的','差不多了']);
    check('7. 對照：D06 咖啡廳第一次選「各付各的。」也是扣 160（「我請妳。」和它扣一樣多）',!!r.b.ok&&r.said.includes('好，這樣最清楚。')&&J(paid(r,'館內的咖啡廳'))===J([160])&&!r.ch.some(([l])=>/（請她）/.test(l)),J([r.b.why,r.ch]));
    console.log('（她請客三格：D06.cafe remember「'+SAY['D06.cafe']+'」、D13.drink normal#2「'+SAY['D13.drink']+'」、D18.teahouse normal#2「'+SAY['D18.teahouse']+'」——那一次祐廷那一份 0 元；同一次沒有「我請」選項。以安的「我請妳。」只在 D06 咖啡廳第一次，扣 160＋0）'); });

  /* ===== AA_782（企劃線；學姊七格、沛珊兩格、可昕一格）：資料 ===== */
  const E782=JSON.parse(read('docs/handoff/story_import_allow.json')).files.filter(x=>x.path===SP+'AA_782_she_pays.json'), SHA782=E782.length===1?E782[0].sha:null, A782=SHA782&&JSON.parse(show(SHA782,SP+'AA_782_she_pays.json')||'null'), CELLS=SHE_PAYS_DATA.cells;
  /* 2026-11-11（AA_812@f1fab0ec6）：AA_782 十列裡學姊 D06.cafe.remember、沛珊 D21.street.normal#2 的字被 AA_812 換掉（改稿紀錄 sis_D06／peishan_D21），匯入工具放進 superseded、不在 cells；
     她付全部的句子現在是 AA_812 的新句（tests/date_she_pays_812_1111_unit.js）。SUP＝那兩列 */
  const E812=JSON.parse(read('docs/handoff/story_import_allow.json')).files.filter(x=>x.path===SP+'AA_812_date_pays_promises.json'), SHA812=E812.length===1?E812[0].sha:null, SUP=SHE_PAYS_DATA.superseded||[];
  const PART=k=>{ const m=/^(D\d\d\.\w+)\.(\w+)(?:#(\d+))?$/.exec(k); return {pid:m[1],kind:m[2],k:m[3]==null?null:+m[3]}; };
  /* 格號＝date_rewrite.py list 的順序（同 tests/an_dates_1111_unit.js 的 slots()）*/
  const slots=(d,who)=>{ const out=[], L=d.lines[who], K4=['first','normal','remember','dating'];
    const block=b=>{ if(Array.isArray(b)) b.forEach(block); else if(b&&typeof b==='object'&&'lines' in b){ b.lines.forEach(x=>out.push(x.text)); (b.choice||[]).forEach(c=>{ out.push(c.t); (c.reply||[]).forEach(r=>out.push(r.text)); }); } };
    for(const part of ['arrive','closing']) for(const kind of ['first','normal','dating']) if(L[part]&&kind in L[part]) block(L[part][kind]);
    for(const hs in (L.hotspots||{})){ const X=L.hotspots[hs]; for(const kind of K4) if(kind in X) block(X[kind]); for(const k in X) if(!K4.includes(k)) block(X[k]); }
    const dl=(d.dislikeLine||{})[who]||{}; for(const hs in dl) out.push(dl[hs]); return out; };
  await sec(8,async()=>{
    check('8. 白名單 AA_782_she_pays.json 一筆、approved、有 approvedBy、task DLG-FULL-REVIEW-1110；she_pays.js 的來源寫著同一版',E782.length===1&&E782[0].status==='approved'&&!!E782[0].approvedBy&&E782[0].task==='DLG-FULL-REVIEW-1110'&&SHE_PAYS_DATA.src===SP+'AA_782_she_pays.json@'+SHA782+'＋'+SP+'AA_812_date_pays_promises.json@'+SHA812,J(E782.map(x=>[x.sha,x.status])));   /* 2026-11-11（AA_812@f1fab0ec6）：來源多 AA_812。舊期望：src＝AA_782 那一版 */
    const r=cp.spawnSync('python3',[path.join(H.ROOT,'tools/date/import_she_pays.py'),'--check'],{encoding:'utf8',timeout:120000});
    check('8. src/data/she_pays.js 和重匯一致（tools/date/import_she_pays.py --check；匯入工具逐列對 date_lines.js、格號、剛好一處）',r.status===0,(r.stdout||r.stderr||'').slice(-200));
    /* 2026-11-11（AA_812@f1fab0ec6）：十列＝cells 八列＋superseded 兩列（各自照稿的順序）。舊期望：十列＝cells */
    /* 2026-11-11 18:58（AA 決定）：沛珊 D31.egg 拿掉＝在 dropped。十列＝cells 七列＋superseded 兩列＋dropped 一列。舊期望：cells 八列＋superseded 兩列 */
    if(A782){ const DROP=(typeof SHE_PAYS_DATA!=='undefined'&&SHE_PAYS_DATA.dropped)||[], isSup=x=>SUP.some(y=>y.who===x.who&&y.key===x.key), isDrop=x=>DROP.some(y=>y.who===x.who&&y.key===x.key), row=x=>[x.who,x.loc,x.n,x.key,x.text];
      check('8. 稿 AA_782@'+SHA782+' 十列＝she_pays.js 的 cells（七列）＋superseded（兩列：被 AA_812 換了字）＋dropped（一列：AA 決定不算）（who、loc、格號、key、字，一列一格、同樣的順序）',A782.she_pays.length===10&&J(A782.she_pays.filter(x=>!isSup(x)&&!isDrop(x)).map(row))===J(CELLS.map(row))&&J(A782.she_pays.filter(isSup).map(row))===J(SUP.map(row))&&J(A782.she_pays.filter(isDrop).map(row))===J(DROP.map(row)),J(A782.she_pays.map(x=>x.key))); }
    else console.log('（這份 checkout 讀不到企劃線的 AA_782：不比稿，只驗 she_pays.js 和 date_lines.js）');
    /* 2026-11-11（AA_812@f1fab0ec6）：學姊 D06.cafe.remember、沛珊 D21.street.normal#2 移到 superseded（字換成 AA_812 的新句：「這次我請。你坐著就好。」「你要吃什麼？這攤我請。」）。
       舊期望：cells＝十格（學姊七格、沛珊兩格、可昕一格）*/
    check('8. 十格：留在 cells 七格——學姊六格（D10.snack.remember、D20.street.normal#0、D22.fish.first、D22.fish.remember、D23.cook.first、D30.stall.remember）、可昕一格（D30.stall.remember）；沛珊 D31.egg.normal#2 AA 拿掉（11-11 18:58 照 AA_812「只多買一顆蛋的不算」，在 dropped；舊期望八格）；被 AA_812 取代兩格（學姊 D06.cafe.remember、沛珊 D21.street.normal#2，舊字已經不在遊戲裡）',
      J(CELLS.map(x=>x.who+' '+x.key))===J(['D10.snack.remember','D20.street.normal#0','D22.fish.first','D22.fish.remember','D23.cook.first','D30.stall.remember'].map(k=>SIS+' '+k).concat([KX+' D30.stall.remember']))&&J(((typeof SHE_PAYS_DATA!=='undefined'&&SHE_PAYS_DATA.dropped)||[]).map(x=>x.who+' '+x.key))===J([PS+' D31.egg.normal#2'])
      &&J(SUP.map(x=>[x.who,x.key,x.text,x.now]))===J([[SIS,'D06.cafe.remember','上次你請的。這次我請。',['這次我請。你坐著就好。']],[PS,'D21.street.normal#2','你要吃什麼？我請你，上次是你請的。',['你要吃什麼？這攤我請。']]])
      &&SUP.every(x=>!JSON.stringify(NOW).includes(JSON.stringify(x.text))),J([CELLS.map(x=>x.who+' '+x.key),SUP]));
    const bad=[];
    for(const c of CELLS){ const {pid,kind,k}=PART(c.key), h=((((NOW.loc[c.loc]||{}).lines||{})[c.who]||{}).hotspots||{})[pid], L=leaves(h,'',{}), at=Object.keys(L).filter(p=>L[p]===c.text), want='/'+kind+(k==null?'':'/'+k)+'/lines/';
      if(pid.slice(0,3)!==c.loc) bad.push(c.key+' 地點');
      if(at.length!==1) bad.push(c.who+' '+c.key+' 在她那個互動點底下 '+at.length+' 處');
      else { if(!at[0].startsWith(want)||!/\/lines\/\d+\/text$/.test(at[0])) bad.push(c.who+' '+c.key+' 位置 '+at[0]); if(getAt(h,at[0].replace(/\/text$/,'/who'))!==c.who) bad.push(c.who+' '+c.key+' 不是她說的'); if(c.at!=='/loc/'+c.loc+'/lines/'+c.who+'/hotspots/'+pid+at[0]) bad.push(c.who+' '+c.key+' at '+c.at); }
      if(slots(NOW.loc[c.loc],c.who)[c.n-1]!==c.text) bad.push(c.who+' '+c.loc+'#'+c.n+' 格號那一格是「'+slots(NOW.loc[c.loc],c.who)[c.n-1]+'」'); }
    check('8. 每一格：字在 date_lines.js 她那個互動點底下剛好一處、就在 key 那一套她說的台詞（不是選項、回話）、格號（date_rewrite.py list）那一格就是這一句',bad.length===0,J(bad));
    const SPY=DATE.SHE_PAYS, n=Object.values(SPY).reduce((a,o)=>a+Object.values(o).reduce((b,v)=>b+v.length,0),0);
    /* 2026-11-11（AA_812@f1fab0ec6）：S.SHE_PAYS＝以安手寫三句＋AA_782 留下的八句＋AA_812 新的十一句（AA_812 十八句裡七句和 AA_782 重複）＝22 句；被取代的兩句認不得。舊期望：以安三句＋十句＝13 */
    check('8. S.SHE_PAYS＝以安三句＋AA_782 七句（沛珊 D31.egg AA 拿掉）＋AA_812 十二句（學姊 D22.fish 兩句：first、remember 同一個互動點；2026-11-13 AA_946 加可昕 D23.market，舊期望十一句／21）；每一格 S.shePays 認得；被 AA_812 取代的兩句不認得',n===22&&DATE.shePays('kexin','D23.market','這次飲料我買。給你一杯。')&&CELLS.every(c=>DATE.shePays(c.who,PART(c.key).pid,c.text))&&SUP.every(c=>!DATE.shePays(c.who,c.pid,c.text))&&J(SPY[SIS]['D22.fish'])===J(['（活魚料理）這家我請。你不要搶。','今天這家，還是我請。']),J(SPY));
    check('8. S.shePays 只認那個人＋那個互動點＋整句：學姊 D30 那一句可昕說不算、可昕 D30 那一句學姊說不算；學姊 D06 那一句搬到 D10 不算；多一個字不算',
      !DATE.shePays(KX,'D30.stall','這攤還在。今天兩杯都我付。')&&!DATE.shePays(SIS,'D30.stall','烤玉米這攤還在。這次我付。')&&!DATE.shePays(SIS,'D10.snack','上次你請的。這次我請。')&&!DATE.shePays(SIS,'D10.snack','這次我請。。')&&!DATE.shePays(PS,'D21.street',null)&&!DATE.shePays(SIS,null,'這次我請。'));
    const zq=((NOW.loc.D06.lines[ZQ].hotspots['D06.cafe']||{}).remember||{}).lines||[];
    /* 2026-11-11（AA_812@f1fab0ec6）：子晴 D06.cafe remember 改成「這家我來過兩次了。這次我請，你不要算。」（改稿紀錄 zq_D06 第 45 格）＝她請客；語彤也有三格（D10.boat、D12.pier、D15.store）。
       舊期望：子晴 remember 是「我說過要請你吃滷味，等一下去」那一句、不是請客格；子晴、語彤、芷若都沒有請客格 */
    check('8. 沒列的照扣：芷若沒有請客格；子晴只有 AA_812 的 D06.cafe remember 那一句（滷味拿掉了）、語彤只有 AA_812 的三格',!SPY[ZR]&&J(SPY[ZQ])===J({'D06.cafe':['這家我來過兩次了。這次我請，你不要算。']})&&J(Object.keys(SPY[YT]||{}))===J(['D10.boat','D12.pier','D15.store'])&&!zq.some(x=>/滷味/.test(x.text||''))&&zq.some(x=>x.text==='這家我來過兩次了。這次我請，你不要算。'),J(zq.map(x=>x.text)));
    /* 她說要請的那一套有沒有祐廷「我請」的選項：學姊 D22.fish、D23.cook 的 first 有選項（「那我請飲料。」「下次我請。」「我們平分。」），都不是請客選項（S.isTreat）＝不另外扣她那一份；其他八套沒有選項。互動點都沒有 opts */
    const ch=CELLS.map(c=>{ const {pid,kind,k}=PART(c.key), h=NOW.loc[c.loc].lines[c.who].hotspots[pid], s=k==null?h[kind]:h[kind][k]; return {key:c.who+' '+c.key,ch:(s.choice||[]).map(x=>x.t),opts:'opts' in h}; });
    check('8. 那八套（AA_782 留在 cells 的；2026-11-11 AA_812 以前是十套，被取代的兩套也沒有選項）裡祐廷的選項：只有學姊 D22.fish.first（「那我請飲料。」「我們平分。」）、D23.cook.first（「下次我請。」「我們平分。」）有，都不是請客選項（S.isTreat）；十個互動點都沒有 opts',
      J(ch.filter(x=>x.ch.length).map(x=>[x.key,x.ch]))===J([[SIS+' D22.fish.first',['「那我請飲料。」','「我們平分。」']],[SIS+' D23.cook.first',['「下次我請。」','「我們平分。」']]])&&ch.every(x=>x.ch.every(t=>!DATE.isTreat(t))&&!x.opts),J(ch)); });

  /* ===== AA_782：十格逐格演（DATE.book → OUT.prompt 整趟）：演到那一句那一次那個互動點不扣；同一個互動點別套照扣 =====
     第一次（first）＝沒去過；remember＝上一次點過這個互動點（第二次去）；normal#k＝去過兩次、上一次沒點、前面幾套剛用過（輪替記憶 recent）。
     D30、D31 只能兩天一夜（S.dayRound）：第 6 階（沒交往，演 normal、不演 dating）；其他當天來回。學姊、沛珊、可昕都 CLOSE；normal 第三套（tier high）要第 6 階 */
  const force=(G,who,loc,pid,kind,k)=>{ const m=DATE.mem(G,who,loc), Lg=DATE.log(G,who);
    if(kind==='first'){ m.picks=[]; m.last=[]; m.recent=[]; Lg.byLoc[loc]=0; }
    else if(kind==='remember'){ m.picks=[pid]; m.last=[pid]; m.recent=[]; Lg.byLoc[loc]=1; }
    else { m.picks=[pid]; m.last=[]; m.recent=Array.from({length:k},(_,i)=>pid+'.normal#'+i); Lg.byLoc[loc]=2; } };
  const ovGo=async(who,loc,pick)=>{ const G=H.G; G.hour=20; const day=G.day+1, tr=(DATE.loc(loc).transport||[])[0].mode, b=DATE.book(G,{who,locs:[loc],transport:tr,day,depart:9,kind:'overnight',by:'player'}); if(!b.ok) return {b,ch:[],said:[]};
    const q=OUT.get(G,'date_'+b.trip); G.day=day; G.weekday=(G.weekday+1)%7; G.hour=9; CH.length=0; GM._reset(); H.said=[]; H.opts=[]; H.picks=['出發',pick];
    await OUT.prompt(GM,q); return {b,t:DATE.trip(G,b.trip),ch:CH.slice(),said:H.said.filter(s=>s.who===nameOf(who)).map(s=>s.t)}; };
  await sec(9,async()=>{
    for(const c of CELLS){ const {pid,kind,k}=PART(c.key), P=PT(pid), ov=(DATE.loc(c.loc).kinds||[]).includes('overnight')&&!(DATE.loc(c.loc).kinds||[]).includes('half'), hi=kind==='normal'&&k===2||ov, w='9. '+nameOf(c.who)+' '+c.key+'（'+P.name+' cost '+P.cost+'）';
      const run=async(fk,fkk,pk)=>{ setup(ov?(c.who===PS?'2026-03-20':'2026-03-27'):'2026-03-28',c.who,hi?{rom:60}:{}); force(   /* 沛珊隔週回台中：3/28 那個週末她不在臺北（兩天一夜改 3/21 出發）*/H.G,c.who,c.loc,pid,fk,fkk); return ov?ovGo(c.who,c.loc,P.name):go(c.who,c.loc,['自己選',P.name].concat(pk||[],['差不多了']),{depart:c.who===ZQ?15:10}); };
      /* 2026-11-11（AA_812@f1fab0ec6 SPLIT）：學姊 D22.fish 第一次選「那我請飲料。」她回「好。飯我請，飲料你請。」＝平分（最後說的那一句算，扣一半；tests/date_she_pays_812_1111_unit.js）——
         這裡選另一個「我們平分。」（她回「好。你堅持的話。」，不在 SPLIT）測「這家我請」那一句不扣。舊期望：選單一律選第一個（那時「那我請飲料。」也不扣）*/
      const a=await run(kind,k,c.who===SIS&&c.key==='D22.fish.first'?['我們平分']:[]);
      /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：學姊 D22.fish 第一次選「我們平分。」她回「好。你堅持的話。」——這一句也進了 SPLIT＝最後說的是平分，活魚料理扣一半（300→150；兩個選項都是平分，「這家我請」那一句這一套都會被後面的平分蓋過）。
         舊期望：選「我們平分。」（那時不在 SPLIT）＝最後說的請客句還是「這家我請」，活魚料理不扣 */
      const sp22=c.who===SIS&&c.key==='D22.fish.first';
      if(sp22) check(w+'：演到「'+c.text+'」那一次、選「我們平分。」她回「你堅持的話。」（AA_812@633b7f7d6 進了 SPLIT）——最後說的是平分＝'+P.name+'扣一半 '+Math.round(P.cost/2)+'（'+P.cost+' 的一半）；行程物件上沒有留下 shePaid／sheSplit',!!a.b.ok&&a.said.filter(x=>x===c.text).length===1&&a.said.includes('你堅持的話。')&&P.cost===300&&J(paid(a,P.name))===J([150])&&!('shePaid' in (a.t||{}))&&!('sheSplit' in (a.t||{})),J([a.b.why,a.ch,a.said.slice(0,4)]));   /* 2026-11-12（X324「好」開頭回話 AA_842@41f77eab53，date_src_sha.js HAO_1112）：這幾句回話 AA 拿掉了開頭的「好。」，src/data/she_pays.js 跟著換（tools/date/import_she_pays.py REWORD）。舊期望：「好。你堅持的話。」 */
      else check(w+'：演到「'+c.text+'」那一次——'+P.name+'不扣'+(ov?'（兩天一夜 S.dayRound）':'')+'；行程物件上沒有留下 shePaid',!!a.b.ok&&a.said.filter(x=>x===c.text).length===1&&J(paid(a,P.name))==='[]'&&!('shePaid' in (a.t||{})),J([a.b.why,a.ch,a.said.slice(0,4)]));
      /* 別套：first、remember 的格＝輪 normal 第一套；normal#k 的格＝輪 normal 第一套（k＝0 的輪第二套）*/
      const ok2=kind==='normal'&&k===0?1:0, b=await run('normal',ok2), other=(NOW.loc[c.loc].lines[c.who].hotspots[pid].normal[ok2].lines||[]).filter(x=>x.who===c.who).map(x=>x.text);
      check(w+'：同一個互動點演別套（normal 第 '+(ok2+1)+' 套「'+other.join('')+'」）——照扣 '+P.cost,!!b.b.ok&&other.length>0&&other.every(x=>b.said.includes(x))&&!b.said.includes(c.text)&&J(paid(b,P.name))===J([P.cost]),J([b.b.why,b.ch,b.said.slice(0,4)])); } });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
