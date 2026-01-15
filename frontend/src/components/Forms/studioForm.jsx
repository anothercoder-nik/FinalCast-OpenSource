import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Hand, Mic, Video, ArrowRight, ArrowLeft, Check, Copy } from 'lucide-react';
import { createSession } from '../../api/session.api';

const defaultSettings = { requireApproval: true, muteOnJoin: true, videoOnJoin: true };

const StudioForm = ({ onCreated }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', description: '', scheduledAt: '', maxParticipants: 3, settings: { ...defaultSettings }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdSession, setCreatedSession] = useState(null);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateSetting = (key, value) =>
    setForm(prev => ({ ...prev, settings: { ...prev.settings, [key]: value } }));

  const handleNext = () => {
    if (step === 1 && !form.title.trim()) return setError('Title is required');
    setError(null);
    setStep(s => s + 1);
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await createSession(form);
      setCreatedSession(session);
      setStep(3);
      onCreated?.(session);
    } catch (err) {
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setForm({ title: '', description: '', scheduledAt: '', maxParticipants: 3, settings: { ...defaultSettings } });
    setCreatedSession(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 to-slate-950 py-12 px-4 flex items-center justify-center">
      <div className="bg-slate-900 border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {step < 3 && (
          <div className="flex justify-center mb-8 gap-2">
            {[1, 2].map(i => (
              <div key={i} className={`w-3 h-3 rounded-full transition-all ${step >= i ? 'bg-blue-500' : 'bg-gray-700'}`} />
            ))}
          </div>
        )}

        {error && <div className="bg-red-900/20 text-red-400 p-3 rounded-xl mb-6">{error}</div>}

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Create Studio</h2>
              <p className="text-gray-400">Basic details</p>
            </div>

            <div className="space-y-4">
              <Input label="Title *" value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="My Cool Podcast" />
              <TextArea label="Description" value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="About this session..." />
              <Input type="datetime-local" label="Schedule (Optional)" value={form.scheduledAt} onChange={e => updateForm('scheduledAt', e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Settings</h2>
              <p className="text-gray-400">Configure preferences</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <label className="block text-sm font-semibold text-gray-300 mb-3">Participants: <span className="text-blue-400">{form.maxParticipants}</span></label>
              <input type="range" min="2" max="10" value={form.maxParticipants} onChange={e => updateForm('maxParticipants', parseInt(e.target.value))} className="w-full accent-blue-500" />
            </div>

            <div className="space-y-3">
              <Toggle label="Require Approval" icon={<Hand size={18} />} checked={form.settings.requireApproval} onChange={v => updateSetting('requireApproval', v)} />
              <Toggle label="Mute on Join" icon={<Mic size={18} />} checked={form.settings.muteOnJoin} onChange={v => updateSetting('muteOnJoin', v)} />
              <Toggle label="Video on Join" icon={<Video size={18} />} checked={form.settings.videoOnJoin} onChange={v => updateSetting('videoOnJoin', v)} />
            </div>
          </div>
        )}

        {step === 3 && createdSession && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400"><Check size={32} /></div>
            <h2 className="text-3xl font-bold text-white">Ready to go!</h2>
            <div className="bg-gray-800 p-4 rounded-xl flex justify-between items-center border border-gray-700">
              <span className="text-gray-400">Room ID:</span>
              <span className="font-mono text-xl font-bold text-blue-400">{createdSession.roomId}</span>
            </div>
            <div className="space-y-3">
              <button onClick={() => navigate({ to: `/studio/${createdSession.roomId}` })} className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white hover:scale-105 transition-transform">Join Studio</button>
              <button onClick={reset} className="w-full py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700">Create Another</button>
            </div>
          </div>
        )}

        {step < 3 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="px-6 py-2 text-gray-400 hover:text-white disabled:opacity-50 flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
            {step === 1 ? (
              <button onClick={handleNext} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-lg flex items-center gap-2 font-semibold">Next <ArrowRight size={16} /></button>
            ) : (
              <button onClick={submit} disabled={loading} className="bg-green-600 hover:bg-green-500 text-white px-8 py-2 rounded-lg flex items-center gap-2 font-semibold disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Studio'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
    <input className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:border-blue-500 focus:outline-none transition-colors" {...props} />
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
    <textarea rows={3} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none" {...props} />
  </div>
);

const Toggle = ({ label, icon, checked, onChange }) => (
  <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${checked ? 'bg-blue-900/20 border-blue-500/50' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}>
    <div className="flex items-center gap-3 text-gray-200">
      {icon} <span className="font-medium">{label}</span>
    </div>
    <div className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-700'}`}>
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </div>
    <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
  </label>
);

export default StudioForm;
