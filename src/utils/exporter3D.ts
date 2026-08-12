import * as THREE from 'three';

/**
 * Utility to export Three.js Scene/Group objects to ASCII OBJ and ASCII STL formats
 * for import into SolidWorks, 3ds Max, Blender, KeyShot, etc.
 */

export function exportGroupToOBJ(group: THREE.Group | THREE.Scene, filename: string = 'model.obj'): string {
  let output = `# SolidWorks Master 3D Exporter - OBJ File\n`;
  output += `# Exported on ${new Date().toISOString()}\n\n`;

  let vertexOffset = 1;

  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const geometry = mesh.geometry.clone();
      
      // Apply world matrix transformation
      mesh.updateMatrixWorld(true);
      geometry.applyMatrix4(mesh.matrixWorld);

      // Convert buffer geometry to non-indexed if needed
      const posAttr = geometry.attributes.position;
      const normalAttr = geometry.attributes.normal;
      const indexAttr = geometry.index;

      output += `o ${mesh.name || 'Part_' + mesh.id}\n`;

      // Vertices
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = posAttr.getZ(i);
        output += `v ${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}\n`;
      }

      // Normals
      if (normalAttr) {
        for (let i = 0; i < normalAttr.count; i++) {
          const nx = normalAttr.getX(i);
          const ny = normalAttr.getY(i);
          const nz = normalAttr.getZ(i);
          output += `vn ${nx.toFixed(6)} ${ny.toFixed(6)} ${nz.toFixed(6)}\n`;
        }
      }

      // Faces
      if (indexAttr) {
        for (let i = 0; i < indexAttr.count; i += 3) {
          const a = indexAttr.getX(i) + vertexOffset;
          const b = indexAttr.getX(i + 1) + vertexOffset;
          const c = indexAttr.getX(i + 2) + vertexOffset;
          output += `f ${a} ${b} ${c}\n`;
        }
      } else {
        for (let i = 0; i < posAttr.count; i += 3) {
          const a = i + vertexOffset;
          const b = i + 1 + vertexOffset;
          const c = i + 2 + vertexOffset;
          output += `f ${a} ${b} ${c}\n`;
        }
      }

      vertexOffset += posAttr.count;
      output += `\n`;
    }
  });

  return output;
}

export function exportGroupToSTL(group: THREE.Group | THREE.Scene, filename: string = 'model.stl'): string {
  let output = `solid SolidWorksMasterModel\n`;

  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const geometry = mesh.geometry.clone();
      
      mesh.updateMatrixWorld(true);
      geometry.applyMatrix4(mesh.matrixWorld);

      const posAttr = geometry.attributes.position;
      const normalAttr = geometry.attributes.normal;
      const indexAttr = geometry.index;

      const getVertex = (i: number) => new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      const getNormal = (i: number) => normalAttr ? new THREE.Vector3(normalAttr.getX(i), normalAttr.getY(i), normalAttr.getZ(i)) : new THREE.Vector3(0, 1, 0);

      const addFacet = (v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3, norm: THREE.Vector3) => {
        output += `  facet normal ${norm.x.toFixed(6)} ${norm.y.toFixed(6)} ${norm.z.toFixed(6)}\n`;
        output += `    outer loop\n`;
        output += `      vertex ${v1.x.toFixed(6)} ${v1.y.toFixed(6)} ${v1.z.toFixed(6)}\n`;
        output += `      vertex ${v2.x.toFixed(6)} ${v2.y.toFixed(6)} ${v2.z.toFixed(6)}\n`;
        output += `      vertex ${v3.x.toFixed(6)} ${v3.y.toFixed(6)} ${v3.z.toFixed(6)}\n`;
        output += `    endloop\n`;
        output += `  endfacet\n`;
      };

      if (indexAttr) {
        for (let i = 0; i < indexAttr.count; i += 3) {
          const idx1 = indexAttr.getX(i);
          const idx2 = indexAttr.getX(i + 1);
          const idx3 = indexAttr.getX(i + 2);
          const v1 = getVertex(idx1);
          const v2 = getVertex(idx2);
          const v3 = getVertex(idx3);
          const n = getNormal(idx1);
          addFacet(v1, v2, v3, n);
        }
      } else {
        for (let i = 0; i < posAttr.count; i += 3) {
          const v1 = getVertex(i);
          const v2 = getVertex(i + 1);
          const v3 = getVertex(i + 2);
          const n = getNormal(i);
          addFacet(v1, v2, v3, n);
        }
      }
    }
  });

  output += `endsolid SolidWorksMasterModel\n`;
  return output;
}

export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
