// AA_346 多段感情：「選一個人」之後，和其他人的分開談話（ev_choice_apart_<id>；AA-C 2026-10-21，第②級；src/r2y4b3d.js 2-Y4-54 那一段、src/data/r2y4b_events.js）——不需要瀏覽器。
// 檢查：
//   排程：2029（5/21 選）七位各自的日子、時間、地點（隔天起一晚一位、照表的順序；學姊固定 5/30 17:00；都在 6/2 以前）；5/28 才選、人多的不排 6/2；2030（5/25 選）從 5/26 起。
//   選了以後、談話以前照舊交往中；存讀檔（JSON 來回）、跨日都照排；出遊的「出發」選單（視訊＝接起來、電話＝打給她）。
//   台詞：每一位 2029／2030 的「知道」「說了」「沒說」三版照原文（以安先問「理由呢？」）；她知道＝沒有二選一；被選的那一位不因為這幾場知道別人。
//   沒到：「不去了」或過了時間＝延到隔天同一時間，最多兩次；第三次那一晚 22:00 她私訊「你是不是有話要跟我說。」→ 電話版（地點的旁白換「（電話。）」）；22:00 以後才算沒到的＝當下。
//   談完：前任（EX_、romance status ex、ROMANCE_HISTORY how apart_choice＋said＋day、CHOICE_APART_DONE），不扣數值、沒有吵架；前任版照 apart_talk（偶遇的那一句、尾聲經過時那一句）。
//   不排的：只有一位、「先不想」「先跟她們說清楚」、2030「（不選）」「跟她們說實話」；舊存檔（已經 apart_talk 分開）不變；談話以前她因為別的原因分開＝那一場取消。
//   收拾的時刻（V6-S4，STORY.cleanupTick）：談完才 ROM.end，最後一場的一週後照樣補「（你把那件事放好了。）」。
// 修改前：選了就直接 ROM.end(…,'apart_talk')，沒有排程、沒有談話（大部分 FAIL）。用法：node tests/aa346_apart_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|ENCOUNTERS|ENC)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM,E}=H;
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };
global.CG_REGISTRY={};
for(const f of ['src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/data/encounters.js','src/encounter3d.js']) load(f);
const S=R2Y4B, D=H.D, ev=id=>STORY_EVENTS.find(e=>e.id===id);
const LOVE7=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];   // R2Y4B.partners 的順序（選人的選單）
const ORDER=['heroine_01','heroine_03','heroine_02','heroine_04','heroine_05','classmate_peishan','kexin'];   // AA_346 表的順序
const GD={GRADUATED:D('2029-06-02')};
const fresh=(key,h,flags)=>{ const G=H.fresh(key,h,'dorm',Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1},flags||{})); G.acts={att:{}}; G.outings=[]; H.at(key,h); G.zone='dorm'; GM.npc={}; caps.length=0; return G; };
const at=(key,h)=>H.at(key,h);
const atAbs=t=>{ const d=Math.floor(t/24); PG.setT(H.G,E,d,t-d*24); };
const date=id=>H.date(id);
const nm=id=>SOCIAL.displayName(id);
const dueHas=id=>{ const now=H.G.day*24+H.G.hour; return PG.pending(H.G).some(p=>p.s.id===id&&p.t<=now+1e-6&&(!p.s.ready||p.s.ready(H.G))); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.bgs=[]; caps.length=0; H.picks=picks||[]; if(!q) return false; await OUT.go(GM,q); return true; };
const expireAll=()=>{ for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); };
const rnd=(R,id)=>R&&R.at&&R.at[id];
const hist=id=>{ const L=(H.G.flags.ROMANCE_HISTORY||[]).filter(h=>h.id===id); return L[L.length-1]||null; };
const apartOuts=()=>OUT.rec(H.G).filter(q=>/^apart/.test(q.id));
const dump=()=>JSON.stringify(H.said.map(s=>(s.who||'')+'：'+s.t));
const block=async(name,f)=>{ try{ await f(); }catch(e){ check(name+'（例外：'+(e&&e.message)+'）',false); } };
/* ---------- AA_346 第 3 節的台詞（照原文抄一份，和程式的表分開，才驗得出抄錯）---------- */
const N=t=>({n:t});
const EXP={
  heroine_01:{o:y=>y===2029?'（讀書會散了。法律系館B 研討室外的走廊，只剩你們兩個。她手上還拿著白板筆。）':'（麵店，兩人桌。她先到，點了兩碗，一碗推到你面前。）',
    knew:y=>['……我知道。不用說名字。','你選了。……好。'],ask:['理由呢？'],
    told:y=>[N('（她沒有馬上說話。）'),'……你說實話了。','我要一點時間。'],quiet:y=>['……好。',N(y===2029?'（她把白板筆的蓋子蓋上。）':'（她把筷子在碗上放好。）')],
    last:y=>[N('（她翻開手帳，寫了一行，沒有給你看。）'),'好了。……你先走。我把這頁寫完。']},
  heroine_03:{o:y=>'（麵店打烊以後。她在櫃台後面剝蒜頭，沒有抬頭。）',
    knew:y=>[N('（蒜頭一顆一顆放進碗裡。）'),'……嗯。我知道會有這一天。'],
    told:y=>['……嗯。',N('（很久以後。）'),'你坐。我把這碗剝完。'],quiet:y=>['……嗯。',N('（她沒有問為什麼。蒜頭剝完了，她又拿了一顆。）')],
    last:y=>['那我把這段時間，還給我自己。……謝謝你教我分時間。']},
  heroine_02:{o:y=>y===2029?'（視訊。她那邊是下午，窗外是英國灰灰的天。）':'（打烊後的 Café。只開了吧檯一盞燈。）',
    knew:y=>['……我猜到了。你最近話都很短。'],told:y=>[N('（她沒有接話。平常她都會接話。）'),'……我知道了。'],
    quiet:y=>['……好。',N(y===2029?'（她低頭，看著鏡頭外面的什麼。）':'（她低頭，擦了一下已經乾淨的杯子。）'),'我不問。問了，我會想記住答案。'],
    last:y=>[y===2029?'回去以後，我還是在吧檯後面。你點什麼，我都記得。':'我還是在吧檯後面。你點什麼，我都記得。']},
  heroine_04:{o:y=>y===2029?'（吉他社辦外面的樓梯。裡面在上社課，有人一直彈錯同一個和弦。）':'（工作室樓下。她外套的帽子拉起來一半，手上拿著一杯便利商店的咖啡。）',
    knew:y=>['……喔。你選好了。','我早就知道會是這樣。……也沒有很早啦。'],told:y=>['……你喜歡上別人了。','好喔。好。……那個——',N('（她沒有講完。）')],
    quiet:y=>['……好。',N('（她把帽子拉起來，蓋住半張臉。）'),'那我也不講了。'],last:y=>['之後還是朋友。……我說真的。']},
  heroine_05:{o:y=>y===2029?'（研究室的走廊。口試的資料還堆在她桌上，一疊一疊用夾子夾好。）':'（她上班的研究單位樓下。她剛下班，識別證還掛在脖子上。）',
    knew:y=>['……我知道。','走一段吧。這種事，站著講不好。'],told:y=>['……嗯。','我需要一點時間。……不用太久。'],
    quiet:y=>['好。',N('（她把計畫本闔上，沒有寫任何東西。）')],last:y=>[y===2029?'謝謝你。……畢業快樂，先說了。':'謝謝你。……你也要好好吃飯。']},
  classmate_peishan:{o:y=>'（電話。她那邊有小孩子的聲音，她走到外面才講。）',
    knew:y=>['……我知道你要說什麼。','你特地打來說這個。'],told:y=>['……你特地打來說這個。','……還好啦。你那邊吃飯了嗎？'],
    quiet:y=>['……嗯。',N('（電話那頭很久沒有聲音。）'),'好。……那我掛了喔。'],last:y=>['謝謝你在我重考那年陪我。那一年，我不會忘。']},
  kexin:{o:y=>y===2029?'（木柵大學山下的小吃店。她點好了兩碗，筷子還沒拆。）':'（她家樓下。她穿著拖鞋下來，手上還拿著鑰匙。）',
    knew:y=>['……你說完了？',N(y===2029?'（她把筷子放下。）':'（她把鑰匙握在手裡。）'),'我知道。……我以為你會更早講。'],
    told:y=>['……你說完了？',N(y===2029?'（她把筷子放下。）':'（她把鑰匙握在手裡。）'),'……操。','你至少講完了。'],
    quiet:y=>['……就這樣？',N(y===2029?'（她站起來，自己去付了錢。）':'（她轉身上樓，門沒有關好。）')],last:y=>['我累的時候傳的那隻長頸鹿，先不傳了。','……累了，我自己會去睡。']} };
const ME='……我想跟妳分開。', DM='你是不是有話要跟我說。', PH='（電話。）', OPTS=['「我喜歡上別人了。」','（不說原因）'];
/* 表（第 1 節）：[2029 幾點, 2030 幾點, 2029 地點, 2030 地點, 2029 背景, 2030 背景]；背景 null＝深色底、'phone'＝電話（不在家＝晚上的路邊）*/
const TBL={heroine_01:[18,19,'法律系館B 研討室外的走廊','麵店，兩人桌','wancai_seminar','noodle_table'],heroine_03:[21.5,21.5,'麵店打烊以後','麵店打烊以後','noodle_table','noodle_table'],
  heroine_02:[22,21.5,'約好的視訊','打烊後的 Café','video',null],heroine_04:[21,20,'吉他社辦外面的樓梯','工作室樓下',null,null],heroine_05:[17,18.5,'研究室走廊','她上班的研究單位樓下','linze_prof_hall',null],
  classmate_peishan:[21,21,'電話','電話','phone','phone'],kexin:[18.5,20,'木柵大學山下的小吃店','她家樓下','nccu_food',null]};
/* AA_350 Q3：電話版（沛珊，以及錯過三次改電話的）看得到動作的旁白換成聽得到的；拿掉的＝null（照 AA 的對照表另抄一份）*/
const HEAR={'（蒜頭一顆一顆放進碗裡。）':'（電話那頭有剝東西的聲音。）','（她沒有問為什麼。蒜頭剝完了，她又拿了一顆。）':'（電話那頭有剝東西的聲音。）','（她低頭，擦了一下已經乾淨的杯子。）':'（那頭有杯子碰到的聲音。）',
  '（她把計畫本闔上，沒有寫任何東西。）':'（紙闔起來的聲音。）','（她翻開手帳，寫了一行，沒有給你看。）':'（翻紙的聲音。）','（她把筷子放下。）':'（那頭安靜了一下。）','（她把筷子在碗上放好。）':'（那頭安靜了一下。）',
  '（她站起來，自己去付了錢。）':'（那頭安靜了一下。）','（她轉身上樓，門沒有關好。）':'（那頭安靜了一下。）','（她把帽子拉起來，蓋住半張臉。）':null,'（她把鑰匙握在手裡。）':null,'（她把白板筆的蓋子蓋上。）':null,'（她低頭，看著鏡頭外面的什麼。）':null};
const hearOf=L=>L.map(x=>x&&x.n&&x.n in HEAR?(HEAR[x.n]==null?null:N(HEAR[x.n])):x).filter(x=>x!=null);
const want=(id,y,br,phone)=>{ const X=EXP[id], L=[N(phone?PH:X.o(y)),{me:ME}]; const B=[]; if(br==='knew') B.push(...X.knew(y)); else { B.push(...(X.ask||[])); B.push(...X[br](y)); } B.push(...X.last(y)); return L.concat(phone||id==='classmate_peishan'?hearOf(B):B); };
/* 談的時候還在交往：學姊的名字框是交往中的叫法「書瑀」（CALLED_SHUYU，never_set_flags_unit 第 5 節）；談完分開以後 nm() 才回到「溫書瑀」*/
const dn=id=>{ const C=typeof REL_LINES!=='undefined'&&REL_LINES[id]&&REL_LINES[id].contact; return C&&C.DATING||null; };
const same=(id,L)=>H.said.length===L.length&&L.every((x,i)=>{ const g=H.said[i]; if(typeof x==='string') return (g.who===nm(id)||(!!dn(id)&&g.who===dn(id)))&&g.t===x; if(x.n) return g.who===null&&g.t===x.n; if(x.me) return g.who===H.G.name&&g.t===x.me; return false; });
/* 背景照 OUT.bg（圖還沒到的＝dark）；'phone'＝events3d.js 的 {scene:'電話'} 那一套（不在家＝OUT.bg('phone_street_night')）*/
const bgKey=b=>b&&typeof b==='object'?b.image:b;
const bgOk=(want0)=>{ const k=bgKey(want0==='phone'?OUT.bg('phone_street_night'):(want0?OUT.bg(want0):'dark')); if(k==='dark') return H.bgs.length>0&&H.bgs.every(b=>bgKey(b)==='dark'); return H.bgs.some(b=>bgKey(b)===k); };
const relOf=id=>{ const r=SOCIAL.rel(id); return JSON.stringify({fam:r.fam,trust:r.trust,comf:r.comf,rom:r.rom,npcRom:r.npcRom}); };
const keepFor=id=>id==='kexin'?'heroine_01':'kexin';
/* 一位、一年：選好（R2Y4B.apartSchedule，等於 5/21、5/25 選「選一個人」）*/
const setup=(id,y,o)=>{ o=o||{}; const keep=o.keep||keepFor(id); if(y===2029) fresh('2029-05-21',22); else { fresh('2030-05-25',22,GD); PG.rec(H.G).done.grad=1; }
  for(const p of [id,keep].concat(o.more||[])){ H.FRIEND(p); date(p); } if(o.knew) ROM.learn(H.G,id,o.knew===true?keep:o.knew,'test');
  return S.apartSchedule(H.G,y,keep,[id].concat(o.more||[])); };
const missThree=id=>{ for(let n=0;n<3;n++){ const q=OUT.get(H.G,'apart'+(rnd(S.apartRound(H.G,2029),id)?29:30)+'_'+id+'_'+n); if(!q) return false; atAbs(q.day*24+q.h+0.51); expireAll(); } return true; };
(async()=>{
  /* ===== 0. 登記 ===== */
  check('0. 七個事件 ev_choice_apart_<id>（出遊；沒到、開演的掛勾）、R2Y4B 的排程與電話版（PG 的場景兩年各七個）都登記了',
    ORDER.every(id=>{ const e=ev('ev_choice_apart_'+id); return !!e&&e.trigger==='outing'&&typeof e.beforeOuting==='function'&&typeof e.outingMissed==='function'&&R2Y4B_EVENTS.includes(e); })
    &&typeof S.apartSchedule==='function'&&ORDER.every(id=>PG.STEPS.some(s=>s.id==='r2y4b_apart29_call_'+id)&&PG.STEPS.some(s=>s.id==='r2y4b_apart30_call_'+id)));
  if(H.fails){ H.done(); }

  /* ===== 1. 2029 的排程（5/21 22:00 在宿舍選「選一個人。」）===== */
  await block('1. 2029 排程',async()=>{
    fresh('2029-05-21',21.5); for(const id of LOVE7){ H.FRIEND(id); date(id); } at('2029-05-21',22);
    H.said=[]; H.opts=[]; H.picks=[1,LOVE7.indexOf('kexin')]; await H.run('r2y4b_multi_pre');
    const R=S.apartRound(H.G,2029), F=H.G.flags;
    check('1. 選可昕：MULTI_PRE pick:kexin；選的當下七位都還在交往（談完才分開）；選人的選單是七位的名字',
      F.MULTI_PRE==='pick:kexin'&&LOVE7.every(id=>F['dating_'+id]===true&&!F['EX_'+id])&&JSON.stringify(H.opts[1])===JSON.stringify(LOVE7.map(nm)), JSON.stringify(H.opts));
    const exp={heroine_01:'2029-05-22',heroine_03:'2029-05-23',heroine_02:'2029-05-24',heroine_04:'2029-05-25',heroine_05:'2029-05-30',classmate_peishan:'2029-05-26'}, bad=[];
    for(const id in exp){ const q=OUT.get(H.G,'apart29_'+id+'_0'); if(!q||q.day!==D(exp[id])||q.h!==TBL[id][0]||q.place!==TBL[id][2]||q.ev!=='ev_choice_apart_'+id||q.state!=='planned'||q.who!==id||q.late!==0.5) bad.push(id+':'+JSON.stringify(q&&{day:q.day,h:q.h,place:q.place})); }
    check('1. 隔天起一晚一位、照表的順序：以安 5/22 18:00 萬才館研討室外的走廊、語彤 5/23 21:30 麵店打烊以後、芷若 5/24 22:00 約好的視訊、子晴 5/25 21:00 吉他社辦外面的樓梯、沛珊 5/26 21:00 電話；學姊固定 5/30 17:00 研究室走廊',
      !bad.length&&!!R&&JSON.stringify(R.list)===JSON.stringify(['heroine_01','heroine_03','heroine_02','heroine_04','heroine_05','classmate_peishan'])&&R.keep==='kexin', bad.join(' '));
    check('1. 都在 6/2（畢業典禮）以前；一晚只有一位；被選的那一位沒有這一場', apartOuts().every(q=>q.day<D('2029-06-02'))&&new Set(apartOuts().map(q=>q.day)).size===apartOuts().length&&!apartOuts().some(q=>q.who==='kexin'));
    const z=OUT.get(H.G,'apart29_heroine_02_0'), p=OUT.get(H.G,'apart29_classmate_peishan_0'), a=OUT.get(H.G,'apart29_heroine_01_0');
    check('1. 出遊的寫法：視訊＝「接起來」「先不接」、不用出門；電話＝「打給她」「今天先不要」（call）；當面＝走過去約 10 分鐘（萬才館）',
      z.verb==='接起來'&&z.no==='先不接'&&z.travelH===0&&p.verb==='打給她'&&p.no==='今天先不要'&&p.call===true&&p.title==='打給'+nm('classmate_peishan')&&a.title==='法律系館B 研討室外的走廊（'+nm('heroine_01')+'）'&&a.travel==='走過去約 10 分鐘'&&!a.verb);
    /* 存讀檔、跨日 */
    H.G=JSON.parse(JSON.stringify(H.G)); SOCIAL.bind(H.G); EVENTS.bind(GM); INV.rec(H.G);
    at('2029-05-22',17.5); const n0=OUT.due(H.G); at('2029-05-22',17.6); const q1=OUT.due(H.G);
    check('1. 存檔讀回來（JSON）、到了隔天：17:35（18:00 減走過去 10 分鐘、再提早 15 分鐘）起問「出發」，以前不問', !n0&&!!q1&&q1.id==='apart29_heroine_01_0');
    H.said=[]; H.opts=[]; H.picks=[0,1]; const r=await OUT.prompt(GM,q1);
    check('1. 「出發：萬才館研討室外的走廊（以安）」→ 演以安那一場（她不知道：「理由呢？」二選一）', r==='go'&&H.opts[0][0]==='出發：萬才館研討室外的走廊（'+nm('heroine_01')+'）'&&H.said.some(s=>s.t==='理由呢？')&&H.G.flags.EX_heroine_01===true&&H.G.flags.dating_kexin===true, JSON.stringify(H.opts));
    check('1. 被選的那一位不因為這幾場知道別人（knowsRel 沒有她）', !LOVE7.some(x=>ROM.knowsOf(H.G,'kexin',x)));
  });
  await block('1b. 選以安',async()=>{
    fresh('2029-05-21',22); for(const id of LOVE7){ H.FRIEND(id); date(id); } H.picks=[1,0]; await H.run('r2y4b_multi_pre');
    const exp={heroine_03:'2029-05-22',heroine_02:'2029-05-23',heroine_04:'2029-05-24',heroine_05:'2029-05-30',classmate_peishan:'2029-05-25',kexin:'2029-05-26'}, bad=[];
    for(const id in exp){ const q=OUT.get(H.G,'apart29_'+id+'_0'); if(!q||q.day!==D(exp[id])||q.h!==TBL[id][0]||q.place!==TBL[id][2]) bad.push(id); }
    const k=OUT.get(H.G,'apart29_kexin_0');
    check('1b. 選以安：語彤 5/22、芷若 5/23、子晴 5/24、沛珊 5/25、可昕 5/26 18:30 木柵大學山下的小吃店（開車約 40 分鐘）；學姊 5/30 17:00；以安自己沒有', !bad.length&&k.travel==='開車約 40 分鐘'&&!OUT.get(H.G,'apart29_heroine_01_0'), bad.join(' '));
  });
  await block('1c. 5/28 才選',async()=>{
    fresh('2029-05-28',21); for(const id of LOVE7){ H.FRIEND(id); date(id); } at('2029-05-28',22);
    check('1c. 5/21 22:00～5/28 那一週都還可以選（5/28 22:00 到期）', dueHas('r2y4b_multi_pre'));
    H.picks=[1,6]; await H.run('r2y4b_multi_pre'); const days=ORDER.filter(id=>id!=='kexin').map(id=>{ const q=OUT.get(H.G,'apart29_'+id+'_0'); return q&&q.day; });
    check('1c. 5/28 才選、人又多：一晚一位，學姊照樣 5/30，6/2 畢業典禮當天不排（排不下的接到典禮以後）',
      JSON.stringify(days)===JSON.stringify(['2029-05-29','2029-05-31','2029-06-01','2029-06-03','2029-05-30','2029-06-04'].map(D)), JSON.stringify(days));
  });

  /* ===== 2. 2030 的排程（5/25 22:00 選「選一個人。」）===== */
  await block('2. 2030 排程',async()=>{
    fresh('2030-05-25',21.5,GD); PG.rec(H.G).done.grad=1; for(const id of LOVE7){ H.FRIEND(id); date(id); } at('2030-05-25',22);
    check('2. 2030-05-25 22:00 到期（還同時有兩位以上）', dueHas('r2y4b_multi_y5'));
    H.said=[]; H.opts=[]; H.picks=[0,6]; await H.run('r2y4b_multi_y5');
    const exp={heroine_01:'2030-05-26',heroine_03:'2030-05-27',heroine_02:'2030-05-28',heroine_04:'2030-05-29',heroine_05:'2030-05-30',classmate_peishan:'2030-05-31'}, bad=[];
    for(const id in exp){ const q=OUT.get(H.G,'apart30_'+id+'_0'); if(!q||q.day!==D(exp[id])||q.h!==TBL[id][1]||q.place!==TBL[id][3]) bad.push(id+':'+JSON.stringify(q&&{day:q.day,h:q.h,place:q.place})); }
    const z=OUT.get(H.G,'apart30_heroine_02_0');
    check('2. 從 5/26 起一晚一位：以安 19:00 麵店兩人桌、語彤 21:30、芷若 21:30 打烊後的 Café（當面，不是視訊）、子晴 20:00 工作室樓下、學姊 18:30 研究單位樓下（2030 不固定）、沛珊 21:00 電話；MULTI_Y5 pick:kexin、都還在交往',
      !bad.length&&H.G.flags.MULTI_Y5==='pick:kexin'&&LOVE7.every(id=>H.G.flags['dating_'+id]===true)&&!z.verb&&z.travel==='捷運＋公車 約 30 分鐘', bad.join(' '));
    check('2. 畢業後篇：跳到下一件事會停在第一場出發之前（PG.nextStop）', PG.on(H.G)&&PG.nextStop(H.G)!=null&&PG.nextStop(H.G)<=D('2030-05-26')*24+19-0.5-0.25+1e-6, String(PG.nextStop(H.G)));
    fresh('2030-05-25',22,GD); PG.rec(H.G).done.grad=1; for(const id of LOVE7){ H.FRIEND(id); date(id); } H.picks=[0,0]; await H.run('r2y4b_multi_y5');
    const k=OUT.get(H.G,'apart30_kexin_0'), s=OUT.get(H.G,'apart30_heroine_05_0');
    check('2. 選以安：可昕 5/31 20:00 她家樓下、學姊 5/29 18:30', !!k&&k.day===D('2030-05-31')&&k.h===20&&k.place==='她家樓下'&&!!s&&s.day===D('2030-05-29')&&s.h===18.5);
  });

  /* ===== 3. 每一位的台詞（2029／2030 × 知道／說了／沒說），當面（出遊）===== */
  const banned=[];
  for(const id of ORDER) for(const y of [2029,2030]){
    await block('3. '+id+' '+y,async()=>{ const fails=[];
      for(const br of ['knew','told','quiet']){
        setup(id,y,{knew:br==='knew'}); const keep=keepFor(id), r0=relOf(id), q0=OUT.get(H.G,'apart'+(y%100)+'_'+id+'_0'); atAbs(q0.day*24+q0.h-0.1);
        await goOut(q0.id,[br==='quiet'?1:0]); const L=want(id,y,br,false), h=hist(id), F=H.G.flags;
        banned.push(...H.said.filter(s=>s.who).map(s=>[id,s.t]));
        const ok=same(id,L)&&(br==='knew'?H.opts.length===0:JSON.stringify(H.opts[0])===JSON.stringify(OPTS))&&caps.includes(TBL[id][y===2029?2:3])&&bgOk(TBL[id][y===2029?4:5])
          &&F['dating_'+id]===false&&F['EX_'+id]===true&&ROM.get(H.G,id).status==='ex'&&!!h&&h.how==='apart_choice'&&h.said===br&&h.day===q0.day&&h.to!=null
          &&(F.CHOICE_APART_DONE||[]).includes(id)&&F['dating_'+keep]===true&&relOf(id)===r0&&OUT.get(H.G,q0.id).state==='done'&&(H.G.events.done['ev_choice_apart_'+id]|0)===1&&!ROM.knowsOf(H.G,keep,id)
          &&rnd(S.apartRound(H.G,y),id).st==='done';
        if(!ok) fails.push(br+' '+dump()+' opts='+JSON.stringify(H.opts)+' caps='+JSON.stringify(caps)+' bgs='+JSON.stringify(H.bgs)+' hist='+JSON.stringify(h)); }
      check('3. '+nm(id)+' '+y+'（'+TBL[id][y===2029?2:3]+'）：知道／說了／沒說三版照原文'+(id==='heroine_01'?'（不知道先問「理由呢？」）':'')+'；知道＝沒有二選一；談完前任（apart_choice、said、day）、不扣數值、選的那一位照舊交往',!fails.length,fails.join(' ｜ ')); });
  }
  check('3. 子晴沒有「欸不是」、可昕沒有假設題、學姊沒有條列和「一件事」、沒有人吵架（AA_346 第 3、8 節 P5）',
    banned.length>0&&!banned.some(([id,t])=>(id==='heroine_04'&&/欸不是|這不是問句/.test(t))||(id==='kexin'&&/假設/.test(t))||(id==='heroine_05'&&/一件事|^一、|第一/.test(t))||/吵|你騙我|劈腿/.test(t)));

  /* ===== 4. 沒到：延兩次、第三次 22:00 私訊＋電話版 ===== */
  await block('4. 沒到',async()=>{
    setup('heroine_01',2029,{keep:'heroine_04'});
    at('2029-05-22',17.6); let q=OUT.due(H.G); H.said=[]; H.opts=[]; H.picks=[2]; const r=await OUT.prompt(GM,q);
    const q1=OUT.get(H.G,'apart29_heroine_01_1');
    check('4. 第一次「不去了」＝沒到：延到隔天同一時間（5/23 18:00）；選單是「出發」「晚一點」「不去了」', r==='no'&&OUT.get(H.G,'apart29_heroine_01_0').state==='missed'&&!!q1&&q1.day===D('2029-05-23')&&q1.h===18&&q1.state==='planned'&&H.G.flags.dating_heroine_01===true&&H.opts[0].length===3&&H.opts[0][2]==='不去了', JSON.stringify(H.opts));
    at('2029-05-23',18.49); expireAll(); const still=OUT.get(H.G,'apart29_heroine_01_1').state==='planned';
    at('2029-05-23',18.51); expireAll(); const q2=OUT.get(H.G,'apart29_heroine_01_2');
    check('4. 第二次：過了約好的時間 30 分鐘還沒出發＝沒到 → 再延到隔天同一時間（5/24 18:00）', still&&!!q2&&q2.day===D('2029-05-24')&&q2.h===18);
    at('2029-05-24',18.51); expireAll(); const P=rnd(S.apartRound(H.G,2029),'heroine_01');
    check('4. 第三次還沒到：不再延（沒有第四場）；那一晚 22:00 排私訊；照舊交往中', !OUT.get(H.G,'apart29_heroine_01_3')&&P.st==='call'&&P.n===2&&P.call===D('2029-05-24')*24+22&&PHONE.sent(H.G,'apart29_call_heroine_01')&&H.G.flags.dating_heroine_01===true);
    at('2029-05-24',21.9); PHONE.tick(H.G); const early=!H.msgs('p:heroine_01').includes(DM)&&!dueHas('r2y4b_apart29_call_heroine_01');
    at('2029-05-24',22); PHONE.tick(H.G); const m=(H.G.msgs||[]).find(x=>x.text===DM);
    check('4. 22:00 她私訊「你是不是有話要跟我說。」（以前沒有）；接著電話版到期', early&&!!m&&m.th==='p:heroine_01'&&m.from==='heroine_01'&&m.h===22&&dueHas('r2y4b_apart29_call_heroine_01'));
    H.said=[]; H.opts=[]; H.bgs=[]; caps.length=0; H.picks=[1]; await H.run('r2y4b_apart29_call_heroine_01'); const h=hist('heroine_01');
    check('4. 電話版：地點的旁白換成「（電話。）」，其他照原文（以安「理由呢？」→ 沒說）；字幕「電話」、背景照事件的 {scene:\'電話\'}（不在家＝晚上的路邊，圖還沒到＝深色底）', same('heroine_01',want('heroine_01',2029,'quiet',true))&&caps.includes('電話')&&!caps.includes('法律系館B 研討室外的走廊')&&bgOk('phone'), dump());
    check('4. 電話版談完：分開（apart_choice、said quiet）；事件記一次；不會再演', H.G.flags.EX_heroine_01===true&&!!h&&h.how==='apart_choice'&&h.said==='quiet'&&h.day===D('2029-05-24')&&(H.G.events.done.ev_choice_apart_heroine_01|0)===1&&!dueHas('r2y4b_apart29_call_heroine_01')&&apartOuts().filter(q=>q.who==='heroine_01').length===3);
    /* 22:00 以後才算沒到（芷若 22:00 的視訊）：當下私訊 */
    setup('heroine_02',2029,{keep:'heroine_04'}); missThree('heroine_02'); const Z=rnd(S.apartRound(H.G,2029),'heroine_02'), zq=OUT.get(H.G,'apart29_heroine_02_2');
    check('4. 芷若 22:00 的視訊第三次沒接：22:30 才算沒到＝當下私訊（不是過去的 22:00）', Z.st==='call'&&Math.abs(Z.call-(zq.day*24+22.51))<1e-6&&PHONE.sent(H.G,'apart29_call_heroine_02'));
    H.picks=[0]; atAbs(Z.call); PHONE.tick(H.G); await H.run('r2y4b_apart29_call_heroine_02');
    check('4. 芷若的電話版：「（電話。）」→（她沒有接話……）「……我知道了。」（AA_346 3-0）→ 2029 的最後一句', same('heroine_02',want('heroine_02',2029,'told',true)), dump());
    /* 睡過頭（隔天早上才知道沒到）：私訊在當下 */
    setup('heroine_03',2029,{keep:'heroine_04'}); for(let n=0;n<2;n++){ const q=OUT.get(H.G,'apart29_heroine_03_'+n); atAbs(q.day*24+q.h+0.51); expireAll(); }
    const q3=OUT.get(H.G,'apart29_heroine_03_2'); at('2029-05-25',8); expireAll(); const Y=rnd(S.apartRound(H.G,2029),'heroine_03');
    check('4. 第三場那晚睡著了（隔天 08:00 才算沒到）：私訊在當下、電話版接著到期', q3.day===D('2029-05-24')&&Y.st==='call'&&Y.call===D('2029-05-25')*24+8&&(PHONE.tick(H.G),dueHas('r2y4b_apart29_call_heroine_03')));
    /* 每一位都有電話版（2029、2030）*/
    const bad=[];
    for(const id of ORDER) for(const y of [2029,2030]){ setup(id,y,{knew:id==='heroine_04'}); missThree(id); const R=S.apartRound(H.G,y), P2=rnd(R,id); atAbs(P2.call); PHONE.tick(H.G);
      const sid='r2y4b_apart'+(y%100)+'_call_'+id; const due=dueHas(sid); H.said=[]; H.opts=[]; H.bgs=[]; caps.length=0; H.picks=[0]; await H.run(sid);
      if(!(due&&H.msgs('p:'+id).includes(DM)&&same(id,want(id,y,id==='heroine_04'?'knew':'told',true))&&bgOk('phone')&&H.G.flags['EX_'+id]===true&&hist(id).how==='apart_choice')) bad.push(id+' '+y+' '+dump()); }
    check('4. 七位 × 兩年：第三次沒到＝私訊＋電話版（「（電話。）」開頭、其他照原文）、談完分開', !bad.length, bad.join(' ｜ '));
    /* 電話（沛珊）、視訊（芷若 2029）的「不去了」也是沒到 */
    setup('classmate_peishan',2029,{keep:'heroine_04'}); const pq=OUT.get(H.G,'apart29_classmate_peishan_0'); atAbs(pq.day*24+pq.h-0.2); H.picks=[2]; H.opts=[]; await OUT.prompt(GM,OUT.due(H.G));
    check('4. 沛珊（電話）：「打給她：打給沛珊」「今天先不要」＝沒到，延到隔天 21:00', H.opts[0][0]==='打給她：打給'+nm('classmate_peishan')&&H.opts[0][2]==='今天先不要'&&OUT.get(H.G,'apart29_classmate_peishan_1').day===pq.day+1&&OUT.get(H.G,'apart29_classmate_peishan_1').h===21, JSON.stringify(H.opts));
  });

  /* ===== 4b. AA_350 Q4：一晚只排一場；延期撞到別人那一晚＝再往後順延一天（不算沒到）===== */
  await block('4b. 一晚一場',async()=>{
    setup('heroine_03',2029,{keep:'kexin',more:['heroine_01']}); const q1=OUT.get(H.G,'apart29_heroine_01_0'), q3=OUT.get(H.G,'apart29_heroine_03_0');
    atAbs(q1.day*24+q1.h-0.2); H.picks=[2]; H.opts=[]; await OUT.prompt(GM,OUT.due(H.G)); const n1=OUT.get(H.G,'apart29_heroine_01_1'), P=rnd(S.apartRound(H.G,2029),'heroine_01');
    check('4b. 以安第一次沒到、隔天是語彤那一晚＝以安再往後一天（同一時間），只算沒到一次；語彤不動', q3.day===q1.day+1&&!!n1&&n1.day===q1.day+2&&n1.h===q1.h&&P.n===1&&OUT.get(H.G,'apart29_heroine_03_0').day===q3.day&&OUT.get(H.G,'apart29_heroine_03_0').state==='planned', JSON.stringify({q1:q1.day,q3:q3.day,n1:n1&&n1.day,P})); });

  /* ===== 5. 知不知道（BB_194 的 knowsRel）===== */
  await block('5. 知不知道',async()=>{
    setup('heroine_03',2029,{keep:'kexin',more:['heroine_01']}); ROM.learn(H.G,'heroine_03','heroine_01','test');
    let q=OUT.get(H.G,'apart29_heroine_01_0'); atAbs(q.day*24+q.h); H.picks=[0]; await goOut(q.id,[0]);
    q=OUT.get(H.G,'apart29_heroine_03_0'); atAbs(q.day*24+q.h); await goOut(q.id,[0]);
    check('5. AA_350 Q6：她只知道別人（以安，先談完分開的那一位）、不知道被選的可昕＝照「不知道」走（二選一；這裡選「我喜歡上別人了。」）', q.day===D('2029-05-23')&&same('heroine_03',want('heroine_03',2029,'told',false))&&hist('heroine_03').said==='told', dump());
    setup('heroine_03',2029,{keep:'kexin'}); ROM.learn(H.G,'heroine_03','kexin','test'); q=OUT.get(H.G,'apart29_heroine_03_0'); atAbs(q.day*24+q.h); H.opts=[]; await goOut(q.id,[0]);
    check('5. AA_350 Q6：她知道被選的那一位（可昕）＝「知道」那一版、沒有二選一', same('heroine_03',want('heroine_03',2029,'knew',false))&&hist('heroine_03').said==='knew'&&H.opts.length===0, dump());
    setup('heroine_04',2029,{keep:'heroine_02'}); ROM.learn(H.G,'heroine_04','heroine_02','told_by:heroine_02'); q=OUT.get(H.G,'apart29_heroine_04_0'); atAbs(q.day*24+q.h); await goOut(q.id,[1]);
    check('5. 子晴從芷若那裡知道（told_by）：知道版，沒有二選一', same('heroine_04',want('heroine_04',2029,'knew',false))&&H.opts.length===0, dump());
    setup('heroine_04',2029,{keep:'heroine_02'}); H.G.flags.knowsRel.heroine_02={heroine_04:{state:'confirmed',source:'test',day:H.G.day}}; q=OUT.get(H.G,'apart29_heroine_04_0'); atAbs(q.day*24+q.h); await goOut(q.id,[1]);
    check('5. 只有「被選的那一位知道她」不算她知道：子晴照不知道（二選一）', JSON.stringify(H.opts[0])===JSON.stringify(OPTS)&&hist('heroine_04').said==='quiet', JSON.stringify(H.opts));
  });

  /* ===== 6. 前任版照 apart_talk（偶遇、尾聲）===== */
  await block('6. 前任版',async()=>{
    setup('heroine_05',2029,{keep:'heroine_04'}); const q=OUT.get(H.G,'apart29_heroine_05_0'); atAbs(q.day*24+q.h); await goOut(q.id,[0]);
    const row=ENCOUNTERS.rows.find(r=>r.who==='heroine_05'&&r.spot==='D06'), tr=ENC.tier(H.G,'heroine_05'); H.said=[]; H.opts=[]; H.picks=['打招呼']; const res=await ENC.meet(GM,row,tr);
    check('6. 偶遇（北美館）：前任 how apart_choice 照 apart_talk 那一句「學弟。……我先走了。」', tr.t==='ex'&&tr.how==='apart_choice'&&res==='ex'&&H.said.some(s=>s.t==='學弟。……我先走了。')&&ENC.exKey(row.ex,'apart_choice')==='apart_talk', dump());
    H.G.flags.ROMANCE_HISTORY=[{id:'heroine_05',from:'Y4S2W1',to:'Y4S2W10',how:'apart_talk'}]; H.said=[]; H.picks=['打招呼']; await ENC.meet(GM,row,ENC.tier(H.G,'heroine_05'));
    check('6. 原本 apart_talk 的照舊', H.said.some(s=>s.t==='學弟。……我先走了。'));
    /* 尾聲：前任經過時那一句（以安）*/
    setup('heroine_01',2029,{keep:'heroine_04'}); const qa=OUT.get(H.G,'apart29_heroine_01_0'); atAbs(qa.day*24+qa.h); await goOut(qa.id,[1]);
    Object.assign(H.G.flags,GD,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer',BAR_YEAR:2029,FIRST_DAY_SEEN:true}); PG.rec(H.G).done.grad=1; PG.rec(H.G).done.first=1; at('2034-06-03',18);
    H.said=[]; H.cards=[]; H.cgs=[]; GM.running=true; await H.run('epi');
    check('6. 尾聲：選一個人以後分開的以安＝前任，在店的另一頭「好久不見。」「我先走了，合約週一要交。」', H.has('好久不見。')&&H.has('我先走了，合約週一要交。')&&!H.has(POSTGRAD_LINES.EPI.an.friend), dump());
  });

  /* ===== 7. 不排的 ===== */
  await block('7. 不排',async()=>{
    fresh('2029-05-21',22); H.FRIEND('heroine_01'); date('heroine_01');
    check('7. 只有一位伴侶：沒有「選一個人」這一場、沒有排程', !S.multiPreDue(H.G)&&!dueHas('r2y4b_multi_pre')&&!S.apartRound(H.G,2029)&&!apartOuts().length);
    fresh('2029-05-21',22); for(const id of ['heroine_01','heroine_04']){ H.FRIEND(id); date(id); } H.picks=[2]; await H.run('r2y4b_multi_pre');
    const later=H.G.flags.MULTI_PRE==='later'&&!S.apartRound(H.G,2029)&&!apartOuts().length;
    fresh('2029-05-21',22); for(const id of ['heroine_01','heroine_04']){ H.FRIEND(id); date(id); } H.picks=[0]; await H.run('r2y4b_multi_pre');
    check('7. 「先不想。」「先跟她們說清楚。」：沒有分開的談話（說清楚照原本 21:00 那一套）', later&&H.G.flags.MULTI_PRE==='tell'&&!S.apartRound(H.G,2029)&&!apartOuts().length);
    fresh('2030-05-25',22,GD); PG.rec(H.G).done.grad=1; for(const id of ['heroine_01','heroine_04']){ H.FRIEND(id); date(id); } H.picks=[2]; await H.run('r2y4b_multi_y5');
    const none=H.G.flags.MULTI_Y5==='none'&&H.G.flags.EPI_SEAT_EMPTY===true&&!S.apartRound(H.G,2030)&&!apartOuts().length&&H.G.flags.dating_heroine_01&&H.G.flags.dating_heroine_04;
    fresh('2030-05-25',22,GD); PG.rec(H.G).done.grad=1; for(const id of ['heroine_01','heroine_04']){ H.FRIEND(id); date(id); } H.picks=[1]; await H.run('r2y4b_multi_y5');
    check('7. 2030「（不選）」「跟她們說實話。」：沒有分開的談話、兩段都還在（不選）', none&&H.G.flags.MULTI_Y5==='tell'&&!S.apartRound(H.G,2030)&&!apartOuts().length);
  });

  /* ===== 8. 舊存檔（已經用 apart_talk 分開）不變 ===== */
  await block('8. 舊存檔',async()=>{
    fresh('2029-05-25',20); H.FRIEND('heroine_01'); H.FRIEND('heroine_04'); date('heroine_01'); date('heroine_04'); ROM.end(H.G,'heroine_04','apart_talk'); H.G.flags.MULTI_PRE='pick:heroine_01';
    const before=JSON.stringify([H.G.flags.ROMANCE_HISTORY,H.G.flags.romance,H.G.flags.EX_heroine_04,H.G.flags.dating_heroine_01]);
    H.G=JSON.parse(JSON.stringify(H.G)); SOCIAL.bind(H.G); EVENTS.bind(GM); INV.rec(H.G);
    for(const h of [20.5,21,22,23]){ at('2029-05-25',h); S.phone(H.G,GM); PG.rules(GM); PHONE.tick(H.G); }
    at('2029-05-30',18); S.phone(H.G,GM);
    check('8. 舊存檔（選一個人、其他人已經 apart_talk 分開）：沒有補排談話、沒有電話版、分開的紀錄和交往狀態一字不改',
      JSON.stringify([H.G.flags.ROMANCE_HISTORY,H.G.flags.romance,H.G.flags.EX_heroine_04,H.G.flags.dating_heroine_01])===before&&!S.apartRound(H.G,2029)&&!apartOuts().length&&!PG.pending(H.G).some(p=>/^r2y4b_apart/.test(p.s.id))&&!H.G.flags.CHOICE_APART_DONE);
  });

  /* ===== 9. 談話以前她因為別的原因分開＝那一場取消 ===== */
  await block('9. 取消',async()=>{
    setup('heroine_01',2029,{keep:'heroine_04'}); ROM.end(H.G,'heroine_01','apart_talk'); S.phone(H.G,GM);
    const P=rnd(S.apartRound(H.G,2029),'heroine_01'), q=OUT.get(H.G,'apart29_heroine_01_0'); at('2029-05-22',17.7);
    check('9. 選了以後、談話以前她已經不在交往：那一場取消（不問「出發」）、不記 apart_choice', P.st==='void'&&q.state==='cancelled'&&!OUT.due(H.G)&&hist('heroine_01').how==='apart_talk'&&!(H.G.flags.CHOICE_APART_DONE||[]).length);
    setup('heroine_01',2029,{keep:'heroine_04'}); missThree('heroine_01'); ROM.end(H.G,'heroine_01','apart_talk'); S.phone(H.G,GM); at('2029-05-24',22.5); PHONE.tick(H.G);
    check('9. 電話版排好了才分開：私訊不送、電話版不演', rnd(S.apartRound(H.G,2029),'heroine_01').st==='void'&&!H.msgs('p:heroine_01').includes(DM)&&!dueHas('r2y4b_apart29_call_heroine_01'));
  });

  /* ===== 10. 收拾的時刻（V6-S4，c2035d7f STORY.cleanupTick）：談完才 ROM.end，一週後照樣補旁白 ===== */
  await block('10. 收拾的時刻',async()=>{
    const settle=()=>new Promise(r=>setTimeout(r,0)), line=STORY.CLEANUP_LINE;
    setup('heroine_01',2029,{keep:'heroine_04',more:['heroine_03']}); const F=H.G.flags;   /* 以安 5/22 18:00、語彤 5/23 21:30 */
    at('2029-05-22',12); H.said=[]; STORY.cleanupTick(GM); await settle();
    check('10. 選了以後、談話以前：還沒分開，沒有收拾的時刻（CLEANUP_DONE 照舊、不補旁白）', F.CLEANUP_DONE!==false&&!ROM.cleanupLate(H.G)&&!H.has(line));
    let q=OUT.get(H.G,'apart29_heroine_01_0'); atAbs(q.day*24+q.h); await goOut(q.id,[0]);
    check('10. 以安談完（ROM.end apart_choice）：CLEANUP_DONE false、cleanupDue＝5/22＋7', F.CLEANUP_DONE===false&&F.cleanupDue===D('2029-05-29'));
    q=OUT.get(H.G,'apart29_heroine_03_0'); atAbs(q.day*24+q.h); await goOut(q.id,[1]);
    check('10. 語彤 5/23 談完：cleanupDue 跟著往後（5/30）', F.CLEANUP_DONE===false&&F.cleanupDue===D('2029-05-30'));
    at('2029-05-29',20); H.said=[]; STORY.cleanupTick(GM); await settle(); const day6=!H.has(line)&&F.CLEANUP_DONE===false;
    at('2029-05-30',20); H.said=[]; STORY.cleanupTick(GM); await settle(); const day7=H.has(line)&&F.CLEANUP_DONE===true&&F.cleanupDue==null;
    H.said=[]; STORY.cleanupTick(GM); await settle();
    check('10. 一週後（最後一場 5/23＋7＝5/30）補一句旁白「（你把那件事放好了。）」、CLEANUP_DONE true；第 6 天不補；補過不再補', line==='（你把那件事放好了。）'&&day6&&day7&&!H.has(line));
    check('10. 收拾過以後：可以和別人開始新的一段（ROM.canStart）；選的那一位照舊交往', ROM.canStart(H.G,'heroine_02')&&F.dating_heroine_04===true);
  });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
