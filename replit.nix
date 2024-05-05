{ pkgs }: {
  dependencies = [
    pkgs.nodejs
    pkgs.ffmpeg
    pkgs.git
    pkgs.tesseract
  ];
}
