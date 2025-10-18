import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import OAuthCallback from './components/pages/OAuthCallback';
import CreateWorkspace from './components/pages/CreateWorkspace';
import CustomizeWorkspace from './components/pages/CustomizeWorkspace';
import Preview from './components/pages/Preview';
import Login from './components/pages/Login';
// import { Toaster } from 'react-hot-toast';

const App = () => {
  const navigate = useNavigate();
  // useEffect(() => {
  //   // Set Extension Size
  //   webflow.setExtensionSize('default');
  // }, []);

  // const addText = async () => {
  //   // Get the current selected Element
  //   const el = await webflow.getSelectedElement();

  //   // If text content can be set, update it!
  //   if (el && el.textContent) {
  //     await el.setTextContent('hello world!');
  //   } else {
  //     alert('Please select a text element');
  //   }
  // };

  const handleClose = () => {
    try {
      navigate('/#/oauth-callback');
    } catch (error) {
      console.error('Failed to navigate');
    }
  };

  return (
    <>
      {/* <Toaster position="top-right" reverseOrder={false} /> */}
      <Routes>
        <Route path="/*" element={<OAuthCallback />}>
          <Route path="oauth-callback" element={<OAuthCallback />} />
          {/* <Route path="login" element={<Login />} /> */}
        </Route>
        <Route path="/create-workspace" element={<CreateWorkspace handleClose={handleClose} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/customize/:id" element={<CustomizeWorkspace handleClose={handleClose} />} />
        <Route path="/preview/:id" element={<Preview onClose={handleClose} isOpen={true} />} />
      </Routes>
    </>
  );
};

export default App;
