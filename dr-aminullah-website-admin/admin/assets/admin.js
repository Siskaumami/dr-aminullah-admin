(function () {
  // 1. KEAMANAN LOGIN (Langsung dieksekusi)
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

  // Fungsi Logout
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function(e) {
      e.preventDefault();
      sessionStorage.removeItem('adminLoggedIn');
      window.location.replace('login.html');
    });
  }

  // 2. FUNGSI UTILITAS UMUM
  function showMsg(id, isSuccess, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = `status-msg ${isSuccess ? 'success' : 'error'}`;
    el.style.display = 'inline-block';
    setTimeout(() => el.style.display = 'none', 4000);
  }

  function escapeHtml(v) { return String(v||"").replaceAll("&", "&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
  function formatDateTime(d) { return d ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d)) : "-"; }

  window.deleteRow = async function(tableName, id) {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    const { error } = await supa.from(tableName).delete().eq('id', id);
    if (error) {
      alert("Gagal menghapus data:\n" + error.message);
    } else {
      loadAllDynamicTables();
    }
  };

  // 3. FUNGSI MEMUAT DATA SUPABASE (READ) - Berjalan Langsung
  async function loadAllDynamicTables() {
    try {
      // Load SEO
      const seoRes = await supa.from('seo_settings').select('*').eq('page_key', 'home').maybeSingle();
      if (seoRes.error) console.error("Error SEO:", seoRes.error);
      if (seoRes.data) {
        const elTitle = document.getElementById('seo-title'); if(elTitle) elTitle.value = seoRes.data.meta_title || '';
        const elUrl = document.getElementById('seo-url'); if(elUrl) elUrl.value = seoRes.data.canonical_url || '';
        const elDesc = document.getElementById('seo-desc'); if(elDesc) elDesc.value = seoRes.data.meta_description || '';
      }

      // Load Biografi
      const bioRes = await supa.from('biography').select('*').order('id', {ascending: true}).limit(1);
      if (bioRes.error) console.error("Error Biografi:", bioRes.error);
      if (bioRes.data && bioRes.data.length > 0) {
        currentBioId = bioRes.data[0].id;
        const elBio = document.getElementById('bio-text');
        if(elBio) elBio.value = bioRes.data[0].content_text || '';
      }

      // Load Tabel Dinamis Lainnya
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

      await loadTable('education', 'tbody-education', d => `<tr><td>${escapeHtml(d.year_range)}</td><td>${escapeHtml(d.degree)}</td><td>${escapeHtml(d.institution)}</td><td class="action-cell"><button class="btn small danger" onclick="deleteRow('education', ${d.id})">Hapus</button></td></tr>`);
      await loadTable('research_areas', 'tbody-research', d => `<tr><td>${escapeHtml(d.icon)}</td><td>${escapeHtml(d.title)}</td><td class="action-cell"><button class="btn small danger" onclick="deleteRow('research_areas', ${d.id})">Hapus</button></td></tr>`);
      await loadTable('publications', 'tbody-publications', d => `<tr><td>${escapeHtml(d.year_pub)}</td><td><span class="badge">${escapeHtml(d.pub_type)}</span></td><td>${escapeHtml(d.title)}</td><td class="action-cell"><button class="btn small danger" onclick="deleteRow('publications', ${d.id})">Hapus</button></td></tr>`);
      await loadTable('awards', 'tbody-awards', d => `<tr><td>${escapeHtml(d.year_awd)}</td><td>${escapeHtml(d.title)}</td><td>${escapeHtml(d.organization)}</td><td class="action-cell"><button class="btn small danger" onclick="deleteRow('awards', ${d.id})">Hapus</button></td></tr>`);
      await loadTable('teaching', 'tbody-teaching', d => `<tr><td><span class="badge">${escapeHtml(d.course_code)}</span></td><td>${escapeHtml(d.course_name)}</td><td>${escapeHtml(d.level_semester)}</td><td class="action-cell"><button class="btn small danger" onclick="deleteRow('teaching', ${d.id})">Hapus</button></td></tr>`);
      await loadTable('gallery', 'tbody-gallery', d => `<tr><td><span class="badge">${escapeHtml(d.category)}</span></td><td>${escapeHtml(d.title)}</td><td>${escapeHtml(d.date_pub)}</td><td class="action-cell"><button class="btn small danger" onclick="deleteRow('gallery', ${d.id})">Hapus</button></td></tr>`);
      await loadTable('contacts', 'tbody-contacts', d => `<tr><td>${escapeHtml(d.label_name)}</td><td>${escapeHtml(d.display_text)}</td><td class="action-cell"><button class="btn small danger" onclick="deleteRow('contacts', ${d.id})">Hapus</button></td></tr>`);

    } catch (err) {
      alert("TERJADI KESALAHAN SAAT MENARIK DATA:\n" + err.message);
    }
  }

  // 4. FUNGSI SIMPAN DATA (CREATE / UPDATE)
  function attachFormSubmit(formId, tableName, buildPayloadFn, msgId, isSingleton = false) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      showMsg(msgId, true, 'Menyimpan ke database...');
      
      try {
        const payload = buildPayloadFn();
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
          const res = await supa.from(tableName).insert([payload]);
          error = res.error;
        }

        if (error) {
          alert(`GAGAL MENYIMPAN KE TABEL ${tableName}:\n${error.message}`);
          throw error;
        }
        
        showMsg(msgId, true, '✓ Berhasil disimpan!');
        
        if (!isSingleton) { 
          form.reset(); 
          loadAllDynamicTables(); 
        }
      } catch (err) {
        showMsg(msgId, false, '❌ Gagal. Cek Pop-up Error.');
      }
    });
  }

  // Binding Form ke Tabel Supabase
  attachFormSubmit('form-seo', 'seo_settings', () => ({ meta_title: document.getElementById('seo-title').value, meta_description: document.getElementById('seo-desc').value, canonical_url: document.getElementById('seo-url').value }), 'msg-seo', true);
  attachFormSubmit('form-bio', 'biography', () => ({ content_text: document.getElementById('bio-text').value }), 'msg-bio', true);
  attachFormSubmit('form-edu', 'education', () => ({ year_range: document.getElementById('edu-year').value, degree: document.getElementById('edu-degree').value, institution: document.getElementById('edu-inst').value, description: document.getElementById('edu-desc').value }), 'msg-edu');
  attachFormSubmit('form-research', 'research_areas', () => ({ icon: document.getElementById('res-icon').value, title: document.getElementById('res-title').value, description: document.getElementById('res-desc').value }), 'msg-res');
  attachFormSubmit('form-pub', 'publications', () => ({ year_pub: document.getElementById('pub-year').value, pub_type: document.getElementById('pub-type').value, title: document.getElementById('pub-title').value, authors: document.getElementById('pub-authors').value, journal_name: document.getElementById('pub-journal').value, url_link: document.getElementById('pub-url').value }), 'msg-pub');
  attachFormSubmit('form-award', 'awards', () => ({ year_awd: document.getElementById('aw-year').value, title: document.getElementById('aw-title').value, organization: document.getElementById('aw-org').value, icon: document.getElementById('aw-icon').value }), 'msg-aw');
  attachFormSubmit('form-teach', 'teaching', () => ({ course_code: document.getElementById('tch-code').value, course_name: document.getElementById('tch-name').value, level_semester: document.getElementById('tch-level').value }), 'msg-tch');
  attachFormSubmit('form-gal', 'gallery', () => ({ image_url: document.getElementById('gal-img').value, category: document.getElementById('gal-cat').value, title: document.getElementById('gal-title').value, date_pub: document.getElementById('gal-date').value, keywords: document.getElementById('gal-keys').value.split(',').map(k=>k.trim()), content_desc: document.getElementById('gal-desc').value }), 'msg-gal');
  attachFormSubmit('form-contact', 'contacts', () => ({ icon: document.getElementById('con-icon').value, label_name: document.getElementById('con-label').value, display_text: document.getElementById('con-text').value, link_url: document.getElementById('con-link').value }), 'msg-con');

  // 5. FITUR PESAN MASUK DARI PENGUNJUNG LOKAL
  const CONTACT_MESSAGES_KEY = "drAminullahContactMessages";
  function getContactMessages() { return JSON.parse(localStorage.getItem(CONTACT_MESSAGES_KEY)) || []; }
  function setContactMessages(msgs) { localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(msgs)); }

  function renderMessages() {
    const container = document.getElementById("messagesList");
    if (!container) return;
    const msgs = getContactMessages();
    if (msgs.length === 0) { container.innerHTML = '<p class="messages-empty">Belum ada pesan terkirim</p>'; return; }
    
    container.innerHTML = msgs.map(m => {
      const s = m.status || "unread";
      const btnR = s==="unread" ? `<button class="btn small" type="button" data-message-action="read" data-message-id="${m.id}">Tandai dibaca</button>`:"";
      const btnRp = s==="read" ? `<button class="btn small" type="button" data-message-action="replied" data-message-id="${m.id}">Tandai dibalas</button>`:"";
      const btnD = s==="replied" ? `<button class="btn small danger" type="button" data-message-action="delete" data-message-id="${m.id}">Hapus</button>`:"";
      const sLabel = s==="unread" ? "Belum dibaca" : s==="read" ? "Dibaca" : "Dibalas";
      return `<article class="message-card"><div class="message-top"><div><h3 class="message-title">${escapeHtml(m.subject)}</h3><div class="message-time">Dikirim: ${formatDateTime(m.createdAt)}</div></div><span class="badge ${s}">${sLabel}</span></div><div class="message-info"><div><span>Nama</span>${escapeHtml(m.name)}</div><div><span>Email</span>${escapeHtml(m.email)}</div><div><span>WA</span>${escapeHtml(m.whatsapp)}</div><div><span>Instansi</span>${escapeHtml(m.institution)}</div></div><p class="message-body">${escapeHtml(m.message)}</p><div class="message-actions">${btnR}${btnRp}${btnD}</div></article>`;
    }).join("");
  }

  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-message-action]");
    if (!btn) return;
    const id = btn.dataset.messageId;
    const act = btn.dataset.messageAction;
    if (act === "delete") {
      if(!confirm("Hapus pesan?")) return;
      setContactMessages(getContactMessages().filter(m => m.id !== id));
    } else {
      setContactMessages(getContactMessages().map(m => m.id === id ? { ...m, status: act, [(act==='read'?'readAt':'repliedAt')]: new Date().toISOString() } : m));
    }
    renderMessages();
  });

  // 6. SISTEM NAVIGASI TAB ADMIN
  function initTabs() {
    const navLinks = document.querySelectorAll('.admin-nav a[href^="#"]');
    const views = document.querySelectorAll('.admin-view');
    const hTitle = document.getElementById('header-title');
    
    function switchTab(hash) {
      navLinks.forEach(l => l.classList.remove('active')); 
      views.forEach(v => v.classList.remove('active'));
      const aLink = document.querySelector(`.admin-nav a[href="${hash}"]`);
      if (aLink) { aLink.classList.add('active'); if (hTitle) hTitle.textContent = aLink.textContent; }
      const target = document.querySelector(hash); if (target) target.classList.add('active');
    }
    
    navLinks.forEach(l => l.addEventListener('click', e => { 
      e.preventDefault(); const h = l.getAttribute('href'); window.location.hash = h; switchTab(h); 
    }));
    switchTab(window.location.hash || '#dashboard');
  }

  // EKSEKUSI UTAMA (Tanpa menunggu DOMContentLoaded)
  initTabs();
  renderMessages();
  loadAllDynamicTables(); 

})();