# Blog and article authoring guide

Travel and coffee pages remain handwritten HTML. The shared classes below name
the visible result directly, so choosing a layout does not require grid
arithmetic or CSS experimentation.

## Start a travel blog

1. Copy `templates/travel-blog/index.html` to `travel_blogs/<name>/index.html`.
2. Replace the title, date, introduction, section headings, and body text.
3. Replace the canonical URL with the new article's clean directory URL.
4. Set `data-media-base` on the `media_loader.js` script to the original image
   folder URL. Keep `data-prefer-webp="true"` enabled.
5. Add the blog card to `travel/blog_data.js` using a trailing-slash URL.
6. Run `npm run check` and preview both desktop and mobile layouts.

Use the original JPEG/PNG filename in `data-filename`. The shared loader derives
the matching `webp/<name>.webp` URL for display and retains the original URL as
the fallback and full-resolution source. The popover previews the WebP and offers
**Open original** as a secondary action.

## Start a coffee article

Copy the existing coffee overview or review whose directory depth and page
structure match the new article. Keep its shared stylesheet, popover script, and
media loader paths, then replace the article content and media base. The image
layouts below work the same way in coffee and travel pages.

## Image widths

Use one width class on the element directly inside a `row`:

| Class | Visible width |
| --- | --- |
| `image-full` | Full row |
| `image-five-sixths` | Five-sixths of the row |
| `image-four-fifths` | Four-fifths of the row |
| `image-three-quarters` | Three-quarters of the row |
| `image-two-thirds` | Two-thirds of the row |
| `image-half` | Half of the row |
| `image-two-fifths` | Two-fifths of the row |
| `image-third` | One-third of the row |
| `image-quarter` | One-quarter of the row |

The fractions are the interface. The underlying percentages live in
`assets/css/site.css` and should not be copied into article HTML.

## Full-width image

```html
<div class="image main">
    <img class="image_overlay js-dynamic-image" data-filename="view.jpg" alt="Description" />
</div>
```

## One centered image

```html
<div class="row row-center">
    <div class="image-half">
        <span class="image fit">
            <img class="image_overlay js-dynamic-image" data-filename="view.jpg" alt="Description" />
        </span>
    </div>
</div>
```

Change `image-half` to another width class without adding spacer columns.

## Two equal images

```html
<div class="row">
    <div class="image-half">
        <span class="image fit">
            <img class="image_overlay js-dynamic-image" data-filename="left.jpg" alt="Description" />
        </span>
    </div>
    <div class="image-half">
        <span class="image fit">
            <img class="image_overlay js-dynamic-image" data-filename="right.jpg" alt="Description" />
        </span>
    </div>
</div>
```

## Three equal images

```html
<div class="row">
    <div class="image-third">
        <span class="image fit">
            <img class="image_overlay js-dynamic-image" data-filename="first.jpg" alt="Description" />
        </span>
    </div>
    <div class="image-third">
        <span class="image fit">
            <img class="image_overlay js-dynamic-image" data-filename="second.jpg" alt="Description" />
        </span>
    </div>
    <div class="image-third">
        <span class="image fit">
            <img class="image_overlay js-dynamic-image" data-filename="third.jpg" alt="Description" />
        </span>
    </div>
</div>
```

## Two centered images

```html
<div class="row row-center">
    <div class="image-third">
        <span class="image fit">
            <img class="image_overlay js-dynamic-image" data-filename="left.jpg" alt="Description" />
        </span>
    </div>
    <div class="image-third">
        <span class="image fit">
            <img class="image_overlay js-dynamic-image" data-filename="right.jpg" alt="Description" />
        </span>
    </div>
</div>
```

Each image occupies one-third of the row. `row-center` divides the remaining
space evenly on the left and right.

## Wrap text around an image

```html
<p>
    <span class="image image-two-fifths text-wrap-left">
        <img class="image_overlay js-dynamic-image" data-filename="view.jpg" alt="Description" />
    </span>
    Paragraph text wraps around the right side of the image.
</p>
<div class="clear-float"></div>
```

Use `text-wrap-right` to put the image on the right. Pair either class with an
explicit image-width class.

## Unique layouts

A page can still add a descriptive class and define it in a page-level
stylesheet or `<style>` block. Prefer a name based on its purpose, such as
`route-map` or `chapter-opening-photo`, instead of encoding unexplained numbers
in the HTML.
