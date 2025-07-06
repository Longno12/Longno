import { getStore } from '@netlify/blobs';

export default async (req, context) => {
    try {
        const store = getStore('comments');
        const commentsData = await store.get('all_comments', { type: 'json' }) || [];

        const approvedComments = commentsData
            .filter(c => c.status === 'approved')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first

        return new Response(JSON.stringify(approvedComments), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Could not fetch comments.' }), { status: 500 });
    }
};