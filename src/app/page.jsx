'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, Box, Settings, Download, FileArchive, CheckCircle, AlertCircle, Loader2, ChevronDown, Image as ImageIcon } from 'lucide-react';
import JSZip from 'jszip';

export default function Page() {
  const [files, setFiles] = useState([]);
  const [modName, setModName] = useState('');
  const [modId, setModId] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [issues, setIssues] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [iconPreview, setIconPreview] = useState(null);
  const [iconBlob, setIconBlob] = useState(null);
  const [extractedIcons, setExtractedIcons] = useState([]);
  const [showIconsPanel, setShowIconsPanel] = useState(false);

  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Mod adı değiştikçe Mod ID'yi otomatik İngilizce ve boşluksuz karaktere çevirir
  useEffect(() => {
    if (modName && status === 'idle') {
      const slug = modName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_|_$)/g, '');
      setModId(slug);
    }
  }, [modName, status]);

  const extractMetadata = async (uploadedFiles) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    try {
      let firstDescription = "";
      const foundIcons = [];

      // Varsayılan isim olarak yüklenen İLK dosyanın adını al
      const defaultName = uploadedFiles[0].name.replace(/\.zip$/i, '').replace(/[-_]/g, ' ');
      setModName(defaultName);

      for (let i = 0; i < uploadedFiles.length; i++) {
        const fileObj = uploadedFiles[i];
        const zip = await JSZip.loadAsync(fileObj);

        // İlk açıklamayı bulmaya çalış
        if (!firstDescription) {
          const mcmetaFile = zip.file("pack.mcmeta");
          if (mcmetaFile) {
            const mcmetaContent = await mcmetaFile.async("string");
            try {
              const mcmetaJson = JSON.parse(mcmetaContent);
              if (mcmetaJson?.pack?.description) {
                let descText = "";
                const desc = mcmetaJson.pack.description;
                
                if (typeof desc === "string") {
                  descText = desc;
                } else if (Array.isArray(desc)) {
                  descText = desc.map(c => typeof c === 'string' ? c : (c.text || "")).join("");
                } else if (desc.text) {
                  descText = desc.text;
                }
                descText = descText.replace(/§[0-9a-fk-or]/gi, '').trim();
                firstDescription = descText;
              }
            } catch (e) {
              console.warn("Could not parse pack.mcmeta in", fileObj.name);
            }
          }
        }

        // İkon Çıkarma (Her paketin ikonunu topla)
        const packPng = zip.file("pack.png");
        if (packPng) {
          const blob = await packPng.async("blob");
          foundIcons.push({
            id: `icon-${i}`,
            blob: blob,
            previewUrl: URL.createObjectURL(blob),
            packName: fileObj.name
          });
        }
      }

      setDescription(firstDescription);
      setExtractedIcons(foundIcons);

      if (foundIcons.length > 0) {
        setIconBlob(foundIcons[0].blob);
        setIconPreview(foundIcons[0].previewUrl);
        if (foundIcons.length > 1) {
          setShowIconsPanel(true);
        }
      } else {
        setIconBlob(null);
        setIconPreview("/rptm.png");
        setShowIconsPanel(false);
      }

    } catch (err) {
      console.error("Error reading zip files:", err);
    }
  };

  const handleIconChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "image/png") {
      setIconBlob(selectedFile);
      setIconPreview(URL.createObjectURL(selectedFile));
    } else if (selectedFile) {
      alert("Please upload a .png file for the icon.");
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.zip'));
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      setStatus('idle');
      setDownloadUrl(null);
      extractMetadata(droppedFiles);
    } else {
      alert("Please upload only .zip resource pack files.");
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(f => f.name.endsWith('.zip'));
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setStatus('idle');
      setDownloadUrl(null);
      extractMetadata(selectedFiles);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setModName('');
    setModId('');
    setVersion('1.0.0');
    setAuthor('');
    setDescription('');
    setWebsite('');
    setIssues('');
    setShowAdvanced(false);
    setIconPreview(null);
    setIconBlob(null);
    setExtractedIcons([]);
    setShowIconsPanel(false);
    setStatus('idle');
    setDownloadUrl(null);
    setErrorMessage('');
    
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
    const iconInput = document.getElementById('icon-upload');
    if (iconInput) iconInput.value = '';
  };

  const handleConvert = async () => {
    if (files.length === 0 || !modId || !modName) return;

    setStatus('processing');
    setErrorMessage('');

    try {
      const jar = new JSZip();

      const contactInfo = {
        sources: "https://github.com/Runteryaa/RPtM"
      };
      if (website) contactInfo.homepage = website;
      if (issues) contactInfo.issues = issues;

      const fabricModJson = {
        schemaVersion: 1,
        id: modId,
        version: version || "1.0.0",
        name: modName,
        description: description || "Created with RPtM Converter.",
        authors: author ? [author] : [],
        contact: contactInfo,
        license: "CC0-1.0",
        icon: "pack.png", 
        environment: "*",
        depends: {
          fabricloader: ">=0.15.0",
          minecraft: ">=1.20",
          rptmlib: "*" 
        },
        suggests: {
          respackopts: "*"
        }
      };

      jar.file("fabric.mod.json", JSON.stringify(fabricModJson, null, 2));

      const targetFolder = jar.folder(`resourcepacks/${modId}`);
      
      for (const f of files) {
        const uploadedZip = await JSZip.loadAsync(f);
        const promises = [];
        
        uploadedZip.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir) {
            promises.push(
              zipEntry.async('blob').then(content => {
                targetFolder.file(relativePath, content);
              })
            );
          } else {
            targetFolder.folder(relativePath);
          }
        });
        
        await Promise.all(promises);
      }

      if (iconBlob) {
        jar.file("pack.png", iconBlob);
      } else {
        try {
          const response = await fetch("/rptm.png");
          if (response.ok) {
            const fetchedIconBlob = await response.blob();
            jar.file("pack.png", fetchedIconBlob);
          }
        } catch (e) {
          console.error("RPtM icon couldn't be loaded:", e);
        }
      }

      const content = await jar.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      
      setDownloadUrl(url);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMessage('An error occurred during conversion. Please ensure you uploaded valid .zip files.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans p-6 md:p-12">
      <header className="max-w-5xl mx-auto mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">RPtM Converter</h1>
            <p className="text-sm text-neutral-400">Resource Pack to Mod Converter</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://modrinth.com/mod/rptmlib/" target="_blank" rel="noreferrer" className="text-sm font-medium text-neutral-400 hover:text-emerald-400 transition-colors flex items-center gap-2 bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-800 hover:border-emerald-500/50">
            View Mod on Modrinth
          </a>
          <a href="https://github.com/Runteryaa/RPtM" target="_blank" rel="noreferrer" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-2 bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-800 hover:border-neutral-700">
            View Mod on GitHub
          </a>
          <a href="https://github.com/Runteryaa/RPtM-Converter" target="_blank" rel="noreferrer" className="text-sm font-medium text-neutral-400 hover:text-purple-400 transition-colors flex items-center gap-2 bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-800 hover:border-purple-500/50">
            View Converter on GitHub
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <FileArchive className="w-5 h-5 text-indigo-400" />
              1. Upload Resource Pack(s)
            </h2>
            
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                files.length > 0 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-neutral-700 hover:border-indigo-400/50 hover:bg-neutral-800/50'
              }`}
            >
              <input 
                type="file" 
                id="file-upload" 
                accept=".zip" 
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileSelect}
              />
              
              {files.length === 0 ? (
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-2">
                    <UploadCloud className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-base font-medium text-neutral-300">Drag and drop your ZIP file(s) here</p>
                  <p className="text-sm text-neutral-500">or click to select multiple</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-2">
                    <CheckCircle className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="text-base font-medium text-indigo-300">{files.length} resource pack(s) selected</p>
                  <p className="text-sm text-indigo-400/60">
                    Total size: {(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
             <p className="text-sm text-indigo-200/80 leading-relaxed">
               All processing happens directly in your browser. Your files are never uploaded to any server. Multiple packs will be merged into one single mod.
             </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-purple-400" />
              2. Configure Mod Settings
            </h2>

            <div className="mb-6 p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl">
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => document.getElementById('icon-upload').click()}
                  className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700 flex-shrink-0 group cursor-pointer hover:border-indigo-500 transition-colors"
                >
                  {iconPreview ? (
                    <img src={iconPreview} alt="Mod Icon" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-neutral-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <UploadCloud className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-200">Mod Icon</h3>
                  <p className="text-xs text-neutral-500">Click to upload custom icon (.png)</p>
                </div>
                <input 
                  type="file" 
                  id="icon-upload" 
                  accept="image/png" 
                  className="hidden" 
                  onChange={handleIconChange} 
                />
              </div>

              {files.length > 1 && extractedIcons.length > 0 && (
                <div className="mt-4 pt-3 border-t border-neutral-800/50">
                  <button
                    type="button"
                    onClick={() => setShowIconsPanel(!showIconsPanel)}
                    className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors w-full text-left"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showIconsPanel ? 'rotate-180' : ''}`} />
                    Available Pack Icons ({extractedIcons.length})
                  </button>
                  
                  {showIconsPanel && (
                    <div className="flex gap-3 overflow-x-auto py-3 mt-2 items-center">
                      {extractedIcons.map(icon => (
                        <div
                          key={icon.id}
                          onClick={() => { setIconBlob(icon.blob); setIconPreview(icon.previewUrl); }}
                          className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all flex-shrink-0 ${iconBlob === icon.blob ? 'border-indigo-500 scale-105' : 'border-neutral-700 hover:border-neutral-500'}`}
                          title={`From: ${icon.packName}`}
                        >
                          <img src={icon.previewUrl} alt="pack icon" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                        </div>
                      ))}

                      <div
                        onClick={() => document.getElementById('icon-upload').click()}
                        className="w-12 h-12 rounded-lg border-2 border-dashed border-neutral-700 hover:border-indigo-500 hover:bg-neutral-800/50 cursor-pointer flex items-center justify-center flex-shrink-0 transition-all text-neutral-500 hover:text-indigo-400"
                        title="Upload custom icon"
                      >
                        <UploadCloud className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Mod Name</label>
                <input 
                  type="text" 
                  value={modName}
                  onChange={(e) => setModName(e.target.value)}
                  placeholder="e.g., Super Swords"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Mod ID</label>
                  <input 
                    type="text" 
                    value={modId}
                    onChange={(e) => setModId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="super_swords"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Version</label>
                  <input 
                    type="text" 
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Description</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short description of your mod..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-700"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors w-full text-left"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
                  Advanced Settings
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-5 pt-4 mt-2 border-t border-neutral-800/50">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1.5">Author (Optional)</label>
                    <input 
                      type="text" 
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1.5">Website</label>
                      <input 
                        type="text" 
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1.5">Issue Tracker</label>
                      <input 
                        type="text" 
                        value={issues}
                        onChange={(e) => setIssues(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200/90 leading-relaxed">
                <strong>Important:</strong> Generated mod requires <a href="https://modrinth.com/mod/rptmlib/" target="_blank" rel="noreferrer" className="text-amber-400 font-semibold hover:underline">RPtMLib</a>.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-800">
              {status === 'idle' || status === 'error' ? (
                <button 
                  onClick={handleConvert}
                  disabled={files.length === 0 || !modName || !modId}
                  className={`w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    files.length === 0 || !modName || !modId
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]'
                  }`}
                >
                  <Box className="w-5 h-5" />
                  Generate Mod File (.jar)
                </button>
              ) : status === 'processing' ? (
                <button disabled className="w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 bg-neutral-800 text-neutral-400 cursor-not-allowed">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Packaging...
                </button>
              ) : (
                <div className="flex gap-3">
                  <button 
                    onClick={handleReset}
                    className="flex-1 py-3.5 rounded-xl font-medium bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
                  >
                    New Conversion
                  </button>
                  <a 
                    href={downloadUrl} 
                    download={`${modId}-${version}.jar`}
                    className="flex-[2] py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                  >
                    <Download className="w-5 h-5" />
                    Download ({modId}.jar)
                  </a>
                </div>
              )}

              {status === 'error' && (
                <p className="text-red-400 text-sm mt-3 text-center">{errorMessage}</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2 mt-12 space-y-8 border-t border-neutral-800 pt-12">
          <section className="bg-neutral-900/30 rounded-2xl p-8 border border-neutral-800/50">
            <h2 className="text-xl font-bold text-white mb-4">About RPtM Converter</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">
              RPtM Converter is a free, browser-based tool designed to instantly convert Minecraft resource packs into functional Fabric mods. Now you can simply drag and drop your resource pack files, and we will package them into a ready-to-use mod.
            </p>
            <p className="text-neutral-300 leading-relaxed">
              Because all processing is done locally within your browser using JavaScript, your files are completely secure and are never uploaded to any external servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-800">
                <h3 className="text-lg font-semibold text-indigo-400 mb-2">Do I need to install anything?</h3>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  You do not need to install any software to use the converter. However, to run the generated mod in Minecraft, you must install the <a href="https://modrinth.com/mod/rptmlib/" target="_blank" rel="noreferrer" className="text-amber-400 font-semibold hover:underline">RPtMLib</a> dependency in your mods folder alongside your new generated mod.
                </p>
              </div>

              <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-800">
                <h3 className="text-lg font-semibold text-indigo-400 mb-2">Is RPtM Converter open source?</h3>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  Yes! Both the RPtM Converter website and the required RPtMLib mod are fully open-source. You can view the source code, report issues, or contribute to the project. <a href="https://github.com/Runteryaa/RPtM" target="_blank" rel="noreferrer" className="text-white underline hover:text-indigo-400">RPtMLib GitHub</a> <a href="https://github.com/Runteryaa/RPtM-Converter" target="_blank" rel="noreferrer" className="text-white underline hover:text-indigo-400">RPtM Converter GitHub</a>.
                </p>
              </div>
              
              <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-800">
                <h3 className="text-lg font-semibold text-indigo-400 mb-2">Can I merge multiple resource packs?</h3>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  Yes! You can upload multiple resource pack files at once. The converter will automatically merge them into a single RPtM mod. You can even choose which uploaded pack's icon to use for the final mod.
                </p>
              </div>

              <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-800">
                <h3 className="text-lg font-semibold text-indigo-400 mb-2">Is my data safe?</h3>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  Absolutely. The conversion process is entirely client-side. Your resource packs are processed using your device's memory and are never transmitted across the internet.
                </p>
              </div>

              <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-800">
                <h3 className="text-lg font-semibold text-indigo-400 mb-2">Does this support Forge or NeoForge?</h3>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  Currently, the RPtM Converter specifically generates mods for the Fabric mod loader. The generated `.jar` file requires the Fabric API and <a href="https://modrinth.com/mod/rptmlib/" target="_blank" rel="noreferrer" className="text-amber-400 font-semibold hover:underline">RPtMLib</a> to function correctly in-game.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
