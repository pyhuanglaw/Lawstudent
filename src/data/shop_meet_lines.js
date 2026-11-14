/* ===== 店員的進門招呼、吃飯時間在店裡遇到同學的第一句（SHOP-LIFE-AA826-1112）——自動產生，不要手改 =====
   來源：企劃線 ed20b301ab 的 docs/story_planning/AA_826_shop_backfill_1.json（AA 定稿 D109；白名單 docs/handoff/story_import_allow.json）。
   產生：python3 tools/shops/import_shop_meet.py（字一字照稿；格式說明在那支工具開頭）。
   流程在 src/shopmeet3d.js；測試 node tests/shop_meet_aa826_1112_unit.js（逐字對稿）。 */
'use strict';
const SHOP_MEET_LINES={
  "staffGreet":{"xs_shanlan":{"who":"店員","lines":["歡迎，慢慢看。","新書在一進門的平台上。","要找書可以問我。"]},"xs_dabu":{"who":"店員","lines":["歡迎。要試穿跟我說尺寸。","新到的在牆上最上面那一排。","可以拿下來看，沒關係。"]},"xs_haopai":{"who":"老闆","lines":["看拍子還是穿線？","穿線今天交、明天拿。","握把布在櫃台這邊。"]},"xs_xsports":{"who":"店員","lines":["歡迎。球在一樓，球衣在二樓。","要試穿，長凳在那邊。","系服要整隊一起訂喔。"]}},
  "mealHello":{"heroine_01":{"base":["你也來吃這家。我剛點，還沒來。","這家我是照評價選的。你呢？"]},"heroine_05":{"base":["吃了沒。這家出餐很快。","一個人？"],"dating":["你吃了沒。","（她把旁邊的椅子拉開一點。）"]},"heroine_03":{"base":["嗯。你也在。","我快吃完了。你慢慢吃。"]},"classmate_peishan":{"base":["欸！你怎麼也在！你點什麼，我看我有沒有點錯。","這家我第三次來了，不要問我為什麼。"]},"classmate_bohan":{"base":["我吃完要回總圖。你剛來？","你也吃這家？我很常來。"]},"classmate_mingxuan":{"base":["欸，一個人喔？","我剛下家教，餓死了。"]},"classmate_xinci":{"base":["你也來了。這家要等一下喔，我等十分鐘了。","我在想要不要外帶回去吃。"]},"zhe":{"base":["欸你也來！我都快吃完了你才來。","我等一下還要去買飲料，你要不要？"]},"yu":{"base":["Hi！你也吃這家！我每次都點一樣的。","我姊說這家不錯，我來驗證。"]},"classmate_youchen":{"base":["欸，你也來。我剛起床，這算早餐。","這間放的歌還可以。你有推薦吃什麼嗎？"]}}
};
SHOP_MEET_LINES._src={"sha":"ed20b301ab","doc":"docs/story_planning/AA_826_shop_backfill_1.json"};
