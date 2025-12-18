module.exports = {
  extends: [
    'airbnb-base',
  ],
  env: {
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Disable no-underscore-dangle as this project uses underscore prefix
    // for private methods and properties, which is common in Node.js
    'no-underscore-dangle': 'off',
    // Disable class-methods-use-this as this project follows domain-driven design
    // where repository methods and helper methods may not need to reference 'this'
    'class-methods-use-this': 'off',
  },
};
