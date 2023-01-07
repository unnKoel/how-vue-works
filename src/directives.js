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

    if (value) {
      node.parentNode.appendChild(vIfTemplateRef);
      while (!vIfTemplateDirectiveQueue.isEmpty()) {
        const directive = vIfTemplateDirectiveQueue.dequeue();
        directive.handle(data);
      }
    } else {
      node.parentNode.removeChild(node);
    }
  }

  return {
    isVIf,
    handle,
    parseChildTemplate,
  }
}

/** 
const VForDirective = (node, attributes = {}) => {
  let vForTemplateRef = null;
  let vForTemplateDirectiveQueue = null;

  const isVFor = () => {
    return attributes['v-for']
  }

  const handle = (data) => {

  }

  return {
    isVFor,

  }
}
*/

export {
  MustacheDirective,
  VBindDirective,
  VIfDirective,
}
