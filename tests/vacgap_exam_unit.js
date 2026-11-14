// 假期空白（BB198-VACB22）第三批：AA_929——Kevin 每學期開學（2-3）、考場偶遇（3-1 明軒托福、3-3 學姊托福兩版、3-4 阿凱多益）、學姊托福的招呼（3-2）。
// 用法：node tests/vacgap_exam_unit.js
// 檢查：開學那則的日子（第 1 週週一 21:00）、只在家族群組；考場偶遇只在那一天的 C04 正式考試演完接著演、不是那一天／不認識／演過了＝沒有；字＝AA 稿；旗標照 BB_198 7-3；
//       學姊的招呼只在大二暑假、報了 C04、總圖或法圖、FAMILIAR 以上，一次，說完照常閒聊。
// 修改前（dd63a41a10）：全部 FAIL。
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const loadG=f=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
let loadErr=''; for(const f of ['src/data/vacgap_lines.js','src/vacgap3d.js']){ try{ loadG(f); }catch(e){ loadErr+=f+'：'+(e&&e.message||e)+'　'; } }
check('0. 載得到；VAC.key 包了一層',!loadErr&&!!VAC.key._vacgap,loadErr);
const L=VACGAP_LINES, D=H.D, T=(d,h)=>d*24+h, K=d=>CALENDAR.dateOf(d).key, wd=d=>CALENDAR.dateOf(d).wd%7;
const set=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); };
let LOG={};
const runTo=(key,h,step)=>{ step=step||1; const t1=T(D(key),h); let t=T(H.G.day,H.G.hour); while(t<t1-1e-9){ t=Math.min(t1,t+step); const d=Math.floor(t/24); set(d,t-d*24); STORY.phoneRules(GM); PHONE.tick(H.G); for(const m of H.G.msgs||[]) if(m.tag){ const A=LOG[m.tag]||(LOG[m.tag]=[]); if(!A.includes(m)) A.push(m); } } };
const got=tag=>LOG[tag]||[], when=tag=>{ const m=got(tag)[0]; return m?K(m.day)+' '+m.h:null; };
const said=()=>H.said.map(s=>s.t);
(async()=>{
  // ===== 2-3 Kevin 開學 =====
  H.fresh('2026-09-01',8,'dorm'); LOG={}; PHONE.join(H.G,'family_law','法律系家族'); runTo('2028-02-25',12,6);
  const exp=['Y2S1','Y2S2','Y3S1','Y3S2'].map(t=>K(STORY.termDay(t,1,1))+' 21');
  check('2-3-1 大二上～大三下每學期第 1 週週一 21:00',J(['Y2S1','Y2S2','Y3S1','Y3S2'].map(t=>when('msg_kevin_term_start_'+t)))===J(exp)&&['Y2S1','Y2S2','Y3S1','Y3S2'].every(t=>wd(STORY.termDay(t,1,1))===1),J(exp));
  check('2-3-2 字＝AA_929 2-3；大三下學姊回「好。」',J(got('msg_kevin_term_start_Y2S1').map(m=>m.text))===J(L.kevinTerm.Y2S1)&&J(got('msg_kevin_term_start_Y3S2').map(m=>m.from+':'+m.text))===J(['kevin:最後一學期！','kevin:家聚要辦大的 學姊也要來喔','heroine_05:好。']));
  H.fresh('2026-09-01',8,'dorm'); LOG={}; runTo('2026-09-20',12,6); check('2-3-3 不在家族群組＝沒有',!got('msg_kevin_term_start_Y2S1').length);

  // ===== 考場偶遇 =====
  const I04={A:{id:'C04W',series:'C04'},key:'C04W@Y2',yk:'Y2'}, exam={day:'01-23',h:9,title:'正式考試',bg:null,lines:[{narr:'考場在別的學校。你提早半小時到，還是找了一下教室。'}]};
  H.fresh('2027-01-23',9,'out'); H.FAMILIAR('classmate_mingxuan'); H.picks=['你也考托福？'];
  await VAC.key(GM,exam,I04);
  check('3-1-1 2027-01-23 C04 正式考試演完：明軒（字照 AA_929 3-1）',J(said())===J(['考場在別的學校。你提早半小時到，還是找了一下教室。'].concat(L.mxToefl.pre,[L.mxToefl.say],L.mxToefl.opts[0].say,[L.mxToefl.end])),J(said()));
  check('3-1-2 記 MX_SEEN_TOEFL；再跑一次不演',H.G.flags.MX_SEEN_TOEFL===true&&(H.said=[],await VAC.key(GM,exam,I04),said().length===1));
  H.fresh('2027-01-24',9,'out'); H.FAMILIAR('classmate_mingxuan'); await VAC.key(GM,exam,I04); check('3-1-3 別的日子＝沒有',said().length===1&&!H.G.flags.MX_SEEN_TOEFL);
  H.fresh('2027-01-23',9,'out'); await VAC.key(GM,exam,I04); check('3-1-4 不認識明軒＝沒有',said().length===1);
  H.fresh('2027-01-23',9,'out'); H.FAMILIAR('classmate_mingxuan'); await VAC.key(GM,{h:9,bg:null,lines:[{narr:'考場是同一間學校。這次你知道廁所在哪裡。'}]},I04);
  check('3-1-5 第二次以後的 C04（rep 那一句，沒有 title）也接得上',said().length>1&&H.G.flags.MX_SEEN_TOEFL===true);
  H.fresh('2027-01-23',19,'out'); H.FAMILIAR('classmate_mingxuan'); await VAC.key(GM,{title:'第一堂',h:19,bg:null,lines:[]},{A:{id:'C17',series:'C17'}}); check('3-1-6 別的活動、別的關鍵事件＝沒有',!said().length);
  const I04S={A:{id:'C04',series:'C04'},key:'C04@Y2',yk:'Y2'};
  H.fresh('2027-08-28',9,'out'); H.FAMILIAR('heroine_05'); H.picks=['考得怎樣？']; await VAC.key(GM,exam,I04S);
  check('3-3-1 2027-08-28 沒交往：學姊「學弟。你也是這一場。」那一版（SIS_TOEFL_SAMEDAY friend）',J(said().slice(1))===J([L.sisToeflDay.friend[0].n,L.sisToeflDay.friend[1].s,L.sisToeflDay.friendOpts[1].say[0],L.sisToeflDay.friendEnd])&&H.G.flags.SIS_TOEFL_SAMEDAY==='friend',J(said()));
  H.fresh('2027-08-28',9,'out'); H.FAMILIAR('heroine_05'); H.G.flags.dating_heroine_05=true; await VAC.key(GM,exam,I04S);
  check('3-3-2 交往中那一版（dating）',J(said().slice(1))===J(L.sisToeflDay.dating.map(x=>x.n||x.s))&&H.G.flags.SIS_TOEFL_SAMEDAY==='dating');
  H.fresh('2028-01-16',9,'out'); H.FAMILIAR('kai'); await VAC.key(GM,exam,{A:{id:'C04W',series:'C04'},key:'C04W@Y3',yk:'Y3'});
  check('3-4-1 2028-01-16 多益：阿凱（KAI_TOEIC_SEEN）',J(said().slice(1))===J(L.kaiToeic.map(x=>x.n||x.s))&&H.G.flags.KAI_TOEIC_SEEN===true);

  // ===== 3-2 學姊托福的招呼 =====
  global.SISY23={preTalk:Object.assign(async()=>false,{_closed:true})}; VACGAP.hookSis();
  check('3-2-0 包住 SISY23.preTalk（保留原本的旗標）',!!SISY23.preTalk._vacgap&&!!SISY23.preTalk._closed);
  const reg=()=>{ const R=VAC.rec(H.G).reg; R['C04@Y2']='yes'; };
  H.fresh('2027-07-01',14,'lawlib'); H.FAMILIAR('heroine_05'); reg(); await SISY23.preTalk(GM);
  check('3-2-1 大二暑假、報了 C04、法圖：三句（一次）',J(said())===J(L.sisToeflTip)&&H.G.flags.SIS_TOEFL_TIP===true&&(H.said=[],await SISY23.preTalk(GM),!said().length));
  H.fresh('2027-07-01',14,'campus'); H.FAMILIAR('heroine_05'); reg(); await SISY23.preTalk(GM); check('3-2-2 不在總圖、法圖＝沒有',!said().length);
  H.fresh('2027-07-01',14,'library'); H.FAMILIAR('heroine_05'); await SISY23.preTalk(GM); check('3-2-3 沒報 C04＝沒有',!said().length);
  H.fresh('2027-07-01',14,'library'); H.rel('heroine_05',5,0,0); reg(); await SISY23.preTalk(GM); check('3-2-4 FAMILIAR 不到＝沒有',!said().length);
  H.fresh('2027-09-20',14,'library'); H.FAMILIAR('heroine_05'); reg(); await SISY23.preTalk(GM); check('3-2-5 開學以後（不是大二暑假）＝沒有',!said().length);
  H.done();
})();
