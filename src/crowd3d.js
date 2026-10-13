/* ===== 人流：公共場景隨時間改變（D55，使用者 2026-10-13；設計：docs/campus/PUBLIC_BUILDINGS_DESIGN.md 第 3 節）=====
   第一步：校園上公共建築的門口。
   - 共同教學館：上課前在門口等，開始時走進去；下課後從門口走出來，在門口聊一下，再走向椰林大道。
   - 大一女舍：早上出門、傍晚回來的人；晚上有人在門口等人或講電話；深夜沒有人。
   規則（使用者：「不要讓 NPC 隨玩家進出而任意生成和消失」「不要為了每個場景都熱鬧，而讓相同 NPC 同時出現在多個地方」）：
   - 每個地點（spot）有一天裡的時段（slots）；每個時段要幾個人、做什麼。
   - 同一天、同一個時段的那一群人是固定的（日期＋地點＋時段當亂數種子）：出去再進來，看到同一批人、站在同一些位置。
   - 時段開始：玩家看得到那裡 → 從門口（from）走出來；看不到 → 直接在那裡。
   - 時段結束：走向 to（走進門口或走上大路），走到了而且不在玩家眼前才移除。
   - 時間突然跳了（跳過時間、睡覺、讀檔、快速前往）：直接照新的時間重排，不慢慢走。
   - 路人沒有名字，不會是有名字的角色（有名字的人只照作息出現，見 story3d.js）。 */
'use strict';
const CROWD=(function(){
  const S={};
  const hr=G=>G.hour%24;
  const prng=seed=>{ let s=(seed>>>0)%2147483646+1; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; };
  const hash=str=>{ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  const termDay=G=>typeof CALENDAR!=='undefined'&&CALENDAR.kind(G.day)==='term'&&!CALENDAR.weekend(G.day);
  const schoolDay=G=>typeof CALENDAR==='undefined'||CALENDAR.kind(G.day)!=='holiday';   /* 宿舍：學期與寒暑假都有人（寒暑假少一點），國定假日也有，只是時段不同——這裡先只排除不住宿的長假（之後照宿舍規定） */
  const BLOCKS=[[9+10/60,12+10/60],[13+20/60,15+10/60],[15.5,17+20/60]];   /* 和 classes3d.js 的節次一樣 */
  // ---------- 地點與時段 ----------
  S.SPOTS=[
    { id:'gongtong', zone:'campus', label:'共同教學館門口', c:[2,20.2], spread:[4.2,1.6], door:[2,23.1], road:[0,6.5], mix:true,   /* door：門廊前面站得住的地方（走到這裡＝走進館裡）；road：椰林大道 */
      /* 上課日：每一節開始前 20 分鐘有人在門口等（開始時走進去）；下課後 10 分鐘有人從門口出來、站著聊一下，再走去椰林大道 */
      slots(G){ if(!termDay(G)) return []; const out=[]; for(const [a,b] of BLOCKS){ out.push({key:'pre'+a.toFixed(2),t0:a-1/3,t1:a,n:[3,6],pose:'idle',talk:0.4,enter:'road',leave:'door'}); out.push({key:'post'+b.toFixed(2),t0:b,t1:b+1/6,n:[2,5],pose:'talk',talk:0.7,enter:'door',leave:'road'}); } return out; } },
    { id:'fdorm', zone:'campus', label:'大一女舍門口', c:[-93,57.6], spread:[9,1.6], door:[-108,59.3], door2:[-78,57.3], road:[-93,47], female:true,   /* door：A 棟（傳達室）、door2：B 棟；road：舟山路 */
      /* 平日早上出門（07:40–08:50）、傍晚回來（17:20–19:00）、晚上在門口等人或講電話（20:00–22:30）；週末白天零星；深夜沒有人 */
      slots(G){ if(!schoolDay(G)) return []; const wk=typeof CALENDAR!=='undefined'&&CALENDAR.weekend(G.day);
        return wk?[{key:'wkday',t0:10.5,t1:17.5,n:[1,2],pose:'idle',talk:0.3,enter:'door',leave:'road'},{key:'wkeve',t0:19.5,t1:22,n:[1,3],pose:'talk',talk:0.6,enter:'road',leave:'door'}]
                 :[{key:'am',t0:7+40/60,t1:8+50/60,n:[2,4],pose:'idle',talk:0.3,enter:'door',leave:'road'},{key:'eve',t0:17+20/60,t1:19,n:[2,5],pose:'talk',talk:0.6,enter:'road',leave:'door'},{key:'night',t0:20,t1:22.5,n:[1,3],pose:'read',talk:0.2,enter:'door',leave:'door'}]; } } ];
  S.slotAt=function(G,spot,h){ h=h==null?hr(G):h; return spot.slots(G).find(s=>h>=s.t0-1e-6&&h<s.t1)||null; };
  /* 這一天、這個時段的那一群人：人數、位置、朝向、姿勢、外觀（路人編號）都由種子決定 */
  S.group=function(G,spot,slot){ const r=prng(hash(spot.id+'|'+slot.key+'|'+G.day)); const n=slot.n[0]+Math.floor(r()*(slot.n[1]-slot.n[0]+1)); const out=[]; const base=1000+Math.floor(r()*500);
    for(let k=0;k<n;k++){ const x=spot.c[0]+(r()-0.5)*2*spot.spread[0], z=spot.c[1]+(r()-0.5)*2*spot.spread[1]; let spec=base+k*(spot.female?2:1); if(spot.female&&spec%2) spec++;   /* extraSpec：偶數＝女生 */
      out.push({x:+x.toFixed(2),z:+z.toFixed(2),spec,pose:r()<slot.talk?'talk':slot.pose}); }
    /* 聊天的人轉向彼此（找最近的另一個人），其他的面向門口或馬路 */
    for(const p of out){ let best=null, bd=1e9; for(const q of out){ if(q===p) continue; const d=Math.hypot(q.x-p.x,q.z-p.z); if(d<bd){ bd=d; best=q; } }
      const tgt=(p.pose==='talk'&&best&&bd<3.2)?[best.x,best.z]:(slot.leave==='door'?spot.door:spot.road); p.yaw=Math.atan2(tgt[0]-p.x,tgt[1]-p.z); }
    return out; };
  // ---------- 遊戲裡 ----------
  const live={};   // spot.id → {slotKey, npcs:[...]}
  let lastH=null, tAcc=0, zoneNow=null;
  function inView(E,p){ const cam=E.camera; if(!cam||!THREE.Vector3.prototype.project) return true; const v=new THREE.Vector3(p.x,(p.y||0)+1.0,p.z).project(cam); return v.z<1&&Math.abs(v.x)<1.05&&Math.abs(v.y)<1.05; }
  function spawnGroup(GM,spot,slot,fromDoor){ const E=GM.E; const grp=S.group(GM.G,spot,slot); const npcs=[];
    for(const p of grp){ if(!E.canStand(p.x,p.z,0.3,0)) continue; const o=CHAR.build(STORY.extraSpec(p.spec)); const start=fromDoor?(slot.enter==='door'?(spot.door2&&p.x>spot.c[0]?spot.door2:spot.door):spot.road):[p.x,p.z];
      o.position.set(start[0],0,start[1]); o.rotation.y=p.yaw; const n=E.addNPC({obj:o,name:'',beh:'idle',pose:p.pose,idlePose:p.pose,isExtra:true,crowd:spot.id,frozen:!fromDoor,walkSpeed:1.25});
      if(fromDoor){ n.frozen=false; n.pose='walk'; E.moveTo(n,p.x,p.z,()=>{ n.frozen=true; n.pose=p.pose; n.idlePose=p.pose; n.obj.rotation.y=p.yaw; }); }
      npcs.push(n); }
    live[spot.id]={slotKey:slot.key,npcs}; }
  function leaveGroup(GM,spot,instant){ const E=GM.E, L=live[spot.id]; if(!L) return; delete live[spot.id];
    for(const n of L.npcs){ if(!E.npcs.includes(n)) continue; if(instant){ E.removeNPC(n); continue; }
      const tgt=(L.leave==='road'?spot.road:(spot.door2&&n.obj.position.x>spot.c[0]?spot.door2:spot.door)); n.frozen=false; n.leaving=true; n.pose='walk';
      if(!E.moveTo(n,tgt[0],tgt[1],()=>{ n.arrived=true; })) n.arrived=true; } }
  /* 走到門口或馬路的人：不在玩家眼前就移除（走進建築、走遠了）*/
  function sweep(GM){ const E=GM.E; for(const n of E.npcs.slice()){ if(!n.leaving||!n.arrived) continue; if(!inView(E,n.obj.position)||Math.hypot(n.obj.position.x-E.player.obj.position.x,n.obj.position.z-E.player.obj.position.z)>40) E.removeNPC(n); } }
  function sync(GM,instant){ const G=GM.G, E=GM.E; for(const spot of S.SPOTS){ if(spot.zone!==G.zone) continue; const slot=S.slotAt(G,spot); const L=live[spot.id];
      if(L&&(!slot||slot.key!==L.slotKey)){ L.leave=(S.SPOTS.find(q=>q.id===spot.id).slots(G).find(s=>s.key===L.slotKey)||{}).leave||'road'; leaveGroup(GM,spot,instant); }
      if(slot&&!live[spot.id]){ const vis=!instant&&inView(E,{x:spot.c[0],z:spot.c[1]})&&Math.hypot(spot.c[0]-E.player.obj.position.x,spot.c[1]-E.player.obj.position.z)<45; spawnGroup(GM,spot,slot,vis); } } }
  /* 進到區域（story3d.js 的 populate 最後呼叫）：照現在的時間直接排好 */
  S.enter=function(GM,zoneId){ for(const k in live) delete live[k]; zoneNow=zoneId; lastH=GM.G.hour; sync(GM,true); };
  S.tick=function(GM,dt){ const G=GM.G; if(!G||G.zone!==zoneNow) return; tAcc+=dt; if(tAcc<1.5) return; tAcc=0;
    const jump=lastH!=null&&Math.abs(G.hour-lastH)>0.2; lastH=G.hour;   /* 時間突然跳了：直接重排 */
    if(jump){ const E=GM.E; for(const n of E.npcs.slice()) if(n.crowd) E.removeNPC(n); for(const k in live) delete live[k]; sync(GM,true); }   /* 正在走開的人也一起拿掉（玩家沒有看到中間那段時間）*/
    else sync(GM,false);
    sweep(GM); };
  S.live=live;
  return S;
})();
