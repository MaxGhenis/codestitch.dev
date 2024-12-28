// src/types/github.ts

export interface GitHubOptions {
    headers?: Record<string, string>;
  }
  
  export interface ProcessOptions {
    repoName: string;
    filePatterns: string[];
    keepMatchingFiles: boolean;
    linePatterns: string[];
    keepMatchingLines: boolean;
  }
  
  export interface ProcessPathOptions extends ProcessOptions {
    branch: string;
    path: string;
  }
  
  export interface ProcessFileOptions {
    repoName: string;
    branch: string;
    path: string;
    linePatterns: string[];
    keepMatchingLines: boolean;
  }
  
  export interface ProcessContentOptions {
    repoName: string;
    branch: string;
    contentList: any[];
    filePatterns: string[];
    keepMatchingFiles: boolean;
    linePatterns: string[];
    keepMatchingLines: boolean;
  }
  
  export interface GitHubContentOptions {
    inputs: string[];
    filePatterns: string[];
    keepMatchingFiles: boolean;
    linePatterns: string[];
    keepMatchingLines: boolean;
  }
  
  export interface GitHubError extends Error {
    message: string;
  }