import React, { useEffect, useRef, useState } from 'react';

interface SandboxProps {
  jsx: string;
  css: string;
  title?: string;
}

export default function Sandbox({ jsx, css, title = 'Component Preview' }: SandboxProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Clean and prepare the JSX code
    let cleanJSX = jsx.trim();

    // Remove any import/export statements
    cleanJSX = cleanJSX.replace(/^(import|export).*$/gm, '');

    // Ensure it's a complete function
    if (!cleanJSX.includes('function') && !cleanJSX.includes('const') && !cleanJSX.includes('let')) {
      cleanJSX = `function GeneratedComponent() {\n  ${cleanJSX}\n}`;
    }

    // Ensure proper ending
    if (!cleanJSX.endsWith('}')) {
      cleanJSX += '\n}';
    }

    // Create a complete HTML document with React
    const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background: #fff;
                        padding: 20px;
                    }
                    ${css}
                </style>
            </head>
            <body>
                <div id="root"></div>
                
                <!-- React and ReactDOM -->
                <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
                <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                
                <script type="text/babel">
                    try {
                        ${cleanJSX}
                        
                        const root = ReactDOM.createRoot(document.getElementById('root'));
                        root.render(React.createElement(GeneratedComponent || Component));
                        
                        // Notify parent that content is loaded
                        window.parent.postMessage({ type: 'SANDBOX_LOADED' }, '*');
                    } catch (error) {
                        document.getElementById('root').innerHTML = \`
                            <div style="color: red; padding: 20px; border: 1px solid red; border-radius: 4px; background: #fff5f5;">
                                <h3>Error rendering component:</h3>
                                <pre style="margin-top: 10px; white-space: pre-wrap;">\${error.message}</pre>
                                <div style="margin-top: 10px; font-size: 12px; color: #666;">
                                    <strong>Common fixes:</strong><br>
                                    • Ensure all JSX elements are properly closed<br>
                                    • Check for missing braces or parentheses<br>
                                    • Remove any import/export statements<br>
                                    • Use React.useState() instead of useState()
                                </div>
                            </div>
                        \`;
                        window.parent.postMessage({ type: 'SANDBOX_ERROR', error: error.message }, '*');
                    }
                </script>
            </body>
            </html>
        `;

    // Write content to iframe
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    setIsLoading(true);
    setError(null);

    // Listen for load completion
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SANDBOX_LOADED') {
        setIsLoading(false);
        setError(null);
      } else if (event.data.type === 'SANDBOX_ERROR') {
        setIsLoading(false);
        setError(event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);

    // Fallback timeout
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [jsx, css, title]);

  return (
    <div className="relative border rounded bg-white min-h-[300px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading component...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="text-center p-4">
            <div className="text-red-600 text-sm font-medium mb-2">Render Error</div>
            <div className="text-red-500 text-xs">{error}</div>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        title={title}
        className="w-full h-full min-h-[300px] border-0"
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
      />
    </div>
  );
} 