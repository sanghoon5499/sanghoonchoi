import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const handlerPath = "assets/js/image_overlay_handler.js";

function createClassList() {
    const classes = new Set();
    return {
        add: (name) => classes.add(name),
        contains: (name) => classes.has(name),
        toggle(name, force) {
            if (force) {
                classes.add(name);
            } else {
                classes.delete(name);
            }
        },
    };
}

function createEventTarget(properties = {}) {
    const attributes = new Map();
    const listeners = new Map();
    const element = {
        attributes,
        children: [],
        classList: createClassList(),
        dataset: {},
        focused: false,
        style: {},
        ...properties,
        addEventListener(type, listener) {
            const handlers = listeners.get(type) || [];
            handlers.push(listener);
            listeners.set(type, handlers);
        },
        appendChild(child) {
            this.children.push(child);
            return child;
        },
        dispatch(type, event = {}) {
            for (const listener of listeners.get(type) || []) {
                listener.call(this, {
                    preventDefault() {},
                    target: this,
                    ...event,
                });
            }
        },
        focus() {
            this.focused = true;
        },
        removeAttribute(name) {
            if (name === "src") {
                this.src = "";
            }
            attributes.delete(name);
        },
        setAttribute(name, value) {
            attributes.set(name, value);
        },
    };
    return element;
}

function createEnvironment() {
    let domContentLoaded;
    const body = createEventTarget({ style: { overflow: "" } });
    const window = createEventTarget();
    const document = {
        body,
        addEventListener(type, listener) {
            if (type === "DOMContentLoaded") {
                domContentLoaded = listener;
            }
        },
        createElement(tagName) {
            const element = createEventTarget({ tagName: tagName.toUpperCase() });
            if (tagName === "dialog") {
                element.open = false;
                element.showModal = function () {
                    this.open = true;
                };
                element.close = function () {
                    this.open = false;
                    this.dispatch("close");
                };
            }
            if (tagName === "img") {
                element.clientHeight = 600;
                element.clientWidth = 800;
                element.src = "";
            }
            return element;
        },
    };

    const source = readFileSync(path.join(repositoryRoot, handlerPath), "utf8");
    vm.runInNewContext(source, { document, Math, window }, { filename: handlerPath });
    domContentLoaded();

    const dialog = body.children[0];
    const content = dialog.children[0];
    const [closeButton, stage, footer] = content.children;
    const preview = stage.children[0];
    const [caption, originalLink] = footer.children;
    stage.clientHeight = 700;
    stage.clientWidth = 1000;

    const sourceImage = createEventTarget({
        alt: "Test caption",
        currentSrc: "https://example.test/webp/image.webp",
        dataset: { originalSrc: "https://example.test/image.jpg" },
        src: "https://example.test/webp/image.webp",
    });
    sourceImage.closest = (selector) => selector === "img.image_overlay" ? sourceImage : null;

    return {
        body,
        caption,
        closeButton,
        dialog,
        originalLink,
        preview,
        sourceImage,
    };
}

function testOpenAndClose() {
    const environment = createEnvironment();
    environment.body.dispatch("click", { target: environment.sourceImage });

    assert.equal(environment.dialog.open, true, "Popover should open");
    assert.equal(environment.preview.src, environment.sourceImage.currentSrc, "Popover should preview WebP");
    assert.equal(environment.originalLink.href, environment.sourceImage.dataset.originalSrc);
    assert.equal(environment.caption.textContent, environment.sourceImage.alt);
    assert.equal(environment.body.style.overflow, "hidden");
    assert.equal(environment.closeButton.focused, true);

    environment.closeButton.dispatch("click");
    assert.equal(environment.dialog.open, false, "Close button should close the popover");
    assert.equal(environment.preview.src, "", "Closing should release the preview image");
    assert.equal(environment.body.style.overflow, "");
    assert.equal(environment.sourceImage.focused, true);
}

function testPinchZoom() {
    const environment = createEnvironment();
    environment.body.dispatch("click", { target: environment.sourceImage });

    environment.preview.dispatch("touchstart", {
        touches: [{ clientX: 0, clientY: 0 }, { clientX: 100, clientY: 0 }],
    });
    environment.preview.dispatch("touchmove", {
        touches: [{ clientX: 0, clientY: 0 }, { clientX: 200, clientY: 0 }],
    });

    assert.match(environment.preview.style.transform, /scale\(2\)$/);
    assert.equal(environment.preview.classList.contains("is-zoomed"), true);

    environment.preview.dispatch("touchend", { touches: [] });
    environment.preview.dispatch("touchstart", {
        touches: [{ clientX: 100, clientY: 100 }],
    });
    environment.preview.dispatch("touchmove", {
        touches: [{ clientX: 150, clientY: 120 }],
    });
    assert.match(environment.preview.style.transform, /translate3d\(50px, 20px, 0\) scale\(2\)$/);

    environment.preview.dispatch("touchend", { touches: [] });
    environment.preview.dispatch("dblclick");
    assert.match(environment.preview.style.transform, /scale\(1\)$/);
}

testOpenAndClose();
testPinchZoom();

console.log("Image popover tests passed.");
