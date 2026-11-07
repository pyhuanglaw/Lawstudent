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
const IDS=['l118_dian','l118_home','l118_omu','l118_noodle2','l118_korea','l118_self','l118_tea'];
const dayOfWd=(G,wd)=>{ for(let d=G.day;d<G.day+7;d++) if(CALENDAR.dateOf(d).wd%7===wd) return d; return null; };
(async()=>{
  check('1. 七家店都在：六家吃飯、一一八茶飲在散步',IDS.every(k=>P(k))&&IDS.slice(0,6).every(k=>J(INV.catsOf(P(k)))===J(['meal']))&&J(INV.catsOf(P('l118_tea')))===J(['walk']),J(IDS.map(k=>[k,P(k)&&INV.catsOf(P(k))])));
  { const G=fresh('2025-10-15',10,'lane118'); const sh=k=>!P(k).show||P(k).show(G,'heroine_01');
    check('1. 還沒自己進去過＝不列；進去過＝列',IDS.every(k=>!sh(k))&&(G.visited.l118_dian=1,sh('l118_dian')&&!sh('l118_home'))); }
  { const G=fresh('2025-10-15',10,'lane118'); const mon=dayOfWd(G,1), sun=dayOfWd(G,0), wed=dayOfWd(G,3);
    const o=(k,d,h)=>INV.slotOpen(G,P(k),d,h);
    check('2. 滇香（週日休）：週三 12:00、18:00 可以，15:00 不行（午休），週日不行',o('l118_dian',wed,12)&&o('l118_dian',wed,18)&&!o('l118_dian',wed,15)&&!o('l118_dian',sun,12),J([o('l118_dian',wed,12),o('l118_dian',wed,18),o('l118_dian',wed,15),o('l118_dian',sun,12)]));
    check('2. 巷口家常菜、蛋包飯研究所週一休；好家自助餐週末休',!o('l118_home',mon,12)&&!o('l118_omu',mon,12)&&o('l118_home',wed,12)&&!o('l118_self',dayOfWd(G,6),12)&&o('l118_self',wed,12));
    check('2. 公休日的說明：「巷口家常菜週一休」',INV.offWhy(G,P('l118_home'),mon)==='巷口家常菜週一休',INV.offWhy(G,P('l118_home'),mon)); }
  { const G=fresh('2025-10-15',10,'lane118'); const L=INVITE_PLACE_LINES.places;
    for(const [id,k] of [['heroine_01','l118_omu'],['heroine_03','l118_dian'],['heroine_05','l118_tea']]){ H.FRIEND(id); const d=dayOfWd(G,3); const r=INV.personal(G,id,P(k),d,k==='l118_tea'?14:12,{res:'accept'});
      check('3. '+id+' 答應 '+k+'：照 AA_721 的答應句',r&&J(r.lines)===J(L[k][id].acc),J(r&&r.lines));
      const iv=INV.accept(G,id,k,d,k==='l118_tea'?14:12,{by:'player'}); check('3. '+id+' 第一次和你去 '+k+'：照 AA_721 的那一句',J(INV.firstAt(G,iv))===J(L[k][id].firstAt),J(INV.firstAt(G,iv))); } }
  { const G=fresh('2025-10-15',10,'lane118'); const w=INV.placeWhy(G,'kexin',P('l118_self'));
    check('4. 可昕不去好家自助餐：那一格灰掉、說明是她那句（AA_721 no）',w===INVITE_PLACE_LINES.places.l118_self.kexin.no&&!!w,J(w));
    check('4. 別人照常（以安：沒有原因擋）',INV.placeWhy(G,'heroine_01',P('l118_self'))===''||(H.FRIEND('heroine_01'),INV.placeWhy(G,'heroine_01',P('l118_self'))==='')); }
  { const G=fresh('2025-10-15',12,'l118_dian'), id='heroine_02'; H.FRIEND(id); H.said=[]; G.visited.l118_dian=1;
    const iv=INV.accept(G,id,'l118_dian',G.day,12,{by:'player'}); const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n);
    await INV.meet(GM,iv,n,{}); const fa=INVITE_PLACE_LINES.places.l118_dian[id].firstAt;
    check('5. 滇香吃飯那一場：第一次那一句有演、時間照 stay、記成吃過飯',fa.every(t=>H.said.some(s=>s.t===t))&&iv.state==='done',J({said:H.said.map(s=>s.t),st:iv.state})); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
