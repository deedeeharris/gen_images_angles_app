import React, { useState, useCallback, ChangeEvent, useRef, useEffect } from 'react';
import { UploadedImage, GeneratedImage } from './types';
import { CAMERA_ANGLES } from './constants';
import { generateImageForAngle, changeImageBackground, upscaleImage, removeImageBackground } from './services/geminiService';
import { editWithCanva } from './services/canvaService';

// Helper to add a delay between API calls
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Gemini API Free Tier Limits:
// - 15 requests per minute (1 request every 4 seconds)
// - 1,000 requests per day
// Using 10 second delay to be safe and avoid rate limiting
const API_DELAY_MS = 10000; // 10 seconds between requests
const DAILY_GENERATION_LIMIT = 1000;

// Helper component for comparing images with a slider
const ImageCompareSlider = ({ before, after }: { before: string, after: string }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPos(percent);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => handleMove(e.clientX);
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => handleMove(e.touches[0].clientX);

    return (
        <div 
            ref={containerRef}
            className="relative w-full aspect-square overflow-hidden select-none"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
        >
            <img src={after} alt="After" className="absolute inset-0 w-full h-full object-contain" />
            <div
                className="absolute inset-0 w-full h-full object-contain overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
                <img src={before} alt="Before" className="w-full h-full object-contain"/>
            </div>
            <div className="absolute top-0 bottom-0 bg-white w-1 cursor-ew-resize" style={{ left: `calc(${sliderPos}% - 2px)` }}>
                <div className="bg-white rounded-full h-4 w-4 absolute top-1/2 -translate-y-1/2 -translate-x-[7px]"></div>
            </div>
        </div>
    );
};

const App = () => {
    const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [waitingSeconds, setWaitingSeconds] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [selectedAngles, setSelectedAngles] = useState<Set<string>>(new Set(CAMERA_ANGLES.map(a => a.name)));
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Global state to prevent concurrent API calls
    const [isApiBusy, setIsApiBusy] = useState(false);

    // State for daily usage tracking
    const [generationsUsed, setGenerationsUsed] = useState(0);

    // State for modals
    const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
    const [backgroundPrompt, setBackgroundPrompt] = useState("");
    const [isChangingBackground, setIsChangingBackground] = useState(false);
    const [comparingImage, setComparingImage] = useState<GeneratedImage | null>(null);

    // API Key state
    const [apiKey, setApiKey] = useState<string>("");
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState("");

    // Load API key from env or localStorage
    useEffect(() => {
        const envApiKey = process.env.API_KEY;
        const storedApiKey = localStorage.getItem('geminiApiKey');

        if (envApiKey && envApiKey !== 'PLACEHOLDER_API_KEY') {
            setApiKey(envApiKey);
        } else if (storedApiKey) {
            setApiKey(storedApiKey);
        } else {
            setShowApiKeyModal(true);
        }
    }, []);

    // Load and manage usage from localStorage
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        try {
            const storedUsage = localStorage.getItem('geminiApiUsage');
            if (storedUsage) {
                const { count, date } = JSON.parse(storedUsage);
                if (date === today) {
                    setGenerationsUsed(count);
                } else {
                    // It's a new day, reset the counter
                    localStorage.setItem('geminiApiUsage', JSON.stringify({ count: 0, date: today }));
                    setGenerationsUsed(0);
                }
            } else {
                 localStorage.setItem('geminiApiUsage', JSON.stringify({ count: 0, date: today }));
            }
        } catch (e) {
            console.error("Failed to parse usage data from localStorage", e);
        }
    }, []);

    const incrementGenerationCount = () => {
        const today = new Date().toISOString().split('T')[0];
        setGenerationsUsed(prevCount => {
            const newCount = prevCount + 1;
            localStorage.setItem('geminiApiUsage', JSON.stringify({ count: newCount, date: today }));
            return newCount;
        });
    };

    const handleSaveApiKey = () => {
        if (apiKeyInput.trim()) {
            localStorage.setItem('geminiApiKey', apiKeyInput.trim());
            setApiKey(apiKeyInput.trim());
            setShowApiKeyModal(false);
            setApiKeyInput("");
        }
    };


    const processFile = (file: File | undefined) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage({ dataUrl: reader.result as string, file });
                setGeneratedImages([]);
                setError(null);
            };
            reader.readAsDataURL(file);
        } else {
            setError("אנא בחר קובץ תמונה תקין.");
        }
    };

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        processFile(event.target.files?.[0]);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
        processFile(e.dataTransfer.files?.[0]);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };


    const handleAngleSelection = (angleName: string) => {
        setSelectedAngles(prev => {
            const newSet = new Set(prev);
            newSet.has(angleName) ? newSet.delete(angleName) : newSet.add(angleName);
            return newSet;
        });
    };
    
    const handleDownloadImage = (src: string, angleName: string) => {
        const link = document.createElement('a');
        link.href = src;
        const fileName = `עניין_של_זוויות-${angleName.replace(/[^a-z0-9א-ת]/gi, '_').toLowerCase()}.png`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGenerateClick = useCallback(async () => {
        if (!uploadedImage || selectedAngles.size === 0 || isApiBusy || generationsUsed >= DAILY_GENERATION_LIMIT) return;

        setIsApiBusy(true);
        setIsGenerating(true);
        setError(null);
        setGeneratedImages([]);
        
        try {
            const anglesToGenerate = CAMERA_ANGLES.filter(angle => selectedAngles.has(angle.name));
            let generationsMade = 0;
            for (let i = 0; i < anglesToGenerate.length; i++) {
                if (generationsUsed + generationsMade >= DAILY_GENERATION_LIMIT) {
                    setError("הגעת למגבלת היצירה היומית.");
                    break;
                }
                const angle = anglesToGenerate[i];
                setGenerationProgress(((i + 1) / anglesToGenerate.length) * 100);
                try {
                    const base64Data = await generateImageForAngle(uploadedImage, angle, apiKey);
                    incrementGenerationCount();
                    generationsMade++;
                    setGeneratedImages(prev => [...prev, {
                        id: `${angle.name}-${Date.now()}`,
                        src: `data:image/png;base64,${base64Data}`,
                        angle,
                    }]);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                    setError(`שגיאה ביצירת תמונה עבור ${angle.name}. נסה שוב מאוחר יותר.`);
                    console.error(err);
                    break; 
                }

                if (i < anglesToGenerate.length - 1) {
                    // Countdown from 10 to 0 seconds
                    const delaySeconds = API_DELAY_MS / 1000;
                    for (let sec = delaySeconds; sec > 0; sec--) {
                        setWaitingSeconds(sec);
                        await sleep(1000);
                    }
                    setWaitingSeconds(0);
                }
            }
        } finally {
            setIsGenerating(false);
            setGenerationProgress(0);
            setWaitingSeconds(0);
            setIsApiBusy(false);
        }
    }, [uploadedImage, selectedAngles, isApiBusy, generationsUsed, apiKey]);

    const handleUpscale = async (imageId: string) => {
        if (generationsUsed >= DAILY_GENERATION_LIMIT) {
            setError("הגעת למגבלת היצירה היומית.");
            return;
        }
        const imageToUpdate = generatedImages.find(img => img.id === imageId);
        if (!imageToUpdate || !uploadedImage || isApiBusy) return;

        setIsApiBusy(true);
        setGeneratedImages(imgs => imgs.map(img => img.id === imageId ? { ...img, isUpscaling: true } : img));

        try {
            const upscaledData = await upscaleImage(imageToUpdate.src, uploadedImage.file.type, apiKey);
            incrementGenerationCount();
            setGeneratedImages(imgs => imgs.map(img => img.id === imageId ? {
                ...img,
                src: `data:image/png;base64,${upscaledData}`,
                originalSrc: imageToUpdate.src,
            } : img));
        } catch (err) {
            setError(`Failed to upscale image for ${imageToUpdate.angle.name}.`);
        } finally {
            setGeneratedImages(imgs => imgs.map(img => img.id === imageId ? { ...img, isUpscaling: false } : img));
            setIsApiBusy(false);
        }
    };

    const handleRemoveBackground = async (imageId: string) => {
        if (generationsUsed >= DAILY_GENERATION_LIMIT) {
            setError("הגעת למגבלת היצירה היומית.");
            return;
        }
        const imageToUpdate = generatedImages.find(img => img.id === imageId);
        if (!imageToUpdate || !uploadedImage || isApiBusy) return;

        setIsApiBusy(true);
        setGeneratedImages(imgs => imgs.map(img => img.id === imageId ? { ...img, isRemovingBackground: true } : img));

        try {
            const newImageData = await removeImageBackground(imageToUpdate.src, uploadedImage.file.type, apiKey);
            incrementGenerationCount();
            setGeneratedImages(imgs => imgs.map(img => img.id === imageId ? {
                ...img,
                src: `data:image/png;base64,${newImageData}`,
            } : img));
        } catch (err) {
            setError(`Failed to remove background for ${imageToUpdate.angle.name}.`);
        } finally {
            setGeneratedImages(imgs => imgs.map(img => img.id === imageId ? { ...img, isRemovingBackground: false } : img));
            setIsApiBusy(false);
        }
    };


    const handleChangeBackgroundSubmit = async () => {
        if (generationsUsed >= DAILY_GENERATION_LIMIT) {
            setError("הגעת למגבלת היצירה היומית.");
            setEditingImage(null);
            return;
        }
        if (!editingImage || !backgroundPrompt.trim() || !uploadedImage || isApiBusy) return;
        
        setIsApiBusy(true);
        setIsChangingBackground(true);
        try {
            const newImageData = await changeImageBackground(editingImage.src, uploadedImage.file.type, backgroundPrompt, apiKey);
            incrementGenerationCount();
            setGeneratedImages(imgs => imgs.map(img => img.id === editingImage.id ? { ...img, src: `data:image/png;base64,${newImageData}` } : img));
            setEditingImage(null);
            setBackgroundPrompt("");
        } catch (err) {
            setError(`Failed to change background for ${editingImage.angle.name}.`);
        } finally {
            setIsChangingBackground(false);
            setIsApiBusy(false);
        }
    };

    const canPerformApiAction = !isApiBusy && generationsUsed < DAILY_GENERATION_LIMIT;
    const remainingGenerations = DAILY_GENERATION_LIMIT - generationsUsed;
    const remainingPercentage = (remainingGenerations / DAILY_GENERATION_LIMIT) * 100;
    
    let progressBarColor = 'bg-cyan-500';
    if (remainingPercentage <= 50) progressBarColor = 'bg-yellow-500';
    if (remainingPercentage <= 20) progressBarColor = 'bg-red-500';


    return (
        <div className="min-h-screen">
            <header className="bg-slate-800 shadow-md p-4">
                <h1 className="text-2xl font-bold text-white text-center">עניין של זוויות</h1>
            </header>

            <main>
                {!uploadedImage ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={handleUploadClick}
                            className={`w-full max-w-md h-80 p-10 border-4 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${isDraggingOver ? 'border-cyan-400 bg-slate-700' : 'border-slate-600 hover:border-cyan-500 hover:bg-slate-800'}`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <p className="mt-4 text-lg font-semibold">גרור תמונה לכאן</p>
                            <p className="text-slate-400">או לחץ לבחירה</p>
                        </div>
                        {error && <div className="mt-4 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">{error}</div>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-4 md:p-8">
                        {/* Controls Panel */}
                        <div className="lg:col-span-1 bg-slate-800 p-6 rounded-lg shadow-lg self-start">
                            <h2 className="text-xl font-bold mb-4 text-cyan-400">התמונה שלך</h2>
                            <img src={uploadedImage.dataUrl} alt="Uploaded preview" className="rounded-lg mb-4 w-full" />
                            <button onClick={() => setUploadedImage(null)} className="w-full text-center py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors text-sm mb-2">החלף תמונה</button>
                            <button onClick={() => setShowApiKeyModal(true)} className="w-full text-center py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors text-xs mb-4">שנה API Key</button>
                            
                            <div className="border-t border-slate-700 pt-4">
                                <h3 className="text-lg font-semibold text-cyan-400 mb-2">יתרת יצירות יומית (הערכה)</h3>
                                 <p className="text-2xl font-bold text-slate-200 mb-2 text-center">
                                    {remainingGenerations} <span className="text-lg font-normal"> / {DAILY_GENERATION_LIMIT}</span>
                                </p>
                                <div className="w-full bg-slate-700 rounded-full h-4">
                                    <div className={`${progressBarColor} h-4 rounded-full transition-all duration-500`} style={{ width: `${remainingPercentage}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 text-center">המונה מתאפס כל יום. זוהי הערכה בלבד.</p>
                            </div>

                            <h2 className="text-xl font-bold mt-6 mb-4 text-cyan-400">בחר זוויות</h2>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {CAMERA_ANGLES.map(angle => (
                                    <div key={angle.name} className="flex items-start gap-3">
                                        <input type="checkbox" id={angle.name} checked={selectedAngles.has(angle.name)} onChange={() => handleAngleSelection(angle.name)} className="mt-1 h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"/>
                                        <label htmlFor={angle.name} className="text-sm"><strong className="block text-slate-200">{angle.name}</strong></label>
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleGenerateClick} disabled={!canPerformApiAction || selectedAngles.size === 0} className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors">
                                {isGenerating ? (
                                    waitingSeconds > 0
                                        ? `ממתין ${waitingSeconds}s (מונע rate limit)...`
                                        : `יוצר... (${Math.round(generationProgress)}%)`
                                ) : isApiBusy ? 'מעבד בקשה...' : `צור ${selectedAngles.size} תמונות`}
                            </button>
                        </div>

                        {/* Results Panel */}
                        <div className="lg:col-span-3">
                            {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">{error}</div>}
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {generatedImages.map(image => (
                                    <div key={image.id} className="bg-slate-800 rounded-lg shadow-lg overflow-hidden group">
                                        <h3 className="font-bold p-3 bg-slate-700 text-center truncate">{image.angle.name}</h3>
                                        <div className="relative">
                                            <img src={image.src} alt={image.angle.name} onClick={() => image.originalSrc && setComparingImage(image)} className={`w-full h-auto object-cover aspect-square transition-all ${image.isUpscaling || image.isRemovingBackground ? 'blur-sm scale-105' : ''} ${image.originalSrc ? 'cursor-pointer' : ''}`}/>
                                            {(image.isUpscaling || image.isRemovingBackground) && <div className="absolute inset-0 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}
                                            <div className="absolute inset-0 bg-black bg-opacity-80 p-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-xs text-center text-slate-300">{image.angle.description}</p>
                                            </div>
                                        </div>
                                        <div className="p-2 grid grid-cols-2 gap-2">
                                            <button onClick={() => handleDownloadImage(image.src, image.angle.name)} disabled={isApiBusy} title="הורד תמונה" className="col-span-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-2 rounded-md text-sm transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed">הורדה</button>
                                            <button onClick={() => handleRemoveBackground(image.id)} disabled={!canPerformApiAction || !!image.isUpscaling || !!image.isRemovingBackground} title="הסר רקע" className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-2 rounded-md text-xs transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed">הסר רקע</button>
                                            <button onClick={() => setEditingImage(image)} disabled={!canPerformApiAction || !!image.isUpscaling || !!image.isRemovingBackground} title="שנה רקע" className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-2 rounded-md text-xs transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed">שנה רקע</button>
                                            <button onClick={() => handleUpscale(image.id)} disabled={!canPerformApiAction || !!image.isUpscaling || !!image.originalSrc || !!image.isRemovingBackground} title="שדרג איכות" className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-2 rounded-md text-xs transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed">Upscale</button>
                                            <button onClick={() => editWithCanva(image.src, image.angle.name)} disabled={isApiBusy} title="ערוך ב-Canva" className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-2 rounded-md text-xs transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed">Canva</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Background Edit Modal */}
            {editingImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <h3 className="text-lg font-bold mb-4">שנה רקע עבור: {editingImage.angle.name}</h3>
                        <textarea value={backgroundPrompt} onChange={e => setBackgroundPrompt(e.target.value)} placeholder="לדוגמה: יער קסום בלילה, עיר עתידנית וגשומה..." className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg" rows={3}/>
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={() => setEditingImage(null)} className="py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-lg">ביטול</button>
                            <button onClick={handleChangeBackgroundSubmit} disabled={isChangingBackground || !canPerformApiAction} className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-500 rounded-lg">{isChangingBackground ? 'משנה...' : 'שנה'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Before/After Compare Modal */}
            {comparingImage && comparingImage.originalSrc && (
                 <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setComparingImage(null)}>
                    <div className="bg-slate-800 rounded-lg shadow-xl p-4 w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-2 text-center">השוואת שדרוג (לפני / אחרי)</h3>
                        <ImageCompareSlider before={comparingImage.originalSrc} after={comparingImage.src} />
                    </div>
                </div>
            )}

            {/* API Key Modal */}
            {showApiKeyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-cyan-400">הגדרת Gemini API Key</h3>
                        <p className="text-sm text-slate-300 mb-4">
                            כדי להשתמש באפליקציה, אנא הזן את ה-API key של Gemini שלך.
                            <br />
                            ניתן לקבל API key בחינם מ-<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google AI Studio</a>.
                        </p>
                        <input
                            type="text"
                            value={apiKeyInput}
                            onChange={e => setApiKeyInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveApiKey()}
                            placeholder="AIzaSy..."
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg mb-4 font-mono text-sm"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleSaveApiKey}
                                disabled={!apiKeyInput.trim()}
                                className="py-2 px-6 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-500 disabled:cursor-not-allowed rounded-lg font-semibold"
                            >
                                שמור
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-4">
                            ה-API key יישמר במחשב שלך (localStorage) ולא יישלח לשום שרת חיצוני.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;