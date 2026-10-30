/* ===== 學姊第五批：交往中的七夕（三年）（AA_388，企劃線 3a509150；AA-B 2026-10-23 07:0x 定稿；任務 SIS-QIXI-L-1023；使用者 10-21 22:5x「學姊才是真正的女主角」）=====
   台詞照 AA_388 一字不改（SISQX_LINES、SISQX_EVENTS）。手機、出遊、美國路線的當面約、旗標 SIS_QIXI 在 src/sis_qixi3d.js。
   只有交往中、她自己約；出遊系統，不算正式校外約會（不進 dateLog）；回「不行」或沒到都不扣關係（同 AA_386 第 3 節）。
   ev_sis_qixi（不是 once，每年同一個 id；照年份分）：1-1 2026-08-19 19:00 溫州街・定食店　1-2 2027-08-08 20:00 霖澤館・研究室門口
     1-3 2028-08-26 美國路線 09:00 週六市集／其他路線 21:00 視訊（2026 她照作息不在臺北也用這個視訊版，拿掉「我這邊是早上。你那邊是七夕。」）
   ev_sis_qixi_us_ask：1-3 美國路線 8/25（五）晚上當面那一句（auto；條件在 sis_qixi3d.js 的 usAskDue）
   測試：node tests/aa388_sis_qixi_unit.js */
'use strict';
const SISQX_LINES={
  /* 1-1 2026-08-17（一）21:00 私訊（她傳訊息句號、不用貼圖）；回覆三個、她的回話（null＝不回話）*/
  y26Ask:['後天七夕。','我想去溫州街那家定食。七點。'], y26Opts:['好。','妳會過七夕喔？','那天不行。'], y26Re:[null,'不太會。所以今年試試看。','好。'],
  /* 1-2 2027-08-06（五）21:00 私訊 */
  y27Ask:['週日七夕。','我那天在研究室寫到八點。','你可以八點來接我。','晚餐你帶。'], y27Opts:['好，我帶。','要吃什麼？','那天不行。'], y27Re:[null,'你決定。不要太油。','好。那我寫到十點。'],
  /* 1-2 去年沒一起過七夕（SIS_QIXI[2026] 不是 met）：第一句換成這一句（回了以後，後面三則照舊）*/
  y27Last:'七夕。去年你在幹嘛？', y27LastOpts:['不記得了。','妳呢？'], y27LastRe:[null,'讀書。'],
  /* 1-3 美國路線：8/25（五）晚上當面一句 */
  y28Us:'明天早上九點，我在社區門口等你。這邊週六有市集。',   /* AA_479 第 2 點：美國住公寓（宿舍→社區）*/
  /* 1-3 其他路線（視訊）：8/25（五）21:00 訊息；21:30 前沒接 */
  vAsk:'明天你那邊晚上九點，我視訊給你。', vMissed:'你在忙。那我先去圖書館了。' };
const SISQX_EVENTS=(function(){
  const ID='heroine_05', X=()=>typeof SISQX!=='undefined'?SISQX:null;
  const SIS=t=>({speaker:ID,text:t}), N=t=>({speaker:null,text:t}), ME=t=>({speaker:'player',text:t});
  const yr=G=>{ const x=X(); return x?x.yearOf(G):null; };
  const vid=G=>{ const x=X(); return !!x&&x.mode(G,yr(G))==='video'; };
  /* 第 2 節：當面三場照 AA_386 第 3 節的節日（熟悉 +3、自在 +6、她的戀愛 +5；這學期的裂縫 -1 在 sis_qixi3d.js 的 after）；視訊照電話那一場（AA_386 3-6）+2／+3／+3 */
  const VDAY={fam:3,comf:6,npcRom:5}, CALL={fam:2,comf:3,npcRom:3};
  const QIXI=[ {if:{custom:G=>vid(G)},goto:'vd'}, {if:{custom:G=>yr(G)===2027},goto:'y27'}, {if:{custom:G=>yr(G)===2028},goto:'y28'},
    /* ---------- 1-1 2026-08-19（三）19:00 溫州街・定食店（第一次一起過；定食店裡面沒有 2D 底圖：深色底＋地點字幕）---------- */
    {scene:'溫州街・定食店',bg:'dark'},
    N('（店裡只有兩桌客人。她已經坐在靠牆的位子，菜單沒有翻開。）'),
    SIS('這家今天不會客滿。我查過了。'),
    SIS('鯖魚。你呢？'),
    {choice:[{text:'「跟妳一樣。」',goto:'a_same'},{text:'「薑汁燒肉。」',goto:'a_pork'}]},
    {label:'a_same'},SIS('好。兩份鯖魚。'),{goto:'a_mid'},
    {label:'a_pork'},SIS('那我吃你一片。'),
    {label:'a_mid'},N('（吃到一半，她問你暑假在做什麼，你講了，她聽得很認真。）'),
    SIS('我九月開學。研究室的位子已經分好了，靠門。'),
    SIS('……開學以後，平日晚上我大概都在那裡。'),
    {choice:[{text:'「那我去研究室找妳。」',goto:'a_lab'},{text:'「週末呢？」',goto:'a_wk'}]},
    {label:'a_lab'},SIS('七點以後。七點以前我不理人。'),{goto:'a_end'},
    {label:'a_wk'},SIS('週末空著。……先跟你說，免得你自己猜。'),
    {label:'a_end'},N('（巷口的花店門口擺了一排包好的玫瑰。她看了一眼，沒有停。）'),
    {rel:{[ID]:VDAY}},{advance:1},{goto:'end'},   /* 吃一頓、走到巷口：連同出遊的 0.5 小時約 1.5 小時 */
    /* ---------- 1-2 2027-08-08（日）20:00 霖澤館・研究室門口（她在寫論文；台階上吃便當＝霖澤館前的底圖）---------- */
    {label:'y27'},{scene:'法律系館A・研究室門口',bg:'ntu_linze'},
    N('（八點零五分，她從研究室出來，手上拿著一疊印好的稿子。）'),
    SIS('第三節寫完了。……第二節被我刪了一半。'),
    N('（你們坐在法律系館A門口的台階上吃便當。暑假的晚上，校園裡沒什麼人。）'),
    {choice:[{text:'「刪了一半還算寫完嗎？」',goto:'b_half'},{text:'（把她的稿子拿過來看）',goto:'b_read'}]},
    {label:'b_half'},SIS('算。刪掉的那一半本來就不該寫。'),{goto:'b_end'},
    {label:'b_read'},SIS('不要看第七頁。……你已經在看第七頁了。'),
    {label:'b_end'},SIS('明年八月，我就在美國了。'),   /* 事實（AA_379 2-6），不是感傷句；說完就收東西走 */
    N('（她把便當盒蓋起來，收進袋子裡。）'),
    SIS('走吧。我送你到路口。'),
    {rel:{[ID]:VDAY}},{advance:0.5},{goto:'end'},
    /* ---------- 1-3 美國路線 2028-08-26（六）09:00 週六市集（美國篇市集的底圖還沒有＝先用校園底圖，outings3d.js 的 us_farmers_market）---------- */
    {label:'y28'},{scene:'美國・週六市集',bg:'us_farmers_market'},
    N('（週六早上的市集，攤子上堆著桃子和玉米。）'),
    SIS('這邊沒有七夕。'),
    SIS('臺灣那邊快過完了。……我早上算過時差。'),
    N('（她挑了兩顆桃子，捏了一下，放回去一顆。）'),
    {choice:[{text:'「那我們過這邊的。」',goto:'c_here'},{text:'「妳想家嗎？」',goto:'c_home'}]},
    {label:'c_here'},SIS('這邊的七夕是什麼？'),ME('買桃子。'),SIS('……好。那就買桃子。'),{goto:'c_end'},
    {label:'c_home'},SIS('有一點。昨天打給我媽，講了一個小時。'),
    {label:'c_end'},{rel:{[ID]:VDAY}},{advance:1.5},{goto:'end'},
    /* ---------- 1-3 其他路線 2028-08-26 21:00（臺灣）視訊；2026 她不在臺北的視訊版拿掉第一句 ---------- */
    {label:'vd'},{scene:'視訊',bg:'video'},
    {if:{custom:G=>yr(G)===2028},speaker:ID,text:'我這邊是早上。你那邊是七夕。'},
    SIS('我剛起來。頭髮很亂，不要截圖。'),
    {choice:[{text:'（截圖）',goto:'d_shot'},{text:'「妳那邊天氣好嗎？」',goto:'d_sky'}]},
    {label:'d_shot'},SIS('……我說了不要。'),N('（她把鏡頭轉到窗外）'),SIS('好，你截這個。'),{goto:'d_end'},
    {label:'d_sky'},SIS('很好，二十幾度。早上有點涼。'),
    {label:'d_end'},SIS('十二月我就回去了。'),
    N('（她那邊有人在敲門。她說室友要出門，掛掉以前，對著鏡頭揮了一下手。）'),
    {rel:{[ID]:CALL}},
    {label:'end'} ];
  return [
    { id:'ev_sis_qixi', title:'七夕', participants:[ID], location:'any', trigger:'outing', background:'dark', hours:0.5, dialogue:QIXI,
      after:G=>{ const x=X(); if(x) x.after(G); },
      outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.missed(G,q); } },
    /* 1-3 美國路線：8/25（五）17:00 以後，人在美國的公寓、社區、C 棟 208（她宿舍那一戶）＝她當面說這一句，排隔天 09:00 的市集（sis_qixi3d.js usAsked）*/
    { id:'ev_sis_qixi_us_ask', title:'七夕', participants:[ID], location:['us_apartment','us_outside','us_shared'], trigger:'auto', once:true, time:[17,24], background:'blur',
      prereq:{custom:G=>{ const x=X(); return !!x&&x.usAskDue(G); }},
      dialogue:[ SIS(SISQX_LINES.y28Us) ],
      after:G=>{ const x=X(); if(x) x.usAsked(G); } } ];
})();
for(const e of SISQX_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
