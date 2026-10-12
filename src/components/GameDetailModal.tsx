import React, { useState } from 'react';
import {
  X,
  Play,
  Terminal,
  Download,
  HardDrive,
  Layers,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  Globe
} from 'lucide-react';
import { GameItem } from '../types';
import { PLATFORM_INFO, downloadLauncherFile, getCopyableCommand } from '../services/storeProtocols';

interface GameDetailModalProps {
  game: GameItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunchGame: (game: GameItem) => void;
  onUpdateGame: (game: GameItem) => void;
  onDeleteGame: (id: string) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  isOpen,
  onClose,
  onLaunchGame,
  onUpdateGame,
  onDeleteGame
}) => {
  if (!isOpen || !game) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(game.title);
  const [editedPath, setEditedPath] = useState(game.executablePath);
  const [editedArgs, setEditedArgs] = useState(game.launchArgs);
  const [editedSize, setEditedSize] = useState(game.installSizeGb?.toString() || '15');
  const [editedNotes, setEditedNotes] = useState(game.notes || '');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const platformInfo = PLATFORM_INFO[game.store] || PLATFORM_INFO.standalone;

  const handleSaveEdits = () => {
    const updatedGame: GameItem = {
      ...game,
      title: editedTitle.trim(),
      executablePath: editedPath.trim(),
      launchArgs: editedArgs.trim(),
      installSizeGb: parseFloat(editedSize) || 0,
      notes: editedNotes.trim()
    };
    onUpdateGame(updatedGame);
    setIsEditing(false);
  };

  const handleCopy = () => {
    const cmd = getCopyableCommand(game, 'windows');
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDeleteGame(game.id);
      onClose();
    } else {
      setConfirmDelete(true);
    }
  };

  const getStoreWebLink = (): string | null => {
    if (game.store === 'steam' && game.storeAppId) {
      return `https://store.steampowered.com/app/${game.storeAppId}`;
    }
    if (game.store === 'gog' && game.storeAppId) {
      return `https://www.gog.com/game/${game.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    }
    if (game.store === 'epic') {
      return 'https://store.epicgames.com';
    }
    return null;
  };

  const storeWebUrl = getStoreWebLink();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-8">
        {/* Header Art Banner */}
        <div className="relative aspect-[21/9] w-full bg-slate-950 overflow-hidden">
          <img
            src={game.banner}
            alt={game.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.placeholders.dev/?width=600&height=300&text=' + encodeURIComponent(game.title);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-950/80 text-emerald-400 border border-emerald-500/40 backdrop-blur-sm">
                  {platformInfo.name}
                </span>
                <span className="text-xs text-slate-400 uppercase font-mono">
                  {game.os}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {game.title}
              </h1>
            </div>

            <button
              onClick={() => {
                onLaunchGame(game);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Game</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono text-xs">
            <div>
              <span className="text-[11px] text-slate-500 uppercase block font-sans">
                Store
              </span>
              <span className="font-bold text-white text-sm">
                {platformInfo.name}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase block font-sans">
                OS Target
              </span>
              <span className="font-bold text-white text-sm uppercase">
                {game.os}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase block font-sans">
                Install Size
              </span>
              <span className="font-bold text-white text-sm tabular-nums">
                {game.installSizeGb ? `${game.installSizeGb} GB` : '—'}
              </span>
            </div>
          </div>

          {/* Launcher Actions Strip */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">
              Direct Launcher & Store Links:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {storeWebUrl && (
                <a
                  href={storeWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-colors"
                  title="Open official store listing"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Store Page</span>
                </a>
              )}

              <button
                onClick={() => downloadLauncherFile(game, 'windows')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-colors"
                title="Download Windows desktop launcher (.bat)"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Windows .bat</span>
              </button>

              <button
                onClick={() => downloadLauncherFile(game, 'macos')}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-colors"
                title="Download macOS launcher script (.command)"
              >
                <Download className="w-4 h-4 text-purple-400" />
                <span>macOS .command</span>
              </button>
            </div>
          </div>

          {/* Edit or Inspector Form */}
          {isEditing ? (
            <div className="space-y-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Disk Size (GB)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editedSize}
                    onChange={(e) => setEditedSize(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Executable Path</label>
                  <input
                    type="text"
                    value={editedPath}
                    onChange={(e) => setEditedPath(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Launch Arguments</label>
                <input
                  type="text"
                  value={editedArgs}
                  onChange={(e) => setEditedArgs(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdits}
                  className="px-4 py-1.5 bg-emerald-400 text-slate-950 font-bold rounded"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Launch URI / Executable Path:</span>
                  <span className="font-mono text-emerald-400 text-[11px]">
                    {game.launchType}
                  </span>
                </div>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300 break-all select-all">
                  {game.protocolUri || game.executablePath || 'Not configured'}
                </div>

                {game.launchArgs && (
                  <div className="text-slate-400">
                    Arguments: <code className="text-white font-mono">{game.launchArgs}</code>
                  </div>
                )}
              </div>

              {game.notes && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block">Notes:</span>
                  <p className="text-slate-300 whitespace-pre-wrap">{game.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={handleDelete}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                confirmDelete
                  ? 'bg-rose-500 text-white'
                  : 'text-rose-400 hover:bg-rose-950/40 border border-rose-500/30'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmDelete ? 'Confirm Remove' : 'Remove Game'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors"
                title="Copy terminal execution string"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'Copied' : 'Command'}</span>
              </button>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Game</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
