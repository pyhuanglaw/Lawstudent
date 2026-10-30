// POOL-AAFIX-1028：AA 9f2e2506e「實作時定的」五件（AA_499、AA_500；任務 NPC-STORY-1028、USER_WANTS X119）——不需要瀏覽器。
//   1 立群 3-2「我也想學。」：還沒有他的聯絡方式＝「手機給我。錄好傳你。」＋交換、一週後的私訊送得到；已經有＝不說、不重複交換
//   2 書豪 3-3「那天我有事。」：還沒有＝「……手機給我。講完跟你說。」＋交換、週六晚上那則送得到；已經有＝不說
//   3 承恩 4-1 一起去旁聽（ev_pool_sce_audit）：社科院門口（SL3.DOOR）、大一上第 6 週起的週二 14:00～16:00、選過「我也想旁聽別的系。」、認識、沒去過；
//     2D 照稿、兩個選項、演完 16:00、SCE_AUDIT_WENT、人物頁「陪他旁聽過一堂社工系的課」、一次
//   4 承恩 4-5 法扶實習第四句：第 14 次出席起；認識曾靖雯而且有她的聯絡方式才有（沒有就不出、之後有了再出）
//   5 晨希：晏如選「我也怕蟑螂。」、那時已經認識晨希（LYR_CX）＝下一次和晨希說話第一句換成兩句，一次；那時還不認識＝不換
// 修改前（bb87d2f7b，暫時 worktree 實跑）：FAILED 9——1 兩項（沒有那一句、私訊送不到）、2 兩項（同上）、3 沒有這個事件（其餘跳過）、4 三項、5 第一句沒換。
// 修改後：ALL PASS。用法：node tests/pool_aafix_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const DOCS={B2:['AA_499','4545c239e','docs/story_planning/AA_499_法律系同學第二批_何宇軒_徐靜儀_詹立群_蘇承恩_馬佳蓉.md'],
  B3:['AA_500','d043110ae','docs/story_planning/AA_500_法律系同學第三批_大二六位_蔡宗霖_劉晏如_楊書豪_葉晨希_游振宇_蕭乃文.md'],
  B4:['AA_501','17d57eff3','docs/story_planning/AA_501_法律系同學第四批_大三四位_洪珮瑜_施孟儒_廖芸萱_嚴守誠.md']};
const DOC498=['56ed354e9','docs/story_planning/AA_498_法律系同學二十位_共同做法_改名_第一批五位.md'];
const HX='pool_10', JY='pool_13', LQ='pool_16', SC='pool_19', M='pool_20', TZ='pool_2', LY='pool_5', SH='pool_8', CX='pool_11', ZY='pool_14', NW='pool_17', PY='pool_9', MR='pool_12', YX='pool_15', YS='pool_18', ZJW='pool_7';
const ALL15=[HX,JY,LQ,SC,M,TZ,LY,SH,CX,ZY,NW,PY,MR,YX,YS];
const BH='classmate_bohan', PS='classmate_peishan', YC='classmate_youchen';

/* ---------- 載入（和 index.html 同一個順序；第二～四批的檔案修改前不存在＝記下來，各節 FAIL）---------- */
const RE=/^(SL3|SOCSCI_LAYOUT|SOCLIB_LAYOUT|EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|LANE118_LAYOUT|PARK|WZ_PARK_LAYOUT|SIDEQ|MSG|MSG_POOL|MSG2_POOL|SISY23|SISY23_LINES|SISY23_EVENTS|POOL|POOL_STORY|POOL_STORY_B2|POOL_STORY_B3|POOL_STORY_B4|POOL_MORE|HCIRCLE|HCIRCLE_DATA|PRACTICE|R2Y4A_EVENTS|R2Y4B_EVENTS|R2Y3A_EVENTS|Y2B|Y2B_EVENTS|GROUP|GROUP_EVENTS|Y2R2|R2Y4A|R2Y4B|R2Y3A)$/;
const errs=[];
const load=f=>{ if(!fs.existsSync(path.join(H.ROOT,f))){ errs.push('沒有 '+f); return; } try{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); s=s.replace(/^const (\w+)\s*=/mg,(m,n)=>RE.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(s,{filename:f}); }catch(e){ errs.push(f+'：'+String(e&&e.message||e).slice(0,200)); } };
for(const f of ['src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js','src/data/wz_park_layout.js','src/wzpark3d.js','src/wzshops3d.js','src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/sideq3d.js',
  'src/data/y2b_events.js','src/y2b3d.js','src/data/group_events.js','src/group3d.js','src/y2r2_3d.js','src/data/r2y3a_events.js','src/data/r2y4a_events.js','src/data/r2y4b_events.js','src/practice3d.js',
  'src/data/pool_story.js','src/pool3d.js','src/data/pool_story_b2.js','src/data/pool_story_b3.js','src/data/pool_story_b4.js','src/pool_more3d.js','src/data/heroine_circle.js','src/hcircle3d.js']) load(f);
{ const k=errs.findIndex(e=>/^src\/soclib3d\.js：Z3 is not defined/.test(e)); if(k>=0&&typeof SL3!=='undefined') errs.splice(k,1); }   /* soclib3d.js 最後登記 Z3.ZONES（Node 沒有 Z3）；這支測試只要 SL3.DOOR（社科院門口）*/
const P=()=>typeof POOL!=='undefined'?POOL:null, PM=()=>typeof POOL_MORE!=='undefined'&&POOL_MORE.SRC?POOL_MORE:null;
const L=id=>(P()&&P().LINES[id])||{};
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ').slice(0,400)); } };
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const TD=(t,w,wd)=>STORY.termDay(t,w,wd);
const set=(day,h,zone)=>{ H.G.day=day; H.G.hour=h; H.G.weekday=wdOf(day); if(zone) H.G.zone=zone; };
const fresh=(day,h,zone,flags)=>{ const G=H.fresh(keyOf(day),h,zone||'campus',Object.assign({EXCHANGE_ROUTE:'TW',afternoonDone:true},flags||{})); G.outings=[]; set(day,h,zone||'campus'); G.weather='clear';
  GM.npc={}; E.npcs=[]; E.interactables=[]; E.player.obj.position={x:0,y:0,z:0}; G.bike=null; if(typeof SIDEQ!=='undefined') SIDEQ.roll=()=>0.99; if(P()) P().bind(GM); STORY._bindGM(GM); if(typeof HCIRCLE!=='undefined'&&HCIRCLE.bind) HCIRCLE.bind(GM); return G; };
const spawn=(id,x,z)=>{ const n={name:SOCIAL.npcName(id),charId:id,obj:{position:{x:x||0,y:0,z:z||0}},pose:'idle'}; n.talk=nn=>STORY.talkCharacter(id,nn); GM.npc[id]=n; E.npcs.push(n); return n; };
const said=()=>H.said.map(x=>(x.who?x.who+'：':'')+x.t), has=t=>H.said.some(x=>x.t===t), whoOf=t=>(H.said.find(x=>x.t===t)||{}).who;
const T=x=>typeof x==='string'?x:(x&&x.text);
const hasL=x=>has(String(T(x)).replace('{name}','祐廷'));
const talk=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const n=GM.npc[id]||spawn(id); await STORY.talkCharacter(id,n); return n; };
const again=async(id,picks,day,h,zone)=>{ set(day,h,zone); GM.npc={}; E.npcs=[]; spawn(id); return talk(id,picks); };
const rel=(id,fam,trust)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; };
const meet=(id,z)=>SOCIAL.meet(id,z||H.G.zone);
const msgs=id=>(H.G.msgs||[]).filter(m=>m.th==='p:'+id).map(m=>m.text);
const tagged=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const phAt=(day,h)=>{ set(day-1,22); ph(); set(day,h); ph(); };
const outing=ev=>(H.G.outings||[]).find(q=>q.ev===ev);
const go=async(ev,picks)=>{ const q=outing(ev); if(!q) return null; H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); set(q.day,q.h-0.3); await OUT.go(GM,q); return q; };
const ans=(tag,k)=>{ const m=(H.G.msgs||[]).find(x=>x.tag===tag&&x.ask); return m?PHONE.answer(H.G,m.ask.id,k):null; };
const quest=qid=>SIDEQ.get(H.G,qid)||{};
const deeds=id=>P().deeds(H.G,id);
const said1=(id)=>{ const S0=H.G.social.small||(H.G.social.small={}); return S0[id]||(S0[id]={day:0,used:[],last:null}); };
const markTalk=(id,keep)=>{ const r=said1(id); r.once=r.once||{}; for(const e of (L(id).talk||[])) if(e.when!==keep) r.once[e.t]=true; r.day=0; };   /* 閒聊表上別的句子都算說過（看某一句什麼時候解鎖）*/
const onDay=(a,from)=>{ for(let x=from;x<from+120;x++) if(ACTIVITIES.on(a,x,H.G)) return x; return null; };

async function main(){
if(errs.length) check('0. 載入',false,errs.join(' / '));
await sec('1 立群',async()=>{
  fresh(TD('Y1S1',9,5),21,'gongguan'); meet(LQ); rel(LQ,25,3); spawn(LQ); await talk(LQ,[]);
  await again(LQ,['我也想學'],TD('Y1S1',10,5),21,'gongguan'); const d0=H.G.day;
  check('1. 立群「我也想學。」、還沒有他的聯絡方式：「真的？那我寫一首給你。……你不能笑。」接「手機給我。錄好傳你。」（立群說）＋交換聯絡方式',has('真的？那我寫一首給你。……你不能笑。')&&whoOf('手機給我。錄好傳你。')==='詹立群'&&INV.hasContact(H.G,LQ)&&H.G.flags.LQ_SONG===true,J(said()));
  phAt(d0+7,21.2); const m1=msgs(LQ);
  check('1. 一週後 21:00 的私訊照稿（「（錄音 0:30）」「民法第一條。你不能笑。」）——現在送得到',m1.includes('（錄音 0:30）')&&m1.includes('民法第一條。你不能笑。'),J(m1));
  fresh(TD('Y1S1',9,5),21,'gongguan'); meet(LQ); rel(LQ,25,3); INV.addContact(H.G,LQ); const c0=H.G.contacts[LQ]; spawn(LQ); await talk(LQ,[]);
  await again(LQ,['我也想學'],TD('Y1S1',10,5),21,'gongguan');
  check('1. 已經有他的聯絡方式：不說「手機給我。錄好傳你。」、聯絡方式照舊那一天（沒有再交換一次）',has('真的？那我寫一首給你。……你不能笑。')&&!has('手機給我。錄好傳你。')&&H.G.contacts[LQ]===c0,J(said())); });
await sec('2 書豪',async()=>{
  const d2=TD('Y1S2',9,2); fresh(d2,12.3,'campus'); meet(SH); rel(SH,25,3); spawn(SH); await talk(SH,['那天我有事']);
  const i1=H.said.findIndex(x=>x.t==='好。我自己去。'), i2=H.said.findIndex(x=>x.t==='……手機給我。講完跟你說。');
  check('2. 書豪「那天我有事。」、還沒有他的聯絡方式：「好。我自己去。」接「……手機給我。講完跟你說。」（書豪說）＋交換聯絡方式',i1>=0&&i2===i1+1&&whoOf('……手機給我。講完跟你說。')==='楊書豪'&&INV.hasContact(H.G,SH),J(said()));
  const sat=P().rec(H.G).yshSat; if(sat!=null) phAt(sat,21.2); const m=msgs(SH);
  check('2. 週六晚上那則照稿（「講完了。超時半句。」）——現在送得到',sat!=null&&m.includes('講完了。超時半句。'),J({sat,m}));
  fresh(d2,12.3,'campus'); meet(SH); rel(SH,25,3); INV.addContact(H.G,SH); spawn(SH); await talk(SH,['那天我有事']);
  check('2. 已經有他的聯絡方式：只說「好。我自己去。」',has('好。我自己去。')&&!has('……手機給我。講完跟你說。'),J(said())); });
await sec('3 承恩旁聽',async()=>{
  const ev=STORY_EVENTS.find(e=>e.id==='ev_pool_sce_audit');
  check('3. 一起去旁聽：STORY_EVENTS 有 ev_pool_sce_audit（校園、auto、一次）；觸發點＝社科院門口 SL3.DOOR、半徑 3',!!ev&&ev.location==='campus'&&ev.trigger==='auto'&&ev.once===true&&typeof SL3!=='undefined'&&!!ev.near&&ev.near.x===SL3.DOOR.x&&ev.near.z===SL3.DOOR.z&&ev.near.r===3,J(ev&&ev.near));
  if(!ev) return;
  const due=(t,w,wd,h,o)=>{ o=o||{}; fresh(TD(t,w,wd),h,'campus'); if(!o.noMeet) meet(SC); if(!o.noFlag) H.G.flags.SCE_AUDIT=true; if(o.went) H.G.flags.SCE_AUDIT_WENT=true; return !!ev.prereq.custom(H.G); };
  const r={w6:due('Y1S1',6,2,14),w6b:due('Y1S1',6,2,15.9),w5:due('Y1S1',5,2,14.5),wed:due('Y1S1',6,3,14.5),h1357:due('Y1S1',6,2,13.95),h16:due('Y1S1',6,2,16),y2:due('Y2S1',1,2,14.5),
    noFlag:due('Y1S1',7,2,14.5,{noFlag:true}),noMeet:due('Y1S1',7,2,14.5,{noMeet:true}),went:due('Y1S1',7,2,14.5,{went:true})};
  check('3. 條件：大一上第 6 週起的週二 14:00～16:00（16:00 不含）、選過「我也想旁聽別的系。」、認識、沒去過；之後的學期也可以；第 5 週、週三、13:57、16:00、沒選、不認識、去過＝不演',
    r.w6&&r.w6b&&r.y2&&!r.w5&&!r.wed&&!r.h1357&&!r.h16&&!r.noFlag&&!r.noMeet&&!r.went,J(r));
  fresh(TD('Y1S1',6,2),14.2,'campus'); meet(SC); H.G.flags.SCE_AUDIT=true; H.said=[]; H.opts=[]; H.picks=['哪裡像']; await EVENTS.run(ev);
  check('3. 2D 照稿：社科院三樓的大教室、個案紀錄、筆記上那一行；選「哪裡像？」→ 他寫的那一句（另一支不出）；接「（下課。走出社科院的時候，他才開口。）」、承恩「下週我還會來。…」',
    has('（社科院三樓的大教室。你和承恩坐在最後一排，前面都是社工系的學生。）')&&has('（台上的老師在講個案紀錄：「寫下他說的話。你覺得他是什麼人，先不要寫。」）')&&has('（承恩在筆記上寫了一行字，推過來：「跟證人筆錄有點像。」）')
    &&has('（他想了一下，寫：「都要照他說的寫。……可是這邊的人，寫完會再回去看他。」）')&&!has('（他把那一行劃掉，重寫了一次，寫得比較工整。）')&&has('（下課。走出社科院的時候，他才開口。）')&&whoOf('下週我還會來。你不用陪我。……今天，謝謝。')==='蘇承恩',J(said()));
  check('3. 演完：16:00、SCE_AUDIT_WENT、人物頁「陪他旁聽過一堂社工系的課」；之後不再演',Math.abs(H.G.hour-16)<0.05&&H.G.flags.SCE_AUDIT_WENT===true&&deeds(SC).includes('陪他旁聽過一堂社工系的課')&&!ev.prereq.custom(H.G),J({h:H.G.hour,d:deeds(SC)}));
  fresh(TD('Y1S1',8,2),15,'campus'); meet(SC); H.G.flags.SCE_AUDIT=true; H.said=[]; H.opts=[]; H.picks=['點頭']; await EVENTS.run(ev);
  check('3. 選「（點頭）」→「（他把那一行劃掉，重寫了一次，寫得比較工整。）」；15:00 開始的也到 16:00',has('（他把那一行劃掉，重寫了一次，寫得比較工整。）')&&!has('（他想了一下，寫：「都要照他說的寫。……可是這邊的人，寫完會再回去看他。」）')&&Math.abs(H.G.hour-16)<0.05,J({s:said(),h:H.G.hour})); });
await sec('4 承恩第四句',async()=>{
  const PMx=PM(); const line4='（承恩的手機亮了一下。他看了一眼，小聲說：「……靖雯傳早安。現在下午三點。」）';
  check('4. 實習第四句在 practice[3]、第 14 次出席起（PRACTICE_AT[3]＝13）',!!PMx&&(L(SC).practice||[])[3]===line4&&PMx.PRACTICE_AT[3]===13,J(PMx&&PMx.PRACTICE_AT));
  if(!PMx) return;
  const hadCLS=typeof CLS!=='undefined'; const C0=hadCLS?CLS.rec:null; let N=0; const stub=()=>({attend:{legal_practice:N}});
  if(hadCLS) CLS.rec=stub; else globalThis.CLS={rec:stub,OFFSITE_AFTER:[]};
  try{
    const at=(n,o)=>{ o=o||{}; fresh(TD('Y4S2',14,3),15,'campus'); meet(SC); if(o.jw) meet(ZJW); if(o.jwC) INV.addContact(H.G,ZJW); P().rec(H.G).sceP=3; N=n; return PMx.practiceLine(H.G,{c:{id:'legal_practice'}},'x'); };
    const r={ok:at(13,{jw:1,jwC:1}),early:at(12,{jw:1,jwC:1}),noC:at(13,{jw:1}),noMet:at(13,{jwC:1})};
    check('4. 第四句：認識曾靖雯＋有她的聯絡方式＋第 14 次出席＝出；第 13 次、沒有聯絡方式、不認識＝不出',r.ok===line4&&r.early==null&&r.noC==null&&r.noMet==null,J(r));
    fresh(TD('Y4S2',14,3),15,'campus'); meet(SC); meet(ZJW); P().rec(H.G).sceP=3; N=13; const a=PMx.practiceLine(H.G,{c:{id:'legal_practice'}},'x'); INV.addContact(H.G,ZJW); N=14; const b=PMx.practiceLine(H.G,{c:{id:'legal_practice'}},'x'); const c=PMx.practiceLine(H.G,{c:{id:'legal_practice'}},'x');
    check('4. 那時還沒有她的聯絡方式＝停在第三句；之後有了＝下一次出；只出一次',a==null&&b===line4&&c==null,J({a,b,c}));
  } finally { if(hadCLS) CLS.rec=C0; else delete globalThis.CLS; } });
await sec('5 晨希',async()=>{
  const r3=TD('Y1S2',5,1); fresh(r3,18.8,'wancai'); meet(LY); rel(LY,25,3); meet(CX); spawn(LY); await talk(LY,['我也怕']);
  check('5. 晏如選「我也怕蟑螂。」、那時已經認識晨希＝LYR_ROACH、LYR_CX',H.G.flags.LYR_ROACH===true&&H.G.flags.LYR_CX===true,J(H.G.flags.LYR_CX));
  set(r3+1,12,'campus'); GM.npc={}; E.npcs=[]; spawn(CX); await talk(CX,[]);
  check('5. 下一次和晨希說話：第一句換成「社辦那隻，我用衛生紙包起來丟了。」「……你和晏如站在走廊的樣子，很像在罰站。」（晨希說）',H.said.length>=2&&H.said[0].t==='社辦那隻，我用衛生紙包起來丟了。'&&H.said[1].t==='……你和晏如站在走廊的樣子，很像在罰站。'&&H.said[0].who==='葉晨希',J(said()));
  set(r3+2,12,'campus'); GM.npc={}; E.npcs=[]; spawn(CX); await talk(CX,[]);
  check('5. 一次：再下一次照平常',!has('社辦那隻，我用衛生紙包起來丟了。'),J(said()));
  fresh(r3,18.8,'wancai'); meet(LY); rel(LY,25,3); spawn(LY); await talk(LY,['我也怕']); const cx0=H.G.flags.LYR_CX; meet(CX);
  set(r3+1,12,'campus'); GM.npc={}; E.npcs=[]; spawn(CX); await talk(CX,[]);
  check('5. 那時還不認識晨希＝沒有 LYR_CX、之後和晨希說話不換',!cx0&&H.G.flags.LYR_ROACH===true&&!has('社辦那隻，我用衛生紙包起來丟了。'),J(said())); });
await sec('6 晨希大四的錄音',async()=>{   /* AA_514 第 4 節第 4 點（9bca0f407）：她 2028-06 畢業、3D 沒有她——AA_509、AA_510 那兩句改成她的錄音私訊；有聯絡方式、認識子晴；不用回 */
  const rec=(o,key,h)=>{ o=o||{}; fresh(D(key)-1,20,'campus'); if(!o.noMeetZq) meet('heroine_04'); meet(CX); if(!o.noC) INV.addContact(H.G,CX); phAt(D(key),h); return (H.G.msgs||[]).filter(m=>m.th==='p:'+CX); };
  const a=rec({},'2028-11-15',22.2), ja=JSON.stringify(a);
  check('6. 2028-11-15（三）22:00「（錄音 0:40）」，點開＝「（社課的聲音。…——是子晴。）」；不用回',a.some(m=>m.text==='（錄音 0:40）')&&ja.includes('（社課的聲音。最後一首彈完，椅子一張一張收起來。有人在收導線，一邊收一邊哼——是子晴。）')&&!a.some(m=>m.ask),ja.slice(0,300));
  const b=rec({},'2029-05-13',22.2), jb=JSON.stringify(b);
  check('6. 2029-05-13（日）22:00「（錄音 1:10）」，點開＝「（一個學妹在台上彈，…——是子晴的聲音。）」',b.some(m=>m.text==='（錄音 1:10）')&&jb.includes('（一個學妹在台上彈，中間停了一拍，又接上。台下有人說：「沒停就好。」——是子晴的聲音。）'),jb.slice(0,300));
  const n1=rec({noC:true},'2028-11-15',22.2), n2=rec({noMeetZq:true},'2028-11-15',22.2), early=rec({},'2028-11-15',21.5);
  check('6. 沒有她的聯絡方式、不認識子晴＝不送；21:30 還沒有',!n1.some(m=>m.text==='（錄音 0:40）')&&!n2.some(m=>m.text==='（錄音 0:40）')&&!early.some(m=>m.text==='（錄音 0:40）'),JSON.stringify([n1.length,n2.length,early.length])); });
H.done();
}
main();
