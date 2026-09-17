"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface AccessibilityEditorProps {
  content: string;
  onUpdate: (html: string) => void;
}

export default function AccessibilityEditor({ content, onUpdate }: AccessibilityEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '<p>Descreva aqui suas necessidades especiais para o motorista...</p>',
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert focus:outline-none min-h-[150px] p-4 bg-white/5 rounded-2xl border border-white/10 text-white',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${editor.isActive('bold') ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
        >
          Negrito
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${editor.isActive('italic') ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
        >
          Itálico
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${editor.isActive('bulletList') ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
        >
          Lista
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
