#!/bin/bash

# Tanggal hari ini
tanggal=$(date)

# Data history yang akan ditambahkan
data_history="# Perubahan pada: $tanggal"

# Periksa apakah file .gitignore sudah ada
if [ -f .gitignore ]; then
  # Cek apakah history sudah ada di dalam file .gitignore
  if grep -q "$data_history" ".gitignore"; then
    echo "History sudah ada."
  else
    # Tambahkan history ke dalam file .gitignore
    echo "$data_history" >> .gitignore
    echo "History berhasil ditambahkan ke dalam file .gitignore."
  fi
else
  # Buat file .gitignore dan tambahkan history
  echo "$data_history" > .gitignore
  echo "File .gitignore baru telah dibuat dan history berhasil ditambahkan."
fi

# Tambahkan semua perubahan ke dalam commit
git add .

# Commit perubahan dengan pesan
git commit -m "Commit otomatis: $tanggal"

# Push perubahan ke GitHub
git push origin main
