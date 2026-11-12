// 語彤校外約會台詞重寫（DLG-FULL-REVIEW-1110；使用者 X324「就是要像人在說話」；2026-11-11）——不需要瀏覽器（D131）。
//   約會源稿 date_system/lines/D01～D33.json@0a2136911（同一批檔：語彤 33 個地點重寫；學姊 34 格把遊戲裡原本疊著的修正寫回源稿）；改稿紀錄 date_rewrite/yt_D01～D33.json
//   1. 白名單；import_date_lines.py 重匯（--out）一樣；修正層跳過的語彤的列（AA_630 第 2 節整節 209 列、AA_694 第 3 節跟著跳過的 80 列）；學姊、沛珊跳過的列數照舊
//   2. 語彤 33 個地點的格子：和源稿一字不差（只有 D14 四個收尾前面那一句是程式加的）；改稿紀錄 902 格都在
//   3. 別人的格子（含學姊、沛珊）、預約句、交通偏好和重匯以前（BASE）完全一樣
//   4. date3d.js：S.LINE_IF 兩組（accept、enough）還對得上；ARRIVE_VAR／REMEMBER_IF／PICK_FLAG 沒有拿語彤的句子當 key；aa524_3d.js y9 的「我請。」還在；S.xiuqin 照留
//   5. 選項換字 42 格、選項數／tier／喜好不變（D14 夕陽多留一格）；請客的選項同一組
//   6. AA_767_yt_date_common.json@0a2136911（13 列，照 path 換）：date_lines.js 最上層 lines.heroine_03 六列（工具寫檔前最後一層）、src/date3d.js 七列（S.EXTRA_LINES.heroine_03 六格＋S.MORNING.heroine_03）
//   7. AA_768_yt_wish.json@0a2136911（34 列，照 path 換）：date_wish.js 的 events.heroine_03（心願事件「這次只有兩個人」，內容不動、只收字）；closing.lines[5]「……不用趕回去。」和 timeline replace 的 key 沒動
// 稿、BASE 讀 git show；讀不到（淺層複本）＝不比稿，只驗結構。用法：node tests/yt_dates_1111_unit.js
const H=require('./pg_harness.js');
const {check}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), os=require('os');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
/* 2026-11-11（X324 可昕約會台詞重寫，AA f9c1a2b80）：白名單 D01～D33 改認 f9c1a2b80（只動可昕的格子；語彤的格子和 0a2136911 一樣）——白名單、來源那兩條看 ALLOW_SHA，語彤的稿照舊讀 0a2136911（SHA）；
   可昕的格子、短句、心願事件、date3d.js 的三處另外驗（tests/kx_dates_1111_unit.js），這裡比別人時拿掉 */
/* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：白名單 D01～D33 再改認 a29a8aba0（芷若的格子重寫；同一版語彤只改 D15 圍欄一句、可昕三句）——白名單現在的版本改讀 tests/date_src_sha.js（ALLOW_SHA，以後換版只改那一處）；
   語彤的稿照舊讀 0a2136911（SHA），D15 那一句照 date_src_sha.js 的 ALSO 比（舊期望：「期中考在那一片裡面。從這裡看，小小的。」）；芷若的格子、短句、心願事件、date3d.js 的兩處另外驗（tests/zr_dates_1111_unit.js），這裡比別人時拿掉 */
const CS=require('./date_src_sha.js'), ZR='heroine_02', ZQ='heroine_04', ALSO_YT=CS.ALSO.filter(x=>x.who==='heroine_03'), ALSO_KX=CS.ALSO.filter(x=>x.who==='kexin'), also=(k,p)=>ALSO_YT.find(x=>x.loc===k&&x.path===p);
const YT='heroine_03', SIS='heroine_05', PS='classmate_peishan', KX='kexin', SHA='0a2136911', ALLOW_SHA=CS.ALLOW_SHA, PREV='82c946ad7', BASE='7bb6f6311', SP='docs/story_planning/';
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
const read=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const LOCS=Array.from({length:33},(_,k)=>'D'+String(k+1).padStart(2,'0'));
const leaves=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>leaves(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) leaves(x[k],p+'/'+k,o); else o[p]=x; return o; };
const of=(D,k,who)=>{ const o={}; for(const part of ['lines','likes','dislikeLine']) if(D[part]&&D[part][who]!=null) leaves(D[part][who],part,o); return o; };
/* 2026-11-11（AA_812@f1fab0ec6）：懸著的「下次我請」七格（date_src_sha.js 的 CELLS_812：學姊、子晴 D06.cafe remember，沛珊 D15.store、D21.street，可昕 D15 收尾，子晴 D06 第一次選項的回覆，語彤 D10.boat remember）
   是匯入工具最後一步疊上去的（改稿紀錄 date_rewrite/ 和稿的 path_rows；源稿 Dxx.json 沒有重新 apply）——這支的逐字對稿、和重匯以前比，NOW 先用 un812 把那七格還原成舊字再比
   （只有那一格現在剛好是新字才還原，不是＝照舊會紅）；那七格現在＝新字下面另外驗（逐格、她請客在 tests/date_she_pays_812_1111_unit.js）。舊期望：直接拿 NOW 比 */
const NOW812=DL(read('src/data/date_lines.js')), NOW=CS.un812(NOW812);
check('0. AA_812 那七格（CELLS_812）現在是新字（還原成舊字以後才拿 NOW 和源稿、重匯以前比）',CS.CELLS_812.length===7&&CS.CELLS_812.every(r=>CS.cell812(NOW812,r)===r.new&&CS.cell812(NOW,r)===r.old),JSON.stringify(CS.CELLS_812.map(r=>CS.cell812(NOW812,r))));
const SRC={}, OLDSRC={}, REC={}; for(const k of LOCS){ const t=show(SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'), r=show(SHA,SP+'date_rewrite/yt_'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLDSRC[k]=JSON.parse(u); if(r) REC[k]=JSON.parse(r); }
const haveSrc=Object.keys(SRC).length===33&&Object.keys(OLDSRC).length===33&&Object.keys(REC).length===33;
const ob=show(BASE,'src/data/date_lines.js'), WAS=ob?DL(ob):null;
const END='天快暗了。夕陽，我想留到河邊看。';   // AA_630 第 10 節第 2 點（AA_694 拿掉「……」以後）；程式加的（tools/story/aa630.py d14_before_sunset）
const D14C=p=>/^lines\/closing\//.test(p);

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
    const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===ALLOW_SHA&&e[0].status==='approved'&&(e[0].history||[]).some(h=>h.sha===SHA)&&(e[0].history||[]).some(h=>h.sha===PREV)); });
    check('1. 白名單 D01～D33 都是 '+ALLOW_SHA+'、approved，語彤重寫的 '+SHA+'、再上一版 '+PREV+' 留在 history',bad.length===0,J(bad));
    check('1. date_lines.js 的來源寫著 33 個地點 @'+ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+ALLOW_SHA)));
    console.log(haveSrc&&WAS?'（稿和 BASE 都讀得到：逐字比對）':'（這份 checkout 讀不到企劃線的稿或 BASE：不比稿，只驗結構）');
    if(haveSrc){ const tmp=path.join(os.tmpdir(),'date_lines_yt1111_'+process.pid+'.js'); let out='', ok=false;
      try{ out=cp.execFileSync('python3',['tools/date/import_date_lines.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<26}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_lines.js'); }catch(e){ out=String(e.stderr||e.stdout||e.message).slice(0,300); }
      try{ fs.unlinkSync(tmp); }catch(e){}
      check('1. tools/date/import_date_lines.py 重匯（--out 另存）的結果和 src/data/date_lines.js 一樣',ok,ok?'':out.slice(0,300));
      const m=/語彤重寫（DLG-FULL-REVIEW-1110）跳過的改句 (\d+) 列（其中 AA_630 第 2 節 (\d+) 列）：(.*)/.exec(out)||[], body=String(m[3]||''), cnt=s=>body.split(s).length-1;
      check('1. 語彤跳過的列：AA_630 第 2 節整節 209 列（52 列源稿已經是改成的字、157 列那一格新稿重寫了）',+m[2]===209&&cnt('（已經是改成的字（源稿對齊過了））')===52&&cnt('（那一格新稿重寫了）')===157&&cnt('（那一格新稿沒有了）')===0&&(body.match(/AA_630 D-\d{3} /g)||[]).length===209,J([m[1],m[2]]));
      check('1. AA_694 第 3 節跟著跳過的 80 列都是語彤上一版有、新稿換掉的句子；沒有別種跳過（共 289 列）',+m[1]===289&&cnt('（語彤的句子，新稿重寫了）')===80&&(body.match(/AA_694 第 3 節第 \d+ 列 /g)||[]).length===80&&!/AA_359|AA_373|AA_524|AA_525|AA_598/.test(body),String(m[1]));
      check('1. AA_630 每個地點都印「語彤重寫，第 2 節 n 列跳過」（33 個地點、沒有一列套在她的新稿上）；AA_127 預約句那一層照舊',(out.match(/：0 列（語彤重寫，第 2 節 \d+ 列跳過）/g)||[]).length===33&&/src\/data\/date_lines\.js：6 處/.test(out));
      check('1. AA_767 那一層：六列照 path 換了六列（寫檔前最後一步）',/AA_767@0a2136911：語彤不分地點的短句 6 列（照 path），換了 6 列/.test(out));
      check('1. 學姊跳過的列 86 列、沛珊照舊 11 列；AA_598 逐句表 93 列：29 列源稿已經是新句（寫回源稿的那 34 格裡 a573a50dca 又重寫了 5 格）、4 列照舊換、60 列跳過',/學姊重寫（DLG-FULL-REVIEW-1110）跳過的改句 86 列/.test(out)&&/沛珊重寫（PEISHAN-VOICE-1110）跳過的改句 11 列/.test(out)&&/換 4 句、已經是新句 29 句、源稿重寫了跳過 60 句（共 93 列）/.test(out)); }   /* 2026-11-12（X324 學姊續改 AA_837＋AA_838@a573a50dca）：學姊跳過的列 81→86（AA_598 逐句表第 11、30、41、45、57 列那五格這一版重寫了：已經是新句 34→29、跳過 55→60）。舊期望：跳過的改句 81 列、已經是新句 34 句、跳過 55 句 */
    const tool=read('tools/date/import_date_lines.py');
    check('1. 工具只對沛珊、學姊、語彤（和後來的可昕、芷若）放寬（ps_skip 先看 who；別人的列照舊 sys.exit）；AA_630 第 2 節原句還在＝停下來',/if who not in \(PS, SIS, YT, KX, ZR, ZQ, AN\) or not ps756\(loc, who\):\s+return False/.test(tool)&&tool.includes("YT = 'heroine_03'")&&tool.includes('還是原句')&&tool.includes('不是語彤的格子，不能跟著跳過')); });   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：工具也對子晴放寬（舊：到 ZR 為止） */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：工具也對以安放寬（舊：到 ZQ 為止） */

  await sec(2,async()=>{ if(!haveSrc){ for(const k of LOCS) check('2. '+k+'：語彤有台詞',!!(NOW.loc[k].lines&&NOW.loc[k].lines[YT])); return; }
    let n=0; const bad=[];
    for(const k of LOCS){ const g=of(NOW.loc[k],k,YT), s=of(SRC[k],k,YT);
      for(const p of new Set(Object.keys(g).concat(Object.keys(s)))){ if(k==='D14'&&D14C(p)) continue; n++; const x=also(k,p); if(x?!(s[p]===x.old&&g[p]===x.new):g[p]!==s[p]) bad.push(k+' '+p+'：稿「'+s[p]+'」遊戲「'+g[p]+'」'); } }   /* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：D15 圍欄那一句 AA 後來在 a29a8aba0 改了字（稿 0a2136911 是舊字、遊戲是新字） */
    check('2. 語彤 33 個地點 '+n+' 格（D14 四個收尾另外看）和源稿 '+SHA+' 一字不差、格子一樣多（D15 圍欄那一句照後來的 '+ALLOW_SHA+'）',n>4400&&bad.length===0,J(bad.slice(0,6)));
    const C=NOW.loc.D14.lines[YT].closing, SC=SRC.D14.lines[YT].closing, tx=b=>b.lines.map(x=>x.text);
    check('2. D14 漁人碼頭四個收尾：前面都有「'+END+'」，後面照稿（第一次的收尾照舊換掉第一句、其他三個加在最前面）',J(tx(C.first))===J([END].concat(tx(SC.first).slice(1)))&&C.normal.length===2&&C.normal.every((b,i)=>J(tx(b))===J([END].concat(tx(SC.normal[i]))))&&C.dating.length===1&&J(tx(C.dating[0]))===J([END].concat(tx(SC.dating[0])))&&Object.keys(C).length===3,J([tx(C.first),C.normal.map(tx),C.dating.map(tx)]));
    const ss=NOW.loc.D14.lines[YT].hotspots['D14.sunset'].normal;
    check('2. D14.sunset 的 normal 第三格（high）留著：「再一下就好。下去之前我們就走。」；舊句「再五分鐘。天黑就走。」不在',ss.length===3&&ss[2].tier==='high'&&ss[2].lines[0].text==='再一下就好。下去之前我們就走。'&&!J(NOW.loc.D14.lines[YT]).includes('天黑就走'),J(ss));
    const fl=String((REC.D14._meta||{}).for_LAWWW||''); check('2. 這兩件事在改稿紀錄 date_rewrite/yt_D14.json 的 for_LAWWW 裡；其他 32 個地點沒有 for_LAWWW',fl.includes('前面加一句「'+END+'」')&&fl.includes('再一下就好。下去之前我們就走。')&&LOCS.filter(k=>(REC[k]._meta||{}).for_LAWWW).length===1);
    let ch=0; const miss=[]; for(const k of LOCS){ const s=of(SRC[k],k,YT), o=of(OLDSRC[k],k,YT), g=of(NOW.loc[k],k,YT); for(const p of new Set(Object.keys(s).concat(Object.keys(o)))) if(s[p]!==o[p]){ ch++; if(g[p]!==s[p]&&!(k==='D14'&&D14C(p))&&!also(k,p)) miss.push(k+' '+p); } }
    check('2. 源稿和上一版 '+PREV+' 不同的語彤格子（950 格，含先對齊成遊戲當時的字的）每一格都照稿（D15 圍欄那一句後來又改了，另外比）',ch===950&&miss.length===0,J([ch,miss.slice(0,4)]));
    const cells=(x,o)=>{ if(Array.isArray(x)) x.forEach(v=>cells(v,o)); else if(x&&typeof x==='object') for(const k in x){ if((k==='text'||k==='t')&&typeof x[k]==='string') o.push(x[k]); else cells(x[k],o); } return o; };
    let tot=0, nn=0, pos=0; const lost=[];
    for(const k of LOCS){ const r=REC[k][k], c=cells(SRC[k].lines[YT],[]), g=new Set(Object.values(of(NOW.loc[k],k,YT)).filter(v=>typeof v==='string')); tot+=r.length;
      r.forEach((t,i)=>{ if(t==null) return; nn++; if(!g.has(t)&&!ALSO_YT.some(x=>x.loc===k&&x.old===t&&g.has(x.new))) lost.push(k+'#'+i+'：'+t); }); if(r.length===c.length){ pos++; r.forEach((t,i)=>{ if(t!=null&&t!==c[i]) lost.push(k+'#'+i+' 位置不對：'+t); }); } }   /* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：紀錄上 D15 那一格還是舊字，遊戲是後來的新字 */
    check('2. 改稿紀錄 yt_D01～D33.json：1,764 格裡改了 902 格，每一句都在遊戲裡她那個地點的格子（29 個地點格數相同的逐格對位置；D15 圍欄那一句是後來的新字）',tot===1764&&nn===902&&pos===29&&lost.length===0,J([tot,nn,pos,lost.slice(0,4)])); });

  await sec(3,async()=>{ if(!WAS) return;
    const strip=D=>{ const x=JSON.parse(J(D)); delete x.source; if(x.lines){ delete x.lines[YT]; delete x.lines[KX]; delete x.lines[ZR]; delete x.lines[ZQ]; delete x.lines.heroine_01; } for(const k in x.loc) for(const part of ['lines','likes','dislikeLine']) if(x.loc[k][part]){ delete x.loc[k][part][YT]; delete x.loc[k][part][KX]; delete x.loc[k][part][ZR]; delete x.loc[k][part][ZQ]; delete x.loc[k][part].heroine_01; } return x; };   /* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：芷若也拿掉再比 */   /* 2026-11-11（X324 可昕約會台詞重寫，AA f9c1a2b80）：可昕拿掉再比 */   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：子晴的格子、短句也拿掉再比（tests/zq_dates_1111_unit.js 另外驗；舊：只拿掉到芷若） */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的格子、短句也拿掉再比（tests/an_dates_1111_unit.js 另外驗；舊：只拿掉到子晴） */
    const a=leaves(strip(WAS),'',{}), b=leaves(strip(NOW),'',{}), ka=Object.keys(a), diff=ka.filter(p=>a[p]!==b[p]).concat(Object.keys(b).filter(p=>!(p in a)));
    check('3. 別人的格子（含學姊、沛珊；可昕、芷若、子晴、以安另外驗）、預約句、交通偏好、互動點（'+ka.length+' 格）和重匯以前（'+BASE+'）完全一樣',ka.length>9000&&diff.length===0,J(diff.slice(0,6).map(p=>p+'：'+a[p]+' → '+b[p])));   /* 2026-11-11（X324 子晴約會台詞重寫）：子晴的四千五百多格拿掉以後格數少了，「至少幾格」跟著降（舊：ka.length>18000）*/   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的四千五百多格拿掉以後格數少了，「至少幾格」跟著降（舊：ka.length>13500） */
    for(const [who,nm] of [[SIS,'學姊'],[PS,'沛珊']]){ let n=0; const d=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,who), w=of(WAS.loc[k],k,who); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))){ n++; if(g[p]!==w[p]) d.push(k+' '+p); } }
      check('3. '+nm+' 33 個地點 '+n+' 格和重匯以前零差異；不分地點的短句也一樣',n>4000&&d.length===0&&J(NOW.lines[who])===J(WAS.lines[who]),J(d.slice(0,4))); }
    if(haveSrc){ const bad=[]; let wb=0; for(const k of LOCS){ const s=of(SRC[k],k,SIS), o=of(OLDSRC[k],k,SIS), g=of(NOW.loc[k],k,SIS); for(const p in s){ if(s[p]!==o[p]){ wb++; if(g[p]!==s[p]) bad.push(k+' '+p); } } }
      check('3. 學姊寫回源稿的 34 格（源稿和 '+PREV+' 不同的）＝遊戲裡原本就是這個字',wb===34&&bad.length===0,J([wb,bad.slice(0,4)]));
      const other=[]; for(const k of LOCS){ const a=leaves(SRC[k],'',{}), b=leaves(OLDSRC[k],'',{}); for(const p of new Set(Object.keys(a).concat(Object.keys(b)))) if(a[p]!==b[p]&&!/^\/(lines|likes|dislikeLine)\/(heroine_03|heroine_05)\//.test(p)) other.push(k+p); }
      check('3. 源稿 '+SHA+' 和 '+PREV+' 逐格比：語彤、學姊以外的人 0 格不同',other.length===0,J(other.slice(0,4))); }
    let d3=0; for(const k of LOCS){ const g=of(NOW.loc[k],k,YT), w=of(WAS.loc[k],k,YT); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))) if(g[p]!==w[p]) d3++; }   /* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：D15 圍欄那一句重匯以前就和 BASE 不同（那時是「期中考…」），現在換成新字還是不同，格數不變 */
    check('3. 語彤的格子和重匯以前比：900 格不同（含 D14 夕陽多留的那一格 3 項）',d3===900,String(d3)); });

  await sec(4,async()=>{ const LI=DATE.LINE_IF[YT]||{}, acc=NOW.lines[YT].accept.map(x=>[].concat(x).join('')), en=DATE.EXTRA_LINES[YT].enough;
    check('4. S.LINE_IF 語彤兩組還對得上：accept 認「沒有班」（「可以。那天我沒有班。」還在）、enough 認「秀琴姨煮了飯」（AA_767 的新句「差不多了。秀琴姨煮了飯，我想回去吃熱的。」留著這幾個字）',typeof LI.accept==='function'&&typeof LI.enough==='function'&&acc.filter(x=>/公休|沒有班/.test(x)).length===1&&acc.includes('可以。那天我沒有班。')&&en.filter(x=>/幫阿姨|秀琴姨煮了飯/.test(x)).length===1&&en[0]==='差不多了。秀琴姨煮了飯，我想回去吃熱的。',J([acc,en]));
    const src=read('src/date3d.js');
    check('4. S.LINE_IF 的條件式沒動（/公休|沒有班/、/幫阿姨|秀琴姨煮了飯/）',src.includes("S.LINE_IF={heroine_03:{accept:(G,t,x)=>!/公休|沒有班/.test(String(x))||(/公休/.test(String(x))?noodleOff(t.day):!ytTea(G,t.day)),enough:(G,t,x)=>!/幫阿姨|秀琴姨煮了飯/.test(String(x))||ytHere(G,t.day!=null?t.day:G.day)},"));
    check('4. ARRIVE_VAR、REMEMBER_IF、PICK_FLAG 都沒有語彤的項目（沒有拿她的句子當 from／key）',![].concat(DATE.ARRIVE_VAR,DATE.REMEMBER_IF,DATE.PICK_FLAG).some(x=>x.who===YT));
    const bad=[]; for(const v of DATE.ARRIVE_VAR){ const F=(((NOW.loc[v.loc]||{}).lines||{})[v.who]||{}).arrive, T=F&&F.first?F.first.lines.map(x=>x.text):[]; if(!v.from.every(t=>T.includes(t))) bad.push('ARRIVE_VAR '+v.loc+' '+v.who); }
    for(const r of DATE.PICK_FLAG){ const h=((((NOW.loc[r.loc]||{}).lines||{})[r.who]||{}).hotspots||{})[r.pid], c=h&&h.first&&h.first.choice||[]; if(!c.some(x=>x.t===r.t)) bad.push('PICK_FLAG '+r.loc+' '+r.who+' '+r.t); }
    for(const r of DATE.REMEMBER_IF){ const h=((((NOW.loc[r.loc]||{}).lines||{})[r.who]||{}).hotspots||{})[r.pid]; if(!(h&&h.remember&&h.remember.lines&&h.remember.lines.length)) bad.push('REMEMBER_IF '+r.loc+' '+r.who+' '+r.pid); }
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：S.REMEMBER_IF 拿掉子晴 D06.cafe 那一列（再訪不分第一次選了什麼都聽 remember 的新句、她請；PICK_FLAG 照記 ZQ_D06_TREAT）——REMEMBER_IF 剩 2 筆（子晴 D15、沛珊 D05），D06.cafe 那一列不在。舊期望：REMEMBER_IF 3 筆（子晴 D06／D15、沛珊 D05） */
    check('4. 原本的 ARRIVE_VAR（沛珊 D28、可昕 D32）、PICK_FLAG、REMEMBER_IF（子晴 D15、沛珊 D05；AA_812@633b7f7d6 拿掉子晴 D06.cafe 那一列）重匯以後都還對得上資料',DATE.ARRIVE_VAR.length===2&&DATE.PICK_FLAG.length===3&&DATE.REMEMBER_IF.length===2&&!DATE.REMEMBER_IF.some(r=>r.loc==='D06'||r.pid==='D06.cafe')&&bad.length===0,J(bad));
    const a5=read('src/aa524_3d.js'), boat=NOW.loc.D10.lines[YT].hotspots['D10.boat'];
    check('4. aa524_3d.js 的 remember 多一句（y9）：拿語彤 D10 天鵝船第一次選的「我請。」比——這個選項新稿沒換字，還在第二個；回覆照稿',a5.includes("{key:'y9',loc:'D10',who:'heroine_03',pid:'D10.boat',pick:'「我請。」',x:{narr:'（這次她先去付了錢。）'}}")&&boat.first.choice.length===2&&boat.first.choice[1].t==='「我請。」'&&boat.first.choice[1].reply[0].text==='那下次我請。謝謝。'&&!!(boat.remember&&boat.remember.lines.length),J(boat.first.choice));
    check('4. aa524_3d.js 的 rem 只有兩筆（芷若 D04、語彤 D10）；芷若那一筆的選項也還在',(a5.match(/\{key:'[a-z0-9]+',loc:'D\d\d',who:'/g)||[]).length===2&&NOW.loc.D04.lines.heroine_02.hotspots['D04.snack'].first.choice.some(c=>c.t==='「下次換我請。」'));
    let nx=0; for(const k of LOCS) nx+=J(NOW.loc[k].lines[YT]).split('秀琴姨').length-1;
    check('4. 新稿寫「秀琴姨」（'+nx+' 處）、沒有寫「煮飯的阿姨」；S.xiuqin（還沒聽過她家裡的事＝顯示成「煮飯的阿姨」）照留',nx===26&&!LOCS.some(k=>J(NOW.loc[k].lines[YT]).includes('煮飯的阿姨'))&&DATE.xiuqin({flags:{}},YT,'秀琴姨說的。')==='煮飯的阿姨說的。'&&DATE.xiuqin({flags:{YT_FAMILY_HEARD:1}},YT,'秀琴姨說的。')==='秀琴姨說的。'&&DATE.xiuqin({flags:{}},SIS,'秀琴姨')==='秀琴姨',String(nx)); });

  await sec(5,async()=>{ if(!WAS) return; const opts=[]; let t=0; const st=[];
    for(const k of LOCS){ const g=of(NOW.loc[k],k,YT), w=of(WAS.loc[k],k,YT); for(const p in g) if(/\/t$/.test(p)){ t++; if(g[p]!==w[p]) opts.push(k+' '+p.replace(/^lines\/hotspots\//,'').replace('/first/choice/','#').replace(/\/t$/,'')+' '+w[p]+'→'+g[p]); }
      const ka=Object.keys(g).sort(), kb=Object.keys(w).sort(); if(J(ka)!==J(kb)) st.push(k+'：'+ka.filter(p=>!kb.includes(p)).concat(kb.filter(p=>!ka.includes(p))).join(' ')); }
    check('5. 語彤的選項（'+t+' 個）換字 42 個；選項數、tier、喜好的格子和重匯以前一樣（只有 D14 夕陽多留第三格）',opts.length===42&&st.length===1&&st[0]==='D14：lines/hotspots/D14.sunset/normal/2/lines/0/text lines/hotspots/D14.sunset/normal/2/lines/0/who lines/hotspots/D14.sunset/normal/2/tier',J([opts.length,st]));
    check('5. 換字的選項抽五個照稿：D01 市集①「買一塊回去？」、D12 夕陽②「店裡一個人顧得來嗎？」、D14 夕陽②「要看到它下去嗎？」、D27 小店①「買一個回去？」、D32 步道①「慢慢走。」',['D01 D01.market#0 「我們幫蘇姨挑。」→「買一塊回去？」','D12 D12.sunset#1 「蘇姨一個人可以嗎？」→「店裡一個人顧得來嗎？」','D14 D14.sunset#1 「蘇姨一個人可以嗎？」→「要看到它下去嗎？」','D27 D27.shop#0 「買一個給秀琴姨？」→「買一個回去？」','D32 D32.trail#0 「可以。」→「慢慢走。」'].every(x=>opts.includes(x)),J(opts.slice(0,3)));
    const code=fs.readdirSync(path.join(H.ROOT,'src')).filter(f=>/\.js$/.test(f)).map(f=>[f,read('src/'+f)]), olds=[...new Set(opts.map(x=>/ (「[^」]*」)→/.exec(x)[1]))].filter(s=>s.length>=7), hit=[];
    for(const s of olds) for(const [f,c] of code) if(c.includes(s)) hit.push(f+' '+s);
    check('5. 換掉的舊選項字（五個字以上的 '+olds.length+' 個）沒有被 src/*.js 的程式拿來當 key',olds.length>20&&hit.length===0,J(hit));
    const treat=D=>LOCS.reduce((a,k)=>{ const hs=D.loc[k].lines[YT].hotspots||{}; for(const pid in hs) for(const c of ((hs[pid].first||{}).choice||[])) if(DATE.isTreat(c.t)) a.push(pid+c.t); return a; },[]);
    check('5. 請客的選項（DATE.isTreat 看選項的字）和重匯以前同一組',J(treat(NOW))===J(treat(WAS))&&treat(NOW).length>0,J(treat(NOW))); });
  await sec(6,async()=>{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files, e=allow.filter(x=>x.path===SP+'AA_767_yt_date_common.json');
    check('6. 白名單 AA_767_yt_date_common.json@0a2136911 一筆、approved；date_lines.js 的來源寫著它',e.length===1&&e[0].sha==='0a2136911'&&e[0].status==='approved'&&NOW.source.includes('AA_767_yt_date_common.json@0a2136911'));
    const LY=NOW.lines[YT];
    /* 2026-11-11（AA_780_an_date_followup.json@248c8e390，以安約會台詞匯入以後 AA 的後續改稿）：flaked 第一則「那天我等了一下。」換成「嗯。第二次了。」（30 天內第二次當天取消的當下說的，沒有人等過；第二則照舊）。
       舊期望：flaked＝[['那天我等了一下。','班也請了。下次不能來，先跟我說。']]（AA_767 的字）*/
    check('6. lines.heroine_03 六格：move 第一句「好，改那天。」、transport「好，坐你的車。」「我平常都坐捷運，在車上要做什麼，我不太知道。」、cancel「沒關係。下次再約。」、flaked「嗯。第二次了。」（AA_780 再換；AA_767 是「那天我等了一下。」）「班也請了。下次不能來，先跟我說。」',LY.move[0]==='好，改那天。'&&J(LY.transport)===J([['好，坐你的車。','我平常都坐捷運，在車上要做什麼，我不太知道。']])&&J(LY.cancel)===J(['沒關係。下次再約。'])&&J(LY.flaked)===J([['嗯。第二次了。','班也請了。下次不能來，先跟我說。']]),J(LY));
    check('6. accept（兩句）、acceptDating、move 第二句、move3 不改',J(LY.accept)===J([['好。','我跟蘇姨說那天不排班。'],'可以。那天我沒有班。'])&&J(LY.acceptDating)===J(['好。蘇姨說，那天她自己顧。'])&&LY.move[1]==='可以。我再跟蘇姨講一次。'&&J(LY.move3)===J([['第三次了。','蘇姨問我到底哪一天。我說我也不知道。']]),J(LY));
    const EX=DATE.EXTRA_LINES[YT];
    check('6. date3d.js S.EXTRA_LINES 語彤：depart 第一句照舊「我到了。」、第二、三句、enough 兩句、leaveEarly、noPair 照稿',J(EX)===J({depart:['我到了。','出門了。傘有帶，這次有。','快到了。你先找地方站，我看得到你。'],enough:['差不多了。秀琴姨煮了飯，我想回去吃熱的。','我走不動了。到這裡就好。'],leaveEarly:['就這樣？好。那我回去了。'],noPair:['我不用。我幫你拍，你站過去。']}),J(EX));
    check('6. date3d.js S.MORNING 語彤：「早。旅館的早餐我看過了，有稀飯。我在樓下。」',DATE.MORNING[YT]==='早。旅館的早餐我看過了，有稀飯。我在樓下。',DATE.MORNING[YT]);
    const raw=show(SHA,SP+'AA_767_yt_date_common.json'), A=raw?JSON.parse(raw):null, strip=t=>t.replace(/\/\*[\s\S]*?\*\//g,''), lit=t=>strip(t).match(/'(?:[^'\\\n]|\\.)*'/g)||[];
    const code=read('src/date3d.js');
    if(A){ const get=(o,pth)=>pth.match(/\[\d+\]|[^.\[\]]+/g).reduce((x,t)=>x==null?x:x[t[0]==='['?+t.slice(1,-1):t],o);
      const r1=A.rows.filter(r=>r.file==='src/data/date_lines.js'), r2=A.rows.filter(r=>r.file==='src/date3d.js');
      /* 2026-11-11（AA_780@248c8e390）：flaked[0][0] 那一列 AA_780 再換（old＝這一列的 new），那一格改認 AA_780 的 new（date_src_sha.js 的 want780；別的列照舊認這份稿的 new）。舊期望：六列都＝這份稿的 new */
      check('6. 逐字：稿 13 列（date_lines.js 六列、date3d.js 七列）；date_lines.js 六列的 new 在 path 那一格（flaked[0][0] 那一列＝AA_780 再換的「嗯。第二次了。」）',A.rows.length===13&&r1.length===6&&r2.length===7&&r1.every(r=>get(NOW,r.path)===CS.want780(r))&&r1.filter(r=>CS.want780(r)!==r.new).map(r=>r.path).join()==='lines.heroine_03.flaked[0][0]',J(r1.filter(r=>get(NOW,r.path)!==CS.want780(r)).map(r=>r.path)));
      const at=r=>r.path==='S.MORNING.heroine_03'?DATE.MORNING[YT]:get(EX,r.path.replace('S.LINES heroine_03.',''));
      check('6. 逐字：date3d.js 七列的 new 在 path 那一格；每一句在程式裡（註解不算）剛好一處、old 都不在了',r2.every(r=>at(r)===r.new&&strip(code).split("'"+r.new+"'").length-1===1&&!strip(code).includes("'"+r.old+"'")),J(r2.filter(r=>at(r)!==r.new).map(r=>r.path)));
      if(WAS){ const a=leaves(WAS.lines[YT],'',{}), b=leaves(LY,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]).sort();
        check('6. lines.heroine_03 和重匯以前比：格子一樣多、只有這六格不同（「嗯。」整個檔兩百多處，只換她放鴿子那一格）',J(Object.keys(a))===J(Object.keys(b))&&J(d)===J(['/cancel/0','/flaked/0/0','/flaked/0/1','/move/0','/transport/0/0','/transport/0/1'])&&r1.every(r=>get(WAS,r.path)===r.old),J(d));
        const cnt=D=>{ const x=JSON.parse(J(D)); delete x.lines[YT]; delete x.lines[KX]; delete x.lines[ZR]; delete x.lines[ZQ]; delete x.lines.heroine_01; for(const k in x.loc) for(const part of ['lines','dislikeLine']) if(x.loc[k][part]){ delete x.loc[k][part][YT]; delete x.loc[k][part][KX]; delete x.loc[k][part][ZR]; delete x.loc[k][part][ZQ]; delete x.loc[k][part].heroine_01; } return J(x).split('嗯。').length-1; };   /* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：芷若的格子也重寫了，一樣拿掉再數 */   /* 2026-11-11（X324 可昕約會台詞重寫，AA f9c1a2b80）：可昕的格子也重寫了，一樣拿掉再數 */   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：子晴的格子、短句也拿掉再比（tests/zq_dates_1111_unit.js 另外驗；舊：只拿掉到芷若） */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的格子也重寫了（她的「嗯。」少了二十幾處），一樣拿掉再數 */
        check('6. 「嗯。」在別人的格子裡的次數和重匯以前一樣（'+cnt(NOW)+' 處；沒有整檔取代）',cnt(NOW)===cnt(WAS)&&cnt(NOW)>20,J([cnt(NOW),cnt(WAS)])); }   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的格子拿掉以後剩的次數少了，「至少幾處」跟著降（舊：>50） */
      /* 2026-11-11（X324 可昕約會台詞重寫，AA f9c1a2b80）：date3d.js 後來又照可昕的新稿改了三處（S.MORNING.kexin、ARRIVE_VAR 可昕 D32 的 from、過夜晚上那一句的 S.NIGHT_HOME 多兩個字串 'D29'、'kexin'）——原本「逐個比、只差七列」改成比字串的增減：
         少掉的＝稿上七列的 old＋可昕那兩句舊字；多出來的＝七列的 new＋可昕那兩句新字＋'D29'、'kexin'（逐字在 tests/kx_dates_1111_unit.js）*/
      const ob=show(BASE,'src/date3d.js'); if(ob){ const O=lit(ob), L=lit(show('e61d19547','src/date3d.js')||code) /* 2026-11-11：「重匯以後」固定比 e61d19547 的 date3d.js（原本比現在的檔，之後每加一個字串就紅；同 zq／zr 那兩支）*/, cntOf=A=>A.reduce((m,t)=>(m[t]=(m[t]||0)+1,m),{}), co=cntOf(O), cl=cntOf(L), gone=[], came=[];
        for(const t of new Set(O.concat(L))){ const n=(cl[t]||0)-(co[t]||0); for(let i=0;i<Math.abs(n);i++) (n<0?gone:came).push(t); }
        const q=t=>"'"+t+"'", KXO=['行程表我昨天晚上重寫了。……你看一下第二天。','清境。山路我查了，要開三個多小時。','清境。從日月潭上來，一個半小時。我查過了。'], KXN=['第二天的我昨天重排了。你先看，有意見現在講。','清境。要開三個多小時，我負責讓你不要睡著。','D29','kexin','清境。從日月潭上來一個半小時，我本來要睡，結果一路在看路。'];
        /* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：date3d.js 又照 AA_773_zr_date_common.json 換了芷若兩格（S.MORNING_OWN、S.T7A_YES；逐字在 tests/zr_dates_1111_unit.js 第 6 節）——少掉、多出來各多兩句 */
        KXO.push('我出門的時候，我媽問我跟誰。……我說回來再講。','你要來臺中？……好。我帶你走。'); KXN.push('我出門的時候，我媽叫我問你吃不吃蛋餅。她已經在煎了。','你要來臺中？好，我帶你走。'); KXO.push('上次也來這裡。','上次也來這裡。','昨天我又弄到兩點。……今天你負責叫我。'); KXN.push('這家的位子我記得，靠牆那桌插座最近。','布丁還在同一格，我要拿了。','昨天我又弄到兩點。你先去吃早餐，幫我留一個甜的。','D26','heroine_04');   /* 2026-11-11 AA 回 LAWWW 第 4 題：ARRIVE_VAR 可昕 D32 的 to 換新字（各多一句）*/   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：date3d.js 又照 AA_775 換了子晴四列（S.MORNING、REMEMBER_IF 兩句備用句、S.NIGHT_HOME 多 D26＋heroine_04）——少掉多三句、多出來多五個字串 */
        check('6. date3d.js 的字串和重匯以前（'+BASE+'）比：少掉的剛好是稿上七列的 old（＋可昕兩句舊字）、多出來的剛好是七列的 new（＋可昕兩句新字和 D29、kexin）；條件、以安的四格、別人早上那一句沒動',J(gone.sort())===J(r2.map(r=>q(r.old)).concat(KXO.map(q)).sort())&&J(came.sort())===J(r2.map(r=>q(r.new)).concat(KXN.map(q)).sort()),J([gone.length,came.length,gone.filter(t=>!r2.some(r=>q(r.old)===t)),came.filter(t=>!r2.some(r=>q(r.new)===t))])); } }
    check('6. S.xiuqin 照留：還沒聽過她家裡的事，enough 第一句顯示成「差不多了。煮飯的阿姨煮了飯，我想回去吃熱的。」',DATE.xiuqin({flags:{}},YT,EX.enough[0])==='差不多了。煮飯的阿姨煮了飯，我想回去吃熱的。'&&/S\.xiuqin=\(G,id,s\)=>id==='heroine_03'&&!\(G&&G\.flags&&G\.flags\.YT_FAMILY_HEARD\)&&typeof s==='string'\?s\.replace\(\/秀琴姨\/g,'煮飯的阿姨'\):s;/.test(code)); });
  await sec(7,async()=>{ const DW=t=>JSON.parse(t.slice(t.indexOf('const DATE_WISH=')+16,t.lastIndexOf(';'))), W=DW(read('src/data/date_wish.js')), ev=W.events[YT];
    const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files, e=allow.filter(x=>x.path===SP+'AA_768_yt_wish.json');
    check('7. 白名單 AA_768_yt_wish.json@0a2136911 一筆、approved；date_wish.js 的來源寫著「AA_768@0a2136911（語彤 D13 心願 34 列，換了 34 列）」',e.length===1&&e[0].sha==='0a2136911'&&e[0].status==='approved'&&W.source.includes('AA_768@0a2136911（語彤 D13 心願 34 列，換了 34 列）'),W.source.slice(-60));
    check('7. 語彤的事件 id、地點 D13、標題照舊；closing.lines[5]「……不用趕回去。」沒動、timeline replace 的 key 還是它',ev.id==='wish_heroine_03'&&ev.loc==='D13'&&ev.closing.lines[5].text==='……不用趕回去。'&&J(Object.keys(ev.closing.timeline[0].replace))===J(['……不用趕回去。'])&&ev.closing.timeline[0].replace['……不用趕回去。'][0].text==='今天我跟蘇姨換了班。',J(ev.closing.timeline));
    check('7. 抽五句照稿：她提起「我家在淡水。」、答應「那就{出發時間}。」、還不知道的「好。我帶路。」、河「這條河，跟學校旁邊那條，是同一條嗎。」、長椅「這張椅子，我國中放假回來坐過。」',ev.mention.lines[1].text==='我家在淡水。'&&ev.herInvite.accept[0].text==='那就{出發時間}。'&&ev.playerInvite.unknown[1].text==='好。我帶路。'&&ev.hotspots['D13.rail'].lines[1].text==='這條河，跟學校旁邊那條，是同一條嗎。'&&ev.hotspots['D13.bench'].lines[0].text==='這張椅子，我國中放假回來坐過。');
    const raw=show(SHA,SP+'AA_768_yt_wish.json'), A=raw?JSON.parse(raw):null;
    const get=(o,pth)=>{ let x=o; for(const m of pth.matchAll(/\["([^"]+)"\]|\.?([^.\[\]"]+)|\[(\d+)\]/g)){ if(x==null) return x; x=x[m[1]!=null?m[1]:(m[2]!=null?m[2]:+m[3])]; } return x&&typeof x==='object'?x.text:x; };
    if(A){ check('7. 逐字：稿 34 列，每一列 path 那一格現在是 new',A.rows.length===34&&A.rows.every(r=>get(ev,r.path)===r.new),J(A.rows.filter(r=>get(ev,r.path)!==r.new).map(r=>r.path)));
      const tmp=path.join(os.tmpdir(),'date_wish_yt1111_'+process.pid+'.js'); let ok=false, out='';
      try{ out=cp.execFileSync('python3',['tools/date/import_wish.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_wish.js'); }catch(x){ out=String(x.stderr||x.stdout||x.message).slice(0,300); }
      try{ fs.unlinkSync(tmp); }catch(x){}
      check('7. tools/date/import_wish.py 重匯（--out 另存）的結果和 src/data/date_wish.js 一樣',ok,ok?'':out.slice(0,300)); }
    const ow=show(BASE,'src/data/date_wish.js'); if(ow){ const O=DW(ow), ids=Object.keys(O.events).filter(k=>k!==YT&&k!==KX&&k!==ZR&&k!==ZQ&&k!=='heroine_01'), a=leaves(O.events[YT],'',{}), b=leaves(ev,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]);   /* 2026-11-11（X324 可昕約會台詞重寫，AA f9c1a2b80）：可昕的心願事件照 AA_770 收字 23 格（tests/kx_dates_1111_unit.js 第 7 節另外驗），拿掉再比 */   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：子晴的心願事件照 AA_776 收字 30 格，拿掉再比 */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的心願事件照 AA_778 收字 16 格，拿掉再比 */
      check('7. 別人的心願事件（'+ids.length+' 位；可昕、芷若另外驗——2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：芷若的照 AA_774 收字 27 格）和重匯以前（'+BASE+'）一樣；hold、verify.miss 照舊是空的',ids.length===2&&ids.every(k=>J(O.events[k])===J(W.events[k]))&&J(O.hold)===J(W.hold)&&W.verify.miss.length===0&&W.verify.freeVisited.length===O.verify.freeVisited.length);   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0／AA_775／AA_776@26e72fd51）：別人剩 3 位（舊：4 位） */   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：別人剩 2 位（學姊、沛珊；舊：3 位） */
      check('7. 語彤的事件和重匯以前比：格子一樣多、不一樣的 34 格都是台詞的 text（選項的字 t、條件、旗標、時間、結構沒動）',J(Object.keys(a))===J(Object.keys(b))&&d.length===34&&d.every(k=>/\/text$/.test(k))&&(!A||A.rows.every(r=>get(O.events[YT],r.path)===r.old)),J(d.filter(k=>!/\/text$/.test(k)))); }
    const wcode=read('src/wish3d.js'); check('7. src/wish3d.js 沒有寫死語彤心願事件的句子（讀資料檔；timeline replace 用資料裡的 key）',!/不用趕回去|跟小時候一樣|我們拍一張/.test(wcode)); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
