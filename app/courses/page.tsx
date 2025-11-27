'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import NotesBookmarks from '@/components/NotesBookmarks';
import {
    Play,
    Pause,
    CheckCircle2,
    Clock,
    BookOpen,
    ChevronRight,
    Menu,
    X,
    Home,
    BarChart3,
    Star,
    Download,
    ListOrdered,
    StickyNote
} from 'lucide-react';

interface Chapter {
    title: string;
    time: string;
    url: string;
    timestamp: number;
}

interface ProgressData {
    [videoId: string]: {
        completedChapters: number[];
        lastWatchedChapter: number;
        progressPercentage: number;
        totalWatchTime: number;
        timestamp: number;
    };
}

export default function YouTubeCoursePlayer() {
    const { user } = useUser();
    const searchParams = useSearchParams();
    const [url, setUrl] = useState('');
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [videoId, setVideoId] = useState('');
    const [progress, setProgress] = useState<ProgressData>({});
    const [currentChapter, setCurrentChapter] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [playerReady, setPlayerReady] = useState(false);
    const [videoTitle, setVideoTitle] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [sidebarTab, setSidebarTab] = useState<'chapters' | 'notes'>('chapters');

    const playerRef = useRef<any>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load progress from localStorage and MongoDB
    useEffect(() => {
        const initializeProgress = async () => {
            // First load from localStorage
            const savedProgress = localStorage.getItem('youtube-course-progress');
            if (savedProgress) {
                setProgress(JSON.parse(savedProgress));
            }

            // Check for video ID in URL parameters
            const videoIdParam = searchParams.get('v');
            if (videoIdParam && user) {
                // Load progress from MongoDB for this specific video FIRST
                await loadProgressForVideo(videoIdParam);

                const youtubeUrl = `https://www.youtube.com/watch?v=${videoIdParam}`;
                setUrl(youtubeUrl);

                // Auto-load the course after progress is loaded
                setTimeout(() => {
                    handleFetchChapters(youtubeUrl);
                }, 800);
            } else if (user) {
                // Just load all saved courses
                loadSavedCourses();
            }
        };

        initializeProgress();
    }, [user, searchParams]);

    // Save progress to localStorage and MongoDB (debounced)
    useEffect(() => {
        localStorage.setItem('youtube-course-progress', JSON.stringify(progress));

        // Debounce MongoDB saves to avoid too many requests
        if (videoId && chapters.length > 0 && progress[videoId]) {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            saveTimeoutRef.current = setTimeout(() => {
                saveProgressToDatabase();
            }, 2000);
        }
    }, [progress, videoId, chapters]);

    const loadProgressForVideo = async (videoId: string) => {
        try {
            const response = await fetch('/api/user-courses');
            if (response.ok) {
                const data = await response.json();
                const course = data.courses.find((c: any) => c.videoId === videoId);

                if (course && course.progress) {
                    console.log('📥 Loaded progress from MongoDB for video:', videoId, course.progress);
                    // Update progress state with MongoDB data
                    setProgress(prev => ({
                        ...prev,
                        [videoId]: course.progress
                    }));

                    // Also update localStorage
                    const savedProgress = localStorage.getItem('youtube-course-progress');
                    const progressData = savedProgress ? JSON.parse(savedProgress) : {};
                    progressData[videoId] = course.progress;
                    localStorage.setItem('youtube-course-progress', JSON.stringify(progressData));

                    return course.progress;
                }
            }
        } catch (error) {
            console.error('Error loading progress for video:', error);
        }
        return null;
    };

    const loadSavedCourses = async () => {
        try {
            const response = await fetch('/api/user-courses');
            if (response.ok) {
                const data = await response.json();
                console.log('Loaded saved courses:', data.courses.length);

                // Merge all progress from MongoDB into local state
                const mongoProgress: ProgressData = {};
                data.courses.forEach((course: any) => {
                    if (course.progress) {
                        mongoProgress[course.videoId] = course.progress;
                    }
                });

                if (Object.keys(mongoProgress).length > 0) {
                    setProgress(prev => ({ ...prev, ...mongoProgress }));
                }
            }
        } catch (error) {
            console.error('Error loading saved courses:', error);
        }
    };

    const saveProgressToDatabase = async () => {
        if (!videoId || !user) return;

        try {
            const response = await fetch('/api/save-progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoId,
                    url,
                    title: videoTitle || 'YouTube Course',
                    chapters,
                    progress: progress[videoId]
                }),
            });

            if (response.ok) {
                console.log('💾 Progress saved to database');
            }
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const extractVideoId = (url: string) => {
        const match = url.match(
            /(?:v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
        );
        return match ? match[1] : null;
    };

    const parseTimeToSeconds = (timeStr: string): number => {
        const parts = timeStr.split(':').map(part => parseInt(part));
        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
        return parts[0];
    };

    const handleFetchChapters = async (urlToFetch?: string) => {
        const targetUrl = urlToFetch || url;
        if (!targetUrl) {
            setError('Please enter a YouTube URL');
            return;
        }

        setLoading(true);
        setError('');
        setChapters([]);
        setPlayerReady(false);

        try {
            const id = extractVideoId(targetUrl);
            if (!id) {
                throw new Error('Invalid YouTube URL');
            }
            setVideoId(id);

            const response = await fetch('/api/youtube-chapters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoId: id }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch chapters');
            }

            const data = await response.json();
            setVideoTitle(data.title || 'YouTube Course');
            const chaptersWithTimestamps = data.chapters.map((chapter: Chapter) => ({
                ...chapter,
                timestamp: parseTimeToSeconds(chapter.time)
            }));
            setChapters(chaptersWithTimestamps);
            setPlayerReady(true);

            // Set current chapter from progress if it exists
            if (progress[id]) {
                const resumeChapter = progress[id].lastWatchedChapter || 0;
                console.log('🎯 Will resume from chapter:', resumeChapter);
                setCurrentChapter(resumeChapter);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const initializeYouTubePlayer = () => {
        if (!videoId || !window.YT) return;

        playerRef.current = new window.YT.Player('youtube-player', {
            videoId: videoId,
            playerVars: {
                playsinline: 1,
                rel: 0,
                modestbranding: 1,
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
            },
        });
    };

    const onPlayerReady = (event: any) => {
        // Resume from last watched chapter
        if (progress[videoId] && chapters.length > 0) {
            const lastChapter = progress[videoId].lastWatchedChapter || 0;
            if (chapters[lastChapter]) {
                console.log('▶️ Resuming from chapter', lastChapter, 'at', chapters[lastChapter].timestamp, 'seconds');
                playerRef.current.seekTo(chapters[lastChapter].timestamp, true);
                setCurrentChapter(lastChapter);
            }
        }
        startProgressTracking();
    };

    const onPlayerStateChange = (event: any) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startProgressTracking();
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            stopProgressTracking();
            saveProgressToDatabase();
        } else if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            stopProgressTracking();
            saveProgressToDatabase();
        }
    };

    const startProgressTracking = () => {
        stopProgressTracking();
        progressIntervalRef.current = setInterval(trackProgress, 1000);
    };

    const stopProgressTracking = () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    };

    const trackProgress = () => {
        if (!playerRef.current || chapters.length === 0) return;

        const currentTime = playerRef.current.getCurrentTime();

        // Find current chapter based on timestamp
        let newCurrentChapter = 0;
        for (let i = chapters.length - 1; i >= 0; i--) {
            if (currentTime >= chapters[i].timestamp) {
                newCurrentChapter = i;
                break;
            }
        }

        if (newCurrentChapter !== currentChapter) {
            setCurrentChapter(newCurrentChapter);

            // Auto-mark previous chapters as completed
            if (newCurrentChapter > currentChapter) {
                setProgress(prev => {
                    const videoProgress = prev[videoId] || {
                        completedChapters: [],
                        lastWatchedChapter: -1,
                        progressPercentage: 0,
                        totalWatchTime: 0,
                        timestamp: Date.now()
                    };

                    const newCompletedChapters = [...new Set([
                        ...videoProgress.completedChapters,
                        ...Array.from({ length: newCurrentChapter }, (_, i) => i)
                    ])];

                    const progressPercentage = Math.round((newCompletedChapters.length / chapters.length) * 100);

                    return {
                        ...prev,
                        [videoId]: {
                            ...videoProgress,
                            completedChapters: newCompletedChapters,
                            lastWatchedChapter: newCurrentChapter,
                            progressPercentage,
                            totalWatchTime: videoProgress.totalWatchTime + 1,
                            timestamp: Date.now()
                        }
                    };
                });
            }
        }
    };

    const seekToChapter = (chapterIndex: number) => {
        if (playerRef.current && chapters[chapterIndex]) {
            playerRef.current.seekTo(chapters[chapterIndex].timestamp, true);
            playerRef.current.playVideo();
            setCurrentChapter(chapterIndex);
        }
    };

    const seekToTimestamp = (timestamp: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(timestamp, true);
            playerRef.current.playVideo();
        }
    };

    const markChapterCompleted = (chapterIndex: number) => {
        if (!videoId) return;

        setProgress(prev => {
            const videoProgress = prev[videoId] || {
                completedChapters: [],
                lastWatchedChapter: -1,
                progressPercentage: 0,
                totalWatchTime: 0,
                timestamp: Date.now()
            };

            const isCompleted = videoProgress.completedChapters.includes(chapterIndex);

            const newCompletedChapters = isCompleted
                ? videoProgress.completedChapters.filter(idx => idx !== chapterIndex)
                : [...videoProgress.completedChapters, chapterIndex];

            const progressPercentage = Math.round((newCompletedChapters.length / chapters.length) * 100);

            return {
                ...prev,
                [videoId]: {
                    ...videoProgress,
                    completedChapters: newCompletedChapters,
                    lastWatchedChapter: chapterIndex,
                    progressPercentage,
                    timestamp: Date.now()
                }
            };
        });
    };

    const getVideoProgress = () => {
        if (!videoId || !progress[videoId]) return null;
        return progress[videoId];
    };

    const videoProgress = getVideoProgress();
    const progressPercentage = videoProgress?.progressPercentage || 0;

    // Load YouTube IFrame API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
        } else {
            initializeYouTubePlayer();
        }

        return () => {
            stopProgressTracking();
        };
    }, [videoId, playerReady]);

    return (
        <div className="min-h-screen bg-[#1c1d1f]">
            {/* Top Navigation Bar - Udemy Style */}
            <nav className="bg-[#2d2f31] border-b border-gray-700 sticky top-0 z-50 shadow-lg">
                <div className="px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <Link href="/" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
                                <Home className="w-5 h-5" />
                                <span className="font-semibold hidden sm:inline">Home</span>
                            </Link>
                            <Link href="/profile" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
                                <BookOpen className="w-5 h-5" />
                                <span className="font-semibold hidden sm:inline">My Courses</span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            {videoTitle && (
                                <h1 className="text-white font-semibold text-sm sm:text-base max-w-md truncate hidden md:block">
                                    {videoTitle}
                                </h1>
                            )}

                            {/* Progress Indicator */}
                            {chapters.length > 0 && (
                                <div className="flex items-center space-x-3 bg-[#1c1d1f] px-4 py-2 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <BarChart3 className="w-4 h-4 text-purple-400" />
                                        <span className="text-sm text-gray-300 font-medium">{progressPercentage}%</span>
                                    </div>
                                    <div className="w-24 bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-white"
                            >
                                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex h-[calc(100vh-60px)]">
                {/* Main Video Area */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'mr-0' : 'mr-0'}`}>
                    {/* Video Player */}
                    <div className="flex-1 bg-black relative">
                        {playerReady ? (
                            <div id="youtube-player" className="w-full h-full"></div>
                        ) : chapters.length > 0 ? (
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                                <div className="text-center">
                                    <div className="relative">
                                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                                        <Play className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <p className="text-gray-300 text-lg font-medium">Loading your course...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900/10 to-pink-900/10">
                                <div className="text-center max-w-md px-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                        <Play className="w-12 h-12 text-white ml-1" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Ready to Learn?</h3>
                                    <p className="text-gray-400 mb-6">Paste a YouTube URL in the sidebar to start your learning journey</p>
                                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span>Track your progress • Resume anytime • Learn at your pace</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Course Info Bar */}
                    {chapters.length > 0 && chapters[currentChapter] && (
                        <div className="bg-[#2d2f31] border-t border-gray-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
                                            Lecture {currentChapter + 1} of {chapters.length}
                                        </span>
                                        {videoProgress?.completedChapters.includes(currentChapter) && (
                                            <span className="flex items-center space-x-1 text-green-400 text-xs font-medium">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Completed</span>
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-white font-semibold text-lg mb-1">
                                        {chapters[currentChapter].title}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                                        <span className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{chapters[currentChapter].time}</span>
                                        </span>
                                        <span>•</span>
                                        <span>{videoProgress?.completedChapters.length || 0} of {chapters.length} lectures completed</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    {currentChapter > 0 && (
                                        <button
                                            onClick={() => seekToChapter(currentChapter - 1)}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    <button
                                        onClick={() => markChapterCompleted(currentChapter)}
                                        className={`px-6 py-2 rounded-lg font-semibold transition-all shadow-lg ${videoProgress?.completedChapters.includes(currentChapter)
                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                            }`}
                                    >
                                        {videoProgress?.completedChapters.includes(currentChapter) ? (
                                            <span className="flex items-center space-x-2">
                                                <CheckCircle2 className="w-5 h-5" />
                                                <span>Completed</span>
                                            </span>
                                        ) : (
                                            'Mark as Complete'
                                        )}
                                    </button>
                                    {currentChapter < chapters.length - 1 && (
                                        <button
                                            onClick={() => seekToChapter(currentChapter + 1)}
                                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all font-medium shadow-lg"
                                        >
                                            Next
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Course Content & Notes */}
                <div className={`bg-[#2d2f31] border-l border-gray-700 transition-all duration-300 overflow-hidden ${sidebarOpen ? 'w-96' : 'w-0'
                    }`}>
                    <div className="h-full flex flex-col">
                        {/* Sidebar Tabs */}
                        <div className="flex border-b border-gray-700">
                            <button
                                onClick={() => setSidebarTab('chapters')}
                                className={`flex-1 px-4 py-3 font-semibold transition-colors flex items-center justify-center gap-2 ${sidebarTab === 'chapters'
                                        ? 'bg-[#1c1d1f] text-purple-400 border-b-2 border-purple-500'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <ListOrdered className="w-4 h-4" />
                                Chapters
                            </button>
                            <button
                                onClick={() => setSidebarTab('notes')}
                                className={`flex-1 px-4 py-3 font-semibold transition-colors flex items-center justify-center gap-2 ${sidebarTab === 'notes'
                                        ? 'bg-[#1c1d1f] text-purple-400 border-b-2 border-purple-500'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <StickyNote className="w-4 h-4" />
                                Notes
                            </button>
                        </div>

                        {/* Tab Content */}
                        {sidebarTab === 'chapters' ? (
                            <>
                                {/* Sidebar Header */}
                                <div className="p-4 border-b border-gray-700">
                                    <h2 className="text-white font-bold text-lg mb-2">Course Content</h2>

                                    {/* URL Input */}
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                placeholder="Paste YouTube URL here..."
                                                className="w-full px-3 py-2 bg-[#1c1d1f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                                                onKeyPress={(e) => e.key === 'Enter' && handleFetchChapters()}
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleFetchChapters()}
                                            disabled={loading}
                                            className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                    <span>Loading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4" />
                                                    <span>Load Course</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/50 rounded-lg">
                                            <p className="text-red-400 text-xs font-medium">❌ {error}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Course Stats */}
                                {chapters.length > 0 && (
                                    <div className="px-4 py-2 bg-[#1c1d1f] border-b border-gray-700">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-white">{chapters.length}</div>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Lectures</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-purple-400">
                                                    {videoProgress?.completedChapters.length || 0}
                                                </div>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Completed</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Chapters List */}
                                <div className="flex-1 overflow-y-auto min-h-0">
                                    {chapters.length > 0 ? (
                                        <div className="p-2 space-y-1">
                                            {chapters.map((chapter, index) => {
                                                const isCompleted = videoProgress?.completedChapters.includes(index);
                                                const isCurrent = currentChapter === index;

                                                return (
                                                    <div
                                                        key={index}
                                                        onClick={() => seekToChapter(index)}
                                                        className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${isCurrent
                                                                ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 shadow-md'
                                                                : isCompleted
                                                                    ? 'bg-green-500/5 border border-green-500/20 hover:bg-green-500/10'
                                                                    : 'bg-[#1c1d1f] border border-gray-800 hover:bg-gray-800 hover:border-gray-700'
                                                            }`}
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            {/* Lecture Number / Status Icon */}
                                                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs mt-0.5 ${isCompleted
                                                                    ? 'bg-green-500 text-white'
                                                                    : isCurrent
                                                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                                        : 'bg-gray-700 text-gray-400'
                                                                }`}>
                                                                {isCompleted ? (
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                ) : isCurrent ? (
                                                                    <Play className="w-3 h-3 ml-0.5" />
                                                                ) : (
                                                                    index + 1
                                                                )}
                                                            </div>

                                                            {/* Chapter Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className={`font-medium text-sm mb-0.5 line-clamp-2 leading-snug ${isCurrent ? 'text-white' : isCompleted ? 'text-green-300' : 'text-gray-300'
                                                                    }`}>
                                                                    {chapter.title}
                                                                </h4>
                                                                <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span>{chapter.time}</span>
                                                                </div>
                                                            </div>

                                                            {/* Play Icon on Hover */}
                                                            {!isCurrent && (
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                                                                    <ChevronRight className="w-4 h-4 text-purple-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full p-8">
                                            <div className="text-center">
                                                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                                <p className="text-gray-400 text-sm">No lectures yet</p>
                                                <p className="text-gray-500 text-xs mt-1">Add a YouTube URL to get started</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Progress Summary Footer */}
                                {chapters.length > 0 && (
                                    <div className="p-4 border-t border-gray-700 bg-[#1c1d1f]">
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-xs mb-1.5">
                                                <span className="text-gray-400 font-medium">Your Progress</span>
                                                <span className="text-purple-400 font-bold">{progressPercentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${progressPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                                            <div className="bg-[#2d2f31] p-2 rounded border border-gray-700">
                                                <div className="text-gray-500 mb-0.5">Completed</div>
                                                <div className="text-white font-semibold">
                                                    {videoProgress?.completedChapters.length || 0}/{chapters.length}
                                                </div>
                                            </div>
                                            <div className="bg-[#2d2f31] p-2 rounded border border-gray-700">
                                                <div className="text-gray-500 mb-0.5">Last Watched</div>
                                                <div className="text-white font-semibold">
                                                    {videoProgress?.timestamp ? new Date(videoProgress.timestamp).toLocaleDateString() : 'Never'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <NotesBookmarks
                                videoId={videoId}
                                currentChapter={currentChapter}
                                chapters={chapters}
                                onSeekTo={seekToTimestamp}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add YouTube types to window
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}
