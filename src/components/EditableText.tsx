import { useState, useRef, useEffect } from 'react';

interface Props {
  children: string;
  style?: React.CSSProperties;
}

export default function EditableText({ children, style }: Props) {
  const [text, setText] = useState(children);
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isEditing || !ref.current) return;
    ref.current.innerText = text;
    ref.current.focus();
    const r = document.createRange();
    r.selectNodeContents(ref.current);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(r);
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = () => {
    if (ref.current) {
      const v = ref.current.innerText.trim();
      if (v) setText(v);
    }
    setIsEditing(false);
  };

  return (
    <span
      ref={ref}
      data-editable="true"
      contentEditable={isEditing}
      suppressContentEditableWarning
      onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); }
        if (e.key === 'Escape') {
          if (ref.current) ref.current.innerText = text;
          setIsEditing(false);
        }
      }}
      style={{
        outline: isEditing ? '1px solid rgba(93,202,165,0.5)' : '1px dashed rgba(93,202,165,0.2)',
        borderRadius: 3,
        padding: '1px 3px',
        cursor: isEditing ? 'text' : 'pointer',
        whiteSpace: 'pre-wrap',
        transition: 'outline 0.15s',
        ...style,
      }}
      title={isEditing ? undefined : '클릭하여 수정'}
    >
      {!isEditing ? text : null}
    </span>
  );
}
