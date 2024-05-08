import test, { ExecutionContext } from "ava";
import { promises as fs } from "fs";
import path from "path";
import Updater, { UpdaterResult } from "../updater";

const TEST_FILES_DIRECTORY_PATH = "test-files";
const ALL_FILES_TEST_DIRECTORY_NAME = "all-files-test";
const SINGLE_FILE_TEST_DIRECTORY_NAME = "single-file-test";
const TAG_FILTER_TEST_DIRECTORY_NAME = "tag-filter-test";
const NO_MATCHING_FILES_TEST_DIRECTORY_NAME = "no-matching-files-test";
const UNSUPPORTED_FILE_TYPE_TEST_DIRECTORY_NAME = "unsupported-file-type-test";
const FILES_WITH_COMMENTS_TEST_DIRECTORY_NAME = "files-with-comments-test";
const INPUT_DIRECTORY_NAME = "input";
const EXPECTED_RESULTS_DIRECTORY_NAME = "expected-results";
const ACTUAL_RESULTS_DIRECTORY_NAME = "actual-results";

function joinPaths(...paths: string[]): string
{
    return path.join(...paths).split(path.sep).join("/");
}

function getTestDirectoryPath(testDirectoryName: string)
{
    return joinPaths(TEST_FILES_DIRECTORY_PATH, testDirectoryName);
}

function getInputDirectoryPath(testDirectoryName: string)
{
    return joinPaths(getTestDirectoryPath(testDirectoryName), INPUT_DIRECTORY_NAME);
}

function getExpectedResultsDirectoryPath(testDirectoryName: string)
{
    return joinPaths(getTestDirectoryPath(testDirectoryName), EXPECTED_RESULTS_DIRECTORY_NAME);
}

function getActualResultsDirectoryPath(testDirectoryName: string)
{
    return joinPaths(getTestDirectoryPath(testDirectoryName), ACTUAL_RESULTS_DIRECTORY_NAME);
}

async function getFileContent(filePath: string): Promise<string>
{
    return await fs.readFile(filePath, "utf-8");
}

async function copyInputTestFiles(testDirectoryName: string)
{
    const inputPath = getInputDirectoryPath(testDirectoryName);
    const actualResultsPath = getActualResultsDirectoryPath(testDirectoryName);
    await fs.mkdir(actualResultsPath, { recursive: true });
    for (const inputFileName of await fs.readdir(inputPath))
    {
        await fs.copyFile(joinPaths(inputPath, inputFileName), joinPaths(actualResultsPath, inputFileName));
    }
}

function runUpdateAllFilesTest()
{
    test("Update all files test", async t =>
    {
        await copyInputTestFiles(ALL_FILES_TEST_DIRECTORY_NAME);
        const expectedResultsDirectoryPath = getExpectedResultsDirectoryPath(ALL_FILES_TEST_DIRECTORY_NAME);
        const actualResultsDirectoryPath = getActualResultsDirectoryPath(ALL_FILES_TEST_DIRECTORY_NAME);
        const updaterResults: UpdaterResult[] =
            await Updater.update(`"${joinPaths(actualResultsDirectoryPath, "*")}", "!${joinPaths(actualResultsDirectoryPath, "*.txt")}"`, "4.5.6");
        const expectedFiles: string[] = await fs.readdir(expectedResultsDirectoryPath);
        t.is(updaterResults.length, expectedFiles.length);
        for (const expectedFileName of expectedFiles)
        {
            const expectedFilePath = joinPaths(expectedResultsDirectoryPath, expectedFileName);
            const actualFilePath = joinPaths(actualResultsDirectoryPath, expectedFileName);
            const updaterResult: UpdaterResult | undefined = updaterResults.find(updateResult => updateResult.filePath === actualFilePath);
            t.assert(updaterResult !== undefined);
            t.true(updaterResult!.updatedVersions.length > 0);
            for (const updatedVersion of updaterResult!.updatedVersions)
            {
                if (expectedFileName === "Test.rc" &&
                    (updatedVersion.versionType === "FILEVERSION parameter" || updatedVersion.versionType === "PRODUCTVERSION parameter"))
                {
                    t.is(updatedVersion.oldVersion, "1,2,3,0", `Actual old version doesn't match the expected old version for file ${expectedFileName}.`);
                    t.is(updatedVersion.newVersion, "4,5,6,0", `Actual new version doesn't match the expected new version for file ${expectedFileName}.`);
                }
                else
                {
                    t.is(updatedVersion.oldVersion, "1.2.3", `Actual old version doesn't match the expected old version for file ${expectedFileName}.`);
                    t.is(updatedVersion.newVersion, "4.5.6", `Actual new version doesn't match the expected new version for file ${expectedFileName}.`);
                }
            }
            t.is(await getFileContent(actualFilePath), await getFileContent(expectedFilePath),
                `Content of the actual file: '${actualFilePath}' doesn't match the content of the expected file: '${expectedFilePath}'.`);
        }
    });
}

function runUpdateSingleFileTest()
{
    test("Update single file test", async t =>
    {
        await copyInputTestFiles(SINGLE_FILE_TEST_DIRECTORY_NAME);
        const actualResultsDirectoryPath = getActualResultsDirectoryPath(SINGLE_FILE_TEST_DIRECTORY_NAME);
        const testFilePath = joinPaths(actualResultsDirectoryPath, "Test.csproj");
        const updaterResults: UpdaterResult[] = await Updater.update(testFilePath, "7.8.9");
        t.is(updaterResults.length, 1);
        t.is(updaterResults[0].filePath, testFilePath);
        t.is(updaterResults[0].updatedVersions[0].oldVersion, "4.5.6");
        t.is(updaterResults[0].updatedVersions[0].newVersion, "7.8.9");
    });
}

function runUpdateAllFilesWithTagFilterTest()
{
    test("Update all files with tag filter test", async t =>
    {
        await copyInputTestFiles(TAG_FILTER_TEST_DIRECTORY_NAME);
        const expectedResultsDirectoryPath = getExpectedResultsDirectoryPath(TAG_FILTER_TEST_DIRECTORY_NAME);
        const actualResultsDirectoryPath = getActualResultsDirectoryPath(TAG_FILTER_TEST_DIRECTORY_NAME);
        const updaterResults: UpdaterResult[] =
            await Updater.update(`"${joinPaths(actualResultsDirectoryPath, "*")}"`, "4.5.6", "AssemblyInfo-cs,CsProj.Version,CsProj.AssemblyVersion");
        t.is(updaterResults.length, 2);
        const expectedFiles: string[] = await fs.readdir(expectedResultsDirectoryPath);
        for (const expectedFileName of expectedFiles)
        {
            const expectedFilePath = joinPaths(expectedResultsDirectoryPath, expectedFileName);
            const actualFilePath = joinPaths(actualResultsDirectoryPath, expectedFileName);
            if (expectedFileName !== "Skip.props")
            {
                const updaterResult: UpdaterResult | undefined = updaterResults.find(updateResult => updateResult.filePath === actualFilePath);
                t.assert(updaterResult !== undefined);
                t.true(updaterResult!.updatedVersions.length > 0);
                for (const updatedVersion of updaterResult!.updatedVersions)
                {
                    t.is(updatedVersion.oldVersion, "1.2.3", `Actual old version doesn't match the expected old version for file ${expectedFileName}.`);
                    t.is(updatedVersion.newVersion, "4.5.6", `Actual new version doesn't match the expected new version for file ${expectedFileName}.`);
                }
            }
            t.is(await getFileContent(actualFilePath), await getFileContent(expectedFilePath),
                `Content of the actual file: '${actualFilePath}' doesn't match the content of the expected file: '${expectedFilePath}'.`);
        }
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
            await copyInputTestFiles(NO_MATCHING_FILES_TEST_DIRECTORY_NAME);
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
    
    const actualResultsDirectoryPath = getActualResultsDirectoryPath(NO_MATCHING_FILES_TEST_DIRECTORY_NAME);
    test.serial(noMatchingFilesTest, joinPaths(actualResultsDirectoryPath, "MissingFile.csproj"));
    test.serial(noMatchingFilesTest, joinPaths(actualResultsDirectoryPath, "*.props"));
}

function runUnsupportedFileTypeTests()
{
    const unsupportedFileTypeTest = test.macro({
        async exec(t: ExecutionContext, filePathPattern: string)
        {
            await copyInputTestFiles(UNSUPPORTED_FILE_TYPE_TEST_DIRECTORY_NAME);
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

    const actualResultsDirectoryPath = getActualResultsDirectoryPath(UNSUPPORTED_FILE_TYPE_TEST_DIRECTORY_NAME);
    test(unsupportedFileTypeTest, joinPaths(actualResultsDirectoryPath, "Test.txt"));
}

function runInvalidTagFiltersTest()
{
    test("Invalid plugin name in the tag filter test", async t =>
    {
        const error = await t.throwsAsync(async () =>
        {
            await Updater.update("*", "1.2.3", "UnknownPlugin");
        });
        t.is(error?.message, "Unknown file type: 'UnknownPlugin' in the tag filter list: 'UnknownPlugin'.");
    });
    test("Invalid tag name in the tag filter test", async t =>
    {
        const error = await t.throwsAsync(async () =>
        {
            await Updater.update("*", "1.2.3", "CsProj.UnknownTag");
        });
        t.is(error?.message, "Unknown tag: 'UnknownTag' for the file type: 'CsProj' in the tag filter list: 'CsProj.UnknownTag'.");
    });
}

function runUpdateFilesWithCommentsTest()
{
    test("Update files with comments test", async t =>
    {
        await copyInputTestFiles(FILES_WITH_COMMENTS_TEST_DIRECTORY_NAME);
        const expectedResultsDirectoryPath = getExpectedResultsDirectoryPath(FILES_WITH_COMMENTS_TEST_DIRECTORY_NAME);
        const actualResultsDirectoryPath = getActualResultsDirectoryPath(FILES_WITH_COMMENTS_TEST_DIRECTORY_NAME);
        const updaterResults: UpdaterResult[] = await Updater.update(`"${joinPaths(actualResultsDirectoryPath, "*")}"`, "4.5.6");
        const expectedFiles: string[] = await fs.readdir(expectedResultsDirectoryPath);
        t.is(updaterResults.length, expectedFiles.length);
        for (const expectedFileName of expectedFiles)
        {
            const expectedFilePath = joinPaths(expectedResultsDirectoryPath, expectedFileName);
            const actualFilePath = joinPaths(actualResultsDirectoryPath, expectedFileName);
            const updaterResult: UpdaterResult | undefined = updaterResults.find(updateResult => updateResult.filePath === actualFilePath);
            t.assert(updaterResult !== undefined);
            t.true(updaterResult!.updatedVersions.length > 0);
            for (const updatedVersion of updaterResult!.updatedVersions)
            {
                t.is(updatedVersion.oldVersion, "1.2.3", `Actual old version doesn't match the expected old version for file ${expectedFileName}.`);
                t.is(updatedVersion.newVersion, "4.5.6", `Actual new version doesn't match the expected new version for file ${expectedFileName}.`);
            }
            t.is(await getFileContent(actualFilePath), await getFileContent(expectedFilePath),
                `Content of the actual file: '${actualFilePath}' doesn't match the content of the expected file: '${expectedFilePath}'.`);
        }
    });
}

function runTests()
{
    runUpdateAllFilesTest();
    runUpdateSingleFileTest();
    runUpdateAllFilesWithTagFilterTest();
    runEmptyFilePathPatternTests();
    runInvalidFilePatternTests();
    runNoMatchingFilesTests();
    runUnsupportedFileTypeTests();
    runInvalidTagFiltersTest();
    runUpdateFilesWithCommentsTest();
}

export default
{
    runTests
};
