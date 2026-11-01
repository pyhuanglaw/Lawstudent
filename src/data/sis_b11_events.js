/* ===== 學姊第十一批：大四下的朋友版——摘要、口試的日子（AA_455，企劃線 2de70709f；D111、USER_WANTS C25）的台詞與事件 =====
   台詞照稿一字不改（D100、D109）。接線在 src/sis_b11_3d.js。 */
'use strict';
const SISB11_LINES={
  /* 11-1 3/20（二）21:00 她私訊（要回）；k＝SIS_ABS_GO：true＝排出遊「法圖 12:30」、false＝不排 */
  absAsk:['明天中午有空嗎。法圖二樓。','我需要一個不是財經法組的人。'],
  absOpts:[{t:'有。',k:true,r:'十二點半。帶筆。'},{t:'明天不行。',k:false,r:'好。那我自己再讀一次。'}],
  /* 11-2 4/27 以前都沒遇到：4/27 21:00 一則（只講資訊，不約）*/
  defDm:'口試日期下來了。五月二十九日，下午四點。',
  /* 11-1 回了「有。」沒到：3/21 13:15 一則（AA_455 3-1 節，企劃線 0c5afca90；不扣關係、之後不再提）*/
  absMiss:'沒看到你。我自己讀完了。',
  /* 11-2 接 5/29：選了「那天我去門口等。」、不在家族群組的，5/28 21:00 */
  m9Dm:'明天四點。……你說要來的。' };

const SISB11_EVENTS=(function(){
  const ID='heroine_05';
  const SIS=t=>({speaker:ID,text:t}), N=t=>({speaker:null,text:t});
  const mem=(tag,rel)=>({mem:[{npc:ID,tag,note:''}],rel:{[ID]:rel}});
  return [
    /* ---------- 11-1 3/21（三）12:30 法圖二樓：摘要（出遊）---------- */
    { id:'ev_sis_abstract', title:'摘要', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'法圖・二樓',bg:'law_library'},
        N('（法圖二樓的長桌。她把兩張紙推過來，一張中文、一張英文。）'),
        SIS('論文的摘要。中文那一張。'),
        SIS('你讀一次。哪裡讀不懂，就畫起來。'),
        N('（你讀到第三行，停了一下。）'),
        {choice:[{text:'「這句太長了。」',goto:'a'},{text:'「財經法的人都這樣寫嗎？」',goto:'b'},{text:'（畫了一個圈，沒有說話）',goto:'c'}]},
        {label:'a'},SIS('（看了一眼）……我寫的時候覺得剛好。'),SIS('好。切成兩句。'),N('（她拿起筆，在中間畫了一個句號。）'),{goto:'e'},
        {label:'b'},SIS('都這樣寫。所以才找你。'),{goto:'e'},
        {label:'c'},N('（她看了那個圈很久，然後把整句劃掉，在旁邊重寫。）'),
        {label:'e'},SIS('好。下禮拜給教授。'),SIS('……謝謝。樓下的自助餐，我請。'),
        N('（樓下的自助餐。她付錢的時候，摘要的資料夾一直夾在手臂下面。）'),   /* AA_470 4-4：說了自助餐我請、沒吃到——結尾那句旁白前加一句 */
        N('（她把兩張紙收進資料夾。資料夾的封面貼著一張便利貼：「5/29」。）'),
        Object.assign({set:{SIS_ABSTRACT:'went'}},mem('SIS_ABSTRACT',{fam:2,comf:2})) ],
      outingMissed:(G,GM,q)=>{ if(G.flags.SIS_ABSTRACT==null) G.flags.SIS_ABSTRACT='missed'; if(q&&typeof PHONE!=='undefined') PHONE.at(G,q.day,13.25,[{th:'p:'+ID,from:ID,text:SISB11_LINES.absMiss}],'sisb11_abs_miss'); } },   /* 回了「有。」沒到：13:15 她一則（AA_455 3-1 節①），不扣關係 */
    /* ---------- 11-2 4/16～4/27 平日 17:00～17:30 總圖門口：五月二十九日（遇到就演，S.tick）---------- */
    { id:'ev_sis_defense_date', title:'五月二十九日', participants:[ID], location:'any', trigger:'manual', once:true, background:'blur',
      dialogue:[ {scene:'總圖・門口',bg:'library_gate_day'},
        N('（總圖門口。她剛從研究小間出來，站在台階上，手機還亮著。）'),
        SIS('（看到你）……剛好。'),
        SIS('口試日期下來了。五月二十九日，下午四點。'),
        {choice:[{text:'「恭喜。」',goto:'a'},{text:'「緊張嗎？」',goto:'b'},{text:'「那天我去門口等。」',goto:'c'}]},
        {label:'a'},SIS('還沒過。恭喜留到那天。'),{set:{SIS_DEF_DATE:'congrats'}},{goto:'m'},
        {label:'b'},SIS('現在不會。前一天晚上會。'),{set:{SIS_DEF_DATE:'nervous'}},{goto:'m'},
        {label:'c'},SIS('……Kevin 一定會叫大家去。你站後面一點就好。'),{set:{SIS_DEF_DATE:'wait'}},   /* wait：不在家族群組的，5/28 21:00 她私訊（src/sis_b11_3d.js S.m9）*/
        {label:'m'},{scene:'椰影大道',bg:'ntu_avenue'},
        N('（你們沿著椰影大道走了一段。路燈一盞一盞亮起來。）'),
        SIS('口試完，就要開始上班了。'),
        SIS('你呢。你那條路，走到哪裡了。'),
        {choice:[{text:'「還在走。」',goto:'p'},{text:'「我不確定是不是對的。」',goto:'q'}]},
        {label:'p'},SIS('嗯。走就好。'),{goto:'e'},
        {label:'q'},SIS('我碩三才確定。……你比我早一年。'),
        {label:'e'},N('（走到校門口，她說她要往捷運站。）'),
        SIS('五月二十九日。……不用帶東西。'),
        mem('SIS_DEFENSE_DATE',{fam:2,comf:3,trust:1}) ] } ];
})();
for(const e of SISB11_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
