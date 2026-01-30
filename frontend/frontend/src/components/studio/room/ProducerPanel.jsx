import React, { memo, useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/button';
import { ScrollArea } from '../../ui/scroll-area';

const ProducerPanel = ({ roomId, socket, isHost }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mock initial suggestions
    // Listen for AI suggestions
    useEffect(() => {
        if (socket) {
            const handleSuggestions = (newSuggestions) => {
                setSuggestions(prev => [...newSuggestions, ...prev]);
                setLoading(false);
            };
            socket.on('ai-suggestions', handleSuggestions);
            return () => socket.off('ai-suggestions', handleSuggestions);
        }
    }, [socket]);

    const handleDismiss = (id) => {
        setSuggestions(prev => prev.filter(s => s.id !== id));
    };

    // Context Buffer for AI
    const [contextBuffer, setContextBuffer] = useState("");

    // Simulate listening to the podcast (In production, this would come from the STT service)
    // For Demo: We'll append some mock conversation if empty, or expect 'onTranscriptUpdate' prop
    useEffect(() => {
        const interval = setInterval(() => {
            // Mock accumulation of context if we don't have real STT
            const mockPhrases = [
                "So tell me about your early days in tech.",
                "It was really hard, we didn't have funding.",
                "That's interesting, how did you pivot?",
                "We realized the market was moving to mobile.",
                "And what about AI? How does that change things?",
                "AI is the next frontier, absolutely."
            ];
            const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
            setContextBuffer(prev => {
                const newCtx = prev + " " + randomPhrase;
                return newCtx.slice(-1000); // Keep last ~1000 chars
            });
        }, 5000); // Add a phrase every 5s

        return () => clearInterval(interval);
    }, []);

    // Auto-Analyze every 30 seconds
    useEffect(() => {
        if (!isHost || !socket) return;

        const analyze = () => {
            // console.log("🤖 Auto-Analyzing context...");
            socket.emit('ai-analyze-context', {
                roomId,
                context: contextBuffer
            });
        };

        const timer = setInterval(analyze, 30000); // 30s interval
        return () => clearInterval(timer);
    }, [isHost, socket, roomId, contextBuffer]);

    const generateNewIdeas = () => {
        setLoading(true);
        if (socket && roomId) {
            // Send current buffer manually
            socket.emit('ai-analyze-context', { roomId, context: contextBuffer });
        }
    };

    if (!isHost) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-stone-500 p-6 text-center">
                <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-sm font-medium text-stone-300">Producer Mode</h3>
                <p className="text-xs mt-2">Only the host can see AI production cues.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-stone-900 border-l border-stone-800">
            <div className="p-4 border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        AI Producer
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 text-stone-400 hover:text-white ${loading ? 'animate-spin' : ''}`}
                        onClick={generateNewIdeas}
                        title="Generate new ideas"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {suggestions.map((suggestion) => (
                        <div
                            key={suggestion.id}
                            className={`p-3 rounded-lg border ${suggestion.type === 'topic' ? 'bg-purple-900/10 border-purple-500/30' :
                                suggestion.type === 'fact_check' ? 'bg-amber-900/10 border-amber-500/30' :
                                    'bg-blue-900/10 border-blue-500/30'
                                } group animate-in fade-in slide-in-from-bottom-2`}
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${suggestion.type === 'topic' ? 'text-purple-400' :
                                        suggestion.type === 'fact_check' ? 'text-amber-400' :
                                            'text-blue-400'
                                        }`}>
                                        {suggestion.type.replace('_', ' ')}
                                    </span>
                                    <p className="text-sm text-stone-200 leading-snug">{suggestion.content}</p>
                                </div>
                                <button
                                    onClick={() => handleDismiss(suggestion.id)}
                                    className="text-stone-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {suggestions.length === 0 && (
                        <div className="text-center py-10 text-stone-500">
                            <p className="text-xs">No active suggestions.</p>
                            <Button variant="link" onClick={generateNewIdeas} className="text-purple-400 text-xs">Generate Ideas</Button>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-3 border-t border-stone-800 bg-stone-900/80">
                <div className="text-[10px] text-stone-500 text-center">
                    AI listens to conversation context to generate cues.
                </div>
            </div>
        </div>
    );
};

export default memo(ProducerPanel);
