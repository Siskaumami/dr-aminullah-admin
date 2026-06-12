  (function () {
    function runAfterPageLoaded(callback) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
      } else {
        callback();
      }
    }

    /* FILTER PUBLIKASI ILMIAH */
    window.filterPubs = function (type, btn) {
      document.querySelectorAll(".filter-btn").forEach(function (button) {
        button.classList.remove("active");
      });

      if (btn) {
        btn.classList.add("active");
      }

      document.querySelectorAll(".pub-item").forEach(function (item) {
        item.style.display =
          type === "all" || item.dataset.type === type ? "grid" : "none";
      });
    };

    /* FORM KONTAK */
const CONTACT_MESSAGES_KEY = "drAminullahContactMessages";

function getContactMessages() {
  try {
    return JSON.parse(localStorage.getItem(CONTACT_MESSAGES_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveContactMessage(message) {
  const messages = getContactMessages();
  messages.unshift(message);
  localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(messages));
}

function setContactFormMessage(element, text, type) {
  if (!element) return;

  element.textContent = text;
  element.style.display = "block";
  element.style.color = type === "error" ? "#B42318" : "#7a5c20";
}

function hideContactFormMessage(element) {
  if (!element) return;
  element.style.display = "none";
  element.textContent = "";
}

window.handleSubmit = function (event) {
  event.preventDefault();

  const form = event.target;
  const formMessage = document.getElementById("formMsg");

  const formData = {
    id: `msg-${Date.now()}`,
    name: form.elements.name?.value.trim() || "",
    email: form.elements.email?.value.trim() || "",
    whatsapp: form.elements.whatsapp?.value.trim() || "",
    institution: form.elements.institution?.value.trim() || "",
    subject: form.elements.subject?.value.trim() || "",
    message: form.elements.message?.value.trim() || "",
    status: "unread",
    createdAt: new Date().toISOString()
  };

  const hasEmptyField = Object.entries(formData)
    .filter(([key]) => !["id", "status", "createdAt"].includes(key))
    .some(([, value]) => value === "");

  if (hasEmptyField) {
    setContactFormMessage(formMessage, "Mohon lengkapi data Anda", "error");
    return;
  }

  saveContactMessage(formData);
  setContactFormMessage(formMessage, "✓ Pesan Anda telah dikirim. Terima kasih!", "success");

  form.reset();

  setTimeout(function () {
    hideContactFormMessage(formMessage);
  }, 4000);
};

    runAfterPageLoaded(function () {
      /* ANIMASI SAAT SCROLL */
      const fadeElements = document.querySelectorAll(".fade-in");

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.1 }
        );

        fadeElements.forEach(function (element) {
          observer.observe(element);
        });
      } else {
        fadeElements.forEach(function (element) {
          element.classList.add("visible");
        });
      }

      /* DATA BERITA UNTUK SECTION GALLERY */
      const newsItems = [
        {
          title: "Seminar Kebijakan Publik dan Transformasi Tata Kelola Pemerintahan",
          category: "Akademik",
          date: "2026-06-05",
          image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=80",
          keywords: ["Seminar", "Kebijakan Publik", "Tata Kelola"],
          desc: "Kegiatan seminar akademik membahas transformasi tata kelola pemerintahan, inovasi pelayanan publik, dan tantangan administrasi publik di era digital."
        },
        {
          title: "Publikasi Ilmiah Terbaru tentang Pelayanan Publik Berbasis Digital",
          category: "Publikasi",
          date: "2026-05-28",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
          keywords: ["Publikasi", "Digitalisasi", "Pelayanan Publik"],
          desc: "Artikel ilmiah terbaru membahas peningkatan kualitas pelayanan publik melalui digitalisasi sistem administrasi dan tata kelola berbasis data."
        },
        {
          title: "Program Pengabdian Masyarakat untuk Penguatan Kapasitas Desa",
          category: "Pengabdian",
          date: "2026-05-20",
          image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
          keywords: ["Pengabdian", "Desa", "Pemberdayaan"],
          desc: "Kegiatan pengabdian masyarakat difokuskan pada peningkatan kapasitas aparatur desa, partisipasi masyarakat, dan penguatan kelembagaan lokal."
        },
        {
          title: "Riset Kolaboratif tentang Inovasi Pelayanan Publik Daerah",
          category: "Penelitian",
          date: "2026-05-12",
          image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
          keywords: ["Riset", "Inovasi", "Pemerintahan Daerah"],
          desc: "Penelitian kolaboratif ini mengkaji strategi inovasi pelayanan publik pada pemerintah daerah serta dampaknya terhadap kepuasan masyarakat."
        },
        {
          title: "Kuliah Tamu Administrasi Publik bersama Praktisi Pemerintahan",
          category: "Akademik",
          date: "2026-04-30",
          image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80",
          keywords: ["Kuliah Tamu", "Administrasi Publik", "Praktisi"],
          desc: "Kuliah tamu menghadirkan praktisi pemerintahan untuk memberikan wawasan tentang praktik administrasi publik dan reformasi birokrasi."
        },
        {
          title: "Workshop Metodologi Penelitian Sosial untuk Mahasiswa Pascasarjana",
          category: "Penelitian",
          date: "2026-04-18",
          image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80",
          keywords: ["Workshop", "Metodologi", "Penelitian Sosial"],
          desc: "Workshop ini membekali mahasiswa dengan pemahaman metodologi penelitian sosial, teknik pengumpulan data, dan strategi analisis akademik."
        },
        {
          title: "Pendampingan Tata Kelola BUMDes untuk Penguatan Ekonomi Lokal",
          category: "Pengabdian",
          date: "2026-04-07",
          image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=900&q=80",
          keywords: ["BUMDes", "Ekonomi Lokal", "Desa"],
          desc: "Pendampingan dilakukan untuk memperkuat tata kelola BUMDes, meningkatkan transparansi, dan mendorong pengembangan potensi ekonomi desa."
        },
        {
          title: "Artikel Opini tentang Reformasi Birokrasi dan Akuntabilitas Publik",
          category: "Publikasi",
          date: "2026-03-25",
          image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
          keywords: ["Opini", "Reformasi Birokrasi", "Akuntabilitas"],
          desc: "Tulisan opini ini membahas pentingnya reformasi birokrasi, transparansi, dan akuntabilitas dalam meningkatkan kepercayaan publik."
        }
      ];

      const newsGrid = document.getElementById("newsGrid");
      const newsMoreBtn = document.getElementById("newsMoreBtn");
      const newsFilterBtns = document.querySelectorAll(".news-filter-btn");

      const newsModal = document.getElementById("newsModal");
      const newsModalClose = document.getElementById("newsModalClose");
      const newsModalImage = document.getElementById("newsModalImage");
      const newsModalCategory = document.getElementById("newsModalCategory");
      const newsModalTitle = document.getElementById("newsModalTitle");
      const newsModalDate = document.getElementById("newsModalDate");
      const newsModalDesc = document.getElementById("newsModalDesc");
      const newsModalKeywords = document.getElementById("newsModalKeywords");

      let activeNewsCategory = "all";
      let showAllNews = false;

      function getNewsLimit() {
        if (window.innerWidth <= 520) return 3;
        if (window.innerWidth <= 900) return 4;
        return 6;
      }

      function formatNewsDate(dateString) {
        return new Date(dateString).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      }

      function getFilteredNews() {
        return newsItems
          .filter(function (item) {
            return activeNewsCategory === "all" || item.category === activeNewsCategory;
          })
          .sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
          });
      }

      function openNewsModal(item) {
        if (
          !newsModal ||
          !newsModalImage ||
          !newsModalCategory ||
          !newsModalTitle ||
          !newsModalDate ||
          !newsModalDesc ||
          !newsModalKeywords
        ) {
          return;
        }

        newsModalImage.src = item.image;
        newsModalImage.alt = item.title;
        newsModalCategory.textContent = item.category;
        newsModalTitle.textContent = item.title;
        newsModalDate.textContent = formatNewsDate(item.date);
        newsModalDesc.innerHTML = "";

const descParagraphs = Array.isArray(item.desc)
  ? item.desc
  : String(item.desc || "").split(/\r?\n\s*\r?\n/);

descParagraphs.forEach(function (paragraph) {
  const p = document.createElement("p");
  p.textContent = paragraph;
  newsModalDesc.appendChild(p);
});

        newsModalKeywords.innerHTML = item.keywords
          .map(function (keyword) {
            return '<span class="news-keyword">' + keyword + '</span>';
          })
          .join("");

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

        visibleNews.forEach(function (item) {
          const article = document.createElement("article");
          article.className = "news-card";
          article.setAttribute("tabindex", "0");
          article.setAttribute("role", "button");
          article.setAttribute("aria-label", "Baca berita " + item.title);

          article.innerHTML =
            '<div class="news-image-wrap">' +
              '<img src="' + item.image + '" alt="' + item.title + '" loading="lazy">' +
            '</div>' +
            '<div class="news-content">' +
              '<div class="news-meta">' +
                '<span class="news-category">' + item.category + '</span>' +
                '<time class="news-date" datetime="' + item.date + '">' + formatNewsDate(item.date) + '</time>' +
              '</div>' +
              '<h3 class="news-title">' + item.title + '</h3>' +
              '<p class="news-desc">' + item.desc + '</p>' +
              '<div class="news-keywords">' +
                item.keywords.map(function (keyword) {
                  return '<span class="news-keyword">' + keyword + '</span>';
                }).join("") +
              '</div>' +
            '</div>';

          article.addEventListener("click", function () {
            openNewsModal(item);
          });

          article.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
              openNewsModal(item);
            }
          });

          newsGrid.appendChild(article);
        });

        if (newsMoreBtn) {
          if (filteredNews.length > limit) {
            newsMoreBtn.style.display = "inline-block";
            newsMoreBtn.textContent = showAllNews
              ? "Tampilkan Lebih Sedikit"
              : "Buka Semua Berita";
          } else {
            newsMoreBtn.style.display = "none";
          }
        }
      }

      newsFilterBtns.forEach(function (button) {
        button.addEventListener("click", function () {
          newsFilterBtns.forEach(function (btn) {
            btn.classList.remove("active");
          });

          button.classList.add("active");
          activeNewsCategory = button.dataset.category;
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

      if (newsModalClose) {
        newsModalClose.addEventListener("click", closeNewsModal);
      }

      if (newsModal) {
        newsModal.addEventListener("click", function (event) {
          if (event.target.classList.contains("news-modal-overlay")) {
            closeNewsModal();
          }
        });
      }

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          closeNewsModal();
        }
      });

      window.addEventListener("resize", renderNews);
      renderNews();

      /* NAVBAR ACTIVE + MOBILE DROPDOWN */
      const sections = document.querySelectorAll("section[id]");
      const navLinks = document.querySelectorAll(".nav-links a");
      const mobileToggle = document.querySelector(".mobile-nav-toggle");
      const navMenu = document.querySelector(".nav-links");

      function activateNavbar() {
        let currentSection = "";

        sections.forEach(function (section) {
          const sectionTop = section.offsetTop - 140;
          const sectionHeight = section.offsetHeight;
          const sectionId = section.getAttribute("id");

          if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
          ) {
            currentSection = sectionId;
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

        navLinks.forEach(function (link) {
          link.addEventListener("click", function () {
            navMenu.classList.remove("open");
            mobileToggle.classList.remove("active");
          });
        });

        document.addEventListener("click", function (event) {
          const clickInsideNav = navMenu.contains(event.target);
          const clickToggle = mobileToggle.contains(event.target);

          if (!clickInsideNav && !clickToggle) {
            navMenu.classList.remove("open");
            mobileToggle.classList.remove("active");
          }
        });
      }

      window.addEventListener("scroll", activateNavbar);
      window.addEventListener("resize", activateNavbar);
      activateNavbar();
    });
  })();
