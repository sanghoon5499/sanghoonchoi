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
- `travel/` contains the travel index and its card data.
- `travel_blogs/` contains individually authored travel articles.
- `coffee/` contains coffee articles and reviews.
- `photography/` contains the photography page and carousel behavior.
- `resume/` contains the resume, project index, and project card data.
- `unreleased/` and `travel_blogs/backburner/` contain draft or archived pages.

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

1. Copy the existing page whose layout is closest to the new page.
2. Update the document title, heading, active navigation item, and relative paths.
3. Write the page content directly in HTML and customize its layout as needed.
4. For an indexed travel post or project, add its card data to the corresponding
   JavaScript file in `travel/` or `resume/`.
5. For remote media, add `js-dynamic-image` and `data-filename` to the media
   element, then load `assets/js/media_loader.js` with the page's
   `data-media-base` URL. Use `data-audio-base` when audio has a different base.
6. Pages with an image modal should load the shared
   `assets/js/image_overlay_handler.js`. Add `data-zoomable="true"` to the modal
   only when zoom and pan controls are needed.
7. Run `npm run check`, preview the affected desktop and mobile layouts, and
   inspect the browser console before committing.

## Development checks

`npm run check` performs fast checks without changing files:

- JavaScript syntax for project-owned scripts
- shared media-loader behavior for images, video, and audio
- modal open, caption, keyboard-close, and optional zoom behavior
- one document shell per published HTML page
- balanced common HTML elements and valid break markup
- duplicate HTML IDs
- missing local links, media, script, and stylesheet dependencies
- shared stylesheet, media-loader, and modal-handler contracts
- unresolved merge-conflict markers

Draft and archived HTML under `unreleased/` and `travel_blogs/backburner/` is not
part of the default published-page check. The checks will expand as existing
markup issues are fixed in later cleanup iterations.
