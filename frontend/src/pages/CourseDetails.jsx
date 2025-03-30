import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactPlayer from 'react-player';
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useAuth } from '../contexts/AuthContext';
import { mockCourseData } from '../data/mockCourseData';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [expandedModule, setExpandedModule] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Use mock data for testing
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockCourseData;
    },
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleModuleChange = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  const handleStartCourse = async () => {
    if (!currentUser) {
      navigate('/register');
      return;
    }

    if (course.price === 0) {
      // For free courses, navigate directly to the first video
      if (course.modules[0]?.videos[0]) {
        setSelectedVideo(course.modules[0].videos[0]);
      }
    } else {
      // For paid courses, redirect to payment
      navigate(`/payment/${courseId}`);
    }
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

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Error loading course details. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      {/* Course Header */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h3" component="h1" gutterBottom>
            {course.title}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip label={course.level} color="primary" variant="outlined" />
            <Chip label={course.category} color="secondary" variant="outlined" />
            <Chip
              label={`${course.duration} hours`}
              color="info"
              variant="outlined"
            />
          </Stack>
          <Typography variant="body1" paragraph>
            {course.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={course.rating} readOnly precision={0.5} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({course.reviewCount} reviews)
            </Typography>
          </Box>
          <Typography variant="h5" color="primary" gutterBottom>
            {course.price === 0 ? 'Free' : `£${course.price}`}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartCourse}
            sx={{ mt: 2 }}
          >
            Start Course
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Instructor
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    marginRight: 16,
                  }}
                />
                <Box>
                  <Typography variant="subtitle1">
                    {course.instructor.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.instructor.title}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" paragraph>
                {course.instructor.bio}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Course Content */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Course Content" />
            <Tab label="Overview" />
            <Tab label="Reviews" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {course.modules.map((module) => (
            <Accordion
              key={module.id}
              expanded={expandedModule === module.id}
              onChange={() => handleModuleChange(module.id)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{module.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {module.videos.map((video) => (
                    <Grid item xs={12} key={video.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                        onClick={() => handleVideoSelect(video)}
                      >
                        <PlayCircleOutlineIcon sx={{ mr: 2 }} />
                        <Typography>{video.title}</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 'auto' }}
                        >
                          {video.duration}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            What you'll learn
          </Typography>
          <Grid container spacing={2}>
            {course.learningObjectives.map((objective, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Typography>• {objective}</Typography>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Course Reviews
          </Typography>
          {course.reviews.map((review) => (
            <Box key={review.id} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {review.userName}
                </Typography>
              </Box>
              <Typography variant="body2">{review.comment}</Typography>
            </Box>
          ))}
        </TabPanel>
      </Box>

      {/* Video Player */}
      {selectedVideo && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            {selectedVideo.title}
          </Typography>
          <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
            <ReactPlayer
              url={selectedVideo.url}
              controls
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </Box>
        </Box>
      )}
    </Container>
  );
}

export default CourseDetails; 