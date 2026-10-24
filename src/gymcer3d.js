/* 開學典禮、畢業典禮換成體育館 3F 的 3D（AA_399 第 4 節，企劃線 5d09bb725；布置 LAWWW2 SET-CEREMONY-1023：gym3d.js 的 GY3.ceremonyDay、z.cerSpots）：
   - 2025-08-31 14:00 開學典禮：玩家坐法律學院那一區走道邊（spots.me）；宿營認識的人坐在附近（以安、阿哲、Alison：STORY.metAtCamp），不加台詞。
     旁白照原本的 2D 版（story3d.js S.ceremonyY1 的三句，一字不改），對話框疊在 3D 上（ADV 'blur'）；演完起身，人在體育館裡（自己走出去）。
   - 2029-06-02 09:00 畢業典禮：同一個位子；家人（爸爸、媽媽）坐在南看台（spots.family），旁白照原本；11:00 法律學院那一段照舊（story3d.js gradFamily 叫 GYMCER.gradStage）。
   - 體育館的區域或布置沒有（舊版、?nobldg、載入失敗）＝照原本的 2D（ntu_gym_ceremony）。 */
const GYMCER=(function(){
  const S={};
  const ok=()=>typeof Z3!=='undefined'&&!!Z3.ZONES&&!!Z3.ZONES.gym_arena&&typeof GY3!=='undefined'&&!!GY3.ceremonyDay;
  const seatOf=p=>p?{x:p.x,z:p.z,yaw:p.yaw||0,lv:0,y:p.y}:null;
  const clean=s=>{ const o=Object.assign({},s); if(o.y==null) delete o.y; return o; };
  /* 進體育館 3F、玩家坐下；回傳 zone（布置沒打開＝null）*/
  S.enterSeat=async function(GM,kind){ const G=GM.G; if(!ok()||GY3.ceremonyDay(G)!==kind||!GM.enter) return null;
    await GM.enter('gym_arena',{x:0,z:15.4,yaw:Math.PI},{noFade:true}); const E=GM.E, z=E&&E.zone; if(!z||!z.ceremonyOn||!z.cerSpots) return null;
    const me=seatOf(z.cerSpots.me); if(me&&GM.sitAt&&E.player) GM.sitAt(E.player,clean(me)); return z; };
  S.FRIENDS=[['heroine_01','an'],['zhe','zhe'],['yu','alison']];
  S.placeFriends=function(GM,z){ const G=GM.G; if(!GM.spawnCharacter) return 0; let k=0;
    for(const [id,key] of S.FRIENDS){ if(!(typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,id))) continue; const st=seatOf(z.cerSpots[key]); if(!st||(GM.npc&&GM.npc[id])) continue;
      const n=GM.spawnCharacter(id,st.x,st.z,{seat:clean(st)}); if(n){ n.frozen=true; n.cerSeat=true; k++; } }
    return k; };
  S.placeFamily=function(GM,z){ if(!GM.spawnNPC||typeof STORY==='undefined'||!STORY.extraSpec) return 0; const F=z.cerSpots.family||[]; let k=0;
    [['grad_mom','媽媽',901],['grad_dad','爸爸',902]].forEach(([id,name,n],i)=>{ const p=F[i]; if(!p) return; const sp=Object.assign({},STORY.extraSpec(n),{name}); const e=GM.spawnNPC(id,sp,p.x,p.z,{seat:clean(seatOf(p)),greet:false}); if(e){ e.frozen=true; e.cerSeat=true; k++; } });
    return k; };
  S.standUp=function(GM){ const E=GM.E; if(E&&E.player&&E.player.seat&&GM.standUp) GM.standUp(E.player); };
  /* 開學典禮：取代 story3d.js 的 S.ceremonyY1（布置沒有就叫原本的）*/
  S.open=async function(GM,orig){ const G=GM.G, F=G.flags, E=GM.E; if(F.CEREMONY_Y1) return false; if(!ok()||GY3.ceremonyDay(G)!=='open') return orig.call(STORY,GM);
    F.CEREMONY_Y1=true; GM.sceneBegin(); let z=null;
    try{ if(G.hour<14){ G.hour=14; if(E) E.hour=14; } await GM.fade(true); await GM.titleCard('8 月 31 日（日）','14:00 · 綜合體育館',2200);
      z=await S.enterSeat(GM,'open'); if(z) S.placeFriends(GM,z);
      if(typeof ADV!=='undefined') ADV.begin({background:z?'blur':'dark'}); await GM.fade(false);
      await GM.say(null,'四千多個新生，每個人都穿著同一件新生上衣。');
      await GM.say(null,'法律系的位置在二樓看台的右邊。旁邊的人在對手冊上的流程，前面的人在傳訊息問晚上要不要一起吃飯。');
      await GM.say(null,'校長致詞講到一半，手機震了一下。你被加進一個群組。'); if(STORY.lawClassJoinY1) STORY.lawClassJoinY1(G);
      if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); if(G.hour<15.5) GM.advance(15.5-G.hour); S.standUp(GM);
    } finally { GM.sceneEnd(); }
    if(GM.phoneBadge) GM.phoneBadge(); if(GM.autosave) GM.autosave(); return true; };
  /* 畢業典禮的 09:00 那一段：進體育館 3F、坐下、家人在看台；回傳 true＝3D（ADV 用 'blur'），false＝照原本 2D */
  S.gradStage=async function(GM){ const z=await S.enterSeat(GM,'grad'); if(!z) return false; S.placeFamily(GM,z); return true; };
  S.gradEnd=function(GM){ S.standUp(GM); };
  if(typeof STORY!=='undefined'&&STORY.ceremonyY1&&!STORY._gymcer){ const o0=STORY.ceremonyY1; STORY.ceremonyY1=function(GM){ return S.open(GM,o0); }; STORY._gymcer=true; }
  return S;
})();
if(typeof window!=='undefined') window.GYMCER=GYMCER;
