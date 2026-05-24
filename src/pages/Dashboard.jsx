import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { Box, Search, Plus, Calendar, Eye, Trash2, ArrowUpRight, Cloud, HardDrive } from 'lucide-react';
import { Toast } from '../components/Toast';

export const Dashboard = () => {
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  const navigate = useNavigate();

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/models');
      setModels(response.data);
    } catch (err) {
      console.error('Failed to load models:', err);
      setToastMessage({
        message: 'Could not stream 3D models. Check connection.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Filter models based on search term
  const filteredModels = models.filter((m) =>
    m.modelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Formats timestamps nicely
  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Optional: Add simple delete mock/action for better interactivity!
  // Wait, let's keep it simple. If we want we can add deletion or just viewing.
  // Viewing is the primary requirement. Let's make it easy to click to go to the viewer.

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
        <div>
          <h2 className="text-2xl font-black text-neutral-100 tracking-wide">
            Welcome back, <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">{user?.name}</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Manage, coordinate, and inspect your 3D assets canvas.
          </p>
        </div>

        <Link
          to="/upload"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 font-bold rounded-2xl transition duration-300 shadow-lg shadow-emerald-950/20 active:scale-[0.98] cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Upload GLB Asset</span>
        </Link>
      </div>

      {/* Analytics Statistics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 backdrop-blur flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Total Assets</p>
            <p className="text-xl font-black text-neutral-200 mt-0.5">{loading ? '...' : models.length}</p>
          </div>
        </div>

        <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 backdrop-blur flex items-center gap-4">
          <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Bucket Storage</p>
            <p className="text-xl font-black text-neutral-200 mt-0.5">
              {loading ? '...' : `${(models.length * 12.8).toFixed(1)} MB`}
            </p>
          </div>
        </div>

        <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 backdrop-blur flex items-center gap-4">
          <div className="p-3.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">State Syncs</p>
            <p className="text-xl font-black text-neutral-200 mt-0.5">Active</p>
          </div>
        </div>
      </div>

      {/* Grid search and lists */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets by file title..."
              className="w-full pl-10 pr-4 py-3 bg-neutral-900/30 border border-neutral-900 rounded-2xl text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm backdrop-blur"
            />
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton count={6} />
        ) : filteredModels.length === 0 ? (
          /* Empty onboarding state */
          <div className="border border-dashed border-neutral-855 bg-neutral-900/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-5">
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-850 text-neutral-400 animate-pulse">
              <Box className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-200">No 3D Models Configured</h3>
              <p className="text-sm text-neutral-500 mt-1 max-w-xs mx-auto">
                {searchQuery
                  ? 'No models match your search query. Try typing another term.'
                  : 'Start by importing a `.glb` asset into your persistent library.'}
              </p>
            </div>
            {!searchQuery && (
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-emerald-400 font-semibold rounded-2xl transition duration-300 text-sm cursor-pointer active:scale-[0.98]"
              >
                <span>Upload First GLB</span>
                <Plus className="w-4.5 h-4.5" />
              </Link>
            )}
          </div>
        ) : (
          /* 3D Models Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <div
                key={model._id}
                className="group border border-neutral-900 hover:border-neutral-800 bg-neutral-900/20 hover:bg-neutral-900/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col backdrop-blur shadow-md hover:shadow-2xl hover:shadow-emerald-950/5 relative"
              >
                {/* Visual Placeholder for 3D model */}
                <div
                  onClick={() => navigate(`/viewer/${model._id}`)}
                  className="h-44 bg-neutral-950 border-b border-neutral-900/60 flex items-center justify-center relative overflow-hidden group-hover:bg-neutral-950/80 transition-colors cursor-pointer"
                >
                  {/* Decorative abstract isometric vector graph */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                  <div className="w-16 h-16 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center text-neutral-500 group-hover:text-emerald-400 transition-colors duration-300">
                    <Box className="w-8 h-8 rotate-12 group-hover:rotate-45 transition-transform duration-500" />
                  </div>
                  <div className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 backdrop-blur text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Info and action bar */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4
                      onClick={() => navigate(`/viewer/${model._id}`)}
                      className="font-bold text-neutral-200 hover:text-emerald-400 transition-colors cursor-pointer truncate text-sm"
                    >
                      {model.modelName}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(model.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-900 mt-4 pt-3.5">
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      GLB Asset
                    </span>

                    <button
                      onClick={() => navigate(`/viewer/${model._id}`)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 text-xs font-bold transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Workspace</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
