import Plugin, { PluginTag, VersionPartDelimiter } from "./plugin";

const ASSEMBLY_VERSION_ATTRIBUTE_REGEX: RegExp = /^\s*\[assembly:\s*AssemblyVersionAttribute\(\s*L"(.*)"\s*\)]/;
const ASSEMBLY_FILE_VERSION_ATTRIBUTE_REGEX: RegExp = /^\s*\[assembly:\s*AssemblyFileVersionAttribute\(\s*L"(.*)"\s*\)]/;

export default class AssemblyInfoCppPlugin extends Plugin
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
            }
        ];
        super(tags);
    }

    get pluginName(): string
    {
        return "assemblyinfo-cpp";
    }

    get fileTypeName(): string
    {
        return "C++/CLI assembly info source file";
    }

    isFileTypeSupported(filePath: string): boolean
    {
        return filePath.toLowerCase().endsWith(".cpp");
    }
};
