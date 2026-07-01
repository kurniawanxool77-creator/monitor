import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Edit, Trash2, Eye, X, UserPlus, Minus,
  Check, CheckCircle2, FileCheck, ChevronRight, ChevronDown, RefreshCw, RotateCcw,
  Info, FileText
} from 'lucide-react';

import { UpdateProgressModal } from "../../modals/UpdateProgressModal";
import { useAppData } from "../../../hooks/AppDataContext";

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

import { SubKegiatanFormModal } from "../../modals/SubKegiatanFormModal";

export function AgendaSubKegiatan() {
  const {
    dataUraian: uraianAnggaranData,
    subKegiatanMeta,
    getSubKegiatanList,
    addRealisasi,
    updateSubKegiatanMetadata,
    approveSubKegiatan,
    deleteSubKegiatan,
    deleteUraian,
    addActivityLog
  } = useAppData();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isSuperadmin = user?.role === 'superadmin';

  const subKegiatans = getSubKegiatanList();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterBagian, setFilterBagian] = useState('semua');
  const [filterBulan, setFilterBulan] = useState((new Date().getMonth() + 1).toString());
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString());
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [updateProgressFor, setUpdateProgressFor] = useState(null);
  const [showEditModalFor, setShowEditModalFor] = useState(null);
  const [modalInitialPanel, setModalInitialPanel] = useState('progress');

  function openUpdateModal(subKegiatanId, panel) {
    setModalInitialPanel(panel);
    setUpdateProgressFor(subKegiatanId);
  }

  function toggleStep(subKegiatanId, stepId, catatan) {
    const k = subKegiatans.find(x => x.id === subKegiatanId);
    if (!k) return;
    const newSteps = k.steps.map((s) =>
      s.id === stepId ? { ...s, selesai: !s.selesai, catatan: !s.selesai ? catatan : undefined } : s
    );
    updateSubKegiatanMetadata({
      id: subKegiatanId,
      penanggungJawab: k.penanggungJawab,
      tanggalMulai: k.tanggalMulai,
      tanggalSelesai: k.tanggalSelesai,
      deskripsi: k.deskripsi,
      steps: newSteps
    });
  }

  function handleSaveRealisasi(subKegiatanId, amount) {
    addRealisasi(subKegiatanId, amount);
  }

  function handleSaveEdit(subKegiatanId, updatedFields) {
    const k = subKegiatans.find(x => x.id === subKegiatanId);
    if (!k) return;

    updateSubKegiatanMetadata({
      id: subKegiatanId,
      penanggungJawab: updatedFields.penanggungJawab !== undefined ? updatedFields.penanggungJawab : k.penanggungJawab,
      tanggalMulai: updatedFields.tanggalMulai !== undefined ? updatedFields.tanggalMulai : k.tanggalMulai,
      tanggalSelesai: updatedFields.tanggalSelesai !== undefined ? updatedFields.tanggalSelesai : k.tanggalSelesai,
      deskripsi: updatedFields.deskripsi !== undefined ? updatedFields.deskripsi : k.deskripsi,
      steps: updatedFields.steps || k.steps
    });
  }

  const filteredSubKegiatan = subKegiatans.filter((subKegiatan) => {
    const matchSearch = subKegiatan.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'semua' || subKegiatan.status === filterStatus;
    const matchBagian = filterBagian === 'semua' || subKegiatan.bidang === filterBagian;
    return matchSearch && matchStatus && matchBagian;
  });

  const allBidangOptions = Array.from(new Set(subKegiatans.map((k) => k.bidang)));

  function handleDeleteSubKegiatan(kode, nama) {
    setDeleteConfirm({ kode, nama });
  }

  function confirmDelete() {
    if (!deleteConfirm) return;
    const { kode } = deleteConfirm;
    deleteSubKegiatan(kode);
    addActivityLog({ user: user?.nama || 'Unknown', action: 'Hapus Kegiatan', details: `Menghapus: ${deleteConfirm.nama} (${kode})` });
    setDeleteConfirm(null);
  }

  // subKegiatan yang sedang dibuka update progress-nya
  const updateSubKegiatan = updateProgressFor ? subKegiatans.find((k) => k.id === updateProgressFor) : null;

  const [expandedKode, setExpandedKode] = useState(new Set(uraianAnggaranData.filter(u => u.level === 1 || u.level === 2).map(u => u.kode)));
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  function toggleExpand(kode) {
    setExpandedKode(prev => {
      const next = new Set(prev);
      if (next.has(kode)) {
        next.delete(kode);
        uraianAnggaranData.filter(u => u.kode.startsWith(kode + '.')).forEach(child => next.delete(child.kode));
      } else {
        next.add(kode);
      }
      return next;
    });
  }

  // Filter only active nodes (or nodes with active descendants) to show on Agenda page
  const activeUraianData = uraianAnggaranData.filter(u => {
    const hasMeta = subKegiatans.some(k => k.id === u.kode);
    const hasBudget = u.target > 0 || u.realisasi > 0;
    if (hasMeta || hasBudget) return true;

    return uraianAnggaranData.some(child => {
      if (child.kode === u.kode || !child.kode.startsWith(u.kode + '.')) return false;
      const childMeta = subKegiatans.some(k => k.id === child.kode);
      const childBudget = child.target > 0 || child.realisasi > 0;
      return childMeta || childBudget;
    });
  });

  const finalDataToRender = activeUraianData.filter(u => {
    if (u.level > 1) {
      const parentKode = u.kode.split('.').slice(0, -1).join('.');
      if (!expandedKode.has(parentKode)) return false;
    }

    const sub = subKegiatans.find(k => k.id === u.kode);

    // Helper to check match for a specific node
    const checkMatch = (node, nodeSub) => {
      let matchSearch = true;
      if (searchTerm.trim() !== '') {
        matchSearch = node.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (nodeSub && nodeSub.nama.toLowerCase().includes(searchTerm.toLowerCase()));
      }

      let matchBagian = true;
      if (filterBagian !== 'semua') {
        const topLevelKode = node.kode.split('.')[0];
        const topLevel = activeUraianData.find(x => x.kode === topLevelKode);
        matchBagian = topLevel ? topLevel.uraian === filterBagian : false;
      }

      let matchStatus = true;
      if (filterStatus !== 'semua') {
        matchStatus = nodeSub ? nodeSub.status === filterStatus : false;
      }

      let matchTanggal = true;
      if (filterBulan !== 'semua' || filterTahun !== 'semua') {
        if (nodeSub && nodeSub.tanggalMulai) {
          const date = new Date(nodeSub.tanggalMulai);
          if (!isNaN(date.getTime())) {
            if (filterBulan !== 'semua' && date.getMonth() + 1 !== parseInt(filterBulan)) matchTanggal = false;
            if (filterTahun !== 'semua' && date.getFullYear() !== parseInt(filterTahun)) matchTanggal = false;
          } else {
            matchTanggal = false;
          }
        } else {
          matchTanggal = false;
        }
      }

      return matchSearch && matchBagian && matchStatus && matchTanggal;
    };

    const isMatch = checkMatch(u, sub);
    if (isMatch) return true;

    // Check if any children match
    const hasActiveFilters = searchTerm.trim() !== '' || filterBagian !== 'semua' || filterStatus !== 'semua' || filterBulan !== 'semua' || filterTahun !== 'semua';
    if (hasActiveFilters) {
      const childrenMatch = activeUraianData.some(child => {
        if (!child.kode.startsWith(u.kode + '.')) return false;
        const childSub = subKegiatans.find(k => k.id === child.kode);
        return checkMatch(child, childSub);
      });
      if (childrenMatch) return true;
      return false;
    }

    return true;
  });

  const ChevronDown = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
  );

  function safeFormatDate(dStr) {
    if (!dStr) return '-';
    try {
      return new Date(dStr).toLocaleDateString('id-ID');
    } catch {
      return '-';
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Kegiatan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Cari nama kegiatan..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          {(!user || user.role === 'superadmin') && (
            <select value={filterBagian} onChange={(e) => setFilterBagian(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="semua">Semua Bagian</option>
              {allBidangOptions.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
          <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="semua">Semua Bulan</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('id-ID', { month: 'long' })}</option>
            ))}
          </select>
          <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="semua">Semua Tahun</option>
            {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 3 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="semua">Semua Status</option>
            <option value="Berjalan">Berjalan</option>
            <option value="Selesai">Selesai</option>
            <option value="Terlambat">Terlambat</option>
            <option value="Belum Mulai">Belum Mulai</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-center py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-16">No</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kegiatan</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-36">Sumber Dana</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-32">Deadline</th>
                <th className="text-right py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Target Pagu</th>
                <th className="text-right py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Realisasi</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-36">Progress</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-28">Status</th>
                <th className="text-center py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-32">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                 const getPhysicalProgress = (kode) => {
                  const dbHasChildren = activeUraianData.some((x) => x.kode.startsWith(kode + '.') && x.kode.split('.').length === kode.split('.').length + 1);
                  const meta = subKegiatanMeta.find((m) => m.id === kode);
                  const level = kode.split('.').length;
                  const isWadah = level === 1 ? true : (meta ? meta.isWadah : false);

                  if (!dbHasChildren && !isWadah) {
                    const node = activeUraianData.find(x => x.kode === kode);
                    if (!node || node.target === 0) return 0;
                    return (node.realisasi / node.target) * 100;
                  } else {
                    const leafDescendants = activeUraianData.filter(desc =>
                      desc.kode.startsWith(kode + '.') &&
                      !activeUraianData.some(child => child.kode.startsWith(desc.kode + '.') && child.kode.split('.').length === desc.kode.split('.').length + 1) &&
                      (!subKegiatanMeta.find(m => m.id === desc.kode)?.isWadah)
                    );

                    if (leafDescendants.length === 0) return 0;

                    let sumPagu = 0;
                    let sumRealisasi = 0;

                    leafDescendants.forEach(leaf => {
                      sumPagu += leaf.target;
                      sumRealisasi += leaf.realisasi;
                    });

                    return sumPagu > 0 ? (sumRealisasi / sumPagu) * 100 : 0;
                  }
                };

                const enrichedDataToRender = finalDataToRender.map((u) => {
                  const dbHasChildren = activeUraianData.some((x) => x.kode.startsWith(u.kode + '.') && x.kode.split('.').length === u.kode.split('.').length + 1);
                  const existingSub = subKegiatans.find((k) => k.id === u.kode) || subKegiatanMeta.find((m) => m.id === u.kode);
                  const isLevel4Node = u.kode.split('.').length === 4;
                  const isWadah = u.level === 1 ? true : isLevel4Node ? false : (existingSub?.isWadah || false);
                  const subKegiatan = isWadah ? null : (existingSub || { id: u.kode, nama: u.uraian, steps: [], progress: 0, status: 'Belum Mulai' });

                  const steps = subKegiatan?.steps || [];
                  const doneCount = steps.filter((s) => s.selesai).length;
                  const allDone = steps.length > 0 && doneCount === steps.length;
                  const currentStepIdx = steps.findIndex((s) => !s.selesai);

                  let progress = Math.round(getPhysicalProgress(u.kode));
                  let status = progress >= 100 ? 'Selesai' : progress > 0 ? 'Berjalan' : 'Belum Mulai';

                  if (subKegiatan) {
                    if (subKegiatan.progress !== undefined && subKegiatan.progress > 0) {
                      progress = subKegiatan.progress;
                      status = subKegiatan.status;
                    } else {
                      progress = u.target > 0 ? Math.round((u.realisasi / u.target) * 100) : 0;
                      status = progress >= 100 ? 'Selesai' : progress > 0 ? 'Berjalan' : 'Belum Mulai';
                    }
                  }

                  return { ...u, dbHasChildren, existingSub, isWadah, subKegiatan, steps, doneCount, allDone, currentStepIdx, computedProgress: progress, computedStatus: status };
                });

                const sortedDataToRender = [...enrichedDataToRender].sort((a, b) => {
                  const aParts = a.kode.split('.').map(Number);
                  const bParts = b.kode.split('.').map(Number);
                  const minLen = Math.min(aParts.length, bParts.length);

                  for (let i = 0; i < minLen; i++) {
                    if (aParts[i] !== bParts[i]) {
                      const aAncestorKode = aParts.slice(0, i + 1).join('.');
                      const bAncestorKode = bParts.slice(0, i + 1).join('.');
                      const aNode = enrichedDataToRender.find(x => x.kode === aAncestorKode);
                      const bNode = enrichedDataToRender.find(x => x.kode === bAncestorKode);

                      if (aNode && bNode) {
                        const getUrgency = (status) => {
                          if (status === 'Terlambat') return 1;
                          if (status === 'Belum Mulai') return 2;
                          if (status === 'Berjalan') return 3;
                          return 4;
                        };
                        const uA = getUrgency(aNode.computedStatus);
                        const uB = getUrgency(bNode.computedStatus);
                        if (uA !== uB) return uA - uB;
                      }

                      return aParts[i] - bParts[i];
                    }
                  }
                  return aParts.length - bParts.length;
                });

                let kegiatanCount = 0;
                return sortedDataToRender.map((u) => {
                  const { dbHasChildren, existingSub, isWadah, subKegiatan, steps, doneCount, allDone, currentStepIdx, computedProgress: progress, computedStatus: status } = u;
                  const isExpanded = expandedKode.has(u.kode);
                  const isRowExpanded = expandedRow === u.kode;
                  const indent = (u.level - 1) * 20;

                  return (
                    <React.Fragment key={u.kode}>
                      {/* Main row */}
                      <tr
                        className={`border-b border-gray-100 transition-colors ${u.level === 1 ? 'bg-blue-50/50' :
                          u.level === 2 ? 'bg-slate-50/50' :
                            isRowExpanded ? 'bg-blue-50/40' : 'hover:bg-gray-50'
                          }`}
                      >
                        <td className="py-3 px-4 text-xs font-mono text-slate-500 text-center whitespace-nowrap">
                          {u.level === 1 || u.level === 2 ? '' : ++kegiatanCount}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2" style={{ paddingLeft: `${(u.level - 1) * 20}px` }}>
                            {dbHasChildren ? (
                              <button onClick={() => toggleExpand(u.kode)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 text-slate-500 transition-colors">
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>
                            ) : (
                              <div className="w-5 h-5 flex-shrink-0" />
                            )}
                            {u.level === 1 || u.level === 2 ? (
                              <div className="font-bold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => !dbHasChildren && setExpandedRow(prev => prev === u.kode ? null : u.kode)}>
                                <span className={`${u.level === 1 ? 'text-blue-800' : 'text-gray-800'} text-sm`}>{u.uraian}</span>
                              </div>
                            ) : (
                              <div>
                                <div className="font-bold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors" onClick={() => !dbHasChildren && setExpandedRow(prev => prev === u.kode ? null : u.kode)}>
                                  {u.uraian}
                                </div>
                                <div className="text-[11px] mt-1.5 flex flex-col gap-0.5">
                                  <span className="font-semibold text-gray-600">
                                    PJ: {existingSub?.penanggungJawab || 'Belum ada PJ'} &bull; Bidang: {activeUraianData.find(x => x.kode === u.kode.split('.')[0])?.uraian || '-'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        {u.level === 1 || u.level === 2 ? (
                          <>
                            <td className="py-3 px-4 text-gray-400 text-sm">-</td>
                            <td className="py-3 px-4 text-gray-400 text-sm">-</td>
                            <td className="py-3 px-4 text-right text-[13px] font-bold text-slate-600 whitespace-nowrap">Rp {u.target ? u.target.toLocaleString('id-ID') : '0'}</td>
                            <td className="py-3 px-4 text-right text-[13px] font-bold text-slate-600 whitespace-nowrap">Rp {u.realisasi ? u.realisasi.toLocaleString('id-ID') : '0'}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 w-full max-w-[120px] opacity-70">
                                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                  <div className={`h-1.5 rounded-full transition-all duration-500 ${
                                    progress >= 75 ? 'bg-emerald-500' :
                                    progress >= 40 ? 'bg-amber-400' : 'bg-red-500'
                                    }`} style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-[11px] font-semibold text-gray-600 w-8 text-right">{progress}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`whitespace-nowrap px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider opacity-80 ${status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                                status === 'Berjalan' ? 'bg-blue-100 text-blue-700' :
                                  status === 'Terlambat' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>{status}</span>
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-sm">-</td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] rounded font-bold border border-blue-100 uppercase tracking-wider whitespace-nowrap">
                                {existingSub?.sumberDana || 'Belum Ditentukan'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[13px] font-semibold text-slate-700 whitespace-nowrap">
                              {existingSub?.tanggalSelesai ? safeFormatDate(existingSub.tanggalSelesai) : '-'}
                            </td>
                            <td className="py-3 px-4 text-right text-[13px] font-bold text-slate-700 whitespace-nowrap">
                              Rp {u.target ? u.target.toLocaleString('id-ID') : '0'}
                            </td>
                            <td className="py-3 px-4 text-right text-[13px] font-bold text-slate-700 whitespace-nowrap">
                              Rp {u.realisasi ? u.realisasi.toLocaleString('id-ID') : '0'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 w-full max-w-[120px]">
                                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                  <div className={`h-1.5 rounded-full transition-all duration-500 ${
                                    progress >= 75 ? 'bg-emerald-500' :
                                    progress >= 40 ? 'bg-amber-400' : 'bg-red-500'
                                    }`} style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-[11px] font-semibold text-gray-600 w-8 text-right">{progress}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`whitespace-nowrap px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                                status === 'Berjalan' ? 'bg-blue-100 text-blue-700' :
                                  status === 'Terlambat' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>{status}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 justify-center">
                                {subKegiatan && !isWadah && (
                                  <button
                                    onClick={() => openUpdateModal(subKegiatan.id, 'progress')}
                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
                                  >
                                    Progres
                                  </button>
                                )}
                                <button onClick={() => setShowEditModalFor(u.kode)} className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Edit">
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeleteSubKegiatan(u.kode, u.uraian)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>

                      {/* Expandable Progress row (only for leaf nodes) */}
                      {isRowExpanded && subKegiatan && (
                        <tr key={`${u.kode}-progress`} className="border-b border-gray-200 bg-blue-50/20">
                          <td colSpan={9} className="px-12 py-6">
                            <div className="flex items-center justify-between mb-5">
                              <div>
                                <h4 className="text-sm font-bold text-gray-800">
                                  Progress Tahapan
                                  <span className="ml-2 text-blue-600">— {subKegiatan.nama}</span>
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {doneCount}/{steps.length} tahap selesai
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => openUpdateModal(subKegiatan.id, 'progress')}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  Progres
                                </button>
                              </div>
                            </div>
                            {/* Horizontal timeline */}
                            <div className="relative px-2">
                              <div className="absolute top-[18px] left-[32px] right-[32px] h-1 bg-gray-200 rounded-full" />
                              {doneCount > 0 && steps.length > 1 && (
                                <div
                                  className="absolute top-[18px] left-[32px] h-1 rounded-full transition-all duration-700"
                                  style={{
                                    width: `calc((100% - 64px) * ${(Math.max(doneCount - 1, 0)) / (steps.length - 1)})`,
                                    background: allDone ? '#10b981' : '#3b82f6',
                                  }}
                                />
                              )}
                              <div className="relative z-10 flex items-start justify-between">
                                {steps.map((step, idx) => {
                                  const isDone = step.selesai;
                                  const isLast = idx === steps.length - 1;
                                  const isCurrent = idx === currentStepIdx;
                                  return (
                                    <div key={step.id} className="flex flex-col items-center" style={{ minWidth: 64 }}>
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all bg-white ${isDone ? (isLast ? 'border-emerald-500 text-emerald-500' : 'border-blue-500 text-blue-500') :
                                        isCurrent ? 'border-blue-400 text-blue-500' : 'border-gray-200 text-gray-400'
                                        }`}>
                                        {isDone ? (isLast ? <FileCheck className="w-4 h-4" /> : <Check className="w-4 h-4" strokeWidth={3} />) :
                                          <span className="text-xs font-black">{String.fromCharCode(65 + idx)}</span>}
                                      </div>
                                      <div className={`mt-2 text-center text-[10px] font-semibold leading-tight max-w-[64px] ${isDone ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {isLast ? 'Finish' : step.nama}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Keterangan & Catatan */}
                            <div className="mt-8 pt-5 border-t border-blue-100 flex flex-col md:flex-row gap-4">
                              <div className="flex-1 bg-white p-4 rounded-xl border border-blue-50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                <h5 className="text-[11px] font-bold text-gray-700 mb-2.5 flex items-center gap-1.5 uppercase tracking-wide">
                                  <Info className="w-3.5 h-3.5 text-blue-500" /> Keterangan (Deskripsi)
                                </h5>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                  {subKegiatan.deskripsi || <span className="text-gray-400 italic">Tidak ada deskripsi.</span>}
                                </p>
                              </div>
                              <div className="flex-1 bg-white p-4 rounded-xl border border-amber-50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                <h5 className="text-[11px] font-bold text-gray-700 mb-2.5 flex items-center gap-1.5 uppercase tracking-wide">
                                  <FileText className="w-3.5 h-3.5 text-amber-500" /> Catatan Progres
                                </h5>
                                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                                  {subKegiatan.catatanProgress || <span className="text-gray-400 italic">Belum ada catatan progres.</span>}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Update Progress Modal ── */}
      {updateProgressFor && updateSubKegiatan && (
        <UpdateProgressModal
          subKegiatan={updateSubKegiatan}
          steps={updateSubKegiatan.steps}
          progress={updateSubKegiatan.progress}
          onClose={() => setUpdateProgressFor(null)}
          onToggleStep={(stepId, catatan) => toggleStep(updateSubKegiatan.id, stepId, catatan)}
          initialPanel={modalInitialPanel}
        />
      )}

      {/* ── Tambah Kegiatan Modal ── */}
      {showAddModal && (
        <SubKegiatanFormModal mode="add" onClose={() => setShowAddModal(false)} />
      )}

      {/* ── Edit Kegiatan Modal ── */}
      {showEditModalFor && (() => {
        const dbHasChildrenModal = uraianAnggaranData.some(x => x.kode.startsWith(showEditModalFor + '.') && x.kode.split('.').length === showEditModalFor.split('.').length + 1);
        const existing = subKegiatans.find(k => k.id === showEditModalFor);
        const uraian = uraianAnggaranData.find(u => u.kode === showEditModalFor);
        const meta = subKegiatanMeta.find(m => m.id === showEditModalFor);
        const fallback = {
          id: showEditModalFor,
          nama: uraian?.uraian || '',
          bidang: '',
          tanggalMulai: meta?.tanggalMulai || `${new Date().getFullYear()}-05-01T00:00:00.000Z`,
          tanggalSelesai: meta?.tanggalSelesai || `${new Date().getFullYear()}-12-31T00:00:00.000Z`,
          penanggungJawab: meta?.penanggungJawab || '',
          status: 'Belum Mulai',
          progress: 0,
          paguAnggaran: uraian?.target || 0,
          realisasiAnggaran: 0,
          deskripsi: meta?.deskripsi || '',
          step: 'Persiapan',
          steps: meta?.steps || [],
          isWadah: showEditModalFor.split('.').length === 4 ? false : (meta?.isWadah ?? false),
          sumberDana: meta?.sumberDana || '',
          anggaranDiminta: meta?.anggaranDiminta !== undefined ? meta.anggaranDiminta : 0
        };
        return <SubKegiatanFormModal mode="edit" initialData={existing || fallback} onClose={() => setShowEditModalFor(null)} />;
      })()}
      {/* ── Popup Konfirmasi Hapus ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Konfirmasi Hapus</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-1">Apakah Anda yakin ingin menghapus:</p>
              <p className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                {deleteConfirm.nama} <span className="text-gray-400 font-normal text-xs">({deleteConfirm.kode})</span>
              </p>
              <p className="text-xs text-red-500 mt-2">Semua data turunan juga akan terhapus.</p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-md shadow-red-200"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
