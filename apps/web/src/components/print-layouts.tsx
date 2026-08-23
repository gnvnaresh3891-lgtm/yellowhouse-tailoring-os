'use client';

import React from 'react';
import clsx from 'clsx';
import { useCurrency } from './currency-context';

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
  clientName?: string;
  client?: string;
  garmentType?: string;
  garment?: string;
  assignedKarigar?: string;
  karigar?: string;
  stage: string;
  priority: string;
  dueDate: string;
  estimatedSAM?: number;
  samTotalEstimate?: number;
  notes?: string;
}

export interface PrintableCustomer {
  id: string;
  name: string;
  phone: string;
  gender: string;
  preferredFit: string;
  isVip: boolean;
  measurementsCount: number;
  lastVisit: string;
  email?: string;
  notes?: string;
}

export interface PrintableScheduleItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  clientName?: string;
  karigar?: string;
  stage?: string;
  status?: string;
  notes?: string;
}

export function OrderReceipt({ order, tenantName = 'YellowHouse Atelier' }: { order: Order; tenantName?: string }) {
  const { formatCurrency } = useCurrency();
  return (
    <div className="print-only hidden print:block text-black bg-white p-8 max-w-[800px] mx-auto font-sans">
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">{tenantName}</h1>
          <p className="text-sm text-gray-600 mt-1">Bespoke Couture & Atelier Management</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">INVOICE / RECEIPT</h2>
          <p className="text-sm mt-1">Date: {order.createdAt || new Date().toLocaleDateString()}</p>
          <p className="text-sm font-semibold">Order #: {order.id}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold text-gray-600 uppercase text-xs mb-2">Client Details</h3>
          <p className="font-semibold text-lg">{order.clientName}</p>
          {order.phone && <p className="text-sm">{order.phone}</p>}
        </div>
        <div className="text-right">
          <h3 className="font-bold text-gray-600 uppercase text-xs mb-2">Delivery Due Date</h3>
          <p className="font-semibold text-lg">{order.dueDate}</p>
        </div>
      </div>

      <table className="w-full mb-8 text-sm">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-2 font-bold uppercase text-xs">Garment / Item</th>
            <th className="text-left py-2 font-bold uppercase text-xs">Fabric & Notes</th>
            <th className="text-center py-2 font-bold uppercase text-xs">Qty</th>
            <th className="text-right py-2 font-bold uppercase text-xs">Unit Price</th>
            <th className="text-right py-2 font-bold uppercase text-xs">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="py-3 font-semibold">{item.garmentType}</td>
              <td className="py-3 text-gray-600">{item.fabric || '-'}</td>
              <td className="py-3 text-center">{item.quantity}</td>
              <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="py-3 text-right font-semibold">{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.advancePaid !== undefined && (
            <div className="flex justify-between text-gray-600">
              <span>Advance Paid:</span>
              <span>-{formatCurrency(order.advancePaid)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t border-black pt-2 mt-2">
            <span>Balance Due:</span>
            <span>{formatCurrency(order.balanceDue)}</span>
          </div>
        </div>
      </div>

      <div className="text-center border-t border-gray-200 pt-8 text-sm text-gray-600">
        <p className="font-semibold mb-1">Thank you for choosing {tenantName}</p>
        <p>Retain this receipt for trial appointments & garment collection.</p>
      </div>
    </div>
  );
}

export function CustomerListPrint({ 
  customers, 
  tenantName = 'YellowHouse Atelier' 
}: { 
  customers: PrintableCustomer[]; 
  tenantName?: string 
}) {
  return (
    <div className="print-only hidden print:block text-black bg-white p-8 max-w-[1000px] mx-auto font-sans">
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider">{tenantName}</h1>
          <p className="text-sm text-gray-600">Customer Directory & Client Profiles</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold">CLIENT REGISTER</h2>
          <p className="text-xs text-gray-600">Date: {new Date().toLocaleDateString()}</p>
          <p className="text-xs text-gray-600">Total Clients: {customers.length}</p>
        </div>
      </div>

      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-black font-bold uppercase">
            <th className="py-2.5 px-2">Client ID</th>
            <th className="py-2.5 px-2">Client Name</th>
            <th className="py-2.5 px-2">Phone Number</th>
            <th className="py-2.5 px-2">Email</th>
            <th className="py-2.5 px-2">Gender</th>
            <th className="py-2.5 px-2">Fit Preference</th>
            <th className="py-2.5 px-2 text-center">VIP</th>
            <th className="py-2.5 px-2 text-center">Measurements</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="py-2 px-2 font-mono font-bold">{c.id}</td>
              <td className="py-2 px-2 font-semibold">{c.name}</td>
              <td className="py-2 px-2">{c.phone}</td>
              <td className="py-2 px-2 text-gray-600">{c.email || '-'}</td>
              <td className="py-2 px-2">{c.gender}</td>
              <td className="py-2 px-2">{c.preferredFit}</td>
              <td className="py-2 px-2 text-center font-bold">{c.isVip ? 'YES (VIP)' : 'Standard'}</td>
              <td className="py-2 px-2 text-center">{c.measurementsCount} saved</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
        Confidential Customer Roster &copy; {new Date().getFullYear()} {tenantName}
      </div>
    </div>
  );
}

export function ScheduleListPrint({ 
  schedules, 
  title = 'Workshop Production Schedule & Timesheets',
  tenantName = 'YellowHouse Atelier' 
}: { 
  schedules: PrintableScheduleItem[]; 
  title?: string;
  tenantName?: string;
}) {
  return (
    <div className="print-only hidden print:block text-black bg-white p-8 max-w-[1000px] mx-auto font-sans">
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider">{tenantName}</h1>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold">SCHEDULE LOG</h2>
          <p className="text-xs text-gray-600">Printed: {new Date().toLocaleDateString()}</p>
          <p className="text-xs text-gray-600">Total Entries: {schedules.length}</p>
        </div>
      </div>

      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-black font-bold uppercase">
            <th className="py-2.5 px-2">Job/Entry ID</th>
            <th className="py-2.5 px-2">Date / Time</th>
            <th className="py-2.5 px-2">Client / Subject</th>
            <th className="py-2.5 px-2">Assigned Specialist</th>
            <th className="py-2.5 px-2">Stage / Activity</th>
            <th className="py-2.5 px-2">Status</th>
            <th className="py-2.5 px-2">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {schedules.map((s, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="py-2.5 px-2 font-mono font-bold">{s.id}</td>
              <td className="py-2.5 px-2 font-semibold">{s.date} {s.time ? `(${s.time})` : ''}</td>
              <td className="py-2.5 px-2">{s.clientName || s.title}</td>
              <td className="py-2.5 px-2 font-medium">{s.karigar || '-'}</td>
              <td className="py-2.5 px-2">{s.stage || s.title}</td>
              <td className="py-2.5 px-2 font-bold">{s.status || 'Scheduled'}</td>
              <td className="py-2.5 px-2 text-gray-600 italic">{s.notes || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between text-xs text-gray-500">
        <span>Production Floor Schedule — {tenantName}</span>
        <span>Supervisor Signature: _______________________</span>
      </div>
    </div>
  );
}

export function MeasurementCard({ 
  customerName, 
  measurements, 
  garmentType,
  fitPref = 'Slim Bespoke',
  date = new Date().toLocaleDateString()
}: { 
  customerName: string; 
  measurements: Record<string, number>; 
  garmentType: string;
  fitPref?: string;
  date?: string;
}) {
  return (
    <div className="print-only hidden print:block text-black bg-white p-6 max-w-[148mm] h-[210mm] border-2 border-black font-sans mx-auto shadow-sm">
      <div className="text-center border-b-2 border-black pb-3 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-widest mb-0.5">Measurement Chart</h1>
        <p className="text-xs font-semibold uppercase text-gray-600">Garment: {garmentType} &bull; Fit: {fitPref}</p>
      </div>
      
      <div className="flex justify-between mb-6 text-xs border-b border-gray-300 pb-3">
        <div>
          <span className="text-gray-600 uppercase text-[10px] font-bold block">Client Name</span>
          <span className="font-bold text-sm">{customerName}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-600 uppercase text-[10px] font-bold block">Date Taken</span>
          <span className="font-semibold">{date}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
        {Object.entries(measurements).map(([key, value]) => (
          <div key={key} className="flex justify-between items-end border-b border-dotted border-gray-400 pb-1 text-xs">
            <span className="capitalize font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="font-bold">{value} <span className="text-[10px] font-normal text-gray-500">in</span></span>
          </div>
        ))}
      </div>

      <div className="border border-gray-400 rounded p-3 h-28 text-xs">
        <h3 className="text-[10px] uppercase font-bold text-gray-500 mb-1">Master Cutter Notes & Posture Offsets</h3>
        <p className="text-gray-600 italic">Posture balanced ease applied. Ready for pattern drafting.</p>
      </div>

      <div className="mt-4 pt-2 border-t border-gray-300 flex justify-between text-[10px] text-gray-500">
        <span>YellowHouse CAD Measurement Engine</span>
        <span>Master Tailor Signature: ______________</span>
      </div>
    </div>
  );
}

export function JobCardPrint({ job }: { job: JobCardItem }) {
  const client = job.clientName || job.client || 'Client';
  const garment = job.garmentType || job.garment || 'Garment';
  const karigar = job.assignedKarigar || job.karigar || 'Unassigned';
  const sam = job.estimatedSAM || job.samTotalEstimate || '-';

  return (
    <div className="print-only hidden print:block text-black bg-white p-4 w-[100mm] h-[150mm] border-2 border-black font-sans mx-auto relative">
      <div className="text-center border-b-2 border-black pb-2 mb-3">
        <h1 className="text-2xl font-extrabold font-mono tracking-tighter">{job.id}</h1>
        <p className="text-[10px] text-gray-600 font-bold uppercase mt-0.5">Ref Order: {job.orderId}</p>
      </div>

      <div className="space-y-2.5 text-xs mb-4">
        <div className="flex justify-between border-b border-gray-200 pb-1.5">
          <span className="text-gray-500 uppercase text-[10px] font-bold">Client</span>
          <span className="font-bold">{client}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-1.5">
          <span className="text-gray-500 uppercase text-[10px] font-bold">Garment</span>
          <span className="font-bold">{garment}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-1.5">
          <span className="text-gray-500 uppercase text-[10px] font-bold">Due Date</span>
          <span className="font-bold text-sm">{job.dueDate}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-1.5">
          <span className="text-gray-500 uppercase text-[10px] font-bold">Priority</span>
          <span className={clsx("font-bold uppercase", job.priority === 'Urgent' || job.priority === 'High' ? 'text-black bg-gray-200 px-1.5' : '')}>
            {job.priority}
          </span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-1.5">
          <span className="text-gray-500 uppercase text-[10px] font-bold">Est. SAM Time</span>
          <span className="font-bold">{sam} mins</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-1.5">
          <span className="text-gray-500 uppercase text-[10px] font-bold">Karigar</span>
          <span className="font-bold">{karigar}</span>
        </div>
      </div>

      {job.notes && (
        <div className="mb-3">
          <span className="text-gray-500 uppercase text-[10px] font-bold block mb-0.5">Artisan Notes</span>
          <p className="text-[10px] border border-gray-300 p-1.5 min-h-[30px] italic">{job.notes}</p>
        </div>
      )}

      {/* Barcode Placeholder Area */}
      <div className="absolute bottom-3 left-3 right-3 text-center">
        <div className="h-10 border border-black flex items-center justify-center bg-gray-50 mb-0.5">
          <span className="text-black text-xs font-mono font-bold tracking-[0.25em]">*{job.id}*</span>
        </div>
        <span className="text-[9px] font-mono">{job.id} &bull; {job.stage}</span>
      </div>
    </div>
  );
}
