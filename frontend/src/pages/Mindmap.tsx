import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Brain, AlertCircle, ChevronDown, ChevronRight, Share2, Download } from 'lucide-react';
import api from '../api';
import { downloadMindmapAsTxt } from '../utils/exportUtils';
import { 
    ReactFlow, 
    Background, 
    Controls, 
    MiniMap, 
    useNodesState, 
    useEdgesState 
} from '@xyflow/react';


const Mindmap = () => {
    const location = useLocation();
    const { summaryId, source } = (location.state as any) || {};

    const [mindmap, setMindmap] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set([0]));
    const [viewMode, setViewMode] = useState<'visual' | 'classic'>('visual');
    const [copied, setCopied] = useState(false);

    const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

    useEffect(() => {
        if (mindmap) {
            const { nodes: n, edges: e } = generateNodesAndEdges(mindmap);
            setNodes(n);
            setEdges(e);
        }
    }, [mindmap]);

    const generateNodesAndEdges = (mindmapData: any) => {
        const nodesList: any[] = [];
        const edgesList: any[] = [];

        if (!mindmapData) return { nodes: nodesList, edges: edgesList };

        // 1. Central Node
        nodesList.push({
            id: 'central',
            data: { label: mindmapData.title || 'Central Theme' },
            position: { x: 500, y: 350 },
            type: 'input',
            style: {
                background: '#4f46e5', // indigo-600
                color: '#ffffff',
                border: '2px solid #4338ca',
                borderRadius: '16px',
                padding: '16px 24px',
                fontWeight: '900',
                fontSize: '15px',
                textAlign: 'center',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                width: 250
            }
        });

        const topics = mindmapData.topics || [];
        const N = topics.length;
        const R1 = 280; // Distance of topics from central theme
        const R2 = 520; // Distance of subtopics from central theme

        topics.forEach((topic: any, tIdx: number) => {
            // Position of topic node
            const angle = (2 * Math.PI * tIdx) / (N || 1);
            const tx = 500 + R1 * Math.cos(angle);
            const ty = 350 + R1 * Math.sin(angle);

            const topicId = `topic_${tIdx}`;

            nodesList.push({
                id: topicId,
                data: { label: topic.topic },
                position: { x: tx, y: ty },
                style: {
                    background: '#ffffff',
                    color: '#1e293b', // slate-800
                    border: '2px solid #818cf8', // indigo-400
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontWeight: '700',
                    fontSize: '13px',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    width: 180
                }
            });

            // Edge central -> topic
            edgesList.push({
                id: `edge_c_${topicId}`,
                source: 'central',
                target: topicId,
                animated: true,
                style: { stroke: '#818cf8', strokeWidth: 3 }
            });

            const subtopics = topic.subtopics || [];
            const M = subtopics.length;
            // Spread of subtopics around the topic angle
            const spread = M > 1 ? 0.7 : 0; // radians

            subtopics.forEach((sub: any, sIdx: number) => {
                const subtopicId = `sub_${tIdx}_${sIdx}`;
                
                // Calculate angle for subtopic
                let subAngle = angle;
                if (M > 1) {
                    subAngle = angle + spread * ((sIdx - (M - 1) / 2) / (M - 1));
                }

                const sx = 500 + R2 * Math.cos(subAngle);
                const sy = 350 + R2 * Math.sin(subAngle);

                nodesList.push({
                    id: subtopicId,
                    data: {
                        label: (
                            <div className="text-left font-sans">
                                <div className="font-extrabold text-[11px] text-slate-800 border-b border-slate-100 pb-1 mb-1">{sub.subTopic}</div>
                                <div className="text-[10px] text-slate-500 font-medium leading-relaxed whitespace-normal">{sub.detail}</div>
                            </div>
                        )
                    },
                    position: { x: sx, y: sy },
                    style: {
                        background: '#f8fafc', // slate-50
                        color: '#64748b', // slate-500
                        border: '1px solid #cbd5e1', // slate-300
                        borderRadius: '10px',
                        padding: '10px 12px',
                        fontSize: '11px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        width: 190
                    }
                });

                // Edge topic -> subtopic
                edgesList.push({
                    id: `edge_${topicId}_${subtopicId}`,
                    source: topicId,
                    target: subtopicId,
                    style: { stroke: '#cbd5e1', strokeWidth: 1.5 }
                });
            });
        });

        return { nodes: nodesList, edges: edgesList };
    };

    useEffect(() => {
        if (summaryId && source) {
            fetchOrGenerateMindmap();
        }
    }, [summaryId, source]);

    const fetchOrGenerateMindmap = async () => {
        setLoading(true);
        setError('');
        try {
            // First try to fetch existing mindmap
            const fetchRes = await api.post('/mindMap/getMindMap', { summaryId, source });
            if (fetchRes.data && fetchRes.data.result) {
                setMindmap(fetchRes.data.result);
                setLoading(false);
                return;
            }
        } catch (fetchErr: any) {
            // Only proceed to generate if it's not found (404)
            if (fetchErr.response?.status !== 404) {
                setError(fetchErr.response?.data?.message || 'Failed to fetch mindmap. Try again.');
                setLoading(false);
                return;
            }
        }

        // If not found, generate a new one
        try {
            const genRes = await api.post('/mindMap/', { summaryId, source });
            if (genRes.data && genRes.data.result) {
                setMindmap(genRes.data.result);
            }
        } catch (genErr: any) {
            setError(genErr.response?.data?.message || 'Failed to generate mindmap. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateMindmap = () => {
        fetchOrGenerateMindmap();
    };

    const handleExport = () => {
        if (!mindmap) return;

        let exportText = `Mindmap: ${mindmap.title}\n\n`;

        mindmap.topics.forEach((topic: any, idx: number) => {
            exportText += `${idx + 1}. ${topic.topic}\n`;
            topic.subtopics.forEach((sub: any) => {
                exportText += `   - ${sub.subTopic}: ${sub.detail}\n`;
            });
            exportText += '\n';
        });

        navigator.clipboard.writeText(exportText.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleTopic = (index: number) => {
        const newSet = new Set(expandedTopics);
        if (newSet.has(index)) newSet.delete(index);
        else newSet.add(index);
        setExpandedTopics(newSet);
    };

    if (!summaryId || !source) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <Brain className="w-8 h-8 text-indigo-500" />
                        Mindmaps
                    </h1>
                    <p className="text-slate-500 mt-2">Visually map out concepts from your generated summaries.</p>
                </div>
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                    <Brain className="w-16 h-16 text-slate-300 mb-4" />
                    <h2 className="text-xl font-bold text-slate-700">No Context Provided</h2>
                    <p className="text-slate-500 mt-2 max-w-md">
                        Generate a summary first, then click "Mindmap" to see a visual breakdown of the topics.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
             <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <Brain className="w-8 h-8 text-indigo-500" />
                        Mindmap Explorer
                    </h1>
                    <p className="text-slate-500 mt-2">Structured visual breakdown of your content.</p>
                </div>
                {mindmap && (
                    <div className="flex items-center gap-3">
                        {/* VIEW MODE TOGGLE */}
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                            <button
                                onClick={() => setViewMode('visual')}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                                    viewMode === 'visual'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Visual Canvas
                            </button>
                            <button
                                onClick={() => setViewMode('classic')}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                                    viewMode === 'classic'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Classic Cards
                            </button>
                        </div>

                        <button
                            onClick={() => downloadMindmapAsTxt(mindmap)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
                            title="Export Outline TXT"
                        >
                            <Download className="w-3.5 h-3.5 text-indigo-600" /> TXT
                        </button>

                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
                        >
                            {copied ? (
                                <>
                                    <span className="text-green-600 flex items-center gap-2">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Share2 className="w-4 h-4" /> Copy Text
                                </>
                            )}
                        </button>
                    </div>
                )}
            </header>


            {loading && (
                <div className="bg-white p-20 rounded-2xl border border-slate-100 flex flex-col items-center shadow-sm">
                    <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        <Brain className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
                    </div>
                    <p className="text-slate-500 font-bold">Mapping out concepts...</p>
                </div>
            )}

            {error && (
                <div className="p-8 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col items-center text-center gap-4">
                    <AlertCircle className="w-12 h-12 text-amber-500" />
                    <div>
                        <h3 className="text-lg font-bold text-amber-900">Visualization Failed</h3>
                        <p className="text-amber-800/70">{error}</p>
                    </div>
                    <button onClick={handleGenerateMindmap} className="px-6 py-2 bg-amber-500 text-white rounded-xl font-bold">Retry Generation</button>
                </div>
            )}

             {mindmap && (
                <div className="space-y-6">
                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
                        <span className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2 block">Central Theme</span>
                        <h2 className="text-4xl font-black">{mindmap.title}</h2>
                    </div>

                    {viewMode === 'visual' ? (
                        <div className="w-full h-[600px] bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-inner relative">
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                fitView
                            >
                                <Background color="#cbd5e1" gap={16} size={1} />
                                <Controls />
                                <MiniMap zoomable pannable />
                            </ReactFlow>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {mindmap.topics.map((topic: any, idx: number) => (
                                <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <button 
                                        onClick={() => toggleTopic(idx)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                                                {idx + 1}
                                            </div>
                                            <h3 className="font-black text-xl text-slate-800">{topic.topic}</h3>
                                        </div>
                                        {expandedTopics.has(idx) ? <ChevronDown className="text-slate-400" /> : <ChevronRight className="text-slate-400" />}
                                    </button>
                                    
                                    {expandedTopics.has(idx) && (
                                        <div className="p-6 pt-0 space-y-4">
                                            {topic.subtopics.map((sub: any, sIdx: number) => (
                                                <div key={sIdx} className="pl-14 relative">
                                                    <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-slate-100"></div>
                                                    <div className="absolute left-7 top-3 w-4 h-0.5 bg-slate-100"></div>
                                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                        <h4 className="font-bold text-slate-800 mb-1">{sub.subTopic}</h4>
                                                        <p className="text-slate-500 text-sm leading-relaxed">{sub.detail}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Mindmap;
