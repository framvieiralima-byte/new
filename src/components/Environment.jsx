/**
 * Green floor, ambient light, and sun-like directional light with shadows.
 */
export default function Environment() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#7cb342" roughness={0.8} metalness={0.1} />
      </mesh>

      <ambientLight intensity={0.5} />

      <directionalLight
        position={[8, 16, 8]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />
    </>
  );
}
