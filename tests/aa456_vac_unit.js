// AA_456 法律系寒暑假再讀一遍：每年一字不差的訊息改成照年份（企劃線 71f260ecc，AA-B 2026-10-25 08:2x；D99 第二優先：寒暑假）——不需要瀏覽器。台詞逐字對 AA_456（從企劃線 git show 讀稿、解析表格）。
//   0   讀稿（六張表都讀得到）；資料照年份寫（NOODLE_CLOSED.L.a／d、VAC.C01F_REPLY、GF 的 invByTerm、zq2.msgs 四組）
//   1-1 跨年阿哲「宿委會…」那一句：大一「宿委會說頂樓會開。…」、大二原句、大三、大四換；群組、私訊都換；tag nye_y?_ask 不變；舊存檔收過不重發
//   1-2 麵店過年店休：店休第一天 21:00（A）、初四 12:00（D）照年份，2026 原句；tag noodle_closed_a_／d_<年> 不變；舊存檔收過不重發
//   1-3 寒假海邊「大二以後才第一次揪」：Alison 兩句、柏翰、芯慈、以安照 Y2、Y3、Y4 換（大一照舊）；tag vac_c01first_<Y>(_i) 不變；舊存檔收過不重發
//   1-4 阿哲海邊那天 21:00「明天回高雄」大二、大三、大四換字（大一「我明天回高雄，寒假一樣揪喔」照舊）；tag 不變；舊存檔收過不重發
//   1-5 女朋友的學期末約會：邀約那一句照 invByTerm（以安、語彤、學姊、子晴、沛珊；芷若 over 前三筆）；沒寫的學期照 invite、over 寫的照 over；實際手機那一則、tag te_gf_<學期>_<她> 不變；舊存檔收過不重發
//   1-6 子晴裂縫談話②：開頭兩則照第幾個月輪流（第 1 個月原句、第 5 個月起從第 1 組再輪）；選項、回覆不變；tag ct_zq2_<年-月> 不變；舊存檔已經收過幾個月照算、收過的那個月不重發
// 修改前（開發分支 f6ac4e029）：1-1～1-6 每一節至少一項 FAIL（第 0 項的資料檢查也 FAIL）。用法：node tests/aa456_vac_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(NOODLE_CLOSED|HOLFF|MSG|MSG_POOL|MSG2_POOL|ZRUK|EXCH|R2Y4A|R2Y4A_EVENTS|CRACKTALK|CRACKTALK_LINES)$/;
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/noodle_closed3d.js','src/holff3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js','src/exchange3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js']) L3(f);   /* 照 v6_crack_unit.js、noodle_closed_unit.js、holiday_ff_unit.js 載的檔 */
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{};
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const fresh=(k,h,flags)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,'dorm',flags||{}); G.outings=[]; G.acts={att:{}}; PHONE.rec(G); E.player.busy=false; E.paused=false; return G; };
const at=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ H.G.hour=+h.toFixed(3); rules(); } };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const tx=tag=>byTag(tag).map(m=>m.text);
const meet=(...ids)=>ids.forEach(id=>SOCIAL.remember(id,'FIRST_MET',''));
const grp=()=>PHONE.join(H.G,'noodle_team','麵店團');
const oldMsg=(tag,th,from,text,d,h)=>{ PHONE.rec(H.G); H.G.msgs.push({th,from,text,tag,day:d,h}); };   /* 舊存檔：這一則已經用舊的字收過了 */

/* ---- 讀稿（企劃線 71f260ecc）---- */
let doc=''; try{ doc=cp.execSync('git show 71f260ecc:"docs/story_planning/AA_456_法律系寒暑假再讀一遍_每年一字不差的訊息.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const part=(a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const rows=t=>t.split('\n').filter(l=>/^\|/.test(l.trim())&&!/^\|\s*-/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const ORIG=/（原句）$/, orig=s=>s.replace(ORIG,'').trim(), cut=s=>orig(s).split('／').map(orig);
const YN={一:1,二:2,三:3,四:4};
const X11={}; for(const r of rows(part('### 1-1','### 1-2'))){ const m=/^大([一二三四])$/.exec(r[0]); if(m) X11[YN[m[1]]]=orig(r[1]); }
const X12={}; for(const r of rows(part('### 1-2','### 1-3'))) if(/^20\d\d$/.test(r[0])) X12[r[0]]={a:cut(r[1]),d:cut(r[2])};
const X13={}; for(const r of rows(part('### 1-3','### 1-4'))){ const m=/^大([二三四])$/.exec(r[0]); if(m) X13['Y'+YN[m[1]]]=cut(r[1]).concat([orig(r[2]),orig(r[3]),orig(r[4])]); }
const X14={}; for(const m of part('### 1-4','### 1-5').matchAll(/- 大([二三四])：([^（\n]+)/g)) X14['Y'+YN[m[1]]]=m[2].trim();
const WHO={以安:'heroine_01',語彤:'heroine_03',學姊:'heroine_05',子晴:'heroine_04',沛珊:'classmate_peishan',芷若:'heroine_02'};
const X15=[]; { let cur=null; for(const r of rows(part('### 1-5','### 1-6'))){ if(r.length<3) continue; if(r[0]) cur=WHO[r[0]]||null; const m=/^大([一二三四])([上下])/.exec(r[1]); if(!cur||!m||/^照現在/.test(r[2])) continue;
  X15.push({who:cur,term:'Y'+YN[m[1]]+(m[2]==='上'?'S1':'S2'),line:orig(r[2]),orig:ORIG.test(r[2])}); } }
const X16=[]; for(const r of rows(part('### 1-6','## 2.'))) if(/^\d$/.test(r[0])) X16[+r[0]-1]=cut(r[1]);
const OLD11='宿委會今年也開頂樓。訪客一樓登記，十二點半前要走。';

(async()=>{
/* ---- 0 ---- */
await sec(0,()=>{
  check('0. 讀得到稿、新檔載得到（NOODLE_CLOSED、HOLFF、CRACKTALK）',!!doc&&!loadErr.length&&typeof NOODLE_CLOSED!=='undefined'&&typeof HOLFF!=='undefined'&&typeof CRACKTALK!=='undefined',J(loadErr));
  check('0. 稿裡六張表都讀得到（1-1 四年、1-2 四年、1-3 三年、1-4 三年、1-5 36 句、1-6 四組）',Object.keys(X11).length===4&&X11[2]===OLD11&&Object.keys(X12).length===4&&X12[2026].a.length===2&&Object.keys(X13).length===3&&X13.Y2.length===5&&Object.keys(X14).length===3&&X15.length===36&&X16.length===4&&X16.every(x=>x&&x.length===2),
    J({X11,X12:Object.keys(X12),X13,X14,n15:X15.length,X16}));
  const GF=TERMEND_LINES.GF, M2=CRACKTALK_LINES.SRC2&&CRACKTALK_LINES.SRC2.zq2?CRACKTALK_LINES.SRC2.zq2.msgs:null;
  check('0. 資料照年份寫：NOODLE_CLOSED.L.a／d 是 {年:[…]}、VAC.C01F_REPLY 有 Y2～Y4、GF 五個人有 invByTerm、zq2.msgs 是四組',
    !Array.isArray(NOODLE_CLOSED.L.a)&&!Array.isArray(NOODLE_CLOSED.L.d)&&Object.keys(NOODLE_CLOSED.L.a).length===4&&!!VAC.C01F_REPLY&&['Y2','Y3','Y4'].every(k=>Array.isArray(VAC.C01F_REPLY[k]))
    &&['heroine_01','heroine_03','heroine_05','heroine_04','classmate_peishan'].every(id=>!!GF[id].invByTerm)&&Array.isArray(M2)&&M2.length===4&&M2.every(Array.isArray),J({a:NOODLE_CLOSED.L.a,c:typeof VAC.C01F_REPLY,M2}));
});
/* ---- 1-1 跨年阿哲「宿委會…」---- */
await sec('1-1',()=>{
  const Y={1:{day:'2025-12-26',tag:'nye_y1_ask'},2:{day:'2026-12-31',tag:'nye_y2_ask'},3:{day:'2027-12-31',tag:'nye_y3_ask'},4:{day:'2028-12-31',tag:'nye_y4_ask'}}, got={}, all={};
  for(const y of [1,2,3,4]) for(const g of [true,false]){ fresh(Y[y].day,20.9); meet('zhe','yu','classmate_bohan','classmate_xinci'); H.FAMILIAR('zhe'); if(g) grp(); run(20.9,21.3);
    const th=g?'g:noodle_team':'p:zhe', z=byTag(Y[y].tag).filter(m=>m.from==='zhe'&&m.th===th).map(m=>m.text); got[y+(g?'g':'p')]=z; all[y+(g?'g':'p')]=(H.G.msgs||[]).map(m=>m.text); }
  const has=(k,t)=>(got[k]||[]).includes(t);
  check('1-1. 大一 12/26 21:00（群組、私訊）：阿哲「'+X11[1]+'」（稿：大一那一年說「今年也」怪）；tag nye_y1_ask',has('1g',X11[1])&&has('1p',X11[1]),J({g:got['1g'],p:got['1p']}));
  check('1-1. 大二 12/31 21:00（群組、私訊）：原句「'+OLD11+'」；tag nye_y2_ask',has('2g',OLD11)&&has('2p',OLD11),J({g:got['2g'],p:got['2p']}));
  check('1-1. 大三 12/31 21:00（群組、私訊）：「'+X11[3]+'」；tag nye_y3_ask',has('3g',X11[3])&&has('3p',X11[3]),J({g:got['3g'],p:got['3p']}));
  check('1-1. 大四 12/31 21:00（群組、私訊）：「'+X11[4]+'」；tag nye_y4_ask',has('4g',X11[4])&&has('4p',X11[4]),J({g:got['4g'],p:got['4p']}));
  const leak=Object.keys(all).filter(k=>!/^2/.test(k)&&all[k].includes(OLD11));
  check('1-1. 原句只留在大二（大一、大三、大四的群組、私訊都沒有「宿委會今年也開頂樓…」）',!leak.length,J(leak));
  fresh(Y[3].day,21.2); meet('zhe'); H.FAMILIAR('zhe'); grp(); oldMsg('nye_y3_ask','g:noodle_team','zhe',OLD11,D(Y[3].day),21); run(21.2,21.6);
  check('1-1. 舊存檔大三那一則已經收過（舊的字）：不重發、沒有新的那一句',byTag('nye_y3_ask').length===1&&!(H.G.msgs||[]).some(m=>m.text===X11[3]),J(tx('nye_y3_ask')));
});
/* ---- 1-2 麵店過年店休 ---- */
await sec('1-2',()=>{
  const got={};
  for(const y of ['2026','2027','2028','2029']){ const W=NOODLE_CLOSED.window(D(NOODLE_CLOSED.CNY[y])); fresh(W.from,20.9); grp(); run(20.9,21.2); const a=byTag('noodle_closed_a_'+y);
    at(W.open,11.9); run(11.9,12.2); const d=byTag('noodle_closed_d_'+y);
    got[y]={a:a.map(m=>m.text),d:d.map(m=>m.text),ok:a.concat(d).every(m=>m.from==='heroine_03'&&m.th==='g:noodle_team'),at:[keyOf(W.from),keyOf(W.open)]}; }
  for(const y of ['2026','2027','2028','2029']) check('1-2. '+y+'：店休第一天（'+got[y].at[0].slice(5)+'）21:00「'+(X12[y]||{a:[]}).a.join('／')+'」、初四（'+got[y].at[1].slice(5)+'）12:00「'+(X12[y]||{d:[]}).d.join('／')+'」（語彤、麵店團群組）',
    !!X12[y]&&J(got[y].a)===J(X12[y].a)&&J(got[y].d)===J(X12[y].d)&&got[y].ok,J(got[y]));
  const keep=Object.keys(got).filter(y=>got[y].a.includes('阿姨說要大掃除。想吃麵的，初四以後。')||got[y].d.includes('阿姨說，今天第一碗加蛋。'));
  check('1-2. 原句只留在 2026',J(keep)===J(['2026']),J(keep));
  const W=NOODLE_CLOSED.window(D(NOODLE_CLOSED.CNY['2027'])); fresh(W.from,21.2); grp(); oldMsg('noodle_closed_a_2027','g:noodle_team','heroine_03','阿姨說要大掃除。想吃麵的，初四以後。',W.from,21); run(21.2,21.5);
  check('1-2. 舊存檔 2027 店休那一則已經收過（舊的字）：不重發',byTag('noodle_closed_a_2027').length===1&&!(H.G.msgs||[]).some(m=>m.text===X12['2027'].a[1]),J(tx('noodle_closed_a_2027')));
});
/* ---- 1-3 寒假海邊「第一次揪」---- */
await sec('1-3',()=>{
  const got={};
  for(const yk of ['Y2','Y3','Y4']){ const d=VAC.c01Day(yk), da=VAC.c01Ask(d); fresh(da,20.9); grp(); meet('zhe','yu','classmate_bohan','classmate_xinci'); H.FAMILIAR('heroine_01'); run(20.9,21.8);
    const M=(H.G.msgs||[]).filter(m=>/^vac_c01first_Y\d(_\d)?$/.test(m.tag||'')&&m.tag.slice(13,15)===yk);
    got[yk]={t:M.map(m=>m.from+':'+m.text),tags:M.map(m=>m.tag),day:keyOf(da)}; }
  for(const yk of ['Y2','Y3','Y4']){ const R=X13[yk]||[], want=['yu:'+R[0],'yu:'+R[1],'classmate_bohan:'+R[2],'classmate_xinci:'+R[3],'heroine_01:'+R[4]], g=got[yk];
    check('1-3. '+yk.replace('Y','大').replace('2','二').replace('3','三').replace('4','四')+'（'+g.day.slice(5)+' 揪）一直沒去過：阿哲那句照 C01.first，之後「'+R.slice(0,4).join('」「')+'」、以安 FAMILIAR 在臺北「'+R[4]+'」；tag vac_c01first_'+yk+'_0～4、最後一則 vac_c01first_'+yk,
      R.length===5&&g.t.length===6&&/^zhe:禮拜[一二]去海邊？過幾天我就回高雄了$/.test(g.t[0])&&J(g.t.slice(1))===J(want)&&J(g.tags)===J([0,1,2,3,4].map(i=>'vac_c01first_'+yk+'_'+i).concat(['vac_c01first_'+yk])),J(g)); }
  const OLDS=['冬天去海邊？？','火車九點十分有一班。','我怕冷，我不去了。你們拍照。'], leak=['Y2','Y3','Y4'].filter(yk=>got[yk].t.some(t=>OLDS.some(o=>t.endsWith(':'+o))));
  check('1-3. 大二～大四沒有大一那幾句（「冬天去海邊？？」「火車九點十分有一班。」「我怕冷，我不去了。你們拍照。」）；以安「我可以。幾點集合？」只在大四（原句）',!leak.length&&!got.Y2.t.includes('heroine_01:我可以。幾點集合？')&&!got.Y3.t.includes('heroine_01:我可以。幾點集合？')&&got.Y4.t.includes('heroine_01:我可以。幾點集合？'),J(leak));
  fresh('2025-12-26',20.9); grp(); meet('zhe','yu','classmate_bohan','classmate_xinci'); H.FAMILIAR('heroine_01'); run(20.9,21.8); const y1=(H.G.msgs||[]).filter(m=>m.th==='g:noodle_team').map(m=>m.from+':'+m.text);
  check('1-3. 大一照舊（story3d.js va03）：「冬天去海邊？？」「好啊」「火車九點十分有一班。」「我怕冷，我不去了。你們拍照。」「我可以。幾點集合？」',['yu:冬天去海邊？？','yu:好啊','classmate_bohan:火車九點十分有一班。','classmate_xinci:我怕冷，我不去了。你們拍照。','heroine_01:我可以。幾點集合？'].every(t=>y1.includes(t)),J(y1));
  const d3=VAC.c01Day('Y3'), a3=VAC.c01Ask(d3); fresh(a3,21.9); grp(); H.FAMILIAR('heroine_01'); oldMsg('vac_c01first_Y3','g:noodle_team','heroine_01','我可以。幾點集合？',a3,21+40/60); run(21.9,22.2);
  check('1-3. 舊存檔大三那一串已經收過（舊的字）：不重發',!(H.G.msgs||[]).some(m=>/^vac_c01first_Y3_\d$/.test(m.tag||''))&&byTag('vac_c01first_Y3').length===1,J((H.G.msgs||[]).filter(m=>/vac_c01first/.test(m.tag||'')).map(m=>m.tag)));
});
/* ---- 1-4 阿哲「明天回高雄」---- */
await sec('1-4',()=>{
  fresh('2026-01-01',19.9); grp(); meet('zhe'); run(19.9,20.2);
  check('1-4. 大一照舊：1/1 20:00「我明天回高雄，寒假一樣揪喔」（nye_zhe_y1）',J(tx('nye_zhe_y1'))===J(['我明天回高雄，寒假一樣揪喔']),J(tx('nye_zhe_y1')));
  const T4={Y2:'nye_y2_zhe',Y3:'hol_y3w_zhe_home',Y4:'hol_y4w_zhe_home'}, got={};
  for(const yk of ['Y2','Y3','Y4']){ const d=VAC.c01Day(yk); fresh(d,20.9); grp(); meet('zhe'); run(20.9,21.2); const M=byTag(T4[yk]); got[yk]={t:M.map(m=>m.text),ok:M.every(m=>m.from==='zhe'&&m.th==='g:noodle_team'&&m.day===d),day:keyOf(d)}; }
  for(const yk of ['Y2','Y3','Y4']) check('1-4. '+yk+' 海邊那天（'+got[yk].day.slice(5)+'）21:00 阿哲「'+X14[yk]+'」（麵店團；tag '+T4[yk]+' 不變）',!!X14[yk]&&J(got[yk].t)===J([X14[yk]])&&got[yk].ok,J(got[yk]));
  check('1-4. 大二～大四不再是「我明天回高雄」',!['Y2','Y3','Y4'].some(yk=>got[yk].t.includes('我明天回高雄')),J(got));
  const d2=VAC.c01Day('Y2'); fresh(d2,21.2); grp(); oldMsg('nye_y2_zhe','g:noodle_team','zhe','我明天回高雄',d2,21); run(21.2,21.5);
  const d3=VAC.c01Day('Y3'), n2=byTag('nye_y2_zhe').length; fresh(d3,21.2); grp(); oldMsg('hol_y3w_zhe_home','g:noodle_team','zhe','我明天回高雄',d3,21); run(21.2,21.5);
  check('1-4. 舊存檔大二、大三那一則已經收過（舊的字）：不重發',n2===1&&byTag('hol_y3w_zhe_home').length===1,J([n2,tx('hol_y3w_zhe_home')]));
});
/* ---- 1-5 女朋友的學期末約會：邀約那一句 ---- */
await sec('1-5',()=>{
  fresh('2026-06-11',12); const G=H.G, inv=(id,t)=>{ const g=TERMEND.gf(id,t); if(!g) return null; return typeof g.invite==='function'?g.invite(G):g.invite; };
  const bad=X15.filter(x=>inv(x.who,x.term)!==x.line).map(x=>[x.who,x.term,inv(x.who,x.term),x.line]);
  check('1-5. 稿裡 36 句（以安 6、語彤 7、學姊 6、子晴 7、沛珊 7、芷若 over 前三筆）：TERMEND.gf(她,學期).invite 一字不差',X15.length===36&&!bad.length,J(bad));
  const zr=['Y1S1','Y1S2','Y2S1'].map(t=>TERMEND.gf('heroine_02',t)), ps=TERMEND.gf('classmate_peishan','Y3S1');
  check('1-5. 芷若前三學期照舊 22:00、週五；沛珊大三上照舊在台南（over 的地點留著）',zr.every(g=>g.h===22&&(g.wd||5)===5)&&ps.place==='eatery_tn',J([zr.map(g=>g.h),ps.place]));
  const dup=Object.values(WHO).filter(id=>{ const L=X15.filter(x=>x.who===id).map(x=>inv(x.who,x.term)); return new Set(L).size!==L.length; });
  check('1-5. 每個人稿裡的每一學期都不一樣（原句只留在稿說保留的學期）',!dup.length&&X15.filter(x=>x.orig).length===7,J(dup));
  const FB=[['heroine_01','Y3S2','考完了。……今天不讀書，你也不准讀。'],['heroine_05','Y1S1','考完了吧？今天晚上我空著。法圖旁邊那家。'],['heroine_03','Y5S1','打烊以後。我煮。'],['heroine_01','Y5S1','你實習結束了吧。……今天我訂位子。'],['heroine_05','Y5S1','你實習結束了吧？今天晚上我空著。法圖旁邊那家。'],['heroine_04','Y5S1','你實習完了吧 宵夜 我想吃兩份'],['classmate_peishan','Y5S1','學期結束了吧！你下來，我們吃熱的。'],['heroine_02','Y2S2','禮拜五晚上，我們去吃宵夜。……我現在不用上班了。'],['heroine_02','Y3S2','禮拜四十點，等我下班。']];
  const fb=FB.filter(([id,t,s])=>inv(id,t)!==s).map(([id,t,s])=>[id,t,inv(id,t)]);
  check('1-5. 稿沒寫的學期照 invite（以安大三下、學姊大一上、語彤大五上）；over 寫的照 over（大五上四人、芷若大二下、大三下）',!fb.length,J(fb));
  /* 實際手機：交往中，約會當天 12:00 那一則（AA_378 #3） */
  const flow=(id,term,pre)=>{ const w=TERMEND.windowOf(term); fresh(w.from,20,{['dating_'+id]:true}); H.CLOSE(id); if(pre) pre(w); run(20,21);
    for(let d=w.from;d<=w.to&&!byTag('te_gf_'+term+'_'+id).length;d++){ const dd=((H.G.termend&&H.G.termend[term]||{}).gfDay||{})[id]; if(dd==null||dd<0) break; at(dd,11.9); run(11.9,12.2); }
    return byTag('te_gf_'+term+'_'+id); };
  const want=(id,t)=>(X15.find(x=>x.who===id&&x.term===t)||{}).line;
  const a1=flow('heroine_01','Y1S1'), a2=flow('heroine_01','Y1S2'), z2=flow('heroine_02','Y1S2'); PHONE.answer(H.G,'te_gf_Y1S2_heroine_02',0); STORY.phoneRules(GM); const qz=OUT.get(H.G,'te_gf_Y1S2_heroine_02');
  check('1-5. 手機那一則（以安交往中）：大一上原句「'+want('heroine_01','Y1S1')+'」、大一下「'+want('heroine_01','Y1S2')+'」；tag te_gf_<學期>_heroine_01、當天 12:00',a1.length===1&&a1[0].text===want('heroine_01','Y1S1')&&a2.length===1&&a2[0].text===want('heroine_01','Y1S2')&&Math.abs(a2[0].h-12)<1e-6,J([a1.map(m=>m.text),a2.map(m=>[m.text,m.h])]));
  check('1-5. 手機那一則（芷若交往中、大一下）：「'+want('heroine_02','Y1S2')+'」，接了照舊週五 22:00',z2.length===1&&z2[0].text===want('heroine_02','Y1S2')&&!!qz&&qz.h===22&&wdOf(qz.day)===5,J([z2.map(m=>m.text),qz&&[qz.h,wdOf(qz.day)]]));
  const o=flow('heroine_01','Y1S2',w=>oldMsg('te_gf_Y1S2_heroine_01','p:heroine_01','heroine_01','考完了。……今天不讀書，你也不准讀。',w.from,12));
  for(let d=TERMEND.windowOf('Y1S2').from;d<=TERMEND.windowOf('Y1S2').to;d++){ at(d,11.9); run(11.9,12.2,0.1); }
  check('1-5. 舊存檔大一下那一則已經收過（舊的字）：不重發',byTag('te_gf_Y1S2_heroine_01').length===1&&!(H.G.msgs||[]).some(m=>m.text===want('heroine_01','Y1S2')),J(tx('te_gf_Y1S2_heroine_01')));
});
/* ---- 1-6 子晴裂縫談話② ---- */
await sec('1-6',()=>{
  const ZQ='heroine_04', firstWed=(y,m)=>{ for(let d=D(y+'-'+String(m).padStart(2,'0')+'-01');;d++) if(wdOf(d)===3) return d; };
  const zq=()=>{ fresh('2028-09-25',10); meet(ZQ); INV.addContact(H.G,ZQ); H.CLOSE(ZQ); ROM.start(H.G,ZQ); };
  const MONTHS=[[2028,10],[2028,11],[2028,12],[2029,1],[2029,2],[2029,3],[2029,4],[2029,5]];
  zq(); for(const [y,m] of MONTHS){ at(firstWed(y,m),23.55); rules(); }
  const tags=[...new Set((H.G.msgs||[]).filter(m=>/^ct_zq2_\d{4}-\d\d$/.test(m.tag||'')).map(m=>m.tag))];
  const got=tags.map(t=>({t,m:byTag(t).filter(x=>x.from===ZQ).map(x=>x.text),o:(PHONE.byAsk(H.G,t)||{ask:{opts:[]}}).ask.opts.map(x=>x.t)}));
  const bad=got.filter((g,k)=>J(g.m)!==J(X16[k%4]||null));
  check('1-6. 每個月第一個週三 23:30：第 1 個月「'+(X16[0]||[]).join('／')+'」（原句）、第 2 個月「'+(X16[1]||[]).join('／')+'」、第 3 個月「'+(X16[2]||[]).join('／')+'」、第 4 個月「'+(X16[3]||[]).join('／')+'」，第 5 個月起從第 1 組再輪（收到 '+got.length+' 個月）',
    got.length>=5&&!bad.length,J(got.map(g=>[g.t,g.m])));
  check('1-6. 選項照舊（每個月都是「妳要不要先休息？」「要我過去陪妳加班嗎？」）；tag ct_zq2_<年-月>',got.length>=2&&got.every(g=>J(g.o)===J(['妳要不要先休息？','要我過去陪妳加班嗎？'])),J(got.map(g=>g.o)));
  const gl=got[got.length-1], ra=gl?PHONE.answer(H.G,gl.t,0):null; rules();   /* 最後收到的那個月（回覆期限還沒過；第 8 個月＝第 4 組）*/
  check('1-6. 第 '+got.length+' 個月（第 '+((got.length-1)%4+1)+' 組）選「妳要不要先休息？」→ 她回的照那一組換（AA_464 第 3 節：第 4 組「你又來了。」）',!!gl&&ra!=null&&(H.G.msgs||[]).filter(m=>m.th==='p:'+ZQ&&m.from===ZQ).map(m=>m.text).slice(-1)[0]===((got.length-1)%4===3?'你又來了。':'你在替我決定嗎'),J(gl&&gl.t));
  /* 舊存檔：已經用舊的字收過 10 月、11 月（兩則都是原句）——11 月不重發，12 月是第 3 組 */
  zq(); const R=CRACKTALK.src(H.G); R.zq={sent2:{'2028-10':firstWed(2028,10),'2028-11':firstWed(2028,11)}};
  for(const [y,m] of [[2028,10],[2028,11]]) for(const t of ['今天又改了三個 bug','眼睛快掉了']) oldMsg('ct_zq2_'+y+'-'+m,'p:'+ZQ,ZQ,t,firstWed(y,m),23.5);
  for(const [y,m] of [[2028,11],[2028,12]]){ at(firstWed(y,m),23.55); rules(); }
  check('1-6. 舊存檔收過兩個月（舊的字）：11 月不重發；12 月照「第 3 個月」「'+(X16[2]||[]).join('／')+'」',byTag('ct_zq2_2028-11').length===2&&J(tx('ct_zq2_2028-12'))===J(X16[2]||null),J([tx('ct_zq2_2028-11'),tx('ct_zq2_2028-12')]));
});
H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
