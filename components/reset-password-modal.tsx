"use client"

import { useState } from "react"
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
import type { User } from "@/types/user"

interface ResetPasswordModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onReset: (newPassword: string) => Promise<void>
}

export function ResetPasswordModal({ isOpen, user, onClose, onReset }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleReset = async () => {
    if (!newPassword.trim()) {
      setError("Mật khẩu mới không được để trống")
      return
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      return
    }

    try {
      setIsLoading(true)
      setError("")
      await onReset(newPassword)
      setNewPassword("")
      setConfirmPassword("")
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi đặt lại mật khẩu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đặt Lại Mật Khẩu</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 pb-4">
          <p className="text-sm text-gray-600">
            Tài khoản: <strong>{user?.username}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Tên nhân viên: <strong>{user?.staffName}</strong>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="newPassword" className="text-sm font-medium">
              Mật Khẩu Mới
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Xác Nhận Mật Khẩu
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleReset} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
            {isLoading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
