#!/bin/bash

pkg update && pkg upgrade -y
apt update && apt upgrade -y
pkg install nodejs
pkg install ffmpeg
pkg install git
pkg install tesseract
npm install
npm start
