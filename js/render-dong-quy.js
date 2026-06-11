function renderDongQuy(){
  const el  = document.getElementById('page-dong-quy');
  const tc2 = DB[currentYear].thuChi2;

  if (!tc2 || !tc2.amList) {
    el.innerHTML=`<div class="empty"><div class="big">📋</div>Dữ liệu năm ${currentYear} chưa được nhập.</div>`;
    return;
  }

  const amList = tc2.amList;
  if (!amList.length) {
    el.innerHTML=`<div class="empty"><div class="big">🎉</div>Không có thành viên nào âm quỹ!</div>`;
    return;
  }

  const tongNo  = amList.reduce((s,m) => s + m.so, 0);
  const maxAm   = Math.abs(amList[0].so) || 1;
  const chiTiet = DB[currentYear].chiTiet || [];

  // Group theo tên để tính tổng mỗi người
  const tongMap = {};
  chiTiet.forEach(r => {
    tongMap[r.ten] = (tongMap[r.ten]||0) + r.so;
  });

  el.innerHTML=`
    <div class="stats-row">
      <div class="stat-card fade-in d1" data-glow="⚠">
        <div class="stat-label">Thành Viên Nợ</div>
        <div class="stat-val r">${amList.length}</div>
        <div class="stat-sub">Số dư âm</div>
      </div>
      <div class="stat-card fade-in d2" data-glow="💸">
        <div class="stat-label">Tổng Nợ</div>
        <div class="stat-val r">${short(tongNo)}</div>
        <div class="stat-sub">Cần thu thêm</div>
      </div>
      <div class="stat-card fade-in d3" data-glow="📋">
        <div class="stat-label">Số Lần Đóng</div>
        <div class="stat-val b">${chiTiet.length}</div>
        <div class="stat-sub">Giao dịch ${currentYear}</div>
      </div>
      <div class="stat-card fade-in d4" data-glow="💰">
        <div class="stat-label">Tổng Đã Thu</div>
        <div class="stat-val g">${short(chiTiet.reduce((s,r)=>s+r.so,0))}</div>
        <div class="stat-sub">Năm ${currentYear}</div>
      </div>
    </div>

    <!-- 3 CARD CÙNG 1 HÀNG -->
    <div class="grid3" style="margin-bottom:28px">

      <!-- DANH SÁCH ÂM QUỸ -->
      <div class="card">
        <div class="card-title">🔴 DANH SÁCH ÂM QUỸ — ${currentYear}</div>
        ${amList.map((m, i) => `
          <div ${i >= 5 ? 'class="am-quy-extra" style="display:none"' : ''}>
            <div class="prow">
              <div style="font-size:11px;color:var(--muted);width:20px;flex-shrink:0">${i+1}</div>
              <div class="prow-name" style="width:90px" title="${m.ten}">${m.ten}</div>
              <div class="prow-bar-bg"><div class="prow-bar-fill r" style="width:${Math.abs(m.so)/maxAm*100}%"></div></div>
              <div class="prow-val neg" style="width:90px">${vnd(m.so)}</div>
            </div>
          </div>`).join('')}
        ${amList.length > 5 ? `
        <div style="text-align:center;margin-top:10px">
          <button id="am-quy-btn" onclick="toggleTable('am-quy')"
            style="padding:5px 16px;background:var(--bg3);border:1px solid var(--border2);border-radius:8px;color:var(--muted2);font-size:11px;cursor:pointer">
            Xem thêm ${amList.length - 5} người ▾
          </button>
        </div>` : ''}
      </div>

      <!-- TÀI KHOẢN QUỸ -->
      <div class="card" style="text-align:center">
        <div class="card-title" style="color:var(--yellow)">🏦 TÀI KHOẢN QUỸ</div>
        <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">61609091989</div>
        <div style="font-size:13px;color:var(--muted2);margin-bottom:14px">VÕ ĐỨC ANH — TPBank</div>
        <img src="https://raw.githubusercontent.com/anhiniesta9989/dimo-fc/main/QRQuy.png"
          alt="QR Code TPBank"
          style="width:100%;max-width:200px;border-radius:12px;border:2px solid var(--border2)">
      </div>

      <!-- LƯU Ý -->
      <div class="card">
        <div class="card-title" style="color:var(--yellow)">📌 LƯU Ý</div>
        <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:16px;flex-shrink:0">🧤</span>
          <span style="font-size:13px;color:var(--muted2);line-height:1.6">Free cho tất cả thủ môn (trừ các trận livestream &amp; ăn nhậu)</span>
        </div>
        <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:16px;flex-shrink:0">🧤</span>
          <span style="font-size:13px;color:var(--muted2);line-height:1.6">Mọi thắc mắc xin liên hệ Giám đốc tài chính (Đức Anh)</span>
        </div>
        <div style="padding-top:14px">
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Lịch đóng quỹ</div>
          ${[['Quý I','1/1 – 31/3'],['Quý II','1/4 – 30/6'],['Quý III','1/7 – 30/9'],['Quý IV','1/10 – 31/12']].map(([q,r])=>`
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
              <span style="font-size:13px;font-weight:600;color:var(--text)">${q}</span>
              <span style="font-size:12px;color:var(--muted2)">${r}</span>
            </div>`).join('')}
        </div>
      </div>

    </div>

    <div class="sec-title">CHI TIẾT ĐÓNG QUỸ TỪNG NGƯỜI — ${currentYear}</div>
    <div class="table-wrap" style="margin-bottom:8px">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Ngày</th>
            <th>Tên</th>
            <th>Số Tiền</th>
            <th>Quý</th>
            <th>Ghi Chú</th>
          </tr>
        </thead>
        <tbody>
          ${(() => {
            // Parse ngày "5 Jan" hoặc "3 Mar" → sort mới nhất lên đầu
            const MONTHS = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
            function parseDate(s) {
              if (!s) return 0;
              const p = s.trim().split(' ');
              if (p.length < 2) return 0;
              return new Date(currentYear, MONTHS[p[1]]||0, parseInt(p[0])||1).getTime();
            }
            const sorted = [...chiTiet].sort((a,b) => parseDate(b.ngay) - parseDate(a.ngay));
            return sorted.map((r, i) => `
              <tr ${i >= 5 ? 'class="chi-tiet-extra" style="display:none"' : ''}>
                <td style="color:var(--muted);font-size:11px">${i+1}</td>
                <td style="color:var(--muted2);font-size:12px">📅 ${r.ngay}</td>
                <td style="font-weight:600">${r.ten}</td>
                <td style="color:var(--green);font-weight:600">${vnd(r.so)}</td>
                <td style="color:var(--muted2)">Q${r.quy||'—'}</td>
                <td style="color:var(--muted2);font-size:12px">${r.note||'—'}</td>
              </tr>`).join('');
          })()}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg3)">
            <td colspan="3" style="font-weight:600;color:var(--muted2)">TỔNG ĐÃ THU</td>
            <td style="color:var(--green);font-weight:700">${vnd(chiTiet.reduce((s,r)=>s+r.so,0))}</td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
    ${chiTiet.length > 5 ? `
    <div style="text-align:center;margin-bottom:28px">
      <button id="chi-tiet-btn" onclick="toggleTable('chi-tiet')"
        style="padding:7px 20px;background:var(--bg3);border:1px solid var(--border2);border-radius:8px;color:var(--muted2);font-size:12px;cursor:pointer">
        Xem thêm ${chiTiet.length - 5} lần đóng ▾
      </button>
    </div>` : ''}`;
}

// ═══════════════════════════════════════════════
//  PAGE 4 — THÀNH VIÊN
// ═══════════════════════════════════════════════
function renderThanhVien() {
  const el = document.getElementById('page-thanh-vien');
  const members = DB[currentYear].thanhVien || [];
  if (!members.length) {
    el.innerHTML = `<div class="empty"><div class="big">👥</div>Chưa có dữ liệu thành viên.</div>`;
    return;
  }

  const active = members.filter(m => !m.status.toLowerCase().includes('nghỉ'));
  const nghi   = members.filter(m =>  m.status.toLowerCase().includes('nghỉ'));

  function memberCard(m) {
    const initials = ((m.ho.trim().split(' ').pop()[0]||'') + (m.ten[0]||'')).toUpperCase();
    const isNghi   = m.status.toLowerCase().includes('nghỉ');
    return `
      <div class="member-card ${isNghi?'nghi':''}">
        <div class="member-avatar">${initials}</div>
        <div class="member-so-ao">${m.soAo||'—'}</div>
        <div class="member-name">${m.ten}</div>
        <div class="member-ho">${m.ho}</div>
        <div style="margin:4px 0">
          ${isNghi
            ? '<span class="badge-nghi">Đã nghỉ</span>'
            : '<span class="badge-active">Đang tham gia</span>'}
        </div>
        ${m.ngaySinh ? `<div class="member-info-row">🎂 ${m.ngaySinh}</div>` : ''}
      </div>`;
  }

  el.innerHTML = `
    <div class="stats-row">
      <div class="stat-card fade-in d1" data-glow="👥">
        <div class="stat-label">Tổng Thành Viên</div>
        <div class="stat-val w">${members.length}</div>
        <div class="stat-sub">Mùa ${currentYear}</div>
      </div>
      <div class="stat-card fade-in d2" data-glow="✅">
        <div class="stat-label">Đang Tham Gia</div>
        <div class="stat-val g">${active.length}</div>
        <div class="stat-sub">Thành viên active</div>
      </div>
      <div class="stat-card fade-in d3" data-glow="🚪">
        <div class="stat-label">Đã Nghỉ</div>
        <div class="stat-val r">${nghi.length}</div>
        <div class="stat-sub">Không còn tham gia</div>
      </div>
    </div>
    <div class="sec-title">ĐANG THAM GIA (${active.length})</div>
    <div class="member-grid">${active.map(memberCard).join('')}</div>
    ${nghi.length ? `
    <div class="sec-title">ĐÃ NGHỈ (${nghi.length})</div>
    <div class="member-grid">${nghi.map(memberCard).join('')}</div>` : ''}`;
}

// ═══════════════════════════════════════════════
//  PARSE sheet "Thanh Vien"
// ═══════════════════════════════════════════════
function parseThanhVien(csv) {
  const rows = parseCSV(csv);
  const members = [];
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i];
    const ten = (r[2]||'').trim();
    if (!ten) continue;
    members.push({
      stt: (r[0]||'').trim(),
      ho:  (r[1]||'').trim(),
      ten,
      soAo:     (r[3]||'').trim(),
      sdt:      (r[4]||'').trim(),
      ngaySinh: (r[5]||'').trim(),
      email:    (r[6]||'').trim(),
      status:   (r[7]||'').trim(),
    });
  }
  return members;
}

// ═══════════════════════════════════════════════
//  PAGE 4 - THANH VIEN
// ═══════════════════════════════════════════════
