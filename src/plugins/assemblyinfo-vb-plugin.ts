import Plugin, { PluginTag, VersionPartDelimiter } from "./plugin";

const ASSEMBLY_VERSION_ATTRIBUTE_REGEX: RegExp = /^\s*<assembly:\s*AssemblyVersion\(\s*"(.*)"\s*\)>/;
const ASSEMBLY_FILE_VERSION_ATTRIBUTE_REGEX: RegExp = /^\s*<assembly:\s*AssemblyFileVersion\(\s*"(.*)"\s*\)>/;
const ASSEMBLY_INFORMATIONAL_VERSION_ATTRIBUTE_REGEX: RegExp = /^\s*<assembly:\s*AssemblyInformationalVersion\(\s*"(.*)"\s*\)>/;

export default class AssemblyInfoVbPlugin extends Plugin
{
    constructor()
    {
        const tags: PluginTag[] =
        [
            {
                tagName: "assemblyversion",
                regex: ASSEMBLY_VERSION_ATTRIBUTE_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "AssemblyVersion attribute"
            },
            {
                tagName: "assemblyfileversion",
                regex: ASSEMBLY_FILE_VERSION_ATTRIBUTE_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "AssemblyFileVersion attribute"
            },
            {
                tagName: "assemblyinformationalversion",
                regex: ASSEMBLY_INFORMATIONAL_VERSION_ATTRIBUTE_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "AssemblyInformationalVersion attribute"
            }
        ];
        super(tags);
    }

    get pluginName(): string
    {
        return "assemblyinfo-vb";
    }

    get fileTypeName(): string
    {
        return "Visual Basic assembly info source file";
    }

    isFileTypeSupported(filePath: string): boolean
    {
        return filePath.toLowerCase().endsWith(".vb");
    }
};
