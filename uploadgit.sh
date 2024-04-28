#!/bin/bash

# Tanggal hari ini
tanggal=$(date)

# Data history yang akan ditambahkan
data_history="# Perubahan pada: $tanggal"
echo "$data_history" >> .gitignore

# Mendapatkan daftar file yang ada dalam direktori saat ini
file_list=$(ls)

# Iterasi melalui setiap file dalam daftar
while IFS= read -r file; do
    # Memeriksa apakah file sudah ada dalam .gitignore
    if ! grep -q "^$file$" .gitignore; then
        # Jika tidak, tambahkan file ke .gitignore
        echo "$file" >> .gitignore
    fi
done <<< "$file_list"

# Hapus baris yang kosong dari .gitignore
sed -i '/^[[:space:]]*$/d' .gitignore

# Tambahkan semua perubahan ke dalam commit
git add .

# Commit perubahan dengan pesan
git commit -m "Commit otomatis: $tanggal"

# Push perubahan ke GitHub
git push origin main
