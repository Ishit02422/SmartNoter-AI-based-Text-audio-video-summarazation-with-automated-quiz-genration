import { useNavigate } from 'react-router-dom';
import { CheckSquare, Brain, MessageSquare, Library } from 'lucide-react';

interface AIActionsProps {
    summaryId: string;
    source: 'pdf' | 'video' | 'text' | 'audio' | 'web';
}

const AIActions = ({ summaryId, source }: AIActionsProps) => {
    const navigate = useNavigate();

    const actions = [
        {
            title: 'Quizzes',
            icon: <CheckSquare className="w-5 h-5 text-indigo-500" />,
            description: 'Test your knowledge with AI questions.',
            path: '/dashboard/quiz',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-100'
        },
        {
            title: 'Mindmaps',
            icon: <Brain className="w-5 h-5 text-purple-500" />,
            description: 'Visualize concepts with a topic map.',
            path: '/dashboard/mindmap',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-100'
        },
        {
            title: 'Flashcards',
            icon: <Library className="w-5 h-5 text-emerald-500" />,
            description: 'Master content with quick-study cards.',
            path: '/dashboard/flashcards',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-100'
        },
        {
            title: 'Chat with AI',
            icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
            description: 'Ask deep questions about this summary.',
            path: '/dashboard/chat',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100'
        }
    ];

    const handleAction = (path: string) => {
        navigate(path, { state: { summaryId, source } });
    };

    return (
        <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Enhance Your Learning</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => handleAction(action.path)}
                        className={`flex flex-col items-start p-5 rounded-2xl border ${action.borderColor} ${action.bgColor} hover:scale-[1.02] active:scale-95 transition-all text-left group`}
                    >
                        <div className="p-2.5 bg-white rounded-xl shadow-sm mb-3 group-hover:shadow-md transition-shadow">
                            {action.icon}
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{action.title}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{action.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AIActions;
