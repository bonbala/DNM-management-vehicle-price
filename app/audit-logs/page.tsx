"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, LogOut, ChevronLeft, ChevronRight, MapPin, AlertCircle, CheckCircle } from "lucide-react"
import type { AuditLog } from "@/types/audit-log"
import Link from "next/link"

export default function AuditLogsPage() {
  const router = useRouter()
  const { user, logout, canAccess } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Redirect if not super_admin
    if (!canAccess(["super_admin"])) {
      router.push("/")
      return
    }

    const loadLogs = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/audit/logs?page=${currentPage}&limit=${limit}`,
          {
            credentials: "include",
          }
        )

        if (!response.ok) {
          throw new Error("Lỗi khi lấy audit logs")
        }

        const result = await response.json()
        setLogs(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
      } catch (error) {
        console.error("[v0] Failed to load audit logs:", error)
        alert(error instanceof Error ? error.message : "Lỗi khi tải logs")
      } finally {
        setIsLoading(false)
      }
    }

    loadLogs()
  }, [currentPage, limit, canAccess, router])

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString("vi-VN")
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      LOGIN_SUCCESS: "Đăng nhập thành công",
      LOGIN_FAILED: "Đăng nhập thất bại",
      LOGOUT: "Đăng xuất",
    }
    return labels[action] || action
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "LOGIN_SUCCESS":
        return "text-green-600 bg-green-50"
      case "LOGIN_FAILED":
        return "text-red-600 bg-red-50"
      case "LOGOUT":
        return "text-blue-600 bg-blue-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  if (!canAccess(["super_admin"])) {
    return null
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
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="gap-2"
              >
                <ArrowLeft size={18} />
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
                <p className="text-sm text-muted-foreground mt-1">Ghi nhật ký đăng nhập hệ thống</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="text-sm text-right">
                <p className="text-muted-foreground">Đăng nhập với</p>
                <p className="font-medium text-foreground">{user?.username}</p>
              </div>
              <Button variant="outline" onClick={logout} className="gap-2 bg-transparent hover:bg-red-500">
                <LogOut size={18} />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Tổng cộng</p>
            <p className="text-2xl font-bold">{total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Trang hiện tại</p>
            <p className="text-2xl font-bold">{currentPage} / {totalPages}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Trên trang</p>
            <p className="text-2xl font-bold">{logs.length}</p>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <Input
            placeholder="Tìm kiếm theo username, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>

        {/* Logs Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Thời gian</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Hành động</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">IP Address</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Vị trí</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Thiết bị</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      Không có logs
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr key={log.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="px-6 py-3 text-sm">{formatDate(log.timestamp)}</td>
                      <td className="px-6 py-3 text-sm font-medium">{log.username}</td>
                      <td className="px-6 py-3 text-sm">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-md ${getActionColor(log.action)}`}>
                          {log.action === "LOGIN_SUCCESS" && <CheckCircle size={14} />}
                          {log.action === "LOGIN_FAILED" && <AlertCircle size={14} />}
                          {getActionLabel(log.action)}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm font-mono">{log.ipAddress}</td>
                      <td className="px-6 py-3 text-sm">
                        {log.geolocation ? (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span className="text-xs">
                              {log.geolocation.latitude.toFixed(4)}, {log.geolocation.longitude.toFixed(4)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        <span className="text-xs truncate max-w-xs" title={log.userAgent}>
                          {log.userAgent ? log.userAgent.substring(0, 50) : "-"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="10">10 trên trang</option>
                <option value="20">20 trên trang</option>
                <option value="50">50 trên trang</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-2"
              >
                <ChevronLeft size={18} />
                Trước
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Trang {currentPage} của {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="gap-2"
              >
                Sau
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
