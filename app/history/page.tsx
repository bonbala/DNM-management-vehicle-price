"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-context"
import { LogOut, ArrowLeft, Loader2, ChevronLeft, ChevronRight, X, RotateCcw} from "lucide-react"

import type { HistoryDisplay } from "@/types/history"

export default function HistoryPage() {
  const router = useRouter()
  const { logout, isAuthenticated } = useAuth()
  const [histories, setHistories] = useState<HistoryDisplay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(10)

  // Filter states
  const [filters, setFilters] = useState({
    brand: "",
    type: "",
    year: "" as number | "",
    engineCapacity: "",
  })
  const [sortBy, setSortBy] = useState<"createdAt" | "createdAtOld" | "nameAsc" | "nameDesc">("createdAt")

  // Column visibility states
  const [visibleColumns, setVisibleColumns] = useState({
    stt: true,
    nameVehicle: true,
    brand: false,
    type: false,
    year: true,
    engineCapacity: false,
    oldPrice: true,
    newPrice: true,
    change: true,
    staffName: true,
    createdAt: true,
  })
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [jumpToPage, setJumpToPage] = useState("")

  // Distinct values for filters
  const [distinctBrands] = useState<string[]>([
    "Honda",
    "Yamaha",
    "Suzuki",
    "Kawasaki",
    "KTM",
    "BMW",
    "Harley-Davidson",
    "Ducati",
    "Aprilia",
    "Peugeot",
    "Piaggio",
    "Vespa",
    "SYM",
    "Kymco",
    "Hyosung",
  ])
  const [distinctTypes] = useState<string[]>([
    "Xe tay ga",
    "Xe số",
    "Xe côn",
    "Xe điện",
    "Ô tô",
  ])
  const [distinctYears] = useState<number[]>(() => {
    const currentYear = new Date().getFullYear()
    const years: number[] = []
    for (let i = currentYear + 1; i >= 2000; i--) {
      years.push(i)
    }
    return years
  })
  const [distinctEngines] = useState<string[]>(["50cc","110cc","125cc","150cc","160cc","175cc", "250cc", "279cc", "300cc"])

  // Load histories
  useEffect(() => {
    const loadHistories = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          sortBy,
        })

        if (filters.brand) params.append("brand", filters.brand)
        if (filters.type) params.append("type", filters.type)
        if (filters.year) params.append("year", String(filters.year))
        if (filters.engineCapacity) params.append("engineCapacity", filters.engineCapacity)

        const response = await fetch(`/api/histories/pagination?${params.toString()}`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Lỗi khi tải lịch sử thay đổi")
        }

        const data = await response.json()
        setHistories(data.data)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error("[v0] Failed to load histories:", error)
        alert("Lỗi khi tải lịch sử thay đổi")
      } finally {
        setIsLoading(false)
      }
    }

    loadHistories()
  }, [currentPage, limit, filters, sortBy])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDateTime = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getPriceChange = (oldPrice: number, newPrice: number) => {
    const diff = newPrice - oldPrice
    const percent = ((diff / oldPrice) * 100).toFixed(2)
    const isIncrease = diff > 0
    return {
      diff,
      percent,
      isIncrease,
    }
  }

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleResetFilters = () => {
    setFilters({
      brand: "",
      type: "",
      year: "",
      engineCapacity: "",
    })
    setSortBy("createdAt")
    setCurrentPage(1)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setCurrentPage(1) // Reset to first page when limit changes
  }

  const handleJumpToPage = () => {
    const pageNum = Number(jumpToPage)
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum)
      setJumpToPage("")
    }
  }

  const toggleColumnVisibility = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }

  const columnLabels: Record<keyof typeof visibleColumns, string> = {
    stt: "STT",
    nameVehicle: "Tên Xe",
    brand: "Hãng",
    type: "Loại",
    year: "Năm",
    engineCapacity: "Dung Tích",
    oldPrice: "Giá Cũ",
    newPrice: "Giá Mới",
    change: "Thay Đổi",
    staffName: "Nhân Viên",
    createdAt: "Thời gian",
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
                <ArrowLeft size={18} />
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Lịch Sử Thay Đổi Giá</h1>
                <p className="text-sm text-muted-foreground mt-1">Danh sách các lần thay đổi giá xe ({total} bản ghi)</p>
              </div>
            </div>
            {isAuthenticated && (
              <Button variant="outline" onClick={logout} className="gap-2">
                <LogOut size={18} />
                Đăng xuất
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Hãng</label>
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange("brand", e.target.value)}
              className="w-full border border-border rounded px-3 py-2 bg-background text-foreground"
            >
              <option value="">Tất cả hãng</option>
              {distinctBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Loại</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full border border-border rounded px-3 py-2 bg-background text-foreground"
            >
              <option value="">Tất cả loại</option>
              {distinctTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Năm</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange("year", e.target.value ? Number(e.target.value) : "")}
              className="w-full border border-border rounded px-3 py-2 bg-background text-foreground"
            >
              <option value="">Tất cả năm</option>
              {distinctYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Dung tích</label>
            <select
              value={filters.engineCapacity}
              onChange={(e) => handleFilterChange("engineCapacity", e.target.value)}
              className="w-full border border-border rounded px-3 py-2 bg-background text-foreground"
            >
              <option value="">Tất cả dung tích</option>
              {distinctEngines.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Sắp xếp</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "createdAt" | "createdAtOld" | "nameAsc" | "nameDesc")}
              className="w-full border border-border rounded px-3 py-2 bg-background text-foreground"
            >
              <option value="createdAt">Mới nhất</option>
              <option value="createdAtOld">Cũ nhất</option>
              <option value="nameAsc">Tên A-Z</option>
              <option value="nameDesc">Tên Z-A</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2 relative">
          <Button onClick={handleResetFilters} variant="outline" size="sm">
            <RotateCcw size={14} />
            Đặt lại
          </Button>
          <Button onClick={() => setShowColumnSettings(!showColumnSettings)} variant="outline" size="sm">
            ⚙️ Cột hiển thị
          </Button>

          {/* Column Settings Popup */}
          {showColumnSettings && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-border rounded-lg shadow-lg p-4 z-50 min-w-[250px]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm">Chọn cột hiển thị</h3>
                <button
                  onClick={() => setShowColumnSettings(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {(Object.keys(visibleColumns) as Array<keyof typeof visibleColumns>).map((column) => (
                  <div key={column} className="flex items-center gap-2 p-2 hover:bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={column}
                        checked={visibleColumns[column]}
                        onChange={() => setVisibleColumns(prev => ({
                          ...prev,
                          [column]: !prev[column],
                        }))}
                        className="w-4 h-4"
                      />
                      <label htmlFor={column} className="text-sm cursor-pointer">
                        {columnLabels[column]}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  {visibleColumns.stt && (
                    <th
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleColumnVisibility("stt")}
                      title="Click để ẩn"
                    >
                      STT
                    </th>
                  )}
                  {visibleColumns.nameVehicle && (
                    <th
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleColumnVisibility("nameVehicle")}
                      title="Click để ẩn"
                    >
                      Tên Xe
                    </th>
                  )}
                  {visibleColumns.brand && (
                    <th
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleColumnVisibility("brand")}
                      title="Click để ẩn"
                    >
                      Hãng
                    </th>
                  )}
                  {visibleColumns.type && (
                    <th
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleColumnVisibility("type")}
                      title="Click để ẩn"
                    >
                      Loại
                    </th>
                  )}
                  {visibleColumns.year && (
                    <th
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleColumnVisibility("year")}
                      title="Click để ẩn"
                    >
                      Năm
                    </th>
                  )}
                  {visibleColumns.engineCapacity && (
                    <th
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleColumnVisibility("engineCapacity")}
                      title="Click để ẩn"
                    >
                      Dung Tích
                    </th>
                  )}
                  {visibleColumns.oldPrice && (
                    <th
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleColumnVisibility("oldPrice")}
                      title="Click để ẩn"
                    >
                      Giá Cũ
                    </th>
                  )}
                  {visibleColumns.newPrice && (
                    <th
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleColumnVisibility("newPrice")}
                      title="Click để ẩn"
                    >
                      Giá Mới
                    </th>
                  )}
                  {visibleColumns.change && (
                    <th
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleColumnVisibility("change")}
                      title="Click để ẩn"
                    >
                      Thay Đổi
                    </th>
                  )}
                  {visibleColumns.staffName && (
                    <th
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleColumnVisibility("staffName")}
                      title="Click để ẩn"
                    >
                      Nhân Viên
                    </th>
                  )}
                  {visibleColumns.createdAt && (
                    <th
                      className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleColumnVisibility("createdAt")}
                      title="Click để ẩn"
                    >
                      Thời gian
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {histories.map((history, index) => {
                  const priceChange = getPriceChange(history.oldPrice, history.newPrice)
                  return (
                    <tr key={history.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      {visibleColumns.stt && (
                        <td className="px-6 py-3 text-sm">{(currentPage - 1) * limit + index + 1}</td>
                      )}
                      {visibleColumns.nameVehicle && (
                        <td className="px-6 py-3 text-sm font-medium">{history.nameVehicle}</td>
                      )}
                      {visibleColumns.brand && (
                        <td className="px-6 py-3 text-sm">{history.brand}</td>
                      )}
                      {visibleColumns.type && (
                        <td className="px-6 py-3 text-sm">{history.type}</td>
                      )}
                      {visibleColumns.year && (
                        <td className="px-6 py-3 text-sm">{history.year}</td>
                      )}
                      {visibleColumns.engineCapacity && (
                        <td className="px-6 py-3 text-sm">{history.engineCapacity}</td>
                      )}
                      {visibleColumns.oldPrice && (
                        <td className="px-6 py-3 text-sm text-muted-foreground">
                          {formatPrice(history.oldPrice)}
                        </td>
                      )}
                      {visibleColumns.newPrice && (
                        <td className="px-6 py-3 text-sm font-medium">{formatPrice(history.newPrice)}</td>
                      )}
                      {visibleColumns.change && (
                        <td className="px-6 py-3 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              priceChange.isIncrease
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {priceChange.isIncrease ? "+" : "-"}
                            {formatPrice(Math.abs(priceChange.diff))} ({priceChange.percent}%)
                          </span>
                        </td>
                      )}
                      {visibleColumns.staffName && (
                        <td className="px-6 py-3 text-sm">{history.staffName}</td>
                      )}
                      {visibleColumns.createdAt && (
                        <td className="px-6 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDateTime(new Date(history.createdAt))}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {histories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Chưa có lịch sử thay đổi nào</div>
          )}
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-6 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Hiển thị:</span>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-border rounded-md bg-background"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={total}>Tất cả ({total})</option>
            </select>
          </div>

          {(totalPages > 1 || limit !== 10) && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="Về trang đầu"
              >
                ⟨⟨
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Trang</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleJumpToPage()}
                  placeholder={currentPage.toString()}
                  className="w-12 px-2 py-1 text-sm border border-border rounded text-center"
                />
                <span className="text-sm text-muted-foreground">của {totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Về trang cuối"
              >
                ⟩⟩
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
