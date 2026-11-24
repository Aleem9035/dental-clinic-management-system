// variant: primary | secondary | danger, size: sm
export default function Button({ children, variant = 'primary', size, ...props }) {
  const classes = ['btn'];
  if (variant !== 'primary') classes.push(`btn-${variant}`);
  if (size === 'sm') classes.push('btn-sm');
  return (
    <button type="button" className={classes.join(' ')} {...props}>
      {children}
    </button>
  );
}