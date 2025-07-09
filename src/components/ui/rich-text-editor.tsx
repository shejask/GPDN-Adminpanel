// This component should be used only on the client side
// It's dynamically imported with { ssr: false } to avoid SSR issues

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-64 w-full border rounded-md flex items-center justify-center">Loading editor...</div>
})

// Import Quill styles
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'link', 'image'
]

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  // Use a state to track if component is mounted (client-side)
  const [mounted, setMounted] = useState(false)
  const [editorValue, setEditorValue] = useState(value || '')
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    setEditorValue(value || '')
  }, [value])
  
  const handleChange = (content: string) => {
    setEditorValue(content)
    onChange(content)
  }

  if (!mounted) {
    return <div className="h-64 w-full border rounded-md"></div>
  }

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-64"
      />
    </div>
  )
}

export default RichTextEditor
