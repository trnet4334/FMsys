'use client';

import { Cake, Check, Lock, Mail, Pencil, Sparkles, Smartphone, X } from 'lucide-react';
import { useState } from 'react';

import { Overlay } from '../ui/overlay';
import { ChangePasswordOverlay } from './change-password-overlay';

type MyAccountOverlayProps = {
  onClose: () => void;
};

type Field = { key: string; Icon: typeof Mail; label: string; type: string };

const FIELDS: Field[] = [
  { key: 'email',   Icon: Mail,       label: 'Email',        type: 'email' },
  { key: 'phone',   Icon: Smartphone, label: 'Phone',        type: 'tel'   },
  { key: 'dob',     Icon: Cake,       label: 'Date of Birth', type: 'text' },
];

const INITIAL = {
  email: 'user@fmsys.local',
  phone: '+886 912 345 678',
  dob:   'January 12, 1992',
};

export function MyAccountOverlay({ onClose }: MyAccountOverlayProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(INITIAL);
  const [saved, setSaved] = useState(INITIAL);
  const [changingPassword, setChangingPassword] = useState(false);

  function handleSave() {
    setSaved(draft);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(saved);
    setEditing(false);
  }

  return (
    <>
    <Overlay title="My Account" onClose={onClose}>
      <div className="px-6 py-8 space-y-8">
        {/* Avatar + name */}
        <section className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="size-24 rounded-full bg-brand-weak border-2 border-brand/30 flex items-center justify-center text-brand text-3xl font-bold">
              U
            </div>
            <div className="absolute bottom-0 right-0 size-7 bg-brand rounded-full flex items-center justify-center border-4 border-card">
              <Sparkles size={12} className="text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-ink-0 tracking-tight">User</h2>
            <span className="mt-2 inline-block px-3 py-1 bg-brand-weak text-brand text-[10px] font-black uppercase tracking-widest rounded-full border border-brand/20">
              Pro Plan
            </span>
          </div>
        </section>

        {/* Subscription card */}
        <section className="relative overflow-hidden rounded-xl p-6 bg-bg-1 border border-line">
          <div className="absolute -top-10 -right-10 size-32 bg-brand/10 blur-[40px] rounded-full" />
          <div className="relative flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-ink-disabled uppercase tracking-wider mb-1">Current Plan</p>
              <h3 className="text-xl font-bold text-ink-0">Pro Plan</h3>
            </div>
            <div className="size-12 bg-card rounded-xl flex items-center justify-center border border-line">
              <Sparkles size={22} className="text-brand" />
            </div>
          </div>
          <div className="relative mt-6 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium text-ink-1">Renewal Date</p>
              <p className="text-sm font-semibold text-ink-0">Oct 24, 2025</p>
            </div>
            <button type="button" className="px-4 py-2 bg-card text-ink-0 text-xs font-bold rounded-lg border border-line hover:bg-bg-1 transition-colors">
              Manage
            </button>
          </div>
        </section>

        {/* Personal details */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[11px] font-bold text-ink-disabled uppercase tracking-widest">Personal Details</h4>
            {editing && (
              <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Editing</span>
            )}
          </div>

          <div className="space-y-2">
            {FIELDS.map(({ key, Icon, label, type }) => (
              <div
                key={key}
                className={`flex items-center p-4 bg-bg-1 border rounded-xl gap-4 transition-colors ${
                  editing ? 'border-brand/40' : 'border-line'
                }`}
              >
                <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  editing ? 'bg-brand-weak' : 'bg-card'
                }`}>
                  <Icon size={18} className={editing ? 'text-brand' : 'text-ink-1'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-ink-disabled uppercase tracking-tight mb-0.5">{label}</p>
                  {editing ? (
                    <input
                      type={type}
                      value={draft[key as keyof typeof draft]}
                      onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full bg-transparent text-sm font-medium text-ink-0 outline-none border-b border-brand/40 focus:border-brand pb-0.5 transition-colors"
                    />
                  ) : (
                    <p className="text-sm font-medium text-ink-0">{saved[key as keyof typeof saved]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="grid grid-cols-2 gap-3">
          {editing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center justify-center gap-2 py-4 bg-brand text-white font-bold rounded-xl shadow-soft hover:opacity-90 transition-all"
              >
                <Check size={18} />
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 py-4 bg-bg-1 text-ink-0 font-bold rounded-xl border border-line hover:bg-card transition-all"
              >
                <X size={18} />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center justify-center gap-2 py-4 bg-brand text-white font-bold rounded-xl shadow-soft hover:opacity-90 transition-all"
              >
                <Pencil size={18} />
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => setChangingPassword(true)}
                className="flex items-center justify-center gap-2 py-4 bg-bg-1 text-ink-0 font-bold rounded-xl border border-line hover:bg-card transition-all"
              >
                <Lock size={18} />
                Password
              </button>
            </>
          )}
        </section>

        {/* Sign out */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 text-danger/70 hover:text-danger text-sm font-bold border border-danger/10 rounded-xl hover:bg-danger/5 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </Overlay>
    {changingPassword && <ChangePasswordOverlay onClose={() => setChangingPassword(false)} />}
    </>
  );
}
