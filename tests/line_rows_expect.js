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
  ['docs/story_planning/AA_807_us_term_reread.json','551786903'],['docs/story_planning/AA_808_peishan_tilde.json','0806059b7']];
const gen=f=>{ try{ return fs.readFileSync(path.join(ROOT,f),'utf8').slice(0,400).includes('自動產生'); }catch(e){ return true; } };
let rows=[]; for(const [doc,sha] of DOCS){ try{ const d=JSON.parse(cp.execSync('git -C "'+ROOT+'" show '+sha+':'+doc,{encoding:'utf8',stdio:['ignore','pipe','ignore']})); rows=rows.concat((d.rows||d).filter(r=>!gen(r.file)).map(r=>Object.assign({doc,sha},r))); }catch(e){} }
const unq=t=>typeof t==='string'&&/^「[^「」]*」$/.test(t)?t.slice(1,-1):t;
module.exports={ rows,
  fixFile:(file,text)=>{ let s=String(text); for(const r of rows) if(r.file===file) s=s.split(r.old).join(r.new); return s; },
  toOld:t=>{ const r=rows.find(r=>r.new===t); return r?r.old:t; },
  /* fwd(舊句, 檔)＝稿上那一列的 new（只找那個遊戲檔的列；不給檔＝不分檔）；不是這幾份改的＝原樣——舊稿／舊期望的句子往前換成新句再比 */
  fwd:(t,file)=>{ const r=rows.find(r=>r.old===t&&(!file||r.file===file)); return r?r.new:t; },
  isNew:(a,b)=>rows.some(r=>(a===r.old||unq(a)===r.old)&&(b===r.new||unq(b)===r.new)) };
