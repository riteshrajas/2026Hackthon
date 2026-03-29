import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { changePassword, deleteAccount, updateUserProfile } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export const SettingsPage = () => {
  const { user, updateUserProfile: setUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || '');
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState(user?.profile_picture || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setProfilePicture(user.profile_picture || '');
    setProfilePreview(user.profile_picture || '');
  }, [user]);

  useEffect(() => {
    return () => {
      if (profilePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    try {
      let response;
      if (profileFile) {
        const profileDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result?.toString() || '');
          reader.onerror = () => reject(new Error('Failed to process image'));
          reader.readAsDataURL(profileFile);
        });
        response = await updateUserProfile(user.id, { name, profile_picture: profileDataUrl });
      } else {
        response = await updateUserProfile(user.id, { name, profile_picture: profilePicture });
      }

      setUserProfile({ name: response.name, profile_picture: response.profile_picture });
      setProfilePreview(response.profile_picture || '');
      setProfileFile(null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (profilePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profilePreview);
    }

    const nextPreview = URL.createObjectURL(file);
    setProfileFile(file);
    setProfilePreview(nextPreview);
    setProfilePicture('');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(user.id, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Failed to update password', error);
      toast.error('Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    if (deleteConfirm.trim().toUpperCase() !== 'DELETE') {
      toast.error('Type DELETE to confirm');
      return;
    }

    const confirmed = window.confirm('This will permanently delete your account. Continue?');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteAccount(user.id);
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account', error);
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
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
              onChange={(e) => {
                setProfilePicture(e.target.value);
                setProfilePreview(e.target.value);
                setProfileFile(null);
              }}
            />
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant">Or upload a new photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileFileChange}
                className="w-full bg-transparent text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary/20 transition-all"
              />
            </div>
            {profilePreview && (
              <div className="mt-4">
                <p className="text-xs text-on-surface-variant mb-2">Preview:</p>
                <img src={profilePreview} alt="Profile Preview" className="w-16 h-16 rounded-full object-cover" />
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

        <form onSubmit={handlePasswordChange} className="bg-surface-container-lowest p-8 rounded-lg space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface">Change Password</h2>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface">Current Password</label>
            <input
              type="password"
              required
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-on-surface"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface">New Password</label>
            <input
              type="password"
              required
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-on-surface"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface">Confirm New Password</label>
            <input
              type="password"
              required
              className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-on-surface"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isChangingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="bg-error-container text-on-error-container p-8 rounded-lg space-y-4">
          <div>
            <h2 className="text-xl font-bold">Danger Zone</h2>
            <p className="text-sm opacity-80">Delete your account and all associated data.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Type DELETE to confirm</label>
            <input
              type="text"
              className="w-full bg-white/10 border border-white/20 rounded-md px-4 py-3 text-on-error-container focus:ring-2 focus:ring-white/40 outline-none"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full bg-white/20 text-on-error-container py-3 rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </MainLayout>
  );
};
