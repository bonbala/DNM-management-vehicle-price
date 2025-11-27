"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-context"
import { Plus, Edit2, Trash2, LogOut, ArrowLeft, Loader2 } from "lucide-react"
import type { User, UserRole } from "@/types/user"

export default function UsersManagementPage() {
  const router = useRouter()
  const { user, logout, canAccess } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    staffName: "",
    password: "",
    role: "user" as UserRole,
  })

  // Check authorization
  useEffect(() => {
    if (!canAccess(["super_admin"])) {
      router.push("/")
    }
  }, [canAccess, router])

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        const response = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Lỗi khi tải danh sách tài khoản")
        }

        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error("[v0] Failed to load users:", error)
        alert("Lỗi khi tải danh sách tài khoản")
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  const handleAddUser = async () => {
    try {
      if (!formData.username || !formData.staffName || !formData.password) {
        alert("Vui lòng điền đầy đủ thông tin")
        return
      }

      const token = localStorage.getItem("token")
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Lỗi khi tạo tài khoản")
      }

      const newUser = await response.json()
      setUsers([...users, newUser])
      setShowForm(false)
      setFormData({ username: "", staffName: "", password: "", role: "user" })
      alert("Tạo tài khoản thành công")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Lỗi khi tạo tài khoản")
    }
  }

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error("Lỗi khi cập nhật role")
      }

      const updated = await response.json()
      setUsers(users.map((u) => (u.id === userId ? updated : u)))
      alert("Cập nhật role thành công")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Lỗi khi cập nhật role")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Lỗi khi xóa tài khoản")
      }

      setUsers(users.filter((u) => u.id !== userId))
      alert("Xóa tài khoản thành công")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Lỗi khi xóa tài khoản")
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
                <h1 className="text-3xl font-bold text-foreground">Quản lý Tài khoản</h1>
                <p className="text-sm text-muted-foreground mt-1">Quản lý người dùng và phân quyền</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="text-sm text-right">
                <p className="text-muted-foreground">Đăng nhập với</p>
                <p className="font-medium text-foreground">{user?.username}</p>
              </div>
              <Button variant="outline" onClick={logout} className="gap-2 bg-transparent hover:bg-red-500 ">
                <LogOut size={18} />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus size={18} />
            Thêm Tài khoản Mới
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="p-6 mb-6 border-2 border-primary">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Tạo Tài khoản Mới</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tài khoản *</label>
                  <Input
                    type="text"
                    placeholder="Nhập tài khoản"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tên Nhân Viên *</label>
                  <Input
                    type="text"
                    placeholder="Nhập tên nhân viên"
                    value={formData.staffName}
                    onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mật khẩu *</label>
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="user">User (Xem danh sách)</option>
                    <option value="admin">Admin (Quản lý xe)</option>
                    <option value="super_admin">Super Admin (Quản lý tài khoản)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ username: "", staffName: "", password: "", role: "user" })
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleAddUser}>Tạo Tài khoản</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">STT</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Tài khoản</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Tên Nhân Viên</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Ngày Tạo</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-6 py-3 text-sm">{index + 1}</td>
                    <td className="px-6 py-3 text-sm font-medium">{u.username}</td>
                    <td className="px-6 py-3 text-sm">{u.staffName}</td>
                    <td className="px-6 py-3 text-sm">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)}
                        className="px-3 py-1 border border-border rounded-md bg-background text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "-"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(u.id)}
                        className="gap-1"
                      >
                        <Trash2 size={16} />
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có tài khoản nào
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
