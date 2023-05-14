import { get } from 'lodash';
import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';
import { extendComponent } from './components';
import { destoryComponent, activateComponent } from './lifecycle';

const getValueByPath = (data, path) => {
  if (typeof data === 'object') {
    return get(data, path);
  }

  return data;
};

// Identify mustache braces to interpolate the value into text.
const MustacheDirective = (textNode, text = '', data, curComponentNodeRef) => {
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
      const value = getValueByPath(data, path) ?? getValueByPath(curComponentNodeRef, path);
      interpolatedText = interpolatedText.replace(new RegExp(`{{\\s*${path}\\s*}}`), value);
    });

    textNode.nodeValue = interpolatedText;
  };

  (function reatToDataChange() {
    paths?.forEach((path) => {
      if (typeof data === 'object') {
        const value = get(data, path);
        value?.watch(() => {
          handle(data);
        });
      }
    });
  })();

  return {
    isMustache,
    handle,
  };
};

const VBindDirective = (node, attributes = {}, data, curComponentNodeRef) => {
  const vBindAttributes = VBindDirective.getVBindAttributes(attributes);

  const isVBind = () => {
    return vBindAttributes.length !== 0;
  };

  const handle = (data) => {
    vBindAttributes.forEach(({ attributeKey, path }) => {
      node.setAttribute(
        attributeKey,
        getValueByPath(data, path) ?? getValueByPath(curComponentNodeRef, path)
      );
    });
  };

  (function reatToDataChange() {
    vBindAttributes?.forEach(({ path }) => {
      if (typeof data === 'object') {
        const value = get(data, path);
        value?.watch(() => {
          handle(data);
        });
      }
    });
  })();

  return {
    vBindAttributes,
    isVBind,
    handle,
  };
};

VBindDirective.getVBindAttributes = (attributes) =>
  Object.entries(attributes).reduce((acc, [attributeName, path]) => {
    const attributeNameMatch = attributeName.match(/^v-bind\s*:\s*([\w\\-]+)/);
    if (attributeNameMatch !== null) {
      const attributeKey = attributeNameMatch[1]?.trim();
      acc.push({ attributeKey, path });
    }

    return acc;
  }, []);

/**
 * @todo the value of `v-if` should be evaluated as an expression.
 */
const VIfDirective = (node, attributes = {}, data, curComponentNodeRef, componentStack) => {
  let vIfTemplateRef = null;
  let nextSibling = null;
  let parentNode = null;
  const vIfTemplateDirectiveQueue = Queue();
  let rootComponentOfVIf = null;

  const vIfExpression = attributes['v-if'];

  const isVIf = () => {
    return !!vIfExpression;
  };

  const parseChildTemplate = (childTemplate, label) => {
    const vIfTemplateParseStack = Stack();

    // put an mimic component node on top of stack to collect all components within `v-if` template.
    rootComponentOfVIf = extendComponent(function VIf() {}, curComponentNodeRef);
    componentStack.push(rootComponentOfVIf);

    vIfTemplateParseStack.push({ element: node, label });
    const { rootRef, index } = parse(
      childTemplate,
      vIfTemplateParseStack,
      componentStack,
      vIfTemplateDirectiveQueue,
      data,
      rootComponentOfVIf
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
    const value =
      getValueByPath(data, vIfExpression) ?? getValueByPath(curComponentNodeRef, vIfExpression);

    if (value) {
      _insertVIfTemplateRef(vIfTemplateRef);
      vIfTemplateDirectiveQueue.getItems().forEach((directive) => directive.handle(data));
      activateComponent(rootComponentOfVIf);
    } else {
      destoryComponent(rootComponentOfVIf);
      nextSibling = vIfTemplateRef.nextSibling;
      parentNode = vIfTemplateRef.parentNode;
      vIfTemplateRef?.parentNode?.removeChild(vIfTemplateRef);
    }
  };

  (function reatToDataChange() {
    if (isVIf()) {
      const value = get(data, vIfExpression);
      value?.watch(() => {
        handle(data);
      });
    }
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
const VForDirective = (node, attributes = {}, data, label, curComponentNodeRef, componentStack) => {
  let arrayKey = '';
  let itemName = '';
  let vForTemplate = '';
  let parentNode = null;
  let nextSibling = null;
  let trackBy = '';
  let componentVFor = null;
  const vForTemplateParsedArtifactMemory = [];

  const isVFor = () => {
    return !!attributes['v-for'];
  };

  if (isVFor()) {
    componentVFor = extendComponent(function VFor() {}, curComponentNodeRef);
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

  const _getArray = (data) => {
    const array = getValueByPath(data, arrayKey) ?? getValueByPath(curComponentNodeRef, arrayKey);

    return array;
  };

  const parseChildTemplate = (childTemplate) => {
    vForTemplate = childTemplate;
    const array = _getArray(data);
    const firstItem = array?.[0];

    const { index, vForTemplateRef, vForTemplateDirectiveQueue, componentItemOfVFor } =
      _parseChildTemplate(childTemplate, label, firstItem);

    array.length > 0 &&
      vForTemplateParsedArtifactMemory.push({
        vForTemplateRef,
        vForTemplateDirectiveQueue,
        trackByValue: firstItem?.[trackBy] ?? '',
        componentItemOfVFor,
      });
    activateComponent(componentItemOfVFor);

    return { vForTemplateEndIndex: index, vForPlaceholderRef: node };
  };

  const _parseChildTemplate = (childTemplate, label, arrayItem) => {
    const vForTemplateParseStack = Stack();
    const vForTemplateDirectiveQueue = Queue();
    // put an mimic component node on top of stack to collect all components within `v-for` template.
    const componentItemOfVFor = extendComponent(function VForItem() {}, curComponentNodeRef);

    vForTemplateParseStack.push({ element: node.cloneNode(), label });
    componentStack.push([componentVFor, componentItemOfVFor]);
    const { rootRef, index } = parse(
      childTemplate,
      vForTemplateParseStack,
      componentStack,
      vForTemplateDirectiveQueue,
      arrayItem,
      componentItemOfVFor
    );

    return { vForTemplateRef: rootRef, vForTemplateDirectiveQueue, index, componentItemOfVFor };
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
    const { trackByValue: prevTrackByValue } = vForTemplateParsedArtifactMemory[index] ?? {};

    if (prevTrackByValue === trackByValue) {
      vForTemplateParsedArtifact = vForTemplateParsedArtifactMemory[index];
    } else {
      vForTemplateParsedArtifact =
        vForTemplateParsedArtifactMemory.find(
          ({ trackByValue: prevTrackByValue }) => prevTrackByValue === trackByValue
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
      const { vForTemplateRef, alive, componentItemOfVFor } = vForTemplateParsedArtifactMemory[i];
      if (!alive) {
        destoryComponent(componentItemOfVFor);
        vForTemplateRef.parentNode?.removeChild?.(vForTemplateRef);
        vForTemplateParsedArtifactMemory.splice(i, 1);
      } else {
        vForTemplateParsedArtifactMemory[i].alive = false;
      }
    }
  };

  const handle = (data) => {
    const array = _getArray(data);

    _substitutePlaceholderNode(node);

    for (let i = 0; i < array.length; i++) {
      let item = array[i];
      let vForTemplateParsedArtifact = null;
      const trackByValue = item[trackBy] ?? '';

      if (trackBy && trackByValue) {
        vForTemplateParsedArtifact = _findVForTemplateParsedArtifactInMemory(i, trackByValue);
      }

      item = _prependItemName(item);
      if (!vForTemplateParsedArtifact) {
        vForTemplateParsedArtifact = _parseChildTemplate(vForTemplate, label, item);
      }

      const { vForTemplateRef, vForTemplateDirectiveQueue, alive, componentItemOfVFor } =
        vForTemplateParsedArtifact;
      _insertVForTemplateRef(vForTemplateRef);
      vForTemplateDirectiveQueue.getItems().forEach((directive) => directive.handle(item));
      // for one without alive, meaning that it's newly created, so needed to push into memory cache.
      if (!alive) {
        vForTemplateParsedArtifactMemory.push({
          vForTemplateRef,
          vForTemplateDirectiveQueue,
          trackByValue,
          alive: true,
          componentItemOfVFor,
        });

        activateComponent(componentItemOfVFor);
      }
    }
    _clear();
  };

  (function reatToDataChange() {
    if (isVFor()) {
      const array = getValueByPath(data, arrayKey);
      array?.watch(() => {
        handle(data);
      });
    }
  })();

  return {
    vForTemplateParsedArtifactMemory,
    isVFor,
    parseChildTemplate,
    handle,
  };
};

/**
 * This version just implements a method name to bind.
 *
 * @todo
 * - Use inline js expression instead of binding directly to a method name.
 * - Involve event midifiers.
 */
const VOnDirective = (node, attributes = {}, isComponent = false, curComponentNodeRef) => {
  const vonEvents = Object.entries(attributes).reduce((acc, [attributeName, methodStatement]) => {
    const attributeNameMatch = attributeName.match(/^v-on\s*:\s*(\w+)/);
    if (attributeNameMatch !== null) {
      const eventType = attributeNameMatch[1]?.trim();
      acc.push({ eventType, methodStatement });
    }

    return acc;
  }, []);

  const isVon = () => {
    return vonEvents.length !== 0;
  };

  const handle = () => {
    if (!isComponent) {
      curComponentNodeRef._unsubsriptionEvents.push(
        ...vonEvents.map(({ eventType, methodStatement }) => {
          const listener = curComponentNodeRef?.methods?.[methodStatement];
          if (typeof listener === 'function') {
            node.addEventListener(eventType, listener);
            return () => node.removeEventListener(eventType, listener);
          }

          return () => {};
        })
      );
      return;
    }

    curComponentNodeRef._unsubsriptionEvents.push(
      ...vonEvents.map(({ eventType, methodStatement }) => {
        const listener = curComponentNodeRef?.events?.[methodStatement];
        if (typeof listener === 'function') {
          curComponentNodeRef.$on(eventType, listener);
          return () => curComponentNodeRef.$off(eventType, listener);
        }

        return () => {};
      })
    );
  };

  if (isVon()) {
    curComponentNodeRef._subscribeEvents.push(() => handle());
  }
};

export { MustacheDirective, VBindDirective, VIfDirective, VForDirective, VOnDirective };
