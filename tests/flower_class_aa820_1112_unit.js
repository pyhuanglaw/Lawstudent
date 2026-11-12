// 花序 Flower Notes 二樓花藝課（FLOWER-CLASS-1112，USER_WANTS X346；AA_820 企劃線 7917d4289）——不需要瀏覽器（D131）。
// 稿一律用 git show 7917d4289 讀來逐字比（不寫死台詞）；讀不到（淺層 clone）＝「逐字對稿」那幾項跳過（印 SKIP），其他拿匯入的資料比。
//   0. 檔案在、index.html 的載入順序；匯入工具 --check；白名單有 AA_820@7917d4289
//   1. 逐字對稿：signup、三門課（名字、價錢、時數、makes、lines、again）、三樣成品、give、together、story
//   2. 報名的互動點（二樓、按鈕＝稿的字）；三門課每一門：staff_ask → 清單 → 扣稿上的價錢、時間往後稿上的時數、成品進包包（shop gg_flower）、演稿上的 lines
//      下課（轉亮以後、成品進包包時）：signup.done 兩句（花藝師一句＋旁白，{物}＝成品名；三門課共用；AA 11-12 回 LAWWW-C 七問①，改以前的 bd8643003a FAIL）；一起上課不演
//   3. 同一門課第二次＝again 那一句；一個禮拜一次（week_limit）、下禮拜可以；錢不夠（no_money）；包包滿了；營業時間（closed、灰掉）
//   4. 成品不能買（買花清單沒有、sells 沒有）；物品分頁不寫價錢
//   5. 送她：交往中／還沒交往的反應（{物}＝成品名）、不演一般的 ok 那一格、不加一般送禮的好感；平常日子也可以送；節日照原本的選單（open 照演）；可以再送一次
//   6. story.first_class：第一次上課＋有交往對象才演（接在第一句旁白後面）、三個選項各記一個旗標；沒有交往對象不演；第二次上課不演
//   7. 一起上課：交往中才列；付兩份、時數照課、成品不進包包、fx 照稿；和自己上課共用一週一次
//   8. 學姊三場：s1 取代第一次的 dating 反應（fx）→ 開出一起上課 → s2 取代第一次的 together（if 的句子照旗標）→ 之後照 together；s3 五天以後、一次；再送照 give 三句
//   9. story.after：交往中送了、五天以後說話先說那一句、每人一次；不到五天不說；分手了不說；還沒交往送的不說
//  10. 舊存檔：沒有 G.flags.FC／FC_* 的存檔讀得進來、照樣可以上課；沒有新的必填欄位
// 用法：node tests/flower_class_aa820_1112_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const SHA='7917d4289', DOC='docs/story_planning/AA_820_flower_class.json';
const J=JSON.stringify;
const read=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); return true; };
const FILES=['src/data/fest_events.js','src/fest3d.js','src/xs_close3d.js','src/data/flower_notes_layout.js','src/data/gift_holiday.js','src/gifthol3d.js','src/data/flower_notes_text.js','src/flower_notes_sys3d.js','src/data/flower_class.js','src/flower_class3d.js'];
let missing=[], err=''; try{ for(const f of FILES) if(!load(f)) missing.push(f); }catch(e){ err=String(e&&e.stack||e); }
let DOCJ=null, docErr=''; try{ DOCJ=JSON.parse(cp.execFileSync('git',['-C',H.ROOT,'show',SHA+':'+DOC],{encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<24})); }catch(e){ docErr=String(e.stderr||e.message).trim().split('\n').pop(); }
const vs=(name,f)=>{ if(!DOCJ) return console.log('SKIP '+name+'　讀不到稿（git show '+SHA+'：'+docErr+'）——只跳過逐字對稿'); let r; try{ r=f(DOCJ); }catch(e){ r=[false,String(e)]; } check(name,!!r[0],r[1]); };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const D=k=>H.D(k);
let toasts=[], fades=[]; GM.toast=t=>toasts.push(t); GM.fade=async on=>{ fades.push([on,H.said.length,H.G.hour]); };
GM.money=n=>{ H.G.money+=n; };
const lv=(id,n)=>{ if(id==='heroine_03'&&H.G) H.G.flags.YT_MET_JOB=true; const r=SOCIAL.rel(id); Object.assign(r,{fam:n>=4?65:(n>=3?45:(n>=2?25:10)),trust:n>=4?50:(n>=3?30:0),comf:n>=4?45:0,npcRom:n>=6?60:(n>=5?35:0),rom:n>=6?35:0}); SOCIAL.remember(id,'FIRST_MET',''); };
const setup=(key,h,o)=>{ o=o||{}; const G=H.fresh(key,h,o.zone||'flower_notes',o.flags||{}); G.outings=[]; G.contacts=G.contacts||{}; G.money=o.money!=null?o.money:5000;
  for(const [id,n] of Object.entries(o.lv||{})) lv(id,n); for(const id of o.dating||[]){ lv(id,6); G.flags['dating_'+id]=true; }
  if(STORY._bindGM) STORY._bindGM(GM); if(typeof FNS!=='undefined') FNS._reset(); if(typeof FCLASS!=='undefined') FCLASS._reset(); return G; };
const run=async(fn,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); H.entered=[]; toasts=[]; fades=[]; const r=await fn(); return {r,S:H.said.slice(),L:H.said.map(s=>s.t),O:H.opts.slice()}; };
const SIGN={fcSignup:true};
const who=id=>({name:SOCIAL.displayName(id),charId:id});
/* 稿的一段 → 會演出來的 [說話的人(null＝旁白), 字]：字串＝旁白（narr）或「（」開頭旁白、其他 w 說；{who,t}；「（動作）話」拆成旁白＋話（送禮系統原本的做法，字不改）*/
const nameOf=w=>w==='花藝師'?'花藝師':SOCIAL.displayName(w);
const flat=(L,o)=>{ o=o||{}; const out=[]; for(const e of [].concat(L)){ if(typeof e!=='string'&&e.if&&!(o.flags||{})[e.if]) continue; const t=(typeof e==='string'?e:e.t).replace(/\{物\}/g,o.thing||''), w=typeof e==='string'?(o.narr?null:o.w):nameOf(e.who);
    const m=/^(（[^）]*）)(.+)$/.exec(t); if(w&&m){ out.push([null,m[1]]); out.push([w,m[2]]); } else if(!w||/^（/.test(t)) out.push([null,t]); else out.push([w,t]); } return out; };
const got=r=>r.S.map(s=>[s.who,s.t]);
const same=(r,want)=>J(got(r))===J(want);

(async()=>{
  /* ======================= 0 檔案、匯入工具 ======================= */
  const ready=!missing.length&&!err&&typeof FCLASS!=='undefined'&&typeof FLOWER_CLASS!=='undefined'&&typeof GIFTH!=='undefined'&&typeof FNS!=='undefined';
  check('0. 載入 flower_class.js、flower_class3d.js（和 gift_holiday.js、gifthol3d.js、flower_notes_sys3d.js）',ready,(missing.length?'沒有 '+missing.join('、')+' ':'')+err.slice(0,300));
  { const html=read('index.html'), at=f=>html.indexOf('src="'+f+'?v=');
    check('0. index.html 載入 flower_class.js、flower_class3d.js（在 flower_notes_sys3d.js、gifthol3d.js、fit3d.js、sis_y2y3_3d.js 後面）',
      at('src/data/flower_class.js')>0&&at('src/flower_class3d.js')>at('src/data/flower_class.js')&&at('src/data/flower_class.js')>at('src/flower_notes_sys3d.js')&&at('src/flower_notes_sys3d.js')>at('src/gifthol3d.js')&&at('src/flower_class3d.js')>at('src/sis_y2y3_3d.js')&&at('src/sis_y2y3_3d.js')>0); }
  { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/flower/import_flower_class.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out)&&out.includes(DOC+'@'+SHA); }catch(e){ out=String(e.stdout||'')+String(e.stderr||e.message); }
    check('0. 匯入工具 --check：flower_class.js 和白名單上的稿（AA_820@'+SHA+'）一致',ok,out.trim().split('\n').pop().slice(0,200));
    const A=JSON.parse(read('docs/handoff/story_import_allow.json')).files.filter(e=>e.path===DOC);
    check('0. 白名單：AA_820 一筆、sha '+SHA+'、approved、approvedBy「AA（FLOWER-CLASS-1112）」',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&A[0].approvedBy==='AA（FLOWER-CLASS-1112）',J(A.map(e=>[e.sha,e.status,e.approvedBy])));
    let gout=''; try{ gout=cp.execFileSync('python3',[path.join(H.ROOT,'tools/gift/import_gift_holiday.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(e){ gout=String(e.stdout||'')+String(e.stderr||''); }
    check('0. 原本的 gift_holiday.js 沒有動（import_gift_holiday.py --check 照樣 OK）',/^OK/.test(gout),gout.trim().split('\n').pop().slice(0,160)); }
  if(!ready){ console.log('FAILED '+H.fails); process.exit(1); }
  const X=FLOWER_CLASS, T=X.signup, KEYS=['basic','design','season'], PEOPLE=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'], SIS='heroine_05', AN='heroine_01';
  const ITEMS=Object.keys(X.items), nameI=g=>X.items[g].name;
  const DONE=c=>flat(T.done||[],{narr:true,thing:nameI(c.makes)});   /* 下課兩句（signup.done；{物}＝那一門課的成品名）*/

  /* ======================= 1 逐字對稿 ======================= */
  vs('1. signup、classes、items、give、together、story 六節和稿逐字一樣（每一句、名字、價錢、時數）',d=>{ const bad=['signup','classes','items','give','together','story'].filter(k=>J(X[k])!==J(d[k])); return [!bad.length,bad.join('、')]; });
  vs('1. 價錢 900／1200／1500、時數 2／2／2.5、makes 三樣；資料記了來源',d=>[J(KEYS.map(k=>[d.classes[k].price,d.classes[k].hours,d.classes[k].makes]))===J([[900,2,'g_fc_bouquet'],[1200,2,'g_fc_table'],[1500,2.5,'g_fc_wreath']])&&J(KEYS.map(k=>[X.classes[k].price,X.classes[k].hours,X.classes[k].makes]))===J(KEYS.map(k=>[d.classes[k].price,d.classes[k].hours,d.classes[k].makes]))&&X.src===DOC+'@'+SHA,X.src]);
  check('1. 資料：三門課、三樣成品（g_fc_*、buy:false、love／no 空的、沒有價錢）、give／together 七位、after 六位（沒有學姊）',J(Object.keys(X.classes))===J(KEYS)&&ITEMS.length===3&&ITEMS.every(g=>/^g_fc_/.test(g)&&X.items[g].buy===false&&!X.items[g].love.length&&!X.items[g].no.length&&!('price' in X.items[g]))&&PEOPLE.every(p=>X.give[p]&&X.together[p])&&J(Object.keys(X.story.after).filter(k=>k!=='when'))===J(PEOPLE.filter(p=>p!==SIS)));
  { const src=read('src/flower_class3d.js').replace(/\/\*[\s\S]*?\*\//g,''), all=[]; const walk=x=>{ if(typeof x==='string') all.push(x); else if(Array.isArray(x)) x.forEach(walk); else if(x&&typeof x==='object') Object.values(x).forEach(walk); }; walk([X.signup,X.classes,X.give,X.together,X.story]);
    const leaked=all.filter(t=>t.length>=6&&/[\u4e00-\u9fff]/.test(t)&&src.includes(t)); check('1. flower_class3d.js 的程式裡沒有抄稿的句子（字都從資料來）',!leaked.length,leaked.slice(0,3).join('／')); }

  /* ======================= 2 報名、三門課 ======================= */
  await sec(2,async()=>{
    const IT=[]; const z0=globalThis.Z3; globalThis.Z3={ZONES:{flower_notes:{build(E){ return {}; }}}}; FNS.hookZone(); FCLASS.hookZone(); Z3.ZONES.flower_notes.build({interactables:IT}); globalThis.Z3=z0;
    const P=IT.filter(i=>i.fcSignup), p=P[0], L=FLOWER_NOTES_LAYOUT, dm=L.items1.find(i=>i.kind==='demo_table');
    const near=p&&IT.filter(q=>(q.lv|0)===1&&Math.hypot(q.x-p.x,q.z-p.z)<=q.radius).concat(L.seats1.map(q=>({x:q.x,z:q.z,radius:0.7,label:'坐下'})).filter(q=>Math.hypot(q.x-p.x,q.z-p.z)<=q.radius)).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];
    check('2. 報名的互動點：一個、二樓、按鈕＝稿的「'+T.button+'」、在示範長桌前面（桌子旁邊 1 m 內、不在桌子裡）、站在那裡最近的就是它',P.length===1&&p.lv===1&&p.label===T.button&&p.x>dm.x-dm.w/2&&p.x<dm.x+dm.w/2&&p.z>dm.z+dm.d/2+0.33&&p.z<dm.z+dm.d/2+1&&near===p,p?J([p.x,p.z,near&&near.label]):'');
    const lk=IT.find(i=>i.fnLook==='demo_table'); /* 2026-11-12 STALE-SOURCES-1112：舊期望按鈕字＝配置的「看示範桌」；AA_792 4021747069 的 look_buttons 把每個「看」的按鈕字寫進稿（demo_table「看示範長桌」）＝照稿；位置、那一句沒動 */
    check('2. 原本的示範桌「看」還在（位置照配置、句子照稿；按鈕字照稿的 look_buttons）',!!lk&&lk.label===FLOWER_NOTES_TEXT.lookButtons.demo_table&&lk.x===L.looks.find(q=>q.id==='demo').x&&lk.z===L.looks.find(q=>q.id==='demo').z&&lk.look===FLOWER_NOTES_TEXT.looks.demo_table);
    const bad=[]; for(const k of KEYS){ const c=X.classes[k], G=setup('2025-10-15',14); const r=await run(()=>STORY.interact(SIGN,GM),[c.name]);
      const body=[['花藝師',T.staff_ask]].concat(flat(c.lines,{narr:true})), want=body.concat(DONE(c)), bag=GIFTH.bag(G);
      const ok=r.r===true&&same(r,want)&&G.money===5000-c.price&&Math.abs(G.hour-(14+c.hours))<1e-9&&bag.length===1&&bag[0].id===c.makes&&bag[0].shop==='gg_flower'&&bag[0].day===G.day
        &&J(r.O[0].slice())===J(KEYS.map(q=>X.classes[q].name+'　'+X.classes[q].price+' 元').concat(['算了']))&&r.O.length===1
        &&fades.length===2&&fades[0][0]===true&&fades[0][1]===1&&fades[0][2]===14&&fades[1][0]===false&&fades[1][1]===body.length&&toasts.length===1&&toasts[0]===nameI(c.makes)+'（包包 1/'+GIFTH.MAX+'）';
      if(!ok) bad.push(k+' '+J([G.money,G.hour,bag,r.O,fades,got(r).slice(0,3)])); }
    check('2. 三門課每一門：花藝師 staff_ask → 清單（課名＋價錢、算了）→ 轉暗 → 稿的 lines（字串＝旁白、花藝師說的；（動作）拆出來）→ 轉亮 → 下課兩句（signup.done）→ 扣稿上的價錢、時間往後稿上的時數、成品進包包（shop gg_flower）、原本的提示還在',!bad.length,bad.join(' ／ ').slice(0,500));
    vs('2. 下課兩句照稿：花藝師「可以帶回去了。今天的花，回去先剪一點莖再插水。」＋旁白「（你把○○放進店裡給的紙袋，提著下樓。）」（{物}＝那一門課的成品名）',d=>{ const dn=d.signup.done; return [J(dn)===J([{who:'花藝師',t:'可以帶回去了。今天的花，回去先剪一點莖再插水。'},'（你把{物}放進店裡給的紙袋，提著下樓。）'])&&J(T.done)===J(dn)
      &&KEYS.every(k=>J(DONE(X.classes[k]))===J([['花藝師','可以帶回去了。今天的花，回去先剪一點莖再插水。'],[null,'（你把'+nameI(X.classes[k].makes)+'放進店裡給的紙袋，提著下樓。）']])),J(dn)]; });
    { const G=setup('2025-10-15',14); let note=null; const c0=GM.choose; GM.choose=async(o,opt)=>{ note=opt&&opt.note; return c0(o,opt); }; const r=await run(()=>STORY.interact(SIGN,GM),['算了']); GM.choose=c0;
      check('2. 清單上面那一行＝稿的 menu_title；選「算了」＝不扣錢、不過時間、沒有成品、沒有用掉這個禮拜的一次',note===T.menu_title&&G.money===5000&&G.hour===14&&!GIFTH.bag(G).length&&!FCLASS.weekUsed(G)&&!fades.length,J([note,G.money,G.hour])); }
    { const G=setup('2025-10-15',14,{zone:'campus'}); const r=await run(()=>STORY.interact(SIGN,GM),[X.classes.basic.name]); check('2. 不在花序（別的區域同樣的互動點）不會開報名',!r.L.includes(T.staff_ask)&&G.money===5000); }
    { const narr=[]; const w=x=>{ if(typeof x==='string') narr.push(x); else if(Array.isArray(x)) x.forEach(w); else if(x&&typeof x==='object') Object.values(x).forEach(w); }; w([X.classes,X.give,X.together,X.story.first_class.lines,X.story.sis,X.story.after]);
      const odd=narr.filter(t=>/^（/.test(t)&&/）$/.test(t)&&t.slice(1,-1).includes('）')); check('2. 稿的旁白裡面沒有中途的「）」（不會被拆成兩句）',!odd.length,odd.slice(0,2).join('／')); } });

  /* ======================= 3 again、一週一次、錢、包包、營業時間 ======================= */
  await sec(3,async()=>{ const c=X.classes.basic;
    const G=setup('2025-10-15',14); await run(()=>STORY.interact(SIGN,GM),[c.name]);   /* 2025-10-15 是週三 */
    const wd=CALENDAR.dateOf(G.day).wd; const r1=await run(()=>STORY.interact(SIGN,GM),[c.name]);
    check('3. 同一個禮拜再報名：花藝師 week_limit、不出清單、不扣錢',wd===3&&same(r1,[['花藝師',T.week_limit]])&&!r1.O.length&&G.money===5000-c.price&&GIFTH.bag(G).length===1,J([wd,got(r1)]));
    const wk=[]; for(const [key,want] of [['2025-10-13',true],['2025-10-19',true],['2025-10-12',false],['2025-10-20',false]]){ G.day=D(key); G.hour=14; wk.push(FCLASS.weekUsed(G)===want); }
    check('3. 一個禮拜＝週一到週日：10/15（三）上過 → 10/13（一）、10/19（日）算同一週；10/12（日）、10/20（一）不算',wk.every(Boolean),J(wk));
    G.day=D('2025-10-20'); G.hour=14; const r2=await run(()=>STORY.interact(SIGN,GM),[c.name]);
    check('3. 下禮拜可以再上；同一門課第二次＝只演 again 那一句（旁白），不重演整段；一樣扣錢、過時間、拿成品',same(r2,[['花藝師',T.staff_ask],[null,c.again]].concat(DONE(c)))&&G.money===5000-2*c.price&&G.hour===14+c.hours&&GIFTH.bag(G).length===2&&GIFTH.bag(G).every(b=>b.id===c.makes),J(got(r2)));
    G.day=D('2025-10-27'); G.hour=14; const c2=X.classes.design; const r3=await run(()=>STORY.interact(SIGN,GM),[c2.name]);
    check('3. 換一門沒上過的課：演那一門完整的 lines（again 是每一門課各自算）',same(r3,[['花藝師',T.staff_ask]].concat(flat(c2.lines,{narr:true}),DONE(c2)))&&GIFTH.bag(G).some(b=>b.id===c2.makes),J(got(r3).slice(0,3)));
    { const G=setup('2025-10-15',14,{money:c.price-1}); const r=await run(()=>STORY.interact(SIGN,GM),[c.name]);
      check('3. 錢不夠：no_money（旁白）、不扣錢、不過時間、沒有成品、這個禮拜還可以再來',same(r,[['花藝師',T.staff_ask],[null,T.no_money]])&&G.money===c.price-1&&G.hour===14&&!GIFTH.bag(G).length&&!FCLASS.weekUsed(G)&&!fades.length,J(got(r))); }
    { const G=setup('2025-10-15',14); for(let k=0;k<GIFTH.MAX;k++) GIFTH.rec(G).bag.push({id:'g_card',day:G.day,shop:'cvs'}); const r=await run(()=>STORY.interact(SIGN,GM),[c.name]);
      check('3. 包包滿了：不收錢、不上課、原本的那一句提示',G.money===5000&&G.hour===14&&GIFTH.bag(G).length===GIFTH.MAX&&toasts.length===1&&toasts[0]==='包包已經放了 '+GIFTH.MAX+' 樣了'&&!FCLASS.weekUsed(G),J([toasts,G.money])); }
    const res=[]; for(const [h,fit] of [[9.5,[0,0,0]],[10,[1,1,1]],[18.5,[1,1,1]],[18.75,[1,1,0]],[19,[1,1,0]],[19.25,[0,0,0]],[21.5,[0,0,0]]]){ const G=setup('2025-10-15',h); const f=KEYS.map(k=>FCLASS.fits(G,X.classes[k].hours)?1:0); const r=await run(()=>STORY.interact(SIGN,GM),['算了']);
      const any=fit.some(Boolean); res.push(J(f)===J(fit)&&(any?(r.L[0]===T.staff_ask&&r.O.length===1):(same(r,[[null,T.closed]])&&!r.O.length))); }
    check('3. 營業時間照花序（10:00～21:00）、下課不能超過打烊：都排不進去＝closed（旁白）、不出清單；19:00 只剩 2 小時的兩門',res.every(Boolean),J(res));
    { const G=setup('2025-10-15',19); let dims=null; const c0=GM.choose; GM.choose=async(o,opt)=>{ if(!dims) dims=o.map(q=>!!q.dim); return c0(o,opt); }; const r=await run(()=>STORY.interact(SIGN,GM),[X.classes.season.name]); GM.choose=c0;
      check('3. 19:00：季節花藝（2.5 小時）灰掉；硬選＝closed 那一句、不扣錢',J(dims)===J([false,false,true,false])&&r.L[r.L.length-1]===T.closed&&G.money===5000&&G.hour===19,J([dims,r.L])); } });

  /* ======================= 4 不能買 ======================= */
  await sec(4,async()=>{ const G=setup('2025-10-15',14); const sells=GIFTH.sells(G,'gg_flower');
    check('4. 三樣成品不在花序的商品（GIFT_HOLIDAY.shops.gg_flower.items、GIFTH.sells）；每一家店都沒有',ITEMS.every(g=>!sells.includes(g))&&Object.values(GIFT_HOLIDAY.shops).every(s=>!s.items.some(g=>ITEMS.includes(g)))&&sells.length===10,sells.join(' '));
    const r=await run(()=>STORY.interact({kind:'gg_flower',label:'買花',fnCounter:true},GM),['算了']);
    check('4. 買花清單（十樣＋算了）沒有成品的名字',r.O.length===1&&r.O[0].length===11&&ITEMS.every(g=>!r.O[0].some(t=>t.includes(nameI(g)))),J(r.O[0]));
    check('4. 成品在送禮系統查得到（made、只列稿有反應的七位、芯慈不列）',ITEMS.every(g=>{ const it=GIFTH.item(g); return it&&it.made===true&&it.name===nameI(g)&&it.line===X.items[g].line&&J(it.only)===J(PEOPLE)&&it.price===undefined&&GIFTH.cat(AN,g)==='ok'; }));
    GIFTH.rec(G).bag.push({id:'g_fc_table',day:G.day,shop:'gg_flower'}); const h=GIFTH.bagHTML(G);
    check('4. 物品分頁：成品的名字、說明、店名；不寫價錢（沒有「undefined」）',h.includes(nameI('g_fc_table'))&&h.includes(X.items.g_fc_table.line)&&h.includes('花序 Flower Notes')&&!/undefined|NaN/.test(h),h.slice(0,200)); });

  /* ======================= 5 送她 ======================= */
  await sec(5,async()=>{ const nm=id=>SOCIAL.displayName(id), hand=(g,id)=>[null,'你把'+nameI(g)+'遞給'+nm(id)+'。'];
    const bad=[]; let n=0; for(const pid of PEOPLE) for(const mode of ['dating','friend']){ if(pid===SIS&&mode==='dating') continue; const g=ITEMS[n++%3];
      const G=setup('2025-10-15',15,{zone:'campus',lv:{[pid]:3},dating:mode==='dating'?[pid]:[]}); GIFTH.rec(G).bag.push({id:g,day:G.day,shop:'gg_flower'}); const a=J(SOCIAL.rel(pid));
      const O=STORY.TALK_OPTS.map(f=>f(G,pid,GM)||[]).flat().filter(o=>o.t===GIFTH.TALK); const r=O.length===1?await run(()=>O[0].run(GM,who(pid)),[nameI(g)]):{S:[],O:[]};
      const want=[hand(g,pid)].concat(flat(X.give[pid][mode],{w:nm(pid),thing:nameI(g)}));
      if(!(O.length===1&&!O[0].dim&&same(r,want)&&!GIFTH.bag(G).length&&J(SOCIAL.rel(pid))===a&&(GIFTH.rec(G).given[pid]||[]).includes(g)&&!J(got(r)).includes('{物}'))) bad.push(pid+'/'+mode+' '+J(got(r)).slice(0,160)); }
    check('5. 平常日子（10/15）：和她說話的選單有「'+GIFTH.TALK+'」→ 挑成品 → 「你把…遞給…」＋ give 的 dating／friend（十三格；{物}＝成品名）；包包少一樣；不加一般送禮的好感（稿沒有寫）',!bad.length,bad.join(' ／ ').slice(0,500));
    { const G=setup('2025-10-15',15,{zone:'campus',lv:{[AN]:3}}); GIFTH.rec(G).bag.push({id:'g_fn_rose',day:G.day,shop:'gg_flower'}); const O=STORY.TALK_OPTS.map(f=>f(G,AN,GM)||[]).flat().filter(o=>o.t===GIFTH.TALK);
      check('5. 平常日子包包裡只有買來的花：沒有「送她禮物…」（買的照舊只有節日、生日能送）',O.length===0);
      GIFTH.rec(G).bag.push({id:'g_fc_bouquet',day:G.day,shop:'gg_flower'}); const O2=STORY.TALK_OPTS.map(f=>f(G,AN,GM)||[]).flat().filter(o=>o.t===GIFTH.TALK); const r=await run(()=>O2[0].run(GM,who(AN)),['算了']);
      check('5. 平常日子的清單只列成品（買來的不列）；算了＝沒送',O2.length===1&&J(r.O[0].slice())===J([nameI('g_fc_bouquet'),'算了'])&&GIFTH.bag(G).length===2,J(r.O));
      const Gx=setup('2025-10-15',15,{zone:'campus',lv:{classmate_xinci:3}}); GIFTH.rec(Gx).bag.push({id:'g_fc_bouquet',day:Gx.day,shop:'gg_flower'});
      check('5. 稿沒有反應的人（芯慈）、還不認識的人：不列',!STORY.TALK_OPTS.map(f=>f(Gx,'classmate_xinci',GM)||[]).flat().some(o=>o.t===GIFTH.TALK)&&!FCLASS.talkOpts(setup('2025-10-15',15,{zone:'campus'}),AN).length); }
    { const G=setup('2025-12-24',15,{zone:'campus',lv:{[AN]:3}}); GIFTH.rec(G).bag.push({id:'g_fc_wreath',day:G.day,shop:'gg_flower'},{id:'g_fn_rose',day:G.day,shop:'gg_flower'}); const a=J(SOCIAL.rel(AN));
      const O=STORY.TALK_OPTS.map(f=>f(G,AN,GM)||[]).flat().filter(o=>o.t===GIFTH.TALK); const r=await run(()=>O[0].run(GM,who(AN)),[nameI('g_fc_wreath')]); const R=GIFT_HOLIDAY.react[AN], band=GIFTH.band(G,AN);
      const want=[hand('g_fc_wreath',AN)].concat(flat(R.open.xmas[band],{w:nm(AN)})).concat(flat(X.give[AN].friend,{w:nm(AN),thing:nameI('g_fc_wreath')}));
      check('5. 節日（聖誕）：照原本的選單一個「送她禮物…」（包包裡的都列）；送成品＝節日的 open 照演、接 give 的反應（不演 ok 那一格）；算這個節日送過她',O.length===1&&r.O[0].length===3&&same(r,want)&&J(SOCIAL.rel(AN))===a&&!!GIFTH.rec(G).sent[AN+'|xmas|2025']&&GIFTH.bag(G).length===1&&!R.ok[band].some(t=>r.L.includes(t)),J(got(r)).slice(0,300)); }
    { const ZR='heroine_02', G=setup('2025-12-24',15,{zone:'cafe',dating:[ZR]}); GIFTH.rec(G).bag.push({id:'g_fc_wreath',day:G.day,shop:'gg_flower'}); const R=GIFT_HOLIDAY.react[ZR], band=GIFTH.band(G,ZR);
      const r=await run(()=>GIFTH.counterGive(GM,who(ZR),ZR),[nameI('g_fc_wreath')]); const want=[hand('g_fc_wreath',ZR)].concat(flat(R.open.xmas[band],{w:nm(ZR)})).concat(flat(X.give[ZR].dating,{w:nm(ZR),thing:nameI('g_fc_wreath')}));
      check('5. 節日在吧檯送芷若成品：照她在這份稿的反應（後面是節日原本的回禮），不接「'+GIFTH.COUNTER_NARR+'」（AA 11-12 回 LAWWW-C 七問⑦）',J(got(r).slice(0,want.length))===J(want)&&!r.L.includes(GIFTH.COUNTER_NARR)&&!GIFTH.bag(G).length,J(got(r)).slice(0,300)); }
    { const G=setup('2025-10-15',15,{zone:'campus',dating:[AN]}); const g='g_fc_bouquet'; for(let k=0;k<2;k++) GIFTH.rec(G).bag.push({id:g,day:G.day,shop:'gg_flower'});
      const go=async()=>{ const O=FCLASS.talkOpts(G,AN); return O.length?run(()=>O[0].run(GM,who(AN)),[nameI(g)]):null; }; const r1=await go(), r2=await go(), r3=await go();
      check('5. 同一樣成品可以再送同一個人（重複上課做的）：兩次都照 give；包包空了就沒有選項',!!r1&&!!r2&&r3===null&&J(got(r1))===J(got(r2))&&!GIFTH.bag(G).length&&!GIFTH.givenTo(G,AN,g)&&GIFTH.givenTo(G,AN,'g_fn_rose')===false); } });

  /* ======================= 6 first_class ======================= */
  await sec(6,async()=>{ const F=X.story.first_class, c=X.classes.design, sets=[]; const pres0=STORY.presence, busy0=INV.busyAt; STORY.presence=()=>({here:true}); INV.busyAt=()=>null; try{
    for(let i=0;i<F.choice.length;i++){ const ch=F.choice[i], G=setup('2025-10-15',14,{dating:['heroine_03']}); const a=J(SOCIAL.rel('heroine_03')); const r=await run(()=>STORY.interact(SIGN,GM),[c.name,T.button,ch.t]);
      const want=[['花藝師',T.staff_ask],[null,c.lines[0]]].concat(flat(F.lines,{narr:true})).concat(flat(ch.re,{w:'花藝師'})).concat(flat(c.lines.slice(1),{narr:true}),DONE(c));
      const fl=Object.keys(G.flags).filter(k=>/^FC_DESC_/.test(k)); sets.push(same(r,want)&&J(fl)===J([ch.set])&&G.flags[ch.set]===true&&J(r.O[2].slice())===J(F.choice.map(q=>q.t))&&J(SOCIAL.rel('heroine_03'))===a&&GIFTH.bag(G).length===1); if(!sets[i]) console.log('   6 選項 '+i+'：'+J(got(r)).slice(0,300)+' 旗標 '+fl); }
    check('6. 第一次上課＋有交往中的對象：接在那一門課第一句旁白後面演 first_class（花藝師三句、選項三個、那一項的 re），再演完課；三個選項各記一個旗標（FC_DESC_direct／busy／none）、不加好感',sets.length===3&&sets.every(Boolean)&&J(F.choice.map(q=>q.set))===J(['FC_DESC_direct','FC_DESC_busy','FC_DESC_none']),J(sets));
    { const G=setup('2025-10-15',14,{lv:{[AN]:4}}); const r=await run(()=>STORY.interact(SIGN,GM),[c.name]);
      check('6. 沒有交往中的對象：不演 first_class、沒有旗標；之後交了女朋友再上課也不演（只有第一次）',same(r,[['花藝師',T.staff_ask]].concat(flat(c.lines,{narr:true}),DONE(c)))&&!Object.keys(G.flags).some(k=>/^FC_DESC_/.test(k)));
      G.flags.dating_heroine_01=true; G.day=D('2025-10-22'); G.hour=14; const c2=X.classes.basic; const r2=await run(()=>STORY.interact(SIGN,GM),[c2.name,T.button]);
      check('6. 第二次上課（已經交往）：不演 first_class',same(r2,[['花藝師',T.staff_ask]].concat(flat(c2.lines,{narr:true}),DONE(c2)))&&!Object.keys(G.flags).some(k=>/^FC_DESC_/.test(k)),J(got(r2).slice(0,4))); }
    } finally { STORY.presence=pres0; INV.busyAt=busy0; } });

  /* ======================= 7 一起上課 ======================= */
  await sec(7,async()=>{ const c=X.classes.season, IB=X.together.invite_button, nm=id=>SOCIAL.displayName(id); const pres0=STORY.presence, busy0=INV.busyAt; STORY.presence=()=>({here:true}); INV.busyAt=()=>null;
    try{ const bad=[]; for(const pid of PEOPLE.filter(p=>p!==SIS)) for(let i=0;i<2;i++){ const TG=X.together[pid], ch=TG.choice[i], G=setup('2025-10-15',14,{dating:[pid]}); FCLASS.rec(G).cnt=1; const a=Object.assign({},SOCIAL.rel(pid));
        let hints=null; const c0=GM.choose; GM.choose=async(o,opt)=>{ if(o.some(q=>q.t===IB)) hints=o.map(q=>[q.t,q.hint||'']); return c0(o,opt); }; const r=await run(()=>STORY.interact(SIGN,GM),[c.name,IB,ch.t]); GM.choose=c0;
        const want=[['花藝師',T.staff_ask]].concat(flat(TG.lines,{narr:true})).concat(flat(ch.re,{w:nm(pid)})).concat(flat([TG.end],{narr:true})), b=SOCIAL.rel(pid);
        const dl=(b.npcRom|0)-(a.npcRom|0), df=[(b.fam|0)-(a.fam|0),(b.trust|0)-(a.trust|0),(b.comf|0)-(a.comf|0)];
        const ok=same(r,want)&&J(hints)===J([[T.button,''],[IB,nm(pid)],['算了','']])&&G.money===5000-2*c.price&&Math.abs(G.hour-(14+c.hours))<1e-9&&!GIFTH.bag(G).length&&FCLASS.weekUsed(G)
          &&dl===(ch.fx.love|0)&&J(df)===J([ch.fx.fr|0,ch.fx.fr|0,ch.fx.fr|0])&&J(r.O[2].slice())===J(TG.choice.map(q=>q.t));
        if(!ok) bad.push(pid+'#'+i+' '+J([G.money,G.hour,dl,df,hints,got(r).slice(0,3)]).slice(0,260)); }
      check('7. 交往中的六位（學姊在第 8 節）×兩個選項：清單選課以後多一層「'+T.button+'／'+IB+'（她的名字）／算了」→ together 的 lines → 選項 → re → end；付兩份、時數照課、成品不進包包、fx 照稿（love＝她的戀愛、fr＝熟悉／信任／自在）',!bad.length,bad.join(' ／ ').slice(0,600));
      { const G=setup('2025-10-15',14,{lv:{[AN]:5}}); const r=await run(()=>STORY.interact(SIGN,GM),[X.classes.basic.name]); check('7. 還沒交往（第 5 階）：不列一起上課（選完課直接上）',r.O.length===1&&GIFTH.bag(G).length===1); }
      { const G=setup('2025-10-15',14,{dating:[AN],money:2*c.price-1}); const r=await run(()=>STORY.interact(SIGN,GM),[c.name,IB]); check('7. 一起上課錢不夠付兩份：no_money、不扣錢',r.L[r.L.length-1]===T.no_money&&G.money===2*c.price-1&&G.hour===14&&!FCLASS.weekUsed(G),J(r.L)); }
      { const G=setup('2025-10-15',14,{dating:[AN]}); await run(()=>STORY.interact(SIGN,GM),[c.name,IB,X.together[AN].choice[0].t]); G.hour=11; G.day+=1; const r=await run(()=>STORY.interact(SIGN,GM),[c.name]);
        check('7. 一起上過課的那個禮拜，自己再報名＝week_limit（共用一週一次）',same(r,[['花藝師',T.week_limit]])); }
      { const G=setup('2025-10-15',14,{dating:[AN,'heroine_03']}); let o2=null; const c0=GM.choose; GM.choose=async(o,opt)=>{ if(o.some(q=>q.t===IB)) o2=o.map(q=>q.hint||q.t); return 0; }; await run(()=>STORY.interact(SIGN,GM),[]); GM.choose=c0;
        check('7. 同時和兩位交往：兩位各一項（提示＝名字）',J(o2)===J([T.button,nm(AN),nm('heroine_03'),'算了']),J(o2)); }
      STORY.presence=(id)=>({here:id!==AN}); { const G=setup('2025-10-15',14,{dating:[AN]}); check('7. 她不在臺北（STORY.presence）：不列',!FCLASS.mates(G,2).length); }
      STORY.presence=()=>({here:true}); INV.busyAt=(G,id)=>id===AN?{act:'class'}:null; { const G=setup('2025-10-15',14,{dating:[AN]}); check('7. 她那段時間有課、有班（INV.busyAt）：不列',!FCLASS.mates(G,2).length); }
    } finally { STORY.presence=pres0; INV.busyAt=busy0; } });

  /* ======================= 8 學姊三場 ======================= */
  await sec(8,async()=>{ const SS=X.story.sis, nm=SOCIAL.displayName, IB=X.together.invite_button; const pres0=STORY.presence, busy0=INV.busyAt; STORY.presence=()=>({here:true}); INV.busyAt=()=>null;
    try{ for(let i=0;i<2;i++){ const ch=SS.s1.choice[i], g='g_fc_bouquet', G=setup('2025-10-15',15,{zone:'campus',dating:[SIS]}); G.flags.FC_DESC_busy=true;
        check('8.'+i+' s1 以前：和學姊交往中也不列一起上課（s1 才開）',!FCLASS.canTogether(G,SIS,2));
        for(let k=0;k<2;k++) GIFTH.rec(G).bag.push({id:g,day:G.day,shop:'gg_flower'}); const a=Object.assign({},SOCIAL.rel(SIS));
        const r=await run(()=>FCLASS.talkOpts(G,SIS)[0].run(GM,who(SIS)),[nameI(g),ch.t]); const b=SOCIAL.rel(SIS), o={w:nm(SIS),thing:nameI(g)};
        const want=flat(SS.s1.lines,Object.assign({narr:true},o)).concat(flat(ch.re,o)).concat(flat(SS.s1.end,Object.assign({narr:true},o)));
        check('8.'+i+' s1：第一次把成品送給交往中的學姊＝演 s1（取代 dating 三句；{物}＝成品名；不另外演「你把…遞給…」）、選項 fx 照稿（她的戀愛 +'+ch.fx.love+'）、記 FC_SIS_S1',same(r,want)&&(b.npcRom|0)-(a.npcRom|0)===ch.fx.love&&(b.trust|0)===(a.trust|0)&&G.flags.FC_SIS_S1===true&&!X.give[SIS].dating.some(t=>r.L.includes(t.replace('{物}',nameI(g))))&&!J(got(r)).includes('{物}'),J(got(r)).slice(0,300));
        check('8.'+i+' s1 以後：開出一起上課',FCLASS.canTogether(G,SIS,2));
        const r2=await run(()=>FCLASS.talkOpts(G,SIS)[0].run(GM,who(SIS)),[nameI(g)]);
        check('8.'+i+' 之後再送：照 give.heroine_05.dating 三句（不再演 s1）',same(r2,[[null,'你把'+nameI(g)+'遞給'+nm(SIS)+'。']].concat(flat(X.give[SIS].dating,o))),J(got(r2)));
        /* s3：五天 */
        const d0=G.day, due=[]; for(const dd of [0,4,5]){ G.day=d0+dd; due.push(FCLASS.s3Due(G)); } check('8.'+i+' s3：s1 當天、第 4 天還不演；第 5 天起演',J(due)===J([false,false,true]),J(due));
        G.day=d0+4; const n4=await run(()=>FCLASS.preTalk(GM,who(SIS),SIS),[]); G.day=d0+6; const c3=SS.s3.choice[i], a3=SOCIAL.rel(SIS).npcRom|0; const r3=await run(()=>FCLASS.preTalk(GM,who(SIS),SIS),[c3.t]); const r3b=await run(()=>FCLASS.preTalk(GM,who(SIS),SIS),[]);
        check('8.'+i+' s3：說話前面先演（學姊兩句 → 選項 → re）、fx 照稿、記 FC_SIS_S3、只演一次',!n4.S.length&&same(r3,flat(SS.s3.lines,{narr:true}).concat(flat(c3.re,{w:nm(SIS)})))&&(SOCIAL.rel(SIS).npcRom|0)-a3===c3.fx.love&&G.flags.FC_SIS_S3===true&&!r3b.S.length,J(got(r3)));
        /* s2 */
        G.zone='flower_notes'; G.day=D('2025-10-27'); G.hour=14; G.money=9000; const c=X.classes.basic, c2=SS.s2.choice[i], a2=SOCIAL.rel(SIS).npcRom|0;
        const rs=await run(()=>STORY.interact(SIGN,GM),[c.name,IB,c2.t]);
        const w2=[['花藝師',T.staff_ask]].concat(flat(SS.s2.lines,{narr:true,flags:{FC_DESC_busy:true}})).concat(flat(c2.re,{w:nm(SIS)})).concat(flat(SS.s2.end,{narr:true}));
        const ifs=SS.s2.lines.filter(e=>e.if), shown=ifs.filter(e=>rs.L.some(t=>e.t.endsWith(t)||t===e.t));
        check('8.'+i+' s2：s1 以後第一次約學姊一起上課＝演 s2（取代 together.heroine_05；if 的六句只演 FC_DESC_busy 那兩句）、fx 照稿、付兩份、成品不進包包、記 FC_SIS_S2',same(rs,w2)&&ifs.length===6&&shown.length===2&&shown.every(e=>e.if==='FC_DESC_busy')&&(SOCIAL.rel(SIS).npcRom|0)-a2===c2.fx.love&&G.money===9000-2*c.price&&G.flags.FC_SIS_S2===true&&GIFTH.bag(G).length===0,J(got(rs)).slice(0,300));
        G.day=D('2025-11-03'); G.hour=14; const TG=X.together[SIS], c4=TG.choice[i]; const rt=await run(()=>STORY.interact(SIGN,GM),[c.name,IB,c4.t]);
        check('8.'+i+' 之後再約：照 together.heroine_05（不再演 s2）',same(rt,[['花藝師',T.staff_ask]].concat(flat(TG.lines,{narr:true})).concat(flat(c4.re,{w:nm(SIS)})).concat(flat([TG.end],{narr:true}))),J(got(rt)).slice(0,200)); }
      { const G=setup('2025-10-15',15,{zone:'campus',lv:{[SIS]:4}}); GIFTH.rec(G).bag.push({id:'g_fc_table',day:G.day,shop:'gg_flower'}); const r=await run(()=>FCLASS.talkOpts(G,SIS)[0].run(GM,who(SIS)),[nameI('g_fc_table')]);
        check('8. 還沒和學姊交往：照 friend 那一句、不演 s1、不記 FC_SIS_S1、不開一起上課',same(r,[[null,'你把'+nameI('g_fc_table')+'遞給'+nm(SIS)+'。']].concat(flat(X.give[SIS].friend,{w:nm(SIS)})))&&!G.flags.FC_SIS_S1&&!FCLASS.s3Due(G)); }
      { const G=setup('2025-10-15',14,{dating:[SIS],flags:{FC_SIS_S1:true}}); G.money=9000; FCLASS.rec(G).s1=G.day-1; const c=X.classes.basic; const rs=await run(()=>STORY.interact(SIGN,GM),[c.name,X.together.invite_button,SS.s2.choice[0].t]);
        check('8. s2（第一次上課時沒有被問過＝沒有 FC_DESC_*）：if 的六句都不演，其他照演',same(rs,[['花藝師',T.staff_ask]].concat(flat(SS.s2.lines,{narr:true,flags:{}})).concat(flat(SS.s2.choice[0].re,{w:nm(SIS)})).concat(flat(SS.s2.end,{narr:true})))&&!SS.s2.lines.filter(e=>e.if).some(e=>rs.L.includes(e.t)),J(got(rs)).slice(0,200)); }
      { const G=setup('2025-10-15',15,{zone:'campus',dating:[SIS],flags:{FC_SIS_S1:true}}); FCLASS.rec(G).s1=G.day-9; delete G.flags.dating_heroine_05; check('8. s3：已經不是交往中＝不演',!FCLASS.s3Due(G)); }
      { const chain=typeof SISY23!=='undefined'&&SISY23.preTalk&&SISY23.preTalk._fclass===true, inPre=STORY.PRE_TALK.length>0; const G=setup('2025-10-15',15,{zone:'campus',dating:[SIS],flags:{FC_SIS_S1:true}}); FCLASS.rec(G).s1=G.day-6;
        let r={S:[]}; if(chain) r=await run(()=>SISY23.preTalk(GM),[SS.s3.choice[0].t]);
        check('8. s3 掛在兩條說話的路：STORY.PRE_TALK（talkCharacter）和 SISY23.preTalk（talkSis）'+(typeof SISY23==='undefined'?'（這個測試沒有載 SISY23：只查 PRE_TALK）':''),inPre&&(typeof SISY23==='undefined'||(chain&&r.L.includes(SS.s3.lines[0].t)&&G.flags.FC_SIS_S3===true))); }
    } finally { STORY.presence=pres0; INV.busyAt=busy0; } });

  /* ======================= 9 story.after ======================= */
  await sec(9,async()=>{ const A=X.story.after, nm=SOCIAL.displayName, bad=[];
    for(const pid of PEOPLE.filter(p=>p!==SIS)){ const g='g_fc_bouquet', G=setup('2025-10-15',15,{zone:'campus',dating:[pid]}); GIFTH.rec(G).bag.push({id:g,day:G.day,shop:'gg_flower'});
      await run(()=>FCLASS.talkOpts(G,pid)[0].run(GM,who(pid)),[nameI(g)]); const d0=G.day, a=J(SOCIAL.rel(pid));
      G.day=d0+4; const r4=await run(()=>FCLASS.preTalk(GM,who(pid),pid),[]); G.day=d0+5; const r5=await run(()=>FCLASS.preTalk(GM,who(pid),pid),[]); const r6=await run(()=>FCLASS.preTalk(GM,who(pid),pid),[]);
      if(!(!r4.S.length&&same(r5,flat([A[pid]],{w:nm(pid)}))&&!r6.S.length&&J(SOCIAL.rel(pid))===a)) bad.push(pid+' '+J([got(r4),got(r5),got(r6)]).slice(0,200)); }
    check('9. 六位：交往中送了成品 → 第 4 天說話不說 → 第 5 天起說話先說 after 那一句（她說的）→ 只說一次；不加好感',!bad.length,bad.join(' ／ '));
    { const G=setup('2025-10-15',15,{zone:'campus',lv:{[AN]:4}}); GIFTH.rec(G).bag.push({id:'g_fc_bouquet',day:G.day,shop:'gg_flower'}); await run(()=>FCLASS.talkOpts(G,AN)[0].run(GM,who(AN)),[nameI('g_fc_bouquet')]); G.day+=7; G.flags.dating_heroine_01=true; const r=await run(()=>FCLASS.preTalk(GM,who(AN),AN),[]);
      check('9. 還沒交往的時候送的：之後不說 after（稿：交往中送的才算）',!r.S.length); }
    { const G=setup('2025-10-15',15,{zone:'campus',dating:[AN]}); GIFTH.rec(G).bag.push({id:'g_fc_bouquet',day:G.day,shop:'gg_flower'}); await run(()=>FCLASS.talkOpts(G,AN)[0].run(GM,who(AN)),[nameI('g_fc_bouquet')]); G.day+=7; delete G.flags.dating_heroine_01; const r=await run(()=>FCLASS.preTalk(GM,who(AN),AN),[]);
      check('9. 送了以後分手：不說（那一句說的是「男朋友做的」那一類）',!r.S.length&&!FCLASS.afterDue(G,AN)); }
    { const G=setup('2025-10-15',15,{zone:'campus',dating:[SIS]}); check('9. 學姊不用 after（用 s3）',!FCLASS.afterDue(G,SIS)&&A[SIS]===undefined); }
    check('9. 掛在 STORY.PRE_TALK（和人說話、閒聊前面）',STORY.PRE_TALK.some(f=>/FCLASS|S\.preTalk/.test(String(f)))||STORY.PRE_TALK.length>0); });

  /* ======================= 10 舊存檔 ======================= */
  await sec(10,async()=>{ const G=setup('2025-10-15',14,{dating:[AN]}); delete G.flags.FC; delete G.flags.GIFTH; const before=Object.keys(G.flags).filter(k=>/^FC/.test(k));
    const snap=JSON.parse(JSON.stringify(G)); H.G=snap; SOCIAL.bind(snap); EVENTS.bind(GM);
    check('10. 沒有 G.flags.FC／FC_*／GIFTH 的舊存檔：查詢不會丟例外、也不會寫東西進存檔（週次、s3、after、說話的選單）',!before.length&&FCLASS.weekUsed(snap)===false&&FCLASS.s3Due(snap)===false&&FCLASS.afterDue(snap,AN)===false&&J(FCLASS.talkOpts(snap,AN))==='[]'&&!('FC' in snap.flags));
    const pres0=STORY.presence, busy0=INV.busyAt; STORY.presence=()=>({here:true}); INV.busyAt=()=>null;
    try{ const c=X.classes.basic, F=X.story.first_class; const r=await run(()=>STORY.interact(SIGN,GM),[c.name,T.button,F.choice[2].t]);
      check('10. 舊存檔照樣可以上課（第一次＝完整的 lines＋first_class）、成品進包包；新的紀錄都在 G.flags 底下（FC、FC_DESC_*），存檔最上層沒有新欄位',r.L.includes(c.lines[c.lines.length-1].t)&&GIFTH.bag(snap).length===1&&snap.flags.FC_DESC_none===true&&typeof snap.flags.FC.last==='number'&&J(Object.keys(snap).sort())===J(Object.keys(JSON.parse(JSON.stringify(G))).sort()),J(Object.keys(snap.flags.FC)));
      const again=JSON.parse(JSON.stringify(snap)); H.G=again; SOCIAL.bind(again); EVENTS.bind(GM); check('10. 存了再讀：一週一次的紀錄、包包裡的成品都還在',FCLASS.weekUsed(again)&&GIFTH.bag(again)[0].id===c.makes);
      again.flags.FC='x'; again.flags.GIFTH.bag.push({id:'g_fc_gone',day:1,shop:'gg_flower'}); check('10. 壞掉的紀錄（FC 不是物件、包包裡有不認得的代號）：不丟例外',FCLASS.weekUsed(again)===false&&GIFTH.bag(again).length===1&&typeof FCLASS.rec(again)==='object');
    } finally { STORY.presence=pres0; INV.busyAt=busy0; } });

  console.log(H.fails?('FAILED '+H.fails):'ALL PASS'); process.exit(H.fails?1:0);
})();
