// SHOP-ENCOUNTER-1103（USER_WANTS X188；使用者 11-03：「我希望除了路人 也會隨機在不同店面遇到朋友 或可以認識人」）＋SHOP-DINERS-1103 的路人句（AA_640）——不需要瀏覽器。
// 檢查：
//   1. 資料：src/data/shop_enc.js＝劇情匯入白名單上的四個版本（AA_632 v1、AA_633 v2 都是 AA_641 改過的 6adb0e47c；AA_640 22c966e4a；AA_641 6adb0e47c），台詞一字不差；匯入工具 --check 一致；白名單四筆 approved。
//      AA_641：沛珊三列拿掉 Y2S2、冰菓室改週五 18:30～20:30；以安 Café 的 why「沙發那一區」；宋知寧六則訊息、她只回「哈哈。」「好。」；一起坐的旁白。
//   2. 每一列在自己的時段（星期、時段、學期、週次、月份）會出現、不在時段不出現；台詞照關係分層（acq／friend／dating／all）。
//   3. 不會遇到：考試週（cafe、cvs 以外；影印店 examOK 例外）、那天和她有約、約好的時間、在國外（以安大三下）、還不認識、還不夠熟、劇情演出中、
//      同一個人一天一次（和自由出行的偶遇一起算）、同一家店同一時段最多一位、作息在別的地方（不能同時兩個地方）、學姊定食一週一次、有人跟著你不排。
//   4. 擲一次就固定（同一天同一時段一樣、約 60%）。
//   5. 走過去：why → 打招呼／一起坐（join 允許時）／不打擾；打招呼熟悉 +1（shopHi）、一起坐 AA_124 1-2（cafe）、不打擾什麼都沒有；memo 第一次留；前任照 ex、沒有寫的用 NOD。
//   6. 作息（STORY.SCHED_X）：決定以後她在那間店（別的區域不生她）；外帶窗口＝在外面（away）；她原本的作息開始了就照原本的。
//   7. 宋知寧：第一次兩個選項都認識（SHOP_ZN_MET）；之後三句輪流；第二次以後加聯絡人（SHOP_ZN_CONTACT）；一天一次。
//   8. 阿德：印東西時隨機一句、考試週機率高、不連續同一句。
//   9. 路人句：吃飯的店兩人一桌（A／B）、Café 第 2～5、7 句、書店 1～6 句、便利商店結帳；考試週多一句（只在考試週）；同一位客人一天同一句；同一句一天不重複；用完就不說；隔天重來。
//  10. 接線：story3d.js populate 一開始 SHOPENC.enter、最後 SHOPENC.after、talkCharacter 先問 SHOPENC.pending；wzshops3d.js 窗口、影印；index.html 載入。
//  11. 宋知寧的訊息（AA_641 第 2 節）：加了聯絡人以後照順序發；每學期最多兩則；平日 21:00 左右；考試週、寒暑假不發；山嵐書店還沒開＝第 5 則跳過；開了＝第 5 則以後她在山嵐書店（週六 14–17）；玩家傳了她只回「哈哈。」或「好。」。
//  12. 一起坐（AA_641 第 5 節）：淡出淡入、時間走 30 分鐘、旁白一句、玩家站起來；同一天同一個人一次；撞到課或約＝選項變灰「等一下有○○」，按了只提示。
//  修改前（AA_641 以前的 ddd603fbc）：第 1 項（版本）、第 2 項（冰菓室碰不到）、第 11、12 項 FAIL。
// 修改前：沒有 SHOPENC、沒有 src/data/shop_enc.js（第 1 項就 FAIL）。用法：node tests/shop_enc_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}}; global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
global.CHAR={build:()=>({position:{x:0,y:0,z:0,set(){}},rotation:{y:0},userData:{}}),setExpr(){}};
console.warn=()=>{};
let GG=null; const STAGE={}, ACTS=[];
global.SOCIAL={STAGES:['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'],MEMORY_LABEL:{},ACT:{chat:{fam:2},cafe:{fam:3,trust:1,comf:2}},
  stage:id=>GG.flags['dating_'+id]?'RELATIONSHIP':(STAGE[id]||'ACQUAINTANCE'),displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,
  has:(id,tag)=>!!(GG.social.mem[id]&&GG.social.mem[id].some(m=>m.tag===tag)),remember:(id,tag)=>{ (GG.social.mem[id]||(GG.social.mem[id]=[])).push({tag,day:GG.day}); },activity:(id,k)=>{ ACTS.push(id+':'+k); return {}; }};
global.EVENTS={cond:c=>!c||((c.flags||[]).every(f=>GG.flags[f])&&!(c.notFlags||[]).some(f=>GG.flags[f])&&(!c.custom||!!c.custom(GG))),npcOf:()=>null,onEnter(){},tick(){},running:false};
const files=['src/data/calendar.js','src/data/characters.js','src/data/places.js','src/story3d.js','src/outings3d.js','src/home3d.js','src/data/encounters.js','src/encounter3d.js','src/phone3d.js','src/msg3d.js','src/data/shop_enc.js','src/shopenc3d.js'];
let loadErr=null;
for(const f of files){ const p=path.join(ROOT,f); if(!fs.existsSync(p)){ loadErr=f; continue; }
  vm.runInThisContext(fs.readFileSync(p,'utf8').replace(/^const (CALENDAR|CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|OUT|HOME|ENCOUNTERS|ENC|PHONE|MSG|SHOP_ENC|SHOPENC)\s*=/mg,'global.$1='),{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('1. 有 src/data/shop_enc.js 和 SHOPENC（eligible、decide、enter、after、talk、window、sched、znTalk、keeperLine、hearPick、bindDiners）',!loadErr&&typeof SHOPENC!=='undefined'&&typeof SHOP_ENC!=='undefined'&&['eligible','decide','enter','after','talk','window','sched','znTalk','keeperLine','hearPick','bindDiners'].every(k=>typeof SHOPENC[k]==='function'),loadErr?'缺 '+loadErr:'');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
// ---------- 1. 資料 ----------
const git=(sha,p)=>cp.execFileSync('git',['show',sha+':'+p],{cwd:ROOT}).toString('utf8');
{ const v1=JSON.parse(git('6adb0e47c','docs/story_planning/shop_enc/shop_enc_aa_v1.json')), v2=JSON.parse(git('6adb0e47c','docs/story_planning/shop_enc/shop_enc_aa_v2.json'));
  const strip=r=>{ const o=Object.assign({},r); delete o.weekMax; delete o.selfOnly; return o; };
  check('1. 14 列＝AA_632 九列＋AA_633 五列，每一列（台詞、時段、條件）和白名單上的 JSON 一模一樣',SHOP_ENC.rows.length===14&&JSON.stringify(SHOP_ENC.rows.map(strip))===JSON.stringify(v1.rows.concat(v2.rows)));
  check('1. 新認識的人、店員和 JSON 一樣（宋知寧、阿德）',JSON.stringify(SHOP_ENC.newPeople)===JSON.stringify(v1.newPeople)&&JSON.stringify(SHOP_ENC.shopkeepers)===JSON.stringify(v2.shopkeepers));
  const md=git('22c966e4a','docs/story_planning/AA_640_店裡客人的路人句.md'), j=JSON.parse(md.match(/```json\s*(\{[\s\S]*?\})\s*```/)[1]);
  const H=SHOP_ENC.hear; check('1. 路人句＝AA_640 最後一節的 JSON（吃飯 8 組、小聲 7 句、便利商店 6 句），考試週那一句照稿「（小聲）考完這科就解脫了。」',JSON.stringify(H.dine)===JSON.stringify(j.dine)&&JSON.stringify(H.quiet)===JSON.stringify(j.quiet)&&JSON.stringify(H.cvs)===JSON.stringify(j.cvs)&&H.quietExam==='（小聲）考完這科就解脫了。'&&md.includes('「'+H.quietExam+'」'));
  check('1. 學姊定食：一週最多一次、只有自己走進去（AA_633 表下第一點）',SHOP_ENC.rows.filter(r=>r.weekMax||r.selfOnly).map(r=>r.who+'@'+r.spot).join()==='heroine_05@wz_teishoku');
  const A=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files;
  const ok3=[['docs/story_planning/shop_enc/shop_enc_aa_v1.json','6adb0e47c'],['docs/story_planning/shop_enc/shop_enc_aa_v2.json','6adb0e47c'],['docs/story_planning/AA_640_店裡客人的路人句.md','22c966e4a'],['docs/story_planning/AA_641_店內偶遇_回LAWWW四件.md','6adb0e47c']].every(([p,s])=>A.some(e=>e.path===p&&e.sha===s&&e.status==='approved'&&/AA/.test(e.approvedBy||'')));
  check('1. 劇情匯入白名單四筆（路徑＋commit＋approved＋approvedBy AA；v1、v2 前進到 AA_641 的 6adb0e47c）',ok3);
  /* AA_641 */
  const md41=git('6adb0e47c','docs/story_planning/AA_641_店內偶遇_回LAWWW四件.md'), X=SHOP_ENC.aa641||{};
  const zl=[...md41.slice(md41.indexOf('## 2.'),md41.indexOf('## 3.')).matchAll(/^(\d)\. (.+)$/mg)].map(m=>m[2]);
  check('1. AA_641 第 2 節：宋知寧六則訊息一字不差（照順序）',zl.length===6&&JSON.stringify(X.znMsgs)===JSON.stringify(zl),JSON.stringify(X.znMsgs));
  check('1. AA_641：她只回「哈哈。」或「好。」；一起坐 30 分鐘、旁白「（你們坐了一會兒，各做各的事，偶爾說兩句。）」；第 5 則以後山嵐書店週六 14–17',JSON.stringify(X.znReplies)==='["哈哈。","好。"]'&&X.joinH===0.5&&X.joinLine==='（你們坐了一會兒，各做各的事，偶爾說兩句。）'&&md41.includes('「'+X.joinLine+'」')&&!!X.znMove&&X.znMove.after===5&&X.znMove.spot==='shanlan'&&JSON.stringify(X.znMove.days)==='[6]'&&X.znMove.from===14&&X.znMove.to===17,JSON.stringify(X));
  const ps=SHOP_ENC.rows.filter(r=>r.who==='classmate_peishan'), ice=ps.find(r=>r.spot==='wz_ice'), tea=ps.find(r=>r.spot==='wz_tea');
  check('1. AA_641 第 1 節：沛珊每一列都沒有 Y2S2（一盞茶屋 Y1S1～Y2S1）；冰菓室週五 18:30～20:30、5、6、9 月、Y1S2、Y2S1',ps.length>=2&&ps.every(r=>!(r.terms||[]).includes('Y2S2'))&&tea.terms.join()==='Y1S1,Y1S2,Y2S1'&&ice.days.join()==='5'&&ice.from===18.5&&ice.to===20.5&&ice.months.join()==='5,6,9'&&ice.terms.join()==='Y1S2,Y2S1');
  check('1. AA_641 第 3 節：以安 Café 的旁白「她坐在沙發那一區，手帳攤開，旁邊一杯冷掉的拿鐵。」',SHOP_ENC.rows.find(r=>r.who==='heroine_01'&&r.spot==='cafe').why==='她坐在沙發那一區，手帳攤開，旁邊一杯冷掉的拿鐵。');
  let chk=''; try{ chk=cp.execFileSync('python3',['tools/shop_enc/import_shop_enc.py','--check'],{cwd:ROOT}).toString(); }catch(e){ chk='FAIL '+(e.stdout||''); }
  check('1. 匯入工具 --check：src/data/shop_enc.js 和白名單上的版本一致',/一致/.test(chk)&&!/不一致/.test(chk),chk.trim()); }
// ---------- 環境 ----------
const mk=(day,hour,o)=>{ const G=Object.assign({day,hour,weekday:CALENDAR.dateOf(day).wd%7,zone:'cafe',flags:{afternoonDone:true,YT_MET_JOB:true},social:{mem:{}},courses:{},invites:[],money:5000,weather:'clear',stage:'law',daily:{}},o||{}); GG=G; return G; };
const termDayWd=(tid,w,wd)=>{ const d=STORY.termDay(tid,w,wd===0?7:wd); return d; };   /* STORY.termDay：星期 1～7 */
const mkGM=(G,ans)=>{ const q=(ans||[]).slice(); const L={says:[],menus:[],opts:[],fade:[]}; return {G,L,E:{player:{obj:{position:{x:0,z:0}}},npcs:[],zone:{seats:[]},interactables:[]},D:{active:false},sceneBegin(){},sceneEnd(){},face(){},cine(){},autosave(){},toast(t){ L.says.push('[toast]'+t); },
  fade:async on=>{ L.fade.push(on); }, advance:h=>{ G.hour+=h; }, sitAt(){}, standUp(){},
  say:async(w,t)=>{ L.says.push((w?(w.name||w)+'：':'')+t); }, choose:async o=>{ L.menus.push(o.map(x=>x.t)); L.opts.push(o); if(!q.length) return o.length-1; const a=q.shift(); return typeof a==='string'?o.findIndex(x=>x.t===a):a; } }; };
/* 每一列找一個「在時段裡、作息沒有別的地方」的日子（大一上～大二下第 2～7 週；冰菓室 5、6、9 月） */
const findSlot=(row,o)=>{ o=o||{}; const terms=row.terms||['Y1S1']; for(const tid of terms){ for(let w=1;w<=15;w++){ for(const wd of row.days){ const d=termDayWd(tid,w,wd); if(d==null) continue; const T=CALENDAR.termOf(d); if(!T||T.exam) continue; if(row.weeks&&Array.isArray(row.weeks)&&!row.weeks.includes(T.week)) continue; if(row.months&&!row.months.includes(CALENDAR.dateOf(d).m)) continue;
      for(let h=row.from;h<row.to;h+=0.25){ const G=mk(d,h); if(o.tier) o.tier(G); const why=[]; if(SHOPENC.eligible(G,row,why)) return G; } } } } return null; };
// ---------- 2. 每一列在自己的時段 ----------
/* 沛珊冰菓室：原本 5、6、9 月的週六（她回台中、在迪化街），一次都碰不到；AA_641 改週五 18:30～20:30——每一列都要碰得到 */
const KNOWN_DEAD=[];
{ const miss=[], notOut=[]; for(const row of SHOP_ENC.rows){ const G=findSlot(row); if(!G){ if(!KNOWN_DEAD.includes(row.who+'@'+row.spot)) miss.push(row.who+'@'+row.spot); continue; }
    const G2=mk(G.day,row.to+0.01); if(SHOPENC.eligible(G2,row)) notOut.push(row.who+'@'+row.spot+' '+row.to);
    const G3=mk(G.day,row.from-0.01); if(SHOPENC.eligible(G3,row)) notOut.push(row.who+'@'+row.spot+' '+row.from); }
  check('2. 每一列都找得到一個會出現的時段（作息沒有別的地方、presence 在台北；包括沛珊冰菓室）',!miss.length,miss.join('、'));
  check('2. 沒有碰不到的列（AA_641 以前沛珊冰菓室碰不到）',SHOP_ENC.rows.filter(r=>!findSlot(r)).map(r=>r.who+'@'+r.spot).join()==='',SHOP_ENC.rows.filter(r=>!findSlot(r)).map(r=>r.who+'@'+r.spot).join());
  check('2. 時段以外（from 前一分鐘、to 以後）不出現',!notOut.length,notOut.join('、'));
  const r=SHOP_ENC.rows.find(q=>q.who==='heroine_01'&&q.spot==='cafe');
  check('2. 台詞照關係分層：以安認識／朋友／交往中各兩句；阿凱不分（all）',SHOPENC.linesFor(r,'acq')[0]==='……你也來這裡。'&&SHOPENC.linesFor(r,'friend')[0]==='你來得剛好。這一題我想聽別人的說法。'&&SHOPENC.linesFor(r,'dating')[1]==='坐。這杯拿鐵冷了，等一下再點一杯。'&&SHOPENC.linesFor(SHOP_ENC.rows.find(q=>q.who==='kai'),'friend')[0]==='……室友。你也餓喔。');
  const p=SHOP_ENC.rows.find(q=>q.spot==='wz_print'); const Gp=findSlot(p); check('2. 柏翰影印店只在第 7、8、15、16 週',!!Gp&&[7,8,15,16].includes(CALENDAR.termOf(Gp.day).week));
  const ic=SHOP_ENC.rows.find(q=>q.spot==='wz_ice'); const Gi=findSlot(ic);   /* 真的資料（presence、作息都不改）*/
  check('2. 冰菓室沛珊真的遇得到：5、6、9 月的週五 18:30～20:30（作息、presence 不衝突）',!!Gi&&[5,6,9].includes(CALENDAR.dateOf(Gi.day).m)&&Gi.weekday===5&&Gi.hour>=18.5&&Gi.hour<20.5&&STORY.presence('classmate_peishan',Gi).here!==false,Gi?CALENDAR.dateOf(Gi.day).key+' '+Gi.hour:'找不到');
  { const hit=[]; for(const tid of ['Y1S2','Y2S1']) for(let w=1;w<=15;w++){ const d=STORY.termDay(tid,w,5); if(d==null||!CALENDAR.termOf(d)||CALENDAR.termOf(d).exam||![5,6,9].includes(CALENDAR.dateOf(d).m)) continue; if(SHOPENC.eligible(mk(d,19),ic)) hit.push(CALENDAR.dateOf(d).key); }
    check('2. 大一下 5、6 月、大二上 9 月的週五晚上都遇得到（'+hit.length+' 個週五）',hit.some(k=>/^2026-0[56]/.test(k))&&hit.some(k=>/^2026-09/.test(k)),hit.join()); }
  { const w=[], d=STORY.dayOfKey('2026-09-18'); check('2. 2026-09-18（週五 19:00，大二上）：遇得到',!!SHOPENC.eligible(mk(d,19),ic,w),w.join()); }
  const d10=(()=>{ const d0=Gi?Gi.day:STORY.dayOfKey("2026-06-01"); for(let d=d0;d<d0+200;d++){ if(CALENDAR.dateOf(d).m===10&&CALENDAR.dateOf(d).wd%7===5&&CALENDAR.termOf(d)) return d; } })(); check('2. 10 月的週五冰菓室沒有沛珊',!SHOPENC.eligible(mk(d10,19),ic));
  { const sat=(Gi?Gi.day:STORY.dayOfKey("2026-06-05"))+1; check('2. 週六（原本的時間）沒有沛珊',!SHOPENC.eligible(mk(sat,15.5),ic)); }
  check('2. 大二下沒有沛珊（Y2S2 拿掉；她 12/18 起重考不在臺北）',!SHOPENC.eligible(mk(STORY.termDay('Y2S2',10,5),19),ic)&&!SHOPENC.eligible(mk(STORY.termDay('Y2S2',5,3),21.5),SHOP_ENC.rows.find(q=>q.who==='classmate_peishan'&&q.spot==='wz_tea'))); }
// ---------- 3. 不會遇到 ----------
const rowOf=(who,spot)=>SHOP_ENC.rows.find(r=>r.who===who&&r.spot===spot);
{ const bh=rowOf('classmate_bohan','cafe'), G=findSlot(bh); const why=[];
  const T=CALENDAR.termOf(G.day); const exD=STORY.termDay(T.id,16,3); const Ge=mk(exD,19.5); SHOPENC.eligible(Ge,bh,why); check('3. 考試週（第 16 週）Café 不擋（讀書的人；擋下來的原因不是考試週）',!why.some(w=>/考試週/.test(w)),why.join());
  { const kai=rowOf('kai','cvs'), w2=[]; SHOPENC.eligible(mk(STORY.termDay('Y1S1',16,2),23.5),kai,w2); check('3. 考試週便利商店照樣有阿凱（宵夜）',!!SHOPENC.eligible(mk(STORY.termDay('Y1S1',16,2),23.5),kai),w2.join()); }
  const mx=rowOf('classmate_mingxuan','bookstore'), Gm=findSlot(mx); const exM=mk(STORY.termDay(CALENDAR.termOf(Gm.day).id,16,6),12); check('3. 考試週書店沒有明軒',!SHOPENC.eligible(exM,mx));
  const mid=mk(STORY.termDay(CALENDAR.termOf(Gm.day).id,8,6),12); check('3. 期中週（第 8 週）書店也沒有',!SHOPENC.eligible(mid,mx));
  const pr=rowOf('classmate_bohan','wz_print'), Gpr=findSlot(pr); const prE=mk(STORY.termDay(CALENDAR.termOf(Gpr.day).id,16,CALENDAR.dateOf(Gpr.day).wd||7),Gpr.hour); check('3. 影印店 examOK：期末週照樣有柏翰',!!SHOPENC.eligible(prE,pr));
  const Gd=mk(G.day,G.hour); OUT.rec(Gd).push({id:'x',who:'classmate_bohan',day:G.day,h:10,state:'planned'}); check('3. 那天和他有約（OUT）不出現',!SHOPENC.eligible(Gd,bh));
  const Gv=mk(G.day,G.hour); Gv.invites.push({who:'classmate_bohan',day:G.day,accepted:true,done:false,h:21,zone:'library'}); check('3. 那天約好了（invites）不出現',!SHOPENC.eligible(Gv,bh));
  STAGE.classmate_bohan='STRANGER'; check('3. 還不認識不出現',!SHOPENC.eligible(mk(G.day,G.hour),bh)); delete STAGE.classmate_bohan;
  const an=rowOf('heroine_01','cafe'); const Gj=mk(STORY.termDay('Y3S2',5,6),15); check('3. 大三下以安在日本：Café 沒有她（terms 也沒有 Y3S2）',!SHOPENC.eligible(Gj,an));
  const Ga=findSlot(an); check('3. 以安在台北的學期週末下午會在 Café（找得到）',!!Ga);
  const Gx=mk(Ga.day,Ga.hour); Gx.daily.encMet={day:Ga.day,who:['heroine_01']}; check('3. 今天自由出行已經遇過她（ENC encMet）：不出現',!SHOPENC.eligible(Gx,an));
  const si=rowOf('heroine_05','wz_teishoku'), Gs=findSlot(si); const Gs2=mk(Gs.day,Gs.hour,{flags:{afternoonDone:true,YT_MET_JOB:true,companion:'an'}}); check('3. 學姊定食：有人跟著你不排（只有自己走進去）',!SHOPENC.eligible(Gs2,si));
  const Gs3=mk(Gs.day,Gs.hour); Gs3.invites.push({who:'heroine_01',day:Gs.day,accepted:true,done:false,zone:'wz_teishoku'}); check('3. 學姊定食：今天約好在定食店（和別人）不排',!SHOPENC.eligible(Gs3,si));
  const Gs4=mk(Gs.day,Gs.hour); SHOPENC.mark(Gs4,si); const nd=(()=>{ for(let d=Gs.day+1;d<Gs.day+5;d++) if(si.days.includes(CALENDAR.dateOf(d).wd%7)&&CALENDAR.termOf(d)&&CALENDAR.termOf(d).week===CALENDAR.termOf(Gs.day).week) return d; })();
  const Gs5=mk(nd,Gs.hour,{daily:Gs4.daily}); check('3. 學姊定食一週最多一次：同一週隔天不出現',nd!=null&&!SHOPENC.eligible(Gs5,si),nd);
  const nw=Gs.day+7; const Gs6=mk(nw,Gs.hour,{daily:Gs4.daily}); check('3. 下一週又可以',!!SHOPENC.eligible(Gs6,si)||!!findSlot(si),'');
  /* 作息在別的地方：讓她這個時段在總圖（作息的一筆） */
  const Gb=mk(G.day,G.hour); const c=CHARACTERS.classmate_bohan, ent={days:[Gb.weekday],from:Gb.hour-0.5,to:Gb.hour+1,zone:'library',act:'read',terms:null}; c.daily_schedule.unshift(ent); check('3. 作息說他這一個半小時在總圖：不會同時在 Café',!SHOPENC.eligible(Gb,bh)); c.daily_schedule.shift();
  const kai=rowOf('kai','cvs'), Gk=mk(STORY.termDay('Y1S1',5,2),23.5); const be=SHOPENC.baseSched(CHARACTERS.kai,Gk); check('3. 整段的背景作息（阿凱大一 18:00～08:00 在 203 書桌）可以換成店裡的一小時（不是約好的事）',!!be&&be.zone==='dorm'&&SHOPENC.soft(CHARACTERS.kai,be)&&!!SHOPENC.eligible(Gk,kai));
  const ent2={days:[Gk.weekday],from:23,to:24.5,zone:'dorm',act:'class',terms:null}; CHARACTERS.kai.daily_schedule.unshift(ent2); check('3. 上課、短的作息不換',!SHOPENC.eligible(Gk,kai)); CHARACTERS.kai.daily_schedule.shift(); }
// ---------- 4. 擲一次就固定、同一店同一時段最多一位 ----------
{ const an=rowOf('heroine_01','cafe'); let n=0, tot=0, same=true; const days=[];
  for(const tid of ['Y1S1','Y1S2','Y2S1','Y2S2']) for(let w=1;w<=15;w++) for(const wd of [6,7]){ const d=STORY.termDay(tid,w,wd); if(d==null||!CALENDAR.termOf(d)||CALENDAR.termOf(d).exam) continue; const G=mk(d,15); if(!SHOPENC.eligible(G,an)) continue; tot++; const a=SHOPENC.decide(G,'cafe'); const b=SHOPENC.decide(G,'cafe'); if(a!==b) same=false; if(a&&a.who) n++; const G2=mk(d,15.5); if((SHOPENC.decide(G2,'cafe')||{}).who!==(a||{}).who) same=false; }
  check('4. 同一天同一時段決定一次（再進來一樣、新的 G 照種子也一樣）',same);
  check('4. 有人符合的時候約六成會遇到（'+n+'/'+tot+'）',tot>=30&&n/tot>0.4&&n/tot<0.8);
  const R=SHOPENC.rec(mk(STORY.termDay('Y1S1',5,1),19.5)); const G=GG; STAGE.classmate_bohan='FRIEND'; const d=SHOPENC.decide(G,'cafe'); check('4. 一個時段一家店只有一位（dec 只有一個 who）',!d||typeof d.who==='string'||d.who===null); delete STAGE.classmate_bohan; }
// ---------- 5. 走過去 ----------
(async()=>{
  const an=rowOf('heroine_01','cafe'), Ga=findSlot(an);
  { const G=mk(Ga.day,Ga.hour); ACTS.length=0; const gm=mkGM(G,['打招呼']); const r=await SHOPENC.meet(gm,an,ENC.tier(G,'heroine_01'));
    check('5. 打招呼：先 why，再認識的兩句；熟悉 +1（shopHi）；留 SHOP_CAFE_AN；選項只有打招呼、不打擾（認識＝不能一起坐）',r==='greet'&&gm.L.says[0]===an.why&&gm.L.says.includes('沈以安：……你也來這裡。')&&ACTS.join()==='heroine_01:shopHi'&&SOCIAL.has('heroine_01','SHOP_CAFE_AN')&&gm.L.menus[0].join()==='打招呼,不打擾',JSON.stringify(gm.L));
    check('5. shopHi＝熟悉 +1（加進 SOCIAL.ACT）',JSON.stringify(SOCIAL.ACT.shopHi)==='{"fam":1}');
    check('5. 同一天同一個人不會再遇到',!SHOPENC.eligible(mk(Ga.day,Ga.hour,{daily:G.daily}),an)); }
  { STAGE.heroine_01='FRIEND'; const G=mk(Ga.day,Ga.hour); ACTS.length=0; const gm=mkGM(G,['一起坐']); const r=await SHOPENC.meet(gm,an,ENC.tier(G,'heroine_01'));
    check('5. 朋友以上：多「一起坐」（打招呼、一起坐、不打擾）；一起坐＝AA_124 1-2（cafe：熟悉 +3、信任 +1、自在 +2）；朋友那兩句',r==='join'&&gm.L.menus[0].join()==='打招呼,一起坐,不打擾'&&ACTS.join()==='heroine_01:cafe'&&gm.L.says.includes('沈以安：先點東西。我等你。'),JSON.stringify(gm.L));
    const G2=mk(Ga.day,Ga.hour); ACTS.length=0; const gm2=mkGM(G2,['不打擾']); const r2=await SHOPENC.meet(gm2,an,ENC.tier(G2,'heroine_01')); check('5. 不打擾：只有 why，沒有台詞、沒有數值、沒有記憶',r2==='pass'&&gm2.L.says.length===1&&ACTS.length===0&&!(G2.social.mem.heroine_01||[]).length);
    G2.flags.dating_heroine_01=true; const gm3=mkGM(G2,['打招呼']); await SHOPENC.meet(gm3,an,ENC.tier(G2,'heroine_01')); check('5. 交往中：dating 那兩句（不加戀愛：只有 shopHi）',gm3.L.says.includes('沈以安：……你怎麼知道我在這。')&&ACTS.join()==='heroine_01:shopHi'); delete STAGE.heroine_01; }
  { const kai=rowOf('kai','cvs'), G=mk(STORY.termDay('Y1S1',5,2),23.5); STAGE.kai='FRIEND'; const gm=mkGM(G,['打招呼']); await SHOPENC.meet(gm,kai,ENC.tier(G,'kai')); check('5. 阿凱 join:false：朋友也沒有一起坐',gm.L.menus[0].join()==='打招呼,不打擾'); delete STAGE.kai;
    const zhe=rowOf('zhe','wz_brunch'), G2=mk(STORY.termDay('Y1S1',5,7),11); STAGE.zhe='ACQUAINTANCE'; G2.flags.ZHE_CALLS_GE=true; const gm2=mkGM(G2,['一起坐']); await SHOPENC.meet(gm2,zhe,ENC.tier(G2,'zhe')); check('5. 阿哲 join:true：認識就可以一起坐',gm2.L.menus[0].join()==='打招呼,一起坐,不打擾'); delete STAGE.zhe;
    STAGE.zhe='FRIEND'; const G3=mk(G2.day,11); const gm3=mkGM(G3,['打招呼']); await SHOPENC.meet(gm3,zhe,ENC.tier(G3,'zhe')); check('5. 阿哲沒叫「哥」的玩家：「哥！」拿掉（ENC.zheGe）',gm3.L.says.some(s=>s==='阿哲：坐，這份給你，我點太多了。'),JSON.stringify(gm3.L.says)); delete STAGE.zhe; }
  { const zq=rowOf('heroine_04','cvs'), G=mk(STORY.termDay('Y1S1',5,2),22.5); G.flags.EX_heroine_04=true; G.flags.ROMANCE_HISTORY=[{id:'heroine_04',from:'Y1S1W1',to:'Y1S1W3',how:'apart_drift'}]; ACTS.length=0;
    const gm=mkGM(G,['打招呼']); const r=await SHOPENC.meet(gm,zq,ENC.tier(G,'heroine_04')); check('5. 前任（子晴 apart_drift）：點頭／走過去／打招呼，打招呼＝ex 那一句，不加數值',r==='ex'&&gm.L.menus[0].join()==='點頭,走過去,打招呼'&&gm.L.says.includes('高子晴：欸不是……好久不見。我先走了。')&&!ACTS.length,JSON.stringify(gm.L));
    const bh=rowOf('classmate_bohan','cafe'), G2=mk(STORY.termDay('Y1S1',5,1),19.5); G2.flags.EX_classmate_bohan=true; const gm2=mkGM(G2,['打招呼']); await SHOPENC.meet(gm2,bh,ENC.tier(G2,'classmate_bohan')); check('5. 沒有寫前任台詞的：ENCOUNTERS.NOD 那一句旁白',gm2.L.says[1]===ENCOUNTERS.NOD); }
  // ---------- 6. 作息 ----------
  { const bh=rowOf('classmate_bohan','cafe'), G=findSlot(bh); const c=CHARACTERS.classmate_bohan; check('6. 決定以前：柏翰沒有作息（不在任何地方）',STORY.schedEnt(c,G)===null);
    const R=SHOPENC.rec(G); R.dec[SHOPENC.key(G,'cafe')]={who:'classmate_bohan',spot:'cafe',place:{seat:{x:1,z:2,lv:0}}}; R.who.classmate_bohan=SHOPENC.key(G,'cafe');
    const e=STORY.schedEnt(c,G); check('6. 決定以後：作息是 Café（read、seatAt 預約的位子；別的區域不生他）',!!e&&e.zone==='cafe'&&e.act==='read'&&e.seatAt[0]===1&&e.seatAt[1]===2,JSON.stringify(e));
    G.hour=bh.to; check('6. row.to 以後：作息又是空的',STORY.schedEnt(c,G)===null); G.hour=bh.from+0.5;
    const ent={days:[G.weekday],from:G.hour+0.25,to:24,zone:'library',act:'read'}; c.daily_schedule.unshift(ent); G.hour+=0.5; const e2=STORY.schedEnt(c,G); check('6. 他原本的作息開始了：照原本的（總圖），不會兩個地方',!!e2&&e2.zone==='library'); c.daily_schedule.shift();
    { const Gk=mk(STORY.termDay('Y1S1',5,2),23.5), Rk=SHOPENC.rec(Gk), kk=SHOPENC.key(Gk,'cvs'); Rk.dec[kk]={who:'kai',spot:'cvs',place:{stand:[1,2,0]}}; Rk.who.kai=kk; const ek=STORY.schedEnt(CHARACTERS.kai,Gk);
      check('6. 阿凱決定在便利商店：作息換成便利商店（站著 linger），203 就不生他（不會同時兩個地方）',!!ek&&ek.zone==='cvs'&&ek.act==='linger'&&ek.at[0]===1,JSON.stringify(ek)); Gk.hour=25.2; const ek2=STORY.schedEnt(CHARACTERS.kai,Gk); check('6. 01:00 以後回到 203 的書桌',!!ek2&&ek2.zone==='dorm'); }
    const ps=rowOf('classmate_peishan','wz_tea'), Gt=findSlot(ps); const Rt=SHOPENC.rec(Gt); Rt.dec[SHOPENC.key(Gt,'wz_tea')]={who:'classmate_peishan',spot:'wz_tea'}; const et=STORY.schedEnt(CHARACTERS.classmate_peishan,Gt);
    check('6. 外帶窗口：她在外面（zone null、away「在巷口茶飲」）',!!et&&et.zone===null&&et.act==='out'&&et.away==='在巷口茶飲',JSON.stringify(et)); }
  // ---------- 窗口 ----------
  { const ps=rowOf('classmate_peishan','wz_tea'), Gt=findSlot(ps); let got=null; for(let k=0;k<40&&!got;k++){ const G=mk(Gt.day+7*k,Gt.hour); if(!SHOPENC.eligible(G,ps)) continue; const d=SHOPENC.decide(G,'wz_tea'); if(d&&d.who==='classmate_peishan') got=G; }
    const gm=mkGM(got,['打招呼']); const r=await SHOPENC.window(gm,'wz_tea'); check('窗口：巷口茶飲前遇到沛珊（why、兩句）；再按一次不再遇到',r==='greet'&&gm.L.says[0]===ps.why&&(await SHOPENC.window(mkGM(got),'wz_tea'))===null,JSON.stringify(gm.L.says));
    EVENTS.running=true; const G9=mk(Gt.day+7*45,Gt.hour); check('3. 劇情演出中不排（不決定）',SHOPENC.enter({G:G9,E:{zone:{seats:[]}},D:{active:false}},'cafe')===null&&(await SHOPENC.window(mkGM(G9),'wz_tea'))===null); EVENTS.running=false; }
  // ---------- 7. 宋知寧 ----------
  { const P=SHOP_ENC.newPeople[0]; const d=STORY.termDay('Y1S1',5,6); const G=mk(d,15); const z=SHOPENC.znEligible(G,'bookstore'); check('7. 宋知寧：舊路書房週六 14～17、大一大二',!!z&&!SHOPENC.znEligible(mk(d,17.1),'bookstore')&&!SHOPENC.znEligible(mk(STORY.termDay('Y3S1',5,6),15),'bookstore')&&!SHOPENC.znEligible(mk(STORY.termDay('Y1S1',16,6),15),'bookstore'));
    const n={obj:{position:{x:0,z:0}},talk:()=>{}}; const gm=mkGM(G,['「一起看？」']); await SHOPENC.znTalk(gm,n);
    check('7. 第一次：why、她兩句、兩個選項；「一起看？」→「……好。」＋旁白；記 SHOP_ZN_MET；按鈕變「和知寧說話」以後一天一次',G.flags.SHOP_ZN_MET===true&&gm.L.says[0]===P.first.why&&gm.L.menus[0].join()==='「妳先看。」,「一起看？」'&&gm.L.says.includes('看書的女生：……好。')&&gm.L.says.includes(P.first.choices[1][1][1])&&n.talk===null,JSON.stringify(gm.L));
    const G2=mk(d+1,15,{flags:{SHOP_ZN_MET:true}}); const gm0=mkGM(G2,['「妳先看。」']); check('7. 「妳先看。」也認識（另一個存檔）',(await SHOPENC.znTalk(gm0,{obj:{position:{x:0,z:0}}}),G2.flags.SHOP_ZN_MET===true));
    const G3=mk(d+7,15,{flags:G.flags}); const gm3=mkGM(G3); await SHOPENC.znTalk(gm3,{obj:{position:{x:0,z:0}}}); check('7. 第二次：之後的第一組三句之一＋加聯絡人那一句、SHOP_ZN_CONTACT',gm3.L.says.includes('知寧：……又是你。')&&gm3.L.says.includes(P.contact.line)&&G.flags.SHOP_ZN_CONTACT===true,JSON.stringify(gm3.L.says));
    const G4=mk(d+14,15,{flags:G.flags}); const gm4=mkGM(G4); await SHOPENC.znTalk(gm4,{obj:{position:{x:0,z:0}}}); check('7. 第三次：下一組（輪流），聯絡人只加一次',gm4.L.says.includes('知寧：你上次買的那本，筆記看完了嗎？')&&!gm4.L.says.includes(P.contact.line),JSON.stringify(gm4.L.says)); }
  // ---------- 8. 阿德 ----------
  { const G=mk(STORY.termDay('Y1S1',5,2),15), Ge=mk(STORY.termDay('Y1S1',16,2),15); let a=0, b=0; const seen=new Set(); let rep=false, last=null;
    for(let i=0;i<400;i++){ const q=SHOPENC.keeperLine(G,'wz_print'); if(q){ a++; const k=q.lines.join(); if(k===last) rep=true; last=k; seen.add(k); } if(SHOPENC.keeperLine(Ge,'wz_print')) b++; }
    check('8. 阿德：平常大約四次一次、考試週比較多（'+a+'／'+b+'，400 次）；四句都會出現；不連續同一句',a>50&&a<170&&b>a*1.6&&seen.size===4&&!rep);
    check('8. 別的店沒有店員句',SHOPENC.keeperLine(G,'cafe',0)===null); }
  // ---------- 9. 路人句 ----------
  { const d=STORY.termDay('Y1S1',5,2); const G=mk(d,12); const P=SHOPENC.pool(G,'quiet_cafe').map(q=>q.lines[0][1]), B=SHOPENC.pool(G,'quiet_book').map(q=>q.lines[0][1]), Q=SHOP_ENC.hear.quiet;
    check('9. Café 第 2～5、7 句；書店第 1～6 句；全部「（小聲）」；平常沒有考試週那句',P.join('|')===[Q[1],Q[2],Q[3],Q[4],Q[6]].join('|')&&B.join('|')===Q.slice(0,6).join('|')&&P.concat(B).every(t=>t.startsWith('（小聲）')));
    const Ge=mk(STORY.termDay('Y1S1',16,2),12); check('9. 考試週：Café、書店多「（小聲）考完這科就解脫了。」',SHOPENC.pool(Ge,'quiet_cafe').some(q=>q.lines[0][1]==='（小聲）考完這科就解脫了。')&&SHOPENC.pool(Ge,'quiet_book').some(q=>q.lines[0][1]==='（小聲）考完這科就解脫了。'));
    const a=SHOPENC.hearPick(G,'quiet_cafe','c1'), a2=SHOPENC.hearPick(G,'quiet_cafe','c1'); check('9. 同一位客人一天同一句',a===a2&&!!a);
    const got=[a.i]; for(let k=2;k<=5;k++){ const q=SHOPENC.hearPick(G,'quiet_cafe','c'+k); got.push(q&&q.i); }
    check('9. 五位客人五句都不一樣；第六位沒有句子（用完）',new Set(got).size===5&&got.every(x=>x!=null)&&SHOPENC.hearPick(G,'quiet_cafe','c6')===null,JSON.stringify(got));
    const Gn=mk(d+1,12,{daily:G.daily}); check('9. 隔天重來',!!SHOPENC.hearPick(Gn,'quiet_cafe','c6'));
    const dn=SHOPENC.pool(G,'dine'); check('9. 吃飯的店兩人一桌 8 組（A／B；第 7 組三句）',dn.length===8&&dn[6].lines.map(x=>x[0]).join('')==='ABA');
    check('9. 哪一種客人講哪一池：吃飯的店只有兩個人一桌的、便利商店只有結帳的、茶屋、影印店不講',SHOPENC.kindPool('meal','face',2)==='dine'&&SHOPENC.kindPool('meal','face',1)===null&&SHOPENC.kindPool('brunch','side',2)==='dine'&&SHOPENC.kindPool('cvs','pay',1)==='cvs'&&SHOPENC.kindPool('cvs','stand',1)===null&&SHOPENC.kindPool('book','stand',1)==='quiet_book'&&SHOPENC.kindPool('cafe','one',1)==='quiet_cafe'&&SHOPENC.kindPool('tea','face',2)===null&&SHOPENC.kindPool('print','stand',1)===null);
    const nA={obj:{position:{x:0,z:0}}}, nB={obj:{position:{x:1,z:0}}}; const gm=mkGM(G); const ok=await SHOPENC.hear(gm,[nA,nB],'dine','t1');
    const pk=SHOPENC.hearPick(G,'dine','t1'); check('9. 點了一桌：兩個人照 A／B 講完那一組（說話的人寫「路人」）',ok&&gm.L.says.length===pk.lines.length&&gm.L.says.every((s,i)=>s==='路人：'+pk.lines[i][1]),JSON.stringify(gm.L.says)); }
  // ---------- 10. 接線 ----------
  { const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), wz=fs.readFileSync(path.join(ROOT,'src/wzshops3d.js'),'utf8'), cr=fs.readFileSync(path.join(ROOT,'src/crowd3d.js'),'utf8'), ix=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
    const pop=st.slice(st.indexOf('S.populate=function'),st.indexOf('// ---------- 資料驅動的 NPC 日程'));
    check('10. populate：一開始 SHOPENC.enter（在 Café 客人、CROWD.enter、populateSchedule 之前）、最後 SHOPENC.after',pop.indexOf('SHOPENC.enter(GM,zoneId)')>=0&&pop.indexOf('SHOPENC.enter(GM,zoneId)')<pop.indexOf('S.cafeCustomers(G,seats)')&&pop.indexOf('SHOPENC.enter(GM,zoneId)')<pop.indexOf('CROWD.enter(GM,zoneId)')&&pop.indexOf('SHOPENC.after(GM,zoneId)')>pop.indexOf('populateSchedule(zoneId,GM)'));
    const tc=st.slice(st.indexOf('S.talkCharacter=async function'),st.indexOf('S.talkCharacter=async function')+6000); check('10. talkCharacter：先問 SHOPENC.pending（約好的時間之後、一般閒聊之前）',tc.indexOf('SHOPENC.pending(G,id)')>tc.indexOf('INV.meetable')&&tc.indexOf('SHOPENC.pending(G,id)')<tc.indexOf('GM.sceneBegin({adv:id})'));
    check('10. 窗口（order364 的外帶）與影印店的阿德',/!D\.dine&&typeof SHOPENC!=='undefined'&&SHOPENC\.window/.test(wz)&&/SHOPENC\.keeperLine\(G,'wz_print'\)/.test(wz));
    check('10. crowd3d：店裡一組客人生好叫 SHOPENC.bindDiners；站的地方預約（shopStandTake／shopStandReserved）',/SHOPENC\.bindDiners\(GM,spot,npcs,slot\)/.test(cr)&&/S\.shopStandTake=function/.test(cr)&&/S\.shopStandReserved\(def\.zone,x,z,G\)/.test(cr));
    check('10. Café 的客人（進來時、待在店裡補人）也接 SHOPENC.bindCafe',(st.match(/SHOPENC\.bindCafe\(GM,/g)||[]).length===2);
    check('10. index.html：shop_enc.js、shopenc3d.js 在 crowd3d.js 之後',ix.indexOf('src/data/shop_enc.js')>ix.indexOf('src/crowd3d.js')&&ix.indexOf('src/shopenc3d.js')>ix.indexOf('src/data/shop_enc.js'));
    check('10. SCHED_X 有登記（STORY.SCHED_X 裡有 SHOPENC.sched）',STORY.SCHED_X.includes(SHOPENC.sched));
    const ev=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8'); check('10. 劇情事件不讀 SHOP_ 記憶（R7）',ev.slice(0,ev.indexOf('const SMALLTALK')).indexOf("'SHOP_")<0); }
  // ---------- 11. 宋知寧的訊息（AA_641 第 2 節）----------
  { const X=SHOP_ENC.aa641, ZN='npc_songzn', d0=STORY.termDay('Y1S1',3,6), dEnd=STORY.dayOfKey('2027-08-31');
    const run=(o)=>{ const G=mk(d0,9,{flags:Object.assign({afternoonDone:true,SHOP_ZN_MET:true},o&&o.contact===false?{}:{SHOP_ZN_CONTACT:true})}); for(let d=d0;d<=dEnd;d++){ G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.daily={}; G.hour=9; SHOPENC.znPhone(G); G.hour=23.5; PHONE.tick(G); } return G; };
    const G0=run({contact:false}); check('11. 沒加聯絡人：一則都不發',!(G0.msgs||[]).some(m=>m.th==='p:'+ZN)&&!(PHONE.rec(G0).q.length));
    const G=run(), M=G.msgs.filter(m=>m.th==='p:'+ZN), txt=M.map(m=>m.text);
    check('11. 山嵐書店還沒開（沒有這個區域）：照順序 1、2、3、4、6，第 5 則跳過',JSON.stringify(txt)===JSON.stringify([0,1,2,3,5].map(i=>X.znMsgs[i])),JSON.stringify(txt));
    const per={}; for(const m of M){ const T=CALENDAR.termOf(m.day); const k=T?T.id:'none'; per[k]=(per[k]||0)+1; }
    check('11. 每學期最多兩則、都在學期中（寒暑假不發）',Object.keys(per).every(k=>k!=='none'&&per[k]<=2),JSON.stringify(per));
    check('11. 都是平日（週一～週五）21:00 左右（21:00～21:30）、不在考試週',M.every(m=>{ const wd=CALENDAR.dateOf(m.day).wd%7, T=CALENDAR.termOf(m.day); return wd>=1&&wd<=5&&m.h>=21&&m.h<21.5&&T&&!T.exam; }),JSON.stringify(M.map(m=>CALENDAR.dateOf(m.day).key+' '+m.h)));
    check('11. 一天最多一則；寄件人是她、對話串名字「知寧」',new Set(M.map(m=>m.day)).size===M.length&&M.every(m=>m.from===ZN)&&PHONE.title(G,'p:'+ZN)==='知寧',PHONE.title(G,'p:'+ZN));
    check('11. 沒有山嵐書店：週六照舊在舊路書房',!!SHOPENC.znEligible(mk(STORY.termDay('Y2S1',5,6),15,{flags:G.flags}),'bookstore'));
    global.Z3={ZONES:{shanlan:{name:'山嵐書店'}}};
    const G2=run(), M2=G2.msgs.filter(m=>m.th==='p:'+ZN);
    check('11. 山嵐書店開了：六則照順序',JSON.stringify(M2.map(m=>m.text))===JSON.stringify(X.znMsgs),JSON.stringify(M2.map(m=>m.text)));
    const d5=(M2[4]||{}).day; const satA=(()=>{ for(let d=d5+1;d<d5+60;d++){ const T=CALENDAR.termOf(d); if(CALENDAR.dateOf(d).wd%7===6&&T&&!T.exam) return d; } })(), satB=(()=>{ for(let d=d5-1;d>d0;d--){ const T=CALENDAR.termOf(d); if(CALENDAR.dateOf(d).wd%7===6&&T&&!T.exam) return d; } })();
    const Ga=mk(satA,15,{flags:G2.flags}), Gb=mk(satB,15,{flags:G2.flags});
    check('11. 第 5 則以後：她在山嵐書店（週六 14–17），舊路書房沒有她；之前照舊在舊路書房',d5!=null&&!!SHOPENC.znEligible(Ga,'shanlan')&&!SHOPENC.znEligible(Ga,'bookstore')&&!SHOPENC.znEligible(mk(satA,17.1,{flags:G2.flags}),'shanlan')&&!!SHOPENC.znEligible(Gb,'bookstore')&&!SHOPENC.znEligible(Gb,'shanlan')&&SHOPENC.spots().includes('shanlan'),satA+'/'+satB);
    delete global.Z3; check('11. 山嵐書店又沒有了（舊存檔、區域拿掉）：回到舊路書房',!!SHOPENC.znEligible(mk(satA,15,{flags:G2.flags}),'bookstore')&&!SHOPENC.spots().includes('shanlan'));
    /* 回她 */
    const Gr=mk(STORY.termDay('Y2S1',5,3),21.6,{flags:G.flags,msgs:G.msgs.filter(m=>m.day<STORY.termDay('Y2S1',5,3))});
    const o=MSG.open(Gr,ZN), tp=MSG.topics(Gr,ZN).map(q=>q.k).join();
    check('11. 加了聯絡人：她的對話串可以「傳訊息」（在幹嘛、分享）',!!o.ok&&tp==='chat,share',JSON.stringify(o)+' '+tp);
    const n0=Gr.msgs.length; const r=MSG.send(Gr,ZN,'share','cat'); Gr.hour=26; PHONE.tick(Gr); const add=Gr.msgs.slice(n0);
    check('11. 傳了：她只回一句「哈哈。」或「好。」',r.ok&&add.length===2&&add[0].from==='player'&&add[1].from===ZN&&X.znReplies.includes(add[1].text),JSON.stringify(add.map(m=>m.text)));
    check('11. 同一天不能再傳',!MSG.canSend(Gr,ZN));
    const Gn=mk(Gr.day,15,{flags:{SHOP_ZN_MET:true}}); check('11. 沒加聯絡人：不能傳',!MSG.open(Gn,ZN).ok);
    check('11. 接線：手機規則（STORY.PHONE_RULES）有 SHOPENC.znPhone',STORY.PHONE_RULES.some(f=>String(f).includes('znPhone'))); }
  // ---------- 12. 一起坐（AA_641 第 5 節）----------
  { const X=SHOP_ENC.aa641, an=rowOf('heroine_01','cafe'), Ga=findSlot(an); STAGE.heroine_01='FRIEND';
    const G=mk(Ga.day,Ga.hour); const h0=G.hour; const gm=mkGM(G,['一起坐']); const r=await SHOPENC.meet(gm,an,ENC.tier(G,'heroine_01'));
    check('12. 一起坐：她的兩句 → 淡出淡入 → 時間走 30 分鐘 → 旁白「（你們坐了一會兒，各做各的事，偶爾說兩句。）」',r==='join'&&gm.L.fade.join()==='true,false'&&Math.abs(G.hour-h0-0.5)<1e-9&&gm.L.says[gm.L.says.length-1]===X.joinLine&&gm.L.says.indexOf('沈以安：先點東西。我等你。')<gm.L.says.indexOf(X.joinLine),JSON.stringify(gm.L));
    check('12. 同一天同一個人不能再一起坐',!SHOPENC.canJoin(an,ENC.tier(G,'heroine_01'),G)&&SHOPENC.canJoin(an,ENC.tier(G,'heroine_01'),mk(Ga.day+7,Ga.hour)));
    /* 撞到約 */
    const G2=mk(Ga.day,Ga.hour); G2.invites.push({who:'zhe',day:G2.day,h:G2.hour+0.6,accepted:true,done:false,zone:'library',label:'讀書'}); const h2=G2.hour;
    const gm2=mkGM(G2,['一起坐','打招呼']); const r2=await SHOPENC.meet(gm2,an,ENC.tier(G2,'heroine_01')); const op=(gm2.L.opts[0]||[]).find(x=>x.t==='一起坐');
    check('12. 等一下有約：「一起坐」變灰、hint「等一下有約」；按了只提示、回到選項（時間不走）',!!op&&op.dim===true&&op.hint==='等一下有約'&&gm2.L.says.includes('[toast]等一下有約')&&gm2.L.menus.length===2&&r2==='greet'&&G2.hour===h2&&!gm2.L.fade.length,JSON.stringify(gm2.L));
    const G2b=mk(Ga.day,Ga.hour); G2b.invites.push({who:'zhe',day:G2b.day,h:G2b.hour+1.5,accepted:true,done:false,zone:'library'}); const gm2b=mkGM(G2b,['一起坐']); await SHOPENC.meet(gm2b,an,ENC.tier(G2b,'heroine_01'));
    check('12. 約在一個半小時以後：不擋',!((gm2b.L.opts[0]||[]).find(x=>x.t==='一起坐')||{}).dim&&gm2b.L.fade.length===2);
    /* 撞到課（CLS.spanCheck；STORY.missText 那一套：還沒上、沒請假的課）*/
    global.CLS={dayItems:()=>[],spanCheck:(G,hh)=>({closed:false,miss:hh>=0.5?['15:10 民法總則']:[],exam:[],hard:[]})};
    const G3=mk(Ga.day,Ga.hour); const gm3=mkGM(G3,['一起坐','不打擾']); const r3=await SHOPENC.meet(gm3,an,ENC.tier(G3,'heroine_01')); const op3=(gm3.L.opts[0]||[]).find(x=>x.t==='一起坐');
    check('12. 等一下有課：hint「等一下有民法總則」',!!op3&&op3.dim===true&&op3.hint==='等一下有民法總則'&&r3==='pass',JSON.stringify(op3));
    delete global.CLS; delete STAGE.heroine_01; }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
