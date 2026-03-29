import { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export const SettingsPage = () => {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    try {
      await updateUser(user.id, { name, profile_picture: profilePicture });
      updateUserProfile({ name, profile_picture: profilePicture });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <Toaster position="bottom-center" />
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-on-surface">Settings</h1>

        <form onSubmit={handleSave} className="bg-surface-container-lowest p-8 rounded-lg space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface">Full Name</label>
            <input
              type="text"
              required
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-on-surface"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface">Profile Picture URL</label>
            <input
              type="url"
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-on-surface"
              placeholder="https://..."
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
            />
            {profilePicture && (
              <div className="mt-4">
                <p className="text-xs text-on-surface-variant mb-2">Preview:</p>
                <img src={profilePicture} alt="Profile Preview" className="w-16 h-16 rounded-full object-cover" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </MainLayout>
  );
};
