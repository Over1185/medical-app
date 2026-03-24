import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Carga variables de entorno desde .env para tests de integracion.
 */
export function loadEnvFromDotEnvFile(): void {
    const envPath = resolve(process.cwd(), ".env");

    if (!existsSync(envPath)) {
        throw new Error("No se encontro el archivo .env en la raiz del proyecto");
    }

    const content = readFileSync(envPath, "utf8");

    for (const rawLine of content.split("\n")) {
        const line = rawLine.trim();

        if (!line || line.startsWith("#")) {
            continue;
        }

        const separatorIndex = line.indexOf("=");

        if (separatorIndex <= 0) {
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        process.env[key] = value;
    }
}
