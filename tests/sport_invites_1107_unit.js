// 約她去健身中心、游泳池（GYM-FIT-1107，USER_WANTS X262；台詞 AA_715 2205d6058）——不需要瀏覽器（D131）。
// 使用者 11-07 試玩：「不能約運動健身嗎」
// 檢查：0 匯入一致；1 健身中心要自己辦過會員證才列、游泳池要去過 B1；第四個星期一休館；門檻（健身中心有點熟、游泳池朋友）
//       2 答應句照 AA_715（子晴健身中心 A／R 兩版）；一起的時候、結束照 AA_715、第一次那一句；3 學姊 2026-06-15 以前約游泳池＝婉拒（beforeLearn），之後答應
//       4 一起練完體能 +2（和自己去健身同一套，每週最多 3 次）
// 修改前全部 FAIL。用法：node tests/sport_invites_1107_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
const ok1=loadG('src/data/sport_invite_lines.js',['SPORT_INVITE_LINES']);
CLS.afterSlot=async()=>false;
const P=id=>INV.place(id);
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.visited={}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; INV._now=()=>Date.now()+1e9; return G; };
const npc=id=>{ const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
(async()=>{
  { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_sport_invites.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('0. src/data/sport_invite_lines.js 和 AA_715@2205d6058 一致（import_sport_invites.py --check）',ok1&&ok,out.trim().slice(0,160)); }
  const A=SPORT_INVITE_LINES.people;
  /* 1 */
  { const G=fresh('2025-10-15',10,'campus'); const F=P('gym_fitness'), W=P('gym_pool');
    check('1. 地點：健身中心（有點熟）、游泳池（朋友），都在運動那一類',F&&W&&F.minStage==='FAMILIAR'&&W.minStage==='FRIEND'&&J(INV.catsOf(F))===J(['sport'])&&J(INV.catsOf(W))===J(['sport']));
    check('1. 還沒辦會員證：健身中心不列；沒去過 B1：游泳池不列',!F.show(G)&&!W.show(G));
    G.daily=G.daily||{}; G.daily.gym={card:G.day}; G.visited={gym_b1:1}; check('1. 辦過卡、去過 B1：都列',F.show(G)&&W.show(G));
    let d=G.day; while(!(CALENDAR.dateOf(d).wd===1&&CALENDAR.dateOf(d).d>=22&&CALENDAR.dateOf(d).d<=28)) d++;
    check('1. 第四個星期一休館：約不到；隔天可以',!INV.slotOpen(G,F,d,15)&&INV.slotOpen(G,F,d+1,15),J(CALENDAR.dateOf(d))); }
  /* 2 */
  { const ZQ='heroine_04'; const G=fresh('2025-10-15',10,'campus'); H.FAMILIAR(ZQ); const r=INV.personal(G,ZQ,P('gym_fitness'),G.day+1,15,{res:'accept'});
    check('2. 子晴答應健身中心（有點熟＝A 那一版）：照 AA_715',r&&J(r.lines)===J(A[ZQ].acc.gym_fitness.A),J(r&&r.lines));
    H.FRIEND(ZQ); const r2=INV.personal(G,ZQ,P('gym_fitness'),G.day+1,15,{res:'accept'}); check('2. 朋友以上＝R 那一版',r2&&J(r2.lines)===J(A[ZQ].acc.gym_fitness.R),J(r2&&r2.lines));
    const G2=fresh('2025-10-15',15,'gym_b1'); H.FRIEND(ZQ); H.said=[]; const iv=INV.accept(G2,ZQ,'gym_fitness',G2.day,15,{by:'player'}); await INV.meet(GM,iv,npc(ZQ),{}); const got=H.said.map(s=>s.t), S=A[ZQ].sport.gym_fitness;
    check('2. 一起練：第一次那一句、一起的時候（第一組）、結束都照 AA_715',got.includes(A[ZQ].firstAt.gym_fitness[0])&&S.during[0].every(t=>got.includes(t))&&got.includes(S.end[0]),J(got)); }
  /* 3 */
  { const SIS='heroine_05'; const G=fresh('2026-03-02',10,'campus'); H.CLOSE(SIS); const r=INV.personal(G,SIS,P('gym_pool'),G.day+1,15,{res:'accept'});
    check('3. 學姊 2026-06-15 以前約游泳池：婉拒（AA_715 beforeLearn 的兩句）',r&&r.res==='decline'&&J(r.lines)===J(A[SIS].beforeLearn.gym_pool.decline),J(r));
    const G2=fresh('2026-07-01',10,'campus'); H.CLOSE(SIS); const r2=INV.personal(G2,SIS,P('gym_pool'),G2.day+1,15,{res:'accept'});
    check('3. 學會以後（2026-07）：答應',r2&&r2.res==='accept'&&J(r2.lines)===J(A[SIS].acc.gym_pool),J(r2)); }
  /* 4 */
  { const G=fresh('2025-10-15',15,'gym_b1'); G.daily={gym:{card:G.day,fit:10}}; const id='heroine_01'; H.FRIEND(id);
    for(let i=0;i<4;i++){ const iv=INV.accept(G,id,'gym_fitness',G.day,15,{by:'player'}); await INV.meet(GM,iv,npc(id),{}); G.hour=15; }
    check('4. 一起練完體能 +2、每週最多 3 次（四次＝+6）',G.daily.gym.fit===16,J(G.daily.gym)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
