import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Question } from '../types';
import mrJooThroneDefault from '../assets/images/mr_joo_throne.jpg';
import mrJooEmblemDefault from '../assets/images/mr_joo_emblem.jpg';
import { Crown, Sparkles, Eye, Maximize2, Minimize2, RotateCcw, Compass, ArrowRight, CheckCircle2, XCircle, Image as ImageIcon, Upload, RefreshCw, Palette, Sliders } from 'lucide-react';

interface VirtualWorld3DProps {
  currentQuestion: Question | null;
  selectedOption: number | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  onSelectOption: (index: number) => void;
  onNextQuestion: () => void;
  onPlaySound?: (soundType: 'button_click' | 'correct' | 'wrong') => void;
  questionNumber: number;
  totalCorrect?: number;
  onOpenMasterControl?: () => void;
}

export type RealmTier = 'throne' | 'astral';

// Texture generator for the 3D floating option cubes with pristine high contrast and readable typography
function createOptionCanvasTexture(
  letter: string,
  text: string,
  state: 'normal' | 'selected' | 'correct' | 'wrong',
  realmTier: RealmTier
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // High contrast background palette: deep velvety contrast with crisp neon rims
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  if (state === 'correct') {
    grad.addColorStop(0, '#042f2e');
    grad.addColorStop(0.5, '#022c22');
    grad.addColorStop(1, '#064e3b');
  } else if (state === 'wrong') {
    grad.addColorStop(0, '#450a0a');
    grad.addColorStop(0.5, '#290606');
    grad.addColorStop(1, '#1c0303');
  } else if (state === 'selected') {
    grad.addColorStop(0, '#451a03');
    grad.addColorStop(0.5, '#291002');
    grad.addColorStop(1, '#170801');
  } else {
    // Normal style according to realm tier: velvety obsidian with crisp contrast
    if (realmTier === 'astral') {
      grad.addColorStop(0, '#031730');
      grad.addColorStop(0.5, '#020b18');
      grad.addColorStop(1, '#01050e');
    } else {
      grad.addColorStop(0, '#1c1005');
      grad.addColorStop(0.5, '#0d0702');
      grad.addColorStop(1, '#050201');
    }
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Outer Crisp Glowing Border
  ctx.lineWidth = 18;
  if (state === 'correct') ctx.strokeStyle = '#10b981';
  else if (state === 'wrong') ctx.strokeStyle = '#ef4444';
  else if (state === 'selected') ctx.strokeStyle = '#f59e0b';
  else ctx.strokeStyle = realmTier === 'astral' ? '#38bdf8' : '#fbbf24';
  ctx.strokeRect(9, 9, 494, 494);

  // Inner Subtle Golden Accent Line
  ctx.lineWidth = 4;
  ctx.strokeStyle = state === 'correct' ? '#34d39966' : realmTier === 'astral' ? '#38bdf866' : '#f59e0b66';
  ctx.strokeRect(22, 22, 468, 468);

  // Circular Option Letter Badge (A, B, C, D)
  const badgeColor =
    state === 'correct'
      ? '#059669'
      : state === 'wrong'
      ? '#dc2626'
      : state === 'selected'
      ? '#d97706'
      : realmTier === 'astral'
      ? '#0284c7'
      : '#b45309';

  ctx.fillStyle = badgeColor;
  ctx.beginPath();
  ctx.arc(256, 115, 62, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Letter inside circle
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 70px Cairo, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 256, 117);

  // Divider Line
  ctx.strokeStyle = '#ffffff44';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(50, 205);
  ctx.lineTo(462, 205);
  ctx.stroke();

  // Arabic Option Text - Prominent, Extra Bold and High Contrast
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px Cairo, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Text shadow to pop clearly against 3D reflections
  ctx.shadowColor = 'rgba(0,0,0,0.98)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  const words = text.split(' ');
  let line = '';
  let y = 285;
  const maxWidth = 430;
  const lineHeight = 62;

  // Render text lines with dual pass: dark thick stroke for razor-sharp edge contrast, then solid fill
  const linesToDraw: { text: string; y: number }[] = [];
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      linesToDraw.push({ text: line.trim(), y });
      line = words[i] + ' ';
      y += lineHeight;
      if (y > 460) break;
    } else {
      line = testLine;
    }
  }
  if (y <= 475 && line.trim()) {
    linesToDraw.push({ text: line.trim(), y });
  }

  // Pass 1: Heavy black contour for max readability
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  linesToDraw.forEach((l) => {
    ctx.strokeText(l.text, 256, l.y);
  });

  // Pass 2: Crisp brilliant white core fill
  ctx.fillStyle = '#ffffff';
  linesToDraw.forEach((l) => {
    ctx.fillText(l.text, 256, l.y);
  });

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const VirtualWorld3D: React.FC<VirtualWorld3DProps> = ({
  currentQuestion,
  selectedOption,
  isAnswered,
  isCorrect,
  onSelectOption,
  onNextQuestion,
  onPlaySound,
  questionNumber,
  totalCorrect = 0,
  onOpenMasterControl,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // 3D Objects references
  const crownMeshRef = useRef<THREE.Group | null>(null);
  const cubesMeshesRef = useRef<THREE.Mesh[]>([]);
  const podiumLightsRef = useRef<THREE.PointLight[]>([]);
  const portraitMeshRef = useRef<THREE.Mesh | null>(null);
  const archMeshRef = useRef<THREE.Mesh | null>(null);
  const throneSpotRef = useRef<THREE.SpotLight | null>(null);
  const backRimLightRef = useRef<THREE.PointLight | null>(null);
  const torchLightsRef = useRef<THREE.PointLight[]>([]);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const emberMatRef = useRef<THREE.PointsMaterial | null>(null);

  // 3D Rose Petals references
  const petalGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const petalPositionsRef = useRef<Float32Array | null>(null);
  const petalVelocitiesRef = useRef<Float32Array | null>(null);
  const petalColorsRef = useRef<Float32Array | null>(null);
  const petalActiveRef = useRef<boolean>(false);

  // Function to burst 3D rose petals in red, violet, white, and gold from the correct/selected cube
  const triggerPetalBurst = (optionIdx: number, isWin: boolean) => {
    if (!petalPositionsRef.current || !petalVelocitiesRef.current || !petalGeoRef.current) return;
    const podiumXs = [-3.3, -1.1, 1.1, 3.3];
    const podiumZs = [0.8, 0.4, 0.4, 0.8];
    const originX = podiumXs[optionIdx] ?? 0;
    const originY = 2.2;
    const originZ = podiumZs[optionIdx] ?? 0.5;

    const count = petalPositionsRef.current.length / 3;
    const pos = petalPositionsRef.current;
    const vel = petalVelocitiesRef.current;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx] = originX + (Math.random() - 0.5) * 0.3;
      pos[idx + 1] = originY + (Math.random() - 0.5) * 0.3;
      pos[idx + 2] = originZ + (Math.random() - 0.5) * 0.3;

      // Radial speed and upward fountain
      const angle = Math.random() * Math.PI * 2;
      const elevation = Math.random() * Math.PI * 0.5;
      const speed = isWin ? 0.06 + Math.random() * 0.12 : 0.03 + Math.random() * 0.06;

      vel[idx] = Math.cos(angle) * Math.cos(elevation) * speed;
      vel[idx + 1] = Math.sin(elevation) * speed * 1.6 + (isWin ? 0.07 : 0.02);
      vel[idx + 2] = Math.sin(angle) * Math.cos(elevation) * speed;
    }

    (petalGeoRef.current.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    petalActiveRef.current = true;
  };

  // Textures cache
  const throneTextureRef = useRef<THREE.Texture | null>(null);
  const emblemTextureRef = useRef<THREE.Texture | null>(null);

  // Realm Tier & Settings
  // Alternates every 10 questions or when reaching major milestones (e.g. 50 correct answers)
  const [realmTier, setRealmTier] = useState<RealmTier>(() => {
    return Math.floor((questionNumber - 1) / 10) % 2 === 0 ? 'throne' : 'astral';
  });

  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [isUiCollapsed, setIsUiCollapsed] = useState<boolean>(false);
  const [elevationBanner, setElevationBanner] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Custom User Photos stored in localStorage
  const [customThronePhoto, setCustomThronePhoto] = useState<string | null>(() => {
    return localStorage.getItem('mr_joo_custom_throne_photo');
  });
  const [customEmblemPhoto, setCustomEmblemPhoto] = useState<string | null>(() => {
    return localStorage.getItem('mr_joo_custom_emblem_photo');
  });

  // Dynamic Ambient Color Shifting (Gradual live world hue rotation)
  const [isDynamicColorShift, setIsDynamicColorShift] = useState<boolean>(() => {
    return localStorage.getItem('mr_joo_dynamic_color_shift') !== 'false';
  });
  const dynamicColorShiftRef = useRef<boolean>(isDynamicColorShift);
  useEffect(() => {
    dynamicColorShiftRef.current = isDynamicColorShift;
  }, [isDynamicColorShift]);

  const activeThroneSrc = customThronePhoto || mrJooThroneDefault;
  const activeEmblemSrc = customEmblemPhoto || mrJooEmblemDefault;

  const optionLetters = ['A', 'B', 'C', 'D'];

  // -------------------------------------------------------------
  // Progression Logic: Check for Realm Elevation
  // -------------------------------------------------------------
  useEffect(() => {
    const calculatedTier: RealmTier = Math.floor((questionNumber - 1) / 10) % 2 === 0 ? 'throne' : 'astral';
    
    // Check if this is a milestone shift (e.g. question 11, 21, 31, etc.)
    if (calculatedTier !== realmTier) {
      setRealmTier(calculatedTier);
      const title =
        calculatedTier === 'astral'
          ? 'تجاوز مرحلة عُليا • صرح MRJOOWORLD النجمي ✨'
          : 'صرح MRJOOWORLD • قاعة العرش الملكي 👑';
      setElevationBanner(title);
      const timer = setTimeout(() => setElevationBanner(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [questionNumber]);

  // Check 50 correct answers milestone
  useEffect(() => {
    if (totalCorrect === 50) {
      setElevationBanner('🏆 الإنجاز الأسطوري الملكي! وصول ٥٠ إجابة صحيحة في MRJOOWORLD 👑');
      const timer = setTimeout(() => setElevationBanner(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [totalCorrect]);

  // -------------------------------------------------------------
  // Load Textures helper
  // -------------------------------------------------------------
  const loadTextures = useCallback(() => {
    const loader = new THREE.TextureLoader();

    const tThrone = loader.load(activeThroneSrc, () => {
      if (portraitMeshRef.current && realmTier === 'throne') {
        portraitMeshRef.current.material = new THREE.MeshStandardMaterial({
          map: tThrone,
          roughness: 0.25,
          metalness: 0.15,
        });
      }
    });
    tThrone.colorSpace = THREE.SRGBColorSpace;
    throneTextureRef.current = tThrone;

    const tEmblem = loader.load(activeEmblemSrc, () => {
      if (portraitMeshRef.current && realmTier === 'astral') {
        portraitMeshRef.current.material = new THREE.MeshStandardMaterial({
          map: tEmblem,
          roughness: 0.25,
          metalness: 0.15,
        });
      }
    });
    tEmblem.colorSpace = THREE.SRGBColorSpace;
    emblemTextureRef.current = tEmblem;
  }, [activeThroneSrc, activeEmblemSrc, realmTier]);

  // -------------------------------------------------------------
  // THREE.JS INITIALIZATION
  // -------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 560;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(realmTier === 'astral' ? 0x020814 : 0x05040a);
    scene.fog = new THREE.FogExp2(realmTier === 'astral' ? 0x020814 : 0x05040a, 0.03);

    // 2. Camera - Expanded FOV and depth for a grand immersive royal perspective
    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 1000);
    camera.position.set(0, 3.4, 8.8);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls - Generous breathing room and depth
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 3.5;
    controls.maxDistance = 20;
    controls.target.set(0, 2.0, -1.5);
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(realmTier === 'astral' ? 0x0f2744 : 0x1f1728, 1.5);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfff1cf, 2.8);
    mainKeyLight.position.set(6, 14, 8);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    scene.add(mainKeyLight);

    // Throne Spotlight (Golden in Throne, Cyan in Astral)
    const throneSpot = new THREE.SpotLight(realmTier === 'astral' ? 0x00f0ff : 0xffb703, 4.8, 24, Math.PI / 5, 0.4);
    throneSpot.position.set(0, 9, -2);
    throneSpot.target.position.set(0, 2.8, -4.5);
    scene.add(throneSpot);
    scene.add(throneSpot.target);
    throneSpotRef.current = throneSpot;

    // Rim Light behind Dais (Crimson/Red in Throne, Astral Violet in Astral)
    const backRimLight = new THREE.PointLight(realmTier === 'astral' ? 0xa855f7 : 0xef4444, 4.0, 22);
    backRimLight.position.set(0, 4, -6.5);
    scene.add(backRimLight);
    backRimLightRef.current = backRimLight;

    // 6. Polished Marble Floor
    const floorGeo = new THREE.PlaneGeometry(36, 36, 1, 1);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: realmTier === 'astral' ? 0x030712 : 0x08060c,
      roughness: 0.15,
      metalness: 0.85,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Dynamic Floor Grid Lines
    const gridHelper = new THREE.GridHelper(
      32,
      16,
      realmTier === 'astral' ? 0x00e5ff : 0xf59e0b,
      realmTier === 'astral' ? 0x1e293b : 0x271a0c
    );
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // 7. Colonnade: 6 Imperial Columns flanking the royal hall
    const columnPositions = [
      [-4.6, 0, 3],
      [-4.6, 0, -1],
      [-4.6, 0, -5],
      [4.6, 0, 3],
      [4.6, 0, -1],
      [4.6, 0, -5],
    ];

    const colShaftMat = new THREE.MeshStandardMaterial({ color: 0x0b111e, roughness: 0.3, metalness: 0.7 });
    const colGoldMat = new THREE.MeshStandardMaterial({
      color: realmTier === 'astral' ? 0x38bdf8 : 0xf59e0b,
      roughness: 0.2,
      metalness: 0.9,
    });

    const torches: THREE.PointLight[] = [];

    columnPositions.forEach(([cx, cy, cz]) => {
      const colGroup = new THREE.Group();
      colGroup.position.set(cx, cy, cz);

      // Base
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 1.1), colGoldMat);
      base.position.y = 0.2;
      colGroup.add(base);

      // Shaft
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 6.5, 16), colShaftMat);
      shaft.position.y = 3.65;
      shaft.castShadow = true;
      colGroup.add(shaft);

      // Capital
      const capital = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 1.1), colGoldMat);
      capital.position.y = 7.1;
      colGroup.add(capital);

      // Sconce / Torch glowing on column
      const torchLight = new THREE.PointLight(realmTier === 'astral' ? 0x00e5ff : 0xff9900, 1.8, 9);
      torchLight.position.set(cx > 0 ? -0.5 : 0.5, 3.5, 0);
      colGroup.add(torchLight);
      torches.push(torchLight);

      scene.add(colGroup);
    });
    torchLightsRef.current = torches;

    // 8. The Grand Elevated Dais
    const daisGroup = new THREE.Group();
    daisGroup.position.set(0, 0, -4.5);

    const stepMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.8 });
    const stepGoldTrim = new THREE.MeshStandardMaterial({
      color: realmTier === 'astral' ? 0x38bdf8 : 0xf59e0b,
      roughness: 0.2,
      metalness: 0.95,
    });

    [
      { r: 3.4, h: 0.25, y: 0.125 },
      { r: 2.7, h: 0.25, y: 0.375 },
      { r: 2.0, h: 0.25, y: 0.625 },
    ].forEach((s) => {
      const step = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r + 0.1, s.h, 32), stepMat);
      step.position.y = s.y;
      step.receiveShadow = true;
      daisGroup.add(step);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(s.r + 0.05, 0.03, 8, 32), stepGoldTrim);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = s.y + s.h / 2;
      daisGroup.add(ring);
    });

    scene.add(daisGroup);

    // 9. THE GRAND 3D ROYAL MONUMENT OF MR JOO
    const loader = new THREE.TextureLoader();
    const initialTextureSrc = realmTier === 'astral' ? activeEmblemSrc : activeThroneSrc;
    const initialTex = loader.load(initialTextureSrc);
    initialTex.colorSpace = THREE.SRGBColorSpace;

    const monumentGroup = new THREE.Group();
    monumentGroup.position.set(0, 0.75, -4.5);

    // Golden / Cyan Frame
    const frameMat = new THREE.MeshStandardMaterial({
      color: realmTier === 'astral' ? 0x00e5ff : 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
      emissive: realmTier === 'astral' ? 0x082f49 : 0x78350f,
      emissiveIntensity: 0.25,
    });

    const frameOuter = new THREE.Mesh(new THREE.BoxGeometry(3.15, 4.25, 0.22), frameMat);
    frameOuter.position.y = 2.4;
    frameOuter.castShadow = true;
    monumentGroup.add(frameOuter);

    // MR JOO High-Res Portrait Canvas in 3D
    const portraitGeo = new THREE.PlaneGeometry(2.8, 3.9);
    const portraitMat = new THREE.MeshStandardMaterial({
      map: initialTex,
      roughness: 0.25,
      metalness: 0.1,
    });
    const portraitMesh = new THREE.Mesh(portraitGeo, portraitMat);
    portraitMesh.position.set(0, 2.4, 0.13);
    monumentGroup.add(portraitMesh);
    portraitMeshRef.current = portraitMesh;

    // Rotating 3D Royal Crown above Monument
    const crownGroup = new THREE.Group();
    crownMeshRef.current = crownGroup;
    crownGroup.position.set(0, 4.9, 0);

    const crownCirc = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.42, 0.25, 16), frameMat);
    crownGroup.add(crownCirc);

    // 5 Crown Points with Jewel tips
    for (let p = 0; p < 5; p++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 8), frameMat);
      const angle = (p / 5) * Math.PI * 2;
      spike.position.set(Math.cos(angle) * 0.45, 0.28, Math.sin(angle) * 0.45);
      crownGroup.add(spike);

      const jewel = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshStandardMaterial({
          color: realmTier === 'astral' ? 0x38bdf8 : 0xef4444,
          roughness: 0.1,
          metalness: 0.9,
          emissive: realmTier === 'astral' ? 0x0284c7 : 0xb91c1c,
        })
      );
      jewel.position.set(Math.cos(angle) * 0.45, 0.48, Math.sin(angle) * 0.45);
      crownGroup.add(jewel);
    }
    monumentGroup.add(crownGroup);

    // Backdrop Archway (Alternating second photo as celestial stained glass portal)
    const archTextureSrc = realmTier === 'astral' ? activeThroneSrc : activeEmblemSrc;
    const archTex = loader.load(archTextureSrc);
    archTex.colorSpace = THREE.SRGBColorSpace;

    const archGeo = new THREE.PlaneGeometry(8.5, 7.5);
    const archMat = new THREE.MeshBasicMaterial({
      map: archTex,
      transparent: true,
      opacity: 0.4,
    });
    const archMesh = new THREE.Mesh(archGeo, archMat);
    archMesh.position.set(0, 4.2, -6.2);
    scene.add(archMesh);
    archMeshRef.current = archMesh;

    scene.add(monumentGroup);

    // 10. 4 INTERACTIVE 3D PODIUMS & CUBES
    const cubeMeshes: THREE.Mesh[] = [];
    const podiumLights: THREE.PointLight[] = [];

    const podiumXs = [-3.3, -1.1, 1.1, 3.3];
    const podiumZs = [0.4, 0.0, 0.0, 0.4];

    podiumXs.forEach((px, idx) => {
      const pz = podiumZs[idx];
      const pGroup = new THREE.Group();
      pGroup.position.set(px, 0, pz);

      const pedBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.3, 16), colShaftMat);
      pedBase.position.y = 0.15;
      pGroup.add(pedBase);

      const pedShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.2, 16), colShaftMat);
      pedShaft.position.y = 0.85;
      pedShaft.castShadow = true;
      pGroup.add(pedShaft);

      const pedCap = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.5, 0.2, 16), frameMat);
      pedCap.position.y = 1.5;
      pGroup.add(pedCap);

      const light = new THREE.PointLight(realmTier === 'astral' ? 0x00e5ff : 0xf59e0b, 1.8, 4);
      light.position.set(0, 1.8, 0);
      pGroup.add(light);
      podiumLights.push(light);

      // 3D Floating Cube - Enlarged for outstanding visibility and presence
      const cubeGeo = new THREE.BoxGeometry(1.05, 1.05, 1.05);
      const optText = currentQuestion?.options[idx] || `الخيار ${optionLetters[idx]}`;
      const cubeTex = createOptionCanvasTexture(optionLetters[idx], optText, 'normal', realmTier);

      const cubeMat = new THREE.MeshStandardMaterial({
        map: cubeTex,
        roughness: 0.15,
        metalness: 0.65,
      });

      const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
      cubeMesh.position.set(0, 2.3, 0);
      cubeMesh.userData = { optionIndex: idx };
      cubeMesh.castShadow = true;

      pGroup.add(cubeMesh);
      cubeMeshes.push(cubeMesh);
      scene.add(pGroup);
    });

    cubesMeshesRef.current = cubeMeshes;
    podiumLightsRef.current = podiumLights;

    // 11. Embers / Star Dust Particles
    const emberCount = 320;
    const emberGeo = new THREE.BufferGeometry();
    const emberPos = new Float32Array(emberCount * 3);
    const emberVel = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      emberPos[i * 3] = (Math.random() - 0.5) * 18;
      emberPos[i * 3 + 1] = Math.random() * 8;
      emberPos[i * 3 + 2] = (Math.random() - 0.5) * 16;
      emberVel[i] = 0.3 + Math.random() * 0.7;
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));

    const emberMat = new THREE.PointsMaterial({
      color: realmTier === 'astral' ? 0x38bdf8 : 0xf59e0b,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    emberMatRef.current = emberMat;
    const emberSystem = new THREE.Points(emberGeo, emberMat);
    scene.add(emberSystem);

    // 12. 3D Rose Petals Burst System (ورد أحمر وبنفسجي وأبيض وذهبي)
    const PETAL_COUNT = 240;
    const petalGeo = new THREE.BufferGeometry();
    const petalPositions = new Float32Array(PETAL_COUNT * 3);
    const petalVelocities = new Float32Array(PETAL_COUNT * 3);
    const petalColors = new Float32Array(PETAL_COUNT * 3);
    const petalRotations = new Float32Array(PETAL_COUNT);

    // Rose petals color palette: Red, Violet, Pearl White, Warm Gold
    const petalPalette = [
      new THREE.Color(0xf43f5e), // Rose red
      new THREE.Color(0xe11d48), // Deep ruby
      new THREE.Color(0xc084fc), // Violet
      new THREE.Color(0x9333ea), // Royal purple
      new THREE.Color(0xffffff), // Pearlescent white
      new THREE.Color(0xfbbf24), // Golden amber
    ];

    for (let i = 0; i < PETAL_COUNT; i++) {
      petalPositions[i * 3] = 0;
      petalPositions[i * 3 + 1] = -100; // Park off-screen
      petalPositions[i * 3 + 2] = 0;

      const c = petalPalette[i % petalPalette.length];
      petalColors[i * 3] = c.r;
      petalColors[i * 3 + 1] = c.g;
      petalColors[i * 3 + 2] = c.b;

      petalRotations[i] = Math.random() * Math.PI * 2;
    }

    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    petalGeo.setAttribute('color', new THREE.BufferAttribute(petalColors, 3));

    const petalMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const petalSystem = new THREE.Points(petalGeo, petalMat);
    scene.add(petalSystem);

    // Keep refs for animation
    petalGeoRef.current = petalGeo;
    petalPositionsRef.current = petalPositions;
    petalVelocitiesRef.current = petalVelocities;
    petalColorsRef.current = petalColors;

    // 13. High-Sensitivity Device Orientation Tilt (iPhone 11 & Mobile)
    let currentTiltX = 0;
    let currentTiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      // gamma (horizontal tilt left/right) [-45, 45]
      // beta (vertical tilt front/back) [20, 70]
      const clampedGamma = Math.max(-45, Math.min(45, e.gamma));
      const clampedBeta = Math.max(15, Math.min(75, e.beta));
      targetTiltX = (clampedGamma / 45) * 2.2; // Amplified gyro feel as requested
      targetTiltY = ((clampedBeta - 45) / 30) * 1.5;
    };

    window.addEventListener('deviceorientation', handleOrientation);

    // 14. Pointer Raycasting for 3D Box Taps
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(cubesMeshesRef.current);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const optIdx = hit.userData.optionIndex;
        if (typeof optIdx === 'number' && !isAnswered) {
          onSelectOption(optIdx);
          if (onPlaySound) onPlaySound('button_click');
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 15. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera tilt from gyroscope
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;

      controls.autoRotate = isAutoRotate;
      controls.autoRotateSpeed = 1.0;
      controls.update();

      // Apply subtle gyro shift to camera without breaking orbit controls
      camera.position.x += (currentTiltX * 0.02);
      camera.position.y += (currentTiltY * 0.015);

      // Dynamic gradual color shifting in world lighting
      if (dynamicColorShiftRef.current) {
        // Base hue cycle smoothly over ~90 seconds
        const baseHue = (elapsed * 0.012) % 1;
        
        // Gentle shifting for ambient light
        if (ambientLight) {
          ambientLight.color.setHSL(baseHue, 0.45, realmTier === 'astral' ? 0.22 : 0.18);
        }
        
        // Back rim light counter-shifts for rich dual-tone depth
        if (backRimLightRef.current) {
          const rimHue = (baseHue + 0.5) % 1;
          backRimLightRef.current.color.setHSL(rimHue, 0.85, 0.5);
        }

        // Torches dynamic flame modulation
        torchLightsRef.current.forEach((t, i) => {
          const flameFlicker = Math.sin(elapsed * 5 + i) * 0.2 + 1.6;
          t.intensity = flameFlicker;
        });
      }

      if (crownMeshRef.current) {
        crownMeshRef.current.rotation.y = elapsed * 0.7;
        crownMeshRef.current.position.y = 4.9 + Math.sin(elapsed * 2) * 0.08;
      }

      cubeMeshes.forEach((mesh, idx) => {
        mesh.rotation.y = elapsed * 0.6 + idx;
        mesh.position.y = 2.2 + Math.sin(elapsed * 2.5 + idx) * 0.08;
      });

      // Embers update
      const posAttr = emberGeo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < emberCount; i++) {
        arr[i * 3 + 1] += emberVel[i] * 0.015;
        if (arr[i * 3 + 1] > 8) {
          arr[i * 3 + 1] = 0.1;
        }
      }
      posAttr.needsUpdate = true;

      // Petals explosion animation (falling, fluttering, expanding)
      if (petalActiveRef.current && petalPositionsRef.current && petalVelocitiesRef.current && petalGeoRef.current) {
        const pos = petalPositionsRef.current;
        const vel = petalVelocitiesRef.current;
        for (let i = 0; i < PETAL_COUNT; i++) {
          const idx = i * 3;
          // Apply gravity and flutter
          vel[idx + 1] -= 0.003; // gravity
          pos[idx] += vel[idx] + Math.sin(elapsed * 4 + i) * 0.006;
          pos[idx + 1] += vel[idx + 1];
          pos[idx + 2] += vel[idx + 2] + Math.cos(elapsed * 4 + i) * 0.006;

          // Drag
          vel[idx] *= 0.985;
          vel[idx + 2] *= 0.985;
        }
        (petalGeoRef.current.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 16. Resize listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('deviceorientation', handleOrientation);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // -------------------------------------------------------------
  // DYNAMICALLY UPDATE SCENE WHEN REALM TIER CHANGES
  // -------------------------------------------------------------
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const activePortraitSrc = realmTier === 'astral' ? activeEmblemSrc : activeThroneSrc;
    const activeArchSrc = realmTier === 'astral' ? activeThroneSrc : activeEmblemSrc;

    // 1. Update Portrait Mesh
    loader.load(activePortraitSrc, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      if (portraitMeshRef.current) {
        (portraitMeshRef.current.material as THREE.MeshStandardMaterial).map = tex;
        (portraitMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
    });

    // 2. Update Background Archway
    loader.load(activeArchSrc, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      if (archMeshRef.current) {
        (archMeshRef.current.material as THREE.MeshBasicMaterial).map = tex;
        (archMeshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
      }
    });

    // 3. Update Lights
    if (throneSpotRef.current) {
      throneSpotRef.current.color.setHex(realmTier === 'astral' ? 0x00f0ff : 0xffb703);
    }
    if (backRimLightRef.current) {
      backRimLightRef.current.color.setHex(realmTier === 'astral' ? 0xa855f7 : 0xef4444);
    }
    torchLightsRef.current.forEach((t) => {
      t.color.setHex(realmTier === 'astral' ? 0x00e5ff : 0xff9900);
    });

    // 4. Update Embers & Scene Background
    if (emberMatRef.current) {
      emberMatRef.current.color.setHex(realmTier === 'astral' ? 0x38bdf8 : 0xf59e0b);
    }
    if (sceneRef.current) {
      const bgHex = realmTier === 'astral' ? 0x020814 : 0x05040a;
      sceneRef.current.background = new THREE.Color(bgHex);
      if (sceneRef.current.fog) {
        (sceneRef.current.fog as THREE.FogExp2).color.setHex(bgHex);
      }
    }
  }, [realmTier, activeThroneSrc, activeEmblemSrc]);

  // -------------------------------------------------------------
  // UPDATE 3D CUBES TEXTURE & LIGHTS WHEN QUESTION/ANSWER CHANGES
  // -------------------------------------------------------------
  useEffect(() => {
    if (!currentQuestion) return;

    cubesMeshesRef.current.forEach((mesh, idx) => {
      const isSel = selectedOption === idx;
      const isCorr = isAnswered && idx === currentQuestion.correctIndex;
      const isWrong = isAnswered && isSel && !isCorr;

      let state: 'normal' | 'selected' | 'correct' | 'wrong' = 'normal';
      if (isCorr) state = 'correct';
      else if (isWrong) state = 'wrong';
      else if (isSel) state = 'selected';

      const optText = currentQuestion.options[idx] || '';
      const newTex = createOptionCanvasTexture(optionLetters[idx], optText, state, realmTier);

      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.map = newTex;
      mat.needsUpdate = true;

      // Update light color
      const light = podiumLightsRef.current[idx];
      if (light) {
        if (isCorr) light.color.setHex(0x10b981);
        else if (isWrong) light.color.setHex(0xef4444);
        else if (isSel) light.color.setHex(0xf59e0b);
        else light.color.setHex(realmTier === 'astral' ? 0x00e5ff : 0xf59e0b);
      }
    });
  }, [currentQuestion?.id, selectedOption, isAnswered, isCorrect, realmTier]);

  // Trigger 3D rose petals burst when answered
  useEffect(() => {
    if (isAnswered && typeof selectedOption === 'number') {
      triggerPetalBurst(selectedOption, !!isCorrect);
    }
  }, [isAnswered, isCorrect, selectedOption]);

  // Camera presets
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 3.4, 8.8);
    controlsRef.current.target.set(0, 2.0, -1.5);
    setIsAutoRotate(false);
  };

  const handleFocusThrone = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 3.0, 1.5);
    controlsRef.current.target.set(0, 3.0, -4.5);
    setIsAutoRotate(false);
  };

  // Toggle realm manually
  const handleToggleRealm = () => {
    const next = realmTier === 'throne' ? 'astral' : 'throne';
    setRealmTier(next);
    setElevationBanner(
      next === 'astral'
        ? 'انتقلت إلى: صرح MRJOOWORLD النجمي ✨'
        : 'انتقلت إلى: قاعة العرش الملكي لـ MR JOO 👑'
    );
    setTimeout(() => setElevationBanner(null), 3000);
  };

  // Custom photo upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'throne' | 'emblem') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'throne') {
        localStorage.setItem('mr_joo_custom_throne_photo', dataUrl);
        setCustomThronePhoto(dataUrl);
      } else {
        localStorage.setItem('mr_joo_custom_emblem_photo', dataUrl);
        setCustomEmblemPhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetCustomPhotos = () => {
    localStorage.removeItem('mr_joo_custom_throne_photo');
    localStorage.removeItem('mr_joo_custom_emblem_photo');
    setCustomThronePhoto(null);
    setCustomEmblemPhoto(null);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-amber-500/40 shadow-[0_16px_60px_rgba(0,0,0,0.9)] bg-slate-950 select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="w-full h-[460px] sm:h-[530px] md:h-[580px] max-h-[calc(100dvh-130px)] cursor-grab active:cursor-grabbing relative"
      />

      {/* Top Floating Controls - Cleaned up to avoid clutter as requested */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-none z-10">
        <div className="pointer-events-auto flex items-center gap-1 bg-black/75 backdrop-blur-md p-1 rounded-2xl border border-slate-700/60 shadow-md">
          {/* Subtle View Toggle: Full View vs Question */}
          <button
            onClick={() => setIsUiCollapsed(!isUiCollapsed)}
            title={isUiCollapsed ? 'إظهار السؤال' : 'إخفاء الواجهة للمشاهدة الكاملة'}
            className="p-1.5 rounded-xl text-xs text-amber-300 hover:bg-slate-800 transition-all"
          >
            {isUiCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Realm Elevation Celebration Banner */}
      {elevationBanner && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce">
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs sm:text-sm px-5 py-2 rounded-full shadow-[0_0_35px_rgba(245,158,11,0.8)] border border-yellow-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black animate-spin" />
            <span>{elevationBanner}</span>
          </div>
        </div>
      )}

      {/* Top Center Question Bar */}
      {!isUiCollapsed && currentQuestion && (
        <div className="absolute top-16 left-3 right-3 sm:left-12 sm:right-12 z-10 pointer-events-none">
          <div className="bg-slate-950/85 backdrop-blur-xl border border-amber-400/40 rounded-2xl px-4 py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.85)] max-w-2xl mx-auto pointer-events-auto">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-500/20 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                  السؤال #{questionNumber}
                </span>
                <span className="text-[10px] text-amber-400/80 font-mono">
                  {realmTier === 'throne' ? 'المرحلة: العرش الملكي' : 'المرحلة: الأفق النجمي'}
                </span>
              </div>
              <span className="text-slate-300 text-[11px] font-semibold">
                {currentQuestion.category}
              </span>
              <span className="text-cyan-400 text-[10px] font-mono hidden sm:inline">
                المس المكعب 3D أو اختر بالأسفل
              </span>
            </div>
            <h3 className="text-xs sm:text-sm md:text-base font-black text-white text-center leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>
        </div>
      )}

      {/* Options Guidance / Answer Outcome */}
      {!isUiCollapsed && currentQuestion && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-8 sm:right-8 z-10 pointer-events-none">
          {/* Subtle touch hint when waiting for answer */}
          {!isAnswered && (
            <div className="flex items-center justify-center">
              <div className="bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[11px] text-slate-300 font-semibold shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>المس أي صندوق 3D للإجابة مباشرة</span>
              </div>
            </div>
          )}

          {/* Sleek Floating Next Question Capsule when Answered */}
          {isAnswered && (
            <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-2xl border border-amber-400/50 rounded-2xl p-2.5 sm:p-3 shadow-[0_10px_35px_rgba(0,0,0,0.95)] max-w-xl mx-auto flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 overflow-hidden text-right">
                {isCorrect ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>إجابة صحيحة! صرح MRJOOWORLD يحتفي بذكائك 👑</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs truncate">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="truncate">الإجابة الصحيحة: {currentQuestion.options[currentQuestion.correctIndex]}</span>
                  </div>
                )}
              </div>

              <button
                onClick={onNextQuestion}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] shrink-0 flex items-center gap-1"
              >
                <span>السؤال التالي</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Collapsed UI Notice */}
      {isUiCollapsed && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-400/50 text-xs font-bold text-amber-300 shadow-xl flex items-center gap-2">
          <span>المس الشاشة واستمتع بالتجول في صرح MRJOOWORLD الملكي 360°</span>
          <button
            onClick={() => setIsUiCollapsed(false)}
            className="text-white underline text-[11px] font-bold"
          >
            إظهار السؤال
          </button>
        </div>
      )}

      {/* Photo Customization Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-right">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                <span>تخصيص صور MR JOO الشخصية</span>
                <Crown className="w-4 h-4 text-amber-400" />
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              يمكنك هنا رفع ملفات صورك الأصلية من جهازك مباشرة (بدون أي تعديل) وسيتم عرضها فوراً على العرش والمحراب ثلاثي الأبعاد:
            </p>

            {/* Throne Photo Uploader */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400/80">المرحلة الأولى</span>
                <label className="text-xs font-bold text-slate-200">صورة العرش الملكي (Throne):</label>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400 shrink-0">
                  <img src={activeThroneSrc} alt="Throne" className="w-full h-full object-cover" />
                </div>
                <label className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>اختيار صورة من الجهاز</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'throne')}
                  />
                </label>
              </div>
            </div>

            {/* Emblem Photo Uploader */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-400/80">المرحلة العُليا</span>
                <label className="text-xs font-bold text-slate-200">صورة الهالة النجمية والتاج (Emblem):</label>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-cyan-400 shrink-0">
                  <img src={activeEmblemSrc} alt="Emblem" className="w-full h-full object-cover" />
                </div>
                <label className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>اختيار صورة من الجهاز</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'emblem')}
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={handleResetCustomPhotos}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
                title="استعادة الصور الافتراضية"
              >
                <RefreshCw className="w-3 h-3" />
                <span>الصور الافتراضية</span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs"
              >
                تم الحفظ والتطبيق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
