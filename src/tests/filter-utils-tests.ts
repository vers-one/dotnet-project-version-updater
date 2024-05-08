import test, { ExecutionContext } from "ava";
import type { PluginFilter, TagFilter } from "../types/filter-types";
import FilterUtils from "../utils/filter-utils";

function createPluginFilter(pluginName: string, originalPluginName: string, tagFilters: TagFilter[]): PluginFilter
{
    const result: PluginFilter =
    {
        pluginName,
        originalPluginName,
        tagFilters
    };
    return result;
}

function createTagFilters(...params: string[]): TagFilter[]
{
    const result: TagFilter[] = [];
    if (params.length % 2 !== 0)
    {
        throw new Error("Number of createTagFilters parameters must be even.")
    }
    for (let i = 0; i < params.length; i += 2)
    {
        result.push({
            tagName: params[i],
            originalTagName: params[i+1]
        });
    }
    return result;
}

function runParsePluginTagFilterStringTests()
{
    const parsePluginTagFilterStringTest = test.macro({
        exec(t: ExecutionContext, pluginTagFilterString: string | undefined, expectedResult: PluginFilter[])
        {
            const actualResult = FilterUtils.parsePluginTagFilterString(pluginTagFilterString);
            t.is(actualResult.length, expectedResult.length);
            for (let pluginIndex = 0; pluginIndex < actualResult.length; pluginIndex++)
            {
                t.is(actualResult[pluginIndex].pluginName, expectedResult[pluginIndex].pluginName, "pluginName doesn't match");
                t.is(actualResult[pluginIndex].originalPluginName, expectedResult[pluginIndex].originalPluginName, "originalPluginName doesn't match");
                t.is(actualResult[pluginIndex].tagFilters.length, expectedResult[pluginIndex].tagFilters.length, "tagFilters.length doesn't match");
                for (let tagIndex = 0; tagIndex < actualResult[pluginIndex].tagFilters.length; tagIndex++)
                {
                    t.is(actualResult[pluginIndex].tagFilters[tagIndex].tagName, expectedResult[pluginIndex].tagFilters[tagIndex].tagName,
                        "tagName doesn't match");
                    t.is(actualResult[pluginIndex].tagFilters[tagIndex].originalTagName,
                        expectedResult[pluginIndex].tagFilters[tagIndex].originalTagName, "originalTagName doesn't match");
                }
            }
        },
        title(providedTitle: string | undefined, pluginTagFilterString: string | undefined, _: PluginFilter[])
        {
            let result = "parsePluginTagFilterStringTest: ";
            if (providedTitle !== undefined)
            {
                result += `(${providedTitle}) `;
            }
            result += pluginTagFilterString;
            return result;
        }
    });

    test("* without whitespaces", parsePluginTagFilterStringTest, "*", [ createPluginFilter("*", "*", createTagFilters("*", "")) ]);
    test("* with whitespaces", parsePluginTagFilterStringTest, " * ", [ createPluginFilter("*", "*", createTagFilters("*", "")) ]);
    test("empty string without whitespaces", parsePluginTagFilterStringTest, "", [ createPluginFilter("*", "", createTagFilters("*", "")) ]);
    test("empty string with whitespaces", parsePluginTagFilterStringTest, "  ", [ createPluginFilter("*", "", createTagFilters("*", "")) ]);
    test(parsePluginTagFilterStringTest, undefined, [ createPluginFilter("*", "", createTagFilters("*", "")) ]);
    test(parsePluginTagFilterStringTest, "csproj", [ createPluginFilter("csproj", "csproj", createTagFilters("*", "*")) ]);
    test(parsePluginTagFilterStringTest, "csproj.*", [ createPluginFilter("csproj", "csproj", createTagFilters("*", "*")) ]);
    test(parsePluginTagFilterStringTest, "CsProj.*", [ createPluginFilter("csproj", "CsProj", createTagFilters("*", "*")) ]);
    test(parsePluginTagFilterStringTest, "csproj.assemblyversion",
        [ createPluginFilter("csproj", "csproj", createTagFilters("assemblyversion", "assemblyversion")) ]);
    test(parsePluginTagFilterStringTest, "CsProj.AssemblyVersion",
        [ createPluginFilter("csproj", "CsProj", createTagFilters("assemblyversion", "AssemblyVersion")) ]);
    test("two filters without whitespaces", parsePluginTagFilterStringTest, "csproj.Version,csproj.AssemblyVersion",
        [ createPluginFilter("csproj", "csproj", createTagFilters("version", "Version", "assemblyversion", "AssemblyVersion")) ]);
    test("two filters with a single whitespace", parsePluginTagFilterStringTest, "csproj.Version, csproj.AssemblyVersion",
        [ createPluginFilter("csproj", "csproj", createTagFilters("version", "Version", "assemblyversion", "AssemblyVersion")) ]);
    test("two filters with two whitespaces", parsePluginTagFilterStringTest, "csproj.Version,  csproj.AssemblyVersion",
        [ createPluginFilter("csproj", "csproj", createTagFilters("version", "Version", "assemblyversion", "AssemblyVersion")) ]);
    test(parsePluginTagFilterStringTest, "csproj.Version, props.Version",
        [ createPluginFilter("csproj", "csproj", createTagFilters("version", "Version")),
        createPluginFilter("props", "props", createTagFilters("version", "Version")) ]);
    test(parsePluginTagFilterStringTest, "AssemblyInfo-cs.Version, AssemblyInfo-cpp.AssemblyFileVersion",
        [ createPluginFilter("assemblyinfo-cs", "AssemblyInfo-cs", createTagFilters("version", "Version")),
        createPluginFilter("assemblyinfo-cpp", "AssemblyInfo-cpp", createTagFilters("assemblyfileversion", "AssemblyFileVersion")) ]);
}

function runPluginWildcardFilterWithOtherFiltersTest()
{
    test("Plugin wildcard filter along with other filters test", t =>
    {
        const error = t.throws(() =>
        {
            FilterUtils.parsePluginTagFilterString("csproj,*")
        });
        t.is(error?.message, "'*' must be the only element in the tag filter list: 'csproj,*'.");
    })
}

function runTagWildcardFilterWithOtherFiltersTest()
{
    const tagWildcardFilterWithOtherFiltersTest = test.macro({
        exec(t: ExecutionContext, filter: string, pluginName: string, filterStringPart: string)
        {
            const error = t.throws(() =>
            {
                FilterUtils.parsePluginTagFilterString(filter);
            });
            t.is(error?.message, `'${filterStringPart}' must be the only filter for the '${pluginName}' file type ` +
                `in the tag filter list: '${filter}'.`);
        },
        title(_ = "", filter: string)
        {
            return `tagWildcardFilterWithOtherFiltersTest: ${filter}`;
        }
    });

    test(tagWildcardFilterWithOtherFiltersTest, "csproj.version,csproj.*", "csproj", "csproj.*");
    test(tagWildcardFilterWithOtherFiltersTest, "csproj.*,csproj.version", "csproj", "csproj.*");
    test(tagWildcardFilterWithOtherFiltersTest, "nuspec.*,csproj.version,csproj.*", "csproj", "csproj.*");
    test(tagWildcardFilterWithOtherFiltersTest, "CsProj.Version,csproj.*", "csproj", "csproj.*");
    test(tagWildcardFilterWithOtherFiltersTest, "csproj.*,CsProj.Version", "csproj", "csproj.*");
    test(tagWildcardFilterWithOtherFiltersTest, "csproj.version,CsProj.*", "CsProj", "CsProj.*");
    test(tagWildcardFilterWithOtherFiltersTest, "CsProj.*,csproj.version", "CsProj", "CsProj.*");
}

function runInvalidFiltersTest()
{
    const invalidFiltersTest = test.macro({
        exec(t: ExecutionContext, filter: string)
        {
            const filterStringWithCsProjFilter = "csproj," + filter;
            const error = t.throws(() =>
            {
                FilterUtils.parsePluginTagFilterString(filterStringWithCsProjFilter);
            });
            t.is(error?.message, `'${filter}' is not a valid filter in the tag filter list: '${filterStringWithCsProjFilter}'.`);
        },
        title(_ = "", filter: string)
        {
            return `invalidFiltersTest: ${filter}`;
        }
    });

    test(invalidFiltersTest, "nuspec.");
    test(invalidFiltersTest, ".version");
    test(invalidFiltersTest, ".");
}

function runDuplicateFilterPartsTest()
{
    const duplicateFilterPartsTest = test.macro({
        exec(t: ExecutionContext, filter: string, duplicateFilterPart: string)
        {
            const error = t.throws(() =>
            {
                FilterUtils.parsePluginTagFilterString(filter);
            });
            t.is(error?.message, `Duplicate filter: '${duplicateFilterPart}' in the tag filter list: '${filter}'.`);
        },
        title(_ = "", filter: string)
        {
            return `duplicateFilterPartsTest: ${filter}`;
        }
    });

    test(duplicateFilterPartsTest, "csproj.version,csproj.version", "csproj.version");
    test(duplicateFilterPartsTest, "CsProj.Version,csproj.version", "csproj.version");
    test(duplicateFilterPartsTest, "nuspec.version,csproj.version,csproj.version", "csproj.version");
    test(duplicateFilterPartsTest, "csproj.version,nuspec.version,csproj.version", "csproj.version");
    test(duplicateFilterPartsTest, "csproj,nuspec,csproj", "csproj");
    test(duplicateFilterPartsTest, "csproj,nuspec,csproj.*", "csproj.*");
    test(duplicateFilterPartsTest, "csproj.*,nuspec,csproj", "csproj");
}

function runTests()
{
    runParsePluginTagFilterStringTests();
    runPluginWildcardFilterWithOtherFiltersTest();
    runTagWildcardFilterWithOtherFiltersTest();
    runInvalidFiltersTest();
    runDuplicateFilterPartsTest();
}

export default
{
    runTests
};
