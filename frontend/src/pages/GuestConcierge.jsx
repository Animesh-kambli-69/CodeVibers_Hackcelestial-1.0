import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, X, Info } from 'lucide-react';

import GuestLayout from '../components/layout/GuestLayout';
import PreferenceChips from '../components/concierge/PreferenceChips';
import ChatWindow from '../components/concierge/ChatWindow';
import ChatInput from '../components/concierge/ChatInput';
import SuggestedPrompts from '../components/concierge/SuggestedPrompts';
import { apiRequest } from '../lib/api';

export default function GuestConcierge() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hi Rahul! I am your AI Resort Concierge. Ask me about activities, spa treatments, dining options, or resort facilities.',
      grounded: true,
      sources: []
    }
  ]);

  // Load preferences
  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await apiRequest('/guest/preferences');
        setPreferences(res.data || []);
      } catch (err) {
        console.error('Failed to load guest preferences:', err);
      }
    };
    fetchPrefs();
  }, []);

  // Handle auto-sending initialQuery ?q=
  const autoSentRef = useRef(false);
  useEffect(() => {
    if (initialQuery && !autoSentRef.current) {
      autoSentRef.current = true;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (text) => {
    if (!text || loading) return;

    setErrorMsg(null);
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await apiRequest('/guest/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, conversationId })
      });

      const replyData = res.data;
      if (replyData.conversationId) setConversationId(replyData.conversationId);

      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: replyData.message,
        grounded: replyData.grounded !== false,
        sources: replyData.sources || []
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      if (err.status === 429) {
        setErrorMsg("You're sending messages quickly — please wait a moment.");
      } else {
        setErrorMsg('Concierge temporarily unavailable. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestLayout title="AI Resort Concierge">
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)', minHeight: 480 }}>
        {/* Preference Banner */}
        <PreferenceChips preferences={preferences} />

        {/* Error Notification Pill */}
        {errorMsg && (
          <div style={{
            padding: '8px 12px',
            borderRadius: 8,
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#C95C5C',
            fontSize: 12.5,
            fontWeight: 600,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Info size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Scrollable Chat Window */}
        <ChatWindow
          messages={messages}
          loading={loading}
          onSourceClick={(src) => setSelectedSource(src)}
        />

        {/* Quick Suggested Prompts */}
        <SuggestedPrompts onSelectPrompt={handleSendMessage} />

        {/* Input Field */}
        <ChatInput onSend={handleSendMessage} disabled={loading} />
      </div>

      {/* Source Detail Modal / Bottom Sheet */}
      {selectedSource && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          backgroundColor: 'rgba(23,32,28,0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }} onClick={() => setSelectedSource(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 600,
              backgroundColor: '#FFFFFF',
              borderRadius: '20px 20px 0 0',
              padding: 24,
              boxShadow: '0 -10px 30px rgba(0,0,0,0.15)',
              animation: 'slideUp 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, backgroundColor: '#DDEBE5', color: '#167A65' }}>
                {selectedSource.category || 'RESORT GUIDE'}
              </span>
              <button
                onClick={() => setSelectedSource(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} color="#17201C" />
              </button>
            </div>

            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: '#17201C', margin: '0 0 8px' }}>
              {selectedSource.title}
            </h3>

            <p style={{ fontSize: 13.5, color: '#66716C', lineHeight: 1.5, margin: '0 0 16px' }}>
              Verified resort information source referenced by AI Concierge for your query.
            </p>

            <button
              onClick={() => setSelectedSource(null)}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#167A65',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: 13.5,
                cursor: 'pointer'
              }}
            >
              Close Source Details
            </button>
          </div>
        </div>
      )}
    </GuestLayout>
  );
}
