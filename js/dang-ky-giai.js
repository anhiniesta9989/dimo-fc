// ═══════════════════════════════════════════════
//  ĐĂNG KÝ ĐÁ GIẢI — popup + export PDF
// ═══════════════════════════════════════════════

const CLUB_INFO = {
  ten:     'DIMO FC',
  daiDien: 'Phan Đăng Dương',
  sdt:     '0983228368',
  logoUrl: 'https://raw.githubusercontent.com/anhiniesta9989/dimo-fc/main/logo-dimo-fc.jpg',
};

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D');
}

function openDangKy() {
  const members = (DB.thanhVien || []).filter(m => !m.status.toLowerCase().includes('nghỉ'));
  if (!members.length) { alert('Chưa có dữ liệu thành viên.'); return; }

  const list = document.getElementById('playerCheckList');
  list.innerHTML = members.map(m => `
    <label class="player-check-item">
      <input type="checkbox" data-member='${JSON.stringify({
        ho: m.ho, ten: m.ten, soAo: m.soAo, ngaySinh: m.ngaySinh
      }).replace(/'/g,"&#39;")}' checked>
      <span>${m.soAo ? `<strong>#${m.soAo}</strong> ` : ''}${m.ten}</span>
    </label>`).join('');

  document.getElementById('tenGiai').value = '';
  document.getElementById('tenGiai').style.borderColor = '';
  document.getElementById('modalDangKy').classList.add('open');
}

function closeDangKy() {
  document.getElementById('modalDangKy').classList.remove('open');
}

function chonTatCa(checked) {
  document.querySelectorAll('#playerCheckList input[type="checkbox"]')
    .forEach(cb => cb.checked = checked);
}

document.getElementById('modalDangKy').addEventListener('click', function(e) {
  if (e.target === this) closeDangKy();
});

// ─── LOAD IMAGE → base64 ────────────────────────
function loadImage(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
  });
}

function loadAvatar(soAo, ten) {
  if (!soAo) return Promise.resolve(null);
  const base = `https://raw.githubusercontent.com/anhiniesta9989/dimo-fc/main/avatars/${soAo}_${removeAccents(ten.replace(/\s+/g,''))}`;
  return new Promise(resolve => {
    const tryExt = (exts) => {
      if (!exts.length) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload  = () => resolve(img);
      img.onerror = () => tryExt(exts.slice(1));
      img.src = `${base}.${exts[0]}?t=${Date.now()}`;
    };
    tryExt(['jpg', 'png']);
  });
}

// ─── EXPORT ──────────────────────────────────────
async function exportPDF() {
  const tenGiai = document.getElementById('tenGiai').value.trim();
  if (!tenGiai) {
    document.getElementById('tenGiai').focus();
    document.getElementById('tenGiai').style.borderColor = '#ff3d57';
    return;
  }
  const checked = [...document.querySelectorAll('#playerCheckList input:checked')];
  if (!checked.length) { alert('Vui lòng chọn ít nhất 1 cầu thủ.'); return; }

  const btn = document.querySelector('.btn-export');
  btn.textContent = '⏳ Đang tạo PDF...';
  btn.disabled = true;

  try {
    const players = checked.map(cb => JSON.parse(cb.getAttribute('data-member').replace(/&#39;/g, "'")));

    // Preload tất cả ảnh song song — thử jpg rồi png
    const logoImg    = await loadImage(CLUB_INFO.logoUrl);
    const avatarImgs = await Promise.all(
      players.map(p => loadAvatar(p.soAo, p.ten))
    );

    await buildPDF(tenGiai, players, logoImg, avatarImgs);
    closeDangKy();
  } finally {
    btn.textContent = '📄 Đăng ký & Xuất PDF';
    btn.disabled = false;
  }
}

// ─── BUILD PDF VIA HTML CANVAS ────────────────────
async function buildPDF(tenGiai, players, logoImg, avatarImgs) {
  const { jsPDF } = window.jspdf;

  // ── Tạo canvas tổng để render toàn bộ trang A4 ──
  const DPI   = 2;          // scale factor (2x = sharper)
  const A4W   = 794 * DPI;  // ~210mm at 96dpi scaled
  const A4H   = 1123 * DPI;
  const M     = 32 * DPI;   // margin

  const canvas  = document.createElement('canvas');
  canvas.width  = A4W;
  canvas.height = A4H;
  const ctx = canvas.getContext('2d');
  ctx.scale(DPI, DPI);

  const W = A4W / DPI;
  const H = A4H / DPI;
  let y = M / DPI;

  // Background trắng
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // ── HEADER ──
  // Logo
  if (logoImg) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(M/DPI, y, 50, 50, 6);
    ctx.clip();
    ctx.drawImage(logoImg, M/DPI, y, 50, 50);
    ctx.restore();
  }

  // Tên đội
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 26px Tahoma, sans-serif';
  ctx.fillText('DIMO FC', M/DPI + 58, y + 20);
  ctx.fillStyle = '#888888';
  ctx.font = '12px Tahoma, sans-serif';
  ctx.fillText('Thành lập năm 2012', M/DPI + 58, y + 38);
  y += 58;

  // Đường kẻ cam
  ctx.strokeStyle = '#e67820';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(M/DPI, y); ctx.lineTo(W - M/DPI, y); ctx.stroke();
  y += 22;

  // ── Tên giải ──
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 16px Tahoma, sans-serif';
  ctx.fillText(`Đăng ký tham gia giải ${tenGiai}`, M/DPI, y);
  y += 10;

  ctx.fillStyle = '#555555';
  ctx.font = '12px Tahoma, sans-serif';
  ctx.fillText(`Người đại diện: ${CLUB_INFO.daiDien}`, M/DPI, y + 10);
  ctx.fillText(`SĐT: ${CLUB_INFO.sdt}`, M/DPI + 220, y + 10);
  ctx.fillText(`Số cầu thủ đăng ký: ${players.length} người`, M/DPI, y + 24);
  y += 36;

  // Đường kẻ nhạt
  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(M/DPI, y); ctx.lineTo(W - M/DPI, y); ctx.stroke();
  y += 22;

  // ── TIÊU ĐỀ DANH SÁCH ──
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 13px Tahoma, sans-serif';
  ctx.fillText('DANH SÁCH CẦU THỦ THAM GIA', M/DPI, y);
  y += 10;

  // ── CARDS CẦU THỦ ──
  const cols   = 5;
  const gap    = 10;
  const cardW  = (W - 2*(M/DPI) - (cols-1)*gap) / cols;
  const pad    = 8;                          // padding trong card
  const avatarS = cardW - pad * 2;           // 90% width (pad cả 2 bên)
  const nameH  = 14;                         // chiều cao dòng tên
  const snH    = 13;                         // chiều cao dòng năm sinh
  const cardH  = pad + avatarS + 6 + nameH + 4 + snH + pad; // tổng chiều cao

  for (let i = 0; i < players.length; i++) {
    const p   = players[i];
    const img = avatarImgs[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx  = M/DPI + col * (cardW + gap);
    const cy  = y + row * (cardH + gap);

    // Card background
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.roundRect(cx, cy, cardW, cardH, 8);
    ctx.fill();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Avatar — pad từ lề trái/phải, bắt đầu từ top + pad
    const ax = cx + pad;
    const ay = cy + pad;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(ax, ay, avatarS, avatarS, 6);
    ctx.clip();
    if (img) {
      // Cover: crop ảnh để fill đầy khung vuông, không bị méo
      const iw = img.naturalWidth  || img.width;
      const ih = img.naturalHeight || img.height;
      const scale = Math.max(avatarS / iw, avatarS / ih);
      const sw = avatarS / scale;
      const sh = avatarS / scale;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) * 0.15; // crop từ trên, giữ khuôn mặt
      ctx.drawImage(img, sx, sy, sw, sh, ax, ay, avatarS, avatarS);
    } else {
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(ax, ay, avatarS, avatarS);
      ctx.fillStyle = '#00e676';
      ctx.font = `bold ${Math.round(avatarS*0.35)}px Tahoma, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const init = ((p.ho.trim().split(' ').pop()[0]||'') + (p.ten[0]||'')).toUpperCase();
      ctx.fillText(init, ax + avatarS/2, ay + avatarS/2);
    }
    ctx.restore();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // Họ và tên — dưới avatar 6px
    const textY = ay + avatarS + 6 + nameH;
    ctx.fillStyle = '#111111';
    ctx.font = `bold 11px Tahoma, sans-serif`;
    // Truncate nếu quá dài
    let fullName = `${p.ho} ${p.ten}`;
    if (ctx.measureText(fullName).width > cardW - 4) fullName = p.ten;
    ctx.fillText(fullName, cx + cardW/2, textY);

    // Sinh năm — dưới tên 4px
    if (p.ngaySinh) {
      ctx.fillStyle = '#888888';
      ctx.font = `10px Tahoma, sans-serif`;
      const nam = p.ngaySinh.split(' ').pop();
      ctx.fillText(`SN: ${nam}`, cx + cardW/2, textY + 4 + snH);
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  const totalRows = Math.ceil(players.length / cols);
  y += totalRows * (cardH + gap) + 10;

  // ── FOOTER ──
  ctx.strokeStyle = '#eeeeee';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(M/DPI, y); ctx.lineTo(W - M/DPI, y); ctx.stroke();
  y += 10;
  ctx.fillStyle = '#aaaaaa';
  ctx.font = 'italic 10px Tahoma, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`DIMO FC · ${tenGiai} · ${new Date().toLocaleDateString('vi-VN')}`, W/2, y);
  ctx.textAlign = 'left';

  // ── Convert canvas → PDF ──
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);

  const fileName = `DIMOFC_${removeAccents(tenGiai.replace(/\s+/g,'_'))}.pdf`;
  doc.save(fileName);
}