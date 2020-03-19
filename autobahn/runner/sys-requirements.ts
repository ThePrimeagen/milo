import {
    root,
    autobahnTS,
    autobahnDocker,
} from "./paths";

import shell from "shelljs";

const gitSubmoduleError = `Attempted to cd to autobahn-testsuite directory and was unable to.  
This is likely due to not initializing git submodules.  Please execute: 
            
    git submodule update --init --recursive

`;

const dockerError = `Failed executing: 

    which docker 

Docker does not appear to be in your $PATH or not installed on your system.  
Please install docker and retry.`;

export async function systemReq() {

    const res = shell.cd(autobahnDocker);

    if (res.stderr && res.stderr.length) {
        throw new Error(gitSubmoduleError);
    }

    const whichRes = shell.which("docker");
    if (whichRes.stderr && whichRes.stderr.length) {
        throw new Error(dockerError);
    }
}

