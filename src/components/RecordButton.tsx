import { Link } from 'react-router-dom'

interface Props {
  zh: string
  pinyin?: string
  en?: string
  size?: 'sm' | 'md'
  label?: string
}

export default function RecordButton({ zh, pinyin, en, size = 'sm', label }: Props) {
  const params = new URLSearchParams()
  params.set('zh', zh)
  if (pinyin) params.set('pinyin', pinyin)
  if (en) params.set('en', en)
  const href = `/record?${params.toString()}`
  return (
    <Link
      to={href}
      className={`record-btn record-btn-${size}`}
      title={`Record yourself saying ${zh}`}
      aria-label={`Record yourself saying ${zh}`}
    >
      🎙️{label ? <span className="record-btn-label">{label}</span> : null}
    </Link>
  )
}
