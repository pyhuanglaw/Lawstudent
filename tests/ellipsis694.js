/* AA_694（DATE-ELLIPSIS-1105）約會台詞拿掉沒必要的「……」——和 tools/date/ellipsis694.py 同一條規則（測試用）：
   句首（含「（」「「」後面）、句末標點（。！？）後、「）」後的「……」拿掉；詞中間的停頓、句尾、整句只有「……」的留著。
   測試裡寫死的舊稿句子（企劃稿、白名單原檔）先照這條換，再和 date_lines.js 比。 */
const ONLY=/^[（「]?(?:……)+[。！？]*[）」]?$/;
function strip(s){
  if(typeof s!=='string'||!s.includes('……')||ONLY.test(s)) return s;
  let prev=null;
  while(prev!==s){ prev=s;
    s=s.replace(/^([（「]?)(?:……)+/,'$1').replace(/([。！？）])(?:……)+/g,'$1').replace(/([（「])(?:……)+/g,'$1'); }
  return s;
}
function deep(x){ if(typeof x==='string') return strip(x); if(Array.isArray(x)) return x.map(deep);
  if(x&&typeof x==='object'){ const o={}; for(const k of Object.keys(x)) o[k]=deep(x[k]); return o; } return x; }
module.exports={strip,deep};
