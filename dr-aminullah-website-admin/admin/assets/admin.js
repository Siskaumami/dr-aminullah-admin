(function () {
  if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.replace('login.html');
    return;
  }

  const supa = window.supabaseClient;
  if (!supa) { 
    alert("FATAL ERROR: Supabase Client tidak ditemukan. Cek file supabase-config.js!");
    return; 
  }

  let currentBioId = null;

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function(e) {
      e.preventDefault();
      sessionStorage.removeItem('adminLoggedIn');
      window.location.replace('login.html');
    });
  }

  function showMsg(id, isSuccess, text) {
    const el = document.getElementById(id);
    if (!el) {
      console.warn(`[CMS Diagnostics] Element not found: #${id}`);
      return;
    }
    el.textContent = text;
    el.className = `status-msg ${isSuccess ? 'success' : 'error'}`;
    el.style.display = 'inline-block';
    setTimeout(() => el.style.display = 'none', 4000);
  }

  function escapeHtml(v) { return String(v||"").replaceAll("&", "&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
  function formatDateTime(d) { return d ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d)) : "-"; }

  const tableConfigs = {
    'education': {
      formId: 'form-edu', btnText: 'Tambah Data Pendidikan',
      populate: (d) => {
        document.getElementById('edu-year').value = d.year_range;
        document.getElementById('edu-degree').value = d.degree;
        document.getElementById('edu-inst').value = d.institution;
        document.getElementById('edu-desc').value = d.description;
      }
    },
    'research_areas': {
      formId: 'form-research', btnText: 'Tambah Area Penelitian',
      populate: (d) => {
        document.getElementById('res-icon').value = d.icon;
        document.getElementById('res-title').value = d.title;
        document.getElementById('res-desc').value = d.description;
      }
    },
    'publications': {
      formId: 'form-pub', btnText: 'Tambah Publikasi',
      populate: (d) => {
        document.getElementById('pub-year').value = d.year_pub;
        document.getElementById('pub-type').value = d.pub_type;
        document.getElementById('pub-title').value = d.title;
        document.getElementById('pub-authors').value = d.authors;
        document.getElementById('pub-journal').value = d.journal_name;
        document.getElementById('pub-url').value = d.url_link;
      }
    },
    'awards': {
      formId: 'form-award', btnText: 'Tambah Penghargaan',
      populate: (d) => {
        document.getElementById('aw-year').value = d.year_awd;
        document.getElementById('aw-icon').value = d.icon;
        document.getElementById('aw-title').value = d.title;
        document.getElementById('aw-org').value = d.organization;
      }
    },
    'teaching': {
      formId: 'form-teach', btnText: 'Tambah Pengajaran',
      populate: (d) => {
        document.getElementById('tch-code').value = d.course_code;
        document.getElementById('tch-name').value = d.course_name;
        document.getElementById('tch-level').value = d.level_semester;
      }
    },
    'gallery': {
      formId: 'form-gal', btnText: 'Tambah Galeri',
      populate: (d) => {
        document.getElementById('gal-img').value = d.image_url || '';
        const fileInput = document.getElementById('gal-img-file');
        if (fileInput) fileInput.value = ""; 
        const previewEl = document.getElementById('gal-img-preview');
        if (previewEl) {
             previewEl.innerHTML = d.image_url ? `✓ Gambar saat ini: <a href="${d.image_url}" target="_blank" style="color:#0B6FAE;">Lihat Disini</a><br><small style="color:#666;">(Abaikan upload file baru jika tidak ingin mengubah gambar)</small>` : '';
        }
        document.getElementById('gal-cat').value = d.category;
        document.getElementById('gal-title').value = d.title;
        document.getElementById('gal-date').value = d.date_pub;
        document.getElementById('gal-keys').value = Array.isArray(d.keywords) ? d.keywords.join(', ') : d.keywords;
        document.getElementById('gal-desc').value = d.content_desc;
      }
    },
    'contacts': {
      formId: 'form-contact', btnText: 'Tambah Kontak',
      populate: (d) => {
        document.getElementById('con-icon').value = d.icon;
        document.getElementById('con-label').value = d.label_name;
        document.getElementById('con-text').value = d.display_text;
        document.getElementById('con-link').value = d.link_url;
      }
    },
    'profile_items': {
      formId: 'form-profile-item', btnText: 'Tambah Atribut',
      populate: (d) => {
        document.getElementById('item-type').value = d.type;
        document.getElementById('item-label').value = d.label;
        document.getElementById('item-value').value = d.value;
      }
    }
  };

  window.editState = {};

  window.editRow = async function(tableName, id) {
    const { data, error } = await supa.from(tableName).select('*').eq('id', id).single();
    if (error) { alert("Gagal mengambil data untuk diedit: " + error.message); return; }

    const config = tableConfigs[tableName];
    if (config) {
      config.populate(data);
      window.editState[tableName] = id;
      
      const form = document.getElementById(config.formId);
      const submitBtn = form.querySelector('button[type="submit"]');
      
      submitBtn.textContent = "Update Data";
      submitBtn.style.background = "#073B5C";
      
      let cancelBtn = document.getElementById('cancel-' + tableName);
      if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-' + tableName;
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn secondary';
        cancelBtn.textContent = 'Batal Edit';
        cancelBtn.style.marginLeft = '12px';
        cancelBtn.style.background = '#e2e8f0';
        cancelBtn.style.color = '#334155';
        
        cancelBtn.onclick = () => {
          form.reset();
          if (form.id === 'form-gal') {
             const imgUrlInput = document.getElementById('gal-img');
             if (imgUrlInput) imgUrlInput.value = '';
             const previewEl = document.getElementById('gal-img-preview');
             if (previewEl) previewEl.innerHTML = '';
          }
          delete window.editState[tableName];
          submitBtn.textContent = config.btnText;
          submitBtn.style.background = "";
          cancelBtn.style.display = 'none';
        };
        submitBtn.parentNode.insertBefore(cancelBtn, submitBtn.nextSibling);
      }
      cancelBtn.style.display = 'inline-block';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  window.deleteRow = async function(tableName, id) {
    if (!confirm("Yakin ingin menghapus data ini secara permanen?")) return;
    const { error } = await supa.from(tableName).delete().eq('id', id);
    if (error) {
      alert("Gagal menghapus data:\n" + error.message);
    } else {
      loadAllDynamicTables();
    }
  };

  async function loadAllDynamicTables() {
    try {
      const seoRes = await supa.from('seo_settings').select('*').eq('page_key', 'home').maybeSingle();
      if (seoRes.data) {
        const elTitle = document.getElementById('seo-title'); if(elTitle) elTitle.value = seoRes.data.meta_title || '';
        const elUrl = document.getElementById('seo-url'); if(elUrl) elUrl.value = seoRes.data.canonical_url || '';
        const elDesc = document.getElementById('seo-desc'); if(elDesc) elDesc.value = seoRes.data.meta_description || '';
      }

      const bioRes = await supa.from('biography').select('*').order('id', {ascending: true}).limit(1);
      if (bioRes.data && bioRes.data.length > 0) {
        currentBioId = bioRes.data[0].id;
        const elBio = document.getElementById('bio-text');
        if(elBio) elBio.value = bioRes.data[0].content_text || '';
        
        const activeBio = bioRes.data[0];
        const imgUrlInput = document.getElementById('bio-img-url');
        if(imgUrlInput) imgUrlInput.value = activeBio.profile_picture_url || '';
        const previewEl = document.getElementById('bio-img-preview');
        if (previewEl && activeBio.profile_picture_url) {
           previewEl.innerHTML = `✓ Foto saat ini: <a href="${activeBio.profile_picture_url}" target="_blank" style="color:#0B6FAE;">Lihat Disini</a><br><small style="color:#666;">(Abaikan upload file jika tidak ingin mengubah foto)</small>`;
        }
      }

      const loadTable = async (table, tbodyId, renderFn) => {
        const { data, error } = await supa.from(table).select('*').order('id', { ascending: true });
        const tbody = document.getElementById(tbodyId);
        if (tbody) {
          if (error) {
            tbody.innerHTML = `<tr><td colspan="5" style="color:red; font-weight:bold;">Error Supabase: ${error.message}</td></tr>`;
          } else if (data && data.length > 0) {
            tbody.innerHTML = data.map(renderFn).join('');
          } else {
            tbody.innerHTML = `<tr><td colspan="5" style="color: #666; font-style: italic;">Data ${table} kosong di database.</td></tr>`;
          }
        }
      };

      const btnEditStyle = `style="background:#f59e0b; border:none; color:#fff;"`;

      await loadTable('education', 'tbody-education', d => `<tr><td>${escapeHtml(d.year_range)}</td><td>${escapeHtml(d.degree)}</td><td>${escapeHtml(d.institution)}</td><td class="action-cell"><button class="btn small" ${btnEditStyle} onclick="editRow('education', ${d.id})">Edit</button> <button class="btn small danger" onclick="deleteRow('education', ${d.id})">Hapus</button></td></tr>`);
      await loadTable('research_areas', 'tbody-research', d => `<tr><td>${escapeHtml(d.icon)}</td><td>${escapeHtml(d.title)}</td><td class="action-cell"><button class="btn small" ${btnEditStyle} onclick="editRow('research_areas', ${d.id})">Edit</button> <button class="btn small danger" onclick="deleteRow('research_areas', ${d.id})">Hapus</button></td></tr>`);
      await loadTable('publications', 'tbody-publications', d => `<tr><td>${escapeHtml(d.year_pub)}</td><td><span class="badge">${escapeHtml(d.pub_type)}</span></td><td>${escapeHtml(d.title)}</td><td class="action-cell"><button class="btn small" ${btnEditStyle} onclick="editRow('publications', ${d.id})">Edit</button> <button class="btn small danger" onclick="deleteRow('publications', ${d.id})">Hapus</button></td></tr>`);
      await loadTable('awards', 'tbody-awards', d => `<tr><td>${escapeHtml(d.year_awd)}</td><td>${escapeHtml(d.title)}</td><td>${escapeHtml(d.organization)}</td><td class="action-cell"><button class="btn small" ${btnEditStyle} onclick="editRow('awards', ${d.id})">Edit</button> <button class="btn small danger" onclick="deleteRow('awards', ${d.id})">Hapus</button></td></tr>`);
      await loadTable('teaching', 'tbody-teaching', d => `<tr><td><span class="badge">${escapeHtml(d.course_code)}</span></td><td>${escapeHtml(d.course_name)}</td><td>${escapeHtml(d.level_semester)}</td><td class="action-cell"><button class="btn small" ${btnEditStyle} onclick="editRow('teaching', ${d.id})">Edit</button> <button class="btn small danger" onclick="deleteRow('teaching', ${d.id})">Hapus</button></td></tr>`);
      
      await loadTable('gallery', 'tbody-gallery', d => {
         const thumbnail = d.image_url ? `<img src="${d.image_url}" style="width:40px; height:30px; object-fit:cover; border-radius:4px;">` : '-';
         return `<tr><td>${thumbnail}</td><td><span class="badge">${escapeHtml(d.category)}</span></td><td>${escapeHtml(d.title)}</td><td class="action-cell"><button class="btn small" ${btnEditStyle} onclick="editRow('gallery', ${d.id})">Edit</button> <button class="btn small danger" onclick="deleteRow('gallery', ${d.id})">Hapus</button></td></tr>`;
      });
      
      await loadTable('contacts', 'tbody-contacts', d => `<tr><td>${escapeHtml(d.label_name)}</td><td>${escapeHtml(d.display_text)}</td><td class="action-cell"><button class="btn small" ${btnEditStyle} onclick="editRow('contacts', ${d.id})">Edit</button> <button class="btn small danger" onclick="deleteRow('contacts', ${d.id})">Hapus</button></td></tr>`);
      
      await loadTable('profile_items', 'tbody-profile-items', d => {
        let typeLabel = d.type === 'stats' ? 'Angka Hero' : d.type === 'pribadi' ? 'Data Pribadi' : d.type === 'keahlian' ? 'Keahlian' : 'Indeks Akademis';
        return `<tr><td><span class="badge">${typeLabel}</span></td><td>${escapeHtml(d.label)}</td><td>${escapeHtml(d.value)}</td><td class="action-cell"><button class="btn small" ${btnEditStyle} onclick="editRow('profile_items', ${d.id})">Edit</button> <button class="btn small danger" onclick="deleteRow('profile_items', ${d.id})">Hapus</button></td></tr>`;
      });

    } catch (err) {
      alert("TERJADI KESALAHAN SAAT MENARIK DATA:\n" + err.message);
    }
  }

  function attachFormSubmit(formId, tableName, buildPayloadFn, msgId, isSingleton = false) {
    const form = document.getElementById(formId);
    if (!form) {
      console.warn(`[CMS Diagnostics] Form ID "${formId}" TIDAK ditemukan di HTML page ini.`);
      return;
    }
    
    console.log(`[CMS Diagnostics] Berhasil memasang event submit pada form: #${formId}`);
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log(`[CMS Diagnostics] Trigger submit terdeteksi untuk form #${formId}`);
      showMsg(msgId, true, 'Menyimpan ke database...');
      
      try {
        const payload = await buildPayloadFn();
        console.log(`[CMS Diagnostics] Payload berhasil dibuat untuk tabel [${tableName}]:`, payload);
        let error;
        
        if (isSingleton) {
          if (tableName === 'seo_settings') {
            payload.page_key = 'home';
            const res = await supa.from('seo_settings').upsert(payload);
            error = res.error;
          } else if (tableName === 'biography') {
            if (currentBioId) {
              const res = await supa.from('biography').update(payload).eq('id', currentBioId);
              error = res.error;
            } else {
              const res = await supa.from('biography').insert([payload]);
              error = res.error;
            }
          }
        } else {
          const editId = window.editState[tableName];
          if (editId) {
            const res = await supa.from(tableName).update(payload).eq('id', editId);
            error = res.error;
          } else {
            const res = await supa.from(tableName).insert([payload]);
            error = res.error;
          }
        }

        if (error) {
          alert(`GAGAL MENYIMPAN KE TABEL ${tableName}:\n${error.message}`);
          throw error;
        }
        
        showMsg(msgId, true, '✓ Berhasil disimpan!');
        console.log(`[CMS Diagnostics] Transaksi database sukses untuk tabel [${tableName}]`);
        
        if (!isSingleton) { 
          form.reset(); 
          if (formId === 'form-gal') {
            const imgUrlInput = document.getElementById('gal-img');
            if(imgUrlInput) imgUrlInput.value = '';
            const previewEl = document.getElementById('gal-img-preview');
            if(previewEl) previewEl.innerHTML = '';
          }
          
          const editId = window.editState[tableName];
          if (editId) {
             delete window.editState[tableName];
             const config = tableConfigs[tableName];
             const submitBtn = form.querySelector('button[type="submit"]');
             if (submitBtn && config) {
                 submitBtn.textContent = config.btnText;
                 submitBtn.style.background = "";
             }
             const cancelBtn = document.getElementById('cancel-' + tableName);
             if (cancelBtn) cancelBtn.style.display = 'none';
          }
          
          loadAllDynamicTables(); 
        } else {
           if(tableName === 'biography'){
               loadAllDynamicTables();
           }
        }
      } catch (err) {
        console.error(`[CMS Diagnostics] Error fatal pada form #${formId}:`, err);
        showMsg(msgId, false, err.message || '❌ Gagal menyimpan.');
      }
    });
  }

  attachFormSubmit('form-seo', 'seo_settings', async () => ({ meta_title: document.getElementById('seo-title').value, meta_description: document.getElementById('seo-desc').value, canonical_url: document.getElementById('seo-url').value }), 'msg-seo', true);
  attachFormSubmit('form-bio', 'biography', async () => {
    let imageUrl = document.getElementById('bio-img-url').value;
    const fileInput = document.getElementById('bio-img-file');
    const file = fileInput ? fileInput.files[0] : null;
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `profile_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error } = await supa.storage.from('gallery-images').upload(`public/${fileName}`, file);
      if (error) throw new Error("Upload foto diblokir: " + error.message);
      const { data: publicUrlData } = supa.storage.from('gallery-images').getPublicUrl(`public/${fileName}`);
      imageUrl = publicUrlData.publicUrl;
    }
    return { content_text: document.getElementById('bio-text').value, profile_picture_url: imageUrl };
  }, 'msg-bio', true);

  attachFormSubmit('form-edu', 'education', async () => ({ year_range: document.getElementById('edu-year').value, degree: document.getElementById('edu-degree').value, institution: document.getElementById('edu-inst').value, description: document.getElementById('edu-desc').value }), 'msg-edu');
  attachFormSubmit('form-research', 'research_areas', async () => ({ icon: document.getElementById('res-icon').value, title: document.getElementById('res-title').value, description: document.getElementById('res-desc').value }), 'msg-res');
  attachFormSubmit('form-pub', 'publications', async () => ({ year_pub: document.getElementById('pub-year').value, pub_type: document.getElementById('pub-type').value, title: document.getElementById('pub-title').value, authors: document.getElementById('pub-authors').value, journal_name: document.getElementById('pub-journal').value, url_link: document.getElementById('pub-url').value }), 'msg-pub');
  attachFormSubmit('form-award', 'awards', async () => ({ year_awd: document.getElementById('aw-year').value, title: document.getElementById('aw-title').value, organization: document.getElementById('aw-org').value, icon: document.getElementById('aw-icon').value }), 'msg-aw');
  attachFormSubmit('form-teach', 'teaching', async () => ({ course_code: document.getElementById('tch-code').value, course_name: document.getElementById('tch-name').value, level_semester: document.getElementById('tch-level').value }), 'msg-tch');
  attachFormSubmit('form-contact', 'contacts', async () => ({ icon: document.getElementById('con-icon').value, label_name: document.getElementById('con-label').value, display_text: document.getElementById('con-text').value, link_url: document.getElementById('con-link').value }), 'msg-con');

  // FORM SUBMIT GALERI
  attachFormSubmit('form-gal', 'gallery', async () => {
    console.log("[CMS Diagnostics] Fungsi pembuat payload galeri berjalan. Memulai upload gambar...");
    let imageUrl = '';
    const imgUrlInput = document.getElementById('gal-img');
    if(imgUrlInput) imageUrl = imgUrlInput.value;
    
    const fileInput = document.getElementById('gal-img-file');
    const file = fileInput ? fileInput.files[0] : null;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error } = await supa.storage.from('gallery-images').upload(`public/${fileName}`, file);
      if (error) throw new Error("Upload gambar diblokir Supabase Storage: " + error.message);

      const { data: publicUrlData } = supa.storage.from('gallery-images').getPublicUrl(`public/${fileName}`);
      imageUrl = publicUrlData.publicUrl;
    } else if (!imageUrl && !file) {
      throw new Error("Gambar wajib diupload!");
    }

    return {
      image_url: imageUrl,
      category: document.getElementById('gal-cat').value,
      title: document.getElementById('gal-title').value,
      date_pub: document.getElementById('gal-date').value,
      keywords: document.getElementById('gal-keys').value.split(',').map(k=>k.trim()),
      content_desc: document.getElementById('gal-desc').value
    };
  }, 'msg-gal');
  
  attachFormSubmit('form-profile-item', 'profile_items', async () => ({
    type: document.getElementById('item-type').value,
    label: document.getElementById('item-label').value,
    value: document.getElementById('item-value').value
  }), 'msg-profile-item');

  async function renderMessages() {
    const container = document.getElementById("messagesList");
    if (!container) return;
    container.innerHTML = '<p class="messages-empty">Memuat pesan...</p>';
    const { data: msgs, error } = await supa.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) {
      container.innerHTML = `<p class="messages-empty" style="color:red;">Error Database: ${error.message}</p>`;
      return;
    }
    if (!msgs || msgs.length === 0) {
      container.innerHTML = '<p class="messages-empty">Belum ada pesan masuk</p>';
      return;
    }
    container.innerHTML = msgs.map(m => {
      const s = m.status || "unread";
      const btnR = s==="unread" ? `<button class="btn small" type="button" data-message-action="read" data-message-id="${m.id}">Tandai dibaca</button>`:"";
      const btnRp = s==="read" ? `<button class="btn small" type="button" data-message-action="replied" data-message-id="${m.id}">Tandai dibalas</button>`:"";
      const btnD = s==="replied" ? `<button class="btn small danger" type="button" data-message-action="delete" data-message-id="${m.id}">Hapus</button>`:"";
      const sLabel = s==="unread" ? "Belum dibaca" : s==="read" ? "Dibaca" : "Dibalas";
      return `<article class="message-card">
        <div class="message-top">
          <div>
            <h3 class="message-title">${escapeHtml(m.subject || 'Tanpa Subjek')}</h3>
            <div class="message-time">Dikirim: ${formatDateTime(m.created_at)}</div>
          </div>
          <span class="badge ${s}">${sLabel}</span>
        </div>
        <div class="message-info">
          <div><span>Nama</span>${escapeHtml(m.name)}</div>
          <div><span>Email</span>${escapeHtml(m.email || '-')}</div>
          <div><span>WA</span>${escapeHtml(m.whatsapp || '-')}</div>
          <div><span>Instansi</span>${escapeHtml(m.institution || '-')}</div>
        </div>
        <p class="message-body">${escapeHtml(m.message)}</p>
        <div class="message-actions">${btnR}${btnRp}${btnD}</div>
      </article>`;
    }).join("");
  }

  document.addEventListener("click", async e => {
    const btn = e.target.closest("[data-message-action]");
    if (!btn) return;
    const id = btn.dataset.messageId;
    const act = btn.dataset.messageAction;
    if (act === "delete") {
      if(!confirm("Hapus pesan ini permanen dari database?")) return;
      await supa.from('contact_messages').delete().eq('id', id);
    } else {
      const updateData = { status: act };
      if (act === 'read') updateData.read_at = new Date().toISOString();
      if (act === 'replied') updateData.replied_at = new Date().toISOString();
      await supa.from('contact_messages').update(updateData).eq('id', id);
    }
    renderMessages();
  });

  function initTabs() {
    const navLinks = document.querySelectorAll('.admin-nav a[href^="#"]');
    const views = document.querySelectorAll('.admin-view');
    const hTitle = document.getElementById('header-title');
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-overlay');
    const menuToggle = document.getElementById('admin-menu-toggle');
    function toggleMenu() {
      if(sidebar) sidebar.classList.toggle('open');
      if(overlay) overlay.classList.toggle('show');
    }
    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
    function switchTab(hash) {
      navLinks.forEach(l => l.classList.remove('active')); 
      views.forEach(v => v.classList.remove('active'));
      const aLink = document.querySelector(`.admin-nav a[href="${hash}"]`);
      if (aLink) { aLink.classList.add('active'); if (hTitle) hTitle.textContent = aLink.textContent; }
      const target = document.querySelector(hash); if (target) target.classList.add('active');
      if (window.innerWidth <= 992 && sidebar && sidebar.classList.contains('open')) {
          toggleMenu();
      }
    }
    navLinks.forEach(l => l.addEventListener('click', e => { 
      e.preventDefault(); const h = l.getAttribute('href'); window.location.hash = h; switchTab(h); 
    }));
    switchTab(window.location.hash || '#dashboard');
  }

  initTabs();
  renderMessages();
  loadAllDynamicTables(); 
})();