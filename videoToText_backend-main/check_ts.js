const ts = require("typescript");
const fs = require("fs");

let log = "";
function println(str) { log += (str || "") + "\n"; }

println("Starting TS Check...");
const configPath = ts.findConfigFile("./", ts.sys.fileExists, "tsconfig.json");
if (!configPath) {
    println("Could not find a valid 'tsconfig.json'.");
    fs.writeFileSync("ts_errors.log", log);
    process.exit(1);
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedCmd = ts.parseJsonConfigFileContent(configFile.config, ts.sys, "./");

const program = ts.createProgram(parsedCmd.fileNames, parsedCmd.options);
const emitResult = program.emit();

const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

if (allDiagnostics.length === 0) {
    println("No compilation errors found.");
} else {
    println(`Found ${allDiagnostics.length} compilation errors:`);
    allDiagnostics.slice(0, 100).forEach(diagnostic => {
        if (diagnostic.file) {
            let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
            let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            println(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
        } else {
            println(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
        }
    });
}
println("Check complete.");
fs.writeFileSync("ts_errors.log", log);
