/* AA_799（X324 G 區第四份，企劃線 5f34638b5；AA 2026-11-11 10:33）：pool_story_b2～b4 同學 secret 那一拍「其實……」開頭的 12 句換成稿上的 new（tools/story/apply_line_rows.py）。
   比對舊稿／舊版本的測試共用（aa499_501_pool、invites_quote_b4 第 16 項、invites_quote_b5 第 22 項）：
   isAA799(舊, 新)＝這一格是 AA_799 改的（舊可以是外面多一對「」的）；toOld(新)＝換回舊句。稿讀不到（淺層複本）＝不認，照舊期望。 */
const cp=require('child_process'), path=require('path');
const ROOT=path.join(__dirname,'..');
let R=null; try{ R=JSON.parse(cp.execSync('git -C "'+ROOT+'" show 5f34638b5:docs/story_planning/AA_799_pool_story_qishi.json',{encoding:'utf8',stdio:['ignore','pipe','ignore']})).rows; }catch(e){ R=null; }
const unq=t=>typeof t==='string'&&/^「[^「」]*」$/.test(t)?t.slice(1,-1):t;
module.exports={ rows:R, isAA799:(a,b)=>!!R&&R.some(r=>(a===r.old||unq(a)===r.old)&&b===r.new), toOld:t=>{ if(!R) return t; const r=R.find(r=>r.new===t); return r?r.old:t; } };
