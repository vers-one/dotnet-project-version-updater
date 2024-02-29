import Plugin, { PluginVersionRegex, VersionPartDelimiter } from "./plugin";

const VERSION_TAG_REGEX: RegExp = /<Version>(.*)<\/Version>/i;
const VERSION_PREFIX_TAG_REGEX: RegExp = /<VersionPrefix>(.*)<\/VersionPrefix>/i;
const ASSEMBLY_VERSION_TAG_REGEX: RegExp = /<AssemblyVersion>(.*)<\/AssemblyVersion>/i;
const FILE_VERSION_TAG_REGEX: RegExp = /<FileVersion>(.*)<\/FileVersion>/i;

export default class VbProjPlugin extends Plugin
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
                regex: VERSION_PREFIX_TAG_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "<VersionPrefix> tag"
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
        return "Visual Basic project file";
    }

    isFileTypeSupported(filePath: string): boolean
    {
        return filePath.toLowerCase().endsWith(".vbproj");
    }
}
