import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface OverviewProps {
    data: {
        date: string
        total: number
    }[]
}

export function Overview({ data }: OverviewProps) {
    const chartData = {
        labels: data.map((item) => {
            const date = new Date(item.date)
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
        }),
        datasets: [
            {
                label: 'Doanh thu',
                data: data.map((item) => item.total),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                tension: 0.4,
            },
        ],
    }

    return (
        <Line
            data={chartData}
            options={{
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top' as const,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                    maximumFractionDigits: 0,
                                }).format(value as number)
                            },
                        },
                    },
                },
            }}
        />
    )
}
