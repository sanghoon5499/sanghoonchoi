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
                listener.call(this, {
                    preventDefault() {},
                    target: this,
                    ...event,
                });
            }
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
    const document = createEventTarget({
        body,
        getElementById(id) {
            return { myModal: modal, image_box: modalImage, caption }[id] || null;
        },
    });
    const window = createEventTarget();
    const image = {
        alt: "Test caption",
        classList: createClassList(["image_overlay"]),
        closest(selector) {
            return selector === "img.image_overlay" ? this : null;
        },
        src: "https://example.test/image.jpg",
    };

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
    environment.body.dispatch("click", { target: environment.image });

    assert.equal(environment.modal.style.display, "flex", "Modal should open");
    assert.equal(environment.modalImage.src, environment.image.src, "Modal should show the selected image");
    assert.equal(environment.caption.textContent, environment.image.alt, "Modal should show the image caption");

    environment.document.dispatch("keydown", { key: "Escape" });
    assert.equal(environment.modal.style.display, "none", "Modal should close on Escape");
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
