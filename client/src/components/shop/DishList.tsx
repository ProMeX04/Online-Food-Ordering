import { useState, useEffect } from 'react'
import { Link } from 'wouter'
import { Dish, Category } from '@/types/schema'
import { FoodCard } from '@/components/ui/FoodCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib'
import { get } from '@/lib'
import InfiniteScroll from 'react-infinite-scroll-component'

interface DishListProps {
    _id?: string
    initialFilters?: {
        minPrice?: number
        maxPrice?: number
    }
    categories: Category[]
}

export function DishList({ _id, initialFilters, categories }: DishListProps) {
    const [searchInput, setSearchInput] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState<{
        minPrice: number
        maxPrice: number
    }>({
        minPrice: initialFilters?.minPrice || 0,
        maxPrice: initialFilters?.maxPrice || 500000,
    })
    const [sortBy, setSortBy] = useState<string>('popular')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 9

    const [dishes, setDishes] = useState<Dish[]>([])
    const [totalItems, setTotalItems] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        const delaySearchTimeout = setTimeout(() => {
            if (searchInput !== searchQuery) {
                setSearchQuery(searchInput)
                resetList()
            }
        }, 800)

        return () => clearTimeout(delaySearchTimeout)
    }, [searchInput, searchQuery])

    const resetList = () => {
        setDishes([])
        setCurrentPage(1)
        setHasMore(true)
    }

    useEffect(() => {
        if (currentPage === 1) {
            fetchDishes()
        } else {
            resetList()
        }
    }, [_id, searchQuery, sortBy, filters.minPrice, filters.maxPrice])

    useEffect(() => {
        if (currentPage > 1) {
            fetchDishes()
        }
    }, [currentPage])

    const fetchDishes = async () => {
        try {
            setIsLoading(true)
            let queryParams = `?page=${currentPage}&limit=${itemsPerPage}`

            if (sortBy) {
                queryParams += `&sortBy=${sortBy}`
            }

            if (_id) {
                queryParams += `&category=${_id}`
            }

            if (searchQuery) {
                queryParams += `&searchTerm=${searchQuery}`
            }

            if (filters.minPrice > 0) {
                queryParams += `&minPrice=${filters.minPrice}`
            }

            if (filters.maxPrice < 500000) {
                queryParams += `&maxPrice=${filters.maxPrice}`
            }

            const response = (await get(`/dishes${queryParams}`)) as {
                items: Dish[]
                total: number
                page: string
                limit: string
                totalPages: number
            }

            const newDishes = response.items || []

            if (newDishes.length === 0) {
                setHasMore(false)
            } else {
                setDishes((prevDishes) => (currentPage === 1 ? newDishes : [...prevDishes, ...newDishes]))
                setTotalItems(response.total || 0)
                setHasMore(newDishes.length === itemsPerPage)
            }
        } catch (err) {
            console.error('Error fetching dishes:', err)
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value)
    }

    const handleFilterChange = (name: string, value: boolean | number) => {
        setFilters((prev) => ({ ...prev, [name]: value }))
        resetList()
    }

    const handleSortChange = (value: string) => {
        setSortBy(value)
        resetList()
    }

    const loadMoreDishes = () => {
        setCurrentPage((prevPage) => prevPage + 1)
    }

    if (error) {
        return (
            <Card className="p-8 text-center">
                <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <h3 className="font-medium text-xl mb-2">Đã xảy ra lỗi</h3>
                <p className="text-neutral/70 mb-4">Không thể tải dữ liệu món ăn. Vui lòng thử lại sau.</p>
                <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
            </Card>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-64 shrink-0">
                <Card className="p-4">
                    <h3 className="font-medium text-lg mb-4">Bộ lọc</h3>

                    <div className="mb-6">
                        <Label htmlFor="search" className="mb-2 block">
                            Tìm kiếm
                        </Label>
                        <Input id="search" type="text" placeholder="Tìm kiếm món ăn..." value={searchInput} onChange={handleSearchChange} className="w-full" />
                        <p className="text-xs text-muted-foreground mt-1">Kết quả sẽ tự động cập nhật sau khi bạn dừng gõ</p>
                    </div>

                    <div className="mb-6">
                        <Label className="mb-2 block">Khoảng giá</Label>
                        <div className="px-2">
                            <Slider
                                onValueChange={(values) => {
                                    handleFilterChange('minPrice', values[0])
                                    handleFilterChange('maxPrice', values[1])
                                }}
                                defaultValue={[filters.minPrice, filters.maxPrice]}
                                max={500000}
                                step={10000}
                                className="my-4"
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                            <span>{formatCurrency(filters.minPrice)}</span>
                            <span>{formatCurrency(filters.maxPrice)}</span>
                        </div>
                    </div>

                    {categories.length > 0 && (
                        <div className="mb-6">
                            <Label className="mb-2 block">Danh mục</Label>
                            <div className="space-y-2">
                                {categories.map((category: Category) => (
                                    <Link key={category._id} href={`/menu/normal-mode/${category.slug}`}>
                                        <div className="flex items-center cursor-pointer hover:text-primary">
                                            <i className={`fas fa-utensils mr-2 text-neutral/70`}></i>
                                            <span>{category.name}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <Label htmlFor="sort" className="mb-2 block">
                            Sắp xếp theo
                        </Label>
                        <Select value={sortBy} onValueChange={handleSortChange}>
                            <SelectTrigger id="sort">
                                <SelectValue placeholder="Sắp xếp theo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="-soldCount">Phổ biến nhất</SelectItem>
                                <SelectItem value="price">Giá thấp đến cao</SelectItem>
                                <SelectItem value="-price">Giá cao đến thấp</SelectItem>
                                <SelectItem value="-name">Tên A-Z</SelectItem>
                                <SelectItem value="name">Tên Z-A</SelectItem>
                                <SelectItem value="-createdAt">Mới nhất</SelectItem>
                                <SelectItem value="createdAt">Cũ nhất</SelectItem>
                                <SelectItem value="-rating">Đánh giá cao nhất</SelectItem>
                                <SelectItem value="rating">Đánh giá thấp nhất</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </Card>
            </div>

            <div className="flex-1">
                <div className="mb-6 flex justify-between items-center">
                    <p className="text-neutral/70">{isLoading && currentPage === 1 ? 'Đang tìm kiếm...' : `Hiển thị ${dishes.length} trên ${totalItems} kết quả`}</p>
                </div>

                {isLoading && currentPage === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse p-4 shadow-sm">
                                <div className="h-48 bg-neutral/10 rounded-md mb-4"></div>
                                <div className="h-5 bg-neutral/10 rounded mb-2 w-3/4"></div>
                                <div className="h-4 bg-neutral/10 rounded mb-4"></div>
                                <div className="flex justify-between items-center">
                                    <div className="h-6 bg-neutral/10 rounded w-20"></div>
                                    <div className="h-9 bg-neutral/10 rounded-full w-20"></div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {!isLoading && currentPage === 1 && dishes.length === 0 && (
                    <Card className="p-8 text-center">
                        <i className="fas fa-search text-4xl text-neutral/30 mb-4"></i>
                        <h3 className="font-medium text-xl mb-2">Không tìm thấy kết quả</h3>
                        <p className="text-neutral/70 mb-4">Vui lòng thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc của bạn.</p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchInput('')
                                setSearchQuery('')
                                setFilters({
                                    minPrice: 0,
                                    maxPrice: 500000,
                                })
                                resetList()
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </Card>
                )}

                {dishes.length > 0 && (
                    <InfiniteScroll
                        dataLength={dishes.length}
                        next={loadMoreDishes}
                        hasMore={hasMore}
                        loader={
                            <div className="text-center py-4">
                                <div
                                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                    role="status"
                                >
                                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Đang tải...</span>
                                </div>
                                <p className="mt-2 text-neutral/70">Đang tải thêm món ăn...</p>
                            </div>
                        }
                        endMessage={<p className="text-center text-neutral/60 pb-4">Đã hiển thị tất cả món ăn</p>}
                        scrollThreshold={0.8}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dishes.map((dish: Dish) => (
                                <FoodCard key={dish._id} dish={dish} />
                            ))}
                        </div>
                    </InfiniteScroll>
                )}
            </div>
        </div>
    )
}
