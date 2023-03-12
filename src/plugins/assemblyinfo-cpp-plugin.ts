import Plugin, { PluginVersionRegex, VersionPartDelimiter } from "./plugin";

const ASSEMBLY_VERSION_ATTRIBUTE_REGEX: RegExp = /\[assembly:\s*AssemblyVersionAttribute\(\s*L"(.*)"\s*\)]/i;
const ASSEMBLY_FILE_VERSION_ATTRIBUTE_REGEX: RegExp = /\[assembly:\s*AssemblyFileVersionAttribute\(\s*L"(.*)"\s*\)]/i;

export default class AssemblyInfoCppPlugin extends Plugin
{
    constructor()
    {
        const versionRegexes: PluginVersionRegex[] =
        [
            {
                regex: ASSEMBLY_VERSION_ATTRIBUTE_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "AssemblyVersion attribute"
            },
            {
                regex: ASSEMBLY_FILE_VERSION_ATTRIBUTE_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "AssemblyFileVersion attribute"
            }
        ];
        super(versionRegexes);
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
