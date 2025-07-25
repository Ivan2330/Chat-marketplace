export default function StarFilledIcon({
  className = "",
  width = 20,
  height = 20,
  color = "#FFCB3D",
  style = {},
  ...props
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className={className}
      {...props}
    >
      <path
        d="M9.99994 14.3917L13.4583 16.4833C14.0916 16.8667 14.8666 16.3 14.6999 15.5833L13.7833 11.65L16.8416 9C17.3999 8.51666 17.0999 7.6 16.3666 7.54167L12.3416 7.2L10.7666 3.48333C10.4833 2.80833 9.51661 2.80833 9.23327 3.48333L7.65827 7.19166L3.63327 7.53333C2.89994 7.59166 2.59994 8.50833 3.15827 8.99166L6.21661 11.6417L5.29994 15.575C5.13327 16.2917 5.90827 16.8583 6.5416 16.475L9.99994 14.3917Z"
        fill={color}
      />
    </svg>
  );
}
