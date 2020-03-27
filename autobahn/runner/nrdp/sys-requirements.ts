import { IPlatform } from '../../types';

const nrdpError = `Unable to find Nrdp environment variable

Either update the .env file with NRDP path run the test with NRDP=... npx ts-node ...

`;

export default async function runNrdp(Platform: IPlatform) {
    const nrdpExec = process.env.NRDP;
    if (!nrdpExec) {
        throw new Error(nrdpError);
    }
};


