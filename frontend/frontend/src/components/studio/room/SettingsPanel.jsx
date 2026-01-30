import React, { memo } from 'react';
import { Mic, Video, Settings } from 'lucide-react';

const SettingsPanel = ({ settings, onUpdateSettings }) => {
    const updateSetting = (key, value) => {
        onUpdateSettings({ ...settings, [key]: value });
    };

    return (
        <div className="flex flex-col h-full bg-stone-900">
            <div className="p-4 border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm">
                <h3 className="font-medium text-white text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4 text-stone-400" />
                    Session Settings
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-stone-700">
                {/* Audio Settings */}
                <div className="space-y-4">
                    <h4 className="font-medium text-stone-200 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Mic className="w-3.5 h-3.5 text-green-400" />
                        Audio Controls
                    </h4>

                    <div className="space-y-3 pl-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-stone-800/30 hover:bg-stone-800/50 transition-colors">
                            <label htmlFor="muteOnJoin" className="text-sm text-stone-300 cursor-pointer flex-1">
                                Mute participants on join
                            </label>
                            <button
                                onClick={() => updateSetting('muteOnJoin', !settings.muteOnJoin)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${settings.muteOnJoin ? 'bg-blue-600' : 'bg-stone-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${settings.muteOnJoin ? 'translate-x-4' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-stone-800" />

                {/* Video Settings */}
                <div className="space-y-4">
                    <h4 className="font-medium text-stone-200 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Video className="w-3.5 h-3.5 text-blue-400" />
                        Video Controls
                    </h4>

                    <div className="space-y-3 pl-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-stone-800/30 hover:bg-stone-800/50 transition-colors">
                            <label htmlFor="videoOnJoin" className="text-sm text-stone-300 cursor-pointer flex-1">
                                Enable video on join
                            </label>
                            <button
                                onClick={() => updateSetting('videoOnJoin', !settings.videoOnJoin)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${settings.videoOnJoin ? 'bg-blue-600' : 'bg-stone-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${settings.videoOnJoin ? 'translate-x-4' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-stone-800" />

                {/* Session Settings */}
                <div className="space-y-4">
                    <h4 className="font-medium text-stone-200 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Settings className="w-3.5 h-3.5 text-orange-400" />
                        General
                    </h4>

                    <div className="space-y-3 pl-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-stone-800/30 hover:bg-stone-800/50 transition-colors">
                            <label htmlFor="requireApproval" className="text-sm text-stone-300 cursor-pointer flex-1">
                                Require approval to join
                            </label>
                            <button
                                onClick={() => updateSetting('requireApproval', !settings.requireApproval)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${settings.requireApproval ? 'bg-blue-600' : 'bg-stone-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${settings.requireApproval ? 'translate-x-4' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(SettingsPanel);
