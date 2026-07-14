# malabaridiyirachi.com

The Malabar Idiyirachi store. A static site — no server, no database. Product
data lives in JSON files, and a small build script turns it into the finished
website. GitHub Actions builds and deploys it automatically on every push.

## How to change things (the short version)

Everything below ends the same way: **commit and push to `main`, and the site
updates itself in about a minute.** Check the "Actions" tab on GitHub if
something doesn't appear — a red ✗ means the build found a mistake and the log
tells you what it was (the live site stays untouched until the build is green).

### Change a price or any product text

Edit `src/data/products.json`. Each product is one block — name, tagline,
prices, description, ingredients. Save and push.

### Add photos to a product

Drop the image files into that product's folder, e.g.
`images/products/idiyirachi/`. That's it — no lists to update. Notes:

- Photos show in **filename order**, so name them `01-front.jpg`,
  `02-open-jar.jpg`, `03-closeup.jpg`, … The **first one** is the main photo
  used on cards, Google and WhatsApp previews. The rest become the swipeable
  photo carousel on the product page.
- Any size is fine (big phone photos included) — the build resizes and
  compresses them automatically. Best results with photos at least 1200px wide.
- To reuse a photo that already lives in `images/site/` instead of copying the
  file, add its path to that product's `"photos"` list in
  `src/data/products.json`. Those show after the folder's own photos.

### Change the home page photos

All of them are listed in `src/data/site.json` — swap a path and push, no code
to touch:

- `"images"` — the hero background (`heroWide` for computers, `heroTall` for
  phones), the photo floating in the hero (`heroFigure`), and the pictures
  used by the story, quote, and "How to eat it" sections.
- `"gallery"` — the **"From our kitchen" carousel**. Each entry is one photo
  and its caption; they appear in the order listed. Add, remove or reorder
  freely.
- `"certs"` — the three badges in the "Our promise" band, which also appear
  under the Add-to-cart button on every product page.
- `"marquee"` — the words in the scrolling strip.
- `"usage"` / `"quote"` — the wording in those two sections.

The share picture used by WhatsApp and Google is generated from
`images/site/wideheroimage.jpeg`.

### Add a whole new product

1. Create a folder `images/products/your-new-slug/` and put at least one photo in it.
2. Copy any product block in `src/data/products.json`, paste it, and edit:
   `slug` must match the folder name (lowercase-with-dashes), category must be
   `dried-meats`, `pickles` or `veg`.
3. Push. The product page, sitemap entry and everything else are generated.

### Add the FSSAI number, Google Analytics, story text, FAQ…

All in `src/data/site.json`. The FSSAI number and Analytics ID are empty
strings right now — paste the real values in and push. Testimonials work the
same way: add entries like
`{ "text": "...", "name": "Anu", "place": "Kochi" }` to the `testimonials`
list and the section appears on the home page.

### Change the Kerala shipping rate

Set `shipping.keralaFlat` in `src/data/site.json`. The top banner and the
delivery section both read that one number — but the **FAQ answer still spells
the rate out in words**, so edit that FAQ text too or the two will disagree.

## Preview on your computer

```bash
npm install --ignore-scripts   # once
npm run build                  # builds into dist/
npm run serve                  # opens a local server for dist/
```

(If `npm run serve` doesn't work, `python3 -m http.server -d dist 8080` does
the same job.)

## How orders work

There is no payment on the site. The customer builds a cart, types their
address at `/checkout/`, and the "Send order on WhatsApp" button opens
WhatsApp with the full order + delivery address pre-typed, addressed to the
number in `src/data/site.json`. You confirm and take payment in the chat.

## One-time GitHub setting

The repo must have **Settings → Pages → Source** set to **"GitHub Actions"**
(not "Deploy from a branch"). This was part of the v2 rebuild — if Pages ever
looks stuck, check that setting first.
