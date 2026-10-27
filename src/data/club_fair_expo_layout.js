/* ===== 社團博覽會（大一 2025-09-06（六）10:00～16:00；大二 2026-09-12）：椰林大道兩邊的帳篷＋舞台（CLUBFAIR-REAL-1027，LAWWW2-C 2026-10-27）=====
   規格：AA_485 第 3 節（企劃線 5aaa71d6a；使用者 X109「社團博覽會攤會也太少 都沒人顧」「要參考實際的吧」）：照實際的臺大社團聯展（椰林大道一路排帳篷、
   大道中段一個舞台），建議 36 頂；15 攤有互動（能加入 5、只能看看 10），其他是背景攤；招牌只寫社團類型的名稱（D77，不用真實社團的標誌）。
   遊戲（src/zones3d.js 的 clubFairExpo：導航阻擋、正式模型）和 Blender（tools/blender/env_second/club_fair_expo.py）讀同一份；必須是「const CLUB_FAIR_EXPO=」後面接純 JSON。
   座標：校園區域的世界座標（x 往東、z 往南；椰林大道中線 z=0，柏油 z ±6、人行道到 ±8、椰子樹 ±9.5、花叢 ±10.8、路燈 ±11）。
   帳篷 3×3 m，原點＝帳篷中心的地面；模型正面（桌子、垂簾的字）朝局部 +z，轉 ry：北側 ry=0（面向南＝大道中間）、南側和傅鐘廣場 ry=π（面向北）。
   front＝玩家站在攤位前的位置（帳篷前緣再往外 0.5 m；互動點、顧攤的人的對面）。kind：join＝能加入（clubs 的 id 在 club）、look＝只能看看、info＝服務台、bg＝背景攤。
   帳篷沿柏油路兩邊（前緣 z ±3.4、後緣 ±6.4）：大道中間留 6.8 m 走，人行道（z ±7）照舊走得到；往北的兩條路（x −41～−35、−15.5～−8.5）、
   往南的傅鐘廣場（x −53～−23）、宿舍那條路（x 16～24）都留空。舞台在北側、大道中段（x −30～−21），面向南。 */
const CLUB_FAIR_EXPO={
 "version":1,
 "tent":{"w":3.0,"d":3.0,"front":2.0},
 "tents":[
  {"id":"bg_band","label":"管樂社","kind":"bg","x":-88.0,"z":-4.9,"ry":0},
  {"id":"guitar","label":"吉他社","kind":"join","club":"club_guitar","x":-84.4,"z":-4.9,"ry":0},
  {"id":"bg_chinese","label":"國樂社","kind":"bg","x":-80.8,"z":-4.9,"ry":0},
  {"id":"debate","label":"辯論社","kind":"join","club":"club_debate","x":-77.2,"z":-4.9,"ry":0},
  {"id":"bg_anime","label":"動漫社","kind":"bg","x":-73.6,"z":-4.9,"ry":0},
  {"id":"photo","label":"攝影社","kind":"look","x":-70.0,"z":-4.9,"ry":0},
  {"id":"bg_astro","label":"天文社","kind":"bg","x":-66.4,"z":-4.9,"ry":0},
  {"id":"hiking","label":"登山社","kind":"join","club":"club_hiking","x":-62.8,"z":-4.9,"ry":0},
  {"id":"bg_callig","label":"書法社","kind":"bg","x":-59.2,"z":-4.9,"ry":0},
  {"id":"boardgame","label":"桌遊社","kind":"look","x":-55.6,"z":-4.9,"ry":0},
  {"id":"bg_kendo","label":"劍道社","kind":"bg","x":-52.0,"z":-4.9,"ry":0},
  {"id":"magic","label":"魔術社","kind":"look","x":-48.4,"z":-4.9,"ry":0},
  {"id":"bg_ballroom","label":"國標舞社","kind":"bg","x":-44.8,"z":-4.9,"ry":0},
  {"id":"film","label":"電影研究社","kind":"look","x":-4.6,"z":-4.9,"ry":0},
  {"id":"bg_tabletennis","label":"桌球社","kind":"bg","x":-1.0,"z":-4.9,"ry":0},
  {"id":"bg_piano","label":"鋼琴社","kind":"bg","x":2.6,"z":-4.9,"ry":0},
  {"id":"bg_tea","label":"茶藝社","kind":"bg","x":6.2,"z":-4.9,"ry":0},
  {"id":"bg_birds","label":"野鳥社","kind":"bg","x":9.8,"z":-4.9,"ry":0},
  {"id":"bg_recorder","label":"直笛團","kind":"bg","x":-84.4,"z":4.9,"ry":3.141593},
  {"id":"dance","label":"熱舞社","kind":"look","x":-80.8,"z":4.9,"ry":3.141593},
  {"id":"bg_tennis","label":"網球社","kind":"bg","x":-77.2,"z":4.9,"ry":3.141593},
  {"id":"chorus","label":"合唱團","kind":"look","x":-73.6,"z":4.9,"ry":3.141593},
  {"id":"bg_swim","label":"游泳社","kind":"bg","x":-70.0,"z":4.9,"ry":3.141593},
  {"id":"badminton","label":"羽球社","kind":"look","x":-66.4,"z":4.9,"ry":3.141593},
  {"id":"bg_climb","label":"攀岩社","kind":"bg","x":-62.8,"z":4.9,"ry":3.141593},
  {"id":"service","label":"服務隊","kind":"look","x":-59.2,"z":4.9,"ry":3.141593},
  {"id":"bg_cycling","label":"單車社","kind":"bg","x":-55.6,"z":4.9,"ry":3.141593},
  {"id":"lawclub","label":"法律服務社","kind":"join","club":"lawclub","x":-47.5,"z":13.5,"ry":3.141593},
  {"id":"basketball","label":"法律系系學會　系籃","kind":"join","club":"dept_basketball","x":-28.5,"z":13.5,"ry":3.141593},
  {"id":"info","label":"社團博覽會　服務台","kind":"info","x":-20.8,"z":4.9,"ry":3.141593},
  {"id":"coffee","label":"咖啡研究社","kind":"look","x":-17.2,"z":4.9,"ry":3.141593},
  {"id":"bg_japanese","label":"日文研究社","kind":"bg","x":-13.6,"z":4.9,"ry":3.141593},
  {"id":"alumni","label":"嘉義校友會","kind":"look","x":-10.0,"z":4.9,"ry":3.141593},
  {"id":"bg_pottery","label":"陶藝社","kind":"bg","x":-6.4,"z":4.9,"ry":3.141593},
  {"id":"bg_sign","label":"手語社","kind":"bg","x":-2.8,"z":4.9,"ry":3.141593},
  {"id":"bg_fencing","label":"西洋劍社","kind":"bg","x":0.8,"z":4.9,"ry":3.141593}
 ],
 "stage":{"x":-25.25,"z":-5.5,"w":9.0,"d":4.5,"h":0.8,"ry":0,"front":[-25.25,-0.6],"note":"北側、大道中段（傅鐘斜對面）；台面 x −29.75～−20.75、z −7.75～−3.25、高 0.8 m；後面桁架＋背板（印「社團博覽會」）、兩邊喇叭；觀眾站在大道中間"}
}
