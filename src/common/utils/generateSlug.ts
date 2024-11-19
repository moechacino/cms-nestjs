export default function generateSlug(str: string): string {
  return str
    .toLowerCase() // Mengubah string menjadi huruf kecil
    .replace(/[^a-z0-9\s-]/g, '') // Menghapus karakter non-alfanumerik kecuali spasi dan tanda hubung
    .trim() // Menghapus spasi di awal dan akhir
    .replace(/\s+/g, '-') // Mengganti spasi dengan tanda hubung
    .replace(/--+/g, '-'); // Menghapus tanda hubung ganda;
}
