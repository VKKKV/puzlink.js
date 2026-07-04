# puzlink.js

Tool to find patterns among sets of words. Use it online at [cjquines.com/puzlink](https://cjquines.com/puzlink/).

Inspired by cosmologicon's [puzlink](https://github.com/cosmologicon/puzlink), rdeits's [Collective.jl](https://github.com/rdeits/Collective.jl), and obijywk's [fork of the latter](https://github.com/obijywk/Collective.jl).

## Usage

Install with `npm install puzlink`. This is an ESM only library.

```ts
import { Puzlink } from "puzlink";

const puzlink = await Puzlink.download();

puzlink.link(`
  BATED, TANK, BUSINESS, ETC, OVER, ELVIS, CAR, COW, MARS, PARIS, AIRLINES
`);
// {
//   name: "10/11 can insert h",
//   score: 30.8,
//   description: [
//     "bated insert h = bathed",
//     "tank insert h = thank",
//     "etc insert h = etch",
//     "over insert h = hover",
//     "elvis insert h = elvish",
//     "car insert h = char",
//     "cow insert h = chow",
//     "mars insert h = marsh",
//     "paris insert h = parish, pharis",
//     "airlines insert h = hairlines"
//   ],
// },
// ...
```

## Why?

puzlink used to be online on [puz.link](https://puz.link/), but the website has been down for maintenance for a while now. While I've used the library locally, nothing can beat the convenience of a web app. I'm a believer in client-side solving tools, so I wanted to make it run client-side too; that's partly why I wrote [cromulence](https://blog.cjquines.com/post/cromulence/) a year ago.

Collective.jl is a huge design influence. I liked the idea of applying the binomial distribution to boolean word properties, which I used for computing many linker probabilities. A lot of the test cases in `scripts/evals` are from Collective.jl too.

## Development

Node 22 required. Clone the repo and run `npm install`. Some ways to contribute:

1. Add an eval:

   ```sh
   $ npm run test:evals -- --add name_of_puzzle
   #                    ^^ note the dashes
   $ npm run test:evals -- --watch
   ```

   Then, edit `scripts/evals/name_of_puzzle.ts`. See the other examples in that folder for details. The `test:evals` script has several other flags; run it with `--help` for more info.

2. Add a category. Edit `src/data/categories/txt/nameOfCategory.txt`. Then `npm run build:categories`, and edit `src/data/categories.ts`.

   Adding tests would be nice too. You can add a unit test by running `npm run test:watch`, and editing `src/features/substring.test.ts`. You can also add an eval, as above.

3. Add a feature. See existing feature implementations in `src/features`. Run `npm run build:cache` before running evals.

4. Fiddle with the app. To set up the app, run `npm run build:tsc` from the root, then `cd app` and `npm install`. From there, `npm run dev` to start the dev server.

   You will need to rerun `npm run build:tsc` every time you make a change not in the app.
