import fs from 'fs';
import path from 'path';
import {
    jPackConfig,
    LogMe
} from "../jpack/utils.js";

const currentPath = path.dirname(import.meta.url);

jPackConfig.init({
    name: 'Modalizer',
    alias: 'jizy-modalizer',
    cfg: 'modalizer',
    assetsPath: 'dist',
    checkConfig: (config) => {
        return config;
    },
    genBuildJs: (code, config) => {
        LogMe.log('Generate config.less');
        const desktopBreakpoint = config.desktopBreakpoint ?? '768px';
        let lessContent = `@desktop-breakpoint: ${desktopBreakpoint};` + "\n";
        lessContent += `@mobile-breakpoint: @desktop-breakpoint - 1px;`;
        fs.writeFileSync(path.join(config.assetsPath, 'config.less'), lessContent);
        return code;
    },
    onPacked: (config) => { /*
        //LogMe.log('Clean dist folder content')
        const target = jPackConfig.get('assetsPath');
        //removeEmptyDirs(target);

        // move the .min.js file in dist/js/ to dist/
        LogMe.log('Move minified JS file to dist root');
        const minJsFile = path.join(target, 'js', `${jPackConfig.get('alias')}.min.js`);
        if (fs.existsSync(minJsFile)) {
            fs.renameSync(minJsFile, path.join(target, `${jPackConfig.get('alias')}.min.js`));
        }
    */}
});
