import type { Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline,
  Heading1, Heading2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered,
  Indent, Outdent,
} from 'lucide-react'
import type { ToolbarKey } from '../types'

interface ToolbarProps {
  editor: Editor
  buttons: ToolbarKey[]
}

interface ButtonConfig {
  label: string
  icon: React.ReactNode
  isActive: () => boolean
  action: () => void
}

function Sep() {
  return <span className="ink-toolbar-sep" aria-hidden="true" />
}

export function Toolbar({ editor, buttons }: ToolbarProps) {
  const iconSize = 16

  const allGroups: { key: ToolbarKey; configs: ButtonConfig[] }[] = [
    {
      key: 'bold',
      configs: [{
        label: 'Bold',
        icon: <Bold size={iconSize} />,
        isActive: () => editor.isActive('bold'),
        action: () => editor.chain().focus().toggleBold().run(),
      }],
    },
    {
      key: 'italic',
      configs: [{
        label: 'Italic',
        icon: <Italic size={iconSize} />,
        isActive: () => editor.isActive('italic'),
        action: () => editor.chain().focus().toggleItalic().run(),
      }],
    },
    {
      key: 'underline',
      configs: [{
        label: 'Underline',
        icon: <Underline size={iconSize} />,
        isActive: () => editor.isActive('underline'),
        action: () => editor.chain().focus().toggleUnderline().run(),
      }],
    },
    {
      key: 'h1',
      configs: [{
        label: 'Heading 1',
        icon: <Heading1 size={iconSize} />,
        isActive: () => editor.isActive('heading', { level: 1 }),
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      }],
    },
    {
      key: 'h2',
      configs: [{
        label: 'Heading 2',
        icon: <Heading2 size={iconSize} />,
        isActive: () => editor.isActive('heading', { level: 2 }),
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      }],
    },
    {
      key: 'align',
      configs: [
        {
          label: 'Align left',
          icon: <AlignLeft size={iconSize} />,
          isActive: () => editor.isActive({ textAlign: 'left' }),
          action: () => editor.chain().focus().setTextAlign('left').run(),
        },
        {
          label: 'Align center',
          icon: <AlignCenter size={iconSize} />,
          isActive: () => editor.isActive({ textAlign: 'center' }),
          action: () => editor.chain().focus().setTextAlign('center').run(),
        },
        {
          label: 'Align right',
          icon: <AlignRight size={iconSize} />,
          isActive: () => editor.isActive({ textAlign: 'right' }),
          action: () => editor.chain().focus().setTextAlign('right').run(),
        },
        {
          label: 'Justify',
          icon: <AlignJustify size={iconSize} />,
          isActive: () => editor.isActive({ textAlign: 'justify' }),
          action: () => editor.chain().focus().setTextAlign('justify').run(),
        },
      ],
    },
    {
      key: 'list',
      configs: [
        {
          label: 'Bullet list',
          icon: <List size={iconSize} />,
          isActive: () => editor.isActive('bulletList'),
          action: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
          label: 'Ordered list',
          icon: <ListOrdered size={iconSize} />,
          isActive: () => editor.isActive('orderedList'),
          action: () => editor.chain().focus().toggleOrderedList().run(),
        },
      ],
    },
    {
      key: 'indent',
      configs: [
        {
          label: 'Indent',
          icon: <Indent size={iconSize} />,
          isActive: () => false,
          action: () => editor.chain().focus().sinkListItem('listItem').run(),
        },
        {
          label: 'Outdent',
          icon: <Outdent size={iconSize} />,
          isActive: () => false,
          action: () => editor.chain().focus().liftListItem('listItem').run(),
        },
      ],
    },
  ]

  const activeGroups = allGroups.filter((g) => buttons.includes(g.key))

  return (
    <div className="ink-toolbar" role="toolbar" aria-label="Text formatting">
      {activeGroups.map((group, gi) => (
        <span key={group.key} className="ink-toolbar-group">
          {group.configs.map((cfg) => (
            <button
              key={cfg.label}
              type="button"
              className={`ink-toolbar-btn${cfg.isActive() ? ' ink-toolbar-btn--active' : ''}`}
              onClick={cfg.action}
              aria-label={cfg.label}
              title={cfg.label}
            >
              {cfg.icon}
            </button>
          ))}
          {gi < activeGroups.length - 1 && <Sep />}
        </span>
      ))}
    </div>
  )
}
