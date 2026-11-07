// 更多可以約的地方（INVITE-PLACES-1107，USER_WANTS X262）——不需要瀏覽器（D131）。
// 使用者 11-07 試玩：「daybreak 不能約?」「社科院圖書館也可以唸書吧」「吃飯餐廳也新增很多了沒有每個放進來」「有的店面都可以約吧 看書或吃飯或聊天 南洋戲院可以約看電影」
// 檢查：1 地點和分類（社科圖念書；Daybreak 照舊吃飯；林家乾麵、小路、大口吃飯；南洋、頁間、山嵐在新的「看電影、逛書店」）；2 要自己走去過才列；
//       3 開放時間（林家乾麵中午、晚上兩段都可以，下午不行；小路晚上）；4 大口漢堡在念書那一類約＝一起念書第 N 場；5 看電影：散場那一句（AA_649 movieEnd）
// 修改前 1～5 FAIL。用法：node tests/invite_places_1107_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
loadG('src/data/study_scenes.js',['STUDY_SCENES']); loadG('src/studyn3d.js',['STUDYN']);
const P=id=>INV.place(id);
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; G.visited={}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; INV._now=()=>Date.now()+1e9; return G; };
(async()=>{
  const want={soclib:['study'],daybreak:['meal'],wz_lin:['meal'],wz_teishoku:['meal'],xs_dakou:['meal','study'],xs_nanyang:['fun'],bookstore:['fun'],xs_shanlan:['fun']};
  check('1. 地點都在、分類對',Object.entries(want).every(([k,c])=>P(k)&&J(INV.catsOf(P(k)))===J(c)),J(Object.keys(want).map(k=>[k,P(k)&&INV.catsOf(P(k))])));
  check('1. 新的一類「看電影、逛書店」',INV.CATS.some(c=>c.id==='fun'&&c.t==='看電影、逛書店'));
  check('1. 念書那一類的字：大口「去大口漢堡念書」；Daybreak 照舊只在吃飯（AA_652）',P('xs_dakou').verbStudy==='去大口漢堡念書'&&!P('daybreak').verbStudy);
  { const G=fresh('2025-10-15',10,'campus'); const sh=k=>!P(k).show||P(k).show(G,'heroine_01');
    check('2. 還沒自己去過：新的地點不列',['soclib','wz_lin','wz_teishoku','xs_dakou','xs_nanyang','bookstore','xs_shanlan'].every(k=>!sh(k)));
    G.visited={soclib:1,xs_nanyang:1}; check('2. 去過以後列',sh('soclib')&&sh('xs_nanyang')&&!sh('xs_shanlan')); }
  { const G=fresh('2025-10-15',10,'campus'); const d=G.day; const wd=CALENDAR.dateOf(d).wd;
    check('3. 林家乾麵（週三）：12:00 可以、15:00 不行（中間休息）、18:00 可以（晚上那一段）',wd!==1&&INV.slotOpen(G,P('wz_lin'),d,12)&&!INV.slotOpen(G,P('wz_lin'),d,15)&&INV.slotOpen(G,P('wz_lin'),d,18),J([wd,INV.slotOpen(G,P('wz_lin'),d,12),INV.slotOpen(G,P('wz_lin'),d,15),INV.slotOpen(G,P('wz_lin'),d,18)]));
    check('3. 小路：19:00 可以、12:00 不行',INV.slotOpen(G,P('wz_teishoku'),d,19)&&!INV.slotOpen(G,P('wz_teishoku'),d,12));
    check('3. 南洋早場 09:50 可以（AA_707 芷若第 6 場）',INV.slotOpen(G,P('xs_nanyang'),d,9.83)&&P('xs_nanyang').times.includes(9.83)); }
  { const G=fresh('2025-10-18',10,'xs_dakou'), id='heroine_01'; H.FRIEND(id); H.said=[];
    const iv=INV.accept(G,id,'xs_dakou',G.day,10,{by:'player',cat:'study'}); const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n);
    await INV.meet(GM,iv,n,{}); const S1=STUDY_SCENES.people[id].scenes['1'];
    check('4. 大口漢堡在念書那一類約：iv.cat study、演一起念書第 1 場',iv.cat==='study'&&H.said.some(s=>s.t===S1.seat[0])&&STUDYN.count(G,id)===1,J(H.said.map(s=>s.t))); }
  { const G=fresh('2025-10-18',14,'xs_nanyang'), id='heroine_02'; H.FRIEND(id); H.said=[];
    const iv=INV.accept(G,id,'xs_nanyang',G.day,14,{by:'player'}); const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n);
    await INV.meet(GM,iv,n,{}); const ME=INVITE_DATA.seatOpen.movieEnd;
    check('5. 看電影：散場那一句（AA_649 movieEnd）、時間過 2 小時、記憶 MOVIE_TOGETHER',ME.some(L=>L.every(t=>H.said.some(s=>s.t===t)))&&G.hour>=16-1e-6&&iv.state==='done',J({said:H.said.map(s=>s.t),h:G.hour})); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
