## How Vue works

work list as follows.

- ✅ html parser.
  - Html syntax validation.
- directives.
  - ✅ {{}}
  - ✅ v-bind
  - ✅ v-if
    - `idea`: parse child template identified by `v-if` to be appended as child by its parent node if value of `v-if` expression is `true`, otherwise remove this child.

    - `work`: there is test left.
  - v-for
  - v-on
  - v-model
- data observer.
- component tree.

#### Issues
- ✅ Don't allow exsiting spaces between tags.
- ✅ Tags like \<br /> couldn't be parsed yet.
- \>, < should not be considered as a tag or end of tag while in between quotes or test.
- filter attributes to get ones without in relation to VUE to directly set in the target node.
