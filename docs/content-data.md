# Updating site lists

The travel, project, and photography pages keep editable content in dedicated
data files. Rendering code lives separately and normally does not need to change
when an item is added.

## Add a travel blog card

Edit `travel/blog_data.js` and add an item to `items`:

```javascript
{
    title: "Trip title",
    titleLine2: "Optional second title line",
    date: "Month 1 - Month 10, 2026",
    image: "thumbnail.jpg",
    link: "../travel_blogs/trip-name/",
    description: "Short description shown on the travel page.",
    buttonText: "Full Story",
},
```

Omit `titleLine2` when the title fits on one line. The link must use the clean
trailing-slash article URL. Keep `image` set to the original JPEG/PNG filename;
the renderer displays its WebP counterpart and retains the original as fallback.

## Add a project

Edit `resume/project_data.js` and add an item to `items`:

```javascript
{
    title: "Project name",
    date: "Month 1, 2026",
    image: "project-image.png", // Use "" when no image is planned.
    webpImage: "webp/project-image.webp", // Omit when no WebP version is planned.
    link: "https://example.com/project-source",
    liveLink: "https://example.com/project", // Omit when no hosted version exists.
    description: "What the project does.",
    techStack: "How the project was built.",
    buttonText: "Source",
    liveButtonText: "Try it", // Required with liveLink.
},
```

Add only real projects. The optional `webpImage` field makes the renderer try that
file first and fall back to `image`. If neither file is available, the renderer
omits the image area instead of showing a broken image. Leave `image` empty when
no image is planned. Add `liveLink` and `liveButtonText` together when a
hosted project should have a second action beside its source link. The renderer
also handles an odd number of cards, so no blank layout item is needed.

## Add a photography collection

Edit `photography/photo_data.js` and add a collection:

```javascript
{
    name: "Collection name",
    photos: [
        {
            filename: "Location/photo.jpg",
            location: "City, Region",
            caption: "What the photograph shows.",
        },
    ],
},
```

Add collections to the beginning of `collections` so the newest collection
appears at the top of the Photography page. Add photos to `photos` in the order
they should appear in the carousel. Store originals in a location folder such as `Japan/photo.jpg` and WebP files in
its `webp` folder such as `Japan/webp/photo.webp`. Record only the original path
in `filename`; WebP display and original fallback are automatic. The shared
`imageBase` and `username` values apply to every collection. Photography image
areas use a consistent height capped at 82% of the viewport. Each image uses
90% of the frame width so black gutters remain visible on both sides, and
`object-fit: contain` keeps the full image uncropped. Mobile image areas use a
compact viewport-width height so captions stay nearby.

## Validate

Run this after editing any data file:

```bash
npm run check
```

The checks reject blank required fields, duplicate links or names, empty photo
collections, incorrect script order, and travel links that expose `.html`.
