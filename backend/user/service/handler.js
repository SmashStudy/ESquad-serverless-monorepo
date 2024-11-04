module.exports.test = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify('test'),
  };
};
