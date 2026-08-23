'use client';

import React from 'react';
import clsx from 'clsx';

// Simplified types for the print layouts to avoid missing imports, 
// assuming these match the actual types in the project
interface Order {
  id: string;
  clientName: string;
  phone?: string;
  dueDate: string;
  items: {
    garmentType: string;
    fabric?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  subtotal: number;
  advancePaid?: number;
  balanceDue: number;
  createdAt?: string;
}

interface JobCardItem {
  id: string;
  orderId: string;
  clientName: string;
  garmentType: string;
  assignedKarigar?: string;
  stage: string;
  priority: string;
  dueDate: string;
  estimatedSAM?: number;
  notes?: string;
}

export function OrderReceipt({ order, tenantName = 'YellowHouse' }: { order: Order; tenantName?: string }) {
  return (
    <div className="print-only hidden print:block text-black bg-white p-8 max-w-[800px] mx-auto font-sans">
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">{tenantName}</h1>
          <p className="text-sm text-gray-600 mt-1">Premium Tailoring & Design</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">RECEIPT / INVOICE</h2>
          <p className="text-sm mt-1">Date: {order.createdAt || new Date().toLocaleDateString()}</p>
          <p className="text-sm font-semibold">Order #: {order.id}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold text-gray-600 uppercase text-xs mb-2">Billed To</h3>
          <p className="font-semibold text-lg">{order.clientName}</p>
          {order.phone && <p className="text-sm">{order.phone}</p>}
        </div>
        <div className="text-right">
          <h3 className="font-bold text-gray-600 uppercase text-xs mb-2">Due Date</h3>
          <p className="font-semibold text-lg">{order.dueDate}</p>
        </div>
      </div>

      <table className="w-full mb-8 text-sm">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-2 font-bold uppercase text-xs">Item</th>
            <th className="text-left py-2 font-bold uppercase text-xs">Fabric Details</th>
            <th className="text-center py-2 font-bold uppercase text-xs">Qty</th>
            <th className="text-right py-2 font-bold uppercase text-xs">Price</th>
            <th className="text-right py-2 font-bold uppercase text-xs">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="py-3 font-semibold">{item.garmentType}</td>
              <td className="py-3 text-gray-600">{item.fabric || '-'}</td>
              <td className="py-3 text-center">{item.quantity}</td>
              <td className="py-3 text-right">₹{item.unitPrice.toFixed(2)}</td>
              <td className="py-3 text-right font-semibold">₹{item.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          {order.advancePaid !== undefined && (
            <div className="flex justify-between text-gray-600">
              <span>Advance Paid:</span>
              <span>-₹{order.advancePaid.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t border-black pt-2 mt-2">
            <span>Balance Due:</span>
            <span>₹{order.balanceDue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="text-center border-t border-gray-200 pt-8 text-sm text-gray-600">
        <p className="font-semibold mb-1">Thank you for choosing {tenantName}</p>
        <p>Keep this receipt for collecting your garments. For tracking, please contact our store.</p>
      </div>
    </div>
  );
}

export function MeasurementCard({ 
  customerName, 
  measurements, 
  garmentType 
}: { 
  customerName: string; 
  measurements: Record<string, number>; 
  garmentType: string;
}) {
  return (
    <div className="print-only hidden print:block text-black bg-white p-6 max-w-[148mm] h-[210mm] border border-black font-sans mx-auto shadow-sm">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">Measurements</h1>
        <p className="text-sm font-semibold">{garmentType}</p>
      </div>
      
      <div className="flex justify-between mb-8 text-sm border-b border-gray-300 pb-4">
        <div>
          <span className="text-gray-600 uppercase text-xs font-bold block mb-1">Customer</span>
          <span className="font-bold text-lg">{customerName}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-600 uppercase text-xs font-bold block mb-1">Date Recorded</span>
          <span className="font-semibold">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
        {Object.entries(measurements).map(([key, value]) => (
          <div key={key} className="flex justify-between items-end border-b border-dotted border-gray-400 pb-1">
            <span className="capitalize text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="font-bold">{value} <span className="text-xs font-normal text-gray-500">in</span></span>
          </div>
        ))}
      </div>

      <div className="mt-8 border border-gray-300 rounded p-4 h-48">
        <h3 className="text-xs uppercase font-bold text-gray-500 mb-2">Tailor Notes & Specifics</h3>
      </div>
    </div>
  );
}

export function JobCardPrint({ job }: { job: JobCardItem }) {
  return (
    <div className="print-only hidden print:block text-black bg-white p-4 w-[100mm] h-[150mm] border-2 border-black font-sans mx-auto relative">
      <div className="text-center border-b-2 border-black pb-2 mb-4">
        <h1 className="text-3xl font-extrabold font-mono tracking-tighter">{job.id}</h1>
        <p className="text-xs text-gray-600 font-bold uppercase mt-1">Ref: {job.orderId}</p>
      </div>

      <div className="space-y-4 text-sm mb-6">
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-500 uppercase text-xs font-bold">Client</span>
          <span className="font-bold">{job.clientName}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-500 uppercase text-xs font-bold">Garment</span>
          <span className="font-bold">{job.garmentType}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-500 uppercase text-xs font-bold">Due Date</span>
          <span className="font-bold text-lg">{job.dueDate}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-500 uppercase text-xs font-bold">Priority</span>
          <span className={clsx("font-bold uppercase", job.priority === 'High' ? 'text-black bg-gray-200 px-2' : '')}>
            {job.priority}
          </span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-500 uppercase text-xs font-bold">Est. Time</span>
          <span className="font-bold">{job.estimatedSAM || '-'} mins</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-500 uppercase text-xs font-bold">Karigar</span>
          <span className="font-bold">{job.assignedKarigar || 'Unassigned'}</span>
        </div>
      </div>

      {job.notes && (
        <div className="mb-4">
          <span className="text-gray-500 uppercase text-xs font-bold block mb-1">Notes</span>
          <p className="text-xs border border-gray-300 p-2 min-h-[40px] italic">{job.notes}</p>
        </div>
      )}

      {/* Barcode Placeholder Area */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <div className="h-12 border-2 border-black flex items-center justify-center bg-gray-50 mb-1">
          <span className="text-gray-400 text-xs tracking-[0.2em]">[BARCODE]</span>
        </div>
        <span className="text-[10px] font-mono">{job.id}</span>
      </div>
    </div>
  );
}
