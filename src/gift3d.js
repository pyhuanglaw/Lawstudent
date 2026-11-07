/* ===== 送早餐、飲料（GIFT-FLIRT-1107 的一半；USER_WANTS X262）=====
   使用者 11-07 試玩：「買飲料 早餐 給別人」「也沒辦法送早餐飲料?」
   台詞：AA_710 第二版（src/data/gift_lines.js，tools/story/import_gifts.py 產生）。這裡只有程式和系統字（品項、價錢、「帶一份送人」）。
   - 買：便利商店、2:30 AM 的點餐選單多一項「買一份帶走送人…」→ 品項（有的再選一次：熱可可要不要加濃縮、美式冰的熱的、綠茶冰塊、青茶甜度）→ 扣錢、帶在身上。
     帶在身上的最多 3 樣；當天沒送出去，隔天就沒了（早餐、飲料放不到隔天；不提示）。
   - 送：當面和七位女主角說話（STORY.TALK_OPTS）多「送她○○」；同一種（飲料／早餐）一天送一次，第二次她不收（AA_710 no，東西留著）。
     她的反應照 AA_710 _meta.notes 的優先順序：
       ① fav：第一次送到她最喜歡的那一樣（AA_410）＝fav 那幾句、記 REMEMBERED_HER；之後再送對照下面。
       ② opinion：她有意見的那一樣（例：芷若收到便利商店的拿鐵、可昕收到有加糖的青茶）。
       ③ ctx 情境，照這個順序：again 連續兩天送她同一樣／exam 考試週（日曆的期末週，D118 起沒有期中考）／night 晚上（17 點以後）送早餐／
          winterCold 冬天（12～2 月）送冰的／summerHot 夏天（6～8 月）送熱的（冷熱看 S.ITEMS 的 temp；豆漿、米漿沒寫＝不算）。
       ④ yes：交往中有 dating 那一格就用它；不然關係階段（DATE.stageNum）≥ need 的最高那一格。
     每一格有兩三組（pool），輪流、同一組不連續出現；no 也輪流。有幾組講到特定品項、時間的（import_gifts.py 的 BOUND：only／hour），對不上就跳過那一組；
     學姊送到第 3 次起「學弟」換成 {name}（BOUND swap；notes「學姊第 1～2 次叫學弟，之後 {name}」）。
     好感：fav 照 fav 的 rel；其他照④挑到的那一格的 rel（opinion、ctx 稿裡沒有寫 rel，就用她這時候那一格的）；她的戀愛（npcRom）只在朋友（第 3 階）以上才算（AA_710 notes）。
     送東西是小事，不算行動次數。
   存檔：G.carry＝[{n:品項, cat:'drink'|'breakfast', day, shop}]；G.flags.GIFT＝{day:{'人物|種類':第幾天}, fav:{人物:第幾天}, n:{人物:次數},
     last:{'人物|種類':{d:第幾天, n:品項}}（連續送）, pool:{'人物|種類|格':上一次用第幾組}（輪流）}。舊存檔沒有的欄位＝空的。
   測試：node tests/gift_unit.js */
'use strict';
const GIFT=(function(){
  const S={};
  const L=()=>(typeof GIFT_LINES!=='undefined'&&GIFT_LINES.people)||{};
  /* 品項：名字、種類、價錢（便利商店；2:30 AM 另一個價錢）、冷熱（temp；沒寫＝不算冷也不算熱）、可以再選的（opt：[選項字, 加在名字後面的, 加價, 冷熱]）。
     tools/story/import_gifts.py 會讀這一段核對稿裡的品項名（改這裡要重新匯入）*/
  S.ITEMS=[
    {n:'豆漿',cat:'drink',p:25},{n:'米漿',cat:'drink',p:25},{n:'飯糰',cat:'breakfast',p:35},{n:'三明治',cat:'breakfast',p:39},
    {n:'無糖綠茶',cat:'drink',p:25,temp:'cold',opt:[['正常冰',''],['去冰','（去冰）']]},{n:'青茶',cat:'drink',p:25,temp:'cold',opt:[['微糖',''],['無糖','（無糖）']]},{n:'紅茶拿鐵',cat:'drink',p:45,temp:'cold'},
    {n:'美式咖啡',cat:'drink',p:45,cafe:100,temp:'hot',opt:[['熱的',''],['冰的','（冰的）',0,'cold']]},{n:'拿鐵',cat:'drink',p:55,cafe:120,temp:'hot'},{n:'熱可可',cat:'drink',p:50,cafe:110,temp:'hot',opt:[['就這樣',''],['加一份濃縮','（加一份濃縮）',20]]}];
  /* 完整品項名（名字＋再選一次加的字）→ 冷熱 */
  S.TEMP={}; for(const it of S.ITEMS) for(const o of it.opt||[['','']]) S.TEMP[it.n+o[1]]=o[3]||it.temp||null;
  S.sells=(shop,it)=>shop==='便利商店'||(shop==='兩點半 Café'&&it.cafe!=null);   /* 便利商店全部；2:30 AM 只有咖啡、熱可可（店名 key 照 story3d.js counter）。蛋餅、蘿蔔糕：遊戲裡還沒有早餐店 */
  S.MAX=3;
  S.SHOP_OPT='買一份帶走送人…';
  const F=G=>{ const f=G.flags||(G.flags={}); const g=f.GIFT&&typeof f.GIFT==='object'?f.GIFT:(f.GIFT={}); for(const k of ['day','fav','n','last','pool']) if(!g[k]||typeof g[k]!=='object') g[k]={}; return g; };
  S.carry=G=>{ if(!Array.isArray(G.carry)) G.carry=[]; G.carry=G.carry.filter(x=>x&&x.n&&x.day===G.day); return G.carry; };   /* 隔天就沒了 */
  S.price=(it,shop)=>shop==='兩點半 Café'&&it.cafe!=null?it.cafe:it.p;
  S.shopOpt=function(G,shop){ if(!S.ITEMS.some(it=>S.sells(shop,it))||!Object.keys(L()).length) return null; const full=S.carry(G).length>=S.MAX; return {t:S.SHOP_OPT,hint:full?'手上已經拿了 '+S.MAX+' 樣':'飲料、早餐，帶在身上，見面的時候送她',dim:full}; };
  /* 買：品項 → 再選一次（有的話）→ 扣錢、帶著（記在哪一家買的：芷若對便利商店的拿鐵有意見）*/
  S.buy=async function(GM,shop){ const G=GM.G; if(!S.ITEMS.some(it=>S.sells(shop,it))) return null; if(S.carry(G).length>=S.MAX){ GM.toast&&GM.toast('手上已經拿了 '+S.MAX+' 樣了'); return null; }
    const L2=S.ITEMS.filter(it=>S.sells(shop,it)), opts=L2.map(it=>({t:it.n+'　'+S.price(it,shop)+' 元',dim:G.money<S.price(it,shop)})); opts.push({t:'算了'});
    const i=await GM.choose(opts); const it=L2[i]; if(!it) return null; let name=it.n, p=S.price(it,shop);
    if(it.opt){ const k=await GM.choose(it.opt.map(o=>({t:o[0]+(o[2]?'（+'+o[2]+' 元）':'')}))); const o=it.opt[k]||it.opt[0]; name+=o[1]; p+=o[2]|0; }
    if(G.money<p){ GM.toast&&GM.toast('錢不夠'); return null; }
    GM.money(-p); const c={n:name,cat:it.cat,day:G.day,shop}; S.carry(G).push(c); await GM.say(null,'你買了'+name+'，帶在身上。'); return c; };
  const stage=id=>typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):1;
  const dating=(G,id)=>{ const f=(G&&G.flags)||{}, R=f.romance||{}; return f['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const month=G=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).m:0;
  const examWeek=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?((CALENDAR.termOf(G.day)||{}).exam==='final'):false;
  S.text=(G,t)=>String(t).replace(/\{name\}/g,(G&&G.name)||'祐廷');
  /* 一句開頭是（動作）、後面接著講話的，拆成旁白＋她說的（字不改）*/
  const play=async(GM,who,lines)=>{ for(const t of lines||[]){ const s=S.text(GM.G,t), m=/^(（[^）]*）)(.+)$/.exec(s); if(m){ await GM.say(null,m[1]); await GM.say(who,m[2]); } else if(/^（/.test(s)) await GM.say(null,s); else await GM.say(who,s); } };
  const adj=(id,r)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.adjust||!r) return; const d=Object.assign({},r); if(stage(id)<3) delete d.npcRom; SOCIAL.adjust(id,d); };
  const match=(e,c)=>!!e&&e.n===c.n&&(!e.shop||c.shop===e.shop);
  /* 這一組現在可以用嗎（BOUND：only 只在送這幾樣、hour [幾點, 幾點)）*/
  const okG=(g,x)=>!!g&&(!g.only||g.only.includes(x.n))&&(!g.hour||(x.h>=g.hour[0]&&x.h<g.hour[1]));
  /* BOUND swap：學姊送到第 3 次起「學弟」換成 {name}（AA_710 notes）*/
  const ln=(g,x)=>g.swap&&x.cnt>=g.swap[2]?g.lines.map(t=>t.split(g.swap[0]).join(g.swap[1])):g.lines;
  /* 輪流：從上一次用的下一組開始，挑第一組可以用的（只剩上一次那組可以用才重複）；都不行＝null */
  const rot=(R,k,gs,x)=>{ if(!Array.isArray(gs)||!gs.length) return null; const last=R.pool[k], s=last==null?0:((last|0)+1)%gs.length;
    for(let j=0;j<gs.length;j++){ const i=(s+j)%gs.length; if(okG(gs[i],x)) return {k,i,g:gs[i]}; } return null; };
  /* ④ yes 的格子，照先後：交往中那一格 → 階段夠的、need 由高到低 */
  const cells=(G,id,E)=>{ const st=stage(id), out=[]; if(dating(G,id)) for(const y of E.yes) if(y.dating) out.push(y); for(const y of E.yes.filter(q=>!q.dating&&st>=q.need).sort((a,b)=>b.need-a.need)) out.push(y); if(!out.length) out.push(E.yes.find(q=>!q.dating)||E.yes[0]); return out; };
  S.CTX=['again','exam','night','winterCold','summerHot'];
  const ctxOn=(G,R,key,c,k)=>{ if(k==='again'){ const l=R.last[key]; return !!l&&l.d===G.day-1&&l.n===c.n; }
    if(k==='exam') return examWeek(G);
    if(k==='night') return c.cat==='breakfast'&&(+G.hour||0)>=17;
    const m=month(G), t=S.TEMP[c.n]; if(k==='winterCold') return (m===12||m<=2)&&m>0&&t==='cold'; if(k==='summerHot') return m>=6&&m<=8&&t==='hot'; return false; };
  /* 挑她的反應（存檔只補沒有的預設欄位，不記輪流）：{kind:'no'|'fav'|'opinion'|ctx 名|'yes', lines, rel, k（輪流的 key）, i（第幾組）} */
  S.pick=function(G,id,c){ const T=L()[id], E=T&&T[c.cat]; if(!E) return null; const R=F(G), key=id+'|'+c.cat, x={n:c.n,cnt:R.n[id]|0,h:+G.hour||0};
    if(R.day[key]===G.day){ const r=rot(R,key+'|no',E.no,x)||{k:key+'|no',i:0,g:E.no[0]}; return {kind:'no',lines:ln(r.g,x),k:r.k,i:r.i}; }   /* 一天第二次：不收，東西留著 */
    const C=cells(G,id,E); let base=null, yr=null; for(const y of C){ const r=rot(R,key+'|yes'+E.yes.indexOf(y),y.pool,x); if(r){ base=y; yr=r; break; } }
    if(!yr){ const y=C[C.length-1]; base=y; yr={k:key+'|yes'+E.yes.indexOf(y),i:0,g:y.pool[0]}; }   /* 每一組都對不上（現在的稿不會：need 1 那幾格都沒有 only／hour）*/
    if(E.fav&&match(E.fav,c)&&R.fav[id]==null) return {kind:'fav',lines:E.fav.lines,rel:E.fav.rel,fav:true};
    for(const [j,o] of (E.opinion||[]).entries()) if(match(o,c)){ const r=rot(R,key+'|op'+j,o.pool,x); if(r) return {kind:'opinion',lines:ln(r.g,x),rel:o.rel&&Object.keys(o.rel).length?o.rel:base.rel,k:r.k,i:r.i}; }
    for(const k of S.CTX) if(E.ctx&&E.ctx[k]&&ctxOn(G,R,key,c,k)){ const r=rot(R,key+'|ctx.'+k,E.ctx[k],x); if(r) return {kind:k,lines:ln(r.g,x),rel:base.rel,k:r.k,i:r.i}; }
    return {kind:'yes',lines:ln(yr.g,x),rel:base.rel,k:yr.k,i:yr.i,dating:!!base.dating,need:base.need}; };
  /* 送：回傳 kind（'fav'／'opinion'／'again'…／'yes'／'no'）*/
  S.give=async function(GM,who,id,c){ const G=GM.G, P=S.pick(G,id,c); if(!P) return null; const R=F(G), key=id+'|'+c.cat; S.lastPick=P;
    if(P.kind==='no'){ R.pool[P.k]=P.i; await play(GM,who,P.lines); return 'no'; }
    const C=S.carry(G), k=C.indexOf(c); if(k>=0) C.splice(k,1); R.day[key]=G.day; R.n[id]=(R.n[id]|0)+1; R.last[key]={d:G.day,n:c.n}; if(P.k) R.pool[P.k]=P.i;
    await GM.say(null,'你把'+c.n+'遞給'+(who&&who.name||'她')+'。');
    await play(GM,who,P.lines); adj(id,P.rel);
    if(P.fav){ R.fav[id]=G.day; if(typeof SOCIAL!=='undefined'&&SOCIAL.remember&&!(SOCIAL.has&&SOCIAL.has(id,'REMEMBERED_HER'))) SOCIAL.remember(id,'REMEMBERED_HER',c.n); }
    return P.kind; };
  /* 當面說話的選項（STORY.TALK_OPTS）：帶著的每一樣一個 */
  S.talkOpts=function(G,id){ const T=L()[id]; if(!T||!G) return []; return S.carry(G).filter(c=>T[c.cat]).map(c=>({t:'送她'+c.n,run:async(GM,who)=>{ await S.give(GM,who,id,c); }})); };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.TALK_OPTS)) STORY.TALK_OPTS.push((G,id)=>S.talkOpts(G,id));
  return S;
})();
