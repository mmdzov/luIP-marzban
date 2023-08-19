/**
 *
 * @param {ApiResponseType} params
 */

const response = (params) => {
  if (!params?.data) params.data = null;
  if (!params?.error) params.error = null;
  if (!params?.status) params.status = 0;

  return params;
};

module.exports = { response };
