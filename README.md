# How Vue works

## structure diagrams.

offer later...

## work list as follows.

- ✅ html parser.
  - Html syntax validation.
- directives.

  - ✅ {{}}
  - ✅ v-bind
  - ✅ v-if

    - `thought`: parse child template identified by `v-if` to be appended as child by its parent node if value of `v-if` expression is `true`, otherwise remove this child.

  - ✅ v-for

    - `thought`: It's the same with `v-if`, parsing child template with for loop over along with collecting all directives inside of it.

    - how to append nodes generated by `v-for`?

      the way of appending nodes generated by `v-for` changes to insert before its sibling node and replace the original node as a placeholder with last generated node.

  - ✅ v-on

    Actually Vue simply use the native dom event system, without creating its own.
    Another thing should be pointed out here is that the event machanism as functions `$emit`, `$on` on components differs with the one mentioned before, which actually is communication between components, however React doesn't need it. React utilize state lifting or callback function passing down as props to do so. But both are for the same purpose of communication between components.

    In addtion, correspondingly React might build its own event system based on virtual dom without the native unlike Vue. Later I will validate this point.

  - v-model

- ✅ data observer.

  As to how to finalize data observer, I think changing each simple value of path recurvely with a object which contains the sub-path data and a watcher list used to collect all dom updates related to that data. Thus, while that sub-path data has been changed somehow, excuting all dom updates from watcher list in set function which is defined by `Object.defineProperty`.

  `progress`:

  - complete a simple observe function which create observer for each field of data, even nested. Support array's function like `push`, `unshift` to trigger the reactive, meaning watcher list will be executed iteratively while change happends on array.

  - test completely on Array's navtive functions like `pop`, `push`, `unshift`,`reverse` and so forth.

- ✅ make directive reactive to data chage.

  - make dom updates related to mustache direactive `{{}}` reactive to data change.
  - make dom updates related to directive `v-bind` reactive to data change.
  - make dom updates related to directive `v-if` reactive to data change.
  - make dom updates related to directive `v-for` reactive to data change.
  - mplement `track-by` feature on `v-for` for better performance on rending array.

- component tree.

## bugs

- ✅ Don't allow exsiting spaces between tags.
- ✅ Tags like \<br /> couldn't be parsed yet.
- ✅ \>, < should not be considered as a tag or end of tag while in between quotes or test.
- ✅ filter attributes to get ones without in relation to VUE to directly set in the target node.
- For both `v-if` and mustache braces, there is js expression support left on its value.
- executed twice on the reactive registration of v-if in v-if test.

## Issues

- When debug tests in Jest, error shows in the termial like `node_modules\jest\node_modules\jest-cli\build\cli\index.js:227 } catch {`

  This issue is caused by the conflict between local installation of node and nvm. through removing local installation and setting default version of node in nvm as greater than 9.11.2, it's fixed.
  Because node version less than 9.11.2 doesn't offer handling the catch block of jest file.

  refer to

  - [Jest js node_modules\jest\node_modules\jest-cli\build\cli\index.js:227 } catch {](https://stackoverflow.com/questions/64660449/jest-js-node-modules-jest-node-modules-jest-cli-build-cli-index-js227-catch)

  - [nvm is not compatible with the npm config "prefix" option:](https://stackoverflow.com/questions/34718528/nvm-is-not-compatible-with-the-npm-config-prefix-option)

  - [How can the default node version be set using NVM?](https://stackoverflow.com/questions/47190861/how-can-the-default-node-version-be-set-using-nvm)

- Remove items in array loop-over.
  refer to

  [Looping through array and removing items, without breaking for loop](https://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop)

  [How to Loop Through Array and Remove Items Without Breaking the For Loop](https://www.w3docs.com/snippets/javascript/how-to-loop-through-array-and-remove-items-without-breaking-the-for-loop.html)

## Questions

take notes of questions I am encountering and thinking during this progarm.

- How to deal with placeholder node for `v-if`?

  supply later...

- How to deal with placeholder node for `v-for`?

  supply later...

- How to keep track of directives in `v-if` and `v-for` block?

  supply later...

- How to implement an Observer based on `Object.definePropery`?

  supply later...

- How to implement `track-by` to improve the performace of `v-for` directive?

  supply later...

- Is creation of component tree necessary? and how to create it?

  Form my prospective now, It's necessary to create a component tree for finding out all child components to unmount them with invoking their lifecycle function.
  As how to create it, We can identify Component node and directly render it, as well concatenate with parent component ref as a child ref in parsing phase. through rendering component, end up with getting the root element ref and unsubscription array. then insert that ref of root elemment into dom, in the meantime store both it and unsubscription into component instance.

- could directives work on component node?
- Do I need to collects all doms update as a batch for performance while data changes?
- Whether I have to use class to create component, Could I apply function simple?
  `Class` actually is a contructor function which creates an object in heap and initialize it. There are totally two duties, one is creating an object, another is initialization of it. So can we manually create an object, then using a normal function to initialze it? but how can we access that object created? React uses hooks to sort out this problem, So therefore I think we can do the same as react by adopting hooks. hooks is based on JS closure by it own.

  In terms of programming language, Once function can be returned inside of another function, Closure mechaism is inevitable to be included into that language, because as long as ref to that function hasn't died, then its context couldn't be recycled.
