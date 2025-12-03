"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { User, UserRole } from "@/types/user"

interface EditUserModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onSave: (updates: { staffName: string; role: UserRole }) => Promise<void>
}

export function EditUserModal({ isOpen, user, onClose, onSave }: EditUserModalProps) {
  const [staffName, setStaffName] = useState(user?.staffName || "")
  const [role, setRole] = useState<UserRole>(user?.role || "user")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Cập nhật state khi user thay đổi (khi modal mở)
  useEffect(() => {
    if (isOpen && user) {
      setStaffName(user.staffName)
      setRole(user.role)
      setError("")
    }
  }, [isOpen, user])

  const handleSave = async () => {
    if (!staffName.trim()) {
      setError("Tên nhân viên không được để trống")
      return
    }

    try {
      setIsLoading(true)
      setError("")
      await onSave({ staffName: staffName.trim(), role })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi cập nhật")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Thông Tin Tài Khoản</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-sm font-medium">
              Tài Khoản (Không thể sửa)
            </Label>
            <Input
              id="username"
              value={user?.username || ""}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="staffName" className="text-sm font-medium">
              Tên Nhân Viên
            </Label>
            <Input
              id="staffName"
              placeholder="Nhập tên nhân viên"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-sm font-medium">
              Vai Trò
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)} disabled={isLoading}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Nhân Viên Xem (user)</SelectItem>
                <SelectItem value="admin">Quản Lý Xe (admin)</SelectItem>
                <SelectItem value="super_admin">Admin Cấp Cao (super_admin)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
