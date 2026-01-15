import React, { useState } from 'react';
import { Music, Volume2, LayoutTemplate, Search, GripVertical, Video } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// Mock Assets
const MOCK_ASSETS = {
    music: [
        { id: 'm1', title: 'Lo-Fi Chill', duration: '2:30', type: 'music' },
        { id: 'm2', title: 'Upbeat Intro', duration: '0:45', type: 'music' },
        { id: 'm3', title: 'Suspense', duration: '1:15', type: 'music' },
        { id: 'm4', title: 'Corporate Happy', duration: '3:00', type: 'music' },
    ],
    sfx: [
        { id: 's1', title: 'Whoosh', duration: '0:02', type: 'sfx' },
        { id: 's2', title: 'Pop', duration: '0:01', type: 'sfx' },
        { id: 's3', title: 'Applause', duration: '0:10', type: 'sfx' },
        { id: 's4', title: 'Click', duration: '0:01', type: 'sfx' },
    ],
    templates: [
        { id: 't1', title: 'Intro Title', type: 'template' },
        { id: 't2', title: 'Lower Third', type: 'template' },
        { id: 't3', title: 'Subscribe Animation', type: 'template' },
    ]
};

const AssetDraggable = ({ asset }) => {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(asset));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="p-3 bg-stone-800/50 hover:bg-stone-800 border border-stone-700 hover:border-stone-600 rounded-lg cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between"
        >
            <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-stone-600 group-hover:text-stone-400" />
                <div>
                    <p className="text-sm font-medium text-stone-200">{asset.title}</p>
                    {asset.duration && <p className="text-xs text-stone-500">{asset.duration}</p>}
                </div>
            </div>
            <div className="w-6 h-6 rounded flex items-center justify-center bg-stone-900/50 text-stone-500">
                {asset.type === 'music' ? <Music className="w-3 h-3" /> :
                    asset.type === 'sfx' ? <Volume2 className="w-3 h-3" /> :
                        asset.type === 'video' ? <Video className="w-3 h-3" /> :
                            <LayoutTemplate className="w-3 h-3" />}
            </div>
        </div>
    );
};

const AssetSidebar = ({ recordings = [] }) => {
    const [search, setSearch] = useState('');

    const filterAssets = (assets) => {
        return assets.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
    };

    return (
        <div className="w-80 border-l border-stone-800 bg-stone-950 flex flex-col h-full">
            <div className="p-4 border-b border-stone-800">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">🎨</span> Creative Suite
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="w-full bg-stone-900 border border-stone-700 rounded-md py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="recordings" className="flex-1 flex flex-col min-h-0">
                <TabsList className="bg-stone-900 mx-4 mt-4 grid grid-cols-5">
                    <TabsTrigger value="recordings" className="text-[10px] px-1">Recs</TabsTrigger>
                    <TabsTrigger value="music" className="text-[10px] px-1">Music</TabsTrigger>
                    <TabsTrigger value="sfx" className="text-[10px] px-1">SFX</TabsTrigger>
                    <TabsTrigger value="templates" className="text-[10px] px-1">Visuals</TabsTrigger>
                    <TabsTrigger value="layouts" className="text-[10px] px-1">Layout</TabsTrigger>
                </TabsList>

                <div className="flex-1 min-h-0">
                    <TabsContent value="recordings" className="h-full m-0">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-2">
                                {recordings.length === 0 && <p className="text-xs text-stone-500 text-center py-4">No recordings found</p>}
                                {filterAssets(recordings).map(asset => (
                                    <AssetDraggable key={asset.id} asset={{ ...asset, type: 'video' }} />
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="music" className="h-full m-0">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-2">
                                {filterAssets(MOCK_ASSETS.music).map(asset => (
                                    <AssetDraggable key={asset.id} asset={asset} />
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="sfx" className="h-full m-0">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-2">
                                {filterAssets(MOCK_ASSETS.sfx).map(asset => (
                                    <AssetDraggable key={asset.id} asset={asset} />
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="templates" className="h-full m-0">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-2">
                                {filterAssets(MOCK_ASSETS.templates).map(asset => (
                                    <AssetDraggable key={asset.id} asset={asset} />
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="layouts" className="h-full m-0">
                        <ScrollArea className="h-full p-4">
                            <h4 className="text-xs font-bold text-stone-500 mb-2 uppercase tracking-wider">Layout Presets</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div draggable onDragStart={(e) => { e.dataTransfer.setData('application/json', JSON.stringify({ type: 'layout', id: 'grid' })); }} className="aspect-square bg-stone-800 rounded border border-stone-700 hover:border-indigo-500 cursor-grab active:cursor-grabbing p-2 flex flex-col items-center justify-center gap-2 group">
                                    <div className="grid grid-cols-2 gap-1 w-full h-full p-1">
                                        <div className="bg-stone-600 rounded-sm"></div>
                                        <div className="bg-stone-600 rounded-sm"></div>
                                        <div className="bg-stone-600 rounded-sm"></div>
                                        <div className="bg-stone-600 rounded-sm"></div>
                                    </div>
                                    <span className="text-[10px] text-stone-400 group-hover:text-white">Grid</span>
                                </div>
                                <div draggable onDragStart={(e) => { e.dataTransfer.setData('application/json', JSON.stringify({ type: 'layout', id: 'split' })); }} className="aspect-square bg-stone-800 rounded border border-stone-700 hover:border-indigo-500 cursor-grab active:cursor-grabbing p-2 flex flex-col items-center justify-center gap-2 group">
                                    <div className="flex gap-1 w-full h-full p-1">
                                        <div className="bg-stone-600 rounded-sm flex-1"></div>
                                        <div className="bg-stone-600 rounded-sm flex-1"></div>
                                    </div>
                                    <span className="text-[10px] text-stone-400 group-hover:text-white">Split</span>
                                </div>
                                <div draggable onDragStart={(e) => { e.dataTransfer.setData('application/json', JSON.stringify({ type: 'layout', id: 'active' })); }} className="aspect-square bg-stone-800 rounded border border-stone-700 hover:border-indigo-500 cursor-grab active:cursor-grabbing p-2 flex flex-col items-center justify-center gap-2 group">
                                    <div className="flex flex-col gap-1 w-full h-full p-1">
                                        <div className="bg-stone-600 rounded-sm h-3/4"></div>
                                        <div className="flex gap-1 h-1/4">
                                            <div className="bg-stone-700 rounded-sm flex-1"></div>
                                            <div className="bg-stone-700 rounded-sm flex-1"></div>
                                            <div className="bg-stone-700 rounded-sm flex-1"></div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-stone-400 group-hover:text-white">Active</span>
                                </div>
                                <div draggable onDragStart={(e) => { e.dataTransfer.setData('application/json', JSON.stringify({ type: 'layout', id: 'pip' })); }} className="aspect-square bg-stone-800 rounded border border-stone-700 hover:border-indigo-500 cursor-grab active:cursor-grabbing p-2 flex flex-col items-center justify-center gap-2 group">
                                    <div className="relative w-full h-full bg-stone-600 rounded-sm m-1">
                                        <div className="absolute bottom-1 right-1 w-1/3 h-1/3 bg-stone-400 border border-stone-900 shadow"></div>
                                    </div>
                                    <span className="text-[10px] text-stone-400 group-hover:text-white">PIP</span>
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default AssetSidebar;
