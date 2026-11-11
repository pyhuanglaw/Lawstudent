// AA_462 法律系大三上讀一遍（留在臺灣；企劃線 81bee6b83，AA-B 2026-10-25 12:3x；D109）——不需要瀏覽器。台詞逐字對 AA_462（從企劃線 git show 讀稿、解析表格與引述）。
//   0 讀稿（第 1 節改成的兩句＋多一句、第 2 節、第 3 節四句、第 4 節、第 5 節四列）；新檔載得到
//   1 以安 10/21 22:00 沒在 3D 遇到的那一則（r2y3a3d.js an14Phone）：換字；10/19 群組回了「我跟以安去。」（CRIMPRO_WITH 'an'）多「禮拜五的地院照舊。」；
//     回別的（自己找一天）、不在群組的私訊＝兩句；tag y3_an14_msg 不變
//   2 阿哲的機車（c4Phone）：選項「找對方談。……」、回了照順序傳出去；U_TORT 那一句不動
//   3 語彤的週四（cracktalk3d.js seatText）：每學期第一個週四原句，之後四句照順序輪（不跟上一週同一句；寒暑假算前一學期）；大三上 12/16 原句、12/23「今天週四。」；
//     舊存檔（沒有 seatTxt）從原句開始；有 seatTxt 的接著輪；「今天不行」不加、沒去也沒回 +1 照舊
//   4 沛珊在台南的學期末（termend3d.js tnVisited）：聖誕那一場（12/23 她約、12/24 開車下去）有去＝12/25 學期末那一則改成「學期結束了！昨天那一頓，就算學期末的。」、
//     不能回、不排出遊；沒去（說那天不行、答應了沒去）照原本約；「我去台南找妳？」那一趟（ev_hv_ps_tn）在前兩天內也算；三天前的不算
//   5 小改字：Kevin 12/3 那一組（10/15 照舊）、沛珊的台南美術館第二句、沛珊③第二句、可昕聖誕視訊（學期末的飯也在 12/25 才換；不同天照舊）
//   6 第 8 節（企劃線 878496edb，回 LAWWW-B 施工問題）：①沛珊那一句照幾天前換字（同一天／前一天／前兩天）：大四上 12/23 她約聖誕、12/24 開車下去，學期末的飯也排在 12/24＝
//     「學期結束了！今天就是學期末的那一頓。」（AA_464 4-2；不排出遊、聖誕那一場照演；AA_464 第 7 節：只是排了不算，等那一場演完才傳，沒去＝照平常約、18:30 的飯照排）；
//     12/23 去台南找她（ev_hv_ps_tn）、12/25 學期末＝「……前天那一頓……」；
//     ②兩種去台南都算、每個在台南的學期都適用；③3D 版 ev_an_admin_court「今天下午，我先去了一趟行政法院。」，不認識阿哲＝她補「刑訴那場還是禮拜五。這個是我自己想看的。」
// 修改前（開發分支 661423a71）：1～5 每一節至少一項 FAIL；6 在 0b474c8b4 FAIL。用法：node tests/aa462_y3s1_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/zr_uk3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/exchange3d.js',
  'src/data/y2b_events.js','src/y2b3d.js','src/data/group_events.js','src/group3d.js','src/y2r2_3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/r3_events.js','src/r3_3d.js',
  'src/data/fest_events.js','src/fest3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js']) L3(f);   /* index.html 的順序（照 r2y3a_events_unit.js、r3_events_unit.js、v6_crack_unit.js、aa416_fest_unit.js、peishan_tainan_unit.js 載的檔）*/
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{};
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const AN='heroine_01', YT='heroine_03', PS='classmate_peishan', KX='kexin';
const fresh=(k,h,flags,zone)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',Object.assign({introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true,ROOM_Y2:true,ROOM_Y3:true},flags||{})); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; PHONE.rec(G); E.player.busy=false; E.paused=false; return G; };
const date=id=>{ H.CLOSE(id); INV.addContact(H.G,id); H.G.contacts[id]=0; ROM.start(H.G,id); H.G.flags['dating_'+id]=true; };
const at=(d,h)=>{ const G=H.G; G.day=typeof d==='number'?d:D(d); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const run=(d,h0,h1,st)=>{ st=st||0.25; const dd=typeof d==='number'?d:D(d); for(let h=h0;h<=h1+1e-9;h+=st){ at(dd,+h.toFixed(3)); rules(); } };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const TH=th=>(H.G.msgs||[]).filter(m=>m.th===th);
const txt=th=>TH(th).map(m=>(m.from==='player'?'player':m.from)+':'+m.text);
const NG='g:noodle_team';

/* ---- 讀稿（企劃線 81bee6b83）---- */
let doc=''; try{ doc=cp.execSync('git show 81bee6b83:"docs/story_planning/AA_462_法律系大三上讀一遍_以安旁聽_語彤的週四_沛珊連兩天下台南.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const part=(a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const rows=t=>t.split('\n').filter(l=>/^\|/.test(l.trim())&&!/^\|\s*-/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const quotes=t=>t.split('\n').map(l=>l.trim().match(/^> (\S+?)：(.+)$/)).filter(Boolean).map(m=>({who:m[1],t:m[2]}));
const S1=part('## 1.','## 2.'), S1old=quotes(S1.slice(0,S1.indexOf('**改成**'))), S1new=quotes(S1.slice(S1.indexOf('**改成**')));
const AN_NEW=S1new.slice(0,2).map(q=>q.t), AN_FRI=(S1new[2]||{}).t, AN_OLD=S1old.slice(0,2).map(q=>q.t);
const ZH=(quotes(part('## 2.','## 3.')).find(q=>q.who==='祐廷')||{}).t;
const ROT=rows(part('## 3.','## 4.')).filter(r=>/^[1-4]$/.test(r[0])).map(r=>r[1]);
const PS_LINE=(quotes(part('## 4.','## 5.')).find(q=>q.who==='沛珊')||{}).t;
const T5=rows(part('## 5.','## 6.')).filter(r=>/`/.test(r[0])).map(r=>({where:r[0],now:r[1],to:r[2]}));
const sp=s=>s.replace(/^[^／]*?：(?=[^／]*／)/,'').split('／');   /* 「12/3：A／B／C」「…的話：A／B」→ [A,B,C] */
const KW_OLD=['這週辛苦了各位','@學姊 妳也是','辛苦了。'];
const YT_ORIG='今天週四。總圖三樓，斜對面的位子我留了。';
const OLD_C4='對方。後面怎麼賠，我們去法服問。', TORT='如果是對方不小心造成的，修車費可以要他賠。他有保第三人責任險的話，保險公司會來談。';
/* 第 8 節（企劃線 878496edb）*/
let doc8=''; try{ doc8=cp.execSync('git show 878496edb:"docs/story_planning/AA_462_法律系大三上讀一遍_以安旁聽_語彤的週四_沛珊連兩天下台南.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc8=''; }
const S8=(()=>{ const i=doc8.indexOf('## 8.'); return i<0?'':doc8.slice(i); })();
const S8L=k=>{ const m=S8.match(new RegExp('^\\s*- '+k+'：(.+?)(（`[^）]*）)?\\s*$','m')); return m?m[1].trim():null; };
const TN3=[S8L('同一天'),S8L('前一天'),S8L('前兩天')];
const AD_OLD=(S8.match(/第二句「([^」]+)」→「([^」]+)」/)||[])[1], AD_NEW=(S8.match(/第二句「([^」]+)」→「([^」]+)」/)||[])[2], AD_SELF=(quotes(S8).find(q=>q.who==='以安')||{}).t;

(async()=>{
const r5=k=>T5.find(r=>r.where.includes(k))||{};
const KW_NEW=sp(r5('Kevin').to||'').map(t=>t.replace(/^（學姊）/,'')), MU_NEW=sp(r5('hometown_lines').to||''), PS3_NEW=sp(r5('ps3').to||''), KX_NEW=sp(r5('可昕').to||''), KX_OLD=sp(r5('可昕').now||'');
/* ---- 0 ---- */
await sec(0,()=>{
  check('0. 讀得到稿、檔都載得到（R2Y3A、R3、CRACKTALK、FEST、HV、TERMEND）',!!doc&&!loadErr.length&&['R2Y3A','R3','CRACKTALK','FEST','HV','TERMEND'].every(n=>typeof globalThis[n]!=='undefined'),J(loadErr));
  check('0. 稿裡讀得到：第 1 節舊兩句／改成兩句＋多一句、第 2 節祐廷那句、第 3 節四句、第 4 節沛珊那句、第 5 節四列',AN_OLD.length===2&&AN_NEW.length===2&&!!AN_FRI&&!!ZH&&ROT.length===4&&!!PS_LINE&&T5.length===4&&KW_NEW.length===3&&MU_NEW.length===2&&PS3_NEW.length===2&&KX_NEW.length===2&&KX_OLD.length===2,
    J({AN_OLD,AN_NEW,AN_FRI,ZH,ROT,PS_LINE,KW_NEW,MU_NEW,PS3_NEW,KX_NEW,KX_OLD}));
  check('0. 資料照稿：CRACKTALK_LINES.SRC.yt_seat_rot＝第 3 節四句；ps3＝第 5 節那一列',J(CRACKTALK_LINES.SRC.yt_seat_rot)===J(ROT)&&J(CRACKTALK_LINES.SRC2.ps3)===J(PS3_NEW),J([CRACKTALK_LINES.SRC.yt_seat_rot,CRACKTALK_LINES.SRC2.ps3]));
});

/* ---- 1 以安的行政法院 ---- */
const crAsk=(pick)=>{ fresh('2027-10-19',20,{}); PHONE.join(H.G,'noodle_team','麵店團'); for(const id of [AN,'classmate_bohan','zhe','yu']) H.FAMILIAR(id); run('2027-10-19',20.75,21.25);
  const m=PHONE.byAsk(H.G,'y3_cr_grp'), k=m?m.ask.opts.findIndex(o=>o.t===pick):-1; if(k>=0) PHONE.answer(H.G,'y3_cr_grp',k); return {m,k}; };
const an14=()=>byTag('y3_an14_msg').map(m=>m.text);
await sec(1,()=>{
  { const {m,k}=crAsk('我跟以安去。'); run('2027-10-20',9,9.5); run('2027-10-21',21.75,22.25); const L=byTag('y3_an14_msg');
    check('1. 10/19 群組回「我跟以安去。」（CRIMPRO_WITH an）→ 10/21 22:00 麵店團：「'+AN_NEW.join('」「')+'」＋「'+AN_FRI+'」（第 1 節）',!!m&&k>=0&&H.G.flags.CRIMPRO_WITH==='an'&&J(an14())===J(AN_NEW.concat([AN_FRI]))&&L.every(x=>x.th===NG&&x.from===AN)&&Math.abs(L[0].h-22)<0.26,J(an14()));
    check('1. 沒有「我自己去行政法院旁聽了」；AN14 group、記 AN_ADMIN_COURT（照舊）',!TH(NG).some(x=>x.text===AN_OLD[0])&&H.G.flags.AN14==='group'&&SOCIAL.has(AN,'AN_ADMIN_COURT')); }
  { crAsk('我自己找一天。'); run('2027-10-21',21.75,22.25);
    check('1. 回「我自己找一天。」：兩句（沒有「禮拜五的地院照舊。」）',H.G.flags.CRIMPRO_WITH==='self'&&J(an14())===J(AN_NEW),J(an14())); }
  { crAsk('（沒回）'); run('2027-10-21',21.75,22.25);
    check('1. 群組那則沒回（還沒約）：兩句',H.G.flags.CRIMPRO_WITH==null&&J(an14())===J(AN_NEW),J(an14())); }
  { fresh('2027-10-21',21,{}); H.FRIEND(AN); run('2027-10-21',21.75,22.25);
    check('1. 不在群組、和她朋友以上：私訊同兩句',J(txt('p:'+AN).slice(-2))===J(AN_NEW.map(t=>AN+':'+t))&&!TH(NG).length,J(txt('p:'+AN))); }
  { const {k}=crAsk('我跟以安去。'); H.G.flags.AN14='there'; run('2027-10-21',21.75,22.25);
    check('1. 在麵店遇到過（3D 那一版演過）：不傳',k>=0&&!byTag('y3_an14_msg').length); }
});

/* ---- 2 阿哲的機車 ---- */
await sec(2,()=>{
  fresh('2027-11-19',20,{}); H.FAMILIAR('zhe'); run('2027-11-19',20.75,21.25); const m=PHONE.byAsk(H.G,'y3_c4');
  check('2. 11/19 21:00 選項「'+ZH+'」（第 2 節；沒有「'+OLD_C4+'」）',!!m&&J(m.ask.opts.map(o=>o.t))===J([ZH]),J(m&&m.ask.opts.map(o=>o.t)));
  PHONE.answer(H.G,'y3_c4',0); const L=txt('p:zhe').slice(4);
  check('2. 回了：「先不要簽。拍照、報警做紀錄。」→「'+ZH+'」→「你真正想要的是什麼？」…（其他照舊）；ZHE_C4 fafu',J(L.slice(0,3))===J(['player:先不要簽。拍照、報警做紀錄。','player:'+ZH,'player:你真正想要的是什麼？'])&&H.G.flags.ZHE_C4==='fafu'&&SOCIAL.has('zhe','ZHE_SCOOTER'),J(L));
  fresh('2027-11-19',20,{U_TORT:true}); H.FAMILIAR('zhe'); run('2027-11-19',20.75,21.25); const m2=PHONE.byAsk(H.G,'y3_c4');
  check('2. U_TORT 那一個選項（BB 10-14 查過的法律句子）不動',!!m2&&J(m2.ask.opts.map(o=>o.t))===J([ZH,TORT]),J(m2&&m2.ask.opts.map(o=>o.t)));
});

/* ---- 3 語彤的週四 ---- */
const ytG=(k,flags)=>{ fresh(k,10,Object.assign({YT_EV13:true},flags||{})); SOCIAL.remember(YT,'FIRST_MET',''); date(YT); return H.G; };
/* 每個週四 12:30 看那一則、回「今天不行」（不加）；20:30 結算 */
const thursdays=(d0,d1,ans)=>{ const out=[]; for(let d=(typeof d0==='number'?d0:D(d0));d<=(typeof d1==='number'?d1:D(d1));d++){ if(wdOf(d)!==4) continue; at(d,12.5); rules(); const tag=CRACKTALK.seatTag(d), m=byTag(tag)[0];
    if(m){ if(ans!==false) PHONE.answer(H.G,tag,0); out.push({d,key:keyOf(d),term:CRACKTALK.termKey(H.G,d),t:m.text,h:m.h}); } at(d,20.5); rules(); } return out; };
await sec(3,()=>{
  ytG('2027-12-13'); const a=thursdays('2027-12-13','2027-12-31');
  check('3. 大三上（留在臺灣）12/16 原句「'+YT_ORIG+'」、12/23「'+ROT[0]+'」（掃描那兩週不再一字不差）；12:10',a.length>=2&&a[0].key==='2027-12-16'&&a[0].t===YT_ORIG&&a[1].key==='2027-12-23'&&a[1].t===ROT[0]&&a.every(x=>Math.abs(x.h-(12+10/60))<0.26),J(a.map(x=>[x.key,x.t])));
  ytG('2028-09-04'); const b=thursdays('2028-09-04','2029-01-31');
  const exp=b.map((x,i)=>i===0?YT_ORIG:ROT[(i-1)%4]);
  check('3. 大四上一整學期（含寒假，算前一學期）：第一個週四原句，之後 1→2→3→4→1… 輪（第 3 節）',b.length>=10&&J(b.map(x=>x.t))===J(exp)&&b.every(x=>x.term===b[0].term),J(b.map(x=>[x.key,x.term,ROT.indexOf(x.t)+1])));
  check('3. 一學期裡沒有連兩週同一句；原句只有第一週',b.every((x,i)=>i===0||x.t!==b[i-1].t)&&b.filter(x=>x.t===YT_ORIG).length===1);
  /* 換學期：上一學期最後用到第幾句都一樣，新學期第一個週四原句 */
  ytG('2027-12-13'); thursdays('2027-12-13','2027-12-24'); const R=CRACKTALK.rec(H.G); const before=J(R.seatTxt); at(D('2028-09-04'),10); const c=thursdays('2028-09-04','2028-09-22');
  check('3. 新學期第一個週四回到原句（上一學期記的 '+before+'）、接著輪',c.length>=2&&c[0].t===YT_ORIG&&c[1].t===ROT[0]&&c[0].term!=='Y3S1',J(c.map(x=>[x.key,x.term,x.t])));
  /* 舊存檔 */
  ytG('2028-10-09'); const R2=CRACKTALK.rec(H.G); R2.seat[D('2028-10-05')]={went:true,done:true}; H.G.msgs.push({day:D('2028-10-05'),h:12+10/60,th:'p:'+YT,from:YT,text:YT_ORIG,tag:CRACKTALK.seatTag(D('2028-10-05'))}); delete R2.seatTxt;
  const o=thursdays('2028-10-09','2028-10-20');
  check('3. 舊存檔（學期中、沒有 seatTxt，上週已經收過原句）：從原句開始，再接著輪',o.length===2&&o[0].t===YT_ORIG&&o[1].t===ROT[0],J(o.map(x=>[x.key,x.t])));
  ytG('2028-10-09'); CRACKTALK.rec(H.G).seatTxt={term:CRACKTALK.termKey(H.G,D('2028-10-12')),i:2}; const o2=thursdays('2028-10-09','2028-10-20');
  check('3. 存檔記了上週用第 2 句：這週第 3 句「'+ROT[2]+'」、下週第 4 句',o2.length===2&&o2[0].t===ROT[2]&&o2[1].t===ROT[3],J(o2.map(x=>[x.key,x.t])));
  /* 計數照舊 */
  ytG('2028-09-04'); thursdays('2028-09-04','2028-09-08'); const n0=CRACKTALK.count(H.G,YT); thursdays('2028-09-11','2028-09-15',false); const n1=CRACKTALK.count(H.G,YT);
  const m=byTag(CRACKTALK.seatTag(D('2028-09-14')))[0];
  check('3. 「今天不行」照舊不加；第二週（「'+ROT[0]+'」）沒去也沒回 +1；回覆選項「今天不行」照舊',n0===0&&n1===1&&!!m&&m.text===ROT[0]&&J(m.ask.opts.map(x=>x.t))===J(['今天不行']),J({n0,n1,t:m&&m.text}));
});

/* ---- 4 沛珊在台南的學期末 ---- */
const psG=()=>{ fresh('2027-12-20',8,{PS_BACK_FIRST:1}); date(PS); return H.G; };
const gfTag='te_gf_Y3S1_'+PS, xTag='fest_ask_'+PS+'_xmas_2027', xQ='fest_'+PS+'_xmas_2027';
const goOut=async(q,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); at(q.day,q.h); await OUT.go(GM,q); };
const to1225=()=>{ run('2027-12-24',22,23.5,0.5); run('2027-12-25',8,12.5,0.5); };
await sec(4,async()=>{
  const OLD_INV=TERMEND.gf(PS,'Y3S1').invite;
  { psG(); run('2027-12-23',20.5,21.25); const m=PHONE.byAsk(H.G,xTag); const a=m?PHONE.answer(H.G,xTag,0):null; run('2027-12-23',21.5,22); const q=OUT.get(H.G,xQ);
    check('4. [前置] 12/23 21:00 她約聖誕「明天聖誕節。台南的街上也有燈。……」→「好。」＝12/24 開車去台南（一整天）',!!a&&!!q&&q.day===D('2027-12-24')&&q.place==='台南'&&q.fest&&q.fest.mode==='meet',J(q&&[keyOf(q.day),q.h,q.place]));
    if(q){ await goOut(q,[0,0,0,0]); }
    check('4. [前置] 12/24 去了（OUT done）',!!q&&q.state==='done',J(q&&q.state));
    to1225(); const L=byTag(gfTag), te=OUT.rec(H.G).filter(x=>/^te_gf_Y3S1/.test(x.id||''));
    check('4. 12/25 12:00 學期末那一則改成「'+PS_LINE+'」（第 4 節）：不能回、不排出遊',L.length===1&&L[0].text===PS_LINE&&!L[0].ask&&Math.abs(L[0].h-12)<0.26&&L[0].day===D('2027-12-25')&&!te.length,J(L.map(x=>[keyOf(x.day),x.h,x.text,!!x.ask])));
    run('2027-12-25',13,23.5,0.5); check('4. 之後也不再約、沒有「學期末的飯」那一趟',byTag(gfTag).length===1&&!OUT.rec(H.G).some(x=>/^te_gf_/.test(x.id||''))&&!TH('p:'+PS).some(x=>x.text===OLD_INV)); }
  { psG(); run('2027-12-23',20.5,21.25); PHONE.answer(H.G,xTag,1); run('2027-12-23',21.5,22); to1225(); const L=byTag(gfTag);
    check('4. 聖誕說「那天不行。」：12/25 照原本約「'+OLD_INV+'」（可以回）',L.length===1&&L[0].text===OLD_INV&&!!L[0].ask,J(L.map(x=>x.text)));
    PHONE.answer(H.G,gfTag,0); rules();
    const te=OUT.rec(H.G).find(x=>x.id==='te_gf_Y3S1_'+PS); check('4. 回「好。」照舊排台南的學期末約會',!!te&&te.day===D('2027-12-25')&&/台南/.test(te.place),J(te&&[te.id,keyOf(te.day),te.place])); }
  { psG(); run('2027-12-23',20.5,21.25); PHONE.answer(H.G,xTag,0); run('2027-12-23',21.5,22); const q=OUT.get(H.G,xQ); at('2027-12-24',23); for(const x of OUT.expire(H.G)) OUT.onMissed(GM,x); to1225(); const L=byTag(gfTag);
    check('4. 答應了聖誕、那天沒去（missed）：照原本約',!!q&&q.state==='missed'&&L.length===1&&L[0].text===OLD_INV&&!!L[0].ask,J({st:q&&q.state,L:L.map(x=>x.text)})); }
  { psG(); at('2027-12-22',20); H.picks=[0]; const day=await HV.ask(GM,PS); const q=OUT.get(H.G,'hv_'+PS+'_'+day);
    check('4. [前置] 12/22「我去台南找妳？」約 12/23（ev_hv_ps_tn）',day===D('2027-12-23')&&!!q&&q.ev==='ev_hv_ps_tn',J(q&&[keyOf(q.day),q.ev]));
    if(q) await goOut(q,[0,0,0,0,0,0]); run('2027-12-23',22,23.5,0.5); run('2027-12-24',8,23.5,0.5); to1225(); const L=byTag(gfTag);
    check('4. 12/23 去台南找過她（前兩天內）：12/25 也不約、傳一句（前兩天的字照第 8 節①「'+TN3[2]+'」）',!!q&&q.state==='done'&&L.length===1&&L[0].text===TN3[2]&&!L[0].ask,J({st:q&&q.state,L:L.map(x=>x.text)})); }
  { psG(); at('2027-12-20',20); H.picks=[1]; const day=await HV.ask(GM,PS); const q=OUT.get(H.G,'hv_'+PS+'_'+day);
    if(q) await goOut(q,[0,0,0,0,0,0]); for(const d of ['2027-12-22','2027-12-23','2027-12-24']) run(d,8,23.5,0.5); to1225(); const L=byTag(gfTag);
    check('4. 三天以前（12/22）去過：照原本約',day===D('2027-12-22')&&!!q&&q.state==='done'&&L.length===1&&L[0].text===OLD_INV&&!!L[0].ask,J({day:day&&keyOf(day),st:q&&q.state,L:L.map(x=>x.text)})); }
  check('4. 只有在台南的學期（大三上、大三下、大四上、大五上）有這一句（第 8 節①：[同一天, 前一天, 前兩天]，前一天＝第 4 節那一句）；大二下（她不在台南）沒有',['Y3S1','Y3S2','Y4S1','Y5S1'].every(t=>J(TERMEND.gf(PS,t).tnVisited)===J(TN3))&&TN3[1]===PS_LINE&&!TERMEND.gf(PS,'Y2S2').tnVisited,J(TERMEND.gf(PS,'Y3S1').tnVisited));
});

/* ---- 5 小改字 ---- */
const fam=()=>TH('g:family_law').map(m=>({w:m.from,t:m.text,h:m.h}));
await sec(5,async()=>{
  /* Kevin */
  fresh('2027-10-15',16.5,{}); PHONE.join(H.G,'family_law','法律系直屬家族'); run('2027-10-15',16.5,17.25,0.05); const a=fam();
  run('2027-12-03',16.5,17.25,0.05); const b=fam().slice(a.length);
  check('5. Kevin 10/15 照舊「'+KW_OLD.join('」「')+'」',J(a.map(x=>x.t))===J(KW_OLD),J(a));
  check('5. Kevin 12/3 換「'+KW_NEW.join('」「')+'」（第 5 節第一列；學姊那句是她說的；時間照舊 17:05、+1 分、+3 分）',J(b.map(x=>x.t))===J(KW_NEW)&&b[0].w==='kevin'&&b[1].w==='kevin'&&b[2].w!=='kevin'&&b[2].w===a[2].w&&Math.abs(b[0].h-(17+5/60))<0.26&&b[2].h-b[0].h>=2/60,J(b));
  /* 沛珊的台南美術館 */
  psG(); run('2027-12-20',20.5,21.25); const M=byTag('ps_museum_Y3S1').map(m=>m.text);
  check('5. 沛珊在台南約美術館：「'+MU_NEW.join('」「')+'」「你可以說不。我只是問問看。」（第二句開頭不再說「美術館。」）',J(M)===J(MU_NEW.concat(['你可以說不。我只是問問看。'])),J(M));
  /* 沛珊③ */
  fresh('2027-10-01',10,{}); date(PS); ROM.get(H.G,PS).sinceDay=D('2027-09-01'); at('2027-11-30',23.1); rules(); const P3=(H.G.msgs||[]).filter(m=>/^ct_classmate_peishan_ps3_/.test(m.tag||'')).map(m=>m.text);
  check('5. 沛珊③ 10、11 月都沒去台南：11/30 23:00「'+PS3_NEW.join('」「')+'」（第二句不是「我只是……」）',J(P3)===J(PS3_NEW)&&!P3.some(t=>/我只是/.test(t)),J(P3));
  /* 可昕聖誕 */
  fresh('2027-12-23',19,{}); date(KX); run('2027-12-23',19,23.5,0.5); run('2027-12-24',8,21.25,0.25); const te=OUT.get(H.G,'te_kx_Y3S1'), X=byTag('y3_kx_xmas').map(m=>m.text);
  check('5. 可昕：學期末的飯排在 12/25（'+(te?keyOf(te.day)+' '+te.h:'沒有')+'）＝12/24 21:00「'+KX_NEW.join('」「')+'」',!!te&&te.day===D('2027-12-25')&&J(X)===J(KX_NEW),J(X));
  fresh('2027-12-23',19,{}); date(KX); OUT.plan(H.G,{id:'x_1225_eve',ev:'ev_zhe_game_y2',day:D('2027-12-25'),h:19,place:'別的約',title:'[前置] 12/25 晚上別的約',travelH:0.25}); run('2027-12-23',19,23.5,0.5); run('2027-12-24',8,21.25,0.25);
  const te2=OUT.get(H.G,'te_kx_Y3S1'), X2=byTag('y3_kx_xmas').map(m=>m.text);
  check('5. 可昕：12/25 晚上已經有別的約、學期末的飯排到別天（'+(te2?keyOf(te2.day):'沒有')+'）＝照舊「'+KX_OLD.join('」「')+'」',!!te2&&te2.day!==D('2027-12-25')&&J(X2)===J(KX_OLD),J({te2:te2&&keyOf(te2.day),X2}));
  check('5. 可昕那一則的選項、回覆照舊（「好。」「明天不行。」）',J((PHONE.byAsk(H.G,'y3_kx_xmas')||{ask:{opts:[]}}).ask.opts.map(o=>o.t))===J(['好。','明天不行。']));
});

/* ---- 6 第 8 節 ---- */
await sec(6,async()=>{
  check('6. 讀得到第 8 節：①三句（同一天／前一天／前兩天）、③換字＋她補的那一句',TN3.every(Boolean)&&new Set(TN3).size===3&&!!AD_OLD&&!!AD_NEW&&!!AD_SELF,J({TN3,AD_OLD,AD_NEW,AD_SELF}));
  /* ① 同一天：大四上（2028）12/23 21:00 她約聖誕 → 12/24 12:00 開車下去；學期末的飯也排在 12/24（AA_464 4-2 掃描的那一天）*/
  const ps4=()=>{ fresh('2028-12-18',8,{PS_BACK_FIRST:1}); date(PS); for(const k of ['2028-12-18','2028-12-19','2028-12-20','2028-12-21','2028-12-22']) run(k,8,23.5,0.5); run('2028-12-23',8,21.25,0.25); };
  const tag4='te_gf_Y4S1_'+PS, xTag4='fest_ask_'+PS+'_xmas_2028', xQ4='fest_'+PS+'_xmas_2028', OLD4=TERMEND.gf(PS,'Y4S1').invite;
  { ps4(); const R=TERMEND.rec(H.G,'Y4S1'), dd=R&&R.gfDay&&R.gfDay[PS]; const a=PHONE.byAsk(H.G,xTag4)?PHONE.answer(H.G,xTag4,0):null; run('2028-12-23',21.5,22,0.25); const q=OUT.get(H.G,xQ4);
    check('6. [前置] 大四上學期末的飯排在 12/24；12/23 21:00 她約聖誕→「好。」＝12/24 12:00 開車去台南',dd===D('2028-12-24')&&!!a&&!!q&&q.day===D('2028-12-24')&&q.place==='台南'&&q.state==='planned',J({dd:dd!=null&&dd>=0?keyOf(dd):dd,q:q&&[keyOf(q.day),q.h,q.state]}));
    run('2028-12-24',8,12,0.25); const L0=byTag(tag4).length;
    check('6. ① 同一天：聖誕那一場只是排了（還沒演完）＝12:00 先不傳（AA_464 第 7 節）',!!q&&q.state==='planned'&&L0===0,J({st:q&&q.state,L0}));
    if(q) await goOut(q,[0,0,0,0]); const hEnd=H.G.hour; rules(); const L=byTag(tag4);
    check('6. ① 聖誕那一場演完（done）才傳「'+TN3[0]+'」（傳的時間在演完以後、不能回、不排出遊）',!!q&&q.state==='done'&&L.length===1&&L[0].text===TN3[0]&&!L[0].ask&&L[0].day===D('2028-12-24')&&L[0].h>12&&!OUT.rec(H.G).some(x=>/^te_gf_/.test(x.id||'')),J({hEnd,L:L.map(x=>[keyOf(x.day),x.h,x.text,!!x.ask])}));
    run('2028-12-24',Math.ceil(hEnd*2)/2,23.5,0.5); check('6. ① 之後不再約',byTag(tag4).length===1&&!TH('p:'+PS).some(x=>x.text===OLD4)); }
  { ps4(); PHONE.answer(H.G,xTag4,0); run('2028-12-23',21.5,22,0.25); const q=OUT.get(H.G,xQ4); run('2028-12-24',8,12.5,0.25); const L0=byTag(tag4).length;
    at('2028-12-24',13.5); for(const x of OUT.expire(H.G)) OUT.onMissed(GM,x); rules(); const L=byTag(tag4);
    check('6. ① 同一天、聖誕那一場過了時間沒去（missed）：照平常約「'+OLD4+'」（可以回；之前先不傳）',L0===0&&!!q&&q.state==='missed'&&L.length===1&&L[0].text===OLD4&&!!L[0].ask&&L[0].h>=12.5,J({st:q&&q.state,L0,L:L.map(x=>[x.h,x.text])}));
    PHONE.answer(H.G,tag4,0); rules(); const te=OUT.rec(H.G).find(x=>x.id==='te_gf_Y4S1_'+PS);
    check('6. ① 回「好。」＝那天 18:30 的飯照排（台南）',!!te&&te.day===D('2028-12-24')&&Math.abs(te.h-18.5)<0.01&&/台南/.test(te.place),J(te&&[keyOf(te.day),te.h,te.place])); }
  { ps4(); PHONE.answer(H.G,xTag4,0); run('2028-12-23',21.5,22,0.25); const q=OUT.get(H.G,xQ4); run('2028-12-24',8,11.75,0.25); H.picks=[2]; H.opts=[]; at('2028-12-24',11.9); const r=q?await OUT.prompt(GM,q):null; run('2028-12-24',12,12.5,0.25); const L=byTag(tag4);
    check('6. ① 同一天、聖誕那一場「不去了」：照平常約「'+OLD4+'」',r==='no'&&!!q&&q.state==='missed'&&L.length===1&&L[0].text===OLD4&&!!L[0].ask,J({r,st:q&&q.state,opts:H.opts[0],L:L.map(x=>x.text)})); }
  { ps4(); PHONE.answer(H.G,xTag4,1); run('2028-12-23',21.5,22,0.25); run('2028-12-24',8,12.5,0.25); const L=byTag(tag4);
    check('6. ① 同一天但聖誕說「那天不行。」：照原本約「'+OLD4+'」',L.length===1&&L[0].text===OLD4&&!!L[0].ask,J(L.map(x=>x.text))); }
  /* ① 前一天（大三上 12/24 聖誕、12/25 學期末）＝第 4 節已經查過「'+TN3[1]+'」；前兩天（12/23 ev_hv_ps_tn、12/25）＝第 4 節最後一項 */
  check('6. ① 前一天＝第 4 節那一句（第 4 節 12/24 聖誕→12/25 已查過）、前兩天＝「'+TN3[2]+'」（第 4 節 12/23 去台南找她→12/25 已查過）',TN3[1]===PS_LINE);
  /* ② 兩種去台南（節日那一場、ev_hv_ps_tn）都算；每個在台南的學期都適用＝第 4 節最後一項 */
  check('6. ② S.tnVisited 回傳幾天前：三天前不算、missed 不算、前一天去過又排了同一天＝1；同一天只是排了＝wait、同一天演完＝0、同一天沒去＝-1（AA_464 第 7 節）',(()=>{ fresh('2028-06-10',8,{}); const dd=D('2028-06-20'), mk=(id,day,state,o)=>Object.assign({id,day,h:12,state,place:'台南',fest:{id:PS,mode:'meet'}},o||{}); const R=OUT.rec(H.G);
      R.push(mk('a',dd-3,'done')); const r3=TERMEND.tnVisited(H.G,PS,dd); R.push(mk('b',dd-2,'done')); const r2=TERMEND.tnVisited(H.G,PS,dd); R.push(mk('c',dd-1,'missed')); const rm=TERMEND.tnVisited(H.G,PS,dd);
      R.push({id:'d',day:dd-1,h:15,state:'done',ev:'ev_hv_ps_tn',hv:{key:PS+'@台南'}}); const r1=TERMEND.tnVisited(H.G,PS,dd); R.push(mk('e',dd,'planned')); const r1b=TERMEND.tnVisited(H.G,PS,dd);
      R.length=0; R.push(mk('f',dd,'planned')); const rw=TERMEND.tnVisited(H.G,PS,dd); R[0].state='done'; const r0=TERMEND.tnVisited(H.G,PS,dd); R[0].state='missed'; const rx=TERMEND.tnVisited(H.G,PS,dd);
      return r3===-1&&r2===2&&rm===2&&r1===1&&r1b===1&&rw==='wait'&&r0===0&&rx===-1; })());
  /* ③ 3D 版 ev_an_admin_court */
  const adm=async(knowZhe)=>{ fresh('2027-10-21',17.75,{MET_ZHE:knowZhe},'noodle'); H.FAMILIAR(AN); const W1=STORY.week1Start; if(!knowZhe) STORY.week1Start=()=>true; H.said=[]; H.opts=[]; H.picks=[0];
    try{ await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_an_admin_court')); } finally { STORY.week1Start=W1; } return H.said.map(x=>x.t); };
  { const S=await adm(true);
    check('6. ③ 3D 版第二句「'+AD_NEW+'」（沒有「'+AD_OLD+'」）；認識阿哲：阿哲問、她答照舊，不補那一句',S[1]===AD_NEW&&!S.includes(AD_OLD)&&S.includes('刑訴的作業不是要去地院嗎？')&&S.includes('那個禮拜五去。今天這個是我自己想看的。')&&!S.includes(AD_SELF),J(S.slice(0,7))); }
  { const S=await adm(false), i=S.indexOf(AD_SELF);
    check('6. ③ 不認識阿哲（阿哲那兩句不出）：她自己補「'+AD_SELF+'」，在選項之前、收據那一句之後',S[1]===AD_NEW&&i===4&&S[3]==='他帶了一個資料夾，裡面全部是收據。區公所來了兩個人，一人一台筆電。'&&!S.includes('刑訴的作業不是要去地院嗎？')&&H.opts.length>=1,J(S.slice(0,7))); }
});

H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
