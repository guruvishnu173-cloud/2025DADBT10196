import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function ParticleField() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 140;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    // Warm orange: oklch(0.76 0.16 45) ≈ #d97706
    const orange = new THREE.Color("#d97706");
    // Muted warm: near #8b6342
    const muted = new THREE.Color("#8b6342");
    // Dim grey highlight
    const grey = new THREE.Color("#4a4540");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;

      const mix = Math.random();
      let c: THREE.Color;
      if (mix < 0.25) c = orange;
      else if (mix < 0.5) c = muted;
      else c = grey;

      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.04;
    meshRef.current.rotation.x = Math.sin(t * 0.025) * 0.12;
    meshRef.current.position.y = Math.sin(t * 0.3) * 0.18;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        vertexColors
        transparent
        opacity={0.72}
        sizeAttenuation
      />
    </points>
  );
}

function FloatingOrbs() {
  const orbsRef = useRef<THREE.Group>(null);

  const orbs = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 16,
      y: (Math.random() - 0.5) * 8,
      z: -2 - Math.random() * 4,
      scale: 0.08 + Math.random() * 0.18,
      speed: 0.18 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!orbsRef.current) return;
    const t = clock.getElapsedTime();
    orbsRef.current.children.forEach((child, i) => {
      const orb = orbs[i];
      child.position.y = orb.y + Math.sin(t * orb.speed + orb.phase) * 0.55;
      child.position.x =
        orb.x + Math.cos(t * orb.speed * 0.6 + orb.phase) * 0.25;
    });
  });

  return (
    <group ref={orbsRef}>
      {orbs.map((orb) => (
        <mesh key={orb.id} position={[orb.x, orb.y, orb.z]} scale={orb.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={orb.id % 2 === 0 ? "#d97706" : "#8b6342"}
            emissive={orb.id % 2 === 0 ? "#d97706" : "#6b4c2a"}
            emissiveIntensity={0.4}
            transparent
            opacity={0.35}
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function FloatingParticles() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#d97706" />
        <pointLight position={[-5, -3, 3]} intensity={0.4} color="#8b6342" />
        <ParticleField />
        <FloatingOrbs />
      </Canvas>
    </div>
  );
}
