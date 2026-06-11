function renderThuChi(){
  const el  = document.getElementById('page-thu-chi');
  const tc2 = DB[currentYear].thuChi2;

  if (!tc2) {
    el.innerHTML=`<div class="empty"><div class="big">📂</div>Dữ liệu năm ${currentYear} chưa được nhập.</div>`;
    return;
  }

  const chiTran  = [...(tc2.chiTran || [])].sort((a,b) => b.id - a.id);
  const amList   = tc2.amList   || [];
  const quyDoi   = tc2.quyDoi   || [];
  const playerFinance = tc2.playerFinance || {};
  const chiTotal = chiTran.reduce((s,t) => s + t.chi, 0);
  // Tổng thu = sum tong của từng người
  const tongThu  = quyDoi.reduce((s,m) => s + m.tong, 0);
  // conLai từ sheet hoặc tự tính
  const conLai   = tc2.conLai || (tongThu - chiTotal);
  const conLaiColor = conLai >= 0 ? 'var(--green)' : 'var(--red)';

  el.innerHTML=`
    <div class="stats-row">
      <div class="stat-card fade-in d1" data-glow="💰">
        <div class="stat-label">Tổng Thu</div>
        <div class="stat-val g">${short(tongThu)}</div>
        <div class="stat-sub">${quyDoi.length} thành viên</div>
      </div>
      <div class="stat-card fade-in d2" data-glow="💸">
        <div class="stat-label">Tổng Chi</div>
        <div class="stat-val r">${short(chiTotal)}</div>
        <div class="stat-sub">${chiTran.length} trận đã đấu</div>
      </div>
      <div class="stat-card fade-in d3" data-glow="🏦">
        <div class="stat-label">Còn Lại</div>
        <div class="stat-val" style="color:${conLaiColor}">${short(conLai)}</div>
        <div class="stat-sub">Quỹ hiện tại</div>
      </div>
      <div class="stat-card fade-in d4" data-glow="📊">
        <div class="stat-label">Chi TB/Trận</div>
        <div class="stat-val b">${chiTran.length ? short(Math.round(chiTotal/chiTran.length)) : '—'}</div>
        <div class="stat-sub">${chiTran.length} trận tính</div>
      </div>
      <div class="stat-card fade-in d5" data-glow="⚠">
        <div class="stat-label">Thành Viên Nợ</div>
        <div class="stat-val r">${amList.length}</div>
        <div class="stat-sub">Tổng nợ ${short(amList.reduce((s,m)=>s+m.so,0))}</div>
      </div>
    </div>

    <!-- QUỸ ĐỘI TỪNG NGƯỜI -->
    <div class="sec-title">QUỸ ĐỘI TỪNG NGƯỜI — ${currentYear}</div>
    <div class="table-wrap" style="margin-bottom:8px">
      <table id="quy-doi-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Họ &amp; Tên</th>
            <th>Quỹ tồn ${currentYear-1}</th>
            <th>Quý I</th>
            <th>Quý II</th>
            <th>Quý III</th>
            <th>Quý IV</th>
            <th>Tổng Đóng</th>
            <th>Tổng Chi</th>
            <th>Còn Lại</th>
          </tr>
        </thead>
        <tbody>
          ${quyDoi.map((m, idx) => {
            const pf  = playerFinance[m.ten] || {};
            const chi = pf.tongChi || 0;
            const con = pf.conLai  !== undefined ? pf.conLai : (m.tong - chi);
            const conColor = con >= 0 ? 'color:var(--green)' : 'color:var(--red)';
            const fmt = v => v !== 0 ? vnd(v) : '—';
            const qStyle = 'font-size:12px;color:var(--muted2)';
            const hidden = idx >= 5 ? 'class="quy-doi-extra" style="display:none"' : '';
            return `<tr ${hidden}>
              <td style="color:var(--muted);font-size:11px">${m.stt}</td>
              <td><span style="color:var(--muted2);font-size:12px">${m.ho}</span> <strong>${m.ten}</strong></td>
              <td style="font-size:12px;${m.ton>=0?'color:var(--green)':'color:var(--red)'}">${m.ton!==0?vnd(m.ton):'—'}</td>
              <td style="${qStyle}">${fmt(m.q1)}</td>
              <td style="${qStyle}">${fmt(m.q2)}</td>
              <td style="${qStyle}">${fmt(m.q3)}</td>
              <td style="${qStyle}">${fmt(m.q4)}</td>
              <td style="font-weight:700;${m.tong>=0?'color:var(--green)':'color:var(--red)'}">${vnd(m.tong)}</td>
              <td style="font-size:12px;color:var(--red)">${chi > 0 ? vnd(chi) : '—'}</td>
              <td style="font-weight:700;${conColor}">${vnd(con)}</td>
            </tr>`;
          }).join('')}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg3)">
            <td colspan="7" style="font-weight:700;color:var(--muted2)">TỔNG</td>
            <td style="font-weight:700;color:var(--green)">${vnd(tongThu)}</td>
            <td style="font-weight:700;color:var(--red)">${vnd(chiTotal)}</td>
            <td style="font-weight:700;color:${conLai>=0?'var(--green)':'var(--red)'}">${vnd(conLai)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    ${quyDoi.length > 5 ? `
    <div style="text-align:center;margin-bottom:28px">
      <button id="quy-doi-btn" onclick="toggleTable('quy-doi')"
        style="padding:7px 20px;background:var(--bg3);border:1px solid var(--border2);border-radius:8px;color:var(--muted2);font-size:12px;cursor:pointer">
        Xem thêm ${quyDoi.length - 5} người ▾
      </button>
    </div>` : ''}

    <!-- CHI TIẾT TỪNG TRẬN -->
    <div class="sec-title">
      CHI TIẾT TỪNG TRẬN
    </div>
    <div id="chi-tran-wrap" style="display:block">
      <div class="table-wrap" style="margin-bottom:8px">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Ngày / Địa điểm</th>
              <th>Số tiền chi</th>
              <th>Số người</th>
              <th>Chi TB/người</th>
            </tr>
          </thead>
          <tbody>
            ${chiTran.map((t, idx) => {
              const hidden = idx >= 5 ? 'class="chi-tran-extra" style="display:none"' : '';
              return `<tr ${hidden}>
                <td style="color:var(--muted);font-size:11px">${t.id}</td>
                <td style="font-weight:500">${t.diaDiem}</td>
                <td style="color:var(--green);font-weight:600">${vnd(t.chi)}</td>
                <td style="color:var(--muted2)">${t.nguoi > 0 ? t.nguoi+' người' : '—'}</td>
                <td style="color:var(--yellow)">${t.chiTB > 0 ? vnd(t.chiTB) : '—'}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      ${chiTran.length > 5 ? `
      <div style="text-align:center;margin-bottom:16px">
        <button id="chi-tran-btn" onclick="toggleTable('chi-tran')"
          style="padding:7px 20px;background:var(--bg3);border:1px solid var(--border2);border-radius:8px;color:var(--muted2);font-size:12px;cursor:pointer">
          Xem thêm ${chiTran.length - 5} trận ▾
        </button>
      </div>` : ''}
      <!-- TỔNG & CÒN LẠI 
      <div class="card" style="margin-bottom:28px">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="font-weight:600;color:var(--muted2)">TỔNG SỐ TIỀN ĐÃ CHI</span>
          <span style="font-weight:700;font-size:16px;color:var(--red)">${vnd(chiTotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0">
          <span style="font-weight:600;color:var(--muted2)">SỐ TIỀN CÒN LẠI</span>
          <span style="font-weight:700;font-size:18px;color:${conLaiColor}">${vnd(conLai)}</span>
        </div>
      </div>
      -->
    </div>`;
}

// ═══════════════════════════════════════════════
//  PAGE 2 — LỊCH & KẾT QUẢ  (realtime fetch)
// ═══════════════════════════════════════════════
