import type { PluginTest } from "./plugin-test";
import AssemblyInfoFsPlugin from "../../plugins/assemblyinfo-fs-plugin";

const assemblyInfoFsPluginTest: PluginTest =
{
    plugin: new AssemblyInfoFsPlugin(),
    input: `[<assembly: AssemblyVersion("1.2.3")>]\n[<assembly: AssemblyFileVersion("1.2.3")>]\n` +
        `[<assembly: AssemblyInformationalVersion("1.2.3")>]\ndo()`,
    newVersion: "4.5.6",
    tagTests:
    [{
        tag: "*",
        expectedResult: `[<assembly: AssemblyVersion("4.5.6")>]\n[<assembly: AssemblyFileVersion("4.5.6")>]\n` +
            `[<assembly: AssemblyInformationalVersion("4.5.6")>]\ndo()`
    },
    {
        tag: "assemblyversion",
        expectedResult: `[<assembly: AssemblyVersion("4.5.6")>]\n[<assembly: AssemblyFileVersion("1.2.3")>]\n` +
            `[<assembly: AssemblyInformationalVersion("1.2.3")>]\ndo()`
    },
    {
        tag: "assemblyfileversion",
        expectedResult: `[<assembly: AssemblyVersion("1.2.3")>]\n[<assembly: AssemblyFileVersion("4.5.6")>]\n` +
            `[<assembly: AssemblyInformationalVersion("1.2.3")>]\ndo()`
    },
    {
        tag: "assemblyinformationalversion",
        expectedResult: `[<assembly: AssemblyVersion("1.2.3")>]\n[<assembly: AssemblyFileVersion("1.2.3")>]\n` +
            `[<assembly: AssemblyInformationalVersion("4.5.6")>]\ndo()`
    }]
};

export default assemblyInfoFsPluginTest;
