import { useState } from 'react'   
import { MediaType } from '@/types/schema'
import { Card } from '@/components/ui/card'

interface DishMedia {
    id: number
    dishId: number
    url: string
    type: string
    caption: string | null
    isPrimary: boolean
    sortOrder: number
}

interface MediaGalleryProps {
    media: DishMedia[]
}

export function MediaGallery({ media }: MediaGalleryProps) {
    const [selectedMedia, setSelectedMedia] = useState<DishMedia | null>(media.find((m) => m.isPrimary) || (media.length > 0 ? media[0] : null))

    // Sort media by sortOrder
    const sortedMedia = [...media].sort((a, b) => a.sortOrder - b.sortOrder)

    if (media.length === 0) {
        return <div className="text-center p-8 text-gray-500">No media available</div>
    }

    return (
        <div className="flex flex-col gap-4">
            <Card className="overflow-hidden bg-white rounded-lg border border-neutral/10">
                <div className="relative aspect-video">
                    {selectedMedia?.type === MediaType.VIDEO ? (
                        <video src={selectedMedia.url} controls className="w-full h-full object-contain" />
                    ) : (
                        <img src={`${selectedMedia?.url}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=90`} alt={selectedMedia?.caption || 'Product image'} className="w-full h-full object-contain" />
                    )}
                </div>
                {selectedMedia?.caption && <div className="p-2 text-center text-sm text-neutral/70">{selectedMedia.caption}</div>}
            </Card>

            {media.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {sortedMedia.map((item, index) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedMedia(item)}
                            className={`relative rounded-md overflow-hidden border-2 transition-all ${selectedMedia?.id === item.id ? 'border-primary' : 'border-neutral/10'}`}
                        >
                            {item.type === MediaType.VIDEO ? (
                                <div className="w-16 h-16 bg-neutral-100 flex items-center justify-center">
                                    <i className="fas fa-play text-neutral-500"></i>
                                </div>
                            ) : (
                                <img src={`${item.url}?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80`} alt={item.caption || `Thumbnail ${index + 1}`} className="w-16 h-16 object-cover" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
