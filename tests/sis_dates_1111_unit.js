// 學姊校外約會＋心願重寫（DLG-FULL-REVIEW-1110；使用者 X324；2026-11-11）——不需要瀏覽器（D131）。
//   約會源稿 date_system/lines/D01～D33.json@82c946ad7（同一批檔：學姊 705 格、沛珊 D29 兩格＋D30 一格）、AA_764_sis_wish.json@82c946ad7、AA_765_sis_date_common.json@808a6d846
//   1. 白名單；import_date_lines.py 重匯（--out）一樣；修正層跳過的學姊的列（AA 指明不套的四列、AA_598 原句對不到的、AA_694 第 3 節跟著跳過的）
//   2. 學姊 33 個地點的格子：和源稿一字不差——新稿沒動的格（源稿和上一版 2883197b6 一樣）照舊疊著先前的修正（AA_598 等），和重匯以前一樣
//   3. 別人的格子和重匯以前（BASE）一樣；沛珊只多改三格、和源稿一樣
//   4. date3d.js S.MORNING 學姊那一句；ARRIVE_VAR／REMEMBER_IF／PICK_FLAG 沒有用到學姊的句子、原本的三處都還對得上資料
//   5. {name}：學姊的格裡只以「林{name}」或「{name}」出現，沒有「林林」；選項換字五格照稿；保溫瓶只留 D02、D09、D13
//   6. AA_764：date_wish.js 學姊的事件＝稿的 wish_event、rows 32 列；別人不動；import_wish.py 重匯一樣
//   7. AA_765：lines.heroine_05 四列照稿、每一種句數不變、別人不動
// 稿、BASE 讀 git show；讀不到（淺層複本）＝不比稿，只驗結構。用法：node tests/sis_dates_1111_unit.js
const M959=require('./aa959_map.js');   /* AA_959（DLG-FULL-REVIEW-1110）：遊戲的 date_lines 先照覆寫表換回舊字再比（AA_959 本身逐列驗在 tests/aa959_overlay_unit.js）*/
const H=require('./pg_harness.js');
const {check}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), os=require('os');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
/* 2026-11-11（X324 語彤約會台詞重寫，AA 0a2136911）：白名單 D01～D33 改認 0a2136911——同一版學姊 34 格把遊戲裡原本疊著的修正（AA_598 等）寫回源稿，匯入結果對學姊零差異。
   這支跟著改：源稿讀 0a2136911（SHA）；學姊重寫的那一版 82c946ad7（SIS_SHA）留在 history；語彤的格子、她不分地點的短句另外驗（tests/yt_dates_1111_unit.js），這裡比別人時拿掉 */
/* 2026-11-11（X324 可昕約會台詞重寫，AA f9c1a2b80）：白名單 D01～D33 再改認 f9c1a2b80（只動可昕的格子；學姊的格子和 0a2136911 一樣）——源稿讀 f9c1a2b80；可昕的格子、短句、心願事件、早上那一句另外驗（tests/kx_dates_1111_unit.js），這裡比別人時拿掉 */
/* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：白名單 D01～D33 再改認 a29a8aba0（芷若的格子重寫；學姊的格子不變）——源稿、白名單改讀 tests/date_src_sha.js 的 ALLOW_SHA（以後換版只改那一處）；
   芷若的格子、短句、心願事件另外驗（tests/zr_dates_1111_unit.js），這裡比別人時拿掉 */
const KX='kexin', ZR='heroine_02', ZQ='heroine_04';
const SIS='heroine_05', PS='classmate_peishan', YT='heroine_03', SHA=require('./date_src_sha.js').ALLOW_SHA, SIS_SHA='82c946ad7', PREV='2883197b6', BASE='082b6dcbf', SP='docs/story_planning/';
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
const read=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const DW=t=>JSON.parse(t.slice(t.indexOf('const DATE_WISH=')+16,t.lastIndexOf(';')));
const LOCS=Array.from({length:33},(_,k)=>'D'+String(k+1).padStart(2,'0'));
const leaves=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>leaves(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) leaves(x[k],p+'/'+k,o); else o[p]=x; return o; };
const of=(D,k,who)=>{ const o={}; for(const part of ['lines','likes','dislikeLine']) if(D[part]&&D[part][who]!=null) leaves(D[part][who],part,o); return o; };
const sortJ=o=>J(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((a,x)=>(a[x]=v[x],a),{}):v);
/* 2026-11-11（AA_812@f1fab0ec6）：懸著的「下次我請」七格（date_src_sha.js 的 CELLS_812：學姊、子晴 D06.cafe remember，沛珊 D15.store、D21.street，可昕 D15 收尾，子晴 D06 第一次選項的回覆，語彤 D10.boat remember）
   是匯入工具最後一步疊上去的（改稿紀錄 date_rewrite/ 和稿的 path_rows；源稿 Dxx.json 沒有重新 apply）——這支的逐字對稿、和重匯以前比，NOW 先用 un812 把那七格還原成舊字再比
   （只有那一格現在剛好是新字才還原，不是＝照舊會紅）；那七格現在＝新字下面另外驗（逐格、她請客在 tests/date_she_pays_812_1111_unit.js）。舊期望：直接拿 NOW 比 */
const NOW812=M959.unmapDeep(DL(read('src/data/date_lines.js')),'date_lines.js'), NOW=require('./date_src_sha.js').un812(NOW812);
check('0. AA_812 那七格（CELLS_812）現在是新字（還原成舊字以後才拿 NOW 和源稿、重匯以前比）',require('./date_src_sha.js').CELLS_812.length===7&&require('./date_src_sha.js').CELLS_812.every(r=>require('./date_src_sha.js').cell812(NOW812,r)===(r.now||r.new)&&require('./date_src_sha.js').cell812(NOW,r)===r.old),JSON.stringify(require('./date_src_sha.js').CELLS_812.map(r=>require('./date_src_sha.js').cell812(NOW812,r))));   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：第六格（子晴 D06.cafe 第一次選項的回覆）AA 在 AA_846 late_fix 改回「下次我請你吃滷味。」，AA_812 path_rows 那一列被取代（import_date_lines.py SUPER812）——那一格現在認 CELLS_812 的 now。舊期望：七格都＝r.new */
const SRC={}, OLDSRC={}; for(const k of LOCS){ const t=show(SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=require('./date_src_sha.js').src248(k,JSON.parse(t));   /* 2026-11-12（X324 學姊續改 AA_837＋AA_838@a573a50dca）：源稿學姊又改 78 格、D01 交往到達多一套——這一支驗的是 82c946ad7 那一輪，源稿用 src248、遊戲用 un812 都還原成改以前的字再比（那 78 格在 tests/sis_dates_1112_unit.js 逐格驗）。舊寫法：noFx(JSON.parse(t)) */   /* 52c3ee258 起源稿有 fx：只比字（date_src_sha.js noFx） */ if(u) OLDSRC[k]=JSON.parse(u); }
const haveSrc=Object.keys(SRC).length===33&&Object.keys(OLDSRC).length===33;
const ob=show(BASE,'src/data/date_lines.js'), WAS=ob?DL(ob):null;

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
    const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===SHA&&e[0].status==='approved'&&(e[0].history||[]).some(h=>h.sha===PREV)&&(e[0].history||[]).some(h=>h.sha===SIS_SHA)); });
    check('1. 白名單 D01～D33 都是 '+SHA+'、approved，學姊重寫的 '+SIS_SHA+'、再上一版 '+PREV+' 留在 history',bad.length===0,J(bad));
    const w=allow.filter(x=>x.path===SP+'AA_764_sis_wish.json'), c=allow.filter(x=>x.path===SP+'AA_765_sis_date_common.json');
    check('1. 白名單 AA_764_sis_wish.json@82c946ad7、AA_765_sis_date_common.json@808a6d846 各一筆、approved',w.length===1&&w[0].sha==='82c946ad7'&&w[0].status==='approved'&&c.length===1&&c[0].sha==='808a6d846'&&c[0].status==='approved');
    check('1. date_lines.js 的來源寫著 33 個地點 @'+SHA+' 和 AA_765@808a6d846',LOCS.every(k=>NOW.source.includes(k+'.json@'+SHA))&&NOW.source.includes('AA_765_sis_date_common.json@808a6d846'));
    console.log(haveSrc&&WAS?'（稿和 BASE 都讀得到：逐字比對）':'（這份 checkout 讀不到企劃線的稿或 BASE：不比稿，只驗結構）');
    if(haveSrc){ const tmp=path.join(os.tmpdir(),'date_lines_sis1111_'+process.pid+'.js'); let out='', ok=false;
      try{ out=cp.execFileSync('python3',['tools/date/import_date_lines.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<26}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_lines.js'); }catch(e){ out=String(e.stderr||e.stdout||e.message).slice(0,300); }
      try{ fs.unlinkSync(tmp); }catch(e){}
      check('1. tools/date/import_date_lines.py 重匯（--out 另存）的結果和 src/data/date_lines.js 一樣',ok,ok?'':out.slice(0,300));
      const m=/學姊重寫（DLG-FULL-REVIEW-1110）跳過的改句 (\d+) 列：(.*)/.exec(out)||[], sk=String(m[2]||'').split('；');
      const drop=sk.filter(x=>x.includes('AA 指明新稿不用再套')), a598=sk.filter(x=>x.startsWith('AA_598 ')), a694=sk.filter(x=>x.startsWith('AA_694 ')), rest=sk.filter(x=>!drop.includes(x)&&!a598.includes(x)&&!a694.includes(x));
      check('1. 學姊跳過的列：AA 指明不再套的剛好四列（AA_359 5-2 的 D31、D32；5-3 的 D26、D32）',drop.length===4&&['AA_359 5-2 D31','AA_359 5-2 D32','AA_359 5-3 D26','AA_359 5-3 D32'].every(t=>drop.some(x=>x.startsWith(t+'「'))),J(drop));
      /* 2026-11-11（0a2136911）：原本「其他 38 列照舊換」裡的 34 列源稿自己寫好了（已經是新句），剩 4 列照舊換；跳過的 55 列、AA_694 的 22 列不變 */
      check('1. AA_598 逐句表 93 列：原句對不到（那一格新稿重寫了）跳過 65 列、27 列源稿已經是新句（0a2136911 寫回源稿的 34 列裡 a573a50dca 重寫了 5 列、41f77eab53 再重寫 2 列）、其他 1 列照舊換；AA_694 第 3 節跟著跳過的 26 列都是學姊重寫掉的句子；沒有別種跳過',a598.length===65&&a598.every(x=>x.includes('原句對不到'))&&a694.length===26&&a694.every(x=>x.includes('學姊的句子，新稿重寫了'))&&rest.length===0&&+m[1]===95&&/換 1 句、已經是新句 27 句、源稿重寫了跳過 65 句（共 93 列）/.test(out),J([a598.length,a694.length,rest,m[1]]));   /* 2026-11-12（X324 學姊續改 AA_837＋AA_838@a573a50dca）：AA_598 逐句表第 11、30、41、45、57 列（D09 茶、D18 到達、D23 到達、D24 公園、D30 石頭）那五格這一版重寫了。舊期望：跳過 55 列、已經是新句 34 句、一共 81 列 */   /* 2026-11-12（X324「好」開頭回話 AA_842@41f77eab53）：學姊跳過的列 86→95——AA_598 逐句表第 19、33、44、46、55 列（D11 圖書館、D19 木屋、D24 泡腳／車站、D29 鐵道第一次選項的回話，原句都是「好。…」開頭）那五格這一版重寫了（換 4→1、已經是新句 29→27、跳過 60→65），AA_694 第 3 節第 162、195、196、238 列跟著跳過（22→26）。舊期望：AA_598 跳過 60 列、已經是新句 29 句、換 4 列、AA_694 跟著跳過 22 列、一共 86 列 */
      check('1. 沛珊跳過的列照舊 11 列（這一輪沒有多、沒有少）',/沛珊重寫（PEISHAN-VOICE-1110）跳過的改句 11 列/.test(out)); }
    const tool=read('tools/date/import_date_lines.py');
    check('1. 工具只對沛珊、學姊（2026-11-11 起加語彤，X324）放寬（ps_skip 先看 who；別人的列照舊 sys.exit）',/if who not in \(PS, SIS, YT, KX, ZR, ZQ, AN\) or not ps756\(loc, who\):\s+return False/.test(tool)&&tool.includes("SIS_DROP = {('AA_359 5-2', 'D31'), ('AA_359 5-2', 'D32'), ('AA_359 5-3', 'D26'), ('AA_359 5-3', 'D32')}")&&tool.includes("sys.exit(f'{tag598} 第 {item} 列：{loc} 學姊的台詞裡")); });   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：工具也對子晴放寬（舊：到 ZR 為止） */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：工具也對以安放寬（舊：到 ZQ 為止） */

  await sec(2,async()=>{ if(!haveSrc||!WAS){ for(const k of LOCS) check('2. '+k+'：學姊有台詞',!!(NOW.loc[k].lines&&NOW.loc[k].lines[SIS])); return; }
    let n=0, same=0; const keep=[], bad=[];
    for(const k of LOCS){ const g=of(NOW.loc[k],k,SIS), s=of(SRC[k],k,SIS), o=of(OLDSRC[k],k,SIS), w=of(WAS.loc[k],k,SIS);
      if(J(Object.keys(g).sort())!==J(Object.keys(s).sort())) bad.push(k+'：格子不一樣多');
      for(const p in s){ n++; if(g[p]===s[p]){ same++; continue; } if(s[p]===o[p]&&g[p]===w[p]) keep.push(k+' '+p); else bad.push(k+' '+p+'：稿「'+s[p]+'」遊戲「'+g[p]+'」'); } }
    check('2. 學姊 33 個地點 '+n+' 格：和源稿 '+SHA+' 一字不差的 '+same+' 格；其餘 '+keep.length+' 格是新稿沒動的格（源稿和 '+PREV+' 一樣），照舊疊著先前的修正、和重匯以前一樣；沒有第三種',n>4000&&bad.length===0&&same+keep.length===n,J(bad.slice(0,6)));
    /* 2026-11-11（0a2136911）：原本 35 格（34 格是字）——那 34 格 AA 寫回源稿了，現在和源稿一字不差；只剩 D13 合照那句「第 6 階以上」改成註記的 1 格 */
    check('2. 「和源稿不同、照舊疊修正」的格只剩 1 格（D13 合照那句「第 6 階以上」改成註記）；原本另外 34 格是字的，0a2136911 寫回源稿了',keep.length===1&&keep.filter(x=>/\/who$/.test(x)).length===1,J(keep));
    let ch=0; for(const k of LOCS){ const s=of(SRC[k],k,SIS), o=of(OLDSRC[k],k,SIS), g=of(NOW.loc[k],k,SIS); for(const p in s) if(s[p]!==o[p]){ ch++; if(g[p]!==s[p]) bad.push('重寫的格沒照稿：'+k+' '+p); } }
    check('2. 新稿和 '+PREV+' 不同的 739 格（82c946ad7 重寫的 705 格＋0a2136911 寫回源稿的 34 格）每一格都照稿',ch===739&&bad.length===0,J([ch,bad.slice(0,4)])); });

  await sec(3,async()=>{ if(!WAS) return;
    const strip=D=>{ const x=JSON.parse(J(D)); delete x.source; if(x.lines){ delete x.lines[SIS]; delete x.lines[YT]; delete x.lines[KX]; delete x.lines[ZR]; delete x.lines[ZQ]; delete x.lines.heroine_01; } for(const k in x.loc) for(const part of ['lines','likes','dislikeLine']) if(x.loc[k][part]){ delete x.loc[k][part][SIS]; delete x.loc[k][part][PS]; delete x.loc[k][part][YT]; delete x.loc[k][part][KX]; delete x.loc[k][part][ZR]; delete x.loc[k][part][ZQ]; delete x.loc[k][part].heroine_01; } return x; };   /* 2026-11-11：語彤的格子、短句 X324 重寫了（tests/yt_dates_1111_unit.js 另外驗），拿掉再比 */   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：子晴的格子、短句也拿掉再比（tests/zq_dates_1111_unit.js 另外驗；舊：只拿掉到芷若） */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的格子、短句也拿掉再比（tests/an_dates_1111_unit.js 另外驗；舊：只拿掉到子晴） */
    const a=leaves(strip(WAS),'',{}), b=leaves(strip(NOW),'',{}), ka=Object.keys(a), diff=ka.filter(p=>a[p]!==b[p]).concat(Object.keys(b).filter(p=>!(p in a)));
    check('3. 別人（不是學姊、沛珊、語彤、可昕、芷若、子晴、以安＝芯慈）的格子、預約句、交通偏好、互動點（'+ka.length+' 格）和重匯以前（'+BASE+'）一樣',ka.length>400&&diff.length===0,J(diff.slice(0,6).map(p=>p+'：'+a[p]+' → '+b[p])));   /* 2026-11-11（X324 子晴約會台詞重寫）：子晴的四千五百多格拿掉以後格數少了，「至少幾格」跟著降（舊：ka.length>9000）*/   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的四千五百多格拿掉以後格數少了，「至少幾格」跟著降（舊：ka.length>4800） */
    const pd=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,PS), w=of(WAS.loc[k],k,PS); for(const p in g) if(g[p]!==w[p]) pd.push(k+' '+p.replace(/^lines\/hotspots\//,'')+'＝'+g[p]); }
    check('3. 沛珊只多改三格（D29 港邊兩格、D30 小攤一格，BB_327 第 4 節講時段的句子）',pd.length===3&&pd.filter(x=>x.startsWith('D29 D29.harbor/')).length===2&&pd.filter(x=>x.startsWith('D30 D30.stall/')).length===1&&J(pd).includes('港口好大，比台中的大。是我的錯覺嗎？')&&J(pd).includes('我們可以坐久一點嗎？我想看那艘船開走。')&&J(pd).includes('小攤的燈好暖，我想站在旁邊不走。'),J(pd));
    if(haveSrc){ const bad=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,PS), s=of(SRC[k],k,PS); for(const p in s) if(g[p]!==s[p]) bad.push(k+' '+p); } check('3. 沛珊 33 個地點的格子和源稿 '+SHA+' 一字不差',bad.length===0,J(bad.slice(0,5))); } });

  await sec(4,async()=>{ const code=read('src/date3d.js').replace(/\/\*[\s\S]*?\*\//g,'');
    check('4. S.MORNING 學姊：「（她已經在大廳，頭髮綁好了）早。你慢了七分鐘。」；舊句（保溫瓶已經裝好熱茶）不在程式裡',DATE.MORNING[SIS]==='（她已經在大廳，頭髮綁好了）早。你慢了七分鐘。'&&!/保溫瓶已經裝好熱茶/.test(code),DATE.MORNING[SIS]);
    const rw=show(SHA,SP+'date_rewrite/sis_D26.json'); if(rw) check('4. 這一句在改稿紀錄 date_rewrite/sis_D26.json 的 for_LAWWW 裡',String((JSON.parse(rw)._meta||{}).for_LAWWW||'').includes('（她已經在大廳，頭髮綁好了）早。你慢了七分鐘。'));
    check('4. 別人早上那一句沒動（以安、芷若、子晴、可昕；沛珊照 X327 的新句；語彤 2026-11-11 照 AA_767@0a2136911 換成「早。旅館的早餐我看過了，有稀飯。我在樓下。」）',DATE.MORNING[YT]==='早。旅館的早餐我看過了，有稀飯。我在樓下。'&&DATE.MORNING.heroine_04==='昨天我又弄到兩點。你先去吃早餐，幫我留一個甜的。'&&DATE.MORNING.heroine_01==='早餐我查過了，走路五分鐘。'&&DATE.MORNING.heroine_02==='我六點就醒了。換地方睡，都這樣。'&&DATE.MORNING.kexin===require('./date_src_sha.js').MORNING921_1112.new/* 2026-11-12（CANON-NO-ECON-1112 第五批）：可昕那一句 AA_921 §3-1 再換（舊期望 AA_769「第二天的我昨天重排了。……」） */   /* 2026-11-11（X324 可昕約會台詞重寫，AA f9c1a2b80）：可昕早上那一句照 AA_769 換了（原本「行程表我昨天晚上重寫了。……你看一下第二天。」）*/&&DATE.MORNING[PS]==='我居然自己醒了，沒有靠鬧鐘。我在大廳等你，快來看奇蹟。'&&Object.keys(DATE.MORNING).length===7);   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：子晴早上那一句照 AA_775 換了（舊期望：「昨天我又弄到兩點。……今天你負責叫我。」） */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安早上那一句照 AA_777 拿掉刪節號（舊期望：「早餐我查過了。……走路五分鐘。」） */
    check('4. ARRIVE_VAR、REMEMBER_IF、PICK_FLAG 都沒有學姊的項目（沒有拿她的句子當 from／key）',![].concat(DATE.ARRIVE_VAR,DATE.REMEMBER_IF,DATE.PICK_FLAG).some(x=>x.who===SIS),J([].concat(DATE.ARRIVE_VAR,DATE.REMEMBER_IF,DATE.PICK_FLAG).filter(x=>x.who===SIS)));
    const bad=[]; for(const v of DATE.ARRIVE_VAR){ const F=(((NOW.loc[v.loc]||{}).lines||{})[v.who]||{}).arrive, T=F&&F.first?F.first.lines.map(x=>x.text):[]; if(!v.from.every(t=>T.includes(t))) bad.push('ARRIVE_VAR '+v.loc+' '+v.who+'：from 對不到到達第一次的句子 '+J(T)); }
    for(const r of DATE.PICK_FLAG){ const h=((((NOW.loc[r.loc]||{}).lines||{})[r.who]||{}).hotspots||{})[r.pid], c=h&&h.first&&h.first.choice||[]; if(!c.some(x=>x.t===r.t)) bad.push('PICK_FLAG '+r.loc+' '+r.who+' '+r.t); }
    for(const r of DATE.REMEMBER_IF){ const h=((((NOW.loc[r.loc]||{}).lines||{})[r.who]||{}).hotspots||{})[r.pid]; if(!(h&&h.remember&&h.remember.lines&&h.remember.lines.length)) bad.push('REMEMBER_IF '+r.loc+' '+r.who+' '+r.pid+' 沒有 remember'); }
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：S.REMEMBER_IF 拿掉子晴 D06.cafe 那一列（再訪不分第一次選了什麼都聽 remember 的新句、她請；PICK_FLAG 照記 ZQ_D06_TREAT）——REMEMBER_IF 剩 2 筆（子晴 D15、沛珊 D05），D06.cafe 那一列不在。舊期望：REMEMBER_IF 3 筆（子晴 D06／D15、沛珊 D05） */
    check('4. 原本的 ARRIVE_VAR（沛珊 D28、可昕 D32）、PICK_FLAG、REMEMBER_IF（子晴 D15、沛珊 D05；AA_812@633b7f7d6 拿掉子晴 D06.cafe 那一列）重匯以後都還對得上資料',DATE.ARRIVE_VAR.length===2&&DATE.PICK_FLAG.length===3&&DATE.REMEMBER_IF.length===2&&!DATE.REMEMBER_IF.some(r=>r.loc==='D06'||r.pid==='D06.cafe')&&bad.length===0,J(bad)); });

  await sec(5,async()=>{ const cells=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,SIS); for(const p in g) if(typeof g[p]==='string') cells.push([k,p,g[p]]); } for(const key in NOW.lines[SIS]) for(const t of NOW.lines[SIS][key]) cells.push(['lines',key,t]);
    const nm=cells.filter(c=>c[2].includes('{name}')), bad=nm.filter(c=>/林林/.test(c[2])||c[2].replace(/林\{name\}/g,'').replace(/\{name\}/g,'').includes('{')||/[^林]\{name\}林|林\{name\}\{name\}/.test(c[2]));
    check('5. {name}：學姊的格裡 '+nm.length+' 格有 {name}，只以「林{name}」或「{name}」出現、沒有「林林」（顯示的時候再換；交往版叫全名）',nm.length===35&&bad.length===0&&!cells.some(c=>/林林/.test(c[2])),J(bad.slice(0,4)));
    check('5. 這 35 格都寫「林{name}」、都在交往中的格（dating）',nm.every(c=>c[2].includes('林{name}')&&/dating/i.test(c[1])),J(nm.filter(c=>!c[2].includes('林{name}')||!/dating/i.test(c[1])).slice(0,4)));
    const opt=(k,pid,i)=>NOW.loc[k].lines[SIS].hotspots[pid].first.choice[i].t;
    check('5. 選項換字五格照稿：D05 咖啡館②「妳不加糖？」、D11 地熱谷②「妳都在圖書館？」、D17 海蝕平台②「像準備考試。」、D18 小店②「妳杯子很多吧。」、D21 祖師廟①「妳讀書也讀很久了。」',opt('D05','D05.cafe',1)==='「妳不加糖？」'&&opt('D11','D11.valley',1)==='「妳都在圖書館？」'&&opt('D17','D17.platform',1)==='「像準備考試。」'&&opt('D18','D18.shop',1)==='「妳杯子很多吧。」'&&opt('D21','D21.temple',0)==='「妳讀書也讀很久了。」');
    if(WAS){ let n=0, t=0; for(const k of LOCS){ const g=of(NOW.loc[k],k,SIS), w=of(WAS.loc[k],k,SIS); for(const p in g) if(/\/t$/.test(p)){ t++; if(g[p]!==w[p]) n++; } } check('5. 學姊的選項（'+t+' 個）只有這五個換字；選項數、tier、喜好的格子數和重匯以前一樣',n===5&&LOCS.every(k=>J(Object.keys(of(NOW.loc[k],k,SIS)))===J(Object.keys(of(WAS.loc[k],k,SIS)))),String(n));
      const treat=D=>LOCS.reduce((a,k)=>{ const hs=D.loc[k].lines[SIS].hotspots||{}; for(const pid in hs) for(const c of ((hs[pid].first||{}).choice||[])) if(DATE.isTreat(c.t)) a.push(pid+c.t); return a; },[]);
      check('5. 請客的選項（DATE.isTreat 看選項的字）和重匯以前同一組',J(treat(NOW))===J(treat(WAS)),J(treat(NOW))); }
    const th=[...new Set(cells.filter(c=>c[2].includes('保溫瓶')).map(c=>c[0]))].sort();
    check('5. 保溫瓶整份約會稿只留三個地點（D02、D09、D13）',J(th)===J(['D02','D09','D13']),J(th)); });

  await sec(6,async()=>{ const W=DW(read('src/data/date_wish.js')), ev=W.events[SIS], raw=show('82c946ad7',SP+'AA_764_sis_wish.json'), A=raw?JSON.parse(raw):null;
    check('6. date_wish.js 的來源寫著 AA_764@82c946ad7；學姊的事件 id、地點 D15、記憶 SIS_THIRD_EMPTY 照舊',W.source.includes('AA_764@82c946ad7')&&ev.id==='wish_heroine_05'&&ev.loc==='D15'&&J(ev).includes('SIS_THIRD_EMPTY'),W.source.slice(-70));
    check('6. 保溫瓶選項（AA_595 刪的「妳的保溫瓶今天是滿的。」）照舊不在；車裡那一段不用保溫瓶；decline「好。那下次。」；玩家約她「好。這次我什麼都不排。」',!J(ev).includes('保溫瓶')&&ev.herInvite.decline[0].text==='好。那下次。'&&ev.playerInvite.known[1].text==='好。這次我什麼都不排。'&&ev.hotspots['D15.car'].lines[1].text==='車門不要關。我想聽外面。',J([ev.herInvite.decline,ev.hotspots['D15.car'].lines]));
    if(A){ const a=JSON.parse(J(ev)), b=JSON.parse(J(A.wish_event)); delete a.src; delete b.src;
      check('6. 學姊的事件和稿的 wish_event 逐欄相同（一字不差）',sortJ(a)===sortJ(b));
      const vals=Object.values(leaves(ev,'',{})), olds=A.rows.filter(r=>!A.rows.some(q=>q.new===r.old));
      check('6. rows 32 列：new 都在她的事件裡、old 都不在了',A.rows.length===32&&A.rows.every(r=>vals.includes(r.new))&&olds.every(r=>!vals.includes(r.old)),J(A.rows.filter(r=>!vals.includes(r.new)).map(r=>r.path)));
      const tmp=path.join(os.tmpdir(),'date_wish_sis1111_'+process.pid+'.js'); let ok=false, out='';
      try{ out=cp.execFileSync('python3',['tools/date/import_wish.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_wish.js'); }catch(x){ out=String(x.stderr||x.stdout||x.message).slice(0,300); }
      try{ fs.unlinkSync(tmp); }catch(x){}
      check('6. tools/date/import_wish.py 重匯（--out 另存）的結果和 src/data/date_wish.js 一樣',ok,ok?'':out.slice(0,300)); }
    const ow=show(BASE,'src/data/date_wish.js'); if(ow){ const O=DW(ow), ids=Object.keys(O.events).filter(k=>k!==SIS&&k!==YT&&k!==KX&&k!==ZR&&k!==ZQ&&k!=='heroine_01'), a=leaves(O.events[SIS],'',{}), b=leaves(ev,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]);   /* 2026-11-11（X324，AA_768@0a2136911）：語彤的心願事件收字 34 格（tests/yt_dates_1111_unit.js 第 7 節另外驗），拿掉再比 */   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：子晴的心願事件照 AA_776 收字 30 格，拿掉再比 */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的心願事件照 AA_778 收字 16 格，拿掉再比 */
      check('6. 別人的心願事件（'+ids.length+' 位，含沛珊；語彤、可昕、芷若另外驗）和重匯以前（'+BASE+'）一樣；hold、verify.miss 照舊是空的',ids.length===1&&ids.every(k=>J(O.events[k])===J(require('./date_src_sha.js').unWish921(JSON.parse(J(W))).events[k]))/* 2026-11-12（CANON-NO-ECON-1112 第五批）：可昕心願換主題、沛珊說明欄四格（date_src_sha.js WISH921_1112）先還原再比 */&&J(O.hold)===J(W.hold)&&W.verify.miss.length===0&&W.verify.freeVisited.length===O.verify.freeVisited.length);   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：別人剩 2 位（舊：3 位） */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：別人剩 1 位（沛珊；舊：2 位） */
      check('6. 學姊的事件和重匯以前比：格子一樣多、不一樣的 32 格都是字的欄位（選項的字、條件、旗標、時間、花費沒動；選項 t 一個都沒換）',J(Object.keys(a))===J(Object.keys(b))&&d.length===32&&d.every(k=>/\/(text|where)$/.test(k)),J(d.filter(k=>!/\/(text|where)$/.test(k)))); } });

  await sec(7,async()=>{ const LS=NOW.lines[SIS], raw=show('808a6d846',SP+'AA_765_sis_date_common.json'), A=raw?JSON.parse(raw):null;
    check('7. 學姊不分地點的短句四句：move 第二句「可以。那個時間我空出來。」、transport「好。有時刻表的比較準。你決定。」、enough 第二句「我腳痠了。這句是實話。」、depart 第三句「我在路口。你從哪邊過來？」',LS.move[1]==='可以。那個時間我空出來。'&&LS.transport[0]==='好。有時刻表的比較準。你決定。'&&LS.enough[1]==='我腳痠了。這句是實話。'&&LS.depart[2]==='我在路口。你從哪邊過來？',J([LS.move,LS.transport,LS.enough,LS.depart]));
    if(A){ const all=Object.values(LS).reduce((a,x)=>a.concat(x),[]); check('7. 逐字：稿的四列 new 在 [key][i] 那一格、old 都不在她的短句裡了',A.rows.length===4&&A.rows.every(r=>LS[r.key][r.i]===r.new&&!all.some(t=>J(t)===J(r.old))),J(A.rows.map(r=>[r.key,r.i,LS[r.key][r.i]]))); }
    if(WAS){ const O=WAS.lines, d=[]; for(const k in O[SIS]) (O[SIS][k]||[]).forEach((t,i)=>{ if(J(t)!==J(LS[k][i])) d.push(k+'['+i+']'); });
      check('7. 學姊十一種短句每一種的句數和重匯以前一樣，只有這四格不同；別人的短句不動',J(Object.keys(O[SIS]))===J(Object.keys(LS))&&Object.keys(LS).length===11&&Object.keys(LS).every(k=>LS[k].length===O[SIS][k].length)&&J(d.sort())===J(['depart[2]','enough[1]','move[1]','transport[0]'])&&Object.keys(O).filter(k=>k!==SIS&&k!==YT&&k!==KX&&k!==ZR&&k!==ZQ&&k!=='heroine_01').every(k=>J(O[k])===J(NOW.lines[k])),J(d)); } });   /* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：芷若的短句照 AA_773 換了九格（tests/zr_dates_1111_unit.js）*/   /* 2026-11-11：語彤的短句照 AA_767 換了六格（tests/yt_dates_1111_unit.js） */   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：子晴的短句照 AA_775 換了五格 */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的短句照 AA_777 換了四格 */
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
