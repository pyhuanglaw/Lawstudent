/* ===== 公館燒臘過年店休（AA_333，AA-C 56b6f64e；HOL-VA 最後一項 VA-08；AA_683 第 1 節，企劃線 ef5c6c742）=====
   除夕前 6 天到初三店休、初四開門：店休＝[初一−7, 初一+2]（初一照 calendar.js 的 LUNAR；這裡的四年和它一樣，AA_333 第 1 節的表）。法律系那四年（2026～2029）。
   A 店休第一天 21:00 群組（noodle_team）兩則；D 初四 12:00 兩則（不在群組＝沒有）；兩則都照年份（AA_456 1-2；字照 AA_612 A-311、A-312 換成燒臘）。
   AA_685 A2（企劃線 c96613e51，AA-C 定 D109）：A、D 改成阿哲傳（他是燒臘店團揪人的那個；原本 from 語彤），句號照阿哲的寫法拿掉（AA_477 第 3 節：結尾的拿掉、中間的換一個空格、
   接「……」的直接接上；逗號、問號照留）；D「第一碗加蛋」是麵店的說法：2026「阿姨說 今天每盤送一顆滷蛋」、2029「每盤送滷蛋 今年也是」，2027、2028 照字（拿掉句號）。
   B 店休時在店門口按「進入」＝鐵門的旁白、不能進去（店休就是鐵門拉著、沒有人）；那一天在店裡有約（出遊、邀約）＝照常進去（劇情照演）。
   AA_683 第 1 節（舊設定）：原本 B 店裡的那一段（刷椅子腳、兩個選項、2027 約好出去那一版、NOODLE_CLEAN_<年>）和 C（店休期間的邀約排到 18:00 以後、換答應那一句）拿掉；
   舊存檔裡的 NOODLE_CLEAN_<年> 不再讀。台詞照 AA_333 抄、不改字。測試：node tests/noodle_closed_unit.js */
'use strict';
const NOODLE_CLOSED=(function(){
  const CNY={2026:'2026-02-17',2027:'2027-02-06',2028:'2028-01-26',2029:'2029-02-13'};
  const L={ a:{2026:['這週店休，到初三','阿姨說要大掃除 想吃燒臘的，初四以後'],2027:['店休，到初三','阿姨說今年要把招牌擦乾淨 初四見'],2028:['這週店休，初四開','阿姨回老家三天'],2029:['這週店休，到初三','你們今年過年還在臺北嗎']},   /* A、D 照年份（AA_456 1-2，企劃線 71f260ecc：原本四年一字不差；2026 是原句；AA_612 A-311、A-312 換字）；AA_685 A2：阿哲傳、句號照 AA_477 拿掉 */
    door:'（鐵門拉下來一半，門上貼著阿姨寫的紙：「過年休息，初四見。」）',
    d:{2026:['開了','阿姨說 今天每盤送一顆滷蛋'],2027:['開了','招牌真的擦了 很亮'],2028:['開了','阿姨從老家帶了一箱橘子，吃飯送一顆'],2029:['開了','每盤送滷蛋 今年也是']} };   /* AA_685 A2：2026、2029 換字（「第一碗加蛋」是麵店的說法），2027、2028 照字拿掉句號 */
  const S={L,CNY};
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&(G.stage||'law')==='law';
  /* 那一天是不是店休：回傳 {year, from, to, open}（from～to 店休、open＝初四），不是＝null */
  S.window=function(day){ for(const y in CNY){ const c=DK(CNY[y]); if(c==null) continue; if(day>=c-7&&day<=c+2) return {year:+y,from:c-7,to:c+2,open:c+3}; } return null; };
  S.closed=(G,day)=>law(G)&&!!S.window(day==null?G.day:day);
  /* AA_686 第 4 項（企劃線 1df3c189e；72707f636 補新年快樂回覆池；AA-C 定 D109）：「茶屋○○開」照那一年茶屋過年以後第一個開門的日子算，字裡的「初X」跟著換。
     茶屋和燒臘店同一段休息（S.window，AA_685 A4），初四（open）起第一個茶屋有開的日子：places.js wz_teahouse 週一、週二公休——
     2026 初四（2/20 週五）、2027 初四（2/9 週二）公休＝初五（2/10）、2028 初四（1/29 週六）、2029 初四（2/16 週五）。
     S.teaOpen(day)＝day 所在那一段店休以後茶屋第一個開門的日子（day 不在店休裡＝null）；S.chu(d)＝那天是初幾（初一＝CNY；不在初一～初十＝null）；
     S.teaText(t, day)＝只認 TEA_LINES 這兩整句：「初四」換成那一年的「初X」，其他字不動（別的句子原樣回傳）——語彤旅行訊息 shut.back（vac_activities.js，vac3d.js 傳的時候換）、
     手機「新年快樂」語彤 L「初四開店。你要第一個來喝。」（msg2_pool.js 是產生的檔，不改：src/msg3d.js S.msgsOf 傳的時候換）*/
  S.TEA_LINES=['茶屋初四開。蘇姨說第一壺留給你。','初四開店。你要第一個來喝。'];
  const CHU=['一','二','三','四','五','六','七','八','九','十'];
  S.teaOpen=function(day){ const W=day==null?null:S.window(day); if(!W) return null;
    for(let d=W.open;d<W.open+7;d++){ const ws=typeof PLACES!=='undefined'&&PLACES.windowsOf?PLACES.windowsOf('wz_teahouse',d):undefined; if(ws===undefined||(ws&&ws.length)) return d; }   /* undefined＝沒有營業時間表（不看）；null／空＝那天公休 */
    return W.open; };
  S.chu=function(d){ if(d==null) return null; for(const y in CNY){ const c=DK(CNY[y]); if(c==null) continue; const n=d-c; if(n>=0&&n<CHU.length) return '初'+CHU[n]; } return null; };
  S.teaText=function(t,day){ if(typeof t!=='string'||!S.TEA_LINES.includes(t)) return t; const c=S.chu(S.teaOpen(day)); return c?t.replace('初四',c):t; };
  const inGroup=G=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'noodle_team');
  /* 那一天在麵店有約：出遊（地點寫麵店）、答應的邀約（地點是麵店）——劇情照演，門照常開 */
  S.storyDue=function(G){ const OUTS=typeof OUT!=='undefined'&&OUT.rec?OUT.rec(G):[]; if(OUTS.some(q=>q.day===G.day&&q.state==='planned'&&/麵店|燒臘/.test(q.place||'')&&!/麵舖/.test(q.place||''))) return true;
    return (G.invites||[]).some(iv=>iv.day===G.day&&iv.accepted&&!iv.done&&/noodle/.test(iv.place||'')); };
  /* A、D：群組訊息（STORY.PHONE_RULES）*/
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined'||!inGroup(G)) return; const W=S.window(G.day)||S.window(G.day-1)||S.window(G.day-3);
    if(!W) return; const y=W.year, at=(d,x)=>G.day>d||(G.day===d&&G.hour>=x);
    const Y=t=>({th:'g:noodle_team',from:'zhe',text:t});   /* AA_685 A2：阿哲傳（原本 heroine_03）；已經收過的舊存檔照留原本那幾則 */
    if(at(W.from,21)&&G.day<=W.to&&!PHONE.sent(G,'noodle_closed_a_'+y)) PHONE.at(G,W.from,21,(L.a[y]||L.a[2026]).map(Y),'noodle_closed_a_'+y);
    if(at(W.open,12)&&G.day<=W.open+1&&!PHONE.sent(G,'noodle_closed_d_'+y)) PHONE.at(G,W.open,12,(L.d[y]||L.d[2026]).map(Y),'noodle_closed_d_'+y); };   /* tag 照舊（noodle_closed_a_／d_＋年），已經收過的舊存檔不重發 */
  /* B：店門口（story3d.js S.interact 的 exit noodle）。回傳 true＝處理掉了（沒有進去）：鐵門的旁白就好（AA_683 第 1 節）*/
  S.door=async function(GM){ const G=GM.G; if(!S.closed(G)||S.storyDue(G)) return false;
    GM.sceneBegin(); try{ await GM.say(null,L.door); }
    finally{ GM.sceneEnd(); } return true; };
  if(typeof STORY!=='undefined'&&STORY.PHONE_RULES) STORY.PHONE_RULES.push(G=>S.phone(G));
  return S;
})();
