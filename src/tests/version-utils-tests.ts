import test, { ExecutionContext } from "ava";
import type { Version, VersionUpdateRule } from "../types/version-types";
import VersionUtils from "../utils/version-utils";

function createVersion(major: number, minor: number | null = null, build: number | null = null, revision: number | null = null): Version
{
    return { major, minor, build, revision };
}

function runFormatVersionTests()
{
    const formatVersionTest = test.macro({
        exec(t: ExecutionContext, version: Version, versionPartDelimiter: string, includeTrailingZeros: boolean, expectedResult: string)
        {
            t.is(VersionUtils.formatVersion(version, versionPartDelimiter, includeTrailingZeros), expectedResult);
        },
        title(_ = "", version: Version, versionPartDelimiter: string, includeTrailingZeros: boolean, expectedResult: string)
        {
            return `formatVersionTest: ${JSON.stringify(version)} - ${versionPartDelimiter} - ${includeTrailingZeros} -> ${expectedResult}`;
        }
    });
    
    test(formatVersionTest, createVersion(1), ".", false, "1");
    test(formatVersionTest, createVersion(1, 2), ".", false, "1.2");
    test(formatVersionTest, createVersion(1, 2, 3), ".", false, "1.2.3");
    test(formatVersionTest, createVersion(1, 2, 3, 4), ".", false, "1.2.3.4");
    test(formatVersionTest, createVersion(1), ",", false, "1");
    test(formatVersionTest, createVersion(1, 2), ",", false, "1,2");
    test(formatVersionTest, createVersion(1, 2, 3), ",", false, "1,2,3");
    test(formatVersionTest, createVersion(1, 2, 3, 4), ",", false, "1,2,3,4");
    test(formatVersionTest, createVersion(1), ".", true, "1.0.0.0");
    test(formatVersionTest, createVersion(1, 2), ".", true, "1.2.0.0");
    test(formatVersionTest, createVersion(1, 2, 3), ".", true, "1.2.3.0");
    test(formatVersionTest, createVersion(1, 2, 3, 4), ".", true, "1.2.3.4");
}

function runParseVersionTests()
{
    const parseVersionTest = test.macro({
        exec(t: ExecutionContext, version: string, versionPartDelimiter: string, expectedResult: Version)
        {
            const versionNumberRegex =
                versionPartDelimiter === "." ? VersionUtils.VERSION_NUMBER_WITH_DOT_DELIMITER_REGEX : VersionUtils.VERSION_NUMBER_WITH_COMMA_DELIMITER_REGEX;
            const actualResult = VersionUtils.parseVersion(version, versionNumberRegex);
            t.is(actualResult.major, expectedResult.major);
            t.is(actualResult.minor, expectedResult.minor);
            t.is(actualResult.build, expectedResult.build);
            t.is(actualResult.revision, expectedResult.revision);
        },
        title(_ = "", version: string, versionPartDelimiter: string, expectedResult: Version)
        {
            return `parseVersionTest: ${version} - ${versionPartDelimiter} -> ${JSON.stringify(expectedResult)}`;
        }
    });

    test(parseVersionTest, "1", ".", createVersion(1));
    test(parseVersionTest, "1.2", ".", createVersion(1, 2));
    test(parseVersionTest, "1.2.3", ".", createVersion(1, 2, 3));
    test(parseVersionTest, "1.2.3.4", ".", createVersion(1, 2, 3, 4));
    test(parseVersionTest, "1", ",", createVersion(1));
    test(parseVersionTest, "1,2", ",", createVersion(1, 2));
    test(parseVersionTest, "1,2,3", ",", createVersion(1, 2, 3));
    test(parseVersionTest, "1,2,3,4", ",", createVersion(1, 2, 3, 4));
}

function runUpdateNonParsedVersionTests()
{
    const updateNonParsedVersionTest = test.macro({
        exec(t: ExecutionContext, oldVersion: string, versionUpdateInput: string, expectedNewVersion: string)
        {
            const versionUpdateRule: VersionUpdateRule = VersionUtils.parseVersionUpdateRule(versionUpdateInput);
            const actualNewVersion: string = VersionUtils.updateNonParsedVersion(oldVersion, versionUpdateRule, VersionUtils.VERSION_NUMBER_WITH_DOT_DELIMITER_REGEX, ".");
            t.is(actualNewVersion, expectedNewVersion);
        },
        title(_ = "", oldVersion: string, versionUpdateInput: string, expectedNewVersion: string)
        {
            return `updateNonParsedVersionTest: ${oldVersion} - ${versionUpdateInput} -> ${expectedNewVersion}`;
        }
    });

    test(updateNonParsedVersionTest, "1.2.3",   "2.4.6",         "2.4.6");
    test(updateNonParsedVersionTest, "2.4.6",   "2.4.7-rc1",     "2.4.7-rc1");
    test(updateNonParsedVersionTest, "1.1.1.1", "bump-major",    "2.1.1.1");
    test(updateNonParsedVersionTest, "1.1.1.1", "bump-minor",    "1.2.1.1");
    test(updateNonParsedVersionTest, "1.1.1.1", "bump-build",    "1.1.2.1");
    test(updateNonParsedVersionTest, "1.1.1.1", "bump-revision", "1.1.1.2");
    test(updateNonParsedVersionTest, "1",       "bump-minor",    "1.1");
    test(updateNonParsedVersionTest, "1",       "bump-build",    "1.0.1");
    test(updateNonParsedVersionTest, "1.2",     "bump-revision", "1.2.0.1");
    test(updateNonParsedVersionTest, "1.1.1.1", "^.*.*.*",       "2.1.1.1");
    test(updateNonParsedVersionTest, "1.1.1.1", "*.^.*.*",       "1.2.1.1");
    test(updateNonParsedVersionTest, "1.1.1.1", "*.*.^.*",       "1.1.2.1");
    test(updateNonParsedVersionTest, "1.1.1.1", "*.*.*.^",       "1.1.1.2");
    test(updateNonParsedVersionTest, "1.1.45",  "*.^.^",         "1.2.46");
    test(updateNonParsedVersionTest, "1.1.45",  "^.0.^",         "2.0.46");
    test(updateNonParsedVersionTest, "1.1.1.1", "*.*",           "1.1");
    test(updateNonParsedVersionTest, "1.1.7",   "*.^.0",         "1.2.0");
    test(updateNonParsedVersionTest, "1.1.7.1", "*.^.0",         "1.2.0");
    test(updateNonParsedVersionTest, "1.1.7",   "*.*.*.1",       "1.1.7.1");
    test(updateNonParsedVersionTest, "1.1.7",   "*.*.*.^",       "1.1.7.1");
    test(updateNonParsedVersionTest, "1.1",     "*.*.*",         "1.1.0");
    test(updateNonParsedVersionTest, "1.1",     "*.*.?",         "1.1");
    test(updateNonParsedVersionTest, "1.1",     "*.*.*.*",       "1.1.0.0");
    test(updateNonParsedVersionTest, "1.1",     "?.?.?.?",       "1.1");
    test(updateNonParsedVersionTest, "1.0.1",   "bump-build",    "1.0.2");
    test(updateNonParsedVersionTest, "1.0.0.1", "bump-revision", "1.0.0.2");
    test(updateNonParsedVersionTest, "0.0.0.0", "bump-major",    "1.0.0.0");
}

function runUnsupportedVersionFormatTests()
{
    const unsupportedVersionFormatTest = test.macro({
        exec(t: ExecutionContext, version: string)
        {
            const error = t.throws(() =>
            {
                const versionUpdateRule: VersionUpdateRule = VersionUtils.parseVersionUpdateRule("bump-major");
                VersionUtils.updateNonParsedVersion(version, versionUpdateRule, VersionUtils.VERSION_NUMBER_WITH_DOT_DELIMITER_REGEX, ".");
            });
            t.is(error?.message, `Version '${version}' doesn't match regular expression: ${VersionUtils.VERSION_NUMBER_WITH_DOT_DELIMITER_REGEX}`);
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
}

function runEmptyVersionInputTest()
{
    test("Version input is empty test", t =>
    {
        const error = t.throws(() =>
        {
            VersionUtils.parseVersionUpdateRule("");
        });
        t.is(error?.message, "Version input is empty.");
    });
}

function runTests()
{
    runFormatVersionTests();
    runParseVersionTests();
    runUpdateNonParsedVersionTests();
    runUnsupportedVersionFormatTests();
    runEmptyVersionInputTest();
}

export default
{
    runTests
};
