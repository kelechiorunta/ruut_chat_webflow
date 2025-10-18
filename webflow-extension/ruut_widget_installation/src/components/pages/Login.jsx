import React from 'react';
import { Box, Button, Container, TextField, Typography, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too short!').required('Required')
});

const Login = () => {
  const navigate = useNavigate();
  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#000'
      }}
    >
      <Paper
        sx={{
          p: 4,
          bgcolor: '#000',
          color: 'white',
          width: '100%',
          borderRadius: 3,
          boxShadow: 'none'
        }}
      >
        {/* Header with logo + close */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box component="img" src="/RUUT.png" alt="Ruut Logo" sx={{ width: 67, height: 24 }} />
          </Box>
          <IconButton sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Title + Subtitle */}
        <Typography variant="h5" fontWeight="bold" mb={1}>
          Welcome to Ruut
        </Typography>
        <Typography variant="body2" color="grey.500" mb={3}>
          Login to access your workspace
        </Typography>

        {/* Formik form */}
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={(values, { setSubmitting }) => {
            let loginTimeout;
            loginTimeout = setTimeout(async () => {
              const response = await fetch(`${process.env.API_BASE}/webflow/signin`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
              });
              const data = await response.json();
              if (!response.ok) {
                toast.error(`Signin Error: ${response.statusText || data?.error}!`, {
                  position: 'top-right',
                  autoClose: 4000,
                  pauseOnHover: true,
                  draggable: true
                });
                navigate('/login');
                clearTimeout(loginTimeout);
              } else {
                if (data && data.ruutWebflowToken) {
                  toast.success(`Success: ${data?.message}`, {
                    position: 'top-right',
                    autoClose: 4000,
                    pauseOnHover: true,
                    draggable: true
                  });
                  navigate('/#/oauth-callback');
                } else {
                  toast.success(`Redirecting to OAuth...`, {
                    position: 'top-right',
                    autoClose: 4000,
                    pauseOnHover: true,
                    draggable: true
                  });
                  window.location.href = data.authorizeUrl;
                  //'https://webflow.com/oauth/authorize?response_type=code&client_id=9089fdfe104ec151afa65f041e4d52712fbf568bf1fb6d55f2e9ef1e939381c7&redirect_uri=https%3A%2F%2Fruutchat.vercel.app%2Fwebflow%2Foauth%2Fcallback&scope=sites%3Aread+cms%3Aread&workspace=ruut-chat';
                }
              }
              setSubmitting(false);
            }, 500);
          }}
        >
          {({ handleSubmit, handleChange, values, errors, touched, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <Typography variant="body2" mb={1}>
                Enter email
              </Typography>
              <TextField
                fullWidth
                className="email_field"
                size="small"
                variant="outlined"
                name="email"
                placeholder="Enter email address"
                value={values.email}
                onChange={handleChange}
                error={touched.email && Boolean(errors.email)}
                helperText={<ErrorMessage name="email" />}
                InputProps={{
                  sx: {
                    bgcolor: '#1c1c1c',
                    borderRadius: 2,
                    color: 'white'
                  }
                }}
                sx={{ mb: 3 }}
              />

              <Typography variant="body2" mb={1}>
                Enter password
              </Typography>
              <TextField
                fullWidth
                className="password_field"
                size="small"
                variant="outlined"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={values.password}
                onChange={handleChange}
                error={touched.password && Boolean(errors.password)}
                helperText={<ErrorMessage name="password" />}
                InputProps={{
                  sx: {
                    bgcolor: '#1c1c1c',
                    borderRadius: 2,
                    color: 'white'
                  }
                }}
                sx={{ mb: 3 }}
              />

              {/* Primary Login Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  bgcolor: '#bb86fc',
                  color: 'white',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 1.5,
                  mb: 2,
                  '&:hover': { bgcolor: '#a45de7' }
                }}
              >
                {isSubmitting ? 'Logging in...' : 'Login to account'}
              </Button>
            </Form>
          )}
        </Formik>

        {/* Footer */}
        <Typography variant="caption" color="grey.500" align="center" display="block" mt={3}>
          By signing up, I accept the RUUT CSM{' '}
          <a href="https://ruut.chat/terms_of_use " style={{ color: '#bb86fc' }}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="https://ruut.chat/privacy_policy" style={{ color: '#bb86fc' }}>
            Privacy Notice
          </a>
          .
        </Typography>
      </Paper>
    </Container>
  );
};
export default Login;
