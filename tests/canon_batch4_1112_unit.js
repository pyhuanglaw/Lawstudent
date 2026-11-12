// CANON-NO-ECON-1112 第四批 第一部分（可昕追求路線、開局、第一份對照表）——不需要瀏覽器（D131）。
//   1  日文班群組三則（AA_521 第 4 節，搬回 src/jpclass3d.js）：只送給日文班群組的人；4-3 只有日本路線、人在日本；回「好。」以後 4/22 白天的摘要一列、當晚采蓁兩則；「這週沒空。」她回一句
//   2  可昕學期末的心意邀約（AA_895 第 2 節）：地點、時間、邀約／婉拒／飯桌／回家路上／答應（夏天那一版）／她先說／想想／第二次；朋友的期末邀約；知情那一句；慢慢分開以後不發
//   3  可昕的層級、作息（AA_895 第 4 節）：D 層；週二四中午法律系館A、平日晚上總圖（考試週到閉館）、週三傍晚椰影大道、週六下午溫州街、週日不在；認識以前不在
//   4  ③b 隔天道歉（AA_895 第 3 節）：看過 ③ 的隔天起第一堂早上的必修課前；沒看過 ③ 不演
//   5  可昕的邀約回覆（AA_891 第 2 節）：kx1～kx19 在 law；分開以後只用「（分開以後）」那幾列答應
// 用法：node tests/canon_batch4_1112_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG=new Set([...fs.readFileSync(path.join(H.ROOT,'tests/pg_harness.js'),'utf8').matchAll(/'(src\/[^']+\.js)'/g)].map(m=>m[1]));
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,100)); } } }
if(typeof XCROM!=='undefined') XCROM.OLD=true; else globalThis.XCROM={OLD:true};
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.skipScope=()=>{};
const D=k=>STORY.dayOfKey(k), sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const G=()=>H.G, msgs=th=>(G().msgs||[]).filter(m=>m.th===th);
const runTo=(key,h)=>{ const d=D(key); for(let x=Math.max(0,h-0.5);x<=h+0.01;x+=0.25){ G().day=d; G().hour=+x.toFixed(2); STORY.phoneRules(GM); PHONE.tick(G()); } };

(async()=>{
  check('0. 載入沒有錯（含 src/jpclass3d.js）',!loadErr.length&&typeof JPCLASS!=='undefined'&&typeof JPCLASS_LINES!=='undefined',J(loadErr.slice(0,3)));

  await sec('1',async()=>{
    // 4-1：在日文班群組
    H.fresh('2027-10-26',20,'dorm',{}); PHONE.join(G(),'jp_class','日文班'); runTo('2027-10-26',21.75);
    const a=msgs('g:jp_class').map(m=>m.name+'：'+m.text);
    check('1. 4-1（2027-10-26 21:30）：日文班群組四則，采蓁說的，字照 AA_521',J(a)===J(['采蓁：我修了日文中級！','采蓁：今天實習，有一隻柴犬的主人是日本人。','采蓁：他講的我聽懂一半。','采蓁：另一半是狗在叫。']),J(a));
    H.fresh('2027-10-26',20,'dorm',{}); runTo('2027-10-26',21.75);
    check('1. 不在日文班群組：不送（記 x:cond）',!msgs('g:jp_class').length&&G().flags.EF_PH.jpc_vet_level2==='x:cond',J(G().flags.EF_PH));
    // 4-2
    H.fresh('2027-12-07',20,'dorm',{}); PHONE.join(G(),'jp_class','日文班'); runTo('2027-12-07',21.75);
    const b=msgs('g:jp_class').map(m=>m.name+'：'+m.text);
    check('1. 4-2（2027-12-07 21:30）：宇恆三則、采蓁「不行。」',J(b)===J(['宇恆：我在學韓文了。','宇恆：韓文的子音跟電路一樣，有規則。','宇恆：日文班的群組可以發韓文嗎？','采蓁：不行。']),J(b));
    // 4-3：不在日本＝不送
    H.fresh('2028-04-18',20,'dorm',{}); PHONE.join(G(),'jp_class','日文班'); runTo('2028-04-18',21.25);
    check('1. 4-3：沒有在日本＝不送（x:cond）',!msgs('g:jp_class').some(m=>m.text==='你在日本嗎？')&&G().flags.EF_PH.jpc_vet_ask==='x:cond',J(G().flags.EF_PH));
    // 4-3：在日本（照 S.inJapan）——ask 的兩個選項、她的回覆、記的旗標
    const keep=JPCLASS.inJapan; JPCLASS.inJapan=()=>true;
    try{ H.fresh('2028-04-18',20,'dorm',{}); PHONE.join(G(),'jp_class','日文班'); const e=JPCLASS_LINES.jp[2]; const ok=JPCLASS.send(G(),Object.assign({},e,{at:'2028-04-18 20:00'}),'g:jp_class',()=>true,g=>JPCLASS.jpAsk(g,e)); PHONE.tick(G());
      const m=msgs('g:jp_class'), last=m[m.length-1], ask=last&&last.ask;
      check('1. 4-3 在日本：三則、最後一則可以回「好。」「這週沒空。」；「好。」＝CZ_VET_PHOTO yes、「這週沒空。」＝no 且她回「好，不急！」',ok&&J(m.map(x=>x.text))===J(['你在日本嗎？','可以幫我看一下那邊的動物醫院長怎樣嗎？','拍門口就好！'])&&!!ask&&J(ask.opts.map(o=>o.t))===J(['好。','這週沒空。'])
        &&ask.opts[0].set.CZ_VET_PHOTO==='yes'&&!ask.opts[0].say.length&&ask.opts[1].set.CZ_VET_PHOTO==='no'&&J(ask.opts[1].say.map(s=>s.name+'：'+s.text))===J(['采蓁：好，不急！']),J(ask)); }
    finally{ JPCLASS.inJapan=keep; }
    const row=(typeof JP!=='undefined'&&JP.SCH||[]).find(s=>s.k==='cz_vet_photo');
    check('1. 回「好。」的 4/22（六）11:00 日本的摘要一列（JP.SCH cz_vet_photo，只在 CZ_VET_PHOTO yes）',!!row&&row.d==='2028-04-22'&&row.h===11&&row.sum==='（你拍了一間動物醫院的門口。門口的貓在睡覺。）'&&row.if({flags:{CZ_VET_PHOTO:'yes'}})&&!row.if({flags:{CZ_VET_PHOTO:'no'}}),J(row));
    // 4-3 之後：摘要演過＝當晚采蓁兩則；沒演過、或回「這週沒空。」＝沒有
    H.fresh('2028-04-22',20,'dorm',{CZ_VET_PHOTO:'yes'}); PHONE.join(G(),'jp_class','日文班'); JP.rec(G()).done.cz_vet_photo=D('2028-04-22'); runTo('2028-04-22',21.25);
    check('1. 回「好。」、拍過照：4/22 21:00 采蓁「牠好胖！」「謝謝！」',J(msgs('g:jp_class').map(m=>m.text))===J(['牠好胖！','謝謝！']),J(msgs('g:jp_class').map(m=>m.text)));
    H.fresh('2028-04-22',20,'dorm',{CZ_VET_PHOTO:'no'}); PHONE.join(G(),'jp_class','日文班'); JP.rec(G()).done.cz_vet_photo=D('2028-04-22'); runTo('2028-04-22',21.25);
    check('1. 回「這週沒空。」：沒有謝謝那兩則',!msgs('g:jp_class').length);
    H.fresh('2028-04-22',20,'dorm',{CZ_VET_PHOTO:'yes'}); PHONE.join(G(),'jp_class','日文班'); runTo('2028-04-22',21.25);
    check('1. 回「好。」但那一句還沒演：還沒有謝謝',!msgs('g:jp_class').length);
    H.fresh('2027-10-26',20,'dorm',{EF_PH:{jpc_vet_level2:'sent'}}); PHONE.join(G(),'jp_class','日文班'); runTo('2027-10-26',21.75);
    check('1. 舊存檔已經送過（EF_PH 照舊）：不再送一次',!msgs('g:jp_class').length);
    check('1. 第 2 節（舊序章的朋友群組）沒有搬回來：JPCLASS 沒有 grp、台詞檔只有 jp／vetPhoto／vetThanks',!('grp' in JPCLASS)&&J(Object.keys(JPCLASS_LINES).sort())===J(['jp','vetPhoto','vetThanks']));
  });

  await sec('2',async()=>{
    const Lx=TERMEND_LINES, h=TERMEND.heart('kexin','Y1S1'), s2=TERMEND.heart('kexin','Y1S2');
    check('2. 心意邀約：學校後門・湯餃店 19:00、回家路上椰影大道（AA_895 第 2 節）',!!h&&h.place==='dumpling_gate'&&h.placeName==='學校後門・湯餃店'&&h.h===19&&h.walkPlace==='椰影大道・往女生宿舍'&&Lx.PLACE.dumpling_gate.name==='學校後門・湯餃店',J(h&&[h.place,h.h]));
    check('2. 邀約、婉拒、飯桌、回家路上照稿',h.invite==='考完了。後門那家，晚上七點。……只有我們兩個。'&&h.decline==='好。那開學見。'&&h.table==='你的那碗我叫老闆不要放香菜。……你每次都挑很久。'&&J(h.walk)===J(['走到這裡就好。……你要講什麼，現在講。']));
    check('2. 答應：冬天圍巾那一版（上學期）、夏天看路燈那一版（下學期）；「不准笑。」',J(h.yes)===J(['……你講了。',{narr:'（她把圍巾拉高，遮住半張臉。）'},'好。我答應你。','不准笑。'])&&J(s2.yes)===J(['……你講了。',{narr:'（她把頭轉開，看路燈。耳朵是紅的。）'},'好。我答應你。','不准笑。']),J(s2.yes));
    check('2. 她先說、想想、第二次',J(h.she)===J(['你每次都等我先講。','這次我也先講。……我喜歡你。','你現在回答。不要讓我等。'])&&h.think==='……好。你想。不要想太久，我會不爽。'&&h.invite2==='考完了。後門那家。……上次的事，你想好了嗎。'&&J(h.she2)===J(['我上次講過了。我不想講第二次。','……你回答就好。'])&&J(h.yes2)===J(['……嗯。','好。']));
    check('2. 朋友的期末邀約：大一上「考完了。要不要吃個飯？後門那家。」、其他「考完了。吃飯嗎？」；知情那一句',Lx.FRIEND.kexin.y1s1==='考完了。要不要吃個飯？後門那家。'&&Lx.FRIEND.kexin.gen==='考完了。吃飯嗎？'&&Lx.NOPE.knows.kexin==='考完了。這次我不約你。……你應該知道為什麼。');
    H.fresh('2026-01-08',20,'dorm',{KX_MET:true,KX_ENDED:'drift'}); const w=TERMEND.window?TERMEND.window(G()):null;
    check('2. 慢慢分開以後（KX_ENDED drift）：心意邀約不發（AA_876）',TERMEND.heartWhy(G(),'kexin',w||{id:'Y1S1'})===false);
    check('2. 交往中照舊走女朋友的學期末約會（KX），不在心意邀約',(()=>{ H.fresh('2026-01-08',20,'dorm',{KX_MET:true,dating_kexin:true}); return TERMEND.heartWhy(G(),'kexin',{id:'Y1S1'})===false; })());
  });

  await sec('3',async()=>{
    const c=CHARACTERS.kexin;
    check('3. 可昕和其他女主角同一層（D）',c.social_layer==='D'&&CHARACTERS.heroine_03.social_layer==='D');
    const where=(key,h,flags)=>{ H.fresh(key,h,'dorm',Object.assign({KX_MET:true},flags||{})); const e=STORY.schedEnt(c,G()); return e?e.zone+'/'+e.act:null; };
    const Y1S1=w=>STORY.termDay('Y1S1',w,1), K=d=>CALENDAR.dateOf(d).key;
    const W=5, tue=K(Y1S1(W)+1), wed=K(Y1S1(W)+2), sat=K(Y1S1(W)+5), sun=K(Y1S1(W)+6), mon=K(Y1S1(W)+3);   /* 第 5 週（第 8、9 週是期中週 T.exam；第 5～7 週的週一放假，平日晚上用週四）*/
    check('3. 週二 12:30 法律系館A（吃飯）',where(tue,12.5)==='linze/eat',where(tue,12.5));
    check('3. 平日（週四）19:00 總圖念書；21:45 已經走了（學期中 21:30）',where(mon,19)==='library/read'&&where(mon,21.75)!=='library/read',where(mon,19)+' '+where(mon,21.75));
    check('3. 週三 17:00 椰影大道（走回宿舍）',where(wed,17)==='campus/walk',where(wed,17));
    check('3. 週六 15:00 溫州街',where(sat,15)==='wenzhou/wander',where(sat,15));
    check('3. 週日：不在外面',where(sun,15)===null&&where(sun,19)===null);
    const exw=(()=>{ for(let d=STORY.termDay('Y1S1',14,1);d<STORY.termDay('Y1S1',20,1);d++){ const T=CALENDAR.termOf(d); if(T&&T.exam&&[1,2,3,4,5].includes(CALENDAR.dateOf(d).wd)&&!CALENDAR.holiday(d)) return d; } return null; })();
    check('3. 考試週：21:45 還在總圖（念到閉館）',exw!=null&&where(K(exw),21.75)==='library/read',exw!=null?where(K(exw),21.75):'找不到考試週');
    check('3. 新設定的局、還沒認識：不在任何地方',(()=>{ H.fresh(tue,12.5,'dorm',{KX_MET:false}); return STORY.schedEnt(c,G())===null; })());
  });

  await sec('4',async()=>{
    const e=STORY_EVENTS.find(x=>x.id==='ev_kx_angry_sorry'), d10=STORY.termDay('Y1S1',10,2);
    check('4. ③b 有這一場（AA_895 第 3 節），台詞照稿、最後一句旁白',!!e&&J(e.dialogue.filter(l=>l.text!==undefined).map(l=>(l.speaker||'')+'|'+l.text))===J(['|（隔天早上，那個同學在教室門口等她。）','那個同學|昨天的事，對不起。','kexin|好。','|（她沒有看他，直接進教室了。）','|（坐下以前，她在班群把下週的共筆標給他，後面多打了一句：「有問題問我。」）']));
    H.fresh(CALENDAR.dateOf(d10+1).key,8,'classroom',{KX_MET:true,KX_ANGRY_SEEN:true,KX_ANGRY_DAY:d10});
    const ok=EVENTS.check?EVENTS.check(e):true;
    H.fresh(CALENDAR.dateOf(d10).key,8,'classroom',{KX_MET:true,KX_ANGRY_SEEN:true,KX_ANGRY_DAY:d10}); const same=EVENTS.check?EVENTS.check(e):false;
    H.fresh(CALENDAR.dateOf(d10+1).key,8,'classroom',{KX_MET:true}); const none=EVENTS.check?EVENTS.check(e):false;
    check('4. 條件：看過 ③ 的隔天起才演；同一天、沒看過 ③ 不演',ok&&!same&&!none,J([ok,same,none]));
  });

  await sec('5',async()=>{
    const R=INVITE_REPLIES.people.kexin, ids=R.map(r=>r.id);
    check('5. 可昕的邀約回覆全部在 law（kx1～kx19 搬過來，AA_891）；kx36、kx38 沒有',R.every(r=>r.sec==='law')&&!ids.includes('kx36')&&!ids.includes('kx38')&&R.find(r=>r.id==='kx1').lines[0]==='總圖？好。上課你都坐我後面，這次換你坐前面。'&&R.find(r=>r.id==='kx34').lines[0]==='好。不要問我為什麼又答應。',J(R.filter(r=>r.sec!=='law').map(r=>r.id)));
    H.fresh('2026-03-11',15,'dorm',{EX_kexin:true}); H.rel('kexin',45,30,0); INV.addContact(G(),'kexin'); const st=INV.replyStage(G(),'kexin'); const got=[];
    for(let i=0;i<4;i++){ const r=INV.personal(G(),'kexin',INV.place('cafe'),G().day,19,{res:'accept'}); got.push(r&&r.lines?r.lines.join(''):null); }
    const apartTxt=R.filter(r=>r.apart).map(r=>r.lines.join(''));
    check('5. 分開以後：答應只用「（分開以後）」那幾列（不會用到認識到告白前的列）',got.every(t=>t==null||apartTxt.includes(t)),J([st,got]));
  });

  H.done();
})();
