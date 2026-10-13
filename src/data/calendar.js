/* ===== 遊戲日曆（2026-10-13）：日期、學期、寒暑假、國定假日 =====
   - 第 1 天＝2025-09-17（週三）（D48；AA_103 第 0 節：祐廷大一＝2025 學年）。日期只在程式內部用，畫面不顯示年份。
   - 學期（AA_104 第 2 節）：每學期 18 週（第 8～9 週期中、第 17～18 週期末）；寒暑假沒有課。
     開學日：114-1＝2025-09-01（AA_104）；其他學期是 LAWWW 暫定（2026-10-13 已請 AA 確認：AA_104 寫的 2026-02-16 是除夕），AA 改了就改這張表。
   - 國定假日：紀念日及節日實施條例（2025 年修正：新增教師節 9/28、臺灣光復暨金門古寧頭大捷紀念日 10/25、行憲紀念日 12/25、除夕前一日）。
     補假：週六放的提前到週五、週日放的延到週一（春節：落在週末的那幾天補在連假之後的上班日；兒童節與清明同一天時前一天放，逢週四改後一天）。
     農曆節日、清明照每年的國曆日期表。需查證：實際以人事行政總處當年度公告為準；彈性放假與補行上班日不做。
   - 校定假日：等 AA 給清單（SCHOOL），沒有就不放。
   讀的地方：src/data/places.js（法律學院圖書館的開放時間，D53）、課表系統（AA_104：沒有課的日子）。 */
const CALENDAR=(function(){
  const DAY=86400000, DAY1=Date.UTC(2025,8,17);
  const key=t=>new Date(t).toISOString().slice(0,10);
  const parse=s=>{ const [y,m,d]=s.split('-').map(Number); return Date.UTC(y,m-1,d); };
  const wdOf=t=>{ const w=new Date(t).getUTCDay(); return w===0?7:w; };   // 1＝週一 … 7＝週日（遊戲的 G.weekday 週日是 0，其他相同：第 1 天週三＝3；AA_104 的課表 wd 也是 1＝週一）
  // 學期（id、開學日＝那一週的週一、週數）
  const TERMS=[ {id:'Y1S1',start:'2025-09-01',weeks:18}, {id:'Y1S2',start:'2026-02-23',weeks:18}, {id:'Y2S1',start:'2026-09-07',weeks:18}, {id:'Y2S2',start:'2027-02-22',weeks:18},
                {id:'Y3S1',start:'2027-09-06',weeks:18}, {id:'Y3S2',start:'2028-02-14',weeks:18}, {id:'Y4S1',start:'2028-09-04',weeks:18}, {id:'Y4S2',start:'2029-02-19',weeks:18} ];
  for(const T of TERMS){ T.t0=parse(T.start); T.t1=T.t0+T.weeks*7*DAY; }
  // 農曆節日（國曆日期）與清明
  const LUNAR={ 2025:{cny:'2025-01-29',dragon:'2025-05-31',moon:'2025-10-06',qm:'2025-04-04'}, 2026:{cny:'2026-02-17',dragon:'2026-06-19',moon:'2026-09-25',qm:'2026-04-05'},
                2027:{cny:'2027-02-06',dragon:'2027-06-09',moon:'2027-09-15',qm:'2027-04-05'}, 2028:{cny:'2028-01-26',dragon:'2028-05-28',moon:'2028-10-03',qm:'2028-04-04'},
                2029:{cny:'2029-02-13',dragon:'2029-06-16',moon:'2029-09-22',qm:'2029-04-04'} };
  const SCHOOL={};   // 校定假日：'YYYY-MM-DD':'名稱'（等 AA）
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
    return cache[y]=H; }
  const C={ TERMS, SCHOOL,
    tOf(day){ return DAY1+((day|0)-1)*DAY; },
    dateOf(day){ const t=C.tOf(day), dt=new Date(t); return {y:dt.getUTCFullYear(),m:dt.getUTCMonth()+1,d:dt.getUTCDate(),wd:wdOf(t),key:key(t)}; },
    holiday(day){ const t=C.tOf(day), y=new Date(t).getUTCFullYear(), k=key(t); return holidaysOf(y)[k]||holidaysOf(y+1)[k]||null; },   /* 隔年元旦落在週六：補假在今年 12/31 */
    holidaysOf,
    /* 這一天在哪個學期：{id, week（1～18）, exam：'mid'｜'final'｜null}；寒暑假＝null */
    termOf(day){ const t=C.tOf(day); for(const T of TERMS){ if(t>=T.t0&&t<T.t1){ const week=Math.floor((t-T.t0)/(7*DAY))+1; return {id:T.id,week,exam:week>=8&&week<=9?'mid':(week>=17?'final':null)}; } } return null; },
    /* 'holiday'（國定、校定假日）／'term'（學期間）／'break'（寒暑假） */
    kind(day){ if(C.holiday(day)) return 'holiday'; return C.termOf(day)?'term':'break'; },
    weekend(day){ return C.dateOf(day).wd>=6; }
  };
  return C;
})();
