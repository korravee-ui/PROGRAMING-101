// export-excel.js — Export & Import customer data via Excel
// Requires SheetJS (xlsx.full.min.js) loaded before this script
(function () {
  const _KEY = 'crm_customers';
  function _db() { try { return JSON.parse(localStorage.getItem(_KEY)) || []; } catch { return []; } }
  function _setDB(arr) {
    try { localStorage.setItem(_KEY, JSON.stringify(arr)); return true; }
    catch { return false; }
  }
  function _toast(msg) {
    if (typeof showToast === 'function') showToast(msg);
    else if (typeof toast === 'function') toast(msg);
  }
  function _n(v) { const n = Number(v); return (v !== '' && v != null && !isNaN(n)) ? n : ''; }
  function _today() { return new Date().toISOString().split('T')[0]; }

  // ── Column definitions: [header, export-fn, import-setter] ──
  // import-setter: null = skip on import
  const COLS = [
    ['ID',                         c => c.id,                          null],
    ['ชื่อ-นามสกุล',              c => c.name,                        (c,v) => c.name = v],
    ['บริษัท/องค์กร',              c => c.company,                     (c,v) => c.company = v],
    ['เบอร์โทรศัพท์',             c => c.phone,                       (c,v) => c.phone = v],
    ['อีเมล',                      c => c.email,                       (c,v) => c.email = v],
    ['Line ID',                    c => c.lineId,                      (c,v) => c.lineId = v],
    ['แหล่งที่มา',                 c => c.source,                      (c,v) => c.source = v],
    ['ที่อยู่',                     c => c.address,                     (c,v) => c.address = v],
    ['หมายเหตุลูกค้า',             c => c.customerNote,                (c,v) => c.customerNote = v],
    ['ชื่อโครงการ',                c => c.projectName,                 (c,v) => c.projectName = v],
    ['ที่ตั้งโครงการ',              c => c.projectLocation,             (c,v) => c.projectLocation = v],
    ['Google Maps Link',           c => c.googleMapLink,               (c,v) => c.googleMapLink = v],
    ['วันที่เริ่มต้น',              c => c.startDate,                   (c,v) => c.startDate = v],
    ['Follow-up Date',             c => c.followUpDate,                (c,v) => c.followUpDate = v],
    ['Project Status',             c => c.status,                      (c,v) => c.status = v],
    ['Product Type',               c => c.productType,                 (c,v) => c.productType = v],
    ['ขนาดที่ดิน (ตร.วา)',         c => _n(c.landArea),               (c,v) => c.landArea = v],
    ['GFA พื้นที่ใช้สอย (ตร.ม.)', c => _n(c.area),                   (c,v) => c.area = v],
    ['งบประมาณ (บาท)',             c => _n(c.budget),                  (c,v) => c.budget = v],
    ['บาท/ตร.ม. (งบ)',             c => _n(c.budgetPerSqm),            (c,v) => c.budgetPerSqm = v],
    ['ราคานำเสนอ Pitch (บาท)',    c => _n(c.pitchPrice),              (c,v) => c.pitchPrice = v],
    ['บาท/ตร.ม. (Pitch)',          c => _n(c.pitchPricePerSqm),        (c,v) => c.pitchPricePerSqm = v],
    ['ความต้องการพิเศษ',           c => c.requirements,                (c,v) => c.requirements = v],
    ['จำนวนชั้น (House)',          c => _n(c.hFloors),                 (c,v) => c.hFloors = v],
    ['ห้องนอน',                    c => _n(c.hBedrooms),               (c,v) => c.hBedrooms = v],
    ['ห้องน้ำ',                    c => _n(c.hBathrooms),              (c,v) => c.hBathrooms = v],
    ['ที่จอดรถ',                   c => _n(c.hParking),                (c,v) => c.hParking = v],
    ['Extra (House)',               c => c.hExtra,                      (c,v) => c.hExtra = v],
    ['จำนวนชั้น (Building)',       c => _n(c.bFloors),                 (c,v) => c.bFloors = v],
    ['จำนวนยูนิต',                 c => _n(c.bUnits),                  (c,v) => c.bUnits = v],
    ['Lift',                       c => _n(c.bLifts),                  (c,v) => c.bLifts = v],
    ['Air',                        c => c.bAir,                        (c,v) => c.bAir = v],
    ['Furniture',                  c => c.bFurniture,                  (c,v) => c.bFurniture = v],
    ['น้ำอุ่น',                    c => c.bWaterHeater,                (c,v) => c.bWaterHeater = v],
    ['Extra (Building)',            c => c.bExtra,                      (c,v) => c.bExtra = v],
    ['Architect 1',                c => c.responsible?.arch1,          (c,v) => { c.responsible=c.responsible||{}; c.responsible.arch1=v; }],
    ['สถานะออกแบบ A1',            c => c.responsible?.arch1Status,    (c,v) => { c.responsible=c.responsible||{}; c.responsible.arch1Status=v; }],
    ['BD',                         c => c.responsible?.bd,             (c,v) => { c.responsible=c.responsible||{}; c.responsible.bd=v; }],
    ['สถานะงาน BD',               c => c.responsible?.bdStatus,       (c,v) => { c.responsible=c.responsible||{}; c.responsible.bdStatus=v; }],
    ['Construction',               c => c.responsible?.construct,      (c,v) => { c.responsible=c.responsible||{}; c.responsible.construct=v; }],
    ['Sales',                      c => c.responsible?.sales,          (c,v) => { c.responsible=c.responsible||{}; c.responsible.sales=v; }],
    ['Pitch Deck (จำนวนไฟล์)',    c => (c.pitchFiles||[]).length||'',  null],
    ['ไฟล์แนบ (จำนวน)',           c => (c.attachments||[]).length||'', null],
    ['วันที่สร้าง',                 c => c.createdAt,                   null],
    ['อัปเดตล่าสุด',               c => c.updatedAt,                   null],
  ];

  // ── EXPORT ──
  window.exportCustomersExcel = function () {
    if (typeof XLSX === 'undefined') { _toast('กำลังโหลด Library... กรุณาลองอีกครั้ง'); return; }
    const data = _db();
    if (!data.length) { _toast('ไม่มีข้อมูลลูกค้า'); return; }

    const headers = COLS.map(([h]) => h);
    const rows    = data.map(c => COLS.map(([, fn]) => { const v = fn(c); return v != null ? v : ''; }));

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols']   = COLS.map(([h]) => ({ wch: Math.max(h.length + 4, 18) }));
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'IHC CRM');

    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    XLSX.writeFile(wb, `IHC_CRM_Export_${stamp}.xlsx`);
    _toast(`Export เรียบร้อย · ${data.length} รายการ`);
  };

  // ── IMPORT ──

  // Build header→setter map from COLS
  const _setterMap = {};
  COLS.forEach(([h,, setter]) => { if (setter) _setterMap[h] = setter; });

  function _parseFile(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const wb   = XLSX.read(new Uint8Array(e.target.result), { type: 'array', raw: false });
          const ws   = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
          res(rows);
        } catch (err) { rej(err); }
      };
      reader.onerror = rej;
      reader.readAsArrayBuffer(file);
    });
  }

  window.importCustomersExcel = async function (file) {
    if (!file) return;
    if (typeof XLSX === 'undefined') { _toast('กำลังโหลด Library...'); return; }

    let rows;
    try { rows = await _parseFile(file); }
    catch (err) { _toast('อ่านไฟล์ไม่สำเร็จ: ' + err.message); return; }

    if (rows.length < 2) { _toast('ไม่พบข้อมูลในไฟล์'); return; }

    const headers = rows[0].map(h => String(h).trim());
    const idIdx   = headers.indexOf('ID');
    const nameIdx = headers.indexOf('ชื่อ-นามสกุล');

    if (nameIdx < 0) {
      _toast('ไฟล์ไม่ตรงรูปแบบ — ไม่พบคอลัมน์ "ชื่อ-นามสกุล"\nกรุณาใช้ไฟล์ที่ Export จากระบบ');
      return;
    }

    const existing    = _db();
    const existingMap = {};
    existing.forEach(c => { existingMap[c.id] = c; });

    const today   = _today();
    const updates = [], inserts = [];

    rows.slice(1).forEach(row => {
      if (row.every(v => v === '' || v == null)) return; // skip blank rows

      const id       = idIdx >= 0 ? String(row[idIdx] || '').trim() : '';
      const isUpdate = id && existingMap[id];

      // Clone existing record (preserves attachments/pitchFiles) or start fresh
      const cust = isUpdate
        ? JSON.parse(JSON.stringify(existingMap[id]))
        : { attachments: [], pitchFiles: [], createdAt: today };

      // Apply all settable columns
      headers.forEach((h, i) => {
        const setter = _setterMap[h];
        if (!setter) return;
        const raw = row[i];
        setter(cust, raw != null ? String(raw).trim() : '');
      });

      cust.updatedAt = today;

      if (isUpdate) {
        cust.id = id;
        updates.push(cust);
      } else {
        inserts.push(cust); // ID assigned at confirm time
      }
    });

    _showImportModal(updates, inserts, existing);
  };

  function _showImportModal(updates, inserts, existing) {
    const old = document.getElementById('_impModal');
    if (old) old.remove();

    const total = updates.length + inserts.length;
    const previewRows = [
      ...updates.slice(0, 4).map(r =>
        `<tr><td style="font-family:monospace;font-size:11px;color:#6e6e73;padding:6px 12px">${r.id}</td>
         <td style="padding:6px 12px">${r.name || '—'}</td>
         <td style="padding:6px 12px;color:#6e6e73;font-size:12px">${r.status || '—'}</td>
         <td style="padding:6px 12px"><span style="font-size:10px;background:#e8f0fb;color:#0066cc;padding:2px 8px;border-radius:9999px;font-weight:600">UPDATE</span></td></tr>`),
      ...inserts.slice(0, 4).map(r =>
        `<tr><td style="font-family:monospace;font-size:11px;color:#6e6e73;padding:6px 12px">NEW</td>
         <td style="padding:6px 12px">${r.name || '—'}</td>
         <td style="padding:6px 12px;color:#6e6e73;font-size:12px">${r.status || '—'}</td>
         <td style="padding:6px 12px"><span style="font-size:10px;background:#edfaf1;color:#34c759;padding:2px 8px;border-radius:9999px;font-weight:600">ADD</span></td></tr>`),
    ].join('');

    const div = document.createElement('div');
    div.id = '_impModal';
    div.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem">
        <div style="background:#fff;border-radius:14px;width:min(600px,100%);max-height:92vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.25)">

          <!-- Header -->
          <div style="padding:1.1rem 1.35rem;border-bottom:1px solid #e8e8ed;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:16px;font-weight:600;letter-spacing:-.2px">นำเข้าข้อมูลจาก Excel</div>
              <div style="font-size:12px;color:#6e6e73;margin-top:.15rem">ตรวจสอบข้อมูลก่อนยืนยัน</div>
            </div>
            <button onclick="document.getElementById('_impModal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6e6e73;line-height:1;padding:2px">✕</button>
          </div>

          <!-- Body -->
          <div style="padding:1.25rem 1.35rem;overflow-y:auto;flex:1">

            <!-- Stat boxes -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.25rem">
              <div style="background:#e8f0fb;border-radius:10px;padding:1rem;text-align:center">
                <div style="font-size:32px;font-weight:700;color:#0066cc;line-height:1.1">${updates.length}</div>
                <div style="font-size:12px;color:#6e6e73;margin-top:.3rem">รายการ <strong>Update</strong></div>
                <div style="font-size:10px;color:#6e6e73">(ID ตรงกับในระบบ)</div>
              </div>
              <div style="background:#edfaf1;border-radius:10px;padding:1rem;text-align:center">
                <div style="font-size:32px;font-weight:700;color:#34c759;line-height:1.1">${inserts.length}</div>
                <div style="font-size:12px;color:#6e6e73;margin-top:.3rem">รายการ <strong>Add ใหม่</strong></div>
                <div style="font-size:10px;color:#6e6e73">(ไม่มี ID / ID ไม่ตรง)</div>
              </div>
            </div>

            ${total ? `
            <!-- Preview table -->
            <div style="font-size:11px;font-weight:600;color:#6e6e73;letter-spacing:.06em;text-transform:uppercase;margin-bottom:.5rem">
              ตัวอย่าง (${Math.min(8, total)} รายการแรก)
            </div>
            <div style="overflow-x:auto;border:1px solid #e8e8ed;border-radius:8px;margin-bottom:1rem">
              <table style="width:100%;border-collapse:collapse;font-size:13px">
                <thead>
                  <tr style="background:#f5f5f7">
                    <th style="padding:7px 12px;text-align:left;font-size:10px;font-weight:600;color:#6e6e73;white-space:nowrap">ID</th>
                    <th style="padding:7px 12px;text-align:left;font-size:10px;font-weight:600;color:#6e6e73">ชื่อ-นามสกุล</th>
                    <th style="padding:7px 12px;text-align:left;font-size:10px;font-weight:600;color:#6e6e73">Status</th>
                    <th style="padding:7px 12px;text-align:left;font-size:10px;font-weight:600;color:#6e6e73">Action</th>
                  </tr>
                </thead>
                <tbody style="border-top:1px solid #e8e8ed">${previewRows}</tbody>
              </table>
            </div>` : '<div style="text-align:center;color:#6e6e73;padding:2rem 0">ไม่พบข้อมูลในไฟล์</div>'}

            <!-- Note -->
            <div style="font-size:11px;color:#6e6e73;background:#f5f5f7;border-radius:8px;padding:.75rem 1rem;line-height:1.6">
              <strong>หมายเหตุ:</strong><br>
              • ไฟล์แนบ &amp; Pitch Deck ไม่ถูก Import — ข้อมูลไฟล์เดิมในระบบจะถูกเก็บไว้<br>
              • รายการ Update จะเขียนทับข้อมูลตัวอักษรทั้งหมด แต่ไม่แตะไฟล์<br>
              • รายการ Add จะได้รับ ID ใหม่โดยอัตโนมัติ
            </div>
          </div>

          <!-- Footer -->
          <div style="padding:.9rem 1.35rem;border-top:1px solid #e8e8ed;display:flex;gap:.5rem;justify-content:flex-end">
            <button onclick="document.getElementById('_impModal').remove()"
              style="padding:8px 22px;border:1px solid #d2d2d7;border-radius:9999px;background:#fff;font-size:13px;cursor:pointer;font-family:inherit">
              ยกเลิก
            </button>
            ${total ? `<button id="_impConfirmBtn"
              style="padding:8px 22px;border:none;border-radius:9999px;background:#0066cc;color:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit">
              ยืนยัน · นำเข้า ${total} รายการ
            </button>` : ''}
          </div>

        </div>
      </div>`;

    document.body.appendChild(div);

    const confirmBtn = document.getElementById('_impConfirmBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        _applyImport(updates, inserts, existing);
        div.remove();
      });
    }
  }

  function _applyImport(updates, inserts, existing) {
    const arr = [...existing];

    // Apply updates
    updates.forEach(u => {
      const idx = arr.findIndex(c => c.id === u.id);
      if (idx >= 0) arr[idx] = u;
    });

    // Assign IDs and append inserts
    const usedIds = new Set(arr.map(c => c.id));
    const year    = new Date().getFullYear();
    let   counter = arr.length + 1;
    inserts.forEach(c => {
      let newId;
      do { newId = `CRM-${year}-${String(counter++).padStart(4, '0')}`;} while (usedIds.has(newId));
      c.id = newId;
      usedIds.add(newId);
      arr.push(c);
    });

    if (!_setDB(arr)) {
      _toast('⚠ บันทึกไม่สำเร็จ: พื้นที่จัดเก็บเต็ม');
      return;
    }
    _toast(`✓ นำเข้าเรียบร้อย · Update ${updates.length} · Add ${inserts.length} รายการ`);
    setTimeout(() => location.reload(), 1200);
  }

})();
