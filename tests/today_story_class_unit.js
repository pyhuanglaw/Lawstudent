// 第二天的民法總則（劇情課）也列在今日那一行（BB-B 10-23 DAY12：13:03 HUD 寫「今天沒有課」，目標卻是「進入霖澤館上課（13:20）」）——不需要瀏覽器。src/classes3d.js S.todayLine
// 修改前（開發分支 7bef9e637）：第二天 todayLine＝「今天沒有課」——FAIL。用法：node tests/today_story_class_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H;
(async()=>{
  const d1=STORY.mainD1({flags:{}}); let G=H.fresh('2025-09-01',8,'dorm'); G.day=STORY.mainD1(G)+1; G.hour=12.5;
  const its=CLS.dayItems(G), sc=its.filter(it=>CLS.storyClass(G,it));
  check('前提：第二天有一堂劇情課（民法總則）',sc.length===1&&sc[0].c.id==='civ_general',JSON.stringify(its.map(i=>i.c.id)));
  const line=CLS.todayLine(G);
  check('今日那一行列出劇情課：「今天的課：… 民法總則…」',/^今天的課：/.test(line)&&line.includes(sc[0].c.name),line);
  check('一鍵上課照舊不給劇情課（S.next／S.open／goList 擋掉）',!CLS.goList(G).some(it=>CLS.storyClass(G,it))&&!(CLS.next(G)&&CLS.storyClass(G,CLS.next(G))));
  H.done();
})();
