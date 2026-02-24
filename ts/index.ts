import { initSync } from "../pkg/whatsapp_rust_bridge.js";

import { base64Wasm } from "./macro.js" with { type: "macro" };

type WasmFlavor = "simd" | "compat";

interface EmbeddedWasmPayloads {
  simd: string;
  compat: string;
}

const wasmPayloads = base64Wasm() as EmbeddedWasmPayloads;
const wasmBytes: Record<WasmFlavor, Uint8Array> = {
  simd: base64ToUint8Array(wasmPayloads.simd),
  compat: base64ToUint8Array(wasmPayloads.compat),
};

const forcedFlavor = readEnvOverride();
initializeWasm(forcedFlavor);

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function readEnvOverride(): WasmFlavor | undefined {
  const compatFlag = readEnvFlag("WHATSAPP_RUST_BRIDGE_FORCE_COMPAT");
  const simdFlag = readEnvFlag("WHATSAPP_RUST_BRIDGE_FORCE_SIMD");

  if (compatFlag && simdFlag) {
    console.warn("[whatsapp-rust-bridge] Both WHATSAPP_RUST_BRIDGE_FORCE_COMPAT and WHATSAPP_RUST_BRIDGE_FORCE_SIMD are set. Defaulting to SIMD.");
    return "simd";
  }

  if (compatFlag) {
    return "compat";
  }

  if (simdFlag) {
    return "simd";
  }

  return undefined;
}

function readEnvFlag(name: string): boolean {
  if (typeof process === "undefined" || !process?.env) {
    return false;
  }

  const raw = process.env[name];
  if (raw === undefined) {
    return false;
  }

  const normalized = raw.trim().toLowerCase();
  if (normalized === "" || normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") {
    return false;
  }

  return true;
}

function initializeWasm(preferred?: WasmFlavor): WasmFlavor {
  if (preferred) {
    initSync({ module: wasmBytes[preferred] });
    if (preferred === "compat") {
      console.warn("[whatsapp-rust-bridge] Forced compatibility WASM selected via environment. SIMD optimizations are disabled.");
    }
    return preferred;
  }

  try {
    initSync({ module: wasmBytes.simd });
    return "simd";
  } catch (error) {
    if (!shouldFallbackToCompat(error)) {
      throw error;
    }

    console.warn(
      "[whatsapp-rust-bridge] WebAssembly SIMD is unavailable in the current runtime. Falling back to the compatibility build. Set WHATSAPP_RUST_BRIDGE_FORCE_SIMD=1 to override (requires a host with SIMD support)."
    );

    initSync({ module: wasmBytes.compat });
    return "compat";
  }
}

function shouldFallbackToCompat(error: unknown): boolean {
  if (typeof WebAssembly !== "undefined" && error instanceof WebAssembly.CompileError) {
    return includesSimdMessage(error.message);
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "");
    return includesSimdMessage(message);
  }

  return false;
}

function includesSimdMessage(message: string): boolean {
  return /simd/i.test(message) || /wasm feature/i.test(message);
}

export * from "../pkg/whatsapp_rust_bridge.js";
