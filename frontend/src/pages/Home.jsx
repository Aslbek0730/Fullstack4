import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Box,
  Chip,
  Rating,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';

function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();

  // Fetch featured courses
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await axios.get('/api/courses/');
      return response.data;
    },
  });

  const handleCourseClick = (course) => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/courses/${course.id}` } });
      return;
    }
    navigate(`/courses/${course.id}`);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Learn New Skills Online
              </Typography>
              <Typography variant="h5" sx={{ mb: 4 }}>
                Access high-quality courses from expert instructors and advance your career
              </Typography>
              <Button
                variant="contained"
                size="large"
                color="secondary"
                onClick={() => navigate('/courses')}
                startIcon={<SchoolIcon />}
              >
                Browse Courses
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/hero-image.svg"
                alt="Online Learning"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  display: { xs: 'none', md: 'block' },
                  mx: 'auto',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Courses Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom align="center">
          Featured Courses
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Discover our most popular courses and start learning today
        </Typography>

        {isLoading ? (
          <Typography>Loading courses...</Typography>
        ) : (
          <Grid container spacing={4}>
            {courses?.slice(0, 6).map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={course.image}
                    alt={course.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3">
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {course.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={4.5} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        (4.5)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        icon={<AccessTimeIcon />}
                        label={`${course.duration} hours`}
                        size="small"
                      />
                      <Chip
                        label={course.level}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    {course.is_paid && (
                      <Typography variant="h6" color="primary">
                        ${course.price}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => handleCourseClick(course)}
                    >
                      {currentUser ? 'Start Learning' : 'Login to Enroll'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Expert Instructors
                </Typography>
                <Typography color="text.secondary">
                  Learn from industry professionals with years of experience
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <AccessTimeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Flexible Learning
                </Typography>
                <Typography color="text.secondary">
                  Study at your own pace with lifetime access to course materials
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <StarIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Quality Content
                </Typography>
                <Typography color="text.secondary">
                  High-quality video lectures and comprehensive course materials
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default Home; 