module.exports = {
  "extends": "airbnb",
  "rules": {
    "linebreak-style": ["error", process.env.NODE_ENV === 'prod' ? "unix" : "windows"],
    "import/no-unresolved": [0, {commonjs: true, amd: true}]
  }
}