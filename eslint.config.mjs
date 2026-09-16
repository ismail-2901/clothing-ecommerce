import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig.map((item) => {
    if (item.plugins && item.plugins["react-hooks"]) {
      return {
        ...item,
        rules: {
          ...item.rules,
          "react-hooks/set-state-in-effect": "warn"
        }
      };
    }
    return item;
  }),
  {
    rules: {
      "react/no-unescaped-entities": "off"
    }
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**"
    ]
  }
];

export default config;
