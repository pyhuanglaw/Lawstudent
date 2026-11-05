#!/usr/bin/env node
/* CC-C（帳號 C）11-05：GUITAR_X196（BB-C 03:14；SHA b4746f345＝475d87588 合併 AA_693）——吉他店同弦、吉他社、社遊，Node 照日期走。判定歸 BB。
   期望值：AA_619、AA_693（企劃線 c4b14a901，git show 讀原稿；第 0b 節核對每一句期望字都在原文裡）、BB-C 03:14 派工訊息。
   做法：pg_harness 的假 GM；一局從大一上第 5 週週一開始，照日期一天一天往前：社課（週一、週三 19:05，CLS.attendActivity，選單照 plan 選）、
     手機（STORY.phoneRules＋PHONE.tick；群組報名表照玩家回 PHONE.answer）、約好的出遊（OUT.due／OUT.tick，時間到才出發）、去同弦（區域 xs_tongxian、GUITAR.tick）。
     每一句台詞記下說的那一刻（日期、時間）。
   A 沒琴的一局：2-1（「一定要買嗎？」）→ 2-2（「好，禮拜六。」）→ 2-3（「三千八那把。」九折 3,420）→ 2-4（第 7 週起有琴那一句）→ 宜蘭報名（扣 2,500）→ 宜蘭整趟（上頂樓、問了、我覺得很好聽）
   B 沒琴、2-3「我再想想。」：之後的社課偶爾第三弦那一句；宜蘭「彈社課教的那首。」＝借子晴的琴；「回房間睡覺。」＝回程沒去那一版、沒有 ZQ_ROOFTOP_TUNE
   C 錢不夠：宜蘭報名＝群組裡「下次吧。」、不扣錢、沒有出遊
   D 第一次社課就有自己的琴（AA_693 A4）；E 2-3 之前自己買了琴（AA_693 A10）；F 偶遇子晴（第 6、10、14 週週六 15:00～16:00，一次）
   G 同弦營業時間（12:00～21:30、週一休、颱風天關）；H 陽明山（4/27 報名、5/2 10:00 校門口～18:00；有／沒有 ZQ_ROOFTOP_TUNE 兩版）
   【前置／捷徑】pg_harness 的假 GM；加入吉他社＝第一次社課照遊戲自己的報到流程；錢、認識子晴（D、E、F 的前置）、颱風天直接設。
   用法：LW_ROOT=<checkout> [CC_REPO=…] [SHA=…] node cc_guitar_x196_node.js */
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(process.env.LW_ROOT||path.join(__dirname,'..','..','..','..'));
const CC_REPO=process.env.CC_REPO||path.resolve(__dirname,'..','..','..','..');
const H=require(path.join(ROOT,'tests','pg_harness.js'));
const {GM,E}=H, J=JSON.stringify;
let FAILS=0, PASSES=0; const FL=[]; const check=(name,ok,inf)=>{ console.log((ok?'PASS ':'FAIL ')+name+(inf?'　'+String(inf).slice(0,900):'')); if(ok) PASSES++; else { FAILS++; FL.push(name.split(' ')[0]); } return ok; };
const info=s=>console.log('INFO '+String(s).slice(0,1500));
const loadErr=[]; const Lf=f=>{ const p=path.join(ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'（沒有）'); return; } try{ let s=fs.readFileSync(p,'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,160)); } };
global.CG_REGISTRY=global.CG_REGISTRY||{};
Lf('src/data/tongxian_layout.js'); Lf('src/tongxian3d.js'); Lf('src/guitar3d.js');
const S=typeof GUITAR!=='undefined'?GUITAR:null, ZQ='heroine_04';
const TD=(t,w,wd)=>STORY.termDay(t,w,wd), K=d=>CALENDAR.dateOf(d).key, wd7=d=>CALENDAR.dateOf(d).wd%7;
const hm=h=>{ const x=Math.round(((h%24)+24)%24*60); return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0'); };
const gitShow=(rev,re)=>{ try{ const f=cp.execFileSync('git',['-C',CC_REPO,'-c','core.quotepath=off','ls-tree','-r','--name-only',rev],{encoding:'utf8',maxBuffer:1<<26}).split('\n').find(l=>re.test(l)); return f?cp.execFileSync('git',['-C',CC_REPO,'-c','core.quotepath=off','show',rev+':'+f],{encoding:'utf8',maxBuffer:1<<26}):''; }catch(e){ return ''; } };
const D619=gitShow('c4b14a901',/AA_619_/), D693=gitShow('c4b14a901',/AA_693_/);
/* 期望的字（照抄 AA_619／AA_693；第 0b 節確認每一句都在原文裡）*/
const X={
  c21a:['（社長學長拍拍手。）',D619], c21b:['有自己吉他的舉手。',D619], c21no:['（一半的人舉手。你沒有。）',D619], c21own:['（一半的人舉手。你也舉了。）',D693],
  c21d:['沒有的先用社團的，前面那箱。前兩個禮拜先借，之後最好自己買一把。……不用貴，三四千就有好彈的。',D619], c21e:['新生南路有一家同弦，報吉他社打九折。買弦也有。',D693],
  c21why:['不買也可以啊，社團的琴一直都在。只是那箱弦有點鏽。',D619], c21rust:['（社團的吉他弦很鏽。按下去手指留了一條黑線。）',D619], c21touch:['（坐你旁邊借社團琴的人，伸手按了一下你的弦。）',D693],
  c22a:['你還在用那箱的？',D619], c22b:['……禮拜六我要去同弦買弦。你要來就來。',D619], c22c:['我陪你去，但我不幫你選。你自己彈彈看，你的手比我知道。',D619], c22self:['好。0.12 的弦，記得。',D619],
  c23a:['（子晴已經在樓梯口了，耳機掛在脖子上。）',D619], c23b:['走。',D619], c23c:['（老闆看到子晴，點了一下頭。）',D619], c23d:['又來了。0.12？',D619], c23e:['嗯。……他要買琴。',D619],
  c23f:['（你拿下兩把試。一把三千八，一把六千五。）',D619], c23g:['彈 G。……換 C。……再彈一次 G。',D619], c23h:['哪一把比較好按？',D619],
  c23r1:['那就那把。……貴的你現在也彈不出差別。',D619], c23r3:['好。不要讓別人幫你決定。我也是。',D619], c23tune:['（老闆幫你調好音，把琴裝進琴袋。）',D619], c23out:['有自己的琴以後，回家才會彈。……社團的琴你不會帶回家。',D619],
  c23own1:['（子晴已經在樓梯口了，耳機掛在脖子上。她看了一眼你背的琴袋。）',D693], c23own2:['……你自己買了。',D693], c23own3:['好。那陪我買弦。',D693],
  n24own:['（你的琴放在宿舍床邊。阿凱說你半夜彈太大聲。）',D619], n24loan:['（社團那把吉他的第三弦又鬆了。學長幫你調了兩次。）',D619],
  enc1:['你也來這家？……這家老闆不會一直推銷，我喜歡。',D619], enc2:['（她拿了一包弦就走。走到門口又回頭。）',D619], enc3:['0.12 的。不要買太細的，你手會更痛。',D619],
  yPost:['社遊 11/22–23 宜蘭，民宿兩天一夜，兩千五（含車、住、早餐）。要帶琴喔。',D619], poor:['下次吧。',D619],
  yBus:['（車上有人彈吉他，後面的人跟著唱。唱到一半，司機把收音機關了。）',D619], ySea:['（大家在沙灘上排成一圈彈唱。風很大，譜一直被吹走。）',D619], ySea2:['（子晴坐在圈子外面一點的地方，沒有彈，在看海。）',D693],
  yTalk:['我在聽浪。……它的節奏一直在變。',D619], yBbq:['（晚上在民宿的院子烤肉。吃完大家擠進客廳，一個一個上去彈一首。）',D693], yTurn:['（輪到你了。）',D693],
  yOwnCase:['（你把自己的琴從琴袋裡拿出來。）',D693], yHand:['（子晴把她的琴遞給你。）',D693], yFresh:['弦剛換過。',D693], yPlayed:['（你彈錯了兩個地方。大家照樣拍手。）',D619],
  y12:['（十二點多，樓下還在唱歌。）',D693], yUp:['（你上頂樓透氣，子晴已經在了，抱著吉他。）',D693], yRoom:['（你回房間躺下。樓下的歌隔著地板，一首接一首。）',D693],
  yTune:['（她彈了一段你沒聽過的旋律。很短，彈完就停了。）',D619], yAsk1:['……沒有名字。我自己寫的。',D619], yAsk2:['還沒寫完。結尾我還沒想到。',D619], yNice:['你又聽不出來好不好。',D619], yThx:['……謝了。',D619],
  yMorn:['（第二天早上，學長帶大家去吃卜肉。剛起鍋很燙，大家站在店門口邊吹邊吃。）',D693], yLuo:['（下午經過羅東，大家去買伴手禮。你買了一盒牛舌餅。）',D693],
  yBack1:['（回程車上大家都睡了。你旁邊的子晴把耳機分了一邊給你，沒說是什麼歌。）',D619], yBack0:['（回程車上大家都睡了。）',D619],
  mPost:['這學期社遊一天就好，陽明山野餐。',D619], mStart:['（早上十點，校門口。社長學長租了一台小巴，後車廂塞滿琴袋。）',D693], mCircle:['（子晴這次在圈子裡彈。）',D693],
  mTune:['今天彈別人的歌。……我的還沒好。',D619], mWind:['今天風好舒服。',D619],
  close:['九點半了。明天再來。',D693] };
const T=k=>X[k][0];
let LOG=[]; const say0=GM.say; GM.say=async function(who,t){ const G=H.G; LOG.push({d:G&&G.day,h:G&&+G.hour,who:who?(who.name||String(who)):null,t:String(t)}); return say0.apply(this,arguments); };
const caps=[]; GM.caption=(a,b)=>{ const G=H.G; caps.push({d:G&&G.day,h:G&&+G.hour,t:String(b!=null?b:a)}); }; GM.toast=()=>{}; GM.memo=()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; }; GM.fade=()=>Promise.resolve();
const texts=()=>LOG.map(x=>x.t);
/* 選單：照 plan 一項一項找「對得上的那一項」才用掉；對不上（別的選單、出發確認）＝選第一個、不用掉 */
let WANT=[]; const OPTS=[]; GM.choose=async function(o){ const ts=o.map(q=>q.t||q.text||''); OPTS.push(ts); for(let i=0;i<WANT.length;i++){ const w=WANT[i]; const k=typeof w==='number'?(w<ts.length?w:-1):ts.findIndex(t=>t.includes(w)); if(k>=0&&typeof w!=='number'){ WANT.splice(i,1); return k; } } if(WANT.length&&typeof WANT[0]==='number'){ return WANT.shift(); } return 0; };
const settle=async()=>{ for(let i=0;i<40;i++) await new Promise(r=>setTimeout(r,0)); };
const idxSeq=(want)=>{ const tx=texts(); let i=0, at=[]; for(const w of want){ const j=tx.indexOf(w,i); if(j<0) return {ok:false,miss:w,at}; at.push(j); i=j+1; } return {ok:true,at}; };
const timeOf=t=>{ const x=LOG.find(l=>l.t===t); return x?K(x.d)+' '+hm(x.h):null; };
const at=(d,h,zone)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wd7(d); if(zone) G.zone=zone; };
const tick=()=>{ try{ STORY.phoneRules(GM); }catch(e){} try{ PHONE.tick(H.G); }catch(e){} };
const club=()=>ACTIVITIES.list.find(a=>a.id==='club_guitar');
const fresh=(d,h,flags,money)=>{ WANT=[]; const G=H.fresh(K(d),h,'dorm',Object.assign({EXCHANGE_ROUTE:'TW'},flags||{})); G.outings=[]; G.acts={att:{}}; G.invites=[]; G.money=money==null?20000:money; at(d,h,'dorm'); LOG=[]; caps.length=0; E.interactables=[]; ADV.active=false; delete global.Z3; return G; };
const attend=async(d,picks)=>{ at(d,19.05,'wancai'); WANT=(picks||[]).filter(x=>typeof x==='string'); const L0=LOG.length; await CLS.attendActivity(GM,club(),{door:true}); await settle(); at(d,21.0,'wancai'); tick(); return LOG.slice(L0).map(x=>x.t); };
const outing=async(d,h0,h1,picks)=>{ const L0=LOG.length; for(let h=h0;h<=h1;h+=0.25){ at(d,h,'dorm'); tick(); const q=OUT.due&&OUT.due(H.G); if(q){ WANT=(picks||[]).filter(x=>typeof x==='string'); await OUT.tick(GM); await settle(); return {q:q.id||q.ev, lines:LOG.slice(L0)}; } } return {q:null,lines:LOG.slice(L0)}; };
const CLUB_DAYS=(term,uptoW)=>{ const a=club(), ws=(a.termWeeks&&a.termWeeks[term])||a.weeks, out=[]; for(const w of ws){ if(w>uptoW) continue; for(const wd of a.weekdays) out.push({w,wd,d:TD(term,w,wd)}); } return out.sort((x,y)=>x.d-y.d); };
const sec=async(n,f)=>{ console.log('\n===== '+n); try{ await f(); }catch(e){ check(n.split(' ')[0]+'：丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const askId=k=>'guitar_trip_'+k;
(async()=>{
console.log('cc_guitar_x196_node　LW_ROOT='+ROOT+'　SHA='+(process.env.SHA||'?')+'　稿 AA_619／AA_693 c4b14a901');
check('0. 載得到 GUITAR、CLS.attendActivity、OUT、PHONE',!loadErr.length&&!!S&&typeof CLS.attendActivity==='function'&&typeof OUT.tick==='function'&&typeof PHONE.answer==='function',loadErr.join(' | '));
{ const miss=Object.keys(X).filter(k=>!X[k][1]||!X[k][1].includes(X[k][0])); check('0b. 期望字每一句都在 AA_619／AA_693 原文裡（'+Object.keys(X).length+' 句）',!!D619&&!!D693&&!miss.length,J({miss})); }
info('日期：第 5 週週一 '+K(TD('Y1S1',5,1))+'、第 6 週週三 '+K(TD('Y1S1',6,3))+'、第 6 週週六 '+K(TD('Y1S1',6,6))+'、第 11 週週一 '+K(TD('Y1S1',11,1))+'、宜蘭 '+K(S.tripDay('y1s1'))+'；大一下第 10 週週一 '+K(TD('Y1S2',10,1))+'、陽明山 '+K(S.tripDay('y1s2')));

/* ---------- A 沒琴的一局 ---------- */
let GA=null;
await sec('A 沒琴的一局（照日期走到宜蘭回來）',async()=>{
  const days=CLUB_DAYS('Y1S1',12); const G=GA=fresh(days[0].d,9); const m0=G.money; const narr={};
  for(const c of days){
    if(c.d>S.tripDay('y1s1')) break;
    if(c.w===6&&c.wd===6) continue;
    const picks=c.w===5&&c.wd===1?[0,'「一定要買嗎？」']:(c.w===6&&c.wd===3?['「好，禮拜六。」']:[0]);
    const L=await attend(c.d,picks); narr[K(c.d)]=L;
    if(c.w===5&&c.wd===1){
      const s=idxSeq([T('c21a'),T('c21b'),T('c21no'),T('c21d'),T('c21e'),T('c21why')]);
      check('A1 2-1 第一次社課（'+K(c.d)+'）：社長學長那一段逐字、「一定要買嗎？」接他那一句',s.ok,J({miss:s.miss,L:L.slice(-10)}));
      check('A2 2-1 這次社課的旁白換成「'+T('c21rust')+'」',L.includes(T('c21rust')),J(L.slice(-4)));
      check('A2b 加入吉他社（CLUB_club_guitar）、認識子晴',S.member(G)&&!!STORY.knows(ZQ,G),J({m:S.member(G)}));
    }
    if(c.w===6&&c.wd===3){
      const s=idxSeq([T('c22a'),T('c22b'),T('c22c')]);
      check('A3 2-2 第 6 週週三（'+K(c.d)+'）社課結束：子晴三句逐字；「好，禮拜六。」＝GUITAR_SHOP_WITH_ZQ、排出遊 第 6 週週六 15:00',s.ok&&G.flags.GUITAR_SHOP_WITH_ZQ===true&&!!OUT.get(G,'guitar_zq_shop'),J({s,o:OUT.get(G,'guitar_zq_shop')&&{day:K(OUT.get(G,'guitar_zq_shop').day),h:OUT.get(G,'guitar_zq_shop').h}}));
      // 2-3 第 6 週週六
      const sat=TD('Y1S1',6,6), mBefore=G.money; const r=await outing(sat,14.0,16.0,['三千八那把']); const tx=r.lines.map(x=>x.t);
      const s3=idxSeq([T('c23a'),T('c23b'),T('c23c'),T('c23d'),T('c23e'),T('c23f'),T('c23g'),T('c23h'),T('c23r1'),T('c23tune'),T('c23out')]);
      check('A4 2-3 '+K(sat)+' 15:00 和子晴去同弦：台詞逐字、「三千八那把。」→ 她那一句 → 調音裝袋 → 出來那一句',r.q!=null&&s3.ok,J({q:r.q,miss:s3.miss,first:r.lines.length?K(r.lines[0].d)+' '+hm(r.lines[0].h):null,tx:tx.slice(0,16)}));
      check('A5 2-3 九折 3,420：錢 −3,420、OWN_GUITAR、第一句在 15:00',mBefore-G.money===3420&&!!G.flags.OWN_GUITAR&&r.lines.length&&hm(r.lines[0].h)==='15:00',J({d:mBefore-G.money,own:G.flags.OWN_GUITAR,t:r.lines.length&&hm(r.lines[0].h)}));
    }
  }
  const ownN=Object.entries(narr).filter(([k,L])=>L.includes(T('n24own')));
  info('A 每一次社課的最後一句：'+J(Object.entries(narr).map(([k,L])=>[k,L[L.length-1]])));
  check('A6 2-4 有琴：第 7 週起「'+T('n24own')+'」出現（一學期一次）',ownN.length===1&&ownN[0][0]>=K(TD('Y1S1',7,1)),J(ownN.map(x=>x[0])));
  // 宜蘭報名
  const ann=S.annDay('y1s1'); at(ann,21.1,'wancai'); tick(); const post=(G.msgs||[]).find(m=>m.tag===askId('y1s1'));
  check('A7 宜蘭報名表：'+K(ann)+' 21:00 群組社長學長「'+T('yPost')+'」',!!post&&K(post.day)===K(ann)&&post.h===21&&post.text===T('yPost'),J(post&&{d:K(post.day),h:post.h,text:post.text}));
  const m1=G.money; const okA=PHONE.answer(G,askId('y1s1'),0); const o=OUT.get(G,'guitar_trip_yilan');
  check('A8 回「報名」：扣 2,500、排出遊 '+K(S.tripDay('y1s1'))+' 08:00 校門口',m1-G.money===2500&&!!o&&K(o.day)===K(S.tripDay('y1s1'))&&o.h===8,J({ans:okA,d:m1-G.money,o:o&&{day:K(o.day),h:o.h,place:o.place}}));
  // 宜蘭整趟
  const r=await outing(S.tripDay('y1s1'),7.5,8.5,['去跟子晴說話','彈社課教的那首','上頂樓透氣','那是什麼歌','我覺得很好聽']);
  info('A 宜蘭每一句的時間：'+J(r.lines.map(x=>[K(x.d)+' '+hm(x.h),(x.who?x.who+'：':'')+x.t.slice(0,24)])));
  const want=['yBus','ySea','ySea2','yTalk','yBbq','yTurn','yOwnCase','yPlayed','y12','yUp','yTune','yAsk1','yAsk2','yNice','yThx','yMorn','yLuo','yBack1'];
  const s=idxSeq(want.map(T)); check('A9 宜蘭整趟台詞照順序逐字（有自己的琴＝拿出自己的琴；上頂樓、問了；回程有耳機那一句）',s.ok,J({miss:s.miss}));
  const tt={bus:timeOf(T('yBus')),sea:timeOf(T('ySea')),bbq:timeOf(T('yBbq')),twelve:timeOf(T('y12')),morn:timeOf(T('yMorn')),luo:timeOf(T('yLuo')),back:timeOf(T('yBack1'))}, d0=K(S.tripDay('y1s1')), d1=K(S.tripDay('y1s1')+1);
  check('A10 時間：08:00 遊覽車、14:00 海邊、19:00 民宿、隔天 00:15 頂樓、08:30 卜肉、14:00 羅東、15:00 回程（'+d0+'～'+d1+'）',tt.bus===d0+' 08:00'&&tt.sea===d0+' 14:00'&&tt.bbq===d0+' 19:00'&&tt.twelve===d1+' 00:15'&&tt.morn===d1+' 08:30'&&tt.luo===d1+' 14:00'&&tt.back===d1+' 15:00',J(tt));
  check('A11 回到學校 '+d1+' 17:00；ZQ_ROOFTOP_TUNE、子晴的記憶 HEARD_HER_SONG；有自己的琴＝沒有 BORROWED_ZQ_GUITAR',K(G.day)===d1&&hm(G.hour)==='17:00'&&G.flags.ZQ_ROOFTOP_TUNE===true&&SOCIAL.has(ZQ,'HEARD_HER_SONG')&&!G.flags.BORROWED_ZQ_GUITAR,J({now:K(G.day)+' '+hm(G.hour),roof:G.flags.ZQ_ROOFTOP_TUNE,mem:SOCIAL.has(ZQ,'HEARD_HER_SONG'),bor:G.flags.BORROWED_ZQ_GUITAR}));
});

/* ---------- B 沒琴、2-3 我再想想、宜蘭借琴、回房間 ---------- */
await sec('B 沒琴、借子晴的琴、回房間睡覺',async()=>{
  const days=CLUB_DAYS('Y1S1',12); const G=fresh(days[0].d,9); const narr={};
  for(const c of days){
    if(c.d>S.tripDay('y1s1')) break;
    const picks=c.w===5&&c.wd===1?[0,'「好。」']:(c.w===6&&c.wd===3?['「好，禮拜六。」']:[0]);
    narr[K(c.d)]=await attend(c.d,picks);
    if(c.w===6&&c.wd===3){ const m0=G.money; const r=await outing(TD('Y1S1',6,6),14.0,16.0,['我再想想']); const tx=r.lines.map(x=>x.t);
      check('B1 2-3「我再想想。」：她那一句、不扣錢、沒有 OWN_GUITAR；出來那一句照說',tx.includes(T('c23r3'))&&tx.includes(T('c23out'))&&m0===G.money&&!G.flags.OWN_GUITAR,J({tx:tx.slice(-4),d:m0-G.money})); }
  }
  const loan=Object.entries(narr).filter(([k,L])=>L.includes(T('n24loan')));
  check('B2 2-4 沒有琴：偶爾「'+T('n24loan')+'」（出現 '+loan.length+' 次、不是第一次社課、不連續）',loan.length>=1&&!loan.some(([k])=>k===K(days[0].d)),J(loan.map(x=>x[0])));
  at(S.annDay('y1s1'),21.1,'wancai'); tick(); PHONE.answer(G,askId('y1s1'),0);
  const r=await outing(S.tripDay('y1s1'),7.5,8.5,['留在圈子裡唱','彈社課教的那首','回房間睡覺']); const s=idxSeq(['yTurn','yHand','yFresh','yPlayed','y12','yRoom','yMorn','yLuo','yBack0'].map(T));
  check('B3 宜蘭：沒有自己的琴＝子晴遞琴「弦剛換過。」→ 彈＝BORROWED_ZQ_GUITAR；「回房間睡覺。」那一句 → 回程沒去那一版；沒有頂樓',s.ok&&G.flags.BORROWED_ZQ_GUITAR===true&&!G.flags.ZQ_ROOFTOP_TUNE&&!texts().includes(T('yUp'))&&!texts().includes(T('yBack1')),J({miss:s.miss,bor:G.flags.BORROWED_ZQ_GUITAR,roof:G.flags.ZQ_ROOFTOP_TUNE}));
});

/* ---------- C 錢不夠 ---------- */
await sec('C 錢不夠：下次吧。',async()=>{
  const days=CLUB_DAYS('Y1S1',11); const G=fresh(days[0].d,9,{},20000);
  for(const c of days) await attend(c.d,c.w===5&&c.wd===1?[0,0]:(c.w===6&&c.wd===3?['我自己去就好']:[0]));
  G.money=1200; at(S.annDay('y1s1'),21.1,'wancai'); tick(); const m0=G.money; PHONE.answer(G,askId('y1s1'),0);
  const mine=(G.msgs||[]).filter(m=>m.from==='player'&&m.text===T('poor'));
  check('C1 錢 1,200 回「報名」：群組裡我說「下次吧。」、不扣錢、沒有出遊',mine.length===1&&G.money===m0&&!OUT.get(G,'guitar_trip_yilan'),J({mine:mine.length,d:m0-G.money,o:!!OUT.get(G,'guitar_trip_yilan')}));
});

/* ---------- D 第一次社課就有自己的琴 ---------- */
await sec('D 第一次社課就有琴（AA_693 A4）',async()=>{
  const d=TD('Y1S1',5,1); const G=fresh(d,9,{OWN_GUITAR:'entry'}); S.rec(G).items.entry=d-3; const L=await attend(d,[0]);
  const s=idxSeq([T('c21a'),T('c21b'),T('c21own'),T('c21d'),T('c21e'),T('c21touch')]);
  check('D1 2-1 有琴的那一版逐字（你也舉了、按了一下你的弦）；沒有選項；旁白不換成鏽弦',s.ok&&!L.includes(T('c21rust'))&&!L.includes(T('c21no')),J({miss:s.miss,L:L.slice(-8)}));
});

/* ---------- E 2-3 之前自己買了琴 ---------- */
await sec('E 2-3 之前已經自己買了琴（AA_693 A10）',async()=>{
  const days=CLUB_DAYS('Y1S1',6); const G=fresh(days[0].d,9);
  for(const c of days){ if(c.d>TD('Y1S1',6,3)) break; await attend(c.d,c.w===5&&c.wd===1?[0,0]:(c.w===6&&c.wd===3?['「好，禮拜六。」']:[0])); }
  /* 週四下午自己去同弦買（照遊戲的買東西選單）*/
  const thu=TD('Y1S1',6,4); at(thu,15.0,'xs_tongxian'); WANT=['民謠吉他 入門款']; const m0=G.money; await S.shop(GM); await settle();
  check('E1 週四自己去同弦買入門款（社員九折 3,420）：OWN_GUITAR',!!G.flags.OWN_GUITAR&&m0-G.money===3420,J({own:G.flags.OWN_GUITAR,d:m0-G.money}));
  const r=await outing(TD('Y1S1',6,6),14.0,16.0,[0]); const tx=r.lines.map(x=>x.t); const s=idxSeq([T('c23own1'),T('c23own2'),T('c23own3'),T('c23c'),T('c23d'),T('c23out')]);
  check('E2 2-3 不取消、照約見面：她看了一眼琴袋、陪她買弦；沒有試琴、沒有買琴；出來那一句照說',r.q!=null&&s.ok&&!tx.includes(T('c23f'))&&!tx.includes(T('c23h')),J({q:r.q,miss:s.miss,tx}));
});

/* ---------- F 偶遇子晴 ---------- */
await sec('F 偶遇子晴（第 6、10、14 週週六 15:00～16:00）',async()=>{
  const days=CLUB_DAYS('Y1S1',6); const G=fresh(days[0].d,9);
  for(const c of days){ if(c.d>TD('Y1S1',6,3)) break; await attend(c.d,c.w===5&&c.wd===1?[0,0]:(c.w===6&&c.wd===3?['「我自己去就好。」']:[0])); }
  check('F0 2-2「我自己去就好。」：她那一句「'+T('c22self')+'」、沒有出遊',texts().includes(T('c22self'))&&!OUT.get(G,'guitar_zq_shop'),'');
  const res=[];
  for(const [w,h] of [[6,14.9],[6,16.05],[6,15.3],[10,15.3],[14,15.3]]){ const d=TD('Y1S1',w,6); at(d,h,'xs_tongxian'); const L0=LOG.length; try{ await S.tick(GM); }catch(e){} await settle(); res.push([w,hm(h),LOG.slice(L0).map(x=>x.t)]); }
  info('F 每一次在店裡：'+J(res)); { const e=LOG.filter(x=>x.t===T('enc1')||x.t===T('enc3')); info('F 偶遇那兩句的說話人：'+J(e.map(x=>x.who))+'；子晴的名字公開了沒（SOCIAL.displayName）：'+J(SOCIAL.displayName?SOCIAL.displayName(ZQ):null)); }
  const hit=res.filter(r=>r[2].includes(T('enc1')));
  check('F1 第 6 週週六 15:18 在同弦：她兩句、旁白一句逐字（14:54、16:03 不演）',!!res[2][2].length&&idxSeq([T('enc1'),T('enc2'),T('enc3')]).ok&&!res[0][2].length&&!res[1][2].length,J(res.slice(0,3)));
  check('F2 一個存檔一次：第 10、14 週不再演',hit.length===1,J(hit.map(x=>x[0])));
});

/* ---------- G 同弦營業時間 ---------- */
await sec('G 同弦營業時間',async()=>{
  const G=fresh(TD('Y1S1',6,2),12,{}); const tue=TD('Y1S1',6,2), mon=TD('Y1S1',6,1); const r=[];
  for(const [d,h] of [[tue,11.98],[tue,12.0],[tue,21.48],[tue,21.5],[mon,15.0]]){ at(d,h,'xinsheng'); r.push([K(d)+'('+'日一二三四五六'[wd7(d)]+') '+hm(h),S.isOpen(G)]); }
  check('G1 12:00～21:30 開、週一休（'+J(r)+'）',r[0][1]===false&&r[1][1]===true&&r[2][1]===true&&r[3][1]===false&&r[4][1]===false,J(r));
  const ty=(typeof PLACES!=='undefined'&&PLACES.typhoonDays)?null:null; let tday=null; for(let d=TD('Y1S1',1,1);d<TD('Y2S2',18,6);d++){ if(PLACES.typhoonClosed&&PLACES.typhoonClosed('xs_tongxian',d)){ tday=d; break; } }
  if(tday!=null){ at(tday,15,'xinsheng'); check('G2 颱風天（'+K(tday)+'）關：'+J(S.closedText?S.closedText(G):null),!S.isOpen(G),''); } else check('G2 找得到颱風天（PLACES.typhoonClosed）',false,'');
  /* 打烊時人在店裡＝老闆一句（AA_693 A3）*/
  at(tue,21.45,'xs_tongxian'); const L0=LOG.length; for(let h=21.45;h<=21.6;h+=0.05){ at(tue,h,'xs_tongxian'); try{ await S.tick(GM); }catch(e){} await settle(); if(LOG.length>L0) break; }
  const L=LOG.slice(L0).map(x=>(x.who?x.who+'：':'')+x.t);
  check('G3 21:30 還在店裡：「老闆：'+T('close')+'」',L.some(t=>t.endsWith(T('close'))),J(L));
});

/* ---------- H 陽明山 ---------- */
await sec('H 陽明山一日（大一下第 10 週）',async()=>{
  for(const roof of [true,false]){
    const days=CLUB_DAYS('Y1S2',10); const G=fresh(days[0].d,9,{CLUB_club_guitar:true});
    if(roof){ G.flags.ZQ_ROOFTOP_TUNE=true; SOCIAL.remember(ZQ,'HEARD_HER_SONG',''); }
    for(const c of days) await attend(c.d,[0]);
    const ann=S.annDay('y1s2'); at(ann,21.1,'wancai'); tick(); const post=(G.msgs||[]).find(m=>m.tag===askId('y1s2')); const m0=G.money; PHONE.answer(G,askId('y1s2'),0);
    const o=OUT.get(G,'guitar_trip_yms');
    if(roof){ check('H1 陽明山報名：'+K(ann)+' 21:00「'+T('mPost')+'」；報名扣 600；排 '+K(S.tripDay('y1s2'))+' 10:00 校門口',!!post&&K(post.day)===K(ann)&&post.h===21&&post.text===T('mPost')&&m0-G.money===600&&!!o&&o.h===10,J({post:post&&[K(post.day),post.h,post.text],d:m0-G.money,o:o&&[K(o.day),o.h]})); }
    const r=await outing(S.tripDay('y1s2'),9.5,10.5,['留下來彈']); const tx=r.lines.map(x=>x.t);
    info('H 陽明山（'+(roof?'有':'沒有')+' ZQ_ROOFTOP_TUNE）每一句的時間：'+J(r.lines.map(x=>[hm(x.h),x.t.slice(0,20)])));
    const st=timeOf(T('mStart')), end=K(G.day)+' '+hm(G.hour);
    check('H'+(roof?'2':'3')+' '+(roof?'有':'沒有')+' ZQ_ROOFTOP_TUNE：出發 10:00「'+T('mStart')+'」、子晴「'+(roof?T('mTune'):T('mWind'))+'」、「'+T('mCircle')+'」；回到 18:00',st===K(S.tripDay('y1s2'))+' 10:00'&&tx.includes(roof?T('mTune'):T('mWind'))&&!tx.includes(roof?T('mWind'):T('mTune'))&&tx.includes(T('mCircle'))&&end===K(S.tripDay('y1s2'))+' 18:00',J({st,end,has:[tx.includes(T('mTune')),tx.includes(T('mWind')),tx.includes(T('mCircle'))]}));
  }
});
console.log('\n'+(FAILS?'FAILED '+FAILS+'：'+FL.join('、'):'ALL PASS '+PASSES)+'（判定歸 BB）');
process.exit(FAILS?1:0);
})();
