// 沛珊重寫第三份之二：動態牆八則、其他檔零散的句子、節日整段（PEISHAN-VOICE-1110；使用者 X327；AA_755_peishan_feed_misc@c5094495d，2026-11-11）——不需要瀏覽器（D131）。
//   1. 白名單一筆、tools/story/ps755.py 只認這個 SHA；工具產生的五個檔重新匯入的結果和現在的檔一樣（--check）
//   2. 動態牆八則：id、who、st、日期不動；貼文鐘點、pic、say、cm、dm 一字照稿（ps4f 的 say 是空字串）
//   3. other：每一列的 new 在那個檔的沛珊底下剛好一處、old 不在了（msg_pool 三則、invites 四處＋invite_replies 同句、activity_scenes、arc_rot 兩處、gift_holiday 四處；existing 第三則拿掉）
//   4. fest：fest_events.js 沛珊整段的字照稿；條件、年份、地點、背景、CG 判斷、blackout、價錢、ok 和重寫以前（BASE）一樣
//   5. 這些地方沒有重寫前的字（早餐店、蛋餅、煎台、四點半、喜鵲的問題）
// 稿、BASE 讀 git show；讀不到（淺層複本）＝不比稿，只驗結構。用法：node tests/peishan_feed_misc_1111_unit.js
const H=require('./pg_harness.js');
const {check}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), vm=require('vm');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const PS='classmate_peishan', SHA='c5094495d', F='docs/story_planning/AA_755_peishan_feed_misc.json', BASE='a724370bc';
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
const read=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const raw=show(SHA,F), A=raw?JSON.parse(raw):null;
/* 資料檔各自在自己的 context 載入（不碰 harness 的全域）：回傳那個常數 */
const loadConst=(src,name,extra)=>{ const ctx=vm.createContext(Object.assign({console,STORY_EVENTS:[],module:{exports:{}}},extra||{})); vm.runInContext(src.replace(new RegExp('^const '+name+'\\s*=','m'),'globalThis.'+name+'='),ctx); return ctx[name]; };
const FEEDS={'feed_y1s1.js':'FEED_Y1S1','feed_y1s2.js':'FEED_Y1S2','feed_y3s1.js':'FEED_Y3S1','feed_y3s2.js':'FEED_Y3S2','feed_pg.js':'FEED_PG'};
const feedOf=(f,src)=>loadConst(src||read('src/data/'+f),FEEDS[f]);
const strs=(o,out)=>{ if(typeof o==='string') out.push(o); else if(Array.isArray(o)) o.forEach(x=>strs(x,out)); else if(o&&typeof o==='object') Object.values(o).forEach(x=>strs(x,out)); return out; };
/* o 底下、key 是 classmate_peishan 的每一棵 */
const trees=(o,out)=>{ if(Array.isArray(o)) o.forEach(x=>trees(x,out)); else if(o&&typeof o==='object') for(const k in o){ if(k===PS) out.push(o[k]); else trees(o[k],out); } return out; };
const count=(o,t)=>{ let n=0; const w=x=>{ if(J(x)===J(t)&&typeof x===typeof t&&Array.isArray(x)===Array.isArray(t)) n++; else if(Array.isArray(x)) x.forEach(w); else if(x&&typeof x==='object') Object.values(x).forEach(w); }; w(o); return n; };

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files.filter(e=>e.path===F);
    check('1. 白名單一筆 AA_755_peishan_feed_misc、sha '+SHA+'、approved；tools/story/ps755.py 寫死只認這一版',allow.length===1&&allow[0].sha===SHA&&allow[0].status==='approved'&&read('tools/story/ps755.py').includes("SHA = '"+SHA+"'"));
    console.log(A?'（稿讀得到：逐字比對）':'（這份 checkout 讀不到企劃線的稿：不比稿，只驗結構）');
    if(A) for(const [tool,args] of [['tools/story/import_activity_scenes.py',['--check']],['tools/story/import_arc_rot.py',['--check']],['tools/gift/import_gift_holiday.py',['--check']]]){
      let ok=false, out=''; try{ out=cp.execFileSync('python3',[tool].concat(args),{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/m.test(out); }catch(e){ out=String(e.stderr||e.stdout||e.message).slice(0,200); }
      check('1. '+tool+' --check：資料檔和工具重匯（含 AA_755 疊稿）的結果一樣',ok,out.slice(0,160)); }
    /* 2026-11-11（X324 A 區，AA_708@d30416e6b）：一起活動的沛珊整塊重寫了，AA_755 在 activity_scenes.js 的那一列（第 4 階 mid「我家早餐店的蘿蔔糕」）不再疊（tools/story/ps755.py SUPERSEDED）；舊期望：三個檔的檔頭都寫 AA_755、other 14 列都在 */
    check('1. activity_scenes.js：AA_755 那一列被上游重寫取代（ps755.SUPERSEDED），檔頭不再寫 AA_755',/SUPERSEDED = \{'activity_scenes\.js'/.test(read('tools/story/ps755.py'))&&!read('src/data/activity_scenes.js').split('\n')[0].includes('AA_755'));
    for(const f of ['arc_rot.js','gift_holiday.js']) check('1. src/data/'+f+' 的檔頭寫了 AA_755_peishan_feed_misc.json@'+SHA,read('src/data/'+f).split('\n')[0].includes('AA_755_peishan_feed_misc.json@'+SHA)); });

  await sec(2,async()=>{ const IDS={'feed_y1s1.js':['ps4','ps5','ps6'],'feed_y1s2.js':['ps1b','ps6b'],'feed_y3s1.js':['ps4e'],'feed_y3s2.js':['ps4f'],'feed_pg.js':['ps2i']};
    if(A) check('2. 稿上八則＝這八個 id',J(A.feed.map(r=>r.file+':'+r.id).sort())===J(Object.keys(IDS).flatMap(f=>IDS[f].map(i=>f+':'+i)).sort()));
    for(const f of Object.keys(IDS)){ const D=feedOf(f), ob=show(BASE,'src/data/'+f), O=ob?feedOf(f,ob):null;
      for(const id of IDS[f]){ const p=D.posts.filter(x=>x.id===id), r=A&&A.feed.find(x=>x.file===f&&x.id===id), o=O&&O.posts.find(x=>x.id===id);
        check('2. '+f+' '+id+'：剛好一則、是沛珊的、cm／dm 各兩句',p.length===1&&p[0].who===PS&&p[0].cm.length===2&&p[0].dm.length===2&&typeof p[0].say==='string');
        if(r) check('2. '+f+' '+id+'：pic、say、cm、dm、貼文時間一字照稿',p[0].pic===r.new.pic&&p[0].say===r.new.say&&J(p[0].cm)===J(r.new.cm)&&J(p[0].dm)===J(r.new.dm)&&p[0].t===r.new.t,J(p[0]));
        if(o) check('2. '+f+' '+id+'：id、who、st 和重寫以前一樣；日期沒變、只改鐘點；其他欄位沒有多沒有少',p[0].who===o.who&&p[0].st===o.st&&p[0].t.slice(0,10)===o.t.slice(0,10)&&J(Object.keys(p[0]).sort())===J(Object.keys(o).sort()),J([p[0].t,o.t,p[0].st,o.st])); }
      /* 2026-11-11（X327 漏改，AA_807@551786903／AA_808@0806059b7）：其他貼文裡沛珊的句尾「～」照 AA_808 改了（feed_y1s1 3 列、feed_y1s2 5 列、feed_y3s1 6 列、feed_y3s2 9 列、feed_pg 8 列）——BASE 先照 AA_807／808 換過（line_rows_expect.js fixFile）再比。舊期望：其他貼文和 BASE 原樣一字不差 */
      if(O){ const Of=feedOf(f,require('./line_rows_expect.js').fixFile('src/data/'+f,ob)), rest=x=>J(x.posts.filter(q=>!IDS[f].includes(q.id)&&!require('./kx885_expect.js').skip(q.id)));   /* （CANON-NO-ECON-1112 第四批：照 AA_885 換字）可昕那幾則改比 tests/kx885_expect.js */ check('2. '+f+'：其他貼文（'+(D.posts.length-IDS[f].length)+' 則）沒有動、順序沒有動（AA_808 那幾句除外）',rest(D)===rest(Of)&&J(D.posts.map(q=>q.id))===J(O.posts.map(q=>q.id))); } }
    const y32=feedOf('feed_y3s2.js').posts.find(x=>x.id==='ps4f'); check('2. ps4f 的 say 是空字串（照稿）',y32.say===''); });

  await sec(3,async()=>{ const DATA={
      'msg_pool.js':()=>({[PS]:loadConst(read('src/data/msg_pool.js'),'MSG_POOL').people[PS]}),
      'invites.js':()=>{ const D=loadConst(read('src/data/invites.js'),'INVITE_DATA').people[PS]; return {[PS]:{firstAt:D.firstAt,acc:D.acc,first:D.first}}; },
      'activity_scenes.js':()=>loadConst(read('src/data/activity_scenes.js'),'ACTIVITY_SCENES'),
      'arc_rot.js':()=>loadConst(read('src/data/arc_rot.js'),'ARC_ROT'),
      'gift_holiday.js':()=>loadConst(read('src/data/gift_holiday.js'),'GIFT_HOLIDAY') };
    const T={}; for(const f in DATA) T[f]=trees(DATA[f](),[]);
    check('3. 五個檔都找得到沛珊的資料',Object.keys(T).every(f=>T[f].length>=1),J(Object.keys(T).map(f=>[f,T[f].length])));
    if(A){ const bad=[]; for(const r of A.other){ const t=T[r.file]; if(r.file==='activity_scenes.js'){ const nN=t.reduce((a,x)=>a+count(x,r.new),0), nO=t.reduce((a,x)=>a+count(x,r.old),0); if(nO!==0) bad.push('activity_scenes.js：舊句還在'); continue; }   /* 上游重寫：新舊都不在（舊的「我家早餐店」不能回來）*/ if(!t){ bad.push(r.file+'：測試不認得的檔'); continue; } const nNew=t.reduce((a,x)=>a+count(x,r.new),0), nOld=t.reduce((a,x)=>a+count(x,r.old),0); if(nNew!==1||nOld!==0) bad.push(r.file+'（'+r.at+'）new '+nNew+' 處、old '+nOld+' 處'); }
      check('3. other '+A.other.length+' 列：每一列的 new 在那個檔沛珊底下剛好一處、old 不在了',A.other.length===14&&bad.length===0,J(bad));
      const R=loadConst(read('src/data/invite_replies.js'),'INVITE_REPLIES').people[PS], m={}; for(const r of A.other) if(r.file==='invites.js'&&r.old.length===1) m[r.old[0]]=r.new[0];
      const all=strs(R,[]);
      check('3. invite_replies.js 沛珊：和 invites.js 同句的（ps5、ps9）跟著換成新句，舊句不在了；其他列沒動',Object.keys(m).every(o=>!all.some(t=>t.includes(o)))&&J(R.find(x=>x.id==='ps5').lines)===J(['早午餐！好啊，那種不用太早起的我最可以。'])&&J(R.find(x=>x.id==='ps9').lines)===J(['好啊。我想坐吧台，可以看他們做。'])&&R.length===32,J(R.filter(x=>x.id==='ps5'||x.id==='ps9').map(x=>x.lines)));
      const mp=loadConst(read('src/data/msg_pool.js'),'MSG_POOL').people[PS].replies.filter(e=>e.ps755);
      check('3. msg_pool.js：換過的三則有記新稿的來源（ps755），topic、tier、variant 沒動',mp.length===3&&J(mp.map(e=>[e.topic,e.tier,e.variant]))===J([['chat','R',null],['share_food','A',null],['chat','A','放假、在台中']])&&mp.every(e=>e.ps755===F+'@'+SHA),J(mp.map(e=>[e.topic,e.tier,e.variant]))); }
    const ex=loadConst(read('src/data/gift_holiday.js'),'GIFT_HOLIDAY'); const E=trees(ex,[]).map(x=>x&&x.existing).filter(Boolean)[0]||[];
    check('3. gift_holiday.js 沛珊的 existing：剩兩則（七夕「不送喜鵲的答案」那一則拿掉）、沒有「蛋餅」',E.length===2&&!E.some(t=>/喜鵲|蛋餅/.test(t)),J(E)); });

  await sec(4,async()=>{ const cur=read('src/data/fest_events.js'), ob=show(BASE,'src/data/fest_events.js');
    const cut=s=>{ const a=s.indexOf('    [PS]:{'), b=s.indexOf('    /* ---------------- 第 9 節 杜可昕',a); return a>0&&b>a?s.slice(a,b):null; };
    const B=cut(cur); check('4. fest_events.js 有沛珊那一段',!!B); if(!B) return;
    const lit=s=>{ const out=[]; s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/'((?:[^'\\]|\\.)*)'/g,(m,t)=>{ out.push(t); return m; }); return out; };
    const L=lit(B);
    if(A){ const Fx=A.fest, want=[]; const add=x=>{ if(typeof x==='string') want.push(x); else if(Array.isArray(x)) x.forEach(add); else if(x&&typeof x==='object'){ if(x.t) want.push(x.t); if(x.narr) want.push(x.narr); } };
      for(const k of ['vday','white','qixi','bday','xmas']) for(const c of ['s6','dt','vid2027']) add(Fx[k][c]);
      add(Fx.ask.lines); add(Fx.ask.homeLines); add(Fx.ask.no); for(const k in Fx.ask.homeBy) for(const c in Fx.ask.homeBy[k]) add(Fx.ask.homeBy[k][c]); for(const k in Fx.gifts) add(Fx.gifts[k]); add(Fx.none);
      const miss=want.filter(t=>L.filter(x=>x===t).length<1), uniq=[...new Set(want)];
      check('4. 稿 fest 的每一句（'+want.length+' 句）都在這一段、一字不差',want.length===35&&miss.length===0,J(miss));
      /* 這一段裡是「她說的話」的字串＝P('…')、text:'…'、ask／homeBy／no 的陣列；都要是稿上的句子（不留舊句） */
      const said=[]; B.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(?:\bP\(|\bN\(|text:)'((?:[^'\\]|\\.)*)'/g,(m,t)=>{ said.push(t); return m; }); B.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(?:lines|homeLines|no|台中|台南):\[((?:'(?:[^'\\]|\\.)*',?)+)\]/g,(m,g)=>{ g.replace(/'((?:[^'\\]|\\.)*)'/g,(q,t)=>{ said.push(t); return q; }); return m; });
      const extra=[...new Set(said)].filter(t=>!uniq.includes(t));
      check('4. 這一段她說的每一句都是稿上的（沒有留舊句）',said.length>=35&&extra.length===0,J(extra));
      check('4. 逐格：情人節 s6／dt 各兩句、七夕交往中兩句、生日 s6 兩句、聖誕各一句，順序照稿',B.includes("vday:{s6:[P('"+Fx.vday.s6[0]+"'),P('"+Fx.vday.s6[1]+"')],dt:[P('"+Fx.vday.dt[0]+"'),P('"+Fx.vday.dt[1]+"')],")&&B.includes("qixi:{s6:[P('"+Fx.qixi.s6[0]+"')],dt:[P('"+Fx.qixi.dt[0]+"'),P('"+Fx.qixi.dt[1]+"')]},")&&B.includes("bday:{s6:[P('"+Fx.bday.s6[0]+"'),P('"+Fx.bday.s6[1]+"')],dt:[P('"+Fx.bday.dt[0]+"')],")&&B.includes("xmas:{s6:[P('"+Fx.xmas.s6[0]+"')],dt:[P('"+Fx.xmas.dt[0]+"')]} },")); }
    if(ob){ const O=cut(ob); const skel=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/'((?:[^'\\]|\\.)*)'/g,(m,t)=>/[一-鿿（）]/.test(t)&&!/^(映月湖邊|溫州街口|台中|台南|一本入門的哲學書|一盒給課輔班小孩的貼紙|一支好寫的筆|一盒很貴的巧克力)$/.test(t)?"'…'":m).replace(/\s+/g,'');
      /* 七夕交往中一句 → 兩句：骨架上多一個 P('…')，比的時候補回去 */
      const so=skel(O).replace("qixi:{s6:[P('…')],dt:[P('…')]}","qixi:{s6:[P('…')],dt:[P('…'),P('…')]}"), sc=skel(B);
      check('4. 骨架和重寫以前一樣：條件（years、custom、dtOnly、call）、地點、背景、CG 的判斷、blackout、禮物的名字／價錢／ok、home 都沒動（只差七夕交往中多一句）',so===sc,(()=>{ let i=0; while(i<so.length&&so[i]===sc[i]) i++; return so.slice(Math.max(0,i-40),i+60)+' ≠ '+sc.slice(Math.max(0,i-40),i+60); })());
      const other=s=>s.slice(0,s.indexOf('    /* ---------------- 第 8 節 郭沛珊'))+s.slice(s.indexOf('    /* ---------------- 第 9 節 杜可昕'));
      /* 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：118 巷九間店改版）：芯慈情人節約的地點名照 AA_772 第 107 列換了（巷口家常菜→五湖四海）——BASE 先照白名單上的 AA_772 換過再比（tests/l118_redo772_expect.js）。舊期望：其他人的段落和 BASE 一字不差 */
      check('4. fest_events.js 其他人的段落沒有動（AA_772 那一列除外）',other(cur)===require('./line_rows_expect.js').fixFile('src/data/fest_events.js',require('./l118_redo772_expect.js').fixFile('src/data/fest_events.js',other(ob))).split('麵店團').join('桌遊團')/* NOODLE-NAME-PURGE-1112（30b7bb9337）：全庫麵店團→桌遊團，基準也換過再比 *//* X324 G 區 AA_794 芷若店長→老闆也算 */); }
    check('4. 巧克力照舊 ok:false、800 元；白色情人節的 CG（cg_last_page_peishan）兩處條件照舊',B.includes("{id:'choco',name:'一盒很貴的巧克力',price:800,ok:false,")&&B.split("cg('cg_last_page_peishan',G=>!tainan(G)&&!F(G,'PS_WHITE_CG'))").length===3&&B.includes("blackout:['2026-12-17','2027-08-06']")); });

  await sec(5,async()=>{ const OLDW=/早餐店|蛋餅|煎台|四點半|喜鵲|豆漿|蘿蔔糕/;
    const bad=[]; for(const f in FEEDS){ for(const p of feedOf(f).posts.filter(x=>x.who===PS)){ const t=J([p.pic,p.say,p.cm,p.dm]); if(OLDW.test(t)) bad.push(f+':'+p.id); } }
    check('5. 動態牆：沛珊的每一則（不只這八則）都沒有早餐店、蛋餅、煎台、四點半',bad.length===0,J(bad));
    const cur=read('src/data/fest_events.js'); const a=cur.indexOf('    [PS]:{'), b=cur.indexOf('    /* ---------------- 第 9 節 杜可昕',a);
    check('5. fest_events.js 沛珊那一段（註解以外）沒有早餐店、蛋餅、喜鵲、「論證」「我問你的問題」',!/早餐店|蛋餅|喜鵲|論證|我問你的問題/.test(cur.slice(a,b).replace(/\/\*[\s\S]*?\*\//g,'')));
    const inv=loadConst(read('src/data/invites.js'),'INVITE_DATA').people[PS]; const it=J([inv.firstAt,inv.acc,inv.first]);
    check('5. invites.js 沛珊的 firstAt／acc／first 沒有早餐店、翻蛋、四點半',!/早餐店|蛋怎麼翻|我媽也是|四點半/.test(it),it.slice(0,200));
    const mp=J(loadConst(read('src/data/msg_pool.js'),'MSG_POOL').people[PS].replies.map(e=>e.msgs));
    check('5. msg_pool.js 沛珊的回覆沒有「早餐店」',!/早餐店/.test(mp)); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
