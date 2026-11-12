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
    image: "project-image.jpg",
    link: "https://example.com/project",
    description: "What the project does.",
    techStack: "How the project was built.",
    buttonText: "View Project",
},
```

Add only real projects. The renderer handles an odd number of cards, so no blank
placeholder item is needed.

## Add a photography collection

Edit `photography/photo_data.js` and add a collection:

```javascript
{
    name: "Collection name",
    photos: [
        {
            filename: "photo.jpg",
            location: "City, Region",
            caption: "What the photograph shows.",
        },
    ],
},
```

Add more objects to `photos` in the order they should appear in the carousel.
The shared `imageBase` and `username` values apply to every collection. Keep each
`filename` on its original extension; WebP display and original fallback are
automatic.

## Validate

Run this after editing any data file:

```bash
npm run check
```

The checks reject blank required fields, duplicate links or names, empty photo
collections, incorrect script order, and travel links that expose `.html`.
