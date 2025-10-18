import React, { useState, useEffect, useRef } from 'react';
import { Modal, Image, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import Confetti from 'react-confetti';

export default function WorkspaceModal({ workspaces, handleClose }) {
  const [selected, setSelected] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [script, setScript] = useState(null);
  const [widget, setWidget] = useState(null);
  const iframeRef = useRef(null);

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

  // // Embed the widget on webflow site
  // const handleEmbed = async (id) => {
  //   try {
  //     const response = await fetch(`${process.env.API_BASE}/webflow/workspace/${id}`, {
  //       method: 'GET',
  //       headers: { 'Content-Type': 'application/json' },
  //       credentials: 'include'
  //     });

  //     if (!response.ok) {
  //       const text = await response.text();
  //       throw new Error(`Server responded ${response.status}: ${text}`);
  //     }

  //     const data = await response.json();
  //     console.log('API data', data);

  //     if (data?.web_widget_script) {
  //       // 🧼 Clean escaped characters
  //       let widgetScript = data.web_widget_script.replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();

  //       if (widgetScript.startsWith('<script')) {
  //         const match = widgetScript.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  //         if (match) widgetScript = match[1].trim();
  //       }

  //       console.log(
  //         '%c[RUUT DEBUG] Extracted widget script:',
  //         'color:#00bfa6;',
  //         widgetScript.slice(0, 200)
  //       );

  //       const sandboxSafeScript = `
  //         (function() {
  //           const inSandbox = window.top !== window.self;

  //           const runWidget = function() {
  //             try {
  //               (function(d, t) {
  //                 const BASE_URL = "https://app.ruut.chat";
  //                 const TOKEN = "${data.website_token || 'pvoRCdKr8Foyv4iTGjKAUzgu'}";
  //                 const g = d.createElement(t);
  //                 const s = d.getElementsByTagName(t)[0];
  //                 g.src = BASE_URL + "/packs/js/sdk.js";
  //                 g.defer = true;
  //                 g.async = true;
  //                 s.parentNode.insertBefore(g, s);

  //                 g.onload = function() {
  //                   console.log("[RUUT] ✅ SDK loaded");

  //                   try {
  //                     if (window.ruutSDK && window.ruutSDK.run) {
  //                       window.ruutSDK.run({ websiteToken: TOKEN, baseUrl: BASE_URL });
  //                       console.log("[RUUT] ✅ ruutSDK.run() called");
  //                     } else {
  //                       console.warn("[RUUT] ⚠️ ruutSDK not ready yet");
  //                     }
  //                   } catch (e) {
  //                     console.error("[RUUT] ❌ SDK run failed:", e);
  //                   }

  //                   const tryMount = () => {
  //                     const sdkIframe = d.querySelector("#chatwoot_live_chat_widget");
  //                     const container = d.querySelector("#ruut-container");

  //                     if (sdkIframe && container) {
  //                       const src = sdkIframe.src;
  //                       if (src && src.startsWith("https")) {
  //                         console.log("[RUUT] 🚀 Widget iframe detected:", src);

  //                         // Hide SDK iframe (to prevent duplication)
  //                         sdkIframe.style.display = "none";

  //                         // 🧩 Use DIRECT widget URL (NO PROXY)
  //                         console.log("[RUUT] 🌐 Using direct widget URL:", src);

  //                         // Clear any loading placeholder
  //                         container.innerHTML = "";

  //                         // Create visible iframe
  //                         const visibleIframe = d.createElement("iframe");
  //                         d.domain = "webflow.com"
  //                         visibleIframe.src = src;
  //                         visibleIframe.allow = "camera; microphone; fullscreen; display-capture; picture-in-picture; clipboard-write;";
  //                         visibleIframe.style.cssText = \`
  //                           width: 100%;
  //                           height: 100%;
  //                           border: none;
  //                           border-radius: 12px;
  //                           display: block;
  //                           background: #fff;
  //                         \`;

  //                         // Append visible iframe
  //                         container.appendChild(visibleIframe);
  //                         console.log("[RUUT] ✅ Widget iframe loaded inside #ruut-container");

  //                         visibleIframe.addEventListener("load", () => {
  //                           console.log("[RUUT] 💬 Widget fully visible (direct):", src);
  //                         });

  //                       } else {
  //                         console.log("[RUUT] ⏳ Waiting for widget iframe src...");
  //                         setTimeout(tryMount, 500);
  //                       }
  //                     } else {
  //                       setTimeout(tryMount, 500);
  //                     }
  //                   };

  //                   tryMount();
  //                 };
  //               })(document, "script");
  //             } catch (err) {
  //               console.error("[RUUT] Widget script failed:", err);
  //             }
  //           };

  //           if (inSandbox) {
  //             console.log("[RUUT] Running in sandbox: disabling media devices");
  //             navigator.mediaDevices = undefined;
  //             runWidget();
  //           } else {
  //             runWidget();
  //           }
  //         })();
  //       `;

  //       //
  //       // Inject into Webflow Embed and iframe preview
  //       //
  //       setScript(sandboxSafeScript);

  //       if (window.webflow?.canvas) {
  //         await window.webflow.canvas.addNode({
  //           type: 'Embed',
  //           data: { code: sandboxSafeScript },
  //           parent: window.webflow.canvas.getSelectedNode()?.id || null
  //         });
  //       }

  //       setShowConfetti(true);
  //     }
  //   } catch (error) {
  //     console.error('❌ Failed to embed workspace:', error);
  //   }
  // };

  // // 🧩 Render inside iframe safely (no document.write)
  // useEffect(() => {
  //   if (!iframeRef.current || !script) return;

  //   const iframe = iframeRef.current;
  //   const doc = iframe.contentDocument || iframe.contentWindow.document;

  //   // Build iframe HTML safely
  //   const html = `
  //     <!DOCTYPE html>
  //     <html>
  //       <head>
  //         <meta charset="UTF-8" />
  //         <title>RUUT Widget Preview</title>
  //         <style>
  //           html, body {
  //             margin: 0;
  //             padding: 0;
  //             width: 100%;
  //             height: 100%;
  //             overflow: hidden;
  //             background: #fff;
  //             display: flex;
  //             justify-content: center;
  //             align-items: center;
  //           }
  //           #ruut-container {
  //             width: 100%;
  //             height: 100%;
  //             display: flex;
  //             justify-content: center;
  //             align-items: center;
  //             position: relative;
  //           }
  //           #loading {
  //             position: absolute;
  //             font-family: sans-serif;
  //             font-size: 14px;
  //             color: #666;
  //             animation: blink 1.5s infinite;
  //           }
  //           @keyframes blink {
  //             50% { opacity: 0.4; }
  //           }
  //           iframe {
  //             border: none;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div id="ruut-container">
  //           <div id="loading">Loading widget…</div>
  //         </div>
  //       </body>
  //     </html>
  //   `;

  //   doc.open();
  //   doc.write(html);
  //   doc.close();

  //   const injectedScript = doc.createElement('script');
  //   injectedScript.type = 'text/javascript';
  //   injectedScript.textContent = script;
  //   doc.body.appendChild(injectedScript);
  // }, [script]);

  // Embed the widget on Webflow site
  const handleEmbed = async (id) => {
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
      console.log('API data', data);

      if (data?.web_widget_script) {
        // 🧼 Clean escaped characters
        let widgetScript = data.web_widget_script.replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();

        if (widgetScript.startsWith('<script')) {
          const match = widgetScript.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
          if (match) widgetScript = match[1].trim();
        }

        console.log(
          '%c[RUUT DEBUG] Extracted widget script:',
          'color:#00bfa6;',
          widgetScript.slice(0, 200)
        );

        // ✅ Safe RUUT loader that uses <embed> instead of <iframe>
        const sandboxSafeScript = `
        (function() {
          const inSandbox = window.top !== window.self;

          const runWidget = function() {
            try {
              (function(d, t) {
                const BASE_URL = "https://app.ruut.chat";
                const TOKEN = "${data.website_token || 'pvoRCdKr8Foyv4iTGjKAUzgu'}";
                const g = d.createElement(t);
                const s = d.getElementsByTagName(t)[0];
                g.src = BASE_URL + "/packs/js/sdk.js";
                g.defer = true;
                g.async = true;
                s.parentNode.insertBefore(g, s);

                g.onload = function() {
                  console.log("[RUUT] ✅ SDK loaded");

                  try {
                    if (window.ruutSDK && window.ruutSDK.run) {
                      window.ruutSDK.run({ websiteToken: TOKEN, baseUrl: BASE_URL });
                      console.log("[RUUT] ✅ ruutSDK.run() called");
                    } else {
                      console.warn("[RUUT] ⚠️ ruutSDK not ready yet");
                    }
                  } catch (e) {
                    console.error("[RUUT] ❌ SDK run failed:", e);
                  }

                  const tryMount = () => {
                    const sdkIframe = d.querySelector("#chatwoot_live_chat_widget");
                    const container = d.querySelector("#ruut-container");

                    if (sdkIframe && container) {
                      const src = sdkIframe.src;
                      if (src && src.startsWith("https")) {
                        console.log("[RUUT] 🚀 Widget iframe detected:", src);

                        // Hide original iframe (SDK one)
                        sdkIframe.style.display = "none";

                        // Clear placeholder
                        container.innerHTML = "";

                        // 🧩 Create EMBED element instead of iframe
                        const embed = d.createElement("embed");
                        embed.src = src;
                        embed.type = "text/html";
                        embed.style.cssText = \`
                          width: 100%;
                          height: 100%;
                          border: none;
                          border-radius: 12px;
                          display: block;
                          background: #fff;
                        \`;

                        container.appendChild(embed);
                        console.log("[RUUT] ✅ Widget loaded via <embed>:", src);

                        embed.addEventListener("load", () => {
                          console.log("[RUUT] 💬 Embed fully visible:", src);
                        });
                      } else {
                        console.log("[RUUT] ⏳ Waiting for widget iframe src...");
                        setTimeout(tryMount, 500);
                      }
                    } else {
                      setTimeout(tryMount, 500);
                    }
                  };

                  tryMount();
                };
              })(document, "script");
            } catch (err) {
              console.error("[RUUT] Widget script failed:", err);
            }
          };

          if (inSandbox) {
            console.log("[RUUT] Running in sandbox: disabling media devices");
            navigator.mediaDevices = undefined;
            runWidget();
          } else {
            runWidget();
          }
        })();
      `;

        //
        // Inject into Webflow Embed and iframe preview
        //
        setScript(sandboxSafeScript);

        if (window.webflow?.canvas) {
          await window.webflow.canvas.addNode({
            type: 'Embed',
            data: { code: sandboxSafeScript },
            parent: window.webflow.canvas.getSelectedNode()?.id || null
          });
        }

        setShowConfetti(true);
      }
    } catch (error) {
      console.error('❌ Failed to embed workspace:', error);
    }
  };

  // 🧩 Render inside preview <iframeRef>, using <embed>
  useEffect(() => {
    if (!iframeRef.current || !script) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    // Build sandbox preview
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>RUUT Widget Preview</title>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          #ruut-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
          }
          #loading {
            position: absolute;
            font-family: sans-serif;
            font-size: 14px;
            color: #666;
            animation: blink 1.5s infinite;
          }
          @keyframes blink {
            50% { opacity: 0.4; }
          }
          embed {
            border: none;
          }
        </style>
      </head>
      <body>
        <div id="ruut-container">
          <div id="loading">Loading widget…</div>
        </div>
      </body>
    </html>
  `;

    doc.open();
    doc.write(html);
    doc.close();

    // Inject the sandbox-safe RUUT script
    const injectedScript = doc.createElement('script');
    injectedScript.type = 'text/javascript';
    injectedScript.textContent = script;
    doc.body.appendChild(injectedScript);
  }, [script]);

  return (
    <Modal
      style={{ fontFamily: 'Raleway' }}
      show={true}
      onHide={handleClose}
      centered
      dialogClassName="modal-dark"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} padding={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box component="img" src="/RUUT.png" alt="Ruut Logo" sx={{ width: 67, height: 24 }} />
        </Box>
        <IconButton
          className="closeBtn"
          onClick={() => (window.location.href = '/webflow/logout')}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Modal.Header closeButton className="w-100">
        <div className="bg-dark text-white d-flex flex-column mt-2">
          <Modal.Title>Select your workspace</Modal.Title>
          <small className="text-white mt-2">
            Don't have a workspace?{' '}
            <Link to="/create-workspace" className="text-info nav-links">
              Create One{' '}
            </Link>{' '}
          </small>
        </div>
      </Modal.Header>

      <Modal.Body>
        {workspaces.map((ws, i) => (
          <div
            key={i}
            className={`d-flex justify-content-between align-items-center p-3 mb-2 rounded cursor-pointer border ${
              selected === ws.id
                ? 'border-primary bg-primary text-white'
                : 'border-secondary text-light bg-workspace'
            }`}
            onClick={() => setSelected(ws.id)}
          >
            <span>{ws?.name}</span>

            {/* Toggle Switch */}
            <div className="form-check form-switch m-0">
              <div className="form-check form-switch m-0 custom-switch d-flex justify-content-between align-items-center gap-2">
                <input
                  style={{ width: 24, height: 12 }}
                  className="form-check-input cursor-pointer"
                  type="checkbox"
                  role="switch"
                  checked={selected === ws.id}
                  onChange={() => {
                    setSelected(selected === ws.id ? null : ws.id);
                  }}
                />
                {selected === ws.id && (
                  <Dropdown>
                    <Dropdown.Toggle
                      as="div"
                      bsPrefix="custom-toggle"
                      style={{ cursor: 'pointer', marginTop: 2 }}
                    >
                      <Image
                        src="/icons.png"
                        alt="Workspace"
                        width={12}
                        height={12}
                        style={{ cursor: 'pointer' }}
                      />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        as={Link}
                        to={{ pathname: `/customize/${ws.id}` }}
                        className="menu-workspace"
                      >
                        Customize Workspace
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/create-workspace" className="menu-workspace">
                        New Workspace
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </div>
          </div>
        ))}
      </Modal.Body>

      <Modal.Footer className="bg-dark text-white d-flex flex-column">
        <Button
          className="m-auto w-100"
          variant="primary"
          disabled={!selected}
          onClick={() => {
            handleEmbed(selected);
          }}
        >
          Proceed to embed
        </Button>
        <small className="text-white mt-4 m-auto">
          New workspace?{' '}
          <Link to="/create-workspace" className="text-info nav-links">
            Create One{' '}
          </Link>{' '}
        </small>
      </Modal.Footer>

      <Modal
        show={showConfetti}
        onHide={() => setShowConfetti(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            margin: '12.5% auto',
            width: '90%',
            maxWidth: 600,
            bgcolor: 'black', //background.paper',
            borderRadius: 2,
            color: 'white',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
            outline: 'none'
          }}
        >
          <Confetti
            style={{ margin: 'auto', marginLeft: '-6.25%' }}
            width={window.innerWidth}
            height={window.innerHeight}
          />

          {/* <img src="https://ruutchat.vercel.app" /> */}
          <iframe
            sandbox="allow-popups"
            ref={iframeRef}
            width="300"
            height="300"
            style={{
              display: 'block',
              margin: 'auto',
              backgroundColor: 'black',
              borderRadius: '100%'
            }}
            title="Preview Iframe"
          />

          <Typography id="modal-title" variant="h6" marginY={2} gutterBottom>
            Live Chat Embedded!
          </Typography>
          <Typography
            style={{ color: '#6f7994' }}
            id="modal-description"
            variant="body1"
            fontSize={14}
          >
            Your workspace is created and attached to your website. Once you launch your website,
            your live chat widget would be automatically active and working directly.
          </Typography>

          <Button
            style={{ backgroundColor: '#a450e9', color: 'white', width: '80%' }}
            sx={{ mt: 3 }}
            variant="contained"
            onClick={() => setShowConfetti(false)}
          >
            Close Widget
          </Button>
        </Box>
      </Modal>
    </Modal>
  );
}
