/// <reference types="node" />
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  FACES,
  SLOT,
  defaultLook,
  generateLook,
  hairSwatch,
  hexToRgb,
  resolveLook,
  skinSwatch,
  type Rgb,
  type TamerLook,
} from "@/game/appearance";
import {
  HD_H,
  HD_W,
  composeHD,
  decodeHDMask,
  type HDManifest,
  type HDPart,
  type HDPartData,
  type HDPartSource,
} from "@/game/tamerLookHDCore";
import { decodePng } from "../../scripts/tamer-art/png";

/**
 * The HD pipeline is the visual source of truth: real raw artwork per part,
 * masks that only mark where to recolor. These tests pin the emitted asset
 * set (public/tamers/hd) to the compositor contract — alignment, features,
 * luma-preserving recolors, intact outlines, layer ownership, determinism.
 */

const MANIFEST = JSON.parse(
  readFileSync(new URL("../../public/tamers/hd/manifest.json", import.meta.url), "utf8"),
) as HDManifest;

const decoded = new Map<string, HDPartData>();
function hdPartData(artPath: string): HDPartData | undefined {
  const hit = decoded.get(artPath);
  if (hit) return hit;
  const art = decodePng(new Uint8Array(readFileSync(new URL(`../../public/tamers/${artPath}`, import.meta.url))));
  const mask = decodePng(new Uint8Array(readFileSync(new URL(`../../public/tamers/${artPath.replace(/\.png$/, "_mask.png")}`, import.meta.url))));
  const data: HDPartData = {
    art: { w: art.w, h: art.h, rgba: new Uint8Array(art.rgba) },
    mask: decodeHDMask(mask.w, mask.h, mask.rgba),
  };
  decoded.set(artPath, data);
  return data;
}

const getPart: HDPartSource = (part: HDPart, faceId: string): HDPartData | null => {
  const artPath = part.variants ? part.variants[faceId]?.art : part.art;
  if (!artPath) return null;
  return hdPartData(artPath) ?? null;
};

const lumaOf = (c: Rgb): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

function compose(look: TamerLook) {
  return composeHD(look, MANIFEST, getPart);
}

describe("hd manifest", () => {
  it("pins the HD canvas geometry", () => {
    expect(MANIFEST.s).toBe(6);
    expect(MANIFEST.w).toBe(HD_W);
    expect(MANIFEST.h).toBe(HD_H);
  });

  it("every part's art and mask exist on disk at exactly the declared rect", () => {
    for (const [key, part] of Object.entries(MANIFEST.parts)) {
      if (part.variants) {
        expect(Object.keys(part.variants).length, key).toBeGreaterThanOrEqual(4);
        for (const [faceId, v] of Object.entries(part.variants)) {
          const d = hdPartData(v.art);
          expect(d, `${key}/${faceId} art ${v.art}`).toBeDefined();
          expect(d!.art.w, `${key}/${faceId}`).toBe(v.dw);
          expect(d!.art.h, `${key}/${faceId}`).toBe(v.dh);
          expect(d!.mask.w, `${key}/${faceId} mask`).toBe(v.dw);
          expect(d!.mask.h, `${key}/${faceId} mask`).toBe(v.dh);
        }
      } else {
        const d = hdPartData(part.art!);
        expect(d, `${key} art ${part.art}`).toBeDefined();
        expect(d!.art.w, key).toBe(part.rect!.dw);
        expect(d!.art.h, key).toBe(part.rect!.dh);
        expect(d!.mask.w, `${key} mask`).toBe(part.rect!.dw);
        expect(d!.mask.h, `${key} mask`).toBe(part.rect!.dh);
      }
      expect(part.layer, key).toBeGreaterThanOrEqual(0);
      expect(part.slots.length, key).toBeGreaterThan(0);
    }
  });

  it("face masks keep the authored features (eyes, brows, mouth) at HD", () => {
    for (const f of FACES) for (const e of ["neutral", "grin"] as const) {
      const part = MANIFEST.parts[`face.${f.id.replace("face.", "")}.${e}`];
      expect(part, `${f.id}.${e}`).toBeDefined();
      const d = hdPartData(part!.variants ? part!.variants[f.id.replace("face.", "")]!.art || "" : part!.art!);
      const count = (slot: number) => {
        let n = 0;
        for (let i = 0; i < d!.mask.slot.length; i++) if (d!.mask.slot[i] === slot && d!.art.rgba[i * 4 + 3] >= 128) n++;
        return n;
      };
      expect(count(SLOT.sclera), `${f.id}.${e} sclera`).toBeGreaterThan(200);
      expect(count(SLOT.iris), `${f.id}.${e} iris`).toBeGreaterThan(200);
      // stern's thin brows classify mostly as outline ink (rendered dark,
      // undriven) — the bar is "features exist", matching the legacy minimum
      expect(count(SLOT.brow), `${f.id}.${e} brow`).toBeGreaterThan(40);
      expect(count(SLOT.mouth), `${f.id}.${e} mouth`).toBeGreaterThan(60);
    }
  });
});

describe("hd composition", () => {
  it("composes every validation seed with every layer present and feet on the bottom row", () => {
    const seeds = [7, 91, 233, 512, 777, 1024, 1333, 1701, 1999, 2444, 2828, 3333];
    for (const s of seeds) {
      const look = resolveLook(generateLook(s)).look;
      const c = compose(look);
      expect(c.missing, `seed ${s}`).toEqual([]);
      expect(c.w).toBe(HD_W);
      expect(c.h).toBe(HD_H);
      const bottomRow = (HD_H - 1) * HD_W;
      expect(c.owner.slice(bottomRow).some((o) => o === look.body), `seed ${s} feet`).toBe(true);
      expect(c.owner.some((o) => o.startsWith("face.")), `seed ${s} face`).toBe(true);
      expect(c.owner.some((o) => o === `hair.${look.hair.replace("hair.", "")}.front`), `seed ${s} front hair`).toBe(true);
      // every owned pixel is opaque; every opaque pixel is owned
      let badAlpha = 0, orphan = 0, ghost = 0;
      for (let i = 0; i < c.owner.length; i++) {
        const a = c.rgba[i * 4 + 3];
        if (a !== 0 && a !== 255) badAlpha++;
        if (a === 255 && c.owner[i] === "") orphan++;
        if (a === 0 && c.owner[i] !== "") ghost++;
      }
      expect(badAlpha, `seed ${s} partial alpha`).toBe(0);
      expect(orphan, `seed ${s} opaque without owner`).toBe(0);
      expect(ghost, `seed ${s} owner without pixels`).toBe(0);
    }
  });

  it("is deterministic: identical look, identical bytes", () => {
    const look = resolveLook(generateLook(512)).look;
    const a = compose(look);
    const b = compose(look);
    expect(Buffer.from(a.rgba).equals(Buffer.from(b.rgba))).toBe(true);
    expect(a.owner).toEqual(b.owner);
  });

  it("hair recolor preserves the art's luminance ordering (correlation > 0.9)", () => {
    const look = resolveLook({ ...defaultLook(), body: "body.trailwarden", face: "face.keen", hair: "hair.tousled" }).look;
    const dark = compose({ ...look, hairColor: resolveLook({ ...look, hairColor: "black" }).look.hairColor });
    const light = compose({ ...look, hairColor: resolveLook({ ...look, hairColor: "golden" }).look.hairColor });
    const xs: number[] = [];
    const ys: number[] = [];
    const hairKey = "hair.tousled.front";
    for (let i = 0; i < dark.owner.length; i++) {
      if (dark.owner[i] !== hairKey || light.owner[i] !== hairKey) continue;
      xs.push(lumaOf([dark.rgba[i * 4], dark.rgba[i * 4 + 1], dark.rgba[i * 4 + 2]]));
      ys.push(lumaOf([light.rgba[i * 4], light.rgba[i * 4 + 1], light.rgba[i * 4 + 2]]));
    }
    expect(xs.length).toBeGreaterThan(5000);
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
    const my = ys.reduce((a, b) => a + b, 0) / ys.length;
    let cov = 0, vx = 0, vy = 0;
    for (let i = 0; i < xs.length; i++) {
      cov += (xs[i] - mx) * (ys[i] - my);
      vx += (xs[i] - mx) ** 2;
      vy += (ys[i] - my) ** 2;
    }
    expect(cov / Math.sqrt(vx * vy)).toBeGreaterThan(0.9);
  });

  it("outline and sclera pixels are identical across every palette (art passes through)", () => {
    const look = resolveLook({ ...defaultLook(), body: "body.trailwarden", face: "face.keen", hair: "hair.bob" }).look;
    const palettes: Partial<TamerLook>[] = [
      { skin: resolveLook({ ...look, skin: "porcelain" }).look.skin },
      { skin: resolveLook({ ...look, skin: "ebony" }).look.skin },
      { hairColor: resolveLook({ ...look, hairColor: "white" }).look.hairColor },
      { eyes: resolveLook({ ...look, eyes: "leaf" }).look.eyes },
    ];
    const base = compose(look);
    for (const patch of palettes) {
      const c = compose({ ...look, ...patch });
      for (let i = 0; i < base.owner.length; i++) {
        const key = base.owner[i];
        if (!key) continue;
        const part = MANIFEST.parts[key];
        if (!part) continue;
        const faceId = look.face.replace("face.", "");
        const m = part.variants ? part.variants[faceId] : part.rect;
        const d = part ? hdPartData(part.variants ? part.variants[faceId]!.art || part.art! : part.art!) : undefined;
        if (!m || !d) continue;
        const x = i % HD_W;
        const y = (i / HD_W) | 0;
        if (x < m.dx || x >= m.dx + m.dw || y < m.dy || y >= m.dy + m.dh) continue;
        const li = (y - m.dy) * m.dw + (x - m.dx);
        const slot = d.mask.slot[li];
        const driven = part.slots.find((s) => s.slot === slot);
        if (driven && driven.drive !== null) continue;
        expect([c.rgba[i * 4], c.rgba[i * 4 + 1], c.rgba[i * 4 + 2]], `${key} slot ${slot} at ${i}`).toEqual([
          base.rgba[i * 4],
          base.rgba[i * 4 + 1],
          base.rgba[i * 4 + 2],
        ]);
      }
    }
  });

  it("skin recolor hits the face's skin pixels with the target tone's luminance ratio", () => {
    const look = resolveLook({ ...defaultLook(), body: "body.trailwarden", face: "face.keen", hair: "hair.bob" }).look;
    const porcelain = skinSwatch(resolveLook({ ...look, skin: "porcelain" }).look.skin)!.hex;
    const c = compose({ ...look, skin: resolveLook({ ...look, skin: "porcelain" }).look.skin });
    const base = compose(look);
    const part = MANIFEST.parts[`face.${look.face.replace("face.", "")}.${look.expression}`];
    const faceId = look.face.replace("face.", "");
    const d = hdPartData(part!.variants ? part!.variants[faceId]!.art || part!.art! : part!.art!);
    const rect = part!.variants ? part!.variants[faceId] : part!.rect!;
    let checked = 0;
    let changed = 0;
    for (let y = 0; y < rect.dh; y++)
      for (let x = 0; x < rect.dw; x++) {
        const li = y * rect.dw + x;
        const gi = (rect.dy + y) * HD_W + rect.dx + x;
        if (base.owner[gi] !== `face.${faceId}.${look.expression}`) continue;
        if (d.mask.slot[li] !== SLOT.skin) continue;
        checked++;
        if (c.rgba[gi * 4] !== base.rgba[gi * 4] || c.rgba[gi * 4 + 1] !== base.rgba[gi * 4 + 1] || c.rgba[gi * 4 + 2] !== base.rgba[gi * 4 + 2]) changed++;
      }
    expect(checked).toBeGreaterThan(5000);
    expect(changed, "every visible skin pixel recolors").toBe(checked);
    // the porcelain recolor must actually move toward the target's luminance
    const t = lumaOf(hexToRgb(porcelain));
    let meanLuma = 0;
    for (let y = 0; y < rect.dh; y++)
      for (let x = 0; x < rect.dw; x++) {
        const li = y * rect.dw + x;
        const gi = (rect.dy + y) * HD_W + rect.dx + x;
        if (base.owner[gi] === `face.${faceId}.${look.expression}` && d.mask.slot[li] === SLOT.skin)
          meanLuma += lumaOf([c.rgba[gi * 4], c.rgba[gi * 4 + 1], c.rgba[gi * 4 + 2]]);
      }
    meanLuma /= checked;
    expect(Math.abs(meanLuma - t) / t, "skin luma tracks the target tone").toBeLessThan(0.2);
  });
});
