"use client";

import React, { useEffect, useState } from 'react'
import type { Vehicle } from '@/types/vehicle'
import Image from 'next/image';

export default function PawnPage() {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Tháng trong JS chạy từ 0-11
  const year = today.getFullYear();
  const index = String(day + month + year) // STT Biên bản
  useEffect(() => {
    // Lấy thông tin xe từ localStorage
    const vehicleData = localStorage.getItem('selectedVehicle')
    if (vehicleData) {
      try {
        setVehicle(JSON.parse(vehicleData))
      } catch (error) {
        console.error('Error parsing vehicle data:', error)
      }
    }

    // In trang sau khi dữ liệu được load
    const printTimer = setTimeout(() => {
      window.print()
    }, 500)

    return () => clearTimeout(printTimer)
  }, [])

  return (
    /* Thêm các class print:p-0 để tận dụng tối đa diện tích giấy khi in */
    <div className="max-w-4xl mx-auto p-8 bg-white text-black font-serif my-10 shadow-lg print:shadow-none print:my-0 print:p-10 print:w-full">
      {/* Header: Logo + Tiêu đề biên bản */}
      <div className='flex justify-between items-center mb-4'>
        <div className=''>
          <Image
            src="/logo-DNM.png"
            alt="DNM Logo"
            width={100}
            height={40}
            className="mx-auto"
            priority
          />
        </div>
        <div className='italic text-sm print:text-[0.6rem]'>
            <p className='uppercase'>Cơ sở dịch vụ DNM.HT</p>
            <p>Phone/Zalo: 0797097668</p>
        </div>
        <div className="text-sm">
          <h1 className="text-xl font-bold uppercase">
            Biên Bản Xác Định Giá Trị Tài Sản
          </h1>
        </div>
      </div>


      {/* Header: Thu nhỏ margin-bottom khi in */}
      <div className="justify-between mb-4 print:mb-2">
        <div>
          <p className="italic text-sm">Số: {index}/BB-XĐGTS</p>
          <p>Ngày: {day}/{month}/{year}</p>
          <p>Địa điểm: 03 Nguyễn Đình Tứ, Phường Mỹ Thượng, Tp Huế</p>
        </div>
        
      </div>



      {/* Thông tin đơn vị - Thu nhỏ margin */}
      <section className="mb-4 print:mb-6">
        <h2 className="bg-blue-300 border border-black border-b-0 p-1.5 font-bold uppercase text-sm">I. Thông tin đơn vị xác định giá trị tài sản</h2>
        <table className="w-full border-collapse border border-black text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-1.5 w-1/3 font-semibold">Tên đơn vị xác định giá trị:</td>
              <td className="border border-black p-1.5 italic">DNM.ht</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-semibold">Địa chỉ:</td>
              <td className="border border-black p-1.5 italic">03 Nguyễn Đình Tứ, Phường Mỹ Thượng, Tp Huế</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Thông tin tài sản */}
      <section className="mb-4 print:mb-6">
        <h2 className="bg-blue-300 border border-black border-b-0 p-1.5 font-bold uppercase text-sm">II. Thông tin tài sản</h2>
        <table className="w-full border-collapse border border-black text-left text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1.5 w-1/2">Danh mục</th>
              <th className="border border-black p-1.5 w-1/2">Mô tả</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='border border-black p-1.5 font-medium'>
                Tên xe
              </td>
              <td className="border border-black p-1.5 italic">{vehicle?.name || "Không có thông tin"}</td>
            </tr>
            <tr>
              <td className='border border-black p-1.5 font-medium'>
                Năm
              </td>
              <td className="border border-black p-1.5 italic">{vehicle?.year || "Không có thông tin"}</td>
            </tr>
            <tr>
              <td className='border border-black p-1.5 font-medium'>
                Hãng
              </td>
              <td className="border border-black p-1.5 italic">{vehicle?.brand || "Không có thông tin"}</td>
            </tr>
            <tr>
              <td className='border border-black p-1.5 font-medium'>
                Loại xe
              </td>
              <td className="border border-black p-1.5 italic">{vehicle?.type || "Không có thông tin"}</td>
            </tr>
            <tr>
              <td className='border border-black p-1.5 font-medium'>
                Dung tích
              </td>
              <td className="border border-black p-1.5 italic">{vehicle?.engineCapacity || "Không có thông tin"}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-medium">Tình trạng</td>
              <td className="border border-black p-1.5 italic">Đã qua sử dụng</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Xác định giá trị */}
      <section className="mb-6 print:mb-6">
        <h2 className="bg-blue-300 border border-black border-b-0 p-1.5 font-bold uppercase text-sm">III. Xác định giá trị</h2>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1.5 w-1/2">Nội dung</th>
              <th className="border border-black p-1.5 w-1/2">Giá trị (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1.5">Giá trị thị trường</td>
              <td className="border border-black p-1.5 text-right">{vehicle?.salePrice?.toLocaleString('vi-VN') || "Không có thông tin"} đ</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5">Giá trị cơ sở</td>
              <td className="border border-black p-1.5 text-right">{vehicle?.buyPrice?.toLocaleString('vi-VN') || "Không có thông tin"} đ</td>
            </tr>
          </tbody>
        </table>
        <p className="italic text-[12px] leading-tight border border-t-0 border-black p-1.5">
          "Giá trị trên được xác định căn cứ tình trạng thực tế tài sản, giá thị trường tại thời điểm lập biên bản và chính sách nội bộ của đơn vị."
        </p>
      </section>

      {/* Chữ ký - Giảm khoảng trống chữ ký xuống vừa đủ */}
      {/* <div className="grid grid-cols-2 gap-10 mt-8 print:mt-4 text-center font-bold text-sm">
        <div >
          <p className="uppercase "></p>
          <p className="font-normal italic text-xs mb-16 print:mb-12">(Ký, ghi rõ họ tên)</p>
        </div>
        <div >
          <p className="uppercase ">Bên sở hữu tài sản</p>
          <p className="font-normal italic text-xs mb-16 print:mb-12">(Ký, ghi rõ họ tên)</p>
        </div>
        
      </div> */}
      <section>
        <table className='w-full border-collapse border border-black text-sm text-center'>
          <thead>
            <tr className='bg-blue-300'>
              <th className='border border-black p-1.5 text-sm font-bold w-1/2'>
                <p className='uppercase'>Đại diện đơn vị</p>
                <p className='font-normal'>(Ký, ghi rõ họ tên)</p>
              </th>
              <th className='border border-black p-1.5 text-sm font-bold w-1/2'>
                <p className='uppercase'>Bên sở hữu tài sản</p>
                <p className='font-normal'>(Ký, ghi rõ họ tên)</p>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='border border-black h-36'></td>
              <td className='border border-black h-36'></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* CSS bổ trợ để ép trang in không bị tràn */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm; /* Lề giấy vừa đủ đẹp */
          }
          body {
            margin: 0;
            padding: 0;
          }
          /* Chống ngắt trang giữa các bảng */
          section {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}

