import fs from 'node:fs';
import path from 'node:path';

import { paths } from '../paths.js';

function getFiles(directory) {
    const files = [];

    if (!fs.existsSync(directory)) {
        return files;
    }

    for (
        const entry of fs.readdirSync(
        directory,
        {
            withFileTypes: true
        }
    )
        ) {
        const fullPath =
            path.join(
                directory,
                entry.name
            );

        if (entry.isDirectory()) {
            files.push(
                ...getFiles(fullPath)
            );

            continue;
        }

        if (
            entry.isFile() &&
            entry.name
                .toLowerCase()
                .endsWith('.svg')
        ) {
            files.push(fullPath);
        }
    }

    return files;
}

function escapeXml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function getSymbol(file) {
    const source =
        fs.readFileSync(
            file,
            'utf8'
        );

    const match =
        source.match(
            /<svg\b([^>]*)>([\s\S]*?)<\/svg>/i
        );

    if (!match) {
        return null;
    }

    const attributes =
        match[1];

    const content =
        match[2];

    const relative =
        path.relative(
            paths.icons,
            file
        );

    const parsed =
        path.parse(relative);

    const idParts = [
        ...parsed.dir
            .split(path.sep)
            .filter(Boolean),

        parsed.name
    ];

    const id =
        idParts.join('-');

    const viewBoxMatch =
        attributes.match(
            /\bviewBox\s*=\s*["']([^"']+)["']/i
        );

    const widthMatch =
        attributes.match(
            /\bwidth\s*=\s*["']([^"']+)["']/i
        );

    const heightMatch =
        attributes.match(
            /\bheight\s*=\s*["']([^"']+)["']/i
        );

    const viewBox =
        viewBoxMatch?.[1] ||
        (
            widthMatch &&
            heightMatch
                ? `0 0 ${widthMatch[1]} ${heightMatch[1]}`
                : null
        );

    const viewBoxAttribute =
        viewBox
            ? ` viewBox="${escapeXml(viewBox)}"`
            : '';

    return [
        `    <symbol id="${escapeXml(id)}"${viewBoxAttribute}>`,
        content.trim(),
        '    </symbol>'
    ].join('\n');
}

function createSprite() {
    const files =
        getFiles(paths.icons);

    const symbols = [];

    for (const file of files) {
        const symbol =
            getSymbol(file);

        if (symbol) {
            symbols.push(symbol);
        }
    }

    return [
        '<svg xmlns="http://www.w3.org/2000/svg">',
        ...symbols,
        '</svg>'
    ].join('\n');
}

function getOutputFile(isBuild) {
    if (isBuild) {
        return path.join(
            paths.buildSprites,
            'sprite.svg'
        );
    }

    return path.join(
        paths.img,
        'sprites',
        'sprite.svg'
    );
}

function writeSprite(isBuild) {
    const outputFile =
        getOutputFile(isBuild);

    fs.mkdirSync(
        path.dirname(outputFile),
        {
            recursive: true
        }
    );

    fs.writeFileSync(
        outputFile,
        createSprite(),
        'utf8'
    );
}

function isInsideIcons(file) {
    const normalizedFile =
        path.resolve(file);

    const normalizedIcons =
        path.resolve(paths.icons);

    return (
        normalizedFile === normalizedIcons ||
        normalizedFile.startsWith(
            `${normalizedIcons}${path.sep}`
        )
    );
}

export function svgSprite() {
    return {
        name: 'svg-sprite',

        configureServer(server) {
            writeSprite(false);

            server.watcher.add(
                paths.icons
            );
        },

        handleHotUpdate({
                            file,
                            server
                        }) {
            if (
                !isInsideIcons(file) ||
                !file
                    .toLowerCase()
                    .endsWith('.svg')
            ) {
                return;
            }

            writeSprite(false);

            server.ws.send({
                type: 'full-reload'
            });

            return [];
        },

        closeBundle() {
            writeSprite(true);
        }
    };
}