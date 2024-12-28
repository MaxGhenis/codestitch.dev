export function shouldIncludeFile(
  path: string,
  filePatterns: string[],
  keepMatchingFiles: boolean
): boolean {
  if (!filePatterns?.length) return true;
  const matches = filePatterns.some((pattern: string) => {
    const re = new RegExp(pattern);
    return re.test(path);
  });
  return keepMatchingFiles ? matches : !matches;
}

export function shouldIncludeLine(
  line: string,
  linePatterns: string[],
  keepMatchingLines: boolean
): boolean {
  if (!linePatterns?.length) return true;
  const matches = linePatterns.some((pattern: string) => {
    const re = new RegExp(pattern);
    return re.test(line);
  });
  return keepMatchingLines ? matches : !matches;
}