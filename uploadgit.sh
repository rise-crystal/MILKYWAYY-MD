#!/bin/bash

# Menambahkan semua file ke dalam .gitignore
ls >> .gitignore

# Hapus baris yang kosong dari .gitignore
sed -i '/^[[:space:]]*$/d' .gitignore

# Tambahkan semua perubahan ke dalam commit
git add .

# Commit perubahan dengan pesan
git commit -m "Commit otomatis: $(date)"

# Push perubahan ke GitHub
git push origin main
