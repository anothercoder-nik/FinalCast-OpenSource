import React, { memo, useState } from 'react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Mic, Video, Users, Mail } from 'lucide-react';
import EmailInvitationModal from '../../Main/EmailInvitationModal';

const ParticipantsPanel = ({ onlineParticipants, session, currentUser, isHost }) => {
    const totalCount = onlineParticipants.length;
    const [showEmailModal, setShowEmailModal] = useState(false);

    return (
        <div className="flex flex-col h-full bg-stone-900">
            {/* Header */}
            <div className="p-4 border-b border-stone-700 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-stone-400" />
                        <span>Online</span>
                        <Badge variant="secondary" className="bg-stone-800 text-stone-300 ml-1">
                            {totalCount}/{session?.maxParticipants || 10}
                        </Badge>
                    </h3>
                    {isHost && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowEmailModal(true)}
                            className="h-7 text-xs border-stone-600 text-stone-300 hover:text-white hover:bg-stone-800"
                        >
                            <Mail className="w-3 h-3 mr-1.5" />
                            Invite
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent">
                <div className="space-y-2">
                    {onlineParticipants.map((participant) => (
                        <div
                            key={participant.socketId}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${participant.isHost
                                ? 'bg-blue-900/10 border-blue-500/20 hover:border-blue-500/40'
                                : 'bg-stone-800/50 border-stone-800 hover:border-stone-700'
                                }`}
                        >
                            <div className="relative">
                                <Avatar className="w-9 h-9 border border-stone-700 shadow-sm">
                                    <AvatarFallback className={`text-xs font-semibold text-white ${participant.isHost ? 'bg-blue-600' : 'bg-green-600'
                                        }`}>
                                        {participant.userName?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-stone-900 rounded-full"></div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-stone-200 truncate leading-none">
                                        {participant.userName}
                                    </p>
                                    {participant.userId === currentUser?._id && <span className="text-[10px] text-stone-500 font-medium">(You)</span>}
                                </div>
                                <div className="flex items-center mt-1.5">
                                    {participant.isHost ? (
                                        <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">Host</Badge>
                                    ) : (
                                        <span className="text-[10px] text-stone-500">Listener</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                {/* We could pass actual muted state here if available in localParticipants data */}
                                <div className="p-1.5 rounded-md bg-stone-800 text-stone-400">
                                    <Mic className="w-3.5 h-3.5" />
                                </div>
                                <div className="p-1.5 rounded-md bg-stone-800 text-stone-400">
                                    <Video className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>
                    ))}

                    {onlineParticipants.length === 0 && (
                        <div className="text-center text-stone-500 py-12 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-stone-800/50 flex items-center justify-center mb-3">
                                <Users className="w-6 h-6 opacity-30" />
                            </div>
                            <p className="text-sm">No participants yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Email Invitation Modal */}
            <EmailInvitationModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                session={session}
                currentUser={currentUser}
            />
        </div>
    );
};

export default memo(ParticipantsPanel);
