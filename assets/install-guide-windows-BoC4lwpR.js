import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={a:`a`,code:`code`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,p:`p`,strong:`strong`,ul:`ul`,...e.components},{Alert:r,Caution:i,Image:o,Important:s,Note:c,Tip:l}=t;return r||a(`Alert`,!0),i||a(`Caution`,!0),o||a(`Image`,!0),s||a(`Important`,!0),c||a(`Note`,!0),l||a(`Tip`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.p,{children:`This guide will walk you through installing and setting up Railyard on Windows-based systems.`}),`
`,(0,n.jsx)(t.h2,{id:`downloading-railyard`,children:`Step 1 - Downloading Railyard`}),`
`,(0,n.jsxs)(t.p,{children:[`To install Railyard on Windows, navigate to the `,(0,n.jsx)(t.a,{href:`https://subwaybuildermodded.com/railyard`,children:`download page`}),` and select your version from the `,(0,n.jsx)(t.strong,{children:`Downloads`}),` section. You `,(0,n.jsx)(t.strong,{children:`must`}),` download the correct version for your system architecture (x64 or ARM64). Otherwise, the Railyard installer will not work.`]}),`
`,(0,n.jsx)(s,{children:(0,n.jsxs)(t.p,{children:[`You will need administrative privileges to install Railyard on Windows. If you wish to install a portable version, select the portable version from the `,(0,n.jsx)(t.strong,{children:`Downloads`}),` section on the download page.`]})}),`
`,(0,n.jsx)(t.p,{children:`Install the app as you normally would any other app on Windows.`}),`
`,(0,n.jsx)(t.hr,{}),`
`,(0,n.jsx)(t.h2,{id:`setting-up-railyard`,children:`Step 2 - Setting Up Railyard`}),`
`,(0,n.jsx)(t.p,{children:`When you first launch Railyard, you will need to run through the setup process.`}),`
`,(0,n.jsx)(t.h3,{id:`data-folder`,children:`Data Folder`}),`
`,(0,n.jsxs)(t.p,{children:[`First, you will be prompted to select your `,(0,n.jsx)(t.code,{children:`metro-maker4`}),` folder.`]}),`
`,(0,n.jsxs)(t.p,{children:[`If you did not manually modify this, click `,(0,n.jsx)(t.strong,{children:`Auto-Detect`}),`. Otherwise, select the location of this folder. Railyard will automatically validate it.`]}),`
`,(0,n.jsxs)(r,{children:[(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.code,{children:`metro-maker4`}),` will `,(0,n.jsx)(t.strong,{children:`only`}),` be recognized as a valid data folder if you have previously:`]}),(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Launched the game at least once`}),`
`,(0,n.jsxs)(t.li,{children:[`Loaded a map in-game (to populate `,(0,n.jsx)(t.code,{children:`cities/`}),`)`]}),`
`]})]}),`
`,(0,n.jsx)(t.h3,{id:`game-executable`,children:`Game Executable`}),`
`,(0,n.jsxs)(t.p,{children:[`After, you will be asked to select your game executable. Once again, click `,(0,n.jsx)(t.strong,{children:`Auto-Detect`}),` if you have not modified this. Otherwise, select the location of your game executable.`]}),`
`,(0,n.jsx)(c,{children:(0,n.jsx)(t.p,{children:`Game executable refers to the actual file that launches the game, not any shortcut or folder containing it.`})}),`
`,(0,n.jsx)(t.h3,{id:`github-token`,children:`GitHub Token`}),`
`,(0,n.jsxs)(t.p,{children:[`The next prompt will ask you to input your GitHub token. This is optional, but `,(0,n.jsx)(t.strong,{children:`highly`}),` recommended to avoid hitting GitHub's API rate limits when using Railyard. If you do not have a token or do not wish to use one, simply click `,(0,n.jsx)(t.strong,{children:`Next`}),` to continue with the setup process. You can always add a token later via the settings menu.`]}),`
`,(0,n.jsx)(t.h3,{id:`automatic-updates`,children:`Automatic Updates`}),`
`,(0,n.jsx)(t.p,{children:`The final prompt will ask you whether you want to enable automatic updates. This will allow Railyard to prompt you every time a new version is released, allowing you to easily stay up-to-date with the latest features and bug fixes.`}),`
`,(0,n.jsx)(l,{children:(0,n.jsx)(t.p,{children:`It is recommended to keep this enabled to ensure you have the latest features and bug fixes. This can be toggled at any time via the settings menu.`})}),`
`,(0,n.jsx)(t.hr,{}),`
`,(0,n.jsx)(t.h2,{id:`launching-subway-builder`,children:`Step 3 - Launching Subway Builder`}),`
`,(0,n.jsxs)(t.p,{children:[`Once you install content through Railyard, you must launch the game through Railyard for the content to work properly. To do this, simply click the `,(0,n.jsx)(t.strong,{children:`Launch`}),` button located on the Railyard navbar.`]}),`
`,(0,n.jsx)(i,{children:(0,n.jsxs)(t.p,{children:[`If you launch the game directly (not through Railyard), `,(0,n.jsx)(t.strong,{children:`the game will still launch`}),` and some mods may still work. However, maps will load without the necessary data needed to load in-game and any custom command-line arguments set through Railyard will not be applied.`]})}),`
`,(0,n.jsxs)(t.p,{children:[`When the game is launched, open `,(0,n.jsx)(t.strong,{children:`Settings`}),`. Scroll until you see `,(0,n.jsx)(t.strong,{children:`Mod Manager`}),`.`]}),`
`,(0,n.jsx)(`p`,{align:`center`,children:(0,n.jsx)(o,{width:`500`,alt:`image`,src:`/images/railyard/docs/v0.1/install-guide-windows/mod-manager.png`})}),`
`,(0,n.jsxs)(t.p,{children:[`In that menu, enable the `,(0,n.jsx)(t.strong,{children:`Railyard Map Loader`}),` mod.`]}),`
`,(0,n.jsx)(r,{children:(0,n.jsx)(t.p,{children:`This is required to load maps installed through Railyard. If you do not enable this mod, maps will fail to load properly.`})}),`
`,(0,n.jsxs)(t.p,{children:[`After that, you're ready to play! If you have any questions or run into any issues, feel free to ask questions in the `,(0,n.jsx)(t.a,{href:`https://discord.gg/jrNQpbytUQ`,children:`Discord`}),` or raise an issue on `,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/monorepo/issues`,children:`GitHub`}),`.`]})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};