# Dr. Aminullah Website — Refactored Structure

Versi ini mempertahankan tampilan landing page publik, tetapi struktur file sudah dirapikan untuk persiapan admin/CMS, backend, database, upload gambar, dan SEO.

## Cara membuka website

Buka file berikut di browser:

```txt
index.html
```

Tampilan public landing page tetap memakai konten asli, tetapi CSS, JavaScript, dan gambar profil sudah dipindahkan ke folder `assets/`.

## Struktur utama

```txt
index.html                  # landing page publik satu halaman
assets/css/main.css          # CSS utama hasil pemisahan dari index lama
assets/js/main.js            # JavaScript utama hasil pemisahan dari index lama
assets/images/               # aset gambar lokal
sections/                    # potongan HTML tiap section untuk persiapan component/CMS
data/sections.json           # metadata urutan section
data/gallery.json            # data awal galeri/berita dari script lama
data/seo.json                # data SEO awal
admin/                       # kerangka admin panel frontend
backend/supabase/schema.sql   # rancangan tabel database Supabase
backend/supabase/seed.sql     # seed awal section dan SEO
backend/api/                  # contoh endpoint backend
robots.txt
sitemap.xml
```

## Catatan penting

- Public landing page tetap satu halaman.
- Admin panel masih berupa kerangka frontend, belum tersambung ke Supabase.
- Untuk produksi, sambungkan form admin ke Supabase Auth, Supabase Database, dan Supabase Storage.
- File `schema.sql` sudah disiapkan untuk tabel section, konten, galeri, media, SEO, dan pesan kontak.

## Rekomendasi tahap berikutnya

1. Buat project Supabase.
2. Jalankan `backend/supabase/schema.sql`.
3. Jalankan `backend/supabase/seed.sql`.
4. Sambungkan admin login ke Supabase Auth.
5. Sambungkan upload gambar ke Supabase Storage.
6. Ubah public `index.html` menjadi Astro SSR agar konten dari database tetap terbaca Google sebagai HTML.
