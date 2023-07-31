const _ = require('lodash');

/**
 * @typedef {import('@opensearch-project/opensearch').Client} Client
 *
 */

/**
 * @description Check whether should be reindexed
 * @param {Client} client
 * @param {string} index
 * @returns {boolean}
 */
const normalizerValidator = async (client, index) => {
  const res = await client.indices.getSettings({ index });

  const hasNormalizer = _.has(
    res.body[index],
    'settings.index.analysis.normalizer.case_insensitive',
  );

  return !hasNormalizer;
};

module.exports = function (...args) {
  // change validator here
  return normalizerValidator(...args);
};
