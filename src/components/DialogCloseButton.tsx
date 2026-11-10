import { X } from 'lucide-react'

export function DialogCloseButton({ title,onClick }: { title: string; onClick: () => void }) {
  return <button type="button" className="btn btn-link link-light ms-auto p-1" aria-label="Close" title={title} onClick={onClick}>
    <X size={20} aria-hidden="true" />
  </button>
}
