import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const excludedDirectories = new Set([".git", "node_modules"]);
const excludedPagePrefixes = ["templates/", "unreleased/"];
const checkedSourceExtensions = new Set([
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".mjs",
    ".scss",
]);

const failures = [];

function listFiles(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        if (excludedDirectories.has(entry.name)) {
            return [];
        }

        const absolutePath = path.join(directory, entry.name);
        return entry.isDirectory() ? listFiles(absolutePath) : [absolutePath];
    });
}

function relativePath(file) {
    return path.relative(repositoryRoot, file).split(path.sep).join("/");
}

function countMatches(content, pattern) {
    return [...content.matchAll(pattern)].length;
}

function checkDocumentStructure(file, content) {
    const requiredElements = [
        ["doctype", /<!doctype\s+html\b/gi],
        ["html", /<html\b/gi],
        ["head", /<head\b/gi],
        ["body", /<body\b/gi],
    ];

    for (const [name, pattern] of requiredElements) {
        const count = countMatches(content, pattern);
        if (count !== 1) {
            failures.push(`${relativePath(file)}: expected one ${name} declaration, found ${count}`);
        }
    }
}

function checkDuplicateIds(file, content) {
    const seenIds = new Set();
    const duplicateIds = new Set();
    const idPattern = /\bid\s*=\s*(["'])(.*?)\1/gi;

    for (const match of content.matchAll(idPattern)) {
        const id = match[2];
        if (seenIds.has(id)) {
            duplicateIds.add(id);
        }
        seenIds.add(id);
    }

    for (const id of duplicateIds) {
        failures.push(`${relativePath(file)}: duplicate id "${id}"`);
    }
}

function checkMarkupSanity(file, content) {
    const markup = content.replace(/<!--[\s\S]*?-->/g, "");
    const pairedElements = ["a", "h1", "h2", "h3", "header", "nav", "p", "section", "style"];

    if (/<\/br\s*>/i.test(markup)) {
        failures.push(`${relativePath(file)}: invalid closing br tag`);
    }

    if (/<span\b[^>]*\btarget\s*=/i.test(markup)) {
        failures.push(`${relativePath(file)}: target attribute must be placed on the link`);
    }

    if (/<[^>]+\bclass\s*=\s*(["'])[^"']*\1[^>]+\bclass\s*=/i.test(markup)) {
        failures.push(`${relativePath(file)}: element has duplicate class attributes`);
    }

    if (/<p\b[^>]*>(?:(?!<\/p>)[\s\S])*?<p\b/i.test(markup)) {
        failures.push(`${relativePath(file)}: paragraph elements must not be nested`);
    }

    if (/\bhref\s*=\s*(["'])#?\1/i.test(markup)) {
        failures.push(`${relativePath(file)}: links must not use empty or placeholder destinations`);
    }

    for (const element of pairedElements) {
        const openingCount = countMatches(markup, new RegExp(`<${element}\\b`, "gi"));
        const closingCount = countMatches(markup, new RegExp(`</${element}\\s*>`, "gi"));
        if (openingCount !== closingCount) {
            failures.push(
                `${relativePath(file)}: unbalanced ${element} tags (${openingCount} opening, ${closingCount} closing)`,
            );
        }
    }
}

function isLocalReference(reference) {
    return Boolean(reference)
        && !reference.startsWith("#")
        && !reference.startsWith("//")
        && !/^[a-z][a-z\d+.-]*:/i.test(reference);
}

function resolveSiteReference(file, reference) {
    const pageDirectory = path.posix.dirname(`/${relativePath(file)}`);
    const basePath = pageDirectory.endsWith("/") ? pageDirectory : `${pageDirectory}/`;
    const baseUrl = new URL(basePath, "https://site.invalid/");
    const pathname = decodeURIComponent(new URL(reference, baseUrl).pathname);
    return path.join(repositoryRoot, pathname.replace(/^\/+/, ""));
}

function referenceTargetExists(target) {
    if (!existsSync(target)) {
        return false;
    }

    if (!statSync(target).isDirectory()) {
        return true;
    }

    return existsSync(path.join(target, "index.html"));
}

function checkLocalDependencies(file, content) {
    const dependencyPatterns = [
        /<script\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi,
        /<link\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi,
        /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi,
        /<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi,
        /<iframe\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi,
        /<source\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi,
    ];

    for (const pattern of dependencyPatterns) {
        for (const match of content.matchAll(pattern)) {
            const reference = match[2].split(/[?#]/, 1)[0];
            if (!isLocalReference(reference)) {
                continue;
            }

            let target;
            try {
                target = resolveSiteReference(file, reference);
            } catch {
                failures.push(`${relativePath(file)}: invalid local dependency "${reference}"`);
                continue;
            }

            if (!referenceTargetExists(target)) {
                failures.push(`${relativePath(file)}: missing local dependency "${reference}"`);
            }
        }
    }
}

function checkSharedAssetUsage(file, content) {
    const relative = relativePath(file);
    const hasTemplateStyles = /assets\/css\/main\.css/.test(content);
    const hasSiteStyles = /assets\/css\/site\.css/.test(content);
    const hasDynamicMedia = /js-dynamic-(?:audio|image)/.test(content);
    const hasSharedMediaLoader = /assets\/js\/media_loader\.js/.test(content);
    const hasLegacyModal = /id\s*=\s*(["'])myModal\1/.test(content);
    const hasSharedPopover = /assets\/js\/image_overlay_handler\.js/.test(content);

    if (hasTemplateStyles && !hasSiteStyles) {
        failures.push(`${relative}: template styles must be followed by the shared site stylesheet`);
    }

    if (hasDynamicMedia && !hasSharedMediaLoader) {
        failures.push(`${relative}: dynamic media requires the shared media loader`);
    }

    if (hasLegacyModal) {
        failures.push(`${relative}: popover markup must be created by the shared script`);
    }

    if (hasSharedPopover && !hasSiteStyles) {
        failures.push(`${relative}: image popover requires the shared site stylesheet`);
    }

    if (/const\s+(?:audioResourcePrefix|resourcePrefix)\s*=/.test(content)) {
        failures.push(`${relative}: inline media loader must use the shared media loader`);
    }

    if (relative.startsWith("templates/")) {
        if (/\bcol-\d+\b/.test(content)) {
            failures.push(`${relative}: authoring templates must use human-readable width classes`);
        }

        if (/\sstyle\s*=/.test(content)) {
            failures.push(`${relative}: authoring templates must not require inline layout styles`);
        }
    }
}

function checkJavaScriptSyntax(file) {
    const result = spawnSync(process.execPath, ["--check", file], {
        encoding: "utf8",
    });

    if (result.status !== 0) {
        const details = (result.stderr || result.stdout).trim();
        failures.push(`${relativePath(file)}: JavaScript syntax check failed\n${details}`);
    }
}

function checkConflictMarkers(file, content) {
    if (/^(<{7}|={7}|>{7})(?:\s|$)/m.test(content)) {
        failures.push(`${relativePath(file)}: unresolved merge-conflict marker`);
    }
}

const files = listFiles(repositoryRoot);
const sourceFiles = files.filter((file) => checkedSourceExtensions.has(path.extname(file)));
const htmlFiles = files.filter((file) => path.extname(file) === ".html");
const publishedHtmlFiles = htmlFiles.filter((file) => {
    const relative = relativePath(file);
    return !excludedPagePrefixes.some((prefix) => relative.startsWith(prefix));
});
const maintainedHtmlFiles = htmlFiles;
const projectJavaScriptFiles = files.filter((file) => {
    const relative = relativePath(file);
    return [".js", ".mjs"].includes(path.extname(file)) && !relative.endsWith(".min.js");
});

for (const file of sourceFiles) {
    checkConflictMarkers(file, readFileSync(file, "utf8"));
}

for (const file of publishedHtmlFiles) {
    const content = readFileSync(file, "utf8");
    checkDocumentStructure(file, content);
    checkDuplicateIds(file, content);
    checkMarkupSanity(file, content);
}

for (const file of maintainedHtmlFiles) {
    const content = readFileSync(file, "utf8");
    checkLocalDependencies(file, content);
    checkSharedAssetUsage(file, content);
}

for (const file of projectJavaScriptFiles) {
    checkJavaScriptSyntax(file);
}

if (failures.length > 0) {
    console.error("Site checks failed:\n");
    for (const failure of failures) {
        console.error(`- ${failure}`);
    }
    process.exitCode = 1;
} else {
    const excludedPageCount = htmlFiles.length - publishedHtmlFiles.length;
    console.log(
        `Site checks passed: ${publishedHtmlFiles.length} published HTML pages, `
        + `${projectJavaScriptFiles.length} project JavaScript files, `
        + `${excludedPageCount} template or draft HTML pages excluded.`,
    );
}
