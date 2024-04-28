#!/bin/bash

# Tambahkan semua perubahan ke dalam commit
git add .

# Commit perubahan dengan pesan
git commit -m "Commit otomatis: $(date)"

# Push perubahan ke GitHub
git push origin main
