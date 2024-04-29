#!/bin/bash

# Tanggal hari ini
tanggal=$(date)

# Data history yang akan ditambahkan
data_history="# Perubahan pada: $tanggal"

# Menambahkan data history ke dalam .gitignore
echo "$data_history" >> .gitignore

# Menambahkan garis pembatas
echo "########################################" >> .gitignore

# Mendapatkan daftar file yang ada dalam direktori saat ini, kecuali folder .git dan node_modules
file_list=$(find . -type f -not -path "./.git/*" -not -path "./node_modules/*")

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

# Menambahkan garis pembatas
echo "########################################" >> .gitignore

# Tambahkan semua perubahan ke dalam staging area
git add .

# Commit perubahan dengan pesan
git commit -m "Commit otomatis: $tanggal"

# Push perubahan ke GitHub
git push origin main
