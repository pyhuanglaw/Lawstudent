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
  check('1. termend3d.js kexinDinner：table 後面接 KX_ASK 的二選一、記 KX_KHH',/Lx\.KX_ASK&&Lx\.KX_ASK\[te\.term\]/.test(src)&&/KX_KHH\|\|\(G\.flags\.KX_KHH=\{\}\)/.test(src)); });
await sec('1b',async()=>{ const te={term:'Y2S1'}; fresh('2026-12-30',18); H.said=[]; H.opts=[]; H.picks=[1]; await TERMEND.kexinDinner(GM,te);
  check('1. 實際演大二上：「我家附近那個夜市，你還沒去過。」→ 兩個選項 →「寒假我可能沒空。」→「……好。那夜市我自己去，拍給你看。」；KX_KHH.Y2W no',has('我家附近那個夜市，你還沒去過。')&&H.opts[0]&&H.opts[0].length===2&&has('……好。那夜市我自己去，拍給你看。')&&H.G.flags.KX_KHH.Y2W==='no',J({s:H.said.map(x=>x.t),o:H.opts})); });
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
/* ---- 4 ---- */
await sec(4,()=>{ fresh('2030-02-01',12,{KX_Y5_CALL:'sat'}); const real=typeof PGDATE!=='undefined'?PGDATE.kxList:null; const day=D('2030-02-16');
  globalThis.PGDATE=Object.assign(globalThis.PGDATE||{},{kxList:()=>[{kind:'meet',day:day-7},{kind:'call',day,h:22}]});
  H.at('2030-02-16',22.1); ph(); const m=(H.G.msgs||[]).find(x=>x.tag==='kxkhh_y5_call');
  check('4. 大五上「週末一定打。」：受訓第一格電話那個週六 22:00 手機提醒「打給可昕」',!!m&&m.text==='打給可昕'&&m.th==='sys',J(m));
  fresh('2030-02-01',12,{KX_Y5_CALL:'cheer'}); H.at('2030-02-16',22.1); ph(); check('4. 「受訓加油。」：沒有提醒',!(H.G.msgs||[]).some(x=>x.tag==='kxkhh_y5_call'));
  if(real) PGDATE.kxList=real; });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
