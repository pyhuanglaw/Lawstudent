// 以安校外約會台詞重寫（DLG-FULL-REVIEW-1110；使用者 X324「就是要像人在說話」；2026-11-11；七個人的最後一位）——不需要瀏覽器（D131）。
//   約會源稿 date_system/lines/D01～D33.json（白名單現在的版本；同一版帶子晴再改的 31 格，tests/date_src_sha.js 的 ALSO_AN）；改稿紀錄 date_rewrite/an_D01～D33.json；
//   AA_777_an_date_common.json（不分地點的短句 9 列：date_lines.js 四列、date3d.js 五列）、AA_778_an_wish.json（D07 心願事件 16 列）。
//   **SHA 都在 tests/date_src_sha.js**（AA 再給新 SHA 只改那一處；這支裡的格數都是「至少多少」，不寫死）。
//   1. 白名單；import_date_lines.py 重匯（--out）一樣；修正層跳過的以安的列（AA_359、AA_524 八列＋AA_594 第 2-14 節她各地點的 288 列＋AA_694 跟著跳過的）；別人跳過的列數照舊；沒有「原句還在」的列
//   2. 以安 33 個地點的格子和源稿一字不差（只差 D13 合照那一格「第 6 階以上」照舊改成不顯示的註記）；改稿紀錄每一格的 new 都在、位置就是源稿那一格
//   3. 別人的格子、預約句、交通偏好和重匯以前（AN_BASE）完全一樣——學姊、沛珊、語彤、可昕、芷若、芯慈零差異；子晴剛好差 AA 列的那 31 格；源稿和上一版逐格比也一樣
//   4. 選項換字：拿選項的字當 key 的地方（PICK_FLAG、REMEMBER_IF、LINE_IF、ARRIVE_VAR、aa524_3d.js、請客選項）沒有以安的項目、都對得上；換掉的舊句不在 src 的程式裡
//   5. 子晴那 31 格進了、舊字不在她那個地點
//   6. AA_777（9 列）：lines.heroine_01 四列照 path＋date3d.js 五列（S.MORNING、S.MORNING_OWN、S.HOME_NO、S.T7A_YES、D26 臺中過夜她回家）；transport 那一句只在她想搭的車被改成開車時播；{name} 八格都在交往格
//   7. AA_778（16 列，照 path）：date_wish.js 的 events.heroine_01；別人 0 格；刪節號剩 3 處
//   8. D13 示範規格（{sunset}、{lastDrink}、記 TASTE、旁白格、註記格）照留；D07 只有再訪的格；每一格是誰說的；以安沒有「下次我請」這種欠著的句子
//   9. 匯入以後 AA 的後續改稿（企劃線 248c8e390）：以安 14 格（AN_FIX14）逐字＝源稿、別人 33 個地點零差異；AA_780 九列（date_lines.js 五列＝四個人 flaked、date3d.js 四列＝S.EXTRA_LINES）；
//      _meta.she_pays 三格＝S.SHE_PAYS（扣不扣錢在 tests/date_she_pays_1111_unit.js）；date3d.js 字串增減固定比 AN780_D3_SHA
// 稿、BASE 讀 git show；讀不到（淺層複本）＝不比稿，只驗結構。用法：node tests/an_dates_1111_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), os=require('os'), vm=require('vm');
const C=require('./date_src_sha.js');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const AN='heroine_01', ZQ='heroine_04', ZR='heroine_02', KX='kexin', YT='heroine_03', SIS='heroine_05', PS='classmate_peishan', SHA=C.ALLOW_SHA, PREV=C.AN_PREV, BASE=C.AN_BASE, SP='docs/story_planning/';
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
const read=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const load=f=>{ let src=read(f); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
load('src/data/date_wish.js'); load('src/wish3d.js');
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const DW=t=>JSON.parse(t.slice(t.indexOf('const DATE_WISH=')+16,t.lastIndexOf(';')));
const LOCS=Array.from({length:33},(_,k)=>'D'+String(k+1).padStart(2,'0'));
const leaves=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>leaves(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) leaves(x[k],p+'/'+k,o); else o[p]=x; return o; };
const of=(D,k,who)=>{ const o={}; for(const part of ['lines','likes','dislikeLine']) if(D[part]&&D[part][who]!=null) leaves(D[part][who],part,o); return o; };
/* 格號＝AA 的 docs/story_planning/tools_aa/date_rewrite.py list <人> Dxx 的順序（到達、收尾各 first／normal／dating；每個互動點 first／normal／remember／dating、再來是其他；最後是不喜歡那一句）；回傳 [容器, key] */
const slots=(d,who)=>{ const out=[], L=d.lines[who], K4=['first','normal','remember','dating'];
  const block=b=>{ if(Array.isArray(b)) b.forEach(block); else if(b&&typeof b==='object'&&'lines' in b){ b.lines.forEach(x=>out.push([x,'text'])); (b.choice||[]).forEach(c=>{ out.push([c,'t']); (c.reply||[]).forEach(r=>out.push([r,'text'])); }); } };
  for(const part of ['arrive','closing']) for(const kind of ['first','normal','dating']) if(L[part]&&kind in L[part]) block(L[part][kind]);
  for(const hs in (L.hotspots||{})){ const X=L.hotspots[hs]; for(const kind of K4) if(kind in X) block(X[kind]); for(const k in X) if(!K4.includes(k)) block(X[k]); }
  const dl=(d.dislikeLine||{})[who]||{}; for(const hs in dl) out.push([dl,hs]); return out; };
const cell=s=>s[0][s[1]];
/* 2026-11-11（AA_812@f1fab0ec6）：懸著的「下次我請」七格（date_src_sha.js 的 CELLS_812：學姊、子晴 D06.cafe remember，沛珊 D15.store、D21.street，可昕 D15 收尾，子晴 D06 第一次選項的回覆，語彤 D10.boat remember）
   是匯入工具最後一步疊上去的（改稿紀錄 date_rewrite/ 和稿的 path_rows；源稿 Dxx.json 沒有重新 apply）——這支的逐字對稿、和重匯以前比，NOW 先用 un812 把那七格還原成舊字再比
   （只有那一格現在剛好是新字才還原，不是＝照舊會紅）；那七格現在＝新字下面另外驗（逐格、她請客在 tests/date_she_pays_812_1111_unit.js）。舊期望：直接拿 NOW 比 */
const NOW812=DL(read('src/data/date_lines.js')), NOW=C.un812(NOW812);
check('0. AA_812 那七格（CELLS_812）現在是新字（還原成舊字以後才拿 NOW 和源稿、重匯以前比）',C.CELLS_812.length===7&&C.CELLS_812.every(r=>C.cell812(NOW812,r)===(r.now||r.new)&&C.cell812(NOW,r)===r.old),JSON.stringify(C.CELLS_812.map(r=>C.cell812(NOW812,r))));   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：第六格（子晴 D06.cafe 第一次選項的回覆）AA 在 AA_846 late_fix 改回「下次我請你吃滷味。」，AA_812 path_rows 那一列被取代（import_date_lines.py SUPER812）——那一格現在認 CELLS_812 的 now。舊期望：七格都＝r.new */
const SRC={}, OLDSRC={}, REC={}; for(const k of LOCS){ const t=show(SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'), r=show(SHA,SP+'date_rewrite/an_'+k+'.json'); if(t) SRC[k]=C.src248(k,JSON.parse(t));   /* 52c3ee258 起源稿有 fx：只比字（date_src_sha.js noFx） */ if(u) OLDSRC[k]=JSON.parse(u); if(r) REC[k]=JSON.parse(r); }   /* 2026-11-12（X324 可昕續改，AA_819＋AA_822@07d50af2f7）：源稿可昕 72 格換了新字——src248 把那 72 格還原再比（date_src_sha.js KX_1112；逐格在 tests/kx_dates_1112_unit.js）。舊寫法：C.noFx(JSON.parse(t)) */
const haveSrc=Object.keys(SRC).length===33&&Object.keys(OLDSRC).length===33&&Object.keys(REC).length===33;
const ob=show(BASE,'src/data/date_lines.js'), WAS=ob?DL(ob):null;
/* 同一版子晴再改的 31 格：Dxx.json 裡的位置 → 遊戲檔的 of() 路徑（lines/…）、整份 leaves 的路徑（/loc/Dxx/lines/heroine_04/…）*/
const ALSO=C.ALSO_AN.map(a=>Object.assign({},a,{who:ZQ,p:a.path,full:'/loc/'+a.loc+'/lines/'+ZQ+'/'+a.path.replace(/^lines\//,''),srcp:'/lines/'+ZQ+'/'+a.path.replace(/^lines\//,'')}));
/* AA 交稿訊息裡的清單（格號是 date_rewrite.py list heroine_04 Dxx 的格號）*/
const AA31='D03:8｜D05:29｜D10:5｜D12:31、41｜D14:11｜D16:29｜D17:2｜D19:8、40｜D21:52｜D22:30｜D23:11｜D25:2、51｜D26:2、7、11、12、20、21、22、30、54｜D27:1、10｜D28:9、43｜D29:1、52｜D30:3';
{ const ch=GM.choose; let n=0; GM.choose=async o=>{ if(++n>150) throw new Error('選單一直重來：'+J(o.map(x=>x.t||x.text))); return ch(o); }; GM._reset=()=>{ n=0; }; }
GM.money=d=>{ H.G.money+=d; };
const setup=(key,h,flags)=>{ const G=H.fresh(key,h,'dorm',flags||{}); G.outings=[]; G.contacts=G.contacts||{}; G.money=50000; GM._reset(); return G; };
const know=id=>{ H.CLOSE(id); H.G.contacts[id]=1; };
const getp=(o,pth)=>pth.match(/\[\d+\]|[^.\[\]]+/g).reduce((x,t)=>x==null?x:x[t[0]==='['?+t.slice(1,-1):t],o);

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
    const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&[PREV,'a29a8aba0','f9c1a2b80','0a2136911','82c946ad7','2883197b6'].every(s=>(e[0].history||[]).some(h=>h.sha===s))); });
    check('1. 白名單 D01～D33 都是 '+SHA+'、approved，前六版（子晴 '+PREV+'、芷若 a29a8aba0、可昕 f9c1a2b80、語彤 0a2136911、學姊 82c946ad7、沛珊 2883197b6）留在 history',bad.length===0,J(bad));
    const e7=allow.filter(x=>x.path===SP+'AA_777_an_date_common.json'), e8=allow.filter(x=>x.path===SP+'AA_778_an_wish.json');
    check('1. 白名單 AA_777_an_date_common.json@'+C.AN_COMMON_SHA+'、AA_778_an_wish.json@'+C.AN_WISH_SHA+' 各一筆、approved、有 approvedBy；date_lines.js 的來源寫著 33 個地點 @'+SHA+' 和 AA_777',e7.length===1&&e7[0].sha===C.AN_COMMON_SHA&&e7[0].status==='approved'&&!!e7[0].approvedBy&&e8.length===1&&e8[0].sha===C.AN_WISH_SHA&&e8[0].status==='approved'&&!!e8[0].approvedBy&&LOCS.every(k=>NOW.source.includes(k+'.json@'+SHA))&&NOW.source.includes('AA_777_an_date_common.json@'+C.AN_COMMON_SHA));
    console.log(haveSrc&&WAS?'（稿和 BASE 都讀得到：逐字比對）':'（這份 checkout 讀不到企劃線的稿或 BASE：不比稿，只驗結構）');
    if(haveSrc){ const tmp=path.join(os.tmpdir(),'date_lines_an1111_'+process.pid+'.js'); let out='', ok=false;
      try{ out=cp.execFileSync('python3',['tools/date/import_date_lines.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<26}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_lines.js'); }catch(e){ out=String(e.stderr||e.stdout||e.message).slice(0,600); }
      try{ fs.unlinkSync(tmp); }catch(e){}
      check('1. tools/date/import_date_lines.py 重匯（--out 另存）的結果和 src/data/date_lines.js 一樣（沒有「原句還在源稿裡」停下來的列）',ok&&!/原句還在源稿裡/.test(out),ok?'':out.slice(0,600));
      const m=/以安重寫（DLG-FULL-REVIEW-1110）跳過的改句 (\d+) 列（其中 AA_594 第 2-14 節 (\d+) 列）：(.*)/.exec(out)||[], body=String(m[3]||''), rows=body?body.split(/；(?=AA_\d+ )/):[];
      const L8=['AA_359 5-2 D26「（她在手帳上寫了一行，闔起來）明天幾點的車？我送你。」','AA_359 5-2 D28「早上我去走了一圈。這裡的巷子比地圖上的多。」','AA_359 5-2 D31「早上的湖有霧。能見度比我算的低。」','AA_359 5-3 D32「下次早上來。下午的雲比較薄。」','AA_524 A8 D09「夜景很好看。另一個原因，下次再說。」','AA_524 A9 D14「好。我帶你去。高美濕地那邊。」','AA_524 A9 D16「好。我寫進手帳了。」','AA_524 A9 D16「上次說要去最南邊。還在手帳上。」'];
      const WHY=/（(已經是改成的字（源稿寫回了）|那一格新稿重寫成「.+」)）$/, r594=rows.filter(r=>/^AA_594 第 \d+ 列 D\d\d「/.test(r)), r694=rows.filter(r=>/^AA_694 第 3 節第 \d+ 列 /.test(r)), r8=rows.filter(r=>!/^AA_(594|694) /.test(r));
      check('1. 以安跳過的列：修正層她的八列（AA_359 5-2 的 D26、D28、D31，5-3 的 D32；AA_524 A8 的 D09、A9 的 D14、D16 兩句）每一列都印出來、都寫了是哪一種（源稿寫回了／那一格重寫成哪一句）',+m[1]===rows.length&&r8.length===8&&L8.every(x=>r8.some(r=>r.startsWith(x)&&WHY.test(r))),J([m[1],rows.length,r8]));
      const back=r594.filter(r=>/（已經是改成的字（源稿寫回了））$/.test(r)).length;
      check('1. AA_594 第 2-14 節她各地點的列 288 列照 path 對、全部跳過、逐列寫了是哪一種（源稿寫回了 '+back+' 列、那一格重寫了 '+(r594.length-back)+' 列）；不分地點的那幾列照舊換（工具印「換了 n 列」，n≥1）；其餘 '+r694.length+' 列都是 AA_694 第 3 節跟著跳過的',+m[2]===288&&r594.length===288&&r594.every(r=>WHY.test(r))&&back>=100&&r594.length-back>=150&&r8.length+r594.length+r694.length===rows.length&&r694.every(r=>/（以安的句子，新稿重寫了）$/.test(r))&&/AA_594 第 2-14 節：314 列，換了 [1-9]\d* 列（其他是 BB_240 補回原句；以安重寫：她各地點的列源稿寫回了 \d+ 列、那一格重寫了 \d+ 列，都跳過）/.test(out),J([m[2],r594.length,back,r694.length]));
      console.log('（以安跳過 '+rows.length+' 列：'+r8.map(r=>r.replace(/^(AA_\d+ .*?D\d\d)「.*?」（(.*)）$/,'$1＝$2')).join('、')+'；AA_594 '+r594.length+' 列；AA_694 第 3 節 '+r694.length+' 列）');
      check('1. 別人跳過的列數照舊：語彤 292 列（AA_630 第 2 節 209 列）、學姊 95 列、沛珊 11 列、可昕 3 列、芷若 10 列、子晴至少 10 列；AA_767 六列、AA_769 七列、AA_773 九列、AA_775 五列、AA_777 四列照 path 都換了',/語彤重寫（DLG-FULL-REVIEW-1110）跳過的改句 292 列（其中 AA_630 第 2 節 209 列）/.test(out)&&/學姊重寫（DLG-FULL-REVIEW-1110）跳過的改句 95 列/.test(out)&&/沛珊重寫（PEISHAN-VOICE-1110）跳過的改句 11 列/.test(out)&&/可昕重寫（DLG-FULL-REVIEW-1110）跳過的改句 3 列/.test(out)&&/芷若重寫（DLG-FULL-REVIEW-1110）跳過的改句 10 列/.test(out)&&/子晴重寫（DLG-FULL-REVIEW-1110）跳過的改句 1\d 列/.test(out)&&/AA_767@0a2136911：語彤不分地點的短句 6 列（照 path），換了 6 列/.test(out)&&/AA_769@f9c1a2b80：可昕不分地點的短句 7 列（照 path），換了 7 列/.test(out)&&new RegExp('AA_773@'+C.ZR_COMMON_SHA+'：芷若不分地點的短句 9 列（照 path），換了 9 列').test(out)&&new RegExp('AA_775@'+C.ZQ_COMMON_SHA+'：子晴不分地點的短句 5 列（照 path），換了 5 列').test(out)&&new RegExp('AA_777@'+C.AN_COMMON_SHA+'：以安不分地點的短句 4 列（照 path），換了 4 列').test(out));   /* 2026-11-12（X324 學姊續改 AA_837＋AA_838@a573a50dca）：學姊跳過的列 81→86（AA_598 逐句表第 11、30、41、45、57 列那五格這一版重寫了：已經是新句 34→29、跳過 55→60）。舊期望：跳過的改句 81 列 */   /* 2026-11-12（X324「好」開頭回話 AA_842@41f77eab53）：學姊跳過的列 86→95——AA_598 逐句表第 19、33、44、46、55 列（D11 圖書館、D19 木屋、D24 泡腳／車站、D29 鐵道第一次選項的回話，原句都是「好。…」開頭）那五格這一版重寫了（換 4→1、已經是新句 29→27、跳過 60→65），AA_694 第 3 節第 162、195、196、238 列跟著跳過（22→26）。舊期望：跳過的改句 86 列 */   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：語彤跳過的列 289→292——AA_694 第 3 節第 158、161、176 列（D19、D21 再訪句，原句「上次…」開頭，這一版重寫了）跟著跳過（80→83）；AA_630 第 2 節還是 209 列（其中 D-028、079、094、112、130、134、151、159、175 九列從「源稿已經是改成的字」變成「那一格新稿重寫了」）。舊期望：語彤跳過的改句 289 列 */
      check('1. AA_780（以安匯入以後 AA 的後續改稿，@'+C.AN_FOLLOW_SHA+'）：date_lines.js 五列照 path 都換了（工具印「換了 5 列」；逐字在第 9 節）',new RegExp('AA_780@'+C.AN_FOLLOW_SHA+'：以安、子晴、語彤、芷若「第二次當天取消」那一句 5 列（照 path），換了 5 列').test(out)); }
    const tool=read('tools/date/import_date_lines.py'), code=tool.replace(/^""".*?"""/s,'').replace(/#.*$/mg,'');
    check('1. 工具只對重寫過的七個人放寬（ps_skip 先看 who；別人的列照舊 sys.exit）；以安的列原句還在＝不寫檔、全部列出來停下（AN_STALE；AA_594 她各地點的列也一樣）；工具裡沒有寫死這一輪的 SHA（只有上一版 AN_PREV）',/if who not in \(PS, SIS, YT, KX, ZR, ZQ, AN\) or not ps756\(loc, who\):\s+return False/.test(tool)&&tool.includes("AN = 'heroine_01'")&&tool.includes("AN_PREV = '"+PREV+"'")&&/if AN_STALE:[^\n]*\n\s+sys\.exit\(/.test(tool)&&/if who not in \(ZR, ZQ, AN\) or not ps756\(loc, who\) or old == new:/.test(tool)&&/AN_STALE\.append\(\(f'AA_594 第/.test(tool)&&!code.includes(SHA)&&!code.includes(C.AN_WISH_SHA)); });

  await sec(2,async()=>{ if(!haveSrc){ for(const k of LOCS) check('2. '+k+'：以安有台詞',!!(NOW.loc[k].lines&&NOW.loc[k].lines[AN])); return; }
    let n=0; const bad=[];
    for(const k of LOCS){ const g=of(NOW.loc[k],k,AN), s=of(SRC[k],k,AN);
      for(const p of new Set(Object.keys(g).concat(Object.keys(s)))){ n++; if(g[p]!==s[p]) bad.push(k+' '+p+'：稿「'+s[p]+'」遊戲「'+g[p]+'」'); } }
    /* D13 合照那一段第一格「第 6 階以上」稿上寫成旁白，其實是給開發看的條件——匯入工具照舊改成 who:'note'（NOTE_NARR；重寫以前就這樣），字沒動 */
    check('2. 以安 33 個地點 '+n+' 格（台詞、選項的字、tier、喜好、不喜歡那一句）和源稿 '+SHA+' 一字不差、格子一樣多（只差 D13 合照「第 6 階以上」那一格照舊標成不顯示的註記）',n>4500&&J(bad)===J(['D13 lines/hotspots/D13.photo/extra:合照/0/lines/0/who：稿「narr」遊戲「note」'])&&NOW.loc.D13.lines[AN].hotspots['D13.photo']['extra:合照'][0].lines[0].text==='第 6 階以上',J(bad.slice(0,6)));
    let ch=0, cht=0, cho=0, chd=0; const miss=[], st=[]; for(const k of LOCS){ const s=of(SRC[k],k,AN), o=of(OLDSRC[k],k,AN), g=of(NOW.loc[k],k,AN); for(const p of new Set(Object.keys(s).concat(Object.keys(o)))) if(s[p]!==o[p]){ ch++; if(/\/text$/.test(p)) cht++; else if(/\/t$/.test(p)) cho++; else if(/^dislikeLine\//.test(p)) chd++; else st.push(k+' '+p); if(g[p]!==s[p]) miss.push(k+' '+p); } if(J(Object.keys(s).sort())!==J(Object.keys(o).sort())) st.push(k+' 格子不一樣多'); }
    check('2. 源稿和上一版 '+PREV+' 逐格比：以安 '+ch+' 格不同（台詞 '+cht+'、選項的字 '+cho+'、不喜歡那一句 '+chd+'）、每一格都照稿；不同的都是字（tier、喜好、who、旗標、格子數沒動）',ch>=700&&cho>=8&&miss.length===0&&st.length===0,J([ch,miss.slice(0,4),st.slice(0,4)]));
    /* 紀錄的第 n 格（0 起算）＝date_rewrite.py list 的第 n+1 格；null＝沒動 */
    let tot=0, nn=0; const lost=[], off=[], len=[];
    for(const k of LOCS){ const r=REC[k][k], c=slots(SRC[k],AN).map(cell), g=slots(NOW.loc[k],AN).map(cell); tot+=r.length;
      if(r.length!==c.length||g.length!==c.length) len.push(k+' 紀錄 '+r.length+' 格、源稿 '+c.length+' 格、遊戲 '+g.length+' 格');
      r.forEach((t,i)=>{ if(t==null) return; nn++; if(g[i]!==t) lost.push(k+'#'+(i+1)+'：'+t); if(c[i]!==t) off.push(k+'#'+(i+1)); }); }
    check('2. 改稿紀錄 an_D01～D33.json：'+tot+' 格裡有新字的 '+nn+' 格，每一格的 new 都在遊戲裡同一格（第 n 格就是源稿、遊戲的第 n 格）；每個地點紀錄的格數＝源稿的格數（台詞＋選項＋不喜歡那一句）；33 個檔都沒有 for_LAWWW、who 都是 heroine_01',tot>1700&&nn>=700&&len.length===0&&off.length===0&&lost.length===0&&LOCS.every(k=>!(REC[k]._meta||{}).for_LAWWW&&REC[k].who===AN),J([tot,nn,off.slice(0,4),len,lost.slice(0,4)]));
    if(WAS){ let d=0, back=0, nul=0; const stt=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,AN), w=of(WAS.loc[k],k,AN), s=of(SRC[k],k,AN), o=of(OLDSRC[k],k,AN); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))){ if(g[p]!==w[p]) d++; else if(s[p]!==o[p]) back++; } if(J(Object.keys(g).sort())!==J(Object.keys(w).sort())) stt.push(k);
        const r=REC[k][k], a=slots(WAS.loc[k],AN).map(cell), b=slots(NOW.loc[k],AN).map(cell); b.forEach((t,i)=>{ if(t!==a[i]&&r[i]==null) nul++; }); }
      check('2. 以安的格子和重匯以前（'+BASE+'）比：'+d+' 格不同；源稿改了、遊戲沒變的 '+back+' 格＝AA 把遊戲原本疊著的修正（AA_594、AA_524、AA_359）寫回源稿的格子（AA_594 其餘「已經是改成的字」的列，上一版源稿就已經是那個字）；紀錄寫 null（沒動）的格子遊戲裡一格都沒變；每個地點的格子（選項數、tier、喜好）一樣多',d>=700&&d+back===ch&&back>=50&&nul===0&&stt.length===0,J([d,back,ch,nul,stt])); } });

  await sec(3,async()=>{ if(!WAS) return;
    const strip=D=>{ const x=JSON.parse(J(D)); delete x.source; if(x.lines) delete x.lines[AN]; for(const k in x.loc) for(const part of ['lines','likes','dislikeLine']) if(x.loc[k][part]) delete x.loc[k][part][AN]; return x; };
    /* 2026-11-11（AA_780_an_date_followup.json@248c8e390，以安匯入以後 AA 的後續改稿）：子晴 flaked[0]、語彤 flaked[0][0]、芷若 flaked[0][1] 改成第二次當天取消的當下反應——
       NOW 先用 date_src_sha.js 的 un780 把那三格還原成各人自己那一輪的字再比，那三格另外驗現在＝新字、重匯以前＝舊字（逐字在第 9 節）。舊期望：直接拿 NOW 比 */
    const N7=C.un780(NOW);
    check('3. AA_780 換的別人那三格（子晴 flaked[0]、語彤 flaked[0][0]、芷若 flaked[0][1]）：現在是新字、重匯以前（'+BASE+'）是她們自己那一輪的字；整份還原以後和 NOW 只差這三格',C.FLAKED_780.length===3&&C.FLAKED_780.every(r=>C.cell780(NOW,r)===r.new&&C.cell780(WAS,r)===r.old)&&(()=>{ const x=leaves(NOW,'',{}), y=leaves(N7,'',{}); return J(Object.keys(x).filter(p=>x[p]!==y[p]).sort())===J(C.FLAKED_780.map(r=>r.p).sort()); })(),J(C.FLAKED_780.map(r=>[C.cell780(NOW,r),C.cell780(WAS,r)])));
    const a=leaves(strip(WAS),'',{}), b=leaves(strip(N7),'',{}), ka=Object.keys(a), diff=ka.filter(p=>a[p]!==b[p]).concat(Object.keys(b).filter(p=>!(p in a))).sort();
    check('3. 別人的格子、預約句、交通偏好、互動點（'+ka.length+' 格）和重匯以前（'+BASE+'）比：只有同一版子晴再改的那 31 格不同（old、new 都對），其他零差異（AA_780 那三格還原再比）',ka.length>26000&&ALSO.length===31&&J(diff)===J(ALSO.map(x=>x.full).sort())&&ALSO.every(x=>a[x.full]===x.old&&b[x.full]===x.new),J(diff.slice(0,8).map(p=>p+'：'+a[p]+' → '+b[p])));
    for(const [who,nm] of [[SIS,'學姊'],[PS,'沛珊'],[YT,'語彤'],[KX,'可昕'],[ZR,'芷若'],[ZQ,'子晴'],['classmate_xinci','芯慈']]){ let n=0; const d=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,who), w=of(WAS.loc[k],k,who); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))){ n++; if(g[p]!==w[p]) d.push(k+' '+p); } }
      const exp=ALSO.filter(x=>x.who===who).map(x=>x.loc+' '+x.p).sort();
      check('3. '+nm+' 33 個地點 '+n+' 格和重匯以前比：'+(exp.length?'剛好那 '+exp.length+' 格不同':'零差異')+'；不分地點的短句一樣'+(C.FLAKED_780.some(r=>r.who===who)?'（flaked 那一格 AA_780 再換，還原再比）':''),n>(who==='classmate_xinci'?150:3500)&&J(d.sort())===J(exp)&&exp.length===(who===ZQ?31:0)&&J(N7.lines[who])===J(WAS.lines[who]),J([n,d.slice(0,4)])); }   /* 2026-11-11（AA_780@248c8e390）：短句改比 N7（子晴、語彤、芷若 flaked 那一格還原；上面另外驗）；舊期望 J(NOW.lines[who])===J(WAS.lines[who]) */
    check('3. 交通偏好（prefs）、互動點名稱（points）和重匯以前一樣',J(NOW.prefs)===J(WAS.prefs)&&LOCS.every(k=>J(NOW.loc[k].points)===J(WAS.loc[k].points)));
    /* 子晴那 31 格的格號對 AA 交稿訊息的清單 */
    const by={}; for(const x of C.ALSO_AN) (by[x.loc]=by[x.loc]||[]).push(x.n); const mine=Object.keys(by).sort().map(k=>k+':'+by[k].sort((p,q)=>p-q).join('、')).join('｜');
    check('3. 子晴 31 格的格號（date_rewrite.py list heroine_04 Dxx）就是 AA 交稿的清單：'+AA31,mine===AA31,mine);
    if(haveSrc){ const other=[], zq=[]; for(const k of LOCS){ const a=leaves(SRC[k],'',{}), b=leaves(OLDSRC[k],'',{}); for(const p of new Set(Object.keys(a).concat(Object.keys(b)))) if(a[p]!==b[p]&&!/^\/(lines|likes|dislikeLine)\/heroine_01\//.test(p)) other.push(k+p);
        const s1=slots(SRC[k],ZQ).map(cell), s0=slots(OLDSRC[k],ZQ).map(cell); s1.forEach((t,i)=>{ if(t!==s0[i]) zq.push(k+':'+(i+1)+':'+s0[i]+'→'+t); }); if(s1.length!==s0.length) zq.push(k+' 格數不同'); }
      check('3. 源稿 '+SHA+' 和上一版 '+PREV+' 逐格比：以安以外的人只有子晴那 31 格不同（學姊、沛珊、語彤、可昕、芷若 0 格）；照格號數也是同一組、old／new 都對',J(other.sort())===J(ALSO.map(x=>x.loc+x.srcp).sort())&&J(zq.sort())===J(C.ALSO_AN.map(x=>x.loc+':'+x.n+':'+x.old+'→'+x.new).sort()),J([other.length,zq.length,other.slice(0,4)])); } });

  await sec(4,async()=>{
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：S.REMEMBER_IF 拿掉子晴 D06.cafe 那一列（再訪不分第一次選了什麼都聽 remember 的新句、她請；PICK_FLAG 照記 ZQ_D06_TREAT）——REMEMBER_IF 剩 2 筆（子晴 D15、沛珊 D05），D06.cafe 那一列不在。舊期望：REMEMBER_IF 3 筆（子晴 D06／D15、沛珊 D05） */
    check('4. 拿選項的字當 key 的地方沒有以安的項目：PICK_FLAG、REMEMBER_IF、ARRIVE_VAR 都沒有 heroine_01（AA_777：grep 過 0 筆）；S.LINE_IF 她只有 enough 一條（認 date3d.js 手寫的「明天早上有課」，不是地點台詞；2026-11-11 AA_780 以後那一句不說了，條件留著、不擋任何一句——第 9 節）；總數 PICK_FLAG 3、REMEMBER_IF 2（AA_812@633b7f7d6 拿掉子晴 D06.cafe 那一列）、ARRIVE_VAR 2',!DATE.PICK_FLAG.some(x=>x.who===AN)&&!DATE.REMEMBER_IF.some(x=>x.who===AN)&&!DATE.ARRIVE_VAR.some(x=>x.who===AN)&&J(Object.keys(DATE.LINE_IF[AN]||{}))===J(['enough'])&&DATE.PICK_FLAG.length===3&&DATE.REMEMBER_IF.length===2&&!DATE.REMEMBER_IF.some(r=>r.loc==='D06'||r.pid==='D06.cafe')&&DATE.ARRIVE_VAR.length===2);
    const bad=[]; for(const v of DATE.ARRIVE_VAR){ const F=(((NOW.loc[v.loc]||{}).lines||{})[v.who]||{}).arrive, T=F&&F.first?F.first.lines.map(x=>x.text):[]; if(!v.from.every(t=>T.includes(t))) bad.push('ARRIVE_VAR '+v.loc+' '+v.who); }
    for(const r of DATE.PICK_FLAG){ const h=((((NOW.loc[r.loc]||{}).lines||{})[r.who]||{}).hotspots||{})[r.pid], c=h&&h.first&&h.first.choice||[]; if(!c.some(x=>x.t===r.t)) bad.push('PICK_FLAG '+r.loc+' '+r.who+' '+r.t); }
    for(const r of DATE.REMEMBER_IF){ const h=((((NOW.loc[r.loc]||{}).lines||{})[r.who]||{}).hotspots||{})[r.pid]; if(!(h&&h.remember&&h.remember.lines&&h.remember.lines.length)) bad.push('REMEMBER_IF '+r.loc+' '+r.who+' '+r.pid); }
    check('4. ARRIVE_VAR（沛珊 D28、可昕 D32）、PICK_FLAG、REMEMBER_IF（子晴 D06／D15、沛珊 D05）重匯以後都還對得上資料（子晴再改的 31 格沒碰到這幾個互動點的選項）',bad.length===0,J(bad));
    const a4=read('src/aa524_3d.js');
    check('4. aa524_3d.js 的 remember 多一句只有兩筆（芷若 D04、語彤 D10），沒有以安的地點項目',(a4.match(/\{key:'[a-z0-9]+',loc:'D\d\d',who:'/g)||[]).length===2&&!/loc:'D\d\d',who:'heroine_01'/.test(a4));
    const code=[]; const walk=d=>{ for(const f of fs.readdirSync(path.join(H.ROOT,d))){ const p=d+'/'+f; if(fs.statSync(path.join(H.ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)&&p!=='src/data/date_lines.js') code.push([p,read(p).replace(/\/\*[\s\S]*?\*\//g,'')]); } }; walk('src');
    if(WAS){ const olds=new Set(), oopt=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,AN), w=of(WAS.loc[k],k,AN), cur=new Set(Object.values(g)); for(const p in w) if(typeof w[p]==='string'&&(/\/(text|t)$/.test(p)||/^dislikeLine\//.test(p))&&g[p]!==w[p]){ if(/\/t$/.test(p)) oopt.push([k,p.split('/')[2],w[p]]); if(w[p].replace(/[「」]/g,'').length>=8&&!cur.has(w[p])) olds.add(w[p]); } }
      const hit=[]; for(const s of olds) for(const [f,c] of code) if(c.includes(s)) hit.push(f+' '+s);
      /* 對到的三句都不是抄約會台詞的 key：前兩句是她自己的心願事件（D07 第一次來，date_wish.js 的 hotspots D07.cell 選項③回覆、D07.path 第一句；D07 再訪的格原本重複用了同一句，新稿換掉了）——
         AA_778 把第一句的刪節號拿掉以後剛好和舊的再訪句同字；第三句是 heroine_arcs.js 以安主線裡的「……好。這樣比較公平。」（別的場合、帶刪節號，只是後半同字） */
      const OKHIT=['src/data/date_wish.js 好。你說得對，我需要一下。','src/data/date_wish.js 走一走。剛剛那裡，我需要一點空氣。','src/data/heroine_arcs.js 好。這樣比較公平。'];
      check('4. 以安換掉的舊句、舊選項（八個字以上、新稿那個地點已經沒有的 '+olds.size+' 句）沒有留在 src/ 的程式和資料檔裡（date_lines.js 以外 '+code.length+' 個檔）——同字的只有她心願事件自己的兩句、主線「……好。這樣比較公平。」一句（都不是照約會台詞抄的）',olds.size>400&&code.length>100&&hit.every(x=>OKHIT.includes(x))&&DATE_WISH.events[AN].hotspots['D07.cell'].choices[2].reply[0].text==='好。你說得對，我需要一下。'&&/* 2026-11-12：AA_712@abb9609116 重匯（上一任 AA 11-11 拿掉句首刪節號）——主線那一句現在是「好。這樣比較公平。」，仍然只有 heroine_arcs.js 這一處 */read('src/data/heroine_arcs.js').includes('"好。這樣比較公平。"'),J(hit.filter(x=>!OKHIT.includes(x)).slice(0,4)));
      const hit2=[]; for(const [k,pid,t] of oopt) for(const [f,c] of code){ let i=-1; while((i=c.indexOf(t,i+1))>=0){ const near=c.slice(Math.max(0,i-200),i+200); if(near.includes(pid)||(near.includes("'"+k+"'")&&near.includes(AN))) hit2.push(f+' '+pid+' '+t); } }
      check('4. 換掉的舊選項（'+oopt.length+' 個）沒有哪個程式檔把它和那個互動點寫在一起當 key',oopt.length>=8&&hit2.length===0,J(hit2.slice(0,4)));
      const treat=D=>LOCS.reduce((a,k)=>{ const hs=D.loc[k].lines[AN].hotspots||{}; for(const pid in hs) for(const c of ((hs[pid].first||{}).choice||[])) if(DATE.isTreat(c.t)) a.push(pid+c.t); return a; },[]);
      check('4. 請客的選項（DATE.isTreat 看選項的字）和重匯以前同一組（'+treat(NOW).length+' 個：'+treat(NOW).join('、')+'）——請客的選項一個都沒換字',J(treat(NOW))===J(treat(WAS))&&treat(NOW).length>=6&&treat(NOW).includes('D06.cafe「我請妳。」'),J([treat(NOW),treat(WAS)]));
      const opts=[]; let t=0; for(const k of LOCS){ const g=of(NOW.loc[k],k,AN), w=of(WAS.loc[k],k,AN); for(const p in g) if(/\/t$/.test(p)){ t++; if(g[p]!==w[p]) opts.push(k+' '+p.replace(/^lines\/hotspots\//,'').replace('/first/choice/','#').replace(/\/t$/,'')+' '+w[p]+'→'+g[p]); } }
      check('4. 以安的選項（'+t+' 個）和重匯以前比換字 '+opts.length+' 個（其餘稿上換的選項，遊戲裡原本就是 AA_594 疊上去的字）：D06 草地兩個、D20 台車①、瀑布②、D27 鐵道②、D28 夕陽②、D29 雕塑②、港邊①',opts.length>=8&&['D06 D06.lawn#0 「五分鐘夠嗎？」→「坐我的外套。」','D06 D06.lawn#1 「不要設計時。」→「直接坐吧。」','D20 D20.trolley#0 「妳每次都查。」→「人推的？」','D20 D20.falls#1 「妳又查了。」→「妳在算高度？」','D27 D27.rail#1 「妳每次都查。」→「它還會開嗎？」','D28 D28.sunset#1 「妳每次都查。」→「妳怎麼知道剛好？」','D29 D29.sculpture#1 「站在影子裡。」→「繞到後面看。」','D29 D29.harbor#0 「看夕陽。」→「看船。」'].every(x=>opts.includes(x)),J(opts));
      const kk=D=>LOCS.map(k=>{ const hs=D.loc[k].lines[AN].hotspots||{}; return Object.keys(hs).map(pid=>Object.keys(hs[pid]).map(q=>[].concat(hs[pid][q]).map(b=>((b&&b.choice)||[]).map(c=>Object.keys(c).sort().join(',')).join('|')).join('/')).join(';')).join(';;'); }).join('\n');
      check('4. 每個選項物件的欄位（t、reply、fx、記的旗標…）和重匯以前一樣',kk(NOW)===kk(WAS)); } });

  await sec(5,async()=>{
    const bad=[]; for(const x of ALSO){ const g=of(NOW.loc[x.loc],x.loc,ZQ); if(g[x.p]!==x.new||Object.values(g).includes(x.old)) bad.push(x.loc+':'+x.n+' '+g[x.p]); }
    check('5. 子晴再改的 31 格：每一格現在是 AA 的新字、上一版的字不在她那個地點的格子裡（改稿紀錄 zq_Dxx.json 的 _meta.fix_vs_an／fix_lawww_1111／fix_bb340c）',ALSO.length===31&&bad.length===0,J(bad.slice(0,4)));
    check('5. 抽三格照稿：D10 到達「你連我的水都帶了？謝謝。我沒有想到要帶你的。」（不再「先欠著」）、D14 交往收尾「這裡的夕陽我想再看一次。跟你。」（不再「我會努力起床」）、D26 草悟道「（草悟道）我以前都騎腳踏車經過，沒有停下來過。」',NOW.loc.D10.lines[ZQ].arrive.normal[2].lines[0].text==='你連我的水都帶了？謝謝。我沒有想到要帶你的。'&&NOW.loc.D14.lines[ZQ].closing.dating[0].lines[0].text==='這裡的夕陽我想再看一次。跟你。'&&NOW.loc.D26.lines[ZQ].hotspots['D26.path'].first.lines[0].text==='（草悟道）我以前都騎腳踏車經過，沒有停下來過。'); });

  await sec(6,async()=>{ const LA=NOW.lines[AN];
    /* 2026-11-11（AA_780_an_date_followup.json@248c8e390，以安匯入以後 AA 的後續改稿）：flaked 兩則再換——引擎是 30 天內第二次當天取消的當下說的，沒有「等了四十分鐘」這回事（逐字在第 9 節）。
       舊期望：flaked＝[['那天我等了四十分鐘。我有帶書，所以還好。','下次請提早說。謝謝。']]（AA_777 的字）*/
    check('6. lines.heroine_01 四格照稿：move 第二句「可以。那天我空得出來。」、transport「好，開車也可以。本來想在路上看書的，那就到了再看。」、flaked 連發兩則（AA_780 再換）「第二次了。我不問原因。」「不能來的話，請早一點說。謝謝。」（AA_777 是「那天我等了四十分鐘。我有帶書，所以還好。」「下次請提早說。謝謝。」）',LA.move[1]==='可以。那天我空得出來。'&&J(LA.transport)===J(['好，開車也可以。本來想在路上看書的，那就到了再看。'])&&J(LA.flaked)===J([['第二次了。我不問原因。','不能來的話，請早一點說。謝謝。']]),J(LA));
    check('6. 不改的照舊：accept 兩句、acceptDating、move 第一句、move3、cancel 連發兩則；她沒有 depart、enough、leaveEarly、noPair（資料檔裡）',J(LA.accept)===J(['好。我記到行事曆了。','可以。那天我沒有排別的。'])&&J(LA.acceptDating)===J(['好。那天我空下來。'])&&LA.move[0]==='好。新的時間我改好了。'&&J(LA.move3)===J(['第三次了。可以。你最近很忙嗎？'])&&J(LA.cancel)===J([['好。怎麼了？','好。下次早一點講。']])&&J(Object.keys(LA).sort())===J(['accept','acceptDating','cancel','flaked','move','move3','transport']),J(Object.keys(LA)));
    /* AA_777 的 _meta 寫「她沒有 depart、enough、leaveEarly、noPair 的專屬句（來源檔裡沒有，照引擎的通用句）」——資料檔裡確實沒有，可是 src/date3d.js 的 S.EXTRA_LINES.heroine_01 有手寫的七句
       （AA_594 那一輪的；S.lineFor 在資料檔沒有那一格時用）。這七句 AA_777 沒列、匯入沒動，已回報 LAWWW 轉 AA（其中四句還有刪節號）。AA 之後給了新句，改這一條的期望 */
    /* 2026-11-11（AA_780_an_date_followup.json@248c8e390）：AA 更正（她漏看 date3d.js）——depart 三句不改；enough 兩句、leaveEarly、noPair 照 AA_780 換字（逐字在第 9 節）。
       舊期望：AA_777 沒列、照舊沒動＝enough「……今天差不多了。明天早上有課。」「排的都走完了。……多走的那一段，我很喜歡。」、leaveEarly「……這樣就回去了？好。排好的，下次再用。」、noPair「照片？……我幫你拍。我拍得比較正。」*/
    const EX=DATE.EXTRA_LINES&&DATE.EXTRA_LINES[AN];
    check('6. date3d.js 手寫的以安專屬句（S.EXTRA_LINES）：depart 三句照舊（AA_780：不用改）；enough 兩句、leaveEarly、noPair 是 AA_780 的字（拿掉刪節號、不綁「明天早上有課」、不說「下次再用」）',!!EX&&J(EX.depart)===J(['我到了。早到十分鐘。你慢慢來。','出門了。傘帶了。','車上。我在看等一下要去的地方的地圖。'])&&J(EX.enough)===J(['今天差不多了。再走下去，我會開始看錶。','排的都走完了。多走的那一段，我很喜歡。'])&&J(EX.leaveEarly)===J(['這樣就回去了？好。排好的那幾個地方不會跑。'])&&J(EX.noPair)===J(['照片？我幫你拍。我拍得比較正。']),J(EX));
    const HOME='（晚上她回家。你住在車站附近的旅館。）', d3=read('src/date3d.js').replace(/\/\*[\s\S]*?\*\//g,'');
    check('6. date3d.js 五格：S.MORNING「早餐我查過了，走路五分鐘。」、S.MORNING_OWN「早。我買了以前上學路上那家的飯糰，兩個，一個是你的。」（不再是媽媽做早餐）、S.HOME_NO「「那幾天我在台中。換一天。」」、S.T7A_YES「臺中？好。我去車站接你。」；S.NIGHT_HOME 多一列 D26＋以安（＝「'+HOME+'」）；舊句不在程式裡',DATE.MORNING[AN]==='早餐我查過了，走路五分鐘。'&&DATE.MORNING_OWN[AN]==='早。我買了以前上學路上那家的飯糰，兩個，一個是你的。'&&DATE.HOME_NO[AN]==='「那幾天我在台中。換一天。」'&&DATE.T7A_YES[AN]==='臺中？好。我去車站接你。'&&J(DATE.NIGHT_HOME)===J([{loc:'D29',who:KX},{loc:'D26',who:ZQ},{loc:'D26',who:AN}])&&DATE.NIGHT.home===HOME&&!/我媽多做了一份早餐|早餐我查過了。……|那幾天我在台中。……|臺中？……好。/.test(d3),J([DATE.MORNING[AN],DATE.MORNING_OWN[AN],DATE.HOME_NO[AN],DATE.T7A_YES[AN],DATE.NIGHT_HOME]));
    const raw=show(C.AN_COMMON_SHA,SP+'AA_777_an_date_common.json'), A=raw?JSON.parse(raw):null;
    if(A){ const r1=A.rows.filter(r=>r.file==='src/data/date_lines.js'), r2=A.rows.filter(r=>r.file==='src/date3d.js');
      const at=r=>{ const m=/^S\.(MORNING|MORNING_OWN|HOME_NO|T7A_YES)\.heroine_01$/.exec(r.path); if(m) return DATE[m[1]][AN]; if(/^D26 /.test(r.path)) return DATE.NIGHT_HOME.some(x=>x.loc==='D26'&&x.who===AN)?DATE.NIGHT[DATE.nightKind({flags:{}},{who:AN,locs:['D26']},null)]:null; return undefined; };
      /* 2026-11-11（AA_780_an_date_followup.json@248c8e390）：flaked 兩列 AA_780 再換（AA_780 那兩列的 old＝這份稿的 new），那兩格改認 AA_780 的 new；move、transport 兩列照舊認這份稿的 new。舊期望：四列都＝這份稿的 new */
      const r780=(JSON.parse(show(C.AN_FOLLOW_SHA,SP+'AA_780_an_date_followup.json')||'{"rows":[]}').rows||[]), w780=r=>{ const x=r780.find(y=>y.path===r.path&&y.old===r.new); return x?x.new:r.new; };
      check('6. 逐字：稿 9 列（date_lines.js 四列、date3d.js 五列）；每一列的 new 在 path 那一格（D26 那一列＝對象是以安、地點 D26、她沒有先在臺中時晚上那一句；flaked 兩列＝AA_780 再換的字）',A.rows.length===9&&r1.length===4&&r2.length===5&&r1.every(r=>getp(NOW,r.path)===w780(r))&&J(r1.filter(r=>w780(r)!==r.new).map(r=>r.path))===J(['lines.heroine_01.flaked[0][0]','lines.heroine_01.flaked[0][1]'])&&r2.every(r=>at(r)===r.new),J(r1.filter(r=>getp(NOW,r.path)!==w780(r)).map(r=>r.path).concat(r2.filter(r=>at(r)!==r.new).map(r=>r.path+'＝'+at(r)))));
      if(WAS){ const a=leaves(WAS.lines[AN],'',{}), b=leaves(LA,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]).sort();
        check('6. lines.heroine_01 和重匯以前比：格子一樣多、只有這四格不同（照 path；old 就是原本那一格的字）',J(Object.keys(a))===J(Object.keys(b))&&J(d)===J(['/flaked/0/0','/flaked/0/1','/move/1','/transport/0'])&&r1.every(r=>getp(WAS,r.path)===r.old),J(d)); }
      const ob3=show(BASE,'src/date3d.js'); if(ob3){ const lit=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').match(/'(?:[^'\\\n]|\\.)*'/g)||[], O=lit(ob3), L=lit(show(C.AN_D3_SHA,'src/date3d.js')||read('src/date3d.js')) /* 「重匯以後」固定比 AN_D3_SHA（AA_777 進 date3d.js 的那個 commit）；之後這個檔再加別的字串不會讓這一條紅（同 zq／zr／yt 那三支的做法）*/, cnt=A=>A.reduce((m,t)=>(m[t]=(m[t]||0)+1,m),{}), co=cnt(O), cl=cnt(L), gone=[], came=[];
        for(const t of new Set(O.concat(L))){ const n=(cl[t]||0)-(co[t]||0); for(let i=0;i<Math.abs(n);i++) (n<0?gone:came).push(t); }
        const q=t=>"'"+t+"'", r4=r2.slice(0,4);
        check('6. date3d.js 的字串和重匯以前（'+BASE+'）比：少掉的剛好是稿上前四列的 old、多出來的剛好是四列的 new＋NIGHT_HOME 那一列的 \'D26\'、\'heroine_01\'（條件、別人的句子、程式沒動）',J(gone.sort())===J(r4.map(r=>q(r.old)).sort())&&J(came.sort())===J(r4.map(r=>q(r.new)).concat([q('D26'),q(AN)]).sort()),J([gone,came])); } }
    /* transport 那一句什麼時候播：她有交通偏好的地點、玩家改掉（prefOff）。「開車也可以」要成立＝另一種走法只有開車 */
    const P=NOW.prefs[AN]||{}, modes=k=>(DATE.loc(k).transport||[]).map(x=>x.mode);
    check('6. 以安有交通偏好的地點：D26 臺中、D27 嘉義、D28 臺南（都是高鐵），這三個地點另一種走法都只有開車——所以「好，開車也可以。…」只會在改成開車時播',J(Object.keys(P).sort())===J(['D26','D27','D28'])&&Object.keys(P).every(k=>P[k].transport==='hsr'&&modes(k).includes('hsr')&&J(modes(k).filter(m=>m!=='hsr'))===J(['car']))&&!LOCS.some(k=>!P[k]&&DATE.prefOf(AN,k)),J([P,modes('D26'),modes('D27'),modes('D28')]));
    const TL=LA.transport[0], res=[];
    for(const [loc,mode] of [['D27','開車'],['D27','高鐵'],['D30',null]]){ const G=setup('2026-03-27',20,{dating_heroine_01:true}); know(AN); H.said=[]; H.opts=[]; const names=(DATE.loc(loc).transport||[]).length>1; H.picks=['兩天一夜…',DATE.loc(loc).name].concat(mode?[mode]:(names?['台鐵']:[]),['明天','09:00','就這樣約']);
      let t=null; try{ t=await DATE.menu(GM,AN,null); }catch(e){ t={ok:false,why:String(e.message)}; } const L=H.said.map(s=>s.t); res.push([loc,mode,!!(t&&t.ok),t&&t.transport,L.includes(TL),t&&t.why]); }
    check('6. 實際約一次（選單，兩天一夜）：D27 嘉義改開車＝她說這一句、照她的搭高鐵＝不說；D30 花蓮（她沒有偏好）不說',res[0][2]&&res[0][3]==='car'&&res[0][4]===true&&res[1][2]&&res[1][3]==='hsr'&&res[1][4]===false&&res[2][4]===false,J(res));
    /* D26 臺中是她的家鄉：晚上她回家（S.NIGHT_HOME；她人本來就在臺中的家＝own home 也是同一句）*/
    const nk=(who,loc,own,dt)=>DATE.nightKind({flags:dt?{['dating_'+who]:true}:{}},{who,locs:[loc]},own);
    check('6. nightKind：以安 D26＝home（交往中、沒交往、她本來就在臺中的家都一樣）；以安去別的地點照舊（交往中＝民宿、沒交往＝兩間房）；別人去 D26 照舊（可昕交往中＝民宿、學姊沒交往＝兩間房、子晴＝home）；可昕 D29 照舊 home',nk(AN,'D26',null,true)==='home'&&nk(AN,'D26',null,false)==='home'&&nk(AN,'D26','home',true)==='home'&&nk(AN,'D27',null,true)==='dating'&&nk(AN,'D28',null,false)==='single'&&nk(KX,'D26',null,true)==='dating'&&nk(SIS,'D26',null,false)==='single'&&nk(ZQ,'D26',null,true)==='home'&&nk(KX,'D29',null,false)==='home');
    /* 2026-11-11 LAWWW 合併時改（AA_777 第 9 列 note「隔天早上的 S.MORNING_OWN 照上面那一列」）：她前一晚回家（NIGHT_HOME）＝隔天早上也是 MORNING_OWN，學期中一起從臺北去 D26 也一樣；舊期望：own 沒有＝S.MORNING */
    check('6. 隔天早上那一句：她人本來就在臺中的家（own）＝S.MORNING_OWN 的新句；沒有回家的地點（own 沒有、晚上不是 home）＝S.MORNING 的新句',DATE.morningLine(AN,'home')===DATE.MORNING_OWN[AN]&&DATE.morningLine(AN,DATE.morningOwn(null,'single'))===DATE.MORNING[AN]&&DATE.morningLine(AN,DATE.morningOwn(null,'dating'))===DATE.MORNING[AN]);
    { const G0={flags:{}}, nk=DATE.nightKind(G0,{who:AN,locs:['D26']},null), ZQ4='heroine_04';
      check('6. 學期中一起從臺北去 D26：晚上她回家（home）→ 隔天早上＝S.MORNING_OWN「早。我買了以前上學路上那家的飯糰，兩個，一個是你的。」；子晴 D26（沒有 MORNING_OWN）照舊 S.MORNING',nk==='home'&&DATE.morningLine(AN,DATE.morningOwn(null,nk))==='早。我買了以前上學路上那家的飯糰，兩個，一個是你的。'&&DATE.morningLine(ZQ4,DATE.morningOwn(null,DATE.nightKind(G0,{who:ZQ4,locs:['D26']},null)))===DATE.MORNING[ZQ4]&&/S\.morningLine\(id,S\.morningOwn\(own,t\.night\)\)/.test(fs.readFileSync(path.join(__dirname,'..','src/date3d.js'),'utf8'))); }
    const go=async(who,loc,dt)=>{ const G=setup('2026-03-27',20,dt?{['dating_'+who]:true}:{}); know(who); const day=G.day+1, tr=(DATE.loc(loc).transport||[])[0].mode, b=DATE.book(G,{who,locs:[loc],transport:tr,day,depart:9,kind:'overnight',by:'player'}); if(!b.ok) return {b};
      const own=(DATE.overnightWhere(G,who,day,[loc])||{}).own||null;
      const q=OUT.get(G,'date_'+b.trip); G.day=day; G.weekday=(G.weekday+1)%7; G.hour=9; H.said=[]; H.opts=[]; GM._reset(); H.picks=['出發']; await OUT.prompt(GM,q); return {b,own,t:DATE.trip(G,b.trip),L:H.said.map(s=>s.t)}; };
    const r1=await go(AN,'D26',true), r3=await go(AN,'D27',true);
    const okHome=r=>!!r.t&&r.t.night==='home'&&r.L.includes(HOME)&&r.L.filter(x=>/^（晚上/.test(x)).length===1&&r.L[r.L.indexOf('（第二天早上。）')+1]===DATE.MORNING_OWN[AN];   /* 2026-11-11 LAWWW：她前一晚回家＝隔天早上一律 S.MORNING_OWN（AA_777 第 9 列 note）；舊期望 DATE.morningLine(AN,r.own)（從臺北一起去＝S.MORNING）*/
    check('6. 實際演：和以安去臺中兩天一夜（交往中），第一天晚上旁白「'+HOME+'」（只有這一句晚上的旁白；不寫媽媽），第二天早上「（第二天早上。）」＋她一句（她前一晚回家＝S.MORNING_OWN：「'+DATE.MORNING_OWN[AN]+'」）',okHome(r1)&&!/媽|爸/.test(HOME)&&!/媽/.test(DATE.MORNING_OWN[AN]),J([r1.b&&r1.b.why,r1.own,(r1.L||[]).slice(0,6),(r1.L||[]).filter(x=>/晚上|早上/.test(x))]));
    check('6. 對照：和以安去嘉義（D27，交往中）＝民宿那一句（不是她的家鄉）',!!r3.t&&r3.t.night==='dating'&&r3.L.includes(DATE.NIGHT.dating)&&!r3.L.includes(HOME),J([r3.t&&r3.t.night,r3.b&&r3.b.why]));
    const all={}; for(const k of LOCS){ const g=of(NOW.loc[k],k,AN); for(const p in g) if(typeof g[p]==='string'&&(/\/(text|t)$/.test(p)||/^dislikeLine\//.test(p))) all[k+' '+p]=g[p]; }
    const nm=Object.entries(all).filter(([p,v])=>v.includes('{name}')).map(([p])=>p);
    check('6. {name} 只在八格、都在交往格（dating 底下）：D11、D15、D18、D20、D24、D26、D30、D33；其他佔位符只有 D13 的 {sunset}、{lastDrink}',nm.length===8&&J(nm.map(p=>p.slice(0,3)))===J(['D11','D15','D18','D20','D24','D26','D30','D33'])&&nm.every(p=>/\/dating\//.test(p))&&J(Object.entries(all).filter(([p,v])=>/\{(?!name\})/.test(v)).map(([p,v])=>p.slice(0,3)+(v.match(/\{(?!name\})[^}]*\}/)||[''])[0]))===J(['D13{sunset}','D13{lastDrink}']),J(nm)); });

  await sec(7,async()=>{ const W=DW(read('src/data/date_wish.js')), ev=W.events[AN], I=ev.herInvite;
    check('7. date_wish.js 的來源寫著「AA_778@'+C.AN_WISH_SHA+'（以安 D07 心願 16 列，換了 16 列）」；以安的事件 id、地點 D07 照舊；她主動約答應的那一句「好。13:30 出發。週一休館，所以是週六。」沒動、對得上她約的時間（13.5）',W.source.includes('AA_778@'+C.AN_WISH_SHA+'（以安 D07 心願 16 列，換了 16 列）')&&ev.id==='wish_heroine_01'&&ev.loc==='D07'&&I.dateTime===13.5&&J(I.accept).includes('好。13:30 出發。週一休館，所以是週六。'),J([I.dateTime,I.accept]));
    const raw=show(C.AN_WISH_SHA,SP+'AA_778_an_wish.json'), A=raw?JSON.parse(raw):null;
    const get=(o,pth)=>{ let x=o; const tk=[...pth.matchAll(/\["([^"]+)"\]|\.?([^.\[\]"]+)|\[(\d+)\]/g)].map(m=>m[1]!=null?m[1]:(m[2]!=null?m[2]:+m[3])); for(let i=0;i<tk.length;i++){ if(x==null) return x; let t=tk[i]; if(typeof x==='object'&&!Array.isArray(x)&&!(t in x)&&typeof tk[i+1]==='string'&&(t+'.'+tk[i+1]) in x){ t=t+'.'+tk[i+1]; i++; } x=x[t]; } return x&&typeof x==='object'?x.text:x; };   /* hotspots 的 key 是「D07.court」這種帶點的字串 */
    if(A){ check('7. 逐字：稿 16 列（path 不重複），每一列 path 那一格現在是 new',A.rows.length===16&&new Set(A.rows.map(r=>r.path)).size===16&&A.rows.every(r=>get(ev,r.path)===r.new),J(A.rows.filter(r=>get(ev,r.path)!==r.new).map(r=>r.path)));
      const tmp=path.join(os.tmpdir(),'date_wish_an1111_'+process.pid+'.js'); let ok=false, out='';
      try{ out=cp.execFileSync('python3',['tools/date/import_wish.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_wish.js'); }catch(x){ out=String(x.stderr||x.stdout||x.message).slice(0,300); }
      try{ fs.unlinkSync(tmp); }catch(x){}
      check('7. tools/date/import_wish.py 重匯（--out 另存）的結果和 src/data/date_wish.js 一樣',ok,ok?'':out.slice(0,300)); }
    const ow=show(BASE,'src/data/date_wish.js'); if(ow){ const O=DW(ow), ids=Object.keys(O.events).filter(k=>k!==AN), a=leaves(O.events[AN],'',{}), b=leaves(ev,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]);
      check('7. 別人的心願事件（'+ids.length+' 位：芷若、語彤、子晴、學姊、沛珊、可昕）和重匯以前（'+BASE+'）一樣（0 格不同）；hold、verify（miss 0 句、「你來過一次」那幾句）照舊',ids.length===6&&ids.every(k=>J(O.events[k])===J(W.events[k]))&&J(O.hold)===J(W.hold)&&J(O.verify)===J(W.verify)&&W.verify.miss.length===0&&J(Object.keys(W.hold))==='[]',J([Object.keys(W.hold),W.verify.miss]));
      check('7. 以安的事件和重匯以前比：格子一樣多、不一樣的 16 格都是她說的台詞的 text（旁白、選項的字 t、note、條件、時間、地點、分年級的分支沒動）；old 就是原本那一格的字',J(Object.keys(a))===J(Object.keys(b))&&d.length===16&&d.every(k=>/\/text$/.test(k)&&b[k.replace(/text$/,'who')]===AN)&&(!A||A.rows.every(r=>get(O.events[AN],r.path)===r.old)),J([d.length,d.filter(k=>!/\/text$/.test(k))])); }
    const dots=[]; const seen=new Set(); const w=o=>{ if(Array.isArray(o)) o.forEach(w); else if(o&&typeof o==='object'){ if(seen.has(o)) return; seen.add(o); if(typeof o.text==='string'&&o.who&&o.who!=='note'&&o.text.includes('……')) dots.push(o.text); for(const k in o) w(o[k]); } }; w(ev);
    check('7. 刪節號只剩 AA 說要留的三處：玩家主動約時的「……景美？」、法庭「……我不知道。所以我們來看。」、小路第 5 階以上的「……我知道。」',J(dots.slice().sort())===J(['……景美？','……我不知道。所以我們來看。','……我知道。'].sort()),J(dots));
    const tx=J(ev);
    check('7. 「比我想的好」換掉：提起那一段選項②的回覆「你這個答案很好。我要記下來。」；AA 說不動的照舊：法庭「我從來不去我媽的法庭。旁聽席會有人認得我。」、收尾選項②「嗯。下次再給你看。」（告白「理由欄」會回聲，只拿掉刪節號）；這個事件沒有佔位符',ev.mention.choices[1].reply[0].text==='你這個答案很好。我要記下來。'&&!tx.includes('比我想的好')&&tx.includes('我從來不去我媽的法庭。')&&tx.includes('旁聽席會有人認得我。')&&ev.closing.choices[1].reply[0].text==='嗯。下次再給你看。'&&!Object.values(leaves(ev,'',{})).some(v=>typeof v==='string'&&/[{}]/.test(v)),J(ev.mention.choices[1].reply));
    const wcode=read('src/wish3d.js').replace(/\/\*[\s\S]*?\*\//g,''); check('7. src/wish3d.js 沒有寫死以安心願事件換掉的句子（讀資料檔）',!A||!A.rows.some(r=>r.old.length>=6&&wcode.includes(r.old))); });

  await sec(8,async()=>{ const K=NOW.loc.D13.lines[AN], collect=X=>{ const nn=[]; const w=o=>{ if(Array.isArray(o)) o.forEach(w); else if(o&&typeof o==='object'){ if(typeof o.text==='string'&&o.who&&o.who!==AN) nn.push(o.who+':'+o.text); for(const k in o) w(o[k]); } }; w(X); return nn; }, nn=collect(K), nn0=WAS?collect(WAS.loc.D13.lines[AN]):null;
    const t13=J(K);
    check('8. D13 淡水（示範規格的地點）：{sunset}、{lastDrink} 各一格還在；「記 TASTE＝…」的註記格、旁白格（含稿上寫成旁白的舞台指示「你說了」——date3d.js 的 S.DEV_NOTE 照舊不演）、其他註記格（不是她說的 '+nn.length+' 格）和重匯以前一字不差',K.arrive.first.lines[0].text.includes('{sunset}')&&K.hotspots['D13.drink'].remember.lines[0].text==='你上次點{lastDrink}。我記得。'&&nn.filter(x=>/^note:記 `TASTE`＝/.test(x)).length>=1&&nn.includes('narr:你說了')&&read('src/date3d.js').includes("/記 `?TASTE`?＝`?([^`]+)`?/")&&(!nn0||J(nn)===J(nn0))&&(t13.match(/\{sunset\}/g)||[]).length===1&&(t13.match(/\{lastDrink\}/g)||[]).length===1,J(nn.slice(0,6)));
    if(WAS){ const nar=[], who=[], nt=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,AN), o=of(WAS.loc[k],k,AN); for(const p in g){ if(/\/text$/.test(p)&&g[p]!==o[p]&&g[p.replace(/text$/,'who')]==='narr') nar.push(k+' '+o[p]+' → '+g[p]); if(/\/who$/.test(p)&&g[p]!==o[p]) who.push(k+' '+p); if(/\/text$/.test(p)&&g[p.replace(/text$/,'who')]==='note'&&g[p]!==o[p]) nt.push(k+' '+p); } }
      console.log('（旁白格——who 是旁白——改了字的 '+nar.length+' 格，照稿匯：'+nar.join('；')+'）');
      check('8. 每一格是誰說的（who：她、旁白、註記）和重匯以前一樣；註記格的字沒動',who.length===0&&nt.length===0,J([who.slice(0,4),nt])); }
    const L7=NOW.loc.D07.lines[AN], first7=[]; for(const part of ['arrive','closing']) first7.push(J(L7[part].first)); for(const pid in L7.hotspots) first7.push(J(L7.hotspots[pid].first));
    check('8. D07 景美只有再訪的格（第一次來是她的心願事件）：到達、收尾、四個互動點的 first 都只指到 wish_heroine_01、沒有台詞；再訪的格都在',first7.length===6&&first7.every(x=>x===J({wishEvent:'wish_heroine_01'}))&&Object.keys(L7.hotspots).length===4&&L7.arrive.normal.length>=3&&L7.closing.normal.length>=2&&Object.values(L7.hotspots).every(h=>h.normal&&h.normal.length>=3),J(first7));
    check('8. 以安 33 個地點都有到達、收尾、互動點；沒有空字串、沒有 {name}、{sunset}、{lastDrink} 以外的佔位符',LOCS.every(k=>{ const L=NOW.loc[k].lines[AN]; return L&&L.arrive&&L.closing&&L.hotspots&&Object.keys(L.hotspots).length>=2; })&&!Object.values(LOCS.reduce((a,k)=>Object.assign(a,Object.fromEntries(Object.entries(of(NOW.loc[k],k,AN)).map(([p,v])=>[k+p,v]))),{})).some(v=>typeof v==='string'&&(v===''||/\{(?!name\}|sunset\}|lastDrink\})/.test(v))));
    /* AA 交稿：原稿「下次我請／上次說下次我請／回程的便當我出／下山換我請」都改成當場請掉——她的格子裡沒有欠著的請客；date3d.js 沒有照這幾句抄的註解或 key */
    const owe=[]; for(const k of LOCS) for(const s of slots(NOW.loc[k],AN)) if(s[1]!=='t'&&/下次我請|下次換我請|上次說下次|便當我出|換我請|先欠著/.test(cell(s))) owe.push(k+'：'+cell(s));
    check('8. 以安的台詞沒有「下次我請／上次說下次我請／回程的便當我出／下山換我請」這種欠著的請客（她沒有 PICK_FLAG）；date3d.js 也沒有這幾句',owe.length===0&&!/便當我出|下山換我請|上次說下次我請/.test(read('src/date3d.js')),J(owe)); });
  /* 9. 以安匯入以後 AA 的後續改稿（2026-11-11；企劃線 248c8e390＝C.AN_FOLLOW_SHA；開發分支 cd8f64806）：源稿只動以安 14 格（C.AN_FIX14；改稿紀錄 an_Dxx.json 的 _meta.fix_lawww_an_1111）
     ＋AA_780_an_date_followup.json 九列（date_lines.js 五列＝以安 flaked 兩則、子晴／語彤／芷若 flaked 各一列；date3d.js 四列＝S.EXTRA_LINES.heroine_01）。重匯以前＝C.AN_BASE2（7266e7a29）。
     她請客（_meta.she_pays＝S.SHE_PAYS）實際扣不扣錢在 tests/date_she_pays_1111_unit.js */
  await sec(9,async()=>{ const SH=C.AN_FOLLOW_SHA, OS=C.AN_SHA, b2=show(C.AN_BASE2,'src/data/date_lines.js'), W2=b2?DL(b2):null, q=t=>"'"+t+"'";
    const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files, e=allow.filter(x=>x.path===SP+'AA_780_an_date_followup.json');
    check('9. 白名單 AA_780_an_date_followup.json@'+SH+' 一筆、approved、有 approvedBy；date_lines.js 的來源寫著它；白名單 D01～D33＝'+SH+'、上一版 '+OS+' 留在 history',e.length===1&&e[0].sha===SH&&e[0].status==='approved'&&!!e[0].approvedBy&&NOW.source.includes('AA_780_an_date_followup.json@'+SH)&&LOCS.every(k=>{ const x=allow.filter(y=>y.path===SP+'date_system/lines/'+k+'.json'); return x.length===1&&(x[0].sha===SH||(SHA===x[0].sha&&(x[0].history||[]).some(h=>h.sha===SH)))&&(x[0].history||[]).some(h=>h.sha===OS); }));   /* 2026-11-11 19:03 起 D01～D33 再換 52c3ee258（AA 加 fx，X324）：SH 進 history 也算 */
    /* 14 格：AA 交稿訊息裡的清單（格號＝date_rewrite.py list heroine_01 Dxx 的格號，和上面的 slots() 同一個順序）*/
    const LIST='D05:21、43｜D07:34、43｜D09:9｜D10:41｜D12:21｜D18:49、53｜D23:11｜D26:31｜D28:11｜D29:10｜D31:11';
    const by={}; for(const x of C.AN_FIX14) (by[x.loc]=by[x.loc]||[]).push(x.n); const mine=Object.keys(by).sort().map(k=>k+':'+by[k].sort((p,r)=>p-r).join('、')).join('｜');
    check('9. 以安 14 格的格號（date_rewrite.py list heroine_01 Dxx）就是 AA 交稿的清單：'+LIST,C.AN_FIX14.length===14&&mine===LIST,mine);
    const OSRC={}; for(const k of LOCS){ const t=show(OS,SP+'date_system/lines/'+k+'.json'); if(t) OSRC[k]=JSON.parse(t); }
    if(haveSrc&&Object.keys(OSRC).length===33){ const bad=[];
      for(const x of C.AN_FIX14){ const s1=slots(SRC[x.loc],AN), s0=slots(OSRC[x.loc],AN), g=slots(NOW.loc[x.loc],AN), i=x.n-1;
        if(cell(s1[i])!==x.new) bad.push(x.loc+'#'+x.n+' 源稿「'+cell(s1[i])+'」'); if(cell(s0[i])!==x.old) bad.push(x.loc+'#'+x.n+' 上一版「'+cell(s0[i])+'」'); if(cell(g[i])!==x.new) bad.push(x.loc+'#'+x.n+' 遊戲「'+cell(g[i])+'」');
        if(of(NOW.loc[x.loc],x.loc,AN)[x.path]!==x.new||of(SRC[x.loc],x.loc,AN)[x.path]!==x.new||of(OSRC[x.loc],x.loc,AN)[x.path]!==x.old) bad.push(x.loc+'#'+x.n+' 格號和 path 不是同一格：'+x.path);
        if((REC[x.loc][x.loc]||[])[i]!==x.new) bad.push(x.loc+'#'+x.n+' 改稿紀錄「'+(REC[x.loc][x.loc]||[])[i]+'」'); }
      check('9. 14 格逐字：源稿 '+SH+' 那一格＝新字、上一版 '+OS+' 那一格＝舊字、遊戲 date_lines.js 那一格＝新字；格號和 path 指的是同一格；改稿紀錄 an_Dxx.json 那一格也是新字',bad.length===0,J(bad.slice(0,4)));
      const fx=[]; for(const k of LOCS) for(const n of ((REC[k]._meta||{}).fix_lawww_an_1111||[])) fx.push(k+':'+n);
      check('9. 改稿紀錄的 _meta.fix_lawww_an_1111 合起來剛好是這 14 格',J(fx.sort())===J(C.AN_FIX14.map(x=>x.loc+':'+x.n).sort()),J(fx));
      const sd=[]; for(const k of LOCS){ const a=leaves(SRC[k],'',{}), b=leaves(OSRC[k],'',{}); for(const p of new Set(Object.keys(a).concat(Object.keys(b)))) if(a[p]!==b[p]) sd.push(k+p); }
      check('9. 源稿 '+SH+' 和上一版 '+OS+' 逐格比（33 個檔、每個人、每一格）：只有以安這 14 格不同（學姊、沛珊、語彤、可昕、芷若、子晴、芯慈 0 格；格子數一樣）',J(sd.sort())===J(C.AN_FIX14.map(x=>x.loc+'/lines/'+AN+'/'+x.path.replace(/^lines\//,'')).sort()),J(sd.slice(0,6))); }
    if(!W2) return;
    { const d=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,AN), w=of(W2.loc[k],k,AN); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))) if(g[p]!==w[p]) d.push(k+' '+p); }
      check('9. 以安 33 個地點（台詞、選項、tier、喜好、不喜歡那一句）和重匯以前（'+C.AN_BASE2+'）比：剛好這 14 格不同（old＝重匯以前那一格、new＝現在）',J(d.sort())===J(C.AN_FIX14.map(x=>x.loc+' '+x.path).sort())&&C.AN_FIX14.every(x=>of(W2.loc[x.loc],x.loc,AN)[x.path]===x.old&&of(NOW.loc[x.loc],x.loc,AN)[x.path]===x.new),J(d.slice(0,6))); }
    for(const [who,nm] of [[SIS,'學姊'],[PS,'沛珊'],[YT,'語彤'],[KX,'可昕'],[ZR,'芷若'],[ZQ,'子晴'],['classmate_xinci','芯慈']]){ let n=0; const dd=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,who), w=of(W2.loc[k],k,who); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))){ n++; if(g[p]!==w[p]) dd.push(k+' '+p); } }
      check('9. '+nm+' 33 個地點 '+n+' 格和重匯以前（'+C.AN_BASE2+'）比：零差異',n>(who==='classmate_xinci'?150:3500)&&dd.length===0,J(dd.slice(0,4))); }
    { const strip2=D=>{ const x=JSON.parse(J(D)); delete x.source; delete x.lines; for(const k in x.loc) for(const part of ['lines','likes','dislikeLine']) if(x.loc[k][part]) delete x.loc[k][part][AN]; return x; };
      const a=leaves(strip2(W2),'',{}), b=leaves(strip2(NOW),'',{}), ka=Object.keys(a), df=ka.filter(p=>a[p]!==b[p]).concat(Object.keys(b).filter(p=>!(p in a)));
      check('9. 整份 date_lines.js 拿掉以安的地點格子和不分地點的短句（下面另外比）以後（'+ka.length+' 格：別人的地點格子、交通偏好、互動點）和重匯以前零差異',ka.length>20000&&df.length===0,J(df.slice(0,4))); }
    const R=JSON.parse(show(SH,SP+'AA_780_an_date_followup.json')||'null'); if(!R) return;
    const r1=R.rows.filter(r=>r.file==='src/data/date_lines.js'), r2=R.rows.filter(r=>r.file==='src/date3d.js');
    check('9. AA_780 稿 9 列：date_lines.js 五列（以安 flaked 兩則、子晴 flaked[0]、語彤 flaked[0][0]、芷若 flaked[0][1]）、date3d.js 四列（S.EXTRA_LINES.heroine_01 的 enough 兩句、leaveEarly、noPair）',R.rows.length===9&&J(r1.map(r=>r.path))===J(['lines.heroine_01.flaked[0][0]','lines.heroine_01.flaked[0][1]','lines.heroine_04.flaked[0]','lines.heroine_03.flaked[0][0]','lines.heroine_02.flaked[0][1]'])&&J(r2.map(r=>r.path))===J(['S.EXTRA_LINES.heroine_01.enough[0]','S.EXTRA_LINES.heroine_01.enough[1]','S.EXTRA_LINES.heroine_01.leaveEarly[0]','S.EXTRA_LINES.heroine_01.noPair[0]']),J(R.rows.map(r=>r.file+' '+r.path)));
    { const la=leaves({lines:W2.lines},'',{}), lb=leaves({lines:NOW.lines},'',{}), dl=Object.keys(lb).filter(p=>la[p]!==lb[p]).concat(Object.keys(la).filter(p=>!(p in lb))).sort(), P5=r1.map(r=>'/'+r.path.replace(/\[(\d+)\]/g,'/$1').replace(/\./g,'/')).sort();
      check('9. date_lines.js 五列逐字：每一列 path 那一格現在＝new、重匯以前（'+C.AN_BASE2+'）＝old；不分地點的短句（七個人的預約、改期、取消、放鴿子、出發…）和重匯以前比剛好差這五格',r1.every(r=>getp(NOW,r.path)===r.new&&getp(W2,r.path)===r.old)&&J(dl)===J(P5),J([dl,r1.filter(r=>getp(NOW,r.path)!==r.new||getp(W2,r.path)!==r.old).map(r=>r.path)]));
      check('9. 別人那三列（子晴、語彤、芷若）和 tests/date_src_sha.js 的 FLAKED_780 一模一樣（path、old、new；別支測試的 un780、want780 照它）',J(C.FLAKED_780.map(x=>[x.path,x.old,x.new]).sort())===J(r1.filter(r=>!r.path.includes(AN)).map(r=>[r.path,r.old,r.new]).sort())); }
    const EX=DATE.EXTRA_LINES[AN], code=read('src/date3d.js').replace(/\/\*[\s\S]*?\*\//g,'');
    check('9. date3d.js 四列逐字：S.EXTRA_LINES.heroine_01 那一格＝new、每一句在程式裡（註解不算）剛好一處、old 不在程式裡；depart 三句照舊（AA_780：不用改）',r2.every(r=>getp({S:{EXTRA_LINES:DATE.EXTRA_LINES}},r.path)===r.new&&code.split(q(r.new)).length-1===1&&!code.includes(q(r.old)))&&J(EX.depart)===J(['我到了。早到十分鐘。你慢慢來。','出門了。傘帶了。','車上。我在看等一下要去的地方的地圖。']),J(r2.filter(r=>getp({S:{EXTRA_LINES:DATE.EXTRA_LINES}},r.path)!==r.new).map(r=>r.path)));
    /* 她請客的三格：AA_780 的 _meta.she_pays 寫格號（D06#43、D13#23、D18#41）和位置；S.SHE_PAYS 的字＝源稿那一格（逐格、實際扣錢在 tests/date_she_pays_1111_unit.js）*/
    /* 2026-11-11（AA_782）：S.SHE_PAYS 另外合進學姊、沛珊、可昕十格（src/data/she_pays.js；tests/date_she_pays_1111_unit.js 第 8、9 節）——以安的仍然只有這三格、AA_782 沒有以安。舊期望：S.SHE_PAYS 的人只有以安 */
    /* 2026-11-11（AA_812@f1fab0ec6）：AA_812 的 SHE_PAYS_add 也有以安兩格（D29.sculpture、D31.egg；src/data/she_pays.js），合在手寫三格後面——手寫三格照舊在最前面、she_pays.js 沒有這三個互動點。
       舊期望：she_pays.js 沒有以安、S.SHE_PAYS.heroine_01 只有這三個互動點（tests/date_she_pays_812_1111_unit.js 逐格）*/
    const SPX=[...String((R._meta||{}).she_pays||'').matchAll(/(D\d\d)#(\d+)（(D\d\d\.\w+)\.(\w+)(?:#(\d+))?）/g)].map(m=>({loc:m[1],n:+m[2],pid:m[3],kind:m[4],k:m[5]==null?null:+m[5]}));
    check('9. _meta.she_pays 三格（D06#43 D06.cafe.remember、D13#23 D13.drink.normal#2、D18#41 D18.teahouse.normal#2）＝S.SHE_PAYS.heroine_01 最前面的三個互動點（後面是 AA_812 的 D29.sculpture、D31.egg）；每一格的字（源稿 slots 第 n 格）＝S.SHE_PAYS 那一句',SPX.length===3&&J(SPX.map(x=>x.loc+'#'+x.n+' '+x.pid+'.'+x.kind+(x.k==null?'':'#'+x.k)))===J(['D06#43 D06.cafe.remember','D13#23 D13.drink.normal#2','D18#41 D18.teahouse.normal#2'])&&J(Object.keys(DATE.SHE_PAYS).filter(k=>!(typeof SHE_PAYS_DATA!=='undefined'&&SHE_PAYS_DATA.pays[k])))===J([])&&J(Object.keys(DATE.SHE_PAYS)[0])===J(AN)&&J(Object.keys(DATE.SHE_PAYS[AN]))===J(SPX.map(x=>x.pid).concat(Object.keys(SHE_PAYS_DATA.pays[AN]||{})))&&J(Object.keys(SHE_PAYS_DATA.pays[AN]||{}))===J(['D29.sculpture','D31.egg'])&&SPX.every(x=>!(SHE_PAYS_DATA.pays[AN]||{})[x.pid])&&(!haveSrc||SPX.every(x=>J(DATE.SHE_PAYS[AN][x.pid])===J([(s=>{ const r=C.AN_1112.find(r=>r.loc===x.loc&&r.old===s); return r?(r.game||r.new):s; })(cell(slots(SRC[x.loc],AN)[x.n-1]))]))),J([SPX,DATE.SHE_PAYS]));   /* 2026-11-12（AA_832@b84e779563）：D18#41 茶樓那一句 AA 改了字（同一格、還是她請），S.SHE_PAYS 跟著換成新句；SRC 是 src248 還原過的（舊字），所以那一格照 date_src_sha.js AN_1112 換成現在的字再比。舊期望：S.SHE_PAYS 那一句＝還原後的源稿那一格 */
    /* date3d.js 的字串增減：固定比 AA_780 進來的那個 commit（C.AN780_D3_SHA）和重匯以前（C.AN_BASE2）——之後 date3d.js 再加字串不會讓這一條紅（同第 6 節 AN_D3_SHA、zq／zr／yt 的 e61d19547）*/
    { const ob=show(C.AN_BASE2,'src/date3d.js'), nb=show(C.AN780_D3_SHA,'src/date3d.js'); if(ob&&nb){ const lit=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').match(/'(?:[^'\\\n]|\\.)*'/g)||[], O=lit(ob), L=lit(nb), cnt=A=>A.reduce((m,t)=>(m[t]=(m[t]||0)+1,m),{}), co=cnt(O), cl=cnt(L), gone=[], came=[];
      for(const t of new Set(O.concat(L))){ const n=(cl[t]||0)-(co[t]||0); for(let i=0;i<Math.abs(n);i++) (n<0?gone:came).push(t); }
      const SP3=[]; if(haveSrc) for(const x of SPX) SP3.push(q(x.pid),q(cell(slots(SRC[x.loc],AN)[x.n-1])));
      check('9. date3d.js 的字串（'+C.AN780_D3_SHA+' 和重匯以前 '+C.AN_BASE2+' 比）：少掉的剛好是 AA_780 四列的 old、多出來的剛好是四列的 new＋S.SHE_PAYS 的三個互動點 id 和三句（條件、別人的句子、程式沒動）',!haveSrc||(J(gone.sort())===J(r2.map(r=>q(r.old)).sort())&&J(came.sort())===J(r2.map(r=>q(r.new)).concat(SP3).sort())),J([gone,came])); } }
    /* enough 第一句不再說「明天早上有課」（AA：不綁那個條件）：S.LINE_IF.heroine_01.enough 那一行留著，現在兩句都不會被它擋——學期中、寒暑假都輪得到兩句（原本寒暑假只剩第二句）*/
    { const G=setup('2026-03-27',20,{}), f=DATE.LINE_IF[AN].enough, dT=G.day, dB=H.D('2026-08-05');
      const all=[dT,dB].every(d=>EX.enough.every(x=>f(G,{day:d},x))), probe=[f(G,{day:dT},'明天早上有課'),f(G,{day:dB},'明天早上有課')];
      check('9. S.LINE_IF.heroine_01.enough 條件留著（學期中 3/27 放「明天早上有課」、暑假 8/5 擋——確認兩天一個學期中一個放假），AA_780 的兩句學期中、暑假都放；DATE.lineFor 暑假也有句子',all&&J(probe)===J([true,false])&&!!DATE.lineFor(G,AN,'enough',{day:dB})&&EX.enough.length===2,J([probe,all])); } });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
