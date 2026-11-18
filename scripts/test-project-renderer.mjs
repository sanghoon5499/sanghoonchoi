import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const renderedCards = [];

function createImage() {
    const listeners = new Map();

    return {
        alt: "",
        decoding: "",
        loading: "",
        src: "",
        addEventListener(type, listener) {
            listeners.set(type, listener);
        },
        dispatch(type) {
            const listener = listeners.get(type);
            if (listener) {
                listeners.delete(type);
                listener();
            }
        },
    };
}

function createCard() {
    const imageLink = {
        href: "",
        removed: false,
        remove() {
            this.removed = true;
        },
    };
    const title = { href: "", textContent: "" };
    const nodes = {
        ".project-image": createImage(),
        ".date": { textContent: "" },
        ".project-title": title,
        ".project-desc": { textContent: "" },
        ".project-tech": { textContent: "" },
        ".project-button": { href: "", textContent: "" },
        "a.image": imageLink,
    };

    return {
        imageLink,
        nodes,
        querySelector: (selector) => nodes[selector] || null,
        querySelectorAll: (selector) => selector === ".project-link" ? [title, imageLink] : [],
    };
}

const container = {
    hasOddCards: false,
    appendChild(card) {
        renderedCards.push(card);
    },
    classList: {
        toggle(name, enabled) {
            if (name === "has-odd-cards") {
                container.hasOddCards = enabled;
            }
        },
    },
};
const template = {
    content: {
        cloneNode() {
            return createCard();
        },
    },
};
let domContentLoaded;
const document = {
    addEventListener(type, listener) {
        if (type === "DOMContentLoaded") {
            domContentLoaded = listener;
        }
    },
    getElementById(id) {
        return { "projects-container": container, "project-template": template }[id] || null;
    },
};
const window = {};

for (const relativePath of ["resume/project_data.js", "resume/projects.js"]) {
    const source = readFileSync(path.join(repositoryRoot, relativePath), "utf8");
    vm.runInNewContext(source, { document, window }, { filename: relativePath });
}
domContentLoaded();

assert.equal(renderedCards.length, 4, "All four project cards should render");
assert.equal(renderedCards[0].nodes[".project-title"].textContent, "Spotify Info");
assert.equal(renderedCards[0].imageLink.removed, false, "Spotify Info should reserve its image area when media exists");
assert.equal(
    renderedCards[0].nodes[".project-image"].src,
    "https://storage.googleapis.com/sc-other/projects/webp/spotify.webp",
    "Spotify Info should prefer its configured WebP image",
);
assert.equal(renderedCards[0].nodes[".project-image"].loading, "lazy");
assert.equal(renderedCards[0].nodes[".project-image"].decoding, "async");
renderedCards[0].nodes[".project-image"].dispatch("error");
assert.equal(
    renderedCards[0].nodes[".project-image"].src,
    "https://storage.googleapis.com/sc-other/projects/spotify.png",
    "Spotify Info should fall back to its configured PNG image",
);
assert.equal(renderedCards[0].imageLink.removed, false, "The PNG fallback should retain the image area");
renderedCards[0].nodes[".project-image"].dispatch("error");
assert.equal(renderedCards[0].imageLink.removed, true, "Missing placeholder files should leave the card image-free");
assert.equal(
    renderedCards[0].nodes[".project-button"].href,
    "https://github.com/sanghoon5499/spotify_info",
);
assert.equal(renderedCards[1].imageLink.removed, false, "Projects with images should retain them");
assert.match(renderedCards[1].nodes[".project-image"].src, /cafe_logger_usage\.JPG$/);
assert.equal(container.hasOddCards, false, "Four cards should fill the two-column grid");

console.log("Project renderer tests passed.");
