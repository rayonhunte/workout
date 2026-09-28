import { cloneElement, useId } from "react";
export function Field({ label, children, ...props }) {
  const id = useId();
  return (
    <label className="fit-field">
      <span id={id}>{label}</span>
      {children ? (
        cloneElement(children, { "aria-labelledby": id })
      ) : (
        <input aria-labelledby={id} {...props} />
      )}
    </label>
  );
}
export function NumberField({ label, value, onChange, ...props }) {
  return (
    <Field
      label={label}
      type="number"
      inputMode="decimal"
      min="0"
      step="any"
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : Number(e.target.value))
      }
      {...props}
    />
  );
}
export function Select({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => {
          const [value, text] = Array.isArray(option)
            ? option
            : [option, option];
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </Field>
  );
}
export function Panel({ title, children, className = "" }) {
  return (
    <section className={`fit-panel ${className}`}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
