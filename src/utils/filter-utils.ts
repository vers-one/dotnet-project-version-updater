import type { PluginFilter } from "../types/filter-types";

function parsePluginTagFilterString(pluginTagFilterString: string | undefined): PluginFilter[]
{
    const result: PluginFilter[] = [];
    pluginTagFilterString = pluginTagFilterString?.trim();
    if (pluginTagFilterString === undefined || pluginTagFilterString === "*" || pluginTagFilterString === "")
    {
        result.push({
            pluginName: "*",
            originalPluginName: pluginTagFilterString ?? "",
            tagFilters:
            [{
                tagName: "*",
                originalTagName: ""
            }]
        });
    }
    else
    {
        const filterStringParts = pluginTagFilterString.split(',');
        for (let filterStringPart of filterStringParts)
        {
            filterStringPart = filterStringPart.trim();
            if (filterStringPart === "*")
            {
                throw new Error(`'*' must be the only element in the tag filter list: '${pluginTagFilterString}'.`);
            }
            let pluginName;
            let pluginTag;
            const dotPosition = filterStringPart.indexOf('.');
            if (dotPosition !== -1)
            {
                if (dotPosition === 0 || dotPosition === filterStringPart.length - 1)
                {
                    throw new Error(`'${filterStringPart}' is not a valid filter in the tag filter list: '${pluginTagFilterString}'.`)
                }
                pluginName = filterStringPart.substring(0, dotPosition);
                pluginTag = filterStringPart.substring(dotPosition + 1);
            }
            else
            {
                pluginName = filterStringPart;
                pluginTag = "*";
            }
            const pluginNameLowerCase = pluginName.toLowerCase();
            const pluginTagLowerCase = pluginTag.toLowerCase();
            let resultPluginFilter = result.find(pluginFilter => pluginFilter.pluginName === pluginNameLowerCase);
            if (resultPluginFilter === undefined)
            {
                resultPluginFilter =
                {
                    pluginName: pluginNameLowerCase,
                    originalPluginName: pluginName,
                    tagFilters: []
                };
                result.push(resultPluginFilter);
            }
            if (resultPluginFilter.tagFilters.find(pluginTagFilter => pluginTagFilter.tagName === pluginTagLowerCase))
            {
                throw new Error(`Duplicate filter: '${filterStringPart}' in the tag filter list: '${pluginTagFilterString}'.`)
            }
            else if (resultPluginFilter.tagFilters.length > 0)
            {
                if (pluginTagLowerCase === "*")
                {
                    throw new Error(`'${filterStringPart}' must be the only filter for the '${pluginName}' file type ` +
                        `in the tag filter list: '${pluginTagFilterString}'.`);
                }
                else if (resultPluginFilter.tagFilters[0].tagName === "*")
                {
                    throw new Error(`'${resultPluginFilter.originalPluginName}.*' must be the only filter ` +
                        `for the '${resultPluginFilter.originalPluginName}' file type in the tag filter list: '${pluginTagFilterString}'.`);
                }
            }
            resultPluginFilter.tagFilters.push({
                tagName: pluginTagLowerCase,
                originalTagName: pluginTag
            });
        }
    }
    return result;
}

export default
{
    parsePluginTagFilterString
};
