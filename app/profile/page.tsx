'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import {
    Play,
    Clock,
    CheckCircle2,
    TrendingUp,
    BookOpen,
    Home,
    Award,
    Target,
    Zap,
    BarChart3
} from 'lucide-react';

interface Course {
    videoId: string;
    url: string;
    title: string;
    chapters: any[];
    lastAccessed: string;
    progress: {
        completedChapters: number[];
        lastWatchedChapter: number;
        progressPercentage: number;
        totalWatchTime: number;
        timestamp: number;
    };
}

export default function Profile() {
    const { user } = useUser();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            loadCourses();
        }
    }, [user]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/user-courses');

            if (!response.ok) {
                throw new Error('Failed to load courses');
            }

            const data = await response.json();
            setCourses(data.courses || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    const formatWatchTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const completedCourses = courses.filter(c => c.progress.progressPercentage === 100).length;
    const inProgressCourses = courses.filter(c => c.progress.progressPercentage > 0 && c.progress.progressPercentage < 100).length;
    const totalWatchTime = courses.reduce((acc, c) => acc + (c.progress.totalWatchTime || 0), 0);

    return (
        <div className="min-h-screen bg-[#1c1d1f]">
            {/* Top Navigation Bar */}
            <nav className="bg-[#2d2f31] border-b border-gray-700 sticky top-0 z-50 shadow-lg">
                <div className="px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <Link href="/" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
                                <Home className="w-5 h-5" />
                                <span className="font-semibold">Home</span>
                            </Link>
                            <Link href="/courses" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
                                <Play className="w-5 h-5" />
                                <span className="font-semibold">Course Player</span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <UserButton
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "w-9 h-9 border-2 border-purple-500"
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* User Header */}
                <div className="mb-12">
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                            {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || 'U'}
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                {user?.firstName ? `Welcome back, ${user.firstName}!` : 'My Learning Dashboard'}
                            </h1>
                            <p className="text-gray-400 text-lg">Track your progress and continue learning</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-[#2d2f31] rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{courses.length}</div>
                                    <div className="text-xs text-gray-400 mt-1">Total Courses</div>
                                </div>
                            </div>
                            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <div className="bg-[#2d2f31] rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{completedCourses}</div>
                                    <div className="text-xs text-gray-400 mt-1">Completed</div>
                                </div>
                            </div>
                            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: courses.length > 0 ? `${(completedCourses / courses.length) * 100}%` : '0%' }}></div>
                            </div>
                        </div>

                        <div className="bg-[#2d2f31] rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{inProgressCourses}</div>
                                    <div className="text-xs text-gray-400 mt-1">In Progress</div>
                                </div>
                            </div>
                            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: courses.length > 0 ? `${(inProgressCourses / courses.length) * 100}%` : '0%' }}></div>
                            </div>
                        </div>

                        <div className="bg-[#2d2f31] rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{formatWatchTime(totalWatchTime)}</div>
                                    <div className="text-xs text-gray-400 mt-1">Watch Time</div>
                                </div>
                            </div>
                            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Your Courses</h2>
                        <Link
                            href="/courses"
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all font-semibold shadow-lg flex items-center space-x-2"
                        >
                            <Play className="w-4 h-4" />
                            <span>Add New Course</span>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                                <p className="text-gray-400 text-lg">Loading your courses...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
                            <p className="text-red-400 font-medium">❌ {error}</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="bg-[#2d2f31] rounded-xl p-16 text-center border border-gray-700">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <BookOpen className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">No courses yet</h3>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">Start your learning journey by adding your first YouTube course!</p>
                            <Link
                                href="/courses"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-lg font-semibold"
                            >
                                <Play className="w-5 h-5" />
                                Add Your First Course
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <Link
                                    key={course.videoId}
                                    href={`/courses?v=${course.videoId}`}
                                    className="group bg-[#2d2f31] rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all hover:shadow-2xl hover:shadow-purple-500/20"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative h-48 bg-gradient-to-br from-purple-900/30 to-pink-900/30 overflow-hidden">
                                        <img
                                            src={`https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg`}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg`;
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                        {/* Progress Badge */}
                                        <div className="absolute top-4 right-4">
                                            {course.progress.progressPercentage === 100 ? (
                                                <div className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Completed
                                                </div>
                                            ) : course.progress.progressPercentage > 0 ? (
                                                <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold shadow-lg">
                                                    {course.progress.progressPercentage}% Done
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1 bg-gray-900/80 text-white rounded-full text-xs font-semibold shadow-lg">
                                                    Not Started
                                                </div>
                                            )}
                                        </div>

                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
                                                <Play className="w-8 h-8 text-purple-600 ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="font-bold text-lg text-white mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors">
                                            {course.title}
                                        </h3>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                                                <span>Progress</span>
                                                <span className="font-semibold text-purple-400">{course.progress.progressPercentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${course.progress.progressPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                                            <span className="flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" />
                                                {course.progress.completedChapters.length}/{course.chapters.length}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {formatWatchTime(course.progress.totalWatchTime)}
                                            </span>
                                        </div>

                                        {/* Last Watched */}
                                        <div className="text-xs text-gray-500 mb-4">
                                            Last watched: {formatDate(course.lastAccessed)}
                                        </div>

                                        {/* Resume Button */}
                                        {course.progress.progressPercentage > 0 && course.progress.progressPercentage < 100 && (
                                            <div className="pt-4 border-t border-gray-700">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-400">
                                                        Continue from Lecture {course.progress.lastWatchedChapter + 1}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                                                        <Play className="w-4 h-4" />
                                                        <span>Resume</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}