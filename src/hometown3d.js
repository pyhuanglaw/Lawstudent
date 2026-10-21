/* 寒暑假去她的縣市（AA_276 第 1-1、4、5 節，AA-C 13c583c9）：可昕在高雄、沛珊在台中（STORY.presence kind 'home'）的時候，手機約她的清單多一個「我去高雄找妳？」／「我去台中找妳？」。
   - 高鐵來回的錢不夠就不能約（AA_276 第 7 節）；選日子（她在老家的那幾天，最多三個）→ 玩家的那一句 → 她答應（交往中、沛珊重考消失期交往中各有自己的一句）→ 排一趟出遊（OUT.plan，當天來回、高鐵）。
   - 那一天：車站接人 → 一個地方 → 傍晚送上車（2D；第一次演 first，之後 again 三選一輪流；沛珊重考消失期演 keep，只能出來一個下午、一個月最多一次）。結束回臺北（宿舍或家）。
   - 台詞在 src/data/hometown_lines.js。測試：node tests/vac_hometown_unit.js
   - 別的城市那一組（AA_328 3-09，沛珊大三、大四的學期中在台南）：HOMETOWN_LINES['classmate_peishan@台南']，STORY.presence 回 city（或 home）＝'台南' 的時候用（S.key）；
     presence 改台南、學期中的邀約（AA_282 第 5 節第 1、3 點）還沒做＝現在不會出現。測試：node tests/r3_events_unit.js 第 16 節 */
'use strict';
const HV=(function(){
  const S={};
  const L=id=>typeof HOMETOWN_LINES!=='undefined'?HOMETOWN_LINES[id]:null;
  const pres=(G,id,day)=>typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,day==null?G:Object.assign({},G,{day})):{here:true};
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  const dating=(G,id)=>!!(G.flags&&G.flags['dating_'+id]===true);
  const ym=day=>{ const d=CALENDAR.dateOf(day); return d.y+'-'+d.m; };
  const WD='日一二三四五六日';
  const label=day=>{ const d=CALENDAR.dateOf(day); return d.m+'/'+d.d+'（週'+WD[d.wd%7]+'）'; };
  /* 同一個人在別的城市的那一組（AA_328 3-09：沛珊大三、大四的學期中在台南）：HOMETOWN_LINES['id@城市']；STORY.presence 的 city（或 home）是那個城市就用它，沒有就用 id 那一組（寒暑假的台中、高雄照舊）*/
  S.key=function(G,id,day){ const p=pres(G,id,day), c=p&&(p.city||p.home); return c&&L(id+'@'+c)?id+'@'+c:id; };
  const away=(G,id,p,day)=>p.here===false&&(p.kind==='home'||S.key(G,id,day)!==id);   /* 寒暑假在老家（kind 'home'），或在有自己那一組的城市 */
  /* 手機約她的清單要不要多這一項：null＝不出現；{ok:false,why}＝出現但不能選（沛珊重考消失期一個月一次）*/
  S.offer=function(G,id){ if(!G||(G.stage||'law')!=='law') return null; const C=L(S.key(G,id)); if(!C) return null; const p=pres(G,id); if(!away(G,id,p)) return null;
    if(S.planned(G,id)) return {ok:false,why:'已經約好了'};
    if(C.fare&&(G.money|0)<C.fare) return {ok:false,why:'高鐵票錢不夠'};   /* AA_276 第 7 節第 2 點：來回 2980／1400 元，消失期例外也一樣 */
    if(p.keep&&(G.flags.HV_KEEP_M||{})[ym(G.day)]) return {ok:false,why:'這個月已經去過了（她說一個月一次）'};
    return S.days(G,id).length?{ok:true}:{ok:false,why:'她這幾天就要回臺北了'}; };
  S.planned=(G,id)=>typeof OUT!=='undefined'&&OUT.rec(G).some(q=>q.hv&&q.hv.id===id&&q.state==='planned');
  /* 可以去的日子：明天起七天內她還在老家的（重考消失期：同一個月沒去過），最多三個；城市要和今天一樣（skipDays＝那幾天本身是別的事件，例：台南 BB_165 5-1／5-2）*/
  S.days=function(G,id){ const out=[]; const p0=pres(G,id), k0=S.key(G,id), C=L(k0)||{}, skip=(C.skipDays||[]).map(k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null);
    for(let d=G.day+1; d<=G.day+7&&out.length<3; d++){ const p=pres(G,id,d); if(!away(G,id,p,d)||S.key(G,id,d)!==k0||skip.includes(d)) continue; if(p0.keep&&(G.flags.HV_KEEP_M||{})[ym(d)]) continue; out.push(d); } return out; };
  const msg=(G,id,from,text)=>{ if(typeof PHONE!=='undefined'&&PHONE.post) PHONE.post(G,{th:'p:'+id,from,text}); };
  /* 約（invites3d.js 的 S.flow 選了這一項）*/
  S.ask=async function(GM,id){ const G=GM.G, key=S.key(G,id), C=L(key), o=S.offer(G,id); if(!C||!o) return null; if(!o.ok){ await GM.say(null,o.why+'。'); return null; }
    const D=S.days(G,id), keep=!!pres(G,id).keep, h=keep?14:10.5; const k=await GM.choose(D.map(d=>({t:label(d),hint:'當天來回　'+C.travel+(keep?'　下午三個小時':'')})).concat([{t:'算了'}])); if(k>=D.length) return null;
    const day=D[k], me=G.name||'祐廷'; msg(G,id,'player',C.ask); await GM.say({name:me+'（手機）'},C.ask);
    const yes=keep&&C.yesKeep?C.yesKeep:(dating(G,id)&&C.yesDating?C.yesDating:C.yes); msg(G,id,id,yes); await GM.say({name:nm(id)+'（手機）',charId:id},yes);
    if(keep){ (G.flags.HV_KEEP_M||(G.flags.HV_KEEP_M={}))[ym(day)]=true; }
    OUT.plan(G,{id:'hv_'+id+'_'+day,ev:id==='kexin'?'ev_hv_kx':'ev_hv_ps',day,h,late:1,place:C.city,title:'去'+C.city+'找'+nm(id),travel:C.travel,travelH:C.travelH,back:'回到臺北。',hv:key!==id?{id,keep,key}:{id,keep}});
    await GM.say(null,'約好 '+label(day)+'，去'+C.city+'。'); if(GM.autosave) GM.autosave(); return day; };
  /* 那一天（ev_hv_kx／ev_hv_ps 的 beforeOuting）*/
  const sub=(G,t)=>String(t).replace(/\{name\}/g,G.name||'祐廷');
  const play=async(GM,id,arr)=>{ const G=GM.G, me={name:nm(id),charId:id}; for(const x of arr||[]){ if(typeof x==='string') await GM.say(me,sub(G,x)); else if(x.narr) await GM.say(null,x.narr); } };
  const place=async(GM,P)=>{ if(typeof ADV!=='undefined'&&ADV.setBg) ADV.setBg(typeof OUT!=='undefined'&&OUT.bg?OUT.bg(P.bg):'dark'); if(typeof ADV!=='undefined'&&ADV.log) ADV.log('',P.scene); if(GM.caption) GM.caption('',P.scene,2400); if(GM.sleep) await GM.sleep(700); };
  const toEvening=GM=>{ const G=GM.G; if(G.hour<17) GM.advance(17-G.hour); };   /* 傍晚送上車：17:00；回程的車程是事件的 hours */
  S.pickVariant=function(G,id,keep,key){ const k=key||id, C=L(k); if(keep) return 'keep'; const N=G.flags.HV_N||(G.flags.HV_N={}), n=N[k]|0; return n===0?'first':C.again[(n-1)%C.again.length].key; };   /* key：別的城市那一組（台南）各自算第幾次 */
  S.play=async function(GM,q){ const G=GM.G, hv=q&&q.hv, id=hv&&hv.id, key=(hv&&hv.key)||id, C=L(key); if(!C) return false; const dt=dating(G,id), v=S.pickVariant(G,id,hv.keep&&!!C.keep,key);
    if(C.fare&&GM.money) GM.money(-C.fare,'交通');   /* 高鐵來回（出發的時候付）*/
    if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:typeof OUT!=='undefined'&&OUT.bg?OUT.bg((v==='keep'?C.keep.pick:C.pick).bg):'dark'});
    if(v==='keep'){ await play(GM,id,C.keep.pick.lines); await place(GM,C.keep.place); await play(GM,id,C.keep.place.lines); toEvening(GM); await play(GM,id,C.keep.send); G.flags.HV_KEEP_LAST=G.day; return true; }
    await play(GM,id,(v!=='first'&&C.pickAgain?C.pickAgain:C.pick).lines);   /* 第二次以後的接人換句（第 7 節第 1 點）*/
    const P=v==='first'?C.first:C.again.find(a=>a.key===v); await place(GM,P); await play(GM,id,P.lines); if(dt&&P.dating) await play(GM,id,P.dating);
    const O=(P.opts||[]).filter(o=>!o.dating||dt); if(O.length){ const k=await GM.choose(O.map(o=>({t:'「'+o.t+'」'}))); await GM.say({name:G.name||'祐廷'},O[k].t); await play(GM,id,O[k].say); }
    if(typeof C.extra==='function') await play(GM,id,C.extra(G)||[]);   /* 那一組自己多的一段（台南：沒交往的玩家當面看孩子的作業，AA_328 3-19 裁定 25）*/
    toEvening(GM); if(C.send.narr) await GM.say(null,C.send.narr); await play(GM,id,dt?C.send.dating:C.send.other);
    const N=G.flags.HV_N||(G.flags.HV_N={}); N[key]=(N[key]|0)+1; (G.flags.HV_LAST||(G.flags.HV_LAST={}))[key]=G.day;
    if(C.visitsFlag) G.flags[C.visitsFlag]=N[key]; if(C.lastFlag&&v!=='first') G.flags[C.lastFlag]=v;   /* 台南：PS_TAINAN_VISITS（去了幾次）、PS_AGAIN_LAST（上一次是哪一版）*/
    return true; };
  return S;
})();
