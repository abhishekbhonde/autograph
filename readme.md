# Autograph

Type your name, watch it signed by an animated pen, and share it in a public Hall of Fame.

## Features

- [x] Handwritten-style signature drawn stroke by stroke
- [x] Pen physics: line gets thicker in curves and thinner on fast strokes
- [x] Controls for ink colour, thickness, slant, shakiness and speed
- [x] Download as SVG or transparent PNG
- [ ] Share link for your signature
- [ ] Hall of Fame: a public wall where everyone's signatures replay

## How it works

1. The name is turned into pen strokes using a single-stroke script font (Hershey).
2. A small physics model gives every point on the stroke a speed, pressure and width.
3. A canvas draws the strokes over time to make the animation.
4. The same data is exported as SVG or PNG.

The result depends only on the name, a seed and the slider values. So a Hall of Fame entry only needs to store those few values, not the whole drawing, and the page replays it on load.

## Tech stack

| Part | Tool |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript, Canvas |
| Stroke font | Hershey Script (`hersheytext` on npm, MIT) |
| Hall of Fame (planned) | Supabase (Postgres and REST API) |
| Hosting | Vercel or GitHub Pages |

## Run it

```bash
python3 -m http.server 8000
# open http://localhost:8000/signature.html
```

## Files

| File | What it is |
|---|---|
| `signature.html` | The app |
| `ARCHITECTURE.md` | Detailed design, pen-physics maths, limitations |
| `smoke.js` | Quick test (`npm i jsdom`, then `node smoke.js`) |

## Hall of Fame plan

One table, `signatures`:

| Column | Example |
|---|---|
| `id` | auto |
| `name` | Alex Morgan |
| `seed` | 3 |
| `settings` | `{ "pen": 1.3, "slant": 6, "ink": "#14213d" }` |
| `version` | 1 |
| `created_at` | timestamp |

- Keep `version` so old entries still replay the same way if the code changes.
- Add basic rate limiting and a name filter before going public.

## Next steps

1. Add a **Share** button that saves an entry and returns a link.
2. Build the Hall of Fame page: a grid of cards that replay when they scroll into view.
3. Add the rate limit and name filter.
4. Deploy.# autograph
