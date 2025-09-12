import path from 'path';

import {
    LogMe,
    jPackConfig,
    generateLessVariablesFromConfig,
    deleteLessVariablesFile
} from 'jizy-packer';

const jPackData = function () {
    const lessBuildVariablesPath = path.join(jPackConfig.get('basePath'), 'lib/less/_variables.less');

    jPackConfig.sets({
        name: 'Modalizer',
        alias: 'jizy-modalizer',
        lessVariables: {
            desktopBreakpoint: '900px',
            modalizerCloserColor: '#888',
            modalizerLayer: 10000,
            modalizerWidth: '700px',
            modalizerWidthMax: '1200px',
            modalizerScrollbarWidth: '17px'
        },
        defaults: {
        }
    });

    jPackConfig.set('onCheckConfig', () => { });

    jPackConfig.set('onGenerateBuildJs', (code) => {
        LogMe.log('Build lib/less/_variables.less');
        const lessVariables = jPackConfig.get('lessVariables') ?? {};
        const lessOriginalVariablesPath = path.join(jPackConfig.get('basePath'), 'lib/less/variables.less');
        generateLessVariablesFromConfig(lessOriginalVariablesPath, lessBuildVariablesPath, lessVariables);
        return code;
    });

    jPackConfig.set('onGenerateWrappedJs', (wrapped) => wrapped);

    jPackConfig.set('onPacked', () => {
        deleteLessVariablesFile(lessBuildVariablesPath);
    });
};

export default jPackData;
