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
const YT='heroine_03', SIS='heroine_05', PS='classmate_peishan', SHA='0a2136911', PREV='82c946ad7', BASE='7bb6f6311', SP='docs/story_planning/';
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
const read=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const LOCS=Array.from({length:33},(_,k)=>'D'+String(k+1).padStart(2,'0'));
const leaves=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>leaves(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) leaves(x[k],p+'/'+k,o); else o[p]=x; return o; };
const of=(D,k,who)=>{ const o={}; for(const part of ['lines','likes','dislikeLine']) if(D[part]&&D[part][who]!=null) leaves(D[part][who],part,o); return o; };
const NOW=DL(read('src/data/date_lines.js'));
const SRC={}, OLDSRC={}, REC={}; for(const k of LOCS){ const t=show(SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'), r=show(SHA,SP+'date_rewrite/yt_'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLDSRC[k]=JSON.parse(u); if(r) REC[k]=JSON.parse(r); }
const haveSrc=Object.keys(SRC).length===33&&Object.keys(OLDSRC).length===33&&Object.keys(REC).length===33;
const ob=show(BASE,'src/data/date_lines.js'), WAS=ob?DL(ob):null;
const END='天快暗了。夕陽，我想留到河邊看。';   // AA_630 第 10 節第 2 點（AA_694 拿掉「……」以後）；程式加的（tools/story/aa630.py d14_before_sunset）
const D14C=p=>/^lines\/closing\//.test(p);

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
    const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===SHA&&e[0].status==='approved'&&(e[0].history||[]).some(h=>h.sha===PREV)); });
    check('1. 白名單 D01～D33 都是 '+SHA+'、approved，上一版 '+PREV+' 留在 history',bad.length===0,J(bad));
    check('1. date_lines.js 的來源寫著 33 個地點 @'+SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+SHA)));
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
      check('1. 學姊跳過的列照舊 81 列、沛珊照舊 11 列；AA_598 逐句表 93 列：34 列源稿已經是新句（寫回源稿的那 34 格）、4 列照舊換、55 列跳過',/學姊重寫（DLG-FULL-REVIEW-1110）跳過的改句 81 列/.test(out)&&/沛珊重寫（PEISHAN-VOICE-1110）跳過的改句 11 列/.test(out)&&/換 4 句、已經是新句 34 句、源稿重寫了跳過 55 句（共 93 列）/.test(out)); }
    const tool=read('tools/date/import_date_lines.py');
    check('1. 工具只對沛珊、學姊、語彤放寬（ps_skip 先看 who；別人的列照舊 sys.exit）；AA_630 第 2 節原句還在＝停下來',/if who not in \(PS, SIS, YT\) or not ps756\(loc, who\):\s+return False/.test(tool)&&tool.includes("YT = 'heroine_03'")&&tool.includes('還是原句')&&tool.includes('不是語彤的格子，不能跟著跳過')); });

  await sec(2,async()=>{ if(!haveSrc){ for(const k of LOCS) check('2. '+k+'：語彤有台詞',!!(NOW.loc[k].lines&&NOW.loc[k].lines[YT])); return; }
    let n=0; const bad=[];
    for(const k of LOCS){ const g=of(NOW.loc[k],k,YT), s=of(SRC[k],k,YT);
      for(const p of new Set(Object.keys(g).concat(Object.keys(s)))){ if(k==='D14'&&D14C(p)) continue; n++; if(g[p]!==s[p]) bad.push(k+' '+p+'：稿「'+s[p]+'」遊戲「'+g[p]+'」'); } }
    check('2. 語彤 33 個地點 '+n+' 格（D14 四個收尾另外看）和源稿 '+SHA+' 一字不差、格子一樣多',n>4400&&bad.length===0,J(bad.slice(0,6)));
    const C=NOW.loc.D14.lines[YT].closing, SC=SRC.D14.lines[YT].closing, tx=b=>b.lines.map(x=>x.text);
    check('2. D14 漁人碼頭四個收尾：前面都有「'+END+'」，後面照稿（第一次的收尾照舊換掉第一句、其他三個加在最前面）',J(tx(C.first))===J([END].concat(tx(SC.first).slice(1)))&&C.normal.length===2&&C.normal.every((b,i)=>J(tx(b))===J([END].concat(tx(SC.normal[i]))))&&C.dating.length===1&&J(tx(C.dating[0]))===J([END].concat(tx(SC.dating[0])))&&Object.keys(C).length===3,J([tx(C.first),C.normal.map(tx),C.dating.map(tx)]));
    const ss=NOW.loc.D14.lines[YT].hotspots['D14.sunset'].normal;
    check('2. D14.sunset 的 normal 第三格（high）留著：「再一下就好。下去之前我們就走。」；舊句「再五分鐘。天黑就走。」不在',ss.length===3&&ss[2].tier==='high'&&ss[2].lines[0].text==='再一下就好。下去之前我們就走。'&&!J(NOW.loc.D14.lines[YT]).includes('天黑就走'),J(ss));
    const fl=String((REC.D14._meta||{}).for_LAWWW||''); check('2. 這兩件事在改稿紀錄 date_rewrite/yt_D14.json 的 for_LAWWW 裡；其他 32 個地點沒有 for_LAWWW',fl.includes('前面加一句「'+END+'」')&&fl.includes('再一下就好。下去之前我們就走。')&&LOCS.filter(k=>(REC[k]._meta||{}).for_LAWWW).length===1);
    let ch=0; const miss=[]; for(const k of LOCS){ const s=of(SRC[k],k,YT), o=of(OLDSRC[k],k,YT), g=of(NOW.loc[k],k,YT); for(const p of new Set(Object.keys(s).concat(Object.keys(o)))) if(s[p]!==o[p]){ ch++; if(g[p]!==s[p]&&!(k==='D14'&&D14C(p))) miss.push(k+' '+p); } }
    check('2. 源稿和上一版 '+PREV+' 不同的語彤格子（950 格，含先對齊成遊戲當時的字的）每一格都照稿',ch===950&&miss.length===0,J([ch,miss.slice(0,4)]));
    const cells=(x,o)=>{ if(Array.isArray(x)) x.forEach(v=>cells(v,o)); else if(x&&typeof x==='object') for(const k in x){ if((k==='text'||k==='t')&&typeof x[k]==='string') o.push(x[k]); else cells(x[k],o); } return o; };
    let tot=0, nn=0, pos=0; const lost=[];
    for(const k of LOCS){ const r=REC[k][k], c=cells(SRC[k].lines[YT],[]), g=new Set(Object.values(of(NOW.loc[k],k,YT)).filter(v=>typeof v==='string')); tot+=r.length;
      r.forEach((t,i)=>{ if(t==null) return; nn++; if(!g.has(t)) lost.push(k+'#'+i+'：'+t); }); if(r.length===c.length){ pos++; r.forEach((t,i)=>{ if(t!=null&&t!==c[i]) lost.push(k+'#'+i+' 位置不對：'+t); }); } }
    check('2. 改稿紀錄 yt_D01～D33.json：1,764 格裡改了 902 格，每一句都在遊戲裡她那個地點的格子（29 個地點格數相同的逐格對位置）',tot===1764&&nn===902&&pos===29&&lost.length===0,J([tot,nn,pos,lost.slice(0,4)])); });

  await sec(3,async()=>{ if(!WAS) return;
    const strip=D=>{ const x=JSON.parse(J(D)); delete x.source; if(x.lines) delete x.lines[YT]; for(const k in x.loc) for(const part of ['lines','likes','dislikeLine']) if(x.loc[k][part]) delete x.loc[k][part][YT]; return x; };
    const a=leaves(strip(WAS),'',{}), b=leaves(strip(NOW),'',{}), ka=Object.keys(a), diff=ka.filter(p=>a[p]!==b[p]).concat(Object.keys(b).filter(p=>!(p in a)));
    check('3. 別人的格子（含學姊、沛珊）、預約句、交通偏好、互動點（'+ka.length+' 格）和重匯以前（'+BASE+'）完全一樣',ka.length>26000&&diff.length===0,J(diff.slice(0,6).map(p=>p+'：'+a[p]+' → '+b[p])));
    for(const [who,nm] of [[SIS,'學姊'],[PS,'沛珊']]){ let n=0; const d=[]; for(const k of LOCS){ const g=of(NOW.loc[k],k,who), w=of(WAS.loc[k],k,who); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))){ n++; if(g[p]!==w[p]) d.push(k+' '+p); } }
      check('3. '+nm+' 33 個地點 '+n+' 格和重匯以前零差異；不分地點的短句也一樣',n>4000&&d.length===0&&J(NOW.lines[who])===J(WAS.lines[who]),J(d.slice(0,4))); }
    if(haveSrc){ const bad=[]; let wb=0; for(const k of LOCS){ const s=of(SRC[k],k,SIS), o=of(OLDSRC[k],k,SIS), g=of(NOW.loc[k],k,SIS); for(const p in s){ if(s[p]!==o[p]){ wb++; if(g[p]!==s[p]) bad.push(k+' '+p); } } }
      check('3. 學姊寫回源稿的 34 格（源稿和 '+PREV+' 不同的）＝遊戲裡原本就是這個字',wb===34&&bad.length===0,J([wb,bad.slice(0,4)]));
      const other=[]; for(const k of LOCS){ const a=leaves(SRC[k],'',{}), b=leaves(OLDSRC[k],'',{}); for(const p of new Set(Object.keys(a).concat(Object.keys(b)))) if(a[p]!==b[p]&&!/^\/(lines|likes|dislikeLine)\/(heroine_03|heroine_05)\//.test(p)) other.push(k+p); }
      check('3. 源稿 '+SHA+' 和 '+PREV+' 逐格比：語彤、學姊以外的人 0 格不同',other.length===0,J(other.slice(0,4))); }
    let d3=0; for(const k of LOCS){ const g=of(NOW.loc[k],k,YT), w=of(WAS.loc[k],k,YT); for(const p of new Set(Object.keys(g).concat(Object.keys(w)))) if(g[p]!==w[p]) d3++; }
    check('3. 語彤的格子和重匯以前比：900 格不同（含 D14 夕陽多留的那一格 3 項）',d3===900,String(d3)); });

  await sec(4,async()=>{ const LI=DATE.LINE_IF[YT]||{}, acc=NOW.lines[YT].accept.map(x=>[].concat(x).join('')), en=DATE.EXTRA_LINES[YT].enough;
    check('4. S.LINE_IF 語彤兩組還對得上：accept 認「沒有班」（「可以。那天我沒有班。」還在）、enough 認「秀琴姨煮了飯」（AA_767 的新句「差不多了。秀琴姨煮了飯，我想回去吃熱的。」留著這幾個字）',typeof LI.accept==='function'&&typeof LI.enough==='function'&&acc.filter(x=>/公休|沒有班/.test(x)).length===1&&acc.includes('可以。那天我沒有班。')&&en.filter(x=>/幫阿姨|秀琴姨煮了飯/.test(x)).length===1&&en[0]==='差不多了。秀琴姨煮了飯，我想回去吃熱的。',J([acc,en]));
    const src=read('src/date3d.js');
    check('4. S.LINE_IF 的條件式沒動（/公休|沒有班/、/幫阿姨|秀琴姨煮了飯/）',src.includes("S.LINE_IF={heroine_03:{accept:(G,t,x)=>!/公休|沒有班/.test(String(x))||(/公休/.test(String(x))?noodleOff(t.day):!ytTea(G,t.day)),enough:(G,t,x)=>!/幫阿姨|秀琴姨煮了飯/.test(String(x))||ytHere(G,t.day!=null?t.day:G.day)},"));
    check('4. ARRIVE_VAR、REMEMBER_IF、PICK_FLAG 都沒有語彤的項目（沒有拿她的句子當 from／key）',![].concat(DATE.ARRIVE_VAR,DATE.REMEMBER_IF,DATE.PICK_FLAG).some(x=>x.who===YT));
    const bad=[]; for(const v of DATE.ARRIVE_VAR){ const F=(((NOW.loc[v.loc]||{}).lines||{})[v.who]||{}).arrive, T=F&&F.first?F.first.lines.map(x=>x.text):[]; if(!v.from.every(t=>T.includes(t))) bad.push('ARRIVE_VAR '+v.loc+' '+v.who); }
    for(const r of DATE.PICK_FLAG){ const h=((((NOW.loc[r.loc]||{}).lines||{})[r.who]||{}).hotspots||{})[r.pid], c=h&&h.first&&h.first.choice||[]; if(!c.some(x=>x.t===r.t)) bad.push('PICK_FLAG '+r.loc+' '+r.who+' '+r.t); }
    for(const r of DATE.REMEMBER_IF){ const h=((((NOW.loc[r.loc]||{}).lines||{})[r.who]||{}).hotspots||{})[r.pid]; if(!(h&&h.remember&&h.remember.lines&&h.remember.lines.length)) bad.push('REMEMBER_IF '+r.loc+' '+r.who+' '+r.pid); }
    check('4. 原本的 ARRIVE_VAR（沛珊 D28、可昕 D32）、PICK_FLAG、REMEMBER_IF（子晴 D06／D15、沛珊 D05）重匯以後都還對得上資料',DATE.ARRIVE_VAR.length===2&&DATE.PICK_FLAG.length===3&&DATE.REMEMBER_IF.length===3&&bad.length===0,J(bad));
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
    check('6. lines.heroine_03 六格：move 第一句「好，改那天。」、transport「好，坐你的車。」「我平常都坐捷運，在車上要做什麼，我不太知道。」、cancel「沒關係。下次再約。」、flaked「那天我等了一下。」「班也請了。下次不能來，先跟我說。」',LY.move[0]==='好，改那天。'&&J(LY.transport)===J([['好，坐你的車。','我平常都坐捷運，在車上要做什麼，我不太知道。']])&&J(LY.cancel)===J(['沒關係。下次再約。'])&&J(LY.flaked)===J([['那天我等了一下。','班也請了。下次不能來，先跟我說。']]),J(LY));
    check('6. accept（兩句）、acceptDating、move 第二句、move3 不改',J(LY.accept)===J([['好。','我跟蘇姨說那天不排班。'],'可以。那天我沒有班。'])&&J(LY.acceptDating)===J(['好。蘇姨說，那天她自己顧。'])&&LY.move[1]==='可以。我再跟蘇姨講一次。'&&J(LY.move3)===J([['第三次了。','蘇姨問我到底哪一天。我說我也不知道。']]),J(LY));
    const EX=DATE.EXTRA_LINES[YT];
    check('6. date3d.js S.EXTRA_LINES 語彤：depart 第一句照舊「我到了。」、第二、三句、enough 兩句、leaveEarly、noPair 照稿',J(EX)===J({depart:['我到了。','出門了。傘有帶，這次有。','快到了。你先找地方站，我看得到你。'],enough:['差不多了。秀琴姨煮了飯，我想回去吃熱的。','我走不動了。到這裡就好。'],leaveEarly:['就這樣？好。那我回去了。'],noPair:['我不用。我幫你拍，你站過去。']}),J(EX));
    check('6. date3d.js S.MORNING 語彤：「早。旅館的早餐我看過了，有稀飯。我在樓下。」',DATE.MORNING[YT]==='早。旅館的早餐我看過了，有稀飯。我在樓下。',DATE.MORNING[YT]);
    const raw=show(SHA,SP+'AA_767_yt_date_common.json'), A=raw?JSON.parse(raw):null, strip=t=>t.replace(/\/\*[\s\S]*?\*\//g,''), lit=t=>strip(t).match(/'(?:[^'\\\n]|\\.)*'/g)||[];
    const code=read('src/date3d.js');
    if(A){ const get=(o,pth)=>pth.match(/\[\d+\]|[^.\[\]]+/g).reduce((x,t)=>x==null?x:x[t[0]==='['?+t.slice(1,-1):t],o);
      const r1=A.rows.filter(r=>r.file==='src/data/date_lines.js'), r2=A.rows.filter(r=>r.file==='src/date3d.js');
      check('6. 逐字：稿 13 列（date_lines.js 六列、date3d.js 七列）；date_lines.js 六列的 new 在 path 那一格',A.rows.length===13&&r1.length===6&&r2.length===7&&r1.every(r=>get(NOW,r.path)===r.new),J(r1.filter(r=>get(NOW,r.path)!==r.new).map(r=>r.path)));
      const at=r=>r.path==='S.MORNING.heroine_03'?DATE.MORNING[YT]:get(EX,r.path.replace('S.LINES heroine_03.',''));
      check('6. 逐字：date3d.js 七列的 new 在 path 那一格；每一句在程式裡（註解不算）剛好一處、old 都不在了',r2.every(r=>at(r)===r.new&&strip(code).split("'"+r.new+"'").length-1===1&&!strip(code).includes("'"+r.old+"'")),J(r2.filter(r=>at(r)!==r.new).map(r=>r.path)));
      if(WAS){ const a=leaves(WAS.lines[YT],'',{}), b=leaves(LY,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]).sort();
        check('6. lines.heroine_03 和重匯以前比：格子一樣多、只有這六格不同（「嗯。」整個檔兩百多處，只換她放鴿子那一格）',J(Object.keys(a))===J(Object.keys(b))&&J(d)===J(['/cancel/0','/flaked/0/0','/flaked/0/1','/move/0','/transport/0/0','/transport/0/1'])&&r1.every(r=>get(WAS,r.path)===r.old),J(d));
        const cnt=D=>{ const x=JSON.parse(J(D)); delete x.lines[YT]; for(const k in x.loc) for(const part of ['lines','dislikeLine']) if(x.loc[k][part]) delete x.loc[k][part][YT]; return J(x).split('嗯。').length-1; };
        check('6. 「嗯。」在別人的格子裡的次數和重匯以前一樣（'+cnt(NOW)+' 處；沒有整檔取代）',cnt(NOW)===cnt(WAS)&&cnt(NOW)>50,J([cnt(NOW),cnt(WAS)])); }
      const ob=show(BASE,'src/date3d.js'); if(ob){ const O=lit(ob), L=lit(code), d=O.map((t,i)=>[t,L[i]]).filter(([x,y])=>x!==y), set=new Set(r2.map(r=>"'"+r.old+"'→'"+r.new+"'"));
        check('6. date3d.js 的字串和重匯以前（'+BASE+'）逐個比：一樣多，不一樣的剛好是稿上這七列（條件、以安的四格、別人早上那一句沒動）',O.length===L.length&&d.length===7&&d.every(([x,y])=>set.has(x+'→'+y)),J(d.filter(([x,y])=>!set.has(x+'→'+y)).slice(0,4))); } }
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
    const ow=show(BASE,'src/data/date_wish.js'); if(ow){ const O=DW(ow), ids=Object.keys(O.events).filter(k=>k!==YT), a=leaves(O.events[YT],'',{}), b=leaves(ev,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]);
      check('7. 別人的心願事件（'+ids.length+' 位）和重匯以前（'+BASE+'）一樣；hold、verify.miss 照舊是空的',ids.length===6&&ids.every(k=>J(O.events[k])===J(W.events[k]))&&J(O.hold)===J(W.hold)&&W.verify.miss.length===0&&W.verify.freeVisited.length===O.verify.freeVisited.length);
      check('7. 語彤的事件和重匯以前比：格子一樣多、不一樣的 34 格都是台詞的 text（選項的字 t、條件、旗標、時間、結構沒動）',J(Object.keys(a))===J(Object.keys(b))&&d.length===34&&d.every(k=>/\/text$/.test(k))&&(!A||A.rows.every(r=>get(O.events[YT],r.path)===r.old)),J(d.filter(k=>!/\/text$/.test(k)))); }
    const wcode=read('src/wish3d.js'); check('7. src/wish3d.js 沒有寫死語彤心願事件的句子（讀資料檔；timeline replace 用資料裡的 key）',!/不用趕回去|跟小時候一樣|我們拍一張/.test(wcode)); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
