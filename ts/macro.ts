import { readFileSync } from "fs";

const toBase64 = (bytes: Uint8Array) => {
  if (typeof (bytes as any).toBase64 === "function") {
    return (bytes as any).toBase64();
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  throw new Error("Unable to convert WASM bytes to base64: missing Buffer and toBase64 helpers.");
};

const readWasm = (path: string) => toBase64(readFileSync(path));

export const base64Wasm = () => ({
  simd: readWasm("./pkg/whatsapp_rust_bridge_bg_simd.wasm"),
  compat: readWasm("./pkg/whatsapp_rust_bridge_bg_compat.wasm"),
});
