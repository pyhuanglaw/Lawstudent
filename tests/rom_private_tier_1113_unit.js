// ROM-PRIVATE-DATE-1110 照活動分輕重（使用者 11-13 選擇題「照活動分輕重」）：私下單獨約可以攻略的對象
//   比較像約會的（晚餐＝吃飯 17:00 以後、散步、看電影逛書店那一類）＝她的戀愛 +2；日常的（念書、喝咖啡、吃午餐）＝+1；信任照舊 +1、一天一次。
// 用法：node tests/rom_private_tier_1113_unit.js
const H=require('./pg_harness.js'); const {check}=H; const fs=require('fs'), path=require('path'); console.warn=()=>{};
H.fresh('2026-10-14',14,'campus');
const A=(id,h)=>INV.romAloneAmt(INV.place(id),{h});
check('1. 散步（溫州街 wenzhou）＝+2',A('wenzhou',15)===2,A('wenzhou',15));
check('1. 看電影（南洋 xs_nanyang，fun）＝+2',A('xs_nanyang',19)===2,A('xs_nanyang',19));
check('1. 逛書店（頁間 bookstore，fun）＝+2',A('bookstore',15)===2,A('bookstore',15));
check('1. 吃晚餐（公館燒臘 18:00）＝+2',A('noodle',18)===2,A('noodle',18));
check('1. 吃午餐（公館燒臘 12:00）＝+1',A('noodle',12)===1,A('noodle',12));
check('1. 喝咖啡（兩點半 cafe）＝+1',A('cafe',15)===1,A('cafe',15));
check('1. 念書（總圖 library）＝+1',A('library',10)===1,A('library',10));
const src=fs.readFileSync(path.join(H.ROOT,'src/invites3d.js'),'utf8');
check('2. 單獨約加戀愛那一行用 romAloneAmt（她的戀愛、祐廷的戀愛同一個數，信任 +1）',/const rr=S\.romAloneAmt\(P,iv\); SOCIAL\.adjust\(iv\.who,\{npcRom:rr,rom:rr,trust:1\}\)/.test(src));
H.done();
