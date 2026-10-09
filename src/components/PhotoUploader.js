import { Image as ImageIcon, X, Plus } from "lucide-react";

export function PhotoUploader({ formData, updateCaption, photoPreviews, handlePhotoSelect, removePhoto }) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-pink-400" /> Photo Gallery (Up to 10)
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photoPreviews.map((src, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group flex flex-col bg-slate-100 dark:bg-black">
            <div className="relative flex-1">
              <img src={src} alt="Upload" className="absolute inset-0 w-full h-full object-cover" />
              <button onClick={() => removePhoto(i)} className="absolute top-2 right-2 bg-white dark:bg-black/50 p-1 rounded-full text-slate-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input 
              type="text" 
              value={formData.photoCaptions[i] || ""} 
              onChange={(e) => updateCaption(i, e.target.value)}
              placeholder="Add caption..."
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-sm px-3 py-3 border-2 border-transparent focus:border-pink-500 rounded-b-xl outline-none border-t border-slate-200 dark:border-white/10 transition-colors"
            />
          </div>
        ))}
        {photoPreviews.length < 10 && (
          <div className="relative aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10 flex flex-col items-center justify-center cursor-pointer">
            <input type="file" multiple accept="image/*" onChange={handlePhotoSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Plus className="w-8 h-8 text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
}
