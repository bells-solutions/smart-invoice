module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.dto.ts",
    "!src/**/*.entity.ts",
    "!src/main.ts",
  ],
  coverageDirectory: "coverage",
  moduleFileExtensions: ["ts", "js", "json"],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
};
