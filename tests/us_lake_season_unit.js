// BG-US-SEASON-1024（AA_448 第 2 節；第七批 11-02）：美國的湖邊（bg 'us_lake'）照日期換季節版——不需要瀏覽器。
//   8/5、8/19＝us_lake_summer；10/10＝us_lake（秋天）；11/23＝us_lake_bare；圖沒登記就退回 us_lake
// 修改前（c3036bc90）：8/5、11/23 都是秋天那張＝FAIL。用法：node tests/us_lake_season_unit.js
'use strict';
const H=require('./pg_harness.js'); const {check}=H;
const at=k=>{ global.GAME={G:{day:PG.DK(k),hour:15}}; return OUT.bg('us_lake'); };
const img=b=>b&&b.image||String(b);
check('8/5（第一次去湖邊）＝夏天',img(at('2028-08-05'))==='assets/bg/us_lake_summer.webp',img(at('2028-08-05')));
check('8/19＝夏天',img(at('2028-08-19'))==='assets/bg/us_lake_summer.webp');
check('10/10（秋假）＝秋天那張',img(at('2028-10-10'))==='assets/bg/us_lake.webp'||/us_lake\.webp|us_lake/.test(img(at('2028-10-10'))),img(at('2028-10-10')));
check('11/23（感恩節）＝樹掉光',img(at('2028-11-23'))==='assets/bg/us_lake_bare.webp',img(at('2028-11-23')));
const keep=OUT.BG.us_lake_summer; OUT.BG.us_lake_summer={label:'x',image:null}; const fb=img(at('2028-08-05')); OUT.BG.us_lake_summer=keep;
check('季節版沒有圖＝退回 us_lake',fb===img(at('2028-10-10')),fb);
delete global.GAME; H.done();
