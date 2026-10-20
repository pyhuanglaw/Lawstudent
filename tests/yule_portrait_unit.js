// 予樂（yule，可昕的政大室友）的台詞要有立繪（2026-10-20，LAWWW-C 派工）——不需要瀏覽器。用法：node tests/yule_portrait_unit.js
//   她有正式立繪（assets/portraits/yule/campus/，BB-B 驗收過），但不在 CHARACTERS（沒有 3D 模型，不要硬加成完整人物）。原本：
//   ADV 只替 CHARACTERS 的人照檔案補登立繪（adv3d.js regFromFiles）、EVENTS.speakerId 只認 CHARACTERS 的 alias、偶遇的同行句只給名字 {name:'予樂'}——
//   她的台詞（大一上 K1b 政大「予樂說：及格」、12/3「第一份報告交出去的晚上」、大二電影夜 12/11、兩邊的朋友、生日、老街，西門町／淡水／貓空／碧潭的偶遇）都沒有立繪。
//   現在：characters.js 的 PORTRAIT_ONLY（只有立繪的人物）登錄 yule；speaker 寫 '予樂' 或 'yule' 都對到 yule，ADV 顯示她的立繪，對話框的名字「予樂」。
// 檢查：
//   1. 資料：PORTRAIT_ONLY.yule；CHARACTERS 沒有 yule（for in CHARACTERS 看不到）；立繪檔都在；每個有立繪資料夾的 id 都在 CHARACTERS 或 PORTRAIT_ONLY
//   2. 稱呼對到 id：'予樂'→yule、'yule'→yule；阿勳、kexin、邵鈞、大伯照舊
//   3. 立繪解析：有的表情用表情、沒有的用 neutral；沒有立繪的配角照舊 compact（placeholder）
//   4. 事件的台詞（EVENTS.runLines，出遊的事件也走這裡）：speaker '予樂'／'yule' → 對話框「予樂」、ADV 台上是她的立繪；邵鈞照舊沒有立繪
//   5. 偶遇（ENC.meet）：西門町同行的 intro（speaker 'yule'）、淡水的 datingAfter（who '予樂'）→ charId yule、名字「予樂」、ADV 台上是她的立繪
//   6. 沒有 charId 的說話者（game3d.js 的 say → ADV.speaker('player')）：不佔立繪框、不會出現祐廷的立繪（祐廷沒有立繪檔），台上的人變暗——原本予樂的偶遇句就是這樣
//   7. 存檔：跑完以上，G.social 沒有 yule 的關係、記憶；CHARACTERS 還是沒有 yule
// 修改前：PORTRAIT_ONLY 不存在、speakerId('予樂')＝'予樂'、ADV.resolve('yule') 是 placeholder、ENC.sayer 不存在（第 1～5 項失敗）。
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
const YL='assets/portraits/yule/campus/';

(async()=>{
  // 1. 資料
  check('1. PORTRAIT_ONLY.yule：名字「予樂」、稱呼有「予樂」、女生',!!PO.yule&&PO.yule.name==='予樂'&&(PO.yule.alias||[]).includes('予樂')&&PO.yule.gender==='f',JSON.stringify(PO.yule));
  const ids=[]; for(const id in CHARACTERS) ids.push(id);
  check('1. CHARACTERS 沒有 yule（for in CHARACTERS 看不到她），也沒有人用「予樂」當名字或稱呼',!CHARACTERS.yule&&!ids.includes('yule')&&!ids.some(id=>CHARACTERS[id].name==='予樂'||(CHARACTERS[id].alias||[]).includes('予樂')));
  check('1. 立繪檔：campus 的 neutral、smile、surprised 都在（PORTRAIT_FILES 也有）',['neutral','smile','surprised'].every(e=>fs.existsSync(path.join(ROOT,YL+e+'.webp'))&&PORTRAIT_FILES.yule&&PORTRAIT_FILES.yule.campus.includes(e)));
  const orphan=fs.readdirSync(path.join(ROOT,'assets/portraits')).filter(d=>!CHARACTERS[d]&&!PO[d]);
  check('1. 每個有立繪資料夾的 id 都在 CHARACTERS 或 PORTRAIT_ONLY（只有立繪、沒登錄的人台詞會沒有立繪）',!orphan.length,orphan.join(','));

  // 2. 稱呼 → id
  check('2. speakerId：「予樂」→ yule、yule → yule',EVENTS.speakerId('予樂')==='yule'&&EVENTS.speakerId('yule')==='yule');
  check('2. 其他照舊：阿勳 → econ_zhengxun、kexin → kexin、邵鈞、大伯照原樣、player／null 不變',EVENTS.speakerId('阿勳')==='econ_zhengxun'&&EVENTS.speakerId('kexin')==='kexin'&&EVENTS.speakerId('邵鈞')==='邵鈞'&&EVENTS.speakerId('大伯')==='大伯'&&EVENTS.speakerId('player')==='player'&&EVENTS.speakerId(null)===null);
  check('2. SOCIAL.displayName：yule →「予樂」（不是 id）；不認得的照原樣',SOCIAL.displayName('yule')==='予樂'&&SOCIAL.displayName('大伯')==='大伯');

  // 3. 立繪解析
  const rs=ADV.resolve('yule',undefined,'smile'), rt=ADV.resolve('yule',undefined,'teasing'), rn=ADV.resolve('yule');
  check('3. 有的表情用表情：smile → '+YL+'smile.webp（後面接 neutral）',!rs.placeholder&&rs.chain[0]===YL+'smile.webp'&&rs.chain.includes(YL+'neutral.webp'),JSON.stringify(rs.chain));
  check('3. 沒有的表情（teasing）、沒寫表情 → neutral',!rt.placeholder&&rt.chain[0]===YL+'neutral.webp'&&!rn.placeholder&&rn.chain[0]===YL+'neutral.webp',JSON.stringify([rt.chain,rn.chain]));
  check('3. 立繪登錄的名字「予樂」、女生；CHARACTERS 還是沒有她',PORTRAITS.yule&&PORTRAITS.yule.displayName==='予樂'&&PORTRAITS.yule.silhouette==='f'&&!CHARACTERS.yule);
  const noPic=ids.find(id=>!PORTRAIT_FILES[id]&&!PORTRAITS[id]);
  check('3. 沒有立繪的配角照舊 compact：邵鈞、大伯、'+noPic+'（CHARACTERS 裡沒有立繪檔的人）都是 placeholder',ADV.resolve('邵鈞').placeholder&&ADV.resolve('大伯').placeholder&&!!noPic&&ADV.resolve(noPic).placeholder&&ADV.resolve('player').placeholder);
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
  const yuleOnStage=s=>{ const k=['left','right'].find(q=>s.st[q].id==='yule'); return !!k&&s.st[k].img===YL+'neutral.webp'&&s.st[k].show&&!s.st[k].dim&&s.st.last===k; };

  // 4. 事件的台詞（事件包、出遊都走 EVENTS.runLines）
  ADV.begin({background:'dark',right:{charId:'kexin',expression:'neutral'}}); await settle();
  const L4=[{speaker:'予樂',text:'你就是那個……開車的？'},{speaker:'kexin',expression:'teasing',text:'予樂說要借你的筆記。我說要先問你。'},{speaker:'yule',expression:'smile',text:'（測試）寫 id 的一句'},{speaker:'yule',expression:'teasing',text:'（測試）她沒有的表情'},{speaker:'邵鈞',text:'……這個我有興趣。'}];
  await EVENTS.runLines(L4,{id:'test_yule'}); ADV.end();
  const a=line('你就是那個……開車的？'), b=line('（測試）寫 id 的一句'), c=line('（測試）她沒有的表情'), k=line('予樂說要借你的筆記。我說要先問你。'), s=line('……這個我有興趣。');
  check('4. speaker「予樂」：對話框「予樂」、charId yule',!!a&&a.name==='予樂'&&a.charId==='yule',JSON.stringify(a&&{name:a.name,id:a.charId}));
  check('4. 「予樂」說話時台上是她的立繪（neutral，亮著、是說話的那一框），可昕變暗',!!a&&yuleOnStage(a)&&['left','right'].some(q=>a.st[q].id==='kexin'&&a.st[q].dim),JSON.stringify(a&&a.st));
  check('4. 可昕說話時換回可昕（予樂那一框變暗）',!!k&&['left','right'].some(q=>k.st[q].id==='kexin'&&!k.st[q].dim&&k.st.last===q)&&['left','right'].some(q=>k.st[q].id==='yule'&&k.st[q].dim),JSON.stringify(k&&k.st));
  check('4. speaker 寫 id「yule」：對話框也是「予樂」（不是 id）；表情 smile 用 smile 那張',!!b&&b.name==='予樂'&&b.charId==='yule'&&['left','right'].some(q=>b.st[q].id==='yule'&&b.st[q].img===YL+'smile.webp'),JSON.stringify(b&&b.st));
  check('4. 她沒有的表情（teasing）→ neutral',!!c&&['left','right'].some(q=>c.st[q].id==='yule'&&c.st[q].img===YL+'neutral.webp'),JSON.stringify(c&&c.st));
  check('4. 邵鈞（沒有立繪）照舊：對話框「邵鈞」、那一框是 compact、沒有圖',!!s&&s.name==='邵鈞'&&['left','right'].some(q=>s.st[q].id==='邵鈞'&&s.st[q].compact&&!s.st[q].img),JSON.stringify(s&&s.st));

  // 5. 偶遇：西門町 D04 一起走（intro 的 speaker 'yule'）、淡水 D13 交往中（datingAfter 的 who '予樂'）
  check('5. ENC.sayer：yule、「予樂」→ {name:予樂, charId:yule}；綁馬尾的小女生只有名字；kexin → charId kexin',typeof ENC.sayer==='function'&&JSON.stringify(ENC.sayer('yule'))===JSON.stringify({name:'予樂',charId:'yule'})&&JSON.stringify(ENC.sayer('予樂'))===JSON.stringify({name:'予樂',charId:'yule'})&&JSON.stringify(ENC.sayer('綁馬尾的小女生'))===JSON.stringify({name:'綁馬尾的小女生'})&&ENC.sayer('kexin').charId==='kexin');
  const intro=(ENC_WALK.intro||[]).filter(q=>q.speaker==='yule'||q.speaker==='予樂'), after=(ENCOUNTERS.rows||[]).filter(r=>r.lines&&r.lines.datingAfter), sid=x=>typeof ENC.sayer==='function'?ENC.sayer(x).charId:null;
  check('5. 資料裡予樂的同行句（intro '+intro.length+' 句）、datingAfter（'+after.length+' 句）都對到 yule',intro.length>=3&&intro.every(q=>sid(q.speaker)==='yule')&&after.length>=1&&after.filter(r=>/予樂/.test(r.lines.datingAfter.who)).every(r=>sid(r.lines.datingAfter.who)==='yule'));
  const row04=ENCOUNTERS.rows.find(r=>r.who==='kexin'&&r.spot==='D04'), row13=ENCOUNTERS.rows.find(r=>r.who==='kexin'&&r.spot==='D13'), t04=(ENC_WALK.intro||[]).find(q=>q.who==='kexin'&&q.spot==='D04');
  said.length=0; ADV.begin({background:'dark'}); pick=[2]; const r1=await ENC.meet(GM,row04,{t:'dating'}); ADV.end();
  const i1=t04&&line(t04.line);
  check('5. 西門町一起走（'+r1+'）：予樂「'+(t04&&t04.line)+'」對話框「予樂」、charId yule',r1==='join'&&!!i1&&i1.name==='予樂'&&i1.charId==='yule',JSON.stringify(said.map(x=>x.name+'：'+x.text)));
  check('5. 西門町：予樂說話時台上是她的立繪、可昕變暗',!!i1&&yuleOnStage(i1)&&['left','right'].some(q=>i1.st[q].id==='kexin'&&i1.st[q].dim),JSON.stringify(i1&&i1.st));
  said.length=0; G.trip={walk:0}; ADV.begin({background:'dark'}); pick=[0]; const r2=await ENC.meet(GM,row13,{t:'dating'}); ADV.end();
  const i2=line(row13.lines.datingAfter.text);
  check('5. 淡水交往中（'+r2+'）：「'+row13.lines.datingAfter.text+'」對話框「予樂」、台上是她的立繪',!!i2&&i2.name==='予樂'&&i2.charId==='yule'&&yuleOnStage(i2),JSON.stringify(i2));
  const esrc=fs.readFileSync(path.join(ROOT,'src/encounter3d.js'),'utf8');
  check('5. encounter3d.js：intro、datingAfter 都經過 sayer（不再只給名字）',/ESAY\(GM,S\.sayer\(q\.speaker\)/.test(esrc)&&/ESAY\(GM,S\.sayer\(a\.who\)/.test(esrc)&&!/name:q\.speaker==='yule'\?'予樂'/.test(esrc));

  // 6. 沒有 charId 的說話者：ADV.speaker('player')
  const gsrc=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
  check('6. game3d.js 的 say：有 charId＝ADV.speaker(charId)；沒有＝ADV.speaker(who?\'player\':null)',gsrc.includes('if(who&&who.charId) ADV.speaker(who.charId,')&&gsrc.includes("else ADV.speaker(who?'player':null);"));
  said.length=0; ADV.begin({background:'dark',right:{charId:'kexin',expression:'neutral'}}); await settle();
  await GM.say({name:'予樂'},'（修改前偶遇的同行句：只有名字）'); const p=said[0]; ADV.end();
  check('6. ADV.speaker(\'player\')：不佔立繪框、沒有新的圖（祐廷沒有立繪檔，不會出現祐廷），台上的可昕變暗',!!p&&!['left','right'].some(q=>p.st[q].id==='player'||p.st[q].id==='予樂')&&p.st.right.id==='kexin'&&p.st.right.dim&&!p.st.left.img&&!PORTRAIT_FILES.player&&!fs.existsSync(path.join(ROOT,'assets/portraits/player')),JSON.stringify(p&&p.st));

  // 7. 存檔、CHARACTERS
  check('7. G.social 沒有 yule 的關係、記憶；CHARACTERS 還是沒有 yule',!G.social.rel.yule&&!G.social.mem.yule&&!CHARACTERS.yule&&!Object.keys(CHARACTERS).includes('yule'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
