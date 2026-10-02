export interface SilastikResponse {
  status: string;
  pesan: string;
  data?: SilastikData;
}

interface SilastikData {
  id_transaksi: number;
  tgl_minta: string;
  nama_pengguna: string;
  email: string;
  jenis_transaksi: string;
  status: string;
}
