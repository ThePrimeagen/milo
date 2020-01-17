import { Platform } from "./types";

let exportObject: Platform;

if (process.env.NRDP) {
    exportObject = require("./nrdp/NrdpPlatform").default;
} else {
    exportObject = require("./node/NodePlatform").default;
}

export default exportObject;
