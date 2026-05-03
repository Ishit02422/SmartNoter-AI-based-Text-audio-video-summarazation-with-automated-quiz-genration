const cp = require('child_process');
const fs = require('fs');
try {
    console.log('Running npx tsc...');
    const output = cp.execSync('npx tsc', { encoding: 'utf8', stdio: 'pipe' });
    console.log('Compilation successful!');
    fs.writeFileSync('build_output.txt', output);
} catch (e) {
    console.log('Compilation failed with exit code:', e.status);
    fs.writeFileSync('build_output.txt', e.stdout + '\n' + e.stderr);
}
