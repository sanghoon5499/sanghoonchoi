import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function createEventTarget(properties = {}) {
    const listeners = new Map();
    return {
        ...properties,
        addEventListener(type, listener) {
            const handlers = listeners.get(type) || [];
            handlers.push(listener);
            listeners.set(type, handlers);
        },
        dispatch(type, event = {}) {
            for (const listener of listeners.get(type) || []) {
                listener.call(this, { target: this, ...event });
            }
        },
        focus() {
            this.focused = true;
        },
    };
}

const viewer = { dataset: { src: "resume.pdf" }, src: "" };
const openButton = createEventTarget({ focused: false });
const closeButton = createEventTarget({ focused: false });
const dialog = createEventTarget({
    open: false,
    querySelector: (selector) => selector === "iframe" ? viewer : null,
    showModal() {
        this.open = true;
    },
    close() {
        this.open = false;
        this.dispatch("close");
    },
});
const body = { style: { overflow: "" } };
let domContentLoaded;
const document = {
    body,
    addEventListener(type, listener) {
        if (type === "DOMContentLoaded") {
            domContentLoaded = listener;
        }
    },
    getElementById(id) {
        return {
            "open-resume-popover": openButton,
            "close-resume-popover": closeButton,
            "resume-popover": dialog,
        }[id] || null;
    },
};

const source = readFileSync(path.join(repositoryRoot, "resume/resume.js"), "utf8");
vm.runInNewContext(source, { document }, { filename: "resume/resume.js" });
domContentLoaded();

openButton.dispatch("click");
assert.equal(dialog.open, true, "View Resume should open the popover");
assert.equal(viewer.src, "resume.pdf", "The PDF should load when first opened");
assert.equal(body.style.overflow, "hidden", "The page should not scroll behind the popover");
assert.equal(closeButton.focused, true, "The close button should receive focus");

closeButton.dispatch("click");
assert.equal(dialog.open, false, "The close button should close the popover");
assert.equal(body.style.overflow, "", "Closing should restore page scrolling");
assert.equal(openButton.focused, true, "Closing should return focus to View Resume");

console.log("Resume popover tests passed.");
