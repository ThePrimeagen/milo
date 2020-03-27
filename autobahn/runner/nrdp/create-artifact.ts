import rollup from 'rollup';
import shell from 'shelljs';
import path from 'path';

import { root } from '../paths';
import { IPlatform } from '../../types';

export default async function createArtifact(Platform: IPlatform) {
    Platform.log("Building the NRDP Artifact");
    shell.pushd(root);
    shell.exec("npm run build:nrdp");
    shell.exec("npm run build:nrdp:test");
    shell.popd();
};

