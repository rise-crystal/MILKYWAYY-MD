#!/bin/bash

# Konfigurasi Git untuk menonaktifkan konversi otomatis line ending
git config --global core.autocrlf false

# Tanggal hari ini
tanggal=$(date)

# Data history yang akan ditambahkan
data_history="# Perubahan pada: $tanggal"

# Menambahkan data history ke dalam .gitignore
if ! grep -qF "$data_history" .gitignore; then
    echo "$data_history" >> .gitignore
fi

# Menambahkan garis pembatas
echo "########################################" >> .gitignore

# Mendapatkan daftar file yang ada dalam direktori saat ini, kecuali folder .git dan node_modules
file_list=$(file_list=$(find . -type f))

# Iterasi melalui setiap file dalam daftar
while IFS= read -r file; do
    # Memeriksa apakah file sudah ada dalam .gitignore
    if ! grep -qF "$file" .gitignore; then
        # Jika tidak, tambahkan file ke .gitignore
        echo "$file" >> .gitignore
    fi
done <<< "$file_list"

# Hapus baris yang kosong dari .gitignore
sed -i '/^[[:space:]]*$/d' .gitignore

# Menambahkan garis pembatas
echo "########################################" >> .gitignore

# Tambahkan semua perubahan ke dalam staging area
git add .

# Commit perubahan dengan pesan
git commit -m "Commit otomatis: $tanggal"

# Push perubahan ke GitHub
git push origin main