#!/bin/bash

# Tambahkan isi dari perintah ls ke dalam file .gitignore jika belum ada
ls -d --ignore=".gitignore" --ignore="node_modules" */ >> .gitignore

# Eksekusi git add untuk semua perubahan kecuali folder node_modules
git add . -- ':!node_modules'

# Lakukan commit dengan pesan yang berisi tanggal dan waktu saat ini
commit_message=$(date)
git commit -m "$commit_message"

# Tarik perubahan terbaru dari branch utama di remote repository
git pull origin main

# Dorong perubahan ke branch utama di remote repository
git push -u origin main
