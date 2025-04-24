# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 0.1.0 (2025-04-24)


### Features

* add project docs and remove Elysia adapter ([d44f4d4](https://github.com/rollercoaster-dev/rd-logger/commit/d44f4d419966417e8fe6ab1c99f738d8499def1a))


### Bug Fixes

* correct order of steps in GitHub Actions workflows to install pnpm before using it ([0b1332d](https://github.com/rollercoaster-dev/rd-logger/commit/0b1332d5f71458aa74ab54000988250b969c8e89))

## [0.1.0] - 2025-04-24

### Added
- Initial project setup with TypeScript, ESM support, and Jest testing
- Core logger implementation with multiple log levels
  - Support for debug, info, warn, error, and fatal log levels
  - Human-readable timestamps
  - Colorized output with icons for better readability
  - Structured context support
- Framework adapters for web applications
  - Hono adapter for Hono framework integration
  - Express adapter for Express.js applications
  - Generic adapter for non-web applications
- Query logger for database query performance tracking
- Comprehensive documentation in README.md
- GitHub Actions workflows for CI/CD
  - Continuous integration with Node.js 18.x and 20.x
  - Pull request checks with test coverage
  - Automated release and publishing process
- Unit and integration tests with Jest
- Conventional commits and semantic versioning setup
