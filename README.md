# 📚 PAW Project — Laravel + React (Inertia.js)

> Proyek ini menggunakan **Laravel** (backend) + **React + JavaScript** (frontend) yang dihubungkan menggunakan **Inertia.js**. Ikuti panduan ini secara berurutan agar project bisa berjalan di komputer kamu.

---

## 🧰 Kebutuhan Awal (Install dulu sebelum mulai)

Pastikan kamu sudah menginstall semua tools berikut di komputer kamu:

| Tool | Fungsi | Download |
|---|---|---|
| **Git** | Version control | https://git-scm.com |
| **Laragon** | PHP + MySQL + Apache (sudah bundled) | https://laragon.org |
| **Node.js** (v18+) | Menjalankan frontend (Vite/React) | https://nodejs.org |
| **Composer** | Package manager PHP | https://getcomposer.org |
| **VS Code** | Code editor | https://code.visualstudio.com |

> ✅ Setelah install Laragon, pastikan **Start All** ditekan agar PHP dan MySQL berjalan.

---

## 🚀 Setup Project (Lakukan sekali saat pertama kali)

### 1. Clone Repository

Buka terminal (Git Bash / PowerShell / CMD), lalu jalankan:

```bash
git clone https://github.com/USERNAME/NAMA-REPO.git
cd NAMA-REPO/paw-project
```

> Ganti `USERNAME` dan `NAMA-REPO` dengan link repository GitHub kalian.

---

### 2. Install Dependencies PHP

```bash
composer install
```

> Ini akan menginstall semua package Laravel yang dibutuhkan (folder `vendor/`).

---

### 3. Install Dependencies JavaScript

```bash
npm install
```

> Ini akan menginstall semua package React/Vite yang dibutuhkan (folder `node_modules/`).

---

### 4. Buat File `.env`

File `.env` adalah file konfigurasi rahasia yang **tidak ikut di-push ke GitHub**. Kamu harus membuatnya sendiri dari template:

```bash
cp .env.example .env
```

> Di Windows, kalau perintah `cp` tidak jalan, bisa copy manual file `.env.example` lalu rename jadi `.env`.

---

### 5. Generate App Key

```bash
php artisan key:generate
```

> Ini mengisi nilai `APP_KEY` di file `.env` secara otomatis.

---

### 6. Konfigurasi Database di `.env`

Buka file `.env`, cari bagian database dan sesuaikan seperti ini:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_database_kamu
DB_USERNAME=root
DB_PASSWORD=
```

> **Catatan Laragon:**
> - `DB_USERNAME` biasanya `root`
> - `DB_PASSWORD` biasanya **kosong** (tidak diisi)
> - Buat dulu database-nya di phpMyAdmin (`http://localhost/phpmyadmin`) dengan nama yang sama seperti `DB_DATABASE`

---

### 7. Jalankan Migrasi Database

Perintah ini akan membuat semua tabel yang dibutuhkan di database kamu:

```bash
php artisan migrate
```

Output yang muncul kalau berhasil:

```
INFO  Running migrations.
0001_01_01_000000_create_users_table .... DONE
```

---

### 8. Jalankan Aplikasi

Gunakan **satu perintah** ini untuk menjalankan backend (Laravel) dan frontend (Vite/React) sekaligus:

```bash
composer run dev
```

Lalu buka browser dan akses: **http://localhost:8000**

> Kalau mau jalankan terpisah di 2 terminal:
> - Terminal 1: `php artisan serve`
> - Terminal 2: `npm run dev`

---

## 🌿 Alur Kerja dengan Git (WAJIB diikuti)

Kita menggunakan **branch** agar pekerjaan masing-masing orang tidak bertabrakan.

### ⚠️ Aturan Penting
- ❌ **Jangan pernah langsung push ke branch `main`**
- ✅ Selalu buat branch baru untuk setiap fitur yang dikerjakan
- ✅ Selalu `git pull` sebelum mulai kerja

---

### Langkah-langkah Kerja Fitur Baru

#### Step 1 — Ambil update terbaru dari `main`

```bash
git checkout main
git pull origin main
```

#### Step 2 — Buat branch baru untuk fitur kamu

Nama branch gunakan format: `feat/nama-fitur`

```bash
git checkout -b feature/nama-fitur
```

Contoh:
```bash
git checkout -b feat/halaman-produk
git checkout -b feat/tambah-keranjang
git checkout -b feat/login-google
```

#### Step 3 — Kerjakan fiturnya, lalu simpan perubahan

```bash
git add .
git commit -m "feat: tambah halaman produk"
```

> Tips pesan commit yang baik:
> - `feat: ...` → fitur baru
> - `fix: ...` → perbaikan bug
> - `style: ...` → perubahan tampilan/CSS
> - `refactor: ...` → perbaikan struktur kode

#### Step 4 — Push branch ke GitHub

```bash
git push origin feature/nama-fitur
```

#### Step 5 — Buat Pull Request di GitHub

Buka GitHub → klik **"Compare & pull request"** → assign ke team lead untuk di-review sebelum di-merge ke `main`.

---

## 🏗️ Cara Membuat Fitur Baru (Backend + Frontend)

Setiap fitur biasanya melibatkan beberapa file. Berikut urutan yang benar:

---

### 1️⃣ Buat Model + Migration

Model adalah representasi tabel di database. Jalankan perintah ini:

```bash
php artisan make:model NamaModel -m
```

Flag `-m` otomatis membuat file migration sekalian.

**Contoh:**
```bash
php artisan make:model Product -m
```

Ini akan membuat:
- `app/Models/Product.php` → Model
- `database/migrations/xxxx_create_products_table.php` → Migration

**Edit file migration** di `database/migrations/` untuk menambah kolom:

```php
public function up(): void
{
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->text('description')->nullable();
        $table->integer('price');
        $table->timestamps();
    });
}
```

**Jalankan migration** setelah selesai diedit:

```bash
php artisan migrate
```

---

### 2️⃣ Buat Controller

Controller adalah tempat logika bisnis (menangani request dari user).

```bash
php artisan make:controller NamaController
```

**Contoh:**
```bash
php artisan make:controller ProductController
```

File akan dibuat di: `app/Http/Controllers/ProductController.php`

**Contoh isi controller:**

```php
<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    // Menampilkan semua produk
    public function index()
    {
        $products = Product::all();

        return Inertia::render('Product/Index', [
            'products' => $products,
        ]);
    }

    // Menyimpan produk baru
    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string',
            'price' => 'required|integer',
        ]);

        Product::create($request->all());

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan!');
    }
}
```

---

### 3️⃣ Daftarkan Route

Route menentukan URL apa yang memanggil controller mana. Edit file `routes/web.php`:

```php
<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::post('/products', [ProductController::class, 'store'])->name('products.store');
```

> Gunakan `Route::resource()` kalau ingin semua method CRUD sekaligus (index, create, store, show, edit, update, destroy):
> ```php
> Route::resource('products', ProductController::class);
> ```

---

### 4️⃣ Buat Halaman React (UI)

Halaman frontend ada di folder `resources/js/pages/`. Buat folder dan file baru sesuai fitur dengan ekstensi **`.jsx`**:

**Struktur folder:**
```
resources/js/
├── pages/
│   ├── Product/
│   │   ├── Index.jsx      ← Halaman daftar produk
│   │   ├── Create.jsx     ← Halaman form tambah produk
│   │   └── Show.jsx       ← Halaman detail produk
│   └── Dashboard.jsx
├── components/            ← Komponen UI yang bisa dipakai ulang (tombol, card, dll)
├── layouts/               ← Layout utama (header, sidebar, dll)
└── hooks/                 ← Custom React hooks
```

**Contoh `resources/js/pages/Product/Index.jsx`:**

```jsx
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function ProductIndex({ products }) {
    return (
        <AppLayout>
            <Head title="Produk" />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Daftar Produk</h1>

                <ul>
                    {products.map((product) => (
                        <li key={product.id}>
                            {product.name} — Rp{product.price}
                        </li>
                    ))}
                </ul>
            </div>
        </AppLayout>
    );
}
```

> **Catatan:** Nama file di `pages/` harus sama persis dengan yang ada di `Inertia::render('Product/Index')` di controller.

---

## 📁 Struktur Folder Project

```
paw-project/
│
├── app/
│   ├── Http/
│   │   ├── Controllers/    ← Semua controller PHP ada di sini
│   │   ├── Middleware/     ← Middleware (autentikasi, dsb)
│   │   └── Requests/       ← Form Request untuk validasi
│   └── Models/             ← Semua model Eloquent ada di sini
│
├── database/
│   └── migrations/         ← File-file migration (struktur tabel)
│
├── resources/
│   └── js/
│       ├── pages/          ← Halaman-halaman React (dirender oleh Inertia)
│       ├── components/     ← Komponen UI yang bisa dipakai ulang
│       ├── layouts/        ← Layout halaman (AppLayout, AuthLayout, dll)
│       └── hooks/          ← Custom React hooks
│
├── routes/
│   └── web.php             ← Semua route web didefinisikan di sini
│
├── .env                    ← Konfigurasi lokal (tidak di-push ke GitHub!)
├── .env.example            ← Template .env (di-push ke GitHub)
├── composer.json           ← Dependencies PHP
└── package.json            ← Dependencies JavaScript
```

---

## 🛠️ Perintah-perintah Penting

### Laravel (PHP)

| Perintah | Fungsi |
|---|---|
| `php artisan migrate` | Jalankan semua migration baru |
| `php artisan migrate:rollback` | Batalkan migration terakhir |
| `php artisan migrate:fresh` | Hapus semua tabel & migrate ulang dari awal |
| `php artisan make:model Nama -m` | Buat model + file migration |
| `php artisan make:controller NamaController` | Buat controller baru |
| `php artisan make:request NamaRequest` | Buat form request (validasi) |
| `php artisan route:list` | Lihat semua route yang terdaftar |
| `php artisan tinker` | REPL interaktif untuk testing query |
| `php artisan config:clear` | Hapus cache konfigurasi |

### Git

| Perintah | Fungsi |
|---|---|
| `git status` | Lihat file apa saja yang berubah |
| `git pull origin main` | Ambil update terbaru dari main |
| `git checkout -b feature/nama` | Buat branch baru |
| `git add .` | Tambahkan semua perubahan ke staging |
| `git commit -m "pesan"` | Simpan perubahan dengan pesan |
| `git push origin feature/nama` | Upload branch ke GitHub |
| `git checkout main` | Pindah kembali ke branch main |

---

## ❓ Troubleshooting (Masalah Umum)

**`php` tidak dikenali di terminal?**
→ Buka Laragon → klik **Menu → PHP** → pastikan versi PHP sudah dipilih. Atau tambahkan path PHP ke environment variable Windows.

**Error `SQLSTATE[HY000] [1049] Unknown database`?**
→ Buat dulu database-nya di phpMyAdmin dengan nama yang sama seperti `DB_DATABASE` di `.env`.

**Error `Class not found` setelah buat model/controller?**
→ Jalankan `composer dump-autoload`

**Perubahan di React tidak muncul?**
→ Pastikan `composer run dev` atau `npm run dev` sedang berjalan.

**Muncul error CSRF / 419 Page Expired?**
→ Jalankan `php artisan config:clear` lalu coba lagi.

---

## 👥 Tim

| Nama | GitHub | Role |
|---|---|---|
| (Nama 1) | @username | Project Lead |
| (Nama 2) | @username | Backend |
| (Nama 3) | @username | Frontend |
| (Nama 4) | @username | Full Stack |

---

> 💡 **Ada pertanyaan?** Diskusikan di grup atau buat *Issue* di GitHub repository ini.
