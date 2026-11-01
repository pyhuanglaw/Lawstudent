// AA_296 2-3-1「只用手機演的重要劇情：改成當面或演出來的電話」五項（企劃線 3f406dbc，AA-C 2026-10-21 定稿；④ 台中版 ed0daea9，AA 10-22 08:41；任務 AA296-PHONE-LIVE-1021）——不需要瀏覽器。
//   0  逐字對稿：從 git 讀 ed0daea9 的稿（第 2-3-1 節），每一項程式碼區塊裡的句子（旁白、「人物：句子」、選項、各選項的回答）和遊戲實際演出來的比（照順序、一字不差）；
//      沒接的替代版＝稿上寫的「現在」那幾則私訊（照原本的字）
//   ①  以安新 18，美國路線、和以安交往中：臺灣 22:00（當地 10:00）她打來的視訊（前 2 小時才排、不跳「排進行程」、只有「接起來」）；AN_CHOICE video、AN_CHOICE_TOLD「第一批知道」；
//      三選一照 AN18（交往版）、第三個是「知道。Alison 說我背叛憲法。」那一版；沒接（睡著、在忙）＝原本兩則私訊（AN_CHOICE dm）；沒交往＝照舊群組；讀 AN_CHOICE 的地方（以安 A7-L5）video 當成 here
//   ②  子晴 Q15 回答.exe：場面裡兩個選項；選貼紙＝ZQ_EXE_REPLY、手機那段補上貼圖、交往、接著演她打來；選「還沒想好」＝手機按鈕留到隔天 21:00、之後在手機回貼紙＝她馬上打來；
//      到期限還是沒回＝21:00 她打來（not_question 拿掉最後一句）；沒接＝原本那一則私訊；回了貼紙＝不回的那一通取消
//   ③  可昕考上律師（交往中、沒報 2029 國考）：12/14 15:05 她打來（兩個選項、最後一句旁白、不排出遊）；過了 16:00 還沒演到＝原本兩則私訊；跳到下一件事停在 15:05；9/7 照用私訊
//   ④  沛珊回來（消失期傳過訊息、沒交往）：2027-08-07 21:00 她打來（三個選項）；沒接＝原本兩則私訊；PS_BACK_READ 照舊記那一天（放榜後重新聯絡上）；沒傳過、交往中照舊
//   ⑤  芷若答應奕廷的約，日本路線：22:07 的私訊不傳；8/5 回國以後第一次進 Café 當面說（過去式那兩句）；8/5 以前、9/1 以後沒有；臺灣路線照舊
//   停點 跳過時間碰到這幾通電話停下來（AA 10-22 08:41；睡覺照舊算沒接）：CLS.skipStops 有「手機響了」——①當地 10:00、② 21:00、③ 15:05、④ 21:00；條件不成立的沒有
// 修改前（開發分支 b947f4eb）：FAIL 見任務回報；ed0daea9 那兩句、停點（開發分支 0eb26ed0）FAIL。用法：node tests/aa296_phone_live_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), {execSync}=require('child_process');
const {check,GM,E}=H;
const NAMES=/^(EXCH|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|Y2B|Y2B_EVENTS|Y34B|R2Y3B|R2Y3B_EVENTS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.CG_REGISTRY={};
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/exchange3d.js',
  'src/data/y2b_events.js','src/y2b3d.js','src/y34b3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };   /* 地點字幕（{scene}：「電話」「視訊」）*/
const J=JSON.stringify, D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h;

// ---------------- 讀稿 ----------------
const DOC=execSync('git -c core.quotepath=false show ed0daea9:"docs/story_planning/AA_296_只用手機演的重要劇情_盤點.md"',{cwd:H.ROOT,encoding:'utf8'});
const S231=(()=>{ const a=DOC.indexOf('### 2-3-1.'), b=DOC.indexOf('### 2-3-2.'); return a<0?'':DOC.slice(a,b<0?undefined:b); })();
const MK=['①','②','③','④','⑤'];
const ITEM=n=>{ const i=MK.indexOf(n), a=S231.indexOf('**'+n), b=i<4?S231.indexOf('**'+MK[i+1]):-1; return a<0?'':S231.slice(a,b<0?undefined:b); };
const q=s=>[...String(s).matchAll(/「([^」]*)」/g)].map(m=>m[1]);   /* 「」裡的字 */
const blocks=s=>[...String(s).matchAll(/```\n([\s\S]*?)```/g)].map(m=>m[1].split('\n').filter(l=>l.trim()));
const ln=s=>{ s=s.trim(); if(/^（[\s\S]*）$/.test(s)) return {who:null,t:s}; const m=s.match(/^([^：「（]{1,4})：(.+)$/); return m?{who:m[1],t:m[2]}:{who:'?',t:s}; };
/* 一個程式碼區塊：[電話]／[視訊]、句子、（選項）A／B／C、「A」→ 人物：回答、之後的句子；（…「」…）＝稿上的說明（① 的「三選一照 AN18」）*/
const parse=L=>{ const P={scene:null,intro:[],opts:null,br:{},after:[],notes:[]}; let cur=P.intro;
  for(const raw of L||[]){ const l=raw.replace(/\s+$/,''); const t=l.trim();
    if(/^\[(.+)\]$/.test(t)){ P.scene=t.slice(1,-1); continue; }
    if(t.startsWith('（選項）')){ P.opts=t.slice(4).split('／').map(x=>x.trim()); cur=P.after; continue; }
    const m=l.match(/^\s+(\S.*?)\s*→\s*(.+)$/); if(m&&P.opts){ P.br[m[1]]=ln(m[2]); continue; }
    if(/^（[\s\S]*「[\s\S]*）$/.test(t)){ P.notes.push(t); cur=P.after; continue; }
    cur.push(ln(t)); }
  return P; };
const want=(P,k)=>P.intro.concat(P.opts?[P.br[P.opts[k]]]:[],P.after);
const said=()=>H.said.map(s=>({who:s.who,t:s.t}));
/* 照順序一字不差；旁白對旁白；說話的人：稿上寫的名字要在對話框的名字裡（「子晴」在「高子晴」裡、「可昕」在「可昕（電話）」裡）*/
const same=(got,exp)=>!!exp&&got.length===exp.length&&exp.every((x,i)=>!!x&&got[i].t===x.t&&((got[i].who==null)===(x.who==null))&&(x.who==null||String(got[i].who||'').includes(x.who)));
const I1=ITEM('①'), I2=ITEM('②'), I3=ITEM('③'), I4=ITEM('④'), I5=ITEM('⑤');
const P1=parse(blocks(I1)[0]), P2a=parse(blocks(I2)[0]), P2b=parse(blocks(I2)[1]), P3=parse(blocks(I3)[0]), P4=parse(blocks(I4)[0]), P5=parse(blocks(I5)[0]);
const nowDm=s=>q((String(s).split('\n').find(l=>/^- 現在/.test(l))||''));   /* 「現在只有兩則私訊：「…」「…」」那一行 */
const DM1=nowDm(I1), DM3=nowDm(I3), DM4=nowDm(I4);
const EXE_OPTS=q((I2.split('\n').find(l=>/直接在場面裡給兩個選項/.test(l))||'').replace(/^[^：]*：/,'')).slice(0,2);
check('0. 讀到稿：ed0daea9 第 2-3-1 節五項；①②③④⑤ 的程式碼區塊、沒接的那幾則私訊、② 場面裡的兩個選項都找得到',
  S231.length>0&&P1.intro.length===5&&P1.after.length===2&&P2a.intro.length===7&&P2b.intro.length===6&&P3.opts&&P3.opts.length===2&&P4.opts&&P4.opts.length===3&&P5.intro.length===2&&DM1.length===2&&DM3.length===2&&DM4.length===2&&EXE_OPTS.length===2,
  J({P1:[P1.intro.length,P1.after.length],P2a:P2a.intro.length,P2b:P2b.intro.length,P3:P3.opts,P4:P4.opts,P5:P5.intro.length,DM1,DM3,DM4,EXE_OPTS}));
check('0. 稿上 ① 的三選一（「'+(q(P1.notes[0]||'').slice(0,3).join('」「'))+'」）照 AN18、第三個用「'+(q(P1.notes[0]||'')[3]||'')+'」那一版',q(P1.notes[0]||'').length===4&&/Alison 說我背叛憲法/.test(q(P1.notes[0]||'')[3]||''),J(P1.notes));

// ---------------- 共用 ----------------
const sec=async(name,f)=>{ try{ await f(); }catch(e){ check(name+'：沒有例外',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' | ')); } };
const fresh=(key,h,zone,flags,route)=>{ const G=H.fresh(key,h,zone||'dorm',Object.assign({EXCHANGE_ROUTE:route||'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true,metAn:true,ROOM_Y2:300,ROOM_Y3:600},flags||{}));
  G.acts={att:{}}; G.outings=[]; G.contacts=G.contacts||{}; H.at(key,h); G.zone=zone||'dorm'; GM.npc={}; caps.length=0; return G; };
const at=(key,h)=>H.at(key,h), atD=(d,h)=>PG.setT(H.G,E,d,h);
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const th=t=>(H.G.msgs||[]).filter(m=>m.th===t).map(m=>m.text);
const from=(t,who)=>(H.G.msgs||[]).filter(m=>m.th===t&&m.from===who).map(m=>m.text);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const run=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=picks||[]; caps.length=0; await EVENTS.run(ev(id)); };
const goOut=async(id,picks)=>{ const q0=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=picks||[]; caps.length=0; if(!q0) return false; await OUT.go(GM,q0); return true; };
const date=id=>{ const G=H.G; G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const ct=id=>{ H.G.contacts[id]=1; };
const memNote=(id,tag)=>{ const L=(H.G.social&&H.G.social.mem&&H.G.social.mem[id])||[]; const m=L.find(x=>x.tag===tag); return m?m.note:null; };

(async()=>{
  /* ======================= ① 以安新 18，美國路線、和以安交往中：視訊 ======================= */
  await sec('①',async()=>{
    const d=D('2028-10-19'), V=typeof Y34B!=='undefined'&&Y34B.AN18_VIDEO?Y34B.AN18_VIDEO.id:'y4_an18_video';
    const usAn=(h)=>{ const G=fresh('2028-10-19',h,'us_apartment',{US_DEPARTED:true,US_ARRIVED:true},'US'); H.FAMILIAR('heroine_01'); date('heroine_01'); return G; };
    let G=usAn(7.5); rules();
    const q0=OUT.get(G,V);
    at('2028-10-19',7.99); rules(); const early=!OUT.get(G,V);
    at('2028-10-19',8); rules(); const qv=OUT.get(G,V);
    check('① 美國路線、和以安交往中：當地 08:00 以前還沒排；08:00 排「以安打視訊來」10:00（臺灣 22:00）——只有「接起來」、不跳「排進行程」；沒有私訊、AN_CHOICE 還沒記',
      !q0&&early&&!!qv&&qv.day===d&&Math.abs(qv.h-10)<1e-6&&qv.must===true&&qv.place==='視訊'&&qv.verb==='接起來'&&qv.silent===true&&!th('p:heroine_01').length&&G.flags.AN_CHOICE==null,J(qv));
    at('2028-10-19',9.7); const nd=OUT.due(G); at('2028-10-19',9.76); const due=OUT.due(G);
    check('① 09:45 起問「接起來」（09:42 還沒）',!nd&&!!due&&due.id===V,J(due&&due.id));
    await goOut(V,[0]);
    const s=said(), m0=P1.intro.length, a0=s.slice(0,m0), z0=s.slice(-P1.after.length);
    check('① 視訊：開頭旁白＋她四句、結尾「……你那邊早上十點了。先去上課。」「（她先掛了。）」照稿一字不差',same(a0,P1.intro)&&same(z0,P1.after),J(s));
    check('① 地點字幕「視訊」、背景視訊；三個選項照 AN18「'+q(P1.notes[0]||'').slice(0,3).join('」「')+'」',caps.includes('視訊')&&H.bgs.some(b=>J(b)===J(OUT.bg('video')))&&J(H.opts[0])===J(q(P1.notes[0]||'').slice(0,3).map(x=>'「'+x+'」')),J({caps,opts:H.opts}));
    check('① 接了：AN_CHOICE video、AN_CHOICE_TOLD「第一批知道」、視訊 done；沒有私訊、沒有群組',G.flags.AN_CHOICE==='video'&&memNote('heroine_01','AN_CHOICE_TOLD')==='第一批知道'&&OUT.get(G,V).state==='done'&&!th('p:heroine_01').length&&!th('g:noodle_team').length,J([G.flags.AN_CHOICE,memNote('heroine_01','AN_CHOICE_TOLD'),OUT.get(G,V).state]));
    /* 三選一的回答＝AN18 交往版同一個選項的回答（臺灣路線萬才館走廊那一場）*/
    const mid=[], an18=[];
    for(const k of [0,1,2]){ G=usAn(9.8); at('2028-10-19',8); rules(); at('2028-10-19',9.8); await goOut(V,[k]); const s2=said(); mid.push(s2.slice(m0,s2.length-P1.after.length).map(x=>x.t));
      fresh('2028-10-19',21.6,'wancai'); H.FAMILIAR('heroine_01'); date('heroine_01'); H.G.acts.att['public_law_group@'+d]={end:'full'}; await run('ev_an_her_choice',[k]); an18.push(said().slice(4).map(x=>x.t)); }
    check('① 三個選項各自的回答＝AN18 交往版（第三個「知道。Alison 說我背叛憲法。」「……她講完就去幫我印商法的考古題了。」，不是 Alison 在旁邊那一版）',J(mid)===J(an18)&&mid[2][0]==='知道。Alison 說我背叛憲法。'&&mid[0].length>0,J({mid,an18}));
    /* 沒接：睡過了（排了、過了 10:30 才回到遊戲）＝原本兩則私訊 */
    G=usAn(7.5); at('2028-10-19',8.5); rules(); at('2028-10-20',7.5); OUT.tick(GM); PHONE.tick(G);
    check('① 沒接（睡過了：出遊過期）＝原本兩則私訊「'+DM1.join('」「')+'」、時間是當地 10:00；AN_CHOICE dm、AN_CHOICE_TOLD「第一批知道」',J(th('p:heroine_01'))===J(DM1)&&(G.msgs||[]).filter(m=>m.th==='p:heroine_01').every(m=>m.day===d&&Math.abs(m.h-10)<0.05)&&G.flags.AN_CHOICE==='dm'&&memNote('heroine_01','AN_CHOICE_TOLD')==='第一批知道'&&OUT.get(G,V).state==='missed',J([th('p:heroine_01'),G.flags.AN_CHOICE,OUT.get(G,V)&&OUT.get(G,V).state]));
    G=usAn(7.5); at('2028-10-19',8.5); rules(); at('2028-10-19',10.6); rules(); PHONE.tick(G);   /* OUT.tick 沒跑（例：人在家）：規則自己記沒接 */
    check('① 沒接（在忙：過了 30 分鐘，OUT.tick 沒跑）＝規則自己記沒接、照兩則私訊',J(th('p:heroine_01'))===J(DM1)&&G.flags.AN_CHOICE==='dm'&&OUT.get(G,V).state==='missed',J([th('p:heroine_01'),G.flags.AN_CHOICE]));
    G=usAn(11); rules(); PHONE.tick(G);
    check('① 那一段沒跑到規則（11:00 才進遊戲）＝不排視訊、照兩則私訊',!OUT.get(G,V)&&J(th('p:heroine_01'))===J(DM1)&&G.flags.AN_CHOICE==='dm');
    /* 沒交往＝照舊（群組）；臺灣路線＝照舊 */
    G=fresh('2028-10-19',8,'us_apartment',{US_DEPARTED:true,US_ARRIVED:true},'US'); H.FAMILIAR('heroine_01'); PHONE.join(G,'noodle_team','麵店團'); rules(); at('2028-10-19',10.1); rules();
    check('① 美國路線、沒交往：不打視訊，照舊麵店團群組一則（AN_CHOICE group）',!OUT.get(G,V)&&th('g:noodle_team').includes('我決定了。考首都帝大法研所，商法組。')&&G.flags.AN_CHOICE==='group');
    G=fresh('2028-10-19',20,'dorm'); H.FAMILIAR('heroine_01'); date('heroine_01'); PHONE.join(G,'noodle_team','麵店團'); rules(); at('2028-10-19',22.1); rules();
    check('① 臺灣路線、交往中、不在萬才館：照舊群組（不打視訊）',!OUT.get(G,V)&&G.flags.AN_CHOICE==='group');
    G=usAn(8); rules(); G.flags.dating_heroine_01=false; ROM.get(G,'heroine_01').status='ex'; at('2028-10-19',9.8); rules(); const qc=OUT.get(G,V);
    check('① 排好視訊以後不再交往：視訊取消（不打來）',!!qc&&qc.state==='cancelled'&&!OUT.due(G),J(qc&&qc.state));
    /* 讀 AN_CHOICE 的地方：以安 A7-L5（AA_378 #9）video 當成 here */
    const st=(LADDER.byTerm.Y4S1.heroine_01.steps||[]).find(x=>x.id==='A7-L5'), ch=an=>{ fresh('2028-10-30',15,'campus',an?{AN_CHOICE:an}:{}); return STORY.ladChoices(st).map(c=>c.t); };
    const cv=ch('video'), chere=ch('here'), cdm=ch('dm');
    check('① 以安 A7-L5：AN_CHOICE video 和 here 一樣出「妳媽媽後來呢？」；dm（私訊）照舊「妳媽媽知道嗎？」',!!st&&J(cv)===J(chere)&&cv.includes('「妳媽媽後來呢？」')&&cdm.includes('「妳媽媽知道嗎？」')&&!cdm.includes('「妳媽媽後來呢？」'),J({cv,chere,cdm}));
  });

  /* ======================= ② 子晴 Q15「回答.exe」 ======================= */
  await sec('②',async()=>{
    const X=R2Y3B, QT='te_Y3S2_heroine_04', C=X.ZQ_CALL||{sticker:'y3_zq_exe_call',none:'y3_zq_noreply_call'};
    const zqSetup=()=>{ fresh('2028-06-08',20.6,'dorm',{ZQ_DAD_HEARD:true,ATTENDED_SHOW:true}); H.CLOSE('heroine_04'); SOCIAL.rel('heroine_04').npcRom=40; ct('heroine_04'); const L=DATE.log(H.G,'heroine_04'); L.count=4; L.wish=true; for(const t of ['CLAPPED','PLAYTESTED','TOLD_HER_CHANGE']) SOCIAL.remember('heroine_04',t,''); rules(); };
    const zqDinner=async pk=>{ PHONE.answer(H.G,QT,0); rules(); const q0=OUT.get(H.G,'te_Y3S2'); atD(q0.day,21.8); H.picks=pk; await OUT.go(GM,q0); return q0; };   /* [前置] 學期末的飯、回家的路上說出來（r2y3b_events_unit 的 Q15 那一段）*/
    const exeAt=async(q0,pk)=>{ atD(q0.day+1,12.1); rules(); H.said=[]; H.opts=[]; H.cards=[]; H.picks=pk; caps.length=0; await X.exeScene(GM); };
    const zth=()=>th('p:heroine_04'), zmine=()=>from('p:heroine_04','player');
    // a. 場面裡選貼紙
    zqSetup(); let q0=await zqDinner(['妳下一個遊戲']); await exeAt(q0,[0]);
    const s=said(), i0=s.findIndex(x=>x.t===P2a.intro[0].t);
    check('② 回答.exe 最後那一行字（「第一個玩家：祐廷」）疊完，場面裡兩個選項「'+EXE_OPTS.join('」「')+'」（不用開手機）',H.cards.some(c=>c[0]==='第一個玩家：祐廷')&&J(H.opts[H.opts.length-1])===J(EXE_OPTS),J({cards:H.cards,opts:H.opts}));
    check('② 選貼紙：接著演她打來（地點字幕「電話」），台詞照稿一字不差',i0>0&&same(s.slice(i0),want(P2a))&&caps.includes('電話'),J(s));
    const m=PHONE.byAsk(H.G,'y3_zq_exe');
    check('② 選貼紙＝照手機那顆按鈕：ZQ_EXE_REPLY、手機那段對話補上「（貼圖：插座貓）」（按鈕回過了）、交往、這學期 yes；不另外排電話',H.G.flags.ZQ_EXE_REPLY===true&&zmine().includes('（貼圖：插座貓）')&&!!m&&m.ans===0&&H.G.flags.dating_heroine_04===true&&TERMEND.rec(H.G,'Y3S2').result==='yes'&&!OUT.get(H.G,C.sticker)&&H.G.flags.ZQ_Q15.call==='scene',J({mine:zmine(),ans:m&&m.ans,q:H.G.flags.ZQ_Q15}));
    atD(q0.day+2,21.1); rules(); check('② 選了貼紙：隔天 21:00 沒有不回的那一通、沒有那一則私訊',!OUT.get(H.G,C.none)&&!PHONE.sent(H.G,'y3_zq_noreply'));
    // b. 還沒想好 → 之後手機回貼紙＝她馬上打來
    zqSetup(); q0=await zqDinner(['喜歡很久了']); await exeAt(q0,[1]);
    const m1=PHONE.byAsk(H.G,'y3_zq_exe');
    check('② 選「還沒想好怎麼回」：沒有電話、還沒交往、手機的按鈕還在（留到隔天 21:00）',J(H.opts[H.opts.length-1])===J(EXE_OPTS)&&!said().some(x=>x.t===P2a.intro[1].t)&&!H.G.flags.ZQ_EXE_REPLY&&!H.G.flags.dating_heroine_04&&PHONE.askOpen(H.G,m1)&&m1.ask.until===T(q0.day+2,21)&&!OUT.get(H.G,C.sticker),J({said:said().map(x=>x.t),until:m1&&m1.ask.until}));
    atD(q0.day+1,18); PHONE.answer(H.G,'y3_zq_exe',0); rules(); const qs=OUT.get(H.G,C.sticker);
    check('② 之後在手機回了貼紙＝交往、她馬上打來（排「子晴打電話來」、現在就問「接起來」、只有接起來）',H.G.flags.dating_heroine_04===true&&!!qs&&qs.day===q0.day+1&&Math.abs(qs.h-18)<1e-6&&qs.must===true&&(OUT.due(H.G)||{}).id===C.sticker,J(qs));
    await goOut(C.sticker); check('② 手機回的那一通：台詞照稿一字不差',same(said(),want(P2a)),J(said()));
    // c. 到期限還是沒回＝21:00 她打來
    zqSetup(); q0=await zqDinner(['妳下一個遊戲']); await exeAt(q0,[1]);
    atD(q0.day+2,18.9); rules(); const noYet=!OUT.get(H.G,C.none);
    atD(q0.day+2,19); rules(); const qn=OUT.get(H.G,C.none);
    check('② 不回：收到檔案的隔天 19:00 才排 21:00「子晴打電話來」（前 2 小時、不跳「排進行程」、只有接起來）；那時還沒有私訊、還沒定案',noYet&&!!qn&&qn.day===q0.day+2&&qn.h===21&&qn.must===true&&qn.silent===true&&!PHONE.sent(H.G,'y3_zq_noreply')&&H.G.flags.ZQ_Q15.res==null,J(qn));
    atD(q0.day+2,20.76); const dn=OUT.due(H.G); await goOut(C.none);
    check('② 20:45 起問「接起來」；21:00 她打來，台詞照稿一字不差（選「第一個玩的」那一支，有「這次是直述句。」）',!!dn&&dn.id===C.none&&same(said(),want(P2b)),J(said()));
    rules(); check('② 接了：這學期不交往（讓我想想）、沒有那一則私訊',H.G.flags.ZQ_Q15.res==='none'&&TERMEND.rec(H.G).think.heroine_04==='Y3S2'&&!H.G.flags.dating_heroine_04&&!PHONE.sent(H.G,'y3_zq_noreply'));
    zqSetup(); q0=await zqDinner(['這不是問句']); await exeAt(q0,[1]); atD(q0.day+2,19.5); rules(); atD(q0.day+2,20.8); await goOut(C.none);
    const nq=want(P2b).filter(x=>x.t!=='這次是直述句。');
    check('② 選「這不是問句」的那一支：電話一樣拿掉最後一句「這次是直述句。」',P2b.intro.some(x=>x.t==='這次是直述句。')&&same(said(),nq),J(said()));
    // d. 沒接＝原本那一則私訊
    zqSetup(); q0=await zqDinner(['妳下一個遊戲']); await exeAt(q0,[1]); atD(q0.day+2,19.5); rules(); atD(q0.day+3,7.5); OUT.tick(GM); PHONE.tick(H.G);
    const X15=R2Y3B_EVENTS.Q15;
    check('② 不回、電話也沒接（睡過了）＝原本那一則私訊（時間 21:00）；台詞是電話那三句連起來（照原句）；這學期不交往',J(from('p:heroine_04','heroine_04').slice(-1))===J([X15.noReply])&&X15.noReply===P2b.intro.slice(2,5).map(x=>x.t).join('')&&(H.G.msgs||[]).some(x=>x.tag==='y3_zq_noreply'&&x.day===q0.day+2&&Math.abs(x.h-21)<0.05)&&H.G.flags.ZQ_Q15.res==='none'&&TERMEND.rec(H.G).think.heroine_04==='Y3S2',J(zth().slice(-2)));
    zqSetup(); q0=await zqDinner(['這不是問句']); await exeAt(q0,[1]); atD(q0.day+2,19.5); rules(); atD(q0.day+2,21.6); rules(); PHONE.tick(H.G);
    check('② 不回、在忙（過了 30 分鐘、OUT.tick 沒跑）＝規則自己記沒接，「這不是問句」那一支照原本「'+X15.noReplyNQ+'」',J(from('p:heroine_04','heroine_04').slice(-1))===J([X15.noReplyNQ])&&X15.noReplyNQ===P2b.intro.slice(2,4).map(x=>x.t).join('')&&OUT.get(H.G,C.none).state==='missed',J(zth().slice(-2)));
    // e. 電話排好以後在手機回了貼紙＝不回的那一通取消、她馬上打來
    zqSetup(); q0=await zqDinner(['妳下一個遊戲']); await exeAt(q0,[1]); atD(q0.day+2,19.5); rules(); PHONE.answer(H.G,'y3_zq_exe',0); rules();
    check('② 19:30 在手機回了貼紙：不回的那一通取消、交往、改排她馬上打來',OUT.get(H.G,C.none).state==='cancelled'&&H.G.flags.dating_heroine_04===true&&!!OUT.get(H.G,C.sticker)&&(OUT.due(H.G)||{}).id===C.sticker);
  });

  /* ======================= ③ 可昕考上律師（交往中、沒報 2029 國考）======================= */
  await sec('③',async()=>{
    const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
    const kx=(flags)=>{ const G=H.fresh('2029-08-04',8,'dorm',Object.assign({BAR_REG:false},flags||{})); graduated(G); H.FRIEND('kexin'); H.date('kexin'); return G; };
    let G=kx(); H.at('2029-12-14',10); H.tick();
    const ns=PG.nextStop(G);
    check('③ 12/14 10:00：跳到下一件事停在 15:05（她打來的那一場），不是 15:05 的私訊',Math.abs(ns-T(D('2029-12-14'),15+5/60))<1e-6&&!(PHONE.rec(G).q||[]).some(x=>x.tag==='pg_r2kx_2029'),J(ns));
    H.at('2029-12-14',15.2); H.tick(); const s0=PG.due(G);
    check('③ 15:05：她打來（場景 kx_bar_2029）；沒有那兩則私訊',!!s0&&s0.id==='kx_bar_2029'&&!H.msgs('p:kexin').includes('律師考試放榜了。我上了。'),J(s0&&s0.id));
    H.said=[]; H.opts=[]; H.picks=[0]; await PG.runStep(GM,s0);
    check('③ 選「'+P3.opts[0]+'」：台詞照稿一字不差（旁白、她三句、回答、最後一句旁白）',same(said(),want(P3,0))&&J(H.opts[0])===J(P3.opts),J({said:said(),opts:H.opts}));
    H.at('2029-12-14',16.5); H.tick();
    check('③ 演完：不排出遊、沒有私訊',!OUT.rec(G).some(x=>/kx|kexin/.test(x.id)&&x.day===D('2029-12-14'))&&!H.msgs('p:kexin').includes('律師考試放榜了。我上了。')&&PG.done(G,'kx_bar_2029'));
    G=kx(); H.at('2029-12-14',15.1); H.tick(); H.said=[]; H.opts=[]; H.picks=[1]; await PG.runStep(GM,PG.due(G));
    check('③ 選「'+P3.opts[1]+'」：她回「三遍。第三遍才敢相信。」，照稿一字不差',same(said(),want(P3,1)),J(said()));
    /* 沒接：15:05～16:00 都在別的劇情、出遊裡 */
    G=kx(); H.at('2029-12-14',14); H.tick(); H.at('2029-12-14',16.1); H.tick(); PG.due(G); PHONE.tick(G);
    check('③ 過了 16:00 還沒演到（在忙）＝原本兩則私訊「'+DM3.join('」「')+'」（15:05）；那一場記 missed',J(H.msgs('p:kexin').slice(-2))===J(DM3)&&(G.msgs||[]).filter(m=>m.tag==='pg_r2kx_2029').every(m=>Math.abs(m.h-(15+5/60))<0.05)&&PG.rec(G).done.kx_bar_2029==='missed',J(H.msgs('p:kexin')));
    /* 不觸發 */
    G=H.fresh('2029-12-14',15.2,'dorm',{BAR_REG:false}); graduated(G); H.FRIEND('kexin'); H.tick();
    check('③ 沒有交往：沒有這一通、也沒有私訊',!(PG.due(G)&&PG.due(G).id==='kx_bar_2029')&&!H.msgs('p:kexin').some(t=>/律師考試放榜了/.test(t)));
    G=kx({BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:16,BAR_STAGE_2029:'both'}); H.at('2029-12-14',15.2); H.tick();
    check('③ 祐廷報了 2029 國考：沒有這一通（她那天的話在別的地方）',!PG.pending(G).some(x=>x.s.id==='kx_bar_2029'));
    G=kx(); H.at('2029-09-07',14.6); H.tick(); H.at('2029-09-07',15.3); H.tick();
    check('③ 9/7「一試過了。二試十月。」照用私訊',H.msgs('p:kexin').includes('一試過了。二試十月。'));
  });

  /* ======================= ④ 沛珊回來：2027-08-07 21:00 她打來 ======================= */
  await sec('④',async()=>{
    const d=D('2027-08-07'), ID='classmate_peishan', TH='p:'+ID, C=Y2B.PS_CALL||{id:'y3_ps_back_call'};
    const ps=(h,msg,flags)=>{ const G=fresh('2027-08-07',h,'dorm',flags); H.FRIEND(ID); ct(ID); if(msg!==false) PHONE.postAt(G,{th:TH,from:'player',text:'生日快樂'},D('2027-03-15'),20); return G; };
    let G=ps(18.9); rules(); const no=!OUT.get(G,C.id);
    at('2027-08-07',19); rules(); const qc=OUT.get(G,C.id);
    check('④ 消失期傳過訊息：8/7 19:00 以前還沒排；19:00 排 21:00「沛珊打電話來」（不跳「排進行程」、只有接起來）；還沒有私訊、PS_BACK_READ 還沒記',no&&!!qc&&qc.day===d&&qc.h===21&&qc.must===true&&qc.silent===true&&!from(TH,ID).length&&G.flags.PS_BACK_READ==null,J(qc));
    for(const k of [0,1,2]){ G=ps(19.5); rules(); at('2027-08-07',20.8); const due=OUT.due(G); await goOut(C.id,[k]);
      check('④ 選「'+P4.opts[k]+'」：21:00 她打來，台詞照稿一字不差（字幕「電話」）',!!due&&due.id===C.id&&same(said(),want(P4,k))&&J(H.opts[0])===J(P4.opts)&&caps.includes('電話'),J({said:said(),opts:H.opts}));
      if(k===0){ rules(); check('④ 接了：PS_BACK_READ＝8/7（放榜以後重新聯絡上）、沒有那兩則私訊、她不再是「很久沒聯絡」',G.flags.PS_BACK_READ===d&&!from(TH,ID).length&&!(STORY.presence&&STORY.presence(ID,G).lost),J([G.flags.PS_BACK_READ,from(TH,ID)])); } }
    G=ps(19.5); rules(); at('2027-08-08',7.5); OUT.tick(GM); PHONE.tick(G);
    check('④ 沒接（睡過了）＝原本兩則私訊「'+DM4.join('」「')+'」（21:00）；PS_BACK_READ＝8/7',J(from(TH,ID))===J(DM4)&&(G.msgs||[]).filter(m=>m.tag==='ps_back_read').every(m=>m.day===d&&Math.abs(m.h-21)<0.05)&&G.flags.PS_BACK_READ===d&&OUT.get(G,C.id).state==='missed',J(from(TH,ID)));
    G=ps(19.5); rules(); at('2027-08-07',21.6); rules(); PHONE.tick(G);
    check('④ 沒接（在忙：過了 30 分鐘、OUT.tick 沒跑）＝規則自己記沒接、照兩則私訊',J(from(TH,ID))===J(DM4)&&G.flags.PS_BACK_READ===d&&OUT.get(G,C.id).state==='missed',J(from(TH,ID)));
    G=ps(21.7); rules(); PHONE.tick(G);
    check('④ 那一段沒跑到規則（21:42 才進遊戲）＝不排電話、照兩則私訊',!OUT.get(G,C.id)&&J(from(TH,ID))===J(DM4)&&G.flags.PS_BACK_READ===d);
    G=ps(19.5,false); rules(); at('2027-08-07',21.2); rules();
    check('④ 消失期沒傳過：沒有電話、沒有私訊、PS_BACK_READ false（照舊）',!OUT.get(G,C.id)&&!from(TH,ID).length&&G.flags.PS_BACK_READ===false);
    G=ps(19.5,true,{dating_classmate_peishan:true}); date(ID); rules(); at('2027-08-07',21.2); rules();
    check('④ 和她交往中：沒有這一通（照 PS_KEEP_BACK）',!OUT.get(G,C.id)&&G.flags.PS_BACK_READ==null);
  });

  /* ======================= ⑤ 芷若答應奕廷的約，日本路線 ======================= */
  await sec('⑤',async()=>{
    const X=R2Y3B, TWL=['奕廷約我去看電影。很老的那部，《秋天的晚飯》。','他連我高中看過哪幾部都記得。……我說好。'];
    let G=fresh('2028-05-29',21.9,'jp_dorm',{},'JP'); H.FAMILIAR('npc_fangyt'); H.FAMILIAR('heroine_02'); ct('heroine_02'); at('2028-05-29',22.1); rules(); at('2028-05-29',23.5); rules(); at('2028-05-30',9); rules();
    check('⑤ 日本路線 5/29（日本 22:00）奕廷打來；芷若 22:07 的私訊不傳',!!OUT.get(G,'y3_fang_f3')&&!PHONE.sent(G,'y3_zr_f3_jp')&&!th('p:heroine_02').some(t=>/奕廷約我/.test(t)),J(th('p:heroine_02')));
    at('2028-05-29',22.1); await goOut('y3_fang_f3',['剛好有兩張']);
    check('⑤ [前置] 奕廷那一通：FANG_F3 bought',G.flags.FANG_F3==='bought');
    G.zone='cafe'; at('2028-08-04',15); const b4=EVENTS.check(ev('ev_zhiruo_f3_cafe'));
    at('2028-08-05',19); const on=EVENTS.check(ev('ev_zhiruo_f3_cafe'));
    check('⑤ 8/5 回國以前不演；8/5 起第一次進 Café 跟她說話＝演',!b4&&on&&X.f3CafeDue(G));
    await run('ev_zhiruo_f3_cafe');
    check('⑤ 當面版：芷若過去式那兩句照稿一字不差（不是臺灣路線那兩句）',same(said(),want(P5))&&!said().some(x=>TWL.includes(x.t)),J(said()));
    at('2028-09-01',15); const l9=X.f3CafeDue(G); at('2028-09-02',15); const a9=X.f3CafeDue(G);
    check('⑤ 9/1 還算；9/2 起（9/1 以前都沒進 Café）＝就沒有這一段',l9&&!a9);
    G=fresh('2028-05-29',21.1,'dorm'); H.FAMILIAR('npc_fangyt'); H.FAMILIAR('heroine_02'); ct('heroine_02'); rules(); await goOut('y3_fang_f3',['剛好有兩張']); G.zone='cafe'; at('2028-05-31',19.5);
    const tw=EVENTS.check(ev('ev_zhiruo_f3_cafe')); await run('ev_zhiruo_f3_cafe');
    check('⑤ 臺灣路線照舊：之後第一次在 Café 就演、原本那兩句',tw&&J(said().map(x=>x.t))===J(TWL),J(said()));
  });

  /* ======================= 停點：跳過時間碰到她打來要停（AA 10-22 08:41）======================= */
  await sec('停點',async()=>{
    const st=G=>CLS.skipStops({G},23.95).filter(a=>a.why==='手機響了').map(a=>+a.h.toFixed(3));
    let G=fresh('2028-10-19',7,'us_apartment',{US_DEPARTED:true,US_ARRIVED:true},'US'); H.FAMILIAR('heroine_01'); date('heroine_01'); const a1=st(G); G.flags.AN_CHOICE='dm'; const a2=st(G);
    G=fresh('2028-10-18',7,'us_apartment',{US_DEPARTED:true,US_ARRIVED:true},'US'); H.FAMILIAR('heroine_01'); date('heroine_01'); const a3=st(G);
    check('停點 ①：以安視訊那天當地 07:00 跳過時間＝停在 10:00（臺灣 22:00）；已經記了 AN_CHOICE、前一天都不停',J(a1)===J([10])&&!a2.length&&!a3.length,J([a1,a2,a3]));
    const d0=D('2028-06-09'); G=fresh('2028-06-11',12,'dorm',{ZQ_Q15:{day:d0,k:'first',res:null}}); const b1=st(G); G.flags.ZQ_Q15.res='none'; const b2=st(G);
    G=fresh('2028-06-10',12,'dorm',{ZQ_Q15:{day:d0,k:'first',res:null}}); const b3=st(G);
    check('停點 ②：收到檔案的隔天還沒回＝那天 12:00 跳過時間停在 21:00（她打來）；已經定案、前一天都不停',J(b1)===J([21])&&!b2.length&&!b3.length,J([b1,b2,b3]));
    const kx=fl=>{ const G=H.fresh('2029-12-14',10,'dorm',Object.assign({BAR_REG:false},fl||{})); G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; H.FRIEND('kexin'); return G; };
    G=kx(); H.date('kexin'); const c1=st(G); PG.rec(G).done.kx_bar_2029=1; const c2=st(G); G=kx(); const c3=st(G);
    check('停點 ③：可昕考上律師那天 10:00 跳過時間＝停在 15:05；演過了、沒有交往都不停',J(c1)===J([+(15+5/60).toFixed(3)])&&!c2.length&&!c3.length,J([c1,c2,c3]));
    const ps=(msg,fl)=>{ const G=fresh('2027-08-07',12,'dorm',fl); H.FRIEND('classmate_peishan'); ct('classmate_peishan'); if(msg) PHONE.postAt(G,{th:'p:classmate_peishan',from:'player',text:'生日快樂'},D('2027-03-15'),20); return G; };
    G=ps(true); const e1=st(G); G=ps(false); const e2=st(G); G=ps(true,{dating_classmate_peishan:true}); const e3=st(G); G=ps(true,{PS_BACK_READ:D('2027-08-07')}); const e4=st(G);
    check('停點 ④：沛珊回來那天（消失期傳過訊息）12:00 跳過時間＝停在 21:00；沒傳過、交往中、已經回過都不停',J(e1)===J([21])&&!e2.length&&!e3.length&&!e4.length,J([e1,e2,e3,e4]));
    G=ps(true); const w=STORY.tonightAlarm?STORY.tonightAlarm(G,12):null;
    check('停點：睡覺照舊不叫醒（今晚的鬧鐘不算這幾通，AA 08:41：睡著＝沒接、給私訊）',!w||!/沛珊|手機響了/.test(w.why||''),J(w));
  });

  /* ======================= 接線 ======================= */
  { const ids=['ev_an_her_choice_video','ev_ziqing_exe_call','ev_ziqing_noreply_call','ev_peishan_back_call'];
    check('接線：四個新事件都在 STORY_EVENTS（trigger outing）；src 沒有「小語」',ids.every(id=>{ const e=ev(id); return !!e&&e.trigger==='outing'; })&&!fs.readdirSync(path.join(H.ROOT,'src')).concat(fs.readdirSync(path.join(H.ROOT,'src/data')).map(f=>'data/'+f)).filter(f=>f.endsWith('.js')).some(f=>fs.readFileSync(path.join(H.ROOT,'src',f),'utf8').includes('小語')),J(ids.filter(id=>!ev(id)))); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
