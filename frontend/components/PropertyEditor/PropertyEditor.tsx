import React, { useState, useEffect } from 'react';
import { FaTimes, FaPalette, FaFont, FaArrowsAlt, FaBorderStyle } from 'react-icons/fa';

interface ElementProperty {
    id: string;
    tagName: string;
    className?: string;
    textContent?: string;
    styles: {
        padding?: string;
        fontSize?: string;
        backgroundColor?: string;
        color?: string;
        border?: string;
        borderRadius?: string;
        boxShadow?: string;
    };
}

interface PropertyEditorProps {
    selectedElement: ElementProperty | null;
    onClose: () => void;
    onPropertyChange: (elementId: string, property: string, value: string) => void;
    onTextChange: (elementId: string, text: string) => void;
}

export default function PropertyEditor({
    selectedElement,
    onClose,
    onPropertyChange,
    onTextChange
}: PropertyEditorProps) {
    const [localStyles, setLocalStyles] = useState<ElementProperty['styles']>({});
    const [localText, setLocalText] = useState('');

    useEffect(() => {
        if (selectedElement) {
            setLocalStyles(selectedElement.styles);
            setLocalText(selectedElement.textContent || '');
        }
    }, [selectedElement]);

    if (!selectedElement) return null;

    const handleStyleChange = (property: string, value: string) => {
        const newStyles = { ...localStyles, [property]: value };
        setLocalStyles(newStyles);
        onPropertyChange(selectedElement.id, property, value);
    };

    const handleTextChange = (text: string) => {
        setLocalText(text);
        onTextChange(selectedElement.id, text);
    };

    const getPropertyValue = (property: string) => {
        return localStyles[property as keyof typeof localStyles] || '';
    };

    const parseNumericValue = (value: string) => {
        const match = value.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    };

    return (
        <div className="fixed top-4 right-4 w-80 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                    <h3 className="font-semibold text-gray-800">Property Editor</h3>
                    <p className="text-sm text-gray-500">
                        {selectedElement.tagName.toLowerCase()}
                        {selectedElement.className && `.${selectedElement.className}`}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition"
                >
                    <FaTimes />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
                {/* Text Content */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FaFont className="text-blue-500" />
                        <label className="font-medium text-gray-700">Text Content</label>
                    </div>
                    <input
                        type="text"
                        value={localText}
                        onChange={(e) => handleTextChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter text content..."
                    />
                </div>

                {/* Size Controls */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <FaArrowsAlt className="text-green-500" />
                        <label className="font-medium text-gray-700">Size & Spacing</label>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Padding (px)</label>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                value={parseNumericValue(getPropertyValue('padding'))}
                                onChange={(e) => handleStyleChange('padding', `${e.target.value}px`)}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0px</span>
                                <span>{getPropertyValue('padding')}</span>
                                <span>50px</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Font Size (px)</label>
                            <input
                                type="range"
                                min="8"
                                max="48"
                                value={parseNumericValue(getPropertyValue('fontSize'))}
                                onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>8px</span>
                                <span>{getPropertyValue('fontSize')}</span>
                                <span>48px</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Color Controls */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <FaPalette className="text-purple-500" />
                        <label className="font-medium text-gray-700">Colors</label>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Background Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={getPropertyValue('backgroundColor') || '#ffffff'}
                                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                    className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={getPropertyValue('backgroundColor') || ''}
                                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                                    placeholder="#ffffff"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Text Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={getPropertyValue('color') || '#000000'}
                                    onChange={(e) => handleStyleChange('color', e.target.value)}
                                    className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={getPropertyValue('color') || ''}
                                    onChange={(e) => handleStyleChange('color', e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Border & Shadow Controls */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <FaBorderStyle className="text-orange-500" />
                        <label className="font-medium text-gray-700">Border & Shadow</label>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Border Radius (px)</label>
                            <input
                                type="range"
                                min="0"
                                max="20"
                                value={parseNumericValue(getPropertyValue('borderRadius'))}
                                onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0px</span>
                                <span>{getPropertyValue('borderRadius')}</span>
                                <span>20px</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Border</label>
                            <input
                                type="text"
                                value={getPropertyValue('border') || ''}
                                onChange={(e) => handleStyleChange('border', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                                placeholder="1px solid #ccc"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Box Shadow</label>
                            <input
                                type="text"
                                value={getPropertyValue('boxShadow') || ''}
                                onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                                placeholder="0 2px 4px rgba(0,0,0,0.1)"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Presets */}
                <div>
                    <label className="block font-medium text-gray-700 mb-2">Quick Presets</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => {
                                handleStyleChange('backgroundColor', '#3b82f6');
                                handleStyleChange('color', '#ffffff');
                                handleStyleChange('borderRadius', '8px');
                                handleStyleChange('padding', '12px 24px');
                            }}
                            className="p-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                        >
                            Blue Button
                        </button>
                        <button
                            onClick={() => {
                                handleStyleChange('backgroundColor', '#10b981');
                                handleStyleChange('color', '#ffffff');
                                handleStyleChange('borderRadius', '6px');
                                handleStyleChange('padding', '8px 16px');
                            }}
                            className="p-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                        >
                            Green Button
                        </button>
                        <button
                            onClick={() => {
                                handleStyleChange('backgroundColor', '#f59e0b');
                                handleStyleChange('color', '#ffffff');
                                handleStyleChange('borderRadius', '20px');
                                handleStyleChange('padding', '10px 20px');
                            }}
                            className="p-2 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                        >
                            Rounded Button
                        </button>
                        <button
                            onClick={() => {
                                handleStyleChange('backgroundColor', '#ffffff');
                                handleStyleChange('color', '#374151');
                                handleStyleChange('border', '1px solid #d1d5db');
                                handleStyleChange('borderRadius', '4px');
                                handleStyleChange('padding', '8px 12px');
                            }}
                            className="p-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                        >
                            Outline Button
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 