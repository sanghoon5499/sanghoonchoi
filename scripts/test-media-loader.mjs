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
    return {
        classList: createClassList(classes),
        dataset: { filename },
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

const source = readFileSync(path.join(repositoryRoot, loaderPath), "utf8");
vm.runInNewContext(source, { document }, { filename: loaderPath });
domContentLoaded();

assert.equal(image.src, "https://media.example.test/images/photo.jpg");
assert.equal(video.src, "https://media.example.test/images/clip.mp4");
assert.equal(video.loadCount, 1, "Videos should reload after their source changes");
assert.equal(audioSource.src, "https://media.example.test/audio/voiceover.mp3");
assert.equal(audio.loadCount, 1, "Parent audio elements should reload after source changes");

console.log("Media loader tests passed.");
