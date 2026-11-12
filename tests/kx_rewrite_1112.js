// 2026-11-12（DLG-FULL-REVIEW-1110，使用者 X324「繼續改，從可昕開始」）：對「舊稿／舊 commit」逐字比的測試共用的清單（不是測試本身，檔名沒有 _unit；做法同 tests/peishan_rewrite_1111.js）。
// AA_827_kx_triple_short_2.json@07d50af2f7（可昕第五批：其他檔的三連短句；AA-C 定稿、BB-C 第二意見）手寫檔七列 old→new——tools/story/apply_line_rows.py 套進 src/data/ 五個檔。
// 拿整份資料和舊 commit 逐句比的測試（invites_quote_b6、invites_quote_b7、invite_overlay_1111）、對舊稿逐字比的測試（aa417_sport_invite、bbpack）遇到這七句照新稿算；
// 這七句照稿的逐字比對（稿讀 git show，和下面的 PAIRS 一列對一列）在 tests/kx_triple2_1112_unit.js。movie_plots.js 那一列是產生檔（源稿 AA_745_movie_plots_2.json 改、重匯），不在這裡。
'use strict';
const SHA='07d50af2f7', DOC='docs/story_planning/AA_827_kx_triple_short_2.json';
const PAIRS=[
  ['src/data/events.js','（從後面探頭）412？那我們同一間。我也是晚上。','（從後面探頭）412？那我們同一間，我也是晚上那一班。'],
  ['src/data/invites.js','好。我從山上下來。拍子你負責借。','好，我從山上下來，拍子你負責借。'],
  ['src/data/invites.js','好大。……我會迷路。你走前面。','好大。我一定會迷路，你走前面。'],
  ['src/data/r2y3a_events.js','到了傳給我。……這次有住一晚。很好。','到了傳給我。這次有住一晚，很好。'],
  ['src/data/r2y3a_events.js','聖誕快樂。我還差兩頁。……你們考完了吧。','聖誕快樂。我報告還差兩頁。你們考完了吧？'],
  ['src/data/r2y4a_events.js','……好。今天宵夜我請。不准說不要。','……好。今天宵夜我請，不准說不要。'],
  ['src/data/bbpack_events.js','我來找品妤。……順便找你。順序不要問。','我來找品妤，順便找你。順序不要問。']];
/* a＝舊 commit 的值、b＝現在的值：整句就是某一列的 old→new，或 a 是函式原始碼／一串字、裡面那一句換成新字以後＝b */
const pair=(a,b)=>typeof a==='string'&&typeof b==='string'&&a!==b&&PAIRS.some(([,o,n])=>(a===o&&b===n)||(a.includes(o)&&a.split(o).join(n)===b));
const news=f=>PAIRS.filter(x=>!f||x[0]===f).map(x=>x[2]);
module.exports={SHA,DOC,PAIRS,pair,news};
