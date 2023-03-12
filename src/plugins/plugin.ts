import VersionUtils, { Version, VersionUpdateRule } from "../utils/version-utils";

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

export interface PluginVersionRegex
{
    regex: RegExp;
    versionPartDelimiter: VersionPartDelimiter;
    versionType: string;
}

export default abstract class Plugin {
    private versionRegexes: PluginVersionRegex[];

    constructor(versionRegexes: PluginVersionRegex[])
    {
        this.versionRegexes = versionRegexes;
    }
    
    abstract get fileTypeName(): string;
    abstract isFileTypeSupported(filePath: string): boolean;

    updateFile(fileContent: string, versionUpdateRule: VersionUpdateRule): FileUpdateResult | null
    {
        const updatedVersions: VersionUpdateResult[] = [];
        for (const versionRegex of this.versionRegexes)
        {
            const matches: RegExpExecArray | null = versionRegex.regex.exec(fileContent);
            if (matches && matches.length == 2)
            {
                const oldVersionPatternMatch: string = matches[0];
                const oldVersionString: string = matches[1].trim();
                let newVersionString: string;
                switch (versionRegex.versionPartDelimiter)
                {
                    case VersionPartDelimiter.DOT:
                        newVersionString =
                            VersionUtils.updateNonParsedVersion(oldVersionString, versionUpdateRule, VersionUtils.VERSION_NUMBER_WITH_DOT_DELIMITER_REGEX, ".");
                        break;
                    case VersionPartDelimiter.COMMA:
                        const parsedOldVersion: Version = VersionUtils.parseVersion(oldVersionString, VersionUtils.VERSION_NUMBER_WITH_COMMA_DELIMITER_REGEX);
                        const newVersion: Version = VersionUtils.updateParsedVersion(parsedOldVersion, versionUpdateRule);
                        newVersionString = VersionUtils.formatVersion(newVersion, ",", true);
                        break;
                    default:
                        throw new Error(`Unexpected version part delimiter: ${versionRegex.versionPartDelimiter}.`);
                }
                const oldVersionPatternMatchReplacement: string = oldVersionPatternMatch.replace(oldVersionString, newVersionString);
                fileContent = fileContent.replace(oldVersionPatternMatch, oldVersionPatternMatchReplacement);
                updatedVersions.push({
                    versionType: versionRegex.versionType,
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
