import { promises as fs } from "fs";
import fastGlob from "fast-glob";
import VersionUtils, { VersionUpdateRule } from "./version-utils";

const VERSION_TAG_REGEX: RegExp = /<Version>(.*)<\/Version>/i;
const ASSEMBLY_VERSION_ATTRIBUTE_REGEX: RegExp = /\[assembly: AssemblyVersion\("(.*)"\)]/i;
const ASSEMBLY_FILE_VERSION_ATTRIBUTE_REGEX: RegExp = /\[assembly: AssemblyFileVersion\("(.*)"\)]/i;

export interface UpdateResult
{
    filePath: string;
    oldVersion: string;
    newVersion: string;
}

async function update(filePathPattern: string, newVersion: string): Promise<UpdateResult[]>
{
    const trimmedFilePathPattern = filePathPattern.trim();
    if (trimmedFilePathPattern.length === 0 || trimmedFilePathPattern === "\"\"")
    {
        throw new Error("File path pattern is empty.");
    }
    let parsedFilePathPatterns : string[];
    try
    {
        let filePathPatternWithQuotes = trimmedFilePathPattern;
        if (!filePathPatternWithQuotes.startsWith("\""))
        {
            filePathPatternWithQuotes = `"${filePathPatternWithQuotes}"`;
        }
        parsedFilePathPatterns = JSON.parse("[" + filePathPatternWithQuotes + "]");
    }
    catch
    {
        throw new Error(`Invalid file path pattern: ${filePathPattern}`);
    }
    if (!Array.isArray(parsedFilePathPatterns))
    {
        throw new Error(`Invalid file path pattern: ${filePathPattern}`);
    }
    const filePaths = await fastGlob(parsedFilePathPatterns, { dot: true });
    if (filePaths.length === 0)
    {
        throw new Error(`There are no files matching the specified file path pattern: ${filePathPattern}`);
    }
    const versionUpdateRule: VersionUpdateRule = VersionUtils.parseVersionUpdateRule(newVersion);
    const result: UpdateResult[] = [];
    for (const filePath of filePaths)
    {
        result.push(await updateFile(filePath, versionUpdateRule));
    }
    return result;
}

async function updateFile(filePath: string, versionUpdateRule: VersionUpdateRule): Promise<UpdateResult>
{
    let regexes: RegExp[];
    const lowerCaseFilePath = filePath.toLowerCase();
    if (lowerCaseFilePath.endsWith(".csproj") || lowerCaseFilePath.endsWith(".prop") || lowerCaseFilePath.endsWith(".nuspec"))
    {
        regexes = [ VERSION_TAG_REGEX ];
    }
    else if (lowerCaseFilePath.endsWith(".cs"))
    {
        regexes = [ ASSEMBLY_VERSION_ATTRIBUTE_REGEX, ASSEMBLY_FILE_VERSION_ATTRIBUTE_REGEX ];
    }
    else
    {
        throw new Error(`Unsupported file type for file: ${filePath}`);
    }
    let fileContent: string = await fs.readFile(filePath, "utf-8");
    let matchesFound: boolean = false;
    let oldVersion: string = "";
    let newVersion: string = "";
    for (const regex of regexes)
    {
        const matches: RegExpExecArray | null = regex.exec(fileContent);
        if (matches && matches.length == 2)
        {
            matchesFound = true;
            const oldVersionTag: string = matches[0];
            oldVersion = matches[1].trim();
            newVersion = VersionUtils.getNewVersion(oldVersion, versionUpdateRule);
            const newVersionTag: string = oldVersionTag.replace(oldVersion, newVersion);
            fileContent = fileContent.replace(oldVersionTag, newVersionTag);
            await fs.writeFile(filePath, fileContent, "utf-8");
        }
    }
    if (matchesFound)
    {
        return { filePath, oldVersion, newVersion };
    }
    else
    {
        throw new Error(`No version information found in ${filePath}`);
    }
}

export default
{
    update
};
