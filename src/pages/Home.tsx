import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { Video, Radio, Play, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface Stream {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'radio';
  status: 'live' | 'offline';
  creatorUid: string;
  createdAt: string;
}

const Home: React.FC = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'streams'),
      where('status', '==', 'live'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const streamsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stream));
      setStreams(streamsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 md:p-16">
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 text-xs font-bold uppercase tracking-wider mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            En Vivo Ahora
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-none"
          >
            Transmite <span className="text-red-600">Video</span> y <span className="text-zinc-500 italic">Radio</span> al Mundo.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg mb-8"
          >
            La plataforma definitiva para creadores de contenido. Conéctate con tu audiencia en tiempo real con la mejor calidad.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/register" className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-900/20">
              Comenzar Gratis
            </Link>
            <a href="#streams" className="px-8 py-4 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all">
              Explorar Canales
            </a>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-red-600/30 to-transparent"></div>
        </div>
      </section>

      <section id="streams" className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Transmisiones Destacadas</h2>
            <p className="text-zinc-500">Descubre lo que está pasando ahora mismo.</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white">Video</button>
            <button className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white">Radio</button>
          </div>
        </div>

        {streams.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
            <Video className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-zinc-400">No hay transmisiones en vivo</h3>
            <p className="text-zinc-600">Vuelve más tarde o inicia tu propia transmisión.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map((stream) => (
              <motion.div
                key={stream.id}
                whileHover={{ y: -5 }}
                className="group bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden hover:border-red-600/50 transition-all"
              >
                <Link to={`/stream/${stream.id}`}>
                  <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/${stream.id}/800/450`}
                      alt={stream.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 text-[10px] font-bold text-white rounded uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      Vivo
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md text-[10px] font-bold text-white rounded uppercase tracking-wider flex items-center gap-1">
                      <Users className="w-3 h-3" /> 1.2k
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {stream.type === 'video' ? (
                        <Video className="w-4 h-4 text-red-500" />
                      ) : (
                        <Radio className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{stream.type}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-red-500 transition-colors">{stream.title}</h3>
                    <p className="text-zinc-500 text-sm line-clamp-2">{stream.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
