# .NET project version updater

A GitHub action to update or bump project versions in .csproj, .cs, and .nuspec files.

Supports:

* .NET / .NET Core projects (`.csproj` files);
* .NET Framework AssemblyInfo files (`AssemblyInfo.cs`);
* Nuget package specs (`.nuspec` files).

## Inputs

### `file` (required)

The path to the project file.

**Example**: `src/MyProject.csproj`

### `version` (required)

The new version for the project file.

Can be either explicit (e.g. `1.2.3` or `1.0.0-beta5`) or one of the bump commands:

* `bump-major`;
* `bump-minor`;
* `bump-build`;
* `bump-revision`.

## Outputs

### `oldVersion`

The version found in the file before the update.

**Example**: `1.3.5`

### `newVersion`

The version set by the action during the update.

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
  test:
    runs-on: ubuntu-latest
    name: Update version
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Set MyProject.csproj version
        id: update
        uses: vers-one/dotnet-project-version-updater@v1.0
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
  test:
    runs-on: ubuntu-latest
    name: Update versions
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Set MyProject.csproj version
        id: update
        uses: vers-one/dotnet-project-version-updater@v1.0
        with:
          file: "src/MyProject.csproj"
          version: ${{ github.event.inputs.version }}

      - name: Set AssemblyInfo.cs version
        uses: vers-one/dotnet-project-version-updater@v1.0
        with:
          file: "src/Properties/AssemblyInfo.cs"
          version: ${{ github.event.inputs.version }}

      - name: Set MyProject.nuspec version
        uses: vers-one/dotnet-project-version-updater@v1.0
        with:
          file: "src/MyProject.nuspec"
          version: ${{ github.event.inputs.version }}

      - run: |
          git config user.name "Your Name"
          git config user.email "your-email@users.noreply.github.com"
          git add .
          git commit -m "Update project versions to ${{ steps.update.outputs.newVersion }}"
          git push
```

### Scenario 3: Bump version

```yaml
name: Bump build version

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    name: Build and bump version
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Install .NET 6
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: 6.0.x

      - name: Restore dependencies
        run: dotnet restore

      - name: Build
        run: dotnet build

      - name: Bump build version
        id: bump
        uses: vers-one/dotnet-project-version-updater@v1.0
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

## A few notes on version numbers

* This action searches for the following version declarations:
  * for .csproj and .nuspec files: `<Version>...</Version>` (case insensitive);
  * for .cs files: `[assembly: AssemblyVersion("...")]` and `[assembly: AssemblyFileVersion("...")]`.
* If you set the new version explicitly, you can use any string as a version number (e.g. `1.2.3`, `1.0.0-beta5`, `Vista`, `blah-blah`, etc). However if you use one of the bump commands, the existing version must by in the following format: *major[.minor[.build[.revision]]]*.
* Bump commands don't change any version parts other than requested. For example if you run `bump-minor` command for version `1.5.17`, the new version will be `1.6.17`. Any non-existent version parts will be treated as 0: `bump-revision` on `3.0` will produce `3.0.0.1`.
* Keep in mind that .NET Framework assembly versions [must be](https://docs.microsoft.com/en-us/dotnet/api/system.version#remarks) in the following format: *major.minor[.build[.revision]]*. Any other versions formats like `1.0.0-beta5` will cause a compilation failure.
