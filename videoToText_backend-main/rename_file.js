const fs = require('fs');
const path = require('path');

const oldPath = path.join(__dirname, 'src', 'modules', 'generateSummaryFromText', 'updateWebSummary.ts');
const newPath = path.join(__dirname, 'src', 'modules', 'generateSummaryFromText', 'updateTextSummary.ts');

try {
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log('Renamed successfully');
    } else {
        console.log('Old path does not exist');
    }
} catch (err) {
    console.error('Error renaming:', err);
}
