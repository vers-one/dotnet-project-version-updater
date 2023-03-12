# .NET project version updater

A GitHub action to update or bump project versions. Supports .csproj, .props, .nuspec, and many other .NET file types.

[![Build](https://github.com/vers-one/dotnet-project-version-updater/actions/workflows/build.yml/badge.svg)](https://github.com/vers-one/dotnet-project-version-updater/actions/workflows/build.yml)
[![Tests](https://github.com/vers-one/dotnet-project-version-updater/actions/workflows/test.yml/badge.svg)](https://github.com/vers-one/dotnet-project-version-updater/actions/workflows/test.yml)

Supported file types:

* C#:
  * `.csproj` (.NET / .NET Core projects)
  * `.cs` (.NET Framework AssemblyInfo files, e.g. `AssemblyInfo.cs`)
* Visual Basic:
  * `.vbproj` (.NET / .NET Core projects)
  * `.vb` (.NET Framework AssemblyInfo files, e.g. `AssemblyInfo.vb`)
* F#:
  * `.fsproj` (.NET / .NET Core projects)
  * `.fs` (.NET Framework AssemblyInfo files, e.g. `AssemblyInfo.fs`)
* C++/CLI:
  * `.cpp` (.NET / .NET Core / .NET Framework AssemblyInfo files, e.g. `AssemblyInfo.cpp`)
  * `.rc` (C++ resource files; also works for non-.NET C++ projects)
* MSBuild:
  * `.props` (shared project properties)
* Nuget:
  * `.nuspec` (Nuget package specs)

## Inputs

### `file` or `files` (required)

Project file paths.

Can be either:
* path to a single project file: `"src/MyProject.csproj"`;
* path pattern: `"src/**/*.csproj"`;
* comma-separated list of path patterns: `"src/**/*.csproj", "src/**/*.nuspec", "!src/**/Test"`

See [fast-glob package documentation](https://github.com/mrmlnc/fast-glob) for more examples of supported file path patterns.

### `version` (required)

The new version for the project file.

Can be either:
* explicit version: e.g. `1.2.3` or `1.0.0-beta5`;
* one of the bump commands:
    * `bump-major`;
    * `bump-minor`;
    * `bump-build`;
    * `bump-revision`;
* bump pattern: e.g. `*.^.0.?` where:
    * `?` instructs to leave this version part unchanged;
    * `*` instructs to leave this version part unchanged or to set it to zero if it doesn't exist;
    * `^` instructs to bump this version part;
    * number instructs to overwrite this version part with the specified number;
    * missing part instructs to remove it from the version if it exists.

Examples:

|Old version|`version` input|New version|Explanation                                                                                                      |
|-----------|---------------|-----------|-----------------------------------------------------------------------------------------------------------------|
|1.2.3      |`2.4.6`        |2.4.6      |Sets explicit numeric version                                                                                    |
|2.4.6      |`2.4.7-rc1`    |2.4.7-rc1  |Sets explicit semantic version                                                                                   |
|1.1.1.1    |`bump-major`   |2.1.1.1    |Bumps the major part, leaves other parts unchanged                                                               |
|1.1.1.1    |`bump-minor`   |1.2.1.1    |Bumps the minor part, leaves other parts unchanged                                                               |
|1.1.1.1    |`bump-build`   |1.1.2.1    |Bumps the build part, leaves other parts unchanged                                                               |
|1.1.1.1    |`bump-revision`|1.1.1.2    |Bumps the revision part, leaves other parts unchanged                                                            |        
|1          |`bump-minor`   |1.1        |Sets the missing minor part to zero and bumps it                                                                 |
|1          |`bump-build`   |1.0.1      |Sets the missing minor and build parts to zero and bumps the build part                                          |
|1.2        |`bump-revision`|1.2.0.1    |Sets the missing build and revision parts to zero and bumps the revision part                                    |
|1.1.1.1    |`^.*.*.*`      |2.1.1.1    |Bumps the major part, leaves other parts unchanged                                                               |
|1.1.1.1    |`*.^.*.*`      |1.2.1.1    |Bumps the minor part, leaves other parts unchanged                                                               |
|1.1.1.1    |`*.*.^.*`      |1.1.2.1    |Bumps the build part, leaves other parts unchanged                                                               |
|1.1.1.1    |`*.*.*.^`      |1.1.1.2    |Bumps the revision part, leaves other parts unchanged                                                            |
|1.1.45     |`*.^.^`        |1.2.46     |Bumps the minor and the build parts, leaves the major part unchanged                                             |
|1.1.45     |`^.0.^`        |2.0.46     |Bumps the major and the build parts, sets the minor part to zero                                                 |
|1.1.1.1    |`*.*`          |1.1        |Removes the build and the revision parts, leaves the major and the minor parts unchanged                         |
|1.1.7      |`*.^.0`        |1.2.0      |Bumps the minor part, sets the build part to zero, and leaves the major part unchanged                           |
|1.1.7.1    |`*.^.0`        |1.2.0      |Bumps the minor part, sets the build part to zero, removes the revision part, and leaves the major part unchanged|
|1.1.7      |`*.*.*.1`      |1.1.7.1    |Sets the revision part to 1, leaves other parts unchanged                                                        |
|1.1.7      |`*.*.*.^`      |1.1.7.1    |Sets the missing revision part to zero and bumps it, leaves other parts unchanged                                |
|1.1        |`*.*.*`        |1.1.0      |Sets the missing build part to zero, leaves the major and the minor parts unchanged                              |
|1.1        |`*.*.?`        |1.1        |Leaves the major, minor, and the build parts unchanged                                                           |
|1.1        |`*.*.*.*`      |1.1.0.0    |Sets the missing build and revision parts to zero, leaves the major and the minor parts unchanged                |
|1.1        |`?.?.?.?`      |1.1        |Leaves all parts unchanged                                                                                       |

## Outputs

### `oldVersion`

The version found in the project file before the update. In case of multiple project files, this will be the version found in the last project file.

**Example**: `1.3.5`

### `newVersion`

The version set by the action during the update. In case of multiple project files, this will be the version written into the last project file.

**Example**: `1.3.6`

## Usage

### Scenario 1: Set an explicit version for a single file

```yaml
name: Manual version update

on:
  workflow_dispatch:
    inputs:
      version:
        description: "New version for the project"
        required: true 
        type: string

jobs:
  update:
    runs-on: ubuntu-latest
    name: Update version
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Set MyProject.csproj version
        id: update
        uses: vers-one/dotnet-project-version-updater@v1.3
        with:
          file: "src/MyProject.csproj"
          version: ${{ github.event.inputs.version }}

      - run: |
          git config user.name "Your Name"
          git config user.email "your-email@users.noreply.github.com"
          git add .
          git commit -m "Update project version to ${{ steps.update.outputs.newVersion }}"
          git push
```

### Scenario 2: Set an explicit version for multiple files

```yaml
name: Manual version update

on:
  workflow_dispatch:
    inputs:
      version:
        description: "New version for all projects"
        required: true 
        type: string

jobs:
  update:
    runs-on: ubuntu-latest
    name: Update versions
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Set project versions
        id: update
        uses: vers-one/dotnet-project-version-updater@v1.3
        with:
          file: |
            "**/*.csproj", "**/*.nuspec", "**/AssemblyInfo.cs"
          version: ${{ github.event.inputs.version }}

      - run: |
          git config user.name "Your Name"
          git config user.email "your-email@users.noreply.github.com"
          git add .
          git commit -m "Update project versions to ${{ steps.update.outputs.newVersion }}"
          git push
```

### Scenario 3: Bump version on push to the `main` branch

```yaml
name: Bump build version

on:
  push:
    branches: [ main ]

jobs:
  bump:
    runs-on: ubuntu-latest
    name: Build and bump version
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Install .NET 7
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: 7

      - name: Restore dependencies
        run: dotnet restore

      - name: Build
        run: dotnet build

      - name: Bump build version
        id: bump
        uses: vers-one/dotnet-project-version-updater@v1.3
        with:
          file: "src/MyProject.csproj"
          version: bump-build

      - run: |
          git config user.name "Your Name"
          git config user.email "your-email@users.noreply.github.com"
          git add .
          git commit -m "Bump project version to ${{ steps.bump.outputs.newVersion }}"
          git push
```

## Additional notes

* This action searches for the following version declarations:
  * for .csproj, .vbproj, .fsproj, .props, and .nuspec files:
    * `<Version>...</Version>`;
    * `<AssemblyVersion>...</AssemblyVersion>`;
    * `<FileVersion>...</FileVersion>`;
  * for .cs files:
    * `[assembly: AssemblyVersion("...")]`;
    * `[assembly: AssemblyFileVersion("...")]`;
  * for .vb files:
    * `<Assembly: AssemblyVersion("...")>`;
    * `<Assembly: AssemblyFileVersion("...")>`;
  * for .fs files:
    * `[<assembly: AssemblyVersion("...")>]`;
    * `[<assembly: AssemblyFileVersion("...")>]`;
  * for .cpp files:
    * `[assembly:AssemblyVersionAttribute(L"...")]`;
    * `[assembly:AssemblyFileVersionAttribute(L"...")]`;
  * for .rc files:
    * `FILEVERSION x,x,x,x`;
    * `PRODUCTVERSION x,x,x,x`;
    * `VALUE "FileVersion", "..."`
    * `VALUE "ProductVersion", "..."`.
* If you set the new version explicitly, you can use any string as a version number (e.g. `1.2.3`, `1.0.0-beta5`, `Vista`, `blah-blah`, etc). However if you use one of the bump commands or a bump pattern, the existing version must by in the following format: *major[.minor[.build[.revision]]]*.
* Keep in mind that .NET Framework assembly versions [must be](https://docs.microsoft.com/en-us/dotnet/api/system.version#remarks) in the following format: *major.minor[.build[.revision]]*. Any other versions formats like `1.0.0-beta5` will cause a compilation failure.
* C++ resource files [require](https://learn.microsoft.com/en-us/windows/win32/menurc/versioninfo-resource#parameters) `FILEVERSION` and `PRODUCTVERSION` resource parameters to have all four version components (*major.minor.build.revision*).
