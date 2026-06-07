"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import type { ViolationContract } from "@/types/violation-contract"

export default function HdvpPrintPage() {
  const [contract, setContract] = useState<ViolationContract | null>(null)

  const today = new Date()
  const day = String(today.getDate()).padStart(2, "0")
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const year = today.getFullYear()

  useEffect(() => {
    const raw = localStorage.getItem("selectedViolationContract")
    if (raw) {
      try {
        setContract(JSON.parse(raw))
      } catch {
        // ignore
      }
    }
    const t = setTimeout(() => window.print(), 500)
    return () => clearTimeout(t)
  }, [])

  const formatDate = (date?: string | Date) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("vi-VN")
  }

  const statusLabel = contract?.status === "processed" ? "Đã xử lý" : "Chờ xử lý"

  return (
    <div
      className="max-w-4xl mx-auto p-8 bg-white text-black my-10 shadow-lg print:shadow-none print:my-0 print:p-0 print:w-full print:min-h-screen"
      style={{ minHeight: "auto" }}
    >
      <div className="print:flex print:flex-col print:h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <Image
              src="/logo-DNM.png"
              alt="DNM Logo"
              width={100}
              height={40}
              className="mx-auto"
              priority
            />
          </div>
          <div className="italic text-sm print:text-[0.6rem]">
            <p className="uppercase">Cơ sở dịch vụ DNM.HT</p>
            <p>Phone/Zalo: 0797097668</p>
          </div>
          <div className="text-sm text-right">
            <h1 className="text-xl font-bold uppercase">
              Biên Bản Khách Hàng Vi Phạm
            </h1>
          </div>
        </div>

        {/* Meta */}
        <div className="mb-4 print:mb-2">
          <p className="italic text-sm">
            Số: {day}{month}{year}/BB-KHVP
          </p>
          <p>Ngày: {day}/{month}/{year}</p>
          <p>Địa điểm: 03 Nguyễn Đình Tứ, Phường Mỹ Thượng, Tp Huế</p>
        </div>

        {/* Section I: Đơn vị */}
        <section className="mb-4 print:mb-6">
          <h2 className="bg-blue-300 border border-black border-b-0 p-1.5 font-bold uppercase text-sm">
            I. Thông tin đơn vị lập biên bản
          </h2>
          <table className="w-full border-collapse border border-black text-sm">
            <tbody>
              <tr>
                <td className="border border-black p-1.5 w-1/3 font-semibold">Tên đơn vị:</td>
                <td className="border border-black p-1.5 italic">DNM.ht</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-semibold">Địa chỉ:</td>
                <td className="border border-black p-1.5 italic">
                  03 Nguyễn Đình Tứ, Phường Mỹ Thượng, Tp Huế
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Section II: Thông tin khách hàng */}
        <section className="mb-4 print:mb-6">
          <h2 className="bg-blue-300 border border-black border-b-0 p-1.5 font-bold uppercase text-sm">
            II. Thông tin khách hàng vi phạm
          </h2>
          <table className="w-full border-collapse border border-black text-left text-sm">
            <tbody>
              <tr>
                <td className="border border-black p-1.5 w-1/3 font-semibold">Họ và tên:</td>
                <td className="border border-black p-1.5 italic">{contract?.customerName || "—"}</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-semibold">Số điện thoại:</td>
                <td className="border border-black p-1.5 italic">{contract?.phoneNumber || "—"}</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-semibold">CMND / CCCD:</td>
                <td className="border border-black p-1.5 italic font-mono">{contract?.customerId || "—"}</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-semibold">Địa chỉ:</td>
                <td className="border border-black p-1.5 italic">{contract?.address || "—"}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Section III: Thông tin vi phạm */}
        <section className="mb-4 print:mb-6">
          <h2 className="bg-blue-300 border border-black border-b-0 p-1.5 font-bold uppercase text-sm">
            III. Thông tin vi phạm
          </h2>
          <table className="w-full border-collapse border border-black text-left text-sm">
            <tbody>
              <tr>
                <td className="border border-black p-1.5 w-1/3 font-semibold">Phương tiện vi phạm:</td>
                <td className="border border-black p-1.5 italic">{contract?.vehicleName || "—"}</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-semibold">Ngày vi phạm:</td>
                <td className="border border-black p-1.5 italic">{formatDate(contract?.violationDate)}</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-semibold">Trạng thái:</td>
                <td className="border border-black p-1.5 italic">{statusLabel}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Section IV: Lịch sử / Ghi chú */}
        <section className="mb-6 print:mb-6">
          <h2 className="bg-blue-300 border border-black border-b-0 p-1.5 font-bold uppercase text-sm">
            IV. Lịch sử / Ghi chú
          </h2>
          <div className="border border-black p-2 text-sm min-h-16 italic whitespace-pre-wrap leading-relaxed">
            {contract?.notes?.trim() || "Không có ghi chú"}
          </div>
        </section>

        {/* Chữ ký */}
        <section>
          <table className="w-full border-collapse border border-black text-sm text-center">
            <thead>
              <tr className="bg-blue-300">
                <th className="border border-black p-1.5 text-sm font-bold w-1/2">
                  <p className="uppercase">Đại diện đơn vị</p>
                  <p className="font-normal">(Ký, ghi rõ họ tên)</p>
                </th>
                <th className="border border-black p-1.5 text-sm font-bold w-1/2">
                  <p className="uppercase">Khách hàng vi phạm</p>
                  <p className="font-normal">(Ký, ghi rõ họ tên)</p>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black h-36"></td>
                <td className="border border-black h-36"></td>
              </tr>
            </tbody>
          </table>
        </section>

        <div className="print:flex-1"></div>

        <style jsx global>{`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            section {
              break-inside: avoid;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
