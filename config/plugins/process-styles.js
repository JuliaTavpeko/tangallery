import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as sass from 'sass';

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
            entry.name.endsWith('.scss') &&
            !entry.name.startsWith('_')
        ) {
            files.push(fullPath);
        }
    }

    return files;
}

function getOutputPath(file) {
    const relative =
        path.relative(
            paths.scss,
            file
        );

    const parsed =
        path.parse(relative);

    const outputDirectory =
        path.join(
            paths.buildCss,
            parsed.dir
        );

    return {
        css: path.join(
            outputDirectory,
            `${parsed.name}.css`
        ),

        cssMap: path.join(
            outputDirectory,
            `${parsed.name}.css.map`
        )
    };
}

function compileSass(file) {
    return sass.compile(
        file,
        {
            style: 'expanded',

            sourceMap: true,

            sourceMapIncludeSources: true,

            loadPaths: [
                paths.scss
            ]
        }
    );
}

function normalizePath(value) {
    return value
        .replace(
            /^file:\/\//,
            ''
        )
        .replace(
            /\\/g,
            '/'
        );
}

function resolveSource(
    source,
    sourceFile
) {
    if (
        source.startsWith(
            'file://'
        )
    ) {
        try {
            return fileURLToPath(
                source
            );
        } catch {
            return null;
        }
    }

    if (
        path.isAbsolute(source)
    ) {
        return source;
    }

    return path.resolve(
        path.dirname(sourceFile),
        source
    );
}

function createSourceMap(
    result,
    sourceFile,
    outputFile
) {
    const sourceMap = {
        ...result.sourceMap
    };

    const originalSources =
        Array.isArray(
            sourceMap.sources
        )
            ? [...sourceMap.sources]
            : [];

    const originalContents =
        Array.isArray(
            sourceMap.sourcesContent
        )
            ? [...sourceMap.sourcesContent]
            : [];

    const sourceIndex = new Map();

    for (
        let index = 0;
        index < originalSources.length;
        index++
    ) {
        const source =
            originalSources[index];

        const absolute =
            resolveSource(
                source,
                sourceFile
            );

        if (absolute) {
            sourceIndex.set(
                normalizePath(
                    absolute
                ),
                index
            );
        }
    }

    const loadedFiles =
        result.loadedUrls
            .filter(
                url =>
                    url.protocol === 'file:'
            )
            .map(
                url =>
                    fileURLToPath(url)
            );

    for (
        const loadedFile of loadedFiles
        ) {
        const normalizedFile =
            normalizePath(
                loadedFile
            );

        if (
            sourceIndex.has(
                normalizedFile
            )
        ) {
            continue;
        }

        const relativeSource =
            path.relative(
                path.dirname(outputFile),
                loadedFile
            ).replace(
                /\\/g,
                '/'
            );

        const index =
            originalSources.length;

        originalSources.push(
            relativeSource
        );

        originalContents.push(
            fs.readFileSync(
                loadedFile,
                'utf8'
            )
        );

        sourceIndex.set(
            normalizedFile,
            index
        );
    }

    sourceMap.sources =
        originalSources;

    sourceMap.sourcesContent =
        originalContents;

    sourceMap.file =
        path.basename(
            outputFile
        );

    sourceMap.sourceRoot =
        '';

    return sourceMap;
}

function writeCss(
    result,
    sourceFile,
    outputFile,
    mapFile
) {
    const sourceMap =
        createSourceMap(
            result,
            sourceFile,
            outputFile
        );

    fs.mkdirSync(
        path.dirname(
            outputFile
        ),
        {
            recursive: true
        }
    );

    fs.writeFileSync(
        outputFile,
        `${result.css}\n` +
        `/*# sourceMappingURL=${path.basename(mapFile)} */\n`,
        'utf8'
    );

    fs.writeFileSync(
        mapFile,
        JSON.stringify(
            sourceMap,
            null,
            2
        ),
        'utf8'
    );
}

function buildStyles() {
    const files =
        getFiles(paths.scss);

    for (const file of files) {
        const output =
            getOutputPath(file);

        const result =
            compileSass(file);

        writeCss(
            result,
            file,
            output.css,
            output.cssMap
        );
    }
}

function removeBuildCss() {
    if (
        fs.existsSync(
            paths.buildCss
        )
    ) {
        fs.rmSync(
            paths.buildCss,
            {
                recursive: true,
                force: true
            }
        );
    }
}

export function processStyles() {
    return {
        name: 'process-styles',

        apply: 'build',

        closeBundle() {
            removeBuildCss();

            buildStyles();
        }
    };
}