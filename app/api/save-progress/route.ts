import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { videoId, url, title, chapters, progress } = await request.json();

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('courses');
        const collection = db.collection('userProgress');

        const result = await collection.updateOne(
            {
                userId,
                videoId
            },
            {
                $set: {
                    userId,
                    videoId,
                    url,
                    title: title || 'Untitled Course',
                    chapters: chapters || [],
                    progress: progress || {
                        completedChapters: [],
                        lastWatchedChapter: 0,
                        progressPercentage: 0,
                        totalWatchTime: 0,
                        timestamp: Date.now()
                    },
                    lastAccessed: new Date()
                }
            },
            {
                upsert: true
            }
        );

        console.log('Saved progress to MongoDB:', {
            userId,
            videoId,
            modified: result.modifiedCount,
            upserted: result.upsertedCount
        });

        return NextResponse.json({
            success: true,
            modified: result.modifiedCount,
            upserted: result.upsertedCount
        });
    } catch (error) {
        console.error('Error saving progress:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}