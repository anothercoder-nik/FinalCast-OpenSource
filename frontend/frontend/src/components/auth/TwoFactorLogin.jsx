import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Shield, Key, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { loginUser } from '../../api/user.api.js';

const TwoFactorLogin = ({ email, password, onSuccess, onBack, redirectTo }) => {
  const [code, setCode] = useState('');
  const [isBackup, setIsBackup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    // Validate input
    if (isBackup && !code) return toast.error('Enter backup code');
    if (!isBackup && code.length !== 6) return toast.error('Enter valid 6-digit code');

    setLoading(true);
    try {
      const response = await loginUser(
        email,
        password,
        !isBackup ? code : undefined,
        isBackup ? code : undefined
      );

      toast.success('Login successful!');
      onSuccess(response, redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    // Determine filter based on mode (numbers only vs alphanumeric)
    const val = isBackup
      ? e.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 8)
      : e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Two-Factor Authentication</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            {isBackup
              ? 'Enter one of your backup codes to continue'
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
          {redirectTo && (
            <p className="text-blue-600 text-xs mt-2">
              🎥 Redirecting to studio after verification
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isBackup ? 'Backup Code' : 'Verification Code'}
            </label>
            <Input
              type="text"
              value={code}
              onChange={handleInput}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              placeholder={isBackup ? "Enter backup code" : "000000"}
              maxLength={isBackup ? 8 : 6}
              className="text-center text-lg font-mono"
              autoFocus
            />
          </div>

          <Button
            variant="link"
            onClick={() => {
              setIsBackup(!isBackup);
              setCode(''); // Clear input on switch
            }}
            className="w-full text-sm"
          >
            {isBackup ? <Shield className="w-4 h-4 mr-2" /> : <Key className="w-4 h-4 mr-2" />}
            {isBackup ? 'Use authenticator app instead' : 'Use backup code instead'}
          </Button>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleVerify}
            disabled={loading || !code}
            className="flex-1"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500">
          Lost access? Contact support.
        </p>
      </CardContent>
    </Card>
  );
};

export default TwoFactorLogin;
