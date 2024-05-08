import type { PluginTest } from "./plugin-test";
import PropsPlugin from "../../plugins/props-plugin";

const propsPluginTest: PluginTest =
{
    plugin: new PropsPlugin(),
    input: `<Project>\n<PropertyGroup>\n` +
        `<Version>1.2.3</Version>\n<VersionPrefix>1.2.3</VersionPrefix>\n<AssemblyVersion>1.2.3</AssemblyVersion>\n` +
        `<FileVersion>1.2.3</FileVersion>\n<InformationalVersion>1.2.3</InformationalVersion>` +
        `</PropertyGroup>\n</Project>`,
    newVersion: "4.5.6",
    tagTests:
    [{
        tag: "*",
        expectedResult: `<Project>\n<PropertyGroup>\n` +
            `<Version>4.5.6</Version>\n<VersionPrefix>4.5.6</VersionPrefix>\n<AssemblyVersion>4.5.6</AssemblyVersion>\n` +
            `<FileVersion>4.5.6</FileVersion>\n<InformationalVersion>4.5.6</InformationalVersion>` +
            `</PropertyGroup>\n</Project>`
    },
    {
        tag: "version",
        expectedResult: `<Project>\n<PropertyGroup>\n` +
            `<Version>4.5.6</Version>\n<VersionPrefix>1.2.3</VersionPrefix>\n<AssemblyVersion>1.2.3</AssemblyVersion>\n` +
            `<FileVersion>1.2.3</FileVersion>\n<InformationalVersion>1.2.3</InformationalVersion>` +
            `</PropertyGroup>\n</Project>`
    },
    {
        tag: "versionprefix",
        expectedResult: `<Project>\n<PropertyGroup>\n` +
            `<Version>1.2.3</Version>\n<VersionPrefix>4.5.6</VersionPrefix>\n<AssemblyVersion>1.2.3</AssemblyVersion>\n` +
            `<FileVersion>1.2.3</FileVersion>\n<InformationalVersion>1.2.3</InformationalVersion>` +
            `</PropertyGroup>\n</Project>`
    },
    {
        tag: "assemblyversion",
        expectedResult: `<Project>\n<PropertyGroup>\n` +
            `<Version>1.2.3</Version>\n<VersionPrefix>1.2.3</VersionPrefix>\n<AssemblyVersion>4.5.6</AssemblyVersion>\n` +
            `<FileVersion>1.2.3</FileVersion>\n<InformationalVersion>1.2.3</InformationalVersion>` +
            `</PropertyGroup>\n</Project>`
    },
    {
        tag: "fileversion",
        expectedResult: `<Project>\n<PropertyGroup>\n` +
            `<Version>1.2.3</Version>\n<VersionPrefix>1.2.3</VersionPrefix>\n<AssemblyVersion>1.2.3</AssemblyVersion>\n` +
            `<FileVersion>4.5.6</FileVersion>\n<InformationalVersion>1.2.3</InformationalVersion>` +
            `</PropertyGroup>\n</Project>`
    },
    {
        tag: "informationalversion",
        expectedResult: `<Project>\n<PropertyGroup>\n` +
            `<Version>1.2.3</Version>\n<VersionPrefix>1.2.3</VersionPrefix>\n<AssemblyVersion>1.2.3</AssemblyVersion>\n` +
            `<FileVersion>1.2.3</FileVersion>\n<InformationalVersion>4.5.6</InformationalVersion>` +
            `</PropertyGroup>\n</Project>`
    }]
};

export default propsPluginTest;
