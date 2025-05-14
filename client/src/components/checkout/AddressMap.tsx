import { useState, useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { MAPBOX_ACCESS_TOKEN } from "@/lib/env"

// Thiết lập token cho Mapbox từ biến môi trường
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

interface AddressMapProps {
	onLocationSelect: (location: {
		address: string
		coordinates: [number, number] // [longitude, latitude]
	}) => void
	defaultAddress?: string
}

export function AddressMap({ onLocationSelect, defaultAddress }: AddressMapProps) {
	// Refs
	const mapContainer = useRef<HTMLDivElement>(null)
	const map = useRef<mapboxgl.Map | null>(null)
	const marker = useRef<mapboxgl.Marker | null>(null)

	// State
	const [address, setAddress] = useState<string>(defaultAddress || "")
	const [coordinates, setCoordinates] = useState<[number, number]>([105.8342, 21.0278]) // Default to Hanoi
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [searchResults, setSearchResults] = useState<
		Array<{
			id: string
			name: string
			address: string
			coordinates: [number, number]
		}>
	>([])
	const [isSearching, setIsSearching] = useState<boolean>(false)
	const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false)
	const [locationError, setLocationError] = useState<string | null>(null)
	const [mapLoaded, setMapLoaded] = useState<boolean>(false)
	const [recentlyUsedLocations, setRecentlyUsedLocations] = useState<
		Array<{
			name: string
			address: string
			coordinates: [number, number]
		}>
	>([])

	// Load recent locations from localStorage on mount
	useEffect(() => {
		const savedLocations = localStorage.getItem("recentAddresses")
		if (savedLocations) {
			try {
				const parsed = JSON.parse(savedLocations)
				if (Array.isArray(parsed)) {
					setRecentlyUsedLocations(parsed.slice(0, 3)) // Only keep top 3
				}
			} catch (e) {
				console.error("Lỗi khi đọc địa chỉ gần đây:", e)
			}
		}
	}, [])

	// Save a location to recently used
	const saveToRecentLocations = (location: { name: string; address: string; coordinates: [number, number] }) => {
		setRecentlyUsedLocations((prev) => {
			// Remove duplicates
			const filtered = prev.filter((item) => item.address !== location.address)
			// Add to front and limit to 3 items
			const updated = [location, ...filtered].slice(0, 3)

			// Save to localStorage
			try {
				localStorage.setItem("recentAddresses", JSON.stringify(updated))
			} catch (e) {
				console.error("Lỗi khi lưu địa chỉ gần đây:", e)
			}

			return updated
		})
	}

	// Khởi tạo map
	useEffect(() => {
		if (map.current || !mapContainer.current) return

		// Tạo bản đồ
		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: "mapbox://styles/mapbox/streets-v11",
			center: coordinates,
			zoom: 14,
		})

		// Thêm các điều khiển bản đồ
		map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

		// Tạo marker
		marker.current = new mapboxgl.Marker({
			draggable: true,
			color: "#FF0000",
		})
			.setLngLat(coordinates)
			.addTo(map.current)

		// Sự kiện khi kéo marker
		marker.current.on("dragend", async () => {
			if (marker.current) {
				const lngLat = marker.current.getLngLat()
				const newCoords: [number, number] = [lngLat.lng, lngLat.lat]
				updateLocationFromCoordinates(newCoords)
			}
		})

		// Sự kiện khi click vào bản đồ
		map.current.on("click", (e) => {
			if (marker.current) {
				const newCoords: [number, number] = [e.lngLat.lng, e.lngLat.lat]
				marker.current.setLngLat(newCoords)
				updateLocationFromCoordinates(newCoords)
			}
		})

		// Đánh dấu bản đồ đã load xong
		map.current.on("load", () => {
			setMapLoaded(true)
		})

		// Cleanup
		return () => {
			if (map.current) {
				map.current.remove()
				map.current = null
			}
		}
	}, []) // chỉ chạy một lần khi mount

	// Cập nhật marker khi coordinates thay đổi
	useEffect(() => {
		if (map.current && marker.current && mapLoaded) {
			marker.current.setLngLat(coordinates)
			map.current.flyTo({ center: coordinates, zoom: 15 })
		}
	}, [coordinates, mapLoaded])

	// Hàm cập nhật địa chỉ từ tọa độ
	const updateLocationFromCoordinates = async (coords: [number, number]) => {
		setCoordinates(coords)

		try {
			// Gọi Mapbox Geocoding API để lấy địa chỉ từ tọa độ
			const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${MAPBOX_ACCESS_TOKEN}&language=vi`)

			if (!response.ok) {
				throw new Error("Không thể tìm địa chỉ từ tọa độ")
			}

			const data = await response.json()

			if (data.features && data.features.length > 0) {
				setAddress(data.features[0].place_name)
			} else {
				setAddress(`Vị trí (${coords[0].toFixed(6)}, ${coords[1].toFixed(6)})`)
			}
		} catch (error) {
			console.error("Lỗi khi tìm địa chỉ:", error)
			setAddress(`Vị trí (${coords[0].toFixed(6)}, ${coords[1].toFixed(6)})`)
		}
	}

	// Hàm tìm kiếm địa điểm
	const searchLocation = async () => {
		if (!searchQuery.trim()) return

		setIsSearching(true)
		setSearchResults([])

		try {
			// Gọi Mapbox Geocoding API để tìm kiếm địa điểm
			const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=vn&language=vi`)

			if (!response.ok) {
				throw new Error("Không thể tìm kiếm địa điểm")
			}

			const data = await response.json()

			if (data.features && data.features.length > 0) {
				setSearchResults(data.features)
			}
		} catch (error) {
			console.error("Lỗi khi tìm kiếm địa điểm:", error)
		} finally {
			setIsSearching(false)
		}
	}

	// Xử lý khi nhấn Enter trong ô tìm kiếm
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault()
			searchLocation()
		}
	}

	// Chọn địa điểm từ kết quả tìm kiếm
	const selectSearchResult = (result: { center: [number, number]; place_name: string; id: string }) => {
		const centerCoords = result.center
		const coords: [number, number] = [centerCoords[0], centerCoords[1]]
		setAddress(result.place_name)
		setCoordinates(coords)
		setSearchResults([])

		// Lưu vào địa điểm gần đây
		saveToRecentLocations({
			name: result.text,
			address: result.place_name,
			coordinates: coords,
		})
	}

	// Chọn địa điểm từ đã lưu
	const selectSavedLocation = (location: { name: string; address: string; coordinates: [number, number] }) => {
		setAddress(location.address)
		setCoordinates(location.coordinates)
	}

	// Xác định vị trí hiện tại
	const getCurrentLocation = () => {
		setIsLoadingLocation(true)
		setLocationError(null)

		if (!navigator.geolocation) {
			setLocationError("Trình duyệt của bạn không hỗ trợ định vị")
			setIsLoadingLocation(false)
			return
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const lat = position.coords.latitude
				const lng = position.coords.longitude

				// Cập nhật vị trí
				const coords: [number, number] = [lng, lat]
				updateLocationFromCoordinates(coords)
				setIsLoadingLocation(false)

				// Lưu vị trí hiện tại vào gần đây
				const locationName = "Vị trí hiện tại của tôi"
				saveToRecentLocations({
					name: locationName,
					address: `${locationName} (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
					coordinates: coords,
				})
			},
			(error) => {
				console.error("Lỗi định vị:", error)
				let errorMsg = "Không thể xác định vị trí của bạn"

				switch (error.code) {
					case error.PERMISSION_DENIED:
						errorMsg = "Bạn đã từ chối cho phép truy cập vị trí. Vui lòng kiểm tra cài đặt quyền của trình duyệt."
						break
					case error.POSITION_UNAVAILABLE:
						errorMsg = "Không thể xác định vị trí hiện tại. Vui lòng kiểm tra kết nối internet và GPS."
						break
					case error.TIMEOUT:
						errorMsg = "Quá thời gian chờ khi xác định vị trí. Vui lòng thử lại."
						break
				}

				setLocationError(errorMsg)
				setIsLoadingLocation(false)
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0,
			}
		)
	}

	// Xác nhận địa điểm đã chọn
	const confirmLocation = () => {
		onLocationSelect({
			address,
			coordinates,
		})

		// Lưu vào danh sách địa điểm gần đây
		if (!address.includes("Vị trí hiện tại")) {
			saveToRecentLocations({
				name: address.split(",")[0],
				address,
				coordinates,
			})
		}
	}

	return (
		<div className="space-y-4">
			<Card className="p-4">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					{/* Phần bên trái: Tìm kiếm và lịch sử */}
					<div className="lg:col-span-1 space-y-4">
						{/* Nút định vị hiện tại - đặt ở vị trí nổi bật */}
						<div className="mb-4">
							<Button
								onClick={getCurrentLocation}
								disabled={isLoadingLocation}
								variant="default"
								size="lg"
								className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
							>
								{isLoadingLocation ? (
									<>
										<i className="fas fa-spinner fa-spin"></i>
										<span>Đang xác định vị trí...</span>
									</>
								) : (
									<>
										<i className="fas fa-location-arrow"></i>
										<span>Xác định vị trí hiện tại</span>
									</>
								)}
							</Button>

							{locationError && (
								<div className="mt-2 text-sm text-red-500 p-2 bg-red-50 rounded-md">
									<i className="fas fa-exclamation-circle mr-1"></i>
									{locationError}
								</div>
							)}
						</div>

						{/* Tìm kiếm địa chỉ */}
						<div>
							<div className="text-sm font-medium text-gray-700 mb-2">Tìm kiếm địa chỉ</div>
							<div className="flex space-x-1">
								<Input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={handleKeyPress}
									placeholder="Nhập địa chỉ để tìm kiếm..."
									className="flex-grow"
								/>
								<Button onClick={searchLocation} disabled={isSearching || !searchQuery.trim()} size="icon">
									{isSearching ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
								</Button>
							</div>

							{/* Kết quả tìm kiếm */}
							{searchResults.length > 0 && (
								<div className="mt-2 max-h-60 overflow-y-auto border rounded-md">
									<ul className="divide-y">
										{searchResults.map((result, index) => (
											<li key={index} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => selectSearchResult(result)}>
												<div className="flex items-start">
													<i className="fas fa-map-marker-alt text-primary mt-1 mr-2"></i>
													<span className="text-sm">{result.place_name}</span>
												</div>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>

						{/* Địa chỉ đã lưu gần đây */}
						{recentlyUsedLocations.length > 0 && (
							<div>
								<div className="text-sm font-medium text-gray-700 mb-2">Địa chỉ đã sử dụng gần đây</div>
								<ul className="space-y-2">
									{recentlyUsedLocations.map((location, idx) => (
										<li key={idx} className="border rounded-md p-2 cursor-pointer hover:bg-gray-50" onClick={() => selectSavedLocation(location)}>
											<div className="flex items-start">
												<i className="fas fa-history text-gray-400 mt-1 mr-2"></i>
												<div>
													<div className="font-medium text-sm">{location.name}</div>
													<div className="text-xs text-gray-500 truncate max-w-full">{location.address}</div>
												</div>
											</div>
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Địa chỉ đã chọn */}
						{address && (
							<div className="p-3 bg-gray-50 rounded-md border">
								<div className="font-medium flex items-center text-sm mb-1">
									<i className="fas fa-check-circle text-green-500 mr-1"></i>
									Địa chỉ đã chọn:
								</div>
								<div className="text-sm">{address}</div>
							</div>
						)}
					</div>

					{/* Phần bên phải: Bản đồ tương tác */}
					<div className="lg:col-span-2">
						<div className="text-sm font-medium text-gray-700 mb-2">Bản đồ</div>
						<div ref={mapContainer} className="w-full h-[400px] rounded-md border" />
						<div className="mt-2 text-xs text-gray-500">
							<i className="fas fa-info-circle mr-1"></i>
							Kéo ghim hoặc nhấp vào bản đồ để chọn vị trí chính xác hơn.
						</div>
					</div>
				</div>

				<Separator className="my-4" />

				{/* Nút xác nhận */}
				<Button onClick={confirmLocation} disabled={!address} className="w-full mt-4" size="lg">
					<i className="fas fa-check-circle mr-2"></i>
					Xác nhận địa chỉ này
				</Button>
			</Card>
		</div>
	)
}
