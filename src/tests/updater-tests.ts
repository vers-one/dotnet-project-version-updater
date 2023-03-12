import test, { ExecutionContext } from "ava";
import { promises as fs } from "fs";
import Updater, { UpdaterResult } from "../updater";

async function getFileContent(filePath: string): Promise<string>
{
    return await fs.readFile(filePath, "utf-8");
}

function runUpdateAllFilesTest()
{
    test.serial("Update all files test", async t =>
    {
        const updaterResults: UpdaterResult[] = await Updater.update("\"test-files/input/*\", \"!test-files/input/*.txt\"", "4.5.6");
        const expectedFiles: string[] = await fs.readdir("test-files/expected-results");
        t.is(updaterResults.length, expectedFiles.length);
        for (const expectedFile of expectedFiles)
        {
            const inputFilePath = "test-files/input/" + expectedFile;
            const expectedFilePath = "test-files/expected-results/" + expectedFile;
            const updaterResult: UpdaterResult | undefined = updaterResults.find(updateResult => updateResult.filePath === inputFilePath);
            t.assert(updaterResult !== undefined);
            t.true(updaterResult!.updatedVersions.length > 0);
            for (const updatedVersion of updaterResult!.updatedVersions)
            {
                if (expectedFile === "Test.rc" && (updatedVersion.versionType === "FILEVERSION parameter" || updatedVersion.versionType === "PRODUCTVERSION parameter"))
                {
                    t.is(updatedVersion.oldVersion, "1,2,3,0");
                    t.is(updatedVersion.newVersion, "4,5,6,0");
                }
                else
                {
                    t.is(updatedVersion.oldVersion, "1.2.3");
                    t.is(updatedVersion.newVersion, "4.5.6");
                }
            }
            t.is(await getFileContent(inputFilePath), await getFileContent(expectedFilePath));
        }
    });
}

function runUpdateSingleFileTest()
{
    test.serial("Update single file test", async t =>
    {
        const updaterResults: UpdaterResult[] = await Updater.update("test-files/input/Test.csproj", "7.8.9");
        t.is(updaterResults.length, 1);
        t.is(updaterResults[0].filePath, "test-files/input/Test.csproj");
        t.is(updaterResults[0].updatedVersions[0].oldVersion, "4.5.6");
        t.is(updaterResults[0].updatedVersions[0].newVersion, "7.8.9");
    });
}

function runEmptyFilePathPatternTests()
{
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
}

function runInvalidFilePatternTests()
{
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
}

function runNoMatchingFilesTests()
{
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
    
    test(noMatchingFilesTest, "test-files/input/MissingFile.csproj");
    test(noMatchingFilesTest, "test-files/input/*.sln");
}

function runUnsupportedFileTypeTests()
{
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
    
    test(unsupportedFileTypeTest, "test-files/input/Test.txt");
}

function runTests()
{
    runUpdateAllFilesTest();
    runUpdateSingleFileTest();
    runEmptyFilePathPatternTests();
    runInvalidFilePatternTests();
    runNoMatchingFilesTests();
    runUnsupportedFileTypeTests();
}

export default
{
    runTests
};
