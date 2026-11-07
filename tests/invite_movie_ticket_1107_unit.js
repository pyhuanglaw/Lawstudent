// 約看電影要買自己的票（INVITE-PLACES-1107 剩下的一項；LAWWW-B 11-07 定：和自己去南洋戲院一樣，150 元，AA_615 第 3 節）——不需要瀏覽器（D131）。
// 檢查：1 錢夠＝南洋那一格可以約；錢不夠＝灰掉、說「錢不夠買電影票（150 元）」；今天已經買過票＝不擋
//       2 看電影那一場：扣 150 元、記 NY_TICKET＝今天；今天已經買過就不再扣；3 別的地方（吃飯）不扣電影票
// 修改前全部 FAIL。用法：node tests/invite_movie_ticket_1107_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
loadG('src/nanyang_sys3d.js',['NYS']);
const P=id=>INV.place(id);
const fresh=(h,zone)=>{ const G=H.fresh('2025-10-18',h,zone); G.invites=[]; G.stats=G.stats||{}; G.visited={xs_nanyang:1}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; INV._now=()=>Date.now()+1e9; GM.money=d=>{ G.money+=d; }; return G; };
(async()=>{
  { const G=fresh(9,'xinsheng'); H.FRIEND('heroine_02');
    G.money=500; const a=INV.placeWhy(G,'heroine_02',P('xs_nanyang'));
    G.money=100; const b=INV.placeWhy(G,'heroine_02',P('xs_nanyang'));
    G.flags.NY_TICKET=G.day; const c=INV.placeWhy(G,'heroine_02',P('xs_nanyang'));
    check('1. 錢夠可以約；不夠灰掉、說錢不夠；今天買過票不擋',a===''&&b==='錢不夠買電影票（150 元）'&&c==='',J([a,b,c])); }
  { const G=fresh(9.8,'xs_nanyang'), id='heroine_02'; H.FRIEND(id); G.money=500;
    const iv=INV.accept(G,id,'xs_nanyang',G.day,9.83,{by:'player'}); const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n);
    await INV.meet(GM,iv,n,{});
    check('2. 看電影那一場：扣 150 元、記今天的票',G.money===350&&G.flags.NY_TICKET===G.day&&iv.state==='done',J({m:G.money,t:G.flags.NY_TICKET,d:G.day,st:iv.state}));
    const iv2=INV.accept(G,id,'xs_nanyang',G.day,14,{by:'player'}); G.hour=13.9; await INV.meet(GM,iv2,n,{});
    check('2. 今天已經買過票：不再扣',G.money===350,J({m:G.money})); }
  { const G=fresh(11.9,'wz_teishoku'), id='heroine_01'; H.FRIEND(id); G.money=500; G.visited.wz_teishoku=1;
    const iv=INV.accept(G,id,'wz_teishoku',G.day,12,{by:'player'}); const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n);
    await INV.meet(GM,iv,n,{});
    check('3. 吃飯不扣電影票',G.money===500&&G.flags.NY_TICKET==null,J({m:G.money,t:G.flags.NY_TICKET})); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
