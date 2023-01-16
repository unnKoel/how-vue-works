import { get } from 'lodash';
import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';

// Identify mustache braces to interpolate the value into text.
const MustacheDirective = (textNode, text = '', data) => {
  let paths = [];
  const isMustache = () => /{{\s*\w+(?:\.\w+)*\s*}}/.test(text);

  if (isMustache()) {
    paths = text.match(/{{\s*\w+(?:\.\w+)*\s*}}/g)?.map(function (x) {
      return x.match(/[\w\\.]+/)[0];
    });
  }

  const handle = (data) => {
    let interpolatedText = text;

    paths?.forEach((path) => {
      const value = get(data, path);
      interpolatedText = interpolatedText.replace(
        new RegExp(`{{\\s*${path}\\s*}}`),
        value
      );
    });

    textNode.nodeValue = interpolatedText;
  };

  (function reatToDataChange() {
    paths?.forEach((path) => {
      const value = get(data, path);
      value?.watch(() => {
        handle(data);
      });
    });
  })();

  return {
    isMustache,
    handle,
  };
};

const VBindDirective = (node, attributes = {}, data) => {
  const vBindAttributes = Object.entries(attributes).reduce(
    (acc, [attributeName, path]) => {
      const attributeNameMatch = attributeName.match(/^v-bind\s*:\s*(\w+)/);
      if (attributeNameMatch !== null) {
        const attributeKey = attributeNameMatch[1]?.trim();
        acc.push({ attributeKey, path });
      }

      return acc;
    },
    []
  );

  const isVBind = () => {
    return vBindAttributes.length !== 0;
  };

  const handle = (data) => {
    vBindAttributes.forEach(({ attributeKey, path }) => {
      node.setAttribute(attributeKey, get(data, path));
    });
  };

  (function reatToDataChange() {
    vBindAttributes?.forEach(({ path }) => {
      const value = get(data, path);
      value?.watch(() => {
        handle(data);
      });
    });
  })();

  return {
    vBindAttributes,
    isVBind,
    handle,
  };
};

/**
 * @todo the value of `v-if` should be evaluated as an expression.
 */
const VIfDirective = (node, attributes = {}, data) => {
  let vIfTemplateRef = null;
  let nextSibling = null;
  let parentNode = null;
  const vIfTemplateDirectiveQueue = Queue();

  const vIfExpression = attributes['v-if'];

  const isVIf = () => {
    return !!vIfExpression;
  };

  const parseChildTemplate = (childTemplate, label) => {
    const vIfTemplateParseStack = Stack();
    vIfTemplateParseStack.push({ element: node, label });
    const { rootRef, index } = parse(
      childTemplate,
      vIfTemplateParseStack,
      vIfTemplateDirectiveQueue,
      data
    );
    vIfTemplateRef = rootRef;

    return { vIfTemplateEndIndex: index, vIfTemplateRef };
  };

  const _insertVIfTemplateRef = (vIfTemplateRef) => {
    // if the root node of v-if template hasn't been insert into dom. then insert it.
    // otherwise, do nothing.
    if (!vIfTemplateRef.parentNode) {
      if (!nextSibling) {
        return parentNode.appendChild(vIfTemplateRef);
      }

      nextSibling.insertAdjacentElement('beforebegin', vIfTemplateRef);
    }
  };

  const handle = (data) => {
    const value = data[vIfExpression];

    if (value) {
      _insertVIfTemplateRef(vIfTemplateRef);
      vIfTemplateDirectiveQueue
        .getItems()
        .forEach((directive) => directive.handle(data));
    } else {
      nextSibling = vIfTemplateRef.nextSibling;
      parentNode = vIfTemplateRef.parentNode;
      vIfTemplateRef?.parentNode?.removeChild(vIfTemplateRef);
    }
  };

  (function reatToDataChange() {
    const value = data[vIfExpression];
    value?.watch(() => {
      handle(data);
    });
  })();

  return {
    isVIf,
    handle,
    parseChildTemplate,
  };
};

/**
 * @todo the items looped over in `v-for` can be deconstructed
 * as a form like (item, index).
 */
const VForDirective = (node, attributes = {}, data, label) => {
  let arrayKey = '';
  let itemName = '';
  const vForTemplateArray = [];
  let vForTemplate = '';
  let parentNode = null;
  let nextSibling = null;

  const isVFor = () => {
    return !!attributes['v-for'];
  };

  if (isVFor()) {
    const expression = attributes['v-for'];
    [itemName, arrayKey] = expression.split('in');

    arrayKey = arrayKey.trim();
    itemName = itemName.trim();
  }

  const _prependItemName = (item) => {
    if (Object.prototype.toString.call(item) === '[object Object]') {
      return { [itemName]: item };
    }
    return item;
  };

  const parseChildTemplate = (childTemplate) => {
    vForTemplate = childTemplate;
    const { index } = _parseChildTemplate(childTemplate, label, {});

    return { vForTemplateEndIndex: index, vForPlaceholderRef: node };
  };

  const _parseChildTemplate = (childTemplate, label, arrayItem) => {
    const vForTemplateParseStack = Stack();
    const vForTemplateDirectiveQueue = Queue();

    vForTemplateParseStack.push({ element: node.cloneNode(), label });
    const { rootRef, index } = parse(
      childTemplate,
      vForTemplateParseStack,
      vForTemplateDirectiveQueue,
      arrayItem
    );

    return { vForTemplateRef: rootRef, vForTemplateDirectiveQueue, index };
  };

  const _substitutePlaceholderNode = (node) => {
    if (!nextSibling && !parentNode) {
      nextSibling = node.nextSibling;
      parentNode = node.parentNode;
      node.parentNode.removeChild(node);
    }
  };

  const _insertVForTemplateRef = (vForTemplateRef) => {
    if (!vForTemplateRef.parentNode) {
      if (!nextSibling) {
        return parentNode.appendChild(vForTemplateRef);
      }

      nextSibling.insertAdjacentElement('beforebegin', vForTemplateRef);
    }
  };

  const handle = (data) => {
    const array = data[arrayKey];
    _substitutePlaceholderNode(node);

    for (let i = 0; i < array.length; i++) {
      let item = array[i];
      item = _prependItemName(item);
      const { vForTemplateRef, vForTemplateDirectiveQueue } =
        _parseChildTemplate(vForTemplate, label, item);

      _insertVForTemplateRef(vForTemplateRef);
      vForTemplateDirectiveQueue
        .getItems()
        .forEach((directive) => directive.handle(item));
      vForTemplateArray.push({ vForTemplateRef, vForTemplateDirectiveQueue });
    }
  };

  (function reatToDataChange() {
    const array = data[arrayKey];
    array?.watch(() => {
      handle(data);
    });
  })();

  return {
    isVFor,
    parseChildTemplate,
    handle,
  };
};

export { MustacheDirective, VBindDirective, VIfDirective, VForDirective };
