const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function replaceInFile(filePath) {
    const ext = path.extname(filePath);
    if (!['.js', '.jsx', '.css', '.html', '.json'].includes(ext)) {
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Replace brand name
    content = content.replace(/Printigly/g, 'VisualBlink');
    content = content.replace(/printigly/g, 'visualblink');

    // 2. Replace solid colors
    // Main orange -> Blue (#025afc)
    content = content.replace(/#FF5A1F/g, '#025afc');
    content = content.replace(/#ff5a1f/g, '#025afc');
    // Hover orange -> Purple (#6a32f0)
    content = content.replace(/#e44d15/gi, '#6a32f0');

    // 3. Replace Tailwind color names for orange to blue/purple
    content = content.replace(/text-orange-/g, 'text-blue-');
    content = content.replace(/bg-orange-/g, 'bg-blue-');
    content = content.replace(/border-orange-/g, 'border-blue-');
    content = content.replace(/ring-orange-/g, 'ring-blue-');
    content = content.replace(/shadow-orange-/g, 'shadow-blue-');
    content = content.replace(/from-orange-/g, 'from-blue-');
    content = content.replace(/to-orange-/g, 'to-blue-');

    // There might be a few places where we want to use the gradient 
    // "linear-gradient(135deg, #05defd 0%, #025afc 50%, #6a32f0 100%)"
    // Let's add this globally in index.css

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDirectory(fullPath);
        } else {
            replaceInFile(fullPath);
        }
    });
}

traverseDirectory(directoryPath);

// Also do for API and other root files
const apiPath = path.join(__dirname, 'api');
if (fs.existsSync(apiPath)) {
    traverseDirectory(apiPath);
}

replaceInFile(path.join(__dirname, 'index.html'));
replaceInFile(path.join(__dirname, 'test-smtp.js'));

console.log("Replacement complete.");
