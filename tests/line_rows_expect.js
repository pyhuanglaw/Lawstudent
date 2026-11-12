/* 逐行改稿（{file,line,old,new}；tools/story/apply_line_rows.py 套進手寫檔的）——X324 G 區：
     AA_794 芷若「店長」→「老闆」（60c08798a 版；手寫檔 9 列，產生的檔那幾列 AA 搬到覆蓋層／源稿，這裡不算）、AA_799 同學秘密「其實……」、AA_800 子晴畢業專題句首「……」、AA_801 大三事件、AA_802 學姊 b4／以安語彤假期、AA_803 大四和畢業後、AA_804 喜歡的食物、AA_805 配角近況（句首「……」）、AA_807 美國那學期沛珊四樣訊息、AA_808 沛珊句尾「～」。
   和歷史 commit／舊稿比字的測試共用：
     fixFile(檔, 舊版內容)＝照這幾份把舊句換成新句（再和現在的比）；toOld(新句)＝換回舊句（在舊稿裡找）；fwd(舊句, 檔)＝那個檔那一列的新句；isNew(舊, 新)＝這一格是這幾份改的（舊可以外面多一對「」）。
   稿讀不到（淺層複本）＝不認，照舊期望。 */
const cp=require('child_process'), fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const DOCS=[['docs/story_planning/AA_794_zr_boss.json','60c08798a'],['docs/story_planning/AA_799_pool_story_qishi.json','5f34638b5'],['docs/story_planning/AA_800_y2b_events.json','e7dfbbe61'],
  ['docs/story_planning/AA_801_y3_events.json','6086bea73'],['docs/story_planning/AA_802_sis_b4_anyt.json','f2a55c1e7'],['docs/story_planning/AA_803_y4_postgrad.json','7c0cc967a'],
  ['docs/story_planning/AA_804_food_fav.json','8eab5a25c'],['docs/story_planning/AA_805_aa519.json','3f1569379'],
  ['docs/story_planning/AA_807_us_term_reread.json','551786903'],['docs/story_planning/AA_808_peishan_tilde.json','0806059b7'],['docs/story_planning/AA_810_peishan_open_class_mom.json','333cd2863'],['docs/story_planning/AA_840_sis_us_arcs_ellipsis.json','02264217e']/* 2026-11-12 學姊美國那段句首刪節號 9 列 */];
const gen=f=>{ try{ return fs.readFileSync(path.join(ROOT,f),'utf8').slice(0,400).includes('自動產生'); }catch(e){ return true; } };
let rows=[]; for(const [doc,sha] of DOCS){ try{ const d=JSON.parse(cp.execSync('git -C "'+ROOT+'" show '+sha+':'+doc,{encoding:'utf8',stdio:['ignore','pipe','ignore']})); rows=rows.concat((d.rows||d).filter(r=>!gen(r.file)).map(r=>Object.assign({doc,sha},r))); }catch(e){} }
/* 2026-11-12（BAR-GROUP-3D-1112）：AA_836（企劃線 48d153407）「要改的一句」是 md 的表、不是 {rows} 的 JSON——手改 src/data/r2y4b_events.js 一處，這裡照表登一列（稿讀得到才認，和上面一樣）。
   舊期望：r2y4b_events.js 和歷史 commit 比只差 AA_762 的 3 列（tests/peishan_events_1111_unit.js）；現在多這一列 */
{ const doc='docs/story_planning/AA_836_大口漢堡二樓讀書小組_3D座位.md', sha='48d153407', o='（十點，語彤買了三杯熱可可上來，推了兩杯到長桌另一頭。）', n='（十點，語彤買了三杯熱可可上來，兩杯推到你和可昕面前。）';
  try{ const t=cp.execSync('git -C "'+ROOT+'" show '+sha+':"'+doc+'"',{encoding:'utf8',stdio:['ignore','pipe','ignore']}); if(t.includes('| '+o+' | '+n+' |')) rows.push({doc,sha,file:'src/data/r2y4b_events.js',old:o,new:n}); }catch(e){} }
const unq=t=>typeof t==='string'&&/^「[^「」]*」$/.test(t)?t.slice(1,-1):t;
/* 2026-11-11（X327 漏改，AA_807@551786903／AA_808@0806059b7）：這兩份的 old／new 是程式片段（含引號：'試教～'、msgs:['…','…']、say(PS,'…'),say(PS,'…')），
   整格比的 toOld／fwd／isNew 對不上一句一句的字——拆成句子：兩邊照順序取 '…' 裡的字一一對應；new 比 old 多出來的那句＝稿新加的（舊句 null）。
   只加下面四個匯出，原有的 rows／fixFile／toOld／fwd／isNew 行為不變：
     sents＝[{doc,sha,file,line,old,new}]（一句一列；只收 old／new 裡有 '…' 的列）
     toOldS(新句, 檔)＝先照整格 toOld（給檔＝只找那個遊戲檔的列）；不是就找拆開的句子換回舊句（稿新加的那句＝null，呼叫的測試自己決定認不認）；都不是＝原樣
     fwdS(舊句, 檔)＝先照整格 fwd；不是就找拆開的句子換成新句；都不是＝原樣
     fwdDeep(值, 檔)＝字串、陣列、物件的值（{yes,no} 這種）裡每一句照 fwdS 換：舊稿的整列往前換成新句再和遊戲比 */
const qsq=t=>{ const m=String(t).match(/'((?:[^'\\]|\\.)*)'/g); return m?m.map(x=>x.slice(1,-1)):[]; };
const sents=[]; for(const r of rows){ const o=qsq(r.old), n=qsq(r.new); for(let i=0;i<Math.max(o.length,n.length);i++) sents.push(Object.assign({},r,{old:i<o.length?o[i]:null,new:i<n.length?n[i]:null})); }
const toOldW=(t,file)=>{ const r=rows.find(r=>r.new===t&&(!file||r.file===file)); return r?r.old:t; }, fwdW=(t,file)=>{ const r=rows.find(r=>r.old===t&&(!file||r.file===file)); return r?r.new:t; };
const toOldS=(t,file)=>{ const w=toOldW(t,file); if(w!==t) return w; const s=sents.find(s=>s.new===t&&s.old!==t&&(!file||s.file===file)); return s?s.old:t; };
const fwdS=(t,file)=>{ const w=fwdW(t,file); if(w!==t) return w; const s=sents.find(s=>s.old===t&&s.new!==t&&(!file||s.file===file)); return s?s.new:t; };
const fwdDeep=(x,file)=>typeof x==='string'?fwdS(x,file):Array.isArray(x)?x.map(y=>fwdDeep(y,file)):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,fwdDeep(v,file)])):x;
module.exports={ rows, sents, toOldS, fwdS, fwdDeep,
  fixFile:(file,text)=>{ let s=String(text); for(const r of rows) if(r.file===file) s=s.split(r.old).join(r.new); return s; },
  toOld:t=>{ const r=rows.find(r=>r.new===t); return r?r.old:t; },
  /* fwd(舊句, 檔)＝稿上那一列的 new（只找那個遊戲檔的列；不給檔＝不分檔）；不是這幾份改的＝原樣——舊稿／舊期望的句子往前換成新句再比 */
  fwd:(t,file)=>{ const r=rows.find(r=>r.old===t&&(!file||r.file===file)); return r?r.new:t; },
  isNew:(a,b)=>rows.some(r=>(a===r.old||unq(a)===r.old)&&(b===r.new||unq(b)===r.new)) };
