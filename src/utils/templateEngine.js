/**
 * Template variable renderer for WhatsApp messages
 */
export function renderTemplate(templateString, variables = {}) {
  if (!templateString) return '';
  
  let result = templateString;
  const mappings = {
    '{{nama_dosen}}': variables.lecturerName || variables.nama_dosen || '',
    '{{nama_matkul}}': variables.courseName || variables.nama_matkul || '',
    '{{tanggal}}': variables.formattedDate || variables.tanggal || '',
    '{{jam_mulai}}': variables.startTime || variables.jam_mulai || '',
    '{{jam_selesai}}': variables.endTime || variables.jam_selesai || '',
    '{{ruang}}': variables.room || variables.ruang || '',
    '{{nama_mahasiswa}}': variables.studentName || 'Ahmad Dinur',
    '{{nim}}': variables.studentNim || '220101089',
  };

  for (const [key, value] of Object.entries(mappings)) {
    result = result.replaceAll(key, value);
  }

  return result;
}

/**
 * Returns list of available variables with descriptions
 */
export const AVAILABLE_VARIABLES = [
  { tag: '{{nama_dosen}}', desc: 'Nama lengkap dosen beserta gelar' },
  { tag: '{{nama_matkul}}', desc: 'Nama mata kuliah' },
  { tag: '{{tanggal}}', desc: 'Hari dan tanggal pelaksanaan kuliah' },
  { tag: '{{jam_mulai}}', desc: 'Waktu mulai perkuliahan' },
  { tag: '{{jam_selesai}}', desc: 'Waktu selesai perkuliahan' },
  { tag: '{{ruang}}', desc: 'Ruang kelas / laboratorium' },
  { tag: '{{nama_mahasiswa}}', desc: 'Nama mahasiswa pengirim' },
  { tag: '{{nim}}', desc: 'Nomor Induk Mahasiswa' }
];
