// 유튜브 주소에서 영상 ID만 뽑아낸다.
// https://www.youtube.com/watch?v=abc123  /  https://youtu.be/abc123  → "abc123"
export function getYouTubeId(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2]
      return u.searchParams.get('v')
    }
  } catch {
    return null
  }
  return null
}

// 진도율(%) 계산: 완료 수 ÷ 전체 강의 수
export function percent(done, total) {
  if (!total) return 0
  return Math.round((done / total) * 100)
}

// 카테고리별 썸네일 색 (이미지 대신 그라데이션)
export const CATEGORY_STYLE = {
  프로그래밍: 'from-indigo-600 to-sky-500',
  데이터: 'from-emerald-600 to-teal-400',
  AI: 'from-fuchsia-600 to-rose-400',
  디자인: 'from-amber-500 to-orange-400',
}

export const CATEGORIES = ['프로그래밍', '데이터', 'AI', '디자인']
export const LEVELS = ['입문', '초급', '중급']
