import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Question } from '../types';
import mrJooThroneDefault from '../assets/images/mr_joo_throne.jpg';
import mrJooEmblemDefault from '../assets/images/mr_joo_emblem.jpg';
import { Crown, Sparkles, Eye, Maximize2, Minimize2, RotateCcw, Compass, ArrowRight, CheckCircle2, XCircle, Image as ImageIcon, Upload, RefreshCw } from 'lucide-react';

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
}

export type RealmTier = 'throne' | 'astral';

// Texture generator for the 3D floating option cubes
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

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  if (state === 'correct') {
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(0.5, '#022c22');
    grad.addColorStop(1, '#052e16');
  } else if (state === 'wrong') {
    grad.addColorStop(0, '#7f1d1d');
    grad.addColorStop(0.5, '#450a0a');
    grad.addColorStop(1, '#3b0707');
  } else if (state === 'selected') {
    grad.addColorStop(0, '#78350f');
    grad.addColorStop(0.5, '#451a03');
    grad.addColorStop(1, '#291002');
  } else {
    // Normal style according to realm tier
    if (realmTier === 'astral') {
      grad.addColorStop(0, '#082f49');
      grad.addColorStop(0.5, '#0c192c');
      grad.addColorStop(1, '#030712');
    } else {
      grad.addColorStop(0, '#1c1208');
      grad.addColorStop(0.5, '#0d0905');
      grad.addColorStop(1, '#030202');
    }
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Regal Golden or Cyan Border
  ctx.lineWidth = 18;
  if (state === 'correct') ctx.strokeStyle = '#10b981';
  else if (state === 'wrong') ctx.strokeStyle = '#ef4444';
  else if (state === 'selected') ctx.strokeStyle = '#f59e0b';
  else ctx.strokeStyle = realmTier === 'astral' ? '#00e5ff' : '#f59e0b';
  ctx.strokeRect(12, 12, 488, 488);

  // Inner decorative accent frame
  ctx.lineWidth = 4;
  ctx.strokeStyle = state === 'correct' ? '#10b98166' : realmTier === 'astral' ? '#00e5ff66' : '#f59e0b66';
  ctx.strokeRect(28, 28, 456, 456);

  // Option Letter Badge (A, B, C, D)
  ctx.fillStyle =
    state === 'correct'
      ? '#34d399'
      : state === 'wrong'
      ? '#f87171'
      : state === 'selected'
      ? '#fbbf24'
      : realmTier === 'astral'
      ? '#38bdf8'
      : '#fbbf24';
  ctx.font = '900 120px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 256, 140);

  // Divider Line
  ctx.strokeStyle = state === 'correct' ? '#10b98188' : realmTier === 'astral' ? '#00e5ff66' : '#f59e0b66';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(70, 230);
  ctx.lineTo(442, 230);
  ctx.stroke();

  // Arabic Option Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  let line = '';
  let y = 305;
  const maxWidth = 420;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), 256, y);
      line = words[i] + ' ';
      y += 52;
      if (y > 450) break;
    } else {
      line = testLine;
    }
  }
  if (y <= 450 && line.trim()) {
    ctx.fillText(line.trim(), 256, y);
  }

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

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 3.2, 7.8);
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

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 3.5;
    controls.maxDistance = 14;
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

      // 3D Floating Cube
      const cubeGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
      const optText = currentQuestion?.options[idx] || `الخيار ${optionLetters[idx]}`;
      const cubeTex = createOptionCanvasTexture(optionLetters[idx], optText, 'normal', realmTier);

      const cubeMat = new THREE.MeshStandardMaterial({
        map: cubeTex,
        roughness: 0.2,
        metalness: 0.6,
      });

      const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
      cubeMesh.position.set(0, 2.2, 0);
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

    // 12. Pointer Raycasting
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

    // 13. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      controls.autoRotate = isAutoRotate;
      controls.autoRotateSpeed = 1.0;
      controls.update();

      if (crownMeshRef.current) {
        crownMeshRef.current.rotation.y = elapsed * 0.7;
        crownMeshRef.current.position.y = 4.9 + Math.sin(elapsed * 2) * 0.08;
      }

      cubeMeshes.forEach((mesh, idx) => {
        mesh.rotation.y = elapsed * 0.6 + idx;
        mesh.position.y = 2.2 + Math.sin(elapsed * 2.5 + idx) * 0.08;
      });

      const posAttr = emberGeo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < emberCount; i++) {
        arr[i * 3 + 1] += emberVel[i] * 0.015;
        if (arr[i * 3 + 1] > 8) {
          arr[i * 3 + 1] = 0.1;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 14. Resize listener
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

  // Camera presets
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 3.2, 7.8);
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
        className="w-full h-[480px] sm:h-[580px] lg:h-[640px] cursor-grab active:cursor-grabbing relative"
      />

      {/* Top Floating Realm Badge & Camera Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        
        {/* Left: Prominent MRJOOWORLD Badge (Replaces old text exactly as requested) */}
        <div className="pointer-events-auto flex items-center gap-2 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/50 shadow-[0_4px_25px_rgba(245,158,11,0.35)]">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-400 ring-2 ring-amber-500/40 shadow-sm shrink-0">
            <img
              src={realmTier === 'throne' ? activeThroneSrc : activeEmblemSrc}
              alt="MR JOO"
              className="w-full h-full object-cover object-top transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 text-sm sm:text-base font-cinzel select-none drop-shadow-[0_2px_10px_rgba(245,158,11,0.6)]">
              MRJOOWORLD
            </span>

            {/* Quick Photo Upload & Customization Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="p-1 rounded-full text-amber-300/80 hover:text-amber-200 hover:bg-white/10 transition-colors ml-0.5"
              title="تخصيص ورفع صور MR JOO الشخصية"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Camera Presets & Realm Switcher */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-2xl border border-slate-700 shadow-md">
          {/* Realm Toggle Button */}
          <button
            onClick={handleToggleRealm}
            title="تبديل الصرح واللون والصورة الحالية"
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              realmTier === 'astral'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500/30'
            }`}
          >
            {realmTier === 'astral' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">الأفق النجمي</span>
              </>
            ) : (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">العرش الملكي</span>
              </>
            )}
          </button>

          <button
            onClick={handleResetCamera}
            title="المنظور الرئيسي"
            className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">الرئيسي</span>
          </button>

          <button
            onClick={handleFocusThrone}
            title="التقريب من الصرح"
            className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">الصرح</span>
          </button>

          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            title="دوران سينمائي 360°"
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              isAutoRotate ? 'bg-amber-500 text-black shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">سينمائي</span>
          </button>

          <button
            onClick={() => setIsUiCollapsed(!isUiCollapsed)}
            title={isUiCollapsed ? 'إظهار الأسئلة' : 'إخفاء الواجهة للمشاهدة الكاملة'}
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

      {/* Bottom Floating Sleek Options Dock */}
      {!isUiCollapsed && currentQuestion && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-8 sm:right-8 z-10">
          <div className="bg-slate-950/90 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-2.5 sm:p-3 shadow-[0_10px_35px_rgba(0,0,0,0.9)] max-w-3xl mx-auto">
            {/* Options grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {currentQuestion.options.map((opt, idx) => {
                const isSel = selectedOption === idx;
                const isCorr = isAnswered && idx === currentQuestion.correctIndex;
                const isWrong = isAnswered && isSel && !isCorr;

                let style =
                  'border-slate-700/80 bg-slate-900/70 hover:border-amber-400/60 hover:bg-slate-800 text-slate-200';
                if (isCorr) {
                  style = 'border-emerald-400 bg-emerald-950/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
                } else if (isWrong) {
                  style = 'border-red-400 bg-red-950/80 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
                } else if (isSel) {
                  style = 'border-amber-400 bg-amber-950/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!isAnswered) {
                        onSelectOption(idx);
                        if (onPlaySound) onPlaySound('button_click');
                      }
                    }}
                    disabled={isAnswered}
                    className={`flex items-center gap-2 p-2 rounded-xl text-right transition-all border text-xs font-bold active:scale-98 ${style}`}
                  >
                    <span className="w-5 h-5 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-[10px] font-black shrink-0">
                      {optionLetters[idx]}
                    </span>
                    <span className="truncate leading-tight">{opt}</span>
                    {isCorr && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />}
                    {isWrong && <XCircle className="w-3.5 h-3.5 text-red-400 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Next question action banner if answered */}
            {isAnswered && (
              <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <span className={`text-xs font-black flex items-center gap-1.5 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      إجابة صحيحة! صرح MRJOOWORLD يحتفي بذكائك
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-400" />
                      إجابة خاطئة! الإجابة الصحيحة هي: {currentQuestion.options[currentQuestion.correctIndex]}
                    </>
                  )}
                </span>
                <button
                  onClick={onNextQuestion}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-1"
                >
                  <span>السؤال التالي</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
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
