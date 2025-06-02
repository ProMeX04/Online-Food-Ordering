import ReactMarkdown from 'react-markdown'

interface AiResponseDisplayProps {
    isAiLoading: boolean
    text: string
}

export function AiResponseDisplay({ isAiLoading, text }: AiResponseDisplayProps) {
    if (isAiLoading) {
        return (
            <div className="mt-4 p-4 border border-primary/30 rounded-md bg-primary/5 min-h-[80px] flex items-center justify-center text-primary">
                <i className="fas fa-spinner fa-spin mr-2"></i> AI đang suy nghĩ...
            </div>
        )
    }

    if (!text) {
        return null
    }

    return (
        <div className="mt-6">
            {text && (
                <div className="mb-6 p-4 border border-primary/30 rounded-md bg-primary/5">
                    <div className="prose max-w-none">
                        <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    )
}
