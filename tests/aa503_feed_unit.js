// 手機「動態」與「她講自己的事」的私訊（AA_503 大一上，企劃線 d13ab3ab7 更正版（含 74916d73b 的三處、62849944b、d13ab3ab7 第 12 節）；HEROINE-LIFE-1028，使用者 2026-10-28 01:2x「可攻略女主角 感覺都沒有自己的生活」，USER_WANTS X122★）——不需要瀏覽器。
//   src/data/feed_y1s1.js（台詞）、src/feed3d.js（FEED）；game3d.js 的「動態」頁籤；可昕原本「拒絕或沒去才出」的四則照片改成動態。
//   0  載得到、index.html 順序、「動態」頁籤在「訊息」旁邊；每一句都在 AA_503 稿裡（git show d13ab3ab7，一字不差）；更正前（c6c93432d）的舊句子不在遊戲裡
//   1  階段沒到的那一則就是沒有（不顯示鎖住）；沒有聯絡方式不出；時間到了才出；睡過、跳時間照原本的時間補；舊存檔從讀檔那一天開始
//   2  回應三選：按愛心不回；留言她回（進私訊）；私訊問一句她答；一則只回一次；熟悉 +1 同一個人一天一次；以安第 2 則的私訊問要 Alison 爆料以後
//   3  頻率：女主角每人連續七天最多兩則、配角十四天一則、一天最多四則（加假的動態測上限）；大一上走一遍（七位都很熟）：44 則都出、一天不超過四則、每位一週不超過兩則
//   4  以安：第 10 週隔天 10:12 私訊（很熟）選「那妳寒假去。」→ AN_LIST → 1/17 那一則以後隔天 10:00 多一則私訊；沒 AN_LIST 沒有；不到很熟沒有
//   5  子晴練習賽：私訊三個選項的記號（ZQ_PRACTICE tell／third／sticker）；貼圖貼出去是「（貼圖：插座貓）」
//   6  可昕第 11 週報告：三個選項各一次（熬夜＝排視訊 00:00、事件兩句台詞；他人呢；先睡＝已讀的旁白、隔天中午以前傳訊息她中午才回）；週四 18:00 三個都有；朋友也有、只認識沒有
//   7  沛珊第 10 週那一則（有點熟以上）；芷若冬季菜單（問過她自己喝什麼的第三則換句）、交換說明會；語彤受試者；學姊 1/18（很熟）
//   8  分開以後一學期，可昕的動態不出現、私訊不傳；之後照朋友再出現
//   9  可昕的四則改成動態、一定出：玉米（去了＝照片裡有你的手）、紙皇冠（去過／沒去的回覆）、酸辣湯餃（第 6 則 12/3 交完報告那晚，分沒去／去了兩個版本）、書桌照（第 8 則）；
//      玉米、紙皇冠的私訊整則不再傳、酸辣湯餃的私訊只拿掉照片；12/16 書桌的照片照舊私訊（d13ab3ab7 第 12 節）；第 4 則私訊問「為什麼爬好幾趟？」
//   10 畫面：最新的在上面、只顯示七天、小點（新的動態）、看過就熄；動態不算未讀
// 修改前（開發分支 a1f0566c6：沒有 src/feed3d.js、src/data/feed_y1s1.js，可昕四則照舊「拒絕或沒去才私訊」；src、index.html 換回 a1f0566c6 實際跑過）：
//   FAILED 55、PASS 2（「動態不在 G.msgs」「答應了還沒去＝先等」兩項本來就成立）——第 0～8、10 段全部 FAIL（沒有 FEED、沒有動態頁籤、沒有私訊）；
//   第 9 段：玉米、紙皇冠照舊私訊（kx_bbq_corn、kx_yule_crown）、酸辣湯餃、書桌照的私訊還帶照片、四則都沒有動態＝FAIL。修改後 ALL PASS。用法：node tests/aa503_feed_unit.js
// 第二輪（d13ab3ab7 第 12 節；修改前＝開發分支 a57127ab4，src、index.html 換回 a57127ab4 實際跑過）：FAILED 11——台詞對稿（kx4、kx6 的舊句不在 d13ab3ab7）、
//   d13ab3ab7 改掉的舊句還在、第 6 則沒去／去了兩個版本（照片、一句、留言回、私訊問與回：7 項）、12/16 書桌的照片（a57127ab4 只剩那一句）、第 4 則私訊問。修改後 ALL PASS。
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const SPEC='docs/story_planning/AA_503_女主角自己的生活_大一上_動態頁_圈子_她的事.md', SHA='d13ab3ab7', OLD='c6c93432d';   /* d13ab3ab7 含 74916d73b 的三處、62849944b 可昕第 5 則、d13ab3ab7 第 12 節（可昕第 4、6 則、12/16 書桌照片）*/
const loadG=(f,names)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
try{ for(const [f,n] of [['src/data/msg_pool.js',['MSG_POOL']],['src/data/msg2_pool.js',['MSG2_POOL']],['src/msg3d.js',['MSG']]]) if(fs.existsSync(path.join(H.ROOT,f))) loadG(f,n); }catch(e){ console.log('（msg3d.js 載不到：'+(e&&e.message)+'）'); }
let ok=true, err='';
try{ loadG('src/data/feed_y1s1.js',['FEED_Y1S1']); loadG('src/feed3d.js',['FEED']); }catch(e){ ok=false; err=String(e&&e.message||e); }
/* 每一段各自算：前面壞了（例如修改前沒有 FEED）後面照樣跑、照樣記 FAIL */
const sec=(name,fn)=>{ try{ fn(); }catch(e){ check(name+'（例外）',false,String(e&&e.message||e).slice(0,160)); } };
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
{ const sc=f=>html.indexOf('<script src="'+f), iS=sc('src/story3d.js'), iD=sc('src/data/feed_y1s1.js'), iF=sc('src/feed3d.js'), iB=sc('src/data/bbpack_events.js');
  check('0. 載得到；index.html：data/feed_y1s1.js → feed3d.js 在 story3d.js 以後、bbpack_events.js 前面',ok&&iS>0&&iD>iS&&iF>iD&&iB>iF,err);
  check('0. 手機的頁籤：「動態」在「訊息」旁邊',/<button data-ptab="msg">訊息<\/button><button data-ptab="feed">動態<\/button>/.test(html)); }
let doc='', old=''; try{ doc=cp.execSync('git show '+SHA+':"'+SPEC+'"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){} try{ old=cp.execSync('git show '+OLD+':"'+SPEC+'"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}
sec('0. 台詞對稿',()=>{ const L=[]; const add=(x,w)=>{ if(x==null||x==='') return; if(typeof x==='object'){ if(x.nar) add(x.nar,w); for(const k of ['no','yes']) if(x[k]!=null) add(x[k],w); return; } L.push([w,x]); };
  for(const p of FEED_Y1S1.posts){ add(p.pic,p.id); add(p.say,p.id); for(const x of p.cm||[]) add(x,p.id); for(const x of p.dm||[]) add(x,p.id); }
  for(const q of FEED_Y1S1.dms){ for(const l of q.lines) add(l,q.id); if(q.ask) for(const o of q.ask.opts){ add(o.t,q.id); if(typeof o.post==='string') add(o.post,q.id); for(const r of o.r||[]) add(r,q.id); } }
  add(FEED_Y1S1.video.start,'video'); add(FEED_Y1S1.video.end,'video');
  const bad=L.filter(([w,t])=>!doc.includes(t));
  check('0. 每一句都在 AA_503 稿裡（'+SHA+'，一字不差；'+L.length+' 句）',doc.length>1000&&L.length>=250&&!bad.length,doc?J(bad.slice(0,8)):'git fetch origin claude/magical-albattani-bk7b4n');
  check('0. 動態 44 則（以安 8、芷若 6、語彤 6、子晴 7、學姊 3、可昕 8、沛珊 6）、私訊 10 則',FEED_Y1S1.posts.length===44&&FEED_Y1S1.dms.length===10,J([FEED_Y1S1.posts.length,FEED_Y1S1.dms.length]));
  /* AA 更正：74916d73b 芷若的拉花比賽、語彤的訪問作業；62849944b 可昕第 5 則的予樂生日——都不放進遊戲 */
  const GONE=['比完了。','小婷贏。','我的那一杯老闆喝掉了，他說歪的比較好喝。','作業交了。','我訪問了每天來吃乾麵的那個伯伯。','他講了一個小時。他太太的事。','寫他每天點一樣的。……其他的我沒寫。那是他的。','嗯。他今天也來了。一樣不要蔥。','一杯拉花，愛心歪到右邊','兩杯拉花並排，左邊那杯明顯比較好看','一本筆記本，寫滿了字，最上面寫著「伯伯」','小婷很厲害。我教的。',
    '宿舍走廊，一個蛋糕，蠟燭被風吹斜了','予樂生日。','我幫你轉達。她說：你誰？','一個鬧鐘。她每天遲到。'];
  const src=fs.readFileSync(path.join(H.ROOT,'src/data/feed_y1s1.js'),'utf8')+fs.readFileSync(path.join(H.ROOT,'src/feed3d.js'),'utf8');
  check('0. 更正前（'+OLD+'）的舊句子不在遊戲裡（拉花比賽、訪問伯伯、予樂生日）',old.length>1000&&GONE.every(t=>old.includes(t)&&!doc.includes(t)&&!src.includes(t)),J(GONE.filter(t=>src.includes(t))));
  /* d13ab3ab7 第 12 節：可昕第 4 則私訊問、第 6 則改成交完報告那晚 */
  const GONE2=['為什麼爬五次？','一碗酸辣湯餃，旁邊一疊印好的報告','第一份期末報告。','還沒交。明天才交。','予樂先睡了。……有點悲壯。'];
  check('0. d13ab3ab7 改掉的句子不在遊戲裡（「為什麼爬五次？」、第 6 則「第一份期末報告。」那一版）',old.length>1000&&GONE2.every(t=>old.includes(t)&&!doc.includes(t)&&!src.includes(t)),J(GONE2.filter(t=>src.includes(t)))); });
if(!ok){ /* 修改前：沒有 FEED，下面每一段都會記 FAIL */ }

/* ---------- 共用 ---------- */
const DK=k=>PG.DK(k);
const TD=(w,wd)=>{ const R=CALENDAR.termDays('Y1S1'); return R.from+(w-1)*7+(wd-1); };   /* wd 1＝週一 … 7＝週日 */
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wdOf(d); };
const fresh=(d,h,flags)=>{ const G=H.fresh(CALENDAR.dateOf(d).key,h,'dorm',flags); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.outings)) G.outings=[]; return G; };
const LV={ACQ:[10,0,0],FAM:[25,0,0],FRIEND:[45,30,10],CLOSE:[65,50,45]};
const rel=(id,lv)=>{ H.rel(id,...LV[lv]); };
const contact=id=>{ H.G.contacts[id]=H.G.day-1; };
const who=(id,lv)=>{ rel(id,lv); contact(id); };
const HAS=()=>typeof FEED!=='undefined';   /* 修改前沒有 FEED：下面的小工具照樣能跑（舊程式的私訊照常傳），檢查照樣記 FAIL */
const R=()=>HAS()?FEED.rec(H.G):{start:null,items:[],done:{},dm:{}};
const tickF=()=>{ if(HAS()) FEED.tick(H.G); };
const HT=()=>HAS()?FEED.html(H.G):'';
const T=(d,h)=>d*24+h;
/* 從現在走到 (d,h)：每 step 小時跑一次 FEED.tick＋PHONE.tick（rules＝跑整個 STORY.phoneRules）*/
const walk=(d,h,o)=>{ o=o||{}; const st=o.step||0.25, end=T(d,h); let t=T(H.G.day,H.G.hour); for(;t<end-1e-9;t+=st){ const dd=Math.floor(t/24); at(dd,+(t-dd*24).toFixed(4)); if(o.rules) STORY.phoneRules(GM); else tickF(); PHONE.tick(H.G); } at(d,h); if(o.rules) STORY.phoneRules(GM); else tickF(); PHONE.tick(H.G); };
const jump=(d,h,o)=>{ at(d,h); if(o&&o.rules) STORY.phoneRules(GM); else tickF(); PHONE.tick(H.G); };   /* 睡過、跳時間：中間不跑，一次補 */
const th=id=>(H.G.msgs||[]).filter(m=>PHONE.th(m)==='p:'+id);
const txt=id=>th(id).map(m=>(m.from==='player'?'你：':(m.from?'':'旁白：'))+m.text);
const item=id=>R().items.find(i=>i.id===id)||null;
const dm=id=>(H.G.msgs||[]).find(m=>m.tag==='aa503_'+id&&m.ask)||null;
const famOf=id=>SOCIAL.rel(id).fam;

/* ---------- 1 階段、聯絡方式、時間、補、舊存檔 ---------- */
sec('1',()=>{ const W2SUN=TD(2,7); fresh(TD(1,1),8); who('heroine_01','ACQ'); tickF();
  check('1. 新遊戲（舊存檔沒有 FEED）：第一次就建立，start＝那一天',R().start===TD(1,1)&&R().items.length===0,J(R()));
  walk(W2SUN,21.6); const before=item('an1'); walk(W2SUN,21.7);
  check('1. 以安第 1 則（第 2 週週日 21:40，認識）：21:36 還沒有、21:42 有了（認識就看得到）',!before&&!!item('an1')&&item('an1').day===W2SUN&&Math.abs(item('an1').h-(21+40/60))<0.01&&R().done.an1==='p',J(R().done));
  walk(TD(7,2),23); const h1=HT();
  check('1. 以安第 2 則（朋友）只認識：沒有（done x:stage），畫面上沒有「寫完了。」、沒有「鎖」',R().done.an2==='x:stage'&&!item('an2')&&!h1.includes('寫完了。')&&!/鎖/.test(h1),J(R().done.an2));
  rel('heroine_01','FRIEND'); walk(TD(7,3),12); check('1. 之後變朋友：那一則還是沒有（判斷過就不再判斷）',!item('an2')&&R().done.an2==='x:stage');
  /* 沒有聯絡方式 */
  fresh(TD(3,1),8); rel('heroine_03','CLOSE'); walk(TD(3,2),21); check('1. 語彤很熟、沒有聯絡方式：第 1 則不出（x:contact）',R().done.yt1==='x:contact'&&!item('yt1'),J(R().done));
  /* 睡過、跳時間：照原本的時間補 */
  fresh(TD(3,7),20); who('heroine_02','ACQ'); tickF(); jump(TD(4,1),8);
  const z=item('zr1'); check('1. 芷若第 1 則（第 3 週週日 22:07）：週日 20:00 睡到週一 08:00，補在週日 22:07',!!z&&z.day===TD(3,7)&&Math.abs(z.h-(22+7/60))<0.01,J(z));
  /* 舊存檔：從讀檔那一天開始 */
  fresh(TD(9,4),21); who('heroine_03','FRIEND'); who('kexin','FRIEND'); H.G.flags.dating_kexin=true; tickF(); PHONE.tick(H.G);
  check('1. 舊存檔第 9 週週四 21:00 第一次讀：那一天 20:40 語彤第 3 則補上、20:45 她的私訊也到；前一天（週三 22:40）可昕第 4 則不補（old）',!!item('yt3')&&R().done.kx4==='old'&&R().done.an1==='old'&&th('heroine_03').some(m=>m.text==='今天當筱涵的受試者。'),J({yt3:R().done.yt3,kx4:R().done.kx4}));
  check('1. 動態不在 G.msgs（不算未讀、不跳通知）',!(H.G.msgs||[]).some(m=>m.text==='一張受試者同意書，下面簽了名'||m.fd==null&&/^（照片：/.test(m.text))); });

/* ---------- 2 回應 ---------- */
sec('2',()=>{ const W10THU=TD(10,4), W11WED=TD(11,3), W13SUN=TD(13,7);
  fresh(W10THU,8); who('heroine_02','FRIEND'); walk(W11WED,13.5);
  check('2. 芷若第 2 則（第 10 週週四 22:10）、第 4 則（第 11 週週三 13:00）都出',!!item('zr2')&&!!item('zr4'));
  const f0=famOf('heroine_02'), n0=th('heroine_02').length;
  const r1=FEED.respond(H.G,'zr2','heart');
  check('2. 「（按愛心）」：她不回（私訊沒有多）、熟悉 +1',!!r1&&item('zr2').r==='heart'&&th('heroine_02').length===n0&&famOf('heroine_02')===f0+1,J({f0,f:famOf('heroine_02')}));
  check('2. 一則只回一次',FEED.respond(H.G,'zr2','cm')===null);
  const r2=FEED.respond(H.G,'zr4','cm'); const L=th('heroine_02').slice(n0);
  check('2. 留言「交換？」→ 她回「嗯。」（進私訊對話串；你的那一句標是哪一則）',!!r2&&L.length===2&&L[0].from==='player'&&L[0].text==='交換？'&&L[0].fd==='zr4'&&L[1].from==='heroine_02'&&L[1].text==='嗯。'&&FEED.refLabel(H.G,L[0]).includes('動態「……」'),J(L.map(m=>[m.from,m.text])));
  check('2. 同一天第二次回應同一個人：熟悉不再加（一天一次）',famOf('heroine_02')===f0+1,J(famOf('heroine_02')));
  check('2. 她的回覆在動態頁上就看得到：那一段對話不算未讀',(PHONE.threads(H.G).find(t=>t.th==='p:heroine_02')||{unread:9}).unread===0);
  walk(W13SUN,22.6); const r3=FEED.respond(H.G,'zr3','dm'); const L3=th('heroine_02').slice(-2);
  check('2. 私訊問一句「這是小婷的？」→「嗯。她很會。我教的。」；隔天以後再回＝熟悉再 +1',!!r3&&J(L3.map(m=>m.text))===J(['這是小婷的？','嗯。她很會。我教的。'])&&famOf('heroine_02')===f0+2,J(L3.map(m=>m.text)));
  /* 這則不能留言、私訊問的條件 */
  fresh(TD(6,3),8); who('heroine_03','FRIEND'); walk(TD(6,3),11); const c=HT();
  check('2. 語彤第 2 則「（這則不能留言）」：沒有留言的按鈕、留言回 null；私訊問「妳在醫院？」→ 兩句',!c.includes('data-fd="yt2|cm"')&&c.includes('data-fd="yt2|dm"')&&FEED.respond(H.G,'yt2','cm')===null&&!!FEED.respond(H.G,'yt2','dm')&&J(th('heroine_03').slice(-3).map(m=>m.text))===J(['妳在醫院？','陪我媽。例行的。','……謝謝你問。']));
  fresh(TD(7,2),21); who('heroine_01','FRIEND'); walk(TD(7,2),22.2); const a=HT(); H.G.flags.AN_DORM_RULES='group'; const b=HT();
  check('2. 以安第 2 則的私訊問「三頁是因為字很大嗎？」：Alison 在群組爆料（AN_DORM_RULES group）以後才有',!a.includes('data-fd="an2|dm"')&&b.includes('data-fd="an2|dm"')&&b.includes('三頁是因為字很大嗎？'));
  H.G.flags.AN_DORM_RULES='peishan'; check('2. 沛珊當面說的（不是 Alison）：沒有那一格',FEED.respond(H.G,'an2','dm')===null);
  /* 超過七天就不能回 */
  walk(TD(8,3),23); check('2. 超過七天（已經不在動態頁）：不能回',FEED.respond(H.G,'an2','heart')===null); });

/* ---------- 3 頻率 ---------- */
sec('3',()=>{ const P=FEED_Y1S1.posts, add=[
    {id:'t_an_a',who:'heroine_01',t:'W10六 08:00',st:'認識',pic:'測試',say:'a',cm:['x','y'],dm:['x','y']},{id:'t_an_b',who:'heroine_01',t:'W10日 08:00',st:'認識',pic:'測試',say:'b',cm:['x','y'],dm:['x','y']},
    {id:'t_zq',who:'heroine_04',t:'W10六 09:00',st:'認識',pic:'測試',say:'c',cm:['x','y'],dm:['x','y']},{id:'t_sis',who:'heroine_05',t:'W10六 10:00',st:'認識',pic:'測試',say:'d',cm:['x','y'],dm:['x','y']},
    {id:'t_ps',who:'classmate_peishan',t:'W10六 11:00',st:'認識',pic:'測試',say:'e',cm:['x','y'],dm:['x','y']},{id:'t_yt',who:'heroine_03',t:'W10六 12:00',st:'認識',pic:'測試',say:'f',cm:['x','y'],dm:['x','y']},
    {id:'t_zhe1',who:'zhe',t:'W10一 09:00',st:'認識',pic:'測試',say:'g',cm:null,dm:null},{id:'t_zhe2',who:'zhe',t:'W11一 09:00',st:'認識',pic:'測試',say:'h',cm:null,dm:null},{id:'t_zhe3',who:'zhe',t:'W12二 09:30',st:'認識',pic:'測試',say:'i',cm:null,dm:null}];
  P.push(...add);
  try{ fresh(TD(10,1),8); for(const id of ['heroine_01','heroine_03','heroine_04','heroine_05','classmate_peishan','zhe']) who(id,'ACQ'); walk(TD(12,3),12,{step:0.5}); const D=R().done;
    check('3. 女主角每人連續七天最多兩則：以安第 10 週週五（第 3 則，朋友＝只認識沒有）……換成週六、週日兩則假的：只認識時週六有、週日也有（7 天內 2 則）',D.an3==='x:stage'&&D.t_an_a==='p'&&D.t_an_b==='p',J([D.an3,D.t_an_a,D.t_an_b]));
    check('3. 全部一天最多四則：第 10 週週六 08:00～12:00 五位各一則＝第五則（語彤 12:00）不出（x:day）',D.t_zq==='p'&&D.t_sis==='p'&&D.t_ps==='p'&&D.t_yt==='x:day',J([D.t_zq,D.t_sis,D.t_ps,D.t_yt]));
    check('3. 配角每人兩週最多一則：阿哲第 10 週週一有、第 11 週週一沒有（x:week）、第 12 週週二（十五天後）有',D.t_zhe1==='p'&&D.t_zhe2==='x:week'&&D.t_zhe3==='p',J([D.t_zhe1,D.t_zhe2,D.t_zhe3]));
    fresh(TD(10,1),8); who('heroine_01','FRIEND'); walk(TD(10,7),12,{step:0.5}); const D2=R().done;
    check('3. 以安朋友：第 10 週週五第 3 則有了，週六那則假的有（兩則），週日那則沒有（x:week：連續七天第三則）',D2.an3==='p'&&D2.t_an_a==='p'&&D2.t_an_b==='x:week',J([D2.an3,D2.t_an_a,D2.t_an_b])); }
  finally{ for(const x of add){ const i=P.indexOf(x); if(i>=0) P.splice(i,1); } }
  /* 大一上走一遍：七位都很熟（可昕交往中），聯絡方式都有 */
  fresh(DK('2025-09-01'),0,{dating_kexin:true}); for(const id of ['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin']) who(id,'CLOSE');
  const log=new Map(); const end=DK('2026-02-01');
  for(let t=T(H.G.day,0);t<=T(end,0);t+=0.5){ const dd=Math.floor(t/24); at(dd,t-dd*24); tickF(); PHONE.tick(H.G); for(const i of R().items) if(!log.has(i.id)) log.set(i.id,i); }
  const L=[...log.values()], byDay={}; for(const i of L) byDay[i.day]=(byDay[i.day]||0)+1;
  let worst=0, wid=''; for(const i of L){ const n=L.filter(j=>j.who===i.who&&T(j.day,j.h)<=T(i.day,i.h)&&T(i.day,i.h)-T(j.day,j.h)<7*24).length; if(n>worst){ worst=n; wid=i.id; } }
  const miss=FEED_Y1S1.posts.map(p=>p.id).filter(id=>!log.has(id));
  check('3. 大一上走一遍（七位都很熟）：44 則都出',L.length===44&&!miss.length,J({n:L.length,miss,done:miss.map(id=>R().done[id])}));
  check('3. 大一上走一遍：一天不超過四則（最多 '+Math.max(0,...Object.values(byDay))+'）、每位連續七天不超過兩則（最多 '+worst+'）',Math.max(0,...Object.values(byDay))<=4&&worst<=2,wid);
  const kx3=log.get('kx3'); check('3. 可昕第 3 則（沒去過政大、沒有 K1b）：照第一個能問的日子，第 6 週週四 12:30（予樂的宵夜在週三晚上）',!!kx3&&kx3.day===TD(6,4)&&Math.abs(kx3.h-12.5)<0.01,J(kx3)); });

/* ---------- 4 以安 ---------- */
sec('4',()=>{ const SAT=TD(10,6);
  const go=pick=>{ fresh(TD(10,5),8); who('heroine_01','CLOSE'); walk(SAT,10.1); const before=!dm('an_mom'); walk(SAT,10+12/60); const m=dm('an_mom'); if(pick!=null&&m) PHONE.answer(H.G,m.ask.id,pick); return {before,m}; };
  const {before,m}=go(null);
  check('4. 以安（很熟）第 10 週週五媽媽上台北，隔天 10:12 私訊兩則、三個選項',before&&!!m&&m.day===SAT&&Math.abs(m.h-(10+12/60))<0.02&&J(th('heroine_01').filter(x=>x.tag==='aa503_an_mom').map(x=>x.text))===J(['我媽昨天把我的手帳從頭翻到尾。','她說我寫的「想去的店」，一家都沒去。'])&&J(m.ask.opts.map(o=>o.t))===J(['那妳寒假去。','妳媽媽還說什麼？','（不回）']),J(m&&m.ask.opts.map(o=>o.t)));
  go(0); const r=th('heroine_01').slice(-2).map(x=>x.text);
  check('4. 「那妳寒假去。」→「……好。我寫進去了。」、記 AN_LIST（AN_MOM_DM list）',J(r)===J(['那妳寒假去。','……好。我寫進去了。'])&&H.G.flags.AN_LIST===true&&H.G.flags.AN_MOM_DM==='list',J(r));
  const F=H.G.flags; jump(DK('2026-01-17'),20); check('4. 1/17 19:40 第 8 則「第三家。」',!!item('an8')&&R().done.an8==='p');
  walk(DK('2026-01-18'),9.9); const a=th('heroine_01').some(x=>x.tag==='aa503_an_list'); walk(DK('2026-01-18'),10); const b=th('heroine_01').filter(x=>x.tag==='aa503_an_list');
  check('4. AN_LIST：隔天（1/18）10:00 多一則私訊「你說寒假去。我去了三家。剩下四家，我寫在下學期那一頁了。」',!a&&b.length===1&&b[0].text==='你說寒假去。我去了三家。剩下四家，我寫在下學期那一頁了。'&&b[0].day===DK('2026-01-18')&&b[0].h===10,J(b.map(x=>[x.day,x.h])));
  go(1); check('4. 「妳媽媽還說什麼？」→ 兩句（AN_MOM_DM more，沒有 AN_LIST）',J(th('heroine_01').slice(-3).map(x=>x.text))===J(['妳媽媽還說什麼？','她說我講話越來越像她。講很快，又不太讓別人插嘴。','我不知道這是不是稱讚。'])&&!H.G.flags.AN_LIST&&H.G.flags.AN_MOM_DM==='more');
  jump(DK('2026-01-18'),12); check('4. 沒有 AN_LIST：1/18 沒有那一則（x:need）',!th('heroine_01').some(x=>x.tag==='aa503_an_list')&&R().dm.an_list==='x:need',J(R().dm.an_list));
  go(2); check('4. 「（不回）」：不替你傳、沒有後續',th('heroine_01').slice(-1)[0].text==='她說我寫的「想去的店」，一家都沒去。'&&H.G.flags.AN_MOM_DM==='none');
  fresh(TD(10,5),8); who('heroine_01','FRIEND'); walk(SAT,11); check('4. 以安只是朋友（不到很熟）：沒有那一則私訊',!dm('an_mom')&&R().dm.an_mom==='x:stage'); });

/* ---------- 5 子晴 ---------- */
sec('5',()=>{ const SAT=TD(11,6);
  for(const [k,want,flag,post] of [[0,['欸 你幫我恭喜他 我講不出口'],'tell','他沒講。'],[1,['第三就是第三','下次'],'third','妳第三也很強。'],[2,[],'sticker','（貼圖：插座貓）']]){
    fresh(SAT,17); who('heroine_04','FRIEND'); walk(SAT,23.6); const m=dm('zq_practice'); const n=th('heroine_04').length; if(m) PHONE.answer(H.G,m.ask.id,k); const L=th('heroine_04').slice(n);
    check('5. 子晴練習賽（第 11 週週六）：18:00 第 3 則「第三」、23:30 私訊三則；選「'+(m?m.ask.opts[k].t:'?')+'」→ ZQ_PRACTICE '+flag,!!item('zq3')&&!!m&&Math.abs(m.h-23.5)<0.02&&J(th('heroine_04').filter(x=>x.tag==='aa503_zq_practice').map(x=>x.text))===J(['你室友第一','他都沒講？','……他真的很不會講'])
      &&H.G.flags.ZQ_PRACTICE===flag&&L[0].from==='player'&&L[0].text===post&&J(L.slice(1).map(x=>x.text))===J(want)&&!H.G.flags.KAI_COUNTED,J(L.map(x=>[x.from,x.text]))); } });

/* ---------- 6 可昕第 11 週報告 ---------- */
sec('6',()=>{ const TUE=TD(11,2), WED=TUE+1, THU=TUE+2;
  const go=(pick,o)=>{ o=o||{}; fresh(TUE,20,{dating_kexin:o.dating!==false}); if(o.lv) rel('kexin',o.lv); walk(TUE,23+10/60); const m=dm('kx_rpt'); const n=th('kexin').length; if(m&&pick!=null) PHONE.answer(H.G,m.ask.id,pick); return {m,L:th('kexin').slice(n)}; };
  let {m,L}=go(0);
  check('6. 第 11 週週二 23:10 三則（交往中）、三個選項；回覆到午夜',!!m&&Math.abs(m.h-(23+10/60))<0.02&&J(th('kexin').filter(x=>x.tag==='aa503_kx_rpt').map(x=>x.text))===J(['我們組有一個人消失了。','報告後天交。他那一段還是空的。','操。'])&&J(m.ask.opts.map(o=>o.t))===J(['我陪妳熬夜。','他人呢？','妳先睡，明天再做。'])&&m.ask.until===T(WED,0),J(m&&m.ask));
  const q=OUT.get(H.G,'aa503_kx_video'), ev=STORY_EVENTS.find(e=>e.id==='ev_kexin_video_report'), said=ev?ev.dialogue.filter(d=>d.text).map(d=>d.text):[];
  check('6. 「我陪妳熬夜。」→ 她回一句、KX_RPT stay；當晚 00:00 排視訊（接起來）；事件只有開頭「你念你的」、結尾「好了。睡覺。」、兩個小時',J(L.map(x=>x.text))===J(['我陪妳熬夜。','你在台大陪我熬夜？……好啊。視訊開著，你不要講話。'])&&H.G.flags.KX_RPT==='stay'&&!!q&&q.day===WED&&q.h===0&&q.ev==='ev_kexin_video_report'&&q.verb==='接起來'&&!!ev&&ev.trigger==='outing'&&ev.hours===2&&J(said)===J(['你念你的','好了。睡覺。'])&&ev.dialogue[0].bg==='video',J({q,said}));
  walk(THU,17.9); const a=th('kexin').some(x=>x.tag==='aa503_kx_rpt2'); walk(THU,18.1);
  check('6. 週四 18:00「報告交了。」「老師說我們那一段寫得最好。消失的那一段。」',!a&&J(th('kexin').filter(x=>x.tag==='aa503_kx_rpt2').map(x=>x.text))===J(['報告交了。','老師說我們那一段寫得最好。消失的那一段。']));
  ({m,L}=go(1)); walk(THU,18.1);
  check('6. 「他人呢？」→ 兩句（KX_RPT who）、不排視訊；週四那一則也有',J(L.map(x=>x.text))===J(['他人呢？','邵鈞說他去宜蘭。宜蘭耶。','我明天要在群組裡講清楚。講清楚，不罵他。'])&&H.G.flags.KX_RPT==='who'&&!OUT.get(H.G,'aa503_kx_video')&&th('kexin').some(x=>x.tag==='aa503_kx_rpt2'));
  ({m,L}=go(2));
  check('6. 「妳先睡，明天再做。」→「你不懂。……算了，我自己來。」＋旁白「（她已讀，沒有再傳。）」（不是她說的）',J(L.map(x=>x.text))===J(['妳先睡，明天再做。','你不懂。……算了，我自己來。','（她已讀，沒有再傳。）'])&&!L[2].from&&L[1].from==='kexin'&&H.G.flags.KX_RPT==='sleep');
  if(typeof MSG!=='undefined'&&MSG.replyAt){ const no=(id)=>{ const hd=R().hold; R().hold={}; const r=MSG.replyAt(H.G,id); R().hold=hd; return r; };
    at(TUE,23.5); const r1=MSG.replyAt(H.G,'kexin'), r1n=no('kexin'), r4=MSG.replyAt(H.G,'heroine_01'), r4n=no('heroine_01'); at(WED,9); const r2=MSG.replyAt(H.G,'kexin'); at(WED,13); const r3=MSG.replyAt(H.G,'kexin'), r3n=no('kexin');
    check('6. 隔天中午才回下一則：週二 23:30、週三 09:00 傳訊息給她＝週三 12:00 才回（原本 '+J(r1n)+'）；週三 13:00 以後照平常；別人（以安）不受影響',T(r1.day,r1.h)===T(WED,12)&&T(r1n.day,r1n.h)<T(WED,12)&&T(r2.day,r2.h)===T(WED,12)&&J(r3)===J(r3n)&&J(r4)===J(r4n),J({r1,r2,r3,r4})); }
  else check('6. 隔天中午才回下一則（MSG.replyAt）',false,'msg3d.js 沒有載到');
  walk(THU,18.1); check('6. 先睡：週四那一則也有',th('kexin').some(x=>x.tag==='aa503_kx_rpt2'));
  ({m,L}=go(null)); at(WED,0.1); check('6. 過了午夜就不能回',!!m&&!PHONE.askOpen(H.G,m)); walk(THU,18.1); check('6. 沒回：週四那一則也有（她的事照日期發生）',th('kexin').some(x=>x.tag==='aa503_kx_rpt2'));
  ({m}=go(null,{dating:false,lv:'FRIEND'})); check('6. 沒有交往、朋友：也有那一則',!!m);
  ({m}=go(null,{dating:false,lv:'ACQ'})); walk(THU,18.1); check('6. 沒有交往、只認識：沒有（週四那一則也沒有）',!m&&!th('kexin').some(x=>x.tag==='aa503_kx_rpt2')&&R().dm.kx_rpt==='x:stage'&&R().dm.kx_rpt2==='x:after',J(R().dm)); });

/* ---------- 7 沛珊、芷若、語彤、學姊 ---------- */
sec('7',()=>{ const TUE=TD(10,2);
  const ps=(lv,pick)=>{ fresh(TUE,20); who('classmate_peishan',lv); walk(TUE,23.3); const m=dm('ps_phil'); const n=th('classmate_peishan').length; if(m&&pick!=null) PHONE.answer(H.G,m.ask.id,pick); return {m,L:th('classmate_peishan').slice(n)}; };
  let {m}=ps('FAM',null);
  check('7. 沛珊（有點熟）第 10 週週二 23:15 四則、三個選項',!!m&&Math.abs(m.h-(23+15/60))<0.02&&J(th('classmate_peishan').filter(x=>x.tag==='aa503_ps_phil').map(x=>x.text))===J(['欸，我跟你說一件事，你不用回喔。','哲學概論的期中報告，我交給老師了。我沒有修那門課。','老師還是改了，最後寫了一行：「為什麼不修？」','……你覺得我要怎麼回他？'])&&J(m.ask.opts.map(o=>o.t))===J(['說妳是法律系的。','明年修。','不用回，繼續旁聽。']));
  for(const [k,flag,want] of [[0,'law',['好。可是這樣他一定會問第二個問題。']],[1,'next',['明年……好！！我寫在行事曆上。']],[2,'audit',['嗯。我比較喜歡旁聽。修了會有分數。']]]){ const {L}=ps('FRIEND',k); check('7. 沛珊選第 '+(k+1)+' 個 → '+want[0]+'（PS_PHIL_DM '+flag+'）',J(L.slice(1).map(x=>x.text))===J(want)&&H.G.flags.PS_PHIL_DM===flag); }
  ({m}=ps('ACQ',null)); check('7. 沛珊只認識：沒有',!m&&R().dm.ps_phil==='x:stage');
  /* 芷若 */
  const W13=TD(13,7); fresh(W13,20); who('heroine_02','FRIEND'); walk(W13,22.2);
  check('7. 芷若冬季菜單（第 13 週週日 22:07，朋友）：三則',J(th('heroine_02').filter(x=>x.tag==='aa503_zr_menu').map(x=>x.text))===J(['冬季菜單出來了。','小婷的黑糖拿鐵上了。我的沒上。','老闆說我的太苦。……我下班還是會自己做來喝。']));
  fresh(W13,20); who('heroine_02','FRIEND'); SOCIAL.remember('heroine_02','ASKED_HER_DRINK','她下班前'); walk(W13,22.2);
  check('7. 問過她自己喝什麼（ASKED_HER_DRINK）：第三則換成「就是我上次跟你說的那一杯。老闆說太苦。」',J(th('heroine_02').filter(x=>x.tag==='aa503_zr_menu').map(x=>x.text))===J(['冬季菜單出來了。','小婷的黑糖拿鐵上了。我的沒上。','就是我上次跟你說的那一杯。老闆說太苦。']));
  const W11=TD(11,3); for(const [k,flag,want] of [[0,'filled',['還沒。……截止日還很久。']],[1,'where',['英國吧。……我隨便說的。']],[2,'none',[]]]){ fresh(W11,20); who('heroine_02','FRIEND'); walk(W11,22.2); const mm=dm('zr_exch'); const n=th('heroine_02').length; PHONE.answer(H.G,mm.ask.id,k); const L=th('heroine_02').slice(n);
    check('7. 芷若交換說明會（第 11 週週三 22:07）選第 '+(k+1)+' 個（ZR_EXCH_DM '+flag+'）',J(th('heroine_02').filter(x=>x.tag==='aa503_zr_exch').map(x=>x.text))===J(['今天去了交換說明會。','拿了表格。表格現在在吧檯下面。'])&&J(L.filter(x=>x.from!=='player').map(x=>x.text))===J(want)&&H.G.flags.ZR_EXCH_DM===flag&&(k===2?L.length===0:L[0].from==='player')); }
  /* 語彤 */
  const W9=TD(9,4); for(const [k,flag,want] of [[0,'fast',['她說正常人不會那麼快。……我只是想快點結束。']],[1,'xh',['她還差十二個人。……我叫阿姨問店裡的客人。']],[2,'none',[]]]){ fresh(W9,20); who('heroine_03','FRIEND'); walk(W9,20.8); const mm=dm('yt_subject'); const n=th('heroine_03').length; PHONE.answer(H.G,mm.ask.id,k); const L=th('heroine_03').slice(n);
    check('7. 語彤當筱涵的受試者（第 9 週週四：20:40 第 3 則、20:45 三則）選第 '+(k+1)+' 個（YT_SUBJECT_DM '+flag+'）',!!item('yt3')&&J(th('heroine_03').filter(x=>x.tag==='aa503_yt_subject').map(x=>x.text))===J(['今天當筱涵的受試者。','看螢幕，看到就按。四十分鐘。','她說我太快，那一份資料不能用。'])&&J(L.filter(x=>x.from!=='player').map(x=>x.text))===J(want)&&H.G.flags.YT_SUBJECT_DM===flag); }
  /* 學姊 */
  const D=DK('2026-01-18'); fresh(D,20); who('heroine_05','CLOSE'); walk(D,22.8); const s=th('heroine_05').filter(x=>x.tag==='aa503_sis_ch3');
  check('7. 學姊（很熟）1/18 22:40「第三章讀完了。」「這一章讀了四次。第四次才覺得它在講人。」，不用回',J(s.map(x=>x.text))===J(['第三章讀完了。','這一章讀了四次。第四次才覺得它在講人。'])&&!s.some(x=>x.ask));
  fresh(D,20); who('heroine_05','FRIEND'); walk(D,22.8); check('7. 學姊只是朋友：沒有',!th('heroine_05').some(x=>x.tag==='aa503_sis_ch3')); });

/* ---------- 8 分開以後一學期 ---------- */
sec('8',()=>{ const MON=TD(3,1); fresh(MON,10,{dating_kexin:true}); rel('kexin','ACQ'); ROM.end(H.G,'kexin','apart_talk');
  check('8. 和可昕分開（第 3 週週一）：FEED.kxCool＝true（到下一個學期第 1 週）',H.G.flags.dating_kexin===false&&FEED.kxCool(H.G)===true);
  walk(TD(12,4),23.95,{step:1}); const D=R().done, X=R().dm;
  check('8. 這一學期她的動態不出現（第 5、9、12 週都是 x:cool）、第 11 週報告的私訊也不傳',D.kx2==='x:cool'&&D.kx4==='x:cool'&&D.kx5==='x:cool'&&X.kx_rpt==='x:cool'&&!th('kexin').some(x=>/^aa503_/.test(x.tag||'')),J({D,X}));
  jump(DK('2026-01-24'),20); check('8. 寒假（還在同一段）也沒有：1/24 第 8 則 x:cool',R().done.kx8==='x:cool');
  const P=FEED_Y1S1.posts, t={id:'t_kx_after',who:'kexin',t:'2026-02-24 12:00',st:'認識',pic:'測試',say:'t',cm:null,dm:null}; P.push(t);
  try{ jump(DK('2026-02-24'),12.5); check('8. 下一個學期第 1 週起：照朋友的階段再出現（大一下第 1 週一則假的，認識＝出）',FEED.kxCool(H.G)===false&&R().done.t_kx_after==='p',J(R().done.t_kx_after)); }
  finally{ P.splice(P.indexOf(t),1); } });

/* ---------- 9 可昕的四則改成動態 ---------- */
sec('9',()=>{ const SAT=TD(5,6);
  fresh(SAT-1,8,{dating_kexin:true}); H.G.flags.KX_BBQ_NO=true; walk(SAT,21,{rules:true,step:0.5}); const k2=item('kx2');
  check('9. 玉米：「妳去妳們系的。」＝不再私訊烤玉米的照片（kx_bbq_corn）；動態第 2 則 20:30「我們的玉米比較好。」、沒去的照片',!(H.G.msgs||[]).some(x=>x.tag==='kx_bbq_corn')&&!!k2&&k2.v==='no'&&Math.abs(k2.h-20.5)<0.01&&HT().includes('（照片：一串烤玉米，焦的那一面朝上）')&&HT().includes('我們的玉米比較好。'),J(k2));
  fresh(SAT-1,8,{dating_kexin:true}); H.G.flags.KX_BBQ_COME=true; H.G.events.done.ev_mid_autumn_bbq=SAT; walk(SAT,21,{rules:true,step:0.5});
  check('9. 玉米：她來了、烤肉有去＝照片裡有你的手',!!item('kx2')&&item('kx2').v==='yes'&&HT().includes('（照片：一串烤玉米，旁邊一隻手在搶——是你的手）'));
  fresh(SAT-1,8,{dating_kexin:true}); H.G.flags.KX_BBQ_COME=true; walk(SAT,21,{rules:true,step:0.5}); check('9. 玉米：說了來我們這邊、烤肉沒去＝沒去的照片（一定出）',!!item('kx2')&&item('kx2').v==='no');
  /* 紙皇冠 */
  const ASK=TD(6,2); fresh(ASK,16,{dating_kexin:true,NCCU_VISITED:true,kxYuleAskDay:ASK,KX_YULE:'no'}); H.G.msgs=[{day:ASK,h:15.5,th:'p:kexin',from:'kexin',who:'kexin',text:'明天晚上有空嗎？',tag:'kx_yule_ask'}];
  walk(ASK+2,13,{rules:true,step:0.5}); let k3=item('kx3');
  check('9. 紙皇冠：「這週不行」＝不再私訊（kx_yule_crown）；動態第 3 則在宵夜那一晚之後隔天 12:30',!(H.G.msgs||[]).some(x=>x.tag==='kx_yule_crown')&&!!k3&&k3.day===ASK+2&&Math.abs(k3.h-12.5)<0.01&&k3.v==='no',J(k3));
  if(HAS()) FEED.respond(H.G,'kx3','cm'); check('9. 紙皇冠：沒去的留言「女王好。」→「她說謝謝。她說下次要見你本人。」',J(th('kexin').slice(-2).map(x=>x.text))===J(['女王好。','她說謝謝。她說下次要見你本人。']));
  fresh(ASK,16,{dating_kexin:true,NCCU_VISITED:true,kxYuleAskDay:ASK,KX_YULE:'yes',yulePassDay:ASK+1}); H.G.outings=[{id:'kx_yule',ev:'ev_kexin_yule_pass',day:ASK+1,h:19.5,state:'done'}]; walk(ASK+2,13,{rules:true,step:0.5}); k3=item('kx3');
  if(HAS()) FEED.respond(H.G,'kx3','cm'); check('9. 紙皇冠：有去＝一樣出（隔天 12:30），留言回「她說謝謝。她說你及格了。」',!!k3&&k3.day===ASK+2&&k3.v==='yes'&&th('kexin').slice(-1)[0].text==='她說謝謝。她說你及格了。',J(k3));
  fresh(ASK,16,{dating_kexin:true,NCCU_VISITED:true,kxYuleAskDay:ASK,KX_YULE:'yes'}); H.G.outings=[{id:'kx_yule',ev:'ev_kexin_yule_pass',day:ASK+1,h:19.5,state:'planned'}]; walk(ASK+1,12,{step:0.5});
  check('9. 紙皇冠：答應了、還沒去＝先等（不先貼沒去的版本）',!item('kx3')&&!R().done.kx3);
  /* 酸辣湯餃（12/3）*/
  const BD=DK('2025-12-03'); fresh(BD,6,{dating_kexin:true}); walk(BD,23.95,{rules:true,step:0.5}); const none=(H.G.msgs||[]).filter(x=>x.tag==='kx_dec3_none').map(x=>x.text);
  let h6=HT();
  check('9. 酸辣湯餃：什麼都沒做＝22:30 私訊只剩「一個人吃了。很好吃。下次你要來。」（照片改成動態）；23:30 動態第 6 則（交完報告那晚，沒去的版本：一碗、空的資料夾、「交了。」）',J(none)===J(['一個人吃了。很好吃。下次你要來。'])&&!!item('kx6')&&Math.abs(item('kx6').h-23.5)<0.01&&item('kx6').v==='no'&&h6.includes('（照片：一碗酸辣湯餃，旁邊一個空的資料夾）')&&h6.includes('<div>交了。</div>'),J([none,item('kx6')]));
  check('9. 第 6 則沒去的版本：留言「辛苦了。」、私訊問「一個人吃？」',h6.includes('data-fd="kx6|cm">辛苦了。<')&&h6.includes('一個人吃？')&&!h6.includes('好吃嗎？'));
  if(HAS()) FEED.respond(H.G,'kx6','cm'); check('9. 第 6 則沒去：留言「辛苦了。」→「下一份下禮拜。」',J(th('kexin').slice(-2).map(x=>x.text))===J(['辛苦了。','下一份下禮拜。']),J(th('kexin').slice(-2).map(x=>x.text)));
  fresh(BD,6,{}); who('kexin','ACQ'); walk(BD,23.95,{rules:true,step:0.5});
  if(HAS()) FEED.respond(H.G,'kx6','dm'); check('9. 第 6 則沒去（沒有在交往、只認識也有）：私訊問「一個人吃？」→「予樂在趕她的報告。……有點悲壯。」',!!item('kx6')&&J(th('kexin').slice(-2).map(x=>x.text))===J(['一個人吃？','予樂在趕她的報告。……有點悲壯。']),J(th('kexin').slice(-2).map(x=>x.text)));
  fresh(BD,6,{dating_kexin:true,KX_DEC3_VISIT:true}); walk(BD,23.95,{rules:true,step:0.5}); h6=HT();
  check('9. 酸辣湯餃：那晚開車去政大（KX_DEC3_VISIT）也一定出，去了的版本：兩碗、你的湯喝光了；私訊問「好吃嗎？」',!!item('kx6')&&item('kx6').v==='yes'&&!(H.G.msgs||[]).some(x=>x.tag==='kx_dec3_none')&&h6.includes('（照片：兩碗酸辣湯餃，對面那一碗的湯喝光了——是你的）')&&h6.includes('好吃嗎？')&&!h6.includes('一個人吃？'),J(item('kx6')));
  if(HAS()) FEED.respond(H.G,'kx6','dm'); check('9. 第 6 則去了：私訊問「好吃嗎？」→「你把湯喝光了。我就當你說好吃。」',J(th('kexin').slice(-2).map(x=>x.text))===J(['好吃嗎？','你把湯喝光了。我就當你說好吃。']),J(th('kexin').slice(-2).map(x=>x.text)));
  fresh(BD,6,{dating_kexin:true,KX_DEC3_VISIT:true}); walk(BD,23.95,{rules:true,step:0.5});
  if(HAS()) FEED.respond(H.G,'kx6','cm'); h6=HT(); check('9. 第 6 則去了：留言「辛苦了。」→「你也是。開車上山。」；動態頁上回過的那一則照去了的版本',J(th('kexin').slice(-2).map(x=>x.text))===J(['辛苦了。','你也是。開車上山。'])&&h6.includes('你也是。開車上山。'),J(th('kexin').slice(-2).map(x=>x.text)));
  fresh(BD,6,{dating_kexin:true,KX_DEC3:{1:'visit'}}); walk(BD,23.95,{step:0.5}); check('9. 第 6 則：只記了 KX_DEC3 {1:"visit"}（phoneRules 換過的）也算去了',!!item('kx6')&&item('kx6').v==='yes',J(item('kx6')));
  /* 書桌照 */
  const VD=TD(16,2); fresh(VD,19,{dating_kexin:true,KX_VIDEO:'no'}); walk(VD,23.5,{rules:true,step:0.5}); const ph=(H.G.msgs||[]).filter(x=>x.tag==='kx_video_photo').map(x=>x.text);
  check('9. 書桌照：視訊「今天不行。」＝23:00 私訊照舊「📷（她的書桌）」「我自己讀了。你欠我一次。」（她說了讀完傳照片給你；d13ab3ab7 第 12 節第 2 點）',J(ph)===J(['📷（她的書桌）','我自己讀了。你欠我一次。']),J(ph));
  { const W9W=TD(9,3); fresh(W9W,20,{}); who('kexin','FRIEND'); walk(W9W,23); const h4=HT(); if(HAS()) FEED.respond(H.G,'kx4','dm');
    check('9. 第 4 則（第 9 週週三 22:40）：私訊問「為什麼爬好幾趟？」→「一直忘東西。」',h4.includes('為什麼爬好幾趟？')&&!h4.includes('為什麼爬五次？')&&J(th('kexin').slice(-2).map(x=>x.text))===J(['為什麼爬好幾趟？','一直忘東西。']),J(th('kexin').slice(-2).map(x=>x.text))); }
  for(const v of ['no','yes']){ fresh(DK('2026-01-24'),12,{dating_kexin:true,KX_VIDEO:v}); walk(DK('2026-01-24'),20); check('9. 書桌照＝第 8 則 1/24 19:30（KX_VIDEO '+v+' 都出）',!!item('kx8')&&Math.abs(item('kx8').h-19.5)<0.01&&HT().includes('（照片：一張書桌，一本民法，旁邊一杯手搖飲）')); } });

/* ---------- 10 畫面 ---------- */
sec('10',()=>{ fresh(TD(13,5),8); who('heroine_03','ACQ'); who('classmate_peishan','CLOSE'); walk(TD(13,7),16.5);
  check('10. 新的動態：小點（newCount）',FEED.newCount(H.G)===2,J(FEED.newCount(H.G)));
  const h=HT(); const i1=h.indexOf('大稻埕的老房子'), i2=h.indexOf('夜行列車與貓');
  check('10. 最新的在上面（週日 16:00 語彤在週六 01:10 沛珊上面）、照片寫成「（照片：……）」、沒有字的那則只有照片、三個回應按鈕',i1>0&&i2>i1&&h.includes('（照片：大稻埕的老房子，窗戶有一盆花）')&&h.includes('data-fd="yt4|heart"')&&h.includes('>（按愛心）<')&&h.includes('>大稻埕？<')&&h.includes('（私訊問一句）')&&h.includes('妳常去？'));
  check('10. 看過就熄（markSeen）',FEED.newCount(H.G)===0);
  check('10. 動態不算手機的未讀',PHONE.unread(H.G)===0,J(PHONE.unread(H.G)));
  walk(TD(14,6),2); check('10. 只顯示七天：第 13 週週六 01:10 那一則，第 14 週週六 02:00 已經不在畫面上',!HT().includes('夜行列車與貓'));
  FEED.respond(H.G,'yt4','heart'); const h2=HT(); check('10. 回過的那一則：按鈕換成結果',h2.includes('♥ 你按了愛心。')&&!h2.includes('data-fd="yt4|'));
  HT(); walk(TD(15,4),22); FEED.respond(H.G,'an5','cm');   /* 以安沒有聯絡方式：沒有 an5 */
  check('10. 沒有她的聯絡方式：動態頁上沒有她',!HT().includes('民總。剩六張。')); });

H.done();
