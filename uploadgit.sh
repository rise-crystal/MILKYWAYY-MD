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

# Mendapatkan daftar file dan folder yang ada dalam direktori saat ini, kecuali folder .git dan node_modules
file_list=$(find . -not -path "./.git/*" -not -path "./node_modules/*")

# Iterasi melalui setiap file dan folder dalam daftar
while IFS= read -r entry; do
    # Memeriksa apakah file atau folder sudah ada dalam .gitignore
    if ! grep -qF "$entry" .gitignore; then
        # Jika tidak, tambahkan file atau folder ke .gitignore
        echo "$entry" >> .gitignore
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