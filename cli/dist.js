import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import "../config/jpack.js";
import { build } from "./build.js";
import { jPackConfig, cleanTargetDirectory, LogMe } from "../jpack/utils.js";

process.env.DEBUG = true;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.resolve(__dirname, '../');
const target = path.join(basePath, 'dist');

LogMe.log(`Empty target directory : ${target}`);
cleanTargetDirectory(target);

LogMe.log('copy default config.json file');
fs.copyFileSync(
    path.join(basePath, 'config', 'config.json'),
    path.join(target, jPackConfig.get('cfg') + '.config.json')
);

build({
    target
});