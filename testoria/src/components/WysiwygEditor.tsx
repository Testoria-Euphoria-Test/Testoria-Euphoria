"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function WysiwygEditor({
  value,
  onChange,
  placeholder = "Enter description...",
  disabled = false,
  className = "",
}: WysiwygEditorProps) {
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingFromProps = useRef(false);
  const lastValue = useRef(value);

  // Optimized onChange with throttling instead of debouncing for better UX
  const optimizedOnChange = useCallback(
    (newValue: string) => {
      // Only trigger if value actually changed
      if (lastValue.current === newValue) return;

      lastValue.current = newValue;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        onChange(newValue);
      }, 150); // Reduced to 150ms for better responsiveness
    },
    [onChange]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!isUpdatingFromProps.current) {
        const html = editor.getHTML();
        optimizedOnChange(html);
      }
    },
    editable: !disabled,
    immediatelyRender: false,
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      isUpdatingFromProps.current = true;
      editor.commands.setContent(value, false);
      isUpdatingFromProps.current = false;
    }
  }, [editor, value]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  if (!editor) {
    return <div className="w-full h-32 bg-gray-100 rounded-lg animate-pulse" />;
  }

  return (
    <div
      className={`tiptap-container border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${
        disabled ? "bg-gray-50" : "bg-white"
      } ${className}`}
    >
      {/* Toolbar */}
      {!disabled && (
        <div className="border-b border-gray-200 bg-gray-50 p-2 flex items-center gap-1 flex-wrap">
          {/* Headings */}
          <select
            onChange={(e) => {
              const level = parseInt(e.target.value);
              if (level === 0) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: level as 1 | 2 | 3 })
                  .run();
              }
            }}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
            value={
              editor.isActive("heading", { level: 1 })
                ? 1
                : editor.isActive("heading", { level: 2 })
                ? 2
                : editor.isActive("heading", { level: 3 })
                ? 3
                : 0
            }
          >
            <option value={0}>Paragraph</option>
            <option value={1}>Heading 1</option>
            <option value={2}>Heading 2</option>
            <option value={3}>Heading 3</option>
          </select>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Formatting buttons */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("bold")
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600"
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("italic")
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600"
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* List buttons */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("bulletList")
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600"
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("orderedList")
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600"
            }`}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive("blockquote")
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600"
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Undo/Redo buttons */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Content */}
      <div className="wysiwyg-content">
        <EditorContent
          editor={editor}
          className={`min-h-[120px] p-4 focus:outline-none ${
            disabled ? "text-gray-500" : ""
          }`}
        />
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .tiptap-container .ProseMirror {
          outline: none;
          min-height: 120px;
          font-family: inherit;
          line-height: 1.6;
          color: #374151;
        }

        .tiptap-container .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: "${placeholder}";
          float: left;
          height: 0;
          pointer-events: none;
        }

        .tiptap-container .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 2.25rem;
          margin: 1.5rem 0 0.75rem 0;
          color: #111827;
        }

        .tiptap-container .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 2rem;
          margin: 1.25rem 0 0.625rem 0;
          color: #111827;
        }

        .tiptap-container .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.75rem;
          margin: 1rem 0 0.5rem 0;
          color: #111827;
        }

        .tiptap-container .ProseMirror p {
          margin: 0.75rem 0;
          line-height: 1.7;
          color: #374151;
        }

        .tiptap-container .ProseMirror ul,
        .tiptap-container .ProseMirror ol {
          margin: 0.75rem 0;
          padding-left: 1.75rem;
        }

        .tiptap-container .ProseMirror ul {
          list-style-type: disc;
        }

        .tiptap-container .ProseMirror ol {
          list-style-type: decimal;
        }

        .tiptap-container .ProseMirror li {
          margin: 0.375rem 0;
          line-height: 1.6;
          color: #374151;
        }

        .tiptap-container .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.25rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
          background-color: #f8fafc;
          padding: 1rem 1.25rem;
          border-radius: 0.375rem;
        }

        .tiptap-container .ProseMirror strong {
          font-weight: 600;
          color: #111827;
        }

        .tiptap-container .ProseMirror em {
          font-style: italic;
        }

        .tiptap-container .ProseMirror code {
          background-color: #f3f4f6;
          border-radius: 0.25rem;
          padding: 0.125rem 0.375rem;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas,
            "Liberation Mono", Menlo, monospace;
          font-size: 0.875em;
          color: #dc2626;
          border: 1px solid #e5e7eb;
        }

        .tiptap-container .ProseMirror pre {
          background-color: #1f2937;
          color: #f9fafb;
          border-radius: 0.5rem;
          padding: 1.25rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid #374151;
        }

        .tiptap-container .ProseMirror pre code {
          background: none;
          padding: 0;
          color: #f9fafb;
          border: none;
        }

        /* Better spacing for first and last elements */
        .tiptap-container .ProseMirror > :first-child {
          margin-top: 0;
        }

        .tiptap-container .ProseMirror > :last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
