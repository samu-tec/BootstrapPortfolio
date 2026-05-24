// Utilidades de path compartidas por build, dev-server y validate.
import path from "node:path";

// Devuelve true si `child` está dentro de `parent` (mismo path o subcarpeta).
// path.relative produce "" cuando son el mismo path, y un string que empieza
// por ".." (o es absoluto en Windows) cuando child queda fuera de parent.
export function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
