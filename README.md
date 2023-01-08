## How Vue works

work list as follows.

- ✅ html parser.
  - Html syntax validation.
- directives.
  - ✅ {{}}
  - ✅ v-bind
  - ✅ v-if
    - `thought`: parse child template identified by `v-if` to be appended as child by its parent node if value of `v-if` expression is `true`, otherwise remove this child.

    - `work`: test to `v-if` is completed.
  - ✅ v-for
    - `thought`: It's the same with `v-if`, parsing child template with for loop over along with collecting all directives inside of it.
    
    - `work`: there is test left.
  - v-on
  - v-model
- data observer.
- component tree.

#### Issues
- ✅ Don't allow exsiting spaces between tags.
- ✅ Tags like \<br /> couldn't be parsed yet.
- \>, < should not be considered as a tag or end of tag while in between quotes or test.
- filter attributes to get ones without in relation to VUE to directly set in the target node.
- For both `v-if` and mustache braces, there is js expression support left on its value. 
- When debug tests in Jest, error shows in the termial like `node_modules\jest\node_modules\jest-cli\build\cli\index.js:227 } catch {`

  This issue is caused by the conflict between local installation of node and nvm. through removing local installation and setting default version of node in nvm as greater than 9.11.2, it's fixed.
  Because node version less than 9.11.2 doesn't offer handling the catch block of jest file.

  refer to 
  - [Jest js node_modules\jest\node_modules\jest-cli\build\cli\index.js:227 } catch {](https://stackoverflow.com/questions/64660449/jest-js-node-modules-jest-node-modules-jest-cli-build-cli-index-js227-catch)

  - [nvm is not compatible with the npm config "prefix" option:](https://stackoverflow.com/questions/34718528/nvm-is-not-compatible-with-the-npm-config-prefix-option)

  - [How can the default node version be set using NVM?](https://stackoverflow.com/questions/47190861/how-can-the-default-node-version-be-set-using-nvm)

