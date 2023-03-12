import Plugin, { PluginVersionRegex, VersionPartDelimiter } from "./plugin";

const VERSION_TAG_REGEX: RegExp = /<Version>(.*)<\/Version>/i;

export default class NuspecPlugin extends Plugin
{
    constructor()
    {
        const versionRegexes: PluginVersionRegex[] =
        [
            {
                regex: VERSION_TAG_REGEX,
                versionPartDelimiter: VersionPartDelimiter.DOT,
                versionType: "<Version> tag"
            }
        ];
        super(versionRegexes);
    }

    get fileTypeName(): string
    {
        return "Nuget package manifest file";
    }

    isFileTypeSupported(filePath: string): boolean
    {
        return filePath.toLowerCase().endsWith(".nuspec");
    }
}
