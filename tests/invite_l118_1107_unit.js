// 118 巷的店也能約（INVITE-PLACES-1107 第二批，USER_WANTS X262；AA_721 b782e2c08）——不需要瀏覽器（D131）。
// 使用者 11-07 試玩：「吃飯餐廳也新增很多了沒有每個放進來」「有的店面都可以約吧」
// 檢查：1 七家店都在（六家吃飯、一一八茶飲在散步）、要自己去過才列；2 營業時間照 lane118_shops（午、晚兩段；公休日灰掉、說週幾休）；
//       3 答應句、第一次一起去那一句照 AA_721；4 可昕不去好家自助餐＝灰掉、說明是她那句；5 吃飯那一場：坐下開場照 AA_649 meal
// 修改前全部 FAIL。用法：node tests/invite_l118_1107_unit.js
{ const fs0=require('fs'), p0=require('path').join(__dirname,'..','src/data/lane118_shops.js'); require('vm').runInThisContext(fs0.readFileSync(p0,'utf8').replace(/^const LANE118_SHOPS\s*=/m,'globalThis.LANE118_SHOPS='),{filename:p0}); }   /* 遊戲裡 lane118_shops.js 在 invites.js 前面載入（店的營業時間）；pg_harness 沒載，先載好 */
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
loadG('src/data/invite_place_lines.js',['INVITE_PLACE_LINES']);
const P=id=>INV.place(id);
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; G.visited={}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; INV._now=()=>Date.now()+1e9; return G; };
/* 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：118 巷九間店改版；AA_772 invite_places、AA_721 @ef7280917）改期望——
   舊期望：七家店（六家吃飯 dian／home／omu／noodle2／korea／self、一一八茶飲 l118_tea 在散步）；滇香週日休、家常菜和蛋包飯週一休、好家自助餐週末休；可昕不去好家自助餐。
   新期望：吃飯類八間（多 l118_tea＝辛亥韓食、l118_cafe2＝大學食堂），散步類兩間外帶飲料店（l118_drink_a、l118_drink_b，區域＝lane118）；118牛排週二休、奈良咖哩週一休、大學食堂週末休、五湖四海每天開；可昕不去大學食堂。*/
const IDS=['l118_dian','l118_self','l118_tea','l118_home','l118_cafe2','l118_korea','l118_omu','l118_noodle2'], WALK=['l118_drink_a','l118_drink_b'];
if(typeof LANE118_LAYOUT==='undefined'){ const fs1=require('fs'), p1=require('path').join(__dirname,'..','src/data/lane118_layout.js'); require('vm').runInThisContext(fs1.readFileSync(p1,'utf8').replace(/^const LANE118_LAYOUT\s*=/m,'globalThis.LANE118_LAYOUT='),{filename:p1}); }
const dayOfWd=(G,wd)=>{ for(let d=G.day;d<G.day+7;d++) if(CALENDAR.dateOf(d).wd%7===wd) return d; return null; };
(async()=>{
  check('1. 十家店都在：八家吃飯、兩間外帶飲料店在散步（區域是 118 巷、見面點在店門口）',IDS.every(k=>P(k))&&IDS.every(k=>J(INV.catsOf(P(k)))===J(['meal']))&&WALK.every(k=>P(k)&&J(INV.catsOf(P(k)))===J(['walk'])&&P(k).zone==='lane118'&&Array.isArray(P(k).meetAt)&&P(k).meetAt.length===3),J(IDS.concat(WALK).map(k=>[k,P(k)&&INV.catsOf(P(k))])));
  { const G=fresh('2025-10-15',10,'lane118'); G.visited=G.visited||{}; delete G.visited.lane118; const a=WALK.map(k=>!!P(k).show(G,'heroine_01')); G.visited.lane118=1; const b=WALK.map(k=>!!P(k).show(G,'heroine_01'));
    check('1. 飲料店：走到過 118 巷才列',a.every(x=>!x)&&b.every(x=>x),J([a,b])); }
  { const G=fresh('2025-10-15',10,'lane118'); const sh=k=>!P(k).show||P(k).show(G,'heroine_01');
    check('1. 還沒自己進去過＝不列；進去過＝列',IDS.every(k=>(delete G.visited[k],!sh(k)))&&(G.visited.l118_dian=1,sh('l118_dian')&&!sh('l118_home'))); }
  { const G=fresh('2025-10-15',10,'lane118'); const mon=dayOfWd(G,1), sun=dayOfWd(G,0), wed=dayOfWd(G,3);
    const o=(k,d,h)=>INV.slotOpen(G,P(k),d,h);
    const tue=dayOfWd(G,2), sat=dayOfWd(G,6);
    check('2. 118牛排（週二休）：週三 12:00、15:00、18:00 可以（2026-11-12 改期望：L118-SHOPS-REDO-1111 以後是一段 11:30～21:30，沒有午休；舊期望 15:00 不行），週二不行',o('l118_dian',wed,12)&&o('l118_dian',wed,18)&&o('l118_dian',wed,15)&&!o('l118_dian',tue,12),J([o('l118_dian',wed,12),o('l118_dian',wed,18),o('l118_dian',wed,15),o('l118_dian',tue,12)]));
    check('2. 奈良咖哩週一休、五湖四海每天開；大學食堂週末休、平日開',!o('l118_omu',mon,12)&&o('l118_home',mon,12)&&o('l118_omu',wed,12)&&!o('l118_cafe2',sat,12)&&!o('l118_cafe2',sun,12)&&o('l118_cafe2',wed,12));
    check('2. 公休日的說明：「奈良咖哩週一休」（店名照資料）',INV.offWhy(G,P('l118_omu'),mon)===P('l118_omu').name+'週一休'&&P('l118_omu').name==='奈良咖哩',INV.offWhy(G,P('l118_omu'),mon)); }
  { const G=fresh('2025-10-20',9,'lane118'), mon=G.day;   /* 2025-10-20 週一（G.weekday 跟著日期，不要直接改 G.day）*/   /* 選時間的選單（今天、明天）：公休日灰掉、寫原因（BB-B 11-07：原本只有「其他日子…」會灰）*/
    const T=INV.timeOptions(G,false,P('l118_omu')), today=T.filter(q=>q.day===mon), tmr=T.filter(q=>q.day===mon+1);
    check('2. 選時間：週一（奈良咖哩公休）今天的時段都灰掉、寫「奈良咖哩週一休」；明天（週二）照常可以選',today.length>0&&today.every(q=>q.dim&&q.hint==='奈良咖哩週一休')&&tmr.length>0&&tmr.every(q=>!q.dim),J(T.map(q=>[q.t,!!q.dim,q.hint||'']))); }
  { const G=fresh('2025-10-15',10,'lane118'); const L=INVITE_PLACE_LINES.places;
    for(const [id,k] of [['heroine_01','l118_omu'],['heroine_03','l118_dian'],['heroine_05','l118_tea']]){ H.FRIEND(id); const d=dayOfWd(G,3); const r=INV.personal(G,id,P(k),d,(INV.catsOf(P(k)).includes('walk')?14:12),{res:'accept'});
      check('3. '+id+' 答應 '+k+'：照 AA_721 的答應句',r&&J(r.lines)===J(L[k][id].acc),J(r&&r.lines));
      const iv=INV.accept(G,id,k,d,(INV.catsOf(P(k)).includes('walk')?14:12),{by:'player'}); check('3. '+id+' 第一次和你去 '+k+'：照 AA_721 的那一句',J(INV.firstAt(G,iv))===J(L[k][id].firstAt),J(INV.firstAt(G,iv))); } }
  { const G=fresh('2025-10-15',10,'lane118'); const w=INV.placeWhy(G,'kexin',P('l118_cafe2'));
    check('4. 可昕不去大學食堂（平日才開、她平日在木柵）：那一格灰掉、說明是她那句（AA_721 no）',w===INVITE_PLACE_LINES.places.l118_cafe2.kexin.no&&!!w,J(w));
    check('4. 別人照常（以安：沒有原因擋）',INV.placeWhy(G,'heroine_01',P('l118_cafe2'))===''||(H.FRIEND('heroine_01'),INV.placeWhy(G,'heroine_01',P('l118_cafe2'))==='')); }
  { const G=fresh('2025-10-15',12,'l118_dian'), id='heroine_02'; H.FRIEND(id); H.said=[]; G.visited.l118_dian=1;
    const iv=INV.accept(G,id,'l118_dian',G.day,12,{by:'player'}); const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n);
    await INV.meet(GM,iv,n,{}); const fa=INVITE_PLACE_LINES.places.l118_dian[id].firstAt;
    check('5. 118牛排（l118_dian）吃飯那一場：第一次那一句有演、時間照 stay、記成吃過飯',fa.every(t=>H.said.some(s=>s.t===t))&&iv.state==='done',J({said:H.said.map(s=>s.t),st:iv.state})); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
