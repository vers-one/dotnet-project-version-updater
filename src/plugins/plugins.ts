import AssemblyInfoCppPlugin from "./assemblyinfo-cpp-plugin";
import AssemblyInfoCsPlugin from "./assemblyinfo-cs-plugin";
import AssemblyInfoFsPlugin from "./assemblyinfo-fs-plugin";
import AssemblyInfoVbPlugin from "./assemblyinfo-vb-plugin";
import CsProjPlugin from "./csproj-plugin";
import FsProjPlugin from "./fsproj-plugin";
import NuspecPlugin from "./nuspec-plugin";
import Plugin from "./plugin";
import PropsPlugin from "./props-plugin";
import RcPlugin from "./rc-plugin";
import VbProjPlugin from "./vbproj-plugin";

const plugins: Plugin[] =
[
    new CsProjPlugin(),
    new PropsPlugin(),
    new AssemblyInfoCsPlugin(),
    new NuspecPlugin(),
    new VbProjPlugin(),
    new AssemblyInfoVbPlugin(),
    new FsProjPlugin(),
    new AssemblyInfoFsPlugin(),
    new AssemblyInfoCppPlugin(),
    new RcPlugin()
];

export default plugins;
