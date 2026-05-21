# Carta para Genesis Sarahi 💚

Sitio web personal de scroll narrativo construido con React + Vite + Framer Motion + Tailwind.

## Stack

- Vite + React 19
- Framer Motion
- Tailwind CSS 3
- HTML5 audio nativo
- Despliegue: Docker (Nginx Alpine) en Dokploy

## Desarrollo

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173`.

## Build de producción

```bash
npm run build
```

Genera `dist/` con archivos estáticos.

## Assets que se deben proveer

Copiar a las rutas indicadas:

- `public/assets/fotos/01.webp` ... `15.webp` — 15 fotos de Genesis (~1200px ancho máx, .webp calidad 80, objetivo 150-300KB cada una)
- `public/assets/musica/fondo.mp3` — canción de fondo (128-192 kbps)
- `public/assets/musica/playlist-1.mp3` y `playlist-2.mp3` — canciones de la playlist
- Opcional: `public/assets/musica/cover-1.webp` y `cover-2.webp` — carátulas (si no, usa el SVG placeholder)

> **Nota:** los placeholders actuales son SVGs numerados (`01.svg` ... `15.svg`). Cuando subas las fotos reales en `.webp`, edita `src/data/fotos.js` y cambia la extensión `.svg` → `.webp`.

### Convertir fotos a .webp con cwebp (recomendado)

Instalar `cwebp` (parte de WebP tools de Google). Después en la carpeta con las fotos originales:

```powershell
Get-ChildItem *.jpg, *.jpeg, *.png | ForEach-Object {
  cwebp -q 80 -resize 1200 0 $_.FullName -o ("$($_.BaseName).webp")
}
```

Renombrar a `01.webp` ... `15.webp` y mover a `public/assets/fotos/`.

## Personalización rápida

- **Cualidades** (cosas que me gustan): `src/data/cualidades.js`
- **Lista de fotos y captions**: `src/data/fotos.js`
- **Playlist (títulos, artistas)**: `src/data/playlist.js`
- **Mensaje final y cita Loki**: `src/sections/FinalYPlaylist.jsx` y `src/sections/RazonesYLoki.jsx`
- **Nombre en la intro**: `src/sections/Intro.jsx` (constante `NOMBRE`)

## Despliegue en Dokploy

1. Sube el repo a Git (GitHub/GitLab).
2. En Dokploy: **New Application → Docker**.
3. Apunta al repositorio.
4. Dokploy detecta el `Dockerfile` automáticamente.
5. Build & Deploy.
6. Asigna dominio o usa el subdominio que Dokploy provee.

### Alternativa estática (sin Docker)

`npm run build` localmente y sube la carpeta `dist/` como sitio estático en Dokploy.

## Checklist antes de mandarle el link

- [ ] Las 15 fotos están en `.webp` y se cargan en orden
- [ ] `fondo.mp3` reproduce sin distorsión
- [ ] Las 2 canciones de la playlist reproducen
- [ ] Probado en iOS Safari y Android Chrome (touch funciona)
- [ ] Probado en 360px, 768px y 1280px de ancho
- [ ] La música de fondo se pausa al reproducir playlist y vuelve al pausarla
- [ ] El botón final dispara la animación de explosión
- [ ] `prefers-reduced-motion` activo desactiva tulipanes y partículas
- [ ] Sin errores 404 ni de consola en producción

## Accesibilidad

- Respeta `prefers-reduced-motion` del sistema
- Contraste WCAG AA verificado
- `alt` en todas las imágenes
- `aria-label` en botones sin texto
