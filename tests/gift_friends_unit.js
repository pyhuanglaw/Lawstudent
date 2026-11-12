// 送飲料、早餐給朋友（GIFT-FLIRT-1107，USER_WANTS X262；台詞 AA_728 7ac7380ff people，AA-B 11-08 08:24、08:49 更正：豆漿米漿是飲料、四位補早餐）——不需要瀏覽器（D131）。
// 使用者 11-07 試玩：「買飲料 早餐 給別人」。句子一律從 src/data/gift_lines.js 讀來比對；0 再拿 gift_lines.js 和 AA_728@7ac7380ff 逐句比。檢查：
//   0. gift_lines.js 的 friends 和白名單上的 AA_728 一致（import_gifts.py --check）；六位都在 characters.js（阿哲、阿凱、Alison、柏翰、明軒、芯慈）；
//      句子和 AA_728 一字不差；好感＝notes「yes 每次 fam+1、comf+1」；匯入工具：不在 characters.js、notes 改了、多了不認得的欄位 → 停下來
//   1. 當面說話多「送他○○」（阿哲、阿凱、柏翰、明軒）／「送她○○」（Alison、芯慈），掛在 STORY.TALK_OPTS；沒帶東西不出；不是女主角也不是這六位的人不出
//   2. yes 輪流、同一組不連續（每天送一次飲料：0120；阿凱早餐 010；芯慈早餐只有一組）；沒有早餐那一格的人送早餐照飲料那一格（和飲料同一個輪流）
//   3. 好感：一天第一次收下 fam+1、comf+1；同一天再收（另一種）不加；隔天再加；沒有戀愛（npcRom、rom 不變）
//   4. 同一天第二次送同一種：no（AA_728 no）、好感不變、東西留著
//   5. 「你把○○遞給阿哲。」；（動作）講的話拆成旁白＋他說的
//   6. 芯慈（可以攻略）交往中也照朋友版；七位女主角照 AA_710（GIFT_LINES.people 先挑）
//   0b. 只給可攻略的對象（使用者 11-08 15:2x；GIFT-ROMANCE-ONLY-1108）：預設 GIFT.FRIEND_OK 只有芯慈；阿哲、阿凱、Alison、柏翰、明軒沒有選項、give 不收；1～6 把六位打開來驗朋友版本身
// 2026-11-12 STALE-SOURCES-1112：AA_728 換成 bb3bdad7df（AA-B 11-08 15:33，使用者 11-08「送飲料只需要給可攻略的對象」）——阿哲、阿凱、Alison、柏翰、明軒在稿裡標 unused
//   （_meta.status：「台詞留在這份當紀錄，不匯入」），gift_lines.js 的 friends 只剩芯慈。這支測試的舊期望是「資料有六位、把 GIFT.FRIEND_OK 六位都打開來驗朋友版」：
//   那五位已經不在資料裡，所以 1～6 改成只驗芯慈（朋友版現在唯一在用的人）；拿掉的檢查：阿凱早餐兩組輪流 010、補了早餐的四位 010、四位第二次送早餐的 no 不提「喝」（2b）、
//   阿哲「（他舉起杯子跟你碰了一下。）乾。」拆旁白（改用芯慈飲料第二組那一句，字從資料讀）。新增：五位就算把 FRIEND_OK 打開也沒有選項（沒有資料）；
//   匯入工具：寫 unused 的不匯入、status 那一句不見了就停、拿掉 unused 的人照樣匯得進來。
// 用法：node tests/gift_friends_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
const ok1=loadG('src/data/gift_lines.js',['GIFT_LINES']), ok2=loadG('src/gift3d.js',['GIFT']);
const IDS=['classmate_xinci'];   /* 舊：六位（zhe、kai、yu、classmate_bohan、classmate_mingxuan、classmate_xinci）；bb3bdad7df 起資料只有芯慈 */
const UNUSED=['zhe','kai','yu','classmate_bohan','classmate_mingxuan'];
const NAME={zhe:'阿哲',kai:'阿凱',yu:'Alison',classmate_bohan:'柏翰',classmate_mingxuan:'明軒',classmate_xinci:'芯慈'};
const PRON={zhe:'他',kai:'他',yu:'她',classmate_bohan:'他',classmate_mingxuan:'他',classmate_xinci:'她'};
const who=id=>({name:NAME[id],charId:id});
const J=x=>JSON.stringify(x);
const same=(a,b)=>J(a)===J(b);
const A728=JSON.parse(cp.execFileSync('git',['-C',H.ROOT,'show','bb3bdad7df:docs/story_planning/AA_728_gifts_friends.json'],{encoding:'utf8'}));
const py=(code)=>{ try{ cp.execFileSync('python3',['-c',code],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); return 'ran'; }catch(e){ return String(e.stderr||''); } };
const PRE="import sys,json,subprocess;sys.path.insert(0,'tools/story');import import_gifts as M;s2=json.loads(subprocess.check_output(['git','show','bb3bdad7df:'+M.PATH2]).decode());I=M.game_items();";
(async()=>{
  /* 0 資料 */
  { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_gifts.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    const FR=ok1&&GIFT_LINES.friends;
    check('0. src/data/gift_lines.js 的 friends 和白名單上的 AA_728 一致（import_gifts.py --check；bb3bdad7df，舊期望 7ac7380ff）',ok1&&ok2&&ok&&!!FR&&/AA_728_gifts_friends\.json@bb3bdad7df$/.test(FR.src||''),out.trim().slice(0,200)+' '+(FR&&FR.src)); }
  if(!ok1||!ok2||!GIFT_LINES.friends){ H.done(); return; }
  const FR=GIFT_LINES.friends, P=FR.people;
  /* 舊期望：資料有六位。bb3bdad7df：五位標 unused 不匯入 */
  check('0. 資料只有芯慈；稿裡標 unused 的五位（阿哲、阿凱、Alison、柏翰、明軒）不在資料裡（characters.js 的 id、名字、性別都對得到）',same(Object.keys(P),IDS)&&same(Object.keys(A728.people).filter(id=>'unused' in A728.people[id]),UNUSED)&&/不用\**（台詞留在這份當紀錄，不匯入）/.test(A728._meta.status||'')&&IDS.concat(UNUSED).every(id=>CHARACTERS[id]&&CHARACTERS[id].name===NAME[id]&&(CHARACTERS[id].gender==='m')===(PRON[id]==='他')),J([Object.keys(P),Object.keys(A728.people).filter(id=>'unused' in A728.people[id])]));
  { const bad=[]; const G2=x=>x.map(g=>g.lines);
    for(const id of IDS){ const a=A728.people[id];
      for(const c of ['drink','breakfast']){ if(!!a[c]!==!!P[id][c]) bad.push(id+'.'+c+' 有沒有'); else if(a[c]&&!same(G2(P[id][c].pool),a[c].yes)) bad.push(id+'.'+c); }
      if(!same(G2(P[id].no),a.no)) bad.push(id+'.no'); }
    check('0. 芯慈的句子和 AA_728@bb3bdad7df 一字不差（飲料 yes 三組、早餐 yes 一組、no 一組）',!bad.length&&P.classmate_xinci.drink.pool.length===3&&P.classmate_xinci.no.length===1&&!!P.classmate_xinci.breakfast&&P.classmate_xinci.breakfast.pool.length===1,bad.join('；'));
    const quoted=[].concat(...IDS.map(id=>[].concat(P[id].drink.pool,(P[id].breakfast||{pool:[]}).pool,P[id].no).map(g=>g.lines))).flat().filter(t=>/^「.*」$/.test(t));
    check('0. 有名字說的句子外面沒有「」（TEXT-QUOTE-UNIFY-1108）；好感＝fam+1、comf+1（AA_728 notes），沒有 npcRom',!quoted.length&&same(FR.rel,{fam:1,comf:1}),J(quoted)+' '+J(FR.rel)); }
  { const X="s2['people']['classmate_xinci']";
    const e1=py(PRE+"import copy;s2['people']['nobody']=copy.deepcopy("+X+");M.build_friends(s2,'x',I)");
    const e2=py(PRE+"s2['_meta']['notes'][1]=s2['_meta']['notes'][1].replace('comf+1','comf+2，trust+1');M.build_friends(s2,'x',I)");
    const e3=py(PRE+X+"['drink']['fav']={'item':'豆漿'};M.build_friends(s2,'x',I)");
    const e4=py(PRE+X+"['drink']['yes'][0]=['「給我的？」'];M.build_friends(s2,'x',I)");
    const e5=py(PRE+"k=[];r=M.build_friends(s2,'x',I,k);assert list(r['people'])==['classmate_xinci'] and k==['zhe','kai','yu','classmate_bohan','classmate_mingxuan'],(list(r['people']),k)");
    const e6=py(PRE+"s2['_meta']['status']='';M.build_friends(s2,'x',I)");
    const e7=py(PRE+"del s2['people']['zhe']['unused'];r=M.build_friends(s2,'x',I);assert sorted(r['people'])==['classmate_xinci','zhe'] and len(r['people']['zhe']['drink']['pool'])==3,list(r['people'])");
    const e8=py(PRE+"s2['people']['classmate_xinci']['unused']='x';M.build_friends(s2,'x',I)");
    check('0. 匯入工具：characters.js 沒有的人、notes 的好感那一句改了、朋友多了 fav、有名字的句子外面加「」 → 停下來；原稿通過＝只匯芯慈、跳過的五位印得出來',/characters\.js 沒有這個人/.test(e1)&&/讀不到/.test(e2)&&/朋友只有 yes/.test(e3)&&/TEXT-QUOTE-UNIFY/.test(e4)&&e5==='ran',[e1,e2,e3,e4,e5].map(s=>s.trim().split('\n').pop()).join(' | '));
    check('0. 匯入工具（unused）：有人寫 unused 而 _meta.status 沒有「…不用（台詞留在這份當紀錄，不匯入）」→ 停；稿把阿哲的 unused 拿掉＝阿哲照樣匯得進來；每一位都 unused → 停',/寫了 unused/.test(e6)&&e7==='ran'&&/沒有人可以匯/.test(e8),[e6,e7,e8].map(s=>s.trim().split('\n').pop()).join(' | ')); }
  const catOf=n=>GIFT.CAT[n];
  const fresh=(key,hour)=>{ const G=H.fresh(key||'2025-09-16',hour==null?9:hour,'campus'); G.money=5000; return G; };
  const mk=(G,n)=>{ G.carry=[]; const c={n,cat:catOf(n),day:G.day,shop:'便利商店'}; G.carry.push(c); return c; };
  const split=ls=>[].concat(...ls.map(t=>{ const s=GIFT.text(H.G,t), m=/^(（[^）]*）)(.+)$/.exec(s); return m?[m[1],m[2]]:[s]; }));
  const give=async(G,id,n)=>{ const c=mk(G,n); H.said=[]; const r=await GIFT.give(GM,who(id),id,c); const s=H.said.map(x=>x.t); return {r,s:r==='no'?s:s.slice(1),first:s[0],raw:H.said.slice(),c}; };
  const idx=(gs,s)=>gs.findIndex(g=>same(split(g.lines),s));
  /* 0b 只給可攻略的對象（使用者 11-08 15:2x「送飲料只需要給可攻略的對象」「飲料改完再發布」；X266、GIFT-ROMANCE-ONLY-1108）：
     預設只有芯慈（可以攻略）照朋友版還收得到；阿哲、阿凱、Alison、柏翰、明軒當面說話不會出現「送他／她○○」、GIFT.give 不收（東西還在身上）；七位女主角照舊 */
  { const OK0=Object.assign({},GIFT.FRIEND_OK||{}); const NO=['zhe','kai','yu','classmate_bohan','classmate_mingxuan'];
    check('0b. 預設可以送的朋友只有芯慈（GIFT.FRIEND_OK）',same(Object.keys(OK0).filter(k=>OK0[k]).sort(),['classmate_xinci']),J(Object.keys(OK0)));
    const XC0=globalThis.XCROM; globalThis.XCROM={ON:true};   /* 芯慈：XCROM.ON 才能送（AA-B 15:33）；harness 沒載 xcrom3d.js，用替身，下面另外查遊戲裡現在是打開的 */
    const bad=[]; for(const id of NO){ const G=fresh(); mk(G,'青茶'); G.carry.push({n:'飯糰',cat:'breakfast',day:G.day,shop:'便利商店'});
      const viaStory=STORY.TALK_OPTS.some(f=>{ try{ return (f(G,id,GM)||[]).length>0; }catch(e){ return false; } });
      if(GIFT.talkOpts(G,id).length||viaStory) bad.push(id+' 有選項');
      H.said=[]; const c=G.carry[0]; const r=await GIFT.give(GM,who(id),id,c); if(r!==null||H.said.length||!G.carry.includes(c)) bad.push(id+' give='+r); }
    check('0b. 阿哲、阿凱、Alison、柏翰、明軒：當面說話沒有「送○○」、GIFT.give 不收（不說話、東西留著）',!bad.length,J(bad));
    { const G=fresh(); mk(G,'青茶'); check('0b. 芯慈（她的線打開，XCROM.ON）照舊有「送她青茶」',same(GIFT.talkOpts(G,'classmate_xinci').map(x=>x.t),['送她青茶']));
      globalThis.XCROM={ON:false}; check('0b. 芯慈的線關著（XCROM.ON false）＝跟朋友一樣不能送',GIFT.talkOpts(G,'classmate_xinci').length===0); globalThis.XCROM={ON:true}; }
    check('0b. 遊戲裡芯慈的線現在是打開的（src/xcrom3d.js S.ON=true）',/\n\s*S\.ON=true;/.test(fs.readFileSync(path.join(H.ROOT,'src/xcrom3d.js'),'utf8')));
    { const G=fresh(); mk(G,'青茶'); const hs=Object.keys(GIFT_LINES.people||{}); check('0b. 七位女主角照舊有「送她○○」（AA_710）',hs.length===7&&hs.every(id=>GIFT.talkOpts(G,id).length>0),J(hs.filter(id=>!GIFT.talkOpts(G,id).length))); }
    /* 就算把那五位在 GIFT.FRIEND_OK 打開，資料裡沒有他們（bb3bdad7df 不匯入）＝還是沒有選項、不收、不丟例外 */
    { GIFT.FRIEND_OK=Object.fromEntries(IDS.concat(UNUSED).map(id=>[id,true])); const bad2=[];
      for(const id of UNUSED){ const G=fresh(); mk(G,'青茶'); let r='x', err=null; try{ H.said=[]; r=await GIFT.give(GM,who(id),id,G.carry[0]); }catch(e){ err=e; } if(err||r!==null||H.said.length||GIFT.talkOpts(G,id).length||G.carry.length!==1) bad2.push(id+' '+r+' '+err); }
      check('0b. 那五位就算在 FRIEND_OK 打開也沒有「送○○」（稿標 unused、資料沒有）；不丟例外、東西留著',!bad2.length,J(bad2)); }
    /* 下面 1～6 驗朋友版本身（芯慈在用；舊：六位都打開來測）*/
    GIFT.FRIEND_OK=Object.fromEntries(IDS.map(id=>[id,true])); }
  /* 1 選項 */
  { const bad=[];
    for(const id of IDS){ const G=fresh(); const O0=GIFT.talkOpts(G,id); mk(G,'青茶'); G.carry.push({n:'飯糰',cat:'breakfast',day:G.day,shop:'便利商店'});
      const O=GIFT.talkOpts(G,id).map(x=>x.t), want=['送'+PRON[id]+'青茶','送'+PRON[id]+'飯糰'];
      const viaStory=STORY.TALK_OPTS.some(f=>{ try{ return (f(G,id,GM)||[]).some(x=>x.t===want[0]); }catch(e){ return false; } });
      if(O0.length||!same(O,want)||!viaStory) bad.push(id+' '+J(O)); }
    const other=Object.keys(CHARACTERS).find(id=>!IDS.includes(id)&&!(GIFT_LINES.people||{})[id]); const G=fresh(); mk(G,'青茶');
    check('1. 當面說話：芯慈「送她○○」（舊：六位，他／她照性別；帶著的每一樣一個、掛在 STORY.TALK_OPTS；沒帶東西不出）；別人（'+other+'）不出',!bad.length&&!!other&&!GIFT.talkOpts(G,other).length&&same(GIFT.talkOpts(G,'heroine_01').map(x=>x.t),['送她青茶']),bad.join('；')); }
  /* 2 輪流 */
  { const bad=[], rr=[];
    for(const id of IDS){ const G=fresh(), s=[]; for(let k=0;k<=3;k++){ const h=await give(G,id,'青茶'); if(h.r!=='yes') bad.push(id+' 第 '+k+' 次 '+h.r); s.push(idx(P[id].drink.pool,h.s)); G.day+=1; }
      rr.push(id+':'+s.join('')); if(s.join('')!=='0120') bad.push(id+' 飲料 '+s.join('')); }
    check('2. 飲料 yes（芯慈；舊：六位）：每天送一次，三組輪流、同一組不連續（0120）',!bad.length,rr.join(' ')+' '+bad.join('；'));
    const G2=fresh(), s2=[]; for(let k=0;k<2;k++){ const h=await give(G2,'classmate_xinci','三明治'); s2.push(idx(P.classmate_xinci.breakfast.pool,h.s)); G2.day+=1; }
    const G3=fresh(); const k1=await give(G3,'classmate_xinci','豆漿');
    /* 舊期望：阿凱早餐兩組輪流 010、阿凱收到豆漿＝飲料那一格、補了早餐的四位 010、2b 四位第二次送早餐的 no 不提「喝」——那五位不匯入了，拿掉；豆漿算飲料改用芯慈驗 */
    check('2. 早餐：芯慈只有一組（00）；豆漿、米漿是飲料（芯慈收到豆漿＝飲料那一格）',s2.join('')==='00'&&idx(P.classmate_xinci.drink.pool,k1.s)===0&&idx(P.classmate_xinci.breakfast.pool,k1.s)<0,J([s2,k1.s]));
    const G5=fresh(); const a=await give(G5,'classmate_xinci','青茶'), b=await give(G5,'classmate_xinci','飯糰');
    check('2. 同一天先飲料再早餐：兩樣都收、各用各的那一格',a.r==='yes'&&b.r==='yes'&&idx(P.classmate_xinci.drink.pool,a.s)===0&&idx(P.classmate_xinci.breakfast.pool,b.s)===0,J([a.r,b.r])); }
  /* 3 好感 */
  { const bad=[];
    for(const id of IDS){ const G=fresh(); const r0=Object.assign({},SOCIAL.rel(id)); await give(G,id,'青茶'); const r1=Object.assign({},SOCIAL.rel(id)); await give(G,id,'飯糰'); const r2=Object.assign({},SOCIAL.rel(id)); G.day+=1; await give(G,id,'飯糰'); const r3=Object.assign({},SOCIAL.rel(id));
      const d=(a,b)=>({fam:b.fam-a.fam,comf:b.comf-a.comf,trust:b.trust-a.trust,npcRom:(b.npcRom|0)-(a.npcRom|0),rom:(b.rom|0)-(a.rom|0)});
      const one={fam:1,comf:1,trust:0,npcRom:0,rom:0}, zero={fam:0,comf:0,trust:0,npcRom:0,rom:0};
      if(!same(d(r0,r1),one)||!same(d(r1,r2),zero)||!same(d(r2,r3),one)) bad.push(id+' '+J([d(r0,r1),d(r1,r2),d(r2,r3)])); }
    check('3. 好感（芯慈；舊：六位）：一天第一次收下 fam+1、comf+1；同一天再收另一種不加；隔天再 +1／+1；npcRom、rom 都不變',!bad.length,bad.join('；')); }
  /* 4 no */
  { const bad=[];
    for(const id of IDS) for(const [n1,n2] of [['青茶','美式咖啡'],['飯糰','三明治']]){ const G=fresh(); await give(G,id,n1); const r0=Object.assign({},SOCIAL.rel(id)); const h=await give(G,id,n2); const r1=SOCIAL.rel(id); const h2=await give(G,id,n2);
      if(h.r!=='no'||idx(P[id].no,h.s)!==0||h2.r!=='no'||idx(P[id].no,h2.s)!==0) bad.push(id+' '+n2+' '+J([h.r,h.s]));
      if(r1.fam!==r0.fam||r1.comf!==r0.comf) bad.push(id+' no 加了好感');
      if(G.carry.length!==1||G.carry[0].n!==n2) bad.push(id+' 東西沒留著'); }
    check('4. 同一天第二次送同一種（飲料、早餐都測；沒有早餐那一格的也一樣）：no（AA_728 那一句）、好感不變、東西留著',!bad.length,bad.join('；')); }
  /* 5 播放 */
  { /* 舊：阿哲第三組「（他舉起杯子跟你碰了一下。）乾。」（寫死的字）。改成芯慈、字從資料讀：飲料那一格裡第一句是（動作）＋講的話的那一組 */
    const pool=P.classmate_xinci.drink.pool, gi=pool.findIndex(g=>/^（[^）]*）.+/.test(g.lines[0])), raw=gi>=0?pool[gi].lines[0]:'', m=/^(（[^）]*）)(.+)$/.exec(raw);
    const G=fresh(); const h=await give(G,'classmate_xinci','青茶'); let hk=h; for(let k=0;k<gi;k++){ G.day+=1; hk=await give(G,'classmate_xinci','青茶'); }
    const w=hk.raw, want=m?[{who:null,t:'你把青茶遞給芯慈。'},{who:null,t:m[1]},{who:'芯慈',t:m[2]}].concat(pool[gi].lines.slice(1).map(t=>({who:'芯慈',t}))):null;
    check('5. 「你把青茶遞給芯慈。」、她說的有名字；一句開頭是（動作）、後面接著講話的拆成旁白＋她說的（字不改，從資料讀）',gi>0&&h.first==='你把青茶遞給芯慈。'&&h.raw[1].who==='芯慈'&&h.raw[1].t===pool[0].lines[0]&&same(w,want),J(w)); }
  /* 6 芯慈、女主角 */
  { const G=fresh(); G.flags.dating_classmate_xinci=true; const r0=Object.assign({},SOCIAL.rel('classmate_xinci')); const h=await give(G,'classmate_xinci','青茶'); const r1=SOCIAL.rel('classmate_xinci');
    check('6. 芯慈交往中也照朋友版（AA_728：她收東西很拘謹）、好感 +1／+1、沒有戀愛',!(GIFT_LINES.people||{}).classmate_xinci&&h.r==='yes'&&idx(P.classmate_xinci.drink.pool,h.s)===0&&r1.fam-r0.fam===1&&r1.comf-r0.comf===1&&(r1.npcRom|0)===(r0.npcRom|0),J([h.r,h.s]));
    const G2=fresh(); const k=await give(G2,'heroine_02','青茶');
    check('6. 女主角照 AA_710（芷若收到青茶＝她的 yes，不是朋友那幾句）',k.r==='yes'&&GIFT_LINES.people.heroine_02.drink.yes.some(y=>y.pool.some(g=>same(split(g.lines),k.s))),J(k.s)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
