# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
