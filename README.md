# Sanghoon Choi's personal website

This repository contains the source for [sanghoonchoi.com](https://sanghoonchoi.com/).
It began with the HTML5 UP Massively template and remains a static site with
manually authored HTML pages. Shared tooling should make those pages easier to
maintain without limiting page-specific layouts.

## Repository structure

- `index.html` is the home page.
- `assets/` contains HTML5 UP files plus shared site styles and behavior.
  `assets/css/main.css` remains template-owned; custom styles belong in
  `assets/css/site.css`.
- `travel/` contains the travel index, editable `blog_data.js`, and its renderer.
- `travel_blogs/` contains one directory per travel article; each directory's
  `index.html` provides the article's clean trailing-slash URL.
- `coffee/` contains coffee articles and reviews.
- `photography/` contains editable `photo_data.js` and carousel behavior.
- `resume/` contains the resume, editable `project_data.js`, and its renderer.
- `templates/` contains starter HTML that remains fully editable after copying.
- `docs/blog-authoring.md` contains copyable, human-readable layouts for travel
  blogs and coffee articles.
- `docs/content-data.md` explains how to add travel cards, projects, and photo
  collections without changing rendering code.
- `unreleased/` contains draft pages.

## Local workflow

The repository has no runtime dependencies. Run the development checks with
Node.js 18 or newer:

```bash
npm run check
```

Preview the site from the repository root with a loopback-only server:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000` in a browser. Stop the server with `Ctrl+C`.

## Adding a page

For a travel blog, start with `templates/travel-blog/index.html` and use the copyable
layouts in `docs/blog-authoring.md`. Every width and alignment option is named by
its visible result; article HTML does not require grid calculations.

For another page type:

1. Copy the existing page whose layout is closest to the new page.
2. Update the document title, heading, active navigation item, and relative paths.
3. Write the page content directly in HTML and customize its layout as needed.
4. For an indexed travel post, project, or photo collection, add the item to
   the dedicated data file described in `docs/content-data.md`. Rendering files
   normally do not need to change.
5. For remote media, add `js-dynamic-image`, keep the original JPEG/PNG name
   in `data-filename`, load `assets/js/media_loader.js` with the page's original `data-media-base`
   URL, and set `data-prefer-webp="true"`. The loader displays the corresponding
   `webp/<name>.webp` file and falls back to the original automatically. Use
   `data-audio-base` when audio has a different base.
6. Pages with an image modal should load the shared
   `assets/js/image_overlay_handler.js`. Add `data-zoomable="true"` to the modal
   only when zoom and pan controls are needed.
7. Run `npm run check`, preview the affected desktop and mobile layouts, and
   inspect the browser console before committing.

## Development checks

`npm run check` performs fast checks without changing files:

- JavaScript syntax for project-owned scripts
- shared media-loader behavior for WebP display, original fallback, video, and audio
- modal use of original image files with keyboard, focus, and optional zoom behavior
- semantic photography controls and embedded content labels
- one document shell per published HTML page
- balanced common HTML elements and valid break markup
- duplicate HTML IDs and class attributes
- missing local links, media, script, and stylesheet dependencies
- clean travel URLs, canonical links, and legacy redirect pages
- required and unique travel, project, and photography data
- removal of obsolete template demo pages and controls
- shared stylesheet, media-loader, and modal-handler contracts
- unresolved merge-conflict markers

Draft HTML under `unreleased/` is not part of the default published-page check. The checks will expand as existing
markup issues are fixed in later cleanup iterations.

## Credit

The site design is based on [Massively](https://html5up.net/massively) by
[HTML5 UP](https://html5up.net/), used under the Creative Commons Attribution
3.0 license. Original license notices remain in the vendor source files.
