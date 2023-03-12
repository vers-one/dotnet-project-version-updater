import { promises as fs } from "fs";
import fastGlob from "fast-glob";
import { FileUpdateResult, VersionUpdateResult } from "./plugins/plugin";
import Plugins from "./plugins/plugins";
import VersionUtils, { VersionUpdateRule } from "./utils/version-utils";

export interface UpdaterResult
{
    filePath: string;
    fileTypeName: string;
    updatedVersions: VersionUpdateResult[];
}

async function update(filePathPattern: string, newVersion: string): Promise<UpdaterResult[]>
{
    const trimmedFilePathPattern = filePathPattern.trim();
    if (trimmedFilePathPattern.length === 0 || trimmedFilePathPattern === "\"\"")
    {
        throw new Error("File path pattern is empty.");
    }
    let parsedFilePathPatterns: string[];
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
    const result: UpdaterResult[] = [];
    for (const filePath of filePaths)
    {
        result.push(await updateFile(filePath, versionUpdateRule));
    }
    return result;
}

async function updateFile(filePath: string, versionUpdateRule: VersionUpdateRule): Promise<UpdaterResult>
{
    for (const plugin of Plugins)
    {
        if (plugin.isFileTypeSupported(filePath))
        {
            const fileContent: string = await fs.readFile(filePath, "utf-8");
            const fileUpdateResult: FileUpdateResult | null = plugin.updateFile(fileContent, versionUpdateRule);
            if (fileUpdateResult === null)
            {
                throw new Error(`No version information found in ${filePath}`);
            }
            await fs.writeFile(filePath, fileUpdateResult.newFileContent, "utf-8");
            const result: UpdaterResult =
            {
                filePath,
                fileTypeName: plugin.fileTypeName,
                updatedVersions: fileUpdateResult.updatedVersions
            };
            return result;
        }
    }
    throw new Error(`Unsupported file type for file: ${filePath}`);
}

export default
{
    update
};
