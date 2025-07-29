import React, { useState } from 'react';
import { FaMagic, FaCrosshairs, FaTimes } from 'react-icons/fa';

interface ElementTarget {
    id: string;
    tagName: string;
    className?: string;
    textContent?: string;
    description: string;
}

interface ChatOverridesProps {
    selectedElement: ElementTarget | null;
    onClose: () => void;
    onOverrideRequest: (elementId: string, prompt: string) => void;
    isProcessing: boolean;
}

export default function ChatOverrides({
    selectedElement,
    onClose,
    onOverrideRequest,
    isProcessing
}: ChatOverridesProps) {
    const [prompt, setPrompt] = useState('');
    const [suggestions] = useState([
        "Make this button have 24px vertical padding, a teal-to-blue gradient, and uppercase text",
        "Change the background to a dark theme with white text",
        "Add a subtle shadow and increase the border radius to 12px",
        "Make the text bold and increase font size to 18px",
        "Apply a hover effect with scale transform and color transition",
        "Add a border with rounded corners and a light background",
        "Make this element responsive with flexbox layout",
        "Apply a modern glassmorphism effect with backdrop blur"
    ]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedElement || !prompt.trim()) return;

        onOverrideRequest(selectedElement.id, prompt);
        setPrompt('');
    };

    const handleSuggestionClick = (suggestion: string) => {
        setPrompt(suggestion);
    };

    if (!selectedElement) return null;

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-300 rounded-lg shadow-xl z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <FaMagic className="text-purple-500" />
                    <div>
                        <h3 className="font-semibold text-gray-800">Chat-Driven Overrides</h3>
                        <p className="text-sm text-gray-500">
                            Target: {selectedElement.tagName.toLowerCase()}
                            {selectedElement.className && `.${selectedElement.className}`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition"
                >
                    <FaTimes />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Selected Element Info */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <FaCrosshairs className="text-blue-500" />
                        <span className="font-medium text-blue-800">Selected Element</span>
                    </div>
                    <p className="text-sm text-blue-700">{selectedElement.description}</p>
                    {selectedElement.textContent && (
                        <p className="text-xs text-blue-600 mt-1">
                            Text: "{selectedElement.textContent}"
                        </p>
                    )}
                </div>

                {/* Prompt Input */}
                <form onSubmit={handleSubmit} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe the changes you want:
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Make this button have 24px vertical padding, a teal-to-blue gradient, and uppercase text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                        rows={3}
                        disabled={isProcessing}
                    />
                    <button
                        type="submit"
                        disabled={!prompt.trim() || isProcessing}
                        className="mt-2 w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <FaMagic />
                                Apply Changes
                            </>
                        )}
                    </button>
                </form>

                {/* Suggestions */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quick Suggestions:
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tips */}
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">💡 Tips:</h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Be specific about colors, sizes, and effects</li>
                        <li>• Mention CSS properties like padding, margin, border-radius</li>
                        <li>• Describe visual effects like shadows, gradients, animations</li>
                        <li>• Use natural language - AI will understand your intent</li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 