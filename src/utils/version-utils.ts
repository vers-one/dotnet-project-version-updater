import type { Version, VersionPartUpdateRule, VersionUpdatePattern, VersionUpdateRule } from "../types/version-types";
import { VersionPartUpdateMode, VersionUpdateMode } from "../types/version-types";    

const BUMP_MAJOR_COMMAND = "bump-major";
const BUMP_MINOR_COMMAND = "bump-minor";
const BUMP_BUILD_COMMAND = "bump-build";
const BUMP_REVISION_COMMAND = "bump-revision";
const VERSION_UPDATE_RULE_REGEX: RegExp = /(\?|\*|\^|\d+)\.?(\?|\*|\^|\d+)?\.?(\?|\*|\^|\d+)?\.?(\?|\*|\^|\d+)?/;
const VERSION_NUMBER_WITH_DOT_DELIMITER_REGEX: RegExp = /(\d+)\.?(\d+)?\.?(\d+)?\.?(\d+)?/;
const VERSION_NUMBER_WITH_COMMA_DELIMITER_REGEX: RegExp = /(\d+)\,?(\d+)?\,?(\d+)?\,?(\d+)?/;

function parseVersionUpdateRule(input: string): VersionUpdateRule
{
    input = input.trim();
    if (input.length === 0)
    {
        throw new Error("Version input is empty.");
    }
    let result: VersionUpdateRule;
    switch (input.toLowerCase())
    {
        case BUMP_MAJOR_COMMAND:
            input = "^.?.?.?";
            break;
        case BUMP_MINOR_COMMAND:
            input = "*.^.?.?";
            break;
        case BUMP_BUILD_COMMAND:
            input = "*.*.^.?";
            break;
        case BUMP_REVISION_COMMAND:
            input = "*.*.*.^";
            break;
    }
    let matches: RegExpExecArray | null = VERSION_NUMBER_WITH_DOT_DELIMITER_REGEX.exec(input);
    if (matches && matches[0] === input)
    {
        result =
        {
            updateMode: VersionUpdateMode.SET_EXPLICIT_VERSION,
            explicitVersion: input,
            updatePattern: null
        };
    }
    else
    {
        matches = VERSION_UPDATE_RULE_REGEX.exec(input);
        if (matches && matches[0] === input)
        {
            result = 
            {
                updateMode: VersionUpdateMode.USE_PATTERN,
                explicitVersion: null,
                updatePattern:
                {
                    major: parseVersionPartUpdateRule(matches[1]),
                    minor: parseVersionPartUpdateRule(matches[2]),
                    build: parseVersionPartUpdateRule(matches[3]),
                    revision: parseVersionPartUpdateRule(matches[4])
                }
            };
        }
        else
        {
            result =
            {
                updateMode: VersionUpdateMode.SET_EXPLICIT_VERSION,
                explicitVersion: input,
                updatePattern: null
            };
        }
    }
    return result;
}

function updateNonParsedVersion(currentVersion: string, versionUpdateRule: VersionUpdateRule, versionNumberRegex: RegExp,
    versionPartDelimiter: string): string
{
    if (versionUpdateRule.updateMode === VersionUpdateMode.SET_EXPLICIT_VERSION)
    {
        return versionUpdateRule.explicitVersion!;
    }
    else
    {
        const currentParsedVersion: Version = parseVersion(currentVersion, versionNumberRegex);
        const newParsedVersion = updateParsedVersion(currentParsedVersion, versionUpdateRule);
        return formatVersion(newParsedVersion, versionPartDelimiter);
    }
}

function updateParsedVersion(currentVersion: Version, versionUpdateRule: VersionUpdateRule): Version
{
    if (versionUpdateRule.updateMode === VersionUpdateMode.SET_EXPLICIT_VERSION)
    {
        return parseVersion(versionUpdateRule.explicitVersion!, VERSION_NUMBER_WITH_DOT_DELIMITER_REGEX);
    }
    else
    {
        const updatePattern: VersionUpdatePattern = versionUpdateRule.updatePattern!;
        const result =
        {
            major: getNewVersionPart(currentVersion.major, updatePattern.major) ?? 0,
            minor: getNewVersionPart(currentVersion.minor, updatePattern.minor),
            build: getNewVersionPart(currentVersion.build, updatePattern.build),
            revision: getNewVersionPart(currentVersion.revision, updatePattern.revision)
        }
        return result;
    }
}

function parseVersionPartUpdateRule(input: string): VersionPartUpdateRule
{
    let result: VersionPartUpdateRule;
    if (input === "?")
    {
        result =
        {
            updateMode: VersionPartUpdateMode.LEAVE_UNCHANGED,
            overwriteTo: null
        };
    }
    else if (input === "*")
    {
        result =
        {
            updateMode: VersionPartUpdateMode.LEAVE_UNCHANGED_SET_MISSING_TO_ZERO,
            overwriteTo: null
        };
    }
    else if (input === "^")
    {
        result =
        {
            updateMode: VersionPartUpdateMode.BUMP,
            overwriteTo: null
        };
    }
    else
    {
        const partNumber: number = parseInt(input);
        if (!isNaN(partNumber))
        {
            result =
            {
                updateMode: VersionPartUpdateMode.OVERWRITE,
                overwriteTo: partNumber
            };
        }
        else
        {
            result =
            {
                updateMode: VersionPartUpdateMode.REMOVE,
                overwriteTo: null
            };
        }
    }
    return result;
}

function getNewVersionPart(currentVersionPart: number | null, versionPartUpdateRule: VersionPartUpdateRule): number | null
{
    switch (versionPartUpdateRule.updateMode)
    {
        case VersionPartUpdateMode.LEAVE_UNCHANGED:
            return currentVersionPart;
        case VersionPartUpdateMode.LEAVE_UNCHANGED_SET_MISSING_TO_ZERO:
            return currentVersionPart !== null ? currentVersionPart : 0;
        case VersionPartUpdateMode.BUMP:
            return currentVersionPart !== null ? currentVersionPart + 1 : 1;
        case VersionPartUpdateMode.OVERWRITE:
            return versionPartUpdateRule.overwriteTo;
        case VersionPartUpdateMode.REMOVE:
            return null;
    }
}

function parseVersion(version: string, versionNumberRegex: RegExp): Version
{
    const matches: RegExpExecArray | null = versionNumberRegex.exec(version.trim());
    if (matches && matches[0] === version)
    {
        const major: number = parseInt(matches[1]);
        const minor: number = parseInt(matches[2]);
        const build: number = parseInt(matches[3]);
        const revision: number = parseInt(matches[4]);
        const result: Version =
        {
            major,
            minor: !isNaN(minor) ? minor : null,
            build: !isNaN(build) ? build : null,
            revision: !isNaN(revision) ? revision : null,
        };
        return result;
    }
    else
    {
        throw new Error(`Version '${version}' doesn't match regular expression: ${versionNumberRegex}`);
    }
}

function formatVersion(version: Version, versionPartDelimiter: string = ".", includeTrailingZeros: boolean = false): string
{
    let result: string = version.major.toString();
    if (version.minor !== null || includeTrailingZeros)
    {
        result += versionPartDelimiter + (version.minor ?? 0);
        if (version.build !== null || includeTrailingZeros)
        {
            result += versionPartDelimiter + (version.build ?? 0);
            if (version.revision !== null || includeTrailingZeros)
            {
                result += versionPartDelimiter + (version.revision ?? 0);
            }
        }
    }
    return result;
}

export default
{
    VERSION_NUMBER_WITH_DOT_DELIMITER_REGEX,
    VERSION_NUMBER_WITH_COMMA_DELIMITER_REGEX,
    formatVersion,
    parseVersion,
    parseVersionUpdateRule,
    updateNonParsedVersion,
    updateParsedVersion
};
