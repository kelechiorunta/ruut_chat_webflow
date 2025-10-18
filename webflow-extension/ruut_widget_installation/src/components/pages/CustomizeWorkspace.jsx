// CustomizeWorkspace.jsx
import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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

const WorkspaceSchema = Yup.object().shape({
  websiteName: Yup.string().required('Website name is required'),
  avatar: Yup.mixed()
    .test('fileSize', 'File size too large (max 3MB)', (value) => {
      if (!value) return true;
      return value.size <= 3 * 1024 * 1024;
    })
    .nullable(),
  theme: Yup.string().oneOf(['light', 'dark']).required(),
  brandColor: Yup.string().required('Select a brand color'),
  bubblePosition: Yup.string().oneOf(['left', 'right']).required(),
  bubbleType: Yup.string().oneOf(['standard', 'expanded']).required()
});

export default function CustomizeWorkspace({ show, handleClose, onSave }) {
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const [workspaceData, setWorkspaceData] = useState(null);
  const location = useLocation();
  const { accountId, apiToken, ruutToken, ruutWebflowToken } = location.state || {};
  const [credentials, setCredentials] = useState({
    accountId,
    apiToken,
    ruutToken,
    ruutWebflowToken
  });

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

  useEffect(() => {
    const fetchWorkspace = async (id) => {
      try {
        const response = await fetch(`${process.env.API_BASE}/webflow/workspace/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Server responded ${response.status}: ${text}`);
        }

        const data = await response.json();
        setWorkspaceData(data);
      } catch (error) {
        console.error('Failed to create workspace:', error);
      }
    };
    fetchWorkspace(id);
  }, [id]);

  const handleUpdate = async (id, values) => {
    try {
      const formData = new FormData();
      const avatarFile = values.avatar?.originFileObj || values.avatar;
      if (avatarFile) formData.append('avatar', avatarFile);

      formData.append('websiteName', values.websiteName || '');
      formData.append('websiteHeading', values.websiteHeading || '');
      formData.append('theme', values.theme || '');
      formData.append('brandColor', values.brandColor || '');

      const response = await fetch(`${process.env.API_BASE}/webflow/workspace/${id}`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server responded ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log('Workspace updated:', data);
      navigate('/#/oauth-callback');
    } catch (error) {
      console.error('Failed to update workspace:', error);
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
        p: 2
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: '#000',
          color: 'white',
          borderRadius: 3,
          p: { xs: 2, sm: 3 },
          outline: 'none',
          fontFamily: 'Raleway',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          // ✅ Remove rigid absolute positioning & centering offset
          position: 'relative',
          top: 'auto',
          left: 'auto',
          transform: 'none'
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

        {/* Title */}
        <Typography id="workspace-modal-title" variant="h6" fontWeight="bold" mb={2}>
          Customize your workspace
        </Typography>

        <Formik
          enableReinitialize
          initialValues={{
            avatar: workspaceData?.avatar_url || null,
            websiteName: workspaceData?.name || '',
            websiteHeading: workspaceData?.welcome_title || '',
            theme: workspaceData?.welcome_tagline || 'light',
            brandColor: workspaceData?.widget_color || '#007bff'
          }}
          validationSchema={WorkspaceSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await handleUpdate(id, values);
            } catch (err) {
              console.error(err);
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
                    sx: {
                      bgcolor: '#1c1c1c',
                      borderRadius: 2,
                      color: 'white'
                    }
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
                    sx: {
                      bgcolor: '#1c1c1c',
                      borderRadius: 2,
                      color: 'white'
                    }
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
                    gap: 1,
                    '&.Mui-selected': {
                      border: '2px solid #bb86fc',
                      bgcolor: 'rgba(187,134,252,0.1)',
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
                    gap: 1,
                    '&.Mui-selected': {
                      border: '2px solid #bb86fc',
                      bgcolor: 'rgba(187,134,252,0.1)',
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
                  onClick={() => navigate(`/preview/${id}`)}
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
