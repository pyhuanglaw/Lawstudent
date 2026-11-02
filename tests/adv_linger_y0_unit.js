// BUG-ADV-LINGER-1018 第二段（BB-B 歷史複核第 1 批，BB_218 b3bf2bd74，基準 39f68236c 瀏覽器）：10/17「（你拿了車鑰匙出門。）」、7/25 夜班客運第一句，可昕的立繪還站著。
// 原因不是前一段沒收：ADV.begin 照 participants[0] 開場就把可昕擺上去（她還沒上車／人在高雄只傳訊息）。改 portraitLater＝開場不擺，她開口才出來（ADV.speaker）。不需要瀏覽器。
//   1 五個事件有 portraitLater、開頭第一句是旁白  2 EVENTS.run（模擬 ADV）：ADV.begin 沒有擺立繪，第一句旁白時舞台是空的；可昕第一次開口才 speaker('kexin')
// 修改前（開發分支 dbf8bec7d）：1、2 FAIL。用法：node tests/adv_linger_y0_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check}=H, J=JSON.stringify;
const IDS=['ev_y0_e26','ev_y0_kh_bus_h','ev_y0_kh_bus','ev_y0_kh_home_h','ev_y0_kh_home'];
const evs=IDS.map(id=>STORY_EVENTS.find(e=>e.id===id));
const first=ev=>(ev.dialogue||[]).find(l=>l&&(l.text!==undefined||l.phone));
check('1. 五個事件都在、portraitLater、第一句是旁白（speaker null）',evs.every(e=>e&&e.portraitLater===true&&first(e)&&first(e).speaker===null&&!first(e).phone),J(evs.map((e,i)=>e?[IDS[i],e.portraitLater,first(e)]:[IDS[i],'沒有'])));
(async()=>{
  const ev=evs[0]; const G=H.fresh('2024-10-17',22,'dorm',{}); G.stage='econ';
  const log=[]; const A0=global.ADV;
  global.ADV=Object.assign({},A0,{active:false,preload(){},begin(o){ this.active=true; log.push(['begin',!!o.right,!!o.left]); },end(){ this.active=false; },log(){},cg(){ return true; },setBg(){},hide(s){ log.push(['hide',s]); },show(){},narrate(){},
    speaker(id){ log.push(['speaker',id]); }});
  const GM=H.GM; const say0=GM.say, ch0=GM.choose; GM.say=async(w,t)=>{ log.push(['say',w==null?null:w,t]); }; GM.choose=async()=>0;
  try{ if(ev) await EVENTS.run(ev,{noTitle:true}); }catch(e){ log.push(['err',String(e)]); }
  GM.say=say0; GM.choose=ch0; global.ADV=A0;
  const b=log.find(x=>x[0]==='begin'), iSay=log.findIndex(x=>x[0]==='say'), iKx=log.findIndex(x=>x[0]==='speaker'&&x[1]==='kexin');
  check('2. ev_y0_e26 EVENTS.run：ADV.begin 沒有擺立繪；「（你拿了車鑰匙出門。）」時舞台空的；可昕開口才出來',!!b&&!b[1]&&!b[2]&&iSay>=0&&/車鑰匙/.test(String(log[iSay][2]))&&(iKx<0||iKx>iSay),J(log.slice(0,8)));
  H.done();
})();
