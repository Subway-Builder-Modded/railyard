import{a as e}from"./chunk-BEqpzyXh.js";import{t}from"./jsx-runtime-qJqhvtml.js";var n=e(t());function r(e){let t={a:`a`,code:`code`,figure:`figure`,h2:`h2`,h3:`h3`,hr:`hr`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,span:`span`,strong:`strong`,ul:`ul`,...e.components},{Alert:r,Caution:i,Image:o,Note:s,Tip:c}=t;return r||a(`Alert`,!0),i||a(`Caution`,!0),o||a(`Image`,!0),s||a(`Note`,!0),c||a(`Tip`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.p,{children:`This guide will walk you through installing and setting up Railyard on macOS-based systems.`}),`
`,(0,n.jsx)(t.h2,{id:`downloading-railyard`,children:`Step 1 - Downloading Railyard`}),`
`,(0,n.jsxs)(t.p,{children:[`To install Railyard on macOS, navigate to the `,(0,n.jsx)(t.a,{href:`/railyard`,children:`download page`}),` and select your version from the `,(0,n.jsx)(t.strong,{children:`Downloads`}),` section.`]}),`
`,(0,n.jsx)(t.hr,{}),`
`,(0,n.jsx)(t.h2,{id:`dequarantining-railyard`,children:`Step 2 - Dequarantining Railyard`}),`
`,(0,n.jsx)(t.p,{children:`When you first try to open Railyard, macOS will show a dialog saying the app can't be opened because Apple cannot check it for malicious software. This is expected for unsigned apps.`}),`
`,(0,n.jsxs)(c,{children:[(0,n.jsx)(t.p,{children:`If you prefer not to use a DMG, you can install Railyard using the ZIP file.`}),(0,n.jsxs)(t.ol,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Download `,(0,n.jsx)(t.code,{children:`railyard-macos-universal.zip`}),` from the `,(0,n.jsx)(t.a,{href:`/railyard`,children:`download page`}),`.`]}),`
`,(0,n.jsx)(t.li,{children:`Extract the ZIP (double-click it in Finder).`}),`
`,(0,n.jsxs)(t.li,{children:[`Move `,(0,n.jsx)(t.code,{children:`railyard.app`}),` to your `,(0,n.jsx)(t.strong,{children:`Applications`}),` folder.`]}),`
`,(0,n.jsx)(t.li,{children:`Follow the dequarantining steps below.`}),`
`]})]}),`
`,(0,n.jsx)(t.h3,{id:`right-click`,children:`Option A: Right-Click to Open (Recommended)`}),`
`,(0,n.jsxs)(t.ol,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Open `,(0,n.jsx)(t.strong,{children:`Finder`}),` and navigate to `,(0,n.jsx)(t.strong,{children:`Applications`}),`.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Right-click`}),` (or Control-click) on `,(0,n.jsx)(t.strong,{children:`Railyard`}),`.`]}),`
`,(0,n.jsxs)(t.li,{children:[`Select `,(0,n.jsx)(t.strong,{children:`Open`}),` from the context menu.`]}),`
`,(0,n.jsxs)(t.li,{children:[`A dialog will appear with an `,(0,n.jsx)(t.strong,{children:`Open`}),` button. Click it.`]}),`
`]}),`
`,(0,n.jsx)(t.p,{children:`You only need to do this once. After the first launch, you can open Railyard normally.`}),`
`,(0,n.jsx)(t.h3,{id:`system-settings`,children:`Option B: System Settings`}),`
`,(0,n.jsxs)(t.ol,{children:[`
`,(0,n.jsx)(t.li,{children:`Try to open Railyard normally (it will be blocked).`}),`
`,(0,n.jsxs)(t.li,{children:[`Open `,(0,n.jsx)(t.strong,{children:`System Settings`}),` > `,(0,n.jsx)(t.strong,{children:`Privacy & Security`}),`.`]}),`
`,(0,n.jsxs)(t.li,{children:[`Scroll down to the `,(0,n.jsx)(t.strong,{children:`Security`}),` section. You should see a message about Railyard being blocked.`]}),`
`,(0,n.jsxs)(t.li,{children:[`Click `,(0,n.jsx)(t.strong,{children:`Open Anyway`}),` and confirm.`]}),`
`]}),`
`,(0,n.jsx)(t.h3,{id:`terminal`,children:`Option C: Terminal`}),`
`,(0,n.jsx)(t.p,{children:`If neither option above works, you can remove the quarantine attribute from the executable directly by running:`}),`
`,(0,n.jsx)(t.figure,{"data-rehype-pretty-code-figure":``,children:(0,n.jsx)(t.pre,{tabIndex:`0`,"data-language":`bash`,"data-theme":`github-dark github-light-high-contrast`,children:(0,n.jsx)(t.code,{"data-language":`bash`,"data-theme":`github-dark github-light-high-contrast`,style:{display:`grid`},children:(0,n.jsxs)(t.span,{"data-line":``,children:[(0,n.jsx)(t.span,{style:{"--shiki-dark":`#B392F0`,"--shiki-light":`#702C00`},children:`xattr`}),(0,n.jsx)(t.span,{style:{"--shiki-dark":`#79B8FF`,"--shiki-light":`#023B95`},children:` -cr`}),(0,n.jsx)(t.span,{style:{"--shiki-dark":`#9ECBFF`,"--shiki-light":`#032563`},children:` /Applications/railyard.app`})]})})})}),`
`,(0,n.jsx)(t.p,{children:`Then, open Railyard normally.`}),`
`,(0,n.jsx)(t.hr,{}),`
`,(0,n.jsx)(t.h2,{id:`setting-up-railyard`,children:`Step 3 - Setting Up Railyard`}),`
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
`,(0,n.jsx)(s,{children:(0,n.jsx)(t.p,{children:`Game executable refers to the actual file that launches the game, not any shortcut or folder containing it.`})}),`
`,(0,n.jsx)(t.h3,{id:`github-token`,children:`GitHub Token`}),`
`,(0,n.jsxs)(t.p,{children:[`The next prompt will ask you to input your GitHub token. This is optional, but `,(0,n.jsx)(t.strong,{children:`highly`}),` recommended to avoid hitting GitHub's API rate limits when using Railyard. If you do not have a token or do not wish to use one, simply click `,(0,n.jsx)(t.strong,{children:`Next`}),` to continue with the setup process. You can always add a token later via the settings menu. To set up a GitHub token, see the `,(0,n.jsx)(t.a,{href:`/railyard/docs/v0.2/github-token`,children:`GitHub Token guide`}),`.`]}),`
`,(0,n.jsx)(t.h3,{id:`automatic-updates`,children:`Automatic Updates`}),`
`,(0,n.jsx)(t.p,{children:`The final prompt will ask you whether you want to enable automatic updates. This will allow Railyard to prompt you every time a new version is released, allowing you to easily stay up-to-date with the latest features and bug fixes.`}),`
`,(0,n.jsx)(c,{children:(0,n.jsx)(t.p,{children:`It is recommended to keep this enabled to ensure you have the latest features and bug fixes. This can be toggled at any time via the settings menu.`})}),`
`,(0,n.jsx)(t.hr,{}),`
`,(0,n.jsx)(t.h2,{id:`launching-subway-builder`,children:`Step 4 - Launching Subway Builder`}),`
`,(0,n.jsxs)(t.p,{children:[`Once you install content through Railyard, you must launch the game through Railyard for the content to work properly. To do this, simply click the `,(0,n.jsx)(t.strong,{children:`Launch`}),` button located on the Railyard navbar.`]}),`
`,(0,n.jsx)(i,{children:(0,n.jsxs)(t.p,{children:[`If you launch the game directly (not through Railyard), `,(0,n.jsx)(t.strong,{children:`the game will still launch`}),` and some mods may still work. However, maps will load without the necessary data needed to load in-game and any custom command-line arguments set through Railyard will not be applied.`]})}),`
`,(0,n.jsxs)(t.p,{children:[`When the game is launched, open `,(0,n.jsx)(t.strong,{children:`Settings`}),`. Scroll until you see `,(0,n.jsx)(t.strong,{children:`Mod Manager`}),`.`]}),`
`,(0,n.jsx)(`p`,{align:`center`,children:(0,n.jsx)(o,{width:`800`,alt:`image`,src:`/images/railyard/docs/v0.2/installing-railyard/macos/mod-manager.png`})}),`
`,(0,n.jsxs)(t.p,{children:[`In that menu, enable the `,(0,n.jsx)(t.strong,{children:`Railyard Map Loader`}),` mod.`]}),`
`,(0,n.jsx)(r,{children:(0,n.jsx)(t.p,{children:`This is required to load maps installed through Railyard. If you do not enable this mod, maps will fail to load properly.`})}),`
`,(0,n.jsxs)(t.p,{children:[`After that, you're ready to play! If you have any questions or run into any issues, feel free to ask questions in the `,(0,n.jsx)(t.a,{href:`https://discord.gg/jrNQpbytUQ`,children:`Discord`}),` or raise an issue on `,(0,n.jsx)(t.a,{href:`https://github.com/Subway-Builder-Modded/monorepo/issues`,children:`GitHub`}),`.`]})]})}function i(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};