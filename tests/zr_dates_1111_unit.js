// 芷若校外約會台詞重寫（DLG-FULL-REVIEW-1110；使用者 X324「就是要像人在說話」；2026-11-11）——不需要瀏覽器（D131）。
//   約會源稿 date_system/lines/D01～D33.json（白名單現在的版本；同一版帶語彤 D15 一句、可昕 D09／D17／D33 三句）；改稿紀錄 date_rewrite/zr_D01～D33.json；
//   AA_773_zr_date_common.json（不分地點的短句 11 列）、AA_774_zr_wish.json（D05 心願事件 27 列）。
//   **SHA 都在 tests/date_src_sha.js**（AA 再給新 SHA 只改那一處；這支裡的數字都是「至少多少」，不寫死格數）。
//   1. 白名單；import_date_lines.py 重匯（--out）一樣；修正層跳過的芷若的列；別人跳過的列數照舊；沒有「原句還在」的列
//   2. 芷若 33 個地點的格子和源稿一字不差；改稿紀錄每一格都在
//   3. 別人的格子、預約句、交通偏好和重匯以前（BASE）完全一樣——只多那四句；源稿和上一版逐格比也只多那四句
//   4. 選項換字：拿選項的字當 key 的地方（PICK_FLAG、REMEMBER_IF、LINE_IF、ARRIVE_VAR、aa524_3d.js、請客選項）都對得上；換掉的舊句不在 src 的程式裡
//   5. 那四句進了、舊字不在
//   6. AA_773（11 列，照 path）：lines.heroine_02 九列＋date3d.js 兩列；transport 那一句只在她想搭的車被改成開車時播
//   7. AA_774（27 列，照 path）：date_wish.js 的 events.heroine_02；她主動約的那一場＝週六 14:30 出發、D05 光典（「兩點半，光典門口」對得上）
//   8. D13「記 TASTE」那幾格照留、旁白格
// 稿、BASE 讀 git show；讀不到（淺層複本）＝不比稿，只驗結構。用法：node tests/zr_dates_1111_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), os=require('os'), vm=require('vm');
const C=require('./date_src_sha.js');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const ZQ='heroine_04';   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0）：子晴的格子、短句、心願事件之後也重寫了（tests/zq_dates_1111_unit.js 另外驗）——這支裡比「別人零差異」的地方把子晴也拿掉；同一版芷若 D10 小吃攤一句再換一次字（date_src_sha.js 的 ALSO_ZQ），芷若的格子照白名單現在的版本對 */
const ZR='heroine_02', KX='kexin', YT='heroine_03', SIS='heroine_05', PS='classmate_peishan', SHA=C.ALLOW_SHA, PREV=C.ZR_PREV, BASE='2e1644aa3', SP='docs/story_planning/';
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
const read=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const load=f=>{ let src=read(f); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
load('src/data/date_wish.js'); load('src/wish3d.js');
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const DW=t=>JSON.parse(t.slice(t.indexOf('const DATE_WISH=')+16,t.lastIndexOf(';')));
const LOCS=Array.from({length:33},(_,k)=>'D'+String(k+1).padStart(2,'0'));
const leaves=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>leaves(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) leaves(x[k],p+'/'+k,o); else o[p]=x; return o; };
const of=(D,k,who)=>{ const o={}; for(const part of ['lines','likes','dislikeLine']) if(D[part]&&D[part][who]!=null) leaves(D[part][who],part,o); return o; };
/* 2026-11-11（AA_812@f1fab0ec6）：懸著的「下次我請」七格（date_src_sha.js 的 CELLS_812：學姊、子晴 D06.cafe remember，沛珊 D15.store、D21.street，可昕 D15 收尾，子晴 D06 第一次選項的回覆，語彤 D10.boat remember）
   是匯入工具最後一步疊上去的（改稿紀錄 date_rewrite/ 和稿的 path_rows；源稿 Dxx.json 沒有重新 apply）——這支的逐字對稿、和重匯以前比，NOW 先用 un812 把那七格還原成舊字再比
   （只有那一格現在剛好是新字才還原，不是＝照舊會紅）；那七格現在＝新字下面另外驗（逐格、她請客在 tests/date_she_pays_812_1111_unit.js）。舊期望：直接拿 NOW 比 */
const NOW812=DL(read('src/data/date_lines.js')), NOW=C.un812(NOW812);
check('0. AA_812 那七格（CELLS_812）現在是新字（還原成舊字以後才拿 NOW 和源稿、重匯以前比）',C.CELLS_812.length===7&&C.CELLS_812.every(r=>C.cell812(NOW812,r)===r.new&&C.cell812(NOW,r)===r.old),JSON.stringify(C.CELLS_812.map(r=>C.cell812(NOW812,r))));
const SRC={}, OLDSRC={}, REC={}; for(const k of LOCS){ const t=show(SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'), r=show(SHA,SP+'date_rewrite/zr_'+k+'.json'); if(t) SRC[k]=C.src248(k,JSON.parse(t));   /* 52c3ee258 起源稿有 fx：只比字（date_src_sha.js noFx） */ if(u) OLDSRC[k]=JSON.parse(u); if(r) REC[k]=JSON.parse(r); }   /* 2026-11-12（X324 可昕續改，AA_819＋AA_822@07d50af2f7）：源稿可昕 72 格換了新字——src248 把那 72 格還原再比（date_src_sha.js KX_1112；逐格在 tests/kx_dates_1112_unit.js）。舊寫法：C.noFx(JSON.parse(t)) */
const haveSrc=Object.keys(SRC).length===33&&Object.keys(OLDSRC).length===33&&Object.keys(REC).length===33;
const ob=show(BASE,'src/data/date_lines.js'), WAS=ob?DL(ob):null;
/* 那四句：Dxx.json 裡的位置 → 遊戲檔的 of() 路徑（lines/…）、整份 leaves 的路徑（/loc/Dxx/lines/誰/…）*/
const ALSO=C.ALSO.map(a=>Object.assign({},a,{p:a.path.replace(/^lines\//,'lines/'),full:'/loc/'+a.loc+'/lines/'+a.who+'/'+a.path.replace(/^lines\//,''),srcp:'/lines/'+a.who+'/'+a.path.replace(/^lines\//,'')}));
{ const ch=GM.choose; let n=0; GM.choose=async o=>{ if(++n>150) throw new Error('選單一直重來：'+J(o.map(x=>x.t||x.text))); return ch(o); }; GM._reset=()=>{ n=0; }; }
GM.money=d=>{ H.G.money+=d; };
const setup=(key,h,flags)=>{ const G=H.fresh(key,h,'dorm',flags||{}); G.outings=[]; G.contacts=G.contacts||{}; G.money=50000; GM._reset(); return G; };
const know=id=>{ H.CLOSE(id); H.G.contacts[id]=1; };

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
    const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&[PREV,'0a2136911','82c946ad7','2883197b6'].every(s=>(e[0].history||[]).some(h=>h.sha===s))); });
    check('1. 白名單 D01～D33 都是 '+SHA+'、approved，前四版（可昕 '+PREV+'、語彤 0a2136911、學姊 82c946ad7、沛珊 2883197b6）留在 history',bad.length===0,J(bad));
    const e3=allow.filter(x=>x.path===SP+'AA_773_zr_date_common.json'), e4=allow.filter(x=>x.path===SP+'AA_774_zr_wish.json');
    check('1. 白名單 AA_773_zr_date_common.json@'+C.ZR_COMMON_SHA+'、AA_774_zr_wish.json@'+C.ZR_WISH_SHA+' 各一筆、approved；date_lines.js 的來源寫著 33 個地點 @'+SHA+' 和 AA_773',e3.length===1&&e3[0].sha===C.ZR_COMMON_SHA&&e3[0].status==='approved'&&e4.length===1&&e4[0].sha===C.ZR_WISH_SHA&&e4[0].status==='approved'&&LOCS.every(k=>NOW.source.includes(k+'.json@'+SHA))&&NOW.source.includes('AA_773_zr_date_common.json@'+C.ZR_COMMON_SHA));
    console.log(haveSrc&&WAS?'（稿和 BASE 都讀得到：逐字比對）':'（這份 checkout 讀不到企劃線的稿或 BASE：不比稿，只驗結構）');
    if(haveSrc){ const tmp=path.join(os.tmpdir(),'date_lines_zr1111_'+process.pid+'.js'); let out='', ok=false;
      try{ out=cp.execFileSync('python3',['tools/date/import_date_lines.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<26}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_lines.js'); }catch(e){ out=String(e.stderr||e.stdout||e.message).slice(0,600); }
      try{ fs.unlinkSync(tmp); }catch(e){}
      check('1. tools/date/import_date_lines.py 重匯（--out 另存）的結果和 src/data/date_lines.js 一樣（沒有「原句還在源稿裡」停下來的列）',ok&&!/原句還在源稿裡/.test(out),ok?'':out.slice(0,600));
      const m=/芷若重寫（DLG-FULL-REVIEW-1110）跳過的改句 (\d+) 列：(.*)/.exec(out)||[], body=String(m[2]||''), rows=body?body.split('；'):[];
      const L6=['AA_359 5-3 D26「天要暗了。臺中的天空比臺北大。」','AA_359 5-3 D27「天要暗了。木屋的影子好長。」','AA_359 5-3 D29「下次，我想來看港口的早上。」','AA_524 Z7 D18「你又不在台中。好，寄給你。」','AA_524 Z7 D18「好。我寫好再給你看。」','AA_524 Z7 D10「你會做什麼？好，我期待一下。」'];
      const WHY=/（(已經是改成的字（源稿寫回了）|原句對不到（源稿重寫了）)）$/, r6=rows.filter(r=>!/^AA_694 /.test(r)), r694=rows.filter(r=>/^AA_694 第 3 節第 \d+ 列 /.test(r));
      check('1. 芷若跳過的列：修正層她的六列（AA_359 5-3 的 D26、D27、D29，AA_524 Z7 的 D18 兩句、D10 一句）每一列都印出來、都寫了是哪一種（源稿寫回了／那一格重寫了）；其餘都是 AA_694 第 3 節跟著跳過的（她上一版有、新稿換掉的句子）',+m[1]===rows.length&&r6.length===6&&L6.every(x=>r6.some(r=>r.startsWith(x)&&WHY.test(r)))&&r6.length+r694.length===rows.length&&r694.every(r=>/（芷若的句子，新稿重寫了）$/.test(r)),J([m[1],r6,r694.length]));
      console.log('（芷若跳過 '+rows.length+' 列：'+r6.map(r=>r.replace(/^(AA_\d+ \S+ D\d\d).*（([^（）]*（[^（）]*）)）$/,'$1＝$2')).join('、')+'；AA_694 第 3 節 '+r694.length+' 列）');
      check('1. 別人跳過的列數照舊：語彤 289 列（AA_630 第 2 節 209 列）、學姊 86 列、沛珊 11 列、可昕 3 列；AA_767 六列、AA_769 七列、AA_773 九列照 path 都換了',/語彤重寫（DLG-FULL-REVIEW-1110）跳過的改句 289 列（其中 AA_630 第 2 節 209 列）/.test(out)&&/學姊重寫（DLG-FULL-REVIEW-1110）跳過的改句 86 列/.test(out)&&/沛珊重寫（PEISHAN-VOICE-1110）跳過的改句 11 列/.test(out)&&/可昕重寫（DLG-FULL-REVIEW-1110）跳過的改句 3 列/.test(out)&&/AA_767@0a2136911：語彤不分地點的短句 6 列（照 path），換了 6 列/.test(out)&&/AA_769@f9c1a2b80：可昕不分地點的短句 7 列（照 path），換了 7 列/.test(out)&&new RegExp('AA_773@'+C.ZR_COMMON_SHA+'：芷若不分地點的短句 9 列（照 path），換了 9 列').test(out)); }   /* 2026-11-12（X324 學姊續改 AA_837＋AA_838@a573a50dca）：學姊跳過的列 81→86（AA_598 逐句表第 11、30、41、45、57 列那五格這一版重寫了：已經是新句 34→29、跳過 55→60）。舊期望：跳過的改句 81 列 */
    const tool=read('tools/date/import_date_lines.py');
    check('1. 工具只對沛珊、學姊、語彤、可昕、芷若放寬（ps_skip 先看 who；別人的列照舊 sys.exit）；芷若的列原句還在＝不寫檔、全部列出來停下（ZR_STALE）；工具裡沒有寫死這一輪的 SHA（只有上一版 ZR_PREV）',/if who not in \(PS, SIS, YT, KX, ZR, ZQ, AN\) or not ps756\(loc, who\):\s+return False/.test(tool)&&tool.includes("ZR = 'heroine_02'")&&tool.includes("ZR_PREV = '"+PREV+"'")&&/if ZR_STALE:[^\n]*\n\s+sys\.exit\(/.test(tool)&&!tool.replace(/^""".*?"""/s,'').replace(/#.*$/mg,'').includes(SHA)); });   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：工具也對以安放寬（舊：到 ZQ 為止） */

  await sec(2,async()=>{ if(!haveSrc){ for(const k of LOCS) check('2. '+k+'：芷若有台詞',!!(NOW.loc[k].lines&&NOW.loc[k].lines[ZR])); return; }
    let n=0; const bad=[];
    for(const k of LOCS){ const g=of(NOW.loc[k],k,ZR), s=of(SRC[k],k,ZR);
      for(const p of new Set(Object.keys(g).concat(Object.keys(s)))){ n++; if(g[p]!==s[p]) bad.push(k+' '+p+'：稿「'+s[p]+'」遊戲「'+g[p]+'」'); } }
    check('2. 芷若 33 個地點 '+n+' 格（台詞、選項的字、tier、喜好、不喜歡那一句）和源稿 '+SHA+' 一字不差、格子一樣多',n>4500&&bad.length===0,J(bad.slice(0,6)));
    let ch=0; const miss=[], st=[]; for(const k of LOCS){ const s=of(SRC[k],k,ZR), o=of(OLDSRC[k],k,ZR), g=of(NOW.loc[k],k,ZR); for(const p of new Set(Object.keys(s).concat(Object.keys(o)))) if(s[p]!==o[p]){ ch++; if(g[p]!==s[p]) miss.push(k+' '+p); if(!/\/(text|t)$/.test(p)) st.push(k+' '+p); } if(J(Object.keys(s).sort())!==J(Object.keys(o).sort())) st.push(k+' 格子不一樣多'); }
    check('2. 源稿和上一版 '+PREV+' 逐格比：芷若 '+ch+' 格不同、每一格都照稿；不同的都是台詞或選項的字（tier、喜好、who、旗標、格子數沒動）',ch>=700&&miss.length===0&&st.length===0,J([ch,miss.slice(0,4),st.slice(0,4)]));
    const cells=(x,o)=>{ if(Array.isArray(x)) x.forEach(v=>cells(v,o)); else if(x&&typeof x==='object') for(const k in x){ if((k==='text'||k==='t')&&typeof x[k]==='string') o.push(x[k]); else cells(x[k],o); } return o; };
    let tot=0, nn=0, pos=0; const lost=[];
    for(const k of LOCS){ const r=REC[k][k], c=cells(SRC[k].lines[ZR],[]), g=new Set(Object.values(of(NOW.loc[k],k,ZR)).filter(v=>typeof v==='string')); tot+=r.length;
      r.forEach((t,i)=>{ if(t==null) return; nn++; if(!g.has(t)) lost.push(k+'#'+i+'：'+t); }); if(r.length===c.length&&r.every((t,i)=>t==null||t===c[i])) pos++; }
    check('2. 改稿紀錄 zr_D01～D33.json：'+tot+' 格裡有新字的 '+nn+' 格，每一句都在遊戲裡她那個地點的格子（其中 '+pos+' 個地點紀錄的第 n 格就是源稿的第 n 格，逐格位置也對）；33 個檔都沒有 for_LAWWW',tot>1500&&nn>=700&&pos>=28&&lost.length===0&&LOCS.every(k=>!(REC[k]._meta||{}).for_LAWWW),J([tot,nn,pos,lost.slice(0,4)]));
    if(WAS){ let d=0, back=0; const stt=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,ZR), w=of(WAS.loc[k],k,ZR), s=of(SRC[k],k,ZR), o=of(OLDSRC[k],k,ZR); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))){ if(g[p]!==w[p]) d++; else if(s[p]!==o[p]) back++; } if(J(Object.keys(g).sort())!==J(Object.keys(w).sort())) stt.push(k); }
      check('2. 芷若的格子和重匯以前（'+BASE+'）比：'+d+' 格不同；源稿改了、遊戲沒變的 '+back+' 格＝AA 把遊戲原本疊著的修正寫回源稿的格子；每個地點的格子（選項數、tier、喜好）一樣多',d>=700&&d+back===ch&&stt.length===0,J([d,back,ch,stt])); } });

  await sec(3,async()=>{ if(!WAS) return;
    const strip=D=>{ const x=JSON.parse(J(D)); delete x.source; if(x.lines){ delete x.lines[ZR]; delete x.lines[ZQ]; delete x.lines.heroine_01; } for(const k in x.loc) for(const part of ['lines','likes','dislikeLine']) if(x.loc[k][part]){ delete x.loc[k][part][ZR]; delete x.loc[k][part][ZQ]; delete x.loc[k][part].heroine_01; } return x; };   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0）：子晴也拿掉再比 */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的格子、短句也拿掉再比（tests/an_dates_1111_unit.js 另外驗；舊：只拿掉到子晴） */
    /* 2026-11-11（AA_780_an_date_followup.json@248c8e390，以安約會台詞匯入以後 AA 的後續改稿）：語彤 flaked[0][0]（還有芷若自己的 flaked[0][1]、子晴的 flaked[0]）改成第二次當天取消的當下反應——
       NOW 先用 date_src_sha.js 的 un780 把那幾格還原成各人自己那一輪的字再比，語彤那一格另外驗現在＝新字、重匯以前＝AA_767 的字。舊期望：直接拿 NOW 比 */
    const N7=C.un780(NOW), F7=C.FLAKED_780.filter(r=>r.who===YT);
    check('3. AA_780 換的語彤那一格（flaked[0][0]）：現在是「'+F7.map(r=>r.new).join('')+'」、重匯以前（'+BASE+'）是 AA_767 的「'+F7.map(r=>r.old).join('')+'」；整份還原以後和 NOW 只差 FLAKED_780 那三格',F7.length===1&&F7.every(r=>C.cell780(NOW,r)===r.new&&C.cell780(WAS,r)===r.old)&&(()=>{ const x=leaves(NOW,'',{}), y=leaves(N7,'',{}); return J(Object.keys(x).filter(p=>x[p]!==y[p]).sort())===J(C.FLAKED_780.map(r=>r.p).sort()); })());
    const a=leaves(strip(WAS),'',{}), b=leaves(strip(N7),'',{}), ka=Object.keys(a), diff=ka.filter(p=>a[p]!==b[p]).concat(Object.keys(b).filter(p=>!(p in a))).sort();
    check('3. 別人的格子（子晴、以安另外驗）、預約句、交通偏好、互動點（'+ka.length+' 格）和重匯以前（'+BASE+'）比：只有 AA 指定的四句不同（語彤 D15 圍欄、可昕 D09 到達／D17 女王頭／D33 大廳），其他零差異',ka.length>18000&&J(diff)===J(ALSO.map(x=>x.full).sort())&&ALSO.every(x=>a[x.full]===x.old&&b[x.full]===x.new),J(diff.slice(0,8).map(p=>p+'：'+a[p]+' → '+b[p])));   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的四千五百多格拿掉以後格數少了，「至少幾格」跟著降（舊：ka.length>22000） */
    for(const [who,nm] of [[YT,'語彤'],[KX,'可昕'],[SIS,'學姊'],[PS,'沛珊']]){   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：原本這一列還有以安（零差異），她的格子之後重寫了，拿掉 */   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0）：原本這一列還有子晴（零差異），她的格子之後重寫了，拿掉 */ let n=0; const d=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,who), w=of(WAS.loc[k],k,who); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))){ n++; if(g[p]!==w[p]) d.push(k+' '+p); } }
      const exp=ALSO.filter(x=>x.who===who).map(x=>x.loc+' '+x.p).sort();
      check('3. '+nm+' 33 個地點 '+n+' 格和重匯以前比：'+(exp.length?'只有那 '+exp.length+' 句不同':'零差異')+'；不分地點的短句一樣'+(who===YT?'（flaked[0][0] 那一格 AA_780 再換，還原再比）':''),n>3500&&J(d.sort())===J(exp)&&J(N7.lines[who])===J(WAS.lines[who]),J(d.slice(0,4))); }   /* 2026-11-11（AA_780@248c8e390）：短句改比 N7（語彤 flaked[0][0] 還原；上面另外驗）；舊期望 J(NOW.lines[who])===J(WAS.lines[who]) */
    if(haveSrc){ const other=[]; for(const k of LOCS){ const a=leaves(SRC[k],'',{}), b=leaves(OLDSRC[k],'',{}); for(const p of new Set(Object.keys(a).concat(Object.keys(b)))) if(a[p]!==b[p]&&!/^\/(lines|likes|dislikeLine)\/heroine_0[124]\//.test(p)) other.push(k+p); }   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0）：子晴的格子（heroine_04）不算 */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的格子（heroine_01）不算 */
      check('3. 源稿 '+SHA+' 和上一版 '+PREV+' 逐格比：芷若、子晴、以安以外的人只有那四句不同（語彤其餘、學姊、沛珊、可昕其餘 0 格）',J(other.sort())===J(ALSO.map(x=>x.loc+x.srcp).sort()),J(other.slice(0,8))); } });

  await sec(4,async()=>{
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：S.REMEMBER_IF 拿掉子晴 D06.cafe 那一列（再訪不分第一次選了什麼都聽 remember 的新句、她請；PICK_FLAG 照記 ZQ_D06_TREAT）——REMEMBER_IF 剩 2 筆（子晴 D15、沛珊 D05），D06.cafe 那一列不在。舊期望：REMEMBER_IF 3 筆（子晴 D06／D15、沛珊 D05） */
    check('4. PICK_FLAG、REMEMBER_IF、ARRIVE_VAR、S.LINE_IF 都沒有芷若的項目（沒有拿她的選項或句子當 key）；PICK_FLAG 3 筆、ARRIVE_VAR 2 筆照舊，REMEMBER_IF 2 筆（AA_812@633b7f7d6 拿掉子晴 D06.cafe 那一列）',![].concat(DATE.REMEMBER_IF,DATE.PICK_FLAG,DATE.ARRIVE_VAR).some(x=>x.who===ZR)&&!DATE.LINE_IF[ZR]&&DATE.PICK_FLAG.length===3&&DATE.REMEMBER_IF.length===2&&!DATE.REMEMBER_IF.some(r=>r.loc==='D06'||r.pid==='D06.cafe')&&DATE.ARRIVE_VAR.length===2);
    const bad=[]; for(const v of DATE.ARRIVE_VAR){ const F=(((NOW.loc[v.loc]||{}).lines||{})[v.who]||{}).arrive, T=F&&F.first?F.first.lines.map(x=>x.text):[]; if(!v.from.every(t=>T.includes(t))) bad.push('ARRIVE_VAR '+v.loc+' '+v.who); }
    for(const r of DATE.PICK_FLAG){ const h=((((NOW.loc[r.loc]||{}).lines||{})[r.who]||{}).hotspots||{})[r.pid], c=h&&h.first&&h.first.choice||[]; if(!c.some(x=>x.t===r.t)) bad.push('PICK_FLAG '+r.loc+' '+r.who+' '+r.t); }
    for(const r of DATE.REMEMBER_IF){ const h=((((NOW.loc[r.loc]||{}).lines||{})[r.who]||{}).hotspots||{})[r.pid]; if(!(h&&h.remember&&h.remember.lines&&h.remember.lines.length)) bad.push('REMEMBER_IF '+r.loc+' '+r.who+' '+r.pid); }
    check('4. 原本的 ARRIVE_VAR（沛珊 D28、可昕 D32）、PICK_FLAG、REMEMBER_IF（子晴 D06／D15、沛珊 D05）重匯以後都還對得上資料',bad.length===0,J(bad));
    const a5=read('src/aa524_3d.js'), sn=NOW.loc.D04.lines[ZR].hotspots['D04.snack'];
    check('4. aa524_3d.js 的 remember 多一句（z7）：拿芷若 D04 小吃第一次選的「下次換我請。」比——這個選項新稿沒換字、還在第二個；回覆、remember 照新稿；rem 只有兩筆（芷若 D04、語彤 D10）',a5.includes("{key:'z7',loc:'D04',who:'heroine_02',pid:'D04.snack',pick:'「下次換我請。」',x:{who:'heroine_02',t:'上次你說要請。老闆，兩份，他付。'}}")&&sn.first.choice.length===2&&sn.first.choice[1].t==='「下次換我請。」'&&sn.first.choice[1].reply[0].text==='好啊，你說的喔。'&&sn.remember.lines[0].text==='上次那家的老闆，還記得你不要香菜。'&&(a5.match(/\{key:'[a-z0-9]+',loc:'D\d\d',who:'/g)||[]).length===2,J(sn.first.choice));
    const code=[]; const walk=d=>{ for(const f of fs.readdirSync(path.join(H.ROOT,d))){ const p=d+'/'+f; if(fs.statSync(path.join(H.ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)&&p!=='src/data/date_lines.js') code.push([p,read(p).replace(/\/\*[\s\S]*?\*\//g,'')]); } }; walk('src');
    if(WAS){ const olds=new Set(), oopt=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,ZR), w=of(WAS.loc[k],k,ZR); for(const p in w) if(typeof w[p]==='string'&&/\/(text|t)$/.test(p)&&g[p]!==w[p]){ if(/\/t$/.test(p)) oopt.push([k,p.split('/')[2],w[p]]); if(w[p].replace(/[「」]/g,'').length>=8) olds.add(w[p]); } }
      const hit=[]; for(const s of olds) for(const [f,c] of code) if(c.includes(s)) hit.push(f+' '+s);
      check('4. 芷若換掉的舊句、舊選項（八個字以上的 '+olds.size+' 句）沒有留在 src/ 的程式和資料檔裡（date_lines.js 以外 '+code.length+' 個檔）',olds.size>400&&code.length>100&&hit.length===0,J(hit.slice(0,4)));
      /* 短的舊選項（「為什麼？」這種到處都有的字）：看有沒有哪個檔同時寫著那個地點的互動點和那個選項（＝拿它當 key）*/
      const hit2=[]; for(const [k,pid,t] of oopt) for(const [f,c] of code){ let i=-1; while((i=c.indexOf(t,i+1))>=0){ const near=c.slice(Math.max(0,i-200),i+200); if(near.includes(pid)||(near.includes("'"+k+"'")&&near.includes(ZR))) hit2.push(f+' '+pid+' '+t); } }
      check('4. 換掉的舊選項（'+oopt.length+' 個）沒有哪個程式檔把它和那個互動點寫在一起當 key',oopt.length>=20&&hit2.length===0,J(hit2.slice(0,4)));
      const treat=D=>LOCS.reduce((a,k)=>{ const hs=D.loc[k].lines[ZR].hotspots||{}; for(const pid in hs) for(const c of ((hs[pid].first||{}).choice||[])) if(DATE.isTreat(c.t)) a.push(pid+c.t); return a; },[]);
      check('4. 請客的選項（DATE.isTreat 看選項的字）和重匯以前同一組：D18.shop「我買給妳。」、D25.cafe「妳點，我請。」',J(treat(NOW))===J(treat(WAS))&&J(treat(NOW))===J(['D18.shop「我買給妳。」','D25.cafe「妳點，我請。」']),J([treat(NOW),treat(WAS)]));
      const opts=[]; let t=0; for(const k of LOCS){ const g=of(NOW.loc[k],k,ZR), w=of(WAS.loc[k],k,ZR); for(const p in g) if(/\/t$/.test(p)){ t++; if(g[p]!==w[p]) opts.push(k+' '+p.replace(/^lines\/hotspots\//,'').replace('/first/choice/','#').replace(/\/t$/,'')+' '+w[p]+'→'+g[p]); } }
      check('4. 芷若的選項（'+t+' 個）換字 '+opts.length+' 個；AA 點名的每個互動點都在裡面（D07 cell、D09 view、D11 museum、D12 sunset、D14 boardwalk、D15 rail、D16 beach、D17 mushroom、D19 museum／houses、D20 street／bridge、D21 street／temple／bridge、D22 maple、D23 market／cook／boats、D25 station、D26 path／plaza、D27 veranda、D28 alley、D29 warehouse）',opts.length>=20&&['D07.cell','D09.view','D11.museum','D12.sunset','D14.boardwalk','D15.rail','D16.beach','D17.mushroom','D19.museum','D19.houses','D20.street','D20.bridge','D21.street','D21.temple','D21.bridge','D22.maple','D23.market','D23.cook','D23.boats','D25.station','D26.path','D26.plaza','D27.veranda','D28.alley','D29.warehouse'].every(x=>opts.some(o=>o.includes(' '+x+'#'))),J(opts.length));
      check('4. 換字的選項抽五個照稿：D07 牢房①「我走前面。」、D16 沙灘①「脫啊。」、D19 宿舍①「妳走路變輕了。」、D26 草悟道①「那時候聽什麼？」、D29 倉庫①「妳喜歡這種地方？」',['D07 D07.cell#0 「那就不注意。」→「我走前面。」','D16 D16.beach#0 「那就不拍。」→「脫啊。」','D19 D19.houses#0 「妳又在看光。」→「妳走路變輕了。」','D26 D26.path#0 「今天拍清楚一點。」→「那時候聽什麼？」','D29 D29.warehouse#0 「妳每次都看到光。」→「妳喜歡這種地方？」'].every(x=>opts.includes(x)),J(opts.slice(0,3)));
      /* fx、旗標：選項物件除了 t、reply 的字以外的欄位（fx、set、flag、cost、extra、if…）一格都沒動——of() 逐格比過（第 2 節），這裡再看選項物件的 key */
      const kk=D=>LOCS.map(k=>{ const hs=D.loc[k].lines[ZR].hotspots||{}; return Object.keys(hs).map(pid=>((hs[pid].first||{}).choice||[]).map(c=>Object.keys(c).sort().join(',')).join('|')).join(';'); }).join('\n');
      check('4. 每個選項物件的欄位（t、reply、fx、記的旗標…）和重匯以前一樣',kk(NOW)===kk(WAS)); } });

  await sec(5,async()=>{ const all=J(NOW.loc);
    for(const x of ALSO){ const g=of(NOW.loc[x.loc],x.loc,x.who); check('5. '+x.loc+' '+(x.who===YT?'語彤':'可昕')+'：「'+x.new+'」進了（'+x.p.replace(/^lines\//,'').replace(/\/lines\/0\/text$/,'')+'）；舊字「'+x.old+'」整個檔都沒有',g[x.p]===x.new&&!all.includes(x.old),String(g[x.p])); }
    check('5. 可昕那三句不再跟祐廷比輸贏（沒有「比你熟」「比你上鏡」「你輸了」）；語彤那一句不再講期中考',!/比你熟|比你上鏡|你輸了/.test(J(LOCS.map(k=>NOW.loc[k].lines[KX])))&&!/期中考/.test(J(LOCS.map(k=>NOW.loc[k].lines[YT])))); });

  await sec(6,async()=>{ const LZ=NOW.lines[ZR];
    /* 2026-11-11（AA_780_an_date_followup.json@248c8e390，以安約會台詞匯入以後 AA 的後續改稿）：flaked 第二則「我那天把一杯熱可可等到涼掉。下次，你請我一杯熱的。」換成「今天我連要穿哪一件都想好了。沒關係，衣服不會跑。」
       （30 天內第二次當天取消的當下說的，沒有人等過；也拿掉沒人記的「你請我一杯」）。舊期望：flaked＝[['第二次了。','我那天把一杯熱可可等到涼掉。下次，你請我一杯熱的。']]（AA_773 的字）*/
    check('6. lines.heroine_02 九格照稿：acceptDating「好。那天我空下來了，整天。」、move 第二句「那天也可以，我看過班表了。」、transport「好啊，坐你的車。本來想在路上看書，改成跟你講話。」、flaked 第二句「今天我連要穿哪一件都想好了。沒關係，衣服不會跑。」（AA_780 再換；AA_773 是「我那天把一杯熱可可等到涼掉。…」）、depart 前兩句、enough 兩句、leaveEarly「就這樣？好吧。我以為還有下半場。」',J(LZ.acceptDating)===J(['好。那天我空下來了，整天。'])&&LZ.move[1]==='那天也可以，我看過班表了。'&&J(LZ.transport)===J(['好啊，坐你的車。本來想在路上看書，改成跟你講話。'])&&J(LZ.flaked)===J([['第二次了。','今天我連要穿哪一件都想好了。沒關係，衣服不會跑。']])&&J(LZ.depart.slice(0,2))===J(['我到了。早到了，先在附近晃一下。','在路上了。我帶了一本書，大概不會翻開。'])&&J(LZ.enough)===J(['今天夠了。很好玩，是我的腳先投降。','差不多了。現在很像散場，燈要亮了的那種。'])&&J(LZ.leaveEarly)===J(['就這樣？好吧。我以為還有下半場。']),J(LZ));
    check('6. 不改的照舊：accept 兩句、move 第一句、move3、cancel 兩句、flaked 第一句、depart 第三句、noPair',J(LZ.accept)===J(['好。那天我沒有班，我確認過了。','好。我會早到。'])&&LZ.move[0]==='好。新的時間我記下來了。'&&J(LZ.move3)===J(['這次就這個時間了喔？'])&&J(LZ.cancel)===J(['好。我一個人去也可以，我很習慣。','好。下次。'])&&LZ.flaked[0][0]==='第二次了。'&&LZ.depart[2]==='今天我沒有班。這句話很少見。'&&J(LZ.noPair)===J(['拍照？我拍你就好。我不上鏡。']));
    check('6. date3d.js 兩格：S.MORNING_OWN 芷若「我出門的時候，我媽叫我問你吃不吃蛋餅。她已經在煎了。」、S.T7A_YES 芷若「你要來臺中？好，我帶你走。」；S.MORNING 芷若（「我六點就醒了。換地方睡，都這樣。」）、S.HOME_NO 芷若不改；舊句不在程式裡',DATE.MORNING_OWN[ZR]==='我出門的時候，我媽叫我問你吃不吃蛋餅。她已經在煎了。'&&DATE.T7A_YES[ZR]==='你要來臺中？好，我帶你走。'&&DATE.MORNING[ZR]==='我六點就醒了。換地方睡，都這樣。'&&DATE.HOME_NO[ZR]==='「那個禮拜我回台中了。換一天好不好？」'&&!/我媽問我跟誰|你要來臺中？……好/.test(read('src/date3d.js').replace(/\/\*[\s\S]*?\*\//g,'')),J([DATE.MORNING_OWN[ZR],DATE.T7A_YES[ZR]]));
    const raw=show(C.ZR_COMMON_SHA,SP+'AA_773_zr_date_common.json'), A=raw?JSON.parse(raw):null;
    const get=(o,pth)=>pth.match(/\[\d+\]|[^.\[\]]+/g).reduce((x,t)=>x==null?x:x[t[0]==='['?+t.slice(1,-1):t],o);
    if(A){ const r1=A.rows.filter(r=>r.file==='src/data/date_lines.js'), r2=A.rows.filter(r=>r.file==='src/date3d.js');
      /* 2026-11-11（AA_780@248c8e390）：flaked[0][1] 那一列 AA_780 再換（old＝這一列的 new），那一格改認 AA_780 的 new（date_src_sha.js 的 want780；別的列照舊認這份稿的 new）。舊期望：九列都＝這份稿的 new */
      check('6. 逐字：稿 11 列（date_lines.js 九列、date3d.js 兩列）；每一列的 new 在 path 那一格（flaked[0][1] 那一列＝AA_780 再換的字）',A.rows.length===11&&r1.length===9&&r2.length===2&&r1.every(r=>get(NOW,r.path)===C.want780(r))&&r1.filter(r=>C.want780(r)!==r.new).map(r=>r.path).join()==='lines.heroine_02.flaked[0][1]'&&r2.every(r=>get({S:DATE},r.path)===r.new),J(r1.filter(r=>get(NOW,r.path)!==C.want780(r)).map(r=>r.path).concat(r2.filter(r=>get({S:DATE},r.path)!==r.new).map(r=>r.path))));
      if(WAS){ const a=leaves(WAS.lines[ZR],'',{}), b=leaves(LZ,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]).sort();
        check('6. lines.heroine_02 和重匯以前比：格子一樣多、只有這九格不同（照 path；old 就是原本那一格的字）',J(Object.keys(a))===J(Object.keys(b))&&J(d)===J(['/acceptDating/0','/depart/0','/depart/1','/enough/0','/enough/1','/flaked/0/1','/leaveEarly/0','/move/1','/transport/0'])&&r1.every(r=>get(WAS,r.path)===r.old),J(d));
        const strip=D=>{ const x=JSON.parse(J(D.lines)); delete x[ZR]; delete x[ZQ]; delete x.heroine_01; return J(x); };   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0）：子晴的短句照 AA_775 換了五格，拿掉再比 */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的短句照 AA_777 換了四格，拿掉再比 */
        /* 2026-11-11（AA_780@248c8e390）：語彤 flaked[0][0] 換成「嗯。第二次了。」——NOW 用 un780 還原那一格再比（那一格在第 3 節另外驗）。舊期望 strip(NOW)===strip(WAS) */
        check('6. 別人不分地點的短句和重匯以前一樣（語彤 flaked[0][0] 那一格 AA_780 再換，還原再比）',strip(C.un780(NOW))===strip(WAS)&&strip(NOW)!==strip(WAS)); }
      const ob3=show(BASE,'src/date3d.js'); if(ob3){ const lit=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').match(/'(?:[^'\\\n]|\\.)*'/g)||[], O=lit(ob3), L=lit(show('e61d19547','src/date3d.js')||read('src/date3d.js')) /* 2026-11-11：「重匯以後」固定比 e61d19547（子晴 AA_775 進來的那個 commit）的 date3d.js；原本比現在的檔，之後每加一個字串（S.DEV_NOTE、以安 AA_777…）就紅 */, cnt=A=>A.reduce((m,t)=>(m[t]=(m[t]||0)+1,m),{}), co=cnt(O), cl=cnt(L), gone=[], came=[];
        for(const t of new Set(O.concat(L))){ const n=(cl[t]||0)-(co[t]||0); for(let i=0;i<Math.abs(n);i++) (n<0?gone:came).push(t); }
        const q=t=>"'"+t+"'";
        /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0）：date3d.js 又照 AA_775_zq_date_common.json 換了子晴四列（S.MORNING、REMEMBER_IF 兩句備用句、S.NIGHT_HOME 多 'D26'、'heroine_04'；逐字在 tests/zq_dates_1111_unit.js）——少掉多三句、多出來多五個字串。舊期望：只差芷若那兩列 */
        const ZQO=['上次也來這裡。','上次也來這裡。','昨天我又弄到兩點。……今天你負責叫我。'], ZQN=['這家的位子我記得，靠牆那桌插座最近。','布丁還在同一格，我要拿了。','昨天我又弄到兩點。你先去吃早餐，幫我留一個甜的。','D26','heroine_04'];
        check('6. date3d.js 的字串和重匯以前（'+BASE+'）比：少掉的剛好是稿上那兩列的 old（＋子晴三句舊字）、多出來的剛好是兩列的 new（＋子晴三句新字和 D26、heroine_04）；條件、別人的句子、程式沒動',J(gone.sort())===J(r2.map(r=>q(r.old)).concat(ZQO.map(q)).sort())&&J(came.sort())===J(r2.map(r=>q(r.new)).concat(ZQN.map(q)).sort()),J([gone,came])); } }
    /* transport 那一句什麼時候播：她有交通偏好的地點、玩家改掉（prefOff）。「坐你的車」要成立＝另一種走法只有開車 */
    const P=NOW.prefs[ZR]||{}, modes=k=>(DATE.loc(k).transport||[]).map(x=>x.mode);
    check('6. 芷若有交通偏好的地點：D18 九份（捷運轉客運）、D26 臺中（高鐵）、D30 花蓮（台鐵），這三個地點另一種走法都只有開車——所以「好啊，坐你的車。…」只會在改成開車時播',J(Object.keys(P).sort())===J(['D18','D26','D30'])&&Object.keys(P).every(k=>modes(k).includes(P[k].transport)&&J(modes(k).filter(m=>m!==P[k].transport))===J(['car']))&&!LOCS.some(k=>!P[k]&&DATE.prefOf(ZR,k)),J([P,modes('D18'),modes('D26'),modes('D30')]));
    const TL='好啊，坐你的車。本來想在路上看書，改成跟你講話。', res=[];
    for(const [loc,mode,ov] of [['D30','開車',true],['D30','台鐵',true],['D18','開車',false],['D18','捷運轉客運',false],['D12',null,false]]){ const G=setup('2026-03-27',20,{dating_heroine_02:true}); know(ZR); H.said=[]; H.opts=[]; H.picks=(ov?['兩天一夜…']:[]).concat([DATE.loc(loc).name],mode?[mode]:[],['明天','09:00','就這樣約']);   /* D12 只有捷運一種走法，選單不問交通 */
      let t=null; try{ t=await DATE.menu(GM,ZR,null); }catch(e){ t={ok:false,why:String(e.message)}; } const L=H.said.map(s=>s.t); res.push([loc,mode,!!(t&&t.ok),t&&t.transport,L.includes(TL)]); }
    check('6. 實際約一次（選單）：D30 花蓮（兩天一夜）改開車＝她說這一句、照她的搭火車＝不說；D18 九份（當天來回）改開車＝說、照她的捷運轉客運＝不說；D12 大稻埕（她沒有偏好、只有捷運）不說',J(res)===J([['D30','開車',true,'car',true],['D30','台鐵',true,'rail',false],['D18','開車',true,'car',true],['D18','捷運轉客運',true,'mrt+coach',false],['D12',null,true,'mrt',false]]),J(res)); });

  await sec(7,async()=>{ const W=DW(read('src/data/date_wish.js')), ev=W.events[ZR], I=ev.herInvite, ACC='好。兩點半出發，光典門口見。兩點半是巧合，跟店名沒關係。';   /* 2026-11-11 AA 841c1810e：改成對得上出發時間（遊戲的 14:30 是從學校出發）；舊：「好。兩點半，光典門口。…」 */
    check('7. date_wish.js 的來源寫著「AA_774@'+C.ZR_WISH_SHA+'（芷若 D05 心願 27 列，換了 27 列）」；芷若的事件 id、地點 D05、她約的時間（週六或週日 14.5、訊息週三四 22:30 以後）照舊',W.source.includes('AA_774@'+C.ZR_WISH_SHA+'（芷若 D05 心願 27 列，換了 27 列）')&&ev.id==='wish_heroine_02'&&ev.loc==='D05'&&I.dateTime===14.5&&J(I.dateWeekday)===J([6,0])&&J(I.message)===J({weekday:[3,4],time:[22.5,24]}),W.source.slice(-60));
    const raw=show(C.ZR_WISH_SHA,SP+'AA_774_zr_wish.json'), A=raw?JSON.parse(raw):null;
    const get=(o,pth)=>{ let x=o; const tk=[...pth.matchAll(/\["([^"]+)"\]|\.?([^.\[\]"]+)|\[(\d+)\]/g)].map(m=>m[1]!=null?m[1]:(m[2]!=null?m[2]:+m[3])); for(let i=0;i<tk.length;i++){ if(x==null) return x; let t=tk[i]; if(typeof x==='object'&&!Array.isArray(x)&&!(t in x)&&typeof tk[i+1]==='string'&&(t+'.'+tk[i+1]) in x){ t=t+'.'+tk[i+1]; i++; } x=x[t]; } return x&&typeof x==='object'?x.text:x; };
    if(A){ check('7. 逐字：稿 27 列，每一列 path 那一格現在是 new',A.rows.length===27&&A.rows.every(r=>get(ev,r.path)===r.new),J(A.rows.filter(r=>get(ev,r.path)!==r.new).map(r=>r.path)));
      const tmp=path.join(os.tmpdir(),'date_wish_zr1111_'+process.pid+'.js'); let ok=false, out='';
      try{ out=cp.execFileSync('python3',['tools/date/import_wish.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_wish.js'); }catch(x){ out=String(x.stderr||x.stdout||x.message).slice(0,300); }
      try{ fs.unlinkSync(tmp); }catch(x){}
      check('7. tools/date/import_wish.py 重匯（--out 另存）的結果和 src/data/date_wish.js 一樣',ok,ok?'':out.slice(0,300)); }
    const ow=show(BASE,'src/data/date_wish.js'); if(ow){ const O=DW(ow), ids=Object.keys(O.events).filter(k=>k!==ZR&&k!==ZQ&&k!=='heroine_01'), a=leaves(O.events[ZR],'',{}), b=leaves(ev,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]);
      /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0）：子晴的心願事件照 AA_776 收字 30 格（tests/zq_dates_1111_unit.js 另外驗），拿掉再比；舊期望 6 位 */
      check('7. 別人的心願事件（'+ids.length+' 位，含可昕、語彤、學姊、沛珊；子晴、以安另外驗）和重匯以前（'+BASE+'）一樣；hold、verify.miss 照舊是空的',ids.length===4&&ids.every(k=>J(O.events[k])===J(W.events[k]))&&J(O.hold)===J(W.hold)&&W.verify.miss.length===0);   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的心願事件照 AA_778 收字 16 格（tests/an_dates_1111_unit.js 另外驗），拿掉再比；舊期望 5 位 */
      check('7. 芷若的事件和重匯以前比：格子一樣多、不一樣的 27 格都是台詞的 text（選項的字、條件、時間、地點沒動）',J(Object.keys(a))===J(Object.keys(b))&&d.length===27&&d.every(k=>/\/text$/.test(k))&&(!A||A.rows.every(r=>get(O.events[ZR],r.path)===r.old)),J(d.filter(k=>!/\/text$/.test(k)))); }
    const dots=[]; const w=o=>{ if(Array.isArray(o)) o.forEach(w); else if(o&&typeof o==='object'){ if(typeof o.text==='string'&&o.who&&o.who!=='note'&&o.text.includes('……')) dots.push(o.text); for(const k in o) w(o[k]); } }; w(ev);
    check('7. 刪節號只剩 AA 說要留的三處：院子「……今天放不了。旁邊有人。」、片單牆「……再說。」、收尾「下次的票……再說。」',J(dots.slice().sort())===J(['……今天放不了。旁邊有人。','……再說。','下次的票……再說。'].sort()),J(dots));
    check('7. 改掉的三句（不對祐廷下命令、不嫌他）：到達「這句我想很久了。你可以笑。」、片單牆「…你會睡著，沒關係。」、收尾「票根。你的，可以給我嗎？」',ev.arrive.lines[1].text==='這句我想很久了。你可以笑。'&&ev.hotspots['D05.board'].choices[1].reply[0].text==='這部。黑白的，兩個小時，沒有人說話。你會睡著，沒關係。'&&ev.closing.lines[1].text==='票根。你的，可以給我嗎？');
    /* 「兩點半，光典門口」：她主動約的那一場實際幾點、在哪 */
    const L5=DATE.loc('D05'), tr=(L5.transport||[])[0]||{};
    check('7. 她主動約的那一場：答應以後她回「'+ACC+'」；出發時間 WISH.departOf(14.5)＝14.5（14:30），地點 D05「'+L5.name+'」（名字有「光典」）；這個事件沒有 {出發時間} 這種佔位符',J(I.accept.map(x=>x.text))===J([ACC])&&WISH.departOf(I.dateTime,0)===14.5&&/光典/.test(L5.name)&&!Object.values(leaves(ev,'',{})).some(v=>typeof v==='string'&&/[{}]/.test(v)),J([I.accept,L5.name]));
    console.log('（D05 '+L5.name+'：'+J(L5.transport)+'；固定段落 '+J(L5.fixed)+'）');
    { const G=setup('2026-04-29',22.75,{}); know(ZR); Object.assign(SOCIAL.rel(ZR),{fam:60,trust:45,comf:40,npcRom:55,rom:30}); G.money=8000;   /* 她主動約的條件：約會階段 5 以上（herInvite.if.dateStage） */
      let sent=false, acc=[], ask=null, A2=null, trip=null, why=''; try{ if(WISH.known&&!WISH.known(G,ZR)&&WISH.learn) WISH.learn(G,ZR); sent=WISH.askRule(G,ZR); PHONE.tick(G);
        const wk=o=>{ if(!o||typeof o!=='object') return; if(o.ask&&o.ask.opts) ask=o.ask; for(const k in o) wk(o[k]); }; wk(PHONE.rec(G)); wk(G.msgs); acc=ask?ask.opts[0].say.map(x=>x.text):[];
        A2=DATE.log(G,ZR).wishAsk; if(A2){ G.flags['WISH_ASK_'+ZR]='yes'; WISH.askBook(G,ZR); trip=A2.trip!=null?DATE.trip(G,A2.trip):null; why=A2.why||''; } }catch(e){ why='（例外）'+String(e.message); }
      const wd=A2?CALENDAR.dateOf(A2.date).wd%7:null, hm=h=>String(Math.floor(h)).padStart(2,'0')+':'+String(Math.round((h%1)*60)).padStart(2,'0');
      check('7. 實際演（約會階段 '+DATE.stageNum(ZR)+'）：2026-04-29（三）22:45 她傳訊息約 → 約的是那個週六（wd 6）、出發 14:30 → 「答應」要回的一則＝「'+ACC+'」',DATE.stageNum(ZR)>=5&&sent===true&&J(acc)===J([ACC])&&!!A2&&wd===6&&A2.depart===14.5,J([sent,acc,A2,why]));
      check('7. 答應以後訂下的那一趟：D05、週六、出發 14.5（14:30）、搭捷運（單程 '+(tr.minutes|0)+' 分）、她約的（by her）、算心願那一場',!!trip&&J(trip.locs)===J(['D05'])&&trip.depart===14.5&&trip.day===A2.date&&trip.transport==='mrt'&&trip.by==='her'&&trip.wish===true,J([trip&&{locs:trip.locs,depart:trip.depart,day:trip.day,transport:trip.transport,by:trip.by,wish:trip.wish,back:trip.back},why]));
      if(trip) console.log('（那一趟：出發 '+hm(trip.depart)+'、捷運 '+(tr.minutes|0)+' 分＝到光典大約 '+hm(trip.depart+(tr.minutes|0)/60)+'、看電影 '+((L5.fixed||{}).minutes|0)+' 分、回到 '+(typeof trip.back==='number'?hm(trip.back):'?')+'）'); } });

  await sec(8,async()=>{ const K=NOW.loc.D13.lines[ZR], nn=[]; const w=(o,p)=>{ if(Array.isArray(o)) o.forEach((v,i)=>w(v,p+'/'+i)); else if(o&&typeof o==='object'){ if(typeof o.text==='string'&&o.who&&o.who!==ZR) nn.push(o.who+':'+o.text); for(const k in o) w(o[k],p+'/'+k); } }; w(K,'');
    check('8. D13 淡水「記 TASTE」那兩格照留（不顯示的註記，date3d.js 讀得到：玩家點的、plain）；其他旁白、備註格都在',nn.includes('note:記 `TASTE`＝玩家點的')&&nn.includes('note:記 `TASTE`＝`plain`')&&nn.includes('narr:她喝了一口，點頭。')&&nn.includes('narr:請路人拍背影，C2')&&nn.length===10&&[/記 `?TASTE`?＝`?([^`]+)`?/.exec('記 `TASTE`＝玩家點的')[1],/記 `?TASTE`?＝`?([^`]+)`?/.exec('記 `TASTE`＝`plain`')[1]].join()==='玩家點的,plain'&&read('src/date3d.js').includes("/記 `?TASTE`?＝`?([^`]+)`?/"),J(nn));
    if(WAS){ const nar=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,ZR), o=of(WAS.loc[k],k,ZR); for(const p in g) if(/\/text$/.test(p)&&g[p]!==o[p]&&g[p.replace(/text$/,'who')]==='narr') nar.push(k+' '+o[p]+' → '+g[p]); }
      console.log('（旁白格——who 是旁白——改了字的 '+nar.length+' 格，照稿匯：'+nar.join('；')+'）');
      const who=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,ZR), o=of(WAS.loc[k],k,ZR); for(const p in g) if(/\/who$/.test(p)&&g[p]!==o[p]) who.push(k+' '+p); }
      check('8. 每一格是誰說的（who：她、旁白、註記）和重匯以前一樣',who.length===0,J(who.slice(0,4))); }
    check('8. 芷若 33 個地點都有到達、收尾、互動點；沒有空字串、沒有大括號以外的佔位符（只有 {name}、{sunset}、{lastDrink}）',LOCS.every(k=>{ const L=NOW.loc[k].lines[ZR]; return L&&L.arrive&&L.closing&&L.hotspots&&Object.keys(L.hotspots).length>=3; })&&!Object.values(LOCS.reduce((a,k)=>Object.assign(a,Object.fromEntries(Object.entries(of(NOW.loc[k],k,ZR)).map(([p,v])=>[k+p,v]))),{})).some(v=>typeof v==='string'&&(v===''||/\{(?!name\}|sunset\}|lastDrink\})/.test(v)))); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
