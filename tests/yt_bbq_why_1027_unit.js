// YT-BBQ-WHY-1027（AA_486 第 2 節，企劃線 cd824bf41；使用者 2026-10-27「為什麼中秋烤肉會有語彤是法律系還是?」）——不需要瀏覽器。
//   中秋烤肉（ev_mid_autumn_bbq）原本只寫「語彤帶了阿姨醃的肉。全場最好吃。」，沒交代社會系的她怎麼會在法律系的烤肉。
//   1  認識語彤：那一句換成三行（旁白、語彤、旁白），順序照稿，接在以安的時間表後面、柏翰的考古題前面
//   2  後面「阿姨醃的肉被搶光了」、阿哲、語彤那兩句照舊
//   3  不認識語彤：三行都沒有（條件照舊 STORY.knows('heroine_03')）
// 修改前（開發分支 592de7e18）：只有舊的一句——FAIL。用法：node tests/yt_bbq_why_1027_unit.js
const H=require('./pg_harness.js');
const {check}=H, J=JSON.stringify;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const L1='語彤也來了，提著一盒阿姨醃的肉。阿哲在麵店揪人那天，阿姨在旁邊聽到了。', L2='阿姨叫我拿來的。她說常來吃麵的，都算自己人。', L3='阿姨醃的肉，全場最好吃。';
const play=async(known)=>{ H.fresh('2025-10-04',15,'campus',{ZHE_CALLS_GE:true}); PHONE.join(H.G,'noodle_team','麵店團'); for(const id of known) meet(id); const e=ev('ev_mid_autumn_bbq'); await EVENTS.runLines(e.dialogue,e); return H.said.slice(); };

(async()=>{
  let S=await play(['yu','heroine_01','heroine_03','classmate_bohan']); const T=S.map(s=>s.t);
  const i1=T.indexOf(L1), i2=T.indexOf(L2), i3=T.indexOf(L3);
  check('1. 認識語彤：旁白「'+L1+'」',i1>=0&&S[i1].who===null,J(T));
  check('1. 接著語彤說「'+L2+'」（說話人是語彤）',i2===i1+1&&S[i2].who!==null&&/語彤|heroine_03/.test(S[i2].who),J(S[i2]));
  check('1. 再接旁白「'+L3+'」',i3===i2+1&&S[i3].who===null,J(S[i3]));
  check('1. 舊的一句「語彤帶了阿姨醃的肉。全場最好吃。」拿掉',!T.includes('語彤帶了阿姨醃的肉。全場最好吃。'));
  check('1. 位置照舊：以安的時間表之後、柏翰的考古題之前',T.indexOf('以安帶了一張「烤肉時間表」。')<i1&&i3<T.indexOf('柏翰帶了考古題，被沒收了。'),J(T));
  check('2. 後面照舊：「阿姨醃的肉被搶光了。」、阿哲「可以叫阿姨開一個烤肉的菜單嗎？」、語彤「不行。她會真的開。」',['阿姨醃的肉被搶光了。','可以叫阿姨開一個烤肉的菜單嗎？','不行。她會真的開。'].every(t=>T.includes(t)));
  S=await play(['yu','heroine_01','classmate_bohan']); const U=S.map(s=>s.t);
  check('3. 不認識語彤：三行都沒有、阿姨醃的肉那一段也沒有',![L1,L2,L3,'阿姨醃的肉被搶光了。'].some(t=>U.includes(t)),J(U));
  H.done();
})();
