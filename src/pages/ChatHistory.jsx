import React, { useState } from 'react';
import {
  History,
  Search,
  MessageSquare,
  CheckCheck,
  Calendar,
  Phone,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { useData } from '../context/DataContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatPhoneNumber } from '../utils/phoneUtils';

export default function ChatHistory() {
  const { chatHistory, addToast } = useData();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filteredHistory = chatHistory.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.lecturerName.toLowerCase().includes(q) ||
      item.courseName.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q)
    );
  });

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Pesan berhasil disalin!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Riwayat Pengiriman Pesan
        </h2>
        <p className="hidden sm:block text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Log lengkap seluruh pesan WhatsApp yang dikirimkan baik secara manual maupun otomatis
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari penerima, mata kuliah, atau isi pesan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* History Feed */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800">
          <History className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
            Belum ada riwayat pesan
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search ? 'Tidak ada pesan yang sesuai kata kunci pencarian.' : 'Pesan yang terkirim melalui Auto Chat maupun AI Assistant akan dicatat di sini.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {item.courseName}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {item.lecturerName}
                    </span>
                    <Badge variant={item.type === 'auto_scheduled' ? 'warning' : 'primary'} size="sm">
                      {item.type === 'auto_scheduled' ? 'Auto H-1' : 'Manual AI'}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    ID: {item.providerId || 'wam_unknown'} • Telp: {formatPhoneNumber(item.phone)}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{item.sentAt}</span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[11px]">
                    <CheckCheck className="w-3.5 h-3.5" /> Terkirim
                  </span>
                </div>
              </div>

              {/* Message Content Bubble */}
              <div className="bg-[#EFEAE2] dark:bg-[#0b141a] p-4 rounded-xl">
                <div className="bg-white dark:bg-[#202c33] rounded-xl rounded-tl-none p-3.5 shadow-2xs text-xs text-slate-800 dark:text-slate-100 leading-relaxed max-w-2xl">
                  <p className="whitespace-pre-line">{item.message}</p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleCopyMessage(item.id, item.message)}
                  className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Salin Pesan
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
