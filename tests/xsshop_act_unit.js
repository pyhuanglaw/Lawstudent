/* 大步球鞋（xs_dabu）、好拍運動（xs_haopai）的按鈕、旁白、買東西（src/xsshop_sys3d.js 包住 XSS 的區域 build；AA_698 企劃線 481cf075d、AA_620 第 2 節 bf0efded8，任務 SPORT-SHOPS-1103）：
   不需要瀏覽器，在 Node 裡建出遊戲真正的區域，用假的 GM（記下說了什麼、錢、時間、選單、坐下站起）按按鈕：
   ① src/xsshop_sys3d.js 載得到（XSSA）、兩個區域的 build 已經包上；index.html 接在 xsshop3d.js、story3d.js 後面、GAME.boot() 前面；白名單 AA_698@481cf075d、AA_620@bf0efded8 approved
   ② 按鈕：大步 6 個、好拍 3 個，名字、位置照配置 interact；原本的座位、出口不變；再建一次不重複；新生南路沒有這些按鈕
   ③ 看看（大步三個照位置對、好拍球拍牆）、照鏡子：說 AA_698 那一句、時間、錢不動
   ④ 試穿：走過去坐上長凳 A（seats[0]）、店員「你幾號？」、旁白、起身；長凳四個位子「坐下試穿」（STORY.onSeat）＝同一段
   ⑤ 大步買東西：店員的話輪流一句（一次進店一句）、選單價錢照 AA_620、買了扣錢＋時間 +0.15＋旁白；籃球鞋 2,800／3,600＝SHOES_BB；別的不記旗標
   ⑥ 好拍買東西：價錢、羽球拍＝OWN_RACKET＋老闆「要穿線嗎？等二十分鐘。」＝在等穿線；別的不在等
   ⑦ 錢不夠：選項變灰、按了只出「錢不夠」、不扣錢、不記旗標、不說「買了」那一句（兩家）；穿線錢不夠一樣
   ⑧ 穿線兩版：沒有拍子＝「拍子呢？」＋旁白、不扣錢；有拍子＝「穿線三百。等二十分鐘。」、扣 300、轉暗、時間過二十分鐘、旁白
   ⑨ 高腳凳兩版：在等穿線＝穿線那一段（扣 300、二十分鐘）、之後就不在等；沒在等＝「高腳凳有點晃…」；紅色圓凳「坐一下」那一句
   ⑩ 打烊（大步 10:00、好拍週日）：按鈕只寫開放時間、不演；坐下不演
   ⑪ AA_698 原稿（git show 481cf075d）、AA_620（git show bf0efded8）逐句找得到程式裡的每一句、每個價錢
   修改前（開發分支 8d77db541）：沒有 src/xsshop_sys3d.js＝載入就停（FAILED 1）。修改後 ALL PASS。
   用法：node tests/xsshop_act_unit.js */
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
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/dabu_layout.js','src/data/haopai_layout.js','src/xsshop3d.js','src/xsshop_sys3d.js'];
const miss=files.filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(miss.length){ check('① 檔案都在',false,miss.join('、')); console.log('FAILED '+fails); process.exit(1); }
/* 遊戲裡 story3d.js 比 xsshop_sys3d.js 先載：這裡用一個最小的 STORY（interact、onSeat 記下有沒有交給原本的）*/
let baseCalls=0, baseSeat=0; global.STORY={interact:async()=>{ baseCalls++; return false; },onSeat:async()=>{ baseSeat++; return false; }};
global.GAME={G:null};
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const LD=DABU_LAYOUT, LH=HAOPAI_LAYOUT.haopai;
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sec=(n,f)=>{ try{ return f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const asec=async(n,f)=>{ try{ return await f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };

/* AA_698／AA_620 的句子（一字照抄）*/
const T={
  dabuLook:{look_basketball:'（籃球鞋排成兩格，高筒的放在上面。有一雙的標籤寫「系隊推薦」。）','-2.75,-3.4':'（跑鞋這一格顏色最亮。每一雙都把鞋底翻過來，給人看紋路。）','2.75,-1.45':'（復古低筒那一格，有一雙的鞋帶是兩種顏色。）'},
  tryAsk:'你幾號？', tryNarr:'（你試了一雙。店員蹲下來按了一下鞋頭：「前面留一指，剛好。」）', mirror:'（你在鏡子前面站了一下，左右各轉了一次。）',
  dabuBought:'（店員把鞋盒裝進紙袋。）', dabuTalk:['打室外場的話，鞋底要選耐磨的。','這雙這個月很多人買，系隊的。','跑鞋不要拿去打籃球，會扭到。'],
  browse:'（天花板也掛滿球拍。穿線機在角落嗒嗒響，老闆一邊穿線一邊看電視上的比賽。）', hpBought:'（老闆把東西裝進塑膠袋，袋子上印著店名。）',
  hpTalk:['第一支不要買太硬的，手會受傷。','線磅數拉二十二就好，你們學生都拉太緊。','桌球的膠皮三個月換一次，看起來沒壞也要換。'],
  ask:'要穿線嗎？等二十分鐘。', string:'穿線三百。等二十分鐘。', stringNarr:'（你坐在門口的小板凳上，看老闆把線一條一條拉緊。）',
  noRacket:'拍子呢？', noRacketNarr:'（你兩手空空。老闆搖搖頭，回去穿他的線。）', stoolIdle:'（高腳凳有點晃。老闆看了你一眼：「等人喔？」）', round:'（你在紅色圓凳上坐了一下。電視上的比賽打到第三局。）' };
const MENU={dabu:[['籃球鞋',2800],['籃球鞋',3600],['跑鞋',2500],['休閒鞋',1900],['球襪',150]],
  haopai:[['羽球拍 入門',1200],['羽球拍 中階',2800],['羽球一筒',450],['桌球拍 成品拍',800],['桌球拍 自己組',2600],['桌球一盒',150],['護腕',120]]};
const fmt=n=>Number(n).toLocaleString('en-US');

// ①
{ const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), ix=f=>html.indexOf('<script src="'+f), boot=html.indexOf('GAME.boot()');
  const AL=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files, a698=AL.find(f=>/AA_698_/.test(f.path)), a620=AL.find(f=>/AA_620_/.test(f.path));
  check('① XSSA 載得到、xs_dabu／xs_haopai 的 build 已經包上',typeof XSSA!=='undefined'&&Z3.ZONES.xs_dabu._xssa===true&&Z3.ZONES.xs_haopai._xssa===true);
  check('① index.html：xsshop_sys3d.js 在 xsshop3d.js、story3d.js 後面、GAME.boot() 前面',ix('src/xsshop_sys3d.js')>Math.max(ix('src/xsshop3d.js'),ix('src/story3d.js'))&&ix('src/xsshop3d.js')>0&&ix('src/xsshop_sys3d.js')<boot);
  check('① 白名單：AA_698@481cf075d、AA_620@bf0efded8 approved（kind text）',!!a698&&a698.sha==='481cf075d'&&a698.status==='approved'&&a698.kind==='text'&&!!a620&&a620.sha==='bf0efded8'&&a620.status==='approved'&&a620.kind==='text',J([a698&&a698.sha,a620&&a620.sha])); }

const BTN=()=>E.interactables.filter(q=>q.xssa);
// ②
sec('②',()=>{ for(const [zid,L,n,seats] of [['xs_dabu',LD,6,4],['xs_haopai',LH,3,2]]){ loadZone(zid); const b=BTN();
    check(`② ${zid}：${n} 個按鈕，名字、位置照配置 interact`,b.length===n&&J(b.map(q=>[q.label,q.x,q.z,q.xssa.kind]))===J(L.interact.map(q=>[q.label,q.x,q.z,q.kind])),J(b.map(q=>q.label)));
    check(`② ${zid}：原本的 ${seats} 個座位、出口不變；新按鈕不是座位`,E.interactables.filter(q=>q.seat).length===seats&&E.interactables.filter(q=>q.exit).length===1&&b.every(q=>!q.seat&&!q.exit)&&E.interactables.length===seats+1+n);
    loadZone(zid); check(`② ${zid}：再建一次還是 ${n} 個`,BTN().length===n); }
  loadZone('xinsheng'); check('② 新生南路沒有這些按鈕',BTN().length===0); });

// 假的 GM
const wd=d=>CALENDAR.dateOf(d).wd; let THU=1, SUN=1; while(wd(THU)!==4) THU++; while(wd(SUN)!==7) SUN++;
let enterN=1;
function mkGM(zone,hour,day,money,picks){ const G={hour,day,zone,flags:{},money}; GAME.G=G; picks=(picks||[]).slice();
  const log={said:[],walk:[],sit:[],stand:0,fade:[],adv:[],scene:0,menus:[],toast:[],caption:[]};
  const P=E.player; P.seat=null;
  const GM={G,E,enterN,
    say:async(sp,t)=>{ log.said.push([sp&&sp.name||null,t]); }, sceneBegin(){ log.scene++; }, sceneEnd(){ log.scene--; },
    choose:async opts=>{ log.menus.push(opts.map(o=>[o.t,!!o.dim])); const k=picks.shift(); return k==null?opts.length-1:k; },
    money(d){ G.money+=d; }, toast(t){ log.toast.push(t); }, caption(a,t){ log.caption.push(t); },
    walkTo:async(ent,x,zz,o)=>{ log.walk.push([x,zz]); }, seatApproach:s=>[s.x+Math.sin(s.yaw)*0.6,s.z+Math.cos(s.yaw)*0.6], freeSeat:s=>s,
    sitAt(ent,s){ log.sit.push(Object.assign({},s)); ent.seat=s; }, standUp(ent){ log.stand++; ent.seat=null; },
    fade:async on=>{ log.fade.push(on); }, advance(h){ log.adv.push(h); G.hour+=h; }, autosave(){} };
  return {G,GM,log}; }
const btn=kind=>BTN().find(q=>q.xssa.kind===kind);
const near=(a,b)=>Math.abs(a-b)<1e-9;

(async()=>{
// ③
await asec('③',async()=>{ loadZone('xs_dabu'); const bad=[];
  for(const it of BTN().filter(q=>q.xssa.act==='look'||q.xssa.act==='mirror')){ const want=it.xssa.kind==='mirror'?T.mirror:(T.dabuLook[it.xssa.kind]||T.dabuLook[it.x+','+it.z]);
    const {G,GM,log}=mkGM('xs_dabu',15,THU,5000), b0=baseCalls, r=await STORY.interact(it,GM);
    if(!(r===true&&want&&J(log.said)===J([[null,want]])&&G.hour===15&&G.money===5000&&log.scene===0&&baseCalls===b0)) bad.push(it.label+' '+J(log.said)); }
  check('③ 大步：看看三個（照位置對）、照鏡子＝AA_698 那一句（旁白）、時間錢不動',!bad.length,bad.join('｜'));
  loadZone('xs_haopai'); { const {G,GM,log}=mkGM('xs_haopai',15,THU,5000); await STORY.interact(btn('browse'),GM);
    check('③ 好拍：看看＝球拍牆那一句',J(log.said)===J([[null,T.browse]])&&G.hour===15&&G.money===5000,J(log.said)); }
  { const {GM}=mkGM('xs_haopai',15,THU,5000), b0=baseCalls; await STORY.interact({label:'別的',x:0,z:0},GM); check('③ 別的按鈕照舊交給原本的 STORY.interact',baseCalls===b0+1); } });

// ④
await asec('④',async()=>{ loadZone('xs_dabu'); const {G,GM,log}=mkGM('xs_dabu',15,THU,5000); await STORY.interact(btn('try_on'),GM); const s0=LD.seats[0];
  check('④ 試穿：走過去、坐上長凳 A（seats[0]）、店員「你幾號？」、旁白、起身；錢時間不動',log.walk.length===1&&log.sit.length===1&&near(log.sit[0].x,s0.x)&&near(log.sit[0].z,s0.z)&&J(log.said)===J([['店員',T.tryAsk],[null,T.tryNarr]])&&log.stand===1&&E.player.seat==null&&G.money===5000&&G.hour===15,J(log));
  const bad=[]; for(const s of LD.seats){ const st=E.interactables.find(q=>q.seat&&near(q.x,s.x)&&near(q.z,s.z)); const {GM,log}=mkGM('xs_dabu',15,THU,5000); const b0=baseSeat; await STORY.onSeat(GM,st.seat);
    if(!(st.label==='坐下試穿'&&J(log.said)===J([['店員',T.tryAsk],[null,T.tryNarr]])&&baseSeat===b0+1)) bad.push(J([s.x,s.z,st.label,log.said])); }
  check('④ 長凳四個位子「坐下試穿」（STORY.onSeat）＝同一段；原本的 onSeat 照舊先叫',!bad.length,bad.join('｜')); });

// ⑤
await asec('⑤',async()=>{ loadZone('xs_dabu');
  for(const [pick,price,flag] of [[0,2800,'bb2800'],[1,3600,'bb3600'],[2,2500,null],[3,1900,null],[4,150,null]]){ enterN++; const {G,GM,log}=mkGM('xs_dabu',15,THU,5000,[pick]); await STORY.interact(btn('cashier'),GM);
    const m=log.menus[0]||[], menuOk=J(m)===J(MENU.dabu.map(([n,p])=>[n+'　'+fmt(p)+' 元',false]).concat([['不用了',false]]));
    check(`⑤ 大步：選單照 AA_620（${MENU.dabu.map(x=>x[1]).join('／')}、不用了）；買第 ${pick+1} 樣＝扣 ${price}、時間 +0.15、「店員把鞋盒裝進紙袋」；SHOES_BB＝${flag}`,
      menuOk&&G.money===5000-price&&near(G.hour,15.15)&&J(log.said.slice(-1))===J([[null,T.dabuBought]])&&(G.flags.SHOES_BB||null)===flag&&!G.flags.OWN_RACKET,J([m,G.money,G.flags,log.said])); }
  /* 店員的話輪流：一次進店一句，下次進店換下一句；同一次進店再按「買東西」不說 */
  enterN++; const {G,GM,log}=mkGM('xs_dabu',15,THU,5000,[]); G.flags.XSS_TALK={dabu:0,haopai:0};
  await STORY.interact(btn('cashier'),GM); await STORY.interact(btn('cashier'),GM); enterN++; GM.enterN=enterN; await STORY.interact(btn('cashier'),GM); enterN++; GM.enterN=enterN; await STORY.interact(btn('cashier'),GM); enterN++; GM.enterN=enterN; await STORY.interact(btn('cashier'),GM);
  check('⑤ 店員的話輪流（一次進店一句；「不用了」不扣錢）',J(log.said.map(s=>s[1]))===J([T.dabuTalk[0],T.dabuTalk[1],T.dabuTalk[2],T.dabuTalk[0]])&&log.said.every(s=>s[0]==='店員')&&G.money===5000&&G.flags.XSS_TALK.dabu===4,J(log.said)); });

// ⑥
await asec('⑥',async()=>{ loadZone('xs_haopai');
  for(const [pick,price,flag] of [[0,1200,'entry'],[1,2800,'mid'],[2,450,null],[3,800,null],[4,2600,null],[5,150,null],[6,120,null]]){ enterN++; const {G,GM,log}=mkGM('xs_haopai',15,THU,5000,[pick]); await STORY.interact(btn('shop'),GM);
    const m=log.menus[0]||[], menuOk=J(m)===J(MENU.haopai.map(([n,p])=>[n+'　'+fmt(p)+' 元',false]).concat([['不用了',false]]));
    const tail=flag?[[null,T.hpBought],['老闆',T.ask]]:[[null,T.hpBought]];
    check(`⑥ 好拍：選單照 AA_620；買第 ${pick+1} 樣＝扣 ${price}、塑膠袋那一句${flag?'、老闆「要穿線嗎？等二十分鐘。」、在等穿線':''}；OWN_RACKET＝${flag}`,
      menuOk&&G.money===5000-price&&near(G.hour,15.15)&&log.said[0][0]==='老闆'&&T.hpTalk.includes(log.said[0][1])&&J(log.said.slice(1))===J(tail)&&(G.flags.OWN_RACKET||null)===flag&&!G.flags.SHOES_BB&&XSSA.waiting(GM)===!!flag,J([m,G.money,G.flags,log.said])); } });

// ⑦
await asec('⑦',async()=>{ const bad=[];
  for(const [zid,kind,pick,money] of [['xs_dabu','cashier',1,3000],['xs_dabu','cashier',2,100],['xs_haopai','shop',0,1000],['xs_haopai','shop',1,2000]]){ loadZone(zid); enterN++;
    const {G,GM,log}=mkGM(zid,15,THU,money,[pick]); await STORY.interact(btn(kind),GM); const m=log.menus[0]||[], items=MENU[zid==='xs_dabu'?'dabu':'haopai'];
    const dimOk=items.every(([n,p],i)=>m[i]&&m[i][1]===(money<p));
    if(!(dimOk&&J(log.toast)===J(['錢不夠'])&&G.money===money&&!G.flags.SHOES_BB&&!G.flags.OWN_RACKET&&log.said.length===1&&G.hour===15&&!XSSA.waiting(GM))) bad.push(J([zid,pick,money,m,log.toast,G.money,log.said])); }
  check('⑦ 錢不夠（兩家）：買不起的選項變灰、按了只出「錢不夠」、不扣錢、不記旗標、時間不動、不說買了那一句',!bad.length,bad.join('｜'));
  loadZone('xs_haopai'); enterN++; const {G,GM,log}=mkGM('xs_haopai',15,THU,200); G.flags.OWN_RACKET='entry'; await STORY.interact(btn('string'),GM);
  check('⑦ 穿線錢不夠（200 元）：老闆那一句、「錢不夠」、不扣錢、不轉暗、時間不動',J(log.said)===J([['老闆',T.string]])&&J(log.toast)===J(['錢不夠'])&&G.money===200&&!log.fade.length&&G.hour===15,J(log)); });

// ⑧
await asec('⑧',async()=>{ loadZone('xs_haopai');
  { enterN++; const {G,GM,log}=mkGM('xs_haopai',15,THU,5000); await STORY.interact(btn('string'),GM);
    check('⑧ 穿線，沒有自己的拍子：老闆「拍子呢？」＋旁白；不扣錢、時間不動',J(log.said)===J([['老闆',T.noRacket],[null,T.noRacketNarr]])&&G.money===5000&&G.hour===15&&!log.fade.length,J(log.said)); }
  { enterN++; const {G,GM,log}=mkGM('xs_haopai',15,THU,5000); G.flags.OWN_RACKET='mid'; await STORY.interact(btn('string'),GM);
    check('⑧ 穿線，有自己的拍子：「穿線三百。等二十分鐘。」、扣 300、轉暗、時間剛好過二十分鐘、門口小板凳那一句',J(log.said)===J([['老闆',T.string],[null,T.stringNarr]])&&G.money===4700&&J(log.fade)===J([true,false])&&J(log.adv)===J([20/60])&&near(G.hour,15+20/60),J(log)); } });

// ⑨
await asec('⑨',async()=>{ loadZone('xs_haopai'); const hi=E.interactables.find(q=>q.seat&&q.label==='坐著等穿線'), ro=E.interactables.find(q=>q.seat&&q.label==='坐一下');
  check('⑨ 好拍的凳子：高腳凳「坐著等穿線」、紅色圓凳「坐一下」',!!hi&&!!ro);
  { enterN++; const {G,GM,log}=mkGM('xs_haopai',15,THU,5000,[0]); await STORY.interact(btn('shop'),GM); const m0=G.money, wait0=XSSA.waiting(GM); log.said.length=0;
    await STORY.onSeat(GM,hi.seat); const wait1=XSSA.waiting(GM), s1=log.said.slice(); log.said.length=0; await STORY.onSeat(GM,hi.seat);
    check('⑨ 高腳凳，在等穿線（剛買了羽球拍）＝穿線那一段（扣 300、轉暗二十分鐘、小板凳那一句）；穿完就不在等，再坐＝沒在等那一句',
      wait0&&J(s1)===J([['老闆',T.string],[null,T.stringNarr]])&&G.money===m0-300&&!wait1&&J(log.said)===J([[null,T.stoolIdle]]),J([wait0,s1,G.money,m0,wait1,log.said])); }
  { enterN++; const {G,GM,log}=mkGM('xs_haopai',15,THU,5000); G.flags.OWN_RACKET='entry'; await STORY.onSeat(GM,hi.seat);
    check('⑨ 高腳凳，沒在等（有拍子也一樣）：「高腳凳有點晃…等人喔？」、不扣錢、時間不動',J(log.said)===J([[null,T.stoolIdle]])&&G.money===5000&&G.hour===15,J(log.said)); }
  { enterN++; const {GM,log}=mkGM('xs_haopai',15,THU,5000,[0]); await STORY.interact(btn('shop'),GM); enterN++; GM.enterN=enterN; log.said.length=0; await STORY.onSeat(GM,hi.seat);
    check('⑨ 買了拍子以後出去再進來＝不在等（這一次進店才算）',J(log.said)===J([[null,T.stoolIdle]]),J(log.said)); }
  { enterN++; const {G,GM,log}=mkGM('xs_haopai',15,THU,5000); await STORY.onSeat(GM,ro.seat);
    check('⑨ 紅色圓凳「坐一下」：那一句',J(log.said)===J([[null,T.round]])&&G.money===5000,J(log.said)); } });

// ⑩
await asec('⑩',async()=>{ const bad=[];
  for(const [zid,hour,day] of [['xs_dabu',10,THU],['xs_dabu',22.5,THU],['xs_haopai',15,SUN],['xs_haopai',11,THU]]){ loadZone(zid);
    for(const it of BTN()){ enterN++; const {G,GM,log}=mkGM(zid,hour,day,5000,[0]); await STORY.interact(it,GM);
      if(!(log.said.length===0&&log.caption.length===1&&log.caption[0]===PLACES.closedText(zid,hour,day)&&G.money===5000)) bad.push(J([zid,hour,it.label,log])); }
    const st=E.interactables.find(q=>q.seat); { const {GM,log}=mkGM(zid,hour,day,5000); await STORY.onSeat(GM,st.seat); if(log.said.length) bad.push(J([zid,'seat',log.said])); } }
  check('⑩ 打烊（大步 10:00、22:30；好拍週日、11:00）：按鈕只寫開放時間、不演、不扣錢；坐下不演',!bad.length,bad.slice(0,3).join('｜')); });

// ⑪
sec('⑪',()=>{ const show=(sha,p)=>{ try{ return cp.execSync(`git show ${sha}:${p}`,{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
  const d698=show('481cf075d','docs/story_planning/AA_698_大步球鞋好拍運動互動點的字.md'), d620=show('bf0efded8','docs/story_planning/AA_620_運動用品店_球鞋_球拍_球衣.md');
  if(!d698||!d620){ check('⑪ git show 481cf075d／bf0efded8 讀得到（git fetch origin claude/magical-albattani-bk7b4n）',false); return; }
  const in698=[...Object.values(T.dabuLook),T.mirror,T.tryNarr,'店員：'+T.tryAsk,T.dabuBought,T.browse,T.hpBought,'老闆：'+T.string,T.stringNarr,'老闆：'+T.noRacket,T.noRacketNarr,T.stoolIdle,T.round];
  const in620=[...T.dabuTalk.map(t=>'「'+t+'」'),...T.hpTalk.map(t=>'「'+t+'」'),'老闆「'+T.ask+'」',T.tryNarr,T.browse,T.stringNarr];
  const m1=in698.filter(t=>!d698.includes(t)), m2=in620.filter(t=>!d620.includes(t));
  check('⑪ 測試裡的句子每一句都在 AA_698（481cf075d）／AA_620（bf0efded8）原稿',!m1.length&&!m2.length,m1.concat(m2).join('｜'));
  const S=XSSA.L, code=[...S.dabu.look.map(o=>o.text),S.dabu.tryAsk,S.dabu.tryNarr,...S.dabu.talk,S.dabu.bought,S.dabu.mirror,S.haopai.browse,...S.haopai.talk,S.haopai.bought,S.haopai.askString,S.haopai.string,S.haopai.stringNarr,S.haopai.noRacket,S.haopai.noRacketNarr,S.haopai.stoolIdle,S.haopai.roundStool];
  const lost=code.filter(t=>!d698.includes(t)&&!d620.includes(t));
  check('⑪ 程式裡（XSSA.L）的每一句都找得到原稿',!lost.length,lost.join('｜'));
  const menu698=d698.split('\n').filter(l=>/菜單/.test(l)).join('\n'), pr=[...MENU.dabu,...MENU.haopai].filter(([n,p])=>!menu698.includes(fmt(p)));
  const sec2=d620.slice(d620.indexOf('## 2.'),d620.indexOf('## 3.')), pr2=[...MENU.dabu,...MENU.haopai].filter(([n,p])=>!sec2.includes(fmt(p)));
  const codeP=J(XSSA.ITEMS.dabu.map(i=>[i.name,i.price]).concat(XSSA.ITEMS.haopai.map(i=>[i.name,i.price])))===J(MENU.dabu.concat(MENU.haopai));
  check('⑪ 價錢：每一樣都在 AA_698 菜單那一行、AA_620 第 2 節；穿線 300＝AA_620「穿線 300」',!pr.length&&!pr2.length&&codeP&&XSSA.STRING_PRICE===300&&sec2.includes('穿線 300'),J([pr,pr2,codeP])); });

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
