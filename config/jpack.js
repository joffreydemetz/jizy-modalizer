import fs from 'fs';
import path from 'path';
import { LogMe, jPackConfig, removeEmptyDirs } from 'jizy-packer';

async function generateConfigLess() {
    LogMe.log('Generate config.less');
    const desktopBreakpoint = jPackConfig.get('desktopBreakpoint') ?? '768px';
    let lessContent = `@desktop-breakpoint: ${desktopBreakpoint};` + "\n";
    lessContent += `@mobile-breakpoint: @desktop-breakpoint - 1px;`;
    fs.writeFileSync(path.join(jPackConfig.get('assetsPath'), 'config.less'), lessContent);
}

function moveSingleJsFileToDistRoot() {
    //LogMe.log('Clean dist folder content')
    const target = jPackConfig.get('assetsPath');
    //removeEmptyDirs(target);

    // move the .min.js file in dist/js/ to dist/
    LogMe.log('Move minified JS file to dist root');
    const minJsFile = path.join(target, 'js', `${jPackConfig.get('alias')}.min.js`);
    if (fs.existsSync(minJsFile)) {
        fs.renameSync(minJsFile, path.join(target, `${jPackConfig.get('alias')}.min.js`));
    }
}

const jPackData = {
    name: 'Modalizer',
    alias: 'jizy-modalizer',
    cfg: 'modalizer',
    assetsPath: 'dist',

    buildTarget: null,
    buildZip: false,
    buildName: 'default',

    desktopBreakpoint: '900px',

    onCheckConfig: () => {
    },

    onGenerateBuildJs: (code) => {
        generateConfigLess();
        return code;
    },

    onGenerateWrappedJs: (wrapped) => {
        return wrapped;
    },

    onPacked: () => {
        // moveSingleJsFileToDistRoot();
    }
};

export default jPackData;