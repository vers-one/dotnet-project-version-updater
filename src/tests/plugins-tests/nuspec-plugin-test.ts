import type { PluginTest } from "./plugin-test";
import NuspecPlugin from "../../plugins/nuspec-plugin";

const nuspecPluginTest: PluginTest =
{
    plugin: new NuspecPlugin(),
    input: `<?xml version="1.0"?>\n<package>\n<metadata>\n<version>1.2.3</version>\n</metadata>\n</package>`,
    newVersion: "4.5.6",
    tagTests:
    [{
        tag: "*",
        expectedResult: `<?xml version="1.0"?>\n<package>\n<metadata>\n<version>4.5.6</version>\n</metadata>\n</package>`
    },
    {
        tag: "version",
        expectedResult: `<?xml version="1.0"?>\n<package>\n<metadata>\n<version>4.5.6</version>\n</metadata>\n</package>`
    }]
};

export default nuspecPluginTest;
