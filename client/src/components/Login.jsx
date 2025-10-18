import React from 'react';
// import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Divider,
  IconButton,
  Paper
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form, ErrorMessage } from 'formik';
// import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too short!').required('Required')
});

// const LoginForm = () => {
//   const navigate = useNavigate();
//   return (
//     <Container
//       fluid
//       className="d-flex align-items-center justify-content-center min-vh-100 bg-dark text-light"
//     >
//       <Row className="w-100 justify-content-center">
//         <Col xs={12} md={6} lg={4}>
//           <Card className="p-4 shadow-lg" style={{ background: '#1c1c1c', borderRadius: '1rem' }}>
//             <Card.Body>
//               <h3 className="text-center mb-3 text-white">Welcome back to Ruut</h3>
//               <p className="text-center mb-4 text-white">
//                 Access your account and continue where you left off. 🚀
//               </p>

//               {/* Google Login */}
//               {/* <Button variant="outline-light" className="w-100 mb-3">
//                 <i className="bi bi-google me-2"></i>
//                 Login with Google
//               </Button> */}

//               <div className="text-center text-muted my-3">OR</div>

//               <Formik
//                 initialValues={{ email: '', password: '' }}
//                 validationSchema={LoginSchema}
//                 onSubmit={(values, { setSubmitting }) => {
//                   console.log(values);
//                   setTimeout(async () => {
//                     const response = await fetch('/webflow/login', {
//                       method: 'POST',
//                       credentials: 'include',
//                       headers: {
//                         'Content-Type': 'application/json'
//                       },
//                       body: JSON.stringify(values)
//                     });
//                     // const result = await response.json();
//                     // alert(JSON.stringify(result));
//                     // if (result) {
//                     if (response.ok) {
//                       window.location.href = 'http://localhost:3600/webflow/oauth';
//                     }
//                     setSubmitting(false);
//                   }, 500);
//                 }}
//               >
//                 {({ handleSubmit, handleChange, values, errors, touched, isSubmitting }) => (
//                   <Form noValidate onSubmit={handleSubmit}>
//                     <Form.Group className="mb-3" controlId="formEmail">
//                       <Form.Label>Email</Form.Label>
//                       <Form.Control
//                         type="email"
//                         name="email"
//                         placeholder="Enter email"
//                         value={values.email}
//                         onChange={handleChange}
//                         isInvalid={touched.email && !!errors.email}
//                       />
//                       <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
//                     </Form.Group>

//                     <Form.Group className="mb-3" controlId="formPassword">
//                       <div className="d-flex justify-content-between">
//                         <Form.Label>Password</Form.Label>
//                         {/* <a href="#" className="small text-primary">
//                           Forgot your password?
//                         </a> */}
//                       </div>
//                       <Form.Control
//                         type="password"
//                         name="password"
//                         placeholder="Enter password"
//                         value={values.password}
//                         onChange={handleChange}
//                         isInvalid={touched.password && !!errors.password}
//                       />
//                       <Form.Control.Feedback type="invalid">
//                         {errors.password}
//                       </Form.Control.Feedback>
//                     </Form.Group>

//                     <Button
//                       variant="primary"
//                       type="submit"
//                       className="w-100"
//                       disabled={isSubmitting}
//                     >
//                       {isSubmitting ? 'Logging in...' : 'Login'}
//                     </Button>
//                   </Form>
//                 )}
//               </Formik>

//               <div className="text-center mt-4">
//                 <small>
//                   Don't have an account?{' '}
//                   <a href="#" className="text-primary">
//                     Create a new account
//                   </a>
//                 </small>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };
const LoginForm = () => {
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
            {/* <Typography variant="h6" fontWeight="bold">
              RUUT
            </Typography> */}
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
            setTimeout(async () => {
              const response = await fetch('/webflow/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
              });
              if (response.ok) {
                window.location.href = 'http://localhost:3600/webflow/oauth';
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

              {/* Google login */}
              {/* <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                sx={{
                  borderRadius: 2,
                  borderColor: 'grey.700',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 1.5,
                  mb: 3,
                  '&:hover': { borderColor: 'white' }
                }}
              >
                Sign in with Google
              </Button> */}
            </Form>
          )}
        </Formik>

        {/* Footer */}
        <Typography variant="caption" color="grey.500" align="center" display="block" mt={3}>
          By signing up, I accept the RUUT CSM{' '}
          <a href="#" style={{ color: '#bb86fc' }}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" style={{ color: '#bb86fc' }}>
            Privacy Notice
          </a>
          .
        </Typography>
      </Paper>
    </Container>
  );
};
export default LoginForm;
