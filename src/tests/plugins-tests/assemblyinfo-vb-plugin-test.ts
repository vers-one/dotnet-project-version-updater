import type { PluginTest } from "./plugin-test";
import AssemblyInfoVbPlugin from "../../plugins/assemblyinfo-vb-plugin";

const assemblyInfoVbPluginTest: PluginTest =
{
    plugin: new AssemblyInfoVbPlugin(),
    input: `<Assembly: AssemblyVersion("1.2.3")>\n<Assembly: AssemblyFileVersion("1.2.3")>\n<Assembly: AssemblyInformationalVersion("1.2.3")>`,
    newVersion: "4.5.6",
    tagTests:
    [{
        tag: "*",
        expectedResult: `<Assembly: AssemblyVersion("4.5.6")>\n<Assembly: AssemblyFileVersion("4.5.6")>\n` +
            `<Assembly: AssemblyInformationalVersion("4.5.6")>`
    },
    {
        tag: "assemblyversion",
        expectedResult: `<Assembly: AssemblyVersion("4.5.6")>\n<Assembly: AssemblyFileVersion("1.2.3")>\n` +
            `<Assembly: AssemblyInformationalVersion("1.2.3")>`
    },
    {
        tag: "assemblyfileversion",
        expectedResult: `<Assembly: AssemblyVersion("1.2.3")>\n<Assembly: AssemblyFileVersion("4.5.6")>\n` +
            `<Assembly: AssemblyInformationalVersion("1.2.3")>`
    },
    {
        tag: "assemblyinformationalversion",
        expectedResult: `<Assembly: AssemblyVersion("1.2.3")>\n<Assembly: AssemblyFileVersion("1.2.3")>\n` +
            `<Assembly: AssemblyInformationalVersion("4.5.6")>`
    }]
};

export default assemblyInfoVbPluginTest;
