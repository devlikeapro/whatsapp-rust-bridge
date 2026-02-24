# whatsapp-rust-bridge

High-performance WhatsApp utilities powered by Rust and WebAssembly.

## Features

| Feature                        | Status |
| ------------------------------ | ------ |
| Binary Protocol                | ✅     |
| Libsignal                      | ✅     |
| App State Sync                 | ✅     |
| Audio (waveform, duration)     | ✅     |
| Image (thumbnails, conversion) | ✅     |
| Sticker Metadata               | ✅     |

## Runtime Compatibility

- The default WebAssembly build uses SIMD instructions for maximum performance.
- When the host runtime rejects SIMD (e.g., older QEMU/KVM CPUs or restricted sandboxes), the loader automatically falls back to a compatibility build without SIMD.
- Force the compatibility module up-front by exporting `WHATSAPP_RUST_BRIDGE_FORCE_COMPAT=1`.
- To skip the fallback probe and insist on the SIMD build (only when the CPU/runtime truly supports it), set `WHATSAPP_RUST_BRIDGE_FORCE_SIMD=1`.

## Baileys Integration

- [#1698](https://github.com/WhiskeySockets/Baileys/pull/1698) - Binary Protocol
- [#2067](https://github.com/WhiskeySockets/Baileys/pull/2067) - Libsignal
