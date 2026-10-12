import React, { useState, useEffect } from 'react';
import {
  X,
  Laptop,
  Download,
  Monitor,
  CheckCircle2,
  Terminal,
  FileCode,
  ShieldCheck,
  HardDrive,
  Copy,
  Check,
  FolderOpen,
  ArrowRight,
  GitBranch,
  Github
} from 'lucide-react';

interface DesktopInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopInstallModal: React.FC<DesktopInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'git' | 'native' | 'pwa'>('git');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleCopy = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleInstallPwa = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      alert(
        'To install via browser:\n\n1. In Chrome / Edge / Brave: Click the Install icon in the address bar (or Menu → "Install OmniLaunch")\n2. In Safari (macOS): Click File → "Add to Dock"'
      );
    }
  };

  const handleDownloadWindowsHelper = () => {
    const script = `@echo off
:: ====================================================================
:: OmniLaunch Native Desktop Installer Build Script (Windows)
:: ====================================================================
title OmniLaunch - Building Native Windows Installer
echo.
echo ===================================================
echo   OmniLaunch: Building Windows .exe Installer
echo ===================================================
echo.
echo [1/3] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [2/3] Installing local dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)

echo [3/3] Compiling and packaging OmniLaunch-Setup-1.0.0.exe...
call npm run package:win
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo [SUCCESS] Installer generated in \\release directory:
echo   release\\OmniLaunch Setup 1.0.0.exe
echo ===================================================
echo.
explorer release
pause
`;
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-windows-installer.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMacHelper = () => {
    const script = `#!/bin/bash
# ====================================================================
# OmniLaunch Native Desktop Installer Build Script (macOS)
# ====================================================================
set -e

echo ""
echo "==================================================="
echo "  OmniLaunch: Building macOS .dmg Installer"
echo "==================================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/3] Installing dependencies..."
npm install

echo "[2/3] Compiling frontend and packaging DMG..."
npm run package:mac

echo ""
echo "==================================================="
echo "[SUCCESS] macOS installer created in ./release:"
echo "  release/OmniLaunch-1.0.0.dmg"
echo "==================================================="
echo ""
open release
`;
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-mac-installer.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const gitWorkflowCode = `name: Build & Release Desktop App
on:
  push:
    branches: [ main, master ]
    paths:
      - 'manifest.json'
      - 'public/manifest.json'
  workflow_dispatch:

jobs:
  check-version:
    name: Check manifest.json Version Change
    runs-on: ubuntu-latest
    outputs:
      should_build: \${{ steps.version_detector.outputs.should_build }}
      version: \${{ steps.version_detector.outputs.version }}
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 2 }
      - id: version_detector
        run: |
          # Compares version in manifest.json between current commit & HEAD~1
          # If version changed (e.g. 0.1 -> 0.2), should_build = true
  build-and-release:
    needs: check-version
    if: needs.check-version.outputs.should_build == 'true'
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: \${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm install --legacy-peer-deps
      - run: npm run build
      - name: Build Windows .exe
        if: matrix.os == 'windows-latest'
        run: npx electron-builder --win nsis
      - name: Build macOS .dmg
        if: matrix.os == 'macos-latest'
        run: npx electron-builder --mac dmg zip
      - uses: softprops/action-gh-release@v2
        with:
          tag_name: v\${{ needs.check-version.outputs.version }}
          files: release/*.*`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              Desktop Packaging & Automated Builds
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('git')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'git'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Git manifest.json Builds</span>
          </button>
          <button
            onClick={() => setActiveTab('native')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'native'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Local Build Commands (.exe / .dmg)</span>
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Lightweight PWA Mode</span>
          </button>
        </div>

        {/* Tab 0: Automated Git / GitHub CI Builds */}
        {activeTab === 'git' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 bg-slate-950 rounded-xl border border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Github className="w-4 h-4 text-purple-400" />
                  <span>Automated Builds via manifest.json Version Change</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
                  Version 0.1 Initialized
                </span>
              </div>

              <p className="text-slate-400 leading-relaxed">
                OmniLaunch is configured to build desktop installers <strong className="text-white">only when the version in <code className="text-purple-300 font-mono">manifest.json</code> is changed</strong>. Normal commits (editing games, UI changes, scripts) will <strong className="text-white">never</strong> trigger expensive builds.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <strong className="text-emerald-400 block font-semibold">1. Work Freely</strong>
                  <p className="text-slate-400">Push commits to main without triggering CI. Your regular pushes never build.</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <strong className="text-sky-400 block font-semibold">2. Change Version in manifest.json</strong>
                  <p className="text-slate-400">Update <code className="text-emerald-300">"version": "0.1"</code> to <code className="text-emerald-300">"0.2"</code> when ready to release.</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <strong className="text-purple-400 block font-semibold">3. Automatic Release</strong>
                  <p className="text-slate-400">GitHub Actions builds the Windows installer & macOS DMG and creates a Release.</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-slate-300 font-semibold block text-[11px]">Starting manifest.json version (v0.1):</span>
                <div className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-purple-300 select-all border border-slate-800 space-y-1">
                  <div className="text-slate-400">&#123;</div>
                  <div className="pl-4 text-emerald-400">"version": "0.1",</div>
                  <div className="pl-4 text-slate-400">"name": "OmniLaunch: Local Game Manager & Deals Aggregator",</div>
                  <div className="pl-4 text-slate-400">...</div>
                  <div className="text-slate-400">&#125;</div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Whenever you bump this field to a new number (e.g. <code className="text-emerald-400">"0.2"</code>) and push to GitHub, the workflow in <code className="text-purple-300 font-mono">.github/workflows/desktop-build.yml</code> will detect the version difference against the previous commit, package the new Windows <code className="text-emerald-400">.exe</code> and macOS <code className="text-sky-400">.dmg</code>, and publish GitHub Release <code className="text-sky-300 font-mono">v0.1</code> / <code className="text-sky-300 font-mono">v0.2</code>!
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-[11px]">Included Workflow Configuration:</span>
                <button
                  onClick={() => handleCopy(gitWorkflowCode, 'workflow')}
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-[11px]"
                >
                  {copiedCmd === 'workflow' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'workflow' ? 'Copied' : 'Copy Workflow YAML'}</span>
                </button>
              </div>
              <pre className="p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-400 overflow-x-auto max-h-36 border border-slate-800">
                {gitWorkflowCode}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 1: Pure Native Desktop Installer */}
        {activeTab === 'native' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Pure Native Desktop App (Zero Web Hosting Required)</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                  Electron Native Engine
                </span>
              </div>

              <p className="text-slate-400 leading-relaxed">
                OmniLaunch is architected with a native <strong className="text-white">Electron & Node.js desktop core</strong> (<code className="text-emerald-400 font-mono">electron/main.cjs</code>). You do <em>not</em> need to host this on the web. It installs directly as a standalone program on Windows and macOS with:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <strong className="text-emerald-400 block font-semibold">Windows (.exe Setup):</strong>
                  <p className="text-slate-400">
                    Creates a standard Windows NSIS installer with desktop shortcuts, Start Menu entry, and Add/Remove programs registration.
                  </p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <strong className="text-sky-400 block font-semibold">macOS (.dmg Package):</strong>
                  <p className="text-slate-400">
                    Standard Apple Disk Image with drag-and-drop to <code className="text-slate-300 font-mono">/Applications</code> and Dock support.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1 text-slate-300">
                <strong className="text-white block font-semibold">Why Native Install is Required for Standalone Games:</strong>
                <p className="text-slate-400">
                  A browser security sandbox blocks webpages from silently executing local <code className="text-emerald-400 font-mono">.exe</code> files on your hard drive. In the pure desktop install, OmniLaunch has full local system privileges to spawn executables directly with your launch flags and working directories!
                </p>
              </div>
            </div>

            {/* How to compile installers */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-white text-xs block">
                Commands to Generate Your Native Installers Locally:
              </span>

              {/* Windows command */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>1. Build Windows Installer (<code className="text-emerald-400">OmniLaunch Setup.exe</code>):</span>
                  <button
                    onClick={() => handleCopy('npm run package:win', 'win')}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                  >
                    {copiedCmd === 'win' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'win' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-emerald-300 select-all border border-slate-800">
                  npm run package:win
                </div>
              </div>

              {/* macOS command */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>2. Build macOS Package (<code className="text-sky-400">OmniLaunch.dmg</code>):</span>
                  <button
                    onClick={() => handleCopy('npm run package:mac', 'mac')}
                    className="flex items-center gap-1 text-sky-400 hover:text-sky-300"
                  >
                    {copiedCmd === 'mac' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'mac' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-sky-300 select-all border border-slate-800">
                  npm run package:mac
                </div>
              </div>

              {/* Instant Run command */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>3. Or Launch Native App Immediately Without Packaging:</span>
                  <button
                    onClick={() => handleCopy('npm run desktop:start', 'start')}
                    className="flex items-center gap-1 text-slate-300 hover:text-white"
                  >
                    {copiedCmd === 'start' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'start' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300 select-all border border-slate-800">
                  npm run desktop:start
                </div>
              </div>

              {/* Downloadable one-click helper scripts */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-2">
                  Download 1-click builder script for your operating system:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadWindowsHelper}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-lg text-emerald-400 font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download build-windows-installer.bat</span>
                  </button>

                  <button
                    onClick={handleDownloadMacHelper}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 rounded-lg text-sky-400 font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download build-mac-installer.sh</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PWA Mode */}
        {activeTab === 'pwa' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Laptop className="w-4 h-4 text-emerald-400" />
                  <span>Lightweight Desktop Mode (PWA)</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                  Browser-Assisted
                </span>
              </div>

              <p className="text-slate-400 leading-relaxed">
                If you prefer not to build the native <code className="text-emerald-400 font-mono">.exe</code>, you can install OmniLaunch via your browser. It opens in a standalone window, but uses OS protocols and generated batch scripts for launching.
              </p>

              <button
                onClick={handleInstallPwa}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl transition-colors shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>{installPrompt ? 'Install OmniLaunch via Browser' : 'Install PWA Desktop Icon'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
