import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db, auth } from '../firebase';
import { doc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { User, Mail, Shield, Calendar, LogOut, Trash2, Video, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [myStreams, setMyStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setName(profile.displayName);
      setPhotoURL(profile.photoURL);
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      const fetchMyStreams = async () => {
        const q = query(collection(db, 'streams'), where('creatorUid', '==', user.uid));
        const snapshot = await getDocs(q);
        setMyStreams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      fetchMyStreams();
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: name,
        photoURL: photoURL,
      });
      alert('Perfil actualizado con éxito');
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStream = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transmisión?')) {
      try {
        await deleteDoc(doc(db, 'streams', id));
        setMyStreams(myStreams.filter(s => s.id !== id));
      } catch (err) {
        console.error('Error deleting stream:', err);
      }
    }
  };

  if (!user || !profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="relative group">
            {photoURL ? (
              <img src={photoURL} alt="Profile" className="w-32 h-32 rounded-full border-4 border-zinc-800 object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center border-4 border-zinc-800">
                <User className="w-12 h-12 text-zinc-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Cambiar</span>
            </div>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">{profile.displayName}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-medium text-zinc-400 flex items-center gap-2">
                <Mail className="w-3 h-3" /> {profile.email}
              </div>
              <div className="px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full text-xs font-bold text-red-500 flex items-center gap-2">
                <Shield className="w-3 h-3" /> {profile.role.toUpperCase()}
              </div>
              <div className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-medium text-zinc-400 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Miembro desde {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 ml-1">Nombre Público</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-600 transition-colors"
              placeholder="Tu nombre"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 ml-1">URL de Foto de Perfil</label>
            <input
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-600 transition-colors"
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Actualizar Perfil'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">Mis Transmisiones</h2>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-all"
            >
              Nueva Transmisión
            </button>
          )}
        </div>

        {myStreams.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
            <Video className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">No has creado ninguna transmisión aún.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myStreams.map((stream) => (
              <div key={stream.id} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stream.type === 'video' ? 'bg-red-600/10 text-red-500' : 'bg-blue-600/10 text-blue-500'}`}>
                    {stream.type === 'video' ? <Video className="w-6 h-6" /> : <Radio className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-red-500 transition-colors">{stream.title}</h3>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">{stream.type} • {stream.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/stream/${stream.id}`)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => handleDeleteStream(stream.id)}
                    className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => auth.signOut().then(() => navigate('/login'))}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión en todos los dispositivos
        </button>
      </div>
    </div>
  );
};

export default Profile;
