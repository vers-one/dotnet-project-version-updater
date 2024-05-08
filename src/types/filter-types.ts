export interface PluginFilter
{
    pluginName: string;
    originalPluginName: string;
    tagFilters: TagFilter[];
}

export interface TagFilter
{
    tagName: string;
    originalTagName: string;
}
