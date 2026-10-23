/* 溫州街三家店：客人的選單與旁白（DL-09；AA-B AA_172，2026-10-16，給 LAWWW-B 直接接）。
   半熟（點餐、看今日推薦）、一盞（喝茶）、阿德影印輸出（印東西、買文具）。做法照麵店：選單是品項＋價錢，選了以後時間往前走，結束時一句旁白。
   - 不扣時段次數（AA_160 2-3：吃飯、買東西都不算）；店名、品項都是虛構（D77）。營業時間在 src/data/places.js（AA_164 1-2）。
   - 打工的玩家（熟練 3 以上）多的那一句、有班那天的黑板：等 DL-10 的打工系統（全域 JOBS.at(G,'brunch'|'print'|'teahouse') → {lv, today, board}）；還沒有 JOBS 時不播。
   - 和人約的早午餐（invites3d.js 的 brunch）不走這裡（AA_172 1-1：約會的台詞之後再寫）。
   存檔：G.daily.wzs＝{printWk, printUsed:[], brunchW, gardenN, tokoN}（影印旁白「同一週不重複」；其餘是輪流的位置）。 */
const WZS=(()=>{
  const S={};
  const T_=G=>typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null;
  const month=G=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).m:10;
  const wd=G=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:((G.weekday|0)||7);   /* 1～7，週日＝7 */
  const hr=G=>G.hour;
  const job=(G,k)=>{ try{ return typeof JOBS!=='undefined'&&JOBS.at?JOBS.at(G,k):null; }catch(e){ return null; } };
  S.rec=G=>{ G.daily=G.daily||{}; const r=G.daily.wzs=G.daily.wzs||{}; if(!Array.isArray(r.printUsed)) r.printUsed=[]; return r; };

  // ---------- 1. 半熟早午餐 ----------
  S.BRUNCH=[['半熟蛋吐司套餐（附沙拉、紅茶）',190,'蛋黃剛好流到吐司邊。你終於知道，三分四十秒是什麼意思。'],
            ['班尼迪克蛋（附紅茶）',260,'醬汁很濃。你把最後一口麵包留下來擦盤子。'],
            ['法式吐司（附熱拿鐵）',220,'甜的。窗外的騎樓有人在排隊，你吃得很慢。']];
  S.BRUNCH_WORK=['小米姐從廚房探頭：「今天的蛋，是我煮的。你煮的話會少十秒。」','小蕙偷偷多放了一顆小番茄。'];
  S.BOARD={2:['今日推薦：半熟蛋吐司。蛋是三分四十秒，不是三分半。'],3:['今日推薦：半熟蛋吐司。蛋是三分四十秒，不是三分半。'],
           4:['今日推薦：班尼迪克蛋。醬是早上現打的。'],5:['今日推薦：班尼迪克蛋。醬是早上現打的。'],
           6:['今日推薦：法式吐司。週末，甜一點也沒關係。'],7:['今日推薦：老闆娘決定。','（下面一行小字：她今天心情很好。）']};
  S.boardLines=G=>{ const j=job(G,'brunch'); if(j&&j.today&&j.board) return [j.board,'這是你早上寫的。字有一點歪。']; return S.BOARD[wd(G)]||S.BOARD[2]; };

  // ---------- 2. 一盞茶屋 ----------
  S.winter=G=>{ const m=month(G); return m===12||m<=2; };
  S.TEA=[['凍頂烏龍（附一碟茶點）',280,1,'第三泡的時候，茶的味道變甜了。蘇姨說，這是茶在說話。'],
         ['東方美人（附一碟茶點）',330,1.5,'茶湯是琥珀色的。你一直等到它涼了一點才喝。'],
         ['焙茶',260,1,'焙過的香味，一進門就聞得到。手是暖的。',G=>S.winter(G)]];   /* 焙茶：冬天（12～2 月）才有 */
  S.teaSeason=G=>{ const m=month(G); return m>=3&&m<=5?'院子的老樟樹在換葉子。新葉是淺綠的，舊葉掉在石板上。':(m>=6&&m<=8?'緣側的風鈴一直在響。蘇姨說，風鈴響，就不用開冷氣。':(m>=9&&m<=11?'竹掃把靠在牆邊。院子裡的落葉，蘇姨說明天再掃。':'下午三點的陽光，剛好照到緣側的坐墊上。你不想起來。')); };
  S.TEA_WORK='蘇姨看了一眼你泡的那一壺。……沒有說話。你知道那是可以的意思。';
  S.teaMenu=G=>S.TEA.filter(t=>!t[4]||t[4](G));
  /* 看院子、看床之間的掛軸（AA_172 2-2，0 分鐘）：院子白天兩句輪流、18:00 以後換石燈籠那一句；掛軸兩句輪流 */
  S.GARDEN=['踏石一塊一塊排到緣側前面。石縫裡的苔很綠，像是有人每天澆水。','杜鵑、小楓樹、一棵老樟樹。院子不大，每一棵都站得剛剛好。','石燈籠亮了。院子裡只剩那一小團光，和老樟樹的影子。'];
  S.TOKONOMA=['掛軸上只有一個字：茶。寫得很慢，最後一筆特別長。','下面的花器插著一枝花，看起來是院子剪的。床之間不放東西，也不坐人。'];
  S.gardenLine=G=>{ if(hr(G)>=18) return S.GARDEN[2]; const r=S.rec(G); r.gardenN=((r.gardenN|0)+1)%2; return S.GARDEN[r.gardenN]; };
  S.tokonomaLine=G=>{ const r=S.rec(G); r.tokoN=((r.tokoN|0)+1)%2; return S.TOKONOMA[r.tokoN]; };

  // ---------- 3. 阿德影印輸出 ----------
  S.printMenu=G=>{ const t=T_(G), out=[['印筆記（黑白，約 30 頁）',30]];
    if(t&&t.week>=6) out.push(['印報告＋釘書（約 40 頁）',50]);   /* 學期中第 6 週以後才有報告 */
    if(t&&((/S1$/.test(t.id)&&t.week>=2&&t.week<=5)||(/S2$/.test(t.id)&&t.week>=10&&t.week<=14))) out.push(['彩色海報（A3）',80]);   /* 社團活動的季節 */
    return out; };
  S.PRINT_LINES=['你印了一份{科目}的整理。紙還是熱的。','影印機吐出最後一張。你把它疊整齊，邊角對好。','阿芃在角落寫功課，抬頭看了你一眼，又低下去。','你印的是{科目}的筆記。第三頁的字太小，你縮放了一次。'];
  S.PRINT_EXAM=['前面排了七個人。大家印的，好像都是同一份考古題。','阿德：「這週大家都在印{科目}。」'];
  S.PRINT_LATE='店裡只剩你和影印機的聲音。阿德在櫃檯後面打了一個哈欠。';   /* 考試週 22:00 以後 */
  S.subject=G=>{ const t=T_(G); if(!t||typeof CLS==='undefined'||!CLS.termCourses) return null; const cs=CLS.termCourses(G,t.id); return cs.length?cs[Math.floor(Math.random()*cs.length)].name:null; };
  /* 印完的旁白：照池輪流，同一週不重複；{科目}＝這學期有修的一門課（隨機）*/
  S.printLine=G=>{ const t=T_(G), r=S.rec(G), sub=S.subject(G), wk=t?t.id+':'+t.week:'break:'+Math.floor(G.day/7);
    if(r.printWk!==wk){ r.printWk=wk; r.printUsed=[]; }
    let pool=t&&t.exam?S.PRINT_EXAM.slice():S.PRINT_LINES.slice(); if(t&&t.exam&&hr(G)>=22) pool.push(S.PRINT_LATE);
    if(!sub) pool=pool.filter(l=>!/\{科目\}/.test(l));
    let cand=pool.filter(l=>!r.printUsed.includes(l)); if(!cand.length){ r.printUsed=r.printUsed.filter(l=>!pool.includes(l)); cand=pool; }
    const l=cand[Math.floor(Math.random()*cand.length)]; r.printUsed.push(l); return l.replace(/\{科目\}/g,sub||''); };
  S.STATIONERY=[['螢光筆（黃）',35,'新的螢光筆。你在想第一個要畫的是哪一條。'],['原子筆（藍、黑兩支）',20,'兩支。一支一定會不見。'],
                ['便利貼',30,'一疊便利貼。你已經想好第一張要寫什麼了。'],['透明資料夾（A4）',15,'你把剛印好的東西放進去。看起來比較像回事了。']];   /* 只是一句旁白，不放進背包 */

  // ---------- 共用：品項＋價錢的選單 ----------
  /* 點完坐下來吃（2026-10-18 使用者：「溫州街店面點餐是站著吃完？」）：找最近的空位（GM.freeSeat），黑幕裡坐好，吃完站起來；已經坐著就不換位子；沒有空位照舊 */
  async function seated(GM,fn){ const E=GM.E, P=E&&E.player; if(!P||P.seat||!GM.sitAt){ await fn(); return; } const pp=P.obj.position; let best=null, bd=1e9;
    for(const s of ((E.zone&&E.zone.seats)||[])){ const f=GM.freeSeat?GM.freeSeat(s):s; if(!f) continue; const d=Math.hypot(f.x-pp.x,f.z-pp.z); if(d<bd){ bd=d; best=f; } }
    if(!best){ await fn(); return; } await GM.fade(true); GM.sitAt(P,best); await GM.fade(false);
    try{ await fn(); } finally { if(GM.standUp) GM.standUp(P); } }
  S._seated=seated;
  async function buy(GM,items,h,after,sit,key){ const G=GM.G; const opts=items.map(it=>({t:it[0]+'　'+it[1]+' 元',dim:G.money<it[1]})); opts.push({t:'不用了'});
    const i=key&&typeof EAT!=='undefined'?await EAT.choose(GM,key,opts,items.map(x=>x[0]),items.map(x=>x[1])):await GM.choose(opts);   /* key：店員認得你、老樣子、吃過的、一起吃（src/eat3d.js，AA_329）*/ if(i>=items.length) return null; const it=items[i]; if(G.money<it[1]){ GM.toast('錢不夠'); return null; }
    GM.money(-it[1]); const hh=typeof h==='function'?h(it):h; const run=async()=>{ if(hh) GM.advance(hh); const tg=key&&typeof EAT!=='undefined'?await EAT.after(GM,key,it[0]):false; if(after&&!tg) await after(it); };   /* 一起吃了＝結尾換一起吃的那一句 */
    if(sit) await seated(GM,run); else await run(); return it; }

  S.interact=async function(GM,it){ const G=GM.G, k=it.wzShop, kind=it.kind; GM.sceneBegin();
    try{
      if(k==='brunch'&&kind==='cashier'){ await buy(GM,S.BRUNCH,40/60,async x=>{ await GM.say(null,x[2]); const j=job(G,'brunch'); if(j&&j.lv>=3){ const r=S.rec(G); r.brunchW=((r.brunchW|0)+1)%S.BRUNCH_WORK.length; await GM.say(null,S.BRUNCH_WORK[r.brunchW]); } },true,'溫州街・半熟'); }
      else if(k==='brunch'&&kind==='chalkboard'){ for(const l of S.boardLines(G)) await GM.say(null,l); }
      else if(k==='teahouse'&&kind==='tea'){ await buy(GM,S.teaMenu(G),x=>x[2],async x=>{ await GM.say(null,x[3]); await GM.say(null,S.teaSeason(G)); const j=job(G,'teahouse'); if(j&&j.lv>=3) await GM.say(null,S.TEA_WORK); },true,'溫州街・一盞'); }
      else if(k==='teahouse'&&kind==='garden'){ await GM.say(null,S.gardenLine(G)); }
      else if(k==='teahouse'&&kind==='tokonoma'){ await GM.say(null,S.tokonomaLine(G)); }
      else if(k==='print'&&kind==='print'){ const j=job(G,'print'); if(j&&j.today&&j.lv!=null&&j.shiftNow){ GM.toast('今天是你的班。'); return; }   /* 他的班剛好是那一天：不能當客人（DL-10 接「上班」）*/
        if(j&&j.lv>=1) await GM.say(null,'阿德：「自己印吧。你知道機器在哪裡。」');
        await buy(GM,S.printMenu(G),1/6,async()=>{ await GM.say(null,S.printLine(G)); },false,'阿德影印輸出'); }
      else if(k==='print'&&kind==='stationery'){ await buy(GM,S.STATIONERY,0,async x=>{ await GM.say(null,x[2]); }); }
    } finally { GM.sceneEnd(); } };
  return S;
})();
