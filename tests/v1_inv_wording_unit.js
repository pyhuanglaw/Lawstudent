// 邀約的口語改寫（V1-INV-WORDING）：AA_194 第 4 節（AA 的六位，企劃線 f7b96efb8）、BB_172 第 5、6、8 節＋第 10 節（阿凱、明軒、方奕廷，企劃線 968473469）——不需要瀏覽器。
//   0  每一句新的都在企劃原文裡一字不差（AA_194／BB_172 第 10 節取代同 id 的改稿）
//   1  交換聯絡方式：以安、語彤、柏翰、芯慈（AA_194）、明軒、方奕廷（BB_172 10-2 第 15 點）；Alison 照留
//   2  一起走：以安去 Café、語彤下雨（AA_194）；阿凱大一的兩句（K1、K2 選項句）、明軒三句（M2～M4）、方奕廷三句（F2～F4，F4 要看過 Z6＝FANG_HINT）
//   3  答應：阿哲（AA_194）；阿凱、明軒的手機／當面兩版（BB_172 10-1 第 17 點）；明軒 M8、M9；方奕廷 F6～F8
//   4  規則：以安大一散步只有第一次問、之後「好。」（AA_194 改規則）；芯慈兩句換字（判斷不變）；柏翰拿掉「……」；阿凱半熟早上、總圖；明軒家教的三種改天（{zh}）
//   5  AA_415 的「現有」沒動（以安、語彤、可昕那幾格照 AA_415；build_replies.py 照樣通過）
//   6  手機約、當面約（INV.flow）：手機念手機版、當面念當面版
// 修改前（開發分支 74667bd2b）：這幾句還是舊的——FAIL。用法：node tests/v1_inv_wording_unit.js
require('./alison.js');   // 讀企劃稿（git show）照匯入工具同一套換：Alison、虛構校名（WORLD-RENAME-1030，docs/WORLD_NAMING.md）
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (INVITE_REPLIES)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ load('src/data/invite_replies.js'); }catch(e){ ok=false; err=String(e); }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const txt=ls=>(ls||[]).map(x=>typeof x==='string'?x:x.me).join('');
const D=INVITE_DATA, P=D.people, EX=D.exchange;
const fresh=(key,id,fam,trust,o)=>{ H.fresh(key,(o&&o.hour!=null)?o.hour:9,'campus'); if(id){ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; SOCIAL.remember(id,'FIRST_MET',''); } return H.G; };
const ask=(id,pid,h,day,face)=>{ const G=H.G; day=day==null?G.day:day; const d=INV.decide(G,id,pid,day,h); if(face) d.face=true; return INV.personal(G,id,INV.place(pid),day,h,d); };
const doneIv=(id,pid,day)=>{ const G=H.G; INV.rec(G); G.invSeq=(G.invSeq|0)+1; G.invites.push({id:'iv'+G.invSeq,who:id,place:pid,zone:INV.place(pid).zone,day,h:15.5,state:'done',accepted:true,by:'player'}); };
const termDay=(id,week,wd)=>{ const r=CALENDAR.termDays(id); for(let d=r.from;d<=r.to;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===id&&t.week===week&&CALENDAR.dateOf(d).wd%7===wd) return d; } return null; };
const key=d=>CALENDAR.dateOf(d).key;
const AA194='docs/story_planning/AA_194_大一上口語改寫對照_AA人物.md', BB172='docs/story_planning/BB_172_AB65_大一上第2批_邀約同行_BB人物.md';
const show=(sha,p)=>{ try{ return cp.execSync('git -C "'+H.ROOT+'" show '+sha+':"'+p+'"',{encoding:'utf8'}); }catch(e){ return ''; } };
/* 這次換上去的句子（企劃原文）：[來源, 句子] */
const NEW=[['A','「好。」'],['A','（她把手機遞過來，自己先掃了你的。）'],['A','「加了。」'],['A','「你有在看考古題嗎？有的話我傳給你。」'],['A','「我加你了。」'],['A','「有缺講義的話跟我說，我都有拍。」'],
  ['A','「你寫題目都先想要件，還是先想結論？我都先想結論，最近在改。」'],['A','「沒事啦。」'],['A','「好啊！那家的乾麵我可以吃兩碗。」'],['A','「我要念書，{zh}可以。」'],['A','「好，我記一下。」'],['A','「今天的我都排好了，{zh}可以嗎？」'],
  ['B','「我們那層的洗衣機又壞了，我衣服已經堆三天了。」'],['B','「欸，你們法律系的，路邊機車停在騎樓擋路，可以告嗎？」'],['B','「喔，所以告跟叫警察不一樣。好，我學到了。」'],['B','「沒有啦，我只是想知道我能不能。」'],['B','「好，你吃。」'],['B','（過了十秒）'],['B','「……吃完了嗎？」'],
  ['B','「十二點？好，那是我的早餐。」'],['B','「茶屋要脫鞋嗎？……好，我襪子有洞。」'],['B','「那裡有插座嗎 我要帶電腦」'],['B','「那裡有插座嗎？我要帶電腦。」'],['B','「走 我剛好還沒吃」'],['B','「走，我剛好還沒吃。」'],['B','「散步要幹嘛？」'],['B','「好。」'],['B','「早上不行，我在睡覺。」'],['B','「總圖我會睡著。」'],['B','「考前一週我會去，真的。」'],
  ['B','「好。二四六晚上我在家教，九點以後才會回。」'],['B','「我家教那個學生問我，念法律是不是要背很多東西。」'],['B','「我跟他說，要背，背完還要會用。」'],['B','「我爸之前傳訊息問我『籃球的三分線是畫在哪裡』。」'],['B','「他在看我們比賽的直播。……到現在還是看不懂。」'],['B','「這條路我每個禮拜都走好幾次，去家教都走這邊。」'],
  ['B','「早午餐？CP 值不高喔……好啦，週末可以。」'],['B','「一盞？我很少喝茶，我爸才喝。……好啊。」'],['B','「走啊，阿鳳便宜又大碗。」'],['B','「可以啊。走一走也好，我最近都坐著。」'],['B','「那時候我在家教 九點以後可以」'],['B','「那時候我在家教，九點以後可以。」'],
  ['B','「我七點要家教 {zh}可以嗎」'],['B','「我七點要家教，{zh}可以嗎？」'],['B','「家教完 {zh} 吃便宜的那家」'],['B','「家教完，{zh}，吃便宜的那家。」'],['B','「那天我要家教 {zh}可以嗎」'],['B','「那天我要家教，{zh}可以嗎？」'],
  ['B','（他的大頭貼是一棵樹。）'],['B','「椰影大道的大王椰子，葉子一片好幾公斤，掉下來會砸傷人。」'],['B','「走那邊我都走中間。」'],['B','「這棵是樟樹。這棵是菩提。那棵……我不知道欸，我回去查。」'],['B','「芷若高中就這樣，下課都是她在講。」'],
  ['B','「好。聽說那邊院子有一棵很老的樟樹，我想去看看。」'],['B','「好。順便看一下 Café 窗台那盆植物。」'],['B','「好。我在總圖門口等你。」']];

(async()=>{
await sec(0,()=>{ const a=show('f7b96efb8',AA194), b=show('968473469',BB172); const a4=a.slice(a.indexOf('## 4.'));
  check('0. 讀得到企劃線 AA_194（f7b96efb8）第 4 節、BB_172（968473469）第 10 節',a4.includes('| rule 芯慈 |')&&b.includes('## 10. AA-B 互審'));
  const bad=NEW.filter(([s,t])=>!(s==='A'?a4:b).includes(t)); check('0. 換上去的 '+NEW.length+' 句都在企劃原文裡一字不差',NEW.length===56&&!bad.length,J(bad));
  const src=fs.readFileSync(path.join(H.ROOT,'src/data/invites.js'),'utf8'); const gone=NEW.filter(([s,t])=>!src.includes(t.replace(/^「|」$/g,'')));
  check('0. 每一句都在 src/data/invites.js',!gone.length,J(gone)); });

await sec(1,()=>{ check('1. 以安交換聯絡方式：「好。」（她把手機遞過來，自己先掃了你的。）「加了。」（AA_194）',J(EX.heroine_01)===J([{say:'「好。」'},{narr:'（她把手機遞過來，自己先掃了你的。）'},{say:'「加了。」'}]));
  check('1. 語彤：「好。」＋旁白照留（不用「嗯。」開頭）',J(EX.heroine_03)===J([{say:'「好。」'},{narr:'（她把手機推過來，畫面已經停在加好友那一頁。）'}]));
  check('1. 柏翰：「好。」「你有在看考古題嗎？有的話我傳給你。」',J(EX.classmate_bohan)===J([{say:'「好。」'},{say:'「你有在看考古題嗎？有的話我傳給你。」'}]));
  check('1. 芯慈：「我加你了。」「有缺講義的話跟我說，我都有拍。」',J(EX.classmate_xinci)===J([{say:'「我加你了。」'},{say:'「有缺講義的話跟我說，我都有拍。」'}]));
  check('1. Alison 照留',J(EX.yu)===J([{say:'「欸你還不在我的群組裡？我拉你。三個。」'}]));
  check('1. 明軒：「好。二四六晚上我在家教，九點以後才會回。」（BB_172 10-2 第 15 點）',J(EX.classmate_mingxuan)===J([{say:'「好。二四六晚上我在家教，九點以後才會回。」'}]));
  check('1. 方奕廷：「好。」（他的大頭貼是一棵樹。）',J(EX.npc_fangyt)===J([{say:'「好。」'},{narr:'（他的大頭貼是一棵樹。）'}])); });

await sec(2,()=>{ fresh('2025-10-15','heroine_01',45,30); let pk=INV.walkPick(H.G,'heroine_01','cafe');
  check('2. 以安去 Café 的路上：「你寫題目都先想要件，還是先想結論？我都先想結論，最近在改。」',!!pk&&txt(pk.lines)==='「你寫題目都先想要件，還是先想結論？我都先想結論，最近在改。」',pk&&txt(pk.lines));
  H.G.weather='rain'; pk=INV.walkPick(H.G,'heroine_03','noodle'); check('2. 語彤下雨：旁白＋「沒事啦。」',!!pk&&pk.lines[1]==='「沒事啦。」'&&pk.lines.length===2,pk&&J(pk.lines)); H.G.weather='clear';
  fresh('2025-10-15','kai',25); H.G.flags.walkChatN={}; pk=INV.walkPick(H.G,'kai','cafe');
  check('2. 阿凱大一（不是去吃飯）：「我們那層的洗衣機又壞了，我衣服已經堆三天了。」（K1）',!!pk&&txt(pk.lines)==='「我們那層的洗衣機又壞了，我衣服已經堆三天了。」',pk&&txt(pk.lines));
  const e=INV.walkEntry('kai','KAI_SCOOTER_ASK');
  check('2. 阿凱 K2：問句＋三個回答（③「好，你吃。」（過了十秒）「……吃完了嗎？」）；選項照舊',!!e&&e.l[0]==='「欸，你們法律系的，路邊機車停在騎樓擋路，可以告嗎？」'&&J(e.ch.map(c=>c.t))===J(['不一定是告，可以請警察來看','你想告誰','先讓我吃完'])
    &&J(e.ch[0].r)===J(['「喔，所以告跟叫警察不一樣。好，我學到了。」'])&&J(e.ch[1].r)===J(['「沒有啦，我只是想知道我能不能。」'])&&J(e.ch[2].r)===J(['「好，你吃。」','（過了十秒）','「……吃完了嗎？」']),J(e));
  check('2. 明軒三句（M2 10-1 第 16 點、M3 10-1 第 7 點、M4）',J(P.classmate_mingxuan.walk.any)===J([['「我家教那個學生問我，念法律是不是要背很多東西。」','「我跟他說，要背，背完還要會用。」'],['「我爸之前傳訊息問我『籃球的三分線是畫在哪裡』。」','「他在看我們比賽的直播。……到現在還是看不懂。」'],['「這條路我每個禮拜都走好幾次，去家教都走這邊。」']]));
  const F=P.npc_fangyt.walk.any; check('2. 方奕廷 F2、F3',J(F[0])===J(['「椰影大道的大王椰子，葉子一片好幾公斤，掉下來會砸傷人。」','「走那邊我都走中間。」'])&&J(F[1])===J(['「這棵是樟樹。這棵是菩提。那棵……我不知道欸，我回去查。」']));
  fresh('2025-10-15','npc_fangyt',45,30); SOCIAL.remember('heroine_02','FIRST_MET',''); const seen=[]; for(let i=0;i<6;i++){ const q=INV.walkPick(H.G,'npc_fangyt','cafe'); seen.push(txt(q.lines)); q.next(); }
  check('2. 方奕廷 F4：認識芷若、還沒看過 Z6（FANG_HINT）不說芷若那句（10-1 第 9 點改條件）',!seen.some(t=>/芷若/.test(t)),J(seen));
  SOCIAL.remember('npc_fangyt','FANG_HINT',''); const seen2=[]; for(let i=0;i<3;i++){ const q=INV.walkPick(H.G,'npc_fangyt','cafe'); seen2.push(txt(q.lines)); q.next(); }
  check('2. 看過 Z6 以後：「芷若高中就這樣，下課都是她在講。」',seen2.includes('「芷若高中就這樣，下課都是她在講。」'),J(seen2)); });

await sec(3,()=>{ const MON=termDay('Y1S1',6,1); fresh(key(MON),'zhe',30,10);
  check('3. 阿哲約吃飯：「好啊！那家的乾麵我可以吃兩碗。」（AA_194）',txt(ask('zhe','noodle',12+10/60).lines)==='「好啊！那家的乾麵我可以吃兩碗。」');
  fresh(key(MON),'kai',30,10);
  check('3. 阿凱約吃飯：手機「走 我剛好還沒吃」、當面「走，我剛好還沒吃。」（K6）',txt(ask('kai','noodle',12+10/60).lines)==='「走 我剛好還沒吃」'&&txt(ask('kai','noodle',12+10/60,null,true).lines)==='「走，我剛好還沒吃。」');
  check('3. 阿凱約 Café（認識）：手機「那裡有插座嗎 我要帶電腦」、當面「那裡有插座嗎？我要帶電腦。」（K5）',txt(ask('kai','cafe',15.5).lines)==='「那裡有插座嗎 我要帶電腦」'&&txt(ask('kai','cafe',15.5,null,true).lines)==='「那裡有插座嗎？我要帶電腦。」');
  const SAT=termDay('Y1S1',6,6); fresh(key(SAT),'kai',45,30);
  check('3. 阿凱約半熟 12:10：手機照留「十二點 好 那是我的早餐」、當面「十二點？好，那是我的早餐。」（K3）',txt(ask('kai','brunch',12+10/60).lines)==='「十二點 好 那是我的早餐」'&&txt(ask('kai','brunch',12+10/60,null,true).lines)==='「十二點？好，那是我的早餐。」');
  check('3. 阿凱約一盞：手機照留、當面「茶屋要脫鞋嗎？……好，我襪子有洞。」（K4，10-2 第 10 點）',txt(ask('kai','teahouse',14).lines)==='「茶屋要脫鞋嗎 好 我襪子有洞」'&&txt(ask('kai','teahouse',14,null,true).lines)==='「茶屋要脫鞋嗎？……好，我襪子有洞。」');
  check('3. 阿凱第一次約溫州街：手機照留、當面「散步要幹嘛？」（你說那裡有貓。）「好。」（K7）',txt(ask('kai','wenzhou',15.5).lines)==='「散步要幹嘛」（你說那裡有貓。）「好」'&&txt(ask('kai','wenzhou',15.5,null,true).lines)==='「散步要幹嘛？」（你說那裡有貓。）「好。」');
  fresh(key(SAT),'classmate_mingxuan',45,30);
  check('3. 明軒約半熟、一盞：手機照留、當面版（M5、M6）',txt(ask('classmate_mingxuan','brunch',12+10/60).lines)==='「早午餐？哈哈 CP 值不高喔……好啦 週末可以」'&&txt(ask('classmate_mingxuan','brunch',12+10/60,null,true).lines)==='「早午餐？CP 值不高喔……好啦，週末可以。」'
    &&txt(ask('classmate_mingxuan','teahouse',14,null,true).lines)==='「一盞？我很少喝茶，我爸才喝。……好啊。」');
  fresh(key(MON),'classmate_mingxuan',45,30);
  check('3. 明軒約吃飯「走啊，阿鳳便宜又大碗。」、散步「可以啊。走一走也好，我最近都坐著。」（M8、M9）',txt(ask('classmate_mingxuan','noodle',12+10/60).lines)==='「走啊，阿鳳便宜又大碗。」'&&txt(ask('classmate_mingxuan','wenzhou',15.5).lines)==='「可以啊。走一走也好，我最近都坐著。」');
  check('3. 明軒認識約 Café 照留「好。但我只能待一小時。」（M7）',J(P.classmate_mingxuan.acc.cafe)===J({A:['「好。但我只能待一小時。」']}));
  check('3. 方奕廷 F6～F8（10-2 第 1 點）；F5、F9 照留',J(P.npc_fangyt.acc)===J({brunch:['「好。早上我本來就起得早。」'],teahouse:['「好。聽說那邊院子有一棵很老的樟樹，我想去看看。」'],cafe:['「好。順便看一下 Café 窗台那盆植物。」'],library:['「好。我在總圖門口等你。」'],wenzhou:['「溫州街有一棵很老的榕樹。我帶你去。」']})); });

await sec(4,()=>{ const d1=termDay('Y1S1',6,3); fresh(key(d1),'heroine_01',45,30); const a=ask('heroine_01','wenzhou',15.5);
  check('4. 以安大一第一次約散步：照舊問「散步的目的是？」、改到隔天',a.res==='resched'&&a.lines[0]==='「散步的目的是？」'&&a.alt&&a.alt.day===H.G.day+1,a.res+' '+txt(a.lines)+' '+J(a.alt));
  doneIv('heroine_01','wenzhou',H.G.day-2); const b=ask('heroine_01','wenzhou',15.5);
  check('4. 散步過以後（大一）：照一般答應「好。」，不再問（AA_194 改規則）',b.res==='accept'&&txt(b.lines)==='「好。」',b.res+' '+txt(b.lines));
  const d2=termDay('Y2S1',6,3); fresh(key(d2),'heroine_01',45,30); const c=ask('heroine_01','wenzhou',15.5);
  check('4. 大二起：照舊「好啊，剛好想走走。」（已經是 AA_194 的改稿）',c.res==='accept'&&txt(c.lines)==='「好啊，剛好想走走。」',c.res+' '+txt(c.lines));
  const MON=termDay('Y1S1',6,1); fresh(key(MON),'classmate_xinci',25,8); const x1=ask('classmate_xinci','noodle',12+10/60), x2=ask('classmate_xinci','noodle',18.5,H.G.day+1);
  check('4. 芯慈約吃飯：今天＝「今天的我都排好了，{zh}可以嗎？」改到明天；之後的日子＝「好，我記一下。」（判斷不變）',x1.res==='resched'&&txt(x1.lines)==='「今天的我都排好了，{zh}可以嗎？」'&&x1.alt&&x1.alt.day===H.G.day+1&&x2.res==='accept'&&txt(x2.lines)==='「好，我記一下。」',J([x1.res,txt(x1.lines),x1.alt,x2.res,txt(x2.lines)]));
  fresh(key(MON),'classmate_bohan',25,8); const b1=ask('classmate_bohan','cafe',15.5);
  check('4. 柏翰：「我要念書，{zh}可以。」（拿掉「……」）',b1.res==='resched'&&txt(b1.lines)==='「我要念書，{zh}可以。」',txt(b1.lines));
  fresh(key(MON),'kai',30,10); const k1=ask('kai','library',15.5), k2=ask('kai','library',15.5,null,true);
  check('4. 阿凱約總圖（不是考試週）：手機照留「總圖我會睡著」「考前一週我會去 真的」、當面加標點（K9）',k1.res==='decline'&&txt(k1.lines)==='「總圖我會睡著」「考前一週我會去 真的」'&&txt(k2.lines)==='「總圖我會睡著。」「考前一週我會去，真的。」',txt(k1.lines)+' / '+txt(k2.lines));
  const SAT=termDay('Y1S1',6,6); fresh(key(SAT),'kai',30,10); const k3=ask('kai','brunch',10), k4=ask('kai','brunch',10,null,true);
  check('4. 阿凱半熟早上：手機照留「早上 不行 我在睡」、當面「早上不行，我在睡覺。」（K8）',k3.res==='resched'&&txt(k3.lines)==='「早上 不行 我在睡」'&&txt(k4.lines)==='「早上不行，我在睡覺。」',txt(k3.lines)+' / '+txt(k4.lines));
  const TUE=termDay('Y1S1',6,2); fresh(key(TUE),'classmate_mingxuan',12,4);
  const m1=ask('classmate_mingxuan','cafe',19), m1f=ask('classmate_mingxuan','cafe',19,null,true);
  check('4. 明軒家教時約 Café：手機「那時候我在家教 九點以後可以」、當面「那時候我在家教，九點以後可以。」；改到 21:00 以後（M10）',m1.res==='resched'&&txt(m1.lines)==='「那時候我在家教 九點以後可以」'&&txt(m1f.lines)==='「那時候我在家教，九點以後可以。」'&&m1.alt.h>=21,J([txt(m1.lines),txt(m1f.lines),m1.alt]));
  const m2=ask('classmate_mingxuan','library',19), m2f=ask('classmate_mingxuan','library',19,null,true);
  check('4. 明軒家教時約總圖：「我七點要家教 {zh}可以嗎」／當面「我七點要家教，{zh}可以嗎？」，改到隔天（M11：不寫死「六點半前」）',m2.res==='resched'&&txt(m2.lines)==='「我七點要家教 {zh}可以嗎」'&&txt(m2f.lines)==='「我七點要家教，{zh}可以嗎？」'&&m2.alt&&m2.alt.day>H.G.day,J([txt(m2.lines),m2.alt]));
  SOCIAL.rel('classmate_mingxuan').fam=25;   /* 吃飯要有點熟 */
  const m3=ask('classmate_mingxuan','noodle',19), m3f=ask('classmate_mingxuan','noodle',19,null,true);
  check('4. 明軒家教時約吃飯（同一天 21:30）：「家教完 {zh} 吃便宜的那家」／當面「家教完，{zh}，吃便宜的那家。」（M12）',m3.res==='resched'&&m3.alt&&m3.alt.day===H.G.day&&txt(m3.lines)==='「家教完 {zh} 吃便宜的那家」'&&txt(m3f.lines)==='「家教完，{zh}，吃便宜的那家。」',J([txt(m3.lines),m3.alt]));
  H.G.invSeq=0; INV.accept(H.G,'zhe','noodle',H.G.day,21.5,{by:'player'}); const m4=ask('classmate_mingxuan','noodle',19), m4f=ask('classmate_mingxuan','noodle',19,null,true);
  check('4. 那天 21:30 你已經有約：改到別天＝「那天我要家教 {zh}可以嗎」／當面「那天我要家教，{zh}可以嗎？」（M12 不同天）',m4.res==='resched'&&m4.alt&&m4.alt.day!==H.G.day&&txt(m4.lines)==='「那天我要家教 {zh}可以嗎」'&&txt(m4f.lines)==='「那天我要家教，{zh}可以嗎？」',J([txt(m4.lines),m4.alt])); });

await sec(5,()=>{ const MON=termDay('Y1S1',6,1); fresh(key(MON),'heroine_01',25,8);
  check('5. 以安的 acc、here、plan 照 AA_415（10-23 較新）：「可以。條件：我會帶東西來寫。」等不改成 AA_194 的稿',J(P.heroine_01.acc.cafe)===J({A:['「可以。條件：我會帶東西來寫。」']})&&J(P.heroine_01.here.library)===J(['「我本來就在總圖。二樓靠窗。」'])&&J(P.heroine_01.plan.cafe)===J(['「今天排滿了。……這個時間可以嗎？」']));
  check('5. 語彤的 acc 照 AA_415；可昕的半熟、一盞照 AA_415（AA_255 T5）',J(P.heroine_03.acc.noodle)===J({A:['「……我阿姨的店？」','「好。阿姨會多給你一顆滷蛋。」']})&&J(P.kexin.acc.brunch)===J({A:['「半熟？我從木柵大學過來要四十分鐘。好，我十點到。」'],R:['「好啊，我先查一下菜單。」']}));
  let out='', rc=0; try{ out=cp.execSync('python3 "'+path.join(H.ROOT,'tools/invite/build_replies.py')+'"',{encoding:'utf8'}); }catch(e){ rc=1; out=String(e.stdout||e); }
  const same=cp.execSync('git -C "'+H.ROOT+'" status --porcelain -- src/data/invite_replies.js',{encoding:'utf8'}).trim()==='';
  check('5. build_replies.py 照樣通過（AA_415 的「現有」都對得上），重新產生的檔案沒有變',rc===0&&/heroine_01 36 列/.test(out)&&same,out.slice(0,160)); });

await sec(6,async()=>{ const MON=termDay('Y1S1',6,1); fresh(key(MON),'kai',30,10); H.said=[]; H.picks=['去阿鳳麵店吃飯','今天 12:10']; await INV.flow(GM,'kai',null,false);
  check('6. 手機約阿凱吃飯：念手機版「走 我剛好還沒吃」',H.said.some(s=>s.t==='「走 我剛好還沒吃」'&&/手機/.test(s.who||'')),J(H.said));
  fresh(key(MON),'kai',30,10); H.said=[]; H.picks=['去阿鳳麵店吃飯','今天 12:10']; const n={obj:{position:{x:0,y:0,z:0},rotation:{y:0}}}; await INV.flow(GM,'kai',n,false);
  check('6. 當面約阿凱吃飯：念當面版「走，我剛好還沒吃。」',H.said.some(s=>s.t==='「走，我剛好還沒吃。」'),J(H.said)); });

H.done();
})();
