// 沛珊重寫（PEISHAN-VOICE-1110；使用者 X327）：她在事件檔的句子（2026-11-11）——不需要瀏覽器（D131）。
//   AA_761_peishan_events_1.json@dbfc596a5：src/data/events.js 十場事件 18 列（count＝那一句在檔裡出現幾次，全部換；兩列 count 2）
//   AA_762_peishan_events_2.json@1fc9a6658：camp_y1.js 4 列、vac_activities.js 10 列、rom1016_events.js 5 列、r2y4b_events.js 3 列（每列 count 1）
//   1. 每一列的 new 在檔裡剛好 count 處、old 不在了；events.js 的每一列 new 落在稿寫的那一場事件裡、實際載入的事件資料裡找得到
//   2. 每個檔的字串和重寫以前（BASE）逐個比：一樣多，不一樣的剛好是稿上的那幾列——選項的字、別人的句子、條件、旗標、數值都沒動
//   3. 註解以外沒有重寫前的字（我沒出過國、護照握得很緊、我第一次出國耶）；firstOnly 的邏輯照舊
// 稿、BASE 讀 git show；讀不到（淺層複本）＝不比稿，只驗結構。用法：node tests/peishan_events_1111_unit.js
const H=require('./pg_harness.js');
const {check}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const PS='classmate_peishan', BASE='7cfb90cd7', SP='docs/story_planning/';
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
/* 2026-11-11 之後故意改的檔（不是沛珊重寫的範圍，各自有逐句對稿的測試）：用改之前那一版（9d45ef8b3，沛珊重寫都在裡面、這支測試在那裡全過）比——
   AA_814（企劃線 91c6aaf9f，tests/aa814_prio_gap_1111_unit.js）改了 events.js（1/8 j8a、2/14 E27b）、vac_activities.js（沛珊重考期回國訊息兩段、noOff）；
   AA_742 第 ③ 節（tests/gg_shops3_story_1111_unit.js）改了 story3d.js 明軒「公館一百元以內」那一列（日日定食→泰米村食）。讀不到那一版（淺層複本）＝照現在的檔 */
const LATER_PIN='9d45ef8b3', LATER_FILES=['src/data/events.js','src/data/vac_activities.js'];
/* 2026-11-12（CANON-1112：舊序章拿掉／可昕開局不認識）：camp_y1.js 照 AA_859 改了打牌那一段、拿掉夜談的定義和幾句舊序章的字（tests/canon_opening_1112_unit.js 逐字對稿）——不是沛珊重寫的範圍。
   和 BASE 逐個比（字串數、骨架）用改之前那一版（6c2ecfc0af，這支測試在那裡全過）；現在的檔另外查沛珊那四列還在、各一處（第 2 節最後一項）。
   舊期望：camp_y1.js 現在的檔直接和 BASE 比，一樣多、只差稿上 4 列。讀不到那一版（淺層複本）＝照現在的檔 */
const CANON_PIN='6c2ecfc0af', CANON_FILES=['src/data/camp_y1.js'];
const read=f=>{ if(LATER_FILES.includes(f)){ const t=show(LATER_PIN,f); if(t!=null) return t; } if(CANON_FILES.includes(f)){ const t=show(CANON_PIN,f); if(t!=null) return t; } return require('./aa959_map.js').unmapCode(fs.readFileSync(path.join(H.ROOT,f),'utf8'),path.basename(f))/* AA_959：之後照覆寫表換的整句先換回來再比 */; };
const noCom=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');
const lit=s=>{ const out=[]; noCom(s).replace(/'((?:[^'\\]|\\.)*)'/g,(m,t)=>{ out.push(t); return m; }); return out; };
const strs=(o,out)=>{ if(typeof o==='string') out.push(o); else if(Array.isArray(o)) o.forEach(x=>strs(x,out)); else if(o&&typeof o==='object') Object.values(o).forEach(x=>strs(x,out)); return out; };
const D1={f:'AA_761_peishan_events_1.json',sha:'dbfc596a5'}, D2={f:'AA_762_peishan_events_2.json',sha:'1fc9a6658'};
for(const D of [D1,D2]){ const raw=show(D.sha,SP+D.f); D.A=raw?JSON.parse(raw):null; }
/* 一個檔：rows＝[{old,new,count,ev?}] */
/* 2026-11-11（X327 漏改，AA_807@551786903／AA_808@0806059b7）：AA_808 又把 vac_activities.js 沛珊和她出國的兩句改了（第 558 列：AA_762 那一列的 new「我以前都跟在我媽後面，原來要自己填這麼多東西～」→「…東西。」、
   不在 AA_762 的「我媽說我傳太多了～」→「我媽說我傳太多了。她已讀的速度跟不上。」）——稿那一列的 new 照 AA_808 往前換（line_rows_expect.js fwdS）再數；BASE 先照 AA_807／808 換過（fixFile）再逐個比。
   沒有 AA_807／808 列的檔（events.js、camp_y1.js、rom1016_events.js、r2y4b_events.js）兩個都是原樣。舊期望：稿的 new 原樣數、BASE 原樣比（vac_activities.js 不一樣的 11 處） */
const LR=require('./line_rows_expect.js');
/* 2026-11-12（BAR-GROUP-3D-1112，AA_836 文末「熱可可那句分兩版」＠44ed07c50）：r2y4b_events.js 的 ev_bar_group_night「first」那一段多一列（兩杯那一版）、原列的條件多一個 who===three。
   舊期望：r2y4b_events.js 的字串數、骨架和 BASE 一模一樣。現在：先確認那兩列剛好是下面這兩行（各一處），換回改之前那一列再照原標準比（其他地方一樣不准動）*/
const BAR_OLD="{unless:{custom:G=>{ const r=R(), x=r&&r.session(G,G.day); return !!x&&x.mode==='library'; }},speaker:null,text:'（十點，語彤買了三杯熱可可上來，兩杯推到你和可昕面前。）'},";
const BAR_NEW=["{if:{custom:G=>{ const r=R(), x=r&&r.session(G,G.day); return !(x&&x.mode==='library')&&!!x&&x.who==='three'; }},speaker:null,text:'（十點，語彤買了三杯熱可可上來，兩杯推到你和可昕面前。）'},","{if:{custom:G=>{ const r=R(), x=r&&r.session(G,G.day); return !(x&&x.mode==='library')&&!(x&&x.who==='three'); }},speaker:null,text:'（十點，語彤買了兩杯熱可可上來，一杯推到你面前。）'},"];
const barBack=(f,s)=>{ if(f!=='src/data/r2y4b_events.js') return s; const ok=BAR_NEW.every(x=>s.split(x).length===2); check('2. '+f+'：熱可可分兩版那兩列各剛好一處（AA_836 文末）',ok); if(!ok) return s;
  const a=s.indexOf(BAR_NEW[0]), b=s.indexOf(BAR_NEW[1]); const mid=s.slice(a+BAR_NEW[0].length,b); check('2. '+f+'：那兩列中間只有註解和空白',noCom(mid).trim()===''&&b>a,mid.slice(0,80)); return s.slice(0,a)+BAR_OLD+s.slice(b+BAR_NEW[1].length); };
const canonCut=(f,s)=>{ if(f!=='src/data/r2y4b_events.js'||!s) return s; const a=s.indexOf('  /* ---------- 2-Y4-40 '), b=s.indexOf('  /* ---------- 2-Y4-43 '); return a>=0&&b>a?s.slice(0,a)+s.slice(b):s; };   /* 讀書會的最後一晚那一場（CANON-NO-ECON-1112 第三批：這一項拿掉）：BASE 那一段不比 */
/* CANON-NO-ECON-1112 第四批（AA_875 第 2 節換字）：可昕那一組旁白（R2Y4B_BAR_NARR.kexin）和律師讀書小組那一段（2-Y4-58 到 2-Y4-61 以前）換了字、只有可昕的那幾晚改當面——兩邊都切掉不比（逐字對稿在 tests/aa468_evdup2_unit.js、tests/r2y4b_events_unit.js、tests/bar_group_3d_1112_unit.js）*/
/* CANON-NO-ECON-1112 第四批（AA_880 #46、#47；AA_897 第 2 節）：可昕大四春假開車旅行（從女生宿舍樓下出發）、大四生日（帶到女生宿舍樓下）兩場整場換過、rom1016 週年那本的 p4 那一頁拿掉——兩邊都切掉不比（逐字對稿在 tests/r2y4b_events_unit.js、tests/kx_line_873_unit.js）*/
const cut4=(f,s)=>{ if(!s) return s; if(f==='src/data/rom1016_events.js') return s.split('\n').filter(l=>!/^    (p4:'2025\.2\.2|\/\* p4（2025\.2\.2)/.test(l)).join('\n'); if(f!=='src/data/r2y4b_events.js') return s; const cut=(x,A,B)=>{ const a=x.indexOf(A), b=a>=0?x.indexOf(B,a):-1; return a>=0&&b>a?x.slice(0,a)+x.slice(b):x; };
  return cut(cut(cut(cut(s,'  kexin:{','  yutong:{'),'  /* ---------- 2-Y4-58 律師讀書小組','  /* ---------- 2-Y4-61 '),"  { id:'ev_kexin_trip_spring_y4'",'  /* ---------- 2-Y4-36 '),'  /* ---------- 2-Y4-38 ','  /* ---------- 2-Y4-39 '); };
const fileCheck=(tag,f,rows0,total)=>{ const cur=cut4(f,barBack(f,require('./canon898_1112.js').back(read(f))))/* （CANON-NO-ECON-1112 第四批：照 AA_898 換字）學姊「班次，回去前發給你。」先換回舊句再比 */  /* （CANON-NO-ECON-1112 第四批合併：兩邊都算） */, L=lit(cur), n=t=>L.filter(x=>x===t).length, rows=rows0.map(r=>Object.assign({},r,{new:LR.fwdS(r.new,f)}));
  const bad=rows.filter(r=>n(r.new)!==r.count||n(r.old)!==0);
  check(tag+' '+f+'：'+rows.length+' 列的 new 各剛好 count 處（共 '+total+' 處）、old 不在了',rows.reduce((a,r)=>a+r.count,0)===total&&bad.length===0,J(bad.map(r=>[r.old,n(r.old),r.new,n(r.new)]).slice(0,4)));
  const ob=cut4(f,canonCut(f,show(BASE,f))); if(!ob){ console.log('（讀不到 '+BASE+' 的 '+f+'：不比重寫以前）'); return; }
  const O=lit(LR.fixFile(f,ob)), d=O.map((t,i)=>[t,L[i]]).filter(([x,y])=>x!==y), set=new Set(rows.map(r=>r.old+'→'+r.new));   /* fixFile：見上 */
  check(tag+' '+f+'：字串和 BASE 逐個比一樣多（'+O.length+' 個），不一樣的剛好 '+total+' 處、都是稿上的列（選項的字、別人的句子、條件、旗標沒動）',O.length===L.length&&d.length===total&&d.every(([x,y])=>set.has(x+'→'+y)),J([O.length,L.length,d.length,d.filter(([x,y])=>!set.has(x+'→'+y)).slice(0,3)]));
  const skel=s=>noCom(s).replace(/'((?:[^'\\]|\\.)*)'/g,"''").replace(/\s+/g,'');
  check(tag+' '+f+'：骨架（字串以外的程式：條件、旗標、數值、結構）和 BASE 一樣',skel(ob)===skel(cur)); };

(async()=>{
  await sec(1,async()=>{ console.log(D1.A?'（AA_761 讀得到：逐字比對）':'（這份 checkout 讀不到 AA_761@'+D1.sha+'：不比稿）');
    const src=read('src/data/events.js');
    check('1. events.js 檔頭寫了來源 AA_761_peishan_events_1.json@'+D1.sha,src.includes('AA_761_peishan_events_1.json@'+D1.sha));
    check('1. events.js（註解以外）沒有這幾句重寫前的字：「（舉手，停了一下）……我們為什麼要背這個？」「……好。週一前給你。」「這邊的門牌好小。」',!/'（舉手，停了一下）……我們為什麼要背這個？'|'……好。週一前給你。'|'這邊的門牌好小。'/.test(noCom(src)));
    if(!D1.A) return; const A=D1.A, rows=[].concat(...A.events.map(e=>e.rows.map(r=>Object.assign({ev:e.id},r))));
    check('1. 稿：十場事件 18 列，count 2 的剛好兩列（讀書會那一句、「好。週一前一定給你。」）',A.events.length===10&&rows.length===18&&J(rows.filter(r=>r.count===2).map(r=>r.new))===J(['（舉手）我可以問一個會被打的問題嗎？我們為什麼要背這個？','好。週一前一定給你。'])&&rows.every(r=>r.count===1||r.count===2));
    fileCheck('1.','src/data/events.js',rows,20);
    const blk=id=>{ const a=src.indexOf("id:'"+id+"'"); if(a<0) return ''; const m=/\n  \{ id:'/.exec(src.slice(a)); return src.slice(a,a+(m?m.index:src.length-a)); };
    const miss=rows.filter(r=>!blk(r.ev).includes("'"+r.new+"'"));
    check('1. 每一列的 new 落在稿寫的那一場事件裡（ev_ps_w1_room、…、ev_peishan_handover）',miss.length===0,J(miss.map(r=>r.ev+'：'+r.new)));
    const bad=[]; for(const e of A.events){ const ev=STORY_EVENTS.find(x=>x.id===e.id); if(!ev){ bad.push(e.id+' 不在 STORY_EVENTS'); continue; } const T=strs(ev,[]); for(const r of e.rows){ const n9=require('./aa959_map.js').map(r.new,'events.js','classmate_peishan')/* AA_959：遊戲再照覆寫表換過 */; if(!T.some(t=>t===r.new||t.includes(r.new)||t===n9)) bad.push(e.id+'：'+r.new); } }
    check('1. 實際載入的事件資料（STORY_EVENTS）裡十場都找得到新句',bad.length===0,J(bad));
    const tb=STORY_EVENTS.find(x=>x.id==='ev_peishan_table_bench'), txt=blk('ev_peishan_table_bench');
    check('1. ev_peishan_table_bench：「好。週一前一定給你。」對話和 after 寫進手機兩處都換了',!!tb&&txt.split("'好。週一前一定給你。'").length-1===2&&!txt.includes('……好。週一前給你。')); });

  await sec(2,async()=>{ console.log(D2.A?'（AA_762 讀得到：逐字比對）':'（這份 checkout 讀不到 AA_762@'+D2.sha+'：不比稿）');
    const FILES=['src/data/camp_y1.js','src/data/vac_activities.js','src/data/rom1016_events.js','src/data/r2y4b_events.js'], CNT=[4,10,5,3];
    for(const f of FILES) check('2. '+f+' 寫了來源 AA_762_peishan_events_2.json@'+D2.sha,read(f).includes('AA_762_peishan_events_2.json@'+D2.sha));
    if(!D2.A) return; const A=D2.A;
    check('2. 稿：四個檔 4／10／5／3＝22 列，每列 count 1',J(A.files.map(x=>x.file))===J(FILES)&&J(A.files.map(x=>x.rows.length))===J(CNT)&&A.files.every(x=>x.rows.every(r=>r.count===1)));
    A.files.forEach((x,i)=>fileCheck('2.',x.file,x.rows,CNT[i]));
    { const f='src/data/camp_y1.js', L=lit(fs.readFileSync(path.join(H.ROOT,f),'utf8')), rows=A.files.find(x=>x.file===f).rows, bad=rows.filter(r=>L.filter(t=>t===LR.fwdS(r.new,f)).length!==r.count||L.includes(r.old));
      check('2. '+f+'（現在的檔，CANON-1112：舊序章拿掉／可昕開局不認識 以後）：沛珊那 4 列的 new 還在、各 count 處，old 不在',rows.length===4&&bad.length===0,J(bad.map(r=>r.new))); } });

  await sec(3,async()=>{ const va=noCom(read('src/data/vac_activities.js'));
    check('3. vac_activities.js（註解以外）沒有「我沒出過國」「把護照握得很緊」「我第一次出國耶」',!/我沒出過國|把護照握得很緊|我第一次出國耶/.test(va));
    const m=/classmate_peishan:\{arr:\[([^\]]*)\],mid:\[([^\]]*)\],firstOnly:true,yes:\[([^\]]*)\],last:'([^']*)'/.exec(va);
    check('3. 和她出國那一組：arr、mid、firstOnly:true、yes、last 的結構照舊；last＝「我第一次沒有跟爸媽出國耶。好好玩，比跟他們好玩。」、mid（傳到家裡的群組）不動',!!m&&m[4]==='我第一次沒有跟爸媽出國耶。好好玩，比跟他們好玩。'&&m[2].includes('（她每走一條街就拍一張照片，傳到家裡的群組。）')&&m[1].includes('（過海關的時候，她排錯隊，自己笑著又排回來。）'),m&&m[4]);
    const v3=read('src/vac3d.js'); check('3. vac3d.js：firstOnly 的判斷照舊（第一次和她出國才說 last），註解引的是新句',v3.includes("gfOnce=!!(GF&&GF.firstOnly&&V.t13.some(r=>r!==rec&&r.done&&r.gf&&r.with===rec.with))")&&v3.includes('我第一次沒有跟爸媽出國耶'));
    const fire=typeof STORY_EVENTS!=='undefined'&&STORY_EVENTS.find(e=>e.id==='ev_camp_d2_fire'); const cy=noCom(fs.readFileSync(path.join(H.ROOT,'src/data/camp_y1.js'),'utf8'));   /* 現在的檔（不是 CANON_PIN 那一版）*/
    check('3. 宿營營火（ev_camp_d2_fire）：第一句「嗨！我是不是錯過很多？我是遲到一天半的那個沛珊。」',cy.includes("'嗨！我是不是錯過很多？我是遲到一天半的那個沛珊。'")&&cy.includes('ev_camp_d2_fire')&&(!fire||strs(fire,[]).includes('嗨！我是不是錯過很多？我是遲到一天半的那個沛珊。'))); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
