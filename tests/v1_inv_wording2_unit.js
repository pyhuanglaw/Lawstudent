// 邀約的口語改寫・第二批（V1-INV-WORDING2）：BB_172 第 1～4 節＋第 10 節（芷若、子晴、學姊、沛珊；企劃線 968473469）——不需要瀏覽器。
//   只換 AA_415 沒有管的格子：一起走（walk）、第一次到那家店（firstAt）、交換聯絡方式（exchange）、芷若上班時的 here；答應、改天、婉拒、rule、first、partnerSay 照 AA_415。
//   0  每一句新的都在 BB_172 原文裡一字不差
//   1  交換聯絡方式：芷若 Z1、沛珊 P1（10-2 第 12、13、15 點）
//   2  芷若：Z2（聽過她家／沒聽過兩版）、Z3、Z4、Z5（猜電影：選項照舊）、Z6、Z7、Z8（第一次只有一次）、Z16
//   3  子晴：Q2、Q3、Q4（看過 Q6 才說遊戲）、Q5、Q7 的問句和「下次再講」；Q7 ①照 LIFE-LINE（念了一個多月）不動
//   4  學姊 S3（筆試以後）；沛珊 P2（問句兩句、三個回答、after 照舊）、P3、P4
//   5  沒有換的：較新的改稿（10-20 AA 直接改字、AA_313、AA_335、LIFE-LINE）、和現在設定衝突的、AA_415 的格子
// 修改前（開發分支 ed265f872）：這幾句還是舊的——FAIL。用法：node tests/v1_inv_wording2_unit.js
require('./alison.js');   // 讀企劃稿（git show）照匯入工具同一套換：Alison、虛構校名（WORLD-RENAME-1030，docs/WORLD_NAMING.md）
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const txt=ls=>(ls||[]).map(x=>typeof x==='string'?x:x.me).join('');
const D=INVITE_DATA, P=D.people, EX=D.exchange;
const termDay=(id,week,wd)=>{ const r=CALENDAR.termDays(id); for(let d=r.from;d<=r.to;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===id&&t.week===week&&CALENDAR.dateOf(d).wd%7===wd) return d; } return null; };
const key=d=>CALENDAR.dateOf(d).key;
const fresh=(d,id)=>{ H.fresh(key(d),10,'campus'); if(id){ const r=SOCIAL.rel(id); r.fam=45; r.trust=30; SOCIAL.remember(id,'FIRST_MET',''); } H.G.flags.walkChatN={}; return H.G; };
const picks=(id,pid,n)=>{ const out=[]; for(let i=0;i<n;i++){ const q=INV.walkPick(H.G,id,pid); if(!q) break; out.push(q); q.next(); } return out; };
const BB172='docs/story_planning/BB_172_AB65_大一上第2批_邀約同行_BB人物.md';
const NEW=['「好啊，你掃我。」','「我上班的時候不太看手機，下班才會回，不要以為我不理你。」','「好。上課有問題可以問你嗎？」',
  '「這家影印一張一塊半欸。我媽那邊才一塊。」','「這家影印一張一塊半欸，好貴。」','「欸這部，你不要去看喔。」','「預告很好看，正片超無聊。我上禮拜去看，浪費兩百多。」','「你背包那本是什麼？好厚喔。」','「我們的書都很薄，可是每本都要讀好幾遍。」',
  '「欸，你不覺得這條巷子很適合拍電影嗎？你猜我會拍什麼。」','「太簡單了啦。」','「晚上是有一點啦，可是不是。」','「……你怎麼知道？」','「我想拍一個人每天走這條巷子去上班，然後什麼事都沒發生。」','「……應該很難看吧。」',
  '「我們外文的報告都要用英文寫，寫久了講中文都會卡。」','「她煎蛋的時候都不講話欸，好專心。」','「我拉花的時候也是，被叫一下就歪掉。」','「我完全不懂茶欸。」','（店員說第一泡要等三分鐘。）','「三分鐘喔？好，我等。」','「我會在 Café 啊，你直接過來，我幫你做一杯。」',
  '「我們社團練團的地方就在B館旁邊。」','「你們法律系的人有沒有被我們吵到？」','「這家的珍珠超 Q。公館的我喝過快十家，這家最好。」','「這邊機車停得好亂。做成關卡的話，玩家一定一直撞到。」','「……欸，我要把它做進去。」','「這邊機車停得好亂，走路都要側身。」',
  '「你們法律系考試是寫申論對吧？」','「我們寫程式有點像，只是改的是電腦，錯一個字就零分。」','「欸，阿凱說你之前念經濟？那你怎麼會換來法律？」','「好喔，那你欠我一次。」','「這家鬆餅聽說很好吃，我每次經過都在趕時間。」',
  '「剛剛路上那排機車，全都停在紅線上。」','「如果一條規定大家都不守，它還算數嗎？」','「所以寫下來就算數喔？」','「那寫的人壓力好大。」','「所以大家不守，算是在投票嗎？」','「……也是。有的人是不想守，有的人是沒辦法守。」',
  '「她翻蛋的時候手腕都不動耶。我媽也是。」','「我到現在還學不會。」','「這裡講話要很小聲對不對？」','「……那我小聲問，第一泡為什麼要倒掉？」'];

(async()=>{
await sec(0,()=>{ let md=''; try{ md=cp.execSync('git -C "'+H.ROOT+'" show 968473469:"'+BB172+'"',{encoding:'utf8'}); }catch(e){}
  check('0. 讀得到企劃線 BB_172（968473469）',md.includes('## 1. 芷若')&&md.includes('## 10. AA-B 互審'));
  const bad=NEW.filter(t=>!md.includes(t)); check('0. 換上去的 '+NEW.length+' 句都在 BB_172 原文裡一字不差',NEW.length===43&&!bad.length,J(bad));
  const src=fs.readFileSync(path.join(H.ROOT,'src/data/invites.js'),'utf8'); const gone=NEW.filter(t=>!src.includes(t));
  check('0. 每一句都在 src/data/invites.js',!gone.length,J(gone)); });

await sec(1,()=>{ check('1. 芷若交換聯絡方式：「好啊，你掃我。」「我上班的時候不太看手機，……」（Z1，10-2 第 12、15 點）',J(EX.heroine_02)===J([{say:'「好啊，你掃我。」'},{say:'「我上班的時候不太看手機，下班才會回，不要以為我不理你。」'}]));
  check('1. 沛珊：「好。上課有問題可以問你嗎？」（P1，10-2 第 13 點）',J(EX.classmate_peishan)===J([{say:'「好。上課有問題可以問你嗎？」'}]));
  check('1. 子晴（Q1）照 10-20 AA 直接改的那一句（較新），不換',J(EX.heroine_04)===J([{say:'「你還沒有我的？好。我傳東西不解釋。」'}])); });

await sec(2,async()=>{ const d=termDay('Y1S1',6,3); fresh(d,'heroine_02'); let L=picks('heroine_02','noodle',2).map(q=>txt(q.lines));
  check('2. 芷若去吃飯（還沒聽過她家）：「這家影印一張一塊半欸，好貴。」→ 下一趟電影海報（Z2 10-2 第 5 點、Z3）',J(L)===J(['「這家影印一張一塊半欸，好貴。」','（她看到騎樓下的電影海報。）「欸這部，你不要去看喔。」「預告很好看，正片超無聊。我上禮拜去看，浪費兩百多。」']),J(L));
  SOCIAL.remember('heroine_02','ZR_HOMETOWN',''); H.G.flags.walkChatN={}; L=picks('heroine_02','noodle',2).map(q=>txt(q.lines));
  check('2. 聽過她家（ZR_HOMETOWN）：「這家影印一張一塊半欸。我媽那邊才一塊。」',L[0]==='「這家影印一張一塊半欸。我媽那邊才一塊。」'&&!L.includes('「這家影印一張一塊半欸，好貴。」'),J(L));
  H.G.flags.walkChatN={}; const lib=picks('heroine_02','library',1)[0]; check('2. 芷若去總圖：「你背包那本是什麼？好厚喔。」「我們的書都很薄，……」（Z4）',!!lib&&txt(lib.lines)==='「你背包那本是什麼？好厚喔。」「我們的書都很薄，可是每本都要讀好幾遍。」');
  const e=INV.walkEntry('heroine_02','ZR_FILM_ASK');
  check('2. 猜電影（Z5）：問句、三個回答、after 兩句；選項照舊',!!e&&J(e.l)===J(['「欸，你不覺得這條巷子很適合拍電影嗎？你猜我會拍什麼。」'])&&J(e.ch.map(c=>c.t))===J(['愛情片。','恐怖片。','什麼都沒發生的片。'])&&J(e.ch.map(c=>c.r[0]))===J(['「太簡單了啦。」','「晚上是有一點啦，可是不是。」','「……你怎麼知道？」'])&&J(e.after)===J(['「我想拍一個人每天走這條巷子去上班，然後什麼事都沒發生。」','「……應該很難看吧。」']));
  check('2. Z6：「我們外文的報告都要用英文寫，寫久了講中文都會卡。」',J(P.heroine_02.walk.any)===J(['「我們外文的報告都要用英文寫，寫久了講中文都會卡。」']));
  check('2. 第一次到半熟、一盞（Z7、Z8 10-2 第 7 點）',J(P.heroine_02.firstAt.brunch)===J(['（她點完餐，看了開放廚房很久。）','「她煎蛋的時候都不講話欸，好專心。」','「我拉花的時候也是，被叫一下就歪掉。」'])&&J(P.heroine_02.firstAt.teahouse)===J(['「我完全不懂茶欸。」','（店員說第一泡要等三分鐘。）','「三分鐘喔？好，我等。」']));
  const SAT=termDay('Y1S1',6,6); fresh(SAT,'heroine_02'); const said=async()=>{ const iv=INV.accept(H.G,'heroine_02','brunch',H.G.day,10,{by:'player'}); H.said=[]; await INV.meet(GM,iv,null); return H.said.map(s=>s.t); };
  const m1=await said(), m2=await said();
  check('2. 第一次和芷若去半熟才說（第二次不說）',m1.includes('「她煎蛋的時候都不講話欸，好專心。」')&&!m2.includes('「她煎蛋的時候都不講話欸，好專心。」'),J([m1,m2]).slice(0,300));
  const TUE=termDay('Y1S1',6,2); fresh(TUE,'heroine_02'); const h=INV.personal(H.G,'heroine_02',INV.place('cafe'),H.G.day,19,INV.decide(H.G,'heroine_02','cafe',H.G.day,19));
  check('2. 芷若上班時約 Café（here）：「我會在 Café 啊，你直接過來，我幫你做一杯。」（Z16，10-2 第 3 點）',h.res==='here'&&txt(h.lines)==='「我會在 Café 啊，你直接過來，我幫你做一杯。」',h.res+' '+txt(h.lines)); });

await sec(3,()=>{ const d=termDay('Y1S1',6,3); fresh(d,'heroine_04'); const L=picks('heroine_04','noodle',2).map(q=>txt(q.lines));
  check('3. 子晴去吃飯：Q2「我們社團練團的地方……」「你們法律系的人有沒有被我們吵到？」、Q3「這家的珍珠超 Q。……」',J(L)===J(['「我們社團練團的地方就在B館旁邊。」「你們法律系的人有沒有被我們吵到？」','「這家的珍珠超 Q。公館的我喝過快十家，這家最好。」']),J(L));
  H.G.flags.walkChatN={}; let w=picks('heroine_04','wenzhou',1)[0];
  check('3. 還沒看過 Q6（她在做遊戲）：溫州街「這邊機車停得好亂，走路都要側身。」（10-2 第 6 點；不說破遊戲）',!!w&&txt(w.lines)==='「這邊機車停得好亂，走路都要側身。」',w&&txt(w.lines));
  H.G.events.done.ev_ziqing_secret_game=H.G.day-1; H.G.flags.walkChatN={}; w=picks('heroine_04','wenzhou',1)[0];
  check('3. 看過 Q6 以後：「這邊機車停得好亂。做成關卡的話，……」「……欸，我要把它做進去。」',!!w&&txt(w.lines)==='「這邊機車停得好亂。做成關卡的話，玩家一定一直撞到。」「……欸，我要把它做進去。」',w&&txt(w.lines));
  check('3. 去總圖：Q5',J(P.heroine_04.walk.library)===J(['「你們法律系考試是寫申論對吧？」','「我們寫程式有點像，只是改的是電腦，錯一個字就零分。」']));
  const e=INV.walkEntry('heroine_04','ZQ_CHANGE_ASK');
  check('3. Q7 問句「欸，阿凱說你之前念經濟？那你怎麼會換來法律？」、②「好喔，那你欠我一次。」（10-1 第 10 點）；①照 LIFE-LINE「念了一個多月經濟」（BB 稿「念了一年」和現在的設定不合）',!!e&&J(e.l)===J(['「欸，阿凱說你之前念經濟？那你怎麼會換來法律？」'])&&J(e.ch[1].r)===J(['「好喔，那你欠我一次。」'])&&e.ch[0].r[0].me==='「念了一個多月經濟，後來重考到法律。考之前很怕，考完就不怕了。」'&&e.ch[0].mem==='TOLD_HER_CHANGE');
  const all=JSON.stringify(P.heroine_04.walk); check('3. 子晴一起走的句子沒有「欸不是」「這不是問句」',!/欸不是|這不是問句/.test(all)); });

await sec(4,()=>{ const e=P.heroine_05.walk.wenzhou[0]; check('4. 學姊筆試以後去溫州街：「這家鬆餅聽說很好吃，我每次經過都在趕時間。」（S3）',J(e.l)===J(['「這家鬆餅聽說很好吃，我每次經過都在趕時間。」'])&&typeof e.if==='function');
  const q=INV.walkEntry('classmate_peishan','PS_LAW_ASK');
  check('4. 沛珊 P2：問句兩句（人已經在目的地，10-1 第 11 點）、三個回答；選項、after 照舊',!!q&&J(q.l)===J(['「剛剛路上那排機車，全都停在紅線上。」','「如果一條規定大家都不守，它還算數嗎？」'])&&J(q.ch.map(c=>c.t))===J(['還是法律，只是沒人守。','那它可能該改了。','要看大家為什麼不守。'])
    &&J(q.ch[0].r)===J(['「所以寫下來就算數喔？」','「那寫的人壓力好大。」'])&&J(q.ch[1].r)===J(['「所以大家不守，算是在投票嗎？」'])&&J(q.ch[2].r)===J(['「……也是。有的人是不想守，有的人是沒辦法守。」'])&&q.after.length===2);
  check('4. 沛珊第一次到半熟、一盞（P3、P4）',J(P.classmate_peishan.firstAt.brunch)===J(['「她翻蛋的時候手腕都不動耶。我媽也是。」','「我到現在還學不會。」'])&&J(P.classmate_peishan.firstAt.teahouse)===J(['「這裡講話要很小聲對不對？」','「……那我小聲問，第一泡為什麼要倒掉？」'])); });

await sec(5,()=>{ const w=P.heroine_05.walk, f=P.heroine_05.firstAt;
  check('5. 學姊 S2、S4～S7 照 10-20 的改稿（較新：AA 直接改字、AA_313 第 6 節），不換回 BB_172',J(w.library[0].l)===J(['「B館的電梯很慢，走樓梯比較快。」','「總圖三樓靠窗的位子，九點以前就要去搶。」','「……我大一的時候，這些都沒人告訴我。」'])&&w.library[0].if(null,{year:2})&&!w.library[0].if(null,{year:3})   /* AA_416 第 11 節第 2 點（2af5f4899）：「這兩件」算數件數，改「這些」；大三起換 AA_259 (b) 第 3 點那一版（w.library[1]） */
    &&J(w.noodle)===J(['「以前法服有個個案，就住在這附近。阿伯每次來都帶一袋橘子。」','「……我們不能收，他就放在桌上走掉。」'])&&J(w.any)===J(['「我大一的時候以為四年很長。……我大一的時候也以為總圖的位子很好搶。」'])
    &&J(f.brunch)===J(['「三分四十秒。老闆娘說的。……她每一顆都這樣計時？」'])&&J(f.teahouse)===J(['「這裡不能讀書。……我很少去不能讀書的地方。」']));
  check('5. 子晴 Q6、Q8 照 10-20 AA 直接改的句子',J(P.heroine_04.walk.any[0])===J(['（她看到一隻松鼠。）','「那隻松鼠在看我。……牠在看我的餅乾。」'])&&J(P.heroine_04.firstAt.teahouse)===J(['「地板是榻榻米。我要脫鞋？……我的襪子是貓的。不准看。」']));
  check('5. AA_415 的格子沒動（芷若 acc、plan；子晴 first；沛珊 acc、first；學姊 partnerSay）',J(P.heroine_02.acc.cafe)===J({A:['「我放假不太想來上班的地方。……好啦。但我不幫忙收杯子。」'],R:['「去我們家。我坐客人那一邊，看起來會很奇怪。」']})&&J(P.heroine_02.plan.library)===J(['「我在上班。十點下班，總圖也十點關。……你自己加油。」'])
    &&J(P.heroine_04.first.wenzhou)===J(['「散步？散步是什麼？」','（你解釋了一下。）','「……好啦。但要有目的地。」'])&&J(P.classmate_peishan.first.wenzhou)===J(['「散步是最好的思考。……我在書上看到的。」'])&&J(P.heroine_05.partnerSay.teahouse)===J(['「一盞……那裡太安靜了。Café 可以，帶你的筆記。」']));
  let out='', rc=0; try{ out=cp.execSync('python3 "'+path.join(H.ROOT,'tools/invite/build_replies.py')+'"',{encoding:'utf8'}); }catch(e){ rc=1; out=String(e.stdout||e); }
  check('5. build_replies.py 照樣通過（AA_415 的「現有」都對得上），產生的檔案沒有變',rc===0&&cp.execSync('git -C "'+H.ROOT+'" status --porcelain -- src/data/invite_replies.js',{encoding:'utf8'}).trim()==='',out.slice(0,120)); });

H.done();
})();
