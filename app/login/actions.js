'use server'
// Server Action: 이 파일의 함수들은 서버에서만 실행된다.
// <form action={login}> 처럼 연결하면 폼 데이터(FormData)를 받는다.
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function login(formData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (error) {
    redirect('/login?message=' + encodeURIComponent('이메일 또는 비밀번호를 확인하세요.'))
  }

  revalidatePath('/', 'layout') // 상단 메뉴(로그인 상태)를 새로 그린다
  redirect(formData.get('next') || '/my')
}

export async function signup(formData) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: formData.get('email'),
    password: formData.get('password'),
    options: {
      // 여기 넣은 값이 raw_user_meta_data 로 저장 → DB 트리거가 profiles 에 복사
      data: { name: formData.get('name'), role: formData.get('role') },
    },
  })

  if (error) {
    redirect('/login?message=' + encodeURIComponent('가입 실패: ' + error.message))
  }

  // Supabase의 "Confirm email"이 켜져 있으면 세션이 없다 → 메일 확인 안내
  if (!data.session) {
    redirect('/login?message=' + encodeURIComponent('가입 확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인하세요.'))
  }

  revalidatePath('/', 'layout')
  redirect('/my')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
