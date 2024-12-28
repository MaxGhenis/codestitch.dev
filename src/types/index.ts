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
