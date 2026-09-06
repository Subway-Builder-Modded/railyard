import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={code:`code`,li:`li`,strong:`strong`,ul:`ul`,...e.components},{ChangelogSection:r}=t;return r||a(`ChangelogSection`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r,{type:`features`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Added `,(0,n.jsx)(t.code,{children:`.railyard_{asset_type}`}),` shared directory support for maps`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Assets can now include this folder in their `,(0,n.jsx)(t.code,{children:`.zip`}),` and Railyard will preserve the files there and place them in the asset's installed directory`]}),`
`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`Added support for `,(0,n.jsx)(t.code,{children:`buildings_index.bin`}),` (post 1.3.0 map building index format)`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Railyard now loads the `,(0,n.jsx)(t.code,{children:`.bin`}),` or `,(0,n.jsx)(t.code,{children:`.json`}),` index conditionally depending on the user's installed game version`]}),`
`]}),`
`]}),`
`,(0,n.jsx)(t.li,{children:`Added country-name search (including endonyms such as 日本, Eesti, etc.) for maps`}),`
`,(0,n.jsx)(t.li,{children:`Added support for rendering building foundations for modded maps`}),`
`,(0,n.jsxs)(t.li,{children:[`Added prevention from new game-version incompatible subscriptions persisting to disc`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Assets marked incompatible with the installed game version now have an `,(0,n.jsx)(t.code,{children:`INCOMPATIBLE`}),` status in the library page`]}),`
`,(0,n.jsx)(t.li,{children:`Launching the game with any incompatibilities now shows a popup asking the user for confirmation before continuing`}),`
`,(0,n.jsxs)(t.li,{children:[`Map incompatibility is determined automatically from the presence of the new `,(0,n.jsx)(t.code,{children:`.bin.gz`}),` buildings index format`]}),`
`]}),`
`]}),`
`]})}),`
`,(0,n.jsx)(r,{type:`improvements`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Persist cache of asset versions to disk and use conditional fetches via ETags to reduce Github API request churn`}),`
`,(0,n.jsx)(t.li,{children:`Registry clone no longer blocks app startup`}),`
`,(0,n.jsx)(t.li,{children:`Map thumbnails now generate based on the zoom level of the map config's InitialViewState`}),`
`,(0,n.jsxs)(t.li,{children:[`Maps can now set `,(0,n.jsx)(t.code,{children:`minZoom`}),`, `,(0,n.jsx)(t.code,{children:`maxZoom`}),`, and `,(0,n.jsx)(t.code,{children:`demandDotScaling`}),` in their `,(0,n.jsx)(t.code,{children:`config.json`})]}),`
`,(0,n.jsx)(t.li,{children:`The Registry git clone no longer clones tags (and prunes all existing tags so older registry clones are made smaller)`}),`
`,(0,n.jsx)(t.li,{children:`Attempted subscriptions to assets incompatible with the current game version no longer persist to disc`}),`
`,(0,n.jsx)(t.li,{children:`Bootstrapped game version constraints for content installed before 0.2.4`}),`
`]})}),`
`,(0,n.jsx)(r,{type:`bugfixes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Fixed download button enabled even if an asset was not compatible with the current game version (and added help text)`}),`
`,(0,n.jsxs)(t.li,{children:[`Fixed country flags not rendering on `,(0,n.jsx)(t.strong,{children:`Browse`}),`/`,(0,n.jsx)(t.strong,{children:`Home`})]}),`
`,(0,n.jsx)(t.li,{children:`Fixed a bug where the game could be launched twice (if the initial launch was delayed)`}),`
`,(0,n.jsx)(t.li,{children:`Fixed laggy search caused by eager rendering and excessive use of Fuse`}),`
`,(0,n.jsx)(t.li,{children:`Fixed an issue where a map was downloadable despite not having an integrity check`}),`
`,(0,n.jsx)(t.li,{children:`Fixed an issue where new assets were not shown on the frontend due to localization inconsistencies in date mapping`}),`
`,(0,n.jsx)(t.li,{children:`Fixed issue where newly released assets without passing integrity could be installed via update`}),`
`,(0,n.jsxs)(t.li,{children:[`Fixed game version dependency parsing to honor Custom JSON version expressions over `,(0,n.jsx)(t.code,{children:`manifest.json`}),` when provided`]}),`
`,(0,n.jsx)(t.li,{children:`Fixed Railyard logo not being correctly centered on Home Page`}),`
`,(0,n.jsx)(t.li,{children:`Fixed the custom colors map layer not working properly`}),`
`,(0,n.jsx)(t.li,{children:`Fixed game version detection on Linux/macOS`}),`
`]})}),`
`,(0,n.jsx)(r,{type:`notes`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Split `,(0,n.jsx)(t.code,{children:`europe`}),` map tag into multiple regions`]}),`
`,(0,n.jsxs)(t.li,{children:[`Reduced local clone size of registry repository from ~1.4 GB to around ~300MB`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Large PNG/JPG are now automatically replaced with WebP`}),`
`,(0,n.jsx)(t.li,{children:`App-unused files are now sequestered to a separate branch`}),`
`,(0,n.jsx)(t.li,{children:`Local registry no longer clones tags, reducing .git size`}),`
`]}),`
`]}),`
`]})})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};