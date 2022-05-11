import { promises as fs, rmSync } from "fs";

const VERSION_TAG_REGEX: RegExp = /<Version>(.*)<\/Version>/i;
const ASSEMBLY_VERSION_ATTRIBUTE_REGEX: RegExp = /\[assembly: AssemblyVersion\("(.*)"\)]/i;
const ASSEMBLY_FILE_VERSION_ATTRIBUTE_REGEX: RegExp = /\[assembly: AssemblyFileVersion\("(.*)"\)]/i;
const VERSION_NUMBER_REGEX: RegExp = /(\d+)\.?(\d+)?\.?(\d+)?\.?(\d+)?/;
const BUMP_MAJOR_COMMAND = "bump-major";
const BUMP_MINOR_COMMAND = "bump-minor";
const BUMP_BUILD_COMMAND = "bump-build";
const BUMP_REVISION_COMMAND = "bump-revision";

export interface UpdateResult
{
    oldVersion: string;
    newVersion: string;
}

enum UpdateMode
{
    BUMP_MAJOR_NUMBER,
    BUMP_MINOR_NUMBER,
    BUMP_BUILD_NUMBER,
    BUMP_REVISION_NUMBER,
    SET_VERSION
}

interface Version
{
    major: number;
    minor: number | null;
    build: number | null;
    revision: number | null;
}

async function update(filePath: string, newVersion: string): Promise<UpdateResult>
{
    if (!filePath || filePath.trim().length === 0)
    {
        throw new Error("File path is empty.");
    }
    let regexes: RegExp[];
    if (filePath.toLowerCase().endsWith(".csproj") || filePath.toLowerCase().endsWith(".nuspec"))
    {
        regexes = [ VERSION_TAG_REGEX ];
    }
    else if (filePath.toLowerCase().endsWith(".cs"))
    {
        regexes = [ ASSEMBLY_VERSION_ATTRIBUTE_REGEX, ASSEMBLY_FILE_VERSION_ATTRIBUTE_REGEX ];
    }
    else
    {
        throw new Error(`Unsupported file type for file: ${filePath}`);
    }
    const updateMode: UpdateMode = parseUpdateMode(newVersion);
    let fileContent: string = await fs.readFile(filePath, "utf-8");
    let matchesFound: boolean = false;
    let oldVersion: string = "";
    for (const regex of regexes)
    {
        const matches: RegExpExecArray | null = regex.exec(fileContent);
        if (matches && matches.length == 2)
        {
            matchesFound = true;
            const oldVersionTag: string = matches[0];
            oldVersion = matches[1].trim();
            if (updateMode === UpdateMode.BUMP_MAJOR_NUMBER || updateMode === UpdateMode.BUMP_MINOR_NUMBER ||
                updateMode === UpdateMode.BUMP_BUILD_NUMBER || updateMode === UpdateMode.BUMP_REVISION_NUMBER)
            {
                newVersion = bumpVersion(oldVersion, updateMode);
            }
            const newVersionTag: string = oldVersionTag.replace(oldVersion, newVersion);
            fileContent = fileContent.replace(oldVersionTag, newVersionTag);
            await fs.writeFile(filePath, fileContent, "utf-8");
        }
    }
    if (matchesFound)
    {
        return { oldVersion, newVersion };
    }
    else
    {
        throw new Error(`No version information found in ${filePath}`);
    }
}

function parseVersion(version: string): Version
{
    const matches: RegExpExecArray | null = VERSION_NUMBER_REGEX.exec(version.trim());
    if (matches)
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
    if (version.minor)
    {
        result += "." + version.minor;
        if (version.build)
        {
            result += "." + version.build;
            if (version.revision)
            {
                result += "." + version.revision;
            }
        }
    }
    return result;
}

function parseUpdateMode(input: string): UpdateMode
{
    input = input.trim().toLowerCase();
    switch (input)
    {
        case BUMP_MAJOR_COMMAND:
            return UpdateMode.BUMP_MAJOR_NUMBER;
        case BUMP_MINOR_COMMAND:
            return UpdateMode.BUMP_MINOR_NUMBER;
        case BUMP_BUILD_COMMAND:
            return UpdateMode.BUMP_BUILD_NUMBER;
        case BUMP_REVISION_COMMAND:
            return UpdateMode.BUMP_REVISION_NUMBER;
        default:
            return UpdateMode.SET_VERSION;
    }
}

function bumpVersion(oldVersion: string, updateMode: UpdateMode): string
{
    const parsedVersion: Version = parseVersion(oldVersion);
    switch (updateMode)
    {
        case UpdateMode.BUMP_MAJOR_NUMBER:
            parsedVersion.major++;
            break;
        case UpdateMode.BUMP_MINOR_NUMBER:
            parsedVersion.minor = parsedVersion.minor ? parsedVersion.minor + 1 : 1;
            break;
        case UpdateMode.BUMP_BUILD_NUMBER:
            parsedVersion.build = parsedVersion.build ? parsedVersion.build + 1 : 1;
            break;
        case UpdateMode.BUMP_REVISION_NUMBER:
            parsedVersion.revision = parsedVersion.revision ? parsedVersion.revision + 1 : 1;
            break;
        default:
            throw new Error(`Unexpected update mode: ${updateMode}.`);
    }
    return formatVersion(parsedVersion);
}

export default
{
    update
};
