import { spawnSync } from 'child_process';
import { chdir } from 'process';
import { join } from 'path';

try {
    // Save original working directory
    const originalDir = process.cwd();

    console.log('Skipping better-sqlite3 rebuild due to compatibility issues with Node.js v22.x');

    // We're skipping the rebuild process for now
    // chdir(join(originalDir, 'node_modules', 'better-sqlite3'));
    //
    // const result = spawnSync('node-gyp', ['rebuild'], {
    //     stdio: 'inherit',
    //     shell: true,
    //     env: {
    //         ...process.env,
    //         CXXFLAGS: "-std=c++17 -stdlib=libc++ -I/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include",
    //         CFLAGS: "-std=c17 -I/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include"
    //     }
    // });
    //
    // // Change back to original directory
    // chdir(originalDir);
    //
    // // Check if the build failed
    // if (result.status !== 0) {
    //     console.error('Failed to rebuild better-sqlite3');
    //     process.exit(1);
    // }
} catch (error) {
    console.error('Error during postinstall:', error.message);
    process.exit(1);
}
