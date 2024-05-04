#!/bin/bash
pkg update && pkg upgrade -y
apt update && apt upgrade -y
pkg install nodejs -y
pkg install ffmpeg -y
pkg install git -y
pkg install tesseract -y
npm install
npm start
