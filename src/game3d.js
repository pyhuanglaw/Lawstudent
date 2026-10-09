/* ===== 遊戲層：狀態、時間、UI、互動、對話演出、鏡頭運鏡、存檔 ===== */
'use strict';
const GAME = (function(){
  const SAVE_VER=2; const KEY_AUTO='fatiao3d_auto', KEY_SLOT='fatiao3d_slot_', KEY_BACKUP='fatiao3d_backup', KEY_SET='fatiao3d_settings';
  const WEEK=['週日','週一','週二','週三','週四','週五','週六'];
  const $=id=>document.getElementById(id);
  let E=null; let G=null; let S={quality:'medium',joystick:true,volume:0.6,textSpeed:2,fps:false};
  const GM={E:null,G:null,S,npc:{},extras:[],running:false,hourRate:1/150,lastAuto:0};
  // ---------- 狀態 ----------
  function defaults(name){ return {v:SAVE_VER,name:name||'祐廷',day:1,weekday:3,hour:21.2,energy:72,money:1800,zone:'dorm',pos:null,weather:'clear',flags:{},rel:{an:6,zhe:12,sis:2,kai:8,yu:3},notes:[],memo:[],visited:{dorm:true},stats:{steps:0,classes:0,study:0},choices:{},social:null,events:null,legal:null,cg:{unlocked:[]},savedAt:0}; }
  function bindSystems(){ SOCIAL.bind(G); EVENTS.bind(GM); LEGAL.bind(G,GM); if(!G.cg) G.cg={unlocked:[]}; }
  GM.bindSystems=bindSystems;
  GM.defaults=defaults;
  // ---------- 小工具 ----------
  const sleep=ms=>new Promise(r=>setTimeout(r,GM.turbo?Math.min(ms,120):ms));
  GM.sleep=sleep;
  function fmtTime(h){ const hh=Math.floor(h%24), mm=Math.floor((h%1)*60); return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm; }
  GM.fmtTime=fmtTime;
  function toast(t,ms){ const el=$('toast'); el.textContent=t; el.classList.remove('hide'); el.style.opacity=1; clearTimeout(toast.t); toast.t=setTimeout(()=>{ el.style.opacity=0; setTimeout(()=>el.classList.add('hide'),300); },ms||2200); }
  GM.toast=toast;
  function setGoal(t){ G.goal=t; $('goal').textContent='目標：'+t; }
  GM.setGoal=setGoal;
  function addNote(id,title,body){ if(G.notes.find(n=>n.id===id)) return false; G.notes.push({id,title,body,day:G.day}); toast('📓 筆記：'+title); A3.blip('page'); return true; }
  GM.addNote=addNote; GM.hasNote=id=>!!G.notes.find(n=>n.id===id);
  function memo(text){ G.memo.push({day:G.day,t:text}); }
  GM.memo=memo;
  function rel(id,d){ G.rel[id]=Math.max(0,Math.min(100,(G.rel[id]||0)+d)); if(d>0) toast('❤ 和'+(NPCNAME[id]||id)+'的關係 +'+d); }
  GM.rel=rel;
  const NPCNAME={an:'小安',zhe:'阿哲',sis:'溫學姊',kai:'阿凱',yu:'小語',prof:'周教授'}; GM.NPCNAME=NPCNAME;
  function energy(d){ G.energy=Math.max(0,Math.min(100,G.energy+d)); updateHUD(); }
  GM.energy=energy;
  function money(d){ G.money+=d; updateHUD(); if(d<0) toast('💸 '+(-d)+' 元'); }
  GM.money=money;
  function advance(hours){ G.hour+=hours; E.hour=G.hour; E.applyTime(G.hour); updateHUD(); A3.setScene(G.zone,G.hour,G.weather); }
  GM.advance=advance;
  // ---------- HUD ----------
  function updateHUD(){ if(!G) return; $('clockT').textContent=WEEK[G.weekday]+' '+fmtTime(G.hour); const zn=Z3.ZONES[G.zone]?Z3.ZONES[G.zone].name:G.zone; $('clockZ').textContent=zn; $('clockW').textContent=G.weather==='rain'?'🌧':(G.weather==='cloudy'?'☁':(G.hour%24>=18.5||G.hour%24<5.5?'🌙':'☀')); $('energy').firstElementChild.style.width=G.energy+'%'; $('money').textContent='$'+G.money; }
  GM.updateHUD=updateHUD;
  function fade(on){ const f=$('fade'); f.classList.toggle('on',on); return sleep(on?480:500); }
  GM.fade=fade;
  function letterbox(on){ const h=on?'8%':'0'; $('letterT').style.height=h; $('letterB').style.height=h; }
  GM.letterbox=letterbox;
  function titleCard(text,sub,ms){ const el=$('title3'); el.innerHTML=text+(sub?'<small>'+sub+'</small>':''); el.style.opacity=1; return sleep(ms||2200).then(()=>{ el.style.opacity=0; }); }
  GM.titleCard=titleCard;
  function hideHUD(on){ $('hud').style.opacity=on?0:1; $('hudR').style.opacity=on?0:1; $('minimap').style.opacity=on?0:1; $('ctlR').style.opacity=on?0:1; $('joy').style.opacity=(on||!S.joystick)?0:1; $('ctlR').style.pointerEvents=on?'none':'auto'; $('joy').style.pointerEvents=(on||!S.joystick)?'none':'auto'; }
  GM.hideHUD=hideHUD;
  // ---------- 對話 ----------
  const D={active:false,resolve:null,typing:false,full:'',shown:0,timer:0,busyDepth:0};
  GM.D=D;
  function subst(t){ return t.replace(/\{name\}/g,G.name); }
  function say(who,text,opts){ opts=opts||{}; return new Promise(res=>{ D.active=true; D.resolve=res; const box=$('dlg'); box.classList.remove('hide'); $('dlgName').textContent=who?(who.name||who):''; $('dlgName').style.display=who?'block':'none'; D.full=subst(text); D.shown=0; D.typing=true; $('dlgText').textContent=''; $('dlgNext').style.visibility='hidden'; const spd=S.textSpeed>=9?9999:(S.textSpeed===1?18:(S.textSpeed===2?32:60)); D.cps=spd; // 說話者姿態與表情
      if(who&&who.obj){ if(opts.expr) CHAR.setExpr(who.obj,opts.expr); if(who.pose!=='sit'&&who.pose!=='read'&&!opts.keepPose){ who.pose='talk'; who._talkPose=true; } if(E.player&&who.obj!==E.player.obj) who.lookAt=E.player.obj.position; }
      if(opts.me&&E.player){ E.player.pose='talk'; }
      if(typeof ADV!=='undefined'&&ADV.active){ const EXPR={normal:'neutral',smile:'smile',laugh:'laugh',surprise:'surprised',worried:'sad',shy:'embarrassed'}; if(who&&who.charId) ADV.speaker(who.charId,opts.expr?EXPR[opts.expr]:undefined); else ADV.speaker(null); ADV.log(who?(who.name||''):'',D.full); }
      D.who=who; }); }
  GM.say=say;
  function dlgTick(dt){ if(!D.active||!D.typing) return; D.shown+=dt*D.cps; const n=Math.min(D.full.length,Math.floor(D.shown)); $('dlgText').textContent=D.full.slice(0,n); if(n>=D.full.length){ D.typing=false; $('dlgNext').style.visibility='visible'; } }
  function dlgAdvance(){ if(!D.active) return false; if(D.typing){ D.typing=false; $('dlgText').textContent=D.full; $('dlgNext').style.visibility='visible'; return true; } const r=D.resolve; D.resolve=null; D.active=false; D.endedAt=performance.now(); $('dlg').classList.add('hide'); const who=D.who; if(who&&who.obj&&who._talkPose){ who.pose=who.idlePose||'idle'; who._talkPose=false; } if(E.player&&E.player.pose==='talk') E.player.pose='idle'; A3.blip('page'); if(r) r(); return true; }
  GM.dlgAdvance=dlgAdvance;
  // 選項出現時，把上一句對話（通常就是問題）留在畫面上，選項排在對話框上方
  function choose(options){ return new Promise(res=>{ const box=$('choices'); box.innerHTML=''; box.classList.remove('hide'); const dlg=$('dlg'); const keep=!!D.full&&!D.active&&(performance.now()-(D.endedAt||0))<1500; if(keep){ dlg.classList.remove('hide'); $('dlgText').textContent=D.full; $('dlgNext').style.visibility='hidden'; dlg.classList.add('static'); box.style.bottom='calc(max(14px,env(safe-area-inset-bottom)) + '+(dlg.offsetHeight+22)+'px)'; }
    const done=(i)=>{ box.classList.add('hide'); box.innerHTML=''; box.style.bottom=''; if(keep){ dlg.classList.add('hide'); dlg.classList.remove('static'); } A3.blip('ok'); res(i); };
    options.forEach((o,i)=>{ if(o.hidden) return; const b=document.createElement('button'); b.innerHTML=subst(o.t)+(o.hint?'<div class="hint">'+o.hint+'</div>':''); if(o.dim) b.classList.add('dim'); b.onclick=()=>done(i); box.appendChild(b); }); }); }
  GM.choose=choose;
  function caption(who,text,ms){ const el=$('caption'); el.innerHTML=(who?'<b>'+who+'</b>':'')+subst(text); el.classList.remove('hide'); el.style.opacity=1; clearTimeout(caption.t); caption.t=setTimeout(()=>{ el.style.opacity=0; setTimeout(()=>el.classList.add('hide'),300); },ms||3200); }
  GM.caption=caption;
  // 場景開始／結束：鎖住玩家
  function sceneBegin(opts){ D.busyDepth++; E.player.busy=true; E.player.path=null; E.player.target=null; hideHUD(true); $('interact').classList.add('hide'); if(opts&&opts.adv&&typeof ADV!=='undefined'){ ADV.begin({background:opts.background||'blur',right:opts.adv,left:opts.advLeft}); } }
  function sceneEnd(){ D.busyDepth=Math.max(0,D.busyDepth-1); if(D.busyDepth===0){ E.player.busy=false; hideHUD(false); E.endCinematic(); letterbox(false); if(E.player.pose==='talk') E.player.pose='idle'; if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); } }
  GM.sceneBegin=sceneBegin; GM.sceneEnd=sceneEnd;
  // ---------- 運鏡 ----------
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  function headOf(o){ return V(o.position.x,CHAR.headY(o),o.position.z); }
  function fwd(o){ return V(Math.sin(o.rotation.y),0,Math.cos(o.rotation.y)); }
  function cine(kind,A,B,opt){ opt=opt||{}; A=A||E.player.obj; B=B||A; const ha=headOf(A), hb=headOf(B); const mid=ha.clone().add(hb).multiplyScalar(0.5); const dir=hb.clone().sub(ha); dir.y=0; const d=Math.max(0.01,dir.length()); dir.normalize(); const side=V(-dir.z,0,dir.x); if(opt.flip) side.negate(); let pos,look;
    if(kind==='ots'){ pos=ha.clone().addScaledVector(dir,-1.3).addScaledVector(side,0.7); pos.y=ha.y+0.25; look=hb.clone(); look.y-=0.02; if(E.indoor&&E.zone.bounds){ const b=E.zone.bounds; const alt=ha.clone().addScaledVector(dir,-1.05).addScaledVector(side,-0.55); alt.y=pos.y; const room=p=>Math.min(b.w/2-Math.abs(p.x),b.d/2-Math.abs(p.z)); if(room(alt)>room(pos)+0.3) pos=alt; } }
    else if(kind==='close'){ pos=hb.clone().addScaledVector(dir,-1.25).addScaledVector(side,0.25); pos.y=hb.y+0.06; look=hb.clone(); look.y-=0.04; }
    else if(kind==='two'){ const dist=Math.max(2.3,d*1.25); pos=mid.clone().addScaledVector(side,dist); pos.y=mid.y+0.12; look=mid.clone(); look.y-=0.12; if(E.indoor&&E.zone.bounds&&!opt.flip){ const b=E.zone.bounds; const alt=mid.clone().addScaledVector(side,-dist); const room=p=>Math.min(b.w/2-Math.abs(p.x),b.d/2-Math.abs(p.z)); if(room(alt)>room(pos)) pos=alt; } }
    else if(kind==='low'){ pos=mid.clone().addScaledVector(side,Math.max(2.2,d*1.3)).addScaledVector(dir,-0.6); pos.y=0.8; look=mid.clone(); look.y-=0.2; }
    else if(kind==='wide'){ pos=mid.clone().addScaledVector(side,6).addScaledVector(dir,-2); pos.y=mid.y+2.2; look=mid.clone(); }
    else if(kind==='front'){ const f=fwd(A); pos=ha.clone().addScaledVector(f,2.6); pos.y=ha.y+0.15; look=ha.clone(); look.y-=0.1; }
    else if(kind==='sky'){ const f=fwd(A); pos=ha.clone().addScaledVector(f,-2.5).addScaledVector(side,1); pos.y=ha.y+0.6; look=ha.clone().addScaledVector(f,6); look.y=ha.y+3; }
    if(opt.pos) pos=opt.pos; if(opt.look) look=opt.look; if(E.indoor&&E.zone.bounds){ const b=E.zone.bounds; pos.x=Math.max(-b.w/2+0.35,Math.min(b.w/2-0.35,pos.x)); pos.z=Math.max(-b.d/2+0.35,Math.min(b.d/2-0.35,pos.z)); pos.y=Math.min(pos.y,3.0); } E.cinematic(pos,look); if(opt.snap){ E.camera.position.copy(pos); E.cam.look=look.clone(); } }
  GM.cine=cine;
  // ---------- 移動輔助 ----------
  function walkTo(ent,x,z,opts){ opts=opts||{}; return new Promise(res=>{ if(GM.turbo){ ent.obj.position.set(x,0,z); ent.path=null; res(true); return; } ent.run=!!opts.run; const ok=E.moveTo(ent,x,z,()=>res(true)); if(!ok){ ent.obj.position.set(x,0,z); res(false); } }); }
  GM.walkTo=walkTo;
  function face(ent,x,z){ const o=ent.obj||ent; o.rotation.y=Math.atan2(x-o.position.x,z-o.position.z); }
  GM.face=face;
  function sitAt(ent,seat){ const o=ent.obj; o.position.set(seat.x,0,seat.z); o.rotation.y=seat.yaw||0; ent.pose='sit'; ent.idlePose='sit'; ent.path=null; ent.frozen=true; ent.seat=seat; }
  // 起身：放到椅子旁「半徑 0.3 也站得住」的位置（側邊 → 另一側 → 前方 → 後方，距離 0.75/1.0/1.3），都不行就找最近合法格；否則會發生「有走路動畫但走不動」
  function standUp(ent){ ent.pose='idle'; ent.idlePose='idle'; ent.frozen=false; const s=ent.seat; if(s){ const o=ent.obj; const yaw=s.yaw||0; const r=ent.radius||0.3; const ok=(x,z)=>!E.nav||E.canStand(x,z,r); const dirs=[[Math.cos(yaw),-Math.sin(yaw)],[-Math.cos(yaw),Math.sin(yaw)],[Math.sin(yaw),Math.cos(yaw)],[-Math.sin(yaw),-Math.cos(yaw)]]; let best=null; for(const d of [0.75,1.0,1.3]){ for(const [dx,dz] of dirs){ const nx=s.x+dx*d, nz=s.z+dz*d; if(ok(nx,nz)){ best=[nx,nz]; break; } } if(best) break; } if(!best&&E.nav){ o.position.set(s.x,0,s.z); if(E.unstick(ent,12)) best=[o.position.x,o.position.z]; } if(!best) best=[s.x+Math.cos(yaw)*0.75,s.z-Math.sin(yaw)*0.75]; o.position.x=best[0]; o.position.z=best[1]; } ent.seat=null; }
  GM.sitAt=sitAt; GM.standUp=standUp;
  // ---------- NPC ----------
  function spawnNPC(id,spec,x,z,opts){ opts=opts||{}; const o=CHAR.build(spec); o.position.set(x,0,z); o.rotation.y=opts.yaw||0; const CID={an:'heroine_01',sis:'heroine_05',prof:'prof_zhou'}; const n=E.addNPC(Object.assign({obj:o,id,charId:opts.charId||CID[id]||id,name:spec.name||NPCNAME[id]||id,beh:opts.beh||'idle',waypoints:opts.waypoints,talk:opts.talk,talkLabel:opts.talkLabel,pockets:opts.pockets,walkSpeed:opts.walkSpeed,pauseAt:opts.pauseAt!==false,idlePose:'idle',greet:opts.greet!==undefined?opts.greet:!!(G&&(G.flags['met_'+id]||(STORY.people&&STORY.people[id]&&STORY.people[id].known)))},opts.extra||{})); if(opts.seat) sitAt(n,opts.seat); if(opts.pose){ n.pose=opts.pose; n.idlePose=opts.pose; } if(opts.expr) CHAR.setExpr(o,opts.expr); GM.npc[id]=n; return n; }
  GM.spawnNPC=spawnNPC;
  // 由 CHARACTERS 資料生成（3D 模型由 char3d 決定；未來換 GLB 只改資料）
  function spawnCharacter(id,x,z,opts){ opts=opts||{}; const c=CHARACTERS[id]; if(!c) return null; if(GM.npc[id]) return GM.npc[id]; let spec=null; if(c.char3d&&c.char3d.spec){ if(typeof c.char3d.spec==='string'){ const base=P3.CAST[c.char3d.spec]||(c.char3d.spec==='prof'?(c.id==='prof_zhou'?STORY.PROF:STORY.profSpec(c)):null); spec=base?Object.assign({},base):STORY.extraSpec(7); } else spec=Object.assign({},c.char3d.spec); } else if(c.char3d&&c.char3d.extra!==undefined){ spec=STORY.extraSpec(c.char3d.extra+40); } else spec=STORY.extraSpec(7); spec.name=c.name; if(c.char3d&&c.char3d.model) spec.model=c.char3d.model; if(c.char3d&&c.char3d.height) spec.height=c.char3d.height; else if(c.height_cm) spec.height=c.height_cm/100; const n=spawnNPC(id,spec,x,z,Object.assign({charId:id,talk:(nn)=>STORY.talkCharacter(id,nn),talkLabel:'和'+SOCIAL.displayName(id)+'說話',greet:SOCIAL.stage(id)!=='STRANGER'},opts)); n.name=SOCIAL.displayName(id); n.charId=id; n.tier=c.visual_tier; SOCIAL.noticed(id); return n; }
  GM.spawnCharacter=spawnCharacter;
  GM.despawnLater=function(n,sec){ setTimeout(()=>{ if(E.npcs.includes(n)){ E.removeNPC(n); for(const k in GM.npc) if(GM.npc[k]===n) delete GM.npc[k]; } },(sec||20)*1000); };
  function removeNPC(id){ const n=GM.npc[id]; if(n){ E.removeNPC(n); delete GM.npc[id]; } }
  GM.removeNPC=removeNPC;
  // 路人（含騎腳踏車）
  function spawnExtra(spec,route,opts){ opts=opts||{}; const o=CHAR.build(spec); if(opts.bike){ const b=W3.bike(['#3a6fb0','#8c3b47','#2f5d50','#e0b95b'][(Math.random()*4)|0]); b.position.set(0.55,0,0.1); o.add(b); } const n=E.addNPC({obj:o,name:'',beh:'route',waypoints:route,ri:(Math.random()*route.length)|0,walkSpeed:opts.bike?1.0:1.2+Math.random()*0.4,pauseAt:false,idlePose:'idle',isExtra:true}); const wp=route[n.ri]; o.position.set(wp[0],0,wp[1]); if(opts.pockets) n.pockets=true; return n; }
  GM.spawnExtra=spawnExtra;
  function spawnRider(spec,route,color){ const g=new THREE.Group(); const bike=W3.bike(color||'#3a6fb0'); bike.rotation.y=0; g.add(bike); const o=CHAR.build(spec); o.position.set(0,0.36,-0.1); g.add(o); o.userData.anim.pose='sit'; g.position.set(route[0][0],0,route[0][1]); E.scene.add(g); const x={obj:g,rider:o,route,ri:0,speed:4.2+Math.random()*1.2,t:0,update(dt){ const a=route[this.ri], b=route[(this.ri+1)%route.length]; const dx=b[0]-a[0], dz=b[1]-a[1]; const len=Math.hypot(dx,dz); this.t+=dt*this.speed/len; if(this.t>=1){ this.t=0; this.ri=(this.ri+1)%route.length; return; } g.position.set(a[0]+dx*this.t,0,a[1]+dz*this.t); g.rotation.y=Math.atan2(dx,dz); g.rotation.z=Math.sin(E.time*6)*0.015; CHAR.animate(o,dt,{pose:'sit',speed:0}); const P=o.userData.parts; if(P&&P.L&&P.L.knee){ const c=Math.sin(E.time*7); P.L.knee.rotation.x=1.2+c*0.35; P.R.knee.rotation.x=1.2-c*0.35; P.L.hip.rotation.x=-1.3+c*0.25; P.R.hip.rotation.x=-1.3-c*0.25; } } }; E.addExtra(x); GM.extras.push(x); return x; }
  GM.spawnRider=spawnRider;
  // ---------- 區域進入 ----------
  let entering=false;
  async function enter(zoneId,spawn,opts){ opts=opts||{}; if(entering) return; entering=true; if(!opts.noFade) await fade(true); GM.npc={}; GM.extras=[]; const z=E.loadZone(Z3.ZONES[zoneId],spawn); G.zone=zoneId; G.visited[zoneId]=true; E.player.path=null; E.player.pose='idle'; E.player.frozen=false; E.player.seat=null; E.player.idlePose='idle'; if(STORY.populate) STORY.populate(zoneId,GM); buildMinimap(); updateHUD(); A3.setScene(zoneId,G.hour,G.weather); E.update(0.016); E.render(); if(!opts.noFade){ await fade(false); } entering=false; if(STORY.onEnter) STORY.onEnter(zoneId,GM,opts); autosave(); return z; }
  GM.enter=enter;
  // ---------- 小地圖 ----------
  let mmImg=null;
  function buildMinimap(){ const nav=E.nav; const mm=$('minimap'); if(!nav||E.indoor){ mm.style.display='none'; mmImg=null; return; } mm.style.display='block'; const c=document.createElement('canvas'); c.width=nav.cols; c.height=nav.rows; const x=c.getContext('2d'); const img=x.createImageData(nav.cols,nav.rows); for(let i=0;i<nav.cols*nav.rows;i++){ const b=nav.b[i]; img.data[i*4]=b?70:150; img.data[i*4+1]=b?80:170; img.data[i*4+2]=b?95:140; img.data[i*4+3]=b?200:120; } x.putImageData(img,0,0); mmImg=c; }
  function drawMinimap(){ if(!mmImg||E.indoor) return; const mm=$('minimap'); const x=mm.getContext('2d'); x.clearRect(0,0,mm.width,mm.height); const nav=E.nav; const P=E.player.obj.position; const scale=2.2; const [cx,cz]=nav.toCell(P.x,P.z); x.save(); x.translate(mm.width/2,mm.height/2); x.rotate(-E.cam.yaw+Math.PI); x.drawImage(mmImg,-cx*scale,-cz*scale,nav.cols*scale,nav.rows*scale); for(const n of E.npcs){ if(n.isExtra) continue; const [nx,nz]=nav.toCell(n.obj.position.x,n.obj.position.z); x.fillStyle='#e9b96a'; x.beginPath(); x.arc((nx-cx)*scale,(nz-cz)*scale,3,0,7); x.fill(); } for(const it of E.interactables){ if(!it.exit) continue; const [nx,nz]=nav.toCell(it.x,it.z); x.fillStyle='#7fc4c9'; x.fillRect((nx-cx)*scale-2,(nz-cz)*scale-2,4,4); } x.restore(); x.fillStyle='#fff'; x.beginPath(); x.arc(mm.width/2,mm.height/2,3.5,0,7); x.fill(); }
  // ---------- 互動 ----------
  let nearIt=null;
  function updateInteract(){ const btn=$('interact'); if(E.player.busy||D.active||menuOpen){ btn.classList.add('hide'); nearIt=null; return; } const it=E.nearestInteractable(); if(it&&it!==nearIt){ $('interactLabel').textContent=it.label||'互動'; } nearIt=it; btn.classList.toggle('hide',!it); }
  async function doInteract(){ updateInteract(); const it=nearIt; if(!it) return; if(it.onInteract){ it.onInteract(it); return; } if(STORY.interact&&await STORY.interact(it,GM)) return; if(it.look){ caption('',it.look,4600); return; } if(it.exit){ if(it.exit.locked){ toast(it.exit.locked); return; } await enter(it.exit.to,it.exit.spawn); return; } if(it.seat){ await seatMenu(it); return; } toast('（這裡現在沒有事可做）'); }
  GM.doInteract=doInteract; GM.updateInteract=updateInteract; GM.snapshot=snapshot;
  async function seatMenu(it){ const P=E.player; sceneBegin(); await walkTo(P,it.seat.x+Math.sin(it.seat.yaw||0)*0.5,it.seat.z+Math.cos(it.seat.yaw||0)*0.5); sitAt(P,it.seat); E.cam.distTarget=Math.min(E.cam.distTarget,4.2); await sleep(400); const opts=[{t:'坐一下，看看四周',hint:'體力 +5，時間 +20 分鐘'}]; if(it.study||it.deskStudy) opts.push({t:'讀書（1 小時）',hint:'體力 −8。整理筆記，之後上課用得到'}); if(it.cafeTable) opts.push({t:'點杯咖啡慢慢讀（1 小時）',hint:'120 元，體力 −3'}); opts.push({t:'起身'}); const i=await choose(opts); const o=opts[i].t; if(o.startsWith('坐一下')){ P.pose='sit'; await sleep(600); advance(1/3); energy(5); caption('',['風從椰林大道那頭吹過來。','遠處有人在笑。','你看著來來去去的人，想著今天還要做什麼。'][(Math.random()*3)|0],2600); await sleep(1200); } else if(o.startsWith('讀書')){ P.pose='read'; P.idlePose='read'; await studySession(); } else if(o.startsWith('點杯')){ if(G.money<120){ toast('錢不夠'); } else { money(-120); P.pose='read'; P.idlePose='read'; energy(-3); await studySession(true); } } standUp(P); sceneEnd(); }
  // 研究所準備：學姊給的文章要讀三次（讀書時可選），讀完進入 PREPARING
  async function gradReadingSession(){ const g=G.social.grad; g.prep=(g.prep||0)+1; const n=g.prep; if(n===1) await say(null,'你翻開學姊給的那篇文章。前十頁在講一個你以為自己懂的概念，讀到第三次才發現原來不懂。你照她說的，用鉛筆在旁邊寫「不同意」。');
    else if(n===2) await say(null,'第二次讀。中段的論證繞了一大圈，你開始看得出作者在哪裡「跳」過去。鉛筆字變多了。');
    else { await say(null,'第三次。你讀完最後一頁，合上文章，發現自己已經在想「如果是我會怎麼寫」。這大概就是學姊說的那個時刻。'); G.flags.grad_read_done=true; if(SOCIAL.GRAD.indexOf(g.interest)<SOCIAL.GRAD.indexOf('PREPARING')) SOCIAL.gradSet('PREPARING',g.field||'公法'); toast('研究所路線：開始準備'); GM.memo('讀完學姊給的文章'); } }
  async function studySession(cafe){ const before=G.hour; await fade(true); advance(1); if(!cafe) energy(-8); G.stats.study++;
    if(G.flags.grad_reading&&!G.flags.grad_read_done&&G.social){ await fade(false); const k=await choose([{t:'讀學姊給的那篇文章',hint:'研究所準備（'+((G.social.grad.prep||0))+'/3）'},{t:'讀這週的進度'}]); if(k===0){ await gradReadingSession(); if(G.energy<20) toast('你有點累了'); return; } await fade(true); } const topics=STORY.studyTopics?STORY.studyTopics(GM):[]; const t=topics.find(x=>!GM.hasNote(x.id)); await fade(false); const studied=(typeof LEGAL!=='undefined'&&G.legal)?LEGAL.study():[]; if(studied.length){ for(const q of studied){ await say(null,'你回頭看了讀書會／上課時卡住的地方：「'+q.q.replace(/。$/,'')+'」——'+(q.core?q.core:'答案是「'+(q.type==='tf'?q.answer:q.answer+'、'+q.options[q.answer])+'」')+'。這次應該懂了。'); } } else if(t){ addNote(t.id,t.title,t.body); await say(null,t.read||('你花了一小時讀'+t.title+'。'+t.body)); } else { await say(null,'你把這週的筆記重新整理了一遍。沒有新的東西，但腦袋清楚了一些。'); } if(G.energy<20) toast('你有點累了'); }
  GM.studySession=studySession;
  // ---------- 存檔 ----------
  function snapshot(){ const P=E.player.obj.position; return Object.assign({},G,{pos:{x:+P.x.toFixed(2),z:+P.z.toFixed(2),yaw:+E.player.obj.rotation.y.toFixed(3)},hour:+G.hour.toFixed(3),savedAt:Date.now(),v:SAVE_VER}); }
  function validate(s){ if(!s||typeof s!=='object') return '不是有效的存檔物件'; if(typeof s.v!=='number') return '缺少版本欄位'; if(s.v>SAVE_VER) return '存檔來自較新的版本（v'+s.v+'），本版無法讀取'; if(typeof s.day!=='number'||typeof s.hour!=='number') return '日期／時間欄位損毀'; if(!Z3.ZONES[s.zone]) return '未知的地點：'+s.zone; if(!s.flags||typeof s.flags!=='object') return '旗標欄位損毀'; return null; }
  function migrate(s){ const d=defaults(s.name); for(const k in d){ if(s[k]===undefined||s[k]===null) s[k]=d[k]; } for(const k in d.rel){ if(s.rel[k]===undefined) s.rel[k]=d.rel[k]; } if(s.v<2){ s.social=null; s.events=null; s.legal=null; } s.v=SAVE_VER; return s; }
  function ls(){ try{ return window.localStorage; }catch(e){ return null; } }
  function write(key,obj){ const st=ls(); if(!st) return false; try{ st.setItem(key,JSON.stringify(obj)); return true; }catch(e){ return false; } }
  function read(key){ const st=ls(); if(!st) return null; try{ const t=st.getItem(key); return t?JSON.parse(t):null; }catch(e){ return null; } }
  function autosave(){ if(!G||!E.player||D.busyDepth>0||GM.titleIdle) return; /* 標題畫面（還沒開始或讀檔）不能自動存檔：否則會用空白的第一天蓋掉玩家真正的進度 */ write(KEY_AUTO,snapshot()); GM.lastAuto=performance.now(); }
  GM.autosave=autosave;
  function saveSlot(i){ const prev=read(KEY_SLOT+i); if(prev) write(KEY_BACKUP,prev); const ok=write(KEY_SLOT+i,snapshot()); toast(ok?'已存到欄位 '+i:'存檔失敗（瀏覽器儲存不可用）'); renderSlots(); }
  async function applySave(s){ const err=validate(s); if(err) throw new Error(err); s=migrate(JSON.parse(JSON.stringify(s))); G=s; GM.G=G; bindSystems(); E.player.busy=false; E.endCinematic(); D.busyDepth=0; GM.titleIdle=false; hideHUD(false); GM.running=true; E.hour=G.hour; E.weather=G.weather; E.setWeather(G.weather); const sp=G.pos?{x:G.pos.x,z:G.pos.z,yaw:G.pos.yaw}:undefined; await enter(G.zone,sp,{fromLoad:true}); setGoal(G.goal||'—'); updateHUD(); if(G.flags.companion==='an'&&STORY.resumeWalk) STORY.resumeWalk(GM); }
  GM.applySave=applySave;
  function exportText(){ return btoa(unescape(encodeURIComponent(JSON.stringify(snapshot())))); }
  function parseImport(t){ t=t.trim(); let obj=null; try{ obj=JSON.parse(t); }catch(e){ try{ obj=JSON.parse(decodeURIComponent(escape(atob(t)))); }catch(e2){ throw new Error('無法解析：不是 JSON 也不是匯出的文字格式'); } } const err=validate(obj); if(err) throw new Error(err); return obj; }
  GM.parseImport=parseImport; GM.exportText=exportText;
  function renderSlots(){ const box=$('saveSlots'); box.innerHTML=''; const auto=read(KEY_AUTO); const mk=(label,s,onSave,onLoad)=>{ const d=document.createElement('div'); d.className='item'; d.innerHTML='<b>'+label+'</b> '+(s?('第 '+s.day+' 天 '+fmtTime(s.hour)+' · '+(Z3.ZONES[s.zone]?Z3.ZONES[s.zone].name:s.zone)+' · '+s.name+'<div class="muted">'+new Date(s.savedAt).toLocaleString()+'</div>'):'<span class="muted">（空）</span>'); const row=document.createElement('div'); row.className='row2'; row.style.marginTop='8px'; if(onSave){ const b=document.createElement('button'); b.className='btn'; b.textContent='存檔'; b.onclick=onSave; row.appendChild(b); } if(s){ const b=document.createElement('button'); b.className='btn pri'; b.textContent='讀取'; b.onclick=onLoad; row.appendChild(b); } d.appendChild(row); box.appendChild(d); }; mk('自動存檔',auto,null,()=>loadFrom(auto)); for(let i=1;i<=3;i++){ const s=read(KEY_SLOT+i); mk('欄位 '+i,s,()=>saveSlot(i),()=>loadFrom(s)); } }
  async function loadFrom(s){ try{ closeMenu(); $('titleScreen').classList.add('hide'); await applySave(s); toast('已讀取'); }catch(e){ toast('讀取失敗：'+e.message,3500); } }
  // ---------- 選單 ----------
  let menuOpen=false;
  function openMenu(tab){ menuOpen=true; E.paused=true; $('menu').classList.remove('hide'); renderNotes(); renderPeople(); renderLegal(); renderMap(); renderSlots(); if(tab) switchTab(tab); }
  function closeMenu(){ menuOpen=false; E.paused=false; $('menu').classList.add('hide'); }
  GM.openMenu=openMenu; GM.closeMenu=closeMenu;
  function switchTab(t){ document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===t)); document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x.id==='tab-'+t)); $('menuTitle').textContent={notes:'筆記本',people:'人物',legal:'法律',map:'地圖',save:'存檔',settings:'設定',help:'說明'}[t]; }
  const GRAD_LABEL={NONE:null,CURIOUS:'有點好奇',CONSIDERING:'認真考慮中',PREPARING:'準備中',APPLYING:'報名了',ADMITTED:'錄取'};
  function renderNotes(){ const box=$('notesList'); box.innerHTML='';
    // 研究所路線（不是按鈕，是你這一年累積下來的東西）
    if(G.social&&G.social.grad&&GRAD_LABEL[G.social.grad.interest]){ const g=G.social.grad; const d=document.createElement('div'); d.className='item'; const log=(g.log||[]).slice(-4).map(l=>'<div class="muted">· 第 '+l.day+' 天：'+({event:'和人聊到研究所',study:'讀書會裡提到'}[l.reason]||l.reason)+'</div>').join(''); d.innerHTML='<b>法研所：'+GRAD_LABEL[g.interest]+(g.field?'（'+g.field+'）':'')+'</b>'+(G.flags.grad_reading?'<div>學姊給的文章：讀了 '+Math.min(3,g.prep||0)+'/3 次'+(G.flags.grad_read_done?'，讀完了':'')+'</div>':'')+log; box.appendChild(d); }
    if(!G.notes.length&&!G.memo.length){ box.innerHTML='<div class="muted">還沒有筆記。上課、讀書、和人聊天都會留下紀錄。</div>'; } for(const n of G.notes){ const d=document.createElement('div'); d.className='item'; d.innerHTML='<b>'+n.title+'</b><div>'+n.body+'</div><div class="muted">第 '+n.day+' 天</div>'; box.appendChild(d); } if(G.memo.length){ const d=document.createElement('div'); d.className='item'; d.innerHTML='<b>日誌</b>'+G.memo.slice(-8).map(m=>'<div>· 第 '+m.day+' 天：'+m.t+'</div>').join(''); box.appendChild(d); } }
  function renderPeople(){ const box=$('peopleList'); box.innerHTML=''; const ids=Object.keys(CHARACTERS).filter(id=>{ const c=CHARACTERS[id]; if(c.social_layer==='B') return SOCIAL.reveal(id)!=='UNKNOWN'; return SOCIAL.has(id,'FIRST_MET')||G.flags['met_'+id]||['zhe','kai','prof_zhou'].includes(id); }); if(!ids.length){ box.innerHTML='<div class="muted">還沒認識任何人。</div>'; }
    const order={D:0,A:1,C:2,F:3,E:4,B:5}; ids.sort((a,b)=>(order[CHARACTERS[a].social_layer]??9)-(order[CHARACTERS[b].social_layer]??9)); for(const id of ids){ const c=CHARACTERS[id]; const d=document.createElement('div'); d.className='item'; const name=SOCIAL.displayName(id); const tag=(c.department||'')+(c.year?'・'+(typeof c.year==='number'?['','一','二','三','四'][c.year]+'年級':c.year):'')+(c.course?'・'+c.course:''); const mems=SOCIAL.memories(id).slice(-5).map(m=>'<span class="muted">· 第 '+m.day+' 天 '+(SOCIAL.MEMORY_LABEL[m.tag]||m.tag)+(m.note?'（'+m.note+'）':'')+'</span>').join('<br>'); const rv=SOCIAL.reveal(id); const desc=(c.social_layer==='B'&&rv!=='FRIEND')?(rv==='ACQUAINTANCE'?(c.facts?c.facts[0]:''):''):(c.personality||''); d.innerHTML='<b>'+name+'</b> <span class="muted">'+tag+'</span><div>'+desc+'</div><div>'+SOCIAL.describe(id)+'</div>'+(mems?'<div style="margin-top:4px">'+mems+'</div>':''); box.appendChild(d); } }
  function renderLegal(){ const box=$('legalList'); if(!box) return; box.innerHTML=''; const sm=LEGAL.summary(); for(const sec in sm.bySec){ const b=sm.bySec[sec]; const d=document.createElement('div'); d.className='item'; d.innerHTML='<b>刑事訴訟法・'+sec+'</b><div class="muted">還沒遇到 '+b.unseen+' · 聽過 '+b.seen+' · 混淆 '+b.confused+' · 學到 '+b.learned+' · 理解 '+b.understood+' · 熟練 '+b.mastered+'（共 '+b.total+' 個爭點）</div>'; box.appendChild(d); } if(sm.misc.length){ const d=document.createElement('div'); d.className='item'; d.innerHTML='<b>你容易混淆的地方</b>'+sm.misc.map(m=>'<div>· '+m.label+'（'+m.n+' 次）</div>').join(''); box.appendChild(d); } const d2=document.createElement('div'); d2.className='item muted'; d2.textContent='這些爭點會在上課、讀書會、同學討論裡自然出現；讀書可以把混淆的地方讀懂。'; box.appendChild(d2); }
  function renderMap(){ const box=$('mapList'); box.innerHTML=''; const places=[['campus','台大校園（霖澤館前）',{x:34,z:-98,yaw:0}],['campus','椰林大道・傅鐘',{x:-32,z:-8,yaw:Math.PI}],['campus','校門口',{x:-112,z:0,yaw:-Math.PI/2}],['gongguan','公館商圈',{x:0,z:-30,yaw:Math.PI}],['wenzhou','溫州街',{x:20,z:0,yaw:-Math.PI/2}],['dorm','宿舍',{x:0,z:2.5,yaw:Math.PI}]]; for(const [z,label,sp] of places){ const d=document.createElement('div'); d.className='item row2'; d.style.justifyContent='space-between'; const ok=G.visited[z]; d.innerHTML='<span>'+label+'</span>'; const b=document.createElement('button'); b.className='btn'+(ok?' pri':''); b.textContent=ok?'前往':'尚未去過'; b.disabled=!ok; b.onclick=async()=>{ if(E.player.busy){ toast('現在不能移動'); return; } closeMenu(); advance(0.25); energy(-2); await enter(z,sp); }; d.appendChild(b); box.appendChild(d); } }
  // ---------- 設定 ----------
  function loadSettings(){ const s=read(KEY_SET); if(s) Object.assign(S,s); }
  function saveSettings(){ write(KEY_SET,S); }
  function applySettings(){ $('mdbg').style.display=(S.mdbg||/mdbg|debug/.test(location.search))?'block':'none'; if($('setMdbg')) $('setMdbg').checked=!!S.mdbg; E.setQuality(S.quality); $('joy').style.display=S.joystick?'block':'none'; A3.setVolume(S.volume); $('fps').style.display=S.fps?'block':'none'; $('setQuality').value=S.quality; $('setJoy').checked=S.joystick; $('setVol').value=S.volume; $('setSpeed').value=S.textSpeed; $('setFps').checked=S.fps; $('setGlb').checked=S.glbChar!==false; }
  // ---------- 搖桿 ----------
  function setupJoystick(){ const joy=$('joy'); const knob=joy.firstElementChild; let pid=null, cx=0, cy=0; const R=44; joy.addEventListener('pointerdown',e=>{ if(E.player.busy) return; pid=e.pointerId; try{ joy.setPointerCapture(pid); }catch(err){} const r=joy.getBoundingClientRect(); cx=r.left+r.width/2; cy=r.top+r.height/2; move(e); }); const move=e=>{ if(e.pointerId!==pid) return; let dx=e.clientX-cx, dy=e.clientY-cy; const d=Math.hypot(dx,dy); const m=Math.min(1,d/R); if(d>0){ dx/=d; dy/=d; } knob.style.transform='translate('+(dx*m*R)+'px,'+(dy*m*R)+'px)'; E.input.joy.x=dx*m; E.input.joy.y=dy*m; E.input.joy.active=m>0.15; E.input.joy.run=m>0.92; }; joy.addEventListener('pointermove',move); const up=e=>{ if(e.pointerId!==pid) return; pid=null; knob.style.transform=''; E.input.joy.active=false; E.input.joy.x=0; E.input.joy.y=0; E.input.joy.run=false; }; joy.addEventListener('pointerup',up); joy.addEventListener('pointercancel',up); }
  // ---------- 主迴圈 ----------
  let last=0, fpsAcc=0, fpsN=0, stepAcc=0; GM.fps=0;
  // TEMP MOVEMENT DEBUG TELEMETRY（設定可開；?mdbg 也可）：找「input 不是 0、動畫在跑、但位置不動」的原因用
  const tele={lx:0,lz:0,lt:0}; function movementTelemetry(dt){ const P=E.player; if(!P) return; const o=P.obj.position; const now=performance.now(); const el=Math.max(0.001,(now-tele.lt)/1000); const vx=(o.x-tele.lx)/el, vz=(o.z-tele.lz)/el; tele.lx=o.x; tele.lz=o.z; tele.lt=now; const inp=E.input; const keys=Object.keys(inp.keys).filter(k=>inp.keys[k]).join(''); const model=P.obj.userData&&P.obj.userData.model; const locked=P.busy||D.active||menuOpen||E.cam.mode!=='follow'||(typeof EVENTS!=='undefined'&&!!EVENTS.running); const cs=E.canStand?E.canStand(o.x,o.z,P.radius||0.3):true; const sc=E.freeScore?E.freeScore(o.x,o.z,P.radius||0.3):5; const b=P.blockedAt; const sp=E.lastSpawn||{};
    $('mdbg').textContent='INPUT  joy=('+inp.joy.x.toFixed(2)+','+inp.joy.y.toFixed(2)+') active='+inp.joy.active+' run='+(inp.joy.run||inp.runToggle||!!P.runHold)+' keys='+(keys||'-')+'\nVEL    ('+vx.toFixed(2)+', 0, '+vz.toFixed(2)+') m/s  speed='+(P.speed||0).toFixed(2)+'\nPOS    controller ('+o.x.toFixed(2)+', '+o.y.toFixed(2)+', '+o.z.toFixed(2)+')\nVISUAL model local ('+(model?model.position.x.toFixed(2)+', '+model.position.y.toFixed(2)+', '+model.position.z.toFixed(2):'-')+') driver='+(P.obj.userData&&P.obj.userData.driver)+'\nLOCKED '+locked+'  busy='+P.busy+' dlg='+D.active+' menu='+menuOpen+' cam='+E.cam.mode+' event='+((typeof EVENTS!=='undefined'&&EVENTS.running)||'-')+' adv='+(typeof ADV!=='undefined'&&ADV.active)+'\nSTATE  pose='+P.pose+' seat='+(P.seat?'yes':'no')+' frozen='+!!P.frozen+' path='+(P.path?P.path.length:'-')+' zone='+G.zone+'\nCOLL   standable='+cs+' score='+sc+'/5'+(b?' BLOCKED→('+b.x.toFixed(2)+','+b.z.toFixed(2)+') slide='+b.slide:' none')+'\nSPAWN  '+(sp.zone||'-')+' ('+sp.x+', '+sp.z+')'+(sp.fixed&&(sp.fixed[0]!==sp.x||sp.fixed[1]!==sp.z)?' → moved to ('+sp.fixed[0]+','+sp.fixed[1]+')':'')+'\nFPS    '+GM.fps.toFixed(0); }
  function frame(now){ requestAnimationFrame(frame); if(!GM.running) return; const realDt=(now-last)/1000||0.016; let dt=Math.min(GM.turbo?0.3:0.1,realDt); last=now; if(E.paused||document.hidden) return; E.update(dt); dlgTick(dt);
    // 時間流動（自由行動時）
    if(!E.player.busy&&!D.active){ G.hour+=dt*GM.hourRate; E.hour=G.hour; }
    // 腳步聲
    const P=E.player; if(P.pose==='walk'||P.pose==='run'){ stepAcc+=dt*(P.pose==='run'?3.2:1.9); if(stepAcc>=1){ stepAcc=0; A3.step(P.pose==='run',E.indoor); G.stats.steps++; } if(G.stats.steps%400===0&&G.stats.steps>0) {} }
    if(E.frame%3===0&&$('mdbg').style.display!=='none') movementTelemetry(realDt*3);
    updateInteract(); if(E.frame%2===0) drawMinimap(); if(E.frame%30===0){ updateHUD(); if(STORY.tick) STORY.tick(GM,dt*30); if(typeof EVENTS!=='undefined'&&EVENTS.tick&&G.social) EVENTS.tick(dt*30); if(G.hour%24>=2.5&&G.hour%24<5&&!E.player.busy&&G.zone!=='dorm'&&STORY.forceHome) STORY.forceHome(GM); }
    if(E.frame%120===0) A3.setScene(G.zone,G.hour,G.weather);
    if(performance.now()-GM.lastAuto>45000) autosave();
    E.render(); fpsN++; fpsAcc+=realDt; if(fpsAcc>=1){ GM.fps=fpsN/fpsAcc; fpsN=0; fpsAcc=0; if(S.fps) $('fps').textContent=GM.fps.toFixed(0)+' fps · '+E.renderer.info.render.calls+' calls · '+E.renderer.info.render.triangles+' tris'; } }
  // ---------- 啟動 ----------
  function bindUI(){ $('btnMenu').onclick=()=>{ if(menuOpen) closeMenu(); else openMenu('notes'); }; $('btnClose').onclick=closeMenu; document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab)); $('interact').onclick=()=>doInteract(); $('btnRun').onclick=()=>{ E.player.runHold=!E.player.runHold; E.input.runToggle=E.player.runHold; $('btnRun').classList.toggle('on',E.player.runHold); }; $('btnCenter').onclick=()=>E.recenter();
    $('dlg').addEventListener('pointerup',e=>{ e.stopPropagation(); dlgAdvance(); }); addEventListener('keydown',e=>{ if(e.key===' '||e.key==='Enter'){ if(dlgAdvance()) e.preventDefault(); else if(nearIt&&!menuOpen) doInteract(); } if(e.key==='Escape'){ if(menuOpen) closeMenu(); else if(!D.active) openMenu('notes'); } });
    E.onTap=(tp)=>{ if(D.active){ dlgAdvance(); return true; } return false; };
    E.onGreet=(n)=>{ if(!D.active&&!E.player.busy) caption('',n.name+'朝你揮了揮手。',1800); };
    $('setQuality').onchange=e=>{ S.quality=e.target.value; saveSettings(); applySettings(); }; $('setJoy').onchange=e=>{ S.joystick=e.target.checked; saveSettings(); applySettings(); }; $('setVol').oninput=e=>{ S.volume=parseFloat(e.target.value); saveSettings(); A3.setVolume(S.volume); }; $('setSpeed').onchange=e=>{ S.textSpeed=parseInt(e.target.value); saveSettings(); }; $('setFps').onchange=e=>{ S.fps=e.target.checked; saveSettings(); applySettings(); }; $('setMdbg').onchange=e=>{ S.mdbg=e.target.checked; saveSettings(); applySettings(); }; $('setGlb').onchange=e=>{ S.glbChar=e.target.checked; CHAR.useModels=S.glbChar; saveSettings(); toast('下次載入時生效'); };
    $('btnTitle').onclick=()=>{ autosave(); closeMenu(); $('titleScreen').classList.remove('hide'); GM.running=false; };
    $('btnExport').onclick=()=>{ $('importBox').classList.add('hide'); $('exportBox').classList.remove('hide'); $('exportText').value=exportText(); };
    $('btnCopy').onclick=async()=>{ const t=$('exportText'); try{ await navigator.clipboard.writeText(t.value); toast('已複製到剪貼簿'); }catch(e){ t.focus(); t.select(); toast('請手動長按複製'); } };
    $('btnDownload').onclick=async()=>{ const text=JSON.stringify(snapshot(),null,1); const fname='fatiao3d_save_day'+G.day+'.json'; // claude.ai artifact 環境：透過 downloads 能力存檔
      try{ if(window.claude&&typeof window.claude.use==='function'){ const dl=await window.claude.use('downloads'); if(dl){ try{ const r=await dl.save({filename:fname,data:text}); toast(r&&r.status==='saved'?'已儲存檔案':'已送出'); }catch(err){ if(err&&err.code==='declined') toast('已取消下載'); else toast('無法下載（'+((err&&err.code)||'unavailable')+'），請改用複製文字',3500); } return; } } }catch(e){}
      try{ const blob=new Blob([text],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fname; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1000); toast('若沒有下載，請改用複製文字'); }catch(e){ toast('此環境無法下載，請複製文字'); } };
    $('btnImport').onclick=()=>{ $('exportBox').classList.add('hide'); $('importBox').classList.remove('hide'); $('importMsg').textContent=''; };
    $('importFile').onchange=e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ $('importText').value=r.result; }; r.readAsText(f); };
    $('btnImportGo').onclick=async()=>{ try{ const obj=parseImport($('importText').value); const cur=read(KEY_AUTO); if(cur) write(KEY_BACKUP,cur); write(KEY_AUTO,obj); $('importMsg').textContent='匯入成功，已備份原本進度。'; await loadFrom(obj); }catch(err){ $('importMsg').textContent='匯入失敗：'+err.message; } };
    $('btnNew').onclick=async()=>{ A3.start(); const name=($('nameInput').value||'祐廷').trim().slice(0,6); G=defaults(name); GM.G=G; bindSystems(); $('titleScreen').classList.add('hide'); GM.running=true; await STORY.newGame(GM); };
    $('btnContinue').onclick=async()=>{ A3.start(); const s=read(KEY_AUTO); if(!s){ toast('沒有自動存檔'); return; } GM.running=true; await loadFrom(s); };
    $('btnLoadMenu').onclick=()=>{ A3.start(); if(!G){ G=defaults(); GM.G=G; } openMenu('save'); };
    $('rotate').onclick=()=>$('rotate').classList.remove('want');
    document.addEventListener('visibilitychange',()=>{ if(document.hidden){ autosave(); if(A3.ctx) A3.ctx.suspend(); last=0; } else { if(A3.ctx&&A3.started) A3.ctx.resume(); last=performance.now(); } });
    addEventListener('pointerdown',()=>{ if(!A3.started) A3.start(); },{once:false}); }
  // ?dev／?debug：正式人物模型載入失敗、或 NPC 退回程序化 placeholder 時，畫面上列出來（玩家版不顯示）
  function devAssetReport(){ if(!/[?&](dev|debug|mdbg)\b/.test(location.search)) return; let d=document.getElementById('devErr'); const errs=[].concat(ASSETS.errors||[],(ASSETS.timedOut||[]).map(k=>k+': preload timeout'),CHAR.failures||[]); const ph=E&&E.npcs?E.npcs.filter(n=>n.obj.userData.driver==='proc').length+((E.player&&E.player.obj.userData.driver==='proc')?1:0):0; if(!errs.length&&!ph){ if(d) d.remove(); return; } if(!d){ d=document.createElement('div'); d.id='devErr'; d.style.cssText='position:fixed;left:8px;bottom:160px;z-index:30;max-width:70vw;font:11px/1.35 monospace;color:#ffd0c8;background:rgba(80,0,0,.72);padding:6px 8px;border-radius:8px;white-space:pre-wrap;pointer-events:none'; document.body.appendChild(d); } d.textContent='MODEL LOAD ERRORS（dev）\n'+[...new Set(errs)].slice(0,8).join('\n')+(ph?'\nplaceholder（程序化）人物：'+ph:''); }
  GM.devAssetReport=devAssetReport;
  GM.boot=async function(){ try{ const bar=$('bar').firstElementChild; const msg=$('loadMsg'); msg.textContent='初始化 3D…'; bar.style.width='15%'; await sleep(30); E=E3.init($('c'),{quality:'medium'}); GM.E=E; if(/lowres/.test(location.search)) E.q.forcePR=0.4; GM.turbo=/turbo/.test(location.search); loadSettings(); bar.style.width='40%'; msg.textContent='建立人物…'; await sleep(30); msg.textContent='載入資產…'; await ASSETS.preload(Object.keys(ASSETS.manifest),(p,k)=>{ bar.style.width=(40+p*30)+'%'; msg.textContent='載入資產… '+k; }); if(ASSETS.errors.length) console.error('assets failed:',ASSETS.errors); devAssetReport(); setInterval(devAssetReport,4000);
      CHAR.useModels=(S.glbChar!==false); const heroSpec=Object.assign({},P3.CAST.hero_m,{model:S.glbChar!==false?'char.yuting':null,height:1.75}); /* 主角祐廷：VRoid CC0 改作（char.yuting）；載入失敗時退回程序化 placeholder，並在 ?dev 顯示錯誤 */ const hero=CHAR.build(heroSpec); E.setPlayer(hero); E.player.pocketsIdle=true; GM.heroDriver=hero.userData.driver; bar.style.width='72%'; msg.textContent='準備世界…'; await sleep(30); bindUI(); setupJoystick(); applySettings(); G=defaults(); GM.G=G; bindSystems(); G.hour=17.55; E.hour=17.55; G.weekday=4; E.loadZone(Z3.ZONES.campus,{x:-40,z:-5,yaw:-Math.PI/2}); if(STORY.populate) STORY.populate('campus',GM); // 標題畫面背景：黃昏的椰林大道
      bar.style.width='100%'; await sleep(200); $('loading').classList.add('hide'); const hasAuto=!!read(KEY_AUTO); $('btnContinue').style.display=hasAuto?'block':'none'; GM.running=true; hideHUD(true); requestAnimationFrame(t=>{ last=t; frame(t); }); // 標題畫面用電影鏡頭
      E.player.busy=true; cine('sky',E.player.obj,null,{snap:true}); GM.titleIdle=true; }catch(e){ $('loadMsg').textContent='載入失敗：'+e.message; $('btnRetry').classList.remove('hide'); $('btnRetry').onclick=()=>location.reload(); console.error(e); } };
  return GM;
})();
