import test, { ExecutionContext } from "ava";
import { promises as fs } from "fs";
import VersionUtils, { VersionUpdateRule } from "./version-utils";
import Updater, { UpdateResult } from "./updater";

const getNewVersionTest = test.macro({
    exec(t: ExecutionContext, oldVersion: string, versionUpdateInput: string, expectedNewVersion: string)
    {
        const versionUpdateRule: VersionUpdateRule = VersionUtils.parseVersionUpdateRule(versionUpdateInput);
        const actualNewVersion: string = VersionUtils.getNewVersion(oldVersion, versionUpdateRule);
        t.is(actualNewVersion, expectedNewVersion);
    },
    title(_ = "", oldVersion: string, versionUpdateInput: string, expectedNewVersion: string)
    {
        return `getNewVersionTest: ${oldVersion} - ${versionUpdateInput} -> ${expectedNewVersion}`;
    }
});

test(getNewVersionTest, "1.2.3",   "2.4.6",         "2.4.6");
test(getNewVersionTest, "2.4.6",   "2.4.7-rc1",     "2.4.7-rc1");
test(getNewVersionTest, "1.1.1.1", "bump-major",    "2.1.1.1");
test(getNewVersionTest, "1.1.1.1", "bump-minor",    "1.2.1.1");
test(getNewVersionTest, "1.1.1.1", "bump-build",    "1.1.2.1");
test(getNewVersionTest, "1.1.1.1", "bump-revision", "1.1.1.2");
test(getNewVersionTest, "1",       "bump-minor",    "1.1");
test(getNewVersionTest, "1",       "bump-build",    "1.0.1");
test(getNewVersionTest, "1.2",     "bump-revision", "1.2.0.1");
test(getNewVersionTest, "1.1.1.1", "^.*.*.*",       "2.1.1.1");
test(getNewVersionTest, "1.1.1.1", "*.^.*.*",       "1.2.1.1");
test(getNewVersionTest, "1.1.1.1", "*.*.^.*",       "1.1.2.1");
test(getNewVersionTest, "1.1.1.1", "*.*.*.^",       "1.1.1.2");
test(getNewVersionTest, "1.1.45",  "*.^.^",         "1.2.46");
test(getNewVersionTest, "1.1.45",  "^.0.^",         "2.0.46");
test(getNewVersionTest, "1.1.1.1", "*.*",           "1.1");
test(getNewVersionTest, "1.1.7",   "*.^.0",         "1.2.0");
test(getNewVersionTest, "1.1.7.1", "*.^.0",         "1.2.0");
test(getNewVersionTest, "1.1.7",   "*.*.*.1",       "1.1.7.1");
test(getNewVersionTest, "1.1.7",   "*.*.*.^",       "1.1.7.1");
test(getNewVersionTest, "1.1",     "*.*.*",         "1.1.0");
test(getNewVersionTest, "1.1",     "*.*.?",         "1.1");
test(getNewVersionTest, "1.1",     "*.*.*.*",       "1.1.0.0");
test(getNewVersionTest, "1.1",     "?.?.?.?",       "1.1");
test(getNewVersionTest, "1.0.1",   "bump-build",    "1.0.2");
test(getNewVersionTest, "1.0.0.1", "bump-revision", "1.0.0.2");
test(getNewVersionTest, "0.0.0.0", "bump-major",    "1.0.0.0");

const unsupportedVersionFormatTest = test.macro({
    exec(t: ExecutionContext, version: string)
    {
        const error = t.throws(() =>
        {
            const versionUpdateRule: VersionUpdateRule = VersionUtils.parseVersionUpdateRule("bump-major");
            VersionUtils.getNewVersion(version, versionUpdateRule);
        });
        t.is(error?.message, `Unsupported version format: ${version}`);
    },
    title(_ = "", version: string)
    {
        return `unsupportedVersionFormatTest: ${version}`;
    }
});

test(unsupportedVersionFormatTest, "2.4.7-rc1");
test(unsupportedVersionFormatTest, "test");
test(unsupportedVersionFormatTest, "1.2.3.4.5");
test(unsupportedVersionFormatTest, ".1");
test(unsupportedVersionFormatTest, "");

test("Version input is empty test", t =>
{
    const error = t.throws(() =>
    {
        VersionUtils.parseVersionUpdateRule("");
    });
    t.is(error?.message, "Version input is empty.");
});

async function getFileContent(filePath: string): Promise<string>
{
    return await fs.readFile(filePath, "utf-8");
}

test.serial("Update all files test", async t =>
{
    const updateResults: UpdateResult[] = await Updater.update("\"test-files/*\", \"!test-files/*.txt\"", "4.5.6");
    t.is(updateResults.length, 4);
    t.true(updateResults.find(updateResult => updateResult.filePath === "test-files/Test.csproj") !== undefined);
    t.true(updateResults.find(updateResult => updateResult.filePath === "test-files/Test.nuspec") !== undefined);
    t.true(updateResults.find(updateResult => updateResult.filePath === "test-files/Test.prop") !== undefined);
    t.true(updateResults.find(updateResult => updateResult.filePath === "test-files/Test.cs") !== undefined);
    t.is(updateResults[0].newVersion, "4.5.6");
    t.is(updateResults[1].newVersion, "4.5.6");
    t.is(updateResults[2].newVersion, "4.5.6");
    t.is(updateResults[3].newVersion, "4.5.6");
    t.is(await getFileContent("test-files/Test.csproj"),
        "<Project Sdk=\"Microsoft.NET.Sdk\">\n    <PropertyGroup>\n        <Version>4.5.6</Version>\n    </PropertyGroup>\n</Project>\n");
    t.is(await getFileContent("test-files/Test.nuspec"), 
        "<?xml version=\"1.0\"?>\n<package>\n    <metadata>\n        <version>4.5.6</version>\n    </metadata>\n</package>\n");
    t.is(await getFileContent("test-files/Test.prop"),
        "<Project>\n    <PropertyGroup>\n        <Version>4.5.6</Version>\n    </PropertyGroup>\n</Project>\n");
    t.is(await getFileContent("test-files/Test.cs"),
        "[assembly: AssemblyVersion(\"4.5.6\")]\n[assembly: AssemblyFileVersion(\"4.5.6\")]\n");
});

test.serial("Update single file test", async t =>
{
    const updateResults: UpdateResult[] = await Updater.update("test-files/Test.csproj", "7.8.9");
    t.is(updateResults.length, 1);
    t.is(updateResults[0].filePath, "test-files/Test.csproj");
    t.is(updateResults[0].oldVersion, "4.5.6");
    t.is(updateResults[0].newVersion, "7.8.9");
});

const emptyFilePathPatternTest = test.macro({
    async exec(t: ExecutionContext, filePathPattern: string)
    {
        const error = await t.throwsAsync(async () =>
        {
            await Updater.update(filePathPattern, "1.2.3");
        });
        t.is(error?.message, "File path pattern is empty.");
    },
    title(_ = "", filePathPattern: string)
    {
        return `emptyFilePathPatternTest: ${filePathPattern}`;
    }
});

test(emptyFilePathPatternTest, "");
test(emptyFilePathPatternTest, "\"\"");

const invalidFilePatternTest = test.macro({
    async exec(t: ExecutionContext, filePathPattern: string)
    {
        const error = await t.throwsAsync(async () =>
        {
            await Updater.update(filePathPattern, "1.2.3");
        });
        t.is(error?.message, `Invalid file path pattern: ${filePathPattern}`);
    },
    title(_ = "", filePathPattern: string)
    {
        return `invalidFilePatternTest: ${filePathPattern}`;
    }
});

test(invalidFilePatternTest, "\"");
test(invalidFilePatternTest, "\",");
test(invalidFilePatternTest, "\"test\",");
test(invalidFilePatternTest, ",\"test\"");
test(invalidFilePatternTest, "\"test\"t");
test(invalidFilePatternTest, "[\"test\"");

const noMatchingFilesTest = test.macro({
    async exec(t: ExecutionContext, filePathPattern: string)
    {
        const error = await t.throwsAsync(async () =>
        {
            await Updater.update(filePathPattern, "1.2.3");
        });
        t.is(error?.message, `There are no files matching the specified file path pattern: ${filePathPattern}`);
    },
    title(_ = "", filePathPattern: string)
    {
        return `noMatchingFilesTest: ${filePathPattern}`;
    }
});

test(noMatchingFilesTest, "test-files/MissingFile.csproj");
test(noMatchingFilesTest, "test-files/*.sln");

const unsupportedFileTypeTest = test.macro({
    async exec(t: ExecutionContext, filePathPattern: string)
    {
        const error = await t.throwsAsync(async () =>
        {
            await Updater.update(filePathPattern, "1.2.3");
        });
        t.is(error?.message, `Unsupported file type for file: ${filePathPattern}`);
    },
    title(_ = "", filePathPattern: string)
    {
        return `unsupportedFileTypeTest: ${filePathPattern}`;
    }
});

test(unsupportedFileTypeTest, "test-files/Test.txt");
