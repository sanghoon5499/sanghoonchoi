import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
    return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

const photography = read("photography/index.html");
assert.match(photography, /<button[^>]+class="options-btn"[^>]+aria-label="Download visible image"/);
assert.match(photography, /<button[^>]+class="nav-zone prev hidden"[^>]+aria-label="Previous photo"/);
assert.match(photography, /<button[^>]+class="nav-zone next"[^>]+aria-label="Next photo"/);
assert.doesNotMatch(photography, /<a[^>]+class="username"/);
assert.match(photography, /class="insta-actions" aria-hidden="true"/);

const resumeLanding = read("resume/index.html");
assert.match(resumeLanding, /<button[^>]+id="open-resume-popover"[^>]*>View Resume<\/button>/);
assert.match(resumeLanding, /href="resume\.pdf"[^>]*download>Download PDF<\/a>/);
assert.match(resumeLanding, /<dialog[^>]+id="resume-popover"[^>]+aria-label="Resume"/);
assert.match(resumeLanding, /<iframe[^>]+title="Sanghoon Choi resume"/s);
assert.match(resumeLanding, /<script src="resume\.js"><\/script>/);

const homepage = read("index.html");
assert.match(homepage, /Design based on <a href="https:\/\/html5up\.net\/massively">Massively<\/a> by HTML5 UP\./);

for (const removedFile of [
    "elements.html",
    "travel_blogs/backburner/daejeon.html",
    "travel_blogs/backburner/jeju.html",
    "travel_blogs/backburner/osaka_kyoto.html",
    "travel_blogs/backburner/seoul_busan.html",
    "travel_blogs/backburner/tokyo.html",
    "travel_blogs/backburner/tongyeong.html",
]) {
    assert.ok(!existsSync(path.join(repositoryRoot, removedFile)), `${removedFile} should remain removed`);
}

console.log("Accessibility and template cleanup tests passed.");
