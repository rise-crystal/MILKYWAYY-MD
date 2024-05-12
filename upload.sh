#!/bin/bash

# Tambahkan isi dari perintah ls ke dalam file .gitignore jika belum ada
ls -d --ignore=".gitignore" --ignore="node_modules" */ >> .gitignore

# Eksekusi git add untuk semua perubahan kecuali folder node_modules
git add . -- ':!node_modules'

# Lakukan commit dengan pesan yang lebih deskriptif
commit_message="Update: $(date)"
git commit -m "$commit_message"

# Tarik perubahan terbaru dari branch utama di remote repository
git pull origin main || { echo "Gagal menarik perubahan dari remote repository"; exit 1; }

# Dorong perubahan ke branch utama di remote repository
git push -u origin main || { echo "Gagal mendorong perubahan ke remote repository"; exit 1; }
