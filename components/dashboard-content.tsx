"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, ChevronLeft, ChevronRight, Trash2, Edit3, LogOut, Lock, Loader2, X, Download } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import VehicleForm from "@/components/vehicle-form"
import VehicleTable from "@/components/vehicle-table"
import FilterBar from "@/components/filter-bar"
import BulkAddForm from "@/components/bulk-add-form"
import BulkEditForm from "@/components/bulk-edit-form"
import VehicleHistoryModal from "@/components/vehicle-history-modal"
import { VehicleAPI } from "@/lib/api-client"
import { exportVehiclesWithDateRange, exportAllVehiclesToExcel } from "@/lib/export-excel"
import type { Vehicle } from "@/types/vehicle"
import Link from "next/link"

export default function DashboardContent() {
  const { logout, user, isAuthenticated, canAccess } = useAuth()

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [jumpToPage, setJumpToPage] = useState("")

  const [filters, setFilters] = useState<{
    brand: string
    type: string
    year: number | ""
    engineCapacity: string
  }>({
    brand: "",
    type: "",
    year: "",
    engineCapacity: "",
  })
  const [sortBy, setSortBy] = useState<"default" | "nameAsc" | "nameDesc">("default")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Debounce search term - delay API call by 1000ms after user stops typing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 1000)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  // Initial load - show full page loading
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setIsLoading(true)
        const result = await VehicleAPI.getVehiclesPagination({
          page: 1,
          limit,
          brand: filters.brand || undefined,
          type: filters.type || undefined,
          year: filters.year ? String(filters.year) : undefined,
          engineCapacity: filters.engineCapacity || undefined,
          sortBy,
          search: debouncedSearchTerm || undefined,
        })
        setVehicles(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
      } catch (error) {
        console.error("[v0] Failed to load vehicles:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVehicles()
  }, []) // Only run on mount

  // Load data on search/filter/sort changes - show table loading spinner only
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setIsTableLoading(true)
        const result = await VehicleAPI.getVehiclesPagination({
          page: currentPage,
          limit,
          brand: filters.brand || undefined,
          type: filters.type || undefined,
          year: filters.year ? String(filters.year) : undefined,
          engineCapacity: filters.engineCapacity || undefined,
          sortBy,
          search: debouncedSearchTerm || undefined,
        })
        setVehicles(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
      } catch (error) {
        console.error("[v0] Failed to load vehicles:", error)
      } finally {
        setIsTableLoading(false)
      }
    }

    if (debouncedSearchTerm !== "" || filters.brand || filters.type || filters.year || filters.engineCapacity || sortBy !== "default") {
      loadVehicles()
    }
  }, [currentPage, limit, filters, sortBy, debouncedSearchTerm])

  // Maintain focus on search input after any search action (typing, clearing, loading)
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchTerm])

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

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkAdd, setShowBulkAdd] = useState(false)
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState<Vehicle | null>(null)

  const handleAddVehicle = async (vehicleData: Omit<Vehicle, "id">) => {
    try {
      const newVehicle = await VehicleAPI.createVehicle(vehicleData)
      setCurrentPage(1)
      // Reload data
      const result = await VehicleAPI.getVehiclesPagination({
        page: 1,
        limit,
        brand: filters.brand || undefined,
        type: filters.type || undefined,
        year: filters.year ? String(filters.year) : undefined,
        engineCapacity: filters.engineCapacity || undefined,
        sortBy,
        search: searchTerm || undefined,
      })
      setVehicles(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setShowForm(false)
    } catch (error) {
      console.error("[v0] Failed to add vehicle:", error)
      alert("Lỗi khi thêm xe mới")
    }
  }

  const handleUpdateVehicle = async (vehicleData: Omit<Vehicle, "id">) => {
    if (!editingVehicle) return
    try {
      await VehicleAPI.updateVehicle(editingVehicle.id, vehicleData)
      // Reload data
      const result = await VehicleAPI.getVehiclesPagination({
        page: currentPage,
        limit,
        brand: filters.brand || undefined,
        type: filters.type || undefined,
        year: filters.year ? String(filters.year) : undefined,
        engineCapacity: filters.engineCapacity || undefined,
        sortBy,
        search: searchTerm || undefined,
      })
      setVehicles(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setEditingVehicle(null)
      setShowForm(false)
    } catch (error) {
      console.error("[v0] Failed to update vehicle:", error)
      alert("Lỗi khi cập nhật xe")
    }
  }

  const handleDeleteVehicle = async (id: string) => {
    try {
      await VehicleAPI.deleteVehicle(id)
      // Reload data
      const result = await VehicleAPI.getVehiclesPagination({
        page: currentPage,
        limit,
        brand: filters.brand || undefined,
        type: filters.type || undefined,
        year: filters.year ? String(filters.year) : undefined,
        engineCapacity: filters.engineCapacity || undefined,
        sortBy,
        search: searchTerm || undefined,
      })
      setVehicles(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (error) {
      console.error("[v0] Failed to delete vehicle:", error)
      alert("Lỗi khi xóa xe")
    }
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingVehicle(null)
  }

  const handleBulkAddVehicles = async (vehicleDataList: Omit<Vehicle, "id">[]) => {
    try {
      await VehicleAPI.createMultipleVehicles(vehicleDataList)
      setCurrentPage(1)
      // Reload data
      const result = await VehicleAPI.getVehiclesPagination({
        page: 1,
        limit,
        brand: filters.brand || undefined,
        type: filters.type || undefined,
        year: filters.year ? String(filters.year) : undefined,
        engineCapacity: filters.engineCapacity || undefined,
        sortBy,
        search: searchTerm || undefined,
      })
      setVehicles(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setShowBulkAdd(false)
    } catch (error) {
      console.error("[v0] Failed to bulk add vehicles:", error)
      alert("Lỗi khi thêm nhiều xe")
    }
  }

  const handleBulkEditVehicles = async (updates: Record<string, Partial<Omit<Vehicle, "id">>>) => {
    try {
      const updateArray = Object.entries(updates).map(([id, data]) => ({ id, data }))
      const updated = await VehicleAPI.updateMultipleVehicles(updateArray)
      setVehicles(
        vehicles.map((v) => {
          const updatedVehicle = updated.find((u) => u.id === v.id)
          return updatedVehicle ? updatedVehicle : v
        }),
      )
      setShowBulkEdit(false)
      setSelectedIds(new Set())
    } catch (error) {
      console.error("[v0] Failed to bulk edit vehicles:", error)
      alert("Lỗi khi sửa hàng loạt")
    }
  }

  const handleBulkDelete = async () => {
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.size} xe này?`)) {
      try {
        await VehicleAPI.deleteMultipleVehicles(Array.from(selectedIds))
        setVehicles(vehicles.filter((v) => !selectedIds.has(v.id)))
        setSelectedIds(new Set())
      } catch (error) {
        console.error("[v0] Failed to bulk delete vehicles:", error)
        alert("Lỗi khi xóa hàng loạt")
      }
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(vehicles.map((v: Vehicle) => v.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectVehicle = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleViewHistory = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (vehicle) {
      setSelectedVehicleForHistory(vehicle)
      setShowHistoryModal(true)
    }
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
      <div className="border-b border-border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              {/* <h1 className="text-3xl font-bold text-foreground">DNM</h1> */}
              <Image
                src="/logo-DNM.png"
                alt="DNM Logo"
                width={160}
                height={80}
                priority
              />
              <p className="text-sm text-muted-foreground mt-1">Hệ thống quản lý giá xe máy và ô tô</p>
            </div>
            <div className="flex gap-2 items-center">
              {isAuthenticated ? (
                <>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Đăng nhập với</p>
                    <p className="font-medium text-foreground">
                      {user?.username}
                      {user?.role === "super_admin" && <span className="text-xs text-primary ml-1">(👑)</span>}
                      {user?.role === "admin" && <span className="text-xs text-blue-600 ml-1">(👨‍💼)</span>}
                    </p>
                  </div>
                  {canAccess(["super_admin"]) && (
                    <Link href="/users">
                      <Button variant="outline" className="gap-2">
                        Quản lý TK
                      </Button>
                    </Link>
                  )}
                  <Link href="/history">
                    <Button variant="outline" className="gap-2">
                      Lịch Sử
                    </Button>
                  </Link>
                  <Link href="/hdvp">
                    <Button variant="outline" className="gap-2">
                      KH Vi Phạm
                    </Button>
                  </Link>
                  <Link href="/qlts">
                    <Button variant="outline" className="gap-2">
                      Quản lý tài sản
                    </Button>
                  </Link>
                  {canAccess(["super_admin"]) && (
                    <Link href="/audit-logs">
                      <Button variant="outline" className="gap-2">
                        Audit Logs
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" onClick={logout} className="gap-2 bg-transparent hover:bg-red-500">
                    <LogOut size={18} />
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button className="gap-2">
                      <Lock size={18} />
                      Đăng Nhập
                    </Button>
                  </Link>
                </>
              )}
              {selectedIds.size > 0 && isAuthenticated && canAccess(["admin", "super_admin"]) && (
                <>
                  <Button variant="outline" onClick={() => setShowBulkEdit(true)} className="gap-2">
                    <Edit3 size={18} />
                    Sửa ({selectedIds.size})
                  </Button>
                  <Button variant="destructive" onClick={handleBulkDelete} className="gap-2">
                    <Trash2 size={18} />
                    Xóa ({selectedIds.size})
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 p-6">
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          distinctBrands={distinctBrands}
          distinctTypes={distinctTypes}
          distinctYears={distinctYears}
          distinctEngines={distinctEngines}
        />

        <div className="flex-1 space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Search size={20} className="text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Tìm kiếm theo tên hoặc hãng..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                }}
                className="border-0 bg-transparent flex-1"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setDebouncedSearchTerm("")
                    setCurrentPage(1)
                  }}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Xóa tìm kiếm"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </Card>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as "nameAsc" | "nameDesc")
                  setCurrentPage(1)
                }}
                className="px-3 py-2 text-sm border border-border rounded-md bg-background"
              >
                <option value="default">Mới nhất</option>
                <option value="nameAsc">Tên A-Z</option>
                <option value="nameDesc">Tên Z-A</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setEditingVehicle(null)
                  setShowForm(true)
                }}
                disabled={!isAuthenticated || !canAccess(["admin", "super_admin"])}
                className="gap-1"
              >
                <Plus size={16} />
                Thêm Xe Mới
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkAdd(true)}
                disabled={!isAuthenticated || !canAccess(["admin", "super_admin"])}
                className="gap-1"
              >
                <Plus size={16} />
                Thêm Nhiều
              </Button>
              {canAccess(["super_admin"]) && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (vehicles.length === 0) {
                        alert("Không có xe để xuất")
                        return
                      }
                      exportVehiclesWithDateRange(vehicles)
                    }}
                    className="gap-1"
                    title="Xuất danh sách xe hiện tại sang Excel"
                  >
                    <Download size={16} />
                    Xuất Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        setIsExporting(true)
                        await exportAllVehiclesToExcel()
                      } catch (error) {
                        alert(error instanceof Error ? error.message : "Lỗi khi xuất Excel")
                      } finally {
                        setIsExporting(false)
                      }
                    }}
                    disabled={isExporting}
                    className="gap-1"
                    title="Xuất toàn bộ danh sách xe từ database"
                  >
                    <Download size={16} />
                    {isExporting ? "Đang xuất..." : "Xuất Hết"}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Tổng cộng: {total} kết quả
          </div>

          <div className="relative">
            {isTableLoading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Đang tải...</p>
                </div>
              </div>
            )}
            <VehicleTable
              vehicles={vehicles}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectVehicle={handleSelectVehicle}
              onEdit={handleEditVehicle}
              onDelete={handleDeleteVehicle}
              onViewHistory={handleViewHistory}
              isAuthenticated={isAuthenticated}
              canEdit={canAccess(["admin", "super_admin"])}
              userRole={user?.role}
            />
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-6 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setCurrentPage(1)
                }}
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
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        const pageNum = Number(jumpToPage)
                        if (pageNum >= 1 && pageNum <= totalPages) {
                          setCurrentPage(pageNum)
                          setJumpToPage("")
                        }
                      }
                    }}
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

      {showForm && canAccess(["admin", "super_admin"]) && (
        <VehicleForm
          vehicle={editingVehicle}
          onSubmit={editingVehicle ? handleUpdateVehicle : handleAddVehicle}
          onClose={handleFormClose}
          distinctBrands={distinctBrands}
          distinctTypes={distinctTypes}
          distinctEngines={distinctEngines}
        />
      )}

      {showBulkAdd && canAccess(["admin", "super_admin"]) && (
        <BulkAddForm
          onSubmit={handleBulkAddVehicles}
          onClose={() => setShowBulkAdd(false)}
          distinctBrands={distinctBrands}
          distinctTypes={distinctTypes}
          distinctEngines={distinctEngines}
        />
      )}

      {showBulkEdit && canAccess(["admin", "super_admin"]) && (
        <BulkEditForm
          vehicles={Array.from(selectedIds).map((id) => vehicles.find((v) => v.id === id)!)}
          onSubmit={handleBulkEditVehicles}
          onClose={() => setShowBulkEdit(false)}
          distinctBrands={distinctBrands}
          distinctTypes={distinctTypes}
          distinctEngines={distinctEngines}
        />
      )}

      {showHistoryModal && selectedVehicleForHistory && (
        <VehicleHistoryModal
          vehicleId={selectedVehicleForHistory.id}
          vehicleName={selectedVehicleForHistory.name}
          onClose={() => {
            setShowHistoryModal(false)
            setSelectedVehicleForHistory(null)
          }}
        />
      )}
    </div>
  )
}
