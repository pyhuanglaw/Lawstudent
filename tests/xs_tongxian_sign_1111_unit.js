// XS-TONGXIAN-SIGN-1111（LAWWW2 帳號 A 2026-11-11；BB X323 招牌拉正小結的 P2：「同弦樂器」招牌裝在二樓鐵窗後面、整塊隔著欄杆，右邊的冷氣室外機擋住最後一個字，從街上看不出店名）
// 原因：XS_FRONTS.tongxian 的 up 第二段（blank＝招牌後面不開窗）在 wz_street.apartment 蓋掉原本的窗時，把同一層第一段的吉他櫥窗（kind 'xs'）也刪掉了；
//       而遊戲裡的 xinsheng_street.glb 是加這一段以前匯出的 → 鐵窗、冷氣還在招牌前面。
// 修法：蓋窗只蓋原本的窗（kind 不是 'xs' 的）；不開窗的那一段用同一種外牆補滿（不是另外補一塊平塗的顏色）；重新匯出 xinsheng_street.glb。
// 這支只檢查腳本和模型的統計（鐵窗、冷氣各少一個）；畫面要看 CC 的遊戲截圖。用法：node tests/xs_tongxian_sign_1111_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const st=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/wz_street.py'),'utf8'), kit=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/wz_shopkit.py'),'utf8');
check('1. 同弦二樓：招牌那一段不開窗（blank）、旁邊是吉他櫥窗（tongxian_up）',/'tongxian': dict\([^\n]*signs=\[\('tongxian_sign'/.test(st)&&/tex='tongxian_up'/.test(st)&&/x0=-3\.0, x1=0\.3, y0=_G \+ 0\.35, y1=_G \+ 2\.6, tex=None, blank=True/.test(st));
check('2. 蓋窗只蓋原本的窗：同一層前面排好的 xs 窗不動（不然第二段把第一段的櫥窗刪掉）',/wins = \[w for w in wins if not \(w\['kind'\] != 'xs' and w\['f'\] == u\['f'\]/.test(st));
check('3. 不開窗的那一段用同一種外牆補滿（wz_street）；xs_window 不再另外補一塊平塗的顏色',/if w\.get\('blank'\): xf\.box\(wl, /.test(st)&&/if w\.get\('blank'\): return/.test(kit));
let J={}; try{ J=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/xinsheng_street.json'),'utf8')); }catch(e){}
/* SHOP-WINDOW-3D-1112：立體店內一間多一個物件（sk_in_<店>）——從物件數扣掉再比 */
const XS_IN3D=(()=>{ try{ const g=fs.readFileSync(path.join(__dirname,'..','assets/models/env/second_ai/xinsheng_street.glb')); const n=g.readUInt32LE(12); return JSON.parse(g.slice(20,20+n).toString('utf8')).nodes.filter(q=>/^sk_in_/.test(q.name||'')).length; }catch(e){ return 0; } })();
check('4. 模型重新匯出了：招牌前面的鐵窗、冷氣各少一個（物件 183 → 181 以下；不算立體店內 '+XS_IN3D+' 個）',J.objects>0&&J.objects-XS_IN3D<=181,'objects '+J.objects);
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
