module.exports = function (handlers) {
  return [
    {
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: './.tmp/public',
                redirectToSlash: true,
                index: true
            }
        },
        config: { auth: false }
    }
  ];
};