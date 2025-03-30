import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import PaymentIcon from '@mui/icons-material/Payment';
import { mockCourseData } from '../data/mockCourseData';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function UserProfile() {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  // Fetch user profile data using React Query
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', currentUser?.uid],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        name: 'John Doe',
        email: 'john.doe@example.com',
        profilePicture: 'https://i.pravatar.cc/150?img=1',
        enrolledCourses: [
          {
            id: '1',
            title: 'Introduction to Web Development',
            progress: 75,
            status: 'In Progress',
            lastAccessed: '2024-03-15',
          },
          {
            id: '2',
            title: 'Advanced JavaScript',
            progress: 30,
            status: 'In Progress',
            lastAccessed: '2024-03-14',
          },
        ],
        completedCourses: [
          {
            id: '3',
            title: 'HTML & CSS Basics',
            completionDate: '2024-03-10',
            grade: 95,
          },
        ],
        paymentHistory: [
          {
            id: '1',
            courseId: '1',
            courseTitle: 'Introduction to Web Development',
            amount: 49.99,
            date: '2024-03-01',
            status: 'Completed',
          },
          {
            id: '2',
            courseId: '2',
            courseTitle: 'Advanced JavaScript',
            amount: 79.99,
            date: '2024-03-05',
            status: 'Completed',
          },
        ],
        achievements: [
          {
            id: '1',
            title: 'Gold Medal',
            description: 'Achieved perfect score in HTML & CSS Basics',
            date: '2024-03-10',
            type: 'gold',
          },
          {
            id: '2',
            title: 'Silver Medal',
            description: 'Completed Introduction to Web Development with high score',
            date: '2024-03-15',
            type: 'silver',
          },
        ],
      };
    },
    enabled: !!currentUser,
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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

  if (!profile) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Error loading profile data. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={profile.profilePicture}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                {profile.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {profile.email}
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => {
                  // Handle profile picture upload
                }}
              >
                Change Photo
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="My Courses" />
                  <Tab label="Payment History" />
                  <Tab label="Achievements" />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" gutterBottom>
                  Enrolled Courses
                </Typography>
                <List>
                  {profile.enrolledCourses.map((course) => (
                    <ListItem key={course.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <SchoolIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={course.title}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              Progress: {course.progress}%
                            </Typography>
                            {' • '}
                            Last accessed: {course.lastAccessed}
                          </>
                        }
                      />
                      <Chip
                        label={course.status}
                        color="primary"
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Completed Courses
                </Typography>
                <List>
                  {profile.completedCourses.map((course) => (
                    <ListItem key={course.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <SchoolIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={course.title}
                        secondary={`Completed on ${course.completionDate}`}
                      />
                      <Chip
                        label={`Grade: ${course.grade}%`}
                        color="success"
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  Payment History
                </Typography>
                <Timeline>
                  {profile.paymentHistory.map((payment) => (
                    <TimelineItem key={payment.id}>
                      <TimelineSeparator>
                        <TimelineDot color="primary">
                          <PaymentIcon />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle1">
                          {payment.courseTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          £{payment.amount} • {payment.date}
                        </Typography>
                        <Chip
                          label={payment.status}
                          color="success"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Achievements
                </Typography>
                <Grid container spacing={2}>
                  {profile.achievements.map((achievement) => (
                    <Grid item xs={12} key={achievement.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <EmojiEventsIcon color={achievement.type} />
                            <Box>
                              <Typography variant="subtitle1">
                                {achievement.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {achievement.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Earned on {achievement.date}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default UserProfile; 