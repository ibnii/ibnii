# ibnii/ibnii — GitHub Profile

README profil GitHub `ibnii`. Desain mengikuti portofolio terminal di `../Portofolio`
(ibni.me): monokrom, JetBrains Mono, prompt terminal, dot-grid, foto 1-bit dither.

## Aset

| File | Isi |
| --- | --- |
| `README.md` | seluruh konten profil (markdown GitHub) |
| `hero.svg` | kartu hero 900×400 + portrait dither base64 |
| `scripts/preview.mjs` | render README + CSS mirip GitHub ke `.cache/preview.html` lalu buka browser |
| `scripts/make-dither.mjs` | generator portrait 1-bit, replika `src/ui/dither.js` portofolio |
| `.cache/` | output sementara generator (tidak di-commit) |

## Regenerate portrait di hero

Sumber foto: `../Portofolio/public/images/img_profile.png` (433×577).

```bash
node scripts/make-dither.mjs                  # sumber & target default
node scripts/make-dither.mjs foto.png hero.svg
```

Script memakai ffmpeg (raw RGB → gray), menerapkan luma Rec.709 + Bayer 4×4
`values 232 / 8`, lalu menyuntikkan PNG 2× (nearest) sebagai base64 ke `hero.svg`.
Placeholder awal: `href="data:image/png;base64,__PORTRAIT_BASE64__"` atau
data URI yang sudah ada (aman dijalankan berulang).

## Catatan

- GitHub tidak menerima `<svg>` inline di README; semua visual lewat `<img src="*.svg">`.
- Font eksternal tidak dimuat di dalam SVG-as-`<img>`; urutan fallback:
  JetBrains Mono → ui-monospace → SF Mono → Menlo → Consolas.
- Animasi memakai SMIL (bukan CSS) agar stabil di Chrome/Safari/Firefox.
- GitHub memaksa semua `<a>` berwarna biru; baris sosial memakai `<kbd>` karena aturan
  GitHub memberi `kbd` warna `--fgColor-default` sendiri, sehingga tetap monokrom.
  Label section memakai `<samp>`; jangan ganti ke `<span style>` (atribut style dibuang).
- Token warna: bg `#0a0a0a`, ink `#e8e8e3`, ink-dim `#b3b3ad`, ink-muted `#8c8c86`,
  line `#262626`.
- Jangan menaruh NIM/data pribadi di aset publik.
