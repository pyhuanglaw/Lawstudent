// CC-B 11-14：HL3_STATIC（BB-B 13:33，BB_468 HL3 下一步）——不開瀏覽器，列出五位女主角在 Y1S1、Y1S2 會主動傳給玩家或群組的訊息。
// 兩部分：
//   A 執行：照 tests/aa373_y1s2_unit.js 的方式在 Node 載入遊戲資料，把 STORY.DAILY_PHONE（每天的手機小事）逐則展開——id、學期條件、時間、ok 條件原始碼、每一句（誰傳、哪個對話串、全文）。
//   B 原始碼掃描：其他檔案裡 from／who 是 heroine_01～05、或 P1／seq 第一個參數是 heroine 的訊息（PHONE.at／send／push 一帶），列出 檔案:行、tag 線索、那一行的中文字串——條件要看原始碼，B 只是定位。
// 系統句（約好了／你沒有赴約）是 invites3d.js 產生的，不在這裡，另外在 C 列出產生它們的原始碼位置。
// 用法：node cc_hl3_static.js <遊戲根目錄> <輸出.txt>
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.argv[2]||'.'), OUT=process.argv[3]||'hl3_static.txt';
const lines=[]; const P=(...a)=>lines.push(a.join(' '));
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){}, querySelector:()=>null, querySelectorAll:()=>[] }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const load=f=>{ const p=path.join(ROOT,f); if(!fs.existsSync(p)) return 'missing'; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^[A-Z][A-Z0-9_]*$/.test(n)?'globalThis.'+n+'=':m); try{ vm.runInThisContext(src,{filename:f}); return 'ok'; }catch(e){ return 'ERR '+String(e.message).slice(0,120); } };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js',
  'src/data/encounters.js','src/encounter3d.js','src/data/syllabus.js','src/story3d.js','src/holff3d.js','src/classes3d.js'];
const IDX=fs.existsSync(path.join(ROOT,'index.html'))?[...fs.readFileSync(path.join(ROOT,'index.html'),'utf8').matchAll(/<script[^>]*src="(src\/[^"?]+)/g)].map(m=>m[1]).filter(f=>!/(engine3d|game3d|chars3d)\.js$/.test(f)):FILES;   /* 照 index.html 全部載入（DAILY_PHONE 有別的檔另外加的：aa555_3d.js S.DP…）；載不進來的記下來 */
const st={}; for(const f of IDX) st[f]=load(f);
if(typeof STORY!=='undefined'&&STORY.DAILY_PHONE){ for(const k of Object.keys(global)){ const v=global[k]; try{ if(v&&typeof v==='object'&&Array.isArray(v.DP)&&v.DP.length&&v.DP[0]&&v.DP[0].items&&!v.DP.every(d=>STORY.DAILY_PHONE.includes(d))) P('# 注意：'+k+'.DP 有 '+v.DP.length+' 則不在 STORY.DAILY_PHONE（可能是載入時才併進去）'); }catch(e){} } }
P('# HL3_STATIC 女主角主動傳的訊息清單（CC-B，'+new Date().toISOString().slice(0,16)+'Z）');
P('# 遊戲根目錄', ROOT); try{ P('# git', require('child_process').execSync('git -C "'+ROOT+'" rev-parse HEAD 2>/dev/null').toString().trim()); }catch(e){}
P('# 載入失敗的檔：', JSON.stringify(Object.entries(st).filter(([f,s])=>s!=='ok')));
const HER=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05'], NM={heroine_01:'以安',heroine_02:'芷若',heroine_03:'語彤',heroine_04:'子晴',heroine_05:'學姊'};
const isH=x=>typeof x==='string'&&HER.includes(x);
// ---------- A ----------
P(''); P('## A　STORY.DAILY_PHONE（每天的手機小事；一天最多一則，輪流；ok＝那天成立的條件）');
const DP=[...((typeof STORY!=='undefined'&&STORY.DAILY_PHONE)||[])]; for(const k of Object.keys(global)){ try{ const v=global[k]; if(v&&typeof v==='object'&&Array.isArray(v.DP)) for(const d of v.DP) if(d&&d.items&&!DP.includes(d)) { d.__src=k; DP.push(d); } }catch(e){} }
P('# 共', DP.length, '則（全部的人）');
const mkG=(key)=>{ const d=STORY.dayOfKey?STORY.dayOfKey(key):0; return {day:d,hour:12,weekday:CALENDAR.dateOf(d).wd%7,zone:'dorm',flags:{},choices:{},social:{rel:{},mem:{},stage:{}},msgs:[],contacts:{},money:20000,events:{done:{},last:{},count:0},invites:[],outings:[],name:'祐廷',stage:'law'}; };
const src1=f=>{ try{ return String(f).replace(/\s+/g,' ').slice(0,420); }catch(e){ return '?'; } };
let nA=0; const byWho={};
for(const d of DP){ let its=[], err=null;
  for(const key of ['2025-10-15','2026-03-18']){ for(const n of [0,1,2,3]){ try{ const r=d.items(mkG(key),n)||[]; for(const it of r){ const k=JSON.stringify([it.from,it.th,it.text]); if(!its.some(x=>x.k===k)) its.push({k,from:it.from,th:it.th,text:it.text,img:it.img||it.pic||null,n,key}); } }catch(e){ err=String(e.message).slice(0,100); } } }
  const hs=its.filter(x=>isH(x.from)); if(!hs.length) continue; nA++;
  const term=typeof d.term==='function'?src1(d.term):JSON.stringify(d.term);
  P(''); P('### dp_'+d.id+(d.__src?'（'+d.__src+'.DP）':''), '｜誰：'+[...new Set(hs.map(x=>NM[x.from]))].join('、'), '｜term：'+term, '｜時間 h：'+src1(d.h).slice(0,120));
  P('    ok：'+src1(d.ok)); if(err) P('    （展開時的例外：'+err+'——有些句子要遊戲狀態才算得出來，看原始碼）');
  for(const x of its){ P('    - ['+(NM[x.from]||x.from)+'｜'+(x.th||'')+'｜第 '+x.n+' 次]', x.text||('📷 '+(x.img||''))); if(isH(x.from)) (byWho[x.from]=byWho[x.from]||[]).push(d.id); }
}
P(''); P('# A 小計：有女主角句子的 DAILY_PHONE', nA, '則；每位出現在幾則：', JSON.stringify(Object.fromEntries(HER.map(h=>[NM[h],(byWho[h]||[]).filter((v,i,a)=>a.indexOf(v)===i).length]))));
// ---------- B ----------
P(''); P('## B　其他檔案：女主角傳訊的原始碼位置（從 PHONE.at／send、P1／seq、from:/who: 找；條件看原始碼）');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const srcFiles=walk(path.join(ROOT,'src')).filter(f=>f.endsWith('.js')&&!/chars3d\.js$/.test(f));
const RE_H=/heroine_0[1-5]/, RE_MSG=/PHONE\.\w+\(|\bP1\(|\bseq\(|th:'[pg]:|from:'heroine/;
let nB=0;
for(const f of srcFiles){ const rel=path.relative(ROOT,f); const L=fs.readFileSync(f,'utf8').split('\n');
  L.forEach((ln,i)=>{ if(!RE_H.test(ln)||!RE_MSG.test(ln)) return; if(/DAILY_PHONE|^\s*\/\//.test(ln)) return;
    const who=[...new Set((ln.match(/heroine_0[1-5]/g)||[]))].map(h=>NM[h]).join('、');
    const tag=(ln.match(/'((?:dp_|sis|an_|zr|yt|zq|nye|te_|aa\d|vac|fam|plg|guitar|msg_|enc_)[\w#]*)'/)||[])[1]||'';
    const zh=(ln.match(/'[^']*[一-鿿][^']*'/g)||[]).filter(s=>!/^'[\w\s:.-]*'$/.test(s)).map(s=>s.slice(1,-1)).filter(s=>s.length>1&&!/^(和|約|去|到|在)$/.test(s));
    if(!zh.length) return; nB++;
    P('- '+rel+':'+(i+1), '｜'+who, tag?'｜tag 線索 '+tag:'', '｜'+zh.slice(0,6).join(' ／ ').slice(0,400)); }); }
P(''); P('# B 小計：', nB, '行');
// ---------- C ----------
P(''); P('## C　系統句（約好了／你沒有赴約…）產生的位置');
for(const f of srcFiles){ const rel=path.relative(ROOT,f); fs.readFileSync(f,'utf8').split('\n').forEach((ln,i)=>{ if(/約好了：|你沒有赴約|後來作罷了/.test(ln)) P('- '+rel+':'+(i+1), (ln.match(/'[^']*(約好了|赴約|作罷)[^']*'/)||[''])[0].slice(0,120)); }); }
fs.writeFileSync(OUT,lines.join('\n')+'\n'); console.log('寫好', OUT, lines.length, '行；A', nA, '；B', nB);
