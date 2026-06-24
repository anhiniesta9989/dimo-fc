function toggleTable(id) {
  const extras  = document.querySelectorAll(`.${id}-extra`);
  const btn     = document.getElementById(`${id}-btn`);
  const isHidden = extras.length && extras[0].style.display === 'none';
  extras.forEach(r => r.style.display = isHidden ? '' : 'none');
  if (btn) btn.innerHTML = isHidden
    ? 'Rút gọn ▴'
    : btn.innerHTML.replace('Rút gọn ▴', btn.innerHTML); // restore original text handled below
  // Restore original text on collapse
  if (!isHidden && btn) {
    const count = extras.length;
    const label = id === 'quy-doi' ? `người` : `trận`;
    btn.innerHTML = `Xem thêm ${count} ${label} ▾`;
  }
}

function toggleKetQua() {
  const extras = document.querySelectorAll('[data-extra="1"]');
  const btn    = document.getElementById('ket-qua-btn');
  const isHidden = extras.length && extras[0].style.display === 'none';
  extras.forEach(el => el.style.display = isHidden ? '' : 'none');
  if (btn) btn.textContent = isHidden
    ? 'Rút gọn ▴'
    : `Xem thêm ${extras.length} trận ▾`;
}

function toggleChiTran(){
  const wrap    = document.getElementById('chi-tran-wrap');
  const chevron = document.getElementById('chi-tran-chevron');
  const isOpen  = wrap.style.display !== 'none';
  wrap.style.display    = isOpen ? 'none' : 'block';
  chevron.textContent   = isOpen ? '▾' : '▴';
}

// ─── YEAR TABS ─────────────────────────────────
function initYearTabs(){
  document.getElementById('yearTabs').innerHTML = YEARS.map(y =>
    `<button class="year-btn ${y===currentYear?'active':''}" onclick="switchYear(${y})">${y}</button>`
  ).join('');
}
function switchYear(y){ currentYear=y; initYearTabs(); renderAll(); }

// ─── PAGE SWITCH ───────────────────────────────
function setPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  else {
    // Activate matching nav button without reference
    document.querySelectorAll('.page-btn').forEach(b => {
      if (b.getAttribute('onclick') && b.getAttribute('onclick').includes("'" + id + "'")) {
        b.classList.add('active');
      }
    });
  }
  // Update URL hash
  history.replaceState(null, '', '#' + id);
}

// ─── HASH ROUTING ──────────────────────────────
function applyHash() {
  const hash = location.hash.replace('#', '') || 'lich-kq';
  const valid = ['lich-kq', 'thu-chi', 'dong-quy', 'thanh-vien'];
  setPage(valid.includes(hash) ? hash : 'lich-kq');
}
window.addEventListener('hashchange', applyHash);

// ─── MATCH TOGGLE ──────────────────────────────
function toggleMatch(id){
  const detail  = document.getElementById('md-'+id);
  const chevron = document.getElementById('mc-'+id);
  const isOpen  = detail.classList.contains('open');
  detail.classList.toggle('open', !isOpen);
  chevron && chevron.classList.toggle('open', !isOpen);
}

// ─── LOADING SPINNER ───────────────────────────
function showLoading(pageId) {
  document.getElementById('page-'+pageId).innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;gap:16px">
      <div style="width:36px;height:36px;border:3px solid var(--border);border-top-color:var(--green);border-radius:50%;animation:spin .8s linear infinite"></div>
      <div style="font-size:13px;color:var(--muted2)">Đang tải dữ liệu...</div>
    </div>`;
}
function showError(pageId, msg) {
  document.getElementById('page-'+pageId).innerHTML = `
    <div style="background:rgba(255,61,87,.08);border:1px solid rgba(255,61,87,.2);border-radius:12px;padding:24px;text-align:center;color:var(--red);margin-top:20px">
      ⚠️ Không tải được dữ liệu.<br>
      <small style="color:var(--muted2)">${msg}</small><br><br>
      <small style="color:var(--muted2)">Đảm bảo file được chạy qua Live Server (không phải mở trực tiếp file://)</small><br><br>
      <button onclick="renderAll()" style="padding:8px 20px;background:var(--green);color:#000;border:none;border-radius:8px;cursor:pointer;font-weight:600;margin-top:4px">Thử lại</button>
    </div>`;
}

// ─── RENDER ALL ────────────────────────────────
async function renderAll() {
  showLoading('lich-kq');
  showLoading('thu-chi');
  showLoading('dong-quy');
  showLoading('thanh-vien');
  showLoading('thanh-vien');

  const sheetLQ = `${currentYear} - LỊCH & KẾT QUẢ`;
  const sheetTC = `${currentYear} - THU & CHI`;
  const sheetCT = `${currentYear} - Chi tiết đóng quỹ`;
  const sheetTV = 'Thành Viên';
  try {
    const [csvLQ, csvTC, csvCT, csvTV] = await Promise.all([
      fetchCSV(sheetLQ),
      fetchCSV(sheetTC),
      fetchCSV(sheetCT),
      fetchCSV(sheetTV),
    ]);
    DB[currentYear].lichKQ    = parseLichKQ(csvLQ);
    DB[currentYear].thuChi2   = parseThuChi(csvTC);
    DB[currentYear].chiTiet   = parseChiTiet(csvCT);
    if (csvTV) DB.thanhVien = parseThanhVien(csvTV);
    DB[currentYear].thanhVien = parseThanhVien(csvTV);
    renderThuChi();
    renderLichKQ();
    renderDongQuy();
    renderThanhVien();
    renderThanhVien();
  } catch(e) {
    showError('lich-kq', e.message);
    showError('thu-chi', e.message);
    showError('dong-quy', e.message);
    showError('thanh-vien', e.message);
    showError('thanh-vien', e.message);
  }
}

// ═══════════════════════════════════════════════
//  PAGE 1 — THU & CHI  (realtime)
// ═══════════════════════════════════════════════
