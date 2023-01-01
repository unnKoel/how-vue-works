import { get } from 'lodash';

// handle mustache symbols to interpolate the value into text.
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

export {
  MustacheDirective,
}
