module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es6: true,
  },
  globals: {
    window: true,
    document: true,
    localStorage: true,
    sessionStorage: true,
    defineOptions: true,
    defineProps: true,
    defineEmits: true,
    defineExpose: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/prettier',
    './.eslintrc-import.json'
  ],
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  // "off" or 0 - 关闭规则
  // "warn" or 1 - 将规则视为一个警告
  // "error" or 2 - 将规则视为一个错误
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'no-use-before-define': 'off',
    'no-unused-vars': [
      'warn',
      {
        vars: 'local',// 不允许本地变量未使用，全局变量可以
        args: 'none',// 不检查函数参数
      },
    ],
    'vue/no-unused-vars': 'warn',
    'no-prototype-builtins': 'off',
    'no-irregular-whitespace': 'off',
    'space-before-function-paren': 'off',
    'vue/custom-event-name-casing': 'off',
    'vue/attributes-order': 'off',
    'vue/one-component-per-file': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/require-default-prop': 'off',
    'vue/no-unused-components': 'warn',
    'vue/no-setup-props-destructure': 'off',
    'vue/script-setup-uses-vars': 'off',
  },
}
