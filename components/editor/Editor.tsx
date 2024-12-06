import { useEffect, useRef } from 'react'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import Quote from '@editorjs/quote'
import ImageTool from '@editorjs/image'
import Table from '@editorjs/table'
import Code from '@editorjs/code'
import InlineCode from '@editorjs/inline-code'
import Marker from '@editorjs/marker'
import Delimiter from '@editorjs/delimiter'
import Warning from '@editorjs/warning'
import LinkTool from '@editorjs/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface EditorProps {
  content: string
  onChange: (content: string) => void
}

export default function Editor({ content, onChange }: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: 'editor',
        tools: {
          header: {
            class: Header,
            config: {
              levels: [2, 3, 4],
              defaultLevel: 2,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile: async (file: File) => {
                  const { data, error } = await supabase.storage
                    .from('page-images')
                    .upload(`${Date.now()}-${file.name}`, file)

                  if (error) throw error

                  const { data: publicUrl } = supabase.storage
                    .from('page-images')
                    .getPublicUrl(data.path)

                  return {
                    success: 1,
                    file: {
                      url: publicUrl.publicUrl,
                    },
                  }
                },
              },
            },
          },
          table: {
            class: Table,
            inlineToolbar: true,
          },
          code: Code,
          inlineCode: {
            class: InlineCode,
          },
          marker: {
            class: Marker,
          },
          delimiter: Delimiter,
          warning: {
            class: Warning,
            inlineToolbar: true,
          },
          linkTool: {
            class: LinkTool,
          },
        },
        data: content ? JSON.parse(content) : undefined,
        onChange: async () => {
          const data = await editor.save()
          onChange(JSON.stringify(data))
        },
      })

      editorRef.current = editor
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [])

  return <div id="editor" className="prose max-w-none" />
}
