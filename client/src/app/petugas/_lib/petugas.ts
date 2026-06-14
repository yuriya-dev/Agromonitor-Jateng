import { API_BASE } from '@/lib/api-config';

export type LocationState = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  label: string;
  mapUrl: string;
};

export type SurveyStatus = 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED';

export type SurveyHistoryItem = {
  id: string;
  commodityName: string;
  market: string;
  price: number;
  reportDate: string;
  status: SurveyStatus;
  createdAt: string;
  photoUrl?: string | null;
};

export type FieldReportApiItem = {
  id: string;
  commodityName: string;
  market: string;
  price: number;
  reportDate: string;
  status: SurveyStatus;
  createdAt: string;
  photoUrl?: string | null;
};

export const petugasProfile = {
  code: 'PTG-194',
  name: 'Slamet Riyadi',
  email: 'petugas@agromonitor.local',
};

export const commodityOptions = [
  { value: 'beras-medium', label: 'Beras Medium (Kg)' },
  { value: 'beras-premium', label: 'Beras Premium (Kg)' },
  { value: 'bawang-merah', label: 'Bawang Merah (Kg)' },
  { value: 'bawang-putih', label: 'Bawang Putih (Kg)' },
  { value: 'cabai-rawit', label: 'Cabai Rawit (Kg)' },
  { value: 'daging-sapi', label: 'Daging Sapi (Kg)' },
  { value: 'telur-ayam', label: 'Telur Ayam Ras (Kg)' },
];

export const commodityLabels: Record<string, string> = commodityOptions.reduce((accumulator, option) => {
  accumulator[option.value] = option.label;
  return accumulator;
}, {} as Record<string, string>);

const MAX_IMAGE_WIDTH = 1280;
const JPEG_QUALITY = 0.82;

export const compressImageFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Gagal membaca file foto.'));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error('Gagal memproses foto JPG.'));
      image.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_WIDTH / image.width);
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Browser tidak mendukung pemrosesan foto.'));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };

      image.src = typeof reader.result === 'string' ? reader.result : '';
    };

    reader.readAsDataURL(file);
  });

export const loadSurveyHistory = async (petugasCode: string) => {
  const response = await fetch(`${API_BASE}/admin/field-reports?search=${encodeURIComponent(petugasCode)}&limit=12`);
  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();

  if (!contentType.includes('application/json')) {
    throw new Error(`Server mengembalikan respons non-JSON (${response.status}). Pastikan backend berjalan.`);
  }

  const json = JSON.parse(responseText) as { success?: boolean; data?: FieldReportApiItem[]; message?: string };

  if (!json.success || !Array.isArray(json.data)) {
    return [] as SurveyHistoryItem[];
  }

  return json.data.map((item) => ({
    id: item.id,
    commodityName: item.commodityName,
    market: item.market,
    price: Number(item.price),
    reportDate: item.reportDate,
    status: item.status,
    createdAt: item.createdAt,
    photoUrl: item.photoUrl,
  }));
};