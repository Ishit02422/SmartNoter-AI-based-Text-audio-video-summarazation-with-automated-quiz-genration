const cp = require('child_process');
const fs = require('fs');
try {
    console.log('Running docker ps...');
    const output = cp.execSync('docker ps -a', { encoding: 'utf8', stdio: 'pipe' });
    console.log('Success!');
    fs.writeFileSync('docker_ps.txt', output);
} catch (e) {
    console.log('Failed:', e.message);
    fs.writeFileSync('docker_ps.txt', (e.stdout || '') + '\n' + (e.stderr || ''));
}
