# movie-web native-app
<!---
used a table bc this shit is annoying to resize to match, someone pls fix
--->
| iOS | Android |
|:---:|:---:|
| <a href="https://tinyurl.com/axk7vadz"><img src="https://i.imgur.com/46qhEAv.png" width="230"></a> | <a href="https://github.com/movie-web/native-app/releases/latest/download/movie-web.apk"><img src="https://i.imgur.com/WwPPgSZ.png" width="200"></a> |

## iOS Installation

> [!IMPORTANT]
> Sideloading with a paid certificate breaks a few features, most notably:
> - Downloads
> - Alternate App Icons
>   
> We reccomend you use a local development certificate if you care about any of these.

- **AltStore:**
   - Click the Add to AltStore badge to add the movie-web repository to AltStore.

- **Other:**
   - Employ [Sideloadly](https://sideloadly.io/) or a sideloading method of your preference to install the [ipa](https://github.com/movie-web/native-app/releases/latest/download/movie-web.ipa) directly.

## About
This repository uses [Turborepo](https://turborepo.org) and contains:

```text
.github
  └─ workflows
        └─ CI with pnpm cache setup
.vscode
  └─ Recommended extensions and settings for VSCode users
apps
  └─ expo
      ├─ Expo SDK 50
      ├─ React Native using React 18
      ├─ Navigation using Expo Router
      └─ Styling with Tamagui
packages
  ├─ api
  |   └─ Typesafe API calls to the backend
  ├─ tmdb
  |   └─ Typesafe API calls to The Movie Database
  └─ provider-utils
      └─ Typesafe API calls to the video providers 
tooling
  ├─ color
  |   └─ shared color palette
  ├─ eslint
  |   └─ shared, fine-grained, eslint presets
  ├─ prettier
  |   └─ shared prettier configuration
  └─ typescript
      └─ shared tsconfig you can extend from
```

## Getting started

### When it's time to add a new package

To add a new package, simply run `pnpm turbo gen init` in the monorepo root. This will prompt you for a package name as well as if you want to install any dependencies to the new package (of course you can also do this yourself later).

The generator sets up the `package.json`, `tsconfig.json` and a `index.ts`, as well as configures all the necessary configurations for tooling around your package such as formatting, linting and typechecking. When the package is created, you're ready to go build out the package.

### References

This app is based on [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) and [Turborepo](https://turborepo.org).
