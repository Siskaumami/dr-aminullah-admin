(function () {
  function runAfterPageLoaded(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  let globalNewsItems = [];
  let activeNewsCategory = "all";
  let showAllNews = false;

  async function loadPublicDataFromDatabase() {
    const supa = window.supabaseClient;
    if (!supa) return;

    try {
      const { data: seo } = await supa.from('seo_settings').select('*').eq('page_key', 'home').maybeSingle();
      if (seo) {
        if (seo.meta_title) document.title = seo.meta_title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && seo.meta_description) metaDesc.setAttribute('content', seo.meta_description);
      }
    } catch(e) {}

    // --- MENARIK ATRIBUT PROFIL (ANGKA HERO, DATA PRIBADI, KEAHLIAN) ---
    try {
      const { data: profileItems, error } = await supa.from('profile_items').select('*').order('id', { ascending: true });
      if (!error && profileItems && profileItems.length > 0) {
        const statsItems = profileItems.filter(item => item.type === 'stats');
        const pribadiItems = profileItems.filter(item => item.type === 'pribadi');
        const keahlianItems = profileItems.filter(item => item.type === 'keahlian');
        const indeksItems = profileItems.filter(item => item.type === 'indeks');

        const heroContainer = document.getElementById('hero-stats-container');
        if (heroContainer && statsItems.length > 0) {
          heroContainer.innerHTML = statsItems.map(item => `<div class="stat"><div class="stat-num">${escapeHtml(item.value)}</div><div class="stat-label">${escapeHtml(item.label)}</div></div>`).join('');
        }

        const pribadiContainer = document.getElementById('container-data-pribadi');
        if (pribadiContainer && pribadiItems.length > 0) {
          pribadiContainer.innerHTML = pribadiItems.map(item => `<div class="bio-item"><span class="bio-item-label">${escapeHtml(item.label)}</span><span class="bio-item-value">${escapeHtml(item.value)}</span></div>`).join('');
        }

        const keahlianContainer = document.getElementById('container-bidang-keahlian');
        if (keahlianContainer && keahlianItems.length > 0) {
          keahlianContainer.innerHTML = keahlianItems.map(item => `<span class="tag">${escapeHtml(item.value)}</span>`).join('');
        }

        const indeksContainer = document.getElementById('container-indeks-akademis');
        if (indeksContainer && indeksItems.length > 0) {
          indeksContainer.innerHTML = indeksItems.map(item => `<div class="bio-item"><span class="bio-item-label">${escapeHtml(item.label)}</span><span class="bio-item-value">${escapeHtml(item.value)}</span></div>`).join('');
        }
      }
    } catch(e) {}

    try {
      const { data: bio } = await supa.from('biography').select('*').eq('id', 1).maybeSingle();
      if (bio) {
        if (bio.content_text) {
          const bioContainer = document.querySelector('.bio-content');
          if (bioContainer) {
            const paragraphs = bio.content_text.split(/\n\s*\n/);
            bioContainer.innerHTML = paragraphs.map(p => {
              if (p.trim().startsWith('"') || p.trim().startsWith('“')) return `<div class="bio-quote"><blockquote>${escapeHtml(p)}</blockquote></div>`;
              return `<p>${escapeHtml(p)}</p>`;
            }).join('');
          }
        }
        if (bio.profile_picture_url) {
          const profileImg = document.getElementById('hero-profile-img');
          if (profileImg) profileImg.src = bio.profile_picture_url;
        }
      }
    } catch(e) {}

    try {
      const { data: edu } = await supa.from('education').select('*').order('id', { ascending: true });
      if (edu && edu.length > 0) {
        const eduContainer = document.querySelector('.timeline');
        if (eduContainer) {
          eduContainer.innerHTML = edu.map(item => `
            <div class="timeline-item">
              <div class="timeline-year">${escapeHtml(item.year_range)}</div>
              <div class="timeline-degree">${escapeHtml(item.degree)}</div>
              <div class="timeline-institution">${escapeHtml(item.institution)}</div>
              <div class="timeline-desc">${escapeHtml(item.description)}</div>
            </div>
          `).join('');
        }
      }
    } catch(e) {}

    try {
      const { data: res } = await supa.from('research_areas').select('*').order('id', { ascending: true });
      if (res && res.length > 0) {
        const resContainer = document.querySelector('.research-grid');
        if (resContainer) {
          resContainer.innerHTML = res.map(item => `
            <div class="research-card">
              <div class="research-icon">${escapeHtml(item.icon)}</div>
              <div class="research-card-title">${escapeHtml(item.title)}</div>
              <div class="research-card-desc">${escapeHtml(item.description)}</div>
            </div>
          `).join('');
        }
      }
    } catch(e) {}

    try {
      const { data: pub } = await supa.from('publications').select('*').order('year_pub', { ascending: false }).limit(10);
      if (pub && pub.length > 0) {
        
        // 1. Ekstrak Tipe Jurnal secara unik dari database
        const uniqueTypes = [...new Set(pub.map(item => item.pub_type))];
        
        // 2. Cetak Tombol Filter secara Otomatis
        const filterContainer = document.getElementById('pubFiltersContainer') || document.querySelector('.pub-filters');
        if (filterContainer) {
          let filterHTML = `<button class="filter-btn active" onclick="filterPubs('all', this)">Semua Karya</button>`;
          uniqueTypes.forEach(type => {
            // Ubah teks menjadi format id (contoh: "Jurnal Nasional" -> "jurnal-nasional")
            const typeSlug = type.toLowerCase().replace(/[^a-z0-9]/g, '-');
            filterHTML += `<button class="filter-btn" onclick="filterPubs('${typeSlug}', this)">${escapeHtml(type)}</button>`;
          });
          filterContainer.innerHTML = filterHTML;
        }

        // 3. Cetak List Jurnalnya
        const pubContainer = document.getElementById('pubList');
        if (pubContainer) {
          pubContainer.innerHTML = pub.map(item => {
            const typeSlug = item.pub_type.toLowerCase().replace(/[^a-z0-9]/g, '-');
            let badgeClass = item.pub_type.toLowerCase().includes('internasional') ? 'badge-journal' : 'badge-conference';
            return `
            <div class="pub-item" data-type="${typeSlug}" style="display:flex;">
              <div class="pub-year" style="width: 80px; flex-shrink: 0;">${escapeHtml(item.year_pub)}</div>
              <div style="width:100%;">
                <span class="pub-type-badge ${badgeClass}">${escapeHtml(item.pub_type)}</span>
                <a href="${escapeHtml(item.url_link)}" target="_blank" class="pub-title" style="text-decoration:none; display:block;">${escapeHtml(item.title)}</a>
                <div class="pub-authors">${escapeHtml(item.authors)}</div>
                <div class="pub-journal">${escapeHtml(item.journal_name)}</div>
              </div>
            </div>`;
          }).join('');
        }
      }
    } catch(e) {}

    try {
      const { data: awd } = await supa.from('awards').select('*').order('id', { ascending: true });
      if (awd && awd.length > 0) {
        const awdContainer = document.querySelector('.awards-grid');
        if (awdContainer) {
          awdContainer.innerHTML = awd.map(item => `
            <div class="award-card">
              <div class="award-icon">${escapeHtml(item.icon)}</div>
              <div>
                <div class="award-year">${escapeHtml(item.year_awd)}</div>
                <div class="award-title">${escapeHtml(item.title)}</div>
                <div class="award-org">${escapeHtml(item.organization)}</div>
              </div>
            </div>
          `).join('');
        }
      }
    } catch(e) {}

    try {
      const { data: tch } = await supa.from('teaching').select('*').order('id', { ascending: true });
      if (tch && tch.length > 0) {
        const tchContainer = document.querySelector('.courses-grid');
        if (tchContainer) {
          tchContainer.innerHTML = tch.map(item => `
            <div class="course-item">
              <div class="course-code">${escapeHtml(item.course_code)}</div>
              <div>
                <div class="course-name">${escapeHtml(item.course_name)}</div>
                <div class="course-level">${escapeHtml(item.level_semester)}</div>
              </div>
            </div>
          `).join('');
        }
      }
    } catch(e) {}

    try {
      const { data: gal } = await supa.from('gallery').select('*').order('date_pub', { ascending: false });
      if (gal && gal.length > 0) {
        globalNewsItems = gal; 
        renderNews();
      }
    } catch(e) {}

    try {
      const { data: con } = await supa.from('contacts').select('*').order('id', { ascending: true });
      if (con && con.length > 0) {
        const conContainer = document.querySelector('.contact-items');
        if (conContainer) {
          conContainer.innerHTML = con.map(item => `
            <div class="contact-item">
              <div class="contact-item-icon">${escapeHtml(item.icon)}</div>
              <div>
                <div class="contact-item-label">${escapeHtml(item.label_name)}</div>
                <div class="contact-item-value">
                  <a href="${escapeHtml(item.link_url)}" target="_blank" style="color:inherit; text-decoration:none;">${escapeHtml(item.display_text)}</a>
                </div>
              </div>
            </div>
          `).join('');
        }
      }
    } catch(e) {}
  }

  window.filterPubs = function (type, btn) {
    document.querySelectorAll(".filter-btn").forEach(button => button.classList.remove("active"));
    if (btn) btn.classList.add("active");
    document.querySelectorAll(".pub-item").forEach(item => {
      item.style.display = (type === "all" || item.dataset.type === type) ? "flex" : "none";
    });
  };

  window.handleSubmit = async function (event) {
    event.preventDefault();
    const form = event.target;
    const formMessage = document.getElementById("formMsg");

    const nameVal = form.elements.name?.value.trim();
    const msgVal = form.elements.message?.value.trim();

    if (!nameVal || !msgVal) {
      formMessage.textContent = "Mohon lengkapi nama dan isi pesan Anda.";
      formMessage.style.display = "block";
      formMessage.style.color = "#B42318";
      return;
    }

    formMessage.textContent = "⏳ Sedang mengirim pesan...";
    formMessage.style.display = "block";
    formMessage.style.color = "#0B6FAE";

    const payload = {
      name: nameVal,
      email: form.elements.email?.value.trim() || "",
      whatsapp: form.elements.whatsapp?.value.trim() || "",
      institution: form.elements.institution?.value.trim() || "",
      subject: form.elements.subject?.value.trim() || "Tanpa Subjek",
      message: msgVal
    };

    const supa = window.supabaseClient;
    if (!supa) {
      formMessage.textContent = "❌ Gagal: Koneksi database terputus.";
      formMessage.style.color = "#B42318";
      return;
    }

    try {
      const { error } = await supa.from('contact_messages').insert([payload]);
      if (error) throw error;
      
      formMessage.textContent = "✓ Pesan Anda berhasil terkirim. Terima kasih!";
      formMessage.style.color = "#166534";
      form.reset();
    } catch (err) {
      formMessage.textContent = "❌ Gagal mengirim pesan: " + err.message;
      formMessage.style.color = "#B42318";
    }

    setTimeout(() => { formMessage.style.display = "none"; }, 5000);
  };

  const newsGrid = document.getElementById("newsGrid");
  const newsMoreBtn = document.getElementById("newsMoreBtn");
  const newsModal = document.getElementById("newsModal");
  const newsModalClose = document.getElementById("newsModalClose");

  function getNewsLimit() {
    if (window.innerWidth <= 520) return 3;
    if (window.innerWidth <= 900) return 4;
    return 6;
  }

  function formatNewsDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  function getFilteredNews() {
    return globalNewsItems.filter(item => activeNewsCategory === "all" || item.category === activeNewsCategory);
  }

  function openNewsModal(item) {
    if (!newsModal) return;
    document.getElementById("newsModalImage").src = item.image_url || '';
    document.getElementById("newsModalCategory").textContent = item.category || '';
    document.getElementById("newsModalTitle").textContent = item.title || '';
    document.getElementById("newsModalDate").textContent = formatNewsDate(item.date_pub);
    
    document.getElementById("newsModalDesc").innerHTML = `<p>${escapeHtml(item.content_desc || '')}</p>`;
    const keywordsContainer = document.getElementById("newsModalKeywords");
    if (keywordsContainer && item.keywords) {
      const keys = Array.isArray(item.keywords) ? item.keywords : [];
      keywordsContainer.innerHTML = keys.map(k => `<span class="news-keyword">${escapeHtml(k)}</span>`).join('');
    }

    newsModal.classList.add("open");
    newsModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeNewsModal() {
    if (!newsModal) return;
    newsModal.classList.remove("open");
    newsModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function renderNews() {
    if (!newsGrid) return;
    const limit = getNewsLimit();
    const filteredNews = getFilteredNews();
    const visibleNews = showAllNews ? filteredNews : filteredNews.slice(0, limit);

    newsGrid.innerHTML = "";
    if (visibleNews.length === 0) {
      newsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:var(--muted);">Belum ada aktivitas untuk kategori ini.</p>';
      if (newsMoreBtn) newsMoreBtn.style.display = "none";
      return;
    }

    visibleNews.forEach(item => {
      const article = document.createElement("article");
      article.className = "news-card";
      article.setAttribute("tabindex", "0");
      article.setAttribute("role", "button");

      article.innerHTML = `
        <div class="news-image-wrap">
          <img src="${item.image_url}" alt="${escapeHtml(item.title)}" loading="lazy">
        </div>
        <div class="news-content">
          <div class="news-meta">
            <span class="news-category">${escapeHtml(item.category)}</span>
            <time class="news-date" datetime="${item.date_pub}">${formatNewsDate(item.date_pub)}</time>
          </div>
          <h3 class="news-title">${escapeHtml(item.title)}</h3>
          <p class="news-desc">${escapeHtml(item.content_desc || '')}</p>
        </div>
      `;
      article.addEventListener("click", () => openNewsModal(item));
      newsGrid.appendChild(article);
    });

    if (newsMoreBtn) {
      if (filteredNews.length > limit) {
        newsMoreBtn.style.display = "inline-block";
        newsMoreBtn.textContent = showAllNews ? "Tampilkan Lebih Sedikit" : "Buka Semua Berita";
      } else {
        newsMoreBtn.style.display = "none";
      }
    }
  }

  runAfterPageLoaded(function () {
    loadPublicDataFromDatabase();

    document.querySelectorAll(".news-filter-btn").forEach(button => {
      button.addEventListener("click", function () {
        document.querySelectorAll(".news-filter-btn").forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");
        activeNewsCategory = this.dataset.category;
        showAllNews = false;
        renderNews();
      });
    });

    if (newsMoreBtn) {
      newsMoreBtn.addEventListener("click", function () {
        showAllNews = !showAllNews;
        renderNews();
      });
    }

    if (newsModalClose) newsModalClose.addEventListener("click", closeNewsModal);
    if (newsModal) {
      newsModal.addEventListener("click", function (e) {
        if (e.target.classList.contains("news-modal-overlay")) closeNewsModal();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNewsModal();
    });

    window.addEventListener("resize", renderNews);

    const fadeElements = document.querySelectorAll(".fade-in");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      fadeElements.forEach(el => observer.observe(el));
    } else {
      fadeElements.forEach(el => el.classList.add("visible"));
    }

    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links a");
    const mobileToggle = document.querySelector(".mobile-nav-toggle");
    const navMenu = document.querySelector(".nav-links");

    function activateNavbar() {
      let currentSection = "";
      sections.forEach(sec => {
        const sectionTop = sec.offsetTop - 140;
        if (window.scrollY >= sectionTop) currentSection = sec.getAttribute("id");
      });
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + currentSection) link.classList.add("active");
      });
    }

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener("click", function () {
        navMenu.classList.toggle("open");
        mobileToggle.classList.toggle("active");
      });
      navLinks.forEach(link => {
        link.addEventListener("click", () => {
          navMenu.classList.remove("open");
          mobileToggle.classList.remove("active");
        });
      });
    }

    window.addEventListener("scroll", activateNavbar);
    activateNavbar();
  });
})();