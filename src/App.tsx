import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button
} from '@mui/material';
import GitHubInput from './components/GitHubInput';
import AdvancedFilters from './components/AdvancedFilters';
import AboutCard from './components/AboutCard';
import OutputArea from './components/OutputArea';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { Alert } from '@/components/ui/alert';
import { processGitHubContent } from './utils/github';
import './App.css';

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppState();

  const handleStitch = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const inputs = state.githubInputs
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => !!l);

    if (!inputs.length) {
      alert('⚠️ Please enter at least one GitHub URL, PR link, or regex pattern.');
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const { allContent, hadErrors } = await processGitHubContent({
        inputs,
        filePatterns: state.filePatterns.split('\n').map((p: string) => p.trim()).filter((p: string) => p),
        keepMatchingFiles: state.fileFilterMode === 'Include matching files',
        linePatterns: state.linePatterns.split('\n').map((p: string) => p.trim()).filter((p: string) => p),
        keepMatchingLines: state.lineFilterMode === 'Include matching lines'
      });
      
      dispatch({ type: 'SET_STITCHED_CONTENT', payload: allContent });
      if (hadErrors) {
        dispatch({ type: 'SET_ERROR', payload: 'Some content could not be retrieved.' });
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_ERROR', payload: 'An error occurred while processing content.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(state.stitchedContent);
      alert('Content copied to clipboard!');
    } catch (err) {
      console.error('Could not copy text: ', err);
      alert('Failed to copy content. Please try selecting and copying manually.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([state.stitchedContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stitched_content.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#673ab7' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🧵 CodeStitch.dev
          </Typography>
        </Toolbar>
      </AppBar>

      <Container className="main-container">
        <AboutCard />

        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Stitch together content from GitHub repositories, PRs, or issues. 
          Enter URLs to files, folders, PRs, issues, or use regex patterns to match file paths.
        </Typography>

        <GitHubInput 
          value={state.githubInputs} 
          onChange={(value: string) => dispatch({ type: 'SET_GITHUB_INPUTS', payload: value })} 
        />

        <AdvancedFilters
          filePatterns={state.filePatterns}
          setFilePatterns={(value: string) => dispatch({ type: 'SET_FILE_PATTERNS', payload: value })}
          fileFilterMode={state.fileFilterMode}
          setFileFilterMode={(value: string) => dispatch({ type: 'SET_FILE_FILTER_MODE', payload: value })}
          linePatterns={state.linePatterns}
          setLinePatterns={(value: string) => dispatch({ type: 'SET_LINE_PATTERNS', payload: value })}
          lineFilterMode={state.lineFilterMode}
          setLineFilterMode={(value: string) => dispatch({ type: 'SET_LINE_FILTER_MODE', payload: value })}
        />

        <Button
          variant="contained"
          sx={{ marginTop: 2 }}
          onClick={handleStitch}
          disabled={state.loading}
        >
          {state.loading ? 'Stitching...' : '🧵 Stitch Content'}
        </Button>

        <OutputArea
          stitchedContent={state.stitchedContent}
          errorOccurred={!!state.error}
          onCopy={handleCopy}
          onDownload={handleDownload}
        />
      </Container>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
};

export default App;