/* 告白的台詞（ROM-1017-L／SYS-02；規則 AA_215 第 1 節（使用者定案）、AA_128 3-1～3-3、AA_126 4-2）。
   流程在 src/date3d.js（DATE.confessOffer）：正式校外約會的結尾、條件到齊（DATE.canConfess）時出現「（告訴她）」；
   **這張表裡沒有她的台詞，就不出現這個選項**——台詞照 AA（以安、語彤）、BB（其他五位）交付的定稿照抄，不在這裡改字、不自己寫。
   每一位：{
     src:'檔案 commit 節',                     // 照抄的來源
     say:[行…],                                // 祐廷開口（或他選的那一句之前的旁白）
     choice:[{t:'選項',say:[行…]}…],           // （可省略）祐廷的說法有選擇時
     yes:[行…],                                // 答應：之後 ROM.start（dating_<id>、交往紀錄）
     notYet:[行…],                             // 還沒：不鎖線，記 notYetFlag；兩週後、再多一次正式約會才會再出現選項
     notYetFlag:'YT_NOT_YET',
     decide:G=>'yes'|'notYet',                 // （可省略）照她的個性和當時的故事決定；沒有＝答應
     preexam:[行…], preexamFlag:'SIS_DECLINED_PREEXAM'   // 只有學姊：研究所筆試以前婉拒（AA_215 第 2 節、BB_122 ★-2）
   }
   行：字串＝她說的；{who:'narr'|'player'|人物 id, text}。 */
'use strict';
const CONFESS_LINES={};
