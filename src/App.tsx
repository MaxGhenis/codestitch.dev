import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  ThemeProvider,
  Paper,
  IconButton,
  Tooltip,
  Link
} from '@mui/material';
import GitHubInput from './components/GitHubInput';
import AdvancedFilters from './components/AdvancedFilters';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { Alert } from './components/ui/alert';
import { processGitHubContent } from './utils/github';
import { GitHub, ContentCopy, Download } from '@mui/icons-material';
import { theme } from './theme';
import './App.css';

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppState();

  const handleStitch = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const inputs = state.githubInputs
      .split('\n')
      .map(l => l.trim())
      .filter(l => l);

    if (!inputs.length) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter at least one GitHub URL, PR link, or regex pattern.' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const { allContent, hadErrors } = await processGitHubContent({
        inputs,
        filePatterns: state.filePatterns.split('\n').filter(p => p.trim()),
        keepMatchingFiles: state.fileFilterMode === 'Include matching files',
        linePatterns: state.linePatterns.split('\n').filter(p => p.trim()),
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
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to copy content. Please try selecting and copying manually.' });
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
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            CodeStitch
          </Typography>
          <Tooltip title="View on GitHub">
            <IconButton
              color="inherit"
              href="https://github.com/maxghenis/codestitch.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHub />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h1" gutterBottom>
            Stitch GitHub Content
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Combine and filter content from GitHub repositories, pull requests, and issues. Enter URLs or use regex patterns to match files.
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
            color="secondary"
            size="large"
            onClick={handleStitch}
            disabled={state.loading}
            sx={{ mt: 3 }}
          >
            {state.loading ? 'Stitching...' : 'Stitch Content'}
          </Button>
        </Paper>

        {state.error && (
          <Alert variant="destructive">
            {state.error}
          </Alert>
        )}

        {state.stitchedContent && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h2">
                Result
              </Typography>
              <Box>
                <Tooltip title="Copy to clipboard">
                  <IconButton onClick={handleCopy} size="small" sx={{ mr: 1 }}>
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download as Markdown">
                  <IconButton onClick={handleDownload} size="small">
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box
              sx={{
                maxHeight: '500px',
                overflowY: 'auto',
                backgroundColor: '#f8f9fa',
                borderRadius: 1,
                p: 2,
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: '1.5',
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {state.stitchedContent}
              </pre>
            </Box>
          </Paper>
        )}
      </Container>

      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto',
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            Created by{' '}
            <Link href="https://github.com/maxghenis" target="_blank" rel="noopener noreferrer">
              Max Ghenis
            </Link>
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppStateProvider>
        <AppContent />
      </AppStateProvider>
    </ThemeProvider>
  );
};

export default App;