# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0] - 2026-06-24
### Changed
- Refactored the single `index.js` into a modular `src/` structure (`cli`, `flavor`, `android`, `ios`, `env`, `scripts`, `gradle`, `validate`, `paths`, `prompt`, `logger`, `utils`) with a thin `bin/cli.js` entry point
- Centralized console output in `src/logger.js`
- Brace-aware, indentation-preserving `build.gradle` injection/removal extracted into pure, testable functions

### Added
- Jest unit + integration test suite (`tests/`) covering validation, gradle transforms, and all generators against temp projects
- CI workflow running tests on Node 18 & 20; release workflow now runs tests before publishing
- Error handling: friendly messages + non-zero exit codes for unexpected failures and malformed `package.json`
- `remove <flavor>` command (with `--dry-run`) wired into the CLI
- Flavor-name validation (rejects invalid identifiers and reserved Gradle names)
- `--package` now sets the flavor `applicationId` in `build.gradle`
- Real iOS support: per-flavor `ios/config/<Flavor>.xcconfig` (ENVFILE, bundle id, display name), a valid placeholder `GoogleService-Info-<flavor>.plist`, and printed Xcode scheme/configuration steps
- `LICENSE` file (MIT)

### Fixed
- Brace-aware removal of flavor blocks from `build.gradle`
- Ensure a `flavorDimensions` declaration exists when appending to existing `productFlavors`
- Removed committed `firebase-debug.log` and redundant `yarn.lock`

## [1.0.7] - 2025-07-23
### Added
- Flavor creation with `.env`, Android `build.gradle`, iOS plist, and App.js/ts config injection
- Automatic installation of `react-native-config` based on lock files (npm/yarn/pnpm)
- `--dry-run` support for previewing changes before applying
- `remove <flavor>` command with cleanup of Android src, .env files, scripts, and App.js preview
- Run script auto-generation in `package.json` for created flavors
- Dry-run preview for removal with summary
- Auto-detect App.js or App.tsx
- App name injection in `strings.xml` and `build.gradle`
- Warning on invalid flavor names like `test`

### Fixed
- Metro bundler crash on dynamic `require` of package.json
- Incorrect namespace vs. manifest `package` mismatch

### Changed
- Better logging (used npm/yarn, actions done, etc.)
- Refactored script structure for maintainability


### [1.0.4](https://github.com/paramababu/rn-build-flavor-cli/compare/v1.0.2...v1.0.4) (2025-07-21)

### 1.0.3 (2025-07-21)
