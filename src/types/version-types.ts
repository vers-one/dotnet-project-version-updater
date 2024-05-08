export interface VersionUpdateRule
{
    updateMode: VersionUpdateMode;
    explicitVersion: string | null;
    updatePattern: VersionUpdatePattern | null;
}

export enum VersionUpdateMode
{
    SET_EXPLICIT_VERSION,
    USE_PATTERN
}

export interface VersionUpdatePattern
{
    build: VersionPartUpdateRule;
    major: VersionPartUpdateRule;
    minor: VersionPartUpdateRule;
    revision: VersionPartUpdateRule;
}

export interface VersionPartUpdateRule
{
    updateMode: VersionPartUpdateMode;
    overwriteTo: number | null;
}

export enum VersionPartUpdateMode
{
    LEAVE_UNCHANGED,
    LEAVE_UNCHANGED_SET_MISSING_TO_ZERO,
    BUMP,
    OVERWRITE,
    REMOVE
}

export interface Version
{
    major: number;
    minor: number | null;
    build: number | null;
    revision: number | null;
}
