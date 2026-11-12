import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const excludedDirectories = new Set([".git", "node_modules"]);
const excludedPagePrefixes = ["travel_blogs/backburner/", "unreleased/"];
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
    checkLocalDependencies(file, content);
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
        + `${excludedPageCount} draft or archived HTML pages excluded.`,
    );
}
