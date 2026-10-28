/**
 * AI Drafting Service
 * Generates summaries and intelligent, natural follow-up drafts
 * according to user tone, voice rules, and custom instructions.
 */

function generateSummary(messages, subject) {
  if (!messages || messages.length === 0) return 'Email thread waiting for response.';
  const lastMsg = messages[messages.length - 1];
  const fromName = lastMsg.from ? lastMsg.from.split('<')[0].trim() : 'The sender';
  const snippet = lastMsg.snippet || lastMsg.body || '';

  // Extract core intent
  if (snippet.toLowerCase().includes('invoice') || snippet.toLowerCase().includes('payment')) {
    return `${fromName} is requesting a status update or resolution regarding billing / payment documentation for "${subject}".`;
  }
  if (snippet.toLowerCase().includes('proposal') || snippet.toLowerCase().includes('scope') || snippet.toLowerCase().includes('timeline')) {
    return `${fromName} is waiting on scope confirmation and milestone deliverables for "${subject}".`;
  }
  if (snippet.toLowerCase().includes('meeting') || snippet.toLowerCase().includes('call') || snippet.toLowerCase().includes('sync')) {
    return `${fromName} reached out to schedule a conversation regarding "${subject}".`;
  }
  if (snippet.toLowerCase().includes('invite') || snippet.toLowerCase().includes('keynote') || snippet.toLowerCase().includes('present')) {
    return `${fromName} invited you to participate/speak regarding "${subject}" and is waiting for your confirmation.`;
  }

  // Fallback summary
  const cleanSnippet = snippet.replace(/\r?\n|\r/g, ' ').slice(0, 140);
  return `${fromName} sent a message regarding "${subject}" and is awaiting your follow-up: "${cleanSnippet}..."`;
}

function generateDraft({ messages, subject, senderName, tone, userVoice, customPrompt }) {
  const name = userVoice?.userName || 'Yaswanth';
  const signoff = userVoice?.signature || `Best regards,\n${name}`;
  const senderGreeting = senderName ? senderName.split(' ')[0] : 'there';
  const lastMsg = (messages && messages.length > 0) ? messages[messages.length - 1] : null;
  const content = (lastMsg?.body || lastMsg?.snippet || '').toLowerCase();

  // If user provided custom refinement instructions
  if (customPrompt && customPrompt.trim().length > 0) {
    const prompt = customPrompt.toLowerCase();
    if (prompt.includes('casual') || prompt.includes('informal')) {
      return `Hey ${senderGreeting},\n\nThanks for reaching out! Regarding ${subject}, ${customPrompt.replace(/make it|tell them/gi, '').trim()}. Let me know if that works on your side.\n\n${signoff}`;
    }
    if (prompt.includes('decline') || prompt.includes('cannot') || prompt.includes('pass')) {
      return `Hi ${senderGreeting},\n\nThank you for thinking of me regarding ${subject}. Unfortunately, due to existing commitments I won't be able to take this on right now. I really appreciate the consideration and hope we can collaborate down the road.\n\n${signoff}`;
    }
    return `Hi ${senderGreeting},\n\nThanks for following up on ${subject}. In response to your note: ${customPrompt.trim()}.\n\nLet's coordinate on next steps soon.\n\n${signoff}`;
  }

  // Tone variations
  const isConcise = tone?.toLowerCase().includes('concise') || tone?.toLowerCase().includes('direct');
  const isCasual = tone?.toLowerCase().includes('casual');
  const isUrgent = tone?.toLowerCase().includes('urgent');

  // Specific context handling
  if (content.includes('invoice') || content.includes('payment') || content.includes('billing')) {
    if (isConcise) {
      return `Hello ${senderGreeting},\n\nThanks for following up. I've reviewed the invoice and approved it with our finance team. Payment processing is currently underway.\n\n${signoff}`;
    }
    return `Hi ${senderGreeting},\n\nThanks for following up on this. I've checked in with our finance department regarding invoice #${subject.match(/\d+/) ? subject.match(/\d+/)[0] : ''} and PO processing. The approval has gone through and disbursement will be completed in this week's scheduled payout.\n\n${signoff}`;
  }

  if (content.includes('proposal') || content.includes('scope') || content.includes('timeline') || content.includes('milestone')) {
    if (isCasual) {
      return `Hey ${senderGreeting},\n\nThanks for your patience while I reviewed this! We're aligned on the timeline and scope for ${subject}. I'll send over the updated sheet by tomorrow so you have everything ready for your team.\n\n${signoff}`;
    }
    return `Hi ${senderGreeting},\n\nThanks for following up. We've reviewed the timeline and deliverable schedule for ${subject}. We can confirm the proposed milestones and will share the finalized documentation before your next review meeting.\n\n${signoff}`;
  }

  if (content.includes('sync') || content.includes('call') || content.includes('meeting') || content.includes('coffee')) {
    if (isCasual) {
      return `Hey ${senderGreeting},\n\nApologies for the delay! I'd love to catch up. How does mid-next week look for you? Let me know a couple of slots that work on your end and I'll send an invite.\n\n${signoff}`;
    }
    return `Hi ${senderGreeting},\n\nThank you for reaching out. I would be glad to connect. I have availability next Wednesday and Thursday afternoon between 2:00 PM and 4:30 PM. Please let me know what time works best for you.\n\n${signoff}`;
  }

  if (content.includes('keynote') || content.includes('speaker') || content.includes('conference') || content.includes('devcon')) {
    return `Hi ${senderGreeting},\n\nThank you very much for the invitation to speak at ${subject.replace('Keynote Speaker Invitation:', '').trim()}. I would be delighted to participate. Please send over the speaker guidelines and logistics packet so we can coordinate the details.\n\n${signoff}`;
  }

  // General fallback based on selected tone
  if (isCasual) {
    return `Hey ${senderGreeting},\n\nThanks for checking in, and sorry for the slight delay. I've reviewed your note regarding ${subject}. Everything looks good to move forward. Let me know when you'd like to take the next step.\n\n${signoff}`;
  }

  if (isConcise) {
    return `Hi ${senderGreeting},\n\nReceived with thanks. I've noted the details regarding ${subject} and am currently finalizing the next steps. I will update you by tomorrow.\n\n${signoff}`;
  }

  return `Hi ${senderGreeting},\n\nThank you for reaching out and for your patience. I've reviewed your message regarding ${subject}. Everything is on track from our end, and I'll be in touch shortly with the complete details.\n\n${signoff}`;
}

module.exports = {
  generateSummary,
  generateDraft
};
