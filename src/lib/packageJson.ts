import fs from 'fs';
import path from 'path';
import * as url from 'url';
function loadPackageJson() {
  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  const packageJson = fs.readFileSync(`${__dirname}../../package.json`);
  return JSON.parse(packageJson.toString());
}

function packageVersion() {
  const packageJson = loadPackageJson();
  return packageJson.version;
}

export default {
  loadPackageJson,
  packageVersion
};