'use client'

type RentivoLampBackdropProps = {
  activeScene?: number
  className?: string
}

export default function RentivoLampBackdrop({
  activeScene = 1,
  className = '',
}: RentivoLampBackdropProps) {
  return (
    <div
      className={`rentivo-lamp rentivo-lamp--scene-${activeScene} ${className}`.trim()}
      data-active-scene={activeScene}
      aria-hidden="true"
    >
      <div className="rentivo-lamp__aperture" />
      <div className="rentivo-lamp__beam rentivo-lamp__beam-left" />
      <div className="rentivo-lamp__beam rentivo-lamp__beam-right" />
      <div className="rentivo-lamp__glow" />
      <div className="rentivo-lamp__halo" />
      <div className="rentivo-lamp__horizon" />
      <div className="rentivo-lamp__sweep" />
      <div className="rentivo-lamp__mask" />
    </div>
  )
}
