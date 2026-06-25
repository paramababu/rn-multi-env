# rn-multi-env

[![npm version](https://badge.fury.io/js/rn-multi-env.svg)](https://www.npmjs.com/package/rn-multi-env)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/paramababu/rn-multi-env?style=social)](https://github.com/paramababu/rn-multi-env)

CLI to automatically create Android/iOS build flavors for React Native projects with `.env` support and `react-native-config` integration.

---

## 🚀 Features

- 📁 Creates `android/app/src/<flavor>` folder with manifest and strings
- 📜 Injects flavor into `build.gradle` (`productFlavors`)
- 🍏 Generates `ios/GoogleService-Info-<flavor>.plist` and `ios/config/<Flavor>.xcconfig` (with `ENVFILE`, bundle id and display name), then prints the manual Xcode scheme/configuration steps
- 🌱 Creates `.env.<flavor>` file using a customizable template
- 🧠 Injects `require('react-native-config')` into `App.js` or `App.tsx`
- 📦 Auto-installs `react-native-config` using npm/yarn/pnpm (based on lock files)
- 📜 Automatically adds run script to `package.json` like:  
  ```json
  "android-staging": "cd android && ./gradlew installStagingDebug"
  ```
- 🧹 Removes a flavor (Android src, `.env`, iOS plist, gradle block, run script) with `remove`, supporting `--dry-run`

---

## 📦 Installation

```bash
npm install -g rn-multi-env
```

---

## 🛠️ Usage

### Create a new flavor

```bash
npx rn-multi-env create staging \
  --package=com.myapp.staging \
  --name="MyApp Staging"
```

> When `--package` is provided it is set as the flavor's `applicationId` in
> `build.gradle`. Without it, an `applicationIdSuffix` derived from the flavor
> name is used instead.

Flavor names must be camelCase identifiers (letters and digits, starting with a
lowercase letter). Reserved Gradle names like `test`, `main`, and `androidTest`
are rejected.

### Remove a flavor

```bash
npx rn-multi-env remove staging
# preview without changing anything
npx rn-multi-env remove staging --dry-run
```

---

## 📲 How to Run a Flavor

Once created, a script is added to your `package.json`. You can run the app using:

```bash
yarn android-staging
# or
npm run android-staging
```

This will internally run:

```bash
cd android && ./gradlew installStagingDebug
```

⚠️ **Note:** Do not name your flavor `test` — it's a reserved word in Gradle and will break the build.

---

## 🍏 Finishing iOS Setup

iOS can't be fully automated safely (it would mean editing `project.pbxproj`), so the
CLI generates the supporting files and prints the remaining manual Xcode steps:

1. Open `ios/<App>.xcodeproj` (or `.xcworkspace`) in Xcode.
2. **Project ▸ Info ▸ Configurations** — duplicate `Debug`/`Release` into
   `Debug.<flavor>` / `Release.<flavor>`.
3. Set each new configuration's *Based on configuration file* to
   `config/<Flavor>.xcconfig`.
4. **Product ▸ Scheme ▸ Manage Schemes** — add a `<flavor>` scheme pointing its
   Run/Archive build configs at the new configurations.
5. Replace `GoogleService-Info-<flavor>.plist` with the real Firebase file.

Then run:

```bash
npx react-native run-ios --scheme staging
```

---

## 📁 Resulting Structure

```
android/app/src/staging/
├── AndroidManifest.xml
└── res/values/strings.xml

ios/
├── GoogleService-Info-staging.plist
└── config/
    └── Staging.xcconfig

.env.staging

App.js (or App.tsx)
└── require('react-native-config') injected
```

---

## 🧪 Template Support

You can customize `.env` by creating:
```
templates/env.example
```

```env
API_URL=https://api.YOUR_FLAVOR.example.com
APP_ENV=YOUR_FLAVOR
```

This will be used and replaced automatically.

---

## 🔧 Auto Dependency Detection

The CLI will detect your project setup and use:
- `yarn add react-native-config`
- `pnpm add react-native-config`
- `npm install react-native-config`

---

## 🗂️ Project Structure

```
bin/
└── cli.js              # executable entry point (shebang)
src/
├── cli.js              # commander setup + error handling
├── flavor.js           # create/remove orchestration
├── android.js          # manifest, strings.xml, build.gradle
├── ios.js              # plist + xcconfig + Xcode steps
├── env.js              # .env + react-native-config wiring
├── scripts.js          # package.json run scripts
├── gradle.js           # pure build.gradle string transforms
├── validate.js         # flavor-name validation
├── paths.js            # project paths (root-injectable)
├── prompt.js           # inquirer wrapper
├── logger.js           # centralized colored output
└── utils.js            # capitalize, safe JSON read
tests/                  # Jest unit + integration tests
templates/
└── env.example
```

## 🧪 Development & Testing

```bash
npm install
npm test            # run the Jest suite
npm run test:watch  # watch mode
npm run test:coverage
```

The filesystem generators take a `root` argument so they run against isolated
temp directories in tests; `src/gradle.js` is pure string logic and fully unit
tested.

---

## 📄 License

MIT © [paramababu](https://github.com/paramababu)
