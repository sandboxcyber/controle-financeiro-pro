type Props = {
  title: string;
  value: string;
  color: string;
};

export default function SummaryCard({
  title,
  value,
  color,
}: Props) {
  return (
    <div
      style={{
        background: "#1d1d1d",
        padding: 22,
        borderRadius: 16,
        borderLeft: `6px solid ${color}`,
      }}
    >
      <p
        style={{
          color: "#888",
          marginBottom: 8,
        }}
      >
        {title}
      </p>

      <h2
        style={{
          color: "#fff",
        }}
      >
        {value}
      </h2>
    </div>
  );
}