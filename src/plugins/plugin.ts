import type { TagFilter } from "../types/filter-types";
import type { Version, VersionUpdateRule } from "../types/version-types";
import VersionUtils from "../utils/version-utils";

export interface VersionUpdateResult
{
    versionType: string;
    oldVersion: string;
    newVersion: string;
}

export interface FileUpdateResult
{
    newFileContent: string;
    updatedVersions: VersionUpdateResult[];
}

export enum VersionPartDelimiter
{
    DOT,
    COMMA
}

export interface PluginTag
{
    tagName: string;
    regex: RegExp;
    versionPartDelimiter: VersionPartDelimiter;
    versionType: string;
}

export default abstract class Plugin {
    #tags: PluginTag[];

    constructor(tags: PluginTag[])
    {
        this.#tags = tags;
    }
    
    abstract get pluginName(): string;
    abstract get fileTypeName(): string;
    abstract isFileTypeSupported(filePath: string): boolean;

    get tags(): PluginTag[]
    {
        return this.#tags;
    }

    updateFile(filePath: string, fileContent: string, versionUpdateRule: VersionUpdateRule, tagFilters: TagFilter[]): FileUpdateResult | null
    {
        const updatedVersions: VersionUpdateResult[] = [];
        const isMatchAllTagsFilter = tagFilters.length === 1 && tagFilters[0].tagName === "*";
        for (const tag of this.#tags)
        {
            if (!isMatchAllTagsFilter && tagFilters.find(tagFilter => tagFilter.tagName === tag.tagName) === undefined)
            {
                continue;
            }
            const regex: RegExp = new RegExp(tag.regex, "gim");
            const matches: RegExpExecArray | null = regex.exec(fileContent);
            if (matches)
            {
                if (matches.length < 2)
                {
                    throw new Error(`Expected to find 2 matches for regular expression "${regex}" but found only ${matches.length}.`);
                }
                if (regex.exec(fileContent) !== null)
                {
                    throw new Error(`Too many occurrences of the ${tag.versionType} found in the file: ${filePath}`);
                }
                const oldVersionPatternMatch: string = matches[0];
                const oldVersionString: string = matches[1].trim();
                let newVersionString: string;
                switch (tag.versionPartDelimiter)
                {
                    case VersionPartDelimiter.DOT:
                        newVersionString = VersionUtils.updateNonParsedVersion(oldVersionString, versionUpdateRule,
                            VersionUtils.VERSION_NUMBER_WITH_DOT_DELIMITER_REGEX, ".");
                        break;
                    case VersionPartDelimiter.COMMA:
                        const parsedOldVersion: Version = VersionUtils.parseVersion(oldVersionString,
                            VersionUtils.VERSION_NUMBER_WITH_COMMA_DELIMITER_REGEX);
                        const newVersion: Version = VersionUtils.updateParsedVersion(parsedOldVersion, versionUpdateRule);
                        newVersionString = VersionUtils.formatVersion(newVersion, ",", true);
                        break;
                    default:
                        throw new Error(`Unexpected version part delimiter: ${tag.versionPartDelimiter}.`);
                }
                const oldVersionPatternMatchReplacement: string = oldVersionPatternMatch.replace(oldVersionString, newVersionString);
                fileContent = fileContent.substring(0, matches.index) + oldVersionPatternMatchReplacement +
                    fileContent.substring(matches.index + oldVersionPatternMatch.length);
                updatedVersions.push({
                    versionType: tag.versionType,
                    oldVersion: oldVersionString,
                    newVersion: newVersionString
                });
            }
        }
        if (updatedVersions.length === 0)
        {
            return null;
        }
        else
        {
            const result: FileUpdateResult =
            {
                newFileContent: fileContent,
                updatedVersions
            };
            return result;
        }
    }
}
