function parseLichKQ(csv) {
  const rows = parseCSV(csv);
  if (rows.length < 2) return { tran: [], playerNames: [] };

  const header = rows[1]; // Dòng 2

  // Header bị lệch do merged cells khi export CSV
  // → Hardcode đúng thứ tự cầu thủ theo col thực tế (từ debug log)
  // Col: 9=Dương 10=Tài 11=Cung 12=Quang 13=Tuyên 14=Đạt 15=Khánh 16=Anh
  //      17=Dũng 18=Triều 19=Thái 20=Thành 21=Vũ 22=Hùng 23=Luân 24=Cường
  //      25=Linh 26=Thanh 27=Dũng 90 28=Hải 29=Đạt Em 30=Phi 31=Giang
  //      32=Luyện 33=Cảnh (GK) 34=Tuấn (GK) 35=Thông (GK) 36=Khác
  // PLAYER_COLS hardcode theo năm (merged cells khi export CSV)
  const PLAYER_COLS_MAP = {
    2026: [
      { col: 9, name:'Dương'      },
      { col:10, name:'Tài'        },
      { col:11, name:'Cung'       },
      { col:12, name:'Quang'      },
      { col:13, name:'Đạt'        },
      { col:14, name:'Tuyên'      },
      { col:15, name:'Anh'        },
      { col:16, name:'Dũng'       },
      { col:17, name:'Triều'      },
      { col:18, name:'Thái'       },
      { col:19, name:'Vũ'         },
      { col:20, name:'Thành'      },
      { col:21, name:'Luân'       },
      { col:22, name:'Cường'      },
      { col:23, name:'Thanh'      },
      { col:24, name:'Dũng 90'    },
      { col:25, name:'Hải'        },
      { col:26, name:'Đạt Em'     },
      { col:27, name:'Thông (GK)' },
      { col:28, name:'Tuấn (GK)'  },
      { col:29, name:'Khánh'      },
      { col:30, name:'Hùng'       },
      { col:31, name:'Phi'        },
      { col:32, name:'Cảnh (GK)'  },
      { col:33, name:'Giang'      },
      { col:34, name:'Linh'       },
      { col:35, name:'Luyện'      },
      { col:36, name:'Thuận'      },
      { col:37, name:'Khác'       },
    ],
    2025: [
      { col: 9, name:'Dương'      },
      { col:10, name:'Tài'        },
      { col:11, name:'Cung'       },
      { col:12, name:'Quang'      },
      { col:13, name:'Đạt'        },
      { col:14, name:'Anh'        },
      { col:15, name:'Tuyên'      },
      { col:16, name:'Dũng'       },
      { col:17, name:'Triều'      },
      { col:18, name:'Linh'       },
      { col:19, name:'Thái'       },
      { col:20, name:'Vũ'         },
      { col:21, name:'Thông (GK)' },
      { col:22, name:'Thành'      },
      { col:23, name:'Tuấn (GK)'  },
      { col:24, name:'Khánh'      },
      { col:25, name:'Đức (GK)'   },
      { col:26, name:'Hùng'       },
      { col:27, name:'Luân'       },
      { col:28, name:'Cường'      },
      { col:29, name:'Thanh'      },
      { col:30, name:'Dũng 90'    },
      { col:31, name:'Hải'        },
      { col:32, name:'Đạt Em'     },
      { col:33, name:'Khác'       },
    ],
  };
  const PLAYER_COLS = PLAYER_COLS_MAP[currentYear] || PLAYER_COLS_MAP[2026];
  const playerNames = PLAYER_COLS.map(p => p.name);

  const tran = [];
  for (let i = 2; i < rows.length; i++) { // Dòng 3 trở đi = data
    const r = rows[i];
    const stt = (r[0]||'').trim();
    if (!stt || isNaN(parseInt(stt))) continue;
    const san = (r[3]||'').trim();
    if (!san) continue; // bỏ dòng không có tên sân
    const taRaw   = (r[5]||'').trim();
    const dichRaw = (r[7]||'').trim();
    const ta   = taRaw   !== '' ? parseInt(taRaw)   : null;
    const dich = dichRaw !== '' ? parseInt(dichRaw) : null;

    // Col 8 = KQ text (W/L/D), fallback tự tính từ tỉ số
    let kq = (r[8]||'').trim().toUpperCase();
    if (!['W','L','D'].includes(kq)) {
      if (ta !== null && dich !== null) kq = ta > dich ? 'W' : ta < dich ? 'L' : 'D';
      else kq = '-';
    }

    // Map cầu thủ theo đúng số cột thực tế
    const players = {};
    PLAYER_COLS.forEach(({ col, name }) => {
      const v = (r[col] || '').trim();
      if (v.toUpperCase() === 'N') players[name] = 'N';
      else if (v === '' || v === '-') players[name] = null;
      else { const n = parseInt(v); players[name] = isNaN(n) ? 0 : n; }
    });

    const nguoi = playerNames.filter(p => players[p] !== 'N' && players[p] !== null).length;

    tran.push({
      id:     parseInt(stt),
      ngay:   (r[1]||'').trim(),
      gio:    (r[2]||'').trim(),
      san,
      doiThu: (r[4]||'').trim(),
      ta, dich, kq,
      nguoi, players,
      chi: 0
    });
  }

  return { tran, playerNames };
}

// ═══════════════════════════════════════════════
//  PARSE sheet "YEAR - Chi tiết đóng quỹ"
//  A:Ngày  B:Tên  C:Số tiền  D:Quý  E:NOTE
//  Dòng 1 = header, dòng 2–100 = data
// ═══════════════════════════════════════════════
function parseChiTiet(csv) {
  const rows = parseCSV(csv);
  const list = [];
  for (let i = 1; i <= 99 && i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    const ngay = (r[0]||'').trim();
    const ten  = (r[1]||'').trim();
    const soRaw = (r[2]||'').trim().replace(/,/g,'');
    if (!ngay || !ten) continue; // bỏ hàng trống
    const so  = parseFloat(soRaw) || 0;
    const quy = (r[3]||'').trim();
    const note= (r[4]||'').trim();
    list.push({ ngay, ten, so, quy, note });
  }
  return list;
}
//  Âm quỹ:   B91:C109 → row index 90–108, col B=1, C=2
//  Chi trận: K2:AN82  → row index 1–81,   K=10,L=11,M=12,AM=38,AN=39
//  Quỹ đội:  A2:I30   → row index 2–30,   STT=0,Họ=1,Tên=2,Tổng=3,Tồn=4,Q1=5,Q2=6,Q3=7,Q4=8
// ═══════════════════════════════════════════════
function parseThuChi(csv) {
  const rows = parseCSV(csv);

  // 1. Chi từng trận (K2:AN82)
  const chiTran = [];
  for (let i = 1; i <= 81; i++) {
    const r = rows[i]; if (!r) continue;
    const id      = (r[10]||'').trim();
    const diaDiem = (r[11]||'').trim();
    if (!id || isNaN(parseInt(id)) || !diaDiem) continue;
    const chi   = parseFloat((r[12]||'').replace(/,/g,'')) || 0;
    const nguoi = parseInt((r[41]||'').trim()) || 0;
    const chiTB = parseFloat((r[42]||'').replace(/,/g,'')) || 0;
    chiTran.push({ id: parseInt(id), diaDiem, chi, nguoi, chiTB });
  }

  // 2. Quỹ đội từng người (A3:I30, row index 2–29, dòng 2 là header)
  const quyDoi = [];
  let tongChi = 0, conLai = 0;
  for (let i = 2; i <= 29; i++) {
    const r = rows[i]; if (!r) continue;
    const stt = (r[0]||'').trim();
    const ho  = (r[1]||'').trim();
    const ten = (r[2]||'').trim();
    if (!stt || isNaN(parseInt(stt)) || !ten) continue;
    const n = v => parseFloat((v||'').replace(/,/g,'').trim()) || 0;
    quyDoi.push({
      stt: parseInt(stt), ho, ten,
      tong: n(r[3]), ton:  n(r[4]),
      q1:   n(r[5]), q2:   n(r[6]),
      q3:   n(r[7]), q4:   n(r[8]),
    });
  }

  // Đọc TỔNG CHI và CÒN từ sheet (row 30, 31)
  for (let i = 29; i <= 33; i++) {
    const r = rows[i]; if (!r) continue;
    const label = (r[2]||'').trim().toUpperCase();
    if (label.includes('TỔNG CHI') || label.includes('TONG CHI'))
      tongChi = parseFloat((r[3]||'').replace(/,/g,'')) || 0;
    if (label === 'CÒN' || label === 'CON')
      conLai = parseFloat((r[3]||'').replace(/,/g,'')) || 0;
  }

  // 3. Chi & Còn lại từng người — theo debug log thực tế
  // row 83=tổng chi, row 85=còn lại
  const FINANCE_COLS = [
    { col:13, name:'Dương'      },
    { col:14, name:'Tài'        },
    { col:15, name:'Cung'       },
    { col:16, name:'Quang'      },
    { col:17, name:'Đạt'        },
    { col:18, name:'Tuyên'      },
    { col:19, name:'Anh'        },
    { col:20, name:'Dũng'       },
    { col:21, name:'Triều'      },
    { col:22, name:'Thái'       },
    { col:23, name:'Vũ'         },
    { col:24, name:'Thành'      },
    { col:25, name:'Luân'       },
    { col:26, name:'Cường'      },
    { col:27, name:'Thanh'      },
    { col:28, name:'Dũng 90'    },
    { col:29, name:'Hải'        },
    { col:30, name:'Đạt Em'     },
    { col:31, name:'Thông (GK)' },
    { col:32, name:'Tuấn (GK)'  },
    { col:33, name:'Khánh'      },
    { col:34, name:'Hùng'       },
    { col:35, name:'Phi'        },
    { col:36, name:'Cảnh (GK)'  },
    { col:37, name:'Giang'      },
    { col:38, name:'Linh'       },
    { col:39, name:'Luyện'      },
    { col:40, name:'Thuận'      },
  ];
  const playerFinance = {};
  FINANCE_COLS.forEach(({ col, name }) => {
    const chi = parseFloat(((rows[83]||[])[col]||'').replace(/,/g,'')) || 0;
    const con = parseFloat(((rows[85]||[])[col]||'').replace(/,/g,'')) || 0;
    playerFinance[name] = { tongChi: chi, conLai: con };
  });

  // 4. Âm quỹ — scan từ row 85–105
  const amList = [];
  for (let i = 85; i <= 105; i++) {
    const r = rows[i]; if (!r) continue;
    const ten   = (r[2]||'').trim();
    const soRaw = (r[1]||'').replace(/,/g,'').trim();
    if (!ten) continue;
    const so = parseFloat(soRaw);
    if (isNaN(so)) continue;
    amList.push({ ten, so });
  }
  amList.sort((a,b) => a.so - b.so);

  return { amList, chiTran, quyDoi, tongChi, conLai, playerFinance };
}

// ═══════════════════════════════════════════════
//  PARSE sheet "YEAR - Thành Viên"
//  Row 1: title, Row 2: header, Row 3+: data
//  A:STT B:Họ C:Tên D:SốÁo E:SĐT F:NgàySinh G:Email H:Status
// ═══════════════════════════════════════════════
function parseThanhVien(csv) {
  const rows = parseCSV(csv);
  const members = [];
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i];
    const ten = (r[2]||'').trim();
    if (!ten) continue;
    members.push({
      stt:    (r[0]||'').trim(),
      ho:     (r[1]||'').trim(),
      ten,
      soAo:   (r[3]||'').trim(),
      sdt:    (r[4]||'').trim(),
      ngaySinh: (r[5]||'').trim(),
      email:  (r[6]||'').trim(),
      status: (r[7]||'').trim(),
    });
  }
  return members;
}


// ═══════════════════════════════════════════════

// Danh sách cầu thủ fallback (nếu sheet chưa load)
const PLAYERS = [
  'Dương','Tài','Cung','Quang','Tuyên','Đạt','Khánh','Anh',
  'Dũng','Triều','Thái','Thành','Vũ','Hùng','Luân','Cường',
  'Thanh','Dũng 90','Hải','Đạt Em','Phi','Giang',
  'Cảnh (GK)','Tuấn (GK)','Thông (GK)'
];

const DB = {
  2026: {
    thuChi: {
      tongThu:23234319, tongChi:19076000, conLai:4158319, quyTon:314319,
      soThanhVien:27, quyI:21920000, quyII:0, quyIII:0, quyIV:0,
      taiKhoan:'61609091989 — VÕ ĐỨC ANH — TPBank',
      ghiChu:'Thủ môn: free (trừ trận livestream & ăn nhậu)',
    },
    lichKQ: { tran: [], playerNames: [] }, // fetch realtime
    dongQuy:[
      {no:1, ho:'Phan Đăng',    ten:'Dương',     ton:-132880,  q1:4050000,q2:0,q3:0,q4:0,tong:3917120},
      {no:2, ho:'Đinh Anh',     ten:'Tài',       ton:-207547,  q1:2000000,q2:0,q3:0,q4:0,tong:1792453},
      {no:3, ho:'Nguyễn Sỹ',   ten:'Cung',      ton:91812,    q1:1700000,q2:0,q3:0,q4:0,tong:1791812},
      {no:4, ho:'Nguyễn Văn',  ten:'Quang',     ton:76535,    q1:1000000,q2:0,q3:0,q4:0,tong:1076535},
      {no:5, ho:'Dương Quang', ten:'Đạt',       ton:57958,    q1:2000000,q2:0,q3:0,q4:0,tong:2057958},
      {no:6, ho:'Nguyễn Mạnh', ten:'Tuyên',     ton:116931,   q1:670000, q2:0,q3:0,q4:0,tong:786931},
      {no:7, ho:'Võ Đức',      ten:'Anh',       ton:569419,   q1:1000000,q2:0,q3:0,q4:0,tong:1569419},
      {no:8, ho:'Võ Đức',      ten:'Dũng',      ton:-241087,  q1:0,      q2:0,q3:0,q4:0,tong:-241087},
      {no:9, ho:'Võ Văn',      ten:'Triều',     ton:-284467,  q1:1000000,q2:0,q3:0,q4:0,tong:715533},
      {no:10,ho:'Phan Văn',    ten:'Thái',      ton:-341572,  q1:1000000,q2:0,q3:0,q4:0,tong:658428},
      {no:11,ho:'Nguyễn Trần', ten:'Vũ',        ton:-251914,  q1:1500000,q2:0,q3:0,q4:0,tong:1248086},
      {no:12,ho:'Dương Thế',   ten:'Thành',     ton:-61566,   q1:500000, q2:0,q3:0,q4:0,tong:438434},
      {no:13,ho:'Đinh',        ten:'Luân',      ton:103974,   q1:500000, q2:0,q3:0,q4:0,tong:603974},
      {no:14,ho:'Nguyễn Hữu',  ten:'Cường',     ton:206310,   q1:0,      q2:0,q3:0,q4:0,tong:206310},
      {no:15,ho:'Võ Thiện',    ten:'Thanh',     ton:843965,   q1:0,      q2:0,q3:0,q4:0,tong:843965},
      {no:16,ho:'Bùi Đình',    ten:'Dũng 90',   ton:-163900,  q1:1000000,q2:0,q3:0,q4:0,tong:836100},
      {no:17,ho:'Trần Ngọc',   ten:'Hải',       ton:287642,   q1:1000000,q2:0,q3:0,q4:0,tong:1287642},
      {no:18,ho:'Đỗ Thành',    ten:'Đạt Em',    ton:-60583,   q1:0,      q2:0,q3:0,q4:0,tong:-60583},
      {no:19,ho:'Trần Trung',  ten:'Thông (GK)',ton:-105750,  q1:0,      q2:0,q3:0,q4:0,tong:-105750},
      {no:20,ho:'Hoàng',       ten:'Tuấn (GK)', ton:99177,    q1:500000, q2:0,q3:0,q4:0,tong:599177},
      {no:21,ho:'Trần Quốc',   ten:'Khánh',     ton:-397329,  q1:1000000,q2:0,q3:0,q4:0,tong:602671},
      {no:22,ho:'Doãn',        ten:'Hùng',      ton:109191,   q1:0,      q2:0,q3:0,q4:0,tong:109191},
      {no:23,ho:'Đặng Đức',    ten:'Phi',       ton:0,        q1:1000000,q2:0,q3:0,q4:0,tong:1000000},
      {no:24,ho:'Võ Thanh',    ten:'Cảnh (GK)', ton:0,        q1:500000, q2:0,q3:0,q4:0,tong:500000},
      {no:25,ho:'Nguyễn Hoàng',ten:'Giang',     ton:0,        q1:1000000,q2:0,q3:0,q4:0,tong:1000000},
      {no:26,ho:'Võ Hoàng',    ten:'Linh',      ton:-217546,  q1:1000000,q2:0,q3:0,q4:0,tong:782454},
      {no:27,ho:'Nguyễn Minh', ten:'Luyện',     ton:0,        q1:500000, q2:0,q3:0,q4:0,tong:500000},
    ]
  },
  2025:{ thuChi:{tongThu:0,tongChi:0,conLai:314319,quyTon:0,soThanhVien:26,quyI:0,quyII:0,quyIII:0,quyIV:0,taiKhoan:'61609091989 — VÕ ĐỨC ANH — TPBank',ghiChu:'Chưa cập nhật dữ liệu 2025.'}, lichKQ:{tongTran:0,thang:0,hoa:0,thua:0,banThang:0,banThua:0,tran:[]}, dongQuy:[] },
  2024:{ thuChi:{tongThu:0,tongChi:0,conLai:0,quyTon:0,soThanhVien:25,quyI:0,quyII:0,quyIII:0,quyIV:0,taiKhoan:'61609091989 — VÕ ĐỨC ANH — TPBank',ghiChu:'Chưa cập nhật dữ liệu 2024.'}, lichKQ:{tongTran:0,thang:0,hoa:0,thua:0,banThang:0,banThua:0,tran:[]}, dongQuy:[] },
};

// ─── HELPERS ───────────────────────────────────
const YEARS = [2026, 2025];
let currentYear = 2026;

const vnd  = n => (n??0).toLocaleString('vi-VN') + ' ₫';
const short = n => {
  if(!n && n!==0) return '—';
  const a=Math.abs(n), s=n<0?'-':'';
  if(a>=1e6) return s+(a/1e6).toFixed(1)+'M';
  if(a>=1e3) return s+Math.round(a/1e3)+'K';
  return s+a;
};
const initials = (ho,ten) => ((ho||'').trim().split(' ').pop()[0]||(ten||'')[0]||'?').toUpperCase() + ((ten||'')[0]||'').toUpperCase();
const kqBadge = k => k==='W'?'<span class="badge badge-w">Thắng</span>':k==='L'?'<span class="badge badge-l">Thua</span>':k==='D'?'<span class="badge badge-d">Hòa</span>':'<span class="badge" style="background:var(--bg4);color:var(--muted)">Chưa đấu</span>';
const kqCls   = k => k==='W'?'win':k==='L'?'lose':k==='D'?'draw':'upcoming';
