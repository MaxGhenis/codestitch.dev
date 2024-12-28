// Filter logic that is akin to what you used in Python

export function shouldIncludeFile(path, filePatterns, keepMatchingFiles) {
    if (!filePatterns?.length) return true; // No patterns means keep all files
    // If any pattern matches, then `matches === true`
    const matches = filePatterns.some((pattern) => {
      const re = new RegExp(pattern);
      return re.test(path);
    });
  
    return keepMatchingFiles ? matches : !matches;
  }
  
  export function shouldIncludeLine(line, linePatterns, keepMatchingLines) {
    if (!linePatterns?.length) return true; // No patterns means keep all lines
    // If any pattern matches, then `matches === true`
    const matches = linePatterns.some((pattern) => {
      const re = new RegExp(pattern);
      return re.test(line);
    });
  
    return matches === keepMatchingLines;
  }