const BUMP_MAJOR_COMMAND = "bump-major";
const BUMP_MINOR_COMMAND = "bump-minor";
const BUMP_BUILD_COMMAND = "bump-build";
const BUMP_REVISION_COMMAND = "bump-revision";
const VERSION_UPDATE_RULE_REGEX: RegExp = /(\?|\*|\^|\d+)\.?(\?|\*|\^|\d+)?\.?(\?|\*|\^|\d+)?\.?(\?|\*|\^|\d+)?/;
const VERSION_NUMBER_REGEX: RegExp = /(\d+)\.?(\d+)?\.?(\d+)?\.?(\d+)?/;

export interface VersionUpdateRule
{
    updateMode: VersionUpdateMode;
    explicitVersion: string | null;
    updatePattern: VersionUpdatePattern | null;
}

enum VersionUpdateMode
{
    SET_EXPLICIT_VERSION,
    USE_PATTERN
}

interface VersionUpdatePattern
{
    build: VersionPartUpdateRule;
    major: VersionPartUpdateRule;
    minor: VersionPartUpdateRule;
    revision: VersionPartUpdateRule;
}

interface VersionPartUpdateRule
{
    updateMode: VersionPartUpdateMode;
    overwriteTo: number | null;
}

enum VersionPartUpdateMode
{
    LEAVE_UNCHANGED,
    LEAVE_UNCHANGED_SET_MISSING_TO_ZERO,
    BUMP,
    OVERWRITE,
    REMOVE
}

interface Version
{
    major: number;
    minor: number | null;
    build: number | null;
    revision: number | null;
}

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
    let matches: RegExpExecArray | null = VERSION_NUMBER_REGEX.exec(input);
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

function getNewVersion(currentVersion: string, versionUpdateRule: VersionUpdateRule): string
{
    if (versionUpdateRule.updateMode === VersionUpdateMode.SET_EXPLICIT_VERSION)
    {
        return versionUpdateRule.explicitVersion!;
    }
    const version: Version = parseVersion(currentVersion);
    const updatePattern: VersionUpdatePattern = versionUpdateRule.updatePattern!;
    version.major = getNewVersionPart(version.major, updatePattern.major) ?? 0;
    version.minor = getNewVersionPart(version.minor, updatePattern.minor);
    version.build = getNewVersionPart(version.build, updatePattern.build);
    version.revision = getNewVersionPart(version.revision, updatePattern.revision);
    return formatVersion(version);
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

function parseVersion(version: string): Version
{
    const matches: RegExpExecArray | null = VERSION_NUMBER_REGEX.exec(version.trim());
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
        throw new Error(`Unsupported version format: ${version}`);
    }
}

function formatVersion(version: Version): string
{
    let result: string = version.major.toString();
    if (version.minor !== null)
    {
        result += "." + version.minor;
        if (version.build !== null)
        {
            result += "." + version.build;
            if (version.revision !== null)
            {
                result += "." + version.revision;
            }
        }
    }
    return result;
}

export default
{
    parseVersionUpdateRule,
    getNewVersion
};
