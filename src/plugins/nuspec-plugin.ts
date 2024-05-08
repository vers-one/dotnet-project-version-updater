import Plugin, { PluginTag, VersionPartDelimiter } from "./plugin";

const VERSION_TAG_REGEX: RegExp = /<Version>(.*)<\/Version>/;

export default class NuspecPlugin extends Plugin
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
            }
        ];
        super(tags);
    }

    get pluginName(): string
    {
        return "nuspec";
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
