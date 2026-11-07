/* ===== 送早餐、飲料（GIFT-FLIRT-1107 的一半；USER_WANTS X262）=====
   使用者 11-07 試玩：「買飲料 早餐 給別人」「也沒辦法送早餐飲料?」
   台詞：AA_710（src/data/gift_lines.js，tools/story/import_gifts.py 產生）。這裡只有程式和系統字（品項、價錢、「帶一份送人」）。
   - 買：便利商店、2:30 AM 的點餐選單多一項「買一份帶走送人…」→ 品項（有的再選一次：熱可可要不要加濃縮、美式冰的熱的、綠茶冰塊、青茶甜度）→ 扣錢、帶在身上。
     帶在身上的最多 3 樣；當天沒送出去，隔天就沒了（早餐、飲料放不到隔天；不提示）。
   - 送：當面和七位女主角說話（STORY.TALK_OPTS）多「送她○○」；同一種（飲料／早餐）一天送一次，第二次她不收（AA_710 no，東西留著）。
     她的反應：關係階段（DATE.stageNum）≥ need 的最高那一格；送到她喜歡的那一樣（fav，AA_410）第一次＝fav 那幾句、記 REMEMBERED_HER，之後照一般。
     好感照那一格的 rel（SOCIAL.adjust）；她的戀愛（npcRom）只在朋友（第 3 階）以上才算（AA_710 notes）。送東西是小事，不算行動次數。
   存檔：G.carry＝[{n:品項, cat:'drink'|'breakfast', day}]；G.flags.GIFT＝{day:{'人物|種類':第幾天}, fav:{人物:第幾天}, n:{人物:次數}}。舊存檔沒有＝空的。
   測試：node tests/gift_unit.js */
'use strict';
const GIFT=(function(){
  const S={};
  const L=()=>(typeof GIFT_LINES!=='undefined'&&GIFT_LINES.people)||{};
  /* 品項：名字、種類、價錢（便利商店；2:30 AM 另一個價錢）、可以再選的（opt：[選項字, 加在名字後面的, 加價]）*/
  S.ITEMS=[
    {n:'豆漿',cat:'drink',p:25},{n:'米漿',cat:'drink',p:25},{n:'飯糰',cat:'breakfast',p:35},{n:'三明治',cat:'breakfast',p:39},
    {n:'無糖綠茶',cat:'drink',p:25,opt:[['正常冰',''],['去冰','（去冰）']]},{n:'青茶',cat:'drink',p:25,opt:[['微糖',''],['無糖','（無糖）']]},{n:'紅茶拿鐵',cat:'drink',p:45},
    {n:'美式咖啡',cat:'drink',p:45,cafe:100,opt:[['熱的',''],['冰的','（冰的）']]},{n:'拿鐵',cat:'drink',p:55,cafe:120},{n:'熱可可',cat:'drink',p:50,cafe:110,opt:[['就這樣',''],['加一份濃縮','（加一份濃縮）',20]]}];
  S.SHOPS={'便利商店':it=>true,'兩點半 Café':it=>it.cafe!=null};   /* 蛋餅、蘿蔔糕：遊戲裡還沒有早餐店（AA_710 _items 有，等早餐店）*/
  S.MAX=3;
  S.SHOP_OPT='買一份帶走送人…';
  const F=G=>{ const f=G.flags||(G.flags={}); const g=f.GIFT&&typeof f.GIFT==='object'?f.GIFT:(f.GIFT={}); g.day=g.day||{}; g.fav=g.fav||{}; g.n=g.n||{}; return g; };
  S.carry=G=>{ if(!Array.isArray(G.carry)) G.carry=[]; G.carry=G.carry.filter(x=>x&&x.n&&x.day===G.day); return G.carry; };   /* 隔天就沒了 */
  S.price=(it,shop)=>shop==='兩點半 Café'&&it.cafe!=null?it.cafe:it.p;
  S.shopOpt=function(G,shop){ const ok=S.SHOPS[shop]; if(!ok||!Object.keys(L()).length) return null; const full=S.carry(G).length>=S.MAX; return {t:S.SHOP_OPT,hint:full?'手上已經拿了 '+S.MAX+' 樣':'飲料、早餐，帶在身上，見面的時候送她',dim:full}; };
  /* 買：品項 → 再選一次（有的話）→ 扣錢、帶著 */
  S.buy=async function(GM,shop){ const G=GM.G, ok=S.SHOPS[shop]; if(!ok) return null; if(S.carry(G).length>=S.MAX){ GM.toast&&GM.toast('手上已經拿了 '+S.MAX+' 樣了'); return null; }
    const L2=S.ITEMS.filter(ok), opts=L2.map(it=>({t:it.n+'　'+S.price(it,shop)+' 元',dim:G.money<S.price(it,shop)})); opts.push({t:'算了'});
    const i=await GM.choose(opts); const it=L2[i]; if(!it) return null; let name=it.n, p=S.price(it,shop);
    if(it.opt){ const k=await GM.choose(it.opt.map(o=>({t:o[0]+(o[2]?'（+'+o[2]+' 元）':'')}))); const o=it.opt[k]||it.opt[0]; name+=o[1]; p+=o[2]|0; }
    if(G.money<p){ GM.toast&&GM.toast('錢不夠'); return null; }
    GM.money(-p); const c={n:name,cat:it.cat,day:G.day}; S.carry(G).push(c); await GM.say(null,'你買了'+name+'，帶在身上。'); return c; };
  const stage=id=>typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):1;
  S.text=(G,t)=>String(t).replace(/\{name\}/g,(G&&G.name)||'祐廷');
  const play=async(GM,who,lines)=>{ for(const t of lines||[]){ const s=S.text(GM.G,t); if(/^（/.test(s)) await GM.say(null,s); else await GM.say(who,s); } };
  const adj=(id,r)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.adjust||!r) return; const d=Object.assign({},r); if(stage(id)<3) delete d.npcRom; SOCIAL.adjust(id,d); };
  /* 送：回傳 'fav'／'yes'／'no' */
  S.give=async function(GM,who,id,c){ const G=GM.G, T=L()[id], E=T&&T[c.cat]; if(!E) return null; const R=F(G), key=id+'|'+c.cat;
    if(R.day[key]===G.day){ await play(GM,who,E.no); return 'no'; }   /* 一天第二次：不收，東西留著 */
    const C=S.carry(G), k=C.indexOf(c); if(k>=0) C.splice(k,1); R.day[key]=G.day; R.n[id]=(R.n[id]|0)+1;
    await GM.say(null,'你把'+c.n+'遞給'+(who&&who.name||'她')+'。');
    if(E.fav&&c.n===E.fav.item&&R.fav[id]==null){ R.fav[id]=G.day; await play(GM,who,E.fav.lines); adj(id,E.fav.rel); if(typeof SOCIAL!=='undefined'&&SOCIAL.remember&&!(SOCIAL.has&&SOCIAL.has(id,'REMEMBERED_HER'))) SOCIAL.remember(id,'REMEMBERED_HER',c.n); return 'fav'; }
    const st=stage(id); let y=E.yes[0]; for(const q of E.yes) if(st>=q.need) y=q; await play(GM,who,y.lines); adj(id,y.rel); return 'yes'; };
  /* 當面說話的選項（STORY.TALK_OPTS）：帶著的每一樣一個 */
  S.talkOpts=function(G,id){ const T=L()[id]; if(!T||!G) return []; return S.carry(G).filter(c=>T[c.cat]).map(c=>({t:'送她'+c.n,hint:c.cat==='drink'?'飲料':'早餐',run:async(GM,who)=>{ await S.give(GM,who,id,c); }})); };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.TALK_OPTS)) STORY.TALK_OPTS.push((G,id)=>S.talkOpts(G,id));
  return S;
})();
