function renderLichKQ(){
  const lq  = DB[currentYear].lichKQ;
  const el  = document.getElementById('page-lich-kq');
  const tran = lq.tran || [];
  const playerList = (lq.playerNames && lq.playerNames.length) ? lq.playerNames : PLAYERS;

  if (!tran.length) {
    el.innerHTML=`<div class="empty"><div class="big">📅</div>Dữ liệu năm ${currentYear} chưa được nhập.</div>`;
    return;
  }

  // Parse ngày "04 Jan 26" → Date
  const MONTHS = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  function parseNgay(str) {
    if (!str) return null;
    const p = str.trim().split(' ');
    if (p.length < 3) return null;
    return new Date(2000+parseInt(p[2]), MONTHS[p[1]], parseInt(p[0]));
  }

  const today = new Date(); today.setHours(0,0,0,0);

  // 2 nhóm: sắp tới (tương lai) và kết quả (quá khứ/hôm nay)
  const upcoming = tran.filter(t => { const d=parseNgay(t.ngay); return d && d > today && t.gio; });
  const results  = tran.filter(t => { const d=parseNgay(t.ngay); return d && d <= today; });

  upcoming.sort((a,b) => (parseNgay(a.ngay)||0)-(parseNgay(b.ngay)||0)); // gần nhất lên đầu
  results.sort((a,b)  => (parseNgay(b.ngay)||0)-(parseNgay(a.ngay)||0)); // mới nhất lên đầu

  // Thống kê chỉ tính trận có tỉ số
  const played   = results.filter(t => t.ta !== null && t.dich !== null);
  const thang    = played.filter(t => t.kq==='W').length;
  const hoa      = played.filter(t => t.kq==='D').length;
  const thua     = played.filter(t => t.kq==='L').length;
  const tongTran = played.length;
  const banThang = played.reduce((s,t)=>s+(t.ta||0),0);
  const banThua  = played.reduce((s,t)=>s+(t.dich||0),0);
  const hieuSo   = banThang - banThua;
  const pctW = tongTran ? Math.round(thang/tongTran*100) : 0;
  const pctD = tongTran ? Math.round(hoa/tongTran*100)   : 0;
  const pctL = 100 - pctW - pctD;

  // Top ghi bàn
  const scoreMap = {};
  played.forEach(t => playerList.forEach(p => {
    if (typeof t.players[p]==='number' && t.players[p]>0)
      scoreMap[p] = (scoreMap[p]||0) + t.players[p];
  }));
  const topScorers = Object.entries(scoreMap).sort((a,b)=>b[1]-a[1]).slice(0,10);

  // Top chuyên cần — đếm số trận có mặt (players[p] !== 'N' && !== null)
  const attendMap = {};
  played.forEach(t => playerList.forEach(p => {
    if (t.players[p] !== 'N' && t.players[p] !== null && t.players[p] !== undefined)
      attendMap[p] = (attendMap[p]||0) + 1;
  }));
  const topAttend = Object.entries(attendMap).sort((a,b)=>b[1]-a[1]).slice(0,10);

  // Card sắp tới — chỉ hiển thị nếu có giờ cụ thể
  function upcomingCard(t) {
    return `
      <div class="match-card upcoming">
        <div class="mc-head">
          <span class="mc-num">${t.id}</span>
          <div class="mc-info">
            <div class="mc-venue">
              <div class="mc-venue-row">
                <span class="mc-gio">${t.gio ? '⏰ '+t.gio : '—'}</span>
                <span class="mc-venue-san">🏟️ ${t.san}</span>
                <span class="mc-score-line" style="color:var(--muted2)">${t.doiThu ? 'vs '+t.doiThu : ''}</span>
              </div>
              <div class="mc-date">📅 ${t.ngay}</div>
            </div>
          </div>
          <div class="mc-right"><span class="badge badge-up">📆 Sắp diễn ra</span></div>
        </div>
      </div>`;
  }

  // Card kết quả — có tỉ số hoặc "Đang cập nhật"
  function resultCard(t) {
    const hasScore = t.ta !== null && t.dich !== null;

    if (!hasScore) return `
      <div class="match-card upcoming">
        <div class="mc-head">
          <span class="mc-num">${t.id}</span>
          <div class="mc-info">
            <div class="mc-venue">
              <div class="mc-venue-row">
                <span class="mc-gio">${t.gio ? '⏰ '+t.gio : '—'}</span>
                <span class="mc-venue-san">🏟️ ${t.san}</span>
                <span class="mc-score-line" style="color:var(--muted2)">${t.doiThu ? 'vs '+t.doiThu : ''}</span>
              </div>
              <div class="mc-date">📅 ${t.ngay}</div>
            </div>
          </div>
          <div class="mc-right"><span class="badge" style="background:rgba(255,215,64,.12);color:var(--yellow)">⏳ Đang cập nhật</span></div>
        </div>
      </div>`;

    const players     = t.players || {};
    const regularList = playerList.filter(p => p !== 'Khác');
    const presentList = regularList.filter(p => players[p] !== 'N' && players[p] !== null);
    const absentList  = regularList.filter(p => players[p] === 'N');
    const scorers     = regularList.filter(p => typeof players[p]==='number' && players[p]>0)
                          .sort((a,b) => players[b] - players[a]);
    const khacGoals   = typeof players['Khác']==='number' && players['Khác']>0 ? players['Khác'] : 0;
    const hasRoster   = presentList.length > 0;
    const taWin = t.ta > t.dich, dichWin = t.dich > t.ta;

    return `
      <div class="match-card ${kqCls(t.kq)}">
        <div class="mc-head" onclick="toggleMatch(${t.id})">
          <span class="mc-num">${t.id}</span>
          <div class="mc-info">
            <div class="mc-venue">
              <div class="mc-venue-row">
                <span class="mc-gio">${t.gio ? '⏰ '+t.gio : '—'}</span>
                <span class="mc-venue-san">🏟️ ${t.san}</span>
                <span class="mc-score-line">
                  <span class="mc-team-home">DIMO FC</span>
                  <span class="mc-score-ta ${taWin?'score-w':dichWin?'score-l':'score-d'}">${t.ta}</span>
                  <span class="mc-score-dash">-</span>
                  <span class="mc-score-dich ${dichWin?'score-w':taWin?'score-l':'score-d'}">${t.dich}</span>
                  <span class="mc-team-away">${t.doiThu||'Đối thủ'}</span>
                </span>
              </div>
              <div class="mc-date">📅 ${t.ngay}${t.nguoi>0?' · 👥 '+t.nguoi+' người':''}</div>
            </div>
          </div>
          <div class="mc-right">
            ${kqBadge(t.kq)}
            <span class="mc-chevron" id="mc-${t.id}">▾</span>
          </div>
        </div>
        <div class="mc-detail" id="md-${t.id}">
          ${!hasRoster ? `<div style="padding:12px 0;color:var(--yellow);font-size:13px">⏳ Đang cập nhật thông tin đội hình & ghi bàn...</div>` : `
            <div style="display:flex;gap:20px;flex-wrap:wrap;padding:6px 0 2px">
              <span style="font-size:12px;color:var(--muted2)">👥 <strong style="color:var(--text)">${presentList.length}</strong> có mặt</span>
              ${(scorers.length||khacGoals)?`<span style="font-size:12px;color:var(--muted2)">⚽ <strong style="color:var(--yellow)">${scorers.reduce((s,p)=>s+(players[p]||0),0)+khacGoals}</strong> bàn ghi nhận</span>`:''}
            </div>
            ${(scorers.length||khacGoals)?`
            <div class="roster-section">
              <div class="roster-label">⚽ Ghi bàn</div>
              <div class="roster-grid">
                ${scorers.map(p=>`<div class="player-chip chip-scorer">${p} (${players[p]})</div>`).join('')}
                ${khacGoals?`<div class="player-chip" style="background:rgba(136,153,170,.1);border-color:rgba(136,153,170,.25);color:var(--muted2)">Người ngoài (${khacGoals})</div>`:''}
              </div>
            </div>`:''}
            <div class="roster-section">
              <div class="roster-label">✅ Có mặt (${presentList.length})</div>
              <div class="roster-grid">${presentList.map(p=>`<div class="player-chip chip-present">${p}</div>`).join('')}</div>
            </div>
            ${absentList.length?`
            <div class="roster-section">
              <div class="roster-label">❌ Vắng mặt (${absentList.length})</div>
              <div class="roster-grid">${absentList.map(p=>`<div class="player-chip chip-absent">${p}</div>`).join('')}</div>
            </div>`:''}
          `}
        </div>
      </div>`;
  }

  el.innerHTML = `
    <div class="stats-row">
      <div class="stat-card fade-in d1" data-glow="🏆"><div class="stat-label">Tổng Trận</div><div class="stat-val w">${tongTran}</div><div class="stat-sub">Mùa ${currentYear}</div></div>
      <div class="stat-card fade-in d2" data-glow="✅"><div class="stat-label">Thắng</div><div class="stat-val g">${thang}</div><div class="stat-sub">${pctW}%</div></div>
      <div class="stat-card fade-in d3" data-glow="🤝"><div class="stat-label">Hòa</div><div class="stat-val y">${hoa}</div><div class="stat-sub">${pctD}%</div></div>
      <div class="stat-card fade-in d4" data-glow="❌"><div class="stat-label">Thua</div><div class="stat-val r">${thua}</div><div class="stat-sub">${pctL}%</div></div>
      <div class="stat-card fade-in d5" data-glow="⚽"><div class="stat-label">Bàn Thắng</div><div class="stat-val g">${banThang}</div><div class="stat-sub">${tongTran?(banThang/tongTran).toFixed(1):0} BT/trận</div></div>
      <div class="stat-card fade-in d6" data-glow="🥅"><div class="stat-label">Bàn Thua</div><div class="stat-val r">${banThua}</div><div class="stat-sub">Hiệu số ${hieuSo>=0?'+':''}${hieuSo}</div></div>
    </div>

    <div class="grid3">
      <div class="card">
        <div class="card-title">📊 KẾT QUẢ MÙA ${currentYear}</div>
        ${tongTran === 0 ? '<div style="color:var(--muted);font-size:13px">Chưa có dữ liệu</div>' : (() => {
          const r = 54, cx = 70, cy = 70, stroke = 16;
          const circ = 2 * Math.PI * r;
          const wPct = thang/tongTran, dPct = hoa/tongTran, lPct = thua/tongTran;
          const gap = 0.02;
          const wLen = Math.max(0, circ * wPct - gap*circ);
          const dLen = Math.max(0, circ * dPct - gap*circ);
          const lLen = Math.max(0, circ * lPct - gap*circ);
          const wOff = 0;
          const dOff = -(circ * wPct);
          const lOff = -(circ * (wPct + dPct));
          return `
          <div style="display:flex;align-items:center;gap:24px">
            <svg width="140" height="140" viewBox="0 0 140 140" style="flex-shrink:0">
              <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--bg3)" stroke-width="${stroke}"/>
              <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
                stroke="#00e676" stroke-width="${stroke}" stroke-linecap="round"
                stroke-dasharray="${wLen} ${circ}" stroke-dashoffset="${wOff}"
                transform="rotate(-90 ${cx} ${cy})"/>
              <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
                stroke="#ffd740" stroke-width="${stroke}" stroke-linecap="round"
                stroke-dasharray="${dLen} ${circ}" stroke-dashoffset="${dOff}"
                transform="rotate(-90 ${cx} ${cy})"/>
              <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
                stroke="#ff3d57" stroke-width="${stroke}" stroke-linecap="round"
                stroke-dasharray="${lLen} ${circ}" stroke-dashoffset="${lOff}"
                transform="rotate(-90 ${cx} ${cy})"/>
              <text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="var(--text)"
                style="font-family:'Tahoma',Geneva,sans-serif;font-size:22px;letter-spacing:1px">${pctW}%</text>
              <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="var(--muted2)"
                style="font-size:10px;font-family:'Tahoma',Geneva,sans-serif">Thắng</text>
              <text x="${cx}" y="${cy + 24}" text-anchor="middle" fill="var(--muted)"
                style="font-size:9px;font-family:'Tahoma',Geneva,sans-serif">${tongTran} trận</text>
            </svg>
            <div style="display:flex;flex-direction:column;gap:12px;flex:1">
              <div style="display:flex;align-items:center;gap:10px">
                <div style="width:10px;height:10px;border-radius:50%;background:var(--green);flex-shrink:0"></div>
                <div style="flex:1;font-size:13px;font-weight:500">Thắng</div>
                <div style="font-family:'Tahoma',Geneva,sans-serif;font-size:20px;color:var(--green)">${thang}</div>
                <div style="font-size:11px;color:var(--muted);width:36px;text-align:right">${pctW}%</div>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <div style="width:10px;height:10px;border-radius:50%;background:var(--yellow);flex-shrink:0"></div>
                <div style="flex:1;font-size:13px;font-weight:500">Hòa</div>
                <div style="font-family:'Tahoma',Geneva,sans-serif;font-size:20px;color:var(--yellow)">${hoa}</div>
                <div style="font-size:11px;color:var(--muted);width:36px;text-align:right">${pctD}%</div>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <div style="width:10px;height:10px;border-radius:50%;background:var(--red);flex-shrink:0"></div>
                <div style="flex:1;font-size:13px;font-weight:500">Thua</div>
                <div style="font-family:'Tahoma',Geneva,sans-serif;font-size:20px;color:var(--red)">${thua}</div>
                <div style="font-size:11px;color:var(--muted);width:36px;text-align:right">${pctL}%</div>
              </div>
            </div>
          </div>`;
        })()}
      </div>

      <div class="card">
        <div class="card-title">🏃 TOP CHUYÊN CẦN MÙA ${currentYear}</div>
        ${topAttend.length ? topAttend.map(([name, tran], i) => `
          <div class="prow">
            <div class="prow-name">${i+1}. ${name}</div>
            <div class="prow-bar-bg"><div class="prow-bar-fill g" style="width:${tran/topAttend[0][1]*100}%"></div></div>
            <div class="prow-val" style="color:var(--blue)">${tran}/${tongTran} trận</div>
          </div>`).join('')
        : '<div style="color:var(--muted);font-size:13px">Chưa có dữ liệu</div>'}
      </div>

      <div class="card">
        <div class="card-title">🏅 TOP GHI BÀN MÙA ${currentYear}</div>
        ${topScorers.length ? topScorers.map(([name,goals],i)=>`
          <div class="prow">
            <div class="prow-name">${i+1}. ${name}</div>
            <div class="prow-bar-bg"><div class="prow-bar-fill g" style="width:${goals/topScorers[0][1]*100}%"></div></div>
            <div class="prow-val pos">${goals} bàn</div>
          </div>`).join('') : '<div style="color:var(--muted);font-size:13px">Chưa có dữ liệu</div>'}
      </div>
    </div>

    <div class="sec-title">LỊCH THI ĐẤU SẮP TỚI</div>
    <div class="matches-list">
      ${upcoming.length
        ? upcoming.map(upcomingCard).join('')
        : `<div style="color:var(--muted);font-size:13px;padding:16px 4px">Đang chờ book lịch</div>`}
    </div>

    <div class="sec-title">KẾT QUẢ THI ĐẤU — Mới nhất</div>
    <div class="matches-list">
      ${results.map((t, idx) => {
        const card = resultCard(t);
        // Wrap cards after index 4 in a hidden div
        if (idx >= 5) {
          return card.replace('<div class="match-card', '<div class="match-card ket-qua-extra" style="display:none" data-extra="1"').replace('<div class="match-card ', '<div class="match-card ');
        }
        return card;
      }).join('')}
    </div>
    ${results.length > 5 ? `
    <div style="text-align:center;margin-bottom:28px">
      <button id="ket-qua-btn" onclick="toggleKetQua()"
        style="padding:7px 20px;background:var(--bg3);border:1px solid var(--border2);border-radius:8px;color:var(--muted2);font-size:12px;cursor:pointer">
        Xem thêm ${results.length - 5} trận ▾
      </button>
    </div>` : ''}`;
}

// ═══════════════════════════════════════════════
//  PAGE 3 — CHI TIẾT ĐÓNG QUỸ (realtime)
// ═══════════════════════════════════════════════