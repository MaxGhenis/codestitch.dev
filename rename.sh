#!/bin/bash

# Create necessary directories
echo "Creating directories..."
mkdir -p src/types
mkdir -p src/context
mkdir -p src/components/ui

# Create tsconfig.json in root
echo "Creating tsconfig.json..."
cat >tsconfig.json <<'EOL'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src"]
}
EOL

# Create types/index.ts
echo "Creating type definitions..."
cat >src/types/index.ts <<'EOL'
export interface AppState {
  githubInputs: string;
  filePatterns: string;
  fileFilterMode: string;
  linePatterns: string;
  lineFilterMode: string;
  stitchedContent: string;
  loading: boolean;
  error: string | null;
}

export type AppAction =
  | { type: 'SET_GITHUB_INPUTS'; payload: string }
  | { type: 'SET_FILE_PATTERNS'; payload: string }
  | { type: 'SET_FILE_FILTER_MODE'; payload: string }
  | { type: 'SET_LINE_PATTERNS'; payload: string }
  | { type: 'SET_LINE_FILTER_MODE'; payload: string }
  | { type: 'SET_STITCHED_CONTENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

export interface ComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export interface FilterModeProps extends ComponentProps {
  label: string;
  helpText: string;
  options: string[];
}

export interface OutputAreaProps {
  stitchedContent: string;
  errorOccurred: boolean;
  onCopy: () => void;
  onDownload: () => void;
}

export interface GitHubContentOptions {
  inputs: string[];
  filePatterns: string[];
  keepMatchingFiles: boolean;
  linePatterns: string[];
  keepMatchingLines: boolean;
}

export interface ProcessingResult {
  allContent: string;
  hadErrors: boolean;
}
EOL

# Create components/ui/alert.tsx
echo "Creating alert component..."
cat >src/components/ui/alert.tsx <<'EOL'
import React from 'react';

interface AlertProps {
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'default', children }) => {
  const baseStyles = "p-4 rounded-md mb-4";
  const variantStyles = variant === 'destructive' ? "bg-red-100 text-red-900" : "bg-gray-100 text-gray-900";
  
  return (
    <div className={`${baseStyles} ${variantStyles}`}>
      {children}
    </div>
  );
};

export const AlertTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h5 className="font-medium mb-2">{children}</h5>
);
EOL

# Rename all JS files to TSX
echo "Converting JS files to TSX..."
find src -name "*.js" | while read -r file; do
    # Skip if it's already been converted
    if [ -f "${file%.*}.tsx" ]; then
        echo "Skipping ${file}, TSX version exists"
        continue
    fi

    # Rename file to .tsx
    mv "$file" "${file%.*}.tsx"
    echo "Converted $file to ${file%.*}.tsx"
done

echo "TypeScript setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm install --save-dev typescript @types/react @types/node @types/react-dom"
echo "2. Run: npm install @mui/material @emotion/react @emotion/styled"
echo "3. Copy the updated component code provided separately"
echo ""
echo "After making all changes:"
echo "4. Run: npm run type-check"
