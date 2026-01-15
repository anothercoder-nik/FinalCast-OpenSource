import React, { memo } from 'react';
import {
    Users, MessageCircle, Settings, MoreHorizontal, Sparkles
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import ParticipantsPanel from './ParticipantsPanel';
import ChatPanel from './ChatPanel';
import SettingsPanel from './SettingsPanel';
import ProducerPanel from './ProducerPanel';

const Sidebar = ({
    onlineParticipants,
    messages,
    settings,
    onSendMessage,

    onTypingStart,
    onTypingStop,
    typingUsers,
    onUpdateSettings,
    session,
    currentUser,
    isHost,
    isJoined,
    isCollapsed,
    onToggleCollapse,
    socket // Add socket prop
}) => {
    // If collapsed, show only a thin bar with expand button
    if (isCollapsed) {
        return (
            <div className="w-14 bg-stone-900 border-l border-stone-800 flex flex-col items-center py-4 transition-all duration-300 ease-in-out">
                <Button
                    onClick={onToggleCollapse}
                    variant="ghost"
                    size="icon"
                    className="text-stone-400 hover:text-white hover:bg-stone-800 mb-6"
                    title="Expand sidebar"
                >
                    <MessageCircle className="w-5 h-5" />
                </Button>

                {/* Participant count indicator */}
                <div className="flex flex-col items-center gap-1 mb-4 group cursor-help">
                    <div className="p-2 rounded-lg bg-stone-800 text-stone-400 group-hover:bg-stone-700 group-hover:text-white transition-colors">
                        <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-stone-400">{onlineParticipants.length}</span>
                </div>

                {/* Chat indicator - show if there are unread messages (mock logic for now if we don't track read state) */}
                <div className="relative p-2 rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer" onClick={onToggleCollapse}>
                    <MessageCircle className="w-4 h-4" />
                    {messages.length > 0 && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border border-stone-900"></div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 bg-stone-900 border-l border-stone-800 flex flex-col relative shadow-xl transition-all duration-300 ease-in-out">
            {/* Collapse button */}
            <Button
                onClick={onToggleCollapse}
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-stone-400 hover:text-white hover:bg-stone-800 z-20 w-8 h-8"
                title="Collapse sidebar"
            >
                <MoreHorizontal className="w-4 h-4" />
            </Button>

            <Tabs defaultValue="chat" className="flex flex-col h-full">
                <TabsList className={`grid w-full ${isHost ? 'grid-cols-4' : 'grid-cols-2'} bg-stone-900 border-b border-stone-800 p-0 h-10 rounded-none`}>
                    <TabsTrigger
                        value="chat"
                        className="data-[state=active]:bg-stone-800/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-stone-400 rounded-none h-full bg-transparent border-b-2 border-transparent transition-all"
                    >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                    </TabsTrigger>
                    <TabsTrigger
                        value="participants"
                        className="data-[state=active]:bg-stone-800/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-stone-400 rounded-none h-full bg-transparent border-b-2 border-transparent transition-all"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">People</span>
                        <span className="ml-1 text-[10px] bg-stone-800 px-1.5 py-0.5 rounded-full">{onlineParticipants.length}</span>
                    </TabsTrigger>
                    {isHost && (
                        <>
                            <TabsTrigger
                                value="producer"
                                className="data-[state=active]:bg-stone-800/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 text-stone-400 rounded-none h-full bg-transparent border-b-2 border-transparent transition-all"
                                title="AI Producer"
                            >
                                <Sparkles className="w-4 h-4 text-purple-400" />
                            </TabsTrigger>
                            <TabsTrigger
                                value="settings"
                                className="data-[state=active]:bg-stone-800/50 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-stone-400 rounded-none h-full bg-transparent border-b-2 border-transparent transition-all"
                            >
                                <Settings className="w-4 h-4" />
                            </TabsTrigger>
                        </>
                    )}
                </TabsList>

                <TabsContent value="chat" className="flex-1 m-0 min-h-0">
                    <ChatPanel
                        messages={messages}
                        onSendMessage={onSendMessage}
                        onTypingStart={onTypingStart}
                        onTypingStop={onTypingStop}
                        typingUsers={typingUsers}
                        currentUser={currentUser}
                        isJoined={isJoined}
                    />
                </TabsContent>

                <TabsContent value="participants" className="flex-1 m-0 min-h-0">
                    <ParticipantsPanel
                        onlineParticipants={onlineParticipants}
                        session={session}
                        currentUser={currentUser}
                        isHost={isHost}
                    />
                </TabsContent>

                {isHost && (
                    <>
                        <TabsContent value="producer" className="flex-1 m-0 min-h-0">
                            <ProducerPanel
                                roomId={session?.roomId}
                                isHost={isHost}
                                socket={socket}
                            />
                        </TabsContent>
                        <TabsContent value="settings" className="flex-1 m-0 min-h-0">
                            <SettingsPanel
                                settings={settings}
                                onUpdateSettings={onUpdateSettings}
                            />
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
};

export default memo(Sidebar);
