import fs from 'fs';
function loadPackageJson() {
  const packageJson = fs.readFileSync('./package.json');
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