'use client'
// 폼 제출 중이면 버튼을 잠그고 문구를 바꾸는 클라이언트 컴포넌트
// useFormStatus()는 자신을 감싼 <form>의 제출 상태를 알려 준다.
import { useFormStatus } from 'react-dom'

export default function SubmitButton({ children, pendingText = '처리 중…', className = '', ...props }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md px-4 py-2 font-semibold transition disabled:opacity-60 ${className}`}
      {...props}
    >
      {pending ? pendingText : children}
    </button>
  )
}
