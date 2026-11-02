// AA_579 第 39 列（AA 2026-11-02 09:30）：交往中「手機聯絡人」和「對話框／標題」拆開——contact.DATING＝手機聯絡人、contact.DATING_NAME＝對話框／標題（沒寫＝同 DATING）。
// 修改前（0fcf3561b）：沒有 DATING_NAME、SOCIAL.datingContact → FAIL。用法：node tests/dating_name_split_unit.js
'use strict';
const H=require('./pg_harness.js'); const {check}=H, J=JSON.stringify;
const G=H.fresh('2026-10-14',12,'campus',{CALLED_SHUYU:true}); G.flags.dating_heroine_05=true; SOCIAL.bind(G);
const C=REL_LINES.heroine_05.contact, keep=Object.assign({},C);
try{
  check('0. 現在（AA_579 還沒進）：DATING＝書瑀、沒有 DATING_NAME＝對話框、聯絡人都是書瑀（舊行為不變）',!C.DATING_NAME&&SOCIAL.datingName('heroine_05')==='書瑀'&&SOCIAL.contactName('heroine_05')==='書瑀');
  Object.assign(C,{DATING:'貝貝',DATING_NAME:'溫書瑀'});
  check('1. DATING 貝貝＋DATING_NAME 溫書瑀：手機聯絡人＝貝貝',typeof SOCIAL.datingContact==='function'&&SOCIAL.datingContact('heroine_05')==='貝貝'&&SOCIAL.contactName('heroine_05')==='貝貝',J([SOCIAL.datingContact&&SOCIAL.datingContact('heroine_05'),SOCIAL.contactName('heroine_05')]));
  check('2. 對話框名字（datingName／npcName）＝溫書瑀',SOCIAL.datingName('heroine_05')==='溫書瑀'&&SOCIAL.npcName('heroine_05')==='溫書瑀');
  check('3. 標題（shuyuT）：「打給學姊」→「打給溫書瑀」；「直屬學姊」不換',SOCIAL.shuyuT('打給學姊')==='打給溫書瑀'&&SOCIAL.shuyuT('直屬學姊')==='直屬學姊');
  check('4. 手機私訊的說話人（PHONE.who）＝聯絡人「貝貝」',PHONE.who({from:'heroine_05',name:'溫學姊'})==='貝貝',PHONE.who({from:'heroine_05',name:'溫學姊'}));
  delete G.flags.dating_heroine_05; check('5. 沒交往：都不用交往的叫法',SOCIAL.datingName('heroine_05')===null&&SOCIAL.datingContact('heroine_05')===null);
} finally { for(const k of Object.keys(C)) delete C[k]; Object.assign(C,keep); }
H.done();
