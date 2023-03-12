import Plugin, { PluginVersionRegex, VersionPartDelimiter } from "./plugin";

const VERSION_TAG_REGEX: RegExp = /<Version>(.*)<\/Version>/i;
const ASSEMBLY_VERSION_TAG_REGEX: RegExp = /<AssemblyVersion>(.*)<\/AssemblyVersion>/i;
const FILE_VERSION_TAG_REGEX: RegExp = /<FileVersion>(.*)<\/FileVersion>/i;

export default class PropsPlugin extends Plugin
{
    constructor()
    {
        const versionRegexes: PluginVersionRegex[] =
        [
            {
                regex: VERSION_TAG_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "<Version> tag"
            },
            {
                regex: ASSEMBLY_VERSION_TAG_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "<AssemblyVersion> tag"
            },
            {
                regex: FILE_VERSION_TAG_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "<FileVersion> tag"
            }
        ];
        super(versionRegexes);
    }

    get fileTypeName(): string
    {
        return "MSBuild properties file";
    }

    isFileTypeSupported(filePath: string): boolean
    {
        return filePath.toLowerCase().endsWith(".props");
    }
}
