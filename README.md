# @rollercoaster-dev/rd-logger

A neurodivergent-friendly logger for Rollercoaster.dev projects.

[![CI](https://github.com/rollercoaster-dev/neuro-friendly-logger/actions/workflows/ci.yml/badge.svg)](https://github.com/rollercoaster-dev/neuro-friendly-logger/actions/workflows/ci.yml)

## Installation

```bash
npm install @rollercoaster-dev/rd-logger
# or
yarn add @rollercoaster-dev/rd-logger
# or
pnpm add @rollercoaster-dev/rd-logger
```

## Usage

*(Documentation coming soon)*

## Features

*(Detailed features coming soon)*

*   Neuro-friendly formatting (colors, icons, spacing)
*   Multiple log levels
*   Human-readable timestamps
*   Structured context
*   Request context propagation (optional)
*   Framework adapters (Elysia, Hono, Express, Generic)
*   Customizable
*   Accessible

## Contributing

*(Contribution guidelines coming soon)*

### Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the package
pnpm build
```

### CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **CI Workflow**: Runs on every push to main and pull requests to ensure code quality
- **PR Checks**: Additional checks that run on pull requests
- **Publish Workflow**: Automatically publishes the package to npm when a new release is created

### Versioning and Releases

This project follows [Semantic Versioning](https://semver.org/) and uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

#### Creating a Release

To create a new release, you can use one of the following commands:

```bash
# Create a patch release (0.0.x)
pnpm release:patch

# Create a minor release (0.x.0)
pnpm release:minor

# Create a major release (x.0.0)
pnpm release:major

# Create a prerelease (alpha)
pnpm release:alpha

# Create a prerelease (beta)
pnpm release:beta
```

Alternatively, you can use the GitHub Actions workflow "Create Release" to create a new release directly from GitHub.

## License

MIT
