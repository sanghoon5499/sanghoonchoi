import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const handlerPath = "assets/js/image_overlay_handler.js";

function createClassList(initialClasses = []) {
    const classes = new Set(initialClasses);
    return {
        add: (name) => classes.add(name),
        contains: (name) => classes.has(name),
        remove: (name) => classes.delete(name),
    };
}

function createEventTarget(properties = {}) {
    const attributes = new Map();
    const listeners = new Map();
    return {
        ...properties,
        attributes,
        focused: false,
        addEventListener(type, listener) {
            const eventListeners = listeners.get(type) || [];
            eventListeners.push(listener);
            listeners.set(type, eventListeners);
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
        setAttribute(name, value) {
            attributes.set(name, value);
        },
    };
}

function runHandler(globals) {
    const source = readFileSync(path.join(repositoryRoot, handlerPath), "utf8");
    vm.runInNewContext(source, globals, { filename: handlerPath });
}

function createModalEnvironment({ zoomEnabled = false } = {}) {
    const modalImage = createEventTarget({
        classList: createClassList(),
        clientHeight: 600,
        clientWidth: 800,
        dataset: {},
        src: "",
        style: {},
    });
    const caption = { textContent: "" };
    const modal = createEventTarget({
        clientHeight: 600,
        clientWidth: 800,
        dataset: zoomEnabled
            ? { closeDuration: "200", zoomable: "true" }
            : {},
        querySelector: () => null,
        style: { display: "none" },
    });
    const body = createEventTarget({ style: { overflow: "" } });
    const image = createEventTarget({
        alt: "Test caption",
        classList: createClassList(["image_overlay"]),
        dataset: { originalSrc: "https://example.test/image.jpg" },
        closest(selector) {
            return selector === "img.image_overlay" ? this : null;
        },
        src: "https://example.test/webp/image.webp",
    });
    const document = createEventTarget({
        body,
        getElementById(id) {
            return { myModal: modal, image_box: modalImage, caption }[id] || null;
        },
    });
    const window = createEventTarget();

    runHandler({
        document,
        Math,
        Number,
        setTimeout: (callback) => callback(),
        window,
    });
    document.dispatch("DOMContentLoaded");

    return { body, caption, document, image, modal, modalImage };
}

function testGenericModal() {
    const environment = createModalEnvironment();

    assert.equal(environment.modal.attributes.get("role"), "dialog");
    assert.equal(environment.modal.attributes.get("aria-hidden"), "true");

    environment.body.dispatch("click", { target: environment.image });

    assert.equal(environment.modal.style.display, "flex", "Modal should open");
    assert.equal(environment.modal.attributes.get("aria-hidden"), "false");
    assert.equal(environment.modal.focused, true, "Modal should receive focus when opened");
    assert.equal(
        environment.modalImage.src,
        environment.image.dataset.originalSrc,
        "Modal should show the original image",
    );
    assert.equal(environment.modalImage.dataset.originalSrc, environment.image.dataset.originalSrc);
    assert.equal(environment.modalImage.alt, environment.image.alt, "Modal image should retain the alternative text");
    assert.equal(environment.caption.textContent, environment.image.alt, "Modal should show the image caption");

    environment.modal.focused = false;
    environment.document.dispatch("keydown", { key: "Tab" });
    assert.equal(environment.modal.focused, true, "Tab should keep focus in the modal");

    environment.document.dispatch("keydown", { key: "Escape" });
    assert.equal(environment.modal.style.display, "none", "Modal should close on Escape");
    assert.equal(environment.modal.attributes.get("aria-hidden"), "true");
    assert.equal(environment.image.focused, true, "Closing should return focus to the source image");
}

function testZoomableModal() {
    const environment = createModalEnvironment({ zoomEnabled: true });
    environment.body.dispatch("click", { target: environment.image });

    assert.equal(environment.body.style.overflow, "hidden", "Zoomable modal should lock page scrolling");
    assert.equal(
        environment.modalImage.style.transform,
        "translate(0px, 0px) scale(1)",
        "Zoomable modal should reset its transform when opened",
    );

    environment.modalImage.dispatch("dblclick");
    assert.match(environment.modalImage.style.transform, /scale\(2\.5\)$/, "Double-click should zoom in");

    environment.document.dispatch("keydown", { key: "Escape" });
    assert.equal(environment.body.style.overflow, "", "Closing should restore page scrolling");
}

testGenericModal();
testZoomableModal();

console.log("Modal handler tests passed.");
