(function () {
  function runAfterPageLoaded(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  // LOGIKA DIPERBAIKI: Menggunakan &lt; dan &gt; agar karakter teks tidak hilang
  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  let globalNewsItems = [];
  let activeNewsCategory = "all";
  let showAllNews = false;

  // ==============================================================
  // KONEKSI & PENARIKAN DATA DINAMIS DARI DATABASE SUPABASE (READ)
  // ==============================================================
  async function loadPublicDataFromDatabase() {
    console.log("Mencoba sinkronisasi data dari Supabase...");
    const supa = window.supabaseClient;
    if (!supa) {
      console.warn("Koneksi Supabase tidak ditemukan.");
      return;
    }

    try {
      const { data: seo } = await supa.from('seo_settings').select('*').eq('page_key', 'home').maybeSingle();
      if (seo) {
        if (seo.meta_title) document.title = seo.meta_title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && seo.meta_description) metaDesc.setAttribute('content', seo.meta_description);
      }

      const { data: bio } = await supa.from('biography').select('*').eq('id', 1).maybeSingle();
      if (bio && bio.content_text) {
        const bioContainer = document.querySelector('.bio-content');
        if (bioContainer) {
          const paragraphs = bio.content_text.split(/\n\s*\n/);
          bioContainer.innerHTML = paragraphs.map(p => {
            if (p.trim().startsWith('"') || p.trim().startsWith('“')) {
              return `<div class="bio-quote"><blockquote>${escapeHtml(p)}</blockquote></div>`;
            }
            return `<p>${escapeHtml(p)}</p>`;
          }).join('');
        }
      }

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

      const { data: res } = await supa.from('research_areas').select('*').order('id', { ascending: true });
      if (res && res.length > 0) {
        const resContainer = document.querySelector('.research-grid');
        if (resContainer) {
          resContainer.innerHTML = res.map(item => `
            <div class="research-card visible">
              <div class="research-icon">${escapeHtml(item.icon)}</div>
              <div class="research-card-title">${escapeHtml(item.title)}</div>
              <div class="research-card-desc">${escapeHtml(item.description)}</div>
            </div>
          `).join('');
        }
      }

      const { data: pub } = await supa.from('publications').select('*').order('year_pub', { ascending: false });
      if (pub && pub.length > 0) {
        console.log(`Berhasil memuat ${pub.length} Publikasi dari Supabase.`);
        const pubContainer = document.getElementById('pubList');
        if (pubContainer) {
          pubContainer.innerHTML = pub.map(item => {
            let badgeClass = item.pub_type.includes('Internasional') ? 'badge-journal' : 
                             item.pub_type.includes('Pengabdian') ? 'badge-conference' : 'badge-journal';
            
            let catType = item.pub_type.includes('Internasional') || item.pub_type.includes('Nasional') ? 'journal' : 
                          item.pub_type.includes('Pengabdian') ? 'conference' : 'book';
            
            return `
            <div class="pub-item" data-type="${catType}" style="display:grid;">
              <div class="pub-year">${escapeHtml(item.year_pub)}</div>
              <div>
                <span class="pub-type-badge ${badgeClass}">${escapeHtml(item.pub_type)}</span>
                <a href="${escapeHtml(item.url_link)}" target="_blank" class="pub-title" style="text-decoration:none; display:block;">${escapeHtml(item.title)}</a>
                <div class="pub-authors">${escapeHtml(item.authors)}</div>
                <div class="pub-journal">${escapeHtml(item.journal_name)}</div>
              </div>
            </div>`;
          }).join('');
        }
      }

      const { data: awd } = await supa.from('awards').select('*').order('id', { ascending: true });
      if (awd && awd.length > 0) {
        const awdContainer = document.querySelector('.awards-grid');
        if (awdContainer) {
          awdContainer.innerHTML = awd.map(item => `
            <div class="award-card visible">
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

      const { data: gal } = await supa.from('gallery').select('*').order('date_pub', { ascending: false });
      if (gal && gal.length > 0) {
        globalNewsItems = gal; 
        renderNews();
      }

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
      
      console.log("Sinkronisasi Selesai! Halaman depan 100% menggunakan data Supabase.");

    } catch (err) {
      console.error("Kesalahan kritis saat sinkronisasi data Supabase:", err);
    }
  }

  // ==============================================================
  // LOGIKA ANTARMUKA
  // ==============================================================

  window.filterPubs = function (type, btn) {
    document.querySelectorAll(".filter-btn").forEach(function (button) {
      button.classList.remove("active");
    });
    if (btn) btn.classList.add("active");

    document.querySelectorAll(".pub-item").forEach(function (item) {
      item.style.display = (type === "all" || item.dataset.type === type) ? "grid" : "none";
    });
  };

  window.handleSubmit = function (event) {
    event.preventDefault();
    const form = event.target;
    const formMessage = document.getElementById("formMsg");

    if (!form.elements.name?.value.trim() || !form.elements.message?.value.trim()) {
      formMessage.textContent = "Mohon lengkapi nama dan isi pesan Anda.";
      formMessage.style.display = "block";
      formMessage.style.color = "#B42318";
      return;
    }

    formMessage.textContent = "✓ Pesan Anda telah disimulasikan terkirim. Terima kasih!";
    formMessage.style.display = "block";
    formMessage.style.color = "#7a5c20";
    form.reset();
    setTimeout(function () { formMessage.style.display = "none"; }, 4000);
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
    return globalNewsItems.filter(function (item) {
      return activeNewsCategory === "all" || item.category === activeNewsCategory;
    });
  }

  function openNewsModal(item) {
    if (!newsModal) return;
    document.getElementById("newsModalImage").src = item.image_url || '';
    document.getElementById("newsModalCategory").textContent = item.category || '';
    document.getElementById("newsModalTitle").textContent = item.title || '';
    document.getElementById("newsModalDate").textContent = formatNewsDate(item.date_pub);
    
    const descContainer = document.getElementById("newsModalDesc");
    descContainer.innerHTML = `<p>${escapeHtml(item.content_desc || '')}</p>`;

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

    visibleNews.forEach(function (item) {
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
    // Memulai Penarikan Data
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
      const observer = new IntersectionObserver(function (entries) {
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
      sections.forEach(function (sec) {
        const sectionTop = sec.offsetTop - 140;
        if (window.scrollY >= sectionTop) {
          currentSection = sec.getAttribute("id");
        }
      });
      navLinks.forEach(function (link) {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + currentSection) {
          link.classList.add("active");
        }
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