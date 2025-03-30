import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ForumIcon from '@mui/icons-material/Forum';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import { useQuery } from '@tanstack/react-query';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`community-tabpanel-${index}`}
      aria-labelledby={`community-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}
function Community() {
  const { currentUser: _currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  // Fetch community data using React Query
  const { data: communityData, isLoading } = useQuery({
    queryKey: ['community'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        discussions: [
          {
            id: '1',
            title: 'JavaScript Best Practices',
            author: {
              name: 'John Doe',
              avatar: 'https://i.pravatar.cc/150?img=1',
              role: 'Mentor',
            },
            replies: 12,
            lastActivity: '2024-03-15T10:30:00Z',
            tags: ['JavaScript', 'Programming'],
          },
          {
            id: '2',
            title: 'React Hooks Explained',
            author: {
              name: 'Jane Smith',
              avatar: 'https://i.pravatar.cc/150?img=2',
              role: 'Student',
            },
            replies: 8,
            lastActivity: '2024-03-15T09:15:00Z',
            tags: ['React', 'Hooks'],
          },
        ],
        mentors: [
          {
            id: '1',
            name: 'John Doe',
            avatar: 'https://i.pravatar.cc/150?img=1',
            expertise: ['JavaScript', 'React', 'Node.js'],
            rating: 4.8,
            students: 45,
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            avatar: 'https://i.pravatar.cc/150?img=3',
            expertise: ['Python', 'Data Science', 'Machine Learning'],
            rating: 4.9,
            students: 38,
          },
        ],
        projects: [
          {
            id: '1',
            title: 'E-commerce Platform',
            description: 'Building a full-stack e-commerce platform using React and Node.js',
            members: 4,
            status: 'In Progress',
            deadline: '2024-04-15',
          },
          {
            id: '2',
            title: 'AI Chat Application',
            description: 'Developing an AI-powered chat application with real-time messaging',
            members: 3,
            status: 'Planning',
            deadline: '2024-05-01',
          },
        ],
      };
    },
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Container>
        <Typography>Loading community data...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Community & Collaboration
      </Typography>

      <Paper sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<ForumIcon />} label="Discussions" />
            <Tab icon={<GroupIcon />} label="Projects" />
            <Tab icon={<SchoolIcon />} label="Mentors" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Start a Discussion
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Share your thoughts..."
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" color="primary">
                  Post Discussion
                </Button>
              </Paper>

              <List>
                {communityData.discussions.map((discussion) => (
                  <ListItem
                    key={discussion.id}
                    button
                    sx={{
                      mb: 2,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={discussion.author.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={discussion.title}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {discussion.author.name}
                          </Typography>
                          {' • '}
                          {new Date(discussion.lastActivity).toLocaleDateString()}
                        </>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {discussion.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                      <Chip
                        label={`${discussion.replies} replies`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Active Members
                </Typography>
                <List>
                  {[1, 2, 3].map((member) => (
                    <ListItem key={member}>
                      <ListItemAvatar>
                        <Avatar src={`https://i.pravatar.cc/150?img=${member}`} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={`User ${member}`}
                        secondary="Active now"
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Create New Project
                </Typography>
                <TextField
                  fullWidth
                  label="Project Title"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" color="primary">
                  Create Project
                </Button>
              </Paper>

              <List>
                {communityData.projects.map((project) => (
                  <ListItem
                    key={project.id}
                    sx={{
                      mb: 2,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                    }}
                  >
                    <ListItemText
                      primary={project.title}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {project.description}
                          </Typography>
                          <br />
                          <Chip
                            label={`${project.members} members`}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={project.status}
                            size="small"
                            color={project.status === 'In Progress' ? 'primary' : 'default'}
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={`Due: ${new Date(project.deadline).toLocaleDateString()}`}
                            size="small"
                            variant="outlined"
                          />
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Project Invitations
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Join AI Chat Project"
                      secondary="You've been invited to collaborate"
                    />
                    <Button variant="contained" size="small">
                      Accept
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <List>
                {communityData.mentors.map((mentor) => (
                  <ListItem
                    key={mentor.id}
                    sx={{
                      mb: 2,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={mentor.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={mentor.name}
                      secondary={
                        <>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            {mentor.expertise.map((skill) => (
                              <Chip key={skill} label={skill} size="small" />
                            ))}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Rating: {mentor.rating} • {mentor.students} students
                          </Typography>
                        </>
                      }
                    />
                    <Button variant="outlined" color="primary">
                      Request Mentoring
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Become a Mentor
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Share your expertise and help others learn. Apply to become a mentor
                  and make a difference in students' learning journey.
                </Typography>
                <Button variant="contained" color="primary" fullWidth>
                  Apply Now
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default Community; 