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
const VIfDirective = (
  unsubsriptionEvents,
  node,
  attributes = {},
  data,
  methods
) => {
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
      unsubsriptionEvents,
      data,
      methods
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
const VForDirective = (
  unsubsriptionEvents,
  node,
  attributes = {},
  data,
  label,
  methods
) => {
  let arrayKey = '';
  let itemName = '';
  let vForTemplate = '';
  let parentNode = null;
  let nextSibling = null;
  let trackBy = '';
  const vForTemplateParsedArtifactMemory = [];

  const isVFor = () => {
    return !!attributes['v-for'];
  };

  if (isVFor()) {
    const expression = attributes['v-for'];
    [itemName, arrayKey] = expression.split('in');

    arrayKey = arrayKey.trim();
    itemName = itemName.trim();
    trackBy = attributes['track-by'];
  }

  const _prependItemName = (item) => {
    if (Object.prototype.toString.call(item) === '[object Object]') {
      return { [itemName]: item };
    }
    return item;
  };

  const parseChildTemplate = (childTemplate) => {
    vForTemplate = childTemplate;
    const { index } = _parseChildTemplate(childTemplate, [], label, {});

    return { vForTemplateEndIndex: index, vForPlaceholderRef: node };
  };

  const _parseChildTemplate = (
    childTemplate,
    unsubsriptionEvents,
    label,
    arrayItem
  ) => {
    const vForTemplateParseStack = Stack();
    const vForTemplateDirectiveQueue = Queue();

    vForTemplateParseStack.push({ element: node.cloneNode(), label });
    const { rootRef, index } = parse(
      childTemplate,
      vForTemplateParseStack,
      vForTemplateDirectiveQueue,
      unsubsriptionEvents,
      arrayItem,
      methods
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

  const _findVForTemplateParsedArtifactInMemory = (index, trackByValue) => {
    let vForTemplateParsedArtifact = null;
    const { trackByValue: prevTrackByValue } =
      vForTemplateParsedArtifactMemory[index] ?? {};

    if (prevTrackByValue === trackByValue) {
      vForTemplateParsedArtifact = vForTemplateParsedArtifactMemory[index];
    } else {
      vForTemplateParsedArtifact =
        vForTemplateParsedArtifactMemory.find(
          ({ trackByValue: prevTrackByValue }) =>
            prevTrackByValue === trackByValue
        ) ?? null;
    }

    if (vForTemplateParsedArtifact) {
      vForTemplateParsedArtifact.alive = true;
    }

    return vForTemplateParsedArtifact;
  };

  const _clear = () => {
    let length = vForTemplateParsedArtifactMemory.length;
    for (let i = length - 1; i >= 0; i--) {
      const { vForTemplateRef, alive } = vForTemplateParsedArtifactMemory[i];
      if (!alive) {
        vForTemplateRef.parentNode.removeChild(vForTemplateRef);
        vForTemplateParsedArtifactMemory.splice(i, 1);
      } else {
        vForTemplateParsedArtifactMemory[i].alive = false;
      }
    }
  };

  const handle = (data) => {
    const array = data[arrayKey];
    _substitutePlaceholderNode(node);

    for (let i = 0; i < array.length; i++) {
      let item = array[i];
      let vForTemplateParsedArtifact = null;
      const trackByValue = item[trackBy] ?? '';

      if (trackBy && trackByValue) {
        vForTemplateParsedArtifact = _findVForTemplateParsedArtifactInMemory(
          i,
          trackByValue
        );
      }

      item = _prependItemName(item);
      if (!vForTemplateParsedArtifact) {
        vForTemplateParsedArtifact = _parseChildTemplate(
          vForTemplate,
          unsubsriptionEvents,
          label,
          item
        );
      }

      const { vForTemplateRef, vForTemplateDirectiveQueue, alive } =
        vForTemplateParsedArtifact;
      _insertVForTemplateRef(vForTemplateRef);
      vForTemplateDirectiveQueue
        .getItems()
        .forEach((directive) => directive.handle(item));
      // for one without alive, meaning that it's newly created, so needed to push into memory cache.
      if (!alive) {
        vForTemplateParsedArtifactMemory.push({
          vForTemplateRef,
          vForTemplateDirectiveQueue,
          trackByValue,
          alive: true,
        });
      }
    }
    _clear();
  };

  (function reatToDataChange() {
    const array = data[arrayKey];
    array?.watch(() => {
      handle(data);
    });
  })();

  return {
    vForTemplateParsedArtifactMemory,
    isVFor,
    parseChildTemplate,
    handle,
  };
};

/**
 * This verison just implement with providing a method name to bind.
 *
 * @todo
 * - use inline js statement instead of binding directly to a method name.
 * - involve event midifiers.
 */
const vOnDirective = (node, attributes = {}, methods = {}) => {
  const vonEvents = Object.entries(attributes).reduce(
    (acc, [attributeName, methodStatement]) => {
      const attributeNameMatch = attributeName.match(/^v-on\s*:\s*(\w+)/);
      if (attributeNameMatch !== null) {
        const eventType = attributeNameMatch[1]?.trim();
        acc.push({ eventType, methodStatement });
      }

      return acc;
    },
    []
  );

  const isVon = () => {
    return vonEvents.length !== 0;
  };

  if (isVon()) {
    return vonEvents.map(({ eventType, methodStatement }) => {
      const listener = methods[methodStatement];
      if (typeof listener === 'function') {
        node.addEventListener(eventType, listener);
        return () => node.removeEventListener(eventType, listener);
      }

      return () => {};
    });
  }

  return [];
};

export {
  MustacheDirective,
  VBindDirective,
  VIfDirective,
  VForDirective,
  vOnDirective,
};
