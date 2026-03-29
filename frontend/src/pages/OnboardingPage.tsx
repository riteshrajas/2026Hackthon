import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    neighborhood_tag: '', // County
  });

  // Image Upload and Crop State
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);        
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>(''); // For previewing the cropped result
  const imgRef = useRef<HTMLImageElement>(null);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCroppedBlob(null);
      setCroppedImageUrl('');
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCroppedImg = async () => {
    const image = imgRef.current;
    if (!image || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      setCroppedBlob(blob);
      if (croppedImageUrl) URL.revokeObjectURL(croppedImageUrl);
      setCroppedImageUrl(URL.createObjectURL(blob));
      setImgSrc(''); // Hide the crop tool once cropped
    }, 'image/jpeg');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Build FormData payload for multer
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('email', formData.email);
      formPayload.append('password', formData.password);
      formPayload.append('neighborhood_tag', formData.neighborhood_tag);        
      if (croppedBlob) {
        formPayload.append('profile_picture', croppedBlob, 'profile.jpg');      
      }

      const response = await api.post('/auth/register', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      login(response.data.token, response.data.user);
      navigate('/feed');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
      setStep(1); // Go back to fix
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-lg shadow-xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <span className="text-3xl font-black text-[#006948] tracking-tight">Eco-Pulse</span>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-colors ${
                  step >= s ? 'bg-primary' : 'bg-surface-container-low'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded-md mb-6 text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>    
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface">Choose Your Persona</label>
                <input
                  type="text"
                  required
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-on-surface"     
                  placeholder="Full Name (e.g., Jane Guardian)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface">Eco-Base (County)</label>
                <input
                  type="text"
                  required
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-on-surface"     
                  placeholder="e.g. Marin County, CA"
                  value={formData.neighborhood_tag}
                  onChange={(e) => setFormData({ ...formData, neighborhood_tag: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={handleNext}
                disabled={!formData.name || !formData.neighborhood_tag}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                Next Step
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-on-surface"     
                  placeholder="nature@lover.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface">Create Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-on-surface"     
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-surface-container-low text-on-surface-variant py-4 rounded-xl font-bold transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!formData.email || formData.password.length < 6}    
                  className="flex-[2] bg-primary text-on-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  Almost There
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-surface-container-low rounded-full overflow-hidden mb-4 border-4 border-primary-container">
                  {croppedImageUrl ? (
                    <img src={croppedImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-outline">person</span>
                  )}
                </div>
                <p className="text-sm text-on-surface-variant italic">One last thing, show your green face!</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">Upload Profile Picture (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onSelectFile}
                    className="w-full bg-transparent text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary/20 transition-all"
                  />
                </div>

                {!!imgSrc && (
                  <div className="flex flex-col items-center space-y-4 bg-surface-container-lowest p-2 rounded border border-outline-variant">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}       
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      circularCrop
                    >
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        className="max-h-64 object-contain"
                      />
                    </ReactCrop>
                    <button
                      type="button"
                      onClick={getCroppedImg}
                      className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                    >
                      Crop Image
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-surface-container-low text-on-surface-variant py-4 rounded-xl font-bold transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !!imgSrc} // Optionally disable if currently cropping
                  className="flex-[2] bg-primary text-on-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Joining...' : 'Complete Entry'}
                  <span className="material-symbols-outlined">celebration</span>
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-8 text-center text-sm text-on-surface-variant">      
          Already a Ninja?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline"> 
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};