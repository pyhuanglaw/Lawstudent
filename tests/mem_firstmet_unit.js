// BUG-MEM-FIRSTMET-1102：每人 80 筆記憶用滿時，FIRST_MET 不能被刪；先刪 ADJUST、再刪同 tag 的舊筆
const H=require('./pg_harness.js'); const {check}=H;
(async()=>{
  const G=H.fresh('2026-10-01',10,'dorm'); const id='heroine_01';
  SOCIAL.remember(id,'FIRST_MET','camp');
  for(let d=0;d<120;d++){ G.day+=1; SOCIAL.remember(id,'TALK_'+(d%30),'x'+d); }
  const M=G.social.mem[id];
  check('1. 一共 80 筆',M.length===80,'n='+M.length);
  check('2. FIRST_MET 還在、note 還是 camp（metAtCamp）',SOCIAL.has(id,'FIRST_MET')&&STORY.metAtCamp(G,id),'');
  check('3. 30 種 tag 都還在（S.has 不變）',Array.from({length:30},(_,k)=>'TALK_'+k).every(t=>SOCIAL.has(id,t)),'');
  check('4. 每種 tag 的最後一天照舊（lastDay）',SOCIAL.lastDay(id,'TALK_29')===G.day-0||SOCIAL.lastDay(id,'TALK_29')>=G.day-30,'last='+SOCIAL.lastDay(id,'TALK_29'));
  const G2=H.fresh('2026-10-01',10,'dorm'); SOCIAL.remember(id,'FIRST_MET','');
  for(let d=0;d<100;d++){ G2.day+=1; SOCIAL.adjust(id,{fam:1},'w'+d); }
  SOCIAL.remember(id,'HELPED','黑咖啡');
  const M2=G2.social.mem[id];
  check('5. 全是 ADJUST 時先刪 ADJUST：FIRST_MET、HELPED 都在',M2.length===80&&SOCIAL.has(id,'FIRST_MET')&&SOCIAL.has(id,'HELPED'),'n='+M2.length);
  const G3=H.fresh('2026-10-01',10,'dorm'); SOCIAL.remember(id,'FIRST_MET','');
  for(let d=0;d<100;d++){ G3.day+=1; SOCIAL.remember(id,'U'+d,''); }
  check('6. 全部都是不同 tag：刪最舊的、FIRST_MET 留著',G3.social.mem[id].length===80&&SOCIAL.has(id,'FIRST_MET')&&SOCIAL.has(id,'U99')&&!SOCIAL.has(id,'U0'),'');
  H.done();
})();
