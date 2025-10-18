import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Modal, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

function Preview({ isOpen, onClose }) {
  const iframeRef = useRef(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchWidget = async (id) => {
      try {
        const response = await fetch(`${process.env.API_BASE}/webflow/workspace/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        // Check if the request actually resolves
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Server responded ${response.status}: ${text}`);
        }

        const data = await response.json();
        if (data) {
          const widgetScript = data.web_widget_script.replace(/\\n/g, '\n').replace(/\\"/g, '"');

          if (iframeRef.current && isOpen) {
            const doc =
              iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;

            // Inject the script into iframe
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="UTF-8" />
                    <title>Preview</title>
                    <style>
                      html, body {
                        margin: auto;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                      }
                      #ruut-container {
                        width: 100% !important;
                        height: 100% !important;
                        margin: auto !important;
                      }
                    </style>
                  </head>
                  <body>
                    <div id="ruut-container"></div>
                    ${widgetScript}
                  <script>
                    
                    function tryClick() {
                      var launcher = document.querySelector("button"); 
                      if (launcher) {
                        launcher.click();
                        console.log("Widget auto-clicked");
                      } else {
                      console.log("Widget failed to autoclick");
                        setTimeout(tryClick, 0);
                      }
                    }
                    tryClick();
                  </script>
                  </body>
                </html>
              `);
            doc.close();
          }
        }
      } catch (error) {
        console.error('Failed to create workspace:', error);
      }
    };
    fetchWidget(id);
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <Modal
      style={{ border: 'none' }}
      show={true}
      onHide={onClose}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title style={{ width: '100%', textAlign: 'center', margin: 'auto' }}>
          WORKSPACE PREVIEW
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <iframe
          ref={iframeRef}
          width="80%"
          height="400"
          style={{
            display: 'block',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto'
          }}
          title="Preview Iframe"
        />
      </Modal.Body>

      <Modal.Footer>
        <Button
          className="d-flex align-items-center justify-content-center m-auto my-4"
          variant="primary"
          style={{ width: '50%', padding: '9.81px 12.07px' }}
          onClick={onClose}
        >
          Close Preview
        </Button>
      </Modal.Footer>
    </Modal>,
    document.getElementById('preview')
  );
}

export default Preview;
