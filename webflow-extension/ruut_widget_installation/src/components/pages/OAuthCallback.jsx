// src/pages/OAuthCallback.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import WorkSpaceModal from './WorkspaceModal';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [workspaces, setWorkspaces] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // const theme = useTheme();
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      html, body, #root {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        font-family: 'Raleway', Arial, sans-serif !important;
        background-color: #000 !important;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`${process.env.API_BASE}/webflow/validate_token`, {
          method: 'GET',
          credentials: 'include' // sends auth_session cookie
        });

        if (!response.ok) throw new Error('Session not found');

        const data = await response.json();
        console.log('Validation Response:', data);
        setWorkspaces(data?.ruutWorkspaces?.payload || []);
        setSession(data); //store accountId, token, workspaces
        setShowModal(true); //open modal after auth
      } catch (err) {
        console.error('Error fetching session:', err);
        navigate('/login');
      }
    };

    fetchSession();
  }, []);

  return (
    <>
      {showModal && workspaces && (
        <>
          <WorkSpaceModal
            workspaces={workspaces}
            onConfirm={() => {
              setShowModal(false);
            }}
          />
        </>
      )}
    </>
  );
}
