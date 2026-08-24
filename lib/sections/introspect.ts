/**
 * ZOD → FORM DESCRIPTOR.
 *
 * The dashboard does not hand-write a form per section type. It walks the
 * section's zod schema and emits a plain, serialisable description of the
 * fields; a client component renders that description. Add a field to a schema
 * and the editor grows a control for it — there is no second place to update.
 *
 * The output is deliberately plain JSON so it can cross the server → client
 * boundary as props, which keeps zod itself out of the dashboard's client
 * bundle.
 *
 * Widget selection: an explicit `.describe()` hint wins (see WIDGET in
 * schemas.ts); otherwise the widget follows the zod type.
 */
import { z } from 'zod';

import { WIDGET } from './schemas';

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'html'
  | 'image'
  | 'href'
  | 'icon'
  | 'number'
  | 'boolean'
  | 'select'
  | 'stringList'
  | 'objectList';

export interface FieldDescriptor {
  /** Key within its parent object. */
  name: string;
  /** Sentence-case label derived from the key. */
  label: string;
  kind: FieldKind;
  required: boolean;
  /** select only. */
  options?: string[];
  /** objectList only — the shape of one row. */
  fields?: FieldDescriptor[];
  /** Value used when adding a new row to a list. */
  itemDefault?: unknown;
}

/** "primaryCtaText" → "Primary cta text"; "seoTitle" → "Seo title". */
function labelFor(name: string): string {
  const spaced = name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Strip Optional/Nullable/Default wrappers down to the underlying type. */
function unwrap(schema: z.ZodTypeAny): {
  inner: z.ZodTypeAny;
  optional: boolean;
  description?: string;
} {
  let inner = schema;
  let optional = false;
  // `.describe()` can sit on any layer of the wrapper stack; the outermost wins.
  let description: string | undefined = inner._def.description;

  // Guard against a pathological schema rather than looping forever.
  for (let i = 0; i < 10; i++) {
    const def = inner._def as { typeName?: string; innerType?: z.ZodTypeAny };

    if (
      def.typeName === z.ZodFirstPartyTypeKind.ZodOptional ||
      def.typeName === z.ZodFirstPartyTypeKind.ZodNullable ||
      def.typeName === z.ZodFirstPartyTypeKind.ZodDefault
    ) {
      optional = true;
      inner = def.innerType as z.ZodTypeAny;
      description = description ?? inner._def.description;
      continue;
    }
    break;
  }

  return { inner, optional, description };
}

const widgetKinds: Record<string, FieldKind> = {
  [WIDGET.html]: 'html',
  [WIDGET.image]: 'image',
  [WIDGET.textarea]: 'textarea',
  [WIDGET.href]: 'href',
  [WIDGET.icon]: 'icon',
};

function describeField(name: string, schema: z.ZodTypeAny): FieldDescriptor | null {
  const { inner, optional, description } = unwrap(schema);
  const def = inner._def as { typeName?: string; values?: string[]; type?: z.ZodTypeAny };
  const base = { name, label: labelFor(name), required: !optional };

  // An explicit widget hint overrides the type-derived control.
  if (description && widgetKinds[description]) {
    return { ...base, kind: widgetKinds[description] };
  }

  switch (def.typeName) {
    case z.ZodFirstPartyTypeKind.ZodString:
      return { ...base, kind: 'text' };

    case z.ZodFirstPartyTypeKind.ZodNumber:
      return { ...base, kind: 'number' };

    case z.ZodFirstPartyTypeKind.ZodBoolean:
      return { ...base, kind: 'boolean' };

    case z.ZodFirstPartyTypeKind.ZodEnum:
      return { ...base, kind: 'select', options: [...(def.values ?? [])] };

    case z.ZodFirstPartyTypeKind.ZodArray: {
      const element = def.type as z.ZodTypeAny;
      const { inner: elementInner } = unwrap(element);
      const elementDef = elementInner._def as { typeName?: string };

      if (elementDef.typeName === z.ZodFirstPartyTypeKind.ZodObject) {
        const fields = describeObject(elementInner as z.ZodObject<z.ZodRawShape>);
        return {
          ...base,
          kind: 'objectList',
          fields,
          itemDefault: Object.fromEntries(
            fields.map((f) => [f.name, emptyValue(f)]),
          ),
        };
      }

      if (elementDef.typeName === z.ZodFirstPartyTypeKind.ZodString) {
        return { ...base, kind: 'stringList', itemDefault: '' };
      }

      // Arrays of anything else have no editor; skip rather than render a
      // control that would write data the schema rejects.
      return null;
    }

    default:
      return null;
  }
}

/** Blank value for a newly added list row. */
function emptyValue(field: FieldDescriptor): unknown {
  switch (field.kind) {
    case 'boolean':
      return false;
    case 'number':
      return 0;
    case 'select':
      return field.options?.[0] ?? '';
    case 'objectList':
    case 'stringList':
      return [];
    default:
      return '';
  }
}

export function describeObject(schema: z.ZodObject<z.ZodRawShape>): FieldDescriptor[] {
  return Object.entries(schema.shape)
    .map(([name, field]) => describeField(name, field as z.ZodTypeAny))
    .filter((f): f is FieldDescriptor => f !== null);
}

/** The form description for a section type's schema. */
export function describeSectionSchema(schema: z.ZodTypeAny): FieldDescriptor[] {
  const { inner } = unwrap(schema);
  const def = inner._def as { typeName?: string };
  if (def.typeName !== z.ZodFirstPartyTypeKind.ZodObject) return [];
  return describeObject(inner as z.ZodObject<z.ZodRawShape>);
}
