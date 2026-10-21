/* ===== 遊戲日曆（2026-10-13）：日期、學期、寒暑假、國定假日 =====
   - 第 1 天＝2025-09-17（週三）（D48；AA_103 第 0 節：祐廷大一＝2025 學年）。日期只在程式內部用，畫面不顯示年份。
   - 學期：**16 週制**（使用者 2026-10-16 21:08 P0、10-17「16周才是對的」；AA_197 1-6、AA_198）：第 1～15 週上課、第 8～9 週期中、第 16 週期末、第 17 週起放假；寒暑假沒有課。
     成績公布＝放假後第 3 個週一（C.gradeDay；AA_197 1-6：114 學年 1/5、6/29）。原本 18 週（AA_104 第 2 節）。
     開學日：114-1＝2025-09-01（AA_104）；其他學期是 LAWWW 暫定（2026-10-13 已請 AA 確認：AA_104 寫的 2026-02-16 是除夕），AA 改了就改這張表。
   - 國定假日：紀念日及節日實施條例（2025 年修正：新增教師節 9/28、臺灣光復暨金門古寧頭大捷紀念日 10/25、行憲紀念日 12/25、除夕前一日）。
     補假：週六放的提前到週五、週日放的延到週一（春節：落在週末的那幾天補在連假之後的上班日；兒童節與清明同一天時前一天放，逢週四改後一天）。
     農曆節日、清明照每年的國曆日期表。需查證：實際以人事行政總處當年度公告為準；彈性放假與補行上班日不做。
   - 校定假日（SCHOOL）：114 學年照 AA_195；115～117 學年照 AA_355 1-4（全校運動會停課；校慶當天照常上課，遊園會在前一個週六）。日期是遊戲裡的設定，不代表真實行事曆。
     颱風假（TYPHOON）：劇情排定的固定日期，當天停課。
   讀的地方：src/data/places.js（法律學院圖書館的開放時間，D53）、課表系統（AA_104：沒有課的日子）。 */
const CALENDAR=(function(){
  const DAY=86400000, DAY1=Date.UTC(2025,8,17);
  const key=t=>new Date(t).toISOString().slice(0,10);
  const parse=s=>{ const [y,m,d]=s.split('-').map(Number); return Date.UTC(y,m-1,d); };
  const wdOf=t=>{ const w=new Date(t).getUTCDay(); return w===0?7:w; };   // 1＝週一 … 7＝週日（遊戲的 G.weekday 週日是 0，其他相同：第 1 天週三＝3；AA_104 的課表 wd 也是 1＝週一）
  // 學期（id、開學日＝那一週的週一、週數）
  /* 經濟系大一（AA_106：2024 學年，Y0S1／Y0S2，開學日需查證台大 113 學年度行事曆）：使用者 2026-10-13（D56）要五年日曆在同一個世界連續運作。
     第 1 天仍是 2025-09-17（法律系的第一天，舊存檔不受影響）；經濟系那一年在第 1 天之前（第 -379 天起），劇情做好之前遊戲不會走到那裡。 */
  const TERMS=[ {id:'Y0S1',start:'2024-09-02',weeks:16}, {id:'Y0S2',start:'2025-02-17',weeks:16},
                {id:'Y1S1',start:'2025-09-01',weeks:16}, {id:'Y1S2',start:'2026-02-23',weeks:16}, {id:'Y2S1',start:'2026-09-07',weeks:16}, {id:'Y2S2',start:'2027-02-22',weeks:16},
                {id:'Y3S1',start:'2027-09-06',weeks:16}, {id:'Y3S2',start:'2028-02-21',weeks:16}, {id:'Y4S1',start:'2028-09-04',weeks:16}, {id:'Y4S2',start:'2029-02-19',weeks:15} ];   /* 大四下 15 週：6/2（六）畢業典禮在第 15 週，第 15 週＝期末考週（5/28～6/1）；第 16 週（6/4 起）不算學期＝畢業後篇（AA_342 C4）*/   /* 16 週制（AA_197 1-6）；大三下開學 2/21（AA_198 第 2 節第 6 點，原本 2/14）*/
  for(const T of TERMS){ T.t0=parse(T.start); T.t1=T.t0+T.weeks*7*DAY; }
  /* 大五上（AA_357 1-1，AA-C 2026-10-21）：只有交換延畢（日本、美國路線）的玩家才有的學期，2029-09-03（一）～12-23（日）16 週。
     不放進 TERMS——termOf、寒暑假、成績公布日、課表都不看它（臺灣路線畢業以後照舊沒有學期）；延畢的玩家用 C.termOfDelayed（日期標籤、今日頁、資料頁的年級）*/
  const TERMS_DELAYED=[{id:'Y5S1',start:'2029-09-03',weeks:16,delayed:true}];
  for(const T of TERMS_DELAYED){ T.t0=parse(T.start); T.t1=T.t0+T.weeks*7*DAY; }
  // 農曆節日（國曆日期）與清明
  /* 2024：經濟系那一年（D56）。放假規則照 2025 年修正後的（平行世界、虛構年份：不還原真實 2024 的放假日，使用者 D56「不需要還原 2011 年的建築、科技或考試制度」的同一個原則；LAWWW 的技術決定）*/
  const LUNAR={ 2024:{cny:'2024-02-10',dragon:'2024-06-10',moon:'2024-09-17',qm:'2024-04-04'}, 2025:{cny:'2025-01-29',dragon:'2025-05-31',moon:'2025-10-06',qm:'2025-04-04'}, 2026:{cny:'2026-02-17',dragon:'2026-06-19',moon:'2026-09-25',qm:'2026-04-05'},
                2027:{cny:'2027-02-06',dragon:'2027-06-09',moon:'2027-09-15',qm:'2027-04-05'}, 2028:{cny:'2028-01-26',dragon:'2028-05-28',moon:'2028-10-03',qm:'2028-04-04'},
                2029:{cny:'2029-02-13',dragon:'2029-06-16',moon:'2029-09-22',qm:'2029-04-04'} };
  const SCHOOL={'2025-11-15':'校慶','2025-11-21':'運動會（停課）','2026-11-20':'運動會（停課）','2027-11-19':'運動會（停課）','2028-11-17':'運動會（停課）'};   // 校定假日（這一天停課）：'YYYY-MM-DD':'名稱'。AA_195 第 1、3 節：114 學年校慶 11/15（六）、全校運動會 11/21（五）停課（臺大焦點新聞；需查證以當年度行事曆為準）
  /* AA_355 1-4（AA-C 2026-10-21，優先度低、沒有劇情綁這幾天；大二起的運動會不另外寫事件）：115 學年（祐廷大二上）校慶 2026-11-15（日）、運動會 2026-11-20（五）；
     116 學年（大三上）校慶 2027-11-15（一）、運動會 2027-11-19（五）；117 學年（大四上）校慶 2028-11-15（三）、運動會 2028-11-17（五）。
     校慶當天照常上課（只有遊園會在前一個週六）＝不放進 SCHOOL（114 學年的校慶是週六，原本就在表上）；運動會那天停課，照 114 學年的做法。停課的那三個週五各少一堂第 11 週的課（通識 ge_y2s1、刑訴 crimpro、刑事判決研討 crim_judgment_sem）*/
  /* 颱風假（BB_110 第 2 節、交付清單 B3，2026-10-14 AA×BB 第 2 級）：遊戲照固定週次安排（真實的颱風假由縣市政府前一晚宣布，需查證）。
     法律系大一上第 7 週週一（憲法（上）那天：T1b 張教授前一晚的信「明日停課」）。當天和國定假日一樣停課（沒有課、上課日程的人不來學校、活動不辦、圖書館照假日），
     整天下雨（story3d.js 的 sleepNow）。大二以後的颱風假（BB_110：大二第 7 週、大三第 6 週、大四第 3 週）劇情交付後再加 */
  const TYPHOON={'2024-09-30':'颱風假','2025-10-13':'颱風假','2026-10-19':'颱風假','2027-10-13':'颱風假','2028-09-18':'颱風假'};   /* 2028-09-18（一）：法律系大四上第 3 週（AA_327 2-Y4-02；T4a 泡麵之夜、T4b 停課的信在 src/r2y4a3d.js）*/   /* 2027-10-13（三）：法律系大三上第 6 週（AA_326 2-Y3-09；T3a、T3b 事件跟著事件包做）*/   /* 2026-10-19（一）：法律系大二上第 7 週（BB_110 T2a、T2b；AA_177 第 2 節）。大三 2027-10-13、大四 2028-09-18 跟各自的颱風事件一起加（CAL-TY-Y2Y3）*/   /* 2024-09-30（一）：經濟系大一上第 5 週（AA_154 1-2；T0a 泡麵之夜、T0b 前一晚的信）*/
  const cache={};
  function holidaysOf(y){ if(cache[y]) return cache[y]; const H={}, L=LUNAR[y]; const add=(t,n)=>{ const k=key(t); if(!H[k]) H[k]=n; };
    const isOff=t=>{ const w=wdOf(t); return w>=6||!!H[key(t)]; };
    const shift=(t,n)=>{ const w=wdOf(t); if(w===6){ let s=t-DAY; while(H[key(s)]) s-=DAY; add(s,n+'（補假）'); } else if(w===7){ let s=t+DAY; while(isOff(s)) s+=DAY; add(s,n+'（補假）'); } };
    const fixed=[[1,1,'開國紀念日'],[2,28,'和平紀念日'],[5,1,'勞動節'],[9,28,'教師節'],[10,10,'國慶日'],[10,25,'臺灣光復節'],[12,25,'行憲紀念日']];
    for(const [m,d,n] of fixed) add(Date.UTC(y,m-1,d),n);
    let spring=[];
    if(L){ const c=parse(L.cny); spring=[[c-2*DAY,'除夕前一日'],[c-DAY,'除夕'],[c,'春節'],[c+DAY,'春節'],[c+2*DAY,'春節']]; for(const [t,n] of spring) add(t,n);
      const kid=Date.UTC(y,3,4), qm=parse(L.qm);
      if(kid===qm){ const w=wdOf(kid); add(w===4?kid+DAY:kid-DAY,'兒童節'); add(qm,'民族掃墓節'); }
      else { add(kid,'兒童節'); add(qm,'民族掃墓節'); }
      add(parse(L.dragon),'端午節'); add(parse(L.moon),'中秋節'); }
    // 補假（先處理一般的，春節最後）
    for(const k of Object.keys(H).sort()){ const t=parse(k); if(spring.some(([s])=>s===t)) continue; if(/補假/.test(H[k])) continue; shift(t,H[k]); }
    if(spring.length){ let last=spring[spring.length-1][0]; for(const [t,n] of spring){ if(wdOf(t)>=6){ let s=last+DAY; while(isOff(s)) s+=DAY; add(s,'春節（補假）'); last=s; } } }
    for(const [k,n] of Object.entries(SCHOOL)) if(k.startsWith(String(y))) H[k]=H[k]||n;
    for(const [k,n] of Object.entries(TYPHOON)) if(k.startsWith(String(y))) H[k]=H[k]||n;
    return cache[y]=H; }
  const C={ TERMS, TERMS_DELAYED, SCHOOL,
    /* 延畢的玩家這一天在不在大五上：{id:'Y5S1', week（1～16）, exam:null（大五上沒有期末考，AA_357 第 4 節）, delayed:true}；不在＝null。要不要用由呼叫的人判斷（STORY.routeAbroadRoute）*/
    termOfDelayed(day){ const t=C.tOf(day); for(const T of TERMS_DELAYED){ if(t>=T.t0&&t<T.t1) return {id:T.id,week:Math.floor((t-T.t0)/(7*DAY))+1,exam:null,delayed:true}; } return null; },
    tOf(day){ return DAY1+((day|0)-1)*DAY; },
    dateOf(day){ const t=C.tOf(day), dt=new Date(t); return {y:dt.getUTCFullYear(),m:dt.getUTCMonth()+1,d:dt.getUTCDate(),wd:wdOf(t),key:key(t)}; },
    holiday(day){ const t=C.tOf(day), y=new Date(t).getUTCFullYear(), k=key(t); return holidaysOf(y)[k]||holidaysOf(y+1)[k]||null; },   /* 隔年元旦落在週六：補假在今年 12/31 */
    holidaysOf,
    typhoon(day){ return !!TYPHOON[C.dateOf(day).key]; },   /* 颱風假那一天（停課、下雨）*/
    /* 這一天在哪個學期：{id, week（1～16）, exam：'mid'（第 8～9 週）｜'final'（第 16 週）｜null}；寒暑假＝null */
    termOf(day){ const t=C.tOf(day); for(const T of TERMS){ if(t>=T.t0&&t<T.t1){ const week=Math.floor((t-T.t0)/(7*DAY))+1; return {id:T.id,week,exam:week>=8&&week<=9?'mid':(week>=T.weeks?'final':null)}; } } return null; },
    /* 學期的天數範圍（第 1 天＝開學週一、最後一天＝第 16 週週日）*/
    termDays(id){ const T=TERMS.find(x=>x.id===id)||TERMS_DELAYED.find(x=>x.id===id); if(!T) return null; const d0=Math.round((T.t0-DAY1)/DAY)+1; return {from:d0,to:d0+T.weeks*7-1}; },
    /* 成績公布日（AA_197 1-6）：放假後第 3 個週一＝第 16 週之後第 3 個週一（114-1＝2026-01-05、114-2＝2026-06-29）*/
    gradeDay(id){ const r=C.termDays(id); return r?r.to+1+14:null; },
    /* 'holiday'（國定、校定假日）／'term'（學期間）／'break'（寒暑假） */
    kind(day){ if(C.holiday(day)) return 'holiday'; return C.termOf(day)?'term':'break'; },
    weekend(day){ return C.dateOf(day).wd>=6; }
  };
  return C;
})();
