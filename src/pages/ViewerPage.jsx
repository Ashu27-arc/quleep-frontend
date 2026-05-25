import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ModelViewer } from '../components/ModelViewer';
import { ModelViewerSkeleton } from '../components/SkeletonLoader';
import { useDebouncedCallback } from '../hooks/useDebounce';
import { resolveAssetUrl, formatDate } from '../utils/helpers';
import { Toast } from '../components/Toast';
import { ArrowLeft, Box, Copy, ExternalLink, ShieldCheck, Check, Calendar, CornerDownRight } from 'lucide-react';

export const ViewerPage = () => {
  const { id } = useParams();
  const [model, setModel] = useState(null);
  const [modelBlobUrl, setModelBlobUrl] = useState(null);
  const [initialState, setInitialState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let blobUrl = null;

    const fetchModelAndState = async () => {
      try {
        setLoading(true);
        setModelBlobUrl(null);
        const [modelRes, stateRes, glbRes] = await Promise.all([
          api.get(`/models/${id}`),
          api.get(`/models/${id}/state`),
          api.get(`/models/${id}/stream`, { responseType: 'arraybuffer' }),
        ]);
        if (cancelled) return;

        setModel(modelRes.data);
        setInitialState(stateRes.data);
        blobUrl = URL.createObjectURL(
          new Blob([glbRes.data], { type: 'model/gltf-binary' })
        );
        setModelBlobUrl(blobUrl);
      } catch (err) {
        console.error('Error fetching model context:', err);
        if (!cancelled) {
          setToastMessage({ message: 'Failed to stream 3D object details.', type: 'error' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchModelAndState();
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [id]);

  const saveStateToDB = useDebouncedCallback(async (stateData) => {
    setIsSaving(true);
    try {
      await api.post(`/models/${id}/state`, stateData);
    } catch (err) {
      console.error('Error auto-saving coordinates state:', err);
    } finally {
      setIsSaving(false);
    }
  }, 1000);

  const handleStateChange = (updatedState) => {
    setIsSaving(true);
    saveStateToDB(updatedState);
  };

  const handleCopyUrl = () => {
    if (!model) return;
    // Copy the raw S3 URL (without signature) for sharing
    const fileUrl = resolveAssetUrl(model.modelUrl);
    navigator.clipboard.writeText(fileUrl);
    setCopied(true);
    setToastMessage({ message: 'Asset URL copied to clipboard!', type: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!model) return;
    try {
      const response = await api.get(`/models/${id}/stream`, { responseType: 'arraybuffer' });
      const blob = new Blob([response.data], { type: 'model/gltf-binary' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Ensure file has .glb extension
      const filename = model.modelName.endsWith('.glb') ? model.modelName : `${model.modelName}.glb`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading asset:', err);
      setToastMessage({ message: 'Failed to download asset.', type: 'error' });
    }
  };

  if (loading) return <ModelViewerSkeleton />;

  if (!model) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-neutral-950 text-neutral-100 rounded-3xl min-h-[500px]">
        <div className="p-4 rounded-full bg-neutral-900 border border-neutral-800 text-rose-500/80 mb-4 animate-bounce">
          <Box className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-neutral-200">Asset Stream Failed</h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
          The 3D model does not exist or you do not have permission to view it.
        </p>
        <Link
          to="/"
          className="mt-6 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold rounded-2xl border border-neutral-800 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!modelBlobUrl) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-neutral-950 text-neutral-100 rounded-3xl min-h-[500px]">
        <h3 className="text-lg font-bold text-neutral-200">Geometry Loading Failed</h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
          Could not load the GLB asset from storage. Try re-uploading the model.
        </p>
        <Link
          to="/"
          className="mt-6 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold rounded-2xl border border-neutral-800 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const finalModelUrl = modelBlobUrl;

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-black text-neutral-100 tracking-wide truncate max-w-sm sm:max-w-md">
              {model.modelName}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Imported {formatDate(model.createdAt, true)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-xl text-xs font-semibold text-neutral-300 hover:text-neutral-100 transition shadow cursor-pointer select-none"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>Copy GLB URL</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-xl text-xs font-semibold text-neutral-300 hover:text-neutral-100 transition shadow cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Download Asset</span>
          </button>
        </div>
      </div>

      {/* Main workspace layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* 3D Canvas */}
        <div className="flex-1 rounded-2xl overflow-hidden min-h-[500px]">
          <ModelViewer
            modelUrl={finalModelUrl}
            initialState={initialState}
            onStateChange={handleStateChange}
            isSaving={isSaving}
          />
        </div>

        {/* Right Inspector Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-5">
          <div className="border border-neutral-900 bg-neutral-900/30 backdrop-blur rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider">Asset Inspector</h3>

            <div className="space-y-3.5">
              <div className="flex justify-between items-start text-xs">
                <span className="text-neutral-500 font-medium">Model File ID</span>
                <span className="text-neutral-300 font-mono text-[10px] break-all max-w-[160px] text-right bg-neutral-950 px-2 py-1 border border-neutral-900 rounded-lg">
                  {model._id}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-medium">File Storage</span>
                <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {model.modelUrl.startsWith('http') ? 'AWS S3 Cloud' : 'Local Sandbox'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-medium">Auto-Save State</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded">
                  SYNCHRONIZED
                </span>
              </div>
            </div>

            <div className="h-px bg-neutral-900" />

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Active Coordinates</p>
              <div className="text-[10px] text-neutral-400 space-y-1.5 bg-neutral-950/60 p-3 rounded-xl border border-neutral-900/50">
                <div className="flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>X: {initialState?.cameraPosition?.[0]?.toFixed(2) ?? '0.00'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Y: {initialState?.cameraPosition?.[1]?.toFixed(2) ?? '0.00'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Z: {initialState?.cameraPosition?.[2]?.toFixed(2) ?? '5.00'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-neutral-900 bg-neutral-900/30 backdrop-blur rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider">Canvas Workspace</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Drag, rotate, and scale the model. When you pause, your orientation and zoom vantage point
              is automatically captured and synced. The next time you return, the workspace restores your
              exact view.
            </p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
