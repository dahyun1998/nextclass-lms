// 유튜브 영상 임베드. 주소가 없거나 잘못되면 안내 상자를 보여 준다.
import { getYouTubeId } from '@/lib/utils'

export default function VideoPlayer({ url, title }) {
  const id = getYouTubeId(url)

  if (!id) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-900 text-slate-400">
        등록된 영상이 없습니다
      </div>
    )
  }

  return (
    <iframe
      className="aspect-video w-full rounded-xl"
      src={`https://www.youtube.com/embed/${id}`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}
