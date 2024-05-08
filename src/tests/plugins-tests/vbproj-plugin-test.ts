import type { PluginTest } from "./plugin-test";
import VbProjPlugin from "../../plugins/vbproj-plugin";

const vbProjPluginTest: PluginTest =
{
    plugin: new VbProjPlugin(),
    input: `<Project Sdk="Microsoft.NET.Sdk">\n<PropertyGroup>\n` +
        `<Version>1.2.3</Version>\n<VersionPrefix>1.2.3</VersionPrefix>\n<AssemblyVersion>1.2.3</AssemblyVersion>\n<FileVersion>1.2.3</FileVersion>\n` +
        `</PropertyGroup>\n</Project>`,
    newVersion: "4.5.6",
    tagTests:
    [{
        tag: "*",
        expectedResult: `<Project Sdk="Microsoft.NET.Sdk">\n<PropertyGroup>\n` +
            `<Version>4.5.6</Version>\n<VersionPrefix>4.5.6</VersionPrefix>\n<AssemblyVersion>4.5.6</AssemblyVersion>\n<FileVersion>4.5.6</FileVersion>\n` +
            `</PropertyGroup>\n</Project>`
    },
    {
        tag: "version",
        expectedResult: `<Project Sdk="Microsoft.NET.Sdk">\n<PropertyGroup>\n` +
            `<Version>4.5.6</Version>\n<VersionPrefix>1.2.3</VersionPrefix>\n<AssemblyVersion>1.2.3</AssemblyVersion>\n<FileVersion>1.2.3</FileVersion>\n` +
            `</PropertyGroup>\n</Project>`
    },
    {
        tag: "versionprefix",
        expectedResult: `<Project Sdk="Microsoft.NET.Sdk">\n<PropertyGroup>\n` +
            `<Version>1.2.3</Version>\n<VersionPrefix>4.5.6</VersionPrefix>\n<AssemblyVersion>1.2.3</AssemblyVersion>\n<FileVersion>1.2.3</FileVersion>\n` +
            `</PropertyGroup>\n</Project>`
    },
    {
        tag: "assemblyversion",
        expectedResult: `<Project Sdk="Microsoft.NET.Sdk">\n<PropertyGroup>\n` +
            `<Version>1.2.3</Version>\n<VersionPrefix>1.2.3</VersionPrefix>\n<AssemblyVersion>4.5.6</AssemblyVersion>\n<FileVersion>1.2.3</FileVersion>\n` +
            `</PropertyGroup>\n</Project>`
    },
    {
        tag: "fileversion",
        expectedResult: `<Project Sdk="Microsoft.NET.Sdk">\n<PropertyGroup>\n` +
            `<Version>1.2.3</Version>\n<VersionPrefix>1.2.3</VersionPrefix>\n<AssemblyVersion>1.2.3</AssemblyVersion>\n<FileVersion>4.5.6</FileVersion>\n` +
            `</PropertyGroup>\n</Project>`
    }]
};

export default vbProjPluginTest;
