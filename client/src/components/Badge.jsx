// type: success | warning | danger | info
export default function Badge({ text, type }) {
  return <span className={type ? `badge badge-${type}` : 'badge'}>{text}</span>;
}