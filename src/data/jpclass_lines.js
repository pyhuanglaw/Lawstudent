/* ===== 日文班群組：采蓁、宇恆的回聲（AA_521 第 4 節，企劃線 0f4b48f20；AA-C 定稿 D109；任務 NPC-STORY2-1028、USER_WANTS X119）的台詞 =====
   台詞照稿一字不差。CANON-NO-ECON-1112 第四批（AA-C 18:37 裁定：AA_521 第 4 節是法律系那幾年的內容、大二日文班的同學，要留）：
   原本和 AA_521 其他節放在同一個檔（第三批整個拿掉），這裡只把第 4 節原樣搬回來（cfc0fd04bf 那一版的 jp、vetPhoto、vetThanks）。接線在 src/jpclass3d.js（JPCLASS）。
   ■ jp（日文班 g:jp_class 三則）：{id（也是 PHONE 的 tag）, at:臺灣時間, src, t:[[人物 id, 名字, 一句], …]}；4-3 另有 jpOnly、until、opts。
   測試：node tests/jpclass_1112_unit.js */
'use strict';
const JPCLASS_LINES={
  /* ---------- 第 4 節 日文班：采蓁、宇恆的回聲（g:jp_class；在日文班群組裡的才收到）---------- */
  jp:[
    {id:'jpc_vet_level2',at:'2027-10-26 21:30',src:'AA_521 4-1',t:[['jp_caizhen','采蓁','我修了日文中級！'],['jp_caizhen','采蓁','今天實習，有一隻柴犬的主人是日本人。'],['jp_caizhen','采蓁','他講的我聽懂一半。'],['jp_caizhen','采蓁','另一半是狗在叫。']]},
    {id:'jpc_korean',at:'2027-12-07 21:30',src:'AA_521 4-2',t:[['jp_yuheng','宇恆','我在學韓文了。'],['jp_yuheng','宇恆','韓文的子音跟電路一樣，有規則。'],['jp_yuheng','宇恆','日文班的群組可以發韓文嗎？'],['jp_caizhen','采蓁','不行。']]},
    /* 4-3：只有日本路線、人在日本（臺灣 21:00＝日本 22:00）；回覆期限 4/20 21:00（臺灣），記 CZ_VET_PHOTO */
    {id:'jpc_vet_ask',at:'2028-04-18 21:00',src:'AA_521 4-3',jpOnly:true,until:'2028-04-20 21:00',
      t:[['jp_caizhen','采蓁','你在日本嗎？'],['jp_caizhen','采蓁','可以幫我看一下那邊的動物醫院長怎樣嗎？'],['jp_caizhen','采蓁','拍門口就好！']],
      opts:[{t:'好。',r:[],set:{CZ_VET_PHOTO:'yes'}},{t:'這週沒空。',r:[['jp_caizhen','采蓁','好，不急！']],set:{CZ_VET_PHOTO:'no'}}]} ],
  /* 4-3 回「好。」：4/22（六）白天在鎮上，旁白一句（日本的摘要一列 JP.SCH，當地時間）；當晚 21:00（臺灣）采蓁兩則 */
  vetPhoto:{k:'cz_vet_photo',d:'2028-04-22',h:11,t:'（你拍了一間動物醫院的門口。門口的貓在睡覺。）'},
  vetThanks:{id:'jpc_vet_thanks',at:'2028-04-22 21:00',src:'AA_521 4-3',t:[['jp_caizhen','采蓁','牠好胖！'],['jp_caizhen','采蓁','謝謝！']]}
};
