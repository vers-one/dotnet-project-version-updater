import { promises as fs } from "fs";
import fastGlob from "fast-glob";
import { FileUpdateResult, VersionUpdateResult } from "./plugins/plugin";
import type Plugin from "./plugins/plugin";
import Plugins from "./plugins/plugins";
import type { VersionUpdateRule } from "./types/version-types";
import VersionUtils from "./utils/version-utils";
import type { PluginFilter, TagFilter } from "./types/filter-types";
import FilterUtils from "./utils/filter-utils";

export interface UpdaterResult
{
    filePath: string;
    fileTypeName: string;
    updatedVersions: VersionUpdateResult[];
}

async function update(filePathPattern: string, newVersion: string, pluginTagFilterString?: string): Promise<UpdaterResult[]>
{
    const trimmedFilePathPattern = filePathPattern.trim();
    if (trimmedFilePathPattern.length === 0 || trimmedFilePathPattern === "\"\"")
    {
        throw new Error("File path pattern is empty.");
    }
    let parsedFilePathPatterns: string[];
    try
    {
        const filePathPatternWithForwardSlashes = trimmedFilePathPattern.replace(/\\/g, "/");
        let filePathPatternWithQuotes = filePathPatternWithForwardSlashes;
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
    const pluginFilters: PluginFilter[] = FilterUtils.parsePluginTagFilterString(pluginTagFilterString);
    validateFilters(pluginFilters, pluginTagFilterString ?? "");
    const result: UpdaterResult[] = [];
    for (const filePath of filePaths)
    {
        const updateFileResult = await updateFile(filePath, versionUpdateRule, pluginFilters);
        if (updateFileResult !== null)
        {
            result.push(updateFileResult);
        }
    }
    return result;
}

async function updateFile(filePath: string, versionUpdateRule: VersionUpdateRule, pluginFilters: PluginFilter[]): Promise<UpdaterResult | null>
{
    const isMatchAllFilter = pluginFilters.length === 1 && pluginFilters[0].pluginName === "*";
    for (const plugin of Plugins)
    {
        if (plugin.isFileTypeSupported(filePath))
        {
            let tagFilters: TagFilter[];
            if (isMatchAllFilter)
            {
                tagFilters = pluginFilters[0].tagFilters;
            }
            else
            {
                const pluginFilter = pluginFilters.find(pluginFilter => pluginFilter.pluginName === plugin.pluginName);
                if (pluginFilter === undefined)
                {
                    return null;
                }
                tagFilters = pluginFilter.tagFilters;
            }
            const fileContent: string = await fs.readFile(filePath, "utf-8");
            const fileUpdateResult: FileUpdateResult | null = plugin.updateFile(filePath, fileContent, versionUpdateRule, tagFilters);
            if (fileUpdateResult === null)
            {
                return null;
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

function validateFilters(filters: PluginFilter[], pluginTagFilterString: string): void
{
    for (const pluginFilter of filters)
    {
        if (pluginFilter.pluginName === "*")
        {
            continue;
        }
        const plugin: Plugin | undefined = Plugins.find(plugin => plugin.pluginName === pluginFilter.pluginName);
        if (plugin === undefined)
        {
            throw new Error(`Unknown file type: '${pluginFilter.originalPluginName}' in the tag filter list: '${pluginTagFilterString}'.`);
        }
        for (const tagFilter of pluginFilter.tagFilters)
        {
            if (tagFilter.tagName === "*")
            {
                continue;
            }
            if (plugin.tags.find(tag => tag.tagName === tagFilter.tagName) === undefined)
            {
                throw new Error(`Unknown tag: '${tagFilter.originalTagName}' for the file type: '${pluginFilter.originalPluginName}' `+
                    `in the tag filter list: '${pluginTagFilterString}'.`);
            }
        }
    }
}

export default
{
    update
};
