import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Upload, FileText, AlertCircle, Check, Copy, FileAudio, FileBadge } from 'lucide-react';
import api from '../api';
import AIActions from '../components/AIActions';
import { useSummary } from '../context/SummaryContext';



const translations: Record<string, any> = {
    en: {
        title: "File Summarization",
        executiveSummary: "Executive Summary",
        noSummary: "Summary could not be generated.",
        uploadDoc: "Upload a PDF or Audio file to get a concise AI-generated summary.",
        outputLanguage: "Output Language:",
        generate: "Generate Summary",
        processing: "Processing...",
        uploading: "Uploading",
        generating: "Generating AI Summary...",
        cancel: "Cancel",
        done: "Copied!",
        copy: "Copy",
        clickOrDrag: "Click or drag file to this area to upload",
        readyToSummarize: "Ready to summarize",
        supportsFiles: "Supports PDF documents and MP3/WAV audio files.",
        selectFileFirst: "Please select a file first.",
        invalidFile: "Please select a valid PDF or Audio file.",
        uploadingPdf: "Uploading PDF document",
        uploadingAudio: "Uploading Audio file",
        unexpectedResponse: "Unexpected response from server. Please try again.",
        loggedInRequired: "You need to be logged in.",
        premiumRequired: "Premium subscription or credits required for this feature.",
        invalidInput: "Invalid input: ",
        failedToProcess: "Failed to process file. Please try again.",
        backendNotResponding: "Backend server is not responding.",
        somethingWentWrong: "Something went wrong. Please try again.",
        analyzingFile: "Analyzing file...",
        mightTakeTime: "Depending on the file size, this might take up to a minute."
    },
    hi: {
        title: "फ़ाइल सारांश",
        executiveSummary: "कार्यকারী सारांश",
        noSummary: "सारांश तैयार नहीं किया जा सका।",
        uploadDoc: "संक्षिप्त एआई-जनरेटेड सारांश प्राप्त करने के लिए पीडीएफ या ऑडियो फ़ाइल अपलोड करें।",
        outputLanguage: "आउटपुट भाषा:",
        generate: "सारांश तैयार करें",
        processing: "प्रक्रिया जारी है...",
        uploading: "अपलोड हो रहा है",
        generating: "एआई सारांश तैयार किया जा रहा है...",
        cancel: "रद्द करें",
        done: "कॉपी हो गया!",
        copy: "कॉપી",
        clickOrDrag: "अपलोड करने के लिए फ़ाइल को यहां क्लिक करें या खींचें",
        readyToSummarize: "सारांश के लिए तैयार",
        supportsFiles: "PDF दस्तावेज़ और MP3/WAV ऑडियो फ़ाइलों का समर्थन करता है।",
        selectFileFirst: "कृपया पहले एक फ़ाइल चुनें।",
        invalidFile: "कृपया एक वैध PDF या ऑडियो फ़ाइल चुनें।",
        uploadingPdf: "PDF दस्तावेज़ अपलोड हो रहा है",
        uploadingAudio: "ऑડિયો फ़ाइल अपलोड हो रही है",
        unexpectedResponse: "सर्वर से अप्रत्याशित प्रतिक्रिया। कृपया पुनः प्रयास करें।",
        loggedInRequired: "आपको लॉग इन करना होगा।",
        premiumRequired: "इस सुविधा के लिए प्रीमियम सदस्यता या क्रेडिट आवश्यक हैं।",
        invalidInput: "अमान्य इनपुट: ",
        failedToProcess: "फ़ाइल संसाधित करने में विफल। कृपया पुनः प्रयास करें।",
        backendNotResponding: "बैकएंड सर्वर प्रतिक्रिया नहीं दे रहा है।",
        somethingWentWrong: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
        analyzingFile: "फ़ाइल का विश्लेषण हो रहा है...",
        mightTakeTime: "फ़ाइल के आकार के आधार પર, इसमें एक मिनट तक का समय लग सकता है।"
    },
    gu: {
        title: "ફાઇલ સારાંશ",
        executiveSummary: "કાર્યકારી સારાંશ",
        noSummary: "સારાંશ બનાવી શકાયો નથી.",
        uploadDoc: "સંક્ષિપ્ત AI-જનરેટેડ સારાંશ મેળવવા માટે PDF અથવા ઓડિયો ફાઇલ અપલોડ કરો.",
        outputLanguage: "આઆઉટપુટ ભાષા:",
        generate: "સારાંશ તૈયાર કરો",
        processing: "પ્રક્રિયા ચાલુ છે...",
        uploading: "અપલોડ થઈ રહ્યું છે",
        generating: "AI સારાંશ તૈયાર થઈ રહ્યો છે...",
        cancel: "રદ કરો",
        done: "કોપી થઈ ગઈ!",
        copy: "કોપી",
        clickOrDrag: "અપલોડ કરવા માટે ફાઇલને અહીં ક્લિક કરો અથવા ખેંચો",
        readyToSummarize: "સારાંશ માટે તૈયાર",
        supportsFiles: "PDF દસ્તાવેજો અને MP3/WAV ઑડિઓ ફાઇલોને સપોર્ટ કરે છે.",
        selectFileFirst: "કૃપા કરીને પહેલા એક ફાઇલ પસંદ કરો.",
        invalidFile: "કૃપા કરીને એક માન્ય PDF અથવા ઑડિઓ ફાઇલ પસંદ કરો.",
        uploadingPdf: "PDF દસ્તાવેજ અપલોડ થઈ રહ્યો છે",
        uploadingAudio: "ઑડિઓ ફાઇલ અપલોડ થઈ રહી છે",
        unexpectedResponse: "સર્વર તરફથી અનપેક્ષિત પ્રતિસાદ. કૃપા કરીને ફરી પ્રયાસ કરો.",
        loggedInRequired: "તમારે લૉગ ઇન કરવું પડશે.",
        premiumRequired: "આ સુવિધા માટે પ્રીમિયમ સબ્સ્ક્રિપ્શન અથવા ક્રેડિટ્સ જરૂરી છે.",
        invalidInput: "અમાન્ય ઇનપુટ: ",
        failedToProcess: "ફાઇલ પ્રક્રિયા કરવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.",
        backendNotResponding: "બેકએન્ડ સર્વર પ્રતિસાદ આપી રહ્યું નથી.",
        somethingWentWrong: "કંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.",
        analyzingFile: "ફાઇલનું વિશ્લેષણ થઈ રહ્યું છે...",
        mightTakeTime: "ફાઇલના કદના આધારે, આમાં એક મિનિટ સુધીનો સમય લાગી શકે છે."
    },
    es: {
        title: "Resumen de Archivos",
        executiveSummary: "Resumen Ejecutivo",
        noSummary: "No se pudo generar el resumen.",
        uploadDoc: "Sube un archivo PDF o de audio para obtener un resumen conciso generado por IA.",
        outputLanguage: "Idioma de salida:",
        generate: "Generar Resumen",
        processing: "Procesando...",
        uploading: "Subiendo",
        generating: "Generando resumen de IA...",
        cancel: "Cancelar",
        done: "¡Copiado!",
        copy: "Copiar",
        clickOrDrag: "Haz clic o arrastra el archivo aquí para subirlo",
        readyToSummarize: "Listo para resumir",
        supportsFiles: "Soporta documentos PDF y archivos de audio MP3/WAV.",
        selectFileFirst: "Por favor, selecciona un archivo primero.",
        invalidFile: "Por favor, selecciona un archivo PDF o de audio válido.",
        uploadingPdf: "Subiendo documento PDF",
        uploadingAudio: "Subiendo archivo de audio",
        unexpectedResponse: "Respuesta inesperada del servidor. Por favor, inténtalo de nuevo.",
        loggedInRequired: "Necesitas iniciar sesión.",
        premiumRequired: "Se requiere suscripción premium o créditos para esta función.",
        invalidInput: "Entrada inválida: ",
        failedToProcess: "Error al procesar el archivo. Por favor, inténtalo de nuevo.",
        backendNotResponding: "El servidor backend no responde.",
        somethingWentWrong: "Algo salió mal. Por favor, inténtalo de nuevo.",
        analyzingFile: "Analizando archivo...",
        mightTakeTime: "Dependiendo del tamaño del archivo, esto podría tardar hasta un minuto."
    },
    fr: {
        title: "Résumé de Fichier",
        executiveSummary: "Résumé Exécutif",
        noSummary: "Le résumé n'a pas pu être généré.",
        uploadDoc: "Téléchargez un fichier PDF ou audio pour obtenir un résumé concis généré par l'IA.",
        outputLanguage: "Langue de sortie :",
        generate: "Générer le résumé",
        processing: "Traitement...",
        uploading: "Téléchargement",
        generating: "Génération du résumé IA...",
        cancel: "Annuler",
        done: "Copié !",
        copy: "Copiar",
        clickOrDrag: "Cliquez ou faites glisser le fichier ici pour le télécharger",
        readyToSummarize: "Prêt à résumer",
        supportsFiles: "Prend en charge les documents PDF et les fichiers audio MP3/WAV.",
        selectFileFirst: "Veuillez sélectionner un fichier d'abord.",
        invalidFile: "Veuillez sélectionner un fichier PDF ou audio valide.",
        uploadingPdf: "Téléchargement du document PDF",
        uploadingAudio: "Téléchargement du fichier audio",
        unexpectedResponse: "Réponse inattendue du serveur. Veuillez réessayer.",
        loggedInRequired: "Vous devez être connecté.",
        premiumRequired: "Abonnement premium ou crédits requis pour cette fonctionnalité.",
        invalidInput: "Entrée invalide : ",
        failedToProcess: "Échec du traitement du fichier. Veuillez réessayer.",
        backendNotResponding: "Le serveur backend ne répond pas.",
        somethingWentWrong: "Quelque chose s'est mal passé. Veuillez réessayer.",
        analyzingFile: "Analyse du fichier...",
        mightTakeTime: "Selon la taille du fichier, cela peut prendre jusqu'à une minute."
    }
};

const FileSummary = () => {
    const { lastSummary: summary, lastSource, setSummary, clearSummary } = useSummary();
    const [file, setFile] = useState<File | null>(null);
    const [language, setLanguage] = useState('en');
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const isOurSource = lastSource === 'pdf' || lastSource === 'audio';

    const t = (key: string) => translations[language]?.[key] || translations.en[key];

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const isPdf = selectedFile.type === 'application/pdf';
            const isAudio = selectedFile.type.startsWith('audio/');

            if (!isPdf && !isAudio) {
                setError(t('invalidFile'));
                setFile(null);
                return;
            }
            setError('');
            setFile(selectedFile);
        }
    };

    const handleClear = () => {
        setFile(null);
        clearSummary();
        setError('');
        setLoadingStatus('');
        const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleUpload = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError(t('selectFileFirst'));
            return;
        }

        setLoading(true);
        setError('');
        clearSummary();

        try {
            const formData = new FormData();
            formData.append('file', file);

            const isPdf = file.type === 'application/pdf';
            const uploadEndpoint = isPdf ? '/pdf' : '/audio';

            setLoadingStatus(`${isPdf ? t('uploadingPdf') : t('uploadingAudio')}...`);
            const uploadRes = await api.post(uploadEndpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const uploadedFile = uploadRes.data;

            setLoadingStatus(t('generating'));
            let generateEndpoint = '';
            let payload: any = {
                fileId: uploadedFile._id,
                language
            };

            if (isPdf) {
                generateEndpoint = '/generatedSummaryPDF/direct';
                payload.pdfUrl = uploadedFile.pdfURL || uploadedFile.pdfUrl || uploadedFile.url || uploadedFile.fileUrl;
                payload.pdfURL = payload.pdfUrl;
            } else {
                generateEndpoint = '/generatedSummaryAudio/direct';
                payload.audioUrl = uploadedFile.audioURL || uploadedFile.audioUrl || uploadedFile.url || uploadedFile.fileUrl;
                payload.audioURL = payload.audioUrl;
            }

            const generateRes = await api.post(generateEndpoint, payload);

            if (generateRes.data && generateRes.data.result) {
                setSummary(generateRes.data.result, isPdf ? 'pdf' : 'audio');
            } else {
                setError(t('unexpectedResponse'));
            }

        } catch (err: any) {
            if (err.response) {
                const status = err.response.status;
                const msg = err.response.data?.message || err.response.data?.error || '';

                if (status === 401) {
                    setError(t('loggedInRequired'));
                } else if (status === 403 || status === 402) {
                    setError(t('premiumRequired'));
                } else if (status === 422) {
                    setError(t('invalidInput') + msg);
                } else {
                    setError(msg || t('failedToProcess'));
                }
            } else if (err.request) {
                setError(t('backendNotResponding'));
            } else {
                setError(t('somethingWentWrong'));
            }
        } finally {
            setLoading(false);
            setLoadingStatus('');
        }
    };

    const handleCopyAll = () => {
        if (!summary) return;
        let fullText = `Title: ${summary.title}\n\n`;
        fullText += `Summary:\n${summary.summarization}\n\n`;
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <Upload className="w-8 h-8 text-indigo-500" />
                        {t('title')}
                    </h1>
                    <p className="text-slate-500 mt-2">{t('uploadDoc')}</p>
                </div>
                <div className="flex gap-4 items-center">
                    <label className="text-sm font-medium text-slate-700">{t('outputLanguage')}</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex-grow min-w-[120px] focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 shadow-sm"
                    >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="gu">Gujarati</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                    </select>
                </div>
            </div>

            <form onSubmit={handleUpload} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                <div className={`w-full border-2 border-dashed ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-indigo-200'} rounded-xl p-12 text-center hover:bg-indigo-50 transition cursor-pointer relative group`}>
                    <input
                        id="file-upload-input"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,audio/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-4">
                        <div className={`p-4 rounded-full transition-colors ${file ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'}`}>
                            {file ? (file.type === 'application/pdf' ? <FileBadge className="w-8 h-8" /> : <FileAudio className="w-8 h-8" />) : <Upload className="w-8 h-8" />}
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${file ? 'text-indigo-900' : 'text-slate-700'}`}>
                                {file ? file.name : t('clickOrDrag')}
                            </h3>
                            {file ? (
                                <p className="text-indigo-600/70 text-sm mt-1">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {t('readyToSummarize')}
                                </p>
                            ) : (
                                <p className="text-slate-500 text-sm mt-1">{t('supportsFiles')}</p>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl w-full">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <div className="flex gap-4 w-full justify-center mt-6">
                    {file && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition whitespace-nowrap"
                        >
                            {t('cancel')}
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !file}
                        className="w-full max-w-sm px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition disabled:opacity-50"
                    >
                        {loading ? t('processing') : t('generate')}
                    </button>
                </div>
            </form>

            {loading && (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="font-medium text-slate-700">{loadingStatus || t('analyzingFile')}</p>
                    <p className="text-sm mt-1">{t('mightTakeTime')}</p>
                </div>
            )}

            {isOurSource && summary && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-indigo-500" />
                            {summary.title || t('executiveSummary')}
                        </h2>
                        <button
                            onClick={handleCopyAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            {copied ? t('done') : t('copy')}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-400" /> {t('executiveSummary')}
                        </h3>
                        <div className="whitespace-pre-wrap text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-xl text-sm border border-slate-100">
                            {summary.summarization || t('noSummary')}
                        </div>
                    </div>

                    {/* AI Engagement Options */}
                    <AIActions summaryId={summary._id} source={lastSource || 'pdf'} />
                </div>
            )}
        </div>
    );
};

export default FileSummary;
