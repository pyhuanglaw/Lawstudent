/* 季節攤販六攤的看、買＋季節落地布置五項的看（SEASON3-LINES-1111；2026-11-12）——不需要瀏覽器（D131）。
   字：src/data/season_stalls.js（AA_793 @e2ea0ea3c，tools/story/import_season_stalls.py）；演出：src/season_stalls3d.js（買的流程是 src/night_market3d.js 的 NM3.serve）；
   位置、哪一天擺：src/data/season_deco.js＋src/season_deco3d.js（SD3）。
   1  index.html 有載入（資料在前、程式在後，都在 season_deco3d.js、night_market3d.js 後面）；白名單有那一筆；匯入工具 --check 一致
   2  逐字對稿：六攤的名字、look、closed、greet、每一樣的 id／品名／價錢／buy、hours；looks 五句、looksFruit 五句（有企劃線那個 commit 就整份比；另外名字、品名、價錢對下面這張表）
   3  稿的六攤一對一對到 season_deco.js 擺好的六攤（key）、稿的五項布置都對到 season_deco.js 的看的位置（id）；稿的鐘點＝season_deco.js 那一組的 hours
   4  擺出來的那一天：有互動點「看＋稿的 name」（在客人站的位置）；每一樣各買一次：look → 攤販一句 greet（稿裡的）→ 選單「品名　價錢 元」＋「算了」→ 扣那個價錢、時間過 5 分鐘、buy 逐字照順序；
      二手教科書（noVendor）沒有 greet，直接選單；同一天第二次不再念 look；選「算了」不扣錢
   5  錢不夠：變灰，硬選＝「錢不夠」、不扣錢、不演 buy
   6  收攤的鐘點（人還在區域裡）：closed 一句、不出選單、不扣錢
   7  沒擺的日子、擺的日子但時段外進區域：沒有互動點；硬叫也不演
   8  落地布置：有的那一天按了念稿的那一句；水果照今天那一組多念那一箱的一句（冬天椪柑、草莓兩句）；平常日沒有
   9  不改存檔：買完、看完以後存檔沒有多欄位
   修改前（42a854dee9：沒有 season_stalls.js、season_stalls3d.js、import_season_stalls.py）：0 就 FAIL。用法：node tests/season3_lines_1112_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), SHA='f06354493'/* 2026-11-12 重匯（舊 e2ea0ea3c）：花序門口的花照季節各一句、水果箱只演當季一句、花束攤老闆娘 */, SRC='docs/story_planning/AA_793_season3_stalls.json';
global.window=global;
process.on('unhandledRejection',()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const done=()=>{ console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0); };
const need=['src/data/season_stalls.js','src/season_stalls3d.js','tools/story/import_season_stalls.py'].filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(need.length){ check('0. 季節攤販看、買的檔案在',false,need.join(' ')); done(); }
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|SEASON_DECO|SD3|NIGHT_MARKET|NM3|SEASON_STALLS|SS3)$/.test(n)?'var '+n+'=globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
/* 區域、資產的替身（和 tests/season_deco_unit.js 一樣）：區域只有群組，SD3 照日期記下今天擺的攤、今天有的布置 */
const mk=name=>({name,visible:true,children:[],userData:{},traverse(fn){ fn(this); for(const c of this.children) c.traverse(fn); },clone(){ const o=mk(this.name); o.children=this.children.map(c=>c.clone()); return o; },add(c){ this.children.push(c); }});
global.ASSETS={manifest:{},loadOne(){ return Promise.resolve({scene:mk('scene')}); }};
global.Z3={ZONES:{wenzhou:{id:'wenzhou',build(){ return {group:mk('wz'),id:'wenzhou',nav:null}; }},gongguan:{id:'gongguan',build(){ return {group:mk('gg'),id:'gongguan',nav:null}; }}}};
global.GAME={G:{day:1,hour:12}};
for(const f of ['src/data/calendar.js','src/data/season_deco.js','src/season_deco3d.js','src/data/night_market.js','src/night_market3d.js','src/data/season_stalls.js','src/season_stalls3d.js']) run(f);
const DECO=SEASON_DECO, SS=SEASON_STALLS, html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');

/* 1 */
{ const iD=html.indexOf('src/data/season_stalls.js'), iC=html.indexOf('src/season_stalls3d.js'), iS=html.indexOf('src/season_deco3d.js'), iN=html.indexOf('src/night_market3d.js');
  check('1. index.html 載入 season_stalls.js（資料）、season_stalls3d.js（程式），都在 season_deco3d.js、night_market3d.js 後面',iD>0&&iC>iD&&iD>iS&&iD>iN&&iS>0&&iN>0);
  const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')), e=allow.files.filter(x=>x.path===SRC);
  check('1. 白名單有 AA_793 那一筆（approved、'+SHA+'）；資料檔寫的來源一樣',e.length===1&&e[0].status==='approved'&&e[0].sha===SHA&&!!e[0].approvedBy&&SS.src===SRC+'@'+SHA,JSON.stringify(e.map(x=>[x.sha,x.status])));
  let out='', ok=false, skip=false; try{ cp.execFileSync('git',['-C',ROOT,'cat-file','-e',SHA+':'+SRC],{stdio:'ignore'}); }catch(err){ skip=true; }
  if(!skip){ try{ out=cp.execFileSync('python3',[path.join(ROOT,'tools/story/import_season_stalls.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(err){ out=String(err.stderr||err.message).slice(0,200); } }
  check('1. 匯入工具 --check：資料檔和企劃稿一致'+(skip?'（這個複本沒有企劃線的 '+SHA+'，略過；逐字對稿看第 2 項的表）':''),skip||ok,out.trim().slice(0,120)); }

/* 2 逐字對稿 */
const TABLE={   /* 稿的名字、品名、價錢、鐘點（AA_793 @e2ea0ea3c；企劃線的 commit 拿不到的時候也比得到）*/
  sea_yam:['烤地瓜',[['烤地瓜（小）',60],['烤地瓜（大）',100]],[15,22]],
  sea_aiyu:['愛玉・仙草',[['檸檬愛玉',40],['仙草',40],['綜合（愛玉＋仙草）',50]],[13,18]],
  sea_mooncake:['中秋禮盒',[['蛋黃酥禮盒（六入）',480],['蛋黃酥（單顆）',55],['綠豆椪（單顆）',45],['廣式月餅禮盒（四入）',560]],[10,21]],
  sea_couplet:['春聯年貨',[['春聯（一副）',100],['福字',30],['紅包袋（一包十個）',50]],[10,21]],
  sea_bouquet:['畢業花束',[['向日葵花束（單支）',250],['向日葵花束（三朵）',450]],[10,18]],
  sea_textbook:['二手教科書',[['民法總則（二手）',350],['刑法總則（二手）',400],['憲法（二手）',300],['經濟學原理（二手）',380]],[10,21]]};
{ const bad=[]; for(const k in TABLE){ const st=SS.stalls[k]; if(!st){ bad.push(k+' 沒有'); continue; } if(st.name!==TABLE[k][0]) bad.push(k+' 名字'); if(!eq(st.items.map(i=>[i.name,i.price]),TABLE[k][1])) bad.push(k+' 品項或價錢'); if(!eq([st.open.from,st.open.to],TABLE[k][2])) bad.push(k+' 時間 '+JSON.stringify(st.open)); }
  check('2. 六攤的名字、品名、價錢、鐘點和稿的表一樣（18 樣）；二手教科書 noVendor、greet 空的',!bad.length&&Object.keys(SS.stalls).length===6&&Object.values(SS.stalls).reduce((n,s)=>n+s.items.length,0)===18&&SS.stalls.sea_textbook.noVendor===true&&eq(SS.stalls.sea_textbook.greet,[])&&Object.keys(SS.stalls).filter(k=>SS.stalls[k].noVendor).length===1,bad.join(' | '));
  let raw=null; try{ raw=JSON.parse(cp.execFileSync('git',['-C',ROOT,'show',SHA+':'+SRC],{encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']})); }catch(e){}
  if(!raw) check('2. 整份逐字比企劃稿（這個複本沒有企劃線的 '+SHA+'，略過）',true);
  else { const diff=[]; for(const k in raw.stalls){ const a=raw.stalls[k], b=SS.stalls[k]||{}; for(const f of Object.keys(a)) if(!eq(a[f],b[f])) diff.push(k+'.'+f); for(const f of Object.keys(b)) if(!(f in a)&&f!=='open') diff.push(k+'.'+f+'（稿上沒有）'); }
    { const rl=JSON.parse(JSON.stringify(raw.looks)); for(const k in rl) if(rl[k]&&typeof rl[k]==='object') delete rl[k].note; if(!eq(rl,SS.looks)) diff.push('looks'); } if(!eq(raw.looksFruit,SS.looksFruit)) diff.push('looksFruit');
    check('2. 整份逐字比企劃稿（'+SHA+'）：六攤每一個欄位、looks 五句、looksFruit 五句一個字都不差',!diff.length&&eq(Object.keys(raw.stalls),Object.keys(SS.stalls))&&Object.keys(raw.looks).length===5&&Object.keys(raw.looksFruit).length===5,diff.join(' ')); } }

/* 3 對到 season_deco.js */
const PLACED=[]; for(const zid of Object.keys(DECO.zones)) for(const q of DECO.zones[zid].stalls||[]) PLACED.push({zid,q});
const LOOKS={}; for(const zid of Object.keys(DECO.zones)){ const L=DECO.zones[zid].looks||{}; for(const c of Object.keys(L)) for(const q of L[c]) (LOOKS[q.id]=LOOKS[q.id]||[]).push({zid,code:c,q}); }
{ const a=PLACED.map(p=>p.q.key).sort(), b=Object.keys(SS.stalls).sort();
  const hrs=PLACED.filter(p=>{ const st=SS.stalls[p.q.key], R=DECO.rules[p.q.code]; return !st||!R||!R.hours||R.hours[0]!==st.open.from||R.hours[1]!==st.open.to; }).map(p=>p.q.key);
  check('3. 稿的六攤一對一對到 season_deco.js 擺好的六攤（key），每一攤有客人站的位置；稿的鐘點＝那一組的 hours',eq(a,b)&&a.length===6&&PLACED.every(p=>p.q.at&&typeof p.q.at.x==='number')&&!hrs.length,a.join()+' / '+b.join()+' / '+hrs.join());
  const miss=Object.keys(SS.looks).filter(id=>!LOOKS[id]), noText=Object.keys(LOOKS).filter(id=>!SS.looks[id]);
  const fr=LOOKS.sea_fruit||[], frBad=fr.filter(x=>!SS3.FRUIT[x.code]||!SS3.FRUIT[x.code].every(f=>SS.looksFruit[f])).map(x=>x.code), used=[].concat(...fr.map(x=>SS3.FRUIT[x.code]||[])).sort();
  check('3. 稿的五項布置都對到 season_deco.js 看的位置（id），反過來也都有字；水果的四組都對到 looksFruit、五種水果都用到',!miss.length&&!noText.length&&Object.keys(SS.looks).length===5&&fr.length===4&&!frBad.length&&eq(used,Object.keys(SS.looksFruit).sort()),miss.concat(noText,frBad).join(' ')); }

/* 假的遊戲：記下說了什麼、出了什麼選單（和 tests/night_market_unit.js 一樣）*/
function game(money,day,hour,pick){ const G={day,hour,money,flags:{}}, log=[], menus=[], toasts=[]; let depth=0, saves=0;
  const GM={G,E:null,say:async(w,t)=>{ log.push([w?w.name:null,t]); },choose:async o=>{ menus.push(o); return typeof pick==='function'?pick(o):pick; },money:d=>{ G.money+=d; },advance:h=>{ G.hour+=h; },toast:t=>{ toasts.push(t); },
    sceneBegin(){ depth++; },sceneEnd(){ depth--; },autosave(){ saves++; }};
  return {GM,G,log,menus,toasts,depth:()=>depth,saves:()=>saves}; }
const fresh=()=>{ NM3._seen={}; NM3._prev={}; };
const midOf=code=>{ const R=DECO.rules[code]; return R.hours?(R.hours[0]+R.hours[1])/2:12; };
const dayFor=(code,hour)=>{ for(let d=30;d<=1500;d++) if(SD3.on(code,d,{hour,weather:'clear'})) return d; return null; };
const dayNot=(code,hour)=>{ for(let d=30;d<=1500;d++) if(!SD3.on(code,d,{hour,weather:'clear'})&&CALENDAR.dateOf(d)) return d; return null; };
/* 進區域：照 X 的日期、鐘點建（SD3 在這一刻決定今天擺哪幾攤）*/
const enter=(zid,X)=>{ global.GAME=X.GM; const E={interactables:[]}; const z=Z3.ZONES[zid].build(E); E.zone=z; return {E,z}; };
const isNarr=t=>NM3.isNarr(t);
const WHO={sea_yam:'阿伯',sea_aiyu:'阿姨',sea_mooncake:'店員',sea_couplet:'老闆',sea_bouquet:'老闆娘'/* 2026-11-12 AA_793 lawww_1112 ①（舊：老闆）*/,sea_textbook:'店員'};   /* 稿的旁白裡的稱呼；沒有的照夜市的「老闆」*/

(async()=>{
  /* 4 每一樣各買一次 */
  { const bad=[]; let n=0;
    for(const {zid,q} of PLACED){ const st=SS.stalls[q.key], h=midOf(q.code), d=dayFor(q.code,h); if(d==null){ bad.push(q.key+' 找不到擺的日子'); continue; }
      for(let i=0;i<st.items.length;i++){ fresh(); const it=st.items[i], X=game(1000,d,h,i), {E}=enter(zid,X), its=E.interactables.filter(x=>x.seasonStall===q.key), P=its[0]; n++;
        if(its.length!==1||!P){ bad.push(q.key+' 互動點 '+its.length); continue; }
        if(P.label!=='看'+st.name||P.x!==q.at.x||P.z!==q.at.z||typeof P.onInteract!=='function') bad.push(q.key+' 按鈕或位置 '+P.label);
        const r=await P.onInteract(P), nl=st.look.length, ng=st.greet.length?1:0, look=X.log.slice(0,nl), gr=X.log[nl], buy=X.log.slice(nl+ng);
        if(r!==it.id) bad.push(it.id+' 回傳 '+r);
        if(!eq(look,st.look.map(t=>[null,t]))) bad.push(it.id+' look');
        if(ng&&(!gr||gr[0]!==WHO[q.key]||!st.greet.includes(gr[1]))) bad.push(it.id+' greet '+JSON.stringify(gr));
        if(X.menus.length!==1||!eq(X.menus[0].map(o=>o.t),st.items.map(x=>x.name+'　'+x.price+' 元').concat(['算了']))||X.menus[0].some(o=>o.dim)) bad.push(it.id+' 選單');
        if(X.G.money!==1000-it.price) bad.push(it.id+' 錢 '+X.G.money);
        if(Math.abs(X.G.hour-h-5/60)>1e-9) bad.push(it.id+' 時間');
        if(!eq(buy,it.buy.map(t=>[isNarr(t)?null:WHO[q.key],t]))) bad.push(it.id+' buy '+JSON.stringify(buy));
        if(X.depth()!==0||X.saves()!==1) bad.push(it.id+' 段落或存檔'); } }
    check('4. 六攤 18 樣各買一次（擺出來的那一天、時段中間）：按鈕「看＋稿的 name」在客人站的位置；look → 一句 greet → 選單「品名　價錢 元」＋「算了」→ 扣那個價錢、時間過 5 分鐘、buy 逐字照順序',!bad.length&&n===18,bad.slice(0,6).join(' | '));
    { const p=PLACED.find(p=>p.q.key==='sea_textbook'), st=SS.stalls.sea_textbook, h=12, d=dayFor(p.q.code,h); fresh(); const X=game(1000,d,h,0), {E}=enter(p.zid,X), P=E.interactables.find(x=>x.seasonStall==='sea_textbook'); const r=await P.onInteract(P);
      check('4. 二手教科書（noVendor）：沒有 greet——念完 look 直接出選單；買民法總則扣 350、演稿的兩句（店員那一句在 buy 裡）',r==='sea_tb_civil'&&X.G.money===650&&eq(X.log,st.look.map(t=>[null,t]).concat([[null,st.items[0].buy[0]],['店員',st.items[0].buy[1]]]))&&X.menus.length===1,JSON.stringify(X.log.map(l=>l[0]))); }
    { const p=PLACED.find(p=>p.q.key==='sea_yam'), st=SS.stalls.sea_yam, h=17, d=dayFor(p.q.code,h); fresh(); const A=game(1000,d,h,0), a=enter(p.zid,A), P=a.E.interactables.find(x=>x.seasonStall==='sea_yam'); await P.onInteract(P);
      const B=game(1000,d,h+0.2,st.items.length); global.GAME=B.GM; const r2=await P.onInteract(P);
      check('4. 同一天第二次不再念 look（攤販一句＋選單，和上一次不同句）；選「算了」不扣錢、不演 buy',A.log.length===st.look.length+1+st.items[0].buy.length&&B.log.length===1&&B.log[0][0]==='阿伯'&&st.greet.includes(B.log[0][1])&&B.log[0][1]!==A.log[st.look.length][1]&&r2==='no'&&B.G.money===1000&&B.G.hour===h+0.2&&B.saves()===0,JSON.stringify(B.log)); } }

  /* 5 錢不夠 */
  { const p=PLACED.find(p=>p.q.key==='sea_mooncake'), st=SS.stalls.sea_mooncake, h=12, d=dayFor(p.q.code,h); fresh(); const X=game(60,d,h,0), {E}=enter(p.zid,X), P=E.interactables.find(x=>x.seasonStall==='sea_mooncake'), r=await P.onInteract(P);
    check('5. 錢不夠（60 元在中秋禮盒）：55、45 元的沒有變灰，480、560 元的變灰；硬選 480 元的＝「錢不夠」、不扣錢、不演 buy、時間不動',r==='poor'&&eq(X.menus[0].map(o=>!!o.dim),[true,false,false,true,false])&&X.G.money===60&&X.log.length===st.look.length+1&&eq(X.toasts,['錢不夠'])&&X.G.hour===h&&X.saves()===0&&X.depth()===0,r+' '+JSON.stringify(X.menus[0].map(o=>!!o.dim))); }

  /* 6 收攤的鐘點 */
  { const bad=[];
    for(const {zid,q} of PLACED){ const st=SS.stalls[q.key], h=midOf(q.code), d=dayFor(q.code,h); fresh(); const X=game(1000,d,h,0), {E}=enter(zid,X), P=E.interactables.find(x=>x.seasonStall===q.key); if(!P){ bad.push(q.key+' 沒有互動點'); continue; }
      for(const [hh,want] of [[st.open.from,true],[st.open.to-0.05,true],[st.open.to,false],[st.open.from-0.05,false],[23.5,false],[4,false]]){ fresh(); const Y=game(1000,d,hh,st.items.length); global.GAME=Y.GM; const r=await P.onInteract(P);
        if(want&&(r!=='no'||Y.menus.length!==1)) bad.push(q.key+' '+hh+' 應該開 '+r);
        if(!want&&(r!=='closed'||!eq(Y.log,[[null,st.closed]])||Y.menus.length||Y.G.money!==1000||Y.G.hour!==hh)) bad.push(q.key+' '+hh+' 收攤要只有 closed 一句 '+JSON.stringify(Y.log).slice(0,60)); } }
    check('6. 六攤：稿的開攤那一刻、收攤前 3 分鐘開著；收攤那一刻、開攤前 3 分鐘、深夜、清晨是 closed 一句（不出選單、不扣錢、時間不動）',!bad.length,bad.slice(0,6).join(' | ')); }

  /* 7 沒擺的時候 */
  { const bad=[];
    for(const {zid,q} of PLACED){ const st=SS.stalls[q.key], h=midOf(q.code), d0=dayNot(q.code,h), d1=dayFor(q.code,h);
      for(const [d,hh,why] of [[d0,h,'沒擺的日子'],[d1,st.open.to+0.5,'時段外進區域'],[d1,st.open.from-0.5,'開攤前進區域']]){ fresh(); const X=game(1000,d,hh,0), {E,z}=enter(zid,X);
        if(E.interactables.some(x=>x.seasonStall===q.key)) bad.push(q.key+' '+why+'有互動點');
        const r=await SS3.interact(X.GM,z,q); if(r!==null||X.log.length||X.menus.length||X.G.money!==1000) bad.push(q.key+' '+why+'硬叫還是演了'); } }
    let plain=null; for(let d=30;d<=1500;d++){ if(/-03-25$/.test(CALENDAR.dateOf(d).key)){ plain=d; break; } }
    const X=game(1000,plain,12,0), a=enter('wenzhou',X), b=enter('gongguan',X);
    check('7. 沒擺的日子、時段外（模型沒顯示）：那一攤沒有互動點，硬叫也不演、不扣錢；平常日（3/25 中午）兩個區域一個季節的互動點都沒有',!bad.length&&plain!=null&&!a.E.interactables.length&&!b.E.interactables.length,bad.slice(0,6).join(' | ')+' '+plain+' '+JSON.stringify(a.E.interactables.concat(b.E.interactables).map(i=>i.label))); }

  /* 8 落地布置的看 */
  { const bad=[]; let n=0;
    for(const id of Object.keys(LOOKS)) for(const {zid,code,q} of LOOKS[id]){ const h=midOf(code), d=dayFor(code,h); if(d==null){ bad.push(id+' '+code+' 找不到日子'); continue; }
      const X=game(1000,d,h,0), {E,z}=enter(zid,X), its=E.interactables.filter(x=>x.seasonLook===id), P=its[0]; n++;
      if(its.length!==1||typeof P.onInteract!=='function'){ bad.push(id+' '+code+' 互動點 '+its.length); continue; }
      if(P.label!==q.label||P.x!==q.x||P.z!==q.z) bad.push(id+' 按鈕或位置');
      const got=z.seasonLooks.find(s=>s.id===id); if(!got||got.code!==code) bad.push(id+' 今天那一組 '+(got&&got.code));
      await P.onInteract(P); /* 2026-11-12 改期望（AA_793 lawww_1112 ③⑤）：水果箱只念當季那一句（冬天兩種其中一句）；花台照那一季的一句。舊期望：通用句＋當季每一句；花台一句通用的 */
      const opts=id==='sea_fruit'?SS3.FRUIT[code].map(f=>SS.looksFruit[f]):[typeof SS.looks[id]==='object'?(SS.looks[id][SS3.LOOK_SEASON[code]]||SS.looks[id].spring):SS.looks[id]];
      if(!(X.log.length===1&&X.log[0][0]===null&&opts.includes(X.log[0][1]))||X.menus.length||X.G.money!==1000||X.G.hour!==h) bad.push(id+' '+code+' 念的 '+JSON.stringify(X.log).slice(0,80)); }
    const F=c=>{ const r0=SS3.rnd, out=[]; for(const v of [0,0.99]){ SS3.rnd=()=>v; const L=SS3.lookLines({id:'sea_fruit',code:c}); if(L.length===1&&!out.includes(L[0])) out.push(L[0]); } SS3.rnd=r0; return out; };   /* 隨機取到的每一句（只演一句）*/
    check('8. 落地布置五項（水果四組、花台四組共 11 個日子）：有的那一天有「看」，按了念稿的那一句（沒有名字、不出選單、不扣錢、時間不動）',!bad.length&&n===11,bad.slice(0,6).join(' | ')+' n='+n);
    check('8. 當季水果只念今天那一組的一句、不念通用句：春枇杷、夏芒果、秋文旦、冬椪柑或草莓（隨機其中一句）；四個季節的花台各自的句子不一樣',eq(F('FRUITSPRING'),[SS.looksFruit.loquat])&&eq(F('FRUITSUMMER'),[SS.looksFruit.mango])&&eq(F('FRUITAUTUMN'),[SS.looksFruit.pomelo])&&eq(F('FRUITWINTER'),[SS.looksFruit.ponkan,SS.looksFruit.strawberry])&&new Set(['FNSPRING','FNMAY','FNJUNE','FNXMAS'].map(c=>SS3.lookLines({id:'flower_notes_season',code:c})[0])).size===4);
    { const d=dayFor('MOONBBQ',18), X=game(1000,d,12,0), {E,z}=enter('gongguan',X), q=DECO.zones.gongguan.looks.MOONBBQ[0], r=await SS3.look(X.GM,z,q);
      check('8. 沒顯示的布置（中秋當天中午：烤肉架晚上才有）沒有「看」，硬叫也不念',!E.interactables.some(x=>x.seasonLook==='sea_moon_bbq')&&r===null&&!X.log.length); } }

  /* 9 存檔 */
  { const p=PLACED.find(p=>p.q.key==='sea_aiyu'), h=15, d=dayFor(p.q.code,h); fresh(); const X=game(500,d,h,2), k0=JSON.stringify(Object.keys(X.G).sort()), f0=JSON.stringify(X.G.flags), {E}=enter(p.zid,X), P=E.interactables.find(x=>x.seasonStall==='sea_aiyu'); await P.onInteract(P);
    for(const L of E.interactables.filter(x=>x.seasonLook)) await L.onInteract(L);
    check('9. 不改存檔：買完、看完以後存檔沒有多欄位、flags 沒有多東西（只有錢和時間變）；買了會存檔一次',JSON.stringify(Object.keys(X.G).sort())===k0&&JSON.stringify(X.G.flags)===f0&&X.G.money===450&&X.saves()===1); }

  done();
})().catch(e=>{ console.error(e); console.log('FAILED 1'); process.exit(1); });
