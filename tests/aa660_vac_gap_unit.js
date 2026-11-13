// AA_660 交換路線在臺灣的空白日：第一批（企劃線 0777c92ac＝090981ebe＋AA-C 回 LAWWW-C 的五件；任務 AA660-VAC-GAP-1104；src/aa660_3d.js）——不需要瀏覽器。用法：node tests/aa660_vac_gap_unit.js
//   0 載入、index.html 的順序、白名單、每一句都在稿裡（一字不差，說的人也對；芯慈版的換句表逐列對）
//   G1-1 美國 7/27 21:00 家人群組（兩個回法、姊姊兩則、爸爸「？」；兩小時沒回照樣傳）　G1-2 7/29 摘要日　G1-3 7/30 群組＋7/31 19:00 餞行（到場的人照那天在臺北、認識的；拍照清單 US_PHOTO_LIST；出發最早 18:30）
//     G1-3 Alison 不在（沒認識、那天不在臺北）＝芯慈拿清單（芯慈版燒臘；US_PHOTO_LIST＋US_PHOTO_LIST_XC；稿上的額度註記不演）
//   G1-4 8/1 22:00 家人群組　G1-5 8/5 臺灣 21:00＝當地 09:00 松鼠的照片＋Alison 兩則（要有清單；芯慈給的＝芯慈兩則）　G2-1 12/23 10:30 家人群組（G21_ON 預設開；媽媽「接到了」四則，沒有你（自動））
//   G2-2 12/23 21:00 群組（Alison 的清單／芯慈的清單／沒有清單／沒有清單、也沒認識 Alison）　G2-3 12/24 Kevin 第一句
//   G3 12/25、1/13 摘要日　G4 日本路線 3/23 阿哲第一句　G5-1 8/5 落地的家人群組（JP_RETURN_H）　G5-2 8/5 21:00 群組兩版　G6 8/12（接在 s_0812 後面）、8/22、8/29 摘要日
//   臺灣路線（和另一條國外路線）都不出現；舊存檔過了日期不補。
//   第 4 節三件：4-1 美國路線 12/21 人在美國，家人群組週四那則（「連假回來嗎」）不發；4-2 她主動約你的那幾則（INV.offer）訊息只有 who、沒有 th／from，遊戲照 who 放進她的私訊（標題是她）；
//   4-3 子晴那句的店名換 2:30 AM；AA_494 0777c92ac 子晴交往中、可昕兩句也換（讀稿的換字表 aa655_fix.json pairs）。
// 第一版　修改前（開發分支 55f685380 的程式＋這支測試）：FAILED 41——第 0 節（模組、index.html、白名單、台詞表）、G1～G6 每一項「有出現」的檢查、4-3；
//   修改前後都 PASS 的 12 項：讀稿兩項、「不出現／舊存檔不補」那幾項、4-1 兩項、4-2（後三項是查證，沒改程式）。修改後 ALL PASS（53 項）。
// 第二版（0777c92ac）　修改前（開發分支 71281be8e 的 src＋這支測試；白名單、換字表已經是新的）：FAILED 17——第 0 節兩項（台詞表、src 的舊句）、G1-1 兩項、G3-2、
//   G1-3 芯慈版三項、G1-5 芯慈版、G2-1 兩項、G2-2 五項、4-3 店名；修改前後都 PASS 的 49 項：讀稿、白名單、換字表（不看 src）、沒改的 G1～G6 與第 4 節、G2-1 開關關掉。修改後 ALL PASS（66 項）。
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const loadErr=[];
const loadG=f=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
const FILES=['src/exchange3d.js','src/holff3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js',
  'src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js','src/data/us_layouts.js','src/data/r2y4a_events.js','src/r2y4a3d.js',
  'src/data/us_life_events.js','src/us_life3d.js','src/data/heard_lines.js','src/heard3d.js','src/data/heroine_asks.js','src/aa660_3d.js'];   /* 照 index.html 的順序 */
for(const f of FILES){ if(!fs.existsSync(path.join(H.ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ loadG(f); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,160)); } }
const A=()=>typeof AA660!=='undefined'?AA660:null;
const git=(ref,p)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+ref+':"'+p+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const SHA='de9628d67', A660='docs/story_planning/AA_660_交換路線_出發前回國後的空白_缺口表與第一批稿.md';
const doc=git(SHA,A660);
const D=H.D, T=(d,h)=>d*24+h, wd=d=>CALENDAR.dateOf(d).wd%7;
const at=(k,h)=>{ const d=typeof k==='number'?k:D(k); H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); E.hour=h; };
const phone=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const runAt=(k,h)=>{ at(k,h); phone(); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const tx=L=>L.map(m=>m.text), fr=L=>L.map(m=>m.from);
const US0={EXCHANGE_ROUTE:'US',EXCH_RULE:1}, JP0={EXCHANGE_ROUTE:'JP',EXCH_RULE:1}, TW0={EXCHANGE_ROUTE:'TW',EXCH_RULE:1};
const USA=f=>Object.assign({},US0,{US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together'},f||{});
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(k,h,zone||'dorm',flags); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.outings)) G.outings=[]; if(!G.acts) G.acts={att:{}}; G.visited=G.visited||{}; HOME.rec(G); return G; };
const atHome=G=>{ const Hm=HOME.rec(G); Hm.at=true; Hm.day=G.day; Hm.lbreak=HOME.lawBreak(G)?HOME.lawBreak(G).key:null; Hm.brk=Hm.lbreak; Hm.bskip=Hm.lbreak?{key:Hm.lbreak,n:0,last:-1}:null; };
const friends=(...ids)=>{ for(const id of ids) H.FRIEND(id); };
const NG=()=>PHONE.join(H.G,'noodle_team','桌遊團');
const NM={yu:'Alison',classmate_mingxuan:'明軒',classmate_xinci:'芯慈',zhe:'阿哲',heroine_01:'以安',mom:'媽媽',dad:'爸爸',sister:'姊姊',player:'你（自動）'};
(async()=>{
  /* ================= 0 ================= */
  check('0. AA_660（企劃線 0777c92ac）讀得到；090981ebe 的「早上九點半。」照舊在、「早上七點多。」不在；0777c92ac 的五件都在（「不用載，我自己去。」、G2-1 媽媽「接到了」、「見面再給你們看。」、1/13 寒假那句、芯慈拿清單），換掉的舊句不在',
    doc.length>3000&&doc.includes('「早上九點半。」→ 媽媽：「那六點要出門」')&&!doc.includes('早上七點多')
    &&doc.includes('「不用載，我自己去。」→ 媽媽：「我要去。我要看你進去。」')&&!doc.includes('「我自己搭機捷。」→')&&doc.includes('- 媽媽：接到了')&&!doc.includes('晚上回來吃 我燉了蘿蔔排骨湯')
    &&doc.includes('「見面再給你們看。」→ Alison：「好啦 那也算」')&&!doc.includes('回去當面給你們看')&&doc.includes('（寒假的總圖人很少。')&&!doc.includes('臺灣這學期的課你都沒修')
    &&doc.includes('清單由芯慈拿出來'),doc?'':'git fetch origin claude/magical-albattani-bk7b4n');
  check('0. 模組都載得到（src/aa660_3d.js：AA660）',!loadErr.length&&!!A()&&!!A().L&&typeof A().phone==='function',J(loadErr));
  const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), sc=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]), ia=sc.indexOf('src/aa660_3d.js');
  check('0. index.html：aa660_3d.js 在 outings3d、home3d、story3d、holff3d、y34b3d、jp3d、r2y4a3d、us_life3d、heard3d 之後，data/bbpack_events.js 前面',
    ia>0&&['src/outings3d.js','src/home3d.js','src/story3d.js','src/holff3d.js','src/y34b3d.js','src/jp3d.js','src/r2y4a3d.js','src/us_life3d.js','src/heard3d.js'].every(f=>sc.indexOf(f)>=0&&sc.indexOf(f)<ia)&&ia<sc.indexOf('src/data/bbpack_events.js'),J(ia));
  { let W=null; try{ W=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')); }catch(e){}
    const e=W&&W.files&&W.files.find(x=>x.path===A660);
    const hs=e&&Array.isArray(e.history)?e.history.map(h=>h.sha):[];
    check('0. 劇情匯入白名單：AA_660＝0777c92ac、approved、approvedBy「AA-C（D109 定稿）」；舊的 d88f39e3f、090981ebe 在 history',!!e&&e.sha===SHA&&e.status==='approved'&&e.approvedBy==='AA-C（D109 定稿）'&&hs.includes('d88f39e3f')&&hs.includes('090981ebe')&&!hs.includes(SHA),J(e&&{sha:e.sha,hs})); }
  /* 稿上的句子（照 AA_660 第 2 節抄；下面先逐句對稿，再和模組的 AA660.L 比：模組沒有也照樣跑後面每一項）*/
  const L={
    g11:{ask:[['mom','八月二號幾點的飛機']],opts:[{t:'早上九點半。',say:[['mom','那六點要出門'],['mom','我載你']]},{t:'不用載，我自己去。',say:[['mom','我要去。我要看你進去。']]}],
      after:[['sister','記得帶轉接頭'],['sister','……不用 美國插座跟我們一樣 我剛查了'],['dad','？']]},
    g12:'（宿舍搬空了。家裡你的房間多了幾個紙箱，最上面那個用奇異筆寫著「美國」。）',
    g13dm:[['classmate_mingxuan','八月二號走？'],['classmate_mingxuan','到了拍一張你自己。不要只拍風景。']],
    g13grp:{yu:[['yu','禮拜一幫祐廷餞行'],['yu','七點 燒臘店']],mx0:'禮拜一幫祐廷餞行',zhe:['zhe','我在高雄 幫我多吃一盤'],mx:['classmate_mingxuan','會到。']},
    g13:{open:'（燒臘店最裡面那張長桌。Alison 把一張折成四折的紙推到你面前。）',yu:'這是我們列的。你到了以後要拍給我們看的東西。',
      list:'（紙上寫著：校園的松鼠、超市最大包的洋芋片、教室、你的房間。最後一行是明軒的字：「你自己」。）',mx:'最後那個是我寫的。……拍你自己，不要只拍風景。',
      xc:'時差幾個小時？',opts:['「夏天差十二個小時。」','「我也還沒查。」'],xcA:'那你睡覺的時候我們剛起床。……訊息不用馬上回。',xcB:'十二個小時。我剛剛查了。',
      close:'（吃完，Alison 把那張紙折好，塞進你的護照套裡。）'},
    g13xc:{open:'（燒臘店最裡面那張長桌。芯慈把一張折成四折的紙推到你面前。）',xc:'這是我們列的。你到了以後要拍給我們看的東西。',
      list:'（紙上用三種顏色的筆寫著：校園的松鼠、超市最大包的洋芋片、教室、你的房間。最後一行是明軒的字：「你自己」。）',
      close:'（吃完，芯慈把那張紙折好，塞進你的護照套裡。）'},
    g14:[['mom','明天五點我叫你'],['dad','到了在群組說一聲'],['sister','一路平安']],
    g15:{me:'📷（校園的松鼠，站在垃圾桶的蓋子上）',yu:[['yu','打勾！！'],['yu','剩下三個']],xc:[['classmate_xinci','打勾。'],['classmate_xinci','剩下三個']]},
    g21:[['mom','接到了'],['mom','📷（餐桌上一鍋蘿蔔排骨湯，旁邊一碗已經盛好了）'],['dad','平安就好'],['sister','先讓他睡']],
    g22:{back:['yu','回來了？？'],list:[['yu','清單最後一項 你一直沒拍'],['classmate_mingxuan','現在拍也可以。']],
      opts:[{t:'（傳一張自己的照片：背景是機場的行李轉盤，你看起來很睏。）',say:[['classmate_mingxuan','好。這張可以。'],['yu','打勾！！清單完成']]},{t:'見面再給你們看。',say:[['yu','好啦 那也算']]}],
      noList:['yu','桌遊夜幫你留位子'],
      noListMx:[['classmate_mingxuan','回來了？'],['classmate_mingxuan','下次桌遊夜，位子留給你。']],
      xc:{back:['classmate_mingxuan','回來了？'],list:[['classmate_xinci','清單最後一項，你一直沒拍。'],['classmate_mingxuan','現在拍也可以。']],
        opts:[{t:'（傳一張自己的照片：背景是機場的行李轉盤，你看起來很睏。）',say:[['classmate_mingxuan','好。這張可以。'],['classmate_xinci','清單完成。']]},{t:'見面再給你們看。',say:[['classmate_xinci','好。那也算。']]}]}},
    g23:'學姊跟學弟都回來了',
    g31:'（凌晨四點就醒了。外面還是黑的，你躺著聽樓下的機車一台一台騎過去。）',
    g32:'（寒假的總圖人很少。你把美國的筆記重新整理一遍，有些字你一時想不起中文怎麼說。）',
    g4:'明天 幫以安跟祐廷餞行',
    g51:{me:'到了',fam:[['mom','好'],['mom','冰箱有切好的芒果'],['dad','平安就好']]},
    g52:{both:['yu','你們兩個回來了？？'],an:[['heroine_01','回來了。'],['heroine_01','排隊入境的時候，祐廷站著睡著了。']],
      opts:[{t:'那叫閉眼睛。',say:[['heroine_01','閉到輪到我們。']]},{t:'……妳也有。',say:[['heroine_01','我是在想事情。']]}],only:['yu','回來了？？']},
    g6:{'2028-08-12':'（你在超商結帳的時候，差一點用日文說了謝謝。店員看了你一眼。）','2028-08-22':'（你把日本帶回來的筆記一本一本貼上標籤：比較行政法、日文、研討課。）',
      '2028-08-29':'（晚上的溫州街有一點涼了。你走到巷口買了一杯冰的，站在路燈下面喝完。）'} };
  check('0. de9628d67 的兩點在稿上：沒有清單、也沒認識 Alison＝明軒「回來了？」「下次桌遊夜，位子留給你。」；只認識明軒＝7/31 21:00 明軒私訊「八月二號走？」「到了拍一張你自己。不要只拍風景。」',doc.includes('G2-2 明軒兩則：「回來了？」／「下次桌遊夜，位子留給你。」')&&doc.includes('明軒私訊兩則：「八月二號走？」／「到了拍一張你自己。不要只拍風景。」'));
  check('0. 模組的台詞表（AA660.L）和稿上抄的一樣',!!A()&&J(A().L)===J(L));
  { const all=[], bad=[]; const pl=(w,t)=>all.push([w,t]);
    for(const x of L.g11.ask) pl(...x); for(const o of L.g11.opts){ all.push([null,'「'+o.t+'」']); for(const x of o.say) pl(...x); } for(const x of L.g11.after) pl(...x);
    all.push([null,L.g12]); for(const x of L.g13grp.yu) pl(...x); pl('classmate_mingxuan',L.g13grp.mx0); pl('classmate_mingxuan',L.g13grp.yu[1][1]); pl(...L.g13grp.zhe); pl(...L.g13grp.mx);
    const g=L.g13; all.push([null,g.open],[null,g.list],[null,g.close]); pl('yu',g.yu); pl('classmate_mingxuan',g.mx); pl('classmate_xinci',g.xc); for(const o of g.opts) all.push([null,o]); pl('classmate_xinci',g.xcA); pl('classmate_xinci',g.xcB);
    const gx=L.g13xc; all.push([null,gx.open],[null,gx.list],[null,gx.close]); pl('classmate_xinci',gx.xc);
    for(const x of L.g14) pl(...x); pl('player',L.g15.me); for(const x of L.g15.yu) pl(...x);
    for(const x of L.g21) pl(...x);
    pl(...L.g22.back); for(const x of L.g22.list) pl(...x); for(const o of L.g22.opts){ all.push([null,'「'+o.t+'」']); for(const x of o.say) pl(...x); } pl(...L.g22.noList);
    all.push([null,'「'+L.g23+'」'],[null,L.g31],[null,L.g32]); pl('zhe',L.g4);
    pl('player',L.g51.me); for(const x of L.g51.fam) pl(...x);
    pl(...L.g52.both); for(const x of L.g52.an) pl(...x); for(const o of L.g52.opts){ all.push([null,'「'+o.t+'」']); for(const x of o.say) pl(...x); } all.push([null,'只留 Alison：「'+L.g52.only[1]+'」']);
    for(const k in L.g6) all.push([null,L.g6[k]]);
    for(const [w,t] of all){ const ok=w?(doc.includes(NM[w]+'：'+t)||doc.includes(NM[w]+'：「'+t+'」')):doc.includes(t); if(!ok) bad.push((w?NM[w]+'：':'')+t); }
    check('0. 每一句都在 AA_660 第 2 節裡（一字不差；說的人也對，'+all.length+' 句）',!!doc&&!bad.length&&all.length>=66,J(bad));
    /* 照段落對：G2-1 那一段只有這四則（照順序、說的人也對；沒有你（自動））；芯慈版燒臘那四句照順序在「Alison 不在」那一段 */
    const sec=(a,b)=>{ const i=doc.indexOf(a), j=i<0?-1:doc.indexOf(b,i+a.length); return i>=0&&j>i?doc.slice(i,j):''; };
    const s21=sec('**G2-1','**G2-2'), d21=[...s21.matchAll(/^- (媽媽|爸爸|姊姊|你（自動）)：(.+)$/mg)].map(m=>[m[1],m[2]]);
    check('0. G2-1 那一段：媽媽「接到了」→ 媽媽「📷（餐桌上……）」→ 爸爸「平安就好」→ 姊姊「先讓他睡」，沒有你（自動）（和 AA660.L.g21 一樣）',J(d21)===J(L.g21.map(([w,t])=>[NM[w],t])),J(d21));
    const sXC=sec('**Alison 不在','**G1-4'), ix=[gx.open,'芯慈：'+gx.xc,gx.list,'明軒那句、芯慈時差那段照上面。',gx.close].map(t=>sXC.indexOf(t));
    check('0. 「Alison 不在」那一段：芯慈版燒臘照順序（開頭旁白 → 芯慈 → 清單 →「明軒那句、芯慈時差那段照上面」→ 收尾旁白）',ix.every((v,k)=>v>=0&&(k===0||v>ix[k-1])),J(ix));
    /* 換句表（稿 G1-3 下面）：Alison 的句子 → 芯慈；G2-2 第一句 → 明軒。芯慈版＝Alison 版照表換，表上每一列都用到 */
    const SW={}, used=new Set(); for(const m of sXC.matchAll(/^\s*- 「([^」]+)」→「([^」]+)」$/mg)) SW[m[1]]=m[2]; for(const m of sXC.matchAll(/^\s*- 「([^」]+)」照用$/mg)) SW[m[1]]=m[1];
    const first=sXC.match(/G2-2 第一句「([^」]+)」→ 明軒：「([^」]+)」/);
    const sw=([w,t])=>{ if(w!=='yu') return [w,t]; used.add(t); return t in SW?['classmate_xinci',SW[t]]:['?',t]; };
    const want15=L.g15.yu.map(sw), want22={back:first&&first[1]===L.g22.back[1]?['classmate_mingxuan',first[2]]:null,list:L.g22.list.map(sw),opts:L.g22.opts.map(o=>({t:o.t,say:o.say.map(sw)}))};
    check('0. 芯慈版（G1-5、G2-2）＝Alison 版照稿上的換句表換（'+Object.keys(SW).length+' 列＋G2-2 第一句明軒「回來了？」；每一列都用到）',
      Object.keys(SW).length===5&&!!first&&J(L.g15.xc)===J(want15)&&J(L.g22.xc)===J(want22)&&Object.keys(SW).every(k=>used.has(k)),J({SW,first:first&&first.slice(1),want15,want22}));
    check('0. 稿上清單旁白後面的「（芯慈的顏色筆，這學期用這一次）」是口頭禪額度註記（00_台詞寫作規則 第 6 節：芯慈「計畫表、顏色筆、做表」每學期 1），不在台詞表裡',
      sXC.includes(gx.list+'（芯慈的顏色筆，這學期用這一次）')&&!J(L).includes('這學期用這一次')&&!J(L).includes('顏色筆')&&/\| 芯慈 \| 計畫表、顏色筆、做表 \| 每學期 1 \|/.test(git(SHA,'docs/story_planning/00_台詞寫作規則.md')));
    let src=''; try{ src=fs.readFileSync(path.join(H.ROOT,'src/aa660_3d.js'),'utf8'); }catch(e){}
    check('0. G1-1 用更正後的句子（「早上九點半。」「那六點要出門」；「不用載，我自己去。」「我要去。我要看你進去。」），舊句（「早上七點多。」「那五點半要出門」「我自己搭機捷。」「那我五點起來煮早餐」）不在程式裡；G2-1 不再用落地時間、沒有「到了」那一則',
      !!src&&src.includes("t:'早上九點半。',say:[['mom','那六點要出門'],['mom','我載你']]")&&src.includes("t:'不用載，我自己去。',say:[['mom','我要去。我要看你進去。']]")&&!/早上七點多|五點半要出門|我自己搭機捷|那我五點起來煮早餐|晚上回來吃 我燉了|LAND_US|aa660_us_back_me/.test(src)); }
  const G21=on=>{ if(A()) A().G21_ON=on; };

  /* ================= G1-1 美國 7/27 21:00 家人群組 ================= */
  { const go=k=>{ fresh('2028-07-27',20.5,'dorm',US0); atHome(H.G); runAt('2028-07-27',20.95); const n0=byTag('aa660_us_flight').length; runAt('2028-07-27',21); const M=byTag('aa660_us_flight');
      let out=null; if(k!=null){ const r=PHONE.answer(H.G,'aa660_us_flight',k); out=r?r.out:null; } return {n0,M,out}; };
    const a=go(0);
    check('G1-1 7/27 20:57 還沒有；21:00 家人群組 媽媽「八月二號幾點的飛機」（兩個回法：「早上九點半。」「不用載，我自己去。」）',a.n0===0&&J(tx(a.M))===J(['八月二號幾點的飛機'])&&J(fr(a.M))===J(['mom'])&&a.M[0].th==='g:home'&&!!a.M[0].ask&&J(a.M[0].ask.opts.map(o=>o.t))===J(['早上九點半。','不用載，我自己去。'])&&PHONE.inGroup(H.G,'home'),J(a.M[0]&&a.M[0].ask&&a.M[0].ask.opts.map(o=>o.t)));
    check('G1-1 回「早上九點半。」：媽媽「那六點要出門」「我載你」→ 姊姊兩則、爸爸「？」（照稿的順序）',!!a.out&&J(tx(a.out))===J(['早上九點半。','那六點要出門','我載你','記得帶轉接頭','……不用 美國插座跟我們一樣 我剛查了','？'])&&J(fr(a.out))===J(['player','mom','mom','sister','sister','dad']),J(a.out&&tx(a.out)));
    const b=go(1);
    check('G1-1 回「不用載，我自己去。」：媽媽「我要去。我要看你進去。」（一則）→ 姊姊兩則、爸爸「？」',!!b.out&&J(tx(b.out))===J(['不用載，我自己去。','我要去。我要看你進去。','記得帶轉接頭','……不用 美國插座跟我們一樣 我剛查了','？'])&&J(fr(b.out))===J(['player','mom','sister','sister','dad']),J(b.out&&tx(b.out)));
    go(null); runAt('2028-07-27',23); const s0=byTag('aa660_us_flight_sis').length; runAt('2028-07-27',23.1); const s1=byTag('aa660_us_flight_sis');
    check('G1-1 兩個小時沒回：23:00 那一刻還可以回、還不傳；過了 23:00（回不了了）照樣傳姊姊兩則、爸爸「？」（23:00 剛過；quiet＝快轉不停，同寒暑假週四爸爸的「？」）',s0===0&&J(tx(s1))===J(['記得帶轉接頭','……不用 美國插座跟我們一樣 我剛查了','？'])&&s1.every(m=>m.day===D('2028-07-27')&&m.h>=23&&m.h<23.3&&m.quiet===true)&&PHONE.answer(H.G,'aa660_us_flight',0)==null,J(s1.map(m=>[m.text,m.h])));
    const nope=[]; for(const fl of [TW0,JP0,{}]){ fresh('2028-07-27',20.5,'dorm',fl); runAt('2028-07-27',21.5); if(byTag('aa660_us_flight').length) nope.push(J(fl)); }
    fresh('2028-07-29',10,'dorm',US0); runAt('2028-07-29',10.5); const late=byTag('aa660_us_flight').length;
    check('G1-1 臺灣路線、日本路線、還沒定都沒有；舊存檔讀進來已經是 7/29（過了一天以上）不補',!nope.length&&late===0,J({nope,late})); }

  /* ================= G1-2、G3 摘要日（HOLFF.SUMS route:'US'）================= */
  { const sumOf=(fl,k,dk)=>{ fresh(k,10,'dorm',fl); const x=HOLFF.sums(H.G).find(q=>q.day===D(dk)); return x?(typeof x.s.line==='function'?x.s.line(H.G):x.s.line):null; };
    check('G1-2 7/29（六）18:30 摘要日（美國路線）：「（宿舍搬空了。……「美國」。）」；臺灣、日本路線沒有',sumOf(US0,'2028-07-26','2028-07-29')===L.g12&&sumOf(TW0,'2028-07-26','2028-07-29')===null&&sumOf(JP0,'2028-07-26','2028-07-29')===null);
    fresh('2028-07-29',10,'dorm',US0); atHome(H.G); const nx=HOME.breakNext(H.G); const cl=HOME.cardLine(H.G,T(D('2028-07-29'),18.5));
    fresh('2028-07-29',10,'dorm',TW0); atHome(H.G); const nxTW=HOME.breakNext(H.G);
    check('G1-2 美國路線在家 7/29 10:00：快轉、睡覺停在 18:30，日期卡下面那一行；臺灣路線不停在那裡',nx===T(D('2028-07-29'),18.5)&&cl===L.g12&&nxTW!==T(D('2028-07-29'),18.5),J({nx,cl,nxTW}));
    fresh('2028-07-30',10,'dorm',US0); atHome(H.G); const st=HOLFF.stops(H.G,T(H.G.day,H.G.hour))||[];
    check('G1-2 舊存檔已經過了 7/29：不再停在 7/29',!st.includes(T(D('2028-07-29'),18.5)),J(st));
    check('G3-1 12/25（一）摘要日（美國路線）：「（凌晨四點就醒了。……）」；臺灣、日本路線沒有',sumOf(US0,'2028-12-25','2028-12-25')===L.g31&&sumOf(TW0,'2028-12-25','2028-12-25')===null&&sumOf(JP0,'2028-12-25','2028-12-25')===null);
    check('G3-2 2029-01-13（六）摘要日（美國路線）：「（寒假的總圖人很少。……）」；臺灣、日本路線沒有；1/17 原本那一句照舊',sumOf(US0,'2029-01-05','2029-01-13')===L.g32&&sumOf(TW0,'2029-01-05','2029-01-13')===null&&sumOf(JP0,'2029-01-05','2029-01-13')===null&&sumOf(US0,'2029-01-05','2029-01-17')==='（寒假。你的考試還要再一年。每天還是到總圖坐一下。）');
    fresh('2028-12-25',9,'dorm',Object.assign({},US0,{US_RETURNED:D('2028-12-23'),ROOM_Y4:D('2028-12-23')})); at('2028-12-25',9); const n25=HOME.breakNext(H.G), c25=HOME.cardLine(H.G,T(D('2028-12-25'),18.5),{dorm:true});
    check('G3-1 回來以後在宿舍（409）：12/25 早上，快轉（宿舍的床也一樣）停在 18:30、日期卡那一行',n25===T(D('2028-12-25'),18.5)&&c25===L.g31,J({n25,c25})); }

  /* ================= G1-3 7/30 群組＋7/31 餞行 ================= */
  { const setup=(fl,ids)=>{ fresh('2028-07-30',20,'dorm',fl); atHome(H.G); friends(...(ids||['yu','classmate_mingxuan','classmate_xinci','zhe'])); NG(); };
    setup(US0); runAt('2028-07-30',20.95); const g0=byTag('aa660_us_farewell_grp').length; runAt('2028-07-30',21); const G1=byTag('aa660_us_farewell_grp');
    check('G1-3 7/30 21:00 桌遊團群組：Alison「禮拜一幫祐廷餞行」「七點 燒臘店」、阿哲「我在高雄 幫我多吃一盤」、明軒「會到。」',g0===0&&J(tx(G1))===J(['禮拜一幫祐廷餞行','七點 燒臘店','我在高雄 幫我多吃一盤','會到。'])&&J(fr(G1))===J(['yu','yu','zhe','classmate_mingxuan'])&&G1.every(m=>m.th==='g:noodle_team'),J(tx(G1)));
    const q=OUT.get(H.G,'aa660_us_farewell');
    check('G1-3 排出遊：7/31（一）19:00「餞行」（公館燒臘，ev_aa660_us_farewell），出發的提示最早 18:30',!!q&&q.state==='planned'&&q.day===D('2028-07-31')&&q.h===19&&q.ev==='ev_aa660_us_farewell'&&q.title==='餞行'&&q.place==='公館燒臘'&&q.ask===T(D('2028-07-31'),18.5),J(q));
    at('2028-07-31',17); const nx=HOME.breakNext(H.G); at('2028-07-31',18.25); const d1=OUT.due(H.G); at('2028-07-31',18.5); const d2=OUT.due(H.G);
    check('G1-3 7/31 在家：快轉停在 18:30（同一天的摘要日先演）；18:15 還不問出發、18:30 問',nx===T(D('2028-07-31'),18.5)&&!d1&&!!d2&&d2.id==='aa660_us_farewell',J({nx,d1:!!d1,d2:!!d2}));
    const play=async pick=>{ const qq=OUT.get(H.G,'aa660_us_farewell'); H.said=[]; H.picks=[pick]; if(!qq) return []; await OUT.go(GM,qq,{fromHome:true}); return H.lines(); };
    const s0=await play(0);
    const want0=[L.g13.open,'Alison：'+L.g13.yu,L.g13.list,'明軒：'+L.g13.mx,'芯慈：時差幾個小時？','芯慈：那你睡覺的時候我們剛起床。……訊息不用馬上回。',L.g13.close];
    const nmOf=t=>t.replace(/^[^：]*：/,'');
    check('G1-3 餞行：開頭旁白 → Alison → 清單 → 明軒 → 芯慈問時差（選「夏天差十二個小時。」）→ 收尾旁白；記 US_PHOTO_LIST（不是芯慈給的：沒有 US_PHOTO_LIST_XC）',J(s0.map(nmOf))===J(want0.map(nmOf))&&s0.some(t=>/：這是我們列的/.test(t))&&H.G.flags.US_PHOTO_LIST===true&&H.G.flags.US_PHOTO_LIST_XC==null&&OUT.get(H.G,'aa660_us_farewell').state==='done',J(s0));
    setup(US0); runAt('2028-07-30',21); at('2028-07-31',18.5); const s1=await play(1);
    check('G1-3 選「我也還沒查。」：芯慈「十二個小時。我剛剛查了。」',s1.map(nmOf).includes(L.g13.xcB)&&!s1.map(nmOf).includes(L.g13.xcA),J(s1));
    setup(US0,['yu','classmate_mingxuan','zhe']); runAt('2028-07-30',21); at('2028-07-31',18.5); const s2=await play(0);
    check('G1-3 沒認識芯慈：她那一段不出現；其他照演、照樣記清單（Alison 給的）',!s2.some(t=>/時差/.test(t))&&s2.includes(L.g13.list)&&s2.includes(L.g13.close)&&H.G.flags.US_PHOTO_LIST===true&&H.G.flags.US_PHOTO_LIST_XC==null,J(s2));
    setup(US0,['classmate_mingxuan','classmate_xinci','zhe']); runAt('2028-07-30',21); const G2=byTag('aa660_us_farewell_grp'); at('2028-07-31',18.5); const s3=await play(0);
    const want3=[L.g13xc.open,'芯慈：'+L.g13xc.xc,L.g13xc.list,'明軒：'+L.g13.mx,'芯慈：'+L.g13.xc,'芯慈：'+L.g13.xcA,L.g13xc.close];
    check('G1-3 Alison 不在（沒認識）：明軒揪「禮拜一幫祐廷餞行」「七點 燒臘店」、阿哲那句，沒有「會到。」',
      J(tx(G2))===J(['禮拜一幫祐廷餞行','七點 燒臘店','我在高雄 幫我多吃一盤'])&&J(fr(G2))===J(['classmate_mingxuan','classmate_mingxuan','zhe']),J(tx(G2)));
    check('G1-3 Alison 不在（沒認識）、芯慈在：芯慈版燒臘——開頭旁白（芯慈推紙）→ 芯慈「這是我們列的。……」→ 清單（三種顏色的筆）→ 明軒 → 芯慈問時差 → 收尾旁白（芯慈折紙）；記 US_PHOTO_LIST＋US_PHOTO_LIST_XC；沒有 Alison、沒有額度註記',
      J(s3)===J(want3)&&!s3.some(t=>/Alison|這學期用這一次|顏色筆/.test(t))&&H.G.flags.US_PHOTO_LIST===true&&H.G.flags.US_PHOTO_LIST_XC===true&&OUT.get(H.G,'aa660_us_farewell').state==='done',J(s3));
    setup(US0,['classmate_mingxuan','zhe']); runAt('2028-07-30',21); const G5=byTag('aa660_us_farewell_grp'); runAt('2028-07-31',20.9); const dm0=byTag('aa660_us_mx_dm').length; runAt('2028-07-31',21); const DM=byTag('aa660_us_mx_dm');
    check('G1-3 只認識明軒（Alison、芯慈都不在；AA de9628d67）：餞行不排（沒有群組、沒有出遊）；7/31 21:00 明軒私訊「八月二號走？」「到了拍一張你自己。不要只拍風景。」；不記清單',
      G5.length===0&&!OUT.get(H.G,'aa660_us_farewell')&&dm0===0&&J(tx(DM))===J(['八月二號走？','到了拍一張你自己。不要只拍風景。'])&&DM.every(m=>m.who==='classmate_mingxuan'&&PHONE.th(m)==='p:classmate_mingxuan')&&!H.G.flags.US_PHOTO_LIST,J([G5.length,dm0,DM.map(m=>[m.who,m.text])]));
    setup(US0,['classmate_mingxuan','classmate_xinci','zhe']); runAt('2028-07-30',21); at('2028-07-31',18.5); const s3b=await play(1);
    check('G1-3 芯慈版選「我也還沒查。」：芯慈「十二個小時。我剛剛查了。」，其他照芯慈版',J(s3b)===J(want3.slice(0,5).concat(['芯慈：'+L.g13.xcB,L.g13xc.close]))&&H.G.flags.US_PHOTO_LIST_XC===true,J(s3b));
    { const P0=STORY.presence; let G4=[], s4=[], F4={};
      try{ STORY.presence=(id,G)=>id==='yu'?{here:false,away:'（測試：那天不在臺北）'}:P0(id,G);
        setup(US0); runAt('2028-07-30',21); G4=byTag('aa660_us_farewell_grp'); at('2028-07-31',18.5); s4=await play(0); F4=H.G.flags; } finally{ STORY.presence=P0; }
      check('G1-3 認識 Alison、但 7/31 她不在臺北（S.att 不成立）：一樣是明軒揪、芯慈拿清單（芯慈版、US_PHOTO_LIST_XC）',
        J(fr(G4))===J(['classmate_mingxuan','classmate_mingxuan','zhe'])&&J(s4)===J(want3)&&F4.US_PHOTO_LIST===true&&F4.US_PHOTO_LIST_XC===true,J({g:fr(G4),s4})); }
    const nope=[]; for(const fl of [TW0,JP0,{}]){ setup(fl); runAt('2028-07-30',21.5); if(byTag('aa660_us_farewell_grp').length||OUT.get(H.G,'aa660_us_farewell')) nope.push(J(fl)); }
    fresh('2028-07-30',20,'dorm',US0); friends('yu','classmate_mingxuan'); runAt('2028-07-30',21.5); const noGrp=byTag('aa660_us_farewell_grp').length||!!OUT.get(H.G,'aa660_us_farewell');
    setup(US0); runAt('2028-07-31',20); const late=byTag('aa660_us_farewell_grp').length+(OUT.get(H.G,'aa660_us_farewell')?1:0);
    check('G1-3 臺灣、日本路線、還沒定都沒有；不在桌遊團群組沒有；舊存檔 7/31 20:00 才讀進來（過了餞行）不補群組、不排',!nope.length&&!noGrp&&late===0,J({nope,noGrp,late})); }

  /* ================= G1-4 8/1 22:00 家人群組 ================= */
  { fresh('2028-08-01',21,'dorm',US0); atHome(H.G); runAt('2028-08-01',21.9); const n0=byTag('aa660_us_eve_fam').length; runAt('2028-08-01',22); const M=byTag('aa660_us_eve_fam');
    fresh('2028-08-01',21,'dorm',TW0); runAt('2028-08-01',22.5); const tw=byTag('aa660_us_eve_fam').length;
    fresh('2028-08-02',8,'airport_dep',Object.assign({},US0,{US_DEPARTED:true})); runAt('2028-08-02',8.5); const dep=byTag('aa660_us_eve_fam').length;
    check('G1-4 8/1 22:00 家人群組：媽媽「明天五點我叫你」、爸爸「到了在群組說一聲」、姊姊「一路平安」；臺灣路線沒有；出發了才讀進來不補',n0===0&&J(tx(M))===J(['明天五點我叫你','到了在群組說一聲','一路平安'])&&J(fr(M))===J(['mom','dad','sister'])&&M.every(m=>m.th==='g:home')&&tw===0&&dep===0,J(tx(M))); }

  /* ================= G1-5 8/5 臺灣 21:00（當地 09:00）================= */
  { const setup=(fl,ids)=>{ fresh('2028-08-05',8,'us_apartment',USA(fl)); friends(...(ids||['yu'])); NG(); };
    setup({US_PHOTO_LIST:true}); runAt('2028-08-05',8.9); const n0=byTag('aa660_us_photo1').length+byTag('aa660_us_photo1_me').length; runAt('2028-08-05',9);
    const M=byTag('aa660_us_photo1_me').concat(byTag('aa660_us_photo1'));
    check('G1-5 8/5 當地 09:00（臺灣 21:00）桌遊團群組：你（自動）「📷（校園的松鼠，站在垃圾桶的蓋子上）」→ Alison「打勾！！」「剩下三個」',STORY.tzOffset(H.G,D('2028-08-05'))===-12&&n0===0&&J(tx(M))===J([L.g15.me,'打勾！！','剩下三個'])&&J(fr(M))===J(['player','yu','yu'])&&M.every(m=>m.th==='g:noodle_team'&&m.day===D('2028-08-05')&&Math.abs(m.h-9)<0.05),J(M.map(m=>[m.from,m.text,m.h])));
    setup({US_PHOTO_LIST:true,US_PHOTO_LIST_XC:true},['classmate_xinci','classmate_mingxuan']); runAt('2028-08-05',9); const Mx=byTag('aa660_us_photo1_me').concat(byTag('aa660_us_photo1'));
    check('G1-5 清單是芯慈給的（US_PHOTO_LIST_XC）：你（自動）松鼠的照片 → 芯慈「打勾。」「剩下三個」（換句表），沒有 Alison',J(tx(Mx))===J([L.g15.me,'打勾。','剩下三個'])&&J(fr(Mx))===J(['player','classmate_xinci','classmate_xinci'])&&Mx.every(m=>m.th==='g:noodle_team'&&m.day===D('2028-08-05')&&Math.abs(m.h-9)<0.05),J(Mx.map(m=>[m.from,m.text,m.h])));
    setup({}); runAt('2028-08-05',9.5); const noList=byTag('aa660_us_photo1').length+byTag('aa660_us_photo1_me').length;
    setup({US_PHOTO_LIST:true}); runAt('2028-08-07',10); const late=byTag('aa660_us_photo1').length;
    check('G1-5 沒有清單（沒去餞行、Alison 和芯慈都不在）不發；舊存檔 8/7 才讀進來不補；其他三樣（洋芋片、教室、房間）遊戲裡沒有照片動態＝不發（模組裡沒有那幾則）',noList===0&&late===0&&!/洋芋片|教室|房間/.test(J(L.g15)),J({noList,late})); }

  /* ================= G2 美國路線回國當天 12/23 ================= */
  { const back=(fl,ids,h)=>{ fresh('2028-12-23',h==null?20:h,'dorm',USA(Object.assign({US_RETURNED:D('2028-12-23'),US_TRIP_DONE:true,ROOM_Y4:D('2028-12-23')},fl||{}))); friends(...(ids||['yu','classmate_mingxuan'])); NG(); };
    const W21=L.g21.map(x=>x[1]), meHome=()=>(H.G.msgs||[]).filter(m=>m.th==='g:home'&&m.from==='player'&&m.day===D('2028-12-23'));
    back({},null,9.5); runAt('2028-12-23',10.4); const f0=byTag('aa660_us_back_fam').length; runAt('2028-12-23',10.5); const M=byTag('aa660_us_back_fam'), me0=meHome().length;
    check('G2-1 家人群組預設發（AA660.G21_ON＝true、G21_H＝10.5）：10:24 還沒有；10:30（媽媽接到人、九點回到家以後）媽媽「接到了」「📷（餐桌上一鍋蘿蔔排骨湯，……）」、爸爸「平安就好」、姊姊「先讓他睡」；沒有你（自動）那一則',
      !!A()&&A().G21_ON===true&&A().G21_H===10.5&&f0===0&&J(tx(M))===J(W21)&&J(fr(M))===J(['mom','mom','dad','sister'])&&M.every(m=>m.th==='g:home'&&m.day===D('2028-12-23')&&Math.abs(m.h-10.5)<0.05)&&me0===0,J(M.map(m=>[m.from,m.text,m.h])));
    back({}); runAt('2028-12-23',20.5); const M2=byTag('aa660_us_back_fam'), me2=meHome().length;
    check('G2-1 睡到下午、晚上在 409 才讀到（20:30）：照 10:30 補進去（不是現在的時間），一樣沒有你（自動）',J(tx(M2))===J(W21)&&M2.every(m=>m.day===D('2028-12-23')&&m.h>=10.5&&m.h<10.56)&&me2===0,J(M2.map(m=>[m.text,m.h])));
    G21(false); back({}); runAt('2028-12-23',20.5); const off=byTag('aa660_us_back_fam').length; G21(true);
    check('G2-1 開關關掉（G21_ON＝false）就不發',off===0,J(off));
    back({US_PHOTO_LIST:true}); runAt('2028-12-23',20.95); const n0=byTag('aa660_us_back_grp').length; runAt('2028-12-23',21); const G1=byTag('aa660_us_back_grp');
    check('G2-2 12/23 21:00 桌遊團群組（有清單）：Alison「回來了？？」「清單最後一項 你一直沒拍」、明軒「現在拍也可以。」（兩個回法：傳照片／「見面再給你們看。」）',n0===0&&J(tx(G1))===J(['回來了？？','清單最後一項 你一直沒拍','現在拍也可以。'])&&J(fr(G1))===J(['yu','yu','classmate_mingxuan'])&&!!G1[2].ask&&J(G1[2].ask.opts.map(o=>o.t))===J(['（傳一張自己的照片：背景是機場的行李轉盤，你看起來很睏。）','見面再給你們看。']),J(tx(G1)));
    const r0=PHONE.answer(H.G,'aa660_us_back_photo',0);
    check('G2-2 傳自己的照片：明軒「好。這張可以。」、Alison「打勾！！清單完成」',!!r0&&J(tx(r0.out))===J(['（傳一張自己的照片：背景是機場的行李轉盤，你看起來很睏。）','好。這張可以。','打勾！！清單完成'])&&J(fr(r0.out))===J(['player','classmate_mingxuan','yu']),J(r0&&tx(r0.out)));
    back({US_PHOTO_LIST:true}); runAt('2028-12-23',21); const r1=PHONE.answer(H.G,'aa660_us_back_photo',1);
    check('G2-2「見面再給你們看。」：Alison「好啦 那也算」（沒有「……」）',!!r1&&J(tx(r1.out))===J(['見面再給你們看。','好啦 那也算'])&&J(fr(r1.out))===J(['player','yu']),J(r1&&tx(r1.out)));
    const XC2=['classmate_mingxuan','classmate_xinci'];
    back({US_PHOTO_LIST:true,US_PHOTO_LIST_XC:true},XC2); runAt('2028-12-23',21); const X1=byTag('aa660_us_back_grp');
    check('G2-2 清單是芯慈給的（US_PHOTO_LIST_XC）：明軒「回來了？」、芯慈「清單最後一項，你一直沒拍。」、明軒「現在拍也可以。」（兩個回法同上）',J(tx(X1))===J(['回來了？','清單最後一項，你一直沒拍。','現在拍也可以。'])&&J(fr(X1))===J(['classmate_mingxuan','classmate_xinci','classmate_mingxuan'])&&!!X1[2]&&!!X1[2].ask&&J(X1[2].ask.opts.map(o=>o.t))===J(['（傳一張自己的照片：背景是機場的行李轉盤，你看起來很睏。）','見面再給你們看。']),J(tx(X1)));
    const x0=PHONE.answer(H.G,'aa660_us_back_photo',0);
    back({US_PHOTO_LIST:true,US_PHOTO_LIST_XC:true},XC2); runAt('2028-12-23',21); const x1=PHONE.answer(H.G,'aa660_us_back_photo',1);
    check('G2-2 芯慈版的回覆：傳照片＝明軒「好。這張可以。」、芯慈「清單完成。」；「見面再給你們看。」＝芯慈「好。那也算。」',
      !!x0&&J(tx(x0.out))===J(['（傳一張自己的照片：背景是機場的行李轉盤，你看起來很睏。）','好。這張可以。','清單完成。'])&&J(fr(x0.out))===J(['player','classmate_mingxuan','classmate_xinci'])&&!!x1&&J(tx(x1.out))===J(['見面再給你們看。','好。那也算。'])&&J(fr(x1.out))===J(['player','classmate_xinci']),J({x0:x0&&tx(x0.out),x1:x1&&tx(x1.out)}));
    back({}); runAt('2028-12-23',21); const G2=byTag('aa660_us_back_grp');
    check('G2-2 沒有清單（認識 Alison）：Alison「回來了？？」「桌遊夜幫你留位子」（沒有選項）',J(tx(G2))===J(['回來了？？','桌遊夜幫你留位子'])&&J(fr(G2))===J(['yu','yu'])&&!G2.some(m=>m.ask),J(tx(G2)));
    back({},XC2); runAt('2028-12-23',21); const N2=byTag('aa660_us_back_grp');
    check('G2-2 沒有清單、也沒認識 Alison（AA de9628d67）：明軒「回來了？」「下次桌遊夜，位子留給你。」，不發「桌遊夜幫你留位子」',J(tx(N2))===J(['回來了？','下次桌遊夜，位子留給你。'])&&J(fr(N2))===J(['classmate_mingxuan','classmate_mingxuan'])&&!N2.some(m=>m.ask),J(N2.map(m=>[m.from,m.text])));
    fresh('2028-12-21',20,'us_apartment',USA({US_PHOTO_LIST:true})); NG(); runAt('2028-12-21',21.5); const inUS=byTag('aa660_us_back_grp').length;
    back({US_PHOTO_LIST:true}); runAt('2028-12-25',10); const late=byTag('aa660_us_back_grp').length;
    const nope=[]; for(const fl of [TW0,JP0]){ fresh('2028-12-23',20,'dorm',Object.assign({},fl,{US_RETURNED:D('2028-12-23')})); NG(); runAt('2028-12-23',21.5); if(byTag('aa660_us_back_grp').length) nope.push(J(fl)); }
    check('G2-2 還在美國（沒回來）不發；舊存檔 12/25 才讀進來不補；臺灣、日本路線沒有',inUS===0&&late===0&&!nope.length,J({inUS,late,nope}));
    /* G2-3 Kevin */
    const kev=fl=>{ fresh('2028-12-24',20,'dorm',fl); PHONE.join(H.G,'family_law','法律系直屬家族'); at('2028-12-24',20.4); HEARD.phone(H.G); PHONE.tick(H.G); at('2028-12-24',20.6); HEARD.phone(H.G); PHONE.tick(H.G); return tx(byTag('heard_h509_kevin')); };
    const ku=kev(Object.assign({},US0,{US_RETURNED:D('2028-12-23')})), kt=kev(TW0), kj=kev(JP0);
    check('G2-3 12/24 20:30 Kevin（美國路線）：第一句「學姊跟學弟都回來了」，後面三則照舊；臺灣、日本路線照舊「學姊回來了」',
      J(ku)===J(['學姊跟學弟都回來了','她帶了一盒美國的餅乾給家族 說很甜 叫我們不要一次吃完','我一次吃完了','我知道。'])&&J(kt)===J(['學姊回來了','她帶了一盒美國的餅乾給家族 說很甜 叫我們不要一次吃完','我一次吃完了','我知道。'])&&J(kj)===J(kt),J({ku,kt,kj})); }

  /* ================= G4 日本路線 3/23 阿哲 ================= */
  { const run=fl=>{ fresh('2028-03-23',20,'dorm',fl); H.FAMILIAR('heroine_01'); H.FAMILIAR('zhe'); NG(); runAt('2028-03-23',21); return tx(byTag('y3_an_farewell_ask')); };
    const j=run(Object.assign({},JP0,{X1_JP:D('2028-02-20')})), t=run(TW0), u=run(US0);
    check('G4 日本路線 3/23 21:00 阿哲：「明天 幫以安跟祐廷餞行」「七點 燒臘店」；臺灣、美國路線照舊「明天 以安餞行」',J(j)===J(['明天 幫以安跟祐廷餞行','七點 燒臘店'])&&J(t)===J(['明天 以安餞行','七點 燒臘店'])&&J(u)===J(t),J({j,t,u})); }

  /* ================= G5 日本路線回國當天 8/5 ================= */
  { const inJapan=(h,datingAn,fl)=>{ fresh('2028-08-05',h,'jp_hub',Object.assign({},JP0,{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),AN_SENDOFF:'together'},fl||{})); H.FAMILIAR('heroine_01'); H.date('heroine_01'); if(!datingAn) ROM.end(H.G,'heroine_01','test'); friends('yu'); NG(); at('2028-08-05',h); };
    inJapan(8,true); H.said=[]; await JP.returnHome(GM); const F=H.G.flags, h0=H.G.hour; phone(); const M=byTag('aa660_jp_back_me').concat(byTag('aa660_jp_back_fam'));
    check('G5-1 回程記落地的時間 JP_RETURN_H（08:00 起飛＝13:00 落地）',F.JP_RETURNED===D('2028-08-05')&&F.JP_RETURN_H===13,J({r:F.JP_RETURNED,h:F.JP_RETURN_H}));
    check('G5-1 回到家以後：家人群組補在落地的 13:00——你（自動）「到了」→ 媽媽「好」「冰箱有切好的芒果」、爸爸「平安就好」',h0>13&&J(tx(M))===J(['到了','好','冰箱有切好的芒果','平安就好'])&&J(fr(M))===J(['player','mom','mom','dad'])&&M.every(m=>m.th==='g:home'&&m.day===D('2028-08-05')&&Math.abs(m.h-13)<0.05),J(M.map(m=>[m.from,m.text,m.h])));
    inJapan(12,true); await JP.returnHome(GM); phone(); const M2=byTag('aa660_jp_back_me');
    check('G5-1 晚一點才搭機（12:00）：14:00 落地＝那一則在 14:00',H.G.flags.JP_RETURN_H===14&&M2.length===1&&Math.abs(M2[0].h-14)<0.05,J(M2.map(m=>m.h)));
    inJapan(8,true); await JP.returnHome(GM); runAt('2028-08-05',20.95); const n0=byTag('aa660_jp_back_grp').length; runAt('2028-08-05',21); const G1=byTag('aa660_jp_back_grp');
    check('G5-2 8/5 21:00 桌遊團群組（和以安交往中）：Alison「你們兩個回來了？？」、以安「回來了。」「排隊入境的時候，祐廷站著睡著了。」（兩個回法）',n0===0&&J(tx(G1))===J(['你們兩個回來了？？','回來了。','排隊入境的時候，祐廷站著睡著了。'])&&J(fr(G1))===J(['yu','heroine_01','heroine_01'])&&!!G1[2].ask&&J(G1[2].ask.opts.map(o=>o.t))===J(['那叫閉眼睛。','……妳也有。']),J(tx(G1)));
    const a0=PHONE.answer(H.G,'aa660_jp_back_an',0);
    inJapan(8,true); await JP.returnHome(GM); runAt('2028-08-05',21); const a1=PHONE.answer(H.G,'aa660_jp_back_an',1);
    check('G5-2「那叫閉眼睛。」→ 以安「閉到輪到我們。」；「……妳也有。」→ 以安「我是在想事情。」',!!a0&&J(tx(a0.out))===J(['那叫閉眼睛。','閉到輪到我們。'])&&!!a1&&J(tx(a1.out))===J(['……妳也有。','我是在想事情。']),J({a0:a0&&tx(a0.out),a1:a1&&tx(a1.out)}));
    inJapan(8,false); await JP.returnHome(GM); runAt('2028-08-05',21); const G2=byTag('aa660_jp_back_grp');
    check('G5-2 沒有在交往（挽回中）：以安那三句拿掉，只留 Alison「回來了？？」',J(tx(G2))===J(['回來了？？'])&&J(fr(G2))===J(['yu']),J(tx(G2)));
    fresh('2028-08-07',10,'dorm',Object.assign({},JP0,{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),JP_RETURNED:D('2028-08-05'),JP_RETURN_H:13})); NG(); runAt('2028-08-07',10.5); const late=byTag('aa660_jp_back_fam').length+byTag('aa660_jp_back_grp').length;
    fresh('2028-08-20',10,'dorm',Object.assign({},JP0,{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),JP_RETURNED:D('2028-08-20'),JP_RETURN_LATE:true})); NG(); runAt('2028-08-20',22); const late2=byTag('aa660_jp_back_fam').length+byTag('aa660_jp_back_grp').length;
    const nope=[]; for(const fl of [TW0,US0]){ fresh('2028-08-05',20,'dorm',fl); NG(); runAt('2028-08-05',21.5); if(byTag('aa660_jp_back_fam').length+byTag('aa660_jp_back_grp').length) nope.push(J(fl)); }
    check('G5 舊存檔 8/7 才讀進來不補；早就過了回程的舊存檔（JP_RETURN_LATE）不補；臺灣、美國路線沒有',late===0&&late2===0&&!nope.length,J({late,late2,nope})); }

  /* ================= G6 日本路線回國後的摘要日 ================= */
  { const home=(k,h)=>{ fresh(k,h,'dorm',Object.assign({},JP0,{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),JP_RETURNED:D('2028-08-05'),JP_RETURN_H:13,Y4_PATH:'bar'})); atHome(H.G); at(k,h); };
    const ks=JP.SCH.map(s=>s.k);
    check('G6 JP.SCH 多三列（w:home，18:30）；8/12 那一列排在 s_0812 後面',['aa660_g6_0812','aa660_g6_0822','aa660_g6_0829'].every(k=>ks.includes(k))&&ks.indexOf('s_0812')<ks.indexOf('aa660_g6_0812')&&JP.SCH.filter(s=>/^aa660_/.test(s.k)).every(s=>s.w==='home'&&s.h===18.5));
    home('2028-08-12',18.5); const st1=JP.dueStop(H.G,'home'); H.said=[]; if(st1) await JP.playStop(GM,st1,'home'); const st2=JP.dueStop(H.G,'home'); if(st2) await JP.playStop(GM,st2,'home'); const said12=H.said.map(s=>s.t);
    check('G6 8/12 18:30 在家：先 s_0812（HOLFF.y3sPath 那一句）、再「（你在超商結帳的時候，差一點用日文說了謝謝。店員看了你一眼。）」',!!st1&&st1.k==='s_0812'&&!!st2&&st2.k==='aa660_g6_0812'&&said12.length===2&&said12[1]===L.g6['2028-08-12']&&said12[0]===HOLFF.y3sPath(H.G),J(said12));
    home('2028-08-21',19); const nx=JP.nextStop(H.G,T(H.G.day,H.G.hour),'home'); at('2028-08-22',18.5); const s22=JP.dueStop(H.G,'home');
    home('2028-08-29',18.5); const s29=JP.dueStop(H.G,'home'); H.said=[]; if(s29) await JP.playStop(GM,s29,'home');
    check('G6 8/21 晚上：快轉停在 8/22 18:30；8/22、8/29 兩句照稿',nx===T(D('2028-08-22'),18.5)&&!!s22&&s22.k==='aa660_g6_0822'&&s22.sum===L.g6['2028-08-22']&&!!s29&&s29.k==='aa660_g6_0829'&&H.said.length===1&&H.said[0].t===L.g6['2028-08-29'],J({nx,s22:s22&&s22.k,s29:s29&&s29.k}));
    home('2028-08-14',10); const old=JP.dueStop(H.G,'home');
    check('G6 舊存檔 8/14 才讀進來：8/12 那兩列不補演',!old||!/0812$/.test(old.k),J(old&&old.k)); }

  /* ================= 第 4 節三件 ================= */
  { const d=D('2028-12-21'), tag='home_ask_'+d;
    fresh('2028-12-21',20,'us_apartment',USA()); at('2028-12-21',20.5); phone(); const usSent=PHONE.sent(H.G,tag);
    H.G.flags.US_RETURNED=D('2028-12-23'); H.G.zone='dorm'; at('2028-12-23',21); phone(); const after=PHONE.sent(H.G,tag);
    fresh('2028-12-21',20,'dorm',US0); at('2028-12-21',20.5); phone(); const m=byTag(tag)[0];
    check('4-1 美國路線 12/21（週四）人在美國：家人群組那一則（掃描看到的「連假回來嗎」）不發（us_life3d.js 擋 HOME.phoneRules）；12/23 回來以後也不補',!usSent&&!after,J({usSent,after}));
    check('4-1 對照：沒有「抵達美國」旗標（掃描的存檔）才會發「'+(m&&m.text)+'」——掃描沒有模擬出發、抵達',!!m&&/連假/.test(m.text),J(m&&m.text)); }
  { fresh('2028-03-02',20,'dorm',TW0); H.FRIEND('heroine_04'); H.G.contacts.heroine_04=1; const d=H.G.day+1;
    const iv=INV.offer(H.G,'heroine_04','cafe',d,16,'明天下午打羽球 我需要報仇',{day:H.G.day,h:23.5}); const m=(H.G.msgs||[]).find(x=>x.text==='明天下午打羽球 我需要報仇');
    check('4-2 她主動約你（INV.offer）的訊息只有 who（沒有 th、from，掃描讀 th／from 才是空的）；遊戲照 who 放進她的私訊，對話標題是她的名字',!!iv&&!!m&&m.who==='heroine_04'&&!m.th&&!m.from&&PHONE.th(m)==='p:heroine_04'&&/子晴/.test(PHONE.title(H.G,'p:heroine_04')),J({m,title:PHONE.title(H.G,'p:heroine_04')})); }
  { const P=typeof HASK_DATA!=='undefined'?HASK_DATA.people.heroine_04:null, e=P&&P.daily.find(x=>x.place==='cafe'), s=fs.readFileSync(path.join(H.ROOT,'src/data/heroine_asks.js'),'utf8');
    const K=typeof HASK_DATA!=='undefined'?HASK_DATA.people.kexin:null, k=K&&K.daily.find(x=>x.place==='cafe');
    let fix=null; try{ fix=JSON.parse(fs.readFileSync(path.join(H.ROOT,'tools/story/aa655_fix.json'),'utf8')); }catch(err){}
    const PR=[['兩點半 明天四點 我要點最甜的那個 你陪我','2:30 AM 明天四點 我要點最甜的那個 你陪我'],['明天兩點半 我點最甜的 你點最苦的 交換','明天去 2:30 AM 我點最甜的 你點最苦的 交換'],['明天下午我在公館。三點，兩點半。','明天下午我在公館。三點，2:30 AM。']];
    check('4-3 店名換 2:30 AM：子晴交往前「2:30 AM 明天四點 ……」（AA_660 第 4 節第 3 點）、交往中「明天去 2:30 AM 我點最甜的 你點最苦的 交換」、可昕「明天下午三點，2:30 AM。我去寫報告，你也來。」（AA_494 0777c92ac 的 2:30 AM；AA_939 第 1 節再換字）；舊句不在 src；讀稿的換字表（aa655_fix.json pairs）有這三列',
      !!e&&e.pre.line===PR[0][1]&&e.dat.line===PR[1][1]&&!!k&&k.pre.line==='明天下午三點，2:30 AM。我去寫報告，你也來。'/* （AA_939 第 1 節換字：外校前提；舊期望 PR[2][1]「明天下午我在公館。三點，2:30 AM。」）*/&&!s.includes(PR[2][1])&&PR.every(([a,b])=>!s.includes(a)&&!!fix&&fix.pairs.some(p=>p[0]===a&&p[1]===b)),J({pre:e&&e.pre.line,dat:e&&e.dat.line,kx:k&&k.pre.line}));
    const raw=(ref,p)=>{ const r=cp.spawnSync('git',['-c','core.quotepath=false','show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26}); return r.status===0?r.stdout:''; };   /* spawnSync：不經 alison.js 的讀稿換字（看稿上原本的字）*/
    const A494='docs/story_planning/AA_494_女主角主動約你_七位的門檻頻率地點時間台詞.md', r0=raw('b3ecc563c',A494), r1=raw(SHA,A494), f0=git('b3ecc563c',A494);
    check('4-3 換字表後兩列＝AA_494 的改法：白名單的 b3ecc563c 原本是舊句、0777c92ac 是新句；讀稿（照換字表）b3ecc563c 讀出來是新句（tests/heroine_asks_unit.js 照這樣對）',
      r0.length>1000&&r1.length>1000&&PR.slice(1).every(([a,b])=>r0.includes(a)&&!r0.includes(b)&&r1.includes(b)&&!r1.includes(a)&&f0.includes(b)&&!f0.includes(a)),r1?'':'git fetch origin claude/magical-albattani-bk7b4n'); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外：'+(e&&e.stack||e)); process.exit(1); });
