export function devReload() {
    return {
        name: 'dev-reload',

        apply: 'serve',

        handleHotUpdate({
                            file,
                            server
                        }) {
            const normalizedFile = file.replace(
                /\\/g,
                '/'
            );

            const sourceDirectories = [
                paths.js,
                paths.scss,
                paths.img,
                paths.fonts,
                paths.icons,
                paths.files
            ].map((directory) =>
                directory
                    .replace(/\\/g, '/')
                    .replace(/\/+$/, '')
            );

            const isSourceFile =
                sourceDirectories.some(
                    (directory) =>
                        normalizedFile === directory ||
                        normalizedFile.startsWith(
                            `${directory}/`
                        )
                );

            if (!isSourceFile) {
                return;
            }

            server.ws.send({
                type: 'full-reload',
                path: '*'
            });

            return [];
        }
    };
}