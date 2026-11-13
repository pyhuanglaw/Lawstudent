// 可昕校外約會台詞重寫（DLG-FULL-REVIEW-1110；使用者 X324「就是要像人在說話」；2026-11-11）——不需要瀏覽器（D131）。
//   約會源稿 date_system/lines/D01～D33.json@f9c1a2b80（和 0a2136911 比只動可昕的格子）；改稿紀錄 date_rewrite/kx_D01～D33.json；AA_769_kx_date_common.json、AA_770_kx_wish.json 同一個 SHA
//   1. 白名單；import_date_lines.py 重匯（--out）一樣；修正層跳過的可昕的列（3 列）；語彤、學姊、沛珊跳過的列數照舊
//   2. 可昕 33 個地點的格子和源稿一字不差（D13 那一格備註照舊改成不顯示）；改稿紀錄 924 格都在；D13 dating 12 格另外寫、旁白和備註格沒動
//   3. 別人的格子（含語彤、學姊、沛珊）、預約句、交通偏好和重匯以前（BASE）完全一樣
//   4. date3d.js：ARRIVE_VAR 可昕 D32（同一趟）還對得上；出發三句輪流；沒有拿可昕的句子當 key 的地方
//   5. 選項換字 20 格、選項數／tier／喜好不變；請客的選項同一組
//   6. AA_769（8 列，照 path）：lines.kexin 七列＋S.MORNING.kexin；transport 那一句只在她想搭火車、被改成開車時播（D25、D30）
//   7. AA_770（23 列，照 path）：date_wish.js 的 events.kexin；{出發時間}：有出發時間→印出時間、沒有→退路句、兩種都沒有大括號
//   8. 過夜晚上那一句：D29 高雄＋可昕＝「（晚上她回家。你住在車站附近的旅館。）」
// 稿、BASE 讀 git show；讀不到（淺層複本）＝不比稿，只驗結構。用法：node tests/kx_dates_1111_unit.js
require('./alison.js');
const M959=require('./aa959_map.js');   /* AA_959（DLG-FULL-REVIEW-1110）：遊戲的 date_lines 先照覆寫表換回舊字再比（AA_959 本身逐列驗在 tests/aa959_overlay_unit.js）*/
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), os=require('os'), vm=require('vm');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
/* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：白名單 D01～D33 再改認 a29a8aba0（芷若的格子重寫；同一版可昕改三句——D09 到達、D17 女王頭 remember、D33 大廳 remember，原本像在跟祐廷比輸贏；語彤改 D15 一句）——
   白名單現在的版本改讀 tests/date_src_sha.js（ALLOW_SHA，以後換版只改那一處）；可昕的稿照舊讀 f9c1a2b80（SHA），那三句照 date_src_sha.js 的 ALSO 比（舊期望＝ALSO 的 old）；
   芷若的格子、短句、心願事件另外驗（tests/zr_dates_1111_unit.js），這裡比別人時拿掉 */
const CS=require('./date_src_sha.js'), ALLOW_SHA=CS.ALLOW_SHA, ZR='heroine_02', ZQ='heroine_04', ALSO_KX=CS.ALSO.filter(x=>x.who==='kexin'), ALSO_YT=CS.ALSO.filter(x=>x.who==='heroine_03'), also=(k,p)=>ALSO_KX.find(x=>x.loc===k&&x.path===p);
const KX='kexin', YT='heroine_03', SIS='heroine_05', PS='classmate_peishan', SHA='f9c1a2b80', PREV='0a2136911', BASE='ab3e81b00', SP='docs/story_planning/';
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
const NOW812=M959.unmapDeep(DL(read('src/data/date_lines.js')),'date_lines.js'), NOW=CS.un812(NOW812);
check('0. AA_812 那七格（CELLS_812）現在是新字（還原成舊字以後才拿 NOW 和源稿、重匯以前比）',CS.CELLS_812.length===7&&CS.CELLS_812.every(r=>CS.cell812(NOW812,r)===(r.now||r.new)&&CS.cell812(NOW,r)===r.old),JSON.stringify(CS.CELLS_812.map(r=>CS.cell812(NOW812,r))));   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：第六格（子晴 D06.cafe 第一次選項的回覆）AA 在 AA_846 late_fix 改回「下次我請你吃滷味。」，AA_812 path_rows 那一列被取代（import_date_lines.py SUPER812）——那一格現在認 CELLS_812 的 now。舊期望：七格都＝r.new */
const SRC={}, OLDSRC={}, REC={}; for(const k of LOCS){ const t=show(SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'), r=show(SHA,SP+'date_rewrite/kx_'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLDSRC[k]=JSON.parse(u); if(r) REC[k]=JSON.parse(r); }
const haveSrc=Object.keys(SRC).length===33&&Object.keys(OLDSRC).length===33&&Object.keys(REC).length===33;
const ob=show(BASE,'src/data/date_lines.js'), WAS=ob?DL(ob):null;
const NOTE_CELL='lines/hotspots/D13.rail/first/choice/1/reply/1/who';   // 「第 3 節她的心願的伏筆」：稿上是旁白，匯入時改成不顯示的註記（NOTE_NARR，照舊）
{ const ch=GM.choose; let n=0; GM.choose=async o=>{ if(++n>150) throw new Error('選單一直重來：'+J(o.map(x=>x.t||x.text))); return ch(o); }; GM._reset=()=>{ n=0; }; }
GM.money=d=>{ H.G.money+=d; };
const setup=(key,h,flags)=>{ const G=H.fresh(key,h,'dorm',flags||{}); G.outings=[]; G.contacts=G.contacts||{}; G.money=50000; GM._reset(); return G; };
const know=id=>{ H.CLOSE(id); H.G.contacts[id]=1; };

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
    const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===ALLOW_SHA&&e[0].status==='approved'&&[SHA,'0a2136911','82c946ad7','2883197b6'].every(s=>(e[0].history||[]).some(h=>h.sha===s))); });
    check('1. 白名單 D01～D33 都是 '+ALLOW_SHA+'、approved，可昕重寫的 '+SHA+' 和前三版（語彤 0a2136911、學姊 82c946ad7、沛珊 2883197b6）留在 history',bad.length===0,J(bad));
    const e9=allow.filter(x=>x.path===SP+'AA_769_kx_date_common.json'), e0=allow.filter(x=>x.path===SP+'AA_770_kx_wish.json');
    check('1. 白名單 AA_769_kx_date_common.json、AA_770_kx_wish.json@'+SHA+' 各一筆、approved；date_lines.js 的來源寫著 33 個地點 @'+ALLOW_SHA+' 和 AA_769',e9.length===1&&e9[0].sha===SHA&&e9[0].status==='approved'&&e0.length===1&&e0[0].sha===SHA&&e0[0].status==='approved'&&LOCS.every(k=>NOW.source.includes(k+'.json@'+ALLOW_SHA))&&NOW.source.includes('AA_769_kx_date_common.json@'+SHA));
    console.log(haveSrc&&WAS?'（稿和 BASE 都讀得到：逐字比對）':'（這份 checkout 讀不到企劃線的稿或 BASE：不比稿，只驗結構）');
    if(haveSrc){ const tmp=path.join(os.tmpdir(),'date_lines_kx1111_'+process.pid+'.js'); let out='', ok=false;
      try{ out=cp.execFileSync('python3',['tools/date/import_date_lines.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<26}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_lines.js'); }catch(e){ out=String(e.stderr||e.stdout||e.message).slice(0,300); }
      try{ fs.unlinkSync(tmp); }catch(e){}
      check('1. tools/date/import_date_lines.py 重匯（--out 另存）的結果和 src/data/date_lines.js 一樣',ok,ok?'':out.slice(0,300));
      const m=/可昕重寫（DLG-FULL-REVIEW-1110）跳過的改句 (\d+) 列：(.*)/.exec(out)||[], body=String(m[2]||'');
      check('1. 可昕跳過的列剛好 3 列：AA_373 6-1 的兩句（「你走的比我少，你請晚餐。」那一格新稿重寫了；「有一隻羊在看我。我在看它。平手。」那一格新稿直接寫了 AA_373 的改成）、AA_359 5-2 的 D28（「今天的行程比昨天鬆。你不要拖。」——新稿直接寫第一天說得通的字）；沒有 AA_694 的列',+m[1]===3&&body.includes('AA_373 6-1 「你走的比我少，你請晚餐。」（原句對不到（源稿重寫了））')&&body.includes('AA_373 6-1 「有一隻羊在看我。我在看它。平手。」（已經是改成的字（新稿直接寫了））')&&body.includes('AA_359 5-2 D28「今天的行程比昨天鬆。你不要拖。」（原句對不到（源稿重寫了））')&&!/AA_694/.test(body),body.slice(0,300));
      check('1. 語彤跳過的列 292 列（AA_630 第 2 節 209 列）、學姊 95 列、沛珊 11 列；AA_767 六列、AA_769 七列照 path 都換了',/語彤重寫（DLG-FULL-REVIEW-1110）跳過的改句 292 列（其中 AA_630 第 2 節 209 列）/.test(out)&&/學姊重寫（DLG-FULL-REVIEW-1110）跳過的改句 95 列/.test(out)&&/沛珊重寫（PEISHAN-VOICE-1110）跳過的改句 11 列/.test(out)&&/AA_767@0a2136911：語彤不分地點的短句 6 列（照 path），換了 6 列/.test(out)&&/AA_769@f9c1a2b80：可昕不分地點的短句 7 列（照 path），換了 7 列/.test(out)); }   /* 2026-11-12（X324 學姊續改 AA_837＋AA_838@a573a50dca）：學姊跳過的列 81→86（AA_598 逐句表第 11、30、41、45、57 列那五格這一版重寫了：已經是新句 34→29、跳過 55→60）。舊期望：跳過的改句 81 列 */   /* 2026-11-12（X324「好」開頭回話 AA_842@41f77eab53）：學姊跳過的列 86→95——AA_598 逐句表第 19、33、44、46、55 列（D11 圖書館、D19 木屋、D24 泡腳／車站、D29 鐵道第一次選項的回話，原句都是「好。…」開頭）那五格這一版重寫了（換 4→1、已經是新句 29→27、跳過 60→65），AA_694 第 3 節第 162、195、196、238 列跟著跳過（22→26）。舊期望：跳過的改句 86 列 */   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：語彤跳過的列 289→292——AA_694 第 3 節第 158、161、176 列（D19、D21 再訪句，原句「上次…」開頭，這一版重寫了）跟著跳過（80→83）；AA_630 第 2 節還是 209 列（其中 D-028、079、094、112、130、134、151、159、175 九列從「源稿已經是改成的字」變成「那一格新稿重寫了」）。舊期望：語彤跳過的改句 289 列 */
    const tool=read('tools/date/import_date_lines.py');
    check('1. 工具只對沛珊、學姊、語彤、可昕（和後來的芷若）放寬（ps_skip 先看 who；別人的列照舊 sys.exit）',/if who not in \(PS, SIS, YT, KX, ZR, ZQ, AN\) or not ps756\(loc, who\):\s+return False/.test(tool)&&tool.includes("KX = 'kexin'")&&tool.includes("KX_PREV = '0a2136911'")); });   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：工具也對子晴放寬（舊：到 ZR 為止） */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：工具也對以安放寬（舊：到 ZQ 為止） */

  await sec(2,async()=>{ if(!haveSrc){ for(const k of LOCS) check('2. '+k+'：可昕有台詞',!!(NOW.loc[k].lines&&NOW.loc[k].lines[KX])); return; }
    let n=0; const bad=[];
    for(const k of LOCS){ const g=of(NOW.loc[k],k,KX), s=of(SRC[k],k,KX);
      for(const p of new Set(Object.keys(g).concat(Object.keys(s)))){ n++; const x=also(k,p); if(x?!(s[p]===x.old&&g[p]===x.new):(g[p]!==s[p]&&!(k==='D13'&&p===NOTE_CELL&&s[p]==='narr'&&g[p]==='note'))) bad.push(k+' '+p+'：稿「'+s[p]+'」遊戲「'+g[p]+'」'); } }   /* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：D09／D17／D33 那三句 AA 後來在 a29a8aba0 改了字（稿 f9c1a2b80 是舊字、遊戲是新字）*/
    check('2. 可昕 33 個地點 '+n+' 格和源稿 '+SHA+' 一字不差、格子一樣多（D13「第 3 節她的心願的伏筆」那一格照舊改成不顯示的註記；D09／D17／D33 三句照後來的 '+ALLOW_SHA+'）',n>4500&&bad.length===0,J(bad.slice(0,6)));
    let ch=0; const miss=[], other=[]; for(const k of LOCS){ const s=of(SRC[k],k,KX), o=of(OLDSRC[k],k,KX), g=of(NOW.loc[k],k,KX); for(const p of new Set(Object.keys(s).concat(Object.keys(o)))) if(s[p]!==o[p]){ ch++; if(g[p]!==s[p]&&!also(k,p)) miss.push(k+' '+p); }
      const a=leaves(SRC[k],'',{}), b=leaves(OLDSRC[k],'',{}); for(const p of new Set(Object.keys(a).concat(Object.keys(b)))) if(a[p]!==b[p]&&!/^\/(lines|likes|dislikeLine)\/kexin\//.test(p)) other.push(k+p); }
    check('2. 源稿和上一版 '+PREV+' 逐格比：可昕 916 格不同、每一格都照稿；可昕以外的人（含語彤、學姊、沛珊）0 格不同',ch===916&&miss.length===0&&other.length===0,J([ch,miss.slice(0,4),other.slice(0,4)]));
    const cells=(x,o)=>{ if(Array.isArray(x)) x.forEach(v=>cells(v,o)); else if(x&&typeof x==='object') for(const k in x){ if((k==='text'||k==='t')&&typeof x[k]==='string') o.push(x[k]); else cells(x[k],o); } return o; };
    let tot=0, nn=0, pos=0; const lost=[];
    for(const k of LOCS){ const r=REC[k][k], c=cells(SRC[k].lines[KX],[]), g=new Set(Object.values(of(NOW.loc[k],k,KX)).filter(v=>typeof v==='string')); tot+=r.length;
      r.forEach((t,i)=>{ if(t==null) return; nn++; if(!g.has(t)&&!ALSO_KX.some(x=>x.loc===k&&x.old===t&&g.has(x.new))) lost.push(k+'#'+i+'：'+t); });   /* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：紀錄上那三格還是舊字，遊戲是後來的新字 */ if(r.length===c.length){ pos++; r.forEach((t,i)=>{ if(t!=null&&t!==c[i]) lost.push(k+'#'+i+' 位置不對：'+t); }); } }
    check('2. 改稿紀錄 kx_D01～D33.json：1,789 格裡有新字的 924 格（AA 交付時寫 923，實際數是 924），每一句都在遊戲裡她那個地點的格子（格數相同的 '+pos+' 個地點逐格對位置）；33 個檔都沒有 for_LAWWW',tot===1789&&nn===924&&pos>=28&&lost.length===0&&LOCS.every(k=>!(REC[k]._meta||{}).for_LAWWW),J([tot,nn,pos,lost.slice(0,4)]));
    const K=NOW.loc.D13.lines[KX], hs=K.hotspots, tx=b=>b.lines.map(l=>l.text).join('｜'); let dn=0, same=0; for(const pid in hs){ const h=hs[pid]; (h.dating||[]).forEach((b,i)=>{ dn++; if(h.normal&&h.normal[i]&&tx(h.normal[i])===tx(b)) same++; }); }
    check('2. D13 淡水：四個互動點的 dating 12 格另外寫了（和同一點的 normal 三格不再一樣）、格子數沒變',dn===12&&same===0&&Object.keys(hs).length===4,J([dn,same]));
    const nn2=[]; const w=o=>{ if(Array.isArray(o)) o.forEach(w); else if(o&&typeof o==='object'){ if(typeof o.text==='string'&&o.who&&o.who!==KX) nn2.push(o.who+':'+o.text); for(const k in o) w(o[k]); } }; w(K);
    check('2. D13 的旁白、備註格沒動：「你等了三分鐘」、「第 3 節她的心願的伏筆」（不顯示）、「她把頭靠過來，又假裝在看河。」、「C2」（不顯示）',J(nn2)===J(['narr:你等了三分鐘','note:第 3 節她的心願的伏筆','narr:她把頭靠過來，又假裝在看河。','note:C2']),J(nn2));
    if(WAS){ let nar=0; for(const k of LOCS){ const g=of(NOW.loc[k],k,KX), o=of(WAS.loc[k],k,KX); for(const p in g) if(/\/text$/.test(p)&&g[p]!==o[p]&&g[p.replace(/text$/,'who')]==='narr') nar++; } console.log('（旁白格——who 是旁白——改了字的 '+nar+' 格，照稿匯）'); } });

  await sec(3,async()=>{ if(!WAS) return;
    const strip=D=>{ const x=JSON.parse(J(D)); delete x.source; if(x.lines){ delete x.lines[KX]; delete x.lines[ZR]; delete x.lines[ZQ]; delete x.lines.heroine_01; } for(const k in x.loc) for(const part of ['lines','likes','dislikeLine']) if(x.loc[k][part]){ delete x.loc[k][part][KX]; delete x.loc[k][part][ZR]; delete x.loc[k][part][ZQ]; delete x.loc[k][part].heroine_01; } return x; };   /* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：芷若拿掉再比；語彤 D15 圍欄那一句同一版改了字，照 ALSO 比 */   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：子晴的格子、短句也拿掉再比（tests/zq_dates_1111_unit.js 另外驗；舊：只拿掉到芷若） */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的格子、短句也拿掉再比（tests/an_dates_1111_unit.js 另外驗；舊：只拿掉到子晴） */
    const yt15=ALSO_YT.map(x=>'/loc/'+x.loc+'/lines/'+x.who+'/'+x.path.replace(/^lines\//,''));
    /* 2026-11-11（AA_780_an_date_followup.json@248c8e390，以安約會台詞匯入以後 AA 的後續改稿）：語彤 flaked[0][0]「那天我等了一下。」換成「嗯。第二次了。」（第二次當天取消的當下說的，沒有人等過）——
       NOW 先用 date_src_sha.js 的 un780 把那一格還原成 AA_767 的字再比（只有那一格現在剛好是 AA_780 的新字才還原），那一格另外驗現在＝新字、重匯以前＝AA_767 的字。舊期望：直接拿 NOW 比 */
    const N7=CS.un780(NOW), F7=CS.FLAKED_780.filter(r=>r.who===YT);
    check('3. AA_780 換的那一格（語彤 flaked[0][0]）：現在是「'+F7.map(r=>r.new).join('')+'」、重匯以前（'+BASE+'）是 AA_767 的「'+F7.map(r=>r.old).join('')+'」；整份還原以後和 NOW 只差 FLAKED_780 那三格（芷若、子晴的那一格在 zr／zq 驗）',F7.length===1&&F7.every(r=>CS.cell780(NOW,r)===r.new&&CS.cell780(WAS,r)===r.old)&&(()=>{ const x=leaves(NOW,'',{}), y=leaves(N7,'',{}); return J(Object.keys(x).filter(p=>x[p]!==y[p]).sort())===J(CS.FLAKED_780.map(r=>r.p).sort()); })());
    const a=leaves(strip(WAS),'',{}), b=leaves(strip(N7),'',{}), ka=Object.keys(a), diff=ka.filter(p=>a[p]!==b[p]).concat(Object.keys(b).filter(p=>!(p in a))).filter(p=>!(yt15.includes(p)&&ALSO_YT.some(x=>a[p]===x.old&&b[p]===x.new)));
    check('3. 別人的格子（芷若、子晴、以安另外驗；語彤 D15 圍欄那一句照 '+ALLOW_SHA+' 的新字）、預約句、交通偏好、互動點（'+ka.length+' 格）和重匯以前（'+BASE+'）完全一樣',ka.length>13500&&diff.length===0,J(diff.slice(0,6).map(p=>p+'：'+a[p]+' → '+b[p])));   /* 2026-11-11（X324 子晴約會台詞重寫）：子晴的四千五百多格拿掉以後格數少了，「至少幾格」跟著降（舊：ka.length>22000）*/   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的四千五百多格拿掉以後格數少了，「至少幾格」跟著降（舊：ka.length>18000） */
    for(const [who,nm] of [[YT,'語彤'],[SIS,'學姊'],[PS,'沛珊']]){ let n=0; const d=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,who), w=of(WAS.loc[k],k,who); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))){ n++; if(g[p]!==w[p]&&!ALSO_YT.some(x=>who===YT&&x.loc===k&&x.path===p&&w[p]===x.old&&g[p]===x.new)) d.push(k+' '+p); } }
      check('3. '+nm+' 33 個地點 '+n+' 格和重匯以前零差異'+(who===YT?'（D15 圍欄那一句照後來的新字）':'')+'；不分地點的短句也一樣'+(who===YT?'（flaked[0][0] 那一格 AA_780 再換，還原再比）':''),n>4000&&d.length===0&&J(N7.lines[who])===J(WAS.lines[who]),J(d.slice(0,4))); }   /* 2026-11-11（AA_780@248c8e390）：短句改比 N7（語彤 flaked[0][0] 還原成 AA_767 的字；那一格上面另外驗）；舊期望 J(NOW.lines[who])===J(WAS.lines[who]) */
    let d3=0; const st=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,KX), w=of(WAS.loc[k],k,KX); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))) if(g[p]!==w[p]) d3++; if(J(Object.keys(g).sort())!==J(Object.keys(w).sort())) st.push(k); }
    check('3. 可昕的格子和重匯以前比：914 格不同；每個地點的格子（選項數、tier、喜好）一樣多',d3===914&&st.length===0,J([d3,st])); });

  await sec(4,async()=>{ const v=DATE.ARRIVE_VAR.find(x=>x.who===KX), F=NOW.loc.D32.lines[KX].arrive.first, T=F.lines.map(x=>x.text);
    check('4. ARRIVE_VAR 可昕 D32（D31＋D32 同一趟）：from 跟著新稿第一次到達的第一句「清境。要開三個多小時，我負責讓你不要睡著。」，對得上資料；to 照 AA 11-11 回 LAWWW 第 4 題的新字「清境。從日月潭上來一個半小時，我本來要睡，結果一路在看路。」（舊：AA_359 5-3「清境。從日月潭上來，一個半小時。我查過了。」）',!!v&&v.loc==='D32'&&J(v.from)===J(['清境。要開三個多小時，我負責讓你不要睡著。'])&&T[0]===v.from[0]&&J(v.to)===J(['清境。從日月潭上來一個半小時，我本來要睡，結果一路在看路。'])&&DATE.ARRIVE_VAR.length===2,J([T,v&&v.from]));
    const t={who:KX,locs:['D32']}, a=DATE.arriveVar({flags:{}},t,F,{combo:true}).lines.map(x=>x.text), b=DATE.arriveVar({flags:{}},t,F,{}).lines.map(x=>x.text);
    check('4. 實際換：同一趟＝第一句換成「從日月潭上來」那一句、第二句照新稿；只去清境＝兩句都照新稿',J(a)===J([v.to[0],T[1]])&&J(b)===J(T)&&T[1]==='這一趟我只排了一件事：看雲。',J([a,b]));
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：S.REMEMBER_IF 拿掉子晴 D06.cafe 那一列（再訪不分第一次選了什麼都聽 remember 的新句、她請；PICK_FLAG 照記 ZQ_D06_TREAT）——REMEMBER_IF 剩 2 筆（子晴 D15、沛珊 D05），D06.cafe 那一列不在。舊期望：REMEMBER_IF 3 筆（子晴 D06／D15、沛珊 D05） */
    check('4. PICK_FLAG、REMEMBER_IF、S.LINE_IF 都沒有可昕的項目（沒有拿她的句子當 key）；PICK_FLAG 3 筆照舊、REMEMBER_IF 2 筆（AA_812@633b7f7d6 拿掉子晴 D06.cafe 那一列）',![].concat(DATE.REMEMBER_IF,DATE.PICK_FLAG).some(x=>x.who===KX)&&!DATE.LINE_IF[KX]&&DATE.PICK_FLAG.length===3&&DATE.REMEMBER_IF.length===2&&!DATE.REMEMBER_IF.some(r=>r.loc==='D06'||r.pid==='D06.cafe'));
    const G=setup('2026-03-27',20,{dating_kexin:true}); know(KX); const seq=[0,1,2,3].map(()=>DATE.lineFor(G,KX,'depart',{who:KX,day:G.day+1}));
    check('4. 出發那一句三句輪流（不看交通）：「我到了。你在哪？」「你不會遲到吧。不會。」「我出門了。你不准比我晚到。」，第四次回到第一句',J(seq.map(x=>x[0]))===J(['我到了。你在哪？','你不會遲到吧。不會。','我出門了。你不准比我晚到。','我到了。你在哪？']),J(seq));
    const code=fs.readdirSync(path.join(H.ROOT,'src')).filter(f=>/\.js$/.test(f)).map(f=>[f,read('src/'+f).replace(/\/\*[\s\S]*?\*\//g,'')]);
    if(WAS){ const olds=new Set(); for(const k of LOCS){ const g=of(NOW.loc[k],k,KX), w=of(WAS.loc[k],k,KX); for(const p in w) if(typeof w[p]==='string'&&/\/(text|t)$/.test(p)&&g[p]!==w[p]&&w[p].replace(/[「」]/g,'').length>=8) olds.add(w[p]); }
      const hit=[]; for(const s of olds) for(const [f,c] of code) if(c.includes(s)) hit.push(f+' '+s);
      check('4. 可昕換掉的舊句、舊選項（八個字以上的 '+olds.size+' 句）沒有留在 src/*.js 的程式裡當比對用的字',olds.size>400&&hit.length===0,J(hit.slice(0,4))); } });

  await sec(5,async()=>{ if(!WAS) return; const opts=[]; let t=0;
    for(const k of LOCS){ const g=of(NOW.loc[k],k,KX), w=of(WAS.loc[k],k,KX); for(const p in g) if(/\/t$/.test(p)){ t++; if(g[p]!==w[p]) opts.push(k+' '+p.replace(/^lines\/hotspots\//,'').replace('/first/choice/','#').replace(/\/t$/,'')+' '+w[p]+'→'+g[p]); } }
    check('5. 可昕的選項（'+t+' 個）換字 20 個',opts.length===20,J(opts.length));
    check('5. 換字的選項抽五個照稿：D02 花園②「噴水池也不錯。」、D12 夕陽②「山上的也很好。」、D19 觀景台②「哪一邊是妳？」、D29 港邊②「看船。」、D32 小攤②「妳會煮嗎？」',['D02 D02.garden#1 「五分鐘太快了。」→「噴水池也不錯。」','D12 D12.sunset#1 「木柵大學的也很好。」→「山上的也很好。」','D19 D19.view#1 「哪一邊是木柵大學？」→「哪一邊是妳？」','D29 D29.harbor#1 「看夕陽。」→「看船。」','D32 D32.stall#1 「今天不記帳。」→「妳會煮嗎？」'].every(x=>opts.includes(x)),J(opts.slice(0,3)));
    const treat=D=>LOCS.reduce((a,k)=>{ const hs=D.loc[k].lines[KX].hotspots||{}; for(const pid in hs) for(const c of ((hs[pid].first||{}).choice||[])) if(DATE.isTreat(c.t)) a.push(pid+c.t); return a; },[]);
    check('5. 請客的選項（DATE.isTreat 看選項的字）和重匯以前同一組',J(treat(NOW))===J(treat(WAS)),J([treat(NOW),treat(WAS)]));
    const a5=read('src/aa524_3d.js'); check('5. aa524_3d.js 的 remember 多一句只有芷若 D04、語彤 D10 兩筆，沒有可昕',(a5.match(/\{key:'[a-z0-9]+',loc:'D\d\d',who:'/g)||[]).length===2&&!/loc:'D\d\d',who:'kexin'/.test(a5)); });

  await sec(6,async()=>{ const LK=NOW.lines[KX];
    check('6. lines.kexin 七格照稿：move3「第三次了。再改，我就自己去。」、transport「好啦，你開車。開太快我會講。」、flaked「我等了四十分鐘。」「你欠我一個解釋，還有一頓飯。」、depart 第三句「我出門了。你不准比我晚到。」、enough 第二句「我腳痠了。再走我會開始找你麻煩。」、leaveEarly「來了就走？好吧。你欠我一次。」',J(LK.move3)===J(['第三次了。再改，我就自己去。'])&&J(LK.transport)===J(['好啦，你開車。開太快我會講。'])&&J(LK.flaked)===J([['我等了四十分鐘。','你欠我一個解釋，還有一頓飯。']])&&LK.depart[2]==='我出門了。你不准比我晚到。'&&LK.enough[1]==='我腳痠了。再走我會開始找你麻煩。'&&J(LK.leaveEarly)===J(['來了就走？好吧。你欠我一次。']),J(LK));
    check('6. 不改的照舊：accept 兩句、acceptDating、move 兩句、cancel 兩句、depart 前兩句、enough 第一句、noPair',J(LK.accept)===J(['好。我記到行程表上了。','好啊。幾點，我排一下。'])&&J(LK.acceptDating)===J(['好。那天我什麼都不排。'])&&J(LK.move)===J(['好，新的時間收到。','可以。下雨也照去喔。'])&&J(LK.cancel)===J(['好。下次。','好。我去找予樂吃宵夜。'])&&J(LK.depart.slice(0,2))===J(['我到了。你在哪？','你不會遲到吧。不會。'])&&LK.enough[0]==='好，我沒電了。手機。我也是。'&&J(LK.noPair)===J(['先不要。等我們又是那樣了。']));
    check('6. date3d.js S.MORNING 可昕：AA_769「第二天的我昨天重排了。你先看，有意見現在講。」之後 AA_921 §3-1 再換成「'+CS.MORNING921_1112.new+'」（CANON-NO-ECON-1112 第五批）；舊句不在程式裡',CS.MORNING921_1112.old==='第二天的我昨天重排了。你先看，有意見現在講。'&&DATE.MORNING[KX]===CS.MORNING921_1112.new&&!read('src/date3d.js').replace(/\/\*[\s\S]*?\*\//g,'').includes(CS.MORNING921_1112.old)&&!read('src/date3d.js').replace(/\/\*[\s\S]*?\*\//g,'').includes('行程表我昨天晚上重寫了'),DATE.MORNING[KX]);
    const raw=show(SHA,SP+'AA_769_kx_date_common.json'), A=raw?JSON.parse(raw):null;
    const get=(o,pth)=>pth.match(/\[\d+\]|[^.\[\]]+/g).reduce((x,t)=>x==null?x:x[t[0]==='['?+t.slice(1,-1):t],o);
    if(A){ const r1=A.rows.filter(r=>r.file==='src/data/date_lines.js'), r2=A.rows.filter(r=>r.file==='src/date3d.js');
      check('6. 逐字：稿 8 列（date_lines.js 七列、date3d.js 一列）；每一列的 new 在 path 那一格',A.rows.length===8&&r1.length===7&&r2.length===1&&r1.every(r=>get(NOW,r.path)===r.new)&&r2[0].path==='S.MORNING.kexin'&&DATE.MORNING[KX]===(r2[0].new===CS.MORNING921_1112.old?CS.MORNING921_1112.new:r2[0].new)/* 2026-11-12 第五批：AA_921 再換 */,J(r1.filter(r=>get(NOW,r.path)!==r.new).map(r=>r.path)));
      check('6. 過夜晚上那一列（D29＋可昕＝她回家）寫在這份稿的 for_LAWWW',String((A._meta||{}).for_LAWWW||'').includes('D29＋kexin＝「（晚上她回家。你住在車站附近的旅館。）」'));
      if(WAS){ const a=leaves(WAS.lines[KX],'',{}), b=leaves(LK,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]).sort();
        check('6. lines.kexin 和重匯以前比：格子一樣多、只有這七格不同（照 path；old 就是原本那一格的字）',J(Object.keys(a))===J(Object.keys(b))&&J(d)===J(['/depart/2','/enough/1','/flaked/0/0','/flaked/0/1','/leaveEarly/0','/move3/0','/transport/0'])&&r1.every(r=>{ const o=get(WAS,r.path); return o===r.old||o===r.old.replace(/^……/,''); }),J(d));
        const cnt=D=>{ const x=JSON.parse(J(D)); delete x.lines[KX]; delete x.lines[ZQ]; delete x.lines.heroine_01; return J(x).split('第二次了。').length-1; };   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：子晴放鴿子那一句（原「第二次了。我記下來了。」）照 AA_775 換了，她的短句拿掉再數 */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安放鴿子那一則（原「第二次了。」）照 AA_777 換了，她的短句拿掉再數 */
        /* 2026-11-11（AA_780_an_date_followup.json@248c8e390）：語彤 flaked[0][0] 換成「嗯。第二次了。」＝別人的格子多一處——先用 un780 還原那一格再數（要和重匯以前一樣），沒還原的剛好多一處。舊期望：cnt(NOW)===cnt(WAS) */
        const N7=CS.un780(NOW);
        check('6. 「第二次了。」在別人的格子裡的次數和重匯以前一樣（'+cnt(N7)+' 處；只換她放鴿子那一格；AA_780 語彤 flaked[0][0]「嗯。第二次了。」另外多 1 處＝'+cnt(NOW)+' 處）',cnt(N7)===cnt(WAS)&&cnt(NOW)===cnt(WAS)+1&&cnt(N7)>=3&&!J(LK).includes('第二次了。'),J([cnt(NOW),cnt(N7),cnt(WAS)])); } }   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的短句拿掉以後少一處（舊：>=4） */
    /* transport 那一句什麼時候播：她有交通偏好的地點、玩家改掉（prefOff）。可昕只有 D25 外澳、D30 七星潭有偏好（台鐵），這兩個地點另一種交通都只有開車 */
    const P=NOW.prefs[KX]||{}, modes=k=>(DATE.loc(k).transport||[]).map(x=>x.mode);
    check('6. 可昕有交通偏好的地點只有 D25、D30（都想搭火車），這兩個地點另一種走法都只有開車——所以「好啦，你開車。開太快我會講。」只會在改成開車時播',J(Object.keys(P).sort())===J(['D25','D30'])&&Object.keys(P).every(k=>P[k].transport==='rail'&&J(modes(k).filter(m=>m!=='rail'))===J(['car']))&&!LOCS.some(k=>!P[k]&&DATE.prefOf(KX,k)),J([P,modes('D25'),modes('D30')]));
    const TL='好啦，你開車。開太快我會講。', res=[];
    for(const [loc,mode,ov] of [['D30','開車',true],['D30','台鐵',true],['D25','開車',false],['D25','台鐵',false],['D29','開車',true],['D29','高鐵',true]]){ const G=setup('2026-03-27',20,{dating_kexin:true}); know(KX); H.said=[]; H.opts=[]; H.picks=(ov?['兩天一夜…']:[]).concat([DATE.loc(loc).name,mode,'明天','09:00','就這樣約']);
      const t=await DATE.menu(GM,KX,null), L=H.said.map(s=>s.t); res.push([loc,mode,!!(t&&t.ok),t&&t.transport,t&&t.kind,L.includes(TL)]); }
    check('6. 實際約一次（選單）：D30 花蓮（兩天一夜）改開車＝她說這一句、照她的搭火車＝不說；D25 外澳（當天來回）改開車＝說、搭火車＝不說；D29 高雄（她沒有偏好）開車、高鐵都不說',J(res)===J([['D30','開車',true,'car','overnight',true],['D30','台鐵',true,'rail','overnight',false],['D25','開車',true,'car','day',true],['D25','台鐵',true,'rail','day',false],['D29','開車',true,'car','overnight',false],['D29','高鐵',true,'hsr','overnight',false]]),J(res)); });

  await sec(7,async()=>{ const W=DW(read('src/data/date_wish.js')), ev=W.events[KX], TPL='不行，火車有時間。{出發時間}，車站見。', BACK='不行，火車有時間。九點，台北車站。';
    check('7. date_wish.js 的來源寫著「AA_770@'+SHA+'（可昕 D25 心願 23 列，換了 23 列）」；可昕的事件 id、地點 D25、她約的時間（週六 9:00、火車）照舊',W.source.includes('AA_770@'+SHA+'（可昕 D25 心願 23 列，換了 19 列；源稿重寫成新主題跳過 4 列）')/* 2026-11-12（CANON-NO-ECON-1112 第五批，wish_bb.json@6dbfe10d7e，AA_921 第 2 節）：23 列裡 4 格源稿重寫成「手機關掉的一天」、照源稿。舊期望「換了 23 列」 */&&ev.id==='wish_kexin'&&ev.loc==='D25'&&ev.herInvite.dateTime===9&&J(ev.herInvite.dateWeekday)===J([6])&&ev.herInvite.transport==='train',W.source.slice(-60));
    check('7. 她開口約、玩家答應以後兩句：「好。那我們連集合時間都不要約。」「'+TPL+'」',J(ev.herInvite.accept.map(x=>x.text))===J(['好。那我們連集合時間都不要約。',TPL]));
    const raw=show(SHA,SP+'AA_770_kx_wish.json'), A=raw?JSON.parse(raw):null;
    const get=(o,pth)=>{ let x=o; for(const m of pth.matchAll(/\["([^"]+)"\]|\.?([^.\[\]"]+)|\[(\d+)\]/g)){ if(x==null) return x; x=x[m[1]!=null?m[1]:(m[2]!=null?m[2]:+m[3])]; } return x&&typeof x==='object'?x.text:x; };
    const K921=require('./date_src_sha.js').WISH921_1112.filter(r=>r.p.startsWith('/events/kexin/')), SK921=['hotspots["D25.surf"].choices[1].reply[0]','hotspots["D25.station"].choices[1].reply[0]','closing.choices[0].reply[0]','closing.ending[1].lines[1]'];   /* 2026-11-12（CANON-NO-ECON-1112 第五批）：源稿重寫的那 4 格認源稿的字（WISH921_1112）。舊期望：23 列都是 new */
    if(A){ check('7. 逐字：稿 23 列，19 列 path 那一格現在是 new；4 列源稿重寫成新主題（'+SK921.length+' 格＝WISH921_1112 的新字）',A.rows.length===23&&A.rows.every(r=>SK921.includes(r.path)?get(ev,r.path)!==r.new&&K921.some(k=>k.new===get(ev,r.path)):get(ev,r.path)===r.new),J(A.rows.filter(r=>SK921.includes(r.path)?get(ev,r.path)===r.new:get(ev,r.path)!==r.new).map(r=>r.path)));
      const tmp=path.join(os.tmpdir(),'date_wish_kx1111_'+process.pid+'.js'); let ok=false, out='';
      try{ out=cp.execFileSync('python3',['tools/date/import_wish.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_wish.js'); }catch(x){ out=String(x.stderr||x.stdout||x.message).slice(0,300); }
      try{ fs.unlinkSync(tmp); }catch(x){}
      check('7. tools/date/import_wish.py 重匯（--out 另存）的結果和 src/data/date_wish.js 一樣',ok,ok?'':out.slice(0,300)); }
    const ow=show(BASE,'src/data/date_wish.js'); if(ow){ const O=DW(ow), ids=Object.keys(O.events).filter(k=>k!==KX&&k!==ZR&&k!==ZQ&&k!=='heroine_01'), a=leaves(O.events[KX],'',{}), b=leaves(ev,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]);   /* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：芷若的心願事件照 AA_774 收字 27 格（tests/zr_dates_1111_unit.js 第 7 節另外驗），拿掉再比 */   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：子晴的心願事件照 AA_776 收字 30 格，拿掉再比 */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的心願事件照 AA_778 收字 16 格，拿掉再比 */
      check('7. 別人的心願事件（'+ids.length+' 位，含語彤、學姊、沛珊；芷若另外驗）和重匯以前（'+BASE+'）一樣；hold、verify.miss 照舊是空的',ids.length===3&&ids.every(k=>J(O.events[k])===J(require('./date_src_sha.js').unWish921(JSON.parse(J(W))).events[k]))/* 2026-11-12（CANON-NO-ECON-1112 第五批）：可昕心願換主題、沛珊說明欄四格（date_src_sha.js WISH921_1112）先還原再比 */&&J(O.hold)===J(W.hold)&&W.verify.miss.length===0);   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：別人剩 4 位（舊：5 位） */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：別人剩 3 位（語彤、學姊、沛珊；舊：4 位） */
      const b0=leaves(require('./date_src_sha.js').unWish921(JSON.parse(J(W))).events[KX],'',{}), d0=Object.keys(b0).filter(k=>a[k]!==b0[k]);   /* 2026-11-12（CANON-NO-ECON-1112 第五批）：可昕心願換主題 25 格（WISH921_1112）先還原再比 */
      check('7. 可昕的事件和重匯以前比（第五批換主題那 25 格還原以後）：格子一樣多、不一樣的 23 格都是台詞的 text（選項的字、條件、時間、交通沒動）',J(Object.keys(a))===J(Object.keys(b0))&&d0.length===23&&d0.every(k=>/\/text$/.test(k))&&(!A||A.rows.every(r=>get(O.events[KX],r.path)===r.old)),J(d0.filter(k=>!/\/text$/.test(k)))); }
    /* {出發時間}：src/wish3d.js 的 S.fill */
    const f9=WISH.fill(TPL,{depart:9}), f95=WISH.fill(TPL,{depart:9.5}), f0=WISH.fill(TPL), fn=WISH.fill(TPL,{}), fu=WISH.fill(TPL,{depart:null});
    check('7. 有出發時間→印出時間：9 點＝「不行，火車有時間。09:00，車站見。」、9 點半＝「…09:30，車站見。」',f9==='不行，火車有時間。09:00，車站見。'&&f95==='不行，火車有時間。09:30，車站見。',J([f9,f95]));
    check('7. 帶不到出發時間（沒傳、空的、null）→退回 AA 指定的「'+BACK+'」',f0===BACK&&fn===BACK&&fu===BACK,J([f0,fn,fu]));
    check('7. 兩種都沒有大括號',![f9,f95,f0,fn,fu].some(t=>/[{}]/.test(t)));
    check('7. 語彤那一句照舊：有出發時間「那就15:00。」（退路句只有可昕這一句有，AA 指定的）',WISH.fill('那就{出發時間}。',{depart:15})==='那就15:00。'&&J(Object.keys(WISH.NO_DEPART))===J([TPL])&&WISH.NO_DEPART[TPL]===BACK);
    /* 實際播的時候有沒有帶出發時間：她主動約（S.askRule）→ 玩家答應 → 手機那兩則 */
    const wc=read('src/wish3d.js'); check('7. 這一句只有一個地方播：S.askRule 的「答應」，帶那一趟的出發時間（o＝{depart}，depart＝S.departOf(…) 一定是數字）',(wc.match(/I\.accept/g)||[]).length===1&&wc.includes("const o={depart}, base=")&&wc.includes("say:spoken(I.accept).map(l=>P_(id,l.text,o))")&&typeof WISH.departOf(9,0)==='number'&&typeof WISH.departOf(undefined,0)==='number'&&typeof WISH.departOf('sunset-2',0)==='number');
    { const G=setup('2026-04-29',21.5,{}); know(KX); H.date(KX); G.events.done.ev_kexin_trip_spring_y1=true; G.money=8000; WISH.learn&&0;
      let sent=false, acc=[]; try{ if(WISH.known&&!WISH.known(G,KX)&&WISH.learn) WISH.learn(G,KX); sent=WISH.askRule(G,KX); PHONE.tick(G);
        const a=(PHONE.rec(G).q||[]).concat(G.msgs||[]); const ask=(()=>{ let r=null; const w=o=>{ if(!o||typeof o!=='object') return; if(o.ask&&o.ask.opts) r=o.ask; for(const k in o) w(o[k]); }; w(PHONE.rec(G)); w(G.msgs); return r; })(); acc=ask?ask.opts[0].say.map(x=>x.text):[]; }catch(e){ acc=['（例外）'+String(e.message)]; }
      check('7. 實際演：2026-04-29（三）晚上她傳訊息約週六去外澳 → 「答應」要回的兩則＝「好。那我們連集合時間都不要約。」「不行，火車有時間。09:00，車站見。」（沒有大括號）',sent===true&&J(acc)===J(['好。那我們連集合時間都不要約。','不行，火車有時間。09:00，車站見。'])&&!acc.some(t=>/[{}]/.test(t)),J([sent,acc])); } });

  await sec(8,async()=>{ const HOME='（晚上她回家。你住在車站附近的旅館。）';
    check('8. S.NIGHT 四種照舊；S.NIGHT_HOME 第一列：D29 高雄＋可昕（第二列 D26 臺中＋子晴、第三列 D26 臺中＋以安）',DATE.NIGHT.home===HOME&&Object.keys(DATE.NIGHT).length===4&&J(DATE.NIGHT_HOME)===J([{loc:'D29',who:KX},{loc:'D26',who:ZQ},{loc:'D26',who:'heroine_01'}])&&DATE.loc('D29').name.includes('高雄'),J(DATE.NIGHT_HOME));   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：S.NIGHT_HOME 多一列 D26＋子晴（舊期望：只有 D29＋可昕一列） */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：S.NIGHT_HOME 再多一列 D26＋以安（舊期望：兩列） */
    const nk=(who,loc,own,dt)=>DATE.nightKind({flags:dt?{['dating_'+who]:true}:{}},{who,locs:[loc]},own);
    check('8. nightKind：可昕 D29＝home（交往中、沒交往都一樣）；可昕去別的地點、別人去 D29 照舊（交往中＝民宿、沒交往＝兩間房）；原本的 own home／rent 照舊',nk(KX,'D29',null,true)==='home'&&nk(KX,'D29',null,false)==='home'&&nk(KX,'D28',null,true)==='dating'&&nk(KX,'D30',null,false)==='single'&&nk('heroine_04','D29',null,true)==='dating'&&nk('heroine_04','D29',null,false)==='single'&&nk('heroine_01','D26','home',true)==='home'&&nk(PS,'D28','rent',false)==='rent');
    const go=async(who,loc)=>{ const G=setup('2026-03-27',20,{['dating_'+who]:true}); know(who); const day=G.day+1, tr=(DATE.loc(loc).transport||[])[0].mode, b=DATE.book(G,{who,locs:[loc],transport:tr,day,depart:9,kind:'overnight',by:'player'}); if(!b.ok) return {b};
      const q=OUT.get(G,'date_'+b.trip); G.day=day; G.weekday=(G.weekday+1)%7; G.hour=9; H.said=[]; H.opts=[]; GM._reset(); H.picks=['出發']; await OUT.prompt(GM,q); return {b,t:DATE.trip(G,b.trip),L:H.said.map(s=>s.t)}; };
    const r1=await go(KX,'D29'), r2=await go(KX,'D28'), r3=await go('heroine_04','D29');
    check('8. 實際演：和可昕去高雄駁二兩天一夜，第一天晚上旁白「'+HOME+'」（只有這一句晚上的旁白），第二天早上「（第二天早上。）」＋她早上那一句（AA_921 §3-1：「'+CS.MORNING921_1112.new+'」）',!!r1.t&&r1.t.night==='home'&&r1.L.includes(HOME)&&r1.L.filter(x=>/^（晚上/.test(x)).length===1&&r1.L[r1.L.indexOf('（第二天早上。）')+1]===DATE.MORNING[KX],J((r1.L||[]).filter(x=>/晚上|早上/.test(x))));
    check('8. 對照：和可昕去臺南（D28）＝民宿那一句；和子晴去高雄（D29）＝民宿那一句（不是她的老家）',!!r2.t&&r2.t.night==='dating'&&r2.L.includes(DATE.NIGHT.dating)&&!r2.L.includes(HOME)&&!!r3.t&&r3.t.night==='dating'&&!r3.L.includes(HOME),J([r2.t&&r2.t.night,r3.t&&r3.t.night,r3.b&&r3.b.why])); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
