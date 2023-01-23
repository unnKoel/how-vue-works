const HtmlSytaxError = class extends Error {
  constructor(...args) {
    super(...args);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HtmlSytaxError);
    }

    this.name = 'Html Sytax Error';
  }
};

export { HtmlSytaxError };
