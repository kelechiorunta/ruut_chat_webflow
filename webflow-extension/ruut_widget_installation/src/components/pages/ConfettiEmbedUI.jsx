import React from 'react';
import { Button, Modal, Box, Typography } from '@mui/material';
import Confetti from 'react-confetti';

export default function ConfettiEmbedUI({ showConfetti, setShowConfetti, iframeRef }) {
  return (
    <Modal
      open={showConfetti}
      onClose={() => setShowConfetti(false)}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto' // allows scrolling on smaller screens
      }}
    >
      <Box
        sx={{
          width: '90%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          textAlign: 'center',
          outline: 'none',
          my: 4 // adds vertical margin for natural spacing on smaller screens
        }}
      >
        {/* 🎊 Confetti Animation */}
        <Confetti width={window.innerWidth} height={window.innerHeight} />

        {/* 🧩 Iframe Preview */}
        <iframe
          ref={iframeRef}
          width="100%"
          height="400"
          style={{
            display: 'block',
            margin: 'auto',
            backgroundColor: 'black',
            borderRadius: 8,
            border: 'none'
          }}
          title="Preview Iframe"
        />

        {/* 🎉 Title */}
        <Typography id="modal-title" variant="h5" gutterBottom sx={{ mt: 3 }}>
          🎉 Live Chat Embedded!
        </Typography>

        {/* 📝 Description */}
        <Typography id="modal-description" variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your workspace is attached to your website. Once you publish, your live chat widget will
          automatically activate and work directly.
        </Typography>

        {/* ✅ Action Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowConfetti(false)}
          sx={{ borderRadius: 2 }}
        >
          Done
        </Button>
      </Box>
    </Modal>
  );
}
