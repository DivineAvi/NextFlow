# `@nextflow/ui`

This package contains **shared UI components** for the [NextFlow](../apps/web) monorepo. It is intended to be consumed by the web frontend and any other apps that need a common set of reusable React components.

## Features

- **Reusable React components** for styling and layout consistency
- Ready to integrate with TailwindCSS and Geist font variables
- Easily importable from other monorepo projects

## Usage

1. **Install the package** to your workspace (most likely already present in your monorepo):

   ```
   pnpm install @nextflow/ui
   ```

2. **Import components** in your application code:

   ```tsx
   import { Button, Card } from '@nextflow/ui';
   ```

3. **Customize with TailwindCSS** by leveraging shared design tokens, fonts, and theme variables.

## Development

- All components should be implemented in TypeScript and be framework-agnostic when possible.
- Follow the project’s best practices for component structure and API design.
- Remember to export new components from the package’s `index.ts`.
