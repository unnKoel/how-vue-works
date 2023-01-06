import { get } from 'lodash';

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
 * @todo the value of `v-if` should be parsed as an expression.
 */
const VIfDirective = (node, attributes = {}) => {
  let vIfTemplateRef = null;
  let vIfTemplateDirectiveQueue = null;

  const vIfExpression = attributes['v-if'];

  const isVIf = () => {
    return !!vIfExpression;
  }

  const setVIfTemplateRef = (agVIfTemplateRef) => {
    vIfTemplateRef = agVIfTemplateRef;
  }

  const setVIfTemplateDirectiveQueue = (agVIfTemplateDirectiveQueue) => {
    vIfTemplateDirectiveQueue = agVIfTemplateDirectiveQueue;
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
    setVIfTemplateRef,
    setVIfTemplateDirectiveQueue,
    handle,
  }
}

export {
  MustacheDirective,
  VBindDirective,
  VIfDirective,
}
