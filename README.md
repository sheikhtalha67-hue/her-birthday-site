# For My Sweety 🎂

A little animated birthday site, built section by section:

1. **Fire number reveal** — tap the number, it burns and reveals the new age
2. **Happy Birthday balloons** — floating balloon scene
3. **Sketchbook intro** — tap the notebook cover to open it
4. **Photo trail gallery** — black & white photos, tap/hover to bring them to color
5. **Polaroid board** — drag the polaroids anywhere you like
6. **Starfield finale** — floating photos drifting in a night sky, with a closing message

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Customizing

Almost everything you'll want to change lives in **`app/config.js`**:

```js
export const HER_NAME = "Sweety";
export const NICKNAMES = ["kuchu puchu", "pasandida aurat", "ladduu", "kaju katli", "meowww", "aimooo"];
export const AGE_FROM = 24;
export const AGE_TO = 25;
export const PHOTOS = ["/images/photo1.jpg", ...];
```

- **Swap photos**: drop new images into `public/images/` and update the `PHOTOS` array (keep the same file naming or update the paths).
- **Change nicknames/captions**: edit the `NICKNAMES` array — these are used as the polaroid captions in section 5.
- **Change the age**: update `AGE_FROM` / `AGE_TO`.
- **Closing message**: edit the text directly inside `components/Starfield.js` (`closingLine` / `closingSmall`).
- **Colors**: all colors are CSS variables at the top of `app/globals.css` (`--maroon`, `--gold`, `--cream`, etc.) — change them once and they update everywhere.

## Notes

- Currently loaded with your demo photos — swap in the real ones any time, the layout will just work with whatever you drop in `PHOTOS`.
- Built with plain Next.js + CSS (no extra animation libraries), so it's easy to read and tweak section by section — each section is its own file in `components/`.
- Works on mobile: photo hover-to-color also responds to tap, and the polaroid board supports touch dragging.
