import type { PluginTest } from "./plugin-test";
import AssemblyInfoCsPlugin from "../../plugins/assemblyinfo-cs-plugin";

const assemblyInfoCsPluginTest: PluginTest =
{
    plugin: new AssemblyInfoCsPlugin(),
    input: `[assembly: AssemblyVersion("1.2.3")]\n[assembly: AssemblyFileVersion("1.2.3")]\n[assembly: AssemblyInformationalVersion("1.2.3")]`,
    newVersion: "4.5.6",
    tagTests:
    [{
        tag: "*",
        expectedResult: `[assembly: AssemblyVersion("4.5.6")]\n[assembly: AssemblyFileVersion("4.5.6")]\n` +
            `[assembly: AssemblyInformationalVersion("4.5.6")]`
    },
    {
        tag: "assemblyversion",
        expectedResult: `[assembly: AssemblyVersion("4.5.6")]\n[assembly: AssemblyFileVersion("1.2.3")]\n` +
            `[assembly: AssemblyInformationalVersion("1.2.3")]`
    },
    {
        tag: "assemblyfileversion",
        expectedResult: `[assembly: AssemblyVersion("1.2.3")]\n[assembly: AssemblyFileVersion("4.5.6")]\n` +
            `[assembly: AssemblyInformationalVersion("1.2.3")]`
    },
    {
        tag: "assemblyinformationalversion",
        expectedResult: `[assembly: AssemblyVersion("1.2.3")]\n[assembly: AssemblyFileVersion("1.2.3")]\n` +
            `[assembly: AssemblyInformationalVersion("4.5.6")]`
    }]
};

export default assemblyInfoCsPluginTest;
