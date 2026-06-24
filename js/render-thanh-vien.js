function renderThanhVien() {
  const el = document.getElementById('page-thanh-vien');
  const members = DB.thanhVien || [];
  if (!members.length) {
    el.innerHTML = '<div class="empty"><div class="big">👥</div>Chưa có dữ liệu thành viên.</div>';
    return;
  }
  const active = members.filter(m => !m.status.toLowerCase().includes('nghỉ'));
  const nghi   = members.filter(m =>  m.status.toLowerCase().includes('nghỉ'));
  function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D');
  }
  function memberCard(m) {
    const initials = ((m.ho.trim().split(' ').pop()[0]||'') + (m.ten[0]||'')).toUpperCase();
    const isNghi = m.status.toLowerCase().includes('nghỉ');
    const tenFile = removeAccents(m.ten.replace(/\s+/g,''));
    const avatarBase = m.soAo
      ? `https://raw.githubusercontent.com/anhiniesta9989/dimo-fc/main/avatars/${m.soAo}_${tenFile}`
      : null;
    // Thử jpg trước, nếu lỗi thử png
    const avatarUrl = avatarBase ? `${avatarBase}.jpg` : null;
    const avatarFallback = avatarBase ? `${avatarBase}.png` : null;
    return `<div class="member-card ${isNghi?'nghi':''}">
      <div class="member-avatar">
        ${avatarUrl
          ? `<img src="${avatarUrl}" alt="${m.ten}"
               onerror="if(this.dataset.tried){this.style.display='none';this.parentElement.setAttribute('data-initials','${initials}')}else{this.dataset.tried=1;this.src='${avatarFallback}'}">`
          : initials}
      </div>
      <div class="member-so-ao">${m.soAo||'—'}</div>
      <div style="line-height:1.4"><span class="member-ho">${m.ho} </span><span class="member-name">${m.ten}</span></div>
      <div style="margin:4px 0">${isNghi?'<span class="badge-nghi">Đã nghỉ</span>':'<span class="badge-active">Đang tham gia</span>'}</div>
      ${m.ngaySinh?`<div class="member-info-row">🎂 ${m.ngaySinh}</div>`:''}
    </div>`;
  }
  el.innerHTML = `
    <div class="stats-row">
      <div class="stat-card fade-in d1" data-glow="👥"><div class="stat-label">Tổng Thành Viên</div><div class="stat-val w">${members.length}</div><div class="stat-sub">Mùa ${currentYear}</div></div>
      <div class="stat-card fade-in d2" data-glow="✅"><div class="stat-label">Đang Tham Gia</div><div class="stat-val g">${active.length}</div><div class="stat-sub">Active</div></div>
      <div class="stat-card fade-in d3" data-glow="🚪"><div class="stat-label">Đã Nghỉ</div><div class="stat-val r">${nghi.length}</div><div class="stat-sub">Không còn tham gia</div></div>
    </div>
    <div class="sec-title">ĐANG THAM GIA (${active.length})</div>
    <div class="member-grid">${active.map(memberCard).join('')}</div>
    ${nghi.length?`<div class="sec-title">ĐÃ NGHỈ (${nghi.length})</div><div class="member-grid">${nghi.map(memberCard).join('')}</div>`:''}`;
}

// ─── BOOT ──────────────────────────────────────
initYearTabs();
renderAll().then(() => applyHash());
