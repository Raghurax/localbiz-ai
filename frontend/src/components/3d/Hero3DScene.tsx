import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hero3DScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 14);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x0284c7, 2.5); // Sky Blue
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 2.0); // Emerald Green
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x06b6d4, 1.8, 20); // Cyan Point
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // 5. 3D Geometries & Meshes
    const group = new THREE.Group();
    scene.add(group);

    // Main Festive Torus Knot (Sky Blue / Cyan Specular Material)
    const torusGeometry = new THREE.TorusKnotGeometry(2.2, 0.65, 128, 32, 2, 3);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.45,
      wireframe: false,
    });
    const torusKnot = new THREE.Mesh(torusGeometry, torusMaterial);
    group.add(torusKnot);

    // Floating 3D Discount Spheres (Cyan & Emerald Green)
    const sphereCount = 8;
    const sphereGroup = new THREE.Group();
    const sphereMaterial1 = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Cyan
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.5,
    });
    const sphereMaterial2 = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Emerald Green
      roughness: 0.25,
      metalness: 0.65,
      transparent: true,
      opacity: 0.5,
    });

    const spheres: { mesh: THREE.Mesh; basePos: THREE.Vector3; speed: number }[] = [];

    for (let i = 0; i < sphereCount; i++) {
      const radius = 0.3 + Math.random() * 0.45;
      const geom = new THREE.SphereGeometry(radius, 32, 32);
      const mat = i % 2 === 0 ? sphereMaterial1 : sphereMaterial2;
      const mesh = new THREE.Mesh(geom, mat);

      const angle = (i / sphereCount) * Math.PI * 2;
      const dist = 4.2 + Math.random() * 1.5;
      const basePos = new THREE.Vector3(
        Math.cos(angle) * dist,
        Math.sin(angle) * dist + (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 3
      );
      mesh.position.copy(basePos);
      sphereGroup.add(mesh);
      spheres.push({ mesh, basePos, speed: 0.5 + Math.random() * 0.8 });
    }
    group.add(sphereGroup);

    // 6. Particle Field (Sky Blue Nebula effect)
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 22;
      particlePositions[i + 1] = (Math.random() - 0.5) * 22;
      particlePositions[i + 2] = (Math.random() - 0.5) * 15;
      particleScales[i / 3] = Math.random();
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8, // Sky Blue
      size: 0.1,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 7. Mouse Interaction & Parallax
    let targetX = 0;
    let targetY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (event.clientX - windowHalfX) / windowHalfX;
      mouseY = (event.clientY - windowHalfY) / windowHalfY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Group rotation & tilt
      torusKnot.rotation.x = elapsedTime * 0.35 + targetY * 0.5;
      torusKnot.rotation.y = elapsedTime * 0.45 + targetX * 0.5;

      group.rotation.y = targetX * 0.3;
      group.rotation.x = -targetY * 0.3;

      // Spheres float wave animation
      spheres.forEach((item, idx) => {
        item.mesh.position.y = item.basePos.y + Math.sin(elapsedTime * item.speed + idx) * 0.4;
        item.mesh.position.x = item.basePos.x + Math.cos(elapsedTime * item.speed * 0.8 + idx) * 0.2;
        item.mesh.rotation.y += 0.01;
      });

      // Particles rotation
      particleSystem.rotation.y = elapsedTime * 0.04;
      particleSystem.rotation.x = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometryDispose(torusGeometry);
      torusMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  const geometryDispose = (geom: THREE.BufferGeometry) => {
    geom.dispose();
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-40"
    />
  );
};
