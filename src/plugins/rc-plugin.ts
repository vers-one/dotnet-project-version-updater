import Plugin, { PluginTag, VersionPartDelimiter } from "./plugin";

const FILEVERSION_REGEX: RegExp = /FILEVERSION\s+(\d+,\d+,\d+,\d+)/;
const FILEVERSION_STRING_REGEX: RegExp = /VALUE\s*"FileVersion",\s*"(.*)"/;
const PRODUCTVERSION_REGEX: RegExp = /PRODUCTVERSION\s+(\d+,\d+,\d+,\d+)/;
const PRODUCTVERSION_STRING_REGEX: RegExp = /VALUE\s*"ProductVersion",\s*"(.*)"/;

export default class RcPlugin extends Plugin
{
    constructor()
    {
        const tags: PluginTag[] =
        [
            {
                tagName: "fileversion-param",
                regex: FILEVERSION_REGEX,
                versionPartDelimiter: VersionPartDelimiter.COMMA,
                versionType: "FILEVERSION parameter"
            },
            {
                tagName: "fileversion-string",
                regex: FILEVERSION_STRING_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "FileVersion string"
            },
            {
                tagName: "productversion-param",
                regex: PRODUCTVERSION_REGEX,
                versionPartDelimiter: VersionPartDelimiter.COMMA,
                versionType: "PRODUCTVERSION parameter"
            },
            {
                tagName: "productversion-string",
                regex: PRODUCTVERSION_STRING_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "ProductVersion string"
            }
        ];
        super(tags);
    }

    get pluginName(): string
    {
        return "rc";
    }

    get fileTypeName(): string
    {
        return "C++ resource file";
    }

    isFileTypeSupported(filePath: string): boolean
    {
        return filePath.toLowerCase().endsWith(".rc");
    }
};
