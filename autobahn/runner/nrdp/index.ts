import shell from "shelljs";

import { IPlatform } from "../../types";
import { root } from "../paths";

import sysRequirements from "./sys-requirements";
import createArtifact from "./create-artifact";
import runNRDP from "./run-nrdp";
import { LocalContext } from "../../context";

export default async function testNrdp(Platform: IPlatform, context: LocalContext) {
    // Setup the system.
    await sysRequirements(Platform);
    await createArtifact(Platform);

    // run NRDP
    await runNRDP(Platform, context);
};
