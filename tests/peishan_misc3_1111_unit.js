// 沛珊重寫（PEISHAN-VOICE-1110；使用者 X327）：零散檔案第三批 AA_763_peishan_misc3.json@62460ea75（23 列）＋課輔班兩句招呼的出現條件 BB_326 第 4 節@8abb761bd（2026-11-11）——不需要瀏覽器（D131）。
//   1. 白名單兩筆；tools/story/ps763.py 只認這一版；ladder.js 重匯（--out）一樣
//   2. ladder.js 九句：大三上～大四下招呼 when 七句只換字（出現條件和重寫以前一樣）、bikeSeat 的 onFirst／offFirst
//   3. 用句子當 key 的地方跟著換：greet_classday.js（只在上課日說）；story3d.js 的 LADDER_GREET_IF 沒有用到這幾句
//   4. msg2_pool.js 兩句（工具疊的，那一則有 ps763）；手寫檔 12 列：new 剛好 count 處、old 不在；和 BASE 比只差稿上的列
//   5. BB_326 第 4 節：「…等一下！我在上班！」（大一下、大二上）＝溫州街、週三 18:00～21:00；「我剛從課輔班回來。…」（大二上）＝週三 21:00～22:30、不限地點；
//      舊的兩組條件不在了；實際抽招呼：週三 19:00 溫州街出得來、週二 17:00 出不來；週三 21:30 哪個區域都出得來、週三 19:00 出不來；aa614_3d.js 載入以後條件沒有被改掉
// 稿、BASE 讀 git show；讀不到（淺層複本）＝不比稿，只驗結構和演出。用法：node tests/peishan_misc3_1111_unit.js
const H=require('./pg_harness.js');
const {check}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), os=require('os'), vm=require('vm');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const PS='classmate_peishan', BASE='7cfb90cd7', SP='docs/story_planning/', F763=SP+'AA_763_peishan_misc3.json', S763='62460ea75', F326=SP+'BB_326_學姊約會樣板D01到D03_第二意見.md', S326='8abb761bd';
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
/* 2026-11-11 之後故意改的檔（不是沛珊重寫的範圍，各自有逐句對稿的測試）：用改之前那一版（9d45ef8b3，沛珊重寫都在裡面、這支測試在那裡全過）比——
   AA_814（企劃線 91c6aaf9f，tests/aa814_prio_gap_1111_unit.js）改了 events.js（1/8 j8a、2/14 E27b）、vac_activities.js（沛珊重考期回國訊息兩段、noOff）；
   AA_742 第 ③ 節（tests/gg_shops3_story_1111_unit.js）改了 story3d.js 明軒「公館一百元以內」那一列（日日定食→泰米村食）。讀不到那一版（淺層複本）＝照現在的檔 */
const LATER_PIN='9d45ef8b3', LATER_FILES=['src/story3d.js'];
const read=f=>{ if(LATER_FILES.includes(f)){ const t=show(LATER_PIN,f); if(t!=null) return t; } return fs.readFileSync(path.join(H.ROOT,f),'utf8'); };
const noCom=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');
const lit=s=>{ const out=[]; noCom(s).replace(/'((?:[^'\\]|\\.)*)'/g,(m,t)=>{ out.push(t); return m; }); return out; };
const cond=q=>{ const o={}; for(const k in q) if(k!=='t'&&k!=='note') o[k]=q[k]; return o; };
const raw=show(S763,F763), A=raw?JSON.parse(raw):null;
const OLD=(()=>{ const s=show(BASE,'src/data/ladder.js'); if(!s) return null; try{ return new Function(s+';return LADDER;')(); }catch(e){ return null; } })();
const X_CROSS='（她帶著一排小孩過馬路，對你點頭）等一下！我在上班！', X_BACK='我剛從課輔班回來。你看我的手，都是紅筆。';
const when=t=>LADDER.byTerm[t][PS].greet.when;
/* 稿不在的時候也要驗的九句（寫死＝AA_763 的 new；稿讀得到會再逐字比一次） */
const LAD=[['Y4S1','期末。寒假我要回家裡的早餐店煎蛋。','期末了。寒假我要回台中，我爸已經排好要我去店裡站櫃檯。'],['Y4S1','早。我八點的課，七點就到了。','早。我八點的課，今天居然趕上了。'],['Y4S1','嗨！……我剛從課輔班回來。','嗨！我剛從課輔班回來。'],
  ['Y4S2','嗨！……我剛從課輔班回來。手上還有粉筆灰。','嗨！我剛從課輔班回來，手上還有粉筆灰。'],['Y4S2','我的公開課快到了。……晚上都在對著鏡子講。','我的公開課快到了，我晚上都在對著鏡子講，鏡子都聽膩了。'],
  ['Y3S2','早。……老師要比學生早到，我在練習。','早。老師要比學生早到，我在練習，目前成功率一半。'],['Y3S1','期中。我們系要考試。……我現在知道出題的人在想什麼了。','期中。我們系要考試，我現在知道出題的人在想什麼了。']];

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files, e=allow.filter(x=>x.path===F763), b=allow.filter(x=>x.path===F326);
    check('1. 白名單一筆 AA_763_peishan_misc3.json、sha '+S763+'、approved；tools/story/ps763.py 寫死只認這一版',e.length===1&&e[0].sha===S763&&e[0].status==='approved'&&read('tools/story/ps763.py').includes("SHA = '"+S763+"'"));
    check('1. 白名單一筆 BB_326（只用第 4 節）、sha '+S326+'、approved',b.length===1&&b[0].sha===S326&&b[0].status==='approved'&&/第 4 節/.test(b[0].scope||''));
    check('1. ladder.js 的來源有 AA_763_peishan_misc3@'+S763+'、BB_326@'+S326,String(LADDER.source).includes('AA_763_peishan_misc3@'+S763)&&String(LADDER.source).includes('BB_326@'+S326),String(LADDER.source).slice(-160));
    console.log(A&&OLD?'（稿和 BASE 都讀得到：逐字比對）':'（這份 checkout 讀不到企劃線的稿或 BASE：不比稿，只驗結構和演出）');
    if(A){ const tmp=path.join(os.tmpdir(),'ladder_ps763_'+process.pid+'.js'); let ok=false, out='';
      try{ out=cp.execFileSync('python3',['tools/ladder/import_ladder.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<26}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/ladder.js'); }catch(x){ out=String(x.stderr||x.stdout||x.message).slice(0,300); }
      try{ fs.unlinkSync(tmp); }catch(x){}
      check('1. tools/ladder/import_ladder.py 重匯（--out 另存）的結果和 src/data/ladder.js 一樣',ok,ok?'':out.slice(0,300));
      check('1. 稿：ladder.js 9 列＋其他八個檔 14 列＝23 列',A.files.length===9&&A.files[0].rows.length===9&&A.files.slice(1).reduce((n,f)=>n+f.rows.length,0)===14&&J(A.files.slice(1).map(f=>f.file))===J(['src/data/feed_y4s1.js','src/date3d.js','src/data/msg2_pool.js','src/data/bbpack_events.js','src/grades3d.js','src/story3d.js','src/aa614_3d.js','src/data/rel_lines.js'])); } });

  await sec(2,async()=>{ const bad=[];
    for(const [term,o,n] of LAD){ const W=when(term), hit=W.filter(w=>w.t===n); if(hit.length!==1) bad.push(term+' 新句 '+hit.length+' 則：'+n); if(W.some(w=>w.t===o)) bad.push(term+' 舊句還在：'+o);
      if(OLD){ const ow=OLD.byTerm[term][PS].greet.when, i=ow.findIndex(w=>w.t===o), k=W.findIndex(w=>w.t===n); if(i<0||i!==k||J(cond(ow[i]))!==J(cond(W[k]))||(ow[i].note||null)!==(W[k].note||null)) bad.push(term+' 條件或位置變了：'+n+' '+J([i,k,ow[i]&&cond(ow[i]),W[k]&&cond(W[k])])); } }
    check('2. 招呼 when 七句（大三上 1、大三下 1、大四上 3、大四下 2）：新句各一則、舊句不在了；出現條件（時間、星期、週次）、順序和重寫以前一樣（只換字）',bad.length===0,J(bad));
    if(A){ const R=A.files[0].rows, w7=R.filter(r=>/greet\.when/.test(r.where)).map(r=>[(/byTerm\.(Y\dS\d)\./.exec(r.where)||[])[1],r.old,r.new]);
      check('2. 逐字：這七句＝稿上 where／old／new 的七列',J(w7.map(x=>x.join('|')).sort())===J(LAD.map(x=>x.join('|')).sort()),J(w7));
      const b=LADDER.bikeSeat[PS], rb=R.filter(r=>/^bikeSeat\./.test(r.where));
      check('2. 逐字：bikeSeat 的 onFirst／offFirst 照稿',rb.length===2&&rb.every(r=>b[(/\.(onFirst|offFirst)$/.exec(r.where)||[])[1]]===r.new),J([b.onFirst,b.offFirst])); }
    const b=LADDER.bikeSeat[PS]; check('2. 坐後座：「腳踏車後座要抓哪裡？我只坐過汽車的後座。」「好好玩！比我想的穩，你有偷偷騎很慢對不對。」；on／off／decline、最低階段不動',b.onFirst==='腳踏車後座要抓哪裡？我只坐過汽車的後座。'&&b.offFirst==='好好玩！比我想的穩，你有偷偷騎很慢對不對。'&&(!OLD||['min','on','off','decline'].every(k=>J(b[k])===J(OLD.bikeSeat[PS][k]))),J(b));
    /* 2026-11-11（X327；AA 回覆 LAWWW）：大四下那一則同字的「早。我八點的課，七點就到了。」AA 也給了新字「早。八點的課我還是修了，不要問我為什麼。」（原本這裡驗「照舊」）——只換字，06～08 點的條件和註不動；大四上那一則照 AA_763 的字不動 */
    { const w2=when('Y4S2').filter(w=>w.t==='早。八點的課我還是修了，不要問我為什麼。');
      check('2. 大四下那一則同字的早上招呼照 AA 的回覆換成「早。八點的課我還是修了，不要問我為什麼。」（剛好一則、06～08 點；舊句整份階梯都不在了）；大四上那一則照舊是「早。我八點的課，今天居然趕上了。」',w2.length===1&&J(w2[0].time)===J([6,8])&&!J(LADDER).includes('早。我八點的課，七點就到了。')&&when('Y4S1').filter(w=>w.t==='早。我八點的課，今天居然趕上了。').length===1&&when('Y4S2').filter(w=>w.t==='早。我八點的課，今天居然趕上了。').length===0,J(when('Y4S2').map(w=>w.t))); }
    const all=J(Object.keys(LADDER.byTerm).map(t=>(LADDER.byTerm[t][PS]||{}).greet||null).concat([LADDER.bikeSeat[PS].onFirst,LADDER.bikeSeat[PS].offFirst]));
    check('2. 沛珊的招呼、坐後座沒有早餐店、蛋餅、煎蛋',!/早餐店|蛋餅|煎蛋/.test(all)); });

  await sec(3,async()=>{ const gc=read('src/data/greet_classday.js'), GC=JSON.parse(gc.slice(gc.indexOf('const GREET_CLASSDAY=')+21,gc.lastIndexOf(';'))), L=GC.classDay[PS]||[];
    const have=new Set(); for(const t of Object.keys(LADDER.byTerm).concat(['__y1'])){ const p=t==='__y1'?LADDER.characters[PS]:LADDER.byTerm[t][PS]; if(!p||!p.greet) continue; (p.greet.base||[]).forEach(x=>have.add(x)); (p.greet.when||[]).forEach(w=>have.add(w.t)); }
    check('3. greet_classday.js（只在上課日說）：沛珊的每一句都對得到 ladder.js 的招呼',L.length>=9&&L.every(t=>have.has(t)),J(L.filter(t=>!have.has(t))));
    check('3. 換了字的早上的招呼跟著換：「早。老師要比學生早到，我在練習，目前成功率一半。」「早。我八點的課，今天居然趕上了。」（大四上）「早。八點的課我還是修了，不要問我為什麼。」（大四下，2026-11-11 AA 回覆）都只在上課日說；舊句「早。我八點的課，七點就到了。」不在了',L.includes('早。老師要比學生早到，我在練習，目前成功率一半。')&&L.includes('早。我八點的課，今天居然趕上了。')&&L.includes('早。八點的課我還是修了，不要問我為什麼。')&&!L.includes('早。我八點的課，七點就到了。')&&!L.includes('早。……老師要比學生早到，我在練習。')&&/'早。八點的課我還是修了，不要問我為什麼。'\)[,}]/.test(read('tools/story/import_greet_classday.py')),J(L));   /* 2026-11-11（X324，AA_781）：RENAMED 後面多了以安一句，這一筆不再是最後一筆——舊期望 /…'\)\}/（緊接著字典結尾），改成 ),／)} 都可以 */
    const keys=Object.keys(STORY.LADDER_GREET_IF||{}); check('3. story3d.js 的 LADDER_GREET_IF（拿句子開頭當 key）沒有用到這九句的舊句',keys.length>0&&LAD.every(([t,o])=>!keys.some(k=>o.startsWith(k))),J(keys.filter(k=>LAD.some(([t,o])=>o.startsWith(k))))); });

  await sec(4,async()=>{ const m2=read('src/data/msg2_pool.js'), P2=new Function(m2.replace(/^'use strict';/m,'')+';return MSG2_POOL;')().people[PS].replies, tagged=P2.filter(e=>e.ps763);
    check('4. msg2_pool.js：沛珊換過的兩則（生日快樂 2026／2028／2029 的交往中、新年快樂的交往中）有記新稿的來源 ps763；topic、cond、tier、回問沒動',tagged.length===2&&J(tagged.map(e=>[e.topic,e.cond,e.tier]))===J([['bday','y2026_2028_2029','L'],['newyear',null,'L']])&&tagged.every(e=>e.ps763==='AA_763_peishan_misc3.json@'+S763)&&J(tagged[0].msgs)===J(['謝謝。今天收到的生日快樂裡，你這則我看了最多次。'])&&J(tagged[1].msgs)===J(['新年快樂。新的一年第一件事：你今年想做什麼？我要聽認真的。'])&&!!tagged[1].ask,J(tagged.map(e=>e.msgs)));
    const ob2=show(BASE,'src/data/msg2_pool.js'); if(ob2){ const strip=s=>s.split('\n').filter(l=>!/"ps763"/.test(l)).join('\n'), a=m2.split('\n'), b=ob2.split('\n'), dd=a.filter((l,i)=>l!==b[i]&&!/"ov": \[/.test(l));   /* 2026-11-11（X324 D 區，AA_785）：覆蓋層換過的那幾則（多一格 "ov"）不算——舊期望：不一樣的剛好兩行 */
      check('4. msg2_pool.js 和 BASE 比：一樣多行，只有這兩行不同（X324 覆蓋層換過的則另外算）',a.length===b.length&&dd.length===2&&dd.every(l=>/"ps763"/.test(l))); }
    if(!A) return;
    for(const f of A.files.slice(1)){ if(f.file==='src/data/msg2_pool.js'){ const all=P2.reduce((x,e)=>x.concat(e.msgs||[]),[]); check('4. '+f.file+'：兩列的 new 各一格、old 不在了',f.rows.every(r=>all.filter(t=>t===r.new).length===(r.count||1)&&!all.includes(r.old))); continue; }
      /* 2026-11-11（X324，AA_781 閒聊階梯通用層）：story3d.js 的 LADDER_GREET_IF 多了芷若兩句招呼的新字（拿掉刪節號；舊字的 key 照留）——是加上去的兩個字串，不是稿上這幾列，比 BASE 之前先拿掉（各一個）。舊期望：直接比 */
      const ADD781={'src/story3d.js':['（她在吧檯後面抬頭）嗨。','要打烊了。你可以坐到我擦完這張桌子。','學弟，我論文寫到第四章了。','{name}，我論文寫到第四章了。']};   /* 後兩句：學姊大四下「論文寫到第四章了」拿掉刪節號的新字（AA_781 Y4S2）*/
      const cur=read(f.file), L=(ADD781[f.file]||[]).reduce((a,t)=>{ const i=a.indexOf(t); return i<0?a:a.slice(0,i).concat(a.slice(i+1)); },lit(cur)), n=t=>L.filter(x=>x===t).length, bad=f.rows.filter(r=>n(r.new)!==(r.count||1)||n(r.old)!==0);
      check('4. '+f.file+'：'+f.rows.length+' 列的 new 各剛好 '+'count 處、old 不在了；檔裡寫了來源',bad.length===0&&cur.includes('AA_763_peishan_misc3.json@'+S763),J(bad.map(r=>[r.old,n(r.old),n(r.new)])));
      if(['src/date3d.js','src/aa614_3d.js'].includes(f.file)) continue;   /* 這兩個檔同一輪另外有改（約會四處、招呼條件那一段）：和 BASE 的整檔比對在 peishan_dates_1111、下面第 5 節 */
      /* 2026-11-11（X327 沛珊重寫，AA_766_peishan_leftover2.json@1e647bb05）：bbpack_events.js 後來又照 AA_766 換了 D4c 四題 25 句（tests/peishan_leftover2_1111_unit.js 逐字對稿）——那 25 句也算稿上的列 */
      let r766=[]; if(f.file==='src/data/bbpack_events.js'){ const t=show('1e647bb05','docs/story_planning/AA_766_peishan_leftover2.json'); if(!t) continue; r766=JSON.parse(t).rows.filter(r=>r.file===f.file); }
      /* 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：118 巷九間店改版）：這幾個檔後來又照 AA_772 換了幾句（rel_lines.js 見面旁白一句等）——BASE 先照白名單上的 AA_772 換過再比（tests/l118_redo772_expect.js）。舊期望：直接和 BASE 比 */
      /* 2026-11-11（X324，AA 回 LAWWW 原話指定）：story3d.js LADDER_REPLY_IF 以安 A4-L5 交往版拿掉刪節號（同一個位置換字，不是稿上這幾列）——也算在「不一樣的」裡。舊期望：只有稿上的列 */
      const SWAP1111={'src/story3d.js':[{old:'真的？……跟你講話本來就不用敬語啊。',new:'真的？跟你講話本來就不用敬語啊。'}]}, sw=SWAP1111[f.file]||[];
      const ob0=show(BASE,f.file); if(!ob0) continue; const ob=require('./line_rows_expect.js').fixFile(f.file,require('./l118_redo772_expect.js').fixFile(f.file,ob0))/* X324 G 區逐行改稿（AA_794 店長→老闆等）也先換過 */, O=lit(ob), L4=f.file==='src/data/bbpack_events.js'?lit(show('cfc0fd04bf',f.file)||cur):L/* CANON-NO-ECON-1112 第三批（舊序章人物那幾場整場拿掉）：bbpack_events.js 和 BASE 比用拿掉以前那一版 */, d=O.map((t,i)=>[t,L4[i]]).filter(([x,y])=>x!==y&&!require('./kx_rewrite_1112.js').pair(x,y)), set=new Set(f.rows.concat(r766,sw).map(r=>r.old+'→'+r.new));   /* 2026-11-12（X324 可昕續改，AA_827_kx_triple_short_2.json@07d50af2f7，bbpack_events.js:504）：可昕來找品妤那一句後來換了字（清單在 tests/kx_rewrite_1112.js、逐列對稿 tests/kx_triple2_1112_unit.js）——那一句先不算再比。舊期望：直接和 BASE 比 */
      check('4. '+f.file+'：字串和 BASE 逐個比一樣多，不一樣的剛好是稿上這 '+f.rows.length+' 列'+(r766.length?'＋AA_766 的 '+r766.length+' 列':'')+(sw.length?'＋A4-L5 交往版拿掉刪節號 '+sw.length+' 列':''),O.length===L4.length&&d.length===f.rows.length+r766.length+sw.length&&d.every(([x,y])=>set.has(x+'→'+y)),J(d.filter(([x,y])=>!set.has(x+'→'+y)).slice(0,3))); }
    check('4. date3d.js：T7A_YES、HOME_NO 沛珊那兩句照稿（別人的不動）',DATE.T7A_YES[PS]==='你要來台中喔？好啊！我去車站接你，這次我會準時！'&&DATE.HOME_NO[PS]==='「那幾天我回台中啦！換一天好不好？」'&&DATE.T7A_YES.heroine_01==='臺中？好。我去車站接你。' /* 2026-11-11（X324 以安約會台詞重寫，AA_777_an_date_common.json@1f88da7cc）：以安這一句拿掉刪節號，原本「臺中？……好。我去車站接你。」——「別人的不動」說的是沛珊那一輪 */&&DATE.HOME_NO.heroine_02==='「那個禮拜我回台中了。換一天好不好？」',J([DATE.T7A_YES&&DATE.T7A_YES[PS],DATE.HOME_NO&&DATE.HOME_NO[PS]])); });

  await sec(5,async()=>{ const md=show(S326,F326);
    if(md) check('5. BB_326 第 4 節原文：溫州街、週三 18:00～21:00、Y1S1～Y2S1；週三 21:00～22:30，不限地點；舊的兩組條件拿掉',md.includes('溫州街、週三 18:00～21:00、Y1S1～Y2S1')&&md.includes('週三 21:00～22:30，不限地點')&&md.includes('舊的週二四 16:30～18:00、週二三四兩組條件拿掉'));
    /* aa614_3d.js 不在 pg_harness 的載入清單：照 tests/aa614_jobs_unit.js 的方式載入（它載入時會動 LADDER——招呼那一段已經拿掉，這裡確認載入以後條件還在） */
    for(const f of ['src/data/greet_classday.js','src/data/shop_npc.js','src/data/heroine_circle.js','src/whois3d.js','src/aa614_3d.js']){ const s=read(f).replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }
    const c1=when('Y1S2').filter(w=>w.t===X_CROSS), c2=when('Y2S1').filter(w=>w.t===X_CROSS), bk=when('Y2S1').filter(w=>w.t===X_BACK);
    check('5. 資料：「…等一下！我在上班！」大一下、大二上各一則＝{location:[wenzhou], weekday:[3], time:[18,21]}（載入 aa614_3d.js 以後也是）',c1.length===1&&c2.length===1&&[c1[0],c2[0]].every(w=>J(cond(w))===J({location:['wenzhou'],weekday:[3],time:[18,21]})),J([c1,c2]));
    check('5. 資料：「我剛從課輔班回來。你看我的手，都是紅筆。」（大二上）＝{weekday:[3], time:[21,22.5]}，沒有地點條件',bk.length===1&&J(cond(bk[0]))===J({weekday:[3],time:[21,22.5]}),J(bk));
    const allW=J(['Y1S2','Y2S1'].map(t=>when(t).map(cond)));
    check('5. 舊的兩組條件（週二四／週二三四 16:30～18:00、18:00～21:00）不在了；大一下、大二上的招呼沒有 16.5 開始的時段、沒有 weekday [2,4]／[2,3,4]',!allW.includes('16.5')&&!allW.includes('"weekday":[2,4]')&&!allW.includes('"weekday":[2,3,4]'),allW);
    if(OLD) for(const t of ['Y1S2','Y2S1']){ const o=OLD.byTerm[t][PS].greet.when, n=when(t); check('5. '+t+'：其他招呼（下雨、早上、期末）的條件和順序沒動，只改課輔班那 '+(t==='Y1S2'?1:2)+' 則的 weekday／time',o.length===n.length&&o.every((w,i)=>w.t===n[i].t&&(w.t===X_CROSS||w.t===X_BACK||J(cond(w))===J(cond(n[i]))))); }
    check('5. src/aa614_3d.js（註解以外）不再把那一則搬到 20:50～21:10',!/w\.time=\[20\+50\/60/.test(noCom(read('src/aa614_3d.js'))));
    /* 實際抽招呼：同一天抽好幾次（when 先抽、每句一天一次），看那一句有沒有出來 */
    const greets=(key,h,zone)=>{ const G=H.fresh(key,h,zone,null); H.rel(PS,65,50,45); const out=[]; for(let i=0;i<10;i++){ const t=STORY.ladGreet(G,PS); if(t) out.push(t); } return {out,wd:G.weekday,term:(CALENDAR.termOf(G.day)||{}).id}; };
    for(const [term,wed,tue] of [['Y1S2','2026-04-22','2026-04-21'],['Y2S1','2026-10-21','2026-10-20']]){
      const a=greets(wed,19,'wenzhou'), b=greets(tue,17,'wenzhou'), c=greets(wed,19,'campus'), d=greets(wed,17,'wenzhou');
      check('5. '+term+' 週三 19:00 在溫州街：招呼出得來「…等一下！我在上班！」',a.term===term&&a.wd===3&&a.out.includes(X_CROSS),J(a));
      check('5. '+term+' 週二 17:00 在溫州街（舊條件的時段）：出不來',b.term===term&&b.wd===2&&!b.out.includes(X_CROSS),J(b));
      check('5. '+term+' 週三 19:00 不在溫州街（校園）、週三 17:00 在溫州街（還沒上班）：都出不來',!c.out.includes(X_CROSS)&&!d.out.includes(X_CROSS),J([c.out,d.out])); }
    { const zs=['campus','wenzhou','library','gongguan'], r=zs.map(z=>greets('2026-10-21',21.5,z)), a=greets('2026-10-21',19,'campus'), b=greets('2026-10-21',19,'wenzhou'), e=greets('2026-10-20',21.5,'campus'), l=greets('2026-10-21',22.6,'campus');
      check('5. 大二上週三 21:30：校園、溫州街、總圖、公館都出得來「我剛從課輔班回來。你看我的手，都是紅筆。」',r.every(x=>x.term==='Y2S1'&&x.wd===3&&x.out.includes(X_BACK)),J(r.map(x=>x.out.includes(X_BACK))));
      check('5. 大二上週三 19:00（她還在上班）：「我剛從課輔班回來」出不來（校園、溫州街都一樣）；週二 21:30、週三 22:36 也出不來',!a.out.includes(X_BACK)&&!b.out.includes(X_BACK)&&!e.out.includes(X_BACK)&&!l.out.includes(X_BACK),J([a.out,b.out,e.out,l.out]));
      const y1=greets('2026-04-22',21.5,'campus'); check('5. 大一下沒有「我剛從課輔班回來」這一則（稿只有大二上有）：週三 21:30 不會出',!y1.out.includes(X_BACK)); } });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
