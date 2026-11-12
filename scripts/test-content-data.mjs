import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadData(relativePath) {
    const window = {};
    const source = readFileSync(path.join(repositoryRoot, relativePath), "utf8");
    vm.runInNewContext(source, { window }, { filename: relativePath });
    return window.siteContent;
}

function requireText(value, field) {
    assert.equal(typeof value, "string", `${field} must be text`);
    assert.ok(value.trim(), `${field} must not be blank`);
}

function requireUnique(items, field, section) {
    const values = items.map((item) => item[field]);
    assert.equal(new Set(values).size, values.length, `${section} ${field} values must be unique`);
}

function requireScriptOrder(pagePath, dataScript, rendererScript) {
    const page = readFileSync(path.join(repositoryRoot, pagePath), "utf8");
    const dataPosition = page.indexOf(`src="${dataScript}"`);
    const rendererPosition = page.indexOf(`src="${rendererScript}"`);

    assert.ok(dataPosition >= 0, `${pagePath} must load ${dataScript}`);
    assert.ok(rendererPosition > dataPosition, `${pagePath} must load data before its renderer`);
}

function requireWebpPreference(pagePath) {
    const page = readFileSync(path.join(repositoryRoot, pagePath), "utf8");
    assert.match(
        page,
        /<script[^>]+media_loader\.js[^>]+data-prefer-webp="true"[^>]*>/,
        `${pagePath} must prefer WebP through the shared media loader`,
    );
}

function requireOriginalImageName(filename, field) {
    assert.ok(!filename.endsWith(".webp"), `${field} must retain the original fallback filename`);
}

const travel = loadData("travel/blog_data.js").travelBlogs;
requireText(travel.imageBase, "travel imageBase");
assert.ok(travel.items.length > 0, "travel items must not be empty");
for (const [index, blog] of travel.items.entries()) {
    for (const field of ["title", "date", "image", "link", "description", "buttonText"]) {
        requireText(blog[field], `travel item ${index} ${field}`);
    }
    requireOriginalImageName(blog.image, `travel item ${index} image`);
    if (blog.titleLine2 !== undefined) {
        requireText(blog.titleLine2, `travel item ${index} titleLine2`);
    }
}
requireUnique(travel.items, "link", "travel");
requireScriptOrder("travel/index.html", "../assets/js/media_loader.js", "blog_data.js");
requireScriptOrder("travel/index.html", "blog_data.js", "travel_blogs.js");

const projects = loadData("resume/project_data.js").projects;
requireText(projects.imageBase, "project imageBase");
assert.ok(projects.items.length > 0, "project items must not be empty");
for (const [index, project] of projects.items.entries()) {
    for (const field of ["title", "date", "image", "link", "description", "techStack", "buttonText"]) {
        requireText(project[field], `project item ${index} ${field}`);
    }
}
requireUnique(projects.items, "title", "project");
requireScriptOrder("resume/index.html", "project_data.js", "projects.js");

const photography = loadData("photography/photo_data.js").photography;
requireText(photography.imageBase, "photography imageBase");
requireText(photography.username, "photography username");
assert.ok(photography.collections.length > 0, "photo collections must not be empty");
for (const [collectionIndex, collection] of photography.collections.entries()) {
    requireText(collection.name, `photo collection ${collectionIndex} name`);
    assert.ok(collection.photos.length > 0, `photo collection ${collectionIndex} must contain photos`);
    for (const [photoIndex, photo] of collection.photos.entries()) {
        for (const field of ["filename", "location", "caption"]) {
            requireText(photo[field], `photo collection ${collectionIndex} item ${photoIndex} ${field}`);
        }
        requireOriginalImageName(
            photo.filename,
            `photo collection ${collectionIndex} item ${photoIndex} filename`,
        );
    }
}
requireUnique(photography.collections, "name", "photo collection");
requireScriptOrder("photography/index.html", "../assets/js/media_loader.js", "photo_data.js");
requireScriptOrder("photography/index.html", "photo_data.js", "photography.js");

for (const pagePath of [
    "coffee/index.html",
    "coffee/Overview/index.html",
    "coffee/Overview/kr/index.html",
    "coffee/reviews/rancilio_silvia/index.html",
    "photography/index.html",
    "templates/travel-blog/index.html",
    "travel/index.html",
    "travel_blogs/SF_LA/index.html",
    "travel_blogs/japan_2025/index.html",
    "travel_blogs/korea_2025/index.html",
    "travel_blogs/montreal/index.html",
]) {
    requireWebpPreference(pagePath);
}

const travelRenderer = readFileSync(path.join(repositoryRoot, "travel/travel_blogs.js"), "utf8");
assert.match(travelRenderer, /siteMedia\.setImageSource\(image, originalImageUrl\)/);

const photoRenderer = readFileSync(path.join(repositoryRoot, "photography/photography.js"), "utf8");
assert.match(photoRenderer, /siteMedia\.setImageSource\(image, originalImageUrl\)/);
assert.match(photoRenderer, /visibleImage\.dataset\.originalSrc \|\| visibleImage\.src/);

const styles = readFileSync(path.join(repositoryRoot, "assets/css/site.css"), "utf8");
assert.match(styles, /\.posts\.has-odd-cards::after/, "Odd card grids need a CSS filler cell");

console.log("Content data tests passed.");
