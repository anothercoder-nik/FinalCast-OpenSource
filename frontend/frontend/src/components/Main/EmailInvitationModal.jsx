import React, { useState } from 'react';
import { Mail, Copy, Check, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { sendRoomInvitation, sendBulkInvitations } from '../../api/email.api';

const EmailInvitationModal = ({ isOpen, onClose, session, currentUser }) => {
  const [invitationType, setInvitationType] = useState('single'); // 'single' or 'bulk'
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Single invitation state
  const [singleInvite, setSingleInvite] = useState({
    guestEmail: '',
    guestName: '',
    customMessage: ''
  });

  // Bulk invitation state
  const [bulkGuests, setBulkGuests] = useState([
    { email: '', name: '' }
  ]);
  const [bulkMessage, setBulkMessage] = useState('');

  // Room link for copying
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : window.location.origin;
  const roomLink = `${baseUrl}/auth?redirect=${encodeURIComponent(`/studio/${session?.roomId}`)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      toast.success('Room link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleSingleInvite = async () => {
    if (!singleInvite.guestEmail.trim()) {
      toast.error('Guest email is required');
      return;
    }

    setLoading(true);
    try {
      await sendRoomInvitation({
        guestEmail: singleInvite.guestEmail,
        guestName: singleInvite.guestName || undefined,
        roomId: session.roomId,
        roomTitle: session.title,
        customMessage: singleInvite.customMessage || undefined
      });

      toast.success(`Invitation sent to ${singleInvite.guestEmail}!`);
      setSingleInvite({ guestEmail: '', guestName: '', customMessage: '' });
      onClose();
    } catch (error) {
      console.error('Failed to send invitation:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkInvites = async () => {
    const validGuests = bulkGuests.filter(guest => guest.email.trim());
    
    if (validGuests.length === 0) {
      toast.error('At least one valid email is required');
      return;
    }

    setLoading(true);
    try {
      const result = await sendBulkInvitations({
        guests: validGuests.map(guest => ({
          email: guest.email,
          name: guest.name || undefined
        })),
        roomId: session.roomId,
        roomTitle: session.title,
        customMessage: bulkMessage || undefined
      });

      if (result.success) {
        toast.success(`${result.summary.successful} invitation(s) sent successfully!`);
      } else {
        toast.warning(`${result.summary.successful} sent, ${result.summary.failed} failed`);
      }

      setBulkGuests([{ email: '', name: '' }]);
      setBulkMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send bulk invitations:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const addGuestField = () => {
    setBulkGuests([...bulkGuests, { email: '', name: '' }]);
  };

  const removeGuestField = (index) => {
    if (bulkGuests.length > 1) {
      setBulkGuests(bulkGuests.filter((_, i) => i !== index));
    }
  };

  const updateGuest = (index, field, value) => {
    const updated = [...bulkGuests];
    updated[index][field] = value;
    setBulkGuests(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-700">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Invite Guests</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {/* Room Info */}
          <div className="mb-6 p-4 bg-stone-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">{session?.title}</h3>
            <p className="text-sm text-stone-400 mb-3">Room ID: {session?.roomId}</p>
            
            {/* Copy Link */}
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 bg-stone-700 rounded text-sm text-stone-300 font-mono truncate">
                {roomLink}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="text-stone-300 border-stone-600 hover:bg-stone-700"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Invitation Type Tabs */}
          <div className="flex mb-6 bg-stone-800 rounded-lg p-1">
            <button
              onClick={() => setInvitationType('single')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                invitationType === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'text-stone-400 hover:text-white hover:bg-stone-700'
              }`}
            >
              Single Invitation
            </button>
            <button
              onClick={() => setInvitationType('bulk')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                invitationType === 'bulk'
                  ? 'bg-blue-600 text-white'
                  : 'text-stone-400 hover:text-white hover:bg-stone-700'
              }`}
            >
              Bulk Invitations
            </button>
          </div>

          {/* Single Invitation Form */}
          {invitationType === 'single' && (
            <div className="space-y-4">
              <div>
                <Label className="text-stone-300">Guest Email *</Label>
                <Input
                  type="email"
                  placeholder="guest@example.com"
                  value={singleInvite.guestEmail}
                  onChange={(e) => setSingleInvite(prev => ({ ...prev, guestEmail: e.target.value }))}
                  className="mt-1 bg-stone-800 border-stone-600 text-white"
                />
              </div>

              <div>
                <Label className="text-stone-300">Guest Name (Optional)</Label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={singleInvite.guestName}
                  onChange={(e) => setSingleInvite(prev => ({ ...prev, guestName: e.target.value }))}
                  className="mt-1 bg-stone-800 border-stone-600 text-white"
                />
              </div>

              <div>
                <Label className="text-stone-300">Custom Message (Optional)</Label>
                <Textarea
                  placeholder="Add a personal message to your invitation..."
                  value={singleInvite.customMessage}
                  onChange={(e) => setSingleInvite(prev => ({ ...prev, customMessage: e.target.value }))}
                  className="mt-1 bg-stone-800 border-stone-600 text-white"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Bulk Invitation Form */}
          {invitationType === 'bulk' && (
            <div className="space-y-4">
              <div>
                <Label className="text-stone-300">Guests</Label>
                <div className="space-y-3 mt-2">
                  {bulkGuests.map((guest, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={guest.email}
                        onChange={(e) => updateGuest(index, 'email', e.target.value)}
                        className="flex-1 bg-stone-800 border-stone-600 text-white"
                      />
                      <Input
                        type="text"
                        placeholder="Name (optional)"
                        value={guest.name}
                        onChange={(e) => updateGuest(index, 'name', e.target.value)}
                        className="flex-1 bg-stone-800 border-stone-600 text-white"
                      />
                      {bulkGuests.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuestField(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addGuestField}
                    className="text-stone-300 border-stone-600 hover:bg-stone-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Guest
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-stone-300">Custom Message (Optional)</Label>
                <Textarea
                  placeholder="Add a personal message to your invitations..."
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  className="mt-1 bg-stone-800 border-stone-600 text-white"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-stone-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="text-stone-300 border-stone-600 hover:bg-stone-700"
          >
            Cancel
          </Button>
          <Button
            onClick={invitationType === 'single' ? handleSingleInvite : handleBulkInvites}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Sending...' : `Send ${invitationType === 'single' ? 'Invitation' : 'Invitations'}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailInvitationModal;
