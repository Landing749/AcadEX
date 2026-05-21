import React, { useState, useRef } from 'react';
import {
  Camera, Edit3, Save, X, Share2, Link, Globe, Lock,
  GraduationCap, BookOpen, User, Check, Copy, ExternalLink,
  Palette, Image as ImageIcon, Trash2,
} from 'lucide-react';
import { useProfile } from '../../hooks/useFirebase';
import { useAuth } from '../../contexts/AuthContext';
import { PHILIPPINE_SCHOOLS, SCHOOL_TYPES } from '../../types';
import { ImageCropModal } from './ImageCropModal';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { cn, getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

// ---- Banner gradient presets ----
const BANNER_GRADIENTS = [
  { id: 'indigo', label: 'Indigo', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'sunset', label: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'ocean', label: 'Ocean', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'forest', label: 'Forest', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 'fire', label: 'Fire', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'night', label: 'Night', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { id: 'candy', label: 'Candy', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { id: 'mint', label: 'Mint', value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
];

const AVATAR_BG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#14b8a6', '#f97316',
];

const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate'];

interface EditForm {
  displayName: string;
  bio: string;
  school: string;
  course: string;
  yearLevel: string;
}

export function ProfileView() {
  const { currentUser } = useAuth();
  const { profile, loading, updateProfile } = useProfile();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditForm>({
    displayName: '',
    bio: '',
    school: '',
    course: '',
    yearLevel: '',
  });

  // Image crop state
  const [cropMode, setCropMode] = useState<'avatar' | 'banner'>('avatar');
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // UI state
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Current values (profile or defaults)
  const displayName = profile?.displayName || currentUser?.displayName || 'Student';
  const bio = profile?.bio || '';
  const school = profile?.school || '';
  const course = profile?.course || '';
  const yearLevel = profile?.yearLevel || '';
  const avatarUrl = profile?.avatarUrl || currentUser?.photoURL || '';
  const bannerUrl = profile?.bannerUrl || '';
  const bannerGradient = profile?.bannerGradient || BANNER_GRADIENTS[0].value;
  const avatarBg = profile?.avatarBg || '#6366f1';
  const isPublic = profile?.isPublic ?? true;
  const shareId = profile?.shareId || currentUser?.uid?.slice(0, 12) || 'acadex';

  const shareUrl = `${window.location.origin}${window.location.pathname}?profile=${shareId}`;

  const startEdit = () => {
    setForm({
      displayName,
      bio,
      school,
      course,
      yearLevel,
    });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        displayName: form.displayName.trim() || displayName,
        bio: form.bio.trim(),
        school: form.school,
        course: form.course.trim(),
        yearLevel: form.yearLevel,
      });
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (file: File, mode: 'avatar' | 'banner') => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    setCropMode(mode);
    setCropFile(file);
    setShowCrop(true);
  };

  const handleCropped = async (blob: Blob) => {
    const isAvatar = cropMode === 'avatar';
    if (isAvatar) setUploadingAvatar(true);
    else setUploadingBanner(true);

    try {
      const file = new File([blob], `${cropMode}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const res = await uploadToCloudinary(file);
      await updateProfile(
        isAvatar
          ? { avatarUrl: res.secure_url }
          : { bannerUrl: res.secure_url }
      );
      toast.success(`${isAvatar ? 'Profile photo' : 'Banner'} updated!`);
    } catch {
      toast.error('Upload failed. Try again.');
    } finally {
      setUploadingAvatar(false);
      setUploadingBanner(false);
    }
  };

  const handleGradientSelect = async (gradient: string) => {
    await updateProfile({ bannerGradient: gradient, bannerUrl: '' });
    setShowGradientPicker(false);
    toast.success('Banner updated!');
  };

  const handleAvatarBgSelect = async (color: string) => {
    await updateProfile({ avatarBg: color });
  };

  const handleRemoveBannerImage = async () => {
    await updateProfile({ bannerUrl: '' });
    toast.success('Banner image removed');
  };

  const handleTogglePublic = async () => {
    await updateProfile({ isPublic: !isPublic });
    toast.success(isPublic ? 'Profile is now private' : 'Profile is now public');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success('Link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <div className="skeleton h-48 rounded-3xl" />
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 animate-fade-in space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-gray-500">Customize how others see you</p>
        </div>
        {!editing ? (
          <button onClick={startEdit} className="btn-primary text-sm">
            <Edit3 size={14} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={cancelEdit} className="btn-secondary text-sm">
              <X size={14} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Banner + Avatar card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="relative group">
          <div
            className="h-40 w-full"
            style={{
              background: bannerUrl
                ? undefined
                : bannerGradient,
              backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Banner overlay actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-gray-800 text-xs font-semibold hover:bg-white transition-colors"
            >
              {uploadingBanner ? (
                <div className="w-3 h-3 border border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ImageIcon size={13} />
              )}
              Upload Photo
            </button>
            <button
              onClick={() => setShowGradientPicker(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-gray-800 text-xs font-semibold hover:bg-white transition-colors"
            >
              <Palette size={13} /> Gradient
            </button>
            {bannerUrl && (
              <button
                onClick={handleRemoveBannerImage}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-red-500/90 text-white text-xs font-semibold hover:bg-red-500 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'banner')}
          />
        </div>

        {/* Gradient picker dropdown */}
        {showGradientPicker && (
          <div className="px-5 pt-4 pb-2 border-b border-gray-100 dark:border-white/5 animate-fade-in">
            <p className="text-xs font-semibold text-gray-500 mb-2">Choose a gradient</p>
            <div className="grid grid-cols-4 gap-2">
              {BANNER_GRADIENTS.map(g => (
                <button
                  key={g.id}
                  onClick={() => handleGradientSelect(g.value)}
                  className={cn(
                    'h-10 rounded-xl transition-all hover:scale-105 ring-2',
                    bannerGradient === g.value && !bannerUrl
                      ? 'ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800'
                      : 'ring-transparent'
                  )}
                  style={{ background: g.value }}
                  title={g.label}
                />
              ))}
            </div>
            <button
              onClick={() => setShowGradientPicker(false)}
              className="mt-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Close
            </button>
          </div>
        )}

        {/* Avatar + name */}
        <div className="px-5 pb-5">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div
                className="w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-800 overflow-hidden flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ background: avatarUrl ? undefined : avatarBg }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(displayName)
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                {uploadingAvatar ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={18} className="text-white" />
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'avatar')}
              />
            </div>

            {/* Avatar bg color dots (only shown when no avatar image) */}
            {!avatarUrl && (
              <div className="flex gap-1.5 items-center pb-1">
                {AVATAR_BG_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handleAvatarBgSelect(color)}
                    className={cn(
                      'w-5 h-5 rounded-full transition-all hover:scale-110',
                      avatarBg === color ? 'ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-300 dark:ring-offset-gray-800' : ''
                    )}
                    style={{ background: color }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Name / bio */}
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="label">Display Name</label>
                <input
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  className="input"
                  placeholder="Your name"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  className="input resize-none"
                  rows={2}
                  placeholder="Write a short bio about yourself..."
                  maxLength={160}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/160</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">School</label>
                  <select
                    value={form.school}
                    onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                    className="input"
                  >
                    <option value="">Select school...</option>
                    {PHILIPPINE_SCHOOLS.map(s => (
                      <option key={s} value={s}>{s.length > 30 ? s.slice(0, 28) + '...' : s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Year Level</label>
                  <select
                    value={form.yearLevel}
                    onChange={e => setForm(f => ({ ...f, yearLevel: e.target.value }))}
                    className="input"
                  >
                    <option value="">Select year...</option>
                    {YEAR_LEVELS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Course / Program</label>
                <input
                  value={form.course}
                  onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                  className="input"
                  placeholder="e.g. BS Computer Science"
                  maxLength={80}
                />
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h2>
              {bio && <p className="text-sm text-gray-500 mt-1">{bio}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                {school && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                    <GraduationCap size={11} /> {school.length > 30 ? school.slice(0, 28) + '...' : school}
                  </span>
                )}
                {course && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">
                    <BookOpen size={11} /> {course}
                  </span>
                )}
                {yearLevel && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                    <User size={11} /> {yearLevel}
                  </span>
                )}
                {!school && !course && !yearLevel && (
                  <p className="text-xs text-gray-400 italic">No school or course set — click Edit Profile</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Profile Card */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-indigo-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Share Profile</h3>
          </div>
          <button
            onClick={handleTogglePublic}
            className={cn(
              'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all',
              isPublic
                ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-white/10 text-gray-500'
            )}
          >
            {isPublic ? <Globe size={12} /> : <Lock size={12} />}
            {isPublic ? 'Public' : 'Private'}
          </button>
        </div>

        {isPublic ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              Share this link so others can view your profile and banner customization.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                <Link size={12} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-300 truncate font-mono">
                  {shareUrl}
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0',
                  copiedLink
                    ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'btn-secondary'
                )}
              >
                {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            Your profile is private. Toggle to Public to get a shareable link.
          </p>
        )}
      </div>

      {/* Preview card (what others see) */}
      {isPublic && (
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Profile Preview
          </p>
          <ProfilePreviewCard
            displayName={displayName}
            bio={bio}
            school={school}
            course={course}
            yearLevel={yearLevel}
            avatarUrl={avatarUrl}
            bannerUrl={bannerUrl}
            bannerGradient={bannerGradient}
            avatarBg={avatarBg}
          />
        </div>
      )}

      {/* Crop modal */}
      <ImageCropModal
        isOpen={showCrop}
        onClose={() => setShowCrop(false)}
        onCrop={handleCropped}
        imageFile={cropFile}
        mode={cropMode}
      />
    </div>
  );
}

// ---- Compact preview card (what others see on your shared profile) ----
function ProfilePreviewCard({
  displayName, bio, school, course, yearLevel,
  avatarUrl, bannerUrl, bannerGradient, avatarBg,
}: {
  displayName: string; bio: string; school: string; course: string; yearLevel: string;
  avatarUrl: string; bannerUrl: string; bannerGradient: string; avatarBg: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm">
      {/* Mini banner */}
      <div
        className="h-20"
        style={{
          background: bannerUrl ? undefined : bannerGradient,
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="px-4 pb-4">
        <div className="flex items-end gap-3 -mt-6 mb-3">
          <div
            className="w-12 h-12 rounded-xl border-2 border-white dark:border-gray-800 overflow-hidden flex items-center justify-center text-white text-base font-bold shadow"
            style={{ background: avatarUrl ? undefined : avatarBg }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : getInitials(displayName)}
          </div>
        </div>
        <p className="font-bold text-gray-900 dark:text-white text-sm">{displayName}</p>
        {bio && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{bio}</p>}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {school && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {school.length > 20 ? school.slice(0, 18) + '...' : school}
            </span>
          )}
          {course && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
              {course}
            </span>
          )}
          {yearLevel && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {yearLevel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Public profile page (rendered when visiting a ?profile= share link) ----

import { usePublicProfile } from '../../hooks/useFirebase';

export function PublicProfilePage({ shareId }: { shareId: string }) {
  const { profile, loading, notFound } = usePublicProfile(shareId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg animate-pulse">
            <span className="text-xl font-bold text-white">A</span>
          </div>
          <p className="text-sm text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile not found</h2>
          <p className="text-sm text-gray-500 mb-6">This profile is private or the link is invalid.</p>
          <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Go to Acadex
          </a>
        </div>
      </div>
    );
  }

  const {
    displayName, bio, school, course, yearLevel,
    avatarUrl = '', bannerUrl = '',
    bannerGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    avatarBg = '#6366f1',
  } = profile;

  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-10 px-4">
      {/* Acadex branding */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-xs font-bold text-white">A</span>
        </div>
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Acadex</span>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Banner */}
        <div
          className="h-36 w-full"
          style={{
            background: bannerUrl ? undefined : bannerGradient,
            backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div
              className="w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-800 overflow-hidden flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0"
              style={{ background: avatarUrl ? undefined : avatarBg }}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                : initials
              }
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h1>
          {bio && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{bio}</p>}

          <div className="flex flex-wrap gap-2 mt-3">
            {school && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                <GraduationCap size={11} /> {school.length > 35 ? school.slice(0, 33) + '…' : school}
              </span>
            )}
            {course && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">
                <BookOpen size={11} /> {course}
              </span>
            )}
            {yearLevel && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                <User size={11} /> {yearLevel}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Made with <a href="/" className="text-indigo-500 font-medium hover:underline">Acadex</a>
      </p>
    </div>
  );
}