// BUG-SIS-DATING-NAME-1023（BB-B 10-23：交往中學姊同一次對話兩個名字——事件寫「書瑀」、閒聊和按鈕寫「溫學姊」）——不需要瀏覽器。
// 規則：AA_386 第 13 行「對話框的名字照 SOCIAL.datingName 顯示『書瑀』」；使用者 10-17「交往那天起叫『書瑀』」。
//   1 SOCIAL.npcName：交往中（叫過書瑀）＝書瑀；沒交往＝照 displayName（溫學姊／溫書瑀）；其他人照 displayName
//   2 事件台詞的說話人（events3d.js）、3D 人物名字與「和○○說話」（game3d.js spawnCharacter、story3d.js 說完話重設）都用 npcName
//   3 同一次對話裡才開始交往：閒聊（SOCIAL.playSteps）、talkCharacter 開頭都重新取名字（BB 10-23 15:46）
// 修改前（開發分支 85ddeeef4）：沒有 SOCIAL.npcName——FAIL。用法：node tests/sis_dating_name_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path');
const {check,GM}=H, SIS='heroine_05';
check('1. SOCIAL.npcName 存在',typeof SOCIAL.npcName==='function');
if(typeof SOCIAL.npcName==='function'){
  const G=H.fresh('2027-03-10',15,'dorm',{EXCHANGE_ROUTE:'TW'}); H.FRIEND(SIS); H.FRIEND('heroine_01');
  const before=SOCIAL.npcName(SIS);
  check('1. 沒交往：照一般的名字（不是書瑀）',before===SOCIAL.displayName(SIS)&&before!=='書瑀',before);
  G.flags.dating_heroine_05=true; G.flags.CALLED_SHUYU=true;
  check('1. 交往中（叫過書瑀）：書瑀',SOCIAL.npcName(SIS)==='書瑀',SOCIAL.npcName(SIS));
  check('1. 其他人照 displayName',SOCIAL.npcName('heroine_01')===SOCIAL.displayName('heroine_01'));
  /* 事件的說話人 */
  H.said=[]; (async()=>{ await EVENTS.runLines([{speaker:SIS,text:'測試'}]);
    check('2. 事件台詞的說話人：交往中＝書瑀',H.said[0]&&H.said[0].who==='書瑀',JSON.stringify(H.said));
    const g3=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'), st=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
    check('2. game3d.js spawnCharacter：「和'+'○○說話」、人物名字用 npcName',/talkLabel:bgOnly\?null:'和'\+SOCIAL\.npcName\(id\)\+'說話'/.test(g3)&&/n\.name=SOCIAL\.npcName\(id\); n\.charId/.test(g3));
    check('2. story3d.js 說完話重設名字用 npcName（不再有 n.name=SOCIAL.displayName）',!/n\.name=SOCIAL\.displayName\(id\)/.test(st)&&(st.match(/n\.name=SOCIAL\.npcName\(id\)/g)||[]).length>=6);
    /* BB 10-23 15:46：同一次對話裡事件中才開始交往，接著的 Café 閒聊（SOCIAL.playSteps，說話人是生成時取名的 3D 人物）還是「溫學姊」*/
    const n={name:'溫學姊',charId:SIS,obj:{position:{x:0,y:0,z:0}}}; H.said=[]; await SOCIAL.playSteps(GM,n,SIS,['這段你幫我看一下，我寫得有點亂。']);
    check('3. 生成時是舊名字的 3D 人物：閒聊（playSteps）照現在的叫法＝書瑀',H.said[0]&&H.said[0].who==='書瑀'&&n.name==='書瑀',JSON.stringify(H.said));
    check('3. story3d.js talkCharacter 一開始先照現在的叫法設名字',/S\.talkCharacter=async function\(id,n\)\{ const G=GM_ref\.G; if\(n&&SOCIAL\.npcName\) n\.name=SOCIAL\.npcName\(id\);/.test(st));
    H.done(); })();
} else H.done();
