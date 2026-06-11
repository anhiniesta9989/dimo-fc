// ═══════════════════════════════════════════════
//  CONFIG — Google Sheets
// ═══════════════════════════════════════════════
const SHEET_ID = '1lw8_DGDWDezkbIO78YNLpgZ8viM0j-7qa6n_XIlOFGQ';

// Fetch CSV từ Google Sheets (public viewer)
async function fetchCSV(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return await res.text();
}

// Parse CSV đơn giản (xử lý quoted fields)
function parseCSV(text) {
  return text.split('\n').filter(l => l.trim()).map(line => {
    const row = []; let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { row.push(cur.trim().replace(/^"|"$/g,'')); cur = ''; }
      else cur += c;
    }
    row.push(cur.trim().replace(/^"|"$/g,''));
    return row;
  });
}

// ═══════════════════════════════════════════════
//  PARSE sheet "YEAR - LỊCH & KẾT QUẢ"
//
//  Cấu trúc cột:
//  0:Ngày  1:Giờ  2:Sân  3:Đối thủ  4:Ta  5:"-"  6:Địch  7:KQ
//  8+: tên cầu thủ (0=có mặt, N=vắng, số=bàn thắng)
// ═══════════════════════════════════════════════
