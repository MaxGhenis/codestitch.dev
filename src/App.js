import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Alert
} from '@mui/material';
import GitHubInput from './components/GitHubInput';
import AdvancedFilters from './components/AdvancedFilters';
import AboutCard from './components/AboutCard';
import OutputArea from './components/OutputArea';
import { processGitHubContent } from './utils/githubApi';
import './App.css';

function App() {
  // Basic states
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

    // parse user input lines
    const inputs = githubInputs
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => !!l);

    if (!inputs.length) {
      alert('⚠️ Please enter at least one GitHub URL, PR link, or regex pattern.');
      setLoading(false);
      return;
    }

    try {
      const { allContent, hadErrors } = await processGitHubContent({
        inputs,
        filePatterns: filePatterns.split('\n').map((p) => p.trim()).filter((p) => p),
        keepMatchingFiles: fileFilterMode === 'Include matching files',
        linePatterns: linePatterns.split('\n').map((p) => p.trim()).filter((p) => p),
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

  const handleCopy = () => {
    navigator.clipboard.writeText(stitchedContent)
      .then(() => {
        alert('Content copied to clipboard!');
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
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
    <>
      {/* Top AppBar */}
      <AppBar position="static" sx={{ backgroundColor: '#673ab7' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🧵 CodeStitch.dev
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main container area */}
      <Container className="main-container">
        <AboutCard />

        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Stitch together content from GitHub repositories, PRs, or issues. 
          Enter URLs to files, folders, PRs, issues, or use regex patterns to match file paths.
        </Typography>

        <GitHubInput value={githubInputs} onChange={setGithubInputs} />

        <AdvancedFilters
          filePatterns={filePatterns}
          setFilePatterns={setFilePatterns}
          fileFilterMode={fileFilterMode}
          setFileFilterMode={setFileFilterMode}
          linePatterns={linePatterns}
          setLinePatterns={setLinePatterns}
          lineFilterMode={lineFilterMode}
          setLineFilterMode={setLineFilterMode}
        />

        <Button
          variant="contained"
          sx={{ marginTop: 2 }}
          onClick={handleStitch}
          disabled={loading}
        >
          {loading ? 'Stitching...' : '🧵 Stitch Content'}
        </Button>

        {/* Output area */}
        <OutputArea
          stitchedContent={stitchedContent}
          errorOccurred={errorOccurred}
          onCopy={handleCopy}
          onDownload={handleDownload}
        />
      </Container>
    </>
  );
}

export default App;