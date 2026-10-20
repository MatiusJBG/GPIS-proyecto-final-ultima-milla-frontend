# Contrato consumido

Origen: MatiusJBG/GPIS-proyecto-final-ultima-milla-backend, commit 3fa336d08ef457958484a6012be93bcb4973e119, docs/contracts/openapi.yaml.
SHA-256 de los bytes UTF-8 publicados: `a71ead7ee35e67176861ea9dd09f7d979fda6598157e7c2cf167a37e527f03d4`.

La API devuelve listados mediante `{ items: [...] }` y altas mediante un objeto directo. Un 404/500/503 nunca significa listado vacío. El cliente rechaza respuestas incompatibles y utiliza deliveryDate/zoneId como filtros.

Al actualizar el contrato, copiar la revisión canónica, registrar commit/hash y ejecutar las pruebas HTTP. No editar esta copia para inventar otro contrato.
