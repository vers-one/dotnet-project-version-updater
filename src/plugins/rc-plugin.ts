import Plugin, { PluginVersionRegex, VersionPartDelimiter } from "./plugin";

const FILEVERSION_REGEX: RegExp = /FILEVERSION\s*(.*)/i;
const FILEVERSION_STRING_REGEX: RegExp = /VALUE\s*"FileVersion",\s*"(.*)"/i;
const PRODUCTVERSION_REGEX: RegExp = /PRODUCTVERSION\s*(.*)/i;
const PRODUCTVERSION_STRING_REGEX: RegExp = /VALUE\s*"ProductVersion",\s*"(.*)"/i;

export default class RcPlugin extends Plugin
{
    constructor()
    {
        const versionRegexes: PluginVersionRegex[] =
        [
            {
                regex: FILEVERSION_REGEX,
                versionPartDelimiter: VersionPartDelimiter.COMMA,
                versionType: "FILEVERSION parameter"
            },
            {
                regex: FILEVERSION_STRING_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "FileVersion string"
            },
            {
                regex: PRODUCTVERSION_REGEX,
                versionPartDelimiter: VersionPartDelimiter.COMMA,
                versionType: "PRODUCTVERSION parameter"
            },
            {
                regex: PRODUCTVERSION_STRING_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "ProductVersion string"
            }
        ];
        super(versionRegexes);
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
