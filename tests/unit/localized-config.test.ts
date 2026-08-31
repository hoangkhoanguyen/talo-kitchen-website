/**
 * Unit tests for src/lib/localized-config.ts (pure helpers).
 * Run with: npx tsx --test tests/unit/localized-config.test.ts
 *
 * Covers: RULE-05, RULE-10, RULE-14, RULE-19, EC-01..EC-04, EC-06..EC-10, EC-12,
 * NFR-01 (no I/O, pure in-memory), NFR-05 (locale-agnostic — driven by routing.locales),
 * NFR-07 (robustness — no crash on malformed values).
 *
 * IMPORTANT (backward-compat / deploy requirement from the caller):
 * resolveFields/resolveConfig must treat an un-migrated STRING value at a
 * localized field as the default-locale ("en") value without crashing — this
 * is what allows deploying the code before running the DB migration.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isLocalizedField,
  normalizeLocalized,
  resolveLocalizedString,
  resolveFields,
  resolveConfig,
  migrateLocalized,
  migrateFields,
  migrateConfig,
} from "@/lib/localized-config";
import type { FieldType, MetaValue } from "@/types/settings";

// ---------- isLocalizedField (RULE-01) ----------

test("isLocalizedField: true only for text/textarea with localized:true", () => {
  assert.equal(
    isLocalizedField({ type: "text", localized: true } as FieldType),
    true,
  );
  assert.equal(
    isLocalizedField({ type: "textarea", localized: true } as FieldType),
    true,
  );
  assert.equal(
    isLocalizedField({ type: "text", localized: false } as FieldType),
    false,
  );
  assert.equal(isLocalizedField({ type: "text" } as FieldType), false);
  assert.equal(
    isLocalizedField({ type: "number" } as unknown as FieldType),
    false,
  );
});

// ---------- normalizeLocalized (EC-13 backward-compat) ----------

test("normalizeLocalized: string -> {en: value} (EC-13, un-migrated compat)", () => {
  assert.deepEqual(normalizeLocalized("hello"), { en: "hello" });
});

test("normalizeLocalized: null/undefined -> {} (EC-02, no crash)", () => {
  assert.deepEqual(normalizeLocalized(null), {});
  assert.deepEqual(normalizeLocalized(undefined), {});
});

test("normalizeLocalized: object -> kept as-is (EC-03 idempotent, EC-04 partial)", () => {
  assert.deepEqual(normalizeLocalized({ en: "a", vi: "b" }), {
    en: "a",
    vi: "b",
  });
  assert.deepEqual(normalizeLocalized({ en: "a" }), { en: "a" });
});

test("normalizeLocalized: array/number/boolean -> {} (NFR-07 defensive, no crash)", () => {
  assert.deepEqual(normalizeLocalized([1, 2]), {});
  assert.deepEqual(normalizeLocalized(42), {});
  assert.deepEqual(normalizeLocalized(true), {});
});

// ---------- resolveLocalizedString (RULE-05, EC-05, EC-06) ----------

test("resolveLocalizedString: vi present & non-empty -> vi (AC-03.1)", () => {
  assert.equal(
    resolveLocalizedString({ en: "Hello", vi: "Xin chao" }, "vi"),
    "Xin chao",
  );
});

test("resolveLocalizedString: vi empty -> fallback en (EC-05, AC-03.2)", () => {
  assert.equal(resolveLocalizedString({ en: "Hello", vi: "" }, "vi"), "Hello");
});

test("resolveLocalizedString: vi missing key -> fallback en", () => {
  assert.equal(resolveLocalizedString({ en: "Hello" }, "vi"), "Hello");
});

test("resolveLocalizedString: both en & vi empty -> '' (EC-06, no crash)", () => {
  assert.equal(resolveLocalizedString({ en: "", vi: "" }, "vi"), "");
});

test("resolveLocalizedString: at default locale (en) -> en value (AC-03.3)", () => {
  assert.equal(
    resolveLocalizedString({ en: "Hello", vi: "Xin chao" }, "en"),
    "Hello",
  );
});

test("resolveLocalizedString: BACKWARD-COMPAT — un-migrated plain string value treated as en/default, no crash (deploy-before-migrate requirement)", () => {
  assert.equal(resolveLocalizedString("Plain old string", "vi"), "Plain old string");
  assert.equal(resolveLocalizedString("Plain old string", "en"), "Plain old string");
});

test("resolveLocalizedString: null/undefined value -> '' (no crash)", () => {
  assert.equal(resolveLocalizedString(null, "vi"), "");
  assert.equal(resolveLocalizedString(undefined, "vi"), "");
});

// ---------- resolveFields / resolveConfig (RULE-10, EC-07/08/10/12) ----------

const reasonsField: FieldType = {
  key: "reasons",
  type: "array",
  label: "Reasons",
  description: "",
  isRequired: false,
  itemType: {
    type: "object",
    fields: [
      { key: "title", type: "text", label: "Title", description: "", isRequired: false, localized: true } as FieldType,
      { key: "desc", type: "textarea", label: "Desc", description: "", isRequired: false, localized: true } as FieldType,
      { key: "icon", type: "text", label: "Icon", description: "", isRequired: false } as FieldType, // non-localized
    ],
  },
  newItem: { title: "", desc: "", icon: "" },
} as FieldType;

const whyChooseUsFields: FieldType[] = [
  { key: "description", type: "textarea", label: "Description", description: "", isRequired: false, localized: true } as FieldType,
  reasonsField,
];

// title/sub_title array-of-{text} pattern — text is NOT marked localized (RULE-19/EC-10)
const titleArrayField: FieldType = {
  key: "title",
  type: "array",
  label: "Title",
  description: "",
  isRequired: false,
  itemType: {
    type: "object",
    fields: [
      { key: "text", type: "text", label: "Text", description: "", isRequired: false } as FieldType, // no localized flag
    ],
  },
  newItem: { text: "" },
} as FieldType;

test("resolveFields: nested array of objects resolved per-item (RULE-10, AC-03.5)", () => {
  const obj = {
    description: { en: "Why us EN", vi: "Vi sao chon chung toi VI" },
    reasons: [
      { title: { en: "Fast", vi: "" }, desc: { en: "Quick service", vi: "Dich vu nhanh" }, icon: "bolt" },
      { title: { en: "Cheap", vi: "Re" }, desc: { en: "Low price" }, icon: "coin" },
    ],
  };
  const resolvedVi = resolveFields(obj, whyChooseUsFields, "vi");
  assert.equal(resolvedVi.description, "Vi sao chon chung toi VI");
  assert.equal(resolvedVi.reasons[0].title, "Fast"); // vi empty -> fallback en (EC-05)
  assert.equal(resolvedVi.reasons[0].desc, "Dich vu nhanh");
  assert.equal(resolvedVi.reasons[1].title, "Re");
  assert.equal(resolvedVi.reasons[1].desc, "Low price"); // vi missing -> fallback en
  assert.equal(resolvedVi.reasons[0].icon, "bolt"); // non-localized untouched (AC-03.4)

  const resolvedEn = resolveFields(obj, whyChooseUsFields, "en");
  assert.equal(resolvedEn.description, "Why us EN");
  assert.equal(resolvedEn.reasons[0].title, "Fast");
});

test("resolveFields: empty array -> [] no crash (EC-07)", () => {
  const obj = { description: { en: "x", vi: "y" }, reasons: [] };
  const resolved = resolveFields(obj, whyChooseUsFields, "vi");
  assert.deepEqual(resolved.reasons, []);
});

test("resolveFields: array length differs from meta assumptions — walks actual items (EC-08)", () => {
  const obj = {
    description: { en: "x", vi: "y" },
    reasons: [
      { title: { en: "A" }, desc: { en: "B" }, icon: "i1" },
      { title: { en: "C" }, desc: { en: "D" }, icon: "i2" },
      { title: { en: "E" }, desc: { en: "F" }, icon: "i3" },
    ],
  };
  const resolved = resolveFields(obj, whyChooseUsFields, "vi");
  assert.equal(resolved.reasons.length, 3);
  assert.equal(resolved.reasons[2].title, "E");
});

test("resolveFields: title/sub_title array [{text}] NOT localized — kept as array untouched (RULE-19, EC-10)", () => {
  const obj = { title: [{ text: "A Love Letter To" }, { text: "Frech Gastronomy" }] };
  const resolved = resolveFields(obj, [titleArrayField], "vi");
  assert.deepEqual(resolved.title, [
    { text: "A Love Letter To" },
    { text: "Frech Gastronomy" },
  ]);
});

test("resolveConfig: missing section in value -> untouched/undefined, no crash (EC-12)", () => {
  const sections: MetaValue[] = [
    { key: "reviews", title: "Reviews", description: "", fields: whyChooseUsFields },
  ];
  const value = { our_story: { content: "kept" } }; // "reviews" section absent
  const resolved = resolveConfig(value as any, sections, "vi");
  assert.equal(resolved.reviews, undefined);
  assert.deepEqual(resolved.our_story, { content: "kept" });
});

test("resolveFields/resolveConfig: BACKWARD-COMPAT — un-migrated string value at a localized leaf resolves as default locale, no crash", () => {
  const obj = { description: "Plain un-migrated EN string", reasons: [] };
  const resolvedVi = resolveFields(obj, whyChooseUsFields, "vi");
  assert.equal(resolvedVi.description, "Plain un-migrated EN string");
  const resolvedEn = resolveFields(obj, whyChooseUsFields, "en");
  assert.equal(resolvedEn.description, "Plain un-migrated EN string");
});

// ---------- migrateLocalized / migrateFields / migrateConfig (RULE-14, EC-01..04, AC-04.*) ----------

test("migrateLocalized: string -> {en:s, vi:''} (EC-01)", () => {
  assert.deepEqual(migrateLocalized("abc"), { en: "abc", vi: "" });
});

test("migrateLocalized: null/undefined -> {en:'', vi:''} (EC-02)", () => {
  assert.deepEqual(migrateLocalized(null), { en: "", vi: "" });
  assert.deepEqual(migrateLocalized(undefined), { en: "", vi: "" });
});

test("migrateLocalized: already-migrated object -> unchanged (EC-03, idempotent, AC-04.2)", () => {
  const v = { en: "abc", vi: "xyz" };
  assert.deepEqual(migrateLocalized(v), { en: "abc", vi: "xyz" });
});

test("migrateLocalized: partial object missing vi -> fills vi:'' keeps en (EC-04)", () => {
  assert.deepEqual(migrateLocalized({ en: "abc" }), { en: "abc", vi: "" });
});

test("migrateFields: only touches localized leaves; non-localized/array-title untouched (RULE-15, RULE-19, AC-04.4)", () => {
  const obj = {
    description: "Why us EN",
    reasons: [{ title: "Fast", desc: "Quick", icon: "bolt" }],
  };
  const migrated = migrateFields(obj, whyChooseUsFields);
  assert.deepEqual(migrated.description, { en: "Why us EN", vi: "" });
  assert.deepEqual(migrated.reasons[0].title, { en: "Fast", vi: "" });
  assert.deepEqual(migrated.reasons[0].desc, { en: "Quick", vi: "" });
  assert.equal(migrated.reasons[0].icon, "bolt"); // untouched

  const titleObj = { title: [{ text: "A" }, { text: "B" }] };
  const migratedTitle = migrateFields(titleObj, [titleArrayField]);
  assert.deepEqual(migratedTitle.title, [{ text: "A" }, { text: "B" }]); // untouched, RULE-19
});

test("migrateFields: idempotent when run twice (AC-04.2)", () => {
  const obj = { description: "Why us EN", reasons: [] };
  const once = migrateFields(obj, whyChooseUsFields);
  const twice = migrateFields(once, whyChooseUsFields);
  assert.deepEqual(once, twice);
});

test("migrateConfig: only migrates existing sections, skips missing (EC-12-like safety)", () => {
  const sections: MetaValue[] = [
    { key: "why_choose_us", title: "Why", description: "", fields: whyChooseUsFields },
    { key: "not_present", title: "X", description: "", fields: [] },
  ];
  const value = { why_choose_us: { description: "EN text", reasons: [] } };
  const migrated = migrateConfig(value as any, sections);
  assert.deepEqual(migrated.why_choose_us.description, { en: "EN text", vi: "" });
  assert.equal(migrated.not_present, undefined);
});
