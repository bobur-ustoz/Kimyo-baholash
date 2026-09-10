#!/bin/sh
# Bitta HTML faylga yig'adi (oldindan ko'rish / artifact uchun). Natija: dist/preview.html
cd "$(dirname "$0")"
mkdir -p dist
{
  echo '<title>Top Xodim</title>'
  echo '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&family=IBM+Plex+Sans:wght@400;600&display=swap">'
  echo '<style>'; cat css/app.css; echo '</style>'
  echo '<div id="app"><div class="page center muted" style="padding-top:80px">Yuklanmoqda…</div></div>'
  for f in config data store store-firebase auth match ui pdf app; do echo '<script>'; cat "js/$f.js"; echo '</script>'; done
} > dist/preview.html
echo "dist/preview.html: $(wc -c < dist/preview.html) bayt"
