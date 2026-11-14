// 更多可以約的地方（INVITE-PLACES-1107，USER_WANTS X262）——不需要瀏覽器（D131）。
// 使用者 11-07 試玩：「daybreak 不能約?」「社科院圖書館也可以唸書吧」「吃飯餐廳也新增很多了沒有每個放進來」「有的店面都可以約吧 看書或吃飯或聊天 南洋戲院可以約看電影」
// 檢查：1 地點和分類（社科圖念書；Daybreak 照舊吃飯；林家乾麵、小路、大口吃飯；南洋、頁間、山嵐在新的「看電影、逛書店」）；2 要自己走去過才列；
//       3 開放時間（林家乾麵中午、晚上兩段都可以，下午不行；小路晚上）；4 大口漢堡在念書那一類約＝一起念書第 N 場；5 看電影：散場那一句（AA_649 movieEnd）
// 修改前 1～5 FAIL。用法：node tests/invite_places_1107_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
loadG('src/data/study_scenes.js',['STUDY_SCENES']); loadG('src/studyn3d.js',['STUDYN']); const okL=loadG('src/data/invite_place_lines.js',['INVITE_PLACE_LINES']);   /* AA_714（答應句、第一次去）*/
const P=id=>INV.place(id);
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; G.visited={}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; INV._now=()=>Date.now()+1e9; return G; };
(async()=>{
  const want={soclib:['study'],daybreak:['meal'],wz_lin:['meal'],wz_teishoku:['meal'],xs_dakou:['meal'],xs_nanyang:['fun'],bookstore:['fun'],xs_shanlan:['fun']};
  check('1. 地點都在、分類對',Object.entries(want).every(([k,c])=>P(k)&&J(INV.catsOf(P(k)))===J(c)),J(Object.keys(want).map(k=>[k,P(k)&&INV.catsOf(P(k))])));
  check('1. 新的一類「看電影、逛書店」',INV.CATS.some(c=>c.id==='fun'&&c.t==='看電影、逛書店'));
  check('1. 大口、Daybreak 只在吃飯（BB-B 11-07：念書那一類被吃飯的規則擋）',!P('xs_dakou').verbStudy&&!P('daybreak').verbStudy);
  { const G=fresh('2025-10-15',10,'campus'); const sh=k=>!P(k).show||P(k).show(G,'heroine_01');
    check('2. 還沒自己去過：新的地點不列',['soclib','wz_lin','wz_teishoku','xs_dakou','xs_nanyang','bookstore','xs_shanlan'].every(k=>!sh(k)));
    G.visited={soclib:1,xs_nanyang:1}; check('2. 去過以後列',sh('soclib')&&sh('xs_nanyang')&&!sh('xs_shanlan')); }
  { const G=fresh('2025-10-15',10,'campus'); const d=G.day; const wd=CALENDAR.dateOf(d).wd;
    check('3. 林家乾麵（週三）：12:00、15:00、18:00 都可以（2026-11-12 改期望：營業時間併成一段 11:00–21:00；舊期望 15:00 中間休息不行）、22:00 不行',wd!==1&&INV.slotOpen(G,P('wz_lin'),d,12)&&INV.slotOpen(G,P('wz_lin'),d,15)&&INV.slotOpen(G,P('wz_lin'),d,18)&&!INV.slotOpen(G,P('wz_lin'),d,22),J([wd,INV.slotOpen(G,P('wz_lin'),d,12),INV.slotOpen(G,P('wz_lin'),d,15),INV.slotOpen(G,P('wz_lin'),d,18)]));
    check('3. 小路：19:00 可以、12:00 不行',INV.slotOpen(G,P('wz_teishoku'),d,19)&&!INV.slotOpen(G,P('wz_teishoku'),d,12));
    check('3. 南洋早場 09:50 可以（AA_707 芷若第 6 場）',INV.slotOpen(G,P('xs_nanyang'),d,9.83)&&P('xs_nanyang').times.includes(9.83)); }
  { const G=fresh('2025-10-18',10,'cafe'), id='heroine_01'; H.FRIEND(id); H.said=[];
    const iv=INV.accept(G,id,'cafe',G.day,10,{by:'player',cat:'study'}); const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n);
    await INV.meet(GM,iv,n,{}); const S1=STUDY_SCENES.people[id].scenes['1'];
    check('4. 2:30 AM 在念書那一類約：iv.cat study、演一起念書第 1 場',iv.cat==='study'&&H.said.some(s=>s.t===S1.seat[0])&&STUDYN.count(G,id)===1,J(H.said.map(s=>s.t))); }
  { const G=fresh('2025-10-18',14,'xs_nanyang'), id='heroine_02'; H.FRIEND(id); H.said=[];
    const iv=INV.accept(G,id,'xs_nanyang',G.day,14,{by:'player'}); const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n);
    await INV.meet(GM,iv,n,{}); const ME=INVITE_DATA.seatOpen.movieEnd;
    check('5. 看電影：散場那一句（AA_649 movieEnd）、時間過 2 小時、記憶 MOVIE_TOGETHER',ME.some(L=>L.every(t=>H.said.some(s=>s.t===t)))&&G.hour>=16-1e-6&&iv.state==='done',J({said:H.said.map(s=>s.t),h:G.hour})); }
  /* 6 AA_714 答應句、第一次去的那一句 */
  { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_place_acc.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('6. src/data/invite_place_lines.js 和 AA_714@696254f1c、AA_721（118 巷第二批）一致（import_place_acc.py --check）、7＋10 個地點 × 七位（2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：118 巷九間店改版）：AA_721 @ef7280917 118 巷十個位置；舊期望 7＋7＝14）',okL&&ok&&Object.keys(INVITE_PLACE_LINES.places).length===17,out.trim().slice(0,160));
    const G=fresh('2025-10-15',10,'campus'), id='heroine_01'; H.FRIEND(id); const L=INVITE_PLACE_LINES.places.soclib[id];
    const r=INV.personal(G,id,P('soclib'),G.day+1,14,{res:'accept'});
    check('6. 以安答應社科圖：照 AA_714 的答應句',r&&J(r.lines)===J(L.acc),J(r&&r.lines));
    const iv=INV.accept(G,id,'soclib',G.day+1,14,{by:'player'}); check('6. 第一次和她一起去社科圖：firstAt 照 AA_714',J(INV.firstAt(G,iv))===J(L.firstAt),J(INV.firstAt(G,iv))); }
  /* 7 BUG-INV-FUN-AWAY-1107：約的那一天她不在臺北，婉拒的那一句照那一天（不是今天） */
  { const G=fresh('2025-10-15',10,'campus'), id='heroine_01'; H.FRIEND(id); const tom=G.day+1; const pr0=STORY.presence, re0=STORY.reachable, pe0=STORY.present;
    STORY.presence=function(i,o){ return (i===id&&o&&o.day===tom)?{here:false,away:'回台中',kind:'trip',back:tom+1,home:'台中'}:pr0.apply(STORY,arguments); };
    STORY.reachable=function(i,o){ return (i===id&&o&&o.day===tom)?false:(re0?re0.apply(STORY,arguments):true); }; STORY.present=function(i,o){ return (i===id&&o&&o.day===tom)?false:pe0.apply(STORY,arguments); };
    try{ const r=INV.decide(G,id,'xs_nanyang',tom,14); const t=INV.reply(G,id,'xs_nanyang',r);
      check('7. 明天她回台中：婉拒照那一天寫「沈以安回台中，不在臺北。」（不是「這學期不在學校」）',r.res==='decline'&&r.why==='away'&&r.day===tom&&t==='沈以安回台中，不在臺北。',J({r,t})); }
    finally { STORY.presence=pr0; STORY.reachable=re0; STORY.present=pe0; } }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
