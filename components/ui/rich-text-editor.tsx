"use client"

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import { useState, useEffect, useCallback } from "react"
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LinkIcon,
  ImageIcon,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Type,
  Quote,
  Code,
  Trash2,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your content here...",
  className = "",
  minHeight = "300px",
}: RichTextEditorProps) {
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-neo-mint dark:text-purist-blue underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full my-4",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert prose-sm sm:prose-base max-w-none focus:outline-none",
          "prose-headings:font-bold prose-headings:text-foreground",
          "prose-p:text-foreground prose-strong:text-foreground",
          "prose-a:text-neo-mint dark:prose-a:text-purist-blue",
          "prose-img:rounded-lg",
          "prose-code:bg-muted prose-code:p-1 prose-code:rounded",
          "prose-blockquote:border-l-4 prose-blockquote:border-neo-mint dark:prose-blockquote:border-purist-blue prose-blockquote:pl-4 prose-blockquote:italic",
        ),
        style: minHeight,
      },
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const setLink = useCallback(() => {
    if (!editor) return

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    // Add https:// if not present
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    setIsLinkPopoverOpen(false)
    setLinkUrl("")
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (!editor) return

    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setIsImagePopoverOpen(false)
      setImageUrl("")
    }
  }, [editor, imageUrl])

  if (!isMounted) {
    return null
  }

  if (!editor) {
    return null
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative border rounded-lg overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl",
          className,
        )}
      >
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-md", editor.isActive("bold") && "bg-white/40 dark:bg-gray-700/40")}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="h-4 w-4" />
                <span className="sr-only">Bold</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-md", editor.isActive("italic") && "bg-white/40 dark:bg-gray-700/40")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="h-4 w-4" />
                <span className="sr-only">Italic</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-md", editor.isActive("underline") && "bg-white/40 dark:bg-gray-700/40")}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <UnderlineIcon className="h-4 w-4" />
                <span className="sr-only">Underline</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-md",
                  editor.isActive("heading", { level: 1 }) && "bg-white/40 dark:bg-gray-700/40",
                )}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                <Heading1 className="h-4 w-4" />
                <span className="sr-only">Heading 1</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-md",
                  editor.isActive("heading", { level: 2 }) && "bg-white/40 dark:bg-gray-700/40",
                )}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <Heading2 className="h-4 w-4" />
                <span className="sr-only">Heading 2</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-md", editor.isActive("paragraph") && "bg-white/40 dark:bg-gray-700/40")}
                onClick={() => editor.chain().focus().setParagraph().run()}
              >
                <Type className="h-4 w-4" />
                <span className="sr-only">Paragraph</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Paragraph</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-md", editor.isActive("bulletList") && "bg-white/40 dark:bg-gray-700/40")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">Bullet List</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-md",
                  editor.isActive("orderedList") && "bg-white/40 dark:bg-gray-700/40",
                )}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="h-4 w-4" />
                <span className="sr-only">Ordered List</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ordered List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-md", editor.isActive("blockquote") && "bg-white/40 dark:bg-gray-700/40")}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                <Quote className="h-4 w-4" />
                <span className="sr-only">Blockquote</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Blockquote</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-md", editor.isActive("codeBlock") && "bg-white/40 dark:bg-gray-700/40")}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              >
                <Code className="h-4 w-4" />
                <span className="sr-only">Code Block</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Code Block</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-md",
                  editor.isActive({ textAlign: "left" }) && "bg-white/40 dark:bg-gray-700/40",
                )}
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
              >
                <AlignLeft className="h-4 w-4" />
                <span className="sr-only">Align Left</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Left</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-md",
                  editor.isActive({ textAlign: "center" }) && "bg-white/40 dark:bg-gray-700/40",
                )}
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
              >
                <AlignCenter className="h-4 w-4" />
                <span className="sr-only">Align Center</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Center</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-md",
                  editor.isActive({ textAlign: "right" }) && "bg-white/40 dark:bg-gray-700/40",
                )}
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
              >
                <AlignRight className="h-4 w-4" />
                <span className="sr-only">Align Right</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Right</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-8 w-8 rounded-md", editor.isActive("link") && "bg-white/40 dark:bg-gray-700/40")}
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span className="sr-only">Link</span>
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Link</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent className="w-80 p-3">
              <div className="space-y-2">
                <h4 className="font-medium">Insert Link</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        setLink()
                      }
                    }}
                  />
                  <Button size="sm" onClick={setLink}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsLinkPopoverOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {editor.isActive("link") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-2 h-8"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Link
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={isImagePopoverOpen} onOpenChange={setIsImagePopoverOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                      <ImageIcon className="h-4 w-4" />
                      <span className="sr-only">Image</span>
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Image</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent className="w-80 p-3">
              <div className="space-y-2">
                <h4 className="font-medium">Insert Image</h4>
                <Tabs defaultValue="url">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="upload" disabled>
                      Upload
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addImage()
                          }
                        }}
                      />
                      <Button size="sm" onClick={addImage}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsImagePopoverOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
              >
                <Undo className="h-4 w-4" />
                <span className="sr-only">Undo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
              >
                <Redo className="h-4 w-4" />
                <span className="sr-only">Redo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        </div>

        <div className="p-4">
          <EditorContent editor={editor} />
        </div>

        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border shadow-lg">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-md", editor.isActive("bold") && "bg-white/40 dark:bg-gray-700/40")}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="h-4 w-4" />
                <span className="sr-only">Bold</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-md", editor.isActive("italic") && "bg-white/40 dark:bg-gray-700/40")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="h-4 w-4" />
                <span className="sr-only">Italic</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-md", editor.isActive("underline") && "bg-white/40 dark:bg-gray-700/40")}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <UnderlineIcon className="h-4 w-4" />
                <span className="sr-only">Underline</span>
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 rounded-md", editor.isActive("link") && "bg-white/40 dark:bg-gray-700/40")}
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span className="sr-only">Link</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3">
                  <div className="space-y-2">
                    <h4 className="font-medium">Insert Link</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            setLink()
                          }
                        }}
                      />
                      <Button size="sm" onClick={setLink}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                    {editor.isActive("link") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-2 h-8"
                        onClick={() => editor.chain().focus().unsetLink().run()}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Link
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </BubbleMenu>
        )}
      </div>
    </TooltipProvider>
  )
}
