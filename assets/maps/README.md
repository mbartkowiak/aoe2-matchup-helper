# Custom map backgrounds

The app draws original schematic backgrounds for each map archetype by
default (no copyrighted game art involved).

If you'd like to use your own screenshots from the game instead (e.g. a
crop of the in-game minimap or loading screen from your own legally-owned
copy), drop an image here named after the archetype id:

- `open-land.jpg` (or `.png`)
- `closed-land.jpg`
- `forest-maze.jpg`
- `water-heavy.jpg`
- `hybrid.jpg`

Then in `js/maps.js`, add a `backgroundImage: 'assets/maps/open-land.jpg'`
field to that archetype's entry in `MAP_ARCHETYPES`, and update
`renderMap()` in `js/app.js` to draw an `<image>` element using that path
instead of (or underneath) the generated schematic. This is intentionally
left as a manual step so you control what art actually ships in your copy
of the project.
