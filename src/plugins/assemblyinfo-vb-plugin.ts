import Plugin, { PluginVersionRegex, VersionPartDelimiter } from "./plugin";

const ASSEMBLY_VERSION_ATTRIBUTE_REGEX: RegExp = /<assembly:\s*AssemblyVersion\(\s*"(.*)"\s*\)>/i;
const ASSEMBLY_FILE_VERSION_ATTRIBUTE_REGEX: RegExp = /<assembly:\s*AssemblyFileVersion\(\s*"(.*)"\s*\)>/i;

export default class AssemblyInfoVbPlugin extends Plugin
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
        return "Visual Basic assembly info source file";
    }

    isFileTypeSupported(filePath: string): boolean
    {
        return filePath.toLowerCase().endsWith(".vb");
    }
};
