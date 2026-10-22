// AA_379 第 1 節（企劃線 6a105a4d；任務 AA379-SIS-W1-LIB-1021）：在閱覽室、總圖大廳自習區找學姊說話就直接認識（W1）——不需要瀏覽器。
// 使用者 10-21 23:1x 試玩卡關：「我在圖書館看到學姊 結果圖書館不能講話 這樣要怎麼觸發認識」；23:2x：「就直接可以說話就好」。
// 檢查：1. 逐字對稿：閱覽室、自習區兩句開頭旁白、最後一句「（笑了一下）對，就是這樣。有問題再私訊我。」；
//       2. 9/5 白天在閱覽室：ev_sis_w1 成立、演出（開頭閱覽室版、中間照台階版、最後閱覽室版）、記 met_sis、SIS_W1、FIRST_MET；
//       3. 自習區（library_hall）一樣、開頭換長桌那句；
//       4. 9/3 以前、經濟系、已經認識：不演；
//       5. story3d.js talkSis 沒有「閱覽室不能講話」那一行；台階版最後一句照舊。
// 修改前：第 2、3、5 項 FAIL。用法：node tests/aa379_sis_lib_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path'), cp=require('child_process');
const {check}=H;
const ev=STORY_EVENTS.find(e=>e.id==='ev_sis_w1');
let doc=''; try{ doc=cp.execSync('git show 6a105a4d:"docs/story_planning/AA_379_學姊當主要女主角_補強_第一批.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const LIB=(doc.match(/閱覽室「(（她坐在靠窗的位子讀書.+?）)」/)||[])[1], HALL=(doc.match(/自習區「(（她坐在長桌的一角讀書.+?）)」/)||[])[1], LAST=(doc.match(/改成：「(（笑了一下）對，就是這樣。有問題再私訊我。)」/)||[])[1];
const texts=ev?ev.dialogue.filter(n=>n.text).map(n=>n.text):[];
check('1. 讀稿：兩句開頭、最後一句都讀到，事件裡一字不差',!!LIB&&!!HALL&&!!LAST&&texts.includes(LIB)&&texts.includes(HALL)&&texts.includes(LAST),JSON.stringify({LIB,HALL,LAST}));
const play=async(key,h,zone,more)=>{ const G=H.fresh(key,h,zone,more||{}); const ok=EVENTS.check(ev); if(ok) await EVENTS.run(ev); return {G,ok,said:H.said.map(s=>s.t)}; };
(async()=>{
  { const {G,ok,said}=await play('2025-09-05',10,'library');
    check('2. 9/5 10:00 閱覽室：找她說話就演第一次見面（開頭閱覽室版、中間照台階版、最後閱覽室版）',ok&&said[0]===LIB&&said.includes('學姊好，我是祐廷，妳的直屬學弟。')&&said.includes('周老師很熱門耶，要很早去佔位置喔。')&&said.includes('真的，前一堂課就要去佔了。')&&said[said.length-1]===LAST&&!said.includes('（笑了一下）對，就是這樣。我要去圖書館了，有問題再私訊我。'),JSON.stringify({ok,said}));
    check('2. 記號：met_sis、SIS_W1、FIRST_MET',G.flags.met_sis===true&&G.flags.SIS_W1===true&&SOCIAL.has('heroine_05','FIRST_MET'),JSON.stringify({m:G.flags.met_sis,w:G.flags.SIS_W1,f:SOCIAL.has('heroine_05','FIRST_MET')})); }
  { const {ok,said}=await play('2025-09-08',15,'library_hall');
    check('3. 大廳自習區：開頭換「（她坐在長桌的一角讀書…）」，最後一句閱覽室版',ok&&said[0]===HALL&&said[said.length-1]===LAST,JSON.stringify({ok,said})); }
  { const a=(await play('2025-09-03',10,'library')).ok, b=(await play('2025-09-05',10,'library',{met_sis:true})).ok;
    const G=H.fresh('2025-09-05',10,'library'); G.stage='econ'; const c=EVENTS.check(ev);
    check('4. 9/3 以前、已經認識、經濟系：不演',!a&&!b&&!c,JSON.stringify({a,b,c})); }
  { const src=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'), {said}=await play('2025-09-05',12.3,'cafe');
    check('5. talkSis 沒有「閱覽室不能講話」；Café 版最後一句照舊（「我要去圖書館了」）',!/閱覽室不能講話/.test(src)&&said[said.length-1]==='（笑了一下）對，就是這樣。我要去圖書館了，有問題再私訊我。',JSON.stringify(said.slice(-1))); }
  H.done(); })().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
