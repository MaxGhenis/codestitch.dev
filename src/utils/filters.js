export function shouldIncludeFile(path, filePatterns, keepMatchingFiles) {
  if (!filePatterns?.length) return true;
  const matches = filePatterns.some((pattern) => {
    const re = new RegExp(pattern);
    return re.test(path);
  });
  return keepMatchingFiles ? matches : !matches;
}

export function shouldIncludeLine(line, linePatterns, keepMatchingLines) {
  if (!linePatterns?.length) return true;
  const matches = linePatterns.some((pattern) => {
    const re = new RegExp(pattern);
    return re.test(line);
  });
  return keepMatchingLines ? matches : !matches;
}