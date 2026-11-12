import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function createClassList(initialClasses = []) {
    const classes = new Set(initialClasses);
    return {
        add: (name) => classes.add(name),
        contains: (name) => classes.has(name),
        remove: (name) => classes.delete(name),
    };
}

function createEventTarget(properties = {}) {
    const listeners = new Map();
    return {
        ...properties,
        addEventListener(type, listener) {
            const eventListeners = listeners.get(type) || [];
            eventListeners.push(listener);
            listeners.set(type, eventListeners);
        },
        dispatch(type, event = {}) {
            for (const listener of listeners.get(type) || []) {
                listener.call(this, { target: this, ...event });
            }
        },
    };
}

function runScript(relativePath, globals) {
    const source = readFileSync(path.join(repositoryRoot, relativePath), "utf8");
    vm.runInNewContext(source, globals, { filename: relativePath });
}

function testGenericHandler(relativePath) {
    const modalImage = createEventTarget({
        classList: createClassList(),
        src: "",
    });
    const caption = { textContent: "" };
    const modal = createEventTarget({
        querySelector: () => null,
        style: { display: "none" },
    });
    const image = createEventTarget({
        alt: "Test caption",
        src: "https://example.test/image.jpg",
    });
    const document = createEventTarget({
        getElementById(id) {
            return { myModal: modal, image_box: modalImage, caption }[id] || null;
        },
        querySelectorAll: (selector) => selector === "img.image_overlay" ? [image] : [],
    });

    runScript(relativePath, {
        document,
        setTimeout: (callback) => callback(),
    });

    document.dispatch("DOMContentLoaded");
    image.dispatch("click");

    assert.equal(modal.style.display, "flex", `${relativePath} should open the modal`);
    assert.equal(modalImage.src, image.src, `${relativePath} should display the selected image`);
    assert.equal(caption.textContent, image.alt, `${relativePath} should display the image caption`);

    document.dispatch("keydown", { key: "Escape" });
    assert.equal(modal.style.display, "none", `${relativePath} should close on Escape`);
}

function testPhotographyHandler() {
    const modalImage = createEventTarget({
        classList: createClassList(),
        clientHeight: 600,
        clientWidth: 800,
        src: "",
        style: {},
    });
    const caption = { textContent: "" };
    const modal = createEventTarget({
        clientHeight: 600,
        clientWidth: 800,
        querySelector: () => null,
        style: { display: "none" },
    });
    const body = createEventTarget({ style: {} });
    const document = createEventTarget({
        body,
        getElementById(id) {
            return { myModal: modal, image_box: modalImage, caption }[id] || null;
        },
    });
    const window = createEventTarget();
    const image = {
        alt: "Photography caption",
        classList: createClassList(["image_overlay"]),
        src: "https://example.test/photo.jpg",
    };

    runScript("photography/image_overlay_handler_photography_custom.js", {
        document,
        Math,
        setTimeout: (callback) => callback(),
        window,
    });

    document.dispatch("DOMContentLoaded");
    body.dispatch("click", { target: image });

    assert.equal(modal.style.display, "flex", "Photography handler should open the modal");
    assert.equal(modalImage.src, image.src, "Photography handler should display the selected image");
    assert.equal(caption.textContent, image.alt, "Photography handler should display the caption");

    document.dispatch("keydown", { key: "Escape" });
    assert.equal(modal.style.display, "none", "Photography handler should close on Escape");
}

testGenericHandler("assets/js/image_overlay_handler.js");
testGenericHandler("travel_blogs/image_overlay_handler.js");
testPhotographyHandler();

console.log("Modal handler tests passed.");
