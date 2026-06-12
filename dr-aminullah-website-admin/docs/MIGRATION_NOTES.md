# Catatan Migrasi

## Yang berubah dari file asli

1. CSS inline dipindahkan ke `assets/css/main.css`.
2. JavaScript inline dipindahkan ke `assets/js/main.js`.
3. Foto profil base64 dipindahkan menjadi file gambar lokal di `assets/images/`.
4. Halaman public tetap `index.html` dan tetap landing page satu halaman.
5. Ditambahkan folder `admin/` sebagai kerangka CMS.
6. Ditambahkan folder `backend/` untuk schema database dan contoh API.
7. Ditambahkan folder `data/` untuk metadata awal section, galeri, dan SEO.
8. Ditambahkan `robots.txt` dan `sitemap.xml` untuk persiapan SEO produksi.

## Catatan tampilan

Tidak ada perubahan desain visual yang disengaja pada halaman publik. CSS dan JavaScript utama dipindahkan tanpa mengubah isinya.

## Batasan

Admin panel belum menyimpan data secara nyata karena belum tersambung ke database. Ini adalah struktur awal yang aman untuk dilanjutkan ke Supabase/Astro SSR.
