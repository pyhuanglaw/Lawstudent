// 只有立繪的人物（characters.js 的 PORTRAIT_ONLY）的台詞要有立繪——不需要瀏覽器。用法：node tests/portrait_only_unit.js
//   原本（2026-10-20）是為外校室友寫的；AA_938 第 2 節（CANON-NO-ECON-1112）把她整個人拿掉了（PORTRAIT_ONLY、立繪檔、立繪表），這支改用 Kevin（npc_kevin，11-02 第 106 組立繪、只有 campus/neutral）測同一套機制，
//   另外核對外校室友真的不在了（id、名字、立繪檔、PORTRAIT_FILES），舊存檔記到她的 id 也不會壞。
// 檢查：
//   1. 資料：PORTRAIT_ONLY.npc_kevin；CHARACTERS 沒有 npc_kevin；立繪檔都在；每個有立繪資料夾的 id 都在 CHARACTERS 或 PORTRAIT_ONLY；外校室友（yule）不在 PORTRAIT_ONLY／PORTRAIT_FILES／assets、src 沒有她的名字
//   2. 稱呼對到 id：'Kevin'→npc_kevin、'npc_kevin'→npc_kevin；kexin、邵鈞、大伯照舊；yule 對不到人（照原樣）
//   3. 立繪解析：沒有的表情用 neutral；沒有立繪的配角照舊 compact（placeholder）；yule 是 placeholder
//   4. 事件的台詞（EVENTS.runLines）：speaker 'Kevin'／'npc_kevin' → 對話框「Kevin」、ADV 台上是他的立繪；邵鈞照舊沒有立繪；舊存檔殘留的 speaker 'yule' 不會壞（沒有立繪、不佔框）
//   5. 偶遇（ENC.sayer）：Kevin → charId npc_kevin；可昕同行的 intro、datingAfter 都是旁白
//   6. 沒有 charId 的說話者（game3d.js 的 say → ADV.speaker('player')）：不佔立繪框、不會出現祐廷的立繪（祐廷沒有立繪檔），台上的人變暗
//   7. 存檔：跑完以上，G.social 沒有 npc_kevin、yule 的關係、記憶；CHARACTERS 還是沒有 npc_kevin
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.location={search:''}; global.navigator={userAgent:'node'};
/* adv3d.js 用到的最小 DOM：建元素、class、加子元素、找 img、innerHTML 清空；Image 照 repo 裡有沒有檔決定 onload／onerror */
class El{ constructor(t){ this.tagName=String(t).toUpperCase(); this.children=[]; this.style={}; this.id=''; this.textContent=''; this.cls=new Set(); this.src=''; this.onclick=null; }
  get className(){ return [...this.cls].join(' '); } set className(v){ this.cls=new Set(String(v).split(/\s+/).filter(Boolean)); }
  get classList(){ const s=this.cls; return {add:(...c)=>c.forEach(x=>s.add(x)),remove:(...c)=>c.forEach(x=>s.delete(x)),contains:c=>s.has(c),toggle:(c,f)=>{ const on=f===undefined?!s.has(c):!!f; if(on) s.add(c); else s.delete(c); return on; }}; }
  appendChild(c){ this.children.push(c); return c; }
  querySelector(sel){ const T=sel.toUpperCase(); const walk=n=>{ for(const c of n.children){ if(c.tagName===T) return c; const r=walk(c); if(r) return r; } return null; }; return walk(this); }
  set innerHTML(v){ this.children=[]; } get innerHTML(){ return ''; } }
global.document={createElement:t=>new El(t),head:new El('head'),body:new El('body'),getElementById:()=>null,addEventListener(){}};
global.Image=class{ constructor(){ this.onload=null; this.onerror=null; this._s=''; } get src(){ return this._s; }
  set src(u){ this._s=u; setTimeout(()=>{ if(fs.existsSync(path.join(ROOT,u))){ if(this.onload) this.onload(); } else if(this.onerror) this.onerror(); },0); } };
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f});
for(const f of ['src/data/characters.js','src/data/portrait_manifest.js','src/social3d.js','src/events3d.js','src/adv3d.js','src/data/encounters.js','src/data/enc_walk.js','src/encounter3d.js']) load(f);
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const PO=typeof PORTRAIT_ONLY!=='undefined'?PORTRAIT_ONLY:{};
const KV='assets/portraits/npc_kevin/campus/';
const GONE_NAME='\u4e88\u6a02';   /* 外校室友的名字（D158 不留字：寫成跳脫）*/

(async()=>{
  // 1. 資料
  check('1. PORTRAIT_ONLY.npc_kevin：名字「Kevin」、稱呼有「Kevin」、男生',!!PO.npc_kevin&&PO.npc_kevin.name==='Kevin'&&(PO.npc_kevin.alias||[]).includes('Kevin')&&PO.npc_kevin.gender==='m',JSON.stringify(PO.npc_kevin));
  const ids=[]; for(const id in CHARACTERS) ids.push(id);
  check('1. CHARACTERS 沒有 npc_kevin（for in CHARACTERS 看不到他），也沒有人用「Kevin」當名字或稱呼',!CHARACTERS.npc_kevin&&!ids.includes('npc_kevin')&&!ids.some(id=>CHARACTERS[id].name==='Kevin'||(CHARACTERS[id].alias||[]).includes('Kevin')));
  check('1. 立繪檔：campus/neutral 在（PORTRAIT_FILES 也有）',fs.existsSync(path.join(ROOT,KV+'neutral.webp'))&&!!PORTRAIT_FILES.npc_kevin&&PORTRAIT_FILES.npc_kevin.campus.includes('neutral'));
  /* 舊序章人物的立繪資料夾（econ_*）還在、人物拿掉了（CANON-NO-ECON-1112 第三批：這一項拿掉）：檔案等 LAWWW2 刪，這裡先不算 */
  const orphan=fs.readdirSync(path.join(ROOT,'assets/portraits')).filter(d=>!CHARACTERS[d]&&!PO[d]&&!/^econ_/.test(d));
  check('1. 每個有立繪資料夾的 id 都在 CHARACTERS 或 PORTRAIT_ONLY（只有立繪、沒登錄的人台詞會沒有立繪）',!orphan.length,orphan.join(','));
  { const srcFiles=[]; const walk=d=>{ for(const f of fs.readdirSync(path.join(ROOT,d))){ const q=d+'/'+f; if(fs.statSync(path.join(ROOT,q)).isDirectory()) walk(q); else if(/\.(js|json)$/.test(f)) srcFiles.push(q); } }; walk('src');
    const hit=srcFiles.filter(f=>fs.readFileSync(path.join(ROOT,f),'utf8').includes(GONE_NAME));
    const spk=srcFiles.filter(f=>/(speaker|who|charId)\s*:\s*['"]yule['"]/.test(fs.readFileSync(path.join(ROOT,f),'utf8')));
    check('1. 外校室友拿掉了（AA_938 第 2 節）：PORTRAIT_ONLY、PORTRAIT_FILES、CHARACTERS 沒有 yule；assets/portraits/yule 不在；src 沒有她的名字、沒有 speaker／who／charId 寫 yule',
      !PO.yule&&!PORTRAIT_FILES.yule&&!CHARACTERS.yule&&!fs.existsSync(path.join(ROOT,'assets/portraits/yule'))&&!hit.length&&!spk.length,JSON.stringify([hit,spk])); }

  // 2. 稱呼 → id
  check('2. speakerId：「Kevin」→ npc_kevin、npc_kevin → npc_kevin',EVENTS.speakerId('Kevin')==='npc_kevin'&&EVENTS.speakerId('npc_kevin')==='npc_kevin');
  check('2. 其他照舊：kexin → kexin、邵鈞、大伯照原樣、player／null 不變（阿勳那一項（CANON-NO-ECON-1112 第三批：這一項拿掉））',EVENTS.speakerId('kexin')==='kexin'&&EVENTS.speakerId('邵鈞')==='邵鈞'&&EVENTS.speakerId('大伯')==='大伯'&&EVENTS.speakerId('player')==='player'&&EVENTS.speakerId(null)===null);
  check('2. 外校室友對不到人：speakerId(yule)、speakerId(她的名字) 照原樣',EVENTS.speakerId('yule')==='yule'&&EVENTS.speakerId(GONE_NAME)===GONE_NAME);
  check('2. SOCIAL.displayName：npc_kevin →「Kevin」（不是 id）；不認得的照原樣（舊存檔的 yule 也不會壞）',SOCIAL.displayName('npc_kevin')==='Kevin'&&SOCIAL.displayName('大伯')==='大伯'&&SOCIAL.displayName('yule')==='yule');

  // 3. 立繪解析
  const rt=ADV.resolve('npc_kevin',undefined,'teasing'), rn=ADV.resolve('npc_kevin');
  check('3. 沒有的表情（teasing）、沒寫表情 → neutral',!rt.placeholder&&rt.chain[0]===KV+'neutral.webp'&&!rn.placeholder&&rn.chain[0]===KV+'neutral.webp',JSON.stringify([rt.chain,rn.chain]));
  check('3. 立繪登錄的名字「Kevin」、男生；CHARACTERS 還是沒有他',!!PORTRAITS.npc_kevin&&PORTRAITS.npc_kevin.displayName==='Kevin'&&PORTRAITS.npc_kevin.silhouette==='m'&&!CHARACTERS.npc_kevin,JSON.stringify(PORTRAITS.npc_kevin&&{d:PORTRAITS.npc_kevin.displayName,s:PORTRAITS.npc_kevin.silhouette}));
  const noPic=ids.find(id=>!PORTRAIT_FILES[id]&&!PORTRAITS[id]);
  check('3. 沒有立繪的配角照舊 compact：邵鈞、大伯、'+noPic+'（CHARACTERS 裡沒有立繪檔的人）、yule 都是 placeholder',ADV.resolve('邵鈞').placeholder&&ADV.resolve('大伯').placeholder&&!!noPic&&ADV.resolve(noPic).placeholder&&ADV.resolve('player').placeholder&&ADV.resolve('yule').placeholder&&!PORTRAITS.yule);
  check('3. 可昕照舊有立繪',!ADV.resolve('kexin').placeholder);

  // 4、5、6 共用：遊戲的 G、GM 替身（GM.say 照 game3d.js 的 say 叫 ADV：有 charId＝那個人說話，沒有＝ADV.speaker('player')；第 6 項核對原始碼）
  const G={day:400,hour:19,zone:'campus',weekday:6,weather:'clear',flags:{dating_kexin:true},events:{done:{},last:{},count:0},name:'祐廷',social:null,daily:{},trip:{walk:0}};
  SOCIAL.bind(G); SOCIAL.remember('kexin','FIRST_MET','');
  const said=[]; let pick=[];
  const settle=()=>new Promise(r=>setTimeout(r,200));   /* ADV 的 render 是非同步：載圖、120 ms 後換圖 */
  const stage=()=>{ const o={}; for(const s of ['left','right']){ const box=s==='left'?ADV.L:ADV.R, im=box.querySelector('img'), sl=ADV.slots[s]; o[s]={id:sl?sl.charId:null,compact:!!(sl&&sl.compact),img:im?im.src:null,show:box.classList.contains('show'),dim:box.classList.contains('dim')}; } o.last=ADV.lastSlot; return o; };
  const GM={G,E:{player:{obj:{position:{x:0,y:0,z:0}},lv:0},npcs:[],zone:{}},npc:{},D:{active:false},
    say:async(who,text,opts)=>{ opts=opts||{}; if(ADV.active){ if(who&&who.charId) ADV.speaker(who.charId,opts.expression); else ADV.speaker(who?'player':null); } await settle(); said.push({name:who?(who.name||String(who)):null,charId:who&&who.charId||null,text,st:stage()}); },
    choose:async()=>pick.length?pick.shift():0,caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},toast(){},sceneBegin(){},sceneEnd(){}};
  EVENTS.bind(GM);
  const line=t=>said.find(s=>s.text===t);
  const kvOnStage=s=>{ const k=['left','right'].find(q=>s.st[q].id==='npc_kevin'); return !!k&&s.st[k].img===KV+'neutral.webp'&&s.st[k].show&&!s.st[k].dim&&s.st.last===k; };

  // 4. 事件的台詞（事件包、出遊都走 EVENTS.runLines）
  ADV.begin({background:'dark',right:{charId:'kexin',expression:'neutral'}}); await settle();
  const L4=[{speaker:'Kevin',text:'（測試）寫稱呼的一句'},{speaker:'kexin',expression:'neutral',text:'（測試）可昕的一句'},{speaker:'npc_kevin',expression:'smile',text:'（測試）寫 id 的一句'},{speaker:'yule',text:'（測試）舊的 speaker yule'},{speaker:'邵鈞',text:'（測試）邵鈞的一句'}];
  await EVENTS.runLines(L4,{id:'test_portrait_only'}); ADV.end();
  const a=line('（測試）寫稱呼的一句'), b=line('（測試）寫 id 的一句'), k=line('（測試）可昕的一句'), y=line('（測試）舊的 speaker yule'), s=line('（測試）邵鈞的一句');
  check('4. speaker「Kevin」：對話框「Kevin」、charId npc_kevin',!!a&&a.name==='Kevin'&&a.charId==='npc_kevin',JSON.stringify(a&&{name:a.name,id:a.charId}));
  check('4. 「Kevin」說話時台上是他的立繪（neutral，亮著、是說話的那一框），可昕變暗',!!a&&kvOnStage(a)&&['left','right'].some(q=>a.st[q].id==='kexin'&&a.st[q].dim),JSON.stringify(a&&a.st));
  check('4. 可昕說話時換回可昕（Kevin 那一框變暗）',!!k&&['left','right'].some(q=>k.st[q].id==='kexin'&&!k.st[q].dim&&k.st.last===q)&&['left','right'].some(q=>k.st[q].id==='npc_kevin'&&k.st[q].dim),JSON.stringify(k&&k.st));
  check('4. speaker 寫 id「npc_kevin」：對話框也是「Kevin」（不是 id）；他沒有的表情（smile）→ neutral',!!b&&b.name==='Kevin'&&b.charId==='npc_kevin'&&['left','right'].some(q=>b.st[q].id==='npc_kevin'&&b.st[q].img===KV+'neutral.webp'),JSON.stringify(b&&b.st));
  check('4. 舊的 speaker「yule」（拿掉的人）：照樣跑完、沒有她的立繪',!!y&&!['left','right'].some(q=>String(y.st[q].img||'').includes('portraits/yule')),JSON.stringify(y&&y.st));
  check('4. 邵鈞（沒有立繪）：對話框「邵鈞」、不佔框、台上的人都變暗（BUG-ADV-NOPORTRAIT-DIM-1103；原本佔一框 compact、只暗另一邊）',!!s&&s.name==='邵鈞'&&!['left','right'].some(q=>s.st[q].id==='邵鈞')&&['left','right'].every(q=>!s.st[q].show||s.st[q].dim),JSON.stringify(s&&s.st));

  // 5. 偶遇：sayer；可昕同行的 intro、datingAfter 都是旁白（CANON-NO-ECON-1112 第四、五批：AA_893、AA_919 第 1 節，室友不上畫面、改旁白）
  check('5. ENC.sayer：Kevin、npc_kevin → {name:Kevin, charId:npc_kevin}；綁馬尾的小女生、yule 只有名字；kexin → charId kexin',typeof ENC.sayer==='function'&&JSON.stringify(ENC.sayer('Kevin'))===JSON.stringify({name:'Kevin',charId:'npc_kevin'})&&JSON.stringify(ENC.sayer('npc_kevin'))===JSON.stringify({name:'Kevin',charId:'npc_kevin'})&&JSON.stringify(ENC.sayer('綁馬尾的小女生'))===JSON.stringify({name:'綁馬尾的小女生'})&&JSON.stringify(ENC.sayer('yule'))===JSON.stringify({name:'yule'})&&ENC.sayer('kexin').charId==='kexin');
  const intro=(ENC_WALK.intro||[]).filter(q=>q.who==='kexin'), after=(ENCOUNTERS.rows||[]).filter(r=>r.who==='kexin'&&r.lines&&r.lines.datingAfter);
  check('5. 可昕同行的 intro（'+intro.length+' 句）、datingAfter（'+after.length+' 句）都是旁白',intro.length>=3&&intro.every(q=>q.speaker===null)&&after.length>=1&&after.every(r=>r.lines.datingAfter.who===null));
  const row04=ENCOUNTERS.rows.find(r=>r.who==='kexin'&&r.spot==='D04'), t04=(ENC_WALK.intro||[]).find(q=>q.who==='kexin'&&q.spot==='D04');
  said.length=0; ADV.begin({background:'dark'}); pick=[2]; const r1=await ENC.meet(GM,row04,{t:'dating'}); ADV.end();
  const i1=t04&&line(t04.line);
  check('5. 西門町一起走（'+r1+'）：「'+(t04&&t04.line)+'」是旁白（沒有名字、沒有立繪）',r1==='join'&&!!i1&&!i1.name&&!i1.charId,JSON.stringify(said.map(x=>x.name+'：'+x.text)));
  const esrc=fs.readFileSync(path.join(ROOT,'src/encounter3d.js'),'utf8');
  check('5. encounter3d.js：intro、datingAfter 都經過 sayer（不再只給名字）',/S\.sayer\(q\.speaker\)/.test(esrc)&&/S\.sayer\(a\.who\)/.test(esrc));

  // 6. 沒有 charId 的說話者：ADV.speaker('player')
  const gsrc=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
  check('6. game3d.js 的 say：有 charId（或名字對到唯一有立繪檔的人物，say_name_portrait_unit.js）＝ADV.speaker(charId)；沒有＝ADV.speaker(who?\'player\':null)',gsrc.includes('if(cid) ADV.speaker(cid,')&&gsrc.includes('const cid=who&&(who.charId||')&&gsrc.includes("else ADV.speaker(who?'player':null);"));
  said.length=0; ADV.begin({background:'dark',right:{charId:'kexin',expression:'neutral'}}); await settle();
  await GM.say({name:'（測試）只有名字'},'（測試）只有名字的一句'); const p=said[0]; ADV.end();
  check('6. ADV.speaker(\'player\')：不佔立繪框、沒有新的圖（祐廷沒有立繪檔，不會出現祐廷），台上的可昕變暗',!!p&&!['left','right'].some(q=>p.st[q].id==='player')&&p.st.right.id==='kexin'&&p.st.right.dim&&!p.st.left.img&&!PORTRAIT_FILES.player&&!fs.existsSync(path.join(ROOT,'assets/portraits/player')),JSON.stringify(p&&p.st));

  // 7. 存檔、CHARACTERS
  check('7. G.social 沒有 npc_kevin、yule 的關係、記憶；CHARACTERS 還是沒有 npc_kevin',!G.social.rel.npc_kevin&&!G.social.mem.npc_kevin&&!G.social.rel.yule&&!G.social.mem.yule&&!CHARACTERS.npc_kevin&&!CHARACTERS.yule);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
