// AA_401 可昕的學期末約會：大二起每場二選一，接「寒假來高雄」（企劃線 18251b0e1；任務 AA389-REST-L-1023）——不需要瀏覽器。
//   0  逐字對稿（KX_ASK、kx_khh3d.js 的句子）
//   1  學期末約會 table 後面的二選一：每學期兩個選項、她的回覆、記 KX_KHH／KX_Y5_CALL；大二下加州、非加州，大三下臺灣、美國兩版
//   2  答應了的那一次寒暑假：她回高雄第 3 天 21:00；最後一天還沒去＝那一則；去過了沒有；大二上「沒空」第 5 天照片
//   3  去了高雄那一天接人之後多一句（第一次）；第二次沒有
//   4  大五上「週末一定打。」：受訓第一個週六 22:00 手機提醒「打給可昕」
// 修改前（開發分支 ab96e72ff）：沒有 KX_ASK、src/kx_khh3d.js（全部 FAIL）。用法：node tests/aa401_kx_khh_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, KX='kexin', J=JSON.stringify;
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/hometown_lines.js','src/hometown3d.js']) L3(f);
const ok=L3('src/kx_khh3d.js');
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, T=(d,h)=>d*24+h;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const has=t=>H.said.some(x=>x.t===t);
const th=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+KX);
const X=()=>typeof KXKHH!=='undefined'?KXKHH:null;
const fresh=(key,h,flags)=>{ const G=H.fresh(key,h,'dorm',Object.assign({EXCHANGE_ROUTE:'TW',dating_kexin:true,KX_FIRST_MSG:true},flags||{})); H.FRIEND(KX); G.outings=[]; H.at(key,h); return G; };
const ph=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const homeRun=(from,to)=>{ for(let d=D(from);d<=D(to);d++){ const p=STORY.presence(KX,Object.assign({},H.G,{day:d})); if(p&&p.here===false&&p.kind==='home'){ const R=X().run(H.G,d); if(R) return R; } } return null; };

(async()=>{
let doc=''; try{ doc=cp.execSync('git show 18251b0e1:"docs/story_planning/AA_401_可昕學期末約會的二選一_寒假來高雄.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
try{ if(doc) doc+='\n'+cp.execSync('git show 72ab8199aa:"docs/story_planning/AA_942_回LAWWW_可昕2028暑假六件.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}   /* AA_942 ④（企劃線 72ab8199aa）改的兩句 */
await sec(0,()=>{ const A=TERMEND_LINES.KX_ASK, G0={flags:{}}; const all=[]; for(const k in A){ const v=typeof A[k]==='function'?[A[k]({flags:{EXCHANGE_ROUTE:'US'}}),A[k]({flags:{}})].flat():A[k]; for(const o of v) all.push(o.t.replace(/^「|」$/g,''),...o.r); }
  const src=fs.readFileSync(path.join(H.ROOT,'src/kx_khh3d.js'),'utf8'); for(const m of src.matchAll(/'([^'\n]{4,})'/g)) if(/[一-鿿]/.test(m[1])&&!/[＝（）／]/.test(m[1].slice(0,1))&&!/^(打給可昕)$/.test(m[1])) all.push(m[1]);
  const notIn=[...new Set(all)].filter(t=>doc.indexOf(t)<0&&!/哪一次寒暑假|十二月底|答應過|學期末約會/.test(t));
  check('0. KX_ASK 和 kx_khh3d.js 的句子都在稿裡',ok&&!!doc&&!notIn.length,J(notIn)); });
/* ---- 1 ---- */
await sec(1,()=>{ const A=TERMEND_LINES.KX_ASK, f=x=>typeof x==='function';
  check('1. 六個學期都有兩個選項（大二上～大五上）',['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y5S1'].every(k=>{ const v=f(A[k])?A[k]({flags:{}}):A[k]; return v.length===2; }));
  const us=A.Y3S2({flags:{EXCHANGE_ROUTE:'US'}}), tw=A.Y3S2({flags:{EXCHANGE_ROUTE:'TW'}});
  check('1. 大三下：美國路線「十二月就回來。」／「出發前去高雄一次。」；臺灣「暑假我去高雄找妳。」／「視訊也很好。」',us[0].t==='「十二月就回來。」'&&us[1].khh[1]==='yes'&&tw[0].t==='「暑假我去高雄找妳。」'&&tw[1].khh[1]==='video');
  check('1. 大三上兩個都記 Y3W yes；大五上記 KX_Y5_CALL',A.Y3S1.every(o=>o.khh[0]==='Y3W'&&o.khh[1]==='yes')&&A.Y5S1[0].y5==='sat'&&A.Y5S1[1].y5==='cheer');
  const src=fs.readFileSync(path.join(H.ROOT,'src/termend3d.js'),'utf8');
  check('1. termend3d.js kexinDinner：（沒有選項稿的）table 後面接 KX_ASK 的二選一、記 KX_KHH',/Lx\.KX_ASK&&Lx\.KX_ASK\[te\.term\]/.test(src)&&/KX_KHH\|\|\(G\.flags\.KX_KHH=\{\}\)/.test(src)); });
await sec('1b',async()=>{ const te={term:'Y2S1'}; fresh('2026-12-30',18); H.said=[]; H.opts=[]; H.picks=[0,1]; await TERMEND.kexinDinner(GM,te);   /* 2026-11-10 改期望（TERMEND-OPTS-1110，使用者 X324；AA_749 女朋友版／可昕期末飯第二版）：開頭照新稿、先有一組三個選項，KX_ASK 的二選一是第二組 */
  /* 2026-11-10 再改期望（AA 11-10 經 LAWWW：有選項稿的學期 KX_ASK 的二選一不再接在後面；KX_KHH.Y2W 由選項「我去。妳排哪幾天？」記）*/
  /* 2026-11-11 改期望（AA 改斷句、意思不變；企劃線 bd1a6fda3：芷若、可昕、Alison、阿哲說的字改成一口氣講的寫法，113 處）：開頭併成一句（原本「寒假你來高雄。」「我家附近那個夜市你還沒去過。我已經跟我媽說了。」）*/
  check('1. 實際演大二上（有選項稿）：開頭照新稿、只有一組三個選項、不再接 KX_ASK 的二選一',has('寒假你來高雄，我家附近那個夜市你還沒去過，我已經跟我媽說了。')&&H.opts.length===1&&H.opts[0].length===3&&!has('……好。那夜市我自己去，拍給你看。')&&!has('你自己挑。我那幾天都在。'),J({s:H.said.map(x=>x.t),o:H.opts}));
  const k0=TERMEND.SHUFFLE; TERMEND.SHUFFLE=false; try{ fresh('2026-12-30',18); H.said=[]; H.opts=[]; H.picks=[1]; await TERMEND.kexinDinner(GM,te); } finally{ TERMEND.SHUFFLE=k0; }
  check('1. 選「我去。妳排哪幾天？」＝記 KX_KHH.Y2W yes（原本二選一「好。哪幾天？」記的那個）',H.opts[0][1]==='「我去。妳排哪幾天？」'&&!!H.G.flags.KX_KHH&&H.G.flags.KX_KHH.Y2W==='yes',J({o:H.opts,k:H.G.flags.KX_KHH}));
  fresh('2026-12-30',18); H.said=[]; H.opts=[]; H.picks=[0]; TERMEND.SHUFFLE=false; try{ await TERMEND.kexinDinner(GM,te); } finally{ TERMEND.SHUFFLE=k0; }
  /* 2026-11-10 三改期望（AA 回 LAWWW，企劃線 1cf434dee：每個選項照稿的 set 記——true＝原本的「去」yes、false＝原本的「沒空」no；「我去。妳排哪幾天？」的特例拿掉）*/
  check('1. 選「妳跟妳媽說什麼？」（set KX_KHH true）＝也記 KX_KHH.Y2W yes',H.opts[0][0]==='「妳跟妳媽說什麼？」'&&!!H.G.flags.KX_KHH&&H.G.flags.KX_KHH.Y2W==='yes',J(H.G.flags.KX_KHH||null));
  fresh('2026-12-30',18); H.said=[]; H.opts=[]; H.picks=[2]; TERMEND.SHUFFLE=false; try{ await TERMEND.kexinDinner(GM,te); } finally{ TERMEND.SHUFFLE=k0; }
  check('1. 選「寒假我可能要打工。」（set KX_KHH false）＝記 KX_KHH.Y2W no（原本「寒假我可能沒空。」記的那個）',H.opts[0][2]==='「寒假我可能要打工。」'&&!!H.G.flags.KX_KHH&&H.G.flags.KX_KHH.Y2W==='no',J(H.G.flags.KX_KHH||null));
  { const R=homeRun('2026-12-15','2027-02-20'); H.at(keyOf(R.a+4),21.1); ph(); const t5=th().map(m=>m.text);
    check('1. 接著演：寒假她在高雄第 5 天 21:00 夜市的照片（「沒空」那一條）、沒有第 3 天那則',t5.includes('（照片：夜市的燈）')&&t5.includes('這是你說沒空的那個夜市。')&&!th().some(m=>m.tag==='kxkhh_d3_Y2W'),J(t5)); }
  /* 每一頓、每個選項記的值＝照稿的 set（1cf434dee）；美國路線那一組不記；大五上三個都記 KX_Y5_CALL sat */
  { let kx=null; /* rc2c（AA_1015）：稿換成白名單上的 110b0fd990（原本 1cf434dee；選項字改了，照字對存檔值要讀新版）*/ try{ kx=JSON.parse(cp.execSync('git show 110b0fd990:docs/story_planning/AA_749_termend_kx_v2.json',{cwd:H.ROOT,encoding:'utf8'})).KX; }catch(e){ kx=null; }
    const KEY={Y2S1:'Y2W',Y2S2:'Y2S',Y3S1:'Y3W',Y3S2:'Y3S',Y4S1:'Y4W'}, bad=[]; let n=0; TERMEND.SHUFFLE=false;
    try{ for(const term of Object.keys(kx||{})) for(const us of (kx[term].optsUS?[false,true]:[false])){ const src=us?kx[term].optsUS:kx[term].opts;
        for(let i=0;i<src.length;i++){ const day={Y2S1:'2026-12-30',Y2S2:'2027-06-19',Y3S1:'2028-01-14',Y3S2:'2028-06-17',Y4S1:'2028-12-24',Y5S1:'2029-12-20'}[term];
          fresh(day,18,us?{EXCHANGE_ROUTE:'US'}:null); if(us&&!TERMEND_LINES.COND.US(H.G)) continue; H.said=[]; H.opts=[]; H.picks=[i]; await TERMEND.kexinDinner(GM,{term}); n++;
          const F=H.G.flags, s=src[i].set, got=J([F.KX_KHH||null,F.KX_Y5_CALL||null]);
          /* 2026-11-11 改期望（AA 2026-11-10 23:4x 回 LAWWW）：大三下（Y3S2）美國路線的三個選項都記 KX_KHH.Y3S yes（他八月才出發，七月第 3 天「七月你空哪天。」照舊發）——
             稿（1cf434dee）的 optsUS 還沒有 set（AA 之後補；匯入工具 KX_US_YES 沒寫＝一律補 yes），所以這一組稿上可以沒有 set、有的話要是 {KX_KHH:true}。原本期望「美國路線一律不記」 */
          const usYes=us&&term==='Y3S2';
          const want=usYes?J([{Y3S:'yes'},null]):(us?J([null,null]):(term==='Y5S1'?J([null,'sat']):J([{[KEY[term]]:s.KX_KHH?'yes':'no'},null])));
          if(H.opts.length!==1||H.opts[0][i]!==src[i].t||(usYes?(s!=null&&J(s)!==J({KX_KHH:true})):(us?s!=null:s==null))||got!==want) bad.push([term,us,src[i].t,got,want]); } } } finally{ TERMEND.SHUFFLE=k0; }
    check('1. 六頓每個選項（'+n+' 個）記的存檔值＝照稿的 set：KX_KHH true→yes、false→no（key＝那一次寒暑假）；美國路線不記（大三下例外：三個都記 Y3S yes）；大五上三個都 KX_Y5_CALL sat',!!kx&&n>=18&&bad.length===0,J(bad.slice(0,4))); }
  /* 大三下美國路線（AA 2026-11-10 23:4x）：三個選項任選 → KX_KHH.Y3S yes → 暑假她回高雄第 3 天 21:00 那一則會發（AA_942 ④ 改字：「這兩個禮拜，你空哪天。」）*/
  { const bad=[]; TERMEND.SHUFFLE=false;
    try{ for(let i=0;i<3;i++){ fresh('2028-06-17',18,{EXCHANGE_ROUTE:'US'}); const usOn=TERMEND_LINES.COND.US(H.G); H.said=[]; H.opts=[]; H.picks=[i]; await TERMEND.kexinDinner(GM,{term:'Y3S2'});
        const khh=(H.G.flags.KX_KHH||{}).Y3S, R=homeRun('2028-06-18','2028-08-31'); let m3=[];
        if(R){ H.at(keyOf(R.a+2),21.1); ph(); m3=th().filter(m=>m.tag==='kxkhh_d3_Y3S').map(m=>m.text); }
        if(!usOn||H.opts.length!==1||H.opts[0].length!==3||khh!=='yes'||!R||R.key!=='Y3S'||J(m3)!==J(['這兩個禮拜，你空哪天。'])) bad.push([i,usOn,H.opts[0],khh,R&&R.key,m3]); } } finally{ TERMEND.SHUFFLE=k0; }
    check('1. 大三下美國路線：三個選項任選一個 → KX_KHH.Y3S 記 yes → 暑假她回高雄第 3 天 21:00「這兩個禮拜，你空哪天。」照舊發（AA_942 ④：原本「七月你空哪天。」，她 7/2 就回臺北了）',bad.length===0,J(bad.slice(0,2))); }
  { fresh('2029-12-20',18); H.said=[]; H.opts=[]; H.picks=[2]; await TERMEND.kexinDinner(GM,{term:'Y5S1'}); const F=H.G.flags; const real=typeof PGDATE!=='undefined'?PGDATE.kxList:null, day=D('2030-02-16');
    if(typeof PGDATE==='undefined') globalThis.PGDATE={}; PGDATE.kxList=()=>[{kind:'call',day}];
    try{ H.at('2030-02-16',22.1); ph(); check('1. 大五上選第三個「妳比我早。」→ 受訓第一個週六 22:00「打給可昕」提醒照舊',F.KX_Y5_CALL==='sat'&&(H.G.msgs||[]).some(x=>x.tag==='kxkhh_y5_call'&&x.text==='打給可昕'),J([F.KX_Y5_CALL,(H.G.msgs||[]).slice(-2)])); } finally{ if(real) PGDATE.kxList=real; else delete PGDATE.kxList; } }
  const keep=globalThis.TERMEND_OPTS; globalThis.TERMEND_OPTS=null;
  try{ fresh('2026-12-30',18); H.said=[]; H.opts=[]; H.picks=[1]; await TERMEND.kexinDinner(GM,te);
    check('1. 沒有選項稿（舊資料）：table 後面照舊接 KX_ASK 的二選一 →「寒假我可能沒空。」→「……好。那夜市我自己去，拍給你看。」；KX_KHH.Y2W no',H.opts.length===1&&H.opts[0].length===2&&has('……好。那夜市我自己去，拍給你看。')&&H.G.flags.KX_KHH.Y2W==='no',J({s:H.said.map(x=>x.t),o:H.opts})); } finally{ globalThis.TERMEND_OPTS=keep; } });
/* ---- 2 ---- */
await sec(2,async()=>{ fresh('2027-01-01',12,{KX_KHH:{Y2W:'yes'}}); const R=homeRun('2026-12-15','2027-02-20');
  check('2. 可昕大二寒假在高雄（presence home）、這一段算 Y2W',!!R&&R.key==='Y2W',J(R));
  const d3=R.a+2; H.at(keyOf(d3),21.1); ph(); const m3=th().filter(m=>m.tag==='kxkhh_d3_Y2W').map(m=>m.text);
  check('2. 答應了：她回高雄第 3 天 21:00「夜市週二、週五才有。」「你說要來的。」',J(m3)===J(['夜市週二、週五才有。','你說要來的。']),J(m3));
  H.at(keyOf(R.b),21.1); ph(); check('2. 最後一天還沒去：「（照片：夜市的燈）」「我自己來了。」',th().some(m=>m.text==='我自己來了。'&&m.day===R.b));
  fresh('2027-01-01',12,{KX_KHH:{Y2W:'yes'}}); OUT.rec(H.G).push({id:'hv_kexin_x',ev:'ev_hv_kx',day:R.a+3,h:10,state:'done'}); H.at(keyOf(R.b),21.1); ph(); check('2. 去過了：最後一天沒有那則',!th().some(m=>m.text==='我自己來了。'));
  fresh('2027-01-01',12,{KX_KHH:{Y2W:'no'}}); H.at(keyOf(R.a+4),21.1); ph(); check('2. 大二上「沒空」：第 5 天「（照片：夜市的燈）」「這是你說沒空的那個夜市。」；沒有第 3 天那則',th().some(m=>m.text==='這是你說沒空的那個夜市。')&&!th().some(m=>m.tag==='kxkhh_d3_Y2W'));
  fresh('2027-01-01',12,{KX_KHH:{Y2W:'maybe'}}); H.at(keyOf(R.a+2),21.1); ph(); H.at(keyOf(R.b),21.1); ph(); check('2. 不是 yes／no：都沒有',!th().some(m=>/^kxkhh_/.test(m.tag||''))); });
/* ---- 3 ---- */
await sec(3,async()=>{ fresh('2027-01-01',12,{KX_KHH:{Y2W:'yes'}}); const R=homeRun('2026-12-15','2027-02-20'); H.at(keyOf(R.a+3),10);
  const q={id:'hv_kexin_t',ev:'ev_hv_kx',day:H.G.day,h:10,hv:{id:KX,key:KX}}; H.said=[]; H.opts=[]; H.picks=[0,0,0,0]; await HV.play(GM,q);
  check('3. 答應過的那一次寒暑假，第一次去：接人之後多「夜市晚上才有。白天先帶你去別的地方。」',has('夜市晚上才有。白天先帶你去別的地方。'),J(H.said.map(x=>x.t).slice(0,6)));
  H.said=[]; H.picks=[0,0,0,0]; await HV.play(GM,q); check('3. 第二次去：沒有那一句',!has('夜市晚上才有。白天先帶你去別的地方。')); });
/* ---- AA_942 ④：第 3 天那則 Y3W 改字，其他照留 ---- */
await sec(3,()=>{ const M=X().MSG3, G0={flags:{EXCHANGE_ROUTE:'TW'}};
  check('3b. AA_942 ④：Y3W「我帶你去走走。你來就好。」（原本「我排好了。」）；Y3S 臺灣路線「一次就好。……可是要來。」、Y4W「兩個位子我占好了。」照留',J(M.Y3W(G0))===J(['我帶你去走走。你來就好。'])&&J(M.Y3S(G0))===J(['一次就好。……可是要來。'])&&J(M.Y4W(G0))===J(['兩個位子我占好了。']),J([M.Y3W(G0),M.Y3S(G0),M.Y4W(G0)])); });
/* ---- 4 ---- */
await sec(4,()=>{ fresh('2030-02-01',12,{KX_Y5_CALL:'sat'}); const real=typeof PGDATE!=='undefined'?PGDATE.kxList:null; const day=D('2030-02-16');
  globalThis.PGDATE=Object.assign(globalThis.PGDATE||{},{kxList:()=>[{kind:'meet',day:day-7},{kind:'call',day,h:22}]});
  H.at('2030-02-16',22.1); ph(); const m=(H.G.msgs||[]).find(x=>x.tag==='kxkhh_y5_call');
  check('4. 大五上「週末一定打。」：受訓第一格電話那個週六 22:00 手機提醒「打給可昕」',!!m&&m.text==='打給可昕'&&m.th==='sys',J(m));
  fresh('2030-02-01',12,{KX_Y5_CALL:'cheer'}); H.at('2030-02-16',22.1); ph(); check('4. 「受訓加油。」：沒有提醒',!(H.G.msgs||[]).some(x=>x.tag==='kxkhh_y5_call'));
  if(real) PGDATE.kxList=real; });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
