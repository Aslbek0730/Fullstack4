import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { mockCourseData } from '../data/mockCourseData';

const steps = ['Instructions', 'Code Editor', 'Test Cases', 'Results'];

function PracticeAndTests() {
  const { courseId, moduleId, videoId } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [achievement, setAchievement] = useState(null);

  // Fetch course details using React Query
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockCourseData;
    },
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleRunTests = async () => {
    // Simulate test execution
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock test results
    const results = {
      totalTests: 5,
      passedTests: 4,
      failedTests: 1,
      testCases: [
        { name: 'Test Case 1', passed: true },
        { name: 'Test Case 2', passed: true },
        { name: 'Test Case 3', passed: true },
        { name: 'Test Case 4', passed: true },
        { name: 'Test Case 5', passed: false },
      ],
    };

    const calculatedScore = (results.passedTests / results.totalTests) * 100;
    setScore(calculatedScore);
    setTestResults(results);

    // Check for achievements
    if (calculatedScore >= 90) {
      setAchievement({
        type: 'gold',
        title: 'Gold Medal',
        description: "Excellent work! You've achieved a perfect score!",
      });
    } else if (calculatedScore >= 80) {
      setAchievement({
        type: 'silver',
        title: 'Silver Medal',
        description: "Great job! You've passed with flying colors!",
      });
    } else if (calculatedScore >= 70) {
      setAchievement({
        type: 'bronze',
        title: 'Bronze Medal',
        description: "Good work! Keep practicing to improve!",
      });
    }

    setShowResults(true);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const currentModule = course.modules.find((m) => m.id === moduleId);
  const currentVideo = currentModule?.videos.find((v) => v.id === videoId);

  return (
    <Container sx={{ py: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            Practice & Tests
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <Typography variant="body1" paragraph>
                {currentVideo?.title}
              </Typography>
              <Typography variant="body1" paragraph>
                Complete the following coding challenge. Make sure to:
              </Typography>
              <ul>
                <li>Follow the provided specifications</li>
                <li>Write clean, efficient code</li>
                <li>Test your solution thoroughly</li>
                <li>Submit your code when ready</li>
              </ul>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ mt: 2 }}
              >
                Start Coding
              </Button>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Code Editor
              </Typography>
              <Box sx={{ mb: 2 }}>
                <ReactQuill
                  value={code}
                  onChange={setCode}
                  theme="snow"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['code-block'],
                    ],
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!code}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Test Cases
              </Typography>
              <Typography variant="body1" paragraph>
                Your code will be tested against the following test cases:
              </Typography>
              <ul>
                <li>Test Case 1: Basic functionality</li>
                <li>Test Case 2: Edge cases</li>
                <li>Test Case 3: Performance</li>
                <li>Test Case 4: Error handling</li>
                <li>Test Case 5: Integration</li>
              </ul>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRunTests}
                  sx={{ mt: 2 }}
                >
                  Run Tests
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 3 && testResults && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Score: {score.toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={score}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Test Results
                </Typography>
                <Grid container spacing={2}>
                  {testResults.testCases.map((test, index) => (
                    <Grid item xs={12} key={index}>
                      <Chip
                        label={`${test.name}: ${test.passed ? 'Passed' : 'Failed'}`}
                        color={test.passed ? 'success' : 'error'}
                        sx={{ mr: 1 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box sx={{ height: 300, mb: 4 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Passed', value: testResults.passedTests },
                      { name: 'Failed', value: testResults.failedTests },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(0)}
                >
                  Try Again
                </Button>
              </Box>
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progress Overview
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Module: {currentModule?.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lesson: {currentVideo?.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Complete the practice exercises to earn achievements and track your
                progress.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={showResults} onClose={() => setShowResults(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEventsIcon color={achievement?.type} />
            {achievement?.title}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>{achievement?.description}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResults(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PracticeAndTests; 