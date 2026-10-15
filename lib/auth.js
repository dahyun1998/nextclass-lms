// 현재 로그인 사용자와 프로필을 가져오는 도우미
// React의 cache()로 감싸면 한 번의 요청 안에서 여러 번 불러도 DB 조회는 한 번만 한다.
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) return null
  return { id: data.claims.sub, email: data.claims.email }
})

export const getProfile = cache(async () => {
  const user = await getUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('id', user.id)
    .single()
  return data
})
