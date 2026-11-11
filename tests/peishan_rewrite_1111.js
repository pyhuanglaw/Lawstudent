// 2026-11-11（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫）：對「舊稿」逐字比的測試共用的跳過清單（不是測試本身，檔名沒有 _unit）。
// AA_755_peishan_feed_misc@c5094495d 把動態牆這八則整則重寫（pic／say／cm／dm、貼文鐘點；id、who、st、日期不動）——
// 對 AA_503～AA_511 舊稿逐字比的測試（aa503_feed、aa504_505_feed、aa506_507_feed、aa508_509_feed、aa510_511_feed）跳過這八則；
// 它們照新稿的逐字比對在 tests/peishan_feed_misc_1111_unit.js 第 2 節（其他貼文照舊對舊稿）。
'use strict';
const FEED={Y1S1:['ps4','ps5','ps6'],Y1S2:['ps1b','ps6b'],Y3S1:['ps4e'],Y3S2:['ps4f'],PG:['ps2i']};
module.exports={FEED,feedSkip:(term,id)=>(FEED[term]||[]).includes(id)};
