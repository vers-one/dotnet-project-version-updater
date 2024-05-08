import type Plugin from "../../plugins/plugin";

export interface PluginTest
{
    plugin: Plugin;
    input: string;
    newVersion: string;
    tagTests: TagTest[];
}

export interface TagTest
{
    tag: string;
    expectedResult: string;
}
