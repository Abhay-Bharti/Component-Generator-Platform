import React from 'react';

interface Code {
    jsx: string;
    css: string;
}

interface CodeEditorProps {
    code: Code;
    setCode: (code: Code) => void;
}

export default function CodeEditor({ code, setCode }: CodeEditorProps) {
    return (
        <div className="h-full flex flex-col gap-4">
            {/* JSX Editor */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">JSX/TSX</h3>
                </div>
                <textarea
                    className="w-full h-full p-4 border border-gray-300 rounded-lg bg-white text-gray-800 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={code.jsx}
                    onChange={e => setCode({ ...code, jsx: e.target.value })}
                    placeholder="// Your JSX/TSX code here..."
                    spellCheck={false}
                />
            </div>

            {/* CSS Editor */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">CSS</h3>
                </div>
                <textarea
                    className="w-full h-full p-4 border border-gray-300 rounded-lg bg-white text-gray-800 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={code.css}
                    onChange={e => setCode({ ...code, css: e.target.value })}
                    placeholder="/* Your CSS styles here */"
                    spellCheck={false}
                />
            </div>
        </div>
    );
} 