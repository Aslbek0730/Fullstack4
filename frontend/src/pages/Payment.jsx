import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { mockCourseData } from '../data/mockCourseData';

const paymentSchema = yup.object().shape({
  cardNumber: yup
    .string()
    .matches(/^[0-9]{16}$/, 'Card number must be 16 digits')
    .required('Card number is required'),
  expiryDate: yup
    .string()
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date (MM/YY)')
    .required('Expiry date is required'),
  cvv: yup
    .string()
    .matches(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits')
    .required('CVV is required'),
  cardholderName: yup
    .string()
    .required('Cardholder name is required')
    .min(2, 'Name must be at least 2 characters'),
});

const steps = ['Select Payment Method', 'Enter Card Details', 'Confirm Payment'];

function Payment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch course details using React Query
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockCourseData;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(paymentSchema),
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const onSubmit = async (data) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate API call to process payment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here you would make the actual API call to your payment processor
      // const response = await axios.post('/api/payments/process', {
      //   courseId,
      //   userId: currentUser.uid,
      //   paymentMethod,
      //   ...data,
      // });

      // For demo purposes, we'll simulate a successful payment
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
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

  return (
    <Container sx={{ py: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            Payment Details
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {activeStep === 0 && (
              <Box>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Select Payment Method</FormLabel>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                  >
                    <FormControlLabel
                      value="click"
                      control={<Radio />}
                      label="Click"
                    />
                    <FormControlLabel
                      value="payme"
                      control={<Radio />}
                      label="Payme"
                    />
                    <FormControlLabel
                      value="uzum"
                      control={<Radio />}
                      label="Uzum Bank"
                    />
                  </RadioGroup>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!paymentMethod}
                  sx={{ mt: 2 }}
                >
                  Next
                </Button>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      {...register('cardNumber')}
                      error={!!errors.cardNumber}
                      helperText={errors.cardNumber?.message}
                      placeholder="1234 5678 9012 3456"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      {...register('expiryDate')}
                      error={!!errors.expiryDate}
                      helperText={errors.expiryDate?.message}
                      placeholder="MM/YY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      {...register('cvv')}
                      error={!!errors.cvv}
                      helperText={errors.cvv?.message}
                      placeholder="123"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      {...register('cardholderName')}
                      error={!!errors.cardholderName}
                      helperText={errors.cardholderName?.message}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={Object.keys(errors).length > 0}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Confirm Payment
                </Typography>
                <Typography variant="body1" paragraph>
                  Course: {course.title}
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom>
                  Amount: £{course.price}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Processing...
                      </>
                    ) : (
                      'Confirm Payment'
                    )}
                  </Button>
                </Box>
              </Box>
            )}
          </form>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ my: 2 }}>
                <Typography variant="body1">{course.title}</Typography>
                <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
                  £{course.price}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                By completing your purchase, you agree to our Terms of Service and
                Privacy Policy.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Payment; 