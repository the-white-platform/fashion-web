# Contributing to Fashion Web

Thank you for your interest in contributing to this project! This guide will help you understand our development workflow and conventions.

## Table of Contents

- [Development Setup](#development-setup)
- [Code Quality Tools](#code-quality-tools)
- [Commit Convention](#commit-convention)
- [Making Changes](#making-changes)
- [Versioning and Releases](#versioning-and-releases)
- [CI/CD Pipeline](#cicd-pipeline)

## Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fashion-web
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Code Quality Tools

This project uses several tools to maintain code quality:

### Prettier

Automatically formats code to maintain consistent style.

- **Auto-format all files:**

  ```bash
  npm run format
  ```

- **Check formatting without making changes:**
  ```bash
  npm run format:check
  ```

### ESLint

Lints JavaScript/TypeScript code for potential errors and style issues.

- **Run linter:**

  ```bash
  npm run lint
  ```

- **Auto-fix linting issues:**
  ```bash
  npm run lint:fix
  ```

### Lint-staged

Automatically runs Prettier and ESLint on staged files before commit. This is configured via Husky pre-commit hooks.

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) to maintain a clear and structured commit history.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system or external dependencies
- **ci**: CI/CD changes
- **chore**: Other changes that don't modify src or test files
- **revert**: Revert a previous commit

### Examples

```bash
feat(auth): add login functionality
fix(api): resolve null pointer exception in user service
docs(readme): update installation instructions
refactor(components): simplify header component logic
```

## Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes

Write your code following the project's coding standards.

### 3. Stage Your Changes

```bash
git add .
```

### 4. Commit Using Commitizen

Instead of `git commit`, use our interactive commit tool:

```bash
npm run commit
```

This will guide you through creating a properly formatted conventional commit message.

**OR** you can commit manually following the convention:

```bash
git commit -m "feat(component): add new feature"
```

### 5. Pre-commit Hooks

When you commit, Husky will automatically:

- Run `lint-staged` to format and lint your staged files
- Run `commitlint` to validate your commit message format

If any of these checks fail, the commit will be rejected. Fix the issues and try again.

### 6. Push Your Changes

```bash
git push origin feat/your-feature-name
```

### 7. Create a Pull Request

Open a pull request on GitHub targeting the `main` branch.

## Versioning and Releases

This project follows [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR** version: Breaking changes
- **MINOR** version: New features (backward compatible)
- **PATCH** version: Bug fixes (backward compatible)

### Manual Release (Maintainers Only)

If you need to manually create a release:

```bash
# Automatic version bump based on commits
npm run release

# Or specify the version type
npm run release:patch   # 1.0.0 -> 1.0.1
npm run release:minor   # 1.0.0 -> 1.1.0
npm run release:major   # 1.0.0 -> 2.0.0

# First release
npm run release:first
```

This will:

1. Analyze commits since the last release
2. Determine the version bump based on commit types
3. Update `package.json` version
4. Generate/update `CHANGELOG.md`
5. Create a git tag
6. Commit the changes

Then push the changes and tags:

```bash
git push --follow-tags origin main
```

### Automatic Release (CI/CD)

When code is merged to the `main` branch, our GitHub Actions workflow automatically:

1. ✅ Runs `standard-version` to bump the version
2. ✅ Updates `CHANGELOG.md`
3. ✅ Creates a git tag (e.g., `v1.2.3`)
4. ✅ Pushes the tag to GitHub
5. ✅ Creates a GitHub Release with changelog notes

**You don't need to manually create releases!** Just merge to `main` and the pipeline handles it.

## CI/CD Pipeline

### Release Workflow

**Trigger:** Push to `main` branch

**Steps:**

1. Checkout code
2. Install dependencies
3. Run `standard-version` to bump version
4. Check if version changed
5. If changed:
   - Push version bump commit and tag
   - Create GitHub Release with changelog

### How Version is Determined

The version bump is automatically calculated based on your commit messages:

- Commits with `feat:` → **MINOR** version bump
- Commits with `fix:` → **PATCH** version bump
- Commits with `BREAKING CHANGE:` in body → **MAJOR** version bump
- Other commits (docs, chore, etc.) → No version bump

### Example Workflow

```bash
# Developer makes changes
git checkout -b feat/new-login

# Make changes...
git add .
npm run commit
# Select "feat", add description "add OAuth login"

git push origin feat/new-login

# Create PR and merge to main

# 🤖 GitHub Actions automatically:
# - Bumps version from 1.0.0 to 1.1.0
# - Updates CHANGELOG.md
# - Creates tag v1.1.0
# - Creates GitHub Release
```

## Best Practices

1. **Write clear commit messages** - Future you will thank you
2. **Keep commits atomic** - One logical change per commit
3. **Test before committing** - Run `npm run dev` and test your changes
4. **Format your code** - Run `npm run format` before committing (or let pre-commit hook do it)
5. **Follow the PR template** - Provide context and testing instructions
6. **Keep PRs focused** - Smaller PRs are easier to review

## Getting Help

- Check existing issues and PRs
- Read the [README.md](./README.md)
- Ask questions in pull request comments
- Contact the maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).
