import type { PluginTest } from "./plugin-test";
import AssemblyInfoCppPlugin from "../../plugins/assemblyinfo-cpp-plugin";

const assemblyInfoCppPluginTest: PluginTest =
{
    plugin: new AssemblyInfoCppPlugin(),
    input: `[assembly:AssemblyVersionAttribute(L"1.2.3")];\n[assembly:AssemblyFileVersionAttribute(L"1.2.3")]`,
    newVersion: "4.5.6",
    tagTests:
    [{
        tag: "*",
        expectedResult: `[assembly:AssemblyVersionAttribute(L"4.5.6")];\n[assembly:AssemblyFileVersionAttribute(L"4.5.6")]`
    },
    {
        tag: "assemblyversion",
        expectedResult: `[assembly:AssemblyVersionAttribute(L"4.5.6")];\n[assembly:AssemblyFileVersionAttribute(L"1.2.3")]`
    },
    {
        tag: "assemblyfileversion",
        expectedResult: `[assembly:AssemblyVersionAttribute(L"1.2.3")];\n[assembly:AssemblyFileVersionAttribute(L"4.5.6")]`
    }]
};

export default assemblyInfoCppPluginTest;
