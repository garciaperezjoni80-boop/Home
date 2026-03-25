import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Video, Radio, Send, Users, MessageSquare, Shield, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Stream {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'radio';
  status: 'live' | 'offline';
  creatorUid: string;
  createdAt: string;
}

interface Message {
  id: string;
  senderUid: string;
  senderName: string;
  text: string;
  createdAt: any;
}

const Stream: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [stream, setStream] = useState<Stream | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const fetchStream = async () => {
      const streamDoc = await getDoc(doc(db, 'streams', id));
      if (streamDoc.exists()) {
        setStream({ id: streamDoc.id, ...streamDoc.data() } as Stream);
      } else {
        navigate('/');
      }
      setLoading(false);
    };

    fetchStream();

    const q = query(
      collection(db, 'streams', id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [id, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || !id) return;

    try {
      await addDoc(collection(db, 'streams', id, 'messages'), {
        id: Math.random().toString(36).substr(2, 9),
        streamId: id,
        senderUid: user.uid,
        senderName: profile?.displayName || 'Anónimo',
        text: newMessage,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!stream) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
      <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        <div className="aspect-video bg-black rounded-3xl overflow-hidden relative shadow-2xl border border-zinc-800">
          {stream.type === 'video' ? (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
              <img
                src={`https://picsum.photos/seed/${stream.id}/1280/720`}
                className="w-full h-full object-cover opacity-50"
                alt="Stream Placeholder"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Video className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Transmisión de Video en Vivo</h2>
                <p className="text-zinc-400 mt-2">Conectando con el servidor de streaming...</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 p-8">
              <div className="w-48 h-48 rounded-full bg-blue-600/20 flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 animate-ping opacity-20"></div>
                <Radio className="w-24 h-24 text-blue-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Radio en Vivo</h2>
              <p className="text-zinc-400 text-lg">Escuchando ahora: {stream.title}</p>
              <div className="mt-8 w-full max-w-md h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-1/3 animate-[loading_2s_infinite]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white tracking-tight">{stream.title}</h1>
                <div className="px-2 py-0.5 bg-red-600 text-[10px] font-bold text-white rounded uppercase tracking-wider">Vivo</div>
              </div>
              <p className="text-zinc-400 text-lg leading-relaxed">{stream.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all font-medium">
                <Share2 className="w-4 h-4" /> Compartir
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-400 rounded-xl font-medium">
                <Users className="w-4 h-4" /> 1,243
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-white">Chat en Vivo</h3>
          </div>
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tiempo Real</div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group"
              >
                <div className="flex items-baseline gap-2">
                  <span className={`text-xs font-bold ${msg.senderUid === stream.creatorUid ? 'text-red-500' : 'text-zinc-400'}`}>
                    {msg.senderName}
                  </span>
                  {msg.senderUid === stream.creatorUid && <Shield className="w-3 h-3 text-red-500 inline" />}
                  <span className="text-xs text-zinc-600">
                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 mt-0.5 break-words leading-snug">{msg.text}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
          {user ? (
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Di algo..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
                maxLength={500}
              />
              <button
                type="submit"
                className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
                disabled={!newMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-zinc-500 mb-2">Inicia sesión para chatear</p>
              <button
                onClick={() => navigate('/login')}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Iniciar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stream;
