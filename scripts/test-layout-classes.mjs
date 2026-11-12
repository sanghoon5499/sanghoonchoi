import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteStyles = readFileSync(path.join(repositoryRoot, "assets/css/site.css"), "utf8");

const widthClasses = new Map([
    ["image-full", "100%"],
    ["image-five-sixths", "83.33333%"],
    ["image-four-fifths", "80%"],
    ["image-three-quarters", "75%"],
    ["image-two-thirds", "66.66667%"],
    ["image-half", "50%"],
    ["image-two-fifths", "40%"],
    ["image-third", "33.33333%"],
    ["image-quarter", "25%"],
]);

for (const [className, width] of widthClasses) {
    const rule = new RegExp(
        `\\.${className}(?:\\s*,[^{}]+)?\\s*\\{[^}]*width:\\s*${width.replace("%", "\\%")};`,
        "s",
    );
    assert.match(siteStyles, rule, `${className} should have width ${width}`);
}

assert.match(siteStyles, /\.row\.row-center\s*\{[^}]*justify-content:\s*center;/s);
assert.match(siteStyles, /\.image-center\s*\{[^}]*margin-left:\s*auto;[^}]*margin-right:\s*auto;/s);
assert.match(siteStyles, /\.clear-float\s*\{[^}]*clear:\s*both;/s);
assert.match(siteStyles, /\.text-wrap-left\s*\{[^}]*float:\s*left;/s);
assert.match(siteStyles, /\.text-wrap-right\s*\{[^}]*float:\s*right;/s);

console.log("Blog layout class tests passed.");
