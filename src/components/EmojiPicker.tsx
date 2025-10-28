'use client'

import { useState, useRef, useEffect } from 'react'
import { EmojiPicker } from 'frimousse'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface CustomEmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  label?: string
}

export function CustomEmojiPicker({ value, onChange, label = 'Icon (Emoji)' }: CustomEmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>

      <div className="flex items-center gap-2 w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-shrink-0 h-9 w-12 border border-slate-300 rounded-md bg-white text-xl hover:bg-slate-50 transition-colors flex items-center justify-center"
        >
          {value || '😊'}
        </button>

        <div className="flex-1 flex items-center gap-1 min-w-0">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="💚"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
          />

          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute top-full left-0 mt-2 z-50 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden"
          style={{ width: 'max(320px, 100vw - 2rem)' }}
        >
          <style>{`
            .frimousse__root {
              width: 100%;
              padding: 0.75rem;
            }
            .frimousse__search {
              width: 100%;
              margin-bottom: 0.75rem;
            }
            .frimousse__search input {
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #e2e8f0;
              border-radius: 0.375rem;
              font-size: 0.875rem;
              box-sizing: border-box;
            }
            .frimousse__search input:focus {
              outline: none;
              border-color: #3b82f6;
              box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            }
            .frimousse__viewport {
              height: 300px;
              overflow-y: auto;
              overflow-x: hidden;
            }
            .frimousse__viewport::-webkit-scrollbar {
              width: 6px;
            }
            .frimousse__viewport::-webkit-scrollbar-track {
              background: #f1f5f9;
            }
            .frimousse__viewport::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 3px;
            }
            .frimousse__list {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
              gap: 0.25rem;
              padding: 0;
              margin: 0;
            }
            .frimousse__emoji {
              padding: 0.25rem;
              border-radius: 0.375rem;
              cursor: pointer;
              font-size: 1.25rem;
              transition: background-color 0.15s, transform 0.15s;
              display: flex;
              align-items: center;
              justify-content: center;
              border: none;
              background: transparent;
              line-height: 1;
              min-height: 32px;
            }
            .frimousse__emoji:hover {
              background-color: #f1f5f9;
              transform: scale(1.1);
            }
            .frimousse__category-title {
              font-size: 0.7rem;
              font-weight: 700;
              color: #94a3b8;
              padding: 0.5rem 0.5rem 0.25rem;
              margin: 0.5rem 0 0.25rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          `}</style>
          <EmojiPicker.Root
            onEmojiSelect={(emoji: any) => {
              onChange(emoji.native)
              setIsOpen(false)
            }}
          >
            <EmojiPicker.Search />
            <EmojiPicker.Viewport>
              <EmojiPicker.Loading>Loading…</EmojiPicker.Loading>
              <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
              <EmojiPicker.List />
            </EmojiPicker.Viewport>
          </EmojiPicker.Root>
        </div>
      )}
    </div>
  )
}
