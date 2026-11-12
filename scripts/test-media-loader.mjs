import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const loaderPath = "assets/js/media_loader.js";

function createClassList(classes) {
    const values = new Set(classes);
    return { contains: (name) => values.has(name) };
}

function createMediaElement({ classes, filename, tagName }) {
    let loadCount = 0;
    const listeners = new Map();
    return {
        classList: createClassList(classes),
        dataset: { filename },
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
        get loadCount() {
            return loadCount;
        },
        load() {
            loadCount += 1;
        },
        src: "",
        tagName,
    };
}

const image = createMediaElement({
    classes: ["js-dynamic-image"],
    filename: "photo.jpg",
    tagName: "IMG",
});
const video = createMediaElement({
    classes: ["js-dynamic-image"],
    filename: "clip.mp4",
    tagName: "VIDEO",
});
const audio = createMediaElement({
    classes: [],
    filename: "",
    tagName: "AUDIO",
});
const audioSource = createMediaElement({
    classes: ["js-dynamic-audio"],
    filename: "voiceover.mp3",
    tagName: "SOURCE",
});
audioSource.closest = (selector) => selector === "audio, video" ? audio : null;

let domContentLoaded;
const document = {
    currentScript: {
        dataset: {
            audioBase: "https://media.example.test/audio/",
            mediaBase: "https://media.example.test/images/",
            preferWebp: "true",
        },
    },
    addEventListener(type, listener) {
        if (type === "DOMContentLoaded") {
            domContentLoaded = listener;
        }
    },
    querySelectorAll() {
        return [image, video, audioSource];
    },
};

const window = {};
const source = readFileSync(path.join(repositoryRoot, loaderPath), "utf8");
vm.runInNewContext(source, { document, window }, { filename: loaderPath });
domContentLoaded();

assert.equal(image.src, "https://media.example.test/images/webp/photo.webp");
assert.equal(image.dataset.originalSrc, "https://media.example.test/images/photo.jpg");
assert.equal(image.loading, "lazy", "Images should load only as they approach the viewport");
assert.equal(image.decoding, "async", "Image decoding should not block rendering");
assert.equal(
    window.siteMedia.getWebpUrl("https://media.example.test/path/photo.JPG?size=large"),
    "https://media.example.test/path/webp/photo.webp?size=large",
);
image.dispatch("error");
assert.equal(image.src, "https://media.example.test/images/photo.jpg", "Images should fall back to the original");
assert.equal(video.src, "https://media.example.test/images/clip.mp4");
assert.equal(video.preload, "metadata", "Videos should avoid eager full downloads");
assert.equal(video.loadCount, 1, "Videos should reload after their source changes");
assert.equal(audioSource.src, "https://media.example.test/audio/voiceover.mp3");
assert.equal(audio.loadCount, 1, "Parent audio elements should reload after source changes");

console.log("Media loader tests passed.");
