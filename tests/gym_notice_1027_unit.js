// GYM-NOTICE-1027（AA_485 第 1 節，企劃線 5aaa71d6a；使用者 2026-10-27「健身房的時間是什麼意思 健身房都不能用?」）——不需要瀏覽器。
//   體能也可能是體育課、系籃、登山、羽球、騎車來的：沒有健身房會員證（gym3d.js 的 G.daily.gym.card）的玩家，朋友只看得到「他最近在動」。
//   1  柏翰（經常鍛鍊）、阿凱（有在運動）、明軒（有在運動）：沒有會員證＝AA 的新句；有會員證＝照舊
//   2  以安、沛珊（有在運動）也一起換：沒有會員證＝新句；有會員證＝照舊
//   3  其他人（語彤、學姊、Alison、方奕廷…）照舊，不分有沒有卡
// AA_497 4-6（企劃線 7a38216ca，NPC-STORY-1028）：明軒當面的三句拿掉「哈哈，」（口氣表：只在訊息裡）——這三項的期望字跟著改。
// 修改前（開發分支 592de7e18）：沒有會員證也說「健身房」那幾句——FAIL。用法：node tests/gym_notice_1027_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(FIT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
load('src/fit3d.js');
const gym=()=>{ H.G.daily=H.G.daily||{}; return H.G.daily.gym=H.G.daily.gym||{}; };
const say=async(id,fit,card)=>{ H.fresh('2026-03-02',10,'campus'); gym().fit=fit; if(card) gym().card=H.G.day-30; await FIT.preTalk(GM,{name:id,charId:id},id); return H.said.map(s=>s.t); };

(async()=>{
  /* 1. LAWWW 列的三位 */
  let L=await say('classmate_bohan',80,false);
  check('1. 柏翰（經常鍛鍊、沒有會員證）：「你運動的時間，比我念刑法的時間多。」「……我要調一下時間表。」',J(L)===J(['你運動的時間，比我念刑法的時間多。','……我要調一下時間表。']),J(L));
  L=await say('classmate_bohan',80,true);
  check('1. 柏翰（經常鍛鍊、有會員證）：照舊「你去健身房的時間，比我念刑法的時間多。」',J(L)===J(['你去健身房的時間，比我念刑法的時間多。','……我要調一下時間表。']),J(L));
  L=await say('classmate_bohan',30,false);
  check('1. 柏翰（有在運動）：照舊「你一週去幾次？……」（沒有講到健身房）',J(L)===J(['你一週去幾次？我在想要不要把運動排進時間表。']),J(L));
  L=await say('kai',30,false);
  check('1. 阿凱（有在運動、沒有會員證）：「你最近一直出門。去運動？好喔。宵夜還是有你的份。」',J(L)===J(['你最近一直出門。去運動？好喔。宵夜還是有你的份。']),J(L));
  L=await say('kai',30,true);
  check('1. 阿凱（有會員證）：照舊「……健身房？好喔。……」',J(L)===J(['你最近一直出門。健身房？好喔。宵夜還是有你的份。']),J(L));
  L=await say('classmate_mingxuan',55,false);
  check('1. 明軒（結實＝一般那一句、沒有會員證）：「最近有在動喔？學校的球場不用錢吧？CP 值最高。」（AA_497 4-6 當面的「哈哈」拿掉）',J(L)===J(['最近有在動喔？學校的球場不用錢吧？CP 值最高。']),J(L));
  L=await say('classmate_mingxuan',30,true);
  check('1. 明軒（有會員證）：照舊「健身房？學校的？學生月票很便宜吧？CP 值很高。」（AA_497 4-6 拿掉「哈哈」）',J(L)===J(['健身房？學校的？學生月票很便宜吧？CP 值很高。']),J(L));
  L=await say('classmate_mingxuan',80,false);
  check('1. 明軒（經常鍛鍊）：照舊「系籃缺人。你不要拒絕。」（AA_497 4-6 拿掉「哈哈」）',J(L)===J(['系籃缺人。你不要拒絕。']),J(L));
  /* 2. AA 另外加的兩位 */
  L=await say('heroine_01',30,false);
  check('2. 以安（沒有會員證）：「你最近走路變快了。……我只是看到了。」',J(L)===J(['你最近走路變快了。……我只是看到了。']),J(L));
  L=await say('heroine_01',30,true);
  check('2. 以安（有會員證）：照舊「你最近下課都往新體育館走。……我只是看到了。」',J(L)===J(['你最近下課都往新體育館走。……我只是看到了。']),J(L));
  L=await say('heroine_01',90,false);
  check('2. 以安（經常鍛鍊）：照舊兩句（搬讀書會的資料）',J(L)===J(['你搬讀書會的資料，一次搬兩箱。','……以前你要搬兩趟。']),J(L));
  L=await say('classmate_peishan',30,false);
  check('2. 沛珊（沒有會員證）：「人為什麼要自己去流汗？我不是質疑，我真的想知道。」',J(L)===J(['人為什麼要自己去流汗？我不是質疑，我真的想知道。']),J(L));
  L=await say('classmate_peishan',30,true);
  check('2. 沛珊（有會員證）：照舊「人為什麼要練肌肉？……」',J(L)===J(['人為什麼要練肌肉？我不是質疑，我真的想知道。']),J(L));
  /* 3. 其他人照舊 */
  for(const [id,f,t] of [['heroine_02',30,'你最近點的都是無糖。……你在練？'],['heroine_05',30,'你運動的時間有排進去。很好。'],['yu',30,'欸你最近有在練喔！！阿哲說他也要去。……他不會去。'],['npc_fangyt',30,'體能好了。下次帶你走比較難的那條。']]){
    const a=await say(id,f,false), b=await say(id,f,true);
    check('3. '+id+'：有沒有會員證都一樣「'+t+'」',J(a)===J([t])&&J(b)===J([t]),J([a,b])); }
  /* 4. 沒有會員證時，「健身房」三個字不會從朋友嘴裡出來（一般、經常鍛鍊都看）*/
  const ids=Object.keys(FIT.NOTICE); let bad=[];
  for(const id of ids) for(const f of [30,80]){ const a=await say(id,f,false); if(a.some(t=>/健身房|新體育館|練肌肉|月票/.test(t))) bad.push(id+'@'+f+':'+a.join('／')); }
  check('4. 沒有會員證：十個人兩個階段都不提健身房、新體育館、練肌肉、月票',!bad.length,J(bad));
  H.done();
})();
