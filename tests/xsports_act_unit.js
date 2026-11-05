/* 新生運動廣場（xs_xsports）的按鈕、旁白、買東西（src/xsports_sys3d.js 包住 XP3 的區域 build；AA_699 第 2 節 企劃線 0e112816a、AA_620 第 2 節 bf0efded8，任務 SPORT-SHOPS-1103）：
   不需要瀏覽器，在 Node 裡建出遊戲真正的區域，用假的 GM（記下說了什麼、錢、時間、選單、旗標）按按鈕：
   ① src/xsports_sys3d.js 載得到（XPA）、區域的 build 已經包上；index.html 接在 xsports3d.js、story3d.js 後面、GAME.boot() 前面；白名單 AA_699@0e112816a approved
   ② 按鈕 5 個：名字、位置、樓層照配置 interact（一樓：看看球架、看看球鞋牆、買東西；二樓：看看球衣牆、系服訂做）；原本的座位（試穿椅一個）、出口不變；
      裁縫圓凳沒有按鈕（不開放）；再建一次不重複；新生南路沒有這些按鈕
   ③ 看看三個＝AA_699 那一句（旁白）；時間、錢、旗標不動；別的按鈕照舊交給原本的 STORY.interact
   ④ 試穿椅「坐下試穿」（STORY.onSeat）＝旁白一句；不扣錢、不加時間、不記旗標；原本的 onSeat 照舊先叫；裁縫圓凳（店員用）坐下不演
   ⑤ 買東西：選單價錢照 AA_620 第 2 節（七樣、不用了）；買了扣錢＋時間 +0.15＋大塑膠袋那一句；不記旗標；「不用了」不扣錢
   ⑥ 錢不夠：選項變灰、按了只出「錢不夠」、不扣錢、時間不動、不說買了那一句
   ⑦ 系服訂做兩版：加入系籃、大一上第 9 週週五～第 10 週＝「法律系的？…」；其他時候（沒加入、第 9 週週四、第 11 週、大一下第 10 週）＝「系服要整隊一起訂…」＋型錄旁白；都不扣錢、不記旗標
   ⑧ 打烊（10:00、22:30）：按鈕只寫開放時間、不演、不扣錢；試穿椅坐下不演
   ⑨ AA_699 原稿（git show 0e112816a）逐句找得到程式裡的每一句；每個價錢在 AA_699 收銀台那一列、AA_620 第 2 節新生運動廣場那一行
   修改前（開發分支 3ca16eb6e）：沒有 src/xsports_sys3d.js＝載入就停（FAILED 1）。修改後 ALL PASS。
   用法：node tests/xsports_act_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址）
{ const w0=console.warn; console.warn=(...a)=>{ if(typeof a[0]==='string'&&/正式模型載入失敗/.test(a[0])) return; w0(...a); }; }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/xinsheng_sports_layout.js','src/xsports3d.js','src/xsports_sys3d.js'];
const miss=files.filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(miss.length){ check('① 檔案都在',false,miss.join('、')); console.log('FAILED '+fails); process.exit(1); }
/* 遊戲裡 story3d.js 比 xsports_sys3d.js 先載：這裡用一個最小的 STORY（interact、onSeat 記下有沒有交給原本的）*/
let baseCalls=0, baseSeat=0; global.STORY={interact:async()=>{ baseCalls++; return false; },onSeat:async()=>{ baseSeat++; return false; }};
global.GAME={G:null};
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const LX=XINSHENG_SPORTS_LAYOUT, ZID='xs_xsports';
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sec=(n,f)=>{ try{ return f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const asec=async(n,f)=>{ try{ return await f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };

/* AA_699 第 2 節／AA_620 第 2 節的句子（一字照抄）*/
const T={ look:'（籃球、排球、網球分三籠裝著。有人拿出一顆籃球拍了兩下，又放回去。）', look_shoes:'（這面牆的鞋比大步少，大多是跑鞋和室內鞋。）',
  jersey_wall:'（牆上掛了好幾件系隊球衣：電機、土木、經濟……法律系那件是深藍色的，背號 7。）',
  tryOn:'（你坐下來試了一雙室內鞋。鞋底的膠還有一點新的味道。）', bought:'（店員把東西裝進一個大塑膠袋，袋子上印著店名。）',
  orderP:'法律系的？你們學長會整批送來，號碼跟他登記就好。', orderO:'系服要整隊一起訂，最少十件。你們系上誰負責？', orderONarr:'（型錄攤在櫃台上，每一件都印著系名。）' };
const MENU=[['籃球',900],['排球',800],['運動 T 恤',390],['運動褲',590],['護膝',450],['水壺',350],['球衣（一般款）',890]];
const fmt=n=>Number(n).toLocaleString('en-US');

// ①
{ const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), ix=f=>html.indexOf('<script src="'+f), boot=html.indexOf('GAME.boot()');
  const AL=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files, a699=AL.find(f=>/AA_699_/.test(f.path));
  check('① XPA 載得到、xs_xsports 的 build 已經包上',typeof XPA!=='undefined'&&Z3.ZONES.xs_xsports._xpa===true);
  check('① index.html：xsports_sys3d.js 在 xsports3d.js、story3d.js 後面、GAME.boot() 前面',ix('src/xsports_sys3d.js')>Math.max(ix('src/xsports3d.js'),ix('src/story3d.js'))&&ix('src/xsports3d.js')>0&&ix('src/xsports_sys3d.js')<boot);
  check('① 白名單：AA_699@0e112816a approved（kind text）',!!a699&&a699.sha==='0e112816a'&&a699.status==='approved'&&a699.kind==='text',J(a699&&a699.sha)); }

const BTN=()=>E.interactables.filter(q=>q.xpa);
// ②
sec('②',()=>{ loadZone(ZID); const b=BTN();
  check('② 5 個按鈕，名字、位置、樓層照配置 interact',b.length===5&&J(b.map(q=>[q.label,q.x,q.z,q.lv,q.xpa.kind]))===J(LX.interact.map(q=>[q.label,q.x,q.z,q.lv|0,q.kind])),J(b.map(q=>[q.label,q.lv])));
  const want={look:0,look_shoes:0,cashier:0,jersey_wall:1,order:1};
  check('② 一樓：看看球架、看看球鞋牆、買東西；二樓：看看球衣牆、系服訂做',b.every(q=>want[q.xpa.kind]===q.lv)&&J(b.map(q=>q.label))===J(['看看','看看','買東西','看看','系服訂做']));
  const seats=E.interactables.filter(q=>q.seat);
  check('② 原本的座位（試穿椅「坐下試穿」一個）、出口不變；新按鈕不是座位',seats.length===1&&seats[0].label==='坐下試穿'&&(seats[0].lv|0)===0&&E.interactables.filter(q=>q.exit).length===1&&b.every(q=>!q.seat&&!q.exit)&&E.interactables.length===1+1+5);
  const st=LX.seats.find(s=>s.kind==='stool'); check('② 裁縫圓凳（二樓、店員用）沒有按鈕',!!st&&!E.interactables.some(q=>(q.lv|0)===1&&Math.hypot(q.x-st.x,q.z-st.z)<0.6));
  loadZone(ZID); check('② 再建一次還是 5 個',BTN().length===5);
  loadZone('xinsheng'); check('② 新生南路沒有這些按鈕',BTN().length===0); });

// 假的 GM；日子
const wd=d=>CALENDAR.dateOf(d).wd; let THU=1; while(wd(THU)!==4) THU++;
const dayOf=(term,week,w)=>{ for(let d=-30;d<1500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===week&&wd(d)===w) return d; } return null; };
function mkGM(hour,day,money,picks,flags){ const G={hour,day,zone:ZID,flags:Object.assign({},flags||{}),money}; GAME.G=G; picks=(picks||[]).slice();
  const log={said:[],menus:[],toast:[],caption:[],adv:[],scene:0};
  const GM={G,E,enterN:1,
    say:async(sp,t)=>{ log.said.push([sp&&sp.name||null,t]); }, sceneBegin(){ log.scene++; }, sceneEnd(){ log.scene--; },
    choose:async opts=>{ log.menus.push(opts.map(o=>[o.t,!!o.dim])); const k=picks.shift(); return k==null?opts.length-1:k; },
    money(d){ G.money+=d; }, toast(t){ log.toast.push(t); }, caption(a,t){ log.caption.push(t); },
    advance(h){ log.adv.push(h); G.hour+=h; }, autosave(){} };
  return {G,GM,log}; }
const btn=kind=>BTN().find(q=>q.xpa.kind===kind);
const near=(a,b)=>Math.abs(a-b)<1e-9;

(async()=>{
// ③
await asec('③',async()=>{ loadZone(ZID); const bad=[];
  for(const k of ['look','look_shoes','jersey_wall']){ const {G,GM,log}=mkGM(15,THU,5000), b0=baseCalls, r=await STORY.interact(btn(k),GM);
    if(!(r===true&&J(log.said)===J([[null,T[k]]])&&G.hour===15&&G.money===5000&&J(G.flags)==='{}'&&log.scene===0&&baseCalls===b0&&!log.menus.length)) bad.push(k+' '+J(log.said)); }
  check('③ 看看三個（球架、球鞋牆、二樓球衣牆）＝AA_699 那一句（旁白）；時間、錢、旗標不動',!bad.length,bad.join('｜'));
  { const {GM}=mkGM(15,THU,5000), b0=baseCalls; await STORY.interact({label:'別的',x:0,z:0},GM); check('③ 別的按鈕照舊交給原本的 STORY.interact',baseCalls===b0+1); } });

// ④
await asec('④',async()=>{ const z=loadZone(ZID); const bench=E.interactables.find(q=>q.seat&&q.label==='坐下試穿');
  { const {G,GM,log}=mkGM(15,THU,5000), b0=baseSeat; await STORY.onSeat(GM,bench.seat);
    check('④ 試穿椅「坐下試穿」＝旁白一句；不扣錢、不加時間、不記旗標；原本的 onSeat 照舊先叫',J(log.said)===J([[null,T.tryOn]])&&G.money===5000&&G.hour===15&&!log.adv.length&&J(G.flags)==='{}'&&baseSeat===b0+1,J(log.said)); }
  { const stool=z.seats.find(s=>s.npcOnly), {GM,log}=mkGM(15,THU,5000); await STORY.onSeat(GM,stool);
    check('④ 裁縫圓凳（店員用，npcOnly）坐下不演',!!stool&&(stool.lv|0)===1&&log.said.length===0); }
  { const {GM,log}=mkGM(15,THU,5000); GM.G.zone='xs_dabu'; await XPA.onSeat(GM,bench.seat); check('④ 別的店不演',log.said.length===0); } });

// ⑤
await asec('⑤',async()=>{ loadZone(ZID); const bad=[];
  for(let pick=0;pick<MENU.length;pick++){ const price=MENU[pick][1]; const {G,GM,log}=mkGM(15,THU,5000,[pick]); await STORY.interact(btn('cashier'),GM);
    const m=log.menus[0]||[], menuOk=J(m)===J(MENU.map(([n,p])=>[n+'　'+fmt(p)+' 元',false]).concat([['不用了',false]]));
    if(!(menuOk&&G.money===5000-price&&near(G.hour,15.15)&&J(log.said)===J([[null,T.bought]])&&J(G.flags)==='{}')) bad.push(J([pick,m,G.money,G.flags,log.said])); }
  check('⑤ 買東西：選單照 AA_620（'+MENU.map(x=>x[0]+' '+x[1]).join('、')+'、不用了）；買了扣錢、時間 +0.15、大塑膠袋那一句、不記旗標',!bad.length,bad.join('｜'));
  { const {G,GM,log}=mkGM(15,THU,5000,[]); await STORY.interact(btn('cashier'),GM); check('⑤ 「不用了」不扣錢、不說話、時間不動',G.money===5000&&!log.said.length&&G.hour===15); } });

// ⑥
await asec('⑥',async()=>{ loadZone(ZID); const bad=[];
  for(const [pick,money] of [[0,800],[6,500],[2,100]]){ const {G,GM,log}=mkGM(15,THU,money,[pick]); await STORY.interact(btn('cashier'),GM); const m=log.menus[0]||[];
    const dimOk=MENU.every(([n,p],i)=>m[i]&&m[i][1]===(money<p));
    if(!(dimOk&&J(log.toast)===J(['錢不夠'])&&G.money===money&&!log.said.length&&G.hour===15)) bad.push(J([pick,money,m,log.toast,G.money,log.said])); }
  check('⑥ 錢不夠：買不起的選項變灰、按了只出「錢不夠」、不扣錢、時間不動、不說買了那一句',!bad.length,bad.join('｜')); });

// ⑦
await asec('⑦',async()=>{ loadZone(ZID); const C={CLUB_dept_basketball:true};
  const w9fri=dayOf('Y1S1',9,5), w9sun=dayOf('Y1S1',9,7), w10mon=dayOf('Y1S1',10,1), w10sun=dayOf('Y1S1',10,7), w9thu=dayOf('Y1S1',9,4), w11mon=dayOf('Y1S1',11,1), s2w10=dayOf('Y1S2',10,3);
  check('⑦ 日曆找得到大一上第 9～11 週、大一下第 10 週',[w9fri,w9sun,w10mon,w10sun,w9thu,w11mon,s2w10].every(d=>d!=null),J([w9fri,w10sun,s2w10]));
  const P=J([['店員',T.orderP]]), O=J([['店員',T.orderO],[null,T.orderONarr]]); const bad=[];
  for(const [day,flags,want,why] of [[w9fri,C,'P','加入系籃、第 9 週週五'],[w9sun,C,'P','第 9 週週日'],[w10mon,C,'P','第 10 週週一'],[w10sun,C,'P','第 10 週週日'],
      [w10mon,{},'O','沒加入系籃、第 10 週'],[w9thu,C,'O','第 9 週週四'],[w11mon,C,'O','第 11 週'],[s2w10,C,'O','大一下第 10 週'],[THU,C,'O','開學前／別的日子']]){
    const {G,GM,log}=mkGM(15,day,5000,[],flags); await STORY.interact(btn('order'),GM);
    const ok=J(log.said)===(want==='P'?P:O)&&G.money===5000&&G.hour===15&&J(G.flags)===J(flags)&&!log.menus.length;
    if(!ok) bad.push(why+' '+J(log.said)); }
  check('⑦ 系服訂做：訂系服那段時間（加入系籃、大一上第 9 週週五～第 10 週）＝「法律系的？…」；其他時候＝「系服要整隊一起訂…」＋型錄旁白；不扣錢、不記旗標、沒有選單',!bad.length,bad.join('｜')); });

// ⑧
await asec('⑧',async()=>{ loadZone(ZID); const bad=[];
  for(const hour of [10,22.5]){ for(const it of BTN()){ const {G,GM,log}=mkGM(hour,THU,5000,[0]); await STORY.interact(it,GM);
      if(!(log.said.length===0&&log.caption.length===1&&log.caption[0]===PLACES.closedText(ZID,hour,THU)&&G.money===5000)) bad.push(J([hour,it.label,log])); }
    const st=E.interactables.find(q=>q.seat); { const {GM,log}=mkGM(hour,THU,5000); await STORY.onSeat(GM,st.seat); if(log.said.length) bad.push(J([hour,'seat',log.said])); } }
  check('⑧ 打烊（10:00、22:30）：按鈕只寫開放時間、不演、不扣錢；試穿椅坐下不演',!bad.length,bad.slice(0,3).join('｜')); });

// ⑨
sec('⑨',()=>{ const show=(sha,p)=>{ try{ return cp.execSync(`git show ${sha}:${p}`,{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
  const d699=show('0e112816a','docs/story_planning/AA_699_新生運動廣場互動點與三間打烊.md'), d620=show('bf0efded8','docs/story_planning/AA_620_運動用品店_球鞋_球拍_球衣.md');
  if(!d699||!d620){ check('⑨ git show 0e112816a／bf0efded8 讀得到（git fetch origin claude/magical-albattani-bk7b4n）',false); return; }
  const sec2=d699.slice(d699.indexOf('## 2.'));
  const want=[T.look,T.look_shoes,T.jersey_wall,T.tryOn,T.bought,'店員：'+T.orderP,'店員：'+T.orderO+T.orderONarr];
  const m1=want.filter(t=>!sec2.includes(t));
  check('⑨ 測試裡的句子每一句都在 AA_699 第 2 節（0e112816a）',!m1.length,m1.join('｜'));
  check('⑨ 二樓球衣牆那一句也是 AA_620 原句',d620.includes(T.jersey_wall));
  const L=XPA.L, code=[L.look,L.lookShoes,L.jersey,L.tryOn,L.bought,L.orderPeriod,L.orderOther,L.orderOtherNarr], lost=code.filter(t=>!sec2.includes(t));
  check('⑨ 程式裡（XPA.L）的每一句都找得到 AA_699 第 2 節',!lost.length&&J(code)===J([T.look,T.look_shoes,T.jersey_wall,T.tryOn,T.bought,T.orderP,T.orderO,T.orderONarr]),lost.join('｜'));
  const row=sec2.split('\n').find(l=>/收銀台/.test(l))||'', s620=d620.slice(d620.indexOf('## 2.'),d620.indexOf('## 3.')), l620=s620.split('\n').find(l=>/新生運動廣場/.test(l))||'';
  const has=(l,n,p)=>l.includes(n+' '+p)||l.includes(n+p)   /* 原稿：「籃球 900」「球衣（一般款）890」*/, pr=MENU.filter(([n,p])=>!has(row,n,p)), pr2=MENU.filter(([n,p])=>!has(l620,n,p));
  const codeP=J(XPA.ITEMS.map(i=>[i.name,i.price]))===J(MENU);
  check('⑨ 價錢：每一樣都在 AA_699 收銀台那一列、AA_620 第 2 節新生運動廣場那一行；程式的選單一樣',!pr.length&&!pr2.length&&codeP,J([pr,pr2,codeP]));
  check('⑨ AA_699：裁縫圓凳「不開放」、這間的鞋不另外訂價（試穿只是旁白）',/裁縫車前的圓凳[^\n]*不開放/.test(sec2)&&/試穿只是旁白/.test(sec2)); });

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
