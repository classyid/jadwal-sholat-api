# Jadwal Sholat API

API sederhana berbasis Google Apps Script untuk menampilkan jadwal waktu sholat dan imsyak di berbagai kota di Indonesia.

![Jadwal Sholat API](https://img.shields.io/badge/Jadwal%20Sholat-API-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-✓-success)
![License](https://img.shields.io/badge/license-MIT-orange)

## 📋 Deskripsi

API ini menyediakan data jadwal sholat dan waktu imsyak untuk hari ini dari berbagai kota di Indonesia. Data diambil dari situs [jadwalsholat.org](https://jadwalsholat.org) dan diformat dalam bentuk JSON yang mudah digunakan.

Fitur utama:
- 🕌 Jadwal sholat hari ini (Imsyak, Shubuh, Terbit, Dhuha, Dzuhur, Ashr, Magrib, Isya)
- 🏙️ Mendukung ratusan kota di Indonesia
- 📊 Sistem logging akses API untuk analisis penggunaan
- 🚀 Performa baik berkat sistem cache

## 🚀 Cara Menggunakan

API ini bisa diakses melalui URL berikut:

```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Parameter yang Tersedia

| Parameter | Deskripsi | Nilai Default | Contoh |
|-----------|-----------|---------------|--------|
| kota | Nama kota yang ingin dilihat jadwal sholatnya | kediri | `?kota=jakarta` |
| action | Jenis tindakan | jadwal | `?action=daftar-kota` |

### Contoh Penggunaan

#### 1. Mendapatkan jadwal sholat Kediri (default)
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

#### 2. Mendapatkan jadwal sholat kota tertentu
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?kota=surabaya
```

#### 3. Mendapatkan daftar kota yang didukung
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=daftar-kota
```

## 📊 Format Respons

### Jadwal Sholat
```json
{
  "status": "success",
  "data": {
    "kota": "Kediri",
    "tanggal": "Sabtu, 22 Maret 2025",
    "jadwal": {
      "imsyak": "04:11",
      "shubuh": "04:21",
      "terbit": "05:34",
      "dhuha": "05:58",
      "dzuhur": "11:41",
      "ashr": "14:54",
      "magrib": "17:44",
      "isya": "18:54"
    }
  }
}
```

### Daftar Kota
```json
{
  "status": "success",
  "total": 123,
  "data": [
    {"id": "83", "name": "aceh"},
    {"id": "34", "name": "ambon"},
    ...
    {"id": "74", "name": "yogyakarta"}
  ]
}
```

## 🛠️ Instalasi

1. Buat project baru di [Google Apps Script](https://script.google.com)
2. Salin kode yang tersedia di repositori ini ke editor
3. Simpan project
4. Klik menu "Deploy" > "New deployment"
5. Pilih jenis "Web app"
6. Atur akses ke "Anyone" (atau sesuai kebutuhan Anda)
7. Klik "Deploy"
8. Salin URL yang diberikan untuk mengakses API

## 📝 Fitur Log Akses

API ini dilengkapi dengan sistem pencatatan akses ke Google Spreadsheet, yang mencatat:
- Timestamp: Waktu akses
- IP: Alamat IP pengguna
- UserAgent: Browser atau aplikasi yang digunakan
- Action: Tindakan yang diminta
- Kota: Kota yang diminta
- Query Parameters: Parameter URL
- Status: Status respons
- Response Time: Perkiraan waktu respons

## 🤝 Kontribusi

Kontribusi selalu disambut baik! Jika Anda ingin berkontribusi:
1. Fork repositori ini
2. Buat branch fitur (`git checkout -b feature/fitur-baru`)
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

## 📜 Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE).

## ✨ Kredit

API ini mengambil data dari [jadwalsholat.org](https://jadwalsholat.org). Terima kasih atas penyediaan data jadwal sholatnya.

---

Dibuat dengan ❤️ untuk umat Muslim Indonesia
