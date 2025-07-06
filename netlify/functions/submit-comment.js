import { getStore } from '@netlify/blobs';
import { nanoid } from 'nanoid';

// Simple sanitization to prevent XSS.
const sanitize = (str) => str.replace(/</g, '<').replace(/>/g, '>');

export default async (req, context) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
    }

    const { DISCORD_WEBHOOK_URL } = process.env;
    if (!DISCORD_WEBHOOK_URL) {
        return new Response(JSON.stringify({ message: 'Server configuration error.' }), { status: 500 });
    }

    const { name, message } = await req.json();

    if (!name || !message || name.trim().length === 0 || message.trim().length === 0) {
        return new Response(JSON.stringify({ message: 'Name and message are required.' }), { status: 400 });
    }
    
    const commentId = nanoid(16);
    const newComment = {
        id: commentId,
        name: sanitize(name.slice(0, 50)),
        message: sanitize(message.slice(0, 500)),
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    const store = getStore('comments');
    const allComments = await store.get('all_comments', { type: 'json' }) || [];
    allComments.push(newComment);
    await store.setJSON('all_comments', allComments);
    
    const siteUrl = context.site.url;
    const approveUrl = `${siteUrl}/.netlify/functions/moderate-comment?id=${commentId}&action=approve`;
    const denyUrl = `${siteUrl}/.netlify/functions/moderate-comment?id=${commentId}&action=deny`;

    await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: `New comment on ${siteUrl} is waiting for your approval.`,
            embeds: [{
                title: `Comment from: ${newComment.name}`,
                description: newComment.message,
                color: 0x58a6ff, // Blue
                fields: [
                    { name: "Approve", value: `[Click Here to Approve](${approveUrl})`, inline: true },
                    { name: "Deny", value: `[Click Here to Deny](${denyUrl})`, inline: true }
                ]
            }]
        })
    });

    return new Response(JSON.stringify({ message: 'Comment submitted for moderation.' }), { status: 202 });
};