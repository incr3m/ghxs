const $$ = (...args) => {
  // eslint-disable-next-line no-useless-call
  const r = $.call(null, ...args);
  r.stdin;
  return r;
};

module.exports = { $$ };
