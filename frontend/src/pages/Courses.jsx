import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Chip,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function Courses() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Fetch courses with filters
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', searchQuery, level, priceRange, showFreeOnly, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchQuery,
        level: level !== 'all' ? level : '',
        min_price: priceRange[0].toString(),
        max_price: priceRange[1].toString(),
        is_free: showFreeOnly.toString(),
        sort: sortBy,
      });
      const response = await axios.get(`/api/courses/?${params}`);
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

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        All Courses
      </Typography>

      <Grid container spacing={4}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterListIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Filters</Typography>
            </Box>

            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Level</InputLabel>
              <Select
                value={level}
                label="Level"
                onChange={(e) => setLevel(e.target.value)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>

            <Typography gutterBottom>Price Range</Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              step={10}
              marks
              sx={{ mb: 3 }}
            />

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showFreeOnly}
                    onChange={(e) => setShowFreeOnly(e.target.checked)}
                  />
                }
                label="Free Courses Only"
              />
            </FormGroup>

            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="price_asc">Price: Low to High</MenuItem>
                <MenuItem value="price_desc">Price: High to Low</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Course Grid */}
        <Grid item xs={12} md={9}>
          {isLoading ? (
            <Typography>Loading courses...</Typography>
          ) : (
            <Grid container spacing={4}>
              {courses?.map((course) => (
                <Grid item xs={12} sm={6} key={course.id}>
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
        </Grid>
      </Grid>
    </Container>
  );
}

export default Courses; 