/* 自動產生：tools/story/import_tz_invite_supper.py（docs/story_planning/AA_851_tz_invite_supper.json@f6aa917593）。不要手改，改企劃 AA_851 再重新匯入。
   汀州路兩間店可以約人＋泡麵帶回 203 當宵夜（TZ-INVITE-SUPPER-1112；演出 src/tz_invite_supper3d.js）：places＝邀約地點（accept 每人答應一句、
   at_table 每人入座一句，heroine_05_close＝學姊很熟以上或交往中的那一版）；supper＝宿舍那一場（item 哪一樣東西、scene 每一句、minutes 演完時間往後幾分鐘——稿 lawww_1112.h）。字一字照稿。*/
'use strict';
const TZ_INVITE_SUPPER={
 "src": "docs/story_planning/AA_851_tz_invite_supper.json@f6aa917593",
 "places": [
  {
   "id": "tz_yuehaochi",
   "zone": "tz_yuehaochi",
   "name": "越好吃小館",
   "verb": "去越好吃小館吃河粉",
   "kind": "meal",
   "minStage": "FAMILIAR",
   "accept": {
    "heroine_01": "河粉可以。我要雞肉的，湯清一點那種。",
    "heroine_02": "我想喝那裡的咖啡。聽說是用滴的，要等很久。",
    "heroine_03": "秀琴姨說那家的春捲是現包的。我想看他們包。",
    "heroine_04": "有甜的嗎？有的話我去。沒有我也去。",
    "heroine_05": "可以。香菜不要幫我夾。",
    "classmate_peishan": "去！我要坐看得到廚房的位子，我想偷看他們湯怎麼熬。",
    "kexin": "汀州路喔。那你帶路，我只記得那裡有一家書店。"
   },
   "at_table": {
    "heroine_01": "（她把檸檬擠進湯裡，先喝了一口，才動筷子。）",
    "heroine_02": "（咖啡一滴一滴往下掉。她看著杯子，沒有催。）",
    "heroine_03": "（她夾了一點九層塔，聞了一下，又多夾了一些。）",
    "heroine_04": "（她點了煉乳咖啡，喝了一口，眼睛亮了一下。）",
    "heroine_05": "（她把碗裡的香菜一根一根挑出來，放在碗邊的小碟子上。）",
    "classmate_peishan": "（她先喝湯，停了三秒。）牛骨。還有烤過的洋蔥。我回去要跟我爸講。",
    "kexin": "（她把法國麵包撕成兩半，大的那一半給你。）",
    "heroine_05_close": "（她把碗裡的香菜一根一根夾到你碗裡，沒有說話。）"
   }
  },
  {
   "id": "tz_keju",
   "zone": "tz_keju",
   "name": "客居雲南",
   "verb": "去客居雲南吃米線",
   "kind": "meal",
   "minStage": "FAMILIAR",
   "accept": {
    "heroine_01": "過橋米線？我看過影片，料要照順序下。我先查一下順序。",
    "heroine_02": "可以。我不太能吃辣，你幫我問有沒有不辣的。",
    "heroine_03": "我沒吃過雲南菜，想知道跟我想的差多少。",
    "heroine_04": "米線是晚上有開嗎？有開我就去。中午我還沒醒。",
    "heroine_05": "可以。那碗湯很燙，你不要急著喝。",
    "classmate_peishan": "米干！我只在書上看過。走，現在就走。",
    "kexin": "一碗一百六？料那麼多，可以。"
   },
   "at_table": {
    "heroine_01": "（她照著順序，肉片、菜、米線，一樣一樣放進去，放完才抬頭。）",
    "heroine_02": "（她先用湯匙舀了一點湯，吹了很久。）",
    "heroine_03": "（她數了一下那些小碟子。）十一樣。",
    "heroine_04": "（她把鵪鶉蛋留到最後。）",
    "heroine_05": "（她等湯不冒煙了才喝第一口。你已經燙到一次了。）",
    "classmate_peishan": "（米干從她筷子上滑下去三次。她換了湯匙，沒有承認失敗。）",
    "kexin": "（她把小碟子排成一排，照自己想吃的順序。）"
   }
  }
 ],
 "supper": {
  "item": "tz_dn_noodle5",
  "shop": "tz_dongnan",
  "scene": [
   {
    "who": null,
    "text": "（你把那一袋泡麵放在桌上。包裝上的字沒有人看得懂，只看得懂三根辣椒。）"
   },
   {
    "who": "zhe",
    "text": "三根是多辣？"
   },
   {
    "who": "classmate_bohan",
    "text": "煮了就知道。熱水我去裝。"
   },
   {
    "who": "kai",
    "text": "我先講，我只吃半包。"
   },
   {
    "who": null,
    "text": "（十分鐘以後，四個人都在找水喝。阿凱吃了一整包。）"
   },
   {
    "who": "zhe",
    "text": "明天再煮一包。"
   }
  ],
  "minutes": 30
 }
};
if(typeof module!=='undefined') module.exports=TZ_INVITE_SUPPER;
