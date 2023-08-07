import fs from 'fs';
import * as url from 'url';
import {IPackageJson} from 'package-json-type'

function loadPackageJsonFromProject(): IPackageJson {
  const __dirname = process.env.PWD;
  const packageJson = fs.readFileSync(`${__dirname}/package.json`);
  return JSON.parse(packageJson.toString());
}

function loadPackageJson(): IPackageJson {
  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  const packageJson = fs.readFileSync(`${__dirname}../../package.json`);
  return JSON.parse(packageJson.toString());
}

function packageVersion(): IPackageJson["version"] {
  const packageJson = loadPackageJson();
  return packageJson.version;
}

function packageVersionFromProject(): Required<IPackageJson["version"]> {
  const packageJson = loadPackageJsonFromProject();
  return packageJson.version;
}

export default {
  loadPackageJson,
  loadPackageJsonFromProject,
  packageVersion,
  packageVersionFromProject
};