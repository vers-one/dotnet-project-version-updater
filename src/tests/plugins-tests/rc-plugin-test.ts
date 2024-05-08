import type { PluginTest } from "./plugin-test";
import RcPlugin from "../../plugins/rc-plugin";

const rcPluginTest: PluginTest =
{
    plugin: new RcPlugin(),
    input: `VS_VERSION_INFO VERSIONINFO\nFILEVERSION 1,2,3,0\nPRODUCTVERSION 1,2,3,0\nBEGIN\nBLOCK "StringFileInfo"\nBEGIN\nBLOCK "040904b0"\n` +
        `BEGIN\nVALUE "FileVersion", "1.2.3"\nVALUE "ProductVersion", "1.2.3"\nEND\nEND\nEND`,
    newVersion: "4.5.6",
    tagTests:
    [{
        tag: "*",
        expectedResult: `VS_VERSION_INFO VERSIONINFO\nFILEVERSION 4,5,6,0\nPRODUCTVERSION 4,5,6,0\nBEGIN\nBLOCK "StringFileInfo"\nBEGIN\nBLOCK "040904b0"\n` +
            `BEGIN\nVALUE "FileVersion", "4.5.6"\nVALUE "ProductVersion", "4.5.6"\nEND\nEND\nEND`
    },
    {
        tag: "fileversion-param",
        expectedResult: `VS_VERSION_INFO VERSIONINFO\nFILEVERSION 4,5,6,0\nPRODUCTVERSION 1,2,3,0\nBEGIN\nBLOCK "StringFileInfo"\nBEGIN\nBLOCK "040904b0"\n` +
            `BEGIN\nVALUE "FileVersion", "1.2.3"\nVALUE "ProductVersion", "1.2.3"\nEND\nEND\nEND`
    },
    {
        tag: "fileversion-string",
        expectedResult: `VS_VERSION_INFO VERSIONINFO\nFILEVERSION 1,2,3,0\nPRODUCTVERSION 1,2,3,0\nBEGIN\nBLOCK "StringFileInfo"\nBEGIN\nBLOCK "040904b0"\n` +
            `BEGIN\nVALUE "FileVersion", "4.5.6"\nVALUE "ProductVersion", "1.2.3"\nEND\nEND\nEND`
    },
    {
        tag: "productversion-param",
        expectedResult: `VS_VERSION_INFO VERSIONINFO\nFILEVERSION 1,2,3,0\nPRODUCTVERSION 4,5,6,0\nBEGIN\nBLOCK "StringFileInfo"\nBEGIN\nBLOCK "040904b0"\n` +
            `BEGIN\nVALUE "FileVersion", "1.2.3"\nVALUE "ProductVersion", "1.2.3"\nEND\nEND\nEND`
    },
    {
        tag: "productversion-string",
        expectedResult: `VS_VERSION_INFO VERSIONINFO\nFILEVERSION 1,2,3,0\nPRODUCTVERSION 1,2,3,0\nBEGIN\nBLOCK "StringFileInfo"\nBEGIN\nBLOCK "040904b0"\n` +
            `BEGIN\nVALUE "FileVersion", "1.2.3"\nVALUE "ProductVersion", "4.5.6"\nEND\nEND\nEND`
    }]
};

export default rcPluginTest;
