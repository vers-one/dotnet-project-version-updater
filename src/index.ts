import * as Core from "@actions/core";
import Updater, { UpdaterResult } from "./updater";

async function run(): Promise<void>
{
    try
    {
        let filePathPattern: string = Core.getInput("file");
        if (!filePathPattern)
        {
            filePathPattern = Core.getInput("files");
        }
        const newVersion: string = Core.getInput("version");
        console.log(`File path pattern: ${filePathPattern}`);
        console.log(`New version: ${newVersion}`);
        const updaterResults: UpdaterResult[] = await Updater.update(filePathPattern, newVersion);
        let oldVersionString: string = "";
        let newVersionString: string = "";
        for (const updaterResult of updaterResults)
        {
            for (const updatedVersion of updaterResult.updatedVersions)
            {
                oldVersionString = updatedVersion.oldVersion;
                newVersionString = updatedVersion.newVersion;
                console.log(`${updaterResult.filePath} (${updaterResult.fileTypeName}): ` +
                    `${updatedVersion.versionType} updated from '${oldVersionString}' to '${newVersionString}'`);
            }
        }
        Core.setOutput("oldVersion", oldVersionString);
        Core.setOutput("newVersion", newVersionString);
    }
    catch (error)
    {
        if (error instanceof Error)
        {
            Core.setFailed(error.message);
        }
    }
}

run();
