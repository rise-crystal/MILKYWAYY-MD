#!/bin/bash

# Tambahkan file/folder yang sudah di-upload ke dalam .gitignore
echo "solid.txt" >> .gitignore

# Hapus baris yang kosong dari .gitignore
sed -i '/^[[:space:]]*$/d' .gitignore

# Tambahkan semua perubahan ke dalam commit
git add .

# Commit perubahan dengan pesan
git commit -m "Menambahkan solid.txt ke .gitignore secara otomatis"

# Push perubahan ke GitHub
git push origin main
