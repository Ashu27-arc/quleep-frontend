import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadDropzone } from '../components/UploadDropzone';
import { ArrowLeft, Box, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Toast } from '../components/Toast';

export const Upload = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState(null);

  const handleUploadSuccess = (newModel) => {
    setToastMessage({
      message: `Model "${newModel.modelName}" successfully imported!`,
      type: 'success',
    });
    
    // Redirect to the viewer page for the new model after a short delay
    setTimeout(() => {
      navigate(`/viewer/${newModel._id}`);
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-fade-in">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-black text-neutral-100 tracking-wide">Import Asset</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Stream binary glTF 3D objects</p>
        </div>
      </div>

      <div className="bg-neutral-900/10 border border-neutral-900 rounded-3xl p-6 sm:p-8 backdrop-blur space-y-6">
        <div className="space-y-2">
          <h3 className="text-base font-bold text-neutral-200">Prepare your 3D Asset</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Ensure your 3D file is packaged as a single <span className="text-emerald-400 font-semibold font-mono">.glb</span> file. 
            Embedded textures, meshes, and animation channels must be bundled within the binary wrapper.
          </p>
        </div>

        <UploadDropzone onUploadSuccess={handleUploadSuccess} />

        {/* Requirements guidelines */}
        <div className="border-t border-neutral-900 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-500">
          <div className="flex gap-2.5">
            <HelpCircle className="w-4.5 h-4.5 text-emerald-500/80 flex-shrink-0" />
            <div>
              <p className="font-semibold text-neutral-400">Supported Formats</p>
              <p className="mt-1 leading-relaxed">Only .glb (binary glTF) assets are accepted. Standard .gltf files requiring external bin or image sheets are not supported.</p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Box className="w-4.5 h-4.5 text-emerald-500/80 flex-shrink-0" />
            <div>
              <p className="font-semibold text-neutral-400">Geometry and Textures</p>
              <p className="mt-1 leading-relaxed">Limit mesh polygon counts to 200,000 tris and keep textures compressed (1k or 2k webp/jpeg) for smooth loading.</p>
            </div>
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
