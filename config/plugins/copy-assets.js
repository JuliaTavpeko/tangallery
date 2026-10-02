import fs from 'node:fs';
import path from 'node:path';

import { paths } from '../paths.js';

function copyDirectory(
    source,
    destination
) {
    if (!fs.existsSync(source)) {
        return;
    }

    fs.mkdirSync(
        destination,
        {
            recursive: true
        }
    );

    for (const entry of fs.readdirSync(
        source,
        {
            withFileTypes: true
        }
    )) {
        const sourcePath =
            path.join(
                source,
                entry.name
            );

        const destinationPath =
            path.join(
                destination,
                entry.name
            );

        if (entry.isDirectory()) {
            copyDirectory(
                sourcePath,
                destinationPath
            );

            continue;
        }

        fs.copyFileSync(
            sourcePath,
            destinationPath
        );
    }
}

export function copyAssets() {
    return {
        name: 'copy-assets',

        apply: 'build',

        closeBundle() {
            copyDirectory(
                paths.fonts,
                paths.buildFonts
            );

            copyDirectory(
                paths.files,
                paths.build
            );
        }
    };
}