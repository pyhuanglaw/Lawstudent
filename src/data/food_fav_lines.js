/* ===== 她們各自喜歡吃的東西（FOOD-FAV-1023；使用者 2026-10-23 選擇題選 C）：台詞照抄劇情總監 AA 的定稿 AA_410（企劃線 86016b84「AA_410_女主角各自喜歡吃的東西.md」），一字不改。
   程式在 src/foodfav3d.js（FAV）。說話的人：人物 id、null＝旁白、其他字串＝那個名字（老闆娘）。
   note＝筆記本那一行（第 1 節總表最後一欄）；know＝第一次知道（第 2 節）；right＝選對；itemOnly＝只點品項、小選項選另一個；wrong[品項]＝點錯（'*'＝不管點了哪一樣）。
   稿裡沒有的組合寫 null（程式不說話，回報給 AA 補）：子晴點錯熱可可、紅茶；可昕點錯紅茶、冬瓜檸檬；可昕已經知道以後又帶有糖的青茶。
   語彤「只點」那一行稿上是「……嗯，謝謝。（她跟老闆娘要了一小碟辣椒。）」——括號裡是旁白，拆成她一句＋一句旁白（字照抄）。 */
'use strict';
const FOOD_FAV_LINES={
 src:'AA_410（企劃線 86016b84）',
 note:{
  heroine_01:'以安：咖哩蛋包飯。她只吃得下半份，多要一個盤子。',
  heroine_02:'芷若：熱可可，加一份濃縮。',
  heroine_03:'語彤：滇香的酸辣河粉，多加辣。看不出來。',
  heroine_04:'子晴：美式，冰的。十二月也是。',
  heroine_05:'學姊：無糖綠茶，去冰。從來沒換過。',
  classmate_peishan:'沛珊：番茄醬蛋包飯。她每次都點一樣的。',
  kexin:'可昕：青茶，無糖。她只喝無糖的。'
 },
 heroine_01:{
  right:[['heroine_01','……你記得。'],['heroine_01','那這一半給你。不准說吃不下。']],
  rightDating:[[null,'（她把一半撥到空盤子上，推過來的時候，順手把湯匙也放好。）']],
  itemOnly:[['heroine_01','（看了一下盤子）……我吃不完。你要幫我吃。']],
  wrong:{'番茄醬蛋包飯':[['heroine_01','番茄醬的。……好，我吃吃看。']]}
 },
 heroine_03:{
  know:[['老闆娘','那個社會系的妹妹，每次都叫我多放辣。'],['老闆娘','看不出來吧。']],
  right:[['heroine_03','……嗯。'],['heroine_03','我們家的不敢做這麼辣。阿姨說客人會跑掉。']],
  itemOnly:[['heroine_03','……嗯，謝謝。'],[null,'（她跟老闆娘要了一小碟辣椒。）']],
  wrong:{'*':[['heroine_03','謝謝。……我吃這個也可以。']]}
 },
 heroine_04:{
  know:[[null,'（外面很冷。她的美式裡還是一大堆冰塊。）']],
  right:[['heroine_04','你知道喔。'],['heroine_04','……十二月也是冰的。不要問。']],
  itemOnly:[['heroine_04','熱的？……好啦。我等它涼。']],
  wrong:{'拿鐵':[['heroine_04','拿鐵？……好啦，我也喝。']],'熱可可':null,'紅茶':null}
 },
 heroine_05:{
  right:[['heroine_05','……誰跟你說的。'],['heroine_05','她記性比我好。……謝謝。']],
  rightAgain:[['heroine_05','又是她說的。'],['heroine_05','……好。下次換我。']],   /* 演過 AA_284 2-3 第 5 段（她已經說過「誰跟你說的」）*/
  itemOnly:[['heroine_05','謝謝。……冰塊我等一下倒掉。']],
  wrong:{'*':[['heroine_05','謝謝。我喝。']]}
 },
 classmate_peishan:{
  right:[['classmate_peishan','你幫我點好了？'],['classmate_peishan','……番茄醬的。嗯。不要笑。']],
  wrong:{'咖哩蛋包飯':[['classmate_peishan','咖哩的？……好，今天換一次。'],['classmate_peishan','（吃了兩口）……下次還是番茄醬。']]}
 },
 kexin:{
  know:[['kexin','……有糖。'],['kexin','我只喝無糖的。你下次記得。']],
  right:[['kexin','無糖。……你記得。'],['kexin','我以為你只記得考試的東西。']],
  itemOnly:null,
  wrong:{'珍珠奶茶':[['kexin','珍奶。……你是故意的吧。'],[null,'（她還是插了吸管。）']],'紅茶':null,'冬瓜檸檬':null}
 }
};
if(typeof module!=='undefined') module.exports=FOOD_FAV_LINES;
