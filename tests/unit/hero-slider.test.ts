import { describe, expect, it } from "vitest";
import { shouldAutoplayHero } from "@/components/home/hero-slider";

describe("hero slider autoplay", () => {
  it("keeps initial hero stable before visitor interaction", () => {
    expect(shouldAutoplayHero({ reducedMotion: false, hasInteracted: false })).toBe(false);
  });

  it("allows autoplay after visitor interaction when motion is allowed", () => {
    expect(shouldAutoplayHero({ reducedMotion: false, hasInteracted: true })).toBe(true);
  });

  it("keeps autoplay disabled when reduced motion is requested", () => {
    expect(shouldAutoplayHero({ reducedMotion: true, hasInteracted: true })).toBe(false);
  });
});
