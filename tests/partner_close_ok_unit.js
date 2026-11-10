// 祐廷有女朋友：好朋友以上的人照樣可以單獨吃飯、散步、喝茶（PARTNER-CLOSE-OK-1110，使用者 2026-11-10「已經這麼熟 中午下課卻不能約她吃飯」→ 選擇題「好朋友以上就可以」；修改 AA 10-14 的 ②）——不需要瀏覽器（D131）。
// src/invites3d.js S.partnerBlock：①她自己有伴侶照舊擋；②祐廷有伴侶、她知道＝原本一律擋 → 好朋友（CLOSE_FRIEND）以上不擋。
//   1 和可昕交往、以安知道：以安只是朋友（FRIEND）＝吃飯照舊擋、說「兩個人單獨去吃飯不太好…」
//   2 以安是好朋友（CLOSE_FRIEND）＝吃飯、散步不擋（placeWhy 空的）
//   3 Café、總圖（不是單獨的那幾種）照舊都可以
// 修改前 2 FAIL。用法：node tests/partner_close_ok_unit.js
const H=require('./pg_harness.js'); const {check}=H; const J=JSON.stringify;
const setup=rel=>{ const G=H.fresh('2025-10-23',12,'campus',{dating_kexin:true}); H.FRIEND('heroine_01'); Object.assign(SOCIAL.rel('heroine_01'),rel); return G; };
const knows0=typeof ROM!=='undefined'?ROM.knows:null; if(typeof ROM!=='undefined') ROM.knows=(G,id)=>id==='heroine_01'?['kexin']:[];   /* [前置] 以安知道你和可昕在交往（法律系開場就知道，ROM.knows）*/
const meal=INV.place('noodle'), walk=INV.D?null:null, P=k=>INVITE_DATA.places.find(p=>p.kind===k&&(INVITE_DATA.soloKinds||[]).includes(p.kind));
try{
  { const G=setup({fam:45,trust:30,comf:10,npcRom:0,rom:0}); const w=INV.placeWhy(G,'heroine_01',meal);
    check('1. 朋友（FRIEND）＋你有女朋友、她知道：吃飯照舊擋',SOCIAL.friendLevel('heroine_01')==='FRIEND'&&INV.partnerBlock(G,'heroine_01',meal)===true&&/不太好/.test(w),J({lv:SOCIAL.friendLevel('heroine_01'),w})); }
  { const G=setup({fam:70,trust:55,comf:50,npcRom:20,rom:20}); const wk=P('walk');
    check('2. 好朋友（CLOSE_FRIEND）：吃飯、散步都不擋',SOCIAL.friendLevel('heroine_01')==='CLOSE_FRIEND'&&INV.partnerBlock(G,'heroine_01',meal)===false&&(!wk||INV.partnerBlock(G,'heroine_01',wk)===false)&&!INV.placeWhy(G,'heroine_01',meal),J({lv:SOCIAL.friendLevel('heroine_01'),walk:wk&&wk.id})); }
  { const G=setup({fam:45,trust:30,comf:10}); const cafe=INV.place('cafe');
    check('3. Café 照舊可以（不是單獨的那幾種）',INV.partnerBlock(G,'heroine_01',cafe)===false); }
} finally { if(knows0) ROM.knows=knows0; }
H.done();
