import { getStore } from '@netlify/blobs';

export default async (req, context) => {
    const { id, action } = Object.fromEntries(new URL(req.url).searchParams);

    if (!id || !['approve', 'deny'].includes(action)) {
        return new Response('Invalid moderation link.', { status: 400 });
    }
    
    const store = getStore('comments');
    const allComments = await store.get('all_comments', { type: 'json' }) || [];
    let message = 'Comment not found or already moderated.';

    if (action === 'approve') {
        const commentIndex = allComments.findIndex(c => c.id === id && c.status === 'pending');
        if (commentIndex !== -1) {
            allComments[commentIndex].status = 'approved';
            await store.setJSON('all_comments', allComments);
            message = 'Comment has been APPROVED and is now live.';
        }
    } else if (action === 'deny') {
        const originalLength = allComments.length;
        const updatedComments = allComments.filter(c => c.id !== id);
        if (updatedComments.length < originalLength) {
            await store.setJSON('all_comments', updatedComments);
            message = 'Comment has been DENIED and deleted permanently.';
        }
    }
    
    return new Response(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Moderation Complete</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; text-align: center; padding: 50px; background-color: #0D1117; color: #c9d1d9;}
                div { max-width: 600px; margin: auto; padding: 2rem; border: 1px solid #30363d; border-radius: 8px; background-color: #161B22; }
                h1 { color: #58a6ff; }
            </style>
        </head>
        <body>
            <div>
                <h1>Moderation Complete</h1>
                <p>${message}</p>
            </div>
        </body>
        </html>
    `, { headers: { 'Content-Type': 'text/html' }});
};