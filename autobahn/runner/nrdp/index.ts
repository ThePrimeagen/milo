import shell from "shelljs";

import { IPlatform } from "../../types";
import { root } from "../paths";

import sysRequirements from "./sys-requirements";
import createArtifact from "./create-artifact";
import runNRDP from "./run-nrdp";

export default async function testNrdp(Platform: IPlatform): Promise<number> {
    // Setup the system.
    await sysRequirements(Platform);
    await createArtifact(Platform);

    return await runNRDP(Platform);
};
