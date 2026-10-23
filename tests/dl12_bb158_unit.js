// DL-12 第二批：BB_158（BB 八位約去半熟、一盞的台詞；AA 核對 c640b487）＋AA_172 3b（有伴侶時一盞照「兩個人單獨」擋）。不需要瀏覽器。
// 檢查：芷若、學姊、沛珊、可昕的 A／R 答應台詞；子晴半熟一律改約 Café 下午；阿凱半熟早上改 12:10、12:10 答應；沛珊大二下婉拒；學姊有伴侶時一盞＝partnerTea＋她自己的一句；男生照常；第一次在那裡多說的（firstAt）只說一次；每句 40 字以內。
// 修改前：沒有 brunch／teahouse 的台詞（第 2 項就失敗）。用法：node tests/dl12_bb158_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
const STAGE={};
const MEM=[];
global.SOCIAL={STAGES:['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'],stage:id=>STAGE[id]||'FAMILIAR',friendLevel:id=>STAGE[id]||'FAMILIAR',
  displayName:id=>(CHARACTERS[id]&&(CHARACTERS[id].nickname||CHARACTERS[id].name))||id,remember:(id,tag,note)=>MEM.push([id,tag,note]),memories:id=>MEM.filter(m=>m[0]===id).map(m=>({tag:m[1],note:m[2]})),adjust(){},activity(){},noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true};
global.EVENTS={npcOf:()=>null,onEnter(){},tick(){},habit(){},cond:()=>false};
for(const f of ['src/data/characters.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/story3d.js','src/classes3d.js','src/data/invites.js','src/invites3d.js'])
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|CALENDAR|COURSES|CLS|INVITE_DATA|INV)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const termDay=(id,wk,wd)=>{ for(let d=1;d<1500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===id&&t.week===wk&&CALENDAR.dateOf(d).wd===wd) return d; } return null; };
const mkG=day=>({day,weekday:CALENDAR.dateOf(day).wd%7,hour:8,flags:{afternoonDone:true,classDone:true,metAn:true},social:{},invites:[],contacts:{},weather:'sunny'});
const PD=INVITE_DATA.people;
/* 找一個她（他）有空、答應的時間（照作息），回傳 personal 的結果 */
const tryAt=(id,pid,day,hs)=>{ const G=mkG(day); for(const h of hs){ const r=INV.decide(G,id,pid,day,h); if(r.res==='accept') return {G,h,r:INV.personal(G,id,INV.place(pid),day,h,r)}; } return {G,h:null,r:INV.decide(G,id,pid,day,hs[0])}; };
const SAT=dayOf('2025-10-11'), SUN=dayOf('2025-10-12'), WED=dayOf('2025-10-15'), THU=dayOf('2025-10-16');
const BH=[8,8.5,9,9.5,10,10.5,11,11.5,12,12.25], TH=[12,13,14,15,16,17,18];
const S3SAT=termDay('Y3S2',5,6);   /* 學姊美國改到大四上（AA_260／BB_206），大三下在臺灣 */   /* 學姊的伴侶到大三上第 9 週（characters.js partner）：之後才約得到半熟、一盞；大三下她在美國（SYS-21），用大四上 */
{ let ok=true, info=[];
  for(const [id,band] of [['heroine_02','A'],['heroine_02','R'],['heroine_05','A'],['heroine_05','R'],['classmate_peishan','A'],['classmate_peishan','R'],['kexin','A'],['kexin','R']]){
    STAGE[id]=band==='R'?'FRIEND':'FAMILIAR'; const S6=id==='heroine_05'?S3SAT:SAT, S7=id==='heroine_05'?S3SAT+1:SUN; let x=tryAt(id,'brunch',S6,BH); if(x.h==null) x=tryAt(id,'brunch',S7,BH); const want=PD[id].acc.brunch[band];
    if(!(x.h!=null&&JSON.stringify(x.r.lines)===JSON.stringify(want))){ ok=false; info.push(id+band+':'+JSON.stringify(x.r).slice(0,90)); } }
  check('2. 半熟：芷若、學姊（大三下，伴侶期間以後）、沛珊、可昕答應時說自己的話（有點熟 A、朋友以上 R）',ok,info.join(' | ')); }
{ let ok=true, info=[];
  for(const id of ['heroine_02','heroine_04','heroine_05','classmate_peishan','kexin']){ STAGE[id]='FRIEND'; if(id==='heroine_05'){ const y=tryAt(id,'teahouse',S3SAT-3,TH); if(!(y.h!=null&&JSON.stringify(y.r.lines)===JSON.stringify(PD[id].acc.teahouse.R))){ ok=false; info.push(id+':'+JSON.stringify(y.r).slice(0,90)); } continue; } let x=tryAt(id,'teahouse',WED,TH); if(x.h==null) x=tryAt(id,'teahouse',THU,TH); if(x.h==null) x=tryAt(id,'teahouse',SAT,TH);
    if(!(x.h!=null&&JSON.stringify(x.r.lines)===JSON.stringify(PD[id].acc.teahouse.R))){ ok=false; info.push(id+':'+JSON.stringify(x.r).slice(0,90)); } }
  for(const id of ['kai','classmate_mingxuan','npc_fangyt']){ STAGE[id]='FRIEND'; let x=tryAt(id,'teahouse',WED,TH); if(x.h==null) x=tryAt(id,'teahouse',SAT,TH); if(!(x.h!=null&&JSON.stringify(x.r.lines)===JSON.stringify(PD[id].acc.teahouse.phone||PD[id].acc.teahouse))){   /* 阿凱、明軒有手機／當面兩版（BB_172 10-1 第 17 點）：這裡沒有當面＝手機版 */ ok=false; info.push(id+':'+JSON.stringify(x.r).slice(0,90)); } }
  check('3. 一盞（朋友以上）：八個人都說自己的話',ok,info.join(' | ')); }
{ STAGE.heroine_04='FRIEND'; let ok=true, info=[]; for(const h of [8,10,12.25]){ for(const d of [SAT,SUN]){ const G=mkG(d); const r=INV.personal(G,'heroine_04',INV.place('brunch'),d,h,INV.decide(G,'heroine_04','brunch',d,h)); info.push(r.res+(r.alt?'→'+r.alt.place+'@'+r.alt.h:''));
    if(r.res==='accept'||(r.res==='resched'&&!(r.alt&&r.alt.place==='cafe'&&r.alt.h>=14))||JSON.stringify(r.lines)!=='["「週末早上我在睡覺。……下午的話，Café。」"]') ok=false; } }
  check('4. 子晴的半熟一律婉拒（週末 14:00 才起床）：「週末早上我在睡覺。……下午的話，Café。」，改天指向 Café 下午',ok,info.join(' ')); }
{ STAGE.kai='FRIEND'; const G=mkG(SAT); const r=INV.personal(G,'kai',INV.place('brunch'),SAT,10,INV.decide(G,'kai','brunch',SAT,10));
  const x=tryAt('kai','brunch',SAT,[12+10/60]);
  check('5. 阿凱：半熟早上「早上 不行 我在睡」、改天 12:10；12:10 答應「十二點 好 那是我的早餐」',r.res==='resched'&&r.alt&&Math.abs(r.alt.h-(12+10/60))<1e-6&&r.lines[0]==='「早上 不行 我在睡」'&&x.h!=null&&x.r.lines[0]==='「十二點 好 那是我的早餐」',JSON.stringify([r,x.r]).slice(0,240)); }
{ STAGE.classmate_peishan='FRIEND'; const d=termDay('Y2S2',5,6); const G=mkG(d); const r=INV.personal(G,'classmate_peishan',INV.place('brunch'),d,10,INV.decide(G,'classmate_peishan','brunch',d,10));
  const d2=termDay('Y2S2',5,3); const G2=mkG(d2); const r2=INV.personal(G2,'classmate_peishan',INV.place('teahouse'),d2,14,INV.decide(G2,'classmate_peishan','teahouse',d2,14));
  check('6. 沛珊大二下（消失期）：半熟、一盞都是「沒有回覆」——沒有她的句子（AA_255 (b-1) 第 20 條；原本「我在念書。……考完再去。你先幫我記住菜單。」）',r.res==='decline'&&r2.res==='decline'&&r.why==='away'&&r2.why==='away'&&!r.lines&&!r2.lines,JSON.stringify([r,r2]).slice(0,240)); }
{ STAGE.heroine_05='FRIEND'; STAGE.zhe='FRIEND'; const G=mkG(WED); const T=INV.place('teahouse'), B=INV.place('brunch'), C=INV.place('cafe');
  check('7. 學姊沒有伴侶（使用者 2026-10-17 P0：學姊一開始就沒有男朋友，AA_218 第 16 節、BB_122 ★ 節）：一盞、半熟、Café 都不被「兩個人單獨」擋；男生（阿哲）的一盞照常',
    !INV.partnerBlock(G,'heroine_05',T)&&!INV.partnerBlock(G,'heroine_05',B)&&!INV.partnerBlock(G,'heroine_05',C)&&!INV.partnerBlock(G,'zhe',T));
  { const d=termDay('Y1S2',8,3), G2=mkG(d); STAGE.classmate_peishan='FRIEND';   /* 有伴侶的機制改用沛珊測（大一下第 7 週 4/6 起有伴侶，AA_373 #3；原本用第 3 週）：一盞擋住、說明照 partnerTea */
    check('7. 有伴侶的人（沛珊大一下）約一盞：擋住、說明「兩個人單獨去喝茶不太好。約在 Café 或總圖吧。」；Café 照常',INV.partnerBlock(G2,'classmate_peishan',T)&&INV.placeWhy(G2,'classmate_peishan',T)==='兩個人單獨去喝茶不太好。約在 Café 或總圖吧。'&&!INV.partnerBlock(G2,'classmate_peishan',C),INV.placeWhy(G2,'classmate_peishan',T)); }
  check('7. 學姊自己的一句（partnerSay）：「一盞……那裡太安靜了。Café 可以，帶你的筆記。」；teahouse 在 soloPlaces、kind 還是 reason',JSON.stringify(PD.heroine_05.partnerSay.teahouse)==='["「一盞……那裡太安靜了。Café 可以，帶你的筆記。」"]'&&INVITE_DATA.soloPlaces.includes('teahouse')&&T.kind==='reason'); }
(async()=>{
  { STAGE.heroine_02='FRIEND'; const G=mkG(SAT); G.hour=10; const says=[]; const GM={G,sceneBegin(){},sceneEnd(){},fade:async()=>{},advance(h){ G.hour+=h; },caption(){},say:async(w,t)=>{ says.push((w?'W:':'N:')+t); },autosave(){}};
    const iv1={id:'iv1',who:'heroine_02',place:'brunch',zone:'wz_brunch',day:SAT,h:10,state:'going'}; G.invites.push(iv1); await INV.meet(GM,iv1,null); const s1=says.splice(0);
    const iv2={id:'iv2',who:'heroine_02',place:'brunch',zone:'wz_brunch',day:SAT+7,h:10,state:'going'}; G.invites.push(iv2); await INV.meet(GM,iv2,null); const s2=says.splice(0);
    check('8. 第一次和芷若去半熟：見面以後多「（她點完餐，看了開放廚房很久。）」＋她的一句；第二次不再說',s1.includes('N:（她點完餐，看了開放廚房很久。）')&&s1.includes('W:「她煎蛋的時候都不講話欸，好專心。」')&&s1.includes('W:「我拉花的時候也是，被叫一下就歪掉。」')/* BB_172 Z7 */&&!s2.some(t=>/開放廚房|拉花/.test(t)),JSON.stringify([s1,s2]).slice(0,300)); }
  { const L=[]; const walk=v=>{ if(typeof v==='string') L.push(v); else if(Array.isArray(v)) v.forEach(walk); else if(v&&typeof v==='object') Object.values(v).forEach(walk); };
    for(const id of ['heroine_02','heroine_04','heroine_05','classmate_peishan','kexin','kai','classmate_mingxuan','npc_fangyt']){ const p=PD[id]; for(const k of ['brunch','teahouse']){ walk(p.acc&&p.acc[k]); walk(p.firstAt&&p.firstAt[k]); } walk(p.partnerSay); }
    const long=L.filter(t=>t.replace(/^[「（]|[」）]$/g,'').length>40); check('9. BB_158 的每一句都在 40 字以內（共 '+L.length+' 句）',L.length>=30&&!long.length,long.join(' / ')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
