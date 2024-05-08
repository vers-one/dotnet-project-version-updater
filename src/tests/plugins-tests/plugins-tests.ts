import test from "ava";
import type { PluginTest } from "./plugin-test";
import type { TagFilter } from "../../types/filter-types";
import type { VersionUpdateRule } from "../../types/version-types";
import VersionUtils from "../../utils/version-utils";
import assemblyInfoCppPluginTest from "./assemblyinfo-cpp-plugin-test"
import assemblyInfoCsPluginTest from "./assemblyinfo-cs-plugin-test"
import assemblyInfoFsPluginTest from "./assemblyinfo-fs-plugin-test"
import assemblyInfoVbPluginTest from "./assemblyinfo-vb-plugin-test"
import csProjPluginTest from "./csproj-plugin-test"
import fsProjPluginTest from "./fsproj-plugin-test"
import vbProjPluginTest from "./vbproj-plugin-test"
import nuspecPluginTest from "./nuspec-plugin-test"
import propsPluginTest from "./props-plugin-test"
import rcPluginTest from "./rc-plugin-test"

function runPluginTest(pluginTest: PluginTest)
{
    const versionUpdateRule: VersionUpdateRule = VersionUtils.parseVersionUpdateRule(pluginTest.newVersion);
    for (const tagTest of pluginTest.tagTests)
    {
        test(`Plugin test: plugin = ${pluginTest.plugin.pluginName}, tag = ${tagTest.tag}`, t =>
        {
            const tagFilter: TagFilter =
            {
                tagName: tagTest.tag,
                originalTagName: tagTest.tag
            };
            const fileUpdateResult = pluginTest.plugin.updateFile("testfile", pluginTest.input, versionUpdateRule, [ tagFilter ]);
            t.is(fileUpdateResult?.newFileContent, tagTest.expectedResult);
        });
    }
}

function runTests()
{
    runPluginTest(assemblyInfoCppPluginTest);
    runPluginTest(assemblyInfoCsPluginTest);
    runPluginTest(assemblyInfoFsPluginTest);
    runPluginTest(assemblyInfoVbPluginTest);
    runPluginTest(csProjPluginTest);
    runPluginTest(fsProjPluginTest);
    runPluginTest(vbProjPluginTest);
    runPluginTest(nuspecPluginTest);
    runPluginTest(propsPluginTest);
    runPluginTest(rcPluginTest);
}

export default
{
    runTests
};
