import React, { useState } from 'react';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

// Validation schema
const WorkspaceSchema = Yup.object().shape({
  websiteName: Yup.string().required('Website name is required'),
  avatar: Yup.mixed()
    .test('fileSize', 'File size too large (max 3MB)', (value) => {
      if (!value) return true;
      return value.size <= 3 * 1024 * 1024;
    })
    .nullable(),
  theme: Yup.string().oneOf(['light', 'dark']).required(),
  brandColor: Yup.string().required('Select a brand color')
});

export default function CreateWorkspace({ handleClose }) {
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const brandColors = [
    '#007bff',
    '#28a745',
    '#ffc107',
    '#dc3545',
    '#17a2b8',
    '#e83e8c',
    '#6610f2',
    '#fd7e14',
    '#20c997'
  ];

  const handleSave = async (values) => {
    try {
      const formData = new FormData();
      const avatarFile = values.avatar?.originFileObj || values.avatar;
      if (avatarFile) formData.append('avatar', avatarFile);

      formData.append('websiteName', values.websiteName || '');
      formData.append('websiteHeading', values.websiteHeading || '');
      formData.append('theme', values.theme || '');
      formData.append('brandColor', values.brandColor || '');

      const response = await fetch(`${process.env.API_BASE}/webflow/create_workspace`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      console.log('Workspace created:', data);
      navigate('/#/oauth-callback');
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  const handlePreview = async (values) => {
    try {
      const formData = new FormData();
      const avatarFile = values.avatar?.originFileObj || values.avatar;
      if (avatarFile) formData.append('avatar', avatarFile);

      formData.append('websiteName', values.websiteName || '');
      formData.append('websiteHeading', values.websiteHeading || '');
      formData.append('theme', values.theme || '');
      formData.append('brandColor', values.brandColor || '');

      const response = await fetch(`${process.env.API_BASE}/webflow/create_workspace`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      const { workspace } = data;
      if (workspace?.id) navigate(`/preview/${workspace.id}`);
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  return (
    <Modal
      open={true}
      onClose={handleClose}
      aria-labelledby="workspace-modal-title"
      aria-describedby="workspace-modal-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: '#000',
          color: 'white',
          borderRadius: 3,
          p: 2,
          outline: 'none',
          fontFamily: 'Raleway',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 3,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box component="img" src="/RUUT.png" alt="Ruut Logo" sx={{ width: 67, height: 24 }} />
          </Box>
          <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography id="workspace-modal-title" variant="h6" fontWeight="bold" mb={2}>
          Create your workspace
        </Typography>

        <Formik
          initialValues={{
            avatar: null,
            websiteName: '',
            websiteHeading: '',
            theme: 'light',
            brandColor: '#007bff'
          }}
          validationSchema={WorkspaceSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await handleSave(values);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ setFieldValue, values, isSubmitting }) => (
            <Form noValidate>
              {/* Avatar Upload */}
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <input
                  id="avatar-upload"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setFieldValue('avatar', file);
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                />
                <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
                  <Avatar
                    src={preview || values?.avatar || '/workspace.png'}
                    sx={{ width: 60, height: 60 }}
                  />
                </label>
                <Box>
                  <Typography variant="body2" color="white">
                    Upload your logo
                  </Typography>
                  <Typography variant="caption" color="grey.500">
                    Max of 3MB
                  </Typography>
                  <ErrorMessage
                    name="avatar"
                    component="div"
                    style={{ color: 'red', fontSize: 12 }}
                  />
                </Box>
              </Box>

              {/* Website Name */}
              <Box mb={3}>
                <Field
                  as={TextField}
                  name="websiteName"
                  label="Website Name"
                  placeholder="Ruut Webflow"
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{
                    sx: { bgcolor: '#1c1c1c', borderRadius: 2, color: 'white' }
                  }}
                  InputLabelProps={{
                    sx: { color: 'grey.400' }
                  }}
                />
                <ErrorMessage
                  name="websiteName"
                  component="div"
                  style={{ color: 'red', fontSize: 12 }}
                />
              </Box>

              {/* Website Heading */}
              <Box mb={3}>
                <Field
                  as={TextField}
                  name="websiteHeading"
                  label="Website Heading"
                  placeholder="Welcome to Webflow"
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{
                    sx: { bgcolor: '#1c1c1c', borderRadius: 2, color: 'white' }
                  }}
                  InputLabelProps={{
                    sx: { color: 'grey.400' }
                  }}
                />
                <ErrorMessage
                  name="websiteHeading"
                  component="div"
                  style={{ color: 'red', fontSize: 12 }}
                />
              </Box>

              {/* Theme */}
              <Typography variant="subtitle2" mb={1}>
                Theme
              </Typography>
              <ToggleButtonGroup
                value={values.theme}
                exclusive
                onChange={(e, val) => val && setFieldValue('theme', val)}
                sx={{ display: 'flex', gap: 2, mb: 3 }}
              >
                <ToggleButton
                  value="light"
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    border: '1px solid #333',
                    color: 'white',
                    textTransform: 'none',
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&.Mui-selected': {
                      border: '2px solid #bb86fc',
                      bgcolor: 'rgba(187, 134, 252, 0.1)',
                      color: '#bb86fc'
                    }
                  }}
                >
                  <LightModeIcon fontSize="small" />
                  Light Mode
                </ToggleButton>

                <ToggleButton
                  value="dark"
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    border: '1px solid #333',
                    color: 'white',
                    textTransform: 'none',
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&.Mui-selected': {
                      border: '2px solid #bb86fc',
                      bgcolor: 'rgba(187, 134, 252, 0.1)',
                      color: '#bb86fc'
                    }
                  }}
                >
                  <DarkModeIcon fontSize="small" />
                  Dark Mode
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Brand Color */}
              <Typography variant="subtitle2" mb={1}>
                Brand Color
              </Typography>
              <Box display="flex" gap={4} mt={1} mb={3}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2,
                      backgroundColor: values.brandColor,
                      mb: 1
                    }}
                  />
                  <Typography variant="caption" color="grey.400">
                    {values.brandColor}
                  </Typography>
                </Box>
                <Grid container spacing={3} sx={{ width: 'auto' }}>
                  {brandColors.map((color) => (
                    <Grid item key={color}>
                      <Box
                        onClick={() => setFieldValue('brandColor', color)}
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: color,
                          border:
                            values.brandColor === color ? '3px solid #bb86fc' : '2px solid #333',
                          cursor: 'pointer'
                        }}
                      />
                    </Grid>
                  ))}
                  <Grid item>
                    <Box
                      onClick={() => setFieldValue('brandColor', 'custom')}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border:
                          values.brandColor === 'custom' ? '3px solid #bb86fc' : '2px solid #333',
                        background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Footer */}
              <Box mt={4} display="flex" flexDirection="column" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    bgcolor: '#bb86fc',
                    '&:hover': { bgcolor: '#9c4dcc' },
                    borderRadius: 2
                  }}
                >
                  Save Workspace
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  sx={{ color: 'white', textTransform: 'none', borderRadius: 2 }}
                  onClick={() => handlePreview(values)}
                >
                  See Preview
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
}
