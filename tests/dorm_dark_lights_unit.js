// 熄燈時半球光、方向光也要暗（DORM203-LM-1030，LAWWW2-B 10-30 05:36：「熄燈時把半球光、方向光降到一兩成：沒烘焙的小東西（紙、塑膠椅、螢幕）熄燈後還是偏亮」）——不需要瀏覽器。
//   STORY.roomDark 在有 z.lightsOff 的房間（光照貼圖）包一層區域的 applyTime：熄燈 k＝1 時 hemi／sun／fill 乘 1−0.85＝0.15；開燈（k＝0）照原本；engine 每 5 格 applyTime 重設也一樣。
// 修改前（postrel-1030 f63f5b8cf）：第 1 項 FAIL。用法：node tests/dorm_dark_lights_unit.js
const H=require('./pg_harness.js');
const {check}=H, J=JSON.stringify;
const z={lightsOffK:0,lightsOff(k){ z.lightsOffK=k; }};
const E={zone:z,hour:23,hemi:{intensity:0},sun:{intensity:0},fill:{intensity:0},applyTime(h){ this.hemi.intensity=0.95; this.sun.intensity=0.9; this.fill.intensity=0.35; if(this.zone.applyTime) this.zone.applyTime(h,'clear'); }};
const GM={E,G:H.G};
const r=x=>Math.round(x*1000)/1000;
STORY.roomDark(GM,1); const off=[r(E.hemi.intensity),r(E.sun.intensity),r(E.fill.intensity)];
E.applyTime(23); const off2=[r(E.hemi.intensity),r(E.sun.intensity)];
check('1. 熄燈（k＝1）：半球光、方向光、補光都剩一成五；engine 再呼叫 applyTime 也一樣',J(off)===J([r(0.95*0.15),r(0.9*0.15),r(0.35*0.15)])&&J(off2)===J([r(0.95*0.15),r(0.9*0.15)]),J({off,off2}));
STORY.roomDark(GM,0.5); const half=r(E.hemi.intensity);
check('2. 熄燈途中（k＝0.5）：照比例（1−0.85×0.5）',half===r(0.95*(1-0.425)),String(half));
STORY.roomDark(GM,0); const on=[r(E.hemi.intensity),r(E.sun.intensity)];
check('3. 開燈（k＝0）：照原本',J(on)===J([0.95,0.9]),J(on));
const zp={}; const Ep={zone:zp,hour:23,toneK:1,hemi:{intensity:0.95},sun:{intensity:0.9},applyTime(){}}; STORY.roomDark({E:Ep,G:H.G},1); const noLm=Ep.hemi.intensity;
STORY.roomDark({E:Ep,G:H.G},0);
check('4. 沒有光照貼圖的房間（沒有 z.lightsOff）：不包 applyTime、照原本壓曝光',!zp._darkLit&&noLm===0.95,J({wrapped:!!zp._darkLit,noLm}));
H.done();
