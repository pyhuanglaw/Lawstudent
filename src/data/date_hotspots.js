/* 約會互動點的 2D 圖層（DATE-S6，使用者要的 I07、I08）：每一張約會底圖上，各互動點的標記位置、她站哪裡、坐著的互動點、人物去背圖的錨點。
   位置＝底圖寬高的比例（0～1）。來源：BB-B 依實際底圖標的 Dxx_coords.json（企劃線 docs/story_planning/date_system/art/，2e1932bfa）的 hotspots[].marker ÷ 1920×1080；
   DATE-S6 實作時把 32 張底圖逐張疊上標記看過、對得上（docs/handoff/date_s6/README.md）。her＝她在選互動點那一步站哪裡（x；y＝腳底、h＝身高佔底圖的比例，沒寫＝0.985、0.55；D10、D14 前景是水面，照 coords 的 C0 放前景、腳在畫面外）。
   seated＝做完這幾個互動點以後，回到選單時她用坐姿（H4，坐的高度對齊畫面下緣）。fig＝assets/date/anchors.json（企劃線外的 LAWWW2-B 去背 d93b47e27、BB-B 驗收）抄過來的 H1、H4 錨點，tests/date_layer_s6_unit.js 逐欄對。
   D28.sunset（海堤的夕陽）沒有位置：d28a 這張圖上看不到海堤，放不準＝D28 整個地點照文字選單；d28b、d02_base_rain 沒有登記：約會不用 d02_base_rain；d28b 那一刻沒有下一個互動點可選（照文字選單）。沒登記、缺任何一個互動點的位置＝照原本的文字選單（src/datelayer3d.js）。 */
'use strict';
const DATE_HOTSPOTS={"src":"Dxx_coords.json@2e1932bfa＋anchors.json@d93b47e27","figH":0.55,"bg":{
 "d01_base_afternoon":{"loc":"D01","wh":[1672,941],"pts":{"D01.expo":[0.148,0.477],"D01.market":[0.865,0.556],"D01.lawn":[0.536,0.667],"D01.wall":[0.896,0.269]},"her":{"x":0.34}},
 "d02_base_overcast":{"loc":"D02","wh":[1672,941],"pts":{"D02.pond":[0.12,0.691],"D02.corridor":[0.377,0.468],"D02.garden":[0.652,0.51],"D02.books":[0.897,0.425]},"her":{"x":0.52}},
 "d03_base_afternoon":{"loc":"D03","wh":[1672,941],"pts":{"D03.demo":[0.179,0.446],"D03.arcade":[0.44,0.404],"D03.gacha":[0.933,0.446],"D03.window":[0.718,0.372]},"her":{"x":0.68}},
 "d04_base_night":{"loc":"D04","wh":[1672,941],"pts":{"D04.lobby":[0.096,0.479],"D04.street":[0.412,0.5],"D04.redhouse":[0.643,0.319],"D04.snack":[0.945,0.479]},"her":{"x":0.68}},
 "d05_base_dusk":{"loc":"D05","wh":[1672,941],"pts":{"D05.cafe":[0.46,0.553],"D05.garden":[0.138,0.744],"D05.shop":[0.921,0.595],"D05.board":[0.804,0.479]},"her":{"x":0.3}},
 "d06_base_day":{"loc":"D06","wh":[1672,941],"pts":{"D06.gallery":[0.09,0.319],"D06.frame":[0.556,0.398],"D06.cafe":[0.933,0.553],"D06.lawn":[0.801,0.51]},"her":{"x":0.08}},
 "d07_base_afternoon":{"loc":"D07","wh":[1672,941],"pts":{"D07.court":[0.114,0.425],"D07.cell":[0.317,0.404],"D07.wall":[0.598,0.415],"D07.path":[0.927,0.595]},"her":{"x":0.76}},
 "d08_base_morning":{"loc":"D08","wh":[1672,941],"pts":{"D08.panda":[0.132,0.479],"D08.penguin":[0.352,0.531],"D08.giraffe":[0.658,0.531],"D08.train":[0.957,0.585]},"her":{"x":0.5}},
 "d09_base_dusk":{"loc":"D09","wh":[1672,941],"pts":{"D09.gondola":[0.93,0.208],"D09.tea":[0.216,0.477],"D09.view":[0.599,0.394],"D09.path":[0.747,0.787]},"her":{"x":0.48}},
 "d10_base_dusk":{"loc":"D10","wh":[1672,940],"pts":{"D10.bridge":[0.628,0.341],"D10.boat":[0.197,0.489],"D10.walk":[0.933,0.468],"D10.snack":[0.108,0.362]},"her":{"x":0.45,"y":1.25,"h":0.8}},
 "d11_base_afternoon":{"loc":"D11","wh":[1672,941],"pts":{"D11.museum":[0.168,0.479],"D11.valley":[0.568,0.638],"D11.library":[0.646,0.382],"D11.footbath":[0.927,0.704]},"her":{"x":0.36}},
 "d12_base_sunset":{"loc":"D12","wh":[1672,941],"pts":{"D12.street":[0.299,0.319],"D12.tea":[0.18,0.531],"D12.pier":[0.634,0.574],"D12.sunset":[0.885,0.457]},"her":{"x":0.4}},
 "d13_base_sunset":{"loc":"D13","wh":[1672,941],"pts":{"D13.drink":[0.099,0.481],"D13.bench":[0.297,0.556],"D13.rail":[0.547,0.593],"D13.photo":[0.917,0.519]},"her":{"x":0.74}},
 "d14_base_sunset":{"loc":"D14","wh":[1672,941],"pts":{"D14.bridge":[0.491,0.298],"D14.boardwalk":[0.054,0.574],"D14.ferry":[0.227,0.425],"D14.sunset":[0.867,0.394]},"her":{"x":0.64,"y":1.25,"h":0.8}},
 "d15_base_night":{"loc":"D15","wh":[1672,941],"pts":{"D15.rail":[0.448,0.553],"D15.car":[0.108,0.659],"D15.store":[0.921,0.394],"D15.sky":[0.897,0.595]},"her":{"x":0.68}},
 "d16_base_afternoon":{"loc":"D16","wh":[1672,941],"pts":{"D16.drive":[0.114,0.531],"D16.beach":[0.365,0.51],"D16.lighthouse":[0.897,0.256],"D16.rest":[0.646,0.741]},"her":{"x":0.92}},
 "d17_base_morning":{"loc":"D17","wh":[1672,941],"pts":{"D17.queen":[0.38,0.231],"D17.mushroom":[0.677,0.352],"D17.platform":[0.521,0.63],"D17.trail":[0.932,0.37]},"her":{"x":0.08}},
 "d18_base_dusk":{"loc":"D18","wh":[1672,941],"pts":{"D18.snack":[0.086,0.479],"D18.steps":[0.496,0.681],"D18.teahouse":[0.933,0.351],"D18.shop":[0.215,0.479]},"her":{"x":0.92}},
 "d19_base_morning":{"loc":"D19","wh":[1672,941],"pts":{"D19.museum":[0.094,0.333],"D19.houses":[0.427,0.389],"D19.shrine":[0.521,0.213],"D19.view":[0.854,0.481]},"her":{"x":0.08}},
 "d20_base_afternoon":{"loc":"D20","wh":[1672,941],"pts":{"D20.street":[0.135,0.389],"D20.bridge":[0.573,0.481],"D20.trolley":[0.917,0.444],"D20.falls":[0.771,0.167]},"her":{"x":0.08}},
 "d21_base_afternoon":{"loc":"D21","wh":[1672,941],"pts":{"D21.street":[0.146,0.389],"D21.temple":[0.448,0.37],"D21.dye":[0.625,0.537],"D21.bridge":[0.885,0.519]},"her":{"x":0.08}},
 "d22_base_afternoon":{"loc":"D22","wh":[1672,941],"pts":{"D22.dam":[0.396,0.593],"D22.maple":[0.208,0.185],"D22.lake":[0.708,0.556],"D22.fish":[0.917,0.667]},"her":{"x":0.08}},
 "d23_base_sunset":{"loc":"D23","wh":[1672,941],"pts":{"D23.market":[0.104,0.481],"D23.cook":[0.312,0.296],"D23.boats":[0.521,0.481],"D23.seawall":[0.844,0.435]},"her":{"x":0.3}},
 "d24_base_afternoon":{"loc":"D24","wh":[1672,941],"pts":{"D24.footbath":[0.156,0.593],"D24.street":[0.885,0.389],"D24.park":[0.583,0.435],"D24.station":[0.615,0.306]},"her":{"x":0.92}},
 "d25_base_sunset":{"loc":"D25","wh":[1672,941],"pts":{"D25.station":[0.072,0.446],"D25.shore":[0.389,0.617],"D25.surf":[0.813,0.51],"D25.cafe":[0.927,0.446]},"her":{"x":0.6}},
 "d26_base_golden":{"loc":"D26","wh":[1672,941],"pts":{"D26.path":[0.125,0.556],"D26.museum":[0.385,0.417],"D26.village":[0.604,0.556],"D26.plaza":[0.854,0.704]},"her":{"x":0.26}},
 "d27_base_morning":{"loc":"D27","wh":[1672,940],"pts":{"D27.veranda":[0.094,0.519],"D27.shop":[0.604,0.463],"D27.tree":[0.323,0.352],"D27.rail":[0.917,0.481]},"her":{"x":0.34}},
 "d28a_base_day":{"loc":"D28","wh":[1672,941],"pts":{"D28.museum":[0.76,0.426],"D28.circle":[0.292,0.648],"D28.alley":[0.156,0.556]},"her":{"x":0.52}},
 "d29_base_afternoon":{"loc":"D29","wh":[1672,941],"pts":{"D29.warehouse":[0.156,0.463],"D29.sculpture":[0.656,0.389],"D29.harbor":[0.875,0.574],"D29.rail":[0.365,0.796]},"her":{"x":0.62}},
 "d30_base_dusk":{"loc":"D30","wh":[1672,941],"pts":{"D30.pebble":[0.365,0.5],"D30.bike":[0.365,0.796],"D30.stars":[0.75,0.065],"D30.stall":[0.927,0.463]},"her":{"x":0.08}},
 "d31_base_morning":{"loc":"D31","wh":[1672,941],"pts":{"D31.trail":[0.104,0.648],"D31.pier":[0.469,0.63],"D31.ropeway":[0.865,0.222],"D31.egg":[0.927,0.667]},"her":{"x":0.7}},
 "d32_base_afternoon":{"loc":"D32","wh":[1672,941],"pts":{"D32.meadow":[0.417,0.704],"D32.trail":[0.104,0.426],"D32.cloud":[0.792,0.519],"D32.stall":[0.953,0.574]},"her":{"x":0.6}}},
"seated":["D03.window","D04.snack","D05.cafe","D06.cafe","D09.tea","D11.footbath","D13.bench","D15.car","D18.teahouse","D22.fish","D23.cook","D24.footbath","D25.cafe","D27.veranda"],
"fig":{
 "classmate_peishan":{"H1":{"w":380,"hpx":1024,"footX":210,"footY":1022,"h":980},"H4":{"w":380,"hpx":845,"footX":302,"footY":844,"h":808,"seatY":540}},
 "heroine_01":{"H1":{"w":382,"hpx":1025,"footX":142,"footY":1021,"h":963},"H4":{"w":350,"hpx":879,"footX":237,"footY":876,"h":823,"seatY":565}},
 "heroine_02":{"H1":{"w":340,"hpx":1026,"footX":165,"footY":1021,"h":977},"H4":{"w":381,"hpx":879,"footX":101,"footY":875,"h":837,"seatY":565}},
 "heroine_03":{"H1":{"w":322,"hpx":803,"footX":212,"footY":802,"h":767},"H4":{"w":331,"hpx":689,"footX":256,"footY":688,"h":658,"seatY":395}},
 "heroine_04":{"H1":{"w":309,"hpx":1036,"footX":178,"footY":1034,"h":990},"H4":{"w":308,"hpx":896,"footX":161,"footY":892,"h":852,"seatY":520}},
 "heroine_05":{"H1":{"w":259,"hpx":978,"footX":141,"footY":974,"h":933},"H4":{"w":369,"hpx":818,"footX":236,"footY":815,"h":780,"seatY":480}},
 "kexin":{"H1":{"w":357,"hpx":1001,"footX":148,"footY":996,"h":952},"H4":{"w":383,"hpx":833,"footX":334,"footY":829,"h":794,"seatY":515}}}};
