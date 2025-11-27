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

        const { videoId, chapterIndex, note, timestamp } = await request.json();

        if (!videoId || chapterIndex === undefined || !note) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('courses');
        const collection = db.collection('notes');

        const result = await collection.insertOne({
            userId,
            videoId,
            chapterIndex,
            note,
            timestamp: timestamp || Date.now(),
            createdAt: new Date()
        });

        return NextResponse.json({
            success: true,
            noteId: result.insertedId
        });
    } catch (error) {
        console.error('Error saving note:', error);
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
        const collection = db.collection('notes');

        const notes = await collection
            .find({ userId, videoId })
            .sort({ chapterIndex: 1, timestamp: 1 })
            .toArray();

        return NextResponse.json({ notes });
    } catch (error) {
        console.error('Error fetching notes:', error);
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

        const { noteId } = await request.json();

        const client = await clientPromise;
        const db = client.db('courses');
        const collection = db.collection('notes');

        await collection.deleteOne({
            _id: new ObjectId(noteId),
            userId
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting note:', error);
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

        const { noteId, note } = await request.json();

        if (!noteId || !note) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('courses');
        const collection = db.collection('notes');

        await collection.updateOne(
            { _id: new ObjectId(noteId), userId },
            { $set: { note, updatedAt: new Date() } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating note:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
