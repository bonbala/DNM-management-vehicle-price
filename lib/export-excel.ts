import type { Vehicle } from "@/types/vehicle"

/**
 * Export vehicles to Excel file using ExcelJS
 * @param vehicles - Array of vehicles to export
 * @param fromDate - Start date (optional)
 * @param toDate - End date (optional)
 */
export async function exportVehiclesToExcel(
  vehicles: Vehicle[],
  fromDate?: Date,
  toDate?: Date
) {
  // Dynamically import ExcelJS to avoid SSR issues
  const ExcelJS = (await import("exceljs")).default

  // Format dates
  const formatDate = (date: Date) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = String(d.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  }

  // Create title with date range
  const from = fromDate ? formatDate(fromDate) : "..."
  const to = toDate ? formatDate(toDate) : "..."
  const title = `Danh sách giá xe ${from} - ${to}`

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Danh sách xe")

  // Add title row
  worksheet.addRow([title])
  const titleCell = worksheet.getCell("A1")
  titleCell.font = { bold: true, size: 14, color: { argb: "FF000000" } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }
  worksheet.mergeCells("A1:G1")
  worksheet.getRow(1).height = 25

  // Add empty row
  worksheet.addRow([])

  // Add header row
  const headerRow = worksheet.addRow([
    "Tên Xe",
    "Năm",
    "Hãng",
    "Loại",
    "Dung Tích",
    "Giá Thị Trường",
    "Giá Thu",
  ])

  // Style header row
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF366092" },
    }
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 }
    cell.alignment = { horizontal: "center", vertical: "middle" }
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    }
  })

  // Add data rows
  vehicles.forEach((vehicle) => {
    const row = worksheet.addRow([
      vehicle.name,
      vehicle.year,
      vehicle.brand,
      vehicle.type,
      vehicle.engineCapacity,
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(vehicle.salePrice),
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(vehicle.buyPrice),
    ])

    // Center align all cells except price (align right)
    row.eachCell((cell, colNumber) => {
      cell.alignment = {
        horizontal: colNumber === 6 || colNumber === 7 ? "right" : "center",
        vertical: "middle",
      }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      }
    })
  })

  // Set column widths
  worksheet.columns = [
    { width: 25 }, // Tên Xe
    { width: 10 }, // Năm
    { width: 15 }, // Hãng
    { width: 15 }, // Loại
    { width: 15 }, // Dung Tích
    { width: 20 }, // Giá Thị Trường
    { width: 20 }, // Giá Thu
  ]

  // Generate filename with current date
  const now = new Date()
  const filename = `Danh_sach_gia_xe_${formatDate(now)}.xlsx`

  // Convert to buffer and download
  const buffer = await workbook.xlsx.writeBuffer()
  downloadBuffer(buffer, filename)
}

/**
 * Export vehicles to Excel with current date range
 * @param vehicles - Array of vehicles to export
 */
export async function exportVehiclesWithDateRange(vehicles: Vehicle[]) {
  const today = new Date()
  const today_formatted = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  await exportVehiclesToExcel(vehicles, today_formatted, today_formatted)
}

/**
 * Export ALL vehicles from database to Excel
 */
export async function exportAllVehiclesToExcel() {
  try {
    // Fetch all vehicles from API
    const response = await fetch("/api/vehicles", {
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Lỗi khi lấy danh sách xe")
    }

    const vehicles: Vehicle[] = await response.json()

    if (vehicles.length === 0) {
      throw new Error("Không có xe trong database")
    }

    const today = new Date()
    const today_formatted = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    await exportVehiclesToExcel(vehicles, today_formatted, today_formatted)
  } catch (error) {
    throw error instanceof Error ? error : new Error("Lỗi khi xuất Excel")
  }
}

/**
 * Helper function to download buffer as file
 */
function downloadBuffer(buffer: any, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
