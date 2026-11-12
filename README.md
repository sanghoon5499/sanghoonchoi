# Sanghoon Choi's personal website

This repository contains the source for [sanghoonchoi.com](https://sanghoonchoi.com/).
It began with the HTML5 UP Massively template and remains a static site with
manually authored HTML pages. Shared tooling should make those pages easier to
maintain without limiting page-specific layouts.

## Repository structure

- `index.html` is the home page.
- `assets/` contains the HTML5 UP styles, scripts, fonts, and shared site code.
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
5. Follow the existing `data-filename` and resource-prefix pattern for remote
   media until the shared media loader is introduced.
6. Run `npm run check`, preview the affected desktop and mobile layouts, and
   inspect the browser console before committing.

## Development checks

`npm run check` performs fast checks without changing files:

- JavaScript syntax for project-owned scripts
- one document shell per published HTML page
- duplicate HTML IDs
- missing local script and stylesheet dependencies
- unresolved merge-conflict markers

Draft and archived HTML under `unreleased/` and `travel_blogs/backburner/` is not
part of the default published-page check. The checks will expand as existing
markup issues are fixed in later cleanup iterations.
