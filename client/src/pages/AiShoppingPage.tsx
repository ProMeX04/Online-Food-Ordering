import { useState, useEffect } from 'react'
import { get } from '@/lib/axiosClient'
import { AIResponse, FunctionResponse } from '@shared/types/ai.types'
import { AiResponseDisplay } from '@/components/ai/AiResponseDisplay'
import { FoodCard } from '@/components/ui/FoodCard'

export default function AiShoppingPage() {
    const [aiQuery, setAiQuery] = useState('')
    const [functionsResponse, setFunctionsResponse] = useState<FunctionResponse[]>([])
    const [textResponse, setTextResponse] = useState('')

    const [isAiLoading, setIsAiLoading] = useState(false)

    useEffect(() => {
        document.title = 'Tìm kiếm AI | ViệtFood Shopping'
    }, [])

    const handleAiQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAiQuery(e.target.value)
    }

    const handleAiSubmit = async () => {
        if (!aiQuery.trim()) return
        setIsAiLoading(true)
        setFunctionsResponse([])
        try {
            const response: AIResponse = await get(`/chat/?aiQuery=${aiQuery}`, {
                timeout: 10000000,
            })
            if (response.functionResponses) {
                setFunctionsResponse(response.functionResponses)
            }
            setTextResponse(response.text || '')
        } catch (error) {
            setFunctionsResponse([])
            setTextResponse('')
        }
        setIsAiLoading(false)
        setAiQuery('')
    }
    return (
        <div className="bg-light min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="mb-8 p-6 bg-white rounded-lg shadow">
                    <p className="text-neutral-600 mb-4">Hỏi AI để tìm kiếm món ăn bạn muốn. AI sẽ hiển thị kết quả bên dưới.</p>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={aiQuery}
                            onChange={handleAiQueryChange}
                            placeholder={"Hỏi AI ví dụ: 'Món gà rán' hoặc 'Top 5 món bán chạy'"}
                            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
                        />
                        <button
                            onClick={handleAiSubmit}
                            disabled={isAiLoading || !aiQuery.trim()}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isAiLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-paper-plane mr-2"></i>}
                            Gửi
                        </button>
                    </div>
                    <AiResponseDisplay isAiLoading={isAiLoading} text={textResponse} />
                </div>

                {functionsResponse.find((fr) => fr.responseType === 'dishes')?.response && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {functionsResponse
                            .find((fr) => fr.responseType === 'dishes')
                            ?.response?.map((dish) => (
                                <FoodCard key={dish._id} dish={dish} />
                            ))}
                    </div>
                )}

                {isAiLoading && (
                    <div className="text-center py-8">
                        <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                        <p className="text-neutral/70">AI đang tìm kiếm, vui lòng chờ...</p>
                    </div>
                )}

                {!isAiLoading && !textResponse && !aiQuery && (
                    <div className="text-center py-8 p-6 bg-white rounded-lg shadow">
                        <i className="fas fa-magic text-4xl text-primary/50 mb-4"></i>
                        <h3 className="font-medium text-xl mb-2">Chào mừng đến với tìm kiếm AI!</h3>
                        <p className="text-neutral/70">Hãy nhập yêu cầu của bạn vào ô bên trên để AI gợi ý món ăn.</p>
                    </div>
                )}

                {textResponse && !functionsResponse.find((fr) => fr.responseType === 'dishes')?.response && !isAiLoading && (
                    <div className="text-center py-8 p-6 bg-white rounded-lg shadow">
                        <i className="fas fa-search-minus text-4xl text-neutral/40 mb-4"></i>
                        <h3 className="font-medium text-xl mb-2">AI không tìm thấy món ăn nào</h3>
                        <p className="text-neutral/70">Vui lòng thử lại với một yêu cầu khác hoặc xem qua các món ăn thông thường.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
