// L118-SHOPS-REDO-1111（USER_WANTS X338；使用者 2026-11-11：「更新所有相關的地圖標示、NPC 對話、點餐資料與餐廳引用，避免新舊名稱混用」）：
// 118 巷九個舊店名、舊菜名在 src/、index.html 的字串（程式註解不算，玩家看不到）要歸零。這支釘住：之後有人把舊店名寫回來＝FAIL。
// 不算的只有兩種（都寫在下面的表，一格一格列，不用萬用字元）：
//   KEEP_COMPAT＝存檔相容用的對照（當 key 的舊字，玩家看不到）；
//   KEEP_AA＝劇情總監 AA 看過、判定不用改的（出處：企劃線 AA_772_l118_shops_redo_fix.json 的 checked_against ②、not_changed）。
// 用法：node tests/l118_old_names_zero_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const NAMES=['滇香','好家自助餐','一一八茶飲','一一八','巷口家常菜','家常菜','慢讀','Pasta 118','韓食小廚','蛋包飯','六張犁','滇緬'];
const ITEMS=['椒麻雞','酸辣河粉','打拋豬','紅茶拿鐵','檸檬綠','無糖綠茶','番茄炒蛋','今日蛋糕','白醬雞肉','番茄海鮮麵','泡菜豆腐鍋','乾麵＋滷蛋','兩菜一雞腿','大碗加蛋'];
const SKIP=/檸檬綠茶|慢慢讀/g;   // 撞字：果茶社的「檸檬綠茶」（新菜單）、「點杯咖啡慢慢讀」
const KEEP_COMPAT={
  'src/sideq3d.js':{why:'順手的事的店名 key（Q 的 shop、SHOP_NAME／STAFF 的 key、key 的比對、相簿舊標題的遷移）：照 AA_772 sideq_rename「當 key 的地方照舊」，顯示的字是新店名',words:['慢讀','六張犁','好家自助餐','蛋包飯','滇香','巷口家常菜','家常菜','Pasta 118','韓食小廚','一一八茶飲','一一八']},
  'src/data/l118_redo772.js':{why:'AA_772 sideq_rename 的對照表（舊 key → 現在的店名；tools/story/l118_fix772.py 產生）',words:['慢讀','六張犁','好家自助餐','蛋包飯','滇香','巷口家常菜','家常菜','Pasta 118','韓食小廚','一一八茶飲','一一八']},
  'src/data/l118_shop_layouts.js':{why:'LAWWW2 的室內配置（layout.json 產生，不手改）：配置當時的店名、給開發組的說明；遊戲裡的區域名稱、「點餐（○○）」「離開○○」由 src/l118_shops3d.js 換成店家資料的店名。LAWWW2 重做室內以後這一格拿掉',words:NAMES.concat(ITEMS)} };
const AA='AA 判不改（AA_772 checked_against ②／not_changed）：';
const KEEP_AA={
  'src/data/events.js':{why:'AA_874（企劃線 0050081594，CANON-NO-ECON-1112 第四批）：可昕大一下生日沒交往那一版，她自己點的飲料「紅茶拿鐵，半糖。」（照稿；不是 118 巷的店）',words:['紅茶拿鐵']},
  'src/lane118.js':{why:AA+'學姊的「無糖綠茶，去冰」（H1 店員那一句，台詞不變）',words:['無糖綠茶']},
  'src/data/gift_lines.js':{why:AA+'送禮的品項「無糖綠茶」顯示的字照舊',words:['無糖綠茶']},
  'src/gift3d.js':{why:AA+'送禮的品項「無糖綠茶」',words:['無糖綠茶']},
  'src/data/food_fav_lines.js':{why:AA+'學姊的五組都不用改',words:['無糖綠茶']},
  'src/data/activity_scenes.js':{why:AA+'學姊的無糖綠茶去冰',words:['無糖綠茶']},
  'src/data/flirt_lines.js':{why:AA+'「無糖綠茶，去冰。我記得。」照舊成立',words:['無糖綠茶']},
  'src/sis_grad3d.js':{why:AA+'學姊的無糖綠茶去冰',words:['無糖綠茶']},
  'src/data/aa720.js':{why:AA+'販賣機的無糖綠茶',words:['無糖綠茶']},
  'src/data/heroine_arcs.js':{why:AA+'販賣機的無糖綠茶',words:['無糖綠茶']},
  'src/gym3d.js':{why:AA+'販賣機的無糖綠茶',words:['無糖綠茶']},
  'src/data/date_lines.js':{why:AA+'販賣機的無糖綠茶',words:['無糖綠茶']},
  'src/data/ladder.js':{why:AA+'以安媽媽的番茄炒蛋',words:['番茄炒蛋']},
  'src/social3d.js':{why:AA+'以安媽媽的番茄炒蛋（記憶的名稱）',words:['番茄炒蛋']},
  'src/ggshops_sys3d.js':{why:AA+'公館的今日蛋糕',words:['今日蛋糕']},
  'src/data/syllabus.js':{why:'LAWWW 判（11-11，held 整合）：大二下通識 ge_y2s2 第 7 週「家的味道」同學說「我媽的番茄炒蛋」——家裡的菜，不是 118 巷的菜名（AA 課堂稿、BB 審過）',words:['番茄炒蛋']},
  /* 撞字（GG-SHOPS3-STORY-1110，11-11）：汀州路泰米村食的菜單是使用者 X320 指定的七道（AA_742，企劃線 75f5de658），裡面有打拋豬肉飯、泰式椒麻雞飯——別間店的菜，不是 118 巷的舊菜名 */
  'src/data/gg3_shops_lines.js':{why:'撞字：泰米村食的菜單（AA_742 使用者指定七道；tools/shops/import_gg3_shops.py 產生）',words:['椒麻雞','打拋豬']},
  'src/gg3shops3d.js':{why:'撞字：泰米村食點餐（照點的菜挑句子的對照表 TAIMI_KEY）',words:['椒麻雞','打拋豬']},
  'src/story3d.js':{why:'撞字：明軒「公館一百元以內」第三名泰米村食的午間打拋豬肉飯（AA_742 第 ③ 節）',words:['打拋豬']} };
/* 把註解拿掉（玩家看不到）：字串裡的 // 不當註解 */
function strip(text){ let out='', i=0; const n=text.length;
  while(i<n){ const c=text[i];
    if(c==='/'&&text[i+1]==='*'){ const j=text.indexOf('*/',i+2); i=j<0?n:j+2; continue; }
    if(c==='/'&&text[i+1]==='/'&&text[i-1]!==':'){ const j=text.indexOf('\n',i); i=j<0?n:j; continue; }
    if(c==="'"||c==='"'||c==='`'){ let j=i+1; while(j<n&&text[j]!==c){ if(text[j]==='\\') j++; if(c!=='`'&&text[j]==='\n') break; j++; } out+=text.slice(i,j+1); i=j+1; continue; }
    out+=c; i++; }
  return out; }
const files=[]; (function walk(d){ for(const f of fs.readdirSync(path.join(ROOT,d))){ const p=d+'/'+f, st=fs.statSync(path.join(ROOT,p)); if(st.isDirectory()) walk(p); else if(/\.(js|json|html)$/.test(f)) files.push(p); } })('src'); files.push('index.html');
const hits=[], usedCompat={}, usedAA={};
for(const f of files){ const raw=fs.readFileSync(path.join(ROOT,f),'utf8'); if(!NAMES.concat(ITEMS).some(w=>raw.includes(w))) continue;
  const body=strip(raw).replace(SKIP,m=>'〇'.repeat(m.length)), lines=body.split('\n');
  for(const w of NAMES.concat(ITEMS)){ if(!body.includes(w)) continue;
    if(KEEP_COMPAT[f]&&KEEP_COMPAT[f].words.includes(w)){ usedCompat[f]=1; continue; }
    if(KEEP_AA[f]&&KEEP_AA[f].words.includes(w)){ usedAA[f]=1; continue; }
    const ln=lines.findIndex(l=>l.includes(w)), L=lines[ln], k=L.indexOf(w); hits.push(f+'：「'+w+'」…'+L.slice(Math.max(0,k-25),k+w.length+25).trim()+'…'); } }
check('1. 掃了 src/ 和 index.html（'+files.length+' 個檔）',files.length>300);
check('2. 九個舊店名（滇香小館、好家自助餐、一一八茶飲、巷口家常菜、慢讀咖啡、Pasta 118、韓食小廚、蛋包飯研究所、六張犁麵舖；含簡稱）和舊菜名，在字串裡歸零（扣掉下面兩張表）',hits.length===0,'\n  '+hits.slice(0,60).join('\n  '));
{ const dead=Object.keys(KEEP_COMPAT).filter(f=>!usedCompat[f]).concat(Object.keys(KEEP_AA).filter(f=>!usedAA[f]));
  check('3. 兩張「不算」的表沒有多餘的格子（表上寫了、檔裡已經沒有那個字＝把那一格拿掉）',dead.length===0,dead.join('、')); }
{ const s=fs.readFileSync(path.join(ROOT,'src/sideq3d.js'),'utf8'), body=strip(s);   // 順手的事：顯示的店名（「店名（118 巷）」、標題「店名：…」）不能是舊的
  const OLD=['慢讀咖啡','六張犁麵舖','好家自助餐','蛋包飯研究所','滇香小館','巷口家常菜','Pasta 118','韓食小廚','一一八茶飲'], bad=OLD.filter(o=>body.includes(o+'（118 巷）')||body.includes(o+'：')||body.includes('去'+o)||body.includes(o+'的'));
  check('4. src/sideq3d.js 留著的舊字只當 key：沒有「舊店名（118 巷）」「舊店名：…」「去舊店名」「舊店名的…」這些玩家看得到的寫法',bad.length===0,bad.join('、')); }
console.log(fails?('\n有 '+fails+' 項失敗'):'\n全部通過'); process.exit(fails?1:0);
