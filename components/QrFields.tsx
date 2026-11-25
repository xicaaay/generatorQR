"use client";

import { useId, type ReactNode } from "react";
import type { QrFields, QrType, WifiEncryption } from "@/lib/payloads";
import { MAX_TEXT_LENGTH } from "@/lib/payloads";

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white aria-invalid:border-red-500";

interface FieldProps {
  label: string;
  hint?: string;
  children: (id: string, hintId?: string) => ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-neutral-600">
        {label}
      </label>
      {children(id, hintId)}
      {hint && (
        <p id={hintId} className="text-xs text-neutral-500 mt-1.5">
          {hint}
        </p>
      )}
    </div>
  );
}

interface QrFieldsProps<T extends QrType> {
  type: T;
  fields: QrFields[T];
  invalid: boolean;
  errorId: string;
  onChange: (fields: QrFields[T]) => void;
}

export default function QrFieldsForm<T extends QrType>(props: QrFieldsProps<T>) {
  const { invalid, errorId } = props;
  const a11y = {
    "aria-invalid": invalid,
    "aria-describedby": invalid ? errorId : undefined,
  };

  // Actualiza un campo del tipo activo.
  function set(key: string, value: string | boolean) {
    props.onChange({ ...props.fields, [key]: value } as QrFields[T]);
  }

  switch (props.type) {
    case "url": {
      const f = props.fields as QrFields["url"];
      return (
        <Field label="Enlace">
          {(id) => (
            <input
              id={id}
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://ejemplo.com"
              value={f.url}
              onChange={(e) => set("url", e.target.value)}
              className={inputClass}
              {...a11y}
            />
          )}
        </Field>
      );
    }

    case "whatsapp": {
      const f = props.fields as QrFields["whatsapp"];
      return (
        <div className="space-y-4">
          <Field label="Número con código de país">
            {(id, hintId) => (
              <input
                id={id}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="502 5555 1234"
                value={f.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inputClass}
                {...a11y}
                aria-describedby={[hintId, invalid ? errorId : ""].filter(Boolean).join(" ")}
              />
            )}
          </Field>
          <Field label="Mensaje (opcional)">
            {(id, hintId) => (
              <textarea
                id={id}
                rows={3}
                placeholder="Hola, quiero más información"
                value={f.message}
                onChange={(e) => set("message", e.target.value)}
                className={inputClass}
                aria-describedby={hintId}
              />
            )}
          </Field>
        </div>
      );
    }

    case "wifi": {
      const f = props.fields as QrFields["wifi"];
      return (
        <div className="space-y-4">
          <Field label="Nombre de la red">
            {(id) => (
              <input
                id={id}
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="MiRed"
                value={f.ssid}
                onChange={(e) => set("ssid", e.target.value)}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
          <Field label="Seguridad">
            {(id) => (
              <select
                id={id}
                value={f.encryption}
                onChange={(e) =>
                  set("encryption", e.target.value as WifiEncryption)
                }
                className={inputClass}
              >
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Sin contraseña</option>
              </select>
            )}
          </Field>
          {f.encryption !== "nopass" && (
            <Field label="Contraseña">
              {(id, hintId) => (
                <input
                  id={id}
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={f.password}
                  onChange={(e) => set("password", e.target.value)}
                  className={inputClass}
                  {...a11y}
                  aria-describedby={[hintId, invalid ? errorId : ""].filter(Boolean).join(" ")}
                />
              )}
            </Field>
          )}
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={f.hidden}
              onChange={(e) => set("hidden", e.target.checked)}
              className="size-4 accent-neutral-900"
            />
            Red oculta
          </label>
        </div>
      );
    }

    case "email": {
      const f = props.fields as QrFields["email"];
      return (
        <div className="space-y-4">
          <Field label="Para">
            {(id) => (
              <input
                id={id}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="hola@ejemplo.com"
                value={f.to}
                onChange={(e) => set("to", e.target.value)}
                className={inputClass}
                {...a11y}
              />
            )}
          </Field>
          <Field label="Asunto (opcional)">
            {(id) => (
              <input
                id={id}
                type="text"
                value={f.subject}
                onChange={(e) => set("subject", e.target.value)}
                className={inputClass}
              />
            )}
          </Field>
          <Field label="Mensaje (opcional)">
            {(id) => (
              <textarea
                id={id}
                rows={3}
                value={f.body}
                onChange={(e) => set("body", e.target.value)}
                className={inputClass}
              />
            )}
          </Field>
        </div>
      );
    }

    case "text": {
      const f = props.fields as QrFields["text"];
      return (
        <Field label="Texto" hint={`${f.text.length} / ${MAX_TEXT_LENGTH} caracteres`}>
          {(id, hintId) => (
            <textarea
              id={id}
              rows={4}
              maxLength={MAX_TEXT_LENGTH}
              placeholder="Escribe cualquier texto"
              value={f.text}
              onChange={(e) => set("text", e.target.value)}
              className={inputClass}
              {...a11y}
              aria-describedby={[hintId, invalid ? errorId : ""].filter(Boolean).join(" ")}
            />
          )}
        </Field>
      );
    }

    case "vcard": {
      const f = props.fields as QrFields["vcard"];
      const text = (
        key: keyof QrFields["vcard"],
        label: string,
        type = "text",
        autoComplete = "off",
      ) => (
        <Field label={label}>
          {(id) => (
            <input
              id={id}
              type={type}
              autoComplete={autoComplete}
              value={f[key]}
              onChange={(e) => set(key, e.target.value)}
              className={inputClass}
              {...(key === "firstName" || key === "email" || key === "website" ? a11y : {})}
            />
          )}
        </Field>
      );

      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {text("firstName", "Nombre", "text", "given-name")}
          {text("lastName", "Apellido", "text", "family-name")}
          {text("phone", "Teléfono", "tel", "tel")}
          {text("email", "Email", "email", "email")}
          {text("company", "Empresa", "text", "organization")}
          {text("website", "Sitio web", "url", "url")}
        </div>
      );
    }
  }
}
