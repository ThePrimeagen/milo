import { Platform } from "./types";

let exportObject;
if (process.env.NRDP) {
    exportObject = require("./nrdp/NrdpPlatform");
} else {
    exportObject = {} as Platform;
}

export default exportObject as Platform;
