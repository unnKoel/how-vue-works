# 🐰 How Vue works

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

  - ( **cancel**) v-model
    `v-model` is the combination of `v-bind` and `v-on` on functionality, so don't consider to implement it, instead involve kind of custom directive in to leave it outside for extension

- ✅ data observer.

  As to how to finalize data observer, I think changing each simple value of path recurvely with a object which contains the sub-path data and a watcher list used to collect all dom updates related to that data. Thus, while that sub-path data has been changed somehow, excuting all dom updates from watcher list in set function which is defined by `Object.defineProperty`.

  `progress`:

  - complete a simple observe function which create observer for each field of data, even nested. Support array's function like `push`, `unshift` to trigger the reactive, meaning watcher list will be executed iteratively while change happends on array.

  - test completely on Array's navtive functions like `pop`, `push`, `unshift`,`reverse` and so forth.

- make directive reactive to data chage.

  - ✅ make dom updates related to mustache direactive `{{}}` reactive to data change.
  - ✅ make dom updates related to directive `v-bind` reactive to data change.
  - ✅ make dom updates related to directive `v-if` reactive to data change.
  - ✅ make dom updates related to directive `v-for` reactive to data change.
  - ✅ mplement `track-by` feature on `v-for` for better performance on rending array.

- component tree.

  - ✅ refactor render function as well as test related to make it supported to render component.
  - ✅ complete coding on creation of component tree.
  - ✅ complete basic implementation of hooks involving `useData`, `useMethod`, `useEvents`, `useComponents` as a base.
  - ✅ implementation of props.
  - ✅ pub-sub pattern implementation working on communication between components.
  - ✅ lifecycle functions of component.
  - ✅ when unmount components, trigger the unsubscriptive callbacks to avoid risk of memory leak.
  - ✅ when unmount components, trigger all descendant components to exectute unmount lifecycle function.
  - tests
    - ✅ testing on propogation of events happends in component tree.
    - ✅ testing to validate event trigger.
    - ✅ unsubscribe dom events.
    - ✅ destruture components sub-tree and unmount lifecycle executes.

- slot

  - ✅ regular slot
  - ✅ named slot

- ✅ update as a batch.

## bugs

- ✅ Don't allow exsiting spaces between tags.
- ✅ Tags like \<br /> couldn't be parsed yet.
- ✅ \>, < should not be considered as a tag or end of tag while in between quotes or test.
- ✅ filter attributes to get ones without in relation to VUE to directly set in the target node.
- (**cancel**) For both `v-if` and mustache braces, there is js expression support left on its value.
- ✅ executed twice on the reactive registration of v-if in v-if test.

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

- how to dispatch an event programmatically?

  [Creating and triggering events](https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events)

- bubble and capture phase in an event lifecycle.

  [bubble and capture](https://zh.javascript.info/bubbling-and-capturing)

- Detecting support for a given javascript event?

  [Detecting support for a given JavaScript event?](https://stackoverflow.com/questions/2877393/detecting-support-for-a-given-javascript-event)

- what's the microtasks and macrotasks?

  [Event loop: microtasks and macrotasks](https://javascript.info/event-loop#use-case-3-doing-something-after-the-event)

  [What are micro tasks and macro tasks in the event loop?] (https://medium.com/globant/what-are-micro-tasks-and-macro-tasks-in-the-event-loop-29bc0abdd445)

- what's the memory leak in javascript?
  [How to escape from memory leaks in Javascript](https://blog.logrocket.com/escape-memory-leaks-javascript/)

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

  By this way of hooks, for developer they are able to write function only, this programming form is exactly what I prefer.

- how to implement slots?

  Before render child component found in parent template, wrap up the block inside child component tags and compile it as a child template. then take compilation result as a parameter to render child component. In this process, using the compilation result of child template to replace the position `slot` resides.

## Reference

- [Automatic Batching in React 18: What You Should Know](https://blog.bitsrc.io/automatic-batching-in-react-18-what-you-should-know-d50141dc096e)
- [Batch Update analysis](https://zhuanlan.zhihu.com/p/28532725)
- [Dive into react - batchUpdate](https://zhuanlan.zhihu.com/p/78516581)
- [React Transaction](https://github.com/facebook/react/blob/b1768b5a48d1f82e4ef4150e0036c5f846d3758a/src/renderers/shared/stack/reconciler/Transaction.js#L19-L54)
- [react18 parsing: The implementation of Automatic Batching](https://juejin.cn/post/7196313603426910269)
- [How to make Jest wait for all asynchronous code to finish execution before expecting an assertion](https://stackoverflow.com/questions/44741102/how-to-make-jest-wait-for-all-asynchronous-code-to-finish-execution-before-expec)
