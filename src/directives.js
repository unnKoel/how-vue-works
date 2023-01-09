import { get } from 'lodash';
import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';

// Identify mustache braces to interpolate the value into text.
const MustacheDirective = (textNode, text = '') => {
  let paths = text.match(/{{\s*\w+(?:\.\w+)*\s*}}/g)?.map(function (x) { return x.match(/[\w\\.]+/)[0]; });

  const isMustache = () => /{{\s*\w+(?:\.\w+)*\s*}}/.test(text);

  const handle = (data) => {
    let interpolatedText = text;

    paths.forEach(path => {
      const value = get(data, path);
      interpolatedText = interpolatedText.replace(new RegExp(`{{\\s*${path}\\s*}}`), value);
    });

    textNode.nodeValue = interpolatedText;
  }

  return {
    isMustache,
    handle,
  }
}

const VBindDirective = (node, attributes = {}) => {
  const vBindAttributes = Object.entries(attributes).reduce((acc, [attributeName, path]) => {
    const attributeNameMatch = attributeName.match(/^v-bind\s*:\s*(\w+)/);
    if (attributeNameMatch !== null) {
      const attributeKey = attributeNameMatch[1]?.trim();
      acc.push({ attributeKey, path });
    }

    return acc;
  }, []);

  const isVBind = () => {
    return vBindAttributes.length !== 0;
  }

  const handle = (data) => {
    vBindAttributes.forEach(({ attributeKey, path }) => {
      node.setAttribute(attributeKey, get(data, path));
    });
  }

  return {
    vBindAttributes,
    isVBind,
    handle,
  }
}

/**
 * @todo the value of `v-if` should be evaluated as an expression.
 */
const VIfDirective = (node, attributes = {}) => {
  let parentNode = null;
  let vIfTemplateRef = null;
  const vIfTemplateDirectiveQueue = Queue();

  const vIfExpression = attributes['v-if'];

  const isVIf = () => {
    return !!vIfExpression;
  }

  const parseChildTemplate = (childTemplate, label) => {
    const vIfTemplateParseStack = Stack();

    vIfTemplateParseStack.push({ element: node, label });
    const { rootRef, index } = parse(childTemplate, vIfTemplateParseStack, vIfTemplateDirectiveQueue);
    vIfTemplateRef = rootRef;

    return index;
  }

  const handle = (data) => {
    const value = data[vIfExpression];
    parentNode = node.parentNode;
  
    if (value) {
      parentNode.appendChild(vIfTemplateRef);
      vIfTemplateDirectiveQueue.getItems().forEach(directive => directive.handle(data));
    } else {
      parentNode.removeChild(node);
    }
  }

  return {
    isVIf,
    handle,
    parseChildTemplate,
  }
}

const VForDirective = (node, attributes = {}) => {
  let arrayKey = '';
  const vForTemplateDirectiveQueueArray = [];

  const isVFor = () => {
    return attributes['v-for']
  }

  if (isVFor()) {
    const expression = attributes['v-for'];
    [, arrayKey] = expression.split('in');

    arrayKey = arrayKey.trim();
  }

  const parseChildTemplate = (childTemplate, label, data) => {
    const array = data[arrayKey];
    let vForTemplateEndIndex = 0;

    for (let i = 0; i < array.length; i++) {
      const vForTemplateParseStack = Stack();
      const vForTemplateDirectiveQueue = Queue();

      vForTemplateParseStack.push({ element: node, label });
      const { rootRef, index } = parse(childTemplate, vForTemplateParseStack, vForTemplateDirectiveQueue);

      node.appendChild(rootRef);
      vForTemplateEndIndex = index;
      vForTemplateDirectiveQueueArray.push(vForTemplateDirectiveQueue);
    }

    return vForTemplateEndIndex;
  }

  const handle = (data) => {
    const array = data[arrayKey];

    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      const vForTemplateDirective = vForTemplateDirectiveQueueArray[i];
      vForTemplateDirective.forEach(directive => directive.handle(item));
    }
  }

  return {
    isVFor,
    parseChildTemplate,
    handle,
  }
}

export {
  MustacheDirective,
  VBindDirective,
  VIfDirective,
  VForDirective,
}
