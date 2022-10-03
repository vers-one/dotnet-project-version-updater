import * as Core from "@actions/core";
import Updater, { UpdateResult } from "./updater";

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
        const updateResults: UpdateResult[] = await Updater.update(filePathPattern, newVersion);
        for (const updateResult of updateResults)
        {
            console.log(`${updateResult.filePath}: version updated from ${updateResult.oldVersion} to ${updateResult.newVersion}`);
        }
        setOutput("oldVersion", updateResults[0].oldVersion);
        setOutput("newVersion", updateResults[0].newVersion);
    }
    catch (error)
    {
        if (error instanceof Error)
        {
            Core.setFailed(error.message);
        }
    }
}

function setOutput(name: string, value: string): void
{
    console.log(`::set-output name=${name}::${value}`);
}

run();
