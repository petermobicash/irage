import React, { useState, useCallback, useRef } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, Link, 
  Quote, Code, Type, Palette, AlignLeft, AlignCenter, 
  AlignRight, Image, X
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  height?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter your text...',
  disabled = false,
  height = '200px',
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const colors = [
    '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB',
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#F97316', '#84CC16', '#06B6D4', '#6366F1'
  ];

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleFormat = useCallback((command: string, value?: string) => {
    if (disabled) return;
    execCommand(command, value);
  }, [disabled, execCommand]);

  const handleLink = useCallback(() => {
    if (linkUrl && linkText) {
      handleFormat('createLink', linkUrl);
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  }, [linkUrl, linkText, handleFormat]);

  const handleImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      handleFormat('insertImage', url);
    }
  }, [handleFormat]);

  const handleColor = useCallback((color: string) => {
    handleFormat('foreColor', color);
    setShowColorPicker(false);
  }, [handleFormat]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
    { icon: Code, command: 'formatBlock', value: 'pre', title: 'Code Block' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  ];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            {toolbarButtons.map(({ icon: Icon, command, value: cmdValue, title }) => (
              <button
                key={command}
                type="button"
                onClick={() => handleFormat(command, cmdValue)}
                disabled={disabled}
                title={title}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon className="w-4 h-4 text-gray-700" />
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Color Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                disabled={disabled}
                title="Text Color"
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Palette className="w-4 h-4 text-gray-700" />
              </button>
              
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="grid grid-cols-5 gap-1">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColor(color)}
                        className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Link Button */}
            <button
              type="button"
              onClick={() => setShowLinkDialog(true)}
              disabled={disabled}
              title="Insert Link"
              className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Link className="w-4 h-4 text-gray-700" />
            </button>

            {/* Image Button */}
            <button
              type="button"
              onClick={handleImage}
              disabled={disabled}
              title="Insert Image"
              className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Image className="w-4 h-4 text-gray-700" />
            </button>

            {/* Preview Toggle */}
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title={isPreview ? 'Edit' : 'Preview'}
            >
              <Type className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div style={{ height }} className="relative">
        {isPreview ? (
          <div 
            className="p-4 h-full overflow-y-auto prose prose-sm max-w-none bg-white"
            dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-500">No content</p>' }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleInput}
            onPaste={handlePaste}
            suppressContentEditableWarning
            className={`p-4 h-full overflow-y-auto outline-none bg-white ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'
            }`}
            style={{ 
              minHeight: height,
              wordBreak: 'break-word'
            }}
            dangerouslySetInnerHTML={{ __html: value || `<p class="text-gray-500">${placeholder}</p>` }}
          />
        )}
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Insert Link</h3>
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLink}
                disabled={!linkUrl || !linkText}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;