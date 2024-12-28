import React, { useState } from 'react';
import GitHubInput from './components/GitHubInput';
import FilePatternInput from './components/FilePatternInput';
import LinePatternInput from './components/LinePatternInput';
import FilterModeSelector from './components/FilterModeSelector';
import Sidebar from './components/Sidebar';
import { processGitHubContent } from './utils/githubApi';
import './styles/App.css';

function App() {
  const [githubInputs, setGithubInputs] = useState('');
  const [filePatterns, setFilePatterns] = useState('');
  const [fileFilterMode, setFileFilterMode] = useState('Include matching files');
  const [linePatterns, setLinePatterns] = useState('');
  const [lineFilterMode, setLineFilterMode] = useState('Include matching lines');

  const [stitchedContent, setStitchedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const handleStitch = async () => {
    setLoading(true);
    setErrorOccurred(false);

    // Clean inputs
    const inputs = githubInputs
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length);

    const filePatternsArr = filePatterns
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length);

    const linePatternsArr = linePatterns
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length);

    if (!inputs.length) {
      alert('⚠️ Please enter at least one GitHub URL, PR link, or regex pattern.');
      setLoading(false);
      return;
    }

    try {
      const { allContent, hadErrors } = await processGitHubContent({
        inputs,
        filePatterns: filePatternsArr,
        keepMatchingFiles: fileFilterMode === 'Include matching files',
        linePatterns: linePatternsArr,
        keepMatchingLines: lineFilterMode === 'Include matching lines'
      });
      setStitchedContent(allContent);
      setErrorOccurred(hadErrors);
    } catch (err) {
      console.error(err);
      setErrorOccurred(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([stitchedContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stitched_content.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <h1>🧵 CodeStitch.dev</h1>
        <p>
          Stitch together content from GitHub repositories, PRs, or issues. 
          Enter URLs to files, folders, PRs, issues, or use regex patterns to match file paths.
        </p>

        <GitHubInput value={githubInputs} onChange={setGithubInputs} />

        <div className="advanced-filters">
          <h3>Advanced Filtering Options</h3>
          <div className="filter-columns">
            <div className="filter-column">
              <FilePatternInput value={filePatterns} onChange={setFilePatterns} />
              <FilterModeSelector
                label="File Filter Mode"
                helpText="Choose whether to include or exclude files matching these patterns"
                options={['Include matching files', 'Exclude matching files']}
                value={fileFilterMode}
                onChange={setFileFilterMode}
              />
            </div>
            <div className="filter-column">
              <LinePatternInput value={linePatterns} onChange={setLinePatterns} />
              <FilterModeSelector
                label="Line Filter Mode"
                helpText="Choose whether to include or exclude lines matching these patterns"
                options={['Include matching lines', 'Exclude matching lines']}
                value={lineFilterMode}
                onChange={setLineFilterMode}
              />
            </div>
          </div>
        </div>

        <button onClick={handleStitch} disabled={loading}>
          {loading ? 'Stitching...' : '🧵 Stitch Content'}
        </button>

        {stitchedContent && (
          <>
            {errorOccurred && (
              <div style={{ color: 'orange', marginTop: '1rem' }}>
                ⚠️ Some errors occurred while fetching content. Please check the output below.
              </div>
            )}
            {!errorOccurred && (
              <div style={{ color: 'green', marginTop: '1rem' }}>
                ✅ Content stitched successfully!
              </div>
            )}
            <h3>Stitched Content:</h3>
            <pre className="stitched-content">{stitchedContent}</pre>
            <button onClick={handleDownload}>💾 Download Stitched Content</button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;