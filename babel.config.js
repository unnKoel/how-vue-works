// eslint-disable-next-line no-undef
module.exports = {
  presets: [['@babel/preset-env', { corejs: { version: '3.26.1', proposals: true }, useBuiltIns: 'usage', targets: { node: 'current' } }]],
};
