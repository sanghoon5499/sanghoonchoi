import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const travelData = readFileSync(path.join(repositoryRoot, "travel/travel_blogs.js"), "utf8");
const articleLinks = [...travelData.matchAll(/\blink:\s*"([^"]+)"/g)]
    .map((match) => match[1])
    .filter((link) => link.includes("travel_blogs/"));

assert.ok(articleLinks.length > 0, "Travel index should contain article links");

for (const link of articleLinks) {
    assert.ok(!link.endsWith(".html"), `${link} should not expose an HTML extension`);
    assert.ok(link.endsWith("/"), `${link} should use a trailing-slash URL`);

    const articleDirectory = path.resolve(repositoryRoot, "travel", link);
    const articleFile = path.join(articleDirectory, "index.html");
    assert.ok(existsSync(articleFile), `${link} should resolve to an index.html file`);

    const slug = path.basename(articleDirectory);
    const canonicalUrl = `https://sanghoonchoi.com/travel_blogs/${slug}/`;
    const article = readFileSync(articleFile, "utf8");
    assert.ok(article.includes(`href="${canonicalUrl}"`), `${link} should declare its canonical URL`);

    const legacyFile = path.join(repositoryRoot, "travel_blogs", `${slug}.html`);
    assert.ok(existsSync(legacyFile), `${slug}.html should preserve the previous URL`);

    const redirect = readFileSync(legacyFile, "utf8");
    assert.ok(redirect.includes(`url=./${slug}/`), `${slug}.html should redirect to the clean URL`);
    assert.ok(redirect.includes(`href="${canonicalUrl}"`), `${slug}.html should use the clean canonical URL`);
}

assert.ok(existsSync(path.join(repositoryRoot, "templates/travel-blog/index.html")));
assert.ok(!existsSync(path.join(repositoryRoot, "templates/travel-blog.html")));

console.log("Clean URL tests passed.");
