// 唯讀模擬：交換延畢玩家 2029-09-03～2030-08 的停點、訊息、場景（用開發分支的 tests/pg_harness.js 載入遊戲）
const WT=process.env.WT; const H=require(WT+'/tests/pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const RX=/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|GROUP|GROUP_EVENTS|R2Y3A|R2Y3A_EVENTS|R2Y3B|R2Y3B_EVENTS|HOLFF|JP|JP_EVENTS|R2Y4A|R2Y4A_EVENTS|R2Y4B|R2Y4B_EVENTS|R3|R3_EVENTS|US_LIFE|US_LIFE_EVENTS|Y1FILL|Y1FILL_EVENTS|NOODLE_CLOSED|Y2B|Y2B_EVENTS|Y2R2|SIS_GRAD|HOMETOWN|HOMETOWN_LINES|ENC|ENCOUNTERS|EAT|EAT_LINES|RETAKE_HOME|NEEDED_MSGS)$/;
const load=f=>{ if(!fs.existsSync(path.join(WT,f))) { console.log('MISSING',f); return; } let src=fs.readFileSync(path.join(WT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>RX.test(n)?'globalThis.'+n+'=':m); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ console.log('LOADERR',f,e.message); } };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/exchange3d.js','src/data/needed_msgs.js','src/data/retake_home.js','src/holff3d.js','src/data/eat_lines.js','src/noodle_closed3d.js','src/data/y2b_events.js','src/y2b3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/y2r2_3d.js','src/sis_grad3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/data/r3_events.js','src/r3_3d.js','src/data/us_life_events.js','src/us_life3d.js','src/data/y1fill_events.js','src/y1fill3d.js']) load(f);
const {GM,E}=H; GM.caption=()=>{}; GM.toast=()=>{}; GM.memo=()=>{};
const scen=process.env.SCEN||'base';
const route=process.env.ROUTE||'JP';
const G=H.fresh('2029-09-02',22,'dorm',{EXCHANGE_ROUTE:route,EXCH_RULE:1,Y4_PATH:process.env.PATH4||'bar',BAR_REG:true,GRAD_DONE:true,PACKED_Y4:1,HOME_AFTER:'home',introDone:true});
const gd=PG.DK('2029-06-02'); G.flags.GRADUATED=gd; G.flags.MOVED_OUT=PG.DK('2029-06-28'); G.flags.FIRST_DAY_SEEN=false;
const R=PG.rec(G); for(const s of PG.STEPS){ const t=s.at(G); if(t!=null&&t<PG.DK('2029-09-02')*24) R.done[s.id]=1; } R.done.grad=1;
G.events.done.ev_grad_family=1; G.events.done.ev_grad_lunch=1; G.events.done.ev_grad_envelope=1;
for(const id of ['zhe','yu','classmate_bohan','classmate_xinci','classmate_mingxuan','heroine_01','heroine_03','heroine_02','heroine_04','heroine_05','classmate_peishan','kai','npc_fangyt','classmate_youchen']){ H.FRIEND(id); INV.addContact(G,id); }
PHONE.join(G,'noodle_team','麵店團');
if(scen!=='base'){ ROM.start(G,scen); }
G.flags.PS_RECONNECT=true;
// 把 2029-09-02 以前的訊息規則都當作送過（只看 9/3 以後新出的）
PG.rules(GM); try{ STORY.phoneRules(GM); }catch(e){} PHONE.tick(G);
const seen=new Set((G.msgs||[]).map((m,i)=>i)); let nMsg=(G.msgs||[]).length;
const WD='日一二三四五六';
const lab=t=>{ const d=Math.floor(t/24), D=CALENDAR.dateOf(d); const h=t-d*24; return D.key+'（'+WD[D.wd%7]+'）'+String(Math.floor(h)).padStart(2,'0')+':'+String(Math.round((h%1)*60)).padStart(2,'0'); };
const end=PG.DK(process.env.END||'2030-08-04')*24;
const log=[];
(async()=>{
  for(let guard=0;guard<400;guard++){
    const s=PG.due(G); if(s){ H.said=[]; H.picks=[0,0,0,0]; await PG.runStep(GM,s); log.push(lab(G.day*24+G.hour)+'｜場景 '+s.id+'｜'+H.said.slice(0,3).map(x=>(x.who?x.who+'：':'')+x.t).join(' / ')); continue; }
    if(typeof OUT!=='undefined'&&OUT.due&&OUT.due(G)){ const q=OUT.due(G); log.push(lab(G.day*24+G.hour)+'｜出遊（不去）'+(q.id||'')+' '+(q.title||'')); try{ q.state='missed'; const ev=STORY_EVENTS.find(e=>e.id===q.ev); if(ev&&ev.outingMissed) await ev.outingMissed(G,GM,q); }catch(e){} continue; }
    const t=PG.nextStop(G); if(t==null||t>end){ log.push('（沒有下一件事）nextStop='+(t==null?'null':lab(t))); break; }
    const r=PG.jumpTo(GM,t);
    const M=(G.msgs||[]); for(let i=nMsg;i<M.length;i++){ const m=M[i]; log.push(lab(m.day*24+m.h)+'｜訊息 '+(m.th||'')+'｜'+(m.from||m.who||'')+'：'+String(m.text).slice(0,60)+(m.tag?'　['+m.tag+']':'')); } nMsg=M.length;
    for(const q of (G.msgs||[])) if(q.ask&&q.ans==null&&q.ask.id) { try{ PHONE.answer(G,q.ask.id,0); }catch(e){} }
  }
  console.log('情境：route='+route+' path='+(process.env.PATH4||'bar')+' dating='+scen);
  for(const l of log) console.log(l);
  console.log('Y5_DAYS',G.flags.Y5_DAYS,'Y5_INTERN',JSON.stringify(G.flags.Y5_INTERN),'CERT_DAY',G.flags.CERT_DAY);
})().catch(e=>console.log('ERR',e.stack));
