import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Shield, ShieldCheck, Key, Copy, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { get2FAStatus, setup2FA, enable2FA, disable2FA, regenerateBackupCodes } from '../../api/user.api.js';

const TwoFactorSetup = ({ onClose }) => {
  const [step, setStep] = useState('status'); // status, setup, verify, backup
  const [data, setData] = useState({ qrCode: '', secret: '', backupCodes: [] });
  const [status, setStatus] = useState({ enabled: false, unusedCodes: 0 });
  const [loading, setLoading] = useState(false);

  // Inputs
  const [verifyCode, setVerifyCode] = useState('');
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadStatus(); }, []);

  const loadStatus = async () => {
    try {
      const res = await get2FAStatus();
      setStatus({ enabled: res.twoFactorEnabled, unusedCodes: res.unusedBackupCodes });
    } catch { toast.error('Failed to load 2FA status'); }
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await setup2FA();
      setData(prev => ({ ...prev, qrCode: res.qrCode, secret: res.secret }));
      setStep('setup');
    } catch (e) { toast.error(e.response?.data?.message || 'Setup failed'); }
    finally { setLoading(false); }
  };

  const handleEnable = async () => {
    if (verifyCode.length !== 6) return toast.error('Enter 6-digit code');
    setLoading(true);
    try {
      const res = await enable2FA(verifyCode);
      setData(prev => ({ ...prev, backupCodes: res.backupCodes }));
      setStep('backup');
      toast.success('2FA Enabled!');
      loadStatus();
    } catch (e) { toast.error(e.response?.data?.message || 'Verification failed'); }
    finally { setLoading(false); }
  };

  const handleDisable = async () => {
    if (!password) return toast.error('Password required');
    setLoading(true);
    try {
      await disable2FA(password, null); // token not strictly needed for disable often, check API
      toast.success('2FA Disabled');
      setPassword('');
      loadStatus();
      setStep('status');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to disable 2FA'); }
    finally { setLoading(false); }
  };

  const handleRegenerate = async () => {
    if (!password) return toast.error('Password required');
    setLoading(true);
    try {
      const res = await regenerateBackupCodes(password);
      setData(prev => ({ ...prev, backupCodes: res.backupCodes }));
      setStep('backup');
      setPassword('');
      toast.success('Codes regenerated');
      loadStatus();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to regenerate codes'); }
    finally { setLoading(false); }
  };

  const copyCodes = () => {
    navigator.clipboard.writeText(data.backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  // --- Render Steps ---

  if (step === 'status') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {status.enabled ? <ShieldCheck className="w-8 h-8 text-green-500" /> : <Shield className="w-8 h-8 text-gray-400" />}
            <div>
              <h3 className="font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">{status.enabled ? 'Protected' : 'Not Enabled'}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
            {status.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {status.enabled ? (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> 2FA Active</p>
              <p className="text-sm text-green-700 mt-1">{status.unusedCodes} backup codes remaining.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password to make changes</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="• • • • • •" />
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRegenerate} disabled={loading || !password} className="flex-1">Regenerate Codes</Button>
                <Button variant="destructive" onClick={handleDisable} disabled={loading || !password} className="flex-1">Disable 2FA</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
              Protect your account with an extra layer of security using your authenticator app.
            </div>
            <Button onClick={handleSetup} disabled={loading} className="w-full">Enable 2FA</Button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="space-y-6 text-center">
        <div>
          <h3 className="font-semibold">Scan QR Code</h3>
          <p className="text-sm text-gray-600">Use Google Authenticator or Authy</p>
        </div>
        <div className="flex justify-center bg-white p-4 border rounded-lg w-fit mx-auto">
          <img src={data.qrCode} alt="QR" className="w-40 h-40" />
        </div>
        <div className="bg-gray-50 p-2 rounded text-xs font-mono break-all">{data.secret}</div>

        <div className="space-y-2">
          <Input
            value={verifyCode}
            onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="text-center text-lg font-mono"
            maxLength={6}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('status')} className="flex-1">Cancel</Button>
            <Button onClick={handleEnable} disabled={loading || verifyCode.length !== 6} className="flex-1">Verify</Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="font-semibold">Save Backup Codes</h3>
          <p className="text-sm text-gray-600">Keep these safe. You won't see them again.</p>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg flex gap-2 text-sm text-yellow-800 border border-yellow-200">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>If you lose your device, these codes are the only way to recover your account.</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-sm">Your Codes</h4>
            <Button size="sm" variant="ghost" onClick={copyCodes} className="h-8">
              {copied ? <Check className="w-4 h-4 text-green-600 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            {data.backupCodes.map((c, i) => (
              <code key={i} className="bg-white border rounded py-1 text-sm font-mono">{c}</code>
            ))}
          </div>
        </div>

        <Button onClick={() => { setStep('status'); onClose?.(); }} className="w-full">
          I've Saved Them
        </Button>
      </div>
    );
  }

  return null;
};

// Wrapper card
export default function TwoFactorSetupWrapper(props) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span>Two-Factor Authentication</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TwoFactorSetup {...props} />
      </CardContent>
    </Card>
  );
}
