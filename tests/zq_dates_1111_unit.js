// 子晴校外約會台詞重寫（DLG-FULL-REVIEW-1110；使用者 X324「就是要像人在說話」；2026-11-11）——不需要瀏覽器（D131）。
//   約會源稿 date_system/lines/D01～D33.json（白名單現在的版本；同一版帶芷若 D10 小吃攤一句）；改稿紀錄 date_rewrite/zq_D01～D33.json；
//   AA_775_zq_date_common.json（不分地點的短句 9 列：date_lines.js 五列、date3d.js 四列）、AA_776_zq_wish.json（D03 心願事件 30 列）。
//   **SHA 都在 tests/date_src_sha.js**（AA 再給新 SHA 只改那一處；這支裡的數字都是「至少多少」，不寫死格數）。
//   1. 白名單；import_date_lines.py 重匯（--out）一樣；修正層跳過的子晴的列；別人跳過的列數照舊；沒有「原句還在」的列；「一台大的」不被當成校名
//   2. 子晴 33 個地點的格子和源稿一字不差；改稿紀錄每一格都在
//   3. 別人的格子、預約句、交通偏好和重匯以前（ZQ_BASE）完全一樣——只多芷若 D10 那一句；源稿和上一版逐格比也只多那一句
//   4. 選項換字：拿選項的字當 key 的地方（PICK_FLAG、REMEMBER_IF、LINE_IF、ARRIVE_VAR、aa524_3d.js、aa525_3d.js、請客選項）都對得上；換掉的舊句不在 src 的程式裡
//   5. 芷若 D10 那一句進了、舊字不在
//   6. AA_775（9 列）：lines.heroine_04 五列照 path＋date3d.js 四列（S.MORNING、REMEMBER_IF 兩句備用句、D26 臺中過夜她回家）；transport 那一句只在她想搭的車被改成開車時播；
//      「子晴的約三點以後到」照舊、新稿沒有綁「三點才到」的句子；{name} 只在八格交往格
//   7. AA_776（30 列，照 path）：date_wish.js 的 events.heroine_04；別人 0 格；刪節號剩 3 處
//   8. D13「記 TASTE」那幾格照留、旁白格、每一格是誰說的
// 稿、BASE 讀 git show；讀不到（淺層複本）＝不比稿，只驗結構。用法：node tests/zq_dates_1111_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), os=require('os'), vm=require('vm');
const C=require('./date_src_sha.js');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const ZQ='heroine_04', ZR='heroine_02', KX='kexin', YT='heroine_03', SIS='heroine_05', PS='classmate_peishan', SHA=C.ALLOW_SHA, PREV=C.ZQ_PREV, BASE=C.ZQ_BASE, SP='docs/story_planning/';
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
check('0. AA_812 那七格（CELLS_812）現在是新字（還原成舊字以後才拿 NOW 和源稿、重匯以前比）',C.CELLS_812.length===7&&C.CELLS_812.every(r=>C.cell812(NOW812,r)===(r.now||r.new)&&C.cell812(NOW,r)===r.old),JSON.stringify(C.CELLS_812.map(r=>C.cell812(NOW812,r))));   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：第六格（子晴 D06.cafe 第一次選項的回覆）AA 在 AA_846 late_fix 改回「下次我請你吃滷味。」，AA_812 path_rows 那一列被取代（import_date_lines.py SUPER812）——那一格現在認 CELLS_812 的 now。舊期望：七格都＝r.new */
const SRC={}, OLDSRC={}, REC={}; for(const k of LOCS){ const t=show(SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'), r=show(C.FX_PREV,SP+'date_rewrite/zq_'+k+'.json');   /* 改稿紀錄讀加 fx 以前那一版（248c8e390）：之後 AA_812 改 zq_D06 一格（f1fab0ec6），遊戲這邊用 un812 還原比，紀錄也要同一層 */ if(t) SRC[k]=C.src248(k,JSON.parse(t));   /* 52c3ee258 起源稿有 fx：只比字（date_src_sha.js noFx） */ if(u) OLDSRC[k]=JSON.parse(u); if(r) REC[k]=JSON.parse(r); }   /* 2026-11-12（X324 可昕續改，AA_819＋AA_822@07d50af2f7）：源稿可昕 72 格換了新字——src248 把那 72 格還原再比（date_src_sha.js KX_1112；逐格在 tests/kx_dates_1112_unit.js）。舊寫法：C.noFx(JSON.parse(t)) */
const haveSrc=Object.keys(SRC).length===33&&Object.keys(OLDSRC).length===33&&Object.keys(REC).length===33;
const ob=show(BASE,'src/data/date_lines.js'), WAS=ob?DL(ob):null;
/* 同一版別人的那一句（芷若 D10）：Dxx.json 裡的位置 → 遊戲檔的 of() 路徑（lines/…）、整份 leaves 的路徑（/loc/Dxx/lines/誰/…）*/
const ALSO=C.ALSO_ZQ.map(a=>Object.assign({},a,{p:a.path,full:'/loc/'+a.loc+'/lines/'+a.who+'/'+a.path.replace(/^lines\//,''),srcp:'/lines/'+a.who+'/'+a.path.replace(/^lines\//,'')}));
{ const ch=GM.choose; let n=0; GM.choose=async o=>{ if(++n>150) throw new Error('選單一直重來：'+J(o.map(x=>x.t||x.text))); return ch(o); }; GM._reset=()=>{ n=0; }; }
GM.money=d=>{ H.G.money+=d; };
const setup=(key,h,flags)=>{ const G=H.fresh(key,h,'dorm',flags||{}); G.outings=[]; G.contacts=G.contacts||{}; G.money=50000; GM._reset(); return G; };
const know=id=>{ H.CLOSE(id); H.G.contacts[id]=1; };
const getp=(o,pth)=>pth.match(/\[\d+\]|[^.\[\]]+/g).reduce((x,t)=>x==null?x:x[t[0]==='['?+t.slice(1,-1):t],o);

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
    const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&[PREV,'f9c1a2b80','0a2136911','82c946ad7','2883197b6'].every(s=>(e[0].history||[]).some(h=>h.sha===s))); });
    check('1. 白名單 D01～D33 都是 '+SHA+'、approved，前五版（芷若 '+PREV+'、可昕 f9c1a2b80、語彤 0a2136911、學姊 82c946ad7、沛珊 2883197b6）留在 history',bad.length===0,J(bad));
    const e5=allow.filter(x=>x.path===SP+'AA_775_zq_date_common.json'), e6=allow.filter(x=>x.path===SP+'AA_776_zq_wish.json');
    check('1. 白名單 AA_775_zq_date_common.json@'+C.ZQ_COMMON_SHA+'、AA_776_zq_wish.json@'+C.ZQ_WISH_SHA+' 各一筆、approved；date_lines.js 的來源寫著 33 個地點 @'+SHA+' 和 AA_775',e5.length===1&&e5[0].sha===C.ZQ_COMMON_SHA&&e5[0].status==='approved'&&e6.length===1&&e6[0].sha===C.ZQ_WISH_SHA&&e6[0].status==='approved'&&LOCS.every(k=>NOW.source.includes(k+'.json@'+SHA))&&NOW.source.includes('AA_775_zq_date_common.json@'+C.ZQ_COMMON_SHA));
    console.log(haveSrc&&WAS?'（稿和 BASE 都讀得到：逐字比對）':'（這份 checkout 讀不到企劃線的稿或 BASE：不比稿，只驗結構）');
    if(haveSrc){ const tmp=path.join(os.tmpdir(),'date_lines_zq1111_'+process.pid+'.js'); let out='', ok=false;
      try{ out=cp.execFileSync('python3',['tools/date/import_date_lines.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<26}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_lines.js'); }catch(e){ out=String(e.stderr||e.stdout||e.message).slice(0,600); }
      try{ fs.unlinkSync(tmp); }catch(e){}
      check('1. tools/date/import_date_lines.py 重匯（--out 另存）的結果和 src/data/date_lines.js 一樣（沒有「原句還在源稿裡」停下來的列）',ok&&!/原句還在源稿裡/.test(out),ok?'':out.slice(0,600));
      const m=/子晴重寫（DLG-FULL-REVIEW-1110）跳過的改句 (\d+) 列：(.*)/.exec(out)||[], body=String(m[2]||''), rows=body?body.split('；'):[];
      const L10=['AA_359 5-2 D28「我十二點才起床。這裡的早餐店都收了。」','AA_359 5-2 D28「旅館的網路好慢。我昨天什麼都沒做成。」','AA_359 5-2 D31「我早上九點就起床了。你要稱讚我。」','AA_359 5-3 D32「車上我睡了兩小時。山路好彎。」','AA_525 1-6 D10「謝謝。宵夜我請。」','AA_525 1-6 D12「謝謝，下次換我。」','AA_525 1-6 D13「好，下次我請。」','AA_525 1-6 D30「好。下次換我。」','AA_525 1-6 D31「好！下次我請。」','AA_526 第 2 節 D15 D15「好。我記下來。下次滷味我請。」'];
      const WHY=/（(已經是改成的字（源稿寫回了）|那一格新稿重寫成「[^「」]+」)）$/, r10=rows.filter(r=>!/^AA_694 /.test(r)), r694=rows.filter(r=>/^AA_694 第 3 節第 \d+ 列 /.test(r));
      check('1. 子晴跳過的列：修正層她的十列（AA_359 5-2 的 D28 兩句、D31，5-3 的 D32；AA_525 1-6 的 D10、D12、D13、D30、D31；AA_526 的 D15）每一列都印出來、都寫了是哪一種（源稿寫回了／那一格重寫成哪一句）；其餘都是 AA_694 第 3 節跟著跳過的（她上一版有、新稿換掉的句子）',+m[1]===rows.length&&r10.length===10&&L10.every(x=>r10.some(r=>r.startsWith(x)&&WHY.test(r)))&&r10.length+r694.length===rows.length&&r694.every(r=>/（子晴的句子，新稿重寫了）$/.test(r)),J([m[1],r10,r694.length]));
      console.log('（子晴跳過 '+rows.length+' 列：'+r10.map(r=>r.replace(/^(AA_\d+ .*?D\d\d)「.*?」（(.*)）$/,'$1＝$2')).join('、')+'；AA_694 第 3 節 '+r694.length+' 列）');
      check('1. 別人跳過的列數照舊：語彤 292 列（AA_630 第 2 節 209 列）、學姊 95 列、沛珊 11 列、可昕 3 列、芷若 10 列；AA_767 六列、AA_769 七列、AA_773 九列、AA_775 五列照 path 都換了',/語彤重寫（DLG-FULL-REVIEW-1110）跳過的改句 292 列（其中 AA_630 第 2 節 209 列）/.test(out)&&/學姊重寫（DLG-FULL-REVIEW-1110）跳過的改句 95 列/.test(out)&&/沛珊重寫（PEISHAN-VOICE-1110）跳過的改句 11 列/.test(out)&&/可昕重寫（DLG-FULL-REVIEW-1110）跳過的改句 3 列/.test(out)&&/芷若重寫（DLG-FULL-REVIEW-1110）跳過的改句 10 列/.test(out)&&/AA_767@0a2136911：語彤不分地點的短句 6 列（照 path），換了 6 列/.test(out)&&/AA_769@f9c1a2b80：可昕不分地點的短句 7 列（照 path），換了 7 列/.test(out)&&new RegExp('AA_773@'+C.ZR_COMMON_SHA+'：芷若不分地點的短句 9 列（照 path），換了 9 列').test(out)&&new RegExp('AA_775@'+C.ZQ_COMMON_SHA+'：子晴不分地點的短句 5 列（照 path），換了 5 列').test(out)); }   /* 2026-11-12（X324 學姊續改 AA_837＋AA_838@a573a50dca）：學姊跳過的列 81→86（AA_598 逐句表第 11、30、41、45、57 列那五格這一版重寫了：已經是新句 34→29、跳過 55→60）。舊期望：跳過的改句 81 列 */   /* 2026-11-12（X324「好」開頭回話 AA_842@41f77eab53）：學姊跳過的列 86→95——AA_598 逐句表第 19、33、44、46、55 列（D11 圖書館、D19 木屋、D24 泡腳／車站、D29 鐵道第一次選項的回話，原句都是「好。…」開頭）那五格這一版重寫了（換 4→1、已經是新句 29→27、跳過 60→65），AA_694 第 3 節第 162、195、196、238 列跟著跳過（22→26）。舊期望：跳過的改句 86 列 */   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：語彤跳過的列 289→292——AA_694 第 3 節第 158、161、176 列（D19、D21 再訪句，原句「上次…」開頭，這一版重寫了）跟著跳過（80→83）；AA_630 第 2 節還是 209 列（其中 D-028、079、094、112、130、134、151、159、175 九列從「源稿已經是改成的字」變成「那一格新稿重寫了」）。舊期望：語彤跳過的改句 289 列 */
    const tool=read('tools/date/import_date_lines.py'), code=tool.replace(/^""".*?"""/s,'').replace(/#.*$/mg,'');
    check('1. 工具只對沛珊、學姊、語彤、可昕、芷若、子晴放寬（ps_skip 先看 who；別人的列照舊 sys.exit）；子晴的列原句還在＝不寫檔、全部列出來停下（ZQ_STALE）；工具裡沒有寫死這一輪的 SHA（只有上一版 ZQ_PREV）',/if who not in \(PS, SIS, YT, KX, ZR, ZQ, AN\) or not ps756\(loc, who\):\s+return False/.test(tool)&&tool.includes("ZQ = 'heroine_04'")&&tool.includes("ZQ_PREV = '"+PREV+"'")&&/if ZQ_STALE:[^\n]*\n\s+sys\.exit\(/.test(tool)&&/if who not in \(ZR, ZQ, AN\) or not ps756\(loc, who\) or old == new:/.test(tool)&&!code.includes(SHA)&&!code.includes(C.ZQ_WISH_SHA));   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：工具也對以安放寬（舊：到 ZQ 為止） */
    /* 「他換了一台大的。」（D10 堤防 remember）：讀稿換校名的工具會把「台大」換成首都帝大——import_guard.py 的 WORLD_FIX 換回稿的原字；這裡不經過 alison.js 讀原稿對 */
    const raw=(()=>{ try{ return (cp.__worldEf||cp.execFileSync).call(cp,'git',['show',SHA+':'+SP+'date_system/lines/D10.json'],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } })();
    const g10=NOW.loc.D10.lines[ZQ].hotspots['D10.walk'].remember.lines[0].text;
    check('1. D10 堤防 remember「放空拍機的那個人又來了，他換了一台大的。」照稿原字（不是校名，沒有被換成「首都帝大」）；整份約會台詞沒有「一首都帝大」',g10==='放空拍機的那個人又來了，他換了一台大的。'&&(!raw||JSON.parse(raw).lines[ZQ].hotspots['D10.walk'].remember.lines[0].text===g10)&&!J(NOW).includes('一首都帝大')&&read('tools/story/import_guard.py').includes("('他換了一首都帝大的。', '他換了一台大的。')"),g10); });

  await sec(2,async()=>{ if(!haveSrc){ for(const k of LOCS) check('2. '+k+'：子晴有台詞',!!(NOW.loc[k].lines&&NOW.loc[k].lines[ZQ])); return; }
    let n=0; const bad=[];
    for(const k of LOCS){ const g=of(NOW.loc[k],k,ZQ), s=of(SRC[k],k,ZQ);
      for(const p of new Set(Object.keys(g).concat(Object.keys(s)))){ n++; if(g[p]!==s[p]) bad.push(k+' '+p+'：稿「'+s[p]+'」遊戲「'+g[p]+'」'); } }
    check('2. 子晴 33 個地點 '+n+' 格（台詞、選項的字、tier、喜好、不喜歡那一句）和源稿 '+SHA+' 一字不差、格子一樣多',n>4500&&bad.length===0,J(bad.slice(0,6)));
    let ch=0, cht=0, cho=0, chd=0; const miss=[], st=[]; for(const k of LOCS){ const s=of(SRC[k],k,ZQ), o=of(OLDSRC[k],k,ZQ), g=of(NOW.loc[k],k,ZQ); for(const p of new Set(Object.keys(s).concat(Object.keys(o)))) if(s[p]!==o[p]){ ch++; if(/\/text$/.test(p)) cht++; else if(/\/t$/.test(p)) cho++; else if(/^dislikeLine\//.test(p)) chd++; else st.push(k+' '+p); if(g[p]!==s[p]) miss.push(k+' '+p); } if(J(Object.keys(s).sort())!==J(Object.keys(o).sort())) st.push(k+' 格子不一樣多'); }
    check('2. 源稿和上一版 '+PREV+' 逐格比：子晴 '+ch+' 格不同（台詞 '+cht+'、選項的字 '+cho+'、不喜歡那一句 '+chd+'）、每一格都照稿；不同的都是字（tier、喜好、who、旗標、格子數沒動）',ch>=800&&cho>=20&&miss.length===0&&st.length===0,J([ch,miss.slice(0,4),st.slice(0,4)]));
    const cells=(x,o)=>{ if(Array.isArray(x)) x.forEach(v=>cells(v,o)); else if(x&&typeof x==='object') for(const k in x){ if((k==='text'||k==='t')&&typeof x[k]==='string') o.push(x[k]); else cells(x[k],o); } return o; };
    /* 紀錄的格子＝她那個地點的台詞、選項的字照順序，最後接「不喜歡那一句」（有的地點才有）；null＝沒動（含 AA 把遊戲原本疊著的修正寫回源稿的那幾格）。
       位置對不上的只容許 D13 第 33 格：紀錄把「看河我現在可以安靜一分鐘，有進步。」記在第 33 格（欄杆平常的第一句），源稿是放在第 36 格（欄杆的 remember，原「上次我安靜了三十秒，今天挑戰一分鐘。」）——
       照源稿匯（白名單認的是源稿），已列給 LAWWW 轉 AA 看；AA 之後把紀錄改對，這一條一樣會過 */
    let tot=0, nn=0, pos=0; const lost=[], off=[], len=[];
    for(const k of LOCS){ const r=REC[k][k], c=cells(SRC[k].lines[ZQ],[]).concat(Object.values((SRC[k].dislikeLine||{})[ZQ]||{})), g=new Set(Object.values(of(NOW.loc[k],k,ZQ)).filter(v=>typeof v==='string')); tot+=r.length;
      if(r.length!==c.length) len.push(k+' 紀錄 '+r.length+' 格、源稿 '+c.length+' 格');
      let ok=r.length===c.length; r.forEach((t,i)=>{ if(t==null) return; nn++; if(!g.has(t)) lost.push(k+'#'+i+'：'+t); if(t!==c[i]){ ok=false; off.push(k+'#'+i); } }); if(ok) pos++; }
    check('2. 改稿紀錄 zq_D01～D33.json：'+tot+' 格裡有新字的 '+nn+' 格，每一句都在遊戲裡她那個地點的格子；每個地點紀錄的格數＝源稿的格數（台詞＋選項＋不喜歡那一句）；'+pos+' 個地點紀錄的第 n 格就是源稿的第 n 格（位置對不上的只有 D13 第 33 格，見上面的註解；現在：'+J(off)+'）；33 個檔都沒有 for_LAWWW',tot>1500&&nn>=800&&len.length===0&&pos>=32&&off.every(x=>x==='D13#33')&&lost.length===0&&LOCS.every(k=>!(REC[k]._meta||{}).for_LAWWW),J([tot,nn,pos,off,len,lost.slice(0,4)]));
    if(WAS){ let d=0, back=0; const stt=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,ZQ), w=of(WAS.loc[k],k,ZQ), s=of(SRC[k],k,ZQ), o=of(OLDSRC[k],k,ZQ); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))){ if(g[p]!==w[p]) d++; else if(s[p]!==o[p]) back++; } if(J(Object.keys(g).sort())!==J(Object.keys(w).sort())) stt.push(k); }
      check('2. 子晴的格子和重匯以前（'+BASE+'）比：'+d+' 格不同；源稿改了、遊戲沒變的 '+back+' 格＝AA 把遊戲原本疊著的修正寫回源稿的格子；每個地點的格子（選項數、tier、喜好）一樣多',d>=800&&d+back===ch&&stt.length===0,J([d,back,ch,stt])); } });

  await sec(3,async()=>{ if(!WAS) return;
    const strip=D=>{ const x=JSON.parse(J(D)); delete x.source; if(x.lines){ delete x.lines[ZQ]; delete x.lines.heroine_01; } for(const k in x.loc) for(const part of ['lines','likes','dislikeLine']) if(x.loc[k][part]) { delete x.loc[k][part][ZQ]; delete x.loc[k][part].heroine_01; } return x; };   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的格子、短句也拿掉再比（tests/an_dates_1111_unit.js 另外驗；舊：只拿掉到子晴） */
    /* 2026-11-11（AA_780_an_date_followup.json@248c8e390，以安約會台詞匯入以後 AA 的後續改稿）：芷若 flaked[0][1]、語彤 flaked[0][0]（還有子晴自己的 flaked[0]）改成第二次當天取消的當下反應——
       NOW 先用 date_src_sha.js 的 un780 把那幾格還原成各人自己那一輪的字再比，那幾格另外驗現在＝新字、重匯以前＝舊字。舊期望：直接拿 NOW 比 */
    const N7=C.un780(NOW), F7=C.FLAKED_780.filter(r=>r.who!==ZQ);
    check('3. AA_780 換的別人那兩格（芷若 flaked[0][1]、語彤 flaked[0][0]）：現在是新字、重匯以前（'+BASE+'）是她們自己那一輪的字；整份還原以後和 NOW 只差 FLAKED_780 那三格',F7.length===2&&F7.every(r=>C.cell780(NOW,r)===r.new&&C.cell780(WAS,r)===r.old)&&(()=>{ const x=leaves(NOW,'',{}), y=leaves(N7,'',{}); return J(Object.keys(x).filter(p=>x[p]!==y[p]).sort())===J(C.FLAKED_780.map(r=>r.p).sort()); })(),J(F7.map(r=>[C.cell780(NOW,r),C.cell780(WAS,r)])));
    const a=leaves(strip(WAS),'',{}), b=leaves(strip(N7),'',{}), ka=Object.keys(a), diff=ka.filter(p=>a[p]!==b[p]).concat(Object.keys(b).filter(p=>!(p in a))).sort();
    check('3. 別人的格子（以安另外驗）、預約句、交通偏好、互動點（'+ka.length+' 格）和重匯以前（'+BASE+'）比：只有同一版的芷若 D10 小吃攤那一句不同，其他零差異',ka.length>22000&&J(diff)===J(ALSO.map(x=>x.full).sort())&&ALSO.every(x=>a[x.full]===x.old&&b[x.full]===x.new),J(diff.slice(0,8).map(p=>p+'：'+a[p]+' → '+b[p])));   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的四千五百多格拿掉以後格數少了，「至少幾格」跟著降（舊：ka.length>26000） */
    for(const [who,nm] of [   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：原本這一列還有以安（零差異），她的格子之後重寫了，拿掉 */ [ZR,'芷若'],[YT,'語彤'],[SIS,'學姊'],[PS,'沛珊'],[KX,'可昕'],['classmate_xinci','芯慈']]){ let n=0; const d=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,who), w=of(WAS.loc[k],k,who); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))){ n++; if(g[p]!==w[p]) d.push(k+' '+p); } }
      const exp=ALSO.filter(x=>x.who===who).map(x=>x.loc+' '+x.p).sort();
      check('3. '+nm+' 33 個地點 '+n+' 格和重匯以前比：'+(exp.length?'只有那 '+exp.length+' 句不同':'零差異')+'；不分地點的短句一樣'+(F7.some(r=>r.who===who)?'（flaked 那一格 AA_780 再換，還原再比）':''),n>(who==='classmate_xinci'?150:3500)&&J(d.sort())===J(exp)&&J(N7.lines[who])===J(WAS.lines[who]),J([n,d.slice(0,4)])); }   /* 2026-11-11（AA_780@248c8e390）：短句改比 N7（芷若、語彤 flaked 那一格還原；上面另外驗）；舊期望 J(NOW.lines[who])===J(WAS.lines[who]) */
    check('3. 交通偏好（prefs）、互動點名稱（points）和重匯以前一樣',J(NOW.prefs)===J(WAS.prefs)&&LOCS.every(k=>J(NOW.loc[k].points)===J(WAS.loc[k].points)));
    if(haveSrc){ const other=[]; for(const k of LOCS){ const a=leaves(SRC[k],'',{}), b=leaves(OLDSRC[k],'',{}); for(const p of new Set(Object.keys(a).concat(Object.keys(b)))) if(a[p]!==b[p]&&!/^\/(lines|likes|dislikeLine)\/heroine_0[14]\//.test(p)) other.push(k+p); }   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的格子（heroine_01）不算；子晴自己在這一版再改的 31 格本來就不算 */
      check('3. 源稿 '+SHA+' 和上一版 '+PREV+' 逐格比：子晴、以安以外的人只有芷若 D10 那一句不同（芷若其餘、語彤、學姊、沛珊、可昕 0 格）',J(other.sort())===J(ALSO.map(x=>x.loc+x.srcp).sort()),J(other.slice(0,8))); } });

  await sec(4,async()=>{
    const pf=DATE.PICK_FLAG.filter(x=>x.who===ZQ), ri=DATE.REMEMBER_IF.filter(x=>x.who===ZQ);
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：S.REMEMBER_IF 拿掉子晴 D06.cafe 那一列（再訪不分第一次選了什麼都聽 remember 的新句、她請）；PICK_FLAG 照記 ZQ_D06_TREAT（不再影響台詞）——她的 REMEMBER_IF 剩 D15 一筆、總數 2。
       舊期望：REMEMBER_IF 她兩筆（D06.cafe ZQ_D06_TREAT、D15.store ZQ_D15_NEXT）、總數 3 */
    check('4. 拿子晴的選項當 key 的只有 PICK_FLAG 兩筆（D06.cafe「我請妳。」→ ZQ_D06_TREAT、D15.store「布丁不行。」→ ZQ_D15_NEXT）和 REMEMBER_IF 一筆（D15.store ZQ_D15_NEXT；AA_812@633b7f7d6 拿掉 D06.cafe 那一列）；ARRIVE_VAR、S.LINE_IF 沒有她的項目；總數 PICK_FLAG 3、REMEMBER_IF 2、ARRIVE_VAR 2',J(pf.map(x=>[x.loc,x.pid,x.t,x.flag]))===J([['D06','D06.cafe','「我請妳。」','ZQ_D06_TREAT'],['D15','D15.store','「布丁不行。」','ZQ_D15_NEXT']])&&J(ri.map(x=>[x.loc,x.pid,x.flag]))===J([['D15','D15.store','ZQ_D15_NEXT']])&&!DATE.ARRIVE_VAR.some(x=>x.who===ZQ)&&!DATE.LINE_IF[ZQ]&&DATE.PICK_FLAG.length===3&&DATE.REMEMBER_IF.length===2&&DATE.ARRIVE_VAR.length===2,J(ri.map(x=>[x.loc,x.pid,x.flag])));
    const bad=[]; for(const v of DATE.ARRIVE_VAR){ const F=(((NOW.loc[v.loc]||{}).lines||{})[v.who]||{}).arrive, T=F&&F.first?F.first.lines.map(x=>x.text):[]; if(!v.from.every(t=>T.includes(t))) bad.push('ARRIVE_VAR '+v.loc+' '+v.who); }
    for(const r of DATE.PICK_FLAG){ const h=((((NOW.loc[r.loc]||{}).lines||{})[r.who]||{}).hotspots||{})[r.pid], c=h&&h.first&&h.first.choice||[]; if(!c.some(x=>x.t===r.t)) bad.push('PICK_FLAG '+r.loc+' '+r.who+' '+r.t); }
    for(const r of DATE.REMEMBER_IF){ const h=((((NOW.loc[r.loc]||{}).lines||{})[r.who]||{}).hotspots||{})[r.pid]; if(!(h&&h.remember&&h.remember.lines&&h.remember.lines.length)) bad.push('REMEMBER_IF '+r.loc+' '+r.who+' '+r.pid); }
    check('4. ARRIVE_VAR（沛珊 D28、可昕 D32）、PICK_FLAG、REMEMBER_IF（子晴 D06／D15、沛珊 D05）重匯以後都還對得上資料',bad.length===0,J(bad));
    const H6=NOW812.loc.D06.lines[ZQ].hotspots['D06.cafe'], H15=NOW.loc.D15.lines[ZQ].hotspots['D15.store'];   /* H6 看遊戲現在的字（NOW812，不還原）*/
    /* 2026-11-11（AA_812@f1fab0ec6）：回覆拿掉滷味（path_rows）、再訪句改成當場請（改稿紀錄 zq_D06 第 45 格；那一次她請客 S.SHE_PAYS）；旗標、REMEMBER_IF 照舊。
       舊期望：回覆「好。下次我請你吃滷味。」、有旗標的人再訪聽到「我說過要請你吃滷味，等一下去，我知道一間。」 */
    check('4. D06 咖啡：選項「我請妳。」還在第二個、回覆「下次我請。」（AA_846 那一列的 new）；有旗標的人再訪聽到「這家我來過兩次了。這次我請，你不要算。」（AA_812：當場請）',H6.first.choice[1].t==='「我請妳。」'&&H6.first.choice[1].reply[0].text==='下次我請。'&&J(H6.remember.lines.map(x=>x.text))===J(['這家我來過兩次了。這次我請，你不要算。']),J(H6.remember));   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：AA 把這一格改回「下次我請你吃滷味。」（AA_846 _meta.late_fix）。舊期望：回覆「好。下次我請。」（AA_812 path_rows） */   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：AA 把這一格改成「下次我請。」（源稿直接寫，AA_812 path_rows 那一列刪掉）。舊期望：回覆「下次我請你吃滷味。」 */
    check('4. D15 便利商店：選項「布丁不行。」還在第二個、回覆「欸，好啦。布丁下次。」沒動；有旗標的人再訪聽到「說好的布丁，這次我要拿了。」「山上的布丁比較好吃，這是我的理論。」（兌現）',H15.first.choice[1].t==='「布丁不行。」'&&H15.first.choice[1].reply[0].text==='欸，好啦。布丁下次。'&&J(H15.remember.lines.map(x=>x.text))===J(['說好的布丁，這次我要拿了。','山上的布丁比較好吃，這是我的理論。']),J(H15.remember));
    const ro=(loc,pid,R,flag)=>DATE.rememberOf({flags:flag?{[flag]:3}:{}},{who:ZQ,locs:[loc]},pid,R).lines.map(x=>x.text);
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：D06 沒旗標的人也聽 remember 的新句（她請）——REMEMBER_IF 沒有 D06.cafe 那一列，rememberOf 原樣回傳。舊期望：D06 沒旗標＝「這家的位子我記得，靠牆那桌插座最近。」（AA_775 備用句） */
    check('4. rememberOf 實際算：D06 有旗標、沒旗標都＝稿的那一句「這家我來過兩次了。這次我請，你不要算。」（AA_812@633b7f7d6）；D15 有旗標＝稿的兩句、沒旗標＝「布丁還在同一格，我要拿了。」（AA_775；沒旗標的人聽不到「說好的」）',J(ro('D06','D06.cafe',H6.remember,'ZQ_D06_TREAT'))===J(H6.remember.lines.map(x=>x.text))&&J(ro('D06','D06.cafe',H6.remember,null))===J(['這家我來過兩次了。這次我請，你不要算。'])&&J(ro('D15','D15.store',H15.remember,'ZQ_D15_NEXT'))===J(H15.remember.lines.map(x=>x.text))&&J(ro('D15','D15.store',H15.remember,null))===J(['布丁還在同一格，我要拿了。']),J([ro('D06','D06.cafe',H6.remember,null),ro('D15','D15.store',H15.remember,null)]));
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）新加：實際演兩次 D06.cafe（S.spotLine；第一次選哪一個 → 第二次 remember）——REMEMBER_IF 沒有 D06.cafe 那一列；第一次選「我請妳。」記 ZQ_D06_TREAT、選另一個不記（PICK_FLAG 照記），
       第二次兩種人都聽 remember 的新句「這家我來過兩次了。這次我請，你不要算。」（她請）、都聽不到 AA_775 的備用句。舊：沒旗標的人聽備用句（舊期望在上面 rememberOf 那一條） */
    const two6=async pick=>{ setup('2027-03-06',14,{}); know(ZQ); const t={who:ZQ,locs:['D06'],day:H.G.day,trip:'T9'}; H.said=[]; H.picks=[pick]; await DATE.spotLine(GM,t,'D06.cafe',0); const f1=H.G.flags.ZQ_D06_TREAT;
      DATE.mem(H.G,ZQ,'D06').last=['D06.cafe']; H.said=[]; H.picks=[]; await DATE.spotLine(GM,t,'D06.cafe',1); return {f1,s2:H.said.map(x=>x.t)}; };
    const p1=await two6('我請妳'), p2=await two6('什麼邏輯');
    check('4. D06.cafe 實際演兩次（AA_812@633b7f7d6）：S.REMEMBER_IF 沒有 D06.cafe 那一列；第一次選「我請妳。」記 ZQ_D06_TREAT、選「這是什麼邏輯？」不記；第二次兩種人都只聽 remember 的新句「這家我來過兩次了。這次我請，你不要算。」（沒旗標的人也聽，不換備用句）',
      !DATE.REMEMBER_IF.some(r=>r.loc==='D06'||r.pid==='D06.cafe')&&p1.f1!=null&&p2.f1==null&&J(p1.s2)===J(['這家我來過兩次了。這次我請，你不要算。'])&&J(p2.s2)===J(['這家我來過兩次了。這次我請，你不要算。']),J([p1,p2]));
    const a4=read('src/aa524_3d.js'), a5=read('src/aa525_3d.js');
    check('4. aa524_3d.js 的 remember 多一句只有兩筆（芷若 D04、語彤 D10），沒有子晴；aa525_3d.js 裡子晴的項目（S.LAD 的 Q2-L4「我會注意到。」）是事件 Q2 的選項，不是約會台詞',(a4.match(/\{key:'[a-z0-9]+',loc:'D\d\d',who:'/g)||[]).length===2&&!/loc:'D\d\d',who:'heroine_04'/.test(a4)&&a5.includes("{who:'heroine_04',step:'Q2-L4',t:'「我會注意到。」',f:'ZQ_SAW_THIRD'}")&&!/loc:'D\d\d'[^}]*who:'heroine_04'|who:'heroine_04'[^}]*loc:'D\d\d'/.test(a5));
    const code=[]; const walk=d=>{ for(const f of fs.readdirSync(path.join(H.ROOT,d))){ const p=d+'/'+f; if(fs.statSync(path.join(H.ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)&&p!=='src/data/date_lines.js') code.push([p,read(p).replace(/\/\*[\s\S]*?\*\//g,'')]); } }; walk('src');
    if(WAS){ const olds=new Set(), oopt=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,ZQ), w=of(WAS.loc[k],k,ZQ), cur=new Set(Object.values(g)); for(const p in w) if(typeof w[p]==='string'&&(/\/(text|t)$/.test(p)||/^dislikeLine\//.test(p))&&g[p]!==w[p]){ if(/\/t$/.test(p)) oopt.push([k,p.split('/')[2],w[p]]); if(w[p].replace(/[「」]/g,'').length>=8&&!cur.has(w[p])) olds.add(w[p]); } }
      const hit=[]; for(const s of olds) for(const [f,c] of code) if(c.includes(s)) hit.push(f+' '+s);
      check('4. 子晴換掉的舊句、舊選項（八個字以上、新稿那個地點已經沒有的 '+olds.size+' 句）沒有留在 src/ 的程式和資料檔裡（date_lines.js 以外 '+code.length+' 個檔）',olds.size>400&&code.length>100&&hit.length===0,J(hit.slice(0,4)));
      /* 短的舊選項（「好，躲吧。」這種）：看有沒有哪個檔同時寫著那個地點的互動點和那個選項（＝拿它當 key）*/
      const hit2=[]; for(const [k,pid,t] of oopt) for(const [f,c] of code){ let i=-1; while((i=c.indexOf(t,i+1))>=0){ const near=c.slice(Math.max(0,i-200),i+200); if(near.includes(pid)||(near.includes("'"+k+"'")&&near.includes(ZQ))) hit2.push(f+' '+pid+' '+t); } }
      check('4. 換掉的舊選項（'+oopt.length+' 個）沒有哪個程式檔把它和那個互動點寫在一起當 key',oopt.length>=20&&hit2.length===0,J(hit2.slice(0,4)));
      const treat=D=>LOCS.reduce((a,k)=>{ const hs=D.loc[k].lines[ZQ].hotspots||{}; for(const pid in hs) for(const c of ((hs[pid].first||{}).choice||[])) if(DATE.isTreat(c.t)) a.push(pid+c.t); return a; },[]);
      check('4. 請客的選項（DATE.isTreat 看選項的字）和重匯以前同一組（'+treat(NOW).length+' 個：'+treat(NOW).join('、')+'）——請客的選項一個都沒換字',J(treat(NOW))===J(treat(WAS))&&treat(NOW).length>=8&&treat(NOW).includes('D06.cafe「我請妳。」')&&treat(NOW).includes('D15.store「全部我請。」'),J([treat(NOW),treat(WAS)]));
      const opts=[]; let t=0; for(const k of LOCS){ const g=of(NOW.loc[k],k,ZQ), w=of(WAS.loc[k],k,ZQ); for(const p in g) if(/\/t$/.test(p)){ t++; if(g[p]!==w[p]) opts.push(k+' '+p.replace(/^lines\/hotspots\//,'').replace('/first/choice/','#').replace(/\/t$/,'')+' '+w[p]+'→'+g[p]); } }
      check('4. 子晴的選項（'+t+' 個）換字 '+opts.length+' 個，在這二十個互動點：D02 garden、D05 garden、D08 giraffe／train、D09 path、D10 bridge、D12 sunset、D14 sunset、D15 rail、D16 beach、D17 platform／trail、D19 view、D20 bridge、D21 bridge／temple、D22 lake、D24 station、D28 circle、D29 harbor（都不是 PICK_FLAG 的那兩個互動點）',opts.length>=20&&['D02.garden','D05.garden','D08.giraffe','D08.train','D09.path','D10.bridge','D12.sunset','D14.sunset','D15.rail','D16.beach','D17.platform','D17.trail','D19.view','D20.bridge','D21.bridge','D21.temple','D22.lake','D24.station','D28.circle','D29.harbor'].every(x=>opts.some(o=>o.includes(' '+x+'#')))&&!opts.some(o=>/ D06\.cafe#| D15\.store#/.test(o)),J(opts));
      check('4. 換字的選項抽五個照稿：D08 長頸鹿①「牠在看妳。」、D09 步道①「我走外面。」、D16 沙灘①「脫鞋踩水？」、D21 橋①「下去踩水？」、D29 港邊①「看到它吊東西再走？」',['D08 D08.giraffe#0 「好，躲吧。」→「牠在看妳。」','D09 D09.path#0 「我幫妳開路。」→「我走外面。」','D16 D16.beach#0 「好，躲吧。」→「脫鞋踩水？」','D21 D21.bridge#0 「跳吧。」→「下去踩水？」','D29 D29.harbor#0 「等到晚上？」→「看到它吊東西再走？」'].every(x=>opts.includes(x)),J(opts.slice(0,3)));
      /* fx、旗標：選項物件除了 t、reply 的字以外的欄位（fx、set、flag、cost、extra、if…）一格都沒動——of() 逐格比過（第 2 節），這裡再看選項物件的 key */
      const kk=D=>LOCS.map(k=>{ const hs=D.loc[k].lines[ZQ].hotspots||{}; return Object.keys(hs).map(pid=>((hs[pid].first||{}).choice||[]).map(c=>Object.keys(c).sort().join(',')).join('|')).join(';'); }).join('\n');
      check('4. 每個選項物件的欄位（t、reply、fx、記的旗標…）和重匯以前一樣',kk(NOW)===kk(WAS)); } });

  await sec(5,async()=>{ const all=J(NOW.loc);
    for(const x of ALSO){ const g=of(NOW.loc[x.loc],x.loc,x.who); check('5. '+x.loc+' 芷若：「'+x.new+'」進了（'+x.p.replace(/^lines\//,'').replace(/\/text$/,'')+'）；上一版的「'+x.old+'」整個檔都沒有',g[x.p]===x.new&&!all.includes(x.old),String(g[x.p])); }
    const sn=NOW.loc.D10.lines[ZR].hotspots['D10.snack'];
    check('5. 芷若 D10 小吃攤：選項「下次我做給妳。」沒動、回覆不再「記下來」（不留約定）；AA_524 Z7 的舊句「你會做什麼？算了，你先學。」也不在',sn.first.choice[1].t==='「下次我做給妳。」'&&sn.first.choice[1].reply.length===1&&!/記下來|記性/.test(sn.first.choice[1].reply[0].text)&&!all.includes('你會做什麼？算了，你先學。'),J(sn.first.choice[1])); });

  await sec(6,async()=>{ const LQ=NOW.lines[ZQ];
    /* 2026-11-11（AA_780_an_date_followup.json@248c8e390，以安約會台詞匯入以後 AA 的後續改稿）：flaked「那天我設了鬧鐘，還真的起來了，結果你沒來。這種事一次就好。」換成「又取消。我鬧鐘都設好了。這種事不要有第三次。」
       （30 天內第二次當天取消的當下說的，沒有人等過）。舊期望：flaked＝['那天我設了鬧鐘，還真的起來了，結果你沒來。這種事一次就好。']（AA_775 的字）*/
    check('6. lines.heroine_04 五格照稿：transport「我本來想在車上寫東西。好吧，坐你的車，我看窗外。」、cancel 兩句「臨時取消？好啦，我回去睡回籠覺。」「好。我自己去打電動，你不要後悔。」、flaked「又取消。我鬧鐘都設好了。這種事不要有第三次。」（AA_780 再換；AA_775 是「那天我設了鬧鐘，…」）、enough 第一句「好，我今天的份用完了，是開心的那種用完。」',J(LQ.transport)===J(['我本來想在車上寫東西。好吧，坐你的車，我看窗外。'])&&J(LQ.cancel)===J(['臨時取消？好啦，我回去睡回籠覺。','好。我自己去打電動，你不要後悔。'])&&J(LQ.flaked)===J(['又取消。我鬧鐘都設好了。這種事不要有第三次。'])&&LQ.enough[0]==='好，我今天的份用完了，是開心的那種用完。',J(LQ));
    check('6. 不改的照舊：accept 兩句、acceptDating、move 兩句、move3、depart 三句、enough 第二句、leaveEarly、noPair',J(LQ.accept)===J(['好啊。','好，幾點？我可能會晚到五分鐘。'])&&J(LQ.acceptDating)===J(['好。那天的 bug 我留到隔天再修。'])&&J(LQ.move)===J(['好，改。','可以，那天我反正也在家。'])&&J(LQ.move3)===J(['第三次了喔。好啦，這個時間。'])&&J(LQ.depart)===J(['我已經到了。你在哪。','我出門了。下午兩點出門，算早。','今天我有睡飽。這很重要。'])&&LQ.enough[1]==='腳好痠。我沒有在撒嬌。'&&J(LQ.leaveEarly)===J(['才剛到？好。下次補。'])&&J(LQ.noPair)===J(['合照？先不要。我今天的瀏海不行。']));
    const HOME='（晚上她回家。你住在車站附近的旅館。）', rq=k=>DATE.REMEMBER_IF.find(x=>x.who===ZQ&&x.loc===k);
    /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：REMEMBER_IF D06 那一列（AA_775 的備用句「這家的位子我記得，靠牆那桌插座最近。」）整列拿掉——沒旗標的人也聽 remember 的新句。舊期望：rq('D06').no＝[那一句] */
    check('6. date3d.js 四格：S.MORNING 子晴「昨天我又弄到兩點。你先去吃早餐，幫我留一個甜的。」；REMEMBER_IF D06 那一列不在了（AA_812@633b7f7d6；AA_775 的備用句「這家的位子我記得，靠牆那桌插座最近。」不在程式裡）、D15 沒旗標的備用句「布丁還在同一格，我要拿了。」；S.NIGHT_HOME 多一列 D26＋子晴（＝「'+HOME+'」）；她沒有 MORNING_OWN／MORNING_HOME；舊句不在程式裡',DATE.MORNING[ZQ]==='昨天我又弄到兩點。你先去吃早餐，幫我留一個甜的。'&&rq('D06')===undefined&&!read('src/date3d.js').replace(/\/\*[\s\S]*?\*\//g,'').includes('這家的位子我記得，靠牆那桌插座最近。')&&J(rq('D15').no)===J([{who:ZQ,text:'布丁還在同一格，我要拿了。'}])&&J(DATE.NIGHT_HOME)===J([{loc:'D29',who:KX},{loc:'D26',who:ZQ},{loc:'D26',who:'heroine_01'}])&&DATE.NIGHT.home===HOME&&!DATE.MORNING_OWN[ZQ]&&!DATE.MORNING_HOME[ZQ]&&!/上次也來這裡|今天你負責叫我/.test(read('src/date3d.js').replace(/\/\*[\s\S]*?\*\//g,'')),J([DATE.MORNING[ZQ],DATE.NIGHT_HOME]));   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：S.NIGHT_HOME 再多一列 D26＋以安（舊期望：兩列） */
    const raw=show(C.ZQ_COMMON_SHA,SP+'AA_775_zq_date_common.json'), A=raw?JSON.parse(raw):null;
    if(A){ const r1=A.rows.filter(r=>r.file==='src/data/date_lines.js'), r2=A.rows.filter(r=>r.file==='src/date3d.js');
      const at=r=>{ if(r.path==='S.MORNING.heroine_04') return DATE.MORNING[ZQ]; const m=/^S\.REMEMBER_IF（loc (D\d\d)、who (\w+)、pid ([\w.]+)）\.no\[0\]\.text$/.exec(r.path); if(m){ const x=DATE.REMEMBER_IF.find(y=>y.loc===m[1]&&y.who===m[2]&&y.pid===m[3]); return x&&x.no&&x.no.length===1?x.no[0].text:null; } if(/^D26 /.test(r.path)) return DATE.NIGHT_HOME.some(x=>x.loc==='D26'&&x.who===ZQ)?DATE.NIGHT[DATE.nightKind({flags:{}},{who:ZQ,locs:['D26']},null)]:null; return undefined; };
      /* 2026-11-11（AA_780@248c8e390）：flaked[0] 那一列 AA_780 再換（old＝這一列的 new），那一格改認 AA_780 的 new（date_src_sha.js 的 want780；別的列照舊認這份稿的 new）。舊期望：五列都＝這份稿的 new */
      /* 2026-11-11（AA_812@633b7f7d6、AA 12:4x 四點）：date3d.js 那四列裡「S.REMEMBER_IF（loc D06、who heroine_04、pid D06.cafe）.no[0].text」那一列被 AA_812 取代——整列 REMEMBER_IF 拿掉，那一格改認「不在」（at＝null）；稿 AA_775 不改，別的三列照舊認這份稿的 new。
         舊期望：四列都＝這份稿的 new（D06 那一列＝「這家的位子我記得，靠牆那桌插座最近。」） */
      const D06ROW='S.REMEMBER_IF（loc D06、who heroine_04、pid D06.cafe）.no[0].text', want3=r=>r.path===D06ROW?null:r.new;
      check('6. 逐字：稿 9 列（date_lines.js 五列、date3d.js 四列）；每一列的 new 在 path 那一格（REMEMBER_IF 兩列照 loc／who／pid 找；D26 那一列＝對象是子晴、地點 D26 時晚上那一句；flaked[0] 那一列＝AA_780 再換的字；REMEMBER_IF D06 那一列＝AA_812@633b7f7d6 拿掉了、不在）',A.rows.length===9&&r1.length===5&&r2.length===4&&r1.every(r=>getp(NOW,r.path)===C.want780(r))&&r1.filter(r=>C.want780(r)!==r.new).map(r=>r.path).join()==='lines.heroine_04.flaked[0]'&&r2.every(r=>at(r)===want3(r))&&r2.filter(r=>want3(r)!==r.new).map(r=>r.path).join()===D06ROW,J(r1.filter(r=>getp(NOW,r.path)!==C.want780(r)).map(r=>r.path).concat(r2.filter(r=>at(r)!==want3(r)).map(r=>r.path+'＝'+at(r)))));
      if(WAS){ const a=leaves(WAS.lines[ZQ],'',{}), b=leaves(LQ,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]).sort();
        check('6. lines.heroine_04 和重匯以前比：格子一樣多、只有這五格不同（照 path；old 就是原本那一格的字）',J(Object.keys(a))===J(Object.keys(b))&&J(d)===J(['/cancel/0','/cancel/1','/enough/0','/flaked/0','/transport/0'])&&r1.every(r=>getp(WAS,r.path)===r.old||require('./ellipsis694.js').strip(r.old)===getp(WAS,r.path)),J(d)); }
      const ob3=show(BASE,'src/date3d.js'); if(ob3){ const lit=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').match(/'(?:[^'\\\n]|\\.)*'/g)||[], O=lit(ob3), L=lit(show('e61d19547','src/date3d.js')||read('src/date3d.js')) /* 2026-11-11：「重匯以後」固定比 e61d19547（子晴 AA_775 進來的那個 commit）的 date3d.js；原本比現在的檔，之後每加一個字串（S.DEV_NOTE、以安 AA_777…）就紅 */, cnt=A=>A.reduce((m,t)=>(m[t]=(m[t]||0)+1,m),{}), co=cnt(O), cl=cnt(L), gone=[], came=[];
        for(const t of new Set(O.concat(L))){ const n=(cl[t]||0)-(co[t]||0); for(let i=0;i<Math.abs(n);i++) (n<0?gone:came).push(t); }
        const q=t=>"'"+t+"'", r3=r2.slice(0,3);
        check('6. date3d.js 的字串和重匯以前（'+BASE+'）比：少掉的剛好是稿上前三列的 old（S.MORNING 一句、「上次也來這裡。」兩次）、多出來的剛好是三列的 new＋NIGHT_HOME 那一列的 \'D26\'、\'heroine_04\'（條件、別人的句子、程式沒動）',J(gone.sort())===J(r3.map(r=>q(r.old)).sort())&&J(came.sort())===J(r3.map(r=>q(r.new)).concat([q('D26'),q(ZQ)]).sort()),J([gone,came])); } }
    /* transport 那一句什麼時候播：她有交通偏好的地點、玩家改掉（prefOff）。「坐你的車」要成立＝另一種走法只有開車 */
    const P=NOW.prefs[ZQ]||{}, modes=k=>(DATE.loc(k).transport||[]).map(x=>x.mode);
    check('6. 子晴有交通偏好的地點：D27 嘉義、D28 臺南、D29 高雄（都是高鐵），這三個地點另一種走法都只有開車——所以「…好吧，坐你的車，我看窗外。」只會在改成開車時播',J(Object.keys(P).sort())===J(['D27','D28','D29'])&&Object.keys(P).every(k=>P[k].transport==='hsr'&&modes(k).includes('hsr')&&J(modes(k).filter(m=>m!=='hsr'))===J(['car']))&&!LOCS.some(k=>!P[k]&&DATE.prefOf(ZQ,k)),J([P,modes('D27'),modes('D28'),modes('D29')]));
    const TL='我本來想在車上寫東西。好吧，坐你的車，我看窗外。', res=[];
    for(const [loc,mode] of [['D27','開車'],['D27','高鐵'],['D30',null]]){ const G=setup('2026-03-27',20,{dating_heroine_04:true}); know(ZQ); H.said=[]; H.opts=[]; const names=(DATE.loc(loc).transport||[]).length>1; H.picks=['兩天一夜…',DATE.loc(loc).name].concat(mode?[mode]:(names?['台鐵']:[]),['明天','09:00','就這樣約']);
      let t=null; try{ t=await DATE.menu(GM,ZQ,null); }catch(e){ t={ok:false,why:String(e.message)}; } const L=H.said.map(s=>s.t); res.push([loc,mode,!!(t&&t.ok),t&&t.transport,L.includes(TL)]); }
    check('6. 實際約一次（選單，兩天一夜）：D27 嘉義改開車＝她說這一句、照她的搭高鐵＝不說；D30 花蓮（她沒有偏好）不說',res[0][2]&&res[0][3]==='car'&&res[0][4]===true&&res[1][2]&&res[1][3]==='hsr'&&res[1][4]===false&&res[2][4]===false,J(res));
    /* D26 臺中是她的家鄉：晚上她回家（S.NIGHT_HOME），早上照 S.MORNING */
    const nk=(who,loc,own,dt)=>DATE.nightKind({flags:dt?{['dating_'+who]:true}:{}},{who,locs:[loc]},own);
    check('6. nightKind：子晴 D26＝home（交往中、沒交往都一樣）；子晴去別的地點照舊（交往中＝民宿、沒交往＝兩間房）；別人去 D26 照舊（可昕交往中＝民宿；以安在臺中的家＝home）；可昕 D29 照舊 home',nk(ZQ,'D26',null,true)==='home'&&nk(ZQ,'D26',null,false)==='home'&&nk(ZQ,'D27',null,true)==='dating'&&nk(ZQ,'D28',null,false)==='single'&&nk(KX,'D26',null,true)==='dating'&&nk(SIS,'D26',null,false)==='single'&&nk('heroine_01','D26','home',true)==='home'&&nk(KX,'D29',null,false)==='home');
    const go=async(who,loc,dt)=>{ const G=setup('2026-03-27',20,dt?{['dating_'+who]:true}:{}); know(who); const day=G.day+1, tr=(DATE.loc(loc).transport||[])[0].mode, b=DATE.book(G,{who,locs:[loc],transport:tr,day,depart:9,kind:'overnight',by:'player'}); if(!b.ok) return {b};
      const q=OUT.get(G,'date_'+b.trip); G.day=day; G.weekday=(G.weekday+1)%7; G.hour=9; H.said=[]; H.opts=[]; GM._reset(); H.picks=['出發']; await OUT.prompt(GM,q); return {b,t:DATE.trip(G,b.trip),L:H.said.map(s=>s.t)}; };
    const r1=await go(ZQ,'D26',true), r3=await go(ZQ,'D27',true);
    const okHome=r=>!!r.t&&r.t.night==='home'&&r.L.includes(HOME)&&r.L.filter(x=>/^（晚上/.test(x)).length===1&&r.L[r.L.indexOf('（第二天早上。）')+1]===DATE.MORNING[ZQ];
    check('6. 實際演：和子晴去臺中兩天一夜（交往中；沒交往的那一種看上面的 nightKind），第一天晚上旁白「'+HOME+'」（只有這一句晚上的旁白；不寫阿嬤家、不寫爸爸），第二天早上「（第二天早上。）」＋「'+DATE.MORNING[ZQ]+'」；到達第一句「臺中。回到我的地盤了。」',okHome(r1)&&r1.L.includes('臺中。回到我的地盤了。')&&!/阿嬤|爸/.test(HOME),J([r1.b&&r1.b.why,(r1.L||[]).slice(0,6),(r1.L||[]).filter(x=>/晚上|早上/.test(x))]));
    check('6. 對照：和子晴去嘉義（D27，交往中）＝民宿那一句（不是她的家鄉）',!!r3.t&&r3.t.night==='dating'&&r3.L.includes(DATE.NIGHT.dating)&&!r3.L.includes(HOME),J([r3.t&&r3.t.night,r3.b&&r3.b.why]));
    /* 「子晴的約一律下午三點以後到」（date3d.js）和新稿：稿裡沒有綁「三點才起床／才到」的句子；{name} 只在八格交往格 */
    const all={}; for(const k of LOCS){ const g=of(NOW.loc[k],k,ZQ); for(const p in g) if(typeof g[p]==='string'&&(/\/(text|t)$/.test(p)||/^dislikeLine\//.test(p))) all[k+' '+p]=g[p]; }
    const three=Object.entries(all).filter(([p,v])=>/三點/.test(v)).map(([p,v])=>p+'：'+v), early=Object.entries(all).filter(([p,v])=>/(六點半|七點|八點|九點|早上)[^。]*起床/.test(v)).map(([p,v])=>p+'：'+v);
    check('6. date3d.js「子晴的約一律下午三點以後到」那一條照舊（到達時間早於 15:00 擋掉）；她 33 個地點的台詞沒有「三點」、沒有「早上幾點起床」這種綁時段的句子（D28 原本的「我六點半起床的」換掉了）',/if\(id==='heroine_04'&&arrive!=null\)\{ if\(arrive<15-1e-6\) return '她那時候有事';/.test(read('src/date3d.js'))&&three.length===0&&early.length===0,J([three,early]));
    const nm=Object.entries(all).filter(([p,v])=>v.includes('{name}')).map(([p])=>p);
    check('6. {name} 只在八格交往格：D01、D09、D12、D15、D23、D26、D28、D33（都在 dating 底下）；其他佔位符只有 D13 的 {lastDrink}',J(nm.map(p=>p.slice(0,3)))===J(['D01','D09','D12','D15','D23','D26','D28','D33'])&&nm.every(p=>/\/dating\//.test(p))&&J(Object.entries(all).filter(([p,v])=>/\{(?!name\})/.test(v)).map(([p,v])=>p.slice(0,3)+(v.match(/\{[^}]*\}/)||[''])[0]))===J(['D13{lastDrink}']),J(nm)); });

  await sec(7,async()=>{ const W=DW(read('src/data/date_wish.js')), ev=W.events[ZQ], I=ev.herInvite;
    check('7. date_wish.js 的來源寫著「AA_776@'+C.ZQ_WISH_SHA+'（子晴 D03 心願 30 列，換了 30 列）」；子晴的事件 id、地點 D03、她約的時間（15 點——對得上「三點以後到」；她傳的「週六下午三點。參創。」「……你要來嗎？」沒動）照舊',W.source.includes('AA_776@'+C.ZQ_WISH_SHA+'（子晴 D03 心願 30 列，換了 30 列）')&&ev.id==='wish_heroine_04'&&ev.loc==='D03'&&I.dateTime===15&&J(I.lines.map(x=>x.text))===J(['週六下午三點。參創。','……你要來嗎？'])&&J(I.accept.map(x=>x.text))===J(['好。三點門口。遲到我先進去。']),J([I.dateTime,I.lines,I.accept]));
    const raw=show(C.ZQ_WISH_SHA,SP+'AA_776_zq_wish.json'), A=raw?JSON.parse(raw):null;
    const get=(o,pth)=>{ let x=o; const tk=[...pth.matchAll(/\["([^"]+)"\]|\.?([^.\[\]"]+)|\[(\d+)\]/g)].map(m=>m[1]!=null?m[1]:(m[2]!=null?m[2]:+m[3])); for(let i=0;i<tk.length;i++){ if(x==null) return x; let t=tk[i]; if(typeof x==='object'&&!Array.isArray(x)&&!(t in x)&&typeof tk[i+1]==='string'&&(t+'.'+tk[i+1]) in x){ t=t+'.'+tk[i+1]; i++; } x=x[t]; } return x&&typeof x==='object'?x.text:x; };   /* hotspots 的 key 是「D03.demo」這種帶點的字串 */
    if(A){ check('7. 逐字：稿 30 列（path 不重複），每一列 path 那一格現在是 new',A.rows.length===30&&new Set(A.rows.map(r=>r.path)).size===30&&A.rows.every(r=>get(ev,r.path)===r.new),J(A.rows.filter(r=>get(ev,r.path)!==r.new).map(r=>r.path)));
      const tmp=path.join(os.tmpdir(),'date_wish_zq1111_'+process.pid+'.js'); let ok=false, out='';
      try{ out=cp.execFileSync('python3',['tools/date/import_wish.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_wish.js'); }catch(x){ out=String(x.stderr||x.stdout||x.message).slice(0,300); }
      try{ fs.unlinkSync(tmp); }catch(x){}
      check('7. tools/date/import_wish.py 重匯（--out 另存）的結果和 src/data/date_wish.js 一樣',ok,ok?'':out.slice(0,300)); }
    const ow=show(BASE,'src/data/date_wish.js'); if(ow){ const O=DW(ow), ids=Object.keys(O.events).filter(k=>k!==ZQ&&k!=='heroine_01'), a=leaves(O.events[ZQ],'',{}), b=leaves(ev,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]);
      check('7. 別人的心願事件（'+ids.length+' 位：芷若、語彤、學姊、沛珊、可昕；以安另外驗）和重匯以前（'+BASE+'）一樣（0 格不同）；hold、verify（miss 0 句、「你來過一次」那幾句）照舊',ids.length===5&&ids.every(k=>J(O.events[k])===J(W.events[k]))&&J(O.hold)===J(W.hold)&&J(O.verify)===J(W.verify)&&W.verify.miss.length===0&&J(Object.keys(W.hold))==='[]',J([Object.keys(W.hold),W.verify.miss]));   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0／AA_777／AA_778@1f88da7cc）：以安的心願事件照 AA_778 收字 16 格（tests/an_dates_1111_unit.js 另外驗），拿掉再比；舊期望 6 位 */
      check('7. 子晴的事件和重匯以前比：格子一樣多、不一樣的 30 格都是她說的台詞的 text（旁白、選項的字 t、note、條件、時間、地點、分支沒動）；old 就是原本那一格的字',J(Object.keys(a))===J(Object.keys(b))&&d.length===30&&d.every(k=>/\/text$/.test(k)&&b[k.replace(/text$/,'who')]===ZQ)&&(!A||A.rows.every(r=>get(O.events[ZQ],r.path)===r.old)),J([d.length,d.filter(k=>!/\/text$/.test(k))])); }
    const dots=[]; const w=o=>{ if(Array.isArray(o)) o.forEach(w); else if(o&&typeof o==='object'){ if(typeof o.text==='string'&&o.who&&o.who!=='note'&&o.text.includes('……')) dots.push(o.text); for(const k in o) w(o[k]); } }; w(ev);
    check('7. 刪節號只剩 AA 說要留的三處：她主動約的「……你要來嗎？」、窗邊「以前。……之後再說。」、收尾「……你過橋的時候，我沒在看畫面。」',J(dots.slice().sort())===J(['……你要來嗎？','以前。……之後再說。','……你過橋的時候，我沒在看畫面。'].sort()),J(dots));
    const hs=ev.hotspots, tx=J(ev);
    check('7. D116 三處改掉：試玩區「好到我想馬上回去改我的。」「你又在鼓勵我。好，我收下，我回去會改。」、舊機台「這台我國中每天放學都去打，打到店員認得我。」「臺中的店。這裡的機台比較新，按鍵沒那麼鬆。」（沒有「不爽」「我的會更好」「第三十二名」「排行」）',hs['D03.demo'].lines[1].text==='好到我想馬上回去改我的。'&&hs['D03.demo'].choices[1].reply[0].text==='你又在鼓勵我。好，我收下，我回去會改。'&&hs['D03.arcade'].lines[0].text==='這台我國中每天放學都去打，打到店員認得我。'&&hs['D03.arcade'].lines[1].text==='臺中的店。這裡的機台比較新，按鍵沒那麼鬆。'&&!/不爽|我的會更好|第三十二名|排行/.test(tx));
    check('7. 嫌祐廷兩處、寫死身分兩處改掉、窗邊加「上來」：「你的手跟不上眼睛。可是你沒有放棄，這點我尊重。」「左手是節奏，右手是旋律。先顧左手就好，右手我幫你。」「好，我講太多了。我回去弄我的東西。」「參創？你也知道參創？」「（看窗外的路口）以前我爸會帶我上來這一帶買零件。」（沒有「你很爛」「亂打」「寫作業」「法律系的」）',hs['D03.arcade'].choices[0].reply[1].text==='你的手跟不上眼睛。可是你沒有放棄，這點我尊重。'&&hs['D03.arcade'].choices[2].reply[0].text==='左手是節奏，右手是旋律。先顧左手就好，右手我幫你。'&&ev.mention.choices[2].reply[0].text==='好，我講太多了。我回去弄我的東西。'&&ev.playerInvite.unknown[0].text==='參創？你也知道參創？'&&hs['D03.window'].lines[0].text==='（看窗外的路口）以前我爸會帶我上來這一帶買零件。'&&!/你很爛|亂打|寫作業|法律系的/.test(tx));
    check('7. AA 說不動的照舊：收尾「最後一關換你。」「我說的是以前。」、Q12 以後「我的最後一關，我爸打過了。打很爛。」（說的是她爸）、AA_525 1-5 的結尾「那座橋，我回去要畫一次。」；這個事件沒有佔位符',tx.includes('"最後一關換你。"')&&tx.includes('"我說的是以前。"')&&ev.closing.after[1].lines[0].text==='我的最後一關，我爸打過了。打很爛。'&&tx.includes('"那座橋，我回去要畫一次。"')&&!Object.values(leaves(ev,'',{})).some(v=>typeof v==='string'&&/[{}]/.test(v)));
    const wcode=read('src/wish3d.js').replace(/\/\*[\s\S]*?\*\//g,''); check('7. src/wish3d.js 沒有寫死子晴心願事件換掉的句子（讀資料檔）',!A||!A.rows.some(r=>r.old.length>=6&&wcode.includes(r.old))); });

  await sec(8,async()=>{ const K=NOW.loc.D13.lines[ZQ], nn=[]; const w=(o,p)=>{ if(Array.isArray(o)) o.forEach((v,i)=>w(v,p+'/'+i)); else if(o&&typeof o==='object'){ if(typeof o.text==='string'&&o.who&&o.who!==ZQ) nn.push(o.who+':'+o.text); for(const k in o) w(o[k],p+'/'+k); } }; w(K,'');
    const nn0=[]; if(WAS){ const w0=(o)=>{ if(Array.isArray(o)) o.forEach(w0); else if(o&&typeof o==='object'){ if(typeof o.text==='string'&&o.who&&o.who!==ZQ) nn0.push(o.who+':'+o.text); for(const k in o) w0(o[k]); } }; w0(WAS.loc.D13.lines[ZQ]); }
    check('8. D13 淡水「記 TASTE＝full_sugar」那一格照留（不顯示的註記，date3d.js 讀得到）；她這個地點不是她說的格子（註記 2、旁白 1）和重匯以前一樣',nn.includes('note:記 `TASTE`＝`full_sugar`')&&/記 `?TASTE`?＝`?([^`]+)`?/.exec('記 `TASTE`＝`full_sugar`')[1]==='full_sugar'&&read('src/date3d.js').includes("/記 `?TASTE`?＝`?([^`]+)`?/")&&nn.length===3&&(!WAS||J(nn)===J(nn0)),J(nn));
    if(WAS){ const nar=[], who=[], nt=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,ZQ), o=of(WAS.loc[k],k,ZQ); for(const p in g){ if(/\/text$/.test(p)&&g[p]!==o[p]&&g[p.replace(/text$/,'who')]==='narr') nar.push(k+' '+o[p]+' → '+g[p]); if(/\/who$/.test(p)&&g[p]!==o[p]) who.push(k+' '+p); if(/\/text$/.test(p)&&g[p.replace(/text$/,'who')]==='note'&&g[p]!==o[p]) nt.push(k+' '+p); } }
      console.log('（旁白格——who 是旁白——改了字的 '+nar.length+' 格，照稿匯：'+nar.join('；')+'）');
      check('8. 每一格是誰說的（who：她、旁白、註記）和重匯以前一樣；註記格的字沒動',who.length===0&&nt.length===0,J([who.slice(0,4),nt])); }
    check('8. 子晴 33 個地點都有到達、收尾、互動點；沒有空字串、沒有 {name}、{sunset}、{lastDrink} 以外的佔位符',LOCS.every(k=>{ const L=NOW.loc[k].lines[ZQ]; return L&&L.arrive&&L.closing&&L.hotspots&&Object.keys(L.hotspots).length>=2; })&&!Object.values(LOCS.reduce((a,k)=>Object.assign(a,Object.fromEntries(Object.entries(of(NOW.loc[k],k,ZQ)).map(([p,v])=>[k+p,v]))),{})).some(v=>typeof v==='string'&&(v===''||/\{(?!name\}|sunset\}|lastDrink\})/.test(v)))); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
