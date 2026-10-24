// AA312-INTEGRATE-1020：AA_312 第 3 節 B（測試寫死的台詞）＋C（各學期檔尾的 (b)）——不需要瀏覽器。
//   只做「原句現在還在、而且只出現一次」、不用改 invites.js／termend3d.js（別的子代理在改）、不用重新匯入階梯的項目；
//   已經被後來的改稿換掉的（AA_369、AA_375、AA_377、AA_378…）照留，第 3 節檢查現在的句子。
//   1 B-7＝AA_259 (b) 第 5 點：可昕第三年週年 K13  2 AA_259 (b) 第 5 點：SMALLTALK 沛珊旁聽倫理學只到大二上
//   3 AA_260 (b-1) 第 8、12、13 項（termend_lines.js）  4 已經做過／被取代的（現在的句子照留）
// 修改前（開發分支 2a672d9a8）：第 1～3 節 FAIL。用法：node tests/aa312_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path');
const {check}=H, J=JSON.stringify;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const RD=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const SRC=RD('src/data/events.js');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const lab=(e,l)=>{ const d=e.dialogue, i=d.findIndex(x=>x.label===l); return d.slice(i+1,i+3); };

(async()=>{
await sec(1,()=>{
  const e=ev('ev_kexin_anniversary_yn'), y3=lab(e,'y3'), b0=lab(e,'b0')[0], b1=lab(e,'b1')[0], b2=lab(e,'b2')[0], b3=lab(e,'b3')[0];
  check('1. K13 第三年卡片：「（把卡片翻到第一頁）第三年。」（「我們好像真的會一直轉下去」拿掉）',y3[0].text==='（把卡片翻到第一頁）第三年。'&&y3[1].goto==='b0'&&!SRC.includes("text:'（把卡片翻到第一頁）第三年。我們好像真的會一直轉下去。'"),J(y3));
  check('1. K13 選項：「明年換我寫。」「每年都寫這麼多？」「（不說話，看著她）」',J(b0.choice.map(c=>c.text))===J(['「明年換我寫。」','「每年都寫這麼多？」','（不說話，看著她）']),J(b0));
  check('1. K13 回覆：b1「好。要手寫喔。」、b2「你每年都只看第一頁。」（teasing）、b3 照舊「……幹嘛一直看。」',b1.text==='好。要手寫喔。'&&b2.text==='你每年都只看第一頁。'&&b2.expression==='teasing'&&b3.text==='……幹嘛一直看。'&&!SRC.includes("text:'那就一起暈。'")&&!SRC.includes("text:'「轉到頭暈怎麼辦？」'"),J([b1,b2,b3]));
  check('1. AA_262 (b) 第 2 條（第四年自己一組選項）已經做過（AA_378 #10），照留',lab(e,'y4')[0].text==='（把卡片翻到第一頁）第四年。……明年這一天，我們都畢業了。'); });

await sec(2,()=>{
  const ps=SMALLTALK.classmate_peishan, x=ps.find(t=>(t.t||t)==='「我今天旁聽了倫理學。」');
  check('2. SMALLTALK 沛珊「我今天旁聽了倫理學。」只到大二上（term Y1S1～Y2S1）；「讀書會週三，萬才館。」已經沒有（AA_369）',!!x&&J(x.term)===J(['Y1S1','Y1S2','Y2S1'])&&!SRC.includes('讀書會週三，萬才館'),J(ps)); });

await sec(3,()=>{
  const LX=TERMEND_LINES;
  H.fresh('2027-09-30',20,'dorm'); const before=LX.Q6(H.G); H.fresh('2027-10-06',20,'dorm'); const after=LX.Q6(H.G); H.G.day-=1; const eve=LX.Q6(H.G);
  check('3. 第 12 項 Q6()：2027-10-06（Q8b）以後沒看過 Q6 也算 true；以前照舊看 ev_ziqing_secret_game',!before&&after&&!eve&&LX.Q6({events:{done:{ev_ziqing_secret_game:1}}}),J([before,after,eve]));
  H.fresh('2028-01-20',20,'dorm'); const tb=LX.HEART.heroine_04.table(H.G);
  check('3. 第 12 項：大三上期末（2028-01）子晴的飯桌一句＝看過的版本「我這學期做了一個關卡，…」',tb==='我這學期做了一個關卡，還沒給任何人玩。……你先玩。不准放水。',tb);
  const z2=TERMEND.heart('heroine_04','Y3S2'), z1=TERMEND.heart('heroine_04','Y3S1'), z4=TERMEND.heart('heroine_04','Y4S1');
  check('3. 第 8 項：子晴第二次的心意邀約，大三下「你考完了吧 宵夜」「上次那個 你想好沒」；其他學期照舊「考完了吧 宵夜」',J(z2.invite2)===J(['你考完了吧 宵夜','上次那個 你想好沒'])&&J(z1.invite2)===J(['考完了吧 宵夜','上次那個 你想好沒'])&&J(z4.invite2)===J(['考完了吧 宵夜','上次那個 你想好沒']),J([z2.invite2,z1.invite2]));
  const s2=TERMEND.heart('heroine_05','Y3S2'), s1=TERMEND.heart('heroine_05','Y3S1');
  check('3. 第 13 項：學姊婉拒，大三下「好。那出發前再約。」；其他學期照舊「好。那開學法圖見。」',s2.decline==='好。那出發前再約。'&&s1.decline==='好。那開學法圖見。',J([s2.decline,s1.decline])); });

await sec(4,()=>{
  const LX=TERMEND_LINES, has=t=>SRC.includes(t), TL=RD('src/data/termend_lines.js');
  check('4. B-6 週日宵夜「今天我多夾了一顆貢丸。」已經是新句（「這是成長。」不在）',has("'今天我多夾了一顆貢丸。'")&&!has('這是成長'));
  check('4. AA_260 第 2 項（芷若第二次「禮拜四十點。……上次那句，你想好了嗎？」）已經做過（AA_377 第 8 項）；第 1 項的 Z13 在 r2y3b_events.js',TERMEND.heart('heroine_02','Y3S2').invite2==='禮拜四十點。……上次那句，你想好了嗎？'&&RD('src/data/r2y3b_events.js').includes('畢業以後我還有幾個班。'));
  check('4. AA_260 第 4 項：GF 芷若大三下是 AA_377 第 7 節「禮拜四十點，等我下班。」（不是「等我收完店」），照留',TERMEND.gf('heroine_02','Y3S2').invite==='禮拜四十點，等我下班。');
  check('4. AA_260 第 7、9、10 項：子晴大三下的邀約是 AA_377 第 10 項的句子，照留',/TM\(G\)==='Y4S1'\|\|TM\(G\)==='Y3S2'\?'欸 你考完了吧 宵夜'/.test(TL)&&LX.FRIEND.heroine_04.genByTerm.Y3S2==='欸 我畢業了欸 宵夜 我請');
  check('4. AA_260 第 15 項（方奕廷下學期末 noBySem S2，AA_369 L1）、第 17 項／AA_262 (b) 第 5 條（沛珊大三起台南 PS_TN）已經做過',LX.FRIEND.npc_fangyt.noBySem.S2==='好。山上收不到訊號，下山再找你。'&&/placeName:'台南・她學校附近的簡餐'/.test(TL));
  check('4. AA_259 (b) 第 6 點（enc_walk 沛珊 D06.cafe）、第 7 點（story3d.js 美國日期的註解）、AA_262 (b) 第 7 條（方奕廷 2028-07 起在嘉義）已經做過',
    !ENC_WALK_HAS_PS_CAFE()&&!RD('src/story3d.js').includes('US 2028-01-19')&&J(CHARACTERS.npc_fangyt.presence.absentDates.find(a=>a[2]==='在嘉義'))===J(['2028-07-01','2031-09-01','在嘉義','city',{city:'嘉義'}])); });

H.done();
})();
function ENC_WALK_HAS_PS_CAFE(){ const s=fs.readFileSync(path.join(H.ROOT,'src/data/enc_walk.js'),'utf8'); return /"who": "classmate_peishan",\s*"spot": "D06",\s*"act": "D06\.cafe"/.test(s); }
