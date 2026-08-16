export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className = "",
  as: Component = "label",
}) {
  return (
    <Component className={className}>
      <span className="label">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs font-medium text-rose-600">
          {error.message || error}
        </span>
      )}
      {hint && !error && (
        <span className="mt-1 block text-xs text-slate-400">{hint}</span>
      )}
    </Component>
  );
}
