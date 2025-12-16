# Workflow Optimization Proposal

## Current Issues

1. **Too many workflows triggering on same events**
   - `ci-cd.yml` triggers on push to main, tags, and PRs
   - `create-release.yml` triggers on tags (redundant)
   - No path filters - runs on every push (even docs-only changes)

2. **Infrastructure workflows**
   - `release.yml` triggers on every push to main (no path filter)
   - `terraform-dev.yml` and `terraform-prod.yml` both trigger on push to main
   - `create-release.yml` triggers on tags (redundant with terraform-prod)

3. **Cost concerns**
   - Every push triggers multiple workflows
   - Documentation updates trigger full CI/CD
   - Release workflow creates tags, which trigger more workflows

## Proposed Optimizations

### 1. Add Path Filters (High Impact)

**fashion-web:**
- Only run CI/CD when code changes (exclude docs, README, etc.)
- Skip release workflow if only docs changed

**infrastructure:**
- Release workflow: only trigger on code/config changes
- Terraform workflows: already have path filters (good!)

### 2. Consolidate Redundant Workflows

**fashion-web:**
- Merge `create-release.yml` into `ci-cd.yml` (already handles tag pushes)
- Remove duplicate tag handling

**infrastructure:**
- Merge `create-release.yml` into `terraform-prod.yml` (both trigger on tags)
- Consolidate release and terraform workflows

### 3. Use Workflow Reusability

- Create reusable workflow for common steps (auth, setup, etc.)
- Reduce duplication across workflows

### 4. Smarter Conditional Execution

- Check file changes before running expensive jobs
- Skip jobs when no relevant changes detected

### 5. Optimize Job Dependencies

- Run independent jobs in parallel
- Remove unnecessary dependencies

## Implementation Plan

### Phase 1: Add Path Filters (Immediate Cost Savings)

**fashion-web/ci-cd.yml:**
```yaml
on:
  push:
    branches: [main]
    tags: ['v*']
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - '.github/**'
      - 'README.md'
  pull_request:
    branches: [main]
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - 'README.md'
```

**infrastructure/release.yml:**
```yaml
on:
  push:
    branches: [main]
    paths-ignore:
      - '**.md'
      - 'README.md'
      - 'CHANGELOG.md'
```

### Phase 2: Consolidate Workflows

- Merge `create-release.yml` functionality into main workflows
- Remove redundant workflows

### Phase 3: Optimize Job Execution

- Add file change detection
- Skip jobs when no relevant changes

## Expected Cost Reduction

- **Path filters**: ~40-60% reduction (skip docs-only changes)
- **Consolidation**: ~20-30% reduction (fewer workflow runs)
- **Smarter conditions**: ~10-20% reduction (skip unnecessary jobs)

**Total expected reduction: 50-70%**

## Recommendation

Start with **Phase 1 (Path Filters)** - immediate impact, low risk, easy to implement.

