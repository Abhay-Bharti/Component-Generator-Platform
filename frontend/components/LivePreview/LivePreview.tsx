import React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

interface LivePreviewProps {
    jsx: string;
    css: string;
    onElementSelect?: (element: any) => void;
}

export default function LivePreviewComponent({ jsx, css, onElementSelect }: LivePreviewProps) {
    // Combine JSX and CSS into a complete component
    const completeCode = `
${jsx}

// Add CSS styles
const styles = \`${css}\`;

// Inject styles into document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
`;

    return (
        <div className="flex-1 p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-2">Live Preview</h2>
            <div className="border rounded-lg overflow-hidden">
                <LiveProvider code={completeCode} noInline={false}>
                    <div className="p-4 bg-gray-50 border-b">
                        <LiveError className="text-red-600 text-sm" />
                    </div>
                    <div className="p-4 bg-white">
                        <LivePreview />
                    </div>
                </LiveProvider>
            </div>
        </div>
    );
} 