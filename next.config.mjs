/** @type {import('next').NextConfig} */
const nextConfig = {
  // create-next-app(16.4)이 기본으로 켜는 cacheComponents·partialPrefetching 두 줄은
  // 이번 실습 범위를 넘으므로 지웠다. (켜 두면 cookies()를 쓰는 페이지마다 <Suspense>가 필요)
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
