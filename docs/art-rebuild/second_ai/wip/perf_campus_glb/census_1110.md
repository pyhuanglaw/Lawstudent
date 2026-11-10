# PERF-CAMPUS-GLB-1102 ②：校園正式 GLB 盤點（census，LAWWW2 帳號 A 11-10，開發分支 be84c8680）

靜態盤點：每一顆 GLB 的網格數（每個 primitive＝一次 draw call，不算投影）、GPU instancing、三角形、材質、檔案大小。用 Node 讀 GLB，不用瀏覽器（D131）。

```
key | 網格 | 實例化 | 三角形 | 實例三角形 | 材質 | MB
bldg.us_campus | 75 | 0 | 155036 | 0 | 75 | 11.81
bldg.linze_exterior | 15 | 18 | 11218 | 31312 | 15 | 2.32
bldg.wancai_exterior | 17 | 8 | 11234 | 27880 | 17 | 2.24
bldg.campus_socsci | 18 | 0 | 14616 | 0 | 15 | 1.09
bldg.campus_library | 13 | 0 | 9081 | 0 | 13 | 0.77
bldg.campus_blackforest | 12 | 0 | 7174 | 0 | 12 | 0.99
bldg.campus_admin | 11 | 0 | 13531 | 0 | 11 | 0.93
bldg.campus_arts | 11 | 0 | 8854 | 0 | 11 | 0.65
bldg.campus_hist | 11 | 0 | 6432 | 0 | 11 | 0.51
bldg.campus_lake | 11 | 0 | 8604 | 0 | 11 | 0.88
bldg.campus_freshman | 11 | 0 | 15990 | 0 | 7 | 1.33
bldg.campus_lib_lawn | 10 | 0 | 13535 | 0 | 10 | 0.80
bldg.campus_gymext | 10 | 0 | 4192 | 0 | 10 | 0.54
bldg.campus_bell | 9 | 0 | 1562 | 0 | 9 | 0.13
bldg.campus_gongtong | 9 | 0 | 28627 | 0 | 8 | 2.13
bldg.campus_male1 | 8 | 0 | 12856 | 0 | 8 | 1.18
bldg.campus_moon | 7 | 0 | 500 | 0 | 7 | 0.25
bldg.campus_gate | 7 | 0 | 2890 | 0 | 7 | 0.30
bldg.campus_gongguan_bd | 5 | 0 | 15194 | 0 | 5 | 1.64
bldg.campus_pavilion | 5 | 0 | 966 | 0 | 5 | 0.14
bldg.campus_boya | 5 | 0 | 8630 | 0 | 4 | 0.96
bldg.campus_modern | 4 | 0 | 1968 | 0 | 4 | 0.17
bldg.campus_putong | 4 | 0 | 13704 | 0 | 4 | 1.27
```

## 讀法與計畫
- 普通 4、博雅 5 已經用 TEACH-EAST-DRAWCALL-1104 的做法壓過：
  - 有貼圖的材質合成一張貼圖集；
  - 頂點色零件併進同一個材質（白色帶子）；
  - 照材質合併。
- 其他校園建築大多還在 10～18 個網格：社科院 18、總圖 13、黑森林 12、行政大樓／文學院／校史館各 11、男一舍 11、醉月湖 11。
  - 椰林大道一眼看過去，同時在畫面裡的就有行政大樓、文學院、校史館、總圖。
- 第一步：`campus_hall.py`（行政大樓、文學院、校史館，同一支腳本）套同一套壓法。
  - seethru_ 的柱子（樹幹透視）、玻璃、匾額照舊分開。
  - 預估一棟 11 → 4～5。
  - 驗收：Node 量 teach_east 類的鏡頭；Blender 前後渲染對照；改名的材質要先查 zones3d.js 有沒有照名字特別處理。
- 之後照網格數排：社科院 → 總圖 → 黑森林、醉月湖。
- us_campus（75）是美國那一區，不在台大校園，另外看。
