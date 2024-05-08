import Plugin, { PluginTag, VersionPartDelimiter } from "./plugin";

const VERSION_TAG_REGEX: RegExp = /<Version>(.*)<\/Version>/;
const VERSION_PREFIX_TAG_REGEX: RegExp = /<VersionPrefix>(.*)<\/VersionPrefix>/;
const ASSEMBLY_VERSION_TAG_REGEX: RegExp = /<AssemblyVersion>(.*)<\/AssemblyVersion>/;
const FILE_VERSION_TAG_REGEX: RegExp = /<FileVersion>(.*)<\/FileVersion>/;

export default class FsProjPlugin extends Plugin
{
    constructor()
    {
        const tags: PluginTag[] =
        [
            {
                tagName: "version",
                regex: VERSION_TAG_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "<Version> tag"
            },
            {
                tagName: "versionprefix",
                regex: VERSION_PREFIX_TAG_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "<VersionPrefix> tag"
            },
            {
                tagName: "assemblyversion",
                regex: ASSEMBLY_VERSION_TAG_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "<AssemblyVersion> tag"
            },
            {
                tagName: "fileversion",
                regex: FILE_VERSION_TAG_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "<FileVersion> tag"
            }
        ];
        super(tags);
    }

    get pluginName(): string
    {
        return "fsproj";
    }

    get fileTypeName(): string
    {
        return "F# project file";
    }

    isFileTypeSupported(filePath: string): boolean
    {
        return filePath.toLowerCase().endsWith(".fsproj");
    }
}
