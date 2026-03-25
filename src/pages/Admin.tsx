import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, setDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Video, Radio, Plus, Trash2, Edit2, Shield, Activity, Users, MessageSquare } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [streams, setStreams] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'video' | 'radio'>('video');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchStreams();
    }
  }, [isAdmin]);

  const fetchStreams = async () => {
    const q = query(collection(db, 'streams'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setStreams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const streamId = Math.random().toString(36).substr(2, 9);
      const streamData = {
        id: streamId,
        title,
        description,
        type,
        status: 'live',
        creatorUid: user.uid,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'streams', streamId), streamData);
      setTitle('');
      setDescription('');
      fetchStreams();
      alert('Transmisión creada con éxito');
    } catch (err) {
      console.error('Error creating stream:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStream = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transmisión?')) {
      try {
        await deleteDoc(doc(db, 'streams', id));
        fetchStreams();
      } catch (err) {
        console.error('Error deleting stream:', err);
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'live' ? 'offline' : 'live';
    try {
      await updateDoc(doc(db, 'streams', id), { status: newStatus });
      fetchStreams();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (!isAdmin) return <Navigate to="/" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <Shield className="w-10 h-10 text-red-600" /> Panel de Administración
          </h1>
          <p className="text-zinc-500 mt-1">Gestiona los canales y transmisiones de la plataforma.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-600/10 flex items-center justify-center text-green-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Estado</p>
              <p className="text-sm font-bold text-white">Sistemas OK</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl sticky top-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6 text-red-600" /> Nuevo Canal
            </h2>
            <form onSubmit={handleCreateStream} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Título del Canal</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="Ej: Radio Rock 24/7"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-600 transition-colors h-32 resize-none"
                  placeholder="De qué trata este canal..."
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Tipo de Transmisión</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setType('video')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border ${type === 'video' ? 'bg-red-600 text-white border-red-600' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <Video className="w-5 h-5" /> Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('radio')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border ${type === 'radio' ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <Radio className="w-5 h-5" /> Radio
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black rounded-xl py-4 font-bold hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Lanzar Canal'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight">Canales Activos</h2>
              <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 12.5k Total</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 458 Chats</span>
              </div>
            </div>
            <div className="divide-y divide-zinc-800">
              {streams.length === 0 ? (
                <div className="p-20 text-center">
                  <p className="text-zinc-500">No hay canales configurados.</p>
                </div>
              ) : (
                streams.map((stream) => (
                  <div key={stream.id} className="p-6 hover:bg-zinc-950/50 transition-all group">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center relative ${stream.type === 'video' ? 'bg-red-600/10 text-red-500' : 'bg-blue-600/10 text-blue-500'}`}>
                          {stream.type === 'video' ? <Video className="w-8 h-8" /> : <Radio className="w-8 h-8" />}
                          {stream.status === 'live' && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full"></span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">{stream.title}</h3>
                          <p className="text-sm text-zinc-500 line-clamp-1 max-w-md">{stream.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">{stream.type}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${stream.status === 'live' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-600'}`}>
                              {stream.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => toggleStatus(stream.id, stream.status)}
                          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${stream.status === 'live' ? 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'border-green-600/50 text-green-500 hover:bg-green-600 hover:text-white'}`}
                        >
                          {stream.status === 'live' ? 'Pausar' : 'Reanudar'}
                        </button>
                        <button
                          onClick={() => handleDeleteStream(stream.id)}
                          className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
