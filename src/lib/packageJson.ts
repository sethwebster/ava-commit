import fs from 'fs';
import * as url from 'url';

function loadPackageJsonFromProject() {
  const __dirname = process.env.PWD;
  const packageJson = fs.readFileSync(`${__dirname}/package.json`);
  return JSON.parse(packageJson.toString());
}

function loadPackageJson() {
  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  const packageJson = fs.readFileSync(`${__dirname}../../package.json`);
  return JSON.parse(packageJson.toString());
}

function packageVersion() {
  const packageJson = loadPackageJson();
  return packageJson.version;
}

function packageVersionFromProject() {
  const packageJson = loadPackageJsonFromProject();
  return packageJson.version;
}

export default {
  loadPackageJson,
  loadPackageJsonFromProject,
  packageVersion,
  packageVersionFromProject
};