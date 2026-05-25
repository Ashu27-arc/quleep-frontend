import api from '../services/api';
import { resolveAssetUrl } from './helpers';

const GLB_MAGIC = 0x46546c67; // "glTF"

const isValidGlbBuffer = (data) => {
  if (!data || data.byteLength < 12) return false;
  const view = new DataView(data);
  return view.getUint32(0, true) === GLB_MAGIC;
};

/**
 * Loads GLB bytes via authenticated API (works without /stream route on older backends).
 */
export const loadModelGlbBuffer = async (modelId, modelUrl) => {
  const endpoints = [
    `/models/${modelId}?asset=glb`,
    `/models/${modelId}/stream`,
  ];

  for (const path of endpoints) {
    try {
      const res = await api.get(path, { responseType: 'arraybuffer' });
      if (isValidGlbBuffer(res.data)) return res.data;
    } catch (err) {
      if (err.response?.status !== 404) continue;
    }
  }

  // Last resort: pre-signed S3 URL (requires bucket CORS)
  try {
    const signedRes = await api.get(`/models/${modelId}/signed-url`);
    const fileUrl = resolveAssetUrl(signedRes.data.signedUrl || modelUrl);
    const res = await api.get(fileUrl, { responseType: 'arraybuffer' });
    if (isValidGlbBuffer(res.data)) return res.data;
  } catch {
    // fall through
  }

  throw new Error('Could not load GLB from storage. Re-upload the model or redeploy the backend.');
};
