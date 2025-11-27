import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { videoId, chapterIndex, timestamp, title } = await request.json();

        if (!videoId || chapterIndex === undefined || timestamp === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('courses');
        const collection = db.collection('bookmarks');

        const result = await collection.insertOne({
            userId,
            videoId,
            chapterIndex,
            timestamp,
            title: title || 'Bookmark',
            createdAt: new Date()
        });

        return NextResponse.json({
            success: true,
            bookmarkId: result.insertedId
        });
    } catch (error) {
        console.error('Error saving bookmark:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const videoId = searchParams.get('videoId');

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('courses');
        const collection = db.collection('bookmarks');

        const bookmarks = await collection
            .find({ userId, videoId })
            .sort({ timestamp: 1 })
            .toArray();

        return NextResponse.json({ bookmarks });
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bookmarkId } = await request.json();

        const client = await clientPromise;
        const db = client.db('courses');
        const collection = db.collection('bookmarks');

        await collection.deleteOne({
            _id: new ObjectId(bookmarkId),
            userId
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bookmarkId, title } = await request.json();

        if (!bookmarkId || !title) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('courses');
        const collection = db.collection('bookmarks');

        await collection.updateOne(
            { _id: new ObjectId(bookmarkId), userId },
            { $set: { title, updatedAt: new Date() } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating bookmark:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
